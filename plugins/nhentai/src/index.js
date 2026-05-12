class Nhentai extends ComicSource {
  constructor() {
    super();

    // Note: The fields which are marked as [Optional] should be removed if not used

    // Metadata (id, name, version, minAppVersion) is sourced from plugin.config.json
    // update url
    this.url = resolvePluginUpdateUrl("nhentai.js");

    this.URL_SCHEME = Nhentai.URL_SCHEME;
    this.URL_PREFIX = Nhentai.URL_PREFIX;
    this.DOMAIN = Nhentai.DOMAIN;
    this.BASE_ORIGIN = Nhentai.BASE_ORIGIN;
    this.baseUrl = Nhentai.BASE_URL;
    this.apiBaseUrl = Nhentai.API_BASE_URL;
    this.imageServer = Nhentai.IMAGE_SERVER_URL;
    this.thumbServer = Nhentai.THUMB_SERVER_URL;
    this.DEFAULT_USER_AGENT = Nhentai.DEFAULT_USER_AGENT;

    // CSS selectors
    this.SELECTOR_GALLERY = Nhentai.SELECTOR_GALLERY;
    this.SELECTOR_TAG_CONTAINER = Nhentai.SELECTOR_TAG_CONTAINER;
    this.SELECTOR_TAG_NAME = Nhentai.SELECTOR_TAG_NAME;
    this.SELECTOR_SCRIPT = Nhentai.SELECTOR_SCRIPT;
    this.SELECTOR_CARD_LINK = Nhentai.SELECTOR_CARD_LINK;
    this.SELECTOR_CARD_IMAGE = Nhentai.SELECTOR_CARD_IMAGE;
    this.SELECTOR_CARD_CAPTION = Nhentai.SELECTOR_CARD_CAPTION;
    this.SELECTOR_COVER_IMAGE = Nhentai.SELECTOR_COVER_IMAGE;
    this.SELECTOR_MAIN_TITLE = Nhentai.SELECTOR_MAIN_TITLE;
    this.SELECTOR_SECONDARY_TITLE = Nhentai.SELECTOR_SECONDARY_TITLE;
    this.SELECTOR_UPLOAD_TIME = Nhentai.SELECTOR_UPLOAD_TIME;
    this.SELECTOR_FAVORITE_TEXT = Nhentai.SELECTOR_FAVORITE_TEXT;
    this.SELECTOR_GALLERY_THUMB_IMAGE = Nhentai.SELECTOR_GALLERY_THUMB_IMAGE;
    this.SELECTOR_CONTENT_HEADING = Nhentai.SELECTOR_CONTENT_HEADING;
    this.SELECTOR_CONTENT_HEADING_TAG_LINK =
      Nhentai.SELECTOR_CONTENT_HEADING_TAG_LINK;
    this.SELECTOR_INDEX_POPULAR_GALLERY =
      Nhentai.SELECTOR_INDEX_POPULAR_GALLERY;
    this.SELECTOR_INDEX_GALLERY = Nhentai.SELECTOR_INDEX_GALLERY;

    // Image format constants
    this.IMAGE_FORMATS = Nhentai.IMAGE_FORMATS;
    this.IMAGE_FORMAT_REGEX = Nhentai.IMAGE_FORMAT_REGEX;
    this.IMAGE_SINGLE_FORMAT_REGEX = Nhentai.IMAGE_SINGLE_FORMAT_REGEX;
    this.GALLERY_HREF_ID_REGEX = Nhentai.GALLERY_HREF_ID_REGEX;
    this.LINK_GALLERY_ID_REGEX = Nhentai.LINK_GALLERY_ID_REGEX;
    this.TAG_CLASS_ID_REGEX = Nhentai.TAG_CLASS_ID_REGEX;
    this.NUMBER_REGEX = Nhentai.NUMBER_REGEX;
    this.COVER_HOST_REGEX = Nhentai.COVER_HOST_REGEX;
    this.IMAGE_SRC_ATTRS = Nhentai.IMAGE_SRC_ATTRS;

    // Source and UI constants
    this.SOURCE_TITLE = Nhentai.SOURCE_TITLE;
    this.TRANSLATION_KEYS = Nhentai.TRANSLATION_KEYS;

    // Category parameter mapping (plural -> singular)
    this.CATEGORY_PARAM_MAP = Nhentai.CATEGORY_PARAM_MAP;
    this.TAG_NAMESPACE_MAP = Nhentai.TAG_NAMESPACE_MAP;
    this.TAG_LANGUAGE_MAP = Nhentai.TAG_LANGUAGE_MAP;
    this.IMAGE_EXTENSION_MAP = Nhentai.IMAGE_EXTENSION_MAP;
    this.LANGUAGE_CATEGORIES = Nhentai.LANGUAGE_CATEGORIES;
    this.CATEGORY_SORT_OPTIONS = Nhentai.CATEGORY_SORT_OPTIONS;
    this.SEARCH_SORT_OPTIONS = Nhentai.SEARCH_SORT_OPTIONS;
    this.LINK_DOMAINS = Nhentai.LINK_DOMAINS;
    this.PATH_ROOT = Nhentai.PATH_ROOT;
    this.PATH_API_PREFIX = Nhentai.PATH_API_PREFIX;
    this.PATH_GALLERY_PREFIX = Nhentai.PATH_GALLERY_PREFIX;
    this.PATH_GALLERIES_PREFIX = Nhentai.PATH_GALLERIES_PREFIX;
    this.PATH_FAVORITES = Nhentai.PATH_FAVORITES;
    this.PATH_SEARCH = Nhentai.PATH_SEARCH;
    this.PATH_GALLERIES_TAGGED = Nhentai.PATH_GALLERIES_TAGGED;
    this.PATH_LOGIN = Nhentai.PATH_LOGIN;
    this.PATH_REGISTER = Nhentai.PATH_REGISTER;
    this.PATH_LEGACY_GALLERY_PREFIX = Nhentai.PATH_LEGACY_GALLERY_PREFIX;

    // Translation data for supported languages
    this.TRANSLATION_DATA = Nhentai.TRANSLATION_DATA;

    this.NHENTAI_TAG_VALUES = Nhentai.nhentaiTagValues;
    this.GALLERY_PAGE_HEADERS = Nhentai.GALLERY_PAGE_HEADERS;

    // [Optional] account related
    this.account = {
      loginWithWebview: {
        url: this.loginUrl(),
        checkStatus: (url, title) => {
          return url === this.siteUrl(this.PATH_ROOT);
        },
      },

      /**
       * logout function, clear account related data
       */
      logout: () => {
        Network.deleteCookies(this.cookiesDomain());
      },

      // {string?} - register url
      registerWebsite: this.registerUrl(),
    };

    this.explore = this.createExploreConfig();
    this.category = this.createCategoryConfig();
    this.categoryComics = this.createCategoryComicsConfig();
    this.search = this.createSearchConfig();
    this.favorites = this.createFavoritesConfig();
    this.comic = this.createComicConfig();
    this.translation = this.mergeHeaders(this.TRANSLATION_DATA, {
      en: {},
    });
  }

  /**
   * parse comic from html element
   * @param element {HtmlElement}
   * @returns {Comic}
   */
  parseComic(element) {
    let linkEl = element.querySelector(this.SELECTOR_CARD_LINK);
    let imgEl = linkEl ? linkEl.querySelector(this.SELECTOR_CARD_IMAGE) : null;
    let img = this.getImageSrc(imgEl);
    let name = this.textOf(element.querySelector(this.SELECTOR_CARD_CAPTION));
    let href = this.attrOf(linkEl, "href");
    let id = this.galleryIdFromHref(href);
    let tags = this.attrOf(element, "data-tags");
    let tagIds = tags ? tags.split(" ") : [];
    let tagMetadata = this.tagMetadataFromIds(tagIds);
    return new Comic({
      id: id,
      title: name,
      subtitle: "",
      cover: this.toAbsoluteMediaUrl(img, true),
      tags: tagMetadata.tags,
      description: id,
      language: tagMetadata.language,
    });
  }

  normalizeComicId(id) {
    id = String(id || "");
    if (id.indexOf("nhentai") === 0) {
      return id.slice(7);
    }
    if (id.indexOf("nh") === 0) {
      return id.slice(2);
    }
    return id;
  }

  stripTrailingSlashes(value) {
    let text = String(value || "");
    let end = text.length;
    while (end > 0 && text.charCodeAt(end - 1) === 47) {
      end -= 1;
    }
    return end === text.length ? text : text.slice(0, end);
  }

  stripLeadingSlashes(value) {
    let text = String(value || "");
    let start = 0;
    while (start < text.length && text.charCodeAt(start) === 47) {
      start += 1;
    }
    return start === 0 ? text : text.slice(start);
  }

  joinUrl(origin, path = "") {
    let base = this.stripTrailingSlashes(origin);
    let suffix = String(path || "");
    if (!suffix) {
      return base;
    }
    if (suffix.indexOf("?") === 0 || suffix.indexOf("#") === 0) {
      return base + suffix;
    }
    return base + "/" + this.stripLeadingSlashes(suffix);
  }

  hasOwn(source, key) {
    return Object.prototype.hasOwnProperty.call(source, key);
  }

  buildQuery(params) {
    let pairs = [];
    for (let key in params || {}) {
      if (!this.hasOwn(params, key)) {
        continue;
      }
      let value = params[key];
      if (value === undefined || value === null || value === "") {
        continue;
      }
      pairs.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(String(value)),
      );
    }
    return pairs.join("&");
  }

  parseComicElements(elements) {
    let output = [];
    let list = elements || [];
    for (let i = 0; i < list.length; i += 1) {
      output.push(this.parseComic(list[i]));
    }
    return output;
  }

  parseComicElementsRange(elements, startIndex) {
    let output = [];
    let list = elements || [];
    let start = startIndex || 0;
    for (let i = start; i < list.length; i += 1) {
      output.push(this.parseComic(list[i]));
    }
    return output;
  }

  formatDateObject(time) {
    if (!time || isNaN(time.getTime())) {
      return "";
    }
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    let hour = time.getHours();
    let minute = time.getMinutes();
    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
  }

  parseApiComicElements(items) {
    let output = [];
    let list = items || [];
    for (let i = 0; i < list.length; i += 1) {
      output.push(this.parseComicFromApi(list[i]));
    }
    return output;
  }

  imageUrlsFromPages(pages, fieldName, isThumb) {
    let output = [];
    let list = pages || [];
    for (let i = 0; i < list.length; i += 1) {
      let value = this.toAbsoluteMediaUrl(list[i][fieldName], isThumb);
      if (value) {
        output.push(value);
      }
    }
    return output;
  }

  imageSrcsFromElements(elements) {
    let output = [];
    let list = elements || [];
    for (let i = 0; i < list.length; i += 1) {
      let value = this.getImageSrc(list[i]);
      if (value) {
        output.push(value);
      }
    }
    return output;
  }

  textValuesFromElements(elements) {
    let output = [];
    let list = elements || [];
    for (let i = 0; i < list.length; i += 1) {
      output.push(list[i].text);
    }
    return output;
  }

  tagsMapFromApi(apiTags) {
    let tags = new Map();
    let list = apiTags || [];
    for (let i = 0; i < list.length; i += 1) {
      let tag = list[i];
      let namespace = this.tagNamespace(tag.type);
      if (!tags.has(namespace)) {
        tags.set(namespace, []);
      }
      tags.get(namespace).push(tag.name);
    }
    return tags;
  }

  tagsMapFromDocument(document) {
    let tags = new Map();
    let tagFields = document.querySelectorAll(this.SELECTOR_TAG_CONTAINER);
    for (let i = 0; i < tagFields.length; i += 1) {
      let field = tagFields[i];
      let name = this.replaceAllCompat(this.firstNodeTextOf(field), ":", "");
      if (name === "Uploaded") {
        continue;
      }
      let values = this.textValuesFromElements(
        field.querySelectorAll(this.SELECTOR_TAG_NAME),
      );
      if (values.length > 0) {
        tags.set(name, values);
      }
    }
    return tags;
  }

  commentsFromApi(items) {
    let output = [];
    let list = items || [];
    for (let i = 0; i < list.length; i += 1) {
      let c = list[i];
      output.push(
        new Comment({
          userName: c.poster.username,
          avatar: this.toAbsoluteMediaUrl(c.poster.avatar_url, false),
          content: c.body,
          time:
            typeof c.post_date === "number"
              ? new Date(c.post_date * 1000).toISOString()
              : String(c.post_date),
        }),
      );
    }
    return output;
  }

  async loadComicInfoFromApi(id, apiBody) {
    let data = this.parseJsonBody(apiBody, "gallery details");
    let titleData = data.title || {};

    let title = titleData.pretty || titleData.english || String(id);
    let englishTitle = titleData.english || "";
    let subtitle = englishTitle && englishTitle !== title ? englishTitle : "";
    let coverData = data.cover || {};
    let thumbnailData = data.thumbnail || {};
    let cover = this.toAbsoluteMediaUrl(
      coverData.path || thumbnailData.path || "",
      true,
    );

    let tags = this.tagsMapFromApi(data.tags || []);

    let thumbnails = this.imageUrlsFromPages(
      data.pages || [],
      "thumbnail",
      true,
    );
    if (thumbnails.length === 0) {
      let pagesRes = await Network.get(this.galleryPagesUrl(id), {});
      if (pagesRes.status === 200) {
        let pagesData = this.parseJsonBody(pagesRes.body, "gallery pages");
        thumbnails = this.imageUrlsFromPages(
          pagesData.pages || [],
          "thumbnail",
          true,
        );
      }
    }

    return new ComicDetails({
      id: String(id),
      title: title || String(id),
      subtitle: subtitle || "",
      cover: cover || "",
      tags: tags,
      uploadTime: this.formatTimestamp(data.upload_date),
      isFavorite: !!data.is_favorited,
      thumbnails: thumbnails,
      related: this.parseApiComicElements(data.related || []),
      url: this.galleryUrl(id),
    });
  }

  async loadComicInfoFromWeb(id) {
    let document = new HtmlDocument(
      await this.getBodyOrThrow(this.galleryUrl(id), {}),
    );
    let coverEl = document.querySelector(this.SELECTOR_COVER_IMAGE);
    let cover = this.getImageSrc(coverEl);
    let mainTitle = this.textOf(
      document.querySelector(this.SELECTOR_MAIN_TITLE),
    );
    let secondaryTitle = this.textOf(
      document.querySelector(this.SELECTOR_SECONDARY_TITLE),
    );
    let title = secondaryTitle || mainTitle || String(id);
    let subtitle = mainTitle && mainTitle !== title ? mainTitle : "";
    let uploadTimeRaw = this.attrOf(
      document.querySelector(this.SELECTOR_UPLOAD_TIME),
      "datetime",
    );
    let uploadTime = uploadTimeRaw
      ? this.formatDateObject(new Date(Date.parse(uploadTimeRaw)))
      : "";
    let csrfToken = this.csrfTokenFromDocument(document);

    let comic = new ComicDetails({
      id: String(id),
      title: title || String(id),
      subtitle: subtitle || "",
      cover: cover || "",
      tags: this.tagsMapFromDocument(document),
      uploadTime: uploadTime || "",
      isFavorite:
        this.isLogged &&
        this.textOf(document.querySelector(this.SELECTOR_FAVORITE_TEXT)) !==
          "Favorite",
      thumbnails: this.imageSrcsFromElements(
        document.querySelectorAll(this.SELECTOR_GALLERY_THUMB_IMAGE),
      ),
      related: this.parseComicElements(
        document.querySelectorAll(this.SELECTOR_GALLERY),
      ),
      url: this.galleryUrl(id),
    });
    comic.csrfToken = csrfToken;
    return comic;
  }

  async loadEpisodeImagesFromApi(comicId) {
    let apiRes = await Network.get(this.galleryPagesUrl(comicId), {});
    if (apiRes.status !== 200) {
      return [];
    }
    let apiData = this.parseJsonBody(apiRes.body, "gallery pages");
    return this.imageUrlsFromPages(apiData.pages || [], "path", false);
  }

  extractGalleryDataFromDocument(document) {
    let script = this.scriptTextContaining(document, "window._gallery");
    if (!script) {
      throw new Error("Gallery script not found");
    }
    let json = this.extractBetween(
      script,
      'JSON.parse("',
      '");',
      "gallery JSON",
    );
    let decodedJsonText = this.replaceAllCompat(
      this.replaceAllCompat(json, "\\u0022", '"'),
      "\\u005C",
      "\\",
    );
    return this.parseJsonBody(decodedJsonText, "gallery JSON");
  }

  imageUrlsFromGalleryData(data) {
    let mediaId = data.media_id;
    let images = [];
    let imagePages = data.images && data.images.pages ? data.images.pages : [];
    for (let i = 0; i < imagePages.length; i += 1) {
      let image = imagePages[i];
      let ext = this.getImageExtension(image.t);
      images.push(this.galleryImageUrl(mediaId, images.length + 1, ext));
    }
    return images;
  }

  async loadEpisodeImagesFromWeb(comicId) {
    let document = new HtmlDocument(
      await this.getBodyOrThrow(this.webGalleryPageUrl(comicId), {}),
    );
    let data = this.extractGalleryDataFromDocument(document);
    return this.imageUrlsFromGalleryData(data);
  }

  async addOrDelFavorite(comicId, folderId, isAdding) {
    comicId = this.normalizeComicId(comicId);
    let v2Url = this.favoriteUrl(comicId);
    let headers = this.xhrHeaders();
    let res = isAdding
      ? await Network.post(v2Url, headers, null)
      : await this.deleteWithFallback(v2Url, headers);
    if (!this.isSuccessStatus(res.status)) {
      return await this.addOrDelFavoriteLegacy(comicId, isAdding, res.status);
    }
    return true;
  }

  async addOrDelFavoriteLegacy(comicId, isAdding, originalStatus) {
    // Fallback to legacy endpoint for cookie-based auth compatibility.
    let info = await this.comic.loadInfo(comicId);
    let token = info.csrfToken;
    let legacyUrl = this.legacyFavoriteUrl(
      comicId,
      isAdding ? "favorite" : "unfavorite",
    );
    let legacyRes = await Network.post(
      legacyUrl,
      this.csrfHeaders(token, this.galleryUrl(comicId)),
      null,
    );
    if (this.isSuccessStatus(legacyRes.status)) {
      return true;
    }
    this.throwStatusError(
      legacyRes.status || originalStatus,
      "legacy favorite",
    );
  }

  async loadFavoriteComics(page, folder) {
    let apiUrl = this.favoritesUrl(page);
    let apiRes = await Network.get(apiUrl, {});
    if (this.isSuccessStatus(apiRes.status)) {
      return this.parseComicListFromApi(
        this.parseJsonBody(apiRes.body, "favorites API result"),
      );
    }

    let url = this.webFavoritesUrl(page);
    let webRes = await Network.get(url, {});
    if (!this.isSuccessStatus(webRes.status)) {
      this.throwStatusError(webRes.status, "loadComics");
    }
    return this.parseComicList(webRes.body);
  }

  async loadCategoryComics(category, param, options, page) {
    if (param) {
      let mapped = this.CATEGORY_PARAM_MAP[String(param).toLowerCase()];
      if (mapped) {
        param = mapped;
      }
    }
    category = this.normalizeCategorySlug(category);
    let sortOption = options && options.length ? options[0] : "popular";
    let sort = this.normalizeSortPath(sortOption);
    let url = this.siteUrl(this.categoryPath(param, category, sort), {
      page: page,
    });
    let res = await Network.get(url, {});
    return this.parseComicList(res.body, "category");
  }

  async loadSearchComics(keyword, options, page) {
    let sort = options && options.length ? options[0] : "date";
    let url = this.searchUrl(keyword, page, sort);
    return this.parseComicListFromApi(
      await this.getJsonOrThrow(url, {}, "search result"),
    );
  }

  buildUrl(origin, path = "", params = null) {
    let url = this.joinUrl(origin, path);
    let query = this.buildQuery(params);
    if (query) {
      url += (url.indexOf("?") >= 0 ? "&" : "?") + query;
    }
    return url;
  }

  siteUrl(path = "", params = null) {
    return this.buildUrl(this.baseUrl, path, params);
  }

  apiUrl(path = "", params = null) {
    return this.buildUrl(this.apiBaseUrl, path, params);
  }

  galleryUrl(id) {
    return this.siteUrl(this.PATH_GALLERY_PREFIX + id + "/");
  }

  galleryPagesUrl(id) {
    return this.apiUrl(this.PATH_GALLERIES_PREFIX + id + "/pages");
  }

  galleryDetailsUrl(id) {
    return this.apiUrl(this.PATH_GALLERIES_PREFIX + id, {
      include: "related,favorite",
    });
  }

  galleryCommentsUrl(id) {
    return this.apiUrl(this.PATH_GALLERIES_PREFIX + id + "/comments");
  }

  favoriteUrl(id) {
    return this.apiUrl(this.PATH_GALLERIES_PREFIX + id + "/favorite");
  }

  legacyFavoriteUrl(id, action) {
    return this.siteUrl(this.PATH_LEGACY_GALLERY_PREFIX + id + "/" + action);
  }

  favoritesUrl(page) {
    return this.apiUrl(this.PATH_FAVORITES, { page: page });
  }

  searchUrl(keyword, page, sort) {
    return this.apiUrl(this.PATH_SEARCH, {
      query: keyword,
      page: page,
      sort: sort,
    });
  }

  taggedGalleryUrl(tagId) {
    return this.apiUrl(this.PATH_GALLERIES_TAGGED, { tag_id: tagId });
  }

  webFavoritesUrl(page) {
    return this.siteUrl(this.PATH_FAVORITES, { page: page });
  }

  webGalleryPageUrl(id, page = 1) {
    return this.siteUrl(this.PATH_GALLERY_PREFIX + id + "/" + page + "/");
  }

  loginUrl() {
    return this.siteUrl(this.PATH_LOGIN);
  }

  registerUrl() {
    return this.siteUrl(this.PATH_REGISTER);
  }

  cookiesDomain() {
    return this.baseUrl;
  }

  galleryPageHeaders() {
    return this.GALLERY_PAGE_HEADERS;
  }

  galleryImageUrl(mediaId, index, ext) {
    return this.joinUrl(
      this.imageServer,
      this.PATH_GALLERIES_PREFIX + mediaId + "/" + index + "." + ext,
    );
  }

  categoryPath(param, category, sort) {
    return "/" + param + "/" + encodeURIComponent(category) + sort;
  }

  galleryIdFromHref(href) {
    let match = this.GALLERY_HREF_ID_REGEX.exec(String(href || ""));
    return match ? match[1] : "";
  }

  galleryIdFromLink(url) {
    let match = this.LINK_GALLERY_ID_REGEX.exec(String(url || ""));
    return match ? match[1] : null;
  }

  tagMetadataFromIds(tagValues) {
    let tagsRes = [];
    let language = "Unknown";
    let values = tagValues || [];
    for (let i = 0; i < values.length; i += 1) {
      let tagId = String(values[i]);
      let tag = Nhentai.nhentaiTags[tagId];
      if (tag != null) {
        tagsRes.push(tag);
      }
      let mappedLanguage = this.TAG_LANGUAGE_MAP[tagId];
      if (mappedLanguage) {
        language = mappedLanguage;
      }
    }
    return {
      tags: tagsRes,
      language: language,
    };
  }

  totalFromHeadingText(text) {
    this.NUMBER_REGEX.lastIndex = 0;
    let numbers = (text || "").match(this.NUMBER_REGEX);
    if (!numbers) {
      return 0;
    }
    return parseInt(numbers.join(""));
  }

  totalFromDocument(document, selector) {
    return this.totalFromHeadingText(
      this.textOf(document.querySelector(selector)),
    );
  }

  tagIdFromCategoryDocument(document) {
    let tagEl = document.querySelector(this.SELECTOR_CONTENT_HEADING_TAG_LINK);
    let classAttr = this.attrOf(tagEl, "class");
    let tagMatch = classAttr.match(this.TAG_CLASS_ID_REGEX);
    return tagMatch ? tagMatch[1] : "";
  }

  textOf(element) {
    if (!element) {
      return "";
    }
    let text = element.text || element.textContent || "";
    return String(text).trim();
  }

  attrOf(element, name) {
    if (!element || !element.attributes) {
      return "";
    }
    return element.attributes[name] || "";
  }

  firstNodeTextOf(element) {
    if (!element || !element.nodes || element.nodes.length === 0) {
      return "";
    }
    return this.textOf(element.nodes[0]);
  }

  firstAttrOf(element, names) {
    if (!element) {
      return "";
    }
    for (let i = 0; i < names.length; i += 1) {
      let value = this.attrOf(element, names[i]);
      if (value) {
        return value;
      }
    }
    return "";
  }

  getImageSrc(element) {
    return this.firstAttrOf(element, this.IMAGE_SRC_ATTRS);
  }

  replaceAllCompat(value, search, replacement) {
    let text = String(value || "");
    if (text.indexOf(search) < 0) {
      return text;
    }
    return text.split(search).join(replacement);
  }

  normalizeCategorySlug(value) {
    return this.replaceAllCompat(
      this.replaceAllCompat(value, " ", "-"),
      ".",
      "-",
    );
  }

  normalizeSortPath(value) {
    return this.replaceAllCompat(value || "popular", "@", "-");
  }

  scriptTextContaining(document, keyword) {
    let scripts = document.querySelectorAll(this.SELECTOR_SCRIPT);
    for (let i = 0; i < scripts.length; i += 1) {
      let text = scripts[i].text || scripts[i].textContent || "";
      if (text.indexOf(keyword) >= 0) {
        return text;
      }
    }
    return "";
  }

  extractBetween(text, startToken, endToken, context) {
    let start = text.indexOf(startToken);
    if (start < 0) {
      throw new Error(context + " start token not found");
    }
    start += startToken.length;
    let end = text.indexOf(endToken, start);
    if (end < 0) {
      throw new Error(context + " end token not found");
    }
    return text.slice(start, end);
  }

  csrfTokenFromDocument(document) {
    try {
      let script = this.scriptTextContaining(document, "csrf_token");
      if (script) {
        return this.extractBetween(script, 'csrf_token: "', '",', "csrf token");
      }
    } catch (e) {
      // pass
    }
    return "";
  }

  getImageExtension(typeCode) {
    return this.IMAGE_EXTENSION_MAP[typeCode] || "jpg";
  }

  collapseRepeatedImageExtensions(url) {
    this.IMAGE_FORMAT_REGEX.lastIndex = 0;
    return String(url || "").replace(this.IMAGE_FORMAT_REGEX, (match) => {
      this.IMAGE_SINGLE_FORMAT_REGEX.lastIndex = 0;
      let singleMatch = match.match(this.IMAGE_SINGLE_FORMAT_REGEX);
      return singleMatch ? singleMatch[0] : match;
    });
  }

  normalizeImageLoadUrl(url) {
    if (!url) {
      return "";
    }

    url = this.collapseRepeatedImageExtensions(url);

    if (url.indexOf("/cover.") >= 0) {
      this.COVER_HOST_REGEX.lastIndex = 0;
      url = url.replace(this.COVER_HOST_REGEX, this.thumbServer);
    }

    if (url.indexOf("//") === 0) {
      return this.URL_SCHEME + ":" + url;
    }

    if (url.indexOf("http") !== 0) {
      return this.URL_PREFIX + this.stripLeadingSlashes(url);
    }

    return url;
  }

  _fixAndWrap(url) {
    return {
      url: this.normalizeImageLoadUrl(url),
      headers: this.galleryPageHeaders(),
    };
  }

  toAbsoluteMediaUrl(path, isThumb = false) {
    if (!path) {
      return path;
    }
    if (path.indexOf("http") === 0) {
      return path;
    }
    if (path.indexOf("//") === 0) {
      return this.URL_SCHEME + ":" + path;
    }
    if (path.indexOf("/") === 0) {
      path = path.slice(1);
    }
    if (path.indexOf("cover") >= 0 || path.indexOf("thumb") >= 0) {
      isThumb = true;
    }

    return this.joinUrl(isThumb ? this.thumbServer : this.imageServer, path);
  }

  parseComicFromApi(item) {
    let tagIds = item.tag_ids || [];
    let tagMetadata = this.tagMetadataFromIds(tagIds);
    return new Comic({
      id: String(item.id),
      title: item.english_title || item.japanese_title || String(item.id),
      subtitle: "",
      cover: this.toAbsoluteMediaUrl(item.thumbnail, true),
      tags: tagMetadata.tags,
      description: String(item.id),
      language: tagMetadata.language,
    });
  }

  parseComicListFromApi(data) {
    return {
      comics: this.parseApiComicElements(data.result || []),
      maxPage: data.num_pages || 1,
    };
  }

  formatTimestamp(timestampSec) {
    return this.formatDateObject(new Date(Number(timestampSec) * 1000));
  }

  tagNamespace(tagType) {
    let normalized = String(tagType || "").toLowerCase();
    let namespace = this.TAG_NAMESPACE_MAP[normalized];
    if (namespace) {
      return namespace;
    }
    if (!tagType) {
      return "Tags";
    }
    return String(tagType).charAt(0).toUpperCase() + String(tagType).slice(1);
  }

  async deleteWithFallback(url, headers) {
    if (typeof Network.delete === "function") {
      return await Network.delete(url, headers, null);
    }
    if (typeof Network.request === "function") {
      return await Network.request(url, "DELETE", headers, null);
    }
    return await Network.post(url, this.deleteOverrideHeaders(headers), null);
  }

  mergeHeaders(baseHeaders = {}, extraHeaders = {}) {
    let output = {};
    let key;
    for (key in baseHeaders) {
      if (this.hasOwn(baseHeaders, key)) {
        output[key] = baseHeaders[key];
      }
    }
    for (key in extraHeaders) {
      if (this.hasOwn(extraHeaders, key)) {
        output[key] = extraHeaders[key];
      }
    }
    return output;
  }

  xhrHeaders(headers = {}) {
    return this.mergeHeaders(headers, {
      "X-Requested-With": "XMLHttpRequest",
    });
  }

  csrfHeaders(token, referer, headers = {}) {
    return this.mergeHeaders(headers, {
      "X-CSRFToken": token,
      Referer: referer,
      "X-Requested-With": "XMLHttpRequest",
    });
  }

  deleteOverrideHeaders(headers = {}) {
    return this.mergeHeaders(headers, {
      "X-HTTP-Method-Override": "DELETE",
    });
  }

  isSuccessStatus(status) {
    return status >= 200 && status < 300;
  }

  throwStatusError(status, context = "") {
    if (status === 401 || status === 403) {
      throw "Login expired";
    }
    let msg = "HTTP " + status;
    if (context) {
      msg += " (" + context + ")";
    }
    throw msg;
  }

  async getResponseOrThrow(url, options = {}) {
    let res = await Network.get(url, options);
    if (!this.isSuccessStatus(res.status)) {
      this.throwStatusError(res.status, url);
    }
    return res;
  }

  async getBodyOrThrow(url, options = {}) {
    return (await this.getResponseOrThrow(url, options)).body;
  }

  parseJsonBody(body, context = "JSON response") {
    try {
      return JSON.parse(body || "null");
    } catch (e) {
      throw "Failed to parse " + context + ": " + String(e);
    }
  }

  async getJsonOrThrow(url, options = {}, context = "JSON response") {
    return this.parseJsonBody(await this.getBodyOrThrow(url, options), context);
  }

  async parseComicList(html, type = "search") {
    let document = new HtmlDocument(html);
    let comicElements = document.querySelectorAll(this.SELECTOR_GALLERY);

    let total = comicElements.length;
    let maxPageFromApi = null;

    switch (type) {
      case "search":
        total =
          this.totalFromDocument(document, this.SELECTOR_CONTENT_HEADING) ||
          total;
        break;
      default:
        let tagId = this.tagIdFromCategoryDocument(document);
        if (!tagId) {
          total =
            this.totalFromDocument(document, this.SELECTOR_CONTENT_HEADING) ||
            total;
          break;
        }

        // Prefer v2 API to get accurate pagination for tag pages.
        let resBody = null;
        try {
          resBody = await this.getJsonOrThrow(
            this.taggedGalleryUrl(tagId),
            {},
            "tagged galleries",
          );
        } catch (e) {
          total =
            this.totalFromDocument(document, this.SELECTOR_CONTENT_HEADING) ||
            total;
        }
        if (resBody != null) {
          if (resBody && resBody.num_pages != null) {
            maxPageFromApi = resBody.num_pages;
          }
          if (resBody && resBody.total != null) {
            total = resBody.total;
          }
        }
    }

    return {
      comics: this.parseComicElements(comicElements),
      maxPage: maxPageFromApi || Math.ceil(total / 25),
    };
  }

  createExploreConfig() {
    return [
      {
        // title of the page.
        // title is used to identify the page, it should be unique
        title: this.SOURCE_TITLE,

        /// multiPartPage or multiPageComicList or mixed
        type: "mixed",

        /**
         * load function
         * @param page {number | null} - page number, null for `singlePageWithMultiPart` type
         * @returns {{}}
         */
        load: async (page) => {
          let url = this.siteUrl(
            this.PATH_ROOT,
            page && page !== 1 ? { page: page } : null,
          );
          let doc = new HtmlDocument(await this.getBodyOrThrow(url, {}));
          let data = [];
          let isFirstPage = !page || page === 1;
          let popularCount = 0;
          if (isFirstPage) {
            let popularElements = doc.querySelectorAll(
              this.SELECTOR_INDEX_POPULAR_GALLERY,
            );
            let popularComics = this.parseComicElements(popularElements);
            popularCount = popularComics.length;
            data.push({
              title: "Popular",
              comics: popularComics,
            });
          }
          let latest = this.parseComicElementsRange(
            doc.querySelectorAll(this.SELECTOR_INDEX_GALLERY),
            isFirstPage ? popularCount : 0,
          );
          data.push(latest);
          return {
            data: data,
            maxPage: 20000,
          };
        },
      },
    ];
  }

  async loadComicComments(comicId, subId, page, replyTo) {
    comicId = this.normalizeComicId(comicId);
    let data = await this.getJsonOrThrow(
      this.galleryCommentsUrl(comicId),
      {},
      "comments",
    );
    return {
      comments: this.commentsFromApi(data || []),
      maxPage: 1,
    };
  }

  createCategoryConfig() {
    return {
      /// title of the category page, used to identify the page, it should be unique
      title: this.SOURCE_TITLE,
      parts: [
        {
          name: "Language",

          type: "fixed",

          categories: this.LANGUAGE_CATEGORIES,

          itemType: "category",

          groupParam: "language",
        },
        {
          name: "Tags",

          type: "random",

          randomNumber: 20,

          categories: this.NHENTAI_TAG_VALUES,

          itemType: "search",
        },
      ],
      // enable ranking page
      enableRankingPage: false,
    };
  }

  createCategoryComicsConfig() {
    return {
      /**
       * load comics of a category
       * @param category {string} - category name
       * @param param {string?} - category param
       * @param options {string[]} - options from optionList
       * @param page {number} - page number
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (category, param, options, page) => {
        return await this.loadCategoryComics(category, param, options, page);
      },
      // provide options for category comic loading
      optionList: [
        {
          // For a single option, use `-` to separate the value and text, left for value, right for text
          options: this.CATEGORY_SORT_OPTIONS,
        },
      ],
    };
  }

  createSearchConfig() {
    return {
      /**
       * load search result
       * @param keyword {string}
       * @param options {string[]} - options from optionList
       * @param page {number}
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (keyword, options, page) => {
        return await this.loadSearchComics(keyword, options, page);
      },

      // provide options for search
      optionList: [
        {
          // For a single option, use `-` to separate the value and text, left for value, right for text
          options: this.SEARCH_SORT_OPTIONS,
          // option label
          label: "sort",
        },
      ],

      enableTagsSuggestions: true,
    };
  }

  createFavoritesConfig() {
    return {
      // whether support multi folders
      multiFolder: false,
      /**
       * add or delete favorite.
       * throw `Login expired` to indicate login expired, App will automatically re-login and re-add/delete favorite
       * @param comicId {string}
       * @param folderId {string}
       * @param isAdding {boolean} - true for add, false for delete
       * @returns {Promise<any>} - return any value to indicate success
       */
      addOrDelFavorite: async (comicId, folderId, isAdding) => {
        return await this.addOrDelFavorite(comicId, folderId, isAdding);
      },
      /**
       * load comics in a folder
       * throw `Login expired` to indicate login expired, App will automatically re-login retry.
       * @param page {number}
       * @param folder {string?} - folder id, null for non-multi-folder
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      loadComics: async (page, folder) => {
        return await this.loadFavoriteComics(page, folder);
      },
    };
  }

  createComicConfig() {
    return {
      /**
       * [Optional] provide configs for a thumbnail loading
       * @param url {string}
       * @returns {ImageLoadingConfig | Promise<ImageLoadingConfig>}
       *
       * `ImageLoadingConfig.modifyImage` and `ImageLoadingConfig.onLoadFailed` will be ignored.
       * They are not supported for thumbnails.
       */
      onThumbnailLoad: (url) => {
        return this._fixAndWrap(url);
      },
      onImageLoad: (url) => {
        return this._fixAndWrap(url);
      },
      /**
       * load comic info
       * @param id {string}
       * @returns {Promise<ComicDetails>}
       */
      loadInfo: async (id) => {
        id = this.normalizeComicId(id);

        let apiRes = await Network.get(this.galleryDetailsUrl(id), {});
        if (apiRes.status === 200) {
          let comic = await this.loadComicInfoFromApi(id, apiRes.body);
          comic.csrfToken = "";
          return comic;
        }

        return await this.loadComicInfoFromWeb(id);
      },
      /**
       * load images of a chapter
       * @param comicId {string}
       * @param epId {string?}
       * @returns {Promise<{images: string[]}>}
       */
      loadEp: async (comicId, epId) => {
        comicId = this.normalizeComicId(comicId);

        let apiImages = await this.loadEpisodeImagesFromApi(comicId);
        if (apiImages.length > 0) {
          return { images: apiImages };
        }

        try {
          return { images: await this.loadEpisodeImagesFromWeb(comicId) };
        } catch (e) {
          throw "Failed to extract gallery images: " + String(e);
        }
      },
      /**
       * [Optional] load comments
       * @param comicId {string}
       * @param subId {string?} - ComicDetails.subId
       * @param page {number}
       * @param replyTo {string?} - commentId to reply, not null when reply to a comment
       * @returns {Promise<{comments: Comment[], maxPage: number?}>}
       */
      loadComments: async (comicId, subId, page, replyTo) => {
        return await this.loadComicComments(comicId, subId, page, replyTo);
      },
      /**
       * [Optional] send a comment, return any value to indicate success
       * @param comicId {string}
       * @param subId {string?} - ComicDetails.subId
       * @param content {string}
       * @param replyTo {string?} - commentId to reply, not null when reply to a comment
       * @returns {Promise<any>}
       */
      sendComment: async (comicId, subId, content, replyTo) => {
        throw "Not implemented";
      },
      // {string?} - regex string, used to identify comic id from user input
      idMatch: "^(\\d+|nh\\d+|nhentai\\d+)$",
      /**
       * [Optional] Handle tag click event
       * @param namespace {string}
       * @param tag {string}
       * @returns {{action: string, keyword: string, param: string?}}
       */
      onClickTag: (namespace, tag) => {
        return {
          action: "category",
          keyword: tag,
          param: namespace,
        };
      },
      link: {
        domains: this.LINK_DOMAINS,
        linkToId: (url) => {
          return this.galleryIdFromLink(url);
        },
      },
      enableTagsTranslate: true,
    };
  }
}

