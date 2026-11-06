function ehSafeText(node, fallback) {
  if (node && typeof node.text === "string") {
    return node.text;
  }
  return fallback;
}

function ehSafeAttr(node, key, fallback) {
  if (node && node.attributes && typeof node.attributes[key] !== "undefined") {
    return node.attributes[key];
  }
  return fallback;
}
