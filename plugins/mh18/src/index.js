/** @type {import('./_venera_.js')} */
class MH18 extends ComicSource {
  // Note: The fields which are marked as [Optional] should be removed if not used

  // name of the source
  name = "18漫画";

  // unique id of the source
  key = "mh18";

  version = "1.0.0";

  minAppVersion = "1.4.0";

  // update url
  url = resolvePluginUpdateUrl("mh18.js");

  settings = {
    domains: {
      title: "域名",
      type: "input",
      default: "18mh.org",
    },
  };

  get baseUrl() {
    return buildMhLikeBaseUrl(this.loadSetting("domains"));
  }

  get headers() {
    return buildMhLikeHeaders(this.baseUrl);
  }

  get chapterRequests() {
    return createMhLikeChapterRequestUrlBuilders({
      getBaseUrl: () => this.baseUrl,
    });
  }

  parseComics(doc) {
    return parseMhLikeComicCards(doc);
  }

  // explore page list
  explore = [
    createMhLikeExplorePageFeature({
      title: this.name,
      context: "mh18 home",
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
        categories: ["全部", "韓漫", "真人寫真", "日漫", "AI寫真", "熱門漫畫"],
        itemType: "category",
        categoryParams: [
          "/manga",
          "/manga-genre/hanman",
          "/manga-genre/zhenrenxiezhen",
          "/manga-genre/riman",
          "/manga-genre/aixiezhen",
          "/manga-genre/hots",
        ],
      },
      {
        name: "标签",
        type: "fixed",
        categories: [
          "多人",
          "慾望",
          "正妹",
          "同居",
          "女學生",
          "劇情",
          "偷情",
          "校园",
          "逆襲",
          "办公室",
          "誘惑",
          "反转",
          "熟女",
          "人妻",
          "初戀",
          "少妇",
          "刺激",
          "女大学生",
          "治疗",
          "超能力",
          "浪漫校园",
          "戏剧",
          "学姐",
          "大学生",
          "泳衣",
          "暧昧",
          "写真",
          "女神",
          "大尺度",
          "纯情警察",
        ],
        itemType: "category",
        categoryParams: [
          "/manga-tag/duoren",
          "/manga-tag/yuwang",
          "/manga-tag/zhengmei",
          "/manga-tag/tongju",
          "/manga-tag/nxuesheng",
          "/manga-tag/juqing",
          "/manga-tag/touqing",
          "/manga-tag/xiaoyuan",
          "/manga-tag/nixi",
          "/manga-tag/bangongshi",
          "/manga-tag/youhuo",
          "/manga-tag/fanzhuan",
          "/manga-tag/shun",
          "/manga-tag/renqi",
          "/manga-tag/chulian",
          "/manga-tag/shaofu",
          "/manga-tag/ciji",
          "/manga-tag/ndaxuesheng",
          "/manga-tag/zhiliao",
          "/manga-tag/chaonengli",
          "/manga-tag/langmanxiaoyuan",
          "/manga-tag/xiju",
          "/manga-tag/xuejie",
          "/manga-tag/daxuesheng",
          "/manga-tag/yongyi",
          "/manga-tag/aimei",
          "/manga-tag/xiezhen",
          "/manga-tag/nshen",
          "/manga-tag/dachidu",
          "/manga-tag/chunqingjingcha",
        ],
      },
    ],
    // enable ranking page
    enableRankingPage: false,
  };

  /// category comic loading related
  categoryComics = {
    load: createMhLikeCategoryLoaderFeature({
      context: "mh18 category",
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
      context: "mh18 search",
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
      if (!id.startsWith("http")) {
        id = this.baseUrl + id;
      }
      const info = await loadMhLikeBaseComicInfoFeature({
        context: "mh18 detail",
        detailUrl: id,
        headers: this.headers,
      });
      const mangaId = info.mangaId;
      const chapterRes = await Network.get(
        this.chapterRequests.buildChapterListRequestUrl({ mangaId }),
        this.headers,
      );
      const chapterDoc = new HtmlDocument(chapterRes.body);
      const chapters = {};
      for (let ch of chapterDoc.querySelectorAll(".chapteritem")) {
        const info = ch.querySelector("a");
        chapters[
          `${info.attributes["data-ms"]}@${info.attributes["data-cs"]}`
        ] = ch.querySelector(".chaptertitle").text;
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
        this.chapterRequests.buildChapterContentRequestUrl({
          mangaId: ids[0],
          chapterId: ids[1],
        }),
        this.headers,
      );
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }
      const document = new HtmlDocument(res.body);
      const images = [];
      for (let i of document
        .querySelector("#chapcontent")
        .querySelectorAll("img")) {
        images.push(
          i.attributes["data-src"]
            ? i.attributes["data-src"]
            : i.attributes["src"],
        );
      }
      return { images };
    },

    // enable tags translate
    enableTagsTranslate: false,
  };
}