Nhentai.URL_SCHEME = "https";
Nhentai.URL_PREFIX = Nhentai.URL_SCHEME + "://";
Nhentai.DOMAIN = "nhentai.net";
Nhentai.BASE_ORIGIN = Nhentai.URL_PREFIX + Nhentai.DOMAIN;
Nhentai.BASE_URL = Nhentai.BASE_ORIGIN;
Nhentai.PATH_API_PREFIX = "/api/v2";
Nhentai.API_BASE_URL = Nhentai.BASE_ORIGIN + Nhentai.PATH_API_PREFIX;
Nhentai.IMAGE_SERVER_HOST = "i3." + Nhentai.DOMAIN;
Nhentai.THUMB_SERVER_HOST = "t3." + Nhentai.DOMAIN;
Nhentai.IMAGE_SERVER_URL = Nhentai.URL_PREFIX + Nhentai.IMAGE_SERVER_HOST;
Nhentai.THUMB_SERVER_URL = Nhentai.URL_PREFIX + Nhentai.THUMB_SERVER_HOST;
Nhentai.LINK_DOMAINS = Object.freeze([Nhentai.DOMAIN]);
Nhentai.PATH_ROOT = "/";
Nhentai.PATH_GALLERY_PREFIX = "/g/";
Nhentai.PATH_GALLERIES_PREFIX = "/galleries/";
Nhentai.PATH_FAVORITES = "/favorites";
Nhentai.PATH_SEARCH = "/search";
Nhentai.PATH_GALLERIES_TAGGED = "/galleries/tagged";
Nhentai.PATH_LOGIN = "/login/?next=/";
Nhentai.PATH_REGISTER = "/register/";
Nhentai.PATH_LEGACY_GALLERY_PREFIX = "/api/gallery/";

