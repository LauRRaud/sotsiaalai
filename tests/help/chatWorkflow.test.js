process.env.DATABASE_URL ??= "postgresql://user:pass@127.0.0.1:5432/sotsiaalai_test";

import test from "node:test";
import assert from "node:assert/strict";

const [
  { runHelpChatWorkflow },
  { createHelpWorkflowDraftState },
  { toHelpListingView },
  { refineHelpDraftWithAi, getHelpAiExtractorModel }
] = await Promise.all([
  import("../../lib/help/chatWorkflow.js"),
  import("../../lib/help/workflowState.js"),
  import("../../lib/help/listingViews.js"),
  import("../../lib/help/aiExtraction.js")
]);

const MUNICIPALITIES = {
  "mun-tallinn": {
    id: "mun-tallinn",
    slug: "tallinn",
    baseName: "Tallinn",
    type: "CITY",
    displayName: "Tallinn",
    county: "Harju",
    isActive: true
  },
  "mun-harku": {
    id: "mun-harku",
    slug: "harku-vald",
    baseName: "Harku",
    type: "MUNICIPALITY",
    displayName: "Harku vald",
    county: "Harju",
    isActive: true
  },
  "mun-haapsalu": {
    id: "mun-haapsalu",
    slug: "haapsalu-linn",
    baseName: "Haapsalu",
    type: "LINN",
    displayName: "Haapsalu linn",
    county: "Laane",
    isActive: true
  }
};

const HELP_CATEGORIES = {
  TRANSPORT: { id: "cat-transport", code: "TRANSPORT", labelEt: "Transport", labelEn: "Transport", labelRu: "Transport", sortOrder: 1, isActive: true, parentId: null },
  DIGITAL_HELP: { id: "cat-digital", code: "DIGITAL_HELP", labelEt: "Digiabi", labelEn: "Digital help", labelRu: "Digital help", sortOrder: 2, isActive: true, parentId: null },
  HOME_HELP: { id: "cat-home", code: "HOME_HELP", labelEt: "Koduabi", labelEn: "Home help", labelRu: "Home help", sortOrder: 3, isActive: true, parentId: null },
  ADMIN_FORM_HELP: { id: "cat-admin", code: "ADMIN_FORM_HELP", labelEt: "Asjaajamise ja vormide abi", labelEn: "Admin form help", labelRu: "Admin form help", sortOrder: 4, isActive: true, parentId: null },
  OTHER: { id: "cat-other", code: "OTHER", labelEt: "Muu abi", labelEn: "Other", labelRu: "Other", sortOrder: 99, isActive: true, parentId: null }
};

const TARGET_GROUPS = {
  CHILD: { id: "tg-child", code: "CHILD", labelEt: "Laps", labelEn: "Child", labelRu: "Child", isActive: true },
  YOUTH: { id: "tg-youth", code: "YOUTH", labelEt: "Noor", labelEn: "Youth", labelRu: "Youth", isActive: true },
  ADULT: { id: "tg-adult", code: "ADULT", labelEt: "Täiskasvanu", labelEn: "Adult", labelRu: "Adult", isActive: true },
  ELDER: { id: "tg-elder", code: "ELDER", labelEt: "Eakas", labelEn: "Elder", labelRu: "Elder", isActive: true },
  DISABILITY: { id: "tg-disability", code: "DISABILITY", labelEt: "Puue või erivajadus", labelEn: "Disability", labelRu: "Disability", isActive: true }
};

function findMunicipalityByText(where = {}) {
  const haystack = JSON.stringify(where).toLowerCase();
  if (haystack.includes("haapsalu")) return MUNICIPALITIES["mun-haapsalu"];
  if (haystack.includes("harku")) return MUNICIPALITIES["mun-harku"];
  if (haystack.includes("tallinn")) return MUNICIPALITIES["mun-tallinn"];
  return null;
}

function toTargetGroupLinks(codes = []) {
  return codes
    .map((code) => TARGET_GROUPS[code])
    .filter(Boolean)
    .map((targetGroup) => ({
      targetGroupId: targetGroup.id,
      targetGroup
    }));
}

