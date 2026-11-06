class Komga extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Komga", this.key = "komga", this.version = "1.0.0", this.minAppVersion = "1.4.0",
        this.url = resolvePluginUpdateUrl("komga.js"), this.settings = {
            base_url: {
                title: "服务器地址",
                type: "input",
                default: "https://demo.komga.org",
                validator: "^(https?:\\/\\/).+$"
            }
        }, this.account = {
            login: async (e, t) => {
                if (!e || !t) throw "账号或密码不能为空";
                const r = Convert.encodeBase64(Convert.encodeUtf8(`${e}:${t}`)), o = "string" == typeof r ? r : Convert.decodeUtf8(r), a = await Network.get(this.buildUrl(KOMGA_ROUTES.currentUserPath()), {
                    ...withBasic({
                        Accept: "application/json"
                    }, o)
                });
                if (401 === a.status) throw "账号或密码错误";
                if (200 !== a.status) throw `登录失败: ${a.status}`;
                return this.saveData("komga_auth", o), this.saveData("komga_account_email", e),
                await this.refreshReferenceData(!0), e;
            },
            logout: () => {
                this.deleteData("komga_auth"), this.deleteData("komga_account_email"), this.deleteData("komga_libraries"),
                this.deleteData("komga_tags"), this.deleteData("komga_genres"), this.deleteData("komga_languages"),
                this.deleteData("komga_collections"), this.deleteData("komga_meta_ts");
            },
            registerWebsite: null
        }, this.explore = [ {
            title: "Komga",
            type: "singlePageWithMultiPart",
            load: async () => {
                await this.refreshReferenceData(!1);
                const e = {}, t = await this.fetchSeriesList(KOMGA_ROUTES.latestSeriesPath(), {
                    size: 12,
                    page: 0
                });
                t.comics.length && (e["最新上架"] = t.comics);
                const r = await this.fetchSeriesList(KOMGA_ROUTES.updatedSeriesPath(), {
                    size: 12,
                    page: 0
                });
                r.comics.length && (e["最近更新"] = r.comics);
                const o = this.loadData("komga_libraries");
                if (Array.isArray(o)) for (const t of o.slice(0, 4)) {
                    const r = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), {
                        page: 0,
                        size: 12,
                        sort: [ "metadata.lastModified,desc" ],
                        library_id: [ t.id ]
                    });
                    r.comics.length && (e[`书库 ${t.name}`] = r.comics);
                }
                if (!Object.keys(e).length) throw "未找到可展示的数据，请确认已登录且服务器可用";
                return e;
            }
        } ], this.category = {
            title: "Komga",
            parts: [ createStaticCategoryPart("常用", "all", "all", null), createStoredCategoryPart({
                partName: "书库",
                storageKey: "komga_libraries",
                getSource: () => this,
                getLabel: e => null == e ? void 0 : e.name,
                getCategory: () => "library",
                getParam: e => null == e ? void 0 : e.id
            }), createStoredCategoryPart({
                partName: "合集",
                storageKey: "komga_collections",
                getSource: () => this,
                getLabel: e => null == e ? void 0 : e.name,
                getCategory: () => "collection",
                getParam: e => null == e ? void 0 : e.id
            }), createStoredCategoryPart({
                partName: "标签",
                storageKey: "komga_tags",
                getSource: () => this,
                getLabel: e => e,
                getCategory: () => "tag",
                getParam: e => e
            }), createStoredCategoryPart({
                partName: "语言",
                storageKey: "komga_languages",
                getSource: () => this,
                getLabel: e => e,
                getCategory: () => "language",
                getParam: e => e
            }), createStoredCategoryPart({
                partName: "题材",
                storageKey: "komga_genres",
                getSource: () => this,
                getLabel: e => e,
                getCategory: () => "genre",
                getParam: e => e
            }) ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, r, o) => {
                await this.refreshReferenceData(!1);
                const a = "all" === e ? "created,desc" : "metadata.lastModified,desc", i = {
                    page: Math.max(0, (o || 1) - 1),
                    size: 30,
                    sort: [ this.extractOption(r, 0, a) ]
                };
                if ("all" === e) {
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), i);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("library" === e && t) {
                    i.library_id = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), i);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("collection" === e && t) {
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.collectionSeriesPath(t), i);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("tag" === e && t) {
                    i.tag = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), i);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("language" === e && t) {
                    i.language = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), i);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                i.genre = [ t ];
                const n = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), i);
                return {
                    comics: n.comics,
                    maxPage: Math.max(1, n.totalPages)
                };
            },
            optionList: [ {
                options: [ "*created,desc-添加时间(新→旧)", "created,asc-添加时间(旧→新)", "metadata.lastModified,desc-更新时间(新→旧)", "metadata.lastModified,asc-更新时间(旧→新)", "metadata.titleSort,asc-标题(A-Z)", "metadata.titleSort,desc-标题(Z-A)" ],
                notShowWhen: null,
                showWhen: null
            } ]
        }, this.search = {
            load: async (e, t, r) => {
                const o = {
                    page: Math.max(0, (r || 1) - 1),
                    size: 30,
                    sort: [ this.extractOption(t, 0, "metadata.lastModified,desc") ]
                };
                let a = (e || "").trim();
                const i = a.indexOf(":");
                if (i > 0) {
                    const e = a.slice(0, i).toLowerCase(), t = a.slice(i + 1).trim();
                    t && ("tag" === e ? o.tag = [ t ] : "author" === e ? o.author = [ `${t},` ] : "language" === e ? o.language = [ t ] : "genre" === e ? o.genre = [ t ] : "publisher" === e ? o.publisher = [ t ] : o.search = t),
                    a = "";
                }
                a && (o.search = a);
                const n = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), o);
                return {
                    comics: n.comics,
                    maxPage: Math.max(1, n.totalPages)
                };
            },
            optionList: [ {
                type: "select",
                options: [ "*metadata.lastModified,desc-更新时间(新→旧)", "metadata.lastModified,asc-更新时间(旧→新)", "metadata.titleSort,asc-标题(A-Z)", "metadata.titleSort,desc-标题(Z-A)" ],
                label: "排序",
                default: null
            } ]
        }, this.comic = {
            loadInfo: async e => {
                var t, r, o;
                const a = this.extractBookId(e);
                if (a) return await this.loadBookDetails(a);
                const [i, n] = await Promise.all([ this.getJson(KOMGA_ROUTES.seriesDetailsPath(e)), this.getJson(KOMGA_ROUTES.seriesBooksPath(e), {
                    unpaged: !0,
                    sort: [ "metadata.numberSort,asc" ]
                }) ]), s = Array.isArray(null == n ? void 0 : n.content) ? n.content : [], l = s.filter(e => this.isSupportedBook(e));
                l.sort((e, t) => this.compareBooks(e, t));
                const u = new Map;
                l.forEach((e, t) => {
                    u.set(e.id, this.formatBookTitle(e, t));
                });
                const c = (null == i ? void 0 : i.metadata) || {}, d = (null == i || null == (t = i.booksMetadata) ? void 0 : t.summary) || c.summary || "", p = this.collectAuthors(null == i || null == (r = i.booksMetadata) ? void 0 : r.authors), h = Array.isArray(c.genres) ? c.genres : [], m = Array.isArray(null == i || null == (o = i.booksMetadata) ? void 0 : o.tags) ? i.booksMetadata.tags : [], g = d || "暂无简介", y = {};
                return p.length && (y["作者"] = p), h.length && (y["类型"] = this.uniqueArray(h)), m.length && (y["标签"] = this.uniqueArray(m)),
                !l.length && s.length && (y["提示"] = [ "该系列包含的项目暂不支持阅读" ]), new ComicDetails({
                    title: c.title || (null == i ? void 0 : i.name) || e,
                    subTitle: p.slice(0, 3).join(", "),
                    cover: this.buildUrl(KOMGA_ROUTES.seriesThumbnailPath(e)),
                    description: g,
                    tags: y,
                    chapters: u,
                    updateTime: this.formatDate(null == i ? void 0 : i.lastModified),
                    uploadTime: this.formatDate(null == i ? void 0 : i.created),
                    url: (null == i ? void 0 : i.url) || this.buildUrl(KOMGA_ROUTES.seriesWebPath(e))
                });
            },
            loadEp: async (e, t) => {
                let r = t || e;
                "string" == typeof r && r.startsWith("book:") && (r = r.slice(5)), "string" == typeof e && e.startsWith("book:") && !t && (r = e.slice(5));
                const o = await this.getJson(KOMGA_ROUTES.bookPagesPath(r)), a = Array.isArray(o) ? o : [];
                a.sort((e, t) => {
                    var r, o;
                    return (null != (r = null == e ? void 0 : e.number) ? r : 0) - (null != (o = null == t ? void 0 : t.number) ? o : 0);
                });
                const i = a.some(e => {
                    var t;
                    return 0 === (null != (t = null == e ? void 0 : e.number) ? t : 1);
                });
                return {
                    images: a.filter(e => this.isPageRenderable(e)).map(e => {
                        var t;
                        const o = null != (t = null == e ? void 0 : e.number) ? t : 0;
                        return this.buildUrl(KOMGA_ROUTES.bookPageImagePath(r, o), i ? {
                            zero_based: !0
                        } : null);
                    })
                };
            },
            onImageLoad: e => ({
                headers: this.imageHeaders
            }),
            onThumbnailLoad: () => ({
                headers: this.imageHeaders
            }),
            onClickTag: (e, t) => {
                if (!t) throw "无效的标签";
                const r = (e || "").toLowerCase();
                return "作者" === r ? {
                    action: "search",
                    keyword: `author:${t}`,
                    param: null
                } : "类型" === r || "标签" === r ? {
                    action: "category",
                    keyword: `genre:${t}`,
                    param: `${t}`
                } : {
                    action: "search",
                    keyword: t,
                    param: null
                };
            },
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return resolveSelfHostedBaseUrl(this.loadSetting("base_url"), this.settings.base_url.default, {
            defaultScheme: "https"
        });
    }
    get authToken() {
        const e = this.loadData("komga_auth");
        if (e) return e;
        const t = this.loadSetting("default_username"), r = this.loadSetting("default_password");
        if (!t || !r) return null;
        const o = Convert.encodeBase64(Convert.encodeUtf8(`${t}:${r}`));
        return "string" == typeof o ? o : Convert.decodeUtf8(o);
    }
    get headers() {
        return withBasic({
            Accept: "application/json"
        }, this.authToken);
    }
    get imageHeaders() {
        return withBasic({}, this.authToken);
    }
    async init() {
        await initKomgaFeature(this);
    }
    async refreshReferenceData(e) {
        await refreshKomgaReferenceDataFeature(this, e);
    }
    async fetchSeriesList(e, t) {
        var r;
        const o = await this.getJson(e, t);
        return {
            comics: (Array.isArray(null == o ? void 0 : o.content) ? o.content : []).map(e => this.parseSeries(e)).filter(Boolean),
            totalPages: null != (r = null == o ? void 0 : o.totalPages) ? r : 1
        };
    }
    async fetchBookList(e, t) {
        var r;
        const o = await this.getJson(e, t);
        return {
            comics: (Array.isArray(null == o ? void 0 : o.content) ? o.content : []).map(e => this.parseBook(e)).filter(Boolean),
            totalPages: null != (r = null == o ? void 0 : o.totalPages) ? r : 1
        };
    }
    parseBook(e) {
        if (!e || !this.isSupportedBook(e)) return null;
        const t = e.metadata || {}, r = t.title || e.name || e.id, o = this.collectAuthors(t.authors), a = Array.isArray(t.tags) ? t.tags : [], i = t.summary || "", n = [];
        return e.seriesTitle && n.push(e.seriesTitle), o.length && n.push(o[0]), new Comic({
            id: `book:${e.id}`,
            title: r,
            subTitle: n.join(" · "),
            cover: this.buildUrl(KOMGA_ROUTES.bookThumbnailPath(e.id)),
            tags: this.uniqueArray(a).slice(0, 12),
            description: i
        });
    }
    extractBookId(e) {
        return "string" != typeof e ? null : e.startsWith("book:") ? e.slice(5) : null;
    }
    async loadBookDetails(e) {
        const t = await this.getJson(KOMGA_ROUTES.bookDetailsPath(e));
        if (!t) throw "未找到该图书";
        const r = t.metadata || {}, o = this.collectAuthors(r.authors), a = this.uniqueArray(Array.isArray(r.tags) ? r.tags : []), i = r.summary || "暂无简介", n = {};
        o.length && (n["作者"] = o), a.length && (n["标签"] = a), t.seriesTitle && (n["系列"] = [ t.seriesTitle ]),
        this.isSupportedBook(t) || (n["提示"] = [ "该图书暂不支持阅读" ]);
        const s = new Map, l = r.title || t.name || "立即阅读";
        return s.set(t.id, l), new ComicDetails({
            title: r.title || t.name || e,
            subTitle: t.seriesTitle || o.slice(0, 3).join(", "),
            cover: this.buildUrl(KOMGA_ROUTES.bookThumbnailPath(e)),
            description: i,
            tags: n,
            chapters: s,
            updateTime: this.formatDate(t.lastModified),
            uploadTime: this.formatDate(t.created),
            url: t.url || this.buildUrl(KOMGA_ROUTES.bookWebPath(e))
        });
    }
    parseSeries(e) {
        var t, r, o;
        if (!e) return null;
        const a = e.metadata || {}, i = a.title || e.name || e.id, n = this.collectAuthors(null == e || null == (t = e.booksMetadata) ? void 0 : t.authors), s = [];
        Array.isArray(a.genres) && s.push(...a.genres), Array.isArray(null == e || null == (r = e.booksMetadata) ? void 0 : r.tags) && s.push(...e.booksMetadata.tags);
        const l = (null == e || null == (o = e.booksMetadata) ? void 0 : o.summary) || a.summary || "";
        return new Comic({
            id: e.id,
            title: i,
            subTitle: n.slice(0, 2).join(", "),
            cover: this.buildUrl(KOMGA_ROUTES.seriesThumbnailPath(e.id)),
            tags: this.uniqueArray(s).slice(0, 12),
            description: l
        });
    }
    collectAuthors(e) {
        return Array.isArray(e) ? this.uniqueArray(e.map(e => null == e ? void 0 : e.name).filter(Boolean)) : [];
    }
    uniqueArray(e) {
        if (!Array.isArray(e)) return [];
        const t = new Set, r = [];
        for (const o of e) {
            const e = "string" == typeof o ? o.trim() : "";
            if (!e) continue;
            const a = e.toLowerCase();
            t.has(a) || (t.add(a), r.push(e));
        }
        return r;
    }
    isSupportedBook(e) {
        if (!e || !e.media) return !1;
        const t = String(e.media.status || "").toUpperCase();
        if (t && "READY" !== t) return !1;
        const r = String(e.media.mediaType || "").toLowerCase();
        return !(!r || r.includes("epub") || r.includes("pdf") || r.includes("mobi") || (e.media.pagesCount || 0) <= 0);
    }
    isPageRenderable(e) {
        if (!e) return !1;
        const t = String(e.mediaType || "").toLowerCase();
        return !t || t.startsWith("image/") || t.includes("jpeg") || t.includes("png") || t.includes("webp");
    }
    compareBooks(e, t) {
        var r, o, a, i, n, s;
        const l = "number" == typeof (null == e || null == (r = e.metadata) ? void 0 : r.numberSort) ? e.metadata.numberSort : NaN, u = "number" == typeof (null == t || null == (o = t.metadata) ? void 0 : o.numberSort) ? t.metadata.numberSort : NaN;
        if (!Number.isNaN(l) && !Number.isNaN(u)) return l - u;
        const c = parseFloat(null == e || null == (a = e.metadata) ? void 0 : a.number), d = parseFloat(null == t || null == (i = t.metadata) ? void 0 : i.number);
        return Number.isNaN(c) || Number.isNaN(d) ? ((null == e || null == (n = e.metadata) ? void 0 : n.title) || (null == e ? void 0 : e.name) || "").localeCompare((null == t || null == (s = t.metadata) ? void 0 : s.title) || (null == t ? void 0 : t.name) || "") : c - d;
    }
    formatBookTitle(e, t) {
        const r = (null == e ? void 0 : e.metadata) || {};
        return r.title ? r.title : r.number ? `第${r.number}卷` : null != (null == e ? void 0 : e.number) ? `第${e.number}卷` : `章节 ${t + 1}`;
    }
    extractOption(e, t, r) {
        if (!Array.isArray(e) || e.length <= t) return r;
        let o = e[t];
        if ("string" != typeof o) return r;
        o.startsWith("*") && (o = o.slice(1));
        const a = o.indexOf("-");
        return a > -1 ? o.slice(0, a) : o;
    }
    async getJson(e, t) {
        return await getSelfHostedJson(this, e, t);
    }
    ensureOk(e) {
        ensureSelfHostedHttpOk(e);
    }
    buildUrl(e, t) {
        return buildSelfHostedUrlFromSource(this, e, t);
    }
    buildQuery(e) {
        return buildSelfHostedQueryFromSource(e);
    }
    formatDate(e) {
        if (!e) return null;
        try {
            const t = new Date(e);
            return Number.isNaN(t.getTime()) ? null : t.toISOString().split("T")[0];
        } catch (e) {
            return null;
        }
    }
}

