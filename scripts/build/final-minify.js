const terser = require("terser");
const { normalizeOutputCode } = require("./lib");

function enforceClassFirst(sourceCode, pluginId) {
  const code = String(sourceCode || "");
  const firstNonWhitespaceIndex = code.search(/\S/);
  if (firstNonWhitespaceIndex === -1) {
    throw new Error(`Generated output is empty for ${pluginId}`);
  }

  const classPattern = /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+ComicSource\b/;
  const match = classPattern.exec(code);
  if (!match) {
    throw new Error(`Generated output is missing ComicSource class for ${pluginId}`);
  }

  if (match.index === firstNonWhitespaceIndex) {
    return normalizeOutputCode(code);
  }

  const head = code.slice(firstNonWhitespaceIndex, match.index).trim();
  const body = code.slice(match.index).trimEnd();
  const reordered = head ? `${body}\n\n${head}\n` : `${body}\n`;
  return normalizeOutputCode(reordered);
}

async function finalMinify(sourceCode, plugin) {
  const pluginId = plugin && plugin.id ? plugin.id : "unknown-plugin";
  if (plugin.pipeline && plugin.pipeline.mode === "legacy_passthrough") {
    return enforceClassFirst(String(sourceCode), pluginId);
  }

  const minified = await terser.minify(sourceCode, {
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

  return enforceClassFirst(minified.code || "", pluginId);
}

module.exports = {
  finalMinify,
};
