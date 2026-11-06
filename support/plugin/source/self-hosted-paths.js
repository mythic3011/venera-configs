function stripSelfHostedTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizeSelfHostedPathRoot(path, fallback) {
  const source = String(path || fallback || "").trim();
  if (!source) {
    return "";
  }
  return `/${source.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function normalizeSelfHostedPathSegment(segment) {
  return String(segment == null ? "" : segment).replace(/^\/+|\/+$/g, "");
}

function joinSelfHostedPath(rootPath, segments) {
  const root = normalizeSelfHostedPathRoot(rootPath, "/");
  const list = Array.isArray(segments) ? segments : [];
  let next = root;
  for (const part of list) {
    const cleaned = normalizeSelfHostedPathSegment(part);
    if (!cleaned) {
      continue;
    }
    next = `${next}/${cleaned}`;
  }
  return next;
}

function createSelfHostedRouteHelpers(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const apiRoot = normalizeSelfHostedPathRoot(opts.apiRoot, "/api");
  const archivesRoot = normalizeSelfHostedPathRoot(
    opts.archivesRoot,
    `${apiRoot}/archives`,
  );
  const categoriesRoot = normalizeSelfHostedPathRoot(
    opts.categoriesRoot,
    `${apiRoot}/categories`,
  );
  const searchPath = normalizeSelfHostedPathRoot(
    opts.searchPath,
    `${apiRoot}/search`,
  );

  return {
    apiRoot,
    archivesRoot,
    categoriesRoot,
    searchPath,
    categoriesPath() {
      return categoriesRoot;
    },
    categoryArchivePath(categoryId, archiveId) {
      return joinSelfHostedPath(categoriesRoot, [categoryId, archiveId]);
    },
    archivePath(archiveId) {
      return joinSelfHostedPath(archivesRoot, [archiveId]);
    },
    archiveMetadataPath(archiveId) {
      return joinSelfHostedPath(archivesRoot, [archiveId, "metadata"]);
    },
    archiveThumbnailPath(archiveId) {
      return joinSelfHostedPath(archivesRoot, [archiveId, "thumbnail"]);
    },
    archiveCategoriesPath(archiveId) {
      return joinSelfHostedPath(archivesRoot, [archiveId, "categories"]);
    },
    archiveFilesPath(archiveId) {
      return joinSelfHostedPath(archivesRoot, [archiveId, "files"]);
    },
  };
}

export {
  stripSelfHostedTrailingSlash,
  normalizeSelfHostedPathRoot,
  normalizeSelfHostedPathSegment,
  joinSelfHostedPath,
  createSelfHostedRouteHelpers,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    stripSelfHostedTrailingSlash,
    normalizeSelfHostedPathRoot,
    normalizeSelfHostedPathSegment,
    joinSelfHostedPath,
    createSelfHostedRouteHelpers,
  };
}
