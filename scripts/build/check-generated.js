#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  REPO_ROOT,
  BUILD_MANIFEST_PATH,
  PUBLIC_INDEX_PATH,
  readJson,
  sha256Hex,
} = require("./lib");

const CI_MODE = process.argv.includes("--ci");

function runNodeScript(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Script failed: ${scriptPath}`);
  }
}

function checkArtifactHashes(manifest) {
  const errors = [];
  for (const plugin of manifest.plugins) {
    const outputPath = path.join(REPO_ROOT, plugin.outputPath);
    if (!fs.existsSync(outputPath)) {
      errors.push(`Missing generated artifact: ${plugin.outputPath}`);
      continue;
    }
    const content = fs.readFileSync(outputPath, "utf8");
    const actualSha = sha256Hex(content);
    const actualBytes = Buffer.byteLength(content, "utf8");
    if (plugin.checksums.sha256 && plugin.checksums.sha256 !== actualSha) {
      errors.push(`Hash mismatch for ${plugin.id}: expected ${plugin.checksums.sha256}, got ${actualSha}`);
    }
    if (plugin.checksums.bytes && plugin.checksums.bytes !== actualBytes) {
      errors.push(`Size mismatch for ${plugin.id}: expected ${plugin.checksums.bytes}, got ${actualBytes}`);
    }
  }
  return errors;
}

function checkClassFirstArtifacts(manifest) {
  const errors = [];
  const classFirstPattern =
    /^\s*class\s+[A-Za-z_$][A-Za-z0-9_$]*\s+extends\s+ComicSource\b/;

  for (const plugin of manifest.plugins) {
    const outputPath = path.join(REPO_ROOT, plugin.outputPath);
    if (!fs.existsSync(outputPath)) {
      errors.push(`Missing generated artifact: ${plugin.outputPath}`);
      continue;
    }
    const content = fs.readFileSync(outputPath, "utf8");
    if (!classFirstPattern.test(content)) {
      errors.push(
        `Class-first violation for ${plugin.id}: ${plugin.outputPath} must start with 'class <Source> extends ComicSource'`,
      );
    }
  }
  return errors;
}

function checkIndexMatchesManifest(manifest) {
  const current = readJson(PUBLIC_INDEX_PATH);
  const expected = manifest.plugins.map((plugin) => {
    const item = {
      name: plugin.name,
      fileName: plugin.artifact,
      key: plugin.id,
      version: plugin.version,
      url: plugin.publicUrl,
    };
    if (plugin.description) {
      item.description = plugin.description;
    }
    return item;
  });

  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    return ["index.json does not match build manifest"];
  }

  return [];
}

function main() {
  runNodeScript(path.join("scripts", "build", "validate-plugin-config.js"));
  runNodeScript(path.join("scripts", "build", "write-build-manifest.js"), ["--check"]);

  const manifest = readJson(BUILD_MANIFEST_PATH);

  const errors = [
    ...checkArtifactHashes(manifest),
    ...checkClassFirstArtifacts(manifest),
    ...checkIndexMatchesManifest(manifest),
  ];

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(CI_MODE ? "generated artifacts verified for CI" : "generated artifacts verified");
}

main();
