const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// This suite validates only the standalone legacy JS source with a mocked
// Venera host. It does not contact a real LANraragi instance, nor grant LAN.
const file = path.resolve(
  __dirname, "../experiments/legacy-comic-sources/lanraragi_temporary.js",
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
    // Any attempt to call the asynchronous host Convert API must fail.
    Convert: {
      encodeUtf8: () => { throw new Error("Convert bridge forbidden in synchronous image hook"); },
      encodeBase64: () => { throw new Error("Convert bridge forbidden in synchronous image hook"); },
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
  assert.equal(plugin.version, "0.1.1");
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
  assert.equal(calls[0].url, "https://nas.example.test/library/api/search?filter=hello%20%26%20world&start=0&groupby_tanks=false&sortby=title&order=asc");
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
  await assert.rejects(waiting.search.loadNext("x", [], null), /returned no data/);
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
  assert.deepEqual(Array.from(result.tags.Tags), ["misc"]);
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

test("foreign page URL origin is rejected before image loading", () => {
  const { plugin } = harness();
  assert.throws(() => plugin.pageKey(A, "https://attacker.invalid/api/archives/" + A + "/page?path=test.jpg"), /Unexpected LANraragi page origin/);
});

test("foreign archive IDs and encoded path traversal blocked", () => {
  const { plugin } = harness();
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + B + "/page?path=01.jpg"),
    /Unexpected LANraragi/,
  );
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + A + "/page?path=..%2Fsecret"),
    /Unsafe LANraragi image filename/,
  );
  assert.throws(
    () => plugin.pageKey(A, "./api/archives/" + A + "/page?path=%00x"),
    /Unsafe LANraragi image filename/,
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
  await assert.rejects(plugin.comic.loadEp(A, null), /no pages yet/);
  await assert.rejects(plugin.comic.loadEp(A, "ep_1"), /has no chapters/);
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


test("metadata callback and image callbacks remain compatible without Convert bridge", () => {
  const {plugin}=harness();
  assert.equal(typeof plugin.comic.onThumbnailLoad, "function");
  // If this tries to use asynchronous Convert, this will not have an Authorization value.
  plugin._config.api_key="café-金";
  const image=plugin.comic.onImageLoad("lrr-page:"+A+":01.jpg",A,null);
  const cover=plugin.comic.onThumbnailLoad("lrr-cover:"+A);
  const expected="Bearer "+Buffer.from("café-金","utf8").toString("base64");
  assert.equal(image.headers.Authorization,expected);
  assert.equal(cover.headers.Authorization,expected);
  assert.equal(typeof cover.then,"undefined");
});

test("constructor-based identity supports ES2018 without class field initializers", () => {
  const {plugin}=harness();
  assert.equal(plugin.key,"lanraragi_temporary");
  assert.ok(sourceText.includes('this.version = "0.1.1";'));
  assert.equal(/^\s{4}version\s*=/m.test(sourceText),false);
});

test("source rejects archive mixup in onImageLoad comicId argument", () => {
  const {plugin}=harness();
  assert.throws(()=>plugin.comic.onImageLoad("lrr-page:"+A+":01.jpg",B,null),/belongs to another archive/);
  assert.throws(()=>plugin.imageUrl("lrr-cover:"+A,B),/belongs to another archive/);
});

test("search invalid total, oversized array and malformed archive IDs fail before returning data",async()=>{
  for(const response of [
    {data:[{arcid:A}],recordsFiltered:"bad"},
    {data:[{arcid:"wrong"}],recordsFiltered:1},
    {data:new Array(1001).fill({arcid:A}),recordsFiltered:1001}
  ]){
    const {plugin}=harness(()=>({status:200,body:JSON.stringify(response)}));
    await assert.rejects(plugin.search.loadNext("x",[],null));
  }
});

test("pagination cursor rejects ambiguous encoded and fractional values",async()=>{
  const {plugin,calls}=harness();
  for(const cursor of ["1e2","1.5","01","+1","-2","Infinity"]){
    await assert.rejects(plugin.search.loadNext("x",[],cursor),/Invalid search cursor/);
  }
  assert.equal(calls.length,0);
});

test("control bytes, encoded traversal, percent-double-encoding and extra query parts fail closed",()=>{
  const {plugin}=harness();
  for(const path of [
    "../admin","%2e%2e%2fprivate","dir%2F%252e%252e%2Fsecret",
    "%00x","x.jpg%3Ftoken%3Dabc","x.jpg&other=true"
  ]){
    assert.throws(()=>plugin.pageKey(A,"./api/archives/"+A+"/page?path="+path));
  }
});

test("same-origin absolute page form resolves without forwarding credentials to foreign host",()=>{
  const {plugin}=harness();
  const key=plugin.pageKey(A,"https://nas.example.test/library/api/archives/"+A+"/page?path=01.jpg");
  assert.equal(plugin.imageUrl(key),"https://nas.example.test/library/api/archives/"+A+"/page?path=01.jpg");
  assert.throws(()=>plugin.pageKey(A,"https://nas.example.test.evil.invalid/library/api/archives/"+A+"/page?path=01.jpg"),/Unexpected LANraragi page origin/);
});

test("prototype pollution tag names do not alter returned tag object prototype",()=>{
  const {plugin}=harness();
  const tags=plugin.parseTags("__proto__:poison, constructor:bad, toString:alsoBad, artist:Test");
  assert.equal(Object.getPrototypeOf(Object.getPrototypeOf(tags)), null);
  assert.deepEqual(Array.from(tags.Tags),["poison","bad","alsoBad"]);
  assert.deepEqual(Array.from(tags.artist),["Test"]);
  assert.equal(Object.prototype.poison,undefined);
});

test("API key rejects header splitting and unbounded values",()=>{
  const {plugin}=harness();
  for(const key of ["abc\r\nX-Evil: 1","z".repeat(513)]){
    plugin._config.api_key=key;
    assert.throws(()=>plugin.requestHeaders(),/Invalid LANraragi API Key/);
  }
});

test("reject untrusted host authority and unsafe base-path percent escapes",()=>{
  for(const server of [
    "https://example.com%40evil.invalid",
    "https://server.invalid:abc",
    "https://server.invalid/path/%2e%2e/admin",
    "https://server.invalid//api",
    "https://server.invalid:999999",
    "https://server.invalid:65536",
    "https://server.invalid:0"
  ]){
    const {plugin}=harness();
    plugin._config.server=server;
    assert.throws(()=>plugin.baseUrl());
  }
});

test("204 and 404 are distinct from authentication failures",async()=>{
  const {plugin}=harness(()=>({status:404,body:""}));
  await assert.rejects(plugin.search.loadNext("x",[],null),/HTTP 404/);
});

test("loadEp refuses oversized archives without attempting to materialize many image keys",async()=>{
  const {plugin}=harness(()=>({status:200,body:JSON.stringify({pages:Array(10001).fill("unused")})}));
  await assert.rejects(plugin.comic.loadEp(A,null),/Invalid LANraragi archive page list/);
});

test("requestJson validates transport response size and status",async()=>{
  for(const response of [null,{status:200,body:"x".repeat(4*1024*1024+1)},{status:200,body:{data:[]}}]){
    const {plugin}=harness(()=>response);
    await assert.rejects(plugin.search.loadNext("x",[],null));
  }
});
