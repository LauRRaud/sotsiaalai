# Maksekeskus Payment Readiness

Date: 2026-02-15

## Current State (implemented)

Relevant files:
- `app/api/subscription/route.js`
- `app/api/subscription/init/route.js`
- `app/api/subscription/callback/route.js`
- `app/api/subscription/webhook/route.js`
- `lib/payments/maksekeskus.js`
- `lib/payments/observability.js`
- `components/alalehed/TellimusBody.jsx`
- `scripts/maksekeskus-sandbox-e2e.mjs`
- `docs/payment-maksekeskus-sandbox-e2e.md`
- `docs/payment-production-env-checklist.md`
- `prisma/schema.prisma` (`Subscription`, `Payment`)

Behavior today:
1. `GET /api/subscription` returns user + latest subscription shape.
2. `POST /api/subscription/init` creates `Payment(status=INITIATED, provider=MAKSEKESKUS)` and returns checkout URL.
3. `GET /api/subscription/callback` maps provider return status to localized `/tellimus?payment=...` state.
4. `POST /api/subscription/webhook` verifies signature (when secret configured), updates payment idempotently, and applies explicit subscription policies:
   - `PAID` -> activate/extend
   - `REFUNDED` -> `cancel|none` via `SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION` (default `cancel`)
   - `CANCELED` -> `cancel|none` via `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION` (default `none`)
   - `FAILED` -> `cancel|none` via `SUBSCRIPTION_WEBHOOK_FAILED_ACTION` (default `none`)
5. `POST /api/subscription` direct activation is disabled by default (can be re-enabled only via `SUBSCRIPTION_ALLOW_DIRECT_ACTIVATION=1`).
6. `/tellimus` page now calls `/api/subscription/init` and redirects to provider checkout.
7. `DELETE /api/subscription` still marks active subscriptions as canceled.
8. Payment lifecycle now emits structured logs from init/callback/webhook routes (`[payments] { ... }`).
9. Payment lifecycle events are persisted to `ChatLog` (`role=payment`) for admin analytics KPI tracking.
10. Platform-side sandbox E2E verification script exists (`npm run payments:maksekeskus:e2e`).
11. Critical payment alerts can be externally dispatched via `POST /api/admin/analytics/payment-alerts/dispatch`.
12. Payment alert dispatch supports secure webhook signatures and dry-run mode for rollout validation.
13. Scheduler automation is configured via GitHub Actions (`.github/workflows/payment-alert-dispatch.yml`).
14. Webhook status changes now trigger owner email notifications (default recipient `info@sotsiaal.ai`, configurable).
15. Sponsored invite checkout is blocked when the invitee already has an active subscription.
16. Sponsored invite acceptance creates a one-month sponsored subscription; it does not automatically roll over into the invitee's own paid renewal.
17. `/tellimus` now shows sponsored-access metadata and warns when sponsored access is ending soon or has expired.

## Sponsored Invite Payment Policy

Current implemented behavior:

1. A sponsor can pay for one month of access for the invited person.
2. That payment creates sponsored access for roughly one month after invite acceptance.
3. The invited user is not auto-converted into a self-paying subscription after that month.
4. If the invited user already has an active subscription, sponsored checkout is rejected up front.
5. After the sponsored month ends:
   - normal subscription-gated platform access ends unless the user activates their own subscription
   - sponsored room access also ends unless the user has their own active subscription
6. The Subscription page is the user-facing reminder surface for:
   - sponsored until date
   - ending soon state
   - expired state with prompt to activate own subscription

## Remaining Launch Risks

1. Maksekeskus payload/signature contract still needs sandbox confirmation against exact provider spec.
2. Callback route is intentionally non-authoritative; webhook must remain final source-of-truth in provider setup.
3. Production env values (`MAKSEKESKUS_*`, webhook secret, return/cancel URLs, subscription webhook policy envs) must be set and validated.
4. Provider retry semantics and backoff should be validated against real sandbox delivery behavior.
5. Webhook signature is now required by default in production (`MAKSEKESKUS_WEBHOOK_SECRET`), unless explicitly bypassed with `SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED=1`.

## Target Flow (Maksekeskus)

### 1) Checkout Init API

Endpoint:
- `POST /api/subscription/init`

Responsibilities:
- authenticate user
- resolve plan/amount/currency
- create `Payment` row with:
  - `provider = MAKSEKESKUS`
  - `status = INITIATED`
  - unique `providerPaymentId` placeholder/reference
- call Maksekeskus create-payment API
- return checkout URL / redirect payload to frontend

### 2) Return/Callback API (user browser redirect)

Endpoint:
- `GET /api/subscription/callback`

Responsibilities:
- parse provider callback params
- map state for user feedback
- do not trust callback as final truth
- set user-facing state and redirect to `/tellimus` with status marker

### 3) Webhook API (source of truth)

Endpoint:
- `POST /api/subscription/webhook`

Responsibilities:
- verify Maksekeskus signature/auth
- idempotently update `Payment.status` (`PAID`, `FAILED`, `CANCELED`, `REFUNDED`)
- on `PAID`: activate/extend subscription transactionally
- on `REFUNDED`/`CANCELED`/`FAILED`: execute configured subscription policy action (`cancel|none`)
- store raw payload/audit metadata
- always return deterministic success/error codes for provider retries

