class MH1234 extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "漫画1234", this.key = "mh1234", this.version = "1.0.0",
        this.minAppVersion = "1.4.0", this.url = resolvePluginUpdateUrl("mh1234.js"), this.settings = {
            domains: {
                title: "域名",
                type: "input",
                default: "amh1234.com"
            }
        }, this.explore = [ {
            title: "漫画1234",
            type: "singlePageWithMultiPart",
            load: async () => {
                const e = {}, t = await Network.get(this.baseUrl);
                if (200 !== t.status) throw `Invalid status code: ${t.status}`;
                const r = new HtmlDocument(t.body).querySelectorAll("div.imgBox");
                for (let t of r) {
                    const r = t.querySelector(".Title").text, o = [];
                    for (let e of t.querySelectorAll("li.list-comic")) e.querySelectorAll("a")[1], o.push(new Comic({
                        id: e.attributes["data-key"],
                        title: e.querySelector("a.txtA").text,
                        cover: toWebSourceAbsoluteUrl(e.querySelector("img").attributes.src, this.baseUrl)
                    }));
                    e[r] = o;
                }
                return e;
            }
        } ], this.category = {
            title: "漫画1234",
            parts: [ {
                name: "题材",
                type: "fixed",
                categories: [ "全部", "少年热血", "武侠格斗", "科幻魔幻", "竞技体育", "爆笑喜剧", "侦探推理", "恐怖灵异", "耽美人生", "少女爱情", "恋爱生活", "生活漫画", "战争漫画", "故事漫画", "其他漫画", "爱情", "唯美", "武侠", "玄幻", "后宫", "治愈", "励志", "古风", "校园", "虐心", "魔幻", "冒险", "欢乐向", "节操", "悬疑", "历史", "职场", "神鬼", "明星", "穿越", "百合", "西方魔幻", "纯爱", "音乐舞蹈", "轻小说", "侦探", "伪娘", "仙侠", "四格", "剧情", "萌系", "东方", "性转换", "宅系", "美食", "脑洞", "惊险", "爆笑", "都市", "蔷薇", "恋爱", "格斗", "科幻", "魔法", "奇幻", "热血", "其他", "搞笑", "生活", "恐怖", "架空", "竞技", "战争", "搞笑喜剧", "青春", "浪漫", "爽流", "神话", "轻松", "日常", "家庭", "婚姻", "动作", "战斗", "异能", "内涵", "同人", "惊奇", "正剧", "推理", "宠物", "温馨", "异世界", "颜艺", "惊悚", "舰娘", "机战", "彩虹", "耽美", "轻松搞笑", "修真恋爱架空", "复仇", "霸总", "段子", "逆袭", "烧脑", "娱乐圈", "纠结", "感动", "豪门", "体育", "机甲", "末世", "灵异", "僵尸", "宫廷", "权谋", "未来", "科技", "商战", "乡村", "震撼", "游戏", "重口味", "血腥", "逗比", "丧尸", "神魔", "修真", "社会", "召唤兽", "装逼", "新作", "漫改", "真人", "运动", "高智商", "悬疑推理", "机智", "史诗", "萝莉", "宫斗", "御姐", "恶搞", "精品", "日更", "小说改编", "防疫", "吸血", "暗黑", "总裁", "重生", "大女主", "系统", "神仙", "末日", "怪物", "妖怪", "修仙", "宅斗", "神豪", "高甜", "电竞", "豪快", "猎奇", "多世界", "性转", "少女", "改编", "女生", "乙女", "男生", "兄弟情", "智斗", "少男", "连载", "奇幻冒险", "古风穿越", "浪漫爱情", "古装", "幽默搞笑", "偶像", "小僵尸", "BL", "少年", "橘味", "情感", "经典", "腹黑", "都市大女主", "致郁", "美少女", "少儿", "暖萌", "长条", "限制级", "知音漫客", "氪金", "独家", "亲情", "现代", "武侠仙侠", "西幻", "超级英雄", "女神", "幻想", "欧风", "养成", "动作冒险", "GL", "橘调", "悬疑灵异", "古代宫廷", "欧式宫廷", "游戏竞技", "橘系", "奇幻爱情", "架空世界", "ゆり", "福瑞", "秀吉", "现代言情", "古代言情", "豪门总裁", "现言萌宝", "玄幻言情", "虐渣", "团宠", "古言萌宝", "现言甜宠", "古言脑洞", "AA", "金手指", "玄幻脑洞", "都市脑洞", "甜宠", "伦理", "生存", "TL", "悬疑脑洞", "黑暗", "独特", "成长", "幻想言情", "直播", "游戏体育", "现言脑洞", "音乐", "双男主", "迪化", "LGBTQ+", "正能量", "军事", "ABO", "悬疑恐怖", "玄幻科幻", "投稿", "种田", "经营", "反套路", "无节操", "强强", "克苏鲁", "无敌流", "冒险热血", "畅销", "大人系", "宅向", "萌娃", "宠兽", "异形", "撒糖", "诡异", "言情", "西方", "滑稽搞笑", "同居", "人外", "白切黑", "并肩作战", "救赎", "戏精", "美强惨", "非人类", "原创", "黑白漫", "无限流", "升级", "爽", "轻橘", "女帝", "偏执", "自由", "星际", "可盐可甜", "反差萌", "聪颖", "智商在线", "倔强", "狼人", "欢喜冤家", "吸血鬼", "萌宠", "学校", "台湾作品", "彩色", "武术", "短篇", "契约", "魔王", "无敌", "美女", "暧昧", "网游", "宅男", "追逐梦想", "冒险奇幻", "疯批", "中二", "召唤", "法宝", "钓系", "鬼怪", "占有欲", "阳光", "元气", "强制爱", "黑道", "马甲", "阴郁", "忧郁", "哲理", "病娇", "喜剧", "江湖恩怨", "相爱相杀", "萌", "SM", "精选", "生子", "年下", "18+限制", "日久生情", "梦想", "多攻", "竹马", "骨科", "gnbq" ],
                itemType: "category",
                categoryParams: [ "", "shaonianrexue", "wuxiagedou", "kehuanmohuan", "jingjitiyu", "baoxiaoxiju", "zhentantuili", "kongbulingyi", "danmeirensheng", "shaonvaiqing", "lianaishenghuo", "shenghuomanhua", "zhanzhengmanhua", "gushimanhua", "qitamanhua", "aiqing", "weimei", "wuxia", "xuanhuan", "hougong", "zhiyu", "lizhi", "gufeng", "xiaoyuan", "nuexin", "mohuan", "maoxian", "huanlexiang", "jiecao", "xuanyi", "lishi", "zhichang", "shengui", "mingxing", "chuanyue", "baihe", "xifangmohuan", "chunai", "yinyuewudao", "qingxiaoshuo", "zhentan", "weiniang", "xianxia", "sige", "juqing", "mengxi", "dongfang", "xingzhuanhuan", "zhaixi", "meishi", "naodong", "jingxian", "baoxiao", "dushi", "qiangwei", "lianai", "gedou", "kehuan", "mofa", "qihuan", "rexue", "qita", "gaoxiao", "shenghuo", "kongbu", "jiakong", "jingji", "zhanzheng", "gaoxiaoxiju", "qingchun", "langman", "shuangliu", "shenhua", "qingsong", "richang", "jiating", "hunyin", "dongzuo", "zhandou", "yineng", "neihan", "tongren", "jingqi", "zhengju", "tuili", "chongwu", "wenxin", "yishijie", "yanyi", "jingsong", "jianniang", "jizhan", "caihong", "danmei", "qingsonggaoxiao", "xiuzhenlianaijiakong", "fuchou", "bazong", "duanzi", "nixi", "shaonao", "yulequan", "jiujie", "gandong", "haomen", "tiyu", "jijia", "moshi", "lingyi", "jiangshi", "gongting", "quanmou", "weilai", "keji", "shangzhan", "xiangcun", "zhenhan", "youxi", "zhongkouwei", "xuexing", "doubi", "sangshi", "shenmo", "xiuzhen", "shehui", "zhaohuanshou", "zhuangbi", "xinzuo", "mangai", "zhenren", "yundong", "gaozhishang", "xuanyituili", "jizhi", "shishi", "luoli", "gongdou", "yujie", "egao", "jingpin", "rigeng", "xiaoshuogaibian", "fangyi", "xixie", "anhei", "zongcai", "zhongsheng", "danvzhu", "xitong", "shenxian", "mori", "guaiwu", "yaoguai", "xiuxian", "zhaidou", "shenhao", "gaotian", "dianjing", "haokuai", "lieqi", "duoshijie", "xingzhuan", "shaonv", "gaibian", "nvsheng", "yinv", "nansheng", "xiongdiqing", "zhidou", "shaonan", "lianzai", "qihuanmaoxian", "gufengchuanyue", "langmanaiqing", "guzhuang", "youmogaoxiao", "ouxiang", "xiaojiangshi", "BL", "shaonian", "juwei", "qinggan", "jingdian", "fuhei", "dushidanvzhu", "zhiyu2", "meishaonv", "shaoer", "nuanmeng", "changtiao", "xianzhiji", "zhiyinmanke", "kejin", "dujia", "qinqing", "xiandai", "wuxiaxianxia", "xihuan", "chaojiyingxiong", "nvshen", "huanxiang", "oufeng", "yangcheng", "dongzuomaoxian", "GL", "judiao", "xuanyilingyi", "gudaigongting", "oushigongting", "youxijingji", "juxi", "qihuanaiqing", "jiakongshijie", "unknown", "furui", "xiuji", "xiandaiyanqing", "gudaiyanqing", "haomenzongcai", "xianyanmengbao", "xuanhuanyanqing", "nuezha", "tuanchong", "guyanmengbao", "xianyantianchong", "guyannaodong", "AA", "jinshouzhi", "xuanhuannaodong", "dushinaodong", "tianchong", "lunli", "shengcun", "TL", "xuanyinaodong", "heian", "dute", "chengzhang", "huanxiangyanqing", "zhibo", "youxitiyu", "xianyannaodong", "yinyue", "shuangnanzhu", "dihua", "LGBTQ", "zhengnengliang", "junshi", "ABO", "xuanyikongbu", "xuanhuankehuan", "tougao", "zhongtian", "jingying", "fantaolu", "wujiecao", "qiangqiang", "kesulu", "wudiliu", "maoxianrexue", "changxiao", "darenxi", "zhaixiang", "mengwa", "chongshou", "yixing", "satang", "guiyi", "yanqing", "xifang", "huajigaoxiao", "tongju", "renwai", "baiqiehei", "bingjianzuozhan", "jiushu", "xijing", "meiqiangcan", "feirenlei", "yuanchuang", "heibaiman", "wuxianliu", "shengji", "shuang", "qingju", "nvdi", "pianzhi", "ziyou", "xingji", "keyanketian", "fanchameng", "congying", "zhishangzaixian", "juejiang", "langren", "huanxiyuanjia", "xixiegui", "mengchong", "xuexiao", "taiwanzuopin", "caise", "wushu", "duanpian", "qiyue", "mowang", "wudi", "meinv", "aimei", "wangyou", "zhainan", "zhuizhumengxiang", "maoxianqihuan", "fengpi", "zhonger", "zhaohuan", "fabao", "diaoxi", "guiguai", "zhanyouyu", "yangguang", "yuanqi", "qiangzhiai", "heidao", "majia", "yinyu", "youyu", "zheli", "bingjiao", "xiju", "jianghuenyuan", "xiangaixiangsha", "meng", "SM", "jingxuan", "shengzi", "nianxia", "18xianzhi", "rijiushengqing", "mengxiang", "duogong", "zhuma", "guke", "gnbq" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, r, o) => {
                if (t.endsWith(".html")) {
                    const e = await Network.get(buildWebSourceUrl(this.baseUrl, t));
                    if (200 !== e.status) throw `Invalid status code: ${e.status}`;
                    return this.parseComics(e.body, !0);
                }
                {
                    const e = buildWebSourceUrl(this.baseUrl, MH1234_ROUTE_PATHS.LIST, buildMh1234FilterQuery(t, r, o)), a = await Network.get(e);
                    if (console.warn(e), 200 !== a.status) throw `Invalid status code: ${a.status}`;
                    const i = new HtmlDocument(a.body);
                    return {
                        comics: this.parseList(i),
                        maxPage: parseInt(i.querySelector("#total-page").attributes.value)
                    };
                }
            },
            optionLoader: async (e, t) => t.endsWith(".html") ? [] : [ {
                options: [ "-全部", "ertong-儿童漫画", "shaonian-少年漫画", "shaonv-少女漫画", "qingnian-青年漫画", "bailingmanhua-白领漫画", "tongrenmanhua-同人漫画" ]
            }, {
                options: [ "-全部", "wanjie-已完结", "lianzai-连载中" ]
            }, {
                options: [ "-全部", "rhmh-日韩", "dlmh-大陆", "gtmh-港台", "taiwan-台湾", "ommh-欧美", "hanguo-韩国", "qtmg-其他" ]
            }, {
                options: [ "update-更新", "post-发布", "click-点击" ]
            } ]
        }, this.search = {
            load: async (e, t, r) => {
                const o = buildWebSourceUrl(this.baseUrl, MH1234_ROUTE_PATHS.SEARCH, {
                    keywords: e,
                    sort: Array.isArray(t) ? t[0] : void 0,
                    page: r
                }), a = await Network.get(o);
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                return this.parseComics(a.body);
            },
            optionList: [ {
                options: [ "update-更新", "post-发布", "click-点击" ],
                label: "排序"
            } ],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async e => {
                var t, r;
                const o = await Network.get(buildWebSourceUrl(this.baseUrl, buildMh1234ComicPath(e)));
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                const a = new HtmlDocument(o.body), i = a.querySelector(".BarTit").text, n = toWebSourceAbsoluteUrl(a.querySelector(".pic").querySelector("img").attributes.src, this.baseUrl), l = null == (t = a.querySelector("#full-des")) ? void 0 : t.text, u = a.querySelectorAll(".txtItme"), s = [];
                for (let e of a.querySelector(".sub_r").querySelectorAll("a")) {
                    const t = e.text;
                    t.length > 0 && s.push(t);
                }
                const c = {}, d = null == (r = a.querySelector(".chapter-warp")) ? void 0 : r.querySelectorAll("li");
                if (d) for (let e of d) c[e.querySelector("a").attributes.href.replace("/comic/", "").replace(".html", "").split("/").join("_")] = e.querySelector("span").text;
                return {
                    title: i,
                    cover: n,
                    description: l,
                    tags: {
                        作者: [ u[0].text.replaceAll("\n", "").replaceAll("\r", "").trim() ],
                        更新: [ u[3].querySelector(".date").text ],
                        标签: s.slice(0, -1)
                    },
                    chapters: c,
                    recommend: this.parseList(a)
                };
            },
            loadEp: async (e, t) => {
                const r = t.split("_"), o = await Network.get(buildWebSourceUrl(this.baseUrl, buildMh1234EpisodePath(r[0], r[1])));
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                const a = o.body, i = a.search("var chapterImages = ") + 22, n = a.search(";var chapterPath = ") - 2, l = a.search(";var chapterPrice") - 1, u = a.substring(i, n).split('","'), s = a.substring(n + 22, l);
                for (let e = 0; e < u.length; e++) u[e] = buildWebSourceUrl(MH1234_IMAGE_BASE_URL, joinWebSourcePath("/", [ s, normalizeMh1234EpisodeImagePath(u[e]) ]));
                return {
                    images: u
                };
            },
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return normalizeWebSourceBaseUrl(`https://b.${this.loadSetting("domains")}`);
    }
    parseComics(e, t = !1) {
        const r = new HtmlDocument(e), o = [];
        for (let e of r.querySelectorAll(".itemBox")) o.push(new Comic({
            id: e.attributes["data-key"],
            title: e.querySelector(".title").text,
            cover: toWebSourceAbsoluteUrl(e.querySelector("img").attributes.src, this.baseUrl)
        }));
        return {
            comics: o,
            maxPage: t ? 1 : parseInt(r.querySelector("#total-page").attributes.value)
        };
    }
    parseList(e) {
        const t = [];
        for (let r of e.querySelectorAll(".list-comic")) t.push(new Comic({
            id: r.attributes["data-key"],
            title: r.querySelector(".txtA").text,
            cover: toWebSourceAbsoluteUrl(r.querySelector("img").attributes.src, this.baseUrl)
        }));
        return t;
    }
}

function buildOffsetByPage(e, t) {
    return ((Number.isFinite(Number(e)) ? Math.max(1, Number(e)) : 1) - 1) * (Number.isFinite(Number(t)) ? Math.max(1, Number(t)) : 1);
}

function normalizeStarOption(e) {
    return String(null == e ? "" : e).replace("*", "-");
}

function normalizeStarOptions(e) {
    return Array.isArray(e) ? e.map(e => normalizeStarOption(e)) : [];
}

function stripSelfHostedTrailingSlash(e) {
    return String(e || "").replace(/\/+$/, "");
}

function normalizeSelfHostedPathRoot(e, t) {
    const r = String(e || t || "").trim();
    return r ? `/${r.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
}

function normalizeSelfHostedPathSegment(e) {
    return String(null == e ? "" : e).replace(/^\/+|\/+$/g, "");
}

function joinSelfHostedPath(e, t) {
    const r = normalizeSelfHostedPathRoot(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = normalizeSelfHostedPathSegment(e);
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createSelfHostedRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedPathRoot(t.apiRoot, "/api"), o = normalizeSelfHostedPathRoot(t.archivesRoot, `${r}/archives`), a = normalizeSelfHostedPathRoot(t.categoriesRoot, `${r}/categories`), i = normalizeSelfHostedPathRoot(t.searchPath, `${r}/search`);
    return {
        apiRoot: r,
        archivesRoot: o,
        categoriesRoot: a,
        searchPath: i,
        categoriesPath: () => a,
        categoryArchivePath: (e, t) => joinSelfHostedPath(a, [ e, t ]),
        archivePath: e => joinSelfHostedPath(o, [ e ]),
        archiveMetadataPath: e => joinSelfHostedPath(o, [ e, "metadata" ]),
        archiveThumbnailPath: e => joinSelfHostedPath(o, [ e, "thumbnail" ]),
        archiveCategoriesPath: e => joinSelfHostedPath(o, [ e, "categories" ]),
        archiveFilesPath: e => joinSelfHostedPath(o, [ e, "files" ])
    };
}

function normalizeWebSourceBaseUrl(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = "string" == typeof r.defaultScheme ? r.defaultScheme.trim() : "";
    let a = String(e || "").trim();
    return a ? (o && !/^https?:\/\//i.test(a) && (a = `${o.replace(/:$/, "")}://${a}`),
    a.replace(/\/+$/, "")) : "";
}

