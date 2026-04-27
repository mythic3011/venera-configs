class Ehentai extends ComicSource {
    constructor() {
        super(), this.name = "ehentai", this.key = "ehentai", this.version = "1.2.0", this.minAppVersion = "1.5.3",
        this.url = buildCdnSourceUrl("ehentai.js"), this.apikey = null, this.uid = null,
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
        return null == e ? "Unknown error" : "string" == typeof e ? e : e instanceof Error && e.message || "string" == typeof e.message && e.message.length > 0 ? e.message : String(e);
    }
    isRedirectError(e) {
        return this.getErrorMessage(e).toLowerCase().includes("redirect");
    }
    isAbuseResponseBody(e) {
        let t = String(e && e.body || e || "");
        return !this.hasNonWhitespace(t) || this._abuseResponsePattern.test(t);
    }
    hasNonWhitespace(e) {
        for (let t = 0; t < e.length; t++) {
            let r = e.charCodeAt(t);
            if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return !0;
        }
        return !1;
    }
    firstNonWhitespaceChar(e) {
        for (let t = 0; t < e.length; t++) {
            let r = e.charCodeAt(t);
            if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return e[t];
        }
        return "";
    }
    formatRequestError(e, t) {
        let r = this.getErrorMessage(t);
        return this.isRedirectError(r) ? `${e} failed: request was redirected by the server` : r.toLowerCase().includes("timeout") || r.toLowerCase().includes("network") || r.toLowerCase().includes("socket") ? `${e} failed: network error (${r})` : `${e} failed: ${r}`;
    }
    formatResponseError(e, t) {
        var r;
        let i = null == t ? void 0 : t.status, a = String(null != (r = null == t ? void 0 : t.body) ? r : "").trim();
        return 403 === i || 429 === i ? `${e} failed: server returned ${i}` : 0 === a.length ? `${e} failed: empty response from server` : this.isAbuseResponseBody(a) ? `${e} failed: access was denied by the server` : `${e} failed: invalid status code ${i}`;
    }
    requireStatus(e, t, r = 200) {
        if (!t || t.status !== r) throw this.formatResponseError(e, t || {});
    }
    requireNonEmptyBody(e, t) {
        const r = String(t && t.body || "");
        if (!this.hasNonWhitespace(r)) throw this.formatResponseError(e, t || {});
        return r;
    }
    requireHtmlBody(e, t) {
        const r = this.requireNonEmptyBody(e, t);
        if ("<" !== this.firstNonWhitespaceChar(r)) throw `${e} failed: invalid HTML response`;
        return r;
    }
    parseJsonResponse(e, t) {
        this.requireNonEmptyBody(e, t);
        try {
            return JSON.parse(t.body);
        } catch (t) {
            throw `${e} failed: invalid JSON response`;
        }
    }
    async withDocument(e, t) {
        const r = new HtmlDocument(e);
        try {
            return await t(r);
        } finally {
            r.dispose();
        }
    }
    buildRequestHeaders(e, t, r, i) {
        const a = {
            ...r || {}
        };
        return "json-api" === i.headerProfile && (a["Content-Type"] || (a["Content-Type"] = "application/json")),
        "form-urlencoded" === i.headerProfile && (a["Content-Type"] || (a["Content-Type"] = "application/x-www-form-urlencoded")),
        "gallery-view" === i.headerProfile && (a.cookie || (a.cookie = "nw=1")), "thumbnail" === i.headerProfile && (a.referer || (a.referer = this.baseUrl)),
        "forums-browser" === i.headerProfile && (a.accept || (a.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"),
        a["accept-encoding"] || (a["accept-encoding"] = "gzip, deflate, br"), a["accept-language"] || (a["accept-language"] = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7")),
        i.refererUrl && !a.referer && (a.referer = i.refererUrl), "dart-io" !== i.networkClient || a.http_client || (a.http_client = "dart:io"),
        a;
    }
    async checkEHEvent() {
        if (this.isLogged && this.loadSetting("ehevent")) try {
            const e = this.loadData("lastEventTime"), t = (new Date).toISOString().split("T")[0];
            if (e == t) return;
            const r = await this.requestClient.get(buildEhNewsUrl(), {}, {
                action: "Failed to load event news",
                requestKey: "event-news"
            });
            if (200 !== r.status || this.isAbuseResponseBody(r.body)) return;
            this.saveData("lastEventTime", t), await this.withDocument(r.body, async e => {
                const t = e.getElementById("eventpane");
                if (null == t) return;
                const r = t.querySelector("div > p:nth-child(2)");
                null != r && UI.showMessage(r.text);
            });
        } catch (e) {}
    }
    get baseUrl() {
        const e = this.loadSetting("domain");
        return e === this._cachedDomain && this._cachedBaseUrl || (this._cachedDomain = e,
        this._cachedBaseUrl = buildBaseUrl(e), this._cachedApiUrl = buildApiUrl(this._cachedBaseUrl)),
        this._cachedBaseUrl;
    }
    get apiUrl() {
        return this._cachedApiUrl || (this._cachedApiUrl = buildApiUrl(this.baseUrl)), this._cachedApiUrl;
    }
    get accountFieldNames() {
        return this._accountFieldNames;
    }
    normalizeAccountValues(e) {
        let t = [];
        for (let r = 0; r < this.accountFieldNames.length; r++) t.push(String(e && e[r] || ""));
        return t;
    }
    createAccountCookies(e) {
        let t = this.normalizeAccountValues(e), r = [];
        for (let e = 0; e < this.accountFieldNames.length; e++) {
            let i = this.accountFieldNames[e], a = t[e];
            r.push(new Cookie({
                name: i,
                value: a,
                domain: ".e-hentai.org"
            })), r.push(new Cookie({
                name: i,
                value: a,
                domain: ".exhentai.org"
            }));
        }
        return r;
    }
    applyCookiesFromValues(e) {
        let t = this.createAccountCookies(e);
        Network.deleteCookies(buildEhCookieUrl()), Network.deleteCookies(buildExCookieUrl()),
        Network.setCookies(buildEhCookieUrl(), t), Network.setCookies(buildExCookieUrl(), t);
    }
    clearRuntimeCaches() {
        this.responseCache.clear(), this.thumbnailCache.clear(), this.keyCache.clear(),
        this.galleryInfoCache.clear(), this.imageSessionCache.clear(), this.apikey = null,
        this.uid = null;
    }
    clearSessionCookies() {
        Network.deleteCookies(buildEhCookieUrl()), Network.deleteCookies(buildForumsCookieUrl()),
        Network.deleteCookies(buildExCookieUrl());
    }
    loadAccountStore() {
        if (this._accountStoreCache) return this._accountStoreCache;
        let e = this.loadData("accountStore"), t = null;
        if (!e) return this._accountStoreCache = {
            version: 1,
            activeProfileId: null,
            profiles: []
        }, this._accountStoreCache;
        if ("string" == typeof e) try {
            t = JSON.parse(e);
        } catch (e) {
            t = null;
        } else "object" == typeof e && (t = e);
        if (!t || !Array.isArray(t.profiles)) return this._accountStoreCache = {
            version: 1,
            activeProfileId: null,
            profiles: []
        }, this._accountStoreCache;
        let r = t.profiles.map((e, t) => {
            let r = this.normalizeAccountValues(e && e.values);
            return {
                id: String(e && e.id || `${Date.now()}_${t}`),
                name: e && e.name ? String(e.name) : "",
                values: r,
                createdAt: String(e && e.createdAt || (new Date).toISOString()),
                lastUsedAt: String(e && e.lastUsedAt || (new Date).toISOString())
            };
        }).filter(e => e.values[0] && e.values[1]), i = t.activeProfileId && r.some(e => e.id === t.activeProfileId) ? String(t.activeProfileId) : null;
        return this._accountStoreCache = {
            version: 1,
            activeProfileId: i,
            profiles: r
        }, this._accountStoreCache;
    }
    saveAccountStore(e) {
        let t = {
            version: 1,
            activeProfileId: e.activeProfileId || null,
            profiles: e.profiles || []
        };
        this._accountStoreCache = t, this.saveData("accountStore", JSON.stringify(t));
    }
    getAccountDisplayName(e, t) {
        let r = e && e.name ? e.name : `${this.translate("account")} ${t + 1}`, i = e && e.values ? e.values[0] : "";
        return i ? `${r} (${i})` : r;
    }
    upsertAccountProfile(e, t) {
        let r = this.normalizeAccountValues(e);
        if (!r[0] || !r[1]) return null;
        let i = this.loadAccountStore(), a = (new Date).toISOString(), l = i.profiles.find(e => e.values[0] === r[0] && e.values[1] === r[1]);
        if (l) return l.values = r, t && (l.name = t), l.lastUsedAt = a, i.activeProfileId = l.id,
        this.saveAccountStore(i), l.id;
        let n = `${Date.now()}_${Math.floor(1e5 * Math.random())}`;
        return i.profiles.push({
            id: n,
            name: t || "",
            values: r,
            createdAt: a,
            lastUsedAt: a
        }), i.activeProfileId = n, this.saveAccountStore(i), n;
    }
    async captureAccountFromCookieJar(e) {
        let t = await Network.getCookies(buildEhCookieUrl()), r = [];
        for (let e of this.accountFieldNames) {
            let i = t.find(t => t.name === e);
            r.push(i ? String(i.value || "") : "");
        }
        return this.upsertAccountProfile(r, e || "");
    }
    async activateAccountProfile(e) {
        let t = this.loadAccountStore(), r = t.profiles.find(t => t.id === e);
        if (!r) throw "Account profile not found";
        return this.applyCookiesFromValues(r.values), this.clearRuntimeCaches(), r.lastUsedAt = (new Date).toISOString(),
        t.activeProfileId = r.id, this.saveAccountStore(t), r;
    }
    logoutAccountSession() {
        this.clearSessionCookies(), this.clearRuntimeCaches();
        let e = this.loadAccountStore();
        e.activeProfileId = null, this.saveAccountStore(e);
    }
    getStarsFromPosition(e) {
        let t = 0;
        for (;";" !== e[t] && (t++, t !== e.length); ) ;
        switch (e.substring(0, t)) {
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

          case "background-position:-64px -21px":
            return .5;
        }
        return .5;
    }
    async onLoadFailed(e = null) {
        let t;
        try {
            t = await Network.getCookies(buildEhCookieUrl());
        } catch (e) {
            throw this.formatRequestError("Failed to recover session cookies", e);
        }
        throw t.forEach(e => {
            e.domain = ".exhentai.org";
        }), t = t.filter(e => "igneous" !== e.name), Network.deleteCookies(buildExCookieUrl()),
        Network.setCookies(buildExCookieUrl(), t), `You may not have permission to access this page${e ? ` (${e})` : ""}. Please check your network or try to login again.`;
    }
    async getGalleries(e, t) {
        try {
            await this.checkEHEvent();
        } catch (e) {}
        let r;
        try {
            r = await this.requestClient.get(e, {}, {
                action: "Failed to load gallery list",
                requestKey: `galleries:${e}`
            });
        } catch (e) {
            throw this.isRedirectError(e) && await this.onLoadFailed("request was redirected"),
            this.formatRequestError("Failed to load gallery list", e);
        }
        if (200 !== r.status) throw this.formatResponseError("Failed to load gallery list", r);
        if (0 === r.body.trim().length && await this.onLoadFailed("empty response from gallery list"),
        "<" !== r.body[0]) {
            if (this.isAbuseResponseBody(r.body)) throw "Your IP address has been banned";
            throw "Failed to load gallery list";
        }
        let i = new HtmlDocument(r.body);
        try {
            return parseGalleryList({
                document: i,
                source: this,
                url: e,
                isLeaderBoard: t
            });
        } finally {
            i.dispose();
        }
    }
}

const parsers = {}, features = {};

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

function buildPathQueryUrl(e, t, r, i = !1) {
    const a = buildPathUrl(e, t), l = buildQuery(r || {});
    return l ? `${a}?${l}` : i ? `${a}?` : a;
}

function buildCdnSourceUrl(e) {
    return buildPathUrl("https://cdn.jsdelivr.net/gh/mythic3011/venera-configs@main", e);
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

function buildRateGalleryPayload({galleryId: e, token: t, rating: r, apikey: i, apiuid: a}) {
    return {
        gid: e,
        token: t,
        method: "rategallery",
        rating: r,
        apikey: i,
        apiuid: a
    };
}

function buildVoteCommentPayload({galleryId: e, token: t, commentId: r, isUp: i, apikey: a, apiuid: l}) {
    return {
        gid: e,
        token: t,
        method: "votecomment",
        comment_id: r,
        comment_vote: i ? 1 : -1,
        apikey: a,
        apiuid: l
    };
}

function buildImageDispatchPayload({galleryId: e, imgKey: t, page: r, mpvkey: i, nl: a}) {
    return {
        gid: e,
        imgkey: t,
        method: "imagedispatch",
        page: r,
        mpvkey: i,
        nl: a
    };
}

function buildShowPagePayload({galleryId: e, imgKey: t, page: r, showkey: i, nl: a}) {
    return {
        gid: e,
        imgkey: t,
        method: "showpage",
        page: r,
        showkey: i,
        nl: a
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

function parseGalleryList({document: e, source: t, url: r, isLeaderBoard: i}) {
    function a(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    function l(e, t, r) {
        return e && e.attributes && void 0 !== e.attributes[t] ? e.attributes[t] : r;
    }
    function n(e, t) {
        let r = e ? e.match(/\d+/) : null;
        if (!r) return t;
        let i = Number(r[0]);
        return isNaN(i) ? t : i;
    }
    const o = i ? 1 : 0, s = [];
    for (let i of e.querySelectorAll("table.itg.gltc > tbody > tr")) try {
        let e = i.children.length > 1 + o ? i.children[1 + o] : null;
        if (!e) continue;
        let u = e.children.length > 2 ? e.children[2] : null, c = a(u && u.children.length > 0 ? u.children[0] : null, ""), d = t.getStarsFromPosition(l(u && u.children.length > 1 ? u.children[1] : null, "style", "")), h = e;
        h && h.children.length > 1 && (h = h.children[1]), h && h.children.length > 0 && (h = h.children[0]),
        h && h.children.length > 0 && (h = h.children[0]);
        let g = l(h, "src", "");
        g && "d" === g[0] && (g = l(h, "data-src", g));
        let p = i.children.length > 2 + o ? i.children[2 + o] : null, m = p && p.children.length > 0 ? p.children[0] : null, y = a(m && m.children.length > 0 ? m.children[0] : null, "Unknown"), f = l(m, "href", ""), b = "", v = 0;
        try {
            if (r.includes("/favorites.php")) {
                let t = e;
                t.children.length > 1 && (t = t.children[1]), t.children.length > 1 && (t = t.children[1]),
                t.children.length > 1 && (t = t.children[1]), v = n(a(t && t.children.length > 1 ? t.children[1] : null, ""), 0);
            } else {
                let e = i.children.length > 3 + o ? i.children[3 + o] : null;
                v = n(a(e && e.children.length > 1 ? e.children[1] : null, ""), 0);
                let t = null;
                e && e.children.length > 0 && (t = e.children[0]), t && t.children.length > 0 && (t = t.children[0]),
                b = a(t, "");
            }
        } catch (e) {}
        let w = [], S = null, k = m && m.children.length > 1 ? m.children[1] : null;
        for (let e of k ? k.children : []) {
            let t = l(e, "title", "");
            if (t) {
                if (t.startsWith("language:")) {
                    let e = t.split(":")[1].trim();
                    S = "translated" === e ? S : e;
                    continue;
                }
                w.push(t);
            }
        }
        s.push(new Comic({
            id: f,
            title: y,
            subTitle: b,
            cover: g,
            tags: w,
            description: c,
            stars: d,
            maxPage: v,
            language: S
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("div.gl1t")) try {
        let e = a(r.querySelector("a"), "Unknown"), i = r.querySelectorAll("div.gl5t > div > div"), o = i.find(e => !isNaN(Date.parse(e.text)));
        o = a(o, "");
        let u = l(r.querySelector("img"), "src", ""), c = t.getStarsFromPosition(l(r.querySelector("div.gl5t > div > div.ir"), "style", "")), d = l(r.querySelector("a"), "href", ""), h = n(a(i.find(e => e.text.includes("page")), ""), 0);
        s.push(new Comic({
            id: d,
            title: e,
            cover: u,
            description: o,
            stars: c,
            maxPage: h
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.glte > tbody > tr")) try {
        let e = a(r.querySelector("td.gl2e > div > a > div > div.glink"), "Unknown"), i = r.querySelectorAll("td.gl2e > div > div.gl3e > div"), o = a(i.find(e => !isNaN(Date.parse(e.text))), "Unknown"), u = a(r.querySelector("td.gl2e > div > div.gl3e > div > a"), "Unknown"), c = l(r.querySelector("td.gl1e > div > a > img"), "src", ""), d = t.getStarsFromPosition(l(r.querySelector("td.gl2e > div > div.gl3e > div.ir"), "style", "")), h = l(r.querySelector("td.gl1e > div > a"), "href", ""), g = r.querySelectorAll("div.gt, div.gtl").map(e => l(e, "title", ""));
        g = g.filter(e => !!e);
        let p = n(a(i.find(e => e.text.includes("page")), ""), 0), m = null, y = g.find(e => e.startsWith("language:") && !e.includes("translated"));
        y && y.includes(":") && (m = y.split(":")[1].trim()), s.push(new Comic({
            id: h,
            title: e,
            subTitle: u,
            cover: c,
            tags: g,
            description: o,
            stars: d,
            maxPage: p,
            language: m
        }));
    } catch (e) {}
    for (let r of e.querySelectorAll("table.itg.gltm > tbody > tr")) try {
        let e = a(r.querySelector("td.gl3m > a > div.glink"), "Unknown"), i = a(r.querySelectorAll("td.gl2m > div").find(e => !isNaN(Date.parse(e.text))), "Unknown"), n = a(r.querySelector("td.gl5m > div > a"), "Unknown"), o = r.querySelector("td.gl2m > div > div > img"), u = l(o, "src", "");
        u && "d" === u[0] && (u = l(o, "data-src", u));
        let c = t.getStarsFromPosition(l(r.querySelector("td.gl4m > div.ir"), "style", "")), d = l(r.querySelector("td.gl3m > a"), "href", "");
        s.push(new Comic({
            id: d,
            title: e,
            subTitle: n,
            cover: u,
            description: i,
            stars: c
        }));
    } catch (e) {}
    return {
        comics: s,
        next: l(e.querySelector("a#dnext"), "href", void 0)
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
    let i = new Map;
    for (let r of e.querySelectorAll("div#taglist > table > tbody > tr")) {
        let e = r.children.length > 0 ? r.children[0] : null, a = r.children.length > 1 ? r.children[1] : null, l = t(e, "");
        if (!l) continue;
        let n = [], o = a ? a.children : [];
        for (let e of o) try {
            let t = e.children.length > 0 ? e.children[0] : null, r = t && t.attributes ? t.attributes.onclick : null;
            if (!r) continue;
            let i = r.split(":");
            if (i.length < 2) continue;
            let a = i[1].split("'")[0];
            a && n.push(a);
        } catch (e) {}
        i.set(l.substring(0, l.length - 1), n);
    }
    let a = "1";
    for (let t of e.querySelectorAll("td.gdt2")) if (t.text.includes("page")) {
        let e = r(t.text, /\d+/);
        e && (a = e);
    }
    let l = " Add to Favorites" !== t(e.querySelector("a#favoritelink"), ""), n = null;
    if (l) {
        let t = e.querySelector("div#fav"), r = null;
        if (t && t.children.length > 0 && t.children[0].attributes && (r = t.children[0].attributes.style),
        r && r.includes("background-position:0px -")) {
            let e = r.split("background-position:0px -");
            if (e.length > 1) {
                let t = e[1].split("px;")[0], r = Number(t);
                isNaN(r) || (n = ((r - 2) / 19).toString());
            }
        }
    }
    let o = "", s = e.querySelector("div#gleft > div#gd1 > div"), u = s && s.attributes ? s.attributes.style : "", c = RegExp("https?://([-a-zA-Z0-9.]+(/\\S*)?\\.(?:jpg|jpeg|gif|png|webp))").exec(u || "");
    c && (o = c[0]);
    let d = e.getElementById("gdn"), h = d && d.children.length > 0 ? d.children[0].text : void 0, g = e.getElementById("rating_label"), p = g ? g.text : "", m = p ? p.split(":") : [], y = m.length > 1 ? m[1].trim() : "0", f = Number(y), b = t(e.querySelector("div.cs"), "Unknown");
    i.set("Category", [ b ]), h && i.set("uploader", [ h ]);
    let v, w = t(e.querySelector("div#gdd > table > tbody > tr > td.gdt2"), ""), S = e.querySelectorAll("script").find(e => e.text.includes("var token")), k = RegExp("var\\s+(\\w+)\\s*=\\s*(.*?);", "g"), C = new Map, U = S && S.text ? S.text : "";
    for (;null !== (v = k.exec(U)); ) C.set(v[1], v[2]);
    let q = t(e.querySelector("h1#gn"), "Unknown"), x = t(e.querySelector("h1#gj"), null);
    return null != x && "" === x.trim() && (x = null), {
        title: q,
        subtitle: x,
        coverPath: o,
        tags: i,
        stars: f,
        maxPage: Number(a),
        isFavorited: l,
        folder: n,
        time: w,
        token: C.get("token"),
        apikey: C.get("apikey"),
        uid: C.get("apiuid")
    };
}

function parseThumbnailPage(e, t) {
    function r(e, t, r) {
        return e && e.attributes && void 0 !== e.attributes[t] ? e.attributes[t] : r;
    }
    const i = e => {
        let t = r(e, "style", "");
        if (!t) return "";
        let i = 0, a = 0, l = t.match(/width:(\d+)px/), n = t.match(/height:(\d+)px/);
        l && (i = Number(l[1])), n && (a = Number(n[1]));
        let o = t.split("background:transparent url(");
        if (o.length < 2) return "";
        let s = o[1], u = s.split(")")[0];
        if (!u) return "";
        let c = "";
        if (s.includes("px")) {
            let e = s.split(") -");
            if (e.length > 1) {
                let t = Number(e[1].split("px")[0]);
                isNaN(t) || (c += `x=${t}-${t + i}`);
            }
        }
        return a && (c += `${c ? "&" : ""}y=0-${a}`), c && (u += `@${c}`), u;
    }, a = (t, r) => e.querySelectorAll(t).map(e => r(e)).filter(e => !!e);
    let l = e.querySelectorAll("div.gdtm > div").map(e => i(e)).filter(e => !!e);
    if (l.push(...a("div.gdtl > a > img", e => r(e, "src", ""))), 0 === l.length) {
        const e = [ "div.gt100 > a > div", "div.gt200 > a > div" ];
        for (let t of e) l.push(...a(t, e => {
            let t = 0 === e.children.length ? e : e.children[0];
            return i(t);
        }));
    }
    let n = a("table.ptb > tbody > tr > td > a", e => r(e, "href", "")), o = 0;
    for (let e of n) {
        let t = e.split("="), r = Number(t.length > 1 ? t[1] : "");
        !isNaN(r) && r > o && (o = r);
    }
    let s = t ? Number(t) : 0;
    s += 1;
    let u = s > o ? null : s.toString();
    return {
        thumbnails: l,
        urls: a("div#gdt a", e => r(e, "href", "")),
        next: u
    };
}

function parseDispatchKey(e) {
    function t(e) {
        return e && "string" == typeof e.text ? e.text : "";
    }
    let r = e.querySelectorAll("script"), i = null, a = null;
    for (let e of r) {
        let r = t(e);
        if (!i && r.includes("showkey") && (i = e), !a && r.includes("mpvkey") && (a = e),
        i && a) break;
    }
    if (i) {
        let e = RegExp('showkey="(.*?)"', "g").exec(t(i));
        if (e) return {
            showkey: e[1]
        };
    }
    let l = t(a);
    if (l) {
        let e = "", t = [], r = l.split(";"), i = r.find(e => e.includes("mpvkey"));
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
    function t(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    function r(e, t) {
        if (e && e.attributes) return e.attributes[t];
    }
    let i = [];
    for (let a of e.querySelectorAll("div.c1")) {
        let e = t(a.querySelector("div.c3 > a"), ""), l = a.querySelector("div.c3"), n = l && l.text ? l.text : null, o = n ? n.split("Posted on") : [], s = o.length > 1 ? o[1] : "", u = s ? s.split("by") : [], c = u.length > 0 ? u[0] : "", d = c && c.trim ? c.trim() : "unknown", h = "", g = a.querySelector("div.c6");
        h = "undefined" != typeof appVersion ? g && "string" == typeof g.innerHTML ? g.innerHTML : "" : t(g, "");
        let p = Number(t(a.querySelector("div.c5 > span"), ""));
        isNaN(p) && (p = null);
        let m = "0", y = r(a.previousElementSibling, "name"), f = y ? y.match(/\d+/) : null;
        f && (m = f[0]);
        let b = r(a.querySelector(`a#comment_vote_up_${m}`), "style"), v = r(a.querySelector(`a#comment_vote_down_${m}`), "style"), w = "string" == typeof b && b.length > 0, S = "string" == typeof v && v.length > 0;
        i.push(new Comment({
            id: m,
            content: h,
            time: d,
            userName: e,
            score: p,
            voteStatus: w ? 1 : S ? -1 : 0
        }));
    }
    return {
        comments: i,
        maxPage: 1
    };
}

function parseArchiveOptions(e, t) {
    function r(e, t) {
        return e && "string" == typeof e.text ? e.text : t;
    }
    let i = e.querySelector("div#db"), a = t.includes("exhentai") ? 1 : 3, l = [], n = e.querySelector("table");
    if (n) {
        let e = n.querySelectorAll("td");
        for (let t of e) {
            let e = t.querySelector("a");
            if (e) {
                let i = e.attributes ? e.attributes.onclick : null, a = i ? i.match(/do_hathdl\('([^']+)'\)/) : null;
                if (a) {
                    let i = a[1], n = r(e, "Unknown"), o = t.querySelectorAll("p"), s = o.length > 1 ? r(o[1], "Unknown") : "Unknown", u = o.length > 2 ? r(o[2], "Unknown") : "Unknown";
                    l.push({
                        id: `h@h_${i}`,
                        title: `H@H ${n}`,
                        description: `Size: ${s}, Cost: ${u}`
                    });
                }
            }
        }
    }
    let o = null;
    if (i && i.children.length > a && i.children[a].children.length > 0 && (o = i.children[a].children[0]),
    o) {
        let e = r(o.querySelector("div > strong"), "Unknown"), t = r(o.querySelector("p > strong"), "Unknown");
        l.push({
            id: "0",
            title: "Original",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    let s = null;
    if (i && i.children.length > a && i.children[a].children.length > 1 && (s = i.children[a].children[1]),
    s) {
        let e = r(s.querySelector("div > strong"), "Unknown"), t = r(s.querySelector("p > strong"), "Unknown");
        l.push({
            id: "1",
            title: "Resample",
            description: `Cost: ${e}, Size: ${t}`
        });
    }
    return l;
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
        loadNext: async (t, r, i) => {
            let a = [];
            try {
                a = JSON.parse(r[0]);
            } catch (e) {
                throw "Failed to parse search options";
            }
            let l = r[1], n = r[2], o = 1023;
            Array.isArray(a) || (a = [ a ]);
            for (let e of a) o -= 1 << Number(e);
            n && !t.includes("language:") && (t += ` language:${n}`);
            let s = buildSearchUrl(e.baseUrl, t, o, l);
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
        addOrDelFavorite: async (t, r, i, a) => {
            let l = e.parseUrl(t), n = l.id, o = l.token;
            const s = buildGalleryPopupUrl(e.baseUrl, n, o);
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
                for (let n of e.querySelectorAll("div.fp")) {
                    var i, a, l;
                    if ("Show All Favorites" === n.text) continue;
                    let e = null != (i = null == (a = n.children[2]) ? void 0 : a.text) ? i : `Favorite ${t.size}`, o = null == (l = n.children[0]) ? void 0 : l.text;
                    o && (e += ` (${o})`, r += +o), t.set((t.size - 1).toString(), e);
                }
                return t.set("-1", `All (${r})`), t;
            }), a = [];
            if (t) {
                let r = await e.comic.loadInfo(t);
                r.isFavorite && a.push(r.folder);
            }
            return {
                folders: i,
                favorited: a
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
                const a = parseGalleryDetails(r);
                let l = e.comic.parseComments(r), n = new ComicDetails({
                    id: t,
                    title: a.title,
                    subTitle: a.subtitle,
                    cover: a.coverPath,
                    tags: a.tags,
                    stars: a.stars,
                    maxPage: a.maxPage,
                    isFavorite: a.isFavorited,
                    uploadTime: a.time,
                    url: t,
                    comments: l.comments
                });
                return n.folder = a.folder, n.token = a.token, e.apikey = a.apikey, e.apikey && '"' === e.apikey[0] && (e.apikey = e.apikey.substring(1, e.apikey.length - 1)),
                e.uid = a.uid, n;
            });
            return e.galleryInfoCache.set(t, i), i;
        },
        loadThumbnails: async (t, r) => {
            const i = thumbnailCacheKey(t, r);
            if (e.thumbnailCache.has(i)) return e.thumbnailCache.get(i);
            let a = buildGalleryPageUrl(t, r), l = await e.requestClient.get(a, {
                "cache-time": "long",
                "prevent-parallel": "true"
            }, {
                action: "Failed to load thumbnails",
                requestKey: `thumbnails:${i}`,
                headerProfile: "gallery-view"
            });
            e.requireStatus("Failed to load thumbnails", l), e.requireHtmlBody("Failed to load thumbnails", l);
            const n = await e.withDocument(l.body, async e => parseThumbnailPage(e, r));
            return e.thumbnailCache.set(i, n), n;
        },
        starRating: async (t, r) => {
            const i = e.parseUrl(t);
            let a = await e.requestClient.post(e.apiUrl, {}, buildRateGalleryPayload({
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
            return e.requireStatus("Failed to submit rating", a), "ok";
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
        onImageLoad: async (t, r, i, a) => e.imageSessions.load({
            image: t,
            comicId: r,
            epId: i,
            nl: a,
            attempt: 0
        }),
        onThumbnailLoad: t => ({
            url: t = normalizeThumbnailHost(t),
            headers: e.buildRequestHeaders("GET", t, {}, {
                headerProfile: "thumbnail"
            })
        }),
        parseComments: e => parseComments(e),
        loadComments: async (t, r, i, a) => {
            let l = await e.requestClient.get(buildCommentsUrl(t), {}, {
                action: "Failed to load comments",
                requestKey: `comments:${t}`,
                headerProfile: "gallery-view"
            });
            return e.requireStatus("Failed to load comments", l), e.requireHtmlBody("Failed to load comments", l),
            e.withDocument(l.body, async t => e.comic.parseComments(t));
        },
        sendComment: async (t, r, i, a) => {
            let l = await e.requestClient.post(t, {}, buildCommentForm(i), {
                action: "Failed to submit comment",
                requestKey: `comment:${t}`,
                mutation: !0,
                maxRetries: 0,
                headerProfile: "form-urlencoded",
                refererUrl: t
            });
            if (l.status >= 400) throw e.formatResponseError("Failed to submit comment", l);
            return e.requireHtmlBody("Failed to submit comment", l), await e.withDocument(l.body, async e => {
                const t = e.querySelector("p.br");
                if (t) throw t.text;
            }), "ok";
        },
        voteComment: async (t, r, i, a, l) => {
            if (null == e.apikey || null == e.uid) throw "Login required";
            const n = e.parseUrl(t);
            let o = await e.requestClient.post(e.apiUrl, {}, buildVoteCommentPayload({
                galleryId: n.id,
                token: n.token,
                commentId: i,
                isUp: a,
                apikey: e.apikey,
                apiuid: e.uid
            }), {
                action: "Failed to vote comment",
                requestKey: `vote:${t}:${i}:${a ? "up" : "down"}`,
                mutation: !0,
                maxRetries: 0,
                classifyBody: !1,
                headerProfile: "json-api"
            });
            e.requireStatus("Failed to vote comment", o);
            let s = e.parseJsonResponse("Failed to vote comment", o);
            if (s.error) throw s.error;
            return s.comment_score;
        },
        archive: {
            getArchives: async t => {
                await e.comic.loadInfo(t);
                let r = e.parseUrl(t), i = r.id, a = r.token;
                const l = buildArchiverUrl(e.baseUrl, i, a);
                let n = await e.requestClient.get(l, {}, {
                    action: "Failed to load archive options",
                    requestKey: `archive:options:${t}`
                });
                return e.requireStatus("Failed to load archive options", n), e.requireHtmlBody("Failed to load archive options", n),
                e.withDocument(n.body, async t => parseArchiveOptions(t, e.baseUrl));
            },
            getDownloadUrl: async (t, r) => {
                let i = e.parseUrl(t), a = i.id, l = i.token;
                const n = buildArchiverUrl(e.baseUrl, a, l);
                if (r.startsWith("h@h_")) {
                    let i = r.substring(4), a = await e.requestClient.post(n, {}, buildHathDownloadForm(i), {
                        action: "Failed to send H@H download command",
                        requestKey: `archive:hath:${t}:${i}`,
                        mutation: !0,
                        maxRetries: 0,
                        headerProfile: "form-urlencoded"
                    });
                    return e.requireStatus("Failed to send H@H download command", a), e.requireHtmlBody("Failed to send H@H download command", a),
                    await e.withDocument(a.body, async e => {
                        let t = e.querySelector("p.br");
                        if (t) {
                            let e = t.text;
                            throw e.includes("H@H client") ? "You need an H@H client associated with your account to use this feature" : e.includes("offline") ? "Your H@H client appears to be offline. Please start it and try again" : e.includes("resolution") ? "This gallery cannot be downloaded at the selected resolution" : e;
                        }
                    }), "";
                }
                let o = await e.requestClient.post(n, {}, buildArchiveDownloadForm(r), {
                    action: "Failed to create archive download",
                    requestKey: `archive:create:${t}:${r}`,
                    mutation: !0,
                    maxRetries: 0,
                    headerProfile: "form-urlencoded"
                });
                e.requireStatus("Failed to create archive download", o), e.requireHtmlBody("Failed to create archive download", o);
                let s = await e.withDocument(o.body, async e => {
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
                let r = t.profiles.map((r, i) => {
                    let a = e.getAccountDisplayName(r, i);
                    return t.activeProfileId === r.id ? `${a} *` : a;
                }), i = t.profiles.findIndex(e => e.id === t.activeProfileId);
                i < 0 && (i = 0);
                let a = await UI.showSelectDialog(e.translate("accountSwitch"), r, i);
                if (null == a || a < 0 || a >= t.profiles.length) return;
                let l = t.profiles[a];
                await e.activateAccountProfile(l.id), UI.showMessage(e.translate("accountSwitched"));
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
                let t = await Network.getCookies(buildForumsCookieUrl());
                t.forEach(e => {
                    e.domain = ".exhentai.org";
                }), Network.setCookies(buildExCookieUrl(), t);
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
        this.source = e;
    }
    get(e, t = {}, r = {}) {
        return this.send("GET", e, t, null, r);
    }
    post(e, t = {}, r = null, i = {}) {
        return this.send("POST", e, t, r, i);
    }
    head(e, t = {}, r = {}) {
        return this.send("HEAD", e, t, null, r);
    }
    async send(e, t, r = {}, i = null, a = {}) {
        var l, n, o, s, u;
        const c = `${e}:${t}`, d = {
            action: a.action || `${e} ${t}`,
            requestKey: a.requestKey || c,
            domainKey: a.domainKey || domainKey(t),
            expectedStatus: null != (l = a.expectedStatus) ? l : 200,
            maxRetries: null != (n = a.maxRetries) ? n : (a.mutation, 0),
            cooldownMs: null != (o = a.cooldownMs) ? o : 6e4,
            classifyBody: null == (s = a.classifyBody) || s,
            mutation: null != (u = a.mutation) ? u : "GET" !== e
        }, h = this.source.requestState.cooldownUntil.get(d.domainKey);
        if (h && h > Date.now()) throw `${d.action} blocked: temporary cooldown in effect`;
        const g = d.requestKey, p = this._resolveHeaders(e, t, r, d);
        if (this.source.requestState.inflight.has(g)) return this.source.requestState.inflight.get(g);
        const m = this._enqueueByDomain(d.domainKey, () => this._sendWithRetry(e, t, p, i, d));
        this.source.requestState.inflight.set(g, m);
        try {
            return await m;
        } finally {
            this.source.requestState.inflight.delete(g);
        }
    }
    _enqueueByDomain(e, t) {
        const r = (this.source.requestState.queues.get(e) || Promise.resolve()).then(t, t), i = r.then(() => {}, () => {});
        return this.source.requestState.queues.set(e, i), i.finally(() => {
            this.source.requestState.queues.get(e) === i && this.source.requestState.queues.delete(e);
        }), r;
    }
    async _sendWithRetry(e, t, r, i, a) {
        let l = 0;
        const n = Math.max(0, a.maxRetries) + 1;
        for (;l < n; ) {
            let o;
            l += 1;
            try {
                o = await this._dispatch(e, t, r, i);
            } catch (e) {
                if (l >= n) throw this.source.formatRequestError(a.action, e);
                continue;
            }
            if (this._shouldCooldown(o, a)) throw this._markCooldown(a.domainKey, a.cooldownMs),
            this.source.formatResponseError(a.action, o);
            if (o.status === a.expectedStatus) return o;
            if (l >= n || a.mutation) throw this.source.formatResponseError(a.action, o);
        }
        throw `${a.action} failed after retries`;
    }
    _resolveHeaders(e, t, r, i) {
        return "function" == typeof this.source.buildRequestHeaders ? this.source.buildRequestHeaders(e, t, r || {}, i || {}) : r || {};
    }
    async _dispatch(e, t, r, i) {
        return "GET" === e ? Network.get(t, r) : "POST" === e ? Network.post(t, r, i) : Network.sendRequest(e, t, r, i);
    }
    _shouldCooldown(e, t) {
        if (403 === e.status || 429 === e.status) return !0;
        if (!t.classifyBody) return !1;
        const r = String(e && e.body || "");
        return !this._hasNonWhitespace(r) || this.source.isAbuseResponseBody(r);
    }
    _hasNonWhitespace(e) {
        for (let t = 0; t < e.length; t++) {
            let r = e.charCodeAt(t);
            if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return !0;
        }
        return !1;
    }
    _markCooldown(e, t) {
        this.source.requestState.cooldownUntil.set(e, Date.now() + t);
    }
}

class ImageLoadingSessionManager {
    constructor(e) {
        this.source = e;
    }
    async ensureSession(e) {
        const t = this.source.imageSessionCache.get(e);
        if (t) return t;
        const r = await this.source.comic.loadThumbnails(e, null), i = {
            comicId: e,
            firstPage: r,
            key: await this.source.comic.getKey(r.urls[0]),
            attempts: new Map
        };
        return this.source.imageSessionCache.set(e, i), i;
    }
    async getPageUrl(e, t) {
        if (t < e.firstPage.urls.length) return e.firstPage.urls[t];
        const r = e.firstPage.thumbnails.length, i = Math.floor(t / r), a = t % r;
        return (await this.source.comic.loadThumbnails(e.comicId, i.toString())).urls[a];
    }
    async dispatchImage({comicId: e, page: t, nl: r}) {
        const i = await this.ensureSession(e), a = this.source.parseUrl(e);
        if (i.key.mpvkey) {
            const e = buildImageDispatchPayload({
                galleryId: a.id,
                imgKey: i.key.imageKeys[t],
                page: t + 1,
                mpvkey: i.key.mpvkey,
                nl: r
            }), l = await this.source.requestClient.post(this.source.apiUrl, {
                "Content-Type": "application/json"
            }, e, {
                action: "Failed to dispatch image",
                mutation: !0,
                maxRetries: 0,
                classifyBody: !1
            }), n = JSON.parse(l.body);
            return {
                url: String(n.i),
                nl: String(n.s)
            };
        }
        const l = await this.getPageUrl(i, t), n = buildShowPagePayload({
            galleryId: a.id,
            imgKey: imageKeyFromPageUrl(l),
            page: t + 1,
            showkey: i.key.showkey,
            nl: r
        }), o = await this.source.requestClient.post(this.source.apiUrl, {
            "Content-Type": "application/json"
        }, n, {
            action: "Failed to dispatch image",
            mutation: !0,
            maxRetries: 0,
            classifyBody: !1
        }), s = JSON.parse(o.body), u = s.i6, c = RegExp("nl\\('(.+?)'\\)").exec(u), d = c ? c[1] : null;
        let h = s.i3;
        return h = h.substring(h.indexOf('src="') + 5, h.indexOf('" style')), {
            url: h,
            nl: d
        };
    }
    createRetry({image: e, comicId: t, epId: r, nl: i, attempt: a}) {
        return i ? a >= 2 ? null : async () => this.source.imageSessions.load({
            image: e,
            comicId: t,
            epId: r,
            nl: i,
            attempt: a + 1
        }) : null;
    }
    async load({image: e, comicId: t, epId: r, nl: i, attempt: a = 0}) {
        const l = Number(e), n = await this.dispatchImage({
            comicId: t,
            page: l,
            nl: i
        });
        return {
            url: n.url,
            headers: this.source.buildRequestHeaders("GET", n.url, {}, {
                headerProfile: "thumbnail"
            }),
            onLoadFailed: this.createRetry({
                image: e,
                comicId: t,
                epId: r,
                nl: n.nl,
                attempt: a
            })
        };
    }
}