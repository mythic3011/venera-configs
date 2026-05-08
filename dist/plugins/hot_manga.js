class HotManga extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "热辣漫画", this.key = "hot_manga", this.version = "1.0.0",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("hot_manga.js"),
        this.account = {
            login: async (e, t) => {
                let i = randomInt(1e3, 9999), r = Convert.encodeBase64(Convert.encodeUtf8(`${t}-${i}`)), o = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.LOGIN), withCopyLikeFormHeaders({}), `username=${e}&password=${r}&salt=${i}&source=Official&version=2.2.0&platform=3`);
                if (200 === o.status) {
                    let e = JSON.parse(o.body).results.token;
                    return this.saveData("token", e), "ok";
                }
                throw `Invalid Status Code ${o.status}`;
            },
            logout: () => {
                this.deleteData("token");
            },
            registerWebsite: "https://www.manga2026.com/web/login/loginByAccount"
        }, this.explore = [ createCopyLikeExploreSectionsFeature({
            title: "热辣漫画",
            sections: HotManga.homeSections,
            parseComic: this.baseComicParser,
            context: "hot_manga home",
            getApiUrl: () => this.apiUrl,
            getHeaders: () => this.headers
        }) ], this.category = {
            title: "热辣漫画",
            parts: [ {
                name: "免费漫画排行",
                type: "fixed",
                categories: [ "排行" ],
                categoryParams: [ "ranking" ],
                itemType: "category"
            }, {
                name: "免费漫画主题",
                type: "fixed",
                categories: Object.keys(HotManga.category_param_dict),
                categoryParams: Object.values(HotManga.category_param_dict),
                itemType: "category"
            }, {
                name: "主页",
                type: "fixed",
                categories: Object.keys(HotManga.homepage_param_dict),
                categoryParams: Object.values(HotManga.homepage_param_dict),
                itemType: "category"
            } ]
        }, this.categoryComics = {
            load: createCopyLikeCategoryLoaderFeature({
                context: "hot_manga category",
                parseComic: this.rankedComicParser,
                getHeaders: () => this.headers,
                buildRequestUrl: createCopyLikeCategoryRequestUrlBuilder({
                    getApiUrl: () => this.apiUrl,
                    isRankingCategory: (e, t) => "排行" === e || "ranking" === t,
                    rankingFreeType: 1,
                    rankingRegionOptionIndex: 0,
                    rankingDateOptionIndex: 1,
                    isHomepageCategory: e => Object.prototype.hasOwnProperty.call(HotManga.homepage_param_dict, e),
                    homepageOrderingOptionIndex: 0,
                    categoryParamMap: HotManga.category_param_dict,
                    themedFreeType: 1,
                    themedOrderingOptionIndex: 0
                })
            }),
            optionList: [ {
                options: [ "-非韩漫", "1-韩漫" ],
                notShowWhen: null,
                showWhen: [ "排行" ]
            }, {
                options: [ "day-上升最快", "week-最近7天", "month-最近30天", "total-總榜單" ],
                notShowWhen: null,
                showWhen: [ "排行" ]
            }, {
                options: [ "*datetime_updated-时间倒序", "datetime_updated-时间正序", "*popular-热度倒序", "popular-热度正序" ],
                notShowWhen: null,
                showWhen: Object.keys(HotManga.category_param_dict)
            }, {
                options: [ "*datetime_updated-时间倒序", "datetime_updated-时间正序", "*popular-热度倒序", "popular-热度正序" ],
                notShowWhen: null,
                showWhen: Object.keys(HotManga.homepage_param_dict)
            } ]
        }, this.search = {
            load: createCopyLikeSearchLoaderFeature({
                context: "hot_manga search",
                parseComic: this.datedComicParser,
                getHeaders: () => this.headers,
                resolveAuthorPathWord: e => this.author_path_word_dict[e] || null,
                buildAuthorRequestUrl: e => this.searchRequestUrlBuilders.buildAuthorRequestUrl(e),
                buildKeywordRequestUrl: e => this.searchRequestUrlBuilders.buildKeywordRequestUrl(e)
            })
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, i) => {
                let r = i ? 1 : 0, o = this.loadData("token"), a = await Network.get(buildCopyLikeComicDetailUrl({
                    apiUrl: this.apiUrl,
                    id: e,
                    inMainland: !0,
                    platform: 3
                }), this.headers);
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                let n = JSON.parse(a.body).results.comic.uuid, l = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMIC_ACTION), withCopyLikeFormHeaders(this.headers), `comic_id=${n}&is_collect=${r}&authorization=Token+${o}`);
                if (401 === l.status) throw "Login expired";
                if (200 !== l.status) throw `Invalid status code: ${l.status}`;
                return "ok";
            },
            loadComics: async (e, t) => {
                let i = this.loadSetting("favorites_ordering") || "-datetime_updated";
                var r = await Network.get(buildCopyLikeFavoriteComicsUrl({
                    apiUrl: this.apiUrl,
                    page: e,
                    limit: 30,
                    freeType: 1,
                    ordering: i
                }), this.headers);
                if (401 === r.status) throw "Login expired";
                if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                let o = JSON.parse(r.body);
                return {
                    comics: o.results.list.map(function(e) {
                        null !== e.comic && void 0 !== e.comic && (e = e.comic);
                        let t = [];
                        null !== e.theme && void 0 !== e.theme && (t = e.theme.map(e => e.name));
                        let i = null;
                        return Array.isArray(e.author) && e.author.length > 0 && (i = e.author[0].name),
                        {
                            id: e.path_word,
                            title: e.name,
                            subTitle: i,
                            cover: e.cover,
                            tags: t,
                            description: e.datetime_updated
                        };
                    }),
                    maxPage: (o.results.total - o.results.total % 21) / 21 + 1
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                let t = await Promise.all([ Network.get(buildCopyLikeComicDetailUrl({
                    apiUrl: this.apiUrl,
                    id: e,
                    inMainland: !0,
                    platform: 3
                }), this.headers), (async e => {
                    let t = await Network.get(buildCopyLikeComicQueryUrl({
                        apiUrl: this.apiUrl,
                        id: e
                    }), this.headers);
                    if (200 !== t.status) throw `Invalid status code: ${t.status}`;
                    return null != JSON.parse(t.body).results.collect;
                }).bind(this)(e) ]);
                if (200 !== t[0].status) throw `Invalid status code: ${res.status}`;
                let i = JSON.parse(t[0].body).results, r = i.comic, o = r.name, a = r.cover;
                Object.keys(this.author_path_word_dict).length > 100 && (this.author_path_word_dict = {}),
                r.author.forEach(e => this.author_path_word_dict[e.name] = e.path_word);
                let n = r.brief, l = await (async (e, t) => {
                    let i = async (e, t) => {
                        let i = await Network.get(buildCopyLikeGroupChaptersUrl({
                            apiUrl: this.apiUrl,
                            id: e,
                            groupPath: t,
                            limit: 100,
                            offset: 0
                        }), this.headers);
                        if (200 !== i.status) throw `Invalid status code: ${i.status}`;
                        let r = JSON.parse(i.body), o = new Map;
                        r.results.list.forEach(e => {
                            let t = e.name, i = e.uuid;
                            o.set(i, t);
                        });
                        let a = r.results.total;
                        if (a > 100) {
                            let n = 100;
                            for (;n < a; ) {
                                if (i = await Network.get(buildCopyLikeGroupChaptersUrl({
                                    apiUrl: this.apiUrl,
                                    id: e,
                                    groupPath: t,
                                    limit: 100,
                                    offset: n
                                }), this.headers), 200 !== i.status) throw `Invalid status code: ${i.status}`;
                                r = JSON.parse(i.body), r.results.list.forEach(e => {
                                    let t = e.name, i = e.uuid;
                                    o.set(i, t);
                                }), n += 100;
                            }
                        }
                        return o;
                    }, r = Object.keys(t), o = {}, a = [];
                    for (let n of r) {
                        let r = t[n].path_word;
                        a.push((async () => {
                            o[n] = await i(e, r);
                        })());
                    }
                    if (await Promise.all(a), this.isAppVersionAfter("1.3.0")) {
                        let e = new Map;
                        for (let i of r) {
                            let r = t[i].name;
                            e.set(r, o[i]);
                        }
                        return e;
                    }
                    {
                        let e = new Map;
                        for (let t of r) for (let [i, r] of o[t]) e.set(i, r);
                        return e;
                    }
                })(e, i.groups);
                return {
                    title: o,
                    cover: a,
                    description: n,
                    tags: createCopyLikeDetailTagMapper({})(r),
                    chapters: l,
                    isFavorite: t[1],
                    subId: r.uuid
                };
            },
            loadEp: async (e, t) => {
                let i, r, o = 0;
                for (;o < 5; ) try {
                    if (i = await Network.get(buildCopyLikeChapterUrl({
                        apiUrl: this.apiUrl,
                        comicId: e,
                        chapterId: t,
                        chapterEndpoint: "chapter",
                        platform: 3,
                        update: !0
                    }), {
                        ...this.headers
                    }), 210 === i.status) {
                        let e = 4e4;
                        try {
                            let t = JSON.parse(i.body);
                            if (t.message && t.message.includes("Expected available in")) {
                                let i = t.message.match(/(\d+)\s*seconds/);
                                i && i[1] && (e = 1e3 * parseInt(i[1]));
                            }
                        } catch (e) {
                            console.log("Unable to parse wait time, using default wait time 40s");
                        }
                        throw console.log(`Chapter${t} access too frequent, waiting ${e / 1e3}s`), await new Promise(t => setTimeout(t, e)),
                        "Retry";
                    }
                    if (200 !== i.status) throw `Invalid status code: ${i.status}`;
                    return r = JSON.parse(i.body), {
                        images: r.results.chapter.contents.map(e => e.url).map(e => e.replace(/\.jpg\.h\d+x\.jpg$/, `.jpg.h${this.imageQuality}x.jpg`))
                    };
                } catch (e) {
                    if ("Retry" !== e) throw e;
                    if (o++, o >= 5) throw e;
                }
            },
            onClickTag: (e, t) => createCopyLikeTagClickActionHandler({})(e, t)
        }, this.settings = {
            favorites_ordering: {
                title: "收藏排序方式",
                type: "select",
                options: [ {
                    value: "-datetime_updated",
                    text: "更新时间"
                }, {
                    value: "-datetime_modifier",
                    text: "收藏时间"
                }, {
                    value: "-datetime_browse",
                    text: "阅读时间"
                } ],
                default: "-datetime_updated"
            },
            image_quality: {
                title: "图片质量",
                type: "select",
                options: [ {
                    value: "800",
                    text: "低 (800)"
                }, {
                    value: "1200",
                    text: "中 (1200)"
                }, {
                    value: "1500",
                    text: "高 (1500)"
                } ],
                default: HotManga.defaultImageQuality
            },
            base_url: {
                title: "API地址",
                type: "input",
                validator: "^(?!:\\/\\/)(?=.{1,253})([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$",
                default: HotManga.defaultApiUrl
            }
        };
    }
    get headers() {
        return {
            Authorization: buildCopyLikeBearerTokenHeader(this.loadData("token")),
            Accept: "application/json",
            webp: "1",
            platform: "3",
            version: "2024.04.28",
            "X-Requested-With": "com.manga2020.app"
        };
    }
    get apiUrl() {
        return buildCopyLikeApiUrl(this.loadSetting("base_url"), HotManga.defaultApiUrl);
    }
    get imageQuality() {
        return this.loadSetting("image_quality") || HotManga.defaultImageQuality;
    }
    init() {
        this.author_path_word_dict = {};
    }
    get baseComicParser() {
        return createCopyLikeComicParser({});
    }
    get datedComicParser() {
        return createCopyLikeComicParser({
            includeUpdateDescription: !0
        });
    }
    get rankedComicParser() {
        return createCopyLikeComicParser({
            includeUpdateDescription: !0,
            includeRankingDescription: !0
        });
    }
    get searchRequestUrlBuilders() {
        return createCopyLikeSearchRequestUrlBuilders({
            getApiUrl: () => this.apiUrl,
            authorLimit: 30,
            authorOrdering: "-datetime_updated",
            keywordLimit: 20,
            keywordPlatform: 3,
            keywordFreeType: 1,
            keywordUpdate: !0
        });
    }
    isAppVersionAfter(e) {
        let t = APP.version, i = e.split("."), r = t.split(".");
        for (let e = 0; e < 3; e++) if (parseInt(r[e]) < parseInt(i[e])) return !1;
        return !0;
    }
}