function joinRawQueryEntries(e) {
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const [e, o] = r;
        null != e && null != o && t.push(`${String(e)}=${String(o)}`);
    }
    return t.join("&");
}

function runtimeGet(e, t) {
    return Network.get(e, t);
}

async function getRuntimeJson(e, t, r) {
    const o = await runtimeGet(e, t);
    return assertRuntimeStatus(o, 200, r || e), parseRuntimeJsonBody(o, r || e);
}

async function getRuntimeDocument(e, t, r) {
    const o = await runtimeGet(e, t);
    return assertRuntimeStatus(o, 200, r || e), new HtmlDocument(o.body);
}

async function getSelfHostedJson(e, t, r, o) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const a = o && "object" == typeof o && !Array.isArray(o) ? o : {}, i = a.headers || e.headers, n = await Network.get(e.buildUrl(t, r), i);
    return ensureSelfHostedHttpOk(n, a), parseSelfHostedJsonBody(n.body);
}

async function postSelfHostedJson(e, t, r, o, a) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const i = a && "object" == typeof a && !Array.isArray(a) ? a : {}, n = i.headers || e.headers, s = await Network.post(e.buildUrl(t, r), n, o);
    return ensureSelfHostedHttpOk(s, i), {
        body: parseSelfHostedJsonBody(s.body),
        headers: s.headers || {}
    };
}

function defaultManagedDomainKey(e) {
    try {
        return new URL(String(e || "")).hostname || "default";
    } catch (e) {
        return "default";
    }
}

