import test from "node:test";
import assert from "node:assert/strict";

const { shouldAllowChatWithoutSubscription } = await import("../../lib/chat/subscriptionGate.js");

test("help request chat mode is allowed without subscription", () => {
  assert.equal(shouldAllowChatWithoutSubscription({
    roomId: null,
    requestedChatMode: "help_request"
  }), true);
});

test("detected help offer intent is allowed without subscription", () => {
  assert.equal(shouldAllowChatWithoutSubscription({
    roomId: null,
    requestedChatMode: null,
    detectedHelpIntent: "create_help_offer"
  }), true);
});

test("active help workflow can continue without subscription", () => {
  assert.equal(shouldAllowChatWithoutSubscription({
    roomId: null,
    helpWorkflowActive: true,
    helpWorkflowState: {
      intent: "create_help_request"
    }
  }), true);
});

test("service guidance does not bypass subscription", () => {
  assert.equal(shouldAllowChatWithoutSubscription({
    roomId: null,
    detectedHelpIntent: "service_guidance"
  }), false);
});

test("room chat does not bypass subscription", () => {
  assert.equal(shouldAllowChatWithoutSubscription({
    roomId: "room-1",
    requestedChatMode: "help_offer",
    detectedHelpIntent: "create_help_offer"
  }), false);
});
