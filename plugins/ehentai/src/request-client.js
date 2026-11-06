class EhentaiRequestClient {
  constructor(source) {
    this.source = source;
    this._managedClient = null;
  }

  get(url, headers = {}, options = {}) {
    return this._getManagedClient().get(url, headers, options);
  }

  post(url, headers = {}, body = null, options = {}) {
    return this._getManagedClient().post(url, headers, body, options);
  }

  head(url, headers = {}, options = {}) {
    return this._getManagedClient().head(url, headers, options);
  }

  _getManagedClient() {
    if (!this._managedClient) {
      this._managedClient = createManagedRequestClient(this.source, {
        domainKeyResolver: (url) => domainKey(url),
        shouldCooldown: (response, options, source) => {
          if (!options.classifyBody) {
            return false;
          }
          const body = String((response && response.body) || "");
          if (!hasNonWhitespaceText(body)) {
            return false;
          }
          return source.isAbuseResponseBody(body);
        },
      });
    }
    return this._managedClient;
  }
}
