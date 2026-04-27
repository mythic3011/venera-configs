EhentaiModules.parsers.parseArchiveOptions = function parseArchiveOptions(document, baseUrl) {
  let body = document.querySelector("div#db");
  let index = baseUrl.includes("exhentai") ? 1 : 3;
  let archives = [];

  let hathTable = document.querySelector("table");
  if (hathTable) {
    let hathCells = hathTable.querySelectorAll("td");
    for (let cell of hathCells) {
      let link = cell.querySelector("a");
      if (link) {
        let onclick = link.attributes["onclick"];
        let resolutionMatch = onclick.match(/do_hathdl\('([^']+)'\)/);
        if (resolutionMatch) {
          let resolution = resolutionMatch[1];
          let linkText = link.text;
          let paragraphs = cell.querySelectorAll("p");
          let size = paragraphs.length > 1 ? paragraphs[1].text : "Unknown";
          let cost = paragraphs.length > 2 ? paragraphs[2].text : "Unknown";
          archives.push({
            id: `h@h_${resolution}`,
            title: `H@H ${linkText}`,
            description: `Size: ${size}, Cost: ${cost}`,
          });
        }
      }
    }
  }

  let origin = body.children[index]?.children[0];
  if (origin) {
    let originCost = origin.querySelector("div > strong")?.text || "Unknown";
    let originSize = origin.querySelector("p > strong")?.text || "Unknown";
    archives.push({
      id: "0",
      title: "Original",
      description: `Cost: ${originCost}, Size: ${originSize}`,
    });
  }

  let resample = body.children[index]?.children[1];
  if (resample) {
    let resampleCost = resample.querySelector("div > strong")?.text || "Unknown";
    let resampleSize = resample.querySelector("p > strong")?.text || "Unknown";
    archives.push({
      id: "1",
      title: "Resample",
      description: `Cost: ${resampleCost}, Size: ${resampleSize}`,
    });
  }

  return archives;
};

EhentaiModules.parsers.parseArchiveError = function parseArchiveError(document) {
  return document.querySelector("p.br")?.text || null;
};

EhentaiModules.parsers.parseFirstLink = function parseFirstLink(document) {
  return document.querySelector("a")?.attributes["href"] || null;
};
