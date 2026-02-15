# Platform Production Audit

## Goal

Production-ready platform without total rewrite.
We review file-by-file and keep one running document of:
- what each file/page/system does
- what is already good
- what is risky or missing
- what action is needed before launch

## Working Method (for each review step)

For every file or module we log:
- Scope: what this file is responsible for
- Good: what is already production-safe
- Risk: bugs, regressions, security/performance debt
- Action: concrete fix or follow-up
- Status: `OK`, `MONITOR`, or `FIX`
- Date and owner

## Baseline Snapshot (2026-02-15)

Checks executed:
- `npm run check`: PASS (initially had 2 lint warnings, 0 errors)
- `npm run build`: PASS
- `npm run encoding:check`: FAIL -> fixed -> PASS
- `npm run lint`: PASS (warnings fixed)

Encoding fixes applied (BOM removed):
- `.github/workflows/css-guardrails.yml`
- `analyze/css-audit.md`
- `components/HomeSections/HomeAboutSection.jsx`
- `components/HomeSections/HomeFooter.jsx`
- `docs/migration-status.md`
- `scripts/check-legacy-css.mjs`
- `scripts/strip-comments.mjs`

## First Review Log

### Routing and docs
- Scope: route inventory docs
- Good: route map exists and is easy to maintain
- Risk: route docs were stale versus real app routes
- Action: updated `docs/routes.txt` and `docs/migration-status.md`
- Status: `OK`

### `app/layout.js`
- Scope: global metadata, fonts, locale, providers, root layout
- Good: locale bootstrapping and session wiring are in place; PWA metadata present
- Risk: none critical from first pass
- Action: keep monitoring metadata and i18n text integrity during later passes
- Status: `MONITOR`

### `app/providers.jsx`
- Scope: session/i18n/a11y providers and route-level scroll lock cleanup
- Good: clear provider order; stale scroll-lock cleanup on navigation
- Risk: none critical from first pass
- Action: no immediate change
- Status: `OK`

### `next.config.mjs`
- Scope: Next runtime config, security headers, SVG tooling
- Good: secure headers and production HSTS are configured
- Risk: none critical from first pass
- Action: no immediate change
- Status: `OK`

### `auth.js` and `proxy.js`
- Scope: auth flow, redirect safety, locale redirects
- Good: internal redirect normalization and host allowlisting exist
- Risk: none critical from first pass
- Action: deeper pass later on edge-cases and auth abuse scenarios
- Status: `MONITOR`

### `components/LoginModal.jsx`
- Scope: login PIN keypad and auth modal interaction
- Good: lint issues were low-risk and quickly fixable
- Risk: none critical after fix from first pass
- Action: removed unnecessary hook dependency and replaced hardcoded `0` with dynamic key rendering
- Status: `OK`

### `components/alalehed/ChatBody.jsx` -> `components/alalehed/chat/ChatBodyView.jsx`
- Scope: chat screen composition refactor (container logic vs presentational layout)
- Good: render tree was extracted cleanly; behavior wiring remains explicit through props
- Risk: large prop surface can become harder to maintain and easier to break in future edits
- Action: keep as-is for now; consider grouping related props (rail, composer, analysis) into scoped objects in next cleanup pass
- Status: `MONITOR`

### `package.json`
- Scope: operational scripts for CI/local workflows
- Good: separate scripts exist for build/lint/i18n/encoding checks
- Risk: `test` currently maps to `npm run dev`, which is misleading for CI/release checks
- Action: decide whether to wire `test` to real automated tests or rename script usage in pipelines
- Status: `MONITOR`

## Open Items Queue (next passes)

1. `app/api/chat/route.js` and related chat routes (error handling, rate limits, observability)
2. `app/api/rooms/**` real-time path review (authz + stream behavior)
3. `prisma/schema.prisma` + migrations sanity pass for launch
4. Remove or archive unclear legacy artifact `app/server` if not used
5. Align `test` script semantics (`package.json`) with actual test strategy
