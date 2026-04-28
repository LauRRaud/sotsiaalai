import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAttributionMetadata,
  buildRagTraceFromAttribution,
  RAG_CONTRACT_VERSION
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
    selectedContextDetails: [
      {
        source_id: "tartu-koduteenus",
        source_type: "kov_service_info",
        municipality_id: "tartu_linn",
        municipality_name: "Tartu linn",
        source_status: "active",
        retrieval_channels: ["dense", "title_match"],
        hybrid_score: 0.82,
        dense_score: 0.41,
        lexical_score: 6.2,
        lexical_score_normalized: 0.43662,
        bm25_score: 2.4,
        bm25_coverage: 0.75,
        bm25_matches: 3,
        bm25_query_tokens: 4,
        rrf_score: 0.04,
        channel_boost: 0.09,
        hybrid_rank: 1,
        dense_rank: 3,
        lexical_rank: 1,
        rank_score: 1.24,
        topic_boost: 0.18,
        quality_adjust: 0.42,
        evidence_text: "Sensitive context text must not be copied to trace.",
        model_context: "Full model context must not be copied to trace."
      }
    ],
    userMessage: "Client private story must not be copied to trace.",
    modelContext: "Full RAG context must not be copied to trace.",
    prompt: "Full prompt must not be copied to trace.",
    ragRiskPolicy: {
      riskLevel: "medium",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    },
    queryPlan: {
      planner_version: "v2",
      mode: "broad_multi_source",
      query_order: "broad_first",
      selection_strategy: "multi_source_diversity",
      query_count: 2,
      filter_keys: ["audience", "doc_id"]
    },
    hybridRetrieval: {
      merge_strategy: {
        strategy: "weighted_hybrid_rrf",
        rrf_k: 60,
        requested_retrievers: ["dense", "title_match", "exact_phrase", "bm25"]
      },
      channel_counts: {
        dense: 2,
        title_match: 1,
        bm25: 1
      },
      bm25: {
        result_count: 1,
        average_coverage: 0.75
      },
      scored_count: 2,
      top_hybrid_score: 0.82,
      top_rrf_score: 0.04
    }
  });

  assert.equal(trace.retrieved_count, 7);
  assert.equal(trace.selected_context_count, 2);
  assert.deepEqual(trace.retrievers_used, ["dense"]);
  assert.deepEqual(trace.retrieved_source_ids, ["retrieved-a", "retrieved-b", "retrieved-c"]);
  assert.deepEqual(trace.selected_context_source_ids, ["tartu-koduteenus", "general-article"]);
  assert.deepEqual(trace.selected_context_details, [
    {
      source_id: "tartu-koduteenus",
      source_type: "kov_service_info",
      municipality_id: "tartu_linn",
      municipality_name: "Tartu linn",
      source_status: "active",
      retrieval_channels: ["dense", "title_match"],
      hybrid_score: 0.82,
      dense_score: 0.41,
      lexical_score: 6.2,
      lexical_score_normalized: 0.43662,
      bm25_score: 2.4,
      bm25_coverage: 0.75,
      bm25_matches: 3,
      bm25_query_tokens: 4,
      rrf_score: 0.04,
      channel_boost: 0.09,
      hybrid_rank: 1,
      dense_rank: 3,
      lexical_rank: 1,
      rank_score: 1.24,
      topic_boost: 0.18,
      quality_adjust: 0.42
    }
  ]);
  assert.deepEqual(trace.answer_source_ids, ["tartu-koduteenus"]);
  assert.deepEqual(trace.displayed_source_ids, ["tartu-koduteenus"]);
  assert.deepEqual(trace.filtered_out_source_ids, ["general-article"]);
  assert.equal(trace.filter_reasons["general-article"], "query_anchor_mismatch");
  assert.equal(trace.rag_risk_level, "medium");
  assert.equal(trace.rag_required_evidence, "strong");
  assert.equal(trace.rag_insufficient_evidence_mode, true);
  assert.equal(JSON.stringify(trace).includes("Sensitive context text"), false);
  assert.equal(JSON.stringify(trace).includes("Client private story"), false);
  assert.equal(JSON.stringify(trace).includes("Full RAG context"), false);
  assert.equal(JSON.stringify(trace).includes("Full prompt"), false);
  assert.deepEqual(trace.query_plan, {
    planner_version: "v2",
    mode: "broad_multi_source",
    query_order: "broad_first",
    selection_strategy: "multi_source_diversity",
    query_count: 2,
    filter_keys: ["audience", "doc_id"]
  });
  assert.equal(trace.hybrid_retrieval.merge_strategy.strategy, "weighted_hybrid_rrf");
  assert.equal(trace.hybrid_retrieval.channel_counts.title_match, 1);
  assert.equal(trace.hybrid_retrieval.bm25.average_coverage, 0.75);
  assert.equal(trace.hybrid_retrieval.top_hybrid_score, 0.82);
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
  assert.equal(metadata.rag_contract_version, RAG_CONTRACT_VERSION);
  assert.equal(metadata.source_display_mode, "displayed_sources_enforced");
  assert.deepEqual(metadata.displayed_source_ids, ["tartu-koduteenus"]);
  assert.equal(metadata.displayed_sources.length, 1);
  assert.equal(metadata.displayed_sources[0].source_id, "tartu-koduteenus");
  assert.equal(Array.isArray(metadata.attribution_decisions), true);
  assert.equal(metadata.rag_trace.retrieved_count, 3);
  assert.equal(metadata.rag_trace.selected_context_count, 2);
  assert.deepEqual(metadata.rag_trace.retrievers_used, ["dense"]);
  assert.equal(metadata.rag_trace.rag_risk_level, "medium");
});

