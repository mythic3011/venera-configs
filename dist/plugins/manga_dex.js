class MangaDex extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "MangaDex", this.key = "manga_dex", this.version = "1.1.1",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("manga_dex.js"),
        this.comicsPerPage = 20, this.api = {
            parseComic: e => {
                var a;
                let t = e.id, s = {}, i = e.attributes.title;
                for (let e of Object.keys(i)) s[e] = i[e];
                for (let a of e.attributes.altTitles) for (let e of Object.keys(a)) void 0 === s[e] && (s[e] = a[e]);
                let r = APP.locale, o = "", c = s[Object.keys(s)[0]];
                r.startsWith("en") ? o = s.en || s.ja || c : r.startsWith("zh_CN") ? o = s.zh || s["zh-hk"] || s["zh-tw"] || s.ja || c : r.startsWith("zh_TW") && (o = s["zh-hk"] || s["zh-tw"] || s.zh || s.ja || c);
                let n = [];
                for (let a of e.attributes.tags) n.push(a.attributes.name.en);
                let l = null == (a = e.relationships.find(e => "cover_art" === e.type)) ? void 0 : a.attributes.fileName;
                l = l ? `https://mangadex.org/covers/${t}/${l}.256.jpg` : "";
                let d = e.attributes.description.en, u = e.attributes.createdAt, f = e.attributes.updatedAt, p = e.attributes.status, g = [], b = [];
                for (let a of e.relationships) if ("author" === a.type) {
                    let e = a.attributes.name, t = a.id;
                    g.push(e), this.authors[e] = t;
                } else if ("artist" === a.type) {
                    let e = a.attributes.name, t = a.id;
                    b.push(e), this.artists[e] = t;
                }
                return {
                    id: t,
                    title: o,
                    subtitle: g.at(0),
                    titles: s,
                    cover: l,
                    tags: n,
                    description: d,
                    createTime: u,
                    updateTime: f,
                    status: p,
                    authors: g,
                    artists: b
                };
            },
            parseMangaList: e => {
                let a = [];
                for (let t of e.data) a.push(this.api.parseComic(t));
                return {
                    comics: a,
                    maxPage: Math.ceil(e.total / this.comicsPerPage)
                };
            },
            getPopular: async e => {
                let a = new Date;
                a = new Date(a.getTime() - 2592e6);
                let t = `https://api.mangadex.org/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[followedCount]=desc&hasAvailableChapters=true&createdAtSince=${a.toISOString().substring(0, 19)}&limit=${this.comicsPerPage}`;
                e && e > 1 && (t += "&offset=" + (e - 1) * this.comicsPerPage);
                let s = await fetch(t), i = await s.json();
                return this.api.parseMangaList(i);
            },
            getRecent: async e => {
                let a = `https://api.mangadex.org/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[createdAt]=desc&hasAvailableChapters=true&limit=${this.comicsPerPage}`;
                e && e > 1 && (a += "&offset=" + (e - 1) * this.comicsPerPage);
                let t = await fetch(a), s = await t.json();
                return this.api.parseMangaList(s);
            },
            getUpdated: async e => {
                let a = `https://api.mangadex.org/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[latestUploadedChapter]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&limit=${this.comicsPerPage}`;
                e && e > 1 && (a += "&offset=" + (e - 1) * this.comicsPerPage);
                let t = await fetch(a), s = await t.json();
                return this.api.parseMangaList(s);
            }
        }, this.explore = [ {
            title: "Manga Dex",
            type: "multiPartPage",
            load: async e => {
                let a = await Promise.all([ this.api.getPopular(e), this.api.getRecent(e), this.api.getUpdated(e) ]), t = [ "Popular", "Recent", "Updated" ], s = [ {
                    page: "search",
                    attributes: {
                        options: [ "popular", "any", "any" ]
                    }
                }, {
                    page: "search",
                    attributes: {
                        options: [ "recent", "any", "any" ]
                    }
                }, {
                    page: "search",
                    attributes: {
                        options: [ "updated", "any", "any" ]
                    }
                } ], i = [];
                for (let e = 0; e < a.length; e++) {
                    let r = a[e];
                    i.push({
                        title: t[e],
                        comics: r.comics,
                        viewMore: s[e]
                    });
                }
                return i;
            }
        } ], this.category = {
            title: "MangaDex",
            parts: [ {
                name: "Tags",
                type: "dynamic",
                loader: () => {
                    let e = [];
                    for (let a of Object.keys(this.tags)) e.push({
                        label: a,
                        target: {
                            action: "category",
                            keyword: a,
                            param: this.tags[a]
                        }
                    });
                    return e;
                }
            } ],
            enableRankingPage: !1
        }, this.categoryComics = {
            load: async (e, a, t = [], s = 1) => {
                if (!a) throw new Error("No tag id provided for category comics");
                const i = (e, a) => null == e || "" === e ? a : e.split("-")[0] || a, r = i(t[0], "popular"), o = i(t[1], "any"), c = i(t[2], "any");
                let n, l = [ "includes[]=cover_art", "includes[]=artist", "includes[]=author", "hasAvailableChapters=true", `limit=${this.comicsPerPage}`, `includedTags[]=${encodeURIComponent(a)}` ];
                if (s && s > 1 && l.push("offset=" + (s - 1) * this.comicsPerPage), "any" !== r) {
                    const e = {
                        popular: "followedCount",
                        follows: "followedCount",
                        recent: "createdAt",
                        updated: "latestUploadedChapter",
                        rating: "rating"
                    }[r];
                    e && l.push(`order[${e}]=desc`);
                }
                n = "any" === o ? [ "safe", "suggestive", "erotica" ] : [ o ];
                for (let e of n) l.push(`contentRating[]=${encodeURIComponent(e)}`);
                "any" !== c && l.push(`status[]=${encodeURIComponent(c)}`);
                let d = `https://api.mangadex.org/manga?${l.join("&")}`, u = await fetchMangaDexJson(d), f = u.total || 0, p = [];
                for (let e of u.data || []) p.push(this.api.parseComic(e));
                return {
                    comics: p,
                    maxPage: f ? Math.ceil(f / this.comicsPerPage) : p.length < this.comicsPerPage ? s : s + 1
                };
            },
            optionList: [ {
                options: [ "any-Any", "popular-Popular", "recent-Recent", "updated-Updated", "rating-Rating", "follows-Follows" ]
            }, {
                options: [ "any-Any", "safe-Safe", "suggestive-Suggestive", "erotica-Erotica" ]
            }, {
                options: [ "any-Any", "ongoing-Ongoing", "completed-Completed", "hiatus-Hiatus", "cancelled-Cancelled" ]
            } ]
        }, this.search = {
            load: async (e, a, t) => {
                let s = "";
                "any" !== a[0] && (s = {
                    popular: "order[followedCount]=desc&",
                    recent: "order[createdAt]=desc&",
                    updated: "order[latestUploadedChapter]=desc&",
                    rating: "order[rating]=desc&",
                    follows: "order[followedCount]=desc&"
                }[a[0]]);
                let i = "";
                "any" !== a[1] && (i = `contentRating[]=${a[1]}&`);
                let r = "";
                "any" !== a[2] && (r = `status[]=${a[2]}&`);
                let o = "https://api.mangadex.org/manga?includes[]=cover_art&includes[]=artist&includes[]=author&" + s + i + r + "hasAvailableChapters=true&" + `limit=${this.comicsPerPage}`;
                if (t && t > 1 && (o += "&offset=" + (t - 1) * this.comicsPerPage), e) {
                    let a = e.split(" "), t = [];
                    for (let e of a) if ("" !== e) if (e.startsWith("tag:")) {
                        let a = e.substring(4);
                        a = a.replaceAll("_", " ");
                        let s = this.tags[a];
                        void 0 !== s ? o += `&includedTags[]=${s}` : t.push(e);
                    } else if (e.startsWith("author:")) {
                        let a = e.substring(7);
                        a = a.replaceAll("_", " ");
                        let s = this.authors[a];
                        void 0 !== s ? o += `&authorOrArtist=${s}` : t.push(e);
                    } else if (e.startsWith("artist:")) {
                        let a = e.substring(7);
                        a = a.replaceAll("_", " ");
                        let s = this.artists[a];
                        void 0 !== s ? o += `&authorOrArtist=${s}` : t.push(e);
                    } else t.push(e);
                    "" !== (e = t.join(" ")) && (o += `&title=${e}`);
                }
                let c = await fetchMangaDexJson(o);
                return this.api.parseMangaList(c);
            },
            optionList: [ {
                label: "Sort By",
                type: "select",
                options: [ "any-Any", "popular-Popular", "recent-Recent", "updated-Updated", "rating-Rating", "follows-Follows" ]
            }, {
                label: "Content Rating",
                type: "select",
                options: [ "any-Any", "safe-Safe", "suggestive-Suggestive", "erotica-Erotica" ]
            }, {
                label: "Status",
                type: "select",
                options: [ "any-Any", "ongoing-Ongoing", "completed-Completed", "hiatus-Hiatus", "cancelled-Cancelled" ]
            } ],
            enableTagsSuggestions: !1
        }, this.comic = {
            getComic: async e => {
                let a = await fetchMangaDexJson(`https://api.mangadex.org/manga/${e}?includes[]=cover_art&includes[]=artist&includes[]=author`);
                return this.api.parseComic(a.data);
            },
            getChapters: async e => {
                let a = await fetchMangaDexJson(`https://api.mangadex.org/manga/${e}/feed?limit=500&translatedLanguage[]=en&order[chapter]=asc`), t = new Map;
                for (let e of a.data) {
                    var s;
                    let a = e.id, i = null != (s = e.attributes.chapter) ? s : "Oneshot", r = e.attributes.title;
                    r = r ? `${i}: ${r}` : i;
                    let o = e.attributes.volume;
                    o = o ? `Volume ${o}` : "No Volume", void 0 === t.get(o) && t.set(o, new Map), t.get(o).set(a, r);
                }
                return t;
            },
            getStats: async e => {
                var a, t;
                let s = await fetchMangaDexJson(`https://api.mangadex.org/statistics/manga/${e}`);
                return {
                    comments: (null == (a = s.statistics[e].comments) ? void 0 : a.repliesCount) || 0,
                    threadId: null == (t = s.statistics[e].comments) ? void 0 : t.threadId,
                    follows: s.statistics[e].follows || 0,
                    rating: s.statistics[e].rating.average || 0
                };
            },
            loadInfo: async e => {
                let a = await Promise.all([ this.comic.getComic(e), this.comic.getChapters(e), this.comic.getStats(e) ]), t = a[0], s = a[1], i = a[2];
                return new ComicDetails({
                    id: t.id,
                    title: t.title,
                    subtitle: t.subtitle,
                    cover: t.cover,
                    tags: {
                        Tags: t.tags,
                        Status: t.status,
                        Authors: t.authors,
                        Artists: t.artists
                    },
                    description: t.description,
                    updateTime: t.updateTime,
                    uploadTime: t.createTime,
                    status: t.status,
                    chapters: s,
                    stars: (i.rating || 0) / 2,
                    url: `https://mangadex.org/title/${t.id}`
                });
            },
            starRating: async (e, a) => {},
            loadEp: async (e, a) => {
                if (!a) throw new Error("No chapter id provided");
                let t = await fetchMangaDexJson(`https://api.mangadex.org/at-home/server/${a}`), s = [];
                if ("Original" == this.loadSetting("image_quality")) for (let e of t.chapter.data) s.push(`https://uploads.mangadex.org/data/${t.chapter.hash}/${e}`); else for (let e of t.chapter.dataSaver) s.push(`https://uploads.mangadex.org/data-saver/${t.chapter.hash}/${e}`);
                return {
                    images: s
                };
            },
            loadComments: async (e, a, t, s) => {
                let i = (await this.comic.getStats(e)).threadId;
                if (!i) return {
                    comments: [],
                    maxPage: 1
                };
                let r = `https://forums.mangadex.org/threads/${i}/page-${t}`, o = await fetch(r);
                if (!o.ok) throw new Error(`Failed to load forum page: ${o.status}`);
                let c = await o.text(), n = new HtmlDocument(c), l = [], d = n.querySelectorAll("article.message");
                for (let e of d) {
                    let a = e.attributes.id || "", t = e.querySelector(".message-name"), s = t ? t.text : "Unknown", i = e.querySelector(".avatar img"), r = i ? i.attributes.src : null;
                    r && (r = "https://forums.mangadex.org" + r);
                    let o = e.querySelector("time"), c = o ? o.text : "Unknown", n = e.querySelector(".bbWrapper"), d = "";
                    n && (d = n.innerHTML, d = n.innerHTML.replace(/[\r\n\t]+/g, ""), d = d.replace(/<div class="bbCodeBlock-expandLink[^>]*>.*?<\/div>/gi, ""),
                    d = d.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ""), d = d.replace(/<blockquote[^>]*>/gi, '<span style="font-style:italic;font-weight:lighter">'),
                    d = d.replace(/<\/blockquote>/gi, "</span>"), d = d.replace(/<button[^>]*class="[^"]*bbCodeSpoiler-button[^"]*"[^>]*>([\s\S]*?)<\/button>/gi, '<span style="font-weight:bold">[$1]</span>'),
                    d = d.replace(/<img([^>]*)>/gi, (e, a) => {
                        if (a.includes("smilie")) {
                            let e = a.match(/alt="([^"]+)"/i);
                            return e ? e[1] : "";
                        }
                        let t = a.match(/src="([^"]+)"/i);
                        if (t) {
                            let e = t[1];
                            if (e.startsWith("/")) return e = "https://forums.mangadex.org" + e, `<img${a.replace(t[0], `src="${e}"`)}>`;
                        }
                        return e;
                    }), d = d.replace(/<\/?([a-z0-9]+)[^>]*>/gi, (e, a) => [ "img", "a", "b", "i", "u", "s", "br", "span", "strong" ].includes(a.toLowerCase()) ? e : [ "div", "p" ].includes(a.toLowerCase()) && e.startsWith("</") ? "<br>" : "")),
                    l.push(new Comment({
                        id: a,
                        userName: s,
                        avatar: r,
                        content: d,
                        time: c
                    }));
                }
                let u = t, f = n.querySelectorAll(".pageNav-page > a");
                if (f && f.length > 0) {
                    let e = f[f.length - 1].text, a = parseInt(e);
                    isNaN(a) || (u = Math.max(u, a));
                }
                return n.dispose(), {
                    comments: l,
                    maxPage: u
                };
            },
            sendComment: async (e, a, t, s) => {
                throw new Error("Not implemented");
            },
            onClickTag: (e, a) => {
                let t = a = a.replaceAll(" ", "_");
                return "Tags" === e ? t = `tag:${a}` : "Authors" === e ? t = `author:${a}` : "Artists" === e && (t = `artist:${a}`),
                {
                    page: "search",
                    attributes: {
                        keyword: t
                    }
                };
            },
            link: {
                domains: [ "mangadex.org" ],
                linkToId: e => {
                    e.includes("?") && (e = e.split("?")[0]);
                    let a = e.match(/\/(title|manga)\/([a-f0-9-]{36})/i);
                    return a ? a[2] : null;
                }
            }
        }, this.settings = {
            image_quality: {
                title: "Image Quality",
                type: "select",
                options: [ {
                    value: "Original",
                    text: "Original"
                }, {
                    value: "Compressed",
                    text: "Compressed"
                } ],
                default: "Original"
            }
        }, this.translation = {
            zh_CN: {},
            zh_TW: {},
            en: {}
        }, this.tags = {
            Oneshot: "0234a31e-a729-4e28-9d6a-3f87c4966b9e",
            Thriller: "07251805-a27e-4d59-b488-f0bfbec15168",
            "Award Winning": "0a39b5a1-b235-4886-a747-1d05d216532d",
            Reincarnation: "0bc90acb-ccc1-44ca-a34a-b9f3a73259d0",
            "Sci-Fi": "256c8bd9-4904-4360-bf4f-508a76d67183",
            "Time Travel": "292e862b-2d17-4062-90a2-0356caa4ae27",
            Genderswap: "2bd2e8d0-f146-434a-9b51-fc9ff2c5fe6a",
            Loli: "2d1f5d56-a1e5-4d0d-a961-2193588b08ec",
            "Traditional Games": "31932a7e-5b8e-49a6-9f12-2afa39dc544c",
            "Official Colored": "320831a8-4026-470b-94f6-8353740e6f04",
            Historical: "33771934-028e-4cb3-8744-691e866a923e",
            Monsters: "36fd93ea-e8b8-445e-b836-358f02b3d33d",
            Action: "391b0423-d847-456f-aff0-8b0cfc03066b",
            Demons: "39730448-9a5f-48a2-85b0-a70db87b1233",
            Psychological: "3b60b75c-a2d7-4860-ab56-05f391bb889c",
            Ghosts: "3bb26d85-09d5-4d2e-880c-c34b974339e9",
            Animals: "3de8c75d-8ee3-48ff-98ee-e20a65c86451",
            "Long Strip": "3e2b8dae-350e-4ab8-a8ce-016e844b9f0d",
            Romance: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
            Ninja: "489dd859-9b61-4c37-af75-5b18e88daafc",
            Comedy: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
            Mecha: "50880a9d-5440-4732-9afb-8f457127e836",
            Anthology: "51d83883-4103-437c-b4b1-731cb73d786c",
            "Boys' Love": "5920b825-4181-4a17-beeb-9918b0ff7a30",
            Incest: "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
            Crime: "5ca48985-9a9d-4bd8-be29-80dc0303db72",
            Survival: "5fff9cde-849c-4d78-aab0-0d52b2ee1d25",
            Zombies: "631ef465-9aba-4afb-b0fc-ea10efe274a8",
            "Reverse Harem": "65761a2a-415e-47f3-bef2-a9dababba7a6",
            Sports: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
            Superhero: "7064a261-a137-4d3a-8848-2d385de3a99c",
            "Martial Arts": "799c202e-7daa-44eb-9cf7-8a3c0441531e",
            "Fan Colored": "7b2ce280-79ef-4c09-9b58-12b7c23a9b78",
            Samurai: "81183756-1453-4c81-aa9e-f6e1b63be016",
            "Magical Girls": "81c836c9-914a-4eca-981a-560dad663e73",
            Mafia: "85daba54-a71c-4554-8a28-9901a8b0afad",
            Adventure: "87cc87cd-a395-47af-b27a-93258283bbc6",
            "Self-Published": "891cf039-b895-47f0-9229-bef4c96eccd4",
            "Virtual Reality": "8c86611e-fab7-4986-9dec-d1a2f44acdd5",
            "Office Workers": "92d6d951-ca5e-429c-ac78-451071cbf064",
            "Video Games": "9438db5a-7e2a-4ac0-b39e-e0d95a34b8a8",
            "Post-Apocalyptic": "9467335a-1b83-4497-9231-765337a00b96",
            "Sexual Violence": "97893a4c-12af-4dac-b6be-0dffb353568e",
            Crossdressing: "9ab53f92-3eed-4e9b-903a-917c86035ee3",
            Magic: "a1f53773-c69a-4ce5-8cab-fffcd90b1565",
            "Girls' Love": "a3c67850-4684-404e-9b7f-c69850ee5da6",
            Harem: "aafb99c1-7f60-43fa-b75f-fc9502ce29c7",
            Military: "ac72833b-c4e9-4878-b9db-6c8a4a99444a",
            Wuxia: "acc803a4-c95a-4c22-86fc-eb6b582d82a2",
            Isekai: "ace04997-f6bd-436e-b261-779182193d3d",
            "4-Koma": "b11fda93-8f1d-4bef-b2ed-8803d3733170",
            Doujinshi: "b13b2a48-c720-44a9-9c77-39c9979373fb",
            Philosophical: "b1e97889-25b4-4258-b28b-cd7f4d28ea9b",
            Gore: "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
            Drama: "b9af3a63-f058-46de-a9a0-e0c13906197a",
            Medical: "c8cbe35b-1b2b-4a3f-9c37-db84c4514856",
            "School Life": "caaa44eb-cd40-4177-b930-79d3ef2afe87",
            Horror: "cdad7e68-1419-41dd-bdce-27753074a640",
            Fantasy: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
            Villainess: "d14322ac-4d6f-4e9b-afd9-629d5f4d8a41",
            Vampires: "d7d1730f-6eb0-4ba6-9437-602cac38664c",
            Delinquents: "da2d50ca-3018-4cc0-ac7a-6b7d472a29ea",
            "Monster Girls": "dd1f77c5-dea9-4e2b-97ae-224af09caf99",
            Shota: "ddefd648-5140-4e5f-ba18-4eca4071d19b",
            Police: "df33b754-73a3-4c54-80e6-1a74a8058539",
            "Web Comic": "e197df38-d0e7-43b5-9b09-2842d0c326dd",
            "Slice of Life": "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
            Aliens: "e64f6742-c834-471d-8d72-dd51fc02b835",
            Cooking: "ea2bc92d-1c26-4930-9b7c-d5c0dc1b6869",
            Supernatural: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75",
            Mystery: "ee968100-4191-4968-93d3-f82d72be7e46",
            Adaptation: "f4122d1c-3b44-44d0-9936-ff7502c39ad3",
            Music: "f42fbf9e-188a-447b-9fdc-f19dc1e4d685",
            "Full Color": "f5ba408b-0e7a-484d-8d49-4e9125ac96de",
            Tragedy: "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
            Gyaru: "fad12b5e-68ba-460e-b933-9ae8318f5b65"
        }, this.authors = {}, this.artists = {};
    }
}

async function fetchMangaDexJson(e) {
    const a = await fetch(e);
    if (!a.ok) throw new Error("Network response was not ok");
    return await a.json();
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, a, t) {
    const s = String(null == e ? "" : e).trim() || a;
    return t ? s.replace(/^\/+|\/+$/g, "") : s;
}

function resolvePluginUpdateUrl(e) {
    const a = __veneraGetRuntimeGlobal(), t = a.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof a.__VENERA_RELEASE_AUTHORITY__ ? a.__VENERA_RELEASE_AUTHORITY__ : {}, s = __veneraNormalizeAuthorityPart(t.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), i = __veneraNormalizeAuthorityPart(t.providerPath, "gh", !0), r = __veneraNormalizeAuthorityPart(t.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(t.releaseRef, "main", !1), c = __veneraNormalizeAuthorityPart(t.artifactPathPrefix, "dist/plugins", !0), n = String(e || "").replace(/^\/+/, "");
    if (!n) return `${s}/${i}/${r}@${o}`;
    const l = c ? `${c}/${n}` : n;
    return `${s}/${i}/${r}@${o}/${n.startsWith(`${c}/`) ? n : l}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
