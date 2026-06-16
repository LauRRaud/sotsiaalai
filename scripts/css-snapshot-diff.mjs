// Diffs two computed-style snapshots produced by css-snapshot.mjs.
// Prints every (target, selector, theme/viewport, property) whose value moved.
// Exit 0 = identical (safe, no visual regression); exit 1 = differences found.
//
// Usage: node scripts/css-snapshot-diff.mjs <before.json> <after.json>

import { readFileSync, writeFileSync, existsSync } from "node:fs";

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
// transform serialization is NOT stable either: `transform: none` and the
// IDENTITY matrix `matrix(1, 0, 0, 1, 0, 0)` (or the 4x4 `matrix3d` identity)
// paint EXACTLY the same — no transform — but the browser reports one or the
// other depending on async layout/compositor state, producing false positives
// (e.g. chat .chat-dictate-btn/.chat-listen-btn flip none↔matrix between
// otherwise-identical renders). Collapse any identity matrix to "none". Only an
// EXACT identity collapses (epsilon for float drift); a real transform is kept.
const EPS = 1e-4;
function isIdentityMatrix(nums, identity) {
  if (nums.length !== identity.length) return false;
  return nums.every((n, i) => Number.isFinite(n) && Math.abs(n - identity[i]) < EPS);
}
const IDENTITY_2D = [1, 0, 0, 1, 0, 0];
const IDENTITY_3D = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function canonTransform(val) {
  if (!val) return val;
  const v = val.trim();
  if (v === "none") return "none";
  let m = v.match(/^matrix\(([^)]*)\)$/i);
  if (m) {
    const nums = m[1].split(/[,\s]+/).filter(Boolean).map(Number);
    if (isIdentityMatrix(nums, IDENTITY_2D)) return "none";
  }
  m = v.match(/^matrix3d\(([^)]*)\)$/i);
  if (m) {
    const nums = m[1].split(/[,\s]+/).filter(Boolean).map(Number);
    if (isIdentityMatrix(nums, IDENTITY_3D)) return "none";
  }
  return v;
}
function normalize(prop, val) {
  if (val == null) return val;
  let v = val;
  if (prop === "box-shadow" && v !== "none") {
    const kept = splitTopLevel(v).filter((l) => !isTransparentLayer(l));
    v = kept.length ? kept.join(", ") : "none";
  }
  if (prop === "transform" || prop === "-webkit-transform") {
    v = canonTransform(v);
  }
  v = canonicalizeColors(v);
  // CSS values are whitespace-insensitive between tokens. Multi-line custom
  // property values keep their source newlines/indent in the computed value, so
  // an LF→CRLF file change (or reflow) creates false diffs. Collapse all
  // whitespace runs to a single space.
  return v.replace(/\s+/g, " ").trim();
}
// --------------------------------------------------------------------------

// --- argv: <before> <after> [--noise <file>] [--emit-noise <file>] ---------
// --emit-noise: compare two CLEAN baselines and WRITE the set of differing
//   cells (the async render noise floor) instead of pass/fail. Unions into an
//   existing file, so capturing the baseline N times accumulates all noise.
// --noise: in a normal diff, IGNORE cells listed in the noise file. This makes
//   the manual "capture HEAD twice, build a noise-free gate" technique
//   automatic (see reports/css-important-reduction-method.md MÜRA-PÕRAND).
const positional = [];
let noisePath = null, emitNoisePath = null;
{
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--noise") noisePath = a[++i];
    else if (a[i] === "--emit-noise") emitNoisePath = a[++i];
    else positional.push(a[i]);
  }
}
const [beforePath, afterPath] = positional;
if (!beforePath || !afterPath) {
  console.error("Usage: node scripts/css-snapshot-diff.mjs <before.json> <after.json> [--noise <f>] [--emit-noise <f>]");
  process.exit(2);
}

const before = JSON.parse(readFileSync(beforePath, "utf8")).targets;
const after = JSON.parse(readFileSync(afterPath, "utf8")).targets;

// Stable key for a cell/property so noise can be matched across runs. Presence
// (APPEARED/DISAPPEARED) uses a sentinel prop so it can be filtered too.
const PRESENCE = "presence";
const cellKey = (target, sel, cell, prop) => [target, sel, cell, prop].join(" ");

// Collect every difference as a structured record (no printing yet).
const records = [];
for (const [target, sels] of Object.entries(before)) {
  for (const [sel, cells] of Object.entries(sels)) {
    for (const [cell, props] of Object.entries(cells)) {
      const a = after?.[target]?.[sel]?.[cell];
      if (props === null) {
        if (a !== null && a !== undefined)
          records.push({ kind: "appeared", key: cellKey(target, sel, cell, PRESENCE), line: `APPEARED  ${target} | ${sel} | ${cell} (was not found, now present)` });
        continue;
      }
      if (a === null || a === undefined) {
        records.push({ kind: "disappeared", key: cellKey(target, sel, cell, PRESENCE), line: `DISAPPEARED ${target} | ${sel} | ${cell} (was present, now missing)` });
        continue;
      }
      for (const [p, v] of Object.entries(props)) {
        if (normalize(p, a[p]) !== normalize(p, v))
          records.push({ kind: "changed", key: cellKey(target, sel, cell, p), line: `CHANGED   ${target} | ${sel} | ${cell} | ${p}:\n    - ${v}\n    + ${a[p]}` });
      }
    }
  }
}

if (emitNoisePath) {
  // Union with any existing noise set (multiple baseline pairs accumulate).
  const prev = existsSync(emitNoisePath) ? JSON.parse(readFileSync(emitNoisePath, "utf8")) : [];
  const set = new Set([...prev, ...records.map((r) => r.key)]);
  writeFileSync(emitNoisePath, JSON.stringify([...set], null, 0));
  console.log(`noise-floor: ${records.length} differing cell(s) this pair; ${set.size} total → ${emitNoisePath}`);
  process.exit(0);
}

let noiseSet = null;
if (noisePath && existsSync(noisePath)) noiseSet = new Set(JSON.parse(readFileSync(noisePath, "utf8")));

const shown = noiseSet ? records.filter((r) => !noiseSet.has(r.key)) : records;
const suppressed = records.length - shown.length;
for (const r of shown.filter((r) => r.kind !== "disappeared")) console.log(r.line);
for (const r of shown.filter((r) => r.kind === "disappeared")) console.log(r.line);

const noiseNote = suppressed > 0 ? ` (${suppressed} known-noise cell(s) ignored)` : "";
if (shown.length === 0) {
  console.log(`✓ identical — no computed-style change across all selectors × themes × viewports${noiseNote}`);
  process.exit(0);
}
console.log(`\n✖ ${shown.length} computed-style difference(s) — review before committing${noiseNote}`);
process.exit(1);
