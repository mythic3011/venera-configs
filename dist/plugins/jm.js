class JM extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "禁漫天堂", this.key = "jm", this.version = "1.4.0", this.minAppVersion = "1.5.0",
        this.url = resolvePluginUpdateUrl("jm.js"), this.dailyCheckInInProgress = !1, this.account = {
            login: async (e, t) => {
                Math.floor(Date.now() / 1e3);
                let a = await this.post(`${this.baseUrl}/login`, `username=${encodeURIComponent(e)}&password=${encodeURIComponent(t)}`), i = JSON.parse(a);
                return i.uid && this.saveData("uid", i.uid), "ok";
            },
            logout: () => {
                for (let e of JM.apiDomains) Network.deleteCookies(e);
            },
            registerWebsite: null
        }, this.explore = [ {
            title: "禁漫天堂",
            type: "multiPartPage",
            load: async e => {
                let t = await this.get(`${this.baseUrl}/promote?page=0`), a = [];
                for (let e of JSON.parse(t)) {
                    let t = e.title, i = e.type, r = e.id.toString();
                    if ("category_id" === i && (r = e.slug), [ "library", "novels" ].includes(i)) continue;
                    let s = e.content.map(e => this.parseComic(e));
                    a.push({
                        title: e.title,
                        comics: s,
                        viewMore: `category:${t}@${r}`
                    });
                }
                return a;
            }
        } ], this.category = {
            title: "禁漫天堂",
            parts: [ {
                name: "每週必看",
                type: "fixed",
                categories: [ "每週必看" ],
                itemType: "category"
            }, {
                name: "成人A漫",
                type: "fixed",
                categories: [ "最新A漫", "同人", "單本", "短篇", "其他類", "韓漫", "美漫", "Cosplay", "3D", "禁漫漢化組" ],
                itemType: "category",
                categoryParams: [ "0", "doujin", "single", "short", "another", "hanman", "meiman", "another_cosplay", "3D", "禁漫漢化組" ]
            }, {
                name: "主題A漫",
                type: "fixed",
                categories: [ "無修正", "劇情向", "青年漫", "校服", "純愛", "人妻", "教師", "百合", "Yaoi", "性轉", "NTR", "女裝", "癡女", "全彩", "女性向", "完結", "純愛", "禁漫漢化組" ],
                itemType: "search"
            }, {
                name: "角色扮演",
                type: "fixed",
                categories: [ "御姐", "熟女", "巨乳", "貧乳", "女性支配", "教師", "女僕", "護士", "泳裝", "眼鏡", "連褲襪", "其他制服", "兔女郎" ],
                itemType: "search"
            }, {
                name: "特殊PLAY",
                type: "fixed",
                categories: [ "群交", "足交", "束縛", "肛交", "阿黑顏", "藥物", "扶他", "調教", "野外露出", "催眠", "自慰", "觸手", "獸交", "亞人", "怪物女孩", "皮物", "ryona", "騎大車" ],
                itemType: "search"
            }, {
                name: "特殊PLAY",
                type: "fixed",
                categories: [ "CG", "重口", "獵奇", "非H", "血腥暴力", "站長推薦" ],
                itemType: "search"
            } ],
            enableRankingPage: !0
        }, this.categoryComics = {
            load: async (e, t, a, i) => {
                if ("每週必看" !== e) {
                    null != t || (t = e), t = encodeURIComponent(t);
                    let r = await this.get(`${this.baseUrl}/categories/filter?o=${a[0]}&c=${t}&page=${i}`), s = JSON.parse(r), o = s.total, n = Math.ceil(o / 80);
                    return {
                        comics: s.content.map(e => this.parseComic(e)),
                        maxPage: n
                    };
                }
                {
                    let e = await this.get(`${this.baseUrl}/week/filter?id=${a[0]}&type=${a[1]}&page=0`);
                    return {
                        comics: JSON.parse(e).list.map(e => this.parseComic(e)),
                        maxPage: 1
                    };
                }
            },
            optionLoader: async (e, t) => {
                if ("每週必看" !== e) return [ {
                    label: "排序",
                    options: [ "mr-最新", "mv-總排行", "mv_m-月排行", "mv_w-周排行", "mv_t-日排行", "mp-最多圖片", "tf-最多喜歡" ]
                } ];
                {
                    let e = await this.get(`${this.baseUrl}/week`), t = JSON.parse(e), a = [];
                    for (let e of t.categories) a.push(`${e.id}-${e.time}`);
                    return [ {
                        label: "時間",
                        options: a
                    }, {
                        label: "類型",
                        options: [ "manga-日漫", "hanman-韓漫", "another-其他" ]
                    } ];
                }
            },
            ranking: {
                options: [ "mv-總排行", "mv_m-月排行", "mv_w-周排行", "mv_t-日排行" ],
                load: async (e, t) => this.categoryComics.load("總排行", "0", [ e ], t)
            }
        }, this.search = {
            load: async (e, t, a) => {
                e = e.trim(), e = (e = encodeURIComponent(e)).replace(/%20/g, "+");
                let i = `${this.baseUrl}/search?search_query=${e}&o=${t[0]}`;
                a > 1 && (i += `&page=${a}`);
                let r = await this.get(i), s = JSON.parse(r), o = s.total, n = Math.ceil(o / 80);
                return {
                    comics: s.content.map(e => this.parseComic(e)),
                    maxPage: n
                };
            },
            optionList: [ {
                type: "select",
                options: [ "mr-最新", "mv-總排行", "mv_m-月排行", "mv_w-周排行", "mv_t-日排行", "mp-最多圖片", "tf-最多喜歡" ],
                label: "排序"
            } ]
        }, this.favorites = {
            multiFolder: !0,
            addOrDelFavorite: async (e, t, a, i) => {
                a ? (await this.post(`${this.baseUrl}/favorite`, `aid=${e}`), await this.post(`${this.baseUrl}/favorite_folder`, `type=move&folder_id=${t}&aid=${e}`)) : await this.post(`${this.baseUrl}/favorite`, `aid=${e}`);
            },
            loadFolders: async e => {
                let t = await this.get(`${this.baseUrl}/favorite`), a = {
                    0: this.translate("All")
                }, i = JSON.parse(t);
                for (let e of i.folder_list) a[e.FID.toString()] = e.name;
                return {
                    folders: a,
                    favorited: []
                };
            },
            addFolder: async e => {
                await this.post(`${this.baseUrl}/favorite_folder`, `type=add&folder_name=${e}`);
            },
            deleteFolder: async e => {
                await this.post(`${this.baseUrl}/favorite_folder`, `type=del&folder_id=${e}`);
            },
            loadComics: async (e, t) => {
                let a = this.loadSetting("favoriteOrder"), i = await this.get(`${this.baseUrl}/favorite?folder_id=${t}&page=${e}&o=${a}`), r = JSON.parse(i), s = r.total, o = Math.ceil(s / 20);
                return {
                    comics: r.list.map(e => this.parseComic(e)),
                    maxPage: o
                };
            },
            singleFolderForSingleComic: !0
        }, this.comic = {
            loadInfo: async e => {
                var t, a, i, r, s, o, n;
                e.startsWith("jm") && (e = e.substring(2));
                let l = await this.get(`${this.baseUrl}/album?id=${e}`), c = JSON.parse(l), h = null != (t = c.author) ? t : [], m = null != (a = c.works) ? a : [], d = null != (i = c.actors) ? i : [], g = new Map, p = (null != (r = c.series) ? r : []).sort((e, t) => e.sort - t.sort);
                for (let e of p) {
                    var u;
                    let t = null != (u = e.name) ? u : "";
                    t = t.trim(), 0 === t.length && (t = `第${e.sort}話`);
                    let a = e.id.toString();
                    g.set(a, t);
                }
                0 === g.size && g.set(e, "第1話");
                let f = null != (s = c.tags) ? s : [], v = c.related_list.map(e => {
                    var t, a;
                    return new Comic({
                        id: e.id.toString(),
                        title: e.name,
                        subtitle: null != (t = e.author) ? t : "",
                        cover: this.getCoverUrl(e.id),
                        description: null != (a = e.description) ? a : ""
                    });
                }), y = c.addtime, w = new Date(1e3 * y), $ = `${w.getFullYear()}-${w.getMonth() + 1}-${w.getDate()}`;
                return new ComicDetails({
                    title: c.name,
                    cover: this.getCoverUrl(e),
                    description: c.description,
                    likesCount: Number(c.likes),
                    chapters: g,
                    tags: {
                        Author: h,
                        Tag: f,
                        Work: m,
                        Actor: d,
                        View: c.total_views ? [ c.total_views ] : []
                    },
                    recommend: v,
                    isFavorite: null != (o = c.is_favorite) && o,
                    isLiked: null != (n = c.liked) && n,
                    updateTime: $
                });
            },
            loadEp: async (e, t) => {
                let a = await this.get(`${this.baseUrl}/chapter?id=${t}`);
                return {
                    images: JSON.parse(a).images.map(e => this.getImageUrl(t, e))
                };
            },
            onImageLoad: (e, t, a) => {
                let i = "";
                for (let t = e.length - 1; t >= 0; t--) if ("/" === e[t]) {
                    i = e.substring(t + 1, e.length - 5);
                    break;
                }
                let r = 0;
                if ((a = Number(a)) < 220980) r = 0; else if (a < 268850) r = 10; else if (a > 421926) {
                    let e = a.toString() + i, t = Convert.encodeUtf8(e), s = Convert.md5(t), o = Convert.hexEncode(s);
                    r = o.charCodeAt(o.length - 1) % 8 * 2 + 2;
                } else {
                    let e = a.toString() + i, t = Convert.encodeUtf8(e), s = Convert.md5(t), o = Convert.hexEncode(s);
                    r = o.charCodeAt(o.length - 1) % 10 * 2 + 2;
                }
                return r <= 1 ? {} : {
                    headers: this.getImgHeaders(),
                    modifyImage: e.endsWith(".gif") ? null : `\n                    let modifyImage = (image) => {\n                        const num = ${r}\n                        let blockSize = Math.floor(image.height / num)\n                        let remainder = image.height % num\n                        let blocks = []\n                        for(let i = 0; i < num; i++) {\n                            let start = i * blockSize\n                            let end = start + blockSize + (i !== num - 1 ? 0 : remainder)\n                            blocks.push({\n                                start: start,\n                                end: end\n                            })\n                        }\n                        let res = Image.empty(image.width, image.height)\n                        let y = 0\n                        for(let i = blocks.length - 1; i >= 0; i--) {\n                            let block = blocks[i]\n                            let currentHeight = block.end - block.start\n                            res.fillImageRangeAt(0, y, image, 0, block.start, image.width, currentHeight)\n                            y += currentHeight\n                        }\n                        return res\n                    }\n                `
                };
            },
            onThumbnailLoad: e => ({
                headers: this.getImgHeaders()
            }),
            likeComic: async (e, t) => {
                let a = await this.post(`${this.baseUrl}/like`, `id=${e}`), i = JSON.parse(a);
                var r;
                if (200 !== i.code || "error" === i.status) throw null != (r = i.msg) ? r : "Failed to like/unlike comic";
                return "ok";
            },
            loadComments: async (e, t, a, i) => {
                let r = await this.get(`${this.baseUrl}/forum?mode=manhua&aid=${e}&page=${a}`), s = JSON.parse(r);
                return {
                    comments: s.list.map(e => new Comment({
                        avatar: this.getAvatarUrl(e.photo),
                        userName: e.username,
                        time: e.addtime,
                        content: e.content.substring(e.content.indexOf(">") + 1, e.content.lastIndexOf("<"))
                    })),
                    maxPage: Math.floor(s.total / 6) + 1
                };
            },
            sendComment: async (e, t, a, i) => {
                let r = await this.post(`${this.baseUrl}/comment`, `aid=${e}&comment=${encodeURIComponent(a)}&status=undefined`), s = JSON.parse(r);
                var o;
                if ("fail" === s.status) throw null != (o = s.msg) ? o : "Failed to send comment";
                return "ok";
            },
            idMatch: "^(\\d+|jm\\d+)$",
            onClickTag: (e, t) => ({
                action: "search",
                keyword: t
            })
        }, this.settings = {
            refreshDomains: {
                title: "Refresh Domain List",
                type: "callback",
                buttonText: "Refresh",
                callback: () => this.refreshApiDomains(!0)
            },
            refreshDomainsOnStart: {
                title: "Refresh Domain List on Startup",
                type: "switch",
                default: !0
            },
            apiDomain: {
                title: "Api Domain",
                type: "select",
                options: [ {
                    value: "1"
                }, {
                    value: "2"
                }, {
                    value: "3"
                }, {
                    value: "4"
                } ],
                default: "1"
            },
            imageStream: {
                title: "Image Stream",
                type: "select",
                options: [ {
                    value: "1"
                }, {
                    value: "2"
                }, {
                    value: "3"
                }, {
                    value: "4"
                } ],
                default: "1"
            },
            favoriteOrder: {
                title: "Favorite Order",
                type: "select",
                options: [ {
                    value: "mr",
                    text: "Add Time"
                }, {
                    value: "mp",
                    text: "Update Time"
                } ],
                default: "mr"
            },
            dailyCheckInTask: {
                title: "Daily Check-in Task",
                type: "switch",
                default: !1
            },
            dailyCheckIn: {
                title: "Manual Check-In",
                type: "callback",
                buttonText: "Check-In",
                callback: () => this.dailyCheckIn()
            }
        }, this.translation = {
            zh_CN: {
                "Refresh Domain List": "刷新域名列表",
                Refresh: "刷新",
                "Refresh Domain List on Startup": "启动时刷新域名列表",
                "Api Domain": "Api域名",
                "Image Stream": "图片分流",
                "Favorite Order": "收藏夹排序",
                "Daily Check-in Task": "每日自动签到",
                "Manual Check-In": "手动签到",
                "Check-In": "签到",
                "Add Time": "添加时间",
                "Update Time": "更新时间",
                All: "全部",
                Author: "作者",
                Tag: "标签",
                Work: "作品",
                Actor: "角色",
                View: "浏览量"
            },
            zh_TW: {
                "Refresh Domain List": "刷新域名列表",
                Refresh: "刷新",
                "Refresh Domain List on Startup": "啟動時刷新域名列表",
                "Api Domain": "Api域名",
                "Image Stream": "圖片分流",
                "Favorite Order": "收藏夾排序",
                "Daily Check-in Task": "每日自動簽到",
                "Manual Check-In": "手動簽到",
                "Check-In": "簽到",
                "Add Time": "添加時間",
                "Update Time": "更新時間",
                All: "全部",
                Author: "作者",
                Tag: "標籤",
                Work: "作品",
                Actor: "角色",
                View: "瀏覽量"
            }
        };
    }
    get ua() {
        return JM.ua;
    }
    get baseUrl() {
        let e = parseInt(this.loadSetting("apiDomain")) - 1;
        return `https://${JM.apiDomains[e]}`;
    }
    get imageUrl() {
        return JM.imageUrl;
    }
    overwriteApiDomains(e) {
        0 != e.length && (JM.apiDomains = e);
    }
    overwriteImgUrl(e) {
        0 != e.length && (JM.imageUrl = e);
    }
    isNum(e) {
        return /^\d+$/.test(e);
    }
    get baseHeaders() {
        return {
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Connection: "keep-alive",
            Origin: "https://localhost",
            Referer: "https://localhost/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "X-Requested-With": JM.jmPkgName
        };
    }
    getApiHeaders(e) {
        this.loadSetting("dailyCheckInTask") && this.dailyCheckIn(!0);
        let t = Convert.md5(Convert.encodeUtf8(`${e}18comicAPPContent`));
        return {
            ...this.baseHeaders,
            Authorization: "Bearer",
            "Sec-Fetch-Storage-Access": "active",
            token: Convert.hexEncode(t),
            tokenparam: `${e},${JM.jmVersion}`,
            "User-Agent": this.ua
        };
    }
    getImgHeaders() {
        return {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Connection: "keep-alive",
            Referer: "https://localhost/",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Storage-Access": "active",
            "User-Agent": this.ua,
            "X-Requested-With": JM.jmPkgName
        };
    }
    getCoverUrl(e) {
        return `${this.imageUrl}/media/albums/${e}_3x4.jpg`;
    }
    getImageUrl(e, t) {
        return `${this.imageUrl}/media/photos/${e}/${t}`;
    }
    getAvatarUrl(e) {
        return `${this.imageUrl}/media/users/${e}`;
    }
    async init() {
        this.loadSetting("refreshDomainsOnStart") && await this.refreshApiDomains(!1), this.refreshImgUrl(!1);
    }
    async refreshApiDomains(e) {
        let t = "", a = "", i = [], r = [], s = null;
        try {
            s = await fetch("https://rup4a04-c02.tos-cn-hongkong.bytepluses.com/newsvr-2025.txt", {
                headers: this.baseHeaders
            });
        } catch (e) {
            s = null;
        }
        if (s && 200 === s.status) {
            let e = this.convertData(await s.text(), "diosfjckwpqpdfjkvnqQjsik"), r = JSON.parse(e);
            r.Server && (t = "Update Success", a = "\n", i = r.Server.slice(0, 4));
        }
        0 === i.length && (t = "Update Failed", a = "Using built-in domains:\n\n", i = JM.fallbackServers);
        for (let e = 0; e < i.length; e++) a += `線路${e + 1}:  ${i[e]}\n\n`, r.push(i[e]);
        e ? UI.showDialog(t, a, [ {
            text: "Cancel",
            callback: () => {}
        }, {
            text: "Apply",
            callback: () => {
                this.overwriteApiDomains(r), this.refreshImgUrl(!0);
            }
        } ]) : this.overwriteApiDomains(r);
    }
    async refreshImgUrl(e) {
        let t = this.loadSetting("imageStream"), a = await this.get(`${this.baseUrl}/setting?app_img_shunt=${t}&express=`), i = JSON.parse(a);
        i.img_host && (e && UI.showMessage(`Image Stream ${t}:\n${i.img_host}`), this.overwriteImgUrl(i.img_host));
    }
    parseComic(e) {
        var t;
        let a = e.id.toString(), i = e.author, r = e.name, s = null != (t = e.description) ? t : "", o = this.getCoverUrl(a), n = [];
        return e.category.title && n.push(e.category.title), e.category_sub.title && n.push(e.category_sub.title),
        new Comic({
            id: a,
            title: r,
            subTitle: i,
            cover: o,
            tags: n,
            description: s
        });
    }
    convertData(e, t) {
        let a = Convert.encodeUtf8(Convert.hexEncode(Convert.md5(Convert.encodeUtf8(t)))), i = Convert.decodeBase64(e), r = Convert.decryptAesEcb(i, a), s = Convert.decodeUtf8(r), o = 0;
        for (;o < s.length && "{" !== s[o] && "[" !== s[o]; ) o++;
        let n = s.length - 1;
        for (;n > o && "}" !== s[n] && "]" !== s[n]; ) n--;
        return s.substring(o, n + 1);
    }
    async get(e) {
        let t = Math.floor(Date.now() / 1e3), a = await Network.get(e, this.getApiHeaders(t));
        if (200 !== a.status) {
            if (401 === a.status) {
                let e = JSON.parse(a.body).errorMsg;
                if ("請先登入會員" === e && this.isLogged) throw "Login expired";
                throw null != e ? e : "Invalid Status Code: " + a.status;
            }
            throw "Invalid Status Code: " + a.status;
        }
        let i = JSON.parse(a.body).data;
        if ("string" != typeof i) throw "Invalid Data";
        return this.convertData(i, `${t}185Hcomic3PAPP7R`);
    }
    async post(e, t) {
        let a = Math.floor(Date.now() / 1e3), i = await Network.post(e, {
            ...this.getApiHeaders(a),
            "Content-Type": "application/x-www-form-urlencoded"
        }, t);
        if (200 !== i.status) {
            if (401 === i.status) {
                let e = JSON.parse(i.body).errorMsg;
                if ("請先登入會員" === e && this.isLogged) throw "Login expired";
                throw null != e ? e : "Invalid Status Code: " + i.status;
            }
            throw "Invalid Status Code: " + i.status;
        }
        let r = JSON.parse(i.body).data;
        if ("string" != typeof r) throw "Invalid Data";
        return this.convertData(r, `${a}185Hcomic3PAPP7R`);
    }
    async dailyCheckIn(e = !1) {
        if (this.dailyCheckInInProgress) return;
        this.dailyCheckInInProgress = !0;
        const t = e => {
            throw UI.showMessage(e), e;
        };
        try {
            const a = this.loadData("lastCheckInDate"), i = (new Date).toLocaleDateString("zh-CN");
            if (a && a === i) {
                if (e) return;
                t("Already checked in today");
            }
            if (!this.isLogged) {
                if (e) return;
                t("Please login to check-in");
            }
            const r = this.loadData("uid");
            r || t("Invalid uid, please login again");
            const s = await this.get(`${this.baseUrl}/daily?user_id=${r}`), o = JSON.parse(s);
            "daily_id" in o || t("Invalid daily_id, check-in failed");
            const n = o.daily_id, l = await this.post(`${this.baseUrl}/daily_chk`, `user_id=${r}&daily_id=${n}`), c = JSON.parse(l);
            c.msg || t("Invalid check-in result, check-in failed"), UI.showMessage(c.msg), this.saveData("lastCheckInDate", i);
        } finally {
            this.dailyCheckInInProgress = !1;
        }
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
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${r}/${s}@${o}`;
    const c = n ? `${n}/${l}` : l;
    return `${i}/${r}/${s}@${o}/${l.startsWith(`${n}/`) ? l : c}`;
}

JM.jmVersion = "2.0.16", JM.jmPkgName = "com.example.app", JM.fallbackServers = [ "www.cdntwice.org", "www.cdnsha.org", "www.cdnaspa.cc", "www.cdnntr.cc" ],
JM.imageUrl = "https://cdn-msp.jmapinodeudzn.net", JM.ua = "Mozilla/5.0 (Linux; Android 10; K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36";

"use strict";
