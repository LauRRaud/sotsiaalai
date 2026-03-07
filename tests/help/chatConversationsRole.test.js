import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveConversationListRoleFilter,
  resolveConversationWriteRole
} from "../../lib/chat/conversationRoles.js";

test("conversation list defaults to effective role when no explicit role filter is provided", () => {
  assert.equal(resolveConversationListRoleFilter(null, "CLIENT"), "CLIENT");
  assert.equal(resolveConversationListRoleFilter("", "SOCIAL_WORKER"), "SOCIAL_WORKER");
});

test("conversation list respects explicit role filter over effective role", () => {
  assert.equal(resolveConversationListRoleFilter("client", "SOCIAL_WORKER"), "CLIENT");
  assert.equal(resolveConversationListRoleFilter("social_worker", "CLIENT"), "SOCIAL_WORKER");
});

test("admin conversation creation defaults to effective preview role when request omits role", () => {
  assert.equal(
    resolveConversationWriteRole({
      requestedRole: null,
      effectiveRole: "CLIENT",
      isAdmin: true,
      sessionRole: "ADMIN"
    }),
    "CLIENT"
  );

  assert.equal(
    resolveConversationWriteRole({
      requestedRole: null,
      effectiveRole: "SOCIAL_WORKER",
      isAdmin: true,
      sessionRole: "ADMIN"
    }),
    "SOCIAL_WORKER"
  );
});

test("non-admin conversation creation stays on the authenticated session role", () => {
  assert.equal(
    resolveConversationWriteRole({
      requestedRole: "CLIENT",
      effectiveRole: "CLIENT",
      isAdmin: false,
      sessionRole: "SOCIAL_WORKER"
    }),
    "SOCIAL_WORKER"
  );
});
