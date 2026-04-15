import test from "node:test";
import assert from "node:assert/strict";

const { hasRoomBillingAccess } = await import("../../lib/rooms/access.js");

test("help-match room is accessible without an active subscription", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: {
      roomId: "room-1",
      userId: "user-1",
      role: "OWNER",
      billingSource: "SELF"
    },
    hasActiveSubscription: false,
    room: {
      id: "room-1",
      helpMatch: {
        id: "match-1"
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.billingSource, "HELP_MATCH_FREE");
});

test("regular room still requires an active subscription for non-admin users", () => {
  const result = hasRoomBillingAccess({
    userRole: "CLIENT",
    membership: {
      roomId: "room-1",
      userId: "user-1",
      role: "OWNER",
      billingSource: "SELF"
    },
    hasActiveSubscription: false,
    room: {
      id: "room-1",
      helpMatch: null
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.billingSource, "SELF");
});
