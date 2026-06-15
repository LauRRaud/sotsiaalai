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
// Color serialization is NOT stable: a literal rgba(255,234,0,0.66) computes to
// hex "#ffea00a8", but rgba(var(--rgb),0.66) stays "rgba(255, 234, 0, .66)" —
// SAME paint, different string. Without canonicalizing, tokenization (the core
// hc.css cleanup) can never verify green. Parse every color to one canonical
// #rrggbbaa (alpha as a 0-255 byte, so 0.66 and #..a8 match) before comparing.
function parseColor(str) {
  const s = str.trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("") + "ff";
    else if (h.length === 4) h = h.split("").map((c) => c + c).join("");
    else if (h.length === 6) h = h + "ff";
    if (h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: parseInt(h.slice(6, 8), 16) };
  }
  m = s.match(/^rgba?\(([^)]*)\)$/i);
  if (m) {
    const p = m[1].split(/[,/\s]+/).filter(Boolean);
    if (p.length < 3) return null;
    const a = p[3] != null ? parseFloat(p[3]) : 1;
    return { r: Math.round(parseFloat(p[0])), g: Math.round(parseFloat(p[1])), b: Math.round(parseFloat(p[2])), a: Math.round(a * 255) };
  }
  return null;
}
const hex2 = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
function canonColor(str) {
  const c = parseColor(str);
  return c ? `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${hex2(c.a)}` : null;
}
function canonicalizeColors(val) {
  if (!val) return val;
  return val
    .replace(/rgba?\([^)]*\)/gi, (m) => canonColor(m) || m)
    .replace(/#[0-9a-fA-F]{3,8}\b/g, (m) => canonColor(m) || m);
}
function normalize(prop, val) {
  if (val == null) return val;
  let v = val;
  if (prop === "box-shadow" && v !== "none") {
    const kept = splitTopLevel(v).filter((l) => !isTransparentLayer(l));
    v = kept.length ? kept.join(", ") : "none";
  }
  return canonicalizeColors(v);
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
