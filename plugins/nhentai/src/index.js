class Nhentai extends ComicSource {
  name = "nhentai";

  key = "nhentai";

  version = "1.0.9";

  minAppVersion = "1.0.0";

  url = resolvePluginUpdateUrl("nhentai.js");

  baseUrl = "https://nhentai.net";
  apiBaseUrl = "https://nhentai.net/api/v2";
  imageServer = "https://i3.nhentai.net";
  thumbServer = "https://t3.nhentai.net";

  account = createNhentaiAccountFeature();
  explore = createNhentaiExploreFeature(this);
  category = createNhentaiCategoryConfig();
  categoryComics = createNhentaiCategoryComicsFeature(this);
  search = createNhentaiSearchFeature(this);
  favorites = createNhentaiFavoritesFeature(this);
  comic = createNhentaiComicFeature(this);
  translation = NHENTAI_TRANSLATIONS;

  parseComic(element) {
    return parseNhentaiComicElement(this, element);
  }

  normalizeComicId(id) {
    return normalizeNhentaiComicId(id);
  }

  _fixAndWrap(url) {
    return wrapNhentaiMediaRequest(url);
  }

  toAbsoluteMediaUrl(path, isThumb = false) {
    return toNhentaiAbsoluteMediaUrl(this, path, isThumb);
  }

  parseComicFromApi(item) {
    return parseNhentaiComicFromApi(this, item);
  }

  parseComicListFromApi(data) {
    return parseNhentaiComicListFromApi(this, data);
  }

  formatTimestamp(timestampSec) {
    return formatNhentaiTimestamp(timestampSec);
  }

  tagNamespace(tagType) {
    return getNhentaiTagNamespace(tagType);
  }

  async deleteWithFallback(url, headers) {
    if (typeof Network.delete === "function") {
      return await Network.delete(url, headers, null);
    }
    if (typeof Network.request === "function") {
      return await Network.request(url, "DELETE", headers, null);
    }
    return await Network.post(
      url,
      {
        ...headers,
        "X-HTTP-Method-Override": "DELETE",
      },
      null,
    );
  }

  async parseComicList(html, type = "search") {
    return await parseNhentaiHtmlComicList(this, html, type);
  }

  static get nhentaiTags() {
    return NHENTAI_TAG_CATALOG;
  }
}
