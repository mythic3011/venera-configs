import { getRuntimeJson, joinRawQueryEntries } from "../../http/index.js";
import { readCopyLikePath, computeCopyLikeMaxPage } from "../../parser/index.js";
import { buildOffsetByPage } from "../source/paging.js";

function normalizeCopyLikeBaseUrl(baseUrl, fallbackHost) {
  const fallback = String(fallbackHost || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  let value = String(baseUrl || "").trim();
  if (!value) {
    return fallback;
  }
  value = value
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const slashIndex = value.indexOf("/");
  if (slashIndex >= 0) {
    value = value.slice(0, slashIndex);
  }
  return value || fallback;
}

function buildCopyLikeApiUrl(baseUrl, fallbackHost) {
  return `https://${normalizeCopyLikeBaseUrl(baseUrl, fallbackHost)}`;
}

function buildCopyLikePageUrl(baseUrl, page) {
  const pagePart = Number(page) > 1 ? `?page=${page}` : "";
  return `${normalizeCopyLikeBaseUrl(baseUrl)}${pagePart}`;
}

function buildCopyLikeTokenHeader(token) {
  const normalized = token ? ` ${token}` : "";
  return `Token${normalized}`;
}

function buildCopyLikeBearerTokenHeader(token) {
  return token ? `Token ${token}` : "";
}

function buildCopyLikeRequestSigningMeta(nowMs) {
  const now = new Date(nowMs == null ? Date.now() : nowMs);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const ts = String(Math.floor(now.getTime() / 1000));
  return {
    dt: `${year}.${month}.${day}`,
    ts,
  };
}

function buildCopyLikeHmacSignature(secretBase64, timestampSeconds) {
  return Convert.hmacString(
    Convert.decodeBase64(secretBase64),
    Convert.encodeUtf8(String(timestampSeconds || "")),
    "sha256",
  );
}

const COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION = "1.3.0";
const COPY_LIKE_LOGIN_EXPIRED = "Login expired";
const COPY_LIKE_RETRY_ERROR = "Retry";
const COPY_LIKE_CHAPTER_RETRY_LIMIT = 5;
const COPY_LIKE_CHAPTER_RATE_LIMIT_STATUS = 210;
const COPY_LIKE_CHAPTER_DEFAULT_WAIT_MS = 40000;
const COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE = 100;

function isCopyLikeAppVersionAfter(current, target) {
  const currentArr = current.split(".");
  const targetArr = target.split(".");
  for (let i = 0; i < 3; i++) {
    if (parseInt(currentArr[i]) < parseInt(targetArr[i])) {
      return false;
    }
  }
  return true;
}

function copyLikeStatusError(status) {
  return `Invalid status code: ${status}`;
}

async function loadCopyLikeFavoriteStatus(config) {
  const options = config || {};
  const res = await Network.get(
    buildCopyLikeComicQueryUrl({ apiUrl: options.apiUrl, id: options.id }),
    options.headers,
  );
  if (res.status !== 200) {
    throw copyLikeStatusError(res.status);
  }
  return JSON.parse(res.body).results.collect != null;
}

async function updateCopyLikeFavorite(config) {
  const options = config || {};
  const requestId = options.getRequestId
    ? await options.getRequestId()
    : undefined;
  const comicData = await Network.get(
    buildCopyLikeComicDetailUrl({
      apiUrl: options.apiUrl,
      id: options.comicId,
      inMainland: true,
      requestId,
      platform: 3,
    }),
    options.getHeaders ? options.getHeaders() : options.headers,
  );
  if (comicData.status !== 200) {
    throw copyLikeStatusError(comicData.status);
  }
  const comicId = JSON.parse(comicData.body).results.comic.uuid;
  const response = await Network.post(
    buildCopyLikeEndpointUrl(
      options.apiUrl,
      COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMIC_ACTION,
    ),
    withCopyLikeFormHeaders(
      options.getHeaders ? options.getHeaders() : options.headers,
    ),
    `comic_id=${comicId}&is_collect=${options.isAdding ? 1 : 0}&authorization=Token+${options.token}`,
  );
  if (response.status === 401) throw COPY_LIKE_LOGIN_EXPIRED;
  if (response.status !== 200) {
    throw copyLikeStatusError(response.status);
  }
  return "ok";
}

async function loadCopyLikeGroupChapters(config) {
  const options = config || {};
  const keys = Object.keys(options.groups);
  const result = {};
  const getHeaders = () =>
    options.getHeaders ? options.getHeaders() : options.headers;
  await Promise.all(
    keys.map(async (group) => {
      const groupPath = options.groups[group].path_word;
      const requestId = options.getRequestId
        ? await options.getRequestId()
        : undefined;
      let res = await Network.get(
        buildCopyLikeGroupChaptersUrl({
          apiUrl: options.apiUrl,
          id: options.id,
          groupPath,
          limit: COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE,
          offset: 0,
          inMainland: options.inMainland,
          requestId,
        }),
        getHeaders(),
      );
      if (res.status !== 200) {
        throw copyLikeStatusError(res.status);
      }
      let data = JSON.parse(res.body);
      const eps = new Map();
      const append = (rows) => {
        rows.forEach((episode) => eps.set(episode.uuid, episode.name));
      };
      append(data.results.list);
      const maxChapter = data.results.total;
      let offset = COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE;
      while (offset < maxChapter) {
        res = await Network.get(
          buildCopyLikeGroupChaptersUrl({
            apiUrl: options.apiUrl,
            id: options.id,
            groupPath,
            limit: COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE,
            offset,
          }),
          getHeaders(),
        );
        if (res.status !== 200) {
          throw copyLikeStatusError(res.status);
        }
        data = JSON.parse(res.body);
        append(data.results.list);
        offset += COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE;
      }
      result[group] = eps;
    }),
  );

  if (
    isCopyLikeAppVersionAfter(
      options.appVersion,
      COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION,
    )
  ) {
    const sortedResult = new Map();
    for (const key of keys) {
      sortedResult.set(options.groups[key].name, result[key]);
    }
    return sortedResult;
  }
  const merged = new Map();
  for (const key of keys) {
    for (const [id, title] of result[key]) merged.set(id, title);
  }
  return merged;
}

async function loadCopyLikeChapterData(config) {
  const options = config || {};
  let attempt = 0;
  while (attempt < COPY_LIKE_CHAPTER_RETRY_LIMIT) {
    try {
      const requestId = options.getRequestId
        ? await options.getRequestId()
        : options.requestId;
      const res = await Network.get(
        buildCopyLikeChapterUrl({
          apiUrl: options.apiUrl,
          comicId: options.comicId,
          chapterId: options.chapterId,
          chapterEndpoint: options.chapterEndpoint,
          inMainland: options.inMainland,
          requestId,
          platform: options.platform,
          update: options.update,
        }),
        { ...(options.getHeaders ? options.getHeaders() : options.headers || {}) },
      );
      if (res.status === COPY_LIKE_CHAPTER_RATE_LIMIT_STATUS) {
        let waitTime = COPY_LIKE_CHAPTER_DEFAULT_WAIT_MS;
        try {
          const responseBody = JSON.parse(res.body);
          if (
            responseBody.message &&
            responseBody.message.includes("Expected available in")
          ) {
            const match = responseBody.message.match(/(\d+)\s*seconds/);
            if (match && match[1]) waitTime = parseInt(match[1]) * 1000;
          }
        } catch (_) {
          console.log("Unable to parse wait time, using default wait time 40s");
        }
        console.log(
          `Chapter${options.chapterId} access too frequent, waiting ${waitTime / 1000}s`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        throw COPY_LIKE_RETRY_ERROR;
      }
      if (res.status !== 200) {
        throw copyLikeStatusError(res.status);
      }
      const data = JSON.parse(res.body);
      return options.mapResponse ? options.mapResponse(data) : data;
    } catch (error) {
      if (error !== COPY_LIKE_RETRY_ERROR) throw error;
      attempt += 1;
      if (attempt >= COPY_LIKE_CHAPTER_RETRY_LIMIT) throw error;
    }
  }
}

const COPY_LIKE_ENDPOINT_PATHS = {
  LOGIN: "/api/v3/login",
  RANKS: "/api/v3/ranks",
  COMICS: "/api/v3/comics",
  SEARCH_COMIC: "/api/v3/search/comic",
  HOME_INDEX: "/api/v3/h5/homeIndex",
  HOME_INDEX_COMICS: "/api/v3/h5/homeIndex/comics",
  FAVORITE_COMICS: "/api/v3/member/collect/comics",
  FAVORITE_COMIC_ACTION: "/api/v3/member/collect/comic",
  COMMENTS: "/api/v3/comments",
  COMMENT_ACTION: "/api/v3/member/comment",
  ROASTS: "/api/v3/roasts",
  ROAST_ACTION: "/api/v3/member/roast",
  COMIC_DETAIL_PREFIX: "/api/v3/comic2/",
  COMIC_GROUP_PREFIX: "/api/v3/comic/",
};

const COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE =
  "application/x-www-form-urlencoded;charset=utf-8";

function withCopyLikeFormHeaders(headers) {
  return {
    ...(headers || {}),
    "Content-Type": COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
  };
}

function buildCopyLikeEndpointUrl(apiUrl, endpointPath) {
  const root = String(apiUrl || "").replace(/\/+$/, "");
  const endpoint = String(endpointPath || "");
  if (!endpoint) {
    return root;
  }
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  if (endpoint.startsWith("/")) {
    return `${root}${endpoint}`;
  }
  return `${root}/${endpoint}`;
}

function buildCopyLikeQueryString(entries) {
  return joinRawQueryEntries(entries);
}

function buildCopyLikeUrlWithQuery(apiUrl, endpointPath, entries) {
  const url = buildCopyLikeEndpointUrl(apiUrl, endpointPath);
  const query = buildCopyLikeQueryString(entries);
  return query ? `${url}?${query}` : url;
}

function buildCopyLikeRankingUrl(config) {
  const options = config || {};
  return buildCopyLikeUrlWithQuery(options.apiUrl, COPY_LIKE_ENDPOINT_PATHS.RANKS, [
    ["free_type", options.freeType],
    ["limit", options.limit == null ? 30 : options.limit],
    [
      "offset",
      options.offset == null
        ? buildOffsetByPage(
            options.page,
            options.limit == null ? 30 : options.limit,
          )
        : options.offset,
    ],
    ["_update", options.update == null ? true : options.update],
    ["type", options.type == null ? 1 : options.type],
    ["audience_type", options.audienceType],
    ["region", options.region],
    ["date_type", options.dateType],
  ]);
}

function buildCopyLikeComicsUrl(config) {
  const options = config || {};
  const limit = options.limit == null ? 30 : options.limit;
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    options.endpointPath || COPY_LIKE_ENDPOINT_PATHS.COMICS,
    [
      ["free_type", options.freeType],
      ["limit", limit],
      [
        "offset",
        options.offset == null
          ? buildOffsetByPage(options.page, limit)
          : options.offset,
      ],
      ["ordering", options.ordering],
      ["theme", options.theme],
      ["top", options.top],
      ["author", options.author],
      ["q", options.keyword],
      ["q_type", options.queryType],
      ["platform", options.platform],
      ["_update", options.update],
    ],
  );
}

function buildCopyLikeSearchUrl(config) {
  const options = config || {};
  const limit = options.limit == null ? 20 : options.limit;
  const keyword =
    options.keyword == null ? "" : encodeURIComponent(String(options.keyword));
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    options.endpointPath || COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC,
    [
      ["platform", options.platform],
      ["q", keyword],
      ["limit", limit],
      [
        "offset",
        options.offset == null
          ? buildOffsetByPage(options.page, limit)
          : options.offset,
      ],
      ["free_type", options.freeType],
      ["_update", options.update],
      ["q_type", options.queryType],
    ],
  );
}

