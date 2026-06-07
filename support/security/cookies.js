function normalizeCookieUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

export { normalizeCookieUrl };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    normalizeCookieUrl,
  };
}
