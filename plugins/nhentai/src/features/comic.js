function createNhentaiComicFeature(source) {
  return {
    onThumbnailLoad: (url) => {
      return source._fixAndWrap(url);
    },
    onImageLoad: (url) => {
      return source._fixAndWrap(url);
    },
    loadInfo: async (id) => {
      const normalizedId = source.normalizeComicId(id);

      const apiRes = await Network.get(
        `${buildNhentaiApiGalleryUrl(source, normalizedId)}?include=related,favorite`,
        {},
      );
      if (apiRes.status === 200) {
        const data = JSON.parse(apiRes.body);
        const comic = parseNhentaiApiDetails(source, normalizedId, data);
        let thumbnails = (data.pages || [])
          .map((page) => source.toAbsoluteMediaUrl(page.thumbnail, true))
          .filter(Boolean);
        if (thumbnails.length === 0) {
          const pagesRes = await Network.get(
            `${buildNhentaiApiGalleryUrl(source, normalizedId, "pages")}`,
            {},
          );
          if (pagesRes.status === 200) {
            const pagesData = JSON.parse(pagesRes.body);
            thumbnails = (pagesData.pages || [])
              .map((page) => source.toAbsoluteMediaUrl(page.thumbnail, true))
              .filter(Boolean);
          }
        }
        comic.thumbnails = thumbnails;
        return comic;
      }

      const res = await Network.get(buildNhentaiGalleryUrl(source, normalizedId), {});
      if (res.status !== 200) {
        throw "Invalid Status Code: " + res.status;
      }
      const document = new HtmlDocument(res.body);
      return parseNhentaiHtmlDetails(source, normalizedId, document);
    },
    loadEp: async (comicId, epId) => {
      const normalizedId = source.normalizeComicId(comicId);
      const apiRes = await Network.get(
        buildNhentaiApiGalleryUrl(source, normalizedId),
        {},
      );
      if (apiRes.status === 200) {
        const apiData = JSON.parse(apiRes.body);
        const images = buildNhentaiApiImages(source, apiData);
        if (images.length > 0) {
          return { images };
        }
      }

      const res = await Network.get(buildNhentaiGalleryPageUrl(source, normalizedId, 1), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://nhentai.net/",
        },
      });
      if (res.status !== 200) {
        throw "Invalid Status Code: " + res.status;
      }
      const document = new HtmlDocument(res.body);
      const payload = parseNhentaiGalleryScriptPayload(document);
      if (payload.mediaId && payload.pages.length > 0) {
        return {
          images: payload.pages.map((page, index) => {
            return buildNhentaiGalleryImageUrl(
              source,
              payload.mediaId,
              index,
              getNhentaiMediaExtensionFromToken(page.t),
            );
          }),
        };
      }

      const images = extractNhentaiInlineImageUrls(source, document);
      if (images.length > 0) {
        return { images };
      }

      throw "Failed to load images for this gallery";
    },
    loadComments: async (comicId, subId, page, replyTo) => {
      const normalizedId = source.normalizeComicId(comicId);
      const res = await Network.get(buildNhentaiCommentsUrl(source, normalizedId), {});
      if (res.status !== 200) {
        throw "Invalid Status Code: " + res.status;
      }
      return {
        comments: parseNhentaiComments(source, JSON.parse(res.body)),
        maxPage: 1,
      };
    },
    sendComment: async (comicId, subId, content, replyTo) => {
      throw "Not implemented";
    },
    idMatch: NHENTAI_COMIC_ID_REGEX,
    onClickTag: (namespace, tag) => {
      return {
        action: "category",
        keyword: tag,
        param: namespace,
      };
    },
    link: {
      domains: ["nhentai.net"],
      linkToId: (url) => {
        return parseNhentaiLinkToId(url);
      },
    },
    enableTagsTranslate: true,
  };
}
