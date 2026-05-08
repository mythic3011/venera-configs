const domain2 = "gold-usergeneratedcontent.net", domain = "ltn." + domain2, nozomiextension = ".nozomi", separator = "-", extension = ".html", galleriesdir = "galleries", index_dir = "tagindex", galleries_index_dir = "galleriesindex", languages_index_dir = "languagesindex", nozomiurl_index_dir = "nozomiurlindex", max_node_size = 464, B = 16, compressed_nozomi_prefix = "n", tag_index_domain = "tagindex.hitomi.la", namespaces = [ "artist", "character", "female", "group", "language", "male", "series", "tag", "type" ], refererUrl = "https://hitomi.la/";

let gg, galleries_index_version = "";

function intersectAll(e) {
    return e.length ? 1 === e.length ? e[0] : e.reduce((e, t) => {
        const a = new Set(t);
        return e.filter(e => a.has(e));
    }) : [];
}

function subtract(e, t) {
    const a = new Set(t);
    return e.filter(e => !a.has(e));
}

function unionAll(e) {
    return Array.from(new Set(e.flat()));
}

function shuffleArray(e) {
    const t = e.slice();
    for (let e = t.length - 1; e > 0; e--) {
        const a = Math.floor(Math.random() * (e + 1));
        [t[e], t[a]] = [ t[a], t[e] ];
    }
    return t;
}

function toISO8601(e) {
    return e.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
}

function formatDate(e) {
    function t(e) {
        return e < 10 ? "0" + e : e;
    }
    return "string" == typeof e && (e = toISO8601(e), e = new Date(e)), `${e.getFullYear()}-${t(e.getMonth() + 1)}-${t(e.getDate())} ${t(e.getHours())}:${t(e.getMinutes())}`;
}

const hash_term = function(e) {
    return new Uint8Array(Convert.sha256(Convert.encodeUtf8(e))).slice(0, 4);
};

function getUint64(e, t, a = !1) {
    const r = e.getUint32(t, a), s = e.getUint32(t + 4, a), n = a ? r + 2 ** 32 * s : 2 ** 32 * r + s;
    return Number.isSafeInteger(n) || console.warn(`${n} exceeds MAX_SAFE_INTEGER – precision may be lost`),
    n;
}

function decode_node(e) {
    let t = {
        keys: [],
        datas: [],
        subnode_addresses: []
    }, a = new DataView(e.buffer), r = 0;
    const s = a.getInt32(r, !1);
    r += 4;
    let n = [];
    for (let t = 0; t < s; t++) {
        const t = a.getInt32(r, !1);
        if (!t || t > 32) throw new Error("fatal: !key_size || key_size > 32");
        r += 4, n.push(e.slice(r, r + t)), r += t;
    }
    const o = a.getInt32(r, !1);
    r += 4;
    let i = [];
    for (let e = 0; e < o; e++) {
        const e = getUint64(a, r, !1);
        r += 8;
        const t = a.getInt32(r, !1);
        r += 4, i.push([ e, t ]);
    }
    let l = [];
    for (let e = 0; e < 17; e++) {
        let e = getUint64(a, r, !1);
        r += 8, l.push(e);
    }
    return t.keys = n, t.datas = i, t.subnode_addresses = l, t;
}

async function get_url_at_range(e, t) {
    const a = {
        referer: refererUrl
    };
    t && (a.range = `bytes=${t[0]}-${t[1]}`);
    const r = await Network.fetchBytes("GET", e, a);
    if (200 !== r.status && 206 !== r.status) throw new Error("get_url_at_range: " + r.status);
    return new Uint8Array(r.body);
}

async function get_node_at_address(e, t) {
    if (!galleries_index_version) throw new Error("galleries_index_version is not set");
    const a = "https://" + domain + "/galleriesindex/galleries." + galleries_index_version + ".index";
    return decode_node(await get_url_at_range(a, [ t, t + 464 - 1 ]));
}

