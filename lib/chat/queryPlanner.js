import { CONTEXT_GROUPS_MAX, RAG_TOP_K } from "@/lib/chat/settings";
import { buildTemporalYearSearchQuery } from "@/lib/chat/retrievalPlanning";
import { buildSourceAnchoredRagQueries } from "@/lib/chat/retrievalOrchestrator";
import { buildLegalLookupQueryEntries, detectLegalLookupPlan } from "@/lib/chat/legalLookup";

function collectFilterKeys(value, out = new Set()) {
  if (!value || typeof value !== "object") return out;
  for (const [key, nested] of Object.entries(value)) {
    if (!key) continue;
    out.add(key);
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      collectFilterKeys(nested, out);
    }
  }
  return out;
}

function queryHasFilters(query) {
  return !!query && typeof query === "object" && !!query.filters && typeof query.filters === "object";
}

function summarizeQueryFilters(queries = [], baseFilters = null) {
  const keys = collectFilterKeys(baseFilters);
  for (const query of Array.isArray(queries) ? queries : []) {
    if (queryHasFilters(query)) collectFilterKeys(query.filters, keys);
  }
  return Array.from(keys).sort();
}

function normalizeRagQueryEntries(ragQueries = []) {
  return (Array.isArray(ragQueries) ? ragQueries : [ragQueries])
    .map((entry) => {
      const query = String(typeof entry === "string" ? entry : entry?.query || "").trim();
      if (!query) return null;
      const filters = entry && typeof entry === "object" && !Array.isArray(entry)
        ? entry.filters || null
        : null;
      return {
        query,
        ...(filters ? { filters } : {})
      };
    })
    .filter(Boolean);
}

export function buildSourceLookupRagQueries(ragQueryText = "") {
  const base = String(ragQueryText || "").trim();
  return base ? [{ query: base }] : [];
}

function mergeQueryFilters(entry, filters) {
  return {
    ...(entry?.filters || {}),
    ...(filters || {})
  };
}

export function buildGeneralBackgroundQueries(ragQueries = [], baseQuery = "") {
  const normalizedQueries = (Array.isArray(ragQueries) ? ragQueries : [ragQueries])
    .map((entry) => (typeof entry === "string" ? entry : entry?.query))
    .map((query) => String(query || "").trim())
    .filter(Boolean);
  const base = String(baseQuery || normalizedQueries[0] || "").trim();
  const backgroundAnchor = "uldine taust sotsiaalhoolekanne sotsiaalkaitse riiklik korraldus Sotsiaaltoo";
  return Array.from(new Set([
    base ? [base, backgroundAnchor].join("\n") : backgroundAnchor,
    ...normalizedQueries
  ].filter(Boolean))).map((query) => ({ query }));
}

export function buildNationalServiceBenefitQuery(message = "") {
  return [
    String(message || "").trim(),
    "Sotsiaalhoolekande seadus",
    "kohaliku omavalitsuse yksuse ylesanded",
    "kohaliku omavalitsuse kohustus sotsiaalteenuseid ja muud abi korraldada",
    "sotsiaalteenuste osutamine abivajadusest lahtudes",
    "riiklikud sotsiaalteenused riiklikud sotsiaaltoetused",
    "erihoolekandeteenus rehabilitatsiooniteenus sotsiaalkindlustusamet riigieelarvest rahastatav"
  ].filter(Boolean).join("\n");
}

export function buildServiceJurisdictionQuery(message = "") {
  return [
    String(message || "").trim(),
    "Sotsiaalhoolekande seadus",
    "kohaliku omavalitsuse yksuse korraldatav sotsiaalteenus",
    "kohaliku omavalitsuse yksuse ylesanded",
    "kohaliku omavalitsuse kohustus sotsiaalteenuseid korraldada",
    "riiklik teenus riigi tasandi teenus Sotsiaalkindlustusamet"
  ].filter(Boolean).join("\n");
}

