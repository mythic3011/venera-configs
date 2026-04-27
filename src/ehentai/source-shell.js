class Ehentai extends ComicSource {
  // Note: The fields which are marked as [Optional] should be removed if not used

  constructor() {
    super();
    // name of the source
    this.name = "ehentai";

    // unique id of the source
    this.key = "ehentai";

    this.version = "1.2.0";

    this.minAppVersion = "1.5.3";

    // update url
    this.url = buildCdnSourceUrl("ehentai.js");

    /**
     * cached api key
     * @type {string | null}
     */
    this.apikey = null;

    /**
     * cached uid key
     * @type {string | null}
     */
    this.uid = null;
    this._accountFieldNames = ["ipb_member_id", "ipb_pass_hash", "igneous", "star"];
    this._cachedDomain = null;
    this._cachedBaseUrl = null;
    this._cachedApiUrl = null;
    this._accountStoreCache = null;
    this._abuseResponsePattern =
      /your ip address has been banned|access denied|request denied|temporarily banned/i;

    this.requestState = {
      queues: new Map(),
      inflight: new Map(),
      cooldownUntil: new Map(),
    };

    // In-memory caches only. Never persist session-derived runtime data.
    this.responseCache = new Map();
    this.thumbnailCache = new Map();
    this.keyCache = new Map();
    this.galleryInfoCache = new Map();
    this.imageSessionCache = new Map();

    this.account = createEhentaiAccountFeature(this);
    this.explore = createEhentaiExploreFeature(this);
    this.category = createEhentaiCategory();
    this.categoryComics = createEhentaiCategoryComics(this);
    this.search = createSearchFeature(this);
    this.favorites = createFavoritesFeature(this);
    this.comic = createComicFeature(this);
    this.settings = createSettings(this);
    this.translation = i18n;
  }

  /**
   * @param url
   * @returns {{id: string, token: string}}
   */
  parseUrl(url) {
    return parseGalleryUrl(url);
  }

  get requestClient() {
    if (!this._requestClient) {
      this._requestClient = new EhentaiRequestClient(this);
    }
    return this._requestClient;
  }

  get imageSessions() {
    if (!this._imageSessions) {
      this._imageSessions = new ImageLoadingSessionManager(this);
    }
    return this._imageSessions;
  }

  getErrorMessage(error) {
    if (error == null) {
      return "Unknown error";
    }
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error.message === "string" && error.message.length > 0) {
      return error.message;
    }
    return String(error);
  }

  isRedirectError(error) {
    return this.getErrorMessage(error).toLowerCase().includes("redirect");
  }

  isAbuseResponseBody(body) {
    let text = String((body && body.body) || body || "");
    if (!this.hasNonWhitespace(text)) {
      return true;
    }
    return this._abuseResponsePattern.test(text);
  }

  hasNonWhitespace(text) {
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code !== 32 && code !== 9 && code !== 10 && code !== 13) {
        return true;
      }
    }
    return false;
  }

  firstNonWhitespaceChar(text) {
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code !== 32 && code !== 9 && code !== 10 && code !== 13) {
        return text[i];
      }
    }
    return "";
  }

  formatRequestError(action, error) {
    let message = this.getErrorMessage(error);
    if (this.isRedirectError(message)) {
      return `${action} failed: request was redirected by the server`;
    }
    if (
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("socket")
    ) {
      return `${action} failed: network error (${message})`;
    }
    return `${action} failed: ${message}`;
  }

  formatResponseError(action, response) {
    let status = response?.status;
    let body = String(response?.body ?? "").trim();
    if (status === 403 || status === 429) {
      return `${action} failed: server returned ${status}`;
    }
    if (body.length === 0) {
      return `${action} failed: empty response from server`;
    }
    if (this.isAbuseResponseBody(body)) {
      return `${action} failed: access was denied by the server`;
    }
    return `${action} failed: invalid status code ${status}`;
  }

  requireStatus(action, response, expectedStatus = 200) {
    if (!response || response.status !== expectedStatus) {
      throw this.formatResponseError(action, response || {});
    }
  }

  requireNonEmptyBody(action, response) {
    const body = String((response && response.body) || "");
    if (!this.hasNonWhitespace(body)) {
      throw this.formatResponseError(action, response || {});
    }
    return body;
  }

  requireHtmlBody(action, response) {
    const body = this.requireNonEmptyBody(action, response);
    if (this.firstNonWhitespaceChar(body) !== "<") {
      throw `${action} failed: invalid HTML response`;
    }
    return body;
  }

  parseJsonResponse(action, response) {
    this.requireNonEmptyBody(action, response);
    try {
      return JSON.parse(response.body);
    } catch (_) {
      throw `${action} failed: invalid JSON response`;
    }
  }

  async withDocument(html, parser) {
    const document = new HtmlDocument(html);
    try {
      return await parser(document);
    } finally {
      document.dispose();
    }
  }

  buildRequestHeaders(method, url, headers, options) {
    const merged = { ...(headers || {}) };

    if (options.headerProfile === "json-api") {
      if (!merged["Content-Type"]) {
        merged["Content-Type"] = "application/json";
      }
    }

    if (options.headerProfile === "form-urlencoded") {
      if (!merged["Content-Type"]) {
        merged["Content-Type"] = "application/x-www-form-urlencoded";
      }
    }

    if (options.headerProfile === "gallery-view") {
      if (!merged.cookie) {
        merged.cookie = "nw=1";
      }
    }

    if (options.headerProfile === "thumbnail") {
      if (!merged.referer) {
        merged.referer = this.baseUrl;
      }
    }

    if (options.headerProfile === "forums-browser") {
      if (!merged.accept) {
        merged.accept =
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
      }
      if (!merged["accept-encoding"]) {
        merged["accept-encoding"] = "gzip, deflate, br";
      }
      if (!merged["accept-language"]) {
        merged["accept-language"] = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7";
      }
    }

    if (options.refererUrl && !merged.referer) {
      merged.referer = options.refererUrl;
    }

    if (options.networkClient === "dart-io" && !merged.http_client) {
      merged.http_client = "dart:io";
    }

    return merged;
  }

  async checkEHEvent() {
    if (!this.isLogged) {
      return;
    }
    if (!this.loadSetting("ehevent")) {
      return;
    }
    try {
      const lastEvent = this.loadData("lastEventTime");
      const newTime = new Date().toISOString().split("T")[0];
      if (lastEvent == newTime) {
        return;
      }
      const res = await this.requestClient.get(
        buildEhNewsUrl(),
        {},
        {
          action: "Failed to load event news",
          requestKey: "event-news",
        },
      );
      if (res.status !== 200 || this.isAbuseResponseBody(res.body)) {
        return;
      }
      this.saveData("lastEventTime", newTime);
      await this.withDocument(res.body, async (document) => {
        const eventPane = document.getElementById("eventpane");
        if (eventPane == null) {
          return;
        }
        const dawnInfo = eventPane.querySelector("div > p:nth-child(2)");
        if (dawnInfo == null) {
          return;
        }
        UI.showMessage(dawnInfo.text);
      });
    } catch (error) {
      // Event checks are advisory; never let them break the main request path.
    }
  }

  get baseUrl() {
    const domain = this.loadSetting("domain");
    if (domain !== this._cachedDomain || !this._cachedBaseUrl) {
      this._cachedDomain = domain;
      this._cachedBaseUrl = buildBaseUrl(domain);
      this._cachedApiUrl = buildApiUrl(this._cachedBaseUrl);
    }
    return this._cachedBaseUrl;
  }

  get apiUrl() {
    if (!this._cachedApiUrl) {
      this._cachedApiUrl = buildApiUrl(this.baseUrl);
    }
    return this._cachedApiUrl;
  }

  get accountFieldNames() {
    return this._accountFieldNames;
  }

  normalizeAccountValues(values) {
    let normalized = [];
    for (let i = 0; i < this.accountFieldNames.length; i++) {
      normalized.push(String((values && values[i]) || ""));
    }
    return normalized;
  }

  createAccountCookies(values) {
    let normalized = this.normalizeAccountValues(values);
    let cookies = [];
    for (let i = 0; i < this.accountFieldNames.length; i++) {
      let name = this.accountFieldNames[i];
      let value = normalized[i];
      cookies.push(
        new Cookie({
          name,
          value,
          domain: ".e-hentai.org",
        }),
      );
      cookies.push(
        new Cookie({
          name,
          value,
          domain: ".exhentai.org",
        }),
      );
    }
    return cookies;
  }

  applyCookiesFromValues(values) {
    let cookies = this.createAccountCookies(values);
    Network.deleteCookies(buildEhCookieUrl());
    Network.deleteCookies(buildExCookieUrl());
    Network.setCookies(buildEhCookieUrl(), cookies);
    Network.setCookies(buildExCookieUrl(), cookies);
  }

  clearRuntimeCaches() {
    this.responseCache.clear();
    this.thumbnailCache.clear();
    this.keyCache.clear();
    this.galleryInfoCache.clear();
    this.imageSessionCache.clear();
    this.apikey = null;
    this.uid = null;
  }

  clearSessionCookies() {
    Network.deleteCookies(buildEhCookieUrl());
    Network.deleteCookies(buildForumsCookieUrl());
    Network.deleteCookies(buildExCookieUrl());
  }

  loadAccountStore() {
    if (this._accountStoreCache) {
      return this._accountStoreCache;
    }
    let raw = this.loadData("accountStore");
    let parsed = null;
    if (!raw) {
      this._accountStoreCache = {
        version: 1,
        activeProfileId: null,
        profiles: [],
      };
      return this._accountStoreCache;
    }
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        parsed = null;
      }
    } else if (typeof raw === "object") {
      parsed = raw;
    }
    if (!parsed || !Array.isArray(parsed.profiles)) {
      this._accountStoreCache = {
        version: 1,
        activeProfileId: null,
        profiles: [],
      };
      return this._accountStoreCache;
    }

    let profiles = parsed.profiles
      .map((profile, index) => {
        let values = this.normalizeAccountValues(profile && profile.values);
        return {
          id: String((profile && profile.id) || `${Date.now()}_${index}`),
          name: profile && profile.name ? String(profile.name) : "",
          values,
          createdAt: String((profile && profile.createdAt) || new Date().toISOString()),
          lastUsedAt: String((profile && profile.lastUsedAt) || new Date().toISOString()),
        };
      })
      .filter((profile) => profile.values[0] && profile.values[1]);

    let activeProfileId =
      parsed.activeProfileId &&
      profiles.some((profile) => profile.id === parsed.activeProfileId)
        ? String(parsed.activeProfileId)
        : null;

    this._accountStoreCache = {
      version: 1,
      activeProfileId,
      profiles,
    };
    return this._accountStoreCache;
  }

  saveAccountStore(store) {
    let normalized = {
      version: 1,
      activeProfileId: store.activeProfileId || null,
      profiles: store.profiles || [],
    };
    this._accountStoreCache = normalized;
    this.saveData("accountStore", JSON.stringify(normalized));
  }

  getAccountDisplayName(profile, index) {
    let base = profile && profile.name ? profile.name : `${this.translate("account")} ${index + 1}`;
    let memberId = profile && profile.values ? profile.values[0] : "";
    return memberId ? `${base} (${memberId})` : base;
  }

  upsertAccountProfile(values, preferredName) {
    let normalized = this.normalizeAccountValues(values);
    if (!normalized[0] || !normalized[1]) {
      return null;
    }
    let store = this.loadAccountStore();
    let now = new Date().toISOString();
    let existing = store.profiles.find((profile) => {
      return profile.values[0] === normalized[0] && profile.values[1] === normalized[1];
    });
    if (existing) {
      existing.values = normalized;
      if (preferredName) {
        existing.name = preferredName;
      }
      existing.lastUsedAt = now;
      store.activeProfileId = existing.id;
      this.saveAccountStore(store);
      return existing.id;
    }
    let id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    store.profiles.push({
      id,
      name: preferredName || "",
      values: normalized,
      createdAt: now,
      lastUsedAt: now,
    });
    store.activeProfileId = id;
    this.saveAccountStore(store);
    return id;
  }

  async captureAccountFromCookieJar(preferredName) {
    let cookies = await Network.getCookies(buildEhCookieUrl());
    let values = [];
    for (let key of this.accountFieldNames) {
      let cookie = cookies.find((item) => item.name === key);
      values.push(cookie ? String(cookie.value || "") : "");
    }
    return this.upsertAccountProfile(values, preferredName || "");
  }

  async activateAccountProfile(profileId) {
    let store = this.loadAccountStore();
    let profile = store.profiles.find((item) => item.id === profileId);
    if (!profile) {
      throw "Account profile not found";
    }
    this.applyCookiesFromValues(profile.values);
    this.clearRuntimeCaches();
    profile.lastUsedAt = new Date().toISOString();
    store.activeProfileId = profile.id;
    this.saveAccountStore(store);
    return profile;
  }

  logoutAccountSession() {
    this.clearSessionCookies();
    this.clearRuntimeCaches();
    let store = this.loadAccountStore();
    store.activeProfileId = null;
    this.saveAccountStore(store);
  }

  getStarsFromPosition(position) {
    let i = 0;
    while (position[i] !== ";") {
      i++;
      if (i === position.length) {
        break;
      }
    }
    switch (position.substring(0, i)) {
      case "background-position:0px -1px":
        return 5;
      case "background-position:0px -21px":
        return 4.5;
      case "background-position:-16px -1px":
        return 4;
      case "background-position:-16px -21px":
        return 3.5;
      case "background-position:-32px -1px":
        return 3;
      case "background-position:-32px -21px":
        return 2.5;
      case "background-position:-48px -1px":
        return 2;
      case "background-position:-48px -21px":
        return 1.5;
      case "background-position:-64px -1px":
        return 1;
      case "background-position:-64px -21px":
        return 0.5;
    }
    return 0.5;
  }

  async onLoadFailed(reason = null) {
    let cookies;
    try {
      cookies = await Network.getCookies(buildEhCookieUrl());
    } catch (error) {
      throw this.formatRequestError("Failed to recover session cookies", error);
    }
    cookies.forEach((c) => {
      c.domain = ".exhentai.org";
    });
    cookies = cookies.filter((item) => item.name !== "igneous");
    Network.deleteCookies(buildExCookieUrl());
    Network.setCookies(buildExCookieUrl(), cookies);
    let suffix = reason ? ` (${reason})` : "";
    throw `You may not have permission to access this page${suffix}. Please check your network or try to login again.`;
  }

  /**
   *
   * @param url {string}
   * @param isLeaderBoard {boolean}
   * @returns {Promise<{comics: Comic[], next: string?}>}
   */
  async getGalleries(url, isLeaderBoard) {
    try {
      await this.checkEHEvent();
    } catch (_) {}
    let t = isLeaderBoard ? 1 : 0;
    let res;
    try {
      res = await this.requestClient.get(
        url,
        {},
        {
          action: "Failed to load gallery list",
          requestKey: `galleries:${url}`,
        },
      );
    } catch (e) {
      if (this.isRedirectError(e)) {
        await this.onLoadFailed("request was redirected");
      }
      throw this.formatRequestError("Failed to load gallery list", e);
    }
    if (res.status !== 200) {
      throw this.formatResponseError("Failed to load gallery list", res);
    }
    if (res.body.trim().length === 0) {
      await this.onLoadFailed("empty response from gallery list");
    }
    if (res.body[0] !== "<") {
      if (this.isAbuseResponseBody(res.body)) {
        throw "Your IP address has been banned";
      }
      throw "Failed to load gallery list";
    }
    let document = new HtmlDocument(res.body);
    try {
      return parseGalleryList({
        document,
        source: this,
        url,
        isLeaderBoard,
      });
    } finally {
      document.dispose();
    }
  }

}
