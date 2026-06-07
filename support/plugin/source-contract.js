import {
  buildOffsetByPage,
  normalizeStarOption,
  normalizeStarOptions,
} from "./source/paging.js";
import {
  stripSelfHostedTrailingSlash,
  normalizeSelfHostedPathRoot,
  normalizeSelfHostedPathSegment,
  joinSelfHostedPath,
  createSelfHostedRouteHelpers,
} from "./source/self-hosted-paths.js";
import {
  normalizeWebSourceBaseUrl,
  normalizeWebSourcePath,
  joinWebSourcePath,
  buildWebSourceQuery,
  buildWebSourceUrl,
  toWebSourceAbsoluteUrl,
  replaceWebSourceBaseUrl,
  ensureWebSourceTrailingSlash,
} from "./source/web-source.js";
import {
  normalizeSelfHostedBaseUrl,
  normalizeSelfHostedRoutePath,
  joinSelfHostedRoutePath,
  createKomgaRouteHelpers,
  createKavitaRouteHelpers,
  resolveSelfHostedBaseUrl,
  buildSelfHostedQuery,
  buildSelfHostedUrl,
} from "./source/self-hosted-routes.js";
import {
  buildSelfHostedUrlFromSource,
  buildSelfHostedQueryFromSource,
  readSelfHostedOffset,
  updateSelfHostedOffset,
} from "./source/self-hosted-source.js";

const pluginSourcePagingApi = {
  buildOffsetByPage,
  normalizeStarOption,
  normalizeStarOptions,
};

const pluginSourceWebApi = {
  normalizeWebSourceBaseUrl,
  normalizeWebSourcePath,
  joinWebSourcePath,
  buildWebSourceQuery,
  buildWebSourceUrl,
  toWebSourceAbsoluteUrl,
  replaceWebSourceBaseUrl,
  ensureWebSourceTrailingSlash,
};

const pluginSourceSelfHostedPathApi = {
  stripSelfHostedTrailingSlash,
  normalizeSelfHostedPathRoot,
  normalizeSelfHostedPathSegment,
  joinSelfHostedPath,
  createSelfHostedRouteHelpers,
};

const pluginSourceSelfHostedRouteApi = {
  normalizeSelfHostedBaseUrl,
  normalizeSelfHostedRoutePath,
  joinSelfHostedRoutePath,
  createKomgaRouteHelpers,
  createKavitaRouteHelpers,
  resolveSelfHostedBaseUrl,
  buildSelfHostedQuery,
  buildSelfHostedUrl,
  buildSelfHostedUrlFromSource,
  buildSelfHostedQueryFromSource,
  readSelfHostedOffset,
  updateSelfHostedOffset,
};

const pluginSourceContractApi = {
  ...pluginSourcePagingApi,
  ...pluginSourceWebApi,
  ...pluginSourceSelfHostedPathApi,
  ...pluginSourceSelfHostedRouteApi,
};

export {
  buildOffsetByPage,
  normalizeStarOption,
  normalizeStarOptions,
  stripSelfHostedTrailingSlash,
  normalizeSelfHostedPathRoot,
  normalizeSelfHostedPathSegment,
  joinSelfHostedPath,
  createSelfHostedRouteHelpers,
  buildSelfHostedUrlFromSource,
  buildSelfHostedQueryFromSource,
  normalizeWebSourceBaseUrl,
  normalizeWebSourcePath,
  joinWebSourcePath,
  buildWebSourceQuery,
  buildWebSourceUrl,
  toWebSourceAbsoluteUrl,
  replaceWebSourceBaseUrl,
  ensureWebSourceTrailingSlash,
  normalizeSelfHostedBaseUrl,
  normalizeSelfHostedRoutePath,
  joinSelfHostedRoutePath,
  createKomgaRouteHelpers,
  createKavitaRouteHelpers,
  resolveSelfHostedBaseUrl,
  buildSelfHostedQuery,
  buildSelfHostedUrl,
  readSelfHostedOffset,
  updateSelfHostedOffset,
  pluginSourcePagingApi,
  pluginSourceWebApi,
  pluginSourceSelfHostedPathApi,
  pluginSourceSelfHostedRouteApi,
  pluginSourceContractApi,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions,
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash,
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    readSelfHostedOffset,
    updateSelfHostedOffset,
    pluginSourcePagingApi,
    pluginSourceWebApi,
    pluginSourceSelfHostedPathApi,
    pluginSourceSelfHostedRouteApi,
    pluginSourceContractApi,
  };
}
