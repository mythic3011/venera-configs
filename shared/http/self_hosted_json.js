function ensureSelfHostedHttpOk(res, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const unauthorizedMessage = opts.unauthorizedMessage || "Login expired";
  const requestFailedMessage = opts.requestFailedMessage || "请求失败";

  if (!res) {
    throw requestFailedMessage;
  }

  if (res.status === 401 || res.status === 403) {
    throw unauthorizedMessage;
  }

  if (res.status < 200 || res.status >= 300) {
    throw `${requestFailedMessage}: ${res.status}`;
  }
}

function parseSelfHostedJsonBody(body) {
  if (!body) {
    return null;
  }
  return JSON.parse(body);
}

async function getSelfHostedJson(source, path, query, options) {
  if (!source || typeof source !== "object") {
    throw new Error("getSelfHostedJson requires plugin source");
  }
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const headers = opts.headers || source.headers;
  const res = await Network.get(source.buildUrl(path, query), headers);
  ensureSelfHostedHttpOk(res, opts);
  return parseSelfHostedJsonBody(res.body);
}

async function postSelfHostedJson(source, path, query, payload, options) {
  if (!source || typeof source !== "object") {
    throw new Error("postSelfHostedJson requires plugin source");
  }
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const headers = opts.headers || source.headers;
  const res = await Network.post(
    source.buildUrl(path, query),
    headers,
    payload,
  );
  ensureSelfHostedHttpOk(res, opts);
  return {
    body: parseSelfHostedJsonBody(res.body),
    headers: res.headers || {},
  };
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    getSelfHostedJson,
    postSelfHostedJson,
  };
}
