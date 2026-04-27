EhentaiModules.parsers.parseGalleryList = function parseGalleryList({
  document,
  source,
  url,
  isLeaderBoard,
}) {
  const t = isLeaderBoard ? 1 : 0;
  const galleries = [];

  for (let item of document.querySelectorAll("table.itg.gltc > tbody > tr")) {
    try {
      let time = item.children[1 + t].children[2].children[0].text;
      let stars = source.getStarsFromPosition(
        item.children[1 + t].children[2].children[1].attributes["style"],
      );
      let cover =
        item.children[1 + t].children[1].children[0].children[0].attributes[
          "src"
        ];
      if (cover[0] === "d") {
        cover =
          item.children[1 + t].children[1].children[0].children[0].attributes[
            "data-src"
          ];
      }
      let title = item.children[2 + t].children[0].children[0].text;
      let link = item.children[2 + t].children[0].attributes["href"];
      let uploader = "";
      let pages = 0;
      try {
        if (url.includes("/favorites.php")) {
          pages = Number(
            item.children[
              1 + t
            ].children[1].children[1].children[1].children[1].text.match(/\d+/)[0],
          );
        } else {
          pages = Number(item.children[3 + t].children[1].text.match(/\d+/)[0]);
          uploader = item.children[3 + t].children[0].children[0].text;
        }
      } catch (_) {}
      let tags = [];
      let language = null;
      for (let node of item.children[2 + t].children[0].children[1].children) {
        let tag = node.attributes["title"];
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
      let title = item.querySelector("a")?.text ?? "Unknown";
      let time = item
        .querySelectorAll("div.gl5t > div > div")
        .find((element) => !isNaN(Date.parse(element.text)))?.text;
      let coverPath = item.querySelector("img")?.attributes["src"] ?? "";
      let stars = source.getStarsFromPosition(
        item.querySelector("div.gl5t > div > div.ir")?.attributes["style"] ?? "",
      );
      let link = item.querySelector("a")?.attributes["href"] ?? "";
      let pages = Number(
        item
          .querySelectorAll("div.gl5t > div > div")
          .find((element) => element.text.includes("page"))
          ?.text.match(/\d+/)[0] ?? "0",
      );
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
      let title = item.querySelector("td.gl2e > div > a > div > div.glink")?.text ?? "Unknown";
      let time =
        item
          .querySelectorAll("td.gl2e > div > div.gl3e > div")
          .find((element) => !isNaN(Date.parse(element.text)))?.text ?? "Unknown";
      let uploader = item.querySelector("td.gl2e > div > div.gl3e > div > a")?.text ?? "Unknown";
      let coverPath = item.querySelector("td.gl1e > div > a > img")?.attributes["src"] ?? "";
      let stars = source.getStarsFromPosition(
        item.querySelector("td.gl2e > div > div.gl3e > div.ir")?.attributes["style"] ?? "",
      );
      let link = item.querySelector("td.gl1e > div > a")?.attributes["href"] ?? "";
      let tags = item.querySelectorAll("div.gt, div.gtl").map((e) => e.attributes["title"] ?? "");
      let pages = Number(
        item
          .querySelectorAll("td.gl2e > div > div.gl3e > div")
          .find((element) => element.text.includes("page"))
          ?.text.match(/\d+/)[0] ?? "",
      );
      let language =
        tags
          .find((e) => e.startsWith("language:") && !e.includes("translated"))
          ?.split(":")[1]
          .trim() ?? null;
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
      let title = item.querySelector("td.gl3m > a > div.glink")?.text ?? "Unknown";
      let time =
        item
          .querySelectorAll("td.gl2m > div")
          .find((element) => !isNaN(Date.parse(element.text)))?.text ?? "Unknown";
      let uploader = item.querySelector("td.gl5m > div > a")?.text ?? "Unknown";
      let coverPath = item.querySelector("td.gl2m > div > div > img")?.attributes["src"];
      if (coverPath && coverPath[0] === "d") {
        coverPath = item.querySelector("td.gl2m > div > div > img")?.attributes["data-src"];
      }
      let stars = source.getStarsFromPosition(
        item.querySelector("td.gl4m > div.ir")?.attributes["style"] ?? "",
      );
      let link = item.querySelector("td.gl3m > a")?.attributes["href"] ?? "";
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

  const next = document.querySelector("a#dnext")?.attributes["href"];
  return { comics: galleries, next };
};
