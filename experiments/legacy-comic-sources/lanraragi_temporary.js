// Temporary, read-only legacy Venera ComicSource adapter for LANraragi.
// See experiments/legacy-comic-sources/README.md for the network and auth
// limitations. This standalone JS is NOT a v2 security/credential broker.
//
// No class fields, import/export, Buffer, btoa, or asynchronous Convert calls.
// Image-header callbacks must remain synchronous in the legacy Venera runtime.
class LANraragiTemporarySource extends ComicSource {
    constructor() {
        super();
        this.name = "LANraragi (Temporary)";
        this.key = "lanraragi_temporary";
        this.version = "0.3.0";
        this.minAppVersion = "1.16.0";
        this.url = "";

        this.settings = {
            server: {
                title: "Server URL (HTTPS preferred)",
                type: "input",
                default: "",
                validator: "^https?://[^?#]+$"
            },
            api_key: {
                title: "LANraragi API Key (legacy setting; not secure vault)",
                type: "input",
                default: ""
            },
            allow_http: {
                title: "Allow plain HTTP (trusted LAN only)",
                type: "switch",
                default: false
            }
        };
        this.translation = {
            zh_TW: {
                "Server URL (HTTPS preferred)": "伺服器 URL（建議 HTTPS）",
                "Allow plain HTTP (trusted LAN only)": "允許 HTTP（只限可信任 LAN）",
                "LANraragi API Key (legacy setting; not secure vault)": "LANraragi API Key（舊版設定，非安全保管庫）"
            },
            zh_CN: {
                "Server URL (HTTPS preferred)": "服务器 URL（建议 HTTPS）",
                "Allow plain HTTP (trusted LAN only)": "允许 HTTP（仅可信任局域网）",
                "LANraragi API Key (legacy setting; not secure vault)": "LANraragi API Key（旧版设置，非安全存储库）"
            },
            en: {}
        };

        // Category discovery happens once per source initialization.
        // A Venera dynamic category loader must be SYNCHRONOUS; it returns
        // this in-memory snapshot rather than making a network request.
        this._categories = [];
        this._categoryServer = "";
        this._categoryGeneration = 0;
        this.category = {
            title: "LANraragi Categories",
            parts: [{
                name: "Library",
                type: "dynamic",
                loader: () => {
                    const entries = [{
                        label: "All Archives",
                        target: {
                            page: "category",
                            attributes: {category: "all", param: null}
                        }
                    }];
                    // Settings may change without a new constructor/init call.
                    // Never display categories cached for a different server.
                    let sameServer = false;
                    try {
                        sameServer = this._categoryServer === this.baseUrl();
                    } catch (_) {
                        sameServer = false;
                    }
                    if (sameServer) {
                        for (const item of this._categories) {
                            entries.push({
                                label: item.name,
                                target: {
                                    page: "category",
                                    attributes: {category: item.id, param: null}
                                }
                            });
                        }
                    }
                    return entries;
                }
            }],
            enableRankingPage: false
        };

        // Category pages are 1-based in Venera, but LANraragi takes a
        // zero-based *record offset*, not page number. Discover the server's
        // configured page size from page 1 on each request; no global cursor
        // state or stale per-category page-size assumptions.
        this.categoryComics = {
            optionList: [],
            load: async (category, param, options, page) => {
                const id = String(category == null ? "" : category);
                if (id !== "all" && !/^SET_[0-9]{10}$/.test(id)) {
                    throw new Error("Invalid LANraragi category ID.");
                }
                const number = page == null ? 1 : Number(page);
                if (!Number.isSafeInteger(number) || number < 1 || number > 10000 ||
                    (page != null && !/^[1-9][0-9]*$/.test(String(page)))) {
                    throw new Error("Invalid category page number.");
                }
                const query = id === "all" ? "" : "&category=" + encodeURIComponent(id);
                // The whole library groups tankoubons on the server. A static
                // category that lists only member archives returns nothing
                // when the server groups, so those pages stay ungrouped and
                // are collapsed from the discovered tank list.
                const group = id === "all";
                const first = await this.searchArchivePage(query, 0, group);
                const size = first.data.length;
                const total = first.total;
                if (total === 0) return {comics: [], maxPage: 1};
                if (size === 0 || size > total) {
                    throw new Error("Inconsistent LANraragi category page size.");
                }
                const maxPage = Math.max(1, Math.ceil(total / size));
                if (number > maxPage) return {comics: [], maxPage: maxPage};
                const pageData = number === 1 ? first : await this.laterCategoryPage(
                    query, number, size, group
                );
                if (group && pageData.data.some(item => item && this.isTank(item.arcid))) {
                    await this.ensureTankIndex();
                }
                const comics = group
                    ? pageData.data.map(item => this.toComic(item))
                    : await this.collapseCategory(pageData.data);
                return {comics: comics, maxPage: maxPage};
            }
        };

        this.search = {
            optionList: [],
            loadNext: async (keyword, options, next) => {
                const offset = next == null ? 0 : Number(next);
                if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000 ||
                    (next != null && !/^(0|[1-9][0-9]*)$/.test(String(next)))) {
                    throw new Error("Invalid search cursor.");
                }
                const query = String(keyword == null ? "" : keyword).trim().slice(0, 256);
                const data = await this.requestJson(
                    "/api/search?filter=" + encodeURIComponent(query) +
                    "&start=" + offset + "&groupby_tanks=true" +
                    "&sortby=title&order=asc"
                );
                if (!data || !Array.isArray(data.data) || data.data.length > 1000 ||
                    !Number.isSafeInteger(Number(data.recordsFiltered)) ||
                    Number(data.recordsFiltered) < 0) {
                    throw new Error("Invalid LANraragi search response.");
                }
                if (data.data.some(item => item && this.isTank(item.arcid))) {
                    await this.ensureTankIndex();
                }
                const items = data.data.map(item => this.toComic(item));
                const total = Number(data.recordsFiltered);
                const end = offset + items.length;
                return {comics: items, next: items.length && end < total ? String(end) : null};
            }
        };

