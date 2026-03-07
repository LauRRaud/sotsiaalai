import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateMatchScore,
  createHelpMatchAndRoom,
  getMatchingOffersForRequest
} from "../../lib/help/matches.js";

function buildRequest(overrides = {}) {
  return {
    id: "request-1",
    userId: "requester-1",
    municipalityId: "municipality-1",
    primaryCategoryId: "cat-transport",
    status: "OPEN",
    helpType: "VOLUNTARY",
    timeType: "RECURRING",
    roleLabel: "Saatja",
    description: "Vajan eakale transporti",
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    municipality: { id: "municipality-1", displayName: "Rae vald" },
    primaryCategory: { id: "cat-transport", code: "TRANSPORT", labelEt: "Transport" },
    categoryLinks: [],
    targetGroupLinks: [{ targetGroupId: "tg-elder", targetGroup: { code: "ELDER", labelEt: "Eakas" } }],
    ...overrides
  };
}

function buildOffer(overrides = {}) {
  return {
    id: "offer-1",
    userId: "offerer-1",
    municipalityId: "municipality-1",
    primaryCategoryId: "cat-transport",
    status: "OPEN",
    helpType: "MIXED",
    timeType: "FLEXIBLE",
    roleLabel: "Saatja",
    description: "Pakun transporti",
    createdAt: new Date("2026-03-02T10:00:00.000Z"),
    municipality: { id: "municipality-1", displayName: "Rae vald" },
    primaryCategory: { id: "cat-transport", code: "TRANSPORT", labelEt: "Transport" },
    categoryLinks: [],
    targetGroupLinks: [{ targetGroupId: "tg-elder", targetGroup: { code: "ELDER", labelEt: "Eakas" } }],
    ...overrides
  };
}

test("calculateMatchScore ranks exact structured matches highly", () => {
  const result = calculateMatchScore(buildRequest(), buildOffer());

  assert.equal(result.filterResult.passed, true);
  assert.equal(result.reasons.primaryCategoryExact, true);
  assert.equal(result.reasons.municipalityExact, true);
  assert.equal(result.reasons.helpTypeCompatible, true);
  assert.equal(result.reasons.timeTypeCompatible, true);
  assert.ok(result.score >= 80);
});

test("getMatchingOffersForRequest returns deterministic ranked candidates", async () => {
  const request = buildRequest();
  const betterOffer = buildOffer({ id: "offer-better" });
  const weakerOffer = buildOffer({
    id: "offer-weaker",
    municipalityId: null,
    municipality: null,
    roleLabel: ""
  });
  const prisma = {
    helpRequest: {
      findUnique: async () => request
    },
    helpOffer: {
      findMany: async () => [weakerOffer, betterOffer]
    }
  };

  const items = await getMatchingOffersForRequest("request-1", { limit: 5 }, prisma);
  assert.equal(items[0].id, "offer-better");
  assert.ok(items[0].score >= items[1].score);
});

test("createHelpMatchAndRoom creates a real HelpMatch only on explicit action and attaches a Room", async () => {
  const request = buildRequest();
  const offer = buildOffer();
  const created = { roomId: null, matchData: null };
  const tx = {
    helpRequest: {
      findUnique: async () => request
    },
    helpOffer: {
      findUnique: async () => offer
    },
    helpMatch: {
      findUnique: async () => null,
      create: async ({ data }) => {
        created.matchData = data;
        return {
          id: "match-1",
          ...data
        };
      }
    },
    room: {
      findUnique: async () => null,
      create: async () => {
        created.roomId = "room-1";
        return { id: "room-1" };
      }
    }
  };
  const prisma = {
    $transaction: async (callback) => callback(tx)
  };

  const match = await createHelpMatchAndRoom({
    requestId: "request-1",
    offerId: "offer-1",
    initiatedByUserId: "requester-1"
  }, prisma);

  assert.equal(match.roomId, "room-1");
  assert.equal(created.matchData.status, "CONTACTED");
  assert.ok(created.matchData.scoreSnapshot > 0);
  assert.equal(created.matchData.requesterId, "requester-1");
  assert.equal(created.matchData.offererId, "offerer-1");
});

test("createHelpMatchAndRoom reuses existing match and room on repeated contact", async () => {
  const request = buildRequest();
  const offer = buildOffer();
  const created = { roomCreateCalls: 0, updated: null };
  const tx = {
    helpRequest: {
      findUnique: async () => request
    },
    helpOffer: {
      findUnique: async () => offer
    },
    helpMatch: {
      findUnique: async () => ({
        id: "match-1",
        requestId: "request-1",
        offerId: "offer-1",
        requesterId: "requester-1",
        offererId: "offerer-1",
        roomId: "room-1",
        status: "PENDING"
      }),
      update: async ({ data }) => {
        created.updated = data;
        return {
          id: "match-1",
          ...data
        };
      }
    },
    room: {
      findUnique: async () => ({ id: "room-1" }),
      create: async () => {
        created.roomCreateCalls += 1;
        return { id: `room-${created.roomCreateCalls}` };
      }
    }
  };
  const prisma = {
    $transaction: async (callback) => callback(tx)
  };

  const match = await createHelpMatchAndRoom({
    requestId: "request-1",
    offerId: "offer-1",
    initiatedByUserId: "offerer-1"
  }, prisma);

  assert.equal(match.roomId, "room-1");
  assert.equal(created.roomCreateCalls, 0);
  assert.equal(created.updated.status, "CONTACTED");
});

test("createHelpMatchAndRoom recreates room if existing match points to a missing room", async () => {
  const request = buildRequest();
  const offer = buildOffer();
  const created = { roomCreateCalls: 0, updated: null };
  const tx = {
    helpRequest: {
      findUnique: async () => request
    },
    helpOffer: {
      findUnique: async () => offer
    },
    helpMatch: {
      findUnique: async () => ({
        id: "match-1",
        requestId: "request-1",
        offerId: "offer-1",
        requesterId: "requester-1",
        offererId: "offerer-1",
        roomId: "missing-room",
        status: "CONTACTED"
      }),
      update: async ({ data }) => {
        created.updated = data;
        return {
          id: "match-1",
          ...data
        };
      }
    },
    room: {
      findUnique: async () => null,
      create: async () => {
        created.roomCreateCalls += 1;
        return { id: `room-${created.roomCreateCalls}` };
      }
    }
  };
  const prisma = {
    $transaction: async (callback) => callback(tx)
  };

  const match = await createHelpMatchAndRoom({
    requestId: "request-1",
    offerId: "offer-1",
    initiatedByUserId: "requester-1"
  }, prisma);

  assert.equal(match.roomId, "room-1");
  assert.equal(created.roomCreateCalls, 1);
  assert.equal(created.updated.roomId, "room-1");
});
