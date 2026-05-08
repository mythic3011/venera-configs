const YKMH_DESKTOP_BASE_URL = normalizeWebSourceBaseUrl("https://www.ykmh.net"), YKMH_MOBILE_BASE_URL = normalizeWebSourceBaseUrl("https://m.ykmh.net"), YKMH_DESKTOP_DEFAULT_COVER = buildWebSourceUrl(YKMH_DESKTOP_BASE_URL, "/images/default/cover.png"), YKMH_MOBILE_DEFAULT_COVER = buildWebSourceUrl(YKMH_MOBILE_BASE_URL, "/images/default/cover.png");

function toYkmhDesktopUrl(e) {
    return toWebSourceAbsoluteUrl(e, YKMH_DESKTOP_BASE_URL);
}

function toYkmhMobileUrl(e) {
    return toWebSourceAbsoluteUrl(e, YKMH_MOBILE_BASE_URL);
}

function toYkmhMobileComicUrl(e) {
    return ensureWebSourceTrailingSlash(toYkmhMobileUrl(replaceWebSourceBaseUrl(String(e || "").trim(), YKMH_DESKTOP_BASE_URL, YKMH_MOBILE_BASE_URL)));
}

function buildYkmhCategoryRequestUrl(e, t, a) {
    return "" === e || void 0 === e ? buildWebSourceUrl(YKMH_DESKTOP_BASE_URL, `/list/${t}/`, {
        page: a
    }) : buildWebSourceUrl(YKMH_DESKTOP_BASE_URL, `/list/${e}/${t}/${a}/`);
}

function buildYkmhSearchRequestUrl(e, t) {
    const a = {
        keywords: e
    };
    return t && t > 1 && (a.page = t), buildWebSourceUrl(YKMH_DESKTOP_BASE_URL, "/search/", a);
}

