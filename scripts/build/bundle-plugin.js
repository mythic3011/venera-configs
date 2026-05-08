const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const { REPO_ROOT } = require("./lib");
const RUNTIME_RELEASE_AUTHORITY_PATH = path.join(
  REPO_ROOT,
  "shared",
  "runtime",
  "release-authority.js",
);

function resolveModuleImport(fromFilePath, specifier, pluginId) {
  if (typeof specifier !== "string" || specifier.trim() === "") {
    throw new Error(`Invalid import specifier in ${pluginId}: ${fromFilePath}`);
  }
  const trimmed = specifier.trim();
  let resolved = null;

  if (trimmed.startsWith("shared/")) {
    resolved = path.join(REPO_ROOT, trimmed);
  } else if (trimmed.startsWith("./") || trimmed.startsWith("../")) {
    resolved = path.resolve(path.dirname(fromFilePath), trimmed);
  } else {
    throw new Error(
      `Unsupported import "${specifier}" in ${path.relative(REPO_ROOT, fromFilePath)} (${pluginId}). Only relative paths or shared/* are allowed.`,
    );
  }

  if (!resolved.startsWith(REPO_ROOT)) {
    throw new Error(
      `Import escapes repository root in ${path.relative(REPO_ROOT, fromFilePath)}: ${specifier}`,
    );
  }
  if (!resolved.endsWith(".js")) {
    throw new Error(
      `Import must target a .js file in ${path.relative(REPO_ROOT, fromFilePath)}: ${specifier}`,
    );
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Missing import target ${specifier} from ${path.relative(REPO_ROOT, fromFilePath)}`,
    );
  }
  return resolved;
}

function parseNamedImports(importClause, sourcePath) {
  const clause = String(importClause || "").trim();
  if (clause === "") {
    return [];
  }
  if (!clause.startsWith("{") || !clause.endsWith("}")) {
    throw new Error(
      `Unsupported import clause "${clause}" in ${path.relative(REPO_ROOT, sourcePath)}. Use named imports or side-effect imports only.`,
    );
  }

  const inner = clause.slice(1, -1).trim();
  if (!inner) {
    return [];
  }

  return inner
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const asParts = token.split(/\s+as\s+/);
      if (asParts.length === 1) {
        return { imported: asParts[0], local: asParts[0] };
      }
      if (asParts.length === 2) {
        return { imported: asParts[0].trim(), local: asParts[1].trim() };
      }
      throw new Error(
        `Invalid named import token "${token}" in ${path.relative(REPO_ROOT, sourcePath)}`,
      );
    });
}

function collectModuleAndImports(filePath, pluginId) {
  const source = fs.readFileSync(filePath, "utf8").trimEnd();
  const imports = [];
  const aliasPairs = [];
  const importRegex =
    /^\s*import(?:\s+([^'";]+?)\s+from\s+)?["']([^"']+)["']\s*;?\s*$/gm;

  const strippedSource = source.replace(importRegex, (_, importClause, specifier) => {
    const resolved = resolveModuleImport(filePath, specifier, pluginId);
    imports.push(resolved);
    const named = parseNamedImports(importClause, filePath);
    for (const pair of named) {
      aliasPairs.push(pair);
    }
    return "";
  });

  const normalized = strippedSource
    // Keep module code executable in script mode after inlining.
    .replace(/^\s*export\s+(?=(function|class|const|let|var)\b)/gm, "")
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "")
    .trimEnd();

  return {
    code: normalized,
    imports,
    aliasPairs,
  };
}

function readConcatSourceFromModuleOrder(moduleOrder, pluginId) {
  const appendedByPath = new Set();
  const appendedModules = [];
  const aliasPairs = [];

  function visit(filePath, isEntry) {
    const normalizedPath = path.resolve(filePath);
    if (appendedByPath.has(normalizedPath)) {
      return;
    }

    const { code, imports, aliasPairs: localAliases } = collectModuleAndImports(
      normalizedPath,
      pluginId,
    );

    // Keep configured entry modules first to preserve parser expectations.
    if (isEntry) {
      appendedModules.push(code);
      appendedByPath.add(normalizedPath);
      for (const importedPath of imports) {
        visit(importedPath, false);
      }
      for (const pair of localAliases) {
        aliasPairs.push(pair);
      }
      return;
    }

    for (const importedPath of imports) {
      visit(importedPath, false);
    }
    appendedModules.push(code);
    appendedByPath.add(normalizedPath);
    for (const pair of localAliases) {
      aliasPairs.push(pair);
    }
  }

  for (const relativePath of moduleOrder) {
    const fullPath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing module ${relativePath} for ${pluginId}`);
    }
    visit(fullPath, true);
  }

  const aliasLines = aliasPairs
    .filter((pair) => pair.imported && pair.local && pair.imported !== pair.local)
    .map((pair) => `const ${pair.local} = ${pair.imported};`);

  return `${[...appendedModules, ...aliasLines].filter(Boolean).join("\n\n")}\n`;
}

async function bundlePlugin(plugin) {
  const injectRuntimeReleaseAuthority =
    !plugin.pipeline || plugin.pipeline.injectRuntimeReleaseAuthority !== false;
  const runtimeReleaseAuthorityCode = injectRuntimeReleaseAuthority
    ? fs.readFileSync(RUNTIME_RELEASE_AUTHORITY_PATH, "utf8").trimEnd()
    : "";
  const runtimeSharedFiles = Array.isArray(plugin.runtimeShared)
    ? plugin.runtimeShared.slice()
    : [];
  const runtimeSharedCode = runtimeSharedFiles
    .map((relativePath) => {
      const fullPath = path.join(REPO_ROOT, relativePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Missing runtime shared helper ${relativePath} for ${plugin.id}`);
      }
      return fs.readFileSync(fullPath, "utf8").trimEnd();
    })
    .join("\n\n");
  const runtimePreludeCode = [runtimeSharedCode, runtimeReleaseAuthorityCode]
    .filter((part) => part && part.trim() !== "")
    .join("\n\n");

  if (plugin.source.type === "single") {
    const sourcePath = path.join(REPO_ROOT, plugin.source.entry);
    const sourceCode = fs.readFileSync(sourcePath, "utf8").trimEnd();
    const finalCode = runtimePreludeCode
      ? `${sourceCode}\n\n${runtimePreludeCode}\n`
      : `${sourceCode}\n`;
    return {
      stage: "single",
      code: finalCode,
    };
  }

  const baseJoined = readConcatSourceFromModuleOrder(
    plugin.source.moduleOrder,
    plugin.id,
  );
  const joined = runtimePreludeCode
    ? `${baseJoined}\n${runtimePreludeCode}\n`
    : baseJoined;

  // Compile-time syntax validation in esbuild for deterministic bundling path.
  await esbuild.transform(joined, {
    loader: "js",
    target: "es2018",
    format: "iife",
    minify: false,
    sourcemap: false,
  });

  return {
    stage: "concat",
    code: joined,
  };
}

module.exports = {
  bundlePlugin,
  readConcatSourceFromModuleOrder,
};
