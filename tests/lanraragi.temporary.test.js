const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// This suite validates only the standalone legacy JS source with a mocked
// Venera host. It does not contact a real LANraragi instance, nor grant LAN.
const file = path.resolve(
  __dirname, "../../experiments/legacy-comic-sources/lanraragi_temporary.js",
);
const sourceText = fs.readFileSync(file, "utf8");
const A = "a".repeat(40);
const B = "b".repeat(40);

function harness(respond) {
  const calls = [];
  const callbacks = respond || (() => ({ status: 200, body: "{}" }));
  class ComicSource {
    loadSetting(key) {
      return this._config[key];
    }
  }
  class Comic {
    constructor(data) {
      Object.assign(this, data);
    }
  }
  class ComicDetails {
    constructor(data) {
      Object.assign(this, data);
    }
  }
  const context = vm.createContext({
    ComicSource,
    Comic,
    ComicDetails,
    Network: {
      get: async (url, headers) => {
        calls.push({ url, headers });
        return callbacks(url, headers);
      },
    },
    Convert: {
      encodeUtf8: value => Buffer.from(value, "utf8"),
      encodeBase64: value => Buffer.from(value).toString("base64"),
    },
  });
  vm.runInContext(
    sourceText + "\nthis.TempSourceCtor = LANraragiTemporarySource;",
    context,
    { filename: file, timeout: 2000 },
  );
  const plugin = new context.TempSourceCtor();
  plugin._config = {
    server: "https://nas.example.test/library",
    allow_http: false,
    api_key: "",
  };
  return { plugin, calls };
}

test("source has unique temporary identity and legacy entrypoints", () => {
  const { plugin } = harness();
  assert.equal(plugin.key, "lanraragi_temporary");
  assert.equal(plugin.version, "0.1.0");
  assert.equal(plugin.minAppVersion, "1.16.0");
  assert.equal(typeof plugin.search.loadNext, "function");
  assert.equal(typeof plugin.comic.loadEp, "function");
  assert.equal(plugin.favorites, undefined); // read-only
  assert.equal(plugin.archive, undefined); // no server mutations
});

test("unconfigured endpoint fails closed", () => {
  const { plugin } = harness();
  plugin._config.server = "";
  assert.throws(() => plugin.baseUrl(), /valid LANraragi Server URL/);
});

test("http requires explicit trusted LAN opt-in", () => {
  const { plugin } = harness();
  plugin._config.server = "http://192.168.50.2:3000";
  assert.throws(() => plugin.baseUrl(), /Plain HTTP is disabled/);
  plugin._config.allow_http = true;
  assert.equal(plugin.baseUrl(), "http://192.168.50.2:3000");
});

test("userinfo, backslashes, parent segments and query base URL blocked", () => {
  for (const server of [
    "https://alice@nas.example.test",
    "https://nas.example.test/../admin",
    "https://nas.example.test\\evil",
    "https://nas.example.test/?token=abc",
  ]) {
    const { plugin } = harness();
    plugin._config.server = server;
    assert.throws(() => plugin.baseUrl());
  }
});

test("base URL supports reverse-proxy prefix and strips trailing slash", () => {
  const { plugin } = harness();
  plugin._config.server = "https://nas.example.test/library/";
  assert.equal(plugin.baseUrl(), "https://nas.example.test/library");
});

test("API key uses LANraragi's Base64-encoded Bearer scheme, not URL query", async () => {
  const { plugin, calls } = harness(() => ({ status: 200, body: '{"data":[],"recordsFiltered":0}' }));
  plugin._config.api_key = "secret-key";
  const headers = plugin.requestHeaders();
  assert.equal(headers.Authorization, "Bearer " + Buffer.from("secret-key").toString("base64"));
  await plugin.search.loadNext("hello", [], null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers.Authorization, headers.Authorization);
  assert.equal(calls[0].url.includes("secret-key"), false);
});

test("first search uses offset zero and encodes query", async () => {
  const { plugin, calls } = harness(() => ({
    status: 200,
    body: JSON.stringify({ data: [{ arcid: A, title: "Test Book", tags: "artist:Me, color" }], recordsFiltered: 1 }),
  }));
  const result = await plugin.search.loadNext("hello & world", [], null);
  assert.equal(calls[0].url, "https://nas.example.test/library/api/search?filter=hello%20%26%20world&start=0&groupby_tanks=false");
  assert.equal(result.comics.length, 1);
  assert.equal(result.comics[0].id, A);
  assert.equal(result.comics[0].title, "Test Book");
  assert.equal(result.next, null);
});

test("cursor uses server-reported filtered total, not configured page size", async () => {
  const { plugin, calls } = harness(() => ({
    status: 200,
    body: JSON.stringify({ data: [{ arcid: A }], recordsFiltered: 5 }),
  }));
  const first = await plugin.search.loadNext("x", [], null);
  assert.equal(first.next, "1");
  const second = await plugin.search.loadNext("x", [], first.next);
  assert.equal(second.next, "2");
  assert.ok(calls[1].url.includes("start=1"));
});

