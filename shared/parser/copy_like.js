function unwrapCopyLikeComic(rawComic) {
  if (rawComic && rawComic.comic != null) {
    return rawComic.comic;
  }
  return rawComic || {};
}

function parseCopyLikeThemeTags(comic) {
  if (!comic || !Array.isArray(comic.theme)) {
    return [];
  }
  return comic.theme.map((item) => item && item.name).filter((name) => name != null);
}

function parseCopyLikePrimaryAuthor(comic) {
  if (!comic || !Array.isArray(comic.author) || comic.author.length === 0) {
    return null;
  }
  return comic.author[0] && comic.author[0].name ? comic.author[0].name : null;
}

function parseCopyLikeAuthorCount(comic) {
  if (!comic || !Array.isArray(comic.author)) {
    return 0;
  }
  return comic.author.length;
}

function formatCopyLikeRankingDescription(sourceComic, author, authorCount) {
  const sort = sourceComic && sourceComic.sort != null ? sourceComic.sort : null;
  if (sort == null) {
    return null;
  }

  const riseSort = sourceComic.rise_sort || 0;
  const popular = Number(sourceComic.popular || 0);
  const trend = riseSort > 0 ? "▲" : riseSort < 0 ? "▽" : "-";
  const authorLine = authorCount > 1 ? `${author} 等${authorCount}位` : author;
  return `${sort} ${trend}\n${authorLine}\n🔥${(popular / 10000).toFixed(1)}W`;
}

function createCopyLikeComicParser(options) {
  const settings = options || {};
  return (rawComic) => {
    const comic = unwrapCopyLikeComic(rawComic);
    const author = parseCopyLikePrimaryAuthor(comic);
    const authorCount = parseCopyLikeAuthorCount(comic);

    const result = {
      id: comic.path_word,
      title: comic.name,
      subTitle: author,
      cover: comic.cover,
      tags: parseCopyLikeThemeTags(comic),
    };

    if (settings.includeRankingDescription) {
      const rankingDescription = formatCopyLikeRankingDescription(rawComic, author, authorCount);
      if (rankingDescription != null) {
        result.description = rankingDescription;
        return result;
      }
    }

    if (settings.includeUpdateDescription) {
      result.description = comic.datetime_updated;
    }

    if (typeof settings.describe === "function") {
      const described = settings.describe({
        sourceComic: rawComic,
        comic,
        author,
        authorCount,
      });
      if (described != null) {
        result.description = described;
      }
    }

    return result;
  };
}

function readCopyLikePath(root, path, fallbackValue) {
  if (!Array.isArray(path) || path.length === 0) {
    return root;
  }
  let cursor = root;
  for (const key of path) {
    if (cursor == null || typeof cursor !== "object" || !(key in cursor)) {
      return fallbackValue;
    }
    cursor = cursor[key];
  }
  return cursor;
}

function computeCopyLikeMaxPage(total, divisor) {
  const base = Number.isFinite(Number(divisor)) && Number(divisor) > 0 ? Number(divisor) : 21;
  const safeTotal = Number.isFinite(Number(total)) ? Number(total) : 0;
  return Math.floor((safeTotal - (safeTotal % base)) / base) + 1;
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    unwrapCopyLikeComic,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    createCopyLikeComicParser,
    readCopyLikePath,
    computeCopyLikeMaxPage,
  };
}
