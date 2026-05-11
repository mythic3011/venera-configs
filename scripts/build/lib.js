const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { z } = require("zod");

const REPO_ROOT = path.resolve(__dirname, "../..");
const PLUGINS_DIR = path.join(REPO_ROOT, "plugins");
const GENERATED_DIR = path.join(REPO_ROOT, ".generated");
const DIST_PLUGINS_DIR_REL = "dist/plugins";
const DIST_PLUGINS_DIR = path.join(REPO_ROOT, ...DIST_PLUGINS_DIR_REL.split("/"));
const BUILD_MANIFEST_PATH = path.join(GENERATED_DIR, "build-manifest.json");
const RELEASE_AUTHORITY_PATH = path.join(REPO_ROOT, "scripts", "config", "release-authority.json");

const pluginSourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    entry: z.string().min(1),
  }),
  z.object({
    type: z.literal("concat"),
    moduleOrder: z.array(z.string().min(1)).min(1),
  }),
]);

const pluginPipelineSchema = z
  .object({
    mode: z.enum(["standard", "legacy_passthrough"]).default("standard"),
    injectRuntimeReleaseAuthority: z.boolean().default(true),
  })
  .default({ mode: "standard", injectRuntimeReleaseAuthority: true });

const pluginConfigSchema = z.object({
  id: z.string().min(1),
  artifact: z.string().regex(/^[A-Za-z0-9_.-]+\.js$/),
  name: z.string().min(1),
  version: z.string().min(1),
  minAppVersion: z.string().min(1),
  description: z.string().min(1).optional(),
  aliases: z.array(z.string().min(1)).optional().default([]),
  deprecation: z
    .object({
      note: z.string().min(1),
      replacementId: z.string().min(1).optional(),
      since: z.string().min(1).optional(),
    })
    .optional(),
  source: pluginSourceSchema,
  pipeline: pluginPipelineSchema.optional(),
  runtimeShared: z.array(z.string().min(1)).optional().default([]),
});

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizePluginConfig(rawConfig, filePath) {
  const parsed = pluginConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid plugin config ${path.relative(REPO_ROOT, filePath)}: ${issues}`);
  }
  const config = parsed.data;
  if (!config.pipeline) {
    config.pipeline = { mode: "standard", injectRuntimeReleaseAuthority: true };
  }
  if (typeof config.pipeline.injectRuntimeReleaseAuthority !== "boolean") {
    config.pipeline.injectRuntimeReleaseAuthority = true;
  }
  return config;
}

function discoverPluginConfigFiles() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(PLUGINS_DIR, entry.name, "plugin.config.json"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort((a, b) => a.localeCompare(b));
}

function loadPluginConfigs() {
  return discoverPluginConfigFiles().map((filePath) => {
    const config = normalizePluginConfig(readJson(filePath), filePath);
    return {
      configPath: filePath,
      pluginDir: path.dirname(filePath),
      dirName: path.basename(path.dirname(filePath)),
      config,
    };
  });
}

function validateReleaseAuthority(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("release-authority.json must be an object");
  }
  const requiredString = [
    ["provider", raw.provider],
    ["repo.owner", raw.repo && raw.repo.owner],
    ["repo.name", raw.repo && raw.repo.name],
    ["ref", raw.ref],
    ["urlTemplate.scheme", raw.urlTemplate && raw.urlTemplate.scheme],
    ["urlTemplate.host", raw.urlTemplate && raw.urlTemplate.host],
    [
      "urlTemplate.repositoryPathPrefix",
      raw.urlTemplate && raw.urlTemplate.repositoryPathPrefix,
    ],
    ["urlTemplate.repoRefSeparator", raw.urlTemplate && raw.urlTemplate.repoRefSeparator],
  ];
  for (const [key, value] of requiredString) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`release-authority.json invalid: ${key} must be a non-empty string`);
    }
  }
  if (raw.urlTemplate.scheme !== "https") {
    throw new Error('release-authority.json invalid: urlTemplate.scheme must be "https"');
  }
  if (typeof raw.urlTemplate.trailingSlash !== "boolean") {
    throw new Error("release-authority.json invalid: urlTemplate.trailingSlash must be boolean");
  }
  return raw;
}

function loadReleaseAuthority() {
  if (!fs.existsSync(RELEASE_AUTHORITY_PATH)) {
    throw new Error(`Missing ${path.relative(REPO_ROOT, RELEASE_AUTHORITY_PATH)}`);
  }
  return validateReleaseAuthority(readJson(RELEASE_AUTHORITY_PATH));
}

function buildPublicBaseUrl(authority) {
  const prefix = authority.urlTemplate.repositoryPathPrefix.replace(/^\/+|\/+$/g, "");
  const repoRef = `${authority.repo.name}${authority.urlTemplate.repoRefSeparator}${authority.ref}`;
  const trailing = authority.urlTemplate.trailingSlash ? "/" : "";
  return `${authority.urlTemplate.scheme}://${authority.urlTemplate.host}/${prefix}/${authority.repo.owner}/${repoRef}${trailing}`;
}

