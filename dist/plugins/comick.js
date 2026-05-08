class Comick extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "comick", this.key = "comick", this.version = "1.2.0",
        this.minAppVersion = "1.4.0", this.url = resolvePluginUpdateUrl("comick.js"), this.settings = {
            domains: {
                title: "主页源",
                type: "select",
                options: [ {
                    value: "comick.art"
                } ],
                default: "comick.art"
            }
        }, this.explore = [ {
            title: "comick",
            type: "singlePageWithMultiPart",
            load: async () => {
                let e = await Network.get("https://comick.art/home");
                if (200 !== e.status) throw "Request Error: " + e.status;
                let t = new HtmlDocument(e.body), a = JSON.parse(t.getElementById("sv-data").text).data;
                return {
                    最近更新: this.transformBookList(a.most_follow_new[7]),
                    最近上传: this.transformBookList(a.recent_add),
                    最近热门: this.transformBookList(a.popular_ongoing),
                    完结: this.transformBookList(a.completed)
                };
            }
        } ], this.category = {
            title: "comick",
            parts: [ {
                name: "类型",
                type: "fixed",
                categories: Object.values(Comick.category_param_dict),
                itemType: "category",
                categoryParams: Object.keys(Comick.category_param_dict)
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, a, i) => {
                let r = "https://comick.art/api/search?", o = [ `genres[]=${encodeURIComponent(t)}`, `page=${encodeURIComponent(i)}` ];
                a[0] && o.push(`order_by=${encodeURIComponent(a[0].split("-")[0])}`), a[1] && "-全部" !== a[1] && o.push(`country[]=${encodeURIComponent(a[1].split("-")[0])}`),
                a[2] && o.push(`status=${encodeURIComponent(a[2].split("-")[0])}`), r += o.join("&");
                let l = Comick.getRandomHeaders(), s = await Network.get(r, l);
                if (200 !== s.status) throw "Request Error: " + s.status;
                let n = JSON.parse(s.body).data;
                if (!Array.isArray(n)) throw "Invalid data format";
                let c = n.total / n.per_page;
                return {
                    comics: n.map(this.getFormattedManga),
                    maxPage: c
                };
            },
            optionList: [ {
                options: [ "created_at-更新排序", "user_follow_count-关注排序", "rating-评分排序", "uploaded-创建排序" ]
            }, {
                options: [ "-全部", "cn-国漫", "jp-日本", "kr-韩国", "others-欧美" ]
            }, {
                options: [ "1-连载", "2-完结", "3-休刊", "4-暂停更新" ]
            } ]
        }, this.search = {
            load: async (e, t, a) => {
                let i = Comick.getRandomHeaders(), r = `https://comick.art/search?q=${e}&page=${a}`, o = await Network.get(r, i);
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                let l = new HtmlDocument(o.body), s = JSON.parse(l.getElementById("sv-data").text).data;
                if (!Array.isArray(s)) throw "Invalid data format";
                let n = s.total / s.per_page;
                return {
                    comics: s.map(this.getFormattedManga),
                    maxPage: Math.ceil(n)
                };
            },
            optionList: []
        }, this.comic = {
            id: null,
            buildId: null,
            loadInfo: async e => {
                var t;
                let a = Comick.getRandomHeaders(), [i, r] = e.split("//");
                if (!i) throw "ID error: ";
                let o = await Network.get(`https://comick.art/comic/${i}`, a);
                if (200 !== o.status) throw "Invalid status code: " + o.status;
                this.comic.id = e;
                let l = new HtmlDocument(o.body), s = JSON.parse(l.getElementById("comic-data").text), n = s.authors || [], c = r || (null == s ? void 0 : s.title) || "未知标题", u = (null == s ? void 0 : s.status) || "1", m = s.default_thumbnail ? s.default_thumbnail : s.full_image_path ? s.full_image_path : "https://comick.art/images/default-thumbnail.webp", d = (null == (t = n[0]) ? void 0 : t.name) || "未知作者", p = (e => {
                    try {
                        let t = null == e ? void 0 : e.md_comic_md_genres;
                        return t && Array.isArray(t) ? t.map(e => {
                            var t;
                            return null == e || null == (t = e.md_genres) ? void 0 : t.slug;
                        }).filter(e => null != e) : [];
                    } catch (e) {
                        return [];
                    }
                })(s), h = p.map(e => Comick.category_param_dict[e] || e), g = (null == s ? void 0 : s.desc) || "暂无描述", _ = null != s && s.last_chapter ? `第${s.last_chapter}话` : "暂无更新", f = new Map, k = _;
                try {
                    let e = await (async (e, t) => {
                        let i = new Map, r = null, o = 1, l = 1, s = e => {
                            e.forEach(e => {
                                let t = (null == e ? void 0 : e.lang) || "unknown";
                                i.has(t) || i.set(t, []), i.get(t).push(e);
                            });
                        };
                        for (console.log(`开始加载章节列表，漫画slug: ${e}`); o <= l; ) {
                            var n, c;
                            let t, i = `https://comick.art/api/comics/${e}/chapter-list?page=${o}`, u = await Network.get(i, a = Comick.getRandomHeaders());
                            if (console.log(`请求章节列表页面 ${o}，URL: ${u}`), 200 !== u.status) throw `Invalid status code: ${u.status}`;
                            try {
                                t = JSON.parse(u.body);
                            } catch (e) {
                                throw "Invalid chapter list response";
                            }
                            let m = Array.isArray(null == (n = t) ? void 0 : n.data) ? t.data : [];
                            1 === o && m.length > 0 && (r = m[0].updated_at || m[0].publish_at || m[0].created_at || null),
                            s(m);
                            let d = null == (c = t) ? void 0 : c.pagination;
                            if (d && null != d.last_page) {
                                let e = parseInt(d.last_page, 10);
                                !Number.isNaN(e) && e > 0 && (l = e);
                            }
                            o += 1;
                        }
                        let u = new Map;
                        i.forEach((e, t) => {
                            let a = new Map;
                            e.slice().reverse().forEach(e => {
                                let t, i, r = (null == e ? void 0 : e.lang) || "unknown", o = (null == e ? void 0 : e.hid) || "unknown", l = null != (null == e ? void 0 : e.chap) && "" !== e.chap, s = null != (null == e ? void 0 : e.vol) && "" !== e.vol;
                                l ? (t = `${o}//chapter//${e.chap}//${r}`, i = `第${e.chap}话`) : s ? (t = `${o}//volume//${e.vol}//${r}`,
                                i = `第${e.vol}卷`) : (t = `${o}//no//-1//${r}`, i = null != e && e.title ? e.title : "无标卷"),
                                a.set(t, i);
                            });
                            let i = Comick.language_dict[t] || t || "未知语言";
                            u.set(i, a);
                        });
                        let m = "暂无更新";
                        if (r) {
                            let e = new Date(r);
                            m = isNaN(e.getTime()) ? r : e.toISOString().split("T")[0];
                        } else null != t && t.last_chapter && (m = `第${t.last_chapter}话`);
                        return [ u, m ];
                    })(i, s);
                    Array.isArray(e) && (f = e[0] instanceof Map ? e[0] : f, k = "string" == typeof e[1] && e[1].length > 0 ? e[1] : k);
                } catch (e) {
                    f = new Map;
                }
                return 0 === f.size ? {
                    title: c,
                    cover: m,
                    description: g,
                    tags: {
                        语言: [],
                        作者: [ d ],
                        更新: [ k ],
                        标签: h,
                        状态: [ Comick.comic_status[u] ]
                    },
                    chapters: f
                } : {
                    title: c,
                    cover: m,
                    description: g,
                    tags: {
                        作者: [ d ],
                        更新: [ k ],
                        标签: h,
                        状态: [ Comick.comic_status[u] ]
                    },
                    chapters: f
                };
            },
            loadEp: async (e, t) => {
                let [a, i] = e.split("//");
                if (!a) throw "ID error: ";
                let r = [], [o, l, s, n] = t.split("//");
                if (!(o && l && s && n)) return console.error("Invalid epId format. Expected 'hid//chapter'"),
                {
                    images: r
                };
                let c = " ";
                c = "no" == l ? `https://comick.art/comic/${a}/${o}` : `https://comick.art/comic/${a}/${o}-${l}-${s}-${n}`;
                let u = 100;
                for (;u > 0; ) {
                    var m, d;
                    let e = await Network.get(c);
                    if (200 !== e.status) break;
                    let t = new HtmlDocument(e.body), a = null == (m = JSON.parse(t.getElementById("sv-data").text).chapter) ? void 0 : m.images;
                    if (!a || !Array.isArray(a)) break;
                    a.forEach(e => {
                        let t = `${e.url}`;
                        r.push(t);
                    });
                    let i = t.querySelector("a#next-chapter");
                    if (null == i || null == (d = i.text) || !d.match(/下一页|下一頁/)) break;
                    {
                        var p;
                        let e = null == (p = i.attributes) ? void 0 : p.href;
                        if (!e) break;
                        c = e;
                    }
                    u--;
                }
                return {
                    images: r
                };
            },
            onImageLoad: (e, t, a) => {
                let i = Comick.getRandomHeaders();
                return {
                    url: e,
                    method: "GET",
                    headers: i,
                    onLoadFailed: () => ({
                        url: e
                    })
                };
            },
            onThumbnailLoad: e => {
                let t = Comick.getRandomHeaders();
                return {
                    url: e,
                    method: "GET",
                    headers: t,
                    onLoadFailed: () => ({
                        url: e
                    })
                };
            },
            onClickTag: (e, t) => {
                if ("标签" === e) return {
                    action: "category",
                    keyword: `${t}`,
                    param: Comick.reversed_category_param_dict[t] || t
                };
                throw "Click Tag Error";
            }
        };
    }
    get baseUrl() {
        return "https://comick.art";
    }
    static getRandomHeaders() {
        let e = [ "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" ];
        return {
            "User-Agent": e[Math.floor(Math.random() * e.length)],
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            Connection: "keep-alive",
            referer: "https://comick.art/"
        };
    }
    transReformBookList(e, t = "更新至：") {
        return e.map(e => {
            var t, a, i, r;
            return {
                id: `${(null == (t = e.relates) ? void 0 : t.slug) || "unknown"}//${(null == (a = e.relates) ? void 0 : a.title) || "未知标题"}`,
                title: (null == (i = e.relates) ? void 0 : i.title) || "未知标题",
                cover: null != (r = e.relates) && null != (r = r.md_covers) && null != (r = r[0]) && r.b2key ? `https://cdn1.comicknew.pictures/${e.relates.slug}/covers/${e.relates.md_covers[0].b2key}` : "w7xqzd.jpg"
            };
        });
    }
    transformBookList(e, t = "更新至：") {
        return e.map(e => ({
            id: `${e.slug || "unknown"}//${e.title || "未知标题"}`,
            title: e.title || "未知标题",
            cover: e.default_thumbnail ? e.default_thumbnail : e.full_image_path ? e.full_image_path : "https://comick.art/images/default-thumbnail.webp",
            tags: [],
            description: `${t}${e.last_chapter || "未知"}`
        }));
    }
    getFormattedManga(e) {
        return {
            id: `${e.slug || "unknown"}//${e.title || "未知标题"}`,
            title: e.title || "无标题",
            cover: e.default_thumbnail ? e.default_thumbnail : e.full_image_path ? e.full_image_path : "https://comick.art/images/default-thumbnail.webp",
            tags: [ `更新时间: ${e.uploaded_at ? new Date(e.uploaded_at).toISOString().split("T")[0] : new Date(e.created_at).toISOString().split("T")[0]}` ],
            description: e.description || "暂无描述"
        };
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
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), l = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${i}/${r}/${o}@${l}`;
    const c = s ? `${s}/${n}` : n;
    return `${i}/${r}/${o}@${l}/${n.startsWith(`${s}/`) ? n : c}`;
}

Comick.comic_status = {
    1: "连载",
    2: "完结",
    3: "休刊",
    4: "暂停更新"
}, Comick.category_param_dict = {
    romance: "浪漫",
    comedy: "喜剧",
    drama: "剧情",
    fantasy: "奇幻",
    "slice-of-life": "日常",
    action: "动作",
    adventure: "冒险",
    psychological: "心理",
    mystery: "悬疑",
    historical: "历史",
    tragedy: "悲剧",
    "sci-fi": "科幻",
    horror: "恐怖",
    isekai: "异世界",
    sports: "运动",
    thriller: "惊悚",
    mecha: "机甲",
    philosophical: "哲学",
    wuxia: "武侠",
    medical: "医疗",
    "magical-girls": "魔法少女",
    superhero: "超级英雄",
    "shounen-ai": "少年爱",
    mature: "成年",
    "gender-bender": "性转",
    "shoujo-ai": "少女爱",
    oneshot: "单篇",
    "web-comic": "网络漫画",
    doujinshi: "同人志",
    "full-color": "全彩",
    "long-strip": "长条",
    adaptation: "改编",
    anthology: "选集",
    "4-koma": "四格",
    "user-created": "用户创作",
    "award-winning": "获奖",
    "official-colored": "官方上色",
    "fan-colored": "粉丝上色",
    "school-life": "校园生活",
    supernatural: "超自然",
    magic: "魔法",
    monsters: "怪物",
    "martial-arts": "武术",
    animals: "动物",
    demons: "恶魔",
    harem: "后宫",
    reincarnation: "转生",
    "office-workers": "上班族",
    survival: "生存",
    military: "军事",
    crossdressing: "女装",
    loli: "萝莉",
    shota: "正太",
    yuri: "百合",
    yaoi: "耽美",
    "video-games": "电子游戏",
    "monster-girls": "魔物娘",
    delinquents: "不良少年",
    ghosts: "幽灵",
    "time-travel": "时间旅行",
    cooking: "烹饪",
    police: "警察",
    aliens: "外星人",
    music: "音乐",
    mafia: "黑帮",
    vampires: "吸血鬼",
    samurai: "武士",
    "post-apocalyptic": "后末日",
    gyaru: "辣妹",
    villainess: "恶役千金",
    "reverse-harem": "逆后宫",
    ninja: "忍者",
    zombies: "僵尸",
    "traditional-games": "传统游戏",
    "virtual-reality": "虚拟现实",
    adult: "成人",
    ecchi: "情色",
    "sexual-violence": "性暴力",
    smut: "肉欲"
}, Comick.reversed_category_param_dict = {
    浪漫: "romance",
    喜剧: "comedy",
    剧情: "drama",
    奇幻: "fantasy",
    日常: "slice-of-life",
    动作: "action",
    冒险: "adventure",
    心理: "psychological",
    悬疑: "mystery",
    历史: "historical",
    悲剧: "tragedy",
    科幻: "sci-fi",
    恐怖: "horror",
    异世界: "isekai",
    运动: "sports",
    惊悚: "thriller",
    机甲: "mecha",
    哲学: "philosophical",
    武侠: "wuxia",
    医疗: "medical",
    魔法少女: "magical-girls",
    超级英雄: "superhero",
    少年爱: "shounen-ai",
    成年: "mature",
    性转: "gender-bender",
    少女爱: "shoujo-ai",
    单篇: "oneshot",
    网络漫画: "web-comic",
    同人志: "doujinshi",
    全彩: "full-color",
    长条: "long-strip",
    改编: "adaptation",
    选集: "anthology",
    四格: "4-koma",
    用户创作: "user-created",
    获奖: "award-winning",
    官方上色: "official-colored",
    粉丝上色: "fan-colored",
    校园生活: "school-life",
    超自然: "supernatural",
    魔法: "magic",
    怪物: "monsters",
    武术: "martial-arts",
    动物: "animals",
    恶魔: "demons",
    后宫: "harem",
    转生: "reincarnation",
    上班族: "office-workers",
    生存: "survival",
    军事: "military",
    女装: "crossdressing",
    萝莉: "loli",
    正太: "shota",
    百合: "yuri",
    耽美: "yaoi",
    电子游戏: "video-games",
    魔物娘: "monster-girls",
    不良少年: "delinquents",
    幽灵: "ghosts",
    时间旅行: "time-travel",
    烹饪: "cooking",
    警察: "police",
    外星人: "aliens",
    音乐: "music",
    黑帮: "mafia",
    吸血鬼: "vampires",
    武士: "samurai",
    后末日: "post-apocalyptic",
    辣妹: "gyaru",
    恶役千金: "villainess",
    逆后宫: "reverse-harem",
    忍者: "ninja",
    僵尸: "zombies",
    传统游戏: "traditional-games",
    虚拟现实: "virtual-reality",
    成人: "adult",
    情色: "ecchi",
    性暴力: "sexual-violence",
    肉欲: "smut"
}, Comick.language_dict = {
    en: "英文",
    "pt-br": "巴西葡萄牙文",
    "es-419": "拉丁美洲西班牙文",
    ru: "俄文",
    vi: "越南文",
    fr: "法文",
    pl: "波兰文",
    id: "印度尼西亚文",
    tr: "土耳其文",
    it: "意大利文",
    es: "西班牙文",
    uk: "乌克兰文",
    ar: "阿拉伯文",
    "zh-hk": "繁体中文",
    hu: "匈牙利文",
    zh: "中文",
    de: "德文",
    ko: "韩文",
    th: "泰文",
    bg: "保加利亚文",
    ca: "加泰罗尼亚文",
    fa: "波斯文",
    ro: "罗马尼亚文",
    cs: "捷克文",
    mn: "蒙古文",
    he: "希伯来文",
    pt: "葡萄牙文",
    hi: "印地文",
    tl: "他加禄文",
    fi: "芬兰文",
    ms: "马来文",
    eu: "巴斯克文",
    kk: "哈萨克文",
    sr: "塞尔维亚文",
    my: "缅甸文",
    el: "希腊文",
    nl: "荷兰文",
    ja: "日文",
    uz: "乌兹别克文",
    eo: "世界语",
    bn: "孟加拉文",
    lt: "立陶宛文",
    ka: "格鲁吉亚文",
    da: "丹麦文",
    ta: "泰米尔文",
    sv: "瑞典文",
    be: "白俄罗斯文",
    cv: "楚瓦什文",
    hr: "克罗地亚文",
    la: "拉丁文",
    ne: "尼泊尔文",
    ur: "乌尔都文",
    gl: "加利西亚文",
    no: "挪威文",
    sq: "阿尔巴尼亚文",
    ga: "爱尔兰文",
    te: "泰卢固文",
    jv: "爪哇文",
    sl: "斯洛文尼亚文",
    et: "爱沙尼亚文",
    az: "阿塞拜疆文",
    sk: "斯洛伐克文",
    af: "南非荷兰文",
    lv: "拉脱维亚文"
}, Comick.reversed_language_dict = {
    英文: "en",
    巴西葡萄牙文: "pt-br",
    拉丁美洲西班牙文: "es-419",
    俄文: "ru",
    越南文: "vi",
    法文: "fr",
    波兰文: "pl",
    印度尼西亚文: "id",
    土耳其文: "tr",
    意大利文: "it",
    西班牙文: "es",
    乌克兰文: "uk",
    阿拉伯文: "ar",
    香港繁体中文: "zh-hk",
    匈牙利文: "hu",
    中文: "zh",
    德文: "de",
    韩文: "ko",
    泰文: "th",
    保加利亚文: "bg",
    加泰罗尼亚文: "ca",
    波斯文: "fa",
    罗马尼亚文: "ro",
    捷克文: "cs",
    蒙古文: "mn",
    希伯来文: "he",
    葡萄牙文: "pt",
    印地文: "hi",
    "菲律宾文/他加禄文": "tl",
    芬兰文: "fi",
    马来文: "ms",
    巴斯克文: "eu",
    哈萨克文: "kk",
    塞尔维亚文: "sr",
    缅甸文: "my",
    希腊文: "el",
    荷兰文: "nl",
    日文: "ja",
    乌兹别克文: "uz",
    世界语: "eo",
    孟加拉文: "bn",
    立陶宛文: "lt",
    格鲁吉亚文: "ka",
    丹麦文: "da",
    泰米尔文: "ta",
    瑞典文: "sv",
    白俄罗斯文: "be",
    楚瓦什文: "cv",
    克罗地亚文: "hr",
    拉丁文: "la",
    尼泊尔文: "ne",
    乌尔都文: "ur",
    加利西亚文: "gl",
    挪威文: "no",
    阿尔巴尼亚文: "sq",
    爱尔兰文: "ga",
    泰卢固文: "te",
    爪哇文: "jv",
    斯洛文尼亚文: "sl",
    爱沙尼亚文: "et",
    阿塞拜疆文: "az",
    斯洛伐克文: "sk",
    南非荷兰文: "af",
    拉脱维亚文: "lv"
};

"use strict";
