import test from "node:test";
import assert from "node:assert/strict";

import { runHelpChatWorkflow } from "../../lib/help/chatWorkflow.js";

function createWorkflowPrisma() {
  const municipalities = [
    {
      id: "municipality-harku",
      displayName: "Harku vald",
      slug: "harku-vald",
      baseName: "Harku",
      type: "VALD",
      county: "Harju",
      isActive: true
    },
    {
      id: "municipality-tallinn",
      displayName: "Tallinn",
      slug: "tallinn",
      baseName: "Tallinn",
      type: "LINN",
      county: "Harju",
      isActive: true
    },
    {
      id: "municipality-loksa",
      displayName: "Loksa linn",
      slug: "loksa-linn",
      baseName: "Loksa",
      type: "LINN",
      county: "Harju",
      isActive: true
    }
  ];

  const findMunicipalityByDisplayName = (value = "") => municipalities.find(
    (item) => item.displayName.toLowerCase() === String(value).trim().toLowerCase()
  ) || null;

  const findMunicipalityByLooseName = (value = "") => {
    const query = String(value || "").trim().toLowerCase();
    if (!query) return null;
    return municipalities.find((item) =>
      item.displayName.toLowerCase() === query
      || item.baseName.toLowerCase() === query
      || item.slug.toLowerCase() === query
    ) || null;
  };

  return {
    municipality: {
      findUnique: async ({ where }) => municipalities.find((item) => item.id === where?.id) || null,
      findFirst: async ({ where }) => {
        if (where?.displayName?.equals) {
          return findMunicipalityByDisplayName(where.displayName.equals);
        }
        const orList = Array.isArray(where?.OR) ? where.OR : [];
        for (const clause of orList) {
          if (clause?.displayName?.equals) {
            const found = findMunicipalityByDisplayName(clause.displayName.equals);
            if (found) return found;
          }
          if (clause?.baseName?.equals) {
            const found = findMunicipalityByLooseName(clause.baseName.equals);
            if (found) return found;
          }
          if (clause?.slug?.equals) {
            const found = findMunicipalityByLooseName(clause.slug.equals);
            if (found) return found;
          }
        }
        return null;
      },
      findMany: async ({ where }) => {
        const slugList = Array.isArray(where?.slug?.in) ? where.slug.in : [];
        if (!slugList.length) return [];
        return municipalities.filter((item) => slugList.includes(item.slug));
      }
    },
    helpCategory: {
      findUnique: async ({ where }) => ({
        id: `cat-${String(where?.code || "other").toLowerCase()}`,
        code: where?.code || "OTHER",
        labelEt: where?.code || "OTHER"
      })
    },
    targetGroup: {
      findMany: async ({ where }) => {
        const codes = Array.isArray(where?.code?.in) ? where.code.in : [];
        return codes.map((code) => ({
          id: `tg-${String(code).toLowerCase()}`,
          code,
          labelEt: code
        }));
      }
    },
    helpRequest: {
      create: async ({ data }) => ({
        id: "request-1",
        ...data,
        municipality: municipalities.find((item) => item.id === data.municipalityId) || null,
        primaryCategory: {
          id: "cat-request",
          code: data.primaryCategoryCode || "OTHER",
          labelEt: data.category || "Muu abi"
        },
        targetGroupLinks: []
      })
    },
    helpOffer: {
      create: async ({ data }) => ({
        id: "offer-1",
        ...data,
        municipality: municipalities.find((item) => item.id === data.municipalityId) || null,
        primaryCategory: {
          id: "cat-offer",
          code: data.primaryCategoryCode || "OTHER",
          labelEt: data.category || "Muu abi"
        },
        targetGroupLinks: []
      })
    }
  };
}

test("runHelpChatWorkflow asks for one explicit help-offer confirmation before slot filling", async () => {
  const result = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-1",
    replyLang: "et"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_offer");
  assert.equal(result.workflowState?.step, "intent_confirmation");
  assert.equal(result.workflowState?.flowLocked, false);
  assert.equal(result.workflowState?.sourceMessage, "Soovin pakkuda transporti Tabasalus.");
  assert.match(result.reply, /soovid vormistada abipakkumise/i);
});

test("runHelpChatWorkflow locks a forced help-offer flow and asks only for missing fields", async () => {
  const result = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-2",
    replyLang: "et",
    forcedIntent: "create_help_offer"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.flowLocked, true);
  assert.equal(result.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(result.workflowState?.draft?.rawPlace, "Tabasalu");
  assert.equal(result.workflowState?.draft?.categoryCode, "TRANSPORT");
  assert.match(result.reply, /Kas see abi on vabatahtlik, tasuline või oled avatud mõlemale/i);
  assert.doesNotMatch(result.reply, /vormistada abipakkumise/i);
});