function createPrismaStub() {
  return {
    municipality: {
      async findUnique({ where }) {
        return MUNICIPALITIES[String(where?.id || "").trim()] || null;
      },
      async findMany({ where } = {}) {
        const municipalities = Object.values(MUNICIPALITIES);
        const slugs = Array.isArray(where?.slug?.in) ? where.slug.in : [];
        if (slugs.length) return municipalities.filter((item) => slugs.includes(item.slug));
        const match = findMunicipalityByText(where);
        return match ? [match] : municipalities;
      },
      async findFirst({ where }) {
        return findMunicipalityByText(where);
      }
    },
    helpCategory: {
      async findUnique({ where }) {
        if (where?.id) {
          return Object.values(HELP_CATEGORIES).find((item) => item.id === where.id) || null;
        }
        if (where?.code) {
          return HELP_CATEGORIES[String(where.code).trim().toUpperCase()] || null;
        }
        return null;
      }
    },
    targetGroup: {
      async findMany({ where } = {}) {
        const codes = Array.isArray(where?.code?.in) ? where.code.in : Object.keys(TARGET_GROUPS);
        return codes.map((code) => TARGET_GROUPS[code]).filter(Boolean);
      }
    },
    helpRequest: {
      async findMany() {
        return [{
          id: "req-2",
          userId: "user-2",
          municipalityId: "mun-tallinn",
          primaryCategoryId: "cat-digital",
          title: "Vajan digiabi",
          description: "Vajan digiabi Tallinnas.",
          structuredSummary: "Vajan digiabi Tallinnas",
          roleLabel: "endale",
          helpType: "MIXED",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T11:00:00.000Z").toISOString(),
          municipality: MUNICIPALITIES["mun-tallinn"],
          primaryCategory: HELP_CATEGORIES.DIGITAL_HELP,
          categoryLinks: [],
          targetGroupLinks: toTargetGroupLinks(["ELDER"])
        }];
      },
      async findUnique() {
        return {
          id: "req-1",
          userId: "user-1",
          municipalityId: "mun-tallinn",
          primaryCategoryId: "cat-transport",
          title: "Vajan transpordiabi",
          description: "Vajan transpordiabi Tallinnas.",
          structuredSummary: "Vajan transpordiabi Tallinnas",
          roleLabel: "endale",
          rawPlace: "Tallinn",
          helpType: "VOLUNTARY",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          municipality: MUNICIPALITIES["mun-tallinn"],
          primaryCategory: HELP_CATEGORIES.TRANSPORT,
          categoryLinks: [],
          targetGroupLinks: toTargetGroupLinks(["ADULT"])
        };
      },
      async create({ data }) {
        const category = Object.values(HELP_CATEGORIES).find((item) => item.id === data.primaryCategoryId) || HELP_CATEGORIES.OTHER;
        return {
          id: "req-1",
          userId: data.userId,
          municipalityId: data.municipalityId,
          primaryCategoryId: data.primaryCategoryId,
          title: data.title,
          description: data.description,
          structuredSummary: data.structuredSummary,
          roleLabel: data.roleLabel,
          beneficiaryLabel: data.beneficiaryLabel,
          urgency: data.urgency,
          availabilityOrStart: data.availabilityOrStart,
          compensationDetails: data.compensationDetails,
          conditions: data.conditions,
          skillsOrBackground: data.skillsOrBackground,
          rawPlace: data.rawPlace,
          helpType: data.helpType,
          timeType: data.timeType,
          status: data.status || "OPEN",
          classificationSource: data.classificationSource || "USER",
          classificationConfidence: data.classificationConfidence ?? null,
          userConfirmedAt: data.userConfirmedAt || null,
          createdAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          municipality: MUNICIPALITIES[data.municipalityId] || null,
          primaryCategory: category,
          categoryLinks: [],
          targetGroupLinks: toTargetGroupLinks((data.targetGroupLinks?.create || []).map((item) => item.targetGroupId))
        };
      }
    },
    helpOffer: {
      async findMany() {
        return [{
          id: "offer-1",
          kind: "offer",
          userId: "user-2",
          municipalityId: "mun-tallinn",
          primaryCategoryId: "cat-transport",
          title: "Pakun transpordiabi",
          description: "Saan autoga aidata Tallinnas.",
          structuredSummary: "Pakun transpordiabi Tallinnas",
          roleLabel: "autojuht",
          helpType: "VOLUNTARY",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T10:00:00.000Z").toISOString(),
          municipality: MUNICIPALITIES["mun-tallinn"],
          primaryCategory: HELP_CATEGORIES.TRANSPORT,
          categoryLinks: [],
          targetGroupLinks: []
        }];
      },
      async findUnique({ where } = {}) {
        return {
          id: String(where?.id || "offer-1"),
          userId: "user-1",
          municipalityId: "mun-tallinn",
          primaryCategoryId: "cat-digital",
          title: "Pakun digiabi",
          description: "Pakun digiabi Tallinnas.",
          structuredSummary: "Pakun digiabi Tallinnas",
          roleLabel: "digiabi",
          helpType: "MIXED",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T10:30:00.000Z").toISOString(),
          municipality: MUNICIPALITIES["mun-tallinn"],
          primaryCategory: HELP_CATEGORIES.DIGITAL_HELP,
          categoryLinks: [],
          targetGroupLinks: toTargetGroupLinks(["ELDER", "DISABILITY"])
        };
      },
      async create({ data }) {
        const category = Object.values(HELP_CATEGORIES).find((item) => item.id === data.primaryCategoryId) || HELP_CATEGORIES.OTHER;
        return {
          id: "offer-1",
          userId: data.userId,
          municipalityId: data.municipalityId,
          primaryCategoryId: data.primaryCategoryId,
          title: data.title,
          description: data.description,
          structuredSummary: data.structuredSummary,
          roleLabel: data.roleLabel,
          providerScopeOrConditions: data.providerScopeOrConditions,
          availabilityOrStart: data.availabilityOrStart,
          compensationDetails: data.compensationDetails,
          conditions: data.conditions,
          skillsOrBackground: data.skillsOrBackground,
          rawPlace: data.rawPlace,
          helpType: data.helpType,
          timeType: data.timeType,
          status: data.status || "OPEN",
          classificationSource: data.classificationSource || "USER",
          classificationConfidence: data.classificationConfidence ?? null,
          userConfirmedAt: data.userConfirmedAt || null,
          createdAt: new Date("2026-04-05T10:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-04-05T10:00:00.000Z").toISOString(),
          municipality: MUNICIPALITIES[data.municipalityId] || null,
          primaryCategory: category,
          categoryLinks: [],
          targetGroupLinks: toTargetGroupLinks((data.targetGroupLinks?.create || []).map((item) => item.targetGroupId))
        };
      }
    }
  };
}

