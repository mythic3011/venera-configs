const vm = require("node:vm");
const { buildVeneraHostContext } = require("../../support/testing/index.js");

function createVeneraHostShim(overrides = {}) {
  const context = buildVeneraHostContext(overrides);
  vm.createContext(context);
  return context;
}

module.exports = {
  createVeneraHostShim,
};
