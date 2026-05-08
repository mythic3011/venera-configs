#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  REPO_ROOT,
  loadPluginConfigs,
  extractSourceMetadataFromFile,
  extractSourceMetadataFromCode,
} = require("./lib");
const { readConcatSourceFromModuleOrder } = require("./bundle-plugin");

function readSourceMetadata(config) {
  const runtimeSharedPaths = Array.isArray(config.runtimeShared)
    ? config.runtimeShared
    : [];

  if (config.source.type === "single") {
    const sourcePath = path.join(REPO_ROOT, config.source.entry);
    return extractSourceMetadataFromFile(sourcePath, { runtimeSharedPaths });
  }

  const joined = readConcatSourceFromModuleOrder(
    config.source.moduleOrder,
    config.id,
  );
  return extractSourceMetadataFromCode(joined, `${config.id}.concat.js`, {
    runtimeSharedPaths,
  });
}

function main() {
  const configs = loadPluginConfigs();
  if (configs.length === 0) {
    throw new Error("No plugin configs found under plugins/*/plugin.config.json");
  }

  const seenIds = new Map();
  const seenArtifacts = new Map();

  for (const item of configs) {
    const { config, configPath } = item;
    if (seenIds.has(config.id)) {
      throw new Error(
        `Duplicate plugin id: ${config.id} in ${path.relative(REPO_ROOT, configPath)} and ${path.relative(REPO_ROOT, seenIds.get(config.id))}`,
      );
    }
    if (seenArtifacts.has(config.artifact)) {
      throw new Error(
        `Duplicate artifact: ${config.artifact} in ${path.relative(REPO_ROOT, configPath)} and ${path.relative(REPO_ROOT, seenArtifacts.get(config.artifact))}`,
      );
    }
    seenIds.set(config.id, configPath);
    seenArtifacts.set(config.artifact, configPath);

    if (config.aliases) {
      const dedup = new Set(config.aliases);
      if (dedup.size !== config.aliases.length) {
        throw new Error(`Duplicate aliases in ${path.relative(REPO_ROOT, configPath)}`);
      }
    }

    const metadata = readSourceMetadata(config);
    if (String(metadata.key) !== String(config.id)) {
      throw new Error(
        `Config id mismatch in ${path.relative(REPO_ROOT, configPath)}: expected ${metadata.key}, got ${config.id}`,
      );
    }
    if (String(metadata.name) !== String(config.name)) {
      throw new Error(
        `Config name mismatch in ${path.relative(REPO_ROOT, configPath)}: expected ${metadata.name}, got ${config.name}`,
      );
    }
    if (String(metadata.version) !== String(config.version)) {
      throw new Error(
        `Config version mismatch in ${path.relative(REPO_ROOT, configPath)}: expected ${metadata.version}, got ${config.version}`,
      );
    }
    if (String(metadata.minAppVersion) !== String(config.minAppVersion)) {
      throw new Error(
        `Config minAppVersion mismatch in ${path.relative(REPO_ROOT, configPath)}: expected ${metadata.minAppVersion}, got ${config.minAppVersion}`,
      );
    }

    if (config.runtimeShared) {
      for (const sharedPath of config.runtimeShared) {
        const fullPath = path.join(REPO_ROOT, sharedPath);
        if (!fs.existsSync(fullPath)) {
          throw new Error(
            `Missing runtimeShared helper ${sharedPath} referenced by ${path.relative(REPO_ROOT, configPath)}`,
          );
        }
      }
    }

    if (config.deprecation && (!config.aliases || config.aliases.length === 0)) {
      throw new Error(
        `Deprecation declared without aliases in ${path.relative(REPO_ROOT, configPath)}`,
      );
    }
  }

  console.log(`Validated ${configs.length} plugin config(s)`);
}

main();
