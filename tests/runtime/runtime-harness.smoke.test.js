const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../../scripts/runtime/venera-host-shim");

const repoRoot = path.resolve(__dirname, "../..");
const manifestPath = path.join(repoRoot, ".generated", "build-manifest.json");

function loadPluginMetadata(artifactPath) {
  const source = fs.readFileSync(path.join(repoRoot, artifactPath), "utf8");
  const classFirstMatch = source.match(
    /^\s*class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource\b/,
  );
  assert.ok(classFirstMatch, `source must start with ComicSource class in ${artifactPath}`);

  const classMatch = source.match(/class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource/);
  assert.ok(classMatch, `source class missing in ${artifactPath}`);

  const className = classFirstMatch[1];
  const context = createVeneraHostShim();
  vm.runInContext(`${source}\nthis.__Ctor__=${className};`, context, {
    filename: artifactPath,
  });
  assert.ok(context.__Ctor__, `constructor unavailable for ${artifactPath}`);
  const instance = new context.__Ctor__();

  return {
    key: instance.key,
    name: instance.name,
    version: instance.version,
    minAppVersion: instance.minAppVersion,
  };
}

test("runtime harness loads every generated plugin artifact", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.ok(Array.isArray(manifest.plugins));
  assert.ok(manifest.plugins.length > 0);

  for (const plugin of manifest.plugins) {
    const metadata = loadPluginMetadata(plugin.outputPath);
    assert.equal(metadata.key, plugin.id, `${plugin.outputPath}: key mismatch`);
    assert.equal(String(metadata.version), String(plugin.version), `${plugin.outputPath}: version mismatch`);
    assert.equal(String(metadata.minAppVersion), String(plugin.minAppVersion), `${plugin.outputPath}: minAppVersion mismatch`);
  }
});
