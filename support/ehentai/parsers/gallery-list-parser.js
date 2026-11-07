export function parseGalleryList({
  document,
  source,
  url,
  isLeaderBoard,
}) {
  function firstNumber(text, fallback) {
    let match = text ? text.match(/\d+/) : null;
    if (!match) {
      return fallback;
    }
    let value = Number(match[0]);
    return isNaN(value) ? fallback : value;
  }

  const t = isLeaderBoard ? 1 : 0;
  const galleries = [];

  for (let item of document.querySelectorAll("table.itg.gltc > tbody > tr")) {
    try {
      let infoCell = item.children.length > 1 + t ? item.children[1 + t] : null;
      if (!infoCell) {
        continue;
      }
      let metaContainer = infoCell.children.length > 2 ? infoCell.children[2] : null;
      let time = ehSafeText(metaContainer && metaContainer.children.length > 0 ? metaContainer.children[0] : null, "");
      let stars = source.getStarsFromPosition(
        ehSafeAttr(metaContainer && metaContainer.children.length > 1 ? metaContainer.children[1] : null, "style", ""),
      );
      let coverNode = infoCell;
      if (coverNode && coverNode.children.length > 1) {
        coverNode = coverNode.children[1];
      }
      if (coverNode && coverNode.children.length > 0) {
        coverNode = coverNode.children[0];
      }
      if (coverNode && coverNode.children.length > 0) {
        coverNode = coverNode.children[0];
      }
      let cover = ehSafeAttr(coverNode, "src", "");
      if (cover && cover[0] === "d") {
        cover = ehSafeAttr(coverNode, "data-src", cover);
      }
      let detailsCell = item.children.length > 2 + t ? item.children[2 + t] : null;
      let detailsRoot = detailsCell && detailsCell.children.length > 0 ? detailsCell.children[0] : null;
      let title = ehSafeText(detailsRoot && detailsRoot.children.length > 0 ? detailsRoot.children[0] : null, "Unknown");
      let link = ehSafeAttr(detailsRoot, "href", "");
      let uploader = "";
      let pages = 0;
      try {
        if (url.includes("/favorites.php")) {
          let favNode = infoCell;
          if (favNode.children.length > 1) favNode = favNode.children[1];
          if (favNode.children.length > 1) favNode = favNode.children[1];
          if (favNode.children.length > 1) favNode = favNode.children[1];
          pages = firstNumber(ehSafeText(favNode && favNode.children.length > 1 ? favNode.children[1] : null, ""), 0);
        } else {
          let uploaderCell = item.children.length > 3 + t ? item.children[3 + t] : null;
          pages = firstNumber(ehSafeText(uploaderCell && uploaderCell.children.length > 1 ? uploaderCell.children[1] : null, ""), 0);
          let uploaderAnchor = null;
          if (uploaderCell && uploaderCell.children.length > 0) {
            uploaderAnchor = uploaderCell.children[0];
          }
          if (uploaderAnchor && uploaderAnchor.children.length > 0) {
            uploaderAnchor = uploaderAnchor.children[0];
          }
          uploader = ehSafeText(uploaderAnchor, "");
        }
      } catch (_) {}
      let tags = [];
      let language = null;
      let tagContainer = detailsRoot && detailsRoot.children.length > 1 ? detailsRoot.children[1] : null;
      for (let node of tagContainer ? tagContainer.children : []) {
        let tag = ehSafeAttr(node, "title", "");
        if (!tag) {
          continue;
        }
        if (tag.startsWith("language:")) {
          let l = tag.split(":")[1].trim();
          language = l === "translated" ? language : l;
          continue;
        }
        tags.push(tag);
      }
      galleries.push(
        new Comic({
          id: link,
          title,
          subTitle: uploader,
          cover,
          tags,
          description: time,
          stars,
          maxPage: pages,
          language,
        }),
      );
    } catch (_) {}
  }

  for (let item of document.querySelectorAll("div.gl1t")) {
    try {
      let title = ehSafeText(item.querySelector("a"), "Unknown");
      let gl5Rows = item.querySelectorAll("div.gl5t > div > div");
      let time = gl5Rows.find((element) => !isNaN(Date.parse(element.text)));
      time = ehSafeText(time, "");
      let coverPath = ehSafeAttr(item.querySelector("img"), "src", "");
      let stars = source.getStarsFromPosition(
        ehSafeAttr(item.querySelector("div.gl5t > div > div.ir"), "style", ""),
      );
      let link = ehSafeAttr(item.querySelector("a"), "href", "");
      let pageElement = gl5Rows.find((element) => element.text.includes("page"));
      let pages = firstNumber(ehSafeText(pageElement, ""), 0);
      galleries.push(
        new Comic({
          id: link,
          title,
          cover: coverPath,
          description: time,
          stars,
          maxPage: pages,
        }),
      );
    } catch (_) {}
  }

  for (let item of document.querySelectorAll("table.itg.glte > tbody > tr")) {
    try {
      let title = ehSafeText(item.querySelector("td.gl2e > div > a > div > div.glink"), "Unknown");
      let gl3Rows = item.querySelectorAll("td.gl2e > div > div.gl3e > div");
      let time =
        ehSafeText(
          gl3Rows.find((element) => !isNaN(Date.parse(element.text))),
          "Unknown",
        );
      let uploader = ehSafeText(item.querySelector("td.gl2e > div > div.gl3e > div > a"), "Unknown");
      let coverPath = ehSafeAttr(item.querySelector("td.gl1e > div > a > img"), "src", "");
      let stars = source.getStarsFromPosition(
        ehSafeAttr(item.querySelector("td.gl2e > div > div.gl3e > div.ir"), "style", ""),
      );
      let link = ehSafeAttr(item.querySelector("td.gl1e > div > a"), "href", "");
      let tags = item.querySelectorAll("div.gt, div.gtl").map((e) => ehSafeAttr(e, "title", ""));
      tags = tags.filter((tag) => !!tag);
      let pages = firstNumber(
        ehSafeText(
          gl3Rows.find((element) => element.text.includes("page")),
          "",
        ),
        0,
      );
      let language = null;
      let languageTag = tags.find((e) => e.startsWith("language:") && !e.includes("translated"));
      if (languageTag && languageTag.includes(":")) {
        language = languageTag.split(":")[1].trim();
      }
      galleries.push(
        new Comic({
          id: link,
          title,
          subTitle: uploader,
          cover: coverPath,
          tags,
          description: time,
          stars,
          maxPage: pages,
          language,
        }),
      );
    } catch (_) {}
  }

  for (let item of document.querySelectorAll("table.itg.gltm > tbody > tr")) {
    try {
      let title = ehSafeText(item.querySelector("td.gl3m > a > div.glink"), "Unknown");
      let gl2Rows = item.querySelectorAll("td.gl2m > div");
      let time =
        ehSafeText(
          gl2Rows.find((element) => !isNaN(Date.parse(element.text))),
          "Unknown",
        );
      let uploader = ehSafeText(item.querySelector("td.gl5m > div > a"), "Unknown");
      let coverNode = item.querySelector("td.gl2m > div > div > img");
      let coverPath = ehSafeAttr(coverNode, "src", "");
      if (coverPath && coverPath[0] === "d") {
        coverPath = ehSafeAttr(coverNode, "data-src", coverPath);
      }
      let stars = source.getStarsFromPosition(
        ehSafeAttr(item.querySelector("td.gl4m > div.ir"), "style", ""),
      );
      let link = ehSafeAttr(item.querySelector("td.gl3m > a"), "href", "");
      galleries.push(
        new Comic({
          id: link,
          title,
          subTitle: uploader,
          cover: coverPath,
          description: time,
          stars,
        }),
      );
    } catch (_) {}
  }

  const next = ehSafeAttr(document.querySelector("a#dnext"), "href", undefined);
  return { comics: galleries, next };
}
