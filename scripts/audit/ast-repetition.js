#!/usr/bin/env node

// Report mechanically repeated JavaScript source elements. This is a discovery
// aid only: exact text reuse still needs domain and ownership review.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const babel = require("@babel/core");

const ROOT = path.resolve(__dirname, "../..");
const SEARCH_ROOTS = ["plugins", "support", "scripts"];
const OMIT_DIRS = new Set(["node_modules", "dist", ".generated", ".git", "tests", "testing"]);
const MAX_STRING_LENGTH = 240;
const MIN_FUNCTION_NODES = 8;

function walkFiles(directory, result) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!OMIT_DIRS.has(entry.name)) walkFiles(path.join(directory, entry.name), result);
    } else if (entry.isFile() && entry.name.endsWith(".js") && !entry.name.endsWith(".test.js") && entry.name !== "ast-repetition.js") {
      result.push(path.join(directory, entry.name));
    }
  }
}

function canonical(node) {
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(canonical);
  const result = {};
  for (const key of Object.keys(node).sort()) {
    if (["loc", "start", "end", "extra", "leadingComments", "trailingComments", "innerComments"].includes(key)) continue;
    result[key] = canonical(node[key]);
  }
  return result;
}

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function displayName(node, parent, key) {
  if (node.id && node.id.name) return node.id.name;
  if ((node.type === "ObjectMethod" || node.type === "ClassMethod" || node.type === "ClassPrivateMethod") && node.key) {
    return node.key.name || node.key.value || "<method>";
  }
  if (parent && (parent.type === "VariableDeclarator" || parent.type === "ObjectProperty" || parent.type === "ClassProperty")) {
    const id = parent.id || parent.key;
    if (id) return id.name || id.value || "<function>";
  }
  if (key === "arguments" && parent && parent.callee) {
    const callee = parent.callee;
    const method = callee.type === "MemberExpression"
      ? callee.property.name || callee.property.value || "method"
      : callee.name || "call";
    return `${method} callback`;
  }
  return key || "<function>";
}

function add(map, key, row) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(row);
}

function countAstNodes(value) {
  if (!value || typeof value !== "object") return 0;
  if (Array.isArray(value)) return value.reduce((sum, child) => sum + countAstNodes(child), 0);
  let count = typeof value.type === "string" ? 1 : 0;
  for (const [key, child] of Object.entries(value)) {
    if (["loc", "start", "end", "extra", "leadingComments", "trailingComments", "innerComments", "comments", "tokens"].includes(key)) continue;
    count += countAstNodes(child);
  }
  return count;
}

function inspectFile(filePath, functions, strings, regexes, statementRuns, errors) {
  const source = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    ast = babel.parseSync(source, {
      babelrc: false,
      configFile: false,
      filename: filePath,
      parserOpts: {
        sourceType: "unambiguous",
        plugins: ["jsx", "classProperties", "classPrivateProperties", "classPrivateMethods", "dynamicImport", "optionalChaining", "nullishCoalescingOperator"],
      },
    });
  } catch (error) {
    errors.push({ file: path.relative(ROOT, filePath), message: error.message });
    return;
  }
  function visit(node, parent, key, owner) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, parent, key, owner);
      return;
    }
    let childOwner = owner;
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ObjectMethod|ClassMethod|ClassPrivateMethod)$/.test(node.type) && node.body) {
      childOwner = displayName(node, parent, key);
      const count = countAstNodes(node.body);
      if (count >= MIN_FUNCTION_NODES) {
        add(functions, digest({ params: canonical(node.params || []), body: canonical(node.body), async: !!node.async, generator: !!node.generator }), {
          file: path.relative(ROOT, filePath), line: node.loc.start.line,
          name: displayName(node, parent, key), nodes: count,
        });
      }
    }
    if (node.type === "StringLiteral" && node.value.length >= 8 && node.value.length <= MAX_STRING_LENGTH) {
      add(strings, node.value, { file: path.relative(ROOT, filePath), line: node.loc.start.line });
    }
    if (node.type === "RegExpLiteral") {
      const pattern = `/${node.pattern}/${node.flags}`;
      add(regexes, pattern, { file: path.relative(ROOT, filePath), line: node.loc.start.line });
    }
    const statements = node.type === "Program" || node.type === "BlockStatement" || node.type === "SwitchCase" ? node.body || node.consequent : null;
    if (Array.isArray(statements) && statements.length >= 3) {
      for (let index = 0; index <= statements.length - 3; index += 1) {
        const run = statements.slice(index, index + 3);
        const size = countAstNodes(run);
        if (size >= 12) add(statementRuns, digest(run.map(canonical)), {
          file: path.relative(ROOT, filePath), line: run[0].loc.start.line,
          owner: owner || "<module>", nodes: size,
        });
      }
    }
    for (const [childKey, value] of Object.entries(node)) {
      if (["loc", "extra", "leadingComments", "trailingComments", "innerComments"].includes(childKey)) continue;
      visit(value, node, childKey, childOwner);
    }
  }
  visit(ast, null, null);
}

