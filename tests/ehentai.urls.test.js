const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadModules() {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const context = {
    ComicSource: class {},
    Network: {
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "{}" }),
      sendRequest: async () => ({ status: 200, body: "" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
    },
    HtmlDocument: class {},
    UI: { showMessage: () => {}, showDialog: () => {}, launchUrl: () => {} },
    Cookie: class {},
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
  vm.runInContext(`${source}\nthis.__mods__ = EhentaiModules;`, context, {
    filename: "./ehentai.js",
  });
  return context.__mods__;
}

test("url helpers build and parse gallery URLs", () => {
  const m = loadModules();
  assert.equal(m.buildBaseUrl("e-hentai.org"), "https://e-hentai.org");
  assert.equal(
    m.buildApiUrl("https://e-hentai.org"),
    "https://api.e-hentai.org/api.php",
  );
  assert.equal(m.buildApiUrl("https://exhentai.org"), "https://exhentai.org/api.php");
  assert.equal(
    JSON.stringify(m.parseGalleryUrl("https://e-hentai.org/g/123/abc/")),
    JSON.stringify({ id: "123", token: "abc" }),
  );
  assert.equal(
    m.buildFavoritesUrl("https://e-hentai.org", "-1"),
    "https://e-hentai.org/favorites.php",
  );
  assert.equal(
    m.buildFavoritesUrl("https://e-hentai.org", "2"),
    "https://e-hentai.org/favorites.php?favcat=2",
  );
});
