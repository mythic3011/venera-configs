const test = require("node:test");
const assert = require("node:assert");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

function evalFileInContext(filePath, ctx, exportedNames = []) {
  const code = fs
    .readFileSync(filePath, "utf8")
    .replace(/^\s*export\s+(?=(function|class|const|let|var)\b)/gm, "")
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "");
  const exportSnip = exportedNames.length
    ? `\nthis.__EXPORT__ = { ${exportedNames
        .map((n) => `${n}: (typeof ${n} !== 'undefined' ? ${n} : undefined)`)
        .join(", ")} };`
    : "";

  const script = new vm.Script(code + exportSnip, { filename: filePath });
  const context = vm.createContext(ctx);
  script.runInContext(context);
  if (exportedNames.length) {
    const exported = context.__EXPORT__ || {};
    // attach exported names onto the returned context for easy access
    for (const k of Object.keys(exported)) {
      context[k] = exported[k];
    }
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

const contextBase = {
  console,
  URL,
  domainKey: (u) => {
    try {
      return new URL(u).hostname;
    } catch (_) {
      return "default";
    }
  },
  buildImageDispatchPayload: (p) => ({ type: "mpv", ...p }),
  buildShowPagePayload: (p) => ({ type: "show", ...p }),
  imageKeyFromPageUrl: (u) => String(u || "").split("/")[2] || "img",
};

const projectRoot = process.cwd();

const cacheKeysCtx = evalFileInContext(
  path.join(projectRoot, "plugins/ehentai/src/cache-keys.js"),
  { ...contextBase },
);
Object.assign(contextBase, cacheKeysCtx);

const supportCooldownCtx = evalFileInContext(
  path.join(projectRoot, "support/http/cooldown.js"),
  { ...contextBase },
);
Object.assign(contextBase, supportCooldownCtx);

const supportRequestCtx = evalFileInContext(
  path.join(projectRoot, "support/http/request-client.js"),
  { ...contextBase },
);
Object.assign(contextBase, supportRequestCtx);

const rcCtx = evalFileInContext(
  path.join(projectRoot, "plugins/ehentai/src/request-client.js"),
  { ...contextBase },
  ["EhentaiRequestClient"],
);

const imgCtx = evalFileInContext(
  path.join(projectRoot, "plugins/ehentai/src/image-session.js"),
  { ...contextBase },
  ["ImageLoadingSessionManager"],
);

function setRequestClientNetwork(network) {
  rcCtx.Network = network;
  supportRequestCtx.Network = network;
}

// export constructors onto a shared holder for tests
const RequestClientCtor = rcCtx.EhentaiRequestClient;
const ImageSessionCtor = imgCtx.ImageLoadingSessionManager;

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
  const Client = RequestClientCtor || contextBase.EhentaiRequestClient;
  const client = new Client(source);

  const [a, b] = await Promise.all([
    client.get("https://example.test/x"),
    client.get("https://example.test/x"),
  ]);

  assert.strictEqual(calls.length, 1);
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
  const Client = RequestClientCtor || contextBase.EhentaiRequestClient;
  const client = new Client(source);

  const [ra, rb] = await Promise.all([
    client.post("https://example.test/api", {}, "page=1", { mutation: true }),
    client.post("https://example.test/api", {}, "page=2", { mutation: true }),
  ]);

  assert.strictEqual(calls.length, 2);
  assert.ok(ra.body.includes("page=1"));
  assert.ok(rb.body.includes("page=2"));
});

test("POST image dispatch page 1 and page 2 should return different URL", async () => {
  const calls = [];
  // mock the request-client VM network directly so the request-client sees it
  setRequestClientNetwork({
    post: async (url, headers, body) => {
      calls.push(body);
      const parsed = body || {};
      const key = parsed.imgKey || parsed.imgkey || "unknown";
      const page = parsed.page || parsed.p || 0;
      return {
        status: 200,
        body: JSON.stringify({
          i: `https://img.test/${key}:${page}`,
          s: "next",
        }),
      };
    },
  });

  const source = makeFakeSource();
  source.parseUrl = (v) => ({ id: "123", token: "abcd" });
  // provide a requestClient so dispatchImage can call .post
  source.requestClient = new RequestClientCtor(source);
  const ImgSession = ImageSessionCtor || contextBase.ImageLoadingSessionManager;
  const mgr = new ImgSession(source);

  const [r1, r2] = await Promise.all([
    mgr.load({ image: "0", comicId: "g/123/abcd", epId: null, nl: null }),
    mgr.load({ image: "1", comicId: "g/123/abcd", epId: null, nl: null }),
  ]);

  assert.ok(r1.url.includes("k0"));
  assert.ok(r2.url.includes("k1"));
  assert.strictEqual(calls.length, 2);
});

test("empty body should not trigger cooldown", async () => {
  setRequestClientNetwork({
    get: async () => ({ status: 200, body: "" }),
    post: async () => ({ status: 200, body: "" }),
  });

  const source = makeFakeSource();
  const Client = RequestClientCtor || contextBase.EhentaiRequestClient;
  const client = new Client(source);

  const res = await client.get("https://example.test/empty");
  const cd = source.requestState.cooldownUntil.get("example.test");
  assert.strictEqual(cd, undefined);
});

test("403 should trigger cooldown", async () => {
  setRequestClientNetwork({
    get: async () => ({ status: 403, body: "forbidden" }),
  });
  const source = makeFakeSource();
  const Client = RequestClientCtor || contextBase.EhentaiRequestClient;
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
  const Client = RequestClientCtor || contextBase.EhentaiRequestClient;
  const client = new Client(source);

  await assert.rejects(async () => {
    await client.get("https://example.test/rate");
  });

  const cd = source.requestState.cooldownUntil.get("example.test");
  assert.ok(cd && cd > Date.now());
});

test("invalid JSON should throw invalid JSON response", async () => {
  // request-client should see this network and return a body that's not JSON
  setRequestClientNetwork({
    post: async () => ({ status: 200, body: "not-json" }),
  });
  const source = makeFakeSource();
  source.parseUrl = (v) => ({ id: "123", token: "abcd" });
  source.parseJsonResponse = (action, response) => {
    try {
      return JSON.parse(response.body);
    } catch (_) {
      throw `${action} failed: invalid JSON response`;
    }
  };

  source.requestClient = new RequestClientCtor(source);
  const ImgSession = ImageSessionCtor || contextBase.ImageLoadingSessionManager;
  const mgr = new ImgSession(source);

  await assert.rejects(async () => {
    await mgr.load({ image: "0", comicId: "g/123/abcd", epId: null, nl: null });
  }, /invalid JSON response/);
});
