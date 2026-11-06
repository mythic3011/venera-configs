function buildOffsetByPage(page, pageSize) {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.max(1, Number(pageSize))
    : 1;
  return (safePage - 1) * safePageSize;
}

function normalizeStarOption(value) {
  return String(value == null ? "" : value).replace("*", "-");
}

function normalizeStarOptions(options) {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map((option) => normalizeStarOption(option));
}

export {
  buildOffsetByPage,
  normalizeStarOption,
  normalizeStarOptions,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions,
  };
}
