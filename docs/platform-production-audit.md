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
  - increased multi-line row gap and vertical capsule space slightly (`gap`, `min-h`, `py`) per visual QA feedback
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

### Chat capability verification - Point 1 (message send/stream/stop)
- Scope: `components/alalehed/chat/ChatComposer.jsx`, `components/chat/hooks/useChatStream.js`, `app/api/chat/route.js`
- Good:
  - message send works via Enter and submit button (`ChatComposer` submit + key handlers)
  - duplicate-send guard is present (`submitInFlightRef` + `isGenerating` checks)
  - streaming pipeline is wired (`/api/chat` SSE `meta/delta/done`)
  - stop flow is wired with `AbortController` and interrupted-message fallback
- Risk:
  - no functional blocker found in this pass
- Action:
  - verification-only pass completed for point 1
- Status: `OK`

### Chat capability verification - Point 2 (conversation history sidebar)
- Scope: `components/ChatSidebar.jsx`, `components/chat/hooks/useChatConversationState.js`, `app/api/chat/conversations/route.js`, `app/api/chat/conversations/[id]/route.js`, `app/api/chat/run/route.js`
- Good:
  - previous conversations load via paginated endpoint with cursor support
  - opening a conversation dispatches switch event and hydrates full message history from server (`/api/chat/run`)
  - new-conversation, single-delete, bulk-delete, refresh, and load-more flows are wired and guarded with loading states
  - ownership/auth guards are enforced server-side for conversation read/delete
- Action:
  - verification-only pass completed for point 2
  - fixed follow-up: new conversation now posts role from session/user context instead of fixed `CLIENT`
- Status: `OK`

### Chat capability verification - Point 3 (sources panel + right-rail source action)
- Scope: `components/chat/hooks/useConversationSources.js`, `components/chat/RightRail.jsx`, `components/alalehed/chat/ChatSourcesPanel.jsx`, `components/alalehed/ChatBody.jsx`
- Good:
  - sources are aggregated from conversation messages and deduplicated by stable key; transient upload-only sources are filtered out
  - sources-panel open/close flow is wired from chat body and right-rail icon, including focus return behavior
  - sources dialog includes keyboard handling (`Esc`, `Tab` trap) and overlay close
- Risk:
  - source icon was previously still technically clickable when no sources existed (action no-op), which is weak affordance/accessibility signaling
- Action:
  - verification pass completed for point 3
  - fixed follow-up: right-rail `sources` action is now truly disabled when no conversation sources are available
- Status: `OK`

### Chat capability verification - Point 4 (document upload + analysis mode)
- Scope: `components/chat/hooks/useChatAnalysisController.js`, `components/alalehed/chat/ChatAnalysisPanel.jsx`, `components/alalehed/chat/ChatComposer.jsx`, `app/api/chat/analyze-file/route.js`, `app/api/chat/analyze-usage/route.js`
- Good:
  - upload flow is wired end-to-end (`paperclip` -> analysis panel -> file picker -> `/api/chat/analyze-file`)
  - usage/quota counter is fetched from `/api/chat/analyze-usage` and shown in panel
  - document-context mode toggle (`docOnlyMode`) is correctly propagated into chat request payload (`combineSources`)
- Risk:
  - server previously relied on UI accept-filter and did not enforce allowed MIME list on upload endpoint
- Action:
  - verification pass completed for point 4
  - fixed follow-up: added server-side MIME allowlist validation in `/api/chat/analyze-file` (with extension-based fallback inference)
  - added API i18n key for unsupported file format: `api.chat.analyze.mime_not_allowed` (ET/EN/RU)
- Status: `OK`

### Chat capability verification - Point 5 (dictation / microphone / STT)
- Scope: `components/chat/hooks/useSpeech.js`, `components/alalehed/chat/ChatComposer.jsx`, `components/alalehed/chat/view/ChatNotices.jsx`, `app/api/stt/route.js`
- Good:
  - dictation button flow is wired end-to-end (`mic` button -> browser `MediaRecorder` -> `/api/stt` -> recognized text appended to composer)
  - STT endpoint enforces auth, request/file size limits, supported audio mime checks, and rate limiting
  - recording-state UX is wired (`recording`, completion pulse, error notice in chat notice area)
  - backend error keys are mapped to localized UI messages via `resolveApiMessage` fallback path
- Risk:
  - dictation availability still depends on browser/device microphone APIs and user permission; unsupported devices fall back to error notice only
- Action:
  - verification-only pass completed for point 5 (no code changes required)
- Status: `OK`

### Chat capability verification - Point 6 (read-aloud / TTS)
- Scope: `components/chat/hooks/useSpeech.js`, `components/alalehed/chat/ChatComposer.jsx`, `app/api/tts/route.js`
- Good:
  - read-aloud is wired with provider fallback path:
    - RU/EN locale path uses browser speech synthesis
    - ET (and other locales) path uses `/api/tts` with backend provider fallback
  - `/api/tts` enforces auth, rate limit, payload validation, and text length caps
- Risk:
  - read-aloud action did not truly act as a stop-toggle while already speaking (second click restarted playback path)
- Action:
  - verification pass completed for point 6
  - fixed follow-up: same read-aloud button now stops playback immediately when already speaking
- Status: `OK`

### Chat capability verification - Point 7 (room access, join gating, unread state)
- Scope: `app/api/chat/route.js`, `app/api/rooms/[roomId]/messages/route.js`, `app/api/rooms/[roomId]/messages/stream/route.js`, `app/api/invites/[id]/accept/route.js`, `components/rooms/useRoomMessages.js`, `components/chat/hooks/useChatStream.js`
- Good:
  - room-mode messaging is access-gated server-side by membership + subscription rules (including sponsored-host path)
  - invite accept flow enforces token validity, email match, payment mode rules, and room-member upsert atomically in transaction
  - chat room-mode handles `401/403` and blocks sending when room access is not valid
- Risk:
  - room unread-state endpoint (`PUT /api/rooms/[roomId]/read`) existed but was not called from client flow, so unread counters could remain stale
- Action:
  - verification pass completed for point 7
  - fixed follow-up: added throttled read-marker updates in `useRoomMessages` on initial room load, polling merge, and SSE incoming message
- Status: `OK`