test("negative and nonnumeric cursors are refused before sending requests", async () => {
  const { plugin, calls } = harness();
  await assert.rejects(plugin.search.loadNext("", [], "-1"), /Invalid search cursor/);
  await assert.rejects(plugin.search.loadNext("", [], "NaN"), /Invalid search cursor/);
  assert.equal(calls.length, 0);
});

test("401 and 403 expose an authentication error without leaking credentials", async () => {
  for (const status of [401, 403]) {
    const { plugin } = harness(() => ({ status, body: "" }));
    plugin._config.api_key = "secret-key";
    await assert.rejects(plugin.search.loadNext("x", [], null), error => {
      assert.match(error.message, /API Key/);
      assert.equal(error.message.includes("secret-key"), false);
      return true;
    });
  }
});

test("204/invalid JSON responses report correct failures", async () => {
  const { plugin: waiting } = harness(() => ({ status: 204, body: "" }));
  await assert.rejects(waiting.search.loadNext("x", [], null), /not initialized/);
  const { plugin: bad } = harness(() => ({ status: 200, body: "{no-json" }));
  await assert.rejects(bad.search.loadNext("x", [], null), /invalid JSON/);
});

test("loadInfo maps tags into namespaces and preserves unchaptered semantics", async () => {
  const { plugin, calls } = harness(() => ({
    status: 200,
    body: JSON.stringify({ title: "Manga", tags: "artist:Test, genre:Action, misc" }),
  }));
  const result = await plugin.comic.loadInfo(A);
  assert.equal(result.title, "Manga");
  assert.equal(result.chapters, null);
  assert.equal(result.cover, "lrr-cover:" + A);
  assert.deepEqual(Array.from(result.tags.artist), ["Test"]);
  assert.deepEqual(Array.from(result.tags.genre), ["Action"]);
  assert.deepEqual(Array.from(result.tags.tags), ["misc"]);
  assert.equal(calls[0].url, "https://nas.example.test/library/api/archives/" + A + "/metadata");
});

test("loadEp maps documented LANraragi page&path form without reordering", async () => {
  const { plugin } = harness(() => ({
    status: 200,
    body: JSON.stringify({ pages: [
      "./api/archives/" + A + "/page&path=00.jpg",
      "./api/archives/" + A + "/page?path=chapter%20page%202.jpg",
    ] }),
  }));
  const result = await plugin.comic.loadEp(A, null);
  assert.equal(result.images.length, 2);
  assert.equal(result.images[0], "lrr-page:" + A + ":00.jpg");
  assert.equal(result.images[1], "lrr-page:" + A + ":chapter%20page%202.jpg");
  assert.equal(plugin.imageUrl(result.images[0]), "https://nas.example.test/library/api/archives/" + A + "/page?path=00.jpg");
});

test("all images stay under configured server, ignoring source page URL origin", () => {
  const { plugin } = harness();
  const key = plugin.pageKey(A, "https://attacker.invalid/api/archives/" + A + "/page?path=test.jpg");
  const resolved = plugin.imageUrl(key);
  assert.equal(resolved.startsWith("https://nas.example.test/library/"), true);
  assert.equal(resolved.includes("attacker.invalid"), false);
});

test("foreign archive IDs and encoded path traversal blocked", () => {
  const { plugin } = harness();
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + B + "/page?path=01.jpg"),
    /Unexpected LANraragi/,
  );
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + A + "/page?path=..%2Fsecret"),
    /Unsafe image filename/,
  );
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + A + "/page?path=%00x"),
    /Unsafe image filename/,
  );
});

test("image and thumbnail requests resolve a local URL and include auth headers", () => {
  const { plugin } = harness();
  plugin._config.api_key = "secret";
  const image = plugin.comic.onImageLoad(
    "lrr-page:" + A + ":0.jpg", A, null,
  );
  assert.equal(image.url, "https://nas.example.test/library/api/archives/" + A + "/page?path=0.jpg");
  assert.equal(image.headers.Authorization, "Bearer " + Buffer.from("secret").toString("base64"));
  const thumbnail = plugin.comic.onThumbnailLoad("lrr-cover:" + A);
  assert.equal(thumbnail.url, "https://nas.example.test/library/api/archives/" + A + "/thumbnail");
  assert.equal(thumbnail.headers.Authorization, image.headers.Authorization);
});

test("empty files and nonempty epId are rejected for single-archive reading", async () => {
  const { plugin } = harness(() => ({ status: 200, body: '{"pages":[]}' }));
  await assert.rejects(plugin.comic.loadEp(A, null), /no extracted pages/);
  await assert.rejects(plugin.comic.loadEp(A, "ep_1"), /does not contain chapters/);
});

test("independent concurrent archives preserve per-response page identities", async () => {
  const { plugin } = harness(url => Promise.resolve({
    status: 200,
    body: JSON.stringify({
      pages: ["./api/archives/" + (url.includes(A) ? A : B) + "/page?path=first.jpg"],
    }),
  }));
  const [a, b] = await Promise.all([
    plugin.comic.loadEp(A, null),
    plugin.comic.loadEp(B, null),
  ]);
  assert.ok(a.images[0].includes(A));
  assert.ok(b.images[0].includes(B));
});
