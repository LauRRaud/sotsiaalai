process.env.DATABASE_URL ??= "postgresql://user:pass@127.0.0.1:5432/sotsiaalai_test";

import test from "node:test";
import assert from "node:assert/strict";

const [{ runHelpChatWorkflow }, { createHelpWorkflowDraftState }] = await Promise.all([
  import("../../lib/help/chatWorkflow.js"),
  import("../../lib/help/workflowState.js")
]);

function createSavedRequestState(overrides = {}) {
  return createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "saved",
    step: "saved",
    flowLocked: false,
    sourceRecordId: "req-1",
    linkedRequestId: "req-1",
    municipalityId: "mun-1",
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
      contactPreference: "vestluse kaudu",
      beneficiaryLabel: "endale",
      urgency: "lähiajal",
      structuredSummary: "Vajan transpordiabi Tallinnas"
    },
    ...overrides
  });
}

function createBrowsePrismaStub() {
  return {
    municipality: {
      async findUnique() {
        return {
          id: "mun-1",
          slug: "tallinn",
          baseName: "Tallinn",
          type: "CITY",
          displayName: "Tallinn",
          county: "Harju",
          isActive: true
        };
      }
    },
    helpCategory: {
      async findUnique({ where }) {
        if (where?.code === "TRANSPORT") {
          return {
            id: "cat-transport",
            code: "TRANSPORT",
            labelEt: "Transport",
            labelEn: "Transport",
            labelRu: "Transport",
            sortOrder: 1,
            isActive: true,
            parentId: null
          };
        }
        return null;
      }
    },
    targetGroup: {
      async findMany() {
        return [{
          id: "tg-adult",
          code: "ADULT",
          labelEt: "Täiskasvanu",
          labelEn: "Adult",
          labelRu: "Adult",
          isActive: true
        }];
      }
    },
    helpRequest: {
      async findUnique() {
        return {
          id: "req-1",
          userId: "user-1",
          municipalityId: "mun-1",
          primaryCategoryId: "cat-transport",
          title: "Vajan transpordiabi",
          description: "Vajan transpordiabi Tallinnas.",
          structuredSummary: "Vajan transpordiabi Tallinnas",
          roleLabel: "endale",
          helpType: "VOLUNTARY",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          municipality: {
            id: "mun-1",
            displayName: "Tallinn",
            county: "Harju"
          },
          primaryCategory: {
            id: "cat-transport",
            code: "TRANSPORT",
            labelEt: "Transport",
            labelEn: "Transport",
            labelRu: "Transport"
          },
          categoryLinks: [],
          targetGroupLinks: []
        };
      },
      async create({ data }) {
        return {
          id: "req-1",
          userId: data.userId,
          municipalityId: data.municipalityId,
          primaryCategoryId: data.primaryCategoryId,
          title: data.title,
          description: data.description,
          structuredSummary: data.structuredSummary,
          roleLabel: data.roleLabel,
          rawPlace: data.rawPlace,
          helpType: data.helpType,
          timeType: data.timeType,
          status: data.status || "OPEN",
          classificationSource: data.classificationSource || "USER",
          classificationConfidence: data.classificationConfidence ?? null,
          userConfirmedAt: data.userConfirmedAt || null,
          createdAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
          municipality: {
            id: "mun-1",
            slug: "tallinn",
            baseName: "Tallinn",
            type: "CITY",
            displayName: "Tallinn",
            county: "Harju",
            isActive: true
          },
          primaryCategory: {
            id: "cat-transport",
            code: "TRANSPORT",
            labelEt: "Transport",
            labelEn: "Transport",
            labelRu: "Transport"
          },
          categoryLinks: [],
          targetGroupLinks: [{
            targetGroupId: "tg-adult",
            targetGroup: {
              id: "tg-adult",
              code: "ADULT",
              labelEt: "Täiskasvanu",
              labelEn: "Adult",
              labelRu: "Adult"
            }
          }]
        };
      }
    },
    helpOffer: {
      async findMany() {
        return [{
          id: "offer-1",
          userId: "user-2",
          municipalityId: "mun-1",
          primaryCategoryId: "cat-transport",
          title: "Pakun transpordiabi",
          description: "Saan autoga aidata Tallinnas.",
          structuredSummary: "Pakun transpordiabi Tallinnas",
          roleLabel: "autojuht",
          helpType: "VOLUNTARY",
          timeType: "FLEXIBLE",
          status: "OPEN",
          createdAt: new Date("2026-04-05T10:00:00.000Z").toISOString(),
          municipality: {
            id: "mun-1",
            displayName: "Tallinn",
            county: "Harju"
          },
          primaryCategory: {
            id: "cat-transport",
            code: "TRANSPORT",
            labelEt: "Transport",
            labelEn: "Transport",
            labelRu: "Transport"
          },
          categoryLinks: [],
          targetGroupLinks: []
        }];
      }
    }
  };
}

test("cold-start browse intent is handled inside help workflow", async () => {
  const result = await runHelpChatWorkflow({
    message: "Sirvi abipakkumisi",
    userId: "user-1",
    replyLang: "et"
  }, {});

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.match(String(result.reply || ""), /millise abipalve jaoks pakkumisi vaadata/i);
});

test("saved help request can transition into browse flow", async () => {
  const result = await runHelpChatWorkflow({
    message: "Sirvi sobivaid abipakkumisi",
    userId: "user-1",
    replyLang: "et",
    workflowState: createSavedRequestState()
  }, createBrowsePrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.equal(result.workflowState?.mode, "browse");
  assert.equal(result.cards?.length || 0, 0);
  assert.match(String(result.reply || ""), /Leidsin 1/i);
  assert.match(String(result.reply || ""), /1\. Pakun transpordiabi/i);
});

test("new create intent after saved state starts a fresh confirmation flow", async () => {
  const message = "Vajan abi kodu koristamisel Tartus";
  const result = await runHelpChatWorkflow({
    message,
    userId: "user-1",
    replyLang: "et",
    workflowState: createSavedRequestState()
  }, {});

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_request");
  assert.equal(result.workflowState?.step, "intent_confirmation");
  assert.equal(result.workflowState?.sourceMessage, message);
  assert.equal(result.workflowState?.mode, "draft");
});

test("saving a help request automatically shows matching offers", async () => {
  const previewState = createHelpWorkflowDraftState({
    intent: "create_help_request",
    mode: "draft",
    step: "edit_or_save",
    flowLocked: true,
    confirmationPending: true,
    municipalityId: "mun-1",
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
      contactPreference: "vestluse kaudu",
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
  }, createBrowsePrismaStub());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "browse_help_offers");
  assert.equal(result.workflowState?.mode, "browse");
  assert.equal(result.cards?.length || 0, 0);
  assert.match(String(result.reply || ""), /Abisoov on salvestatud/i);
  assert.match(String(result.reply || ""), /Leidsin 1/i);
  assert.match(String(result.reply || ""), /1\. Pakun transpordiabi/i);
});