function buildCopyLikeHomeIndexComicsUrl(config) {
  const options = config || {};
  const limit = options.limit == null ? 20 : options.limit;
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    options.endpointPath || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX_COMICS,
    [
      ["limit", limit],
      [
        "offset",
        options.offset == null
          ? buildOffsetByPage(options.page, limit)
          : options.offset,
      ],
      ["top", options.top],
      ["ordering", options.ordering],
    ],
  );
}

function buildCopyLikeFavoriteComicsUrl(config) {
  const options = config || {};
  const limit = options.limit == null ? 30 : options.limit;
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    options.endpointPath || COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMICS,
    [
      ["limit", limit],
      [
        "offset",
        options.offset == null
          ? buildOffsetByPage(options.page, limit)
          : options.offset,
      ],
      ["free_type", options.freeType],
      ["ordering", options.ordering],
    ],
  );
}

function buildCopyLikeComicDetailUrl(config) {
  const options = config || {};
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${options.id}`,
    [
      ["in_mainland", options.inMainland],
      ["request_id", options.requestId],
      ["platform", options.platform],
    ],
  );
}

function buildCopyLikeComicQueryUrl(config) {
  const options = config || {};
  return buildCopyLikeEndpointUrl(
    options.apiUrl,
    `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${options.id}/query`,
  );
}

function buildCopyLikeGroupChaptersUrl(config) {
  const options = config || {};
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${options.id}/group/${options.groupPath}/chapters`,
    [
      ["limit", options.limit == null ? 100 : options.limit],
      ["offset", options.offset == null ? 0 : options.offset],
      ["in_mainland", options.inMainland],
      ["request_id", options.requestId],
    ],
  );
}