function createSavedRequestState(overrides = {}) {
  return createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "saved",
    step: "saved",
    flowLocked: false,
    sourceRecordId: "req-1",
    linkedRequestId: "req-1",
    municipalityId: "mun-tallinn",
    municipalityLabel: "Tallinn",
    draft: {
      title: "Vajan transpordiabi",
      description: "Vajan transpordiabi Tallinnas.",
      category: "Transport",
      categoryCode: "TRANSPORT",
      targetGroupCodes: ["ADULT"],
      targetGroups: ["Täiskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel",
      beneficiaryLabel: "endale",
      urgency: "lähiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    },
    ...overrides
  });
}

test("forced help mode treats first message as listing content and asks only missing basics", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_request",
    message: "Vajan Tabasalus transpordiabi reedel kell 19, see on ühekordne ja võib olla tasuline.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.match(String(result.workflowState?.draft?.description || ""), /transpordiabi/i);
  assert.equal(result.workflowState?.draft?.categoryCode, "TRANSPORT");
  assert.equal(result.workflowState?.activeQuestionKey, "requestAudience");
  assert.match(String(result.reply || ""), /Kellele abi vaja on\?/i);
});

test("help create flow no longer self-starts from a normal chat message", async () => {
  const result = await runHelpChatWorkflow({
    message: "Vajan Tallinnas transpordiabi reedel õhtul.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, false);
  assert.equal(result.workflowState ?? null, null);
});

test("contact preference is no longer required before preview", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_request",
    message: "Vajan Tallinnas emale transpordiabi reedel kell 19. Abi on ühekordne, lähiajal vaja ja sobib tasuline abi kokkuleppel.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "edit_or_save");
  assert.equal(result.workflowState?.draft?.contactPreference || "", "");
  assert.match(String(result.reply || ""), /Vaata abisoov üle\./i);
  assert.match(String(result.reply || ""), /Kui kuulutus sobib, vasta .*jah/i);
  assert.match(String(result.reply || ""), /Kui vastad .*ei.* saad seda muuta/i);
  assert.doesNotMatch(String(result.reply || ""), /ühendust võetaks|kontaktiviis/i);
});

test("sparse but complete offer triggers a category enrichment question", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "Digiabi eakatele Tallinnas kokkuleppel vabatahtlikult.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.activeQuestionLayer, "enrichment");
  assert.match(String(result.reply || ""), /Millega digiabis aidata saad\?/i);
});

