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

### Admin analytics UI i18n pass
- Scope: `components/admin/AnalyticsDashboard.jsx`, `app/admin/analytics/AdminAnalyticsClient.jsx`, `app/admin/rag/RagAdminClient.jsx`, `app/admin/rag/page.jsx`, `app/admin/analytics/page.jsx`
- Good:
  - analytics dashboard now uses i18n keys for user-facing labels, filters, table headers, and metric cards
  - admin client loading fallbacks now read from i18n keys instead of hardcoded text
  - admin page metadata/title/back labels are now sourced via server-side message keys
- Risk:
  - `components/admin/RagAdminPanel.jsx` still contains a large amount of hardcoded localized copy and needs a dedicated migration pass
- Action:
  - added `admin.*` key namespace coverage in `messages/en.json`, `messages/et.json`, `messages/ru.json`
  - removed remaining hardcoded ET/mojibake copy from `AnalyticsDashboard` and admin wrappers
  - set next pass to full `RagAdminPanel` i18n + behavior review
- Status: `MONITOR`

### Admin RAG panel i18n + behavior pass
- Scope: `components/admin/RagAdminPanel.jsx`
- Good:
  - large hardcoded UI copy was replaced with key-driven i18n lookups (`admin.rag.*`)
  - API error handling now resolves `messageKey` payloads with localized fallback via `resolveApiMessage`
  - metadata template labels are key-driven and template content is loaded from static `.json` files instead of embedded inline blocks
  - locale-aware date formatting now follows active UI locale instead of fixed `et-EE`
- Risk:
  - panel remains large and dense; future changes should split ingest/list/detail subsections into smaller components
  - newly added key set in ET/RU is currently functional but still mostly English wording
- Action:
  - completed `RagAdminPanel` text cleanup (no hardcoded ET copy in admin UI surface)
  - added `admin.rag.*` namespace coverage in all locale catalogs
  - updated tracker scope and moved next review order to remaining app routes
- Status: `MONITOR`

### App route metadata + account-flow pass
- Scope: `app/page.js`, `app/join/page.jsx`, `app/profiil/page.js`, `app/taasta-parool/[token]/page.jsx`, `app/tellimus/page.js`, `app/ruum/page.js`, `app/kasutusjuhend/page.jsx`, `app/uuenda-epost/page.js`, `app/uuenda-pin/page.js`, `app/registreerimine/page.js`, `app/kasutustingimused/page.js`, `app/privaatsustingimused/page.js`, `components/alalehed/TellimusBody.jsx`
- Good:
  - route metadata fallback strings were removed from app route files and now resolve via locale catalogs (`messages/*`)
  - reset-token route now uses the same server metadata pattern as the rest of the app routes
  - subscription activation UI (`TellimusBody`) moved off demo-only flow to API-driven activation path
  - missing metadata namespaces were added for `meta.guide`, `meta.rooms`, and `meta.email_update`
- Risk:
  - this historical step was later replaced by Maksekeskus init/callback/webhook flow (tracked below)
  - ET/RU values for newly added meta keys are currently functional but still English wording
- Action:
  - completed metadata i18n cleanup for reviewed app routes
  - updated route tracker statuses for `/`, `/join`, `/profiil`, `/taasta-parool/[token]`, `/tellimus`
  - set next app-route review wave to remaining static content/account routes
- Status: `MONITOR`

### Registration/reset/email/legal app-route pass
- Scope: `app/registreerimine/page.js`, `app/uuenda-pin/page.js`, `app/uuenda-epost/page.js`, `app/kasutustingimused/page.js`, `app/privaatsustingimused/page.js`, `app/kasutusjuhend/page.jsx`, `components/alalehed/RegistreerimineBody.jsx`, `components/alalehed/UnustasinParooliBody.jsx`, `components/alalehed/UuendaEpostiBody.jsx`, `app/taasta-parool/[token]/ResetPasswordForm.jsx`, `components/LoginModal.jsx`
- Good:
  - all remaining app routes in this group now use key-based metadata and route tracker coverage is complete
  - registration, reset-request, reset-confirm, and email-update UIs are wired to reviewed API routes
  - reset and profile-update forms now pass `locale` explicitly, making server-side message/email locale resolution deterministic
  - reset and register error handling now resolve key-first API payloads consistently (`resolveApiMessage`)
