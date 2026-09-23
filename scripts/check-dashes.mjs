#!/usr/bin/env node
// Fails when any tracked or new (not ignored) text file contains an em dash or en dash.
// Rule source: AGENTS.md hard rule 1.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const SKIP_FILES = new Set(["pnpm-lock.yaml"]);
const BINARY_EXT = /\.(png|jpe?g|gif|ico|webp|woff2?|ttf|otf|pdf|zip)$/i;

/** Returns every dash hit in a text as { line, column, char }. Lines and columns are 1 based. */
export function findDashes(text) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (let col = 0; col < line.length; col += 1) {
      const ch = line[col];
      if (ch === EM_DASH || ch === EN_DASH) {
        hits.push({ line: index + 1, column: col + 1, char: ch === EM_DASH ? "em dash" : "en dash" });
      }
    }
  });
  return hits;
}

function listFiles() {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return [...new Set(out.split("\0").filter(Boolean))];
}

function isBinary(buffer) {
  const sample = buffer.subarray(0, 8000);
  return sample.includes(0);
}

function main() {
  let total = 0;
  for (const file of listFiles()) {
    const name = file.split("/").pop() ?? file;
    if (SKIP_FILES.has(name) || BINARY_EXT.test(file)) continue;
    let buffer;
    try {
      buffer = readFileSync(file);
    } catch {
      continue; // deleted in the working tree
    }
    if (isBinary(buffer)) continue;
    for (const hit of findDashes(buffer.toString("utf8"))) {
      total += 1;
      console.error(`${file}:${hit.line}:${hit.column} ${hit.char}`);
    }
  }
  if (total > 0) {
    console.error(`\ncheck:dashes found ${total} em or en dash(es). Use a comma, colon, period or "to".`);
    process.exit(1);
  }
  console.log("check:dashes passed");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