### Webhook Subscription Policy Env

- `SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION=cancel|none` (default: `cancel`)
- `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION=cancel|none` (default: `none`)
- `SUBSCRIPTION_WEBHOOK_FAILED_ACTION=cancel|none` (default: `none`)

### 4) Subscription Write Rules

Current rule:
- `/tellimus` no longer uses direct activation path
- activation must happen from validated provider payment events
- manual direct activation is env-gated (`SUBSCRIPTION_ALLOW_DIRECT_ACTIVATION=1`)

## Database/Idempotency Checklist

- Keep `@@unique([provider, providerPaymentId])` as the main dedupe key.
- Add payment-level idempotency key if provider sends separate event IDs.
- Use DB transaction for:
  - payment status transition
  - subscription status/validity update
- Enforce monotonic status transitions (`INITIATED -> PAID|FAILED|CANCELED`, no invalid rollback).

## Frontend Status

- `components/alalehed/TellimusBody.jsx` now:
  - calls `POST /api/subscription/init`
  - redirects to checkout URL
  - reads callback state (`payment=success|pending|failed|canceled`) and shows localized feedback
  - reads sponsored subscription metadata and shows ending-soon / expired notices for sponsor-paid access

## Security/Operations Checklist

- Verify callback/webhook signature with server-side secret.
- Production safety: unsigned webhook processing is blocked by default in production. Temporary bypass is possible via `SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED=1` (not recommended for launch).
- Owner webhook mail settings:
  - `PAYMENT_OWNER_EMAIL` (default `info@sotsiaal.ai`)
  - `PAYMENT_OWNER_EMAIL_LOCALE` (`en|et|ru`, default `en`)
- Add endpoint-level rate limits for new payment routes.
- Structured logs for payment lifecycle events are now enabled (`PAYMENT_LOG_ENABLED`).
- DB-backed payment event logging for analytics is enabled by default (`PAYMENT_DB_LOG_ENABLED`).
- Dashboard-side payment alert thresholds are configurable via:
  - `PAYMENT_ALERT_MIN_CHECKOUT_CREATE_RATE_PCT`
  - `PAYMENT_ALERT_MIN_PAID_FROM_CHECKOUT_RATE_PCT`
  - `PAYMENT_ALERT_MAX_CALLBACK_PENDING_RATE_PCT`
  - `PAYMENT_ALERT_MAX_WEBHOOK_TECH_ERROR_COUNT`
  - `PAYMENT_ALERT_MAX_WEBHOOK_TECH_ERROR_RATE_PCT`
  - `PAYMENT_ALERT_MIN_SAMPLE_SIZE`
- External critical-alert dispatch settings:
  - `PAYMENT_ALERT_WEBHOOK_URL` (target webhook for critical alerts)
  - `PAYMENT_ALERT_DISPATCH_KEY` (shared secret for scheduler calls)
  - `PAYMENT_ALERT_WEBHOOK_SIGNING_SECRET` (optional outbound webhook HMAC signing secret)
  - `PAYMENT_ALERT_DISPATCH_DEDUPE_HOURS` (repeat-suppression window, default 6h)
  - `PAYMENT_ALERT_WEBHOOK_TIMEOUT_MS` (dispatch timeout)
- Scheduler secrets (GitHub Actions):
  - `PAYMENT_ALERT_DISPATCH_BASE_URL`
  - `PAYMENT_ALERT_DISPATCH_KEY`
- Add replay protection for webhook processing.
- Add monitoring counters:
  - checkout initiated
  - callback received
  - webhook paid/failed/canceled
  - subscription activated from payment

## Automated E2E Check

Run:

```bash
npm run payments:maksekeskus:e2e
```

Reference:
- `docs/payment-maksekeskus-sandbox-e2e.md`
- `docs/payment-production-env-checklist.md`

## External Alert Dispatch Endpoint

- Endpoint: `POST /api/admin/analytics/payment-alerts/dispatch`
- Access:
  - admin session OR
  - header `x-payment-alert-dispatch-key: <PAYMENT_ALERT_DISPATCH_KEY>`
- Behavior:
  - computes current critical payment alerts from pipeline metrics
  - dedupes by alert code using recent `payment_alert_dispatched` logs
  - POSTs pending critical alerts to `PAYMENT_ALERT_WEBHOOK_URL`
  - supports `dryRun=1` and `bypassDedupe=1` query flags for controlled validation
- Validation command:
  - `npm run payments:alerts:dispatch`
- Runbook:
  - `docs/payment-alert-dispatch-runbook.md`

## Suggested Endpoint Contract (minimal)

- `POST /api/subscription/init`
  - input: `{ plan, locale }`
  - output: `{ ok, paymentId, checkoutUrl }`

- `POST /api/subscription/webhook`
  - input: provider payload + signature header
  - output: `{ ok: true }` on successful idempotent processing

- `GET /api/subscription`
  - keep as read endpoint for UI subscription status
