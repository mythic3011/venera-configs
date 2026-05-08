#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(REPO_ROOT, "index.json");
const RELEASE_AUTHORITY_PATH = path.join(
  __dirname,
  "config",
  "release-authority.json",
);
const CHECK_MODE = process.argv.includes("--check");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertNonEmptyString(value, fieldPath) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Invalid release authority config: "${fieldPath}" must be a non-empty string.`,
    );
  }
}

function assertMatches(value, fieldPath, regex, hint) {
  if (!regex.test(value)) {
    throw new Error(
      `Invalid release authority config: "${fieldPath}" has invalid value "${value}". ${hint}`,
    );
  }
}

function validateReleaseAuthority(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(
      "Invalid release authority config: top-level JSON must be an object.",
    );
  }

  assertNonEmptyString(config.provider, "provider");
  assertMatches(
    config.provider,
    "provider",
    /^[a-z0-9_-]+$/i,
    'Expected letters, numbers, "_" or "-".',
  );

  const repo = config.repo;
  if (!repo || typeof repo !== "object" || Array.isArray(repo)) {
    throw new Error(
      'Invalid release authority config: "repo" must be an object.',
    );
  }

  assertNonEmptyString(repo.owner, "repo.owner");
  assertNonEmptyString(repo.name, "repo.name");
  assertMatches(
    repo.owner,
    "repo.owner",
    /^[A-Za-z0-9._-]+$/,
    "Expected GitHub owner-safe characters only.",
  );
  assertMatches(
    repo.name,
    "repo.name",
    /^[A-Za-z0-9._-]+$/,
    "Expected GitHub repository-safe characters only.",
  );

  assertNonEmptyString(config.ref, "ref");
  assertMatches(
    config.ref,
    "ref",
    /^[A-Za-z0-9._/-]+$/,
    "Expected branch/tag-safe characters only.",
  );

  const template = config.urlTemplate;
  if (!template || typeof template !== "object" || Array.isArray(template)) {
    throw new Error(
      'Invalid release authority config: "urlTemplate" must be an object.',
    );
  }

  assertNonEmptyString(template.scheme, "urlTemplate.scheme");
  assertNonEmptyString(template.host, "urlTemplate.host");
  assertNonEmptyString(
    template.repositoryPathPrefix,
    "urlTemplate.repositoryPathPrefix",
  );
  assertNonEmptyString(
    template.repoRefSeparator,
    "urlTemplate.repoRefSeparator",
  );

  assertMatches(
    template.scheme,
    "urlTemplate.scheme",
    /^https$/,
    'Only "https" is supported.',
  );
  assertMatches(
    template.host,
    "urlTemplate.host",
    /^[a-z0-9.-]+$/i,
    "Expected a hostname.",
  );
  assertMatches(
    template.repositoryPathPrefix,
    "urlTemplate.repositoryPathPrefix",
    /^[A-Za-z0-9._/-]+$/,
    "Expected URL path-safe characters only.",
  );

  if (template.repositoryPathPrefix.startsWith("/") ||
      template.repositoryPathPrefix.endsWith("/")) {
    throw new Error(
      'Invalid release authority config: "urlTemplate.repositoryPathPrefix" must not start or end with "/".',
    );
  }

  if (template.repoRefSeparator.includes("/")) {
    throw new Error(
      'Invalid release authority config: "urlTemplate.repoRefSeparator" must not contain "/".',
    );
  }

  if (typeof template.trailingSlash !== "boolean") {
    throw new Error(
      'Invalid release authority config: "urlTemplate.trailingSlash" must be a boolean.',
    );
  }

  return config;
}

function readReleaseAuthority() {
  if (!fs.existsSync(RELEASE_AUTHORITY_PATH)) {
    throw new Error(
      `Missing release authority config: ${path.relative(REPO_ROOT, RELEASE_AUTHORITY_PATH)}`,
    );
  }

  return validateReleaseAuthority(readJson(RELEASE_AUTHORITY_PATH));
}

function buildCdnBase(releaseAuthority) {
  const { repo, ref, urlTemplate } = releaseAuthority;
  const repoRef = `${repo.name}${urlTemplate.repoRefSeparator}${ref}`;
  const pathPart = [
    urlTemplate.repositoryPathPrefix,
    repo.owner,
    repoRef,
  ].join("/");
  const trailing = urlTemplate.trailingSlash ? "/" : "";

  return `${urlTemplate.scheme}://${urlTemplate.host}/${pathPart}${trailing}`;
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

function buildEntry(existingEntry, cdnBase) {
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
    url: `${cdnBase}${existingEntry.fileName}`,
  };

  if (existingEntry.description) {
    next.description = existingEntry.description;
  }

  return next;
}

function main() {
  const releaseAuthority = readReleaseAuthority();
  const cdnBase = buildCdnBase(releaseAuthority);
  const currentIndex = readJson(INDEX_PATH);
  const nextIndex = currentIndex.map((entry) => buildEntry(entry, cdnBase));
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
