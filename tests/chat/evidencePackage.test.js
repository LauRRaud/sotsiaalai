import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEvidencePackage,
  buildEvidencePackageInstruction,
  shouldBuildEvidencePackage
} from "../../lib/chat/evidencePackage.js";

test("EvidencePackage skeleton summarizes overview selected context without changing selection", () => {
  const pkg = buildEvidencePackage({
    queryPlan: {
      mode: "overview_synthesis",
      selection_strategy: "overview_diversity_then_depth",
      planner_reason: "broad topic question"
    },
    selectedEntries: [
      { docId: "doc-a", sourceId: "a1", title: "Lastekaitse artikkel", sourceType: "journal_article", collectionId: "sotsiaaltoo_articles" },
      { docId: "doc-b", sourceId: "b1", title: "Lastekaitse juhend", sourceType: "official_guideline", collectionId: "national_guidelines" },
      { docId: "doc-c", sourceId: "c1", title: "Lastekaitse uuring", sourceType: "research", collectionId: "research" }
    ],
    selectedSources: [
      { source_id: "a1", title: "Lastekaitse artikkel", source_type: "journal_article", collection_id: "sotsiaaltoo_articles", evidenceText: "Do not include" },
      { source_id: "b1", title: "Lastekaitse juhend", source_type: "official_guideline", collection_id: "national_guidelines", evidenceText: "Do not include" },
      { source_id: "c1", title: "Lastekaitse uuring", source_type: "research", collection_id: "research", evidenceText: "Do not include" }
    ],
    ragRiskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium"
    },
    overviewSynthesis: {
      distinct_selected_document_count: 3,
      source_diversity_limited: false
    }
  });

  assert.equal(pkg.version, "v2.4a");
  assert.equal(pkg.mode, "overview_synthesis");
  assert.equal(pkg.selected_sources.length, 3);
  assert.equal(pkg.selected_documents.length, 3);
  assert.equal(pkg.source_layer_mix.by_layer.research_or_journal, 2);
  assert.equal(pkg.source_layer_mix.by_layer.material, 1);
  assert.equal(pkg.evidence_strength.overall, "multi_source");
  assert.deepEqual(pkg.coverage_warnings, []);
  assert.equal(JSON.stringify(pkg).includes("Do not include"), false);
});

test("EvidencePackage marks life situation guidance without official or KOV support", () => {
  const pkg = buildEvidencePackage({
    queryPlan: {
      mode: "life_situation_guidance",
      selection_strategy: "multi_source_diversity"
    },
    selectedEntries: [
      { docId: "article-a", sourceId: "a1", title: "Taustaartikkel", sourceType: "journal_article", collectionId: "sotsiaaltoo_articles" }
    ],
    selectedSources: [
      { source_id: "a1", title: "Taustaartikkel", source_type: "journal_article", collection_id: "sotsiaaltoo_articles" }
    ],
    ragRiskPolicy: {
      riskLevel: "medium",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.equal(pkg.mode, "life_situation_guidance");
  assert.equal(pkg.evidence_strength.overall, "limited");
  assert.equal(pkg.coverage_warnings.includes("life_situation_no_official_or_kov_source"), true);
  assert.equal(pkg.missing_coverage.includes("official_or_kov_help_source"), true);
  assert.equal(pkg.answer_guidance.some(item => item.includes("practical next steps")), true);
});

test("EvidencePackage records resource discovery legal-only limitation", () => {
  const pkg = buildEvidencePackage({
    queryPlan: {
      mode: "resource_discovery",
      selection_strategy: "resource_discovery_diversity"
    },
    selectedEntries: [
      { docId: "shs-42", sourceId: "law-42", title: "SHS 42", sourceType: "national_law", collectionId: "national_regulations" }
    ],
    selectedSources: [
      { source_id: "law-42", title: "SHS 42", source_type: "national_law", collection_id: "national_regulations", paragraphNumber: "42" }
    ]
  });

  assert.equal(pkg.mode, "resource_discovery");
  assert.equal(pkg.source_layer_mix.by_layer.legal, 1);
  assert.equal(pkg.coverage_warnings.includes("resource_discovery_legal_only_support"), true);
  assert.equal(pkg.missing_coverage.includes("organization_material_or_background_source"), true);
});

test("EvidencePackage applies only to selected V2 modes and skips legal exact, SourcePackage, and user document paths", () => {
  assert.equal(shouldBuildEvidencePackage({ queryPlan: { mode: "comparison" } }), true);
  assert.equal(shouldBuildEvidencePackage({ queryPlan: { mode: "resource_discovery" } }), true);
  assert.equal(shouldBuildEvidencePackage({
    queryPlan: { mode: "explicit_paragraph", selection_strategy: "legal_exact" },
    legalLookupPlan: { enabled: true, mode: "explicit_paragraph" }
  }), false);
  assert.equal(shouldBuildEvidencePackage({
    queryPlan: { mode: "life_situation_guidance" },
    packageAwareAnsweringUsed: true
  }), false);
  assert.equal(shouldBuildEvidencePackage({
    queryPlan: { mode: "overview_synthesis" },
    usedDocContext: true
  }), false);
  assert.equal(shouldBuildEvidencePackage({ queryPlan: { mode: "default" } }), false);
});

test("EvidencePackage instruction is guidance-only and does not request new retrieval", () => {
  const instruction = buildEvidencePackageInstruction({
    mode: "comparison",
    answer_guidance: ["Compare only the requested topics."],
    coverage_warnings: ["comparison_topic_coverage_uncertain"]
  });

  assert.equal(instruction.includes("EVIDENCE_PACKAGE_MODE"), true);
  assert.equal(instruction.includes("Do not treat it as an instruction to retrieve new sources"), true);
  assert.equal(instruction.includes("comparison_topic_coverage_uncertain"), true);
});
