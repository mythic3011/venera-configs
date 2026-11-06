class ImageLoadingSessionManager {
  constructor(source) {
    this.source = source;
    this.pendingSessions = new Map();
  }

  async ensureSession(comicId) {
    const cached = this.source.imageSessionCache.get(comicId);
    if (cached) {
      return cached;
    }

    if (this.pendingSessions.has(comicId)) {
      return this.pendingSessions.get(comicId);
    }

    const pending = this._createSession(comicId);
    this.pendingSessions.set(comicId, pending);

    try {
      return await pending;
    } finally {
      this.pendingSessions.delete(comicId);
    }
  }

  async _createSession(comicId) {
    const firstPage = await this.source.comic.loadThumbnails(comicId, null);

    if (!firstPage.urls || firstPage.urls.length === 0) {
      throw "Failed to load image session: no thumbnail page URLs";
    }

    const key = await this.source.comic.getKey(firstPage.urls[0]);

    const session = {
      comicId,
      firstPage,
      key,
      attempts: new Map(),
    };

    this.source.imageSessionCache.set(comicId, session);
    return session;
  }

  async getPageUrl(session, page) {
    if (page < 0) {
      throw `Invalid page index: ${page}`;
    }

    if (page < session.firstPage.urls.length) {
      return session.firstPage.urls[page];
    }

    const onePageLength = session.firstPage.thumbnails.length;
    if (!onePageLength) {
      throw "Failed to resolve page URL: empty thumbnail page";
    }

    const thumbnailPage = Math.floor(page / onePageLength);
    const index = page % onePageLength;

    const thumbnails = await this.source.comic.loadThumbnails(
      session.comicId,
      thumbnailPage.toString(),
    );

    const pageUrl = thumbnails.urls?.[index];
    if (!pageUrl) {
      throw `Failed to resolve page URL for page ${page}`;
    }

    return pageUrl;
  }

  async dispatchImage({ comicId, page, nl }) {
    const session = await this.ensureSession(comicId);
    const parsed = this.source.parseUrl(comicId);
    const nlKey = nl || "initial";

    if (session.key.mpvkey) {
      const imgKey = session.key.imageKeys?.[page];

      if (!imgKey) {
        throw `Failed to dispatch image: missing mpv image key for page ${page}`;
      }

      const payload = buildImageDispatchPayload({
        galleryId: parsed.id,
        imgKey,
        page: page + 1,
        mpvkey: session.key.mpvkey,
        nl,
      });

      const response = await this.source.requestClient.post(
        this.source.apiUrl,
        {},
        payload,
        {
          action: "Failed to dispatch image",
          requestKey: `image:mpv:${comicId}:${page}:${imgKey}:${nlKey}`,
          mutation: true,
          allowDedup: false,
          maxRetries: 0,
          classifyBody: false,
          headerProfile: "json-api",
        },
      );

      const json = this.source.parseJsonResponse(
        "Failed to dispatch image",
        response,
      );
      const url = String(json.i || "");
      const nextNl = String(json.s || "");

      if (!url) {
        throw "Failed to dispatch image: response missing image URL";
      }

      return { url, nl: nextNl };
    }

    const pageUrl = await this.getPageUrl(session, page);
    const imgKey = imageKeyFromPageUrl(pageUrl);

    if (!imgKey) {
      throw `Failed to dispatch image: missing showpage image key for page ${page}`;
    }

    const payload = buildShowPagePayload({
      galleryId: parsed.id,
      imgKey,
      page: page + 1,
      showkey: session.key.showkey,
      nl,
    });

    const response = await this.source.requestClient.post(
      this.source.apiUrl,
      {},
      payload,
      {
        action: "Failed to dispatch image",
        requestKey: `image:show:${comicId}:${page}:${imgKey}:${nlKey}`,
        mutation: true,
        allowDedup: false,
        maxRetries: 0,
        classifyBody: false,
        headerProfile: "json-api",
      },
    );

    const json = this.source.parseJsonResponse(
      "Failed to dispatch image",
      response,
    );
    const nextNl = this._parseNl(json.i6);
    const url = this._parseImageSrc(json.i3);

    return { url, nl: nextNl };
  }

  _parseNl(value) {
    const text = String(value || "");
    const match = /nl\('([^']+)'\)/.exec(text);
    return match ? match[1] : null;
  }

  _parseImageSrc(value) {
    const text = String(value || "");
    const match = /<img\b[^>]*\bsrc="([^"]+)"/i.exec(text);

    if (!match || !match[1]) {
      throw "Failed to parse image URL from dispatch response";
    }

    return match[1];
  }

  createRetry({ image, comicId, epId, nl, attempt }) {
    if (!nl) {
      return null;
    }

    const maxRetry = 2;
    if (attempt >= maxRetry) {
      return null;
    }

    return async () =>
      this.source.imageSessions.load({
        image,
        comicId,
        epId,
        nl,
        attempt: attempt + 1,
      });
  }

  async load({ image, comicId, epId, nl, attempt = 0 }) {
    const page = Number(image);
    const res = await this.dispatchImage({ comicId, page, nl });
    return {
      url: res.url,
      headers: this.source.buildRequestHeaders(
        "GET",
        res.url,
        {},
        { headerProfile: "thumbnail" },
      ),
      onLoadFailed: this.createRetry({
        image,
        comicId,
        epId,
        nl: res.nl,
        attempt,
      }),
    };
  }
}
