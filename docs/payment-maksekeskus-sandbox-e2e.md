# Maksekeskus Sandbox E2E Check

Date: 2026-02-15

## Goal

Run a repeatable technical validation for the implemented payment flow:
- callback state mapping
- webhook signature handling
- webhook idempotency
- subscription activation/cancel transitions

This is a platform-side E2E check. It does not replace Maksekeskus-side compliance review.

## Prerequisites

1. App API is running and reachable, default `http://localhost:3000`.
2. Database is reachable from this workspace (`DATABASE_URL` configured).
3. If your webhook route enforces signature, set `MAKSEKESKUS_WEBHOOK_SECRET`.

## Script

Command:

```bash
npm run payments:maksekeskus:e2e
```

Script path:
- `scripts/maksekeskus-sandbox-e2e.mjs`

What it does:
1. Ensures a dedicated test user exists (`MAKSEKESKUS_E2E_USER_EMAIL`).
2. Creates a fresh `Subscription(status=NONE)` + `Payment(status=INITIATED, provider=MAKSEKESKUS)`.
3. Calls `GET /api/subscription/callback` and verifies `302` redirect + mapped `payment=` state.
4. Sends signed `PAID` webhook and verifies:
   - payment becomes `PAID`
   - subscription becomes `ACTIVE`
5. Sends duplicate `PAID` webhook and verifies idempotent response.
6. Sends `REFUNDED` webhook and verifies:
   - payment becomes `REFUNDED`
   - subscription behavior follows configured expected action (`cancel|none`)
7. Cleans up created test data (default enabled).

## Environment Variables

- `MAKSEKESKUS_E2E_BASE_URL` (default `http://localhost:3000`)
- `MAKSEKESKUS_WEBHOOK_SECRET` (optional; script signs webhook if set)
- `MAKSEKESKUS_E2E_USER_EMAIL` (default `maksekeskus-sandbox@example.test`)
- `MAKSEKESKUS_E2E_AMOUNT` (default `7.99`)
- `MAKSEKESKUS_E2E_CURRENCY` (default `EUR`)
- `MAKSEKESKUS_E2E_CLEANUP` (default `1`; set `0` to keep artifacts for inspection)
- `MAKSEKESKUS_E2E_EXPECT_REFUNDED_ACTION` (default follows `SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION`, fallback `cancel`)

## Interpreting Results

- `PASS` line for each stage means platform logic is working for simulated provider payloads.
- Any `FAIL` line means launch is blocked until fixed and re-run.

## Remaining Manual Sandbox Checks

1. Verify exact Maksekeskus field names/status semantics against real sandbox callbacks/webhooks.
2. Verify provider retry behavior and confirm our webhook return codes fit their retry contract.
3. Verify live redirect URLs, return/cancel pages, and customer-visible payment flow text.