function normalizeWebSourcePath(e, t) {
    const r = String(null == e ? t || "" : e).trim();
    return r ? /^https?:\/\//i.test(r) || r.startsWith("//") || r.startsWith("/") ? r : `/${r}` : "";
}

function joinWebSourcePath(e, t) {
    const r = normalizeWebSourcePath(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (a = `${a}/${t}`);
    }
    return a;
}

function buildWebSourceQuery(e) {
    if (!e || "object" != typeof e) return "";
    const t = [];
    for (const r of Object.keys(e)) {
        const o = e[r];
        if (null != o && "" !== o) if (Array.isArray(o)) for (const e of o) null != e && "" !== e && t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(o))}`);
    }
    return t.join("&");
}

function buildWebSourceUrl(e, t, r) {
    const o = normalizeWebSourceBaseUrl(e || ""), a = normalizeWebSourcePath(t, "");
    let i = a;
    /^https?:\/\//i.test(a) || a.startsWith("//") || (i = a ? `${o}${a.startsWith("/") ? "" : "/"}${a}` : o);
    const n = buildWebSourceQuery(r);
    return n ? `${i}${i.includes("?") ? "&" : "?"}${n}` : i;
}

function toWebSourceAbsoluteUrl(e, t) {
    const r = String(e || "").trim();
    return r ? /^https?:\/\//i.test(r) ? r : r.startsWith("//") ? `${normalizeWebSourceBaseUrl(t || "", {
        defaultScheme: "https"
    }).startsWith("http://") ? "http:" : "https:"}${r}` : buildWebSourceUrl(t, r) : "";
}

function replaceWebSourceBaseUrl(e, t, r) {
    const o = String(e || "").trim(), a = normalizeWebSourceBaseUrl(t || ""), i = normalizeWebSourceBaseUrl(r || "");
    return o && a && i ? o === a ? i : o.startsWith(`${a}/`) ? `${i}${o.slice(a.length)}` : o : o;
}

function ensureWebSourceTrailingSlash(e) {
    const t = String(e || "").trim();
    return t ? t.endsWith("/") ? t : `${t}/` : t;
}

function normalizeSelfHostedBaseUrl(e) {
    const t = String(e || "").trim();
    return t ? t.replace(/\/+$/, "") : "";
}

function normalizeSelfHostedRoutePath(e, t) {
    const r = String(null == e ? t || "" : e).trim();
    if (!r) return "";
    const o = r.replace(/\/+$/, "");
    return o.startsWith("/") ? o : `/${o}`;
}

function joinSelfHostedRoutePath(e, t) {
    const r = normalizeSelfHostedRoutePath(e, "/"), o = Array.isArray(t) ? t : [];
    let a = r;
    for (const e of o) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createKomgaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), o = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), a = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), i = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), n = joinSelfHostedRoutePath(r, [ "series" ]), l = joinSelfHostedRoutePath(r, [ "books" ]), u = joinSelfHostedRoutePath(r, [ "collections" ]);
    return {
        apiV1Root: r,
        apiV2Root: o,
        seriesWebRoot: a,
        booksWebRoot: i,
        librariesPath: () => joinSelfHostedRoutePath(r, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(r, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(r, [ "languages" ]),
        collectionsPath: () => u,
        genresPath: () => joinSelfHostedRoutePath(r, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(o, [ "users", "me" ]),
        seriesPath: () => n,
        latestSeriesPath: () => joinSelfHostedRoutePath(n, [ "latest" ]),
        updatedSeriesPath: () => joinSelfHostedRoutePath(n, [ "updated" ]),
        collectionSeriesPath: e => joinSelfHostedRoutePath(u, [ e, "series" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        seriesBooksPath: e => joinSelfHostedRoutePath(n, [ e, "books" ]),
        seriesThumbnailPath: e => joinSelfHostedRoutePath(n, [ e, "thumbnail" ]),
        seriesWebPath: e => joinSelfHostedRoutePath(a, [ e ]),
        bookDetailsPath: e => joinSelfHostedRoutePath(l, [ e ]),
        bookThumbnailPath: e => joinSelfHostedRoutePath(l, [ e, "thumbnail" ]),
        bookPagesPath: e => joinSelfHostedRoutePath(l, [ e, "pages" ]),
        bookPageImagePath: (e, t) => joinSelfHostedRoutePath(l, [ e, "pages", t ]),
        bookWebPath: e => joinSelfHostedRoutePath(i, [ e ])
    };
}

function createKavitaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${r}/Library`), a = normalizeSelfHostedRoutePath(t.metadataRoot, `${r}/Metadata`), i = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${r}/metadata`), n = normalizeSelfHostedRoutePath(t.accountRoot, `${r}/Account`), l = normalizeSelfHostedRoutePath(t.seriesRoot, `${r}/Series`), u = normalizeSelfHostedRoutePath(t.imageRoot, `${r}/Image`), s = normalizeSelfHostedRoutePath(t.readerRoot, `${r}/Reader`), c = normalizeSelfHostedRoutePath(t.searchRoot, `${r}/Search`);
    return {
        apiRoot: r,
        libraryRoot: o,
        metadataRoot: a,
        metadataLegacyRoot: i,
        accountRoot: n,
        seriesRoot: l,
        imageRoot: u,
        readerRoot: s,
        searchRoot: c,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(i, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(n, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(l, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(l, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(l, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(l, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(u, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(l, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(s, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(c, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = "string" == typeof t ? t : "";
    let i = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : a);
    if (!i) return i;
    const n = "string" == typeof o.defaultScheme ? o.defaultScheme.trim() : "";
    return n && !/^https?:\/\//i.test(i) && (i = `${n.replace(/:$/, "")}://${i}`), normalizeSelfHostedBaseUrl(i);
}