async function get_galleryids_from_data(e) {
    let t = "https://" + domain + "/galleriesindex/galleries." + galleries_index_version + ".data", [a, r] = e;
    if (r > 1e8 || r <= 0) throw new Error("length " + r + " is too long");
    const s = await get_url_at_range(t, [ a, a + r - 1 ]);
    let n = [], o = 0, i = new DataView(s.buffer), l = i.getInt32(o, !1);
    o += 4;
    let c = 4 * l + 4;
    if (l > 1e7 || l <= 0) throw new Error("number_of_galleryids " + l + " is too long");
    if (s.byteLength !== c) throw new Error("inbuf.byteLength " + s.byteLength + " !== expected_length " + c);
    for (let e = 0; e < l; ++e) n.push(i.getInt32(o, !1)), o += 4;
    return n;
}

async function B_search(e, t, a) {
    const r = function(e, t) {
        const a = Math.min(e.length, t.length);
        for (let r = 0; r < a; r++) {
            if (e[r] < t[r]) return -1;
            if (e[r] > t[r]) return 1;
        }
        return 0;
    };
    if (!a || !a.keys.length) return;
    let [s, n] = function(e, t) {
        let a, s = -1;
        for (a = 0; a < t.keys.length && (s = r(e, t.keys[a]), !(s <= 0)); a++) ;
        return [ !s, a ];
    }(t, a);
    if (s) return a.datas[n];
    if (function(e) {
        for (let t = 0; t < e.subnode_addresses.length; t++) if (e.subnode_addresses[t]) return !1;
        return !0;
    }(a)) return;
    if (0 == a.subnode_addresses[n]) return void console.error("non-root node address 0");
    const o = await get_node_at_address(e, a.subnode_addresses[n]);
    return await B_search(e, t, o);
}

async function get_galleryids_for_query_without_namespace(e) {
    e = e.replace(/_/g, " ");
    const t = hash_term(e), a = "galleries", r = await get_node_at_address(a, 0), s = await B_search(a, t, r);
    return s ? await get_galleryids_from_data(s) : [];
}

function nozomi_address_from_state(e, t) {
    return "date" !== e.orderby || "published" === e.orderbykey ? "all" === e.area ? "https://" + domain + "/" + (t ? "n/" : "") + [ e.orderby, [ e.orderbykey, e.language ].join("-") ].join("/") + ".nozomi" : "https://" + domain + "/" + (t ? "n/" : "") + [ e.area, e.orderby, e.orderbykey, [ encodeURI(e.tag), e.language ].join("-") ].join("/") + ".nozomi" : "all" === e.area ? "https://" + domain + "/" + (t ? "n/" : "") + [ [ encodeURI(e.tag), e.language ].join("-") ].join("/") + ".nozomi" : "https://" + domain + "/" + (t ? "n/" : "") + [ e.area, [ encodeURI(e.tag), e.language ].join("-") ].join("/") + ".nozomi";
}

async function get_galleryids_from_state(e) {
    const t = nozomi_address_from_state(e, !0), a = await get_url_at_range(t);
    for (var r = [], s = new DataView(a.buffer), n = s.byteLength / 4, o = 0; o < n; o++) r.push(s.getInt32(4 * o, !1));
    return r;
}

