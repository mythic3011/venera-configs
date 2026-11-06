const { spawnSync } = require("node:child_process");
const { REPO_ROOT } = require("./lib");

function runNodeScript(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`Script failed: ${scriptPath}`);
}

module.exports = { runNodeScript };