### Chat capability verification - Point 8 (chat-page icon rail destinations)
- Scope: `components/chat/RightRail.jsx`, `components/alalehed/chat/ChatBodyView.jsx`, `components/alalehed/ConversationDrawer.jsx`, `components/ChatSidebar.jsx`, `components/invite/InviteModal.jsx`, `components/alalehed/ProfiilBody.jsx`, `app/ruum/page.js`
- Good:
  - `Vestlused` icon opens conversation drawer (`sotsiaalai:toggle-conversations`) on `/vestlus`
  - `Allikad` icon opens sources dialog and is properly disabled when no sources exist
  - `Ruumid` icon routes to `/ruum`
  - `Lisa inimene` icon opens invite modal (`sotsiaalai:open-invite`) with current `roomId` context when present
  - `Profiil` icon opens in-chat profile face toggle (or routes to `/profiil` when toggle callback is absent)
- Risk:
  - no production-blocking functional issue found in this pass
- Action:
  - verification-only pass completed for point 8 (no code changes required)
- Status: `OK`

### Chat capability verification - Point 9 (icon-opened pages + route files audit)
- Scope:
  - app routes: `app/vestlus/page.js`, `app/ruum/page.js`, `app/profiil/page.js`
  - chat/history routes: `app/api/chat/conversations/route.js`, `app/api/chat/conversations/[id]/route.js`, `app/api/chat/run/route.js`
  - room routes: `app/api/rooms/route.js`, `app/api/rooms/[roomId]/route.js`, `app/api/rooms/[roomId]/members/route.js`
  - invite routes: `app/api/invites/route.js`, `app/api/invites/[id]/accept/route.js`, `app/api/invites/[id]/resend/route.js`, `app/api/invites/[id]/revoke/route.js`
  - profile route: `app/api/profile/route.js`
- Good:
  - icon-opened page routes are mapped correctly and metadata/auth guards are coherent for production flow
  - conversation/room/invite/profile APIs are ownership-gated and no-store headers are consistently applied
- Risk:
  - revoke-invite route ignored explicit UI locale payload, causing language drift when UI locale differs from browser `Accept-Language`
  - room-members route did not guard missing `roomId` explicitly and could return ambiguous response for non-existent room
- Action:
  - fixed `/api/invites/[id]/revoke` to consume optional request body locale (`locale` / `lang`) for deterministic i18n
  - fixed `/api/rooms/[roomId]/members` to return `api.common.missing_room_id` on missing param and `api.rooms.not_found` when room does not exist
- Status: `OK`

### Chat capability verification - Point 10 (conversations route hardening)
- Scope: `app/api/chat/conversations/route.js`, `app/api/chat/conversations/[id]/route.js`
- Good:
  - ownership checks and archive semantics were already in place for conversation read/delete/restore
  - route-level chat rate limits are enforced for list/create/read/update/delete paths
- Risk:
  - conversation ID validation rules were not aligned across endpoints; some routes accepted IDs that stricter chat endpoints would reject later
- Action:
  - aligned conversation ID validation to strict shared pattern (`[A-Za-z0-9._\\-:+]`, 8..200 chars) in:
    - `POST /api/chat/conversations` (user-provided ID path)
    - `/api/chat/conversations/[id]` param guard
  - kept existing response contract (`api.chat.invalid_conv_id` / `api.chat.invalid_id`) unchanged
- Status: `OK`

### Chat capability verification - Point 11 (roomId type normalization)
- Scope:
  - `app/api/chat/route.js`
  - `app/api/rooms/[roomId]/route.js`
  - `app/api/rooms/[roomId]/read/route.js`
  - `app/api/rooms/[roomId]/leave/route.js`
  - `app/api/rooms/[roomId]/members/route.js`
  - `app/api/rooms/[roomId]/messages/route.js`
  - `app/api/rooms/[roomId]/messages/stream/route.js`
  - `app/api/rooms/[roomId]/messages/[msgId]/route.js`
- Good:
  - route params now use a single canonical room-id path: trimmed string IDs only (aligned with Prisma `Room.id: String`)
  - missing/blank `roomId` is explicitly guarded with existing API error keys
- Risk:
  - previous numeric coercion (`Number(roomId)`) could silently switch ID type and cause false not-found / access-denied behavior when room IDs are CUID strings
- Action:
  - removed numeric fallback normalization for `roomId` across chat + room routes
  - kept response contracts and error keys stable
- Status: `OK`

### Chat capability verification - Point 12 (admin parity for room-message delete)
- Scope: `app/api/rooms/[roomId]/messages/[msgId]/route.js`
- Good:
  - admin role already had elevated read/send access in room-message routes
- Risk:
  - delete route still required room membership, so admin could not delete messages in rooms they did not explicitly join
- Action:
  - aligned delete permissions with admin semantics by allowing `ADMIN` role to bypass room-member lookup and delete check
  - kept existing forbidden/error behavior for non-admin roles unchanged
- Status: `OK`

### Chat capability verification - Point 13 (invite route param hardening)
- Scope:
  - `app/api/invites/route.js`
  - `app/api/invites/[id]/accept/route.js`
  - `app/api/invites/[id]/resend/route.js`
  - `app/api/invites/[id]/revoke/route.js`
- Good:
  - invite flows already had ownership/rate-limit checks and stable error contracts
- Risk:
  - untrimmed `id/token/roomId` params could yield avoidable false negatives (`missing`, `not_found`, `invalid_request`) on whitespace-tainted inputs
- Action:
  - normalized invite route identifiers to trimmed strings before validation/use
  - retained existing response keys and status codes
- Status: `OK`

### Chat capability verification - Point 14 (rooms list endpoint query pressure)
- Scope: `app/api/rooms/route.js`
- Good:
  - endpoint already returned correct room payload contract for admin and member views
- Risk:
  - list flow used per-room `roomMember.count` and per-room `roomMessage.count`, creating avoidable N+1 pressure as room count grows
- Action:
  - refactored membership count to a single grouped query (`roomMember.groupBy`)
  - for admin view, refactored unread count to a single grouped query (`roomMessage.groupBy`)
  - preserved non-admin unread semantics (`lastReadAt`-based), response shape, and sort behavior
- Status: `OK`

### Chat capability verification - Point 15 (chat-run error response hardening)
- Scope: `app/api/chat/run/route.js`
- Good:
  - route already handled DB-offline path with explicit degraded response (`503`)
- Risk:
  - generic DB error branch returned raw `err.message` to client payload, which may expose internal details
- Action:
  - removed raw error-message echo from response body
  - added explicit server-side error logging and stable error code payload (`DB_ERROR_RUN_READ`)
- Status: `OK`

