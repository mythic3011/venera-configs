function buildAddFavoriteForm(folderId) {
  return buildFormBody({
    favcat: folderId,
    favnote: "",
    apply: "Add to Favorites",
    update: 1,
  });
}

function buildDeleteFavoriteForm() {
  return buildFormBody({
    favcat: "favdel",
    favnote: "",
    apply: "Apply Changes",
    update: 1,
  });
}

function buildCommentForm(content) {
  return buildFormBody({
    commenttext_new: content,
  });
}

function buildArchiveDownloadForm(aid) {
  if (aid === "0") {
    return buildFormBody({
      dltype: "org",
      dlcheck: "Download Original Archive",
    });
  }
  if (aid === "1") {
    return buildFormBody({
      dltype: "res",
      dlcheck: "Download Resample Archive",
    });
  }
  throw new Error("Invalid archive type");
}

function buildHathDownloadForm(resolution) {
  return buildFormBody({
    hathdl_xres: resolution,
  });
}
