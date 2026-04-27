class EhentaiRequestClient {
  constructor(source) {
    this.source = source;
  }

  get(url, headers = {}, options = {}) {
    return this.send("GET", url, headers, null, options);
  }

  post(url, headers = {}, body = null, options = {}) {
    return this.send("POST", url, headers, body, options);
  }

  head(url, headers = {}, options = {}) {
    return this.send("HEAD", url, headers, null, options);
  }

  async send(method, url, headers = {}, body = null, options = {}) {
    const defaultRequestKey = `${method}:${url}`;
    const resolved = {
      action: options.action || `${method} ${url}`,
      requestKey: options.requestKey || defaultRequestKey,
      domainKey: options.domainKey || domainKey(url),
      expectedStatus: options.expectedStatus ?? 200,
      maxRetries: options.maxRetries ?? (options.mutation ? 0 : 0),
      cooldownMs: options.cooldownMs ?? 60000,
      classifyBody: options.classifyBody ?? true,
      mutation: options.mutation ?? method !== "GET",
    };

    const cooldownUntil = this.source.requestState.cooldownUntil.get(
      resolved.domainKey,
    );
    if (cooldownUntil && cooldownUntil > Date.now()) {
      throw `${resolved.action} blocked: temporary cooldown in effect`;
    }

    const inflightKey = resolved.requestKey;
    const finalHeaders = this._resolveHeaders(method, url, headers, resolved);
    if (this.source.requestState.inflight.has(inflightKey)) {
      return this.source.requestState.inflight.get(inflightKey);
    }

    const run = this._enqueueByDomain(resolved.domainKey, () =>
      this._sendWithRetry(method, url, finalHeaders, body, resolved),
    );

    this.source.requestState.inflight.set(inflightKey, run);
    try {
      return await run;
    } finally {
      this.source.requestState.inflight.delete(inflightKey);
    }
  }

  _enqueueByDomain(domainKey, task) {
    const tail = this.source.requestState.queues.get(domainKey) || Promise.resolve();
    const run = tail.then(task, task);
    const queueNext = run.then(
      () => undefined,
      () => undefined,
    );
    this.source.requestState.queues.set(domainKey, queueNext);
    queueNext.finally(() => {
      if (this.source.requestState.queues.get(domainKey) === queueNext) {
        this.source.requestState.queues.delete(domainKey);
      }
    });
    return run;
  }

  async _sendWithRetry(method, url, headers, body, options) {
    let attempt = 0;
    const maxAttempts = Math.max(0, options.maxRetries) + 1;

    while (attempt < maxAttempts) {
      attempt += 1;
      let response;
      try {
        response = await this._dispatch(method, url, headers, body);
      } catch (error) {
        if (attempt >= maxAttempts) {
          throw this.source.formatRequestError(options.action, error);
        }
        continue;
      }

      if (this._shouldCooldown(response, options)) {
        this._markCooldown(options.domainKey, options.cooldownMs);
        throw this.source.formatResponseError(options.action, response);
      }

      if (response.status !== options.expectedStatus) {
        if (attempt >= maxAttempts || options.mutation) {
          throw this.source.formatResponseError(options.action, response);
        }
        continue;
      }

      return response;
    }

    throw `${options.action} failed after retries`;
  }

  _resolveHeaders(method, url, headers, options) {
    if (typeof this.source.buildRequestHeaders === "function") {
      return this.source.buildRequestHeaders(
        method,
        url,
        headers || {},
        options || {},
      );
    }
    return headers || {};
  }

  async _dispatch(method, url, headers, body) {
    if (method === "GET") {
      return Network.get(url, headers);
    }
    if (method === "POST") {
      return Network.post(url, headers, body);
    }
    return Network.sendRequest(method, url, headers, body);
  }

  _shouldCooldown(response, options) {
    if (response.status === 403 || response.status === 429) {
      return true;
    }
    if (!options.classifyBody) {
      return false;
    }
    const body = String((response && response.body) || "");
    if (!this._hasNonWhitespace(body)) {
      return true;
    }
    return this.source.isAbuseResponseBody(body);
  }

  _hasNonWhitespace(text) {
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code !== 32 && code !== 9 && code !== 10 && code !== 13) {
        return true;
      }
    }
    return false;
  }

  _markCooldown(domainKey, cooldownMs) {
    this.source.requestState.cooldownUntil.set(domainKey, Date.now() + cooldownMs);
  }
}
