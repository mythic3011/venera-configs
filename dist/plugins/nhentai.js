class Nhentai extends ComicSource {
    constructor() {
        super(), this.url = resolvePluginUpdateUrl("nhentai.js"), this.URL_SCHEME = Nhentai.URL_SCHEME,
        this.URL_PREFIX = Nhentai.URL_PREFIX, this.DOMAIN = Nhentai.DOMAIN, this.BASE_ORIGIN = Nhentai.BASE_ORIGIN,
        this.baseUrl = Nhentai.BASE_URL, this.apiBaseUrl = Nhentai.API_BASE_URL, this.imageServer = Nhentai.IMAGE_SERVER_URL,
        this.thumbServer = Nhentai.THUMB_SERVER_URL, this.DEFAULT_USER_AGENT = Nhentai.DEFAULT_USER_AGENT,
        this.SELECTOR_GALLERY = Nhentai.SELECTOR_GALLERY, this.SELECTOR_TAG_CONTAINER = Nhentai.SELECTOR_TAG_CONTAINER,
        this.SELECTOR_TAG_NAME = Nhentai.SELECTOR_TAG_NAME, this.SELECTOR_SCRIPT = Nhentai.SELECTOR_SCRIPT,
        this.SELECTOR_CARD_LINK = Nhentai.SELECTOR_CARD_LINK, this.SELECTOR_CARD_IMAGE = Nhentai.SELECTOR_CARD_IMAGE,
        this.SELECTOR_CARD_CAPTION = Nhentai.SELECTOR_CARD_CAPTION, this.SELECTOR_COVER_IMAGE = Nhentai.SELECTOR_COVER_IMAGE,
        this.SELECTOR_MAIN_TITLE = Nhentai.SELECTOR_MAIN_TITLE, this.SELECTOR_SECONDARY_TITLE = Nhentai.SELECTOR_SECONDARY_TITLE,
        this.SELECTOR_UPLOAD_TIME = Nhentai.SELECTOR_UPLOAD_TIME, this.SELECTOR_FAVORITE_TEXT = Nhentai.SELECTOR_FAVORITE_TEXT,
        this.SELECTOR_GALLERY_THUMB_IMAGE = Nhentai.SELECTOR_GALLERY_THUMB_IMAGE, this.SELECTOR_CONTENT_HEADING = Nhentai.SELECTOR_CONTENT_HEADING,
        this.SELECTOR_CONTENT_HEADING_TAG_LINK = Nhentai.SELECTOR_CONTENT_HEADING_TAG_LINK,
        this.SELECTOR_INDEX_POPULAR_GALLERY = Nhentai.SELECTOR_INDEX_POPULAR_GALLERY, this.SELECTOR_INDEX_GALLERY = Nhentai.SELECTOR_INDEX_GALLERY,
        this.IMAGE_FORMATS = Nhentai.IMAGE_FORMATS, this.IMAGE_FORMAT_REGEX = Nhentai.IMAGE_FORMAT_REGEX,
        this.IMAGE_SINGLE_FORMAT_REGEX = Nhentai.IMAGE_SINGLE_FORMAT_REGEX, this.GALLERY_HREF_ID_REGEX = Nhentai.GALLERY_HREF_ID_REGEX,
        this.LINK_GALLERY_ID_REGEX = Nhentai.LINK_GALLERY_ID_REGEX, this.TAG_CLASS_ID_REGEX = Nhentai.TAG_CLASS_ID_REGEX,
        this.NUMBER_REGEX = Nhentai.NUMBER_REGEX, this.COVER_HOST_REGEX = Nhentai.COVER_HOST_REGEX,
        this.IMAGE_SRC_ATTRS = Nhentai.IMAGE_SRC_ATTRS, this.SOURCE_TITLE = Nhentai.SOURCE_TITLE,
        this.TRANSLATION_KEYS = Nhentai.TRANSLATION_KEYS, this.CATEGORY_PARAM_MAP = Nhentai.CATEGORY_PARAM_MAP,
        this.TAG_NAMESPACE_MAP = Nhentai.TAG_NAMESPACE_MAP, this.TAG_LANGUAGE_MAP = Nhentai.TAG_LANGUAGE_MAP,
        this.IMAGE_EXTENSION_MAP = Nhentai.IMAGE_EXTENSION_MAP, this.LANGUAGE_CATEGORIES = Nhentai.LANGUAGE_CATEGORIES,
        this.CATEGORY_SORT_OPTIONS = Nhentai.CATEGORY_SORT_OPTIONS, this.SEARCH_SORT_OPTIONS = Nhentai.SEARCH_SORT_OPTIONS,
        this.LINK_DOMAINS = Nhentai.LINK_DOMAINS, this.PATH_ROOT = Nhentai.PATH_ROOT, this.PATH_API_PREFIX = Nhentai.PATH_API_PREFIX,
        this.PATH_GALLERY_PREFIX = Nhentai.PATH_GALLERY_PREFIX, this.PATH_GALLERIES_PREFIX = Nhentai.PATH_GALLERIES_PREFIX,
        this.PATH_FAVORITES = Nhentai.PATH_FAVORITES, this.PATH_SEARCH = Nhentai.PATH_SEARCH,
        this.PATH_GALLERIES_TAGGED = Nhentai.PATH_GALLERIES_TAGGED, this.PATH_LOGIN = Nhentai.PATH_LOGIN,
        this.PATH_REGISTER = Nhentai.PATH_REGISTER, this.PATH_LEGACY_GALLERY_PREFIX = Nhentai.PATH_LEGACY_GALLERY_PREFIX,
        this.TRANSLATION_DATA = Nhentai.TRANSLATION_DATA, this.NHENTAI_TAG_VALUES = Nhentai.nhentaiTagValues,
        this.GALLERY_PAGE_HEADERS = Nhentai.GALLERY_PAGE_HEADERS, this.account = {
            loginWithWebview: {
                url: this.loginUrl(),
                checkStatus: (e, t) => e === this.siteUrl(this.PATH_ROOT)
            },
            logout: () => {
                Network.deleteCookies(this.cookiesDomain());
            },
            registerWebsite: this.registerUrl()
        }, this.explore = this.createExploreConfig(), this.category = this.createCategoryConfig(),
        this.categoryComics = this.createCategoryComicsConfig(), this.search = this.createSearchConfig(),
        this.favorites = this.createFavoritesConfig(), this.comic = this.createComicConfig(),
        this.translation = this.mergeHeaders(this.TRANSLATION_DATA, {
            en: {}
        });
    }
    parseComic(e) {
        let t = e.querySelector(this.SELECTOR_CARD_LINK), a = t ? t.querySelector(this.SELECTOR_CARD_IMAGE) : null, i = this.getImageSrc(a), r = this.textOf(e.querySelector(this.SELECTOR_CARD_CAPTION)), s = this.attrOf(t, "href"), n = this.galleryIdFromHref(s), o = this.attrOf(e, "data-tags"), l = o ? o.split(" ") : [], h = this.tagMetadataFromIds(l);
        return new Comic({
            id: n,
            title: r,
            subtitle: "",
            cover: this.toAbsoluteMediaUrl(i, !0),
            tags: h.tags,
            description: n,
            language: h.language
        });
    }
    normalizeComicId(e) {
        return 0 === (e = String(e || "")).indexOf("nhentai") ? e.slice(7) : 0 === e.indexOf("nh") ? e.slice(2) : e;
    }
    stripTrailingSlashes(e) {
        let t = String(e || ""), a = t.length;
        for (;a > 0 && 47 === t.charCodeAt(a - 1); ) a -= 1;
        return a === t.length ? t : t.slice(0, a);
    }
    stripLeadingSlashes(e) {
        let t = String(e || ""), a = 0;
        for (;a < t.length && 47 === t.charCodeAt(a); ) a += 1;
        return 0 === a ? t : t.slice(a);
    }
    joinUrl(e, t = "") {
        let a = this.stripTrailingSlashes(e), i = String(t || "");
        return i ? 0 === i.indexOf("?") || 0 === i.indexOf("#") ? a + i : a + "/" + this.stripLeadingSlashes(i) : a;
    }
    hasOwn(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
    }
    buildQuery(e) {
        let t = [];
        for (let a in e || {}) {
            if (!this.hasOwn(e, a)) continue;
            let i = e[a];
            null != i && "" !== i && t.push(encodeURIComponent(a) + "=" + encodeURIComponent(String(i)));
        }
        return t.join("&");
    }
    parseComicElements(e) {
        let t = [], a = e || [];
        for (let e = 0; e < a.length; e += 1) t.push(this.parseComic(a[e]));
        return t;
    }
    parseComicElementsRange(e, t) {
        let a = [], i = e || [];
        for (let e = t || 0; e < i.length; e += 1) a.push(this.parseComic(i[e]));
        return a;
    }
    formatDateObject(e) {
        return !e || isNaN(e.getTime()) ? "" : e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + e.getDate() + " " + e.getHours() + ":" + e.getMinutes();
    }
    parseApiComicElements(e) {
        let t = [], a = e || [];
        for (let e = 0; e < a.length; e += 1) t.push(this.parseComicFromApi(a[e]));
        return t;
    }
    imageUrlsFromPages(e, t, a) {
        let i = [], r = e || [];
        for (let e = 0; e < r.length; e += 1) {
            let s = this.toAbsoluteMediaUrl(r[e][t], a);
            s && i.push(s);
        }
        return i;
    }
    imageSrcsFromElements(e) {
        let t = [], a = e || [];
        for (let e = 0; e < a.length; e += 1) {
            let i = this.getImageSrc(a[e]);
            i && t.push(i);
        }
        return t;
    }
    textValuesFromElements(e) {
        let t = [], a = e || [];
        for (let e = 0; e < a.length; e += 1) t.push(a[e].text);
        return t;
    }
    tagsMapFromApi(e) {
        let t = new Map, a = e || [];
        for (let e = 0; e < a.length; e += 1) {
            let i = a[e], r = this.tagNamespace(i.type);
            t.has(r) || t.set(r, []), t.get(r).push(i.name);
        }
        return t;
    }
    tagsMapFromDocument(e) {
        let t = new Map, a = e.querySelectorAll(this.SELECTOR_TAG_CONTAINER);
        for (let e = 0; e < a.length; e += 1) {
            let i = a[e], r = this.replaceAllCompat(this.firstNodeTextOf(i), ":", "");
            if ("Uploaded" === r) continue;
            let s = this.textValuesFromElements(i.querySelectorAll(this.SELECTOR_TAG_NAME));
            s.length > 0 && t.set(r, s);
        }
        return t;
    }
    commentsFromApi(e) {
        let t = [], a = e || [];
        for (let e = 0; e < a.length; e += 1) {
            let i = a[e];
            t.push(new Comment({
                userName: i.poster.username,
                avatar: this.toAbsoluteMediaUrl(i.poster.avatar_url, !1),
                content: i.body,
                time: "number" == typeof i.post_date ? new Date(1e3 * i.post_date).toISOString() : String(i.post_date)
            }));
        }
        return t;
    }
    async loadComicInfoFromApi(e, t) {
        let a = this.parseJsonBody(t, "gallery details"), i = a.title || {}, r = i.pretty || i.english || String(e), s = i.english || "", n = s && s !== r ? s : "", o = a.cover || {}, l = a.thumbnail || {}, h = this.toAbsoluteMediaUrl(o.path || l.path || "", !0), u = this.tagsMapFromApi(a.tags || []), g = this.imageUrlsFromPages(a.pages || [], "thumbnail", !0);
        if (0 === g.length) {
            let t = await Network.get(this.galleryPagesUrl(e), {});
            if (200 === t.status) {
                let e = this.parseJsonBody(t.body, "gallery pages");
                g = this.imageUrlsFromPages(e.pages || [], "thumbnail", !0);
            }
        }
        return new ComicDetails({
            id: String(e),
            title: r || String(e),
            subtitle: n || "",
            cover: h || "",
            tags: u,
            uploadTime: this.formatTimestamp(a.upload_date),
            isFavorite: !!a.is_favorited,
            thumbnails: g,
            related: this.parseApiComicElements(a.related || []),
            url: this.galleryUrl(e)
        });
    }
    async loadComicInfoFromWeb(e) {
        let t = new HtmlDocument(await this.getBodyOrThrow(this.galleryUrl(e), {})), a = t.querySelector(this.SELECTOR_COVER_IMAGE), i = this.getImageSrc(a), r = this.textOf(t.querySelector(this.SELECTOR_MAIN_TITLE)), s = this.textOf(t.querySelector(this.SELECTOR_SECONDARY_TITLE)) || r || String(e), n = r && r !== s ? r : "", o = this.attrOf(t.querySelector(this.SELECTOR_UPLOAD_TIME), "datetime"), l = o ? this.formatDateObject(new Date(Date.parse(o))) : "", h = this.csrfTokenFromDocument(t), u = new ComicDetails({
            id: String(e),
            title: s || String(e),
            subtitle: n || "",
            cover: i || "",
            tags: this.tagsMapFromDocument(t),
            uploadTime: l || "",
            isFavorite: this.isLogged && "Favorite" !== this.textOf(t.querySelector(this.SELECTOR_FAVORITE_TEXT)),
            thumbnails: this.imageSrcsFromElements(t.querySelectorAll(this.SELECTOR_GALLERY_THUMB_IMAGE)),
            related: this.parseComicElements(t.querySelectorAll(this.SELECTOR_GALLERY)),
            url: this.galleryUrl(e)
        });
        return u.csrfToken = h, u;
    }
    async loadEpisodeImagesFromApi(e) {
        let t = await Network.get(this.galleryPagesUrl(e), {});
        if (200 !== t.status) return [];
        let a = this.parseJsonBody(t.body, "gallery pages");
        return this.imageUrlsFromPages(a.pages || [], "path", !1);
    }
    extractGalleryDataFromDocument(e) {
        let t = this.scriptTextContaining(e, "window._gallery");
        if (!t) throw new Error("Gallery script not found");
        let a = this.extractBetween(t, 'JSON.parse("', '");', "gallery JSON"), i = this.replaceAllCompat(this.replaceAllCompat(a, "\\u0022", '"'), "\\u005C", "\\");
        return this.parseJsonBody(i, "gallery JSON");
    }
    imageUrlsFromGalleryData(e) {
        let t = e.media_id, a = [], i = e.images && e.images.pages ? e.images.pages : [];
        for (let e = 0; e < i.length; e += 1) {
            let r = i[e], s = this.getImageExtension(r.t);
            a.push(this.galleryImageUrl(t, a.length + 1, s));
        }
        return a;
    }
    async loadEpisodeImagesFromWeb(e) {
        let t = new HtmlDocument(await this.getBodyOrThrow(this.webGalleryPageUrl(e), {})), a = this.extractGalleryDataFromDocument(t);
        return this.imageUrlsFromGalleryData(a);
    }
    async addOrDelFavorite(e, t, a) {
        e = this.normalizeComicId(e);
        let i = this.favoriteUrl(e), r = this.xhrHeaders(), s = a ? await Network.post(i, r, null) : await this.deleteWithFallback(i, r);
        return !!this.isSuccessStatus(s.status) || await this.addOrDelFavoriteLegacy(e, a, s.status);
    }
    async addOrDelFavoriteLegacy(e, t, a) {
        let i = (await this.comic.loadInfo(e)).csrfToken, r = this.legacyFavoriteUrl(e, t ? "favorite" : "unfavorite"), s = await Network.post(r, this.csrfHeaders(i, this.galleryUrl(e)), null);
        if (this.isSuccessStatus(s.status)) return !0;
        this.throwStatusError(s.status || a, "legacy favorite");
    }
    async loadFavoriteComics(e, t) {
        let a = this.favoritesUrl(e), i = await Network.get(a, {});
        if (this.isSuccessStatus(i.status)) return this.parseComicListFromApi(this.parseJsonBody(i.body, "favorites API result"));
        let r = this.webFavoritesUrl(e), s = await Network.get(r, {});
        return this.isSuccessStatus(s.status) || this.throwStatusError(s.status, "loadComics"),
        this.parseComicList(s.body);
    }
    async loadCategoryComics(e, t, a, i) {
        if (t) {
            let e = this.CATEGORY_PARAM_MAP[String(t).toLowerCase()];
            e && (t = e);
        }
        e = this.normalizeCategorySlug(e);
        let r = a && a.length ? a[0] : "popular", s = this.normalizeSortPath(r), n = this.siteUrl(this.categoryPath(t, e, s), {
            page: i
        }), o = await Network.get(n, {});
        return this.parseComicList(o.body, "category");
    }
    async loadSearchComics(e, t, a) {
        let i = t && t.length ? t[0] : "date", r = this.searchUrl(e, a, i);
        return this.parseComicListFromApi(await this.getJsonOrThrow(r, {}, "search result"));
    }
    buildUrl(e, t = "", a = null) {
        let i = this.joinUrl(e, t), r = this.buildQuery(a);
        return r && (i += (i.indexOf("?") >= 0 ? "&" : "?") + r), i;
    }
    siteUrl(e = "", t = null) {
        return this.buildUrl(this.baseUrl, e, t);
    }
    apiUrl(e = "", t = null) {
        return this.buildUrl(this.apiBaseUrl, e, t);
    }
    galleryUrl(e) {
        return this.siteUrl(this.PATH_GALLERY_PREFIX + e + "/");
    }
    galleryPagesUrl(e) {
        return this.apiUrl(this.PATH_GALLERIES_PREFIX + e + "/pages");
    }
    galleryDetailsUrl(e) {
        return this.apiUrl(this.PATH_GALLERIES_PREFIX + e, {
            include: "related,favorite"
        });
    }
    galleryCommentsUrl(e) {
        return this.apiUrl(this.PATH_GALLERIES_PREFIX + e + "/comments");
    }
    favoriteUrl(e) {
        return this.apiUrl(this.PATH_GALLERIES_PREFIX + e + "/favorite");
    }
    legacyFavoriteUrl(e, t) {
        return this.siteUrl(this.PATH_LEGACY_GALLERY_PREFIX + e + "/" + t);
    }
    favoritesUrl(e) {
        return this.apiUrl(this.PATH_FAVORITES, {
            page: e
        });
    }
    searchUrl(e, t, a) {
        return this.apiUrl(this.PATH_SEARCH, {
            query: e,
            page: t,
            sort: a
        });
    }
    taggedGalleryUrl(e) {
        return this.apiUrl(this.PATH_GALLERIES_TAGGED, {
            tag_id: e
        });
    }
    webFavoritesUrl(e) {
        return this.siteUrl(this.PATH_FAVORITES, {
            page: e
        });
    }
    webGalleryPageUrl(e, t = 1) {
        return this.siteUrl(this.PATH_GALLERY_PREFIX + e + "/" + t + "/");
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
    galleryImageUrl(e, t, a) {
        return this.joinUrl(this.imageServer, this.PATH_GALLERIES_PREFIX + e + "/" + t + "." + a);
    }
    categoryPath(e, t, a) {
        return "/" + e + "/" + encodeURIComponent(t) + a;
    }
    galleryIdFromHref(e) {
        let t = this.GALLERY_HREF_ID_REGEX.exec(String(e || ""));
        return t ? t[1] : "";
    }
    galleryIdFromLink(e) {
        let t = this.LINK_GALLERY_ID_REGEX.exec(String(e || ""));
        return t ? t[1] : null;
    }
    tagMetadataFromIds(e) {
        let t = [], a = "Unknown", i = e || [];
        for (let e = 0; e < i.length; e += 1) {
            let r = String(i[e]), s = Nhentai.nhentaiTags[r];
            null != s && t.push(s);
            let n = this.TAG_LANGUAGE_MAP[r];
            n && (a = n);
        }
        return {
            tags: t,
            language: a
        };
    }
    totalFromHeadingText(e) {
        this.NUMBER_REGEX.lastIndex = 0;
        let t = (e || "").match(this.NUMBER_REGEX);
        return t ? parseInt(t.join("")) : 0;
    }
    totalFromDocument(e, t) {
        return this.totalFromHeadingText(this.textOf(e.querySelector(t)));
    }
    tagIdFromCategoryDocument(e) {
        let t = e.querySelector(this.SELECTOR_CONTENT_HEADING_TAG_LINK), a = this.attrOf(t, "class").match(this.TAG_CLASS_ID_REGEX);
        return a ? a[1] : "";
    }
    textOf(e) {
        if (!e) return "";
        let t = e.text || e.textContent || "";
        return String(t).trim();
    }
    attrOf(e, t) {
        return e && e.attributes && e.attributes[t] || "";
    }
    firstNodeTextOf(e) {
        return e && e.nodes && 0 !== e.nodes.length ? this.textOf(e.nodes[0]) : "";
    }
    firstAttrOf(e, t) {
        if (!e) return "";
        for (let a = 0; a < t.length; a += 1) {
            let i = this.attrOf(e, t[a]);
            if (i) return i;
        }
        return "";
    }
    getImageSrc(e) {
        return this.firstAttrOf(e, this.IMAGE_SRC_ATTRS);
    }
    replaceAllCompat(e, t, a) {
        let i = String(e || "");
        return i.indexOf(t) < 0 ? i : i.split(t).join(a);
    }
    normalizeCategorySlug(e) {
        return this.replaceAllCompat(this.replaceAllCompat(e, " ", "-"), ".", "-");
    }
    normalizeSortPath(e) {
        return this.replaceAllCompat(e || "popular", "@", "-");
    }
    scriptTextContaining(e, t) {
        let a = e.querySelectorAll(this.SELECTOR_SCRIPT);
        for (let e = 0; e < a.length; e += 1) {
            let i = a[e].text || a[e].textContent || "";
            if (i.indexOf(t) >= 0) return i;
        }
        return "";
    }
    extractBetween(e, t, a, i) {
        let r = e.indexOf(t);
        if (r < 0) throw new Error(i + " start token not found");
        r += t.length;
        let s = e.indexOf(a, r);
        if (s < 0) throw new Error(i + " end token not found");
        return e.slice(r, s);
    }
    csrfTokenFromDocument(e) {
        try {
            let t = this.scriptTextContaining(e, "csrf_token");
            if (t) return this.extractBetween(t, 'csrf_token: "', '",', "csrf token");
        } catch (e) {}
        return "";
    }
    getImageExtension(e) {
        return this.IMAGE_EXTENSION_MAP[e] || "jpg";
    }
    collapseRepeatedImageExtensions(e) {
        return this.IMAGE_FORMAT_REGEX.lastIndex = 0, String(e || "").replace(this.IMAGE_FORMAT_REGEX, e => {
            this.IMAGE_SINGLE_FORMAT_REGEX.lastIndex = 0;
            let t = e.match(this.IMAGE_SINGLE_FORMAT_REGEX);
            return t ? t[0] : e;
        });
    }
    normalizeImageLoadUrl(e) {
        return e ? ((e = this.collapseRepeatedImageExtensions(e)).indexOf("/cover.") >= 0 && (this.COVER_HOST_REGEX.lastIndex = 0,
        e = e.replace(this.COVER_HOST_REGEX, this.thumbServer)), 0 === e.indexOf("//") ? this.URL_SCHEME + ":" + e : 0 !== e.indexOf("http") ? this.URL_PREFIX + this.stripLeadingSlashes(e) : e) : "";
    }
    _fixAndWrap(e) {
        return {
            url: this.normalizeImageLoadUrl(e),
            headers: this.galleryPageHeaders()
        };
    }
    toAbsoluteMediaUrl(e, t = !1) {
        return e ? 0 === e.indexOf("http") ? e : 0 === e.indexOf("//") ? this.URL_SCHEME + ":" + e : (0 === e.indexOf("/") && (e = e.slice(1)),
        (e.indexOf("cover") >= 0 || e.indexOf("thumb") >= 0) && (t = !0), this.joinUrl(t ? this.thumbServer : this.imageServer, e)) : e;
    }
    parseComicFromApi(e) {
        let t = e.tag_ids || [], a = this.tagMetadataFromIds(t);
        return new Comic({
            id: String(e.id),
            title: e.english_title || e.japanese_title || String(e.id),
            subtitle: "",
            cover: this.toAbsoluteMediaUrl(e.thumbnail, !0),
            tags: a.tags,
            description: String(e.id),
            language: a.language
        });
    }
    parseComicListFromApi(e) {
        return {
            comics: this.parseApiComicElements(e.result || []),
            maxPage: e.num_pages || 1
        };
    }
    formatTimestamp(e) {
        return this.formatDateObject(new Date(1e3 * Number(e)));
    }
    tagNamespace(e) {
        let t = String(e || "").toLowerCase();
        return this.TAG_NAMESPACE_MAP[t] || (e ? String(e).charAt(0).toUpperCase() + String(e).slice(1) : "Tags");
    }
    async deleteWithFallback(e, t) {
        return "function" == typeof Network.delete ? await Network.delete(e, t, null) : "function" == typeof Network.request ? await Network.request(e, "DELETE", t, null) : await Network.post(e, this.deleteOverrideHeaders(t), null);
    }
    mergeHeaders(e = {}, t = {}) {
        let a, i = {};
        for (a in e) this.hasOwn(e, a) && (i[a] = e[a]);
        for (a in t) this.hasOwn(t, a) && (i[a] = t[a]);
        return i;
    }
    xhrHeaders(e = {}) {
        return this.mergeHeaders(e, {
            "X-Requested-With": "XMLHttpRequest"
        });
    }
    csrfHeaders(e, t, a = {}) {
        return this.mergeHeaders(a, {
            "X-CSRFToken": e,
            Referer: t,
            "X-Requested-With": "XMLHttpRequest"
        });
    }
    deleteOverrideHeaders(e = {}) {
        return this.mergeHeaders(e, {
            "X-HTTP-Method-Override": "DELETE"
        });
    }
    isSuccessStatus(e) {
        return e >= 200 && e < 300;
    }
    throwStatusError(e, t = "") {
        if (401 === e || 403 === e) throw "Login expired";
        let a = "HTTP " + e;
        throw t && (a += " (" + t + ")"), a;
    }
    async getResponseOrThrow(e, t = {}) {
        let a = await Network.get(e, t);
        return this.isSuccessStatus(a.status) || this.throwStatusError(a.status, e), a;
    }
    async getBodyOrThrow(e, t = {}) {
        return (await this.getResponseOrThrow(e, t)).body;
    }
    parseJsonBody(e, t = "JSON response") {
        try {
            return JSON.parse(e || "null");
        } catch (e) {
            throw "Failed to parse " + t + ": " + String(e);
        }
    }
    async getJsonOrThrow(e, t = {}, a = "JSON response") {
        return this.parseJsonBody(await this.getBodyOrThrow(e, t), a);
    }
    async parseComicList(e, t = "search") {
        let a = new HtmlDocument(e), i = a.querySelectorAll(this.SELECTOR_GALLERY), r = i.length, s = null;
        switch (t) {
          case "search":
            r = this.totalFromDocument(a, this.SELECTOR_CONTENT_HEADING) || r;
            break;

          default:
            let e = this.tagIdFromCategoryDocument(a);
            if (!e) {
                r = this.totalFromDocument(a, this.SELECTOR_CONTENT_HEADING) || r;
                break;
            }
            let t = null;
            try {
                t = await this.getJsonOrThrow(this.taggedGalleryUrl(e), {}, "tagged galleries");
            } catch (e) {
                r = this.totalFromDocument(a, this.SELECTOR_CONTENT_HEADING) || r;
            }
            null != t && (t && null != t.num_pages && (s = t.num_pages), t && null != t.total && (r = t.total));
        }
        return {
            comics: this.parseComicElements(i),
            maxPage: s || Math.ceil(r / 25)
        };
    }
    createExploreConfig() {
        return [ {
            title: this.SOURCE_TITLE,
            type: "mixed",
            load: async e => {
                let t = this.siteUrl(this.PATH_ROOT, e && 1 !== e ? {
                    page: e
                } : null), a = new HtmlDocument(await this.getBodyOrThrow(t, {})), i = [], r = !e || 1 === e, s = 0;
                if (r) {
                    let e = a.querySelectorAll(this.SELECTOR_INDEX_POPULAR_GALLERY), t = this.parseComicElements(e);
                    s = t.length, i.push({
                        title: "Popular",
                        comics: t
                    });
                }
                let n = this.parseComicElementsRange(a.querySelectorAll(this.SELECTOR_INDEX_GALLERY), r ? s : 0);
                return i.push(n), {
                    data: i,
                    maxPage: 2e4
                };
            }
        } ];
    }
    async loadComicComments(e, t, a, i) {
        e = this.normalizeComicId(e);
        let r = await this.getJsonOrThrow(this.galleryCommentsUrl(e), {}, "comments");
        return {
            comments: this.commentsFromApi(r || []),
            maxPage: 1
        };
    }
    createCategoryConfig() {
        return {
            title: this.SOURCE_TITLE,
            parts: [ {
                name: "Language",
                type: "fixed",
                categories: this.LANGUAGE_CATEGORIES,
                itemType: "category",
                groupParam: "language"
            }, {
                name: "Tags",
                type: "random",
                randomNumber: 20,
                categories: this.NHENTAI_TAG_VALUES,
                itemType: "search"
            } ],
            enableRankingPage: !1
        };
    }
    createCategoryComicsConfig() {
        return {
            load: async (e, t, a, i) => await this.loadCategoryComics(e, t, a, i),
            optionList: [ {
                options: this.CATEGORY_SORT_OPTIONS
            } ]
        };
    }
    createSearchConfig() {
        return {
            load: async (e, t, a) => await this.loadSearchComics(e, t, a),
            optionList: [ {
                options: this.SEARCH_SORT_OPTIONS,
                label: "sort"
            } ],
            enableTagsSuggestions: !0
        };
    }
    createFavoritesConfig() {
        return {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, a) => await this.addOrDelFavorite(e, t, a),
            loadComics: async (e, t) => await this.loadFavoriteComics(e, t)
        };
    }
    createComicConfig() {
        return {
            onThumbnailLoad: e => this._fixAndWrap(e),
            onImageLoad: e => this._fixAndWrap(e),
            loadInfo: async e => {
                e = this.normalizeComicId(e);
                let t = await Network.get(this.galleryDetailsUrl(e), {});
                if (200 === t.status) {
                    let a = await this.loadComicInfoFromApi(e, t.body);
                    return a.csrfToken = "", a;
                }
                return await this.loadComicInfoFromWeb(e);
            },
            loadEp: async (e, t) => {
                e = this.normalizeComicId(e);
                let a = await this.loadEpisodeImagesFromApi(e);
                if (a.length > 0) return {
                    images: a
                };
                try {
                    return {
                        images: await this.loadEpisodeImagesFromWeb(e)
                    };
                } catch (e) {
                    throw "Failed to extract gallery images: " + String(e);
                }
            },
            loadComments: async (e, t, a, i) => await this.loadComicComments(e, t, a, i),
            sendComment: async (e, t, a, i) => {
                throw "Not implemented";
            },
            idMatch: "^(\\d+|nh\\d+|nhentai\\d+)$",
            onClickTag: (e, t) => ({
                action: "category",
                keyword: t,
                param: e
            }),
            link: {
                domains: this.LINK_DOMAINS,
                linkToId: e => this.galleryIdFromLink(e)
            },
            enableTagsTranslate: !0
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const i = String(null == e ? "" : e).trim() || t;
    return a ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), o = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${r}/${s}@${n}`;
    const h = o ? `${o}/${l}` : l;
    return `${i}/${r}/${s}@${n}/${l.startsWith(`${o}/`) ? l : h}`;
}

Nhentai.URL_SCHEME = "https", Nhentai.URL_PREFIX = Nhentai.URL_SCHEME + "://", Nhentai.DOMAIN = "nhentai.net",
Nhentai.BASE_ORIGIN = Nhentai.URL_PREFIX + Nhentai.DOMAIN, Nhentai.BASE_URL = Nhentai.BASE_ORIGIN,
Nhentai.PATH_API_PREFIX = "/api/v2", Nhentai.API_BASE_URL = Nhentai.BASE_ORIGIN + Nhentai.PATH_API_PREFIX,
Nhentai.IMAGE_SERVER_HOST = "i3." + Nhentai.DOMAIN, Nhentai.THUMB_SERVER_HOST = "t3." + Nhentai.DOMAIN,
Nhentai.IMAGE_SERVER_URL = Nhentai.URL_PREFIX + Nhentai.IMAGE_SERVER_HOST, Nhentai.THUMB_SERVER_URL = Nhentai.URL_PREFIX + Nhentai.THUMB_SERVER_HOST,
Nhentai.LINK_DOMAINS = Object.freeze([ Nhentai.DOMAIN ]), Nhentai.PATH_ROOT = "/",
Nhentai.PATH_GALLERY_PREFIX = "/g/", Nhentai.PATH_GALLERIES_PREFIX = "/galleries/",
Nhentai.PATH_FAVORITES = "/favorites", Nhentai.PATH_SEARCH = "/search", Nhentai.PATH_GALLERIES_TAGGED = "/galleries/tagged",
Nhentai.PATH_LOGIN = "/login/?next=/", Nhentai.PATH_REGISTER = "/register/", Nhentai.PATH_LEGACY_GALLERY_PREFIX = "/api/gallery/",
Nhentai.DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
Nhentai.GALLERY_PAGE_HEADERS = Object.freeze({
    Referer: Nhentai.BASE_URL + "/",
    "User-Agent": Nhentai.DEFAULT_USER_AGENT
}), Nhentai.SELECTOR_GALLERY = "div.gallery", Nhentai.SELECTOR_TAG_CONTAINER = "div.tag-container",
Nhentai.SELECTOR_TAG_NAME = "span.name", Nhentai.SELECTOR_SCRIPT = "script", Nhentai.SOURCE_TITLE = "nhentai",
Nhentai.SELECTOR_CARD_LINK = "a", Nhentai.SELECTOR_CARD_IMAGE = "img", Nhentai.SELECTOR_CARD_CAPTION = "div.caption",
Nhentai.SELECTOR_COVER_IMAGE = "div#cover > a > img", Nhentai.SELECTOR_MAIN_TITLE = "h1.title",
Nhentai.SELECTOR_SECONDARY_TITLE = "h2.title", Nhentai.SELECTOR_UPLOAD_TIME = "time",
Nhentai.SELECTOR_FAVORITE_TEXT = "button#favorite > span.text", Nhentai.SELECTOR_GALLERY_THUMB_IMAGE = "a.gallerythumb > img",
Nhentai.SELECTOR_CONTENT_HEADING = "div#content > h1", Nhentai.SELECTOR_CONTENT_HEADING_TAG_LINK = "div#content > h1 > a",
Nhentai.SELECTOR_INDEX_POPULAR_GALLERY = "div.container.index-container.index-popular > div.gallery",
Nhentai.SELECTOR_INDEX_GALLERY = "div.container.index-container > div.gallery",
Nhentai.IMAGE_FORMATS = "jpg|png|webp|gif", Nhentai.IMAGE_FORMAT_REGEX = /(\.(jpg|png|webp|gif))+/g,
Nhentai.IMAGE_SINGLE_FORMAT_REGEX = /\.(jpg|png|webp|gif)/g, Nhentai.GALLERY_HREF_ID_REGEX = /\/g\/(\d+)/,
Nhentai.LINK_GALLERY_ID_REGEX = /\/g\/(\d+)\/?$/, Nhentai.TAG_CLASS_ID_REGEX = /tag-(\d+)/,
Nhentai.NUMBER_REGEX = /\d+/g, Nhentai.COVER_HOST_REGEX = /https?:\/\/[it]\d\.nhentai\.net/g,
Nhentai.IMAGE_SRC_ATTRS = Object.freeze([ "data-src", "data-original", "src" ]),
Nhentai.TRANSLATION_KEYS = Object.freeze([ "Tags", "Language", "Recent", "Popular Today", "Popular Week", "Popular Month", "Popular All", "sort", "Languages", "Artists", "Characters", "Groups", "Parodies", "Categories" ]),
Nhentai.CATEGORY_PARAM_MAP = Object.freeze({
    tags: "tag",
    languages: "language",
    artists: "artist",
    characters: "character",
    parodies: "parody",
    groups: "group",
    categories: "category"
}), Nhentai.TAG_NAMESPACE_MAP = Object.freeze({
    language: "Languages",
    artist: "Artists",
    character: "Characters",
    group: "Groups",
    parody: "Parodies",
    category: "Categories",
    tag: "Tags"
}), Nhentai.TAG_LANGUAGE_MAP = Object.freeze({
    12227: "English",
    6346: "日本語",
    29963: "中文"
}), Nhentai.IMAGE_EXTENSION_MAP = Object.freeze({
    p: "png",
    g: "gif",
    w: "webp"
}), Nhentai.LANGUAGE_CATEGORIES = Object.freeze([ "chinese", "english", "japanese" ]),
Nhentai.CATEGORY_SORT_OPTIONS = Object.freeze([ "/-Recent", "/popular@today-Popular Today", "/popular@week-Popular Week", "/popular@month-Popular Month", "/popular-Popular All" ]),
Nhentai.SEARCH_SORT_OPTIONS = Object.freeze([ "date-Recent", "popular-today-Popular Today", "popular-week-Popular Week", "popular-month-Popular Month", "popular-Popular All" ]),
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
        Categories: "分类"
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
        Categories: "分類"
    }
}, Nhentai.TRANSLATION_DATA.zh_CN = Object.freeze(Nhentai.TRANSLATION_DATA.zh_CN),
Nhentai.TRANSLATION_DATA.zh_TW = Object.freeze(Nhentai.TRANSLATION_DATA.zh_TW),
Nhentai.TRANSLATION_DATA = Object.freeze(Nhentai.TRANSLATION_DATA), Nhentai.nhentaiTags = {
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
    11924: "kagerou imaizumi"
}, Nhentai.nhentaiTags = Object.freeze(Nhentai.nhentaiTags), Nhentai.nhentaiTagValues = Object.freeze(function() {
    let e = [];
    for (let t in Nhentai.nhentaiTags || {}) Object.prototype.hasOwnProperty.call(Nhentai.nhentaiTags, t) && e.push(Nhentai.nhentaiTags[t]);
    return e;
}());

"use strict";
