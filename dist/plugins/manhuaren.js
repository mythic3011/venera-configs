class ManHuaRen extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "漫画人", this.key = "manhuaren", this.version = "1.0.0",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("manhuaren.js"),
        this.explore = [ {
            title: "漫画人",
            type: "multiPartPage",
            load: async t => {
                let e = this.baseUrl + "/", i = await Network.get(e, this._buildHeaders());
                if (200 !== i.status) throw `Invalid status code: ${i.status}`;
                let r = i.body || "", l = new HtmlDocument(r), a = [], s = l.querySelector(".index-banner");
                if (s) {
                    let t = [], e = s.querySelectorAll("li");
                    for (let i = 0; i < e.length; i++) {
                        let r = e[i], l = r.querySelector("a");
                        if (!l) continue;
                        let a = r.querySelector("img"), s = l.attributes.href, o = l.attributes.title, n = a ? a.attributes.src || a.attributes["data-src"] : "";
                        s && (s.startsWith("http") || (s = this.baseUrl + s), n && !n.startsWith("http") && (n = n.startsWith("//") ? "https:" + n : this.baseUrl + n),
                        t.push(new Comic({
                            id: s,
                            title: o || "",
                            cover: n || "",
                            description: ""
                        })));
                    }
                    t.length > 0 && a.push({
                        title: "热门推荐",
                        comics: t
                    });
                }
                let o = l.querySelectorAll(".manga-list");
                for (let t = 0; t < o.length; t++) {
                    let e = o[t], i = e.querySelector(".manga-list-title"), r = i ? i.text.trim() : "", l = null;
                    if (i) {
                        let t = i.querySelector("a");
                        if (t) {
                            let e = t.attributes.href;
                            e && (e.startsWith("http") || (e = this.baseUrl + e), l = e);
                        }
                    }
                    let s = [], n = e.querySelectorAll("li");
                    for (let t = 0; t < n.length; t++) {
                        let e = n[t], i = e.querySelector("a");
                        if (!i) continue;
                        let r = i.attributes.href, l = i.attributes.title;
                        if (!l) {
                            let t = e.querySelector(".manga-list-2-title");
                            t && (l = t.text.trim());
                        }
                        let a = e.querySelector("img"), o = a ? a.attributes["data-src"] || a.attributes.src : "", c = e.querySelector(".manga-list-1-tip") || e.querySelector(".manga-list-2-tip"), u = c ? c.text.trim() : "", h = e.querySelector(".manga-list-1-cover-logo-font"), m = h ? h.text.trim() : "";
                        r && (r.startsWith("http") || (r = this.baseUrl + r), o && !o.startsWith("http") && (o = o.startsWith("//") ? "https:" + o : this.baseUrl + o),
                        s.push(new Comic({
                            id: r,
                            title: l || "",
                            cover: o || "",
                            description: u,
                            tags: m ? [ m ] : []
                        })));
                    }
                    if (s.length > 0) {
                        r || (r = s[0].tags && s[0].tags.length > 0 ? s[0].tags[0] : "漫画列表");
                        let t = {
                            title: r,
                            comics: s
                        };
                        l && (t.viewMore = l), a.push(t);
                    }
                }
                return a;
            },
            loadNext(t) {}
        } ], this.category = {
            title: "漫画人",
            parts: [ {
                name: "类型",
                type: "fixed",
                itemType: "category",
                categories: [ "全部", "热血", "恋爱", "校园", "伪娘", "冒险", "职场", "后宫", "治愈", "科幻", "轻小说", "励志", "生活", "战争", "悬疑", "推理", "搞笑", "奇幻", "魔法", "神鬼", "萌系", "历史", "美食", "同人", "运动", "绅士", "机甲", "百合" ],
                categoryParams: [ "", "31", "26", "1", "5", "2", "6", "8", "9", "25", "156", "10", "11", "12", "17", "33", "37", "14", "15", "20", "21", "4", "7", "30", "34", "36", "40", "3" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, e, i, r) => {
                let l = e || "", a = i && i[0] ? i[0].split("-")[0] : "", s = i && i[1] ? i[1].split("-")[0] : "", o = "manhua-list";
                l && (o += `-tag${l}`), a && (o += `-${a}`), s && (o += `-${s}`);
                let n = `${this.baseUrl}/${o}/dm5.ashx`, c = Math.max(0, parseInt(r) || 1), u = 0;
                if (a && a.startsWith("st")) {
                    let t = a.match(/st(\d+)/);
                    t && (u = parseInt(t[1]));
                }
                let h = 0;
                if (s && s.startsWith("s")) {
                    let t = s.match(/s(\d+)/);
                    t && (h = parseInt(t[1]));
                }
                let m = l && l.length > 0 ? l : "0", d = `action=getclasscomics&pageindex=${c}&pagesize=21&categoryid=0&tagid=${encodeURIComponent(m)}&status=${u}&usergroup=0&pay=-1&areaid=0&sort=${h}&iscopyright=0`, p = {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-encoding": "gzip, deflate, br, zstd",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    connection: "keep-alive",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    host: "www.manhuaren.com",
                    origin: this.baseUrl,
                    pragma: "no-cache",
                    referer: `${this.baseUrl}/${o}/`,
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
                    "x-requested-with": "XMLHttpRequest"
                }, g = await Network.post(n, p, d);
                if (200 !== g.status) throw `加载分类漫画失败: ${g.status}`;
                let f = {};
                try {
                    f = JSON.parse(g.body || "{}");
                } catch (t) {
                    throw "解析分类返回数据失败";
                }
                let b = f.UpdateComicItems || [], y = b.map(t => {
                    let e = t.UrlKey ? `/${t.UrlKey}/` : t.ID ? `/m${t.ID}/` : "", i = t.ShowPicUrlB || t.ShowConver || "";
                    i && i.startsWith("//") && (i = "https:" + i), i && !i.startsWith("http") && (i = this.baseUrl + i);
                    let r = [];
                    return t.Author && Array.isArray(t.Author) && (r = t.Author.slice(0, 3)), new Comic({
                        id: e,
                        title: t.Title,
                        cover: i,
                        description: t.Content || "",
                        tags: r
                    });
                }), v = b.length || 20, w = f.Count || 0;
                return {
                    comics: y,
                    maxPage: (v > 0 ? Math.max(1, Math.ceil(w / v)) : y.length > 0 ? r + 1 : r) + 1
                };
            },
            optionList: [ {
                type: "select",
                label: "状态",
                options: [ "st0-全部", "st1-连载", "st2-已完结" ],
                default: "st0"
            }, {
                type: "select",
                label: "排序",
                options: [ "s2-最近更新", "s10-人气最旺", "s18-最近上架" ],
                default: "s2"
            } ]
        }, this.search = {
            load: async (t, e, i) => {
                let r = `${this.baseUrl}/search?title=${encodeURIComponent(t)}&language=1&page=${i}`, l = await Network.get(r, this._buildHeaders());
                if (200 !== l.status) throw `Search failed: ${l.status}`;
                let a = [], s = new HtmlDocument(l.body).querySelectorAll(".book-list > li");
                for (let t of s) {
                    var o, n, c;
                    let e = t.querySelector(".book-list-info > a"), i = null == e ? void 0 : e.attributes.href;
                    if (!i) continue;
                    i.startsWith("http") || (i = this.baseUrl + i);
                    let r = null == (o = t.querySelector(".book-list-info-title")) || null == (o = o.text) ? void 0 : o.trim(), l = t.querySelector(".book-list-cover-img"), s = null == l ? void 0 : l.attributes.src;
                    s && (s.startsWith("//") ? s = "https:" + s : s.startsWith("http") || (s = this.baseUrl + s));
                    let u = null == (n = t.querySelector(".book-list-info-desc")) || null == (n = n.text) ? void 0 : n.trim(), h = [], m = t.querySelectorAll(".book-list-info-bottom-item");
                    for (let t of m) h.push(t.text.trim());
                    let d = null == (c = t.querySelector(".book-list-info-bottom-right-font")) || null == (c = c.text) ? void 0 : c.trim();
                    d && h.push(d), a.push(new Comic({
                        id: i,
                        title: r,
                        cover: s,
                        description: u,
                        tags: h
                    }));
                }
                return {
                    comics: a,
                    maxPage: a.length > 0 ? i + 1 : i
                };
            },
            optionList: [],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async t => {
                var e, i, r, l, a, s, o, n;
                if (!t || "string" != typeof t) throw "ID不能为空";
                let c = t;
                c.startsWith("http") || (c = c.startsWith("/") ? this.baseUrl + c : this.baseUrl + "/" + c);
                let u = await Network.get(c, this._buildHeaders());
                if (200 !== u.status) throw `请求失败，状态码: ${u.status}，URL: ${c}`;
                let h = u.body || "";
                this.comic.id = t;
                let m = t => {
                    if (!t) return "";
                    let e = t.trim();
                    return e.startsWith("http") ? e : e.startsWith("//") ? "https:" + e : e.startsWith("/") ? this.baseUrl + e : this.baseUrl + "/" + e;
                }, d = new HtmlDocument(h), p = (null == (e = d.querySelector("p.detail-main-info-title")) || null == (e = e.text) ? void 0 : e.trim()) || (null == (i = d.querySelector("span.normal-top-title")) || null == (i = i.text) ? void 0 : i.trim()) || (null == (r = d.querySelector("title")) || null == (r = r.text) || null == (r = r.trim()) ? void 0 : r.replace(/漫画.*$/i, "")) || "未知标题", g = d.querySelector(".detail-main-cover img") || d.querySelector(".detail-main-cover .cover-img img"), f = m((null == g || null == (l = g.attributes) ? void 0 : l.src) || (null == g || null == (a = g.attributes) ? void 0 : a["data-src"]) || ""), b = d.querySelector(".detail-main-info-author"), y = "未知作者";
                if (b) {
                    let t = [], e = b.querySelectorAll("a") || [];
                    for (let i = 0; i < e.length; i++) {
                        var v;
                        let r = null == (v = e[i].text) ? void 0 : v.trim();
                        r && t.push(r);
                    }
                    if (t.length > 0) y = t.join("，"); else {
                        var w;
                        let t = null == (w = b.text) ? void 0 : w.replace(/作者[:：]/, "").trim();
                        t && (y = t);
                    }
                } else {
                    var S;
                    let t = null == (S = d.querySelector('meta[name="Author"]')) || null == (S = S.attributes) ? void 0 : S.content;
                    t && (y = t.includes(":") ? t.split(":").pop().trim() : t.trim());
                }
                let _ = (null == (s = d.querySelector(".detail-list-title-1")) || null == (s = s.text) ? void 0 : s.trim()) || "未知状态", x = d.querySelector(".detail-desc"), A = (null == x || null == (o = x.text) ? void 0 : o.trim()) || "";
                var $;
                A || (A = (null == ($ = d.querySelector('meta[name="Description"]')) || null == ($ = $.attributes) ? void 0 : $.content) || "");
                let q = [], C = d.querySelectorAll(".detail-main-info-class a") || [];
                for (let t = 0; t < C.length; t++) {
                    var U;
                    let e = null == (U = C[t].text) ? void 0 : U.trim();
                    e && q.push(e);
                }
                let I = (null == (n = d.querySelector(".detail-list-title-3")) || null == (n = n.text) ? void 0 : n.trim()) || "", P = null, k = d.querySelector(".detail-main-info-star");
                if (k && k.attributes && k.attributes.class) {
                    let t = k.attributes.class.match(/star-(\d+)/i);
                    if (t && t[1]) {
                        let e = parseInt(t[1], 10);
                        isNaN(e) || (P = e);
                    }
                }
                let M = new Map, N = d.querySelectorAll(".detail-selector .detail-selector-item");
                if (N.length > 0) for (let t of N) {
                    var W;
                    let e = null == (W = t.text) ? void 0 : W.trim();
                    if (!e || e.includes("评论")) continue;
                    let i = t.attributes.onclick, r = null;
                    if (i) {
                        let t = i.match(/titleSelect\(.*?,.*?, *['"](.*?)['"]\)/);
                        t && (r = t[1]);
                    }
                    if (r) {
                        let t = d.getElementById(r);
                        if (t) {
                            let i = new Map, r = t.querySelectorAll("a.chapteritem");
                            for (let t of r) {
                                var H, z;
                                let e = t.attributes.href, r = (null == (H = t.text) ? void 0 : H.trim()) || (null == (z = t.attributes.title) ? void 0 : z.trim());
                                e && r && (e.startsWith("http") || (e = m(e)), i.set(e, r));
                            }
                            i.size > 0 && M.set(e, i);
                        }
                    }
                }
                if (0 === M.size) {
                    let t = new Map, e = d.querySelectorAll("a.chapteritem");
                    for (let i of e) {
                        var T, E;
                        let e = i.attributes.href, r = (null == (T = i.text) ? void 0 : T.trim()) || (null == (E = i.attributes.title) ? void 0 : E.trim());
                        e && r && (e.startsWith("http") || (e = m(e)), t.set(e, r));
                    }
                    t.size > 0 && M.set("连载", t);
                }
                let R = (t => {
                    let e, i = [], r = /<li[^>]*class=["'][^"']*(?:list-comic|rec|recommend)[^"']*["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*>[^<]*<\/a>[\s\S]*?<a[^>]*>\s*([^<]+)\s*<\/a>/gi, l = 0;
                    for (;null !== (e = r.exec(t)) && l < 12; ) {
                        let t = e[1], r = e[2], a = (e[3] || "").trim();
                        t && a && (t.startsWith("http") || (t = m(t)), r && !r.startsWith("http") && (r = m(r)),
                        i.push(new Comic({
                            id: t,
                            title: a,
                            cover: r
                        })), l++);
                    }
                    return i;
                })(h), L = h.match(/mid["\s:]*(\d+)/i) || h.match(/var mid = (\d+)/i) || h.match(/mid=(\d+)/i) || h.match(/var DM5_MID = (\d+)/i) || h.match(/var COMIC_MID=(\d+)/i);
                return L && (this.comic.mid = parseInt(L[1])), new ComicDetails({
                    title: p,
                    cover: f,
                    description: A || "暂无描述",
                    tags: {
                        作者: [ y || "未知作者" ],
                        状态: [ _ || "未知状态" ],
                        标签: q
                    },
                    chapters: M,
                    recommend: R,
                    updateTime: I,
                    stars: P,
                    subId: this.comic.mid ? this.comic.mid.toString() : "73225"
                });
            },
            loadEp: async (t, e) => {
                let i = `${e}/`, r = await Network.get(i, this._buildHeaders());
                if (200 !== r.status) throw new Error("获取章节内容失败: " + r.status);
                let l = r.body, a = new HtmlDocument(l).querySelectorAll("script"), s = null;
                for (let t of a) if (t.innerHTML.includes("eval(function(p,a,c,k,e,d)")) {
                    s = t.innerHTML;
                    break;
                }
                if (!s) throw "无法显示付费内容/章节不存在";
                let o = s.indexOf("}('") + 3, n = s.substring(o).match(/',(\d+),(\d+),'/);
                if (!n) throw new Error("无法解析脚本参数边界");
                let c = n.index + o, u = s.substring(o, c), h = parseInt(n[1]), m = parseInt(n[2]), d = c + n[0].length, p = s.indexOf("'.split", d), g = ((t, e, i, r) => {
                    let l = t => (t < e ? "" : l(parseInt(t / e))) + ((t %= e) > 35 ? String.fromCharCode(t + 29) : t.toString(36)), a = {};
                    for (;i--; ) a[l(i)] = r[i] || l(i);
                    return t.replace(/\b\w+\b/g, t => a[t] || t);
                })(u, h, m, s.substring(d, p).split("|")), f = g.match(/\[(.*?)\]/);
                if (!f) throw new Error("无法从解密后的脚本中提取图片数组");
                let b = f[1].split(",").map(t => t.trim().replace(/^\\?['"]|\\?['"]$/g, "")).filter(t => t && t.startsWith("http"));
                return {
                    images: b
                };
            },
            onImageLoad: (t, e, i) => {
                let r = "";
                return r = i && "string" == typeof i ? i.startsWith("http") ? i : this.baseUrl + i : this.baseUrl + "/",
                {
                    headers: this._buildImageHeaders(t, r)
                };
            },
            onThumbnailLoad: t => ({
                headers: this._buildImageHeaders(t, this.baseUrl + "/")
            }),
            likeComic: async (t, e) => {},
            loadComments: async (t, e, i, r) => {
                if (!e) throw new Error("漫画ID未找到，无法加载评论");
                let l = i, a = null;
                if (r) {
                    let t = r.split("//");
                    a = t[0], l = parseInt(t[1]);
                }
                let s = `${this.baseUrl}/manhua-${t}/pagerdata.ashx`, o = {
                    d: Date.now(),
                    pageindex: l - 1,
                    pagesize: 767,
                    mid: e,
                    t: 4
                };
                s += "?" + Object.keys(o).map(t => `${t}=${encodeURIComponent(o[t])}`).join("&");
                let n = this._buildCommentHeaders(`${this.baseUrl}/manhua-${t}/`, null, !0), c = await Network.get(s, n);
                if (200 !== c.status) throw new Error(`加载评论失败，状态码: ${c.status}`);
                let u = JSON.parse(c.body);
                return this._parseComments(u, i, a, r);
            },
            loadChapterComments: async (t, e, i, r) => {
                let l = e.match(/m(\d+)/), a = l ? l[1] : null;
                if (!a) {
                    let t = e.match(/(\d+)\/?$/);
                    t && (a = t[1]);
                }
                if (!a) return {
                    comments: [],
                    maxPage: i
                };
                let s = i, o = null;
                if (r) {
                    let t = r.split("//");
                    o = t[0], s = parseInt(t[1]);
                }
                let n = `https://www.manhuaren.com/showcomment/pagerdata.ashx?d=${Date.now()}&pageindex=${s}&pagesize=20&cid=${a}&t=9`, c = this._buildCommentHeaders(`https://www.manhuaren.com/showcomment/?cid=${a}`, "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1", !1), u = await Network.get(n, c);
                if (200 !== u.status) return {
                    comments: [],
                    maxPage: i
                };
                let h = [];
                try {
                    h = JSON.parse(u.body);
                } catch (t) {}
                return Array.isArray(h) ? this._parseComments(h, i, o, r) : {
                    comments: [],
                    maxPage: i
                };
            }
        };
    }
    init() {}
    get baseUrl() {
        return "https://www.manhuaren.com";
    }
    _mapComment(t, e, i) {
        return new Comment({
            id: i ? t.Id.toString() : `${t.Id}//${e}`,
            userName: t.Poster,
            content: t.PostContent,
            time: t.PostTime,
            avatar: t.HeadUrl,
            likeCount: t.PraiseCount,
            isLiked: t.IsPraise,
            replyCount: i ? 0 : t.ToPostShowDataItems ? t.ToPostShowDataItems.length : 0
        });
    }
    _parseComments(t, e, i, r) {
        let l = [], a = 0;
        if (r) {
            let r = t.find(t => t.Id.toString() === i);
            r && r.ToPostShowDataItems && (l = r.ToPostShowDataItems.map(t => this._mapComment(t, e, !0)));
        } else l = t.map(t => this._mapComment(t, e, !1)), a = l == [] ? e : null;
        return {
            comments: l,
            maxPage: r ? 1 : a
        };
    }
    _buildHeaders() {
        return {
            "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            pragma: "no-cache",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            host: "www.manhuaren.com"
        };
    }
    _buildCommentHeaders(t, e, i) {
        const r = this._buildHeaders();
        return e && (r["user-agent"] = e), i || (delete r["sec-ch-ua"], delete r["sec-ch-ua-mobile"],
        delete r["sec-ch-ua-platform"]), Object.assign(r, {
            connection: "keep-alive",
            referer: t,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        });
    }
    _buildImageHeaders(t, e) {
        let i = "";
        try {
            i = new URL(t).host;
        } catch (e) {
            let r = t.match(/^https?:\/\/([^\/]+)/i);
            i = r ? r[1] : "";
        }
        return {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            Pragma: "no-cache",
            Referer: e || this.baseUrl + "/",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Storage-Access": "active",
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"'
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, e, i) {
    const r = String(null == t ? "" : t).trim() || e;
    return i ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(t) {
    const e = __veneraGetRuntimeGlobal(), i = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(i.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), l = __veneraNormalizeAuthorityPart(i.providerPath, "gh", !0), a = __veneraNormalizeAuthorityPart(i.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(i.releaseRef, "main", !1), o = __veneraNormalizeAuthorityPart(i.artifactPathPrefix, "dist/plugins", !0), n = String(t || "").replace(/^\/+/, "");
    if (!n) return `${r}/${l}/${a}@${s}`;
    const c = o ? `${o}/${n}` : n;
    return `${r}/${l}/${a}@${s}/${n.startsWith(`${o}/`) ? n : c}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
