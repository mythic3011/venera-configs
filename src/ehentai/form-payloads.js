EhentaiModules.buildAddFavoriteForm = function buildAddFavoriteForm(folderId) {
  return EhentaiModules.buildFormBody({
    favcat: folderId,
    favnote: "",
    apply: "Add to Favorites",
    update: 1,
  });
};

EhentaiModules.buildDeleteFavoriteForm = function buildDeleteFavoriteForm() {
  return EhentaiModules.buildFormBody({
    favcat: "favdel",
    favnote: "",
    apply: "Apply Changes",
    update: 1,
  });
};

EhentaiModules.buildCommentForm = function buildCommentForm(content) {
  return EhentaiModules.buildFormBody({
    commenttext_new: content,
  });
};

EhentaiModules.buildArchiveDownloadForm = function buildArchiveDownloadForm(aid) {
  if (aid === "0") {
    return EhentaiModules.buildFormBody({
      dltype: "org",
      dlcheck: "Download Original Archive",
    });
  }
  if (aid === "1") {
    return EhentaiModules.buildFormBody({
      dltype: "res",
      dlcheck: "Download Resample Archive",
    });
  }
  throw new Error("Invalid archive type");
};

EhentaiModules.buildHathDownloadForm = function buildHathDownloadForm(resolution) {
  return EhentaiModules.buildFormBody({
    hathdl_xres: resolution,
  });
};
