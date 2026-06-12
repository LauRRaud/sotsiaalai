import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import fg from "fast-glob";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

const ROOT = process.cwd();

const DEFAULT_CSS_GLOBS = ["app/styles/**/*.css"];
const DEFAULT_SOURCE_GLOBS = [
  "app/**/*.{js,jsx,ts,tsx,mdx}",
  "components/**/*.{js,jsx,ts,tsx,mdx}",
  "lib/**/*.{js,jsx,ts,tsx,mdx}",
  "messages/**/*.{json}",
];
const IGNORE_GLOBS = [
  "**/.next/**",
  "**/node_modules/**",
  "**/.git/**",
  "**/coverage/**",
  "**/safety_snapshots/**",
];

const args = parseArgs(process.argv.slice(2));
const cssGlobs = args.css.length ? args.css : DEFAULT_CSS_GLOBS;
const sourceGlobs = args.sources.length ? args.sources : DEFAULT_SOURCE_GLOBS;
const top = args.top ?? 25;

const cssFiles = await fg(cssGlobs, { cwd: ROOT, absolute: true, ignore: IGNORE_GLOBS });
const sourceFiles = await fg(sourceGlobs, { cwd: ROOT, absolute: true, ignore: IGNORE_GLOBS });

if (!cssFiles.length) {
  console.error(`No CSS files matched: ${cssGlobs.join(", ")}`);
  process.exit(1);
}

const sourceCorpus = sourceFiles.map(file => fs.readFileSync(file, "utf8")).join("\n");
const sourceTokens = new Set(sourceCorpus.match(/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g) ?? []);

const rows = [];
let totalClasses = 0;
let totalUnused = 0;
let totalBytes = 0;

for (const file of cssFiles.sort()) {
  const css = fs.readFileSync(file, "utf8");
  totalBytes += Buffer.byteLength(css);

  const root = postcss().process(css, { from: file, parser: safeParser }).root;
  const classes = new Map();

  root.walkRules(rule => {
    for (const className of extractClassNames(rule.selector)) {
      if (!classes.has(className)) {
        classes.set(className, {
          className,
          line: rule.source?.start?.line ?? 1,
          selectors: new Set(),
        });
      }
      classes.get(className).selectors.add(rule.selector);
    }
  });

  const unused = [...classes.values()]
    .filter(entry => !sourceTokens.has(entry.className))
    .sort((a, b) => a.line - b.line || a.className.localeCompare(b.className));

  totalClasses += classes.size;
  totalUnused += unused.length;

  rows.push({
    file: path.relative(ROOT, file),
    bytes: Buffer.byteLength(css),
    classes: classes.size,
    seen: classes.size - unused.length,
    notSeen: unused.length,
    unused: unused.map(entry => ({
      className: entry.className,
      line: entry.line,
      selector: [...entry.selectors][0],
    })),
  });
}

rows.sort((a, b) => b.notSeen - a.notSeen || b.bytes - a.bytes);

if (args.json) {
  console.log(
    JSON.stringify(
      {
        cssGlobs,
        sourceGlobs,
        sourceFiles: sourceFiles.length,
        cssFiles: cssFiles.length,
        totalBytes,
        totalClasses,
        notSeenInSource: totalUnused,
        percentNotSeen: percent(totalUnused, totalClasses),
        files: rows,
      },
      null,
      2
    )
  );
  enforceMaxNotSeen();
  process.exit(0);
}

console.log(`CSS files: ${cssFiles.length}`);
console.log(`Source files scanned: ${sourceFiles.length}`);
console.log(`Raw CSS bytes: ${formatBytes(totalBytes)}`);
console.log(`Class selectors: ${totalClasses}`);
console.log(`Not seen in source: ${totalUnused} (${percent(totalUnused, totalClasses)}%)`);
console.log("");

console.table(
  rows.map(row => ({
    file: row.file,
    size: formatBytes(row.bytes),
    classes: row.classes,
    seen: row.seen,
    notSeen: row.notSeen,
  }))
);

if (top > 0) {
  console.log(`\nTop ${top} suspicious classes:`);
  const suspicious = rows.flatMap(row =>
    row.unused.map(entry => ({
      ...entry,
      file: row.file,
      fileNotSeen: row.notSeen,
    }))
  );

  suspicious.sort((a, b) => b.fileNotSeen - a.fileNotSeen || a.file.localeCompare(b.file) || a.line - b.line);

  for (const entry of suspicious.slice(0, top)) {
    console.log(`${entry.file}:${entry.line} .${entry.className}  ${entry.selector}`);
  }
}

console.log(
  "\nNote: this is a static heuristic. Dynamic class names, theme/body classes, media-only states and rarely opened UI can be false positives."
);

enforceMaxNotSeen();

function enforceMaxNotSeen() {
  if (args.maxNotSeen === undefined) return;
  if (totalUnused > args.maxNotSeen) {
    console.error(
      `\ncss:audit guard: notSeen ${totalUnused} exceeds --max-not-seen ${args.maxNotSeen}. ` +
        "Either remove the dead selectors or, for verified false positives (leaflet/dynamic classes), raise the limit consciously."
    );
    process.exit(1);
  }
  console.log(`\ncss:audit guard: notSeen ${totalUnused} <= ${args.maxNotSeen} OK`);
}

function extractClassNames(selector) {
  const names = new Set();
  const withoutEscapedDots = selector.replace(/\\\./g, "");
  const re = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
  let match;

  while ((match = re.exec(withoutEscapedDots))) {
    names.add(match[1]);
  }

  return names;
}

function parseArgs(argv) {
  const parsed = {
    css: [],
    sources: [],
    json: false,
    top: undefined,
    maxNotSeen: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--css") {
      parsed.css.push(requiredValue(argv, ++index, "--css"));
      continue;
    }

    if (arg === "--source" || arg === "--sources") {
      parsed.sources.push(requiredValue(argv, ++index, arg));
      continue;
    }

    if (arg === "--json") {
      parsed.json = true;
      continue;
    }

    if (arg === "--max-not-seen") {
      parsed.maxNotSeen = Number(requiredValue(argv, ++index, "--max-not-seen"));
      if (!Number.isFinite(parsed.maxNotSeen) || parsed.maxNotSeen < 0) {
        throw new Error("--max-not-seen must be a non-negative number");
      }
      continue;
    }

    if (arg === "--top") {
      parsed.top = Number(requiredValue(argv, ++index, "--top"));
      if (!Number.isFinite(parsed.top) || parsed.top < 0) {
        throw new Error("--top must be a non-negative number");
      }
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function requiredValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function percent(part, total) {
  return total ? Math.round((part / total) * 1000) / 10 : 0;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round((bytes / 1024) * 10) / 10} KB`;
}
