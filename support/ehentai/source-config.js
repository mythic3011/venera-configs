import {
  buildBaseUrl,
  buildEhCookieUrl,
  buildExCookieUrl,
  buildForumsCookieUrl,
  buildForumsHomeUrl,
  buildForumsIndexRefererUrl,
  buildForumsLoginUrl,
  buildPopularUrl,
  buildToplistUrl,
  buildWatchedUrl,
} from "./urls.js";

export function createEhentaiAccountFeature(source) {
  return {
    loginWithWebview: {
      url: buildForumsLoginUrl(),
      checkStatus: (url, title) => {
        return title === "E-Hentai Forums";
      },
      onLoginSuccess: async () => {
        let cookies = await Network.getCookies(buildForumsCookieUrl());
        let accountCookies = [];
        cookies.forEach((cookie) => {
          if (!cookie || !cookie.name) {
            return;
          }
          if (!source.accountFieldNames.includes(String(cookie.name))) {
            return;
          }
          let value = String(cookie.value || "");
          if (value.length === 0) {
            return;
          }
          accountCookies.push(
            new Cookie({
              name: String(cookie.name),
              value,
              domain: ".e-hentai.org",
            }),
          );
          accountCookies.push(
            new Cookie({
              name: String(cookie.name),
              value,
              domain: ".exhentai.org",
            }),
          );
        });
        if (accountCookies.length > 0) {
          Network.setCookies(buildEhCookieUrl(), accountCookies);
          Network.setCookies(buildExCookieUrl(), accountCookies);
        }
        try {
          await source.captureAccountFromCookieJar("");
        } catch (_) {}
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
        source.applyCookiesFromValues(values);
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
        let userName = null;
        let valid = await source.withDocument(res.body, async (document) => {
          let nameNode = document.querySelector("div#userlinks > p.home > b > a");
          if (!nameNode) {
            return false;
          }
          userName = nameNode.text;
          return true;
        });
        if (!valid) {
          return false;
        }
        source.upsertAccountProfile(values, userName || "");
        return true;
      },
    },

    logout: () => {
      source.logoutAccountSession();
    },

    registerWebsite: null,
  };
}

export const EHENTAI_EXPLORE_PAGES = [
  {
    title: "eh latest",
    url: (source) => source.baseUrl,
  },
  {
    title: "eh popular",
    url: (source) => buildPopularUrl(source.baseUrl),
  },
  {
    title: "eh watched",
    url: (source) => buildWatchedUrl(source.baseUrl),
    requiresLogin: true,
  },
];

export const EHENTAI_RANKING = [
  ["15", "yesterday"],
  ["13", "month"],
  ["12", "year"],
  ["11", "all"],
];

export function createMappedExploreFeature(source, pages) {
  return pages.map((page) => {
    return {
      title: page.title,
      type: "multiPageComicList",
      loadNext: async (next) => {
        if (page.requiresLogin && !source.isLogged) {
          UI.showMessage("Need login first");
          return {
            comics: [],
            next: null,
          };
        }
        let target = next != null ? next : page.url(source);
        return source.getGalleries(target, false);
      },
    };
  });
}

export function createEhentaiExploreFeature(source) {
  return createMappedExploreFeature(source, EHENTAI_EXPLORE_PAGES);
}

export function createEhentaiCategory() {
  return {
    title: "ehentai",
    parts: [],
    enableRankingPage: true,
  };
}

export function createEhentaiCategoryComics(source) {
  return {
    ranking: {
      options: EHENTAI_RANKING.map((pair) => `${pair[0]}-${pair[1]}`),
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
