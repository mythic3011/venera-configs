import {
  createRuntimeInvalidStatusError,
  assertRuntimeStatus,
} from "./errors.js";
import { resolvePluginUpdateUrl } from "./settings.js";
import {
  formatRuntimeDebugValue,
  debugRuntimeLog,
} from "./debug.js";

const runtimeErrorApi = {
  createRuntimeInvalidStatusError,
  assertRuntimeStatus,
};

const runtimeSettingsApi = {
  resolvePluginUpdateUrl,
};

const runtimeDebugApi = {
  formatRuntimeDebugValue,
  debugRuntimeLog,
};

const runtimeSupportApi = {
  ...runtimeErrorApi,
  ...runtimeSettingsApi,
  ...runtimeDebugApi,
};

export {
  createRuntimeInvalidStatusError,
  assertRuntimeStatus,
  resolvePluginUpdateUrl,
  formatRuntimeDebugValue,
  debugRuntimeLog,
  runtimeErrorApi,
  runtimeSettingsApi,
  runtimeDebugApi,
  runtimeSupportApi,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createRuntimeInvalidStatusError,
    assertRuntimeStatus,
    resolvePluginUpdateUrl,
    formatRuntimeDebugValue,
    debugRuntimeLog,
    runtimeErrorApi,
    runtimeSettingsApi,
    runtimeDebugApi,
    runtimeSupportApi,
  };
}