test("RAG trace merges legalLookupPlan into query_plan when retrievalMeta carries it separately", () => {
  const attribution = buildSourceAttribution("SHS § 140 käsitleb toimetulekutoetuse maksmist.", [
    {
      source_id: "rt-140",
      title: "SHS § 140",
      source_type: "national_law",
      paragraphNumber: "140",
      evidenceText: "Toimetulekutoetuse maksmine."
    }
  ], {
    query: "SHS § 140"
  });

  const trace = buildRagTraceFromAttribution([], attribution, {
    queryPlan: {
      planner_version: "v2",
      mode: "explicit_paragraph",
      selection_strategy: "legal_exact"
    },
    legalLookupPlan: {
      enabled: true,
      mode: "explicit_paragraph",
      jurisdictionLevel: "NATIONAL",
      sourceTypes: ["national_law"],
      collectionId: "national_regulations",
      actTitle: "Sotsiaalhoolekande seadus",
      actAliases: ["shs"],
      municipalityId: null,
      paragraphRefs: ["140"],
      topicTerms: [],
      requireCurrent: true
    }
  });

  assert.equal(trace.query_plan.legalLookupPlan.enabled, true);
  assert.equal(trace.query_plan.legalLookupPlan.mode, "explicit_paragraph");
  assert.deepEqual(trace.query_plan.legalLookupPlan.paragraphRefs, ["140"]);
  assert.equal(trace.query_plan.legalLookupPlan.actTitle, "Sotsiaalhoolekande seadus");
});

test("RAG trace exposes sanitized runtime source packages", () => {
  const attribution = buildSourceAttribution("Jogeva valla koduteenuse info on kinnitatud teenuse, vormi ja kontakti allikatega.", [
    {
      source_id: "service-info",
      title: "Koduteenus",
      source_type: "kov_service_info",
      evidenceText: "Koduteenuse kirjeldus."
    }
  ], {
    query: "Jogeva vald koduteenus"
  });

  const trace = buildRagTraceFromAttribution([], attribution, {
    sourcePackages: [
      {
        package_id: "jogeva_vald_service_koduteenus_package",
        canonical_item_id: "jogeva_vald_service_koduteenus",
        package_type: "kov_service",
        title: "Koduteenus",
        municipality_id: "jogeva_vald",
        municipality_name: "Jogeva vald",
        section_counts: {
          description: 1,
          forms: 1,
          contacts: 0,
          legal_basis: 0
        },
        sections: {
          description: [
            {
              source_id: "service-info",
              title: "Koduteenus",
              source_type: "kov_service_info",
              evidenceText: "Sensitive package source text must not be copied."
            }
          ],
          forms: [
            {
              source_id: "service-form",
              title: "Koduteenuse taotlus",
              source_type: "application_form"
            }
          ],
          contacts: [],
          legal_basis: []
        },
        source_ids: ["service-info", "service-form"],
        last_checked: "2026-04-28",
        confidence: "medium",
        missing_sections: ["contacts", "legal_basis"]
      }
    ]
  });

  assert.equal(trace.source_packages.length, 1);
  assert.equal(trace.source_packages[0].package_type, "kov_service");
  assert.equal(trace.source_packages[0].municipality_id, "jogeva_vald");
  assert.deepEqual(trace.source_packages[0].source_ids, ["service-info", "service-form"]);
  assert.equal(trace.source_packages[0].section_counts.description, 1);
  assert.equal(trace.source_packages[0].section_counts.forms, 1);
  assert.deepEqual(trace.source_packages[0].sections.forms.map(source => source.source_id), ["service-form"]);
  assert.equal(JSON.stringify(trace.source_packages).includes("Sensitive package source text"), false);
});

test("RAG trace and metadata expose insufficient precise legal source support flag", () => {
  const attribution = buildSourceAttribution("Praeguse otsinguga ei leitud piisavalt täpset õiguslikku kinnitust.", [], {
    query: "SHS § 999"
  });

  const trace = buildRagTraceFromAttribution([], attribution, {
    queryPlan: {
      planner_version: "v2",
      mode: "explicit_paragraph",
      selection_strategy: "legal_exact"
    },
    legalLookupPlan: {
      enabled: true,
      mode: "explicit_paragraph",
      jurisdictionLevel: "NATIONAL",
      sourceTypes: ["national_law"],
      collectionId: "national_regulations",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphRefs: ["999"],
      topicTerms: [],
      requireCurrent: true
    },
    insufficientPreciseLegalSourceSupport: true
  });

  const metadata = buildAttributionMetadata({}, [], attribution, {
    insufficientPreciseLegalSourceSupport: true
  });

  assert.equal(trace.insufficient_precise_legal_source_support, true);
  assert.equal(trace.insufficientPreciseLegalSourceSupport, true);
  assert.equal(metadata.insufficient_precise_legal_source_support, true);
  assert.equal(metadata.insufficientPreciseLegalSourceSupport, true);
});