function buildSelfHostedQuery(e) {
    if (!e) return "";
    const t = [];
    for (const r of Object.keys(e)) {
        const o = e[r];
        if (null != o) if (Array.isArray(o)) for (const e of o) null != e && t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(o))}`);
    }
    return t.join("&");
}

function buildSelfHostedUrl(e, t, r) {
    let o = t;
    /^https?:\/\//i.test(t) || (o = `${normalizeSelfHostedBaseUrl(e || "")}${String(t).startsWith("/") ? "" : "/"}${t}`);
    const a = buildSelfHostedQuery(r);
    return a ? `${o}?${a}` : o;
}

function buildSelfHostedUrlFromSource(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("buildSelfHostedUrlFromSource requires plugin source");
    return buildSelfHostedUrl(e.baseUrl, t, r);
}

function buildSelfHostedQueryFromSource(e) {
    return buildSelfHostedQuery(e);
}

function readSelfHostedOffset(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("readSelfHostedOffset requires plugin source");
    return Number(r || 1) <= 1 ? (e.saveData(t, 0), 0) : Number(e.loadData(t) || 0);
}

function updateSelfHostedOffset(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("updateSelfHostedOffset requires plugin source");
    const o = Number(e.loadData(t) || 0);
    e.saveData(t, o + (r || 0));
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    readSelfHostedOffset,
    updateSelfHostedOffset
});

const pluginSourcePagingApi = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions
}, pluginSourceWebApi = {
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash
}, pluginSourceSelfHostedPathApi = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers
}, pluginSourceSelfHostedRouteApi = {
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    readSelfHostedOffset,
    updateSelfHostedOffset
}, pluginSourceContractApi = {
    ...pluginSourcePagingApi,
    ...pluginSourceWebApi,
    ...pluginSourceSelfHostedPathApi,
    ...pluginSourceSelfHostedRouteApi
};

function resolveMappedCategoryTagAction(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = null == o.namespace ? "标签" : String(o.namespace);
    if (String(e) !== a) throw o.unsupportedMessage || "Unsupported tag namespace";
    const i = o.mapping && "object" == typeof o.mapping ? o.mapping : {}, n = String(null == t ? "" : t), l = i[n], u = "function" == typeof o.keywordFormatter ? o.keywordFormatter(n, l, e) : n, s = "function" == typeof o.paramFormatter ? o.paramFormatter(n, l, e) : String(l);
    return {
        action: o.action || "category",
        keyword: u,
        param: s
    };
}

function createMappedCategoryTagActionResolver(e) {
    return (t, r) => resolveMappedCategoryTagAction(t, r, e);
}

function runtimeGet(e, t) {
    return Network.get(e, t);
}

async function getRuntimeJson(e, t, r) {
    const o = await runtimeGet(e, t);
    return assertRuntimeStatus(o, 200, r || e), parseRuntimeJsonBody(o, r || e);
}

async function getRuntimeDocument(e, t, r) {
    const o = await runtimeGet(e, t);
    return assertRuntimeStatus(o, 200, r || e), new HtmlDocument(o.body);
}

async function getSelfHostedJson(e, t, r, o) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const a = o && "object" == typeof o && !Array.isArray(o) ? o : {}, i = a.headers || e.headers, n = await Network.get(e.buildUrl(t, r), i);
    return ensureSelfHostedHttpOk(n, a), parseSelfHostedJsonBody(n.body);
}

async function postSelfHostedJson(e, t, r, o, a) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const i = a && "object" == typeof a && !Array.isArray(a) ? a : {}, n = i.headers || e.headers, l = await Network.post(e.buildUrl(t, r), n, o);
    return ensureSelfHostedHttpOk(l, i), {
        body: parseSelfHostedJsonBody(l.body),
        headers: l.headers || {}
    };
}

function defaultManagedDomainKey(e) {
    try {
        return new URL(String(e || "")).hostname || "default";
    } catch (e) {
        return "default";
    }
}

function defaultManagedDispatch(e, t, r, o) {
    return "GET" === e ? Network.get(t, r) : "POST" === e ? Network.post(t, r, o) : Network.sendRequest(e, t, r, o);
}

function defaultManagedRequestError(e, t, r) {
    return e && "function" == typeof e.formatRequestError ? e.formatRequestError(t, r) : `${t}: ${String(r)}`;
}

function defaultManagedResponseError(e, t, r) {
    return e && "function" == typeof e.formatResponseError ? e.formatResponseError(t, r) : `${t}: status=${r && r.status}`;
}

function normalizeManagedRequestHooks(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : {};
}

function ManagedRequestClient(e, t) {
    if (!e || "object" != typeof e) throw new Error("ManagedRequestClient requires plugin source");
    if (!e.requestState || "object" != typeof e.requestState) throw new Error("ManagedRequestClient requires source.requestState");
    this.source = e, this.hooks = normalizeManagedRequestHooks(t);
}

function createManagedRequestClient(e, t) {
    return new ManagedRequestClient(e, t);
}

function parseRuntimeJsonBody(e, t) {
    try {
        return JSON.parse(e.body);
    } catch (e) {
        throw "Invalid JSON response" + (t ? ` (${t})` : "");
    }
}

function ensureSelfHostedHttpOk(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = r.unauthorizedMessage || "Login expired", a = r.requestFailedMessage || "请求失败";
    if (!e) throw a;
    if (401 === e.status || 403 === e.status) throw o;
    if (e.status < 200 || e.status >= 300) throw `${a}: ${e.status}`;
}

function parseSelfHostedJsonBody(e) {
    return e ? JSON.parse(e) : null;
}

function hasNonWhitespaceText(e) {
    const t = String(e || "");
    for (let e = 0; e < t.length; e += 1) {
        const r = t.charCodeAt(e);
        if (32 !== r && 9 !== r && 10 !== r && 13 !== r) return !0;
    }
    return !1;
}

function defaultRequestKey(e, t, r, o) {
    return o ? null : `${e}:${t}`;
}

function createDomainQueue(e, t, r) {
    const o = (e.queues.get(t) || Promise.resolve()).then(r, r), a = o.then(() => {}, () => {});
    return e.queues.set(t, a), a.finally(() => {
        e.queues.get(t) === a && e.queues.delete(t);
    }), o;
}

function markCooldown(e, t, r) {
    e.cooldownUntil.set(t, Date.now() + r);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    buildOffsetByPage,
    normalizeStarOption,
    normalizeStarOptions,
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource,
    normalizeWebSourceBaseUrl,
    normalizeWebSourcePath,
    joinWebSourcePath,
    buildWebSourceQuery,
    buildWebSourceUrl,
    toWebSourceAbsoluteUrl,
    replaceWebSourceBaseUrl,
    ensureWebSourceTrailingSlash,
    normalizeSelfHostedBaseUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    readSelfHostedOffset,
    updateSelfHostedOffset,
    pluginSourcePagingApi,
    pluginSourceWebApi,
    pluginSourceSelfHostedPathApi,
    pluginSourceSelfHostedRouteApi,
    pluginSourceContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver
}), ManagedRequestClient.prototype.get = function(e, t, r) {
    return this.send("GET", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.post = function(e, t, r, o) {
    return this.send("POST", e, t || {}, null == r ? null : r, o || {});
}, ManagedRequestClient.prototype.head = function(e, t, r) {
    return this.send("HEAD", e, t || {}, null, r || {});
}, ManagedRequestClient.prototype.send = async function(e, t, r, o, a) {
    const i = this.source, n = a && "object" == typeof a && !Array.isArray(a) ? a : {}, l = null == n.mutation ? "GET" !== e : !0 === n.mutation, u = n.requestKey || defaultRequestKey(e, t, o, l), s = "function" == typeof this.hooks.domainKeyResolver ? this.hooks.domainKeyResolver : defaultManagedDomainKey, c = {
        action: n.action || `${e} ${t}`,
        requestKey: u,
        domainKey: n.domainKey || s(t, e, o, n, i, this),
        expectedStatus: null == n.expectedStatus ? 200 : n.expectedStatus,
        maxRetries: null == n.maxRetries ? "GET" === e ? 1 : 0 : n.maxRetries,
        cooldownMs: null == n.cooldownMs ? 6e4 : n.cooldownMs,
        classifyBody: null == n.classifyBody || n.classifyBody,
        mutation: l,
        allowDedup: null == n.allowDedup ? !l : n.allowDedup
    }, d = i.requestState.cooldownUntil.get(c.domainKey);
    if (d && d > Date.now()) throw `${c.action} blocked: temporary cooldown in effect`;
    const p = this._resolveHeaders(e, t, r || {}, c), h = c.requestKey;
    if (c.allowDedup && h && i.requestState.inflight.has(h)) return i.requestState.inflight.get(h);
    const g = createDomainQueue(i.requestState, c.domainKey, () => this._sendWithRetry(e, t, p, o, c));
    c.allowDedup && h && i.requestState.inflight.set(h, g);
    try {
        return await g;
    } finally {
        c.allowDedup && h && i.requestState.inflight.delete(h);
    }
}, ManagedRequestClient.prototype._resolveHeaders = function(e, t, r, o) {
    return "function" == typeof this.hooks.buildHeaders ? this.hooks.buildHeaders(e, t, r, o, this.source, this) : this.source && "function" == typeof this.source.buildRequestHeaders ? this.source.buildRequestHeaders(e, t, r || {}, o || {}) : r || {};
}, ManagedRequestClient.prototype._sendWithRetry = async function(e, t, r, o, a) {
    let i = 0;
    const n = Math.max(0, a.maxRetries) + 1;
    for (;i < n; ) {
        let l;
        i += 1;
        try {
            l = await this._dispatch(e, t, r, o, a);
        } catch (e) {
            if (i >= n) throw defaultManagedRequestError(this.source, a.action, e);
            continue;
        }
        if (this._shouldCooldown(l, a)) throw this._markCooldown(a.domainKey, a.cooldownMs),
        defaultManagedResponseError(this.source, a.action, l);
        if (l.status === a.expectedStatus) return l;
        if (i >= n || a.mutation) throw defaultManagedResponseError(this.source, a.action, l);
    }
    throw `${a.action} failed after retries`;
}, ManagedRequestClient.prototype._dispatch = function(e, t, r, o, a) {
    return "function" == typeof this.hooks.dispatch ? this.hooks.dispatch(e, t, r, o, a, this.source, this) : defaultManagedDispatch(e, t, r, o);
}, ManagedRequestClient.prototype._shouldCooldown = function(e, t) {
    if (403 === e.status || 429 === e.status) return !0;
    if (!t.classifyBody) return !1;
    const r = String(e && e.body || "");
    return !!hasNonWhitespaceText(r) && ("function" == typeof this.hooks.shouldCooldown ? this.hooks.shouldCooldown(e, t, this.source, this) : !(!this.source || "function" != typeof this.source.isAbuseResponseBody) && this.source.isAbuseResponseBody(r));
}, ManagedRequestClient.prototype._markCooldown = function(e, t) {
    markCooldown(this.source.requestState, e, t);
}, "undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown
});

const httpRequestApi = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient
}, httpResponseApi = {
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody
}, httpCooldownApi = {
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown
}, httpSupportApi = {
    ...httpRequestApi,
    ...httpResponseApi,
    ...httpCooldownApi
};

function createSelfHostedReferenceCacheFeature(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = Number(t.ttlMs || 3e5), o = String(t.metaTimestampKey || ""), a = t.resetData && "object" == typeof t.resetData ? t.resetData : {}, i = "function" == typeof t.hasToken ? t.hasToken : () => !1, n = "function" == typeof t.loadPayload ? t.loadPayload : null, l = "function" == typeof t.savePayload ? t.savePayload : null, u = "function" == typeof t.shouldRethrow ? t.shouldRethrow : null;
    if (!o || !n || !l) throw new Error("Invalid createSelfHostedReferenceCacheFeature options");
    const s = e => {
        for (const [t, r] of Object.entries(a)) Array.isArray(r) ? e.saveData(t, r.slice()) : r && "object" == typeof r ? e.saveData(t, {
            ...r
        }) : e.saveData(t, r);
    };
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("refreshSelfHostedReferenceData requires plugin source");
        if (!i(e)) return void s(e);
        const a = Date.now(), c = Number(e.loadData(o) || 0);
        if (!(!t && c > 0 && a - c < r)) try {
            const t = await n(e);
            await l(e, t, a), e.saveData(o, a);
        } catch (t) {
            if (s(e), u && u(t, e)) throw t;
        }
    };
}

function createSafeInitFeature(e) {
    if ("function" != typeof e) throw new Error("createSafeInitFeature requires refresher");
    return async function(t) {
        try {
            await e(t, !1);
        } catch (e) {}
    };
}

function createStaticCategoryPart(e, t, r, o) {
    return {
        name: e,
        type: "dynamic",
        loader: function() {
            return [ {
                label: t,
                target: {
                    page: "category",
                    attributes: {
                        category: r,
                        param: null == o ? null : o
                    }
                }
            } ];
        }
    };
}

function createStoredCategoryPart(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.partName || ""), o = String(t.storageKey || ""), a = "function" == typeof t.getLabel ? t.getLabel : null, i = "function" == typeof t.getCategory ? t.getCategory : null, n = "function" == typeof t.getParam ? t.getParam : null, l = !0 === t.usePageJumpTarget, u = "function" == typeof t.getSource ? t.getSource : null;
    if (!(r && o && a && i && n)) throw new Error("Invalid createStoredCategoryPart options");
    return {
        name: r,
        type: "dynamic",
        loader: function() {
            const e = u ? u() : this, t = e && "function" == typeof e.loadData ? e.loadData(o) : null;
            if (!Array.isArray(t) || !t.length) return [];
            const r = [];
            for (const e of t) {
                const t = a(e), o = i(e), u = n(e);
                if (!t || !o) continue;
                const s = {
                    category: o,
                    param: null == u ? null : u
                };
                let c;
                c = l && "function" == typeof PageJumpTarget ? new PageJumpTarget({
                    page: "category",
                    attributes: s
                }) : {
                    page: "category",
                    attributes: s
                }, r.push({
                    label: t,
                    target: c
                });
            }
            return r;
        }
    };
}

function createOffsetSearchLoader(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.path || "/api/search"), o = "function" == typeof t.getOffsetKey ? t.getOffsetKey : null, a = "function" == typeof t.buildQuery ? t.buildQuery : null, i = "function" == typeof t.mapComic ? t.mapComic : null, n = "function" == typeof t.onResponse ? t.onResponse : null, l = String(t.statusErrorPrefix || "Invalid status code");
    if (!o || !a || !i) throw new Error("Invalid createOffsetSearchLoader options");
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("runOffsetSearch requires plugin source");
        const u = t && "object" == typeof t && !Array.isArray(t) ? t : {}, s = Number(u.page || 1), c = stripSelfHostedTrailingSlash(e.baseUrl), d = o(u), p = readSelfHostedOffset(e, d, s), h = buildSelfHostedQueryFromSource(a(u, p)), g = h ? `${c}${r}?${h}` : `${c}${r}`, y = await Network.get(g, e.headers);
        if (200 !== y.status) throw `${l}: ${y.status}`;
        const m = parseSelfHostedJsonBody(y.body) || {}, f = Array.isArray(m.data) ? m.data : [], C = f.map(t => i(t, {
            source: e,
            base: c,
            input: u
        })), S = f.length;
        updateSelfHostedOffset(e, d, S);
        const L = "number" == typeof m.recordsFiltered && m.recordsFiltered >= 0 ? m.recordsFiltered : p + S, k = S || 1, b = Math.max(1, Math.ceil(L / k));
        return n && n({
            source: e,
            input: u,
            start: p,
            returned: S,
            data: m,
            list: f,
            comics: C
        }), {
            comics: C,
            maxPage: b,
            data: m
        };
    };
}

function toSelfHostedTagArray(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = "string" == typeof r.delimiter ? r.delimiter : ",", a = "function" == typeof r.normalizeTag ? r.normalizeTag : e => String(e).trim();
    return e ? Array.isArray(e) ? e.map(e => a(e)).filter(Boolean) : String(e).split(o).map(e => a(e)).filter(Boolean) : [];
}

function startsWithSelfHostedTagPrefix(e, t, r) {
    const o = String(e || ""), a = String(t || "");
    return !!a && (!1 === r ? o.toLowerCase().startsWith(a.toLowerCase()) : o.startsWith(a));
}

function extractSelfHostedTagValue(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = "function" == typeof o.transform ? o.transform : e => e, n = toSelfHostedTagArray(e, o), l = String(t || "");
    for (const e of n) if (startsWithSelfHostedTagPrefix(e, l, a)) return i(String(e).slice(l.length).trim(), e);
    return null;
}

function removeSelfHostedTagsByPrefix(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, i = toSelfHostedTagArray(e, o), n = Array.isArray(t) ? t.map(e => String(e)) : [ String(t || "") ];
    return i.filter(e => !n.some(t => startsWithSelfHostedTagPrefix(e, t, a)));
}

function filterSelfHostedDisplayTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = Array.isArray(r.blockedPrefixes) ? r.blockedPrefixes : [], a = !0 === r.caseSensitive, i = !1 !== r.excludeUrlLike, n = "function" == typeof r.extraFilter ? r.extraFilter : null, l = toSelfHostedTagArray(e, r), u = [];
    for (const e of l) o.some(t => startsWithSelfHostedTagPrefix(e, t, a)) || i && String(e).includes("://") || n && !n(e) || u.push(e);
    return u;
}

function parseSelfHostedRatingValueFromTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = Array.isArray(r.starSymbols) ? r.starSymbols : [ "⭐", "★" ], i = extractSelfHostedTagValue(e, o, {
        caseSensitive: !0 === r.caseSensitive
    });
    if (!i) return null;
    if (a.some(e => String(i).includes(e))) {
        let e = 0;
        for (const t of a) {
            const r = String(t).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), o = String(i).match(new RegExp(r, "g"));
            if (o && o.length > 0) {
                e = o.length;
                break;
            }
        }
        return String(e);
    }
    return String(i).trim();
}

function extractSelfHostedUrlEntriesFromTagMap(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.sourceNamespace || "source").toLowerCase(), a = String(r.sourceScheme || "https").replace(/:$/, ""), i = new Set(Array.isArray(r.skipKeys) ? r.skipKeys.map(e => String(e)) : []), n = [];
    if (!e || "object" != typeof e) return n;
    for (const t of Object.keys(e)) {
        if (i.has(t)) continue;
        const r = e[t];
        if (!Array.isArray(r)) continue;
        const l = [];
        for (const e of r) if ("string" == typeof e) if (e.includes("://")) n.push(e); else {
            if (String(t).toLowerCase() === o) {
                let t = e;
                t.startsWith("//") ? t = `${a}:${t}` : /^https?:\/\//i.test(t) || (t = `${a}://${t}`),
                n.push(t);
                continue;
            }
            l.push(e);
        } else l.push(e);
        e[t] = l;
    }
    return n;
}