test("short keyword answer to enrichment is accepted and stored", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_conditional_fields",
    flowLocked: true,
    activeQuestionLayer: "enrichment",
    activeQuestionKey: "create_help_offer:DIGITAL_HELP",
    askedEnrichmentKeys: ["create_help_offer:DIGITAL_HELP"],
    municipalityId: "mun-tallinn",
    municipalityLabel: "Tallinn",
    draft: {
      title: "Pakun digiabi",
      description: "Digiabi eakatele Tallinnas kokkuleppel vabatahtlikult.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroupCodes: ["ELDER"],
      targetGroups: ["Eakas"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "ID-kaardi ja e-teenustega",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "edit_or_save");
  assert.equal(result.workflowState?.draft?.providerScopeOrConditions, "ID-kaardi ja e-teenustega");
  assert.match(String(result.workflowState?.draft?.description || ""), /ID-kaardi ja e-teenustega/i);
  assert.match(String(result.reply || ""), /Vaata abipakkumine üle\./i);
});

test("offer target-group answer is clarified instead of being treated as a place", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "targetGroupCodes",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Pakun transpordiabi",
      description: "Pakun transpordiabi Tabasalus.",
      category: "Transport",
      categoryCode: "TRANSPORT",
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "nädalavahetusel õhtul kell 19"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "minule",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.rawPlace, "Tabasalu");
  assert.match(String(result.reply || ""), /kellele sinu abi on mõeldud/i);
  assert.doesNotMatch(String(result.reply || ""), /asukohaks minule/i);
});

test("rich help offer does not copy full description into timing, compensation or conditions", async () => {
  const message = [
    "Pakun abi igapäevaelus ja digiasjades",
    "",
    "Pakun abi inimestele, kes vajavad tuge igapäevaste toimetuste või digilahendustega. Aitan arvuti ja nutiseadmete kasutamisel, riigi e-teenustes orienteerumisel, dokumentide täitmisel ning lihtsamas asjaajamises.",
    "",
    "Abi sobib eelkõige eakatele ja erivajadusega inimestele.",
    "",
    "Tegutsen Tabasalu piirkonnas. Saadavus on paindlik ja kokkuleppel. Abi võib olla nii vabatahtlik kui tasuline, sõltuvalt olukorrast ja vajadusest."
  ].join("\n");

  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message,
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "collect_conditional_fields");
  assert.equal(result.workflowState?.activeQuestionKey, "create_help_offer:conditions");
  assert.equal(result.workflowState?.draft?.categoryCode, "DIGITAL_HELP");
  assert.equal(result.workflowState?.draft?.helpType, "MIXED");
  assert.equal(result.workflowState?.draft?.timeType, "FLEXIBLE");
  assert.match(String(result.workflowState?.draft?.availabilityOrStart || ""), /paindlik|kokkuleppel/i);
  assert.equal(String(result.workflowState?.draft?.compensationDetails || ""), "");
  assert.equal(String(result.workflowState?.draft?.providerScopeOrConditions || ""), "");
  assert.ok(String(result.workflowState?.draft?.title || "").length < 90);
  assert.match(String(result.reply || ""), /eritingimusi/i);
});

