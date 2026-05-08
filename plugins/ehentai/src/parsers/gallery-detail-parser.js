function parseGalleryDetails(
  document,
) {
  function safeText(node, fallback) {
    if (node && typeof node.text === "string") {
      return node.text;
    }
    return fallback;
  }

  function firstMatch(text, regExp) {
    if (!text) {
      return null;
    }
    let match = regExp.exec(text);
    return match ? match[0] : null;
  }

  let tags = new Map();
  for (let tr of document.querySelectorAll(
    "div#taglist > table > tbody > tr",
  )) {
    let keyNode = tr.children.length > 0 ? tr.children[0] : null;
    let valuesNode = tr.children.length > 1 ? tr.children[1] : null;
    let keyText = safeText(keyNode, "");
    if (!keyText) {
      continue;
    }

    let values = [];
    let children = valuesNode ? valuesNode.children : [];
    for (let e of children) {
      try {
        let target = e.children.length > 0 ? e.children[0] : null;
        let onclick = target && target.attributes ? target.attributes["onclick"] : null;
        if (!onclick) {
          continue;
        }
        let parts = onclick.split(":");
        if (parts.length < 2) {
          continue;
        }
        let value = parts[1].split("'")[0];
        if (value) {
          values.push(value);
        }
      } catch (_) {}
    }
    tags.set(keyText.substring(0, keyText.length - 1), values);
  }

  let maxPage = "1";
  for (let element of document.querySelectorAll("td.gdt2")) {
    if (element.text.includes("page")) {
      let matched = firstMatch(element.text, /\d+/);
      if (matched) {
        maxPage = matched;
      }
    }
  }

  let isFavorited =
    safeText(document.querySelector("a#favoritelink"), "") !== " Add to Favorites";

  let folder = null;
  if (isFavorited) {
    let favNode = document.querySelector("div#fav");
    let style = null;
    if (favNode && favNode.children.length > 0 && favNode.children[0].attributes) {
      style = favNode.children[0].attributes["style"];
    }
    if (style && style.includes("background-position:0px -")) {
      let parts = style.split("background-position:0px -");
      if (parts.length > 1) {
        let positionText = parts[1].split("px;")[0];
        let position = Number(positionText);
        if (!isNaN(position)) {
          folder = ((position - 2) / 19).toString();
        }
      }
    }
  }

  let coverPath = "";
  let coverNode = document.querySelector("div#gleft > div#gd1 > div");
  let coverStyle = coverNode && coverNode.attributes ? coverNode.attributes["style"] : "";
  let coverMatch = RegExp(
    "https?://([-a-zA-Z0-9.]+(/\\S*)?\\.(?:jpg|jpeg|gif|png|webp))",
  ).exec(coverStyle || "");
  if (coverMatch) {
    coverPath = coverMatch[0];
  }

  let uploaderNode = document.getElementById("gdn");
  let uploader =
    uploaderNode && uploaderNode.children.length > 0 ? uploaderNode.children[0].text : undefined;
  let _ratingLabel = document.getElementById("rating_label");
  let _labelText = _ratingLabel ? _ratingLabel.text : "";
  let _parts = _labelText ? _labelText.split(":") : [];
  let _star = _parts.length > 1 ? _parts[1].trim() : "0";
  let stars = Number(_star);

  let category = safeText(document.querySelector("div.cs"), "Unknown");
  tags.set("Category", [category]);
  if (uploader) {
    tags.set("uploader", [uploader]);
  }

  let time = safeText(
    document.querySelector("div#gdd > table > tbody > tr > td.gdt2"),
    "",
  );

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

  let title = safeText(document.querySelector("h1#gn"), "Unknown");
  let subtitle = safeText(document.querySelector("h1#gj"), null);
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
}
