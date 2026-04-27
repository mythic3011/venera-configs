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

  let images = document
    .querySelectorAll("div.gdtm > div")
    .map((e) => parseImageUrl(e))
    .filter((url) => !!url);
  images.push(
    ...document
      .querySelectorAll("div.gdtl > a > img")
      .map((e) => safeAttr(e, "src", ""))
      .filter((url) => !!url),
  );

  if (images.length === 0) {
    for (let e of document
      .querySelectorAll("div.gt100 > a > div")
      .map((e) => (e.children.length === 0 ? e : e.children[0]))) {
      let url = parseImageUrl(e);
      if (url) {
        images.push(url);
      }
    }
    for (let e of document
      .querySelectorAll("div.gt200 > a > div")
      .map((e) => (e.children.length === 0 ? e : e.children[0]))) {
      let url = parseImageUrl(e);
      if (url) {
        images.push(url);
      }
    }
  }

  let urls = document
    .querySelectorAll("table.ptb > tbody > tr > td > a")
    .map((e) => safeAttr(e, "href", ""))
    .filter((url) => !!url);
  let pageNumbers = urls.map((e) => {
    let parts = e.split("=");
    let n = Number(parts.length > 1 ? parts[1] : "");
    return isNaN(n) ? 0 : n;
  });

  let maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;
  let current = next ? Number(next) : 0;
  current += 1;
  let nextToken = current > maxPage ? null : current.toString();

  let imagePageUrls = document
    .querySelectorAll("div#gdt a")
    .map((e) => safeAttr(e, "href", ""))
    .filter((url) => !!url);

  return {
    thumbnails: images,
    urls: imagePageUrls,
    next: nextToken,
  };
}