function createMetadataContext() {
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

  return {
    ComicSource,
    Network: {
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "{}" }),
      sendRequest: async () => ({ status: 200, body: "" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
    },
    UI: {
      showMessage: () => {},
      showDialog: () => {},
      launchUrl: () => {},
    },
    HtmlDocument: class {},
    Cookie: class {
      constructor(value) {
        Object.assign(this, value);
      }
    },
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
    CategoryComicsData: class {},
    HomePageData: class {},
    SearchPageData: class {},
    FavoriteData: class {},
    Convert: {
      md5: (s) => String(s),
      encodeUtf8: (s) => String(s),
      hexEncode: (s) => String(s),
      decodeUtf8: (s) => String(s),
      base64Decode: (s) => String(s),
    },
    APP: { locale: "en_US" },
    fetch: async () => ({ status: 500, text: async () => "" }),
    resolvePluginUpdateUrl: (fileName) =>
      `https://cdn.jsdelivr.net/gh/mythic3011/venera-configs@main/${toPluginOutputPath(fileName)}`,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    parseInt,
    parseFloat,
    isNaN,
    encodeURI,
    encodeURIComponent,
    decodeURI,
    decodeURIComponent,
    Map,
    Promise,
    RegExp,
    Date,
    JSON,
    Math,
    URL,
    Array,
    String,
    Number,
    Boolean,
    Object,
    setTimeout,
    clearTimeout,
    console,
  };
}

function resolveRuntimeSharedForEntry(filePath) {
  const target = path.resolve(filePath);
  for (const item of loadPluginConfigs()) {
    if (item.config.source.type !== "single") {
      continue;
    }
    const entryPath = path.resolve(REPO_ROOT, item.config.source.entry);
    if (entryPath === target) {
      return item.config.runtimeShared || [];
    }
  }
  return [];
}

