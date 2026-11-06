function runtimeGet(url, headers) {
  return Network.get(url, headers);
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

function defaultManagedDomainKey(url) {
  try {
    return new URL(String(url || "")).hostname || "default";
  } catch (_) {
    return "default";
  }
}

function defaultManagedDispatch(method, url, headers, body) {
  if (method === "GET") {
    return Network.get(url, headers);
  }
  if (method === "POST") {
    return Network.post(url, headers, body);
  }
  return Network.sendRequest(method, url, headers, body);
}

function defaultManagedRequestError(source, action, error) {
  if (source && typeof source.formatRequestError === "function") {
    return source.formatRequestError(action, error);
  }
  return `${action}: ${String(error)}`;
}

function defaultManagedResponseError(source, action, response) {
  if (source && typeof source.formatResponseError === "function") {
    return source.formatResponseError(action, response);
  }
  return `${action}: status=${response && response.status}`;
}

function normalizeManagedRequestHooks(hooks) {
  return hooks && typeof hooks === "object" && !Array.isArray(hooks)
    ? hooks
    : {};
}

function ManagedRequestClient(source, hooks) {
  if (!source || typeof source !== "object") {
    throw new Error("ManagedRequestClient requires plugin source");
  }
  if (!source.requestState || typeof source.requestState !== "object") {
    throw new Error("ManagedRequestClient requires source.requestState");
  }
  this.source = source;
  this.hooks = normalizeManagedRequestHooks(hooks);
}

ManagedRequestClient.prototype.get = function (url, headers, options) {
  return this.send("GET", url, headers || {}, null, options || {});
};

ManagedRequestClient.prototype.post = function (url, headers, body, options) {
  return this.send("POST", url, headers || {}, body == null ? null : body, options || {});
};

ManagedRequestClient.prototype.head = function (url, headers, options) {
  return this.send("HEAD", url, headers || {}, null, options || {});
};

ManagedRequestClient.prototype.send = async function (
  method,
  url,
  headers,
  body,
  options,
) {
  const source = this.source;
  const settings =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const isMutation =
    settings.mutation == null ? method !== "GET" : settings.mutation === true;
  const requestKey =
    settings.requestKey ||
    defaultRequestKey(method, url, body, isMutation);
  const domainKeyResolver =
    typeof this.hooks.domainKeyResolver === "function"
      ? this.hooks.domainKeyResolver
      : defaultManagedDomainKey;
  const resolved = {
    action: settings.action || `${method} ${url}`,
    requestKey,
    domainKey:
      settings.domainKey ||
      domainKeyResolver(url, method, body, settings, source, this),
    expectedStatus:
      settings.expectedStatus == null ? 200 : settings.expectedStatus,
    maxRetries:
      settings.maxRetries == null
        ? method === "GET"
          ? 1
          : 0
        : settings.maxRetries,
    cooldownMs:
      settings.cooldownMs == null ? 60000 : settings.cooldownMs,
    classifyBody:
      settings.classifyBody == null ? true : settings.classifyBody,
    mutation: isMutation,
    allowDedup:
      settings.allowDedup == null ? !isMutation : settings.allowDedup,
  };

  const cooldownUntil = source.requestState.cooldownUntil.get(
    resolved.domainKey,
  );
  if (cooldownUntil && cooldownUntil > Date.now()) {
    throw `${resolved.action} blocked: temporary cooldown in effect`;
  }

  const finalHeaders = this._resolveHeaders(method, url, headers || {}, resolved);
  const inflightKey = resolved.requestKey;

  if (
    resolved.allowDedup &&
    inflightKey &&
    source.requestState.inflight.has(inflightKey)
  ) {
    return source.requestState.inflight.get(inflightKey);
  }

  const run = createDomainQueue(source.requestState, resolved.domainKey, () => {
    return this._sendWithRetry(method, url, finalHeaders, body, resolved);
  });

  if (resolved.allowDedup && inflightKey) {
    source.requestState.inflight.set(inflightKey, run);
  }

  try {
    return await run;
  } finally {
    if (resolved.allowDedup && inflightKey) {
      source.requestState.inflight.delete(inflightKey);
    }
  }
};

ManagedRequestClient.prototype._resolveHeaders = function (
  method,
  url,
  headers,
  options,
) {
  if (typeof this.hooks.buildHeaders === "function") {
    return this.hooks.buildHeaders(
      method,
      url,
      headers,
      options,
      this.source,
      this,
    );
  }
  if (this.source && typeof this.source.buildRequestHeaders === "function") {
    return this.source.buildRequestHeaders(
      method,
      url,
      headers || {},
      options || {},
    );
  }
  return headers || {};
};

ManagedRequestClient.prototype._sendWithRetry = async function (
  method,
  url,
  headers,
  body,
  options,
) {
  let attempt = 0;
  const maxAttempts = Math.max(0, options.maxRetries) + 1;

  while (attempt < maxAttempts) {
    attempt += 1;
    let response;
    try {
      response = await this._dispatch(method, url, headers, body, options);
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw defaultManagedRequestError(this.source, options.action, error);
      }
      continue;
    }

    if (this._shouldCooldown(response, options)) {
      this._markCooldown(options.domainKey, options.cooldownMs);
      throw defaultManagedResponseError(this.source, options.action, response);
    }

    if (response.status !== options.expectedStatus) {
      if (attempt >= maxAttempts || options.mutation) {
        throw defaultManagedResponseError(this.source, options.action, response);
      }
      continue;
    }

    return response;
  }

  throw `${options.action} failed after retries`;
};

ManagedRequestClient.prototype._dispatch = function (
  method,
  url,
  headers,
  body,
  options,
) {
  if (typeof this.hooks.dispatch === "function") {
    return this.hooks.dispatch(
      method,
      url,
      headers,
      body,
      options,
      this.source,
      this,
    );
  }
  return defaultManagedDispatch(method, url, headers, body);
};

ManagedRequestClient.prototype._shouldCooldown = function (response, options) {
  if (response.status === 403 || response.status === 429) {
    return true;
  }
  if (!options.classifyBody) {
    return false;
  }

  const body = String((response && response.body) || "");
  if (!hasNonWhitespaceText(body)) {
    return false;
  }

  if (typeof this.hooks.shouldCooldown === "function") {
    return this.hooks.shouldCooldown(response, options, this.source, this);
  }
  if (
    this.source &&
    typeof this.source.isAbuseResponseBody === "function"
  ) {
    return this.source.isAbuseResponseBody(body);
  }
  return false;
};

ManagedRequestClient.prototype._markCooldown = function (domainKey, cooldownMs) {
  markCooldown(this.source.requestState, domainKey, cooldownMs);
};

function createManagedRequestClient(source, hooks) {
  return new ManagedRequestClient(source, hooks);
}

export {
  runtimeGet,
  getRuntimeJson,
  getRuntimeDocument,
  getSelfHostedJson,
  postSelfHostedJson,
  ManagedRequestClient,
  createManagedRequestClient,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    runtimeGet,
    getRuntimeJson,
    getRuntimeDocument,
    getSelfHostedJson,
    postSelfHostedJson,
    ManagedRequestClient,
    createManagedRequestClient,
  };
}
