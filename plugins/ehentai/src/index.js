class Ehentai extends ComicSource {
  constructor() {
    super();
    this.name = "ehentai";
    this.key = "ehentai";
    this.version = "1.2.0";
    this.minAppVersion = "1.5.3";
    this.url = resolvePluginUpdateUrl("ehentai.js");

    this.apikey = null;
    this.uid = null;
    this._accountFieldNames = [
      "ipb_member_id",
      "ipb_pass_hash",
      "igneous",
      "star",
    ];
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
    return ehentaiGetErrorMessage(error);
  }

  isRedirectError(error) {
    return ehentaiIsRedirectError(error);
  }

  isAbuseResponseBody(body) {
    return ehentaiIsAbuseResponseBody(this, body);
  }

  hasNonWhitespace(text) {
    return hasNonWhitespaceText(text);
  }

  firstNonWhitespaceChar(text) {
    return ehentaiFirstNonWhitespaceChar(text);
  }

  formatRequestError(action, error) {
    return ehentaiFormatRequestError(action, error);
  }

  formatResponseError(action, response) {
    return ehentaiFormatResponseError(this, action, response);
  }

  requireStatus(action, response, expectedStatus = 200) {
    return ehentaiRequireStatus(this, action, response, expectedStatus);
  }

  requireNonEmptyBody(action, response) {
    return ehentaiRequireNonEmptyBody(this, action, response);
  }

  requireHtmlBody(action, response) {
    return ehentaiRequireHtmlBody(this, action, response);
  }

  parseJsonResponse(action, response) {
    return ehentaiParseJsonResponse(this, action, response);
  }

  async withDocument(html, parser) {
    return ehentaiWithDocument(html, parser);
  }

  buildRequestHeaders(method, url, headers, options) {
    return ehentaiBuildRequestHeaders(this, method, url, headers, options);
  }

  async checkEHEvent() {
    return ehentaiCheckEvent(this);
  }

  get baseUrl() {
    return ehentaiResolveBaseUrl(this);
  }

  get apiUrl() {
    return ehentaiResolveApiUrl(this);
  }

  get accountFieldNames() {
    return this._accountFieldNames;
  }

  normalizeAccountValues(values) {
    return ehentaiNormalizeAccountValues(this, values);
  }

  createAccountCookies(values) {
    return ehentaiCreateAccountCookies(this, values);
  }

  applyCookiesFromValues(values) {
    return ehentaiApplyCookiesFromValues(this, values);
  }

  clearRuntimeCaches() {
    return ehentaiClearRuntimeCaches(this);
  }

  clearSessionCookies() {
    return ehentaiClearSessionCookies();
  }

  loadAccountStore() {
    return ehentaiLoadAccountStore(this);
  }

  saveAccountStore(store) {
    return ehentaiSaveAccountStore(this, store);
  }

  getAccountDisplayName(profile, index) {
    return ehentaiGetAccountDisplayName(this, profile, index);
  }

  upsertAccountProfile(values, preferredName) {
    return ehentaiUpsertAccountProfile(this, values, preferredName);
  }

  async captureAccountFromCookieJar(preferredName) {
    return ehentaiCaptureAccountFromCookieJar(this, preferredName);
  }

  async collectAccountValuesFromCookieDomains() {
    return ehentaiCollectAccountValuesFromCookieDomains(this);
  }

  async activateAccountProfile(profileId) {
    return ehentaiActivateAccountProfile(this, profileId);
  }

  logoutAccountSession() {
    return ehentaiLogoutAccountSession(this);
  }

  getStarsFromPosition(position) {
    return ehentaiParseStarsFromPosition(position);
  }

  async onLoadFailed(reason = null) {
    return ehentaiOnLoadFailed(this, reason);
  }

  async getGalleries(url, isLeaderBoard) {
    return ehentaiGetGalleries(this, url, isLeaderBoard);
  }
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}
