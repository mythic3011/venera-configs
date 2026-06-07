import { getRuntimeDocument } from "../../http/index.js";

const MH_LIKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0";
const MH_LIKE_ENDPOINT_PATHS = {
  CATEGORY_PAGE_SEGMENT: "/page",
  SEARCH: "/s",
  CHAPTER_LIST: "/manga/get",
  CHAPTER_INFO: "/chapter/getinfo",
  CHAPTER_CONTENT: "/chapter/getcontent",
};

function normalizeMhLikeId(value) {
  return String(value || "").trim();
}

function normalizeMhLikeDomain(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

function buildMhLikeBaseUrl(value) {
  return `https://${normalizeMhLikeDomain(value)}`;
}

function buildMhLikeHeaders(baseUrl) {
  return {
    "User-Agent": MH_LIKE_USER_AGENT,
    Referer: String(baseUrl || ""),
  };
}

function normalizeMhLikePath(value, fallback) {
  let path = String(value == null ? fallback || "" : value).trim();
  if (!path) {
    path = String(fallback || "");
  }
  if (!path) {
    return "";
  }
  path = path.replace(/\/+$/, "");
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
}

function buildMhLikeRelativeUrl(baseUrl, relativePath) {
  const root = String(baseUrl || "").replace(/\/+$/, "");
  const path = String(relativePath || "").trim();
  if (!path) {
    return root;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${root}${path}`;
  }
  return `${root}/${path}`;
}

function buildMhLikeApiBaseUrl(domain, apiRootPath) {
  return buildMhLikeRelativeUrl(
    buildMhLikeBaseUrl(domain),
    normalizeMhLikePath(apiRootPath, "/api"),
  );
}

function buildMhLikeCategoryUrl(config) {
  const options = config || {};
  const categoryPath = String(options.categoryPath || "").replace(/\/+$/, "");
  const pageSegment = normalizeMhLikePath(
    options.pageSegment,
    MH_LIKE_ENDPOINT_PATHS.CATEGORY_PAGE_SEGMENT,
  );
  return buildMhLikeRelativeUrl(
    options.baseUrl,
    `${categoryPath}${pageSegment}/${options.page}`,
  );
}

function buildMhLikeSearchUrl(config) {
  const options = config || {};
  const searchPath = normalizeMhLikePath(
    options.searchPath,
    MH_LIKE_ENDPOINT_PATHS.SEARCH,
  );
  const keyword = encodeURIComponent(
    String(options.keyword == null ? "" : options.keyword),
  );
  return buildMhLikeRelativeUrl(
    options.baseUrl,
    `${searchPath}/${keyword}?page=${options.page}`,
  );
}

function buildMhLikeChapterListUrl(config) {
  const options = config || {};
  const chapterListPath = normalizeMhLikePath(
    options.chapterListPath,
    MH_LIKE_ENDPOINT_PATHS.CHAPTER_LIST,
  );
  const mode = options.mode == null ? "all" : options.mode;
  const timestamp = options.timestamp == null ? Date.now() : options.timestamp;
  return buildMhLikeRelativeUrl(
    options.baseUrl,
    `${chapterListPath}?mid=${options.mangaId}&mode=${mode}&t=${timestamp}`,
  );
}

function buildMhLikeChapterEndpointUrl(config) {
  const options = config || {};
  const chapterPath = normalizeMhLikePath(options.chapterPath, "");
  return buildMhLikeRelativeUrl(
    options.baseUrl,
    `${chapterPath}?m=${options.mangaId}&c=${options.chapterId}`,
  );
}

function buildMhLikeChapterInfoUrl(config) {
  const options = config || {};
  return buildMhLikeChapterEndpointUrl({
    baseUrl: options.baseUrl,
    chapterPath:
      options.chapterPath == null
        ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_INFO
        : options.chapterPath,
    mangaId: options.mangaId,
    chapterId: options.chapterId,
  });
}

function buildMhLikeChapterContentUrl(config) {
  const options = config || {};
  return buildMhLikeChapterEndpointUrl({
    baseUrl: options.baseUrl,
    chapterPath:
      options.chapterPath == null
        ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_CONTENT
        : options.chapterPath,
    mangaId: options.mangaId,
    chapterId: options.chapterId,
  });
}

function createMhLikeRouteHelpers(config) {
  const options = config || {};
  return {
    buildCategoryUrl: ({ categoryPath, page }) =>
      buildMhLikeCategoryUrl({
        baseUrl: options.baseUrl,
        categoryPath,
        page,
        pageSegment: options.categoryPageSegment,
      }),
    buildSearchUrl: ({ keyword, page }) =>
      buildMhLikeSearchUrl({
        baseUrl: options.baseUrl,
        keyword,
        page,
        searchPath: options.searchPath,
      }),
    buildChapterListUrl: ({ mangaId, timestamp, mode }) =>
      buildMhLikeChapterListUrl({
        baseUrl: options.baseUrl,
        mangaId,
        timestamp,
        mode,
        chapterListPath: options.chapterListPath,
      }),
    buildChapterInfoUrl: ({ mangaId, chapterId }) =>
      buildMhLikeChapterInfoUrl({
        baseUrl: options.baseUrl,
        mangaId,
        chapterId,
        chapterPath: options.chapterInfoPath,
      }),
    buildChapterContentUrl: ({ mangaId, chapterId }) =>
      buildMhLikeChapterContentUrl({
        baseUrl: options.baseUrl,
        mangaId,
        chapterId,
        chapterPath: options.chapterContentPath,
      }),
  };
}

function parseMhLikeComicCards(root) {
  const result = [];
  if (!root) {
    return result;
  }
  for (let item of root.querySelectorAll(".pb-2")) {
    result.push(
      new Comic({
        id: item.querySelector("a").attributes.href,
        title: item.querySelector("h3").text,
        cover: item.querySelector("img").attributes.src,
      }),
    );
  }
  return result;
}

function parseMhLikeHomeSections(document, parseComics) {
  const result = [{ title: "近期更新", comics: [], viewMore: null }];

  const recentListRoot = document.querySelector(".pb-unit-md");
  if (recentListRoot) {
    for (let item of recentListRoot.querySelectorAll(".slicarda")) {
      result[0].comics.push(
        new Comic({
          id: item.attributes.href,
          title: item.querySelector("h3").text,
          cover: item.querySelector("img").attributes.src,
        }),
      );
    }
  }

  const cardlists = document.querySelectorAll(".cardlist");
  const hometitles = document.querySelectorAll(".hometitle");
  for (let i = 0; i < hometitles.length; i += 1) {
    const titleNode = hometitles[i].querySelector("h2");
    result.push({
      title: titleNode.text,
      comics: parseComics(cardlists[i]),
      viewMore: {
        page: "category",
        attributes: {
          category: titleNode.text,
          param: hometitles[i].attributes.href,
        },
      },
    });
  }

  return result;
}

function parseMhLikeMaxPage(document) {
  try {
    return parseInt(
      document
        .querySelectorAll("button.text-small")
        .pop()
        .text.replaceAll("\n", "")
        .replaceAll(" ", ""),
      10,
    );
  } catch (_) {
    return 1;
  }
}

function parseMhLikeDetailTags(document) {
  const infos = document.querySelectorAll("div.py-1");
  const tags = { 作者: [], 类型: [], 标签: [] };

  for (let author of infos[0].querySelectorAll("a > span")) {
    let authorName = author.text.trim();
    if (authorName.endsWith(",")) {
      authorName = authorName.slice(0, -1).trim();
    }
    tags["作者"].push(authorName);
  }

  for (let category of infos[1].querySelectorAll("a > span")) {
    let categoryName = category.text.trim();
    if (categoryName.endsWith(",")) {
      categoryName = categoryName.slice(0, -1).trim();
    }
    tags["类型"].push(categoryName);
  }

  for (let tag of infos[2].querySelectorAll("a")) {
    tags["标签"].push(
      tag.text.replace("\n", "").replaceAll(" ", "").replace("#", ""),
    );
  }

  return tags;
}

function parseMhLikeRecommendComics(document) {
  const result = [];
  for (let item of document.querySelectorAll("div.cardlist > div.pb-2")) {
    result.push(
      new Comic({
        id: item.querySelector("a").attributes.href,
        title: item.querySelector("h3").text,
        cover: item.querySelector("img").attributes.src,
      }),
    );
  }
  return result;
}

async function loadMhLikePagedComicsFromUrl(config) {
  const document = await getRuntimeDocument(
    config.requestUrl,
    config.headers,
    config.context,
  );
  return {
    comics: config.parseComics(document),
    maxPage: parseMhLikeMaxPage(document),
  };
}

function createMhLikeExploreFeature(config) {
  return {
    title: config.title,
    type: "multiPartPage",
    load: async () => {
      const document = await getRuntimeDocument(
        config.getBaseUrl(),
        config.getHeaders(),
        config.context || "mh_like home",
      );
      return parseMhLikeHomeSections(document, config.parseComics);
    },
  };
}

function createMhLikeCategoryLoadFeature(config) {
  return async (category, params, options, page) => {
    const requestUrl = config.buildRequestUrl
      ? config.buildRequestUrl({ category, params, options, page })
      : buildMhLikeCategoryUrl({
          baseUrl: config.getBaseUrl(),
          categoryPath: params,
          page,
          pageSegment: config.categoryPageSegment,
        });
    return loadMhLikePagedComicsFromUrl({
      requestUrl,
      headers: config.getHeaders(),
      parseComics: config.parseComics,
      context: config.context || "mh_like category",
    });
  };
}

function createMhLikeSearchLoadFeature(config) {
  return async (keyword, options, page) => {
    const requestUrl = config.buildRequestUrl
      ? config.buildRequestUrl({ keyword, options, page })
      : buildMhLikeSearchUrl({
          baseUrl: config.getBaseUrl(),
          keyword,
          page,
          searchPath: config.searchPath,
        });
    return loadMhLikePagedComicsFromUrl({
      requestUrl,
      headers: config.getHeaders(),
      parseComics: config.parseComics,
      context: config.context || "mh_like search",
    });
  };
}

async function loadMhLikeBaseComicInfo(config) {
  const document = await getRuntimeDocument(
    config.detailUrl,
    config.headers,
    config.context || "mh_like comic detail",
  );

  const title = document
    .querySelector(".text-xl")
    .text.trim()
    .split("   ")[0];
  const cover = document.querySelector(".object-cover").attributes.src;
  const description = document.querySelector("p.text-medium").text;

  return {
    document,
    title,
    cover,
    description,
    tags: parseMhLikeDetailTags(document),
    recommend: parseMhLikeRecommendComics(document),
    mangaId: document.querySelector("#mangachapters").attributes["data-mid"],
  };
}

function createMhLikeCategoryRequestUrlBuilder(config) {
  const options = config || {};
  return ({ params, page }) =>
    buildMhLikeCategoryUrl({
      baseUrl: options.getBaseUrl(),
      categoryPath: params,
      page,
      pageSegment: options.categoryPageSegment,
    });
}

function createMhLikeSearchRequestUrlBuilder(config) {
  const options = config || {};
  return ({ keyword, page }) =>
    buildMhLikeSearchUrl({
      baseUrl: options.getBaseUrl(),
      keyword,
      page,
      searchPath: options.searchPath,
    });
}

function createMhLikeChapterRequestUrlBuilders(config) {
  const options = config || {};
  return {
    buildChapterListRequestUrl: ({ mangaId, timestamp, mode }) =>
      buildMhLikeChapterListUrl({
        baseUrl: options.getBaseUrl(),
        mangaId,
        timestamp,
        mode,
        chapterListPath: options.chapterListPath,
      }),
    buildChapterInfoRequestUrl: ({ mangaId, chapterId }) =>
      buildMhLikeChapterInfoUrl({
        baseUrl: options.getBaseUrl(),
        mangaId,
        chapterId,
        chapterPath: options.chapterInfoPath,
      }),
    buildChapterContentRequestUrl: ({ mangaId, chapterId }) =>
      buildMhLikeChapterContentUrl({
        baseUrl: options.getBaseUrl(),
        mangaId,
        chapterId,
        chapterPath: options.chapterContentPath,
      }),
  };
}

function buildMhLikeChapterUrl(baseUrl, chapterId) {
  return `${String(baseUrl || "").replace(/\/+$/, "")}/${normalizeMhLikeId(
    chapterId,
  )}`;
}

function createMhLikeExplorePageFeature(config) {
  return createMhLikeExploreFeature(config);
}

function createMhLikeCategoryLoaderFeature(config) {
  return createMhLikeCategoryLoadFeature(config);
}

function createMhLikeSearchLoaderFeature(config) {
  return createMhLikeSearchLoadFeature(config);
}

function loadMhLikeBaseComicInfoFeature(config) {
  return loadMhLikeBaseComicInfo(config);
}

export {
  MH_LIKE_USER_AGENT,
  MH_LIKE_ENDPOINT_PATHS,
  normalizeMhLikeId,
  normalizeMhLikeDomain,
  buildMhLikeBaseUrl,
  buildMhLikeHeaders,
  normalizeMhLikePath,
  buildMhLikeRelativeUrl,
  buildMhLikeApiBaseUrl,
  buildMhLikeCategoryUrl,
  buildMhLikeSearchUrl,
  buildMhLikeChapterListUrl,
  buildMhLikeChapterEndpointUrl,
  buildMhLikeChapterInfoUrl,
  buildMhLikeChapterContentUrl,
  createMhLikeRouteHelpers,
  parseMhLikeComicCards,
  parseMhLikeHomeSections,
  parseMhLikeMaxPage,
  parseMhLikeDetailTags,
  parseMhLikeRecommendComics,
  loadMhLikePagedComicsFromUrl,
  createMhLikeExploreFeature,
  createMhLikeCategoryLoadFeature,
  createMhLikeSearchLoadFeature,
  loadMhLikeBaseComicInfo,
  createMhLikeCategoryRequestUrlBuilder,
  createMhLikeSearchRequestUrlBuilder,
  createMhLikeChapterRequestUrlBuilders,
  buildMhLikeChapterUrl,
  createMhLikeExplorePageFeature,
  createMhLikeCategoryLoaderFeature,
  createMhLikeSearchLoaderFeature,
  loadMhLikeBaseComicInfoFeature,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature,
  };
}
