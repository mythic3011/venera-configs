function createNhentaiSearchFeature(source) {
  return {
    load: async (keyword, options, page) => {
      const url = buildNhentaiSearchUrl(source, keyword, options, page);
      const res = await Network.get(url, {});
      if (res.status !== 200) {
        throw "Invalid Status Code: " + res.status;
      }
      return source.parseComicListFromApi(JSON.parse(res.body));
    },
    optionList: [
      {
        options: NHENTAI_SEARCH_SORT_OPTIONS.slice(),
        label: "sort",
      },
    ],
    enableTagsSuggestions: true,
  };
}
