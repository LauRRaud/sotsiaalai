# CSS/Tailwind cleanup runbook (snapshot-gated)

Repeatable process for working down the CSS debt (`reports/css-struktuuriplaan-2026-06-11.md` §9)
**one stage at a time, safely**. The safety comes from an objective gate — a
computed-style snapshot diff — not from human eyeballing. Because the gate is
objective, a cheaper/faster model (e.g. Sonnet 4.6) can execute a stage as long
as it follows this loop and the diff stays clean. Stages can be large if the
prep (baseline + clear target list) is done first.

## Why a snapshot gate
Contract tests do NOT catch visual regressions. The reliable proof that a CSS
change is safe is: **the computed styles of the affected elements are identical
before and after, across every theme and viewport.** That is exactly what
`scripts/css-snapshot.mjs` captures and `scripts/css-snapshot-diff.mjs` checks.

## Prerequisites
1. Dev server on http://localhost:3000 (`npm run dev`).
2. A way to authenticate the test account (pages are behind login):
   - the harness auto-generates a token via `scripts/tmp-create-login-token.mjs`
     (needs the dev DB / `.env.local`), or
   - pass `--token <t>`, or set env `SNAPSHOT_SESSION=<next-auth.session-token>`.

## The loop (per stage)
1. **Pick the target.** List the exact CSS selectors the stage touches and the
   properties it could affect (background, box-shadow, color, border,
   backdrop-filter, opacity, …). Put them in `scripts/css-snapshot.targets.json`
   (`route`, `auth`, `selectors`, `properties`). Prefer **stable, always-present
   selectors** — global classes or `[role=…]`, not module-hashed names that may
   be absent in some viewport/state. After the baseline, confirm the element was
   actually found (not `null`) in every cell you care about before trusting any
   later diff.
2. **Baseline:** `node scripts/css-snapshot.mjs --out reports/css-snapshots/<name>-before.json`
3. **Make the CSS change** (the cleanup edit).
4. **After:** `node scripts/css-snapshot.mjs --out reports/css-snapshots/<name>-after.json`
5. **Diff:** `node scripts/css-snapshot-diff.mjs <name>-before.json <name>-after.json`
   - `✓ identical` → the change is visually safe. Proceed to commit.
   - Any `CHANGED`/`DISAPPEARED` → either a regression to fix, or an intended
     change to confirm deliberately. Do not commit until you understand each line.
6. **Test + lint gate** (every commit):
   - `npm test` → baseline is **12 known failures** (+ 2 pre-existing RAG
     failures in `tests/rag/graphRetrieval.test.js` from uncommitted WIP — not
     yours). **No NEW failure** is allowed.
   - `npx jscpd app/styles --pattern "**/*.css"` → duplication should not rise.
   - Files stay **LF** (not CRLF). **Never** use PowerShell `Set-Content` on CSS
     (it corrupts UTF-8); edit with a normal editor / the Edit tool.
7. **Commit** one logical stage. End the message with
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## No guessed delays (but finite limits)
The harness never gates on a fixed sleep — it waits for real conditions (theme
actually applied via `waitForFunction`; render flushed via two animation frames).
Waits use generous-but-finite limits (nav 120s, actions/conditions 30s) so real
slowness (route compile) passes, but a dead/unreachable dev server errors instead
of hanging forever (a literal infinite wait hangs if the server dies mid-run).
`--keep-open` leaves a visible window open after capture for you to inspect/close.

## Viewports matter — cover every breakpoint band
CSS branches on width: main split `max-width:768px`, also `min-width:769px` and
the orbital `max-[640px]`. A snapshot at one width misses regressions at another.
Rule: the captured viewports must hit **both sides of every breakpoint the
target uses**, and be **identical before/after** (so continuous `clamp()` values
cancel in the diff — the diff then shows only real changes). The defaults 390 +
1920 (Full HD) straddle 640 and 768. If a target has *distinct* rules at both
640 and 768, add a width in (640, 768] (e.g. 700) via the target's `viewports` field. Width-
independent modes (data-ui-profile mac/lg, data-text-scale) are separate axes —
add them as extra captures only when the target's CSS keys off them.

## Dead-code removal (CSS + Tailwind) — a separate stream
Lots of old leftover code is unused and should go. Detection + caution:
- **Dead hand-CSS classes:** `npm run css:audit` reports `notSeen` selectors.
  High false-positive rate (dynamic class names, leaflet, rarely-opened UI) — so
  every candidate must be confirmed with a repo-wide grep (including dynamic
  string construction like `` `foo-${x}` ``) before deletion.
- **CSS files imported nowhere:** grep the import graph; an orphaned file is
  safe to delete once confirmed no `@import`/`import` references it (and no test
  reads it — see §1 tombstone note in the plan doc).
- **Dead components → dead Tailwind + module CSS:** Tailwind v4 tree-shakes
  unused utilities, so there is no shipped "unused Tailwind CSS"; dead Tailwind
  really means Tailwind classes on components/JSX that are never rendered. Find
  unused files/exports with `knip` (config in repo; see reports/knip-fresh.txt).
  Deleting a dead component removes its Tailwind usage and its `.module.css`.
- **Rules overridden into a no-op** (this session's pattern): a real declaration
  killed by a later `: none/0/transparent !important` — the overridden rule is
  dead. Confirm the override is unconditional (not a per-theme/viewport branch)
  before removing.
- **Verification caveat:** static detection finds candidates; the snapshot gate
  confirms removal did not change the captured states — but a class used only in
  a rare interactive state will not appear in a common-state snapshot, so grep +
  judgment remain necessary. When unsure, keep it and flag it.

## Safe for a cheaper model vs escalate
- **Safe (snapshot-gated, mechanical):** consolidating byte-identical per-theme
  rules; collapsing repeated `var(--x, fallback) !important` blocks; dropping a
  `:not(.theme-X)` token when the body is byte-identical (etapp 6c style);
  introducing a `var()` that a theme defines. The diff proves no-op.
- **Escalate / human review:** cascade-`@layer` migration (global, reorders
  everything); anything where the diff shows changes you cannot explain;
  specificity changes between `:not()` chains and `:root.theme-X` (default 6 vs
  mono 4 — pre-existing, see §6b).

## Concrete candidate backlog
- `app/styles/base/core.css` ~245–280: each theme sets four vars
  (`--glass-surface-bg` / `-ring-surface-bg` / `-modal-bg` / `--drawer-glass-bg`)
  to the same `var(--home-panel-bg, <fallback>) !important` — repetitive +
  `!important`. Candidate for collapsing.
- Rail tooltip theme block in `components/chat/rail.module.css`: six
  `:global(:root.theme-X) .tooltip { background: … }` rules could become one
  `.tooltip { background: var(--rail-tooltip-bg) }` + a per-theme `--rail-tooltip-bg`.
  (Note: the tooltip is conditionally rendered — snapshot it via an always-present
  proxy or trigger hover first.)
- §9 juur B surfaces generally: theming is already largely `var()`-based; the
  debt is `:not()`-chain structure + surface `!important`, not literals.

## Hard rules
- Do NOT touch the uncommitted `lib/rag/*` and other non-CSS WIP (another
  account's unfinished work; `graphRetrieval.js` breaks 2 tests by design-in-progress).
- Do NOT delete `safety_snapshots/` (intentional untracked backup).
- One stage per commit; never push with a new test failure.
