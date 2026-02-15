# Payment Alert Dispatch Runbook

Date: 2026-02-15

## Goal

Deliver critical billing alerts from internal analytics to an external webhook sink.

Endpoint:
- `POST /api/admin/analytics/payment-alerts/dispatch`

## Required Environment

- `PAYMENT_ALERT_WEBHOOK_URL` - destination webhook URL
- `PAYMENT_ALERT_DISPATCH_KEY` - shared secret for scheduler calls

Recommended:
- `PAYMENT_ALERT_WEBHOOK_SIGNING_SECRET` - HMAC signing secret for outbound payload verification
- `PAYMENT_ALERT_DISPATCH_DEDUPE_HOURS` - dedupe window (default `6`)
- `PAYMENT_ALERT_WEBHOOK_TIMEOUT_MS` - outbound timeout (default `10000`)

## Local Dry Run

```bash
npm run payments:alerts:dispatch
```

Default script behavior:
- dry-run enabled
- no external dispatch performed

Script env overrides:
- `PAYMENT_ALERT_DISPATCH_BASE_URL` (default `http://localhost:3000`)
- `PAYMENT_ALERT_DISPATCH_KEY`
- `PAYMENT_ALERT_DISPATCH_DRY_RUN` (`1` or `0`)
- `PAYMENT_ALERT_DISPATCH_BYPASS_DEDUPE` (`1` or `0`)
- `PAYMENT_ALERT_DISPATCH_LOCALE` (`en|et|ru`)

## Scheduler Call

Run every 5-10 minutes:

```bash
curl -X POST "https://<your-domain>/api/admin/analytics/payment-alerts/dispatch" \
  -H "x-payment-alert-dispatch-key: <PAYMENT_ALERT_DISPATCH_KEY>"
```

Dry-run scheduler check:

```bash
curl -X POST "https://<your-domain>/api/admin/analytics/payment-alerts/dispatch?dryRun=1" \
  -H "x-payment-alert-dispatch-key: <PAYMENT_ALERT_DISPATCH_KEY>"
```

## GitHub Actions Scheduler (implemented)

Workflow file:
- `.github/workflows/payment-alert-dispatch.yml`

Behavior:
- `schedule`: every 10 minutes, runs live dispatch (`dryRun=0`)
- `workflow_dispatch`: manual run with inputs for `dry_run`, `bypass_dedupe`, and `locale`

Required repository secrets:
- `PAYMENT_ALERT_DISPATCH_BASE_URL` - app base URL, for example `https://sotsiaal.ai`
- `PAYMENT_ALERT_DISPATCH_KEY` - same shared key expected by dispatch route header

Notes:
- Workflow calls `node scripts/payment-alert-dispatch.mjs`
- Script target path is always `/api/admin/analytics/payment-alerts/dispatch` under `PAYMENT_ALERT_DISPATCH_BASE_URL`
- Keep manual runs in `dry_run=true` until sink signature validation has been confirmed

## Webhook Signature Verification

When `PAYMENT_ALERT_WEBHOOK_SIGNING_SECRET` is set, outbound request includes:
- `x-sotsiaalai-signature: sha256=<hex_hmac>`
- `x-sotsiaalai-timestamp: <unix_seconds>`
- `x-sotsiaalai-event: payment_alerts`

Signature base string:
- `${timestamp}.${rawBody}`

## Delivery Events (ChatLog)

- `payment_alert_dispatch_dry_run`
- `payment_alert_dispatched`
- `payment_alert_dispatch_failed`

## Acceptance Checklist

1. Dry-run returns `ok: true`.
2. Live dispatch returns `dispatched: true` when critical alerts exist.
3. Webhook sink receives payload and validates signature.
4. Duplicate alert code is suppressed inside dedupe window.
5. Scheduler run history is visible in GitHub Actions (`Payment Alert Dispatch` workflow).
