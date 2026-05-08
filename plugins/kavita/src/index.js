/** @type {import('./_venera_.js')} */
const refreshKavitaReferenceDataFeature = createSelfHostedReferenceCacheFeature({
  metaTimestampKey: "kavita_meta_ts",
  ttlMs: 5 * 60 * 1000,
  resetData: {
    kavita_libraries: [],
    kavita_genres: [],
    kavita_authors: [],
  },
  hasToken: (source) => Boolean(source.loadData("token")),
  loadPayload: async (source) => {
    const [libraries, genres, authors] = await Promise.all([
      source.getJson(KAVITA_ROUTES.librariesPath()),
      source.getJson(KAVITA_ROUTES.genresPath()),
      source.getJson(KAVITA_ROUTES.peopleByRolePath(), { role: 3 }),
    ]);
    return { libraries, genres, authors };
  },
  savePayload: (source, payload) => {
    const libraries = Array.isArray(payload?.libraries)
      ? payload.libraries.filter((library) => library && library.id)
      : [];
    source.saveData(
      "kavita_libraries",
      libraries.map((item) => ({ id: item.id, name: item.name })),
    );
    source.saveData(
      "kavita_genres",
      Array.isArray(payload?.genres) ? payload.genres : [],
    );
    source.saveData(
      "kavita_authors",
      Array.isArray(payload?.authors)
        ? payload.authors.map((item) => ({ id: item.id, name: item.name }))
        : [],
    );
  },
  shouldRethrow: (error) => String(error) === "Login expired",
});

const initKavitaFeature = createSafeInitFeature((source, force) =>
  refreshKavitaReferenceDataFeature(source, force),
);
const KAVITA_ROUTES = createKavitaRouteHelpers();

class Kavita extends ComicSource {
  name = "Kavita";

  key = "kavita";

  version = "1.0.0";

  minAppVersion = "1.4.0";

  url = resolvePluginUpdateUrl("kavita.js");

  settings = {
    base_url: {
      title: "服务器地址",
      type: "input",
      default: "https://demo.kavita.org",
      validator: "^(https?:\\/\\/).+$",
    },
  };

  get baseUrl() {
    return resolveSelfHostedBaseUrl(
      this.loadSetting("base_url"),
      this.settings.base_url.default,
      { defaultScheme: "https" },
    );
  }

  get headers() {
    return withBearer({ Accept: "application/json" }, this.loadData("token"));
  }

  async init() {
    await initKavitaFeature(this);
  }

  FilterComparison = {
    Equals: 0,
    GreaterThan: 1,
    GreaterThanEqual: 2,
    LessThan: 3,
    LessThanEqual: 4,
    Contains: 5,
    MustContains: 6,
    Matches: 7,
    NotContains: 8,
    NotEqual: 9,
    BeginsWith: 10,
    EndsWith: 11,
    IsBefore: 12,
    IsAfter: 13,
    IsInLast: 14,
    IsNotInLast: 15,
    IsEmpty: 16,
  };

  FilterField = {
    Summary: 0,
    SeriesName: 1,
    PublicationStatus: 2,
    Languages: 3,
    AgeRating: 4,
    UserRating: 5,
    Tags: 6,
    CollectionTags: 7,
    Translators: 8,
    Publisher: 10,
    Editor: 11,
    CoverArtist: 12,
    Letterer: 13,
    Colorist: 14,
    Inker: 15,
    Penciller: 16,
    Writers: 17,
    Genres: 18,
    Libraries: 19,
    ReadProgress: 20,
    Formats: 21,
    ReleaseYear: 22,
    ReadTime: 23,
    Path: 24,
    FilePath: 25,
    WantToRead: 26,
    ReadingDate: 27,
    AverageRating: 28,
    Imprint: 29,
    Team: 30,
    Location: 31,
    ReadLast: 32,
    FileSize: 33,
  };

