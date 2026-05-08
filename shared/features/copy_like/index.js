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
    `${config.apiUrl}${config.endpoint || "/api/v3/h5/homeIndex"}`,
    config.headers,
    config.context || "copy_like home",
  );
  return buildCopyLikeHomeSections(payload, config.sections || [], config.parseComic);
}

async function loadCopyLikeListModule(config) {
  const payload = await getRuntimeJson(
    config.requestUrl,
    config.headers,
    config.context || "copy_like list",
  );
  const list = readCopyLikePath(payload, config.listPath || ["results", "list"], []);
  const total = readCopyLikePath(payload, config.totalPath || ["results", "total"], 0);
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

function createCopyLikeExploreFeature(config) {
  return {
    title: config.title,
    type: "singlePageWithMultiPart",
    load: async () =>
      loadCopyLikeHomeSectionsModule({
        apiUrl: config.getApiUrl(),
        headers: config.getHeaders(),
        parseComic: config.parseComic,
        sections: config.sections,
        endpoint: config.endpoint,
        context: config.context,
      }),
  };
}

function createCopyLikeCategoryLoadFeature(config) {
  return async (category, param, options, page) => {
    const requestUrl = config.buildRequestUrl({
      category,
      param,
      options,
      page,
    });
    return loadCopyLikeListModule({
      requestUrl,
      headers: config.getHeaders(),
      parseComic: config.parseComic,
      context: config.context,
      listPath: config.listPath,
      totalPath: config.totalPath,
      maxPageDivisor: config.maxPageDivisor,
    });
  };
}

function createCopyLikeSearchLoadFeature(config) {
  return async (keyword, options, page) =>
    loadCopyLikeSearchModule({
      keyword,
      options,
      page,
      headers: config.getHeaders(),
      parseComic: config.parseComic,
      resolveAuthorPathWord: config.resolveAuthorPathWord,
      buildAuthorRequestUrl: config.buildAuthorRequestUrl,
      buildKeywordRequestUrl: config.buildKeywordRequestUrl,
      context: config.context,
      listPath: config.listPath,
      totalPath: config.totalPath,
      maxPageDivisor: config.maxPageDivisor,
    });
}

function createCopyLikeCategoryRequestUrlBuilder(config) {
  return ({ category, param, options, page }) => {
    const safeOptions = Array.isArray(options) ? options : [];
    const normalizedOptions =
      config.normalizeOptions === false ? safeOptions : normalizeStarOptions(safeOptions);
    const apiUrl = config.getApiUrl();

    if (typeof config.isRankingCategory === "function" && config.isRankingCategory(category, param)) {
      return buildCopyLikeRankingUrl({
        apiUrl,
        page,
        limit: config.rankingLimit == null ? 30 : config.rankingLimit,
        freeType: config.rankingFreeType,
        audienceType:
          config.rankingAudienceOptionIndex == null
            ? undefined
            : safeOptions[config.rankingAudienceOptionIndex],
        region:
          config.rankingRegionOptionIndex == null
            ? undefined
            : safeOptions[config.rankingRegionOptionIndex],
        dateType:
          config.rankingDateOptionIndex == null
            ? undefined
            : safeOptions[config.rankingDateOptionIndex],
      });
    }

    if (typeof config.isHomepageCategory === "function" && config.isHomepageCategory(category, param)) {
      return buildCopyLikeHomeIndexComicsUrl({
        apiUrl,
        page,
        limit: config.homepageLimit == null ? 20 : config.homepageLimit,
        top: param,
        ordering:
          config.homepageOrderingOptionIndex == null
            ? undefined
            : safeOptions[config.homepageOrderingOptionIndex],
      });
    }

    const mappedParam = normalizeCopyLikeCategoryParam(category, config.categoryParamMap, param);
    return buildCopyLikeComicsUrl({
      apiUrl,
      page,
      limit: config.themedLimit == null ? 30 : config.themedLimit,
      freeType: config.themedFreeType,
      ordering:
        config.themedOrderingOptionIndex == null
          ? undefined
          : normalizedOptions[config.themedOrderingOptionIndex],
      theme: mappedParam || "",
      top:
        config.themedTopOptionIndex == null
          ? undefined
          : normalizedOptions[config.themedTopOptionIndex],
    });
  };
}

function createCopyLikeSearchRequestUrlBuilders(config) {
  return {
    buildAuthorRequestUrl: ({ pathWord, page }) =>
      buildCopyLikeComicsUrl({
        apiUrl: config.getApiUrl(),
        page,
        limit: config.authorLimit == null ? 30 : config.authorLimit,
        ordering: config.authorOrdering || "-datetime_updated",
        author: pathWord,
      }),
    buildKeywordRequestUrl: ({ keyword, options, page }) => {
      const safeOptions = Array.isArray(options) ? options : [];
      const queryType =
        config.queryTypeOptionIndex == null
          ? config.queryTypeDefault
          : safeOptions[config.queryTypeOptionIndex] != null
            ? safeOptions[config.queryTypeOptionIndex]
            : config.queryTypeDefault;
      return buildCopyLikeSearchUrl({
        apiUrl: config.getApiUrl(),
        endpointPath:
          typeof config.getKeywordEndpointPath === "function"
            ? config.getKeywordEndpointPath()
            : config.keywordEndpointPath,
        page,
        limit: config.keywordLimit == null ? 20 : config.keywordLimit,
        keyword,
        queryType,
        platform: config.keywordPlatform,
        freeType: config.keywordFreeType,
        update: config.keywordUpdate,
      });
    },
  };
}

function createCopyLikeDetailTagMapper(config) {
  const settings = config || {};
  return (comicData) => buildCopyLikeDetailTagMap(comicData, settings);
}

function createCopyLikeTagClickActionHandler(config) {
  const settings = config || {};
  return (namespace, tag) => resolveCopyLikeTagAction(namespace, tag, settings);
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule,
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
  };
}
