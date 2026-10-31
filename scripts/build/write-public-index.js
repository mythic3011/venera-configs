#!/usr/bin/env node
"use strict";

// Canonical Venera source catalog. No duplicated hand-maintained metadata.
// Input: .generated/build-manifest.json#publicIndex (from plugin configs).
// Output: index.json, a standalone Venera-compatible JSON array.
const fs = require("node:fs");
const path = require("node:path");
const { REPO_ROOT, BUILD_MANIFEST_PATH, readJson } = require("./lib");

const TARGET = path.join(REPO_ROOT, "index.json");

function buildPublicIndex(manifest) {
  if (!manifest || !Array.isArray(manifest.plugins) || !Array.isArray(manifest.publicIndex)) {
    throw new Error("Manifest must contain plugins and publicIndex arrays");
  }
  const known = new Map();
  for (const plugin of manifest.plugins) {
    if (!plugin || typeof plugin.id !== "string" || known.has(plugin.id)) {
      throw new Error("Missing or duplicate plugin identity in manifest");
    }
    known.set(plugin.id, plugin);
  }
  if (known.size !== manifest.publicIndex.length || known.size === 0) {
    throw new Error("Public index must match all canonical plugin configs");
  }
  const seen = new Set();
  for (const entry of manifest.publicIndex) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("Invalid public index entry");
    }
    const plugin = known.get(entry.key);
    if (!plugin || seen.has(entry.key)) throw new Error("Unknown/duplicate public index key");
    seen.add(entry.key);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(entry.key) ||
        typeof entry.name !== "string" || !entry.name.trim() ||
        !/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(entry.version) ||
        typeof entry.fileName !== "string" || !/^[A-Za-z0-9_-]+\.js$/.test(entry.fileName) ||
        typeof entry.url !== "string" || !entry.url.startsWith("https://") ||
        entry.fileName !== plugin.artifact ||
        entry.version !== plugin.version || entry.name !== plugin.name ||
        entry.url !== plugin.publicUrl) {
      throw new Error("Public index entry disagrees with canonical manifest: " + entry.key);
    }
  }
  return JSON.stringify(manifest.publicIndex, null, 2) + "\n";
}

function main() {
  const check = process.argv.includes("--check");
  const expected = buildPublicIndex(readJson(BUILD_MANIFEST_PATH));
  if (check) {
    if (!fs.existsSync(TARGET) || fs.readFileSync(TARGET, "utf8") !== expected) {
      throw new Error("index.json drift: run npm run build:index and commit it");
    }
    console.log("index.json is up to date");
    return;
  }
  fs.writeFileSync(TARGET, expected, "utf8");
  console.log("Wrote index.json from canonical publicIndex");
}

if (require.main === module) main();

module.exports = { buildPublicIndex };
