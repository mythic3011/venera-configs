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

  const parts = plugin.source.moduleOrder.map((relativePath) => {
    const fullPath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing module ${relativePath} for ${plugin.id}`);
    }
    return fs.readFileSync(fullPath, "utf8").trimEnd();
  });

  const baseJoined = `${parts.join("\n\n")}\n`;
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
};
