function createComicFeature(source) {
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
        {},
        {
          action: "Failed to load gallery details",
          requestKey: `gallery:${id}`,
          headerProfile: "gallery-view",
        },
      );
      source.requireStatus("Failed to load gallery details", res);
      source.requireHtmlBody("Failed to load gallery details", res);

      let comic = await source.withDocument(res.body, async (document) => {
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

        const parsed = parseGalleryDetails(document);
        let comments = source.comic.parseComments(document);
        let details = new ComicDetails({
          id: id,
          title: parsed.title,
          subTitle: parsed.subtitle,
          cover: parsed.coverPath,
          tags: parsed.tags,
          stars: parsed.stars,
          maxPage: parsed.maxPage,
          isFavorite: parsed.isFavorited,
          uploadTime: parsed.time,
          url: id,
          comments: comments.comments,
        });
        details.folder = parsed.folder;
        details.token = parsed.token;
        source.apikey = parsed.apikey;
        if (source.apikey && source.apikey[0] === '"') {
          source.apikey = source.apikey.substring(1, source.apikey.length - 1);
        }
        source.uid = parsed.uid;
        return details;
      });

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
      const cacheKey = thumbnailCacheKey(id, next);
      if (source.thumbnailCache.has(cacheKey)) {
        return source.thumbnailCache.get(cacheKey);
      }
      let url = buildGalleryPageUrl(id, next);
      let res = await source.requestClient.get(
        url,
        {
          "cache-time": "long",
          "prevent-parallel": "true",
        },
        {
          action: "Failed to load thumbnails",
          requestKey: `thumbnails:${cacheKey}`,
          headerProfile: "gallery-view",
        },
      );
      source.requireStatus("Failed to load thumbnails", res);
      source.requireHtmlBody("Failed to load thumbnails", res);
      const parsed = await source.withDocument(res.body, async (document) => {
        return parseThumbnailPage(document, next);
      });
      source.thumbnailCache.set(cacheKey, parsed);
      return parsed;
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
        {},
        buildRateGalleryPayload({
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
          headerProfile: "json-api",
        },
      );
      source.requireStatus("Failed to submit rating", res);
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
      source.requireStatus("Failed to load dispatch key", res);
      source.requireHtmlBody("Failed to load dispatch key", res);
      const parsed = await source.withDocument(res.body, async (document) => {
        return parseDispatchKey(document);
      });
      source.keyCache.set(url, parsed);
      return parsed;
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
      url = normalizeThumbnailHost(url);
      return {
        url: url,
        headers: source.buildRequestHeaders(
          "GET",
          url,
          {},
          { headerProfile: "thumbnail" },
        ),
      };
    },
    parseComments: (document) => {
      return parseComments(document);
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
        buildCommentsUrl(comicId),
        {},
        {
          action: "Failed to load comments",
          requestKey: `comments:${comicId}`,
          headerProfile: "gallery-view",
        },
      );
      source.requireStatus("Failed to load comments", res);
      source.requireHtmlBody("Failed to load comments", res);
      return source.withDocument(res.body, async (document) => {
        return source.comic.parseComments(document);
      });
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
        {},
        buildCommentForm(content),
        {
          action: "Failed to submit comment",
          requestKey: `comment:${comicId}`,
          mutation: true,
          maxRetries: 0,
          headerProfile: "form-urlencoded",
          refererUrl: comicId,
        },
      );
      if (res.status >= 400) {
        throw source.formatResponseError("Failed to submit comment", res);
      }
      source.requireHtmlBody("Failed to submit comment", res);
      await source.withDocument(res.body, async (document) => {
        const errorNode = document.querySelector("p.br");
        if (errorNode) {
          throw errorNode.text;
        }
      });
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
        {},
        buildVoteCommentPayload({
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
          headerProfile: "json-api",
        },
      );

      source.requireStatus("Failed to vote comment", res);
      let json = source.parseJsonResponse("Failed to vote comment", res);

      if (json.error) {
        throw json.error;
      }

      return json.comment_score;
    },
    archive: {
      getArchives: async (cid) => {
        await source.comic.loadInfo(cid);
        let urlParseResult = source.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = buildArchiverUrl(source.baseUrl, gid, token);
        let res = await source.requestClient.get(
          archiveUrl,
          {},
          {
            action: "Failed to load archive options",
            requestKey: `archive:options:${cid}`,
          },
        );
        source.requireStatus("Failed to load archive options", res);
        source.requireHtmlBody("Failed to load archive options", res);
        return source.withDocument(res.body, async (document) => {
          return parseArchiveOptions(document, source.baseUrl);
        });
      },
      getDownloadUrl: async (cid, aid) => {
        let urlParseResult = source.parseUrl(cid);
        let gid = urlParseResult.id;
        let token = urlParseResult.token;
        const archiveUrl = buildArchiverUrl(source.baseUrl, gid, token);

        // Handle H@H Download options
        if (aid.startsWith("h@h_")) {
          let resolution = aid.substring(4); // Remove 'h@h_' prefix

          // For H@H downloads, send the command directly to archiver.php
          let hathRes = await source.requestClient.post(
            archiveUrl,
            {},
            buildHathDownloadForm(resolution),
            {
              action: "Failed to send H@H download command",
              requestKey: `archive:hath:${cid}:${resolution}`,
              mutation: true,
              maxRetries: 0,
              headerProfile: "form-urlencoded",
            },
          );

          source.requireStatus("Failed to send H@H download command", hathRes);
          source.requireHtmlBody("Failed to send H@H download command", hathRes);
          await source.withDocument(hathRes.body, async (hathDocument) => {
            let errorElement = hathDocument.querySelector("p.br");
            if (errorElement) {
              let errorMessage = errorElement.text;
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
          });

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
          {},
          buildArchiveDownloadForm(aid),
          {
            action: "Failed to create archive download",
            requestKey: `archive:create:${cid}:${aid}`,
            mutation: true,
            maxRetries: 0,
            headerProfile: "form-urlencoded",
          },
        );
        source.requireStatus("Failed to create archive download", res);
        source.requireHtmlBody("Failed to create archive download", res);
        let link = await source.withDocument(res.body, async (document) => {
          return document.querySelector("a")?.attributes["href"];
        });
        if (!link) {
          throw "Failed to get download link";
        }
        let res2 = await source.requestClient.get(
          link,
          {},
          {
            action: "Failed to load archive download page",
            requestKey: `archive:page:${link}`,
            networkClient: "dart-io", // The server is uncomfortable with the default client
          },
        );
        source.requireStatus("Failed to load archive download page", res2);
        source.requireHtmlBody("Failed to load archive download page", res2);
        let link2 = await source.withDocument(res2.body, async (document) => {
          return document.querySelector("a")?.attributes["href"];
        });
        let resultLink = buildArchiveResultUrl(link, link2);
        if (!resultLink) {
          throw "Failed to build final download URL";
        }
        let test = await source.requestClient.head(
          resultLink,
          {},
          {
            action: "Failed to validate archive link",
            requestKey: `archive:head:${resultLink}`,
            classifyBody: false,
            networkClient: "dart-io",
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
        return normalizeGalleryLink(source.baseUrl, url);
      },
    },
    enableTagsTranslate: true,
  };
}
