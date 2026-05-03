const EVIDENCE_PACKAGE_MODES = new Set([
  "overview_synthesis",
  "comparison",
  "resource_discovery",
  "life_situation_guidance",
  "thematic_synthesis",
  "broad_multi_source"
]);

const LEGAL_SOURCE_TYPES = new Set([
  "national_law",
  "law",
  "kov_regulation",
  "regulation",
  "riigiteataja_regulation"
]);

const KOV_COLLECTION_HINTS = new Set([
  "kov_services",
  "kov_benefits",
  "kov_rt",
  "kov_web"
]);

const ORGANIZATION_HINTS = new Set([
  "organizations",
  "organization_materials",
  "organization_profile",
  "organization_page"
]);

const MATERIAL_HINTS = new Set([
  "organization_materials",
  "national_guidelines",
  "training_materials",
  "official_guideline",
  "information_material",
  "method_guidance",
  "worksheet",
  "training_material"
]);

const RESEARCH_HINTS = new Set([
  "research",
  "analysis",
  "journal_article",
  "sotsiaaltoo_articles"
]);

function compactObject(value = {}) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => {
    if (typeof item === "undefined" || item === null) return false;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === "object") return Object.keys(item).length > 0;
    return true;
  }));
}

function firstString(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeToken(value = "") {
  return String(value || "").trim().toLowerCase();
}

function stableSourceId(source = {}, index = 0) {
  return firstString(
    source.source_id,
    source.sourceId,
    source.id,
    source.key,
    source.url,
    source.url_canonical,
    source.title,
    `source_${index}`
  );
}

function sourceTypeOf(source = {}) {
  return firstString(source.source_type, source.sourceType);
}

function collectionOf(source = {}) {
  return firstString(source.collection_id, source.collectionId);
}

function resourceTypeOf(source = {}) {
  return firstString(source.resource_type, source.resourceType);
}

function canonicalItemIdOf(source = {}) {
  return firstString(source.canonical_item_id, source.canonicalItemId);
}

function documentKeyForEntry(entry = {}, index = 0) {
  return firstString(
    entry.docId,
    entry.doc_id,
    entry.articleId,
    entry.article_id,
    entry.sourceId,
    entry.source_id,
    entry.canonicalItemId,
    entry.canonical_item_id,
    entry.urlCanonical,
    entry.url_canonical,
    entry.url,
    entry.title,
    `selected_document_${index}`
  );
}

function increment(map, key) {
  const value = firstString(key, "unknown");
  map[value] = (map[value] || 0) + 1;
}

function sourceLayerFor(source = {}) {
  const sourceType = normalizeToken(sourceTypeOf(source));
  const collection = normalizeToken(collectionOf(source));
  const resourceType = normalizeToken(resourceTypeOf(source));
  const itemType = normalizeToken(firstString(source.item_type, source.itemType));

  if (LEGAL_SOURCE_TYPES.has(sourceType)) return "legal";
  if (KOV_COLLECTION_HINTS.has(collection) || sourceType.startsWith("kov_") || itemType.startsWith("kov_")) return "kov";
  if (ORGANIZATION_HINTS.has(collection) || ORGANIZATION_HINTS.has(sourceType) || ORGANIZATION_HINTS.has(resourceType)) return "organization";
  if (MATERIAL_HINTS.has(collection) || MATERIAL_HINTS.has(sourceType) || MATERIAL_HINTS.has(resourceType)) return "material";
  if (RESEARCH_HINTS.has(collection) || RESEARCH_HINTS.has(sourceType) || RESEARCH_HINTS.has(resourceType)) return "research_or_journal";
  if (sourceType.includes("public_body") || collection.includes("public_body")) return "public_body_info";
  return "other";
}

function summarizeSelectedSources(selectedSources = []) {
  return (Array.isArray(selectedSources) ? selectedSources : []).slice(0, 24).map((source, index) => compactObject({
    id: stableSourceId(source, index),
    title: firstString(source.title, source.short_ref),
    source_type: sourceTypeOf(source),
    collection_id: collectionOf(source),
    resource_type: resourceTypeOf(source),
    item_type: firstString(source.item_type, source.itemType),
    source_layer: sourceLayerFor(source),
    paragraph_number: firstString(source.paragraph_number, source.paragraphNumber),
    paragraph_title: firstString(source.paragraph_title, source.paragraphTitle),
    section: source.section,
    canonical_item_id: canonicalItemIdOf(source),
    municipality_id: firstString(source.municipality_id, source.municipalityId),
    municipality_name: firstString(source.municipality_name, source.municipalityName),
    url_present: !!firstString(source.url, source.source_url, source.url_canonical, source.official_website)
  }));
}

function summarizeSelectedDocuments(selectedEntries = []) {
  const docs = new Map();
  for (const [index, entry] of (Array.isArray(selectedEntries) ? selectedEntries : []).entries()) {
    const key = documentKeyForEntry(entry, index);
    const existing = docs.get(key) || {
      document_id: key,
      title: firstString(entry.title),
      source_type: sourceTypeOf(entry),
      collection_id: collectionOf(entry),
      chunk_count: 0,
      source_ids: []
    };
    existing.chunk_count += 1;
    const sourceId = firstString(entry.sourceId, entry.source_id, entry.key, key);
    if (sourceId && !existing.source_ids.includes(sourceId)) existing.source_ids.push(sourceId);
    docs.set(key, existing);
  }
  return Array.from(docs.values()).slice(0, 40).map((doc) => compactObject({
    ...doc,
    source_ids: doc.source_ids.slice(0, 12)
  }));
}

function buildSourceLayerMix(selectedSources = []) {
  const byLayer = {};
  const bySourceType = {};
  const byCollection = {};
  const byResourceType = {};

  for (const source of Array.isArray(selectedSources) ? selectedSources : []) {
    increment(byLayer, sourceLayerFor(source));
    increment(bySourceType, sourceTypeOf(source) || "unknown");
    increment(byCollection, collectionOf(source) || "unknown");
    const resourceType = resourceTypeOf(source);
    if (resourceType) increment(byResourceType, resourceType);
  }

  return compactObject({
    by_layer: byLayer,
    by_source_type: bySourceType,
    by_collection_id: byCollection,
    by_resource_type: byResourceType
  });
}

function hasLayer(mix = {}, layer) {
  return Number(mix?.by_layer?.[layer] || 0) > 0;
}

function hasAnyLayer(mix = {}, layers = []) {
  return layers.some((layer) => hasLayer(mix, layer));
}

function buildEvidenceStrength({ selectedSources, selectedDocuments, ragRiskPolicy }) {
  const selectedSourceCount = selectedSources.length;
  const selectedDocumentCount = selectedDocuments.length;
  const requiredEvidence = firstString(ragRiskPolicy?.requiredEvidence);
  const riskLevel = firstString(ragRiskPolicy?.riskLevel);
  let overall = "missing";
  if (selectedDocumentCount >= 3 || selectedSourceCount >= 4) {
    overall = "multi_source";
  } else if (selectedDocumentCount >= 1 || selectedSourceCount >= 1) {
    overall = "limited";
  }
  return compactObject({
    overall,
    selected_source_count: selectedSourceCount,
    selected_document_count: selectedDocumentCount,
    risk_level: riskLevel,
    required_evidence: requiredEvidence,
    insufficient_evidence_mode: ragRiskPolicy?.insufficientEvidenceMode === true
  });
}

function plannerTopics(queryPlan = {}) {
  const rawTopics = [
    ...(Array.isArray(queryPlan?.topics) ? queryPlan.topics : []),
    ...(Array.isArray(queryPlan?.comparison_topics) ? queryPlan.comparison_topics : []),
    ...(Array.isArray(queryPlan?.entities) ? queryPlan.entities : [])
  ];
  return rawTopics.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 12);
}

