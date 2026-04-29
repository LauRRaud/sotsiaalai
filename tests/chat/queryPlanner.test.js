import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  buildNationalServiceBenefitQuery,
  buildRagQueryPlan,
  buildServiceJurisdictionQuery
} from "../../lib/chat/queryPlanner.js";
import {
  buildRagContextBudgetOptions,
  isNationalServiceBenefitQuestion
} from "../../lib/chat/retrievalContextAssembler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "../fixtures/query-planner-v2-cases.json");

const audienceFilter = {
  audience: {
    $in: ["SOCIAL_WORKER", "BOTH"]
  }
};

function readPlannerCases() {
  return JSON.parse(readFileSync(fixturePath, "utf8"));
}

function basePlan(overrides = {}) {
  const message = overrides.effectiveMessage || overrides.message || "Eesti";
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([key, value]) => key !== "message" && value !== undefined)
  );
  return buildRagQueryPlan({
    baseRagQueryText: overrides.baseRagQueryText || String(message).trim(),
    effectiveMessage: message,
    rawHistory: overrides.rawHistory || [],
    sourceLookupRequest: false,
    sourceLookupParagraphRefs: [],
    temporalRetrievalPlan: {
      enabled: false,
      years: [],
      focusText: "",
      queries: []
    },
    nationalServiceBenefitQuestion: false,
    serviceJurisdictionQuestion: false,
    allowMunicipalityScopedRag: false,
    municipalityServiceBenefitRagRequest: false,
    municipalityServiceBenefitListRequest: false,
    municipalityServiceBenefitIntent: {
      wantsServices: true,
      wantsBenefits: true
    },
    effectiveMunicipalities: [],
    audienceFilter,
    sourceLookupTargetsNationalLaw: false,
    externalSourcesNeeded: true,
    shouldRunRag: true,
    previousSourceUseRequest: false,
    broadMultiSourceQuestion: false,
    ragRiskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium"
    },
    ...cleanOverrides
  });
}

function assertQueryKind(query, kind, id) {
  if (!kind) return;
  if (kind === "filtered") {
    assert.equal(typeof query, "object", `${id}: expected first query object`);
    assert.equal(query && !Array.isArray(query), true, `${id}: expected first query object`);
    assert.equal(typeof query.query, "string", `${id}: expected first query text`);
    assert.equal(typeof query.filters, "object", `${id}: expected first query filters`);
    return;
  }
  if (kind === "unfiltered") {
    assert.equal(typeof query, "string", `${id}: expected first query string`);
    return;
  }
  assert.fail(`${id}: unknown query kind ${kind}`);
}

function queryText(query) {
  return typeof query === "string" ? query : String(query?.query || "");
}

test("Query Planner V2 makes source-focused follow-up searches explicit", () => {
  const plan = basePlan({
    effectiveMessage: "Eesti",
    rawHistory: [
      {
        role: "assistant",
        text: "Artikli vastus.",
        sources: [
          {
            doc_id: "article-doc-2025",
            title: "Tehisintellekt sotsiaaltoos",
            authors: ["Laur Raudsoo"],
            journalTitle: "Sotsiaaltoo",
            year: 2025
          }
        ]
      }
    ]
  });

  assert.equal(plan.queryPlan.planner_version, "v2");
  assert.equal(plan.queryPlan.mode, "source_focused_followup");
  assert.equal(plan.queryPlan.query_order, "source_focus_first");
  assert.equal(plan.queryPlan.has_per_query_filters, true);
  assert.deepEqual(plan.primaryRagQueries[0].filters, { doc_id: "article-doc-2025" });
  assert.deepEqual(plan.searchFilters, audienceFilter);
});

test("Query Planner V2 keeps broad synthesis searches broad first", () => {
  const plan = basePlan({
    effectiveMessage: "vordle seda teiste Sotsiaaltoo artiklitega",
    broadMultiSourceQuestion: true,
    rawHistory: [
      {
        role: "assistant",
        text: "Artikli vastus.",
        sources: [
          {
            doc_id: "article-doc-2025",
            title: "Tehisintellekt sotsiaaltoos",
            journalTitle: "Sotsiaaltoo",
            year: 2025
          }
        ]
      }
    ]
  });

  assert.equal(plan.queryPlan.mode, "broad_multi_source");
  assert.equal(plan.queryPlan.query_order, "broad_first");
  assert.equal(plan.queryPlan.selection_strategy, "multi_source_diversity");
  assert.equal(typeof plan.primaryRagQueries[0], "string");
  assert.deepEqual(plan.primaryRagQueries[1].filters, { doc_id: "article-doc-2025" });
});

