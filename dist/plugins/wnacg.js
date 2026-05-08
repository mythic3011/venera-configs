class Wnacg extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "紳士漫畫", this.key = "wnacg", this.version = "1.0.4", this.minAppVersion = "1.0.0",
        this.url = resolvePluginUpdateUrl("wnacg.js"), this.account = {
            login: async (e, t) => {
                let a = await Network.post(`${this.baseUrl}/users-check_login.html`, {
                    "content-type": "application/x-www-form-urlencoded"
                }, `login_name=${encodeURIComponent(e)}&login_pass=${encodeURIComponent(t)}`);
                if (200 !== a.status) throw "Login failed";
                if (JSON.parse(a.body).html.includes("登錄成功")) return "ok";
                throw "Login failed";
            },
            logout: () => {
                Network.deleteCookies(this.baseUrl);
            },
            registerWebsite: null
        }, this.explore = [ {
            title: "紳士漫畫",
            type: "multiPartPage",
            load: async e => {
                let t = await Network.get(this.baseUrl, {});
                if (200 !== t.status) throw `Invalid Status Code ${t.status}`;
                let a = new HtmlDocument(t.body), l = a.querySelectorAll("div.title_sort"), i = a.querySelectorAll("div.bodywrap");
                if (l.length !== i.length) throw "Invalid Page";
                let r = [];
                for (let e = 0; e < l.length; e++) {
                    let t = l[e].querySelector("div.title_h2").text.replaceAll(/\s+/g, ""), a = l[e].querySelector("div.r > a").attributes.href, s = [], o = i[e].querySelectorAll("div.gallary_wrap > ul.cc > li");
                    for (let e of o) s.push(this.parseComic(e));
                    r.push({
                        title: t,
                        comics: s,
                        viewMore: `category:${t}@${a}`
                    });
                }
                return a.dispose(), r;
            }
        } ], this.category = {
            title: "紳士漫畫",
            parts: [ {
                name: "最新",
                type: "fixed",
                categories: [ "最新" ],
                itemType: "category",
                categoryParams: [ "/albums.html" ],
                groupParam: null
            }, {
                name: "同人誌",
                type: "fixed",
                categories: [ "同人誌", "漢化", "日語", "English", "CG畫集", "3D漫畫", "寫真Cosplay" ],
                itemType: "category",
                categoryParams: [ "/albums-index-cate-5.html", "/albums-index-cate-1.html", "/albums-index-cate-12.html", "/albums-index-cate-16.html", "/albums-index-cate-2.html", "/albums-index-cate-22.html", "/albums-index-cate-3.html" ],
                groupParam: null
            }, {
                name: "單行本",
                type: "fixed",
                categories: [ "單行本", "漢化", "日語", "English" ],
                itemType: "category",
                categoryParams: [ "/albums-index-cate-6.html", "/albums-index-cate-9.html", "/albums-index-cate-13.html", "/albums-index-cate-17.html" ],
                groupParam: null
            }, {
                name: "雜誌短篇",
                type: "fixed",
                categories: [ "雜誌短篇", "漢化", "日語", "English" ],
                itemType: "category",
                categoryParams: [ "/albums-index-cate-7.html", "/albums-index-cate-10.html", "/albums-index-cate-14.html", "/albums-index-cate-18.html" ],
                groupParam: null
            }, {
                name: "韓漫",
                type: "fixed",
                categories: [ "韓漫", "漢化", "生肉" ],
                itemType: "category",
                categoryParams: [ "/albums-index-cate-19.html", "/albums-index-cate-20.html", "/albums-index-cate-21.html" ],
                groupParam: null
            } ],
            enableRankingPage: !0
        }, this.categoryComics = {
            load: async (e, t, a, l) => {
                let i = this.baseUrl + t;
                if (0 !== l) {
                    i.includes("-") || (i = i.replaceAll(".html", "-.html")), i = i.replaceAll("index", "");
                    let e = i.split("albums-");
                    e[1] = `index-page-${l}${e[1]}`, i = `${e[0]}albums-${e[1]}`;
                }
                let r = await Network.get(i, {});
                if (200 !== r.status) throw `Invalid Status Code ${r.status}`;
                let s = new HtmlDocument(r.body), o = s.querySelectorAll("div.grid div.gallary_wrap > ul.cc > li"), n = [];
                for (let e of o) n.push(this.parseComic(e));
                let c = s.querySelectorAll("div.f_left.paginator > a"), u = Number(c[c.length - 1].text);
                return s.dispose(), {
                    comics: n,
                    maxPage: u
                };
            },
            ranking: {
                options: [ "day-Day", "week-Week", "month-Month" ],
                load: async (e, t) => {
                    let a = `${this.baseUrl}/albums-favorite_ranking-type-${e}.html`;
                    0 !== t && (a = `${this.baseUrl}/albums-favorite_ranking-page-${t}-type-${e}.html`);
                    let l = await Network.get(a, {});
                    if (200 !== l.status) throw `Invalid Status Code ${l.status}`;
                    let i = new HtmlDocument(l.body), r = i.querySelectorAll("div.grid div.gallary_wrap > ul.cc > li"), s = [];
                    for (let e of r) s.push(this.parseComic(e));
                    let o = i.querySelectorAll("div.f_left.paginator > a"), n = 1;
                    return o.length > 0 && (n = Number(o[o.length - 1].text)), i.dispose(), {
                        comics: s,
                        maxPage: n
                    };
                }
            }
        }, this.search = {
            load: async (e, t, a) => {
                let l = `${this.baseUrl}/search/?q=${encodeURIComponent(e)}&f=_all&s=create_time_DESC&syn=yes`;
                0 !== a && (l += `&p=${a}`);
                let i = await Network.get(l, {});
                if (200 !== i.status) throw `Invalid Status Code ${i.status}`;
                let r = new HtmlDocument(i.body), s = r.querySelectorAll("div.grid div.gallary_wrap > ul.cc > li"), o = [];
                for (let e of s) o.push(this.parseComic(e));
                let n = r.querySelectorAll("p.result > b")[0].text.replaceAll(",", ""), c = Math.ceil(Number(n) / 24);
                return r.dispose(), {
                    comics: o,
                    maxPage: c
                };
            }
        }, this.favorites = {
            multiFolder: !0,
            isOldToNewSort: !0,
            addOrDelFavorite: async (e, t, a, l) => {
                if (a) {
                    if (200 !== (await Network.post(`${this.baseUrl}/users-save_fav-id-${e}.html`, {
                        "content-type": "application/x-www-form-urlencoded"
                    }, `favc_id=${t}`)).status) throw "Delete failed";
                } else if (200 !== (await Network.get(`${this.baseUrl}/users-fav_del-id-${l}.html?ajax=true&_t=${randomDouble(0, 1)}`, {})).status) throw "Delete failed";
                return "ok";
            },
            loadFolders: async e => {
                let t = await Network.get(`${this.baseUrl}/users-addfav-id-210814.html`, {});
                if (200 !== t.status) throw "Load failed";
                let a = new HtmlDocument(t.body), l = {};
                return a.querySelectorAll("option").forEach(e => {
                    "" !== e.attributes.value && (l[e.attributes.value] = e.text);
                }), {
                    folders: l,
                    favorited: []
                };
            },
            addFolder: async e => {
                if (200 !== (await Network.post(`${this.baseUrl}/users-favc_save-id.html`, {
                    "content-type": "application/x-www-form-urlencoded"
                }, `favc_name=${encodeURIComponent(e)}`)).status) throw "Add failed";
                return "ok";
            },
            deleteFolder: async e => {
                if (200 !== (await Network.get(`${this.baseUrl}/users-favclass_del-id-${e}.html?ajax=true&_t=${randomDouble()}`, {})).status) throw "Delete failed";
                return "ok";
            },
            loadComics: async (e, t) => {
                let a = `${this.baseUrl}/users-users_fav-page-${e}-c-${t}.html.html`, l = await Network.get(a, {});
                if (200 !== l.status) throw `Invalid Status Code ${l.status}`;
                let i = new HtmlDocument(l.body), r = i.querySelectorAll("div.asTB").map(e => {
                    let t = e.querySelector("div.asTBcell.thumb > div > img").attributes.src;
                    t = "https:" + t;
                    let a = e.querySelector("div.box_cel.u_listcon > p.l_catg > span").text.replaceAll("創建時間：", ""), l = e.querySelector("div.box_cel.u_listcon > p.l_title > a").text, i = e.querySelector("div.box_cel.u_listcon > p.l_title > a").attributes.href, r = RegExp("(?<=-aid-)[0-9]+").exec(i)[0], s = e.querySelector("div.box_cel.u_listcon > p.l_detla").text, o = Number(RegExp("(?<=頁數：)[0-9]+").exec(s)[0]), n = e.querySelector("div.box_cel.u_listcon > p.alopt > a").attributes.onclick, c = RegExp("(?<=del-id-)[0-9]+").exec(n)[0];
                    return new Comic({
                        id: r,
                        title: l,
                        subtitle: a,
                        cover: t,
                        pages: o,
                        favoriteId: c
                    });
                }), s = 1, o = i.querySelectorAll("div.f_left.paginator > a");
                return o.length > 0 && (s = Number(o[o.length - 1].text)), i.dispose(), {
                    comics: r,
                    maxPage: s
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                let t = await Network.get(`${this.baseUrl}/photos-index-page-1-aid-${e}.html`, {});
                if (200 !== t.status) throw `Invalid Status Code ${t.status}`;
                let a = new HtmlDocument(t.body), l = a.querySelector("div.userwrap > h2").text, i = a.querySelector("div.userwrap > div.asTB > div.asTBcell.uwthumb > img").attributes.src;
                i = "https:" + i, i = i.substring(0, 6) + i.substring(8);
                let r = a.querySelectorAll("div.asTBcell.uwconn > label"), s = r[0].text.split("：")[1], o = r[1].text.split("：")[1], n = a.querySelectorAll("a.tagshow"), c = new Map;
                c.set("頁數", [ o ]), c.set("分類", [ s ]), n.length > 0 && c.set("標籤", n.map(e => e.text));
                let u = a.querySelector("div.asTBcell.uwconn > p").text, d = a.querySelector("div.asTBcell.uwuinfo > a > p").text;
                return new ComicDetails({
                    id: e,
                    title: l,
                    cover: i,
                    pages: o,
                    tags: c,
                    description: u,
                    uploader: d
                });
            },
            loadThumbnails: async (e, t) => {
                t = t || "1";
                let a = await Network.get(`${this.baseUrl}/photos-index-page-${t}-aid-${e}.html`, {});
                if (200 !== a.status) throw `Invalid Status Code ${a.status}`;
                let l = new HtmlDocument(a.body), i = l.querySelectorAll("div.pic_box.tb > a > img").map(e => "https:" + e.attributes.src);
                t = (Number(t) + 1).toString();
                let r = l.querySelector("div.f_left.paginator").children;
                return r[r.length - 1].classNames.includes("thispage") && (t = null), {
                    thumbnails: i,
                    next: t
                };
            },
            loadEp: async (e, t) => {
                let a = await Network.get(`${this.baseUrl}/photos-gallery-aid-${e}.html`, {});
                if (200 !== a.status) throw `Invalid Status Code ${a.status}`;
                const l = RegExp(String.raw`//[^"]+/[^"]+\.[^"]+`, "g");
                return {
                    images: Array.from(a.body.matchAll(l)).map(e => "https:" + e[0].substring(0, e[0].length - 1))
                };
            },
            onClickTag: (e, t) => ({
                action: "search",
                keyword: t
            })
        }, this.settings = {
            refreshDomains: {
                title: "Refresh Domain List",
                type: "callback",
                buttonText: "Refresh",
                callback: () => this.refreshDomains(!0)
            },
            refreshDomainsOnStart: {
                title: "Refresh Domain List on Startup",
                type: "switch",
                default: !0
            },
            domainSelection: {
                title: "Domain Selection",
                type: "select",
                options: [ {
                    value: "0",
                    text: "Custom Domain"
                }, {
                    value: "1",
                    text: "Domain 1"
                }, {
                    value: "2",
                    text: "Domain 2"
                }, {
                    value: "3",
                    text: "Domain 3"
                } ],
                default: "0"
            },
            domain0: {
                title: "Custom Domain",
                type: "input",
                validator: String.raw`^(?!:\/\/)(?=.{1,253})([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`,
                default: "wnacg.com"
            }
        }, this.translation = {
            zh_CN: {
                "Refresh Domain List": "刷新域名列表",
                Refresh: "刷新",
                "Refresh Domain List on Startup": "启动时刷新域名列表",
                "Domain Selection": "域名选择",
                "Custom Domain": "自定义域名",
                "Custom domain is not set": "未设置自定义域名",
                "Selected domain is unavailable": "所选域名不可用，请先刷新域名列表",
                Day: "日",
                Week: "周",
                Month: "月"
            },
            zh_TW: {
                "Refresh Domain List": "刷新域名列表",
                Refresh: "刷新",
                "Refresh Domain List on Startup": "啟動時刷新域名列表",
                "Domain Selection": "域名選擇",
                "Custom Domain": "自定義域名",
                "Custom domain is not set": "未設置自定義域名",
                "Selected domain is unavailable": "所選域名不可用，請先刷新域名列表",
                Day: "日",
                Week: "周",
                Month: "月"
            }
        };
    }
    get baseUrl() {
        let e = this.loadSetting("domainSelection");
        if (null == e && (e = 0), e = parseInt(e), 0 === e) {
            let e = this.loadSetting("domain0");
            if (!e || "" === e.trim()) throw "Custom domain is not set";
            return `https://${e.trim()}`;
        }
        {
            let t = e - 1;
            if (t >= Wnacg.domains.length) throw "Selected domain is unavailable";
            return `https://${Wnacg.domains[t]}`;
        }
    }
    overwriteDomains(e) {
        0 != e.length && (Wnacg.domains = e);
    }
    async init() {
        this.loadSetting("refreshDomainsOnStart") && await this.refreshDomains(!1);
    }
    async refreshDomains(e) {
        let t = "", a = "", l = [];
        try {
            let e = await fetch("https://wn01.link/");
            if (200 == e.status) {
                let i = await e.text(), r = new HtmlDocument(i), s = r.querySelectorAll("a[href]"), o = new Set;
                for (let e of s) {
                    let t = e.attributes.href;
                    if (!t) continue;
                    let a = t.match(/^https?:\/\/([^\/]+)/);
                    if (a) {
                        let e = a[1];
                        !e || !e.includes(".") || e.includes("wn01.link") || e.includes("google.cn") || e.includes("cdn-cgi") || o.has(e) || (l.push(e),
                        o.add(e));
                    }
                }
                r.dispose(), l.length > 0 && (t = "Update Success", a = "New domains:\n\n");
            }
        } catch (e) {}
        0 == l.length && (t = "Update Failed", a = "Using built-in domains:\n\n", l = Wnacg.domains);
        for (let e = 0; e < l.length; e++) a += `Fetched Domain ${e + 1}: ${l[e]}\n`;
        a += `\nTotal: ${l.length} domain(s)`, e ? UI.showDialog(t, a, [ {
            text: "Cancel",
            callback: () => {}
        }, {
            text: "Apply",
            callback: () => this.overwriteDomains(l)
        } ]) : this.overwriteDomains(l);
    }
    parseComic(e) {
        let t = e.querySelector("div.pic_box > a").attributes.href, a = RegExp("(?<=-aid-)[0-9]+").exec(t)[0], l = e.querySelector("div.pic_box > a > img").attributes.src;
        l = `https:${l}`;
        let i = e.querySelector("div.info > div.title > a").text, r = e.querySelector("div.info > div.info_col").text.trim();
        return r = r.replaceAll("\n", ""), r = r.replaceAll("\t", ""), new Comic({
            id: a,
            title: i,
            cover: l,
            description: r
        });
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const l = String(null == e ? "" : e).trim() || t;
    return a ? l.replace(/^\/+|\/+$/g, "") : l;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, l = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), o = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${l}/${i}/${r}@${s}`;
    const c = o ? `${o}/${n}` : n;
    return `${l}/${i}/${r}@${s}/${n.startsWith(`${o}/`) ? n : c}`;
}

Wnacg.domains = [];

"use strict";
