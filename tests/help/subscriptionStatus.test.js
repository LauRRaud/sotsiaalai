import test from "node:test";
import assert from "node:assert/strict";

import { isSubscriptionActive } from "../../lib/subscriptionStatus.js";

test("active subscription without expiry is active", () => {
  assert.equal(
    isSubscriptionActive({
      status: "ACTIVE",
      validUntil: null
    }),
    true
  );
});

test("active subscription with future expiry is active", () => {
  assert.equal(
    isSubscriptionActive({
      status: "ACTIVE",
      validUntil: "2099-01-01T00:00:00.000Z"
    }),
    true
  );
});

test("active subscription with past expiry is inactive", () => {
  assert.equal(
    isSubscriptionActive({
      status: "ACTIVE",
      validUntil: "2020-01-01T00:00:00.000Z"
    }),
    false
  );
});

test("non-active status is inactive", () => {
  assert.equal(
    isSubscriptionActive({
      status: "CANCELED",
      validUntil: null
    }),
    false
  );
});
