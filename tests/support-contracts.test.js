const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const babel = require("@babel/core");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");

test("shared facade CommonJS and named exports expose the same contract", () => {
  for (const file of [
    "support/http/index.js", "support/parser/index.js", "support/security/index.js",
    "support/plugin/source-contract.js", "support/plugin/feature-contracts.js",
  ]) {
    const ast = babel.parseSync(fs.readFileSync(file, "utf8"), {
      babelrc: false, configFile: false, sourceType: "module",
    });
    const named = ast.program.body
      .filter((node) => node.type === "ExportNamedDeclaration")
      .flatMap((node) => node.specifiers.map((specifier) => specifier.exported.name));
    const context = vm.createContext({ module: { exports: {} } });
    vm.runInContext(readConcatSourceFromModuleOrder([file], "contract", {
      entryMode: "imports-first",
    }), context);
    assert.deepEqual(Object.keys(context.module.exports).sort(), named.sort(), file);
  }
});

test("raw query encoding retains pre-encoded values and false/zero parameters", () => {
  const context = vm.createContext({});
  vm.runInContext(readConcatSourceFromModuleOrder(["support/http/query.js"], "query"), context);
  assert.equal(context.joinRawQueryEntries([
    ["q", "a%20b"], ["offset", 0], ["enabled", false], ["empty", ""],
    ["skip", null], [null, "skip"], [], "skip",
  ]), "q=a%20b&offset=0&enabled=false&empty=");
});
