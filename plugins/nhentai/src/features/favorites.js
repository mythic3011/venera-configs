function createNhentaiFavoritesFeature(source) {
  return {
    multiFolder: false,
    addOrDelFavorite: async (comicId, folderId, isAdding) => {
      const normalizedId = source.normalizeComicId(comicId);
      const v2Url = `${buildNhentaiApiGalleryUrl(source, normalizedId)}/favorite`;
      const headers = {
        "X-Requested-With": "XMLHttpRequest",
      };
      const res = isAdding
        ? await Network.post(v2Url, headers, null)
        : await source.deleteWithFallback(v2Url, headers);
      if (res.status !== 200) {
        const info = await source.comic.loadInfo(normalizedId);
        const legacyRes = await Network.post(
          buildNhentaiLegacyFavoriteUrl(source, normalizedId, isAdding),
          {
            "X-CSRFToken": info.csrfToken,
            Referer: buildNhentaiGalleryUrl(source, normalizedId),
            "X-Requested-With": "XMLHttpRequest",
          },
          null,
        );
        if (legacyRes.status === 200) {
          return true;
        }
        if (legacyRes.status === 401) {
          throw "Login expired";
        }
        throw "Invalid Status Code: " + legacyRes.status;
      }
      if (res.status === 200) {
        return true;
      }
      throw "Failed";
    },
    loadComics: async (page, folder) => {
      const apiRes = await Network.get(buildNhentaiApiFavoritesUrl(source, page), {});
      if (apiRes.status === 200) {
        return source.parseComicListFromApi(JSON.parse(apiRes.body));
      }

      const webRes = await Network.get(buildNhentaiWebFavoritesUrl(source, page), {});
      if (webRes.status !== 200) {
        if (apiRes.status === 401 || webRes.status === 401) {
          throw "Login expired";
        }
        throw "Invalid Status Code: " + webRes.status;
      }
      return await source.parseComicList(webRes.body);
    },
  };
}
