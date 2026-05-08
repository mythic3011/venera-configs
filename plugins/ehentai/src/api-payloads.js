function buildRateGalleryPayload({
  galleryId,
  token,
  rating,
  apikey,
  apiuid,
}) {
  return {
    gid: galleryId,
    token,
    method: "rategallery",
    rating,
    apikey,
    apiuid,
  };
}

function buildVoteCommentPayload({
  galleryId,
  token,
  commentId,
  isUp,
  apikey,
  apiuid,
}) {
  return {
    gid: galleryId,
    token,
    method: "votecomment",
    comment_id: commentId,
    comment_vote: isUp ? 1 : -1,
    apikey,
    apiuid,
  };
}

function buildImageDispatchPayload({
  galleryId,
  imgKey,
  page,
  mpvkey,
  nl,
}) {
  return {
    gid: galleryId,
    imgkey: imgKey,
    method: "imagedispatch",
    page,
    mpvkey,
    nl,
  };
}

function buildShowPagePayload({
  galleryId,
  imgKey,
  page,
  showkey,
  nl,
}) {
  return {
    gid: galleryId,
    imgkey: imgKey,
    method: "showpage",
    page,
    showkey,
    nl,
  };
}