Nhentai.DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

Nhentai.GALLERY_PAGE_HEADERS = Object.freeze({
  Referer: Nhentai.BASE_URL + "/",
  "User-Agent": Nhentai.DEFAULT_USER_AGENT,
});

Nhentai.SELECTOR_GALLERY = "div.gallery";
Nhentai.SELECTOR_TAG_CONTAINER = "div.tag-container";
Nhentai.SELECTOR_TAG_NAME = "span.name";
Nhentai.SELECTOR_SCRIPT = "script";
Nhentai.SOURCE_TITLE = "nhentai";
Nhentai.SELECTOR_CARD_LINK = "a";
Nhentai.SELECTOR_CARD_IMAGE = "img";
Nhentai.SELECTOR_CARD_CAPTION = "div.caption";
Nhentai.SELECTOR_COVER_IMAGE = "div#cover > a > img";
Nhentai.SELECTOR_MAIN_TITLE = "h1.title";
Nhentai.SELECTOR_SECONDARY_TITLE = "h2.title";
Nhentai.SELECTOR_UPLOAD_TIME = "time";
Nhentai.SELECTOR_FAVORITE_TEXT = "button#favorite > span.text";
Nhentai.SELECTOR_GALLERY_THUMB_IMAGE = "a.gallerythumb > img";
Nhentai.SELECTOR_CONTENT_HEADING = "div#content > h1";
Nhentai.SELECTOR_CONTENT_HEADING_TAG_LINK = "div#content > h1 > a";
Nhentai.SELECTOR_INDEX_POPULAR_GALLERY =
  "div.container.index-container.index-popular > div.gallery";
