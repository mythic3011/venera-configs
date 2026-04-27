const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadCtor(options = {}) {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  assert.equal(source.includes("import "), false);
  assert.equal(source.includes("export "), false);
  assert.equal(source.includes("require("), false);

  const dataStore = new Map();

  class ComicSource {
    loadSetting(key) {
      if (key === "domain") return "e-hentai.org";
      return null;
    }
    loadData(key) {
      return dataStore.has(key) ? dataStore.get(key) : null;
    }
    saveData(key, value) {
      dataStore.set(key, value);
    }
  }

  const network = options.network || {};
  const context = {
    ComicSource,
    Network: {
      get: network.get || (async () => ({ status: 200, body: "<html></html>" })),
      post: network.post || (async () => ({ status: 200, body: "{}" })),
      sendRequest: network.sendRequest || (async () => ({ status: 200, body: "" })),
      getCookies: network.getCookies || (async () => []),
      setCookies: network.setCookies || (() => {}),
      deleteCookies: network.deleteCookies || (() => {}),
    },
    UI: { showMessage: () => {}, showDialog: () => {}, launchUrl: () => {} },
    HtmlDocument: class {
      constructor() {}
      querySelector() {
        return null;
      }
      querySelectorAll() {
        return [];
      }
      getElementById() {
        return null;
      }
      dispose() {}
    },
    Cookie: class {
      constructor(v) {
        Object.assign(this, v);
      }
    },
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
    APP: { locale: "en_US" },
    URL,
    Map,
    Promise,
    RegExp,
    Date,
    JSON,
    setTimeout,
    clearTimeout,
    console,
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__Ehentai__ = Ehentai;`, context, {
    filename: "./ehentai.js",
  });
  return { Ctor: context.__Ehentai__, context, dataStore };
}

test("bundle avoids syntax unsupported by flutter_qjs", () => {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const forbidden = [
    [/\?\./, "optional chaining"],
    [/\?\?/, "nullish coalescing"],
    [/\.at\(/, "Array/String .at()"],
    [/\.replaceAll\(/, "String.replaceAll()"],
    [/\.matchAll\(/, "String.matchAll()"],
  ];

  for (const [pattern, label] of forbidden) {
    assert.equal(pattern.test(source), false, `${label} leaked into bundle`);
  }
});

test("bundle starts with source class for Venera parser detection", () => {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  assert.ok(
    source.startsWith("class Ehentai extends ComicSource"),
    "ehentai.js must start with the source class declaration",
  );
});

test("Ehentai initializes feature properties inside constructor after core state", () => {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const nameMatch = source.match(/this\.name\s*=\s*"ehentai"/);
  const cacheMatch = source.match(/this\.imageSessionCache\s*=/);
  const accountMatch = source.match(/this\.account\s*=/);
  const nameIndex = nameMatch ? nameMatch.index : -1;
  const cacheIndex = cacheMatch ? cacheMatch.index : -1;
  const accountIndex = accountMatch ? accountMatch.index : -1;

  assert.notEqual(nameIndex, -1);
  assert.notEqual(cacheIndex, -1);
  assert.notEqual(accountIndex, -1);
  assert.ok(nameIndex < accountIndex);
  assert.ok(cacheIndex < accountIndex);
});

test("bundle stays standalone and exposes Ehentai metadata", () => {
  const { Ctor } = loadCtor();
  const source = new Ctor();
  assert.equal(source.key, "ehentai");
  assert.ok(source.version);
});

test("captureAccountFromCookieJar can add account from forums-only cookies", async () => {
  const byUrl = new Map([
    ["https://forums.e-hentai.org", [
      { name: "ipb_member_id", value: "member_2" },
      { name: "ipb_pass_hash", value: "pass_2" },
      { name: "igneous", value: "igneous_2" },
      { name: "star", value: "star_2" },
    ]],
    ["https://e-hentai.org", []],
    ["https://exhentai.org", []],
  ]);
  const { Ctor } = loadCtor({
    network: {
      getCookies: async (url) => byUrl.get(String(url)) || [],
    },
  });
  const source = new Ctor();

  const id = await source.captureAccountFromCookieJar("Forums Login");
  const store = source.loadAccountStore();

  assert.ok(id);
  assert.equal(store.profiles.length, 1);
  assert.equal(store.profiles[0].values[0], "member_2");
  assert.equal(store.profiles[0].values[1], "pass_2");
});