test("runHelpChatWorkflow extracts multiple slots from one help-offer reply and shows preview only when complete", async () => {
  const prisma = createWorkflowPrisma();
  const confirmation = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-3",
    replyLang: "et",
    forcedIntent: "create_help_offer"
  }, prisma);

  const completed = await runHelpChatWorkflow({
    message: "vabatahtlik, kolmapaeviti ohtuti, vestluse kaudu, eakatele",
    userId: "user-3",
    replyLang: "et",
    workflowState: confirmation.workflowState
  }, prisma);

  assert.equal(completed.handled, true);
  assert.equal(completed.workflowState?.step, "edit_or_save");
  assert.equal(completed.workflowState?.confirmationPending, true);
  assert.equal(completed.workflowState?.draft?.helpType, "VOLUNTARY");
  assert.equal(completed.workflowState?.draft?.timeType, "RECURRING");
  assert.equal(completed.workflowState?.draft?.contactPreference, "vestluse kaudu");
  assert.deepEqual(completed.workflowState?.draft?.targetGroupCodes, ["ELDER"]);
  assert.match(completed.reply, /Palun vaata abipakkumine üle/i);
  assert.match(completed.reply, /Abi vorm: Vabatahtlik abi/i);
  assert.match(completed.reply, /Sihtrühm: Eakas/i);
  assert.doesNotMatch(completed.reply, /-\s*$/m);
});

test("runHelpChatWorkflow updates preview in natural language without restarting the flow", async () => {
  const prisma = createWorkflowPrisma();
  const first = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-4",
    replyLang: "et",
    forcedIntent: "create_help_offer"
  }, prisma);
  const preview = await runHelpChatWorkflow({
    message: "vabatahtlik, kolmapaeviti ohtuti, vestluse kaudu, eakatele",
    userId: "user-4",
    replyLang: "et",
    workflowState: first.workflowState
  }, prisma);
  const edited = await runHelpChatWorkflow({
    message: "muuda asukohaks Tallinn",
    userId: "user-4",
    replyLang: "et",
    workflowState: preview.workflowState
  }, prisma);

  assert.equal(edited.handled, true);
  assert.equal(edited.workflowState?.flowLocked, true);
  assert.equal(edited.workflowState?.step, "edit_or_save");
  assert.equal(edited.workflowState?.municipalityLabel, "Tallinn");
  assert.equal(edited.workflowState?.draft?.rawPlace, "Tallinn");
  assert.match(edited.reply, /Märkisin asukohaks Tallinn/i);
  assert.match(edited.reply, /Palun vaata abipakkumine üle/i);
});

test("runHelpChatWorkflow asks for confirmation first for help requests and then continues slot filling", async () => {
  const prisma = createWorkflowPrisma();
  const first = await runHelpChatWorkflow({
    message: "Mul oleks vaja emale transporti Tabasalus.",
    userId: "user-5",
    replyLang: "et"
  }, prisma);

  assert.equal(first.workflowState?.step, "intent_confirmation");
  assert.equal(first.workflowState?.flowLocked, false);
  assert.match(first.reply, /soovid vormistada abisoovi/i);

  const confirmed = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-5",
    replyLang: "et",
    workflowState: first.workflowState
  }, prisma);

  assert.equal(confirmed.handled, true);
  assert.equal(confirmed.workflowState?.flowLocked, true);
  assert.equal(confirmed.workflowState?.draft?.beneficiaryLabel, "emale");
  assert.equal(confirmed.workflowState?.draft?.categoryCode, "TRANSPORT");
  assert.equal(confirmed.workflowState?.municipalityLabel, "Harku vald");
  assert.match(confirmed.reply, /Kui kiiresti abi vaja on/i);
});

test("runHelpChatWorkflow saves only after explicit yes from preview state", async () => {
  const prisma = createWorkflowPrisma();
  const first = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-6",
    replyLang: "et",
    forcedIntent: "create_help_offer"
  }, prisma);
  const preview = await runHelpChatWorkflow({
    message: "vabatahtlik, kolmapaeviti ohtuti, vestluse kaudu, eakatele",
    userId: "user-6",
    replyLang: "et",
    workflowState: first.workflowState
  }, prisma);
  const saved = await runHelpChatWorkflow({
    message: "jah",
    userId: "user-6",
    replyLang: "et",
    workflowState: preview.workflowState
  }, prisma);

  assert.equal(saved.handled, true);
  assert.equal(saved.workflowState?.step, "saved");
  assert.equal(saved.workflowState?.sourceRecordId, "offer-1");
  assert.match(saved.reply, /Aitäh! Abipakkumine on salvestatud/i);
});
