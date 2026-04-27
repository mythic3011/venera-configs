function parseThumbnailPage(document, next) {
  function safeAttr(node, key, fallback) {
    if (node && node.attributes && typeof node.attributes[key] !== "undefined") {
      return node.attributes[key];
    }
    return fallback;
  }

  const parseImageUrl = (e) => {
    let style = safeAttr(e, "style", "");
    if (!style) {
      return "";
    }
    let width = 0;
    let height = 0;
    let widthMatch = style.match(/width:(\d+)px/);
    let heightMatch = style.match(/height:(\d+)px/);
    if (widthMatch) {
      width = Number(widthMatch[1]);
    }
    if (heightMatch) {
      height = Number(heightMatch[1]);
    }
    let styleParts = style.split("background:transparent url(");
    if (styleParts.length < 2) {
      return "";
    }
    let r = styleParts[1];
    let url = r.split(")")[0];
    if (!url) {
      return "";
    }
    let range = "";
    if (r.includes("px")) {
      let positionParts = r.split(") -");
      if (positionParts.length > 1) {
        let position = Number(positionParts[1].split("px")[0]);
        if (!isNaN(position)) {
          range += `x=${position}-${position + width}`;
        }
      }
    }
    if (height) range += `${range ? "&" : ""}y=0-${height}`;
    if (range) url += `@${range}`;
    return url;
  };

  const collectImageUrls = (selector, extractor) => {
    return document
      .querySelectorAll(selector)
      .map((node) => extractor(node))
      .filter((url) => !!url);
  };

  let images = document
    .querySelectorAll("div.gdtm > div")
    .map((e) => parseImageUrl(e))
    .filter((url) => !!url);
  images.push(
    ...collectImageUrls("div.gdtl > a > img", (e) => safeAttr(e, "src", "")),
  );

  if (images.length === 0) {
    const fallbackSelectors = ["div.gt100 > a > div", "div.gt200 > a > div"];
    for (let selector of fallbackSelectors) {
      images.push(
        ...collectImageUrls(selector, (e) => {
          let target = e.children.length === 0 ? e : e.children[0];
          return parseImageUrl(target);
        }),
      );
    }
  }

  let urls = collectImageUrls(
    "table.ptb > tbody > tr > td > a",
    (e) => safeAttr(e, "href", ""),
  );
  let maxPage = 0;
  for (let e of urls) {
    let parts = e.split("=");
    let n = Number(parts.length > 1 ? parts[1] : "");
    if (!isNaN(n) && n > maxPage) {
      maxPage = n;
    }
  }
  let current = next ? Number(next) : 0;
  current += 1;
  let nextToken = current > maxPage ? null : current.toString();

  let imagePageUrls = collectImageUrls("div#gdt a", (e) => safeAttr(e, "href", ""));

  return {
    thumbnails: images,
    urls: imagePageUrls,
    next: nextToken,
  };
}
