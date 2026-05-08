function parseArchiveOptions(document, baseUrl) {
  function safeText(node, fallback) {
    if (node && typeof node.text === "string") {
      return node.text;
    }
    return fallback;
  }

  let body = document.querySelector("div#db");
  let index = baseUrl.includes("exhentai") ? 1 : 3;
  let archives = [];

  let hathTable = document.querySelector("table");
  if (hathTable) {
    let hathCells = hathTable.querySelectorAll("td");
    for (let cell of hathCells) {
      let link = cell.querySelector("a");
      if (link) {
        let onclick = link.attributes ? link.attributes["onclick"] : null;
        let resolutionMatch = onclick ? onclick.match(/do_hathdl\('([^']+)'\)/) : null;
        if (resolutionMatch) {
          let resolution = resolutionMatch[1];
          let linkText = safeText(link, "Unknown");
          let paragraphs = cell.querySelectorAll("p");
          let size = paragraphs.length > 1 ? safeText(paragraphs[1], "Unknown") : "Unknown";
          let cost = paragraphs.length > 2 ? safeText(paragraphs[2], "Unknown") : "Unknown";
          archives.push({
            id: `h@h_${resolution}`,
            title: `H@H ${linkText}`,
            description: `Size: ${size}, Cost: ${cost}`,
          });
        }
      }
    }
  }

  let origin = null;
  if (body && body.children.length > index && body.children[index].children.length > 0) {
    origin = body.children[index].children[0];
  }
  if (origin) {
    let originCost = safeText(origin.querySelector("div > strong"), "Unknown");
    let originSize = safeText(origin.querySelector("p > strong"), "Unknown");
    archives.push({
      id: "0",
      title: "Original",
      description: `Cost: ${originCost}, Size: ${originSize}`,
    });
  }

  let resample = null;
  if (body && body.children.length > index && body.children[index].children.length > 1) {
    resample = body.children[index].children[1];
  }
  if (resample) {
    let resampleCost = safeText(resample.querySelector("div > strong"), "Unknown");
    let resampleSize = safeText(resample.querySelector("p > strong"), "Unknown");
    archives.push({
      id: "1",
      title: "Resample",
      description: `Cost: ${resampleCost}, Size: ${resampleSize}`,
    });
  }

  return archives;
}

function parseArchiveError(document) {
  let node = document.querySelector("p.br");
  return node && typeof node.text === "string" ? node.text : null;
}

function parseFirstLink(document) {
  let node = document.querySelector("a");
  if (node && node.attributes && node.attributes["href"]) {
    return node.attributes["href"];
  }
  return null;
}
