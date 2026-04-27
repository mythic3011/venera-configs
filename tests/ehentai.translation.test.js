const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadEhentai({ getImpl, locale = "en_US" } = {}) {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const wrapped = `${source}\nthis.__Ehentai__ = Ehentai;`;

  class ComicSource {
    loadSetting(key) {
      if (key === "domain") return "e-hentai.org";
      return null;
    }
    loadData() {
      return null;
    }
    saveData() {}
  }

  const context = {
    ComicSource,
    Network: {
      get: getImpl ?? (async () => ({ status: 500, body: "" })),
      post: async () => ({ status: 200, body: "{}" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
      sendRequest: async () => ({ status: 200, body: "" }),
    },
    APP: { locale },
    UI: { showMessage: () => {}, showDialog: () => {}, launchUrl: () => {} },
    HtmlDocument: class {},
    Cookie: class {
      constructor(v) {
        Object.assign(this, v);
      }
    },
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
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
  vm.runInContext(wrapped, context, { filename: "./ehentai.js" });
  return new context.__Ehentai__();
}

test("translate() falls back to built-in translations before CDN JSON finishes loading", () => {
  const eh = loadEhentai({
    getImpl: async () => new Promise(() => {}),
    locale: "zh_CN",
  });

  assert.equal(eh.translate("fight"), "战斗");
});

test("ensureRemoteTranslationLoaded() stores CDN JSON and translate() prefers it afterwards", async () => {
  const eh = loadEhentai({
    getImpl: async (url) => {
      assert.equal(
        url,
        "https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/i18n/ehentai.json",
      );
      return {
        status: 200,
        body: JSON.stringify({
          en_US: { fight: "Fight CDN" },
        }),
      };
    },
    locale: "en_US",
  });

  await eh.ensureRemoteTranslationLoaded();

  assert.equal(eh.translate("fight"), "Fight CDN");
});

test("ensureRemoteTranslationLoaded() falls back cleanly when CDN JSON fetch fails", async () => {
  const eh = loadEhentai({
    getImpl: async () => {
      throw new Error("network failed");
    },
    locale: "en_US",
  });

  const result = await eh.ensureRemoteTranslationLoaded();

  assert.equal(result, null);
  assert.equal(eh.translate("fight"), "Fight");
});