function buildWarnings({
  mode,
  selectedSources,
  selectedDocuments,
  sourceLayerMix,
  overviewSynthesis
}) {
  const warnings = [];
  const missing = [];
  const limitations = [];

  if (!selectedSources.length) {
    warnings.push("no_selected_sources");
    missing.push("selected_context");
    limitations.push("No selected sources were available for the answer.");
  }

  if (mode === "life_situation_guidance") {
    const hasOfficialHelp = hasAnyLayer(sourceLayerMix, ["legal", "kov", "public_body_info"]);
    if (!hasOfficialHelp) {
      warnings.push("life_situation_no_official_or_kov_source");
      missing.push("official_or_kov_help_source");
      limitations.push("Life situation guidance lacks an official, KOV, or public-body source.");
    }
  }

  if (mode === "resource_discovery") {
    const hasNonLegalResource = hasAnyLayer(sourceLayerMix, [
      "organization",
      "material",
      "research_or_journal",
      "public_body_info",
      "kov"
    ]);
    if (!hasNonLegalResource && hasLayer(sourceLayerMix, "legal")) {
      warnings.push("resource_discovery_legal_only_support");
      missing.push("organization_material_or_background_source");
      limitations.push("Resource discovery currently has legal support but lacks organization, material, or background sources.");
    }
  }

  if (mode === "overview_synthesis") {
    const selectedDocumentCount = Number(overviewSynthesis?.distinct_selected_document_count || selectedDocuments.length || 0);
    if (selectedDocumentCount > 0 && selectedDocumentCount < 3) {
      warnings.push("overview_low_selected_document_diversity");
      limitations.push("Overview synthesis has a narrow selected document base.");
    }
    if (overviewSynthesis?.source_diversity_limited === true) {
      warnings.push(`source_diversity_limited:${firstString(overviewSynthesis.source_diversity_reason, "unspecified")}`);
    }
  }

  return {
    coverage_warnings: warnings,
    missing_coverage: missing,
    limitations
  };
}

