const test = require("node:test");
const assert = require("node:assert/strict");
const { runPipeline } = require("../scripts/build/pipeline");

test("verify and CI run the explicit build, index, and test sequence", () => {
  for (const name of ["verify", "ci"]) {
    const steps = [];
    runPipeline(name, (step) => steps.push(step[0]));
    assert.deepEqual(steps, [
      "Check release authority",
      "Check plugin support boundaries",
      "Generate plugin artifacts",
      "Check generated artifacts",
      "Check public index",
      "Run tests",
      "Run runtime tests",
      "Check unsafe runtime code",
    ]);
  }
});

test("pipeline stops immediately when a stage fails", () => {
  const steps = [];
  assert.throws(() => runPipeline("build", (step) => {
    steps.push(step[0]);
    throw new Error("failed as requested");
  }), /failed as requested/);
  assert.deepEqual(steps, ["Check release authority"]);
});

test("unknown pipeline names fail with the supported stage list", () => {
  assert.throws(() => runPipeline("missing", () => {}), /validate\|build\|test\|verify\|ci/);
});