async function get_galleryids_and_count({range: e, state: t}) {
    var a;
    const r = {
        referer: refererUrl
    };
    e && (r.range = e);
    const s = await Network.fetchBytes("GET", nozomi_address_from_state(t, !1), r);
    if (200 !== s.status && 206 !== s.status) throw `failed fetch: ${s.status}`;
    let n = 0;
    const o = parseInt(null == (a = s.headers["content-range"]) ? void 0 : a.replace(/^[Bb]ytes \d+-\d+\//, ""));
    !isNaN(o) && o > 0 && (n = o / 4);
    const i = s.body, l = [];
    if (i) {
        const e = new DataView(i), t = e.byteLength / 4;
        for (let a = 0; a < t; a++) l.push(e.getInt32(4 * a, !1));
    }
    return {
        galleryids: l,
        count: n
    };
}

async function get_single_galleryblock(e) {
    const t = "https://" + domain + "/" + `galleryblock/${e}.html`;
    return parseGalleryBlockInfo((await Network.get(t, {
        referer: refererUrl
    })).body);
}

async function get_galleryblocks(e) {
    if (e.length > 25) throw new Error("Be careful: too many blocks");
    return await Promise.all(e.map(e => get_single_galleryblock(e)));
}

async function get_index_version(e = "galleriesindex") {
    const t = "https://" + domain + "/" + e + "/version?_=" + (new Date).getTime(), a = await Network.get(t, {
        referer: refererUrl
    });
    if (200 === a.status) return a.body;
    throw new Error(a.status);
}

async function update_galleries_index_version() {
    galleries_index_version = await get_index_version();
}

function parseHitomiGgPrefix(e) {
    const t = String(e || ""), a = t.match(/\bgg\.b\s*=\s*["']([^"']+)["']/);
    if (a && a[1]) return a[1];
    const r = t.match(/\bb\s*:\s*["']([^"']+)["']/);
    return r && r[1] ? r[1] : "";
}

function createSafeGgRuntime(e) {
    return {
        b: parseHitomiGgPrefix(e),
        s: e => String(e || "").replace(/^.*(..)(.)$/, "$2/$1/"),
        m: e => "number" == typeof e && isFinite(e) ? Math.abs(e) % 3 : 0
    };
}

async function get_image_srcs(e) {
    const t = await Network.get("https://" + domain + "/gg.js?_=" + (new Date).getTime(), {
        referer: refererUrl
    });
    if (t.status >= 400) throw new Error(t.status);
    const a = createSafeGgRuntime(t.body);
    if (!a.b) throw new Error;
    const r = (e, t, r) => e.replace(/\/\/..?\.(?:gold-usergeneratedcontent\.net|hitomi\.la)\//, "//" + ((e, t, r) => {
        var s = "";
        t || ("webp" === r ? s = "w" : "avif" === r && (s = "a"));
        var n = /\/[0-9a-f]{61}([0-9a-f]{2})([0-9a-f])/.exec(e);
        if (!n) return s;
        var o = parseInt(n[2] + n[1], 16);
        return isNaN(o) || (t ? s = String.fromCharCode(97 + a.m(o)) + t : s += 1 + a.m(o)),
        s;
    })(e, t, r) + "." + domain2 + "/"), s = e => a.b + a.s(e) + "/" + e;
    return e.map(e => ((e, t, a, n, o) => r(((e, t, a, r) => (r = r || a || t.name.split(".").pop(),
    "webp" === a || "avif" === a ? a = "" : a += "/", "https://a." + domain2 + "/" + a + s(t.hash) + "." + r))(0, t, a, n), o, a))(0, e, "avif"));
}

function get_thumbnail_url_from_hash(e, t) {
    return "https://atn." + domain2 + "/" + `${t ? "avifbigtn" : "avifsmalltn"}/${e.slice(-1)}/${e.slice(-3, -1)}/${e}.avif`;
}

async function get_gallery_detail(e) {
    const t = await Network.get("https://" + domain + "/" + `galleries/${e}.js`, {
        referer: refererUrl
    });
    if (200 !== t.status) throw new Error(t.status);
    return parseGalleryDetail(t.body);
}

