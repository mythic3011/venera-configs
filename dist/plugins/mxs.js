class MXS extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "漫小肆", this.key = "mxs", this.version = "1.0.0", this.minAppVersion = "1.5.0",
        this.url = resolvePluginUpdateUrl("mxs.js"), this.settings = {
            domains: {
                title: "选择域名",
                type: "select",
                options: [ {
                    value: "https://www.mxshm.top",
                    text: "mxshm.top"
                }, {
                    value: "https://www.jjmhw1.top",
                    text: "jjmhw1.top"
                }, {
                    value: "https://www.jjmh.top",
                    text: "jjmh.top"
                }, {
                    value: "https://www.jjmh.cc",
                    text: "jjmh.cc"
                }, {
                    value: "https://www.wzd1.cc",
                    text: "wzd1.cc"
                }, {
                    value: "https://www.wzdhm1.cc",
                    text: "wzdhm1.cc"
                }, {
                    value: "https://www.ikanwzd.cc",
                    text: "ikanwzd.cc"
                } ],
                default: "https://www.mxshm.top"
            },
            domainCheck: {
                title: "检测当前域名",
                type: "callback",
                buttonText: "检测",
                callback: () => {
                    const t = this.loadSetting("domains"), e = Date.now();
                    let o = !1;
                    const l = UI.showLoading(() => {
                        UI.showMessage("检测已取消"), o = !0;
                    });
                    setTimeout(() => {
                        o || (UI.cancelLoading(l), UI.showMessage("❌ 连接超时，可能需要 🚀"), o = !0);
                    }, 1e4), Network.get(t).then(t => {
                        if (o) return;
                        const i = Date.now() - e;
                        UI.cancelLoading(l), UI.showMessage(`✅ 连接正常，延迟: ${i}ms`), o = !0;
                    }).catch(() => {
                        o || (UI.cancelLoading(l), UI.showMessage("❌ 连接失败，可能需要 🚀"), o = !0);
                    });
                }
            }
        }, this.explore = [ {
            title: "漫小肆",
            type: "multiPartPage",
            load: async t => {
                const e = await this.fetchDocument(this.baseUrl), o = {
                    title: "最近更新",
                    comics: this.parseComicList(e.querySelectorAll(".index-manga .mh-item")),
                    viewMore: {
                        page: "category",
                        attributes: {
                            category: "最近更新"
                        }
                    }
                }, l = {
                    title: "热门漫画",
                    comics: this.parseHotComicList(e.querySelectorAll(".index-original .index-original-list li")),
                    viewMore: {
                        page: "category",
                        attributes: {
                            category: "排行榜"
                        }
                    }
                }, i = {
                    title: "完结优选",
                    comics: this.parseComicList(e.querySelectorAll(".box-body .mh-item")),
                    viewMore: {
                        page: "category",
                        attributes: {
                            category: "全部漫画"
                        }
                    }
                };
                return e.dispose(), [ o, l, i ];
            }
        } ], this.category = {
            title: "漫小肆",
            parts: [ {
                name: "推荐",
                type: "fixed",
                categories: [ "最近更新", "排行榜", "全部漫画" ],
                itemType: "category"
            }, {
                name: "题材",
                type: "fixed",
                categories: [ "都市", "校园", "青春", "性感", "长腿", "多人", "御姐", "巨乳", "新婚", "媳妇", "暧昧", "清纯", "调教", "少妇", "风骚", "同居", "淫乱", "好友", "女神", "诱惑", "偷情", "出轨", "正妹", "家教" ],
                itemType: "category"
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, e, o, l) => {
                let i;
                if ("最近更新" === t) i = `${this.baseUrl}/update?page=${l}`; else if ("排行榜" === t) i = `${this.baseUrl}/rank`; else {
                    const e = "全部漫画" !== t ? t : "全部", r = o[0] || "-1", s = o[1] || "-1";
                    i = `${this.baseUrl}/booklist?tag=${encodeURIComponent(e)}&area=${r}&end=${s}&page=${l}`;
                }
                const r = await this.fetchDocument(i);
                let s = [];
                if ("排行榜" === t) {
                    const t = o[0] || "new", e = {
                        new: "新书榜",
                        popular: "人气榜",
                        end: "完结榜",
                        recommend: "推荐榜"
                    }, l = r.querySelectorAll(".mh-list.col3.top-cat li");
                    let i = null;
                    for (let o of l) {
                        const l = o.querySelector(".title");
                        if (l && l.text.trim() === e[t]) {
                            i = o;
                            break;
                        }
                    }
                    if (!i) throw r.dispose(), "未找到对应的排行榜";
                    s = this.parseComicList(i.querySelectorAll(".mh-item.horizontal, .mh-itme-top"));
                } else s = this.parseComicList(r.querySelectorAll(".mh-list.col7 .mh-item"));
                let a = 1;
                if ("排行榜" !== t) {
                    const t = r.querySelectorAll(".pagination a[href*='page=']");
                    for (let e of t) {
                        const t = e.attributes.href.match(/page=(\d+)/);
                        if (t) {
                            const e = parseInt(t[1]);
                            !isNaN(e) && e > a && (a = e);
                        }
                    }
                }
                return r.dispose(), {
                    comics: s,
                    maxPage: a
                };
            },
            optionLoader: async (t, e) => "最近更新" === t ? [] : "排行榜" === t ? [ {
                options: [ "new-新书榜", "popular-人气榜", "end-完结榜", "recommend-推荐榜" ]
            } ] : [ {
                label: "地区",
                options: [ "-全部", "1-韩国", "2-日本", "3-台湾" ]
            }, {
                label: "状态",
                options: [ "-全部", "0-连载", "1-完结" ]
            } ]
        }, this.search = {
            load: async (t, e, o) => {
                const l = `${this.baseUrl}/search?keyword=${encodeURIComponent(t)}`, i = await this.fetchDocument(l), r = this.parseComicList(i.querySelectorAll(".mh-item"));
                return i.dispose(), {
                    comics: r,
                    maxPage: 1
                };
            },
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async t => {
                var e, o;
                const l = `${this.baseUrl}/book/${t}`, i = await this.fetchDocument(l), r = null == (e = i.querySelector(".info h1")) || null == (e = e.text) ? void 0 : e.trim();
                let s = "", a = "";
                const n = i.querySelectorAll(".info .subtitle");
                for (let t of n) {
                    const e = t.text;
                    e.includes("别名：") && (a = e.replace("别名：", "").trim()), e.includes("作者：") && (s = e.replace("作者：", "").trim());
                }
                const c = s ? s.split("&").map(t => t.trim()).filter(t => t) : [];
                let u = "", m = "", p = "", h = "";
                const d = i.querySelectorAll(".info .tip span");
                for (let t of d) {
                    var g, y;
                    const e = t.text;
                    e.includes("状态：") && (u = null == (g = t.querySelector("span")) || null == (g = g.text) ? void 0 : g.trim()),
                    e.includes("地区：") && (m = null == (y = t.querySelector("a")) || null == (y = y.text) ? void 0 : y.trim()),
                    e.includes("更新时间：") && (p = t.text.replace("更新时间：", "").trim()), e.includes("点击：") && (h = t.text.replace("点击：", "").trim());
                }
                const f = null == (o = i.querySelector(".info .content")) || null == (o = o.text) ? void 0 : o.trim(), w = [], v = i.querySelectorAll(".info .tip a[href*='tag=']");
                for (let t of v) {
                    var b;
                    const e = null == (b = t.text) ? void 0 : b.trim();
                    e && w.push(e);
                }
                const x = {}, S = i.querySelectorAll("#detail-list-select li a");
                for (let t of S) {
                    var $, U;
                    const e = null == ($ = t.attributes) ? void 0 : $.href, o = null == (U = t.text) ? void 0 : U.trim();
                    if (e && o) {
                        const t = e.split("/").pop();
                        t && (x[t] = o);
                    }
                }
                const q = this.parseCommentList(i.querySelectorAll(".view-comment-main .postlist li.dashed")), A = this.parseComicList(i.querySelectorAll(".index-manga .mh-item"));
                return i.dispose(), new ComicDetails({
                    title: r,
                    subTitle: a,
                    cover: `${this.baseUrl}/static/upload/book/${t}/cover.jpg`,
                    description: f,
                    tags: {
                        作者: c,
                        题材: w,
                        地区: [ m ],
                        状态: [ u ],
                        热度: [ `🔥${h}` ]
                    },
                    chapters: x,
                    recommend: A,
                    commentCount: q.length,
                    updateTime: p,
                    url: l,
                    comments: q
                });
            },
            loadEp: async (t, e) => {
                const o = `${this.baseUrl}/chapter/${e}`, l = await this.fetchDocument(o), i = [], r = l.querySelectorAll("img.lazy");
                for (let t of r) {
                    var s;
                    const e = (null == (s = t.attributes) ? void 0 : s["data-original"]).replace(/https?:\/\/[^\/]+/, this.baseUrl);
                    e && i.push(e);
                }
                if (0 === i.length) throw l.dispose(), "本章中未找到图片";
                return l.dispose(), {
                    images: i
                };
            },
            loadComments: async (t, e, o, l) => {
                const i = `${this.baseUrl}/book/${t}`, r = await this.fetchDocument(i), s = this.parseCommentList(r.querySelectorAll(".view-comment-main .postlist li.dashed"));
                return r.dispose(), {
                    comments: s,
                    maxPage: 1
                };
            },
            onClickTag: (t, e) => "作者" === t ? {
                page: "search",
                attributes: {
                    keyword: e
                }
            } : "题材" === t ? {
                page: "category",
                attributes: {
                    category: e
                }
            } : void 0,
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return this.loadSetting("domains");
    }
    parseComicList(t) {
        const e = [];
        for (let s of t) {
            var o, l, i, r;
            const t = s.querySelector("a[href^='/book/']").attributes.href.split("/").pop(), a = null == (o = s.querySelector(".title a")) || null == (o = o.text) ? void 0 : o.trim(), n = null == (l = s.querySelector("span a")) || null == (l = l.text) ? void 0 : l.trim(), c = (null == (i = s.querySelector(".chapter")) || null == (i = i.text) || null == (i = i.replace(/^更新/, "")) || null == (i = i.replace(/\s+/g, " ")) ? void 0 : i.trim()) || (null == (r = s.querySelector(".zl")) || null == (r = r.text) ? void 0 : r.trim());
            t && a && e.push(new Comic({
                id: t,
                title: a,
                subTitle: n,
                cover: `${this.baseUrl}/static/upload/book/${t}/cover.jpg`,
                description: c
            }));
        }
        return e;
    }
    parseHotComicList(t) {
        const e = [];
        for (let r of t) {
            var o, l, i;
            const t = r.querySelector(".cover a[href^='/book/']").attributes.href.split("/").pop(), s = null == (o = r.querySelector(".info .title a")) || null == (o = o.text) ? void 0 : o.trim(), a = null == (l = r.querySelector(".info .desc")) || null == (l = l.text) ? void 0 : l.trim(), n = null == (i = r.querySelector(".info .subtitle span a")) || null == (i = i.text) ? void 0 : i.trim(), c = [], u = r.querySelectorAll(".info .tag a");
            for (let t of u) t.text && c.push(t.text.trim());
            t && s && e.push(new Comic({
                id: t,
                title: s,
                subTitle: a,
                cover: `${this.baseUrl}/static/upload/book/${t}/cover.jpg`,
                tags: c,
                description: `热度: 🔥${n}`
            }));
        }
        return e;
    }
    parseCommentList(t) {
        const e = [];
        for (let s of t) {
            var o, l, i, r;
            const t = null == (o = s.querySelector(".title")) || null == (o = o.text) ? void 0 : o.trim(), a = null == (l = s.querySelector(".content")) || null == (l = l.text) ? void 0 : l.trim(), n = null == (i = s.querySelector(".bottom")) || null == (i = i.text) || null == (i = i.match(/\d{4}-\d{2}-\d{2}/)) || null == (i = i[0]) ? void 0 : i.trim(), c = null == (r = s.querySelector(".cover img")) || null == (r = r.attributes) ? void 0 : r.src;
            t && a && e.push(new Comment({
                userName: t,
                avatar: `${this.baseUrl}${c}`,
                content: a,
                time: n
            }));
        }
        return e;
    }
    async fetchDocument(t) {
        const e = await Network.get(t, {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        });
        if (200 !== e.status) throw `请求失败: ${e.status}`;
        return new HtmlDocument(e.body);
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, e, o) {
    const l = String(null == t ? "" : t).trim() || e;
    return o ? l.replace(/^\/+|\/+$/g, "") : l;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), o = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, l = __veneraNormalizeAuthorityPart(o.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(o.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(o.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(o.releaseRef, "main", !1), a = __veneraNormalizeAuthorityPart(o.artifactPathPrefix, "dist/plugins", !0), n = String(t || "").replace(/^\/+/, "");
    if (!n) return `${l}/${i}/${r}@${s}`;
    const c = a ? `${a}/${n}` : n;
    return `${l}/${i}/${r}@${s}/${n.startsWith(`${a}/`) ? n : c}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
