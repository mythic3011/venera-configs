EhentaiModules.buildQuery = function buildQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => EhentaiModules.hasValue(value))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
};

EhentaiModules.buildFormBody = function buildFormBody(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
};
