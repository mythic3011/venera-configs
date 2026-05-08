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
                    const i = UI.showLoading(() => {
                        UI.showMessage("检测已取消"), o = !0;
                    });
                    setTimeout(() => {
                        o || (UI.cancelLoading(i), UI.showMessage("❌ 连接超时，可能需要 🚀"), o = !0);
                    }, 1e4), Network.get(t).then(t => {
                        if (o) return;
                        const l = Date.now() - e;
                        UI.cancelLoading(i), UI.showMessage(`✅ 连接正常，延迟: ${l}ms`), o = !0;
                    }).catch(() => {
                        o || (UI.cancelLoading(i), UI.showMessage("❌ 连接失败，可能需要 🚀"), o = !0);
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
                }, i = {
                    title: "热门漫画",
                    comics: this.parseHotComicList(e.querySelectorAll(".index-original .index-original-list li")),
                    viewMore: {
                        page: "category",
                        attributes: {
                            category: "排行榜"
                        }
                    }
                }, l = {
                    title: "完结优选",
                    comics: this.parseComicList(e.querySelectorAll(".box-body .mh-item")),
                    viewMore: {
                        page: "category",
                        attributes: {
                            category: "全部漫画"
                        }
                    }
                };
                return e.dispose(), [ o, i, l ];
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
            load: async (t, e, o, i) => {
                let l;
                if ("最近更新" === t) l = `${this.baseUrl}/update?page=${i}`; else if ("排行榜" === t) l = `${this.baseUrl}/rank`; else {
                    const e = "全部漫画" !== t ? t : "全部", r = o[0] || "-1", s = o[1] || "-1";
                    l = `${this.baseUrl}/booklist?tag=${encodeURIComponent(e)}&area=${r}&end=${s}&page=${i}`;
                }
                const r = await this.fetchDocument(l);
                let s = [];
                if ("排行榜" === t) {
                    const t = o[0] || "new", e = {
                        new: "新书榜",
                        popular: "人气榜",
                        end: "完结榜",
                        recommend: "推荐榜"
                    }, i = r.querySelectorAll(".mh-list.col3.top-cat li");
                    let l = null;
                    for (let o of i) {
                        const i = o.querySelector(".title");
                        if (i && i.text.trim() === e[t]) {
                            l = o;
                            break;
                        }
                    }
                    if (!l) throw r.dispose(), "未找到对应的排行榜";
                    s = this.parseComicList(l.querySelectorAll(".mh-item.horizontal, .mh-itme-top"));
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
                const i = `${this.baseUrl}/search?keyword=${encodeURIComponent(t)}`, l = await this.fetchDocument(i), r = this.parseComicList(l.querySelectorAll(".mh-item"));
                return l.dispose(), {
                    comics: r,
                    maxPage: 1
                };
            },
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async t => {
                var e, o;
                const i = `${this.baseUrl}/book/${t}`, l = await this.fetchDocument(i), r = null == (e = l.querySelector(".info h1")) || null == (e = e.text) ? void 0 : e.trim();
                let s = "", a = "";
                const n = l.querySelectorAll(".info .subtitle");
                for (let t of n) {
                    const e = t.text;
                    e.includes("别名：") && (a = e.replace("别名：", "").trim()), e.includes("作者：") && (s = e.replace("作者：", "").trim());
                }
                const c = s ? s.split("&").map(t => t.trim()).filter(t => t) : [];
                let u = "", m = "", h = "", p = "";
                const d = l.querySelectorAll(".info .tip span");
                for (let t of d) {
                    var g, y;
                    const e = t.text;
                    e.includes("状态：") && (u = null == (g = t.querySelector("span")) || null == (g = g.text) ? void 0 : g.trim()),
                    e.includes("地区：") && (m = null == (y = t.querySelector("a")) || null == (y = y.text) ? void 0 : y.trim()),
                    e.includes("更新时间：") && (h = t.text.replace("更新时间：", "").trim()), e.includes("点击：") && (p = t.text.replace("点击：", "").trim());
                }
                const f = null == (o = l.querySelector(".info .content")) || null == (o = o.text) ? void 0 : o.trim(), w = [], v = l.querySelectorAll(".info .tip a[href*='tag=']");
                for (let t of v) {
                    var b;
                    const e = null == (b = t.text) ? void 0 : b.trim();
                    e && w.push(e);
                }
                const x = {}, S = l.querySelectorAll("#detail-list-select li a");
                for (let t of S) {
                    var $, q;
                    const e = null == ($ = t.attributes) ? void 0 : $.href, o = null == (q = t.text) ? void 0 : q.trim();
                    if (e && o) {
                        const t = e.split("/").pop();
                        t && (x[t] = o);
                    }
                }
                const A = this.parseCommentList(l.querySelectorAll(".view-comment-main .postlist li.dashed")), _ = this.parseComicList(l.querySelectorAll(".index-manga .mh-item"));
                return l.dispose(), new ComicDetails({
                    title: r,
                    subTitle: a,
                    cover: `${this.baseUrl}/static/upload/book/${t}/cover.jpg`,
                    description: f,
                    tags: {
                        作者: c,
                        题材: w,
                        地区: [ m ],
                        状态: [ u ],
                        热度: [ `🔥${p}` ]
                    },
                    chapters: x,
                    recommend: _,
                    commentCount: A.length,
                    updateTime: h,
                    url: i,
                    comments: A
                });
            },
            loadEp: async (t, e) => {
                const o = `${this.baseUrl}/chapter/${e}`, i = await this.fetchDocument(o), l = [], r = i.querySelectorAll("img.lazy");
                for (let t of r) {
                    var s;
                    const e = (null == (s = t.attributes) ? void 0 : s["data-original"]).replace(/https?:\/\/[^\/]+/, this.baseUrl);
                    e && l.push(e);
                }
                if (0 === l.length) throw i.dispose(), "本章中未找到图片";
                return i.dispose(), {
                    images: l
                };
            },
            loadComments: async (t, e, o, i) => {
                const l = `${this.baseUrl}/book/${t}`, r = await this.fetchDocument(l), s = this.parseCommentList(r.querySelectorAll(".view-comment-main .postlist li.dashed"));
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
            var o, i, l, r;
            const t = s.querySelector("a[href^='/book/']").attributes.href.split("/").pop(), a = null == (o = s.querySelector(".title a")) || null == (o = o.text) ? void 0 : o.trim(), n = null == (i = s.querySelector("span a")) || null == (i = i.text) ? void 0 : i.trim(), c = (null == (l = s.querySelector(".chapter")) || null == (l = l.text) || null == (l = l.replace(/^更新/, "")) || null == (l = l.replace(/\s+/g, " ")) ? void 0 : l.trim()) || (null == (r = s.querySelector(".zl")) || null == (r = r.text) ? void 0 : r.trim());
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
            var o, i, l;
            const t = r.querySelector(".cover a[href^='/book/']").attributes.href.split("/").pop(), s = null == (o = r.querySelector(".info .title a")) || null == (o = o.text) ? void 0 : o.trim(), a = null == (i = r.querySelector(".info .desc")) || null == (i = i.text) ? void 0 : i.trim(), n = null == (l = r.querySelector(".info .subtitle span a")) || null == (l = l.text) ? void 0 : l.trim(), c = [], u = r.querySelectorAll(".info .tag a");
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
            var o, i, l, r;
            const t = null == (o = s.querySelector(".title")) || null == (o = o.text) ? void 0 : o.trim(), a = null == (i = s.querySelector(".content")) || null == (i = i.text) ? void 0 : i.trim(), n = null == (l = s.querySelector(".bottom")) || null == (l = l.text) || null == (l = l.match(/\d{4}-\d{2}-\d{2}/)) || null == (l = l[0]) ? void 0 : l.trim(), c = null == (r = s.querySelector(".cover img")) || null == (r = r.attributes) ? void 0 : r.src;
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
    const i = String(null == t ? "" : t).trim() || e;
    return o ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), o = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(o.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), l = __veneraNormalizeAuthorityPart(o.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(o.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(o.releaseRef, "main", !1), a = __veneraNormalizeAuthorityPart(o.artifactPathPrefix, "dist/plugins", !0), n = String(t || "").replace(/^\/+/, "");
    if (!n) return `${i}/${l}/${r}@${s}`;
    const c = a ? `${a}/${n}` : n;
    return `${i}/${l}/${r}@${s}/${n.startsWith(`${a}/`) ? n : c}`;
}
