class Ehentai extends ComicSource {
  // Note: The fields which are marked as [Optional] should be removed if not used

  // name of the source
  name = "ehentai";

  // unique id of the source
  key = "ehentai";

  version = "1.2.0";

  minAppVersion = "1.5.3";

  // update url
  url = EhentaiModules.buildCdnSourceUrl("ehentai.js");

  /**
   * cached api key
   * @type {string | null}
   */
  apiKey = null;

  /**
   * cached uid key
   * @type {string | null}
   */
  uid = null;

  requestState = {
    queues: new Map(),
    inflight: new Map(),
    cooldownUntil: new Map(),
    failureBudget: new Map(),
  };

  // In-memory caches only. Never persist session-derived runtime data.
  responseCache = new Map();
  thumbnailCache = new Map();
  keyCache = new Map();
  galleryInfoCache = new Map();
  imageSessionCache = new Map();

  /**
   * @param url
   * @returns {{id: string, token: string}}
   */
  parseUrl(url) {
    return EhentaiModules.parseGalleryUrl(url);
  }

  get requestClient() {
    if (!this._requestClient) {
      this._requestClient = new EhentaiModules.EhentaiRequestClient(this);
    }
    return this._requestClient;
  }

  get imageSessions() {
    if (!this._imageSessions) {
      this._imageSessions = new EhentaiModules.ImageLoadingSessionManager(this);
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
    let text = String(body ?? "").trim();
    if (text.length === 0) {
      return true;
    }
    let lower = text.toLowerCase();
    return (
      lower.includes("your ip address has been banned") ||
      lower.includes("access denied") ||
      lower.includes("request denied") ||
      lower.includes("temporarily banned")
    );
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
      const res = await this.requestClient.get(EhentaiModules.buildEhNewsUrl(), {}, {
        action: "Failed to load event news",
        requestKey: "event-news",
      });
      if (res.status !== 200 || this.isAbuseResponseBody(res.body)) {
        return;
      }
      this.saveData("lastEventTime", newTime);
      const document = new HtmlDocument(res.body);
      const eventPane = document.getElementById("eventpane");
      if (eventPane == null) {
        return;
      }
      const dawnInfo = eventPane.querySelector("div > p:nth-child(2)");
      if (dawnInfo == null) {
        return;
      }
      UI.showMessage(dawnInfo.text);
    } catch (error) {
      // Event checks are advisory; never let them break the main request path.
    }
  }

  // [Optional] account related
  account = EhentaiModules.features.createAccountFeature(this, {
    /**
     * [Optional] login with webview
     */
    loginWithWebview: {
      url: EhentaiModules.buildForumsLoginUrl(),
      /**
       * check login status
       * @param url {string} - current url
       * @param title {string} - current title
       * @returns {boolean} - return true if login success
       */
      checkStatus: (url, title) => {
        return title === "E-Hentai Forums";
      },
      onLoginSuccess: async () => {
        let cookies = await Network.getCookies(EhentaiModules.buildForumsCookieUrl());
        cookies.forEach((cookie) => {
          cookie.domain = ".exhentai.org";
        });
        Network.setCookies(EhentaiModules.buildExCookieUrl(), cookies);
      },
    },

    loginWithCookies: {
      fields: ["ipb_member_id", "ipb_pass_hash", "igneous", "star"],
      /**
       * Validate cookies, return false if cookies are invalid.
       *
       * Use `Network.setCookies` to set cookies before validate.
       * @param values {string[]} - same order as `fields`
       * @returns {Promise<boolean>}
       */
      validate: async (values) => {
        if (values.length !== 4) {
          return false;
        }
        if (values[0].length === 0 || values[1].length === 0) {
          return false;
        }
        let cookies = [];
        for (let i = 0; i < values.length; i++) {
          cookies.push(
            new Cookie({
              name: this.account.loginWithCookies.fields[i],
              value: values[i],
              domain: ".e-hentai.org",
            }),
          );
          cookies.push(
            new Cookie({
              name: this.account.loginWithCookies.fields[i],
              value: values[i],
              domain: ".exhentai.org",
            }),
          );
        }
        Network.deleteCookies(EhentaiModules.buildEhCookieUrl());
        Network.setCookies(EhentaiModules.buildEhCookieUrl(), cookies);
        let res = await Network.get(EhentaiModules.buildForumsHomeUrl(), {
          referer: EhentaiModules.buildForumsIndexRefererUrl(),
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        });
        if (res.status !== 200) {
          return false;
        }
        let document = new HtmlDocument(res.body);
        let name = document.querySelector("div#userlinks > p.home > b > a");
        document.dispose();
        return name != null;
      },
    },

    /**
     * logout function, clear account related data
     */
    logout: () => {
      Network.deleteCookies(EhentaiModules.buildEhCookieUrl());
      Network.deleteCookies(EhentaiModules.buildForumsCookieUrl());
      Network.deleteCookies(EhentaiModules.buildExCookieUrl());
      this.responseCache.clear();
      this.thumbnailCache.clear();
      this.keyCache.clear();
      this.galleryInfoCache.clear();
      this.imageSessionCache.clear();
    },

    // {string?} - register url
    registerWebsite: null,
  });

