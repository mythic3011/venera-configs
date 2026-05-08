class JComic extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "jcomic.net", this.key = "jcomic", this.version = "1.0.0",
        this.minAppVersion = "1.4.6", this.url = resolvePluginUpdateUrl("jcomic.js"), this.currentComic = null,
        this.explore = [ {
            title: "JComic",
            type: "multiPageComicList",
            load: async t => {
                t || (t = 1);
                const e = encodeURI("最近更新"), r = 1 === t ? `/cat/${e}` : `/cat/${e}/${t}`, o = this._buildUrl(r), i = await Network.get(o, {
                    referer: JCOMIC_REFERER
                });
                if (200 !== i.status) throw new Error(i.status);
                const a = new HtmlDocument(i.body);
                return {
                    comics: parseComicList(a),
                    maxPage: parseMaxPage(a)
                };
            },
            loadNext(t) {}
        } ], this.category = {
            title: "jcomic.net",
            parts: [ {
                name: "分類",
                type: "fixed",
                categories: [ "最近更新", "隨機", "全彩", "長篇", "單行本", "同人", "短篇", "Cosplay", "歐美", "WEBTOON", "圓神領域", "碧藍幻想", "CG雜圖", "英語 ENG", "生肉", "純愛", "百合花園", "耽美花園", "偽娘哲學", "後宮閃光", "扶他樂園", "姐姐系", "妹妹系", "SM", "性轉換", "足の恋", "重口地帶", "人妻", "NTR", "強暴", "非人類", "艦隊收藏", "Love Live", "SAO 刀劍神域", "Fate", "東方", "禁書目錄" ],
                itemType: "category",
                categoryParams: [ "最近更新", "隨機", "全彩", "長篇", "單行本", "同人", "短篇", "Cosplay", "歐美", "WEBTOON", "圓神領域", "碧藍幻想", "CG雜圖", "英語 ENG", "生肉", "純愛", "百合花園", "耽美花園", "偽娘哲學", "後宮閃光", "扶他樂園", "姐姐系", "妹妹系", "SM", "性轉換", "足の恋", "重口地帶", "人妻", "NTR", "強暴", "非人類", "艦隊收藏", "Love Live", "SAO 刀劍神域", "Fate", "東方", "禁書目錄" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, e, r, o) => {
                o || (o = 1);
                const i = encodeURI(e), a = 1 === o ? `/cat/${i}` : `/cat/${i}/${o}`, n = this._buildUrl(a), c = await Network.get(n, {
                    referer: JCOMIC_REFERER
                });
                if (200 !== c.status) throw new Error(c.status);
                const s = new HtmlDocument(c.body);
                return {
                    comics: parseComicList(s),
                    maxPage: parseMaxPage(s)
                };
            },
            optionList: [],
            ranking: null
        }, this.search = {
            load: async (t, e, r) => {
                r || (r = 1);
                const o = (t || "").trim();
                if (!o) return {
                    comics: [],
                    maxPage: 1
                };
                const i = encodeURIComponent(o), a = 1 === r ? `/search/${i}` : `/search/${i}/${r}`, n = this._buildUrl(a), c = await Network.get(n, {
                    referer: JCOMIC_REFERER
                });
                if (200 !== c.status) throw new Error(c.status);
                const s = new HtmlDocument(c.body);
                return {
                    comics: parseComicList(s),
                    maxPage: parseMaxPage(s)
                };
            },
            loadNext: async (t, e, r) => {},
            optionList: [ {
                type: "select",
                options: [ "0-Default" ],
                label: "sort",
                default: null
            } ],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async t => {
                const e = encodeURI(t), r = this._buildUrl(`/eps/${e}`), o = await Network.get(r, {
                    referer: JCOMIC_REFERER
                });
                if (200 !== o.status) throw new Error(o.status);
                const i = new HtmlDocument(o.body), a = i.querySelector("div.row.col-md-6.col-xs-12");
                if (!a) throw new Error("failed to parse comic info");
                const n = a.querySelector("p.comic-title"), c = n ? n.text.trim() : t, s = trimTitle(c);
                let l = 1;
                const u = /\((\d+)\)/.exec(c);
                u && (l = parseInt(u[1], 10) || 1);
                const m = a.querySelector("img.comic-thumb"), p = m ? m.attributes.src : "", h = a.querySelectorAll('a[href^="/author/"] button'), f = Array.from(h).map(t => t.text.trim()), d = a.querySelectorAll('a[href^="/cat/"] button'), g = Array.from(d).map(t => t.text.trim()), y = a.querySelector("p.comic-date"), E = y ? y.text.trim() : "", C = i.querySelectorAll('a[href^="/page/"]');
                let _ = [];
                C.forEach(e => {
                    const r = e.attributes.href;
                    if (parseIdFromHref(r) === t) {
                        const t = parseEpIdFromHref(r);
                        if (t) {
                            let r = e.text.trim();
                            if (!r) {
                                const t = e.querySelector("button");
                                t && (r = t.text.trim());
                            }
                            _.push({
                                id: t,
                                title: r || `第${t}話`
                            });
                        }
                    }
                });
                const R = new Map;
                f.length && R.set("authors", f), g.length && R.set("categories", g);
                const b = new Map;
                return _.forEach(t => {
                    b.set(t.id, t.title);
                }), this.currentComic = {
                    id: t,
                    title: s,
                    cover: p,
                    authors: f,
                    categories: g,
                    eps: _
                }, new ComicDetails({
                    title: s,
                    cover: p,
                    tags: R,
                    chapters: b,
                    maxPage: l,
                    thumbnails: [ p ],
                    uploadTime: E,
                    url: r,
                    recommend: void 0
                });
            },
            loadEp: async (t, e) => {
                let r = `/page/${encodeURI(t)}`;
                e && (r += "/" + encodeURIComponent(e));
                const o = JCOMIC_BASE + r, i = await Network.get(o, {
                    referer: JCOMIC_REFERER
                });
                if (200 !== i.status) throw new Error(i.status);
                const a = new HtmlDocument(i.body).querySelectorAll("img.comic-thumb");
                return {
                    images: Array.from(a).map(t => t.attributes.src)
                };
            },
            onImageLoad: (t, e, r) => ({
                url: t,
                headers: {
                    referer: JCOMIC_REFERER
                }
            }),
            onThumbnailLoad: t => ({
                url: t,
                headers: {
                    referer: JCOMIC_REFERER
                }
            }),
            onClickTag: (t, e) => ({
                page: "category",
                attributes: {
                    category: "分類",
                    param: e
                }
            }),
            link: {
                domains: [ "jcomic.net" ],
                linkToId: t => {
                    const e = /https?:\/\/jcomic\.net\/(?:eps|page)\/([^\/?#]+)(?:\/[^\/?#]+)?/.exec(t);
                    if (!e) throw new Error("Invalid jcomic url");
                    return decodeURIComponent(e[1]);
                }
            }
        };
    }
    _buildUrl(t) {
        return t.startsWith("http://") || t.startsWith("https://") ? t : (t.startsWith("/") || (t = "/" + t),
        JCOMIC_BASE + t);
    }
    init() {}
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, e, r) {
    const o = String(null == t ? "" : t).trim() || e;
    return r ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), r = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), a = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), c = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), s = String(t || "").replace(/^\/+/, "");
    if (!s) return `${o}/${i}/${a}@${n}`;
    const l = c ? `${c}/${s}` : s;
    return `${o}/${i}/${a}@${n}/${s.startsWith(`${c}/`) ? s : l}`;
}

