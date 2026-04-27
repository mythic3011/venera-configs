EhentaiModules.parsers.parseComments = function parseComments(document) {
  let comments = [];
  for (let c of document.querySelectorAll("div.c1")) {
    let name = c.querySelector("div.c3 > a")?.text ?? "";
    let time =
      c
        .querySelector("div.c3")
        ?.text?.split("Posted on")
        ?.at(1)
        ?.split("by")
        ?.at(0)
        ?.trim() ?? "unknown";
    let content = "";
    if (typeof appVersion) {
      content = c.querySelector("div.c6").innerHTML;
    } else {
      content = c.querySelector("div.c6").text;
    }
    let score = Number(c.querySelector("div.c5 > span")?.text);
    if (isNaN(score)) {
      score = null;
    }
    let id = c.previousElementSibling?.attributes["name"]?.match(/\d+/)[0] ?? "0";
    let isUp =
      c.querySelector(`a#comment_vote_up_${id}`)?.attributes["style"]?.length > 0;
    let isDown =
      c.querySelector(`a#comment_vote_down_${id}`)?.attributes["style"]?.length > 0;

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
