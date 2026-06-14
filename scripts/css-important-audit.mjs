// !important + dead-code audit — STATIC (no browser), durable, fast.
//
// WHY: css-debt-roadmap.md names two debt roots; `!important` is their symptom
// (measured ~4637). This script inventories every `!important` declaration in
// app/styles/** and categorises it so the cleanup is data-driven, not a blind
// grep. It also lists CSS files imported by nobody (orphan candidates) and, if a
// css-effective-audit report is passed, folds in its "selector never renders"
// dead list so one document drives the whole cleanup.
//
// It does NOT need a running server or a browser — it reads the source CSS. For
// the RENDERED "which selector wins / which is override-dead" picture, pair this
// with scripts/css-page-report.mjs (headed) + scripts/css-effective-audit.mjs.
//
// Usage:
//   node scripts/css-important-audit.mjs \
//     [--glob "app/styles/**/*.css"] \
//     [--effective reports/css-effective-audit/<latest>.json]  (optional, folds in dead selectors) \
//     [--out reports/css-important-audit/<date>]
//
// Outputs:
//   important.md   — totals + per-file + per-property + per-category, prioritised
//   important.json — full per-declaration rows for programmatic use
//   orphans.md     — CSS files no import/@import references (delete candidates)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

const ROOT = process.cwd();

function parseArgs(argv) {
  const out = { glob: "app/styles/**/*.css", effective: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--glob") out.glob = argv[++i];
    else if (a === "--effective") out.effective = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.out) out.out = `reports/css-important-audit/${new Date().toISOString().slice(0, 10)}`;
  return out;
}

// Surface props are the Root-B theme-war battleground (css-debt-roadmap §Juur B).
const SURFACE = /^(background|background-color|background-image|box-shadow|color|border|border-color|border-top-color|border-right-color|border-bottom-color|border-left-color|backdrop-filter|-webkit-backdrop-filter|opacity|filter)$/;

