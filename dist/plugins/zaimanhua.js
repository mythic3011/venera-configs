class Zaimanhua extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "再漫画", this.key = "zaimanhua", this.version = "1.0.2",
        this.minAppVersion = "1.0.0", this.url = resolvePluginUpdateUrl("zaimanhua.js"),
        this.account = {
            login: async (t, e) => {
                try {
                    const a = Convert.hexEncode(Convert.md5(Convert.encodeUtf8(e))), s = await Network.post("https://account-api.zaimanhua.com/v1/login/passwd", {
                        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                    }, `username=${t}&passwd=${a}`), r = JSON.parse(s.body);
                    if (0 !== r.errno) throw new Error(r.errmsg);
                    return this.saveData("token", r.data.user.token), this.headers.authorization = `Bearer ${r.data.user.token}`,
                    !0;
                } catch (t) {
                    throw UI.showMessage(`登录失败: ${t.message}`), t;
                }
            },
            logout: () => {
                this.deleteData("token");
            }
        }, this.explore = [ {
            title: "再漫画 更新",
            type: "multiPageComicList",
            load: async t => {
                const e = await Network.get(this.buildUrl(`comic/update/list/0/${t}`), this.headers);
                return {
                    comics: JSON.parse(e.body).data.map(t => this.parseComic(t))
                };
            }
        } ], this.category = {
            title: "再漫画",
            parts: [ {
                name: "排行榜",
                type: "fixed",
                categories: [ "日排行", "周排行", "月排行", "总排行" ],
                itemType: "category",
                categoryParams: [ "0", "1", "2", "3" ]
            }, {
                name: "分类",
                type: "fixed",
                categories: Object.keys(Zaimanhua.categoryParamMap),
                categoryParams: Object.values(Zaimanhua.categoryParamMap),
                itemType: "category"
            } ]
        }, this.categoryComics = {
            load: async (t, e, a, s) => {
                if (t.includes("排行")) {
                    let t = await Network.get(this.buildUrl(`comic/rank/list?page=${s}&rank_type=${a}&by_time=${e}`), this.headers);
                    return {
                        comics: JSON.parse(t.body).data.map(t => this.parseComic(t)),
                        maxPage: 10
                    };
                }
                {
                    e = Zaimanhua.categoryParamMap[t] || "0";
                    let r = await Network.get(this.buildUrl(`comic/filter/list?status=${a[2]}&theme=${e}&zone=${a[3]}&cate=${a[1]}&sortType=${a[0]}&page=${s}&size=20`), this.headers);
                    const i = JSON.parse(r.body).data;
                    return {
                        comics: i.comicList.map(t => this.parseComic(t)),
                        maxPage: Math.ceil(i.totalNum / 20)
                    };
                }
            },
            optionList: [ {
                options: [ "1-更新", "2-人气" ],
                notShowWhen: null,
                showWhen: Object.keys(Zaimanhua.categoryParamMap)
            }, {
                options: [ "0-全部", "3262-少年漫画", "3263-少女漫画", "3264-青年漫画", "13626-女青漫画" ],
                notShowWhen: null,
                showWhen: Object.keys(Zaimanhua.categoryParamMap)
            }, {
                options: [ "0-全部", "2309-连载中", "2310-已完结", "29205-短篇" ],
                notShowWhen: null,
                showWhen: Object.keys(Zaimanhua.categoryParamMap)
            }, {
                options: [ "0-全部", "2304-日本", "2305-韩国", "2306-欧美", "2307-港台", "2308-内地", "8435-其他" ],
                notShowWhen: null,
                showWhen: Object.keys(Zaimanhua.categoryParamMap)
            }, {
                options: [ "0-人气", "1-吐槽", "2-订阅" ],
                notshowWhen: null,
                showWhen: [ "日排行", "周排行", "月排行", "总排行" ]
            } ]
        }, this.search = {
            load: async (t, e, a) => {
                const s = await Network.get(this.buildUrl(`search/index?keyword=${encodeURIComponent(t)}&page=${a}&sort=0&size=20`), this.headers);
                return {
                    comics: JSON.parse(s.body).data.list.map(t => this.parseComic(t))
                };
            },
            optionList: []
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (t, e, a) => {
                const s = a ? "add" : "del", r = await Network.get(this.buildUrl(`comic/sub/${s}?comic_id=${t}`), this.headers), i = JSON.parse(r.body);
                if (0 !== i.errno) throw new Error(i.errmsg || "操作失败");
                return "ok";
            },
            loadComics: async t => {
                try {
                    var e;
                    const a = await Network.get(this.buildUrl(`comic/sub/list?status=0&page=${t}&size=20`), this.headers), s = JSON.parse(a.body).data;
                    return {
                        comics: null != (e = s.subList.map(t => this.parseComic(t))) ? e : [],
                        maxPage: Math.ceil(s.total / 20)
                    };
                } catch (t) {
                    return console.error("加载收藏失败:", t), {
                        comics: [],
                        maxPage: null
                    };
                }
            }
        }, this.comic = {
            loadInfo: async t => {
                let e = await Promise.all([ Network.get(this.buildUrl(`comic/detail/${t}?channel=android`), this.headers), (async t => {
                    let e = await Network.get(this.buildUrl(`comic/sub/checkIsSub?objId=${t}&source=1`), this.headers);
                    return this.checkResponseStatus(e), JSON.parse(e.body).data.isSub;
                }).bind(this)(t) ]);
                const a = JSON.parse(e[0].body);
                if (0 !== a.errno) throw new Error(a.errmsg || "加载失败");
                const s = a.data.data, {authors: r, status: i, types: o} = s, n = t => t.map(t => t.tag_name);
                return {
                    title: s.title,
                    cover: s.cover,
                    description: s.description,
                    tags: {
                        作者: n(r),
                        状态: [ ...n(i), s.last_update_chapter_name ],
                        标签: n(o)
                    },
                    updateTime: this.formatTimestamp(s.last_updatetime),
                    chapters: (c = s.chapters, (c || []).reduce((t, e) => {
                        const a = e.title || "默认", s = (e.data || []).reverse().map(t => [ String(t.chapter_id), `${t.chapter_title.replace(/^(?:连载版?)?(\d+\.?\d*)([话卷])?$/, (t, e, a) => `第${e}${a || "话"}`)}` ]);
                        return t.set(a, new Map(s)), t;
                    }, new Map)),
                    isFavorite: e[1],
                    subId: t
                };
                var c;
            },
            loadEp: async (t, e) => {
                const a = await Network.get(this.buildUrl(`comic/chapter/${t}/${e}`), this.headers), s = JSON.parse(a.body).data.data;
                return {
                    images: s.page_url_hd || s.page_url
                };
            },
            loadComments: async (t, e, a, s) => {
                try {
                    const r = this.buildUrl(`comment/list?page=${a}&size=30&type=4&objId=${e || t}&sortBy=1`), i = await Network.get(r, this.headers);
                    this.checkResponseStatus(i);
                    const o = JSON.parse(i.body).data;
                    if (!o || !o.commentIdList || !o.commentList) return UI.showMessage("暂时没有评论，快来发表第一条吧~"),
                    {
                        comments: [],
                        maxPage: 0
                    };
                    const n = (Array.isArray(o.commentIdList) ? o.commentIdList : []).map(t => `${t || ""}`.split(",")).flat().filter(t => "" !== t.trim()), c = (() => {
                        const t = [ ...new Set(n) ].filter(t => o.commentList.hasOwnProperty(t));
                        return (s ? t.filter(t => {
                            var e;
                            return (null == (e = o.commentList[t]) ? void 0 : e.to_comment_id) == s;
                        }) : t).map(t => {
                            const e = o.commentList[t];
                            return new Comment({
                                userName: e.nickname || "匿名用户",
                                avatar: e.photo || "",
                                content: e.content || "[内容已删除]",
                                time: this.formatTimestamp(e.create_time),
                                replyCount: e.reply_amount || 0,
                                score: e.like_amount || 0,
                                id: String(t),
                                parentId: e.to_comment_id || null
                            });
                        });
                    })();
                    return 0 === c.length && UI.showMessage(s ? "该评论暂无回复" : "这里还没有评论哦~"), {
                        comments: c,
                        maxPage: Math.ceil((o.total || 0) / 30)
                    };
                } catch (t) {
                    return console.error("评论加载失败:", t), UI.showMessage(`加载评论失败: ${t.message}`), {
                        comments: [],
                        maxPage: 0
                    };
                }
            },
            sendComment: async (t, e, a, s) => {
                s || (s = 0);
                let r = await Network.post(this.buildUrl("comment/add"), {
                    ...this.headers,
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                }, `obj_id=${e}&content=${encodeURIComponent(a)}&to_comment_id=${s}&type=4`);
                this.checkResponseStatus(r);
                let i = JSON.parse(r.body);
                if (0 !== i.errno) throw new Error(i.errmsg || "加载失败");
                return "ok";
            },
            likeComment: async (t, e, a, s) => {
                let r = await Network.post(this.buildUrl("comment/addLike"), {
                    ...this.headers,
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                }, `commentId=${a}&type=4`);
                return this.checkResponseStatus(r), "ok";
            }
        }, this.settings = {
            signTask: {
                title: "每日签到",
                type: "switch",
                default: !1
            }
        };
    }
    init() {
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android) Mobile",
            authorization: `Bearer ${this.loadData("token") || ""}`
        };
    }
    buildUrl(t) {
        return this.signTask(), `https://v4api.zaimanhua.com/app/v1/${t}`;
    }
    async signTask() {
        if (!this.isLogged) return;
        if (!this.loadSetting("signTask")) return;
        const t = this.loadData("lastSign"), e = (new Date).toISOString().split("T")[0];
        if (t == e) return;
        const a = await Network.post("https://i.zaimanhua.com/lpi/v1/task/sign_in", this.headers);
        200 === a.status && (this.saveData("lastSign", e), 0 == JSON.parse(a.body).errno && UI.showMessage("签到成功"));
    }
    checkResponseStatus(t) {
        if (401 === t.status) throw new Error("登录失效");
        if (200 !== t.status) throw new Error(`请求失败: ${t.status}`);
    }
    parseComic(t) {
        const e = t => null != t ? t.toString() : "";
        return {
            id: e([ t.comic_id, t.id ].find(t => t && "0" !== t) || ""),
            title: t.title || t.name,
            subTitle: t.authors,
            cover: t.cover,
            tags: [ t.status, ...e(t.types).split("/") ].filter(Boolean),
            description: [ t.description, t.last_update_chapter_name, t.last_name ].find(t => t) || ""
        };
    }
    formatTimestamp(t) {
        return new Date(1e3 * t).toISOString().split("T")[0];
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, e, a) {
    const s = String(null == t ? "" : t).trim() || e;
    return a ? s.replace(/^\/+|\/+$/g, "") : s;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), a = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, s = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), c = String(t || "").replace(/^\/+/, "");
    if (!c) return `${s}/${r}/${i}@${o}`;
    const h = n ? `${n}/${c}` : c;
    return `${s}/${r}/${i}@${o}/${c.startsWith(`${n}/`) ? c : h}`;
}

