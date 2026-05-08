class ManWaBa extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "漫蛙吧", this.key = "manwaba", this.version = "1.0.2", this.minAppVersion = "1.4.0",
        this.url = resolvePluginUpdateUrl("manwaba.js"), this.api = "https://www.mhtmh.org/api",
        this.explore = [ {
            title: this.name,
            type: "singlePageWithMultiPart",
            load: async t => {
                const a = `${this.api}/home`, e = await this.fetchJson(a, {
                    params: {
                        page: 1,
                        pageSize: 6,
                        type: "",
                        flag: !1
                    }
                }).then(t => t.data);
                let i = {
                    热门: e.comicList,
                    最新完整版: e.gufengList,
                    最新更新: e.xuanhuanList,
                    热门收藏: e.xiaoyuanList
                };
                function s(t) {
                    return new Comic({
                        id: t.id.toString(),
                        title: t.title,
                        subTitle: t.author,
                        cover: t.pic,
                        tags: t.tags.split(",")
                    });
                }
                let r = {};
                for (let t in i) r[t] = i[t].map(s);
                return r;
            }
        } ], this.category = {
            title: this.name,
            parts: [ {
                name: "类型",
                type: "fixed",
                categories: [ "全部", "热血", "玄幻", "恋爱", "冒险", "古风", "都市", "穿越", "奇幻", "其他", "搞笑", "少男", "战斗", "重生", "逆袭", "爆笑", "少年", "后宫", "系统", "BL", "韩漫", "完整版", "19r", "台版" ],
                itemType: "category",
                categoryParams: [ "", "热血", "玄幻", "恋爱", "冒险", "古风", "都市", "穿越", "奇幻", "其他", "搞笑", "少男", "战斗", "重生", "逆袭", "爆笑", "少年", "后宫", "系统", "BL", "韩漫", "完整版", "19r", "台版" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, a, e, i) => {
                let s = this.api + {
                    "": "/cate",
                    热血: "/cate/hotblooded",
                    玄幻: "/cate/xuanhuan",
                    恋爱: "/cate/romance",
                    冒险: "/cate/adventure",
                    古风: "/cate/historical",
                    都市: "/cate/urban",
                    穿越: "/cate/transmigration",
                    奇幻: "/cate/fantasy",
                    搞笑: "/cate/comedy",
                    少男: "/cate/shounen",
                    战斗: "/cate/action",
                    重生: "/cate/rebirth",
                    逆袭: "/cate/counterattack",
                    爆笑: "/cate/hilarious",
                    少年: "/cate/youth",
                    系统: "/cate/system",
                    BL: "/cate/bl",
                    韩漫: "/cate/manhwa",
                    完整版: "/cate/fullversion",
                    "19r": "/cate/19plus",
                    台版: "/cate/taiwanver"
                }[a] || "/cate", r = JSON.stringify({
                    page: {
                        page: i,
                        pageSize: 10
                    },
                    category: "comic",
                    sort: parseInt(e[2]),
                    comic: {
                        status: parseInt("2" == e[0] ? -1 : e[0]),
                        day: parseInt(e[1]),
                        tag: a
                    },
                    video: {
                        year: 0,
                        typeId: 0,
                        typeId1: 0,
                        area: "",
                        lang: "",
                        status: -1,
                        day: 0
                    },
                    novel: {
                        status: -1,
                        day: 0,
                        sortId: 0
                    }
                });
                return {
                    comics: (await this.fetchJson(s, {
                        method: "POST",
                        payload: r
                    }).then(t => t.data.list)).map(function(t) {
                        return new Comic({
                            id: t.url.split("/").pop(),
                            title: t.title,
                            subTitle: t.author,
                            cover: t.pic,
                            tags: t.tags.split(","),
                            description: t.intro,
                            status: 0 == t.status ? "连载中" : "已完结"
                        });
                    }),
                    maxPage: 100
                };
            },
            optionList: [ {
                options: [ "2-全部", "0-连载中", "1-已完结" ]
            }, {
                options: [ "0-全部", "1-周一", "2-周二", "3-周三", "4-周四", "5-周五", "6-周六", "7-周日" ]
            }, {
                options: [ "0-更新", "1-新作", "2-畅销", "3-热门", "4-收藏" ]
            } ]
        }, this.search = {
            load: async (t, a, e) => {
                let i = `${this.api}/search`, s = {
                    keyword: t,
                    type: "mh",
                    page: e,
                    pageSize: 20
                }, r = await this.fetchJson(i, {
                    params: s
                }).then(t => t.data), o = r.total;
                return {
                    comics: r.list.map(t => new Comic({
                        id: t.id.toString(),
                        title: t.title,
                        subTitle: t.author,
                        cover: t.cover,
                        tags: t.tags.split(","),
                        description: t.description,
                        status: 0 == t.status ? "连载中" : "已完结"
                    })),
                    maxPage: Math.ceil(o / 20)
                };
            }
        }, this.comic = {
            loadInfo: async t => {
                let a = `${this.api}/comic/${t}`, e = await this.fetchJson(a, {
                    payload: void 0
                }).then(t => t.data);
                this.logger.warn(`loadInfo: ${e}`);
                let i = e.id, s = `${this.api}/comic/chapter`, r = {
                    comicId: i,
                    page: 1,
                    pageSize: 1
                }, o = (await this.fetchJson(s, {
                    params: r
                })).pagination.total, n = (await this.fetchJson(s, {
                    params: {
                        ...r,
                        pageSize: o
                    }
                })).data, c = new Map;
                return n.forEach(t => {
                    c.set(t.id.toString(), t.title.toString());
                }), new ComicDetails({
                    title: e.title.toString(),
                    subTitle: e.author.toString(),
                    cover: e.cover,
                    tags: {
                        类型: e.tags.split(","),
                        状态: 0 == e.status ? "连载中" : "已完结"
                    },
                    chapters: c,
                    description: e.intro,
                    updateTime: new Date(1e3 * e.editTime).toLocaleDateString()
                });
            },
            loadEp: async (t, a) => {
                let e = `${this.api}/comic/image/${a}`, i = {
                    page: 1,
                    pageSize: 1,
                    imageSource: "https://tu.mhttu.cc"
                }, s = await this.fetchJson(e, {
                    params: i
                }).then(t => t.data.pagination.total);
                return {
                    images: (await this.fetchJson(e, {
                        params: {
                            ...i,
                            page_size: s
                        }
                    }).then(t => t.data.images)).map(t => t.url)
                };
            }
        };
    }
    init() {
        this.fetchJson = async (t, {method: a = "GET", params: e, headers: i, payload: s}) => {
            e && (t += `?${Object.keys(e).map(t => `${t}=${e[t]}`).join("&")}`);
            let r = await Network.sendRequest(a, t, i, s);
            if (200 !== r.status) throw `Invalid status code: ${r.status}, body: ${r.body}`;
            return JSON.parse(r.body);
        }, this.logger = {
            error: t => {
                log("error", this.name, t);
            },
            info: t => {
                log("info", this.name, t);
            },
            warn: t => {
                log("warning", this.name, t);
            }
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, a, e) {
    const i = String(null == t ? "" : t).trim() || a;
    return e ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(t) {
    const a = __veneraGetRuntimeGlobal(), e = a.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof a.__VENERA_RELEASE_AUTHORITY__ ? a.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(e.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), s = __veneraNormalizeAuthorityPart(e.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(e.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(e.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(e.artifactPathPrefix, "dist/plugins", !0), c = String(t || "").replace(/^\/+/, "");
    if (!c) return `${i}/${s}/${r}@${o}`;
    const l = n ? `${n}/${c}` : c;
    return `${i}/${s}/${r}@${o}/${c.startsWith(`${n}/`) ? c : l}`;
}
