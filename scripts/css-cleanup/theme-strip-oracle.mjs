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

  // Pass 2 — repair interacting oracles by GROUP-restore. An oracle may require
  // several markers simultaneously (e.g. a regex matching `{2,}` occurrences):
  // removing any single one still matches (re-aligns), so greedy single-restore
  // sees zero progress and bails. Instead, for each still-broken oracle, locate
  // its match region in the ORIGINAL css (where it is guaranteed to match) and
  // restore EVERY marker inside that region at once — making that byte-region
  // identical to the original, so the oracle matches again. Converges: each pass
  // restores ≥1 marker or we are done; worst case restores all (== original).
  for (;;) {
    let out = build();
    const broken = oracles.filter((rx) => !matches(rx, out));
    if (broken.length === 0) break;
    let changed = false;
    for (const rx of broken) {
      rx.lastIndex = 0;
      const m = rx.exec(css); // oracle matched the original by construction
      if (!m) continue;
      const s = m.index, e = m.index + m[0].length;
      for (let i = 0; i < occ.length; i++) {
        if (!keep[i] && occ[i].start >= s && occ[i].end <= e) { keep[i] = true; changed = true; }
      }
    }
    if (!changed) { for (let i = 0; i < occ.length; i++) keep[i] = true; break; } // truly stuck
  }

  const finalText = build();
  const keepCount = keep.filter(Boolean).length;
  let brokenOracles = 0;
  for (const rx of oracles) if (!matches(rx, finalText)) brokenOracles++;

  if (args.apply && brokenOracles === 0) writeFileSync(args.file, finalText);

  process.stderr.write(
    `${args.apply ? (brokenOracles === 0 ? "APPLIED" : "ABORTED (broken oracles!)") : "DRY-RUN"} ${args.file}\n` +
    `  oracles: ${oracles.length} | !important total: ${occ.length} | KEEP: ${keepCount} | STRIP: ${occ.length - keepCount} | final broken oracles: ${brokenOracles}\n`
  );
}

main();
