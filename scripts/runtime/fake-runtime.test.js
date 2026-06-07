import assert from "node:assert";
import vm from "node:vm";
import fs from "node:fs";
import { test } from "node:test";

function evalFileInContext(filePath, ctx) {
  const code = fs
    .readFileSync(filePath, "utf8")
    .replace(/^\s*export\s+(?=(function|class|const|let|var)\b)/gm, "")
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "");
  const exportSnip = `
this.__EXPORT__ = {
  EhentaiRequestClient: (typeof EhentaiRequestClient !== "undefined" ? EhentaiRequestClient : undefined),
  ImageLoadingSessionManager: (typeof ImageLoadingSessionManager !== "undefined" ? ImageLoadingSessionManager : undefined)
};`;
  const script = new vm.Script(code + exportSnip, { filename: filePath });
  const context = vm.createContext(ctx);
  script.runInContext(context);
  if (context.__EXPORT__) {
    Object.assign(context, context.__EXPORT__);
  }
  return context;
}

function makeFakeSource() {
  return {
    requestState: {
      inflight: new Map(),
      queues: new Map(),
      cooldownUntil: new Map(),
    },
    buildRequestHeaders: (method, url, headers, options) => headers || {},
    formatRequestError: (action, err) => `${action}: ${String(err)}`,
    formatResponseError: (action, res) =>
      `${action}: status=${res && res.status}`,
    parseJsonResponse: (action, res) => JSON.parse(res.body),
    isAbuseResponseBody: (body) =>
      /access denied|captcha|forbidden/i.test(String(body || "")),
    imageSessionCache: new Map(),
    comic: {
      loadThumbnails: async (comicId, token) => ({
        urls: ["page://1", "page://2"],
        thumbnails: [1, 2],
      }),
      getKey: async (url) => ({
        mpvkey: "mpv",
        imageKeys: ["k0", "k1"],
        showkey: "show",
      }),
    },
  };
}

// prepare a VM context and load helper file + classes
const contextBase = {
  console,
  URL,
  // helper domainKey used by request-client
  domainKey: (u) => {
    try {
      return new URL(u).hostname;
    } catch (_) {
      return "default";
    }
  },
  // tiny payload helpers used by image-session; not inspected by tests
  buildImageDispatchPayload: (p) => ({ type: "mpv", ...p }),
  buildShowPagePayload: (p) => ({ type: "show", ...p }),
  imageKeyFromPageUrl: (u) => String(u || "").split("/")[2] || "img",
};

const requestClientContext = evalFileInContext(
  "./plugins/ehentai/src/cache-keys.js",
  { ...contextBase },
);

Object.assign(contextBase, requestClientContext);

const supportCooldownContext = evalFileInContext(
  "./support/http/cooldown.js",
  { ...contextBase },
);

Object.assign(contextBase, supportCooldownContext);

const supportRequestContext = evalFileInContext(
  "./support/http/request-client.js",
  { ...contextBase },
);

Object.assign(contextBase, supportRequestContext);

const rcContext = evalFileInContext("./plugins/ehentai/src/request-client.js", {
  ...contextBase,
});

Object.assign(contextBase, rcContext);

const imgContext = evalFileInContext("./plugins/ehentai/src/image-session.js", {
  ...contextBase,
});

Object.assign(contextBase, imgContext);

// Tests

function setRequestClientNetwork(network) {
  rcContext.Network = network;
  supportRequestContext.Network = network;
}

test("GET same url should dedup", async () => {
  const calls = [];
  setRequestClientNetwork({
    get: async (url, headers) => {
      calls.push({ url, headers });
      return { status: 200, body: "ok" };
    },
    post: async () => {
      throw new Error("unexpected post");
    },
  });

  const source = makeFakeSource();
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);

  const [a, b] = await Promise.all([
    client.get("https://example.test/x"),
    client.get("https://example.test/x"),
  ]);

  assert.strictEqual(
    calls.length,
    1,
    "GET should be deduped into one network call",
  );
  assert.strictEqual(a.status, 200);
  assert.strictEqual(b.status, 200);
});

