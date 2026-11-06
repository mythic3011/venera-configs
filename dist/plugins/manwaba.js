class ManWaBa extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "漫蛙吧", this.key = "manwaba", this.version = "1.0.2", this.minAppVersion = "1.4.0",
        this.url = resolvePluginUpdateUrl("manwaba.js"), this.api = "https://www.mhtmh.org/api",
        this.explore = [ {
            title: this.name,
            type: "singlePageWithMultiPart",
            load: async t => {
                const e = `${this.api}/home`, a = await this.fetchJson(e, {
                    params: {
                        page: 1,
                        pageSize: 6,
                        type: "",
                        flag: !1
                    }
                }).then(t => t.data);
                let i = {
                    热门: a.comicList,
                    最新完整版: a.gufengList,
                    最新更新: a.xuanhuanList,
                    热门收藏: a.xiaoyuanList
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
                let o = {};
                for (let t in i) o[t] = i[t].map(s);
                return o;
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
            load: async (t, e, a, i) => {
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
                }[e] || "/cate", o = JSON.stringify({
                    page: {
                        page: i,
                        pageSize: 10
                    },
                    category: "comic",
                    sort: parseInt(a[2]),
                    comic: {
                        status: parseInt("2" == a[0] ? -1 : a[0]),
                        day: parseInt(a[1]),
                        tag: e
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
                        payload: o
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
            load: async (t, e, a) => {
                let i = `${this.api}/search`, s = {
                    keyword: t,
                    type: "mh",
                    page: a,
                    pageSize: 20
                }, o = await this.fetchJson(i, {
                    params: s
                }).then(t => t.data), r = o.total;
                return {
                    comics: o.list.map(t => new Comic({
                        id: t.id.toString(),
                        title: t.title,
                        subTitle: t.author,
                        cover: t.cover,
                        tags: t.tags.split(","),
                        description: t.description,
                        status: 0 == t.status ? "连载中" : "已完结"
                    })),
                    maxPage: Math.ceil(r / 20)
                };
            }
        }, this.comic = {
            loadInfo: async t => {
                let e = `${this.api}/comic/${t}`, a = await this.fetchJson(e, {
                    payload: void 0
                }).then(t => t.data);
                this.logger.warn(`loadInfo: ${a}`);
                let i = a.id, s = `${this.api}/comic/chapter`, o = {
                    comicId: i,
                    page: 1,
                    pageSize: 1
                }, r = (await this.fetchJson(s, {
                    params: o
                })).pagination.total, n = (await this.fetchJson(s, {
                    params: {
                        ...o,
                        pageSize: r
                    }
                })).data, c = new Map;
                return n.forEach(t => {
                    c.set(t.id.toString(), t.title.toString());
                }), new ComicDetails({
                    title: a.title.toString(),
                    subTitle: a.author.toString(),
                    cover: a.cover,
                    tags: {
                        类型: a.tags.split(","),
                        状态: 0 == a.status ? "连载中" : "已完结"
                    },
                    chapters: c,
                    description: a.intro,
                    updateTime: new Date(1e3 * a.editTime).toLocaleDateString()
                });
            },
            loadEp: async (t, e) => {
                let a = `${this.api}/comic/image/${e}`, i = {
                    page: 1,
                    pageSize: 1,
                    imageSource: "https://tu.mhttu.cc"
                }, s = await this.fetchJson(a, {
                    params: i
                }).then(t => t.data.pagination.total);
                return {
                    images: (await this.fetchJson(a, {
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
        this.fetchJson = async (t, {method: e = "GET", params: a, headers: i, payload: s}) => {
            a && (t += `?${Object.keys(a).map(t => `${t}=${a[t]}`).join("&")}`);
            let o = await Network.sendRequest(e, t, i, s);
            if (200 !== o.status) throw `Invalid status code: ${o.status}, body: ${o.body}`;
            return JSON.parse(o.body);
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

function __veneraNormalizeAuthorityPart(t, e, a) {
    const i = String(null == t ? "" : t).trim() || e;
    return a ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), a = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), s = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), r = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), c = String(t || "").replace(/^\/+/, "");
    if (!c) return `${i}/${s}/${o}@${r}`;
    const l = n ? `${n}/${c}` : c;
    return `${i}/${s}/${o}@${r}/${c.startsWith(`${n}/`) ? c : l}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