### Chat capability verification - Point 16 (room existence semantics in message/read routes)
- Scope:
  - `app/api/rooms/[roomId]/messages/route.js`
  - `app/api/rooms/[roomId]/messages/stream/route.js`
  - `app/api/rooms/[roomId]/read/route.js`
- Good:
  - membership/subscription access control was already enforced
- Risk:
  - admin path could bypass room existence checks, causing inconsistent outcomes for non-existent room IDs (`200`/empty or generic `500` instead of `404`)
- Action:
  - added explicit room-existence checks before admin bypass in message + stream access guards
  - added room-existence check in read route before returning success for admin
  - aligned missing-room behavior to `api.rooms.not_found` semantics
- Status: `OK`

### Chat capability verification - Point 17 (internal error-detail leak hardening)
- Scope:
  - `app/api/chat/analyze-usage/route.js`
  - `app/api/chat/conversations/route.js`
  - `app/api/chat/conversations/[id]/route.js`
  - `app/api/chat/conversations/[id]/messages/route.js`
- Good:
  - offline/degraded DB branches were already present and returned stable API keys
- Risk:
  - multiple DB error branches returned raw `err.message` to clients
- Action:
  - replaced raw error text payloads with stable error codes
  - added explicit server-side logging in each affected catch branch
  - kept existing `messageKey` contracts intact
- Status: `OK`

### Chat capability verification - Point 18 (OpenAI error exposure in chat route)
- Scope: `app/api/chat/route.js`
- Good:
  - detailed provider errors were already logged server-side for diagnostics
- Risk:
  - non-stream and stream branches could forward raw provider/internal error text directly to client
- Action:
  - introduced safe client-facing error key fallback (`chat.error.openai_request_failed`) for non-stream and stream paths
  - kept raw error detail in server logs/telemetry only
  - retained existing status-code behavior (`502`) and response contract shape
- Status: `OK`

### Chat capability verification - Point 19 (cursor parsing and id-validation alignment)
- Scope:
  - `app/api/chat/conversations/route.js`
  - `app/api/chat/conversations/[id]/messages/route.js`
- Good:
  - pagination cursor protocol existed and was functionally working for common UUID/CUID-like IDs
- Risk:
  - cursor parsing relied on naive `split(':')`, which can truncate IDs containing `:`
  - message-list route used weaker ID validation than other chat endpoints
- Action:
  - refactored cursor parsing to split only on structural separators and preserve the full trailing ID payload
  - added strict ID-pattern validation in messages route (`[A-Za-z0-9._\\-:+]`, 8..200 chars) to align with other chat routes
  - kept pagination response contract unchanged (`nextCursor`)
- Status: `OK`

### Chat capability verification - Point 20 (route-input normalization + auth guard robustness)
- Scope:
  - `app/vestlus/page.js`
  - `app/api/profile/route.js`
- Good:
  - chat page and profile API were functionally working in normal flows
- Risk:
  - whitespace-tainted `roomId` query could trigger unintended room-mode state on chat page
  - profile API `requireUser` could throw unhandled auth-session errors (unexpected `500` path)
- Action:
  - normalized chat-page `roomId` query input to trimmed string/null before passing to `ChatBody`
  - wrapped profile `requireUser` session read in try/catch and fallbacked to `null` (existing unauthorized behavior path)
- Status: `OK`

### Chat capability verification - Point 21 (profile locale-input consistency)
- Scope: `app/api/profile/route.js`
- Good:
  - profile i18n handling already resolved locale via body/header fallback
- Risk:
  - `PUT /api/profile` consumed only `body.locale`; clients sending `lang` (used elsewhere in API) could get inconsistent language fallback
- Action:
  - aligned locale input parsing in profile PUT to accept both `locale` and `lang`
  - left response contract and status codes unchanged
- Status: `OK`

### Chat capability verification - Point 22 (rooms list deterministic visibility)
- Scope: `components/rooms/RoomsPage.jsx`
- Good:
  - room visibility already had semantic filtering for empty default-title rooms
- Risk:
  - hardcoded hidden-ID set (`hiddenIds`) could silently hide a real room in production if IDs matched, creating non-deterministic UI behavior across environments
- Action:
  - removed hardcoded ID-based room suppression
  - retained existing semantic visibility rules (fallback-title + empty-content guard)
- Status: `OK`

### Chat capability verification - Point 23 (client room-route path safety)
- Scope:
  - `components/rooms/useRoomMessages.js`
  - `components/chat/hooks/useChatStream.js`
- Good:
  - room mode data flow and API wiring were working for standard CUID/UUID room IDs
- Risk:
  - some client-side room API paths interpolated raw `roomId` without URI encoding, which can break route matching when IDs contain reserved URL characters
- Action:
  - normalized room path segment construction with `encodeURIComponent(...)` in read/messages/stream/members calls
  - kept request/response contracts unchanged
- Status: `OK`

### Chat capability verification - Point 24 (legacy room redirect determinism)
- Scope: `app/room/[roomId]/page.jsx`
- Good:
  - legacy room path correctly redirects into canonical chat route (`/vestlus?roomId=...`)
- Risk:
  - route contained a hardcoded special-case room ID redirect, creating environment-specific hidden behavior
- Action:
  - removed hardcoded room-ID exception and kept uniform redirect logic for any non-empty `roomId`
  - normalized legacy route param with trim before redirect composition
- Status: `OK`

### Chat capability verification - Point 25 (subscription route guard consistency)
- Scope:
  - `app/api/subscription/route.js`
  - `app/api/subscription/init/route.js`
  - `app/api/subscription/callback/route.js`
- Good:
  - subscription endpoints already enforced auth + localized error responses and callback redirect flow
- Risk:
  - `getToken` exceptions could surface as unexpected server errors without explicit guard fallback
  - locale body parsing in subscription POST/init accepted only `locale`, not `lang` (inconsistent with other API routes)
  - callback `ref` param was forwarded without normalization/length bound
- Action:
  - wrapped subscription auth token extraction in try/catch with safe `null` fallback
  - aligned locale parsing to accept both `locale` and `lang`
  - normalized callback reference value (`trim` + max length)
- Status: `OK`

### Chat capability verification - Point 26 (rooms page error UX hardening)
- Scope: `components/rooms/RoomsPage.jsx`
- Good:
  - room actions and loading flow already had localized error resolution
- Risk:
  - failures in room leave/delete were surfaced via blocking browser `window.alert`, and room-list load failure had no on-page user feedback
- Action:
  - replaced alert-based error reporting with in-page localized error banner (`role="alert"`, `aria-live="assertive"`)
  - wired load/leave/delete failure paths to the shared page error state
  - preserved existing API calls and success flow behavior