function buildCopyLikeChapterUrl(config) {
  const options = config || {};
  const chapterEndpoint = options.chapterEndpoint || "chapter2";
  return buildCopyLikeUrlWithQuery(
    options.apiUrl,
    `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${options.comicId}/${chapterEndpoint}/${options.chapterId}`,
    [
      ["in_mainland", options.inMainland],
      ["request_id", options.requestId],
      ["platform", options.platform],
      ["_update", options.update],
    ],
  );
}

function normalizeCopyLikeCategoryParam(category, categoryParamMap, fallbackParam) {
  if (category == null) {
    return fallbackParam;
  }
  const map = categoryParamMap || {};
  return map[category] || "";
}

function parseCopyLikeDetailAuthors(comicData) {
  if (!comicData || !Array.isArray(comicData.author)) {
    return [];
  }
  return comicData.author
    .map((item) => item && item.name)
    .filter((name) => name != null);
}

function parseCopyLikeDetailTags(comicData) {
  if (!comicData || !Array.isArray(comicData.theme)) {
    return [];
  }
  return comicData.theme
    .map((item) => item && item.name)
    .filter((name) => name != null);
}

function buildCopyLikeDetailTagMap(comicData, options) {
  const settings = options || {};
  const authorNamespace = settings.authorNamespace || "作者";
  const updateNamespace = settings.updateNamespace || "更新";
  const tagNamespace = settings.tagNamespace || "标签";
  const statusNamespace = settings.statusNamespace || "状态";
  const updateValue =
    comicData && comicData.datetime_updated ? comicData.datetime_updated : "";
  const statusValue =
    comicData && comicData.status && comicData.status.display
      ? comicData.status.display
      : "";
  return {
    [authorNamespace]: parseCopyLikeDetailAuthors(comicData),
    [updateNamespace]: [updateValue],
    [tagNamespace]: parseCopyLikeDetailTags(comicData),
    [statusNamespace]: [statusValue],
  };
}

