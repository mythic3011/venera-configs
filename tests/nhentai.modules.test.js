const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadNhentaiModules() {
  const pluginConfig = JSON.parse(
    fs.readFileSync("./plugins/nhentai/plugin.config.json", "utf8"),
  );
  const source = pluginConfig.source.moduleOrder
    .map((filePath) => fs.readFileSync(filePath, "utf8"))
    .join("\n\n");

  class Comic {
    constructor(value) {
      Object.assign(this, value);
    }
  }

  class ComicDetails {
    constructor(value) {
      Object.assign(this, value);
    }
  }

  class Comment {
    constructor(value) {
      Object.assign(this, value);
    }
  }

  const context = {
    ComicSource: class {},
    Comic,
    ComicDetails,
    Comment,
    Network: {
      deleteCookies: () => {},
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "" }),
      request: async () => ({ status: 200, body: "" }),
      delete: async () => ({ status: 200, body: "" }),
    },
    HtmlDocument: class {},
    resolvePluginUpdateUrl: (artifact) => `https://updates.example/${artifact}`,
    Map,
    Set,
    Promise,
    RegExp,
    Date,
    JSON,
    console,
  };

  vm.createContext(context);
  vm.runInContext(
    `${source}
this.__mods__ = {
  Nhentai,
  NHENTAI_TRANSLATIONS,
  NHENTAI_TAG_CATALOG,
  NHENTAI_TAG_VALUES,
  normalizeNhentaiComicId,
  buildNhentaiCategoryUrl,
  buildNhentaiSearchUrl,
  wrapNhentaiMediaRequest,
  toNhentaiAbsoluteMediaUrl,
  buildNhentaiApiImages,
  parseNhentaiLinkToId,
  collectNhentaiTagNames,
};`,
    context,
    { filename: "./plugins/nhentai/src/index.js" },
  );

  return context.__mods__;
}

test("nhentai modules preserve route media and catalog behavior after split", () => {
  const m = loadNhentaiModules();
  const source = new m.Nhentai();

  assert.equal(source.translation.zh_TW.Tags, "標籤");
  assert.equal(m.normalizeNhentaiComicId("nhentai123"), "123");
  assert.equal(m.normalizeNhentaiComicId("nh456"), "456");
  assert.equal(
    m.parseNhentaiLinkToId("https://nhentai.net/g/12345/"),
    "12345",
  );
  assert.equal(
    m.buildNhentaiCategoryUrl(
      source,
      "big breasts",
      "tags",
      ["/popular@today-Popular Today"],
      2,
    ),
    "https://nhentai.net/tag/big-breasts?page=2",
  );
  assert.equal(
    m.buildNhentaiSearchUrl(source, "a b", ["popular-week"], 3),
    "https://nhentai.net/api/v2/search?query=a%20b&page=3&sort=popular-week",
  );

  const wrapped = m.wrapNhentaiMediaRequest(
    "https://i3.nhentai.net/galleries/1/cover.jpg.jpg",
  );
  assert.equal(
    JSON.stringify(wrapped),
    JSON.stringify({
      url: "https://t3.nhentai.net/galleries/1/cover.jpg",
      headers: {
        Referer: "https://nhentai.net/",
        "User-Agent": "Mozilla/5.0",
      },
    }),
  );

  assert.equal(
    m.toNhentaiAbsoluteMediaUrl(source, "/galleries/1/1.png", false),
    "https://i3.nhentai.net/galleries/1/1.png",
  );
  assert.equal(
    m.toNhentaiAbsoluteMediaUrl(source, "galleries/1/cover.jpg", false),
    "https://t3.nhentai.net/galleries/1/cover.jpg",
  );

  assert.equal(
    JSON.stringify(
      m.buildNhentaiApiImages(source, {
        media_id: "777",
        pages: [
          { path: "1.jpg" },
          { path: "2.webp" },
          { path: "3.png" },
          { path: "4.gif" },
        ],
      }),
    ),
    JSON.stringify([
      "https://i3.nhentai.net/galleries/777/1.jpg",
      "https://i3.nhentai.net/galleries/777/2.webp",
      "https://i3.nhentai.net/galleries/777/3.png",
      "https://i3.nhentai.net/galleries/777/4.gif",
    ]),
  );

  assert.equal(
    JSON.stringify(m.collectNhentaiTagNames(["2937", "8010", "missing"])),
    JSON.stringify(["big breasts", "group"]),
  );
  assert.equal(m.NHENTAI_TRANSLATIONS.zh_CN.sort, "排序");
  assert.equal(m.NHENTAI_TAG_CATALOG["2937"], "big breasts");
  assert.ok(m.NHENTAI_TAG_VALUES.includes("big breasts"));
  assert.ok(source.category.parts[1].categories.includes("big breasts"));
  assert.equal(source.comic.idMatch, "^(\\d+|nh\\d+|nhentai\\d+)$");
});
