function resolveMappedCategoryTagAction(namespace, tag, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const expectedNamespace =
    opts.namespace == null ? "标签" : String(opts.namespace);
  if (String(namespace) !== expectedNamespace) {
    throw opts.unsupportedMessage || "Unsupported tag namespace";
  }

  const mapping =
    opts.mapping && typeof opts.mapping === "object" ? opts.mapping : {};
  const sourceTag = String(tag == null ? "" : tag);
  const mappedParam = mapping[sourceTag];
  const keyword =
    typeof opts.keywordFormatter === "function"
      ? opts.keywordFormatter(sourceTag, mappedParam, namespace)
      : sourceTag;
  const param =
    typeof opts.paramFormatter === "function"
      ? opts.paramFormatter(sourceTag, mappedParam, namespace)
      : String(mappedParam);

  return {
    action: opts.action || "category",
    keyword,
    param,
  };
}

function createMappedCategoryTagActionResolver(options) {
  return (namespace, tag) =>
    resolveMappedCategoryTagAction(namespace, tag, options);
}

export {
  resolveMappedCategoryTagAction,
  createMappedCategoryTagActionResolver,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    resolveMappedCategoryTagAction,
    createMappedCategoryTagActionResolver,
  };
}