Nhentai.SELECTOR_INDEX_GALLERY = "div.container.index-container > div.gallery";

Nhentai.IMAGE_FORMATS = "jpg|png|webp|gif";
Nhentai.IMAGE_FORMAT_REGEX = /(\.(jpg|png|webp|gif))+/g;
Nhentai.IMAGE_SINGLE_FORMAT_REGEX = /\.(jpg|png|webp|gif)/g;
Nhentai.GALLERY_HREF_ID_REGEX = /\/g\/(\d+)/;
Nhentai.LINK_GALLERY_ID_REGEX = /\/g\/(\d+)\/?$/;
Nhentai.TAG_CLASS_ID_REGEX = /tag-(\d+)/;
Nhentai.NUMBER_REGEX = /\d+/g;
Nhentai.COVER_HOST_REGEX = /https?:\/\/[it]\d\.nhentai\.net/g;
Nhentai.IMAGE_SRC_ATTRS = Object.freeze(["data-src", "data-original", "src"]);

Nhentai.TRANSLATION_KEYS = Object.freeze([
  "Tags",
  "Language",
  "Recent",
  "Popular Today",
  "Popular Week",
  "Popular Month",
  "Popular All",
  "sort",
  "Languages",
  "Artists",
  "Characters",
  "Groups",
  "Parodies",
  "Categories",
]);

