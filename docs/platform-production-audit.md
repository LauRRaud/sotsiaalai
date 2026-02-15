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
- Route coverage tracker: `docs/route-review-tracker.md` (every app/API route must be tracked there with status and notes)

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

### `app/api/chat/*` and `lib/chat/persistence.js`
- Scope: chat runtime API, analyze quota path, persistence safety
- Good: auth gates and ownership checks are already present on conversation read/list endpoints
- Risk: persistence layer accepted `convId` updates without ownership guard; analyze quota flow allowed DB-check bypass on non-quota errors
- Action: added ownership-safe writes in `persistAppend`/`persistDone`, added `convId` format validation in `app/api/chat/route.js`, hardened `analyze-file` auth/quota flow and added DB error handling in `analyze-usage`
- Status: `OK`

### Chat page end-to-end (`/vestlus`) + voice flows (`listen/speak/dictate`)
- Scope: full chat UI logic (`ChatBody*`, sidebar, room mode), stream fallback, `stt`/`tts` integrations
- Good: build/lint pass; chat streaming, room messaging, and voice APIs are wired coherently
- Risk:
  - new conversation creation did not switch active conversation due wrong callback argument
  - room SSE stream had cleanup/recheck weaknesses (admin recheck param missing and no reliable cancel cleanup)
  - room polling fallback could produce duplicate/out-of-order messages after SSE failure
  - dictation fallback error text contained mojibake
- Action:
  - fixed `components/ChatSidebar.jsx` new-chat switch flow
  - fixed `app/api/rooms/[roomId]/messages/stream/route.js` SSE cleanup and access recheck
  - fixed `components/rooms/useRoomMessages.js` merge/dedupe behavior for polling fallback
  - fixed dictation fallback copy in `components/chat/hooks/useSpeech.js`
- Status: `OK`

### Chat system deep map and production behavior pass
- Scope: documented concrete chat architecture, event bus, API/service usage, and launch checks
- Good:
  - full flow now captured in `docs/chat-page-system-map.md`
  - new conversation flow is immediate in sidebar -> chat body switch
  - room SSE reconnect cleanup hardened in `components/rooms/useRoomMessages.js`
  - source-request detection in `app/api/chat/route.js` no longer depends on mojibake regex artifacts
- Risk:
  - chat-adjacent API routes still contain hardcoded localized copy (i18n consistency debt)
  - `/api/stt` still lacks explicit server-side max payload guard
  - in-memory rate limiting in room message POST is not cross-instance safe
- Action:
  - added detailed operational doc for owner handover and production checks
  - fixed room reconnect timeout lifecycle cleanup
  - replaced fragile source-detection regex with deterministic token matching
- Status: `MONITOR`

### Chat/room API i18n normalization pass
- Scope: remove hardcoded user-facing strings from chat/room voice-related API routes and normalize UI-side error resolving
- Good:
  - routes now return key-first errors (`messageKey` + `message`) across:
    - `app/api/stt/route.js`
    - `app/api/tts/route.js`
    - `app/api/chat/run/route.js`
    - `app/api/chat/conversations/route.js`
    - `app/api/chat/conversations/[id]/route.js`
    - `app/api/chat/conversations/[id]/messages/route.js`
    - `app/api/chat/analyze-file/route.js`
    - `app/api/chat/analyze-usage/route.js`
    - `app/api/rooms/route.js`
    - `app/api/rooms/[roomId]/route.js`
    - `app/api/rooms/[roomId]/leave/route.js`
    - `app/api/rooms/[roomId]/members/route.js`
    - `app/api/rooms/[roomId]/messages/route.js`
    - `app/api/rooms/[roomId]/messages/[msgId]/route.js`
    - `app/api/rooms/[roomId]/messages/stream/route.js`
    - `app/api/rooms/[roomId]/read/route.js`
  - chat UI now resolves API keys safely via `resolveApiMessage` in:
    - `components/ChatSidebar.jsx`
    - `components/rooms/RoomsPage.jsx`
    - `components/chat/hooks/useChatAnalysisController.js`
  - fallback hardcoded room author/title labels were removed from server payloads; UI i18n fallback now owns labels
- Risk:
  - `api.*` keys were added with English values in all locale files; ET/RU phrasing quality pass still needed
- Action:
  - completed key coverage in `messages/en.json`, `messages/et.json`, `messages/ru.json`
- Status: `MONITOR`

### Chat stream 403 handling correction
- Scope: `/api/chat` error handling path in `components/chat/hooks/useChatStream.js`
- Good:
  - `401` remains auth redirect behavior
  - `403` is no longer treated as automatic sign-in redirect
  - subscription responses with `requireSubscription + redirect` now forward to backend-provided redirect target
- Risk:
  - backend still mixes key namespaces (`chat.error.*` and `api.*`) in some routes
- Action:
  - added structured payload parsing (`messageKey`/key-like `message`) and localized fallback handling for non-OK responses
  - normalized room-membership forbidden response in `app/api/chat/route.js` to `api.common.forbidden`
  - updated STT UI error handling in `components/chat/hooks/useSpeech.js` to resolve API `messageKey` payloads before generic fallback
- Status: `OK`

