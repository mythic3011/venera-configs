class CCC extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "CCC追漫台", this.key = "ccc", this.version = "1.0.1", this.minAppVersion = "1.6.0",
        this.url = resolvePluginUpdateUrl("ccc.js"), this.apiUrl = "https://api.creative-comic.tw",
        this.account = {
            login: async (e, t) => {
                let a = await Network.get(`${this.apiUrl}/recaptcha#${randomInt(0, 999)}`, await this.getApiHeaders(!0));
                const o = JSON.parse(a.body);
                if ("ok" != o.message) throw "登錄失敗";
                const i = await UI.showInputDialog("驗證碼", null, this.base64ToArrayBuffer(o.result.img));
                return a = await Network.post(`${this.apiUrl}/token`, await this.getApiHeaders(!0), {
                    grant_type: "password",
                    client_id: "2",
                    client_secret: "9eAhsCX3VWtyqTmkUo5EEaoH4MNPxrn6ZRwse7tE",
                    username: e,
                    password: t,
                    key: o.result.key,
                    captcha: i
                }), this.processToken(a.body), "ok";
            },
            loginWithWebview: {
                url: "https://www.creative-comic.tw/zh/login",
                checkStatus: (e, t) => "CCC追漫台" == t,
                onLoginSuccess: () => {
                    const e = this.loadData("_localStorage");
                    if (e) {
                        const t = e.accessToken;
                        let a = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
                        a += "=".repeat((4 - a.length % 4) % 4);
                        const o = decodeURIComponent(Convert.decodeUtf8(Convert.decodeBase64(a)).split("").map(e => "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2)).join(""));
                        this.saveData("expireTime", JSON.parse(o).exp), this.saveData("refreshToken", e.refreshToken),
                        this.saveData("token", t);
                    }
                }
            },
            logout: () => {
                this.deleteData("expireTime"), this.deleteData("refreshToken"), this.deleteData("token");
            },
            registerWebsite: "https://www.creative-comic.tw/zh/signup"
        }, this.explore = [ {
            title: "CCC追漫台",
            type: "singlePageWithMultiPart",
            load: async () => {
                const e = await Network.get(`${this.apiUrl}/public/home_v2`, await this.getApiHeaders()), t = {}, a = JSON.parse(e.body).data;
                let o = null;
                for (let e of a.templates) {
                    if (-1 != [ 4, 5 ].indexOf(e.type)) continue;
                    const a = [];
                    for (let t of e.list) {
                        var i, r;
                        a.push({
                            id: t.value,
                            title: t.name,
                            cover: null != (i = null != (r = t.image1) ? r : t.image2) ? i : t.image3,
                            tags: [ t.book_type.name ],
                            subtitle: t.brief
                        });
                    }
                    e.title ? (o = e.title, t[o] = a) : t[o] = t[o].concat(a);
                }
                return t;
            }
        } ], this.category = {
            title: "CCC追漫台",
            parts: [ {
                name: "CCC追漫台",
                type: "fixed",
                categories: [ "排行榜" ],
                itemType: "category",
                categoryParams: [ "top" ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, a, o) => {
                null == a && (a = [ "", "read" ]);
                const i = a[0] ? `&type=${a[0]}` : "", r = `${this.apiUrl}/rank?page=${o}&rows_per_page=20&rank=${a[1]}&class=2${i}`;
                return await this.parseComics(r);
            },
            optionList: [ {
                label: "分類",
                options: [ "-全部", "2-劇情", "6-愛情", "5-青春成長", "3-幽默搞笑", "10-歷史古裝", "7-奇幻架空", "4-溫馨療癒", "9-冒險動作", "8-恐怖驚悚", "12-新感覺推薦", "11-推理懸疑", "13-活動" ]
            }, {
                label: "排行榜",
                options: [ "read-人氣榜", "buy-銷售榜", "donate-斗内榜", "collect-收藏榜" ]
            } ]
        }, this.search = {
            load: async (e, t, a) => {
                t[0] = "&sort_by=" + t[0], t[1] && (t[1] = "&type=" + t[1]), t[2] && (t[2] = "&serial=" + t[2]),
                t[3] && (t[3] = "&updated_at=" + t[3]), t[4] && (t[4] = "&literature_form=" + t[4]),
                t[5] && (t[5] = "&comic_type=" + t[5]), t[6] && (t[6] = "&publisher=" + t[6]);
                const o = `https://api.creative-comic.tw/book?page=${a}&rows_per_page=20&keyword=${e}&class=2${t.join("")}`;
                return await this.parseComics(o);
            },
            optionList: [ {
                type: "select",
                options: [ "updated_at-最新", "read_count-閲覽", "like_count-推薦", "collect_count-收藏" ],
                label: "排序"
            }, {
                type: "select",
                options: [ "-全部", "2-劇情", "6-愛情", "5-青春成長", "3-幽默搞笑", "10-歷史古裝", "7-奇幻架空", "4-溫馨療癒", "9-冒險動作", "8-恐怖驚悚", "12-新感覺推薦", "11-推理懸疑", "13-活動" ],
                label: "分類"
            }, {
                type: "select",
                options: [ "-全部", "2-已完結", "0-連載中" ],
                label: "連載狀態"
            }, {
                type: "select",
                options: [ "-全部", "month-本月", "week-本周" ],
                label: "更新日期"
            }, {
                type: "select",
                options: [ "-全部", "1-短篇", "2-中篇", "3-長篇" ],
                label: "作品篇幅"
            }, {
                type: "select",
                options: [ "-全部", "3-條漫", "2-格漫" ],
                label: "作品形式"
            }, {
                type: "dropdown",
                options: [ "-全部", "44-MOJOIN", "37-目宿媒體股份有限公司", "4-大辣出版", "18-MarsCat火星貓科技", "2-CCC創作集", "23-海穹文化", "11-國立歷史博物館", "6-未來數位", "34-虎尾建國眷村再造協會", "24-鏡文學股份有限公司", "43-Taiwan Comic City", "42-聯經出版事業股份有限公司", "48-東立出版社有限公司", "9-留守番工作室", "16-獨步文化", "21-尖端媒體集團", "29-相之丘tōkhiu books", "7-威向文化", "54-白範出版工作室", "22-時報文化出版企業股份有限公司", "20-國立臺灣工藝研究發展中心", "17-獨立出版", "51-大寬文化工作室", "32-金繪國際有限公司", "47-前衛出版社", "36-奇異果文創", "14-綺影映畫", "53-彰化縣政府", "31-艾德萊娛樂", "8-特有生物研究保育中心", "39-聚場文化", "38-XPG", "52-陌上商行有限公司", "49-國際合製｜臺漫新視界", "40-KADOKAWA", "10-國立臺灣美術館", "26-金漫獎", "5-台灣東販", "45-國立國父紀念館", "35-國立臺灣歷史博物館", "15-蓋亞文化", "1-長鴻出版社", "19-柒拾陸號原子", "33-台灣角川", "28-一顆星工作室", "46-好人出版", "27-澄波藝術文化股份有限公司", "12-黑白文化", "13-慢工文化 Slowork Publishing", "30-經濟部智慧財產局", "50-Contents Lab. Blue TOKYO", "3-大塊文化", "25-目色出版", "41-文化內容策進院" ],
                label: "出版社"
            } ]
        }, this.favorites = {
            multiFolder: !1,
            addOrDelFavorite: async (e, t, a, o) => {
                if (!this.isLogged) throw "請先登錄";
                const i = await Network.put(`${this.apiUrl}/book/${e}/collect`, await this.getApiHeaders(), {
                    is_collected: a
                });
                if ("ok" != JSON.parse(i.body).message) throw (a ? "添加" : "移除") + "收藏失敗";
                return "ok";
            },
            loadComics: async (e, t) => this.parseComics(`${this.apiUrl}/bookcase/collections?page=${e}&rows_per_page=20&sort_by=updated_at&class=2`),
            singleFolderForSingleComic: !0
        }, this.comic = {
            freeRead: e => {
                let t = !0;
                return e.is_free || 0 != e.sales_plan && (!e.is_coin_buy && !e.is_point_buy || e.is_buy || !e.is_coin_rent && !e.is_point_rent || e.is_rent || (t = !1)),
                t;
            },
            loadInfo: async e => {
                var t, a;
                const o = await Network.get(`${this.apiUrl}/book/${e}/info`, await this.getApiHeaders()), i = JSON.parse(o.body).data, r = [];
                for (let e of i.author) r.push(e.name);
                const s = [];
                for (let e of i.tags) s.push(e.name);
                const n = await Network.get(`${this.apiUrl}/book/${e}/chapter`, await this.getApiHeaders()), l = JSON.parse(n.body).data, c = {};
                for (let e of l.chapters) c[e.id.toString()] = `${this.comic.freeRead(e) ? "" : "[付費]"}${e.vol_name}-${e.name}`;
                const p = await Network.get(`${this.apiUrl}/book/${e}/recommend`, await this.getApiHeaders()), d = JSON.parse(p.body).data, h = [];
                for (let e of d.hot) {
                    var u, m;
                    h.push({
                        title: e.name,
                        cover: null != (u = null != (m = e.image1) ? m : e.image2) ? u : e.image3,
                        id: e.id.toString(),
                        subtitle: e.brief
                    });
                }
                for (let e of d.history) {
                    var g, f;
                    h.push({
                        title: e.name,
                        cover: null != (g = null != (f = e.image1) ? f : e.image2) ? g : e.image3,
                        id: e.id.toString()
                    });
                }
                for (let e of d.also_buy) {
                    var _, y;
                    h.push({
                        title: e.name,
                        cover: null != (_ = null != (y = e.image1) ? y : e.image2) ? _ : e.image3,
                        id: e.id.toString()
                    });
                }
                return new ComicDetails({
                    title: i.name,
                    subtitle: i.brief,
                    cover: null != (t = null != (a = i.image1) ? a : i.image2) ? t : i.image3,
                    description: i.description,
                    likesCount: i.like_count_only_uuid,
                    chapters: c,
                    tags: {
                        作者: r,
                        分類: [ i.type.name ],
                        標籤: s
                    },
                    isFavorite: 1 == i.is_collected,
                    updateTime: i.updated_at,
                    recommend: h
                });
            },
            loadEp: async (e, t) => {
                const a = await Network.get(`${this.apiUrl}/book/chapter/${t}`, await this.getApiHeaders());
                if (403 == a.status) return UI.showDialog("提示", "該章節需付費后閲讀", [ {
                    text: "取消",
                    callback: () => {}
                }, {
                    text: "去購買",
                    callback: () => {
                        UI.launchUrl(`https://www.creative-comic.tw/zh/book/${e}/content`);
                    }
                } ]), {
                    images: []
                };
                const o = JSON.parse(a.body).data, i = [];
                for (let e of o.chapter.proportion) i.push(e.id.toString());
                return {
                    images: i
                };
            },
            onImageLoad: async (e, t, a) => {
                const o = await Network.get(`${this.apiUrl}/book/chapter/image/${e}`, await this.getApiHeaders()), i = Convert.decodeBase64(JSON.parse(o.body).data.key);
                let r = this.loadData("token");
                null == r && (r = "freeforccc2020reading");
                const s = Convert.sha512(Convert.encodeUtf8(r)), n = s.slice(0, 32), l = s.slice(15, 31), c = new Uint8Array(Convert.decryptAesCbc(i, n, l)), p = c[c.length - 1], [d, h] = Convert.decodeUtf8(c.slice(0, c.length - p).buffer).split(":");
                return {
                    url: `https://storage.googleapis.com/ccc-www/fs/chapter_content/encrypt/${e}/2`,
                    onResponse: function(e) {
                        function t(e) {
                            if (e.length % 2 != 0) throw new Error("Invalid hex string");
                            const t = new Uint8Array(e.length / 2);
                            for (let a = 0; a < e.length; a += 2) t[a / 2] = parseInt(e.substr(a, 2), 16);
                            return t.buffer;
                        }
                        const a = new Uint8Array(Convert.decryptAesCbc(e, t(d), t(h))), o = a[a.length - 1], i = Convert.decodeUtf8(a.slice(0, a.length - o).buffer), r = i.split(",")[1] || i;
                        return Convert.decodeBase64(r);
                    }
                };
            },
            loadComments: async (e, t, a, o) => {
                const i = await Network.get(`${this.apiUrl}/book/${e}/reply?page=${a}&rows_per_page=20&sort_by=created_at&descending=true#${randomInt(0, 999)}`, await this.getApiHeaders()), r = JSON.parse(i.body).data;
                let s = 0;
                const n = [];
                if (o) {
                    for (let e of r.data) if (e.id.toString() == o) {
                        for (let t of e.replies) n.push({
                            userName: t.member.name ? t.member.name : t.member.nickname,
                            avatar: t.member.avatar,
                            content: t.content,
                            time: t.created_at,
                            id: t.id.toString(),
                            isLiked: 1 == t.is_like
                        });
                        break;
                    }
                } else {
                    for (let e of r.data) n.push({
                        userName: e.member.name ? e.member.name : e.member.nickname,
                        avatar: e.member.avatar,
                        content: e.content,
                        time: e.created_at,
                        replyCount: e.reply_count,
                        id: e.id.toString(),
                        isLiked: 1 == e.is_like,
                        score: e.like_count
                    });
                    s = Math.ceil(r.total / 20);
                }
                return {
                    comments: n,
                    maxPage: s
                };
            },
            sendComment: async (e, t, a, o) => {
                if (!this.isLogged) throw "請先登錄";
                let i = null;
                i = o ? `${this.apiUrl}/book/reply/${o}/reply` : `${this.apiUrl}/book/${e}/reply`;
                const r = "----geckoformboundary" + Math.random().toString(16).replace(".", "a") + Math.random().toString(16).replace(".", "a"), s = `--${r}\r\nContent-Disposition: form-data; name="content"\r\n\r\n${a}\r\n--${r}\r\nContent-Disposition: form-data; name="is_spoiled"\r\n\r\n0\r\n--${r}--\r\n`, n = await this.getApiHeaders();
                n["Content-Type"] = `multipart/form-data; boundary=${r}`;
                const l = await Network.post(i, n, s);
                if ("ok" != JSON.parse(l.body).message) throw "評論失敗";
                return "ok";
            },
            likeComment: async (e, t, a, o) => {
                if (a.endsWith("@")) throw "不支持點贊";
                const i = await Network.put(`${this.apiUrl}/book/reply/${a.split("@")[0]}/like`, await this.getApiHeaders(), {
                    is_like: o ? 1 : 0
                });
                if ("ok" != JSON.parse(i.body).message) throw "點贊失敗";
                return "ok";
            },
            onClickTag: (e, t) => ({
                action: "search",
                keyword: t
            })
        };
    }
    processToken(e) {
        const t = JSON.parse(e);
        if (0 != t.code) throw "登錄失敗";
        this.saveData("expireTime", Math.floor(Date.now() / 1e3) + t.expires_in), this.saveData("refreshToken", t.refresh_token),
        this.saveData("token", t.access_token);
    }
    async getApiHeaders(e = !1) {
        let t = this.loadData("token");
        if (!e && t) {
            if (Math.floor(Date.now() / 1e3) > this.loadData("expireTime")) {
                const e = await Network.post(`${this.apiUrl}/token`, {
                    device: "web_desktop",
                    uuid: "null"
                }, {
                    grant_type: "refresh_token",
                    client_id: "2",
                    client_secret: "9eAhsCX3VWtyqTmkUo5EEaoH4MNPxrn6ZRwse7tE",
                    refresh_token: this.loadData("refreshToken")
                });
                if (-1 == e.body.search("Token has been revoked")) this.processToken(e.body); else {
                    const e = this.loadData("account");
                    if (!e) throw "請重新登錄";
                    await this.account.login(e[0], e[1]);
                }
                t = this.loadData("token");
            }
            return {
                device: "web_desktop",
                Authorization: `Bearer ${t}`
            };
        }
        return {
            device: "web_desktop",
            uuid: "null"
        };
    }
    base64ToArrayBuffer(e) {
        const t = e.split(",")[1] || e;
        return Convert.decodeBase64(t);
    }
    async parseComics(e) {
        const t = await Network.get(e, await this.getApiHeaders()), a = [], o = JSON.parse(t.body).data;
        for (let e of o.data) {
            var i, r;
            const t = [];
            for (let a of e.author) t.push(a.name);
            "object" == typeof e.type && t.push(e.type.name), a.push({
                id: ("book_id" in e ? e.book_id : e.id).toString(),
                title: e.name,
                subtitle: e.brief,
                description: e.description,
                cover: null != (i = null != (r = e.image1) ? r : e.image2) ? i : e.image3,
                tags: t
            });
        }
        return {
            comics: a,
            maxPage: Math.ceil(o.total / 20)
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const o = String(null == e ? "" : e).trim() || t;
    return a ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), s = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${o}/${i}/${r}@${s}`;
    const c = n ? `${n}/${l}` : l;
    return `${o}/${i}/${r}@${s}/${l.startsWith(`${n}/`) ? l : c}`;
}

"use strict";
