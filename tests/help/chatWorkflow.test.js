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
  DISABILITY: { id: "tg-disability", code: "DISABILITY", labelEt: "Erivajadus", labelEn: "Disability", labelRu: "Disability", isActive: true }
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

function createAlternativeOfferPrismaStub(overrides = {}, options = {}) {
  const prisma = createPrismaStub();
  const alternativeOffer = {
    id: "offer-paid-1",
    userId: "user-2",
    municipalityId: "mun-tallinn",
    primaryCategoryId: "cat-transport",
    title: "Tasuline transpordiabi",
    description: "Pakun transpordiabi Tallinnas tasu eest.",
    structuredSummary: "Pakun transpordiabi Tallinnas tasu eest",
    roleLabel: "autojuht",
    helpType: "PAID",
    timeType: "FLEXIBLE",
    status: "OPEN",
    createdAt: new Date("2026-04-05T10:00:00.000Z").toISOString(),
    municipality: MUNICIPALITIES["mun-tallinn"],
    primaryCategory: HELP_CATEGORIES.TRANSPORT,
    categoryLinks: [],
    targetGroupLinks: toTargetGroupLinks(["ADULT"]),
    ...overrides
  };

  prisma.helpOffer.findMany = async () => [alternativeOffer];
  prisma.helpOffer.findUnique = async ({ where } = {}) => ({
    ...alternativeOffer,
    id: String(where?.id || alternativeOffer.id)
  });
  if (options?.requestOverride) {
    const requestOverride = options.requestOverride;
    prisma.helpRequest.findUnique = async () => ({
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
      targetGroupLinks: toTargetGroupLinks(["ADULT"]),
      ...requestOverride
    });
  }

  prisma.room = {
    async findUnique() {
      return null;
    },
    async create() {
      return { id: "room-1" };
    }
  };

  prisma.helpMatch = {
    async findUnique() {
      return null;
    },
    async create({ data }) {
      return {
        id: "match-1",
        requestId: data.requestId,
        offerId: data.offerId,
        requesterId: data.requesterId,
        offererId: data.offererId,
        roomId: data.roomId,
        status: data.status,
        scoreSnapshot: data.scoreSnapshot,
        reasonsJson: data.reasonsJson,
        createdAt: new Date("2026-04-05T12:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-04-05T12:00:00.000Z").toISOString()
      };
    },
    async update({ data }) {
      return {
        id: "match-1",
        roomId: data.roomId,
        status: data.status,
        scoreSnapshot: data.scoreSnapshot,
        reasonsJson: data.reasonsJson,
        updatedAt: new Date("2026-04-05T12:00:00.000Z").toISOString()
      };
    }
  };

  prisma.$transaction = async (callback) => callback(prisma);

  return prisma;
}

function createMultiOfferPrismaStub(offers = [], options = {}) {
  const normalizedOffers = (Array.isArray(offers) ? offers : []).map((offer, index) => ({
    id: offer.id || `offer-${index + 1}`,
    userId: offer.userId || `user-${index + 2}`,
    municipalityId: offer.municipalityId || "mun-tallinn",
    primaryCategoryId: offer.primaryCategoryId || "cat-transport",
    title: offer.title || `Pakkumine ${index + 1}`,
    description: offer.description || `Kirjeldus ${index + 1}`,
    structuredSummary: offer.structuredSummary || offer.description || `Kirjeldus ${index + 1}`,
    roleLabel: offer.roleLabel || "abiline",
    helpType: offer.helpType || "VOLUNTARY",
    timeType: offer.timeType || "FLEXIBLE",
    status: offer.status || "OPEN",
    createdAt: offer.createdAt || new Date("2026-04-05T10:00:00.000Z").toISOString(),
    municipality: offer.municipality || MUNICIPALITIES["mun-tallinn"],
    primaryCategory: offer.primaryCategory || HELP_CATEGORIES.TRANSPORT,
    categoryLinks: offer.categoryLinks || [],
    targetGroupLinks: offer.targetGroupLinks || toTargetGroupLinks(["ADULT"]),
    ...offer
  }));

  const prisma = createAlternativeOfferPrismaStub(normalizedOffers[0] || {}, options);
  prisma.createdMatches = [];
  prisma.helpOffer.findMany = async () => normalizedOffers;
  prisma.helpOffer.findUnique = async ({ where } = {}) => {
    const id = String(where?.id || normalizedOffers[0]?.id || "");
    return normalizedOffers.find((item) => item.id === id) || null;
  };

  let roomCounter = 0;
  let matchCounter = 0;
  prisma.room.create = async () => ({ id: `room-${++roomCounter}` });
  prisma.helpMatch.findUnique = async () => null;
  prisma.helpMatch.create = async ({ data }) => {
    const record = {
      id: `match-${++matchCounter}`,
      requestId: data.requestId,
      offerId: data.offerId,
      requesterId: data.requesterId,
      offererId: data.offererId,
      roomId: data.roomId,
      status: data.status,
      scoreSnapshot: data.scoreSnapshot,
      reasonsJson: data.reasonsJson,
      createdAt: new Date("2026-04-05T12:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-04-05T12:00:00.000Z").toISOString()
    };
    prisma.createdMatches.push(record);
    return record;
  };

  return prisma;
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
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "Lähiajal",
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
  assert.match(String(result.reply || ""), /Kui abisoov sobib, vasta .*jah/i);
  assert.match(String(result.reply || ""), /Kui soovid abisoovi muuta, tee seda abisoovi lehel/i);
  assert.doesNotMatch(String(result.reply || ""), /Kui vastad .*ei/i);
  assert.doesNotMatch(String(result.reply || ""), /ühendust võetaks|kontaktiviis/i);
});

