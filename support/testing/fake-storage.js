function createFakeStorage(initial = {}) {
  const state = new Map(Object.entries(initial));
  return {
    loadData(key) {
      return state.has(key) ? state.get(key) : null;
    },
    saveData(key, value) {
      state.set(key, value);
    },
    deleteData(key) {
      state.delete(key);
    },
    snapshot() {
      return Object.fromEntries(state.entries());
    },
  };
}

export { createFakeStorage };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createFakeStorage,
  };
}
