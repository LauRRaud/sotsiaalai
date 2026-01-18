import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import postcss from "postcss";

// Only app and components
const DEFAULT_GLOBS = [
  "app/**/*.{js,jsx,css}",
  "components/**/*.{js,jsx,css}",

  // Common exclusions
  "!**/node_modules/**",
  "!**/dist/**",
  "!**/build/**",
  "!**/.next/**",
  "!**/.output/**",
  "!**/coverage/**",

  // Optional: avoid minified artifacts if any happen to live under app/components
  "!**/*.min.js",
  "!**/*.min.css",
];

function babelPluginsFor(ext) {
  const plugins = [];
  if (ext === ".jsx") plugins.push("jsx");

  // "Just works" set for modern JS syntax
  plugins.push(
    "importMeta",
    "dynamicImport",
    "topLevelAwait",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
    "optionalChaining",
    "nullishCoalescingOperator"
  );

  return plugins;
}

async function stripJsLikeComments(filePath, code) {
  const ext = path.extname(filePath).toLowerCase();

  const ast = parse(code, {
    sourceType: "unambiguous",
    allowReturnOutsideFunction: true,
    plugins: babelPluginsFor(ext),

    // Be forgiving, but don't attach/emit comments
    errorRecovery: true,
    attachComment: false,
    comments: false,
  });

  const out = generate(
    ast,
    {
      // Do not emit any comments
      comments: false,

      // Prefer clean output (avoid leaving blank lines where comments used to be)
      retainLines: false,
      compact: false,
    },
    code
  );

  return out.code;
}

async function stripCssComments(code) {
  const root = postcss.parse(code);
  root.walkComments((c) => c.remove()); // removes /* ... */ comments
  return root.toString();
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const original = await fs.readFile(filePath, "utf8");

  let updated = original;

  if (ext === ".js" || ext === ".jsx") {
    updated = await stripJsLikeComments(filePath, original);
  } else if (ext === ".css") {
    updated = await stripCssComments(original);
  } else {
    return { changed: false };
  }

  if (updated !== original) {
    await fs.writeFile(filePath, updated, "utf8");
    return { changed: true };
  }

  return { changed: false };
}

async function main() {
  const files = await fg(DEFAULT_GLOBS, { dot: true });

  let changed = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const res = await processFile(file);
      if (res.changed) changed++;
    } catch (e) {
      failed++;
      console.error(`[FAIL] ${file}\n${e?.message || e}`);
    }
  }

  console.log(`Done. Changed: ${changed}, Failed: ${failed}, Total: ${files.length}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
