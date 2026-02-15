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
| `/` | `app/page.js` | PENDING | - |
| `/admin/analytics` | `app/admin/analytics/page.jsx` | MONITOR | reviewed: session+admin guard and no-store render shell; admin client still has hardcoded copy |
| `/admin/rag` | `app/admin/rag/page.jsx` | MONITOR | reviewed: session+admin guard and RAG shell; route still includes hardcoded copy/lang lock |
| `/join` | `app/join/page.jsx` | PENDING | - |
| `/kasutusjuhend` | `app/kasutusjuhend/page.jsx` | PENDING | - |
| `/kasutustingimused` | `app/kasutustingimused/page.js` | PENDING | - |
| `/privaatsustingimused` | `app/privaatsustingimused/page.js` | PENDING | - |
| `/profiil` | `app/profiil/page.js` | PENDING | - |
| `/registreerimine` | `app/registreerimine/page.js` | PENDING | - |
| `/room/[roomId]` | `app/room/[roomId]/page.jsx` | MONITOR | room-mode behavior reviewed; continue E2E checks |
| `/rooms` | `app/rooms/page.js` | MONITOR | room list UI/flow reviewed; continue E2E checks |
| `/ruum` | `app/ruum/page.js` | MONITOR | rooms redirect/entry path reviewed; continue E2E checks |
| `/taasta-parool/[token]` | `app/taasta-parool/[token]/page.jsx` | PENDING | - |
| `/tellimus` | `app/tellimus/page.js` | PENDING | - |
| `/uuenda-epost` | `app/uuenda-epost/page.js` | PENDING | - |
| `/uuenda-pin` | `app/uuenda-pin/page.js` | PENDING | - |
| `/vestlus` | `app/vestlus/page.js` | MONITOR | chat page behavior reviewed; keep regression checks active |

## API Routes
| File | Status | Notes |
| --- | --- | --- |
| `app/api/admin/analytics/events/route.js` | MONITOR | reviewed: admin-gated event log listing, locale-aware key-first errors, guarded DB failure response |
| `app/api/admin/analytics/summary/route.js` | MONITOR | reviewed: admin-gated KPI aggregates, locale-aware key-first errors, guarded DB failure response |
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
| `app/api/subscription/route.js` | MONITOR | reviewed: JWT-gated subscription read/activate/cancel, normalized status payload (`isActive`, `daysLeft`) |
| `app/api/tts/route.js` | MONITOR | - |
| `app/api/verify-email/route.js` | MONITOR | reviewed: link verification GET + resend POST, token lifecycle cleanup, localized messageKey errors |

## Reviewed Scope So Far
- Chat stack: `app/api/chat/*`, `app/api/rooms/*`, `app/api/stt/route.js`, `app/api/tts/route.js`
- Auth reset and OTP stack: `app/api/auth/password/reset/route.js`, `app/api/auth/login-step1/route.js`, `app/api/auth/login-step2/route.js`, `app/api/auth/login-resend-otp/route.js`
- Registration and email verification: `app/api/register/route.js`, `app/api/verify-email/route.js`
- Account and billing core: `app/api/profile/route.js`, `app/api/subscription/route.js`
- Invites stack: `app/api/invites/route.js`, `app/api/invites/[id]/accept/route.js`, `app/api/invites/[id]/resend/route.js`, `app/api/invites/[id]/revoke/route.js`
- Admin and RAG ops APIs: `app/api/admin/analytics/events/route.js`, `app/api/admin/analytics/summary/route.js`, `app/api/rag/[...path]/route.js`, `app/api/rag/selftest/route.js`
- Admin route shells: `app/admin/analytics/page.jsx`, `app/admin/rag/page.jsx`
- Chat frontend integration: `components/alalehed/ChatBody.jsx`, `components/alalehed/chat/ChatBodyView.jsx`, `components/chat/hooks/*`, `components/ChatSidebar.jsx`, `components/LoginModal.jsx`

## Next Review Order
1. `app/admin/*` pages + clients (`AdminAnalyticsClient`, `AnalyticsDashboard`, `RagAdminClient`, `RagAdminPanel`)