Zaimanhua.categoryParamMap = {
    全部: "0",
    冒险: "4",
    欢乐向: "5",
    格斗: "6",
    科幻: "7",
    爱情: "8",
    侦探: "9",
    竞技: "10",
    魔法: "11",
    神鬼: "12",
    校园: "13",
    惊悚: "14",
    其他: "16",
    四格: "17",
    亲情: "3242",
    百合: "3243",
    秀吉: "3244",
    悬疑: "3245",
    纯爱: "3246",
    热血: "3248",
    泛爱: "3249",
    历史: "3250",
    战争: "3251",
    萌系: "3252",
    宅系: "3253",
    治愈: "3254",
    励志: "3255",
    武侠: "3324",
    机战: "3325",
    音乐舞蹈: "3326",
    美食: "3327",
    职场: "3328",
    西方魔幻: "3365",
    高清单行: "4459",
    TS: "4518",
    东方: "5077",
    魔幻: "5806",
    奇幻: "5848",
    节操: "6219",
    轻小说: "6316",
    颜艺: "6437",
    搞笑: "7568",
    仙侠: "23388",
    舰娘: "7900",
    动画: "13627",
    AA: "17192",
    福瑞: "18522",
    生存: "23323",
    日常: "23388",
    画集: "30788",
    C100: "31137"
};
