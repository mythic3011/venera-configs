const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadModules() {
  const source = fs.readFileSync("./ehentai.js", "utf8");
  const context = {
    ComicSource: class {},
    Network: {
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "{}" }),
      sendRequest: async () => ({ status: 200, body: "" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
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
  vm.runInContext(`${source}\nthis.__mods__ = EhentaiModules;`, context);
  return context.__mods__;
}

test("payload builders centralize API and form payloads", () => {
  const m = loadModules();
  assert.equal(
    JSON.stringify(
      m.buildRateGalleryPayload({
        galleryId: "1",
        token: "a",
        rating: 8,
        apikey: "k",
        apiuid: "u",
      }),
    ),
    JSON.stringify({
      gid: "1",
      token: "a",
      method: "rategallery",
      rating: 8,
      apikey: "k",
      apiuid: "u",
    }),
  );
  assert.equal(
    JSON.stringify(
      m.buildVoteCommentPayload({
        galleryId: "1",
        token: "a",
        commentId: "2",
        isUp: true,
        apikey: "k",
        apiuid: "u",
      }),
    ),
    JSON.stringify({
      gid: "1",
      token: "a",
      method: "votecomment",
      comment_id: "2",
      comment_vote: 1,
      apikey: "k",
      apiuid: "u",
    }),
  );

  assert.equal(
    m.buildAddFavoriteForm("3"),
    "favcat=3&favnote=&apply=Add%20to%20Favorites&update=1",
  );
  assert.equal(
    m.buildDeleteFavoriteForm(),
    "favcat=favdel&favnote=&apply=Apply%20Changes&update=1",
  );
  assert.equal(m.buildCommentForm("abc xyz"), "commenttext_new=abc%20xyz");
  assert.equal(
    m.buildArchiveDownloadForm("0"),
    "dltype=org&dlcheck=Download%20Original%20Archive",
  );
  assert.equal(m.buildHathDownloadForm("1280"), "hathdl_xres=1280");
});
