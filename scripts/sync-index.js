#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(REPO_ROOT, "index.json");
const CDN_BASE = "https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/";
const CHECK_MODE = process.argv.includes("--check");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readSourceMetadata(sourceCode, fileName) {
  const classMatch = sourceCode.match(
    /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource/,
  );
  if (!classMatch) {
    throw new Error(`Cannot find ComicSource class in ${fileName}`);
  }

  const className = classMatch[1];
  const wrapped = `${sourceCode}\nthis.__SourceCtor__ = ${className};`;

  class ComicSource {
    loadSetting() {
      return null;
    }
    loadData() {
      return null;
    }
    saveData() {}
    deleteData() {}
  }

  const context = {
    ComicSource,
    Network: {
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "{}" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
      sendRequest: async () => ({ status: 200, body: "" }),
    },
    UI: {
      showMessage: () => {},
      showDialog: () => {},
      launchUrl: () => {},
    },
    HtmlDocument: class {},
    Cookie: class {
      constructor(v) {
        Object.assign(this, v);
      }
    },
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
    APP: { locale: "en_US" },
    // Stubs for common utilities used in sources
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    parseInt,
    parseFloat,
    isNaN,
    encodeURI,
    encodeURIComponent,
    decodeURI,
    decodeURIComponent,
    Array,
    String,
    Number,
    Boolean,
    Object,
    Math,
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
  vm.runInContext(wrapped, context, { filename: fileName });

  if (!context.__SourceCtor__) {
    throw new Error(`Failed to load source class from ${fileName}`);
  }

  const source = new context.__SourceCtor__();
  return {
    name: source.name,
    key: source.key,
    version: source.version,
  };
}

function buildEntry(existingEntry) {
  const sourcePath = path.join(REPO_ROOT, existingEntry.fileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${existingEntry.fileName}`);
  }

  const sourceCode = fs.readFileSync(sourcePath, "utf8");
  const { name, key, version } = readSourceMetadata(
    sourceCode,
    existingEntry.fileName,
  );

  if (!name || !key || !version) {
    throw new Error(
      `Unable to parse metadata from ${existingEntry.fileName}. Expected name/key/version fields.`,
    );
  }

  const next = {
    name,
    fileName: existingEntry.fileName,
    key,
    version,
    url: `${CDN_BASE}${existingEntry.fileName}`,
  };

  if (existingEntry.description) {
    next.description = existingEntry.description;
  }

  return next;
}

function main() {
  const currentIndex = readJson(INDEX_PATH);
  const nextIndex = currentIndex.map(buildEntry);
  const formatted = `${JSON.stringify(nextIndex, null, 2)}\n`;

  if (CHECK_MODE) {
    const currentRaw = fs.readFileSync(INDEX_PATH, "utf8");
    if (currentRaw !== formatted) {
      console.error(
        "index.json is out of date. Run: node scripts/sync-index.js",
      );
      process.exit(1);
    }
    console.log("index.json is up to date");
    return;
  }

  fs.writeFileSync(INDEX_PATH, formatted, "utf8");
  console.log(`Updated ${path.relative(REPO_ROOT, INDEX_PATH)}`);
}

main();