function parseQuery(e) {
    const t = [], a = [];
    let r = [ [] ];
    const s = e.toLowerCase().trim().split(/\s+/);
    return s.forEach((e, n) => {
        if ("or" === e) return;
        let o, i = "";
        if (e.split("").filter(e => ":" === e).length > 1) throw new Error("不合法的标签，请使用namespace:tag的格式");
        if (e.includes(":")) {
            const t = e.split(":"), a = t[0].replace(/^-/, "");
            if (!namespaces.includes(a)) throw new Error("不合法的namespace");
            if (o = a, !t[1]) throw new Error("不合法，标签为空");
            i = t[1].replace(/_/g, " ");
        } else i = e.replace(/_/g, " ");
        const l = n > 0 && "or" === s[n - 1], c = n + 1 < s.length && "or" === s[n + 1];
        if (l || c) {
            if (e.match(/^-/)) throw new Error("不合法，或搜索中只能使用正向关键词");
            return r[r.length - 1].push({
                namespace: o,
                value: i
            }), void (c || r.push([]));
        }
        e.match(/^-/) ? a.push({
            namespace: o,
            value: i
        }) : t.push({
            namespace: o,
            value: i
        });
    }), r.filter(e => 1 === e.length).forEach(e => {
        t.push(e[0]);
    }), r = r.filter(e => e.length > 1), (r.length > 0 || a.length > 0) && 0 === t.length && t.push({
        value: ""
    }), {
        positive_terms: t,
        negative_terms: a,
        or_terms: r
    };
}

async function getSingleTagSearchPage({state: e, page: t}) {
    return await get_galleryids_and_count({
        state: e,
        range: `bytes=${100 * t}-${100 * (t + 1) - 1}`
    });
}

async function multiTagSearch(e) {
    const t = t => t.value ? t.namespace ? "language" === t.namespace ? get_galleryids_from_state({
        area: "all",
        tag: "index",
        language: t.value,
        orderby: e.orderby,
        orderbykey: e.orderbykey,
        orderbydirection: e.orderbydirection
    }) : get_galleryids_from_state({
        area: "female" === t.namespace || "male" === t.namespace ? "tag" : t.namespace,
        tag: "female" === t.namespace ? "female:" + t.value : "male" === t.namespace ? "male:" + t.value : t.value,
        language: "all",
        orderby: e.orderby,
        orderbykey: e.orderbykey,
        orderbydirection: e.orderbydirection
    }) : get_galleryids_for_query_without_namespace(t.value) : get_galleryids_from_state({
        area: "all",
        tag: "index",
        language: "all",
        orderby: e.orderby,
        orderbykey: e.orderbykey,
        orderbydirection: e.orderbydirection
    }), a = parseQuery(e.term), r = [ ...a.positive_terms.map(e => t(e)), ...a.negative_terms.map(e => t(e)), ...a.or_terms.flat().map(e => t(e)) ], s = await Promise.all(r), n = a.positive_terms.length, o = a.negative_terms.length;
    let i = intersectAll(s.slice(0, n));
    for (let e = n; e < n + o; e++) i = subtract(i, s[e]);
    let l = n + o;
    for (const e of a.or_terms) {
        const t = e.length;
        i = intersectAll([ i, unionAll(s.slice(l, l + t)) ]), l += t;
    }
    return i;
}

async function search(e) {
    const t = parseQuery(e.term);
    if (e.term.trim() || "desc" !== e.orderbydirection) {
        if (0 === t.negative_terms.length && 0 === t.or_terms.length && 1 === t.positive_terms.length && t.positive_terms[0].namespace && "desc" === e.orderbydirection) {
            const a = {
                area: "all",
                tag: "index",
                language: "all",
                orderby: e.orderby,
                orderbykey: e.orderbykey,
                orderbydirection: e.orderbydirection
            }, r = t.positive_terms[0];
            if (!r.namespace) throw new Error("");
            "language" === r.namespace ? a.language = r.value : (a.area = "female" === r.namespace || "male" === r.namespace ? "tag" : r.namespace,
            a.tag = "female" === r.namespace ? "female:" + r.value : "male" === r.namespace ? "male:" + r.value : r.value);
            const {galleryids: s, count: n} = await getSingleTagSearchPage({
                state: a,
                page: 0
            });
            return {
                type: "single",
                gids: s,
                count: n,
                state: a
            };
        }
        {
            await update_galleries_index_version();
            const t = await multiTagSearch(e), a = "random" === e.orderbydirection ? shuffleArray(t) : "asc" === e.orderbydirection ? t.toReversed() : t;
            return {
                type: "all",
                gids: a,
                count: a.length
            };
        }
    }
    {
        const t = {
            area: "all",
            tag: "index",
            language: "all",
            orderby: e.orderby,
            orderbykey: e.orderbykey,
            orderbydirection: e.orderbydirection
        }, {galleryids: a, count: r} = await getSingleTagSearchPage({
            state: t,
            page: 0
        });
        return {
            type: "single",
            gids: a,
            count: r,
            state: t
        };
    }
}

