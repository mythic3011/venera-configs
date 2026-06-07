const URL_HOSTS = {
  EH: "e-hentai.org",
  EX: "exhentai.org",
  FORUMS: "forums.e-hentai.org",
  API_EH: "api.e-hentai.org",
};

function buildBaseUrl(domain) {
  return `https://${domain}`;
}

function buildPathUrl(baseUrl, path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  if (!normalizedPath) {
    return String(baseUrl);
  }
  return `${baseUrl}/${normalizedPath}`;
}

function buildPathQueryUrl(
  baseUrl,
  path,
  params,
  keepTrailingQuestion = false,
) {
  const base = buildPathUrl(baseUrl, path);
  const query = buildQuery(params || {});
  if (!query) {
    return keepTrailingQuestion ? `${base}?` : base;
  }
  return `${base}?${query}`;
}

function buildApiUrl(baseUrl) {
  if (baseUrl.includes(URL_HOSTS.EX)) {
    return buildPathUrl(
      buildBaseUrl(URL_HOSTS.EX),
      "api.php",
    );
  }
  return buildPathUrl(
    buildBaseUrl(URL_HOSTS.API_EH),
    "api.php",
  );
}

function buildEhNewsUrl() {
  return buildPathUrl(
    buildBaseUrl(URL_HOSTS.EH),
    "news.php",
  );
}

function buildForumsLoginUrl() {
  return buildPathQueryUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "index.php",
    { act: "Login", CODE: "00" },
  );
}

function buildForumsHomeUrl() {
  return `${buildPathUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "",
  )}/`;
}

function buildForumsIndexRefererUrl() {
  return buildPathQueryUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "index.php",
    {},
    true,
  );
}

function buildEhCookieUrl() {
  return buildBaseUrl(URL_HOSTS.EH);
}

function buildExCookieUrl() {
  return buildBaseUrl(URL_HOSTS.EX);
}

function buildForumsCookieUrl() {
  return buildBaseUrl(URL_HOSTS.FORUMS);
}

function buildPopularUrl(baseUrl) {
  return buildPathUrl(baseUrl, "popular");
}

function buildWatchedUrl(baseUrl) {
  return buildPathUrl(baseUrl, "watched");
}

function buildGalleryPageUrl(
  comicId,
  pageToken,
) {
  if (!hasValue(pageToken)) {
    return comicId;
  }
  return buildPathQueryUrl(comicId, "", { p: pageToken });
}

function parseGalleryUrl(url) {
  const clean = String(url || "")
    .split("?")[0]
    .split("#")[0];
  const segments = clean.split("/");
  return { id: segments[4], token: segments[5] };
}

function buildFavoritesUrl(
  baseUrl,
  folderId,
) {
  if (!hasValue(folderId) || folderId === "-1") {
    return buildPathUrl(baseUrl, "favorites.php");
  }
  return buildPathQueryUrl(baseUrl, "favorites.php", {
    favcat: folderId,
  });
}

function buildSearchUrl(
  baseUrl,
  keyword,
  fcats,
  stars,
) {
  const query = {
    f_search: keyword,
    f_cats: fcats ? String(fcats) : null,
    f_srdd: stars || null,
  };
  return buildPathQueryUrl(baseUrl, "", query);
}

function buildToplistUrl(
  baseUrl,
  option,
  page,
) {
  return buildPathQueryUrl(baseUrl, "toplist.php", {
    tl: option,
    p: page,
  });
}

function buildGalleryPopupUrl(
  baseUrl,
  galleryId,
  token,
) {
  return buildPathQueryUrl(baseUrl, "gallerypopups.php", {
    gid: galleryId,
    t: token,
    act: "addfav",
  });
}

function buildArchiverUrl(
  baseUrl,
  gid,
  token,
) {
  return buildPathQueryUrl(baseUrl, "archiver.php", {
    gid,
    token,
  });
}

function buildCommentsUrl(comicId) {
  return buildPathQueryUrl(comicId, "", { hc: 1 });
}

function extractHost(url) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
  const match = String(url || "").match(regex);
  return match ? match[1] : null;
}

function buildArchiveResultUrl(
  downloadPageUrl,
  hrefPath,
) {
  const host = extractHost(downloadPageUrl);
  if (!host || !hrefPath) {
    return null;
  }
  return `${buildBaseUrl(host)}${String(hrefPath)}`;
}

function normalizeGalleryLink(
  baseUrl,
  url,
) {
  const parsed = parseGalleryUrl(url);
  if (
    !hasValue(parsed.id) ||
    !hasValue(parsed.token)
  ) {
    return null;
  }
  return `${baseUrl}/g/${parsed.id}/${parsed.token}/`;
}

function normalizeThumbnailHost(url) {
  if (String(url || "").includes("s.exhentai.org")) {
    return String(url).replace("s.exhentai.org", "ehgt.org");
  }
  return url;
}

function imageKeyFromPageUrl(url) {
  return String(url || "").split("/")[4] || "";
}
