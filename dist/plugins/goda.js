class Goda extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "GoDa漫画", this.key = "goda", this.version = "1.0.0", this.minAppVersion = "1.4.0",
        this.url = resolvePluginUpdateUrl("goda.js"), this.settings = {
            domains: {
                title: "域名",
                type: "input",
                default: "godamh.com"
            },
            api: {
                title: "API域名",
                type: "input",
                default: "api-get-v3.mgsearcher.com"
            },
            image: {
                title: "图片域名",
                type: "input",
                default: "t40-1-4.g-mh.online"
            }
        }, this.explore = [ createMhLikeExplorePageFeature({
            title: this.name,
            context: "goda home",
            getBaseUrl: () => this.baseUrl,
            getHeaders: () => this.headers,
            parseComics: e => this.parseComics(e)
        }) ], this.category = {
            title: this.name,
            parts: [ {
                name: "类型",
                type: "fixed",
                categories: [ "全部", "韩漫", "热门漫画", "国漫", "其他", "日漫", "欧美" ],
                itemType: "category",
                categoryParams: [ "/manga", "/manga-genre/kr", "/manga-genre/hots", "/manga-genre/cn", "/manga-genre/qita", "/manga-genre/jp", "/manga-genre/ou-mei" ]
            }, {
                name: "标签",
                type: "fixed",
                categories: [ "复仇", "古风", "奇幻", "逆袭", "异能", "宅向", "穿越", "热血", "纯爱", "系统", "重生", "冒险", "灵异", "大女主", "剧情", "恋爱", "玄幻", "女神", "科幻", "魔幻", "推理", "猎奇", "治愈", "都市", "异形", "青春", "末日", "悬疑", "修仙", "战斗" ],
                itemType: "category",
                categoryParams: [ "/manga-tag/fuchou", "/manga-tag/gufeng", "/manga-tag/qihuan", "/manga-tag/nixi", "/manga-tag/yineng", "/manga-tag/zhaixiang", "/manga-tag/chuanyue", "/manga-tag/rexue", "/manga-tag/chunai", "/manga-tag/xitong", "/manga-tag/zhongsheng", "/manga-tag/maoxian", "/manga-tag/lingyi", "/manga-tag/danvzhu", "/manga-tag/juqing", "/manga-tag/lianai", "/manga-tag/xuanhuan", "/manga-tag/nvshen", "/manga-tag/kehuan", "/manga-tag/mohuan", "/manga-tag/tuili", "/manga-tag/lieqi", "/manga-tag/zhiyu", "/manga-tag/doushi", "/manga-tag/yixing", "/manga-tag/qingchun", "/manga-tag/mori", "/manga-tag/xuanyi", "/manga-tag/xiuxian", "/manga-tag/zhandou" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: createMhLikeCategoryLoaderFeature({
                context: "goda category",
                getBaseUrl: () => this.baseUrl,
                getHeaders: () => this.headers,
                parseComics: e => this.parseComics(e),
                buildRequestUrl: createMhLikeCategoryRequestUrlBuilder({
                    getBaseUrl: () => this.baseUrl
                })
            })
        }, this.search = {
            load: createMhLikeSearchLoaderFeature({
                context: "goda search",
                getBaseUrl: () => this.baseUrl,
                getHeaders: () => this.headers,
                parseComics: e => this.parseComics(e),
                buildRequestUrl: createMhLikeSearchRequestUrlBuilder({
                    getBaseUrl: () => this.baseUrl
                })
            }),
            enableTagsSuggestions: !1
        }, this.comic = {
            onThumbnailLoad: e => ({
                headers: this.headers
            }),
            loadInfo: async e => {
                const t = await loadMhLikeBaseComicInfoFeature({
                    context: "goda detail",
                    detailUrl: this.baseUrl + e,
                    headers: this.headers
                }), a = t.mangaId, r = await Network.get(this.chapterRequests.buildChapterListRequestUrl({
                    mangaId: a
                }), this.headers), i = JSON.parse(r.body), n = {};
                for (let e of i.data.chapters) n[`${a}@${e.id}`] = e.attributes.title;
                return new ComicDetails({
                    title: t.title,
                    cover: t.cover,
                    description: t.description,
                    tags: t.tags,
                    chapters: n,
                    recommend: t.recommend
                });
            },
            loadEp: async (e, t) => {
                const a = t.split("@"), r = await Network.get(this.chapterRequests.buildChapterInfoRequestUrl({
                    mangaId: a[0],
                    chapterId: a[1]
                }), this.headers);
                if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                const i = JSON.parse(r.body), n = [];
                for (let e of i.data.info.images.images) n.push(this.imageUrl + e.url);
                return {
                    images: n
                };
            },
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return buildMhLikeBaseUrl(this.loadSetting("domains"));
    }
    get apiUrl() {
        return buildMhLikeApiBaseUrl(this.loadSetting("api"), "/api");
    }
    get imageUrl() {
        return `https://${this.loadSetting("image")}`;
    }
    get headers() {
        return buildMhLikeHeaders(this.baseUrl);
    }
    get chapterRequests() {
        return createMhLikeChapterRequestUrlBuilders({
            getBaseUrl: () => this.apiUrl
        });
    }
    parseComics(e) {
        return parseMhLikeComicCards(e);
    }
}

function createRuntimeInvalidStatusError(e, t) {
    return `Invalid status code: ${e}${t ? ` (${t})` : ""}`;
}

function assertRuntimeStatus(e, t, a) {
    const r = Array.isArray(t) ? t : [ null == t ? 200 : t ], i = e && "number" == typeof e.status ? e.status : -1;
    if (!r.includes(i)) throw createRuntimeInvalidStatusError(i, a);
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

async function getRuntimeJson(e, t, a) {
    const r = await runtimeGet(e, t);
    return assertRuntimeStatus(r, 200, a || e), parseRuntimeJsonBody(r, a || e);
}

async function getRuntimeDocument(e, t, a) {
    const r = await runtimeGet(e, t);
    return assertRuntimeStatus(r, 200, a || e), new HtmlDocument(r.body);
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
    return async (t, a, r, i) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            category: t,
            params: a,
            options: r,
            page: i
        }) : buildMhLikeCategoryUrl({
            baseUrl: e.getBaseUrl(),
            categoryPath: a,
            page: i,
            pageSegment: e.categoryPageSegment
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like category"
    });
}

function createMhLikeSearchLoadFeature(e) {
    return async (t, a, r) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            keyword: t,
            options: a,
            page: r
        }) : buildMhLikeSearchUrl({
            baseUrl: e.getBaseUrl(),
            keyword: t,
            page: r,
            searchPath: e.searchPath
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like search"
    });
}