export function buildMunicipalityScopedQueries(ragQueries = [], municipalities = [], options = {}) {
  const municipalityNames = Array.from(new Set(
    (Array.isArray(municipalities) ? municipalities : [])
      .map((item) => String(item?.displayName || "").trim())
      .filter(Boolean)
  )).slice(0, 3);
  const queryEntries = normalizeRagQueryEntries(ragQueries);
  if (!municipalityNames.length || !queryEntries.length) return queryEntries;

  const serviceAnchor = "sotsiaalteenused toetused sotsiaalabi KOV";
  return queryEntries.flatMap((entry) =>
    municipalityNames.flatMap((municipalityName) => {
      const scoped = {
        ...entry,
        query: [municipalityName, entry.query, serviceAnchor].filter(Boolean).join("\n")
      };
      if (!options?.expandServiceBenefitList) return [scoped];
      const wantsServices = options?.serviceBenefitIntent?.wantsServices !== false;
      const wantsBenefits = options?.serviceBenefitIntent?.wantsBenefits !== false;
      const expanded = [scoped];
      if (wantsServices) {
        expanded.push({
          query: [municipalityName, entry.query, "sotsiaalteenused teenused koduteenus tugiisik sotsiaaltransport eluruum volanoustamine lapsehoid hooldus"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_services",
            item_type: "service"
          })
        });
      }
      if (wantsBenefits) {
        expanded.push({
          query: [municipalityName, entry.query, "toetused sotsiaaltoetus sotsiaaltoetused sotsiaaltoetusi toimetulekutoetus vajaduspohine toetus hooldajatoetus eestkostetoetus matusetoetus tervisetoetus sissetulekust soltuv toetus toetuse taotlus"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_services",
            item_type: "benefit"
          })
        });
      }
      if (wantsServices && wantsBenefits) {
        expanded.push({
          query: [municipalityName, "Sotsiaalhoolekandelise abi andmise kord abi liigid sotsiaalteenused sotsiaaltoetused"].join("\n"),
          filters: mergeQueryFilters(entry, {
            collection_id: "kov_regulations"
          })
        });
      }
      return expanded;
    })
  );
}

export function buildMunicipalityScopedFilters(audienceFilter, municipalities = []) {
  const municipalityNames = Array.from(new Set(
    (Array.isArray(municipalities) ? municipalities : [])
      .map((item) => String(item?.displayName || "").trim())
      .filter(Boolean)
  ));
  if (municipalityNames.length !== 1) return audienceFilter;
  return {
    ...audienceFilter,
    municipality_name: municipalityNames[0]
  };
}

export function determineSelectionStrategy({
  legalLookupPlan,
  temporalRetrievalPlan,
  municipalityServiceBenefitListRequest,
  broadMultiSourceQuestion
}) {
  if (legalLookupPlan?.enabled && legalLookupPlan.mode === "explicit_paragraph") return "legal_exact";
  if (temporalRetrievalPlan?.enabled) return "temporal_year_coverage";
  if (municipalityServiceBenefitListRequest) return "municipality_service_benefit_balance";
  if (broadMultiSourceQuestion) return "multi_source_diversity";
  return "mmr_diversity";
}

export function determineContextGroupTarget({
  legalLookupPlan,
  sourceLookupRequest,
  sourceLookupTargetsNationalLaw,
  sourceLookupParagraphRefs,
  temporalRetrievalPlan,
  municipalityServiceBenefitListRequest,
  municipalityServiceBenefitIntent,
  broadMultiSourceQuestion
}) {
  if (legalLookupPlan?.enabled) {
    if (legalLookupPlan.mode === "explicit_paragraph") {
      const paragraphCount = Array.isArray(legalLookupPlan.paragraphRefs) ? legalLookupPlan.paragraphRefs.length : 0;
      return Math.max(CONTEXT_GROUPS_MAX, paragraphCount > 1 ? Math.min(10, paragraphCount + 2) : 6);
    }
    if (legalLookupPlan.mode === "topic_to_paragraphs") return Math.max(CONTEXT_GROUPS_MAX, 8);
  }
  if (sourceLookupRequest && sourceLookupTargetsNationalLaw) {
    const paragraphCount = Array.isArray(sourceLookupParagraphRefs) ? sourceLookupParagraphRefs.length : 0;
    return Math.max(CONTEXT_GROUPS_MAX, paragraphCount > 1 ? Math.min(10, paragraphCount + 2) : 6);
  }
  if (temporalRetrievalPlan?.enabled) return CONTEXT_GROUPS_MAX;
  if (municipalityServiceBenefitListRequest) {
    if (municipalityServiceBenefitIntent?.wantsServices && municipalityServiceBenefitIntent?.wantsBenefits) {
      return Math.max(CONTEXT_GROUPS_MAX, 28);
    }
    if (municipalityServiceBenefitIntent?.wantsServices) return Math.max(CONTEXT_GROUPS_MAX, 24);
    return Math.max(CONTEXT_GROUPS_MAX, 14);
  }
  if (broadMultiSourceQuestion) return Math.max(CONTEXT_GROUPS_MAX, 8);
  return CONTEXT_GROUPS_MAX;
}

