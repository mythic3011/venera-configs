async function runtimeGet(url, headers) {
  return Network.get(url, headers);
}

function parseRuntimeJsonBody(response, context) {
  try {
    return JSON.parse(response.body);
  } catch (_) {
    const suffix = context ? ` (${context})` : "";
    throw `Invalid JSON response${suffix}`;
  }
}

async function getRuntimeJson(url, headers, context) {
  const response = await runtimeGet(url, headers);
  assertRuntimeStatus(response, 200, context || url);
  return parseRuntimeJsonBody(response, context || url);
}

async function getRuntimeDocument(url, headers, context) {
  const response = await runtimeGet(url, headers);
  assertRuntimeStatus(response, 200, context || url);
  return new HtmlDocument(response.body);
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    runtimeGet,
    parseRuntimeJsonBody,
    getRuntimeJson,
    getRuntimeDocument,
  };
}
