const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, ".generated", "build-manifest.json");

function readEhentaiArtifact() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const plugin = manifest.plugins.find((entry) => entry.id === "ehentai");
  assert.ok(plugin, "ehentai is missing from build manifest");
  return {
    source: fs.readFileSync(path.join(repoRoot, plugin.outputPath), "utf8"),
    outputPath: plugin.outputPath,
  };
}

function loadModules() {
  const { source, outputPath } = readEhentaiArtifact();
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
  vm.runInContext(
    `${source}
this.__mods__ = {
  ImageLoadingSessionManager,
};`,
    context,
    { filename: outputPath },
  );
  return context.__mods__;
}

function createSource(modules) {
  let thumbCalls = 0;
  let keyCalls = 0;
  let postCalls = 0;

  const source = {
    baseUrl: "https://e-hentai.org",
    apiUrl: "https://api.e-hentai.org/api.php",
    imageSessionCache: new Map(),
    buildRequestHeaders(method, url, headers) {
      return { ...(headers || {}), referer: this.baseUrl };
    },
    parseUrl: () => ({ id: "123", token: "abc" }),
    comic: {
      loadThumbnails: async (id, next) => {
        thumbCalls += 1;
        if (next == null) {
          return {
            thumbnails: ["t0", "t1"],
            urls: ["https://e-hentai.org/s/k0/1-1", "https://e-hentai.org/s/k1/1-2"],
            next: "1",
          };
        }
        return {
          thumbnails: ["t2", "t3"],
          urls: ["https://e-hentai.org/s/k2/1-3", "https://e-hentai.org/s/k3/1-4"],
          next: null,
        };
      },
      getKey: async () => {
        keyCalls += 1;
        return { showkey: "show-key" };
      },
    },
    requestClient: {
      post: async () => {
        postCalls += 1;
        return {
          status: 200,
          body: JSON.stringify({
            i3: '<img src="https://img.test/file.jpg" style="x">',
            i6: "javascript:nl('next-nl')",
          }),
        };
      },
    },
  };

  source.__counters = {
    thumbCalls: () => thumbCalls,
    keyCalls: () => keyCalls,
    postCalls: () => postCalls,
  };
  return source;
}

test("reuses first page and key within gallery session", async () => {
  const modules = loadModules();
  const source = createSource(modules);
  const manager = new modules.ImageLoadingSessionManager(source);
  source.imageSessions = manager;

  const first = await manager.load({ image: "0", comicId: "https://e-hentai.org/g/123/abc/" });
  const second = await manager.load({ image: "1", comicId: "https://e-hentai.org/g/123/abc/" });

  assert.equal(first.url, "https://img.test/file.jpg");
  assert.equal(second.url, "https://img.test/file.jpg");
  assert.equal(source.__counters.thumbCalls(), 1);
  assert.equal(source.__counters.keyCalls(), 1);
  assert.equal(source.__counters.postCalls(), 2);
});

test("loads additional thumbnail page only when needed", async () => {
  const modules = loadModules();
  const source = createSource(modules);
  const manager = new modules.ImageLoadingSessionManager(source);
  source.imageSessions = manager;

  await manager.load({ image: "3", comicId: "https://e-hentai.org/g/123/abc/" });
  assert.equal(source.__counters.thumbCalls(), 2);
});

test("retry callback is bounded", async () => {
  const modules = loadModules();
  const source = createSource(modules);
  const manager = new modules.ImageLoadingSessionManager(source);
  source.imageSessions = manager;

  const retry0 = manager.createRetry({
    image: "0",
    comicId: "https://e-hentai.org/g/123/abc/",
    epId: null,
    nl: "next",
    attempt: 0,
  });
  assert.equal(typeof retry0, "function");

  const retry2 = manager.createRetry({
    image: "0",
    comicId: "https://e-hentai.org/g/123/abc/",
    epId: null,
    nl: "next",
    attempt: 2,
  });
  assert.equal(retry2, null);
});