function determineRagTopK({
  legalLookupPlan,
  sourceLookupRequest,
  sourceLookupTopK,
  municipalityServiceBenefitListRequest,
  municipalityServiceBenefitRagRequest,
  municipalityServiceBenefitIntent,
  nationalServiceBenefitQuestion,
  serviceJurisdictionQuestion,
  allowMunicipalityScopedRag
}) {
  if (legalLookupPlan?.enabled) {
    if (legalLookupPlan.mode === "explicit_paragraph") {
      return Math.min(36, Math.max(24, (legalLookupPlan.paragraphRefs || []).length * 6));
    }
    if (legalLookupPlan.mode === "topic_to_paragraphs") {
      return Math.min(36, Math.max(24, RAG_TOP_K * 2));
    }
    return Math.min(24, Math.max(12, RAG_TOP_K));
  }
  if (sourceLookupRequest) return sourceLookupTopK;
  if (municipalityServiceBenefitListRequest) {
    return municipalityServiceBenefitIntent?.wantsServices && municipalityServiceBenefitIntent?.wantsBenefits
      ? Math.min(80, Math.max(56, RAG_TOP_K * 5))
      : Math.min(64, Math.max(40, RAG_TOP_K * 4));
  }
  if (municipalityServiceBenefitRagRequest) return Math.min(40, Math.max(24, RAG_TOP_K * 3));
  if (nationalServiceBenefitQuestion || serviceJurisdictionQuestion) return Math.min(36, Math.max(18, RAG_TOP_K * 3));
  if (allowMunicipalityScopedRag) return RAG_TOP_K;
  return Math.min(50, Math.max(RAG_TOP_K, RAG_TOP_K * 3));
}

