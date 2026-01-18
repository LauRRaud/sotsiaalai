import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import generatorPkg from "@babel/generator";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

// Fix for ESM/CJS interop: generator is usually in .default
const generate = generatorPkg.default ?? generatorPkg;

// Whole repo JS/JSX/CSS, with exclusions
const DEFAULT_GLOBS = [
  "**/*.{js,jsx,css}",

  "!**/node_modules/**",
  "!**/dist/**",
  "!**/build/**",
  "!**/.next/**",
  "!**/.output/**",
  "!**/coverage/**",

  "!**/*.min.js",
  "!**/*.min.css",

  "!**/*.bak*",
  "!**/*.txt",
  "!**/*.segment.*",
];

function babelPluginsFor(ext) {
  const plugins = [];

  // Next.js often uses JSX in .js files too
  if (ext === ".js" || ext === ".jsx") plugins.push("jsx");

  // Tolerant parsing (helps if some JS files include TS-ish syntax)
  plugins.push("typescript");

  plugins.push(
    "importMeta",
    "dynamicImport",
    "topLevelAwait",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
    "optionalChaining",
    "nullishCoalescingOperator",
    "objectRestSpread",
    "numericSeparator",
    "logicalAssignment",
    "privateIn",
    "optionalCatchBinding",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    "importAssertions",
    "importAttributes"
  );

  return plugins;
}

async function stripJsLikeComments(filePath, code) {
  const ext = path.extname(filePath).toLowerCase();

  const ast = parse(code, {
    sourceType: "unambiguous",
    allowReturnOutsideFunction: true,
    plugins: babelPluginsFor(ext),
    errorRecovery: true,
    attachComment: false,
    comments: false,
  });

  const out = generate(
    ast,
    {
      comments: false,
      retainLines: false,
      compact: false,
    },
    code
  );

  return out.code;
}

async function stripCssComments(code) {
  // safeParser makes CSS parsing more resilient
  const root = postcss.parse(code, { parser: safeParser });
  root.walkComments((c) => c.remove());
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
  // Allow passing globs / paths via CLI args:
  // node scripts/strip-comments.mjs "app/**/*.css" "lib/**/*.js"
  const patterns = process.argv.slice(2);
  const globs = patterns.length ? patterns : DEFAULT_GLOBS;

  const files = await fg(globs, { dot: true });

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