test("Haapsalu digital help offer keeps flexible timing and clean preview fields", async () => {
  const message = [
    "Soovin pakkuda digiabi eakatele ja puudega inimestele Haapsalus.",
    "Aitan telefoni, arvuti ja e-teenuste kasutamisega, näiteks ID-kaardi, Smart-ID, digiretseptide, pangalingi ja avalduste täitmisega.",
    "Saan aidata kokkuleppel tööpäeva õhtuti või nädalavahetusel.",
    "Abi on vabatahtlik, aga vajadusel võiks katta sõidukulu."
  ].join(" ");

  const confirmation = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message,
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(confirmation.handled, true);
  if (confirmation.workflowState?.activeQuestionKey === "municipality_confirmation") {
    assert.match(String(confirmation.reply || ""), /Haapsalu linn/i);
  }

  const afterMunicipality = confirmation.workflowState?.activeQuestionKey === "municipality_confirmation"
    ? await runHelpChatWorkflow({
        message: "jah",
        userId: "user-1",
        replyLang: "et",
        workflowState: confirmation.workflowState
      }, createPrismaStub())
    : confirmation;

  const result = afterMunicipality.workflowState?.activeQuestionKey === "create_help_offer:conditions"
    ? await runHelpChatWorkflow({
        message: "olen autoga",
        userId: "user-1",
        replyLang: "et",
        workflowState: afterMunicipality.workflowState
      }, createPrismaStub())
    : afterMunicipality;

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "edit_or_save");
  assert.equal(result.workflowState?.draft?.description.startsWith("Pakun digiabi"), true);
  assert.equal(result.workflowState?.draft?.timeType, "FLEXIBLE");
  assert.equal(result.workflowState?.draft?.providerScopeOrConditions, "olen autoga");
  assert.match(String(result.workflowState?.draft?.availabilityOrStart || ""), /kokkuleppel.*nädalavahetusel/i);
  assert.match(String(result.workflowState?.draft?.compensationDetails || ""), /sõidukulu/i);
  assert.match(String(result.reply || ""), /Ajalisus:\s*Paindlik/i);
  assert.match(String(result.reply || ""), /Tingimused:\s*olen autoga/i);
  assert.doesNotMatch(String(result.reply || ""), /^Tingimused:\s*$/m);
});