export function buildQueryPlanTrace({
  legalLookupPlan,
  externalSourcesNeeded,
  shouldRunRag,
  sourceLookupRequest,
  previousSourceUseRequest,
  temporalRetrievalPlan,
  broadMultiSourceQuestion,
  allowMunicipalityScopedRag,
  municipalityServiceBenefitListRequest,
  municipalityServiceBenefitRagRequest,
  nationalServiceBenefitQuestion,
  serviceJurisdictionQuestion,
  sourceLookupTargetsNationalLaw,
  ragQueries,
  primaryRagQueries,
  primaryRagFilters,
  ragSearchTopK,
  selectionStrategy,
  contextGroupTarget,
  ragRiskPolicy,
  effectiveMunicipalities
}) {
  const hasPerQueryFilters = (Array.isArray(primaryRagQueries) ? primaryRagQueries : []).some(queryHasFilters);
  const sourceFocusedFollowup =
    !legalLookupPlan?.enabled &&
    !sourceLookupRequest &&
    !broadMultiSourceQuestion &&
    (Array.isArray(ragQueries) ? ragQueries : []).some(queryHasFilters);
  const mode = legalLookupPlan?.enabled
    ? legalLookupPlan.mode
    : sourceLookupRequest
      ? sourceLookupTargetsNationalLaw
        ? "national_source_lookup"
        : "source_lookup"
      : temporalRetrievalPlan?.enabled
        ? "temporal"
        : municipalityServiceBenefitListRequest
          ? "municipality_service_benefit_list"
          : municipalityServiceBenefitRagRequest
            ? "municipality_service_benefit"
            : broadMultiSourceQuestion
              ? "broad_multi_source"
              : nationalServiceBenefitQuestion
                ? "national_service_benefit"
                : serviceJurisdictionQuestion
                  ? "service_jurisdiction"
                  : sourceFocusedFollowup
                    ? "source_focused_followup"
                    : allowMunicipalityScopedRag
                      ? "municipality_scoped"
                      : "default";
  const queryOrder = legalLookupPlan?.enabled
    ? legalLookupPlan.mode === "explicit_paragraph"
      ? "targeted_source_lookup"
      : "default"
    : temporalRetrievalPlan?.enabled
    ? "temporal_year_queries"
    : broadMultiSourceQuestion
      ? "broad_first"
      : sourceFocusedFollowup
        ? "source_focus_first"
        : sourceLookupRequest
          ? "targeted_source_lookup"
          : "default";

  return {
    planner_version: "v2",
    mode,
    external_sources_needed: !!externalSourcesNeeded,
    should_run_rag: !!shouldRunRag,
    previous_source_use_request: !!previousSourceUseRequest,
    query_count: Array.isArray(primaryRagQueries) ? primaryRagQueries.length : 0,
    query_order: queryOrder,
    has_per_query_filters: hasPerQueryFilters,
    filter_keys: summarizeQueryFilters(primaryRagQueries, primaryRagFilters),
    municipality_names: Array.from(new Set(
      (Array.isArray(effectiveMunicipalities) ? effectiveMunicipalities : [])
        .map(item => String(item?.displayName || "").trim())
        .filter(Boolean)
    )),
    municipality_ids: Array.from(new Set(
      (Array.isArray(effectiveMunicipalities) ? effectiveMunicipalities : [])
        .map(item => String(item?.id || item?.municipalityId || item?.municipality_id || "").trim())
        .filter(Boolean)
    )),
    selection_strategy: selectionStrategy,
    context_group_target: contextGroupTarget,
    rag_top_k: Number.isFinite(Number(ragSearchTopK)) ? Number(ragSearchTopK) : null,
    risk_level: ragRiskPolicy?.riskLevel || "low",
    required_evidence: ragRiskPolicy?.requiredEvidence || "medium",
    legalLookupPlan: legalLookupPlan?.enabled
      ? {
          enabled: true,
          mode: legalLookupPlan.mode,
          jurisdictionLevel: legalLookupPlan.jurisdictionLevel,
          sourceTypes: legalLookupPlan.sourceTypes,
          collectionId: legalLookupPlan.collectionId,
          actTitle: legalLookupPlan.actTitle,
          actAliases: legalLookupPlan.actAliases,
          municipalityId: legalLookupPlan.municipalityId,
          paragraphRefs: legalLookupPlan.paragraphRefs,
          topicTerms: legalLookupPlan.topicTerms,
          requireCurrent: legalLookupPlan.requireCurrent
        }
      : { enabled: false },
    flags: {
      source_lookup: !!sourceLookupRequest,
      temporal: !!temporalRetrievalPlan?.enabled,
      broad_multi_source: !!broadMultiSourceQuestion,
      source_focused_followup: !!sourceFocusedFollowup,
      municipality_scoped: !!allowMunicipalityScopedRag,
      national_scope: !!(nationalServiceBenefitQuestion || serviceJurisdictionQuestion || sourceLookupTargetsNationalLaw || legalLookupPlan?.jurisdictionLevel === "NATIONAL")
    }
  };
}

