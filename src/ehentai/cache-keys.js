EhentaiModules.domainKey = function domainKey(url) {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return "default";
  }
};

EhentaiModules.thumbnailCacheKey = function thumbnailCacheKey(comicId, pageToken) {
  return `${comicId}::${pageToken ?? "0"}`;
};
