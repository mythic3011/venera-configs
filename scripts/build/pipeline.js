#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { REPO_ROOT } = require("./lib");

const VALIDATION = [
  ["Check release authority", "scripts/build/validate-release-authority.js"],
  ["Check plugin support boundaries", "scripts/audit/support-boundaries.js"],
];
const BUILD = [
  ...VALIDATION,
  ["Generate plugin artifacts", "scripts/build/generate.js"],
  ["Check generated artifacts", "scripts/build/check-generated.js"],
];
const TEST = [
  ["Run tests", null, ["--test"]],
  ["Run runtime tests", "scripts/runtime/run-runtime-tests.js"],
  ["Check unsafe runtime code", "scripts/audit/unsafe-runtime-code.js"],
];
const VERIFY = [
  ...BUILD,
  ["Check public index", "scripts/sync-index.js", ["--check"]],
  ...TEST,
];
const PIPELINES = {
  validate: [...VALIDATION, ["Check plugin configuration", "scripts/build/validate-plugin-config.js"]],
  build: BUILD,
  test: TEST,
  verify: VERIFY,
  ci: VERIFY,
};

function runStep([label, script, extraArgs = []]) {
  const args = script ? [script, ...extraArgs] : extraArgs;
  process.stdout.write(`\n==> ${label}\n`);
  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed${result.signal ? ` (${result.signal})` : ` (exit ${result.status})`}`);
  }
}

function runPipeline(pipelineName, executeStep = runStep) {
  const steps = PIPELINES[pipelineName];
  if (!steps) {
    throw new Error(
      `Usage: node scripts/build/pipeline.js <validate|build|test|verify|ci>; got ${pipelineName || "<missing>"}`,
    );
  }
  process.stdout.write(`Pipeline: ${pipelineName}\n`);
  for (const step of steps) executeStep(step);
}

if (require.main === module) {
  try {
    runPipeline(process.argv[2]);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { runPipeline };
