class HComic extends ComicSource {
    constructor(...t) {
        super(...t), this.name = "H-Comic", this.key = "hcomic", this.version = "1.0.0",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("hcomic.js"), this.baseUrl = "https://h-comic.com",
        this.explore = [ {
            title: "h-comic",
            type: "multiPartPage",
            load: async t => {
                let a = await this.getHtml(this.baseUrl), e = this.extractData(a);
                return e && e.comics ? [ {
                    title: "随机漫画",
                    comics: e.comics.map(t => this.parseComic(t))
                } ] : [];
            }
        } ], this.category = {
            title: "H-Comic",
            parts: [ {
                name: "热门TAG",
                type: "fixed",
                categories: [ {
                    label: "全部",
                    target: {
                        page: "category",
                        attributes: {
                            category: "全部"
                        }
                    }
                }, {
                    label: "全彩",
                    target: {
                        page: "category",
                        attributes: {
                            category: "全彩",
                            param: "全彩"
                        }
                    }
                }, {
                    label: "無修正",
                    target: {
                        page: "category",
                        attributes: {
                            category: "無修正",
                            param: "無修正"
                        }
                    }
                }, {
                    label: "蘿莉",
                    target: {
                        page: "category",
                        attributes: {
                            category: "蘿莉",
                            param: "蘿莉"
                        }
                    }
                }, {
                    label: "制服",
                    target: {
                        page: "category",
                        attributes: {
                            category: "制服",
                            param: "制服"
                        }
                    }
                }, {
                    label: "巨乳",
                    target: {
                        page: "category",
                        attributes: {
                            category: "巨乳",
                            param: "巨乳"
                        }
                    }
                }, {
                    label: "黑絲 / 白襪",
                    target: {
                        page: "category",
                        attributes: {
                            category: "黑絲 / 白襪",
                            param: "黑絲 / 白襪"
                        }
                    }
                }, {
                    label: "NTR",
                    target: {
                        page: "category",
                        attributes: {
                            category: "NTR",
                            param: "netorare"
                        }
                    }
                }, {
                    label: "足交 / 腳交",
                    target: {
                        page: "category",
                        attributes: {
                            category: "足交 / 腳交",
                            param: "footjob"
                        }
                    }
                }, {
                    label: "女學生",
                    target: {
                        page: "category",
                        attributes: {
                            category: "女學生",
                            param: "女學生"
                        }
                    }
                }, {
                    label: "眼鏡控",
                    target: {
                        page: "category",
                        attributes: {
                            category: "眼鏡控",
                            param: "眼鏡控"
                        }
                    }
                }, {
                    label: "口交",
                    target: {
                        page: "category",
                        attributes: {
                            category: "口交",
                            param: "口交"
                        }
                    }
                }, {
                    label: "正太控",
                    target: {
                        page: "category",
                        attributes: {
                            category: "正太控",
                            param: "正太控"
                        }
                    }
                }, {
                    label: "年上",
                    target: {
                        page: "category",
                        attributes: {
                            category: "年上",
                            param: "年上"
                        }
                    }
                }, {
                    label: "亂倫",
                    target: {
                        page: "category",
                        attributes: {
                            category: "亂倫",
                            param: "亂倫"
                        }
                    }
                }, {
                    label: "熟女 / 人妻",
                    target: {
                        page: "category",
                        attributes: {
                            category: "熟女 / 人妻",
                            param: "熟女 / 人妻"
                        }
                    }
                }, {
                    label: "同志 BL",
                    target: {
                        page: "category",
                        attributes: {
                            category: "同志 BL",
                            param: "同志 BL"
                        }
                    }
                }, {
                    label: "黑肉",
                    target: {
                        page: "category",
                        attributes: {
                            category: "黑肉",
                            param: "黑肉"
                        }
                    }
                }, {
                    label: "泳裝",
                    target: {
                        page: "category",
                        attributes: {
                            category: "泳裝",
                            param: "泳裝"
                        }
                    }
                }, {
                    label: "手淫",
                    target: {
                        page: "category",
                        attributes: {
                            category: "手淫",
                            param: "手淫"
                        }
                    }
                }, {
                    label: "肌肉",
                    target: {
                        page: "category",
                        attributes: {
                            category: "肌肉",
                            param: "肌肉"
                        }
                    }
                }, {
                    label: "姐姐 / 妹妹",
                    target: {
                        page: "category",
                        attributes: {
                            category: "姐姐 / 妹妹",
                            param: "姐姐 / 妹妹"
                        }
                    }
                }, {
                    label: "捆綁",
                    target: {
                        page: "category",
                        attributes: {
                            category: "捆綁",
                            param: "捆綁"
                        }
                    }
                }, {
                    label: "調教",
                    target: {
                        page: "category",
                        attributes: {
                            category: "調教",
                            param: "調教"
                        }
                    }
                }, {
                    label: "催眠",
                    target: {
                        page: "category",
                        attributes: {
                            category: "催眠",
                            param: "催眠"
                        }
                    }
                }, {
                    label: "露出",
                    target: {
                        page: "category",
                        attributes: {
                            category: "露出",
                            param: "露出"
                        }
                    }
                }, {
                    label: "群交",
                    target: {
                        page: "category",
                        attributes: {
                            category: "群交",
                            param: "群交"
                        }
                    }
                }, {
                    label: "肛交",
                    target: {
                        page: "category",
                        attributes: {
                            category: "肛交",
                            param: "肛交"
                        }
                    }
                }, {
                    label: "獸交",
                    target: {
                        page: "category",
                        attributes: {
                            category: "獸交",
                            param: "獸交"
                        }
                    }
                } ]
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (t, a, e, r) => {
                let i = e[0], o = "random" === i ? "/random" : "/", l = `${this.baseUrl}${o}?page=${r}&q=`;
                l += a ? `&tag=${encodeURIComponent(a)}` : "&tag=";
                let c = await this.getHtml(l), s = this.extractData(c), g = "random" === i ? null : this.extractMaxPage(c);
                return s && s.comics ? {
                    comics: s.comics.map(t => this.parseComic(t)),
                    maxPage: g
                } : {
                    comics: [],
                    maxPage: r
                };
            },
            optionList: [ {
                options: [ "latest-最近更新", "random-随机刷新" ]
            } ],
            ranking: {
                options: [],
                load: async (t, a) => ({
                    comics: [],
                    maxPage: 0
                })
            }
        }, this.search = {
            load: async (t, a, e) => {
                let r = `${this.baseUrl}/?q=${encodeURIComponent(t)}&tag=&page=${e}`, i = await this.getHtml(r), o = this.extractData(i), l = this.extractMaxPage(i);
                return o && o.comics ? {
                    comics: o.comics.map(t => this.parseComic(t)),
                    maxPage: l
                } : {
                    comics: [],
                    maxPage: e
                };
            },
            optionList: [],
            enableTagsSuggestions: !1
        }, this.comic = {
            loadInfo: async t => {
                let a = t, e = "view";
                if (t.includes("|")) {
                    let r = t.split("|");
                    a = r[0], e = r.slice(1).join("|");
                }
                let r = `${this.baseUrl}/comics/${encodeURIComponent(e)}/1?id=${a}`, i = await this.getHtml(r), o = this.extractData(i);
                if (!o || !o.comic) throw "Failed to load comic info";
                let l = o.comic, c = l.title.display || l.title.pretty || l.title.japanese, s = l.title.english, g = l.thumbnail;
                !g && l.comic_source && l.media_id && (g = `https://h-comic.link/api/${l.comic_source}/${l.media_id}/pages/1`);
                let n = {};
                l.tags && (n["标签"] = l.tags.map(t => t.name_zh || t.name));
                let p = null;
                if (l.upload_date) {
                    let t = new Date(1e3 * l.upload_date).toISOString().split("T")[0];
                    n["日期"] = [ t ], p = t;
                }
                let m = l.title.japanese || "", u = `${l.comic_source}|${l.media_id}|${l.num_pages}`, y = new Map, b = new Map;
                return b.set(u, "全一话"), y.set("章节", b), new ComicDetails({
                    title: c,
                    subTitle: s,
                    cover: g,
                    description: m,
                    tags: n,
                    chapters: y,
                    updateTime: p
                });
            },
            loadEp: async (t, a) => {
                let e = a.split("|"), r = e[0], i = e[1], o = parseInt(e[2]), l = [];
                for (let t = 1; t <= o; t++) l.push(`https://h-comic.link/api/${r}/${i}/pages/${t}`);
                return {
                    images: l
                };
            },
            onClickTag: (t, a) => ({
                page: "category",
                attributes: {
                    category: "tag",
                    param: a
                }
            }),
            link: {
                domains: [ "h-comic.com" ],
                linkToId: t => {
                    let a = t.match(/id=(\d+)/), e = t.match(/\/comics\/([^/]+)/);
                    return a ? `${a[1]}|${e ? decodeURIComponent(e[1]) : "view"}` : null;
                }
            },
            enableTagsTranslate: !1
        };
    }
    init() {}
    async getHtml(t) {
        let a = await Network.get(t, {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        });
        if (200 !== a.status) throw `Invalid status: ${a.status}`;
        return a.body;
    }
    extractData(t) {
        let a = t.match(/data:\s*\[null,\s*(\{[\s\S]*?\})\s*\]\s*,\s*form:/);
        if (a) {
            let t = a[1];
            try {
                let a = t.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
                return JSON.parse(a).data;
            } catch (t) {
                return console.error("Failed to parse JSON", t), null;
            }
        }
        return null;
    }
    extractMaxPage(t) {
        let a = t.match(/name="page"[^>]*max="(\d+)"/);
        return a ? parseInt(a[1]) : 1;
    }
    parseComic(t) {
        let a = t.title.display || t.title.pretty || t.title.japanese, e = t.tags ? t.tags.map(t => t.name_zh || t.name) : [], r = null;
        if (t.upload_date) {
            let a = new Date(1e3 * t.upload_date).toISOString().split("T")[0];
            e.push(a), r = a;
        }
        return new Comic({
            id: `${t.id}|${a}`,
            title: a,
            subTitle: t.title.english,
            cover: t.thumbnail,
            tags: e,
            description: "",
            updateTime: r
        });
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(t, a, e) {
    const r = String(null == t ? "" : t).trim() || a;
    return e ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(t) {
    const a = __veneraGetRuntimeGlobal(), e = a.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof a.__VENERA_RELEASE_AUTHORITY__ ? a.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(e.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(e.providerPath, "gh", !0), o = __veneraNormalizeAuthorityPart(e.repository, "mythic3011/venera-configs", !0), l = __veneraNormalizeAuthorityPart(e.releaseRef, "main", !1), c = __veneraNormalizeAuthorityPart(e.artifactPathPrefix, "dist/plugins", !0), s = String(t || "").replace(/^\/+/, "");
    if (!s) return `${r}/${i}/${o}@${l}`;
    const g = c ? `${c}/${s}` : s;
    return `${r}/${i}/${o}@${l}/${s.startsWith(`${c}/`) ? s : g}`;
}

"use strict";
