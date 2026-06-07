import {
  unwrapCopyLikeComic,
  readCopyLikePath,
} from "./json.js";
import {
  parseCopyLikeThemeTags,
  parseCopyLikePrimaryAuthor,
  parseCopyLikeAuthorCount,
  formatCopyLikeRankingDescription,
  computeCopyLikeMaxPage,
} from "./text.js";
import { createHtmlDocument } from "./html.js";

const parserCopyLikeApi = {
  unwrapCopyLikeComic,
  readCopyLikePath,
  parseCopyLikeThemeTags,
  parseCopyLikePrimaryAuthor,
  parseCopyLikeAuthorCount,
  formatCopyLikeRankingDescription,
  computeCopyLikeMaxPage,
  createCopyLikeComicParser,
};

const parserHtmlApi = {
  createHtmlDocument,
};

const parserSupportApi = {
  ...parserCopyLikeApi,
  ...parserHtmlApi,
};

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
      const rankingDescription = formatCopyLikeRankingDescription(
        rawComic,
        author,
        authorCount,
      );
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

export {
  unwrapCopyLikeComic,
  readCopyLikePath,
  parseCopyLikeThemeTags,
  parseCopyLikePrimaryAuthor,
  parseCopyLikeAuthorCount,
  formatCopyLikeRankingDescription,
  computeCopyLikeMaxPage,
  createCopyLikeComicParser,
  createHtmlDocument,
  parserCopyLikeApi,
  parserHtmlApi,
  parserSupportApi,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    unwrapCopyLikeComic,
    readCopyLikePath,
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
    createCopyLikeComicParser,
    createHtmlDocument,
    parserCopyLikeApi,
    parserHtmlApi,
    parserSupportApi,
  };
}
