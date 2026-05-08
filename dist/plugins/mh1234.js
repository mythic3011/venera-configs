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

function buildMh1234EpisodePath(e, i) {
    return joinWebSourcePath(MH1234_ROUTE_PATHS.COMIC, [ e, `${i}.html` ]);
}

function buildMh1234FilterQuery(e, i, n) {
    const a = Array.isArray(i) ? i : [];
    return {
        filter: `${e}-${a[0]}-${a[1]}-${a[2]}`,
        sort: a[3],
        page: n
    };
}

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
                const e = {}, i = await Network.get(this.baseUrl);
                if (200 !== i.status) throw `Invalid status code: ${i.status}`;
                const n = new HtmlDocument(i.body).querySelectorAll("div.imgBox");
                for (let i of n) {
                    const n = i.querySelector(".Title").text, a = [];
                    for (let e of i.querySelectorAll("li.list-comic")) e.querySelectorAll("a")[1], a.push(new Comic({
                        id: e.attributes["data-key"],
                        title: e.querySelector("a.txtA").text,
                        cover: toWebSourceAbsoluteUrl(e.querySelector("img").attributes.src, this.baseUrl)
                    }));
                    e[n] = a;
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
            load: async (e, i, n, a) => {
                if (i.endsWith(".html")) {
                    const e = await Network.get(buildWebSourceUrl(this.baseUrl, i));
                    if (200 !== e.status) throw `Invalid status code: ${e.status}`;
                    return this.parseComics(e.body, !0);
                }
                {
                    const e = buildWebSourceUrl(this.baseUrl, MH1234_ROUTE_PATHS.LIST, buildMh1234FilterQuery(i, n, a)), t = await Network.get(e);
                    if (console.warn(e), 200 !== t.status) throw `Invalid status code: ${t.status}`;
                    const o = new HtmlDocument(t.body);
                    return {
                        comics: this.parseList(o),
                        maxPage: parseInt(o.querySelector("#total-page").attributes.value)
                    };
                }
            },
            optionLoader: async (e, i) => i.endsWith(".html") ? [] : [ {
                options: [ "-全部", "ertong-儿童漫画", "shaonian-少年漫画", "shaonv-少女漫画", "qingnian-青年漫画", "bailingmanhua-白领漫画", "tongrenmanhua-同人漫画" ]
            }, {
                options: [ "-全部", "wanjie-已完结", "lianzai-连载中" ]
            }, {
                options: [ "-全部", "rhmh-日韩", "dlmh-大陆", "gtmh-港台", "taiwan-台湾", "ommh-欧美", "hanguo-韩国", "qtmg-其他" ]
            }, {
                options: [ "update-更新", "post-发布", "click-点击" ]
            } ]
        }, this.search = {
            load: async (e, i, n) => {
                const a = buildWebSourceUrl(this.baseUrl, MH1234_ROUTE_PATHS.SEARCH, {
                    keywords: e,
                    sort: Array.isArray(i) ? i[0] : void 0,
                    page: n
                }), t = await Network.get(a);
                if (200 !== t.status) throw `Invalid status code: ${t.status}`;
                return this.parseComics(t.body);
            },
            optionList: [ {
                options: [ "update-更新", "post-发布", "click-点击" ],
                label: "排序"
            } ],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async e => {
                var i, n;
                const a = await Network.get(buildWebSourceUrl(this.baseUrl, buildMh1234ComicPath(e)));
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                const t = new HtmlDocument(a.body), o = t.querySelector(".BarTit").text, r = toWebSourceAbsoluteUrl(t.querySelector(".pic").querySelector("img").attributes.src, this.baseUrl), u = null == (i = t.querySelector("#full-des")) ? void 0 : i.text, s = t.querySelectorAll(".txtItme"), l = [];
                for (let e of t.querySelector(".sub_r").querySelectorAll("a")) {
                    const i = e.text;
                    i.length > 0 && l.push(i);
                }
                const g = {}, h = null == (n = t.querySelector(".chapter-warp")) ? void 0 : n.querySelectorAll("li");
                if (h) for (let e of h) g[e.querySelector("a").attributes.href.replace("/comic/", "").replace(".html", "").split("/").join("_")] = e.querySelector("span").text;
                return {
                    title: o,
                    cover: r,
                    description: u,
                    tags: {
                        作者: [ s[0].text.replaceAll("\n", "").replaceAll("\r", "").trim() ],
                        更新: [ s[3].querySelector(".date").text ],
                        标签: l.slice(0, -1)
                    },
                    chapters: g,
                    recommend: this.parseList(t)
                };
            },
            loadEp: async (e, i) => {
                const n = i.split("_"), a = await Network.get(buildWebSourceUrl(this.baseUrl, buildMh1234EpisodePath(n[0], n[1])));
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                const t = a.body, o = t.search("var chapterImages = ") + 22, r = t.search(";var chapterPath = ") - 2, u = t.search(";var chapterPrice") - 1, s = t.substring(o, r).split('","'), l = t.substring(r + 22, u);
                for (let e = 0; e < s.length; e++) s[e] = buildWebSourceUrl(MH1234_IMAGE_BASE_URL, joinWebSourcePath("/", [ l, normalizeMh1234EpisodeImagePath(s[e]) ]));
                return {
                    images: s
                };
            },
            enableTagsTranslate: !1
        };
    }
    get baseUrl() {
        return normalizeWebSourceBaseUrl(`https://b.${this.loadSetting("domains")}`);
    }
    parseComics(e, i = !1) {
        const n = new HtmlDocument(e), a = [];
        for (let e of n.querySelectorAll(".itemBox")) a.push(new Comic({
            id: e.attributes["data-key"],
            title: e.querySelector(".title").text,
            cover: toWebSourceAbsoluteUrl(e.querySelector("img").attributes.src, this.baseUrl)
        }));
        return {
            comics: a,
            maxPage: i ? 1 : parseInt(n.querySelector("#total-page").attributes.value)
        };
    }
    parseList(e) {
        const i = [];
        for (let n of e.querySelectorAll(".list-comic")) i.push(new Comic({
            id: n.attributes["data-key"],
            title: n.querySelector(".txtA").text,
            cover: toWebSourceAbsoluteUrl(n.querySelector("img").attributes.src, this.baseUrl)
        }));
        return i;
    }
}