test("request flow recognizes partitive voluntary answer and does not corrupt availability", async () => {
  const start = await runHelpChatWorkflow({
    forcedIntent: "create_help_request",
    message: "Soovin abi SotsiaalAI platvormi kasutamisega alustamisel. Vajan juhendamist, kuidas leida infot, juhiseid ja tuge. Sobiv aeg kokkuleppel. Asun Tabasalus.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(start.handled, true);
  assert.equal(start.workflowState?.activeQuestionKey, "categoryCode");

  const afterCategory = await runHelpChatWorkflow({
    message: "digiabi",
    userId: "user-1",
    replyLang: "et",
    workflowState: start.workflowState
  }, createPrismaStub());

  assert.equal(afterCategory.handled, true);
  assert.equal(afterCategory.workflowState?.activeQuestionKey, "requestAudience");

  const afterAudience = await runHelpChatWorkflow({
    message: "endale, olen noor",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCategory.workflowState
  }, createPrismaStub());

  assert.equal(afterAudience.handled, true);
  assert.equal(afterAudience.workflowState?.activeQuestionKey, "timing");

  const afterTiming = await runHelpChatWorkflow({
    message: "kokkuleppel, ühekordne abi, ei ole kiire",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAudience.workflowState
  }, createPrismaStub());

  assert.equal(afterTiming.handled, true);
  assert.equal(afterTiming.workflowState?.activeQuestionKey, "helpCompensation");

  const afterCompensation = await runHelpChatWorkflow({
    message: "vabatahtlikku",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterTiming.workflowState
  }, createPrismaStub());

  assert.equal(afterCompensation.handled, true);
  assert.equal(afterCompensation.workflowState?.draft?.helpType, "VOLUNTARY");
  assert.match(String(afterCompensation.workflowState?.draft?.availabilityOrStart || ""), /kokkuleppel/i);
  assert.doesNotMatch(String(afterCompensation.workflowState?.draft?.availabilityOrStart || ""), /vabatahtlik/i);
  assert.notEqual(afterCompensation.workflowState?.activeQuestionKey, "helpCompensation");
});

test("request flow recognizes short mixed-compensation answer", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "helpCompensation",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi soov",
      description: "Soovin abi SotsiaalAI platvormi kasutamisel Tabasalus.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroupCodes: ["YOUTH"],
      targetGroups: ["Noor"],
      rawPlace: "Tabasalu",
      timeType: "ONE_TIME",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "Paindlik"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "avatud mõlemale",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.helpType, "MIXED");
  assert.notEqual(result.workflowState?.activeQuestionKey, "helpCompensation");
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
  assert.equal(result.workflowState?.draft?.providerScopeOrConditions || "", "");
  assert.equal(result.workflowState?.draft?.extraNotes, "ID-kaardi ja e-teenustega");
  assert.match(String(result.workflowState?.draft?.description || ""), /ID-kaardi ja e-teenustega/i);
  assert.match(String(result.reply || ""), /Vaata abipakkumine üle\./i);
  assert.match(String(result.reply || ""), /Kui abipakkumine sobib, vasta .*jah/i);
  assert.match(String(result.reply || ""), /Kui soovid abipakkumist muuta, tee seda abipakkumise lehel/i);
  assert.doesNotMatch(String(result.reply || ""), /Kui vastad .*ei/i);
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
  assert.match(String(result.reply || ""), /kellele pakkumine sobib/i);
  assert.doesNotMatch(String(result.reply || ""), /asukohaks minule/i);
});

