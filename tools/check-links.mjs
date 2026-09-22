#!/usr/bin/env node
/* Zero-dependency check of the built site in _site/:
   - every internal href/src/action resolves to a file
   - every root-relative URL carries the path prefix
   Usage: node tools/check-links.mjs [--prefix /janicrew/] */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, posix } from "node:path";

const args = process.argv.slice(2);
const prefixIdx = args.indexOf("--prefix");
const PREFIX = prefixIdx >= 0 ? args[prefixIdx + 1] : process.env.PATH_PREFIX || "/janicrew/";
const OUT = resolve("_site");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function exists(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  const rel = clean.startsWith(PREFIX) ? clean.slice(PREFIX.length) : clean.replace(/^\//, "");
  const fsPath = join(OUT, rel);
  if (!existsSync(fsPath)) return false;
  if (statSync(fsPath).isDirectory()) return existsSync(join(fsPath, "index.html"));
  return true;
}

const files = walk(OUT);
const attr = /\b(?:href|src|action|poster)=["']([^"']+)["']/g;
const srcset = /\bsrcset=["']([^"']+)["']/g;
let problems = 0;
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const urls = [];
  for (const m of html.matchAll(attr)) urls.push(m[1]);
  for (const m of html.matchAll(srcset)) {
    for (const part of m[1].split(",")) urls.push(part.trim().split(/\s+/)[0]);
  }
  for (const url of urls) {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(url)) continue;
    checked++;
    if (url.startsWith("/")) {
      if (!url.startsWith(PREFIX)) {
        console.error(`MISSING PREFIX  ${file.replace(OUT, "")}  ->  ${url}`);
        problems++;
        continue;
      }
      if (!exists(url)) {
        console.error(`BROKEN          ${file.replace(OUT, "")}  ->  ${url}`);
        problems++;
      }
    } else {
      // relative URL: resolve against the file's directory
      const base = dirname(file.replace(OUT, "")).replace(/\\/g, "/");
      const abs = posix.normalize(posix.join(base, url.split("#")[0].split("?")[0]));
      if (!existsSync(join(OUT, abs))) {
        console.error(`BROKEN (rel)    ${file.replace(OUT, "")}  ->  ${url}`);
        problems++;
      }
    }
  }
}

console.log(`${files.length} pages, ${checked} internal URLs checked, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
