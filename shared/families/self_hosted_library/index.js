function normalizeSelfHostedBaseUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) {
    return "";
  }
  return raw.replace(/\/+$/, "");
}

function normalizeSelfHostedRoutePath(path, fallback) {
  const source = String(path == null ? fallback || "" : path).trim();
  if (!source) {
    return "";
  }
  const withoutTrailingSlash = source.replace(/\/+$/, "");
  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
}

function joinSelfHostedRoutePath(rootPath, segments) {
  const root = normalizeSelfHostedRoutePath(rootPath, "/");
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

function createKomgaRouteHelpers(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const apiV1Root = normalizeSelfHostedRoutePath(opts.apiV1Root, "/api/v1");
  const apiV2Root = normalizeSelfHostedRoutePath(opts.apiV2Root, "/api/v2");
  const seriesWebRoot = normalizeSelfHostedRoutePath(opts.seriesWebRoot, "/series");
  const booksWebRoot = normalizeSelfHostedRoutePath(opts.booksWebRoot, "/books");
  const seriesRoot = joinSelfHostedRoutePath(apiV1Root, ["series"]);
  const booksRoot = joinSelfHostedRoutePath(apiV1Root, ["books"]);
  const collectionsRoot = joinSelfHostedRoutePath(apiV1Root, ["collections"]);

  return {
    apiV1Root,
    apiV2Root,
    seriesWebRoot,
    booksWebRoot,
    librariesPath: () => joinSelfHostedRoutePath(apiV1Root, ["libraries"]),
    seriesTagsPath: () => joinSelfHostedRoutePath(apiV1Root, ["tags", "series"]),
    languagesPath: () => joinSelfHostedRoutePath(apiV1Root, ["languages"]),
    collectionsPath: () => collectionsRoot,
    genresPath: () => joinSelfHostedRoutePath(apiV1Root, ["genres"]),
    currentUserPath: () => joinSelfHostedRoutePath(apiV2Root, ["users", "me"]),
    seriesPath: () => seriesRoot,
    latestSeriesPath: () => joinSelfHostedRoutePath(seriesRoot, ["latest"]),
    updatedSeriesPath: () => joinSelfHostedRoutePath(seriesRoot, ["updated"]),
    collectionSeriesPath: (collectionId) =>
      joinSelfHostedRoutePath(collectionsRoot, [collectionId, "series"]),
    seriesDetailsPath: (seriesId) => joinSelfHostedRoutePath(seriesRoot, [seriesId]),
    seriesBooksPath: (seriesId) =>
      joinSelfHostedRoutePath(seriesRoot, [seriesId, "books"]),
    seriesThumbnailPath: (seriesId) =>
      joinSelfHostedRoutePath(seriesRoot, [seriesId, "thumbnail"]),
    seriesWebPath: (seriesId) =>
      joinSelfHostedRoutePath(seriesWebRoot, [seriesId]),
    bookDetailsPath: (bookId) => joinSelfHostedRoutePath(booksRoot, [bookId]),
    bookThumbnailPath: (bookId) =>
      joinSelfHostedRoutePath(booksRoot, [bookId, "thumbnail"]),
    bookPagesPath: (bookId) =>
      joinSelfHostedRoutePath(booksRoot, [bookId, "pages"]),
    bookPageImagePath: (bookId, pageNumber) =>
      joinSelfHostedRoutePath(booksRoot, [bookId, "pages", pageNumber]),
    bookWebPath: (bookId) =>
      joinSelfHostedRoutePath(booksWebRoot, [bookId]),
  };
}

function createKavitaRouteHelpers(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const apiRoot = normalizeSelfHostedRoutePath(opts.apiRoot, "/api");
  const libraryRoot = normalizeSelfHostedRoutePath(
    opts.libraryRoot,
    `${apiRoot}/Library`,
  );
  const metadataRoot = normalizeSelfHostedRoutePath(
    opts.metadataRoot,
    `${apiRoot}/Metadata`,
  );
  const metadataLegacyRoot = normalizeSelfHostedRoutePath(
    opts.metadataLegacyRoot,
    `${apiRoot}/metadata`,
  );
  const accountRoot = normalizeSelfHostedRoutePath(
    opts.accountRoot,
    `${apiRoot}/Account`,
  );
  const seriesRoot = normalizeSelfHostedRoutePath(
    opts.seriesRoot,
    `${apiRoot}/Series`,
  );
  const imageRoot = normalizeSelfHostedRoutePath(
    opts.imageRoot,
    `${apiRoot}/Image`,
  );
  const readerRoot = normalizeSelfHostedRoutePath(
    opts.readerRoot,
    `${apiRoot}/Reader`,
  );
  const searchRoot = normalizeSelfHostedRoutePath(
    opts.searchRoot,
    `${apiRoot}/Search`,
  );

  return {
    apiRoot,
    libraryRoot,
    metadataRoot,
    metadataLegacyRoot,
    accountRoot,
    seriesRoot,
    imageRoot,
    readerRoot,
    searchRoot,
    librariesPath: () => joinSelfHostedRoutePath(libraryRoot, ["libraries"]),
    genresPath: () => joinSelfHostedRoutePath(metadataRoot, ["genres"]),
    peopleByRolePath: () =>
      joinSelfHostedRoutePath(metadataLegacyRoot, ["people-by-role"]),
    loginPath: () => joinSelfHostedRoutePath(accountRoot, ["login"]),
    seriesV2Path: () => joinSelfHostedRoutePath(seriesRoot, ["v2"]),
    seriesDetailsPath: (seriesId) => joinSelfHostedRoutePath(seriesRoot, [seriesId]),
    seriesMetadataPath: () => joinSelfHostedRoutePath(seriesRoot, ["metadata"]),
    seriesVolumesPath: () => joinSelfHostedRoutePath(seriesRoot, ["volumes"]),
    seriesCoverPath: () => joinSelfHostedRoutePath(imageRoot, ["series-cover"]),
    chapterPath: () => joinSelfHostedRoutePath(seriesRoot, ["chapter"]),
    readerImagePath: () => joinSelfHostedRoutePath(readerRoot, ["image"]),
    searchPath: () => joinSelfHostedRoutePath(searchRoot, ["search"]),
  };
}

function resolveSelfHostedBaseUrl(rawValue, fallbackValue, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const fallback = typeof fallbackValue === "string" ? fallbackValue : "";
  const raw =
    typeof rawValue === "string" && rawValue.trim() ? rawValue.trim() : fallback;
  let normalized = normalizeSelfHostedBaseUrl(raw);
  if (!normalized) {
    return normalized;
  }
  const defaultScheme =
    typeof opts.defaultScheme === "string" ? opts.defaultScheme.trim() : "";
  if (defaultScheme && !/^https?:\/\//i.test(normalized)) {
    normalized = `${defaultScheme.replace(/:$/, "")}://${normalized}`;
  }
  return normalizeSelfHostedBaseUrl(normalized);
}

function buildSelfHostedQuery(query) {
  if (!query) return "";
  const parts = [];
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
        );
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return parts.join("&");
}

function buildSelfHostedUrl(baseUrl, path, query) {
  let url = path;
  if (!/^https?:\/\//i.test(path)) {
    const safeBase = normalizeSelfHostedBaseUrl(baseUrl || "");
    url = `${safeBase}${String(path).startsWith("/") ? "" : "/"}${path}`;
  }
  const qs = buildSelfHostedQuery(query);
  return qs ? `${url}?${qs}` : url;
}

function withAuthorization(headers, scheme, token) {
  const next = { ...(headers || {}) };
  if (!token) {
    return next;
  }
  next.Authorization = `${scheme} ${token}`;
  return next;
}

function withBearer(headers, token) {
  return withAuthorization(headers, "Bearer", token);
}

function withBasic(headers, token) {
  return withAuthorization(headers, "Basic", token);
}

function encodeSelfHostedToken(rawToken) {
  const raw = String(rawToken || "");
  if (!raw) {
    return "";
  }
  const encoded = Convert.encodeBase64(Convert.encodeUtf8(raw));
  return typeof encoded === "string" ? encoded : Convert.decodeUtf8(encoded);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeSelfHostedBaseUrl,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken,
  };
}
