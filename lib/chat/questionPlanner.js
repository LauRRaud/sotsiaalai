const RESOURCE_DISCOVERY_SOURCE_LAYERS = Object.freeze([
  "organizations",
  "organization_materials",
  "national_guidelines",
  "training_materials",
  "official_guideline",
  "information_material",
  "organization_profile",
  "organization_page"
]);

const RESOURCE_DISCOVERY_AVOID_SOURCE_LAYERS = Object.freeze([
  "legal_only_answer",
  "national_law_as_primary"
]);

function normalizePlannerText(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[õ]/g, "o")
    .replace(/[ä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[ü]/g, "u")
    .replace(/[š]/g, "s")
    .replace(/[ž]/g, "z")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePlannerRole(role = "") {
  const value = String(role || "").trim().toLowerCase();
  if (value === "client" || value === "citizen" || value === "kodanik") return "client";
  if (value === "social_worker" || value === "specialist" || value === "spetsialist") return "social_worker";
  if (value === "admin") return "admin";
  return "unknown";
}

function makePlan(overrides = {}) {
  return {
    planner_version: "v2.1",
    mode: "default",
    role: "unknown",
    confidence: 0.4,
    needs_rag: true,
    needs_multiple_sources: false,
    preferred_source_count: null,
    source_layers: [],
    avoid_source_layers: [],
    retrieval_strategy: "default_hybrid",
    answer_contract: "grounded_answer",
    planner_reason: "default",
    ...overrides
  };
}

function isLegalExactQuestion(text = "") {
  return /(?:§|paragrahv)\s*\d{1,3}[a-z]?/.test(text) ||
    /\b(shs|sotsiaalhoolekande seadus|riigi teataja|riigiteataja)\b.{0,40}\b\d{1,3}[a-z]?\b/.test(text);
}

function isSpecificDocumentSummaryQuestion(text = "") {
  return /\b(kokkuvote|kokkuvotte|refereeri|summeeri)\b/.test(text) &&
    /\b(artikkel|artiklist|dokumendist|dokument|failist|pdf|uuringust|juhendist)\b/.test(text);
}

function isKovServiceOrBenefitQuestion(text = "") {
  const municipalitySignal = /\b(vald|valla|linn|linna|kov|omavalitsus|omavalitsuse)\b/.test(text);
  const serviceSignal = /\b(koduteenus|sotsiaaltransport|tugiisikuteenus|lapsehoiuteenus|uldhooldusteenus|teenus|teenused|toetus|toetused|tingimus|tingimused|taotleda|vormid|kontaktid)\b/.test(text);
  return municipalitySignal && serviceSignal;
}

function isOverviewSynthesisQuestion(text = "") {
  const issueSignal = /\b(murekoht|murekohad|probleem|probleemid|kitsaskoht|kitsaskohad|raskus|raskused|teemad korduvad|ulevaade probleemidest|peamised teemad)\b/.test(text);
  const broadDomainSignal = /\b(lastekaitse|lastekaitses|sotsiaaltoo|omastehooldaja|hooldajad|puudega lapse pere|valdkond|praktika)\b/.test(text);
  return issueSignal && broadDomainSignal;
}

function isResourceDiscoveryQuestion(text = "") {
  const questionSignal = /\?/.test(text) ||
    /\b(millised|mis|mida|kust|kelle poole|kas on|leida abi|aitavad|aitab|pakub|pakuvad)\b/.test(text);
  if (!questionSignal) return false;

  const organizationSignal = /\b(organisatsioon|organisatsioonid|uhendus|uhing|koda|liit|fond|tugiliit|tugivorgustik|vorgustik|partner|teenusepakkuja|teenusepakkujad|keskus|asutus|kontakt|kontaktid)\b/.test(text);
  const materialSignal = /\b(materjal|materjale|materjalid|juhendmaterjal|juhendmaterjale|juhendmaterjalid|juhend|juhendid|pdf|infoleht|teemaleht|kataloog|vorm|vormid|taotlus|taotlused|praktikamaterjal|koolitusmaterjal)\b/.test(text);
  const helpSignal = /\b(kust leida abi|kelle poole poorduda|milline organisatsioon aitab|millised organisatsioonid|abivoimalus|abivoimalused|tugiteenus|tugiteenused|noustamine|ligipaasetavus)\b/.test(text);
  const disabilitySignal = /\b(puudega inimene|puudega inimesed|erivajadus|erivajadusega|nagemispuue|kuulmispuue|liitpuue|pimekurtus|viipekeel)\b/.test(text);
  const schoolMentalHealthMaterialSignal = /\b(laps|laste|noor|noorte|kool|koolis|opetaja)\b/.test(text) &&
    /\b(vaimne tervis|vaimse tervise|materjal|materjale|juhend|juhendmaterjal)\b/.test(text);

  return organizationSignal ||
    materialSignal ||
    helpSignal ||
    (disabilitySignal && (organizationSignal || materialSignal || helpSignal || /\b(aitab|aitavad|abi|toetab|toetavad)\b/.test(text))) ||
    schoolMentalHealthMaterialSignal;
}

export function buildQuestionPlan({ message = "", role = "" } = {}) {
  const normalized = normalizePlannerText(message);
  const normalizedRole = normalizePlannerRole(role);

  if (!normalized) {
    return makePlan({
      role: normalizedRole,
      needs_rag: false,
      planner_reason: "empty_message"
    });
  }

  if (isLegalExactQuestion(normalized)) {
    return makePlan({
      mode: "legal_exact",
      role: normalizedRole,
      confidence: 0.9,
      needs_rag: true,
      retrieval_strategy: "legal_exact",
      answer_contract: "legal_exact_source_required",
      planner_reason: "explicit_law_or_paragraph_reference"
    });
  }

  if (isKovServiceOrBenefitQuestion(normalized)) {
    return makePlan({
      mode: "kov_service_or_benefit",
      role: normalizedRole,
      confidence: 0.82,
      needs_rag: true,
      retrieval_strategy: "kov_source_package_or_scoped_rag",
      answer_contract: "municipality_source_package_preferred",
      planner_reason: "municipality_and_service_or_benefit_terms"
    });
  }

  if (isSpecificDocumentSummaryQuestion(normalized)) {
    return makePlan({
      mode: "specific_document_summary",
      role: normalizedRole,
      confidence: 0.84,
      needs_rag: true,
      retrieval_strategy: "specific_document_lookup",
      answer_contract: "summarize_requested_document_only",
      planner_reason: "specific_document_summary_request"
    });
  }

  if (isOverviewSynthesisQuestion(normalized)) {
    return makePlan({
      mode: "overview_synthesis",
      role: normalizedRole,
      confidence: 0.78,
      needs_rag: true,
      needs_multiple_sources: true,
      preferred_source_count: { min: 5, max: 8 },
      retrieval_strategy: "overview_diversity_then_depth",
      answer_contract: "multi_source_overview_synthesis",
      planner_reason: "broad_issue_or_overview_question"
    });
  }

  if (isResourceDiscoveryQuestion(normalized)) {
    return makePlan({
      mode: "resource_discovery",
      role: normalizedRole,
      confidence: 0.8,
      needs_rag: true,
      needs_multiple_sources: true,
      preferred_source_count: { min: 3, max: 8 },
      source_layers: [...RESOURCE_DISCOVERY_SOURCE_LAYERS],
      avoid_source_layers: [...RESOURCE_DISCOVERY_AVOID_SOURCE_LAYERS],
      retrieval_strategy: "resource_discovery_hybrid",
      answer_contract: "prefer_organization_material_contact_and_guideline_sources",
      planner_reason: "organization_material_contact_or_help_seeking_terms"
    });
  }

  return makePlan({
    role: normalizedRole
  });
}

export function isQuestionPlanResourceDiscovery(questionPlan = {}) {
  return String(questionPlan?.mode || "") === "resource_discovery";
}