test("Query Planner V2 expands municipality service and benefit list queries", () => {
  const plan = basePlan({
    effectiveMessage: "millised sotsiaalteenused ja toetused on Tartus",
    allowMunicipalityScopedRag: true,
    municipalityServiceBenefitRagRequest: true,
    municipalityServiceBenefitListRequest: true,
    effectiveMunicipalities: [
      {
        displayName: "Tartu linn"
      }
    ],
    municipalityServiceBenefitIntent: {
      wantsServices: true,
      wantsBenefits: true
    }
  });

  assert.equal(plan.queryPlan.mode, "municipality_service_benefit_list");
  assert.equal(plan.queryPlan.selection_strategy, "municipality_service_benefit_balance");
  assert.equal(plan.queryPlan.context_group_target >= 28, true);
  assert.equal(plan.searchFilters.municipality_name, "Tartu linn");
  assert.equal(plan.primaryRagQueries.some((query) => query?.filters?.item_type === "service"), true);
  assert.equal(plan.primaryRagQueries.some((query) => query?.filters?.item_type === "benefit"), true);
  assert.equal(plan.primaryRagQueries.some((query) => query?.filters?.collection_id === "kov_legal"), true);
});

test("Query Planner V2 routes municipality Riigi Teataja availability checks to KOV legal layer", () => {
  const plan = basePlan({
    effectiveMessage: "kas Harku valla riigiteataja on sul?",
    baseRagQueryText: "kas Harku valla riigiteataja on sul?",
    sourceLookupRequest: true,
    allowMunicipalityScopedRag: true,
    effectiveMunicipalities: [
      {
        id: "harku_vald",
        displayName: "Harku vald"
      }
    ]
  });

  assert.equal(plan.legalLookupPlan.enabled, true);
  assert.equal(plan.legalLookupPlan.mode, "legal_source_lookup");
  assert.equal(plan.legalLookupPlan.collectionId, "kov_legal");
  assert.equal(plan.legalLookupPlan.municipalityId, "harku_vald");
  assert.equal(plan.legalLookupPlan.actTitle, null);
  assert.equal(plan.primaryRagQueries.length, 1);
  assert.equal(plan.primaryRagQueries[0].filters.collection_id, "kov_legal");
  assert.equal(plan.primaryRagQueries[0].filters.source_type, "kov_regulation");
  assert.equal(plan.primaryRagQueries[0].filters.municipality_id, "harku_vald");
  assert.equal(Object.hasOwn(plan.primaryRagQueries[0].filters, "act_title"), false);
  assert.match(plan.primaryRagQueries[0].query, /Riigi Teataja/i);
});

test("Query Planner V2 anchors national legal obligation queries to KOV duty paragraphs", () => {
  const message = "Mida ütleb sotsiaalhoolekande seadus kohaliku omavalitsuse kohustuse kohta sotsiaalteenuseid korraldada?";
  assert.equal(isNationalServiceBenefitQuestion(message), true);

  const nationalQuery = buildNationalServiceBenefitQuery(message);
  assert.match(nationalQuery, /kohaliku omavalitsuse yksuse ylesanded/i);
  assert.match(nationalQuery, /kohaliku omavalitsuse yksuse ylesanded/i);

  const jurisdictionQuery = buildServiceJurisdictionQuery("kas koduteenus on KOV või riiklik teenus");
  assert.match(jurisdictionQuery, /kohaliku omavalitsuse yksuse ylesanded/i);
});

