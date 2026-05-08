class ComicWalker extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "カドコミ", this.key = "comic_walker", this.version = "1.0.0",
        this.minAppVersion = "1.6.0", this.url = resolvePluginUpdateUrl("comic_walker.js"),
        this.api_key = "ytBrdQ2ZYdRQguqEusVLxQVUgakNnVht", this.latestVersion = "1.4.13",
        this.api_base = "https://mobileapp.comic-walker.com", this.explore = [ {
            title: "カドコミ",
            type: "singlePageWithMultiPart",
            load: async () => {
                const e = await this.request(`${this.api_base}/v2/screens/home`, this.headers), t = {}, r = e.resources.new_arrival_comics.map(e => {
                    var t;
                    return new Comic({
                        id: e.id,
                        title: e.title,
                        cover: e.thumbnail_1x1 || "",
                        tags: (null == (t = e.comic_labels) ? void 0 : t.map(e => e.name)) || []
                    });
                });
                t["今日の更新"] = r;
                const s = e.resources.attention_comics.map(e => {
                    var t;
                    return new Comic({
                        id: e.comic_id,
                        title: e.title,
                        cover: e.image_url || "",
                        tags: (null == (t = e.comic_labels) ? void 0 : t.map(e => e.name)) || []
                    });
                });
                t["注目作品"] = s;
                for (const r of e.resources.pickup_comics) {
                    const e = r.comics.map(e => {
                        var t;
                        return new Comic({
                            id: e.id,
                            title: e.title,
                            cover: e.thumbnail_1x1 || "",
                            tags: (null == (t = e.comic_labels) ? void 0 : t.map(e => e.name)) || []
                        });
                    });
                    t[r.name] = e;
                }
                const a = e.resources.new_serialization_comics.map(e => {
                    var t;
                    return new Comic({
                        id: e.id,
                        title: e.title,
                        cover: e.thumbnail_1x1 || "",
                        tags: (null == (t = e.comic_labels) ? void 0 : t.map(e => e.name)) || []
                    });
                });
                return t["新連載"] = a, t;
            }
        } ], this.search = {
            load: async (e, t, r) => {
                const s = await this.request(`${this.api_base}/v1/search/comics?keyword=${e}&limit=20&offset=${20 * (r - 1)}`, this.headers);
                return {
                    comics: s.resources.map(e => {
                        var t, r;
                        return new Comic({
                            id: e.id,
                            title: e.title,
                            cover: e.thumbnail_1x1 || "",
                            tags: [ ...(null == (t = e.authors) ? void 0 : t.map(e => e.name)) || [], ...(null == (r = e.comic_labels) ? void 0 : r.map(e => e.name)) || [] ]
                        });
                    }),
                    maxPage: 20 === s.resources.length ? (r || 1) + 1 : r || 1,
                    endCursor: null
                };
            }
        }, this.comic = {
            loadInfo: async e => {
                var t, r;
                const s = await this.request(`${this.api_base}/v2/screens/comics/${e}`, this.headers), a = s.resources.detail, i = s.resources.episode_total_count || 0;
                let o = {
                    resources: []
                };
                for (let t = 0; t < i; t += 100) {
                    const r = await this.request(`${this.api_base}/v1/comics/${e}/episodes?offset=${t}&limit=100&sort=asc`, this.headers);
                    o.resources.push(...r.resources || []);
                }
                const n = new Map;
                a.authors && a.authors.forEach(e => {
                    n.has(e.role) || n.set(e.role, []), n.get(e.role).push(e.name);
                }), a.comic_labels && a.comic_labels.forEach(e => {
                    n.has("Labels") || n.set("Labels", []), n.get("Labels").push(e.name);
                }), a.tags && a.tags.forEach(e => {
                    n.has(e.type) || n.set(e.type, []), n.get(e.type).push(e.name);
                });
                const l = new Map;
                for (const e of o.resources) {
                    let t = !1;
                    const r = (e.plans || []).filter(e => "paid" !== e.type);
                    Array.isArray(r) && r.length > 0 && (t = !0);
                    const s = t ? e.title : `❌ ${e.title}`;
                    l.set(e.id, s);
                }
                return new ComicDetails({
                    title: a.title,
                    subtitle: (null == (t = a.authors) ? void 0 : t.map(e => e.name).join("・")) || "",
                    cover: a.thumbnail_1x1 || "",
                    description: (null == (r = a.story) ? void 0 : r.replace(/<br\s*\/?>/gi, "\n")) || "",
                    tags: n,
                    chapters: l,
                    updateTime: a.next_update_at,
                    url: a.share_url,
                    maxPage: i
                });
            },
            loadEp: async (e, t) => {
                const r = ((await this.request(`${this.api_base}/v1/episodes/${t}`, this.headers)).plans || []).filter(e => "paid" !== e.type);
                if (!Array.isArray(r) || 0 === r.length) throw new Error("No available rental plans after filtering");
                if (console.log(r), !r.find(e => "free" === e.type)) {
                    const e = r[randomInt(0, r.length - 1)];
                    await this.request(`${this.api_base}/v1/users/me/rental_episodes`, this.headers, "POST", {
                        episode_id: t,
                        reading_method: e.type
                    });
                }
                return {
                    images: ((await this.request(`${this.api_base}/v1/screens/comics/${e}/episodes/${t}/viewer`, this.headers)).resources.manuscripts || []).map(e => `${e.drm_image_url}&drm_hash=${e.drm_hash}`)
                };
            },
            onImageLoad: e => {
                let t = null, r = e;
                const s = e.match(/[?&]drm_hash=([^&]+)/);
                if (s && (t = decodeURIComponent(s[1]), r = e.replace(/([?&])drm_hash=[^&]+(&)?/, (e, t, r) => r ? t : "").replace(/[?&]$/, "")),
                r = r.replace(/([?&])weight=[^&]+(&)?/, (e, t, r) => r ? t : "").replace(/[?&]$/, ""),
                r = r.replace(/([?&])height=[^&]+(&)?/, (e, t, r) => r ? t : "").replace(/[?&]$/, ""),
                t.length < 2) throw new Error("drm_hash must be at least 2 characters long");
                var a = t.slice(0, 2);
                if ("01" !== a) throw new Error("Unsupported version: " + a);
                var i = t.slice(2);
                if (i.length < 16) throw new Error("Key part must be 16 characters long (8 hex numbers)");
                for (var o = [], n = 0; n < 8; n++) o.push(parseInt(i.slice(2 * n, 2 * n + 2), 16));
                const l = `\n        function onResponse(buffer) {\n          var key = [${o.join(",")}];\n          var view = new Uint8Array(buffer);\n          for (var i = 0; i < view.length; i++) {\n        view[i] ^= key[i % key.length];\n          }\n          return buffer;\n        }\n        onResponse;\n      `;
                return {
                    url: r,
                    headers: this.headers,
                    onResponse: async e => await compute(l, e)
                };
            },
            onClickTag: (e, t) => {
                if ("漫画" === e || "原作" === e || "キャラクター原案" === e || "著者" === e) return {
                    action: "search",
                    keyword: t,
                    param: null
                };
                throw "未支持此类Tag检索";
            }
        };
    }
    get headers() {
        const e = {
            "X-API-Environment-Key": this.api_key,
            "User-Agent": `BookWalkerApp/${this.latestVersion} (Android 13)`,
            Host: "mobileapp.comic-walker.com",
            "Content-Type": "application/json"
        }, t = this.loadData("token");
        return t && (e.Authorization = `Bearer ${t}`), e;
    }
    async refreshToken() {
        const e = await this.request(`${this.api_base}/v1/users`, this.headers, "POST");
        return this.saveData("token", e.resources.access_token), e.resources.access_token;
    }
    async request(e, t, r = "GET", s) {
        let a;
        if ("GET" === r) a = await Network.get(e, t); else {
            if ("POST" !== r) throw new Error(`Unsupported method: ${r}`);
            a = await Network.post(e, t, s);
        }
        if (204 === a.status) return a;
        if (a = JSON.parse(a.body), "invalid_request_parameter" === a.code || "free_daily_reward_quota_exceeded" === a.code || "unauthorized" === a.code) {
            if (await this.refreshToken(), "GET" === r) a = await Network.get(e, this.headers); else {
                if ("POST" !== r) throw new Error(`Unsupported method: ${r}`);
                a = await Network.post(e, this.headers, s);
            }
            if (204 === a.status) return a;
            a = JSON.parse(a.body);
        }
        return a;
    }
    async init() {
        const e = await Network.get("https://itunes.apple.com/lookup?bundleId=jp.co.bookwalker.cwapp.ios&country=jp");
        200 == e.status && (response = JSON.parse(e.body), this.latestVersion = response.version),
        await this.refreshToken();
    }
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, t, r) {
    const s = String(null == e ? "" : e).trim() || t;
    return r ? s.replace(/^\/+|\/+$/g, "") : s;
}

function resolvePluginUpdateUrl(e) {
    const t = __veneraGetRuntimeGlobal(), r = t.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof t.__VENERA_RELEASE_AUTHORITY__ ? t.__VENERA_RELEASE_AUTHORITY__ : {}, s = __veneraNormalizeAuthorityPart(r.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), a = __veneraNormalizeAuthorityPart(r.providerPath, "gh", !0), i = __veneraNormalizeAuthorityPart(r.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(r.releaseRef, "main", !1), n = __veneraNormalizeAuthorityPart(r.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${s}/${a}/${i}@${o}`;
    const c = n ? `${n}/${l}` : l;
    return `${s}/${a}/${i}@${o}/${l.startsWith(`${n}/`) ? l : c}`;
}
