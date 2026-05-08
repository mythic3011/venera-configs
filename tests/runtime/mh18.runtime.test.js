const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../../scripts/runtime/venera-host-shim");

test("mh18 artifact boots under runtime shim", () => {
  const repoRoot = path.resolve(__dirname, "../..");
  const manifestPath = path.join(repoRoot, ".generated", "build-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const plugin = manifest.plugins.find((entry) => entry.id === "mh18");
  assert.ok(plugin, "mh18 is missing from build manifest");
  const source = fs.readFileSync(path.join(repoRoot, plugin.outputPath), "utf8");
  const context = createVeneraHostShim();
  vm.runInContext(`${source}\nthis.__Ctor__=MH18;`, context, { filename: plugin.outputPath });
  const instance = new context.__Ctor__();
  assert.equal(instance.key, "mh18");
  assert.equal(instance.version, "1.0.0");
});
