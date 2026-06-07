function wrapNhentaiMediaRequest(url) {
  if (!url) {
    return { url: "" };
  }

  let normalizedUrl = String(url).replace(/(\.(jpg|png|webp|gif))+/g, (match) => {
    return match.match(/\.(jpg|png|webp|gif)/g)[0];
  });

  if (normalizedUrl.includes("/cover.")) {
    normalizedUrl = normalizedUrl.replace(
      /https?:\/\/[it]\d\.nhentai\.net/,
      "https://t3.nhentai.net",
    );
  }

  if (normalizedUrl.startsWith("//")) {
    normalizedUrl = "https:" + normalizedUrl;
  }

  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = "https://" + normalizedUrl.replace(/^\/+/, "");
  }

  return {
    url: normalizedUrl,
    headers: {
      Referer: "https://nhentai.net/",
      "User-Agent": "Mozilla/5.0",
    },
  };
}

function toNhentaiAbsoluteMediaUrl(source, path, isThumb = false) {
  if (!path) {
    return path;
  }
  if (path.startsWith("http")) {
    return path;
  }
  if (path.startsWith("//")) {
    return "https:" + path;
  }

  let normalizedPath = path;
  if (normalizedPath.startsWith("/")) {
    normalizedPath = normalizedPath.slice(1);
  }
  if (normalizedPath.includes("cover") || normalizedPath.includes("thumb")) {
    isThumb = true;
  }

  return `${isThumb ? source.thumbServer : source.imageServer}/${normalizedPath}`;
}

function getNhentaiMediaExtensionFromPath(path) {
  const normalizedPath = String(path || "");
  if (normalizedPath.includes(".webp")) {
    return "webp";
  }
  if (normalizedPath.includes(".png")) {
    return "png";
  }
  if (normalizedPath.includes(".gif")) {
    return "gif";
  }
  return "jpg";
}

function getNhentaiMediaExtensionFromToken(token) {
  switch (token) {
    case "p":
      return "png";
    case "g":
      return "gif";
    case "w":
      return "webp";
    default:
      return "jpg";
  }
}

function buildNhentaiGalleryImageUrl(source, mediaId, pageIndex, extension) {
  return `${source.imageServer}/galleries/${mediaId}/${pageIndex + 1}.${extension}`;
}

function buildNhentaiApiImages(source, apiData) {
  if (!apiData?.pages || !apiData?.media_id) {
    return [];
  }
  return apiData.pages.map((page, index) => {
    return buildNhentaiGalleryImageUrl(
      source,
      apiData.media_id,
      index,
      getNhentaiMediaExtensionFromPath(page.path || ""),
    );
  });
}

function parseNhentaiGalleryScriptPayload(document) {
  let mediaId = null;
  let pages = [];

  for (const script of document.querySelectorAll("script")) {
    if (!script?.text) {
      continue;
    }

    if (script.text.includes("window._gallery")) {
      try {
        const jsonMatch = script.text.match(/JSON\.parse\(["']([^"']+)["']\)/);
        if (jsonMatch?.[1]) {
          const decodedJsonText = jsonMatch[1]
            .replaceAll("\\u0022", '"')
            .replaceAll("\\u005C", "\\");
          const data = JSON.parse(decodedJsonText);
          if (data.media_id && data.images?.pages) {
            return {
              mediaId: data.media_id,
              pages: data.images.pages,
            };
          }
        }
      } catch (_) {}
    }

    if (script.text.includes("media_id")) {
      try {
        const mediaIdMatch = script.text.match(/media_id:\s*(\d+)/);
        const pagesMatch = script.text.match(/pages:\s*\[(.*?)\]/s);
        if (mediaIdMatch && pagesMatch) {
          mediaId = mediaIdMatch[1];
          const pageMatches = pagesMatch[1].match(/\{[^}]+\}/g);
          if (pageMatches) {
            pages = pageMatches.map((pageText) => {
              const typeMatch = pageText.match(/t:\s*['"]([^'"]+)['"]/);
              return { t: typeMatch ? typeMatch[1] : "j" };
            });
            return { mediaId, pages };
          }
        }
      } catch (_) {}
    }
  }

  return { mediaId, pages };
}

function extractNhentaiInlineImageUrls(source, document) {
  return document
    .querySelectorAll("img.lazyload")
    .map((img) => img.attributes?.["data-src"] || img.attributes?.["src"] || "")
    .filter((url) => url && url.includes("nhentai.net"))
    .map((url) => source.toAbsoluteMediaUrl(url, false));
}
