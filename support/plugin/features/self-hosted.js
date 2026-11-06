import {
  stripSelfHostedTrailingSlash,
  buildSelfHostedQueryFromSource,
  readSelfHostedOffset,
  updateSelfHostedOffset,
} from "../source-contract.js";
import { parseSelfHostedJsonBody } from "../../http/index.js";

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

function createStaticCategoryPart(partName, label, category, param) {
  return {
    name: partName,
    type: "dynamic",
    loader: function () {
      return [
        {
          label,
          target: {
            page: "category",
            attributes: {
              category,
              param: param == null ? null : param,
            },
          },
        },
      ];
    },
  };
}

function createStoredCategoryPart(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const partName = String(opts.partName || "");
  const storageKey = String(opts.storageKey || "");
  const getLabel = typeof opts.getLabel === "function" ? opts.getLabel : null;
  const getCategory =
    typeof opts.getCategory === "function" ? opts.getCategory : null;
  const getParam = typeof opts.getParam === "function" ? opts.getParam : null;
  const usePageJumpTarget = opts.usePageJumpTarget === true;
  const getSource = typeof opts.getSource === "function" ? opts.getSource : null;

  if (!partName || !storageKey || !getLabel || !getCategory || !getParam) {
    throw new Error("Invalid createStoredCategoryPart options");
  }

  return {
    name: partName,
    type: "dynamic",
    loader: function () {
      const source = getSource ? getSource() : this;
      const items =
        source && typeof source.loadData === "function"
          ? source.loadData(storageKey)
          : null;
      if (!Array.isArray(items) || !items.length) {
        return [];
      }
      const result = [];
      for (const item of items) {
        const label = getLabel(item);
        const category = getCategory(item);
        const param = getParam(item);
        if (!label || !category) {
          continue;
        }
        const attributes = { category, param: param == null ? null : param };
        let target;
        if (usePageJumpTarget && typeof PageJumpTarget === "function") {
          target = new PageJumpTarget({ page: "category", attributes });
        } else {
          target = { page: "category", attributes };
        }
        result.push({ label, target });
      }
      return result;
    },
  };
}

function createOffsetSearchLoader(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const path = String(opts.path || "/api/search");
  const getOffsetKey =
    typeof opts.getOffsetKey === "function" ? opts.getOffsetKey : null;
  const buildQuery =
    typeof opts.buildQuery === "function" ? opts.buildQuery : null;
  const mapComic = typeof opts.mapComic === "function" ? opts.mapComic : null;
  const onResponse =
    typeof opts.onResponse === "function" ? opts.onResponse : null;
  const statusErrorPrefix = String(
    opts.statusErrorPrefix || "Invalid status code",
  );

  if (!getOffsetKey || !buildQuery || !mapComic) {
    throw new Error("Invalid createOffsetSearchLoader options");
  }

  return async function runOffsetSearch(source, payload) {
    if (!source || typeof source !== "object") {
      throw new Error("runOffsetSearch requires plugin source");
    }
    const input =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : {};
    const page = Number(input.page || 1);
    const base = stripSelfHostedTrailingSlash(source.baseUrl);
    const offsetKey = getOffsetKey(input);
    const start = readSelfHostedOffset(source, offsetKey, page);
    const query = buildQuery(input, start);
    const qs = buildSelfHostedQueryFromSource(query);
    const url = qs ? `${base}${path}?${qs}` : `${base}${path}`;
    const res = await Network.get(url, source.headers);
    if (res.status !== 200) {
      throw `${statusErrorPrefix}: ${res.status}`;
    }

    const data = parseSelfHostedJsonBody(res.body) || {};
    const list = Array.isArray(data.data) ? data.data : [];
    const comics = list.map((item) => mapComic(item, { source, base, input }));
    const returned = list.length;

    updateSelfHostedOffset(source, offsetKey, returned);
    const total =
      typeof data.recordsFiltered === "number" && data.recordsFiltered >= 0
        ? data.recordsFiltered
        : start + returned;
    const serverPage = returned || 1;
    const maxPage = Math.max(1, Math.ceil(total / serverPage));

    if (onResponse) {
      onResponse({ source, input, start, returned, data, list, comics });
    }

    return { comics, maxPage, data };
  };
}

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

export {
  createSelfHostedReferenceCacheFeature,
  createSafeInitFeature,
  createStaticCategoryPart,
  createStoredCategoryPart,
  createOffsetSearchLoader,
  toSelfHostedTagArray,
  startsWithSelfHostedTagPrefix,
  extractSelfHostedTagValue,
  removeSelfHostedTagsByPrefix,
  filterSelfHostedDisplayTags,
  parseSelfHostedRatingValueFromTags,
  extractSelfHostedUrlEntriesFromTagMap,
  buildSelfHostedEmojiRatingTag,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createSelfHostedReferenceCacheFeature,
    createSafeInitFeature,
    createStaticCategoryPart,
    createStoredCategoryPart,
    createOffsetSearchLoader,
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
