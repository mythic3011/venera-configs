import { createFakeNetwork } from "./fake-network.js";
import { createFakeUi } from "./fake-ui.js";
import { createFakeStorage } from "./fake-storage.js";
import { fixtureFormat, createFakeDocumentClasses } from "./fake-document.js";

function normalizeUrlCandidate(value) {
  return String(value || "").trim();
}

function createRequestAllowlist(overrides) {
  const allowedOrigins = Array.isArray(overrides.allowedOrigins)
    ? overrides.allowedOrigins.map(normalizeUrlCandidate).filter(Boolean)
    : [];
  const allowedUrls = Array.isArray(overrides.allowedUrls)
    ? overrides.allowedUrls.map(normalizeUrlCandidate).filter(Boolean)
    : [];
  return {
    allowedOrigins: new Set(
      allowedOrigins.map((origin) => origin.replace(/\/+$/, "")),
    ),
    allowedUrls: new Set(allowedUrls),
    isEnabled: allowedOrigins.length > 0 || allowedUrls.length > 0,
  };
}

function isAllowedRequestUrl(url, allowlist) {
  if (!allowlist.isEnabled) {
    return true;
  }

  const candidate = normalizeUrlCandidate(url);
  if (!candidate) {
    return false;
  }

  if (allowlist.allowedUrls.has(candidate)) {
    return true;
  }

  try {
    const parsed = new URL(candidate);
    return allowlist.allowedOrigins.has(parsed.origin.replace(/\/+$/, ""));
  } catch (_) {
    return false;
  }
}

function buildVeneraHostContext(overrides = {}) {
  const allowlist = createRequestAllowlist(overrides);

  function assertAllowedRequest(operation, url) {
    if (!isAllowedRequestUrl(url, allowlist)) {
      throw new Error(
        `Blocked ${operation} to unallowed origin/url: ${String(url || "")}`,
      );
    }
  }

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

  const docs = createFakeDocumentClasses();
  const base = {
    ComicSource,
    Network: createFakeNetwork(),
    sendMessage: async () => null,
    UI: createFakeUi(),
    ...docs,
    Convert: {
      md5: (s) => String(s),
      encodeUtf8: (s) => String(s),
      hexEncode: (s) => String(s),
      decodeUtf8: (s) => String(s),
      base64Decode: (s) => String(s),
      encodeBase64: (s) => String(s),
      decodeBase64: (s) => String(s),
      hmacString: (key, payload) => `${String(key)}:${String(payload)}`,
    },
    APP: { locale: "en_US" },
    fetch: async () => ({ status: 500, text: async () => "" }),
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    parseInt,
    parseFloat,
    isNaN,
    encodeURI,
    encodeURIComponent,
    decodeURI,
    decodeURIComponent,
    setTimeout,
    clearTimeout,
    URL,
    Map,
    Promise,
    RegExp,
    Date,
    JSON,
    Math,
    Array,
    String,
    Number,
    Boolean,
    Object,
    console,
    __VENERA_ALLOWED_ORIGINS__: Array.from(allowlist.allowedOrigins),
    __VENERA_ALLOWED_URLS__: Array.from(allowlist.allowedUrls),
  };

  base.Network.get = async (url) => {
    assertAllowedRequest("Network.get", url);
    return { status: 200, body: "" };
  };
  base.Network.post = async (url) => {
    assertAllowedRequest("Network.post", url);
    return { status: 200, body: "{}" };
  };
  base.Network.sendRequest = async (method, url) => {
    assertAllowedRequest(`Network.sendRequest(${String(method || "")})`, url);
    return { status: 200, body: "" };
  };
  base.Network.getCookies = async (url) => {
    assertAllowedRequest("Network.getCookies", url);
    return [];
  };
  base.Network.setCookies = (url) => {
    assertAllowedRequest("Network.setCookies", url);
  };
  base.Network.deleteCookies = (url) => {
    assertAllowedRequest("Network.deleteCookies", url);
  };
  base.fetch = async (url) => {
    assertAllowedRequest("fetch", url);
    return { status: 500, text: async () => "" };
  };

const context = {
    ...base,
    ...overrides,
  };
  return context;
}

const testingFixtureApi = {
  fixtureFormat,
  createFakeDocumentClasses,
};

const testingRuntimeApi = {
  createFakeNetwork,
  createFakeUi,
  createFakeStorage,
  buildVeneraHostContext,
};

const testingSupportApi = {
  ...testingFixtureApi,
  ...testingRuntimeApi,
};

export {
  fixtureFormat,
  createFakeNetwork,
  createFakeUi,
  createFakeStorage,
  createFakeDocumentClasses,
  buildVeneraHostContext,
  testingFixtureApi,
  testingRuntimeApi,
  testingSupportApi,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    fixtureFormat,
    createFakeNetwork,
    createFakeUi,
    createFakeStorage,
    createFakeDocumentClasses,
    buildVeneraHostContext,
    testingFixtureApi,
    testingRuntimeApi,
    testingSupportApi,
  };
}
