const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

test("concat pipeline resolves shared imports into standalone source", () => {
  const source = readConcatSourceFromModuleOrder(
    ["tests/fixtures/module_imports/entry.js"],
    "shared_import_fixture",
  );

  assert.equal(source.includes("import "), false);
  assert.equal(source.includes("export function"), false);
  assert.match(source, /function fixtureFormat\(value\)/);
  assert.match(source, /class SharedImportFixture extends ComicSource/);
  assert.match(source, /const fmt = fixtureFormat;/);

  const context = createVeneraHostShim();
  vm.runInContext(`${source}\nthis.__Ctor__=SharedImportFixture;`, context, {
    filename: path.join("tests", "fixtures", "module_imports", "entry.js"),
  });
  const instance = new context.__Ctor__();
  assert.equal(instance.key, "shared_import_fixture");
  assert.equal(instance.sample, "shared:ok");
});
