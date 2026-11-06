const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readConcatSourceFromModuleOrder } = require("../scripts/build/bundle-plugin");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function createSource() {
  const source = readConcatSourceFromModuleOrder(
    ["plugins/hitomi/src/index.js"],
    "hitomi_refinement_test",
  );
  const context = createVeneraHostShim();
  context.resolvePluginUpdateUrl = () => "https://example.test/hitomi.js";
  vm.runInContext(`${source}\nthis.__Ctor__ = Hitomi;`, context);
  const instance = new context.__Ctor__();
  const searches = [];
  const pages = [];
  context.search = async (options) => {
    searches.push(JSON.parse(JSON.stringify(options)));
    return { type: "all", gids: Array.from({ length: 30 }, (_, i) => i + 1), count: 30 };
  };
  context.get_galleryblocks = async (gids) => {
    pages.push(Array.from(gids));
    return Array.from(gids, (gid) => ({ gid, artists: [], thumbnail_hashs: ["abc123"], series: [], females: [], males: [], others: [] }));
  };
  return { context, instance, searches, pages };
}

test("Hitomi category and search share sort mapping and labels", async () => {
  const { instance, searches } = createSource();
  const options = ["6-Random"];
  await instance.categoryComics.load("artist", "artist:sample", options, 1);
  await instance.search.load("sample", options, 1);
  assert.deepEqual(searches, [
    { term: "artist:sample", orderby: "date", orderbykey: "added", orderbydirection: "random" },
    { term: "sample", orderby: "date", orderbykey: "added", orderbydirection: "random" },
  ]);
  assert.deepEqual(
    JSON.parse(JSON.stringify(instance.categoryComics.optionList[0].options)),
    JSON.parse(JSON.stringify(instance.search.optionList[0].options)),
  );
  await assert.rejects(
    instance.categoryComics.load("artist", "malformed", options, 1),
    /不合法的标签/,
  );
  assert.equal(searches.length, 2);
});

test("Hitomi category and search preserve all-result page slices and cache keys", async () => {
  const { instance, pages } = createSource();
  const options = ["0-Date Added"];
  const categoryFirst = await instance.categoryComics.load("artist", "artist:sample", options, 1);
  const categorySecond = await instance.categoryComics.load("artist", "artist:sample", options, 2);
  const searchFirst = await instance.search.load("sample", options, 1);
  const searchSecond = await instance.search.load("sample", options, 2);
  assert.equal(categoryFirst.maxPage, 2);
  assert.equal(searchFirst.maxPage, 2);
  assert.equal(categorySecond.maxPage, 2);
  assert.equal(searchSecond.maxPage, 2);
  assert.equal(categoryFirst.comics.length, 25);
  assert.equal(searchFirst.comics.length, 25);
  assert.deepEqual(pages.map((ids) => [ids[0], ids[ids.length - 1], ids.length]), [
    [1, 25, 25], [26, 30, 5], [1, 25, 25], [26, 30, 5],
  ]);
  assert.equal(instance.searchResultCaches.size, 1);
});

test("Hitomi category and search retain single-tag page state separately", async () => {
  const { context, instance, pages, searches } = createSource();
  context.search = async (options) => {
    searches.push(JSON.parse(JSON.stringify(options)));
    return { type: "single", state: { term: options.term }, gids: [101, 102], count: 50 };
  };
  const requested = [];
  context.getSingleTagSearchPage = async ({ state, page }) => {
    requested.push({ state: JSON.parse(JSON.stringify(state)), page });
    return { galleryids: [201, 202], count: 50 };
  };

  const options = ["0-Date Added"];
  const categoryFirst = await instance.categoryComics.load("artist", "artist:sample", options, 1);
  const categorySecond = await instance.categoryComics.load("artist", "artist:sample", options, 2);
  const searchFirst = await instance.search.load("sample", options, 1);
  const searchSecond = await instance.search.load("sample", options, 2);

  assert.equal(categoryFirst.maxPage, 2);
  assert.equal(categorySecond.maxPage, 2);
  assert.equal(searchFirst.maxPage, 2);
  assert.equal(searchSecond.maxPage, 2);
  assert.deepEqual(
    [categorySecond.comics.map((comic) => comic.id), searchSecond.comics.map((comic) => comic.id)],
    [[201, 202], [201, 202]],
  );
  assert.deepEqual(requested, [
    { state: { term: "artist:sample" }, page: 1 },
    { state: { term: "sample" }, page: 1 },
  ]);
  assert.equal(pages.length, 4);
  assert.equal(instance.searchResultCaches.size, 1);
});

test("Hitomi sort mapping retains defaults and every explicit option", () => {
  const source = readConcatSourceFromModuleOrder(
    ["plugins/hitomi/src/index.js"],
    "hitomi_refinement_test",
  );
  const context = createVeneraHostShim();
  context.resolvePluginUpdateUrl = () => "https://example.test/hitomi.js";
  vm.runInContext(`${source}\nthis.__buildSearchOptions = buildHitomiSearchOptions;`, context);
  const actual = ["0", "1", "2", "3", "4", "5", "6", "bad"].map((value) =>
    JSON.parse(JSON.stringify(context.__buildSearchOptions("term", [value]))),
  );
  assert.deepEqual(actual, [
    { term: "term", orderby: "date", orderbykey: "added", orderbydirection: "desc" },
    { term: "term", orderby: "date", orderbykey: "published", orderbydirection: "desc" },
    { term: "term", orderby: "popular", orderbykey: "today", orderbydirection: "desc" },
    { term: "term", orderby: "popular", orderbykey: "week", orderbydirection: "desc" },
    { term: "term", orderby: "popular", orderbykey: "month", orderbydirection: "desc" },
    { term: "term", orderby: "popular", orderbykey: "year", orderbydirection: "desc" },
    { term: "term", orderby: "date", orderbykey: "added", orderbydirection: "random" },
    { term: "term", orderby: "date", orderbykey: "added", orderbydirection: "desc" },
  ]);
});
