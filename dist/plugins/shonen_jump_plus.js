class ShonenJumpPlus extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "少年ジャンプ＋", this.key = "shonen_jump_plus", this.version = "1.1.1",
        this.minAppVersion = "1.2.1", this.url = resolvePluginUpdateUrl("shonen_jump_plus.js"),
        this.deviceId = this.generateDeviceId(), this.bearerToken = null, this.userAccountId = null,
        this.tokenExpiry = 0, this.latestVersion = "4.0.24", this.apiBase = "https://shonenjumpplus.com/api/v1",
        this.explore = [ {
            title: "少年ジャンプ＋",
            type: "singlePageWithMultiPart",
            load: async () => {
                await this.ensureAuth();
                const e = await this.graphqlRequest("HomeCacheable", {});
                if (!e || !e.data || !e.data.homeSections) throw "Cannot fetch home sections";
                const t = e.data.homeSections.find(e => "DailyRankingSection" === e.__typename);
                if (!t || !t.dailyRankings) throw "Cannot fetch daily ranking data";
                const n = t.dailyRankings.find(e => e.ranking && "DailyRanking" === e.ranking.__typename);
                if (!(n && n.ranking && n.ranking.items && n.ranking.items.edges)) throw "Cannot fetch ranking data structure";
                const i = n.ranking.items.edges.map(e => e.node).filter(e => "DailyRankingValidItem" === e.__typename && e.product).map(function(e) {
                    const t = e.product.series;
                    if (!t) return null;
                    const n = t.squareThumbnailUriTemplate || t.horizontalThumbnailUriTemplate;
                    return {
                        id: t.databaseId,
                        title: t.title || "",
                        cover: n ? n.replace("{height}", "500").replace("{width}", "500") : "",
                        tags: [],
                        description: `Ranking: ${e.rank} · Views: ${e.viewCount || "Unknown"}`
                    };
                }).filter(e => null !== e), a = {};
                return a["Daily Ranking"] = i, a;
            }
        } ], this.search = {
            load: async (e, t, n) => {
                var i, a;
                (!this.bearerToken || Date.now() > this.tokenExpiry) && await this.fetchBearerToken();
                const s = await this.graphqlRequest("SearchResult", {
                    keyword: e
                }), r = (null == s || null == (i = s.data) || null == (i = i.search) ? void 0 : i.edges) || [], o = (null == s || null == (a = s.data) || null == (a = a.search) ? void 0 : a.pageInfo) || {};
                return {
                    comics: r.map(({node: e}) => {
                        var t, n;
                        const i = ((null == (t = e.author) ? void 0 : t.name) || "").split(/\s*\/\s*/).filter(Boolean), a = (null == (n = e.latestIssue) ? void 0 : n.thumbnailUriTemplate) || e.thumbnailUriTemplate;
                        return "Series" === e.__typename ? new Comic({
                            id: e.databaseId,
                            title: e.title || "",
                            cover: this.replaceCoverUrl(a),
                            description: e.description || "",
                            tags: i
                        }) : "MagazineLabel" === e.__typename ? new Comic({
                            id: e.databaseId,
                            title: e.title || "",
                            cover: this.replaceCoverUrl(a)
                        }) : null;
                    }).filter(Boolean),
                    maxPage: o.hasNextPage ? (n || 1) + 1 : n || 1,
                    endCursor: o.endCursor
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                var t;
                await this.ensureAuth();
                const n = await this.fetchSeriesDetail(e), i = await this.fetchEpisodes(e), {chapters: a, latestPublishAt: s} = i.reduce((e, t) => ({
                    chapters: {
                        ...e.chapters,
                        [t.databaseId]: t.title || ""
                    },
                    latestPublishAt: t.publishedAt && t.publishedAt > e.latestPublishAt ? t.publishedAt : e.latestPublishAt
                }), {
                    chapters: {},
                    latestPublishAt: ""
                }), r = s > n.openAt ? s : n.openAt, o = new Date(new Date(r) - 36e5), l = ((null == (t = n.author) ? void 0 : t.name) || "").split(/\s*\/\s*/).filter(Boolean);
                return new ComicDetails({
                    title: n.title || "",
                    subtitle: l.join(" / "),
                    cover: this.replaceCoverUrl(n.thumbnailUriTemplate),
                    description: n.description || "",
                    tags: {
                        Author: l,
                        Update: [ o.toISOString().slice(0, 10) ]
                    },
                    url: `https://shonenjumpplus.com/app/episode/${n.publisherId}`,
                    chapters: a
                });
            },
            loadEp: async (e, t) => {
                await this.ensureAuth();
                const n = this.normalizeEpisodeId(t), i = await this.fetchEpisodePages(n);
                return this.isEpisodeAccessible(i) ? this.buildImageUrls(i) : (await this.handleEpisodePurchase(i),
                this.comic.loadEp(e, t));
            },
            onImageLoad: e => {
                const [t, n] = e.split("?token=");
                return {
                    url: t,
                    headers: {
                        "X-Giga-Page-Image-Auth": n
                    }
                };
            },
            onClickTag: (e, t) => {
                if ("Author" === e) return {
                    action: "search",
                    keyword: `${t}`,
                    param: null
                };
                throw "Unsupported tag namespace: " + e;
            }
        };
    }
    get headers() {
        return {
            Origin: "https://shonenjumpplus.com",
            Referer: "https://shonenjumpplus.com/",
            "X-Giga-Device-Id": this.deviceId,
            "User-Agent": `ShonenJumpPlus-Android/${this.latestVersion}`
        };
    }
    generateDeviceId() {
        let e = "";
        for (let t = 0; t < 16; t++) e += "0123456789abcdef"[randomInt(0, 15)];
        return e;
    }
    async init() {
        const e = (await Network.get("https://apps.apple.com/jp/app/id875750302")).body.match(/whats-new__latest__version">[^<]*?([\d.]+)</);
        e && e[1] && (this.latestVersion = e[1]);
    }
    async ensureAuth() {
        (!this.bearerToken || Date.now() > this.tokenExpiry) && await this.fetchBearerToken();
    }
    async graphqlRequest(e, t) {
        const n = {
            operationName: e,
            variables: t,
            query: GraphQLQueries[e]
        }, i = await Network.post(`${this.apiBase}/graphql?opname=${e}`, {
            ...this.headers,
            Authorization: `Bearer ${this.bearerToken}`,
            Accept: "application/json",
            "X-APOLLO-OPERATION-NAME": e,
            "Content-Type": "application/json"
        }, JSON.stringify(n));
        if (200 !== i.status) throw `Invalid status: ${i.status}`;
        return JSON.parse(i.body);
    }
    normalizeEpisodeId(e) {
        return "object" == typeof e ? e.id : "string" == typeof e && e.includes("/") ? e.split("/").pop() : e;
    }
    replaceCoverUrl(e) {
        return (e || "").replace("{height}", "1500").replace("{width}", "1500") || "";
    }
    async fetchBearerToken() {
        const e = await Network.post(`${this.apiBase}/user_account/access_token`, this.headers, ""), {access_token: t, user_account_id: n} = JSON.parse(e.body);
        this.bearerToken = t, this.userAccountId = n, this.tokenExpiry = Date.now() + 36e5;
    }
    async fetchSeriesDetail(e) {
        var t;
        const n = await this.graphqlRequest("SeriesDetail", {
            id: e
        });
        return (null == n || null == (t = n.data) ? void 0 : t.series) || {};
    }
    async fetchEpisodes(e) {
        var t;
        const n = await this.graphqlRequest("SeriesDetailEpisodeList", {
            id: e,
            episodeOffset: 0,
            episodeFirst: 1500,
            episodeSort: "NUMBER_ASC"
        });
        return ((null == n || null == (t = n.data) || null == (t = t.series) || null == (t = t.episodes) ? void 0 : t.edges) || []).map(e => e.node);
    }
    async fetchEpisodePages(e) {
        var t;
        const n = await this.graphqlRequest("EpisodeViewerConditionallyCacheable", {
            episodeID: e
        });
        return (null == n || null == (t = n.data) ? void 0 : t.episode) || {};
    }
    isEpisodeAccessible({purchaseInfo: e}) {
        return (null == e ? void 0 : e.isFree) || (null == e ? void 0 : e.hasPurchased) || (null == e ? void 0 : e.hasRented);
    }
    async handleEpisodePurchase(e) {
        const {id: t, purchaseInfo: n} = e, {purchasableViaOnetimeFree: i, rentable: a, unitPrice: s} = n || {};
        i && await this.consumeOnetimeFree(t), a && await this.rentChapter(t, s);
    }
    buildImageUrls({pageImages: e, pageImageToken: t}) {
        return {
            images: e.edges.flatMap(e => {
                var t;
                return null == (t = e.node) ? void 0 : t.src;
            }).filter(Boolean).map(e => `${e}?token=${t}`)
        };
    }
    async consumeOnetimeFree(e) {
        var t;
        const n = await this.graphqlRequest("ConsumeOnetimeFree", {
            input: {
                id: e
            }
        });
        return null == n || null == (t = n.data) || null == (t = t.consumeOnetimeFree) ? void 0 : t.isSuccess;
    }
    async rentChapter(e, t, n = 0) {
        var i, a;
        if (n > 3) throw "Failed to rent chapter after multiple attempts.";
        const s = await this.graphqlRequest("Rent", {
            input: {
                id: e,
                unitPrice: t
            }
        });
        return "FAILED_TO_USE_POINT" === (null == (i = s.errors) || null == (i = i[0]) || null == (i = i.extensions) ? void 0 : i.code) ? (await this.refreshAccount(),
        this.rentChapter(e, t, n + 1)) : (this.userAccountId = null == s || null == (a = s.data) || null == (a = a.rent) || null == (a = a.userAccount) ? void 0 : a.databaseId,
        !0);
    }
    async refreshAccount() {
        this.deviceId = this.generateDeviceId(), this.bearerToken = this.userAccountId = null,
        this.tokenExpiry = 0, await this.fetchBearerToken(), await this.addUserDevice();
    }
    async addUserDevice() {
        await this.graphqlRequest("AddUserDevice", {
            input: {
                deviceName: `Android ${21 + Math.floor(14 * Math.random())}`,
                modelName: `Device-${Math.random().toString(36).slice(2, 10)}`,
                osName: `Android ${9 + Math.floor(6 * Math.random())}`
            }
        }), this.addUserDeviceCalled = !0;
    }
}