test("offer audience all age groups is normalized and reflected without malformed location case", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "offerAudience",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi pakkumine",
      description: "Pakun tasuta juhendamist SotsiaalAI platvormi kasutamisel Tabasalus.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Abi toimub kokkuleppel"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "kõik vanusegrupid",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.deepEqual(result.workflowState?.draft?.targetGroups, ["Kõik vanusegrupid"]);
  assert.deepEqual(result.workflowState?.draft?.targetGroupCodes, ["CHILD", "YOUTH", "ADULT", "ELDER", "DISABILITY"]);
  assert.match(String(result.reply || ""), /Kas pakkumise juurde peaks lisama eritingimusi/i);
  assert.doesNotMatch(String(result.reply || ""), /Sain aru/i);
  assert.doesNotMatch(String(result.reply || ""), /Sihtrühm: Kõik vanusegrupid\./);
  assert.doesNotMatch(String(result.reply || ""), /Asukoht: Tabasalu\./);
  assert.doesNotMatch(String(result.reply || ""), /digiabi Tabasalu/i);
});

test("request audience and timing answers complete target group and one-time availability", async () => {
  const state = createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "draft",
    step: "collect_required_fields",
    flowLocked: true,
    activeQuestionLayer: "basic",
    activeQuestionKey: "requestAudience",
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi soov",
      description: "Vajan abi SotsiaalAI platvormi kasutamisel Tabasalus.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY"
    }
  });

  const afterAudience = await runHelpChatWorkflow({
    message: "endale, täisealine",
    userId: "user-1",
    replyLang: "et",
    workflowState: state
  }, createPrismaStub());

  assert.equal(afterAudience.handled, true);
  assert.equal(afterAudience.workflowState?.draft?.beneficiaryLabel, "Endale");
  assert.deepEqual(afterAudience.workflowState?.draft?.targetGroupCodes, ["ADULT"]);
  assert.match(String(afterAudience.reply || ""), /Millal abi vaja on/i);
  assert.doesNotMatch(String(afterAudience.reply || ""), /Sain aru/i);

  const afterTiming = await runHelpChatWorkflow({
    message: "ühekordne, reede õhtul",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAudience.workflowState
  }, createPrismaStub());

  assert.equal(afterTiming.handled, true);
  assert.equal(afterTiming.workflowState?.draft?.timeType, "ONE_TIME");
  assert.match(String(afterTiming.workflowState?.draft?.availabilityOrStart || ""), /reede/i);
  assert.equal(afterTiming.workflowState?.draft?.urgency, "Lähiajal");
  assert.match(String(afterTiming.reply || ""), /Vaata abisoov üle\./i);
  assert.match(String(afterTiming.reply || ""), /Sihtrühm:\s*Täiskasvanu/i);
  assert.match(String(afterTiming.reply || ""), /Ajalisus:\s*Ühekordne/i);
  assert.doesNotMatch(String(afterTiming.reply || ""), /Millal abi vaja on/i);
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
  assert.doesNotMatch(String(result.workflowState?.draft?.description || ""), /olen autoga/i);
  assert.equal(result.workflowState?.draft?.timeType, "FLEXIBLE");
  assert.equal(result.workflowState?.draft?.providerScopeOrConditions, "Olen autoga");
  assert.match(String(result.workflowState?.draft?.availabilityOrStart || ""), /kokkuleppel.*nädalavahetusel/i);
  assert.match(String(result.workflowState?.draft?.compensationDetails || ""), /sõidukulu/i);
  assert.match(String(result.reply || ""), /Ajalisus:\s*Paindlik/i);
  assert.match(String(result.reply || ""), /Tingimused:\s*Olen autoga/i);
  assert.doesNotMatch(String(result.reply || ""), /^Tingimused:\s*$/m);
});

test("preview edit text points to offer page and does not mutate the draft", async () => {
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
      targetGroups: ["Eakas", "Erivajadus"],
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
  assert.equal(directEdit.workflowState?.draft?.providerScopeOrConditions || "", "");
  assert.match(String(directEdit.reply || ""), /abipakkumise lehel/i);

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
  assert.equal(afterPromptEdit.workflowState?.draft?.providerScopeOrConditions || "", "");
  assert.match(String(afterPromptEdit.reply || ""), /abipakkumise lehel/i);
  assert.doesNotMatch(String(afterPromptEdit.reply || ""), /Tartu linn/i);
});

