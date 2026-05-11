#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join("scripts", "config", "release-authority.json");

if (!fs.existsSync(filePath)) {
  throw new Error(`${filePath} is missing`);
}

const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
if (!content || Array.isArray(content) || typeof content !== "object") {
  throw new Error(`${filePath} must be a JSON object`);
}

if (Object.keys(content).length === 0) {
  throw new Error(`${filePath} must not be empty`);
}

console.log(`${filePath} is valid`);
