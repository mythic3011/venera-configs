function formatRuntimeDebugValue(value) {
  if (typeof value === "string") {
    return value;
  }
  if (value == null) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value);
  }
}

function debugRuntimeLog(label, value) {
  if (typeof console === "undefined" || !console || typeof console.log !== "function") {
    return;
  }
  console.log(`${String(label || "debug")}: ${formatRuntimeDebugValue(value)}`);
}

export {
  formatRuntimeDebugValue,
  debugRuntimeLog,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    formatRuntimeDebugValue,
    debugRuntimeLog,
  };
}
