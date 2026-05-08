#!/usr/bin/env node

const path = require("node:path");
const { REPO_ROOT, loadPluginConfigs } = require("./lib");

function main() {
  const plugins = loadPluginConfigs()
    .map((item) => ({
      id: item.config.id,
      artifact: item.config.artifact,
      sourceType: item.config.source.type,
      configPath: path.relative(REPO_ROOT, item.configPath),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log(JSON.stringify(plugins, null, 2));
}

main();