function buildSelfHostedEmojiRatingTag(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = String(r.symbol || "⭐"), i = Number(e) / 2;
    return `${o}${a.repeat(i)}`;
}

function unwrapCopyLikeComic(e) {
    return e && null != e.comic ? e.comic : e || {};
}

function readCopyLikePath(e, t, r) {
    if (!Array.isArray(t) || 0 === t.length) return e;
    let o = e;
    for (const e of t) {
        if (null == o || "object" != typeof o || !(e in o)) return r;
        o = o[e];
    }
    return o;
}

function parseCopyLikeThemeTags(e) {
    return e && Array.isArray(e.theme) ? e.theme.map(e => e && e.name).filter(e => null != e) : [];
}

function parseCopyLikePrimaryAuthor(e) {
    return e && Array.isArray(e.author) && 0 !== e.author.length && e.author[0] && e.author[0].name ? e.author[0].name : null;
}

function parseCopyLikeAuthorCount(e) {
    return e && Array.isArray(e.author) ? e.author.length : 0;
}

function formatCopyLikeRankingDescription(e, t, r) {
    const o = e && null != e.sort ? e.sort : null;
    if (null == o) return null;
    const a = e.rise_sort || 0;
    return `${o} ${a > 0 ? "▲" : a < 0 ? "▽" : "-"}\n${r > 1 ? `${t} 等${r}位` : t}\n🔥${(Number(e.popular || 0) / 1e4).toFixed(1)}W`;
}

