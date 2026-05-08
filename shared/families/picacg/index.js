const PICACG_ENDPOINT_PATHS = {
  AUTH_SIGN_IN: "auth/sign-in",
  COMICS: "comics",
  COMICS_RANDOM: "comics/random",
  COMICS_LEADERBOARD: "comics/leaderboard",
  COMICS_ADVANCED_SEARCH: "comics/advanced-search",
  USERS_FAVOURITE: "users/favourite",
  COMMENTS: "comments",
};

const PICACG_RANKING_CATEGORY = "VC";

const PICACG_TAG_NAMESPACES = {
  AUTHOR: "Author",
  CATEGORIES: "Categories",
};

function normalizePicacgBaseUrl(rawValue, fallbackValue) {
  const fallback =
    typeof fallbackValue === "string" ? String(fallbackValue).trim() : "";
  const raw =
    typeof rawValue === "string" && rawValue.trim()
      ? rawValue.trim()
      : fallback;
  return String(raw || "").replace(/\/+$/, "");
}

function buildPicacgEndpointUrl(baseUrl, endpointPath) {
  const root = normalizePicacgBaseUrl(baseUrl);
  const path = String(endpointPath || "").replace(/^\/+/, "");
  if (!root) {
    return path;
  }
  if (!path) {
    return root;
  }
  return `${root}/${path}`;
}

function buildPicacgQueryString(entries) {
  const parts = [];
  for (const entry of entries || []) {
    if (!Array.isArray(entry) || entry.length < 2) {
      continue;
    }
    const key = entry[0];
    const value = entry[1];
    if (key == null || value == null) {
      continue;
    }
    parts.push(`${String(key)}=${String(value)}`);
  }
  return parts.join("&");
}

function buildPicacgPathWithQuery(path, entries) {
  const query = buildPicacgQueryString(entries);
  return query ? `${String(path || "")}?${query}` : String(path || "");
}

function createPicacgRequest(path, signaturePath) {
  const requestPath = String(path || "");
  return {
    path: requestPath,
    signaturePath:
      signaturePath == null ? requestPath : String(signaturePath || ""),
  };
}

function resolvePicacgTagAction(namespace, tag, options) {
  const config =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const authorNamespace =
    config.authorNamespace || PICACG_TAG_NAMESPACES.AUTHOR;
  const categoryNamespace =
    config.categoryNamespace || PICACG_TAG_NAMESPACES.CATEGORIES;

  if (namespace === authorNamespace) {
    return {
      action: "category",
      keyword: tag,
      param: "a",
    };
  }
  if (namespace === categoryNamespace) {
    return {
      action: "category",
      keyword: tag,
      param: "c",
    };
  }
  return {
    action: "search",
    keyword: tag,
  };
}

function createPicacgRouteHelpers(options) {
  const config =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const rankingCategory =
    config.rankingCategory || PICACG_RANKING_CATEGORY;

  return {
    authSignInRequest: () =>
      createPicacgRequest(PICACG_ENDPOINT_PATHS.AUTH_SIGN_IN),
    randomComicsRequest: () =>
      createPicacgRequest(PICACG_ENDPOINT_PATHS.COMICS_RANDOM),
    latestComicsRequest: ({ page, sort }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [
          ["page", page],
          ["s", sort],
        ]),
      ),
    leaderboardRequest: ({ option, categoryType }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_LEADERBOARD, [
          ["tt", option],
          ["ct", categoryType == null ? rankingCategory : categoryType],
        ]),
      ),
    categoryComicsRequest: ({ page, type, category, sort }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [
          ["page", page],
          [type || "c", category],
          ["s", sort],
        ]),
      ),
    advancedSearchRequest: ({ page }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_ADVANCED_SEARCH, [
          ["page", page],
        ]),
      ),
    comicFavoriteRequest: ({ comicId }) =>
      createPicacgRequest(
        `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/favourite`,
      ),
    userFavoritesRequest: ({ page, sort }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.USERS_FAVOURITE, [
          ["page", page],
          ["s", sort],
        ]),
      ),
    comicInfoRequest: ({ comicId }) =>
      createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}`),
    comicEpsRequest: ({ comicId, page }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(
          `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/eps`,
          [["page", page]],
        ),
      ),
    comicRecommendationRequest: ({ comicId }) =>
      createPicacgRequest(
        `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/recommendation`,
      ),
    comicEpPagesRequest: ({ comicId, epId, page }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(
          `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/order/${epId}/pages`,
          [["page", page]],
        ),
      ),
    comicLikeRequest: ({ comicId }) =>
      createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/like`),
    commentChildrenRequest: ({ replyTo, page }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(
          `${PICACG_ENDPOINT_PATHS.COMMENTS}/${replyTo}/childrens`,
          [["page", page]],
        ),
      ),
    comicCommentsRequest: ({ comicId, page }) =>
      createPicacgRequest(
        buildPicacgPathWithQuery(
          `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/comments`,
          [["page", page]],
        ),
      ),
    commentReplyRequest: ({ replyTo }) =>
      createPicacgRequest(
        `${PICACG_ENDPOINT_PATHS.COMMENTS}/${replyTo}`,
        `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${replyTo}`,
      ),
    comicCommentRequest: ({ comicId }) =>
      createPicacgRequest(
        `${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/comments`,
        `/${PICACG_ENDPOINT_PATHS.COMICS}/${comicId}/comments`,
      ),
    commentLikeRequest: ({ commentId }) =>
      createPicacgRequest(
        `${PICACG_ENDPOINT_PATHS.COMMENTS}/${commentId}/like`,
        `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${commentId}/like`,
      ),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction,
  };
}