test("preview edit for offer conditions does not recategorize or geocode car text", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    municipalityId: "mun-haapsalu",
    municipalityLabel: "Haapsalu linn",
    draft: {
      title: "Pakun digiabi eakatele",
      description: "Pakun digiabi eakatele inimestele telefoni ja e-teenuste kasutamisel.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroupCodes: ["ELDER", "DISABILITY"],
      targetGroups: ["Eakas", "Puue või erivajadus"],
      rawPlace: "Haapsalus",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel"
    }
  });

  const directEdit = await runHelpChatWorkflow({
    message: "võiks muuta tingimused: olen autoga",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  assert.equal(directEdit.handled, true);
  assert.equal(directEdit.workflowState?.draft?.categoryCode, "DIGITAL_HELP");
  assert.equal(directEdit.workflowState?.draft?.rawPlace, "Haapsalus");
  assert.equal(directEdit.workflowState?.municipalityLabel, "Haapsalu linn");
  assert.equal(directEdit.workflowState?.draft?.providerScopeOrConditions, "olen autoga");
  assert.match(String(directEdit.reply || ""), /Tingimused:\s*olen autoga/i);

  const afterNo = await runHelpChatWorkflow({
    message: "ei",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  const afterPromptEdit = await runHelpChatWorkflow({
    message: "tingimused, olen autoga",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterNo.workflowState
  }, createPrismaStub());

  assert.equal(afterPromptEdit.workflowState?.draft?.categoryCode, "DIGITAL_HELP");
  assert.equal(afterPromptEdit.workflowState?.draft?.rawPlace, "Haapsalus");
  assert.equal(afterPromptEdit.workflowState?.draft?.providerScopeOrConditions, "olen autoga");
  assert.doesNotMatch(String(afterPromptEdit.reply || ""), /Tartu linn/i);
});

test("template placeholders are not treated as offer location or timing", async () => {
  const message = [
    "pealkiri: Pakun abi igapaevaelus ja asjaajamises",
    "",
    "Pakun abi inimesele, kes vajab tuge igapaevaste toimetuste, asjaajamise voi digikusimustega.",
    "Tegutsen [piirkond] piirkonnas ning olen kattesaadav [ajad voi paevad].",
    "Abi osutan kokkuleppel vabatahtlikult, tasu eest voi vastavalt olukorrale."
  ].join("\n");

  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message,
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.rawPlace || "", "");
  assert.equal(result.workflowState?.draft?.availabilityOrStart || "", "");
  assert.notEqual(result.workflowState?.activeQuestionKey || "", "timing");
  assert.doesNotMatch(String(result.reply || ""), /ning olen kattesaadav/i);
});

test("generic filler words do not satisfy the offer location question", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: [
      "Pakun digiabi eakatele ja puudega inimestele.",
      "Aitan arvuti, telefoni ja e-teenustega.",
      "Vajadusel kokkuleppel."
    ].join(" "),
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.rawPlace || "", "");
  assert.equal(result.workflowState?.activeQuestionKey || "", "rawPlace");
  assert.match(String(result.reply || ""), /kus (abi pakkuda soovid|saad aidata)/i);
});

test("initial offer follow-up question does not prepend inferred location reflection", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: [
      "Pakun abi inimesele, kes vajab tuge igapaevaelus.",
      "Tegutsen Tabasalus ja selle lahiumbruses."
    ].join(" "),
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.match(String(result.reply || ""), /Kellele sinu abi on moeldud|Kellele sinu abi on mõeldud/i);
  assert.doesNotMatch(String(result.reply || ""), /Markisin asukohaks|Märkisin asukohaks/i);
});

test("basic structured answers are not appended into offer description", async () => {
  const initialState = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "targetGroupCodes",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Igapaevaabi pakkumine",
      description: "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge.",
      category: "Igapaevaabi",
      categoryCode: "DAILY_TASKS",
      rawPlace: "Tabasalu"
    }
  });

  const afterTargetGroup = await runHelpChatWorkflow({
    message: "koik, eakad, noored, voivad olla ka puudega",
    userId: "user-1",
    replyLang: "et",
    workflowState: initialState
  }, createPrismaStub());

  assert.equal(afterTargetGroup.handled, true);
  assert.equal(
    afterTargetGroup.workflowState?.draft?.description,
    "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge."
  );

  const afterTiming = await runHelpChatWorkflow({
    message: "saan aidata teisipaeva ohtuti ja regulaarselt",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterTargetGroup.workflowState
  }, createPrismaStub());

  assert.equal(afterTiming.handled, true);
  assert.equal(
    afterTiming.workflowState?.draft?.description,
    "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge."
  );

  const afterCompensation = await runHelpChatWorkflow({
    message: "tasu eest",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterTiming.workflowState
  }, createPrismaStub());

  assert.equal(afterCompensation.handled, true);
  assert.equal(afterCompensation.workflowState?.step, "collect_conditional_fields");
  assert.equal(afterCompensation.workflowState?.activeQuestionKey, "create_help_offer:conditions");

  const afterConditions = await runHelpChatWorkflow({
    message: "ei",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCompensation.workflowState
  }, createPrismaStub());

  assert.equal(afterConditions.handled, true);
  assert.equal(afterConditions.workflowState?.step, "edit_or_save");
  assert.equal(
    afterConditions.workflowState?.draft?.description,
    "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge."
  );
  assert.doesNotMatch(String(afterConditions.reply || ""), /koik, eakad, noored/i);
});

