# Route Review Tracker

Date: 2026-02-15

Purpose:
- Every route is reviewed for behavior, dependencies, error handling, and launch risks.
- Translation cleanup is only one part; functional review is mandatory for each route.

Review status legend:
- `PENDING`: not reviewed yet
- `MONITOR`: reviewed, but needs follow-up/observability or broader integration checks
- `OK`: reviewed and production-ready for current scope
- `FIX`: blocking issue found and needs fix

## App Routes
| Route | File | Status | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.js` | MONITOR | reviewed: home route metadata key-based; role-card/login gate flow in `HomePage` is stable but animation-heavy |
| `/admin/analytics` | `app/admin/analytics/page.jsx` | MONITOR | reviewed: session+admin guard + analytics dashboard i18n key migration; continue E2E verification |
| `/admin/rag` | `app/admin/rag/page.jsx` | MONITOR | reviewed: session+admin guard + wrapper + `RagAdminPanel` key-based i18n pass; continue E2E ingest/admin checks |
| `/join` | `app/join/page.jsx` | MONITOR | reviewed: invite accept flow, auth gate, localized API error resolving via `resolveApiMessage` |
| `/kasutusjuhend` | `app/kasutusjuhend/page.jsx` | MONITOR | reviewed: policy-layout guide page with localized section content; uses trusted HTML content from locale catalogs |
| `/kasutustingimused` | `app/kasutustingimused/page.js` | MONITOR | reviewed: metadata key-based + policy body from i18n rich text sections |
| `/privaatsustingimused` | `app/privaatsustingimused/page.js` | MONITOR | reviewed: metadata key-based + legal links rendered via controlled rich-text replacements |
| `/profiil` | `app/profiil/page.js` | MONITOR | reviewed: metadata key-based + profile shell/orbital actions delegate to `/api/profile` with key-resolved errors |
| `/registreerimine` | `app/registreerimine/page.js` | MONITOR | reviewed: registration wizard flow + `/api/register` integration; fixed PIN input sanitization regex and locale-aware API error resolving |
| `/room/[roomId]` | `app/room/[roomId]/page.jsx` | MONITOR | room-mode behavior reviewed; continue E2E checks |
| `/rooms` | `app/rooms/page.js` | MONITOR | room list UI/flow reviewed; continue E2E checks |
| `/ruum` | `app/ruum/page.js` | MONITOR | rooms redirect/entry path reviewed; continue E2E checks |
| `/taasta-parool/[token]` | `app/taasta-parool/[token]/page.jsx` | MONITOR | reviewed: metadata moved to locale key lookup; reset form validates PIN and calls password reset PUT route |
| `/tellimus` | `app/tellimus/page.js` | MONITOR | reviewed: activation now calls `/api/subscription/init` and redirects to provider checkout; callback-state UX is in place |
| `/uuenda-epost` | `app/uuenda-epost/page.js` | MONITOR | reviewed: profile email update flow via `/api/profile` with current PIN verification and localized API error handling |
| `/uuenda-pin` | `app/uuenda-pin/page.js` | MONITOR | reviewed: reset request UI -> `/api/auth/password/reset`; aligned locale propagation and key-based error resolving |
| `/vestlus` | `app/vestlus/page.js` | MONITOR | chat page behavior reviewed; keep regression checks active |

## API Routes
| File | Status | Notes |
| --- | --- | --- |
| `app/api/admin/analytics/events/route.js` | MONITOR | reviewed: admin-gated event log listing, locale-aware key-first errors, guarded DB failure response |
| `app/api/admin/analytics/summary/route.js` | MONITOR | reviewed: admin-gated KPI aggregates, locale-aware key-first errors, guarded DB failure response; includes payment pipeline KPI summary + threshold-based billing alerts from payment events |
| `app/api/admin/analytics/payment-alerts/dispatch/route.js` | MONITOR | reviewed: admin/cron-key gated external dispatch for critical payment alerts with dedupe, optional dry-run, and signed webhook delivery |
| `app/api/auth/login-resend-otp/route.js` | MONITOR | - |
| `app/api/auth/login-step1/route.js` | MONITOR | - |
| `app/api/auth/login-step2/route.js` | MONITOR | - |
| `app/api/auth/password/reset/route.js` | MONITOR | - |
| `app/api/chat/analyze-file/route.js` | MONITOR | - |
| `app/api/chat/analyze-usage/route.js` | MONITOR | - |
| `app/api/chat/conversations/[id]/messages/route.js` | MONITOR | - |
| `app/api/chat/conversations/[id]/route.js` | MONITOR | - |
| `app/api/chat/conversations/route.js` | MONITOR | - |
| `app/api/chat/route.js` | MONITOR | - |
| `app/api/chat/run/route.js` | MONITOR | - |
| `app/api/invites/[id]/accept/route.js` | MONITOR | reviewed: token accept flow, billing/sponsorship gating, room member upsert, localized key-based failures |
| `app/api/invites/[id]/resend/route.js` | MONITOR | reviewed: moderator/owner access, token rotation resend, localized key-based failures |
| `app/api/invites/[id]/revoke/route.js` | MONITOR | reviewed: moderator/owner revoke access, localized key-based failures |
| `app/api/invites/route.js` | MONITOR | reviewed: invite list/create, room bootstrap path, sponsorship checks, i18n email template usage |
| `app/api/profile/route.js` | MONITOR | reviewed: profile read/update/delete, current PIN verification path, email-verify dispatch via i18n templates |
| `app/api/rag/[...path]/route.js` | MONITOR | reviewed: proxy now admin-only, locale-aware key-first preflight errors, rate-limit + timeout/error guards |
| `app/api/rag/selftest/route.js` | MONITOR | reviewed: admin self-test flow (RAG list/search + OpenAI check), locale-aware step labels/errors |
| `app/api/register/route.js` | MONITOR | reviewed: rate-limited registration, PIN/email validation, verify-token + email dispatch via i18n keys |
| `app/api/rooms/[roomId]/leave/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/members/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/messages/[msgId]/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/messages/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/messages/stream/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/read/route.js` | MONITOR | - |
| `app/api/rooms/[roomId]/route.js` | MONITOR | - |
| `app/api/rooms/route.js` | MONITOR | - |
| `app/api/stt/route.js` | MONITOR | - |
| `app/api/subscription/route.js` | MONITOR | reviewed: read/cancel path stable; direct POST activation is disabled by default (`SUBSCRIPTION_ALLOW_DIRECT_ACTIVATION` override only) |
| `app/api/subscription/init/route.js` | MONITOR | reviewed: authenticated payment init creates `Payment(INITIATED)` and returns checkout URL; emits structured lifecycle logs |
| `app/api/subscription/callback/route.js` | MONITOR | reviewed: provider return redirect maps callback status to localized `/tellimus` state; callback event logging is enabled |
| `app/api/subscription/webhook/route.js` | MONITOR | reviewed: signature-check + idempotent payment status updates + subscription activation on `PAID`; side-effects for `REFUNDED/CANCELED/FAILED` are explicit policy envs; production blocks unsigned webhooks unless `SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED=1`; structured webhook event logs + owner email notifications enabled (`PAYMENT_OWNER_EMAIL`) |
| `app/api/tts/route.js` | MONITOR | - |
| `app/api/verify-email/route.js` | MONITOR | reviewed: link verification GET + resend POST, token lifecycle cleanup, localized messageKey errors |

## Reviewed Scope So Far
- Chat stack: `app/api/chat/*`, `app/api/rooms/*`, `app/api/stt/route.js`, `app/api/tts/route.js`
- Auth reset and OTP stack: `app/api/auth/password/reset/route.js`, `app/api/auth/login-step1/route.js`, `app/api/auth/login-step2/route.js`, `app/api/auth/login-resend-otp/route.js`
- Registration and email verification: `app/api/register/route.js`, `app/api/verify-email/route.js`
- Account and billing core: `app/api/profile/route.js`, `app/api/subscription/route.js`, `app/api/subscription/init/route.js`, `app/api/subscription/callback/route.js`, `app/api/subscription/webhook/route.js`
- Invites stack: `app/api/invites/route.js`, `app/api/invites/[id]/accept/route.js`, `app/api/invites/[id]/resend/route.js`, `app/api/invites/[id]/revoke/route.js`
- Admin and RAG ops APIs: `app/api/admin/analytics/events/route.js`, `app/api/admin/analytics/summary/route.js`, `app/api/admin/analytics/payment-alerts/dispatch/route.js`, `app/api/rag/[...path]/route.js`, `app/api/rag/selftest/route.js`
- Admin route shells: `app/admin/analytics/page.jsx`, `app/admin/rag/page.jsx`
- Admin analytics UI: `components/admin/AnalyticsDashboard.jsx`, `app/admin/analytics/AdminAnalyticsClient.jsx` (includes payment pipeline KPI cards + payment event filters)
- Admin RAG UI: `components/admin/RagAdminPanel.jsx`, `app/admin/rag/RagAdminClient.jsx`
- Chat frontend integration: `components/alalehed/ChatBody.jsx`, `components/alalehed/chat/ChatBodyView.jsx`, `components/chat/hooks/*`, `components/ChatSidebar.jsx`, `components/LoginModal.jsx`
- App route pass (home/invite/profile/reset/subscription): `app/page.js`, `app/join/page.jsx`, `app/profiil/page.js`, `app/taasta-parool/[token]/page.jsx`, `app/tellimus/page.js`, `components/HomePage.jsx`, `components/alalehed/ProfiilBody.jsx`, `components/alalehed/UnustasinParooliBody.jsx`, `app/taasta-parool/[token]/ResetPasswordForm.jsx`, `components/alalehed/TellimusBody.jsx`
- App route pass (registration/reset/email/legal/guide): `app/registreerimine/page.js`, `app/uuenda-pin/page.js`, `app/uuenda-epost/page.js`, `app/kasutustingimused/page.js`, `app/privaatsustingimused/page.js`, `app/kasutusjuhend/page.jsx`, `components/alalehed/RegistreerimineBody.jsx`, `components/alalehed/UnustasinParooliBody.jsx`, `components/alalehed/UuendaEpostiBody.jsx`, `components/alalehed/KasutustingimusedBody.jsx`, `components/alalehed/PrivaatsusBody.jsx`, `components/alalehed/KasutusjuhendBody.jsx`

## Next Review Order
1. Run Maksekeskus sandbox E2E in real provider environment and attach evidence (`docs/payment-maksekeskus-sandbox-e2e.md`, `npm run payments:maksekeskus:e2e`)
2. Set GitHub scheduler secrets for `POST /api/admin/analytics/payment-alerts/dispatch` (`PAYMENT_ALERT_DISPATCH_BASE_URL`, `PAYMENT_ALERT_DISPATCH_KEY`) and validate webhook sink delivery end-to-end