- Status: `OK`

### Chat capability verification - Point 27 (subscription active-shape consistency)
- Scope: `app/api/subscription/route.js`
- Good:
  - subscription GET endpoint already returned normalized shape payload for UI consumption
- Risk:
  - `shape()` marked `isActive=false` when `status=ACTIVE` and `validUntil=null`, while other subscription logic treats no-expiry active subscriptions as active
- Action:
  - aligned `shape()` active computation to treat `ACTIVE + validUntil=null` as active
  - kept response contract unchanged (`isActive`, `daysLeft`, etc.)
- Status: `OK`

### Guide content correction (chat/profile sections, ET)
- Scope: `messages/et.json`
- Good:
  - usage-guide chat/profile descriptions now match actual UI placement and interaction model
- Action:
  - updated chat section to explicitly mention scrollable message list/scrollbar behavior
  - corrected `Allikad` wording from footer placement to right-side shortcuts icon rail placement
  - added dedicated shortcut-icons subsection (Vestlused, Allikad, Ruumid, Lisa inimene, Profiil) with what each icon opens
  - updated profile section to describe center orbital menu and list main actions exposed by its icons
- Status: `OK`

### Footer note visibility polish (guide + profile card)
- Scope: `components/alalehed/KasutusjuhendBody.jsx`, `components/alalehed/ProfiilBody.jsx`
- Good:
  - `SotsiaalAI © 2025` stays readable above bottom fade/mask zone on the usage guide
  - profile glass card now shows the same footer note in its lower area across profile states
- Action:
  - added extra bottom breathing room under usage-guide footer note so it does not sit inside the fade zone
  - added shared profile-card footer note rendering in `ProfileShell` with responsive bottom offsets
- Follow-up:
  - excluded profile footer note from generic child `position: relative` rule so it can stay absolutely anchored to the card bottom edge
  - reduced mobile/desktop bottom offsets to keep the note visually at the lower edge of the glass card
  - moved profile footer note upward from absolute bottom per visual QA
  - applied theme-specific brand tones for footer note (`dark`: orange-leaning, `light`: dark red brand tone)
  - increased profile footer note font size for stronger readability on desktop and mobile
  - moved profile footer note significantly upward (desktop/mobile) per final visual preference
  - increased profile footer note size further and added slight transparency for softer integration with glass background
- reduced profile footer note opacity further and hide it automatically while orbital menu is open
- Status: `OK`

### Chat capability verification - Point 28 (confirmation modal consistency in sidebar actions)
- Scope: `components/ChatSidebar.jsx`
- Good:
  - delete actions were already localized and functionally correct (single, selected, all)
- Risk:
  - browser-native `confirm(...)` was used in user chat sidebar actions, creating inconsistent UI/UX and weaker accessibility compared to existing modal patterns used elsewhere in the app
- Action:
  - replaced native confirms with shared `ModalConfirm` flow for:
    - single conversation delete
    - selected delete
    - delete all
  - added unified confirm state + busy state for modal-driven destructive actions
- kept existing API calls and delete semantics unchanged
- Status: `OK`

### Chat capability verification - Point 29 (rooms unread-count query consolidation)
- Scope: `app/api/rooms/route.js`
- Good:
  - room list endpoint already used grouped queries for member count and admin unread count
- Risk:
  - non-admin unread counts were still fetched via per-room `roomMessage.count` inside loop (N+1), which can degrade room list latency as room count grows
- Action:
  - replaced per-room unread counting with one grouped `roomMessage.groupBy` query using per-room `lastReadAt` OR predicates
  - unified unread-map handling for admin and non-admin paths
- preserved response contract and unread semantics
- Status: `OK`

### Chat capability verification - Point 30 (locale-safe chat icon navigation)
- Scope:
  - `components/chat/RightRail.jsx`
  - `components/alalehed/ChatBody.jsx`
  - `components/alalehed/chat/ChatBodyView.jsx`
  - `components/alalehed/chat/hooks/useChatProfileRoll.js`
- Good:
  - chat icon rail and profile toggle already routed users to the correct feature pages in default-locale paths
- Risk:
  - hardcoded paths (`/vestlus`, `/ruum`, `/profiil`, `/`) could drop active locale prefix (`/en`, `/ru`) during navigation
  - path checks for active rail state and drawer behavior relied on raw pathname startsWith checks, which can fail on localized paths
- Action:
  - switched icon/navigation pushes to `localizePath(...)`
  - normalized pathname checks with `stripLocaleFromPath(...)` in right rail logic
  - propagated current `locale` through chat view props and profile-roll hook so route transitions remain locale-stable
- kept existing UX behavior (drawer open, profile toggle, room jump) unchanged
- Status: `OK`

### Admin panel verification - Point 31 (RAG delete confirmation consistency)
- Scope: `components/admin/RagAdminPanel.jsx`
- Good:
  - RAG document delete flow already had correct backend call and localized messaging
- Risk:
  - delete action still relied on native browser `confirm(...)`, diverging from platform modal UX/accessibility pattern
- Action:
  - replaced native confirm with shared `ModalConfirm`
  - added explicit pending-delete state and guarded close behavior while delete is in-flight
- retained existing delete API flow, success/error handling, and labels
- Status: `OK`

### Chat routing verification - Point 32 (locale-safe server redirects)
- Scope:
  - `app/vestlus/page.js`
  - `app/room/[roomId]/page.jsx`
- Good:
  - chat/profile redirect flows already worked in default locale and preserved room-id handoff
- Risk:
  - server redirects used hardcoded paths, which could drop active locale prefix in SSR transitions
- Action:
  - localized `/vestlus?profile=1 -> /profiil` redirect with `localizePath(...)` using cookie locale
- localized legacy `/room/[roomId]` redirect target (`/vestlus`) and preserved encoded `roomId`
- kept existing redirect behavior and query semantics unchanged
- Status: `OK`

### Profile/chat navigation verification - Point 33 (locale-safe back/fallback checks)
- Scope:
  - `components/alalehed/ProfiilBody.jsx`
  - `components/alalehed/ChatBody.jsx`
- Good:
  - profile/chat navigation already used localized paths in most forward transitions
- Risk:
  - profile back action still used hardcoded `/vestlus`
  - profile/chat fallback safety checks used raw pathname `startsWith(...)`, which can miss localized paths (`/en/...`, `/ru/...`)
- Action:
  - localized profile back target via `localizePath("/vestlus", locale)`
