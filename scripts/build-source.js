#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const babel = require("@babel/core");
const terser = require("terser");

const repoRoot = path.resolve(__dirname, "..");
const sourceName = process.argv[2];

if (sourceName !== "ehentai") {
  throw new Error("Usage: node scripts/build-source.js ehentai");
}

const moduleOrder = [
  "src/ehentai/source-shell.js",
  "src/ehentai/index.js",
  "src/ehentai/query.js",
  "src/ehentai/urls.js",
  "src/ehentai/api-payloads.js",
  "src/ehentai/form-payloads.js",
  "src/ehentai/cache-keys.js",
  "src/ehentai/parsers/gallery-list-parser.js",
  "src/ehentai/parsers/gallery-detail-parser.js",
  "src/ehentai/parsers/thumbnail-parser.js",
  "src/ehentai/parsers/dispatch-key-parser.js",
  "src/ehentai/parsers/comment-parser.js",
  "src/ehentai/parsers/archive-parser.js",
  "src/ehentai/features/account.js",
  "src/ehentai/features/explore.js",
  "src/ehentai/features/search.js",
  "src/ehentai/features/favorites.js",
  "src/ehentai/features/comic.js",
  "src/ehentai/features/comments.js",
  "src/ehentai/features/archive.js",
  "src/ehentai/settings.js",
  "src/ehentai/i18n.js",
  "src/ehentai/source-config.js",
  "src/ehentai/request-client.js",
  "src/ehentai/image-session.js",
];

const outputPath = path.join(repoRoot, "ehentai.js");
const parts = moduleOrder.map((relativePath) => {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing module: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, "utf8").trimEnd();
});

const output = `${parts.join("\n\n")}\n`;

// Transpile to ES2018-ish syntax for flutter_qjs compatibility. Venera runs
// sources in an embedded JS engine, not Node or a modern browser.
const result = babel.transformSync(output, {
  filename: outputPath,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: "63",
        },
        loose: true,
        useBuiltIns: false,
      },
    ],
  ],
});

(async () => {
  if (result.code) {
    // Parser-safe minify:
    // - keep multi-line output so ComicSourceParser can find a `class ... extends ComicSource` line
    // - still compress/mangle to reduce transfer and parse cost
    const minified = await terser.minify(result.code, {
      ecma: 2018,
      compress: {
        ecma: 2018,
        passes: 2,
      },
      mangle: true,
      output: {
        ecma: 2018,
        beautify: true,
        comments: /^!/,
      },
    });
    if (minified.error) {
      throw minified.error;
    }
    const cleanCode = minified.code
      .replace(/^\s*["']use strict["'];\s*/, "")
      .replace(/[ \t]+$/gm, "");
    fs.writeFileSync(outputPath, cleanCode, "utf8");
    console.log("Built, transpiled, and parser-safe-minified ehentai.js from src/ehentai");
  } else {
    throw new Error("Failed to transpile output");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