class YKMHSource extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "优酷漫画", this.key = "ykmh", this.version = "1.0.0", this.minAppVersion = "1.4.0",
        this.url = resolvePluginUpdateUrl("ykmh.js"), this.explore = [ {
            title: "优酷漫画",
            type: "multiPartPage",
            load: async e => {
                let t = await Network.get(this.baseUrl);
                if (200 !== t.status) throw `Invalid status code: ${t.status}`;
                return [ {
                    title: "热门推荐",
                    comics: function(e) {
                        let t, a = [], i = /<div class="sub-item">\s*<a href="([^"]+)" target="_blank"><img src="([^"]+)" alt="[^"]*"><\/a>\s*<div class="carousel-caption">\s*([^<]+)\s*<\/div>/g;
                        for (;null !== (t = i.exec(e)); ) {
                            let e = toYkmhDesktopUrl(t[2]);
                            a.push(new Comic({
                                id: t[1],
                                title: t[3].trim(),
                                cover: e,
                                tags: [ "热门推荐" ],
                                description: "热门推荐漫画"
                            }));
                        }
                        if (0 === a.length) {
                            let i = /<li data-key="(\d+)"><a href="(https:\/\/www\.ykmh\.net\/manhua\/[^"]+)"[^>]*>([^<]+)<\/a><\/li>/g;
                            for (;null !== (t = i.exec(e)); ) a.push(new Comic({
                                id: t[2],
                                title: t[3],
                                cover: YKMH_DESKTOP_DEFAULT_COVER,
                                tags: [ "热门关键词" ],
                                description: ""
                            }));
                        }
                        return a.slice(0, 10);
                    }(t.body)
                }, {
                    title: "最新更新",
                    comics: function(e) {
                        let t, a = [], i = /<li data-key="(\d+)"><a class="image-link" href="([^"]+)" title="([^"]+)"><img src="([^"]+)"[^>]*><span class="tip"><p>([^<]*)<\/p><\/span><\/a><p><a href="[^"]*" title="[^"]*">([^<]+)<\/a><\/p>/g;
                        for (;null !== (t = i.exec(e)); ) {
                            let e = toYkmhDesktopUrl(t[4]);
                            a.push(new Comic({
                                id: t[2],
                                title: t[3],
                                cover: e,
                                tags: [ t[5] ],
                                description: `更新至：${t[5]}`
                            }));
                        }
                        return a.slice(0, 15);
                    }(t.body)
                } ];
            }
        } ], this.category = {
            title: "优酷漫画",
            parts: [ {
                name: "主题",
                type: "fixed",
                categories: Object.keys(YKMHSource.category_param_dict),
                itemType: "category",
                categoryParams: Object.values(YKMHSource.category_param_dict)
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, a, i) => {
                let o = "";
                temp = a[1].split("-")[0], o = 0 == temp ? "" : "-", o += a[0].split("-")[0];
                let r = buildYkmhCategoryRequestUrl(t, o, i), n = await Network.get(r);
                if (200 !== n.status) throw `Invalid status code: ${n.status}`;
                let s = function(e) {
                    let t, a = [], i = /<li class="list-comic" data-key="(\d+)">\s*<a class="comic_img"\s+href="([^"]+)"><img src="([^"]+)" alt="([^"]*)"[^>]*><\/a>\s*<span class="comic_list_det"[^>]*>\s*<h3><a href="[^"]*">([^<]+)<\/a><\/h3>/g;
                    for (;null !== (t = i.exec(e)); ) {
                        let e = toYkmhDesktopUrl(t[3]);
                        a.push(new Comic({
                            id: t[2],
                            title: t[5] || t[4],
                            cover: e,
                            tags: [],
                            description: ""
                        }));
                    }
                    return a;
                }(n.body), l = 1, c = n.body.match(/<li class="last"><a href="[^"]*\/(\d+)\/" data-page="\d+">尾页<\/a><\/li>/);
                if (c) l = parseInt(c[1]); else {
                    let e = /<li class="last"><a href="[^"]*" data-page="(\d+)">尾页<\/a><\/li>/, t = n.body.match(e);
                    t && (l = parseInt(t[1]) + 1);
                }
                return {
                    comics: s,
                    maxPage: l
                };
            },
            optionList: [ {
                options: [ "update-更新时间", "post-发布时间", "click-点击量" ]
            }, {
                options: [ "0-降序", "1-升序" ]
            } ]
        }, this.search = {
            load: async (e, t, a) => {
                let i = buildYkmhSearchRequestUrl(e, a), o = await Network.get(i);
                if (200 !== o.status) throw `Request Error: ${o.status}`;
                let r = function(e) {
                    let t, a = [], i = /<li class="list-comic" data-key="(\d+)"><a class="image-link"\s+href="([^"]+)"\s+title="([^"]+)"><img src="([^"]+)"[^>]*><\/a>\s*<p><a href="[^"]*"[^>]*>([^<]+)<\/a><\/p>\s*<p class="auth"><a href="[^"]*">([^<]*)<\/a><\/p>\s*<p class="newPage">([^<]*)<\/p>/g;
                    for (;null !== (t = i.exec(e)); ) {
                        let e = toYkmhDesktopUrl(t[4]);
                        a.push(new Comic({
                            id: t[2],
                            title: t[3],
                            cover: e,
                            tags: [ t[6] || "未知作者", t[7] || "" ],
                            description: `作者：${t[6] || "未知作者"} | 更新至：${t[7] || "未知"}`
                        }));
                    }
                    return a;
                }(o.body), n = 1, s = o.body.match(/<li class="last"><a href="[^"]*page=(\d+)"[^>]*>尾页<\/a><\/li>/);
                if (s) n = parseInt(s[1]); else {
                    let e = /<a href="[^"]*page=(\d+)"[^>]*>\s*(\d+)\s*<\/a>/g, t = [ ...o.body.matchAll(e) ];
                    t.length > 0 && (n = Math.max(...t.map(e => parseInt(e[2]))));
                }
                return {
                    comics: r,
                    maxPage: n
                };
            },
            optionList: []
        }, this.comic = {
            id: null,
            buildId: null,
            loadInfo: async e => {
                if (!e || "string" != typeof e) throw "ID不能为空";
                let t = toYkmhMobileComicUrl(e), a = await Network.get(t, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0"
                    }
                });
                if (200 !== a.status) throw `请求失败，状态码: ${a.status}，URL: ${t}`;
                try {
                    if (this.comic.id = e, !a.body || "string" != typeof a.body) throw "响应内容为空或格式错误";
                    let t = function(e) {
                        try {
                            if (!e || "string" != typeof e) return {
                                title: "未知标题",
                                cover: YKMH_MOBILE_DEFAULT_COVER,
                                author: "未知作者",
                                status: "未知状态",
                                tags: [],
                                description: "暂无描述"
                            };
                            let t = "未知标题";
                            try {
                                let a = e.match(/<div class="BarTit" id="comicName">([^<]+)<\/div>/);
                                a && a[1] && (t = a[1].trim());
                            } catch (e) {
                                console.warn("解析标题失败:", e);
                            }
                            let a = YKMH_MOBILE_DEFAULT_COVER;
                            try {
                                let t = e.match(/<div class="pic" id="Cover">\s*<mip-img src="([^"]+)"/);
                                if (t && t[1]) a = t[1]; else {
                                    let t = e.match(/<mip-img src="([^"]+)"/);
                                    t && t[1] && (a = t[1]);
                                }
                            } catch (e) {
                                console.warn("解析封面失败:", e);
                            }
                            let i = "未知作者";
                            try {
                                let t = e.match(/<p class="txtItme">\s*<span class="icon icon01"><\/span>\s*<a href="[^"]*">([^<]+)<\/a>\s*<\/p>/);
                                if (t && t[1]) i = t[1].trim(); else {
                                    let t = e.match(/<span class="icon icon01"><\/span>\s*<a href="[^"]*">([^<]+)<\/a>/);
                                    t && t[1] && (i = t[1].trim());
                                }
                                console.log("解析到作者:", i);
                            } catch (e) {
                                console.warn("解析作者失败:", e);
                            }
                            let o = "未知状态", r = [];
                            try {
                                let t = e.match(/<p class="txtItme">[\s\S]*?<\/p>/g);
                                if (t) {
                                    console.log("找到txtItme元素数量:", t.length);
                                    for (let e of t) if (e.includes("icon icon02")) {
                                        let t = e.matchAll(/<a href="[^"]*\/list\/[^"]*\/">([^<]+)<\/a>/g);
                                        if (t) for (let e of t) if (e && e[1]) {
                                            let t = e[1].trim();
                                            t && !r.includes(t) && (r.push(t), "连载中" !== t && "已完结" !== t && "完结" !== t && "连载" !== t && "暂停" !== t && "休刊" !== t || (o = t,
                                            console.log("找到状态标签:", t)));
                                        }
                                    }
                                }
                                console.log("解析到状态:", o, "标签:", r);
                            } catch (e) {
                                console.warn("解析标签失败:", e), r = [];
                            }
                            let n = "暂无描述";
                            try {
                                let t = e.match(/<mip-showmore[^>]*id="showmore-des">\s*([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*?)\s*<\/mip-showmore>/);
                                t && t[1] && (n = t[1].replace(/<[^>]+>/g, "").replace(/^\s*介绍:\s*/, "").trim());
                            } catch (e) {
                                console.warn("解析描述失败:", e);
                            }
                            return {
                                title: t || "未知标题",
                                cover: a ? toYkmhMobileUrl(a) : YKMH_MOBILE_DEFAULT_COVER,
                                author: i || "未知作者",
                                status: o || "未知状态",
                                tags: r || [],
                                description: n || "暂无描述"
                            };
                        } catch (e) {
                            return console.error("parseComicInfo 总体错误:", e), {
                                title: "未知标题",
                                cover: YKMH_MOBILE_DEFAULT_COVER,
                                author: "未知作者",
                                status: "未知状态",
                                tags: [],
                                description: "暂无描述"
                            };
                        }
                    }(a.body), i = function(e) {
                        let t = new Map, a = new Map;
                        try {
                            if (!e || "string" != typeof e) return t;
                            let i, o = /<div class="comic-chapters">[\s\S]*?<span class="Title">([^<]+)<\/span>[\s\S]*?<ul id="chapter-list-(\d+)"[^>]*>([\s\S]*?)<\/ul>/g;
                            for (;null !== (i = o.exec(e)); ) try {
                                if (i && i[1] && i[3]) {
                                    let e, o = i[1].trim(), r = i[3], n = new Map, s = /<li>\s*<a href="([^"]+)"[^>]*>\s*<span>([^<]+)<\/span>\s*<\/a>\s*<\/li>/g;
                                    for (;null !== (e = s.exec(r)); ) try {
                                        if (e && e[1] && e[2]) {
                                            let a = toYkmhMobileUrl(e[1]), i = e[2].trim();
                                            n.set(a, i);
                                            let r = i;
                                            "连载列表" !== o && (r = `[${o}] ${i}`), t.set(a, r);
                                        }
                                    } catch (e) {
                                        console.warn("解析单个章节失败:", e);
                                        continue;
                                    }
                                    n.size > 0 && a.set(o, n);
                                }
                            } catch (e) {
                                console.warn("解析章节组别失败:", e);
                                continue;
                            }
                            if (0 === t.size) {
                                console.warn("使用备用章节解析方法");
                                let a, i = /<li>\s*<a href="([^"]+)"[^>]*>\s*<span>([^<]+)<\/span>\s*<\/a>\s*<\/li>/g;
                                for (;null !== (a = i.exec(e)); ) try {
                                    if (a && a[1] && a[2]) {
                                        let e = toYkmhMobileUrl(a[1]), i = a[2].trim();
                                        t.set(e, i);
                                    }
                                } catch (e) {
                                    console.warn("解析单个章节失败:", e);
                                    continue;
                                }
                            }
                            return a.size > 1 ? (console.log("使用多分组模式"), a) : (console.log("使用合并模式"), t);
                        } catch (e) {
                            console.error("parseChapters 总体错误:", e);
                        }
                        return t;
                    }(a.body), o = function(e) {
                        let t = [];
                        try {
                            if (!e || "string" != typeof e) return t;
                            let a, i = /<li class="list-comic" data-key="[^"]*">\s*<a class="ImgA" href="([^"]+)"><mip-img src="([^"]+)"[^>]*alt="([^"]*)"[^>]*><\/mip-img><\/a>\s*<a class="txtA" href="[^"]+">([^<]+)<\/a>/g, o = 0;
                            for (;null !== (a = i.exec(e)) && o < 10; ) try {
                                if (a && a[1] && a[2]) {
                                    let e = a[1], i = a[2], r = a[4] && a[4].trim() || a[3] && a[3].trim() || "未知标题";
                                    t.push(new Comic({
                                        id: e,
                                        title: r,
                                        cover: i
                                    })), o++;
                                }
                            } catch (e) {
                                console.warn("解析单个推荐漫画失败:", e);
                                continue;
                            }
                        } catch (e) {
                            console.error("parseRecommends 总体错误:", e);
                        }
                        return t;
                    }(a.body);
                    t = t || {}, t.title || (t.title = "未知标题"), t.author || (t.author = "未知作者"), t.status || (t.status = "未知状态"),
                    t.description || (t.description = "暂无描述"), t.cover || (t.cover = YKMH_MOBILE_DEFAULT_COVER),
                    t.tags && Array.isArray(t.tags) || (t.tags = []);
                    let r = "暂无更新";
                    try {
                        if (i && i.size > 0) {
                            let e = null, t = Array.from(i.values())[0];
                            if (t instanceof Map) {
                                for (let t of i.values()) if (t.size > 0) {
                                    e = Array.from(t.values())[0];
                                    break;
                                }
                            } else e = t;
                            e && (r = `更新至：${e}`);
                        }
                    } catch (e) {
                        console.warn("获取更新信息失败:", e);
                    }
                    let n = t.status;
                    try {
                        YKMHSource.comic_status && t.status && (n = YKMHSource.comic_status[t.status], n || (n = t.status.includes("连载") ? "ongoing" : t.status.includes("完结") ? "completed" : t.status.includes("暂停") || t.status.includes("休刊") ? "paused" : t.status));
                    } catch (e) {
                        console.warn("状态映射失败:", e), n = t.status;
                    }
                    return {
                        title: t.title,
                        cover: t.cover,
                        description: t.description,
                        tags: {
                            作者: [ t.author ],
                            状态: [ n ],
                            更新: [ r ],
                            标签: t.tags
                        },
                        chapters: i || new Map,
                        recommend: o || []
                    };
                } catch (e) {
                    throw console.error("loadInfo详细错误:", e), `解析漫画信息失败: ${e.message || e}`;
                }
            },
            loadEp: async (e, t) => {
                if (!e || "string" != typeof e) throw "漫画ID不能为空";
                if (!t || "string" != typeof t) throw "章节ID不能为空";
                let a = toYkmhMobileUrl(replaceWebSourceBaseUrl(t, YKMH_DESKTOP_BASE_URL, YKMH_MOBILE_BASE_URL)), i = await Network.get(a, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                    }
                });
                if (200 !== i.status) throw `请求章节失败，状态码: ${i.status}`;
                try {
                    let e = function(e) {
                        let t = [], a = e.match(/var\s+chapterImages\s*=\s*(\[.*?\]);/);
                        if (a) try {
                            t = JSON.parse(a[1]).map(e => toYkmhMobileUrl(e));
                        } catch (e) {}
                        if (0 === t.length) {
                            let a, i = /<img[^>]+src="([^"]+)"[^>]*>/g;
                            for (;null !== (a = i.exec(e)); ) {
                                let e = a[1];
                                e.includes("cover") || e.includes("avatar") || e.includes("logo") || e.includes("icon") || e.includes("banner") || (e = toYkmhMobileUrl(e),
                                t.push(e));
                            }
                        }
                        if (0 === t.length) {
                            let a = /<div[^>]*class="[^"]*chapter[^"]*"[^>]*>(.*?)<\/div>/gs, i = e.match(a);
                            if (i) {
                                let e, a = i[1], o = /<img[^>]+src="([^"]+)"/g;
                                for (;null !== (e = o.exec(a)); ) {
                                    let a = e[1];
                                    a = toYkmhMobileUrl(a), t.push(a);
                                }
                            }
                        }
                        return t;
                    }(i.body);
                    return 0 === e.length && console.warn("未找到章节图片，可能需要进一步的页面解析"), {
                        images: e || []
                    };
                } catch (e) {
                    throw `解析章节图片失败: ${e.message || e}`;
                }
            },
            onClickTag: createMappedCategoryTagActionResolver({
                namespace: "标签",
                mapping: YKMHSource.category_param_dict,
                unsupportedMessage: "未支持此类Tag检索"
            })
        };
    }
    get baseUrl() {
        return YKMH_DESKTOP_BASE_URL;
    }
}