const GraphQLQueries = {
    SearchResult: "query SearchResult($after: String, $keyword: String!) {\n        search(after: $after, first: 50, keyword: $keyword, types: [SERIES,MAGAZINE_LABEL]) {\n            pageInfo { hasNextPage endCursor }\n            edges {\n                node {\n                    __typename\n                    ... on Series { id databaseId title thumbnailUriTemplate author { name } description }\n                    ... on MagazineLabel { id databaseId title thumbnailUriTemplate latestIssue { thumbnailUriTemplate } }\n                }\n            }\n        }\n    }",
    SeriesDetail: "query SeriesDetail($id: String!) {\n        series(databaseId: $id) {\n            id databaseId title thumbnailUriTemplate\n            author { name }\n            description\n            hashtags serialUpdateScheduleLabel\n            openAt\n            publisherId\n        }\n    }",
    SeriesDetailEpisodeList: "query SeriesDetailEpisodeList($id: String!, $episodeOffset: Int, $episodeFirst: Int, $episodeSort: ReadableProductSorting) {\n        series(databaseId: $id) {\n            episodes: readableProducts(types: [EPISODE], first: $episodeFirst, offset: $episodeOffset, sort: $episodeSort) {\n                edges { node { databaseId title publishedAt } }\n            }\n        }\n    }",
    EpisodeViewerConditionallyCacheable: "query EpisodeViewerConditionallyCacheable($episodeID: String!) {\n        episode(databaseId: $episodeID) {\n            id pageImages { edges { node { src } } } pageImageToken\n            purchaseInfo {\n                isFree hasPurchased hasRented\n                purchasableViaOnetimeFree rentable unitPrice\n            }\n        }\n    }",
    ConsumeOnetimeFree: "mutation ConsumeOnetimeFree($input: ConsumeOnetimeFreeInput!) {\n        consumeOnetimeFree(input: $input) { isSuccess }\n    }",
    Rent: "mutation Rent($input: RentInput!) {\n        rent(input: $input) {\n            userAccount { databaseId }\n        }\n    }",
    AddUserDevice: "mutation AddUserDevice($input: AddUserDeviceInput!) {\n        addUserDevice(input: $input) { isSuccess }\n    }",
    HomeCacheable: "query HomeCacheable {\n    homeSections {\n      __typename\n      ...DailyRankingSection\n    }\n  }\n  fragment DesignSectionImage on DesignSectionImage {\n    imageUrl width height\n  }\n  fragment SerialInfoIcon on SerialInfo {\n    isOriginal isIndies\n  }\n  fragment DailyRankingSeries on Series {\n    id databaseId publisherId title\n    horizontalThumbnailUriTemplate: subThumbnailUri(type: HORIZONTAL_WITH_LOGO)\n    squareThumbnailUriTemplate: subThumbnailUri(type: SQUARE_WITHOUT_LOGO)\n    isNewOngoing supportsOnetimeFree\n    serialInfo {\n      __typename ...SerialInfoIcon\n      status isTrial\n    }\n    jamEpisodeWorkType\n  }\n  fragment DailyRankingItem on DailyRankingItem {\n    __typename\n    ... on DailyRankingValidItem {\n      product {\n        __typename\n        ... on Episode {\n          id databaseId publisherId commentCount\n          series {\n            __typename ...DailyRankingSeries\n          }\n        }\n        ... on SpecialContent {\n          publisherId linkUrl\n          series {\n            __typename ...DailyRankingSeries\n          }\n        }\n      }\n      badge { name label }\n      label rank viewCount\n    }\n    ... on DailyRankingInvalidItem {\n      publisherWorkId\n    }\n  }\n  fragment DailyRanking on DailyRanking {\n    date firstPositionSeriesId\n    items {\n      edges {\n        node {\n          __typename ...DailyRankingItem\n        }\n      }\n    }\n  }\n  fragment DailyRankingSection on DailyRankingSection {\n    title\n    titleImage {\n      __typename ...DesignSectionImage\n    }\n    dailyRankings {\n      ranking {\n        __typename ...DailyRanking\n      }\n    }\n  }"
};

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, n) {
    const i = String(null == e ? "" : e).trim() || t;
    return n ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), n = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(n.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(n.providerPath, "gh", !0), s = __veneraNormalizeAuthorityPart(n.repository, "mythic3011/venera-configs", !0), r = __veneraNormalizeAuthorityPart(n.releaseRef, "main", !1), o = __veneraNormalizeAuthorityPart(n.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${a}/${s}@${r}`;
    const d = o ? `${o}/${l}` : l;
    return `${i}/${a}/${s}@${r}/${l.startsWith(`${o}/`) ? l : d}`;
}

"use strict";
