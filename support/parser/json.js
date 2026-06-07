function unwrapCopyLikeComic(rawComic) {
  if (rawComic && rawComic.comic != null) {
    return rawComic.comic;
  }
  return rawComic || {};
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

export {
  unwrapCopyLikeComic,
  readCopyLikePath,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    unwrapCopyLikeComic,
    readCopyLikePath,
  };
}