  // [Optional] account related
  account = {
    /**
     * [Optional] login with account and password, return any value to indicate success
     * @param account {string}
     * @param pwd {string}
     * @returns {Promise<any>}
     */
    login: async (account, pwd) => {
      if (!account || !pwd) {
        throw "账号或密码不能为空";
      }
      const res = await Network.post(
        this.buildUrl(KAVITA_ROUTES.loginPath()),
        this.headers,
        {
          username: account,
          password: pwd,
        },
      );
      if (res.status === 401) {
        throw "账号或密码错误";
      }
      if (res.status !== 200) {
        throw `登录失败: ${res.status}`;
      }
      if (res.status === 200) {
        const payload = parseSelfHostedJsonBody(res.body) || {};
        this.saveData("token", payload.token);
        this.saveData("apiKey", payload.apiKey);
        await this.refreshReferenceData(true);
        return account;
      }
    },

    /**
     * logout function, clear account related data
     */
    logout: () => {
      this.deleteData("token");
      this.deleteData("apiKey");
      this.deleteData("kavita_libraries");
      this.deleteData("kavita_genres");
      this.deleteData("kavita_authors");
      this.deleteData("kavita_meta_ts");
    },

    // {string?} - register url
    registerWebsite: null,
  };

  // explore page list
  explore = [
    {
      title: "Kavita",
      type: "singlePageWithMultiPart",
      load: async () => {
        await this.refreshReferenceData(false);
        const feeds = {};
        const data = {
          id: 0,
          name: "",
          statements: [],
          combination: 0,
          sortOptions: {
            sortField: 4,
            isAscending: false,
          },
          limitTo: 0,
        };
        const latest = await this.fetchSeriesList(
          KAVITA_ROUTES.seriesV2Path(),
          { PageNumber: 0, PageSize: 12 },
          data,
        );
        if (latest.comics.length) feeds["最新上架"] = latest.comics;
        return feeds;
      },
    },
  ];

