function normalizeNhentaiComicId(id) {
  if (String(id).startsWith("nhentai")) {
    return String(id).replace("nhentai", "");
  }
  if (String(id).startsWith("nh")) {
    return String(id).replace("nh", "");
  }
  return String(id);
}

function normalizeNhentaiCategorySlug(category) {
  return String(category).replaceAll(" ", "-").replaceAll(".", "-");
}

function normalizeNhentaiCategorySort(sortValue) {
  return String(sortValue || "popular").replaceAll("@", "-").replace(/^\//, "");
}

function buildNhentaiCategoryUrl(source, category, param, options, page) {
  const normalizedParam = normalizeNhentaiCategoryParam(param);
  const normalizedCategory = normalizeNhentaiCategorySlug(category);
  const sort = normalizeNhentaiCategorySort((options && options[0]) || "popular");
  let url = `${source.baseUrl}/${normalizedParam}/${encodeURIComponent(normalizedCategory)}`;
  const params = [];

  if (
    sort &&
    sort !== "-Recent" &&
    NHENTAI_CATEGORY_SORT_QUERY_VALUES.has(sort)
  ) {
    params.push(`sort=${sort}`);
  }

  params.push(`page=${page}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return url;
}

function buildNhentaiSearchUrl(source, keyword, options, page) {
  const sort = (options && options[0]) || "date";
  return `${source.apiBaseUrl}/search?query=${encodeURIComponent(keyword)}&page=${page}&sort=${sort}`;
}

function buildNhentaiGalleryUrl(source, comicId) {
  return `${source.baseUrl}/g/${comicId}/`;
}

function buildNhentaiGalleryPageUrl(source, comicId, page) {
  return `${source.baseUrl}/g/${comicId}/${page}/`;
}

function buildNhentaiApiGalleryUrl(source, comicId, suffix = "") {
  const base = `${source.apiBaseUrl}/galleries/${comicId}`;
  return suffix ? `${base}/${suffix}` : base;
}

function buildNhentaiApiFavoritesUrl(source, page) {
  return `${source.apiBaseUrl}/favorites?page=${page}`;
}

function buildNhentaiWebFavoritesUrl(source, page) {
  return `${source.baseUrl}/favorites?page=${page}`;
}

function buildNhentaiLegacyFavoriteUrl(source, comicId, isAdding) {
  return `${source.baseUrl}/api/gallery/${comicId}/${isAdding ? "favorite" : "unfavorite"}`;
}

function buildNhentaiCommentsUrl(source, comicId) {
  return `${source.apiBaseUrl}/galleries/${comicId}/comments`;
}

function parseNhentaiLinkToId(url) {
  const match = /\/g\/(\d+)\/?$/g.exec(url);
  return match ? match[1] : null;
}
