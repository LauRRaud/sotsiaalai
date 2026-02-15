# Payment Production Environment Checklist

Date: 2026-02-15

## Goal

One owner-facing checklist for Maksekeskus launch configuration, webhook policy decisions, and payment alert dispatch scheduling.

## Maksekeskus Provider Config

Required:
- `MAKSEKESKUS_API_BASE` - provider API base URL
- `MAKSEKESKUS_API_KEY` - provider API key
- `MAKSEKESKUS_SHOP_ID` - provider shop/merchant identifier
- `MAKSEKESKUS_RETURN_URL` - user return URL after checkout success
- `MAKSEKESKUS_CANCEL_URL` - user return URL after cancel/failure
- `MAKSEKESKUS_WEBHOOK_URL` - provider webhook target URL (`/api/subscription/webhook`)

Recommended:
- `MAKSEKESKUS_WEBHOOK_SECRET` - signature secret used by webhook verification
- `MAKSEKESKUS_TIMEOUT_MS` - provider request timeout override (default is code-level fallback)
- `MAKSEKESKUS_CHECKOUT_URL_TEMPLATE` - only if your provider contract requires templated checkout URL
- `SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED=1` - temporary override for non-production testing only (production should keep this unset)
- `PAYMENT_OWNER_EMAIL` - owner notification recipient for webhook status emails (default: `info@sotsiaal.ai`)
- `PAYMENT_OWNER_EMAIL_LOCALE` - locale for owner webhook email template (`en|et|ru`, default `en`)

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
