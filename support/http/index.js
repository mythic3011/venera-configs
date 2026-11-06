import { joinRawQueryEntries } from "./query.js";
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
  joinRawQueryEntries,
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
  joinRawQueryEntries,
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
    ...httpSupportApi,
    httpRequestApi,
    httpResponseApi,
    httpCooldownApi,
    httpSupportApi,
  };
}
