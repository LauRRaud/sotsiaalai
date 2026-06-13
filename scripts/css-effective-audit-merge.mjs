#!/usr/bin/env node
// Merges two css-effective-audit.mjs JSON outputs from DISJOINT route sets.
//
// Logic:
//   combined dead        = dead in run A  ∩  dead in run B  (never seen anywhere)
//   combined state-no-op = seen in ≥1 run, never effective in any run where seen
//
// Usage:
//   node scripts/css-effective-audit-merge.mjs runA.json runB.json [--out merged.json]

import { readFileSync, writeFileSync } from "fs";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outFile = outIdx >= 0 ? args.splice(outIdx, 2)[1] : "reports/css-effective-audit/merged.json";
const [fileA, fileB] = args;
if (!fileA || !fileB) {
  process.stderr.write("usage: css-effective-audit-merge.mjs runA.json runB.json [--out out.json]\n");
  process.exit(1);
}

const a = JSON.parse(readFileSync(fileA, "utf8"));
const b = JSON.parse(readFileSync(fileB, "utf8"));

if (a.universe !== b.universe) {
  process.stderr.write(
    `WARNING: universe sizes differ (${a.universe} vs ${b.universe}) — CSS may have changed between runs\n`
  );
}

// Unique key per rule: file+line (one source location = one rule).
const key = (r) => `${r.file}:${r.line}`;

const deadA = new Set(a.deadNoElement.map(key));
const deadB = new Set(b.deadNoElement.map(key));
const noOpA = new Set(a.deadStateNoOp.map(key));
const noOpB = new Set(b.deadStateNoOp.map(key));

// effective_in_X: seen (not dead) AND not no-op → state actually changed something
const effectiveA = (k) => !deadA.has(k) && !noOpA.has(k);
const effectiveB = (k) => !deadB.has(k) && !noOpB.has(k);

// Combined dead: never seen in either run.
const combinedDeadMap = new Map();
for (const r of a.deadNoElement) {
  const k = key(r);
  if (deadB.has(k)) combinedDeadMap.set(k, r);
}
for (const r of b.deadNoElement) {
  const k = key(r);
  if (deadA.has(k) && !combinedDeadMap.has(k)) combinedDeadMap.set(k, r);
}
const combinedDead = [...combinedDeadMap.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

// Combined state-no-op: seen somewhere, never effective anywhere.
const combinedNoOpMap = new Map();
for (const r of a.deadStateNoOp) {
  const k = key(r);
  if (!effectiveA(k) && !effectiveB(k)) combinedNoOpMap.set(k, r);
}
for (const r of b.deadStateNoOp) {
  const k = key(r);
  if (!effectiveA(k) && !effectiveB(k) && !combinedNoOpMap.has(k)) combinedNoOpMap.set(k, r);
}
const combinedNoOp = [...combinedNoOpMap.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

const merged = {
  capturedAt: new Date().toISOString(),
  mergedFrom: [fileA, fileB],
  routes: (a.routes ?? 0) + (b.routes ?? 0),
  themes: a.themes,
  viewports: a.viewports,
  universe: a.universe,
  summary: {
    deadNoElement: combinedDead.length,
    deadStateNoOp: combinedNoOp.length,
  },
  deadNoElement: combinedDead,
  deadStateNoOp: combinedNoOp,
};

writeFileSync(outFile, JSON.stringify(merged, null, 2));
process.stderr.write(
  `merged → ${outFile}\n  dead (no element): ${combinedDead.length}\n  dead (state no-op): ${combinedNoOp.length}\n`
);
