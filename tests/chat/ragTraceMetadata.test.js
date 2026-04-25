import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAttributionMetadata,
  buildRagTraceFromAttribution
} from "../../lib/chat/mainResponseHandler.js";
import { buildSourceAttribution } from "../../lib/chat/sourceAttribution.js";

const sources = [
  {
    source_id: "tartu-koduteenus",
    title: "Tartu linn koduteenus",
    source_type: "kov_service_info",
    evidenceText: "Koduteenust saab taotleda Tartu linnas sotsiaal- ja tervishoiuosakonna kaudu."
  },
  {
    source_id: "general-article",
    title: "Koduteenuse metoodiline ülevaade",
    source_type: "journal_article",
    evidenceText: "Artikkel kirjeldab koduteenuse üldist tähendust."
  }
];

test("RAG trace preserves retrieved, selected, answer and displayed source layers", () => {
  const attribution = buildSourceAttribution("Tartu linn koduteenus on taotletav sotsiaal- ja tervishoiuosakonna kaudu.", sources, {
    query: "Tartu linn koduteenus"
  });
  const trace = buildRagTraceFromAttribution(sources, attribution, {
    rawMatchesCount: 7,
    selectedContextCount: 2,
    retrieversUsed: ["dense"],
    retrievedSourceIds: ["retrieved-a", "retrieved-b", "retrieved-c"],
    selectedContextSourceIds: ["tartu-koduteenus", "general-article"],
    ragRiskPolicy: {
      riskLevel: "medium",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.equal(trace.retrieved_count, 7);
  assert.equal(trace.selected_context_count, 2);
  assert.deepEqual(trace.retrievers_used, ["dense"]);
  assert.deepEqual(trace.retrieved_source_ids, ["retrieved-a", "retrieved-b", "retrieved-c"]);
  assert.deepEqual(trace.selected_context_source_ids, ["tartu-koduteenus", "general-article"]);
  assert.deepEqual(trace.answer_source_ids, ["tartu-koduteenus"]);
  assert.deepEqual(trace.displayed_source_ids, ["tartu-koduteenus"]);
  assert.deepEqual(trace.filtered_out_source_ids, ["general-article"]);
  assert.equal(trace.filter_reasons["general-article"], "query_anchor_mismatch");
  assert.equal(trace.rag_risk_level, "medium");
  assert.equal(trace.rag_required_evidence, "strong");
  assert.equal(trace.rag_insufficient_evidence_mode, true);
  assert.equal(trace.retrieval_trace_level, "retrieved_candidates");
});

test("attribution metadata stores displayed sources and keeps legacy metadata", () => {
  const attribution = buildSourceAttribution("Tartu linn koduteenus on taotletav sotsiaal- ja tervishoiuosakonna kaudu.", sources, {
    query: "Tartu linn koduteenus"
  });
  const metadata = buildAttributionMetadata({ workflow: "chat" }, sources, attribution, {
    rawMatchesCount: 3,
    selectedContextCount: 2,
    retrieversUsed: ["dense"],
    ragRiskPolicy: {
      riskLevel: "medium",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.equal(metadata.workflow, "chat");
  assert.deepEqual(metadata.displayed_source_ids, ["tartu-koduteenus"]);
  assert.equal(metadata.displayed_sources.length, 1);
  assert.equal(metadata.displayed_sources[0].source_id, "tartu-koduteenus");
  assert.equal(Array.isArray(metadata.attribution_decisions), true);
  assert.equal(metadata.rag_trace.retrieved_count, 3);
  assert.equal(metadata.rag_trace.selected_context_count, 2);
  assert.deepEqual(metadata.rag_trace.retrievers_used, ["dense"]);
  assert.equal(metadata.rag_trace.rag_risk_level, "medium");
});
