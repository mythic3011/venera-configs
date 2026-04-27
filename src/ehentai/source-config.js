function createEhentaiAccountFeature(source) {
  return createAccountFeature(source, {
    loginWithWebview: {
      url: buildForumsLoginUrl(),
      checkStatus: (url, title) => {
        return title === "E-Hentai Forums";
      },
      onLoginSuccess: async () => {
        let cookies = await Network.getCookies(buildForumsCookieUrl());
        cookies.forEach((cookie) => {
          cookie.domain = ".exhentai.org";
        });
        Network.setCookies(buildExCookieUrl(), cookies);
      },
    },

    loginWithCookies: {
      fields: ["ipb_member_id", "ipb_pass_hash", "igneous", "star"],
      validate: async (values) => {
        if (values.length !== 4) {
          return false;
        }
        if (values[0].length === 0 || values[1].length === 0) {
          return false;
        }
        let cookies = [];
        for (let i = 0; i < values.length; i++) {
          cookies.push(
            new Cookie({
              name: source.account.loginWithCookies.fields[i],
              value: values[i],
              domain: ".e-hentai.org",
            }),
          );
          cookies.push(
            new Cookie({
              name: source.account.loginWithCookies.fields[i],
              value: values[i],
              domain: ".exhentai.org",
            }),
          );
        }
        Network.deleteCookies(buildEhCookieUrl());
        Network.setCookies(buildEhCookieUrl(), cookies);
        let res = await source.requestClient.get(
          buildForumsHomeUrl(),
          {},
          {
            action: "Failed to validate forum cookies",
            requestKey: "forums:cookie-validate",
            classifyBody: false,
            headerProfile: "forums-browser",
            refererUrl: buildForumsIndexRefererUrl(),
          },
        );
        if (res.status !== 200) {
          return false;
        }
        let document = new HtmlDocument(res.body);
        let name = document.querySelector("div#userlinks > p.home > b > a");
        document.dispose();
        return name != null;
      },
    },

    logout: () => {
      Network.deleteCookies(buildEhCookieUrl());
      Network.deleteCookies(buildForumsCookieUrl());
      Network.deleteCookies(buildExCookieUrl());
      source.responseCache.clear();
      source.thumbnailCache.clear();
      source.keyCache.clear();
      source.galleryInfoCache.clear();
      source.imageSessionCache.clear();
    },

    registerWebsite: null,
  });
}

function createEhentaiExploreFeature(source) {
  return createExploreFeature(source, [
    {
      title: "eh latest",
      type: "multiPageComicList",
      loadNext: (next) => {
        let target = next != null ? next : source.baseUrl;
        return source.getGalleries(target, false);
      },
    },
    {
      title: "eh popular",
      type: "multiPageComicList",
      loadNext: (next) => {
        let target = next != null ? next : buildPopularUrl(source.baseUrl);
        return source.getGalleries(target, false);
      },
    },
    {
      title: "eh watched",
      type: "multiPageComicList",
      loadNext: async (next) => {
        if (!source.isLogged) {
          UI.showMessage("Need login first");
          return {
            comics: [],
            next: null,
          };
        }
        let target = next != null ? next : buildWatchedUrl(source.baseUrl);
        return source.getGalleries(target, false);
      },
    },
  ]);
}

function createEhentaiCategory() {
  return {
    title: "ehentai",
    parts: [],
    enableRankingPage: true,
  };
}

function createEhentaiCategoryComics(source) {
  return {
    ranking: {
      options: ["15-yesterday", "13-month", "12-year", "11-all"],
      load: async (option, page) => {
        let res = await source.getGalleries(
          buildToplistUrl(buildBaseUrl("e-hentai.org"), option, page - 1),
          true,
        );
        let comics = res.comics;
        if (source.loadSetting("domain") === "exhentai.org") {
          comics.forEach((comic) => {
            comic.id = comic.id.replace("e-hentai", "exhentai");
          });
        }
        return {
          comics: comics,
          maxPage: 200,
        };
      },
    },
  };
}
