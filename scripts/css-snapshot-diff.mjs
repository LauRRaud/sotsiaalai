// Diffs two computed-style snapshots produced by css-snapshot.mjs.
// Prints every (target, selector, theme/viewport, property) whose value moved.
// Exit 0 = identical (safe, no visual regression); exit 1 = differences found.
//
// Usage: node scripts/css-snapshot-diff.mjs <before.json> <after.json>

import { readFileSync } from "node:fs";

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
        if (a[p] !== v) {
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