- normalized fallback checks via `stripLocaleFromPath(...)` for both profile logout fallback and chat-home back fallback
- kept all existing navigation semantics unchanged
- Status: `OK`

### Auth/profile flow verification - Point 34 (separate forgot-PIN vs profile PIN-change routes)
- Scope:
  - `app/uuenda-pin/page.js`
  - `components/alalehed/UuendaPinBody.jsx`
  - `app/taasta-parool/page.jsx`
  - `components/LoginModal.jsx`
  - `messages/et.json`
  - `messages/en.json`
- Good:
  - password-reset token flow (`/taasta-parool/[token]`) was already implemented and working
- Risk:
  - `/uuenda-pin` was still bound to forgot-PIN reset-email flow, while profile orbital action expected authenticated in-session PIN change
  - login modal forgot-PIN entry pointed to `/uuenda-pin`, mixing two distinct intents
- Action:
  - repointed `/uuenda-pin` to a new authenticated PIN-change form (`current PIN + new PIN + confirm`) using `PUT /api/profile`
  - added dedicated reset-request route `/taasta-parool` for forgot-PIN email flow (still backed by `/api/auth/password/reset`)
  - updated login modal forgot-PIN link to localized `routes.password_reset_path` path
  - updated usage-guide login text links (ET/EN) from `/uuenda-pin` to `/taasta-parool`
- Status: `OK`

### Profile mobile navigation verification - Point 35 (orbital back consistency in embedded mode)
- Scope:
  - `components/alalehed/ProfiilBody.jsx`
  - `docs/route-review-tracker.md`
- Good:
  - profile orbital actions were already localized and functionally wired
- Risk:
  - mobile orbital `back` item always routed to `/profiil`, which breaks embedded profile flow (`/vestlus` profile panel) by forcing full-page navigation instead of using profile back semantics
- Action:
  - switched orbital mobile `back` action to reuse `handleBack` (same behavior as profile back button)
  - keeps embedded mode returning to chat panel (`onBack`) and page mode returning to chat route
  - updated route tracker notes for `/profiil` and `/uuenda-pin` to match current implementation
- Status: `OK`

### Route coverage verification - Point 36 (new forgot-PIN request route tracked)
- Scope:
  - `docs/route-review-tracker.md`
- Good:
  - password-reset token route (`/taasta-parool/[token]`) was already tracked and reviewed
- Risk:
  - newly introduced reset-request route (`/taasta-parool`) was not yet listed in the route coverage tracker, reducing audit completeness
- Action:
  - added `/taasta-parool -> app/taasta-parool/page.jsx` row with review note
  - updated reviewed scope list to include `app/taasta-parool/page.jsx`
- Status: `OK`

### Locale navigation verification - Point 37 (join/rooms locale prefix preservation)
- Scope:
  - `app/join/page.jsx`
  - `components/rooms/RoomsPage.jsx`
  - `docs/route-review-tracker.md`
- Good:
  - join accept flow and rooms UI logic were functionally correct
- Risk:
  - some client navigations still used hardcoded `/vestlus...` targets, which can drop active locale prefix (`/en`, `/ru`)
- Action:
  - localized join success redirects to chat (`/vestlus` and `/vestlus?roomId=...`) via `localizePath(...)`
  - localized rooms-page back button target and room-card chat links via `localizePath(...)`
  - updated route tracker notes for `/join` and `/rooms`
- Status: `OK`

### Profile auth-gate verification - Point 38 (direct-entry guard for PIN/email update pages)
- Scope:
  - `components/alalehed/UuendaEpostiBody.jsx`
  - `components/alalehed/UuendaPinBody.jsx`
  - `docs/route-review-tracker.md`
- Good:
  - backend security was already enforced by `/api/profile` auth checks
- Risk:
  - direct unauthenticated entry to `/uuenda-epost` and `/uuenda-pin` exposed editable forms before API rejection, creating inconsistent UX versus other guarded profile routes
- Action:
  - added explicit unauthenticated gate view on both pages with clear login CTA
  - wired `LoginModal` with `suppressRedirect` and in-place `router.refresh()` after successful auth, so users continue same route
  - kept authenticated form flows and `?return=profile` behavior unchanged
  - updated route tracker notes for `/uuenda-epost` and `/uuenda-pin`
- Status: `OK`

### Metadata verification - Point 39 (`/uuenda-pin` title/description semantics)
- Scope:
  - `app/uuenda-pin/page.js`
  - `docs/route-review-tracker.md`
- Good:
  - route and UI flow for in-session PIN update were already corrected
- Risk:
  - page metadata still inherited reset-request semantics (`meta.reset`), which can mismatch the actual page intent (authenticated PIN change)
- Action:
  - updated `/uuenda-pin` metadata selection to prefer `meta.pin_update` and fallback to profile PIN-update copy (`profile.change_password_cta`, `profile.pin_help`)
  - kept existing localized metadata builder/path behavior unchanged
  - updated route tracker note for `/uuenda-pin`
- Status: `OK`

### Locale navigation verification - Point 40 (home/sidebar/auth callback locale retention)
- Scope:
  - `components/HomePage.jsx`
  - `components/ChatSidebar.jsx`
  - `components/chat/hooks/useChatStream.js`
  - `docs/route-review-tracker.md`
- Good:
  - chat entry and sidebar behavior worked functionally in default locale
- Risk:
  - hardcoded `/vestlus` navigation points could drop active locale prefix during home-card entry, sidebar room open, roomId-clearing replace, and auth redirect callback
- Action:
  - localized home-card chat entry path via `localizePath("/vestlus", locale)`
  - localized chat sidebar room-open and roomId-clearing replace paths via `localizePath(...)`, with locale-safe pathname check via `stripLocaleFromPath(...)`
  - localized 401 sign-in callback path in chat stream hook (`callbackUrl`) via `localizePath(...)`
  - updated route tracker notes for `/` and `/vestlus`
- Status: `OK`

### Locale content-link verification - Point 41 (HTML rich-text internal href localization)
- Scope:
  - `lib/localizeHtmlLinks.js`
  - `components/i18n/RichText.jsx`
  - `components/alalehed/KasutusjuhendBody.jsx`
  - `docs/route-review-tracker.md`
- Good:
  - legal/guide content rendering already used controlled rich-text HTML blocks
- Risk:
  - internal links embedded in translated HTML (e.g. `/profiil`, `/tellimus`, `/registreerimine`) could drop active locale prefix on EN/RU pages
