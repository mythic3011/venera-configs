#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { BUILD_MANIFEST_PATH, readJson } = require("../build/lib");

const RULES = [
  {
    id: "eval",
    regex: /\beval\s*\(/g,
    message: "Disallow eval()",
  },
  {
    id: "new-function",
    regex: /\bnew\s+Function\s*\(/g,
    message: "Disallow new Function()",
  },
  {
    id: "function-constructor",
    regex: /\bFunction\s*\(/g,
    message: "Disallow Function() constructor",
  },
];

const EXCEPTIONS_PATH = path.join(path.dirname(BUILD_MANIFEST_PATH), "unsafe-runtime-exceptions.json");

function loadExceptions() {
  if (!fs.existsSync(EXCEPTIONS_PATH)) {
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("unsafe-runtime-exceptions.json must be an array");
  }
  return parsed;
}

function isException(exceptions, artifact, ruleId) {
  return exceptions.some((entry) => entry.artifact === artifact && entry.rule === ruleId);
}

function stripStringsAndComments(source) {
  const text = String(source || "");
  let out = "";
  let i = 0;
  let state = "code";

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (state === "code") {
      if (ch === "/" && next === "/") {
        state = "line";
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "/" && next === "*") {
        state = "block";
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "'") {
        state = "single";
        out += " ";
        i += 1;
        continue;
      }
      if (ch === "\"") {
        state = "double";
        out += " ";
        i += 1;
        continue;
      }
      if (ch === "`") {
        state = "template";
        out += " ";
        i += 1;
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }

    if (state === "line") {
      if (ch === "\n") {
        state = "code";
        out += "\n";
      } else {
        out += " ";
      }
      i += 1;
      continue;
    }

    if (state === "block") {
      if (ch === "*" && next === "/") {
        state = "code";
        out += "  ";
        i += 2;
      } else {
        out += ch === "\n" ? "\n" : " ";
        i += 1;
      }
      continue;
    }

    if (state === "single") {
      if (ch === "\\") {
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "'") {
        state = "code";
        out += " ";
      } else {
        out += ch === "\n" ? "\n" : " ";
      }
      i += 1;
      continue;
    }

    if (state === "double") {
      if (ch === "\\") {
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "\"") {
        state = "code";
        out += " ";
      } else {
        out += ch === "\n" ? "\n" : " ";
      }
      i += 1;
      continue;
    }

    // template literal content
    if (ch === "\\") {
      out += "  ";
      i += 2;
      continue;
    }
    if (ch === "`") {
      state = "code";
      out += " ";
      i += 1;
      continue;
    }
    // Keep `${ ... }` expressions visible to audit rules.
    if (ch === "$" && next === "{") {
      out += "${";
      i += 2;
      state = "code";
      continue;
    }
    out += ch === "\n" ? "\n" : " ";
    i += 1;
  }

  return out;
}

function main() {
  const manifest = readJson(BUILD_MANIFEST_PATH);
  const exceptions = loadExceptions();
  const violations = [];

  for (const plugin of manifest.plugins) {
    const artifactPath = path.join(path.resolve(__dirname, "../.."), plugin.outputPath);
    if (!fs.existsSync(artifactPath)) {
      violations.push(`${plugin.outputPath}: missing artifact`);
      continue;
    }
    const content = fs.readFileSync(artifactPath, "utf8");
    const scanContent = stripStringsAndComments(content);
    for (const rule of RULES) {
      if (rule.regex.test(scanContent) && !isException(exceptions, plugin.outputPath, rule.id)) {
        violations.push(`${plugin.outputPath}: ${rule.message}`);
      }
      rule.regex.lastIndex = 0;
    }
  }

  if (violations.length > 0) {
    for (const item of violations) {
      console.error(item);
    }
    process.exit(1);
  }

  console.log("unsafe runtime code audit passed");
}

main();
