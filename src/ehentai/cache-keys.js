function domainKey(url) {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return "default";
  }
}

function thumbnailCacheKey(comicId, pageToken) {
  return `${comicId}::${pageToken ?? "0"}`;
}
