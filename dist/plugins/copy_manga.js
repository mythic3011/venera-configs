class CopyManga extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "拷贝漫画", this.key = "copy_manga", this.version = "1.4.1",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("copy_manga.js"),
        this.account = {
            login: async (e, t) => {
                let i = randomInt(1e3, 9999), r = Convert.encodeBase64(Convert.encodeUtf8(`${t}-${i}`)), a = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.LOGIN), withCopyLikeFormHeaders(this.headers), `username=${e}&password=${r}\n&salt=${i}&authorization=Token+`);
                if (200 === a.status) {
                    let e = JSON.parse(a.body).results.token;
                    return this.saveData("token", e), "ok";
                }
                throw `Invalid Status Code ${a.status}`;
            },
            logout: () => {
                this.deleteData("token");
            },
            registerWebsite: null
        }, this.explore = [ createCopyLikeExploreSectionsFeature({
            title: "拷贝漫画",
            sections: CopyManga.homeSections,
            parseComic: this.baseComicParser,
            context: "copy_manga home",
            getApiUrl: () => this.apiUrl,
            getHeaders: () => this.headers
        }) ], this.category = {
            title: "拷贝漫画",
            parts: [ {
                name: "拷贝漫画",
                type: "fixed",
                categories: [ "排行" ],
                categoryParams: [ "ranking" ],
                itemType: "category"
            }, {
                name: "主题",
                type: "fixed",
                categories: Object.keys(CopyManga.category_param_dict),
                categoryParams: Object.values(CopyManga.category_param_dict),
                itemType: "category"
            } ]
        }, this.categoryComics = {
            load: createCopyLikeCategoryLoaderFeature({
                context: "copy_manga category",
                parseComic: this.rankedComicParser,
                getHeaders: () => this.headers,
                buildRequestUrl: createCopyLikeCategoryRequestUrlBuilder({
                    getApiUrl: () => this.apiUrl,
                    isRankingCategory: (e, t) => "排行" === e || "ranking" === t,
                    rankingAudienceOptionIndex: 0,
                    rankingDateOptionIndex: 1,
                    categoryParamMap: CopyManga.category_param_dict,
                    themedTopOptionIndex: 0,
                    themedOrderingOptionIndex: 1
                })
            }),
            optionList: [ {
                options: [ "-全部", "japan-日漫", "korea-韩漫", "west-美漫", "finish-已完结" ],
                notShowWhen: null,
                showWhen: Object.keys(CopyManga.category_param_dict)
            }, {
                options: [ "*datetime_updated-时间倒序", "datetime_updated-时间正序", "*popular-热度倒序", "popular-热度正序" ],
                notShowWhen: null,
                showWhen: Object.keys(CopyManga.category_param_dict)
            }, {
                options: [ "male-男频", "female-女频" ],
                notShowWhen: null,
                showWhen: [ "排行" ]
            }, {
                options: [ "day-上升最快", "week-最近7天", "month-最近30天", "total-總榜單" ],
                notShowWhen: null,
                showWhen: [ "排行" ]
            } ]
        }, this.search = {
            load: createCopyLikeSearchLoaderFeature({
                context: "copy_manga search",
                parseComic: this.datedComicParser,
                getHeaders: () => this.headers,
                resolveAuthorPathWord: e => this.author_path_word_dict[e],
                buildAuthorRequestUrl: e => this.searchRequestUrlBuilders.buildAuthorRequestUrl(e),
                buildKeywordRequestUrl: e => this.searchRequestUrlBuilders.buildKeywordRequestUrl(e)
            }),
            optionList: [ {
                type: "select",
                options: [ "-全部", "name-名称", "author-作者", "local-汉化组" ],
                label: "搜索选项"
            } ]
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, i) => {
                let r = i ? 1 : 0, a = this.loadData("token"), o = await this.getReqID(), n = await Network.get(buildCopyLikeComicDetailUrl({
                    apiUrl: this.apiUrl,
                    id: e,
                    inMainland: !0,
                    requestId: o,
                    platform: 3
                }), this.headers);
                if (200 !== n.status) throw `Invalid status code: ${n.status}`;
                let s = JSON.parse(n.body).results.comic.uuid, l = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMIC_ACTION), withCopyLikeFormHeaders(this.headers), `comic_id=${s}&is_collect=${r}&authorization=Token+${a}`);
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
                assertRuntimeStatus(r, 200, "copy_manga favorites");
                let a = parseRuntimeJsonBody(r, "copy_manga favorites");
                const o = readCopyLikePath(a, [ "results", "list" ], []), n = readCopyLikePath(a, [ "results", "total" ], 0);
                return {
                    comics: Array.isArray(o) ? o.map(this.datedComicParser) : [],
                    maxPage: computeCopyLikeMaxPage(n, 21)
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                let t = await this.getReqID(), i = await Promise.all([ Network.get(buildCopyLikeComicDetailUrl({
                    apiUrl: this.apiUrl,
                    id: e,
                    inMainland: !0,
                    requestId: t,
                    platform: 3
                }), this.headers), (async e => {
                    let t = await Network.get(buildCopyLikeComicQueryUrl({
                        apiUrl: this.apiUrl,
                        id: e
                    }), this.headers);
                    if (200 !== t.status) throw `Invalid status code: ${t.status}`;
                    return null != JSON.parse(t.body).results.collect;
                }).bind(this)(e) ]);
                if (200 !== i[0].status) throw `Invalid status code: ${res.status}`;
                let r = JSON.parse(i[0].body).results, a = r.comic, o = a.name, n = a.cover;
                Object.keys(this.author_path_word_dict).length > 100 && (this.author_path_word_dict = {}),
                a.author.forEach(e => this.author_path_word_dict[e.name] = e.path_word);
                let s = a.brief, l = await (async (e, t) => {
                    let i = async (e, t) => {
                        let i = await this.getReqID(), r = await Network.get(buildCopyLikeGroupChaptersUrl({
                            apiUrl: this.apiUrl,
                            id: e,
                            groupPath: t,
                            limit: 100,
                            offset: 0,
                            inMainland: !0,
                            requestId: i
                        }), this.headers);
                        if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                        let a = JSON.parse(r.body), o = new Map;
                        a.results.list.forEach(e => {
                            let t = e.name, i = e.uuid;
                            o.set(i, t);
                        });
                        let n = a.results.total;
                        if (n > 100) {
                            let i = 100;
                            for (;i < n; ) {
                                if (r = await Network.get(buildCopyLikeGroupChaptersUrl({
                                    apiUrl: this.apiUrl,
                                    id: e,
                                    groupPath: t,
                                    limit: 100,
                                    offset: i
                                }), this.headers), 200 !== r.status) throw `Invalid status code: ${r.status}`;
                                a = JSON.parse(r.body), a.results.list.forEach(e => {
                                    let t = e.name, i = e.uuid;
                                    o.set(i, t);
                                }), i += 100;
                            }
                        }
                        return o;
                    }, r = Object.keys(t), a = {}, o = [];
                    for (let n of r) {
                        let r = t[n].path_word;
                        o.push((async () => {
                            a[n] = await i(e, r);
                        })());
                    }
                    if (await Promise.all(o), this.isAppVersionAfter("1.3.0")) {
                        let e = new Map;
                        for (let i of r) {
                            let r = t[i].name;
                            e.set(r, a[i]);
                        }
                        return e;
                    }
                    {
                        let e = new Map;
                        for (let t of r) for (let [i, r] of a[t]) e.set(i, r);
                        return e;
                    }
                })(e, r.groups);
                return {
                    title: o,
                    cover: n,
                    description: s,
                    tags: createCopyLikeDetailTagMapper({})(a),
                    chapters: l,
                    isFavorite: i[1],
                    subId: a.uuid
                };
            },
            loadEp: async (e, t) => {
                let i, r, a = 0;
                for (;a < 5; ) try {
                    let a = await this.getReqID();
                    if (i = await Network.get(buildCopyLikeChapterUrl({
                        apiUrl: this.apiUrl,
                        comicId: e,
                        chapterId: t,
                        chapterEndpoint: "chapter2",
                        inMainland: !0,
                        requestId: a
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
                    r = JSON.parse(i.body);
                    let o = r.results.chapter.contents.map(e => e.url), n = r.results.chapter.words, s = o.map(e => e.replace(/([./])c\d+x\.[a-zA-Z]+$/, `$1c${this.imageQuality}x.webp`)), l = new Array(s.length).fill("");
                    for (let e = 0; e < s.length; e++) l[n[e]] = s[e];
                    return {
                        images: l
                    };
                } catch (e) {
                    if ("Retry" !== e) throw e;
                    if (a++, a >= 5) throw e;
                }
            },
            loadComments: async (e, t, i, r) => {
                const a = [ [ "comic_id", t ], [ "limit", 20 ], [ "offset", 20 * (i - 1) ] ];
                r && (a.push([ "reply_id", r ]), a.push([ "_update", !0 ]));
                const o = buildCopyLikeUrlWithQuery(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.COMMENTS, a);
                let n = await Network.get(o, this.headers);
                if (200 !== n.status) {
                    if (210 === n.status) throw "210：注冊用戶一天可以發5條評論";
                    throw `Invalid status code: ${n.status}`;
                }
                let s = JSON.parse(n.body), l = s.results.total;
                return {
                    comments: s.results.list.map(e => ({
                        userName: r ? `${e.user_name}  👉  ${e.parent_user_name}` : e.user_name,
                        avatar: e.user_avatar,
                        content: e.comment,
                        time: e.create_at,
                        replyCount: e.count,
                        id: e.id
                    })),
                    maxPage: (l - l % 20) / 20 + 1
                };
            },
            sendComment: async (e, t, i, r) => {
                if (!this.loadData("token")) throw "未登录";
                r || (r = "");
                let a = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.COMMENT_ACTION), withCopyLikeFormHeaders(this.headers), `comic_id=${t}&comment=${encodeURIComponent(i)}&reply_id=${r}`);
                if (401 !== a.status) {
                    if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                    return "ok";
                }
                error("Login expired");
            },
            loadChapterComments: async (e, t, i, r) => {
                const a = buildCopyLikeUrlWithQuery(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.ROASTS, [ [ "chapter_id", t ], [ "limit", 20 ], [ "offset", 20 * (i - 1) ] ]);
                let o = await Network.get(a, this.headers);
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                let n = JSON.parse(o.body), s = n.results.total;
                return {
                    comments: n.results.list.map(e => ({
                        userName: e.user_name,
                        avatar: e.user_avatar,
                        content: e.comment,
                        time: e.create_at,
                        replyCount: null,
                        id: null
                    })),
                    maxPage: (s - s % 20) / 20 + 1
                };
            },
            sendChapterComment: async (e, t, i, r) => {
                if (!this.loadData("token")) throw "未登录";
                let a = await Network.post(buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.ROAST_ACTION), withCopyLikeFormHeaders(this.headers), `chapter_id=${t}&roast=${encodeURIComponent(i)}`);
                if (401 === a.status) throw "Login expired";
                if (200 !== a.status) {
                    if (210 === a.status) throw "210:评论过于频繁或评论内容过短过长";
                    throw `Invalid status code: ${a.status}`;
                }
                return "ok";
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
            region: {
                title: "CDN线路",
                type: "select",
                options: [ {
                    value: "1",
                    text: "大陆线路"
                }, {
                    value: "0",
                    text: "海外线路"
                } ],
                default: CopyManga.defaultCopyRegion
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
                default: CopyManga.defaultImageQuality
            },
            search_api: {
                title: "搜索方式",
                type: "select",
                options: [ {
                    value: "baseAPI",
                    text: "基础API"
                }, {
                    value: "webAPI",
                    text: "网页端API"
                } ],
                default: "baseAPI"
            },
            base_url: {
                title: "API地址",
                type: "input",
                validator: "^(?!:\\/\\/)(?=.{1,253})([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$",
                default: CopyManga.defaultApiUrl
            },
            clear_device_info: {
                title: "清除设备信息",
                type: "callback",
                buttonText: "点击清除设备信息",
                callback: () => {
                    this.deleteData("_deviceinfo"), this.deleteData("_device"), this.deleteData("_pseudoid"),
                    this.refreshAppApi();
                }
            }
        };
    }
    async getReqID() {
        if ("0" === this.copyRegion) return "";
        let e = "";
        try {
            const t = await Network.get("https://marketing.aiacgn.com/api/v2/adopr/query3/?format=json&ident=200100001", this.headers);
            200 === t.status && (e = JSON.parse(t.body).results.request_id);
        } catch (e) {}
        return e;
    }
    get headers() {
        const e = this.loadData("token"), t = buildCopyLikeRequestSigningMeta(Date.now()), i = buildCopyLikeHmacSignature("M2FmMDg1OTAzMTEwMzJlZmUwNjYwNTUwYTA1NjNhNTM=", t.ts);
        return {
            "User-Agent": "COPY/3.0.6",
            source: "copyApp",
            deviceinfo: this.deviceinfo,
            dt: t.dt,
            platform: "3",
            referer: "com.copymanga.app-3.0.6",
            version: "3.0.6",
            device: this.device,
            pseudoid: this.pseudoid,
            Accept: "application/json",
            region: this.copyRegion,
            authorization: buildCopyLikeTokenHeader(e),
            umstring: "b4c89ca4104ea9a97750314d791520ac",
            "x-auth-timestamp": t.ts,
            "x-auth-signature": i
        };
    }
    get deviceinfo() {
        let e = this.loadData("_deviceinfo");
        return e || (e = CopyManga.generateDeviceInfo(), this.saveData("_deviceinfo", e)),
        e;
    }
    get device() {
        let e = this.loadData("_device");
        return e || (e = CopyManga.generateDevice(), this.saveData("_device", e)), e;
    }
    get pseudoid() {
        let e = this.loadData("_pseudoid");
        return e || (e = CopyManga.generatePseudoid(), this.saveData("_pseudoid", e)), e;
    }
    static generateDeviceInfo() {
        return `${randomInt(1e6, 9999999)}V-${randomInt(1e3, 9999)}`;
    }
    static generateDevice() {
        function e() {
            return String.fromCharCode(65 + randomInt(0, 25));
        }
        function t() {
            return String.fromCharCode(48 + randomInt(0, 9));
        }
        return e() + e() + t() + e() + "." + t() + t() + t() + t() + t() + t() + "." + t() + t() + t();
    }
    static generatePseudoid() {
        let e = "";
        for (let t = 0; t < 16; t++) e += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(randomInt(0, 61));
        return e;
    }
    get apiUrl() {
        return buildCopyLikeApiUrl(this.loadSetting("base_url"), CopyManga.defaultApiUrl);
    }
    get copyRegion() {
        return this.loadSetting("region") || this.defaultCopyRegion;
    }
    get imageQuality() {
        return this.loadSetting("image_quality") || this.defaultImageQuality;
    }
    init() {
        this.author_path_word_dict = {}, this.refreshSearchApi(), this.refreshAppApi();
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
            keywordLimit: 30,
            queryTypeOptionIndex: 0,
            queryTypeDefault: "",
            getKeywordEndpointPath: () => "webAPI" === this.loadSetting("search_api") ? CopyManga.searchApi : COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC
        });
    }
    isAppVersionAfter(e) {
        let t = APP.version, i = e.split("."), r = t.split(".");
        for (let e = 0; e < 3; e++) if (parseInt(r[e]) < parseInt(i[e])) return !1;
        return !0;
    }
    async refreshSearchApi() {
        let e = await fetch("https://www.copy20.com/search");
        if (200 === e.status) {
            let t = (await e.text()).match(/const countApi = "([^"]+)"/);
            t && t[1] && (CopyManga.searchApi = t[1]);
        }
    }
    async refreshAppApi() {
        const e = await fetch("https://api.copy-manga.com/api/v3/system/network2?platform=3", {
            headers: this.headers
        });
        if (200 === e.status) {
            let t = await e.json();
            this.settings.base_url = t.results.api[0][0];
        }
    }
}