- Risk:
  - policy/guide pages render rich HTML from locale catalogs; content remains trusted-only and should stay editor-controlled
  - payment/subscription remains decoupled from external payment provider callback flow (tracked separately)
- Action:
  - fixed PIN/OTP sanitization escaped-regex regression (`/\\D/g` -> `/\D/g`) in registration and login OTP inputs
  - aligned reset and email-update flows with locale-aware API contracts
  - moved this app-route set to `MONITOR` in `docs/route-review-tracker.md`
- Status: `MONITOR`

### Auth modal locale hardening pass
- Scope: `components/LoginModal.jsx`, `app/api/auth/login-step1/route.js`, `app/api/auth/login-step2/route.js`, `app/api/auth/login-resend-otp/route.js`
- Good:
  - login modal now sends `locale` in step1, step2 and resend OTP requests, so auth responses use selected UI language consistently
  - auth APIs already support locale resolution from request body; no backend contract changes were needed
- Risk:
  - app locale still depends on explicit client propagation in multiple API callers; consider shared fetch helper to avoid drift
- Action:
  - added `locale` to login-step JSON payloads in `LoginModal`
  - validated with full lint + production build
- Status: `MONITOR`

### Auth login hardening pass (enumeration + modal robustness)
- Scope: `components/LoginModal.jsx`, `app/api/auth/login-step1/route.js`
- Good:
  - login-step1 invalid-credentials response is now status-aligned (`401`) for both "user missing" and "wrong PIN" paths, reducing user-enumeration signal
  - login modal now supports `Escape` close behavior while preserving help-popover handling
  - modal timeout usage was centralized with registered timeout cleanup on unmount, reducing stale focus/state callbacks during fast navigation
- Risk:
  - auth rate limiting remains in-memory and is not cross-instance coordinated
  - modal remains a large component with dense UI state (future refactor candidate)
- Action:
  - changed `app/api/auth/login-step1/route.js` missing-user invalid-credentials status from `400` -> `401`
  - added `Escape` close listener in `components/LoginModal.jsx` (skips close when help-popover is open)
  - added timeout registry helpers and replaced non-cleanup modal `setTimeout` usages with registered timeouts
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Login modal accessibility focus-trap pass
- Scope: `components/LoginModal.jsx`
- Good:
  - keyboard tab navigation is now contained inside the open login modal (`Tab`/`Shift+Tab` loop)
  - when focus is outside the modal during tab navigation, focus is brought back into modal controls
  - hidden desktop PIN capture input is no longer part of normal tab order
- Risk:
  - full focus-management remains state-heavy due custom keypad/native keyboard split and should stay under regression checks
- Action:
  - added modal focusable-element resolver and `Tab` key trap listener bound to modal open state
  - changed hidden PIN input `tabIndex` from `0` to `-1`
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Home metadata copy alignment pass (screen-reader duplicate reduction)
- Scope: `app/layout.js`
- Good:
  - root metadata description now uses explicit two-assistant wording (specialists + eluküsimusega pöördujad) and avoids short repetitive label-style phrasing
- Risk:
  - some screen reader/browser combinations may still announce page title + metadata + first content block separately by design
- Action:
  - updated `metadata.description` text to: `Platvormil on kaks rollipõhist tehisintellekti assistenti: üks sotsiaalvaldkonna spetsialistidele ja teine eluküsimusega pöördujatele.`
- Status: `MONITOR`

### Home screen-reader dedupe pass (labels + decorative logos)
- Scope: `components/HomeSections/HomeFooter.jsx`, `components/PageFooter.jsx`, `messages/et.json`, `messages/en.json`
- Good:
  - decorative footer logos are now hidden from assistive tech (`aria-hidden`, no `role="img"`), reducing repeated brand announcements
  - home role-card `aria` labels are now short action labels instead of descriptive phrasing
- Risk:
  - screen reader verbosity still depends on browser/SR combination and document metadata announcement behavior
- Action:
  - updated home footer logo and shared page footer logo to decorative-only semantics
  - updated `home.card.specialist.aria` and `home.card.client.aria` wording in ET/EN locale catalogs
  - updated EN home client-card title copy to `FOR PEOPLE SEEKING HELP` (owner-preferred wording)
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Registration submit UX pass (loader + status readability)
- Scope: `components/alalehed/RegistreerimineBody.jsx`
- Good:
  - register submit button no longer switches to ellipsis-style loading copy while submitting
  - loading feedback is now shown as a separate on-page loader block with status text
  - success/info and error status cards in submit step now render with larger, more readable text sizing
