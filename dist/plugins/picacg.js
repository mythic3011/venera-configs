class Picacg extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "Picacg", this.key = "picacg", this.version = "1.0.5",
        this.minAppVersion = "1.0.0", this.url = resolvePluginUpdateUrl("picacg.js"), this.apiKey = "C69BAF41DA5ABD1FFEDC6D2FEA56B",
        this._routes = null, this.account = {
            reLogin: async () => {
                if (!this.isLogged) throw new Error("Not logged in");
                let t = this.loadData("account");
                if (!Array.isArray(t)) throw new Error("Failed to reLogin: Invalid account data");
                let e = t[0], a = t[1];
                return await this.account.login(e, a);
            },
            login: async (t, e) => {
                const a = this.routes.authSignInRequest();
                let s = await Network.post(this.buildRequestUrl(a.path), this.buildRequestHeaders("POST", a), {
                    email: t,
                    password: e
                });
                if (200 === s.status) {
                    var i;
                    let t = JSON.parse(s.body);
                    if (null == (i = t.data) || !i.token) throw "Failed to get token\nResponse: " + s.body;
                    return this.saveData("token", t.data.token), "ok";
                }
                throw "Failed to login";
            },
            logout: () => {
                this.deleteData("token");
            },
            registerWebsite: "https://manhuabika.com/pregister/?"
        }, this.explore = [ {
            title: "Picacg Random",
            type: "multiPageComicList",
            load: async t => {
                if (!this.isLogged) throw "Not logged in";
                const e = this.routes.randomComicsRequest();
                let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")))),
                200 !== a.status) throw "Invalid status code: " + a.status;
                let s = JSON.parse(a.body), i = [];
                return s.data.comics.forEach(t => {
                    i.push(this.parseComic(t));
                }), {
                    comics: i
                };
            }
        }, {
            title: "Picacg Latest",
            type: "multiPageComicList",
            load: async t => {
                if (!this.isLogged) throw "Not logged in";
                const e = this.routes.latestComicsRequest({
                    page: t,
                    sort: "dd"
                });
                let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")))),
                200 !== a.status) throw "Invalid status code: " + a.status;
                let s = JSON.parse(a.body), i = [];
                return s.data.comics.docs.forEach(t => {
                    i.push(this.parseComic(t));
                }), {
                    comics: i
                };
            }
        }, {
            title: "Picacg H24",
            type: "multiPageComicList",
            load: async t => {
                if (!this.isLogged) throw "Not logged in";
                const e = this.routes.leaderboardRequest({
                    option: "H24"
                });
                let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")))),
                200 !== a.status) throw "Invalid status code: " + a.status;
                let s = JSON.parse(a.body), i = [];
                return s.data.comics.forEach(t => {
                    i.push(this.parseComic(t));
                }), {
                    comics: i
                };
            }
        }, {
            title: "Picacg D7",
            type: "multiPageComicList",
            load: async t => {
                if (!this.isLogged) throw "Not logged in";
                const e = this.routes.leaderboardRequest({
                    option: "D7"
                });
                let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")))),
                200 !== a.status) throw "Invalid status code: " + a.status;
                let s = JSON.parse(a.body), i = [];
                return s.data.comics.forEach(t => {
                    i.push(this.parseComic(t));
                }), {
                    comics: i
                };
            }
        }, {
            title: "Picacg D30",
            type: "multiPageComicList",
            load: async t => {
                if (!this.isLogged) throw "Not logged in";
                const e = this.routes.leaderboardRequest({
                    option: "D30"
                });
                let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")))),
                200 !== a.status) throw "Invalid status code: " + a.status;
                let s = JSON.parse(a.body), i = [];
                return s.data.comics.forEach(t => {
                    i.push(this.parseComic(t));
                }), {
                    comics: i
                };
            }
        } ], this.category = {
            title: "Picacg",
            parts: [ {
                name: "主题",
                type: "fixed",
                categories: [ "大家都在看", "大濕推薦", "那年今天", "官方都在看", "嗶咔漢化", "全彩", "長篇", "同人", "短篇", "圓神領域", "碧藍幻想", "CG雜圖", "英語 ENG", "生肉", "純愛", "百合花園", "耽美花園", "偽娘哲學", "後宮閃光", "扶他樂園", "單行本", "姐姐系", "妹妹系", "SM", "性轉換", "足の恋", "人妻", "NTR", "強暴", "非人類", "艦隊收藏", "Love Live", "SAO 刀劍神域", "Fate", "東方", "WEBTOON", "禁書目錄", "歐美", "Cosplay", "重口地帶" ],
                itemType: "category"
            } ],
            enableRankingPage: !0
        }, this.categoryComics = {
            load: async (t, e, a, s) => {
                let i = null != e ? e : "c";
                const o = this.routes.categoryComicsRequest({
                    page: s,
                    type: i,
                    category: encodeURIComponent(t),
                    sort: a[0]
                });
                let r = await Network.get(this.buildRequestUrl(o.path), this.buildRequestHeaders("GET", o, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(o.path), this.buildRequestHeaders("GET", o, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let c = JSON.parse(r.body), u = [];
                return c.data.comics.docs.forEach(t => {
                    u.push(this.parseComic(t));
                }), {
                    comics: u,
                    maxPage: c.data.comics.pages
                };
            },
            optionList: [ {
                options: [ "dd-New to old", "da-Old to new", "ld-Most likes", "vd-Most nominated" ]
            } ],
            ranking: {
                options: [ "H24-Day", "D7-Week", "D30-Month" ],
                load: async (t, e) => {
                    const a = this.routes.leaderboardRequest({
                        option: t
                    });
                    let s = await Network.get(this.buildRequestUrl(a.path), this.buildRequestHeaders("GET", a, this.loadData("token")));
                    if (401 === s.status && (await this.account.reLogin(), s = await Network.get(this.buildRequestUrl(a.path), this.buildRequestHeaders("GET", a, this.loadData("token")))),
                    200 !== s.status) throw "Invalid status code: " + s.status;
                    let i = JSON.parse(s.body), o = [];
                    return i.data.comics.forEach(t => {
                        o.push(this.parseComic(t));
                    }), {
                        comics: o,
                        maxPage: 1
                    };
                }
            }
        }, this.search = {
            load: async (t, e, a) => {
                const s = this.routes.advancedSearchRequest({
                    page: a
                });
                let i = await Network.post(this.buildRequestUrl(s.path), this.buildRequestHeaders("POST", s, this.loadData("token")), JSON.stringify({
                    keyword: t,
                    sort: e[0]
                }));
                if (401 === i.status && (await this.account.reLogin(), i = await Network.post(this.buildRequestUrl(s.path), this.buildRequestHeaders("POST", s, this.loadData("token")), JSON.stringify({
                    keyword: t,
                    sort: e[0]
                }))), 200 !== i.status) throw "Invalid status code: " + i.status;
                let o = JSON.parse(i.body), r = [];
                return o.data.comics.docs.forEach(t => {
                    r.push(this.parseComic(t));
                }), {
                    comics: r,
                    maxPage: o.data.comics.pages
                };
            },
            optionList: [ {
                options: [ "dd-New to old", "da-Old to new", "ld-Most likes", "vd-Most nominated" ],
                label: "Sort"
            } ]
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (t, e, a) => {
                const s = this.routes.comicFavoriteRequest({
                    comicId: t
                });
                let i = await Network.post(this.buildRequestUrl(s.path), this.buildRequestHeaders("POST", s, this.loadData("token")), "{}");
                if (401 === i.status) throw "Login expired";
                if (200 !== i.status) throw "Invalid status code: " + i.status;
                return "ok";
            },
            loadComics: async (t, e) => {
                let a = this.loadSetting("favoriteSort");
                const s = this.routes.userFavoritesRequest({
                    page: t,
                    sort: a
                });
                let i = await Network.get(this.buildRequestUrl(s.path), this.buildRequestHeaders("GET", s, this.loadData("token")));
                if (401 === i.status) throw "Login expired";
                if (200 !== i.status) throw "Invalid status code: " + i.status;
                let o = JSON.parse(i.body), r = [];
                return o.data.comics.docs.forEach(t => {
                    r.push(this.parseComic(t));
                }), {
                    comics: r,
                    maxPage: o.data.comics.pages
                };
            }
        }, this.comic = {
            loadInfo: async t => {
                var e, a;
                let s, i, o, r = async () => {
                    const e = this.routes.comicInfoRequest({
                        comicId: t
                    });
                    let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                    if (200 !== a.status) throw "Invalid status code: " + a.status;
                    return JSON.parse(a.body).data.comic;
                }, c = async () => {
                    let e = new Map, a = 1, s = 1, i = [];
                    for (;;) {
                        const e = this.routes.comicEpsRequest({
                            comicId: t,
                            page: a
                        });
                        let s = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                        if (200 !== s.status) throw "Invalid status code: " + s.status;
                        let o = JSON.parse(s.body);
                        if (i.push(...o.data.eps.docs), o.data.eps.pages === a) break;
                        a++;
                    }
                    return i.sort((t, e) => t.order - e.order), i.forEach(t => {
                        e.set(s.toString(), t.title), s++;
                    }), e;
                }, u = async () => {
                    const e = this.routes.comicRecommendationRequest({
                        comicId: t
                    });
                    let a = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                    if (200 !== a.status) throw "Invalid status code: " + a.status;
                    let s = JSON.parse(a.body), i = [];
                    return s.data.comics.forEach(t => {
                        i.push(this.parseComic(t));
                    }), i;
                };
                try {
                    [s, i, o] = await Promise.all([ r(), c(), u() ]);
                } catch (t) {
                    throw "Invalid status code: 401" === t && (await this.account.reLogin(), [s, i, o] = await Promise.all([ r(), c(), u() ])),
                    t;
                }
                let n = {};
                s.author && (n.Author = [ s.author ]), s.chineseTeam && (n["Chinese Team"] = [ s.chineseTeam ]);
                let l = new Date(s.updated_at), d = l.getFullYear() + "-" + (l.getMonth() + 1) + "-" + l.getDate();
                return new ComicDetails({
                    title: s.title,
                    cover: s.thumb.fileServer + "/static/" + s.thumb.path,
                    description: s.description,
                    tags: {
                        ...n,
                        Categories: s.categories,
                        Tags: s.tags
                    },
                    chapters: i,
                    isFavorite: null != (e = s.isFavourite) && e,
                    isLiked: null != (a = s.isLiked) && a,
                    recommend: o,
                    commentCount: s.commentsCount,
                    likesCount: s.likesCount,
                    uploader: s._creator.name,
                    updateTime: d,
                    maxPage: s.pagesCount
                });
            },
            loadEp: async (t, e) => {
                let a = [], s = 1;
                for (;;) {
                    const i = this.routes.comicEpPagesRequest({
                        comicId: t,
                        epId: e,
                        page: s
                    });
                    let o = await Network.get(this.buildRequestUrl(i.path), this.buildRequestHeaders("GET", i, this.loadData("token")));
                    if (200 !== o.status) throw "Invalid status code: " + o.status;
                    let r = JSON.parse(o.body);
                    if (r.data.pages.docs.forEach(t => {
                        a.push(t.media.fileServer + "/static/" + t.media.path);
                    }), r.data.pages.pages === s) break;
                    s++;
                }
                return {
                    images: a
                };
            },
            likeComic: async (t, e) => {
                const a = this.routes.comicLikeRequest({
                    comicId: t
                });
                var s = await Network.post(this.buildRequestUrl(a.path), this.buildRequestHeaders("POST", a, this.loadData("token")), {});
                if (200 !== s.status) throw "Invalid status code: " + s.status;
                return "ok";
            },
            loadComments: async (t, e, a, s) => {
                function i(t) {
                    var e;
                    return new Comment({
                        userName: t._user.name,
                        avatar: t._user.avatar ? t._user.avatar.fileServer + "/static/" + t._user.avatar.path : void 0,
                        id: t._id,
                        content: t.content,
                        isLiked: t.isLiked,
                        score: null != (e = t.likesCount) ? e : 0,
                        replyCount: t.commentsCount,
                        time: t.created_at
                    });
                }
                let o = [], r = 1;
                if (s) {
                    const t = this.routes.commentChildrenRequest({
                        replyTo: s,
                        page: a
                    });
                    let e = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                    if (200 !== e.status) throw "Invalid status code: " + e.status;
                    let c = JSON.parse(e.body);
                    c.data.comments.docs.forEach(t => {
                        o.push(i(t));
                    }), r = c.data.comments.pages;
                } else {
                    const e = this.routes.comicCommentsRequest({
                        comicId: t,
                        page: a
                    });
                    let s = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                    if (200 !== s.status) throw "Invalid status code: " + s.status;
                    let c = JSON.parse(s.body);
                    c.data.comments.docs.forEach(t => {
                        o.push(i(t));
                    }), r = c.data.comments.pages;
                }
                return {
                    comments: o,
                    maxPage: r
                };
            },
            sendComment: async (t, e, a, s) => {
                if (s) {
                    const t = this.routes.commentReplyRequest({
                        replyTo: s
                    });
                    let e = await Network.post(this.buildRequestUrl(t.path), this.buildRequestHeaders("POST", t, this.loadData("token")), JSON.stringify({
                        content: a
                    }));
                    if (200 !== e.status) throw "Invalid status code: " + e.status;
                } else {
                    const e = this.routes.comicCommentRequest({
                        comicId: t
                    });
                    let s = await Network.post(this.buildRequestUrl(e.path), this.buildRequestHeaders("POST", e, this.loadData("token")), JSON.stringify({
                        content: a
                    }));
                    if (200 !== s.status) throw "Invalid status code: " + s.status;
                }
                return "ok";
            },
            likeComment: async (t, e, a, s) => {
                const i = this.routes.commentLikeRequest({
                    commentId: a
                });
                let o = await Network.post(this.buildRequestUrl(i.path), this.buildRequestHeaders("POST", i, this.loadData("token")), "{}");
                if (200 !== o.status) throw "Invalid status code: " + o.status;
                return "ok";
            },
            onClickTag: (t, e) => resolvePicacgTagAction(t, e)
        }, this.settings = {
            base_url: {
                title: "API地址(地址末尾不要添加斜杠)",
                type: "input",
                validator: null,
                default: Picacg.defaultApiUrl
            },
            imageQuality: {
                type: "select",
                title: "Image quality",
                options: [ {
                    value: "original"
                }, {
                    value: "medium"
                }, {
                    value: "low"
                } ],
                default: "original"
            },
            appChannel: {
                type: "select",
                title: "App channel",
                options: [ {
                    value: "1"
                }, {
                    value: "2"
                }, {
                    value: "3"
                } ],
                default: "3"
            },
            favoriteSort: {
                type: "select",
                title: "Favorite sort",
                options: [ {
                    value: "dd",
                    text: "New to old"
                }, {
                    value: "da",
                    text: "Old to new"
                } ],
                default: "dd"
            }
        }, this.translation = {
            zh_CN: {
                "Picacg Random": "哔咔随机",
                "Picacg Latest": "哔咔最新",
                "Picacg H24": "哔咔日榜",
                "Picacg D7": "哔咔周榜",
                "Picacg D30": "哔咔月榜",
                "New to old": "新到旧",
                "Old to new": "旧到新",
                "Most likes": "最多喜欢",
                "Most nominated": "最多指名",
                Day: "日",
                Week: "周",
                Month: "月",
                Author: "作者",
                "Chinese Team": "汉化组",
                Categories: "分类",
                Tags: "标签",
                "Image quality": "图片质量",
                "App channel": "分流",
                "Favorite sort": "收藏排序",
                Sort: "排序"
            },
            zh_TW: {
                "Picacg Random": "哔咔隨機",
                "Picacg Latest": "哔咔最新",
                "Picacg H24": "哔咔日榜",
                "Picacg D7": "哔咔周榜",
                "Picacg D30": "哔咔月榜",
                "New to old": "新到舊",
                "Old to new": "舊到新",
                "Most likes": "最多喜歡",
                "Most nominated": "最多指名",
                Day: "日",
                Week: "周",
                Month: "月",
                Author: "作者",
                "Chinese Team": "漢化組",
                Categories: "分類",
                Tags: "標籤",
                "Image quality": "圖片質量",
                "App channel": "分流",
                "Favorite sort": "收藏排序",
                Sort: "排序"
            }
        };
    }
    createSignature(t, e, a, s) {
        let i = t + a + e + s + this.apiKey, o = Convert.encodeUtf8("~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn"), r = Convert.encodeUtf8(i.toLowerCase());
        return Convert.hmacString(o, r, "sha256");
    }
    buildHeaders(t, e, a) {
        let s = createUuid().replace(/-/g, ""), i = ((new Date).getTime() / 1e3).toFixed(0), o = this.createSignature(e, s, i, t.toUpperCase());
        return {
            "api-key": "C69BAF41DA5ABD1FFEDC6D2FEA56B",
            accept: "application/vnd.picacomic.com.v1+json",
            "app-channel": this.loadSetting("appChannel"),
            authorization: null != a ? a : "",
            time: i,
            nonce: s,
            "app-version": "2.2.1.3.3.4",
            "app-uuid": "defaultUuid",
            "image-quality": this.loadSetting("imageQuality"),
            "app-platform": "android",
            "app-build-version": "45",
            "Content-Type": "application/json; charset=UTF-8",
            "user-agent": "okhttp/3.8.1",
            version: "v1.4.1",
            Host: "picaapi.picacomic.com",
            signature: o
        };
    }
    get routes() {
        return this._routes || (this._routes = createPicacgRouteHelpers()), this._routes;
    }
    buildRequestUrl(t) {
        return buildPicacgEndpointUrl(this.loadSetting("base_url"), t);
    }
    buildRequestHeaders(t, e, a) {
        return this.buildHeaders(t, e.signaturePath, a);
    }
    parseComic(t) {
        var e, a, s;
        let i = [];
        return i.push(...null != (e = t.tags) ? e : []), i.push(...null != (a = t.categories) ? a : []),
        new Comic({
            id: t._id,
            title: t.title,
            subTitle: t.author,
            cover: t.thumb.fileServer + "/static/" + t.thumb.path,
            tags: i,
            description: `${null != (s = t.totalLikes) ? s : t.likesCount} likes`,
            maxPage: t.pagesCount
        });
    }
}

Picacg.defaultApiUrl = "https://picaapi.picacomic.com";

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

function normalizePicacgBaseUrl(t, e) {
    const a = "string" == typeof e ? String(e).trim() : "", s = "string" == typeof t && t.trim() ? t.trim() : a;
    return String(s || "").replace(/\/+$/, "");
}

function buildPicacgEndpointUrl(t, e) {
    const a = normalizePicacgBaseUrl(t), s = String(e || "").replace(/^\/+/, "");
    return a ? s ? `${a}/${s}` : a : s;
}

function buildPicacgQueryString(t) {
    const e = [];
    for (const a of t || []) {
        if (!Array.isArray(a) || a.length < 2) continue;
        const t = a[0], s = a[1];
        null != t && null != s && e.push(`${String(t)}=${String(s)}`);
    }
    return e.join("&");
}

function buildPicacgPathWithQuery(t, e) {
    const a = buildPicacgQueryString(e);
    return a ? `${String(t || "")}?${a}` : String(t || "");
}

function createPicacgRequest(t, e) {
    const a = String(t || "");
    return {
        path: a,
        signaturePath: null == e ? a : String(e || "")
    };
}

function resolvePicacgTagAction(t, e, a) {
    const s = a && "object" == typeof a && !Array.isArray(a) ? a : {}, i = s.authorNamespace || PICACG_TAG_NAMESPACES.AUTHOR, o = s.categoryNamespace || PICACG_TAG_NAMESPACES.CATEGORIES;
    return t === i ? {
        action: "category",
        keyword: e,
        param: "a"
    } : t === o ? {
        action: "category",
        keyword: e,
        param: "c"
    } : {
        action: "search",
        keyword: e
    };
}

function createPicacgRouteHelpers(t) {
    const e = (t && "object" == typeof t && !Array.isArray(t) ? t : {}).rankingCategory || PICACG_RANKING_CATEGORY;
    return {
        authSignInRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.AUTH_SIGN_IN),
        randomComicsRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.COMICS_RANDOM),
        latestComicsRequest: ({page: t, sort: e}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", t ], [ "s", e ] ])),
        leaderboardRequest: ({option: t, categoryType: a}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_LEADERBOARD, [ [ "tt", t ], [ "ct", null == a ? e : a ] ])),
        categoryComicsRequest: ({page: t, type: e, category: a, sort: s}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", t ], [ e || "c", a ], [ "s", s ] ])),
        advancedSearchRequest: ({page: t}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_ADVANCED_SEARCH, [ [ "page", t ] ])),
        comicFavoriteRequest: ({comicId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/favourite`),
        userFavoritesRequest: ({page: t, sort: e}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.USERS_FAVOURITE, [ [ "page", t ], [ "s", e ] ])),
        comicInfoRequest: ({comicId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}`),
        comicEpsRequest: ({comicId: t, page: e}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/eps`, [ [ "page", e ] ])),
        comicRecommendationRequest: ({comicId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/recommendation`),
        comicEpPagesRequest: ({comicId: t, epId: e, page: a}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/order/${e}/pages`, [ [ "page", a ] ])),
        comicLikeRequest: ({comicId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/like`),
        commentChildrenRequest: ({replyTo: t, page: e}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${t}/childrens`, [ [ "page", e ] ])),
        comicCommentsRequest: ({comicId: t, page: e}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/comments`, [ [ "page", e ] ])),
        commentReplyRequest: ({replyTo: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${t}`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${t}`),
        comicCommentRequest: ({comicId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${t}/comments`, `/${PICACG_ENDPOINT_PATHS.COMICS}/${t}/comments`),
        commentLikeRequest: ({commentId: t}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${t}/like`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${t}/like`)
    };
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, e, a) {
    const s = String(null == t ? "" : t).trim() || e;
    return a ? s.replace(/^\/+|\/+$/g, "") : s;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), a = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, s = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), r = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), c = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), u = String(t || "").replace(/^\/+/, "");
    if (!u) return `${s}/${i}/${o}@${r}`;
    const n = c ? `${c}/${u}` : u;
    return `${s}/${i}/${o}@${r}/${u.startsWith(`${c}/`) ? u : n}`;
}

"undefined" != typeof module && module.exports && (module.exports = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction
});

"use strict";