test("preview freeform wording edit points to offer page and does not append", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    askedEnrichmentKeys: ["create_help_offer:conditions"],
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi pakkumine",
      description: "Pakun tasuta juhendamist SotsiaalAI platvormi tutvustamisel ja kasutamisel Tabasalus. Aitan aru saada, kust alustada, milline reziim voi funktsioon voiks sobida ning kuidas platvormi samm-sammult kasutada. Abi toimub kokkuleppel ja on vabatahtlik.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroups: ["Koigile"],
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Abi toimub kokkuleppel"
    }
  });

  const afterNo = await runHelpChatWorkflow({
    message: "ei",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  const newDescription = "Pakun tasuta juhendamist SotsiaalAI platvormi kasutamisel Tabasalus. Aitan teha esimesed sammud, tutvustan platvormi voimalusi ning selgitan, kuidas seda enda kusimuste ja vajaduste puhul kasutada. Abi toimub kokkuleppel ja on vabatahtlik.";
  const result = await runHelpChatWorkflow({
    message: newDescription,
    userId: "user-1",
    replyLang: "et",
    workflowState: afterNo.workflowState
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.step, "edit_or_save");
  assert.equal(result.workflowState?.draft?.title, "Digiabi pakkumine");
  assert.notEqual(result.workflowState?.draft?.description, newDescription);
  assert.match(String(result.workflowState?.draft?.description || ""), /kust alustada|samm-sammult/i);
  assert.match(String(result.reply || ""), /abipakkumise lehel/i);
  assert.doesNotMatch(String(result.reply || ""), /Aitan teha esimesed sammud/i);
  assert.equal(result.workflowState?.draft?.helpType, "VOLUNTARY");
  assert.equal(result.workflowState?.draft?.timeType, "FLEXIBLE");
  assert.equal(result.workflowState?.draft?.availabilityOrStart, "Abi toimub kokkuleppel");
  assert.equal(result.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(result.workflowState?.draft?.rawPlace, "Tabasalu");
});

test("preview single sentence wording edit is not treated as full replacement", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_offer",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    municipalityId: "mun-harku",
    municipalityLabel: "Harku vald",
    draft: {
      title: "Digiabi pakkumine",
      description: "Pakun tasuta juhendamist SotsiaalAI platvormi tutvustamisel ja kasutamisel Tabasalus. Aitan aru saada, kust alustada, milline reziim voi funktsioon voiks sobida ning kuidas platvormi samm-sammult kasutada. Abi toimub kokkuleppel ja on vabatahtlik.",
      category: "Digiabi",
      categoryCode: "DIGITAL_HELP",
      targetGroups: ["Koigile"],
      rawPlace: "Tabasalu",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Abi toimub kokkuleppel"
    }
  });

  const afterNo = await runHelpChatWorkflow({
    message: "ei",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createPrismaStub());

  const result = await runHelpChatWorkflow({
    message: "Aitan teha esimesed sammud, tutvustan platvormi voimalusi ning selgitan, kuidas seda enda kusimuste ja vajaduste puhul kasutada.",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterNo.workflowState
  }, createPrismaStub());

  assert.equal(result.handled, true);
  assert.doesNotMatch(String(result.workflowState?.draft?.description || ""), /Aitan teha esimesed sammud/i);
  assert.match(String(result.workflowState?.draft?.description || ""), /Pakun tasuta juhendamist/i);
  assert.match(String(result.reply || ""), /abipakkumise lehel/i);
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
  assert.match(String(result.reply || ""), /Kellele see pakkumine sobib/i);
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

test("offer flow keeps category details and Vääna location from sparse conversation", async () => {
  const start = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "tahaks kedagi Väänas abistada",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  assert.equal(start.handled, true);
  assert.equal(start.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(start.workflowState?.draft?.rawPlace, "Vääna");
  assert.equal(start.workflowState?.activeQuestionKey, "categoryCode");

  const afterCategory = await runHelpChatWorkflow({
    message: "koduabi, pesen põrandat",
    userId: "user-1",
    replyLang: "et",
    workflowState: start.workflowState
  }, createPrismaStub());

  assert.equal(afterCategory.handled, true);
  assert.equal(afterCategory.workflowState?.draft?.categoryCode, "HOME_HELP");
  assert.match(String(afterCategory.workflowState?.draft?.description || ""), /pesen põrandat/i);
  assert.equal(afterCategory.workflowState?.activeQuestionKey, "offerAudience");

  const afterAudience = await runHelpChatWorkflow({
    message: "noor",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCategory.workflowState
  }, createPrismaStub());

  assert.equal(afterAudience.handled, true);
  assert.deepEqual(afterAudience.workflowState?.draft?.targetGroupCodes, ["YOUTH"]);
  assert.equal(afterAudience.workflowState?.activeQuestionKey, "timing");

  const afterAvailability = await runHelpChatWorkflow({
    message: "neljapäeva õhtul kell 18.30",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAudience.workflowState
  }, createPrismaStub());

  assert.equal(afterAvailability.handled, true);
  assert.equal(afterAvailability.workflowState?.activeQuestionKey, "timing");
  assert.match(String(afterAvailability.reply || ""), /Kas see on .*regulaarne.*paindlik abi/i);
  assert.doesNotMatch(String(afterAvailability.reply || ""), /Millal saad aidata/i);

  const afterTimeType = await runHelpChatWorkflow({
    message: "ühekordne",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAvailability.workflowState
  }, createPrismaStub());

  assert.equal(afterTimeType.handled, true);
  assert.equal(afterTimeType.workflowState?.draft?.timeType, "ONE_TIME");
  assert.equal(afterTimeType.workflowState?.activeQuestionKey, "helpCompensation");

  const afterCompensation = await runHelpChatWorkflow({
    message: "tasu eest, 10 eur tunnis",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterTimeType.workflowState
  }, createPrismaStub());

  assert.equal(afterCompensation.handled, true);
  assert.equal(afterCompensation.workflowState?.draft?.helpType, "PAID");
  assert.match(String(afterCompensation.workflowState?.draft?.compensationDetails || ""), /tasu eest, 10 eur tunnis/i);
  assert.notEqual(afterCompensation.workflowState?.activeQuestionKey, "create_help_offer:HOME_HELP");
  assert.doesNotMatch(String(afterCompensation.reply || ""), /Millega saad koduabis aidata/i);

  const finalResult = afterCompensation.workflowState?.activeQuestionKey === "create_help_offer:conditions"
    ? await runHelpChatWorkflow({
        message: "ei",
        userId: "user-1",
        replyLang: "et",
        workflowState: afterCompensation.workflowState
      }, createPrismaStub())
    : afterCompensation;

  assert.equal(finalResult.workflowState?.step, "edit_or_save");
  assert.equal(finalResult.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(finalResult.workflowState?.draft?.rawPlace, "Vääna");
  assert.match(String(finalResult.workflowState?.draft?.description || ""), /pesen põrandat/i);
  assert.doesNotMatch(String(finalResult.workflowState?.draft?.description || ""), /ma juba ütlesin/i);
  assert.equal(finalResult.workflowState?.draft?.providerScopeOrConditions || "", "");
});

test("offer flow drops vague intent phrase from final title and description", async () => {
  const start = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "tahaks kedagi Vaanas abistada",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  const afterCategory = await runHelpChatWorkflow({
    message: "koduabi, pesen porandaid, koristan kooki",
    userId: "user-1",
    replyLang: "et",
    workflowState: start.workflowState
  }, createPrismaStub());

  const afterAudience = await runHelpChatWorkflow({
    message: "eakas, erivajadusega",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCategory.workflowState
  }, createPrismaStub());

  const afterTiming = await runHelpChatWorkflow({
    message: "teisipaeva ohtul kell 19.00, uhekordne",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAudience.workflowState
  }, createPrismaStub());

  const afterCompensation = await runHelpChatWorkflow({
    message: "tasu eest peamiselt, 10 eurot tund",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterTiming.workflowState
  }, createPrismaStub());

  const finalResult = afterCompensation.workflowState?.activeQuestionKey === "create_help_offer:conditions"
    ? await runHelpChatWorkflow({
        message: "ei ole",
        userId: "user-1",
        replyLang: "et",
        workflowState: afterCompensation.workflowState
      }, createPrismaStub())
    : afterCompensation;

  assert.equal(finalResult.workflowState?.step, "edit_or_save");
  assert.equal(finalResult.workflowState?.draft?.title, "Koduabi pakkumine");
  assert.equal(finalResult.workflowState?.draft?.categoryCode, "HOME_HELP");
  assert.deepEqual(finalResult.workflowState?.draft?.targetGroupCodes, ["ELDER", "DISABILITY"]);
  assert.match(String(finalResult.workflowState?.draft?.description || ""), /pesen porandaid/i);
  assert.doesNotMatch(String(finalResult.workflowState?.draft?.description || ""), /tahaks|kedagi|abistada/i);
  assert.match(String(finalResult.workflowState?.draft?.availabilityOrStart || ""), /teisipaeva ohtul kell 19\.00/i);
  assert.doesNotMatch(String(finalResult.workflowState?.draft?.availabilityOrStart || ""), /uhekordne|\u00fchekordne/i);
  assert.equal(finalResult.workflowState?.draft?.timeType, "ONE_TIME");
  assert.match(String(finalResult.workflowState?.draft?.compensationDetails || ""), /10 eurot tund/i);
});

test("offer availability keeps kokkuleppel when later timing adds weekdays", async () => {
  const start = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "Pakun tasuta juhendamist SotsiaalAI platvormi kasutamisel Tabasalus. Aitan alustada, tutvustan platvormi võimalusi ning näitan, kuidas sealt infot, juhiseid ja tuge leida. Sobiva aja saame omavahel kokku leppida.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  const afterCategory = await runHelpChatWorkflow({
    message: "digiabi",
    userId: "user-1",
    replyLang: "et",
    workflowState: start.workflowState
  }, createPrismaStub());

  const afterAudience = await runHelpChatWorkflow({
    message: "kõigile vanusegruppidele",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCategory.workflowState
  }, createPrismaStub());

  const afterTiming = await runHelpChatWorkflow({
    message: "tööpäevadel, ühekordne abi",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterAudience.workflowState
  }, createPrismaStub());

  const finalResult = afterTiming.workflowState?.activeQuestionKey === "create_help_offer:conditions"
    ? await runHelpChatWorkflow({
        message: "ei",
        userId: "user-1",
        replyLang: "et",
        workflowState: afterTiming.workflowState
      }, createPrismaStub())
    : afterTiming;

  assert.equal(finalResult.handled, true);
  assert.match(String(finalResult.workflowState?.draft?.availabilityOrStart || ""), /tööpäevadel/i);
  assert.match(String(finalResult.workflowState?.draft?.availabilityOrStart || ""), /kokkuleppel/i);
  assert.equal(finalResult.workflowState?.draft?.timeType, "ONE_TIME");
  assert.match(String(finalResult.reply || ""), /Saadavus \/ algus:\s*Tööpäevadel, kokkuleppel/i);
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

test("category answer replaces generated long title and strips help type from availability", async () => {
  const initial = await runHelpChatWorkflow({
    forcedIntent: "create_help_offer",
    message: "Pakun tasuta juhendamist SotsiaalAI platvormi tutvustamisel ja kasutamisel Tabasalus. Aitan aru saada, kust alustada, milline reziim voi funktsioon voiks sobida ning kuidas platvormi samm-sammult kasutada. Abi toimub kokkuleppel ja on vabatahtlik.",
    userId: "user-1",
    replyLang: "et"
  }, createPrismaStub());

  const afterCategory = await runHelpChatWorkflow({
    message: "digiabi",
    userId: "user-1",
    replyLang: "et",
    workflowState: initial.workflowState
  }, createPrismaStub());

  const afterAudience = await runHelpChatWorkflow({
    message: "Kõigile vanusegruppidele",
    userId: "user-1",
    replyLang: "et",
    workflowState: afterCategory.workflowState
  }, createPrismaStub());

  const result = afterAudience.workflowState?.activeQuestionKey === "create_help_offer:conditions"
    ? await runHelpChatWorkflow({
        message: "ei",
        userId: "user-1",
        replyLang: "et",
        workflowState: afterAudience.workflowState
      }, createPrismaStub())
    : afterAudience;

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.draft?.title, "Digiabi pakkumine");
  assert.equal(result.workflowState?.draft?.availabilityOrStart, "Abi toimub kokkuleppel");
  assert.match(String(result.reply || ""), /Pealkiri:\s*Digiabi pakkumine/i);
  assert.match(String(result.reply || ""), /Saadavus \/ algus:\s*Abi toimub kokkuleppel/i);
  assert.doesNotMatch(String(result.reply || ""), /Saadavus \/ algus:\s*.*vabatahtlik/i);
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
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "Lähiajal",
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

test("saving a help request can show a similar offer when compensation differs", async () => {
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
      targetGroups: ["TĆ¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LĆ¤hiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createAlternativeOfferPrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.equal(result.workflowState?.mode, "browse");
  assert.match(String(result.reply || ""), /sarnast abipakkumist/i);
  assert.match(String(result.reply || ""), /mõni tingimus erineb/i);
  assert.match(String(result.reply || ""), /sinu kuulutuses on vabatahtlik abi/i);
  assert.match(String(result.reply || ""), /sellel kuulutusel on tasuline abi/i);
  assert.equal(result.workflowState?.browseResults?.[0]?.requiresConfirmation, true);
});

test("saving a help request can show a similar offer when timing differs", async () => {
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
      targetGroups: ["TĆ¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "ONE_TIME",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LĆ¤hiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createAlternativeOfferPrismaStub({
    id: "offer-time-1",
    title: "Regulaarne transpordiabi",
    description: "Pakun transpordiabi Tallinnas regulaarselt.",
    structuredSummary: "Pakun transpordiabi Tallinnas regulaarselt",
    helpType: "VOLUNTARY",
    timeType: "RECURRING"
  }, {
    requestOverride: {
      timeType: "ONE_TIME"
    }
  }));

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.match(String(result.reply || ""), /mõni tingimus erineb/i);
  assert.match(String(result.reply || ""), /ajalisuse erinevus/i);
  assert.match(String(result.reply || ""), /ühekordne/i);
  assert.match(String(result.reply || ""), /regulaarne/i);
  assert.equal(result.workflowState?.browseResults?.[0]?.requiresConfirmation, true);
});

test("browse reply asks for offer numbers and allows multiple selections", async () => {
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
      targetGroups: ["TÄ†Ā¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LÄ†Ā¤hiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    }
  });

  const result = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: previewState
  }, createMultiOfferPrismaStub([
    {
      id: "offer-vol-1",
      title: "Vabatahtlik transpordiabi",
      description: "Pakun transpordiabi Tallinnas vabatahtlikult.",
      structuredSummary: "Pakun transpordiabi Tallinnas vabatahtlikult",
      helpType: "VOLUNTARY"
    },
    {
      id: "offer-vol-2",
      title: "Teine transpordiabi",
      description: "Aitan transpordiga kokkuleppel.",
      structuredSummary: "Aitan transpordiga kokkuleppel",
      helpType: "VOLUNTARY"
    }
  ]));

  assert.equal(result.handled, true);
  assert.match(String(result.reply || ""), /Leidsin 2/i);
  assert.match(String(result.reply || ""), /kirjuta pakkumise number/i);
  assert.match(String(result.reply || ""), /1,2/i);
  assert.match(String(result.reply || ""), /kõigiga/i);
});

test("connecting to a similar offer asks confirmation before creating the match", async () => {
  const prisma = createAlternativeOfferPrismaStub();
  const browseState = createHelpWorkflowDraftState({
    intent: "connect_to_offer",
    mode: "browse",
    step: "connect",
    flowLocked: true,
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
      targetGroups: ["TĆ¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LĆ¤hiajal"
    },
    browseResults: [{
      id: "offer-paid-1",
      kind: "offer",
      title: "Tasuline transpordiabi",
      description: "Pakun transpordiabi Tallinnas tasu eest.",
      municipalityName: "Tallinn",
      score: 65,
      helpType: "PAID",
      timeType: "FLEXIBLE",
      compatibilityWarnings: ["help_type_mismatch"],
      requiresConfirmation: true
    }]
  });

  const confirmation = await runHelpChatWorkflow({
    message: "1",
    userId: "user-1",
    replyLang: "et",
    workflowState: browseState
  }, prisma);

  assert.equal(confirmation.handled, true);
  assert.equal(confirmation.workflowState?.step, "connect");
  assert.equal(confirmation.workflowState?.confirmationPending, true);
  assert.equal(confirmation.workflowState?.candidateOfferId, "offer-paid-1");
  assert.match(String(confirmation.reply || ""), /mõni tingimus erineb/i);
  assert.match(String(confirmation.reply || ""), /vabatahtlik abi/i);
  assert.match(String(confirmation.reply || ""), /tasuline abi/i);
  assert.match(String(confirmation.reply || ""), /vasta \"jah\"/i);

  const connected = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: confirmation.workflowState
  }, prisma);

  assert.equal(connected.handled, true);
  assert.equal(connected.workflowState?.mode, "done");
  assert.equal(connected.workflowState?.step, "connect");
  assert.equal(connected.workflowState?.matchId, "match-1");
  assert.equal(connected.workflowState?.roomId, "room-1");
  assert.match(String(connected.reply || ""), /ühendus on loodud|connection has been created/i);
});

