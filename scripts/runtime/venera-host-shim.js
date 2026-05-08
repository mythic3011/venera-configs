const vm = require("node:vm");

function createVeneraHostShim(overrides = {}) {
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

  const base = {
    ComicSource,
    Network: {
      get: async () => ({ status: 200, body: "" }),
      post: async () => ({ status: 200, body: "{}" }),
      sendRequest: async () => ({ status: 200, body: "" }),
      getCookies: async () => [],
      setCookies: () => {},
      deleteCookies: () => {},
    },
    sendMessage: async () => null,
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
    Comic: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    ComicDetails: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    Comment: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    CategoryComicsData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    HomePageData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    SearchPageData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    FavoriteData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    Convert: {
      md5: (s) => String(s),
      encodeUtf8: (s) => String(s),
      hexEncode: (s) => String(s),
      decodeUtf8: (s) => String(s),
      base64Decode: (s) => String(s),
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
  };

  const context = {
    ...base,
    ...overrides,
  };
  vm.createContext(context);
  return context;
}

module.exports = {
  createVeneraHostShim,
};
