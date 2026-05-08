function createSelfHostedReferenceCacheFeature(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const ttlMs = Number(opts.ttlMs || 5 * 60 * 1000);
  const metaTimestampKey = String(opts.metaTimestampKey || "");
  const resetData =
    opts.resetData && typeof opts.resetData === "object"
      ? opts.resetData
      : {};
  const hasToken =
    typeof opts.hasToken === "function" ? opts.hasToken : () => false;
  const loadPayload =
    typeof opts.loadPayload === "function" ? opts.loadPayload : null;
  const savePayload =
    typeof opts.savePayload === "function" ? opts.savePayload : null;
  const shouldRethrow =
    typeof opts.shouldRethrow === "function" ? opts.shouldRethrow : null;

  if (!metaTimestampKey || !loadPayload || !savePayload) {
    throw new Error("Invalid createSelfHostedReferenceCacheFeature options");
  }

  const reset = (source) => {
    for (const [key, value] of Object.entries(resetData)) {
      if (Array.isArray(value)) {
        source.saveData(key, value.slice());
      } else if (value && typeof value === "object") {
        source.saveData(key, { ...value });
      } else {
        source.saveData(key, value);
      }
    }
  };

  return async function refreshSelfHostedReferenceData(source, force) {
    if (!source || typeof source !== "object") {
      throw new Error("refreshSelfHostedReferenceData requires plugin source");
    }

    if (!hasToken(source)) {
      reset(source);
      return;
    }

    const now = Date.now();
    const last = Number(source.loadData(metaTimestampKey) || 0);
    if (!force && last > 0 && now - last < ttlMs) {
      return;
    }

    try {
      const payload = await loadPayload(source);
      await savePayload(source, payload, now);
      source.saveData(metaTimestampKey, now);
    } catch (error) {
      reset(source);
      if (shouldRethrow && shouldRethrow(error, source)) {
        throw error;
      }
    }
  };
}

function createSafeInitFeature(refresher) {
  if (typeof refresher !== "function") {
    throw new Error("createSafeInitFeature requires refresher");
  }
  return async function initSelfHostedFeature(source) {
    try {
      await refresher(source, false);
    } catch (_) {}
  };
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
  };
}
