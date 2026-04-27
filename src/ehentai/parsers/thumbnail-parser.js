EhentaiModules.parsers.parseThumbnailPage = function parseThumbnailPage(document, next) {
  const parseImageUrl = (e) => {
    let style = e.attributes["style"];
    let width = Number(style.split("width:")[1].split("px")[0]);
    let height = Number(style.split("height:")[1].split("px")[0]);
    let r = style.split("background:transparent url(")[1];
    let url = r.split(")")[0];
    let range = "";
    if (r.includes("px")) {
      let position = Number(r.split(") -")[1].split("px")[0]);
      range += `x=${position}-${position + width}`;
    }
    if (height) range += `${range ? "&" : ""}y=0-${height}`;
    if (range) url += `@${range}`;
    return url;
  };

  let images = document.querySelectorAll("div.gdtm > div").map((e) => parseImageUrl(e));
  images.push(
    ...document.querySelectorAll("div.gdtl > a > img").map((e) => e.attributes["src"]),
  );

  if (images.length === 0) {
    for (let e of document
      .querySelectorAll("div.gt100 > a > div")
      .map((e) => (e.children.length === 0 ? e : e.children[0]))) {
      images.push(parseImageUrl(e));
    }
    for (let e of document
      .querySelectorAll("div.gt200 > a > div")
      .map((e) => (e.children.length === 0 ? e : e.children[0]))) {
      images.push(parseImageUrl(e));
    }
  }

  let urls = document
    .querySelectorAll("table.ptb > tbody > tr > td > a")
    .map((e) => e.attributes["href"]);
  let pageNumbers = urls.map((e) => {
    let n = Number(e.split("=")[1]);
    return isNaN(n) ? 0 : n;
  });

  let maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;
  let current = next ? Number(next) : 0;
  current += 1;
  let nextToken = current > maxPage ? null : current.toString();

  let imagePageUrls = document.querySelectorAll("div#gdt a").map((e) => e.attributes["href"]);

  return {
    thumbnails: images,
    urls: imagePageUrls,
    next: nextToken,
  };
};
