function createOffsetSearchLoader(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const path = String(opts.path || "/api/search");
  const getOffsetKey =
    typeof opts.getOffsetKey === "function" ? opts.getOffsetKey : null;
  const buildQuery =
    typeof opts.buildQuery === "function" ? opts.buildQuery : null;
  const mapComic = typeof opts.mapComic === "function" ? opts.mapComic : null;
  const onResponse =
    typeof opts.onResponse === "function" ? opts.onResponse : null;
  const statusErrorPrefix = String(opts.statusErrorPrefix || "Invalid status code");

  if (!getOffsetKey || !buildQuery || !mapComic) {
    throw new Error("Invalid createOffsetSearchLoader options");
  }

  return async function runOffsetSearch(source, payload) {
    if (!source || typeof source !== "object") {
      throw new Error("runOffsetSearch requires plugin source");
    }
    const input =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : {};
    const page = Number(input.page || 1);
    const base = stripSelfHostedTrailingSlash(source.baseUrl);
    const offsetKey = getOffsetKey(input);
    const start = readSelfHostedOffset(source, offsetKey, page);
    const query = buildQuery(input, start);
    const qs = buildSelfHostedQueryFromSource(query);
    const url = qs ? `${base}${path}?${qs}` : `${base}${path}`;
    const res = await Network.get(url, source.headers);
    if (res.status !== 200) {
      throw `${statusErrorPrefix}: ${res.status}`;
    }

    const data = parseSelfHostedJsonBody(res.body) || {};
    const list = Array.isArray(data.data) ? data.data : [];
    const comics = list.map((item) => mapComic(item, { source, base, input }));
    const returned = list.length;

    updateSelfHostedOffset(source, offsetKey, returned);
    const total =
      typeof data.recordsFiltered === "number" && data.recordsFiltered >= 0
        ? data.recordsFiltered
        : start + returned;
    const serverPage = returned || 1;
    const maxPage = Math.max(1, Math.ceil(total / serverPage));

    if (onResponse) {
      onResponse({ source, input, start, returned, data, list, comics });
    }

    return { comics, maxPage, data };
  };
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createOffsetSearchLoader,
  };
}
