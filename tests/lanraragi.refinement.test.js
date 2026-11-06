const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function createSource(get) {
  const bundled = fs.readFileSync(path.join(__dirname, "../dist/plugins/lanraragi.js"), "utf8");
  const context = createVeneraHostShim({ Network: { get } });
  vm.runInContext(`${bundled}\nthis.__Ctor__ = Lanraragi;`, context);
  const source = new context.__Ctor__();
  source.loadSetting = (key) => ({ api: "http://127.0.0.1:3000", apiKey: "" })[key];
  return source;
}

test("LANraragi search and random explore validate responses consistently", async () => {
  const source = createSource(async () => ({
    status: 200,
    body: JSON.stringify({ data: [{ arcid: "a".repeat(40) }], recordsFiltered: 1 }),
  }));

  const random = await source.explore.find((entry) => entry.title === "Random").load();
  assert.equal(random.comics.length, 1);
  const search = await source._fetchLrrSearch({}, 0);
  assert.equal(search.list.length, 1);

  const failureCases = [
    [null, "Invalid status code: 0"],
    [{ status: 204, body: "{}" }, "Invalid status code: 204"],
    [{ status: 200, body: "invalid" }, "Invalid LANraragi search response"],
  ];
  for (const [response, expected] of failureCases) {
    const randomSource = createSource(async () => response);
    await assert.rejects(
      randomSource.explore.find((entry) => entry.title === "Random").load(),
      (error) => String(error).includes(expected),
    );
    const searchSource = createSource(async () => response);
    await assert.rejects(
      searchSource.search.load("query", {}, 1),
      (error) => String(error).includes(expected),
    );
  }
});

test("LANraragi record guard rejects arrays and primitives while retaining objects", () => {
  const source = createSource(async () => ({ status: 200, body: "{}" }));
  assert.equal(source._acceptTankPage([]), null);
  assert.equal(source._acceptTankPage(null), null);
  assert.deepEqual(
    JSON.parse(JSON.stringify(source._acceptTankPage({ result: [], total: 0 }))),
    { result: [], total: 0 },
  );
});
