import { normalizeStarOptions } from "../source/paging.js";
import {
  buildCopyLikeRankingUrl,
  buildCopyLikeHomeIndexComicsUrl,
  buildCopyLikeComicsUrl,
  buildCopyLikeSearchUrl,
  normalizeCopyLikeCategoryParam,
  buildCopyLikeDetailTagMap,
  resolveCopyLikeTagAction,
  loadCopyLikeHomeSectionsModule,
  loadCopyLikeListModule,
  loadCopyLikeSearchModule,
} from "./copy-like-core.js";

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
      config.normalizeOptions === false
        ? safeOptions
        : normalizeStarOptions(safeOptions);
    const apiUrl = config.getApiUrl();

    if (
      typeof config.isRankingCategory === "function" &&
      config.isRankingCategory(category, param)
    ) {
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

    if (
      typeof config.isHomepageCategory === "function" &&
      config.isHomepageCategory(category, param)
    ) {
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

    const mappedParam = normalizeCopyLikeCategoryParam(
      category,
      config.categoryParamMap,
      param,
    );
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

function createCopyLikeExploreSectionsFeature(config) {
  return createCopyLikeExploreFeature({
    title: config.title,
    sections: config.sections,
    endpoint: config.endpoint,
    parseComic: config.parseComic,
    context: config.context,
    getApiUrl: config.getApiUrl,
    getHeaders: config.getHeaders,
  });
}

function createCopyLikeCategoryLoaderFeature(config) {
  return createCopyLikeCategoryLoadFeature(config);
}

function createCopyLikeSearchLoaderFeature(config) {
  return createCopyLikeSearchLoadFeature(config);
}

export {
  createCopyLikeExploreFeature,
  createCopyLikeCategoryLoadFeature,
  createCopyLikeSearchLoadFeature,
  createCopyLikeCategoryRequestUrlBuilder,
  createCopyLikeSearchRequestUrlBuilders,
  createCopyLikeDetailTagMapper,
  createCopyLikeTagClickActionHandler,
  createCopyLikeExploreSectionsFeature,
  createCopyLikeCategoryLoaderFeature,
  createCopyLikeSearchLoaderFeature,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature,
  };
}
