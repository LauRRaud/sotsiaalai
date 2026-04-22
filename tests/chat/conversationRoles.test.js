import test from "node:test";
import assert from "node:assert/strict";

import { resolveConversationListRoleFilter } from "../../lib/chat/conversationRoles.js";

test("admin conversation list can opt into all roles explicitly", () => {
  assert.equal(
    resolveConversationListRoleFilter("ALL", "SOCIAL_WORKER", true),
    null
  );
});

test("admin conversation list defaults to all roles when no role filter is requested", () => {
  assert.equal(
    resolveConversationListRoleFilter(null, "CLIENT", true),
    null
  );
});

test("non-admin conversation list still defaults to the effective role", () => {
  assert.equal(
    resolveConversationListRoleFilter(null, "CLIENT", false),
    "CLIENT"
  );
  assert.equal(
    resolveConversationListRoleFilter(null, "SOCIAL_WORKER", false),
    "SOCIAL_WORKER"
  );
});

test("explicit role filters still normalize to supported role values", () => {
  assert.equal(
    resolveConversationListRoleFilter("admin", "CLIENT", false),
    "SOCIAL_WORKER"
  );
  assert.equal(
    resolveConversationListRoleFilter("client", "SOCIAL_WORKER", true),
    "CLIENT"
  );
});
