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
| `/admin/analytics` | `app/admin/analytics/page.jsx` | PENDING | - |
| `/admin/rag` | `app/admin/rag/page.jsx` | PENDING | - |
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
| `app/api/admin/analytics/events/route.js` | PENDING | - |
| `app/api/admin/analytics/summary/route.js` | PENDING | - |
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
| `app/api/invites/[id]/accept/route.js` | PENDING | - |
| `app/api/invites/[id]/resend/route.js` | PENDING | - |
| `app/api/invites/[id]/revoke/route.js` | PENDING | - |
| `app/api/invites/route.js` | PENDING | - |
| `app/api/profile/route.js` | MONITOR | reviewed: profile read/update/delete, current PIN verification path, email-verify dispatch via i18n templates |
| `app/api/rag/[...path]/route.js` | PENDING | - |
| `app/api/rag/selftest/route.js` | PENDING | - |
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
- Chat frontend integration: `components/alalehed/ChatBody.jsx`, `components/alalehed/chat/ChatBodyView.jsx`, `components/chat/hooks/*`, `components/ChatSidebar.jsx`, `components/LoginModal.jsx`

## Next Review Order
1. `app/api/invites/*`
2. `app/api/admin/*` and `app/api/rag/*`
