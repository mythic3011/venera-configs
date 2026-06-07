function createFakeNetwork(overrides = {}) {
  return {
    get: async () => ({ status: 200, body: "" }),
    post: async () => ({ status: 200, body: "{}" }),
    sendRequest: async () => ({ status: 200, body: "" }),
    getCookies: async () => [],
    setCookies: () => {},
    deleteCookies: () => {},
    ...overrides,
  };
}

export { createFakeNetwork };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createFakeNetwork,
  };
}