function resolveCopyLikeTagAction(namespace, tag, options) {
  const settings = options || {};
  const categoryNamespace = settings.categoryNamespace || "标签";
  const authorNamespace = settings.authorNamespace || "作者";
  const unsupportedError = settings.unsupportedError || "未支持此类Tag检索";
  if (namespace === categoryNamespace) {
    return {
      action: "category",
      keyword: `${tag}`,
      param: null,
    };
  }
  if (namespace === authorNamespace) {
    return {
      action: "search",
      keyword: `${namespace}:${tag}`,
      param: null,
    };
  }
  throw unsupportedError;
}

function buildCopyLikeHomeSections(payload, sectionDefinitions, parseComic) {
  const result = {};
  for (const section of sectionDefinitions || []) {
    const list = readCopyLikePath(payload, section.path, []);
    result[section.title] = Array.isArray(list) ? list.map(parseComic) : [];
  }
  return result;
}

async function loadCopyLikeHomeSectionsModule(config) {
  const payload = await getRuntimeJson(
    `${config.apiUrl}${config.endpoint || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX}`,
    config.headers,
    config.context || "copy_like home",
  );
  return buildCopyLikeHomeSections(
    payload,
    config.sections || [],
    config.parseComic,
  );
}

async function loadCopyLikeListModule(config) {
  const payload = await getRuntimeJson(
    config.requestUrl,
    config.headers,
    config.context || "copy_like list",
  );
  const list = readCopyLikePath(
    payload,
    config.listPath || ["results", "list"],
    [],
  );
  const total = readCopyLikePath(
    payload,
    config.totalPath || ["results", "total"],
    0,
  );
  const comics = Array.isArray(list) ? list.map(config.parseComic) : [];
  return {
    comics,
    maxPage: computeCopyLikeMaxPage(total, config.maxPageDivisor || 21),
  };
}

