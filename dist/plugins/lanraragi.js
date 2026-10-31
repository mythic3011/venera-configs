class Lanraragi extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Lanraragi", this.key = "lanraragi", this.version = "1.2.1",
        this.minAppVersion = "1.4.0", this.url = resolvePluginUpdateUrl("lanraragi.js"),
        this.settings = {
            api: {
                title: "API",
                type: "input",
                default: "http://lrr.tvc-16.science"
            },
            apiKey: {
                title: "APIKEY",
                type: "input",
                default: ""
            }
        }, this.account = {
            loginWithCookies: {
                fields: [ "apiKey" ],
                validate: function(e) {
                    var t = e && e.length > 0 ? e[0] : "";
                    return !!(t && t.length > 0);
                }
            },
            logout: function() {
                this.deleteData("account");
            }
        }, this.explore = [ {
            title: "Lanraragi",
            type: "multiPageComicList",
            load: async (e = 1) => {
                const t = createOffsetSearchLoader({
                    path: LRR_ROUTES.searchPath,
                    getOffsetKey: () => "explore_start",
                    buildQuery: (e, t) => ({
                        sortby: "date_added",
                        order: "desc",
                        start: String(t)
                    }),
                    mapComic: (e, t) => this._mapArchiveComic(e, t.base)
                }), r = await t(this, {
                    page: e
                });
                return {
                    comics: r.comics,
                    maxPage: r.maxPage
                };
            }
        } ], this.category = {
            title: "Lanraragi",
            parts: [ {
                name: "ALL",
                type: "dynamic",
                loader: () => {
                    const e = this.loadData("categories");
                    if (!Array.isArray(e) || 0 === e.length) throw "Please check your API settings or categories.";
                    const t = [];
                    for (const s of e) {
                        var r, o, a;
                        if (!s) continue;
                        const e = null != (r = null != (o = s.id) ? o : s._id) ? r : s.name, i = null != (a = s.name) ? a : String(e);
                        try {
                            t.push({
                                label: i,
                                target: new PageJumpTarget({
                                    page: "category",
                                    attributes: {
                                        category: e,
                                        param: null
                                    }
                                })
                            });
                        } catch (r) {
                            t.push({
                                label: i,
                                target: {
                                    page: "category",
                                    attributes: {
                                        category: e,
                                        param: null
                                    }
                                }
                            });
                        }
                    }
                    return t;
                }
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, t, r, o) => {
                const a = createOffsetSearchLoader({
                    path: LRR_ROUTES.searchPath,
                    getOffsetKey: e => `category_start_${String(e.category || "")}`,
                    buildQuery: (e, t) => ({
                        category: e.category || "",
                        sortby: "date_added",
                        order: "desc",
                        start: String(t)
                    }),
                    mapComic: (e, t) => this._mapArchiveComic(e, t.base)
                }), s = await a(this, {
                    page: o,
                    category: e
                });
                return {
                    comics: s.comics,
                    maxPage: s.maxPage
                };
            }
        }, this.search = {
            load: async (e, t, r = 1) => {
                const o = e => t && t[e], a = lrrChoice(o(0), "title", LRR_SORT_KEYS), s = lrrChoice(o(1), "asc", LRR_ORDERS), i = lrrChoice(o(2), "false", LRR_BOOLS), n = lrrChoice(o(3), "false", LRR_BOOLS), l = lrrChoice(o(4), "true", LRR_BOOLS), c = createOffsetSearchLoader({
                    path: LRR_ROUTES.searchPath,
                    getOffsetKey: e => `search_start_${encodeURIComponent(String(e.keyword || ""))}`,
                    buildQuery: (e, t) => ({
                        filter: String(e.keyword || "").trim(),
                        sortby: e.sortby,
                        order: e.order,
                        newonly: e.newonly,
                        untaggedonly: e.untaggedonly,
                        groupby_tanks: e.groupby,
                        start: String(t)
                    }),
                    mapComic: (e, t) => this._mapArchiveComic(e, t.base)
                }), u = await c(this, {
                    page: r,
                    keyword: e,
                    sortby: a,
                    order: s,
                    newonly: i,
                    untaggedonly: n,
                    groupby: l
                });
                return {
                    comics: u.comics,
                    maxPage: u.maxPage
                };
            },
            loadNext: async (e, t, r) => {
                const o = "number" == typeof r && r > 0 ? r : 1;
                return await this.search.load(e, t, o);
            },
            optionList: [ {
                type: "select",
                options: [ "title-按标题", "date_added-最新添加", "lastread-最近阅读" ],
                label: "sortby",
                default: "title"
            }, {
                type: "select",
                options: [ "asc-升序", "desc-降序" ],
                label: "order",
                default: "asc"
            }, {
                type: "select",
                options: [ "false-全部", "true-仅新" ],
                label: "newonly",
                default: "false"
            }, {
                type: "select",
                options: [ "false-全部", "true-仅未打标签" ],
                label: "untaggedonly",
                default: "false"
            }, {
                type: "select",
                options: [ "true-启用", "false-禁用" ],
                label: "groupby_tanks",
                default: "true"
            } ],
            enableTagsSuggestions: !1
        }, this.favorites = {
            multiFolder: !0,
            singleFolderForSingleComic: !1,
            addOrDelFavorite: async (e, t, r, o) => {
                const a = this.headers || {};
                if (!a || 0 === Object.keys(a).length) throw "API token required to modify favorites";
                if (!t || "-1" === String(t)) throw "Invalid folder id";
                const s = buildSelfHostedUrlFromSource(this, LRR_ROUTES.categoryArchivePath(t, e));
                let i;
                if (i = r ? await Network.put(s, a) : await Network.delete(s, a), 200 !== i.status && 204 !== i.status) throw `Invalid status code: ${i.status}`;
                return "ok";
            },
            loadFolders: async e => {
                const t = this.loadData("favorites"), r = {};
                if (Array.isArray(t)) for (const e of t) {
                    var o, a, s;
                    if (!e) continue;
                    const t = null != (o = null != (a = e.id) ? a : e._id) ? o : e.name, i = null != (s = e.name) ? s : String(t);
                    r[String(t)] = i;
                }
                const i = [];
                if (e) try {
                    const t = await this.comic.loadInfo(e);
                    try {
                        if (t && (!0 === t.isFavorite || "true" === t.isFavorite)) {
                            const e = Array.isArray(t.folders) ? t.folders.map(e => String(e)) : null, o = new Set(i);
                            if (e && e.length > 0) for (const t of e) for (const [e, a] of Object.entries(r)) t !== e && t !== a || o.add(e);
                            i.length = 0;
                            for (const e of o) i.push(e);
                        }
                    } catch (e) {}
                    const o = t.tags || {}, a = Object.keys(o);
                    for (const e of a) if ("category" === String(e).toLowerCase()) {
                        const t = o[e];
                        if (Array.isArray(t)) for (const e of t) for (const [t, o] of Object.entries(r)) String(e) !== t && String(e) !== o || i.includes(t) || i.push(t);
                    }
                } catch (e) {}
                return {
                    folders: r,
                    favorited: i
                };
            },
            loadComics: async (e, t) => await this.categoryComics.load(t, null, [], "number" == typeof e && e > 0 ? e : 1)
        }, this.comic = {
            loadInfo: async e => {
                if (isLrrTankId(e)) return await this._loadTankInfo(e);
                const t = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), r = await Network.get(t, this.headers);
                if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                const o = JSON.parse(r.body), a = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(e));
                let s = toSelfHostedTagArray(o.tags);
                const i = extractSelfHostedTagValue(s, LRR_TAG_PREFIXES.rating);
                s = removeSelfHostedTagsByPrefix(s, [ LRR_TAG_PREFIXES.rating ]);
                let n = null;
                const l = extractSelfHostedTagValue(s, LRR_TAG_PREFIXES.dateAdded);
                l && (n = l, s = removeSelfHostedTagsByPrefix(s, [ LRR_TAG_PREFIXES.dateAdded ]));
                const c = new Map, u = [];
                for (const e of s) {
                    const t = e.indexOf(":");
                    if (t > 0) {
                        const r = e.slice(0, t), o = e.slice(t + 1);
                        c.has(r) || c.set(r, []), c.get(r).push(o);
                    } else u.push(e);
                }
                const d = {};
                for (const [e, t] of c.entries()) d[e] = t;
                d.Tags = u, d.Pages = [ String(o.pagecount) ], d.Extension = [ o.extension ];
                const f = extractSelfHostedUrlEntriesFromTagMap(d, {
                    sourceNamespace: "source",
                    sourceScheme: "https",
                    skipKeys: [ "Extension", "Pages" ]
                });
                let h = o.summary || "";
                f.length && (h && (h += "\n"), h += "关联：" + f.join(", "));
                let S = !1, g = [];
                try {
                    const t = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveCategoriesPath(e)), r = await Network.get(t, this.headers);
                    if (200 === r.status) {
                        let t = [];
                        try {
                            t = JSON.parse(r.body);
                        } catch (e) {
                            t = [];
                        }
                        if (t && "object" == typeof t && (Array.isArray(t.categories) ? t = t.categories : Array.isArray(t.data) ? t = t.data : Array.isArray(t) || (t = [])),
                        Array.isArray(t) && t.length > 0) {
                            const r = [];
                            for (const o of t) {
                                const t = Array.isArray(o.archives) ? o.archives : [];
                                Array.isArray(t) && t.some(t => String(t) === String(e)) && r.push(o);
                            }
                            r.length > 0 && (S = !0, g = r.map(e => {
                                var t, r, o;
                                return String(null != (t = null != (r = null != (o = e.id) ? o : e._id) ? r : e.name) ? t : e);
                            }));
                        }
                    }
                } catch (e) {}
                const p = {};
                p[e] = o.title || "Local manga";
                let y = this._toStarsFromValue(i);
                return null == y && (y = 0), {
                    title: o.title || o.filename || e,
                    cover: a,
                    description: h,
                    uploadTime: n,
                    tags: d,
                    stars: y,
                    chapters: p,
                    isFavorite: S,
                    folders: g
                };
            },
            loadThumbnails: async (e, t) => {
                if (isLrrTankId(e)) {
                    const t = await this._loadTankInfo(e);
                    return {
                        thumbnails: Object.keys(t.chapters || {}).map(e => buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(e))),
                        next: null
                    };
                }
                const r = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), o = await Network.get(r, this.headers);
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                const a = JSON.parse(o.body).pagecount || 1, s = [];
                for (let t = 1; t <= a; t++) s.push(buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(e), {
                    page: t
                }));
                return {
                    thumbnails: s,
                    next: null
                };
            },
            starRating: async (e, t) => {
                const r = this.headers || {};
                if (!r || 0 === Object.keys(r).length) throw "API token required to submit rating";
                const o = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), a = await Network.get(o, r);
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                let s = {};
                try {
                    s = JSON.parse(a.body);
                } catch (e) {
                    s = {};
                }
                let i = toSelfHostedTagArray(s.tags);
                i = removeSelfHostedTagsByPrefix(i, [ LRR_TAG_PREFIXES.rating ], {
                    caseSensitive: !1
                }), t > 0 && i.push(buildSelfHostedEmojiRatingTag(t, {
                    prefix: LRR_TAG_PREFIXES.rating,
                    symbol: "⭐"
                }));
                const n = i.join(", "), l = `tags=${encodeURIComponent(n)}`, c = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), u = await Network.put(c, Object.assign({}, r, {
                    "Content-Type": "application/x-www-form-urlencoded"
                }), l);
                if (200 !== u.status && 204 !== u.status) throw `Invalid status code: ${u.status}`;
                return "ok";
            },
            loadEp: async (e, t) => {
                const r = isLrrArchiveId(t) ? String(t).toLowerCase() : isLrrArchiveId(e) ? String(e).toLowerCase() : "";
                if (!r) throw "Invalid LANraragi archive ID.";
                const o = (this.baseUrl || "").replace(/\/$/, ""), a = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveFilesPath(r), {
                    force: "false"
                }), s = await Network.get(a, this.headers);
                if (200 !== s.status) throw `Invalid status code: ${s.status}`;
                return {
                    images: (JSON.parse(s.body).pages || []).map(e => {
                        if (!e) return null;
                        const t = String(e);
                        return /^https?:\/\//i.test(t) ? t : `${o}${t.startsWith("/") ? t : "/" + t}`;
                    }).filter(Boolean)
                };
            },
            onImageLoad: (e, t, r) => ({
                headers: this.headers
            }),
            onThumbnailLoad: e => ({
                headers: this.headers
            }),
            onClickTag: (e, t) => {
                const r = e ? String(e) : "", o = r.toLowerCase();
                if ("pages" === o || "extension" === o) return null;
                let a = String(t);
                return a.includes(" ") && (a = `"${a}"`), {
                    action: "search",
                    keyword: r ? `${r}:${a}` : a,
                    param: null
                };
            },
            enableTagsTranslate: !0
        }, this.translation = {
            zh_CN: {
                language: "语言",
                artist: "画师",
                male: "男性",
                female: "女性",
                mixed: "混合",
                other: "其它",
                parody: "原作",
                character: "角色",
                group: "团队",
                cosplayer: "Coser",
                reclass: "重新分类",
                uploader: "上传者",
                Languages: "语言",
                Artists: "画师",
                Characters: "角色",
                Groups: "团队",
                Tags: "标签",
                Parodies: "原作",
                Categories: "分类",
                Category: "分类",
                series: "系列",
                Series: "系列",
                Pages: "页数",
                Extension: "文件类型"
            },
            en_US: {
                language: "Language",
                artist: "Artist",
                male: "Male",
                female: "Female",
                mixed: "Mixed",
                other: "Other",
                parody: "Parody",
                character: "Character",
                group: "Group",
                cosplayer: "Cosplayer",
                reclass: "Reclass",
                uploader: "Uploader",
                Languages: "Languages",
                Artists: "Artists",
                Characters: "Characters",
                Groups: "Groups",
                Tags: "Tags",
                Parodies: "Parodies",
                Categories: "Categories",
                Category: "Category",
                series: "Series",
                Series: "Series",
                Pages: "Pages",
                Extension: "Extension"
            }
        };
    }
    get baseUrl() {
        return resolveSelfHostedBaseUrl(this.loadSetting("api"), this.settings.api.default);
    }
    get headers() {
        const e = this.loadSetting("apiKey");
        return e ? withBearer({}, encodeSelfHostedToken(e)) : {};
    }
    _toAbsoluteBaseUrl(e) {
        let t = String(e || "").trim().replace(/\/+$/, "");
        return t ? (/^https?:\/\//i.test(t) || (t = `http://${t.replace(/^\/+/, "")}`),
        t) : "";
    }
    _mapArchiveComic(e, t) {
        const r = this._toAbsoluteBaseUrl(t), o = isLrrTankId(e && e.arcid) ? "" : buildSelfHostedUrl(r, LRR_ROUTES.archiveThumbnailPath(e.arcid)), a = this._extractRatingFromTags(e.tags), s = this._toStarsFromValue(null != a ? a : null);
        return new Comic({
            id: e.arcid,
            title: e.title || e.filename || e.arcid,
            subTitle: "",
            cover: o,
            tags: this._cleanListTags(e.tags),
            description: "页数: " + (e.pagecount || "") + " | 新: " + (e.isnew || "") + " | 扩展: " + (e.extension || ""),
            stars: s
        });
    }
    _toStarsFromValue(e) {
        if (null == e) return null;
        const t = String(e).trim();
        if (0 === t.length) return null;
        if (t.includes("⭐") || t.includes("★")) {
            const e = (t.match(/⭐/g) || t.match(/★/g) || []).length;
            if (e >= 0) return Math.max(0, Math.min(5, e));
        }
        if (t.includes("/")) {
            const e = t.split("/"), r = parseFloat(e[0]), o = parseFloat(e[1]) || 10;
            if (!isNaN(r) && !isNaN(o) && o > 0) {
                const e = r / o * 5;
                return Math.round(2 * e) / 2;
            }
        }
        if (t.includes("%")) {
            const e = parseFloat(t.replace("%", ""));
            if (!isNaN(e)) {
                const t = e / 100 * 5;
                return Math.round(2 * t) / 2;
            }
        }
        const r = parseFloat(t);
        if (isNaN(r)) return null;
        if (r > 5) {
            const e = r / 2;
            return Math.round(2 * e) / 2;
        }
        return Math.round(2 * r) / 2;
    }
    _extractRatingFromTags(e) {
        return parseSelfHostedRatingValueFromTags(e, {
            prefix: LRR_TAG_PREFIXES.rating,
            caseSensitive: !1,
            starSymbols: [ "⭐", "★" ]
        });
    }
    _tagsToArray(e) {
        return toSelfHostedTagArray(e);
    }
    _cleanListTags(e) {
        return filterSelfHostedDisplayTags(e, {
            blockedPrefixes: LRR_TAG_FILTER_PREFIXES,
            caseSensitive: !1,
            excludeUrlLike: !0
        });
    }
    async init() {
        try {
            const e = buildSelfHostedUrlFromSource(this, LRR_ROUTES.categoriesPath()), t = await Network.get(e, this.headers);
            if (200 !== t.status) return void this.saveData("categories", []);
            let r = [];
            try {
                r = JSON.parse(t.body);
            } catch (e) {
                r = [];
            }
            if (Array.isArray(r) || (r = []), this.saveData("categories", r), this.saveData("categories_ts", Date.now()),
            Array.isArray(r)) {
                const e = Array.isArray(r) ? r.filter(e => e && ("" === e.search || null === e.search || void 0 === e.search)) : [];
                this.saveData("favorites", e), this.saveData("favorites_ts", Date.now());
            } else this.saveData("favorites", []);
        } catch (e) {
            this.saveData("categories", []);
        }
    }
    async _loadTankInfo(e) {
        const t = String(e || "");
        if (!isLrrTankId(t)) throw "Invalid LANraragi tankoubon ID.";
        const r = buildSelfHostedUrlFromSource(this, `/api/tankoubons/${t}`), o = await Network.get(r, this.headers);
        if (200 !== o.status) throw `Invalid status code: ${o.status}`;
        const a = JSON.parse(o.body), s = a && Array.isArray(a.archives) ? a.archives : [], i = [], n = {};
        for (const e of s) {
            if (!isLrrArchiveId(e)) continue;
            const t = String(e).toLowerCase();
            if (!Object.prototype.hasOwnProperty.call(n, t) && (n[t] = !0, i.push(t), i.length >= 2e3)) break;
        }
        if (!i.length) throw "LANraragi tankoubon has no chapters.";
        const l = {}, c = i.slice(0, 40);
        await Promise.all(c.map(async (e, t) => {
            l[e] = "Chapter " + (t + 1);
            try {
                const t = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), r = await Network.get(t, this.headers);
                if (200 !== r.status) return;
                const o = JSON.parse(r.body);
                o && "string" == typeof o.title && o.title.trim() && (l[e] = o.title.trim().slice(0, 300));
            } catch (e) {}
        }));
        const u = {};
        for (let e = 0; e < i.length; e++) {
            const t = i[e];
            u[t] = l[t] || "Chapter " + (e + 1);
        }
        const d = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(i[0]));
        return {
            title: a && (a.name || a.title) || t,
            cover: d,
            description: a && a.summary || "",
            tags: {},
            stars: 0,
            chapters: u,
            isFavorite: !1,
            folders: []
        };
    }
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), o = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), a = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), s = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), i = joinSelfHostedRoutePath(r, [ "series" ]), n = joinSelfHostedRoutePath(r, [ "books" ]), l = joinSelfHostedRoutePath(r, [ "collections" ]);
    return {
        apiV1Root: r,
        apiV2Root: o,
        seriesWebRoot: a,
        booksWebRoot: s,
        librariesPath: () => joinSelfHostedRoutePath(r, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(r, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(r, [ "languages" ]),
        collectionsPath: () => l,
        genresPath: () => joinSelfHostedRoutePath(r, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(o, [ "users", "me" ]),
        seriesPath: () => i,
        latestSeriesPath: () => joinSelfHostedRoutePath(i, [ "latest" ]),
        updatedSeriesPath: () => joinSelfHostedRoutePath(i, [ "updated" ]),
        collectionSeriesPath: e => joinSelfHostedRoutePath(l, [ e, "series" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(i, [ e ]),
        seriesBooksPath: e => joinSelfHostedRoutePath(i, [ e, "books" ]),
        seriesThumbnailPath: e => joinSelfHostedRoutePath(i, [ e, "thumbnail" ]),
        seriesWebPath: e => joinSelfHostedRoutePath(a, [ e ]),
        bookDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        bookThumbnailPath: e => joinSelfHostedRoutePath(n, [ e, "thumbnail" ]),
        bookPagesPath: e => joinSelfHostedRoutePath(n, [ e, "pages" ]),
        bookPageImagePath: (e, t) => joinSelfHostedRoutePath(n, [ e, "pages", t ]),
        bookWebPath: e => joinSelfHostedRoutePath(s, [ e ])
    };
}

function createKavitaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), o = normalizeSelfHostedRoutePath(t.libraryRoot, `${r}/Library`), a = normalizeSelfHostedRoutePath(t.metadataRoot, `${r}/Metadata`), s = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${r}/metadata`), i = normalizeSelfHostedRoutePath(t.accountRoot, `${r}/Account`), n = normalizeSelfHostedRoutePath(t.seriesRoot, `${r}/Series`), l = normalizeSelfHostedRoutePath(t.imageRoot, `${r}/Image`), c = normalizeSelfHostedRoutePath(t.readerRoot, `${r}/Reader`), u = normalizeSelfHostedRoutePath(t.searchRoot, `${r}/Search`);
    return {
        apiRoot: r,
        libraryRoot: o,
        metadataRoot: a,
        metadataLegacyRoot: s,
        accountRoot: i,
        seriesRoot: n,
        imageRoot: l,
        readerRoot: c,
        searchRoot: u,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(s, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(i, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(n, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(n, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(n, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(l, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(n, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(c, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(u, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = "string" == typeof t ? t : "";
    let s = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : a);
    if (!s) return s;
    const i = "string" == typeof o.defaultScheme ? o.defaultScheme.trim() : "";
    return i && !/^https?:\/\//i.test(s) && (s = `${i.replace(/:$/, "")}://${s}`), normalizeSelfHostedBaseUrl(s);
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

function withAuthorization(e, t, r) {
    const o = {
        ...e || {}
    };
    return r ? (o.Authorization = `${t} ${r}`, o) : o;
}

function withBearer(e, t) {
    return withAuthorization(e, "Bearer", t);
}

function withBasic(e, t) {
    return withAuthorization(e, "Basic", t);
}

function encodeSelfHostedToken(e) {
    const t = String(e || "");
    if (!t) return "";
    const r = Convert.encodeBase64(Convert.encodeUtf8(t));
    return "string" == typeof r ? r : Convert.decodeUtf8(r);
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = normalizeSelfHostedPathRoot(t.apiRoot, "/api"), o = normalizeSelfHostedPathRoot(t.archivesRoot, `${r}/archives`), a = normalizeSelfHostedPathRoot(t.categoriesRoot, `${r}/categories`), s = normalizeSelfHostedPathRoot(t.searchPath, `${r}/search`);
    return {
        apiRoot: r,
        archivesRoot: o,
        categoriesRoot: a,
        searchPath: s,
        categoriesPath: () => a,
        categoryArchivePath: (e, t) => joinSelfHostedPath(a, [ e, t ]),
        archivePath: e => joinSelfHostedPath(o, [ e ]),
        archiveMetadataPath: e => joinSelfHostedPath(o, [ e, "metadata" ]),
        archiveThumbnailPath: e => joinSelfHostedPath(o, [ e, "thumbnail" ]),
        archiveCategoriesPath: e => joinSelfHostedPath(o, [ e, "categories" ]),
        archiveFilesPath: e => joinSelfHostedPath(o, [ e, "files" ])
    };
}

function buildSelfHostedUrlFromSource(e, t, r) {
    if (!e || "object" != typeof e) throw new Error("buildSelfHostedUrlFromSource requires plugin source");
    return buildSelfHostedUrl(e.baseUrl, t, r);
}

function buildSelfHostedQueryFromSource(e) {
    return buildSelfHostedQuery(e);
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

async function getSelfHostedJson(e, t, r, o) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const a = o && "object" == typeof o && !Array.isArray(o) ? o : {}, s = a.headers || e.headers, i = await Network.get(e.buildUrl(t, r), s);
    return ensureSelfHostedHttpOk(i, a), parseSelfHostedJsonBody(i.body);
}

async function postSelfHostedJson(e, t, r, o, a) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const s = a && "object" == typeof a && !Array.isArray(a) ? a : {}, i = s.headers || e.headers, n = await Network.post(e.buildUrl(t, r), i, o);
    return ensureSelfHostedHttpOk(n, s), {
        body: parseSelfHostedJsonBody(n.body),
        headers: n.headers || {}
    };
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

function createOffsetSearchLoader(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, r = String(t.path || "/api/search"), o = "function" == typeof t.getOffsetKey ? t.getOffsetKey : null, a = "function" == typeof t.buildQuery ? t.buildQuery : null, s = "function" == typeof t.mapComic ? t.mapComic : null, i = "function" == typeof t.onResponse ? t.onResponse : null, n = String(t.statusErrorPrefix || "Invalid status code");
    if (!o || !a || !s) throw new Error("Invalid createOffsetSearchLoader options");
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("runOffsetSearch requires plugin source");
        const l = t && "object" == typeof t && !Array.isArray(t) ? t : {}, c = Number(l.page || 1), u = stripSelfHostedTrailingSlash(e.baseUrl), d = o(l), f = readSelfHostedOffset(e, d, c), h = buildSelfHostedQueryFromSource(a(l, f)), S = h ? `${u}${r}?${h}` : `${u}${r}`, g = await Network.get(S, e.headers);
        if (200 !== g.status) throw `${n}: ${g.status}`;
        const p = parseSelfHostedJsonBody(g.body) || {}, y = Array.isArray(p.data) ? p.data : [], m = y.map(t => s(t, {
            source: e,
            base: u,
            input: l
        })), R = y.length;
        updateSelfHostedOffset(e, d, R);
        const H = "number" == typeof p.recordsFiltered && p.recordsFiltered >= 0 ? p.recordsFiltered : f + R, P = R || 1, b = Math.max(1, Math.ceil(H / P));
        return i && i({
            source: e,
            input: l,
            start: f,
            returned: R,
            data: p,
            list: y,
            comics: m
        }), {
            comics: m,
            maxPage: b,
            data: p
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
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, s = "function" == typeof o.transform ? o.transform : e => e, i = toSelfHostedTagArray(e, o), n = String(t || "");
    for (const e of i) if (startsWithSelfHostedTagPrefix(e, n, a)) return s(String(e).slice(n.length).trim(), e);
    return null;
}

function removeSelfHostedTagsByPrefix(e, t, r) {
    const o = r && "object" == typeof r && !Array.isArray(r) ? r : {}, a = !1 !== o.caseSensitive, s = toSelfHostedTagArray(e, o), i = Array.isArray(t) ? t.map(e => String(e)) : [ String(t || "") ];
    return s.filter(e => !i.some(t => startsWithSelfHostedTagPrefix(e, t, a)));
}

function filterSelfHostedDisplayTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = Array.isArray(r.blockedPrefixes) ? r.blockedPrefixes : [], a = !0 === r.caseSensitive, s = !1 !== r.excludeUrlLike, i = "function" == typeof r.extraFilter ? r.extraFilter : null, n = toSelfHostedTagArray(e, r), l = [];
    for (const e of n) o.some(t => startsWithSelfHostedTagPrefix(e, t, a)) || s && String(e).includes("://") || i && !i(e) || l.push(e);
    return l;
}

function parseSelfHostedRatingValueFromTags(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = Array.isArray(r.starSymbols) ? r.starSymbols : [ "⭐", "★" ], s = extractSelfHostedTagValue(e, o, {
        caseSensitive: !0 === r.caseSensitive
    });
    if (!s) return null;
    if (a.some(e => String(s).includes(e))) {
        let e = 0;
        for (const t of a) {
            const r = String(t).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), o = String(s).match(new RegExp(r, "g"));
            if (o && o.length > 0) {
                e = o.length;
                break;
            }
        }
        return String(e);
    }
    return String(s).trim();
}

function extractSelfHostedUrlEntriesFromTagMap(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.sourceNamespace || "source").toLowerCase(), a = String(r.sourceScheme || "https").replace(/:$/, ""), s = new Set(Array.isArray(r.skipKeys) ? r.skipKeys.map(e => String(e)) : []), i = [];
    if (!e || "object" != typeof e) return i;
    for (const t of Object.keys(e)) {
        if (s.has(t)) continue;
        const r = e[t];
        if (!Array.isArray(r)) continue;
        const n = [];
        for (const e of r) if ("string" == typeof e) if (e.includes("://")) i.push(e); else {
            if (String(t).toLowerCase() === o) {
                let t = e;
                t.startsWith("//") ? t = `${a}:${t}` : /^https?:\/\//i.test(t) || (t = `${a}://${t}`),
                i.push(t);
                continue;
            }
            n.push(e);
        } else n.push(e);
        e[t] = n;
    }
    return i;
}

function buildSelfHostedEmojiRatingTag(e, t) {
    const r = t && "object" == typeof t && !Array.isArray(t) ? t : {}, o = String(r.prefix || "rating:"), a = String(r.symbol || "⭐"), s = Number(e) / 2;
    return `${o}${a.repeat(s)}`;
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const o = String(null == e ? "" : e).trim() || t;
    return r ? o.replace(/^\/+|\/+$/g, "") : o;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, o = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), i = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${o}/${a}/${s}@${i}`;
    const c = n ? `${n}/${l}` : l;
    return `${o}/${a}/${s}@${i}/${l.startsWith(`${n}/`) ? l : c}`;
}

"undefined" != typeof module && module.exports && (module.exports = {
    normalizeSelfHostedBaseUrl,
    resolveSelfHostedBaseUrl,
    buildSelfHostedQuery,
    buildSelfHostedUrl,
    normalizeSelfHostedRoutePath,
    joinSelfHostedRoutePath,
    createKomgaRouteHelpers,
    createKavitaRouteHelpers,
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
    buildSelfHostedUrlFromSource,
    buildSelfHostedQueryFromSource
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    getSelfHostedJson,
    postSelfHostedJson
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    readSelfHostedOffset,
    updateSelfHostedOffset
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    createOffsetSearchLoader
}), "undefined" != typeof module && module && module.exports && (module.exports = {
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag
});

"use strict";

const LRR_ROUTES = createSelfHostedRouteHelpers(), LRR_TAG_PREFIXES = {
    rating: "rating:",
    dateAdded: "date_added:",
    source: "source:"
}, LRR_TAG_FILTER_PREFIXES = [ LRR_TAG_PREFIXES.rating, LRR_TAG_PREFIXES.dateAdded, LRR_TAG_PREFIXES.source ], LRR_SORT_KEYS = [ "title", "date_added", "lastread" ], LRR_ORDERS = [ "asc", "desc" ], LRR_BOOLS = [ "true", "false" ];

function unwrapLrrOption(e, t) {
    let r = e;
    if ("string" == typeof r) {
        const e = r.trim();
        if (e.length >= 2 && e.startsWith('"') && e.endsWith('"')) try {
            const t = JSON.parse(e);
            "string" != typeof t && "boolean" != typeof t && "number" != typeof t || (r = t);
        } catch (t) {
            r = e.slice(1, -1);
        }
        if ("string" == typeof r) {
            const e = r.indexOf("-");
            e > 0 && (r = r.slice(0, e));
        }
    }
    return !0 === r ? "true" : !1 === r ? "false" : null == r || "" === r ? t : String(r);
}

function lrrChoice(e, t, r) {
    const o = unwrapLrrOption(e, t);
    return r.indexOf(o) >= 0 ? o : t;
}

function isLrrTankId(e) {
    return /^TANK_[0-9]{10}$/.test(String(e || ""));
}

function isLrrArchiveId(e) {
    return /^[a-f0-9]{40}$/i.test(String(e || ""));
}