function normalizeWebSourceBaseUrl(e, i) {
    const n = i && "object" == typeof i && !Array.isArray(i) ? i : {}, a = "string" == typeof n.defaultScheme ? n.defaultScheme.trim() : "";
    let t = String(e || "").trim();
    return t ? (a && !/^https?:\/\//i.test(t) && (t = `${a.replace(/:$/, "")}://${t}`),
    t.replace(/\/+$/, "")) : "";
}

function normalizeWebSourcePath(e, i) {
    const n = String(null == e ? i || "" : e).trim();
    return n ? /^https?:\/\//i.test(n) || n.startsWith("//") || n.startsWith("/") ? n : `/${n}` : "";
}

function joinWebSourcePath(e, i) {
    const n = normalizeWebSourcePath(e, "/"), a = Array.isArray(i) ? i : [];
    let t = n;
    for (const e of a) {
        const i = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        i && (t = `${t}/${i}`);
    }
    return t;
}

function buildWebSourceQuery(e) {
    if (!e || "object" != typeof e) return "";
    const i = [];
    for (const n of Object.keys(e)) {
        const a = e[n];
        if (null != a && "" !== a) if (Array.isArray(a)) for (const e of a) null != e && "" !== e && i.push(`${encodeURIComponent(n)}=${encodeURIComponent(String(e))}`); else i.push(`${encodeURIComponent(n)}=${encodeURIComponent(String(a))}`);
    }
    return i.join("&");
}

function buildWebSourceUrl(e, i, n) {
    const a = normalizeWebSourceBaseUrl(e || ""), t = normalizeWebSourcePath(i, "");
    let o = t;
    /^https?:\/\//i.test(t) || t.startsWith("//") || (o = t ? `${a}${t.startsWith("/") ? "" : "/"}${t}` : a);
    const r = buildWebSourceQuery(n);
    return r ? `${o}${o.includes("?") ? "&" : "?"}${r}` : o;
}

function toWebSourceAbsoluteUrl(e, i) {
    const n = String(e || "").trim();
    return n ? /^https?:\/\//i.test(n) ? n : n.startsWith("//") ? `${normalizeWebSourceBaseUrl(i || "", {
        defaultScheme: "https"
    }).startsWith("http://") ? "http:" : "https:"}${n}` : buildWebSourceUrl(i, n) : "";
}

function replaceWebSourceBaseUrl(e, i, n) {
    const a = String(e || "").trim(), t = normalizeWebSourceBaseUrl(i || ""), o = normalizeWebSourceBaseUrl(n || "");
    return a && t && o ? a === t ? o : a.startsWith(`${t}/`) ? `${o}${a.slice(t.length)}` : a : a;
}

function ensureWebSourceTrailingSlash(e) {
    const i = String(e || "").trim();
    return i ? i.endsWith("/") ? i : `${i}/` : i;
}

function resolveMappedCategoryTagAction(e, i, n) {
    const a = n && "object" == typeof n && !Array.isArray(n) ? n : {}, t = null == a.namespace ? "标签" : String(a.namespace);
    if (String(e) !== t) throw a.unsupportedMessage || "Unsupported tag namespace";
    const o = a.mapping && "object" == typeof a.mapping ? a.mapping : {}, r = String(null == i ? "" : i), u = o[r], s = "function" == typeof a.keywordFormatter ? a.keywordFormatter(r, u, e) : r, l = "function" == typeof a.paramFormatter ? a.paramFormatter(r, u, e) : String(u);
    return {
        action: a.action || "category",
        keyword: s,
        param: l
    };
}

function createMappedCategoryTagActionResolver(e) {
    return (i, n) => resolveMappedCategoryTagAction(i, n, e);
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, i, n) {
    const a = String(null == e ? "" : e).trim() || i;
    return n ? a.replace(/^\/+|\/+$/g, "") : a;
}

function resolvePluginUpdateUrl(e) {
    const i = __veneraGetRuntimeGlobal(), n = i.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof i.__VENERA_RELEASE_AUTHORITY__ ? i.__VENERA_RELEASE_AUTHORITY__ : {}, a = __veneraNormalizeAuthorityPart(n.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), t = __veneraNormalizeAuthorityPart(n.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(n.repository, "mythic3011/venera-configs", !0), r = __veneraNormalizeAuthorityPart(n.releaseRef, "main", !1), u = __veneraNormalizeAuthorityPart(n.artifactPathPrefix, "dist/plugins", !0), s = String(e || "").replace(/^\/+/, "");
    if (!s) return `${a}/${t}/${o}@${r}`;
    const l = u ? `${u}/${s}` : s;
    return `${a}/${t}/${o}@${r}/${s.startsWith(`${u}/`) ? s : l}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
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
