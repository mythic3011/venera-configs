const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const { buildManifest } = require("../scripts/build/write-build-manifest");
const { bundlePlugin } = require("../scripts/build/bundle-plugin");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function createCore(get) {
  const source = readConcatSourceFromModuleOrder(
    ["support/plugin/features/copy-like-core.js"],
    "copy_like_shared_refactor",
  );
  const context = createVeneraHostShim({ Network: { get } });
  vm.runInContext(
    `${source}
this.__copyLike = {
  queryString: buildCopyLikeQueryString,
  statusError: copyLikeStatusError,
  isAppVersionAfter: isCopyLikeAppVersionAfter,
  favoriteStatus: loadCopyLikeFavoriteStatus,
  updateFavorite: updateCopyLikeFavorite,
  groupChapters: loadCopyLikeGroupChapters,
  chapterData: loadCopyLikeChapterData,
};`,
    context,
  );
  return { context, helpers: context.__copyLike };
}

test("copy-like raw query builder keeps caller encoding and omits null values", () => {
  const { helpers } = createCore(async () => null);
  assert.equal(
    helpers.queryString([["q", "a%20b"], ["nil", null], ["flag", false]]),
    "q=a%20b&flag=false",
  );
});

test("copy-like favorite status preserves endpoint, headers, and error text", async () => {
  const calls = [];
  const { helpers } = createCore(async (url, headers) => {
    calls.push({ url: String(url), headers: { ...headers } });
    return { status: 200, body: JSON.stringify({ results: { collect: { uuid: "fav" } } }) };
  });
  const found = await helpers.favoriteStatus({
    apiUrl: "https://api.example",
    id: "comic-id",
    headers: { Authorization: "Token secret" },
  });
  assert.equal(found, true);
  assert.equal(calls[0].url, "https://api.example/api/v3/comic2/comic-id/query");
  assert.deepEqual(calls[0].headers, { Authorization: "Token secret" });

  const failed = createCore(async () => ({ status: 401, body: "" }));
  await assert.rejects(
    failed.helpers.favoriteStatus({ apiUrl: "https://api.example", id: "comic-id" }),
    (error) => String(error) === "Invalid status code: 401",
  );
});

test("copy-like favorite updates preserve body, authorization, and optional request IDs", async () => {
  const calls = [];
  const { context, helpers } = createCore(async (url, headers, body) => {
    calls.push({ method: "get", url: String(url), headers: { ...headers } });
    return {
      status: 200,
      body: JSON.stringify({ results: { comic: { uuid: "internal-id" } } }),
    };
  });
  context.Network.post = async (url, headers, body) => {
    calls.push({ method: "post", url: String(url), headers: { ...headers }, body });
    return { status: 200, body: "{}" };
  };
  const result = await helpers.updateFavorite({
    apiUrl: "https://api.example",
    comicId: "path-word",
    isAdding: true,
    token: "token-value",
    getHeaders: () => ({ Authorization: "Token token-value" }),
    getRequestId: async () => "request-id",
  });
  assert.equal(result, "ok");
  assert.equal(
    calls[0].url,
    "https://api.example/api/v3/comic2/path-word?in_mainland=true&request_id=request-id&platform=3",
  );
  assert.equal(calls[1].url, "https://api.example/api/v3/member/collect/comic");
  assert.equal(
    calls[1].body,
    "comic_id=internal-id&is_collect=1&authorization=Token+token-value",
  );
  assert.equal(calls[1].headers["Content-Type"], "application/x-www-form-urlencoded;charset=utf-8");

  await helpers.updateFavorite({
    apiUrl: "https://api.example",
    comicId: "path-word",
    isAdding: false,
    token: "token-value",
    getHeaders: () => ({ Authorization: "Token token-value" }),
  });
  assert.equal(
    calls[2].url,
    "https://api.example/api/v3/comic2/path-word?in_mainland=true&platform=3",
  );
  assert.equal(
    calls[3].body,
    "comic_id=internal-id&is_collect=0&authorization=Token+token-value",
  );

  const denied = createCore(
    async () => ({ status: 200, body: JSON.stringify({ results: { comic: { uuid: "id" } } }) }),
  );
  denied.context.Network.post = async () => ({ status: 401, body: "" });
  await assert.rejects(
    denied.helpers.updateFavorite({
      apiUrl: "https://api.example",
      comicId: "path-word",
      token: "token-value",
      getHeaders: () => ({}),
    }),
    (error) => String(error) === "Login expired",
  );
});

