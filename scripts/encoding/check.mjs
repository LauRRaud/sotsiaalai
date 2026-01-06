import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const TEXT_EXTS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".md",
  ".html",
  ".yml",
  ".yaml",
]);

const BAD_CHARS = ["\u2510", "\u012e", "\ufffd"]; // ┐, Į, �
const BAD_SEQ = "’┐Į";

function isTextFile(p) {
  return TEXT_EXTS.has(path.extname(p).toLowerCase());
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    if (name === "encoding" && path.basename(dir) === "scripts") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function hasUtf8Bom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

let problems = 0;

for (const file of walk(ROOT)) {
  if (!isTextFile(file)) continue;

  const buf = fs.readFileSync(file);
  const bom = hasUtf8Bom(buf);
  const text = buf.toString("utf8");

  const badCharHits = BAD_CHARS
    .map((ch) => ({ ch, n: text.split(ch).length - 1 }))
    .filter((x) => x.n > 0);

  const badSeqHits = text.includes(BAD_SEQ) ? text.split(BAD_SEQ).length - 1 : 0;

  if (bom || badCharHits.length || badSeqHits) {
    problems++;
    console.log(`\n${path.relative(ROOT, file)}`);
    if (bom) console.log("  - UTF-8 BOM: YES");
    if (badSeqHits) console.log(`  - "${BAD_SEQ}" occurrences: ${badSeqHits}`);
    for (const h of badCharHits) console.log(`  - bad char "${h.ch}" occurrences: ${h.n}`);
  }
}

if (problems) {
  console.error(`\nEncoding check: FAIL (${problems} file(s) with issues)\n`);
  process.exit(1);
} else {
  console.log("\nEncoding check: OK\n");
}
