# Maksekeskus Recurring Foundation

Date: 2026-03-20

## What was added

- `BillingMethod` model for recurring payment tokens / mandates
- `Payment.kind` to distinguish:
  - `SUBSCRIPTION_INITIAL`
  - `SUBSCRIPTION_RENEWAL`
  - `INVITE_SPONSORED`
- `Subscription.billingMode`, `billingInterval`, `billingMethodId`
- recurring-aware webhook foundation
- renewal job endpoint and GitHub Actions workflow skeleton

## Current behavior

- Sponsored invite checkout remains one-off.
- Subscription checkout is now marked recurring-ready in data model.
- If Maksekeskus webhook returns a recurring token for the initial subscription payment, it is stored into `BillingMethod` and linked to the subscription.
- Renewal charges are initiated by `POST /api/jobs/subscription-renewals`.

## Important limitation

Recurring renewal provider payload is still based on expected Maksekeskus field names and must be confirmed in sandbox before production rollout.

Fields currently probed from webhook payload:

- recurring token:
  - `recurringToken`
  - `recurring_token`
  - `card_token`
  - `token`
  - `payment_token`
- mandate id:
  - `mandateId`
  - `mandate_id`
  - `agreementId`
  - `agreement_id`
  - `recurringId`
  - `recurring_id`

## New env vars

- `SUBSCRIPTION_RECURRING_ENABLED=1`
- `SUBSCRIPTION_RENEWAL_JOB_KEY=...`
- `SUBSCRIPTION_RENEWAL_BATCH_SIZE=25`
- `SUBSCRIPTION_RENEWAL_MAX_RETRY_COUNT=3`
- `SUBSCRIPTION_RENEWAL_RETRY_DAYS=1,3,5`
- `MAKSEKESKUS_RECURRING_API_BASE=...`

## Scheduler secrets

- `SUBSCRIPTION_RENEWAL_BASE_URL`
- `SUBSCRIPTION_RENEWAL_JOB_KEY`

## Manual validation

Dry run:

```bash
npm run payments:renewals
```

Live route example:

```bash
curl -X POST "https://your-domain/api/jobs/subscription-renewals?dryRun=1" ^
  -H "x-subscription-renewal-key: YOUR_KEY"
```

## Next implementation step

Confirm Maksekeskus recurring API contract in sandbox and then update:

- `lib/payments/maksekeskus.js`
- `lib/payments/recurring.js`
- `app/api/subscription/webhook/route.js`

with exact provider request/response fields.
