class Ehentai extends ComicSource {
    constructor() {
        super(), this.name = "ehentai", this.key = "ehentai", this.version = "1.2.0", this.minAppVersion = "1.5.3",
        this.url = resolvePluginUpdateUrl("ehentai.js"), this.apikey = null, this.uid = null,
        this._accountFieldNames = [ "ipb_member_id", "ipb_pass_hash", "igneous", "star" ],
        this._cachedDomain = null, this._cachedBaseUrl = null, this._cachedApiUrl = null,
        this._accountStoreCache = null, this._abuseResponsePattern = /your ip address has been banned|access denied|request denied|temporarily banned/i,
        this.requestState = {
            queues: new Map,
            inflight: new Map,
            cooldownUntil: new Map
        }, this.responseCache = new Map, this.thumbnailCache = new Map, this.keyCache = new Map,
        this.galleryInfoCache = new Map, this.imageSessionCache = new Map, this.account = createEhentaiAccountFeature(this),
        this.explore = createEhentaiExploreFeature(this), this.category = createEhentaiCategory(),
        this.categoryComics = createEhentaiCategoryComics(this), this.search = createSearchFeature(this),
        this.favorites = createFavoritesFeature(this), this.comic = createComicFeature(this),
        this.settings = createSettings(this), this.translation = i18n;
    }
    parseUrl(e) {
        return parseGalleryUrl(e);
    }
    get requestClient() {
        return this._requestClient || (this._requestClient = new EhentaiRequestClient(this)),
        this._requestClient;
    }
    get imageSessions() {
        return this._imageSessions || (this._imageSessions = new ImageLoadingSessionManager(this)),
        this._imageSessions;
    }
    getErrorMessage(e) {
        return ehentaiGetErrorMessage(e);
    }
    isRedirectError(e) {
        return ehentaiIsRedirectError(e);
    }
    isAbuseResponseBody(e) {
        return ehentaiIsAbuseResponseBody(this, e);
    }
    hasNonWhitespace(e) {
        return hasNonWhitespaceText(e);
    }
    firstNonWhitespaceChar(e) {
        return ehentaiFirstNonWhitespaceChar(e);
    }
    formatRequestError(e, t) {
        return ehentaiFormatRequestError(e, t);
    }
    formatResponseError(e, t) {
        return ehentaiFormatResponseError(this, e, t);
    }
    requireStatus(e, t, r = 200) {
        return ehentaiRequireStatus(this, e, t, r);
    }
    requireNonEmptyBody(e, t) {
        return ehentaiRequireNonEmptyBody(this, e, t);
    }
    requireHtmlBody(e, t) {
        return ehentaiRequireHtmlBody(this, e, t);
    }
    parseJsonResponse(e, t) {
        return ehentaiParseJsonResponse(this, e, t);
    }
    async withDocument(e, t) {
        return ehentaiWithDocument(e, t);
    }
    buildRequestHeaders(e, t, r, n) {
        return ehentaiBuildRequestHeaders(this, e, t, r, n);
    }
    async checkEHEvent() {
        return ehentaiCheckEvent(this);
    }
    get baseUrl() {
        return ehentaiResolveBaseUrl(this);
    }
    get apiUrl() {
        return ehentaiResolveApiUrl(this);
    }
    get accountFieldNames() {
        return this._accountFieldNames;
    }
    normalizeAccountValues(e) {
        return ehentaiNormalizeAccountValues(this, e);
    }
    createAccountCookies(e) {
        return ehentaiCreateAccountCookies(this, e);
    }
    applyCookiesFromValues(e) {
        return ehentaiApplyCookiesFromValues(this, e);
    }
    clearRuntimeCaches() {
        return ehentaiClearRuntimeCaches(this);
    }
    clearSessionCookies() {
        return ehentaiClearSessionCookies();
    }
    loadAccountStore() {
        return ehentaiLoadAccountStore(this);
    }
    saveAccountStore(e) {
        return ehentaiSaveAccountStore(this, e);
    }
    getAccountDisplayName(e, t) {
        return ehentaiGetAccountDisplayName(this, e, t);
    }
    upsertAccountProfile(e, t) {
        return ehentaiUpsertAccountProfile(this, e, t);
    }
    async captureAccountFromCookieJar(e) {
        return ehentaiCaptureAccountFromCookieJar(this, e);
    }
    async collectAccountValuesFromCookieDomains() {
        return ehentaiCollectAccountValuesFromCookieDomains(this);
    }
    async activateAccountProfile(e) {
        return ehentaiActivateAccountProfile(this, e);
    }
    logoutAccountSession() {
        return ehentaiLogoutAccountSession(this);
    }
    getStarsFromPosition(e) {
        return ehentaiParseStarsFromPosition(e);
    }
    async onLoadFailed(e = null) {
        return ehentaiOnLoadFailed(this, e);
    }
    async getGalleries(e, t) {
        return ehentaiGetGalleries(this, e, t);
    }
}

function hasValue(e) {
    return null != e && "" !== e;
}

function buildQuery(e) {
    return Object.entries(e).filter(([, e]) => hasValue(e)).map(([e, t]) => `${encodeURIComponent(e)}=${encodeURIComponent(String(t))}`).join("&");
}

function buildFormBody(e) {
    return Object.entries(e).filter(([, e]) => null != e).map(([e, t]) => `${encodeURIComponent(e)}=${encodeURIComponent(String(t))}`).join("&");
}

const URL_HOSTS = {
    EH: "e-hentai.org",
    EX: "exhentai.org",
    FORUMS: "forums.e-hentai.org",
    API_EH: "api.e-hentai.org"
};

function buildBaseUrl(e) {
    return `https://${e}`;
}

function buildPathUrl(e, t) {
    const r = String(t || "").replace(/^\/+/, "");
    return r ? `${e}/${r}` : String(e);
}

function buildPathQueryUrl(e, t, r, n = !1) {
    const i = buildPathUrl(e, t), o = buildQuery(r || {});
    return o ? `${i}?${o}` : n ? `${i}?` : i;
}

function buildApiUrl(e) {
    return e.includes(URL_HOSTS.EX) ? buildPathUrl(buildBaseUrl(URL_HOSTS.EX), "api.php") : buildPathUrl(buildBaseUrl(URL_HOSTS.API_EH), "api.php");
}

function buildEhNewsUrl() {
    return buildPathUrl(buildBaseUrl(URL_HOSTS.EH), "news.php");
}

function buildForumsLoginUrl() {
    return buildPathQueryUrl(buildBaseUrl(URL_HOSTS.FORUMS), "index.php", {
        act: "Login",
        CODE: "00"
    });
}

function buildForumsHomeUrl() {
    return `${buildPathUrl(buildBaseUrl(URL_HOSTS.FORUMS), "")}/`;
}

function buildForumsIndexRefererUrl() {
    return buildPathQueryUrl(buildBaseUrl(URL_HOSTS.FORUMS), "index.php", {}, !0);
}

function buildEhCookieUrl() {
    return buildBaseUrl(URL_HOSTS.EH);
}

function buildExCookieUrl() {
    return buildBaseUrl(URL_HOSTS.EX);
}

function buildForumsCookieUrl() {
    return buildBaseUrl(URL_HOSTS.FORUMS);
}

function buildPopularUrl(e) {
    return buildPathUrl(e, "popular");
}

function buildWatchedUrl(e) {
    return buildPathUrl(e, "watched");
}

function buildGalleryPageUrl(e, t) {
    return hasValue(t) ? buildPathQueryUrl(e, "", {
        p: t
    }) : e;
}

function parseGalleryUrl(e) {
    const t = String(e || "").split("?")[0].split("#")[0].split("/");
    return {
        id: t[4],
        token: t[5]
    };
}

function buildFavoritesUrl(e, t) {
    return hasValue(t) && "-1" !== t ? buildPathQueryUrl(e, "favorites.php", {
        favcat: t
    }) : buildPathUrl(e, "favorites.php");
}

function buildSearchUrl(e, t, r, n) {
    return buildPathQueryUrl(e, "", {
        f_search: t,
        f_cats: r ? String(r) : null,
        f_srdd: n || null
    });
}

function buildToplistUrl(e, t, r) {
    return buildPathQueryUrl(e, "toplist.php", {
        tl: t,
        p: r
    });
}

function buildGalleryPopupUrl(e, t, r) {
    return buildPathQueryUrl(e, "gallerypopups.php", {
        gid: t,
        t: r,
        act: "addfav"
    });
}

function buildArchiverUrl(e, t, r) {
    return buildPathQueryUrl(e, "archiver.php", {
        gid: t,
        token: r
    });
}

function buildCommentsUrl(e) {
    return buildPathQueryUrl(e, "", {
        hc: 1
    });
}

function extractHost(e) {
    const t = String(e || "").match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return t ? t[1] : null;
}

function buildArchiveResultUrl(e, t) {
    const r = extractHost(e);
    return r && t ? `${buildBaseUrl(r)}${String(t)}` : null;
}

function normalizeGalleryLink(e, t) {
    const r = parseGalleryUrl(t);
    return hasValue(r.id) && hasValue(r.token) ? `${e}/g/${r.id}/${r.token}/` : null;
}

function normalizeThumbnailHost(e) {
    return String(e || "").includes("s.exhentai.org") ? String(e).replace("s.exhentai.org", "ehgt.org") : e;
}

function imageKeyFromPageUrl(e) {
    return String(e || "").split("/")[4] || "";
}

