// Values are already encoded by the caller; encoding here would change URLs.
function joinRawQueryEntries(entries) {
  const parts = [];
  for (const entry of entries || []) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const [key, value] = entry;
    if (key != null && value != null) parts.push(`${String(key)}=${String(value)}`);
  }
  return parts.join("&");
}

export { joinRawQueryEntries };
