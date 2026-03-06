import test from "node:test";
import assert from "node:assert/strict";

import { createHelpOffer } from "../../lib/help/offers.js";
import { createHelpRequest } from "../../lib/help/requests.js";

function createMockPrisma() {
  const categoriesByCode = new Map([
    ["TRANSPORT", { id: "cat-transport", code: "TRANSPORT", labelEt: "Transport" }]
  ]);
  const targetGroupsByCode = new Map([
    ["ELDER", { id: "tg-elder", code: "ELDER", labelEt: "Eakas" }],
    ["DISABILITY", { id: "tg-disability", code: "DISABILITY", labelEt: "Puue või erivajadus" }]
  ]);

  return {
    municipality: {
      findUnique: async ({ where }) => (
        where?.id === "municipality-1"
          ? { id: "municipality-1", displayName: "Rae vald", slug: "rae-vald", baseName: "Rae", type: "VALD", county: "Harju", isActive: true }
          : null
      )
    },
    helpCategory: {
      findUnique: async ({ where }) => {
        if (where?.id) {
          return Array.from(categoriesByCode.values()).find((item) => item.id === where.id) || null;
        }
        if (where?.code) return categoriesByCode.get(where.code) || null;
        return null;
      }
    },
    targetGroup: {
      findMany: async ({ where }) => {
        const codes = Array.isArray(where?.code?.in) ? where.code.in : [];
        return codes.map((code) => targetGroupsByCode.get(code)).filter(Boolean);
      }
    },
    helpRequest: {
      create: async ({ data }) => ({
        id: "request-1",
        ...data,
        municipality: { id: "municipality-1", displayName: "Rae vald" },
        primaryCategory: categoriesByCode.get("TRANSPORT"),
        targetGroupLinks: (data?.targetGroupLinks?.create || []).map((item) => ({
          targetGroupId: item.targetGroupId,
          targetGroup: Array.from(targetGroupsByCode.values()).find((group) => group.id === item.targetGroupId)
        }))
      })
    },
    helpOffer: {
      create: async ({ data }) => ({
        id: "offer-1",
        ...data,
        municipality: { id: "municipality-1", displayName: "Rae vald" },
        primaryCategory: categoriesByCode.get("TRANSPORT"),
        targetGroupLinks: (data?.targetGroupLinks?.create || []).map((item) => ({
          targetGroupId: item.targetGroupId,
          targetGroup: Array.from(targetGroupsByCode.values()).find((group) => group.id === item.targetGroupId)
        }))
      })
    }
  };
}

test("createHelpRequest persists helpType and target group links", async () => {
  const prisma = createMockPrisma();

  const record = await createHelpRequest({
    userId: "user-1",
    municipalityId: "municipality-1",
    primaryCategoryCode: "TRANSPORT",
    title: "Vajan transporti",
    description: "Vajan eakale transporti kord nädalas.",
    helpType: "VABATAHTLIK",
    timeType: "RECURRING",
    targetGroups: ["Eakas inimene"]
  }, prisma);

  assert.equal(record.helpType, "VOLUNTARY");
  assert.equal(record.timeType, "RECURRING");
  assert.equal(record.primaryCategory.id, "cat-transport");
  assert.deepEqual(record.targetGroupLinks.map((item) => item.targetGroup.code), ["ELDER"]);
});

test("createHelpOffer persists helpType and multiple target group links", async () => {
  const prisma = createMockPrisma();

  const record = await createHelpOffer({
    userId: "user-2",
    municipalityId: "municipality-1",
    primaryCategoryCode: "TRANSPORT",
    title: "Pakun transporti",
    description: "Pakun transporti eakale või erivajadusega täiskasvanule.",
    helpType: "MIXED",
    timeType: "FLEXIBLE",
    targetGroups: ["Eakas inimene", "Puue või erivajadus"]
  }, prisma);

  assert.equal(record.helpType, "MIXED");
  assert.equal(record.timeType, "FLEXIBLE");
  assert.deepEqual(
    record.targetGroupLinks.map((item) => item.targetGroup.code).sort(),
    ["DISABILITY", "ELDER"]
  );
});

