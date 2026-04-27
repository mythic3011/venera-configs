EhentaiModules.parsers.parseComments = function parseComments(document) {
  let comments = [];
  for (let c of document.querySelectorAll("div.c1")) {
    let name = c.querySelector("div.c3 > a")?.text ?? "";
    let _c3 = c.querySelector("div.c3");
    let _text = _c3 && _c3.text ? _c3.text : null;
    let _posted = _text ? _text.split("Posted on") : [];
    let _afterPosted = _posted.length > 1 ? _posted[1] : "";
    let _byParts = _afterPosted ? _afterPosted.split("by") : [];
    let _afterBy = _byParts.length > 0 ? _byParts[0] : "";
    let time = _afterBy && _afterBy.trim ? _afterBy.trim() : "unknown";
    let content = "";
    if (typeof appVersion !== "undefined") {
      content = c.querySelector("div.c6").innerHTML;
    } else {
      content = c.querySelector("div.c6").text;
    }
    let score = Number(c.querySelector("div.c5 > span")?.text);
    if (isNaN(score)) {
      score = null;
    }
    let id =
      c.previousElementSibling?.attributes["name"]?.match(/\d+/)[0] ?? "0";
    let isUp =
      c.querySelector(`a#comment_vote_up_${id}`)?.attributes["style"]?.length >
      0;
    let isDown =
      c.querySelector(`a#comment_vote_down_${id}`)?.attributes["style"]
        ?.length > 0;

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
};
