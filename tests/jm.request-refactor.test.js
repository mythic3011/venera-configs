const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function createSource() {
  const requests = [];
  let response = { status: 200, body: JSON.stringify({ data: "encrypted" }) };
  const context = createVeneraHostShim({
    Network: {
      get: async (url, headers) => {
        requests.push({ method: "GET", url, headers });
        return response;
      },
      post: async (url, headers, body) => {
        requests.push({ method: "POST", url, headers, body });
        return response;
      },
    },
  });
  const artifact = fs.readFileSync(path.join(__dirname, "../dist/plugins/jm.js"), "utf8");
  vm.runInContext(`${artifact}\nthis.__Ctor__ = JM;`, context, { filename: "jm.js" });
  const source = new context.__Ctor__();
  source.loadSetting = () => false;
  source.getApiHeaders = (time) => ({ tokenparam: String(time), Authorization: "Bearer" });
  source.convertData = (data, secret) => `${data}:${secret}`;
  return {
    source,
    requests,
    setResponse(value) {
      response = value;
    },
  };
}

function rejectsWith(value, expected) {
  return assert.rejects(value, (error) => String(error) === expected);
}

test("JM GET and POST share response decoding while keeping request differences", async () => {
  const { source, requests } = createSource();
  const getResult = await source.get("https://18comic.vip/api/get");
  const postResult = await source.post("https://18comic.vip/api/post", "page=1");
  assert.match(getResult, /^encrypted:\d+185Hcomic3PAPP7R$/);
  assert.match(postResult, /^encrypted:\d+185Hcomic3PAPP7R$/);
  assert.equal(requests[0].method, "GET");
  assert.equal(requests[0].headers["Content-Type"], undefined);
  assert.equal(requests[1].method, "POST");
  assert.equal(requests[1].headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.equal(requests[1].body, "page=1");
});

test("JM shared response validation preserves auth and status failures", async () => {
  const { source, setResponse } = createSource();
  source.isLogged = true;
  setResponse({ status: 401, body: JSON.stringify({ errorMsg: "請先登入會員" }) });
  await rejectsWith(source.get("https://18comic.vip/api/get"), "Login expired");
  await rejectsWith(source.post("https://18comic.vip/api/post", ""), "Login expired");

  source.isLogged = false;
  setResponse({ status: 401, body: JSON.stringify({ errorMsg: "請先登入會員" }) });
  await rejectsWith(source.get("https://18comic.vip/api/get"), "請先登入會員");
  setResponse({ status: 403, body: "{}" });
  await rejectsWith(source.post("https://18comic.vip/api/post", ""), "Invalid Status Code: 403");
  setResponse({ status: 200, body: JSON.stringify({ data: 5 }) });
  await rejectsWith(source.get("https://18comic.vip/api/get"), "Invalid Data");
});
