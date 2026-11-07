import { hasValue } from "./query.js";

export const URL_HOSTS = {
  EH: "e-hentai.org",
  EX: "exhentai.org",
  FORUMS: "forums.e-hentai.org",
  API_EH: "api.e-hentai.org",
};

export function buildBaseUrl(domain) {
  return `https://${domain}`;
}

export function buildPathUrl(baseUrl, path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  if (!normalizedPath) {
    return String(baseUrl);
  }
  return `${baseUrl}/${normalizedPath}`;
}

export function buildPathQueryUrl(
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

export function buildApiUrl(baseUrl) {
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

export function buildEhNewsUrl() {
  return buildPathUrl(
    buildBaseUrl(URL_HOSTS.EH),
    "news.php",
  );
}

export function buildForumsLoginUrl() {
  return buildPathQueryUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "index.php",
    { act: "Login", CODE: "00" },
  );
}

export function buildForumsHomeUrl() {
  return `${buildPathUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "",
  )}/`;
}

export function buildForumsIndexRefererUrl() {
  return buildPathQueryUrl(
    buildBaseUrl(URL_HOSTS.FORUMS),
    "index.php",
    {},
    true,
  );
}

export function buildEhCookieUrl() {
  return buildBaseUrl(URL_HOSTS.EH);
}

export function buildExCookieUrl() {
  return buildBaseUrl(URL_HOSTS.EX);
}

export function buildForumsCookieUrl() {
  return buildBaseUrl(URL_HOSTS.FORUMS);
}

export function buildPopularUrl(baseUrl) {
  return buildPathUrl(baseUrl, "popular");
}

export function buildWatchedUrl(baseUrl) {
  return buildPathUrl(baseUrl, "watched");
}

export function buildGalleryPageUrl(
  comicId,
  pageToken,
) {
  if (!hasValue(pageToken)) {
    return comicId;
  }
  return buildPathQueryUrl(comicId, "", { p: pageToken });
}

export function parseGalleryUrl(url) {
  const clean = String(url || "")
    .split("?")[0]
    .split("#")[0];
  const segments = clean.split("/");
  return { id: segments[4], token: segments[5] };
}

export function buildFavoritesUrl(
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

export function buildSearchUrl(
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

export function buildToplistUrl(
  baseUrl,
  option,
  page,
) {
  return buildPathQueryUrl(baseUrl, "toplist.php", {
    tl: option,
    p: page,
  });
}

export function buildGalleryPopupUrl(
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

export function buildArchiverUrl(
  baseUrl,
  gid,
  token,
) {
  return buildPathQueryUrl(baseUrl, "archiver.php", {
    gid,
    token,
  });
}

export function buildCommentsUrl(comicId) {
  return buildPathQueryUrl(comicId, "", { hc: 1 });
}

export function extractHost(url) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
  const match = String(url || "").match(regex);
  return match ? match[1] : null;
}

export function buildArchiveResultUrl(
  downloadPageUrl,
  hrefPath,
) {
  const host = extractHost(downloadPageUrl);
  if (!host || !hrefPath) {
    return null;
  }
  return `${buildBaseUrl(host)}${String(hrefPath)}`;
}

export function normalizeGalleryLink(
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

export function normalizeThumbnailHost(url) {
  if (String(url || "").includes("s.exhentai.org")) {
    return String(url).replace("s.exhentai.org", "ehgt.org");
  }
  return url;
}

export function imageKeyFromPageUrl(url) {
  return String(url || "").split("/")[4] || "";
}