- Action:
  - added shared HTML helper to localize internal `href="/..."` links while leaving external/API links untouched
  - applied helper in shared `RichText` renderer (covers legal/about/register/subscription rich-text content)
  - applied helper in guide body renderer (`dangerouslySetInnerHTML` section content)
  - updated route tracker notes for `/kasutusjuhend`, `/kasutustingimused`, `/privaatsustingimused`
- Status: `OK`

### SEO crawl verification - Point 42 (robots/sitemap private-route exposure)
- Scope:
  - `app/robots.js`
  - `app/sitemap.js`
- Good:
  - sitemap already emitted localized alternates across supported locales
- Risk:
  - sitemap included private/auth-gated routes (`/vestlus`, `/profiil`, `/tellimus`, `/uuenda-*`), which should not be indexed
  - robots disallow rules only covered default-locale paths and did not block `/en/...` or `/ru/...` private equivalents
- Action:
  - restricted sitemap to public routes only (`/`, `/registreerimine`, `/taasta-parool`, `/kasutusjuhend`, `/kasutustingimused`, `/privaatsustingimused`)
  - expanded robots disallow list to include localized private-route variants for EN/RU prefixes
- Status: `OK`

### Admin route verification - Point 43 (locale-safe auth callback/fallback redirects)
- Scope:
  - `app/admin/analytics/page.jsx`
  - `app/admin/rag/page.jsx`
  - `docs/route-review-tracker.md`
- Good:
  - admin session/role guards were already present and blocking non-admin access
- Risk:
  - unauthenticated sign-in callback targets and non-admin fallback redirects used hardcoded non-localized paths, which can drop active locale prefix
- Action:
  - localized admin sign-in callback URLs via cookie locale (`localizePath("/admin/...", locale)`)
  - localized non-admin fallback redirects to localized home path
  - localized admin RAG back-link target (`/#meist`) for locale-aware return
  - updated route tracker notes for `/admin/analytics` and `/admin/rag`
- Status: `OK`

### Build verification - Point 44 (production compile + i18n parity)
- Scope:
  - full app build pipeline (`npm run build`)
- Good:
  - lint + i18n parity + Next production build complete successfully after recent route/navigation/crawl updates
- Result:
  - `npm run build` completed with successful app route generation and no compile/type failures
- Status: `OK`

### Locale redirect verification - Point 45 (`/rooms` server redirect locale retention)
- Scope:
  - `app/rooms/page.js`
  - `docs/route-review-tracker.md`
- Good:
  - `/rooms` was already redirecting users into canonical rooms entry route (`/ruum`)
- Risk:
  - redirect target was hardcoded (`/ruum`) and could drop active locale prefix
- Action:
  - switched `/rooms` server redirect to cookie-locale-aware `localizePath("/ruum", locale)`
  - updated route tracker note for `/rooms`
- Status: `OK`

### Route inventory sync - Point 46 (`docs/routes.txt` completeness)
- Scope:
  - `docs/routes.txt`
- Good:
  - route inventory file was mostly aligned with app routes
- Risk:
  - new forgot-PIN request route (`/taasta-parool`) was missing from inventory list
- Action:
  - added `/taasta-parool -> app/taasta-parool/page.jsx` entry to route inventory
- Status: `OK`

### Auth reset verification - Point 47 (locale-safe reset-link generation + response consistency)
- Scope:
  - `app/api/auth/password/reset/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - reset request/update flow already enforced token + IP rate limits and key-based error payloads
- Risk:
  - reset-link URL generation used fixed EN route lookup and did not preserve requested locale in link path, so EN/RU users could lose locale context when opening token links
  - locale parsing accepted only `locale` body field (not `lang`), which was inconsistent with other API routes
  - error payload `message` field returned raw key instead of translated text
- Action:
  - switched reset-link path generation to locale-aware route lookup + `localizePath(...)` (`/en|/ru` prefix when applicable)
  - aligned locale parsing to accept `body.locale || body.lang` for both POST and PUT handlers
  - aligned API error payload shape so `message` returns translated text (matching other routes)
  - updated route tracker note for `app/api/auth/password/reset/route.js`
- Status: `OK`

### Chat analysis API verification - Point 48 (localized key-first errors for file/usage endpoints)
- Scope:
  - `app/api/chat/analyze-file/route.js`
  - `app/api/chat/analyze-usage/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - file-analyze endpoint already enforced auth + subscription, MIME allowlist, file-size cap, and daily quota with atomic DB increment
  - analyze-usage endpoint already enforced auth + rate limits and returned daily usage shape
- Risk:
  - both endpoints returned raw message keys in `message` field for several error paths, which was inconsistent with broader API contract (key-first + localized message fallback)
- Action:
  - added locale resolution from query/header (`locale|lang`, `x-ui-locale`, `accept-language`) in both routes
  - aligned `errorJson` and quota/subscription failure payloads to return translated `message` while preserving `messageKey`
  - updated route tracker notes for both analyze endpoints
- Status: `OK`

### Payment env compatibility verification - Point 49 (Maksekeskus legacy env alias safety)
- Scope:
  - `lib/payments/maksekeskus.js`
  - `docs/payment-production-env-checklist.md`
- Good:
  - payment init already used centralized provider helper with clear required env contract
- Risk:
  - existing environment templates still contained legacy Maksekeskus variable names (`MAKSEKESKUS_API_URL`, `MAKSEKESKUS_SECRET_KEY`, `MAKSEKESKUS_MERCHANT_ID`), while runtime expected newer names only
  - mismatch could cause checkout init failures (`provider_unavailable`) despite seemingly configured secrets
- Action:
  - added backward-compatible runtime aliases in payment helper:
    - `API_BASE` falls back to `MAKSEKESKUS_API_URL`
    - `API_KEY` falls back to `MAKSEKESKUS_SECRET_KEY`
    - `SHOP_ID` falls back to `MAKSEKESKUS_MERCHANT_ID`
  - documented alias compatibility and migration note in payment production checklist
- Status: `OK`

### Voice API verification - Point 50 (STT/TTS subscription enforcement + localized errors)
- Scope:
  - `app/api/stt/route.js`
  - `app/api/tts/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - voice routes already required authenticated session and had request rate limits
  - STT had file-size and MIME checks; TTS had max-length checks and provider fallback
- Risk:
  - STT/TTS endpoints were not enforcing active subscription, enabling paid-capability API access for logged-in users without active plan
  - several voice error payloads returned raw keys in `message` field
- Action:
  - added `requireSubscription(...)` gate to both STT and TTS routes (aligned with chat capability protection)
  - aligned rate-limit and error responses to include localized `message` (while preserving `messageKey`)
  - updated route tracker notes for both voice routes
- Status: `OK`

### Chat conversation API verification - Point 51 (server-side role spoofing guard)
- Scope:
  - `app/api/chat/conversations/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - conversations list/create flow already enforced auth, ownership scope, and request rate limits