function normalizeWebSourceBaseUrl(e, t) {
    const a = t && "object" == typeof t && !Array.isArray(t) ? t : {}, i = "string" == typeof a.defaultScheme ? a.defaultScheme.trim() : "";
    let o = String(e || "").trim();
    return o ? (i && !/^https?:\/\//i.test(o) && (o = `${i.replace(/:$/, "")}://${o}`),
    o.replace(/\/+$/, "")) : "";
}

function normalizeWebSourcePath(e, t) {
    const a = String(null == e ? t || "" : e).trim();
    return a ? /^https?:\/\//i.test(a) || a.startsWith("//") || a.startsWith("/") ? a : `/${a}` : "";
}

function joinWebSourcePath(e, t) {
    const a = normalizeWebSourcePath(e, "/"), i = Array.isArray(t) ? t : [];
    let o = a;
    for (const e of i) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (o = `${o}/${t}`);
    }
    return o;
}

function buildWebSourceQuery(e) {
    if (!e || "object" != typeof e) return "";
    const t = [];
    for (const a of Object.keys(e)) {
        const i = e[a];
        if (null != i && "" !== i) if (Array.isArray(i)) for (const e of i) null != e && "" !== e && t.push(`${encodeURIComponent(a)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(a)}=${encodeURIComponent(String(i))}`);
    }
    return t.join("&");
}

