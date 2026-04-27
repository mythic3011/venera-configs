EhentaiModules.features.createComicFeature = function createComicFeature(source) {
  return {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      if (source.galleryInfoCache.has(id)) {
        return source.galleryInfoCache.get(id);
      }
      try {
        await source.checkEHEvent();
      } catch (_) {}
      let res = await source.requestClient.get(
        id,
        {
          cookie: "nw=1",
        },
        {
          action: "Failed to load gallery details",
          requestKey: `gallery:${id}`,
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to load gallery details", res);
      }
      if (res.body.trim().length === 0) {
        throw source.formatResponseError("Failed to load gallery details", res);
      }
      let document = new HtmlDocument(res.body);

      if (source.isLogged && source.loadSetting("hvevent")) {
        const eventPane = document.getElementById("eventpane");
        if (eventPane != null) {
          const hvUrl = eventPane.querySelector("div > a")?.attributes["href"];
          if (hvUrl != null) {
            UI.showDialog("HentaiVerse", source.translate("hentaiverse"), [
              {
                text: source.translate("cancel"),
                callback: () => {},
              },
              {
                text: source.translate("fight"),
                callback: () => {
                  UI.launchUrl(hvUrl);
                },
              },
            ]);
          }
        }
      }

      const parsed = EhentaiModules.parsers.parseGalleryDetails(document);
      let comments = source.comic.parseComments(document);

      let comic = new ComicDetails({
        id: id,
        title: parsed.title,
        subTitle: parsed.subtitle,
        cover: parsed.coverPath,
        tags: parsed.tags,
        stars: parsed.stars,
        maxPage: parsed.maxPage,
        isFavorite: parsed.isFavorited,
        // uploader: uploader,
        uploadTime: parsed.time,
        url: id,
        comments: comments.comments,
      });

      comic.folder = parsed.folder;
      comic.token = parsed.token;
      source.apikey = parsed.apikey;
      if (source.apikey && source.apikey[0] === '"') {
        source.apikey = source.apikey.substring(1, source.apikey.length - 1);
      }
      source.uid = parsed.uid;

      document.dispose();
      source.galleryInfoCache.set(id, comic);
      return comic;
    },
    /**
     * [Optional] load thumbnails of a comic
     * @param id {string}
     * @param next {string?} - next page token, null for first page
     * @returns {Promise<{thumbnails: string[], next: string?, urls: string[]}>} - `next` is next page token, null for no more
     */
    loadThumbnails: async (id, next) => {
      const cacheKey = EhentaiModules.thumbnailCacheKey(id, next);
      if (source.thumbnailCache.has(cacheKey)) {
        return source.thumbnailCache.get(cacheKey);
      }
      let url = EhentaiModules.buildGalleryPageUrl(id, next);
      let res = await source.requestClient.get(
        url,
        {
          "cache-time": "long",
          "prevent-parallel": "true",
          cookie: "nw=1",
        },
        {
          action: "Failed to load thumbnails",
          requestKey: `thumbnails:${cacheKey}`,
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to load thumbnails", res);
      }
      let document = new HtmlDocument(res.body);
      try {
        const parsed = EhentaiModules.parsers.parseThumbnailPage(document, next);
        source.thumbnailCache.set(cacheKey, parsed);
        return parsed;
      } finally {
        document.dispose();
      }
    },

    /**
     * rate a comic
     * @param id
     * @param rating {number} - [0-10] app use 5 stars, 1 rating = 0.5 stars,
     * @returns {Promise<any>}
     */
    starRating: async (id, rating) => {
      const parsed = source.parseUrl(id);
      let res = await source.requestClient.post(
        source.apiUrl,
        {
          "Content-Type": "application/json",
        },
        EhentaiModules.buildRateGalleryPayload({
          galleryId: parsed.id,
          token: parsed.token,
          rating: rating,
          apikey: source.apikey,
          apiuid: source.uid,
        }),
        {
          action: "Failed to submit rating",
          requestKey: `rate:${id}:${rating}`,
          mutation: true,
          maxRetries: 0,
          classifyBody: false,
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to submit rating", res);
      }
      return "ok";
    },

    getKey: async (url) => {
      if (source.keyCache.has(url)) {
        return source.keyCache.get(url);
      }
      let res = await source.requestClient.get(
        url,
        {
          "cache-time": "long",
          "prevent-parallel": "true",
        },
        {
          action: "Failed to load dispatch key",
          requestKey: `key:${url}`,
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to load dispatch key", res);
      }
      let document = new HtmlDocument(res.body);
      try {
        const parsed = EhentaiModules.parsers.parseDispatchKey(document);
        source.keyCache.set(url, parsed);
        return parsed;
      } finally {
        document.dispose();
      }
    },
    /**
     * load images of a chapter
     * @param comicId {string}
     * @param epId {string?}
     * @returns {Promise<{images: string[]}>}
     */
    loadEp: async (comicId, epId) => {
      let comic = await source.comic.loadInfo(comicId);
      return {
        images: Array.from({ length: comic.maxPage }, (_, i) => i.toString()),
      };
    },
    /**
     * [Optional] provide configs for an image loading
     * @param image
     * @param comicId
     * @param epId
     * @param nl
     * @returns {{}}
     */
    onImageLoad: async (image, comicId, epId, nl) => {
      return source.imageSessions.load({ image, comicId, epId, nl, attempt: 0 });
    },
    /**
     * [Optional] provide configs for a thumbnail loading
     * @param url {string}
     * @returns {{}}
     */
    onThumbnailLoad: (url) => {
      url = EhentaiModules.normalizeThumbnailHost(url);
      return {
        url: url,
        headers: {
          referer: source.baseUrl,
        },
      };
    },
    parseComments: (document) => {
      return EhentaiModules.parsers.parseComments(document);
    },
    /**
     * [Optional] load comments
     * @param comicId {string}
     * @param subId {string?} - ComicDetails.subId
     * @param page {number}
     * @param replyTo {string?} - commentId to reply, not null when reply to a comment
     * @returns {Promise<{comments: Comment[], maxPage: number?}>}
     */
    loadComments: async (comicId, subId, page, replyTo) => {
      let res = await source.requestClient.get(
        EhentaiModules.buildCommentsUrl(comicId),
        {
          cookie: "nw=1",
        },
        {
          action: "Failed to load comments",
          requestKey: `comments:${comicId}`,
        },
      );
      if (res.status !== 200) {
        throw source.formatResponseError("Failed to load comments", res);
      }
      let document = new HtmlDocument(res.body);
      let result = source.comic.parseComments(document);
      document.dispose();
      return result;
    },
    /**
     * [Optional] send a comment, return any value to indicate success
     * @param comicId {string}
     * @param subId {string?} - ComicDetails.subId
     * @param content {string}
     * @param replyTo {string?} - commentId to reply, not null when reply to a comment
     * @returns {Promise<any>}
     */
    sendComment: async (comicId, subId, content, replyTo) => {
      let res = await source.requestClient.post(
        comicId,
        {
          "Content-Type": "application/x-www-form-urlencoded",
          referer: comicId,
        },
        EhentaiModules.buildCommentForm(content),
        {
          action: "Failed to submit comment",
          requestKey: `comment:${comicId}`,
          mutation: true,
          maxRetries: 0,
        },
      );
      if (res.status >= 400) {
        throw source.formatResponseError("Failed to submit comment", res);
      }
      let document = new HtmlDocument(res.body);
      if (document.querySelector("p.br")) {
        throw document.querySelector("p.br").text;
      }
      return "ok";
    },
    /**
     * [Optional] vote a comment
     * @param id {string} - comicId
     * @param subId {string?} - ComicDetails.subId
     * @param commentId {string} - commentId
     * @param isUp {boolean} - true for up, false for down
     * @param isCancel {boolean} - true for cancel, false for vote
     * @returns {Promise<number>} - new score
     */
    voteComment: async (id, subId, commentId, isUp, isCancel) => {
      if (source.apikey == null || source.uid == null) {
        throw "Login required";
      }

      const parsed = source.parseUrl(id);
      let res = await source.requestClient.post(
        source.apiUrl,
        {
          "Content-Type": "application/json",
        },
        EhentaiModules.buildVoteCommentPayload({
          galleryId: parsed.id,
          token: parsed.token,
          commentId,
          isUp,
          apikey: source.apikey,
          apiuid: source.uid,
        }),
        {
          action: "Failed to vote comment",
          requestKey: `vote:${id}:${commentId}:${isUp ? "up" : "down"}`,
          mutation: true,
          maxRetries: 0,
          classifyBody: false,
        },
      );

      let json = JSON.parse(res.body);

      if (json.error) {
        throw json.error;
      }

      return json.comment_score;
    },
    archive: {
      getArchives: async (cid) => {
        let comicInfo = await source.comic.loadInfo(cid);
        let urlParseResult = source.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = EhentaiModules.buildArchiverUrl(source.baseUrl, gid, token);
        let res = await source.requestClient.get(
          archiveUrl,
          {},
          {
            action: "Failed to load archive options",
            requestKey: `archive:options:${cid}`,
          },
        );
        if (res.status !== 200) {
          throw source.formatResponseError("Failed to load archive options", res);
        }
        let document = new HtmlDocument(res.body);
        try {
          return EhentaiModules.parsers.parseArchiveOptions(document, source.baseUrl);
        } finally {
          document.dispose();
        }
      },
      getDownloadUrl: async (cid, aid) => {
        let urlParseResult = source.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = EhentaiModules.buildArchiverUrl(source.baseUrl, gid, token);

        // Handle H@H Download options
        if (aid.startsWith("h@h_")) {
          let resolution = aid.substring(4); // Remove 'h@h_' prefix

          // For H@H downloads, send the command directly to archiver.php
          let hathRes = await source.requestClient.post(
            archiveUrl,
            {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            EhentaiModules.buildHathDownloadForm(resolution),
            {
              action: "Failed to send H@H download command",
              requestKey: `archive:hath:${cid}:${resolution}`,
              mutation: true,
              maxRetries: 0,
            },
          );

          if (hathRes.status !== 200) {
            throw source.formatResponseError(
              "Failed to send H@H download command",
              hathRes,
            );
          }

          // Parse response for any error messages
          let hathDocument = new HtmlDocument(hathRes.body);
          let errorElement = hathDocument.querySelector("p.br");

          if (errorElement) {
            let errorMessage = errorElement.text;
            hathDocument.dispose();

            if (errorMessage.includes("H@H client")) {
              throw "You need an H@H client associated with your account to use this feature";
            } else if (errorMessage.includes("offline")) {
              throw "Your H@H client appears to be offline. Please start it and try again";
            } else if (errorMessage.includes("resolution")) {
              throw "This gallery cannot be downloaded at the selected resolution";
            } else {
              throw errorMessage;
            }
          }

          // Check for success message or assume success if no error
          let successMessage = hathDocument.querySelector("p")?.text;
          hathDocument.dispose();

          let resolutionText =
            resolution === "org"
              ? "Original"
              : resolution === "800"
                ? "800x"
                : resolution === "1280"
                  ? "1280x"
                  : resolution === "1920"
                    ? "1920x"
                    : resolution === "2560"
                      ? "2560x"
                      : resolution;

          // For H@H downloads, return a special value to indicate remote download
          // This should close the window without creating a local download task
          // let message = successMessage && successMessage.includes("successfully")
          //     ? `H@H download command sent successfully (${resolutionText}). Check your H@H client.`
          //     : `H@H download command sent (${resolutionText}). Check your H@H client.`;

          // // Show success message to user
          // UI.showMessage(message);

          // Return empty string to avoid type error and prevent download task creation
          return "";
        }

        // Handle regular downloads (Original and Resample)
        let res = await source.requestClient.post(
          archiveUrl,
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          EhentaiModules.buildArchiveDownloadForm(aid),
          {
            action: "Failed to create archive download",
            requestKey: `archive:create:${cid}:${aid}`,
            mutation: true,
            maxRetries: 0,
          },
        );
        if (res.status !== 200) {
          throw source.formatResponseError(
            "Failed to create archive download",
            res,
          );
        }
        let document = new HtmlDocument(res.body);
        let link = document.querySelector("a")?.attributes["href"];
        if (!link) {
          throw "Failed to get download link";
        }
        let res2 = await source.requestClient.get(
          link,
          {
            http_client: "dart:io", // The server is uncomfortable with the default client
          },
          {
            action: "Failed to load archive download page",
            requestKey: `archive:page:${link}`,
          },
        );
        document.dispose();
        document = new HtmlDocument(res2.body);
        let link2 = document.querySelector("a")?.attributes["href"];
        document.dispose();
        let resultLink = EhentaiModules.buildArchiveResultUrl(link, link2);
        if (!resultLink) {
          throw "Failed to build final download URL";
        }
        let test = await source.requestClient.head(
          resultLink,
          {
            http_client: "dart:io",
          },
          {
            action: "Failed to validate archive link",
            requestKey: `archive:head:${resultLink}`,
            classifyBody: false,
          },
        );
        if (test.status === 410) {
          throw "IP quota exhausted.";
        }
        return resultLink;
      },
    },
    /**
     * [Optional] Handle tag click event
     * @param namespace {string}
     * @param tag {string}
     * @returns {{action: string, keyword: string, param: string?}}
     */
    onClickTag: (namespace, tag) => {
      if (namespace == "Category") {
        const categories = [
          "misc",
          "doujinshi",
          "manga",
          "artist cg",
          "game cg",
          "image set",
          "cosplay",
          "asian porn",
          "non-h",
          "western",
        ];
        return {
          page: "search",
          attributes: {
            keyword: "",
            options: [categories.indexOf(tag.toLowerCase()).toString(), "", ""],
          },
        };
      }
      if (tag.includes(" ")) {
        tag = `"${tag}"`;
      }
      return {
        // 'search' or 'category'
        action: "search",
        keyword: `${namespace}:${tag}`,
        // {string?} only for category action
        param: null,
      };
    },
    /**
     * [Optional] Handle links
     */
    link: {
      /**
       * set accepted domains
       */
      domains: ["e-hentai.org", "exhentai.org"],
      /**
       * parse url to comic id
       * @param url {string}
       * @returns {string | null}
       */
      linkToId: (url) => {
        return EhentaiModules.normalizeGalleryLink(source.baseUrl, url);
      },
    },
    enableTagsTranslate: true,
  };
};