Nhentai.CATEGORY_PARAM_MAP = Object.freeze({
  tags: "tag",
  languages: "language",
  artists: "artist",
  characters: "character",
  parodies: "parody",
  groups: "group",
  categories: "category",
});

Nhentai.TAG_NAMESPACE_MAP = Object.freeze({
  language: "Languages",
  artist: "Artists",
  character: "Characters",
  group: "Groups",
  parody: "Parodies",
  category: "Categories",
  tag: "Tags",
});

Nhentai.TAG_LANGUAGE_MAP = Object.freeze({
  12227: "English",
  6346: "日本語",
  29963: "中文",
});

Nhentai.IMAGE_EXTENSION_MAP = Object.freeze({
  p: "png",
  g: "gif",
  w: "webp",
});

Nhentai.LANGUAGE_CATEGORIES = Object.freeze(["chinese", "english", "japanese"]);

Nhentai.CATEGORY_SORT_OPTIONS = Object.freeze([
  "/-Recent",
  "/popular@today-Popular Today",
  "/popular@week-Popular Week",
  "/popular@month-Popular Month",
  "/popular-Popular All",
]);

Nhentai.SEARCH_SORT_OPTIONS = Object.freeze([
  "date-Recent",
  "popular-today-Popular Today",
  "popular-week-Popular Week",
  "popular-month-Popular Month",
  "popular-Popular All",
]);