test("Query Planner V2 builds explicit legal paragraph lookups with hard metadata filters", () => {
  const plan = basePlan({
    effectiveMessage: "SHS § 140?",
    baseRagQueryText: "Sotsiaalhoolekande seadus § 140",
    sourceLookupRequest: true,
    sourceLookupTargetsNationalLaw: true,
    sourceLookupParagraphRefs: ["140"]
  });

  assert.equal(plan.legalLookupPlan.enabled, true);
  assert.equal(plan.legalLookupPlan.mode, "explicit_paragraph");
  assert.deepEqual(plan.legalLookupPlan.paragraphRefs, ["140"]);
  assert.equal(plan.queryPlan.mode, "explicit_paragraph");
  assert.equal(plan.queryPlan.legalLookupPlan.enabled, true);
  assert.equal(plan.queryPlan.selection_strategy, "legal_exact");
  assert.equal(plan.primaryRagQueries.length, 1);
  assert.deepEqual(plan.primaryRagQueries[0].filters, {
    source_type: "national_law",
    collection_id: "national_regulations",
    act_title: "Sotsiaalhoolekande seadus",
    source_status: "active",
    historical: false,
    paragraph_number: "140"
  });
  assert.equal(plan.ragSearchTopK >= 24, true);
  assert.equal(plan.queryPlan.context_group_target >= 6, true);
});

test("Query Planner V2 detects explicit legal paragraph lookup variants without depending on sourceLookupRequest", () => {
  const messages = [
    "SHS § 140?",
    "SHS §140",
    "Sotsiaalhoolekande seadus § 140",
    "Sotsiaalhoolekande seaduse § 140",
    "SHS paragrahv 140",
    "Sotsiaalhoolekande seadus paragrahv 140"
  ];

  for (const message of messages) {
    const plan = basePlan({
      effectiveMessage: message,
      baseRagQueryText: message,
      sourceLookupRequest: false,
      sourceLookupTargetsNationalLaw: false,
      sourceLookupParagraphRefs: []
    });

    assert.equal(plan.legalLookupPlan.enabled, true, message);
    assert.equal(plan.legalLookupPlan.mode, "explicit_paragraph", message);
    assert.deepEqual(plan.legalLookupPlan.paragraphRefs, ["140"], message);
    assert.equal(plan.queryPlan.mode, "explicit_paragraph", message);
    assert.equal(plan.queryPlan.selection_strategy, "legal_exact", message);
    assert.deepEqual(plan.primaryRagQueries[0].filters, {
      source_type: "national_law",
      collection_id: "national_regulations",
      act_title: "Sotsiaalhoolekande seadus",
      source_status: "active",
      historical: false,
      paragraph_number: "140"
    }, message);
  }
});

test("Query Planner V2 keeps topic-based SHS lookups topic-based without hardcoded paragraph refs", () => {
  const plan = basePlan({
    effectiveMessage: "Millised SHS sätted reguleerivad toimetulekutoetust?",
    baseRagQueryText: "Sotsiaalhoolekande seadus toimetulekutoetus",
    sourceLookupRequest: true,
    sourceLookupTargetsNationalLaw: true,
    sourceLookupParagraphRefs: []
  });

  assert.equal(plan.legalLookupPlan.enabled, true);
  assert.equal(plan.legalLookupPlan.mode, "topic_to_paragraphs");
  assert.deepEqual(plan.legalLookupPlan.paragraphRefs, []);
  assert.deepEqual(plan.legalLookupPlan.topicTerms, ["toimetulekutoetus"]);
  assert.equal(plan.primaryRagQueries.length, 1);
  assert.deepEqual(plan.primaryRagQueries[0].filters, {
    source_type: "national_law",
    collection_id: "national_regulations",
    act_title: "Sotsiaalhoolekande seadus",
    source_status: "active",
    historical: false
  });
  assert.doesNotMatch(plan.primaryRagQueries[0].query, /131|132|133|134|135/);
});

test("Query Planner V2 lets explicit paragraph beat earlier topic anchors in history", () => {
  const plan = basePlan({
    effectiveMessage: "SHS § 140?",
    baseRagQueryText: "Sotsiaalhoolekande seadus § 140",
    rawHistory: [
      {
        role: "user",
        text: "Millised SHS paragrahvid reguleerivad toimetulekutoetust?"
      }
    ],
    sourceLookupRequest: true,
    sourceLookupTargetsNationalLaw: true,
    sourceLookupParagraphRefs: ["131", "132", "133", "134", "135", "140"]
  });

  assert.equal(plan.legalLookupPlan.mode, "explicit_paragraph");
  assert.deepEqual(plan.legalLookupPlan.paragraphRefs, ["140"]);
  assert.equal(plan.primaryRagQueries.length, 1);
  assert.equal(plan.primaryRagQueries[0].filters.paragraph_number, "140");
});