test("connecting to a similar offer can also confirm a timing mismatch", async () => {
  const prisma = createAlternativeOfferPrismaStub({
    id: "offer-time-1",
    title: "Regulaarne transpordiabi",
    description: "Pakun transpordiabi Tallinnas regulaarselt.",
    structuredSummary: "Pakun transpordiabi Tallinnas regulaarselt",
    helpType: "VOLUNTARY",
    timeType: "RECURRING"
  });
  const connectState = createHelpWorkflowDraftState({
    intent: "connect_to_offer",
    mode: "browse",
    step: "connect",
    flowLocked: true,
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
      targetGroups: ["TĆ¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "ONE_TIME",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LĆ¤hiajal"
    },
    browseResults: [{
      id: "offer-time-1",
      kind: "offer",
      title: "Regulaarne transpordiabi",
      description: "Pakun transpordiabi Tallinnas regulaarselt.",
      municipalityName: "Tallinn",
      score: 65,
      helpType: "VOLUNTARY",
      timeType: "RECURRING",
      compatibilityWarnings: ["time_type_incompatible"],
      requiresConfirmation: true
    }]
  });

  const confirmation = await runHelpChatWorkflow({
    message: "1",
    userId: "user-1",
    replyLang: "et",
    workflowState: connectState
  }, prisma);

  assert.equal(confirmation.handled, true);
  assert.equal(confirmation.workflowState?.step, "connect");
  assert.equal(confirmation.workflowState?.confirmationPending, true);
  assert.match(String(confirmation.reply || ""), /mõni tingimus erineb/i);
  assert.match(String(confirmation.reply || ""), /ajalisuse erinevus/i);
  assert.match(String(confirmation.reply || ""), /vasta \"jah\"/i);

  const connected = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: confirmation.workflowState
  }, prisma);

  assert.equal(connected.handled, true);
  assert.equal(connected.workflowState?.mode, "done");
  assert.equal(connected.workflowState?.matchId, "match-1");
});