Nhentai.TRANSLATION_DATA = {
  zh_CN: {
    Tags: "标签",
    Language: "语言",
    Recent: "最近",
    "Popular Today": "今日热门",
    "Popular Week": "本周热门",
    "Popular Month": "本月热门",
    "Popular All": "热门",
    sort: "排序",
    Languages: "语言",
    Artists: "画师",
    Characters: "角色",
    Groups: "团队",
    Parodies: "原作",
    Categories: "分类",
  },
  zh_TW: {
    Tags: "標籤",
    Language: "語言",
    Recent: "最近",
    "Popular Today": "今日熱門",
    "Popular Week": "本週熱門",
    "Popular Month": "本月熱門",
    "Popular All": "熱門",
    sort: "排序",
    Languages: "語言",
    Artists: "畫師",
    Characters: "角色",
    Groups: "團隊",
    Parodies: "原作",
    Categories: "分類",
  },
};

Nhentai.TRANSLATION_DATA.zh_CN = Object.freeze(Nhentai.TRANSLATION_DATA.zh_CN);
Nhentai.TRANSLATION_DATA.zh_TW = Object.freeze(Nhentai.TRANSLATION_DATA.zh_TW);
Nhentai.TRANSLATION_DATA = Object.freeze(Nhentai.TRANSLATION_DATA);

