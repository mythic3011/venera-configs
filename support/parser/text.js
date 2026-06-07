function parseCopyLikeThemeTags(comic) {
  if (!comic || !Array.isArray(comic.theme)) {
    return [];
  }
  return comic.theme
    .map((item) => item && item.name)
    .filter((name) => name != null);
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

function computeCopyLikeMaxPage(total, divisor) {
  const base =
    Number.isFinite(Number(divisor)) && Number(divisor) > 0
      ? Number(divisor)
      : 21;
  const safeTotal = Number.isFinite(Number(total)) ? Number(total) : 0;
  return Math.floor((safeTotal - (safeTotal % base)) / base) + 1;
}

export {
  parseCopyLikeThemeTags,
  parseCopyLikePrimaryAuthor,
  parseCopyLikeAuthorCount,
  formatCopyLikeRankingDescription,
  computeCopyLikeMaxPage,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    parseCopyLikeThemeTags,
    parseCopyLikePrimaryAuthor,
    parseCopyLikeAuthorCount,
    formatCopyLikeRankingDescription,
    computeCopyLikeMaxPage,
  };
}
