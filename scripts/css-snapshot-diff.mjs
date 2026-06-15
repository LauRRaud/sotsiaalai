// Diffs two computed-style snapshots produced by css-snapshot.mjs.
// Prints every (target, selector, theme/viewport, property) whose value moved.
// Exit 0 = identical (safe, no visual regression); exit 1 = differences found.
//
// Usage: node scripts/css-snapshot-diff.mjs <before.json> <after.json>

import { readFileSync } from "node:fs";

// --- normalization: ignore visually-meaningless noise ---------------------
// This app's glass/glow primitives (BorderGlow) emit a box-shadow with many
// FULLY TRANSPARENT layers (rgba(...,0)) whose blur/spread geometry jitters
// between otherwise-identical renders. Those layers paint nothing, so comparing
// them produces false positives. We drop transparent layers before diffing; a
// layer that becomes visible (alpha>0) is still caught because the kept-layer
// set then differs.
function splitTopLevel(s) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
function isTransparentLayer(layer) {
  if (/\btransparent\b/i.test(layer)) return true;
  const m = layer.match(/rgba?\(([^)]*)\)/i);
  if (m) {
    const parts = m[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length >= 4) {
      const a = parseFloat(parts[3]);
      if (!Number.isNaN(a) && a === 0) return true;
    }
  }
  return false;
}
function normalize(prop, val) {
  if (prop === "box-shadow" && val && val !== "none") {
    const kept = splitTopLevel(val).filter((l) => !isTransparentLayer(l));
    return kept.length ? kept.join(", ") : "none";
  }
  return val;
}
// --------------------------------------------------------------------------

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error("Usage: node scripts/css-snapshot-diff.mjs <before.json> <after.json>");
  process.exit(2);
}

const before = JSON.parse(readFileSync(beforePath, "utf8")).targets;
const after = JSON.parse(readFileSync(afterPath, "utf8")).targets;

let diffs = 0;
const missing = [];

for (const [target, sels] of Object.entries(before)) {
  for (const [sel, cells] of Object.entries(sels)) {
    for (const [cell, props] of Object.entries(cells)) {
      const a = after?.[target]?.[sel]?.[cell];
      if (props === null) {
        if (a !== null && a !== undefined) {
          console.log(`APPEARED  ${target} | ${sel} | ${cell} (was not found, now present)`);
          diffs++;
        }
        continue;
      }
      if (a === null || a === undefined) {
        missing.push(`DISAPPEARED ${target} | ${sel} | ${cell} (was present, now missing)`);
        diffs++;
        continue;
      }
      for (const [p, v] of Object.entries(props)) {
        if (normalize(p, a[p]) !== normalize(p, v)) {
          console.log(`CHANGED   ${target} | ${sel} | ${cell} | ${p}:\n    - ${v}\n    + ${a[p]}`);
          diffs++;
        }
      }
    }
  }
}
for (const m of missing) console.log(m);

if (diffs === 0) {
  console.log("✓ identical — no computed-style change across all selectors × themes × viewports");
  process.exit(0);
}
console.log(`\n✖ ${diffs} computed-style difference(s) — review before committing`);
process.exit(1);
