class Ikm extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "爱看漫", this.key = "ikmmh", this.version = "1.0.5", this.minAppVersion = "1.0.0",
        this.url = resolvePluginUpdateUrl("ikmmh.js"), this.account = {
            login: async (e, t) => {
                try {
                    let r = await Network.post(`${Ikm.baseUrl}/api/user/userarr/login`, Ikm.jsonHead, `user=${e}&pass=${t}`);
                    if (200 !== r.status) throw new Error(`登录失败，状态码：${r.status}`);
                    needPassValidator(r.body) && (r = await Network.post(`${Ikm.baseUrl}/api/user/userarr/login`, Ikm.jsonHead, `user=${e}&pass=${t}`));
                    let a = JSON.parse(r.body);
                    if (0 !== a.code) throw new Error(a.msg || "登录异常");
                    return "ok";
                } catch (e) {
                    throw new Error(`登录失败：${e.message}`);
                }
            },
            logout: () => Network.deleteCookies("www.ikmmh.com"),
            registerWebsite: `${Ikm.baseUrl}/user/register/`
        }, this.explore = [ {
            title: this.name,
            type: "singlePageWithMultiPart",
            load: async () => {
                try {
                    let e = await Network.get(`${Ikm.baseUrl}/`, Ikm.webHeaders);
                    if (200 !== e.status) throw new Error(`加载探索页面失败，状态码：${e.status}`);
                    needPassValidator(e.body) && (e = await Network.get(`${Ikm.baseUrl}/`, Ikm.webHeaders));
                    let t = new HtmlDocument(e.body), r = e => ({
                        title: e.querySelector("div.title").text.split("~")[0],
                        cover: e.querySelector("div.thumb_img").attributes["data-src"],
                        id: `${Ikm.baseUrl}${e.querySelector("a").attributes.href}`
                    });
                    return {
                        本周推荐: t.querySelectorAll("div.module-good-fir > div.item").map(r),
                        今日更新: t.querySelectorAll("div.module-day-fir > div.item").map(r)
                    };
                } catch (e) {
                    throw new Error(`探索页面加载失败：${e.message}`);
                }
            },
            onThumbnailLoad: Ikm.thumbConfig
        } ], this.category = {
            title: "爱看漫",
            parts: [ {
                name: "更新",
                type: "fixed",
                categories: [ "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日" ],
                itemType: "category",
                categoryParams: [ "1", "2", "3", "4", "5", "6", "7" ]
            }, {
                name: "分类",
                type: "fixed",
                categories: [ "全部", "长条", "大女主", "百合", "耽美", "纯爱", "後宫", "韩漫", "奇幻", "轻小说", "生活", "悬疑", "格斗", "搞笑", "伪娘", "竞技", "职场", "萌系", "冒险", "治愈", "都市", "霸总", "神鬼", "侦探", "爱情", "古风", "欢乐向", "科幻", "穿越", "性转换", "校园", "美食", "悬疑", "剧情", "热血", "节操", "励志", "异世界", "历史", "战争", "恐怖", "霸总" ],
                itemType: "category"
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, r, a) => {
                try {
                    let o;
                    if (t) {
                        if (o = await Network.get(`${Ikm.baseUrl}/update/${t}.html`, Ikm.webHeaders), 200 !== o.status) throw new Error(`分类请求失败，状态码：${o.status}`);
                        return needPassValidator(o.body) && (o = await Network.get(`${Ikm.baseUrl}/update/${t}.html`, Ikm.webHeaders)),
                        {
                            comics: new HtmlDocument(o.body).querySelectorAll("li.comic-item").map(e => ({
                                title: e.querySelector("p.title").text.split("~")[0],
                                cover: e.querySelector("img").attributes.src,
                                id: `${Ikm.baseUrl}${e.querySelector("a").attributes.href}`,
                                subTitle: e.querySelector("span.chapter").text
                            })),
                            maxPage: 1
                        };
                    }
                    {
                        o = await Network.post(`${Ikm.baseUrl}/api/comic/index/lists`, Ikm.jsonHead, `area=${r[1]}&tags=${encodeURIComponent(e)}&full=${r[0]}&page=${a}`),
                        needPassValidator(o.body) && (o = await Network.post(`${Ikm.baseUrl}/api/comic/index/lists`, Ikm.jsonHead, `area=${r[1]}&tags=${encodeURIComponent(e)}&full=${r[0]}&page=${a}`));
                        let t = JSON.parse(o.body);
                        return {
                            comics: t.data.map(e => ({
                                id: `${Ikm.baseUrl}${e.info_url}`,
                                title: e.name.split("~")[0],
                                subTitle: e.author,
                                cover: e.cover,
                                tags: e.tags,
                                description: e.lastchapter
                            })),
                            maxPage: t.end || 1
                        };
                    }
                } catch (e) {
                    throw new Error(`分类加载失败：${e.message}`);
                }
            },
            onThumbnailLoad: Ikm.thumbConfig,
            optionList: [ {
                options: [ "3-全部", "4-连载中", "1-已完结" ],
                notShowWhen: [ "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日" ],
                showWhen: null
            }, {
                options: [ "9-全部", "1-日漫", "2-港台", "3-美漫", "4-国漫", "5-韩漫", "6-未分类" ],
                notShowWhen: [ "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日" ],
                showWhen: null
            } ]
        }, this.search = {
            load: async (e, t, r) => {
                try {
                    let t = await Network.get(`${Ikm.baseUrl}/search?searchkey=${encodeURIComponent(e)}`, Ikm.webHeaders);
                    return needPassValidator(t.body) && (t = await Network.get(`${Ikm.baseUrl}/search?searchkey=${encodeURIComponent(e)}`, Ikm.webHeaders)),
                    {
                        comics: new HtmlDocument(t.body).querySelectorAll("li.comic-item").map(e => ({
                            title: e.querySelector("p.title").text.split("~")[0],
                            cover: e.querySelector("img").attributes.src,
                            id: `${Ikm.baseUrl}${e.querySelector("a").attributes.href}`,
                            subTitle: e.querySelector("span.chapter").text
                        })),
                        maxPage: 1
                    };
                } catch (e) {
                    throw new Error(`搜索失败：${e.message}`);
                }
            },
            onThumbnailLoad: Ikm.thumbConfig,
            optionList: []
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, r) => {
                try {
                    let t = e.match(/\d+/)[0];
                    if (r) {
                        let r = await Network.get(e, Ikm.webHeaders);
                        needPassValidator(r.body) && (r = await Network.get(e, Ikm.webHeaders));
                        let a = new HtmlDocument(r.body).querySelector("meta[property='og:title']").attributes.content, o = await Network.post(`${Ikm.baseUrl}/api/user/bookcase/add`, Ikm.jsonHead, `articleid=${t}&articlename=${encodeURIComponent(a)}`), i = JSON.parse(o.body);
                        if ("0" !== i.code) throw new Error(i.msg || "收藏失败");
                        return "ok";
                    }
                    {
                        let e = await Network.post(`${Ikm.baseUrl}/api/user/bookcase/del`, Ikm.jsonHead, `articleid=${t}`);
                        needPassValidator(e.body) && (e = await Network.post(`${Ikm.baseUrl}/api/user/bookcase/del`, Ikm.jsonHead, `articleid=${t}`));
                        let r = JSON.parse(e.body);
                        if ("0" !== r.code) throw new Error(r.msg || "取消收藏失败");
                        return "ok";
                    }
                } catch (e) {
                    throw new Error(`收藏操作失败：${e.message}`);
                }
            },
            loadComics: async (e, t) => {
                let r = await Network.get(`${Ikm.baseUrl}/user/bookcase`, Ikm.webHeaders);
                if (200 !== r.status) throw "加载收藏失败：" + r.status;
                return needPassValidator(r.body) && (r = await Network.get(`${Ikm.baseUrl}/user/bookcase`, Ikm.webHeaders)),
                {
                    comics: new HtmlDocument(r.body).querySelectorAll("div.bookrack-item").map(e => ({
                        title: e.querySelector("h3").text.split("~")[0],
                        subTitle: e.querySelector("p.desc").text,
                        cover: e.querySelector("img").attributes.src,
                        id: `${Ikm.baseUrl}/book/${e.attributes["data-id"]}/`
                    })),
                    maxPage: 1
                };
            },
            onThumbnailLoad: Ikm.thumbConfig
        }, this.comic = {
            loadInfo: async e => {
                var t, r;
                let a = !1;
                try {
                    a = (await this.favorites.loadComics(1, null)).comics.some(t => t.id === e);
                } catch (e) {
                    console.error("加载收藏页失败:", e);
                }
                let o = await Network.get(e, Ikm.webHeaders);
                needPassValidator(o.body) && (o = await Network.get(e, Ikm.webHeaders));
                let i = new HtmlDocument(o.body), s = e.match(/\d+/)[0], l = await Network.get(`${Ikm.baseUrl}/api/comic/zyz/chapterlink?id=${s}`, {
                    ...Ikm.jsonHead,
                    referer: e
                }), n = JSON.parse(l.body), m = new Map;
                if (!(n.data && n.data.length > 0 && n.data[0].list)) throw new Error("章节数据格式异常");
                n.data[0].list.forEach(e => {
                    let t = e.name, r = `${Ikm.baseUrl}${e.url}`;
                    m.set(r, t);
                });
                let c = i.querySelector("div.book-hero__detail > div.title").text, d = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), u = (null == (t = i.querySelector("div.coverimg").attributes.style.match(/\((.*?)\)/)) ? void 0 : t[1]) || "", b = i.querySelector("article.book-container__detail").text.match(new RegExp(`漫画名：${d}(?:(?:[^。]*?(?:简介|漫画简介)\\s*[:：]?\\s*)|(?:[^。]*?))([\\s\\S]+?)\\.\\.\\.。`)), k = (null == b || null == (r = b[1]) ? void 0 : r.trim().replace(/\s+/g, " ")) || "";
                return {
                    title: c.split("~")[0],
                    cover: u,
                    description: k,
                    tags: {
                        作者: [ i.querySelector("div.book-container__author").text.split("作者：")[1] ],
                        更新: [ i.querySelector("div.update > a > em").text ],
                        标签: i.querySelectorAll("div.book-hero__detail > div.tags > a").map(e => e.text.trim()).filter(e => e)
                    },
                    chapters: m,
                    recommend: i.querySelectorAll("div.module-guessu > div.item").map(e => ({
                        title: e.querySelector("div.title").text.split("~")[0],
                        cover: e.querySelector("div.thumb_img").attributes["data-src"],
                        id: `${Ikm.baseUrl}${e.querySelector("a").attributes.href}`
                    })),
                    isFavorite: a
                };
            },
            onThumbnailLoad: Ikm.thumbConfig,
            loadEp: async (e, t) => {
                try {
                    let e = await Network.get(t, Ikm.webHeaders);
                    return needPassValidator(e.body) && (e = await Network.get(t, Ikm.webHeaders)),
                    {
                        images: new HtmlDocument(e.body).querySelectorAll("img.lazy").map(e => e.attributes["data-src"])
                    };
                } catch (e) {
                    throw new Error(`加载章节失败：${e.message}`);
                }
            },
            onImageLoad: (e, t, r) => ({
                url: e,
                headers: {
                    ...Ikm.webHeaders,
                    referer: r
                }
            })
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const a = String(null == e ? "" : e).trim() || t;
    return r ? a.replace(/^\/+|\/+$/g, "") : a;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, a = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), o = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${a}/${o}/${i}@${s}`;
    const m = l ? `${l}/${n}` : n;
    return `${a}/${o}/${i}@${s}/${n.startsWith(`${l}/`) ? n : m}`;
}

_Ikm = Ikm, Ikm.baseUrl = "https://www.ikmmh.com", Ikm.Mobile_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Edg/140.0.0.0",
Ikm.webHeaders = {
    "User-Agent": _Ikm.Mobile_UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
}, Ikm.jsonHead = {
    "User-Agent": _Ikm.Mobile_UA,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip",
    "X-Requested-With": "XMLHttpRequest"
}, Ikm.thumbConfig = e => ({
    headers: {
        ..._Ikm.webHeaders,
        referer: _Ikm.baseUrl
    }
});

"use strict";

var _Ikm;

function getValidatorCookie(e) {
    const t = e.match(/document\.cookie\s*=\s*"([^"]+)"/);
    if (!t) return null;
    const r = t[1].split(";");
    if (0 === r.length) return null;
    const a = r[0].trim(), o = a.indexOf("="), i = a.substring(0, o), s = a.substring(o + 1);
    return new Cookie({
        name: i,
        value: s,
        domain: "www.ikmmh.com"
    });
}

function needPassValidator(e) {
    var t = getValidatorCookie(e);
    return null != t && (Network.setCookies(Ikm.baseUrl, [ t ]), !0);
}
