function createFakeUi(overrides = {}) {
  return {
    showMessage: () => {},
    showDialog: () => {},
    showSelectDialog: async () => null,
    launchUrl: () => {},
    ...overrides,
  };
}

export { createFakeUi };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createFakeUi,
  };
}
