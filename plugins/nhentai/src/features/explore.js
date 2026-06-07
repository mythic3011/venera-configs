function createNhentaiExploreFeature(source) {
  return [
    {
      title: "nhentai",
      type: "mixed",
      load: async (page) => {
        let url = source.baseUrl;
        if (page && page !== 1) {
          url = `${url}?page=${page}`;
        }
        const res = await Network.get(url, {});
        if (res.status !== 200) {
          throw "Invalid Status Code: " + res.status;
        }
        const doc = new HtmlDocument(res.body);
        const data = [];
        if (url === source.baseUrl) {
          data.push({
            title: "Popular",
            comics: doc
              .querySelectorAll(
                "div.container.index-container.index-popular > div.gallery",
              )
              .map((element) => source.parseComic(element)),
          });
        }
        let latest = doc
          .querySelectorAll("div.container.index-container > div.gallery")
          .map((element) => source.parseComic(element));
        if (url === source.baseUrl) {
          latest = latest.slice(data[0].comics.length);
        }
        data.push(latest);
        return {
          data,
          maxPage: 20000,
        };
      },
    },
  ];
}
