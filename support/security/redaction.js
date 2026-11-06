function redactSecretValue(value) {
  const text = String(value || "");
  if (text.length <= 4) {
    return text ? "****" : "";
  }
  return `${text.slice(0, 2)}****${text.slice(-2)}`;
}

export { redactSecretValue };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    redactSecretValue,
  };
}