test("POST same url different body should not dedup by default", async () => {
  const calls = [];
  setRequestClientNetwork({
    post: async (url, headers, body) => {
      calls.push(String(body));
      return { status: 200, body: JSON.stringify({ body }) };
    },
    get: async () => {
      throw new Error("unexpected get");
    },
  });

  const source = makeFakeSource();
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);

  const [ra, rb] = await Promise.all([
    client.post("https://example.test/api", {}, "page=1", { mutation: true }),
    client.post("https://example.test/api", {}, "page=2", { mutation: true }),
  ]);

  assert.strictEqual(
    calls.length,
    2,
    "POST mutation requests should not be deduped by default",
  );
  assert.ok(ra.body.includes("page=1"));
  assert.ok(rb.body.includes("page=2"));
});

test("POST image dispatch page 1 and page 2 should return different URL", async () => {
  const calls = [];
  setRequestClientNetwork({
    post: async (url, headers, body) => {
      calls.push(body);
      // return different image url by inspecting payload.page
      const parsed = body;
      const page = parsed.page || parsed.page;
      return {
        status: 200,
        body: JSON.stringify({
          i: `https://img.test/${parsed.imgKey}:${page}`,
          s: "next",
        }),
      };
    },
  });

  const source = makeFakeSource();
  source.parseUrl = () => ({ id: "123", token: "abcd" });
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);
  source.requestClient = client;

  const ImgSession =
    contextBase.ImageLoadingSessionManager ||
    globalThis.ImageLoadingSessionManager;
  const mgr = new ImgSession(source);

  const [r1, r2] = await Promise.all([
    mgr.load({ image: "0", comicId: "g/123/abcd", epId: null, nl: null }),
    mgr.load({ image: "1", comicId: "g/123/abcd", epId: null, nl: null }),
  ]);

  assert.ok(r1.url.includes("k0"), "first image uses k0");
  assert.ok(r2.url.includes("k1"), "second image uses k1");
  assert.strictEqual(calls.length, 2);
});

test("empty body should not trigger cooldown", async () => {
  setRequestClientNetwork({
    get: async () => ({ status: 200, body: "" }),
    post: async () => ({ status: 200, body: "" }),
  });

  const source = makeFakeSource();
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);

  // first call returns empty body
  const res = await client.get("https://example.test/empty");
  // _shouldCooldown should have considered empty body as not abuse, so no cooldown set
  const cd = source.requestState.cooldownUntil.get("example.test");
  assert.strictEqual(cd, undefined);
});

test("403 should trigger cooldown", async () => {
  setRequestClientNetwork({
    get: async () => ({ status: 403, body: "forbidden" }),
  });
  const source = makeFakeSource();
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);

  await assert.rejects(async () => {
    await client.get("https://example.test/forbidden");
  });

  const cd = source.requestState.cooldownUntil.get("example.test");
  assert.ok(cd && cd > Date.now());
});

test("429 should trigger cooldown", async () => {
  setRequestClientNetwork({
    get: async () => ({ status: 429, body: "too many" }),
  });
  const source = makeFakeSource();
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  const client = new Client(source);

  await assert.rejects(async () => {
    await client.get("https://example.test/rate");
  });

  const cd = source.requestState.cooldownUntil.get("example.test");
  assert.ok(cd && cd > Date.now());
});

test("invalid JSON should throw invalid JSON response", async () => {
  setRequestClientNetwork({
    post: async () => ({ status: 200, body: "not-json" }),
  });
  const source = makeFakeSource();
  source.parseUrl = () => ({ id: "123", token: "abcd" });
  source.parseJsonResponse = (action, response) => {
    try {
      return JSON.parse(response.body);
    } catch (_) {
      throw `${action} failed: invalid JSON response`;
    }
  };

  const ImgSession =
    contextBase.ImageLoadingSessionManager ||
    globalThis.ImageLoadingSessionManager;
  const Client =
    contextBase.EhentaiRequestClient || globalThis.EhentaiRequestClient;
  source.requestClient = new Client(source);
  const mgr = new ImgSession(source);

  await assert.rejects(async () => {
    await mgr.load({ image: "0", comicId: "g/123/abcd", epId: null, nl: null });
  }, /invalid JSON response/);
});
