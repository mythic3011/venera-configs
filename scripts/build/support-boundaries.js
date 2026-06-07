const path = require("node:path");
const { REPO_ROOT } = require("./lib");

const SUPPORT_ROOT = path.join(REPO_ROOT, "support");
const PLUGINS_ROOT = path.join(REPO_ROOT, "plugins");

function toPosixRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function isSupportPath(specifier) {
  return specifier.startsWith("support/");
}

function isSharedPath(specifier) {
  return specifier.startsWith("shared/");
}

function isSupportIndexPath(specifier) {
  return /^support\/[^/]+\/index\.js$/.test(specifier);
}

function isSupportTestingPath(specifier) {
  return specifier === "support/testing/index.js" || specifier.startsWith("support/testing/");
}

function isPluginFile(filePath) {
  return filePath.startsWith(PLUGINS_ROOT + path.sep);
}

function isSupportFile(filePath) {
  return filePath.startsWith(SUPPORT_ROOT + path.sep);
}

function validateSupportSpecifier(specifier, importerPath, options = {}) {
  const importerRelative = toPosixRelative(importerPath);
  const allowTesting = options.allowTesting === true;

  if (isSharedPath(specifier)) {
    throw new Error(`shared/ has been replaced by support/. (${importerRelative} -> ${specifier})`);
  }

  if (!isSupportPath(specifier)) {
    return;
  }

  if (isPluginFile(importerPath)) {
    if (isSupportTestingPath(specifier) && !allowTesting) {
      throw new Error(
        `support/testing is test-only and must not be imported by plugin source. (${importerRelative} -> ${specifier})`,
      );
    }
    if (!isSupportIndexPath(specifier)) {
      throw new Error(
        `Use support/<domain>/index.js instead of deep support imports. (${importerRelative} -> ${specifier})`,
      );
    }
    return;
  }

  if (isSupportFile(importerPath)) {
    return;
  }

  if (isSupportTestingPath(specifier) && !allowTesting) {
    throw new Error(
      `support/testing is test-only and must not be imported by plugin source. (${importerRelative} -> ${specifier})`,
    );
  }
  if (!isSupportIndexPath(specifier)) {
    throw new Error(
      `Use support/<domain>/index.js instead of deep support imports. (${importerRelative} -> ${specifier})`,
    );
  }
}

function resolveSupportSpecifierPath(specifier, importerPath, options = {}) {
  validateSupportSpecifier(specifier, importerPath, options);
  return path.join(REPO_ROOT, specifier);
}

module.exports = {
  SUPPORT_ROOT,
  PLUGINS_ROOT,
  toPosixRelative,
  isSupportPath,
  isSharedPath,
  isSupportIndexPath,
  isSupportTestingPath,
  isPluginFile,
  isSupportFile,
  validateSupportSpecifier,
  resolveSupportSpecifierPath,
};