function defaultManagedDispatch(e, t, r, o) {
    return "GET" === e ? Network.get(t, r) : "POST" === e ? Network.post(t, r, o) : Network.sendRequest(e, t, r, o);
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
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = r.unauthorizedMessage || "Login expired", a = r.requestFailedMessage || "请求失败";
    if (!e) throw a;
    if (401 === e.status || 403 === e.status) throw o;
    if (e.status < 200 || e.status >= 300) throw `${a}: ${e.status}`;
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

function defaultRequestKey(e, t, r, o) {
    return o ? null : `${e}:${t}`;
}

function createDomainQueue(e, t, r) {
    const o = (e.queues.get(t) || Promise.resolve()).then(r, r), a = o.then(() => {}, () => {});
    return e.queues.set(t, a), a.finally(() => {
        e.queues.get(t) === a && e.queues.delete(t);
    }), o;
}

function markCooldown(e, t, r) {
    e.cooldownUntil.set(t, Date.now() + r);
}

ManagedRequestClient.prototype.get = function(e, t, r) {
    return this.send("GET", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.post = function(e, t, r, o) {
    return this.send("POST", e, t || {}, null == r ? null : r, o || {});
}, ManagedRequestClient.prototype.head = function(e, t, r) {
    return this.send("HEAD", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.send = async function(e, t, r, o, a) {
    const i = this.source, n = a && "object" == typeof a && !Array.isArray(a) ? a : {}, s = null == n.mutation ? "GET" !== e : !0 === n.mutation, l = n.requestKey || defaultRequestKey(e, t, o, s), u = "function" == typeof this.hooks.domainKeyResolver ? this.hooks.domainKeyResolver : defaultManagedDomainKey, c = {
        action: n.action || `${e} ${t}`,
        requestKey: l,
        domainKey: n.domainKey || u(t, e, o, n, i, this),
        expectedStatus: null == n.expectedStatus ? 200 : n.expectedStatus,
        maxRetries: null == n.maxRetries ? "GET" === e ? 1 : 0 : n.maxRetries,
        cooldownMs: null == n.cooldownMs ? 6e4 : n.cooldownMs,
        classifyBody: null == n.classifyBody || n.classifyBody,
        mutation: s,
        allowDedup: null == n.allowDedup ? !s : n.allowDedup
    }, d = i.requestState.cooldownUntil.get(c.domainKey);
    if (d && d > Date.now()) throw `${c.action} blocked: temporary cooldown in effect`;
    const p = this._resolveHeaders(e, t, r || {}, c), h = c.requestKey;
    if (c.allowDedup && h && i.requestState.inflight.has(h)) return i.requestState.inflight.get(h);
    const m = createDomainQueue(i.requestState, c.domainKey, () => this._sendWithRetry(e, t, p, o, c));
    c.allowDedup && h && i.requestState.inflight.set(h, m);
    try {
        return await m;
    } finally {
        c.allowDedup && h && i.requestState.inflight.delete(h);
    }
}, ManagedRequestClient.prototype._resolveHeaders = function(e, t, r, o) {
    return "function" == typeof this.hooks.buildHeaders ? this.hooks.buildHeaders(e, t, r, o, this.source, this) : this.source && "function" == typeof this.source.buildRequestHeaders ? this.source.buildRequestHeaders(e, t, r || {}, o || {}) : r || {};
}, ManagedRequestClient.prototype._sendWithRetry = async function(e, t, r, o, a) {
    let i = 0;
    const n = Math.max(0, a.maxRetries) + 1;
    for (;i < n; ) {
        let s;
        i += 1;
        try {
            s = await this._dispatch(e, t, r, o, a);
        } catch (e) {
            if (i >= n) throw defaultManagedRequestError(this.source, a.action, e);
            continue;
        }
        if (this._shouldCooldown(s, a)) throw this._markCooldown(a.domainKey, a.cooldownMs),
        defaultManagedResponseError(this.source, a.action, s);
        if (s.status === a.expectedStatus) return s;
        if (i >= n || a.mutation) throw defaultManagedResponseError(this.source, a.action, s);
    }
    throw `${a.action} failed after retries`;
}, ManagedRequestClient.prototype._dispatch = function(e, t, r, o, a) {
    return "function" == typeof this.hooks.dispatch ? this.hooks.dispatch(e, t, r, o, a, this.source, this) : defaultManagedDispatch(e, t, r, o);
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

function withAuthorization(e, t, r) {
    const o = {
        ...e || {}
    };
    return r ? (o.Authorization = `${t} ${r}`, o) : o;
}

function withBearer(e, t) {
    return withAuthorization(e, "Bearer", t);
}

function withBasic(e, t) {
    return withAuthorization(e, "Basic", t);
}

function encodeSelfHostedToken(e) {
    const t = String(e || "");
    if (!t) return "";
    const r = Convert.encodeBase64(Convert.encodeUtf8(t));
    return "string" == typeof r ? r : Convert.decodeUtf8(r);
}

function normalizeCookieUrl(e) {
    return String(e || "").trim().replace(/\/+$/, "");
}

function redactSecretValue(e) {
    const t = String(e || "");
    return t.length <= 4 ? t ? "****" : "" : `${t.slice(0, 2)}****${t.slice(-2)}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...httpSupportApi,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeCookieUrl
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    redactSecretValue
});

const securitySecretsApi = {
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken
}, securityCookiesApi = {
    normalizeCookieUrl
}, securityRedactionApi = {
    redactSecretValue
}, securitySupportApi = {
    ...securitySecretsApi,
    ...securityCookiesApi,
    ...securityRedactionApi
};

function buildOffsetByPage(e, t) {
    return ((Number.isFinite(Number(e)) ? Math.max(1, Number(e)) : 1) - 1) * (Number.isFinite(Number(t)) ? Math.max(1, Number(t)) : 1);
}

function normalizeStarOption(e) {
    return String(null == e ? "" : e).replace("*", "-");
}

function normalizeStarOptions(e) {
    return Array.isArray(e) ? e.map(e => normalizeStarOption(e)) : [];
}

function stripSelfHostedTrailingSlash(e) {
    return String(e || "").replace(/\/+$/, "");
}

function normalizeSelfHostedPathRoot(e, t) {
    const r = String(e || t || "").trim();
    return r ? `/${r.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
}

function normalizeSelfHostedPathSegment(e) {
    return String(null == e ? "" : e).replace(/^\/+|\/+$/g, "");
}

function joinSelfHostedPath(e, t) {
    const r = normalizeSelfHostedPathRoot(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = normalizeSelfHostedPathSegment(e);
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createSelfHostedRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedPathRoot(t.apiRoot, "/api"), o = normalizeSelfHostedPathRoot(t.archivesRoot, `${r}/archives`), a = normalizeSelfHostedPathRoot(t.categoriesRoot, `${r}/categories`), i = normalizeSelfHostedPathRoot(t.searchPath, `${r}/search`);
    return {
        apiRoot: r,
        archivesRoot: o,
        categoriesRoot: a,
        searchPath: i,
        categoriesPath: () => a,
        categoryArchivePath: (e, t) => joinSelfHostedPath(a, [ e, t ]),
        archivePath: e => joinSelfHostedPath(o, [ e ]),
        archiveMetadataPath: e => joinSelfHostedPath(o, [ e, "metadata" ]),
        archiveThumbnailPath: e => joinSelfHostedPath(o, [ e, "thumbnail" ]),
        archiveCategoriesPath: e => joinSelfHostedPath(o, [ e, "categories" ]),
        archiveFilesPath: e => joinSelfHostedPath(o, [ e, "files" ])
    };
}

function normalizeWebSourceBaseUrl(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = "string" == typeof r.defaultScheme ? r.defaultScheme.trim() : "";
    let a = String(e || "").trim();
    return a ? (o && !/^https?:\/\//i.test(a) && (a = `${o.replace(/:$/, "")}://${a}`),
    a.replace(/\/+$/, "")) : "";
}

function normalizeWebSourcePath(e, t) {
    const r = String(null == e ? t || "" : e).trim();
    return r ? /^https?:\/\//i.test(r) || r.startsWith("//") || r.startsWith("/") ? r : `/${r}` : "";
}

function joinWebSourcePath(e, t) {
    const r = normalizeWebSourcePath(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (a = `${a}/${t}`);
    }
    return a;
}

function buildWebSourceQuery(e) {
    if (!e || "object" != typeof e) return "";
    const t = [];
    for (const r of Object.keys(e)) {
        const o = e[r];
        if (null != o && "" !== o) if (Array.isArray(o)) for (const e of o) null != e && "" !== e && t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(o))}`);
    }
    return t.join("&");
}

function buildWebSourceUrl(e, t, r) {
    const o = normalizeWebSourceBaseUrl(e || ""), a = normalizeWebSourcePath(t, "");
    let i = a;
    /^https?:\/\//i.test(a) || a.startsWith("//") || (i = a ? `${o}${a.startsWith("/") ? "" : "/"}${a}` : o);
    const n = buildWebSourceQuery(r);
    return n ? `${i}${i.includes("?") ? "&" : "?"}${n}` : i;
}

function toWebSourceAbsoluteUrl(e, t) {
    const r = String(e || "").trim();
    return r ? /^https?:\/\//i.test(r) ? r : r.startsWith("//") ? `${normalizeWebSourceBaseUrl(t || "", {
        defaultScheme: "https"
    }).startsWith("http://") ? "http:" : "https:"}${r}` : buildWebSourceUrl(t, r) : "";
}

function replaceWebSourceBaseUrl(e, t, r) {
    const o = String(e || "").trim(), a = normalizeWebSourceBaseUrl(t || ""), i = normalizeWebSourceBaseUrl(r || "");
    return o && a && i ? o === a ? i : o.startsWith(`${a}/`) ? `${i}${o.slice(a.length)}` : o : o;
}

function ensureWebSourceTrailingSlash(e) {
    const t = String(e || "").trim();
    return t ? t.endsWith("/") ? t : `${t}/` : t;
}

function normalizeSelfHostedBaseUrl(e) {
    const t = String(e || "").trim();
    return t ? t.replace(/\/+$/, "") : "";
}

function normalizeSelfHostedRoutePath(e, t) {
    const r = String(null == e ? t || "" : e).trim();
    if (!r) return "";
    const o = r.replace(/\/+$/, "");
    return o.startsWith("/") ? o : `/${o}`;
}

function joinSelfHostedRoutePath(e, t) {
    const r = normalizeSelfHostedRoutePath(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createKomgaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), o = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), a = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), i = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), n = joinSelfHostedRoutePath(r, [ "series" ]), s = joinSelfHostedRoutePath(r, [ "books" ]), l = joinSelfHostedRoutePath(r, [ "collections" ]);
    return {
        apiV1Root: r,
        apiV2Root: o,
        seriesWebRoot: a,
        booksWebRoot: i,
        librariesPath: () => joinSelfHostedRoutePath(r, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(r, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(r, [ "languages" ]),
        collectionsPath: () => l,
        genresPath: () => joinSelfHostedRoutePath(r, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(o, [ "users", "me" ]),
        seriesPath: () => n,
        latestSeriesPath: () => joinSelfHostedRoutePath(n, [ "latest" ]),
        updatedSeriesPath: () => joinSelfHostedRoutePath(n, [ "updated" ]),
        collectionSeriesPath: e => joinSelfHostedRoutePath(l, [ e, "series" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        seriesBooksPath: e => joinSelfHostedRoutePath(n, [ e, "books" ]),
        seriesThumbnailPath: e => joinSelfHostedRoutePath(n, [ e, "thumbnail" ]),
        seriesWebPath: e => joinSelfHostedRoutePath(a, [ e ]),
        bookDetailsPath: e => joinSelfHostedRoutePath(s, [ e ]),
        bookThumbnailPath: e => joinSelfHostedRoutePath(s, [ e, "thumbnail" ]),
        bookPagesPath: e => joinSelfHostedRoutePath(s, [ e, "pages" ]),
        bookPageImagePath: (e, t) => joinSelfHostedRoutePath(s, [ e, "pages", t ]),
        bookWebPath: e => joinSelfHostedRoutePath(i, [ e ])
    };
}

function createKavitaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${r}/Library`), a = normalizeSelfHostedRoutePath(t.metadataRoot, `${r}/Metadata`), i = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${r}/metadata`), n = normalizeSelfHostedRoutePath(t.accountRoot, `${r}/Account`), s = normalizeSelfHostedRoutePath(t.seriesRoot, `${r}/Series`), l = normalizeSelfHostedRoutePath(t.imageRoot, `${r}/Image`), u = normalizeSelfHostedRoutePath(t.readerRoot, `${r}/Reader`), c = normalizeSelfHostedRoutePath(t.searchRoot, `${r}/Search`);
    return {
        apiRoot: r,
        libraryRoot: o,
        metadataRoot: a,
        metadataLegacyRoot: i,
        accountRoot: n,
        seriesRoot: s,
        imageRoot: l,
        readerRoot: u,
        searchRoot: c,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(i, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(n, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(s, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(s, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(s, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(s, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(l, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(s, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(u, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(c, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = "string" == typeof t ? t : "";
    let i = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : a);
    if (!i) return i;
    const n = "string" == typeof o.defaultScheme ? o.defaultScheme.trim() : "";
    return n && !/^https?:\/\//i.test(i) && (i = `${n.replace(/:$/, "")}://${i}`), normalizeSelfHostedBaseUrl(i);
}

function buildSelfHostedQuery(e) {
    if (!e) return "";
    const t = [];
    for (const r of Object.keys(e)) {
        const o = e[r];
        if (null != o) if (Array.isArray(o)) for (const e of o) null != e && t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(o))}`);
    }
    return t.join("&");
}

function buildSelfHostedUrl(e, t, r) {
    let o = t;
    /^https?:\/\//i.test(t) || (o = `${normalizeSelfHostedBaseUrl(e || "")}${String(t).startsWith("/") ? "" : "/"}${t}`);
    const a = buildSelfHostedQuery(r);
    return a ? `${o}?${a}` : o;
}

function buildSelfHostedUrlFromSource(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("buildSelfHostedUrlFromSource requires plugin source");
    return buildSelfHostedUrl(e.baseUrl, t, r);
}

function buildSelfHostedQueryFromSource(e) {
    return buildSelfHostedQuery(e);
}

function readSelfHostedOffset(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("readSelfHostedOffset requires plugin source");
    return Number(r || 1) <= 1 ? (e.saveData(t, 0), 0) : Number(e.loadData(t) || 0);
}

function updateSelfHostedOffset(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("updateSelfHostedOffset requires plugin source");
    const o = Number(e.loadData(t) || 0);
    e.saveData(t, o + (r || 0));
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...securitySupportApi,
    securitySecretsApi,
    securityCookiesApi,
    securityRedactionApi,
    securitySupportApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    readSelfHostedOffset,
    updateSelfHostedOffset
});

const pluginSourcePagingApi = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions
}, pluginSourceWebApi = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash
}, pluginSourceSelfHostedPathApi = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers
}, pluginSourceSelfHostedRouteApi = {
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    readSelfHostedOffset,
    updateSelfHostedOffset
}, pluginSourceContractApi = {
    ...pluginSourcePagingApi,
    ...pluginSourceWebApi,
    ...pluginSourceSelfHostedPathApi,
    ...pluginSourceSelfHostedRouteApi
};

function resolveMappedCategoryTagAction(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = null == o.namespace ? "标签" : String(o.namespace);
    if (String(e) !== a) throw o.unsupportedMessage || "Unsupported tag namespace";
    const i = o.mapping && "object" == typeof o.mapping ? o.mapping : {}, n = String(null == t ? "" : t), s = i[n], l = "function" == typeof o.keywordFormatter ? o.keywordFormatter(n, s, e) : n, u = "function" == typeof o.paramFormatter ? o.paramFormatter(n, s, e) : String(s);
    return {
        action: o.action || "category",
        keyword: l,
        param: u
    };
}

function createMappedCategoryTagActionResolver(e) {
    return (t, r) => resolveMappedCategoryTagAction(t, r, e);
}

function createSelfHostedReferenceCacheFeature(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = Number(t.ttlMs || 3e5), o = String(t.metaTimestampKey || ""), a = t.resetData && "object" == typeof t.resetData ? t.resetData : {}, i = "function" == typeof t.hasToken ? t.hasToken : () => !1, n = "function" == typeof t.loadPayload ? t.loadPayload : null, s = "function" == typeof t.savePayload ? t.savePayload : null, l = "function" == typeof t.shouldRethrow ? t.shouldRethrow : null;
    if (!o || !n || !s) throw new Error("Invalid createSelfHostedReferenceCacheFeature options");
    const u = e => {
        for (const [t, r] of Object.entries(a)) Array.isArray(r) ? e.saveData(t, r.slice()) : r && "object" == typeof r ? e.saveData(t, {
            ...r
        }) : e.saveData(t, r);
    };
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("refreshSelfHostedReferenceData requires plugin source");
        if (!i(e)) return void u(e);
        const a = Date.now(), c = Number(e.loadData(o) || 0);
        if (!(!t && c > 0 && a - c < r)) try {
            const t = await n(e);
            await s(e, t, a), e.saveData(o, a);
        } catch (t) {
            if (u(e), l && l(t, e)) throw t;
        }
    };
}

function createSafeInitFeature(e) {
    if ("function" != typeof e) throw new Error("createSafeInitFeature requires refresher");
    return async function(t) {
        try {
            await e(t, !1);
        } catch (e) {}
    };
}

function createStaticCategoryPart(e, t, r, o) {
    return {
        name: e,
        type: "dynamic",
        loader: function() {
            return [ {
                label: t,
                target: {
                    page: "category",
                    attributes: {
                        category: r,
                        param: null == o ? null : o
                    }
                }
            } ];
        }
    };
}

function createStoredCategoryPart(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.partName || ""), o = String(t.storageKey || ""), a = "function" == typeof t.getLabel ? t.getLabel : null, i = "function" == typeof t.getCategory ? t.getCategory : null, n = "function" == typeof t.getParam ? t.getParam : null, s = !0 === t.usePageJumpTarget, l = "function" == typeof t.getSource ? t.getSource : null;
    if (!(r && o && a && i && n)) throw new Error("Invalid createStoredCategoryPart options");
    return {
        name: r,
        type: "dynamic",
        loader: function() {
            const e = l ? l() : this, t = e && "function" == typeof e.loadData ? e.loadData(o) : null;
            if (!Array.isArray(t) || !t.length) return [];
            const r = [];
            for (const e of t) {
                const t = a(e), o = i(e), l = n(e);
                if (!t || !o) continue;
                const u = {
                    category: o,
                    param: null == l ? null : l
                };
                let c;
                c = s && "function" == typeof PageJumpTarget ? new PageJumpTarget({
                    page: "category",
                    attributes: u
                }) : {
                    page: "category",
                    attributes: u
                }, r.push({
                    label: t,
                    target: c
                });
            }
            return r;
        }
    };
}

function createOffsetSearchLoader(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.path || "/api/search"), o = "function" == typeof t.getOffsetKey ? t.getOffsetKey : null, a = "function" == typeof t.buildQuery ? t.buildQuery : null, i = "function" == typeof t.mapComic ? t.mapComic : null, n = "function" == typeof t.onResponse ? t.onResponse : null, s = String(t.statusErrorPrefix || "Invalid status code");
    if (!o || !a || !i) throw new Error("Invalid createOffsetSearchLoader options");
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("runOffsetSearch requires plugin source");
        const l = t && "object" == typeof t && !Array.isArray(t) ? t : {}, u = Number(l.page || 1), c = stripSelfHostedTrailingSlash(e.baseUrl), d = o(l), p = readSelfHostedOffset(e, d, u), h = buildSelfHostedQueryFromSource(a(l, p)), m = h ? `${c}${r}?${h}` : `${c}${r}`, g = await Network.get(m, e.headers);
        if (200 !== g.status) throw `${s}: ${g.status}`;
        const y = parseSelfHostedJsonBody(g.body) || {}, f = Array.isArray(y.data) ? y.data : [], C = f.map(t => i(t, {
            source: e,
            base: c,
            input: l
        })), S = f.length;
        updateSelfHostedOffset(e, d, S);
        const k = "number" == typeof y.recordsFiltered && y.recordsFiltered >= 0 ? y.recordsFiltered : p + S, L = S || 1, P = Math.max(1, Math.ceil(k / L));
        return n && n({
            source: e,
            input: l,
            start: p,
            returned: S,
            data: y,
            list: f,
            comics: C
        }), {
            comics: C,
            maxPage: P,
            data: y
        };
    };
}

function toSelfHostedTagArray(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = "string" == typeof r.delimiter ? r.delimiter : ",", a = "function" == typeof r.normalizeTag ? r.normalizeTag : e => String(e).trim();
    return e ? Array.isArray(e) ? e.map(e => a(e)).filter(Boolean) : String(e).split(o).map(e => a(e)).filter(Boolean) : [];
}

function startsWithSelfHostedTagPrefix(e, t, r) {
    const o = String(e || ""), a = String(t || "");
    return !!a && (!1 === r ? o.toLowerCase().startsWith(a.toLowerCase()) : o.startsWith(a));
}

function extractSelfHostedTagValue(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = "function" == typeof o.transform ? o.transform : e => e, n = toSelfHostedTagArray(e, o), s = String(t || "");
    for (const e of n) if (startsWithSelfHostedTagPrefix(e, s, a)) return i(String(e).slice(s.length).trim(), e);
    return null;
}

function removeSelfHostedTagsByPrefix(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = toSelfHostedTagArray(e, o), n = Array.isArray(t) ? t.map(e => String(e)) : [ String(t || "") ];
    return i.filter(e => !n.some(t => startsWithSelfHostedTagPrefix(e, t, a)));
}

function filterSelfHostedDisplayTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = Array.isArray(r.blockedPrefixes) ? r.blockedPrefixes : [], a = !0 === r.caseSensitive, i = !1 !== r.excludeUrlLike, n = "function" == typeof r.extraFilter ? r.extraFilter : null, s = toSelfHostedTagArray(e, r), l = [];
    for (const e of s) o.some(t => startsWithSelfHostedTagPrefix(e, t, a)) || i && String(e).includes("://") || n && !n(e) || l.push(e);
    return l;
}

function parseSelfHostedRatingValueFromTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = Array.isArray(r.starSymbols) ? r.starSymbols : [ "⭐", "★" ], i = extractSelfHostedTagValue(e, o, {
        caseSensitive: !0 === r.caseSensitive
    });
    if (!i) return null;
    if (a.some(e => String(i).includes(e))) {
        let e = 0;
        for (const t of a) {
            const r = String(t).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), o = String(i).match(new RegExp(r, "g"));
            if (o && o.length > 0) {
                e = o.length;
                break;
            }
        }
        return String(e);
    }
    return String(i).trim();
}

function extractSelfHostedUrlEntriesFromTagMap(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.sourceNamespace || "source").toLowerCase(), a = String(r.sourceScheme || "https").replace(/:$/, ""), i = new Set(Array.isArray(r.skipKeys) ? r.skipKeys.map(e => String(e)) : []), n = [];
    if (!e || "object" != typeof e) return n;
    for (const t of Object.keys(e)) {
        if (i.has(t)) continue;
        const r = e[t];
        if (!Array.isArray(r)) continue;
        const s = [];
        for (const e of r) if ("string" == typeof e) if (e.includes("://")) n.push(e); else {
            if (String(t).toLowerCase() === o) {
                let t = e;
                t.startsWith("//") ? t = `${a}:${t}` : /^https?:\/\//i.test(t) || (t = `${a}://${t}`),
                n.push(t);
                continue;
            }
            s.push(e);
        } else s.push(e);
        e[t] = s;
    }
    return n;
}

function buildSelfHostedEmojiRatingTag(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = String(r.symbol || "⭐"), i = Number(e) / 2;
    return `${o}${a.repeat(i)}`;
}

function unwrapCopyLikeComic(e) {
    return e && null != e.comic ? e.comic : e || {};
}

function readCopyLikePath(e, t, r) {
    if (!Array.isArray(t) || 0 === t.length) return e;
    let o = e;
    for (const e of t) {
        if (null == o || "object" != typeof o || !(e in o)) return r;
        o = o[e];
    }
    return o;
}

function parseCopyLikeThemeTags(e) {
    return e && Array.isArray(e.theme) ? e.theme.map(e => e && e.name).filter(e => null != e) : [];
}

function parseCopyLikePrimaryAuthor(e) {
    return e && Array.isArray(e.author) && 0 !== e.author.length && e.author[0] && e.author[0].name ? e.author[0].name : null;
}

function parseCopyLikeAuthorCount(e) {
    return e && Array.isArray(e.author) ? e.author.length : 0;
}

function formatCopyLikeRankingDescription(e, t, r) {
    const o = e && null != e.sort ? e.sort : null;
    if (null == o) return null;
    const a = e.rise_sort || 0;
    return `${o} ${a > 0 ? "▲" : a < 0 ? "▽" : "-"}\n${r > 1 ? `${t} 等${r}位` : t}\n🔥${(Number(e.popular || 0) / 1e4).toFixed(1)}W`;
}

function computeCopyLikeMaxPage(e, t) {
    const r = Number.isFinite(Number(t)) && Number(t) > 0 ? Number(t) : 21, o = Number.isFinite(Number(e)) ? Number(e) : 0;
    return Math.floor((o - o % r) / r) + 1;
}

function createHtmlDocument(e) {
    return new HtmlDocument(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...pluginSourceContractApi,
    pluginSourcePagingApi,
    pluginSourceWebApi,
    pluginSourceSelfHostedPathApi,
    pluginSourceSelfHostedRouteApi,
    pluginSourceContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    unwrapCopyLikeComic,
    readCopyLikePath
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createHtmlDocument
});

const parserCopyLikeApi = {
    unwrapCopyLikeComic,
    readCopyLikePath,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
    createCopyLikeComicParser
}, parserHtmlApi = {
    createHtmlDocument
}, parserSupportApi = {
    ...parserCopyLikeApi,
    ...parserHtmlApi
};

function createCopyLikeComicParser(e) {
    const t = e || {};
    return e => {
        const r = unwrapCopyLikeComic(e), o = parseCopyLikePrimaryAuthor(r), a = parseCopyLikeAuthorCount(r), i = {
            id: r.path_word,
            title: r.name,
            subTitle: o,
            cover: r.cover,
            tags: parseCopyLikeThemeTags(r)
        };
        if (t.includeRankingDescription) {
            const t = formatCopyLikeRankingDescription(e, o, a);
            if (null != t) return i.description = t, i;
        }
        if (t.includeUpdateDescription && (i.description = r.datetime_updated), "function" == typeof t.describe) {
            const n = t.describe({
                sourceComic: e,
                comic: r,
                author: o,
                authorCount: a
            });
            null != n && (i.description = n);
        }
        return i;
    };
}

function normalizeCopyLikeBaseUrl(e, t) {
    const r = String(t || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    let o = String(e || "").trim();
    if (!o) return r;
    o = o.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const a = o.indexOf("/");
    return a >= 0 && (o = o.slice(0, a)), o || r;
}

function buildCopyLikeApiUrl(e, t) {
    return `https://${normalizeCopyLikeBaseUrl(e, t)}`;
}

function buildCopyLikePageUrl(e, t) {
    const r = Number(t) > 1 ? `?page=${t}` : "";
    return `${normalizeCopyLikeBaseUrl(e)}${r}`;
}

function buildCopyLikeTokenHeader(e) {
    return "Token" + (e ? ` ${e}` : "");
}

function buildCopyLikeBearerTokenHeader(e) {
    return e ? `Token ${e}` : "";
}

function buildCopyLikeRequestSigningMeta(e) {
    const t = new Date(null == e ? Date.now() : e);
    return {
        dt: `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`,
        ts: String(Math.floor(t.getTime() / 1e3))
    };
}

function buildCopyLikeHmacSignature(e, t) {
    return Convert.hmacString(Convert.decodeBase64(e), Convert.encodeUtf8(String(t || "")), "sha256");
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...parserSupportApi,
    parserCopyLikeApi,
    parserHtmlApi,
    parserSupportApi
});

const COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION = "1.3.0", COPY_LIKE_LOGIN_EXPIRED = "Login expired", COPY_LIKE_RETRY_ERROR = "Retry", COPY_LIKE_CHAPTER_RETRY_LIMIT = 5, COPY_LIKE_CHAPTER_RATE_LIMIT_STATUS = 210, COPY_LIKE_CHAPTER_DEFAULT_WAIT_MS = 4e4, COPY_LIKE_GROUP_CHAPTER_PAGE_SIZE = 100;

function isCopyLikeAppVersionAfter(e, t) {
    const r = e.split("."), o = t.split(".");
    for (let e = 0; e < 3; e++) if (parseInt(r[e]) < parseInt(o[e])) return !1;
    return !0;
}

function copyLikeStatusError(e) {
    return `Invalid status code: ${e}`;
}

async function loadCopyLikeFavoriteStatus(e) {
    const t = e || {}, r = await Network.get(buildCopyLikeComicQueryUrl({
        apiUrl: t.apiUrl,
        id: t.id
    }), t.headers);
    if (200 !== r.status) throw copyLikeStatusError(r.status);
    return null != JSON.parse(r.body).results.collect;
}

async function updateCopyLikeFavorite(e) {
    const t = e || {}, r = t.getRequestId ? await t.getRequestId() : void 0, o = await Network.get(buildCopyLikeComicDetailUrl({
        apiUrl: t.apiUrl,
        id: t.comicId,
        inMainland: !0,
        requestId: r,
        platform: 3
    }), t.getHeaders ? t.getHeaders() : t.headers);
    if (200 !== o.status) throw copyLikeStatusError(o.status);
    const a = JSON.parse(o.body).results.comic.uuid, i = await Network.post(buildCopyLikeEndpointUrl(t.apiUrl, COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMIC_ACTION), withCopyLikeFormHeaders(t.getHeaders ? t.getHeaders() : t.headers), `comic_id=${a}&is_collect=${t.isAdding ? 1 : 0}&authorization=Token+${t.token}`);
    if (401 === i.status) throw "Login expired";
    if (200 !== i.status) throw copyLikeStatusError(i.status);
    return "ok";
}

async function loadCopyLikeGroupChapters(e) {
    const t = e || {}, r = Object.keys(t.groups), o = {}, a = () => t.getHeaders ? t.getHeaders() : t.headers;
    if (await Promise.all(r.map(async e => {
        const r = t.groups[e].path_word, i = t.getRequestId ? await t.getRequestId() : void 0;
        let n = await Network.get(buildCopyLikeGroupChaptersUrl({
            apiUrl: t.apiUrl,
            id: t.id,
            groupPath: r,
            limit: 100,
            offset: 0,
            inMainland: t.inMainland,
            requestId: i
        }), a());
        if (200 !== n.status) throw copyLikeStatusError(n.status);
        let s = JSON.parse(n.body);
        const l = new Map, u = e => {
            e.forEach(e => l.set(e.uuid, e.name));
        };
        u(s.results.list);
        const c = s.results.total;
        let d = 100;
        for (;d < c; ) {
            if (n = await Network.get(buildCopyLikeGroupChaptersUrl({
                apiUrl: t.apiUrl,
                id: t.id,
                groupPath: r,
                limit: 100,
                offset: d
            }), a()), 200 !== n.status) throw copyLikeStatusError(n.status);
            s = JSON.parse(n.body), u(s.results.list), d += 100;
        }
        o[e] = l;
    })), isCopyLikeAppVersionAfter(t.appVersion, "1.3.0")) {
        const e = new Map;
        for (const a of r) e.set(t.groups[a].name, o[a]);
        return e;
    }
    const i = new Map;
    for (const e of r) for (const [t, r] of o[e]) i.set(t, r);
    return i;
}

async function loadCopyLikeChapterData(e) {
    const t = e || {};
    let r = 0;
    for (;r < 5; ) try {
        const e = t.getRequestId ? await t.getRequestId() : t.requestId, r = await Network.get(buildCopyLikeChapterUrl({
            apiUrl: t.apiUrl,
            comicId: t.comicId,
            chapterId: t.chapterId,
            chapterEndpoint: t.chapterEndpoint,
            inMainland: t.inMainland,
            requestId: e,
            platform: t.platform,
            update: t.update
        }), {
            ...t.getHeaders ? t.getHeaders() : t.headers || {}
        });
        if (210 === r.status) {
            let e = 4e4;
            try {
                const t = JSON.parse(r.body);
                if (t.message && t.message.includes("Expected available in")) {
                    const r = t.message.match(/(\d+)\s*seconds/);
                    r && r[1] && (e = 1e3 * parseInt(r[1]));
                }
            } catch (e) {
                console.log("Unable to parse wait time, using default wait time 40s");
            }
            throw console.log(`Chapter${t.chapterId} access too frequent, waiting ${e / 1e3}s`),
            await new Promise(t => setTimeout(t, e)), "Retry";
        }
        if (200 !== r.status) throw copyLikeStatusError(r.status);
        const o = JSON.parse(r.body);
        return t.mapResponse ? t.mapResponse(o) : o;
    } catch (e) {
        if ("Retry" !== e) throw e;
        if (r += 1, r >= 5) throw e;
    }
}

const COPY_LIKE_ENDPOINT_PATHS = {
    LOGIN: "/api/v3/login",
    RANKS: "/api/v3/ranks",
    COMICS: "/api/v3/comics",
    SEARCH_COMIC: "/api/v3/search/comic",
    HOME_INDEX: "/api/v3/h5/homeIndex",
    HOME_INDEX_COMICS: "/api/v3/h5/homeIndex/comics",
    FAVORITE_COMICS: "/api/v3/member/collect/comics",
    FAVORITE_COMIC_ACTION: "/api/v3/member/collect/comic",
    COMMENTS: "/api/v3/comments",
    COMMENT_ACTION: "/api/v3/member/comment",
    ROASTS: "/api/v3/roasts",
    ROAST_ACTION: "/api/v3/member/roast",
    COMIC_DETAIL_PREFIX: "/api/v3/comic2/",
    COMIC_GROUP_PREFIX: "/api/v3/comic/"
}, COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded;charset=utf-8";

function withCopyLikeFormHeaders(e) {
    return {
        ...e || {},
        "Content-Type": COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE
    };
}

function buildCopyLikeEndpointUrl(e, t) {
    const r = String(e || "").replace(/\/+$/, ""), o = String(t || "");
    return o ? o.startsWith("http://") || o.startsWith("https://") ? o : o.startsWith("/") ? `${r}${o}` : `${r}/${o}` : r;
}

function buildCopyLikeQueryString(e) {
    return joinRawQueryEntries(e);
}

function buildCopyLikeUrlWithQuery(e, t, r) {
    const o = buildCopyLikeEndpointUrl(e, t), a = buildCopyLikeQueryString(r);
    return a ? `${o}?${a}` : o;
}

function buildCopyLikeRankingUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, COPY_LIKE_ENDPOINT_PATHS.RANKS, [ [ "free_type", t.freeType ], [ "limit", null == t.limit ? 30 : t.limit ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, null == t.limit ? 30 : t.limit) : t.offset ], [ "_update", null == t.update || t.update ], [ "type", null == t.type ? 1 : t.type ], [ "audience_type", t.audienceType ], [ "region", t.region ], [ "date_type", t.dateType ] ]);
}

function buildCopyLikeComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.COMICS, [ [ "free_type", t.freeType ], [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "ordering", t.ordering ], [ "theme", t.theme ], [ "top", t.top ], [ "author", t.author ], [ "q", t.keyword ], [ "q_type", t.queryType ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function buildCopyLikeSearchUrl(e) {
    const t = e || {}, r = null == t.limit ? 20 : t.limit, o = null == t.keyword ? "" : encodeURIComponent(String(t.keyword));
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC, [ [ "platform", t.platform ], [ "q", o ], [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "free_type", t.freeType ], [ "_update", t.update ], [ "q_type", t.queryType ] ]);
}

function buildCopyLikeHomeIndexComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 20 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX_COMICS, [ [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "top", t.top ], [ "ordering", t.ordering ] ]);
}

function buildCopyLikeFavoriteComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMICS, [ [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "free_type", t.freeType ], [ "ordering", t.ordering ] ]);
}

function buildCopyLikeComicDetailUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${t.id}`, [ [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ], [ "platform", t.platform ] ]);
}

function buildCopyLikeComicQueryUrl(e) {
    const t = e || {};
    return buildCopyLikeEndpointUrl(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${t.id}/query`);
}

function buildCopyLikeGroupChaptersUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${t.id}/group/${t.groupPath}/chapters`, [ [ "limit", null == t.limit ? 100 : t.limit ], [ "offset", null == t.offset ? 0 : t.offset ], [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ] ]);
}

function buildCopyLikeChapterUrl(e) {
    const t = e || {}, r = t.chapterEndpoint || "chapter2";
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${t.comicId}/${r}/${t.chapterId}`, [ [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function normalizeCopyLikeCategoryParam(e, t, r) {
    return null == e ? r : (t || {})[e] || "";
}

function parseCopyLikeDetailAuthors(e) {
    return e && Array.isArray(e.author) ? e.author.map(e => e && e.name).filter(e => null != e) : [];
}

function parseCopyLikeDetailTags(e) {
    return e && Array.isArray(e.theme) ? e.theme.map(e => e && e.name).filter(e => null != e) : [];
}

function buildCopyLikeDetailTagMap(e, t) {
    const r = t || {}, o = r.authorNamespace || "作者", a = r.updateNamespace || "更新", i = r.tagNamespace || "标签", n = r.statusNamespace || "状态", s = e && e.datetime_updated ? e.datetime_updated : "", l = e && e.status && e.status.display ? e.status.display : "";
    return {
        [o]: parseCopyLikeDetailAuthors(e),
        [a]: [ s ],
        [i]: parseCopyLikeDetailTags(e),
        [n]: [ l ]
    };
}

function resolveCopyLikeTagAction(e, t, r) {
    const o = r || {}, a = o.categoryNamespace || "标签", i = o.authorNamespace || "作者", n = o.unsupportedError || "未支持此类Tag检索";
    if (e === a) return {
        action: "category",
        keyword: `${t}`,
        param: null
    };
    if (e === i) return {
        action: "search",
        keyword: `${e}:${t}`,
        param: null
    };
    throw n;
}

function buildCopyLikeHomeSections(e, t, r) {
    const o = {};
    for (const a of t || []) {
        const t = readCopyLikePath(e, a.path, []);
        o[a.title] = Array.isArray(t) ? t.map(r) : [];
    }
    return o;
}

async function loadCopyLikeHomeSectionsModule(e) {
    return buildCopyLikeHomeSections(await getRuntimeJson(`${e.apiUrl}${e.endpoint || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX}`, e.headers, e.context || "copy_like home"), e.sections || [], e.parseComic);
}

async function loadCopyLikeListModule(e) {
    const t = await getRuntimeJson(e.requestUrl, e.headers, e.context || "copy_like list"), r = readCopyLikePath(t, e.listPath || [ "results", "list" ], []), o = readCopyLikePath(t, e.totalPath || [ "results", "total" ], 0);
    return {
        comics: Array.isArray(r) ? r.map(e.parseComic) : [],
        maxPage: computeCopyLikeMaxPage(o, e.maxPageDivisor || 21)
    };
}

function parseCopyLikeAuthorKeyword(e) {
    const t = String(e || "");
    return t.startsWith("作者:") ? t.substring(3).trim() : null;
}

async function loadCopyLikeSearchModule(e) {
    const t = parseCopyLikeAuthorKeyword(e.keyword), r = t ? e.resolveAuthorPathWord(t) : null;
    return loadCopyLikeListModule({
        requestUrl: r ? e.buildAuthorRequestUrl({
            pathWord: encodeURIComponent(r),
            page: e.page,
            keyword: e.keyword,
            options: e.options
        }) : e.buildKeywordRequestUrl({
            page: e.page,
            keyword: e.keyword,
            options: e.options
        }),
        headers: e.headers,
        parseComic: e.parseComic,
        context: e.context || "copy_like search",
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeExploreFeature(e) {
    return {
        title: e.title,
        type: "singlePageWithMultiPart",
        load: async () => loadCopyLikeHomeSectionsModule({
            apiUrl: e.getApiUrl(),
            headers: e.getHeaders(),
            parseComic: e.parseComic,
            sections: e.sections,
            endpoint: e.endpoint,
            context: e.context
        })
    };
}

function createCopyLikeCategoryLoadFeature(e) {
    return async (t, r, o, a) => loadCopyLikeListModule({
        requestUrl: e.buildRequestUrl({
            category: t,
            param: r,
            options: o,
            page: a
        }),
        headers: e.getHeaders(),
        parseComic: e.parseComic,
        context: e.context,
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeSearchLoadFeature(e) {
    return async (t, r, o) => loadCopyLikeSearchModule({
        keyword: t,
        options: r,
        page: o,
        headers: e.getHeaders(),
        parseComic: e.parseComic,
        resolveAuthorPathWord: e.resolveAuthorPathWord,
        buildAuthorRequestUrl: e.buildAuthorRequestUrl,
        buildKeywordRequestUrl: e.buildKeywordRequestUrl,
        context: e.context,
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeCategoryRequestUrlBuilder(e) {
    return ({category: t, param: r, options: o, page: a}) => {
        const i = Array.isArray(o) ? o : [], n = !1 === e.normalizeOptions ? i : normalizeStarOptions(i), s = e.getApiUrl();
        if ("function" == typeof e.isRankingCategory && e.isRankingCategory(t, r)) return buildCopyLikeRankingUrl({
            apiUrl: s,
            page: a,
            limit: null == e.rankingLimit ? 30 : e.rankingLimit,
            freeType: e.rankingFreeType,
            audienceType: null == e.rankingAudienceOptionIndex ? void 0 : i[e.rankingAudienceOptionIndex],
            region: null == e.rankingRegionOptionIndex ? void 0 : i[e.rankingRegionOptionIndex],
            dateType: null == e.rankingDateOptionIndex ? void 0 : i[e.rankingDateOptionIndex]
        });
        if ("function" == typeof e.isHomepageCategory && e.isHomepageCategory(t, r)) return buildCopyLikeHomeIndexComicsUrl({
            apiUrl: s,
            page: a,
            limit: null == e.homepageLimit ? 20 : e.homepageLimit,
            top: r,
            ordering: null == e.homepageOrderingOptionIndex ? void 0 : i[e.homepageOrderingOptionIndex]
        });
        const l = normalizeCopyLikeCategoryParam(t, e.categoryParamMap, r);
        return buildCopyLikeComicsUrl({
            apiUrl: s,
            page: a,
            limit: null == e.themedLimit ? 30 : e.themedLimit,
            freeType: e.themedFreeType,
            ordering: null == e.themedOrderingOptionIndex ? void 0 : n[e.themedOrderingOptionIndex],
            theme: l || "",
            top: null == e.themedTopOptionIndex ? void 0 : n[e.themedTopOptionIndex]
        });
    };
}

function createCopyLikeSearchRequestUrlBuilders(e) {
    return {
        buildAuthorRequestUrl: ({pathWord: t, page: r}) => buildCopyLikeComicsUrl({
            apiUrl: e.getApiUrl(),
            page: r,
            limit: null == e.authorLimit ? 30 : e.authorLimit,
            ordering: e.authorOrdering || "-datetime_updated",
            author: t
        }),
        buildKeywordRequestUrl: ({keyword: t, options: r, page: o}) => {
            const a = Array.isArray(r) ? r : [], i = null == e.queryTypeOptionIndex ? e.queryTypeDefault : null != a[e.queryTypeOptionIndex] ? a[e.queryTypeOptionIndex] : e.queryTypeDefault;
            return buildCopyLikeSearchUrl({
                apiUrl: e.getApiUrl(),
                endpointPath: "function" == typeof e.getKeywordEndpointPath ? e.getKeywordEndpointPath() : e.keywordEndpointPath,
                page: o,
                limit: null == e.keywordLimit ? 20 : e.keywordLimit,
                keyword: t,
                queryType: i,
                platform: e.keywordPlatform,
                freeType: e.keywordFreeType,
                update: e.keywordUpdate
            });
        }
    };
}

function createCopyLikeDetailTagMapper(e) {
    const t = e || {};
    return e => buildCopyLikeDetailTagMap(e, t);
}

function createCopyLikeTagClickActionHandler(e) {
    const t = e || {};
    return (e, r) => resolveCopyLikeTagAction(e, r, t);
}

function createCopyLikeExploreSectionsFeature(e) {
    return createCopyLikeExploreFeature({
        title: e.title,
        sections: e.sections,
        endpoint: e.endpoint,
        parseComic: e.parseComic,
        context: e.context,
        getApiUrl: e.getApiUrl,
        getHeaders: e.getHeaders
    });
}

function createCopyLikeCategoryLoaderFeature(e) {
    return createCopyLikeCategoryLoadFeature(e);
}

function createCopyLikeSearchLoaderFeature(e) {
    return createCopyLikeSearchLoadFeature(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION: "1.3.0",
    COPY_LIKE_LOGIN_EXPIRED: "Login expired",
    copyLikeStatusError,
    isCopyLikeAppVersionAfter,
    loadCopyLikeFavoriteStatus,
    updateCopyLikeFavorite,
    loadCopyLikeGroupChapters,
    loadCopyLikeChapterData,
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature
});

const MH_LIKE_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0", MH_LIKE_ENDPOINT_PATHS = {
    CATEGORY_PAGE_SEGMENT: "/page",
    SEARCH: "/s",
    CHAPTER_LIST: "/manga/get",
    CHAPTER_INFO: "/chapter/getinfo",
    CHAPTER_CONTENT: "/chapter/getcontent"
};

function normalizeMhLikeId(e) {
    return String(e || "").trim();
}

function normalizeMhLikeDomain(e) {
    return String(e || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function buildMhLikeBaseUrl(e) {
    return `https://${normalizeMhLikeDomain(e)}`;
}

function buildMhLikeHeaders(e) {
    return {
        "User-Agent": MH_LIKE_USER_AGENT,
        Referer: String(e || "")
    };
}

function normalizeMhLikePath(e, t) {
    let r = String(null == e ? t || "" : e).trim();
    return r || (r = String(t || "")), r ? (r = r.replace(/\/+$/, ""), r.startsWith("/") || (r = `/${r}`),
    r) : "";
}

function buildMhLikeRelativeUrl(e, t) {
    const r = String(e || "").replace(/\/+$/, ""), o = String(t || "").trim();
    return o ? o.startsWith("http://") || o.startsWith("https://") ? o : o.startsWith("/") ? `${r}${o}` : `${r}/${o}` : r;
}

function buildMhLikeApiBaseUrl(e, t) {
    return buildMhLikeRelativeUrl(buildMhLikeBaseUrl(e), normalizeMhLikePath(t, "/api"));
}

function buildMhLikeCategoryUrl(e) {
    const t = e || {}, r = String(t.categoryPath || "").replace(/\/+$/, ""), o = normalizeMhLikePath(t.pageSegment, MH_LIKE_ENDPOINT_PATHS.CATEGORY_PAGE_SEGMENT);
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}${o}/${t.page}`);
}

function buildMhLikeSearchUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.searchPath, MH_LIKE_ENDPOINT_PATHS.SEARCH), o = encodeURIComponent(String(null == t.keyword ? "" : t.keyword));
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}/${o}?page=${t.page}`);
}

function buildMhLikeChapterListUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.chapterListPath, MH_LIKE_ENDPOINT_PATHS.CHAPTER_LIST), o = null == t.mode ? "all" : t.mode, a = null == t.timestamp ? Date.now() : t.timestamp;
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}?mid=${t.mangaId}&mode=${o}&t=${a}`);
}

function buildMhLikeChapterEndpointUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.chapterPath, "");
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}?m=${t.mangaId}&c=${t.chapterId}`);
}

function buildMhLikeChapterInfoUrl(e) {
    const t = e || {};
    return buildMhLikeChapterEndpointUrl({
        baseUrl: t.baseUrl,
        chapterPath: null == t.chapterPath ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_INFO : t.chapterPath,
        mangaId: t.mangaId,
        chapterId: t.chapterId
    });
}

function buildMhLikeChapterContentUrl(e) {
    const t = e || {};
    return buildMhLikeChapterEndpointUrl({
        baseUrl: t.baseUrl,
        chapterPath: null == t.chapterPath ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_CONTENT : t.chapterPath,
        mangaId: t.mangaId,
        chapterId: t.chapterId
    });
}

function createMhLikeRouteHelpers(e) {
    const t = e || {};
    return {
        buildCategoryUrl: ({categoryPath: e, page: r}) => buildMhLikeCategoryUrl({
            baseUrl: t.baseUrl,
            categoryPath: e,
            page: r,
            pageSegment: t.categoryPageSegment
        }),
        buildSearchUrl: ({keyword: e, page: r}) => buildMhLikeSearchUrl({
            baseUrl: t.baseUrl,
            keyword: e,
            page: r,
            searchPath: t.searchPath
        }),
        buildChapterListUrl: ({mangaId: e, timestamp: r, mode: o}) => buildMhLikeChapterListUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            timestamp: r,
            mode: o,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterContentUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterContentPath
        })
    };
}

function parseMhLikeComicCards(e) {
    const t = [];
    if (!e) return t;
    for (let r of e.querySelectorAll(".pb-2")) t.push(new Comic({
        id: r.querySelector("a").attributes.href,
        title: r.querySelector("h3").text,
        cover: r.querySelector("img").attributes.src
    }));
    return t;
}

function parseMhLikeHomeSections(e, t) {
    const r = [ {
        title: "近期更新",
        comics: [],
        viewMore: null
    } ], o = e.querySelector(".pb-unit-md");
    if (o) for (let e of o.querySelectorAll(".slicarda")) r[0].comics.push(new Comic({
        id: e.attributes.href,
        title: e.querySelector("h3").text,
        cover: e.querySelector("img").attributes.src
    }));
    const a = e.querySelectorAll(".cardlist"), i = e.querySelectorAll(".hometitle");
    for (let e = 0; e < i.length; e += 1) {
        const o = i[e].querySelector("h2");
        r.push({
            title: o.text,
            comics: t(a[e]),
            viewMore: {
                page: "category",
                attributes: {
                    category: o.text,
                    param: i[e].attributes.href
                }
            }
        });
    }
    return r;
}

function parseMhLikeMaxPage(e) {
    try {
        return parseInt(e.querySelectorAll("button.text-small").pop().text.replaceAll("\n", "").replaceAll(" ", ""), 10);
    } catch (e) {
        return 1;
    }
}

function parseMhLikeDetailTags(e) {
    const t = e.querySelectorAll("div.py-1"), r = {
        作者: [],
        类型: [],
        标签: []
    };
    for (let e of t[0].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), r["作者"].push(t);
    }
    for (let e of t[1].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), r["类型"].push(t);
    }
    for (let e of t[2].querySelectorAll("a")) r["标签"].push(e.text.replace("\n", "").replaceAll(" ", "").replace("#", ""));
    return r;
}

function parseMhLikeRecommendComics(e) {
    const t = [];
    for (let r of e.querySelectorAll("div.cardlist > div.pb-2")) t.push(new Comic({
        id: r.querySelector("a").attributes.href,
        title: r.querySelector("h3").text,
        cover: r.querySelector("img").attributes.src
    }));
    return t;
}

async function loadMhLikePagedComicsFromUrl(e) {
    const t = await getRuntimeDocument(e.requestUrl, e.headers, e.context);
    return {
        comics: e.parseComics(t),
        maxPage: parseMhLikeMaxPage(t)
    };
}

function createMhLikeExploreFeature(e) {
    return {
        title: e.title,
        type: "multiPartPage",
        load: async () => parseMhLikeHomeSections(await getRuntimeDocument(e.getBaseUrl(), e.getHeaders(), e.context || "mh_like home"), e.parseComics)
    };
}

function createMhLikeCategoryLoadFeature(e) {
    return async (t, r, o, a) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            category: t,
            params: r,
            options: o,
            page: a
        }) : buildMhLikeCategoryUrl({
            baseUrl: e.getBaseUrl(),
            categoryPath: r,
            page: a,
            pageSegment: e.categoryPageSegment
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like category"
    });
}

