import {
  runtimeGet,
  getRuntimeJson,
  getRuntimeDocument,
  getSelfHostedJson,
  postSelfHostedJson,
  ManagedRequestClient,
  createManagedRequestClient,
} from "./request-client.js";
import {
  parseRuntimeJsonBody,
  ensureSelfHostedHttpOk,
  parseSelfHostedJsonBody,
} from "./response-guards.js";
import {
  hasNonWhitespaceText,
  defaultRequestKey,
  createDomainQueue,
  markCooldown,
} from "./cooldown.js";

const httpRequestApi = {
  runtimeGet,
  getRuntimeJson,
  getRuntimeDocument,
  getSelfHostedJson,
  postSelfHostedJson,
  ManagedRequestClient,
  createManagedRequestClient,
};

const httpResponseApi = {
  parseRuntimeJsonBody,
  ensureSelfHostedHttpOk,
  parseSelfHostedJsonBody,
};

const httpCooldownApi = {
  hasNonWhitespaceText,
  defaultRequestKey,
  createDomainQueue,
  markCooldown,
};

const httpSupportApi = {
  ...httpRequestApi,
  ...httpResponseApi,
  ...httpCooldownApi,
};

export {
  runtimeGet,
  getRuntimeJson,
  getRuntimeDocument,
  getSelfHostedJson,
  postSelfHostedJson,
  ManagedRequestClient,
  createManagedRequestClient,
  parseRuntimeJsonBody,
  ensureSelfHostedHttpOk,
  parseSelfHostedJsonBody,
  hasNonWhitespaceText,
  defaultRequestKey,
  createDomainQueue,
  markCooldown,
  httpRequestApi,
  httpResponseApi,
  httpCooldownApi,
  httpSupportApi,
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
    parseRuntimeJsonBody,
    ensureSelfHostedHttpOk,
    parseSelfHostedJsonBody,
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi,
  };
}