async function loadMhLikeBaseComicInfo(e) {
    const t = await getRuntimeDocument(e.detailUrl, e.headers, e.context || "mh_like comic detail"), a = t.querySelector(".text-xl").text.trim().split("   ")[0], r = t.querySelector(".object-cover").attributes.src, i = t.querySelector("p.text-medium").text;
    return {
        document: t,
        title: a,
        cover: r,
        description: i,
        tags: parseMhLikeDetailTags(t),
        recommend: parseMhLikeRecommendComics(t),
        mangaId: t.querySelector("#mangachapters").attributes["data-mid"]
    };
}

function createMhLikeCategoryRequestUrlBuilder(e) {
    const t = e || {};
    return ({params: e, page: a}) => buildMhLikeCategoryUrl({
        baseUrl: t.getBaseUrl(),
        categoryPath: e,
        page: a,
        pageSegment: t.categoryPageSegment
    });
}

function createMhLikeSearchRequestUrlBuilder(e) {
    const t = e || {};
    return ({keyword: e, page: a}) => buildMhLikeSearchUrl({
        baseUrl: t.getBaseUrl(),
        keyword: e,
        page: a,
        searchPath: t.searchPath
    });
}

function createMhLikeChapterRequestUrlBuilders(e) {
    const t = e || {};
    return {
        buildChapterListRequestUrl: ({mangaId: e, timestamp: a, mode: r}) => buildMhLikeChapterListUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            timestamp: a,
            mode: r,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoRequestUrl: ({mangaId: e, chapterId: a}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: a,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentRequestUrl: ({mangaId: e, chapterId: a}) => buildMhLikeChapterContentUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: a,
            chapterPath: t.chapterContentPath
        })
    };
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    createRuntimeInvalidStatusError,
    assertRuntimeStatus
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    parseRuntimeJsonBody,
    getRuntimeJson,
    getRuntimeDocument
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders
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
    let a = String(null == e ? t || "" : e).trim();
    return a || (a = String(t || "")), a ? (a = a.replace(/\/+$/, ""), a.startsWith("/") || (a = `/${a}`),
    a) : "";
}

function buildMhLikeRelativeUrl(e, t) {
    const a = String(e || "").replace(/\/+$/, ""), r = String(t || "").trim();
    return r ? r.startsWith("http://") || r.startsWith("https://") ? r : r.startsWith("/") ? `${a}${r}` : `${a}/${r}` : a;
}

function buildMhLikeApiBaseUrl(e, t) {
    return buildMhLikeRelativeUrl(buildMhLikeBaseUrl(e), normalizeMhLikePath(t, "/api"));
}

function buildMhLikeCategoryUrl(e) {
    const t = e || {}, a = String(t.categoryPath || "").replace(/\/+$/, ""), r = normalizeMhLikePath(t.pageSegment, MH_LIKE_ENDPOINT_PATHS.CATEGORY_PAGE_SEGMENT);
    return buildMhLikeRelativeUrl(t.baseUrl, `${a}${r}/${t.page}`);
}