- Risk:
  - create/update logic accepted `role` directly from request body, allowing non-admin clients to spoof conversation role (`SOCIAL_WORKER`) via direct API call
- Action:
  - enforced role source on server:
    - non-admin: conversation role now comes from authenticated session role
    - admin: still allowed to set requested role intentionally
  - updated route tracker note for `app/api/chat/conversations/route.js`
- Status: `OK`

### Chat conversation detail APIs verification - Point 52 (ownership/pagination/archive safeguards)
- Scope:
  - `app/api/chat/conversations/[id]/route.js`
  - `app/api/chat/conversations/[id]/messages/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - conversation read/archive/restore route enforces ownership/admin checks and explicit archived-state behavior
  - conversation messages route enforces ownership/admin checks, excludes archived conversations, and uses bounded cursor pagination
  - both routes include chat rate limits and DB-offline degraded/error handling patterns
- Risk:
  - no new blocking issue found in this pass
- Action:
  - updated tracker notes for both conversation-detail endpoints to close missing review annotations
- Status: `OK`

### Chat core/run APIs verification - Point 53 (gate contract consistency + run-state audit)
- Scope:
  - `app/api/chat/route.js`
  - `app/api/chat/run/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - chat core route already enforces auth/subscription gate, room-membership constraints, and route-level rate limits for stream/non-stream flows
  - run-state route already enforces ownership/admin access and returns bounded history payload with DB-offline fallback
- Risk:
  - chat core gate error payload lacked explicit `messageKey`, relying only on `message` key string (contract drift risk for frontend resolvers)
- Action:
  - added `messageKey` to `requireSubscription` failure response in `app/api/chat/route.js`
  - updated tracker notes for both core chat endpoints
- Status: `OK`

### Rooms API verification - Point 54 (route coverage + message POST limiter hardening)
- Scope:
  - `app/api/rooms/route.js`
  - `app/api/rooms/[roomId]/route.js`
  - `app/api/rooms/[roomId]/read/route.js`
  - `app/api/rooms/[roomId]/messages/route.js`
  - `app/api/rooms/[roomId]/messages/[msgId]/route.js`
  - `app/api/rooms/[roomId]/messages/stream/route.js`
  - `app/api/rooms/[roomId]/members/route.js`
  - `app/api/rooms/[roomId]/leave/route.js`
  - `docs/route-review-tracker.md`
- Good:
  - room routes already enforced membership/admin ownership constraints and sponsored-membership subscription rules
  - message list pagination, read-marker updates, soft delete, and SSE stream rechecks were already in place
- Risk:
  - room message POST route used isolated ad-hoc in-memory limiter implementation (separate from shared limiter utility), increasing behavior drift risk across APIs
- Action:
  - replaced ad-hoc POST limiter in `app/api/rooms/[roomId]/messages/route.js` with shared `consumeRateLimit(...)` pattern (`room + user + ip` key)
  - added env-configurable limiter knobs:
    - `ROOM_MESSAGES_POST_RATE_LIMIT_WINDOW_MS`
    - `ROOM_MESSAGES_POST_RATE_LIMIT_MAX`
  - updated tracker notes for all previously unannotated rooms routes
- Status: `OK`

### Accessibility verification - Point 55 (homepage + login modal screen-reader pass)
- Scope:
  - `components/HomePage.jsx`
  - `components/LoginModal.jsx`
- Good:
  - home role-card actions already had concise action-style `aria-label` values
  - login modal already had `role="dialog"`, `aria-modal="true"` and keyboard tab-loop focus trapping
- Risk:
  - homepage lacked a single explicit SR-first page intro (`h1` + short intro), increasing chance that SR users hear fragmented card/UI labels first
  - scroll-cue anchor was icon-only without an explicit accessible label
  - login modal did not mark background main content inert/hidden, so SR virtual navigation could still discover background content while dialog was open
  - hidden PIN capture inputs were still exposed to assistive tech
- Action:
  - added SR-only homepage heading + intro using localized home metadata keys (`meta.home.title`, `meta.home.description`)
  - marked card front faces as decorative (`aria-hidden="true"`) and added `preventDefault()` on card back `Space/Enter` keyboard activation
  - labeled scroll cue link explicitly and added SR-only text
  - added login-modal background isolation: set `#main` inert + `aria-hidden`, and restore prior state on close
  - hid hidden PIN capture inputs from assistive tech (`aria-hidden="true"`, mobile input `tabIndex={-1}`)
  - removed mouse-leave forced focus jump from modal to reduce unexpected SR focus churn
- Status: `OK`

### Document analysis token-budget hardening - Point 56 (role-aware quality/cost balance)
- Scope:
  - `app/api/chat/route.js`
  - `app/api/chat/analyze-file/route.js`
  - `components/chat/hooks/useChatAnalysisController.js`
  - `lib/chat/promptBuilder.js`
- Good:
  - document upload already had quota + subscription gate
  - extended mode (`combineSources`) already existed for combining uploaded document and RAG sources
- Risk:
  - chat context previously used uploaded-document prefix only (`slice(...)`), which is cheap but can miss relevant sections deeper in document
  - no strict server-side cap for forwarded `maxChunks` (client could request too many chunks)
  - output token cap could stay effectively uncapped if `OPENAI_MAX_OUTPUT_TOKENS` was not set
- Action:
  - replaced prefix-only document context with query-aware chunk selection:
    - scores chunks against current question + recent user turns
    - applies hard chunk count and character budgets
    - keeps selected chunks in source order for coherence
  - added role/mode budgets:
    - separate document-context budgets for `CLIENT` vs `SOCIAL_WORKER`
    - tighter history window when document chunks are present
  - added hard server clamp for analyze upload chunks (`CHAT_ANALYZE_MAX_CHUNKS`) and always forwards bounded `maxChunks`
  - frontend now sends explicit bounded `maxChunks` when uploading document (`NEXT_PUBLIC_CHAT_ANALYZE_MAX_CHUNKS`)
  - added role-based output token fallback caps in prompt builder:
    - `OPENAI_MAX_OUTPUT_TOKENS_CLIENT` (default 650)
    - `OPENAI_MAX_OUTPUT_TOKENS_WORKER` (default 900)