function parseCopyLikeAuthorKeyword(keyword) {
  const value = String(keyword || "");
  if (!value.startsWith("作者:")) {
    return null;
  }
  return value.substring("作者:".length).trim();
}

async function loadCopyLikeSearchModule(config) {
  const authorName = parseCopyLikeAuthorKeyword(config.keyword);
  const pathWord = authorName ? config.resolveAuthorPathWord(authorName) : null;
  const requestUrl = pathWord
    ? config.buildAuthorRequestUrl({
        pathWord: encodeURIComponent(pathWord),
        page: config.page,
        keyword: config.keyword,
        options: config.options,
      })
    : config.buildKeywordRequestUrl({
        page: config.page,
        keyword: config.keyword,
        options: config.options,
      });

  return loadCopyLikeListModule({
    requestUrl,
    headers: config.headers,
    parseComic: config.parseComic,
    context: config.context || "copy_like search",
    listPath: config.listPath,
    totalPath: config.totalPath,
    maxPageDivisor: config.maxPageDivisor,
  });
}

export {
  COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION,
  COPY_LIKE_LOGIN_EXPIRED,
  copyLikeStatusError,
  isCopyLikeAppVersionAfter,
  loadCopyLikeFavoriteStatus,
  updateCopyLikeFavorite,
  loadCopyLikeGroupChapters,
  loadCopyLikeChapterData,
  normalizeCopyLikeBaseUrl,
  buildCopyLikeApiUrl,
  buildCopyLikePageUrl,
  buildCopyLikeTokenHeader,
  buildCopyLikeBearerTokenHeader,
  buildCopyLikeRequestSigningMeta,
  buildCopyLikeHmacSignature,
  COPY_LIKE_ENDPOINT_PATHS,
  COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
  withCopyLikeFormHeaders,
  buildCopyLikeEndpointUrl,
  buildCopyLikeQueryString,
  buildCopyLikeUrlWithQuery,
  buildCopyLikeRankingUrl,
  buildCopyLikeComicsUrl,
  buildCopyLikeSearchUrl,
  buildCopyLikeHomeIndexComicsUrl,
  buildCopyLikeFavoriteComicsUrl,
  buildCopyLikeComicDetailUrl,
  buildCopyLikeComicQueryUrl,
  buildCopyLikeGroupChaptersUrl,
  buildCopyLikeChapterUrl,
  normalizeCopyLikeCategoryParam,
  parseCopyLikeDetailAuthors,
  parseCopyLikeDetailTags,
  buildCopyLikeDetailTagMap,
  resolveCopyLikeTagAction,
  buildCopyLikeHomeSections,
  loadCopyLikeHomeSectionsModule,
  loadCopyLikeListModule,
  parseCopyLikeAuthorKeyword,
  loadCopyLikeSearchModule,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION,
    COPY_LIKE_LOGIN_EXPIRED,
    copyLikeStatusError,
    isCopyLikeAppVersionAfter,
    loadCopyLikeFavoriteStatus,
    updateCopyLikeFavorite,
    loadCopyLikeGroupChapters,
    loadCopyLikeChapterData,
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule,
  };
}