test("RAG context budgeting compacts broad national legal section lookups", () => {
  const options = buildRagContextBudgetOptions({
    temporalRetrievalPlan: {
      enabled: false,
      years: []
    },
    sourceLookupRequest: true,
    sourceLookupTargetsNationalLaw: true,
    sourceLookupParagraphRefs: [],
    contextGroupTarget: 8
  });

  assert.deepEqual(options, {
    compact: true,
    maxGroups: 8
  });

  const exactParagraphOptions = buildRagContextBudgetOptions({
    temporalRetrievalPlan: {
      enabled: false,
      years: []
    },
    sourceLookupRequest: true,
    sourceLookupTargetsNationalLaw: true,
    sourceLookupParagraphRefs: ["132"],
    contextGroupTarget: 8
  });

  assert.deepEqual(exactParagraphOptions, {
    maxGroups: 8
  });
});

test("Query Planner V2 eval fixture keeps planner modes stable", () => {
  const cases = readPlannerCases();
  assert.equal(Array.isArray(cases), true);
  assert.equal(cases.length >= 8, true);

  const ids = new Set();
  const seenModes = new Set();
  for (const item of cases) {
    assert.equal(typeof item.id, "string");
    assert.equal(ids.has(item.id), false, `duplicate case id: ${item.id}`);
    ids.add(item.id);
    assert.equal(typeof item.message, "string", item.id);
    assert.equal(typeof item.expected?.mode, "string", item.id);

    const plan = basePlan({
      message: item.message,
      baseRagQueryText: item.baseRagQueryText,
      rawHistory: item.history || [],
      temporalRetrievalPlan: item.temporalRetrievalPlan || {
        enabled: false,
        years: [],
        focusText: "",
        queries: []
      },
      sourceLookupParagraphRefs: item.sourceLookupParagraphRefs || [],
      municipalityServiceBenefitIntent: item.municipalityServiceBenefitIntent || {
        wantsServices: true,
        wantsBenefits: true
      },
      effectiveMunicipalities: item.municipalities || [],
      ...(item.flags || {})
    });

    seenModes.add(plan.queryPlan.mode);
    assert.equal(plan.queryPlan.mode, item.expected.mode, item.id);
    assert.equal(plan.queryPlan.query_order, item.expected.query_order, item.id);
    assert.equal(plan.queryPlan.selection_strategy, item.expected.selection_strategy, item.id);
    assert.equal(plan.queryPlan.has_per_query_filters, item.expected.has_per_query_filters, item.id);
    assert.deepEqual(plan.queryPlan.filter_keys, item.expected.filter_keys, item.id);

    assertQueryKind(plan.primaryRagQueries[0], item.expected.first_query_kind, item.id);
    if (item.expected.first_query_filters) {
      assert.deepEqual(plan.primaryRagQueries[0]?.filters, item.expected.first_query_filters, item.id);
    }
    if (item.expected.second_query_filters) {
      assert.deepEqual(plan.primaryRagQueries[1]?.filters, item.expected.second_query_filters, item.id);
    }
    for (const needle of item.expected.first_query_contains || []) {
      assert.match(queryText(plan.primaryRagQueries[0]), new RegExp(needle, "i"), `${item.id}: first query should contain ${needle}`);
    }
  }

  assert.equal(seenModes.has("source_focused_followup"), true);
  assert.equal(seenModes.has("broad_multi_source"), true);
  assert.equal(seenModes.has("municipality_service_benefit_list"), true);
  assert.equal(seenModes.has("topic_to_paragraphs"), true);
  assert.equal(seenModes.has("service_jurisdiction"), true);
  assert.equal(seenModes.has("temporal"), true);
  assert.equal(seenModes.has("explicit_paragraph"), true);
  assert.equal(seenModes.has("default"), true);
});
