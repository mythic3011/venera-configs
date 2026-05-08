#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "../..");
const runtimeTestsDir = path.join(repoRoot, "tests", "runtime");

function parseArgs(argv) {
  const args = { plugin: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--plugin") {
      args.plugin = argv[i + 1] || null;
      i += 1;
    }
  }
  return args;
}

function collectTests(pluginId) {
  const all = fs
    .readdirSync(runtimeTestsDir)
    .filter((name) => name.endsWith(".test.js"))
    .sort();

  if (!pluginId) {
    return all;
  }

  const selected = ["runtime-harness.smoke.test.js"];
  const pluginFile = `${pluginId}.runtime.test.js`;
  if (all.includes(pluginFile)) {
    selected.push(pluginFile);
  }

  return selected;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = collectTests(args.plugin).map((name) => path.join("tests", "runtime", name));

  if (files.length === 0) {
    throw new Error("No runtime tests selected");
  }

  const result = spawnSync(process.execPath, ["--test", ...files], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  process.exit(result.status || 0);
}

main();
