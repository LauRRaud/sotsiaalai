// Precise theme-file !important stripper. The cascade audit proved theme
// overrides win by specificity without !important (render-redundant); the ONLY
// reason to keep a marker is a source-text contract test. This tool uses the
// tests' own regex literals as the oracle — no fragile value parsing.
//
// Method (all in-process, no browser, no npm spawn — milliseconds):
//   1. Extract every regex literal from the given test files.
//   2. Keep the ones that currently MATCH the theme file → "oracles" (regexes
//      meant for other files won't match, so they self-exclude).
//   3. For each ` !important` occurrence: tentatively remove just that one and
//      re-test the oracles. If any oracle that matched the full file now FAILS,
//      this marker is contract-asserted → KEEP. Otherwise it is safe to STRIP.
//   4. Apply all safe strips at once, then re-verify every oracle still matches.
//
// Marker necessity is independent per declaration for regex matching, so the
// one-at-a-time check is exact. Always run `npm test` after --apply as the final
// gate (and css-snapshot-diff for render).
//
// Usage:
//   node scripts/css-cleanup/theme-strip-oracle.mjs \
//     --file app/styles/theme/hc.css --tests t1.test.js,t2.test.js [--apply]

import { readFileSync, writeFileSync } from "node:fs";

function parseArgs(argv) {
  const out = { file: null, tests: [], apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") out.file = argv[++i];
    else if (a === "--tests") out.tests = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--apply") out.apply = true;
  }
  if (!out.file || !out.tests.length) throw new Error("--file and --tests required");
  return out;
}

// Extract JS regex literals from source. Regex literals are single-line; this
// matches /.../ with escapes and character classes, ignoring obvious non-regex
// contexts by requiring the body to be non-trivial.
function extractRegexLiterals(src) {
  const re = /\/((?:[^/\\\n[]|\\.|\[(?:[^\]\\]|\\.)*\])+)\/([gimsuy]*)/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const [, body, flags] = m;
    if (body.length < 4) continue; // skip trivial / likely-division
    try {
      out.push(new RegExp(body, flags));
    } catch {
      /* not a valid regex literal in this context — skip */
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const css = readFileSync(args.file, "utf8");

  // Oracles = regex literals from tests that currently match this theme file.
  const oracles = [];
  for (const tf of args.tests) {
    for (const rx of extractRegexLiterals(readFileSync(tf, "utf8"))) {
      rx.lastIndex = 0;
      if (rx.test(css)) oracles.push(rx);
    }
  }

  // All ` !important` (with leading whitespace) occurrences.
  const occRe = /\s*!important/g;
  const occ = [];
  let m;
  while ((m = occRe.exec(css))) occ.push({ start: m.index, end: m.index + m[0].length });

  // keep[i] = retain this marker. Rebuild the stripped text from keep[].
  const keep = new Array(occ.length).fill(false);
  const build = () => {
    let out = "";
    let cur = 0;
    for (let i = 0; i < occ.length; i++) {
      if (keep[i]) continue;
      out += css.slice(cur, occ[i].start);
      cur = occ[i].end;
    }
    return out + css.slice(cur);
  };
  const matches = (rx, text) => { rx.lastIndex = 0; return rx.test(text); };

  // Pass 1 — per-marker necessity: removing marker i alone breaks an oracle.
  for (let i = 0; i < occ.length; i++) {
    const removed = css.slice(0, occ[i].start) + css.slice(occ[i].end);
    if (oracles.some((rx) => !matches(rx, removed))) keep[i] = true;
  }

  // Pass 2 — repair interacting oracles: an oracle spanning several markers may
  // still match when any single one is removed (re-aligns), yet break when many
  // go. Greedily restore the marker that fixes the most still-broken oracles,
  // until none remain. Converges (restoring all => original, all match).
  let out = build();
  for (;;) {
    const broken = oracles.filter((rx) => !matches(rx, out));
    if (broken.length === 0) break;
    let bestI = -1, bestFix = 0;
    for (let i = 0; i < occ.length; i++) {
      if (keep[i]) continue;
      keep[i] = true;
      const cand = build();
      const fix = broken.reduce((n, rx) => n + (matches(rx, cand) ? 1 : 0), 0);
      keep[i] = false;
      if (fix > bestFix) { bestFix = fix; bestI = i; }
    }
    if (bestI < 0) { for (let i = 0; i < occ.length; i++) keep[i] = true; break; } // safety
    keep[bestI] = true;
    out = build();
  }

  const keepCount = keep.filter(Boolean).length;
  let brokenOracles = 0;
  for (const rx of oracles) if (!matches(rx, out)) brokenOracles++;

  if (args.apply && brokenOracles === 0) writeFileSync(args.file, out);

  process.stderr.write(
    `${args.apply ? (brokenOracles === 0 ? "APPLIED" : "ABORTED (broken oracles!)") : "DRY-RUN"} ${args.file}\n` +
    `  oracles: ${oracles.length} | !important total: ${occ.length} | KEEP: ${keepCount} | STRIP: ${occ.length - keepCount} | final broken oracles: ${brokenOracles}\n`
  );
}

main();
