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
    }
  };
}

test("runHelpChatWorkflow starts a help-offer workflow for natural transport offers", async () => {
  const result = await runHelpChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    userId: "user-1",
    replyLang: "et"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_offer");
  assert.equal(result.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(result.workflowState?.confirmationPending, true);
  assert.match(result.reply, /Palun kinnita enne salvestamist/i);
});

test("runHelpChatWorkflow starts a help-request workflow for natural need descriptions", async () => {
  const result = await runHelpChatWorkflow({
    message: "Mul oleks vaja emale abi poes käimiseks.",
    userId: "user-2",
    replyLang: "et"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_request");
  assert.ok(result.workflowState?.missingFields?.includes("municipalityId"));
  assert.match(result.reply, /Mis omavalitsuses/i);
});

test("runHelpChatWorkflow starts a help-offer workflow for helper phrasing", async () => {
  const result = await runHelpChatWorkflow({
    message: "Saan aidata eakat poes käimisega.",
    userId: "user-3",
    replyLang: "et"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_offer");
  assert.match(result.reply, /Mis omavalitsuses/i);
});

test("runHelpChatWorkflow prefers help mediation over generic fallback for likely request questions", async () => {
  const result = await runHelpChatWorkflow({
    message: "Kas keegi pakub transporti Tabasalus?",
    userId: "user-4",
    replyLang: "et"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_request");
  assert.equal(result.workflowState?.municipalityLabel, "Harku vald");
  assert.equal(result.workflowState?.confirmationPending, true);
});

test("runHelpChatWorkflow can be forced into help-offer mode after explicit mode confirmation", async () => {
  const result = await runHelpChatWorkflow({
    message: "Tabasalus kolmapäeval.",
    userId: "user-5",
    replyLang: "et",
    forcedIntent: "create_help_offer"
  }, createWorkflowPrisma());

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.intent, "create_help_offer");
});
