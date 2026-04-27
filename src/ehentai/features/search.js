EhentaiModules.features.createSearchFeature = function createSearchFeature(source) {
  return {
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
      let url = EhentaiModules.buildSearchUrl(source.baseUrl, keyword, fcats, stars);
      return source.getGalleries(next ?? url, false);
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
  };
};