function ehentaiGetErrorMessage(e) {
    return null == e ? "Unknown error" : "string" == typeof e ? e : e instanceof Error && e.message || "object" == typeof e && null !== e && "string" == typeof e.message && e.message.length > 0 ? e.message : String(e);
}

function ehentaiIsRedirectError(e) {
    return ehentaiGetErrorMessage(e).toLowerCase().includes("redirect");
}

function ehentaiIsAbuseResponseBody(e, t) {
    let r = String(t && t.body || t || "");
    return !hasNonWhitespaceText(r) || e._abuseResponsePattern.test(r);
}

function ehentaiFirstNonWhitespaceChar(e) {
    let t = String(e || "");
    for (let e = 0; e < t.length; e++) {
        let r = t.charCodeAt(e);
        if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return t[e];
    }
    return "";
}

function ehentaiFormatRequestError(e, t) {
    let r = ehentaiGetErrorMessage(t), n = r.toLowerCase();
    return n.includes("redirect") ? `${e} failed: request was redirected by the server` : n.includes("timeout") || n.includes("network") || n.includes("socket") ? `${e} failed: network error (${r})` : `${e} failed: ${r}`;
}

function ehentaiFormatResponseError(e, t, r) {
    let n = r ? r.status : null, i = String(r && r.body ? r.body : "").trim();
    return 403 === n || 429 === n ? `${t} failed: server returned ${n}` : 0 === i.length ? `${t} failed: empty response from server` : e.isAbuseResponseBody(i) ? `${t} failed: access was denied by the server` : `${t} failed: invalid status code ${n}`;
}

function ehentaiRequireStatus(e, t, r, n) {
    let i = null == n ? 200 : n;
    if (!r || r.status !== i) throw e.formatResponseError(t, r || {});
}

function ehentaiRequireNonEmptyBody(e, t, r) {
    const n = String(r && r.body || "");
    if (!hasNonWhitespaceText(n)) throw e.formatResponseError(t, r || {});
    return n;
}

function ehentaiRequireHtmlBody(e, t, r) {
    const n = ehentaiRequireNonEmptyBody(e, t, r);
    if ("<" !== ehentaiFirstNonWhitespaceChar(n)) throw `${t} failed: invalid HTML response`;
    return n;
}

function ehentaiParseJsonResponse(e, t, r) {
    ehentaiRequireNonEmptyBody(e, t, r);
    try {
        return JSON.parse(r.body);
    } catch (e) {
        throw `${t} failed: invalid JSON response`;
    }
}

async function ehentaiWithDocument(e, t) {
    const r = new HtmlDocument(e);
    try {
        return await t(r);
    } finally {
        r.dispose();
    }
}