"use strict";

const JCOMIC_BASE = "https://jcomic.net", JCOMIC_REFERER = JCOMIC_BASE + "/";

function trimTitle(t) {
    if (!t) return "";
    const e = t.lastIndexOf(" (");
    return e > 0 ? t.slice(0, e).trim() : t.trim();
}

function parseIdFromHref(t) {
    if (!t) return null;
    try {
        const e = t.split("?")[0].split("/").filter(Boolean);
        return e.length >= 2 ? decodeURIComponent(e[1]) : decodeURIComponent(e[e.length - 1]);
    } catch (t) {
        return null;
    }
}

function parseEpIdFromHref(t) {
    if (!t) return null;
    const e = t.split("?")[0].split("/").filter(Boolean);
    return e.length >= 3 ? decodeURIComponent(e[2]) : null;
}

function parseComicCard(t) {
    try {
        const e = t.querySelector('a[href^="/eps/"], a[href^="/page/"]');
        if (!e) return null;
        const r = parseIdFromHref(e.attributes.href);
        if (!r) return null;
        const o = t.querySelector("img.comic-thumb"), i = o ? o.attributes.src : "", a = t.querySelector("p.comic-title"), n = trimTitle(a ? a.text.trim() : r), c = t.querySelectorAll('a[href^="/author/"] button'), s = Array.from(c).map(t => t.text.trim()).join(" "), l = t.querySelectorAll('a[href^="/cat/"] button');
        let u = [];
        if (l.length) u = Array.from(l).map(t => t.text.trim()); else {
            const e = t.querySelectorAll('a[href^="/cat/"]');
            u = Array.from(e).map(t => t.text.trim()).filter(Boolean);
        }
        const m = t.querySelector("p.comic-date"), p = m ? m.text.trim() : "";
        return new Comic({
            id: r,
            title: n,
            subTitle: s,
            cover: i,
            tags: u,
            language: "zh-Hant",
            description: p
        });
    } catch (t) {
        return null;
    }
}

function parseMaxPage(t) {
    const e = t.querySelector("ul.pagination");
    if (!e) return 1;
    const r = e.querySelectorAll("a");
    let o = 1;
    return r.forEach(t => {
        const e = t.text.trim(), r = parseInt(e, 10);
        !Number.isNaN(r) && r > o && (o = r);
    }), o;
}

function parseComicList(t) {
    const e = t.querySelectorAll("div.row.col-lg-4.col-md-6.col-xs-12, div.row.col-md-6.col-xs-12"), r = [];
    return e.forEach(t => {
        const e = parseComicCard(t);
        e && r.push(e);
    }), r;
}