test("Copy Manga and Hot Manga favorite methods delegate add, delete, and 401 behavior", async () => {
  const manifest = buildManifest();
  for (const [pluginId, className] of [
    ["copy_manga", "CopyManga"],
    ["hot_manga", "HotManga"],
  ]) {
    const plugin = manifest.plugins.find((entry) => entry.id === pluginId);
    const bundled = await bundlePlugin(plugin);
    const calls = [];
    let postStatus = 200;
    const context = createVeneraHostShim({
      Network: {
        get: async (url) => {
          calls.push({ method: "get", url: String(url) });
          return {
            status: 200,
            body: JSON.stringify({ results: { comic: { uuid: "internal-id" } } }),
          };
        },
        post: async (url, headers, body) => {
          calls.push({
            method: "post",
            url: String(url),
            headers: { ...headers },
            body,
          });
          return { status: postStatus, body: "" };
        },
      },
    });
    vm.runInContext(
      `${bundled.code}\nthis.__Ctor__ = ${className};`,
      context,
      { filename: plugin.outputPath },
    );
    const source = new context.__Ctor__();
    source.loadSetting = (key) => ({ base_url: "api.example" })[key];
    source.loadData = (key) => (key === "token" ? "token-value" : undefined);
    if (pluginId === "copy_manga") {
      Object.defineProperty(source, "copyRegion", { value: "0" });
    }

    await source.favorites.addOrDelFavorite("path-word", null, true);
    await source.favorites.addOrDelFavorite("path-word", null, false);
    assert.deepEqual(
      calls.filter((call) => call.method === "post").map((call) => call.body),
      [
        "comic_id=internal-id&is_collect=1&authorization=Token+token-value",
        "comic_id=internal-id&is_collect=0&authorization=Token+token-value",
      ],
    );
    assert.ok(calls.every((call) => call.url.includes("https://api.example/")));
    assert.ok(
      calls.filter((call) => call.method === "post").every(
        (call) => call.headers["Content-Type"] === "application/x-www-form-urlencoded;charset=utf-8",
      ),
    );

    postStatus = 401;
    await assert.rejects(
      source.favorites.addOrDelFavorite("path-word", null, true),
      (error) => String(error) === "Login expired",
    );
  }
});

test("copy-like group chapters paginate with the existing first-page request parameters", async () => {
  const calls = [];
  const { helpers } = createCore(async (url, headers) => {
    calls.push({ url: String(url), headers: { ...headers } });
    const second = String(url).includes("offset=100");
    return {
      status: 200,
      body: JSON.stringify({
        results: {
          list: [{ uuid: second ? "ep-2" : "ep-1", name: second ? "Two" : "One" }],
          total: 101,
        },
      }),
    };
  });
  const chapters = await helpers.groupChapters({
    apiUrl: "https://api.example",
    id: "comic-id",
    groups: { group: { path_word: "group-path", name: "Regular" } },
    headers: { Authorization: "Token secret" },
    inMainland: true,
    getRequestId: async () => "request-1",
    appVersion: "1.2.0",
  });
  assert.deepEqual([...chapters.entries()], [["ep-1", "One"], ["ep-2", "Two"]]);
  assert.equal(
    calls[0].url,
    "https://api.example/api/v3/comic/comic-id/group/group-path/chapters?limit=100&offset=0&in_mainland=true&request_id=request-1",
  );
  assert.equal(
    calls[1].url,
    "https://api.example/api/v3/comic/comic-id/group/group-path/chapters?limit=100&offset=100",
  );
  assert.deepEqual(calls[1].headers, { Authorization: "Token secret" });

  const grouped = await helpers.groupChapters({
    apiUrl: "https://api.example",
    id: "comic-id",
    groups: { group: { path_word: "group-path", name: "Regular" } },
    headers: {},
    appVersion: "1.3.0",
  });
  assert.equal(grouped.get("Regular").get("ep-1"), "One");
});

test("copy-like chapter helper retries rate limits and preserves request settings", async () => {
  const calls = [];
  let attempt = 0;
  const { helpers } = createCore(async (url, headers) => {
    calls.push({ url: String(url), headers: { ...headers } });
    attempt += 1;
    if (attempt === 1) {
      return { status: 210, body: JSON.stringify({ message: "Expected available in 0 seconds" }) };
    }
    return { status: 200, body: JSON.stringify({ results: { chapter: { id: "chapter" } } }) };
  });
  const result = await helpers.chapterData({
    apiUrl: "https://api.example",
    comicId: "comic-id",
    chapterId: "chapter-id",
    chapterEndpoint: "chapter2",
    inMainland: true,
    getRequestId: async () => "request-2",
    headers: { Authorization: "Token secret" },
    mapResponse: (data) => ({ id: data.results.chapter.id }),
  });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { id: "chapter" });
  assert.equal(calls.length, 2);
  assert.equal(
    calls[0].url,
    "https://api.example/api/v3/comic/comic-id/chapter2/chapter-id?in_mainland=true&request_id=request-2",
  );
  assert.deepEqual(calls[0].headers, { Authorization: "Token secret" });
});

test("copy-like chapter retries also cover mapping errors and stop after five attempts", async () => {
  let calls = 0;
  let mappings = 0;
  const retry = createCore(async () => {
    calls += 1;
    return { status: 200, body: JSON.stringify({ value: calls }) };
  });
  const recovered = await retry.helpers.chapterData({
    apiUrl: "https://api.example",
    comicId: "comic-id",
    chapterId: "chapter-id",
    headers: {},
    mapResponse: (data) => {
      mappings += 1;
      if (mappings === 1) throw "Retry";
      return data.value;
    },
  });
  assert.equal(recovered, 2);
  assert.equal(calls, 2);

  calls = 0;
  const exhausted = createCore(async () => {
    calls += 1;
    return {
      status: 210,
      body: JSON.stringify({ message: "Expected available in 0 seconds" }),
    };
  });
  await assert.rejects(
    exhausted.helpers.chapterData({
      apiUrl: "https://api.example",
      comicId: "comic-id",
      chapterId: "chapter-id",
      headers: {},
    }),
    (error) => String(error) === "Retry",
  );
  assert.equal(calls, 5);
});

test("copy-like version comparator retains the existing three-part threshold behavior", () => {
  const { helpers } = createCore(async () => null);
  assert.equal(helpers.isAppVersionAfter("1.2.9", "1.3.0"), false);
  assert.equal(helpers.isAppVersionAfter("1.3.0", "1.3.0"), true);
  assert.equal(helpers.isAppVersionAfter("1.4.1", "1.3.0"), true);
  assert.equal(helpers.statusError(403), "Invalid status code: 403");
});
