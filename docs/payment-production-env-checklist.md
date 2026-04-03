# Payment Production Environment Checklist

Date: 2026-02-15

## Goal

One owner-facing checklist for Maksekeskus launch configuration, webhook policy decisions, and payment alert dispatch scheduling.

## Preflight Guard

Before starting production app process, run:
- `npm run env:check`

What it validates (fail-fast):
- required core keys are present (auth/db/openai/rag/email)
- placeholder values (`<...>`) are not left in active env
- URL shape and HTTPS requirements
- external DB requires `sslmode=verify-full`
- upload hardening profile (`25MB`, no `text/html` / `application/msword`)
- chunking config conflict checks (tokens vs chars mode)

## Maksekeskus Provider Config

Required:
- `MAKSEKESKUS_API_BASE` - provider API base URL
- `MAKSEKESKUS_API_KEY` - provider API key
- `MAKSEKESKUS_SHOP_ID` - provider shop/merchant identifier
- `MAKSEKESKUS_RETURN_URL` - user return URL for `payment_return` / `token_return` callbacks
- `MAKSEKESKUS_CANCEL_URL` - user cancel URL for MakeCommerce callback handling
- `MAKSEKESKUS_WEBHOOK_URL` - provider webhook target URL (`/api/subscription/webhook`)

Required when `SUBSCRIPTION_RECURRING_ENABLED=1`:
- `MAKSEKESKUS_PUBLIC_KEY` - publishable key used by `checkout.min.js`

Recommended:
- `MAKSEKESKUS_TIMEOUT_MS` - provider request timeout override (default is code-level fallback)
- `PAYMENT_OWNER_EMAIL` - owner notification recipient for webhook status emails (default: `info@sotsiaal.ai`)
- `PAYMENT_OWNER_EMAIL_LOCALE` - locale for owner webhook email template (`en|et|ru`, default `en`)

Webhook MAC verification uses `MAKSEKESKUS_API_KEY` directly. There is no separate unsigned bypass path in runtime.

## Subscription Webhook Policy (owner decision)

These envs define what subscription state changes are applied when webhook statuses arrive:
- `SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION=cancel|none`
- `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION=cancel|none`
- `SUBSCRIPTION_WEBHOOK_FAILED_ACTION=cancel|none`

Current defaults in code:
- `REFUNDED -> cancel`
- `CANCELED -> none`
- `FAILED -> none`

Recommended launch decision record:
1. Set final chosen value for each env in production secrets.
2. Record rationale (product + legal/billing expectations) in this file or release notes.
3. Run `npm run payments:maksekeskus:e2e` with `MAKSEKESKUS_E2E_EXPECT_REFUNDED_ACTION` matching your chosen refunded action.

## Payment Alert Dispatch Config

Required for live external dispatch:
- `PAYMENT_ALERT_WEBHOOK_URL` - webhook sink endpoint for critical payment alerts
- `PAYMENT_ALERT_DISPATCH_KEY` - shared key expected by dispatch route

Recommended:
- `PAYMENT_ALERT_WEBHOOK_SIGNING_SECRET` - outbound payload signing secret
- `PAYMENT_ALERT_DISPATCH_DEDUPE_HOURS` - duplicate suppression window
- `PAYMENT_ALERT_WEBHOOK_TIMEOUT_MS` - dispatch timeout

Alert threshold tuning (optional, defaults already set in code):
- `PAYMENT_ALERT_MIN_CHECKOUT_CREATE_RATE_PCT`
- `PAYMENT_ALERT_MIN_PAID_FROM_CHECKOUT_RATE_PCT`
- `PAYMENT_ALERT_MAX_CALLBACK_PENDING_RATE_PCT`
- `PAYMENT_ALERT_MAX_WEBHOOK_TECH_ERROR_COUNT`
- `PAYMENT_ALERT_MAX_WEBHOOK_TECH_ERROR_RATE_PCT`
- `PAYMENT_ALERT_MIN_SAMPLE_SIZE`

## Scheduler Config (GitHub Actions)

Workflow:
- `.github/workflows/payment-alert-dispatch.yml`

Required repository secrets:
- `PAYMENT_ALERT_DISPATCH_BASE_URL` - deployment base URL (for example `https://sotsiaal.ai`)
- `PAYMENT_ALERT_DISPATCH_KEY` - same key as route expects

Rollout order:
1. Run manual workflow with `dry_run=true`.
2. Confirm `ok: true` response and event logs in admin analytics.
3. Verify sink signature validation.
4. Enable/keep scheduled live dispatch every 10 minutes.

## Owner Sign-off Block

Record final launch values and date:
- `SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION = ...`
- `SUBSCRIPTION_WEBHOOK_CANCELED_ACTION = ...`
- `SUBSCRIPTION_WEBHOOK_FAILED_ACTION = ...`
- `PAYMENT_ALERT_WEBHOOK_URL = ...`
- `PAYMENT_ALERT_WEBHOOK_SIGNING_SECRET = set|not_set`
- `PAYMENT_ALERT_DISPATCH_BASE_URL = ...`
- Sign-off date:
- Owner:
