function parseDispatchKey(document) {
  function safeText(node) {
    return node && typeof node.text === "string" ? node.text : "";
  }

  let scripts = document.querySelectorAll("script");
  let showScript = null;
  let mpvScriptNode = null;
  for (let script of scripts) {
    let text = safeText(script);
    if (!showScript && text.includes("showkey")) {
      showScript = script;
    }
    if (!mpvScriptNode && text.includes("mpvkey")) {
      mpvScriptNode = script;
    }
    if (showScript && mpvScriptNode) {
      break;
    }
  }

  if (showScript) {
    let reg = RegExp('showkey="(.*?)"', "g");
    let match = reg.exec(safeText(showScript));
    if (match) {
      return { showkey: match[1] };
    }
  }

  let scriptText = safeText(mpvScriptNode);
  if (scriptText) {
    let mpvkey = "";
    let imageKeys = [];
    let statements = scriptText.split(";");

    let mpvStatement = statements.find((e) => e.includes("mpvkey"));
    if (mpvStatement) {
      let cleaned = mpvStatement.replace(/ /g, "");
      let parts = cleaned.split("=");
      if (parts.length > 1) {
        mpvkey = parts[1].replace(/"/g, "");
      }
    }

    let imageStatement = statements.find((e) => e.includes("imagelist"));
    if (imageStatement) {
      let cleaned = imageStatement.replace(/ /g, "");
      let parts = cleaned.split("=");
      if (parts.length > 1) {
        try {
          let parsed = JSON.parse(parts[1]);
          imageKeys = Array.isArray(parsed)
            ? parsed.map((e) => (e && typeof e.k !== "undefined" ? e.k : null)).filter((k) => k != null)
            : [];
        } catch (_) {
          imageKeys = [];
        }
      }
    }

    if (mpvkey || imageKeys.length > 0) {
      return { mpvkey, imageKeys };
    }
  }

  throw "Failed to get dispatch key";
}
