const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

test("concat pipeline resolves support imports into standalone source", () => {
  const source = readConcatSourceFromModuleOrder(
    ["tests/fixtures/module_imports/entry.js"],
    "support_import_fixture",
    { allowTesting: true },
  );

  assert.equal(source.includes("import "), false);
  assert.equal(source.includes("export "), false);
  assert.match(source, /function fixtureFormat\(value\)/);
  assert.match(source, /class SupportImportFixture extends ComicSource/);
  assert.match(source, /const fmt = fixtureFormat;/);

  const context = createVeneraHostShim();
  vm.runInContext(`${source}\nthis.__Ctor__=SupportImportFixture;`, context, {
    filename: path.join("tests", "fixtures", "module_imports", "entry.js"),
  });
  const instance = new context.__Ctor__();
  assert.equal(instance.key, "support_import_fixture");
  assert.equal(instance.sample, "shared:ok");
});

test("plugin imports from shared fail clearly", () => {
  assert.throws(
    () =>
      readConcatSourceFromModuleOrder(
        ["tests/fixtures/module_imports/plugin-shared-import.js"],
        "bad_shared_import",
      ),
    /shared\/ has been replaced by support\//,
  );
});

test("plugin deep imports into support fail clearly", () => {
  assert.throws(
    () =>
      readConcatSourceFromModuleOrder(
        ["tests/fixtures/module_imports/plugin-deep-support-import.js"],
        "bad_deep_support_import",
      ),
    /Use support\/<domain>\/index\.js instead of deep support imports\./,
  );
});

test("plugin imports from support testing fail clearly", () => {
  assert.throws(
    () =>
      readConcatSourceFromModuleOrder(
        ["tests/fixtures/module_imports/plugin-testing-import.js"],
        "bad_testing_import",
      ),
    /support\/testing is test-only and must not be imported by plugin source\./,
  );
});

test("runtimeShared validation rejects deep support paths", async () => {
  const tempDir = path.join(process.cwd(), "tests", "fixtures", "tmp-support-boundary");
  fs.mkdirSync(tempDir, { recursive: true });
  const configPath = path.join(tempDir, "plugin.config.json");
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      id: "tmp",
      artifact: "tmp.js",
      name: "tmp",
      version: "1.0.0",
      minAppVersion: "1.0.0",
      source: { type: "single", entry: "plugins/comick/src/index.js" },
      runtimeShared: ["support/http/request-client.js"],
    }),
  );
  const { validateSupportSpecifier } = require("../scripts/build/support-boundaries");
  assert.throws(
    () =>
      validateSupportSpecifier("support/http/request-client.js", configPath, {
        allowTesting: false,
      }),
    /Use support\/<domain>\/index\.js instead of deep support imports\./,
  );
  fs.rmSync(tempDir, { recursive: true, force: true });
});