test("browse state can connect to multiple hard matches with a plain numeric reply", async () => {
  const prisma = createMultiOfferPrismaStub([
    {
      id: "offer-hard-1",
      title: "Vabatahtlik transpordiabi 1",
      description: "Pakun transpordiabi Tallinnas vabatahtlikult.",
      structuredSummary: "Pakun transpordiabi Tallinnas vabatahtlikult",
      helpType: "VOLUNTARY"
    },
    {
      id: "offer-hard-2",
      title: "Vabatahtlik transpordiabi 2",
      description: "Aitan transpordiga teisel ajal.",
      structuredSummary: "Aitan transpordiga teisel ajal",
      helpType: "VOLUNTARY"
    }
  ]);

  const browseState = createHelpWorkflowDraftState({
    intent: "browse_help_offers",
    mode: "browse",
    step: "browse",
    flowLocked: true,
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
      targetGroups: ["TÄ†Ā¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LÄ†Ā¤hiajal"
    },
    browseResults: [
      {
        id: "offer-hard-1",
        kind: "offer",
        title: "Vabatahtlik transpordiabi 1",
        description: "Pakun transpordiabi Tallinnas vabatahtlikult.",
        municipalityName: "Tallinn",
        score: 92,
        helpType: "VOLUNTARY",
        timeType: "FLEXIBLE",
        requiresConfirmation: false
      },
      {
        id: "offer-hard-2",
        kind: "offer",
        title: "Vabatahtlik transpordiabi 2",
        description: "Aitan transpordiga teisel ajal.",
        municipalityName: "Tallinn",
        score: 89,
        helpType: "VOLUNTARY",
        timeType: "FLEXIBLE",
        requiresConfirmation: false
      }
    ]
  });

  const result = await runHelpChatWorkflow({
    message: "1,2",
    userId: "user-1",
    replyLang: "et",
    workflowState: browseState
  }, prisma);

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.mode, "done");
  assert.equal(prisma.createdMatches.length, 2);
  assert.deepEqual(prisma.createdMatches.map((item) => item.offerId), ["offer-hard-1", "offer-hard-2"]);
  assert.match(String(result.reply || ""), /2 vestlust/i);
});

