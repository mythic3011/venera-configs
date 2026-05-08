class Lanraragi extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Lanraragi", this.key = "lanraragi", this.version = "1.2.0",
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
                }), o = await t(this, {
                    page: e
                });
                return {
                    comics: o.comics,
                    maxPage: o.maxPage
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
                        var o, r, a;
                        if (!s) continue;
                        const e = null != (o = null != (r = s.id) ? r : s._id) ? o : s.name, i = null != (a = s.name) ? a : String(e);
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
                        } catch (o) {
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
            load: async (e, t, o, r) => {
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
                    page: r,
                    category: e
                });
                return {
                    comics: s.comics,
                    maxPage: s.maxPage
                };
            }
        }, this.search = {
            load: async (e, t, o = 1) => {
                const r = (e, o) => {
                    let r = t && t[e];
                    if ("string" == typeof r) {
                        const e = r.indexOf("-");
                        e > 0 && (r = r.slice(0, e));
                    }
                    return null == r || "" === r ? o : r;
                }, a = r(0, "title"), s = r(1, "asc"), i = String(r(2, "false")), n = String(r(3, "false")), l = String(r(4, "true")), u = createOffsetSearchLoader({
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
                }), c = await u(this, {
                    page: o,
                    keyword: e,
                    sortby: a,
                    order: s,
                    newonly: i,
                    untaggedonly: n,
                    groupby: l
                });
                return {
                    comics: c.comics,
                    maxPage: c.maxPage
                };
            },
            loadNext: async (e, t, o) => {
                const r = "number" == typeof o && o > 0 ? o : 1;
                return await this.search.load(e, t, r);
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
            addOrDelFavorite: async (e, t, o, r) => {
                const a = this.headers || {};
                if (!a || 0 === Object.keys(a).length) throw "API token required to modify favorites";
                if (!t || "-1" === String(t)) throw "Invalid folder id";
                const s = buildSelfHostedUrlFromSource(this, LRR_ROUTES.categoryArchivePath(t, e));
                let i;
                if (i = o ? await Network.put(s, a) : await Network.delete(s, a), 200 !== i.status && 204 !== i.status) throw `Invalid status code: ${i.status}`;
                return "ok";
            },
            loadFolders: async e => {
                const t = this.loadData("favorites"), o = {};
                if (Array.isArray(t)) for (const e of t) {
                    var r, a, s;
                    if (!e) continue;
                    const t = null != (r = null != (a = e.id) ? a : e._id) ? r : e.name, i = null != (s = e.name) ? s : String(t);
                    o[String(t)] = i;
                }
                const i = [];
                if (e) try {
                    const t = await this.comic.loadInfo(e);
                    try {
                        if (t && (!0 === t.isFavorite || "true" === t.isFavorite)) {
                            const e = Array.isArray(t.folders) ? t.folders.map(e => String(e)) : null, r = new Set(i);
                            if (e && e.length > 0) for (const t of e) for (const [e, a] of Object.entries(o)) t !== e && t !== a || r.add(e);
                            i.length = 0;
                            for (const e of r) i.push(e);
                        }
                    } catch (e) {}
                    const r = t.tags || {}, a = Object.keys(r);
                    for (const e of a) if ("category" === String(e).toLowerCase()) {
                        const t = r[e];
                        if (Array.isArray(t)) for (const e of t) for (const [t, r] of Object.entries(o)) String(e) !== t && String(e) !== r || i.includes(t) || i.push(t);
                    }
                } catch (e) {}
                return {
                    folders: o,
                    favorited: i
                };
            },
            loadComics: async (e, t) => await this.categoryComics.load(t, null, [], "number" == typeof e && e > 0 ? e : 1)
        }, this.comic = {
            loadInfo: async e => {
                const t = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), o = await Network.get(t, this.headers);
                if (200 !== o.status) throw `Invalid status code: ${o.status}`;
                const r = JSON.parse(o.body), a = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(e));
                let s = toSelfHostedTagArray(r.tags);
                const i = extractSelfHostedTagValue(s, LRR_TAG_PREFIXES.rating);
                s = removeSelfHostedTagsByPrefix(s, [ LRR_TAG_PREFIXES.rating ]);
                let n = null;
                const l = extractSelfHostedTagValue(s, LRR_TAG_PREFIXES.dateAdded);
                l && (n = l, s = removeSelfHostedTagsByPrefix(s, [ LRR_TAG_PREFIXES.dateAdded ]));
                const u = new Map, c = [];
                for (const e of s) {
                    const t = e.indexOf(":");
                    if (t > 0) {
                        const o = e.slice(0, t), r = e.slice(t + 1);
                        u.has(o) || u.set(o, []), u.get(o).push(r);
                    } else c.push(e);
                }
                const d = {};
                for (const [e, t] of u.entries()) d[e] = t;
                d.Tags = c, d.Pages = [ String(r.pagecount) ], d.Extension = [ r.extension ];
                const f = extractSelfHostedUrlEntriesFromTagMap(d, {
                    sourceNamespace: "source",
                    sourceScheme: "https",
                    skipKeys: [ "Extension", "Pages" ]
                });
                let h = r.summary || "";
                f.length && (h && (h += "\n"), h += "关联：" + f.join(", "));
                let g = !1, S = [];
                try {
                    const t = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveCategoriesPath(e)), o = await Network.get(t, this.headers);
                    if (200 === o.status) {
                        let t = [];
                        try {
                            t = JSON.parse(o.body);
                        } catch (e) {
                            t = [];
                        }
                        if (t && "object" == typeof t && (Array.isArray(t.categories) ? t = t.categories : Array.isArray(t.data) ? t = t.data : Array.isArray(t) || (t = [])),
                        Array.isArray(t) && t.length > 0) {
                            const o = [];
                            for (const r of t) {
                                const t = Array.isArray(r.archives) ? r.archives : [];
                                Array.isArray(t) && t.some(t => String(t) === String(e)) && o.push(r);
                            }
                            o.length > 0 && (g = !0, S = o.map(e => {
                                var t, o, r;
                                return String(null != (t = null != (o = null != (r = e.id) ? r : e._id) ? o : e.name) ? t : e);
                            }));
                        }
                    }
                } catch (e) {}
                const p = new Map;
                p.set(e, r.title || "Local manga");
                let y = this._toStarsFromValue(i);
                return null == y && (y = 0), {
                    title: r.title || r.filename || e,
                    cover: a,
                    description: h,
                    uploadTime: n,
                    tags: d,
                    stars: y,
                    chapters: p,
                    isFavorite: g,
                    folders: S
                };
            },
            loadThumbnails: async (e, t) => {
                const o = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), r = await Network.get(o, this.headers);
                if (200 !== r.status) throw `Invalid status code: ${r.status}`;
                const a = JSON.parse(r.body).pagecount || 1, s = [];
                for (let t = 1; t <= a; t++) s.push(buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveThumbnailPath(e), {
                    page: t
                }));
                return {
                    thumbnails: s,
                    next: null
                };
            },
            starRating: async (e, t) => {
                const o = this.headers || {};
                if (!o || 0 === Object.keys(o).length) throw "API token required to submit rating";
                const r = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), a = await Network.get(r, o);
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
                const n = i.join(", "), l = `tags=${encodeURIComponent(n)}`, u = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveMetadataPath(e)), c = await Network.put(u, Object.assign({}, o, {
                    "Content-Type": "application/x-www-form-urlencoded"
                }), l);
                if (200 !== c.status && 204 !== c.status) throw `Invalid status code: ${c.status}`;
                return "ok";
            },
            loadEp: async (e, t) => {
                const o = (this.baseUrl || "").replace(/\/$/, ""), r = buildSelfHostedUrlFromSource(this, LRR_ROUTES.archiveFilesPath(e), {
                    force: "false"
                }), a = await Network.get(r, this.headers);
                if (200 !== a.status) throw `Invalid status code: ${a.status}`;
                return {
                    images: (JSON.parse(a.body).pages || []).map(e => {
                        if (!e) return null;
                        const t = String(e);
                        return /^https?:\/\//i.test(t) ? t : `${o}${t.startsWith("/") ? t : "/" + t}`;
                    }).filter(Boolean)
                };
            },
            onImageLoad: (e, t, o) => ({
                headers: this.headers
            }),
            onThumbnailLoad: e => ({
                headers: this.headers
            }),
            onClickTag: (e, t) => {
                const o = e ? String(e) : "", r = o.toLowerCase();
                if ("pages" === r || "extension" === r) return null;
                let a = String(t);
                return a.includes(" ") && (a = `"${a}"`), {
                    action: "search",
                    keyword: o ? `${o}:${a}` : a,
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
        const o = buildSelfHostedUrl(this._toAbsoluteBaseUrl(t), LRR_ROUTES.archiveThumbnailPath(e.arcid)), r = this._extractRatingFromTags(e.tags), a = this._toStarsFromValue(null != r ? r : null);
        return new Comic({
            id: e.arcid,
            title: e.title || e.filename || e.arcid,
            subTitle: "",
            cover: o,
            tags: this._cleanListTags(e.tags),
            description: "页数: " + (e.pagecount || "") + " | 新: " + (e.isnew || "") + " | 扩展: " + (e.extension || ""),
            stars: a
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
            const e = t.split("/"), o = parseFloat(e[0]), r = parseFloat(e[1]) || 10;
            if (!isNaN(o) && !isNaN(r) && r > 0) {
                const e = o / r * 5;
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
        const o = parseFloat(t);
        if (isNaN(o)) return null;
        if (o > 5) {
            const e = o / 2;
            return Math.round(2 * e) / 2;
        }
        return Math.round(2 * o) / 2;
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
            let o = [];
            try {
                o = JSON.parse(t.body);
            } catch (e) {
                o = [];
            }
            if (Array.isArray(o) || (o = []), this.saveData("categories", o), this.saveData("categories_ts", Date.now()),
            Array.isArray(o)) {
                const e = Array.isArray(o) ? o.filter(e => e && ("" === e.search || null === e.search || void 0 === e.search)) : [];
                this.saveData("favorites", e), this.saveData("favorites_ts", Date.now());
            } else this.saveData("favorites", []);
        } catch (e) {
            this.saveData("categories", []);
        }
    }
}

function normalizeSelfHostedBaseUrl(e) {
    const t = String(e || "").trim();
    return t ? t.replace(/\/+$/, "") : "";
}

function normalizeSelfHostedRoutePath(e, t) {
    const o = String(null == e ? t || "" : e).trim();
    if (!o) return "";
    const r = o.replace(/\/+$/, "");
    return r.startsWith("/") ? r : `/${r}`;
}

function joinSelfHostedRoutePath(e, t) {
    const o = normalizeSelfHostedRoutePath(e, "/"), r = Array.isArray(t) ? t : [];
    let a = o;
    for (const e of r) {
        const t = String(null == e ? "" : e).trim().replace(/^\/+|\/+$/g, "");
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createKomgaRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, o = normalizeSelfHostedRoutePath(t.apiV1Root, "/api/v1"), r = normalizeSelfHostedRoutePath(t.apiV2Root, "/api/v2"), a = normalizeSelfHostedRoutePath(t.seriesWebRoot, "/series"), s = normalizeSelfHostedRoutePath(t.booksWebRoot, "/books"), i = joinSelfHostedRoutePath(o, [ "series" ]), n = joinSelfHostedRoutePath(o, [ "books" ]), l = joinSelfHostedRoutePath(o, [ "collections" ]);
    return {
        apiV1Root: o,
        apiV2Root: r,
        seriesWebRoot: a,
        booksWebRoot: s,
        librariesPath: () => joinSelfHostedRoutePath(o, [ "libraries" ]),
        seriesTagsPath: () => joinSelfHostedRoutePath(o, [ "tags", "series" ]),
        languagesPath: () => joinSelfHostedRoutePath(o, [ "languages" ]),
        collectionsPath: () => l,
        genresPath: () => joinSelfHostedRoutePath(o, [ "genres" ]),
        currentUserPath: () => joinSelfHostedRoutePath(r, [ "users", "me" ]),
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
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, o = normalizeSelfHostedRoutePath(t.apiRoot, "/api"), r = normalizeSelfHostedRoutePath(t.libraryRoot, `${o}/Library`), a = normalizeSelfHostedRoutePath(t.metadataRoot, `${o}/Metadata`), s = normalizeSelfHostedRoutePath(t.metadataLegacyRoot, `${o}/metadata`), i = normalizeSelfHostedRoutePath(t.accountRoot, `${o}/Account`), n = normalizeSelfHostedRoutePath(t.seriesRoot, `${o}/Series`), l = normalizeSelfHostedRoutePath(t.imageRoot, `${o}/Image`), u = normalizeSelfHostedRoutePath(t.readerRoot, `${o}/Reader`), c = normalizeSelfHostedRoutePath(t.searchRoot, `${o}/Search`);
    return {
        apiRoot: o,
        libraryRoot: r,
        metadataRoot: a,
        metadataLegacyRoot: s,
        accountRoot: i,
        seriesRoot: n,
        imageRoot: l,
        readerRoot: u,
        searchRoot: c,
        librariesPath: () => joinSelfHostedRoutePath(r, [ "libraries" ]),
        genresPath: () => joinSelfHostedRoutePath(a, [ "genres" ]),
        peopleByRolePath: () => joinSelfHostedRoutePath(s, [ "people-by-role" ]),
        loginPath: () => joinSelfHostedRoutePath(i, [ "login" ]),
        seriesV2Path: () => joinSelfHostedRoutePath(n, [ "v2" ]),
        seriesDetailsPath: e => joinSelfHostedRoutePath(n, [ e ]),
        seriesMetadataPath: () => joinSelfHostedRoutePath(n, [ "metadata" ]),
        seriesVolumesPath: () => joinSelfHostedRoutePath(n, [ "volumes" ]),
        seriesCoverPath: () => joinSelfHostedRoutePath(l, [ "series-cover" ]),
        chapterPath: () => joinSelfHostedRoutePath(n, [ "chapter" ]),
        readerImagePath: () => joinSelfHostedRoutePath(u, [ "image" ]),
        searchPath: () => joinSelfHostedRoutePath(c, [ "search" ])
    };
}

function resolveSelfHostedBaseUrl(e, t, o) {
    const r = o && "object" == typeof o && !Array.isArray(o) ? o : {}, a = "string" == typeof t ? t : "";
    let s = normalizeSelfHostedBaseUrl("string" == typeof e && e.trim() ? e.trim() : a);
    if (!s) return s;
    const i = "string" == typeof r.defaultScheme ? r.defaultScheme.trim() : "";
    return i && !/^https?:\/\//i.test(s) && (s = `${i.replace(/:$/, "")}://${s}`), normalizeSelfHostedBaseUrl(s);
}

function buildSelfHostedQuery(e) {
    if (!e) return "";
    const t = [];
    for (const o of Object.keys(e)) {
        const r = e[o];
        if (null != r) if (Array.isArray(r)) for (const e of r) null != e && t.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(e))}`); else t.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(r))}`);
    }
    return t.join("&");
}

function buildSelfHostedUrl(e, t, o) {
    let r = t;
    /^https?:\/\//i.test(t) || (r = `${normalizeSelfHostedBaseUrl(e || "")}${String(t).startsWith("/") ? "" : "/"}${t}`);
    const a = buildSelfHostedQuery(o);
    return a ? `${r}?${a}` : r;
}

function withAuthorization(e, t, o) {
    const r = {
        ...e || {}
    };
    return o ? (r.Authorization = `${t} ${o}`, r) : r;
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
    const o = Convert.encodeBase64(Convert.encodeUtf8(t));
    return "string" == typeof o ? o : Convert.decodeUtf8(o);
}

function stripSelfHostedTrailingSlash(e) {
    return String(e || "").replace(/\/+$/, "");
}

function normalizeSelfHostedPathRoot(e, t) {
    const o = String(e || t || "").trim();
    return o ? `/${o.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
}

function normalizeSelfHostedPathSegment(e) {
    return String(null == e ? "" : e).replace(/^\/+|\/+$/g, "");
}

function joinSelfHostedPath(e, t) {
    const o = normalizeSelfHostedPathRoot(e, "/"), r = Array.isArray(t) ? t : [];
    let a = o;
    for (const e of r) {
        const t = normalizeSelfHostedPathSegment(e);
        t && (a = `${a}/${t}`);
    }
    return a;
}

function createSelfHostedRouteHelpers(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, o = normalizeSelfHostedPathRoot(t.apiRoot, "/api"), r = normalizeSelfHostedPathRoot(t.archivesRoot, `${o}/archives`), a = normalizeSelfHostedPathRoot(t.categoriesRoot, `${o}/categories`), s = normalizeSelfHostedPathRoot(t.searchPath, `${o}/search`);
    return {
        apiRoot: o,
        archivesRoot: r,
        categoriesRoot: a,
        searchPath: s,
        categoriesPath: () => a,
        categoryArchivePath: (e, t) => joinSelfHostedPath(a, [ e, t ]),
        archivePath: e => joinSelfHostedPath(r, [ e ]),
        archiveMetadataPath: e => joinSelfHostedPath(r, [ e, "metadata" ]),
        archiveThumbnailPath: e => joinSelfHostedPath(r, [ e, "thumbnail" ]),
        archiveCategoriesPath: e => joinSelfHostedPath(r, [ e, "categories" ]),
        archiveFilesPath: e => joinSelfHostedPath(r, [ e, "files" ])
    };
}

function buildSelfHostedUrlFromSource(e, t, o) {
    if (!e || "object" != typeof e) throw new Error("buildSelfHostedUrlFromSource requires plugin source");
    return buildSelfHostedUrl(e.baseUrl, t, o);
}

function buildSelfHostedQueryFromSource(e) {
    return buildSelfHostedQuery(e);
}

function ensureSelfHostedHttpOk(e, t) {
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = o.unauthorizedMessage || "Login expired", a = o.requestFailedMessage || "请求失败";
    if (!e) throw a;
    if (401 === e.status || 403 === e.status) throw r;
    if (e.status < 200 || e.status >= 300) throw `${a}: ${e.status}`;
}

function parseSelfHostedJsonBody(e) {
    return e ? JSON.parse(e) : null;
}

async function getSelfHostedJson(e, t, o, r) {
    if (!e || "object" != typeof e) throw new Error("getSelfHostedJson requires plugin source");
    const a = r && "object" == typeof r && !Array.isArray(r) ? r : {}, s = a.headers || e.headers, i = await Network.get(e.buildUrl(t, o), s);
    return ensureSelfHostedHttpOk(i, a), parseSelfHostedJsonBody(i.body);
}

async function postSelfHostedJson(e, t, o, r, a) {
    if (!e || "object" != typeof e) throw new Error("postSelfHostedJson requires plugin source");
    const s = a && "object" == typeof a && !Array.isArray(a) ? a : {}, i = s.headers || e.headers, n = await Network.post(e.buildUrl(t, o), i, r);
    return ensureSelfHostedHttpOk(n, s), {
        body: parseSelfHostedJsonBody(n.body),
        headers: n.headers || {}
    };
}

function readSelfHostedOffset(e, t, o) {
    if (!e || "object" != typeof e) throw new Error("readSelfHostedOffset requires plugin source");
    return Number(o || 1) <= 1 ? (e.saveData(t, 0), 0) : Number(e.loadData(t) || 0);
}

function updateSelfHostedOffset(e, t, o) {
    if (!e || "object" != typeof e) throw new Error("updateSelfHostedOffset requires plugin source");
    const r = Number(e.loadData(t) || 0);
    e.saveData(t, r + (o || 0));
}

function createOffsetSearchLoader(e) {
    const t = e && "object" == typeof e && !Array.isArray(e) ? e : {}, o = String(t.path || "/api/search"), r = "function" == typeof t.getOffsetKey ? t.getOffsetKey : null, a = "function" == typeof t.buildQuery ? t.buildQuery : null, s = "function" == typeof t.mapComic ? t.mapComic : null, i = "function" == typeof t.onResponse ? t.onResponse : null, n = String(t.statusErrorPrefix || "Invalid status code");
    if (!r || !a || !s) throw new Error("Invalid createOffsetSearchLoader options");
    return async function(e, t) {
        if (!e || "object" != typeof e) throw new Error("runOffsetSearch requires plugin source");
        const l = t && "object" == typeof t && !Array.isArray(t) ? t : {}, u = Number(l.page || 1), c = stripSelfHostedTrailingSlash(e.baseUrl), d = r(l), f = readSelfHostedOffset(e, d, u), h = buildSelfHostedQueryFromSource(a(l, f)), g = h ? `${c}${o}?${h}` : `${c}${o}`, S = await Network.get(g, e.headers);
        if (200 !== S.status) throw `${n}: ${S.status}`;
        const p = parseSelfHostedJsonBody(S.body) || {}, y = Array.isArray(p.data) ? p.data : [], m = y.map(t => s(t, {
            source: e,
            base: c,
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
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = "string" == typeof o.delimiter ? o.delimiter : ",", a = "function" == typeof o.normalizeTag ? o.normalizeTag : e => String(e).trim();
    return e ? Array.isArray(e) ? e.map(e => a(e)).filter(Boolean) : String(e).split(r).map(e => a(e)).filter(Boolean) : [];
}

function startsWithSelfHostedTagPrefix(e, t, o) {
    const r = String(e || ""), a = String(t || "");
    return !!a && (!1 === o ? r.toLowerCase().startsWith(a.toLowerCase()) : r.startsWith(a));
}

function extractSelfHostedTagValue(e, t, o) {
    const r = o && "object" == typeof o && !Array.isArray(o) ? o : {}, a = !1 !== r.caseSensitive, s = "function" == typeof r.transform ? r.transform : e => e, i = toSelfHostedTagArray(e, r), n = String(t || "");
    for (const e of i) if (startsWithSelfHostedTagPrefix(e, n, a)) return s(String(e).slice(n.length).trim(), e);
    return null;
}

function removeSelfHostedTagsByPrefix(e, t, o) {
    const r = o && "object" == typeof o && !Array.isArray(o) ? o : {}, a = !1 !== r.caseSensitive, s = toSelfHostedTagArray(e, r), i = Array.isArray(t) ? t.map(e => String(e)) : [ String(t || "") ];
    return s.filter(e => !i.some(t => startsWithSelfHostedTagPrefix(e, t, a)));
}

function filterSelfHostedDisplayTags(e, t) {
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = Array.isArray(o.blockedPrefixes) ? o.blockedPrefixes : [], a = !0 === o.caseSensitive, s = !1 !== o.excludeUrlLike, i = "function" == typeof o.extraFilter ? o.extraFilter : null, n = toSelfHostedTagArray(e, o), l = [];
    for (const e of n) r.some(t => startsWithSelfHostedTagPrefix(e, t, a)) || s && String(e).includes("://") || i && !i(e) || l.push(e);
    return l;
}

function parseSelfHostedRatingValueFromTags(e, t) {
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = String(o.prefix || "rating:"), a = Array.isArray(o.starSymbols) ? o.starSymbols : [ "⭐", "★" ], s = extractSelfHostedTagValue(e, r, {
        caseSensitive: !0 === o.caseSensitive
    });
    if (!s) return null;
    if (a.some(e => String(s).includes(e))) {
        let e = 0;
        for (const t of a) {
            const o = String(t).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), r = String(s).match(new RegExp(o, "g"));
            if (r && r.length > 0) {
                e = r.length;
                break;
            }
        }
        return String(e);
    }
    return String(s).trim();
}

function extractSelfHostedUrlEntriesFromTagMap(e, t) {
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = String(o.sourceNamespace || "source").toLowerCase(), a = String(o.sourceScheme || "https").replace(/:$/, ""), s = new Set(Array.isArray(o.skipKeys) ? o.skipKeys.map(e => String(e)) : []), i = [];
    if (!e || "object" != typeof e) return i;
    for (const t of Object.keys(e)) {
        if (s.has(t)) continue;
        const o = e[t];
        if (!Array.isArray(o)) continue;
        const n = [];
        for (const e of o) if ("string" == typeof e) if (e.includes("://")) i.push(e); else {
            if (String(t).toLowerCase() === r) {
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
    const o = t && "object" == typeof t && !Array.isArray(t) ? t : {}, r = String(o.prefix || "rating:"), a = String(o.symbol || "⭐"), s = Number(e) / 2;
    return `${r}${a.repeat(s)}`;
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, o) {
    const r = String(null == e ? "" : e).trim() || t;
    return o ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), o = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(o.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(o.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(o.repository, "mythic3011/venera-configs", !0), i = __veneraNormalizeAuthorityPart(o.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(o.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${r}/${a}/${s}@${i}`;
    const u = n ? `${n}/${l}` : l;
    return `${r}/${a}/${s}@${i}/${l.startsWith(`${n}/`) ? l : u}`;
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
}, LRR_TAG_FILTER_PREFIXES = [ LRR_TAG_PREFIXES.rating, LRR_TAG_PREFIXES.dateAdded, LRR_TAG_PREFIXES.source ];
