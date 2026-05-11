#!/usr/bin/env node

const {
  BUILD_MANIFEST_PATH,
  readJson,
} = require("./lib");

const CHECK_MODE = process.argv.includes("--check");

function main() {
  const manifest = readJson(BUILD_MANIFEST_PATH);
  const next = Array.isArray(manifest.publicIndex) ? manifest.publicIndex : null;

  if (!next) {
    throw new Error("build-manifest publicIndex is missing");
  }

  if (CHECK_MODE) {
    console.log("build-manifest publicIndex is up to date");
    return;
  }

  console.log(
    "write-public-index is deprecated: index data is embedded in .generated/build-manifest.json#publicIndex",
  );
}

main();
