EhentaiModules.parsers.parseDispatchKey = function parseDispatchKey(document) {
  let script = document.querySelectorAll("script").find((e) => e.text.includes("showkey"));
  if (script) {
    let reg = RegExp('showkey="(.*?)"', "g");
    let match = reg.exec(script.text);
    if (match) {
      return { showkey: match[1] };
    }
  }

  script = document.querySelectorAll("script").find((e) => e.text.includes("mpvkey"))?.text;
  if (script) {
    let mpvkey = script
      .split(";")
      .find((e) => e.includes("mpvkey"))
      .replaceAll(" ", "")
      .split("=")[1]
      .replaceAll('"', "");
    let imageList = script
      .split(";")
      .find((e) => e.includes("imagelist"))
      .replaceAll(" ", "")
      .split("=")[1];
    return {
      mpvkey,
      imageKeys: JSON.parse(imageList).map((e) => e.k),
    };
  }

  throw "Failed to get dispatch key";
};