function buildWebSourceUrl(e, t, a) {
    const i = normalizeWebSourceBaseUrl(e || ""), o = normalizeWebSourcePath(t, "");
    let r = o;
    /^https?:\/\//i.test(o) || o.startsWith("//") || (r = o ? `${i}${o.startsWith("/") ? "" : "/"}${o}` : i);
    const n = buildWebSourceQuery(a);
    return n ? `${r}${r.includes("?") ? "&" : "?"}${n}` : r;
}

function toWebSourceAbsoluteUrl(e, t) {
    const a = String(e || "").trim();
    return a ? /^https?:\/\//i.test(a) ? a : a.startsWith("//") ? `${normalizeWebSourceBaseUrl(t || "", {
        defaultScheme: "https"
    }).startsWith("http://") ? "http:" : "https:"}${a}` : buildWebSourceUrl(t, a) : "";
}

function replaceWebSourceBaseUrl(e, t, a) {
    const i = String(e || "").trim(), o = normalizeWebSourceBaseUrl(t || ""), r = normalizeWebSourceBaseUrl(a || "");
    return i && o && r ? i === o ? r : i.startsWith(`${o}/`) ? `${r}${i.slice(o.length)}` : i : i;
}

function ensureWebSourceTrailingSlash(e) {
    const t = String(e || "").trim();
    return t ? t.endsWith("/") ? t : `${t}/` : t;
}

function resolveMappedCategoryTagAction(e, t, a) {
    const i = a && "object" == typeof a && !Array.isArray(a) ? a : {}, o = null == i.namespace ? "标签" : String(i.namespace);
    if (String(e) !== o) throw i.unsupportedMessage || "Unsupported tag namespace";
    const r = i.mapping && "object" == typeof i.mapping ? i.mapping : {}, n = String(null == t ? "" : t), s = r[n], l = "function" == typeof i.keywordFormatter ? i.keywordFormatter(n, s, e) : n, c = "function" == typeof i.paramFormatter ? i.paramFormatter(n, s, e) : String(s);
    return {
        action: i.action || "category",
        keyword: l,
        param: c
    };
}

function createMappedCategoryTagActionResolver(e) {
    return (t, a) => resolveMappedCategoryTagAction(t, a, e);
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const i = String(null == e ? "" : e).trim() || t;
    return a ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), o = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${o}/${r}@${n}`;
    const c = s ? `${s}/${l}` : l;
    return `${i}/${o}/${r}@${n}/${l.startsWith(`${s}/`) ? l : c}`;
}