### Registration + email verification route pass
- Scope: `app/api/register/route.js`, `app/api/verify-email/route.js`
- Good:
  - both routes now use key-first API errors (`messageKey` + localized `message/error`) via server-side i18n catalogs
  - email templates moved to `messages/*` under `email.auth.verify.*`
  - registration keeps current behavior (account creation can succeed even if verify mail dispatch fails)
  - verification flow keeps token cleanup semantics and user-enumeration-safe resend behavior
- Risk:
  - `register` and `verify-email` repeat locale parsing and response helpers (duplication risk if conventions change)
  - `register` still sends success even when verification email dispatch fails; product decision should be confirmed
- Action:
  - removed hardcoded localized route text and encoding artifacts
  - added `api.auth.register.*` and `api.auth.verify.*` key coverage in locale files
  - marked both routes as reviewed in `docs/route-review-tracker.md`
- Status: `MONITOR`

### Subscription + profile route pass
- Scope: `app/api/subscription/route.js`, `app/api/profile/route.js`, `components/alalehed/TellimusBody.jsx`
- Good:
  - `subscription` route now returns consistent key-first API errors with locale resolution
  - `profile` route now returns localized `messageKey` payloads and uses shared verify-email templates
  - profile GET now has explicit DB error handling branch
  - subscription payload keeps operational fields (`status`, `isActive`, `daysLeft`) for UI logic
- Risk:
  - profile PUT still succeeds even if verify-email send fails (intentional continuity behavior, but product should confirm this)
  - locale helper/JSON helpers are still duplicated across multiple routes
- Action:
  - removed hardcoded localized text from subscription/profile route responses
  - wired subscription route to new `api.subscription.*` key namespace
  - fixed subscription UI active-state detection in `TellimusBody` to use `isActive` and uppercase `ACTIVE` fallback
  - marked both routes as reviewed in route tracker
- Status: `MONITOR`

### Invites route pass
- Scope: `app/api/invites/route.js`, `app/api/invites/[id]/accept/route.js`, `app/api/invites/[id]/resend/route.js`, `app/api/invites/[id]/revoke/route.js`, `components/invite/InviteModal.jsx`, `app/join/page.jsx`
- Good:
  - invite routes now return key-first errors (`messageKey`, localized `message/error`) consistently
  - invite and resend email templates moved to locale catalogs (`email.invite.create.*`, `email.invite.resend.*`)
  - invite modal and join accept now send locale explicitly so server-side text resolution is deterministic
  - active invite flow keeps existing business behavior (sponsorship rules, capacity limit, token rotation on resend)
- Risk:
  - invite rate limiting remains in-memory (not cross-instance coordinated)
  - invite creation still swallows outbound email send failures by design (invite record persists even if email send fails)
- Action:
  - removed hardcoded user-facing route strings and mojibake invite-email literals
  - added `api.invites.*` key coverage in locale files
  - fixed invite modal empty-email validation message in UI
  - marked invites stack as reviewed in route tracker
- Status: `MONITOR`

### Admin analytics + RAG ops route pass
- Scope: `app/api/admin/analytics/events/route.js`, `app/api/admin/analytics/summary/route.js`, `app/api/rag/[...path]/route.js`, `app/api/rag/selftest/route.js`, `lib/authz.js`
- Good:
  - admin analytics routes now use locale-aware key-first errors (`messageKey` + localized `message`) with explicit DB-failure fallback
  - RAG proxy and selftest routes now use the same key-first localized error contract
  - `lib/authz` now returns stable message keys instead of hardcoded text, improving consistency across dependent API routes
- Risk:
  - RAG/admin client UIs still contain large hardcoded text surfaces and should be migrated to i18n keys in a dedicated pass
  - RAG proxy rate limiting remains in-memory (not shared between instances)
- Action:
  - enforced admin access in `app/api/rag/[...path]/route.js` (previously accepted any authenticated session)
  - added `api.admin.analytics.*`, `api.rag.*`, and `api.rag.selftest.*` keys to locale catalogs
  - added shared auth key `api.common.subscription_required` for subscription-gated helpers
  - marked admin/rag API routes as reviewed in `docs/route-review-tracker.md`
- Status: `MONITOR`

### Admin app-route shell pass
- Scope: `app/admin/analytics/page.jsx`, `app/admin/rag/page.jsx`
- Good:
  - both pages are server-rendered and force dynamic/no-store behavior for operational freshness
  - both enforce session and admin-role gating before rendering the admin clients
- Risk:
  - route shells still contain hardcoded copy and locale lock details that are not key-driven yet
- Action:
  - marked both app routes as reviewed in route tracker; scheduled client-side admin UI i18n pass next
- Status: `MONITOR`

## Open Items Queue (next passes)

1. Add explicit rate limiting to chat endpoints (`app/api/chat/*`) to reduce abuse risk
2. Add payload size caps for `app/api/stt/route.js` and consider stronger abuse guards for voice endpoints
3. `prisma/schema.prisma` + migrations sanity pass for launch
4. Remove or archive unclear legacy artifact `app/server` if not used
5. Align `test` script semantics (`package.json`) with actual test strategy
6. Improve ET/RU wording quality for newly added `api.*` entries (currently functional but mostly English)
