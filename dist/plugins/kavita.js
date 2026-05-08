class Kavita extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Kavita", this.key = "kavita", this.version = "1.0.0",
        this.minAppVersion = "1.4.0", this.url = resolvePluginUpdateUrl("kavita.js"), this.settings = {
            base_url: {
                title: "服务器地址",
                type: "input",
                default: "https://demo.kavita.org",
                validator: "^(https?:\\/\\/).+$"
            }
        }, this.FilterComparison = {
            Equals: 0,
            GreaterThan: 1,
            GreaterThanEqual: 2,
            LessThan: 3,
            LessThanEqual: 4,
            Contains: 5,
            MustContains: 6,
            Matches: 7,
            NotContains: 8,
            NotEqual: 9,
            BeginsWith: 10,
            EndsWith: 11,
            IsBefore: 12,
            IsAfter: 13,
            IsInLast: 14,
            IsNotInLast: 15,
            IsEmpty: 16
        }, this.FilterField = {
            Summary: 0,
            SeriesName: 1,
            PublicationStatus: 2,
            Languages: 3,
            AgeRating: 4,
            UserRating: 5,
            Tags: 6,
            CollectionTags: 7,
            Translators: 8,
            Publisher: 10,
            Editor: 11,
            CoverArtist: 12,
            Letterer: 13,
            Colorist: 14,
            Inker: 15,
            Penciller: 16,
            Writers: 17,
            Genres: 18,
            Libraries: 19,
            ReadProgress: 20,
            Formats: 21,
            ReleaseYear: 22,
            ReadTime: 23,
            Path: 24,
            FilePath: 25,
            WantToRead: 26,
            ReadingDate: 27,
            AverageRating: 28,
            Imprint: 29,
            Team: 30,
            Location: 31,
            ReadLast: 32,
            FileSize: 33
        }, this.account = {
            login: async (e, t) => {
                if (!e || !t) throw "账号或密码不能为空";
                const a = await Network.post(this.buildUrl(KAVITA_ROUTES.loginPath()), this.headers, {
                    username: e,
                    password: t
                });
                if (401 === a.status) throw "账号或密码错误";
                if (200 !== a.status) throw `登录失败: ${a.status}`;
                if (200 === a.status) {
                    const t = parseSelfHostedJsonBody(a.body) || {};
                    return this.saveData("token", t.token), this.saveData("apiKey", t.apiKey), await this.refreshReferenceData(!0),
                    e;
                }
            },
            logout: () => {
                this.deleteData("token"), this.deleteData("apiKey"), this.deleteData("kavita_libraries"),
                this.deleteData("kavita_genres"), this.deleteData("kavita_authors"), this.deleteData("kavita_meta_ts");
            },
            registerWebsite: null
        }, this.explore = [ {
            title: "Kavita",
            type: "singlePageWithMultiPart",
            load: async () => {
                await this.refreshReferenceData(!1);
                const e = {}, t = await this.fetchSeriesList(KAVITA_ROUTES.seriesV2Path(), {
                    PageNumber: 0,
                    PageSize: 12
                }, {
                    id: 0,
                    name: "",
                    statements: [],
                    combination: 0,
                    sortOptions: {
                        sortField: 4,
                        isAscending: !1
                    },
                    limitTo: 0
                });
                return t.comics.length && (e["最新上架"] = t.comics), e;
            }
        } ], this.category = {
            title: "Kavita",
            parts: [ createStaticCategoryPart("常用", "全部", "全部", "all"), createStoredCategoryPart({
                partName: "书库",
                storageKey: "kavita_libraries",
                getSource: () => this,
                getLabel: e => null == e ? void 0 : e.name,
                getCategory: e => null == e ? void 0 : e.name,
                getParam: e => e && null != e.id ? `library:${e.id}` : null
            }), createStoredCategoryPart({
                partName: "作者",
                storageKey: "kavita_authors",
                getSource: () => this,
                getLabel: e => null == e ? void 0 : e.name,
                getCategory: e => null == e ? void 0 : e.name,
                getParam: e => e && null != e.id ? `author:${e.id}` : null
            }), createStoredCategoryPart({
                partName: "题材",
                storageKey: "kavita_genres",
                getSource: () => this,
                getLabel: e => null == e ? void 0 : e.title,
                getCategory: e => null == e ? void 0 : e.title,
                getParam: e => e && null != e.id ? `genre:${e.id}` : null
            }) ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, a, o) => {
                await this.refreshReferenceData(!1);
                const r = {
                    statements: [],
                    combination: 0,
                    sortOptions: {
                        sortField: 4,
                        isAscending: !1
                    },
                    limitTo: 0
                };
                if (a && a.length) {
                    const [e, t] = a[0].split(",");
                    r.sortOptions.sortField = parseInt(e), r.sortOptions.isAscending = "true" === t;
                }
                const s = t.split(":");
                if ("library" === s[0] && s[1]) {
                    const e = s[1];
                    r.statements.push({
                        comparison: this.FilterComparison.Equals,
                        field: this.FilterField.Libraries,
                        value: e
                    });
                }
                if ("genre" === s[0] && s[1]) {
                    const e = s[1];
                    r.statements.push({
                        comparison: this.FilterComparison.Equals,
                        field: this.FilterField.Genres,
                        value: e
                    });
                }
                if ("author" === s[0] && s[1]) {
                    const e = s[1];
                    r.statements.push({
                        comparison: this.FilterComparison.Equals,
                        field: this.FilterField.Writers,
                        value: e
                    });
                }
                if ([ "all", "library", "genre", "author" ].includes(s[0])) {
                    const {comics: e, totalPages: t} = await this.fetchSeriesList(KAVITA_ROUTES.seriesV2Path(), {
                        PageNumber: o,
                        PageSize: 30
                    }, r);
                    return {
                        comics: e,
                        maxPage: t
                    };
                }
            },
            optionList: [ {
                options: [ "4,false-最近添加", "1,true-名称[升序]", "1,false-名称[降序]", "2,false-创建时间[降序]", "2,true-创建时间[升序]", "3,false-修改时间[降序]", "3,true-修改时间[升序]" ],
                notShowWhen: null,
                showWhen: null
            } ]
        }, this.search = {
            load: async (e, t, a) => {
                const o = {
                    statements: [],
                    combination: 0,
                    sortOptions: {
                        sortField: 4,
                        isAscending: !1
                    },
                    limitTo: 0
                };
                if (t && t.length) {
                    const a = t[0];
                    "FilePath" === a ? o.statements.push({
                        comparison: this.FilterComparison.Matches,
                        field: this.FilterField.FilePath,
                        value: e
                    }) : "SeriesName" === a ? o.statements.push({
                        comparison: this.FilterComparison.Matches,
                        field: this.FilterField.SeriesName,
                        value: e
                    }) : o.statements.push({
                        comparison: this.FilterComparison.Matches,
                        field: this.FilterField.SeriesName,
                        value: e
                    }, {
                        comparison: this.FilterComparison.Matches,
                        field: this.FilterField.Summary,
                        value: e
                    }, {
                        comparison: this.FilterComparison.Matches,
                        field: this.FilterField.FilePath,
                        value: e
                    });
                }
                const {comics: r, totalPages: s} = await this.fetchSeriesList(KAVITA_ROUTES.seriesV2Path(), {
                    PageNumber: a,
                    PageSize: 30
                }, o);
                return {
                    comics: r,
                    maxPage: s
                };
            },
            optionList: [ {
                type: "select",
                options: [ "All-全部", "SeriesName-名称", "FilePath-文件名" ],
                label: "搜索选项"
            } ],
            enableTagsSuggestions: !1,
            onTagSuggestionSelected: (e, t) => `${e}:${t}`
        }, this.comic = {
            loadInfo: async e => {
                const t = await this.getJson(KAVITA_ROUTES.seriesDetailsPath(e)), a = await this.getJson(KAVITA_ROUTES.seriesMetadataPath(), {
                    seriesId: e
                }), o = (await this.getJson(KAVITA_ROUTES.seriesVolumesPath(), {
                    seriesId: e
                })).flatMap(e => e.chapters || []).reduce((e, {id: t, titleName: a, files: o}) => {
                    let r = a;
                    return r || (r = o[0].filePath.split("/").pop()), e[t] = r, e;
                }, {}), r = a.writers.map(e => e.name), s = this.loadData("apiKey"), i = {}, n = this.isReadable(t.format);
                return console.log(t), r.length && (i["作者"] = r), a.genres.length && (i["类型"] = a.genres.map(e => e.title)),
                a.tags.length && (i["标签"] = a.tags.map(e => e.title)), n || (i["提示"] = [ "该系列包含的项目暂不支持阅读" ]),
                new ComicDetails({
                    title: t.name,
                    subtitle: r.join(", "),
                    cover: this.buildUrl(KAVITA_ROUTES.seriesCoverPath(), {
                        seriesId: e,
                        apiKey: s
                    }),
                    description: a.summary || "暂无简介",
                    tags: i,
                    chapters: o,
                    updateTime: t.lastChapterAdded,
                    uploadTime: t.created,
                    url: this.buildUrl(KAVITA_ROUTES.seriesDetailsPath(e))
                });
            },
            starRating: async (e, t) => {},
            loadEp: async (e, t) => {
                const a = await this.getJson(KAVITA_ROUTES.chapterPath(), {
                    chapterId: t
                }), o = a.pages;
                if (!this.isReadable(a.format)) throw "该项目暂不支持阅读";
                const r = this.loadData("apiKey"), s = 4 === a.format;
                return {
                    images: Array.from({
                        length: o
                    }, (e, a) => this.buildUrl(KAVITA_ROUTES.readerImagePath(), {
                        chapterId: t,
                        page: a,
                        apiKey: r,
                        extractPdf: s
                    }))
                };
            },
            onClickTag: (e, t) => {
                if ("类型" === e) {
                    var a;
                    const e = null == (a = this.loadData("kavita_genres").find(e => e.title === t)) ? void 0 : a.id;
                    if (e) return {
                        action: "category",
                        keyword: t,
                        param: `genre:${e}`
                    };
                }
                if ("作者" === e) {
                    var o;
                    const e = null == (o = this.loadData("kavita_authors").find(e => e.name === t)) ? void 0 : o.id;
                    if (e) return {
                        action: "category",
                        keyword: t,
                        param: `author:${e}`
                    };
                }
                UI.showMessage(`不支持的标签类型: ${e}:${t}`);
            },
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return resolveSelfHostedBaseUrl(this.loadSetting("base_url"), this.settings.base_url.default, {
            defaultScheme: "https"
        });
    }
    get headers() {
        return withBearer({
            Accept: "application/json"
        }, this.loadData("token"));
    }
    async init() {
        await initKavitaFeature(this);
    }
    async refreshReferenceData(e) {
        await refreshKavitaReferenceDataFeature(this, e);
    }
    async fetchSeriesList(e, t, a) {
        const {content: o, page: r} = await this.postJson(e, t, a), s = Array.isArray(o) ? o : [], i = this.loadData("apiKey");
        return {
            comics: s.map(e => this.parseSeries(e, i)).filter(Boolean),
            totalPages: r.totalPages
        };
    }
    parseSeries(e, t) {
        if (!e) return null;
        const a = e.id || e.seriesId, o = e.name;
        return new Comic({
            id: `${a}`,
            title: o,
            cover: this.buildUrl(KAVITA_ROUTES.seriesCoverPath(), {
                seriesId: a,
                apiKey: t
            })
        });
    }
    isReadable(e) {
        return [ 0, 1, 4 ].includes(e);
    }
    async getJson(e, t) {
        return await getSelfHostedJson(this, e, t);
    }
    async postJson(e, t, a) {
        const o = await postSelfHostedJson(this, e, t, a);
        return {
            content: o.body,
            page: parseSelfHostedJsonBody(o.headers.pagination)
        };
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, a = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${a}/Library`), r = normalizeSelfHostedRoutePath(t.metadataRoot, `${a}/Metadata`), s = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${a}/metadata`), i = normalizeSelfHostedRoutePath(t.accountRoot, `${a}/Account`), n = normalizeSelfHostedRoutePath(t.seriesRoot, `${a}/Series`), l = normalizeSelfHostedRoutePath(t.imageRoot, `${a}/Image`), u = normalizeSelfHostedRoutePath(t.readerRoot, `${a}/Reader`), d = normalizeSelfHostedRoutePath(t.searchRoot, `${a}/Search`);
    return {
        apiRoot: a,
        libraryRoot: o,
        metadataRoot: r,
        metadataLegacyRoot: s,
        accountRoot: i,
        seriesRoot: n,
        imageRoot: l,
        readerRoot: u,
        searchRoot: d,
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
        searchPath: () => joinSelfHostedRoutePath(d, [ "search" ])
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
        const r = Date.now(), d = Number(e.loadData(o) || 0);
        if (!(!t && d > 0 && r - d < a)) try {
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
                let d;
                d = n && "function" == typeof PageJumpTarget ? new PageJumpTarget({
                    page: "category",
                    attributes: u
                }) : {
                    page: "category",
                    attributes: u
                }, a.push({
                    label: t,
                    target: d
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

"use strict";

const refreshKavitaReferenceDataFeature = createSelfHostedReferenceCacheFeature({
    metaTimestampKey: "kavita_meta_ts",
    ttlMs: 3e5,
    resetData: {
        kavita_libraries: [],
        kavita_genres: [],
        kavita_authors: []
    },
    hasToken: e => Boolean(e.loadData("token")),
    loadPayload: async e => {
        const [t, a, o] = await Promise.all([ e.getJson(KAVITA_ROUTES.librariesPath()), e.getJson(KAVITA_ROUTES.genresPath()), e.getJson(KAVITA_ROUTES.peopleByRolePath(), {
            role: 3
        }) ]);
        return {
            libraries: t,
            genres: a,
            authors: o
        };
    },
    savePayload: (e, t) => {
        const a = Array.isArray(null == t ? void 0 : t.libraries) ? t.libraries.filter(e => e && e.id) : [];
        e.saveData("kavita_libraries", a.map(e => ({
            id: e.id,
            name: e.name
        }))), e.saveData("kavita_genres", Array.isArray(null == t ? void 0 : t.genres) ? t.genres : []),
        e.saveData("kavita_authors", Array.isArray(null == t ? void 0 : t.authors) ? t.authors.map(e => ({
            id: e.id,
            name: e.name
        })) : []);
    },
    shouldRethrow: e => "Login expired" === String(e)
}), initKavitaFeature = createSafeInitFeature((e, t) => refreshKavitaReferenceDataFeature(e, t)), KAVITA_ROUTES = createKavitaRouteHelpers();