- Risk:
  - same loading-copy pattern still exists in other forms and should be normalized in a dedicated global UX pass
- Action:
  - added `SotsiaalAILoader` block in register submit step during `submitting` state
  - kept submit button label stable (`auth.register.submit`) during loading
  - increased submit-step status card text sizing/padding for better readability
  - added fallback loading text for missing i18n key (`auth.register.loading_status` -> `Konto loomine`)
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Registration loading glass-card visual pass
- Scope: `components/alalehed/RegistreerimineBody.jsx`
- Good:
  - submitting-state loader is now rendered inside a compact glass-style card, aligned with login modal visual direction
  - loader and loading label are stacked vertically with explicit spacing, so text does not overlap the logo/loader
  - loading card keeps compact footprint and grows downward for text content
- Risk:
  - this visual pattern is currently registration-specific; other loading surfaces may still look inconsistent
- Action:
  - replaced plain loader row with a blurred gradient glass loader card (no visible border stroke)
  - enforced stable vertical stack for loader icon + label with dedicated icon area to keep label always below icon
  - increased loading label emphasis (`font-medium`, larger size) while keeping ARIA status semantics
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Verification email locale-copy correction pass
- Scope: `messages/et.json`
- Good:
  - Estonian verification email subject/body language is now consistent for register and resend verification flows
- Risk:
  - inbox placement (Spam vs Inbox) is still primarily controlled by sender-domain reputation and DNS auth setup (SPF/DKIM/DMARC), not template language alone
- Action:
  - replaced `email.auth.verify.text` and `email.auth.verify.html` ET templates from English copy to Estonian copy
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Mailer deliverability hardening pass
- Scope: `lib/mailer.js`
- Good:
  - MIME message generation now creates safer `Message-ID` domain values based on extracted sender address
  - optional `Reply-To` header is now supported in outbound messages
  - SMTP DATA payload now applies dot-stuffing to avoid edge-case message truncation on dot-prefixed lines
- Risk:
  - inbox placement still depends mostly on domain reputation and DNS authentication (SPF/DKIM/DMARC), not only message formatting
- Action:
  - added sender header formatting helper (`EMAIL_FROM_NAME` support for display name when `from` is a bare address)
  - added `X-Auto-Response-Suppress: All` header and robust `Message-ID` domain extraction
  - added DATA payload dot-stuffing before SMTP terminator write
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Email-verify redirect UX pass
- Scope: `app/api/verify-email/route.js`, `components/alalehed/ProfiilBody.jsx`
- Good:
  - verification-link success redirect now lands on subscription page with explicit reason flag (`/tellimus?reason=email-verified`)
  - unauthenticated subscription view now opens login modal for verification-success reason over the subscription background
  - verification-entry login modal disables stored-email prefill to avoid showing stale previous-user email
- Risk:
  - this UX path depends on unauthenticated `/tellimus` rendering and session refresh timing after successful login