YKMHSource.category_param_dict = {
    全部: "",
    爱情: "aiqing",
    剧情: "juqing",
    欢乐向: "huanlexiang",
    格斗: "gedou",
    科幻: "kehuan",
    伪娘: "weiniang",
    节操: "jiecao",
    恐怖: "kongbu",
    悬疑: "xuanyi",
    冒险: "maoxian",
    校园: "xiaoyuan",
    治愈: "zhiyu",
    恋爱: "lianai",
    奇幻: "qihuan",
    热血: "rexue",
    限制级: "xianzhiji",
    魔法: "mofa",
    后宫: "hougong",
    魔幻: "mohuan",
    轻小说: "qingxiaoshuo",
    震撼: "zhenhan",
    纯爱: "chunai",
    少女: "shaonv",
    战争: "zhanzheng",
    武侠: "wuxia",
    搞笑: "gaoxiao",
    神鬼: "shengui",
    竞技: "jingji",
    幻想: "huanxiang",
    神魔: "shenmo",
    灵异: "lingyi",
    百合: "baihe",
    运动: "yundong",
    体育: "tiyu",
    惊悚: "jingsong",
    日常: "richang",
    绅士: "shenshi",
    颜艺: "yanyi",
    生活: "shenghuo",
    四格: "sige",
    萌系: "mengxi",
    都市: "dushi",
    同人: "tongren",
    推理: "tuili",
    耽美: "danmei",
    卖肉: "mairou",
    职场: "zhichang",
    侦探: "zhentan",
    战斗: "zhandou",
    爆笑: "baoxiao",
    总裁: "zongcai",
    美食: "meishi",
    性转换: "xingzhuanhuan",
    励志: "lizhi",
    西方魔幻: "xifangmohuan",
    改编: "gaibian",
    其他: "qita",
    宅系: "zhaixi",
    机战: "jizhan",
    乙女: "yinv",
    秀吉: "xiuji",
    舰娘: "jianniang",
    历史: "lishi",
    猎奇: "lieqi",
    社会: "shehui",
    青春: "qingchun",
    高清单行: "gaoqingdanxing",
    东方: "dongfang",
    橘味: "juwei",
    音乐舞蹈: "yinyuewudao",
    家庭: "jiating",
    ゆり: "unknown",
    彩虹: "caihong",
    少年: "shaonian",
    泡泡: "paopao",
    宫斗: "gongdou",
    动作: "dongzuo",
    青年: "qingnian",
    虐心: "nuexin",
    泛爱: "fanai",
    机甲: "jijia",
    装逼: "zhuangbi",
    "#愛情": "aiqing2",
    "#長條": "zhangtiao",
    "#穿越": "chuanyue",
    "#生活": "shenghuo2",
    TS: "TS",
    "#耽美": "danmei2",
    "#后宫": "hougong2",
    "#节操": "jiecao2",
    "#轻小说": "qingxiaoshuo2",
    "#奇幻": "qihuan2",
    "#悬疑": "xuanyi2",
    "#校园": "xiaoyuan2",
    "#爱情": "aiqing3",
    "#百合": "baihe2",
    "#长条": "changtiao",
    "#冒险": "maoxian2",
    "#搞笑": "gaoxiao2",
    "#欢乐向": "huanlexiang2",
    "#职场": "zhichang2",
    "#神鬼": "shengui2",
    "#生存": "shengcun",
    "#治愈": "zhiyu2",
    "#竞技": "jingji2",
    "#美食": "meishi2",
    "#其他": "qita2",
    "#机战": "jizhan2",
    "#战争": "zhanzheng2",
    "#科幻": "kehuan2",
    "#四格": "sige2",
    "#武侠": "wuxia2",
    "#重生": "zhongsheng",
    "#性转换": "xingzhuanhuan2",
    "#热血": "rexue2",
    "#伪娘": "weiniang2",
    "#异世界": "yishijie",
    "#萌系": "mengxi2",
    "#格斗": "gedou2",
    "#励志": "lizhi2",
    "#都市": "dushi2",
    "#惊悚": "jingsong2",
    "#侦探": "zhentan2",
    "#舰娘": "jianniang2",
    "#音乐舞蹈": "yinyuewudao2",
    "#TL": "TL",
    "#AA": "AA",
    "#转生": "zhuansheng",
    "#魔幻": "mohuan2",
    "---": "unknown2",
    "#彩色": "caise",
    福瑞: "furui",
    "#FATE": "FATE",
    西幻: "xihuan",
    "#C99": "C99",
    "#C101": "C101",
    "#历史": "lishi2",
    "#C102": "C102",
    "#无修正": "wuxiuzheng",
    "#C103": "C103",
    "#东方": "dongfang2",
    栏目: "lanmu",
    异世界: "yishijie2",
    恶搞: "egao",
    霸总: "bazong",
    古风: "gufeng",
    穿越: "chuanyue2",
    玄幻: "xuanhuan",
    日更: "rigeng",
    吸血: "xixie",
    萝莉: "luoli",
    漫改: "mangai",
    唯美: "weimei",
    宅男腐女: "zhainanfunv",
    老师: "laoshi",
    诱惑: "youhuo",
    杂志: "zazhi",
    脑洞: "naodong",
    其它: "qita3",
    "#恐怖": "kongbu2",
    "#C105": "C105",
    权谋: "quanmou",
    大陆: "dalu",
    日本: "riben",
    香港: "hongkong",
    台湾: "taiwan",
    欧美: "oumei",
    韩国: "hanguo",
    其它: "qita",
    儿童漫画: "ertong",
    少年漫画: "shaonian",
    少女漫画: "shaonv",
    青年漫画: "qingnian",
    已完结: "wanjie",
    连载中: "lianzai"
}, YKMHSource.comic_status = {
    连载中: "ongoing",
    已完结: "completed",
    暂停: "paused",
    完结: "completed",
    连载: "ongoing",
    休刊: "paused",
    未知状态: "unknown"
}, "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver
});
