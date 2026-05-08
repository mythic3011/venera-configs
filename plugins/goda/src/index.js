/** @type {import('./_venera_.js')} */
class Goda extends ComicSource {
  // Note: The fields which are marked as [Optional] should be removed if not used

  // name of the source
  name = "GoDa漫画";

  // unique id of the source
  key = "goda";

  version = "1.0.0";

  minAppVersion = "1.4.0";

  // update url
  url = resolvePluginUpdateUrl("goda.js");

  settings = {
    domains: {
      title: "域名",
      type: "input",
      default: "godamh.com",
    },
    api: {
      title: "API域名",
      type: "input",
      default: "api-get-v3.mgsearcher.com",
    },
    image: {
      title: "图片域名",
      type: "input",
      default: "t40-1-4.g-mh.online",
    },
  };

  get baseUrl() {
    return buildMhLikeBaseUrl(this.loadSetting("domains"));
  }

  get apiUrl() {
    return buildMhLikeApiBaseUrl(this.loadSetting("api"), "/api");
  }

  get imageUrl() {
    return `https://${this.loadSetting("image")}`;
  }

  get headers() {
    return buildMhLikeHeaders(this.baseUrl);
  }

  get chapterRequests() {
    return createMhLikeChapterRequestUrlBuilders({
      getBaseUrl: () => this.apiUrl,
    });
  }

  parseComics(doc) {
    return parseMhLikeComicCards(doc);
  }

  // explore page list
  explore = [
    createMhLikeExplorePageFeature({
      title: this.name,
      context: "goda home",
      getBaseUrl: () => this.baseUrl,
      getHeaders: () => this.headers,
      parseComics: (root) => this.parseComics(root),
    }),
  ];

  // categories
  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: this.name,
    parts: [
      {
        name: "类型",
        type: "fixed",
        categories: [
          "全部",
          "韩漫",
          "热门漫画",
          "国漫",
          "其他",
          "日漫",
          "欧美",
        ],
        itemType: "category",
        categoryParams: [
          "/manga",
          "/manga-genre/kr",
          "/manga-genre/hots",
          "/manga-genre/cn",
          "/manga-genre/qita",
          "/manga-genre/jp",
          "/manga-genre/ou-mei",
        ],
      },
      {
        name: "标签",
        type: "fixed",
        categories: [
          "复仇",
          "古风",
          "奇幻",
          "逆袭",
          "异能",
          "宅向",
          "穿越",
          "热血",
          "纯爱",
          "系统",
          "重生",
          "冒险",
          "灵异",
          "大女主",
          "剧情",
          "恋爱",
          "玄幻",
          "女神",
          "科幻",
          "魔幻",
          "推理",
          "猎奇",
          "治愈",
          "都市",
          "异形",
          "青春",
          "末日",
          "悬疑",
          "修仙",
          "战斗",
        ],
        itemType: "category",
        categoryParams: [
          "/manga-tag/fuchou",
          "/manga-tag/gufeng",
          "/manga-tag/qihuan",
          "/manga-tag/nixi",
          "/manga-tag/yineng",
          "/manga-tag/zhaixiang",
          "/manga-tag/chuanyue",
          "/manga-tag/rexue",
          "/manga-tag/chunai",
          "/manga-tag/xitong",
          "/manga-tag/zhongsheng",
          "/manga-tag/maoxian",
          "/manga-tag/lingyi",
          "/manga-tag/danvzhu",
          "/manga-tag/juqing",
          "/manga-tag/lianai",
          "/manga-tag/xuanhuan",
          "/manga-tag/nvshen",
          "/manga-tag/kehuan",
          "/manga-tag/mohuan",
          "/manga-tag/tuili",
          "/manga-tag/lieqi",
          "/manga-tag/zhiyu",
          "/manga-tag/doushi",
          "/manga-tag/yixing",
          "/manga-tag/qingchun",
          "/manga-tag/mori",
          "/manga-tag/xuanyi",
          "/manga-tag/xiuxian",
          "/manga-tag/zhandou",
        ],
      },
    ],
    // enable ranking page
    enableRankingPage: false,
  };

  /// category comic loading related
  categoryComics = {
    load: createMhLikeCategoryLoaderFeature({
      context: "goda category",
      getBaseUrl: () => this.baseUrl,
      getHeaders: () => this.headers,
      parseComics: (doc) => this.parseComics(doc),
      buildRequestUrl: createMhLikeCategoryRequestUrlBuilder({
        getBaseUrl: () => this.baseUrl,
      }),
    }),
  };

  /// search related
  search = {
    load: createMhLikeSearchLoaderFeature({
      context: "goda search",
      getBaseUrl: () => this.baseUrl,
      getHeaders: () => this.headers,
      parseComics: (doc) => this.parseComics(doc),
      buildRequestUrl: createMhLikeSearchRequestUrlBuilder({
        getBaseUrl: () => this.baseUrl,
      }),
    }),
    // enable tags suggestions
    enableTagsSuggestions: false,
  };

  /// single comic related
  comic = {
    onThumbnailLoad: (url) => {
      return {
        headers: this.headers,
      };
    },
    loadInfo: async (id) => {
      const info = await loadMhLikeBaseComicInfoFeature({
        context: "goda detail",
        detailUrl: this.baseUrl + id,
        headers: this.headers,
      });
      const mangaId = info.mangaId;
      const jsonRes = await Network.get(
        this.chapterRequests.buildChapterListRequestUrl({ mangaId }),
        this.headers,
      );
      const jsonData = JSON.parse(jsonRes.body);
      const chapters = {};
      for (let ch of jsonData["data"]["chapters"]) {
        chapters[`${mangaId}@${ch["id"]}`] = ch["attributes"]["title"];
      }
      return new ComicDetails({
        title: info.title,
        cover: info.cover,
        description: info.description,
        tags: info.tags,
        chapters: chapters,
        recommend: info.recommend,
      });
    },

    loadEp: async (comicId, epId) => {
      const ids = epId.split("@");
      const res = await Network.get(
        this.chapterRequests.buildChapterInfoRequestUrl({
          mangaId: ids[0],
          chapterId: ids[1],
        }),
        this.headers,
      );
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }
      const jsonData = JSON.parse(res.body);
      const images = [];
      for (let i of jsonData["data"]["info"]["images"]["images"]) {
        images.push(this.imageUrl + i["url"]);
      }
      return { images };
    },

    // enable tags translate
    enableTagsTranslate: false,
  };
}