- Action:
  - changed verify GET success redirect to localized subscription path + `reason=email-verified`
  - added unauthenticated branch to `TellimusBody` with login CTA and reason-specific message
  - added auto-open login modal on `/tellimus` verification-entry reason
  - when `/tellimus` login modal is open, page glass-ring content is now visually hidden and blocked behind a dedicated dim/blur backdrop layer
  - added `LoginModal` prop `prefillStoredEmail` and disabled email prefill persistence behavior for verification-entry subscription login
  - updated login envelope-status icon logic: shows red error mark when no email is available, green check only when a known email value exists
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Login modal OTP visual simplification pass
- Scope: `components/LoginModal.jsx`, `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - OTP view no longer uses stacked inner panel boxes; content now sits directly in modal body
  - OTP input now uses compact rounded field style, with smaller typography and left-to-right numeric entry
  - remember-device row styling is simplified and no longer wrapped in extra decorative panel
  - primary action button is narrower and links below it have increased spacing and clearer visual hierarchy
- Risk:
  - OTP visual tuning remains heavily class-driven inside one large component; future style changes should be regression-checked on mobile
- Action:
  - redesigned OTP section layout and spacing in `LoginModal` (text, input, checkbox row, action/link stack)
  - added locale key `auth.login.otp_short_placeholder` in ET/EN/RU catalogs
  - moved OTP-step error text under code input field (instead of header area)
  - updated ET `api.auth.login.token_expired` text to `Kinnituskood on aegunud.`
  - narrowed OTP content column and disabled hyphenation in description text to avoid broken words
  - wrapped remember-device row in dedicated bordered glass block and fixed checkbox top alignment for multiline label
  - updated OTP link actions to consistent dark/light theme styling with explicit rounded border treatment
  - executed validation run: `npm run lint` (PASS)
- Status: `MONITOR`

### Chat abuse-guard hardening pass
- Scope: `app/api/chat/*`, `lib/chat-api-rate-limit.js`, `app/api/stt/route.js`, `package.json`, `app/server`
- Good:
  - explicit endpoint-level rate limits now apply across all active chat API routes:
    - `app/api/chat/route.js` (`POST` + `GET`)
    - `app/api/chat/run/route.js` (`GET`)
    - `app/api/chat/conversations/route.js` (`GET` + `POST`)
    - `app/api/chat/conversations/[id]/route.js` (`GET` + `PUT` + `DELETE`)
    - `app/api/chat/conversations/[id]/messages/route.js` (`GET`)
    - `app/api/chat/analyze-file/route.js` (`POST`)
    - `app/api/chat/analyze-usage/route.js` (`GET`)
  - STT endpoint now has explicit payload guards:
    - request `content-length` cap
    - uploaded audio size cap (`STT_MAX_AUDIO_MB`)
    - MIME-type allowlist for audio uploads
  - legacy artifact `app/server` was removed (was unreferenced and not part of Next runtime)
  - `test` script now maps to real automated checks (`i18n:check + lint`) instead of starting dev server
- Risk:
  - chat/stt rate limits are still in-memory and therefore not shared between instances (acceptable for now, but not cluster-hard)
  - prisma engine-level migration checks are blocked in this environment by outbound network restriction
- Action:
  - added shared helper `lib/chat-api-rate-limit.js` for consistent 429 handling (`Retry-After`, `api.common.rate_limited`)
  - added new STT message keys: `api.stt.audio_too_large`, `api.stt.audio_format_unsupported`
  - improved ET/RU wording quality for major `api.*` namespaces (`common`, `chat`, `rooms`, `stt`, `tts`, `subscription`, `invites`, `admin.analytics`, `rag`)
  - executed validation runs: `npm test`, `npm run lint`, `npm run i18n:check`, `npm run build` (all PASS)
  - attempted Prisma sanity commands (`prisma generate`, `prisma validate`, `prisma migrate status`) but all failed due `ECONNREFUSED 127.0.0.1:9` when downloading Prisma engine checksum
- Status: `MONITOR`

### Prisma launch sanity pass
- Scope: `prisma/schema.prisma`, `prisma/migrations/*`, local DB migration state
- Good:
  - Prisma client generation succeeds
  - schema validation passes
  - migration history is aligned with local database after deploy
- Risk:
  - full migrations-directory structural diff (`migrate diff --from-migrations`) still needs a dedicated shadow DB URL in Prisma config
- Action:
  - executed `npm run prisma:generate` -> PASS
  - executed `npx prisma validate --schema prisma/schema.prisma` -> PASS
  - executed `npx prisma migrate status --schema prisma/schema.prisma` -> initially showed one unapplied migration
  - executed `npx prisma migrate deploy --schema prisma/schema.prisma` -> applied `20260115123000_add_room_member_display_name_and_room_message_sender_type`
  - re-ran `npx prisma migrate status --schema prisma/schema.prisma` -> `Database schema is up to date!`
- Status: `OK`

### Payment-readiness pass (Maksekeskus prep)
- Scope: `app/api/subscription/route.js`, `app/api/subscription/init/route.js`, `app/api/subscription/callback/route.js`, `app/api/subscription/webhook/route.js`, `app/api/admin/analytics/payment-alerts/dispatch/route.js`, `lib/payments/maksekeskus.js`, `lib/payments/observability.js`, `lib/admin/payment-alerts.js`, `scripts/maksekeskus-sandbox-e2e.mjs`, `components/alalehed/TellimusBody.jsx`, `docs/payment-maksekeskus-readiness.md`, `docs/payment-maksekeskus-sandbox-e2e.md`
- Good:
  - Maksekeskus flow endpoints are now implemented:
    - `POST /api/subscription/init` (payment init + checkout URL response)
    - `GET /api/subscription/callback` (localized return redirect state)
    - `POST /api/subscription/webhook` (signature check + idempotent payment handling)
  - `/tellimus` UI now uses `/api/subscription/init` instead of direct activation endpoint
  - direct activation in `POST /api/subscription` is disabled by default (env override only)
  - payment ledger is now written in init/webhook flow and subscription activation happens from `PAID` webhook event
  - structured payment logs are emitted from init/callback/webhook routes (`[payments]` JSON line format)
  - payment events are now also persisted into `ChatLog` (`role=payment`) for admin analytics
  - automated platform-side sandbox E2E script exists (`npm run payments:maksekeskus:e2e`)
  - webhook subscription rules are now explicit and env-configurable (`SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION`, `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION`, `SUBSCRIPTION_WEBHOOK_FAILED_ACTION`)
  - admin analytics now includes payment pipeline KPIs (init -> checkout -> callback -> webhook statuses)
  - admin analytics now computes launch alert rules (`warning/critical`) for funnel drops and webhook technical-error spikes
  - critical payment alerts can now be externally dispatched via `POST /api/admin/analytics/payment-alerts/dispatch` (admin or dispatch-key gated)
  - dispatch supports dry-run rollout checks and optional outbound webhook signature headers
- Risk:
  - Maksekeskus request/response and signature contract still require validation against real sandbox payload fields
  - callback is non-authoritative by design; launch depends on webhook delivery/verification and provider retry semantics
  - launch env must set/confirm subscription webhook policy values per product/business rules
- Action:
  - added payment provider helper (`lib/payments/maksekeskus.js`)
  - added payment observability helper (`lib/payments/observability.js`) and route-level lifecycle logs
  - enabled DB-backed payment event logging for analytics (`ChatLog`)
  - extended admin summary/UI with payment pipeline funnel metrics and payment event filters
  - added threshold-driven payment alert rules in analytics summary + billing panel
  - added external webhook dispatch endpoint for critical payment alerts with dedupe window
  - added dispatch runbook (`docs/payment-alert-dispatch-runbook.md`) and local validation script (`npm run payments:alerts:dispatch`)
  - added sandbox verification script (`scripts/maksekeskus-sandbox-e2e.mjs`) + runbook (`docs/payment-maksekeskus-sandbox-e2e.md`)
  - locked subscription side-effects behind explicit webhook policy envs for `REFUNDED`/`CANCELED`/`FAILED`
  - enforced webhook-signature configuration in production by default (`MAKSEKESKUS_WEBHOOK_SECRET`, with explicit non-prod override `SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED=1`)
  - added new API message keys for subscription payment lifecycle and webhook failures
  - updated readiness document from planning to implemented-state + remaining validation checklist
- Status: `MONITOR`

### Payment alert scheduler automation pass
- Scope: `.github/workflows/payment-alert-dispatch.yml`, `scripts/payment-alert-dispatch.mjs`, `docs/payment-alert-dispatch-runbook.md`, `docs/payment-maksekeskus-readiness.md`
- Good:
  - scheduler automation is now committed and versioned in repository
  - scheduled run executes every 10 minutes with live dispatch mode (`dryRun=0`)
  - manual workflow run supports controlled rollout flags (`dry_run`, `bypass_dedupe`, `locale`)
  - workflow reuses existing dispatch CLI and shared-key auth path, so runtime behavior stays identical to manual API calls
- Risk:
  - scheduler depends on repository secrets being configured correctly
  - live sink validation still depends on a real receiving endpoint that verifies webhook signature headers
- Action:
  - added GitHub Actions workflow `Payment Alert Dispatch`
  - documented required scheduler secrets (`PAYMENT_ALERT_DISPATCH_BASE_URL`, `PAYMENT_ALERT_DISPATCH_KEY`)
  - documented schedule/manual behavior and rollout guidance in dispatch runbook
  - added owner-facing env decision checklist (`docs/payment-production-env-checklist.md`)
- Status: `MONITOR`

### Payment owner notification pass
- Scope: `app/api/subscription/webhook/route.js`, `messages/*`, `components/admin/AnalyticsDashboard.jsx`, `docs/payment-maksekeskus-readiness.md`, `docs/payment-production-env-checklist.md`
- Good:
  - webhook status updates now emit owner-targeted email notifications for changed payment states
  - owner recipient defaults to `info@sotsiaal.ai` and can be overridden with `PAYMENT_OWNER_EMAIL`
  - notification failures are non-blocking for webhook processing and are logged for monitoring
  - admin analytics event filter now includes owner-email send/fail/skip events
- Risk:
  - reliable delivery depends on SMTP configuration (`EMAIL_FROM`/SMTP transport envs)
  - locale text for new owner-email templates is currently functional and aligned, but ET/RU copy can be refined later
- Action:
  - added `email.payment.owner_webhook.*` templates in all locale catalogs
  - added owner-notification env notes to payment docs
  - added telemetry events: `subscription_webhook_owner_email_sent|failed|skipped`
- Status: `MONITOR`

### Profile role-pill two-line layout fix
- Scope: `components/alalehed/ProfiilBody.jsx`, `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - long role labels in profile now render on two lines for `SOCIAL_WORKER` and `CLIENT`
  - role pill now keeps visible horizontal padding and better-fit capsule size for long labels
- Risk:
  - visual balance still depends on locale-specific role wording lengths
- Action:
  - changed profile role-pill long-label class to explicit multiline rendering (`whitespace-pre-line`) with tuned padding/line-height
  - added two-line display transform in profile role label rendering (balanced split by words for long roles)
  - updated ET role text `role.worker` from `Spetsialist` to `Sotsiaaltöö spetsialist`
  - updated EN `role.worker` to `Social worker` and RU `role.worker` to `Социальный работник` for consistent two-line profile pill behavior
  - moved profile role-pill labels to dedicated keys (`profile.role_short.*`) so profile now shows compact labels (ET: `Spetsialist`, `Pöörduja`) while global role names remain long-form
  - adjusted profile short client labels by locale: EN `Seeker`, RU `Ищущий` (ET remains `Pöörduja`)
- Status: `MONITOR`

### Profile account-delete loader + confirmation email pass
- Scope: `components/ui/ModalConfirm.jsx`, `components/alalehed/ProfiilBody.jsx`, `app/api/profile/route.js`, `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - account delete confirm now switches into dedicated loader state (glass card + `SotsiaalAILoader`) instead of only button text change
  - loader text is localized via `profile.delete_loading_status` and requested ET wording is available (`Konto kustutamine`)
  - backend now sends account-deleted confirmation email after successful user deletion
- Risk:
  - account-deleted email delivery still depends on active SMTP configuration; deletion itself remains non-blocking if email send fails
- Action:
  - added `busy` mode support in `ModalConfirm` with reusable loader UI
  - wired profile delete flow to show loader state and pass locale on `DELETE /api/profile`
  - added `sendAccountDeletedEmail` in profile API delete path with safe error handling
  - added `email.auth.account_deleted.*` keys to ET/EN/RU locales
- Status: `MONITOR`

### Chat subscription-error deduplication pass
- Scope: `components/chat/hooks/useChatStream.js`
- Good:
  - subscription-required failure is still shown in chat message stream (`chat.error.with_detail`) so user gets clear inline feedback
- Risk:
  - previously the same subscription error was rendered twice (top banner + chat message), creating noisy/awkward UI on `/vestlus`
- Action:
  - suppressed top `errorBanner` only for `api.common.subscription_required`, while keeping banner behavior unchanged for other errors
- Status: `OK`

### Chat subscription guidance copy pass
- Scope: `components/chat/hooks/useChatStream.js`, `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - users without active subscription can still move to profile/subscription flow without being blocked by profile access
- Risk:
  - previous chat error copy (`Vajalik on aktiivne tellimus.`) did not explain where to complete the subscription, which caused dead-end confusion after back-navigation
- Action:
  - added dedicated chat copy key `chat.error.subscription_required_profile`
  - for `api.common.subscription_required`, chat now shows explicit profile guidance text and skips generic `Viga:` prefix
  - top banner suppression for this specific key remains in place to avoid duplicate notices
- Status: `OK`

### Profile role-pill single-line sizing fix
- Scope: `components/alalehed/ProfiilBody.jsx`
- Good:
  - role pill hole now tracks actual text layout instead of role-code assumptions
- Risk:
  - previously `CLIENT`/`SOCIAL_WORKER` always used multiline pill styles even when label was one line (`Pöörduja`, `Spetsialist`), causing oversized hole/capsule height
- Action:
  - switched multiline style trigger to content-based detection (`roleLabelDisplay.includes("\\n")`)
  - kept two-line styling only for labels that are truly split onto two lines
- Status: `OK`

### Profile role-short copy update
- Scope: `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - profile role labels now match requested wording for seeker-role in all active locales
- Action:
  - ET `profile.role_short.client` -> `Eluküsimusega pöörduja`
  - EN `profile.role_short.client` -> `Life-question seeker`
  - RU `profile.role_short.client` -> `Ищущих помощи` (normal casing, not uppercase)
- Status: `OK`

### Subscription error-note readability/spacing polish
- Scope: `components/alalehed/TellimusBody.jsx`
- Good:
  - subscription status/error copy is now more legible in the ring layout
- Risk:
  - previously status/error note text rendered too small and left excessive vertical gap before the activate button, making the CTA appear pushed down
- Action:
  - introduced shared status/error typography class with larger responsive size and stronger line-height/weight
  - reduced button top margin when status/error notice is visible (`hasPaymentNotice`-based spacing)
- Status: `OK`

### Registration success spam-folder hint
- Scope: `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - post-registration success notice now includes explicit spam-folder guidance to reduce first-time verification confusion
- Action:
  - updated `auth.register.success_message` in ET/EN/RU with confirmation-email spam-folder hint
  - corrected ET casing from `SPAM` to `Spam` in the same success notice
- Status: `OK`

### Profile role-pill multiline spacing correction
- Scope: `components/alalehed/ProfiilBody.jsx`
- Good:
  - multiline role labels now use compact line spacing without oversized visual hole
- Risk:
  - role-pill base styles previously conflicted between single-line and multiline variants (`leading/h`), causing excessive vertical gap between lines
- Action:
  - split role-pill styles into explicit base + single-line + multiline classes (no conflicting `leading`/`height` utilities)
  - tuned multiline rhythm to tighter spacing (`py` and `leading`) for balanced two-line labels across locales
- Follow-up:
  - aligned multiline pill baseline with single-line/admin pill by removing multiline upward translate offset
  - increased multiline pill physical height (`min-h` + `py`) so two-line labels expand the hole instead of being compressed
  - restored moderate inter-line spacing (`leading`) to avoid text collision
  - replaced `whitespace-pre-line` rendering with explicit multi-line row rendering to avoid inherited/global `line-height` overrides compressing role text
- Status: `OK`

### Subscription active-state UI refresh + cancel-policy text update
- Scope: `components/alalehed/TellimusBody.jsx`, `messages/et.json`, `messages/en.json`, `messages/ru.json`
- Good:
  - active subscription state now has clearer visual hierarchy (dedicated glass status panel + tighter CTA spacing)
  - cancellation wording now consistently points to profile-based management only
- Risk:
  - previous active-state looked text-heavy and visually dated compared to newer login/registration components
  - previous copy still mentioned cancellation by email in active-state note and terms text
- Action:
  - redesigned active state in subscription page with dedicated panel styles (`subscriptionActive*` classes)
  - updated `subscription.active.cancel_note` in ET/EN/RU to profile-only cancellation wording
  - updated Terms section 5 paragraph 2 in ET/EN/RU to remove email-based cancellation instruction
- Follow-up:
  - updated ET Terms section 5 paragraph 2 wording to include direct clickable `/tellimus` link with label `Halda tellimust`
  - adjusted ET phrasing per product copy preference: `Platvormi sinu Profiili lehel`
- Status: `OK`

## Open Items Queue (next passes)

1. Execute Maksekeskus sandbox E2E with real provider payloads/signatures and capture evidence from `npm run payments:maksekeskus:e2e` + provider callbacks
2. Set final production values for webhook policy envs (`SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION`, `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION`, `SUBSCRIPTION_WEBHOOK_FAILED_ACTION`) and record decision
3. Configure repository secrets for scheduler (`PAYMENT_ALERT_DISPATCH_BASE_URL`, `PAYMENT_ALERT_DISPATCH_KEY`) and validate dry-run + live webhook sink delivery
