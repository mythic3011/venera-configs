async function loadMhLikePagedComicsFromUrl(config) {
  const document = await getRuntimeDocument(config.requestUrl, config.headers, config.context);
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

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
  };
}