function groups(map, predicate, sort) {
  return [...map.entries()].filter(([key, rows]) => predicate(key, rows)).map(([key, rows]) => ({ value: key, count: rows.length, files: new Set(rows.map((row) => row.file)).size, occurrences: rows })).sort(sort);
}

function sourceLineCount(source) {
  const lines = source.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return {
    lines: lines.length,
    nonBlankLines: lines.filter((line) => line.trim().length > 0).length,
  };
}

function isScannedSource(relative) {
  if (!SEARCH_ROOTS.some((root) => relative.startsWith(root + "/"))) return false;
  if (!relative.endsWith(".js") || relative.endsWith(".test.js")) return false;
  if (relative === "scripts/audit/ast-repetition.js") return false;
  return !relative.split("/").some((part) => OMIT_DIRS.has(part));
}

function collectSourceLineMetrics(filePaths, readSource) {
  const metrics = {};
  for (const relative of filePaths) {
    if (!isScannedSource(relative)) continue;
    const root = relative.split("/")[0];
    const counts = sourceLineCount(readSource(relative));
    if (!metrics[root]) metrics[root] = { files: 0, lines: 0, nonBlankLines: 0 };
    metrics[root].files += 1;
    metrics[root].lines += counts.lines;
    metrics[root].nonBlankLines += counts.nonBlankLines;
  }
  return metrics;
}

