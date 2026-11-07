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
    buildRequestHeaders(e, t, r, i) {
        return ehentaiBuildRequestHeaders(this, e, t, r, i);
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

function buildEncodedPairs(e, t) {
    return Object.entries(e).filter(([, e]) => t(e)).map(([e, t]) => `${encodeURIComponent(e)}=${encodeURIComponent(String(t))}`).join("&");
}

function buildQuery(e) {
    return buildEncodedPairs(e, hasValue);
}

function buildFormBody(e) {
    return buildEncodedPairs(e, e => null != e);
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

function buildPathQueryUrl(e, t, r, i = !1) {
    const n = buildPathUrl(e, t), a = buildQuery(r || {});
    return a ? `${n}?${a}` : i ? `${n}?` : n;
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

function buildSearchUrl(e, t, r, i) {
    return buildPathQueryUrl(e, "", {
        f_search: t,
        f_cats: r ? String(r) : null,
        f_srdd: i || null
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

function joinRawQueryEntries(e) {
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const [e, i] = r;
        null != e && null != i && t.push(`${String(e)}=${String(i)}`);
    }
    return t.join("&");
}

function runtimeGet(e, t) {
    return Network.get(e, t);
}

async function getRuntimeJson(e, t, r) {
    const i = await runtimeGet(e, t);
    return assertRuntimeStatus(i, 200, r || e), parseRuntimeJsonBody(i, r || e);
}

async function getRuntimeDocument(e, t, r) {
    const i = await runtimeGet(e, t);
    return assertRuntimeStatus(i, 200, r || e), new HtmlDocument(i.body);
}

async function getSelfHostedJson(e, t, r, i) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const n = i && "object" == typeof i && !Array.isArray(i) ? i : {}, a = n.headers || e.headers, o = await Network.get(e.buildUrl(t, r), a);
    return ensureSelfHostedHttpOk(o, n), parseSelfHostedJsonBody(o.body);
}

async function postSelfHostedJson(e, t, r, i, n) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const a = n && "object" == typeof n && !Array.isArray(n) ? n : {}, o = a.headers || e.headers, l = await Network.post(e.buildUrl(t, r), o, i);
    return ensureSelfHostedHttpOk(l, a), {
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

function defaultManagedDispatch(e, t, r, i) {
    return "GET" === e ? Network.get(t, r) : "POST" === e ? Network.post(t, r, i) : Network.sendRequest(e, t, r, i);
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
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, i = r.unauthorizedMessage || "Login expired", n = r.requestFailedMessage || "请求失败";
    if (!e) throw n;
    if (401 === e.status || 403 === e.status) throw i;
    if (e.status < 200 || e.status >= 300) throw `${n}: ${e.status}`;
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

function defaultRequestKey(e, t, r, i) {
    return i ? null : `${e}:${t}`;
}

function createDomainQueue(e, t, r) {
    const i = (e.queues.get(t) || Promise.resolve()).then(r, r), n = i.then(() => {}, () => {});
    return e.queues.set(t, n), n.finally(() => {
        e.queues.get(t) === n && e.queues.delete(t);
    }), i;
}

function markCooldown(e, t, r) {
    e.cooldownUntil.set(t, Date.now() + r);
}

ManagedRequestClient.prototype.get = function(e, t, r) {
    return this.send("GET", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.post = function(e, t, r, i) {
    return this.send("POST", e, t || {}, null == r ? null : r, i || {});
}, ManagedRequestClient.prototype.head = function(e, t, r) {
    return this.send("HEAD", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.send = async function(e, t, r, i, n) {
    const a = this.source, o = n && "object" == typeof n && !Array.isArray(n) ? n : {}, l = null == o.mutation ? "GET" !== e : !0 === o.mutation, s = o.requestKey || defaultRequestKey(e, t, i, l), u = "function" == typeof this.hooks.domainKeyResolver ? this.hooks.domainKeyResolver : defaultManagedDomainKey, c = {
        action: o.action || `${e} ${t}`,
        requestKey: s,
        domainKey: o.domainKey || u(t, e, i, o, a, this),
        expectedStatus: null == o.expectedStatus ? 200 : o.expectedStatus,
        maxRetries: null == o.maxRetries ? "GET" === e ? 1 : 0 : o.maxRetries,
        cooldownMs: null == o.cooldownMs ? 6e4 : o.cooldownMs,
        classifyBody: null == o.classifyBody || o.classifyBody,
        mutation: l,
        allowDedup: null == o.allowDedup ? !l : o.allowDedup
    }, d = a.requestState.cooldownUntil.get(c.domainKey);
    if (d && d > Date.now()) throw `${c.action} blocked: temporary cooldown in effect`;
    const h = this._resolveHeaders(e, t, r || {}, c), p = c.requestKey;
    if (c.allowDedup && p && a.requestState.inflight.has(p)) return a.requestState.inflight.get(p);
    const g = createDomainQueue(a.requestState, c.domainKey, () => this._sendWithRetry(e, t, h, i, c));
    c.allowDedup && p && a.requestState.inflight.set(p, g);
    try {
        return await g;
    } finally {
        c.allowDedup && p && a.requestState.inflight.delete(p);
    }
}, ManagedRequestClient.prototype._resolveHeaders = function(e, t, r, i) {
    return "function" == typeof this.hooks.buildHeaders ? this.hooks.buildHeaders(e, t, r, i, this.source, this) : this.source && "function" == typeof this.source.buildRequestHeaders ? this.source.buildRequestHeaders(e, t, r || {}, i || {}) : r || {};
}, ManagedRequestClient.prototype._sendWithRetry = async function(e, t, r, i, n) {
    let a = 0;
    const o = Math.max(0, n.maxRetries) + 1;
    for (;a < o; ) {
        let l;
        a += 1;
        try {
            l = await this._dispatch(e, t, r, i, n);
        } catch (e) {
            if (a >= o) throw defaultManagedRequestError(this.source, n.action, e);
            continue;
        }
        if (this._shouldCooldown(l, n)) throw this._markCooldown(n.domainKey, n.cooldownMs),
        defaultManagedResponseError(this.source, n.action, l);
        if (l.status === n.expectedStatus) return l;
        if (a >= o || n.mutation) throw defaultManagedResponseError(this.source, n.action, l);
    }
    throw `${n.action} failed after retries`;
}, ManagedRequestClient.prototype._dispatch = function(e, t, r, i, n) {
    return "function" == typeof this.hooks.dispatch ? this.hooks.dispatch(e, t, r, i, n, this.source, this) : defaultManagedDispatch(e, t, r, i);
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
    joinRawQueryEntries,
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
    let r = ehentaiGetErrorMessage(t), i = r.toLowerCase();
    return i.includes("redirect") ? `${e} failed: request was redirected by the server` : i.includes("timeout") || i.includes("network") || i.includes("socket") ? `${e} failed: network error (${r})` : `${e} failed: ${r}`;
}

function ehentaiFormatResponseError(e, t, r) {
    let i = r ? r.status : null, n = String(r && r.body ? r.body : "").trim();
    return 403 === i || 429 === i ? `${t} failed: server returned ${i}` : 0 === n.length ? `${t} failed: empty response from server` : e.isAbuseResponseBody(n) ? `${t} failed: access was denied by the server` : `${t} failed: invalid status code ${i}`;
}

function ehentaiRequireStatus(e, t, r, i) {
    let n = null == i ? 200 : i;
    if (!r || r.status !== n) throw e.formatResponseError(t, r || {});
}

function ehentaiRequireNonEmptyBody(e, t, r) {
    const i = String(r && r.body || "");
    if (!hasNonWhitespaceText(i)) throw e.formatResponseError(t, r || {});
    return i;
}

function ehentaiRequireHtmlBody(e, t, r) {
    const i = ehentaiRequireNonEmptyBody(e, t, r);
    if ("<" !== ehentaiFirstNonWhitespaceChar(i)) throw `${t} failed: invalid HTML response`;
    return i;
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

function ehentaiBuildRequestHeaders(e, t, r, i, n) {
    const a = n || {}, o = {
        ...i || {}
    };
    return "json-api" !== a.headerProfile || o["Content-Type"] || (o["Content-Type"] = "application/json"),
    "form-urlencoded" !== a.headerProfile || o["Content-Type"] || (o["Content-Type"] = "application/x-www-form-urlencoded"),
    "gallery-view" !== a.headerProfile || o.cookie || (o.cookie = "nw=1"), "thumbnail" !== a.headerProfile || o.referer || (o.referer = e.baseUrl),
    "forums-browser" === a.headerProfile && (o.accept || (o.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"),
    o["accept-encoding"] || (o["accept-encoding"] = "gzip, deflate, br"), o["accept-language"] || (o["accept-language"] = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7")),
    a.refererUrl && !o.referer && (o.referer = a.refererUrl), "dart-io" !== a.networkClient || o.http_client || (o.http_client = "dart:io"),
    o;
}

async function ehentaiCheckEvent(e) {
    if (e.isLogged && e.loadSetting("ehevent")) try {
        const t = e.loadData("lastEventTime"), r = (new Date).toISOString().split("T")[0];
        if (t === r) return;
        const i = await e.requestClient.get(buildEhNewsUrl(), {}, {
            action: "Failed to load event news",
            requestKey: "event-news"
        });
        if (200 !== i.status || e.isAbuseResponseBody(i.body)) return;
        e.saveData("lastEventTime", r), await e.withDocument(i.body, async e => {
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
    let i;
    try {
        i = await e.requestClient.get(t, {}, {
            action: "Failed to load gallery list",
            requestKey: `galleries:${t}`
        });
    } catch (t) {
        throw e.isRedirectError(t) && await e.onLoadFailed("request was redirected"), e.formatRequestError("Failed to load gallery list", t);
    }
    if (200 !== i.status) throw e.formatResponseError("Failed to load gallery list", i);
    if (hasNonWhitespaceText(i.body) || await e.onLoadFailed("empty response from gallery list"),
    "<" !== ehentaiFirstNonWhitespaceChar(i.body)) {
        if (e.isAbuseResponseBody(i.body)) throw "Your IP address has been banned";
        throw "Failed to load gallery list";
    }
    const n = new HtmlDocument(i.body);
    try {
        return parseGalleryList({
            document: n,
            source: e,
            url: t,
            isLeaderBoard: r
        });
    } finally {
        n.dispose();
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
    for (let i = 0; i < e.accountFieldNames.length; i++) r.push(String(t && t[i] || ""));
    return r;
}

function ehentaiCreateAccountCookies(e, t) {
    let r = ehentaiNormalizeAccountValues(e, t), i = [];
    for (let t = 0; t < e.accountFieldNames.length; t++) {
        let n = e.accountFieldNames[t], a = r[t];
        i.push(new Cookie({
            name: n,
            value: a,
            domain: ".e-hentai.org"
        })), i.push(new Cookie({
            name: n,
            value: a,
            domain: ".exhentai.org"
        }));
    }
    return i;
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
    let i = r.profiles.map((t, r) => {
        let i = ehentaiNormalizeAccountValues(e, t && t.values);
        return {
            id: String(t && t.id || `${Date.now()}_${r}`),
            name: t && t.name ? String(t.name) : "",
            values: i,
            createdAt: String(t && t.createdAt || (new Date).toISOString()),
            lastUsedAt: String(t && t.lastUsedAt || (new Date).toISOString())
        };
    }).filter(e => e.values[0] && e.values[1]), n = r.activeProfileId && i.some(e => e.id === r.activeProfileId) ? String(r.activeProfileId) : null;
    return e._accountStoreCache = {
        version: 1,
        activeProfileId: n,
        profiles: i
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
    let i = t && t.name ? t.name : `${e.translate("account")} ${r + 1}`, n = t && t.values ? t.values[0] : "";
    return n ? `${i} (${n})` : i;
}

function ehentaiUpsertAccountProfile(e, t, r) {
    let i = ehentaiNormalizeAccountValues(e, t);
    if (!i[0] || !i[1]) return null;
    let n = e.loadAccountStore(), a = (new Date).toISOString(), o = n.profiles.find(e => e.values[0] === i[0] && e.values[1] === i[1]);
    if (o) return o.values = i, r && (o.name = r), o.lastUsedAt = a, n.activeProfileId = o.id,
    e.saveAccountStore(n), o.id;
    let l = `${Date.now()}_${Math.floor(1e5 * Math.random())}`;
    return n.profiles.push({
        id: l,
        name: r || "",
        values: i,
        createdAt: a,
        lastUsedAt: a
    }), n.activeProfileId = l, e.saveAccountStore(n), l;
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
            let t = String(e.name), i = String(e.value || "");
            0 !== i.length && (r.has(t) || r.set(t, i));
        }
    }
    let i = [];
    for (let t of e.accountFieldNames) i.push(r.get(t) || "");
    return i;
}

async function ehentaiActivateAccountProfile(e, t) {
    let r = e.loadAccountStore(), i = r.profiles.find(e => e.id === t);
    if (!i) throw "Account profile not found";
    return e.applyCookiesFromValues(i.values), e.clearRuntimeCaches(), i.lastUsedAt = (new Date).toISOString(),
    r.activeProfileId = i.id, e.saveAccountStore(r), i;
}

function ehentaiLogoutAccountSession(e) {
    e.clearSessionCookies(), e.clearRuntimeCaches();
    let t = e.loadAccountStore();
    t.activeProfileId = null, e.saveAccountStore(t);
}

function buildRateGalleryPayload({galleryId: e, token: t, rating: r, apikey: i, apiuid: n}) {
    return {
        gid: e,
        token: t,
        method: "rategallery",
        rating: r,
        apikey: i,
        apiuid: n
    };
}

function buildVoteCommentPayload({galleryId: e, token: t, commentId: r, isUp: i, apikey: n, apiuid: a}) {
    return {
        gid: e,
        token: t,
        method: "votecomment",
        comment_id: r,
        comment_vote: i ? 1 : -1,
        apikey: n,
        apiuid: a
    };
}

function buildImageDispatchPayload({galleryId: e, imgKey: t, page: r, mpvkey: i, nl: n}) {
    return {
        gid: e,
        imgkey: t,
        method: "imagedispatch",
        page: r,
        mpvkey: i,
        nl: n
    };
}

function buildShowPagePayload({galleryId: e, imgKey: t, page: r, showkey: i, nl: n}) {
    return {
        gid: e,
        imgkey: t,
        method: "showpage",
        page: r,
        showkey: i,
        nl: n
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

function ehSafeText(e, t) {
    return e && "string" == typeof e.text ? e.text : t;
}

function ehSafeAttr(e, t, r) {
    return e && e.attributes && void 0 !== e.attributes[t] ? e.attributes[t] : r;
}

function parseGalleryList({document: e, source: t, url: r, isLeaderBoard: i}) {
    function n(e, t) {
        let r = e ? e.match(/\d+/) : null;
        if (!r) return t;
        let i = Number(r[0]);
        return isNaN(i) ? t : i;
    }
    const a = i ? 1 : 0, o = [];
    for (let i of e.querySelectorAll("table.itg.gltc > tbody > tr")) try {
        let e = i.children.length > 1 + a ? i.children[1 + a] : null;
        if (!e) continue;
        let l = e.children.length > 2 ? e.children[2] : null, s = ehSafeText(l && l.children.length > 0 ? l.children[0] : null, ""), u = t.getStarsFromPosition(ehSafeAttr(l && l.children.length > 1 ? l.children[1] : null, "style", "")), c = e;
        c && c.children.length > 1 && (c = c.children[1]), c && c.children.length > 0 && (c = c.children[0]),
        c && c.children.length > 0 && (c = c.children[0]);
        let d = ehSafeAttr(c, "src", "");
        d && "d" === d[0] && (d = ehSafeAttr(c, "data-src", d));
        let h = i.children.length > 2 + a ? i.children[2 + a] : null, p = h && h.children.length > 0 ? h.children[0] : null, g = ehSafeText(p && p.children.length > 0 ? p.children[0] : null, "Unknown"), f = ehSafeAttr(p, "href", ""), m = "", y = 0;
        try {
            if (r.includes("/favorites.php")) {
                let t = e;
                t.children.length > 1 && (t = t.children[1]), t.children.length > 1 && (t = t.children[1]),
                t.children.length > 1 && (t = t.children[1]), y = n(ehSafeText(t && t.children.length > 1 ? t.children[1] : null, ""), 0);
            } else {
                let e = i.children.length > 3 + a ? i.children[3 + a] : null;
                y = n(ehSafeText(e && e.children.length > 1 ? e.children[1] : null, ""), 0);
                let t = null;
                e && e.children.length > 0 && (t = e.children[0]), t && t.children.length > 0 && (t = t.children[0]),
                m = ehSafeText(t, "");
            }
        } catch (e) {}
        let S = [], b = null, w = p && p.children.length > 1 ? p.children[1] : null;
        for (let e of w ? w.children : []) {
            let t = ehSafeAttr(e, "title", "");
            if (t) {
                if (t.startsWith("language:")) {
                    let e = t.split(":")[1].trim();
                    b = "translated" === e ? b : e;
                    continue;
                }
                S.push(t);
            }
        }
        o.push(new Comic({
            id: f,
            title: g,
            subTitle: m,
            cover: d,
            tags: S,
            description: s,
            stars: u,
            maxPage: y,
            language: b
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("div.gl1t")) try {
        let e = ehSafeText(r.querySelector("a"), "Unknown"), i = r.querySelectorAll("div.gl5t > div > div"), a = i.find(e => !isNaN(Date.parse(e.text)));
        a = ehSafeText(a, "");
        let l = ehSafeAttr(r.querySelector("img"), "src", ""), s = t.getStarsFromPosition(ehSafeAttr(r.querySelector("div.gl5t > div > div.ir"), "style", "")), u = ehSafeAttr(r.querySelector("a"), "href", ""), c = n(ehSafeText(i.find(e => e.text.includes("page")), ""), 0);
        o.push(new Comic({
            id: u,
            title: e,
            cover: l,
            description: a,
            stars: s,
            maxPage: c
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.glte > tbody > tr")) try {
        let e = ehSafeText(r.querySelector("td.gl2e > div > a > div > div.glink"), "Unknown"), i = r.querySelectorAll("td.gl2e > div > div.gl3e > div"), a = ehSafeText(i.find(e => !isNaN(Date.parse(e.text))), "Unknown"), l = ehSafeText(r.querySelector("td.gl2e > div > div.gl3e > div > a"), "Unknown"), s = ehSafeAttr(r.querySelector("td.gl1e > div > a > img"), "src", ""), u = t.getStarsFromPosition(ehSafeAttr(r.querySelector("td.gl2e > div > div.gl3e > div.ir"), "style", "")), c = ehSafeAttr(r.querySelector("td.gl1e > div > a"), "href", ""), d = r.querySelectorAll("div.gt, div.gtl").map(e => ehSafeAttr(e, "title", ""));
        d = d.filter(e => !!e);
        let h = n(ehSafeText(i.find(e => e.text.includes("page")), ""), 0), p = null, g = d.find(e => e.startsWith("language:") && !e.includes("translated"));
        g && g.includes(":") && (p = g.split(":")[1].trim()), o.push(new Comic({
            id: c,
            title: e,
            subTitle: l,
            cover: s,
            tags: d,
            description: a,
            stars: u,
            maxPage: h,
            language: p
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.gltm > tbody > tr")) try {
        let e = ehSafeText(r.querySelector("td.gl3m > a > div.glink"), "Unknown"), i = ehSafeText(r.querySelectorAll("td.gl2m > div").find(e => !isNaN(Date.parse(e.text))), "Unknown"), n = ehSafeText(r.querySelector("td.gl5m > div > a"), "Unknown"), a = r.querySelector("td.gl2m > div > div > img"), l = ehSafeAttr(a, "src", "");
        l && "d" === l[0] && (l = ehSafeAttr(a, "data-src", l));
        let s = t.getStarsFromPosition(ehSafeAttr(r.querySelector("td.gl4m > div.ir"), "style", "")), u = ehSafeAttr(r.querySelector("td.gl3m > a"), "href", "");
        o.push(new Comic({
            id: u,
            title: e,
            subTitle: n,
            cover: l,
            description: i,
            stars: s
        }));
    } catch (e) {}
    return {
        comics: o,
        next: ehSafeAttr(e.querySelector("a#dnext"), "href", void 0)
    };
}

function parseGalleryDetails(e) {
    function t(e, t) {
        if (!e) return null;
        let r = t.exec(e);
        return r ? r[0] : null;
    }
    let r = new Map;
    for (let t of e.querySelectorAll("div#taglist > table > tbody > tr")) {
        let e = t.children.length > 0 ? t.children[0] : null, i = t.children.length > 1 ? t.children[1] : null, n = ehSafeText(e, "");
        if (!n) continue;
        let a = [], o = i ? i.children : [];
        for (let e of o) try {
            let t = e.children.length > 0 ? e.children[0] : null, r = t && t.attributes ? t.attributes.onclick : null;
            if (!r) continue;
            let i = r.split(":");
            if (i.length < 2) continue;
            let n = i[1].split("'")[0];
            n && a.push(n);
        } catch (e) {}
        r.set(n.substring(0, n.length - 1), a);
    }
    let i = "1";
    for (let r of e.querySelectorAll("td.gdt2")) if (r.text.includes("page")) {
        let e = t(r.text, /\d+/);
        e && (i = e);
    }
    let n = " Add to Favorites" !== ehSafeText(e.querySelector("a#favoritelink"), ""), a = null;
    if (n) {
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
    let o = "", l = e.querySelector("div#gleft > div#gd1 > div"), s = l && l.attributes ? l.attributes.style : "", u = RegExp("https?://([-a-zA-Z0-9.]+(/\\S*)?\\.(?:jpg|jpeg|gif|png|webp))").exec(s || "");
    u && (o = u[0]);
    let c = e.getElementById("gdn"), d = c && c.children.length > 0 ? c.children[0].text : void 0, h = e.getElementById("rating_label"), p = h ? h.text : "", g = p ? p.split(":") : [], f = g.length > 1 ? g[1].trim() : "0", m = Number(f), y = ehSafeText(e.querySelector("div.cs"), "Unknown");
    r.set("Category", [ y ]), d && r.set("uploader", [ d ]);
    let S, b = ehSafeText(e.querySelector("div#gdd > table > tbody > tr > td.gdt2"), ""), w = e.querySelectorAll("script").find(e => e.text.includes("var token")), v = RegExp("var\\s+(\\w+)\\s*=\\s*(.*?);", "g"), C = new Map, k = w && w.text ? w.text : "";
    for (;null !== (S = v.exec(k)); ) C.set(S[1], S[2]);
    let q = ehSafeText(e.querySelector("h1#gn"), "Unknown"), A = ehSafeText(e.querySelector("h1#gj"), null);
    return null != A && "" === A.trim() && (A = null), {
        title: q,
        subtitle: A,
        coverPath: o,
        tags: r,
        stars: m,
        maxPage: Number(i),
        isFavorited: n,
        folder: a,
        time: b,
        token: C.get("token"),
        apikey: C.get("apikey"),
        uid: C.get("apiuid")
    };
}

function parseThumbnailPage(e, t) {
    const r = e => {
        let t = ehSafeAttr(e, "style", "");
        if (!t) return "";
        let r = 0, i = 0, n = t.match(/width:(\d+)px/), a = t.match(/height:(\d+)px/);
        n && (r = Number(n[1])), a && (i = Number(a[1]));
        let o = t.split("background:transparent url(");
        if (o.length < 2) return "";
        let l = o[1], s = l.split(")")[0];
        if (!s) return "";
        let u = "";
        if (l.includes("px")) {
            let e = l.split(") -");
            if (e.length > 1) {
                let t = Number(e[1].split("px")[0]);
                isNaN(t) || (u += `x=${t}-${t + r}`);
            }
        }
        return i && (u += `${u ? "&" : ""}y=0-${i}`), u && (s += `@${u}`), s;
    }, i = (t, r) => e.querySelectorAll(t).map(e => r(e)).filter(e => !!e);
    let n = e.querySelectorAll("div.gdtm > div").map(e => r(e)).filter(e => !!e);
    if (n.push(...i("div.gdtl > a > img", e => ehSafeAttr(e, "src", ""))), 0 === n.length) {
        const e = [ "div.gt100 > a > div", "div.gt200 > a > div" ];
        for (let t of e) n.push(...i(t, e => {
            let t = 0 === e.children.length ? e : e.children[0];
            return r(t);
        }));
    }
    let a = i("table.ptb > tbody > tr > td > a", e => ehSafeAttr(e, "href", "")), o = 0;
    for (let e of a) {
        let t = e.split("="), r = Number(t.length > 1 ? t[1] : "");
        !isNaN(r) && r > o && (o = r);
    }
    let l = t ? Number(t) : 0;
    l += 1;
    let s = l > o ? null : l.toString();
    return {
        thumbnails: n,
        urls: i("div#gdt a", e => ehSafeAttr(e, "href", "")),
        next: s
    };
}

function parseDispatchKey(e) {
    let t = e.querySelectorAll("script"), r = null, i = null;
    for (let e of t) {
        let t = ehSafeText(e, "");
        if (!r && t.includes("showkey") && (r = e), !i && t.includes("mpvkey") && (i = e),
        r && i) break;
    }
    if (r) {
        let e = RegExp('showkey="(.*?)"', "g").exec(ehSafeText(r, ""));
        if (e) return {
            showkey: e[1]
        };
    }
    let n = ehSafeText(i, "");
    if (n) {
        let e = "", t = [], r = n.split(";"), i = r.find(e => e.includes("mpvkey"));
        if (i) {
            let t = i.replace(/ /g, "").split("=");
            t.length > 1 && (e = t[1].replace(/"/g, ""));
        }
        let a = r.find(e => e.includes("imagelist"));
        if (a) {
            let e = a.replace(/ /g, "").split("=");
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
    let t = [];
    for (let r of e.querySelectorAll("div.c1")) {
        let e = ehSafeText(r.querySelector("div.c3 > a"), ""), i = r.querySelector("div.c3"), n = i && i.text ? i.text : null, a = n ? n.split("Posted on") : [], o = a.length > 1 ? a[1] : "", l = o ? o.split("by") : [], s = l.length > 0 ? l[0] : "", u = s && s.trim ? s.trim() : "unknown", c = "", d = r.querySelector("div.c6");
        c = "undefined" != typeof appVersion ? d && "string" == typeof d.innerHTML ? d.innerHTML : "" : ehSafeText(d, "");
        let h = Number(ehSafeText(r.querySelector("div.c5 > span"), ""));
        isNaN(h) && (h = null);
        let p = "0", g = ehSafeAttr(r.previousElementSibling, "name"), f = g ? g.match(/\d+/) : null;
        f && (p = f[0]);
        let m = ehSafeAttr(r.querySelector(`a#comment_vote_up_${p}`), "style"), y = ehSafeAttr(r.querySelector(`a#comment_vote_down_${p}`), "style"), S = "string" == typeof m && m.length > 0, b = "string" == typeof y && y.length > 0;
        t.push(new Comment({
            id: p,
            content: c,
            time: u,
            userName: e,
            score: h,
            voteStatus: S ? 1 : b ? -1 : 0
        }));
    }
    return {
        comments: t,
        maxPage: 1
    };
}

function parseArchiveOptions(e, t) {
    let r = e.querySelector("div#db"), i = t.includes("exhentai") ? 1 : 3, n = [], a = e.querySelector("table");
    if (a) {
        let e = a.querySelectorAll("td");
        for (let t of e) {
            let e = t.querySelector("a");
            if (e) {
                let r = e.attributes ? e.attributes.onclick : null, i = r ? r.match(/do_hathdl\('([^']+)'\)/) : null;
                if (i) {
                    let r = i[1], a = ehSafeText(e, "Unknown"), o = t.querySelectorAll("p"), l = o.length > 1 ? ehSafeText(o[1], "Unknown") : "Unknown", s = o.length > 2 ? ehSafeText(o[2], "Unknown") : "Unknown";
                    n.push({
                        id: `h@h_${r}`,
                        title: `H@H ${a}`,
                        description: `Size: ${l}, Cost: ${s}`
                    });
                }
            }
        }
    }
    let o = null;
    if (r && r.children.length > i && r.children[i].children.length > 0 && (o = r.children[i].children[0]),
    o) {
        let e = ehSafeText(o.querySelector("div > strong"), "Unknown"), t = ehSafeText(o.querySelector("p > strong"), "Unknown");
        n.push({
            id: "0",
            title: "Original",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    let l = null;
    if (r && r.children.length > i && r.children[i].children.length > 1 && (l = r.children[i].children[1]),
    l) {
        let e = ehSafeText(l.querySelector("div > strong"), "Unknown"), t = ehSafeText(l.querySelector("p > strong"), "Unknown");
        n.push({
            id: "1",
            title: "Resample",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    return n;
}

function parseArchiveError(e) {
    let t = e.querySelector("p.br");
    return t && "string" == typeof t.text ? t.text : null;
}

function parseFirstLink(e) {
    let t = e.querySelector("a");
    return t && t.attributes && t.attributes.href ? t.attributes.href : null;
}

function createSearchFeature(e) {
    return {
        loadNext: async (t, r, i) => {
            let n = [];
            try {
                n = JSON.parse(r[0]);
            } catch (e) {
                throw "Failed to parse search options";
            }
            let a = r[1], o = r[2], l = 1023;
            Array.isArray(n) || (n = [ n ]);
            for (let e of n) l -= 1 << Number(e);
            o && !t.includes("language:") && (t += ` language:${o}`);
            let s = buildSearchUrl(e.baseUrl, t, l, a);
            return e.getGalleries(null != i ? i : s, !1);
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
        addOrDelFavorite: async (t, r, i, n) => {
            let a = e.parseUrl(t), o = a.id, l = a.token;
            const s = buildGalleryPopupUrl(e.baseUrl, o, l);
            if (i) {
                let i = await e.requestClient.post(s, {}, buildAddFavoriteForm(r), {
                    action: "Failed to add favorite",
                    requestKey: `favorite:add:${t}:${r}`,
                    mutation: !0,
                    maxRetries: 0,
                    headerProfile: "form-urlencoded"
                });
                return e.requireStatus("Failed to add favorite", i), e.requireHtmlBody("Failed to add favorite", i),
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
            let i = await e.withDocument(r.body, async e => {
                let t = new Map;
                t.set("-1", "All");
                let r = 0;
                for (let o of e.querySelectorAll("div.fp")) {
                    var i, n, a;
                    if ("Show All Favorites" === o.text) continue;
                    let e = null != (i = null == (n = o.children[2]) ? void 0 : n.text) ? i : `Favorite ${t.size}`, l = null == (a = o.children[0]) ? void 0 : a.text;
                    l && (e += ` (${l})`, r += +l), t.set((t.size - 1).toString(), e);
                }
                return t.set("-1", `All (${r})`), t;
            }), n = [];
            if (t) {
                let r = await e.comic.loadInfo(t);
                r.isFavorite && n.push(r.folder);
            }
            return {
                folders: i,
                favorited: n
            };
        },
        loadNext: async (t, r) => {
            let i = buildFavoritesUrl(e.baseUrl, r);
            return e.getGalleries(null != t ? t : i, !1);
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
            let i = await e.withDocument(r.body, async r => {
                if (e.isLogged && e.loadSetting("hvevent")) {
                    const t = r.getElementById("eventpane");
                    if (null != t) {
                        var i;
                        const r = null == (i = t.querySelector("div > a")) ? void 0 : i.attributes.href;
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
                const n = parseGalleryDetails(r);
                let a = e.comic.parseComments(r), o = new ComicDetails({
                    id: t,
                    title: n.title,
                    subTitle: n.subtitle,
                    cover: n.coverPath,
                    tags: n.tags,
                    stars: n.stars,
                    maxPage: n.maxPage,
                    isFavorite: n.isFavorited,
                    uploadTime: n.time,
                    url: t,
                    comments: a.comments
                });
                return o.folder = n.folder, o.token = n.token, e.apikey = n.apikey, e.apikey && '"' === e.apikey[0] && (e.apikey = e.apikey.substring(1, e.apikey.length - 1)),
                e.uid = n.uid, o;
            });
            return e.galleryInfoCache.set(t, i), i;
        },
        loadThumbnails: async (t, r) => {
            const i = thumbnailCacheKey(t, r);
            if (e.thumbnailCache.has(i)) return e.thumbnailCache.get(i);
            let n = buildGalleryPageUrl(t, r), a = await e.requestClient.get(n, {
                "cache-time": "long",
                "prevent-parallel": "true"
            }, {
                action: "Failed to load thumbnails",
                requestKey: `thumbnails:${i}`,
                headerProfile: "gallery-view"
            });
            e.requireStatus("Failed to load thumbnails", a), e.requireHtmlBody("Failed to load thumbnails", a);
            const o = await e.withDocument(a.body, async e => parseThumbnailPage(e, r));
            return e.thumbnailCache.set(i, o), o;
        },
        starRating: async (t, r) => {
            const i = e.parseUrl(t);
            let n = await e.requestClient.post(e.apiUrl, {}, buildRateGalleryPayload({
                galleryId: i.id,
                token: i.token,
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
            return e.requireStatus("Failed to submit rating", n), "ok";
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
            const i = await e.withDocument(r.body, async e => parseDispatchKey(e));
            return e.keyCache.set(t, i), i;
        },
        loadEp: async (t, r) => {
            let i = await e.comic.loadInfo(t);
            return {
                images: Array.from({
                    length: i.maxPage
                }, (e, t) => t.toString())
            };
        },
        onImageLoad: async (t, r, i, n) => e.imageSessions.load({
            image: t,
            comicId: r,
            epId: i,
            nl: n,
            attempt: 0
        }),
        onThumbnailLoad: t => ({
            url: t = normalizeThumbnailHost(t),
            headers: e.buildRequestHeaders("GET", t, {}, {
                headerProfile: "thumbnail"
            })
        }),
        parseComments: e => parseComments(e),
        loadComments: async (t, r, i, n) => {
            let a = await e.requestClient.get(buildCommentsUrl(t), {}, {
                action: "Failed to load comments",
                requestKey: `comments:${t}`,
                headerProfile: "gallery-view"
            });
            return e.requireStatus("Failed to load comments", a), e.requireHtmlBody("Failed to load comments", a),
            e.withDocument(a.body, async t => e.comic.parseComments(t));
        },
        sendComment: async (t, r, i, n) => {
            let a = await e.requestClient.post(t, {}, buildCommentForm(i), {
                action: "Failed to submit comment",
                requestKey: `comment:${t}`,
                mutation: !0,
                maxRetries: 0,
                headerProfile: "form-urlencoded",
                refererUrl: t
            });
            if (a.status >= 400) throw e.formatResponseError("Failed to submit comment", a);
            return e.requireHtmlBody("Failed to submit comment", a), await e.withDocument(a.body, async e => {
                const t = e.querySelector("p.br");
                if (t) throw t.text;
            }), "ok";
        },
        voteComment: async (t, r, i, n, a) => {
            if (null == e.apikey || null == e.uid) throw "Login required";
            const o = e.parseUrl(t);
            let l = await e.requestClient.post(e.apiUrl, {}, buildVoteCommentPayload({
                galleryId: o.id,
                token: o.token,
                commentId: i,
                isUp: n,
                apikey: e.apikey,
                apiuid: e.uid
            }), {
                action: "Failed to vote comment",
                requestKey: `vote:${t}:${i}:${n ? "up" : "down"}`,
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
                let r = e.parseUrl(t), i = r.id, n = r.token;
                const a = buildArchiverUrl(e.baseUrl, i, n);
                let o = await e.requestClient.get(a, {}, {
                    action: "Failed to load archive options",
                    requestKey: `archive:options:${t}`
                });
                return e.requireStatus("Failed to load archive options", o), e.requireHtmlBody("Failed to load archive options", o),
                e.withDocument(o.body, async t => parseArchiveOptions(t, e.baseUrl));
            },
            getDownloadUrl: async (t, r) => {
                let i = e.parseUrl(t), n = i.id, a = i.token;
                const o = buildArchiverUrl(e.baseUrl, n, a);
                if (r.startsWith("h@h_")) {
                    let i = r.substring(4), n = await e.requestClient.post(o, {}, buildHathDownloadForm(i), {
                        action: "Failed to send H@H download command",
                        requestKey: `archive:hath:${t}:${i}`,
                        mutation: !0,
                        maxRetries: 0,
                        headerProfile: "form-urlencoded"
                    });
                    return e.requireStatus("Failed to send H@H download command", n), e.requireHtmlBody("Failed to send H@H download command", n),
                    await e.withDocument(n.body, async e => {
                        let t = e.querySelector("p.br");
                        if (t) {
                            let e = t.text;
                            throw e.includes("H@H client") ? "You need an H@H client associated with your account to use this feature" : e.includes("offline") ? "Your H@H client appears to be offline. Please start it and try again" : e.includes("resolution") ? "This gallery cannot be downloaded at the selected resolution" : e;
                        }
                    }), "";
                }
                let l = await e.requestClient.post(o, {}, buildArchiveDownloadForm(r), {
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
                let r = t.profiles.map((r, i) => {
                    let n = e.getAccountDisplayName(r, i);
                    return t.activeProfileId === r.id ? `${n} *` : n;
                }), i = t.profiles.findIndex(e => e.id === t.activeProfileId);
                i < 0 && (i = 0);
                let n = await UI.showSelectDialog(e.translate("accountSwitch"), r, i);
                if (null == n || n < 0 || n >= t.profiles.length) return;
                let a = t.profiles[n];
                await e.activateAccountProfile(a.id), UI.showMessage(e.translate("accountSwitched"));
            }
        }
    });
}

function freezeLocaleTable(e) {
    return Object.freeze(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...httpSupportApi,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi
});

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
    return {
        loginWithWebview: {
            url: buildForumsLoginUrl(),
            checkStatus: (e, t) => "E-Hentai Forums" === t,
            onLoginSuccess: async () => {
                let t = await Network.getCookies(buildForumsCookieUrl()), r = [];
                t.forEach(t => {
                    if (!t || !t.name) return;
                    if (!e.accountFieldNames.includes(String(t.name))) return;
                    let i = String(t.value || "");
                    0 !== i.length && (r.push(new Cookie({
                        name: String(t.name),
                        value: i,
                        domain: ".e-hentai.org"
                    })), r.push(new Cookie({
                        name: String(t.name),
                        value: i,
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
                let i = null;
                return !!await e.withDocument(r.body, async e => {
                    let t = e.querySelector("div#userlinks > p.home > b > a");
                    return !!t && (i = t.text, !0);
                }) && (e.upsertAccountProfile(t, i || ""), !0);
            }
        },
        logout: () => {
            e.logoutAccountSession();
        },
        registerWebsite: null
    };
}

const EHENTAI_EXPLORE_PAGES = [ {
    title: "eh latest",
    url: e => e.baseUrl
}, {
    title: "eh popular",
    url: e => buildPopularUrl(e.baseUrl)
}, {
    title: "eh watched",
    url: e => buildWatchedUrl(e.baseUrl),
    requiresLogin: !0
} ], EHENTAI_RANKING = [ [ "15", "yesterday" ], [ "13", "month" ], [ "12", "year" ], [ "11", "all" ] ];

function createMappedExploreFeature(e, t) {
    return t.map(t => ({
        title: t.title,
        type: "multiPageComicList",
        loadNext: async r => {
            if (t.requiresLogin && !e.isLogged) return UI.showMessage("Need login first"), {
                comics: [],
                next: null
            };
            let i = null != r ? r : t.url(e);
            return e.getGalleries(i, !1);
        }
    }));
}

function createEhentaiExploreFeature(e) {
    return createMappedExploreFeature(e, EHENTAI_EXPLORE_PAGES);
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
            options: EHENTAI_RANKING.map(e => `${e[0]}-${e[1]}`),
            load: async (t, r) => {
                let i = (await e.getGalleries(buildToplistUrl(buildBaseUrl("e-hentai.org"), t, r - 1), !0)).comics;
                return "exhentai.org" === e.loadSetting("domain") && i.forEach(e => {
                    e.id = e.id.replace("e-hentai", "exhentai");
                }), {
                    comics: i,
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
    post(e, t = {}, r = null, i = {}) {
        return this._getManagedClient().post(e, t, r, i);
    }
    head(e, t = {}, r = {}) {
        return this._getManagedClient().head(e, t, r);
    }
    _getManagedClient() {
        return this._managedClient || (this._managedClient = createManagedRequestClient(this.source, {
            domainKeyResolver: e => domainKey(e),
            shouldCooldown: (e, t, r) => {
                if (!t.classifyBody) return !1;
                const i = String(e && e.body || "");
                return !!hasNonWhitespaceText(i) && r.isAbuseResponseBody(i);
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
        const i = e.firstPage.thumbnails.length;
        if (!i) throw "Failed to resolve page URL: empty thumbnail page";
        const n = Math.floor(t / i), a = t % i, o = null == (r = (await this.source.comic.loadThumbnails(e.comicId, n.toString())).urls) ? void 0 : r[a];
        if (!o) throw `Failed to resolve page URL for page ${t}`;
        return o;
    }
    async dispatchImage({comicId: e, page: t, nl: r}) {
        const i = await this.ensureSession(e), n = this.source.parseUrl(e), a = r || "initial";
        if (i.key.mpvkey) {
            var o;
            const l = null == (o = i.key.imageKeys) ? void 0 : o[t];
            if (!l) throw `Failed to dispatch image: missing mpv image key for page ${t}`;
            const s = buildImageDispatchPayload({
                galleryId: n.id,
                imgKey: l,
                page: t + 1,
                mpvkey: i.key.mpvkey,
                nl: r
            }), u = await this.source.requestClient.post(this.source.apiUrl, {}, s, {
                action: "Failed to dispatch image",
                requestKey: `image:mpv:${e}:${t}:${l}:${a}`,
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
        const l = imageKeyFromPageUrl(await this.getPageUrl(i, t));
        if (!l) throw `Failed to dispatch image: missing showpage image key for page ${t}`;
        const s = buildShowPagePayload({
            galleryId: n.id,
            imgKey: l,
            page: t + 1,
            showkey: i.key.showkey,
            nl: r
        }), u = await this.source.requestClient.post(this.source.apiUrl, {}, s, {
            action: "Failed to dispatch image",
            requestKey: `image:show:${e}:${t}:${l}:${a}`,
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
    createRetry({image: e, comicId: t, epId: r, nl: i, attempt: n}) {
        return i ? n >= 2 ? null : async () => this.source.imageSessions.load({
            image: e,
            comicId: t,
            epId: r,
            nl: i,
            attempt: n + 1
        }) : null;
    }
    async load({image: e, comicId: t, epId: r, nl: i, attempt: n = 0}) {
        const a = Number(e), o = await this.dispatchImage({
            comicId: t,
            page: a,
            nl: i
        });
        return {
            url: o.url,
            headers: this.source.buildRequestHeaders("GET", o.url, {}, {
                headerProfile: "thumbnail"
            }),
            onLoadFailed: this.createRetry({
                image: e,
                comicId: t,
                epId: r,
                nl: o.nl,
                attempt: n
            })
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const i = String(null == e ? "" : e).trim() || t;
    return r ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), n = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), a = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), s = String(e || "").replace(/^\/+/, "");
    if (!s) return `${i}/${n}/${a}@${o}`;
    const u = l ? `${l}/${s}` : s;
    return `${i}/${n}/${a}@${o}/${s.startsWith(`${l}/`) ? s : u}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
