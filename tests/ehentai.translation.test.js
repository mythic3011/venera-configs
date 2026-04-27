const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadEhentai({ getImpl, locale = "en_US", network = {} } = {}) {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const wrapped = `${source}\nthis.__Ehentai__ = Ehentai;`;

  class ComicSource {
    loadSetting(key) {
      if (key === "domain") return "e-hentai.org";
      return null;
    }
    loadData() {
      return null;
    }
    saveData() {}
  }

  const runtimeNetwork = {
    get: getImpl ?? (async () => ({ status: 500, body: "" })),
    post: async () => ({ status: 200, body: "{}" }),
    getCookies: async () => [],
    setCookies: () => {},
    deleteCookies: () => {},
    sendRequest: async () => ({ status: 200, body: "" }),
    ...network,
  };

  const context = {
    ComicSource,
    Network: runtimeNetwork,
    sendMessage: async (message) => {
      if (message.method === "http") {
        if (message.http_method === "GET") {
          return runtimeNetwork.get(message.url, message.headers);
        }
        if (message.http_method === "POST") {
          return runtimeNetwork.post(message.url, message.headers, message.data);
        }
        return runtimeNetwork.sendRequest(
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
    APP: { locale },
    UI: { showMessage: () => {}, showDialog: () => {}, launchUrl: () => {} },
    HtmlDocument: class {},
    Cookie: class {
      constructor(v) {
        Object.assign(this, v);
      }
    },
    Comic: class {},
    ComicDetails: class {},
    Comment: class {},
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
  vm.runInContext(wrapped, context, { filename: "./ehentai.js" });
  return new context.__Ehentai__();
}

test("onLoadFailed() clears igneous and includes failure context", async () => {
  const setCookiesCalls = [];
  const eh = loadEhentai({
    network: {
      getCookies: async () => [
        { name: "ipb_member_id", value: "1", domain: ".e-hentai.org" },
        { name: "igneous", value: "keep-out", domain: ".e-hentai.org" },
      ],
      setCookies: (url, cookies) => {
        setCookiesCalls.push({ url, cookies });
      },
      deleteCookies: () => {},
    },
  });

  await assert.rejects(
    () => eh.onLoadFailed("empty response from gallery list"),
    /empty response from gallery list/,
  );

  assert.equal(setCookiesCalls.length, 1);
  assert.equal(setCookiesCalls[0].url, "https://exhentai.org");
  assert.deepEqual(
    setCookiesCalls[0].cookies.map((cookie) => cookie.name),
    ["ipb_member_id"],
  );
});

test("formatRequestError() preserves the underlying failure detail", () => {
  const eh = loadEhentai();

  assert.equal(
    eh.formatRequestError(
      "Failed to load gallery list",
      new Error("socket hang up"),
    ),
    "Failed to load gallery list failed: network error (socket hang up)",
  );
  assert.equal(
    eh.formatRequestError("Failed to load gallery list", "redirected to login"),
    "Failed to load gallery list failed: request was redirected by the server",
  );
});

test("formatResponseError() classifies empty and blocked responses", () => {
  const eh = loadEhentai();

  assert.equal(
    eh.formatResponseError("Failed to load gallery details", {
      status: 403,
      body: "",
    }),
    "Failed to load gallery details failed: server returned 403",
  );
  assert.equal(
    eh.formatResponseError("Failed to load gallery details", {
      status: 200,
      body: "Your IP address has been banned",
    }),
    "Failed to load gallery details failed: access was denied by the server",
  );
  assert.equal(
    eh.formatResponseError("Failed to load gallery details", {
      status: 200,
      body: "   ",
    }),
    "Failed to load gallery details failed: empty response from server",
  );
});
