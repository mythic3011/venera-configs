const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildPublicIndex, buildCatalogReadme } = require("../scripts/build/write-public-index");
const { buildLegacyIndex } = require("../scripts/build/generate-legacy-index");

const root = path.resolve(__dirname, "..");
const temp = path.join(root, "experiments", "legacy-comic-sources");
const readJson = p => JSON.parse(fs.readFileSync(p, "utf8"));

test("canonical index.json is an exact deterministic publicIndex projection", () => {
  const manifest = readJson(path.join(root, ".generated/build-manifest.json"));
  const projected = buildPublicIndex(manifest);
  const onDisk = fs.readFileSync(path.join(root, "index.json"), "utf8");
  assert.equal(onDisk, projected);
  const readme = fs.readFileSync(path.join(root, "CATALOG.md"), "utf8");
  assert.equal(readme, buildCatalogReadme(manifest));
  assert.ok(readme.includes("Total canonical sources: **" + manifest.plugins.length + "**."));
  const index = JSON.parse(onDisk);
  assert.equal(index.length, manifest.plugins.length);
  assert.ok(index.every(x => x.url.startsWith("https://") && x.key && x.fileName));
  assert.equal(index.some(x => x.key === "lanraragi_temporary"), false);
});

test("canonical index fails closed on mismatched release URL and duplicate identity", () => {
  const manifest = readJson(path.join(root, ".generated/build-manifest.json"));
  const tampered = structuredClone(manifest);
  tampered.publicIndex[0].url = "https://not-authorized.invalid/plugin.js";
  assert.throws(() => buildPublicIndex(tampered), /disagrees/);
  const duplicated = structuredClone(manifest);
  duplicated.publicIndex[1].key = duplicated.publicIndex[0].key;
  assert.throws(() => buildPublicIndex(duplicated), /Unknown\/duplicate/);
});

test("legacy JSON catalog + generated INDEX.md are deterministic", () => {
  const catalog = readJson(path.join(temp, "catalog.sources.json"));
  const expected = buildLegacyIndex(catalog, fileName =>
    fs.readFileSync(path.join(temp, fileName), "utf8"));
  assert.equal(fs.readFileSync(path.join(temp, "index.json"), "utf8"), expected.indexJson);
  assert.equal(fs.readFileSync(path.join(temp, "INDEX.md"), "utf8"), expected.indexReadme);
  const index = JSON.parse(expected.indexJson);
  assert.deepEqual(index.map(x => x.key), ["lanraragi_temporary"]);
  assert.equal(index[0].fileName, "lanraragi_temporary.js");
  assert.ok(!Object.hasOwn(index[0], "status"));
  assert.equal(index[0].url, undefined); // relative path resolves from raw JSON URL
  assert.ok(expected.indexReadme.includes("LANraragi"));
});

test("legacy builder refuses source metadata identity drift", () => {
  const entry = readJson(path.join(temp, "catalog.sources.json"))[0];
  const code = fs.readFileSync(path.join(temp, entry.fileName), "utf8");
  assert.throws(() => buildLegacyIndex([{...entry, version: "99.0.0"}], () => code),
    /mismatch/);
  assert.throws(() => buildLegacyIndex([{...entry, name: "Other Source"}], () => code),
    /mismatch/);
});

test("legacy builder blocks traversal, duplicate keys and unexpected metadata", () => {
  const entry = readJson(path.join(temp, "catalog.sources.json"))[0];
  const code = fs.readFileSync(path.join(temp, entry.fileName), "utf8");
  assert.throws(() => buildLegacyIndex([{...entry, fileName: "../token.js"}], () => code),
    /Invalid legacy source/);
  assert.throws(() => buildLegacyIndex([entry, {...entry, fileName: "second.js"}], () => code),
    /Duplicate legacy source/);
  assert.throws(() => buildLegacyIndex([{...entry, secret: "token"}], () => code),
    /Unknown catalog fields/);
});

test("legacy builder refuses unreviewed production entries or stale metadata", () => {
  const entry = readJson(path.join(temp, "catalog.sources.json"))[0];
  const code = fs.readFileSync(path.join(temp, entry.fileName), "utf8");
  assert.throws(() => buildLegacyIndex([{...entry, status: "release"}], () => code),
    /Invalid legacy source/);
  assert.throws(() => buildLegacyIndex([{...entry}], () =>
    code.replace('key = "lanraragi_temporary";', 'key = "different";')),
  /mismatch/);
});


test("both catalogs preserve official Venera index-array entry contract", () => {
  const canonical = readJson(path.join(root, "index.json"));
  const experimental = readJson(path.join(temp, "index.json"));
  const fields = new Set(["name", "fileName", "key", "version", "description", "url"]);
  for (const index of [canonical, experimental]) {
    assert.ok(Array.isArray(index));
    assert.ok(index.length > 0);
    for (const entry of index) {
      assert.equal(typeof entry, "object");
      assert.ok(!Array.isArray(entry));
      for (const key of ["name", "fileName", "key", "version"]) {
        assert.equal(typeof entry[key], "string");
        assert.ok(entry[key].trim().length > 0);
      }
      assert.ok(Object.keys(entry).every(key => fields.has(key)));
      assert.match(entry.fileName, /^[A-Za-z0-9_-]+\.js$/);
      assert.match(entry.version, /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/);
      if (entry.url !== undefined) {
        assert.match(entry.url, /^https:\/\//);
      }
    }
  }
});
