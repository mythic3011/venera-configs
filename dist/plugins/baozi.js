class Baozi extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "包子漫画", this.key = "baozi", this.version = "1.1.6", this.minAppVersion = "1.0.0",
        this.url = resolvePluginUpdateUrl("baozi.js"), this.settings = {
            language: {
                title: "简繁切换",
                type: "select",
                options: [ {
                    value: "cn",
                    text: "简体"
                }, {
                    value: "tw",
                    text: "繁體"
                } ],
                default: "cn"
            },
            domains: {
                title: "主域名",
                type: "select",
                options: [ {
                    value: "bzmgcn.com"
                }, {
                    value: "baozimhcn.com"
                }, {
                    value: "webmota.com"
                }, {
                    value: "kukuc.co"
                }, {
                    value: "twmanga.com"
                }, {
                    value: "dinnerku.com"
                } ],
                default: "bzmgcn.com"
            },
            cdn_domains: {
                title: "图片资源站域名",
                type: "select",
                options: [ {
                    value: "as-rsa1-usla.baozicdn.com"
                }, {
                    value: "ascn-a3.bzcdn.net"
                }, {
                    value: "asgb-a3.bzcdn.net"
                }, {
                    value: "as.baozimh.com"
                }, {
                    value: "s1.baozicdn.com"
                }, {
                    value: "",
                    text: "默认"
                } ],
                default: ""
            },
            image_quality: {
                title: "图片质量",
                type: "select",
                options: [ {
                    value: "/w640",
                    text: "640p"
                }, {
                    value: "",
                    text: "原图"
                } ],
                default: "/w640"
            }
        }, this.account = {
            login: async (t, e) => {
                let a = await Network.post(`${this.baseUrl}/api/bui/signin`, {
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFUNUxpOwyUaDop8s"
                }, '------WebKitFormBoundaryFUNUxpOwyUaDop8s\r\nContent-Disposition: form-data; name="username"\r\n\r\n' + t + '\r\n------WebKitFormBoundaryFUNUxpOwyUaDop8s\r\nContent-Disposition: form-data; name="password"\r\n\r\n' + e + "\r\n------WebKitFormBoundaryFUNUxpOwyUaDop8s--\r\n");
                if (200 !== a.status) throw "Invalid status code: " + a.status;
                let i = JSON.parse(a.body).data;
                return Network.setCookies(this.baseUrl, [ new Cookie({
                    name: "TSID",
                    value: i,
                    domain: this.loadSetting("domains") || this.settings.domains.default
                }) ]), "ok";
            },
            logout: function() {
                Network.deleteCookies(this.loadSetting("domains") || this.settings.domains.default);
            },
            get registerWebsite() {
                return `${this.baseUrl}/user/signup`;
            }
        }, this.explore = [ {
            title: "包子漫画",
            type: "singlePageWithMultiPart",
            load: async () => {
                var t = await Network.get(this.baseUrl);
                if (200 !== t.status) throw "Invalid status code: " + t.status;
                let e = new HtmlDocument(t.body).querySelectorAll("div.index-recommend-items"), a = {};
                for (let t of e) {
                    let e = t.querySelector("div.catalog-title").text.trim(), i = t.querySelectorAll("div.comics-card").map(t => this.parseComic(t));
                    i.length > 0 && (a[e] = i);
                }
                return a;
            }
        } ], this.category = {
            title: "包子漫画",
            parts: [ {
                name: "类型",
                type: "fixed",
                categories: [ "全部", "恋爱", "纯爱", "古风", "异能", "悬疑", "剧情", "科幻", "奇幻", "玄幻", "穿越", "冒险", "推理", "武侠", "格斗", "战争", "热血", "搞笑", "大女主", "都市", "总裁", "后宫", "日常", "韩漫", "少年", "其它" ],
                itemType: "category",
                categoryParams: [ "all", "lianai", "chunai", "gufeng", "yineng", "xuanyi", "juqing", "kehuan", "qihuan", "xuanhuan", "chuanyue", "mouxian", "tuili", "wuxia", "gedou", "zhanzheng", "rexie", "gaoxiao", "danuzhu", "dushi", "zongcai", "hougong", "richang", "hanman", "shaonian", "qita" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, e, a, i) => {
                let r = await Network.get(`${this.baseUrl}/api/bzmhq/amp_comic_list?type=${e}&region=${a[0]}&state=${a[1]}&filter=%2a&page=${i}&limit=36&language=${this.lang}&__amp_source_origin=${this.baseUrl}`);
                if (200 !== r.status) throw "Invalid status code: " + r.status;
                let o = null, s = JSON.parse(r.body);
                return s.next || (o = i), {
                    comics: s.items.map(t => this.parseJsonComic(t)),
                    maxPage: o
                };
            },
            optionList: [ {
                options: [ "all-全部", "cn-国漫", "jp-日本", "kr-韩国", "en-欧美" ]
            }, {
                options: [ "all-全部", "serial-连载中", "pub-已完结" ]
            } ]
        }, this.search = {
            load: async (t, e, a) => {
                let i = await Network.get(`${this.baseUrl}/search?q=${t}`);
                if (200 !== i.status) throw "Invalid status code: " + i.status;
                return {
                    comics: new HtmlDocument(i.body).querySelectorAll("div.comics-card").map(t => this.parseComic(t)),
                    maxPage: 1
                };
            },
            optionList: []
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (t, e, a) => {
                if (a) {
                    let e = await Network.post(`${this.baseUrl}/user/operation_v2?op=set_bookmark&comic_id=${t}&chapter_slot=0`);
                    if (!e.status || e.status >= 400) throw "Invalid status code: " + e.status;
                    return "ok";
                }
                {
                    let e = await Network.post(`${this.baseUrl}/user/operation_v2?op=del_bookmark&comic_id=${t}`);
                    if (!e.status || e.status >= 400) throw "Invalid status code: " + e.status;
                    return "ok";
                }
            },
            loadFolders: null,
            loadComics: async (t, e) => {
                let a = await Network.get(`${this.baseUrl}/user/my_bookshelf`);
                if (200 !== a.status) throw "Invalid status code: " + a.status;
                return {
                    comics: new HtmlDocument(a.body).querySelectorAll("div.bookshelf-items").map(t => function(t) {
                        let e = t.querySelector("h4 > a").text.trim();
                        return {
                            id: t.querySelector("h4 > a").attributes.href.split("/").pop(),
                            title: e,
                            subTitle: t.querySelector("div.info > ul").children[1].text.split("：")[1].trim(),
                            description: t.querySelector("div.info > ul").children[4].children[0].text.trim(),
                            cover: t.querySelector("amp-img").attributes.src
                        };
                    }(t)),
                    maxPage: 1
                };
            }
        }, this.comic = {
            loadInfo: async t => {
                var e;
                let a = await Network.get(`${this.baseUrl}/comic/${t}`);
                if (200 !== a.status) throw "Invalid status code: " + a.status;
                let i = new HtmlDocument(a.body), r = i.querySelector("h1.comics-detail__title").text.trim(), o = i.querySelector("div.l-content > div > div > amp-img").attributes.src, s = i.querySelector("h2.comics-detail__author").text.trim(), l = i.querySelectorAll("div.tag-list > span").map(t => t.text.trim());
                l = [ ...l.filter(t => "" !== t) ];
                let n = null == (e = i.querySelector("div.supporting-text > div > span > em")) ? void 0 : e.text.trim().replace("(", "").replace(")", "");
                if (!n) {
                    const t = () => {
                        var t;
                        const e = [ ...i.querySelectorAll("#chapter-items, #chapters_other_list") ];
                        let a = [];
                        e.forEach(t => {
                            const e = t.querySelectorAll(".comics-chapters > a");
                            a.push(...Array.from(e));
                        });
                        const r = a[a.length - 1];
                        return (null == r || null == (t = r.querySelector("div > span")) ? void 0 : t.text.trim()) || "暂无更新信息";
                    };
                    n = t();
                }
                let c = i.querySelector("p.comics-detail__desc").text.trim(), u = new Map, m = 0;
                for (let t of i.querySelectorAll("div#chapter-items > div.comics-chapters > a > div > span")) u.set(m.toString(), t.text.trim()),
                m++;
                for (let t of i.querySelectorAll("div#chapters_other_list > div.comics-chapters > a > div > span")) u.set(m.toString(), t.text.trim()),
                m++;
                if (0 === m) {
                    const t = Array.from(i.querySelectorAll("div.comics-chapters > a > div > span")).reverse();
                    for (let e of t) u.set(m.toString(), e.text.trim()), m++;
                }
                let d = [];
                for (let t of i.querySelectorAll("div.recommend--item")) if (t.querySelectorAll("div.tag-comic").length > 0) {
                    let e = t.querySelector("span").text.trim(), a = t.querySelector("amp-img").attributes.src, i = t.querySelector("a").attributes.href.split("/").pop();
                    d.push({
                        id: i,
                        title: e,
                        cover: a
                    });
                }
                let p = n.replace(/年/g, "-").replace(/月/g, "-").replace(/日/g, "");
                return new ComicDetails({
                    title: r,
                    cover: o,
                    description: c,
                    tags: {
                        作者: [ s ],
                        标签: l
                    },
                    chapters: u,
                    recommend: d,
                    updateTime: p
                });
            },
            loadEp: async (t, e) => {
                const a = [];
                let i = `https://appcn.baozimh.com/baozimhapp/comic/chapter/${t}/0_${e}.html`;
                const r = await Network.get(i);
                if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                return new HtmlDocument(r.body).querySelectorAll(".comic-contain > .chapter-img").forEach(t => {
                    var e;
                    let i = null == (e = t.querySelector(".comic-contain__item")) || null == (e = e.attributes) ? void 0 : e["data-src"];
                    if (i) {
                        const t = i.match(/^(https?:\/\/)?([^/\s:]+)(:\d+)?(\/[a-z]comic\/.*)/);
                        if (t) {
                            const e = "" === this.loadSetting("cdn_domains") ? t[2] : this.loadSetting("cdn_domains");
                            i = `${t[1]}${e}${this.loadSetting("image_quality")}${t[4]}`;
                        }
                        a.push(i);
                    }
                }), {
                    images: a
                };
            }
        };
    }
    get lang() {
        return this.loadSetting("language") || this.settings.language.default;
    }
    get baseUrl() {
        let t = this.loadSetting("domains") || this.settings.domains.default;
        return `https://${this.lang}.${t}`;
    }
    parseComic(t) {
        let e = t.querySelector("a").attributes.href.split("/").pop(), a = t.querySelector("h3").text.trim(), i = t.querySelector("a > amp-img").attributes.src, r = t.querySelectorAll("div.tabs > span").map(t => t.text.trim());
        return {
            id: e,
            title: a,
            cover: i,
            tags: r,
            description: t.querySelector("small").text.trim()
        };
    }
    parseJsonComic(t) {
        return {
            id: t.comic_id,
            title: t.name,
            subTitle: t.author,
            cover: `https://static-tw.baozimh.com/cover/${t.topic_img}?w=285&h=375&q=100`,
            tags: t.type_names
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
    const e = __veneraGetRuntimeGlobal(), a = e.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof e.__VENERA_RELEASE_AUTHORITY__ ? e.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), n = String(t || "").replace(/^\/+/, "");
    if (!n) return `${i}/${r}/${o}@${s}`;
    const c = l ? `${l}/${n}` : n;
    return `${i}/${r}/${o}@${s}/${n.startsWith(`${l}/`) ? n : c}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
