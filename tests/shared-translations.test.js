const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function translationContext(get) {
  const source = readConcatSourceFromModuleOrder(["support/i18n/index.js"], "i18n");
  const context = createVeneraHostShim({ Network: { get } });
  vm.runInContext(source, context);
  return context;
}

test("shared JSON is bundled and translation objects are isolated", () => {
  const context = translationContext();
  const first = context.createSharedTranslations();
  const second = context.createSharedTranslations();
  assert.equal(first.zh_TW.artist, "畫師");
  assert.equal(first.zh_HK.Tags, "標籤");
  assert.equal(first.en_US.artist, "Artist");
  first.en_US.artist = "Changed";
  assert.equal(second.en_US.artist, "Artist");
  const customized = context.createSharedTranslations(undefined, { en_US: { artist: "Creator" } });
  assert.equal(customized.en_US.artist, "Creator");
});

test("remote JSON merges languages without sending API credentials", async () => {
  const calls = [];
  const context = translationContext(async (url, headers) => {
    calls.push({ url, headers });
    return {
      status: 200,
      body: JSON.stringify({
        ja_JP: { artist: "作者" },
        en_US: { artist: "Creator" },
        zh_HK: { artist: "畫家" },
      }),
    };
  });
  const result = await context.loadSharedTranslations("https://raw.githubusercontent.com/owner/repo/main/translations.json");
  assert.equal(result.ja_JP.artist, "作者");
  assert.equal(result.en_US.artist, "Creator");
  assert.equal(result.zh_CN.artist, "画师");
  assert.equal(result.zh_HK.artist, "畫家");
  assert.equal(result.zh_TW.artist, "畫師");
  assert.notEqual(result.zh_HK, result.zh_TW);
  assert.deepEqual(Object.keys(calls[0].headers), ["Accept"]);
});

test("remote translation failures reject instead of yielding a partial catalog", async () => {
  for (const response of [
    { status: 404, body: "{}" },
    { status: 200, body: "not-json" },
    { status: 200, body: '{"en_US":{"artist":42}}' },
    { status: 200, body: '[]' },
  ]) {
    const context = translationContext(async () => response);
    await assert.rejects(context.loadSharedTranslations("https://example.org/translations.json"));
  }
  const context = translationContext(() => assert.fail("invalid URL must not be fetched"));
  await assert.rejects(context.loadSharedTranslations("http://example.org/translations.json"));
  await assert.rejects(context.loadSharedTranslations("https://user:password@example.org/translations.json"));
});

test("LANraragi applies remote translations on init and retains its object on failure", async () => {
  let body = '{"zh_TW":{"artist":"自訂畫師"}}';
  const context = createVeneraHostShim({ Network: { get: async (url) => ({
    status: 200,
    body: String(url).endsWith("translations.json") ? body : "[]",
  }) } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../dist/plugins/lanraragi.js"), "utf8") + "\nthis.Ctor = Lanraragi;", context);
  const source = new context.Ctor();
  source.loadSetting = (key) => ({ api: "https://example.org", translationUrl: "https://example.org/translations.json" })[key];
  assert.equal(source.translation.zh_TW.artist, "畫師");
  await source.init();
  assert.equal(source.translation.zh_TW.artist, "自訂畫師");
  const previous = source.translation;
  body = "invalid-json";
  await assert.rejects(source.init());
  assert.equal(source.translation, previous);
});

test("LANraragi defaults to the configured repository catalog with explicit offline behavior", async () => {
  let available = true;
  const calls = [];
  const logs = [];
  const context = createVeneraHostShim({ Network: { get: async (url, headers) => {
    calls.push({ url, headers });
    if (String(url).endsWith("/support/i18n/tags.json")) {
      return { status: available ? 200 : 503, body: '{"zh_HK":{"artist":"自訂"}}' };
    }
    return { status: 200, body: "[]" };
  } } });
  context.__VENERA_RELEASE_AUTHORITY__ = {
    cdnOrigin: "https://catalog.example", repository: "owner/repo", releaseRef: "test",
  };
  context.console = { log: (message) => logs.push(message) };
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../dist/plugins/lanraragi.js"), "utf8") + "\nthis.Ctor = Lanraragi;", context);
  const source = new context.Ctor();
  source.loadSetting = (key) => ({ api: "https://reader.example", apiKey: "private" })[key];
  await source.init();
  assert.equal(calls[0].url, "https://catalog.example/gh/owner/repo@test/support/i18n/tags.json");
  assert.deepEqual(Object.keys(calls[0].headers), ["Accept"]);
  assert.equal(source.translation.zh_HK.artist, "自訂");
  available = false;
  await source.init();
  assert.equal(source.translation.zh_HK.artist, "畫師");
  assert.equal(logs.length, 1);
  source.loadSetting = (key) => ({ api: "https://reader.example", translationUrl: "" })[key];
  calls.length = 0;
  await source.init();
  assert.equal(calls.some((call) => call.url.endsWith("/support/i18n/tags.json")), false);
});
