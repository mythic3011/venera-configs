function createNhentaiCategoryConfig() {
  return {
    title: "nhentai",
    parts: [
      {
        name: "Language",
        type: "fixed",
        categories: NHENTAI_LANGUAGE_CATEGORIES.slice(),
        itemType: "category",
        groupParam: "language",
      },
      {
        name: "Tags",
        type: "random",
        randomNumber: 20,
        categories: NHENTAI_TAG_VALUES.slice(),
        itemType: "search",
      },
    ],
    enableRankingPage: false,
  };
}

function createNhentaiCategoryComicsFeature(source) {
  return {
    load: async (category, param, options, page) => {
      const url = buildNhentaiCategoryUrl(source, category, param, options, page);
      const res = await Network.get(url, {});
      return await source.parseComicList(res.body, "category");
    },
    optionList: [
      {
        options: NHENTAI_CATEGORY_SORT_OPTIONS.slice(),
      },
    ],
  };
}