export function buildRagQueryPlan({
  baseRagQueryText,
  effectiveMessage,
  rawHistory,
  sourceLookupRequest,
  sourceLookupParagraphRefs,
  temporalRetrievalPlan,
  nationalServiceBenefitQuestion,
  serviceJurisdictionQuestion,
  allowMunicipalityScopedRag,
  municipalityServiceBenefitRagRequest,
  municipalityServiceBenefitListRequest,
  municipalityServiceBenefitIntent,
  effectiveMunicipalities,
  audienceFilter,
  sourceLookupTargetsNationalLaw,
  externalSourcesNeeded,
  shouldRunRag,
  previousSourceUseRequest,
  broadMultiSourceQuestion,
  ragRiskPolicy
}) {
  const ragQueryText = String(baseRagQueryText || "").trim();
  const legalLookupPlan = detectLegalLookupPlan({
    message: effectiveMessage,
    sourceLookupRequest,
    fallbackParagraphRefs: sourceLookupParagraphRefs,
    effectiveMunicipalities
  });

  const ragQueries = !ragQueryText
    ? []
    : legalLookupPlan.enabled
      ? buildLegalLookupQueryEntries(legalLookupPlan, effectiveMessage)
      : sourceLookupRequest
        ? buildSourceLookupRagQueries(ragQueryText)
        : temporalRetrievalPlan?.enabled
          ? [
              { query: ragQueryText },
              ...(temporalRetrievalPlan?.years || []).map((year) => ({
                query: buildTemporalYearSearchQuery(temporalRetrievalPlan.focusText || ragQueryText, year),
                filters: {
                  year
                }
              }))
            ]
          : buildSourceAnchoredRagQueries(effectiveMessage, rawHistory, ragQueryText);

  const sourceLookupTopK = sourceLookupRequest && !legalLookupPlan.enabled
    ? sourceLookupTargetsNationalLaw
      ? (Array.isArray(sourceLookupParagraphRefs) && sourceLookupParagraphRefs.length <= 1
          ? Math.min(36, Math.max(24, RAG_TOP_K * 2))
          : Math.min(50, Math.max(24, RAG_TOP_K * 2, (sourceLookupParagraphRefs || []).length * 6)))
      : (Array.isArray(sourceLookupParagraphRefs) && sourceLookupParagraphRefs.length <= 1
          ? Math.min(12, Math.max(8, RAG_TOP_K))
          : Math.min(36, Math.max(RAG_TOP_K, (sourceLookupParagraphRefs || []).length * 5)))
    : null;

  const primaryRagQueries =
    legalLookupPlan.enabled
      ? ragQueries
      : !sourceLookupRequest && (nationalServiceBenefitQuestion || serviceJurisdictionQuestion)
        ? ragQueries
        : !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedQueries(ragQueries, effectiveMunicipalities, {
              expandServiceBenefitList: municipalityServiceBenefitRagRequest,
              serviceBenefitIntent: municipalityServiceBenefitIntent
            })
          : ragQueries;

  const primaryRagFilters =
    legalLookupPlan.enabled
      ? audienceFilter
      : !sourceLookupRequest && (nationalServiceBenefitQuestion || serviceJurisdictionQuestion)
        ? {
            ...audienceFilter,
            jurisdiction_level: "NATIONAL"
          }
        : !sourceLookupRequest && allowMunicipalityScopedRag
          ? buildMunicipalityScopedFilters(audienceFilter, effectiveMunicipalities)
          : audienceFilter;

  const searchFilters = legalLookupPlan.enabled
    ? audienceFilter
    : sourceLookupTargetsNationalLaw
      ? {
          ...audienceFilter,
          jurisdiction_level: "NATIONAL"
        }
      : primaryRagFilters;

  const ragSearchTopK = determineRagTopK({
    legalLookupPlan,
    sourceLookupRequest,
    sourceLookupTopK,
    municipalityServiceBenefitListRequest,
    municipalityServiceBenefitRagRequest,
    municipalityServiceBenefitIntent,
    nationalServiceBenefitQuestion,
    serviceJurisdictionQuestion,
    allowMunicipalityScopedRag
  });
  const selectionStrategy = determineSelectionStrategy({
    legalLookupPlan,
    temporalRetrievalPlan,
    municipalityServiceBenefitListRequest,
    broadMultiSourceQuestion
  });
  const contextGroupTarget = determineContextGroupTarget({
    legalLookupPlan,
    sourceLookupRequest,
    sourceLookupTargetsNationalLaw,
    sourceLookupParagraphRefs,
    temporalRetrievalPlan,
    municipalityServiceBenefitListRequest,
    municipalityServiceBenefitIntent,
    broadMultiSourceQuestion
  });
  const queryPlan = buildQueryPlanTrace({
    legalLookupPlan,
    externalSourcesNeeded,
    shouldRunRag,
    sourceLookupRequest,
    previousSourceUseRequest,
    temporalRetrievalPlan,
    broadMultiSourceQuestion,
    allowMunicipalityScopedRag,
    municipalityServiceBenefitListRequest,
    municipalityServiceBenefitRagRequest,
    nationalServiceBenefitQuestion,
    serviceJurisdictionQuestion,
    sourceLookupTargetsNationalLaw,
    ragQueries,
    primaryRagQueries,
    primaryRagFilters: searchFilters,
    ragSearchTopK,
    selectionStrategy,
    contextGroupTarget,
    ragRiskPolicy,
    effectiveMunicipalities
  });

  return {
    ragQueryText,
    legalLookupPlan,
    ragQueries,
    primaryRagQueries,
    primaryRagFilters,
    searchFilters,
    sourceLookupTopK,
    ragSearchTopK,
    selectionStrategy,
    contextGroupTarget,
    queryPlan
  };
}