  // categories
  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: "Kavita",
    parts: [
      createStaticCategoryPart("常用", "全部", "全部", "all"),
      createStoredCategoryPart({
        partName: "书库",
        storageKey: "kavita_libraries",
        getSource: () => this,
        getLabel: (library) => library?.name,
        getCategory: (library) => library?.name,
        getParam: (library) =>
          library && library.id != null ? `library:${library.id}` : null,
      }),
      createStoredCategoryPart({
        partName: "作者",
        storageKey: "kavita_authors",
        getSource: () => this,
        getLabel: (author) => author?.name,
        getCategory: (author) => author?.name,
        getParam: (author) =>
          author && author.id != null ? `author:${author.id}` : null,
      }),
      createStoredCategoryPart({
        partName: "题材",
        storageKey: "kavita_genres",
        getSource: () => this,
        getLabel: (genre) => genre?.title,
        getCategory: (genre) => genre?.title,
        getParam: (genre) =>
          genre && genre.id != null ? `genre:${genre.id}` : null,
      }),
    ],
    // enable ranking page
    enableRankingPage: false,
  };

  /// category comic loading related
  categoryComics = {
    /**
     * load comics of a category
     * @param category {string} - category name
     * @param param {string?} - category param
     * @param options {string[]} - options from optionList
     * @param page {number} - page number
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (category, param, options, page) => {
      await this.refreshReferenceData(false);
      const pageSize = 30;
      const data = {
        statements: [],
        combination: 0,
        sortOptions: {
          sortField: 4,
          isAscending: false,
        },
        limitTo: 0,
      };

      /*
       * sortField : 排序枚举类型：
       * 1 按系列名称排序,2 创建时间,3 最后修改时间,4 最近添加章节时间,5 阅读时长,6 发布年份,7 阅读进度,8 平均评分,9 随机,10 用户评分
       */

      if (options && options.length) {
        const [sortField, isAscending] = options[0].split(",");
        data.sortOptions.sortField = parseInt(sortField);
        data.sortOptions.isAscending = isAscending === "true";
      }

      const params = param.split(":");
      if (params[0] === "library" && params[1]) {
        const libraryId = params[1];
        data.statements.push({
          comparison: this.FilterComparison.Equals,
          field: this.FilterField.Libraries,
          value: libraryId,
        });
      }

      if (params[0] === "genre" && params[1]) {
        const genreId = params[1];
        data.statements.push({
          comparison: this.FilterComparison.Equals,
          field: this.FilterField.Genres,
          value: genreId,
        });
      }

      if (params[0] === "author" && params[1]) {
        const authorId = params[1];
        data.statements.push({
          comparison: this.FilterComparison.Equals,
          field: this.FilterField.Writers,
          value: authorId,
        });
      }

      const allowedCategories = ["all", "library", "genre", "author"];
      if (allowedCategories.includes(params[0])) {
        const { comics, totalPages } = await this.fetchSeriesList(
          KAVITA_ROUTES.seriesV2Path(),
          { PageNumber: page, PageSize: pageSize },
          data,
        );
        return {
          comics: comics,
          maxPage: totalPages,
        };
      }
    },
    optionList: [
      {
        options: [
          "4,false-最近添加",
          "1,true-名称[升序]",
          "1,false-名称[降序]",
          "2,false-创建时间[降序]",
          "2,true-创建时间[升序]",
          "3,false-修改时间[降序]",
          "3,true-修改时间[升序]",
        ],
        notShowWhen: null,
        showWhen: null,
      },
    ],
  };

  /// search related
  search = {
    /**
     * load search result
     * @param keyword {string}
     * @param options {(string | null)[]} - options from optionList
     * @param page {number}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (keyword, options, page) => {
      const pageSize = 30;
      const data = {
        statements: [],
        combination: 0,
        sortOptions: {
          sortField: 4,
          isAscending: false,
        },
        limitTo: 0,
      };

      if (options && options.length) {
        const type = options[0];
        if (type === "FilePath") {
          data.statements.push({
            comparison: this.FilterComparison.Matches,
            field: this.FilterField.FilePath,
            value: keyword,
          });
        } else if (type === "SeriesName") {
          data.statements.push({
            comparison: this.FilterComparison.Matches,
            field: this.FilterField.SeriesName,
            value: keyword,
          });
        } else {
          // all
          data.statements.push(
            {
              comparison: this.FilterComparison.Matches,
              field: this.FilterField.SeriesName,
              value: keyword,
            },
            {
              comparison: this.FilterComparison.Matches,
              field: this.FilterField.Summary,
              value: keyword,
            },
            {
              comparison: this.FilterComparison.Matches,
              field: this.FilterField.FilePath,
              value: keyword,
            },
          );
        }
      }

      const { comics, totalPages } = await this.fetchSeriesList(
        KAVITA_ROUTES.seriesV2Path(),
        { PageNumber: page, PageSize: pageSize },
        data,
      );
      return {
        comics: comics,
        maxPage: totalPages,
      };

      /*
            const data = await this.getJson(KAVITA_ROUTES.searchPath(), { queryString: keyword, includeChapterAndFiles: false })
            const series = Array.isArray(data?.series) ? data.series : []
            const token = this.loadData('token')
            const comics = series.map((item) => this.parseSeries(item, token)).filter(Boolean)
            return { comics: comics, maxPage: 1 }
            */
    },

    // provide options for search
    optionList: [
      {
        type: "select",
        options: ["All-全部", "SeriesName-名称", "FilePath-文件名"],
        label: "搜索选项",
      },
    ],

    enableTagsSuggestions: false,
    // [Optional] handle tag suggestion click
    onTagSuggestionSelected: (namespace, tag) => {
      // return the text to insert into search box
      return `${namespace}:${tag}`;
    },
  };

  /// single comic related
  comic = {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      const data = await this.getJson(KAVITA_ROUTES.seriesDetailsPath(id));
      const metadata = await this.getJson(KAVITA_ROUTES.seriesMetadataPath(), {
        seriesId: id,
      });
      const volume = await this.getJson(KAVITA_ROUTES.seriesVolumesPath(), {
        seriesId: id,
      });
      const chapters = volume
        .flatMap((item) => item.chapters || [])
        .reduce((map, { id, titleName, files }) => {
          let title = titleName;
          if (!title) {
            title = files[0].filePath.split("/").pop();
          }
          map[id] = title;
          return map;
        }, {});
      const authors = metadata.writers.map((item) => item.name);
      const apiKey = this.loadData("apiKey");
      const tagSections = {};
      const isReadable = this.isReadable(data.format);
      console.log(data);
      if (authors.length) tagSections["作者"] = authors;
      if (metadata.genres.length)
        tagSections["类型"] = metadata.genres.map((item) => item.title);
      if (metadata.tags.length)
        tagSections["标签"] = metadata.tags.map((item) => item.title);
      if (!isReadable) tagSections["提示"] = ["该系列包含的项目暂不支持阅读"];
      const info = new ComicDetails({
        title: data.name,
        subtitle: authors.join(", "),
        cover: this.buildUrl(KAVITA_ROUTES.seriesCoverPath(), {
          seriesId: id,
          apiKey: apiKey,
        }),
        description: metadata.summary || "暂无简介",
        tags: tagSections,
        chapters,
        updateTime: data.lastChapterAdded,
        uploadTime: data.created,
        url: this.buildUrl(KAVITA_ROUTES.seriesDetailsPath(id)),
      });
      return info;
    },

    /**
     * rate a comic
     * @param id
     * @param rating {number} - [0-10] app use 5 stars, 1 rating = 0.5 stars,
     * @returns {Promise<any>} - return any value to indicate success
     */
    starRating: async (id, rating) => {},

    /**
     * load images of a chapter
     * @param comicId {string}
     * @param epId {string?}
     * @returns {Promise<{images: string[]}>}
     */
    loadEp: async (comicId, epId) => {
      const data = await this.getJson(KAVITA_ROUTES.chapterPath(), {
        chapterId: epId,
      });
      const page = data.pages;
      const isReadable = this.isReadable(data.format);
      if (!isReadable) {
        throw "该项目暂不支持阅读";
      }
      const apiKey = this.loadData("apiKey");
      const extractPdf = data.format === 4;
      return {
        images: Array.from({ length: page }, (_, i) =>
          this.buildUrl(KAVITA_ROUTES.readerImagePath(), {
            chapterId: epId,
            page: i,
            apiKey: apiKey,
            extractPdf,
          }),
        ),
      };
    },

    /**
     * [Optional] Handle tag click event
     * @param namespace {string}
     * @param tag {string}
     * @returns {{action: string, keyword: string, param: string?}}
     */
    onClickTag: (namespace, tag) => {
      if (namespace === "类型") {
        const genres = this.loadData("kavita_genres");
        const genreId = genres.find((item) => item.title === tag)?.id;
        if (genreId) {
          return {
            action: "category",
            keyword: tag,
            param: `genre:${genreId}`,
          };
        }
      }
      if (namespace === "作者") {
        const authors = this.loadData("kavita_authors");
        const authorId = authors.find((item) => item.name === tag)?.id;
        if (authorId) {
          return {
            action: "category",
            keyword: tag,
            param: `author:${authorId}`,
          };
        }
      }
      UI.showMessage(`不支持的标签类型: ${namespace}:${tag}`);
    },

    // enable tags translate
    enableTagsTranslate: false,
  };

  async refreshReferenceData(force) {
    await refreshKavitaReferenceDataFeature(this, force);
  }

  async fetchSeriesList(path, query, data) {
    const { content, page } = await this.postJson(path, query, data);
    const series = Array.isArray(content) ? content : [];
    const apiKey = this.loadData("apiKey");
    const comics = series
      .map((item) => this.parseSeries(item, apiKey))
      .filter(Boolean);
    return {
      comics,
      totalPages: page.totalPages,
    };
  }

  parseSeries(series, apiKey) {
    if (!series) return null;
    const id = series.id || series.seriesId;
    const title = series.name;
    return new Comic({
      id: `${id}`,
      title,
      cover: this.buildUrl(KAVITA_ROUTES.seriesCoverPath(), {
        seriesId: id,
        apiKey: apiKey,
      }),
    });
  }

  isReadable(format) {
    const readableFormats = [0, 1, 4]; // 0 图片, 1 档案, 2 Epub, 4 PDF
    return readableFormats.includes(format);
  }

  async getJson(path, query) {
    return await getSelfHostedJson(this, path, query);
  }

  async postJson(path, query, data) {
    const response = await postSelfHostedJson(this, path, query, data);
    return {
      content: response.body,
      page: parseSelfHostedJsonBody(response.headers.pagination),
    };
  }

  ensureOk(res) {
    ensureSelfHostedHttpOk(res);
  }

  buildUrl(path, query) {
    return buildSelfHostedUrlFromSource(this, path, query);
  }

  buildQuery(query) {
    return buildSelfHostedQueryFromSource(query);
  }

  formatDate(value) {
    if (!value) return null;
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().split("T")[0];
    } catch (_) {
      return null;
    }
  }
}
