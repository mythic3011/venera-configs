function buildEncodedPairs(params, includeValue) {
  return Object.entries(params)
    .filter(([, value]) => includeValue(value))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

function buildQuery(params) {
  return buildEncodedPairs(params, hasValue);
}

function buildFormBody(params) {
  return buildEncodedPairs(params, (value) => value !== null && value !== undefined);
}
