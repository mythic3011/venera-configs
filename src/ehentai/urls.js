EhentaiModules.URL_HOSTS = {
  EH: "e-hentai.org",
  EX: "exhentai.org",
  FORUMS: "forums.e-hentai.org",
  API_EH: "api.e-hentai.org",
};

EhentaiModules.buildBaseUrl = function buildBaseUrl(domain) {
  return `https://${domain}`;
};

EhentaiModules.buildPathUrl = function buildPathUrl(baseUrl, path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  if (!normalizedPath) {
    return String(baseUrl);
  }
  return `${baseUrl}/${normalizedPath}`;
};

EhentaiModules.buildPathQueryUrl = function buildPathQueryUrl(
  baseUrl,
  path,
  params,
  keepTrailingQuestion = false,
) {
  const base = EhentaiModules.buildPathUrl(baseUrl, path);
  const query = EhentaiModules.buildQuery(params || {});
  if (!query) {
    return keepTrailingQuestion ? `${base}?` : base;
  }
  return `${base}?${query}`;
};

EhentaiModules.buildCdnSourceUrl = function buildCdnSourceUrl(fileName) {
  return EhentaiModules.buildPathUrl(
    "https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main",
    fileName,
  );
};

EhentaiModules.buildApiUrl = function buildApiUrl(baseUrl) {
  if (baseUrl.includes(EhentaiModules.URL_HOSTS.EX)) {
    return EhentaiModules.buildPathUrl(
      EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.EX),
      "api.php",
    );
  }
  return EhentaiModules.buildPathUrl(
    EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.API_EH),
    "api.php",
  );
};

EhentaiModules.buildEhNewsUrl = function buildEhNewsUrl() {
  return EhentaiModules.buildPathUrl(
    EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.EH),
    "news.php",
  );
};

EhentaiModules.buildForumsLoginUrl = function buildForumsLoginUrl() {
  return EhentaiModules.buildPathQueryUrl(
    EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.FORUMS),
    "index.php",
    { act: "Login", CODE: "00" },
  );
};

EhentaiModules.buildForumsHomeUrl = function buildForumsHomeUrl() {
  return `${EhentaiModules.buildPathUrl(
    EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.FORUMS),
    "",
  )}/`;
};

EhentaiModules.buildForumsIndexRefererUrl = function buildForumsIndexRefererUrl() {
  return EhentaiModules.buildPathQueryUrl(
    EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.FORUMS),
    "index.php",
    {},
    true,
  );
};

EhentaiModules.buildEhCookieUrl = function buildEhCookieUrl() {
  return EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.EH);
};

EhentaiModules.buildExCookieUrl = function buildExCookieUrl() {
  return EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.EX);
};

EhentaiModules.buildForumsCookieUrl = function buildForumsCookieUrl() {
  return EhentaiModules.buildBaseUrl(EhentaiModules.URL_HOSTS.FORUMS);
};

EhentaiModules.buildPopularUrl = function buildPopularUrl(baseUrl) {
  return EhentaiModules.buildPathUrl(baseUrl, "popular");
};

EhentaiModules.buildWatchedUrl = function buildWatchedUrl(baseUrl) {
  return EhentaiModules.buildPathUrl(baseUrl, "watched");
};

EhentaiModules.buildGalleryPageUrl = function buildGalleryPageUrl(comicId, pageToken) {
  if (!EhentaiModules.hasValue(pageToken)) {
    return comicId;
  }
  return EhentaiModules.buildPathQueryUrl(comicId, "", { p: pageToken });
};

EhentaiModules.parseGalleryUrl = function parseGalleryUrl(url) {
  const clean = String(url || "").split("?")[0].split("#")[0];
  const segments = clean.split("/");
  return { id: segments[4], token: segments[5] };
};

EhentaiModules.buildFavoritesUrl = function buildFavoritesUrl(baseUrl, folderId) {
  if (!EhentaiModules.hasValue(folderId) || folderId === "-1") {
    return EhentaiModules.buildPathUrl(baseUrl, "favorites.php");
  }
  return EhentaiModules.buildPathQueryUrl(baseUrl, "favorites.php", {
    favcat: folderId,
  });
};

EhentaiModules.buildSearchUrl = function buildSearchUrl(baseUrl, keyword, fcats, stars) {
  const query = {
    f_search: keyword,
    f_cats: fcats ? String(fcats) : null,
    f_srdd: stars || null,
  };
  return EhentaiModules.buildPathQueryUrl(baseUrl, "", query);
};

EhentaiModules.buildToplistUrl = function buildToplistUrl(baseUrl, option, page) {
  return EhentaiModules.buildPathQueryUrl(baseUrl, "toplist.php", {
    tl: option,
    p: page,
  });
};

EhentaiModules.buildGalleryPopupUrl = function buildGalleryPopupUrl(
  baseUrl,
  galleryId,
  token,
) {
  return EhentaiModules.buildPathQueryUrl(baseUrl, "gallerypopups.php", {
    gid: galleryId,
    t: token,
    act: "addfav",
  });
};

EhentaiModules.buildArchiverUrl = function buildArchiverUrl(baseUrl, gid, token) {
  return EhentaiModules.buildPathQueryUrl(baseUrl, "archiver.php", {
    gid,
    token,
  });
};

EhentaiModules.buildCommentsUrl = function buildCommentsUrl(comicId) {
  return EhentaiModules.buildPathQueryUrl(comicId, "", { hc: 1 });
};

EhentaiModules.extractHost = function extractHost(url) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
  const match = String(url || "").match(regex);
  return match ? match[1] : null;
};

EhentaiModules.buildArchiveResultUrl = function buildArchiveResultUrl(
  downloadPageUrl,
  hrefPath,
) {
  const host = EhentaiModules.extractHost(downloadPageUrl);
  if (!host || !hrefPath) {
    return null;
  }
  return `${EhentaiModules.buildBaseUrl(host)}${String(hrefPath)}`;
};

EhentaiModules.normalizeGalleryLink = function normalizeGalleryLink(baseUrl, url) {
  const parsed = EhentaiModules.parseGalleryUrl(url);
  if (!EhentaiModules.hasValue(parsed.id) || !EhentaiModules.hasValue(parsed.token)) {
    return null;
  }
  return `${baseUrl}/g/${parsed.id}/${parsed.token}/`;
};

EhentaiModules.normalizeThumbnailHost = function normalizeThumbnailHost(url) {
  if (String(url || "").includes("s.exhentai.org")) {
    return String(url).replace("s.exhentai.org", "ehgt.org");
  }
  return url;
};

EhentaiModules.imageKeyFromPageUrl = function imageKeyFromPageUrl(url) {
  return String(url || "").split("/")[4] || "";
};
