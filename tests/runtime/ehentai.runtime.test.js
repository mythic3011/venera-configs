const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../../scripts/runtime/venera-host-shim");

function loadEhentai() {
  const repoRoot = path.resolve(__dirname, "../..");
  const manifestPath = path.join(repoRoot, ".generated", "build-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const plugin = manifest.plugins.find((entry) => entry.id === "ehentai");
  assert.ok(plugin, "ehentai is missing from build manifest");
  const source = fs.readFileSync(path.join(repoRoot, plugin.outputPath), "utf8");
  const context = createVeneraHostShim();
  vm.runInContext(`${source}\nthis.__Ctor__=Ehentai;`, context, { filename: plugin.outputPath });
  return new context.__Ctor__();
}

test("ehentai artifact boots under runtime shim", () => {
  const source = loadEhentai();
  assert.equal(source.key, "ehentai");
  assert.equal(source.version, "1.2.0");
  const parsed = source.parseUrl("https://e-hentai.org/g/123/abc/");
  assert.equal(parsed.id, "123");
  assert.equal(parsed.token, "abc");
});
