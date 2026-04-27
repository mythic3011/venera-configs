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
  search = EhentaiModules.features.createSearchFeature(this);

  // favorite related
  favorites = EhentaiModules.features.createFavoritesFeature(this);

  /// single comic related
  comic = EhentaiModules.features.createComicFeature(this);

  /*
    [Optional] settings related
    Use this.loadSetting to load setting
    ```
    let setting1Value = this.loadSetting('setting1')
    console.log(setting1Value)
    ```
     */
  settings = EhentaiModules.settings;

  // [Optional] translations for the strings in this config
  translation = EhentaiModules.i18n;
}