test("offer audience answer does not become a location when place is still missing", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "offerAudience",
    draft: {
      title: "Digiabi pakkumine",
      description: "Pakun digiabi telefoni ja e-teenustega.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "eakad ja puudega inimesed",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.rawPlace || "", "");
  assert.deepEqual(result.workflowState?.draft?.targetGroupCodes, ["ELDER", "DISABILITY"]);
  assert.equal(result.workflowState?.activeQuestionKey, "rawPlace");
});

test("timing answer does not overwrite existing offer category or target group", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "timing",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi pakkumine",
      description: "Pakun digiabi telefoni ja e-teenustega.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroup: "Eakas",
      targetGroups: ["Eakas"],
      targetGroupCodes: ["ELDER"],
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "saan aidata dokumentidega teisipaeva ohtuti",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.categoryCode, "DIGITAL_HELP");
  assert.equal(result.workflowState?.draft?.category, "Digiabi");
  assert.deepEqual(result.workflowState?.draft?.targetGroupCodes, ["ELDER"]);
  assert.match(String(result.workflowState?.draft?.availabilityOrStart || ""), /teisipaeva ohtuti/i);
});

test("help AI extractor defaults to nano and skips without an API key", async () => {
  const result = await refineHelpDraftWithAi({
    state: createHelpWorkflowDraftState({
      intent: "create_help_offer",
      activeQuestionKey: "description",
      draft: {
        description: "Pakun digiabi eakatele."
      }
    }),
    message: "Pakun digiabi eakatele.",
    env: {
      HELP_WORKFLOW_AI_EXTRACTOR: "1"
    }
  });

  assert.equal(getHelpAiExtractorModel({}), "gpt-5.4-nano");
  assert.equal(result, null);
});

test("help AI patcher can refine draft before the next question", async () => {
  let called = false;
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "Pakun abi eakatele.",
    userId: "user-1",
    replyLang: "et",
    aiDraftPatcher: async ({ state, createHelpWorkflowDraftState: makeState }) => {
      called = true;
      return makeState({
        ...state,
        draft: {
          ...state.draft,
          description: "Pakun digiabi eakatele inimestele telefoni, arvuti ja e-teenuste kasutamisel kokkulepitud ajal.",
          category: "Digiabi",
          categoryCode: "DIGITAL_HELP",
          rawPlace: "Tabasalu",
          helpType: "VOLUNTARY",
          timeType: "FLEXIBLE",
          availabilityOrStart: "kokkuleppel",
          providerScopeOrConditions: "kokkuleppel",
          targetGroup: "Eakas",
          targetGroups: ["Eakas"],
          targetGroupCodes: ["ELDER"]
        }
      });
    }
  }, createPrismaStub());

  assert.equal(called, true);
  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "edit_or_save");
  assert.equal(result.workflowState?.draft?.categoryCode, "DIGITAL_HELP");
  assert.equal(result.workflowState?.draft?.rawPlace, "Tabasalu");
});

test("low-signal offer input does not become a prefixed auto-title", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "dffdfdf",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.title, "Abipakkumine");
  assert.doesNotMatch(String(result.reply || ""), /Markisin pealkirjaks|Märkisin pealkirjaks/i);
  assert.match(String(result.reply || ""), /Mis liiki abiga on tegu\?/i);
});

test("explicit title line is stored as title without being copied into description", async () => {
  const result = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: [
      "pealkiri: Digiabi koju",
      "",
      "Aitan Tabasalus telefoni ja e-teenustega kokkuleppel."
    ].join("\n"),
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.title, "Digiabi koju");
  assert.doesNotMatch(String(result.workflowState?.draft?.description || ""), /^Digiabi koju/i);
  assert.match(String(result.workflowState?.draft?.description || ""), /Tabasalus telefoni ja e-teenustega kokkuleppel/i);
});

