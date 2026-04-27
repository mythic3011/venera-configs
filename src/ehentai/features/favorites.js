EhentaiModules.features.createFavoritesFeature = function createFavoritesFeature(source) {
  return {
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
      let parsed = source.parseUrl(comicId);
      let id = parsed.id;
      let token = parsed.token;
      const url = EhentaiModules.buildGalleryPopupUrl(source.baseUrl, id, token);
      if (isAdding) {
        let res = await source.requestClient.post(
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
        let res = await source.requestClient.post(
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
        await source.checkEHEvent();
      } catch (_) {}
      let res = await source.requestClient.get(
        EhentaiModules.buildFavoritesUrl(source.baseUrl, "-1"),
        {},
        {
          action: "Failed to load favorite folders",
          requestKey: "favorites:folders",
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to load favorite folders", res);
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
        let comic = await source.comic.loadInfo(comicId);
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
      let url = EhentaiModules.buildFavoritesUrl(source.baseUrl, folder);
      return source.getGalleries(next ?? url, false);
    },
  };
};