function computeCopyLikeMaxPage(e, t) {
    const r = Number.isFinite(Number(t)) && Number(t) > 0 ? Number(t) : 21, o = Number.isFinite(Number(e)) ? Number(e) : 0;
    return Math.floor((o - o % r) / r) + 1;
}

function createHtmlDocument(e) {
    return new HtmlDocument(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient,
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    unwrapCopyLikeComic,
    readCopyLikePath
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createHtmlDocument
});

const parserCopyLikeApi = {
    unwrapCopyLikeComic,
    readCopyLikePath,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
    createCopyLikeComicParser
}, parserHtmlApi = {
    createHtmlDocument
}, parserSupportApi = {
    ...parserCopyLikeApi,
    ...parserHtmlApi
};

function createCopyLikeComicParser(e) {
    const t = e || {};
    return e => {
        const r = unwrapCopyLikeComic(e), o = parseCopyLikePrimaryAuthor(r), a = parseCopyLikeAuthorCount(r), i = {
            id: r.path_word,
            title: r.name,
            subTitle: o,
            cover: r.cover,
            tags: parseCopyLikeThemeTags(r)
        };
        if (t.includeRankingDescription) {
            const t = formatCopyLikeRankingDescription(e, o, a);
            if (null != t) return i.description = t, i;
        }
        if (t.includeUpdateDescription && (i.description = r.datetime_updated), "function" == typeof t.describe) {
            const n = t.describe({
                sourceComic: e,
                comic: r,
                author: o,
                authorCount: a
            });
            null != n && (i.description = n);
        }
        return i;
    };
}

function normalizeCopyLikeBaseUrl(e, t) {
    const r = String(t || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    let o = String(e || "").trim();
    if (!o) return r;
    o = o.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const a = o.indexOf("/");
    return a >= 0 && (o = o.slice(0, a)), o || r;
}

function buildCopyLikeApiUrl(e, t) {
    return `https://${normalizeCopyLikeBaseUrl(e, t)}`;
}

function buildCopyLikePageUrl(e, t) {
    const r = Number(t) > 1 ? `?page=${t}` : "";
    return `${normalizeCopyLikeBaseUrl(e)}${r}`;
}

function buildCopyLikeTokenHeader(e) {
    return "Token" + (e ? ` ${e}` : "");
}

function buildCopyLikeBearerTokenHeader(e) {
    return e ? `Token ${e}` : "";
}

function buildCopyLikeRequestSigningMeta(e) {
    const t = new Date(null == e ? Date.now() : e);
    return {
        dt: `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")}`,
        ts: String(Math.floor(t.getTime() / 1e3))
    };
}

function buildCopyLikeHmacSignature(e, t) {
    return Convert.hmacString(Convert.decodeBase64(e), Convert.encodeUtf8(String(t || "")), "sha256");
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    unwrapCopyLikeComic,
    readCopyLikePath,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
    createCopyLikeComicParser,
    createHtmlDocument,
    parserCopyLikeApi,
    parserHtmlApi,
    parserSupportApi
});

const COPY_LIKE_ENDPOINT_PATHS = {
    LOGIN: "/api/v3/login",
    RANKS: "/api/v3/ranks",
    COMICS: "/api/v3/comics",
    SEARCH_COMIC: "/api/v3/search/comic",
    HOME_INDEX_COMICS: "/api/v3/h5/homeIndex/comics",
    FAVORITE_COMICS: "/api/v3/member/collect/comics",
    FAVORITE_COMIC_ACTION: "/api/v3/member/collect/comic",
    COMMENTS: "/api/v3/comments",
    COMMENT_ACTION: "/api/v3/member/comment",
    ROASTS: "/api/v3/roasts",
    ROAST_ACTION: "/api/v3/member/roast",
    COMIC_DETAIL_PREFIX: "/api/v3/comic2/",
    COMIC_GROUP_PREFIX: "/api/v3/comic/"
}, COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded;charset=utf-8";

function withCopyLikeFormHeaders(e) {
    return {
        ...e || {},
        "Content-Type": COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE
    };
}

function buildCopyLikeEndpointUrl(e, t) {
    const r = String(e || "").replace(/\/+$/, ""), o = String(t || "");
    return o ? o.startsWith("http://") || o.startsWith("https://") ? o : o.startsWith("/") ? `${r}${o}` : `${r}/${o}` : r;
}

function buildCopyLikeQueryString(e) {
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const e = r[0], o = r[1];
        null != e && null != o && t.push(`${String(e)}=${String(o)}`);
    }
    return t.join("&");
}

function buildCopyLikeUrlWithQuery(e, t, r) {
    const o = buildCopyLikeEndpointUrl(e, t), a = buildCopyLikeQueryString(r);
    return a ? `${o}?${a}` : o;
}

function buildCopyLikeRankingUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, COPY_LIKE_ENDPOINT_PATHS.RANKS, [ [ "free_type", t.freeType ], [ "limit", null == t.limit ? 30 : t.limit ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, null == t.limit ? 30 : t.limit) : t.offset ], [ "_update", null == t.update || t.update ], [ "type", null == t.type ? 1 : t.type ], [ "audience_type", t.audienceType ], [ "region", t.region ], [ "date_type", t.dateType ] ]);
}

function buildCopyLikeComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.COMICS, [ [ "free_type", t.freeType ], [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "ordering", t.ordering ], [ "theme", t.theme ], [ "top", t.top ], [ "author", t.author ], [ "q", t.keyword ], [ "q_type", t.queryType ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function buildCopyLikeSearchUrl(e) {
    const t = e || {}, r = null == t.limit ? 20 : t.limit, o = null == t.keyword ? "" : encodeURIComponent(String(t.keyword));
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC, [ [ "platform", t.platform ], [ "q", o ], [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "free_type", t.freeType ], [ "_update", t.update ], [ "q_type", t.queryType ] ]);
}

function buildCopyLikeHomeIndexComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 20 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.HOME_INDEX_COMICS, [ [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "top", t.top ], [ "ordering", t.ordering ] ]);
}

