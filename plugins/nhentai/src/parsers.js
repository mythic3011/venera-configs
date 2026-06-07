function parseNhentaiComicElement(source, element) {
  const imgEl = element.querySelector("a > img");
  const imagePath =
    imgEl?.attributes?.["data-src"] || imgEl?.attributes?.["src"] || "";
  const title = element.querySelector("div.caption")?.text || "";
  const href = element.querySelector("a")?.attributes?.["href"] || "";
  const idMatch = href.match(/\d+/g);
  const id = idMatch ? idMatch.join("") : "";
  const tagIds = element.attributes?.["data-tags"] || "";

  return new Comic({
    id,
    title,
    subtitle: "",
    cover: source.toAbsoluteMediaUrl(imagePath, true),
    tags: collectNhentaiTagNames(tagIds),
    description: id,
    language: getNhentaiLanguageFromTags(tagIds),
  });
}

function parseNhentaiComicFromApi(source, item) {
  const tagIds = item.tag_ids || [];
  return new Comic({
    id: String(item.id),
    title: item.english_title || item.japanese_title || String(item.id),
    subtitle: "",
    cover: source.toAbsoluteMediaUrl(item.thumbnail, true),
    tags: collectNhentaiTagNames(tagIds),
    description: String(item.id),
    language: getNhentaiLanguageFromTags(tagIds),
  });
}

function parseNhentaiComicListFromApi(source, data) {
  return {
    comics: (data.result || []).map((item) => parseNhentaiComicFromApi(source, item)),
    maxPage: data.num_pages || 1,
  };
}

function formatNhentaiTimestamp(timestampSec) {
  const time = new Date(Number(timestampSec) * 1000);
  if (Number.isNaN(time.getTime())) {
    return "";
  }
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
}

async function parseNhentaiHtmlComicList(source, html, type = "search") {
  const document = new HtmlDocument(html);
  const comicElements = document.querySelectorAll("div.gallery");
  let total = comicElements.length;
  let maxPageFromApi = null;

  if (type === "search") {
    const heading = document.querySelector("div#content > h1")?.text || "";
    const numbers = heading.match(/\d+/g);
    if (numbers) {
      total = parseInt(numbers.join(""));
    }
  } else {
    const tagEl = document.querySelector("div#content > h1 > a");
    const classAttr = tagEl?.attributes?.["class"];
    const tagId = classAttr?.match(/tag-(\d+)/)?.[1];
    if (!tagId) {
      const heading = document.querySelector("div#content > h1")?.text || "";
      const numbers = heading.match(/\d+/g);
      if (numbers) {
        total = parseInt(numbers.join(""));
      }
    } else {
      const res = await Network.get(
        `${source.apiBaseUrl}/galleries/tagged?tag_id=${tagId}`,
        {},
      );
      if (res.status !== 200) {
        const heading = document.querySelector("div#content > h1")?.text || "";
        const numbers = heading.match(/\d+/g);
        if (numbers) {
          total = parseInt(numbers.join(""));
        }
      } else {
        const resBody = JSON.parse(res.body);
        if (resBody?.num_pages != null) {
          maxPageFromApi = resBody.num_pages;
        }
        if (resBody?.total != null) {
          total = resBody.total;
        }
      }
    }
  }

  return {
    comics: comicElements.map((element) => source.parseComic(element)),
    maxPage: maxPageFromApi || Math.ceil(total / 25),
  };
}

function parseNhentaiApiTagMap(source, tags) {
  const groupedTags = new Map();
  for (const tag of tags || []) {
    const namespace = source.tagNamespace(tag.type);
    if (!groupedTags.has(namespace)) {
      groupedTags.set(namespace, []);
    }
    groupedTags.get(namespace).push(tag.name);
  }
  return groupedTags;
}

function parseNhentaiHtmlTagMap(document) {
  const groupedTags = new Map();
  for (const field of document.querySelectorAll("div.tag-container")) {
    const label = field.nodes?.[0]?.text || "";
    const name = label.trim().replaceAll(":", "");
    if (name === "Uploaded") {
      continue;
    }
    const values = field.querySelectorAll("span.name").map((node) => node.text);
    if (values.length > 0) {
      groupedTags.set(name, values);
    }
  }
  return groupedTags;
}

function parseNhentaiHtmlUploadTime(document) {
  const uploadTimeRaw =
    document.querySelector("time")?.attributes?.["datetime"] || "";
  if (!uploadTimeRaw) {
    return "";
  }
  const parsed = new Date(Date.parse(uploadTimeRaw));
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()} ${parsed.getHours()}:${parsed.getMinutes()}`;
}

function parseNhentaiApiDetails(source, id, data) {
  const title = data?.title?.pretty || data?.title?.english || String(id);
  const englishTitle = data?.title?.english || "";
  const subtitle = englishTitle && englishTitle !== title ? englishTitle : "";
  const cover = source.toAbsoluteMediaUrl(
    data?.cover?.path || data?.thumbnail?.path || "",
    true,
  );

  const comic = new ComicDetails({
    id: String(id),
    title: title || String(id),
    subtitle: subtitle || "",
    cover: cover || "",
    tags: parseNhentaiApiTagMap(source, data.tags || []),
    uploadTime: source.formatTimestamp(data?.upload_date),
    isFavorite: !!data?.is_favorited,
    thumbnails: [],
    related: (data.related || []).map((item) => source.parseComicFromApi(item)),
    url: buildNhentaiGalleryUrl(source, id),
  });
  comic.csrfToken = "";
  return comic;
}

function parseNhentaiHtmlDetails(source, id, document) {
  const coverEl = document.querySelector("div#cover > a > img");
  const cover =
    coverEl?.attributes?.["data-src"] || coverEl?.attributes?.["src"] || "";
  const mainTitle = document.querySelector("h1.title")?.text || "";
  const secondaryTitle = document.querySelector("h2.title")?.text || "";
  const title = secondaryTitle || mainTitle || String(id);
  let subtitle = mainTitle && mainTitle !== title ? mainTitle : "";
  if (!subtitle) {
    subtitle = "";
  }

  const comic = new ComicDetails({
    id: String(id),
    title: title || String(id),
    subtitle,
    cover: cover || "",
    tags: parseNhentaiHtmlTagMap(document),
    uploadTime: parseNhentaiHtmlUploadTime(document),
    isFavorite:
      source.isLogged &&
      document.querySelector("button#favorite > span.text")?.text !== "Favorite",
    thumbnails: document
      .querySelectorAll("a.gallerythumb > img")
      .map((node) => node.attributes?.["data-src"] || node.attributes?.["src"] || "")
      .filter(Boolean),
    related: document.querySelectorAll("div.gallery").map((element) => {
      return source.parseComic(element);
    }),
    url: buildNhentaiGalleryUrl(source, id),
  });

  let csrfToken = "";
  try {
    const script = document.querySelectorAll("script").find((node) => {
      return node.text.includes("csrf_token");
    }).text;
    csrfToken = script.split('csrf_token: "')[1].split('",')[0];
  } catch (_) {}
  comic.csrfToken = csrfToken;
  return comic;
}

function parseNhentaiComments(source, comments) {
  return (comments || []).map((comment) => {
    return new Comment({
      userName: comment.poster.username,
      avatar: source.toAbsoluteMediaUrl(comment.poster.avatar_url, false),
      content: comment.body,
      time:
        typeof comment.post_date === "number"
          ? new Date(comment.post_date * 1000).toISOString()
          : String(comment.post_date),
    });
  });
}
