const babel = require("@babel/core");

function compatTransform(sourceCode, plugin) {
  if (plugin.pipeline && plugin.pipeline.mode === "legacy_passthrough") {
    return sourceCode;
  }

  const result = babel.transformSync(sourceCode, {
    filename: plugin.artifact,
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { chrome: "63" },
          loose: true,
          useBuiltIns: false,
        },
      ],
    ],
  });

  if (!result || !result.code) {
    throw new Error(`Failed to run compatibility transform for ${plugin.id}`);
  }

  return result.code;
}

module.exports = {
  compatTransform,
};