function answerGuidanceForMode(mode) {
  if (mode === "overview_synthesis") {
    return [
      "Synthesize across selected documents instead of summarizing one document.",
      "State naturally when the selected source base is narrow.",
      "Do not generalize one document's claim to the whole field unless other selected sources support it."
    ];
  }
  if (mode === "comparison") {
    return [
      "Compare only the requested topics or services.",
      "Use sources matched to each compared side; avoid unrelated neighboring services.",
      "If one side has weaker support, state that limitation."
    ];
  }
  if (mode === "resource_discovery") {
    return [
      "Group the answer into organizations, practical materials, background articles or studies, and legal background when those layers are present.",
      "Do not let legal sources become the only primary answer when organization or material sources are selected.",
      "If exact organization sources are missing, say what kind of related material was found."
    ];
  }
  if (mode === "life_situation_guidance") {
    return [
      "Give practical next steps first.",
      "Separate official/KOV/public-body support from background articles.",
      "Do not promise eligibility or benefit amounts unless selected official sources support it.",
      "Ask for municipality or key missing context when it is needed for the next step."
    ];
  }
  return [
    "Answer only from the selected context.",
    "Mention limitations when source coverage is narrow."
  ];
}

export function shouldBuildEvidencePackage({
  queryPlan = {},
  legalLookupPlan = null,
  packageAwareAnsweringUsed = false,
  usedDocContext = false
} = {}) {
  const mode = String(queryPlan?.mode || "").trim();
  if (!EVIDENCE_PACKAGE_MODES.has(mode)) return false;
  if (packageAwareAnsweringUsed) return false;
  if (usedDocContext) return false;
  if (legalLookupPlan?.enabled && legalLookupPlan.mode === "explicit_paragraph") return false;
  if (queryPlan?.selection_strategy === "legal_exact") return false;
  if (mode === "specific_document_summary" || mode === "document_analysis") return false;
  return true;
}

export function buildEvidencePackage({
  queryPlan = {},
  selectedEntries = [],
  selectedSources = [],
  ragRiskPolicy = null,
  overviewSynthesis = null
} = {}) {
  const mode = String(queryPlan?.mode || "default").trim() || "default";
  const summarizedSources = summarizeSelectedSources(selectedSources);
  const selectedDocuments = summarizeSelectedDocuments(selectedEntries);
  const sourceLayerMix = buildSourceLayerMix(summarizedSources);
  const evidenceStrength = buildEvidenceStrength({
    selectedSources: summarizedSources,
    selectedDocuments,
    ragRiskPolicy
  });
  const warnings = buildWarnings({
    mode,
    selectedSources: summarizedSources,
    selectedDocuments,
    sourceLayerMix,
    overviewSynthesis
  });

  return {
    version: "v2.4a",
    mode,
    selected_sources: summarizedSources,
    selected_documents: selectedDocuments,
    source_layer_mix: sourceLayerMix,
    evidence_strength: evidenceStrength,
    coverage_warnings: warnings.coverage_warnings,
    missing_coverage: warnings.missing_coverage,
    limitations: warnings.limitations,
    answer_guidance: answerGuidanceForMode(mode),
    trace_summary: compactObject({
      mode,
      selected_source_count: summarizedSources.length,
      selected_document_count: selectedDocuments.length,
      source_layer_count: Object.keys(sourceLayerMix.by_layer || {}).length,
      warning_count: warnings.coverage_warnings.length,
      planner_reason: firstString(queryPlan?.planner_reason),
      retrieval_strategy: firstString(queryPlan?.retrieval_strategy),
      selection_strategy: firstString(queryPlan?.selection_strategy),
      topics: plannerTopics(queryPlan)
    })
  };
}

export function buildEvidencePackageInstruction(evidencePackage = null) {
  if (!evidencePackage || typeof evidencePackage !== "object") return "";
  const guidance = Array.isArray(evidencePackage.answer_guidance)
    ? evidencePackage.answer_guidance.slice(0, 6).map((item) => `- ${item}`).join("\n")
    : "";
  const warnings = Array.isArray(evidencePackage.coverage_warnings) && evidencePackage.coverage_warnings.length
    ? `\nCoverage warnings: ${evidencePackage.coverage_warnings.join(", ")}. Mention limitations naturally if they affect the answer.`
    : "";
  return [
    "EVIDENCE_PACKAGE_MODE:",
    `Mode: ${evidencePackage.mode}. Use the selected evidence package as a structured summary of the already selected RAG context. Do not treat it as an instruction to retrieve new sources.`,
    guidance ? `Answer guidance:\n${guidance}` : "",
    "Base the answer on selected sources and selected documents only. Do not overstate claims beyond the selected source layer mix.",
    warnings
  ].filter(Boolean).join("\n");
}