function createMhLikeSearchLoadFeature(e) {
    return async (t, r, o) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            keyword: t,
            options: r,
            page: o
        }) : buildMhLikeSearchUrl({
            baseUrl: e.getBaseUrl(),
            keyword: t,
            page: o,
            searchPath: e.searchPath
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like search"
    });
}

async function loadMhLikeBaseComicInfo(e) {
    const t = await getRuntimeDocument(e.detailUrl, e.headers, e.context || "mh_like comic detail"), r = t.querySelector(".text-xl").text.trim().split("   ")[0], o = t.querySelector(".object-cover").attributes.src, a = t.querySelector("p.text-medium").text;
    return {
        document: t,
        title: r,
        cover: o,
        description: a,
        tags: parseMhLikeDetailTags(t),
        recommend: parseMhLikeRecommendComics(t),
        mangaId: t.querySelector("#mangachapters").attributes["data-mid"]
    };
}

function createMhLikeCategoryRequestUrlBuilder(e) {
    const t = e || {};
    return ({params: e, page: r}) => buildMhLikeCategoryUrl({
        baseUrl: t.getBaseUrl(),
        categoryPath: e,
        page: r,
        pageSegment: t.categoryPageSegment
    });
}

function createMhLikeSearchRequestUrlBuilder(e) {
    const t = e || {};
    return ({keyword: e, page: r}) => buildMhLikeSearchUrl({
        baseUrl: t.getBaseUrl(),
        keyword: e,
        page: r,
        searchPath: t.searchPath
    });
}

