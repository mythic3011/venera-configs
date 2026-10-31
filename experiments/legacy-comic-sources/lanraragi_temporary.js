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
        this.version = "0.1.1";
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
                    "&start=" + offset + "&groupby_tanks=false" +
                    "&sortby=title&order=asc"
                );
                if (!data || !Array.isArray(data.data) || data.data.length > 1000 ||
                    !Number.isSafeInteger(Number(data.recordsFiltered)) ||
                    Number(data.recordsFiltered) < 0) {
                    throw new Error("Invalid LANraragi search response.");
                }
                const items = data.data.map(item => this.toComic(item));
                const total = Number(data.recordsFiltered);
                const end = offset + items.length;
                return {comics: items, next: items.length && end < total ? String(end) : null};
            }
        };

        this.comic = {
            loadInfo: async id => {
                const archiveId = this.archiveId(id);
                const data = await this.requestJson(
                    "/api/archives/" + archiveId + "/metadata"
                );
                if (!data || typeof data !== "object" || Array.isArray(data)) {
                    throw new Error("Invalid LANraragi metadata.");
                }
                const tags = this.parseTags(data.tags);
                if (Number.isSafeInteger(Number(data.pagecount)) && Number(data.pagecount) > 0) {
                    tags.Pages = [String(data.pagecount)];
                }
                return new ComicDetails({
                    title: this.text(data.title || data.filename || archiveId, 512),
                    cover: this.coverKey(archiveId),
                    description: this.text(data.summary, 10000),
                    tags: tags,
                    chapters: null
                });
            },
            loadEp: async (comicId, epId) => {
                if (epId != null && epId !== "") {
                    throw new Error("LANraragi archive has no chapters.");
                }
                const id = this.archiveId(comicId);
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

    imageUrl(key, comicId) {
        const value = String(key || "");
        if (value.startsWith("lrr-cover:")) {
            const coverId = this.archiveId(value.slice("lrr-cover:".length));
            if (comicId != null && this.archiveId(comicId) !== coverId) {
                throw new Error("LANraragi cover belongs to another archive.");
            }
            return this.baseUrl() + "/api/archives/" + coverId + "/thumbnail";
        }
        const match = /^lrr-page:([a-f0-9]{40}):(.+)$/i.exec(value);
        if (!match) throw new Error("Invalid LANraragi image key.");
        const id = this.archiveId(match[1]);
        if (comicId != null && this.archiveId(comicId) !== id) {
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
