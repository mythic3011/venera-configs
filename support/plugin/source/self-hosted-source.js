import {
  buildSelfHostedUrl,
  buildSelfHostedQuery,
} from "./self-hosted-routes.js";

function buildSelfHostedUrlFromSource(source, path, query) {
  if (!source || typeof source !== "object") {
    throw new Error("buildSelfHostedUrlFromSource requires plugin source");
  }
  return buildSelfHostedUrl(source.baseUrl, path, query);
}

function buildSelfHostedQueryFromSource(query) {
  return buildSelfHostedQuery(query);
}

function readSelfHostedOffset(source, key, page) {
  if (!source || typeof source !== "object") {
    throw new Error("readSelfHostedOffset requires plugin source");
  }
  if (Number(page || 1) <= 1) {
    source.saveData(key, 0);
    return 0;
  }
  return Number(source.loadData(key) || 0);
}

function updateSelfHostedOffset(source, key, returned) {
  if (!source || typeof source !== "object") {
    throw new Error("updateSelfHostedOffset requires plugin source");
  }
  const cur = Number(source.loadData(key) || 0);
  source.saveData(key, cur + (returned || 0));
}

export {
  buildSelfHostedUrlFromSource,
  buildSelfHostedQueryFromSource,
  readSelfHostedOffset,
  updateSelfHostedOffset,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    readSelfHostedOffset,
    updateSelfHostedOffset,
  };
}