        this.comic = {
            loadInfo: async id => {
                const comic = this.comicId(id);
                if (this.isTank(comic)) {
                    return await this.tankDetails(comic);
                }
                await this.ensureTankIndex();
                const parent = this._memberTank && this._memberTank[comic];
                if (parent) {
                    return await this.tankDetails(parent);
                }
                const data = await this.requestJson(
                    "/api/archives/" + comic + "/metadata"
                );
                if (!data || typeof data !== "object" || Array.isArray(data)) {
                    throw new Error("Invalid LANraragi metadata.");
                }
                const tags = this.parseTags(data.tags);
                if (Number.isSafeInteger(Number(data.pagecount)) && Number(data.pagecount) > 0) {
                    tags.Pages = [String(data.pagecount)];
                }
                return new ComicDetails({
                    title: this.text(data.title || data.filename || comic, 512),
                    cover: this.coverKey(comic),
                    description: this.text(data.summary, 10000),
                    tags: tags,
                    chapters: null
                });
            },
            loadEp: async (comicId, epId) => {
                const comic = this.comicId(comicId);
                let id = comic;
                if (this.isTank(comic)) {
                    id = await this.tankChapter(comic, epId);
                } else if (epId != null && epId !== "") {
                    throw new Error("LANraragi archive has no chapters.");
                }
                // /files uses GET but may queue a LANraragi Minion extraction
                // job and update server cache; force=false avoids re-extraction.
                const response = await this.requestJson(
                    "/api/archives/" + id + "/files?force=false"
                );
                if (!response || !Array.isArray(response.pages) ||
                    response.pages.length > 10000) {
                    throw new Error("Invalid LANraragi archive page list.");
                }
                if (response.pages.length === 0) {
                    throw new Error(
                        "LANraragi archive has no pages yet. Extraction may still be running."
                    );
                }
                // LANraragi returns an ordered page list. Never re-sort names.
                return {images: response.pages.map(value => this.pageKey(id, value))};
            },
            onImageLoad: (key, comicId, epId) => ({
                url: this.imageUrl(key, comicId),
                headers: this.imageHeaders()
            }),
            // Venera requires this callback to return synchronously.
            onThumbnailLoad: key => ({
                url: this.imageUrl(key),
                headers: this.imageHeaders()
            })
        };
    }

    async init() {
        // No bulk archive scan. /api/categories is a small read-only list.
        // Fail closed to "All Archives" when the server is unreachable.
        const generation = ++this._categoryGeneration;
        this._categories = [];
        this._categoryServer = "";
        let base;
        let auth;
        try {
            base = this.baseUrl();
            auth = this.apiKey();
        } catch (_) {
            return;
        }
        try {
            const response = await this.requestJson("/api/categories");
            if (!Array.isArray(response) || response.length > 1000) {
                throw new Error("Invalid LANraragi category list.");
            }
            const categories = [];
            const seen = {};
            for (const item of response) {
                if (!item || typeof item !== "object" || Array.isArray(item)) continue;
                if (typeof item.id !== "string" || !/^SET_[0-9]{10}$/.test(item.id)) continue;
                const name = this.text(item.name, 160).trim();
                if (!name || Object.prototype.hasOwnProperty.call(seen, item.id)) continue;
                seen[item.id] = true;
                categories.push({id: item.id, name: name});
            }
            // Do not publish results from the old server if settings were changed
            // during the async fetch.
            if (this._categoryGeneration === generation &&
                this.baseUrl() === base && this.apiKey() === auth) {
                this._categories = categories;
                this._categoryServer = base;
            }
        } catch (_) {
            // A broken category list cannot block the existing reader/search.
            // But a stale request must not overwrite a newer successful init.
            if (this._categoryGeneration === generation) {
                this._categories = [];
                this._categoryServer = "";
            }
        }
    }

    async laterCategoryPage(categoryQuery, number, size, group) {
        const offset = (number - 1) * size;
        if (!Number.isSafeInteger(offset) || offset > 1000000) {
            throw new Error("Category pagination offset too large.");
        }
        return await this.searchArchivePage(categoryQuery, offset, group);
    }

    async searchArchivePage(categoryQuery, start, group) {
        if (typeof categoryQuery !== "string" ||
            (categoryQuery !== "" && !/^&category=SET_[0-9]{10}$/.test(categoryQuery)) ||
            !Number.isSafeInteger(start) || start < 0 || start > 1000000) {
            throw new Error("Invalid LANraragi category query.");
        }
        const response = await this.requestJson(
            "/api/search?filter=&start=" + start +
            "&groupby_tanks=" + (group ? "true" : "false") +
            "&sortby=title&order=asc" + categoryQuery
        );
        if (!response || !Array.isArray(response.data) ||
            response.data.length > 1000 ||
            !Number.isSafeInteger(response.recordsFiltered) ||
            response.recordsFiltered < 0 ||
            response.recordsFiltered > 100000000 ||
            (response.recordsFiltered === 0 && response.data.length !== 0)) {
            throw new Error("Invalid LANraragi category search response.");
        }
        return {data: response.data, total: response.recordsFiltered};
    }

    text(value, limit) {
        if (value == null) return "";
        const result = String(value);
        return result.length > limit ? result.slice(0, limit) : result;
    }

    baseUrl() {
        const value = String(this.loadSetting("server") || "").trim();
        const match = /^(https?):\/\/([^/?#]+)(\/[^?#]*)?$/i.exec(value);
        if (!match || value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(value) ||
            /[@%]/.test(match[2]) ||
            !/^(?:[A-Za-z0-9._-]+(?::[0-9]{1,5})?|\[[0-9a-fA-F:.]+\](?::[0-9]{1,5})?)$/.test(match[2])) {
            throw new Error("Set a valid LANraragi Server URL in Source Settings.");
        }
        const port = /:([0-9]{1,5})$/.exec(match[2]);
        if (port && (Number(port[1]) < 1 || Number(port[1]) > 65535)) {
            throw new Error("Invalid LANraragi server port.");
        }
        const path = match[3] || "";
        if (path && (path.indexOf("//") >= 0 || /%2f|%5c|%2e|%00/i.test(path) ||
            path.split("/").some(p => p === "." || p === ".."))) {
            throw new Error("Unsafe LANraragi base path.");
        }
        if (match[1].toLowerCase() === "http" &&
            this.loadSetting("allow_http") !== true) {
            throw new Error("Plain HTTP is disabled. Enable it explicitly for a trusted LAN.");
        }
        return value.replace(/\/+$/, "");
    }

    // Synchronous Base64 of UTF-8 bytes. Convert.encodeUtf8/encodeBase64
    // use a host bridge and are not guaranteed synchronous, which would
    // break Venera's synchronous thumbnail callback.
    encodeBearer(value) {
        const escaped = encodeURIComponent(value);
        const bytes = [];
        for (let i = 0; i < escaped.length; i++) {
            if (escaped[i] === "%") {
                bytes.push(parseInt(escaped.slice(i + 1, i + 3), 16));
                i += 2;
            } else {
                bytes.push(escaped.charCodeAt(i));
            }
        }
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let out = "";
        for (let i = 0; i < bytes.length; i += 3) {
            const a = bytes[i];
            const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
            const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
            out += chars[a >> 2];
            out += chars[((a & 3) << 4) | (b >> 4)];
            out += i + 1 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : "=";
            out += i + 2 < bytes.length ? chars[c & 63] : "=";
        }
        return out;
    }

    apiKey() {
        const value = String(this.loadSetting("api_key") || "").trim();
        if (value.length > 512 || /[\r\n\u0000-\u001f\u007f]/.test(value)) {
            throw new Error("Invalid LANraragi API Key.");
        }
        return value;
    }

    requestHeaders() {
        const headers = {"Accept": "application/json"};
        const key = this.apiKey();
        if (key) headers.Authorization = "Bearer " + this.encodeBearer(key);
        return headers;
    }

    imageHeaders() {
        const key = this.apiKey();
        return key ? {Authorization: "Bearer " + this.encodeBearer(key)} : {};
    }

    archiveId(value) {
        const id = String(value || "").toLowerCase();
        if (!/^[a-f0-9]{40}$/.test(id)) {
            throw new Error("Invalid LANraragi archive ID.");
        }
        return id;
    }

    // Tank IDs come from the server (TANK_ plus 10 digits). Nothing here
    // names a series or a particular tank.
    isTank(value) {
        return /^TANK_[0-9]{10}$/.test(String(value || ""));
    }

    comicId(value) {
        const id = String(value || "");
        if (this.isTank(id)) return id;
        return this.archiveId(id);
    }

    rememberTankChapters(tankId, archives) {
        if (!this._tankChapters) this._tankChapters = {};
        this._tankChapters[tankId] = archives;
    }

    // One small paged read of /api/tankoubons. Member archives map back to
    // the tank the server already grouped. A member listed in two tanks is
    // left as its own archive rather than guessed.
    async ensureTankIndex() {
        let base;
        let auth;
        try {
            base = this.baseUrl();
            auth = this.apiKey();
        } catch (error) {
            throw error;
        }
        if (this._tankServer === base && this._tankAuth === auth && this._memberTank) {
            return;
        }
        if (this._tankIndexPromise && this._tankIndexBase === base &&
            this._tankIndexAuth === auth) {
            return await this._tankIndexPromise;
        }
        const generation = (this._tankGeneration || 0) + 1;
        this._tankGeneration = generation;
        const load = this.loadTankIndex(base, auth, generation);
        this._tankIndexPromise = load;
        this._tankIndexBase = base;
        this._tankIndexAuth = auth;
        try {
            await load;
        } finally {
            if (this._tankIndexPromise === load) this._tankIndexPromise = null;
        }
    }

    async loadTankIndex(base, auth, generation) {
        const memberTank = {};
        const covers = {};
        const ambiguous = {};
        let start = 1;
        let seen = 0;
        for (let page = 0; page < 20; page++) {
            let response;
            try {
                response = await this.requestJson("/api/tankoubons?page=" + start);
            } catch (_) {
                response = null;
            }
            // A missing tank list, or a body that is not one, must not block
            // reading standalone archives. Grouping is then unavailable.
            if (!response || !Array.isArray(response.result) ||
                response.result.length > 1000 ||
                !Number.isSafeInteger(Number(response.total)) ||
                Number(response.total) < 0 || Number(response.total) > 100000) {
                response = {result: [], total: 0};
            }
            for (const item of response.result) {
                if (!item || typeof item !== "object" || Array.isArray(item)) continue;
                if (!this.isTank(item.id) || !Array.isArray(item.archives)) continue;
                if (item.archives.length > 2000) continue;
                const members = [];
                const local = {};
                for (const raw of item.archives) {
                    if (typeof raw !== "string" || !/^[a-f0-9]{40}$/i.test(raw)) continue;
                    const archive = raw.toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(local, archive)) continue;
                    local[archive] = true;
                    members.push(archive);
                }
                if (!members.length) continue;
                covers[item.id] = members[0];
                for (const archive of members) {
                    if (Object.prototype.hasOwnProperty.call(ambiguous, archive)) continue;
                    const existing = memberTank[archive];
                    if (existing && existing !== item.id) {
                        delete memberTank[archive];
                        ambiguous[archive] = true;
                        continue;
                    }
                    memberTank[archive] = item.id;
                }
            }
            seen += response.result.length;
            const total = Number(response.total);
            if (response.result.length === 0 || seen >= total) break;
            start += 1;
        }
        if (this._tankGeneration !== generation ||
            this.baseUrl() !== base || this.apiKey() !== auth) {
            return;
        }
        this._memberTank = memberTank;
        this._tankCover = covers;
        this._tankServer = base;
        this._tankAuth = auth;
    }

    async collapseCategory(items) {
        await this.ensureTankIndex();
        const comics = [];
        const shown = {};
        for (const item of items) {
            if (!item || typeof item !== "object" || Array.isArray(item)) {
                throw new Error("Invalid LANraragi archive item.");
            }
            if (this.isTank(item.arcid)) {
                if (Object.prototype.hasOwnProperty.call(shown, item.arcid)) continue;
                shown[item.arcid] = true;
                comics.push(this.toComic(item));
                continue;
            }
            const id = this.archiveId(item.arcid);
            const tank = this._memberTank && this._memberTank[id];
            if (!tank) {
                comics.push(this.toComic(item));
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(shown, tank)) continue;
            shown[tank] = true;
            comics.push(this.tankComic(tank, this._tankCover && this._tankCover[tank]));
        }
        return comics;
    }

    tankComic(id, coverArchive) {
        const cover = typeof coverArchive === "string" && /^[a-f0-9]{40}$/.test(coverArchive)
            ? this.coverKey(coverArchive)
            : "";
        return new Comic({
            id: id,
            title: id,
            cover: cover,
            subtitle: "",
            tags: []
        });
    }

    async tankDetails(id) {
        if (!this.isTank(id)) throw new Error("Invalid LANraragi tankoubon ID.");
        const data = await this.requestJson("/api/tankoubons/" + id);
        if (!data || data.id !== id || !Array.isArray(data.archives)) {
            throw new Error("Invalid LANraragi tankoubon.");
        }
        if (data.archives.length > 2000) {
            throw new Error("LANraragi tankoubon has too many chapters.");
        }
        const archives = [];
        const seen = {};
        for (const raw of data.archives) {
            if (typeof raw !== "string" || !/^[a-f0-9]{40}$/i.test(raw)) {
                throw new Error("Invalid LANraragi tankoubon chapter.");
            }
            const archive = raw.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(seen, archive)) continue;
            seen[archive] = true;
            archives.push(archive);
        }
        if (!archives.length) throw new Error("LANraragi tankoubon has no chapters.");
        this.rememberTankChapters(id, archives);
        const titles = {};
        const limit = Math.min(archives.length, 64);
        const requests = [];
        for (let i = 0; i < limit; i++) {
            const archive = archives[i];
            requests.push(this.requestJson("/api/archives/" + archive + "/metadata").then(
                meta => {
                    if (meta && typeof meta.title === "string") {
                        titles[archive] = this.text(meta.title, 300);
                    }
                },
                () => {}
            ));
        }
        await Promise.all(requests);
        const chapters = new Map();
        for (let i = 0; i < archives.length; i++) {
            const archive = archives[i];
            chapters.set(archive, titles[archive] || ("Chapter " + (i + 1)));
        }
        const tags = this.parseTags(data.tags);
        const cover = archives[0];
        return new ComicDetails({
            title: this.text(data.name, 300) || id,
            cover: this.coverKey(cover),
            description: this.text(data.summary, 10000),
            tags: tags,
            chapters: chapters
        });
    }

    async tankChapter(tankId, epId) {
        if (!this._tankChapters || !this._tankChapters[tankId]) {
            await this.tankDetails(tankId);
        }
        const archives = this._tankChapters && this._tankChapters[tankId];
        if (!archives || !archives.length) {
            throw new Error("LANraragi tankoubon has no chapters.");
        }
        if (epId == null || epId === "") return archives[0];
        const chapter = this.archiveId(epId);
        if (archives.indexOf(chapter) < 0) {
            throw new Error("LANraragi chapter is not in this tankoubon.");
        }
        return chapter;
    }

    async requestJson(route) {
        if (!/^\/api\/[a-z0-9/?=&%._-]+$/i.test(route) || route.length > 4096) {
            throw new Error("Invalid LANraragi API route.");
        }
        const response = await Network.get(this.baseUrl() + route, this.requestHeaders());
        if (!response || typeof response.status !== "number") {
            throw new Error("LANraragi returned an invalid HTTP response.");
        }
        if (response.status === 401 || response.status === 403) {
            throw new Error("LANraragi HTTP " + response.status + ": check API Key and server access.");
        }
        if (response.status === 404) {
            throw new Error("LANraragi HTTP 404: archive or API endpoint unavailable.");
        }
        if (response.status === 204) {
            throw new Error("LANraragi API returned no data (index/extraction may be pending).");
        }
        if (response.status !== 200) {
            throw new Error("LANraragi HTTP " + response.status);
        }
        if (typeof response.body !== "string" || response.body.length > 4 * 1024 * 1024) {
            throw new Error("Invalid or oversized LANraragi JSON response.");
        }
        try {
            return JSON.parse(response.body);
        } catch (_) {
            throw new Error("LANraragi returned invalid JSON.");
        }
    }

    coverKey(id) {
        return "lrr-cover:" + this.archiveId(id);
    }

    parseTags(raw) {
        const tags = {};
        if (typeof raw !== "string") return tags;
        for (const part of raw.slice(0, 100000).split(",")) {
            const tag = part.trim();
            if (!tag) continue;
            const position = tag.indexOf(":");
            let group = position > 0 ? tag.slice(0, position).trim() : "Tags";
            const value = position > 0 ? tag.slice(position + 1).trim() : tag;
            // Avoid prototype pollution; return a plain JSON-bridge object.
            if (["__proto__", "constructor", "prototype", "toString",
                "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable",
                "toLocaleString", "__defineGetter__", "__defineSetter__",
                "__lookupGetter__", "__lookupSetter__"].indexOf(group) >= 0) {
                group = "Tags";
            }
            if (!value || group.length > 100 || value.length > 512) continue;
            if (!Object.prototype.hasOwnProperty.call(tags, group)) tags[group] = [];
            if (tags[group].length < 200) tags[group].push(value);
        }
        return tags;
    }

    toComic(item) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new Error("Invalid LANraragi archive item.");
        }
        if (this.isTank(item.arcid)) {
            const cover = item.arcid && this._tankCover ? this._tankCover[item.arcid] : "";
            const comic = this.tankComic(item.arcid, cover);
            comic.title = this.text(item.title || item.filename || item.arcid, 512);
            comic.subtitle = this.text(item.summary, 512);
            comic.tags = typeof item.tags === "string"
                ? item.tags.split(",").slice(0, 200).map(x => x.trim()).filter(Boolean)
                : [];
            return comic;
        }
        const id = this.archiveId(item.arcid);
        return new Comic({
            id: id,
            title: this.text(item.title || item.filename || id, 512),
            cover: this.coverKey(id),
            subtitle: this.text(item.summary, 512),
            tags: typeof item.tags === "string"
                ? item.tags.split(",").slice(0, 200).map(x => x.trim()).filter(Boolean)
                : []
        });
    }

    pagePath(value) {
        if (typeof value !== "string" || value.length === 0 || value.length > 4096 ||
            /[\u0000-\u001f\u007f\\?#]/.test(value) || value[0] === "/" ||
            value.split("/").some(part => !part || part === "." || part === "..") ||
            /%(?:2e|2f|5c|00)/i.test(value)) {
            throw new Error("Unsafe LANraragi image filename.");
        }
        return value;
    }

    pageKey(idValue, rawValue) {
        const id = this.archiveId(idValue);
        if (typeof rawValue !== "string" || rawValue.length > 8192) {
            throw new Error("Invalid LANraragi page URL.");
        }
        let raw = rawValue;
        // Absolute URLs are acceptable only for the exact configured base.
        // No userinfo, foreign host, cross-scheme or substring-origin matching.
        if (/^https?:\/\//i.test(raw)) {
            const base = this.baseUrl();
            if (!raw.startsWith(base + "/")) {
                throw new Error("Unexpected LANraragi page origin.");
            }
            raw = raw.slice(base.length + 1);
        }
        const match = /^(?:\.\/|\/)?api\/archives\/([a-f0-9]{40})\/page[?&]path=([^&#]+)$/i.exec(raw);
        if (!match || match[1].toLowerCase() !== id) {
            throw new Error("Unexpected LANraragi page URL format.");
        }
        let filename;
        try {
            filename = decodeURIComponent(match[2].replace(/\+/g, " "));
        } catch (_) {
            throw new Error("Invalid LANraragi image filename encoding.");
        }
        return "lrr-page:" + id + ":" + encodeURIComponent(this.pagePath(filename));
    }

    imageBelongs(comicId, archiveId) {
        const comic = String(comicId || "");
        const archive = String(archiveId || "").toLowerCase();
        if (!this.isTank(comic)) return this.archiveId(comic) === archive;
        const chapters = this._tankChapters && this._tankChapters[comic];
        if (chapters && chapters.indexOf(archive) >= 0) return true;
        const cover = this._tankCover && this._tankCover[comic];
        return cover === archive;
    }

    imageUrl(key, comicId) {
        const value = String(key || "");
        if (value.startsWith("lrr-cover:")) {
            const coverId = this.archiveId(value.slice("lrr-cover:".length));
            if (comicId != null && !this.imageBelongs(comicId, coverId)) {
                throw new Error("LANraragi cover belongs to another archive.");
            }
            return this.baseUrl() + "/api/archives/" + coverId + "/thumbnail";
        }
        const match = /^lrr-page:([a-f0-9]{40}):(.+)$/i.exec(value);
        if (!match) throw new Error("Invalid LANraragi image key.");
        const id = this.archiveId(match[1]);
        if (comicId != null && !this.imageBelongs(comicId, id)) {
            throw new Error("LANraragi page belongs to another archive.");
        }
        let filename;
        try {
            filename = decodeURIComponent(match[2]);
        } catch (_) {
            throw new Error("Invalid LANraragi image key encoding.");
        }
        return this.baseUrl() + "/api/archives/" + id +
            "/page?path=" + encodeURIComponent(this.pagePath(filename));
    }
}
