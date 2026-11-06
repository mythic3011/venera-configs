function parseRuntimeJsonBody(response, context) {
  try {
    return JSON.parse(response.body);
  } catch (_) {
    const suffix = context ? ` (${context})` : "";
    throw `Invalid JSON response${suffix}`;
  }
}

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

export {
  parseRuntimeJsonBody,
  ensureSelfHostedHttpOk,
  parseSelfHostedJsonBody,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
  };
}