function parseGalleryBlockInfo(e) {
    const t = new HtmlDocument(e), a = t.querySelector("h1.lillie > a"), r = /-(\d+)\.html$/.exec(a.attributes.href).at(1), s = a.text, n = [];
    Array.from(t.querySelectorAll("img")).map(e => e.attributes["data-src"].trim()).forEach(e => {
        const t = /\/(\w{64})\./.exec(e);
        if (t) {
            const e = t[1];
            n.push(e);
        }
    });
    const o = Array.from(t.querySelectorAll(".artist-list li a")).map(e => e.text.trim());
    let i, l, c = [];
    t.querySelectorAll(".dj-desc tr").forEach(e => {
        const t = e.children[0].text.trim().toLowerCase(), a = e.children[1];
        switch (t) {
          case "series":
            "N/A" !== a.text.trim() && a.querySelectorAll("a").forEach(e => c.push(e.text.trim()));
            break;

          case "type":
            l = a.text.trim();
            break;

          case "language":
            if (a.querySelector("a")) {
                const e = a.querySelector("a").attributes.href, t = /\/index-(\w+)\.html/.exec(e);
                t && (i = t[1]);
            }
        }
    });
    const g = [], u = [], d = [];
    Array.from(t.querySelectorAll(".relatedtags li a")).map(e => {
        const t = e.text.trim();
        t.endsWith(" ♀") ? g.push(t.slice(0, -2)) : t.endsWith(" ♂") ? u.push(t.slice(0, -2)) : d.push(t);
    });
    const h = t.querySelector(".date").text.trim(), m = new Date(toISO8601(h));
    return {
        gid: r,
        title: s,
        type: l,
        language: i,
        artists: o,
        series: c,
        females: g,
        males: u,
        others: d,
        thumbnail_hashs: n,
        posted_time: m
    };
}

function parseGalleryDetail(e) {
    const t = JSON.parse(e.slice(18)), a = [], r = [], s = [], n = [], o = [], i = [], l = [], c = [], g = [];
    return "artists" in t && Array.isArray(t.artists) && t.artists.length > 0 && t.artists.forEach(e => a.push(e.artist)),
    "groups" in t && Array.isArray(t.groups) && t.groups.length > 0 && t.groups.forEach(e => r.push(e.group)),
    "parodys" in t && Array.isArray(t.parodys) && t.parodys.length > 0 && t.parodys.forEach(e => s.push(e.parody)),
    "characters" in t && Array.isArray(t.characters) && t.characters.length > 0 && t.characters.forEach(e => n.push(e.character)),
    "tags" in t && Array.isArray(t.tags) && t.tags.length > 0 && (t.tags.filter(e => "1" === e.female).forEach(e => o.push(e.tag)),
    t.tags.filter(e => "1" === e.male).forEach(e => i.push(e.tag)), t.tags.filter(e => !e.male && !e.female).forEach(e => l.push(e.tag))),
    "languages" in t && Array.isArray(t.languages) && t.languages.length > 0 && t.languages.forEach(e => {
        c.push({
            gid: e.galleryid,
            language: e.name
        });
    }), "related" in t && Array.isArray(t.related) && t.related.length > 0 && t.related.forEach(e => g.push(e)),
    {
        gid: parseInt(t.id),
        title: t.title,
        url: "https://hitomi.la" + t.galleryurl,
        type: t.type,
        length: t.files.length,
        language: "language" in t && t.language ? t.language : void 0,
        artists: a,
        groups: r,
        series: s,
        characters: n,
        females: o,
        males: i,
        others: l,
        thumbnail_hash: t.files[0].hash,
        files: t.files,
        posted_time: new Date(toISO8601(t.date)),
        translations: c,
        related_gids: g
    };
}

