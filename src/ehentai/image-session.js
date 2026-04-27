class ImageLoadingSessionManager {
  constructor(source) {
    this.source = source;
  }

  async ensureSession(comicId) {
    const cached = this.source.imageSessionCache.get(comicId);
    if (cached) {
      return cached;
    }

    const firstPage = await this.source.comic.loadThumbnails(comicId, null);
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
    if (page < session.firstPage.urls.length) {
      return session.firstPage.urls[page];
    }

    const onePageLength = session.firstPage.thumbnails.length;
    const shouldLoadPage = Math.floor(page / onePageLength);
    const index = page % onePageLength;
    const thumbnails = await this.source.comic.loadThumbnails(
      session.comicId,
      shouldLoadPage.toString(),
    );
    return thumbnails.urls[index];
  }

  async dispatchImage({ comicId, page, nl }) {
    const session = await this.ensureSession(comicId);
    const parsed = this.source.parseUrl(comicId);

    if (session.key.mpvkey) {
      const payload = buildImageDispatchPayload({
        galleryId: parsed.id,
        imgKey: session.key.imageKeys[page],
        page: page + 1,
        mpvkey: session.key.mpvkey,
        nl,
      });
      const response = await this.source.requestClient.post(
        this.source.apiUrl,
        { "Content-Type": "application/json" },
        payload,
        {
          action: "Failed to dispatch image",
          mutation: true,
          maxRetries: 0,
          classifyBody: false,
        },
      );
      const json = JSON.parse(response.body);
      return {
        url: String(json.i),
        nl: String(json.s),
      };
    }

    const pageUrl = await this.getPageUrl(session, page);
    const payload = buildShowPagePayload({
      galleryId: parsed.id,
      imgKey: imageKeyFromPageUrl(pageUrl),
      page: page + 1,
      showkey: session.key.showkey,
      nl,
    });
    const response = await this.source.requestClient.post(
      this.source.apiUrl,
      { "Content-Type": "application/json" },
      payload,
      {
        action: "Failed to dispatch image",
        mutation: true,
        maxRetries: 0,
        classifyBody: false,
      },
    );
    const json = JSON.parse(response.body);
    const i6 = json.i6;
    const match = RegExp("nl\\('(.+?)'\\)").exec(i6);
    const nextNl = match ? match[1] : null;
    let image = json.i3;
    image = image.substring(image.indexOf('src="') + 5, image.indexOf('" style'));
    return {
      url: image,
      nl: nextNl,
    };
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