function baseLineMetrics(ref) {
  if (!ref) return null;
  const files = execFileSync("git", ["ls-tree", "-r", "--name-only", ref], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim().split("\n").filter(Boolean);
  return collectSourceLineMetrics(files, (file) => execFileSync("git", ["show", `${ref}:${file}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  }));
}

function main() {
  const files = [];
  for (const root of SEARCH_ROOTS) walkFiles(path.join(ROOT, root), files);
  files.sort();
  const functions = new Map();
  const strings = new Map();
  const regexes = new Map();
  const statementRuns = new Map();
  const errors = [];
  for (const file of files) inspectFile(file, functions, strings, regexes, statementRuns, errors);

  const repeatedFunctions = groups(functions, (_, rows) => rows.length >= 2,
    (a, b) => b.occurrences[0].nodes - a.occurrences[0].nodes || b.count - a.count);
  const repeatedStrings = groups(strings, (value, rows) => new Set(rows.map((row) => row.file)).size >= 4 && rows.length >= 5,
    (a, b) => b.files - a.files || b.count - a.count);
  const repeatedLocalStrings = groups(strings, (_, rows) => rows.length >= 3 && new Set(rows.map((row) => row.file)).size === 1,
    (a, b) => b.count - a.count || b.value.length - a.value.length);
  const repeatedRegexes = groups(regexes, (_, rows) => new Set(rows.map((row) => row.file)).size >= 2,
    (a, b) => b.files - a.files || b.count - a.count);
  const repeatedStatementRuns = groups(statementRuns, (_, rows) => rows.length >= 2,
    (a, b) => b.occurrences[0].nodes - a.occurrences[0].nodes || b.count - a.count);
  const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
  const baseRef = baseArg ? baseArg.slice("--base=".length) : null;
  const currentFilePaths = files.map((file) => path.relative(ROOT, file).split(path.sep).join("/"));
  const currentLineMetrics = collectSourceLineMetrics(currentFilePaths, (file) => fs.readFileSync(path.join(ROOT, file), "utf8"));
  const baseMetrics = baseLineMetrics(baseRef);
  const result = {
    roots: SEARCH_ROOTS,
    excluded: ["tests", "*.test.js", "support/testing", "dist", ".generated", "node_modules", ".git", "this scanner"],
    filesScanned: files.length,
    sourceLineMetrics: currentLineMetrics,
    lineMetricsBase: baseRef,
    baseSourceLineMetrics: baseMetrics,
    parseErrors: errors,
    exactFunctionGroups: repeatedFunctions.length,
    repeatedStringGroups: repeatedStrings.length,
    repeatedLocalStringGroups: repeatedLocalStrings.length,
    repeatedRegexGroups: repeatedRegexes.length,
    exactStatementRunGroups: repeatedStatementRuns.length,
    repeatedFunctions,
    repeatedStrings,
    repeatedLocalStrings,
    repeatedRegexes,
    repeatedStatementRuns,
  };
  const jsonArg = process.argv.find((arg) => arg.startsWith("--json="));
  if (jsonArg) fs.writeFileSync(path.resolve(jsonArg.slice("--json=".length)), JSON.stringify(result, null, 2) + "\n");
  console.log(`Scanned ${files.length} files; ${errors.length} parse errors.`);
  console.log(`Exact functions: ${repeatedFunctions.length}; 3-statement windows: ${repeatedStatementRuns.length}; cross-file strings: ${repeatedStrings.length}; same-file strings: ${repeatedLocalStrings.length}; regexes: ${repeatedRegexes.length}.`);
  const lineTotals = Object.values(result.sourceLineMetrics).reduce((sum, metrics) => sum + metrics.lines, 0);
  const codeLineTotals = Object.values(result.sourceLineMetrics).reduce((sum, metrics) => sum + metrics.nonBlankLines, 0);
  console.log(`Source lines: ${lineTotals} total / ${codeLineTotals} nonblank (${Object.entries(result.sourceLineMetrics).map(([root, metrics]) => `${root}=${metrics.lines}/${metrics.nonBlankLines}`).join(", ")}).`);
  if (baseMetrics) {
    const baseLines = Object.values(baseMetrics).reduce((sum, metrics) => sum + metrics.lines, 0);
    const baseCodeLines = Object.values(baseMetrics).reduce((sum, metrics) => sum + metrics.nonBlankLines, 0);
    console.log(`Base ${baseRef}: ${baseLines} total / ${baseCodeLines} nonblank JS lines; delta: ${lineTotals - baseLines} total / ${codeLineTotals - baseCodeLines} nonblank.`);
  }
  console.log("Largest exact function groups:");
  for (const group of repeatedFunctions.slice(0, 8)) {
    console.log(`  ${group.occurrences.map((row) => `${row.file}:${row.line} ${row.name}`).join(" | ")}`);
  }
  console.log("Largest exact statement windows:");
  for (const group of repeatedStatementRuns.slice(0, 8)) {
    console.log(`  ${group.occurrences.map((row) => `${row.file}:${row.line} ${row.owner}`).join(" | ")}`);
  }
  console.log("Frequent literals: " + repeatedStrings.slice(0, 8).map((group) => `${JSON.stringify(group.value)} (${group.count}/${group.files} files)`).join(", "));
  console.log("Repeated literals within one file:");
  for (const group of repeatedLocalStrings.slice(0, 12)) {
    console.log(`  ${JSON.stringify(group.value)} (${group.count}x) ${group.occurrences[0].file}:${group.occurrences.map((row) => row.line).join(",")}`);
  }
  console.log("Frequent regexes: " + repeatedRegexes.slice(0, 8).map((group) => `${group.value} (${group.count}/${group.files} files)`).join(", "));
  for (const error of errors) console.error(`${error.file}: ${error.message}`);
  if (errors.length) process.exitCode = 1;
}

main();
