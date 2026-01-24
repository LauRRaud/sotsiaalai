import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const CSS_DIRS = [path.join(ROOT, "app", "styles")];

const CODE_DIRS = [
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "src"),
  path.join(ROOT, "pages"),
  path.join(ROOT, "lib"),
];

const CODE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mdx"]);
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "generated",
  "coverage",
  "analyze",
  "public",
  "dist",
]);

const stripComments = (content) => content.replace(/\/\*[\s\S]*?\*\//g, "");
const stripStrings = (content) =>
  content.replace(/(["'])(?:\\.|(?!\1).)*\1/g, "");

const walk = async (dir, fileFilter) => {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return files;
    throw error;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, fileFilter)));
    } else if (entry.isFile() && fileFilter(full)) {
      files.push(full);
    }
  }
  return files;
};

const isCssFile = (file) => file.endsWith(".css");
const isCodeFile = (file) => CODE_EXTS.has(path.extname(file));

const collectCssClasses = async (file) => {
  const raw = await fs.readFile(file, "utf8");
  const withoutComments = stripComments(raw);
  const withoutStrings = stripStrings(withoutComments);
  const classMatches = withoutStrings.matchAll(/\.([A-Za-z0-9_-]+)\b/g);
  const classes = new Set();
  for (const match of classMatches) {
    const name = match[1];
    if (!name) continue;
    classes.add(name);
  }
  return classes;
};

const collectCodeTokens = async (files) => {
  const tokens = new Set();
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const matches = content.matchAll(/[A-Za-z0-9_-]+/g);
    for (const match of matches) {
      tokens.add(match[0]);
    }
  }
  return tokens;
};

const relative = (file) => path.relative(ROOT, file).replace(/\\/g, "/");

const run = async () => {
  const showAll = process.argv.includes("--all");
  const cssFiles = [];
  for (const dir of CSS_DIRS) {
    cssFiles.push(...(await walk(dir, isCssFile)));
  }

  const codeFiles = [];
  for (const dir of CODE_DIRS) {
    codeFiles.push(...(await walk(dir, isCodeFile)));
  }

  if (cssFiles.length === 0) {
    console.log("[legacy-css-unused] No CSS files found.");
    return;
  }

  const tokens = await collectCodeTokens(codeFiles);
  const fileClassMap = new Map();
  const allClasses = new Set();

  for (const file of cssFiles) {
    const classes = await collectCssClasses(file);
    fileClassMap.set(file, classes);
    for (const cls of classes) allClasses.add(cls);
  }

  const unusedByFile = [];
  const usedClasses = new Set();
  const unusedClasses = new Set();

  for (const cls of allClasses) {
    if (tokens.has(cls)) {
      usedClasses.add(cls);
    } else {
      unusedClasses.add(cls);
    }
  }

  for (const [file, classes] of fileClassMap.entries()) {
    const unused = [];
    for (const cls of classes) {
      if (unusedClasses.has(cls)) unused.push(cls);
    }
    unusedByFile.push({ file, unused });
  }

  unusedByFile.sort((a, b) => b.unused.length - a.unused.length);

  console.log("legacy-css-unused:");
  console.log(`- css files: ${cssFiles.length}`);
  console.log(`- code files: ${codeFiles.length}`);
  console.log(`- classes found: ${allClasses.size}`);
  console.log(`- used classes: ${usedClasses.size}`);
  console.log(`- unused candidates: ${unusedClasses.size}`);

  if (unusedClasses.size === 0) return;

  console.log("\nUnused by file:");
  for (const entry of unusedByFile) {
    if (entry.unused.length === 0) continue;
    console.log(`- ${relative(entry.file)} (${entry.unused.length})`);
    if (showAll) {
      const sorted = [...entry.unused].sort();
      console.log(`  ${sorted.join(", ")}`);
    }
  }

  if (!showAll) {
    console.log("\nTip: run with --all to list class names.");
  }
};

run().catch((error) => {
  console.error("[legacy-css-unused] Failed:", error);
  process.exitCode = 1;
});
