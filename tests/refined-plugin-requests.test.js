const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { buildManifest } = require("../scripts/build/write-build-manifest");
const { bundlePlugin } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

async function loadPlugin(id, overrides = {}) {
  const plugin = buildManifest().plugins.find((item) => item.id === id);
  const { code } = await bundlePlugin(plugin);
  const context = createVeneraHostShim(overrides);
  context.createUuid = () => "00000000-0000-4000-8000-000000000000";
  vm.runInContext(`${code}\nthis.__Plugin = ${id === "picacg" ? "Picacg" : "MangaDex"};\nthis.__helper = typeof fetchMangaDexJson === "function" ? fetchMangaDexJson : null;`, context);
  return { context, source: new context.__Plugin() };
}

test("MangaDex response helper preserves success and HTTP failure behavior", async () => {
  let result = { ok: true, json: async () => ({ data: [1] }) };
  const { context } = await loadPlugin("manga_dex", { fetch: async () => result });
  assert.deepEqual(JSON.parse(JSON.stringify(await context.__helper("https://api.mangadex.org/test"))), { data: [1] });

  result = { ok: false, status: 503, json: async () => ({}) };
  await assert.rejects(context.__helper("https://api.mangadex.org/test"), /Network response was not ok/);
});

test("Picacg explore loaders refresh request URL and token, and map both response shapes", async () => {
  let token = "old-token";
  let responseStatuses = [];
  let useDocsResponse = true;
  const calls = [];
  const postCalls = [];
  const record = {
    _id: "comic-1",
    title: "Comic",
    author: "Author",
    thumb: { fileServer: "https://img.example", path: "cover.jpg" },
    tags: [],
    categories: [],
    likesCount: 0,
    pagesCount: 1,
  };
  const { source } = await loadPlugin("picacg", {
    Network: {
      get: async (url, headers) => {
        calls.push({ url: String(url), authorization: headers.authorization });
        return {
          status: responseStatuses.length ? responseStatuses.shift() : 200,
          body: JSON.stringify({ data: { comics: useDocsResponse ? { docs: [record] } : [record] } }),
        };
      },
      post: async (url, headers, body) => {
        postCalls.push({ url: String(url), authorization: headers.authorization, body });
        return {
          status: responseStatuses.length ? responseStatuses.shift() : 200,
          body: JSON.stringify({ data: { comics: { docs: [record] } } }),
        };
      },
    },
  });
  source.isLogged = true;
  source.loadSetting = (key) => key === "base_url" ? "https://first.example" : "";
  source.loadData = (key) => key === "token" ? token : ["user", "password"];
  source.account.login = async () => {
    token = "new-token";
    source.loadSetting = (key) => key === "base_url" ? "https://second.example" : "";
    return "ok";
  };

  const latest = await source.explore[1].load(2);
  assert.equal(latest.comics[0].id, "comic-1");
  assert.ok(calls[0].url.startsWith("https://first.example/"));

  useDocsResponse = false;
  calls.length = 0;
  responseStatuses = [401, 200];
  const randomResult = await source.explore[0].load(1);
  assert.equal(randomResult.comics[0].id, "comic-1");
  assert.ok(calls[0].url.startsWith("https://first.example/"));
  assert.ok(calls[1].url.startsWith("https://second.example/"));
  assert.equal(calls[0].authorization, "old-token");
  assert.equal(calls[1].authorization, "new-token");

  responseStatuses = [401, 200];
  const searchResult = await source.search.load("sample", ["dd"], 2);
  assert.equal(searchResult.comics[0].id, "comic-1");
  assert.equal(postCalls.length, 2);
  assert.ok(postCalls[0].url.startsWith("https://second.example/"));
  assert.ok(postCalls[1].url.startsWith("https://second.example/"));
  assert.equal(postCalls[0].authorization, "new-token");
  assert.equal(postCalls[1].authorization, "new-token");
  assert.equal(postCalls[0].body, JSON.stringify({ keyword: "sample", sort: "dd" }));
  assert.equal(postCalls[1].body, postCalls[0].body);

  responseStatuses = [401];
  let favoriteError;
  try {
    await source.favorites.loadComics(1);
  } catch (error) {
    favoriteError = error;
  }
  assert.equal(favoriteError, "Login expired");
});

test("Picacg unauthenticated callbacks retain string and Error rejection types", async () => {
  const { source } = await loadPlugin("picacg");
  source.isLogged = false;
  let exploreError;
  try {
    await source.explore[0].load(1);
  } catch (error) {
    exploreError = error;
  }
  assert.equal(exploreError, "Not logged in");

  let reloginError;
  try {
    await source.account.reLogin();
  } catch (error) {
    reloginError = error;
  }
  assert.equal(reloginError.name, "Error");
  assert.equal(reloginError.message, "Not logged in");
});

test("ManhuaGui browser headers keep request overrides and cookie ownership local", () => {
  const context = createVeneraHostShim();
  context.resolvePluginUpdateUrl = () => "";
  vm.runInContext(fs.readFileSync(require.resolve("../plugins/manhuagui/src/index.js"), "utf8") + "\nthis.__Plugin = ManHuaGui;", context);
  const source = new context.__Plugin();
  const imageHeaders = source.comic.onImageLoad("https://img.example/a.jpg").headers;
  const thumbnailHeaders = source.comic.onThumbnailLoad("https://img.example/a.jpg").headers;
  assert.equal(imageHeaders.accept, "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
  assert.equal(thumbnailHeaders.priority, "u=0, i");
  assert.equal(imageHeaders["sec-fetch-site"], "cross-site");
  assert.equal(thumbnailHeaders["sec-fetch-site"], "none");
  assert.equal(Object.hasOwn(imageHeaders, "cookie"), false);
  assert.equal(Object.hasOwn(thumbnailHeaders, "cookie"), false);
  assert.equal(imageHeaders["sec-ch-ua"], thumbnailHeaders["sec-ch-ua"]);
});