test("category fallback title is human-readable when description is low-signal", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "availability",
    municipalityId: "mun-tallinn",
    municipalityLabel: "Tallinn",
    draft: {
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      rawPlace: "Tallinn"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "dffdfdf",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.title, "Digiabi pakkumine");
});

test("saving a help request immediately shows matching offers", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    municipalityId: "mun-tallinn",
    municipalityLabel: "Tallinn",
    draft: {
      title: "Vajan transpordiabi",
      description: "Vajan transpordiabi Tallinnas.",
      category: "Transport",
      categoryCode: "TRANSPORT",
      targetGroupCodes: ["ADULT"],
      targetGroups: ["Täiskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel",
      beneficiaryLabel: "endale",
      urgency: "lähiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.equal(result.workflowState?.mode, "browse");
  assert.match(String(result.reply || ""), /Abisoov on salvestatud/i);
  assert.match(String(result.reply || ""), /lisatud abisoovide seinale/i);
  assert.match(String(result.reply || ""), /leidub sobivaid abipakkumisi/i);
  assert.doesNotMatch(String(result.reply || ""), /Staatus:\s*Aktiivne/i);
  assert.match(String(result.reply || ""), /Leidsin 1/i);
  assert.match(String(result.reply || ""), /1\. Pakun transpordiabi/i);
});

test("saving a help offer immediately shows matching requests", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    municipalityId: "mun-tallinn",
    municipalityLabel: "Tallinn",
    draft: {
      title: "Pakun digiabi",
      description: "Pakun digiabi Tallinnas.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroupCodes: ["ELDER", "DISABILITY"],
      targetGroups: ["Eakas", "Puue vĆµi erivajadus"],
      rawPlace: "Tallinn",
      helpType: "MIXED",
      timeType: "FLEXIBLE",
      availabilityOrStart: "kokkuleppel",
      structuredSummary: "Pakun digiabi Tallinnas"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_requests");
  assert.equal(result.workflowState?.mode, "browse");
  assert.match(String(result.reply || ""), /Abipakkumine on salvestatud/i);
  assert.match(String(result.reply || ""), /leidub sobivaid abisoove/i);
  assert.doesNotMatch(String(result.reply || ""), /Staatus:\s*Aktiivne/i);
  assert.match(String(result.reply || ""), /Leidsin 1/i);
  assert.match(String(result.reply || ""), /1\. Vajan digiabi/i);
});

test("saved help request can still transition into browse flow", async () => {
  const result = await runHelpChatWorkflow({
    message: "Sirvi sobivaid abipakkumisi",
    userId: "user-1",
    replyLang: "et",
    workflowState: createSavedRequestState()
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.equal(result.workflowState?.mode, "browse");
  assert.match(String(result.reply || ""), /Leidsin 1/i);
});

test("listing view strips repeated title from structured summary", () => {
  const title = "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisat";
  const listing = toHelpListingView({
    kind: "offer",
    title,
    structuredSummary: `${title} Ā· Tabasalu Ā· Harku vald Ā· Tasuline abi Ā· Regulaarne`,
    description:
      "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge. Tegutsen Tabasalus."
  }, { kind: "offer", locale: "et" });

  assert.equal(listing.summary, "Tabasalu | Harku vald | Tasuline abi | Regulaarne");
});

test("listing view summary fallback skips the repeated opening sentence", () => {
  const listing = toHelpListingView({
    kind: "offer",
    title: "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisat",
    description:
      "Pakun abi inimesele voi perele, kes vajab igapaevaelus veidi lisatuge. Monikord on elus perioode, kus koigega uksi toime tulla on keeruline. Olen valmis aitama rahulikult ja lugupidavalt."
  }, { kind: "offer", locale: "et" });

  assert.match(listing.summary, /^Monikord on elus perioode/);
  assert.doesNotMatch(listing.summary, /^Pakun abi inimesele voi perele/);
});
