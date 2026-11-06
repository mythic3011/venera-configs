const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createVeneraHostShim } = require("../scripts/runtime/venera-host-shim");

function createSource(plugin, get) {
  const ctorName = plugin === "wnacg" ? "Wnacg" : "Happy";
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "../plugins/" + plugin + "/src/index.js"),
    "utf8",
  );
  const context = createVeneraHostShim({ Network: { get } });
  context.resolvePluginUpdateUrl = (name) => name;
  vm.runInContext(sourceCode + "\nthis.__Ctor__ = " + ctorName + ";", context);
  return new context.__Ctor__();
}

test("WNACG shared page loader preserves status handling and document parsing", async () => {
  let request;
  const source = createSource("wnacg", async (...args) => {
    request = args;
    return { status: 200, body: "fixture" };
  });
  const document = await source._getPageDocument("https://example.test/list");
  assert.equal(request[0], "https://example.test/list");
  assert.deepEqual(JSON.parse(JSON.stringify(request[1])), {});
  assert.equal(document.constructor.name, "HtmlDocument");

  const failed = createSource("wnacg", async () => ({ status: 503, body: "" }));
  await assert.rejects(
    failed._getPageDocument("https://example.test/list"),
    (error) => String(error) === "Invalid Status Code 503",
  );
});

test("Happy comment loader shares response decoding and preserves both end flags", async () => {
  const requests = [];
  const source = createSource("happy", async (url) => {
    requests.push(url);
    return {
      status: 200,
      body: JSON.stringify({
        data: {
          items: [{
            id: "comment-1",
            user: { username: "Reader", cover: "avatar" },
            content: "Hello",
            ch_name: "Chapter 1",
            create_time: "today",
            sub_comments_count: 2,
          }],
          is_end: false,
          isEnd: true,
        },
      }),
    };
  });
  source.avatarMap = { avatar: "avatar-url" };
  const replies = await source.loadCommentsCommon("comic", "chapter", 2, "root", "read");
  const comments = await source.loadCommentsCommon("comic", "chapter", 3, null, "detail");
  assert.equal(requests.length, 2);
  assert.match(requests[0], /subComments\?root_id=root&pn=2&ps=10$/);
  assert.match(requests[1], /comment\?code=comic&ch_id=chapter&pn=3&order=.*&from=detail$/);
  assert.equal(replies.comments[0].avatar, "avatar-url");
  assert.equal(replies.maxPage, null);
  assert.equal(comments.comments[0].time, "章节：Chapter 1\ntoday");
  assert.equal(comments.maxPage, 3);
});
