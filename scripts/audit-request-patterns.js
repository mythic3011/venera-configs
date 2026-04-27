#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = fs
  .readdirSync(root)
  .filter((name) => name.endsWith(".js") && !name.startsWith("_"))
  .map((name) => path.join(root, name));

const checks = [
  { key: "networkGet", label: "Network.get", regex: /\bNetwork\.get\s*\(/g },
  { key: "networkPost", label: "Network.post", regex: /\bNetwork\.post\s*\(/g },
  { key: "networkSend", label: "Network.sendRequest", regex: /\bNetwork\.sendRequest\s*\(/g },
  { key: "fetch", label: "fetch(", regex: /\bfetch\s*\(/g },
  { key: "dateNow", label: "Date.now/random", regex: /\bDate\.now\s*\(|\brandom\w*\s*\(/g },
  { key: "onImageLoadNetwork", label: "onImageLoad network", regex: /onImageLoad[\s\S]*?Network\.(?:get|post|sendRequest)\s*\(/g },
  { key: "encodeURIComponent", label: "encodeURIComponent", regex: /\bencodeURIComponent\s*\(/g },
];

function count(content, regex) {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

const rows = files.map((file) => {
  const content = fs.readFileSync(file, "utf8");
  const row = {
    file: path.basename(file),
  };
  let total = 0;
  for (const check of checks) {
    const n = count(content, check.regex);
    row[check.key] = n;
    total += n;
  }
  row.total = total;
  return row;
});

rows.sort((a, b) => b.total - a.total || a.file.localeCompare(b.file));

const headers = ["file", ...checks.map((c) => c.label), "total"];
const widths = headers.map((h, i) => {
  if (i === 0) {
    return Math.max(h.length, ...rows.map((r) => r.file.length));
  }
  const key = i === headers.length - 1 ? "total" : checks[i - 1].key;
  return Math.max(h.length, ...rows.map((r) => String(r[key]).length));
});

function formatRow(values) {
  return values.map((v, i) => String(v).padEnd(widths[i], " ")).join(" | ");
}

console.log(formatRow(headers));
console.log(widths.map((w) => "-".repeat(w)).join("-|-"));
for (const row of rows) {
  console.log(
    formatRow([
      row.file,
      ...checks.map((c) => row[c.key]),
      row.total,
    ]),
  );
}
