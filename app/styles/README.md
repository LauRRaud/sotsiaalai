# app/styles ownership

Structure after the 2026-06 restructure (plan + execution log:
`reports/css-struktuuriplaan-2026-06-11.md`).

## Layout

- `tokens.css`, `globals.css` — global entry. globals imports tokens, themes,
  base, shared aggregators and the mobile chain (`mobile/index.css` under
  `max-width: 768px`).
- `base/` — core, typography, animations, backgrounds, layout. Truly global.
- `theme/` — theme palettes and cross-feature overrides (light, mid, dark,
  night, mono, hc). Feature-owned theme rules are being moved out
  (chat and profile hc/mono already live under `features/`); the long-term
  goal (plan etapp 6) is themes-as-variables in tokens.css.
- `shared/` — UI used on many routes: glass surfaces (`glass-core.css`),
  the glow system (`ui-glow.css`), register/login controls (`register.css`,
  used by LoginModal on every public page). Loaded globally through the
  `components/glass.css` aggregator.
- `features/<name>/` — one folder per feature, route-imported via its
  `index.css`. Current verticals: `service-map`, `documents`, `chat`,
  `policy`, `home`, `profile`. Each folder may carry `desktop/shell`,
  `mobile`, `mono`, `hc` files; `index.css` documents its import order.
- `mobile/` — the shared mobile cascade (see `mobile/README.md` for
  per-file ownership). Feature mobile files have moved to `features/`.
- `components/`, `utilities/` — remaining shared files and compatibility
  aggregators (`chat-focus.css`, `documents-mode.css`, `glass.css`).
  Tombstone aggregators exist because tests read them; delete only after
  redirecting the tests.

## Rules

1. **A new rule goes to the feature folder that owns it**, not to a theme
   file or a monolith. If the rule is theme-specific, put it in the
   feature's `mono.css`/`hc.css`.
2. **Do not change cascade order when moving files.** Aggregators and
   `index.css` files preserve the original import order 1:1; keep it that
   way unless you are deliberately restructuring with visual verification.
3. **Mobile files without their own `@media` wrappers** rely on the chain's
   `max-width: 768px` condition. When route-importing such a file, import
   it with the same condition (see `features/policy/index.css`).
4. **Tests read CSS sources directly** (~131 references). Moving a file
   means updating test paths in the same commit, or extending the
   `legacyCssBundles` map in `scripts/register-node-test-loader.mjs`.
5. **Guards:** `npm run css:audit:check` (dead-selector ceiling, currently
   30 — the remainder are verified leaflet/dynamic false positives) and
   `npm run dup:check:ci` (jscpd CSS duplication threshold 7%, current
   level 6.34% — lower it after the etapp 6 theme variable-ization). Both run
   as part of `npm run check`. Raise limits only consciously, in the same
   commit as the justification.
