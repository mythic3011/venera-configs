const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function loadModules(networkOverrides = {}) {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const runtimeNetwork = {
    get: async () => ({ status: 200, body: "ok" }),
    post: async () => ({ status: 200, body: "{}" }),
    sendRequest: async () => ({ status: 200, body: "" }),
    getCookies: async () => [],
    setCookies: () => {},
    deleteCookies: () => {},
    ...networkOverrides,
  };

  const callHttp = (method, url, headers, data) => {
    if (method === "GET" && runtimeNetwork.get) {
      return runtimeNetwork.get(url, headers);
    }
    if (method === "POST" && runtimeNetwork.post) {
      return runtimeNetwork.post(url, headers, data);
    }
    return runtimeNetwork.sendRequest(method, url, headers, data);
  };

  const context = {
    ComicSource: class {},
    Network: runtimeNetwork,
    sendMessage: async (message) => {
      if (message.method === "http") {
        return callHttp(
          message.http_method,
          message.url,
          message.headers,
          message.data,
        );
      }
      if (message.method === "cookie") {
        if (message.function === "set") {
          runtimeNetwork.setCookies(message.url, message.cookies);
          return null;
        }
        if (message.function === "get") {
          return runtimeNetwork.getCookies(message.url);
        }
        if (message.function === "delete") {
          runtimeNetwork.deleteCookies(message.url);
          return null;
        }
      }
      if (message.method === "delay") {
        return null;
      }
      return null;
    },
    HtmlDocument: class {},
    UI: { showMessage: () => {}, showDialog: () => {}, launchUrl: () => {} },
    Cookie: class {},
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
    APP: { locale: "en_US" },
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
  vm.runInContext(
    `${source}
this.__mods__ = {
  EhentaiRequestClient,
};`,
    context,
  );
  return { modules: context.__mods__, context };
}

function createSource() {
  return {
    requestState: {
      queues: new Map(),
      inflight: new Map(),
      cooldownUntil: new Map(),
      failureBudget: new Map(),
    },
    isAbuseResponseBody(body) {
      const lower = String(body).toLowerCase();
      return lower.includes("banned") || lower.includes("denied");
    },
    formatRequestError(action, error) {
      return `${action}: ${String(error?.message || error)}`;
    },
    formatResponseError(action, response) {
      return `${action}: ${response.status}`;
    },
  };
}

test("dedupes inflight calls by requestKey", async () => {
  const deferred = createDeferred();
  let calls = 0;
  const { modules } = loadModules({
    get: async () => {
      calls += 1;
      return deferred.promise;
    },
  });
  const client = new modules.EhentaiRequestClient(createSource());

  const a = client.get("https://e-hentai.org/a", {}, { requestKey: "same" });
  const b = client.get("https://e-hentai.org/a", {}, { requestKey: "same" });

  deferred.resolve({ status: 200, body: "ok" });
  const [ra, rb] = await Promise.all([a, b]);

  assert.equal(calls, 1);
  assert.equal(ra.body, "ok");
  assert.equal(rb.body, "ok");
});

test("serializes requests per domain", async () => {
  const gate = createDeferred();
  const order = [];
  let first = true;

  const { modules } = loadModules({
    get: async (url) => {
      order.push(`start:${url}`);
      if (first) {
        first = false;
        await gate.promise;
      }
      order.push(`end:${url}`);
      return { status: 200, body: "ok" };
    },
  });

  const client = new modules.EhentaiRequestClient(createSource());
  const one = client.get("https://e-hentai.org/one", {}, { requestKey: "1" });
  const two = client.get("https://e-hentai.org/two", {}, { requestKey: "2" });
  await Promise.resolve();
  gate.resolve();
  await Promise.all([one, two]);

  assert.deepEqual(order, [
    "start:https://e-hentai.org/one",
    "end:https://e-hentai.org/one",
    "start:https://e-hentai.org/two",
    "end:https://e-hentai.org/two",
  ]);
});

test("applies cooldown and blocks network during cooldown", async () => {
  let calls = 0;
  const source = createSource();
  const { modules } = loadModules({
    get: async () => {
      calls += 1;
      return { status: 403, body: "" };
    },
  });

  const client = new modules.EhentaiRequestClient(source);
  await assert.rejects(
    () => client.get("https://e-hentai.org/a", {}, { action: "x" }),
    /x: 403/,
  );
  await assert.rejects(
    () => client.get("https://e-hentai.org/a", {}, { action: "x" }),
    /cooldown/,
  );
  assert.equal(calls, 1);
});

test("mutation requests default to zero retries", async () => {
  let calls = 0;
  const { modules } = loadModules({
    post: async () => {
      calls += 1;
      return { status: 500, body: "err" };
    },
  });

  const client = new modules.EhentaiRequestClient(createSource());
  await assert.rejects(
    () =>
      client.post("https://e-hentai.org/m", {}, "x", {
        action: "mut",
        mutation: true,
      }),
    /mut: 500/,
  );
  assert.equal(calls, 1);
});
