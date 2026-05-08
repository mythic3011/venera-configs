class CopyManga extends ComicSource {
  name = "拷贝漫画";

  key = "copy_manga";

  version = "1.4.1";

  minAppVersion = "1.6.0";

  url = resolvePluginUpdateUrl("copy_manga.js");

  async getReqID() {
    if (this.copyRegion === "0") {
      return "";
    }
    const reqIdUrl =
      "https://marketing.aiacgn.com/api/v2/adopr/query3/?format=json&ident=200100001";
    let reqId = "";
    try {
      const response = await Network.get(reqIdUrl, this.headers);

      if (response.status === 200) {
        const data = JSON.parse(response.body);
        reqId = data.results.request_id;
      }
    } catch (e) {}
    return reqId;
  }

  get headers() {
    const token = this.loadData("token");
    const secret = "M2FmMDg1OTAzMTEwMzJlZmUwNjYwNTUwYTA1NjNhNTM=";
    const requestSigning = buildCopyLikeRequestSigningMeta(Date.now());
    const sig = buildCopyLikeHmacSignature(secret, requestSigning.ts);

    return {
      "User-Agent": `COPY/3.0.6`,
      source: "copyApp",
      deviceinfo: this.deviceinfo,
      dt: requestSigning.dt,
      platform: "3",
      referer: `com.copymanga.app-3.0.6`,
      version: "3.0.6",
      device: this.device,
      pseudoid: this.pseudoid,
      Accept: "application/json",
      region: this.copyRegion,
      authorization: buildCopyLikeTokenHeader(token),
      umstring: "b4c89ca4104ea9a97750314d791520ac",
      "x-auth-timestamp": requestSigning.ts,
      "x-auth-signature": sig,
    };
  }

  // static defaultCopyVersion = "3.0.6"

  // static defaultCopyPlatform = "2"

  static defaultCopyRegion = "0";

  static defaultImageQuality = "1500";

  static defaultApiUrl = "api.copy2000.online";

  static searchApi = "/api/kb/web/searchb/comics";

  static homeSections = [
    { title: "推荐", path: ["results", "recComics", "list"] },
    { title: "热门", path: ["results", "hotComics"] },
    { title: "最新", path: ["results", "newComics"] },
    { title: "完结", path: ["results", "finishComics", "list"] },
    { title: "今日排行", path: ["results", "rankDayComics", "list"] },
    { title: "本周排行", path: ["results", "rankWeekComics", "list"] },
    { title: "本月排行", path: ["results", "rankMonthComics", "list"] },
  ];

  get deviceinfo() {
    let info = this.loadData("_deviceinfo");
    if (!info) {
      info = CopyManga.generateDeviceInfo();
      this.saveData("_deviceinfo", info);
    }
    return info;
  }

  get device() {
    let dev = this.loadData("_device");
    if (!dev) {
      dev = CopyManga.generateDevice();
      this.saveData("_device", dev);
    }
    return dev;
  }

  get pseudoid() {
    let pid = this.loadData("_pseudoid");
    if (!pid) {
      pid = CopyManga.generatePseudoid();
      this.saveData("_pseudoid", pid);
    }
    return pid;
  }

  // get copyVersion() {
  //     return this.loadSetting('version')
  // }

  // get copyPlatform()
  // return this.loadSetting('platform')
  // }

  static generateDeviceInfo() {
    return `${randomInt(1000000, 9999999)}V-${randomInt(1000, 9999)}`;
  }

  static generateDevice() {
    function randCharA() {
      return String.fromCharCode(65 + randomInt(0, 25));
    }
    function randDigit() {
      return String.fromCharCode(48 + randomInt(0, 9));
    }
    return (
      randCharA() +
      randCharA() +
      randDigit() +
      randCharA() +
      "." +
      randDigit() +
      randDigit() +
      randDigit() +
      randDigit() +
      randDigit() +
      randDigit() +
      "." +
      randDigit() +
      randDigit() +
      randDigit()
    );
  }

  static generatePseudoid() {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pseudoid = "";
    for (let i = 0; i < 16; i++) {
      pseudoid += chars.charAt(randomInt(0, chars.length - 1));
    }
    return pseudoid;
  }

  get apiUrl() {
    return buildCopyLikeApiUrl(
      this.loadSetting("base_url"),
      CopyManga.defaultApiUrl,
    );
  }

  get copyRegion() {
    return this.loadSetting("region") || this.defaultCopyRegion;
  }

  get imageQuality() {
    return this.loadSetting("image_quality") || this.defaultImageQuality;
  }

  init() {
    // 用于储存 { 作者名 : 英文参数 }
    this.author_path_word_dict = {};
    this.refreshSearchApi();
    this.refreshAppApi();
  }

  get baseComicParser() {
    return createCopyLikeComicParser({});
  }

  get datedComicParser() {
    return createCopyLikeComicParser({
      includeUpdateDescription: true,
    });
  }

  get rankedComicParser() {
    return createCopyLikeComicParser({
      includeUpdateDescription: true,
      includeRankingDescription: true,
    });
  }

  get searchRequestUrlBuilders() {
    return createCopyLikeSearchRequestUrlBuilders({
      getApiUrl: () => this.apiUrl,
      authorLimit: 30,
      authorOrdering: "-datetime_updated",
      keywordLimit: 30,
      queryTypeOptionIndex: 0,
      queryTypeDefault: "",
      getKeywordEndpointPath: () =>
        this.loadSetting("search_api") === "webAPI"
          ? CopyManga.searchApi
          : COPY_LIKE_ENDPOINT_PATHS.SEARCH_COMIC,
    });
  }

  /// account
  /// set this to null to desable account feature
  account = {
    /// login func
    login: async (account, pwd) => {
      let salt = randomInt(1000, 9999);
      let base64 = Convert.encodeBase64(Convert.encodeUtf8(`${pwd}-${salt}`));
      let res = await Network.post(
        buildCopyLikeEndpointUrl(this.apiUrl, COPY_LIKE_ENDPOINT_PATHS.LOGIN),
        withCopyLikeFormHeaders(this.headers),
        `username=${account}&password=${base64}\n&salt=${salt}&authorization=Token+`,
      );
      if (res.status === 200) {
        let data = JSON.parse(res.body);
        let token = data.results.token;
        this.saveData("token", token);
        return "ok";
      } else {
        throw `Invalid Status Code ${res.status}`;
      }
    },
    // callback when user log out
    logout: () => {
      this.deleteData("token");
    },
    registerWebsite: null,
  };

  /// explore pages
  explore = [
    createCopyLikeExploreSectionsFeature({
      title: "拷贝漫画",
      sections: CopyManga.homeSections,
      parseComic: this.baseComicParser,
      context: "copy_manga home",
      getApiUrl: () => this.apiUrl,
      getHeaders: () => this.headers,
    }),
  ];

  static category_param_dict = {
    全部: "",
    愛情: "aiqing",
    歡樂向: "huanlexiang",
    冒險: "maoxian",
    奇幻: "qihuan",
    百合: "baihe",
    校园: "xiaoyuan",
    科幻: "kehuan",
    東方: "dongfang",
    耽美: "danmei",
    生活: "shenghuo",
    格鬥: "gedou",
    轻小说: "qingxiaoshuo",
    悬疑: "xuanyi",
    其他: "qita",
    神鬼: "shengui",
    职场: "zhichang",
    TL: "teenslove",
    萌系: "mengxi",
    治愈: "zhiyu",
    長條: "changtiao",
    四格: "sige",
    节操: "jiecao",
    舰娘: "jianniang",
    竞技: "jingji",
    搞笑: "gaoxiao",
    伪娘: "weiniang",
    热血: "rexue",
    励志: "lizhi",
    性转换: "xingzhuanhuan",
    彩色: "COLOR",
    後宮: "hougong",
    美食: "meishi",
    侦探: "zhentan",
    AA: "aa",
    音乐舞蹈: "yinyuewudao",
    魔幻: "mohuan",
    战争: "zhanzheng",
    历史: "lishi",
    异世界: "yishijie",
    惊悚: "jingsong",
    机战: "jizhan",
    都市: "dushi",
    穿越: "chuanyue",
    恐怖: "kongbu",
    C100: "comiket100",
    重生: "chongsheng",
    C99: "comiket99",
    C101: "comiket101",
    C97: "comiket97",
    C96: "comiket96",
    生存: "shengcun",
    宅系: "zhaixi",
    武侠: "wuxia",
    C98: "C98",
    C95: "comiket95",
    FATE: "fate",
    转生: "zhuansheng",
    無修正: "Uncensored",
    仙侠: "xianxia",
    LoveLive: "loveLive",
  };

  category = {
    title: "拷贝漫画",
    parts: [
      {
        name: "拷贝漫画",
        type: "fixed",
        categories: ["排行"],
        categoryParams: ["ranking"],
        itemType: "category",
      },
      {
        name: "主题",
        type: "fixed",
        categories: Object.keys(CopyManga.category_param_dict),
        categoryParams: Object.values(CopyManga.category_param_dict),
        itemType: "category",
      },
    ],
  };

  categoryComics = {
    load: createCopyLikeCategoryLoaderFeature({
      context: "copy_manga category",
      parseComic: this.rankedComicParser,
      getHeaders: () => this.headers,
      buildRequestUrl: createCopyLikeCategoryRequestUrlBuilder({
        getApiUrl: () => this.apiUrl,
        isRankingCategory: (category, param) => category === "排行" || param === "ranking",
        rankingAudienceOptionIndex: 0,
        rankingDateOptionIndex: 1,
        categoryParamMap: CopyManga.category_param_dict,
        themedTopOptionIndex: 0,
        themedOrderingOptionIndex: 1,
      }),
    }),
    optionList: [
      {
        options: [
          "-全部",
          "japan-日漫",
          "korea-韩漫",
          "west-美漫",
          "finish-已完结",
        ],
        notShowWhen: null,
        showWhen: Object.keys(CopyManga.category_param_dict),
      },
      {
        options: [
          "*datetime_updated-时间倒序",
          "datetime_updated-时间正序",
          "*popular-热度倒序",
          "popular-热度正序",
        ],
        notShowWhen: null,
        showWhen: Object.keys(CopyManga.category_param_dict),
      },
      {
        options: ["male-男频", "female-女频"],
        notShowWhen: null,
        showWhen: ["排行"],
      },
      {
        options: [
          "day-上升最快",
          "week-最近7天",
          "month-最近30天",
          "total-總榜單",
        ],
        notShowWhen: null,
        showWhen: ["排行"],
      },
    ],
  };

  search = {
    load: createCopyLikeSearchLoaderFeature({
      context: "copy_manga search",
      parseComic: this.datedComicParser,
      getHeaders: () => this.headers,
      resolveAuthorPathWord: (authorName) => this.author_path_word_dict[authorName],
      buildAuthorRequestUrl: (params) =>
        this.searchRequestUrlBuilders.buildAuthorRequestUrl(params),
      buildKeywordRequestUrl: (params) =>
        this.searchRequestUrlBuilders.buildKeywordRequestUrl(params),
    }),
    optionList: [
      {
        type: "select",
        options: ["-全部", "name-名称", "author-作者", "local-汉化组"],
        label: "搜索选项",
      },
    ],
  };

  favorites = {
    multiFolder: false,
    addOrDelFavorite: async (comicId, folderId, isAdding) => {
      let is_collect = isAdding ? 1 : 0;
      let token = this.loadData("token");
      let reqId = await this.getReqID();
      let comicData = await Network.get(
        buildCopyLikeComicDetailUrl({
          apiUrl: this.apiUrl,
          id: comicId,
          inMainland: true,
          requestId: reqId,
          platform: 3,
        }),
        this.headers,
      );
      if (comicData.status !== 200) {
        throw `Invalid status code: ${comicData.status}`;
      }
      let comic_id = JSON.parse(comicData.body).results.comic.uuid;
      let res = await Network.post(
        buildCopyLikeEndpointUrl(
          this.apiUrl,
          COPY_LIKE_ENDPOINT_PATHS.FAVORITE_COMIC_ACTION,
        ),
        withCopyLikeFormHeaders(this.headers),
        `comic_id=${comic_id}&is_collect=${is_collect}&authorization=Token+${token}`,
      );
      if (res.status === 401) {
        throw `Login expired`;
      }
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }
      return "ok";
    },
    loadComics: async (page, folder) => {
      let ordering =
        this.loadSetting("favorites_ordering") || "-datetime_updated";
      var res = await Network.get(
        buildCopyLikeFavoriteComicsUrl({
          apiUrl: this.apiUrl,
          page,
          limit: 30,
          freeType: 1,
          ordering,
        }),
        this.headers,
      );

      if (res.status === 401) {
        throw `Login expired`;
      }

      assertRuntimeStatus(res, 200, "copy_manga favorites");
      let data = parseRuntimeJsonBody(res, "copy_manga favorites");
      const list = readCopyLikePath(data, ["results", "list"], []);
      const total = readCopyLikePath(data, ["results", "total"], 0);
      return {
        comics: Array.isArray(list) ? list.map(this.datedComicParser) : [],
        maxPage: computeCopyLikeMaxPage(total, 21),
      };
    },
  };

  comic = {
    loadInfo: async (id) => {
      let getChapters = async (id, groups) => {
        let fetchSingle = async (id, path) => {
          let reqId = await this.getReqID();
          let res = await Network.get(
            buildCopyLikeGroupChaptersUrl({
              apiUrl: this.apiUrl,
              id,
              groupPath: path,
              limit: 100,
              offset: 0,
              inMainland: true,
              requestId: reqId,
            }),
            this.headers,
          );
          if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`;
          }
          let data = JSON.parse(res.body);
          let eps = new Map();
          data.results.list.forEach((e) => {
            let title = e.name;
            let id = e.uuid;
            eps.set(id, title);
          });
          let maxChapter = data.results.total;
          if (maxChapter > 100) {
            let offset = 100;
            while (offset < maxChapter) {
              res = await Network.get(
                buildCopyLikeGroupChaptersUrl({
                  apiUrl: this.apiUrl,
                  id,
                  groupPath: path,
                  limit: 100,
                  offset,
                }),
                this.headers,
              );
              if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`;
              }
              data = JSON.parse(res.body);
              data.results.list.forEach((e) => {
                let title = e.name;
                let id = e.uuid;
                eps.set(id, title);
              });
              offset += 100;
            }
          }
          return eps;
        };
        let keys = Object.keys(groups);
        let result = {};
        let futures = [];
        for (let group of keys) {
          let path = groups[group]["path_word"];
          futures.push(
            (async () => {
              result[group] = await fetchSingle(id, path);
            })(),
          );
        }
        await Promise.all(futures);
        if (this.isAppVersionAfter("1.3.0")) {
          // 支持多分组
          let sortedResult = new Map();
          for (let key of keys) {
            let name = groups[key]["name"];
            sortedResult.set(name, result[key]);
          }
          return sortedResult;
        } else {
          // 合并所有分组
          let merged = new Map();
          for (let key of keys) {
            for (let [k, v] of result[key]) {
              merged.set(k, v);
            }
          }
          return merged;
        }
      };

      let getFavoriteStatus = async (id) => {
        let res = await Network.get(
          buildCopyLikeComicQueryUrl({
            apiUrl: this.apiUrl,
            id,
          }),
          this.headers,
        );
        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }
        return JSON.parse(res.body).results.collect != null;
      };
      let reqId = await this.getReqID();
      let results = await Promise.all([
        Network.get(
          buildCopyLikeComicDetailUrl({
            apiUrl: this.apiUrl,
            id,
            inMainland: true,
            requestId: reqId,
            platform: 3,
          }),
          this.headers,
        ),
        getFavoriteStatus.bind(this)(id),
      ]);

      if (results[0].status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let data = JSON.parse(results[0].body).results;
      let comicData = data.comic;

      let title = comicData.name;
      let cover = comicData.cover;
      // author_path_word_dict长度限制为最大100
      if (Object.keys(this.author_path_word_dict).length > 100) {
        this.author_path_word_dict = {};
      }
      // 储存author对应的path_word
      comicData.author.forEach(
        (e) => (this.author_path_word_dict[e.name] = e.path_word),
      );
      let description = comicData.brief;
      let chapters = await getChapters(id, data.groups);
      const mapDetailTags = createCopyLikeDetailTagMapper({});

      return {
        title: title,
        cover: cover,
        description: description,
        tags: mapDetailTags(comicData),
        chapters: chapters,
        isFavorite: results[1],
        subId: comicData.uuid,
      };
    },
    loadEp: async (comicId, epId) => {
      let attempt = 0;
      const maxAttempts = 5;
      let res;
      let data;

      while (attempt < maxAttempts) {
        try {
          let reqId = await this.getReqID();
          res = await Network.get(
            buildCopyLikeChapterUrl({
              apiUrl: this.apiUrl,
              comicId,
              chapterId: epId,
              chapterEndpoint: "chapter2",
              inMainland: true,
              requestId: reqId,
            }),
            {
              ...this.headers,
            },
          );

          if (res.status === 210) {
            // 210 indicates too frequent access, extract wait time
            let waitTime = 40000; // Default wait time 40s
            try {
              let responseBody = JSON.parse(res.body);
              if (
                responseBody.message &&
                responseBody.message.includes("Expected available in")
              ) {
                let match = responseBody.message.match(/(\d+)\s*seconds/);
                if (match && match[1]) {
                  waitTime = parseInt(match[1]) * 1000;
                }
              }
            } catch (e) {
              console.log(
                "Unable to parse wait time, using default wait time 40s",
              );
            }
            console.log(
              `Chapter${epId} access too frequent, waiting ${waitTime / 1000}s`,
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            throw "Retry";
          }

          if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`;
          }

          data = JSON.parse(res.body);
          // console.log(data.results.chapter);
          // Handle image link sorting
          let imagesUrls = data.results.chapter.contents.map((e) => e.url);
          let orders = data.results.chapter.words;

          // Replace origin images urls to selected quality images urls
          let hdImagesUrls = imagesUrls.map((url) =>
            url.replace(
              /([./])c\d+x\.[a-zA-Z]+$/,
              `$1c${this.imageQuality}x.webp`,
            ),
          );

          let images = new Array(hdImagesUrls.length).fill(""); // Initialize an array with the same length as imagesUrls

          // Arrange images according to orders
          for (let i = 0; i < hdImagesUrls.length; i++) {
            images[orders[i]] = hdImagesUrls[i];
          }

          return {
            images: images,
          };
        } catch (error) {
          if (error !== "Retry") {
            throw error;
          }
          attempt++;
          if (attempt >= maxAttempts) {
            throw error;
          }
        }
      }
    },
    loadComments: async (comicId, subId, page, replyTo) => {
      const commentQuery = [
        ["comic_id", subId],
        ["limit", 20],
        ["offset", (page - 1) * 20],
      ];
      if (replyTo) {
        commentQuery.push(["reply_id", replyTo]);
        commentQuery.push(["_update", true]);
      }
      const url = buildCopyLikeUrlWithQuery(
        this.apiUrl,
        COPY_LIKE_ENDPOINT_PATHS.COMMENTS,
        commentQuery,
      );
      let res = await Network.get(url, this.headers);

      if (res.status !== 200) {
        if (res.status === 210) {
          throw "210：注冊用戶一天可以發5條評論";
        }
        throw `Invalid status code: ${res.status}`;
      }

      let data = JSON.parse(res.body);

      let total = data.results.total;

      return {
        comments: data.results.list.map((e) => {
          return {
            userName: replyTo
              ? `${e.user_name}  👉  ${e.parent_user_name}`
              : e.user_name, // 拷贝的回复页并没有楼中楼（所有回复都在一个response中），但会显示谁回复了谁。所以加上👉显示。
            avatar: e.user_avatar,
            content: e.comment,
            time: e.create_at,
            replyCount: e.count,
            id: e.id,
          };
        }),
        maxPage: (total - (total % 20)) / 20 + 1,
      };
    },
    sendComment: async (comicId, subId, content, replyTo) => {
      let token = this.loadData("token");
      if (!token) {
        throw "未登录";
      }
      if (!replyTo) {
        replyTo = "";
      }
      let res = await Network.post(
        buildCopyLikeEndpointUrl(
          this.apiUrl,
          COPY_LIKE_ENDPOINT_PATHS.COMMENT_ACTION,
        ),
        withCopyLikeFormHeaders(this.headers),
        `comic_id=${subId}&comment=${encodeURIComponent(content)}&reply_id=${replyTo}`,
      );

      if (res.status === 401) {
        error(`Login expired`);
        return;
      }

      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      } else {
        return "ok";
      }
    },
    loadChapterComments: async (comicId, epId, page, replyTo) => {
      const url = buildCopyLikeUrlWithQuery(
        this.apiUrl,
        COPY_LIKE_ENDPOINT_PATHS.ROASTS,
        [
          ["chapter_id", epId],
          ["limit", 20],
          ["offset", (page - 1) * 20],
        ],
      );
      let res = await Network.get(url, this.headers);

      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let data = JSON.parse(res.body);

      let total = data.results.total;

      return {
        comments: data.results.list.map((e) => {
          return {
            userName: e.user_name,
            avatar: e.user_avatar,
            content: e.comment,
            time: e.create_at,
            replyCount: null,
            id: null,
          };
        }),
        maxPage: (total - (total % 20)) / 20 + 1,
      };
    },
    sendChapterComment: async (comicId, epId, content, replyTo) => {
      let token = this.loadData("token");
      if (!token) {
        throw "未登录";
      }
      let res = await Network.post(
        buildCopyLikeEndpointUrl(
          this.apiUrl,
          COPY_LIKE_ENDPOINT_PATHS.ROAST_ACTION,
        ),
        withCopyLikeFormHeaders(this.headers),
        `chapter_id=${epId}&roast=${encodeURIComponent(content)}`,
      );

      if (res.status === 401) {
        throw `Login expired`;
      }

      if (res.status !== 200) {
        if (res.status === 210) {
          throw `210:评论过于频繁或评论内容过短过长`;
        }
        throw `Invalid status code: ${res.status}`;
      } else {
        return "ok";
      }
    },
    onClickTag: (namespace, tag) => {
      const resolveTagAction = createCopyLikeTagClickActionHandler({});
      return resolveTagAction(namespace, tag);
    },
  };

  settings = {
    favorites_ordering: {
      title: "收藏排序方式",
      type: "select",
      options: [
        {
          value: "-datetime_updated",
          text: "更新时间",
        },
        {
          value: "-datetime_modifier",
          text: "收藏时间",
        },
        {
          value: "-datetime_browse",
          text: "阅读时间",
        },
      ],
      default: "-datetime_updated",
    },
    region: {
      title: "CDN线路",
      type: "select",
      options: [
        {
          value: "1",
          text: "大陆线路",
        },
        {
          value: "0",
          text: "海外线路",
        },
      ],
      default: CopyManga.defaultCopyRegion,
    },
    image_quality: {
      title: "图片质量",
      type: "select",
      options: [
        {
          value: "800",
          text: "低 (800)",
        },
        {
          value: "1200",
          text: "中 (1200)",
        },
        {
          value: "1500",
          text: "高 (1500)",
        },
      ],
      default: CopyManga.defaultImageQuality,
    },
    search_api: {
      title: "搜索方式",
      type: "select",
      options: [
        {
          value: "baseAPI",
          text: "基础API",
        },
        {
          value: "webAPI",
          text: "网页端API",
        },
      ],
      default: "baseAPI",
    },
    base_url: {
      title: "API地址",
      type: "input",
      validator:
        "^(?!:\\/\\/)(?=.{1,253})([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$",
      default: CopyManga.defaultApiUrl,
    },
    clear_device_info: {
      title: "清除设备信息",
      type: "callback",
      buttonText: "点击清除设备信息",
      callback: () => {
        this.deleteData("_deviceinfo");
        this.deleteData("_device");
        this.deleteData("_pseudoid");
        this.refreshAppApi();
      },
    },
    // version: {
    //     title: "拷贝版本（重启APP生效）",
    //     type: "input",
    //     default: CopyManga.defaultCopyVersion,
    // },
    // platform: {
    //     title: "平台代号（重启APP生效）",
    //     type: "input",
    //     validator: '^\\d+(?:\\.\\d+)*$',
    //     default: CopyManga.defaultCopyPlatform,
    // },
  };

  /**
   * Check if the current app version is after the target version
   * @param target {string} target version
   * @returns {boolean} true if the current app version is after the target version
   */
  isAppVersionAfter(target) {
    let current = APP.version;
    let targetArr = target.split(".");
    let currentArr = current.split(".");
    for (let i = 0; i < 3; i++) {
      if (parseInt(currentArr[i]) < parseInt(targetArr[i])) {
        return false;
      }
    }
    return true;
  }

  async refreshSearchApi() {
    let url = "https://www.copy20.com/search";
    let res = await fetch(url);
    let searchApi = "";
    if (res.status === 200) {
      let text = await res.text();
      let match = text.match(/const countApi = "([^"]+)"/);
      if (match && match[1]) {
        CopyManga.searchApi = match[1];
      }
    }
  }

  async refreshAppApi() {
    const url = "https://api.copy-manga.com/api/v3/system/network2?platform=3";
    const res = await fetch(url, { headers: this.headers });
    if (res.status === 200) {
      let data = await res.json();
      this.settings.base_url = data.results.api[0][0];
    }
  }
}
