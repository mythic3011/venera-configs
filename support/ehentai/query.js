export function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

export function buildEncodedPairs(params, includeValue) {
  return Object.entries(params)
    .filter(([, value]) => includeValue(value))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

export function buildQuery(params) {
  return buildEncodedPairs(params, hasValue);
}

export function buildFormBody(params) {
  return buildEncodedPairs(params, (value) => value !== null && value !== undefined);
}