// Classify the SELECTOR a !important declaration lives under.
function classifySelector(sel) {
  const tags = [];
  if (/:not\(\.theme-|:root\.theme-|\[data-contrast/.test(sel)) tags.push("theme-override"); // Root B
  if (/:is\([^)]*\)\s*:not\(/.test(sel) || (sel.match(/:not\(/g) || []).length >= 2) tags.push("not-chain"); // the :is():not() beast
  if (/::(before|after)/.test(sel)) tags.push("pseudo-el");
  if (/:hover|:focus|:active/.test(sel)) tags.push("state");
  return tags.length ? tags : ["plain"];
}

function loadEffectiveDead(file) {
  if (!file) return null;
  try {
    const j = JSON.parse(readFileSync(file, "utf8"));
    const dead = new Set();
    for (const e of j.deadNoElement ?? []) dead.add(`${e.file}:${e.line}`);
    return dead;
  } catch (e) {
    process.stderr.write(`  ⚠ --effective ${file}: ${String(e.message).split("\n")[0]}\n`);
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = fg.sync(args.glob, { cwd: ROOT, absolute: true, ignore: ["**/node_modules/**", "**/.next/**", "**/safety_snapshots/**"] }).sort();
  const dead = loadEffectiveDead(args.effective);

  const rows = [];            // one per !important declaration
  const perFile = new Map();
  const perProp = new Map();
  const perCat = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    const css = readFileSync(abs, "utf8");
    let root;
    try { root = postcss().process(css, { from: abs, parser: safeParser }).root; } catch { continue; }
    root.walkDecls((decl) => {
      if (!decl.important) return;
      const rule = decl.parent;
      const sel = rule && rule.type === "rule" ? rule.selector.replace(/\s+/g, " ").trim() : "(at-rule)";
      const prop = decl.prop.toLowerCase();
      const cats = classifySelector(sel);
      const line = decl.source?.start?.line ?? 0;
      rows.push({ file: rel, line, selector: sel.slice(0, 160), prop, surface: SURFACE.test(prop), cats, alsoDeadSelector: dead ? dead.has(`${rel}:${rule?.source?.start?.line}`) : undefined });
      bump(perFile, rel); bump(perProp, prop);
      for (const c of cats) bump(perCat, c);
    });
  }

  const surfaceCount = rows.filter((r) => r.surface).length;
  const themeOverrideCount = rows.filter((r) => r.cats.includes("theme-override")).length;

  // orphan CSS files: no import/@import anywhere references them
  const orphans = findOrphans(files);

  mkdirSync(args.out, { recursive: true });
  writeFileSync(path.join(args.out, "important.json"), JSON.stringify({ capturedAt: new Date().toISOString(), total: rows.length, surfaceCount, themeOverrideCount, rows }, null, 2));
  writeFileSync(path.join(args.out, "important.md"), importantMd(rows, perFile, perProp, perCat, surfaceCount, themeOverrideCount));
  writeFileSync(path.join(args.out, "orphans.md"), orphanMd(orphans));

  process.stderr.write(
    `\nwrote ${args.out}/\n` +
    `  !important total: ${rows.length}\n` +
    `  on surface props (Root B battleground): ${surfaceCount}\n` +
    `  under theme-override selectors: ${themeOverrideCount}\n` +
    `  orphan CSS files (no import): ${orphans.length}\n`
  );
}

function findOrphans(cssFiles) {
  // gather every import / @import target string across the repo's JS/CSS
  const refFiles = fg.sync(["app/**/*.{js,jsx,ts,tsx,css}", "components/**/*.{js,jsx,ts,tsx,css}"], { cwd: ROOT, absolute: true, ignore: ["**/node_modules/**", "**/.next/**"] });
  const referenced = new Set();
  for (const abs of refFiles) {
    let txt; try { txt = readFileSync(abs, "utf8"); } catch { continue; }
    // handle @import url("x.css"), @import "x.css", import "x.css", from "x.css"
    for (const m of txt.matchAll(/(?:@import\s+url\(\s*["']|@import\s+["']|import\s+["']|from\s+["'])([^"']+\.css)["']/g)) {
      referenced.add(path.basename(m[1]));
    }
  }
  return cssFiles
    .map((a) => path.relative(ROOT, a).replace(/\\/g, "/"))
    .filter((rel) => !referenced.has(path.basename(rel)));
}

function topN(map, n = 20) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function importantMd(rows, perFile, perProp, perCat, surfaceCount, themeOverrideCount) {
  const L = [`# !important audit — ${new Date().toISOString().slice(0, 10)}`, ""];
  L.push(`**Total \`!important\` declarations:** ${rows.length}`, "");
  L.push(`- on **surface props** (Root B theme-war: background/box-shadow/color/border/backdrop/opacity): **${surfaceCount}**`);
  L.push(`- under **theme-override selectors** (\`:not(.theme-)\`/\`:root.theme-\`/\`[data-contrast]\`): **${themeOverrideCount}**`, "");
  L.push("> Strategy (css-tailwind-cleanup-plan §1): these are a SYMPTOM. Surface-prop +");
  L.push("> theme-override `!important` dissolves when theming moves to `:root.theme-X { --token }`");
  L.push("> (Root B). Track this count as the progress metric — it should fall each slice.", "");
  L.push("## Top files", "", "| file | !important |", "|---|---|");
  for (const [f, c] of topN(perFile, 25)) L.push(`| \`${f}\` | ${c} |`);
  L.push("", "## Top properties", "", "| property | count | surface? |", "|---|---|---|");
  for (const [p, c] of topN(perProp, 25)) L.push(`| \`${p}\` | ${c} | ${SURFACE.test(p) ? "✓" : ""} |`);
  L.push("", "## By selector category", "", "| category | count |", "|---|---|");
  for (const [c, n] of [...perCat.entries()].sort((a, b) => b[1] - a[1])) L.push(`| ${c} | ${n} |`);
  L.push("", "## Highest-value targets (surface prop + theme-override, same selector)", "");
  const hot = rows.filter((r) => r.surface && r.cats.includes("theme-override"));
  const byFile = new Map();
  for (const r of hot) (byFile.get(r.file) || byFile.set(r.file, []).get(r.file)).push(r);
  for (const [f, rs] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
    L.push(`- \`${f}\` — ${rs.length} surface+theme-override \`!important\` (tokenise these first)`);
  }
  return L.join("\n");
}

function orphanMd(orphans) {
  const L = ["# Orphan CSS candidates (no import/@import references the basename)", "",
    "> A file whose basename is never imported anywhere. STRONG delete candidate, but",
    "> verify: some bundlers glob-import, and a test loader may reference it (see",
    "> register-node-test-loader.mjs legacyCssBundles). Confirm before deleting.", ""];
  if (!orphans.length) L.push("_none_");
  for (const o of orphans) L.push(`- \`${o}\``);
  return L.join("\n");
}

main();