function createMhLikeChapterRequestUrlBuilders(e) {
    const t = e || {};
    return {
        buildChapterListRequestUrl: ({mangaId: e, timestamp: r, mode: o}) => buildMhLikeChapterListUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            timestamp: r,
            mode: o,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoRequestUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentRequestUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterContentUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterContentPath
        })
    };
}

function buildMhLikeChapterUrl(e, t) {
    return `${String(e || "").replace(/\/+$/, "")}/${normalizeMhLikeId(t)}`;
}

function createMhLikeExplorePageFeature(e) {
    return createMhLikeExploreFeature(e);
}

function createMhLikeCategoryLoaderFeature(e) {
    return createMhLikeCategoryLoadFeature(e);
}

function createMhLikeSearchLoaderFeature(e) {
    return createMhLikeSearchLoadFeature(e);
}

function loadMhLikeBaseComicInfoFeature(e) {
    return loadMhLikeBaseComicInfo(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature
});

const PICACG_ENDPOINT_PATHS = {
    AUTH_SIGN_IN: "auth/sign-in",
    COMICS: "comics",
    COMICS_RANDOM: "comics/random",
    COMICS_LEADERBOARD: "comics/leaderboard",
    COMICS_ADVANCED_SEARCH: "comics/advanced-search",
    USERS_FAVOURITE: "users/favourite",
    COMMENTS: "comments"
}, PICACG_RANKING_CATEGORY = "VC", PICACG_TAG_NAMESPACES = {
    AUTHOR: "Author",
    CATEGORIES: "Categories"
};

