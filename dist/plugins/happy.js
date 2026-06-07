class Happy extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "嗨皮漫画", this.key = "happy", this.version = "1.0.0", this.minAppVersion = "1.6.0",
        this.url = resolvePluginUpdateUrl("happy.js"), this.baseUrl = "https://m.happymh.com",
        this.categoryParamMap = {
            全部: "",
            热血: "rexue",
            格斗: "gedou",
            武侠: "wuxia",
            魔幻: "mohuan",
            魔法: "mofa",
            冒险: "maoxian",
            爱情: "aiqing",
            搞笑: "gaoxiao",
            校园: "xiaoyuan",
            科幻: "kehuan",
            后宫: "hougong",
            励志: "lizhi",
            职场: "zhichang",
            美食: "meishi",
            社会: "shehui",
            黑道: "heidao",
            战争: "zhanzheng",
            历史: "lishi",
            悬疑: "xuanyi",
            竞技: "jingji",
            体育: "tiyu",
            恐怖: "kongbu",
            推理: "tuili",
            生活: "shenghuo",
            伪娘: "weiniang",
            治愈: "zhiyu",
            神鬼: "shengui",
            四格: "sige",
            百合: "baihe",
            耽美: "danmei",
            舞蹈: "wudao",
            侦探: "zhentan",
            宅男: "zhainan",
            音乐: "yinyue",
            萌系: "mengxi",
            古风: "gufeng",
            恋爱: "lianai",
            都市: "dushi",
            性转: "xingzhuan",
            穿越: "chuanyue",
            游戏: "youxi",
            其他: "qita",
            爱妻: "aiqi",
            日常: "richang",
            腹黑: "fuhei",
            古装: "guzhuang",
            仙侠: "xianxia",
            生化: "shenghua",
            修仙: "xiuxian",
            情感: "qinggan",
            改编: "gaibian",
            纯爱: "chunai",
            唯美: "weimei",
            蔷薇: "qiangwei",
            明星: "mingxing",
            猎奇: "lieqi",
            青春: "qingchun",
            幻想: "huanxiang",
            惊奇: "jingqi",
            彩虹: "caihong",
            奇闻: "qiwen",
            权谋: "quanmou",
            宅斗: "zhaidou",
            限制级: "xianzhiji",
            装逼: "zhuangbi",
            浪漫: "langman",
            偶像: "ouxiang",
            大女主: "danvzhu",
            复仇: "fuchou",
            虐心: "nuexin",
            恶搞: "egao",
            灵异: "lingyi",
            惊险: "jingxian",
            宠爱: "chongai",
            逆袭: "nixi",
            妖怪: "yaoguai",
            暧昧: "aimei",
            同人: "tongren",
            架空: "jiakong",
            真人: "zhenren",
            动作: "dongzuo",
            橘味: "juwei",
            宫斗: "gongdou",
            脑洞: "naodong",
            漫改: "mangai",
            战斗: "zhandou",
            丧尸: "sangshi",
            美少女: "meishaonv",
            怪物: "guaiwu",
            系统: "xitong",
            智斗: "zhidou",
            机甲: "jijia",
            高甜: "gaotian",
            僵尸: "jiangshi",
            致郁: "zhiyu",
            电竞: "dianjing",
            神魔: "shenmo",
            异能: "yineng",
            末日: "mori",
            乙女: "yinv",
            豪快: "haokuai",
            奇幻: "qihuan",
            绅士: "shenshi",
            正能量: "zhengnengliang",
            宫廷: "gongting",
            亲情: "qinqing",
            养成: "yangcheng",
            剧情: "juqing",
            轻小说: "qingxiaoshuo",
            暗黑: "anhei",
            长条: "changtiao",
            玄幻: "xuanhuan",
            霸总: "bazong",
            欧皇: "ouhuang",
            生存: "shengcun",
            异世界: "yishijie",
            其它: "qita",
            C99: "C99",
            节操: "jiecao",
            AA: "AA",
            影视化: "yingshihua",
            欧风: "oufeng",
            女神: "nvshen",
            爽感: "shuanggan",
            转生: "zhuansheng",
            异形: "yixing",
            反套路: "fantaolu",
            双男主: "shuangnanzhu",
            无敌流: "wudiliu",
            重生: "zhongsheng",
            血腥: "xuexing",
            奇遇: "qiyu",
            泛爱: "fanai",
            软萌: "ruanmeng",
            邪恶: "xiee",
            资讯: "zixun",
            女频: "nvpin",
            现言: "xianyan",
            诡异: "guiyi"
        }, this.avatarMap = {
            0: `${this.baseUrl}/next/bookcase/dist/28c0c017f0c3c6d665ee6b9a71ebc461.png`,
            1: `${this.baseUrl}/next/bookcase/dist/ebd700fe1b9ee6ac7793786b7e6b2910.png`,
            2: `${this.baseUrl}/next/bookcase/dist/0a2843f0aa4e0c3e62594670d3c48548.png`,
            3: `${this.baseUrl}/next/bookcase/dist/bec3031d5dad900b868993510ea623c2.png`,
            4: `${this.baseUrl}/next/bookcase/dist/c6799b805ca268e73f73eb1e6642905b.png`,
            5: `${this.baseUrl}/next/bookcase/dist/64dbbd1a81e716b6cd0d227a3cf96ce8.png`,
            6: `${this.baseUrl}/next/bookcase/dist/9ea59ec786a70bb3f13549ab721e7604.png`,
            7: `${this.baseUrl}/next/bookcase/dist/0c40a05f21b93364457d221f8f09b975.png`,
            8: `${this.baseUrl}/next/bookcase/dist/28c0c017f0c3c6d665ee6b9a71ebc461.png`,
            9: `${this.baseUrl}/next/bookcase/dist/fa323f06704f537c396c7fc2269fe31c.png`,
            10: `${this.baseUrl}/next/bookcase/dist/9a80d1d72cb1e1e6e7e8178524cc29bd.png`,
            11: `${this.baseUrl}/next/bookcase/dist/845be1af432b6df590aef786ba692739.png`,
            12: `${this.baseUrl}/next/bookcase/dist/57336e9f3b941f7f501b353e128cd764.png`,
            13: `${this.baseUrl}/next/bookcase/dist/02d9fe624cbee696e77b5e8a16bb8980.png`,
            14: `${this.baseUrl}/next/bookcase/dist/e10824d3bf7a1ef4e1996c053420eeea.png`,
            15: `${this.baseUrl}/next/bookcase/dist/b3ffe4351a7e6f1e5a5e48932eadf17f.png`,
            16: `${this.baseUrl}/next/bookcase/dist/cea88102f3bc609f9910851ff15a5105.png`
        }, this.formatAuthor = e => {
            const t = null == e ? void 0 : e.replace(/[+/?·]/g, ",").replace(/,（/g, "(").replace(/：|:,/g, ":").replace(/（/g, "(").replace(/）/g, ")");
            return null == t ? void 0 : t.split(",").map(e => e.trim()).filter(e => e);
        }, this.formatUpdateTime = e => /^\d{2}-\d{2}$/.test(e) ? `${(new Date).getFullYear()}-${e}` : e,
        this.parseHtmlComic = e => {
            var t, a, i, s, n, o;
            const r = e.querySelector("a").attributes.href.split("/").pop(), l = null == (t = e.querySelector(".manga-title")) ? void 0 : t.text.trim(), c = e.querySelector("mip-img").attributes.src, h = null == (a = e.querySelector(".manga-chapter")) ? void 0 : a.text.replace("更新至：", "").trim(), u = null == (i = e.querySelector(".rank-number-small")) ? void 0 : i.text.trim(), m = e.querySelectorAll(".manga-category"), g = null == (s = m[0]) ? void 0 : s.text.split(/[|、]/).map(e => e.trim()).filter(e => e), p = null == (n = m[1]) ? void 0 : n.text.trim(), d = null == (o = this.formatAuthor(p)) ? void 0 : o.join(" | "), b = m.slice(2).map(e => e.text.trim()).filter(e => e).join(" | ");
            return {
                id: r,
                title: u ? `${u}. ${l}` : l,
                subTitle: d,
                cover: c,
                tags: g,
                description: h || b || d
            };
        }, this.parseJsonComic = e => {
            var t, a;
            const i = null == (t = this.formatAuthor(e.author)) ? void 0 : t.join(" | ");
            return {
                id: e.manga_code,
                title: e.name,
                subTitle: i,
                cover: e.cover,
                tags: null == (a = e.genre_ids) ? void 0 : a.split("、").map(e => e.trim()).filter(e => e),
                description: e.last_chapter || i
            };
        }, this.parseComment = e => {
            let t = e.content;
            return e.reply_to_comment && e.reply_to_comment.user && (t = `回复 <b><a>@${e.reply_to_comment.user.username}</a></b>：${t}`),
            {
                userName: e.user.username,
                avatar: this.avatarMap[e.user.cover],
                content: t,
                time: e.reply_to_comment ? e.create_time : `章节：${e.ch_name}\n${e.create_time}`,
                replyCount: e.reply_to_comment ? null : e.sub_comments_count,
                id: e.id
            };
        }, this.loadCommentsCommon = async (e, t, a, i, s) => {
            if (i) {
                const e = `${this.baseUrl}/v2.0/apis/comment/subComments?root_id=${i}&pn=${a}&ps=10`, t = await Network.get(e);
                if (200 !== t.status) throw `评论接口请求失败: ${t.status}`;
                const s = JSON.parse(t.body);
                return {
                    comments: s.data.items.map(this.parseComment),
                    maxPage: s.data.is_end ? a : null
                };
            }
            {
                const i = this.loadSetting("commentOrder"), n = t ? `&ch_id=${t}` : "", o = `${this.baseUrl}/v2.0/apis/comment?code=${e}${n}&pn=${a}&order=${i}&from=${s}`, r = await Network.get(o);
                if (200 !== r.status) throw `评论接口请求失败: ${r.status}`;
                const l = JSON.parse(r.body);
                return {
                    comments: l.data.items.map(this.parseComment),
                    maxPage: l.data.isEnd ? a : null
                };
            }
        }, this.loadChaptersWithCache = async e => {
            const t = async t => {
                const a = `${this.baseUrl}/v2.0/apis/manga/chapterByPage?code=${e}&page=${t}&lang=cn&order=asc`, i = await Network.get(a);
                if (200 !== i.status) throw `第${t}页章节接口请求失败: ${i.status}`;
                return JSON.parse(i.body).data;
            }, a = await t(1), i = a.total, s = `chapters_${e}`, n = this.loadData(s);
            if (n && n.total === i) return n.chapters;
            const o = a.items, r = o.length, l = Math.ceil(i / r);
            let c = 1, h = {};
            if (n && n.total > r && n.total < i) c = Math.floor(n.total / r), h = {
                ...n.chapters
            }; else for (const e of o) h[e.id] = e.chapterName;
            const u = l - c;
            if (u > 0) {
                const e = Array.from({
                    length: u
                }, (e, t) => c + t + 1), a = await Promise.all(e.map(e => t(e)));
                for (const e of a) for (const t of e.items) h[t.id] = t.chapterName;
            }
            return this.saveCache(s, {
                time: Date.now(),
                total: Object.keys(h).length,
                chapters: h
            }), h;
        }, this.saveCache = (e, t) => {
            this.saveData(e, t);
            const a = this.loadData("cache_keys") || [];
            a.includes(e) || (a.push(e), this.saveData("cache_keys", a));
        }, this.cleanCache = e => {
            const t = this.loadData("cache_keys") || [], a = [];
            for (const i of t) Date.now() - this.loadData(i).time < e ? a.push(i) : this.deleteData(i);
            this.saveData("cache_keys", a);
        }, this.explore = [ {
            title: "嗨皮漫画",
            type: "singlePageWithMultiPart",
            load: async () => {
                const e = await Network.get(this.baseUrl);
                if (200 !== e.status) throw `主页请求失败: ${e.status}`;
                const t = new HtmlDocument(e.body), a = t.querySelectorAll(".manga-area"), i = {};
                for (const e of a) {
                    const t = e.querySelector("h3").text.trim(), a = e.querySelectorAll(".manga-cover").map(this.parseHtmlComic);
                    a.length > 0 && (i[t] = a);
                }
                return t.dispose(), i;
            }
        } ], this.category = {
            title: "嗨皮漫画",
            parts: [ {
                name: "最近更新",
                type: "fixed",
                categories: Object.keys(this.categoryParamMap),
                categoryParams: Object.values(this.categoryParamMap),
                itemType: "category"
            } ],
            enableRankingPage: !0
        }, this.categoryComics = {
            load: async (e, t, a, i) => {
                const s = `${this.baseUrl}/apis/c/index?genre=${t}&area=${a[0]}&audience=${a[1]}&series_status=${a[2]}&pn=${i}`, n = await Network.get(s, {
                    Referer: `${this.baseUrl}/latest`
                });
                if (200 !== n.status) throw `分类接口请求失败: ${n.status}`;
                const o = JSON.parse(n.body);
                return {
                    comics: o.data.items.map(this.parseJsonComic),
                    maxPage: o.data.isEnd ? i : null
                };
            },
            optionList: [ {
                label: "地区",
                options: [ "-全部", "china-内地", "japan-日本", "hongkong-港台", "europe-欧美", "korea-韩国", "other-其他" ]
            }, {
                label: "受众",
                options: [ "-全部", "shaonian-少年", "shaonv-少女", "qingnian-青年", "BL-BL", "GL-GL" ]
            }, {
                label: "状态",
                options: [ "-全部", "0-连载中", "1-完结" ]
            } ],
            ranking: {
                options: [ "day-日阅读", "dayBookcasesOne-日收藏", "week-周阅读", "weekBookcase-周收藏", "month-月阅读", "monthBookcases-月收藏", "voteRank-总评分", "voteNumMonthRank-月投票" ],
                load: async (e, t) => {
                    const a = `${this.baseUrl}/rank/${e}`, i = await Network.get(a);
                    if (200 !== i.status) throw `排行榜页面请求失败: ${i.status}`;
                    const s = new HtmlDocument(i.body), n = s.querySelectorAll(".manga-rank").map(this.parseHtmlComic);
                    return s.dispose(), {
                        comics: n,
                        maxPage: 1
                    };
                }
            }
        }, this.search = {
            load: async (e, t, a) => {
                const i = `${this.baseUrl}/v2.0/apis/manga/ssearch`, s = await Network.post(i, {
                    Referer: `${this.baseUrl}/sssearch`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }, `searchkey=${encodeURIComponent(e)}&v=v2.13`);
                if (200 !== s.status) throw `搜索接口请求失败: ${s.status}`;
                return {
                    comics: JSON.parse(s.body).data.items.map(this.parseJsonComic),
                    maxPage: 1
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                var t, a, i, s, n;
                const o = `${this.baseUrl}/manga/${e}`, r = await Network.get(o);
                if (200 !== r.status) throw `漫画详情页请求失败: ${r.status}`;
                const l = new HtmlDocument(r.body), c = null == (t = r.body.match(/<mip-data>\s*<script type="application\/json">\s*([\s\S]*?)<\/script>\s*<\/mip-data>/i)) ? void 0 : t[1], h = JSON.parse(c), u = null == (a = l.querySelector(".mg-title")) ? void 0 : a.text.trim(), m = null == (i = l.querySelector(".mg-sub-title")) ? void 0 : i.text.replace(/,/g, "／").trim(), g = l.querySelector("mip-img").attributes.src, p = l.querySelectorAll(".mg-sub-title a").map(e => e.text.trim()).join(","), d = this.formatAuthor(p), b = d.join(" | "), y = l.querySelectorAll(".mg-cate a").map(e => e.text.trim()).filter(e => e), f = null == (s = l.querySelector("mip-showmore")) ? void 0 : s.text.trim(), $ = m ? [ f, `别名：${m}` ].filter(e => e).join("\n\n") : f, x = null == (n = l.querySelector(".update-time .time")) ? void 0 : n.text.trim(), v = this.formatUpdateTime(x), _ = l.querySelectorAll(".manga-cover").map(this.parseHtmlComic), w = parseFloat(h.score) || null, k = h.serie_status ? "完结" : "连载中", U = await this.loadChaptersWithCache(e);
                return l.dispose(), new ComicDetails({
                    title: u,
                    subTitle: b,
                    cover: g,
                    description: $,
                    tags: {
                        作者: d,
                        题材: y,
                        状态: [ k ]
                    },
                    chapters: U,
                    recommend: _,
                    updateTime: v,
                    url: o,
                    stars: w
                });
            },
            loadEp: async (e, t) => {
                const a = `${this.baseUrl}/v2.0/apis/manga/reading?code=${e}&cid=${t}&v=v3.1919111`, i = await Network.get(a, {
                    Referer: this.baseUrl,
                    "X-Requested-With": "XMLHttpRequest"
                });
                if (200 !== i.status) throw `章节图片接口请求失败: ${i.status}`;
                const s = JSON.parse(i.body), n = this.loadSetting("originalImage"), o = s.data.scans.filter(e => 0 === e.n).map(e => n ? e.url.replace(/\?.*$/, "") : e.url);
                if (0 === o.length) throw "本章未找到任何图片，请确认网页来源是否正常";
                return {
                    images: o
                };
            },
            loadComments: async (e, t, a, i) => await this.loadCommentsCommon(e, null, a, i, "detail"),
            loadChapterComments: async (e, t, a, i) => await this.loadCommentsCommon(e, t, a, i, "read"),
            onClickTag: (e, t) => "作者" === e ? {
                page: "search",
                attributes: {
                    keyword: t
                }
            } : "题材" === e ? {
                page: "category",
                attributes: {
                    category: t,
                    param: this.categoryParamMap[t]
                }
            } : void 0,
            enableTagsTranslate: !1
        }, this.settings = {
            originalImage: {
                title: "阅读显示原图",
                type: "switch",
                default: !1
            },
            commentOrder: {
                title: "评论排序方式",
                type: "select",
                options: [ {
                    value: "hot",
                    text: "最热"
                }, {
                    value: "time",
                    text: "最新"
                } ],
                default: "hot"
            },
            cacheTTL: {
                title: "缓存有效时长",
                type: "select",
                options: [ {
                    value: 0,
                    text: "当次"
                }, {
                    value: 6048e5,
                    text: "一周"
                }, {
                    value: 2592e6,
                    text: "一月"
                }, {
                    value: 7776e6,
                    text: "三月"
                }, {
                    value: 15552e6,
                    text: "半年"
                }, {
                    value: 31104e6,
                    text: "一年"
                } ],
                default: 2592e6
            },
            wipeCache: {
                title: "清除全部缓存",
                type: "callback",
                buttonText: "清除",
                callback: () => {
                    this.cleanCache(0), this.deleteData("cache_keys"), UI.showMessage("已清除全部缓存");
                }
            }
        };
    }
    init() {
        this.cleanCache(this.loadSetting("cacheTTL"));
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const i = String(null == e ? "" : e).trim() || t;
    return a ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), s = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), n = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), r = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${s}/${n}@${o}`;
    const c = r ? `${r}/${l}` : l;
    return `${i}/${s}/${n}@${o}/${l.startsWith(`${r}/`) ? l : c}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
