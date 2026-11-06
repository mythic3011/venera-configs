function normalizeWebSourceBaseUrl(url, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const defaultScheme =
    typeof opts.defaultScheme === "string" ? opts.defaultScheme.trim() : "";
  let value = String(url || "").trim();
  if (!value) {
    return "";
  }
  if (defaultScheme && !/^https?:\/\//i.test(value)) {
    value = `${defaultScheme.replace(/:$/, "")}://${value}`;
  }
  return value.replace(/\/+$/, "");
}

function normalizeWebSourcePath(path, fallback) {
  const source = String(path == null ? fallback || "" : path).trim();
  if (!source) {
    return "";
  }
  if (/^https?:\/\//i.test(source) || source.startsWith("//")) {
    return source;
  }
  return source.startsWith("/") ? source : `/${source}`;
}

function joinWebSourcePath(rootPath, segments) {
  const root = normalizeWebSourcePath(rootPath, "/");
  const parts = Array.isArray(segments) ? segments : [];
  let next = root;
  for (const segment of parts) {
    const cleaned = String(segment == null ? "" : segment)
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (!cleaned) {
      continue;
    }
    next = `${next}/${cleaned}`;
  }
  return next;
}

function buildWebSourceQuery(query) {
  if (!query || typeof query !== "object") {
    return "";
  }
  const parts = [];
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === "") {
          continue;
        }
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
        );
      }
      continue;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.join("&");
}

function buildWebSourceUrl(baseUrl, path, query) {
  const normalizedBase = normalizeWebSourceBaseUrl(baseUrl || "");
  const normalizedPath = normalizeWebSourcePath(path, "");
  let url = normalizedPath;
  if (!/^https?:\/\//i.test(normalizedPath) && !normalizedPath.startsWith("//")) {
    url = normalizedPath
      ? `${normalizedBase}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`
      : normalizedBase;
  }
  const qs = buildWebSourceQuery(query);
  if (!qs) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

function toWebSourceAbsoluteUrl(urlOrPath, baseUrl) {
  const value = String(urlOrPath || "").trim();
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith("//")) {
    const normalizedBase = normalizeWebSourceBaseUrl(baseUrl || "", {
      defaultScheme: "https",
    });
    const scheme = normalizedBase.startsWith("http://") ? "http:" : "https:";
    return `${scheme}${value}`;
  }
  return buildWebSourceUrl(baseUrl, value);
}

function replaceWebSourceBaseUrl(url, fromBaseUrl, toBaseUrl) {
  const raw = String(url || "").trim();
  const fromBase = normalizeWebSourceBaseUrl(fromBaseUrl || "");
  const toBase = normalizeWebSourceBaseUrl(toBaseUrl || "");
  if (!raw || !fromBase || !toBase) {
    return raw;
  }
  if (raw === fromBase) {
    return toBase;
  }
  if (raw.startsWith(`${fromBase}/`)) {
    return `${toBase}${raw.slice(fromBase.length)}`;
  }
  return raw;
}

function ensureWebSourceTrailingSlash(url) {
  const value = String(url || "").trim();
  if (!value) {
    return value;
  }
  return value.endsWith("/") ? value : `${value}/`;
}

export {
  normalizeWebSourceBaseUrl,
  normalizeWebSourcePath,
  joinWebSourcePath,
  buildWebSourceQuery,
  buildWebSourceUrl,
  toWebSourceAbsoluteUrl,
  replaceWebSourceBaseUrl,
  ensureWebSourceTrailingSlash,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash,
  };
}