function normalizePicacgBaseUrl(e, t) {
    const r = "string" == typeof t ? String(t).trim() : "", o = "string" == typeof e && e.trim() ? e.trim() : r;
    return String(o || "").replace(/\/+$/, "");
}

function buildPicacgEndpointUrl(e, t) {
    const r = normalizePicacgBaseUrl(e), o = String(t || "").replace(/^\/+/, "");
    return r ? o ? `${r}/${o}` : r : o;
}

function buildPicacgQueryString(e) {
    return joinRawQueryEntries(e);
}

function buildPicacgPathWithQuery(e, t) {
    const r = buildPicacgQueryString(t);
    return r ? `${String(e || "")}?${r}` : String(e || "");
}

function createPicacgRequest(e, t) {
    const r = String(e || "");
    return {
        path: r,
        signaturePath: null == t ? r : String(t || "")
    };
}

function resolvePicacgTagAction(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = o.authorNamespace || PICACG_TAG_NAMESPACES.AUTHOR, i = o.categoryNamespace || PICACG_TAG_NAMESPACES.CATEGORIES;
    return e === a ? {
        action: "category",
        keyword: t,
        param: "a"
    } : e === i ? {
        action: "category",
        keyword: t,
        param: "c"
    } : {
        action: "search",
        keyword: t
    };
}

