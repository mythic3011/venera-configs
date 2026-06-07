function createNhentaiAccountFeature() {
  return {
    loginWithWebview: {
      url: "https://nhentai.net/login/?next=/",
      checkStatus: (url, title) => {
        return url === "https://nhentai.net/";
      },
    },
    logout: () => {
      Network.deleteCookies("https://nhentai.net");
    },
    registerWebsite: "https://nhentai.net/register/",
  };
}
