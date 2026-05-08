class ManHuaGui extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "漫画柜", this.key = "ManHuaGui", this.version = "1.2.1",
        this.minAppVersion = "1.4.0", this.url = resolvePluginUpdateUrl("manhuagui.js"),
        this.baseUrl = "https://www.manhuagui.com", this.account = {
            login: async (e, t) => {
                let r = {
                    "content-type": "application/x-www-form-urlencoded",
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    "x-requested-with": "XMLHttpRequest",
                    origin: this.baseUrl,
                    referer: `${this.baseUrl}/`,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                }, i = `txtUserName=${encodeURIComponent(e)}&txtPassword=${encodeURIComponent(t)}`, o = await Network.post(`${this.baseUrl}/tools/submit_ajax.ashx?action=user_login`, r, i);
                if (200 !== o.status) throw "Invalid status code: " + o.status;
                let a = o.headers["set-cookie"];
                if (!a) throw "Set-Cookie header not found";
                let s = Array.isArray(a) ? a : [ a ], l = null;
                for (let e of s) {
                    let t = e.match(/my=([^;]+)/);
                    if (t) {
                        l = t[1];
                        break;
                    }
                }
                if (!l) throw "my cookie not found in Set-Cookie header";
                return this.saveData("mhg_cookie", "my=" + l), "ok";
            },
            logout: function() {
                this.deleteData("mhg_cookie");
            },
            registerWebsite: "https://www.manhuagui.com/user/register"
        }, this.explore = [ {
            title: "漫画柜",
            type: "multiPartPage",
            load: async e => {
                let t = await this.getHtml(this.baseUrl), r = [], i = t.querySelector(".update-cont");
                if (i) {
                    let e = [], t = i.querySelectorAll("ul");
                    for (let r of t) {
                        let t = r.querySelectorAll("li").map(e => this.parseSimpleComic(e)).filter(e => e);
                        e.push(...t);
                    }
                    e.length > 0 && r.push({
                        title: "热门漫画最新更新",
                        comics: e
                    });
                }
                let o = t.querySelectorAll("#cmt-tab li"), a = t.querySelectorAll("#cmt-cont ul.cover-list");
                for (let e = 0; e < o.length; e++) {
                    let t = o[e].text.trim(), i = a[e].querySelectorAll("li").map(e => this.parseSimpleComic(e)).filter(e => e);
                    i.length > 0 && r.push({
                        title: t,
                        comics: i
                    });
                }
                return r;
            },
            loadNext(e) {}
        } ], this.category = {
            title: "漫画柜",
            parts: [ {
                name: "类型",
                type: "fixed",
                itemType: "category",
                categories: [ "全部", "热血", "冒险", "魔幻", "神鬼", "搞笑", "萌系", "爱情", "科幻", "魔法", "格斗", "武侠", "机战", "战争", "竞技", "体育", "校园", "生活", "励志", "历史", "伪娘", "宅男", "腐女", "耽美", "百合", "后宫", "治愈", "美食", "推理", "悬疑", "恐怖", "四格", "职场", "侦探", "社会", "音乐", "舞蹈", "杂志", "黑道" ],
                categoryParams: [ "", "rexue", "maoxian", "mohuan", "shengui", "gaoxiao", "mengxi", "aiqing", "kehuan", "mofa", "gedou", "wuxia", "jizhan", "zhanzheng", "jingji", "tiyu", "xiaoyuan", "shenghuo", "lizhi", "lishi", "weiniang", "zhainan", "funv", "danmei", "baihe", "hougong", "zhiyu", "meishi", "tuili", "xuanyi", "kongbu", "sige", "zhichang", "zhentan", "shehui", "yinyue", "wudao", "zazhi", "heidao" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, r, i) => {
                let o = r[0], a = t, s = r[1], l = r[2], n = r[3] || "index", c = [ o, a, s, l ].filter(e => "" != e).join("_"), h = `${this.baseUrl}/list/${c}/${n}_p${i}.html`, u = await this.getHtml(h), m = u.querySelector(".result-count").querySelectorAll("strong")[1].text;
                return m = parseInt(m), {
                    comics: u.querySelectorAll("#contList > li").map(e => this.parseSimpleComic(e)).filter(e => null !== e),
                    maxPage: m
                };
            },
            optionList: [ {
                options: [ "-全部", "japan-日本", "hongkong-港台", "other-其它", "europe-欧美", "china-内地", "korea-韩国" ]
            }, {
                options: [ "-全部", "shaonv-少女", "shaonian-少年", "qingnian-青年", "ertong-儿童", "tongyong-通用" ]
            }, {
                options: [ "-全部", "lianzai-连载", "wanjie-完结" ]
            }, {
                options: [ "update-最新更新", "index-最新发布", "view-人气最旺", "rate-评分最高" ]
            } ],
            ranking: {
                options: [ "-最新发布", "update-最新更新", "view-人气最旺", "rate-评分最高" ],
                load: async (e, t) => {
                    let r = `${this.baseUrl}/list/${e}_p${t}.html`, i = await this.getHtml(r), o = i.querySelector(".result-count").querySelectorAll("strong")[1].text;
                    return o = parseInt(o), {
                        comics: i.querySelector("#contList").querySelectorAll("li").map(e => this.parseComic(e)),
                        maxPage: o
                    };
                }
            }
        }, this.search = {
            load: async (e, t, r) => {
                let i = "";
                if (t[0]) {
                    let o = t[0].split("-")[0];
                    i = "0" == o ? `${this.baseUrl}/s/${e}_p${r}.html` : `${this.baseUrl}/s/${e}_o${o}_p${r}.html`;
                } else i = `${this.baseUrl}/s/${e}_p${r}.html`;
                let o = await this.getHtml(i), a = o.querySelector(".result-count");
                if (!a) return {
                    comics: [],
                    maxPage: 1
                };
                let s = a.querySelectorAll("strong")[1].text;
                s = parseInt(s);
                let l = Math.ceil(s / 10), n = o.querySelector(".book-result ul");
                return n ? {
                    comics: n.querySelectorAll("li.cf").map(e => this.parseSearchComic(e)).filter(e => null !== e),
                    maxPage: l
                } : {
                    comics: [],
                    maxPage: l || 1
                };
            },
            optionList: [ {
                type: "select",
                options: [ "0-最新更新", "1-最近最热", "2-最新上架", "3-评分最高" ],
                label: "sort",
                default: null
            } ],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async e => {
                let t = `${this.baseUrl}/comic/${e}/`, r = await this.getHtml(t), i = r.querySelector(".book-cont"), o = i.querySelector(".book-title").querySelector("h1").text.trim(), a = i.querySelector(".book-title").querySelector("h2").text.trim(), s = i.querySelector(".hcover").querySelector("img").attributes.src;
                s = `https:${s}`;
                let l = i.querySelector("#intro-all").querySelectorAll("p").map(e => e.text.trim()).join("\n"), n = i.querySelectorAll(".detail-list span");
                function c(e) {
                    let t = n[e].querySelectorAll("a");
                    return t.length > 0 ? t.map(e => e.text.trim()) : [ "" ];
                }
                let h = c(0), u = c(1), m = c(3), p = c(4), g = {
                    年代: h,
                    状态: [ n[7].text.trim() ],
                    作者: p,
                    地区: u,
                    类型: m
                }, f = n[8].text.trim(), d = r, y = r.querySelector("#checkAdult"), w = r.querySelector("#__VIEWSTATE");
                if (y && w) {
                    let e = w.attributes.value;
                    if (e) {
                        let t = this.decodeViewState(e);
                        if (t) {
                            let e = t.trim();
                            e = e.replace(/^\/\/+/, "").trim(), /class=['"]chapter['"]/.test(e) || (e = `<div class="chapter">${e}</div>`);
                            try {
                                d = new HtmlDocument(e);
                            } catch (e) {
                                console.error("解析成人章节列表失败:", e), d = r;
                            }
                        }
                    }
                }
                let q, S = new Map, x = d.querySelectorAll(".chapter h4 span");
                if (0 === x.length) {
                    let e = r.querySelectorAll(".chapter h4 span");
                    e.length > 0 && (d = r, x = e);
                }
                if (x.length > 0) for (let e = 0; e < x.length; e++) {
                    let t = x[e].text.trim(), r = new Map, i = d.querySelectorAll(".chapter-list")[e];
                    if (i) {
                        let e = i.querySelectorAll("li");
                        for (let t of e) {
                            let e = t.querySelector("a"), i = e.attributes.href.split("/").pop().replace(".html", ""), o = e.querySelector("span").text.trim();
                            r.set(i, o);
                        }
                        r = new Map([ ...r ].sort((e, t) => e[0] - t[0])), S.set(t, r);
                    }
                } else {
                    let e = d.querySelectorAll(".chapter-list");
                    if (0 === e.length && d !== r && (d = r, e = d.querySelectorAll(".chapter-list")),
                    e.length > 0) {
                        let t = "连载", r = new Map;
                        for (let t of e) {
                            let e = t.querySelectorAll("li");
                            for (let t of e) {
                                let e = t.querySelector("a");
                                if (e) {
                                    let t = e.attributes.href.split("/").pop().replace(".html", ""), i = e.querySelector("span").text.trim();
                                    r.set(t, i);
                                }
                            }
                        }
                        r = new Map([ ...r ].sort((e, t) => e[0] - t[0])), S.set(t, r);
                    }
                }
                if (this.isAppVersionAfter && this.isAppVersionAfter("1.3.0")) q = S; else {
                    q = new Map;
                    for (let [e, t] of S) for (let [e, r] of t) q.set(e, r);
                    q = new Map([ ...q ].sort((e, t) => e[0] - t[0]));
                }
                let v = [], b = r.querySelector(".similar-list");
                if (b) {
                    let e = b.querySelectorAll("li");
                    for (let t of e) {
                        let e = this.parseSimpleComic(t);
                        v.push(e);
                    }
                }
                return new ComicDetails({
                    title: o,
                    subtitle: a,
                    cover: s,
                    description: l,
                    tags: g,
                    updateTime: f,
                    chapters: q,
                    recommend: v
                });
            },
            loadEp: async (e, t) => {
                let r = `${this.baseUrl}/comic/${e}/${t}.html`, i = (await this.getHtml(r)).querySelectorAll("script")[4].innerHTML, o = this.getImgInfos(i), a = [];
                for (let e of o.files) {
                    let t = "https://us.hamreus.com" + o.path + e + `?e=${o.sl.e}&m=${o.sl.m}`;
                    a.push(t);
                }
                return {
                    images: a
                };
            },
            onImageLoad: (e, t, r) => ({
                headers: {
                    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    priority: "i",
                    "sec-ch-ua": '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "image",
                    "sec-fetch-mode": "no-cors",
                    "sec-fetch-site": "cross-site",
                    "sec-fetch-storage-access": "active",
                    Referer: "https://www.manhuagui.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            }),
            onThumbnailLoad: e => ({
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    priority: "u=0, i",
                    "sec-ch-ua": '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            }),
            loadComments: async (e, t, r, i) => {
                i && (r = i.split("//")[1], i = i.split("//")[0]);
                let o = `${this.baseUrl}/tools/submit_ajax.ashx?action=comment_list&book_id=${e}&page_index=${r}`, a = {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    "sec-ch-ua": '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    Referer: `${this.baseUrl}/comic/${e}/`,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }, s = await Network.get(o, a);
                if (200 !== s.status) throw `获取评论失败，状态码: ${s.status}`;
                let l = JSON.parse(s.body);
                const n = new Map, c = new Set, h = new Map;
                if (l.commentIds && l.commentIds.length > 0) for (let e of l.commentIds) {
                    const t = e.split(",");
                    if (t.length > 1) {
                        const e = t[t.length - 1];
                        n.has(e) || n.set(e, []);
                        for (let r = 0; r < t.length - 1; r++) {
                            const i = t[r];
                            c.add(i), n.get(e).includes(i) || n.get(e).push(i);
                            const o = 0 === r ? e : t[r + 1];
                            h.set(i, o);
                        }
                    }
                }
                const u = [];
                if (l.comments) if (i) {
                    const e = [ ...n.get(i) || [] ].reverse();
                    for (let t of e) {
                        const e = l.comments[t];
                        if (e) {
                            const o = h.get(t);
                            let a = "";
                            o && o !== i && l.comments[o] && (a = l.comments[o].user_name || "匿名用户"), u.push(new Comment({
                                id: `${e.id}//${r}`,
                                userName: a ? `${e.user_name || "匿名用户"} ☞ ${a}` : e.user_name || "匿名用户",
                                avatar: e.avatar ? `https:${e.avatar}` : "https://cf.mhgui.com/images/default.png",
                                content: e.content ? e.content : "已隐藏评论",
                                time: e.add_time,
                                replyCount: 0
                            }));
                        }
                    }
                } else {
                    const e = [];
                    for (const [t, i] of Object.entries(l.comments)) if (!c.has(t)) {
                        const o = n.has(t) ? n.get(t).length : i.reply_count || 0;
                        e.push(new Comment({
                            id: `${i.id}//${r}`,
                            userName: i.user_name || "匿名用户",
                            avatar: i.avatar ? `https:${i.avatar}` : "https://cf.mhgui.com/images/default.png",
                            content: i.content ? i.content : "已隐藏评论",
                            time: i.add_time,
                            replyCount: o
                        }));
                    }
                    u.push(...e.reverse());
                }
                return {
                    comments: u,
                    maxPage: i ? 1 : Math.ceil(l.total / 10) || 1
                };
            },
            sendComment: async (e, t, r, i) => {
                let o = this.loadData("mhg_cookie");
                if (!o) throw "请先登录漫画柜账号";
                let a = `${this.baseUrl}/tools/submit_ajax.ashx?action=comment_add`, s = {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    "sec-ch-ua": '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    Referer: `${this.baseUrl}/comic/${e}/`,
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    cookie: o,
                    dnt: 1,
                    origin: "https://www.manhuagui.com",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                }, l = "";
                l += `book_id=${e}&`, l += `txtContent=${encodeURIComponent(encodeURIComponent(r))}&`,
                l += i ? `to_comment_id=${i.split("//")[0]}` : "to_comment_id=0";
                let n = await Network.post(a, s, l);
                if (401 === n.status) return void error("Login expired");
                if (200 !== n.status) throw `发送评论失败，状态码: ${n.status}`;
                let c = JSON.parse(n.body);
                if (1 !== c.status) throw `发送评论失败: ${c.msg}`;
                return "ok";
            },
            onClickTag: (e, t) => {
                if ("类型" === e) {
                    const e = this.category.parts.find(e => "类型" === e.name);
                    if (e) {
                        const r = e.categories.findIndex(e => e === t);
                        if (-1 !== r) {
                            const i = e.categoryParams[r];
                            return {
                                action: "category",
                                keyword: t,
                                param: i
                            };
                        }
                    }
                }
                return "作者" === e ? {
                    action: "search",
                    keyword: t,
                    param: t
                } : null;
            }
        }, this.favorites = {
            multiFolder: !1,
            loadComics: async (e, t) => {
                if (!this.loadData("mhg_cookie")) throw "请先登录漫画柜账号";
                let r = `${this.baseUrl}/user/book/shelf/${e}`, i = await this.getHtml(r), o = i.querySelectorAll(".dy_content_li"), a = [];
                for (let e of o) {
                    let t = e.querySelector(".dy_img a");
                    if (!t) continue;
                    let r = t.attributes.href.split("/")[2], i = t.querySelector("img"), o = i ? i.attributes.src || i.attributes["data-src"] : "";
                    o && !o.startsWith("http") && (o = "https:" + o);
                    let s = e.querySelector(".dy_r"), l = "", n = "", c = "", h = "", u = "", m = "";
                    if (s) {
                        let e = s.querySelector("h3");
                        if (e) {
                            let t = e.querySelector("a");
                            t && (l = t.text.trim());
                        }
                        let t = s.querySelectorAll("p");
                        if (t.length > 0) {
                            let e = t[0], r = e.querySelectorAll("em");
                            if (r.length > 0) {
                                let e = r[0].querySelector("a");
                                e && (c = e.text.trim()), h = r.length > 1 ? r[1].text.trim() : "";
                            }
                            n = e.text.replace(/更新内容：/, "").trim();
                        }
                        if (t.length > 1) {
                            let e = t[1].querySelectorAll("em");
                            if (e.length > 0) {
                                let t = e[0].querySelector("a");
                                t && (u = t.text.trim()), m = e.length > 1 ? e[1].text.trim() : "";
                            }
                        }
                    }
                    l || (l = t.attributes.title ? t.attributes.title : t.text.trim());
                    let p = [];
                    c && p.push(`更新：${c}`), h && p.push(`更新日期：${h}`), u && p.push(`最近阅读：${u}`), m && p.push(`最近阅读时间：${m}`),
                    a.push(new Comic({
                        id: r,
                        title: l,
                        subTitle: c || n || "",
                        cover: o,
                        description: "",
                        tags: p
                    }));
                }
                let s = 1, l = i.querySelector(".flickr.right span");
                if (l) {
                    let e = l.text.match(/共(\d+)记录/);
                    if (e) {
                        let t = parseInt(e[1], 10);
                        s = Math.ceil(t / 20);
                    }
                } else {
                    let e = i.querySelectorAll(".page-btns a");
                    for (let t of e) {
                        let e = parseInt(t.text.trim(), 10);
                        !isNaN(e) && e > s && (s = e);
                    }
                }
                return {
                    comics: a,
                    maxPage: s
                };
            },
            addOrDelFavorite: async (e, t, r, i) => {
                if (!r) throw "暂不支持取消收藏";
                let o = this.loadData("mhg_cookie");
                if (!o) throw "请先登录漫画柜账号";
                let a = `${this.baseUrl}/tools/submit_ajax.ashx?action=user_book_shelf_add`, s = {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                    referer: `${this.baseUrl}/comic/${e}/`,
                    cookie: o
                }, l = `book_id=${encodeURIComponent(e)}`, n = await Network.post(a, s, l);
                if (200 !== n.status) throw `添加收藏失败，状态码: ${n.status}`;
                let c = {};
                try {
                    c = JSON.parse(n.body);
                } catch (e) {}
                if (!0 !== c.state && 1 !== c.state) throw c.msg || "添加收藏失败";
                return "ok";
            }
        };
    }
    isAppVersionAfter(e) {
        if (!APP || !APP.version) return !1;
        let t = APP.version, r = e.split("."), i = t.split(".");
        for (let e = 0; e < 3; e++) if (parseInt(i[e]) < parseInt(r[e])) return !1;
        return !0;
    }
    async getHtml(e) {
        let t = {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "cache-control": "no-cache",
            pragma: "no-cache",
            priority: "u=0, i",
            "sec-ch-ua": '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            Referer: "https://www.manhuagui.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            cookie: this.loadData("mhg_cookie")
        }, r = await Network.get(e, t);
        if (200 !== r.status) throw "Invalid status code: " + r.status;
        return new HtmlDocument(r.body);
    }
    parseSimpleComic(e) {
        let t = e.querySelector(".ell > a");
        if (!t) return console.warn("parseSimpleComic: Missing .ell > a element"), null;
        let r = t.attributes.href.split("/")[2], i = t.text.trim(), o = e.querySelector("img");
        if (!o) return console.warn("parseSimpleComic: Missing img element"), null;
        let a = o.attributes.src || o.attributes["data-src"];
        if (!a) return console.warn("parseSimpleComic: Missing cover attribute"), null;
        a = `https:${a}`;
        let s = e.querySelector(".tt"), l = s ? s.text.trim() : "";
        return new Comic({
            id: r,
            title: i,
            cover: a,
            description: l
        });
    }
    parseComic(e) {
        let t = this.parseSimpleComic(e), r = [ e.querySelector(".sl") ? "连载" : "完结", e.querySelector(".updateon").childNodes[0].replace("更新于：", "").trim() ];
        return new Comic({
            id: t.id,
            title: t.title,
            cover: t.cover,
            description: t.description,
            tags: r,
            author
        });
    }
    init() {
        var e = function() {
            var e = String.fromCharCode, t = {}, r = {
                decompressFromBase64: function(e) {
                    return null == e ? "" : "" == e ? null : r._0(e.length, 32, function(r) {
                        return function(e, r) {
                            if (!t[e]) {
                                t[e] = {};
                                for (var i = 0; i < 65; i++) t[e][e.charAt(i)] = i;
                            }
                            return t[e][r];
                        }("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", e.charAt(r));
                    });
                },
                _0: function(t, r, i) {
                    var o, a, s, l, n, c, h, u = [], m = 4, p = 4, g = 3, f = "", d = [], y = {
                        val: i(0),
                        position: r,
                        index: 1
                    };
                    for (o = 0; o < 3; o += 1) u[o] = o;
                    for (s = 0, n = Math.pow(2, 2), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                    0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                    c <<= 1;
                    switch (s) {
                      case 0:
                        for (s = 0, n = Math.pow(2, 8), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                        0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                        c <<= 1;
                        h = e(s);
                        break;

                      case 1:
                        for (s = 0, n = Math.pow(2, 16), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                        0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                        c <<= 1;
                        h = e(s);
                        break;

                      case 2:
                        return "";
                    }
                    for (u[3] = h, a = h, d.push(h); ;) {
                        if (y.index > t) return "";
                        for (s = 0, n = Math.pow(2, g), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                        0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                        c <<= 1;
                        switch (h = s) {
                          case 0:
                            for (s = 0, n = Math.pow(2, 8), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                            0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                            c <<= 1;
                            u[p++] = e(s), h = p - 1, m--;
                            break;

                          case 1:
                            for (s = 0, n = Math.pow(2, 16), c = 1; c != n; ) l = y.val & y.position, y.position >>= 1,
                            0 == y.position && (y.position = r, y.val = i(y.index++)), s |= (l > 0 ? 1 : 0) * c,
                            c <<= 1;
                            u[p++] = e(s), h = p - 1, m--;
                            break;

                          case 2:
                            return d.join("");
                        }
                        if (0 == m && (m = Math.pow(2, g), g++), u[h]) f = u[h]; else {
                            if (h !== p) return null;
                            f = a + a.charAt(0);
                        }
                        d.push(f), u[p++] = a + f.charAt(0), a = f, 0 == --m && (m = Math.pow(2, g), g++);
                    }
                }
            };
            return r;
        }();
        this.getImgInfos = function(t) {
            return function(e) {
                const t = {}, r = e.match(/"files":\s*\[(.*?)\]/);
                r && r[1] && (t.files = r[1].split(",").map(e => e.trim().replace(/"/g, "")));
                const i = e.match(/"path":\s*"([^"]+)"/);
                i && i[1] && (t.path = i[1]);
                const o = e.match(/"len":\s*(\d+)/);
                o && o[1] && (t.len = parseInt(o[1], 10));
                const a = e.match(/"sl":\s*({[^}]+})/);
                if (a && a[1]) try {
                    t.sl = JSON.parse(a[1].replace(/(\w+):/g, '"$1":'));
                } catch (e) {
                    console.error("解析sl字段失败:", e), t.sl = null;
                }
                return t;
            }(function(e, t, r, i, o, a) {
                if (o = function(e) {
                    return (e < t ? "" : o(parseInt(e / t))) + ((e %= t) > 35 ? String.fromCharCode(e + 29) : e.toString(36));
                }, !"".replace(/^/, String)) {
                    for (;r--; ) a[o(r)] = i[r] || o(r);
                    i = [ function(e) {
                        return a[e];
                    } ], o = function() {
                        return "\\w+";
                    }, r = 1;
                }
                for (;r--; ) i[r] && (e = e.replace(new RegExp("\\b" + o(r) + "\\b", "g"), i[r]));
                return e;
            }(...function(t) {
                let r = function(e) {
                    let t = [], r = "", i = [];
                    for (let o = 0; o < e.length; o++) {
                        const a = e[o];
                        "(" === a || "[" === a || "{" === a ? (i.push(a), r += a) : ")" === a && "(" === i[i.length - 1] || "]" === a && "[" === i[i.length - 1] || "}" === a && "{" === i[i.length - 1] ? (i.pop(),
                        r += a) : "," === a && 0 === i.length ? (t.push(r.trim()), r = "") : r += a;
                    }
                    return r && t.push(r.trim()), t;
                }(t.split("}(")[1].split("))")[0]);
                return r[5] = {}, r[3] = e.decompressFromBase64(r[3].split("'")[1]).split("|"),
                r;
            }(t)));
        }, this.decodeViewState = function(t) {
            return t ? e.decompressFromBase64(t) : null;
        };
    }
    parseSearchComic(e) {
        try {
            let t = e.querySelector(".book-detail dl dt a");
            if (!t) return null;
            let r = t.attributes.href.split("/")[2], i = t.text.trim(), o = e.querySelector(".book-cover .bcover img"), a = o ? o.attributes.src : null;
            a && (a = a.startsWith("//") ? `https:${a}` : a);
            let s = e.querySelector(".tags.status span .red"), l = s ? s.text.trim() : "", n = e.querySelector(".tags.status span .red:nth-child(2)"), c = n ? n.text.trim() : "", h = e.querySelector(".book-score .score-avg strong"), u = h ? h.text.trim() : "", m = e.querySelectorAll(".tags a[href*='/author/']"), p = m.length > 0 ? m.map(e => e.text.trim()).join(", ") : "", g = e.querySelectorAll(".tags a[href*='/list/']"), f = g.length > 0 ? g.map(e => e.text.trim()) : [], d = e.querySelector(".intro span"), y = d ? d.text.replace("简介：", "").trim() : "";
            return !y && l && (y = `状态: ${l}`, c && (y += `, 更新: ${c}`)), new Comic({
                id: r,
                title: i,
                cover: a,
                description: y,
                tags: [ ...f, l ],
                author: p,
                score: u
            });
        } catch (e) {
            return console.error("解析搜索结果项时出错:", e), null;
        }
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const i = String(null == e ? "" : e).trim() || t;
    return r ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), o = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), a = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${i}/${o}/${a}@${s}`;
    const c = l ? `${l}/${n}` : n;
    return `${i}/${o}/${a}@${s}/${n.startsWith(`${l}/`) ? n : c}`;
}

"use strict";