function createRuntimeInvalidStatusError(e, t) {
    return `Invalid status code: ${e}${t ? ` (${t})` : ""}`;
}

function assertRuntimeStatus(e, t, i) {
    const r = Array.isArray(t) ? t : [ null == t ? 200 : t ], a = e && "number" == typeof e.status ? e.status : -1;
    if (!r.includes(a)) throw createRuntimeInvalidStatusError(a, i);
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
    const a = e.rise_sort || 0;
    return `${r} ${a > 0 ? "▲" : a < 0 ? "▽" : "-"}\n${i > 1 ? `${t} 等${i}位` : t}\n🔥${(Number(e.popular || 0) / 1e4).toFixed(1)}W`;
}

function createCopyLikeComicParser(e) {
    const t = e || {};
    return e => {
        const i = unwrapCopyLikeComic(e), r = parseCopyLikePrimaryAuthor(i), a = parseCopyLikeAuthorCount(i), o = {
            id: i.path_word,
            title: i.name,
            subTitle: r,
            cover: i.cover,
            tags: parseCopyLikeThemeTags(i)
        };
        if (t.includeRankingDescription) {
            const t = formatCopyLikeRankingDescription(e, r, a);
            if (null != t) return o.description = t, o;
        }
        if (t.includeUpdateDescription && (o.description = i.datetime_updated), "function" == typeof t.describe) {
            const n = t.describe({
                sourceComic: e,
                comic: i,
                author: r,
                authorCount: a
            });
            null != n && (o.description = n);
        }
        return o;
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
    for (const a of t || []) {
        const t = readCopyLikePath(e, a.path, []);
        r[a.title] = Array.isArray(t) ? t.map(i) : [];
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
    return async (t, i, r, a) => loadCopyLikeListModule({
        requestUrl: e.buildRequestUrl({
            category: t,
            param: i,
            options: r,
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
    return ({category: t, param: i, options: r, page: a}) => {
        const o = Array.isArray(r) ? r : [], n = !1 === e.normalizeOptions ? o : normalizeStarOptions(o), s = e.getApiUrl();
        if ("function" == typeof e.isRankingCategory && e.isRankingCategory(t, i)) return buildCopyLikeRankingUrl({
            apiUrl: s,
            page: a,
            limit: null == e.rankingLimit ? 30 : e.rankingLimit,
            freeType: e.rankingFreeType,
            audienceType: null == e.rankingAudienceOptionIndex ? void 0 : o[e.rankingAudienceOptionIndex],
            region: null == e.rankingRegionOptionIndex ? void 0 : o[e.rankingRegionOptionIndex],
            dateType: null == e.rankingDateOptionIndex ? void 0 : o[e.rankingDateOptionIndex]
        });
        if ("function" == typeof e.isHomepageCategory && e.isHomepageCategory(t, i)) return buildCopyLikeHomeIndexComicsUrl({
            apiUrl: s,
            page: a,
            limit: null == e.homepageLimit ? 20 : e.homepageLimit,
            top: i,
            ordering: null == e.homepageOrderingOptionIndex ? void 0 : o[e.homepageOrderingOptionIndex]
        });
        const l = normalizeCopyLikeCategoryParam(t, e.categoryParamMap, i);
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
        buildAuthorRequestUrl: ({pathWord: t, page: i}) => buildCopyLikeComicsUrl({
            apiUrl: e.getApiUrl(),
            page: i,
            limit: null == e.authorLimit ? 30 : e.authorLimit,
            ordering: e.authorOrdering || "-datetime_updated",
            author: t
        }),
        buildKeywordRequestUrl: ({keyword: t, options: i, page: r}) => {
            const a = Array.isArray(i) ? i : [], o = null == e.queryTypeOptionIndex ? e.queryTypeDefault : null != a[e.queryTypeOptionIndex] ? a[e.queryTypeOptionIndex] : e.queryTypeDefault;
            return buildCopyLikeSearchUrl({
                apiUrl: e.getApiUrl(),
                endpointPath: "function" == typeof e.getKeywordEndpointPath ? e.getKeywordEndpointPath() : e.keywordEndpointPath,
                page: r,
                limit: null == e.keywordLimit ? 20 : e.keywordLimit,
                keyword: t,
                queryType: o,
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
    const a = r.indexOf("/");
    return a >= 0 && (r = r.slice(0, a)), r || i;
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

CopyManga.defaultCopyRegion = "0", CopyManga.defaultImageQuality = "1500", CopyManga.defaultApiUrl = "api.copy2000.online",
CopyManga.searchApi = "/api/kb/web/searchb/comics", CopyManga.homeSections = [ {
    title: "推荐",
    path: [ "results", "recComics", "list" ]
}, {
    title: "热门",
    path: [ "results", "hotComics" ]
}, {
    title: "最新",
    path: [ "results", "newComics" ]
}, {
    title: "完结",
    path: [ "results", "finishComics", "list" ]
}, {
    title: "今日排行",
    path: [ "results", "rankDayComics", "list" ]
}, {
    title: "本周排行",
    path: [ "results", "rankWeekComics", "list" ]
}, {
    title: "本月排行",
    path: [ "results", "rankMonthComics", "list" ]
} ], CopyManga.category_param_dict = {
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
    悬疑: "xuanyi",
    其他: "qita",
    神鬼: "shengui",
    职场: "zhichang",
    TL: "teenslove",
    萌系: "mengxi",
    治愈: "zhiyu",
    長條: "changtiao",
    四格: "sige",
    节操: "jiecao",
    舰娘: "jianniang",
    竞技: "jingji",
    搞笑: "gaoxiao",
    伪娘: "weiniang",
    热血: "rexue",
    励志: "lizhi",
    性转换: "xingzhuanhuan",
    彩色: "COLOR",
    後宮: "hougong",
    美食: "meishi",
    侦探: "zhentan",
    AA: "aa",
    音乐舞蹈: "yinyuewudao",
    魔幻: "mohuan",
    战争: "zhanzheng",
    历史: "lishi",
    异世界: "yishijie",
    惊悚: "jingsong",
    机战: "jizhan",
    都市: "dushi",
    穿越: "chuanyue",
    恐怖: "kongbu",
    C100: "comiket100",
    重生: "chongsheng",
    C99: "comiket99",
    C101: "comiket101",
    C97: "comiket97",
    C96: "comiket96",
    生存: "shengcun",
    宅系: "zhaixi",
    武侠: "wuxia",
    C98: "C98",
    C95: "comiket95",
    FATE: "fate",
    转生: "zhuansheng",
    無修正: "Uncensored",
    仙侠: "xianxia",
    LoveLive: "loveLive"
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
    const r = buildCopyLikeEndpointUrl(e, t), a = buildCopyLikeQueryString(i);
    return a ? `${r}?${a}` : r;
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
    const i = t || {}, r = i.authorNamespace || "作者", a = i.updateNamespace || "更新", o = i.tagNamespace || "标签", n = i.statusNamespace || "状态", s = e && e.datetime_updated ? e.datetime_updated : "", l = e && e.status && e.status.display ? e.status.display : "";
    return {
        [r]: parseCopyLikeDetailAuthors(e),
        [a]: [ s ],
        [o]: parseCopyLikeDetailTags(e),
        [n]: [ l ]
    };
}

function resolveCopyLikeTagAction(e, t, i) {
    const r = i || {}, a = r.categoryNamespace || "标签", o = r.authorNamespace || "作者", n = r.unsupportedError || "未支持此类Tag检索";
    if (e === a) return {
        action: "category",
        keyword: `${t}`,
        param: null
    };
    if (e === o) return {
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
    const t = __veneraGetRuntimeGlobal(), i = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(i.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(i.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(i.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(i.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(i.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${r}/${a}/${o}@${n}`;
    const u = s ? `${s}/${l}` : l;
    return `${r}/${a}/${o}@${n}/${l.startsWith(`${s}/`) ? l : u}`;
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