function buildMhLikeSearchUrl(e) {
    const t = e || {}, a = normalizeMhLikePath(t.searchPath, MH_LIKE_ENDPOINT_PATHS.SEARCH), r = encodeURIComponent(String(null == t.keyword ? "" : t.keyword));
    return buildMhLikeRelativeUrl(t.baseUrl, `${a}/${r}?page=${t.page}`);
}

function buildMhLikeChapterListUrl(e) {
    const t = e || {}, a = normalizeMhLikePath(t.chapterListPath, MH_LIKE_ENDPOINT_PATHS.CHAPTER_LIST), r = null == t.mode ? "all" : t.mode, i = null == t.timestamp ? Date.now() : t.timestamp;
    return buildMhLikeRelativeUrl(t.baseUrl, `${a}?mid=${t.mangaId}&mode=${r}&t=${i}`);
}

function buildMhLikeChapterEndpointUrl(e) {
    const t = e || {}, a = normalizeMhLikePath(t.chapterPath, "");
    return buildMhLikeRelativeUrl(t.baseUrl, `${a}?m=${t.mangaId}&c=${t.chapterId}`);
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
        buildCategoryUrl: ({categoryPath: e, page: a}) => buildMhLikeCategoryUrl({
            baseUrl: t.baseUrl,
            categoryPath: e,
            page: a,
            pageSegment: t.categoryPageSegment
        }),
        buildSearchUrl: ({keyword: e, page: a}) => buildMhLikeSearchUrl({
            baseUrl: t.baseUrl,
            keyword: e,
            page: a,
            searchPath: t.searchPath
        }),
        buildChapterListUrl: ({mangaId: e, timestamp: a, mode: r}) => buildMhLikeChapterListUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            timestamp: a,
            mode: r,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoUrl: ({mangaId: e, chapterId: a}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: a,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentUrl: ({mangaId: e, chapterId: a}) => buildMhLikeChapterContentUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: a,
            chapterPath: t.chapterContentPath
        })
    };
}

function parseMhLikeComicCards(e) {
    const t = [];
    if (!e) return t;
    for (let a of e.querySelectorAll(".pb-2")) t.push(new Comic({
        id: a.querySelector("a").attributes.href,
        title: a.querySelector("h3").text,
        cover: a.querySelector("img").attributes.src
    }));
    return t;
}

function parseMhLikeHomeSections(e, t) {
    const a = [ {
        title: "近期更新",
        comics: [],
        viewMore: null
    } ], r = e.querySelector(".pb-unit-md");
    if (r) for (let e of r.querySelectorAll(".slicarda")) a[0].comics.push(new Comic({
        id: e.attributes.href,
        title: e.querySelector("h3").text,
        cover: e.querySelector("img").attributes.src
    }));
    const i = e.querySelectorAll(".cardlist"), n = e.querySelectorAll(".hometitle");
    for (let e = 0; e < n.length; e++) {
        const r = n[e].querySelector("h2");
        a.push({
            title: r.text,
            comics: t(i[e]),
            viewMore: {
                page: "category",
                attributes: {
                    category: r.text,
                    param: n[e].attributes.href
                }
            }
        });
    }
    return a;
}

function parseMhLikeMaxPage(e) {
    try {
        return parseInt(e.querySelectorAll("button.text-small").pop().text.replaceAll("\n", "").replaceAll(" ", ""));
    } catch (e) {
        return 1;
    }
}

function parseMhLikeDetailTags(e) {
    const t = e.querySelectorAll("div.py-1"), a = {
        作者: [],
        类型: [],
        标签: []
    };
    for (let e of t[0].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), a["作者"].push(t);
    }
    for (let e of t[1].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), a["类型"].push(t);
    }
    for (let e of t[2].querySelectorAll("a")) a["标签"].push(e.text.replace("\n", "").replaceAll(" ", "").replace("#", ""));
    return a;
}

function parseMhLikeRecommendComics(e) {
    const t = [];
    for (let a of e.querySelectorAll("div.cardlist > div.pb-2")) t.push(new Comic({
        id: a.querySelector("a").attributes.href,
        title: a.querySelector("h3").text,
        cover: a.querySelector("img").attributes.src
    }));
    return t;
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

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const r = String(null == e ? "" : e).trim() || t;
    return a ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), n = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), s = String(e || "").replace(/^\/+/, "");
    if (!s) return `${r}/${i}/${n}@${o}`;
    const h = l ? `${l}/${s}` : s;
    return `${r}/${i}/${n}@${o}/${s.startsWith(`${l}/`) ? s : h}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    MH_LIKE_ENDPOINT_PATHS,
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
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature
});

"use strict";