function createRuntimeInvalidStatusError(e, t) {
    return `Invalid status code: ${e}${t ? ` (${t})` : ""}`;
}

function assertRuntimeStatus(e, t, i) {
    const r = Array.isArray(t) ? t : [ null == t ? 200 : t ], o = e && "number" == typeof e.status ? e.status : -1;
    if (!r.includes(o)) throw createRuntimeInvalidStatusError(o, i);
    return e;
}

async function runtimeGet(e, t) {
    return Network.get(e, t);
}

function parseRuntimeJsonBody(e, t) {
    try {
        return JSON.parse(e.body);
    } catch (e) {
        throw "Invalid JSON response" + (t ? ` (${t})` : "");
    }
}

async function getRuntimeJson(e, t, i) {
    const r = await runtimeGet(e, t);
    return assertRuntimeStatus(r, 200, i || e), parseRuntimeJsonBody(r, i || e);
}

async function getRuntimeDocument(e, t, i) {
    const r = await runtimeGet(e, t);
    return assertRuntimeStatus(r, 200, i || e), new HtmlDocument(r.body);
}

function buildOffsetByPage(e, t) {
    return ((Number.isFinite(Number(e)) ? Math.max(1, Number(e)) : 1) - 1) * (Number.isFinite(Number(t)) ? Math.max(1, Number(t)) : 1);
}

