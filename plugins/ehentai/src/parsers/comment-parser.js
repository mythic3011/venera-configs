function parseComments(document) {
  let comments = [];
  for (let c of document.querySelectorAll("div.c1")) {
    let name = ehSafeText(c.querySelector("div.c3 > a"), "");
    let _c3 = c.querySelector("div.c3");
    let _text = _c3 && _c3.text ? _c3.text : null;
    let _posted = _text ? _text.split("Posted on") : [];
    let _afterPosted = _posted.length > 1 ? _posted[1] : "";
    let _byParts = _afterPosted ? _afterPosted.split("by") : [];
    let _afterBy = _byParts.length > 0 ? _byParts[0] : "";
    let time = _afterBy && _afterBy.trim ? _afterBy.trim() : "unknown";
    let content = "";
    let contentNode = c.querySelector("div.c6");
    if (typeof appVersion !== "undefined") {
      content = contentNode && typeof contentNode.innerHTML === "string" ? contentNode.innerHTML : "";
    } else {
      content = ehSafeText(contentNode, "");
    }
    let score = Number(ehSafeText(c.querySelector("div.c5 > span"), ""));
    if (isNaN(score)) {
      score = null;
    }
    let id = "0";
    let previousName = ehSafeAttr(c.previousElementSibling, "name");
    let idMatch = previousName ? previousName.match(/\d+/) : null;
    if (idMatch) {
      id = idMatch[0];
    }

    let upStyle = ehSafeAttr(c.querySelector(`a#comment_vote_up_${id}`), "style");
    let downStyle = ehSafeAttr(c.querySelector(`a#comment_vote_down_${id}`), "style");
    let isUp = typeof upStyle === "string" && upStyle.length > 0;
    let isDown = typeof downStyle === "string" && downStyle.length > 0;

    comments.push(
      new Comment({
        id,
        content,
        time,
        userName: name,
        score,
        voteStatus: isUp ? 1 : isDown ? -1 : 0,
      }),
    );
  }

  return {
    comments,
    maxPage: 1,
  };
}