- Status: `OK`

### Admin user-cost analytics expansion - Point 57 (per-user usage, limits, estimated cost)
- Scope:
  - `app/api/admin/analytics/users/route.js`
  - `components/admin/AnalyticsDashboard.jsx`
  - `app/api/stt/route.js`
  - `app/api/tts/route.js`
  - `messages/en.json`
  - `messages/et.json`
  - `messages/ru.json`
  - `docs/route-review-tracker.md`
- Good:
  - admin analytics already exposed global KPIs and payment pipeline cards
  - chat telemetry (`chatLog`) already contained user-linked events for chat/RAG flows
- Risk:
  - admin lacked per-user cost visibility (usage + estimated spend + limits) for pricing/ops decisions
  - STT/TTS usage was not logged into `chatLog`, so voice-cost estimation was impossible historically
- Action:
  - added new admin-only endpoint `GET /api/admin/analytics/users`:
    - returns per-user 30d usage, estimated costs, analyze limit, subscription snapshot, and paid amount
    - supports period/limit pagination params and localized key-first error payloads
  - added STT/TTS usage logging events:
    - `stt_request` (provider, locale, file size, text length)
    - `tts_request` (provider, locale, text length)
  - extended analytics dashboard:
    - new per-user table (`users, costs, limits`) with usage and cost breakdown
    - added summary cards for users count, estimated cost, and paid amount
    - added event-filter labels for STT/TTS logs
  - added i18n keys for new analytics section and API/UI errors (EN/ET/RU)
- Status: `OK`

### Monthly dynamic usage-budget enforcement - Point 58 (shared budget across chat/rag/stt/tts)
- Scope:
  - `lib/usageBudget.js`
  - `app/api/chat/route.js`
  - `app/api/stt/route.js`
  - `app/api/tts/route.js`
  - `messages/en.json`
  - `messages/et.json`
  - `messages/ru.json`
- Good:
  - analytics now reports per-user estimated costs and usage components
  - cost model envs are centralized for admin view and operations
- Risk:
  - without hard enforcement, high-frequency users could exceed target monthly cost envelope
  - fixed per-feature quotas cannot rebalance automatically when users skip voice features
- Action:
  - added shared monthly budget utility (`lib/usageBudget.js`) with env-driven pricing:
    - `MONTHLY_COST_BUDGET_EUR_PER_USER` (default `4`)
    - `ANALYTICS_COST_*` unit costs for chat/rag/stt/tts
  - added monthly budget checks:
    - chat: blocks new request when monthly budget is reached
    - STT: blocks transcription before provider call if budget would be exceeded by uploaded audio
    - TTS: blocks synthesis before provider call if budget would be exceeded by text length
  - this model is dynamic by design:
    - if user does not use STT/TTS, more budget remains for chat/RAG
    - if user uses more voice features, remaining chat/RAG capacity decreases
  - added localized API key `api.common.monthly_budget_exceeded` in EN/ET/RU
- Status: `OK`

### Production env template hardening - Point 59 (safe server secret bootstrap file)
- Scope:
  - `production.env`
  - `.gitignore`
- Good:
  - runtime now has explicit monthly budget/cost env keys and webhook policy keys to configure
- Risk:
  - production secret setup can drift when no single template includes all required operational keys
- Action:
  - added `production.env` template with placeholders for:
    - core app/auth/database/openai/rag/email settings
    - maksekeskus + webhook policy settings
    - monthly dynamic budget and unit cost settings
  - added `production.env` to `.gitignore` to avoid accidental secret commits
- Status: `OK`

### Admin analytics PII minimization - Point 60 (email masking by default)
- Scope:
  - `app/api/admin/analytics/users/route.js`
  - `production.env`
  - `docs/route-review-tracker.md`
- Good:
  - per-user analytics provides operational visibility for costs/limits
- Risk:
  - full email addresses in analytics are personal data and exceed minimum-necessary display for many admin tasks
- Action:
  - enabled email masking by default in users analytics response
  - added explicit env toggle `ADMIN_ANALYTICS_SHOW_FULL_EMAILS` for exceptional support-only use
  - set `ADMIN_ANALYTICS_SHOW_FULL_EMAILS=false` in production template
- Status: `OK`

### Env hardening + fail-fast checks - Point 61 (pre-launch env safety rail)
- Scope:
  - `production.env`
  - `.env.production`
  - `scripts/check-env.mjs`
  - `package.json`
  - `app/api/chat/analyze-file/route.js`
  - `rag-service/main.py`
  - `auth.js`
  - `lib/mailer.js`
- Good:
  - baseline env templates already had explicit auth/RAG/subscription knobs
- Risk:
  - upload limits and MIME policy were too permissive for hardened production profile
  - env placeholders/drift can slip into deploys without a dedicated preflight validator
  - SMTP on port 587 could silently continue without STARTTLS if provider misconfiguration occurs
- Action:
  - hardened upload profile:
    - reduced max upload to `25MB` in production env templates
    - removed `text/html` and `application/msword` from allowed upload MIME list
    - aligned API route to prefer server-only vars (`RAG_SERVER_MAX_MB`, `RAG_ALLOWED_MIME`) over `NEXT_PUBLIC_*`
  - clarified chunking profile:
    - kept token-mode vars in production template
    - removed char-mode vars from production token profile
  - added fail-fast env validator script:
    - `scripts/check-env.mjs` (`npm run env:check`)
    - checks placeholders, required keys, URL shape/HTTPS, external DB TLS mode, `NEXT_PUBLIC_*` secret leakage, chunking-mode conflicts, and hardened upload policy
  - wired fail-fast into production start:
    - `npm start` now runs `npm run env:check` before `next start`
  - SMTP hardening:
    - added `SMTP_REQUIRE_TLS=true` env and enforcement in mailer
  - auth alias compatibility:
    - `auth.js` now accepts `AUTH_SECRET` fallback to `NEXTAUTH_SECRET`
- Status: `OK`

## Open Items Queue (next passes)

1. Execute Maksekeskus sandbox E2E with real provider payloads/signatures and capture evidence from `npm run payments:maksekeskus:e2e` + provider callbacks
2. Set final production values for webhook policy envs (`SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION`, `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION`, `SUBSCRIPTION_WEBHOOK_FAILED_ACTION`) and record decision
3. Configure repository secrets for scheduler (`PAYMENT_ALERT_DISPATCH_BASE_URL`, `PAYMENT_ALERT_DISPATCH_KEY`) and validate dry-run + live webhook sink delivery
