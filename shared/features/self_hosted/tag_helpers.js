function toSelfHostedTagArray(tags, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const delimiter = typeof opts.delimiter === "string" ? opts.delimiter : ",";
  const normalize =
    typeof opts.normalizeTag === "function"
      ? opts.normalizeTag
      : (value) => String(value).trim();

  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => normalize(tag)).filter(Boolean);
  }

  return String(tags)
    .split(delimiter)
    .map((tag) => normalize(tag))
    .filter(Boolean);
}

function startsWithSelfHostedTagPrefix(tag, prefix, caseSensitive) {
  const sourceTag = String(tag || "");
  const sourcePrefix = String(prefix || "");
  if (!sourcePrefix) {
    return false;
  }
  if (caseSensitive === false) {
    return sourceTag.toLowerCase().startsWith(sourcePrefix.toLowerCase());
  }
  return sourceTag.startsWith(sourcePrefix);
}

function extractSelfHostedTagValue(tags, prefix, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const caseSensitive = opts.caseSensitive !== false;
  const transform =
    typeof opts.transform === "function" ? opts.transform : (value) => value;
  const list = toSelfHostedTagArray(tags, opts);
  const prefixText = String(prefix || "");
  for (const tag of list) {
    if (!startsWithSelfHostedTagPrefix(tag, prefixText, caseSensitive)) {
      continue;
    }
    const raw = String(tag).slice(prefixText.length).trim();
    return transform(raw, tag);
  }
  return null;
}

function removeSelfHostedTagsByPrefix(tags, prefixes, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const caseSensitive = opts.caseSensitive !== false;
  const list = toSelfHostedTagArray(tags, opts);
  const prefixList = Array.isArray(prefixes)
    ? prefixes.map((value) => String(value))
    : [String(prefixes || "")];
  return list.filter(
    (tag) =>
      !prefixList.some((prefix) =>
        startsWithSelfHostedTagPrefix(tag, prefix, caseSensitive),
      ),
  );
}

function filterSelfHostedDisplayTags(tags, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const blockedPrefixes = Array.isArray(opts.blockedPrefixes)
    ? opts.blockedPrefixes
    : [];
  const caseSensitive = opts.caseSensitive === true;
  const excludeUrlLike = opts.excludeUrlLike !== false;
  const extraFilter =
    typeof opts.extraFilter === "function" ? opts.extraFilter : null;
  const list = toSelfHostedTagArray(tags, opts);
  const result = [];
  for (const tag of list) {
    if (
      blockedPrefixes.some((prefix) =>
        startsWithSelfHostedTagPrefix(tag, prefix, caseSensitive),
      )
    ) {
      continue;
    }
    if (excludeUrlLike && String(tag).includes("://")) {
      continue;
    }
    if (extraFilter && !extraFilter(tag)) {
      continue;
    }
    result.push(tag);
  }
  return result;
}

function parseSelfHostedRatingValueFromTags(tags, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const prefix = String(opts.prefix || "rating:");
  const starSymbols = Array.isArray(opts.starSymbols)
    ? opts.starSymbols
    : ["⭐", "★"];
  const caseSensitive = opts.caseSensitive === true;
  const raw = extractSelfHostedTagValue(tags, prefix, {
    caseSensitive,
  });
  if (!raw) {
    return null;
  }
  if (starSymbols.some((symbol) => String(raw).includes(symbol))) {
    let count = 0;
    for (const symbol of starSymbols) {
      const escaped = String(symbol).replace(
        /[-/\\^$*+?.()|[\]{}]/g,
        "\\$&",
      );
      const matches = String(raw).match(new RegExp(escaped, "g"));
      if (matches && matches.length > 0) {
        count = matches.length;
        break;
      }
    }
    return String(count);
  }
  return String(raw).trim();
}

function extractSelfHostedUrlEntriesFromTagMap(tagsMap, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const sourceNamespace = String(opts.sourceNamespace || "source").toLowerCase();
  const sourceScheme = String(opts.sourceScheme || "https").replace(/:$/, "");
  const skipKeys = new Set(
    Array.isArray(opts.skipKeys) ? opts.skipKeys.map((key) => String(key)) : [],
  );
  const result = [];
  if (!tagsMap || typeof tagsMap !== "object") {
    return result;
  }

  for (const key of Object.keys(tagsMap)) {
    if (skipKeys.has(key)) {
      continue;
    }
    const values = tagsMap[key];
    if (!Array.isArray(values)) {
      continue;
    }
    const keep = [];
    for (const value of values) {
      if (typeof value !== "string") {
        keep.push(value);
        continue;
      }
      if (value.includes("://")) {
        result.push(value);
        continue;
      }
      if (String(key).toLowerCase() === sourceNamespace) {
        let normalized = value;
        if (normalized.startsWith("//")) {
          normalized = `${sourceScheme}:${normalized}`;
        } else if (!/^https?:\/\//i.test(normalized)) {
          normalized = `${sourceScheme}://${normalized}`;
        }
        result.push(normalized);
        continue;
      }
      keep.push(value);
    }
    tagsMap[key] = keep;
  }

  return result;
}

function buildSelfHostedEmojiRatingTag(rating, options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const prefix = String(opts.prefix || "rating:");
  const symbol = String(opts.symbol || "⭐");
  const stars = Number(rating) / 2;
  return `${prefix}${symbol.repeat(stars)}`;
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    toSelfHostedTagArray,
    startsWithSelfHostedTagPrefix,
    extractSelfHostedTagValue,
    removeSelfHostedTagsByPrefix,
    filterSelfHostedDisplayTags,
    parseSelfHostedRatingValueFromTags,
    extractSelfHostedUrlEntriesFromTagMap,
    buildSelfHostedEmojiRatingTag,
  };
}
