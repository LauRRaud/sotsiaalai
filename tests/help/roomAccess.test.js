import test from "node:test";
import assert from "node:assert/strict";

import { hasRoomBillingAccess } from "../../lib/rooms/access.js";

test("active subscriber has room access through self billing", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: { billingSource: "SELF" },
    hasActiveSubscription: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.billingSource, "SELF");
});

test("sponsored room member without active subscription is denied", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: { billingSource: "SPONSORED_BY_HOST" },
    hasActiveSubscription: false
  });

  assert.equal(result.ok, false);
  assert.equal(result.billingSource, "SPONSORED_BY_HOST");
});

test("sponsored room member with active subscription is allowed", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: { billingSource: "SPONSORED_BY_HOST" },
    hasActiveSubscription: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.billingSource, "SELF");
});

test("non-sponsored inactive member is denied", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: { billingSource: "SELF" },
    hasActiveSubscription: false
  });

  assert.equal(result.ok, false);
});