class Hitomi extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "hitomi.la", this.key = "hitomi", this.version = "1.1.2",
        this.minAppVersion = "1.4.6", this.url = resolvePluginUpdateUrl("hitomi.js"), this.galleryCache = [],
        this.categoryResultCache = void 0, this.searchResultCaches = new Map, this.explore = [ {
            title: "hitomi.la",
            type: "multiPageComicList",
            load: async e => {
                e || (e = 1);
                const t = await getSingleTagSearchPage({
                    state: {
                        area: "all",
                        tag: "index",
                        language: "all",
                        orderby: "date",
                        orderbykey: "added",
                        orderbydirection: "desc"
                    },
                    page: e - 1
                });
                return {
                    comics: (await get_galleryblocks(t.galleryids)).map(e => this._mapGalleryBlockInfoToComic(e)),
                    maxPage: Math.ceil(t.count / 25)
                };
            },
            loadNext(e) {}
        } ], this.category = {
            title: "hitomi.la",
            parts: [ {
                name: "语言",
                type: "fixed",
                categories: [ "汉语", "英语" ],
                itemType: "category",
                categoryParams: [ "language:chinese", "language:english" ]
            }, {
                name: "类别",
                type: "fixed",
                categories: [ "同人志", "漫画", "画师CG", "游戏CG", "图集", "动画" ],
                itemType: "category",
                categoryParams: [ "type:doujinshi", "type:manga", "type:artistcg", "type:gamecg", "type:imageset", "type:anime" ]
            } ],
            enableRankingPage: !0
        }, this.categoryComics = {
            load: async (e, t, a, r) => {
                const s = t;
                if (!s.includes(":")) throw new Error("不合法的标签，请使用namespace:tag的格式");
                if (1 === r) {
                    const e = {
                        term: s,
                        orderby: "date",
                        orderbykey: "added",
                        orderbydirection: "desc"
                    };
                    switch (parseInt(a[0])) {
                      case 1:
                        e.orderbykey = "published";
                        break;

                      case 2:
                        e.orderby = "popular", e.orderbykey = "today";
                        break;

                      case 3:
                        e.orderby = "popular", e.orderbykey = "week";
                        break;

                      case 4:
                        e.orderby = "popular", e.orderbykey = "month";
                        break;

                      case 5:
                        e.orderby = "popular", e.orderbykey = "year";
                        break;

                      case 6:
                        e.orderbydirection = "random";
                    }
                    const t = await search(e);
                    if ("single" === t.type) {
                        const e = (await get_galleryblocks(t.gids)).map(e => this._mapGalleryBlockInfoToComic(e));
                        return this.categoryResultCache = {
                            type: "single",
                            state: t.state,
                            count: t.count
                        }, {
                            comics: e,
                            maxPage: Math.ceil(t.count / 25)
                        };
                    }
                    {
                        const e = (await get_galleryblocks(t.gids.slice(25 * r - 25, 25 * r))).map(e => this._mapGalleryBlockInfoToComic(e));
                        return this.categoryResultCache = {
                            type: "all",
                            gids: t.gids,
                            count: t.count
                        }, {
                            comics: e,
                            maxPage: Math.ceil(t.count / 25)
                        };
                    }
                }
                if ("single" === this.categoryResultCache.type) {
                    const e = await getSingleTagSearchPage({
                        state: this.categoryResultCache.state,
                        page: r - 1
                    });
                    return {
                        comics: (await get_galleryblocks(e.galleryids)).map(e => this._mapGalleryBlockInfoToComic(e)),
                        maxPage: Math.ceil(this.categoryResultCache.count / 25)
                    };
                }
                return {
                    comics: (await get_galleryblocks(this.categoryResultCache.gids.slice(25 * r - 25, 25 * r))).map(e => this._mapGalleryBlockInfoToComic(e)),
                    maxPage: Math.ceil(this.categoryResultCache.count / 25)
                };
            },
            optionList: [ {
                options: [ "0-Date Added", "1-Date Published", "2-Popular:Today", "3-Popular:Week", "4-Popular:Month", "5-Popular:Year", "6-Random" ],
                notShowWhen: null,
                showWhen: null
            } ],
            ranking: {
                options: [ "today-Today", "week-Week", "month-Month", "year-Year" ],
                load: async (e, t) => {
                    t || (t = 1);
                    const a = await getSingleTagSearchPage({
                        state: {
                            area: "all",
                            tag: "index",
                            language: "all",
                            orderby: "popular",
                            orderbykey: e,
                            orderbydirection: "desc"
                        },
                        page: t - 1
                    });
                    return {
                        comics: (await get_galleryblocks(a.galleryids)).map(e => this._mapGalleryBlockInfoToComic(e)),
                        maxPage: Math.ceil(a.count / 25)
                    };
                }
            }
        }, this.search = {
            load: async (e, t, a) => {
                const r = (e || "") + "|" + t.join(",");
                if (1 === a) {
                    const s = {
                        term: e,
                        orderby: "date",
                        orderbykey: "added",
                        orderbydirection: "desc"
                    };
                    switch (parseInt(t[0])) {
                      case 1:
                        s.orderbykey = "published";
                        break;

                      case 2:
                        s.orderby = "popular", s.orderbykey = "today";
                        break;

                      case 3:
                        s.orderby = "popular", s.orderbykey = "week";
                        break;

                      case 4:
                        s.orderby = "popular", s.orderbykey = "month";
                        break;

                      case 5:
                        s.orderby = "popular", s.orderbykey = "year";
                        break;

                      case 6:
                        s.orderbydirection = "random";
                    }
                    const n = await search(s);
                    if ("single" === n.type) {
                        const e = (await get_galleryblocks(n.gids)).map(e => this._mapGalleryBlockInfoToComic(e));
                        return this.searchResultCaches.set(r, {
                            type: "single",
                            state: n.state,
                            count: n.count
                        }), {
                            comics: e,
                            maxPage: Math.ceil(n.count / 25)
                        };
                    }
                    {
                        const e = (await get_galleryblocks(n.gids.slice(25 * a - 25, 25 * a))).map(e => this._mapGalleryBlockInfoToComic(e));
                        return this.searchResultCaches.set(r, {
                            type: "all",
                            gids: n.gids,
                            count: n.count
                        }), {
                            comics: e,
                            maxPage: Math.ceil(n.count / 25)
                        };
                    }
                }
                {
                    const e = this.searchResultCaches.get(r);
                    if ("single" === e.type) {
                        const t = await getSingleTagSearchPage({
                            state: e.state,
                            page: a - 1
                        });
                        return {
                            comics: (await get_galleryblocks(t.galleryids)).map(e => this._mapGalleryBlockInfoToComic(e)),
                            maxPage: Math.ceil(e.count / 25)
                        };
                    }
                    return {
                        comics: (await get_galleryblocks(e.gids.slice(25 * a - 25, 25 * a))).map(e => this._mapGalleryBlockInfoToComic(e)),
                        maxPage: Math.ceil(e.count / 25)
                    };
                }
            },
            loadNext: async (e, t, a) => {},
            optionList: [ {
                type: "select",
                options: [ "0-Date Added", "1-Date Published", "2-Popular:Today", "3-Popular:Week", "4-Popular:Month", "5-Popular:Year", "6-Random" ],
                label: "sort",
                default: null
            } ],
            enableTagsSuggestions: !0,
            onTagSuggestionSelected: (e, t) => {
                let a;
                switch (e) {
                  case "reclass":
                    a = "type";
                    break;

                  case "parody":
                    a = "series";
                    break;

                  case "other":
                  case "mixed":
                  case "temp":
                  case "cosplayer":
                    a = "tag";
                    break;

                  default:
                    a = e;
                }
                return `${a}:${t.replaceAll(" ", "_")}`;
            }
        }, this.comic = {
            loadInfo: async e => {
                const t = await get_gallery_detail(e), a = new Map;
                let r;
                return "type" in t && t.type && a.set("type", [ t.type ]), t.groups.length && a.set("groups", t.groups),
                t.artists.length && a.set("artists", t.artists), "language" in t && t.language && a.set("language", [ t.language ]),
                t.series.length && a.set("series", t.series), t.characters.length && a.set("characters", t.characters),
                t.females.length && a.set("females", t.females), t.males.length && a.set("males", t.males),
                t.others.length && a.set("others", t.others), t.related_gids.length && (r = (await get_galleryblocks(t.related_gids)).map(e => this._mapGalleryBlockInfoToComic(e))),
                this.galleryCache = t, new ComicDetails({
                    title: t.title,
                    cover: get_thumbnail_url_from_hash(t.thumbnail_hash, !0),
                    tags: a,
                    maxPage: t.files.length,
                    thumbnails: t.files.map(e => get_thumbnail_url_from_hash(e.hash)),
                    uploadTime: formatDate(t.posted_time),
                    url: t.url,
                    recommend: r
                });
            },
            loadEp: async (e, t) => {
                const a = this.galleryCache;
                if ("anime" === a.type) throw new Error("不支持视频浏览");
                return {
                    images: await get_image_srcs(a.files)
                };
            },
            onImageLoad: (e, t, a) => ({
                url: e,
                headers: {
                    referer: refererUrl
                }
            }),
            onThumbnailLoad: e => ({
                url: e,
                headers: {
                    referer: refererUrl
                }
            }),
            onClickTag: (e, t) => {
                let a;
                switch (e) {
                  case "type":
                    a = "type";
                    break;

                  case "groups":
                    a = "group";
                    break;

                  case "artists":
                    a = "artist";
                    break;

                  case "language":
                    a = "language";
                    break;

                  case "series":
                    a = "series";
                    break;

                  case "characters":
                    a = "character";
                    break;

                  case "females":
                    a = "female";
                    break;

                  case "males":
                    a = "male";
                    break;

                  case "others":
                    a = "tag";
                }
                if (!a) throw new Error("不支持的标签命名空间: " + e);
                return {
                    page: "search",
                    attributes: {
                        keyword: a + ":" + t.replaceAll(" ", "_")
                    }
                };
            },
            link: {
                domains: [ "hitomi.la" ],
                linkToId: e => {
                    const t = /https:\/\/hitomi\.la\/\w+\/[^\/]+-(\d+)\.html/.exec(e);
                    if (t) return t[1];
                    throw new Error("Invalid gallery url of hitomi.la");
                }
            },
            enableTagsTranslate: !0
        };
    }
    _mapGalleryBlockInfoToComic(e) {
        return new Comic({
            id: e.gid,
            title: e.title,
            subTitle: e.artists.length ? e.artists.join(" ") : "",
            cover: get_thumbnail_url_from_hash(e.thumbnail_hashs[0], !0),
            tags: [ ...e.series, ...e.females.map(e => "f:" + e), ...e.males.map(e => "m:" + e), ...e.others.map(e => "f:" + e) ],
            language: e.language,
            description: e.type ? e.type + "\n" + formatDate(e.posted_time) : e.posted_time
        });
    }
    init() {}
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, a) {
    const r = String(null == e ? "" : e).trim() || t;
    return a ? r.replace(/^\/+|\/+$/g, "") : r;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), a = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, r = __veneraNormalizeAuthorityPart(a.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), s = __veneraNormalizeAuthorityPart(a.providerPath, "gh", !0), n = __veneraNormalizeAuthorityPart(a.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(a.releaseRef, "main", !1), i = __veneraNormalizeAuthorityPart(a.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${r}/${s}/${n}@${o}`;
    const c = i ? `${i}/${l}` : l;
    return `${r}/${s}/${n}@${o}/${l.startsWith(`${i}/`) ? l : c}`;
}