Nhentai.nhentaiTags = {
  2937: "big breasts",
  35762: "sole female",
  35763: "sole male",
  8010: "group",
  14283: "anal",
  19440: "lolicon",
  24201: "stockings",
  10314: "schoolgirl uniform",
  13720: "nakadashi",
  29859: "blowjob",
  8378: "glasses",
  20905: "full color",
  32341: "shotacon",
  27553: "rape",
  15658: "bondage",
  23895: "yaoi",
  27473: "mosaic censorship",
  13989: "ahegao",
  22942: "incest",
  21712: "males only",
  1207: "milf",
  19018: "dark skin",
  22945: "double penetration",
  25614: "paizuri",
  20035: "x-ray",
  779: "futanari",
  23237: "tankoubon",
  21572: "multi-work series",
  20525: "defloration",
  14971: "sex toys",
  8653: "netorare",
  3735: "swimsuit",
  19954: "yuri",
  15348: "ffm threesome",
  8368: "full censorship",
  15408: "femdom",
  29224: "impregnation",
  29013: "dilf",
  85295: "twintails",
  31044: "collar",
  85288: "ponytail",
  24380: "pantyhose",
  9260: "cheating",
  28031: "sister",
  16828: "hairy",
  31880: "bbm",
  30555: "big penis",
  15782: "crossdressing",
  31775: "tentacles",
  27384: "mind break",
  19175: "bikini",
  8739: "story arc",
  30473: "muscle",
  24102: "lactation",
  7752: "schoolboy uniform",
  20617: "mind control",
  9083: "big ass",
  29023: "tomgirl",
  81774: "kemonomimi",
  1590: "sweating",
  9162: "masturbation",
  7256: "mmf threesome",
  28550: "teacher",
  190: "maid",
  8693: "uncensored",
  19899: "exhibitionism",
  6343: "pregnant",
  8050: "females only",
  6817: "unusual pupils",
  25871: "lingerie",
  10988: "anthology",
  20282: "footjob",
  15853: "mother",
  15785: "harem",
  14072: "huge breasts",
  30035: "gender bender",
  1643: "kissing",
  130025: "anal intercourse",
  1033: "handjob",
  12824: "condom",
  31386: "catgirl",
  10476: "urination",
  3666: "garter belt",
  26130: "fingering",
  81707: "beauty mark",
  22079: "drugs",
  105833: "gloves",
  4435: "gag",
  25601: "small breasts",
  5820: "piercing",
  12695: "prostitution",
  16228: "demon girl",
  7155: "cunnilingus",
  22950: "tanlines",
  832: "elf",
  31012: "blindfold",
  17773: "kimono",
  2820: "scat",
  29182: "blackmail",
  23132: "bunny girl",
  32484: "stomach deformation",
  2515: "virginity",
  27063: "filming",
  7142: "bbw",
  21989: "inflation",
  88846: "horns",
  104227: "tail",
  26953: "bukkake",
  28800: "bloomers",
  25050: "gyaru",
  24676: "rimjob",
  23632: "big areolae",
  16533: "sleeping",
  73750: "bald",
  18567: "monster",
  35972: "sole dickgirl",
  18328: "thigh high boots",
  5810: "strap-on",
  29565: "school swimsuit",
  32996: "deepthroat",
  370: "business suit",
  7550: "monster girl",
  1067: "inseki",
  50585: "webtoon",
  12523: "bestiality",
  27697: "leotard",
  30645: "dick growth",
  29631: "inverted nipples",
  29366: "tomboy",
  24412: "bodysuit",
  15492: "scanmark",
  9406: "enema",
  35970: "dickgirl on dickgirl",
  29399: "daughter",
  18613: "military",
  11941: "replaced",
  6525: "nurse",
  9661: "cervix penetration",
  33129: "slave",
  4573: "corruption",
  5529: "urethra insertion",
  10542: "snuff",
  683: "squirting",
  51399: "crotch tattoo",
  122908: "very long hair",
  7838: "magical girl",
  24726: "apron",
  23183: "breast expansion",
  20074: "latex",
  28426: "hairy armpits",
  27217: "guro",
  31285: "fox girl",
  106119: "no penetration",
  24764: "drunk",
  9990: "prostate massage",
  35968: "dickgirl on male",
  2956: "old man",
  32752: "shibari",
  6900: "miko",
  2153: "wings",
  706: "birth",
  10794: "breast feeding",
  14069: "ryona",
  25822: "smell",
  5357: "humiliation",
  5962: "spanking",
  2531: "transformation",
  21538: "bike shorts",
  31101: "incomplete",
  32745: "chikan",
  16236: "shemale",
  36957: "bisexual",
  26952: "tall girl",
  25663: "oppai loli",
  7995: "big nipples",
  32602: "fisting",
  106733: "hair buns",
  1088: "bdsm",
  21283: "masked face",
  15225: "blowjob face",
  2633: "leg lock",
  27378: "artbook",
  35971: "male on dickgirl",
  27112: "tiara",
  107705: "facial hair",
  24933: "eyepatch",
  4549: "torture",
  30206: "tribadism",
  1037: "oni",
  89056: "hidden sex",
  13136: "facesitting",
  3391: "nun",
  25766: "gokkun",
  5200: "pegging",
  17531: "cosplaying",
  28521: "voyeurism",
  19479: "nipple fuck",
  17349: "tracksuit",
  22221: "blood",
  50505: "oyakodon",
  50486: "tail plug",
  560: "twins",
  23965: "chloroform",
  15425: "vore",
  25457: "possession",
  129668: "eye-covering bang",
  24984: "orgasm denial",
  144644: "extraneous ads",
  28589: "hotpants",
  17752: "foot licking",
  32282: "piss drinking",
  19390: "cousin",
  32589: "feminization",
  11376: "body modification",
  20362: "gyaru-oh",
  28778: "large insertions",
  27720: "smegma",
  10811: "double vaginal",
  3614: "triple penetration",
  3455: "chastity belt",
  2452: "scar",
  31319: "yandere",
  7354: "amputee",
  28335: "giantess",
  26848: "waitress",
  28349: "cbt",
  24967: "sumata",
  104893: "vtuber",
  8516: "emotionless sex",
  26380: "demon",
  17591: "robot",
  17801: "solo action",
  13640: "frottage",
  25996: "gaping",
  23035: "aunt",
  23967: "huge penis",
  31846: "body writing",
  25744: "cheerleader",
  24708: "cowgirl",
  25085: "swinging",
  18322: "brother",
  101724: "leash",
  10354: "milking",
  97795: "pixie cut",
  11089: "body swap",
  32224: "eggs",
  10606: "pasties",
  3947: "onahole",
  14573: "tall man",
  10604: "dog",
  14362: "low lolicon",
  15242: "lab coat",
  4935: "farting",
  13468: "shimapan",
  5620: "double anal",
  14138: "freckles",
  50390: "josou seme",
  15119: "dog girl",
  93324: "fishnets",
  22025: "prolapse",
  15471: "asphyxiation",
  21774: "human pet",
  31337: "kunoichi",
  15712: "eyemask",
  30126: "big clit",
  92409: "thick eyebrows",
  109360: "cumflation",
  7208: "catboy",
  31687: "randoseru",
  24529: "bride",
  19561: "big balls",
  24450: "chinese dress",
  121738: "focus anal",
  22967: "diaper",
  29347: "miniguy",
  29001: "parasite",
  25296: "armpit licking",
  6220: "orc",
  7546: "witch",
  30895: "sunglasses",
  7372: "corset",
  28119: "nose hook",
  8429: "machine",
  7684: "armpit sex",
  14516: "wolf girl",
  15045: "niece",
  13882: "tutor",
  8391: "public use",
  30811: "christmas",
  104245: "small penis",
  266: "sundress",
  17501: "phimosis",
  17800: "tickling",
  25794: "widow",
  7288: "vomit",
  1215: "unusual teeth",
  72471: "dickgirls only",
  107503: "soushuuhen",
  138044: "exposed clothing",
  1352: "slime",
  31986: "age regression",
  23917: "long tongue",
  24115: "angel",
  114993: "shimaidon",
  13722: "moral degeneration",
  26898: "age progression",
  27120: "selfcest",
  7577: "vampire",
  17676: "ghost",
  88103: "clothed female nude male",
  13515: "coach",
  141098: "nipple stimulation",
  9116: "unbirth",
  5936: "time stop",
  18420: "all the way through",
  72139: "clothed paizuri",
  27530: "ball sucking",
  16518: "coprophagia",
  28869: "stuck in wall",
  2527: "bandages",
  24621: "insect",
  11399: "metal armor",
  106006: "large tattoo",
  3843: "fundoshi",
  20120: "multiple paizuri",
  8400: "goblin",
  129321: "mesuiki",
  124610: "mouth mask",
  10693: "dougi",
  31371: "mecha girl",
  21450: "minigirl",
  10685: "double blowjob",
  118056: "petplay",
  20789: "policewoman",
  3031: "underwater",
  31173: "first person perspective",
  78262: "shaved head",
  19064: "pubic stubble",
  14280: "bunny boy",
  25949: "gothic lolita",
  23463: "wrestling",
  16947: "horse",
  11247: "skinsuit",
  11073: "living clothes",
  30786: "watermarked",
  23073: "assjob",
  52826: "dark sclera",
  107478: "drill hair",
  23225: "non-h",
  109930: "domination loss",
  20170: "poor grammar",
  138200: "gender change",
  16759: "artistcg",
  80978: "nudity only",
  15749: "oil",
  30176: "petrification",
  25848: "human cattle",
  559: "ttf threesome",
  14010: "snake girl",
  11276: "multiple penises",
  90671: "original",
  18024: "touhou project",
  1841: "kantai collection",
  35605: "fate grand order",
  20925: "the idolmaster",
  972: "granblue fantasy",
  78245: "azur lane",
  17137: "neon genesis evangelion",
  3185: "love live",
  391: "girls und panzer",
  11219: "pokemon",
  15021: "sailor moon",
  4505: "mahou shoujo lyrical nanoha",
  128408: "blue archive",
  10222: "fate stay night",
  27431: "to love-ru",
  13159: "naruto",
  123503: "genshin impact",
  3984: "sword art online",
  3603: "street fighter",
  22174: "one piece",
  16285: "puella magi madoka magica",
  91195: "princess connect",
  12232: "my hero academia",
  3163: "king of fighters",
  26172: "k-on",
  7259: "touken ranbu",
  19080: "code geass",
  37544: "love live sunshine",
  17077: "cardcaptor sakura",
  27547: "the melancholy of haruhi suzumiya",
  13508: "final fantasy vii",
  10954: "shingeki no kyojin",
  25430: "vocaloid",
  32687: "free",
  4577: "toheart2",
  22146: "dead or alive",
  20025: "gochuumon wa usagi desu ka",
  8485: "dragon ball z",
  5037: "bleach",
  3218: "bakemonogatari",
  12624: "ore no imouto ga konna ni kawaii wake ga nai",
  37109: "kono subarashii sekai ni syukufuku o",
  4369: "monster hunter",
  127065: "hololive",
  74788: "girls frontline",
  24886: "fate kaleid liner prisma illya",
  6999: "toaru kagaku no railgun",
  22032: "boku wa tomodachi ga sukunai",
  18350: "ragnarok online",
  21674: "dragon quest iii",
  14345: "ojamajo doremi",
  7832: "darkstalkers",
  24135: "ah my goddess",
  32394: "samurai spirits",
  1283: "queens blade",
  16639: "haikyuu",
  13924: "yu-gi-oh",
  79467: "kimetsu no yaiba",
  18238: "danganronpa",
  26336: "yu-gi-oh zexal",
  16984: "persona 4",
  18569: "kuroko no basuke",
  1910: "smile precure",
  30587: "sakura taisen",
  16166: "mahou sensei negima",
  12285: "ranma 12",
  8470: "infinite stratos",
  32363: "toaru majutsu no index",
  22708: "saki",
  8708: "to heart",
  108082: "arknights",
  16707: "detective conan",
  22210: "guilty gear",
  947: "gundam seed destiny",
  22677: "tenchi muyo",
  23429: "pretty cure",
  18512: "strike witches",
  31027: "lucky star",
  7408: "league of legends",
  394: "love hina",
  23201: "kanon",
  27704: "amagami",
  127052: "nijisanji",
  70802: "kemono friends",
  52098: "persona 5",
  22215: "super robot wars",
  27567: "hayate no gotoku",
  35251: "osomatsu-san",
  7633: "pripara",
  34823: "ensemble stars",
  37914: "re zero kara hajimeru isekai seikatsu",
  74918: "bang dream",
  15041: "martian successor nadesico",
  24783: "dragon ball",
  120519: "love live nijigasaki high school idol club",
  2803: "love plus",
  5085: "senki zesshou symphogear",
  28474: "zero no tsukaima",
  15197: "gundam build fighters",
  15427: "dragon quest iv",
  1163: "rozen maiden",
  23859: "yu-gi-oh arc-v",
  75023: "dragon quest xi",
  2112: "dungeon ni deai o motomeru no wa machigatteiru darou ka",
  36418: "voiceroid",
  28281: "mitsudomoe",
  11624: "the legend of zelda",
  14694: "fullmetal alchemist",
  16847: "dragon quest v",
  2497: "urusei yatsura",
  5671: "tengen toppa gurren lagann",
  22754: "amagi brilliant park",
  20606: "tsukihime",
  5165: "gundam build fighters try",
  4114: "macross frontier",
  20763: "inazuma eleven",
  14550: "sister princess",
  19083: "jojos bizarre adventure",
  21052: "fate hollow ataraxia",
  29922: "teitoku",
  51810: "gudao",
  16643: "producer",
  13848: "reimu hakurei",
  25125: "asuka langley soryu",
  17279: "sakuya izayoi",
  10496: "patchouli knowledge",
  37739: "shielder",
  3206: "shinji ikari",
  38068: "gran",
  4675: "sanae kochiya",
  21779: "rei ayanami",
  14040: "fate testarossa",
  3870: "flandre scarlet",
  23902: "remilia scarlet",
  21688: "atago",
  11373: "marisa kirisame",
  35128: "kashima",
  17154: "sakura kinomoto",
  31462: "satori komeiji",
  30080: "kaga",
  10802: "alice margatroid",
  17017: "aya shameimaru",
  17862: "yukari yakumo",
  5340: "shimakaze",
  18935: "nanoha takamachi",
  18896: "shirou emiya",
  16555: "rin tosaka",
  16130: "rito yuuki",
  15890: "reisen udongein inaba",
  7724: "takao",
  27060: "jeanne darc",
  78989: "jeanne alter",
  7718: "naruto uzumaki",
  5337: "nami",
  22975: "chun-li",
  17502: "illyasviel von einzbern",
  20111: "tifa lockhart",
  21131: "youmu konpaku",
  18026: "kazuto kirigaya",
  92923: "shikikan",
  29856: "saber",
  71442: "minamoto no raikou",
  1843: "asuna yuuki",
  51419: "gudako",
  7488: "mai shiranui",
  9835: "koishi komeiji",
  16916: "kasumi",
  30026: "maki nishikino",
  143975: "sensei",
  26906: "izuku midoriya",
  37275: "scathach",
  7696: "momiji inubashiri",
  38039: "astolfo",
  27794: "mikoto misaka",
  20062: "hamakaze",
  78285: "artoria pendragon",
  34860: "katsuki bakugou",
  3328: "homura akemi",
  37687: "djeeta",
  32200: "suzuya",
  21108: "rin shibuya",
  35964: "nico yazawa",
  27494: "levi ackerman",
  609: "eren jaeger",
  11920: "sakura haruno",
  20427: "sailor mercury",
  24714: "chino kafuu",
  31456: "mikan yuuki",
  866: "koyomi araragi",
  12149: "kyousuke kousaka",
  277: "haruka nanase",
  19926: "haruna",
  3763: "haruhi suzumiya",
  26427: "mio akiyama",
  25439: "hinata hyuga",
  17811: "ran yakumo",
  14857: "kongou",
  18548: "kotori minami",
  32364: "rider",
  15641: "madoka kaname",
  2613: "hong meiling",
  491: "makoto tachibana",
  20702: "koakuma",
  15315: "tomoyo daidouji",
  10730: "shigure",
  14265: "touma kamijou",
  80311: "bb",
  4203: "mami tomoe",
  37706: "kazuma satou",
  33070: "umi sonoda",
  27172: "yuyuko saigyouji",
  3353: "yuuka kazami",
  2078: "nagato",
  6311: "arisu tachibana",
  647: "belldandy",
  9274: "maya",
  24889: "sena kashiwazaki",
  15125: "golden darkness",
  6555: "sailor jupiter",
  25695: "mika jougasaki",
  50929: "shuten douji",
  33077: "sailor mars",
  8293: "minami nitta",
  7451: "lelouch vi britannia",
  389: "rika jougasaki",
  22469: "prinz eugen",
  16108: "azusa nakano",
  12812: "tenryuu",
  7311: "ami mizuno",
  6642: "byakuren hijiri",
  7097: "suwako moriya",
  19172: "miki hoshii",
  9657: "ayane",
  29433: "c.c.",
  25220: "sakura matou",
  14499: "tsunade",
  10665: "tenshi hinanai",
  16564: "miku hatsune",
  29190: "kallen stadtfeld",
  3312: "kirino kousaka",
  1234: "yuki nagato",
  26261: "ranma saotome",
  19002: "rin kaenbyou",
  12748: "nico robin",
  32765: "rin matsuoka",
  4241: "fumika sagisawa",
  1729: "tamaki kousaka",
  23997: "ruri gokou",
  29684: "sailor venus",
  19160: "nitori kawashiro",
  27302: "uzuki shimamura",
  23216: "android 18",
  8489: "hibiki",
  7333: "suguha kirigaya",
  1267: "kodaka hasegawa",
  2345: "morrigan aensland",
  9371: "yamato",
  26087: "inazuma",
  27532: "archer",
  26587: "miho nishizumi",
  12346: "utsuho reiuji",
  37108: "megumin",
  22407: "takane shijou",
  15914: "sasuke uchiha",
  2774: "kyouko sakura",
  80930: "abigail williams",
  81288: "gudao | ritsuka fujimaru",
  73756: "nightingale",
  6109: "eri ayase",
  27492: "akagi",
  17899: "sakura kasugano",
  32137: "cirno",
  11760: "yui kotegawa",
  75029: "eli ayase",
  11740: "sailor moon",
  49158: "narmaya",
  29693: "ikazuchi",
  126586: "aether",
  20918: "iori minase",
  24832: "misato katsuragi",
  2883: "kasen ibara",
  6932: "souji okita",
  28555: "tamamo-no-mae",
  14428: "kokoa hoto",
  26783: "taihou",
  12763: "rumia",
  401: "nakoruru",
  72475: "musashi miyamoto",
  23122: "maho nishizumi",
  29188: "eirin yagokoro",
  466: "usagi tsukino",
  29638: "kyon",
  15995: "makoto kino",
  11744: "amatsukaze",
  6175: "cammy white",
  30331: "ichika orimura",
  23473: "mikuru asahina",
  28807: "ruri hoshino",
  2572: "hatate himekaidou",
  15291: "chen",
  23386: "fujiwara no mokou",
  9237: "shoukaku",
  28763: "tewi inaba",
  23851: "gilgamesh",
  10672: "aqua",
  9702: "ro-500",
  31074: "keine kamishirasawa",
  32443: "charlotte dunois",
  2196: "sayaka miki",
  1645: "zuikaku",
  5925: "akatsuki",
  4196: "hestia",
  33171: "shiho nishizumi",
  19534: "hayate yagami",
  79507: "belfast",
  12433: "kaede takagaki",
  12872: "warrior",
  8170: "len kagamine",
  50415: "rem",
  14409: "momoka sakurai",
  2211: "mari illustrious makinami",
  99075: "kokkoro",
  1907: "rei hino",
  15651: "miyu edelfelt",
  26169: "musashi",
  8053: "lum",
  50596: "you watanabe",
  9883: "kagami hiiragi",
  24509: "darjeeling",
  11992: "lala satalin deviluke",
  32683: "hachiman hikigaya",
  31076: "kuroko shirai",
  20836: "red saber",
  12902: "isuzu sento",
  10379: "bianca whitaker",
  16181: "nozomi toujou",
  27774: "bismarck",
  28219: "yui hirasawa",
  1271: "momo velia deviluke",
  49852: "subaru natsuki",
  5918: "shinobu oshino",
  28056: "link",
  25605: "rangiku matsumoto",
  35313: "cagliostro",
  18453: "hero",
  75102: "nozomi tojo",
  20722: "mutsu",
  29170: "yuma tsukumo",
  9486: "nue houjuu",
  33049: "ritsuko akizuki",
  23626: "murakumo",
  20323: "tsumugi kotobuki",
  16566: "ritsu tainaka",
  14016: "yuu narukami",
  11609: "yoko ritona",
  107011: "chloe von einzbern",
  52132: "riko sakurauchi",
  32114: "onpu segawa",
  11924: "kagerou imaizumi",
};

Nhentai.nhentaiTags = Object.freeze(Nhentai.nhentaiTags);

Nhentai.nhentaiTagValues = Object.freeze(
  (function () {
    let values = [];
    for (let key in Nhentai.nhentaiTags || {}) {
      if (Object.prototype.hasOwnProperty.call(Nhentai.nhentaiTags, key)) {
        values.push(Nhentai.nhentaiTags[key]);
      }
    }
    return values;
  })(),
);
