function ehentaiGetErrorMessage(error) {
  if (error == null) {
    return "Unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }
  return String(error);
}

function ehentaiIsRedirectError(error) {
  return ehentaiGetErrorMessage(error).toLowerCase().includes("redirect");
}

function ehentaiIsAbuseResponseBody(source, body) {
  let text = String((body && body.body) || body || "");
  if (!hasNonWhitespaceText(text)) {
    return true;
  }
  return source._abuseResponsePattern.test(text);
}

function ehentaiFirstNonWhitespaceChar(text) {
  let value = String(text || "");
  for (let i = 0; i < value.length; i++) {
    let code = value.charCodeAt(i);
    if (code !== 32 && code !== 9 && code !== 10 && code !== 13) {
      return value[i];
    }
  }
  return "";
}

function ehentaiFormatRequestError(action, error) {
  let message = ehentaiGetErrorMessage(error);
  let lowered = message.toLowerCase();
  if (lowered.includes("redirect")) {
    return `${action} failed: request was redirected by the server`;
  }
  if (
    lowered.includes("timeout") ||
    lowered.includes("network") ||
    lowered.includes("socket")
  ) {
    return `${action} failed: network error (${message})`;
  }
  return `${action} failed: ${message}`;
}

function ehentaiFormatResponseError(source, action, response) {
  let status = response ? response.status : null;
  let body = String(response && response.body ? response.body : "").trim();
  if (status === 403 || status === 429) {
    return `${action} failed: server returned ${status}`;
  }
  if (body.length === 0) {
    return `${action} failed: empty response from server`;
  }
  if (source.isAbuseResponseBody(body)) {
    return `${action} failed: access was denied by the server`;
  }
  return `${action} failed: invalid status code ${status}`;
}

function ehentaiRequireStatus(source, action, response, expectedStatus) {
  let targetStatus = expectedStatus == null ? 200 : expectedStatus;
  if (!response || response.status !== targetStatus) {
    throw source.formatResponseError(action, response || {});
  }
}

function ehentaiRequireNonEmptyBody(source, action, response) {
  const body = String((response && response.body) || "");
  if (!hasNonWhitespaceText(body)) {
    throw source.formatResponseError(action, response || {});
  }
  return body;
}

function ehentaiRequireHtmlBody(source, action, response) {
  const body = ehentaiRequireNonEmptyBody(source, action, response);
  if (ehentaiFirstNonWhitespaceChar(body) !== "<") {
    throw `${action} failed: invalid HTML response`;
  }
  return body;
}

function ehentaiParseJsonResponse(source, action, response) {
  ehentaiRequireNonEmptyBody(source, action, response);
  try {
    return JSON.parse(response.body);
  } catch (_) {
    throw `${action} failed: invalid JSON response`;
  }
}

async function ehentaiWithDocument(html, parser) {
  const document = new HtmlDocument(html);
  try {
    return await parser(document);
  } finally {
    document.dispose();
  }
}

function ehentaiBuildRequestHeaders(source, method, url, headers, options) {
  const settings = options || {};
  const merged = { ...(headers || {}) };

  if (settings.headerProfile === "json-api" && !merged["Content-Type"]) {
    merged["Content-Type"] = "application/json";
  }

  if (
    settings.headerProfile === "form-urlencoded" &&
    !merged["Content-Type"]
  ) {
    merged["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (settings.headerProfile === "gallery-view" && !merged.cookie) {
    merged.cookie = "nw=1";
  }

  if (settings.headerProfile === "thumbnail" && !merged.referer) {
    merged.referer = source.baseUrl;
  }

  if (settings.headerProfile === "forums-browser") {
    if (!merged.accept) {
      merged.accept =
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
    }
    if (!merged["accept-encoding"]) {
      merged["accept-encoding"] = "gzip, deflate, br";
    }
    if (!merged["accept-language"]) {
      merged["accept-language"] = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7";
    }
  }

  if (settings.refererUrl && !merged.referer) {
    merged.referer = settings.refererUrl;
  }

  if (settings.networkClient === "dart-io" && !merged.http_client) {
    merged.http_client = "dart:io";
  }

  return merged;
}

async function ehentaiCheckEvent(source) {
  if (!source.isLogged) {
    return;
  }
  if (!source.loadSetting("ehevent")) {
    return;
  }
  try {
    const lastEvent = source.loadData("lastEventTime");
    const newTime = new Date().toISOString().split("T")[0];
    if (lastEvent === newTime) {
      return;
    }
    const res = await source.requestClient.get(
      buildEhNewsUrl(),
      {},
      {
        action: "Failed to load event news",
        requestKey: "event-news",
      },
    );
    if (res.status !== 200 || source.isAbuseResponseBody(res.body)) {
      return;
    }
    source.saveData("lastEventTime", newTime);
    await source.withDocument(res.body, async (document) => {
      const eventPane = document.getElementById("eventpane");
      if (eventPane == null) {
        return;
      }
      const dawnInfo = eventPane.querySelector("div > p:nth-child(2)");
      if (dawnInfo == null) {
        return;
      }
      UI.showMessage(dawnInfo.text);
    });
  } catch (_) {}
}

function ehentaiResolveBaseUrl(source) {
  const domain = source.loadSetting("domain");
  if (domain !== source._cachedDomain || !source._cachedBaseUrl) {
    source._cachedDomain = domain;
    source._cachedBaseUrl = buildBaseUrl(domain);
    source._cachedApiUrl = buildApiUrl(source._cachedBaseUrl);
  }
  return source._cachedBaseUrl;
}

function ehentaiResolveApiUrl(source) {
  if (!source._cachedApiUrl) {
    source._cachedApiUrl = buildApiUrl(source.baseUrl);
  }
  return source._cachedApiUrl;
}

function ehentaiParseStarsFromPosition(position) {
  let value = String(position || "");
  let i = 0;
  while (value[i] !== ";") {
    i++;
    if (i === value.length) {
      break;
    }
  }
  switch (value.substring(0, i)) {
    case "background-position:0px -1px":
      return 5;
    case "background-position:0px -21px":
      return 4.5;
    case "background-position:-16px -1px":
      return 4;
    case "background-position:-16px -21px":
      return 3.5;
    case "background-position:-32px -1px":
      return 3;
    case "background-position:-32px -21px":
      return 2.5;
    case "background-position:-48px -1px":
      return 2;
    case "background-position:-48px -21px":
      return 1.5;
    case "background-position:-64px -1px":
      return 1;
    case "background-position:-64px -21px":
      return 0.5;
    default:
      return 0.5;
  }
}

async function ehentaiOnLoadFailed(source, reason) {
  let cookies;
  try {
    cookies = await Network.getCookies(buildEhCookieUrl());
  } catch (error) {
    throw source.formatRequestError("Failed to recover session cookies", error);
  }
  cookies.forEach((cookie) => {
    cookie.domain = ".exhentai.org";
  });
  cookies = cookies.filter((item) => item.name !== "igneous");
  Network.deleteCookies(buildExCookieUrl());
  Network.setCookies(buildExCookieUrl(), cookies);
  let suffix = reason ? ` (${reason})` : "";
  throw `You may not have permission to access this page${suffix}. Please check your network or try to login again.`;
}

async function ehentaiGetGalleries(source, url, isLeaderBoard) {
  try {
    await source.checkEHEvent();
  } catch (_) {}

  let res;
  try {
    res = await source.requestClient.get(
      url,
      {},
      {
        action: "Failed to load gallery list",
        requestKey: `galleries:${url}`,
      },
    );
  } catch (error) {
    if (source.isRedirectError(error)) {
      await source.onLoadFailed("request was redirected");
    }
    throw source.formatRequestError("Failed to load gallery list", error);
  }

  if (res.status !== 200) {
    throw source.formatResponseError("Failed to load gallery list", res);
  }
  if (!hasNonWhitespaceText(res.body)) {
    await source.onLoadFailed("empty response from gallery list");
  }
  if (ehentaiFirstNonWhitespaceChar(res.body) !== "<") {
    if (source.isAbuseResponseBody(res.body)) {
      throw "Your IP address has been banned";
    }
    throw "Failed to load gallery list";
  }

  const document = new HtmlDocument(res.body);
  try {
    return parseGalleryList({
      document,
      source,
      url,
      isLeaderBoard,
    });
  } finally {
    document.dispose();
  }
}