function buildCopyLikeFavoriteComicsUrl(e) {
    const t = e || {}, r = null == t.limit ? 30 : t.limit;
    return buildCopyLikeUrlWithQuery(t.apiUrl, t.endpointPath || COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMICS, [ [ "limit", r ], [ "offset", null == t.offset ? buildOffsetByPage(t.page, r) : t.offset ], [ "free_type", t.freeType ], [ "ordering", t.ordering ] ]);
}

function buildCopyLikeComicDetailUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${t.id}`, [ [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ], [ "platform", t.platform ] ]);
}

function buildCopyLikeComicQueryUrl(e) {
    const t = e || {};
    return buildCopyLikeEndpointUrl(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_DETAIL_PREFIX}${t.id}/query`);
}

function buildCopyLikeGroupChaptersUrl(e) {
    const t = e || {};
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${t.id}/group/${t.groupPath}/chapters`, [ [ "limit", null == t.limit ? 100 : t.limit ], [ "offset", null == t.offset ? 0 : t.offset ], [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ] ]);
}

function buildCopyLikeChapterUrl(e) {
    const t = e || {}, r = t.chapterEndpoint || "chapter2";
    return buildCopyLikeUrlWithQuery(t.apiUrl, `${COPY_LIKE_ENDPOINT_PATHS.COMIC_GROUP_PREFIX}${t.comicId}/${r}/${t.chapterId}`, [ [ "in_mainland", t.inMainland ], [ "request_id", t.requestId ], [ "platform", t.platform ], [ "_update", t.update ] ]);
}

function normalizeCopyLikeCategoryParam(e, t, r) {
    return null == e ? r : (t || {})[e] || "";
}

function parseCopyLikeDetailAuthors(e) {
    return e && Array.isArray(e.author) ? e.author.map(e => e && e.name).filter(e => null != e) : [];
}

function parseCopyLikeDetailTags(e) {
    return e && Array.isArray(e.theme) ? e.theme.map(e => e && e.name).filter(e => null != e) : [];
}

function buildCopyLikeDetailTagMap(e, t) {
    const r = t || {}, o = r.authorNamespace || "作者", a = r.updateNamespace || "更新", i = r.tagNamespace || "标签", n = r.statusNamespace || "状态", l = e && e.datetime_updated ? e.datetime_updated : "", u = e && e.status && e.status.display ? e.status.display : "";
    return {
        [o]: parseCopyLikeDetailAuthors(e),
        [a]: [ l ],
        [i]: parseCopyLikeDetailTags(e),
        [n]: [ u ]
    };
}

function resolveCopyLikeTagAction(e, t, r) {
    const o = r || {}, a = o.categoryNamespace || "标签", i = o.authorNamespace || "作者", n = o.unsupportedError || "未支持此类Tag检索";
    if (e === a) return {
        action: "category",
        keyword: `${t}`,
        param: null
    };
    if (e === i) return {
        action: "search",
        keyword: `${e}:${t}`,
        param: null
    };
    throw n;
}

function buildCopyLikeHomeSections(e, t, r) {
    const o = {};
    for (const a of t || []) {
        const t = readCopyLikePath(e, a.path, []);
        o[a.title] = Array.isArray(t) ? t.map(r) : [];
    }
    return o;
}

async function loadCopyLikeHomeSectionsModule(e) {
    return buildCopyLikeHomeSections(await getRuntimeJson(`${e.apiUrl}${e.endpoint || "/api/v3/h5/homeIndex"}`, e.headers, e.context || "copy_like home"), e.sections || [], e.parseComic);
}

async function loadCopyLikeListModule(e) {
    const t = await getRuntimeJson(e.requestUrl, e.headers, e.context || "copy_like list"), r = readCopyLikePath(t, e.listPath || [ "results", "list" ], []), o = readCopyLikePath(t, e.totalPath || [ "results", "total" ], 0);
    return {
        comics: Array.isArray(r) ? r.map(e.parseComic) : [],
        maxPage: computeCopyLikeMaxPage(o, e.maxPageDivisor || 21)
    };
}

function parseCopyLikeAuthorKeyword(e) {
    const t = String(e || "");
    return t.startsWith("作者:") ? t.substring(3).trim() : null;
}

async function loadCopyLikeSearchModule(e) {
    const t = parseCopyLikeAuthorKeyword(e.keyword), r = t ? e.resolveAuthorPathWord(t) : null;
    return loadCopyLikeListModule({
        requestUrl: r ? e.buildAuthorRequestUrl({
            pathWord: encodeURIComponent(r),
            page: e.page,
            keyword: e.keyword,
            options: e.options
        }) : e.buildKeywordRequestUrl({
            page: e.page,
            keyword: e.keyword,
            options: e.options
        }),
        headers: e.headers,
        parseComic: e.parseComic,
        context: e.context || "copy_like search",
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeExploreFeature(e) {
    return {
        title: e.title,
        type: "singlePageWithMultiPart",
        load: async () => loadCopyLikeHomeSectionsModule({
            apiUrl: e.getApiUrl(),
            headers: e.getHeaders(),
            parseComic: e.parseComic,
            sections: e.sections,
            endpoint: e.endpoint,
            context: e.context
        })
    };
}

function createCopyLikeCategoryLoadFeature(e) {
    return async (t, r, o, a) => loadCopyLikeListModule({
        requestUrl: e.buildRequestUrl({
            category: t,
            param: r,
            options: o,
            page: a
        }),
        headers: e.getHeaders(),
        parseComic: e.parseComic,
        context: e.context,
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeSearchLoadFeature(e) {
    return async (t, r, o) => loadCopyLikeSearchModule({
        keyword: t,
        options: r,
        page: o,
        headers: e.getHeaders(),
        parseComic: e.parseComic,
        resolveAuthorPathWord: e.resolveAuthorPathWord,
        buildAuthorRequestUrl: e.buildAuthorRequestUrl,
        buildKeywordRequestUrl: e.buildKeywordRequestUrl,
        context: e.context,
        listPath: e.listPath,
        totalPath: e.totalPath,
        maxPageDivisor: e.maxPageDivisor
    });
}

function createCopyLikeCategoryRequestUrlBuilder(e) {
    return ({category: t, param: r, options: o, page: a}) => {
        const i = Array.isArray(o) ? o : [], n = !1 === e.normalizeOptions ? i : normalizeStarOptions(i), l = e.getApiUrl();
        if ("function" == typeof e.isRankingCategory && e.isRankingCategory(t, r)) return buildCopyLikeRankingUrl({
            apiUrl: l,
            page: a,
            limit: null == e.rankingLimit ? 30 : e.rankingLimit,
            freeType: e.rankingFreeType,
            audienceType: null == e.rankingAudienceOptionIndex ? void 0 : i[e.rankingAudienceOptionIndex],
            region: null == e.rankingRegionOptionIndex ? void 0 : i[e.rankingRegionOptionIndex],
            dateType: null == e.rankingDateOptionIndex ? void 0 : i[e.rankingDateOptionIndex]
        });
        if ("function" == typeof e.isHomepageCategory && e.isHomepageCategory(t, r)) return buildCopyLikeHomeIndexComicsUrl({
            apiUrl: l,
            page: a,
            limit: null == e.homepageLimit ? 20 : e.homepageLimit,
            top: r,
            ordering: null == e.homepageOrderingOptionIndex ? void 0 : i[e.homepageOrderingOptionIndex]
        });
        const u = normalizeCopyLikeCategoryParam(t, e.categoryParamMap, r);
        return buildCopyLikeComicsUrl({
            apiUrl: l,
            page: a,
            limit: null == e.themedLimit ? 30 : e.themedLimit,
            freeType: e.themedFreeType,
            ordering: null == e.themedOrderingOptionIndex ? void 0 : n[e.themedOrderingOptionIndex],
            theme: u || "",
            top: null == e.themedTopOptionIndex ? void 0 : n[e.themedTopOptionIndex]
        });
    };
}

function createCopyLikeSearchRequestUrlBuilders(e) {
    return {
        buildAuthorRequestUrl: ({pathWord: t, page: r}) => buildCopyLikeComicsUrl({
            apiUrl: e.getApiUrl(),
            page: r,
            limit: null == e.authorLimit ? 30 : e.authorLimit,
            ordering: e.authorOrdering || "-datetime_updated",
            author: t
        }),
        buildKeywordRequestUrl: ({keyword: t, options: r, page: o}) => {
            const a = Array.isArray(r) ? r : [], i = null == e.queryTypeOptionIndex ? e.queryTypeDefault : null != a[e.queryTypeOptionIndex] ? a[e.queryTypeOptionIndex] : e.queryTypeDefault;
            return buildCopyLikeSearchUrl({
                apiUrl: e.getApiUrl(),
                endpointPath: "function" == typeof e.getKeywordEndpointPath ? e.getKeywordEndpointPath() : e.keywordEndpointPath,
                page: o,
                limit: null == e.keywordLimit ? 20 : e.keywordLimit,
                keyword: t,
                queryType: i,
                platform: e.keywordPlatform,
                freeType: e.keywordFreeType,
                update: e.keywordUpdate
            });
        }
    };
}

function createCopyLikeDetailTagMapper(e) {
    const t = e || {};
    return e => buildCopyLikeDetailTagMap(e, t);
}

function createCopyLikeTagClickActionHandler(e) {
    const t = e || {};
    return (e, r) => resolveCopyLikeTagAction(e, r, t);
}

function createCopyLikeExploreSectionsFeature(e) {
    return createCopyLikeExploreFeature({
        title: e.title,
        sections: e.sections,
        endpoint: e.endpoint,
        parseComic: e.parseComic,
        context: e.context,
        getApiUrl: e.getApiUrl,
        getHeaders: e.getHeaders
    });
}

function createCopyLikeCategoryLoaderFeature(e) {
    return createCopyLikeCategoryLoadFeature(e);
}

function createCopyLikeSearchLoaderFeature(e) {
    return createCopyLikeSearchLoadFeature(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature
});

const MH_LIKE_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0", MH_LIKE_ENDPOINT_PATHS = {
    CATEGORY_PAGE_SEGMENT: "/page",
    SEARCH: "/s",
    CHAPTER_LIST: "/manga/get",
    CHAPTER_INFO: "/chapter/getinfo",
    CHAPTER_CONTENT: "/chapter/getcontent"
};

function normalizeMhLikeId(e) {
    return String(e || "").trim();
}

function normalizeMhLikeDomain(e) {
    return String(e || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function buildMhLikeBaseUrl(e) {
    return `https://${normalizeMhLikeDomain(e)}`;
}