  get baseUrl() {
    return EhentaiModules.buildBaseUrl(this.loadSetting("domain"));
  }

  get apiUrl() {
    return EhentaiModules.buildApiUrl(this.baseUrl);
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
      cookies = await Network.getCookies(EhentaiModules.buildEhCookieUrl());
    } catch (error) {
      throw this.formatRequestError("Failed to recover session cookies", error);
    }
    cookies.forEach((c) => {
      c.domain = ".exhentai.org";
    });
    cookies = cookies.filter((item) => item.name !== "igneous");
    Network.deleteCookies(EhentaiModules.buildExCookieUrl());
    Network.setCookies(EhentaiModules.buildExCookieUrl(), cookies);
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
      res = await this.requestClient.get(url, {}, {
        action: "Failed to load gallery list",
        requestKey: `galleries:${url}`,
      });
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
      return EhentaiModules.parsers.parseGalleryList({
        document,
        source: this,
        url,
        isLeaderBoard,
      });
    } finally {
      document.dispose();
    }
  }

  // explore page list
  explore = EhentaiModules.features.createExploreFeature(this, [
    {
      // title of the page.
      // title is used to identify the page, it should be unique
      title: "eh latest",

      /// multiPartPage or multiPageComicList or mixed
      type: "multiPageComicList",

      loadNext: (next) => {
        return this.getGalleries(next ?? this.baseUrl, false);
      },
    },
    {
      // title of the page.
      // title is used to identify the page, it should be unique
      title: "eh popular",

      /// multiPartPage or multiPageComicList or mixed
      type: "multiPageComicList",

      loadNext: (next) => {
        return this.getGalleries(
          next ?? EhentaiModules.buildPopularUrl(this.baseUrl),
          false,
        );
      },
    },
    {
      // title of the page.
      // title is used to identify the page, it should be unique
      title: "eh watched",

      /// multiPartPage or multiPageComicList or mixed
      type: "multiPageComicList",

      loadNext: async (next) => {
        if (!this.isLogged) {
          UI.showMessage("Need login first");
          return {
            comics: [],
            next: null,
          };
        }
        return this.getGalleries(
          next ?? EhentaiModules.buildWatchedUrl(this.baseUrl),
          false,
        );
      },
    },
  ]);

  // categories
  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: "ehentai",
    parts: [],
    // enable ranking page
    enableRankingPage: true,
  };

  /// category comic loading related
  categoryComics = {
    ranking: {
      // For a single option, use `-` to separate the value and text, left for value, right for text
      options: ["15-yesterday", "13-month", "12-year", "11-all"],
      /**
       * load ranking comics
       * @param option {string} - option from optionList
       * @param page {number} - page number
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (option, page) => {
        let res = await this.getGalleries(
          EhentaiModules.buildToplistUrl(
            EhentaiModules.buildBaseUrl("e-hentai.org"),
            option,
            page - 1,
          ),
          true,
        );
        let comics = res.comics;
        if (this.loadSetting("domain") === "exhentai.org") {
          comics.forEach((e) => {
            e.id = e.id.replace("e-hentai", "exhentai");
          });
        }
        return {
          comics: comics,
          maxPage: 200,
        };
      },
    },
  };

  /// search related
  search = EhentaiModules.features.createSearchFeature(this, {
    /**
     * load search result with next page token
     * @param keyword {string}
     * @param options {(string)[]} - options from optionList
     * @param next {string | null}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    loadNext: async (keyword, options, next) => {
      let category = JSON.parse(options[0]);
      let stars = options[1];
      let language = options[2];
      let fcats = 1023;
      if (!Array.isArray(category)) {
        category = [category];
      }
      for (let c of category) {
        fcats -= 1 << Number(c);
      }
      if (language && !keyword.includes("language:")) {
        keyword += ` language:${language}`;
      }
      let url = EhentaiModules.buildSearchUrl(this.baseUrl, keyword, fcats, stars);
      return this.getGalleries(next ?? url, false);
    },

    // provide options for search
    optionList: [
      {
        // type: select, multi-select, dropdown
        type: "multi-select",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: [
          "0-Misc",
          "1-Doujinshi",
          "2-Manga",
          "3-Artist CG",
          "4-Game CG",
          "5-Image Set",
          "6-Cosplay",
          "7-Asian Porn",
          "8-Non-H",
          "9-Western",
        ],
        // option label
        label: "Category",
        // default selected options
        default: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      },
      {
        // type: select, multi-select, dropdown
        // For select, there is only one selected value
        // For multi-select, there are multiple selected values or none. The `load` function will receive a json string which is an array of selected values
        // For dropdown, there is one selected value at most. If no selected value, the `load` function will receive a null
        type: "dropdown",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: ["-<none>", "0-0", "1-1", "2-2", "3-3", "4-4", "5-5"],
        // option label
        label: "Min Stars",
      },
      {
        // type: select, multi-select, dropdown
        type: "dropdown",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: [
          "-<none>",
          "chinese-Chinese",
          "english-English",
          "japanese-Japanese",
        ],
        // option label
        label: "Language",
      },
    ],

    // enable tags suggestions
    enableTagsSuggestions: true,
  });

  // favorite related
  favorites = EhentaiModules.features.createFavoritesFeature(this, {
    // whether support multi folders
    multiFolder: true,
    singleFolderForSingleComic: true,
    /**
     * add or delete favorite.
     * throw `Login expired` to indicate login expired, App will automatically re-login and re-add/delete favorite
     * @param comicId {string}
     * @param folderId {string}
     * @param isAdding {boolean} - true for add, false for delete
     * @param favoriteId {string?} - [Comic.favoriteId]
     * @returns {Promise<any>} - return any value to indicate success
     */
    addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
      let parsed = this.parseUrl(comicId);
      let id = parsed.id;
      let token = parsed.token;
      const url = EhentaiModules.buildGalleryPopupUrl(this.baseUrl, id, token);
      if (isAdding) {
        let res = await this.requestClient.post(
          url,
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          EhentaiModules.buildAddFavoriteForm(folderId),
          {
            action: "Failed to add favorite",
            requestKey: `favorite:add:${comicId}:${folderId}`,
            mutation: true,
            maxRetries: 0,
          },
        );
        if (
          res.status !== 200 ||
          res.body.length === 0 ||
          res.body[0] !== "<"
        ) {
          throw "Failed to add favorite";
        }
        return "ok";
      } else {
        let res = await this.requestClient.post(
          url,
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          EhentaiModules.buildDeleteFavoriteForm(),
          {
            action: "Failed to delete favorite",
            requestKey: `favorite:del:${comicId}`,
            mutation: true,
            maxRetries: 0,
          },
        );
        if (
          res.status !== 200 ||
          res.body.length === 0 ||
          res.body[0] !== "<"
        ) {
          throw "Failed to delete favorite";
        }
        return "ok";
      }
    },
    /**
     * load favorite folders.
     * throw `Login expired` to indicate login expired, App will automatically re-login retry.
     * if comicId is not null, return favorite folders which contains the comic.
     * @param comicId {string?}
     * @returns {Promise<{folders: {[p: string]: string}, favorited: string[]}>} - `folders` is a map of folder id to folder name, `favorited` is a list of folder id which contains the comic
     */
    loadFolders: async (comicId) => {
      try {
        await this.checkEHEvent();
      } catch (_) {}
      let res = await this.requestClient.get(
        EhentaiModules.buildFavoritesUrl(this.baseUrl, "-1"),
        {},
        {
          action: "Failed to load favorite folders",
          requestKey: "favorites:folders",
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to load favorite folders", res);
      }
      let document = new HtmlDocument(res.body);
      let folders = new Map();
      folders.set("-1", "All");
      let sum = 0;
      for (let item of document.querySelectorAll("div.fp")) {
        if (item.text === "Show All Favorites") continue;
        let name = item.children[2]?.text ?? `Favorite ${folders.size}`;
        let length = item.children[0]?.text;
        if (length) {
          name += ` (${length})`;
          sum += +length;
        }
        folders.set((folders.size - 1).toString(), name);
      }
      folders.set("-1", `All (${sum})`);
      document.dispose();
      let favorited = [];
      if (comicId) {
        let comic = await this.comic.loadInfo(comicId);
        if (comic.isFavorite) {
          favorited.push(comic.folder);
        }
      }
      return {
        folders: folders,
        favorited: favorited,
      };
    },
    loadNext: async (next, folder) => {
      let url = EhentaiModules.buildFavoritesUrl(this.baseUrl, folder);
      return this.getGalleries(next ?? url, false);
    },
  });

  /// single comic related
  comic = EhentaiModules.features.createComicFeature(this, {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      if (this.galleryInfoCache.has(id)) {
        return this.galleryInfoCache.get(id);
      }
      try {
        await this.checkEHEvent();
      } catch (_) {}
      let res = await this.requestClient.get(
        id,
        {
          cookie: "nw=1",
        },
        {
          action: "Failed to load gallery details",
          requestKey: `gallery:${id}`,
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to load gallery details", res);
      }
      if (res.body.trim().length === 0) {
        throw this.formatResponseError("Failed to load gallery details", res);
      }
      let document = new HtmlDocument(res.body);

      if (this.isLogged && this.loadSetting("hvevent")) {
        const eventPane = document.getElementById("eventpane");
        if (eventPane != null) {
          const hvUrl = eventPane.querySelector("div > a")?.attributes["href"];
          if (hvUrl != null) {
            UI.showDialog("HentaiVerse", this.translate("hentaiverse"), [
              {
                text: this.translate("cancel"),
                callback: () => {},
              },
              {
                text: this.translate("fight"),
                callback: () => {
                  UI.launchUrl(hvUrl);
                },
              },
            ]);
          }
        }
      }

      const parsed = EhentaiModules.parsers.parseGalleryDetails(document);
      let comments = this.comic.parseComments(document);

      let comic = new ComicDetails({
        id: id,
        title: parsed.title,
        subTitle: parsed.subtitle,
        cover: parsed.coverPath,
        tags: parsed.tags,
        stars: parsed.stars,
        maxPage: parsed.maxPage,
        isFavorite: parsed.isFavorited,
        // uploader: uploader,
        uploadTime: parsed.time,
        url: id,
        comments: comments.comments,
      });

      comic.folder = parsed.folder;
      comic.token = parsed.token;
      this.apikey = parsed.apikey;
      if (this.apikey && this.apikey[0] === '"') {
        this.apikey = this.apikey.substring(1, this.apikey.length - 1);
      }
      this.uid = parsed.uid;

      document.dispose();
      this.galleryInfoCache.set(id, comic);
      return comic;
    },
    /**
     * [Optional] load thumbnails of a comic
     * @param id {string}
     * @param next {string?} - next page token, null for first page
     * @returns {Promise<{thumbnails: string[], next: string?, urls: string[]}>} - `next` is next page token, null for no more
     */
    loadThumbnails: async (id, next) => {
      const cacheKey = EhentaiModules.thumbnailCacheKey(id, next);
      if (this.thumbnailCache.has(cacheKey)) {
        return this.thumbnailCache.get(cacheKey);
      }
      let url = EhentaiModules.buildGalleryPageUrl(id, next);
      let res = await this.requestClient.get(
        url,
        {
          "cache-time": "long",
          "prevent-parallel": "true",
          cookie: "nw=1",
        },
        {
          action: "Failed to load thumbnails",
          requestKey: `thumbnails:${cacheKey}`,
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to load thumbnails", res);
      }
      let document = new HtmlDocument(res.body);
      try {
        const parsed = EhentaiModules.parsers.parseThumbnailPage(document, next);
        this.thumbnailCache.set(cacheKey, parsed);
        return parsed;
      } finally {
        document.dispose();
      }
    },

    /**
     * rate a comic
     * @param id
     * @param rating {number} - [0-10] app use 5 stars, 1 rating = 0.5 stars,
     * @returns {Promise<any>}
     */
    starRating: async (id, rating) => {
      const parsed = this.parseUrl(id);
      let res = await this.requestClient.post(
        this.apiUrl,
        {
          "Content-Type": "application/json",
        },
        EhentaiModules.buildRateGalleryPayload({
          galleryId: parsed.id,
          token: parsed.token,
          rating: rating,
          apikey: this.apikey,
          apiuid: this.uid,
        }),
        {
          action: "Failed to submit rating",
          requestKey: `rate:${id}:${rating}`,
          mutation: true,
          maxRetries: 0,
          classifyBody: false,
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to submit rating", res);
      }
      return "ok";
    },

    getKey: async (url) => {
      if (this.keyCache.has(url)) {
        return this.keyCache.get(url);
      }
      let res = await this.requestClient.get(
        url,
        {
          "cache-time": "long",
          "prevent-parallel": "true",
        },
        {
          action: "Failed to load dispatch key",
          requestKey: `key:${url}`,
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to load dispatch key", res);
      }
      let document = new HtmlDocument(res.body);
      try {
        const parsed = EhentaiModules.parsers.parseDispatchKey(document);
        this.keyCache.set(url, parsed);
        return parsed;
      } finally {
        document.dispose();
      }
    },
    /**
     * load images of a chapter
     * @param comicId {string}
     * @param epId {string?}
     * @returns {Promise<{images: string[]}>}
     */
    loadEp: async (comicId, epId) => {
      let comic = await this.comic.loadInfo(comicId);
      return {
        images: Array.from({ length: comic.maxPage }, (_, i) => i.toString()),
      };
    },
    /**
     * [Optional] provide configs for an image loading
     * @param image
     * @param comicId
     * @param epId
     * @param nl
     * @returns {{}}
     */
    onImageLoad: async (image, comicId, epId, nl) => {
      return this.imageSessions.load({ image, comicId, epId, nl, attempt: 0 });
    },
    /**
     * [Optional] provide configs for a thumbnail loading
     * @param url {string}
     * @returns {{}}
     */
    onThumbnailLoad: (url) => {
      url = EhentaiModules.normalizeThumbnailHost(url);
      return {
        url: url,
        headers: {
          referer: this.baseUrl,
        },
      };
    },
    parseComments: (document) => {
      return EhentaiModules.parsers.parseComments(document);
    },
    /**
     * [Optional] load comments
     * @param comicId {string}
     * @param subId {string?} - ComicDetails.subId
     * @param page {number}
     * @param replyTo {string?} - commentId to reply, not null when reply to a comment
     * @returns {Promise<{comments: Comment[], maxPage: number?}>}
     */
    loadComments: async (comicId, subId, page, replyTo) => {
      let res = await this.requestClient.get(
        EhentaiModules.buildCommentsUrl(comicId),
        {
          cookie: "nw=1",
        },
        {
          action: "Failed to load comments",
          requestKey: `comments:${comicId}`,
        },
      );
      if (res.status !== 200) {
        throw this.formatResponseError("Failed to load comments", res);
      }
      let document = new HtmlDocument(res.body);
      let result = this.comic.parseComments(document);
      document.dispose();
      return result;
    },
    /**
     * [Optional] send a comment, return any value to indicate success
     * @param comicId {string}
     * @param subId {string?} - ComicDetails.subId
     * @param content {string}
     * @param replyTo {string?} - commentId to reply, not null when reply to a comment
     * @returns {Promise<any>}
     */
    sendComment: async (comicId, subId, content, replyTo) => {
      let res = await this.requestClient.post(
        comicId,
        {
          "Content-Type": "application/x-www-form-urlencoded",
          referer: comicId,
        },
        EhentaiModules.buildCommentForm(content),
        {
          action: "Failed to submit comment",
          requestKey: `comment:${comicId}`,
          mutation: true,
          maxRetries: 0,
        },
      );
      if (res.status >= 400) {
        throw this.formatResponseError("Failed to submit comment", res);
      }
      let document = new HtmlDocument(res.body);
      if (document.querySelector("p.br")) {
        throw document.querySelector("p.br").text;
      }
      return "ok";
    },
    /**
     * [Optional] vote a comment
     * @param id {string} - comicId
     * @param subId {string?} - ComicDetails.subId
     * @param commentId {string} - commentId
     * @param isUp {boolean} - true for up, false for down
     * @param isCancel {boolean} - true for cancel, false for vote
     * @returns {Promise<number>} - new score
     */
    voteComment: async (id, subId, commentId, isUp, isCancel) => {
      if (this.apikey == null || this.uid == null) {
        throw "Login required";
      }

      const parsed = this.parseUrl(id);
      let res = await this.requestClient.post(
        this.apiUrl,
        {
          "Content-Type": "application/json",
        },
        EhentaiModules.buildVoteCommentPayload({
          galleryId: parsed.id,
          token: parsed.token,
          commentId,
          isUp,
          apikey: this.apikey,
          apiuid: this.uid,
        }),
        {
          action: "Failed to vote comment",
          requestKey: `vote:${id}:${commentId}:${isUp ? "up" : "down"}`,
          mutation: true,
          maxRetries: 0,
          classifyBody: false,
        },
      );

      let json = JSON.parse(res.body);

      if (json.error) {
        throw json.error;
      }

      return json.comment_score;
    },
    archive: {
      getArchives: async (cid) => {
        let comicInfo = await this.comic.loadInfo(cid);
        let urlParseResult = this.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = EhentaiModules.buildArchiverUrl(this.baseUrl, gid, token);
        let res = await this.requestClient.get(
          archiveUrl,
          {},
          {
            action: "Failed to load archive options",
            requestKey: `archive:options:${cid}`,
          },
        );
        if (res.status !== 200) {
          throw this.formatResponseError("Failed to load archive options", res);
        }
        let document = new HtmlDocument(res.body);
        try {
          return EhentaiModules.parsers.parseArchiveOptions(document, this.baseUrl);
        } finally {
          document.dispose();
        }
      },
      getDownloadUrl: async (cid, aid) => {
        let urlParseResult = this.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = EhentaiModules.buildArchiverUrl(this.baseUrl, gid, token);

        // Handle H@H Download options
        if (aid.startsWith("h@h_")) {
          let resolution = aid.substring(4); // Remove 'h@h_' prefix

          // For H@H downloads, send the command directly to archiver.php
          let hathRes = await this.requestClient.post(
            archiveUrl,
            {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            EhentaiModules.buildHathDownloadForm(resolution),
            {
              action: "Failed to send H@H download command",
              requestKey: `archive:hath:${cid}:${resolution}`,
              mutation: true,
              maxRetries: 0,
            },
          );

          if (hathRes.status !== 200) {
            throw this.formatResponseError(
              "Failed to send H@H download command",
              hathRes,
            );
          }

          // Parse response for any error messages
          let hathDocument = new HtmlDocument(hathRes.body);
          let errorElement = hathDocument.querySelector("p.br");

          if (errorElement) {
            let errorMessage = errorElement.text;
            hathDocument.dispose();

            if (errorMessage.includes("H@H client")) {
              throw "You need an H@H client associated with your account to use this feature";
            } else if (errorMessage.includes("offline")) {
              throw "Your H@H client appears to be offline. Please start it and try again";
            } else if (errorMessage.includes("resolution")) {
              throw "This gallery cannot be downloaded at the selected resolution";
            } else {
              throw errorMessage;
            }
          }

          // Check for success message or assume success if no error
          let successMessage = hathDocument.querySelector("p")?.text;
          hathDocument.dispose();

          let resolutionText =
            resolution === "org"
              ? "Original"
              : resolution === "800"
                ? "800x"
                : resolution === "1280"
                  ? "1280x"
                  : resolution === "1920"
                    ? "1920x"
                    : resolution === "2560"
                      ? "2560x"
                      : resolution;

          // For H@H downloads, return a special value to indicate remote download
          // This should close the window without creating a local download task
          // let message = successMessage && successMessage.includes("successfully")
          //     ? `H@H download command sent successfully (${resolutionText}). Check your H@H client.`
          //     : `H@H download command sent (${resolutionText}). Check your H@H client.`;

          // // Show success message to user
          // UI.showMessage(message);

          // Return empty string to avoid type error and prevent download task creation
          return "";
        }

        // Handle regular downloads (Original and Resample)
        let res = await this.requestClient.post(
          archiveUrl,
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          EhentaiModules.buildArchiveDownloadForm(aid),
          {
            action: "Failed to create archive download",
            requestKey: `archive:create:${cid}:${aid}`,
            mutation: true,
            maxRetries: 0,
          },
        );
        if (res.status !== 200) {
          throw this.formatResponseError(
            "Failed to create archive download",
            res,
          );
        }
        let document = new HtmlDocument(res.body);
        let link = document.querySelector("a")?.attributes["href"];
        if (!link) {
          throw "Failed to get download link";
        }
        let res2 = await this.requestClient.get(
          link,
          {
            http_client: "dart:io", // The server is uncomfortable with the default client
          },
          {
            action: "Failed to load archive download page",
            requestKey: `archive:page:${link}`,
          },
        );
        document.dispose();
        document = new HtmlDocument(res2.body);
        let link2 = document.querySelector("a")?.attributes["href"];
        document.dispose();
        let resultLink = EhentaiModules.buildArchiveResultUrl(link, link2);
        if (!resultLink) {
          throw "Failed to build final download URL";
        }
        let test = await this.requestClient.head(
          resultLink,
          {
            http_client: "dart:io",
          },
          {
            action: "Failed to validate archive link",
            requestKey: `archive:head:${resultLink}`,
            classifyBody: false,
          },
        );
        if (test.status === 410) {
          throw "IP quota exhausted.";
        }
        return resultLink;
      },
    },
    /**
     * [Optional] Handle tag click event
     * @param namespace {string}
     * @param tag {string}
     * @returns {{action: string, keyword: string, param: string?}}
     */
    onClickTag: (namespace, tag) => {
      if (namespace == "Category") {
        const categories = [
          "misc",
          "doujinshi",
          "manga",
          "artist cg",
          "game cg",
          "image set",
          "cosplay",
          "asian porn",
          "non-h",
          "western",
        ];
        return {
          page: "search",
          attributes: {
            keyword: "",
            options: [categories.indexOf(tag.toLowerCase()).toString(), "", ""],
          },
        };
      }
      if (tag.includes(" ")) {
        tag = `"${tag}"`;
      }
      return {
        // 'search' or 'category'
        action: "search",
        keyword: `${namespace}:${tag}`,
        // {string?} only for category action
        param: null,
      };
    },
    /**
     * [Optional] Handle links
     */
    link: {
      /**
       * set accepted domains
       */
      domains: ["e-hentai.org", "exhentai.org"],
      /**
       * parse url to comic id
       * @param url {string}
       * @returns {string | null}
       */
      linkToId: (url) => {
        return EhentaiModules.normalizeGalleryLink(this.baseUrl, url);
      },
    },
    enableTagsTranslate: true,
  });

  /*
    [Optional] settings related
    Use this.loadSetting to load setting
    ```
    let setting1Value = this.loadSetting('setting1')
    console.log(setting1Value)
    ```
     */
  settings = {
    domain: {
      // title
      title: "domain",
      // type: input, select, switch
      type: "select",
      // options
      options: [
        {
          value: "e-hentai.org",
        },
        {
          value: "exhentai.org",
        },
      ],
      default: "e-hentai.org",
    },
    ehevent: {
      title: "ehevent",
      type: "switch",
      default: false,
    },
    hvevent: {
      title: "hvevent",
      type: "switch",
      default: false,
    },
  };

  // [Optional] translations for the strings in this config
  translation = {
    zh_CN: {
      domain: "域名",
      ehevent: "触发黎明事件",
      hvevent: "提示HV遭遇战",
      hentaiverse: "你遇到了怪物！",
      fight: "战斗",
      cancel: "取消",
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
      "Min Stars": "最少星星",
      Language: "语言",
      "H@H Original": "H@H 原版",
      "H@H 800x": "H@H 800x",
      "H@H 1280x": "H@H 1280x",
      "H@H 1920x": "H@H 1920x",
      "H@H 2560x": "H@H 2560x",
      Original: "原版",
      Resample: "重采样",
    },
    zh_TW: {
      domain: "域名",
      ehevent: "觸發黎明事件",
      hvevent: "提示HV遭遇戰",
      hentaiverse: "你遇到了怪物！",
      fight: "戰鬥",
      cancel: "取消",
      language: "語言",
      artist: "畫師",
      male: "男性",
      female: "女性",
      mixed: "混合",
      other: "其他",
      parody: "原作",
      character: "角色",
      group: "團隊",
      cosplayer: "Coser",
      reclass: "重新分類",
      uploader: "上傳者",
      Languages: "語言",
      Artists: "畫師",
      Characters: "角色",
      Groups: "團隊",
      Tags: "標籤",
      Parodies: "原作",
      Categories: "分類",
      Category: "分類",
      "Min Stars": "最少星星",
      Language: "語言",
      "H@H Original": "H@H 原版",
      "H@H 800x": "H@H 800x",
      "H@H 1280x": "H@H 1280x",
      "H@H 1920x": "H@H 1920x",
      "H@H 2560x": "H@H 2560x",
      Original: "原版",
      Resample: "重採樣",
    },
    en_US: {
      domain: "Domain",
      ehevent: "Trigger Dawn Event",
      hvevent: "HV Encounter Alert",
      hentaiverse: "You have encountered a monster!",
      fight: "Fight",
      cancel: "Cancel",
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
      "Min Stars": "Min Stars",
      Language: "Language",
      "H@H Original": "H@H Original",
      "H@H 800x": "H@H 800x",
      "H@H 1280x": "H@H 1280x",
      "H@H 1920x": "H@H 1920x",
      "H@H 2560x": "H@H 2560x",
      Original: "Original",
      Resample: "Resample",
    },
  };
}