function normalizeStarOption(e) {
    return String(null == e ? "" : e).replace("*", "-");
}

function normalizeStarOptions(e) {
    return Array.isArray(e) ? e.map(e => normalizeStarOption(e)) : [];
}

function unwrapCopyLikeComic(e) {
    return e && null != e.comic ? e.comic : e || {};
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

function formatCopyLikeRankingDescription(e, t, i) {
    const r = e && null != e.sort ? e.sort : null;
    if (null == r) return null;
    const o = e.rise_sort || 0;
    return `${r} ${o > 0 ? "▲" : o < 0 ? "▽" : "-"}\n${i > 1 ? `${t} 等${i}位` : t}\n🔥${(Number(e.popular || 0) / 1e4).toFixed(1)}W`;
}

function createCopyLikeComicParser(e) {
    const t = e || {};
    return e => {
        const i = unwrapCopyLikeComic(e), r = parseCopyLikePrimaryAuthor(i), o = parseCopyLikeAuthorCount(i), a = {
            id: i.path_word,
            title: i.name,
            subTitle: r,
            cover: i.cover,
            tags: parseCopyLikeThemeTags(i)
        };
        if (t.includeRankingDescription) {
            const t = formatCopyLikeRankingDescription(e, r, o);
            if (null != t) return a.description = t, a;
        }
        if (t.includeUpdateDescription && (a.description = i.datetime_updated), "function" == typeof t.describe) {
            const n = t.describe({
                sourceComic: e,
                comic: i,
                author: r,
                authorCount: o
            });
            null != n && (a.description = n);
        }
        return a;
    };
}

function readCopyLikePath(e, t, i) {
    if (!Array.isArray(t) || 0 === t.length) return e;
    let r = e;
    for (const e of t) {
        if (null == r || "object" != typeof r || !(e in r)) return i;
        r = r[e];
    }
    return r;
}

function computeCopyLikeMaxPage(e, t) {
    const i = Number.isFinite(Number(t)) && Number(t) > 0 ? Number(t) : 21, r = Number.isFinite(Number(e)) ? Number(e) : 0;
    return Math.floor((r - r % i) / i) + 1;
}

function buildCopyLikeHomeSections(e, t, i) {
    const r = {};
    for (const o of t || []) {
        const t = readCopyLikePath(e, o.path, []);
        r[o.title] = Array.isArray(t) ? t.map(i) : [];
    }
    return r;
}

async function loadCopyLikeHomeSectionsModule(e) {
    return buildCopyLikeHomeSections(await getRuntimeJson(`${e.apiUrl}${e.endpoint || "/api/v3/h5/homeIndex"}`, e.headers, e.context || "copy_like home"), e.sections || [], e.parseComic);
}

async function loadCopyLikeListModule(e) {
    const t = await getRuntimeJson(e.requestUrl, e.headers, e.context || "copy_like list"), i = readCopyLikePath(t, e.listPath || [ "results", "list" ], []), r = readCopyLikePath(t, e.totalPath || [ "results", "total" ], 0);
    return {
        comics: Array.isArray(i) ? i.map(e.parseComic) : [],
        maxPage: computeCopyLikeMaxPage(r, e.maxPageDivisor || 21)
    };
}

function parseCopyLikeAuthorKeyword(e) {
    const t = String(e || "");
    return t.startsWith("作者:") ? t.substring(3).trim() : null;
}

async function loadCopyLikeSearchModule(e) {
    const t = parseCopyLikeAuthorKeyword(e.keyword), i = t ? e.resolveAuthorPathWord(t) : null;
    return loadCopyLikeListModule({
        requestUrl: i ? e.buildAuthorRequestUrl({
            pathWord: encodeURIComponent(i),
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
    return async (t, i, r, o) => loadCopyLikeListModule({
        requestUrl: e.buildRequestUrl({
            category: t,
            param: i,
            options: r,
            page: o
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
    return async (t, i, r) => loadCopyLikeSearchModule({
        keyword: t,
        options: i,
        page: r,
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
    return ({category: t, param: i, options: r, page: o}) => {
        const a = Array.isArray(r) ? r : [], n = !1 === e.normalizeOptions ? a : normalizeStarOptions(a), l = e.getApiUrl();
        if ("function" == typeof e.isRankingCategory && e.isRankingCategory(t, i)) return buildCopyLikeRankingUrl({
            apiUrl: l,
            page: o,
            limit: null == e.rankingLimit ? 30 : e.rankingLimit,
            freeType: e.rankingFreeType,
            audienceType: null == e.rankingAudienceOptionIndex ? void 0 : a[e.rankingAudienceOptionIndex],
            region: null == e.rankingRegionOptionIndex ? void 0 : a[e.rankingRegionOptionIndex],
            dateType: null == e.rankingDateOptionIndex ? void 0 : a[e.rankingDateOptionIndex]
        });
        if ("function" == typeof e.isHomepageCategory && e.isHomepageCategory(t, i)) return buildCopyLikeHomeIndexComicsUrl({
            apiUrl: l,
            page: o,
            limit: null == e.homepageLimit ? 20 : e.homepageLimit,
            top: i,
            ordering: null == e.homepageOrderingOptionIndex ? void 0 : a[e.homepageOrderingOptionIndex]
        });
        const u = normalizeCopyLikeCategoryParam(t, e.categoryParamMap, i);
        return buildCopyLikeComicsUrl({
            apiUrl: l,
            page: o,
            limit: null == e.themedLimit ? 30 : e.themedLimit,
            freeType: e.themedFreeType,
            ordering: null == e.themedOrderingOptionIndex ? void 0 : n[e.themedOrderingOptionIndex],
            theme: u || "",
            top: null == e.themedTopOptionIndex ? void 0 : n[e.themedTopOptionIndex]
        });
    };
}

function createCopyLikeSearchRequestUrlBuilders(e) {
    return {
        buildAuthorRequestUrl: ({pathWord: t, page: i}) => buildCopyLikeComicsUrl({
            apiUrl: e.getApiUrl(),
            page: i,
            limit: null == e.authorLimit ? 30 : e.authorLimit,
            ordering: e.authorOrdering || "-datetime_updated",
            author: t
        }),
        buildKeywordRequestUrl: ({keyword: t, options: i, page: r}) => {
            const o = Array.isArray(i) ? i : [], a = null == e.queryTypeOptionIndex ? e.queryTypeDefault : null != o[e.queryTypeOptionIndex] ? o[e.queryTypeOptionIndex] : e.queryTypeDefault;
            return buildCopyLikeSearchUrl({
                apiUrl: e.getApiUrl(),
                endpointPath: "function" == typeof e.getKeywordEndpointPath ? e.getKeywordEndpointPath() : e.keywordEndpointPath,
                page: r,
                limit: null == e.keywordLimit ? 20 : e.keywordLimit,
                keyword: t,
                queryType: a,
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
    return (e, i) => resolveCopyLikeTagAction(e, i, t);
}

function normalizeCopyLikeBaseUrl(e, t) {
    const i = String(t || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    let r = String(e || "").trim();
    if (!r) return i;
    r = r.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const o = r.indexOf("/");
    return o >= 0 && (r = r.slice(0, o)), r || i;
}

function buildCopyLikeApiUrl(e, t) {
    return `https://${normalizeCopyLikeBaseUrl(e, t)}`;
}

function buildCopyLikePageUrl(e, t) {
    const i = Number(t) > 1 ? `?page=${t}` : "";
    return `${normalizeCopyLikeBaseUrl(e)}${i}`;
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

HotManga.defaultImageQuality = "1500", HotManga.defaultApiUrl = "api.2024manga.com",
HotManga.homeSections = [ {
    title: "推荐漫画",
    path: [ "results", "recComics", "list" ]
}, {
    title: "每周免费漫画排行",
    path: [ "results", "rankWeeklyFreeComics", "list" ]
}, {
    title: "每周付费漫画排行",
    path: [ "results", "rankWeeklyChargeComics", "list" ]
}, {
    title: "付费漫画更新",
    path: [ "results", "updateWeeklyChargeComics", "list" ]
}, {
    title: "免费漫画更新",
    path: [ "results", "updateWeeklyFreeComics", "list" ]
} ], HotManga.category_param_dict = {
    全部: "",
    愛情: "aiqing",
    歡樂向: "huanlexiang",
    冒險: "maoxian",
    奇幻: "qihuan",
    百合: "baihe",
    校园: "xiaoyuan",
    科幻: "kehuan",
    東方: "dongfang",
    耽美: "danmei",
    生活: "shenghuo",
    格鬥: "gedou",
    轻小说: "qingxiaoshuo",
    其他: "qita",
    悬疑: "xuanyi",
    TL: "teenslove",
    萌系: "mengxi",
    神鬼: "shengui",
    职场: "zhichang",
    治愈: "zhiyu",
    节操: "jiecao",
    四格: "sige",
    長條: "changtiao",
    舰娘: "jianniang",
    搞笑: "gaoxiao",
    竞技: "jingji",
    伪娘: "weiniang",
    魔幻: "mohuan",
    热血: "rexue",
    性转换: "xingzhuanhuan",
    美食: "meishi",
    励志: "lizhi",
    彩色: "COLOR",
    後宮: "hougong",
    侦探: "zhentan",
    惊悚: "jingsong",
    AA: "aa",
    音乐舞蹈: "yinyuewudao",
    异世界: "yishijie",
    战争: "zhanzheng",
    历史: "lishi",
    机战: "jizhan",
    都市: "dushi",
    穿越: "chuanyue",
    恐怖: "kongbu",
    生存: "shengcun",
    武侠: "wuxia",
    宅系: "zhaixi",
    转生: "zhuansheng",
    無修正: "Uncensored",
    仙侠: "xianxia",
    LoveLive: "loveLive",
    C95: "comiket95",
    C96: "comiket96",
    C97: "comiket97",
    C98: "C98",
    C99: "comiket99",
    C100: "comiket100",
    C101: "comiket101",
    C102: "comiket102",
    C103: "comiket103",
    C104: "comiket104",
    C105: "comiket105",
    玄幻: "xuanhuan",
    異能: "yineng",
    遊戲: "youxi",
    真人: "zhenren",
    雜誌附贈寫真集: "zazhifuzengxiezhenji",
    FATE: "fate"
}, HotManga.homepage_param_dict = {
    全彩: "color",
    韩漫: "korea",
    单行本: "volume",
    已完结: "finish",
    同志: "yaoi"
}, "undefined" != typeof module && module && module.exports && (module.exports = {
    createRuntimeInvalidStatusError,
    assertRuntimeStatus
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    parseRuntimeJsonBody,
    getRuntimeJson,
    getRuntimeDocument
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    unwrapCopyLikeComic,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    createCopyLikeComicParser,
    readCopyLikePath,
    computeCopyLikeMaxPage
}), "undefined" != typeof module && module && module.exports && (module.exports = {
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
    createCopyLikeTagClickActionHandler
});

const COPY_LIKE_ENDPOINT_PATHS = {
    LOGIN: "/api/v3/login",
    RANKS: "/api/v3/ranks",
    COMICS: "/api/v3/comics",
    SEARCH_COMIC: "/api/v3/search/comic",
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
    const i = String(e || "").replace(/\/+$/, ""), r = String(t || "");
    return r ? r.startsWith("http://") || r.startsWith("https://") ? r : r.startsWith("/") ? `${i}${r}` : `${i}/${r}` : i;
}

function buildCopyLikeQueryString(e) {
    const t = [];
    for (const i of e || []) {
        if (!Array.isArray(i) || i.length < 2) continue;
        const e = i[0], r = i[1];
        null != e && null != r && t.push(`${String(e)}=${String(r)}`);
    }
    return t.join("&");
}

function buildCopyLikeUrlWithQuery(e, t, i) {
    const r = buildCopyLikeEndpointUrl(e, t), o = buildCopyLikeQueryString(i);
    return o ? `${r}?${o}` : r;
}

function buildCopyLikeRankingUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, COPY_LIKE_ENDPOINT_PATHS.RANKS, [ [ "free_type", t.freeType ], [ "limit", null == t.limit ? 30 : t.limit ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, null == t.limit ? 30 : t.limit) : t.offset ], [ "_update", null == t.update || t.update ], [ "type", null == t.type ? 1 : t.type ], [ "audience_type", t.audienceType ], [ "region", t.region ], [ "date_type", t.dateType ] ]);
}

function buildCopyLikeComicsUrl(e) {
    const t = e || {}, i = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.COMICS, [ [ "free_type", t.freeType ], [ "limit", i ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, i) : t.offset ], [ "ordering", t.ordering ], [ "theme", t.theme ], [ "top", t.top ], [ "author", t.author ], [ "q", t.keyword ], [ "q_type", t.queryType ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function buildCopyLikeSearchUrl(e) {
    const t = e || {}, i = null == t.limit ? 20 : t.limit, r = null == t.keyword ? "" : encodeURIComponent(String(t.keyword));
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC, [ [ "platform", t.platform ], [ "q", r ], [ "limit", i ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, i) : t.offset ], [ "free_type", t.freeType ], [ "_update", t.update ], [ "q_type", t.queryType ] ]);
}

function buildCopyLikeHomeIndexComicsUrl(e) {
    const t = e || {}, i = null == t.limit ? 20 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX_COMICS, [ [ "limit", i ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, i) : t.offset ], [ "top", t.top ], [ "ordering", t.ordering ] ]);
}

function buildCopyLikeFavoriteComicsUrl(e) {
    const t = e || {}, i = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMICS, [ [ "limit", i ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, i) : t.offset ], [ "free_type", t.freeType ], [ "ordering", t.ordering ] ]);
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
    const t = e || {}, i = t.chapterEndpoint || "chapter2";
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${t.comicId}/${i}/${t.chapterId}`, [ [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function normalizeCopyLikeCategoryParam(e, t, i) {
    return null == e ? i : (t || {})[e] || "";
}

function parseCopyLikeDetailAuthors(e) {
    return e && Array.isArray(e.author) ? e.author.map(e => e && e.name).filter(e => null != e) : [];
}

function parseCopyLikeDetailTags(e) {
    return e && Array.isArray(e.theme) ? e.theme.map(e => e && e.name).filter(e => null != e) : [];
}

function buildCopyLikeDetailTagMap(e, t) {
    const i = t || {}, r = i.authorNamespace || "作者", o = i.updateNamespace || "更新", a = i.tagNamespace || "标签", n = i.statusNamespace || "状态", l = e && e.datetime_updated ? e.datetime_updated : "", u = e && e.status && e.status.display ? e.status.display : "";
    return {
        [r]: parseCopyLikeDetailAuthors(e),
        [o]: [ l ],
        [a]: parseCopyLikeDetailTags(e),
        [n]: [ u ]
    };
}

function resolveCopyLikeTagAction(e, t, i) {
    const r = i || {}, o = r.categoryNamespace || "标签", a = r.authorNamespace || "作者", n = r.unsupportedError || "未支持此类Tag检索";
    if (e === o) return {
        action: "category",
        keyword: `${t}`,
        param: null
    };
    if (e === a) return {
        action: "search",
        keyword: `${e}:${t}`,
        param: null
    };
    throw n;
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

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, i) {
    const r = String(null == e ? "" : e).trim() || t;
    return i ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), i = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(i.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), o = __veneraNormalizeAuthorityPart(i.providerPath, "gh", !0), a = __veneraNormalizeAuthorityPart(i.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(i.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(i.artifactPathPrefix, "dist/plugins", !0), u = String(e || "").replace(/^\/+/, "");
    if (!u) return `${r}/${o}/${a}@${n}`;
    const s = l ? `${l}/${u}` : u;
    return `${r}/${o}/${a}@${n}/${u.startsWith(`${l}/`) ? u : s}`;
}

"undefined" != typeof module && module.exports && (module.exports = {
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
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature
});

"use strict";
