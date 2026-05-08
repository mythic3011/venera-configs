class Komiic extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "Komiic", this.key = "Komiic", this.version = "1.0.3",
        this.minAppVersion = "1.0.0", this.url = resolvePluginUpdateUrl("komiic.js"), this.account = {
            login: async (e, n) => {
                let a = await Network.post("https://komiic.com/api/login", this.headers, {
                    email: e,
                    password: n
                });
                if (200 === a.status) return this.saveData("token", JSON.parse(a.body).token), "ok";
                throw "Failed to login";
            },
            logout: () => {
                this.deleteData("token");
            },
            registerWebsite: "https://komiic.com/register"
        }, this.explore = [ {
            title: "Komiic",
            type: "multiPageComicList",
            load: async e => await this.queryComics({
                operationName: "recentUpdate",
                variables: {
                    pagination: {
                        limit: 20,
                        offset: 20 * (e - 1),
                        orderBy: "DATE_UPDATED",
                        status: "",
                        asc: !0
                    }
                },
                query: "query recentUpdate($pagination: Pagination!) {\n  recentUpdate(pagination: $pagination) {\n    id\n    title\n    status\n    year\n    imageUrl\n    authors {\n      id\n      name\n      __typename\n    }\n    categories {\n      id\n      name\n      __typename\n    }\n    dateUpdated\n    monthViews\n    views\n    favoriteCount\n    lastBookUpdate\n    lastChapterUpdate\n    __typename\n  }\n}"
            })
        } ], this.category = {
            title: "Komiic",
            enableRankingPage: !0,
            parts: [ {
                name: "主题",
                type: "fixed",
                categories: [ "全部", "愛情", "神鬼", "校園", "搞笑", "生活", "懸疑", "冒險", "職場", "魔幻", "後宮", "魔法", "格鬥", "宅男", "勵志", "耽美", "科幻", "百合", "治癒", "萌系", "熱血", "競技", "推理", "雜誌", "偵探", "偽娘", "美食", "恐怖", "四格", "社會", "歷史", "戰爭", "舞蹈", "武俠", "機戰", "音樂", "體育", "黑道" ],
                itemType: "category",
                categoryParams: [ "0", "1", "3", "4", "5", "6", "7", "8", "10", "11", "2", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "9", "28", "31", "32", "33", "34", "35", "36", "37", "40", "42" ]
            } ]
        }, this.categoryComics = {
            load: async (e, n, a, t) => {
                let o = {
                    pagination: {
                        limit: 30,
                        offset: 30 * (t - 1),
                        orderBy: a[0],
                        asc: !1,
                        status: a[1]
                    }
                };
                return o.categoryId = "0" !== n ? [ n ] : [], await this.queryComics({
                    operationName: "comicByCategories",
                    variables: o,
                    query: "query comicByCategories($categoryId: [ID!]!, $pagination: Pagination!) {\n                  comicByCategories(categoryId: $categoryId, pagination: $pagination) {\n                      id\n                      title\n                      status\n                      year\n                      imageUrl\n                      authors { id name __typename }\n                      categories { id name __typename }\n                      dateUpdated\n                      monthViews\n                      views\n                      favoriteCount\n                      lastBookUpdate\n                      lastChapterUpdate\n                      __typename\n                  }\n              }"
                });
            },
            optionList: [ {
                options: [ "DATE_UPDATED-更新", "VIEWS-觀看數", "FAVORITE_COUNT-喜愛數" ],
                notShowWhen: null,
                showWhen: null
            }, {
                options: [ "-全部", "ONGOING-連載中", "END-完結" ],
                notShowWhen: null,
                showWhen: null
            } ],
            ranking: {
                options: [ "MONTH_VIEWS-月", "VIEWS-綜合" ],
                load: async (e, n) => this.queryComics({
                    operationName: "hotComics",
                    variables: {
                        pagination: {
                            limit: 20,
                            offset: 20 * (n - 1),
                            orderBy: e,
                            status: "",
                            asc: !0
                        }
                    },
                    query: "query hotComics($pagination: Pagination!) {\n  hotComics(pagination: $pagination) {\n    id\n    title\n    status\n    year\n    imageUrl\n    authors {\n      id\n      name\n      __typename\n    }\n    categories {\n      id\n      name\n      __typename\n    }\n    dateUpdated\n    monthViews\n    views\n    favoriteCount\n    lastBookUpdate\n    lastChapterUpdate\n    __typename\n  }\n}"
                })
            }
        }, this.search = {
            load: async (e, n, a) => ({
                comics: (await this.queryJson({
                    operationName: "searchComicAndAuthorQuery",
                    variables: {
                        keyword: e
                    },
                    query: "query searchComicAndAuthorQuery($keyword: String!) {\n  searchComicsAndAuthors(keyword: $keyword) {\n    comics {\n      id\n      title\n      status\n      year\n      imageUrl\n      authors {\n        id\n        name\n        __typename\n      }\n      categories {\n        id\n        name\n        __typename\n      }\n      dateUpdated\n      monthViews\n      views\n      favoriteCount\n      lastBookUpdate\n      lastChapterUpdate\n      __typename\n    }\n    authors {\n      id\n      name\n      chName\n      enName\n      wikiLink\n      comicCount\n      views\n      __typename\n    }\n    __typename\n  }\n}"
                })).data.searchComicsAndAuthors.comics.map(function(e) {
                    let n = "";
                    e.authors.length > 0 && (n = e.authors[0].name);
                    let a = [];
                    e.categories.forEach(e => {
                        a.push(e.name);
                    });
                    let t = function(e) {
                        const n = new Date - e, a = 36e5, t = 864e5;
                        return n < a ? "剛剛更新" : n < t ? `${Math.floor(n / a)}小時前更新` : `${Math.floor(n / t)}天前更新`;
                    }(new Date(e.dateUpdated));
                    return {
                        id: e.id,
                        title: e.title,
                        subTitle: n,
                        cover: e.imageUrl,
                        tags: a,
                        description: t
                    };
                }),
                maxPage: 1
            }),
            optionList: []
        }, this.favorites = {
            multiFolder: !0,
            addOrDelFavorite: async (e, n, a) => {
                let t = {};
                return t = a ? {
                    operationName: "addComicToFolder",
                    variables: {
                        comicId: e,
                        folderId: n
                    },
                    query: "mutation addComicToFolder($comicId: ID!, $folderId: ID!) {\n  addComicToFolder(comicId: $comicId, folderId: $folderId)\n}"
                } : {
                    operationName: "removeComicToFolder",
                    variables: {
                        comicId: e,
                        folderId: n
                    },
                    query: "mutation removeComicToFolder($comicId: ID!, $folderId: ID!) {\n  removeComicToFolder(comicId: $comicId, folderId: $folderId)\n}"
                }, await this.queryJson(t), "ok";
            },
            loadFolders: async e => {
                let n = await this.queryJson({
                    operationName: "myFolder",
                    variables: {},
                    query: "query myFolder {\n  folders {\n    id\n    key\n    name\n    views\n    comicCount\n    dateCreated\n    dateUpdated\n    __typename\n  }\n}"
                }), a = {};
                n.data.folders.forEach(e => {
                    a[e.id] = e.name;
                });
                let t = null;
                return e && (t = (await this.queryJson({
                    operationName: "comicInAccountFolders",
                    variables: {
                        comicId: e
                    },
                    query: "query comicInAccountFolders($comicId: ID!) {\n  comicInAccountFolders(comicId: $comicId)\n}"
                })).data.comicInAccountFolders), {
                    folders: a,
                    favorited: t
                };
            },
            addFolder: async e => (await this.queryJson({
                operationName: "createFolder",
                variables: {
                    name: e
                },
                query: "mutation createFolder($name: String!) {\n  createFolder(name: $name) {\n    id\n    key\n    name\n    account {\n      id\n      nickname\n      __typename\n    }\n    comicCount\n    views\n    dateCreated\n    dateUpdated\n    __typename\n  }\n}"
            }), "ok"),
            deleteFolder: async e => (await this.queryJson({
                operationName: "removeFolder",
                variables: {
                    folderId: e
                },
                query: "mutation removeFolder($folderId: ID!) {\n  removeFolder(folderId: $folderId)\n}"
            }), "ok"),
            loadComics: async (e, n) => {
                let a = (await this.queryJson({
                    operationName: "folderComicIds",
                    variables: {
                        folderId: n,
                        pagination: {
                            limit: 30,
                            offset: 30 * (e - 1),
                            orderBy: "DATE_UPDATED",
                            status: "",
                            asc: !0
                        }
                    },
                    query: "query folderComicIds($folderId: ID!, $pagination: Pagination!) {\n  folderComicIds(folderId: $folderId, pagination: $pagination) {\n    folderId\n    key\n    comicIds\n    __typename\n  }\n}"
                })).data.folderComicIds.comicIds;
                return 0 == a.length ? {
                    comics: [],
                    maxPage: 1
                } : this.queryComics({
                    operationName: "comicByIds",
                    variables: {
                        comicIds: a
                    },
                    query: "query comicByIds($comicIds: [ID]!) {\n  comicByIds(comicIds: $comicIds) {\n    id\n    title\n    status\n    year\n    imageUrl\n    authors {\n      id\n      name\n      __typename\n    }\n    categories {\n      id\n      name\n      __typename\n    }\n    dateUpdated\n    monthViews\n    views\n    favoriteCount\n    lastBookUpdate\n    lastChapterUpdate\n    __typename\n  }\n}"
                });
            }
        }, this.comic = {
            loadInfo: async e => {
                let n = (await this.queryJson({
                    operationName: "recommendComicById",
                    variables: {
                        comicId: e
                    },
                    query: "query recommendComicById($comicId: ID!) {\n  recommendComicById(comicId: $comicId)\n}"
                })).data.recommendComicById;
                n.push(e);
                let a = await Promise.all([ this.queryComics({
                    operationName: "comicByIds",
                    variables: {
                        comicIds: n
                    },
                    query: "query comicByIds($comicIds: [ID]!) {\n  comicByIds(comicIds: $comicIds) {\n    id\n    title\n    status\n    year\n    imageUrl\n    authors {\n      id\n      name\n      __typename\n    }\n    categories {\n      id\n      name\n      __typename\n    }\n    dateUpdated\n    monthViews\n    views\n    favoriteCount\n    lastBookUpdate\n    lastChapterUpdate\n    __typename\n  }\n}"
                }), (async () => {
                    let n = (await this.queryJson({
                        operationName: "chapterByComicId",
                        variables: {
                            comicId: e
                        },
                        query: "query chapterByComicId($comicId: ID!) {\n  chaptersByComicId(comicId: $comicId) {\n    id\n    serial\n    type\n    dateCreated\n    dateUpdated\n    size\n    __typename\n  }\n}"
                    })).data.chaptersByComicId, a = [], t = [];
                    n.forEach(e => {
                        "book" === e.type ? a.push(e) : t.push(e);
                    });
                    let o = new Map;
                    return a.forEach(e => {
                        let n = "卷" + e.serial;
                        o.set(e.id, n);
                    }), t.forEach(e => {
                        let n = e.serial;
                        o.set(e.id, n);
                    }), o;
                }).call() ]), t = a[0].comics.pop();
                return {
                    title: t.title,
                    cover: t.cover,
                    tags: {
                        作者: [ t.subTitle ],
                        标签: t.tags
                    },
                    chapters: a[1],
                    recommend: a[0].comics,
                    updateTime: t.updateTime
                };
            },
            loadEp: async (e, n) => ({
                images: (await this.queryJson({
                    operationName: "imagesByChapterId",
                    variables: {
                        chapterId: n
                    },
                    query: "query imagesByChapterId($chapterId: ID!) {\n  imagesByChapterId(chapterId: $chapterId) {\n    id\n    kid\n    height\n    width\n    __typename\n  }\n}"
                })).data.imagesByChapterId.map(e => `https://komiic.com/api/image/${e.kid}`)
            }),
            onImageLoad: (e, n, a) => ({
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    referer: `https://komiic.com/comic/${n}/chapter/${a}/images/all`
                }
            }),
            loadComments: async (e, n, a, t) => {
                let o = t ? "messageChan" : "getMessagesByComicId", i = t ? this.queryJson({
                    operationName: "messageChan",
                    variables: {
                        messageId: t
                    },
                    query: "query messageChan($messageId: ID!) {\n  messageChan(messageId: $messageId) {\n    id\n    comicId\n    account {\n      id\n      nickname\n      profileText\n      profileTextColor\n      profileBackgroundColor\n      profileImageUrl\n      __typename\n    }\n    message\n    replyTo {\n      id\n      __typename\n    }\n    upCount\n    downCount\n    dateUpdated\n    dateCreated\n    __typename\n  }\n}"
                }) : this.queryJson({
                    operationName: "getMessagesByComicId",
                    variables: {
                        comicId: e,
                        pagination: {
                            limit: 100,
                            offset: 100 * (a - 1),
                            orderBy: "DATE_UPDATED",
                            asc: !0
                        }
                    },
                    query: "query getMessagesByComicId($comicId: ID!, $pagination: Pagination!) {\n  getMessagesByComicId(comicId: $comicId, pagination: $pagination) {\n    id\n    comicId\n    account {\n      id\n      nickname\n      profileText\n      profileTextColor\n      profileBackgroundColor\n      profileImageUrl\n      __typename\n    }\n    message\n    replyTo {\n      id\n      message\n      account {\n        id\n        nickname\n        profileText\n        profileTextColor\n        profileBackgroundColor\n        profileImageUrl\n        __typename\n      }\n      __typename\n    }\n    upCount\n    downCount\n    dateUpdated\n    dateCreated\n    __typename\n  }\n}"
                });
                return {
                    comments: (await i).data[o].map(e => ({
                        userName: e.account.nickname,
                        avatar: e.account.profileImageUrl,
                        content: e.message,
                        time: e.dateUpdated,
                        replyCount: 0,
                        id: e.id
                    })),
                    maxPage: null
                };
            },
            sendComment: async (e, n, a, t) => (t || (t = "0"), await this.queryJson({
                operationName: "addMessageToComic",
                variables: {
                    comicId: e,
                    message: a,
                    replyToId: t
                },
                query: "mutation addMessageToComic($comicId: ID!, $replyToId: ID!, $message: String!) {\n  addMessageToComic(message: $message, comicId: $comicId, replyToId: $replyToId) {\n    id\n    message\n    comicId\n    account {\n      id\n      nickname\n      __typename\n    }\n    replyTo {\n      id\n      message\n      account {\n        id\n        nickname\n        profileText\n        profileTextColor\n        profileBackgroundColor\n        profileImageUrl\n        __typename\n      }\n      __typename\n    }\n    dateCreated\n    dateUpdated\n    __typename\n  }\n}"
            }), "ok")
        };
    }
    get headers() {
        let e = this.loadData("token"), n = {
            Referer: "https://komiic.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Content-Type": "application/json"
        };
        return e && (n.Authorization = `Bearer ${e}`), n;
    }
    async queryJson(e) {
        let n = await Network.post("https://komiic.com/api/query", this.headers, e);
        if (200 !== n.status) throw `Invalid Status Code ${n.status}`;
        let a = JSON.parse(n.body);
        if (null != a.errors) {
            const n = a.errors[0].message.toString();
            if (n.indexOf("token is expired") >= 0 || n.indexOf("no token") >= 0) {
                const n = this.loadData("account");
                return await this.account.login(n[0], n[1]), await this.queryJson(e);
            }
            throw a.errors[0].message;
        }
        return a;
    }
    async queryComics(e) {
        let n = e.operationName;
        return {
            comics: (await this.queryJson(e)).data[n].map(function(e) {
                let n = "";
                e.authors.length > 0 && (n = e.authors[0].name);
                let a = [];
                e.categories.forEach(e => {
                    a.push(e.name);
                });
                let t = new Date(e.dateUpdated), o = function(e) {
                    const n = new Date - e, a = 36e5, t = 864e5;
                    return n < a ? "剛剛更新" : n < t ? `${Math.floor(n / a)}小時前更新` : `${Math.floor(n / t)}天前更新`;
                }(t), i = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
                return {
                    id: e.id,
                    title: e.title,
                    subTitle: n,
                    cover: e.imageUrl,
                    tags: a,
                    description: o,
                    updateTime: i
                };
            }),
            maxPage: null
        };
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, n, a) {
    const t = String(null == e ? "" : e).trim() || n;
    return a ? t.replace(/^\/+|\/+$/g, "") : t;
}

function resolvePluginUpdateUrl(e) {
    const n = __veneraGetRuntimeGlobal(), a = n.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof n.__VENERA_RELEASE_AUTHORITY__ ? n.__VENERA_RELEASE_AUTHORITY__ : {}, t = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), o = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), r = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), d = String(e || "").replace(/^\/+/, "");
    if (!d) return `${t}/${o}/${i}@${r}`;
    const c = s ? `${s}/${d}` : d;
    return `${t}/${o}/${i}@${r}/${d.startsWith(`${s}/`) ? d : c}`;
}
