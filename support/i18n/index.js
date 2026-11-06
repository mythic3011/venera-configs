import sharedTagTranslations from "./tags.json";

// A catalog has the same shape as ComicSource.translation: locale -> key -> text.
function createSharedTranslations(catalog, overrides) {
  const result = Object.create(null);
  for (const source of [sharedTagTranslations, catalog, overrides]) {
    if (source === undefined) continue;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error("Translation catalog must be a locale-keyed object.");
    }
    for (const locale of Object.keys(source)) {
      if (!/^[a-z]{2,3}(?:_[A-Za-z]{2,8})?$/.test(locale)) {
        throw new Error("Invalid translation locale: " + locale);
      }
      const table = source[locale];
      if (!table || typeof table !== "object" || Array.isArray(table)) {
        throw new Error("Translation locale must contain a key-to-text object.");
      }
      if (!result[locale]) result[locale] = Object.create(null);
      for (const key of Object.keys(table)) {
        if (typeof table[key] !== "string") {
          throw new Error("Translation values must be strings.");
        }
        result[locale][key] = table[key];
      }
    }
  }
  return result;
}

async function loadSharedTranslations(url, overrides) {
  if (
    typeof url !== "string" ||
    !/^https:\/\/[^/?#\s@\\]+(?:[/?][^\s#\\]*)?$/i.test(url) ||
    /[\u0000-\u001f\u007f]/.test(url)
  ) {
    throw new Error("Translation URL must be an HTTPS JSON URL.");
  }
  // Never send a comic server's credentials to the translation host.
  const response = await Network.get(url, { Accept: "application/json" });
  if (!response || response.status !== 200) {
    throw new Error("Could not download translation JSON.");
  }
  if (typeof response.body !== "string" || response.body.length > 2 * 1024 * 1024) {
    throw new Error("Translation JSON exceeds the size limit.");
  }
  return createSharedTranslations(JSON.parse(response.body), overrides);
}

export { createSharedTranslations, loadSharedTranslations };
