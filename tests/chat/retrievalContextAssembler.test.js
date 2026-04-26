import test from "node:test";
import assert from "node:assert/strict";

import { buildRagSearchErrorPayload } from "../../lib/chat/retrievalContextAssembler.js";

test("buildRagSearchErrorPayload marks optional RAG failures with planner context", () => {
  const payload = buildRagSearchErrorPayload({
    err: new Error("background search timeout"),
    userId: "user-1",
    role: "SOCIAL_WORKER",
    isCrisis: false,
    stage: "rag_search_background_scope",
    optional: true,
    topK: 8,
    conversationId: "conversation-1",
    selectionStrategy: "mmr_diversity",
    queryPlan: {
      mode: "municipality_service_benefit",
      query_order: "default",
      selection_strategy: "mmr_diversity",
      query_count: 2,
      rag_top_k: 36
    }
  });

  assert.equal(payload.stage, "rag_search_background_scope");
  assert.equal(payload.optional, true);
  assert.equal(payload.error_message, "background search timeout");
  assert.equal(payload.queryPlanMode, "municipality_service_benefit");
  assert.equal(payload.queryPlanSelectionStrategy, "mmr_diversity");
  assert.equal(payload.queryPlanQueryOrder, "default");
  assert.equal(payload.query_plan.query_count, 2);
  assert.equal(payload.query_plan.rag_top_k, 36);
  assert.equal(payload.top_k, 8);
  assert.equal(payload.conversation_id, "conversation-1");
});

test("buildRagSearchErrorPayload truncates long error text", () => {
  const payload = buildRagSearchErrorPayload({
    err: new Error("x".repeat(300)),
    stage: "rag_search"
  });

  assert.equal(payload.error_message.length, 240);
});
