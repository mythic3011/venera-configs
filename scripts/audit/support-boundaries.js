#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { REPO_ROOT, discoverPluginConfigFiles, readJson } = require("../build/lib");
const {
  validateSupportSpecifier,
  isPluginFile,
} = require("../build/support-boundaries");

const IMPORT_REGEX =
  /^\s*import(?:\s+([^'";]+?)\s+from\s+)?["']([^"']+)["']\s*;?\s*$/gm;
const DISALLOWED_DIR_NAMES = new Set(["utils", "helpers", "common", "misc"]);
const IGNORED_DIR_PREFIXES = [
  ".git",
  "node_modules",
  ".generated",
  "dist",
  ".claude",
];
const IGNORED_IMPORT_FIXTURES = new Set([
  "tests/fixtures/module_imports/plugin-shared-import.js",
  "tests/fixtures/module_imports/plugin-deep-support-import.js",
  "tests/fixtures/module_imports/plugin-testing-import.js",
]);

function shouldIgnoreDirectory(relativePath) {
  return IGNORED_DIR_PREFIXES.some(
    (prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`),
  );
}

function walk(currentPath, visitor) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(REPO_ROOT, fullPath).split(path.sep).join("/");
    if (entry.isDirectory()) {
      if (shouldIgnoreDirectory(relativePath)) {
        continue;
      }
      visitor(fullPath, relativePath, true);
      walk(fullPath, visitor);
      continue;
    }
    visitor(fullPath, relativePath, false);
  }
}

function auditDirectories(errors) {
  walk(REPO_ROOT, (fullPath, relativePath, isDirectory) => {
    if (!isDirectory) {
      return;
    }
    const baseName = path.basename(fullPath);
    if (baseName === "shared") {
      errors.push(`shared/ has been replaced by support/. (${relativePath})`);
    }
    if (DISALLOWED_DIR_NAMES.has(baseName)) {
      errors.push(
        `Avoid utils/helpers/common/misc directories; use responsibility-based support domains. (${relativePath})`,
      );
    }
  });
}

function auditImports(errors) {
  walk(REPO_ROOT, (fullPath, relativePath, isDirectory) => {
    if (isDirectory || !fullPath.endsWith(".js")) {
      return;
    }
    if (IGNORED_IMPORT_FIXTURES.has(relativePath)) {
      return;
    }
    const source = fs.readFileSync(fullPath, "utf8");
    let match;
    while ((match = IMPORT_REGEX.exec(source))) {
      const specifier = match[2];
      try {
        validateSupportSpecifier(specifier, fullPath, {
          allowTesting: !isPluginFile(fullPath),
        });
      } catch (error) {
        errors.push(String(error.message || error));
      }
    }
    IMPORT_REGEX.lastIndex = 0;
  });
}

function auditPluginConfigs(errors) {
  for (const configPath of discoverPluginConfigFiles()) {
    const config = readJson(configPath);
    if (!Array.isArray(config.runtimeShared)) {
      continue;
    }
    for (const specifier of config.runtimeShared) {
      try {
        validateSupportSpecifier(specifier, configPath, {
          allowTesting: false,
        });
      } catch (error) {
        errors.push(String(error.message || error));
      }
    }
  }
}

function main() {
  const errors = [];
  auditDirectories(errors);
  auditImports(errors);
  auditPluginConfigs(errors);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log("support boundary audit passed");
}

main();
