const NHENTAI_LANGUAGE_TAGS = {
  "6346": "日本語",
  "12227": "English",
  "29963": "中文",
};

const NHENTAI_TAG_NAMESPACES = {
  language: "Languages",
  artist: "Artists",
  character: "Characters",
  group: "Groups",
  parody: "Parodies",
  category: "Categories",
  tag: "Tags",
};

const NHENTAI_CATEGORY_PARAM_ALIASES = {
  tags: "tag",
  languages: "language",
  artists: "artist",
  characters: "character",
  parodies: "parody",
  groups: "group",
  categories: "category",
};

const NHENTAI_LANGUAGE_CATEGORIES = ["chinese", "english", "japanese"];

const NHENTAI_CATEGORY_SORT_OPTIONS = [
  "/-Recent",
  "/popular@today-Popular Today",
  "/popular@week-Popular Week",
  "/popular@month-Popular Month",
  "/popular-Popular All",
];

const NHENTAI_SEARCH_SORT_OPTIONS = [
  "date-Recent",
  "popular-today-Popular Today",
  "popular-week-Popular Week",
  "popular-month-Popular Month",
  "popular-Popular All",
];

const NHENTAI_CATEGORY_SORT_QUERY_VALUES = new Set([
  "popular",
  "popular-today",
  "popular-week",
  "popular-month",
]);

const NHENTAI_COMIC_ID_REGEX = "^(\\d+|nh\\d+|nhentai\\d+)$";

function getNhentaiLanguageFromTags(tagIdsOrText) {
  const tagIds = normalizeNhentaiTagIds(tagIdsOrText);
  for (const [tagId, language] of Object.entries(NHENTAI_LANGUAGE_TAGS)) {
    if (tagIds.includes(tagId)) {
      return language;
    }
  }
  return "Unknown";
}

function getNhentaiTagNamespace(tagType) {
  const normalized = String(tagType || "").toLowerCase();
  if (NHENTAI_TAG_NAMESPACES[normalized]) {
    return NHENTAI_TAG_NAMESPACES[normalized];
  }
  if (!tagType) {
    return "Tags";
  }
  return tagType.charAt(0).toUpperCase() + tagType.slice(1);
}

function normalizeNhentaiCategoryParam(param) {
  if (!param) {
    return param;
  }
  const normalized = String(param).toLowerCase();
  return NHENTAI_CATEGORY_PARAM_ALIASES[normalized] || param;
}
