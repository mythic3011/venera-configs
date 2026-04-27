EhentaiModules.parsers.parseGalleryDetails = function parseGalleryDetails(
  document,
) {
  let tags = new Map();
  for (let tr of document.querySelectorAll(
    "div#taglist > table > tbody > tr",
  )) {
    tags.set(
      tr.children[0].text.substring(0, tr.children[0].text.length - 1),
      tr.children[1].children.map(
        (e) => e.children[0].attributes["onclick"].split(":")[1].split("'")[0],
      ),
    );
  }

  let maxPage = "1";
  for (let element of document.querySelectorAll("td.gdt2")) {
    if (element.text.includes("page")) {
      maxPage = element.text.match(/\d+/)[0];
    }
  }

  let isFavorited =
    document.querySelector("a#favoritelink")?.text !== " Add to Favorites";

  let folder = null;
  if (isFavorited) {
    let position = document
      .querySelector("div#fav")
      .children[0].attributes["style"].split("background-position:0px -")[1]
      .split("px;")[0];
    folder = (Number(position - 2) / 19).toString();
  }

  let coverPath = document.querySelector("div#gleft > div#gd1 > div")
    .attributes["style"];
  coverPath = RegExp(
    "https?://([-a-zA-Z0-9.]+(/\\S*)?\\.(?:jpg|jpeg|gif|png|webp))",
  ).exec(coverPath)[0];

  let uploader = document.getElementById("gdn")?.children[0]?.text;
  let _ratingLabel = document.getElementById("rating_label");
  let _labelText = _ratingLabel ? _ratingLabel.text : "";
  let _parts = _labelText ? _labelText.split(":") : [];
  let _star = _parts.length > 1 ? _parts[1].trim() : "0";
  let stars = Number(_star);

  let category = document.querySelector("div.cs").text;
  tags.set("Category", [category]);
  if (uploader) {
    tags.set("uploader", [uploader]);
  }

  let time = document.querySelector(
    "div#gdd > table > tbody > tr > td.gdt2",
  ).text;

  let script = document
    .querySelectorAll("script")
    .find((e) => e.text.includes("var token"));
  let reg = RegExp("var\\s+(\\w+)\\s*=\\s*(.*?);", "g");
  let variables = new Map();
  let scriptText = script && script.text ? script.text : "";
  let match;
  while ((match = reg.exec(scriptText)) !== null) {
    variables.set(match[1], match[2]);
  }

  let title = document.querySelector("h1#gn").text;
  let subtitle = document.querySelector("h1#gj")?.text;
  if (subtitle != null && subtitle.trim() === "") {
    subtitle = null;
  }

  return {
    title,
    subtitle,
    coverPath,
    tags,
    stars,
    maxPage: Number(maxPage),
    isFavorited,
    folder,
    time,
    token: variables.get("token"),
    apikey: variables.get("apikey"),
    uid: variables.get("apiuid"),
  };
};
