class Picacg extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Picacg", this.key = "picacg", this.version = "1.0.5",
        this.minAppVersion = "1.0.0", this.url = resolvePluginUpdateUrl("picacg.js"), this.apiKey = "C69BAF41DA5ABD1FFEDC6D2FEA56B",
        this._routes = null, this.account = {
            reLogin: async () => {
                if (!this.isLogged) throw new Error("Not logged in");
                let e = this.loadData("account");
                if (!Array.isArray(e)) throw new Error("Failed to reLogin: Invalid account data");
                let t = e[0], r = e[1];
                return await this.account.login(t, r);
            },
            login: async (e, t) => {
                const r = this.routes.authSignInRequest();
                let o = await Network.post(this.buildRequestUrl(r.path), this.buildRequestHeaders("POST", r), {
                    email: e,
                    password: t
                });
                if (200 === o.status) {
                    var a;
                    let e = JSON.parse(o.body);
                    if (null == (a = e.data) || !a.token) throw "Failed to get token\nResponse: " + o.body;
                    return this.saveData("token", e.data.token), "ok";
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
            load: async e => {
                if (!this.isLogged) throw "Not logged in";
                const t = this.routes.randomComicsRequest();
                let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let o = JSON.parse(r.body), a = [];
                return o.data.comics.forEach(e => {
                    a.push(this.parseComic(e));
                }), {
                    comics: a
                };
            }
        }, {
            title: "Picacg Latest",
            type: "multiPageComicList",
            load: async e => {
                if (!this.isLogged) throw "Not logged in";
                const t = this.routes.latestComicsRequest({
                    page: e,
                    sort: "dd"
                });
                let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let o = JSON.parse(r.body), a = [];
                return o.data.comics.docs.forEach(e => {
                    a.push(this.parseComic(e));
                }), {
                    comics: a
                };
            }
        }, {
            title: "Picacg H24",
            type: "multiPageComicList",
            load: async e => {
                if (!this.isLogged) throw "Not logged in";
                const t = this.routes.leaderboardRequest({
                    option: "H24"
                });
                let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let o = JSON.parse(r.body), a = [];
                return o.data.comics.forEach(e => {
                    a.push(this.parseComic(e));
                }), {
                    comics: a
                };
            }
        }, {
            title: "Picacg D7",
            type: "multiPageComicList",
            load: async e => {
                if (!this.isLogged) throw "Not logged in";
                const t = this.routes.leaderboardRequest({
                    option: "D7"
                });
                let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let o = JSON.parse(r.body), a = [];
                return o.data.comics.forEach(e => {
                    a.push(this.parseComic(e));
                }), {
                    comics: a
                };
            }
        }, {
            title: "Picacg D30",
            type: "multiPageComicList",
            load: async e => {
                if (!this.isLogged) throw "Not logged in";
                const t = this.routes.leaderboardRequest({
                    option: "D30"
                });
                let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                if (401 === r.status && (await this.account.reLogin(), r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")))),
                200 !== r.status) throw "Invalid status code: " + r.status;
                let o = JSON.parse(r.body), a = [];
                return o.data.comics.forEach(e => {
                    a.push(this.parseComic(e));
                }), {
                    comics: a
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
            load: async (e, t, r, o) => {
                let a = null != t ? t : "c";
                const i = this.routes.categoryComicsRequest({
                    page: o,
                    type: a,
                    category: encodeURIComponent(e),
                    sort: r[0]
                });
                let s = await Network.get(this.buildRequestUrl(i.path), this.buildRequestHeaders("GET", i, this.loadData("token")));
                if (401 === s.status && (await this.account.reLogin(), s = await Network.get(this.buildRequestUrl(i.path), this.buildRequestHeaders("GET", i, this.loadData("token")))),
                200 !== s.status) throw "Invalid status code: " + s.status;
                let l = JSON.parse(s.body), n = [];
                return l.data.comics.docs.forEach(e => {
                    n.push(this.parseComic(e));
                }), {
                    comics: n,
                    maxPage: l.data.comics.pages
                };
            },
            optionList: [ {
                options: [ "dd-New to old", "da-Old to new", "ld-Most likes", "vd-Most nominated" ]
            } ],
            ranking: {
                options: [ "H24-Day", "D7-Week", "D30-Month" ],
                load: async (e, t) => {
                    const r = this.routes.leaderboardRequest({
                        option: e
                    });
                    let o = await Network.get(this.buildRequestUrl(r.path), this.buildRequestHeaders("GET", r, this.loadData("token")));
                    if (401 === o.status && (await this.account.reLogin(), o = await Network.get(this.buildRequestUrl(r.path), this.buildRequestHeaders("GET", r, this.loadData("token")))),
                    200 !== o.status) throw "Invalid status code: " + o.status;
                    let a = JSON.parse(o.body), i = [];
                    return a.data.comics.forEach(e => {
                        i.push(this.parseComic(e));
                    }), {
                        comics: i,
                        maxPage: 1
                    };
                }
            }
        }, this.search = {
            load: async (e, t, r) => {
                const o = this.routes.advancedSearchRequest({
                    page: r
                });
                let a = await Network.post(this.buildRequestUrl(o.path), this.buildRequestHeaders("POST", o, this.loadData("token")), JSON.stringify({
                    keyword: e,
                    sort: t[0]
                }));
                if (401 === a.status && (await this.account.reLogin(), a = await Network.post(this.buildRequestUrl(o.path), this.buildRequestHeaders("POST", o, this.loadData("token")), JSON.stringify({
                    keyword: e,
                    sort: t[0]
                }))), 200 !== a.status) throw "Invalid status code: " + a.status;
                let i = JSON.parse(a.body), s = [];
                return i.data.comics.docs.forEach(e => {
                    s.push(this.parseComic(e));
                }), {
                    comics: s,
                    maxPage: i.data.comics.pages
                };
            },
            optionList: [ {
                options: [ "dd-New to old", "da-Old to new", "ld-Most likes", "vd-Most nominated" ],
                label: "Sort"
            } ]
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, r) => {
                const o = this.routes.comicFavoriteRequest({
                    comicId: e
                });
                let a = await Network.post(this.buildRequestUrl(o.path), this.buildRequestHeaders("POST", o, this.loadData("token")), "{}");
                if (401 === a.status) throw "Login expired";
                if (200 !== a.status) throw "Invalid status code: " + a.status;
                return "ok";
            },
            loadComics: async (e, t) => {
                let r = this.loadSetting("favoriteSort");
                const o = this.routes.userFavoritesRequest({
                    page: e,
                    sort: r
                });
                let a = await Network.get(this.buildRequestUrl(o.path), this.buildRequestHeaders("GET", o, this.loadData("token")));
                if (401 === a.status) throw "Login expired";
                if (200 !== a.status) throw "Invalid status code: " + a.status;
                let i = JSON.parse(a.body), s = [];
                return i.data.comics.docs.forEach(e => {
                    s.push(this.parseComic(e));
                }), {
                    comics: s,
                    maxPage: i.data.comics.pages
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                var t, r;
                let o, a, i, s = async () => {
                    const t = this.routes.comicInfoRequest({
                        comicId: e
                    });
                    let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                    if (200 !== r.status) throw "Invalid status code: " + r.status;
                    return JSON.parse(r.body).data.comic;
                }, l = async () => {
                    let t = new Map, r = 1, o = 1, a = [];
                    for (;;) {
                        const t = this.routes.comicEpsRequest({
                            comicId: e,
                            page: r
                        });
                        let o = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                        if (200 !== o.status) throw "Invalid status code: " + o.status;
                        let i = JSON.parse(o.body);
                        if (a.push(...i.data.eps.docs), i.data.eps.pages === r) break;
                        r++;
                    }
                    return a.sort((e, t) => e.order - t.order), a.forEach(e => {
                        t.set(o.toString(), e.title), o++;
                    }), t;
                }, n = async () => {
                    const t = this.routes.comicRecommendationRequest({
                        comicId: e
                    });
                    let r = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                    if (200 !== r.status) throw "Invalid status code: " + r.status;
                    let o = JSON.parse(r.body), a = [];
                    return o.data.comics.forEach(e => {
                        a.push(this.parseComic(e));
                    }), a;
                };
                try {
                    [o, a, i] = await Promise.all([ s(), l(), n() ]);
                } catch (e) {
                    throw "Invalid status code: 401" === e && (await this.account.reLogin(), [o, a, i] = await Promise.all([ s(), l(), n() ])),
                    e;
                }
                let u = {};
                o.author && (u.Author = [ o.author ]), o.chineseTeam && (u["Chinese Team"] = [ o.chineseTeam ]);
                let c = new Date(o.updated_at), d = c.getFullYear() + "-" + (c.getMonth() + 1) + "-" + c.getDate();
                return new ComicDetails({
                    title: o.title,
                    cover: o.thumb.fileServer + "/static/" + o.thumb.path,
                    description: o.description,
                    tags: {
                        ...u,
                        Categories: o.categories,
                        Tags: o.tags
                    },
                    chapters: a,
                    isFavorite: null != (t = o.isFavourite) && t,
                    isLiked: null != (r = o.isLiked) && r,
                    recommend: i,
                    commentCount: o.commentsCount,
                    likesCount: o.likesCount,
                    uploader: o._creator.name,
                    updateTime: d,
                    maxPage: o.pagesCount
                });
            },
            loadEp: async (e, t) => {
                let r = [], o = 1;
                for (;;) {
                    const a = this.routes.comicEpPagesRequest({
                        comicId: e,
                        epId: t,
                        page: o
                    });
                    let i = await Network.get(this.buildRequestUrl(a.path), this.buildRequestHeaders("GET", a, this.loadData("token")));
                    if (200 !== i.status) throw "Invalid status code: " + i.status;
                    let s = JSON.parse(i.body);
                    if (s.data.pages.docs.forEach(e => {
                        r.push(e.media.fileServer + "/static/" + e.media.path);
                    }), s.data.pages.pages === o) break;
                    o++;
                }
                return {
                    images: r
                };
            },
            likeComic: async (e, t) => {
                const r = this.routes.comicLikeRequest({
                    comicId: e
                });
                var o = await Network.post(this.buildRequestUrl(r.path), this.buildRequestHeaders("POST", r, this.loadData("token")), {});
                if (200 !== o.status) throw "Invalid status code: " + o.status;
                return "ok";
            },
            loadComments: async (e, t, r, o) => {
                function a(e) {
                    var t;
                    return new Comment({
                        userName: e._user.name,
                        avatar: e._user.avatar ? e._user.avatar.fileServer + "/static/" + e._user.avatar.path : void 0,
                        id: e._id,
                        content: e.content,
                        isLiked: e.isLiked,
                        score: null != (t = e.likesCount) ? t : 0,
                        replyCount: e.commentsCount,
                        time: e.created_at
                    });
                }
                let i = [], s = 1;
                if (o) {
                    const e = this.routes.commentChildrenRequest({
                        replyTo: o,
                        page: r
                    });
                    let t = await Network.get(this.buildRequestUrl(e.path), this.buildRequestHeaders("GET", e, this.loadData("token")));
                    if (200 !== t.status) throw "Invalid status code: " + t.status;
                    let l = JSON.parse(t.body);
                    l.data.comments.docs.forEach(e => {
                        i.push(a(e));
                    }), s = l.data.comments.pages;
                } else {
                    const t = this.routes.comicCommentsRequest({
                        comicId: e,
                        page: r
                    });
                    let o = await Network.get(this.buildRequestUrl(t.path), this.buildRequestHeaders("GET", t, this.loadData("token")));
                    if (200 !== o.status) throw "Invalid status code: " + o.status;
                    let l = JSON.parse(o.body);
                    l.data.comments.docs.forEach(e => {
                        i.push(a(e));
                    }), s = l.data.comments.pages;
                }
                return {
                    comments: i,
                    maxPage: s
                };
            },
            sendComment: async (e, t, r, o) => {
                if (o) {
                    const e = this.routes.commentReplyRequest({
                        replyTo: o
                    });
                    let t = await Network.post(this.buildRequestUrl(e.path), this.buildRequestHeaders("POST", e, this.loadData("token")), JSON.stringify({
                        content: r
                    }));
                    if (200 !== t.status) throw "Invalid status code: " + t.status;
                } else {
                    const t = this.routes.comicCommentRequest({
                        comicId: e
                    });
                    let o = await Network.post(this.buildRequestUrl(t.path), this.buildRequestHeaders("POST", t, this.loadData("token")), JSON.stringify({
                        content: r
                    }));
                    if (200 !== o.status) throw "Invalid status code: " + o.status;
                }
                return "ok";
            },
            likeComment: async (e, t, r, o) => {
                const a = this.routes.commentLikeRequest({
                    commentId: r
                });
                let i = await Network.post(this.buildRequestUrl(a.path), this.buildRequestHeaders("POST", a, this.loadData("token")), "{}");
                if (200 !== i.status) throw "Invalid status code: " + i.status;
                return "ok";
            },
            onClickTag: (e, t) => resolvePicacgTagAction(e, t)
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
    createSignature(e, t, r, o) {
        let a = e + r + t + o + this.apiKey, i = Convert.encodeUtf8("~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn"), s = Convert.encodeUtf8(a.toLowerCase());
        return Convert.hmacString(i, s, "sha256");
    }
    buildHeaders(e, t, r) {
        let o = createUuid().replace(/-/g, ""), a = ((new Date).getTime() / 1e3).toFixed(0), i = this.createSignature(t, o, a, e.toUpperCase());
        return {
            "api-key": "C69BAF41DA5ABD1FFEDC6D2FEA56B",
            accept: "application/vnd.picacomic.com.v1+json",
            "app-channel": this.loadSetting("appChannel"),
            authorization: null != r ? r : "",
            time: a,
            nonce: o,
            "app-version": "2.2.1.3.3.4",
            "app-uuid": "defaultUuid",
            "image-quality": this.loadSetting("imageQuality"),
            "app-platform": "android",
            "app-build-version": "45",
            "Content-Type": "application/json; charset=UTF-8",
            "user-agent": "okhttp/3.8.1",
            version: "v1.4.1",
            Host: "picaapi.picacomic.com",
            signature: i
        };
    }
    get routes() {
        return this._routes || (this._routes = createPicacgRouteHelpers()), this._routes;
    }
    buildRequestUrl(e) {
        return buildPicacgEndpointUrl(this.loadSetting("base_url"), e);
    }
    buildRequestHeaders(e, t, r) {
        return this.buildHeaders(e, t.signaturePath, r);
    }
    parseComic(e) {
        var t, r, o;
        let a = [];
        return a.push(...null != (t = e.tags) ? t : []), a.push(...null != (r = e.categories) ? r : []),
        new Comic({
            id: e._id,
            title: e.title,
            subTitle: e.author,
            cover: e.thumb.fileServer + "/static/" + e.thumb.path,
            tags: a,
            description: `${null != (o = e.totalLikes) ? o : e.likesCount} likes`,
            maxPage: e.pagesCount
        });
    }
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
    const s = buildWebSourceQuery(r);
    return s ? `${i}${i.includes("?") ? "&" : "?"}${s}` : i;
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), o = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), a = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), i = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), s = joinSelfHostedRoutePath(r, [ "series" ]), l = joinSelfHostedRoutePath(r, [ "books" ]), n = joinSelfHostedRoutePath(r, [ "collections" ]);
    return {
        apiV1Root: r,
        apiV2Root: o,
        seriesWebRoot: a,
        booksWebRoot: i,
        librariesPath: () => joinSelfHostedRoutePath(r, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(r, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(r, [ "languages" ]),
        collectionsPath: () => n,
        genresPath: () => joinSelfHostedRoutePath(r, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(o, [ "users", "me" ]),
        seriesPath: () => s,
        latestSeriesPath: () => joinSelfHostedRoutePath(s, [ "latest" ]),
        updatedSeriesPath: () => joinSelfHostedRoutePath(s, [ "updated" ]),
        collectionSeriesPath: e => joinSelfHostedRoutePath(n, [ e, "series" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(s, [ e ]),
        seriesBooksPath: e => joinSelfHostedRoutePath(s, [ e, "books" ]),
        seriesThumbnailPath: e => joinSelfHostedRoutePath(s, [ e, "thumbnail" ]),
        seriesWebPath: e => joinSelfHostedRoutePath(a, [ e ]),
        bookDetailsPath: e => joinSelfHostedRoutePath(l, [ e ]),
        bookThumbnailPath: e => joinSelfHostedRoutePath(l, [ e, "thumbnail" ]),
        bookPagesPath: e => joinSelfHostedRoutePath(l, [ e, "pages" ]),
        bookPageImagePath: (e, t) => joinSelfHostedRoutePath(l, [ e, "pages", t ]),
        bookWebPath: e => joinSelfHostedRoutePath(i, [ e ])
    };
}

function createKavitaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${r}/Library`), a = normalizeSelfHostedRoutePath(t.metadataRoot, `${r}/Metadata`), i = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${r}/metadata`), s = normalizeSelfHostedRoutePath(t.accountRoot, `${r}/Account`), l = normalizeSelfHostedRoutePath(t.seriesRoot, `${r}/Series`), n = normalizeSelfHostedRoutePath(t.imageRoot, `${r}/Image`), u = normalizeSelfHostedRoutePath(t.readerRoot, `${r}/Reader`), c = normalizeSelfHostedRoutePath(t.searchRoot, `${r}/Search`);
    return {
        apiRoot: r,
        libraryRoot: o,
        metadataRoot: a,
        metadataLegacyRoot: i,
        accountRoot: s,
        seriesRoot: l,
        imageRoot: n,
        readerRoot: u,
        searchRoot: c,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(i, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(s, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(l, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(l, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(l, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(l, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(n, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(l, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(u, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(c, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = "string" == typeof t ? t : "";
    let i = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : a);
    if (!i) return i;
    const s = "string" == typeof o.defaultScheme ? o.defaultScheme.trim() : "";
    return s && !/^https?:\/\//i.test(i) && (i = `${s.replace(/:$/, "")}://${i}`), normalizeSelfHostedBaseUrl(i);
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

Picacg.defaultApiUrl = "https://picaapi.picacomic.com", "undefined" != typeof module && module && module.exports && (module.exports = {
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
    const i = o.mapping && "object" == typeof o.mapping ? o.mapping : {}, s = String(null == t ? "" : t), l = i[s], n = "function" == typeof o.keywordFormatter ? o.keywordFormatter(s, l, e) : s, u = "function" == typeof o.paramFormatter ? o.paramFormatter(s, l, e) : String(l);
    return {
        action: o.action || "category",
        keyword: n,
        param: u
    };
}

function createMappedCategoryTagActionResolver(e) {
    return (t, r) => resolveMappedCategoryTagAction(t, r, e);
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
    const a = o && "object" == typeof o && !Array.isArray(o) ? o : {}, i = a.headers || e.headers, s = await Network.get(e.buildUrl(t, r), i);
    return ensureSelfHostedHttpOk(s, a), parseSelfHostedJsonBody(s.body);
}

async function postSelfHostedJson(e, t, r, o, a) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const i = a && "object" == typeof a && !Array.isArray(a) ? a : {}, s = i.headers || e.headers, l = await Network.post(e.buildUrl(t, r), s, o);
    return ensureSelfHostedHttpOk(l, i), {
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

"undefined" != typeof module && module && module.exports && (module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions,
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash,
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    readSelfHostedOffset,
    updateSelfHostedOffset,
    pluginSourcePagingApi,
    pluginSourceWebApi,
    pluginSourceSelfHostedPathApi,
    pluginSourceSelfHostedRouteApi,
    pluginSourceContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver
}), ManagedRequestClient.prototype.get = function(e, t, r) {
    return this.send("GET", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.post = function(e, t, r, o) {
    return this.send("POST", e, t || {}, null == r ? null : r, o || {});
}, ManagedRequestClient.prototype.head = function(e, t, r) {
    return this.send("HEAD", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.send = async function(e, t, r, o, a) {
    const i = this.source, s = a && "object" == typeof a && !Array.isArray(a) ? a : {}, l = null == s.mutation ? "GET" !== e : !0 === s.mutation, n = s.requestKey || defaultRequestKey(e, t, o, l), u = "function" == typeof this.hooks.domainKeyResolver ? this.hooks.domainKeyResolver : defaultManagedDomainKey, c = {
        action: s.action || `${e} ${t}`,
        requestKey: n,
        domainKey: s.domainKey || u(t, e, o, s, i, this),
        expectedStatus: null == s.expectedStatus ? 200 : s.expectedStatus,
        maxRetries: null == s.maxRetries ? "GET" === e ? 1 : 0 : s.maxRetries,
        cooldownMs: null == s.cooldownMs ? 6e4 : s.cooldownMs,
        classifyBody: null == s.classifyBody || s.classifyBody,
        mutation: l,
        allowDedup: null == s.allowDedup ? !l : s.allowDedup
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
    const s = Math.max(0, a.maxRetries) + 1;
    for (;i < s; ) {
        let l;
        i += 1;
        try {
            l = await this._dispatch(e, t, r, o, a);
        } catch (e) {
            if (i >= s) throw defaultManagedRequestError(this.source, a.action, e);
            continue;
        }
        if (this._shouldCooldown(l, a)) throw this._markCooldown(a.domainKey, a.cooldownMs),
        defaultManagedResponseError(this.source, a.action, l);
        if (l.status === a.expectedStatus) return l;
        if (i >= s || a.mutation) throw defaultManagedResponseError(this.source, a.action, l);
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

function createSelfHostedReferenceCacheFeature(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = Number(t.ttlMs || 3e5), o = String(t.metaTimestampKey || ""), a = t.resetData && "object" == typeof t.resetData ? t.resetData : {}, i = "function" == typeof t.hasToken ? t.hasToken : () => !1, s = "function" == typeof t.loadPayload ? t.loadPayload : null, l = "function" == typeof t.savePayload ? t.savePayload : null, n = "function" == typeof t.shouldRethrow ? t.shouldRethrow : null;
    if (!o || !s || !l) throw new Error("Invalid createSelfHostedReferenceCacheFeature options");
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
            const t = await s(e);
            await l(e, t, a), e.saveData(o, a);
        } catch (t) {
            if (u(e), n && n(t, e)) throw t;
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.partName || ""), o = String(t.storageKey || ""), a = "function" == typeof t.getLabel ? t.getLabel : null, i = "function" == typeof t.getCategory ? t.getCategory : null, s = "function" == typeof t.getParam ? t.getParam : null, l = !0 === t.usePageJumpTarget, n = "function" == typeof t.getSource ? t.getSource : null;
    if (!(r && o && a && i && s)) throw new Error("Invalid createStoredCategoryPart options");
    return {
        name: r,
        type: "dynamic",
        loader: function() {
            const e = n ? n() : this, t = e && "function" == typeof e.loadData ? e.loadData(o) : null;
            if (!Array.isArray(t) || !t.length) return [];
            const r = [];
            for (const e of t) {
                const t = a(e), o = i(e), n = s(e);
                if (!t || !o) continue;
                const u = {
                    category: o,
                    param: null == n ? null : n
                };
                let c;
                c = l && "function" == typeof PageJumpTarget ? new PageJumpTarget({
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.path || "/api/search"), o = "function" == typeof t.getOffsetKey ? t.getOffsetKey : null, a = "function" == typeof t.buildQuery ? t.buildQuery : null, i = "function" == typeof t.mapComic ? t.mapComic : null, s = "function" == typeof t.onResponse ? t.onResponse : null, l = String(t.statusErrorPrefix || "Invalid status code");
    if (!o || !a || !i) throw new Error("Invalid createOffsetSearchLoader options");
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("runOffsetSearch requires plugin source");
        const n = t && "object" == typeof t && !Array.isArray(t) ? t : {}, u = Number(n.page || 1), c = stripSelfHostedTrailingSlash(e.baseUrl), d = o(n), p = readSelfHostedOffset(e, d, u), h = buildSelfHostedQueryFromSource(a(n, p)), m = h ? `${c}${r}?${h}` : `${c}${r}`, y = await Network.get(m, e.headers);
        if (200 !== y.status) throw `${l}: ${y.status}`;
        const g = parseSelfHostedJsonBody(y.body) || {}, f = Array.isArray(g.data) ? g.data : [], C = f.map(t => i(t, {
            source: e,
            base: c,
            input: n
        })), S = f.length;
        updateSelfHostedOffset(e, d, S);
        const k = "number" == typeof g.recordsFiltered && g.recordsFiltered >= 0 ? g.recordsFiltered : p + S, L = S || 1, P = Math.max(1, Math.ceil(k / L));
        return s && s({
            source: e,
            input: n,
            start: p,
            returned: S,
            data: g,
            list: f,
            comics: C
        }), {
            comics: C,
            maxPage: P,
            data: g
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
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = "function" == typeof o.transform ? o.transform : e => e, s = toSelfHostedTagArray(e, o), l = String(t || "");
    for (const e of s) if (startsWithSelfHostedTagPrefix(e, l, a)) return i(String(e).slice(l.length).trim(), e);
    return null;
}

function removeSelfHostedTagsByPrefix(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = toSelfHostedTagArray(e, o), s = Array.isArray(t) ? t.map(e => String(e)) : [ String(t || "") ];
    return i.filter(e => !s.some(t => startsWithSelfHostedTagPrefix(e, t, a)));
}

function filterSelfHostedDisplayTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = Array.isArray(r.blockedPrefixes) ? r.blockedPrefixes : [], a = !0 === r.caseSensitive, i = !1 !== r.excludeUrlLike, s = "function" == typeof r.extraFilter ? r.extraFilter : null, l = toSelfHostedTagArray(e, r), n = [];
    for (const e of l) o.some(t => startsWithSelfHostedTagPrefix(e, t, a)) || i && String(e).includes("://") || s && !s(e) || n.push(e);
    return n;
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
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.sourceNamespace || "source").toLowerCase(), a = String(r.sourceScheme || "https").replace(/:$/, ""), i = new Set(Array.isArray(r.skipKeys) ? r.skipKeys.map(e => String(e)) : []), s = [];
    if (!e || "object" != typeof e) return s;
    for (const t of Object.keys(e)) {
        if (i.has(t)) continue;
        const r = e[t];
        if (!Array.isArray(r)) continue;
        const l = [];
        for (const e of r) if ("string" == typeof e) if (e.includes("://")) s.push(e); else {
            if (String(t).toLowerCase() === o) {
                let t = e;
                t.startsWith("//") ? t = `${a}:${t}` : /^https?:\/\//i.test(t) || (t = `${a}://${t}`),
                s.push(t);
                continue;
            }
            l.push(e);
        } else l.push(e);
        e[t] = l;
    }
    return s;
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
            const s = t.describe({
                sourceComic: e,
                comic: r,
                author: o,
                authorCount: a
            });
            null != s && (i.description = s);
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
    unwrapCopyLikeComic,
    readCopyLikePath,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
    createCopyLikeComicParser,
    createHtmlDocument,
    parserCopyLikeApi,
    parserHtmlApi,
    parserSupportApi
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
    const r = String(e || "").replace(/\/+$/, ""), o = String(t || "");
    return o ? o.startsWith("http://") || o.startsWith("https://") ? o : o.startsWith("/") ? `${r}${o}` : `${r}/${o}` : r;
}

function buildCopyLikeQueryString(e) {
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const e = r[0], o = r[1];
        null != e && null != o && t.push(`${String(e)}=${String(o)}`);
    }
    return t.join("&");
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
    const r = t || {}, o = r.authorNamespace || "作者", a = r.updateNamespace || "更新", i = r.tagNamespace || "标签", s = r.statusNamespace || "状态", l = e && e.datetime_updated ? e.datetime_updated : "", n = e && e.status && e.status.display ? e.status.display : "";
    return {
        [o]: parseCopyLikeDetailAuthors(e),
        [a]: [ l ],
        [i]: parseCopyLikeDetailTags(e),
        [s]: [ n ]
    };
}

function resolveCopyLikeTagAction(e, t, r) {
    const o = r || {}, a = o.categoryNamespace || "标签", i = o.authorNamespace || "作者", s = o.unsupportedError || "未支持此类Tag检索";
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
    throw s;
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
    return buildCopyLikeHomeSections(await getRuntimeJson(`${e.apiUrl}${e.endpoint || "/api/v3/h5/homeIndex"}`, e.headers, e.context || "copy_like home"), e.sections || [], e.parseComic);
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
        const i = Array.isArray(o) ? o : [], s = !1 === e.normalizeOptions ? i : normalizeStarOptions(i), l = e.getApiUrl();
        if ("function" == typeof e.isRankingCategory && e.isRankingCategory(t, r)) return buildCopyLikeRankingUrl({
            apiUrl: l,
            page: a,
            limit: null == e.rankingLimit ? 30 : e.rankingLimit,
            freeType: e.rankingFreeType,
            audienceType: null == e.rankingAudienceOptionIndex ? void 0 : i[e.rankingAudienceOptionIndex],
            region: null == e.rankingRegionOptionIndex ? void 0 : i[e.rankingRegionOptionIndex],
            dateType: null == e.rankingDateOptionIndex ? void 0 : i[e.rankingDateOptionIndex]
        });
        if ("function" == typeof e.isHomepageCategory && e.isHomepageCategory(t, r)) return buildCopyLikeHomeIndexComicsUrl({
            apiUrl: l,
            page: a,
            limit: null == e.homepageLimit ? 20 : e.homepageLimit,
            top: r,
            ordering: null == e.homepageOrderingOptionIndex ? void 0 : i[e.homepageOrderingOptionIndex]
        });
        const n = normalizeCopyLikeCategoryParam(t, e.categoryParamMap, r);
        return buildCopyLikeComicsUrl({
            apiUrl: l,
            page: a,
            limit: null == e.themedLimit ? 30 : e.themedLimit,
            freeType: e.themedFreeType,
            ordering: null == e.themedOrderingOptionIndex ? void 0 : s[e.themedOrderingOptionIndex],
            theme: n || "",
            top: null == e.themedTopOptionIndex ? void 0 : s[e.themedTopOptionIndex]
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
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const e = r[0], o = r[1];
        null != e && null != o && t.push(`${String(e)}=${String(o)}`);
    }
    return t.join("&");
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
    const t = (e && "object" == typeof e && !Array.isArray(e) ? e : {}).rankingCategory || PICACG_RANKING_CATEGORY;
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
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${o}/${a}/${i}@${s}`;
    const u = l ? `${l}/${n}` : n;
    return `${o}/${a}/${i}@${s}/${n.startsWith(`${l}/`) ? n : u}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
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
    buildSelfHostedEmojiRatingTag,
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
    createCopyLikeSearchLoaderFeature,
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
    loadMhLikeBaseComicInfoFeature,
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction,
    pluginFeatureGenericApi,
    pluginFeatureCopyLikeApi,
    pluginFeatureMhLikeApi,
    pluginFeaturePicacgApi,
    pluginFeatureContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