function injectRuntimeShared(context, runtimeSharedPaths) {
  for (const sharedPath of runtimeSharedPaths) {
    const fullPath = path.join(REPO_ROOT, sharedPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing runtimeShared helper: ${sharedPath}`);
    }
    const helperSource = fs.readFileSync(fullPath, "utf8");
    vm.runInContext(helperSource, context, {
      filename: path.relative(REPO_ROOT, fullPath),
    });
  }
}

function listFilesRecursively(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  const stack = [rootDir];
  const files = [];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

let sharedSymbolIndexCache = null;

function getSharedSymbolIndex() {
  if (sharedSymbolIndexCache) {
    return sharedSymbolIndexCache;
  }
  const index = new Map();
  const sharedRoot = path.join(REPO_ROOT, "shared");
  const files = listFilesRecursively(sharedRoot).filter((filePath) =>
    filePath.endsWith(".js"),
  );
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const patterns = [
      /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g,
      /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
      /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g,
    ];
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match = pattern.exec(source);
      while (match) {
        const symbol = match[1];
        if (!index.has(symbol)) {
          index.set(symbol, filePath);
        }
        match = pattern.exec(source);
      }
    }
  }
  sharedSymbolIndexCache = index;
  return sharedSymbolIndexCache;
}

function getMissingSymbolName(error) {
  if (!error || error.name !== "ReferenceError") {
    return null;
  }
  const message = String(error.message || "");
  const match = message.match(/^([A-Za-z_$][A-Za-z0-9_$]*) is not defined$/);
  return match ? match[1] : null;
}

function runSourceWithAutoSharedInjection(sourceCode, fileName, runtimeSharedPaths) {
  const injected = [];
  const injectedSet = new Set();
  const injectRelative = (relativePath) => {
    const normalized = relativePath.split(path.sep).join("/");
    if (injectedSet.has(normalized)) {
      return false;
    }
    injected.push(normalized);
    injectedSet.add(normalized);
    return true;
  };

  for (const sharedPath of runtimeSharedPaths) {
    injectRelative(sharedPath);
  }

  const sharedSymbolIndex = getSharedSymbolIndex();
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const context = createMetadataContext();
    vm.createContext(context);
    injectRuntimeShared(context, injected);

    try {
      vm.runInContext(`${sourceCode}\nthis.__Ctor__=${fileName.__className};`, context, {
        filename: fileName.__displayName,
      });
      return context;
    } catch (error) {
      const missingSymbol = getMissingSymbolName(error);
      if (!missingSymbol) {
        throw error;
      }
      const helperFile = sharedSymbolIndex.get(missingSymbol);
      if (!helperFile) {
        throw error;
      }
      const helperRelativePath = path
        .relative(REPO_ROOT, helperFile)
        .split(path.sep)
        .join("/");
      if (!injectRelative(helperRelativePath)) {
        throw error;
      }
    }
  }
  throw new Error(`Exceeded shared helper auto-injection limit for ${fileName.__displayName}`);
}

function extractSourceMetadataFromCode(sourceCode, fileName, options = {}) {
  const runtimeSharedPaths = Array.isArray(options.runtimeSharedPaths)
    ? options.runtimeSharedPaths
    : [];
  const classMatch = sourceCode.match(/class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource/);
  if (!classMatch) {
    throw new Error(`Cannot find ComicSource class in ${fileName}`);
  }
  const className = classMatch[1];
  const context = runSourceWithAutoSharedInjection(
    sourceCode,
    { __className: className, __displayName: fileName },
    runtimeSharedPaths,
  );
  if (!context.__Ctor__) {
    throw new Error(`Failed to load class from ${fileName}`);
  }
  const source = new context.__Ctor__();
  return {
    key: source.key,
    name: source.name,
    version: source.version,
    minAppVersion: source.minAppVersion,
    url: source.url,
  };
}

function extractSourceMetadataFromFile(filePath, options = {}) {
  const runtimeSharedPaths = Array.isArray(options.runtimeSharedPaths)
    ? options.runtimeSharedPaths
    : resolveRuntimeSharedForEntry(filePath);
  return extractSourceMetadataFromCode(
    fs.readFileSync(filePath, "utf8"),
    path.relative(REPO_ROOT, filePath),
    { runtimeSharedPaths },
  );
}

function sha256Hex(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function normalizeOutputCode(code) {
  return `${String(code).replace(/^\s*["\']use strict["\'];\s*/, "").replace(/[ \t]+$/gm, "").trimEnd()}\n`;
}

function toPluginOutputPath(fileName) {
  const normalizedFileName = String(fileName || "").replace(/^\/+/, "");
  if (!normalizedFileName) {
    throw new Error("Artifact filename is required");
  }
  return normalizedFileName.startsWith(`${DIST_PLUGINS_DIR_REL}/`)
    ? normalizedFileName
    : path.posix.join(DIST_PLUGINS_DIR_REL, normalizedFileName);
}

function buildPublicIndexEntries(plugins) {
  return plugins.map((plugin) => {
    const entry = {
      name: plugin.name,
      fileName: plugin.artifact,
      key: plugin.id,
      version: plugin.version,
      url: plugin.publicUrl,
    };
    if (plugin.description) {
      entry.description = plugin.description;
    }
    return entry;
  });
}

module.exports = {
  REPO_ROOT,
  PLUGINS_DIR,
  GENERATED_DIR,
  DIST_PLUGINS_DIR_REL,
  DIST_PLUGINS_DIR,
  BUILD_MANIFEST_PATH,
  RELEASE_AUTHORITY_PATH,
  pluginConfigSchema,
  ensureDir,
  readJson,
  writeJson,
  normalizePluginConfig,
  discoverPluginConfigFiles,
  loadPluginConfigs,
  loadReleaseAuthority,
  buildPublicBaseUrl,
  extractSourceMetadataFromCode,
  extractSourceMetadataFromFile,
  sha256Hex,
  normalizeOutputCode,
  toPluginOutputPath,
  buildPublicIndexEntries,
};