function ehentaiBuildRequestHeaders(e, t, r, n, i) {
    const o = i || {}, a = {
        ...n || {}
    };
    return "json-api" !== o.headerProfile || a["Content-Type"] || (a["Content-Type"] = "application/json"),
    "form-urlencoded" !== o.headerProfile || a["Content-Type"] || (a["Content-Type"] = "application/x-www-form-urlencoded"),
    "gallery-view" !== o.headerProfile || a.cookie || (a.cookie = "nw=1"), "thumbnail" !== o.headerProfile || a.referer || (a.referer = e.baseUrl),
    "forums-browser" === o.headerProfile && (a.accept || (a.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"),
    a["accept-encoding"] || (a["accept-encoding"] = "gzip, deflate, br"), a["accept-language"] || (a["accept-language"] = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7")),
    o.refererUrl && !a.referer && (a.referer = o.refererUrl), "dart-io" !== o.networkClient || a.http_client || (a.http_client = "dart:io"),
    a;
}

async function ehentaiCheckEvent(e) {
    if (e.isLogged && e.loadSetting("ehevent")) try {
        const t = e.loadData("lastEventTime"), r = (new Date).toISOString().split("T")[0];
        if (t === r) return;
        const n = await e.requestClient.get(buildEhNewsUrl(), {}, {
            action: "Failed to load event news",
            requestKey: "event-news"
        });
        if (200 !== n.status || e.isAbuseResponseBody(n.body)) return;
        e.saveData("lastEventTime", r), await e.withDocument(n.body, async e => {
            const t = e.getElementById("eventpane");
            if (null == t) return;
            const r = t.querySelector("div > p:nth-child(2)");
            null != r && UI.showMessage(r.text);
        });
    } catch (e) {}
}

function ehentaiResolveBaseUrl(e) {
    const t = e.loadSetting("domain");
    return t === e._cachedDomain && e._cachedBaseUrl || (e._cachedDomain = t, e._cachedBaseUrl = buildBaseUrl(t),
    e._cachedApiUrl = buildApiUrl(e._cachedBaseUrl)), e._cachedBaseUrl;
}

function ehentaiResolveApiUrl(e) {
    return e._cachedApiUrl || (e._cachedApiUrl = buildApiUrl(e.baseUrl)), e._cachedApiUrl;
}

function ehentaiParseStarsFromPosition(e) {
    let t = String(e || ""), r = 0;
    for (;";" !== t[r] && (r++, r !== t.length); ) ;
    switch (t.substring(0, r)) {
      case "background-position:0px -1px":
        return 5;

      case "background-position:0px -21px":
        return 4.5;

      case "background-position:-16px -1px":
        return 4;

      case "background-position:-16px -21px":
        return 3.5;

      case "background-position:-32px -1px":
        return 3;

      case "background-position:-32px -21px":
        return 2.5;

      case "background-position:-48px -1px":
        return 2;

      case "background-position:-48px -21px":
        return 1.5;

      case "background-position:-64px -1px":
        return 1;

      default:
        return .5;
    }
}

async function ehentaiOnLoadFailed(e, t) {
    let r;
    try {
        r = await Network.getCookies(buildEhCookieUrl());
    } catch (t) {
        throw e.formatRequestError("Failed to recover session cookies", t);
    }
    throw r.forEach(e => {
        e.domain = ".exhentai.org";
    }), r = r.filter(e => "igneous" !== e.name), Network.deleteCookies(buildExCookieUrl()),
    Network.setCookies(buildExCookieUrl(), r), `You may not have permission to access this page${t ? ` (${t})` : ""}. Please check your network or try to login again.`;
}

async function ehentaiGetGalleries(e, t, r) {
    try {
        await e.checkEHEvent();
    } catch (e) {}
    let n;
    try {
        n = await e.requestClient.get(t, {}, {
            action: "Failed to load gallery list",
            requestKey: `galleries:${t}`
        });
    } catch (t) {
        throw e.isRedirectError(t) && await e.onLoadFailed("request was redirected"), e.formatRequestError("Failed to load gallery list", t);
    }
    if (200 !== n.status) throw e.formatResponseError("Failed to load gallery list", n);
    if (hasNonWhitespaceText(n.body) || await e.onLoadFailed("empty response from gallery list"),
    "<" !== ehentaiFirstNonWhitespaceChar(n.body)) {
        if (e.isAbuseResponseBody(n.body)) throw "Your IP address has been banned";
        throw "Failed to load gallery list";
    }
    const i = new HtmlDocument(n.body);
    try {
        return parseGalleryList({
            document: i,
            source: e,
            url: t,
            isLeaderBoard: r
        });
    } finally {
        i.dispose();
    }
}

function ehentaiCreateEmptyAccountStore() {
    return {
        version: 1,
        activeProfileId: null,
        profiles: []
    };
}

function ehentaiNormalizeAccountValues(e, t) {
    let r = [];
    for (let n = 0; n < e.accountFieldNames.length; n++) r.push(String(t && t[n] || ""));
    return r;
}

function ehentaiCreateAccountCookies(e, t) {
    let r = ehentaiNormalizeAccountValues(e, t), n = [];
    for (let t = 0; t < e.accountFieldNames.length; t++) {
        let i = e.accountFieldNames[t], o = r[t];
        n.push(new Cookie({
            name: i,
            value: o,
            domain: ".e-hentai.org"
        })), n.push(new Cookie({
            name: i,
            value: o,
            domain: ".exhentai.org"
        }));
    }
    return n;
}

function ehentaiApplyCookiesFromValues(e, t) {
    let r = e.createAccountCookies(t);
    Network.deleteCookies(buildEhCookieUrl()), Network.deleteCookies(buildExCookieUrl()),
    Network.setCookies(buildEhCookieUrl(), r), Network.setCookies(buildExCookieUrl(), r);
}

function ehentaiClearRuntimeCaches(e) {
    e.responseCache.clear(), e.thumbnailCache.clear(), e.keyCache.clear(), e.galleryInfoCache.clear(),
    e.imageSessionCache.clear(), e.apikey = null, e.uid = null;
}

function ehentaiClearSessionCookies() {
    Network.deleteCookies(buildEhCookieUrl()), Network.deleteCookies(buildForumsCookieUrl()),
    Network.deleteCookies(buildExCookieUrl());
}

function ehentaiLoadAccountStore(e) {
    if (e._accountStoreCache) return e._accountStoreCache;
    let t = e.loadData("accountStore");
    if (!t) return e._accountStoreCache = ehentaiCreateEmptyAccountStore(), e._accountStoreCache;
    let r = null;
    if ("string" == typeof t) try {
        r = JSON.parse(t);
    } catch (e) {
        r = null;
    } else "object" == typeof t && (r = t);
    if (!r || !Array.isArray(r.profiles)) return e._accountStoreCache = ehentaiCreateEmptyAccountStore(),
    e._accountStoreCache;
    let n = r.profiles.map((t, r) => {
        let n = ehentaiNormalizeAccountValues(e, t && t.values);
        return {
            id: String(t && t.id || `${Date.now()}_${r}`),
            name: t && t.name ? String(t.name) : "",
            values: n,
            createdAt: String(t && t.createdAt || (new Date).toISOString()),
            lastUsedAt: String(t && t.lastUsedAt || (new Date).toISOString())
        };
    }).filter(e => e.values[0] && e.values[1]), i = r.activeProfileId && n.some(e => e.id === r.activeProfileId) ? String(r.activeProfileId) : null;
    return e._accountStoreCache = {
        version: 1,
        activeProfileId: i,
        profiles: n
    }, e._accountStoreCache;
}

function ehentaiSaveAccountStore(e, t) {
    let r = {
        version: 1,
        activeProfileId: t.activeProfileId || null,
        profiles: t.profiles || []
    };
    e._accountStoreCache = r, e.saveData("accountStore", JSON.stringify(r));
}

function ehentaiGetAccountDisplayName(e, t, r) {
    let n = t && t.name ? t.name : `${e.translate("account")} ${r + 1}`, i = t && t.values ? t.values[0] : "";
    return i ? `${n} (${i})` : n;
}

function ehentaiUpsertAccountProfile(e, t, r) {
    let n = ehentaiNormalizeAccountValues(e, t);
    if (!n[0] || !n[1]) return null;
    let i = e.loadAccountStore(), o = (new Date).toISOString(), a = i.profiles.find(e => e.values[0] === n[0] && e.values[1] === n[1]);
    if (a) return a.values = n, r && (a.name = r), a.lastUsedAt = o, i.activeProfileId = a.id,
    e.saveAccountStore(i), a.id;
    let l = `${Date.now()}_${Math.floor(1e5 * Math.random())}`;
    return i.profiles.push({
        id: l,
        name: r || "",
        values: n,
        createdAt: o,
        lastUsedAt: o
    }), i.activeProfileId = l, e.saveAccountStore(i), l;
}

async function ehentaiCaptureAccountFromCookieJar(e, t) {
    let r = await e.collectAccountValuesFromCookieDomains();
    return e.upsertAccountProfile(r, t || "");
}

async function ehentaiCollectAccountValuesFromCookieDomains(e) {
    let t = [ buildForumsCookieUrl(), buildEhCookieUrl(), buildExCookieUrl() ], r = new Map;
    for (let e of t) {
        let t = [];
        try {
            t = await Network.getCookies(e);
        } catch (e) {
            t = [];
        }
        for (let e of t) {
            if (!e || !e.name) continue;
            let t = String(e.name), n = String(e.value || "");
            0 !== n.length && (r.has(t) || r.set(t, n));
        }
    }
    let n = [];
    for (let t of e.accountFieldNames) n.push(r.get(t) || "");
    return n;
}

async function ehentaiActivateAccountProfile(e, t) {
    let r = e.loadAccountStore(), n = r.profiles.find(e => e.id === t);
    if (!n) throw "Account profile not found";
    return e.applyCookiesFromValues(n.values), e.clearRuntimeCaches(), n.lastUsedAt = (new Date).toISOString(),
    r.activeProfileId = n.id, e.saveAccountStore(r), n;
}

function ehentaiLogoutAccountSession(e) {
    e.clearSessionCookies(), e.clearRuntimeCaches();
    let t = e.loadAccountStore();
    t.activeProfileId = null, e.saveAccountStore(t);
}

function buildRateGalleryPayload({galleryId: e, token: t, rating: r, apikey: n, apiuid: i}) {
    return {
        gid: e,
        token: t,
        method: "rategallery",
        rating: r,
        apikey: n,
        apiuid: i
    };
}

function buildVoteCommentPayload({galleryId: e, token: t, commentId: r, isUp: n, apikey: i, apiuid: o}) {
    return {
        gid: e,
        token: t,
        method: "votecomment",
        comment_id: r,
        comment_vote: n ? 1 : -1,
        apikey: i,
        apiuid: o
    };
}

function buildImageDispatchPayload({galleryId: e, imgKey: t, page: r, mpvkey: n, nl: i}) {
    return {
        gid: e,
        imgkey: t,
        method: "imagedispatch",
        page: r,
        mpvkey: n,
        nl: i
    };
}

function buildShowPagePayload({galleryId: e, imgKey: t, page: r, showkey: n, nl: i}) {
    return {
        gid: e,
        imgkey: t,
        method: "showpage",
        page: r,
        showkey: n,
        nl: i
    };
}

function buildAddFavoriteForm(e) {
    return buildFormBody({
        favcat: e,
        favnote: "",
        apply: "Add to Favorites",
        update: 1
    });
}

function buildDeleteFavoriteForm() {
    return buildFormBody({
        favcat: "favdel",
        favnote: "",
        apply: "Apply Changes",
        update: 1
    });
}

function buildCommentForm(e) {
    return buildFormBody({
        commenttext_new: e
    });
}

function buildArchiveDownloadForm(e) {
    if ("0" === e) return buildFormBody({
        dltype: "org",
        dlcheck: "Download Original Archive"
    });
    if ("1" === e) return buildFormBody({
        dltype: "res",
        dlcheck: "Download Resample Archive"
    });
    throw new Error("Invalid archive type");
}

function buildHathDownloadForm(e) {
    return buildFormBody({
        hathdl_xres: e
    });
}

function domainKey(e) {
    try {
        return new URL(e).hostname;
    } catch (e) {
        return "default";
    }
}

function thumbnailCacheKey(e, t) {
    return `${e}::${null != t ? t : "0"}`;
}

function parseGalleryList({document: e, source: t, url: r, isLeaderBoard: n}) {
    function i(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    function o(e, t, r) {
        return e && e.attributes && void 0 !== e.attributes[t] ? e.attributes[t] : r;
    }
    function a(e, t) {
        let r = e ? e.match(/\d+/) : null;
        if (!r) return t;
        let n = Number(r[0]);
        return isNaN(n) ? t : n;
    }
    const l = n ? 1 : 0, s = [];
    for (let n of e.querySelectorAll("table.itg.gltc > tbody > tr")) try {
        let e = n.children.length > 1 + l ? n.children[1 + l] : null;
        if (!e) continue;
        let u = e.children.length > 2 ? e.children[2] : null, c = i(u && u.children.length > 0 ? u.children[0] : null, ""), d = t.getStarsFromPosition(o(u && u.children.length > 1 ? u.children[1] : null, "style", "")), h = e;
        h && h.children.length > 1 && (h = h.children[1]), h && h.children.length > 0 && (h = h.children[0]),
        h && h.children.length > 0 && (h = h.children[0]);
        let p = o(h, "src", "");
        p && "d" === p[0] && (p = o(h, "data-src", p));
        let g = n.children.length > 2 + l ? n.children[2 + l] : null, m = g && g.children.length > 0 ? g.children[0] : null, f = i(m && m.children.length > 0 ? m.children[0] : null, "Unknown"), y = o(m, "href", ""), b = "", S = 0;
        try {
            if (r.includes("/favorites.php")) {
                let t = e;
                t.children.length > 1 && (t = t.children[1]), t.children.length > 1 && (t = t.children[1]),
                t.children.length > 1 && (t = t.children[1]), S = a(i(t && t.children.length > 1 ? t.children[1] : null, ""), 0);
            } else {
                let e = n.children.length > 3 + l ? n.children[3 + l] : null;
                S = a(i(e && e.children.length > 1 ? e.children[1] : null, ""), 0);
                let t = null;
                e && e.children.length > 0 && (t = e.children[0]), t && t.children.length > 0 && (t = t.children[0]),
                b = i(t, "");
            }
        } catch (e) {}
        let w = [], v = null, C = m && m.children.length > 1 ? m.children[1] : null;
        for (let e of C ? C.children : []) {
            let t = o(e, "title", "");
            if (t) {
                if (t.startsWith("language:")) {
                    let e = t.split(":")[1].trim();
                    v = "translated" === e ? v : e;
                    continue;
                }
                w.push(t);
            }
        }
        s.push(new Comic({
            id: y,
            title: f,
            subTitle: b,
            cover: p,
            tags: w,
            description: c,
            stars: d,
            maxPage: S,
            language: v
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("div.gl1t")) try {
        let e = i(r.querySelector("a"), "Unknown"), n = r.querySelectorAll("div.gl5t > div > div"), l = n.find(e => !isNaN(Date.parse(e.text)));
        l = i(l, "");
        let u = o(r.querySelector("img"), "src", ""), c = t.getStarsFromPosition(o(r.querySelector("div.gl5t > div > div.ir"), "style", "")), d = o(r.querySelector("a"), "href", ""), h = a(i(n.find(e => e.text.includes("page")), ""), 0);
        s.push(new Comic({
            id: d,
            title: e,
            cover: u,
            description: l,
            stars: c,
            maxPage: h
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.glte > tbody > tr")) try {
        let e = i(r.querySelector("td.gl2e > div > a > div > div.glink"), "Unknown"), n = r.querySelectorAll("td.gl2e > div > div.gl3e > div"), l = i(n.find(e => !isNaN(Date.parse(e.text))), "Unknown"), u = i(r.querySelector("td.gl2e > div > div.gl3e > div > a"), "Unknown"), c = o(r.querySelector("td.gl1e > div > a > img"), "src", ""), d = t.getStarsFromPosition(o(r.querySelector("td.gl2e > div > div.gl3e > div.ir"), "style", "")), h = o(r.querySelector("td.gl1e > div > a"), "href", ""), p = r.querySelectorAll("div.gt, div.gtl").map(e => o(e, "title", ""));
        p = p.filter(e => !!e);
        let g = a(i(n.find(e => e.text.includes("page")), ""), 0), m = null, f = p.find(e => e.startsWith("language:") && !e.includes("translated"));
        f && f.includes(":") && (m = f.split(":")[1].trim()), s.push(new Comic({
            id: h,
            title: e,
            subTitle: u,
            cover: c,
            tags: p,
            description: l,
            stars: d,
            maxPage: g,
            language: m
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.gltm > tbody > tr")) try {
        let e = i(r.querySelector("td.gl3m > a > div.glink"), "Unknown"), n = i(r.querySelectorAll("td.gl2m > div").find(e => !isNaN(Date.parse(e.text))), "Unknown"), a = i(r.querySelector("td.gl5m > div > a"), "Unknown"), l = r.querySelector("td.gl2m > div > div > img"), u = o(l, "src", "");
        u && "d" === u[0] && (u = o(l, "data-src", u));
        let c = t.getStarsFromPosition(o(r.querySelector("td.gl4m > div.ir"), "style", "")), d = o(r.querySelector("td.gl3m > a"), "href", "");
        s.push(new Comic({
            id: d,
            title: e,
            subTitle: a,
            cover: u,
            description: n,
            stars: c
        }));
    } catch (e) {}
    return {
        comics: s,
        next: o(e.querySelector("a#dnext"), "href", void 0)
    };
}

function parseGalleryDetails(e) {
    function t(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    function r(e, t) {
        if (!e) return null;
        let r = t.exec(e);
        return r ? r[0] : null;
    }
    let n = new Map;
    for (let r of e.querySelectorAll("div#taglist > table > tbody > tr")) {
        let e = r.children.length > 0 ? r.children[0] : null, i = r.children.length > 1 ? r.children[1] : null, o = t(e, "");
        if (!o) continue;
        let a = [], l = i ? i.children : [];
        for (let e of l) try {
            let t = e.children.length > 0 ? e.children[0] : null, r = t && t.attributes ? t.attributes.onclick : null;
            if (!r) continue;
            let n = r.split(":");
            if (n.length < 2) continue;
            let i = n[1].split("'")[0];
            i && a.push(i);
        } catch (e) {}
        n.set(o.substring(0, o.length - 1), a);
    }
    let i = "1";
    for (let t of e.querySelectorAll("td.gdt2")) if (t.text.includes("page")) {
        let e = r(t.text, /\d+/);
        e && (i = e);
    }
    let o = " Add to Favorites" !== t(e.querySelector("a#favoritelink"), ""), a = null;
    if (o) {
        let t = e.querySelector("div#fav"), r = null;
        if (t && t.children.length > 0 && t.children[0].attributes && (r = t.children[0].attributes.style),
        r && r.includes("background-position:0px -")) {
            let e = r.split("background-position:0px -");
            if (e.length > 1) {
                let t = e[1].split("px;")[0], r = Number(t);
                isNaN(r) || (a = ((r - 2) / 19).toString());
            }
        }
    }
    let l = "", s = e.querySelector("div#gleft > div#gd1 > div"), u = s && s.attributes ? s.attributes.style : "", c = RegExp("https?://([-a-zA-Z0-9.]+(/\\S*)?\\.(?:jpg|jpeg|gif|png|webp))").exec(u || "");
    c && (l = c[0]);
    let d = e.getElementById("gdn"), h = d && d.children.length > 0 ? d.children[0].text : void 0, p = e.getElementById("rating_label"), g = p ? p.text : "", m = g ? g.split(":") : [], f = m.length > 1 ? m[1].trim() : "0", y = Number(f), b = t(e.querySelector("div.cs"), "Unknown");
    n.set("Category", [ b ]), h && n.set("uploader", [ h ]);
    let S, w = t(e.querySelector("div#gdd > table > tbody > tr > td.gdt2"), ""), v = e.querySelectorAll("script").find(e => e.text.includes("var token")), C = RegExp("var\\s+(\\w+)\\s*=\\s*(.*?);", "g"), k = new Map, q = v && v.text ? v.text : "";
    for (;null !== (S = C.exec(q)); ) k.set(S[1], S[2]);
    let U = t(e.querySelector("h1#gn"), "Unknown"), R = t(e.querySelector("h1#gj"), null);
    return null != R && "" === R.trim() && (R = null), {
        title: U,
        subtitle: R,
        coverPath: l,
        tags: n,
        stars: y,
        maxPage: Number(i),
        isFavorited: o,
        folder: a,
        time: w,
        token: k.get("token"),
        apikey: k.get("apikey"),
        uid: k.get("apiuid")
    };
}

function parseThumbnailPage(e, t) {
    function r(e, t, r) {
        return e && e.attributes && void 0 !== e.attributes[t] ? e.attributes[t] : r;
    }
    const n = e => {
        let t = r(e, "style", "");
        if (!t) return "";
        let n = 0, i = 0, o = t.match(/width:(\d+)px/), a = t.match(/height:(\d+)px/);
        o && (n = Number(o[1])), a && (i = Number(a[1]));
        let l = t.split("background:transparent url(");
        if (l.length < 2) return "";
        let s = l[1], u = s.split(")")[0];
        if (!u) return "";
        let c = "";
        if (s.includes("px")) {
            let e = s.split(") -");
            if (e.length > 1) {
                let t = Number(e[1].split("px")[0]);
                isNaN(t) || (c += `x=${t}-${t + n}`);
            }
        }
        return i && (c += `${c ? "&" : ""}y=0-${i}`), c && (u += `@${c}`), u;
    }, i = (t, r) => e.querySelectorAll(t).map(e => r(e)).filter(e => !!e);
    let o = e.querySelectorAll("div.gdtm > div").map(e => n(e)).filter(e => !!e);
    if (o.push(...i("div.gdtl > a > img", e => r(e, "src", ""))), 0 === o.length) {
        const e = [ "div.gt100 > a > div", "div.gt200 > a > div" ];
        for (let t of e) o.push(...i(t, e => {
            let t = 0 === e.children.length ? e : e.children[0];
            return n(t);
        }));
    }
    let a = i("table.ptb > tbody > tr > td > a", e => r(e, "href", "")), l = 0;
    for (let e of a) {
        let t = e.split("="), r = Number(t.length > 1 ? t[1] : "");
        !isNaN(r) && r > l && (l = r);
    }
    let s = t ? Number(t) : 0;
    s += 1;
    let u = s > l ? null : s.toString();
    return {
        thumbnails: o,
        urls: i("div#gdt a", e => r(e, "href", "")),
        next: u
    };
}

function parseDispatchKey(e) {
    function t(e) {
        return e && "string" == typeof e.text ? e.text : "";
    }
    let r = e.querySelectorAll("script"), n = null, i = null;
    for (let e of r) {
        let r = t(e);
        if (!n && r.includes("showkey") && (n = e), !i && r.includes("mpvkey") && (i = e),
        n && i) break;
    }
    if (n) {
        let e = RegExp('showkey="(.*?)"', "g").exec(t(n));
        if (e) return {
            showkey: e[1]
        };
    }
    let o = t(i);
    if (o) {
        let e = "", t = [], r = o.split(";"), n = r.find(e => e.includes("mpvkey"));
        if (n) {
            let t = n.replace(/ /g, "").split("=");
            t.length > 1 && (e = t[1].replace(/"/g, ""));
        }
        let i = r.find(e => e.includes("imagelist"));
        if (i) {
            let e = i.replace(/ /g, "").split("=");
            if (e.length > 1) try {
                let r = JSON.parse(e[1]);
                t = Array.isArray(r) ? r.map(e => e && void 0 !== e.k ? e.k : null).filter(e => null != e) : [];
            } catch (e) {
                t = [];
            }
        }
        if (e || t.length > 0) return {
            mpvkey: e,
            imageKeys: t
        };
    }
    throw "Failed to get dispatch key";
}

function parseComments(e) {
    function t(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    function r(e, t) {
        if (e && e.attributes) return e.attributes[t];
    }
    let n = [];
    for (let i of e.querySelectorAll("div.c1")) {
        let e = t(i.querySelector("div.c3 > a"), ""), o = i.querySelector("div.c3"), a = o && o.text ? o.text : null, l = a ? a.split("Posted on") : [], s = l.length > 1 ? l[1] : "", u = s ? s.split("by") : [], c = u.length > 0 ? u[0] : "", d = c && c.trim ? c.trim() : "unknown", h = "", p = i.querySelector("div.c6");
        h = "undefined" != typeof appVersion ? p && "string" == typeof p.innerHTML ? p.innerHTML : "" : t(p, "");
        let g = Number(t(i.querySelector("div.c5 > span"), ""));
        isNaN(g) && (g = null);
        let m = "0", f = r(i.previousElementSibling, "name"), y = f ? f.match(/\d+/) : null;
        y && (m = y[0]);
        let b = r(i.querySelector(`a#comment_vote_up_${m}`), "style"), S = r(i.querySelector(`a#comment_vote_down_${m}`), "style"), w = "string" == typeof b && b.length > 0, v = "string" == typeof S && S.length > 0;
        n.push(new Comment({
            id: m,
            content: h,
            time: d,
            userName: e,
            score: g,
            voteStatus: w ? 1 : v ? -1 : 0
        }));
    }
    return {
        comments: n,
        maxPage: 1
    };
}

function parseArchiveOptions(e, t) {
    function r(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    let n = e.querySelector("div#db"), i = t.includes("exhentai") ? 1 : 3, o = [], a = e.querySelector("table");
    if (a) {
        let e = a.querySelectorAll("td");
        for (let t of e) {
            let e = t.querySelector("a");
            if (e) {
                let n = e.attributes ? e.attributes.onclick : null, i = n ? n.match(/do_hathdl\('([^']+)'\)/) : null;
                if (i) {
                    let n = i[1], a = r(e, "Unknown"), l = t.querySelectorAll("p"), s = l.length > 1 ? r(l[1], "Unknown") : "Unknown", u = l.length > 2 ? r(l[2], "Unknown") : "Unknown";
                    o.push({
                        id: `h@h_${n}`,
                        title: `H@H ${a}`,
                        description: `Size: ${s}, Cost: ${u}`
                    });
                }
            }
        }
    }
    let l = null;
    if (n && n.children.length > i && n.children[i].children.length > 0 && (l = n.children[i].children[0]),
    l) {
        let e = r(l.querySelector("div > strong"), "Unknown"), t = r(l.querySelector("p > strong"), "Unknown");
        o.push({
            id: "0",
            title: "Original",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    let s = null;
    if (n && n.children.length > i && n.children[i].children.length > 1 && (s = n.children[i].children[1]),
    s) {
        let e = r(s.querySelector("div > strong"), "Unknown"), t = r(s.querySelector("p > strong"), "Unknown");
        o.push({
            id: "1",
            title: "Resample",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    return o;
}

function parseArchiveError(e) {
    let t = e.querySelector("p.br");
    return t && "string" == typeof t.text ? t.text : null;
}

function parseFirstLink(e) {
    let t = e.querySelector("a");
    return t && t.attributes && t.attributes.href ? t.attributes.href : null;
}

function createAccountFeature(e, t) {
    return t;
}

function createExploreFeature(e, t) {
    return t;
}

function createSearchFeature(e) {
    return {
        loadNext: async (t, r, n) => {
            let i = [];
            try {
                i = JSON.parse(r[0]);
            } catch (e) {
                throw "Failed to parse search options";
            }
            let o = r[1], a = r[2], l = 1023;
            Array.isArray(i) || (i = [ i ]);
            for (let e of i) l -= 1 << Number(e);
            a && !t.includes("language:") && (t += ` language:${a}`);
            let s = buildSearchUrl(e.baseUrl, t, l, o);
            return e.getGalleries(null != n ? n : s, !1);
        },
        optionList: [ {
            type: "multi-select",
            options: [ "0-Misc", "1-Doujinshi", "2-Manga", "3-Artist CG", "4-Game CG", "5-Image Set", "6-Cosplay", "7-Asian Porn", "8-Non-H", "9-Western" ],
            label: "Category",
            default: [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ]
        }, {
            type: "dropdown",
            options: [ "-<none>", "0-0", "1-1", "2-2", "3-3", "4-4", "5-5" ],
            label: "Min Stars"
        }, {
            type: "dropdown",
            options: [ "-<none>", "chinese-Chinese", "english-English", "japanese-Japanese" ],
            label: "Language"
        } ],
        enableTagsSuggestions: !0
    };
}

function createFavoritesFeature(e) {
    return {
        multiFolder: !0,
        singleFolderForSingleComic: !0,
        addOrDelFavorite: async (t, r, n, i) => {
            let o = e.parseUrl(t), a = o.id, l = o.token;
            const s = buildGalleryPopupUrl(e.baseUrl, a, l);
            if (n) {
                let n = await e.requestClient.post(s, {}, buildAddFavoriteForm(r), {
                    action: "Failed to add favorite",
                    requestKey: `favorite:add:${t}:${r}`,
                    mutation: !0,
                    maxRetries: 0,
                    headerProfile: "form-urlencoded"
                });
                return e.requireStatus("Failed to add favorite", n), e.requireHtmlBody("Failed to add favorite", n),
                "ok";
            }
            {
                let r = await e.requestClient.post(s, {}, buildDeleteFavoriteForm(), {
                    action: "Failed to delete favorite",
                    requestKey: `favorite:del:${t}`,
                    mutation: !0,
                    maxRetries: 0,
                    headerProfile: "form-urlencoded"
                });
                return e.requireStatus("Failed to delete favorite", r), e.requireHtmlBody("Failed to delete favorite", r),
                "ok";
            }
        },
        loadFolders: async t => {
            try {
                await e.checkEHEvent();
            } catch (e) {}
            let r = await e.requestClient.get(buildFavoritesUrl(e.baseUrl, "-1"), {}, {
                action: "Failed to load favorite folders",
                requestKey: "favorites:folders"
            });
            e.requireStatus("Failed to load favorite folders", r), e.requireHtmlBody("Failed to load favorite folders", r);
            let n = await e.withDocument(r.body, async e => {
                let t = new Map;
                t.set("-1", "All");
                let r = 0;
                for (let a of e.querySelectorAll("div.fp")) {
                    var n, i, o;
                    if ("Show All Favorites" === a.text) continue;
                    let e = null != (n = null == (i = a.children[2]) ? void 0 : i.text) ? n : `Favorite ${t.size}`, l = null == (o = a.children[0]) ? void 0 : o.text;
                    l && (e += ` (${l})`, r += +l), t.set((t.size - 1).toString(), e);
                }
                return t.set("-1", `All (${r})`), t;
            }), i = [];
            if (t) {
                let r = await e.comic.loadInfo(t);
                r.isFavorite && i.push(r.folder);
            }
            return {
                folders: n,
                favorited: i
            };
        },
        loadNext: async (t, r) => {
            let n = buildFavoritesUrl(e.baseUrl, r);
            return e.getGalleries(null != t ? t : n, !1);
        }
    };
}

function createComicFeature(e) {
    return {
        loadInfo: async t => {
            if (e.galleryInfoCache.has(t)) return e.galleryInfoCache.get(t);
            try {
                await e.checkEHEvent();
            } catch (e) {}
            let r = await e.requestClient.get(t, {}, {
                action: "Failed to load gallery details",
                requestKey: `gallery:${t}`,
                headerProfile: "gallery-view"
            });
            e.requireStatus("Failed to load gallery details", r), e.requireHtmlBody("Failed to load gallery details", r);
            let n = await e.withDocument(r.body, async r => {
                if (e.isLogged && e.loadSetting("hvevent")) {
                    const t = r.getElementById("eventpane");
                    if (null != t) {
                        var n;
                        const r = null == (n = t.querySelector("div > a")) ? void 0 : n.attributes.href;
                        null != r && UI.showDialog("HentaiVerse", e.translate("hentaiverse"), [ {
                            text: e.translate("cancel"),
                            callback: () => {}
                        }, {
                            text: e.translate("fight"),
                            callback: () => {
                                UI.launchUrl(r);
                            }
                        } ]);
                    }
                }
                const i = parseGalleryDetails(r);
                let o = e.comic.parseComments(r), a = new ComicDetails({
                    id: t,
                    title: i.title,
                    subTitle: i.subtitle,
                    cover: i.coverPath,
                    tags: i.tags,
                    stars: i.stars,
                    maxPage: i.maxPage,
                    isFavorite: i.isFavorited,
                    uploadTime: i.time,
                    url: t,
                    comments: o.comments
                });
                return a.folder = i.folder, a.token = i.token, e.apikey = i.apikey, e.apikey && '"' === e.apikey[0] && (e.apikey = e.apikey.substring(1, e.apikey.length - 1)),
                e.uid = i.uid, a;
            });
            return e.galleryInfoCache.set(t, n), n;
        },
        loadThumbnails: async (t, r) => {
            const n = thumbnailCacheKey(t, r);
            if (e.thumbnailCache.has(n)) return e.thumbnailCache.get(n);
            let i = buildGalleryPageUrl(t, r), o = await e.requestClient.get(i, {
                "cache-time": "long",
                "prevent-parallel": "true"
            }, {
                action: "Failed to load thumbnails",
                requestKey: `thumbnails:${n}`,
                headerProfile: "gallery-view"
            });
            e.requireStatus("Failed to load thumbnails", o), e.requireHtmlBody("Failed to load thumbnails", o);
            const a = await e.withDocument(o.body, async e => parseThumbnailPage(e, r));
            return e.thumbnailCache.set(n, a), a;
        },
        starRating: async (t, r) => {
            const n = e.parseUrl(t);
            let i = await e.requestClient.post(e.apiUrl, {}, buildRateGalleryPayload({
                galleryId: n.id,
                token: n.token,
                rating: r,
                apikey: e.apikey,
                apiuid: e.uid
            }), {
                action: "Failed to submit rating",
                requestKey: `rate:${t}:${r}`,
                mutation: !0,
                maxRetries: 0,
                classifyBody: !1,
                headerProfile: "json-api"
            });
            return e.requireStatus("Failed to submit rating", i), "ok";
        },
        getKey: async t => {
            if (e.keyCache.has(t)) return e.keyCache.get(t);
            let r = await e.requestClient.get(t, {
                "cache-time": "long",
                "prevent-parallel": "true"
            }, {
                action: "Failed to load dispatch key",
                requestKey: `key:${t}`
            });
            e.requireStatus("Failed to load dispatch key", r), e.requireHtmlBody("Failed to load dispatch key", r);
            const n = await e.withDocument(r.body, async e => parseDispatchKey(e));
            return e.keyCache.set(t, n), n;
        },
        loadEp: async (t, r) => {
            let n = await e.comic.loadInfo(t);
            return {
                images: Array.from({
                    length: n.maxPage
                }, (e, t) => t.toString())
            };
        },
        onImageLoad: async (t, r, n, i) => e.imageSessions.load({
            image: t,
            comicId: r,
            epId: n,
            nl: i,
            attempt: 0
        }),
        onThumbnailLoad: t => ({
            url: t = normalizeThumbnailHost(t),
            headers: e.buildRequestHeaders("GET", t, {}, {
                headerProfile: "thumbnail"
            })
        }),
        parseComments: e => parseComments(e),
        loadComments: async (t, r, n, i) => {
            let o = await e.requestClient.get(buildCommentsUrl(t), {}, {
                action: "Failed to load comments",
                requestKey: `comments:${t}`,
                headerProfile: "gallery-view"
            });
            return e.requireStatus("Failed to load comments", o), e.requireHtmlBody("Failed to load comments", o),
            e.withDocument(o.body, async t => e.comic.parseComments(t));
        },
        sendComment: async (t, r, n, i) => {
            let o = await e.requestClient.post(t, {}, buildCommentForm(n), {
                action: "Failed to submit comment",
                requestKey: `comment:${t}`,
                mutation: !0,
                maxRetries: 0,
                headerProfile: "form-urlencoded",
                refererUrl: t
            });
            if (o.status >= 400) throw e.formatResponseError("Failed to submit comment", o);
            return e.requireHtmlBody("Failed to submit comment", o), await e.withDocument(o.body, async e => {
                const t = e.querySelector("p.br");
                if (t) throw t.text;
            }), "ok";
        },
        voteComment: async (t, r, n, i, o) => {
            if (null == e.apikey || null == e.uid) throw "Login required";
            const a = e.parseUrl(t);
            let l = await e.requestClient.post(e.apiUrl, {}, buildVoteCommentPayload({
                galleryId: a.id,
                token: a.token,
                commentId: n,
                isUp: i,
                apikey: e.apikey,
                apiuid: e.uid
            }), {
                action: "Failed to vote comment",
                requestKey: `vote:${t}:${n}:${i ? "up" : "down"}`,
                mutation: !0,
                maxRetries: 0,
                classifyBody: !1,
                headerProfile: "json-api"
            });
            e.requireStatus("Failed to vote comment", l);
            let s = e.parseJsonResponse("Failed to vote comment", l);
            if (s.error) throw s.error;
            return s.comment_score;
        },
        archive: {
            getArchives: async t => {
                await e.comic.loadInfo(t);
                let r = e.parseUrl(t), n = r.id, i = r.token;
                const o = buildArchiverUrl(e.baseUrl, n, i);
                let a = await e.requestClient.get(o, {}, {
                    action: "Failed to load archive options",
                    requestKey: `archive:options:${t}`
                });
                return e.requireStatus("Failed to load archive options", a), e.requireHtmlBody("Failed to load archive options", a),
                e.withDocument(a.body, async t => parseArchiveOptions(t, e.baseUrl));
            },
            getDownloadUrl: async (t, r) => {
                let n = e.parseUrl(t), i = n.id, o = n.token;
                const a = buildArchiverUrl(e.baseUrl, i, o);
                if (r.startsWith("h@h_")) {
                    let n = r.substring(4), i = await e.requestClient.post(a, {}, buildHathDownloadForm(n), {
                        action: "Failed to send H@H download command",
                        requestKey: `archive:hath:${t}:${n}`,
                        mutation: !0,
                        maxRetries: 0,
                        headerProfile: "form-urlencoded"
                    });
                    return e.requireStatus("Failed to send H@H download command", i), e.requireHtmlBody("Failed to send H@H download command", i),
                    await e.withDocument(i.body, async e => {
                        let t = e.querySelector("p.br");
                        if (t) {
                            let e = t.text;
                            throw e.includes("H@H client") ? "You need an H@H client associated with your account to use this feature" : e.includes("offline") ? "Your H@H client appears to be offline. Please start it and try again" : e.includes("resolution") ? "This gallery cannot be downloaded at the selected resolution" : e;
                        }
                    }), "";
                }
                let l = await e.requestClient.post(a, {}, buildArchiveDownloadForm(r), {
                    action: "Failed to create archive download",
                    requestKey: `archive:create:${t}:${r}`,
                    mutation: !0,
                    maxRetries: 0,
                    headerProfile: "form-urlencoded"
                });
                e.requireStatus("Failed to create archive download", l), e.requireHtmlBody("Failed to create archive download", l);
                let s = await e.withDocument(l.body, async e => {
                    var t;
                    return null == (t = e.querySelector("a")) ? void 0 : t.attributes.href;
                });
                if (!s) throw "Failed to get download link";
                let u = await e.requestClient.get(s, {}, {
                    action: "Failed to load archive download page",
                    requestKey: `archive:page:${s}`,
                    networkClient: "dart-io"
                });
                e.requireStatus("Failed to load archive download page", u), e.requireHtmlBody("Failed to load archive download page", u);
                let c = buildArchiveResultUrl(s, await e.withDocument(u.body, async e => {
                    var t;
                    return null == (t = e.querySelector("a")) ? void 0 : t.attributes.href;
                }));
                if (!c) throw "Failed to build final download URL";
                if (410 === (await e.requestClient.head(c, {}, {
                    action: "Failed to validate archive link",
                    requestKey: `archive:head:${c}`,
                    classifyBody: !1,
                    networkClient: "dart-io"
                })).status) throw "IP quota exhausted.";
                return c;
            }
        },
        onClickTag: (e, t) => "Category" == e ? {
            page: "search",
            attributes: {
                keyword: "",
                options: [ [ "misc", "doujinshi", "manga", "artist cg", "game cg", "image set", "cosplay", "asian porn", "non-h", "western" ].indexOf(t.toLowerCase()).toString(), "", "" ]
            }
        } : (t.includes(" ") && (t = `"${t}"`), {
            action: "search",
            keyword: `${e}:${t}`,
            param: null
        }),
        link: {
            domains: [ "e-hentai.org", "exhentai.org" ],
            linkToId: t => normalizeGalleryLink(e.baseUrl, t)
        },
        enableTagsTranslate: !0
    };
}

function createCommentsFeature(e, t) {
    return t;
}

function createArchiveFeature(e, t) {
    return t;
}

function createSettings(e) {
    return Object.freeze({
        domain: {
            title: "domain",
            type: "select",
            options: [ {
                value: "e-hentai.org"
            }, {
                value: "exhentai.org"
            } ],
            default: "e-hentai.org"
        },
        ehevent: {
            title: "ehevent",
            type: "switch",
            default: !1
        },
        hvevent: {
            title: "hvevent",
            type: "switch",
            default: !1
        },
        account_switch: {
            title: "accountSwitch",
            type: "callback",
            buttonText: "accountSwitchButton",
            callback: async () => {
                let t = e.loadAccountStore();
                if (!t.profiles.length) return void UI.showMessage(e.translate("noSavedAccounts"));
                let r = t.profiles.map((r, n) => {
                    let i = e.getAccountDisplayName(r, n);
                    return t.activeProfileId === r.id ? `${i} *` : i;
                }), n = t.profiles.findIndex(e => e.id === t.activeProfileId);
                n < 0 && (n = 0);
                let i = await UI.showSelectDialog(e.translate("accountSwitch"), r, n);
                if (null == i || i < 0 || i >= t.profiles.length) return;
                let o = t.profiles[i];
                await e.activateAccountProfile(o.id), UI.showMessage(e.translate("accountSwitched"));
            }
        }
    });
}

function freezeLocaleTable(e) {
    return Object.freeze(e);
}

const commonKeys = freezeLocaleTable({
    "H@H Original": "H@H Original",
    "H@H 800x": "H@H 800x",
    "H@H 1280x": "H@H 1280x",
    "H@H 1920x": "H@H 1920x",
    "H@H 2560x": "H@H 2560x"
}), enBase = freezeLocaleTable({
    domain: "Domain",
    ehevent: "Trigger Dawn Event",
    hvevent: "HV Encounter Alert",
    hentaiverse: "You have encountered a monster!",
    fight: "Fight",
    cancel: "Cancel",
    language: "Language",
    artist: "Artist",
    male: "Male",
    female: "Female",
    mixed: "Mixed",
    other: "Other",
    parody: "Parody",
    character: "Character",
    group: "Group",
    cosplayer: "Cosplayer",
    reclass: "Reclass",
    uploader: "Uploader",
    Languages: "Languages",
    Artists: "Artists",
    Characters: "Characters",
    Groups: "Groups",
    Tags: "Tags",
    Parodies: "Parodies",
    Categories: "Categories",
    Category: "Category",
    "Min Stars": "Min Stars",
    Language: "Language",
    Original: "Original",
    Resample: "Resample",
    account: "Account",
    accountSwitch: "Switch Account",
    accountSwitchButton: "Choose Account",
    noSavedAccounts: "No saved accounts",
    accountSwitched: "Account switched"
}), zhCNBase = freezeLocaleTable({
    domain: "域名",
    ehevent: "触发黎明事件",
    hvevent: "提示HV遭遇战",
    hentaiverse: "你遇到了怪物！",
    fight: "战斗",
    cancel: "取消",
    language: "语言",
    artist: "画师",
    male: "男性",
    female: "女性",
    mixed: "混合",
    other: "其它",
    parody: "原作",
    character: "角色",
    group: "团队",
    cosplayer: "Coser",
    reclass: "重新分类",
    uploader: "上传者",
    Languages: "语言",
    Artists: "画师",
    Characters: "角色",
    Groups: "团队",
    Tags: "标签",
    Parodies: "原作",
    Categories: "分类",
    Category: "分类",
    "Min Stars": "最少星星",
    Language: "语言",
    Original: "原版",
    Resample: "重采样",
    account: "账号",
    accountSwitch: "切换账号",
    accountSwitchButton: "选择账号",
    noSavedAccounts: "没有已保存的账号",
    accountSwitched: "已切换账号"
}), zhTWBase = freezeLocaleTable({
    domain: "域名",
    ehevent: "觸發黎明事件",
    hvevent: "提示HV遭遇戰",
    hentaiverse: "你遇到了怪物！",
    fight: "戰鬥",
    cancel: "取消",
    language: "語言",
    artist: "畫師",
    male: "男性",
    female: "女性",
    mixed: "混合",
    other: "其他",
    parody: "原作",
    character: "角色",
    group: "團隊",
    cosplayer: "Coser",
    reclass: "重新分類",
    uploader: "上傳者",
    Languages: "語言",
    Artists: "畫師",
    Characters: "角色",
    Groups: "團隊",
    Tags: "標籤",
    Parodies: "原作",
    Categories: "分類",
    Category: "分類",
    "Min Stars": "最少星星",
    Language: "語言",
    Original: "原版",
    Resample: "重採樣",
    account: "帳號",
    accountSwitch: "切換帳號",
    accountSwitchButton: "選擇帳號",
    noSavedAccounts: "沒有已儲存的帳號",
    accountSwitched: "已切換帳號"
}), enLocale = freezeLocaleTable({
    ...enBase,
    ...commonKeys
}), zhCNLocale = freezeLocaleTable({
    ...zhCNBase,
    ...commonKeys
}), zhTWLocale = freezeLocaleTable({
    ...zhTWBase,
    ...commonKeys
}), i18n = Object.freeze({
    zh_CN: zhCNLocale,
    zh_Hans: zhCNLocale,
    zh_TW: zhTWLocale,
    zh_HK: zhTWLocale,
    en_US: enLocale,
    en: enLocale
});

function createEhentaiAccountFeature(e) {
    return createAccountFeature(e, {
        loginWithWebview: {
            url: buildForumsLoginUrl(),
            checkStatus: (e, t) => "E-Hentai Forums" === t,
            onLoginSuccess: async () => {
                let t = await Network.getCookies(buildForumsCookieUrl()), r = [];
                t.forEach(t => {
                    if (!t || !t.name) return;
                    if (!e.accountFieldNames.includes(String(t.name))) return;
                    let n = String(t.value || "");
                    0 !== n.length && (r.push(new Cookie({
                        name: String(t.name),
                        value: n,
                        domain: ".e-hentai.org"
                    })), r.push(new Cookie({
                        name: String(t.name),
                        value: n,
                        domain: ".exhentai.org"
                    })));
                }), r.length > 0 && (Network.setCookies(buildEhCookieUrl(), r), Network.setCookies(buildExCookieUrl(), r));
                try {
                    await e.captureAccountFromCookieJar("");
                } catch (e) {}
            }
        },
        loginWithCookies: {
            fields: [ "ipb_member_id", "ipb_pass_hash", "igneous", "star" ],
            validate: async t => {
                if (4 !== t.length) return !1;
                if (0 === t[0].length || 0 === t[1].length) return !1;
                e.applyCookiesFromValues(t);
                let r = await e.requestClient.get(buildForumsHomeUrl(), {}, {
                    action: "Failed to validate forum cookies",
                    requestKey: "forums:cookie-validate",
                    classifyBody: !1,
                    headerProfile: "forums-browser",
                    refererUrl: buildForumsIndexRefererUrl()
                });
                if (200 !== r.status) return !1;
                let n = null;
                return !!await e.withDocument(r.body, async e => {
                    let t = e.querySelector("div#userlinks > p.home > b > a");
                    return !!t && (n = t.text, !0);
                }) && (e.upsertAccountProfile(t, n || ""), !0);
            }
        },
        logout: () => {
            e.logoutAccountSession();
        },
        registerWebsite: null
    });
}

function createEhentaiExploreFeature(e) {
    return createExploreFeature(e, [ {
        title: "eh latest",
        type: "multiPageComicList",
        loadNext: t => {
            let r = null != t ? t : e.baseUrl;
            return e.getGalleries(r, !1);
        }
    }, {
        title: "eh popular",
        type: "multiPageComicList",
        loadNext: t => {
            let r = null != t ? t : buildPopularUrl(e.baseUrl);
            return e.getGalleries(r, !1);
        }
    }, {
        title: "eh watched",
        type: "multiPageComicList",
        loadNext: async t => {
            if (!e.isLogged) return UI.showMessage("Need login first"), {
                comics: [],
                next: null
            };
            let r = null != t ? t : buildWatchedUrl(e.baseUrl);
            return e.getGalleries(r, !1);
        }
    } ]);
}

function createEhentaiCategory() {
    return {
        title: "ehentai",
        parts: [],
        enableRankingPage: !0
    };
}

function createEhentaiCategoryComics(e) {
    return {
        ranking: {
            options: [ "15-yesterday", "13-month", "12-year", "11-all" ],
            load: async (t, r) => {
                let n = (await e.getGalleries(buildToplistUrl(buildBaseUrl("e-hentai.org"), t, r - 1), !0)).comics;
                return "exhentai.org" === e.loadSetting("domain") && n.forEach(e => {
                    e.id = e.id.replace("e-hentai", "exhentai");
                }), {
                    comics: n,
                    maxPage: 200
                };
            }
        }
    };
}

class EhentaiRequestClient {
    constructor(e) {
        this.source = e, this._managedClient = null;
    }
    get(e, t = {}, r = {}) {
        return this._getManagedClient().get(e, t, r);
    }
    post(e, t = {}, r = null, n = {}) {
        return this._getManagedClient().post(e, t, r, n);
    }
    head(e, t = {}, r = {}) {
        return this._getManagedClient().head(e, t, r);
    }
    _getManagedClient() {
        return this._managedClient || (this._managedClient = createManagedRequestClient(this.source, {
            domainKeyResolver: e => domainKey(e),
            shouldCooldown: (e, t, r) => {
                if (!t.classifyBody) return !1;
                const n = String(e && e.body || "");
                return !!hasNonWhitespaceText(n) && r.isAbuseResponseBody(n);
            }
        })), this._managedClient;
    }
}

class ImageLoadingSessionManager {
    constructor(e) {
        this.source = e, this.pendingSessions = new Map;
    }
    async ensureSession(e) {
        const t = this.source.imageSessionCache.get(e);
        if (t) return t;
        if (this.pendingSessions.has(e)) return this.pendingSessions.get(e);
        const r = this._createSession(e);
        this.pendingSessions.set(e, r);
        try {
            return await r;
        } finally {
            this.pendingSessions.delete(e);
        }
    }
    async _createSession(e) {
        const t = await this.source.comic.loadThumbnails(e, null);
        if (!t.urls || 0 === t.urls.length) throw "Failed to load image session: no thumbnail page URLs";
        const r = {
            comicId: e,
            firstPage: t,
            key: await this.source.comic.getKey(t.urls[0]),
            attempts: new Map
        };
        return this.source.imageSessionCache.set(e, r), r;
    }
    async getPageUrl(e, t) {
        var r;
        if (t < 0) throw `Invalid page index: ${t}`;
        if (t < e.firstPage.urls.length) return e.firstPage.urls[t];
        const n = e.firstPage.thumbnails.length;
        if (!n) throw "Failed to resolve page URL: empty thumbnail page";
        const i = Math.floor(t / n), o = t % n, a = null == (r = (await this.source.comic.loadThumbnails(e.comicId, i.toString())).urls) ? void 0 : r[o];
        if (!a) throw `Failed to resolve page URL for page ${t}`;
        return a;
    }
    async dispatchImage({comicId: e, page: t, nl: r}) {
        const n = await this.ensureSession(e), i = this.source.parseUrl(e), o = r || "initial";
        if (n.key.mpvkey) {
            var a;
            const l = null == (a = n.key.imageKeys) ? void 0 : a[t];
            if (!l) throw `Failed to dispatch image: missing mpv image key for page ${t}`;
            const s = buildImageDispatchPayload({
                galleryId: i.id,
                imgKey: l,
                page: t + 1,
                mpvkey: n.key.mpvkey,
                nl: r
            }), u = await this.source.requestClient.post(this.source.apiUrl, {}, s, {
                action: "Failed to dispatch image",
                requestKey: `image:mpv:${e}:${t}:${l}:${o}`,
                mutation: !0,
                allowDedup: !1,
                maxRetries: 0,
                classifyBody: !1,
                headerProfile: "json-api"
            }), c = this.source.parseJsonResponse("Failed to dispatch image", u), d = String(c.i || ""), h = String(c.s || "");
            if (!d) throw "Failed to dispatch image: response missing image URL";
            return {
                url: d,
                nl: h
            };
        }
        const l = imageKeyFromPageUrl(await this.getPageUrl(n, t));
        if (!l) throw `Failed to dispatch image: missing showpage image key for page ${t}`;
        const s = buildShowPagePayload({
            galleryId: i.id,
            imgKey: l,
            page: t + 1,
            showkey: n.key.showkey,
            nl: r
        }), u = await this.source.requestClient.post(this.source.apiUrl, {}, s, {
            action: "Failed to dispatch image",
            requestKey: `image:show:${e}:${t}:${l}:${o}`,
            mutation: !0,
            allowDedup: !1,
            maxRetries: 0,
            classifyBody: !1,
            headerProfile: "json-api"
        }), c = this.source.parseJsonResponse("Failed to dispatch image", u), d = this._parseNl(c.i6);
        return {
            url: this._parseImageSrc(c.i3),
            nl: d
        };
    }
    _parseNl(e) {
        const t = String(e || ""), r = /nl\('([^']+)'\)/.exec(t);
        return r ? r[1] : null;
    }
    _parseImageSrc(e) {
        const t = String(e || ""), r = /<img\b[^>]*\bsrc="([^"]+)"/i.exec(t);
        if (!r || !r[1]) throw "Failed to parse image URL from dispatch response";
        return r[1];
    }
    createRetry({image: e, comicId: t, epId: r, nl: n, attempt: i}) {
        return n ? i >= 2 ? null : async () => this.source.imageSessions.load({
            image: e,
            comicId: t,
            epId: r,
            nl: n,
            attempt: i + 1
        }) : null;
    }
    async load({image: e, comicId: t, epId: r, nl: n, attempt: i = 0}) {
        const o = Number(e), a = await this.dispatchImage({
            comicId: t,
            page: o,
            nl: n
        });
        return {
            url: a.url,
            headers: this.source.buildRequestHeaders("GET", a.url, {}, {
                headerProfile: "thumbnail"
            }),
            onLoadFailed: this.createRetry({
                image: e,
                comicId: t,
                epId: r,
                nl: a.nl,
                attempt: i
            })
        };
    }
}

function runtimeGet(e, t) {
    return Network.get(e, t);
}

async function getRuntimeJson(e, t, r) {
    const n = await runtimeGet(e, t);
    return assertRuntimeStatus(n, 200, r || e), parseRuntimeJsonBody(n, r || e);
}

async function getRuntimeDocument(e, t, r) {
    const n = await runtimeGet(e, t);
    return assertRuntimeStatus(n, 200, r || e), new HtmlDocument(n.body);
}

async function getSelfHostedJson(e, t, r, n) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const i = n && "object" == typeof n && !Array.isArray(n) ? n : {}, o = i.headers || e.headers, a = await Network.get(e.buildUrl(t, r), o);
    return ensureSelfHostedHttpOk(a, i), parseSelfHostedJsonBody(a.body);
}

async function postSelfHostedJson(e, t, r, n, i) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const o = i && "object" == typeof i && !Array.isArray(i) ? i : {}, a = o.headers || e.headers, l = await Network.post(e.buildUrl(t, r), a, n);
    return ensureSelfHostedHttpOk(l, o), {
        body: parseSelfHostedJsonBody(l.body),
        headers: l.headers || {}
    };
}

function defaultManagedDomainKey(e) {
    try {
        return new URL(String(e || "")).hostname || "default";
    } catch (e) {
        return "default";
    }
}

function defaultManagedDispatch(e, t, r, n) {
    return "GET" === e ? Network.get(t, r) : "POST" === e ? Network.post(t, r, n) : Network.sendRequest(e, t, r, n);
}

function defaultManagedRequestError(e, t, r) {
    return e && "function" == typeof e.formatRequestError ? e.formatRequestError(t, r) : `${t}: ${String(r)}`;
}

function defaultManagedResponseError(e, t, r) {
    return e && "function" == typeof e.formatResponseError ? e.formatResponseError(t, r) : `${t}: status=${r && r.status}`;
}

function normalizeManagedRequestHooks(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : {};
}

function ManagedRequestClient(e, t) {
    if (!e || "object" != typeof e) throw new Error("ManagedRequestClient requires plugin source");
    if (!e.requestState || "object" != typeof e.requestState) throw new Error("ManagedRequestClient requires source.requestState");
    this.source = e, this.hooks = normalizeManagedRequestHooks(t);
}

function createManagedRequestClient(e, t) {
    return new ManagedRequestClient(e, t);
}

function parseRuntimeJsonBody(e, t) {
    try {
        return JSON.parse(e.body);
    } catch (e) {
        throw "Invalid JSON response" + (t ? ` (${t})` : "");
    }
}

function ensureSelfHostedHttpOk(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, n = r.unauthorizedMessage || "Login expired", i = r.requestFailedMessage || "请求失败";
    if (!e) throw i;
    if (401 === e.status || 403 === e.status) throw n;
    if (e.status < 200 || e.status >= 300) throw `${i}: ${e.status}`;
}

function parseSelfHostedJsonBody(e) {
    return e ? JSON.parse(e) : null;
}

function hasNonWhitespaceText(e) {
    const t = String(e || "");
    for (let e = 0; e < t.length; e += 1) {
        const r = t.charCodeAt(e);
        if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return !0;
    }
    return !1;
}

function defaultRequestKey(e, t, r, n) {
    return n ? null : `${e}:${t}`;
}

function createDomainQueue(e, t, r) {
    const n = (e.queues.get(t) || Promise.resolve()).then(r, r), i = n.then(() => {}, () => {});
    return e.queues.set(t, i), i.finally(() => {
        e.queues.get(t) === i && e.queues.delete(t);
    }), n;
}

function markCooldown(e, t, r) {
    e.cooldownUntil.set(t, Date.now() + r);
}

ManagedRequestClient.prototype.get = function(e, t, r) {
    return this.send("GET", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.post = function(e, t, r, n) {
    return this.send("POST", e, t || {}, null == r ? null : r, n || {});
}, ManagedRequestClient.prototype.head = function(e, t, r) {
    return this.send("HEAD", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.send = async function(e, t, r, n, i) {
    const o = this.source, a = i && "object" == typeof i && !Array.isArray(i) ? i : {}, l = null == a.mutation ? "GET" !== e : !0 === a.mutation, s = a.requestKey || defaultRequestKey(e, t, n, l), u = "function" == typeof this.hooks.domainKeyResolver ? this.hooks.domainKeyResolver : defaultManagedDomainKey, c = {
        action: a.action || `${e} ${t}`,
        requestKey: s,
        domainKey: a.domainKey || u(t, e, n, a, o, this),
        expectedStatus: null == a.expectedStatus ? 200 : a.expectedStatus,
        maxRetries: null == a.maxRetries ? "GET" === e ? 1 : 0 : a.maxRetries,
        cooldownMs: null == a.cooldownMs ? 6e4 : a.cooldownMs,
        classifyBody: null == a.classifyBody || a.classifyBody,
        mutation: l,
        allowDedup: null == a.allowDedup ? !l : a.allowDedup
    }, d = o.requestState.cooldownUntil.get(c.domainKey);
    if (d && d > Date.now()) throw `${c.action} blocked: temporary cooldown in effect`;
    const h = this._resolveHeaders(e, t, r || {}, c), p = c.requestKey;
    if (c.allowDedup && p && o.requestState.inflight.has(p)) return o.requestState.inflight.get(p);
    const g = createDomainQueue(o.requestState, c.domainKey, () => this._sendWithRetry(e, t, h, n, c));
    c.allowDedup && p && o.requestState.inflight.set(p, g);
    try {
        return await g;
    } finally {
        c.allowDedup && p && o.requestState.inflight.delete(p);
    }
}, ManagedRequestClient.prototype._resolveHeaders = function(e, t, r, n) {
    return "function" == typeof this.hooks.buildHeaders ? this.hooks.buildHeaders(e, t, r, n, this.source, this) : this.source && "function" == typeof this.source.buildRequestHeaders ? this.source.buildRequestHeaders(e, t, r || {}, n || {}) : r || {};
}, ManagedRequestClient.prototype._sendWithRetry = async function(e, t, r, n, i) {
    let o = 0;
    const a = Math.max(0, i.maxRetries) + 1;
    for (;o < a; ) {
        let l;
        o += 1;
        try {
            l = await this._dispatch(e, t, r, n, i);
        } catch (e) {
            if (o >= a) throw defaultManagedRequestError(this.source, i.action, e);
            continue;
        }
        if (this._shouldCooldown(l, i)) throw this._markCooldown(i.domainKey, i.cooldownMs),
        defaultManagedResponseError(this.source, i.action, l);
        if (l.status === i.expectedStatus) return l;
        if (o >= a || i.mutation) throw defaultManagedResponseError(this.source, i.action, l);
    }
    throw `${i.action} failed after retries`;
}, ManagedRequestClient.prototype._dispatch = function(e, t, r, n, i) {
    return "function" == typeof this.hooks.dispatch ? this.hooks.dispatch(e, t, r, n, i, this.source, this) : defaultManagedDispatch(e, t, r, n);
}, ManagedRequestClient.prototype._shouldCooldown = function(e, t) {
    if (403 === e.status || 429 === e.status) return !0;
    if (!t.classifyBody) return !1;
    const r = String(e && e.body || "");
    return !!hasNonWhitespaceText(r) && ("function" == typeof this.hooks.shouldCooldown ? this.hooks.shouldCooldown(e, t, this.source, this) : !(!this.source || "function" != typeof this.source.isAbuseResponseBody) && this.source.isAbuseResponseBody(r));
}, ManagedRequestClient.prototype._markCooldown = function(e, t) {
    markCooldown(this.source.requestState, e, t);
}, "undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown
});

const httpRequestApi = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient
}, httpResponseApi = {
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody
}, httpCooldownApi = {
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown
}, httpSupportApi = {
    ...httpRequestApi,
    ...httpResponseApi,
    ...httpCooldownApi
};

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const n = String(null == e ? "" : e).trim() || t;
    return r ? n.replace(/^\/+|\/+$/g, "") : n;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, n = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), a = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), s = String(e || "").replace(/^\/+/, "");
    if (!s) return `${n}/${i}/${o}@${a}`;
    const u = l ? `${l}/${s}` : s;
    return `${n}/${i}/${o}@${a}/${s.startsWith(`${l}/`) ? s : u}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient,
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
