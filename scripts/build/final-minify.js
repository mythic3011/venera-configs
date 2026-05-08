const terser = require("terser");
const { normalizeOutputCode } = require("./lib");

async function finalMinify(sourceCode, plugin) {
  if (plugin.pipeline && plugin.pipeline.mode === "legacy_passthrough") {
    return String(sourceCode);
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

  return normalizeOutputCode(minified.code || "");
}

module.exports = {
  finalMinify,
};
