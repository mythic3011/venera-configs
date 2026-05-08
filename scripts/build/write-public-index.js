#!/usr/bin/env node

const {
  BUILD_MANIFEST_PATH,
  PUBLIC_INDEX_PATH,
  readJson,
  writeJson,
} = require("./lib");

const CHECK_MODE = process.argv.includes("--check");

function buildIndex(manifest) {
  return manifest.plugins.map((plugin) => {
    const entry = {
      name: plugin.name,
      fileName: plugin.artifact,
      key: plugin.id,
      version: plugin.version,
      url: plugin.publicUrl,
    };
    if (plugin.description) {
      entry.description = plugin.description;
    }
    return entry;
  });
}

function main() {
  const manifest = readJson(BUILD_MANIFEST_PATH);
  const next = buildIndex(manifest);

  if (CHECK_MODE) {
    const current = readJson(PUBLIC_INDEX_PATH);
    if (JSON.stringify(current, null, 2) !== JSON.stringify(next, null, 2)) {
      throw new Error("index.json is out of date");
    }
    console.log("index.json is up to date");
    return;
  }

  writeJson(PUBLIC_INDEX_PATH, next);
  console.log("Updated index.json");
}

main();
