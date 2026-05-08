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
        const [t, a, o, r, s] = await Promise.all([ e.getJson(KOMGA_ROUTES.librariesPath()), e.getJson(KOMGA_ROUTES.seriesTagsPath()), e.getJson(KOMGA_ROUTES.languagesPath()), e.getJson(KOMGA_ROUTES.collectionsPath(), {
            unpaged: !0,
            sort: [ "name,asc" ]
        }), e.getJson(KOMGA_ROUTES.genresPath()) ]);
        return {
            libraries: t,
            tags: a,
            languages: o,
            collections: r,
            genres: s
        };
    },
    savePayload: (e, t) => {
        const a = Array.isArray(null == t ? void 0 : t.libraries) ? t.libraries.filter(e => e && e.id) : [], o = null != t && t.collections && "object" == typeof t.collections ? t.collections : null, r = Array.isArray(null == o ? void 0 : o.content) ? o.content : Array.isArray(null == t ? void 0 : t.collections) ? t.collections : [];
        e.saveData("komga_libraries", a), e.saveData("komga_tags", Array.isArray(null == t ? void 0 : t.tags) ? t.tags : []),
        e.saveData("komga_genres", Array.isArray(null == t ? void 0 : t.genres) ? t.genres : []),
        e.saveData("komga_languages", Array.isArray(null == t ? void 0 : t.languages) ? t.languages : []),
        e.saveData("komga_collections", r);
    },
    shouldRethrow: e => "Login expired" === String(e)
}), initKomgaFeature = createSafeInitFeature((e, t) => refreshKomgaReferenceDataFeature(e, t)), KOMGA_ROUTES = createKomgaRouteHelpers();

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
                const a = Convert.encodeBase64(Convert.encodeUtf8(`${e}:${t}`)), o = "string" == typeof a ? a : Convert.decodeUtf8(a), r = await Network.get(this.buildUrl(KOMGA_ROUTES.currentUserPath()), {
                    ...withBasic({
                        Accept: "application/json"
                    }, o)
                });
                if (401 === r.status) throw "账号或密码错误";
                if (200 !== r.status) throw `登录失败: ${r.status}`;
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
                const a = await this.fetchSeriesList(KOMGA_ROUTES.updatedSeriesPath(), {
                    size: 12,
                    page: 0
                });
                a.comics.length && (e["最近更新"] = a.comics);
                const o = this.loadData("komga_libraries");
                if (Array.isArray(o)) for (const t of o.slice(0, 4)) {
                    const a = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), {
                        page: 0,
                        size: 12,
                        sort: [ "metadata.lastModified,desc" ],
                        library_id: [ t.id ]
                    });
                    a.comics.length && (e[`书库 ${t.name}`] = a.comics);
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
            load: async (e, t, a, o) => {
                await this.refreshReferenceData(!1);
                const r = "all" === e ? "created,desc" : "metadata.lastModified,desc", s = {
                    page: Math.max(0, (o || 1) - 1),
                    size: 30,
                    sort: [ this.extractOption(a, 0, r) ]
                };
                if ("all" === e) {
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), s);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("library" === e && t) {
                    s.library_id = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), s);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("collection" === e && t) {
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.collectionSeriesPath(t), s);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("tag" === e && t) {
                    s.tag = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), s);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                if ("language" === e && t) {
                    s.language = [ t ];
                    const e = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), s);
                    return {
                        comics: e.comics,
                        maxPage: Math.max(1, e.totalPages)
                    };
                }
                s.genre = [ t ];
                const i = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), s);
                return {
                    comics: i.comics,
                    maxPage: Math.max(1, i.totalPages)
                };
            },
            optionList: [ {
                options: [ "*created,desc-添加时间(新→旧)", "created,asc-添加时间(旧→新)", "metadata.lastModified,desc-更新时间(新→旧)", "metadata.lastModified,asc-更新时间(旧→新)", "metadata.titleSort,asc-标题(A-Z)", "metadata.titleSort,desc-标题(Z-A)" ],
                notShowWhen: null,
                showWhen: null
            } ]
        }, this.search = {
            load: async (e, t, a) => {
                const o = {
                    page: Math.max(0, (a || 1) - 1),
                    size: 30,
                    sort: [ this.extractOption(t, 0, "metadata.lastModified,desc") ]
                };
                let r = (e || "").trim();
                const s = r.indexOf(":");
                if (s > 0) {
                    const e = r.slice(0, s).toLowerCase(), t = r.slice(s + 1).trim();
                    t && ("tag" === e ? o.tag = [ t ] : "author" === e ? o.author = [ `${t},` ] : "language" === e ? o.language = [ t ] : "genre" === e ? o.genre = [ t ] : "publisher" === e ? o.publisher = [ t ] : o.search = t),
                    r = "";
                }
                r && (o.search = r);
                const i = await this.fetchSeriesList(KOMGA_ROUTES.seriesPath(), o);
                return {
                    comics: i.comics,
                    maxPage: Math.max(1, i.totalPages)
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
                var t, a, o;
                const r = this.extractBookId(e);
                if (r) return await this.loadBookDetails(r);
                const [s, i] = await Promise.all([ this.getJson(KOMGA_ROUTES.seriesDetailsPath(e)), this.getJson(KOMGA_ROUTES.seriesBooksPath(e), {
                    unpaged: !0,
                    sort: [ "metadata.numberSort,asc" ]
                }) ]), n = Array.isArray(null == i ? void 0 : i.content) ? i.content : [], l = n.filter(e => this.isSupportedBook(e));
                l.sort((e, t) => this.compareBooks(e, t));
                const u = new Map;
                l.forEach((e, t) => {
                    u.set(e.id, this.formatBookTitle(e, t));
                });
                const c = (null == s ? void 0 : s.metadata) || {}, d = (null == s || null == (t = s.booksMetadata) ? void 0 : t.summary) || c.summary || "", h = this.collectAuthors(null == s || null == (a = s.booksMetadata) ? void 0 : a.authors), f = Array.isArray(c.genres) ? c.genres : [], g = Array.isArray(null == s || null == (o = s.booksMetadata) ? void 0 : o.tags) ? s.booksMetadata.tags : [], m = d || "暂无简介", S = {};
                return h.length && (S["作者"] = h), f.length && (S["类型"] = this.uniqueArray(f)), g.length && (S["标签"] = this.uniqueArray(g)),
                !l.length && n.length && (S["提示"] = [ "该系列包含的项目暂不支持阅读" ]), new ComicDetails({
                    title: c.title || (null == s ? void 0 : s.name) || e,
                    subTitle: h.slice(0, 3).join(", "),
                    cover: this.buildUrl(KOMGA_ROUTES.seriesThumbnailPath(e)),
                    description: m,
                    tags: S,
                    chapters: u,
                    updateTime: this.formatDate(null == s ? void 0 : s.lastModified),
                    uploadTime: this.formatDate(null == s ? void 0 : s.created),
                    url: (null == s ? void 0 : s.url) || this.buildUrl(KOMGA_ROUTES.seriesWebPath(e))
                });
            },
            loadEp: async (e, t) => {
                let a = t || e;
                "string" == typeof a && a.startsWith("book:") && (a = a.slice(5)), "string" == typeof e && e.startsWith("book:") && !t && (a = e.slice(5));
                const o = await this.getJson(KOMGA_ROUTES.bookPagesPath(a)), r = Array.isArray(o) ? o : [];
                r.sort((e, t) => {
                    var a, o;
                    return (null != (a = null == e ? void 0 : e.number) ? a : 0) - (null != (o = null == t ? void 0 : t.number) ? o : 0);
                });
                const s = r.some(e => {
                    var t;
                    return 0 === (null != (t = null == e ? void 0 : e.number) ? t : 1);
                });
                return {
                    images: r.filter(e => this.isPageRenderable(e)).map(e => {
                        var t;
                        const o = null != (t = null == e ? void 0 : e.number) ? t : 0;
                        return this.buildUrl(KOMGA_ROUTES.bookPageImagePath(a, o), s ? {
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
                const a = (e || "").toLowerCase();
                return "作者" === a ? {
                    action: "search",
                    keyword: `author:${t}`,
                    param: null
                } : "类型" === a || "标签" === a ? {
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
        const t = this.loadSetting("default_username"), a = this.loadSetting("default_password");
        if (!t || !a) return null;
        const o = Convert.encodeBase64(Convert.encodeUtf8(`${t}:${a}`));
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
        var a;
        const o = await this.getJson(e, t);
        return {
            comics: (Array.isArray(null == o ? void 0 : o.content) ? o.content : []).map(e => this.parseSeries(e)).filter(Boolean),
            totalPages: null != (a = null == o ? void 0 : o.totalPages) ? a : 1
        };
    }
    async fetchBookList(e, t) {
        var a;
        const o = await this.getJson(e, t);
        return {
            comics: (Array.isArray(null == o ? void 0 : o.content) ? o.content : []).map(e => this.parseBook(e)).filter(Boolean),
            totalPages: null != (a = null == o ? void 0 : o.totalPages) ? a : 1
        };
    }
    parseBook(e) {
        if (!e || !this.isSupportedBook(e)) return null;
        const t = e.metadata || {}, a = t.title || e.name || e.id, o = this.collectAuthors(t.authors), r = Array.isArray(t.tags) ? t.tags : [], s = t.summary || "", i = [];
        return e.seriesTitle && i.push(e.seriesTitle), o.length && i.push(o[0]), new Comic({
            id: `book:${e.id}`,
            title: a,
            subTitle: i.join(" · "),
            cover: this.buildUrl(KOMGA_ROUTES.bookThumbnailPath(e.id)),
            tags: this.uniqueArray(r).slice(0, 12),
            description: s
        });
    }
    extractBookId(e) {
        return "string" != typeof e ? null : e.startsWith("book:") ? e.slice(5) : null;
    }
    async loadBookDetails(e) {
        const t = await this.getJson(KOMGA_ROUTES.bookDetailsPath(e));
        if (!t) throw "未找到该图书";
        const a = t.metadata || {}, o = this.collectAuthors(a.authors), r = this.uniqueArray(Array.isArray(a.tags) ? a.tags : []), s = a.summary || "暂无简介", i = {};
        o.length && (i["作者"] = o), r.length && (i["标签"] = r), t.seriesTitle && (i["系列"] = [ t.seriesTitle ]),
        this.isSupportedBook(t) || (i["提示"] = [ "该图书暂不支持阅读" ]);
        const n = new Map, l = a.title || t.name || "立即阅读";
        return n.set(t.id, l), new ComicDetails({
            title: a.title || t.name || e,
            subTitle: t.seriesTitle || o.slice(0, 3).join(", "),
            cover: this.buildUrl(KOMGA_ROUTES.bookThumbnailPath(e)),
            description: s,
            tags: i,
            chapters: n,
            updateTime: this.formatDate(t.lastModified),
            uploadTime: this.formatDate(t.created),
            url: t.url || this.buildUrl(KOMGA_ROUTES.bookWebPath(e))
        });
    }
    parseSeries(e) {
        var t, a, o;
        if (!e) return null;
        const r = e.metadata || {}, s = r.title || e.name || e.id, i = this.collectAuthors(null == e || null == (t = e.booksMetadata) ? void 0 : t.authors), n = [];
        Array.isArray(r.genres) && n.push(...r.genres), Array.isArray(null == e || null == (a = e.booksMetadata) ? void 0 : a.tags) && n.push(...e.booksMetadata.tags);
        const l = (null == e || null == (o = e.booksMetadata) ? void 0 : o.summary) || r.summary || "";
        return new Comic({
            id: e.id,
            title: s,
            subTitle: i.slice(0, 2).join(", "),
            cover: this.buildUrl(KOMGA_ROUTES.seriesThumbnailPath(e.id)),
            tags: this.uniqueArray(n).slice(0, 12),
            description: l
        });
    }
    collectAuthors(e) {
        return Array.isArray(e) ? this.uniqueArray(e.map(e => null == e ? void 0 : e.name).filter(Boolean)) : [];
    }
    uniqueArray(e) {
        if (!Array.isArray(e)) return [];
        const t = new Set, a = [];
        for (const o of e) {
            const e = "string" == typeof o ? o.trim() : "";
            if (!e) continue;
            const r = e.toLowerCase();
            t.has(r) || (t.add(r), a.push(e));
        }
        return a;
    }
    isSupportedBook(e) {
        if (!e || !e.media) return !1;
        const t = String(e.media.status || "").toUpperCase();
        if (t && "READY" !== t) return !1;
        const a = String(e.media.mediaType || "").toLowerCase();
        return !(!a || a.includes("epub") || a.includes("pdf") || a.includes("mobi") || (e.media.pagesCount || 0) <= 0);
    }
    isPageRenderable(e) {
        if (!e) return !1;
        const t = String(e.mediaType || "").toLowerCase();
        return !t || t.startsWith("image/") || t.includes("jpeg") || t.includes("png") || t.includes("webp");
    }
    compareBooks(e, t) {
        var a, o, r, s, i, n;
        const l = "number" == typeof (null == e || null == (a = e.metadata) ? void 0 : a.numberSort) ? e.metadata.numberSort : NaN, u = "number" == typeof (null == t || null == (o = t.metadata) ? void 0 : o.numberSort) ? t.metadata.numberSort : NaN;
        if (!Number.isNaN(l) && !Number.isNaN(u)) return l - u;
        const c = parseFloat(null == e || null == (r = e.metadata) ? void 0 : r.number), d = parseFloat(null == t || null == (s = t.metadata) ? void 0 : s.number);
        return Number.isNaN(c) || Number.isNaN(d) ? ((null == e || null == (i = e.metadata) ? void 0 : i.title) || (null == e ? void 0 : e.name) || "").localeCompare((null == t || null == (n = t.metadata) ? void 0 : n.title) || (null == t ? void 0 : t.name) || "") : c - d;
    }
    formatBookTitle(e, t) {
        const a = (null == e ? void 0 : e.metadata) || {};
        return a.title ? a.title : a.number ? `第${a.number}卷` : null != (null == e ? void 0 : e.number) ? `第${e.number}卷` : `章节 ${t + 1}`;
    }
    extractOption(e, t, a) {
        if (!Array.isArray(e) || e.length <= t) return a;
        let o = e[t];
        if ("string" != typeof o) return a;
        o.startsWith("*") && (o = o.slice(1));
        const r = o.indexOf("-");
        return r > -1 ? o.slice(0, r) : o;
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

function normalizeSelfHostedBaseUrl(e) {
    const t = String(e || "").trim();
    return t ? t.replace(/\/+$/, "") : "";
}

function normalizeSelfHostedRoutePath(e, t) {
    const a = String(null == e ? t || "" : e).trim();
    if (!a) return "";
    const o = a.replace(/\/+$/, "");
    return o.startsWith("/") ? o : `/${o}`;
}

function joinSelfHostedRoutePath(e, t) {
    const a = normalizeSelfHostedRoutePath(e, "/"), o = Array.isArray(t) ? t : [];
    let r = a;
    for (const e of o) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (r = `${r}/${t}`);
    }
    return r;
}

function createKomgaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), o = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), r = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), s = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), i = joinSelfHostedRoutePath(a, [ "series" ]), n = joinSelfHostedRoutePath(a, [ "books" ]), l = joinSelfHostedRoutePath(a, [ "collections" ]);
    return {
        apiV1Root: a,
        apiV2Root: o,
        seriesWebRoot: r,
        booksWebRoot: s,
        librariesPath: () => joinSelfHostedRoutePath(a, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(a, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(a, [ "languages" ]),
        collectionsPath: () => l,
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(o, [ "users", "me" ]),
        seriesPath: () => i,
        latestSeriesPath: () => joinSelfHostedRoutePath(i, [ "latest" ]),
        updatedSeriesPath: () => joinSelfHostedRoutePath(i, [ "updated" ]),
        collectionSeriesPath: e => joinSelfHostedRoutePath(l, [ e, "series" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(i, [ e ]),
        seriesBooksPath: e => joinSelfHostedRoutePath(i, [ e, "books" ]),
        seriesThumbnailPath: e => joinSelfHostedRoutePath(i, [ e, "thumbnail" ]),
        seriesWebPath: e => joinSelfHostedRoutePath(r, [ e ]),
        bookDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        bookThumbnailPath: e => joinSelfHostedRoutePath(n, [ e, "thumbnail" ]),
        bookPagesPath: e => joinSelfHostedRoutePath(n, [ e, "pages" ]),
        bookPageImagePath: (e, t) => joinSelfHostedRoutePath(n, [ e, "pages", t ]),
        bookWebPath: e => joinSelfHostedRoutePath(s, [ e ])
    };
}

function createKavitaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${a}/Library`), r = normalizeSelfHostedRoutePath(t.metadataRoot, `${a}/Metadata`), s = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${a}/metadata`), i = normalizeSelfHostedRoutePath(t.accountRoot, `${a}/Account`), n = normalizeSelfHostedRoutePath(t.seriesRoot, `${a}/Series`), l = normalizeSelfHostedRoutePath(t.imageRoot, `${a}/Image`), u = normalizeSelfHostedRoutePath(t.readerRoot, `${a}/Reader`), c = normalizeSelfHostedRoutePath(t.searchRoot, `${a}/Search`);
    return {
        apiRoot: a,
        libraryRoot: o,
        metadataRoot: r,
        metadataLegacyRoot: s,
        accountRoot: i,
        seriesRoot: n,
        imageRoot: l,
        readerRoot: u,
        searchRoot: c,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(r, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(s, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(i, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(n, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(n, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(n, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(l, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(n, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(u, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(c, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, a) {
    const o = a && "object" == typeof a && !Array.isArray(a) ? a : {}, r = "string" == typeof t ? t : "";
    let s = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : r);
    if (!s) return s;
    const i = "string" == typeof o.defaultScheme ? o.defaultScheme.trim() : "";
    return i && !/^https?:\/\//i.test(s) && (s = `${i.replace(/:$/, "")}://${s}`), normalizeSelfHostedBaseUrl(s);
}

function buildSelfHostedQuery(e) {
    if (!e) return "";
    const t = [];
    for (const a of Object.keys(e)) {
        const o = e[a];
        if (null != o) if (Array.isArray(o)) for (const e of o) null != e && t.push(`${encodeURIComponent(a)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(a)}=${encodeURIComponent(String(o))}`);
    }
    return t.join("&");
}

function buildSelfHostedUrl(e, t, a) {
    let o = t;
    /^https?:\/\//i.test(t) || (o = `${normalizeSelfHostedBaseUrl(e || "")}${String(t).startsWith("/") ? "" : "/"}${t}`);
    const r = buildSelfHostedQuery(a);
    return r ? `${o}?${r}` : o;
}

function withAuthorization(e, t, a) {
    const o = {
        ...e || {}
    };
    return a ? (o.Authorization = `${t} ${a}`, o) : o;
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
    const a = Convert.encodeBase64(Convert.encodeUtf8(t));
    return "string" == typeof a ? a : Convert.decodeUtf8(a);
}

function stripSelfHostedTrailingSlash(e) {
    return String(e || "").replace(/\/+$/, "");
}

function normalizeSelfHostedPathRoot(e, t) {
    const a = String(e || t || "").trim();
    return a ? `/${a.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
}

function normalizeSelfHostedPathSegment(e) {
    return String(null == e ? "" : e).replace(/^\/+|\/+$/g, "");
}

function joinSelfHostedPath(e, t) {
    const a = normalizeSelfHostedPathRoot(e, "/"), o = Array.isArray(t) ? t : [];
    let r = a;
    for (const e of o) {
        const t = normalizeSelfHostedPathSegment(e);
        t && (r = `${r}/${t}`);
    }
    return r;
}

function createSelfHostedRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = normalizeSelfHostedPathRoot(t.apiRoot, "/api"), o = normalizeSelfHostedPathRoot(t.archivesRoot, `${a}/archives`), r = normalizeSelfHostedPathRoot(t.categoriesRoot, `${a}/categories`), s = normalizeSelfHostedPathRoot(t.searchPath, `${a}/search`);
    return {
        apiRoot: a,
        archivesRoot: o,
        categoriesRoot: r,
        searchPath: s,
        categoriesPath: () => r,
        categoryArchivePath: (e, t) => joinSelfHostedPath(r, [ e, t ]),
        archivePath: e => joinSelfHostedPath(o, [ e ]),
        archiveMetadataPath: e => joinSelfHostedPath(o, [ e, "metadata" ]),
        archiveThumbnailPath: e => joinSelfHostedPath(o, [ e, "thumbnail" ]),
        archiveCategoriesPath: e => joinSelfHostedPath(o, [ e, "categories" ]),
        archiveFilesPath: e => joinSelfHostedPath(o, [ e, "files" ])
    };
}

function buildSelfHostedUrlFromSource(e, t, a) {
    if (!e || "object" != typeof e) throw new Error("buildSelfHostedUrlFromSource requires plugin source");
    return buildSelfHostedUrl(e.baseUrl, t, a);
}

function buildSelfHostedQueryFromSource(e) {
    return buildSelfHostedQuery(e);
}

function ensureSelfHostedHttpOk(e, t) {
    const a = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = a.unauthorizedMessage || "Login expired", r = a.requestFailedMessage || "请求失败";
    if (!e) throw r;
    if (401 === e.status || 403 === e.status) throw o;
    if (e.status < 200 || e.status >= 300) throw `${r}: ${e.status}`;
}

function parseSelfHostedJsonBody(e) {
    return e ? JSON.parse(e) : null;
}

async function getSelfHostedJson(e, t, a, o) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const r = o && "object" == typeof o && !Array.isArray(o) ? o : {}, s = r.headers || e.headers, i = await Network.get(e.buildUrl(t, a), s);
    return ensureSelfHostedHttpOk(i, r), parseSelfHostedJsonBody(i.body);
}

async function postSelfHostedJson(e, t, a, o, r) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const s = r && "object" == typeof r && !Array.isArray(r) ? r : {}, i = s.headers || e.headers, n = await Network.post(e.buildUrl(t, a), i, o);
    return ensureSelfHostedHttpOk(n, s), {
        body: parseSelfHostedJsonBody(n.body),
        headers: n.headers || {}
    };
}

function createSelfHostedReferenceCacheFeature(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = Number(t.ttlMs || 3e5), o = String(t.metaTimestampKey || ""), r = t.resetData && "object" == typeof t.resetData ? t.resetData : {}, s = "function" == typeof t.hasToken ? t.hasToken : () => !1, i = "function" == typeof t.loadPayload ? t.loadPayload : null, n = "function" == typeof t.savePayload ? t.savePayload : null, l = "function" == typeof t.shouldRethrow ? t.shouldRethrow : null;
    if (!o || !i || !n) throw new Error("Invalid createSelfHostedReferenceCacheFeature options");
    const u = e => {
        for (const [t, a] of Object.entries(r)) Array.isArray(a) ? e.saveData(t, a.slice()) : a && "object" == typeof a ? e.saveData(t, {
            ...a
        }) : e.saveData(t, a);
    };
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("refreshSelfHostedReferenceData requires plugin source");
        if (!s(e)) return void u(e);
        const r = Date.now(), c = Number(e.loadData(o) || 0);
        if (!(!t && c > 0 && r - c < a)) try {
            const t = await i(e);
            await n(e, t, r), e.saveData(o, r);
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

function createStaticCategoryPart(e, t, a, o) {
    return {
        name: e,
        type: "dynamic",
        loader: function() {
            return [ {
                label: t,
                target: {
                    page: "category",
                    attributes: {
                        category: a,
                        param: null == o ? null : o
                    }
                }
            } ];
        }
    };
}

function createStoredCategoryPart(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = String(t.partName || ""), o = String(t.storageKey || ""), r = "function" == typeof t.getLabel ? t.getLabel : null, s = "function" == typeof t.getCategory ? t.getCategory : null, i = "function" == typeof t.getParam ? t.getParam : null, n = !0 === t.usePageJumpTarget, l = "function" == typeof t.getSource ? t.getSource : null;
    if (!(a && o && r && s && i)) throw new Error("Invalid createStoredCategoryPart options");
    return {
        name: a,
        type: "dynamic",
        loader: function() {
            const e = l ? l() : this, t = e && "function" == typeof e.loadData ? e.loadData(o) : null;
            if (!Array.isArray(t) || !t.length) return [];
            const a = [];
            for (const e of t) {
                const t = r(e), o = s(e), l = i(e);
                if (!t || !o) continue;
                const u = {
                    category: o,
                    param: null == l ? null : l
                };
                let c;
                c = n && "function" == typeof PageJumpTarget ? new PageJumpTarget({
                    page: "category",
                    attributes: u
                }) : {
                    page: "category",
                    attributes: u
                }, a.push({
                    label: t,
                    target: c
                });
            }
            return a;
        }
    };
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const o = String(null == e ? "" : e).trim() || t;
    return a ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), i = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${o}/${r}/${s}@${i}`;
    const u = n ? `${n}/${l}` : l;
    return `${o}/${r}/${s}@${i}/${l.startsWith(`${n}/`) ? l : u}`;
}

"undefined" != typeof module && module.exports && (module.exports = {
    normalizeSelfHostedBaseUrl,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    getSelfHostedJson,
    postSelfHostedJson
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createStaticCategoryPart,
    createStoredCategoryPart
});
