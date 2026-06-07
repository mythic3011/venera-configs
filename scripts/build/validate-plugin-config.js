#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { REPO_ROOT, loadPluginConfigs } = require("./lib");
const { resolveSupportSpecifierPath } = require("./support-boundaries");

function main() {
  const configs = loadPluginConfigs();
  if (configs.length === 0) {
    throw new Error(
      "No plugin configs found under plugins/*/plugin.config.json",
    );
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
        throw new Error(
          `Duplicate aliases in ${path.relative(REPO_ROOT, configPath)}`,
        );
      }
    }

    if (config.runtimeShared) {
      for (const supportPath of config.runtimeShared) {
        const fullPath = resolveSupportSpecifierPath(supportPath, configPath, {
          allowTesting: false,
        });
        if (!fs.existsSync(fullPath)) {
          throw new Error(
            `Missing runtimeShared helper ${supportPath} referenced by ${path.relative(REPO_ROOT, configPath)}`,
          );
        }
      }
    }

    if (
      config.deprecation &&
      (!config.aliases || config.aliases.length === 0)
    ) {
      throw new Error(
        `Deprecation declared without aliases in ${path.relative(REPO_ROOT, configPath)}`,
      );
    }
  }

  console.log(`Validated ${configs.length} plugin config(s)`);
}

main();
