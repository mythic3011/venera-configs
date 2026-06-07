const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadParsers() {
  const source = [
    fs.readFileSync("./plugins/ehentai/src/index.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/gallery-list-parser.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/gallery-detail-parser.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/thumbnail-parser.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/dispatch-key-parser.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/comment-parser.js", "utf8"),
    fs.readFileSync("./plugins/ehentai/src/parsers/archive-parser.js", "utf8"),
  ].join("\n\n");

  class Comic {
    constructor(v) {
      Object.assign(this, v);
    }
  }

  class Comment {
    constructor(v) {
      Object.assign(this, v);
    }
  }

  const context = {
    ComicSource: class {},
    Comic,
    Comment,
    Map,
    RegExp,
    Date,
    JSON,
    console,
  };
  vm.createContext(context);
  vm.runInContext(
    `${source}
this.__mods__ = {
  parseGalleryList,
  parseGalleryDetails,
  parseThumbnailPage,
  parseDispatchKey,
  parseComments,
  parseArchiveOptions,
  parseArchiveError,
  parseFirstLink,
};`,
    context,
  );
  return context.__mods__;
}

function createDoc(maps = {}) {
  return {
    querySelector(selector) {
      return Object.prototype.hasOwnProperty.call(maps, selector) ? maps[selector] : null;
    },
    querySelectorAll(selector) {
      if (Object.prototype.hasOwnProperty.call(maps, selector)) {
        return maps[selector];
      }
      return [];
    },
    getElementById(id) {
      const key = `#${id}`;
      return Object.prototype.hasOwnProperty.call(maps, key) ? maps[key] : null;
    },
  };
}

test("parseDispatchKey tolerates malformed imagelist payload", () => {
  const m = loadParsers();
  const doc = createDoc({
    script: [{ text: 'var mpvkey = "abc"; var imagelist = [invalid-json];' }],
  });
  const parsed = m.parseDispatchKey(doc);
  assert.equal(parsed.mpvkey, "abc");
  assert.equal(JSON.stringify(parsed.imageKeys), JSON.stringify([]));
});

test("parseGalleryDetails falls back when key nodes are missing", () => {
  const m = loadParsers();
  const doc = createDoc({
    "div#taglist > table > tbody > tr": [],
    "td.gdt2": [],
    "h1#gn": null,
    "h1#gj": null,
    "div.cs": null,
    "div#gdd > table > tbody > tr > td.gdt2": null,
    script: [],
  });
  const parsed = m.parseGalleryDetails(doc);
  assert.equal(parsed.title, "Unknown");
  assert.equal(parsed.coverPath, "");
  assert.equal(parsed.maxPage, 1);
  assert.equal(parsed.folder, null);
});

test("parseThumbnailPage ignores malformed style nodes", () => {
  const m = loadParsers();
  const doc = createDoc({
    "div.gdtm > div": [{ attributes: { style: "bad-style" } }],
    "div.gdtl > a > img": [{ attributes: {} }],
    "div.gt100 > a > div": [],
    "div.gt200 > a > div": [],
    "table.ptb > tbody > tr > td > a": [{ attributes: { href: "not-a-page-token" } }],
    "div#gdt a": [{ attributes: {} }],
  });
  const parsed = m.parseThumbnailPage(doc, null);
  assert.deepEqual(parsed.thumbnails, []);
  assert.deepEqual(parsed.urls, []);
  assert.equal(parsed.next, null);
});

test("parseComments returns safe defaults for sparse comment nodes", () => {
  const m = loadParsers();
  const commentNode = {
    previousElementSibling: { attributes: { name: "comment-anchor" } },
    querySelector(selector) {
      if (selector === "div.c3 > a") {
        return null;
      }
      if (selector === "div.c3") {
        return { text: "Posted on 2024-01-01 by user" };
      }
      return null;
    },
  };
  const doc = createDoc({
    "div.c1": [commentNode],
  });
  const parsed = m.parseComments(doc);
  assert.equal(parsed.comments.length, 1);
  assert.equal(parsed.comments[0].id, "0");
  assert.equal(parsed.comments[0].voteStatus, 0);
  assert.equal(parsed.comments[0].content, "");
});

test("archive parsers return null-safe fallbacks", () => {
  const m = loadParsers();
  const emptyDoc = createDoc({
    "div#db": null,
    table: null,
    "p.br": null,
    a: null,
  });
  const options = m.parseArchiveOptions(emptyDoc, "https://e-hentai.org/archive/1");
  assert.equal(JSON.stringify(options), JSON.stringify([]));
  assert.equal(m.parseArchiveError(emptyDoc), null);
  assert.equal(m.parseFirstLink(emptyDoc), null);
});

test("parseGalleryList skips broken rows without throwing", () => {
  const m = loadParsers();
  const doc = createDoc({
    "table.itg.gltc > tbody > tr": [{ children: [] }],
    "div.gl1t": [],
    "table.itg.glte > tbody > tr": [],
    "table.itg.gltm > tbody > tr": [],
    "a#dnext": null,
  });
  const parsed = m.parseGalleryList({
    document: doc,
    source: {
      getStarsFromPosition() {
        return 0;
      },
    },
    url: "https://e-hentai.org/",
    isLeaderBoard: false,
  });
  assert.equal(JSON.stringify(parsed.comics), JSON.stringify([]));
  assert.equal(parsed.next, undefined);
});
