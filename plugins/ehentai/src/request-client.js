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
    const isMutation = options.mutation ?? method !== "GET";

    const resolved = {
      action: options.action || `${method} ${url}`,
      requestKey:
        options.requestKey ||
        this._defaultRequestKey(method, url, body, isMutation),
      domainKey: options.domainKey || domainKey(url),
      expectedStatus: options.expectedStatus ?? 200,
      maxRetries: options.maxRetries ?? (method === "GET" ? 1 : 0),
      cooldownMs: options.cooldownMs ?? 60000,
      classifyBody: options.classifyBody ?? true,
      mutation: isMutation,
      allowDedup: options.allowDedup ?? !isMutation,
    };

    const cooldownUntil = this.source.requestState.cooldownUntil.get(
      resolved.domainKey,
    );
    if (cooldownUntil && cooldownUntil > Date.now()) {
      throw `${resolved.action} blocked: temporary cooldown in effect`;
    }

    const finalHeaders = this._resolveHeaders(method, url, headers, resolved);
    const inflightKey = resolved.requestKey;

    if (
      resolved.allowDedup &&
      inflightKey &&
      this.source.requestState.inflight.has(inflightKey)
    ) {
      return this.source.requestState.inflight.get(inflightKey);
    }

    const run = this._enqueueByDomain(resolved.domainKey, () => {
      return this._sendWithRetry(method, url, finalHeaders, body, resolved);
    });

    if (resolved.allowDedup && inflightKey) {
      this.source.requestState.inflight.set(inflightKey, run);
    }

    try {
      return await run;
    } finally {
      if (resolved.allowDedup && inflightKey) {
        this.source.requestState.inflight.delete(inflightKey);
      }
    }
  }

  _defaultRequestKey(method, url, body, isMutation) {
    if (!isMutation) {
      return `${method}:${url}`;
    }

    // mutation default no de-dup; caller can pass requestKey + allowDedup=true manually
    return null;
  }

  _enqueueByDomain(domainKey, task) {
    const tail =
      this.source.requestState.queues.get(domainKey) || Promise.resolve();
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

    // Empty body is transport/server failure, not an abuse signal. Don't cooldown.
    if (!this._hasNonWhitespace(body)) {
      return false;
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
    this.source.requestState.cooldownUntil.set(
      domainKey,
      Date.now() + cooldownMs,
    );
  }
}