function createPicacgRouteHelpers(e) {
    const t = (e && "object" == typeof e && !Array.isArray(e) ? e : {}).rankingCategory || "VC";
    return {
        authSignInRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.AUTH_SIGN_IN),
        randomComicsRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.COMICS_RANDOM),
        latestComicsRequest: ({page: e, sort: t}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", e ], [ "s", t ] ])),
        leaderboardRequest: ({option: e, categoryType: r}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_LEADERBOARD, [ [ "tt", e ], [ "ct", null == r ? t : r ] ])),
        categoryComicsRequest: ({page: e, type: t, category: r, sort: o}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", e ], [ t || "c", r ], [ "s", o ] ])),
        advancedSearchRequest: ({page: e}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_ADVANCED_SEARCH, [ [ "page", e ] ])),
        comicFavoriteRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/favourite`),
        userFavoritesRequest: ({page: e, sort: t}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.USERS_FAVOURITE, [ [ "page", e ], [ "s", t ] ])),
        comicInfoRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}`),
        comicEpsRequest: ({comicId: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/eps`, [ [ "page", t ] ])),
        comicRecommendationRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/recommendation`),
        comicEpPagesRequest: ({comicId: e, epId: t, page: r}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/order/${t}/pages`, [ [ "page", r ] ])),
        comicLikeRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/like`),
        commentChildrenRequest: ({replyTo: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/childrens`, [ [ "page", t ] ])),
        comicCommentsRequest: ({comicId: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`, [ [ "page", t ] ])),
        commentReplyRequest: ({replyTo: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}`),
        comicCommentRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`, `/${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`),
        commentLikeRequest: ({commentId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/like`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/like`)
    };
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction
});

const pluginFeatureGenericApi = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver,
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag
}, pluginFeatureCopyLikeApi = {
    COPY_LIKE_LOGIN_EXPIRED: "Login expired",
    copyLikeStatusError,
    loadCopyLikeGroupChapters,
    COPY_LIKE_MULTI_GROUP_MINIMUM_APP_VERSION: "1.3.0",
    isCopyLikeAppVersionAfter,
    updateCopyLikeFavorite,
    loadCopyLikeFavoriteStatus,
    loadCopyLikeChapterData,
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule,
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature
}, pluginFeatureMhLikeApi = {
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature
}, pluginFeaturePicacgApi = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction
}, pluginFeatureContractApi = {
    ...pluginFeatureGenericApi,
    ...pluginFeatureCopyLikeApi,
    ...pluginFeatureMhLikeApi,
    ...pluginFeaturePicacgApi
};

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const o = String(null == e ? "" : e).trim() || t;
    return r ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${o}/${a}/${i}@${n}`;
    const u = s ? `${s}/${l}` : l;
    return `${o}/${a}/${i}@${n}/${l.startsWith(`${s}/`) ? l : u}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    ...pluginFeatureContractApi,
    pluginFeatureGenericApi,
    pluginFeatureCopyLikeApi,
    pluginFeatureMhLikeApi,
    pluginFeaturePicacgApi,
    pluginFeatureContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";

const refreshKomgaReferenceDataFeature = createSelfHostedReferenceCacheFeature({
    metaTimestampKey: "komga_meta_ts",
    ttlMs: 3e5,
    resetData: {
        komga_libraries: [],
        komga_tags: [],
        komga_genres: [],
        komga_languages: [],
        komga_collections: []
    },
    hasToken: e => Boolean(e.authToken),
    loadPayload: async e => {
        const [t, r, o, a, i] = await Promise.all([ e.getJson(KOMGA_ROUTES.librariesPath()), e.getJson(KOMGA_ROUTES.seriesTagsPath()), e.getJson(KOMGA_ROUTES.languagesPath()), e.getJson(KOMGA_ROUTES.collectionsPath(), {
            unpaged: !0,
            sort: [ "name,asc" ]
        }), e.getJson(KOMGA_ROUTES.genresPath()) ]);
        return {
            libraries: t,
            tags: r,
            languages: o,
            collections: a,
            genres: i
        };
    },
    savePayload: (e, t) => {
        const r = Array.isArray(null == t ? void 0 : t.libraries) ? t.libraries.filter(e => e && e.id) : [], o = null != t && t.collections && "object" == typeof t.collections ? t.collections : null, a = Array.isArray(null == o ? void 0 : o.content) ? o.content : Array.isArray(null == t ? void 0 : t.collections) ? t.collections : [];
        e.saveData("komga_libraries", r), e.saveData("komga_tags", Array.isArray(null == t ? void 0 : t.tags) ? t.tags : []),
        e.saveData("komga_genres", Array.isArray(null == t ? void 0 : t.genres) ? t.genres : []),
        e.saveData("komga_languages", Array.isArray(null == t ? void 0 : t.languages) ? t.languages : []),
        e.saveData("komga_collections", a);
    },
    shouldRethrow: e => "Login expired" === String(e)
}), initKomgaFeature = createSafeInitFeature((e, t) => refreshKomgaReferenceDataFeature(e, t)), KOMGA_ROUTES = createKomgaRouteHelpers();
