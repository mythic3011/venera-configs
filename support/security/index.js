import {
  withAuthorization,
  withBearer,
  withBasic,
  encodeSelfHostedToken,
} from "./secrets.js";
import { normalizeCookieUrl } from "./cookies.js";
import { redactSecretValue } from "./redaction.js";

const securitySecretsApi = {
  withAuthorization,
  withBearer,
  withBasic,
  encodeSelfHostedToken,
};

const securityCookiesApi = {
  normalizeCookieUrl,
};

const securityRedactionApi = {
  redactSecretValue,
};

const securitySupportApi = {
  ...securitySecretsApi,
  ...securityCookiesApi,
  ...securityRedactionApi,
};

export {
  withAuthorization,
  withBearer,
  withBasic,
  encodeSelfHostedToken,
  normalizeCookieUrl,
  redactSecretValue,
  securitySecretsApi,
  securityCookiesApi,
  securityRedactionApi,
  securitySupportApi,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    withAuthorization,
    withBearer,
    withBasic,
    encodeSelfHostedToken,
    normalizeCookieUrl,
    redactSecretValue,
    securitySecretsApi,
    securityCookiesApi,
    securityRedactionApi,
    securitySupportApi,
  };
}
