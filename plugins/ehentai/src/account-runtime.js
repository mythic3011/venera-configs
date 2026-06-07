function ehentaiCreateEmptyAccountStore() {
  return {
    version: 1,
    activeProfileId: null,
    profiles: [],
  };
}

function ehentaiNormalizeAccountValues(source, values) {
  let normalized = [];
  for (let i = 0; i < source.accountFieldNames.length; i++) {
    normalized.push(String((values && values[i]) || ""));
  }
  return normalized;
}

function ehentaiCreateAccountCookies(source, values) {
  let normalized = ehentaiNormalizeAccountValues(source, values);
  let cookies = [];
  for (let i = 0; i < source.accountFieldNames.length; i++) {
    let name = source.accountFieldNames[i];
    let value = normalized[i];
    cookies.push(
      new Cookie({
        name,
        value,
        domain: ".e-hentai.org",
      }),
    );
    cookies.push(
      new Cookie({
        name,
        value,
        domain: ".exhentai.org",
      }),
    );
  }
  return cookies;
}

function ehentaiApplyCookiesFromValues(source, values) {
  let cookies = source.createAccountCookies(values);
  Network.deleteCookies(buildEhCookieUrl());
  Network.deleteCookies(buildExCookieUrl());
  Network.setCookies(buildEhCookieUrl(), cookies);
  Network.setCookies(buildExCookieUrl(), cookies);
}

function ehentaiClearRuntimeCaches(source) {
  source.responseCache.clear();
  source.thumbnailCache.clear();
  source.keyCache.clear();
  source.galleryInfoCache.clear();
  source.imageSessionCache.clear();
  source.apikey = null;
  source.uid = null;
}

function ehentaiClearSessionCookies() {
  Network.deleteCookies(buildEhCookieUrl());
  Network.deleteCookies(buildForumsCookieUrl());
  Network.deleteCookies(buildExCookieUrl());
}

function ehentaiLoadAccountStore(source) {
  if (source._accountStoreCache) {
    return source._accountStoreCache;
  }

  let raw = source.loadData("accountStore");
  if (!raw) {
    source._accountStoreCache = ehentaiCreateEmptyAccountStore();
    return source._accountStoreCache;
  }

  let parsed = null;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      parsed = null;
    }
  } else if (typeof raw === "object") {
    parsed = raw;
  }

  if (!parsed || !Array.isArray(parsed.profiles)) {
    source._accountStoreCache = ehentaiCreateEmptyAccountStore();
    return source._accountStoreCache;
  }

  let profiles = parsed.profiles
    .map((profile, index) => {
      let values = ehentaiNormalizeAccountValues(source, profile && profile.values);
      return {
        id: String((profile && profile.id) || `${Date.now()}_${index}`),
        name: profile && profile.name ? String(profile.name) : "",
        values,
        createdAt: String(
          (profile && profile.createdAt) || new Date().toISOString(),
        ),
        lastUsedAt: String(
          (profile && profile.lastUsedAt) || new Date().toISOString(),
        ),
      };
    })
    .filter((profile) => profile.values[0] && profile.values[1]);

  let activeProfileId =
    parsed.activeProfileId &&
    profiles.some((profile) => profile.id === parsed.activeProfileId)
      ? String(parsed.activeProfileId)
      : null;

  source._accountStoreCache = {
    version: 1,
    activeProfileId,
    profiles,
  };
  return source._accountStoreCache;
}

function ehentaiSaveAccountStore(source, store) {
  let normalized = {
    version: 1,
    activeProfileId: store.activeProfileId || null,
    profiles: store.profiles || [],
  };
  source._accountStoreCache = normalized;
  source.saveData("accountStore", JSON.stringify(normalized));
}

function ehentaiGetAccountDisplayName(source, profile, index) {
  let base =
    profile && profile.name
      ? profile.name
      : `${source.translate("account")} ${index + 1}`;
  let memberId = profile && profile.values ? profile.values[0] : "";
  return memberId ? `${base} (${memberId})` : base;
}

function ehentaiUpsertAccountProfile(source, values, preferredName) {
  let normalized = ehentaiNormalizeAccountValues(source, values);
  if (!normalized[0] || !normalized[1]) {
    return null;
  }

  let store = source.loadAccountStore();
  let now = new Date().toISOString();
  let existing = store.profiles.find((profile) => {
    return (
      profile.values[0] === normalized[0] &&
      profile.values[1] === normalized[1]
    );
  });

  if (existing) {
    existing.values = normalized;
    if (preferredName) {
      existing.name = preferredName;
    }
    existing.lastUsedAt = now;
    store.activeProfileId = existing.id;
    source.saveAccountStore(store);
    return existing.id;
  }

  let id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  store.profiles.push({
    id,
    name: preferredName || "",
    values: normalized,
    createdAt: now,
    lastUsedAt: now,
  });
  store.activeProfileId = id;
  source.saveAccountStore(store);
  return id;
}

async function ehentaiCaptureAccountFromCookieJar(source, preferredName) {
  let values = await source.collectAccountValuesFromCookieDomains();
  return source.upsertAccountProfile(values, preferredName || "");
}

async function ehentaiCollectAccountValuesFromCookieDomains(source) {
  let domains = [
    buildForumsCookieUrl(),
    buildEhCookieUrl(),
    buildExCookieUrl(),
  ];
  let byName = new Map();

  for (let domain of domains) {
    let cookies = [];
    try {
      cookies = await Network.getCookies(domain);
    } catch (_) {
      cookies = [];
    }
    for (let cookie of cookies) {
      if (!cookie || !cookie.name) {
        continue;
      }
      let name = String(cookie.name);
      let value = String(cookie.value || "");
      if (value.length === 0) {
        continue;
      }
      if (!byName.has(name)) {
        byName.set(name, value);
      }
    }
  }

  let values = [];
  for (let key of source.accountFieldNames) {
    values.push(byName.get(key) || "");
  }
  return values;
}

async function ehentaiActivateAccountProfile(source, profileId) {
  let store = source.loadAccountStore();
  let profile = store.profiles.find((item) => item.id === profileId);
  if (!profile) {
    throw "Account profile not found";
  }
  source.applyCookiesFromValues(profile.values);
  source.clearRuntimeCaches();
  profile.lastUsedAt = new Date().toISOString();
  store.activeProfileId = profile.id;
  source.saveAccountStore(store);
  return profile;
}

function ehentaiLogoutAccountSession(source) {
  source.clearSessionCookies();
  source.clearRuntimeCaches();
  let store = source.loadAccountStore();
  store.activeProfileId = null;
  source.saveAccountStore(store);
}
