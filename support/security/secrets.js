function withAuthorization(headers, scheme, token) {
  const next = { ...(headers || {}) };
  if (!token) {
    return next;
  }
  next.Authorization = `${scheme} ${token}`;
  return next;
}

function withBearer(headers, token) {
  return withAuthorization(headers, "Bearer", token);
}

function withBasic(headers, token) {
  return withAuthorization(headers, "Basic", token);
}

function encodeSelfHostedToken(rawToken) {
  const raw = String(rawToken || "");
  if (!raw) {
    return "";
  }
  const encoded = Convert.encodeBase64(Convert.encodeUtf8(raw));
  return typeof encoded === "string" ? encoded : Convert.decodeUtf8(encoded);
}

export {
  withAuthorization,
  withBearer,
  withBasic,
  encodeSelfHostedToken,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken,
  };
}
