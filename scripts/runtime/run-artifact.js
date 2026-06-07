#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("./venera-host-shim");

const REPO_ROOT = path.resolve(__dirname, "../..");
const BUILD_MANIFEST_PATH = path.join(
  REPO_ROOT,
  ".generated",
  "build-manifest.json",
);

function parseArgs(argv) {
  const args = {
    file: null,
    plugin: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--file") {
      args.file = argv[i + 1] || null;
      i += 1;
    } else if (token === "--plugin") {
      args.plugin = argv[i + 1] || null;
      i += 1;
    }
  }
  if (!args.file && !args.plugin) {
    throw new Error(
      "Usage: node scripts/runtime/run-artifact.js (--plugin <plugin-id> | --file <artifact.js>)",
    );
  }
  return args;
}

function loadBuildManifest() {
  return JSON.parse(fs.readFileSync(BUILD_MANIFEST_PATH, "utf8"));
}

function resolveArtifactPath(args) {
  const manifest = loadBuildManifest();
  const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

  if (args.plugin) {
    const plugin = plugins.find((entry) => entry.id === args.plugin);
    if (!plugin) {
      throw new Error(`Unknown plugin id: ${args.plugin}`);
    }
    return plugin.outputPath;
  }

  if (args.file) {
    const byOutput = plugins.find((entry) => entry.outputPath === args.file);
    if (byOutput) {
      return byOutput.outputPath;
    }
    const byArtifact = plugins.find((entry) => entry.artifact === args.file);
    if (byArtifact) {
      return byArtifact.outputPath;
    }
  }

  return args.file;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadBuildManifest();
  const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];
  const artifactRelativePath = resolveArtifactPath(args);
  const artifactPath = path.join(REPO_ROOT, artifactRelativePath);
  const plugin = plugins.find(
    (entry) =>
      entry.outputPath === artifactRelativePath ||
      entry.artifact === artifactRelativePath,
  );
  const source = fs.readFileSync(artifactPath, "utf8");
  const classMatch = source.match(
    /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource/,
  );
  if (!classMatch) {
    throw new Error(`Cannot find source class in ${artifactRelativePath}`);
  }

  const className = classMatch[1];
  const allowedOrigins =
    plugin && Array.isArray(plugin.allowedOrigins) ? plugin.allowedOrigins : [];
  const allowedUrls =
    plugin && Array.isArray(plugin.allowedUrls) ? plugin.allowedUrls : [];
  const context = createVeneraHostShim({ allowedOrigins, allowedUrls });
  vm.runInContext(`${source}\nthis.__Ctor__=${className};`, context, {
    filename: artifactRelativePath,
  });

  if (!context.__Ctor__) {
    throw new Error(`Failed to load source class from ${artifactRelativePath}`);
  }

  const instance = new context.__Ctor__();
  const result = {
    className,
    outputPath: artifactRelativePath,
    key: instance.key,
    name: instance.name,
    version: instance.version,
    minAppVersion: instance.minAppVersion || null,
    allowedOrigins,
    allowedUrls,
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
