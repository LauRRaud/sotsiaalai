import test from "node:test";
import assert from "node:assert/strict";

import { summarizeRagTraceSourceQuality } from "../../lib/rag/sourceQualityMetrics.js";

test("summarizes displayed source contract precision from rag traces", () => {
  const result = summarizeRagTraceSourceQuality([
    {
      data: {
        retrieved_source_ids: ["source-a", "source-b", "source-c"],
        selected_context_source_ids: ["source-a", "source-b"],
        answer_source_ids: ["source-a"],
        displayed_source_ids: ["source-a"],
        filtered_out_source_ids: ["source-b", "source-c"],
        source_display_mode: "displayed_sources_enforced",
        attribution_decisions: [
          { source_id: "source-a", decision: "display", reason: "model_declared_and_context_validated" },
          { source_id: "source-b", decision: "hide", reason: "not_used_in_answer" }
        ]
      }
    },
    {
      data: {
        retrieved_source_ids: ["source-d", "source-e"],
        selected_context_source_ids: ["source-d"],
        answer_source_ids: ["source-d"],
        displayed_source_ids: ["source-e"],
        source_display_mode: "displayed_sources_enforced",
        attribution_decisions: [
          { source_id: "source-e", decision: "display", reason: "legacy_fallback" }
        ]
      }
    }
  ]);

  assert.equal(result.ok, false);
  assert.equal(result.summary.traces, 2);
  assert.equal(result.summary.retrieved_source_count, 5);
  assert.equal(result.summary.selected_context_source_count, 3);
  assert.equal(result.summary.answer_source_count, 2);
  assert.equal(result.summary.displayed_source_count, 2);
  assert.equal(result.summary.displayed_source_valid_count, 1);
  assert.equal(result.summary.displayed_source_violation_count, 1);
  assert.equal(result.summary.displayed_source_precision, 0.5);
  assert.equal(result.summary.traces_with_display_contract_violation, 1);
  assert.equal(result.summary.display_contract_violation_rate, 0.5);
  assert.equal(result.summary.retrieved_but_not_displayed_count, 3);
  assert.equal(result.summary.retrieved_filter_rate, 3 / 5);
  assert.equal(result.summary.selected_but_not_displayed_count, 2);
  assert.equal(result.summary.selected_filter_rate, 2 / 3);
  assert.equal(result.summary.filtered_out_source_count, 2);
  assert.equal(result.summary.source_display_mode_distribution.displayed_sources_enforced, 2);
  assert.equal(result.summary.attribution_decision_distribution.display, 2);
  assert.equal(result.summary.attribution_decision_distribution.hide, 1);
  assert.equal(result.summary.attribution_decision_reason_distribution.not_used_in_answer, 1);
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].type, "displayed_source_not_in_answer_sources");
  assert.deepEqual(result.issues[0].offending_source_ids, ["source-e"]);
});

test("uses count fallbacks when trace source id arrays are missing", () => {
  const result = summarizeRagTraceSourceQuality([
    {
      data: {
        retrieved_count: 5,
        selected_context_count: 3,
        answer_source_ids: [],
        displayed_source_ids: []
      }
    }
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.summary.retrieved_source_count, 5);
  assert.equal(result.summary.selected_context_source_count, 3);
  assert.equal(result.summary.retrieved_but_not_displayed_count, 5);
  assert.equal(result.summary.selected_but_not_displayed_count, 3);
  assert.equal(result.summary.displayed_source_precision, 1);
  assert.equal(result.summary.displayed_source_precision_basis, 0);
  assert.equal(result.summary.source_display_mode_distribution.unknown, 1);
});
