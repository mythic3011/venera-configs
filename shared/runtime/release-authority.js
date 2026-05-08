function __veneraGetRuntimeGlobal() {
  if (typeof globalThis === "object" && globalThis !== null) {
    return globalThis;
  }
  return {};
}

function __veneraNormalizeAuthorityPart(value, fallback, trimSlashes) {
  const raw = String(value == null ? "" : value).trim();
  const next = raw || fallback;
  if (!trimSlashes) {
    return next;
  }
  return next.replace(/^\/+|\/+$/g, "");
}

function resolvePluginUpdateUrl(fileName) {
  const runtimeGlobal = __veneraGetRuntimeGlobal();
  const overrides =
    runtimeGlobal.__VENERA_RELEASE_AUTHORITY__ &&
    typeof runtimeGlobal.__VENERA_RELEASE_AUTHORITY__ === "object"
      ? runtimeGlobal.__VENERA_RELEASE_AUTHORITY__
      : {};

  const cdnOrigin = __veneraNormalizeAuthorityPart(
    overrides.cdnOrigin,
    "https://cdn.jsdelivr.net",
    false,
  ).replace(/\/+$/, "");
  const providerPath = __veneraNormalizeAuthorityPart(
    overrides.providerPath,
    "gh",
    true,
  );
  const repository = __veneraNormalizeAuthorityPart(
    overrides.repository,
    "mythic3011/venera-configs",
    true,
  );
  const releaseRef = __veneraNormalizeAuthorityPart(
    overrides.releaseRef,
    "main",
    false,
  );
  const artifactPathPrefix = __veneraNormalizeAuthorityPart(
    overrides.artifactPathPrefix,
    "dist/plugins",
    true,
  );

  const normalizedFileName = String(fileName || "").replace(/^\/+/, "");
  if (!normalizedFileName) {
    return `${cdnOrigin}/${providerPath}/${repository}@${releaseRef}`;
  }
  const normalizedArtifactPath = artifactPathPrefix
    ? `${artifactPathPrefix}/${normalizedFileName}`
    : normalizedFileName;
  const artifactPath = normalizedFileName.startsWith(`${artifactPathPrefix}/`)
    ? normalizedFileName
    : normalizedArtifactPath;
  return `${cdnOrigin}/${providerPath}/${repository}@${releaseRef}/${artifactPath}`;
}
