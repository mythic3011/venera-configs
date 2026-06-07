function createHtmlDocument(html) {
  return new HtmlDocument(html);
}

export { createHtmlDocument };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createHtmlDocument,
  };
}