test("multiple selected offers can create hard matches first and then ask confirmation for soft matches", async () => {
  const prisma = createMultiOfferPrismaStub([
    {
      id: "offer-hard-1",
      title: "Vabatahtlik transpordiabi 1",
      description: "Pakun transpordiabi Tallinnas vabatahtlikult.",
      structuredSummary: "Pakun transpordiabi Tallinnas vabatahtlikult",
      helpType: "VOLUNTARY"
    },
    {
      id: "offer-soft-2",
      title: "Tasuline transpordiabi",
      description: "Pakun transpordiabi Tallinnas tasu eest.",
      structuredSummary: "Pakun transpordiabi Tallinnas tasu eest",
      helpType: "PAID"
    }
  ]);

  const browseState = createHelpWorkflowDraftState({
    intent: "browse_help_offers",
    mode: "browse",
    step: "browse",
    flowLocked: true,
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
      targetGroups: ["TÄ†Ā¤iskasvanu"],
      rawPlace: "Tallinn",
      helpType: "VOLUNTARY",
      timeType: "FLEXIBLE",
      availabilityOrStart: "Kokkuleppel",
      beneficiaryLabel: "Endale",
      urgency: "LÄ†Ā¤hiajal"
    },
    browseResults: [
      {
        id: "offer-hard-1",
        kind: "offer",
        title: "Vabatahtlik transpordiabi 1",
        description: "Pakun transpordiabi Tallinnas vabatahtlikult.",
        municipalityName: "Tallinn",
        score: 92,
        helpType: "VOLUNTARY",
        timeType: "FLEXIBLE",
        requiresConfirmation: false
      },
      {
        id: "offer-soft-2",
        kind: "offer",
        title: "Tasuline transpordiabi",
        description: "Pakun transpordiabi Tallinnas tasu eest.",
        municipalityName: "Tallinn",
        score: 65,
        helpType: "PAID",
        timeType: "FLEXIBLE",
        compatibilityWarnings: ["help_type_incompatible"],
        requiresConfirmation: true
      }
    ]
  });

  const firstStep = await runHelpChatWorkflow({
    message: "1,2",
    userId: "user-1",
    replyLang: "et",
    workflowState: browseState
  }, prisma);

  assert.equal(firstStep.handled, true);
  assert.equal(firstStep.workflowState?.confirmationPending, true);
  assert.equal(prisma.createdMatches.length, 1);
  assert.equal(prisma.createdMatches[0]?.offerId, "offer-hard-1");
  assert.match(String(firstStep.reply || ""), /Ühendus on loodud/i);
  assert.match(String(firstStep.reply || ""), /tingimus erineb/i);

  const confirmed = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-1",
    replyLang: "et",
    workflowState: firstStep.workflowState
  }, prisma);

  assert.equal(confirmed.handled, true);
  assert.equal(confirmed.workflowState?.mode, "done");
  assert.equal(prisma.createdMatches.length, 2);
  assert.equal(prisma.createdMatches[1]?.offerId, "offer-soft-2");
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
      targetGroups: ["Eakas", "Erivajadus"],
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