function buildMhLikeHeaders(e) {
    return {
        "User-Agent": MH_LIKE_USER_AGENT,
        Referer: String(e || "")
    };
}

function normalizeMhLikePath(e, t) {
    let r = String(null == e ? t || "" : e).trim();
    return r || (r = String(t || "")), r ? (r = r.replace(/\/+$/, ""), r.startsWith("/") || (r = `/${r}`),
    r) : "";
}

function buildMhLikeRelativeUrl(e, t) {
    const r = String(e || "").replace(/\/+$/, ""), o = String(t || "").trim();
    return o ? o.startsWith("http://") || o.startsWith("https://") ? o : o.startsWith("/") ? `${r}${o}` : `${r}/${o}` : r;
}

function buildMhLikeApiBaseUrl(e, t) {
    return buildMhLikeRelativeUrl(buildMhLikeBaseUrl(e), normalizeMhLikePath(t, "/api"));
}

function buildMhLikeCategoryUrl(e) {
    const t = e || {}, r = String(t.categoryPath || "").replace(/\/+$/, ""), o = normalizeMhLikePath(t.pageSegment, MH_LIKE_ENDPOINT_PATHS.CATEGORY_PAGE_SEGMENT);
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}${o}/${t.page}`);
}

function buildMhLikeSearchUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.searchPath, MH_LIKE_ENDPOINT_PATHS.SEARCH), o = encodeURIComponent(String(null == t.keyword ? "" : t.keyword));
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}/${o}?page=${t.page}`);
}

function buildMhLikeChapterListUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.chapterListPath, MH_LIKE_ENDPOINT_PATHS.CHAPTER_LIST), o = null == t.mode ? "all" : t.mode, a = null == t.timestamp ? Date.now() : t.timestamp;
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}?mid=${t.mangaId}&mode=${o}&t=${a}`);
}

function buildMhLikeChapterEndpointUrl(e) {
    const t = e || {}, r = normalizeMhLikePath(t.chapterPath, "");
    return buildMhLikeRelativeUrl(t.baseUrl, `${r}?m=${t.mangaId}&c=${t.chapterId}`);
}

function buildMhLikeChapterInfoUrl(e) {
    const t = e || {};
    return buildMhLikeChapterEndpointUrl({
        baseUrl: t.baseUrl,
        chapterPath: null == t.chapterPath ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_INFO : t.chapterPath,
        mangaId: t.mangaId,
        chapterId: t.chapterId
    });
}

function buildMhLikeChapterContentUrl(e) {
    const t = e || {};
    return buildMhLikeChapterEndpointUrl({
        baseUrl: t.baseUrl,
        chapterPath: null == t.chapterPath ? MH_LIKE_ENDPOINT_PATHS.CHAPTER_CONTENT : t.chapterPath,
        mangaId: t.mangaId,
        chapterId: t.chapterId
    });
}

function createMhLikeRouteHelpers(e) {
    const t = e || {};
    return {
        buildCategoryUrl: ({categoryPath: e, page: r}) => buildMhLikeCategoryUrl({
            baseUrl: t.baseUrl,
            categoryPath: e,
            page: r,
            pageSegment: t.categoryPageSegment
        }),
        buildSearchUrl: ({keyword: e, page: r}) => buildMhLikeSearchUrl({
            baseUrl: t.baseUrl,
            keyword: e,
            page: r,
            searchPath: t.searchPath
        }),
        buildChapterListUrl: ({mangaId: e, timestamp: r, mode: o}) => buildMhLikeChapterListUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            timestamp: r,
            mode: o,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterContentUrl({
            baseUrl: t.baseUrl,
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterContentPath
        })
    };
}

function parseMhLikeComicCards(e) {
    const t = [];
    if (!e) return t;
    for (let r of e.querySelectorAll(".pb-2")) t.push(new Comic({
        id: r.querySelector("a").attributes.href,
        title: r.querySelector("h3").text,
        cover: r.querySelector("img").attributes.src
    }));
    return t;
}

function parseMhLikeHomeSections(e, t) {
    const r = [ {
        title: "近期更新",
        comics: [],
        viewMore: null
    } ], o = e.querySelector(".pb-unit-md");
    if (o) for (let e of o.querySelectorAll(".slicarda")) r[0].comics.push(new Comic({
        id: e.attributes.href,
        title: e.querySelector("h3").text,
        cover: e.querySelector("img").attributes.src
    }));
    const a = e.querySelectorAll(".cardlist"), i = e.querySelectorAll(".hometitle");
    for (let e = 0; e < i.length; e += 1) {
        const o = i[e].querySelector("h2");
        r.push({
            title: o.text,
            comics: t(a[e]),
            viewMore: {
                page: "category",
                attributes: {
                    category: o.text,
                    param: i[e].attributes.href
                }
            }
        });
    }
    return r;
}

function parseMhLikeMaxPage(e) {
    try {
        return parseInt(e.querySelectorAll("button.text-small").pop().text.replaceAll("\n", "").replaceAll(" ", ""), 10);
    } catch (e) {
        return 1;
    }
}

function parseMhLikeDetailTags(e) {
    const t = e.querySelectorAll("div.py-1"), r = {
        作者: [],
        类型: [],
        标签: []
    };
    for (let e of t[0].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), r["作者"].push(t);
    }
    for (let e of t[1].querySelectorAll("a > span")) {
        let t = e.text.trim();
        t.endsWith(",") && (t = t.slice(0, -1).trim()), r["类型"].push(t);
    }
    for (let e of t[2].querySelectorAll("a")) r["标签"].push(e.text.replace("\n", "").replaceAll(" ", "").replace("#", ""));
    return r;
}

function parseMhLikeRecommendComics(e) {
    const t = [];
    for (let r of e.querySelectorAll("div.cardlist > div.pb-2")) t.push(new Comic({
        id: r.querySelector("a").attributes.href,
        title: r.querySelector("h3").text,
        cover: r.querySelector("img").attributes.src
    }));
    return t;
}

async function loadMhLikePagedComicsFromUrl(e) {
    const t = await getRuntimeDocument(e.requestUrl, e.headers, e.context);
    return {
        comics: e.parseComics(t),
        maxPage: parseMhLikeMaxPage(t)
    };
}

function createMhLikeExploreFeature(e) {
    return {
        title: e.title,
        type: "multiPartPage",
        load: async () => parseMhLikeHomeSections(await getRuntimeDocument(e.getBaseUrl(), e.getHeaders(), e.context || "mh_like home"), e.parseComics)
    };
}

function createMhLikeCategoryLoadFeature(e) {
    return async (t, r, o, a) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            category: t,
            params: r,
            options: o,
            page: a
        }) : buildMhLikeCategoryUrl({
            baseUrl: e.getBaseUrl(),
            categoryPath: r,
            page: a,
            pageSegment: e.categoryPageSegment
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like category"
    });
}

function createMhLikeSearchLoadFeature(e) {
    return async (t, r, o) => loadMhLikePagedComicsFromUrl({
        requestUrl: e.buildRequestUrl ? e.buildRequestUrl({
            keyword: t,
            options: r,
            page: o
        }) : buildMhLikeSearchUrl({
            baseUrl: e.getBaseUrl(),
            keyword: t,
            page: o,
            searchPath: e.searchPath
        }),
        headers: e.getHeaders(),
        parseComics: e.parseComics,
        context: e.context || "mh_like search"
    });
}

async function loadMhLikeBaseComicInfo(e) {
    const t = await getRuntimeDocument(e.detailUrl, e.headers, e.context || "mh_like comic detail"), r = t.querySelector(".text-xl").text.trim().split("   ")[0], o = t.querySelector(".object-cover").attributes.src, a = t.querySelector("p.text-medium").text;
    return {
        document: t,
        title: r,
        cover: o,
        description: a,
        tags: parseMhLikeDetailTags(t),
        recommend: parseMhLikeRecommendComics(t),
        mangaId: t.querySelector("#mangachapters").attributes["data-mid"]
    };
}

function createMhLikeCategoryRequestUrlBuilder(e) {
    const t = e || {};
    return ({params: e, page: r}) => buildMhLikeCategoryUrl({
        baseUrl: t.getBaseUrl(),
        categoryPath: e,
        page: r,
        pageSegment: t.categoryPageSegment
    });
}

function createMhLikeSearchRequestUrlBuilder(e) {
    const t = e || {};
    return ({keyword: e, page: r}) => buildMhLikeSearchUrl({
        baseUrl: t.getBaseUrl(),
        keyword: e,
        page: r,
        searchPath: t.searchPath
    });
}

function createMhLikeChapterRequestUrlBuilders(e) {
    const t = e || {};
    return {
        buildChapterListRequestUrl: ({mangaId: e, timestamp: r, mode: o}) => buildMhLikeChapterListUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            timestamp: r,
            mode: o,
            chapterListPath: t.chapterListPath
        }),
        buildChapterInfoRequestUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterInfoUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterInfoPath
        }),
        buildChapterContentRequestUrl: ({mangaId: e, chapterId: r}) => buildMhLikeChapterContentUrl({
            baseUrl: t.getBaseUrl(),
            mangaId: e,
            chapterId: r,
            chapterPath: t.chapterContentPath
        })
    };
}

function buildMhLikeChapterUrl(e, t) {
    return `${String(e || "").replace(/\/+$/, "")}/${normalizeMhLikeId(t)}`;
}

function createMhLikeExplorePageFeature(e) {
    return createMhLikeExploreFeature(e);
}

function createMhLikeCategoryLoaderFeature(e) {
    return createMhLikeCategoryLoadFeature(e);
}

function createMhLikeSearchLoaderFeature(e) {
    return createMhLikeSearchLoadFeature(e);
}

function loadMhLikeBaseComicInfoFeature(e) {
    return loadMhLikeBaseComicInfo(e);
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature
});

const PICACG_ENDPOINT_PATHS = {
    AUTH_SIGN_IN: "auth/sign-in",
    COMICS: "comics",
    COMICS_RANDOM: "comics/random",
    COMICS_LEADERBOARD: "comics/leaderboard",
    COMICS_ADVANCED_SEARCH: "comics/advanced-search",
    USERS_FAVOURITE: "users/favourite",
    COMMENTS: "comments"
}, PICACG_RANKING_CATEGORY = "VC", PICACG_TAG_NAMESPACES = {
    AUTHOR: "Author",
    CATEGORIES: "Categories"
};

function normalizePicacgBaseUrl(e, t) {
    const r = "string" == typeof t ? String(t).trim() : "", o = "string" == typeof e && e.trim() ? e.trim() : r;
    return String(o || "").replace(/\/+$/, "");
}

function buildPicacgEndpointUrl(e, t) {
    const r = normalizePicacgBaseUrl(e), o = String(t || "").replace(/^\/+/, "");
    return r ? o ? `${r}/${o}` : r : o;
}

function buildPicacgQueryString(e) {
    const t = [];
    for (const r of e || []) {
        if (!Array.isArray(r) || r.length < 2) continue;
        const e = r[0], o = r[1];
        null != e && null != o && t.push(`${String(e)}=${String(o)}`);
    }
    return t.join("&");
}

function buildPicacgPathWithQuery(e, t) {
    const r = buildPicacgQueryString(t);
    return r ? `${String(e || "")}?${r}` : String(e || "");
}

function createPicacgRequest(e, t) {
    const r = String(e || "");
    return {
        path: r,
        signaturePath: null == t ? r : String(t || "")
    };
}

function resolvePicacgTagAction(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = o.authorNamespace || PICACG_TAG_NAMESPACES.AUTHOR, i = o.categoryNamespace || PICACG_TAG_NAMESPACES.CATEGORIES;
    return e === a ? {
        action: "category",
        keyword: t,
        param: "a"
    } : e === i ? {
        action: "category",
        keyword: t,
        param: "c"
    } : {
        action: "search",
        keyword: t
    };
}

function createPicacgRouteHelpers(e) {
    const t = (e && "object" == typeof e && !Array.isArray(e) ? e : {}).rankingCategory || "VC";
    return {
        authSignInRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.AUTH_SIGN_IN),
        randomComicsRequest: () => createPicacgRequest(PICACG_ENDPOINT_PATHS.COMICS_RANDOM),
        latestComicsRequest: ({page: e, sort: t}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", e ], [ "s", t ] ])),
        leaderboardRequest: ({option: e, categoryType: r}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_LEADERBOARD, [ [ "tt", e ], [ "ct", null == r ? t : r ] ])),
        categoryComicsRequest: ({page: e, type: t, category: r, sort: o}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS, [ [ "page", e ], [ t || "c", r ], [ "s", o ] ])),
        advancedSearchRequest: ({page: e}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.COMICS_ADVANCED_SEARCH, [ [ "page", e ] ])),
        comicFavoriteRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/favourite`),
        userFavoritesRequest: ({page: e, sort: t}) => createPicacgRequest(buildPicacgPathWithQuery(PICACG_ENDPOINT_PATHS.USERS_FAVOURITE, [ [ "page", e ], [ "s", t ] ])),
        comicInfoRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}`),
        comicEpsRequest: ({comicId: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/eps`, [ [ "page", t ] ])),
        comicRecommendationRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/recommendation`),
        comicEpPagesRequest: ({comicId: e, epId: t, page: r}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/order/${t}/pages`, [ [ "page", r ] ])),
        comicLikeRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/like`),
        commentChildrenRequest: ({replyTo: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/childrens`, [ [ "page", t ] ])),
        comicCommentsRequest: ({comicId: e, page: t}) => createPicacgRequest(buildPicacgPathWithQuery(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`, [ [ "page", t ] ])),
        commentReplyRequest: ({replyTo: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}`),
        comicCommentRequest: ({comicId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`, `/${PICACG_ENDPOINT_PATHS.COMICS}/${e}/comments`),
        commentLikeRequest: ({commentId: e}) => createPicacgRequest(`${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/like`, `/${PICACG_ENDPOINT_PATHS.COMMENTS}/${e}/like`)
    };
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction
});

const pluginFeatureGenericApi = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver,
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag
}, pluginFeatureCopyLikeApi = {
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule,
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature
}, pluginFeatureMhLikeApi = {
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature
}, pluginFeaturePicacgApi = {
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction
}, pluginFeatureContractApi = {
    ...pluginFeatureGenericApi,
    ...pluginFeatureCopyLikeApi,
    ...pluginFeatureMhLikeApi,
    ...pluginFeaturePicacgApi
};

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const o = String(null == e ? "" : e).trim() || t;
    return r ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), n = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), l = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), u = String(e || "").replace(/^\/+/, "");
    if (!u) return `${o}/${a}/${i}@${n}`;
    const s = l ? `${l}/${u}` : u;
    return `${o}/${a}/${i}@${n}/${u.startsWith(`${l}/`) ? u : s}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver,
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag,
    normalizeCopyLikeBaseUrl,
    buildCopyLikeApiUrl,
    buildCopyLikePageUrl,
    buildCopyLikeTokenHeader,
    buildCopyLikeBearerTokenHeader,
    buildCopyLikeRequestSigningMeta,
    buildCopyLikeHmacSignature,
    COPY_LIKE_ENDPOINT_PATHS,
    COPY_LIKE_FORM_URLENCODED_CONTENT_TYPE,
    withCopyLikeFormHeaders,
    buildCopyLikeEndpointUrl,
    buildCopyLikeQueryString,
    buildCopyLikeUrlWithQuery,
    buildCopyLikeRankingUrl,
    buildCopyLikeComicsUrl,
    buildCopyLikeSearchUrl,
    buildCopyLikeHomeIndexComicsUrl,
    buildCopyLikeFavoriteComicsUrl,
    buildCopyLikeComicDetailUrl,
    buildCopyLikeComicQueryUrl,
    buildCopyLikeGroupChaptersUrl,
    buildCopyLikeChapterUrl,
    normalizeCopyLikeCategoryParam,
    parseCopyLikeDetailAuthors,
    parseCopyLikeDetailTags,
    buildCopyLikeDetailTagMap,
    resolveCopyLikeTagAction,
    buildCopyLikeHomeSections,
    loadCopyLikeHomeSectionsModule,
    loadCopyLikeListModule,
    parseCopyLikeAuthorKeyword,
    loadCopyLikeSearchModule,
    createCopyLikeExploreFeature,
    createCopyLikeCategoryLoadFeature,
    createCopyLikeSearchLoadFeature,
    createCopyLikeCategoryRequestUrlBuilder,
    createCopyLikeSearchRequestUrlBuilders,
    createCopyLikeDetailTagMapper,
    createCopyLikeTagClickActionHandler,
    createCopyLikeExploreSectionsFeature,
    createCopyLikeCategoryLoaderFeature,
    createCopyLikeSearchLoaderFeature,
    MH_LIKE_USER_AGENT,
    MH_LIKE_ENDPOINT_PATHS,
    normalizeMhLikeId,
    normalizeMhLikeDomain,
    buildMhLikeBaseUrl,
    buildMhLikeHeaders,
    normalizeMhLikePath,
    buildMhLikeRelativeUrl,
    buildMhLikeApiBaseUrl,
    buildMhLikeCategoryUrl,
    buildMhLikeSearchUrl,
    buildMhLikeChapterListUrl,
    buildMhLikeChapterEndpointUrl,
    buildMhLikeChapterInfoUrl,
    buildMhLikeChapterContentUrl,
    createMhLikeRouteHelpers,
    parseMhLikeComicCards,
    parseMhLikeHomeSections,
    parseMhLikeMaxPage,
    parseMhLikeDetailTags,
    parseMhLikeRecommendComics,
    loadMhLikePagedComicsFromUrl,
    createMhLikeExploreFeature,
    createMhLikeCategoryLoadFeature,
    createMhLikeSearchLoadFeature,
    loadMhLikeBaseComicInfo,
    createMhLikeCategoryRequestUrlBuilder,
    createMhLikeSearchRequestUrlBuilder,
    createMhLikeChapterRequestUrlBuilders,
    buildMhLikeChapterUrl,
    createMhLikeExplorePageFeature,
    createMhLikeCategoryLoaderFeature,
    createMhLikeSearchLoaderFeature,
    loadMhLikeBaseComicInfoFeature,
    PICACG_ENDPOINT_PATHS,
    PICACG_TAG_NAMESPACES,
    normalizePicacgBaseUrl,
    buildPicacgEndpointUrl,
    buildPicacgQueryString,
    buildPicacgPathWithQuery,
    createPicacgRouteHelpers,
    resolvePicacgTagAction,
    pluginFeatureGenericApi,
    pluginFeatureCopyLikeApi,
    pluginFeatureMhLikeApi,
    pluginFeaturePicacgApi,
    pluginFeatureContractApi
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";

const MH1234_IMAGE_BASE_URL = normalizeWebSourceBaseUrl("https://gmh1234.wszwhg.net"), MH1234_ROUTE_PATHS = {
    LIST: "/list/",
    SEARCH: "/search/",
    COMIC: "/comic"
};

function normalizeMh1234EpisodeImagePath(e) {
    return String(e || "").replaceAll("\\", "").replace(/^\/+/, "");
}

function buildMh1234ComicPath(e) {
    return joinWebSourcePath(MH1234_ROUTE_PATHS.COMIC, [ `${e}.html` ]);
}

function buildMh1234EpisodePath(e, t) {
    return joinWebSourcePath(MH1234_ROUTE_PATHS.COMIC, [ e, `${t}.html` ]);
}

function buildMh1234FilterQuery(e, t, r) {
    const o = Array.isArray(t) ? t : [];
    return {
        filter: `${e}-${o[0]}-${o[1]}-${o[2]}`,
        sort: o[3],
        page: r
    };
}
