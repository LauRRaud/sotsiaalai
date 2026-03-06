import prisma from "../prisma.js";
import { municipalitySummarySelect } from "./municipalities.js";

export const MATCHING_WEIGHTS = Object.freeze({
  primaryCategoryExact: 35,
  secondaryCategoryOverlap: 10,
  municipalityExact: 20,
  targetGroupOverlap: 10,
  helpTypeCompatible: 10,
  timeTypeCompatible: 10,
  roleLabelRelevance: 5
});

const LOCATION_SENSITIVE_CATEGORY_CODES = new Set([
  "TRANSPORT",
  "DAILY_TASKS",
  "HOME_HELP",
  "CARE_SUPPORT",
  "CHILD_YOUTH_SUPPORT"
]);

const targetGroupSummarySelect = Object.freeze({
  id: true,
  code: true,
  labelEt: true,
  labelEn: true,
  labelRu: true
});

const helpCategorySummarySelect = Object.freeze({
  id: true,
  code: true,
  labelEt: true,
  labelEn: true,
  labelRu: true
});

const helpRequestMatchSelect = Object.freeze({
  id: true,
  userId: true,
  municipalityId: true,
  primaryCategoryId: true,
  title: true,
  description: true,
  structuredSummary: true,
  roleLabel: true,
  helpType: true,
  timeType: true,
  status: true,
  createdAt: true,
  municipality: {
    select: municipalitySummarySelect
  },
  primaryCategory: {
    select: helpCategorySummarySelect
  },
  categoryLinks: {
    select: {
      categoryId: true,
      category: {
        select: helpCategorySummarySelect
      }
    }
  },
  targetGroupLinks: {
    select: {
      targetGroupId: true,
      targetGroup: {
        select: targetGroupSummarySelect
      }
    }
  }
});

const helpOfferMatchSelect = Object.freeze({
  id: true,
  userId: true,
  municipalityId: true,
  primaryCategoryId: true,
  title: true,
  description: true,
  structuredSummary: true,
  roleLabel: true,
  helpType: true,
  timeType: true,
  status: true,
  createdAt: true,
  municipality: {
    select: municipalitySummarySelect
  },
  primaryCategory: {
    select: helpCategorySummarySelect
  },
  categoryLinks: {
    select: {
      categoryId: true,
      category: {
        select: helpCategorySummarySelect
      }
    }
  },
  targetGroupLinks: {
    select: {
      targetGroupId: true,
      targetGroup: {
        select: targetGroupSummarySelect
      }
    }
  }
});

const helpMatchSelect = Object.freeze({
  id: true,
  requestId: true,
  offerId: true,
  requesterId: true,
  offererId: true,
  roomId: true,
  status: true,
  scoreSnapshot: true,
  reasonsJson: true,
  createdAt: true,
  updatedAt: true
});

function fail(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function normalizeLimit(value, fallback = 10, max = 50) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(max, Math.trunc(numeric)));
}

function normalizeCandidateFetchLimit(value) {
  return Math.max(10, Math.min(200, normalizeLimit(value, 10, 50) * 4));
}

function normalizeComparableText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokenSet(value = "") {
  const normalized = normalizeComparableText(value);
  if (!normalized) return new Set();
  return new Set(normalized.split(" ").filter((token) => token.length >= 3));
}

function arrayIntersection(left = [], right = []) {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
}

function uniq(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getRecordCategoryIds(record) {
  return uniq([
    record?.primaryCategoryId,
    ...(record?.categoryLinks || []).map((item) => item.categoryId)
  ]);
}

function getRecordCategoryCodes(record) {
  return uniq([
    record?.primaryCategory?.code,
    ...(record?.categoryLinks || []).map((item) => item?.category?.code)
  ]);
}

function getSecondaryCategoryCodes(record) {
  return uniq((record?.categoryLinks || []).map((item) => item?.category?.code));
}

function getTargetGroupCodes(record) {
  return uniq((record?.targetGroupLinks || []).map((item) => item?.targetGroup?.code));
}

function getRoleLabelMatch(requestRoleLabel = "", offerRoleLabel = "") {
  const left = normalizeComparableText(requestRoleLabel);
  const right = normalizeComparableText(offerRoleLabel);
  if (!left || !right) {
    return {
      score: 0,
      exact: false,
      overlap: []
    };
  }

  if (left === right) {
    return {
      score: MATCHING_WEIGHTS.roleLabelRelevance,
      exact: true,
      overlap: left ? [left] : []
    };
  }

  const overlap = arrayIntersection(Array.from(getTokenSet(left)), Array.from(getTokenSet(right)));
  if (!overlap.length) {
    return {
      score: 0,
      exact: false,
      overlap: []
    };
  }

  return {
    score: Math.min(MATCHING_WEIGHTS.roleLabelRelevance, overlap.length * 2),
    exact: false,
    overlap
  };
}

export function isLocationSensitiveCategory(categoryCode = "") {
  return LOCATION_SENSITIVE_CATEGORY_CODES.has(String(categoryCode || "").trim().toUpperCase());
}

export function isHelpTypeCompatible(requestHelpType, offerHelpType) {
  const requestType = String(requestHelpType || "").trim().toUpperCase();
  const offerType = String(offerHelpType || "").trim().toUpperCase();

  if (!requestType || !offerType) return true;
  if (requestType === "MIXED" || offerType === "MIXED") return true;
  return requestType === offerType;
}

export function isTimeTypeCompatible(requestTimeType, offerTimeType) {
  const requestType = String(requestTimeType || "").trim().toUpperCase();
  const offerType = String(offerTimeType || "").trim().toUpperCase();

  if (!requestType || !offerType) return true;
  if (requestType === "FLEXIBLE" || offerType === "FLEXIBLE") return true;
  return requestType === offerType;
}

function evaluateHardFilters(request, offer) {
  const requestCategoryIds = getRecordCategoryIds(request);
  const offerCategoryIds = getRecordCategoryIds(offer);
  const requestCategoryCodes = getRecordCategoryCodes(request);
  const offerCategoryCodes = getRecordCategoryCodes(offer);
  const sharedCategoryIds = arrayIntersection(requestCategoryIds, offerCategoryIds);
  const sharedCategoryCodes = arrayIntersection(requestCategoryCodes, offerCategoryCodes);
  const locationSensitive = uniq([
    request?.primaryCategory?.code,
    offer?.primaryCategory?.code
  ]).some((code) => isLocationSensitiveCategory(code));
  const municipalityExact = Boolean(
    request?.municipalityId
    && offer?.municipalityId
    && request.municipalityId === offer.municipalityId
  );
  const municipalityCompatible = !locationSensitive
    || !request?.municipalityId
    || !offer?.municipalityId
    || municipalityExact;
  const helpTypeCompatible = isHelpTypeCompatible(request?.helpType, offer?.helpType);
  const timeTypeCompatible = isTimeTypeCompatible(request?.timeType, offer?.timeType);

  const failures = [];
  if (request?.status !== "OPEN") failures.push("request_not_open");
  if (offer?.status !== "OPEN") failures.push("offer_not_open");
  if (!request?.userId || !offer?.userId || request.userId === offer.userId) failures.push("same_owner");
  if (!sharedCategoryIds.length) failures.push("category_incompatible");
  if (!municipalityCompatible) failures.push("municipality_incompatible");
  if (!helpTypeCompatible) failures.push("help_type_incompatible");
  if (!timeTypeCompatible) failures.push("time_type_incompatible");

  return {
    passed: failures.length === 0,
    failures,
    sharedCategoryIds,
    sharedCategoryCodes,
    locationSensitive,
    municipalityExact,
    municipalityCompatible,
    helpTypeCompatible,
    timeTypeCompatible
  };
}

export function buildMatchReasons(request, offer) {
  const filterResult = evaluateHardFilters(request, offer);
  const secondaryCategoryOverlap = arrayIntersection(
    getSecondaryCategoryCodes(request),
    getSecondaryCategoryCodes(offer)
  );
  const targetGroupOverlap = arrayIntersection(
    getTargetGroupCodes(request),
    getTargetGroupCodes(offer)
  );
  const roleLabelMatch = getRoleLabelMatch(request?.roleLabel, offer?.roleLabel);

  return {
    hardFiltersPassed: filterResult.passed,
    hardFilterFailures: filterResult.failures,
    locationSensitive: filterResult.locationSensitive,
    primaryCategoryExact: request?.primaryCategoryId === offer?.primaryCategoryId,
    primaryCategoryCode: request?.primaryCategory?.code || offer?.primaryCategory?.code || null,
    sharedCategoryCodes: filterResult.sharedCategoryCodes,
    secondaryCategoryOverlap,
    municipalityExact: filterResult.municipalityExact,
    municipalityId: filterResult.municipalityExact ? request?.municipalityId || offer?.municipalityId || null : null,
    helpTypeCompatible: filterResult.helpTypeCompatible,
    timeTypeCompatible: filterResult.timeTypeCompatible,
    targetGroupOverlap,
    roleLabelExact: roleLabelMatch.exact,
    roleLabelOverlap: roleLabelMatch.overlap
  };
}

export function calculateMatchScore(request, offer) {
  const filterResult = evaluateHardFilters(request, offer);
  const reasons = buildMatchReasons(request, offer);
  if (!filterResult.passed) {
    return {
      score: 0,
      reasons,
      filterResult
    };
  }

  let score = 0;

  if (reasons.primaryCategoryExact) {
    score += MATCHING_WEIGHTS.primaryCategoryExact;
  }

  if (reasons.secondaryCategoryOverlap.length) {
    score += Math.min(
      MATCHING_WEIGHTS.secondaryCategoryOverlap,
      reasons.secondaryCategoryOverlap.length * 5
    );
  }

  if (reasons.municipalityExact) {
    score += MATCHING_WEIGHTS.municipalityExact;
  }

  if (reasons.targetGroupOverlap.length) {
    score += Math.min(
      MATCHING_WEIGHTS.targetGroupOverlap,
      reasons.targetGroupOverlap.length * 5
    );
  }

  if (reasons.helpTypeCompatible) {
    score += MATCHING_WEIGHTS.helpTypeCompatible;
  }

  if (reasons.timeTypeCompatible) {
    score += MATCHING_WEIGHTS.timeTypeCompatible;
  }

  const roleLabelMatch = getRoleLabelMatch(request?.roleLabel, offer?.roleLabel);
  score += roleLabelMatch.score;

  return {
    score,
    reasons: {
      ...reasons,
      roleLabelExact: roleLabelMatch.exact,
      roleLabelOverlap: roleLabelMatch.overlap
    },
    filterResult
  };
}

function buildCandidateTitle(record) {
  return record?.title
    || record?.roleLabel
    || record?.structuredSummary
    || record?.primaryCategory?.labelEt
    || record?.primaryCategory?.code
    || "Help listing";
}

function buildCandidateResult(kind, record, scoreData) {
  return {
    id: record.id,
    kind,
    title: buildCandidateTitle(record),
    description: record.description || "",
    structuredSummary: record.structuredSummary || "",
    municipalityName: record?.municipality?.displayName || "",
    municipality: record?.municipality || null,
    primaryCategory: record?.primaryCategory || null,
    helpType: record?.helpType || null,
    timeType: record?.timeType || null,
    roleLabel: record?.roleLabel || "",
    status: record?.status || "",
    targetGroups: (record?.targetGroupLinks || []).map((item) => item?.targetGroup).filter(Boolean),
    score: scoreData.score,
    reasons: scoreData.reasons,
    primaryCategoryCode: record?.primaryCategory?.code || "",
    createdAt: record?.createdAt || null
  };
}

function compareCandidateResults(left, right) {
  const scoreDiff = Number(right?.score || 0) - Number(left?.score || 0);
  if (scoreDiff !== 0) return scoreDiff;

  const leftPrimary = left?.reasons?.primaryCategoryExact ? 1 : 0;
  const rightPrimary = right?.reasons?.primaryCategoryExact ? 1 : 0;
  if (rightPrimary !== leftPrimary) return rightPrimary - leftPrimary;

  const leftMunicipality = left?.reasons?.municipalityExact ? 1 : 0;
  const rightMunicipality = right?.reasons?.municipalityExact ? 1 : 0;
  if (rightMunicipality !== leftMunicipality) return rightMunicipality - leftMunicipality;

  const leftDate = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightDate = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
  return rightDate - leftDate;
}

async function requireRequestForMatching(requestId, prismaClient = prisma) {
  const id = String(requestId || "").trim();
  if (!id) throw fail("HELP_REQUEST_ID_REQUIRED");

  const request = await prismaClient.helpRequest.findUnique({
    where: { id },
    select: helpRequestMatchSelect
  });
  if (!request) throw fail("HELP_REQUEST_NOT_FOUND");
  return request;
}

async function requireOfferForMatching(offerId, prismaClient = prisma) {
  const id = String(offerId || "").trim();
  if (!id) throw fail("HELP_OFFER_ID_REQUIRED");

  const offer = await prismaClient.helpOffer.findUnique({
    where: { id },
    select: helpOfferMatchSelect
  });
  if (!offer) throw fail("HELP_OFFER_NOT_FOUND");
  return offer;
}

function buildOfferCandidateWhere(request) {
  const categoryIds = getRecordCategoryIds(request);
  const locationSensitive = isLocationSensitiveCategory(request?.primaryCategory?.code);
  const where = {
    status: "OPEN",
    userId: {
      not: request.userId
    },
    OR: [
      {
        primaryCategoryId: {
          in: categoryIds
        }
      },
      {
        categoryLinks: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      }
    ]
  };

  if (locationSensitive && request?.municipalityId) {
    where.AND = [{
      OR: [
        {
          municipalityId: request.municipalityId
        },
        {
          municipalityId: null
        }
      ]
    }];
  }

  return where;
}

function buildRequestCandidateWhere(offer) {
  const categoryIds = getRecordCategoryIds(offer);
  const locationSensitive = isLocationSensitiveCategory(offer?.primaryCategory?.code);
  const where = {
    status: "OPEN",
    userId: {
      not: offer.userId
    },
    OR: [
      {
        primaryCategoryId: {
          in: categoryIds
        }
      },
      {
        categoryLinks: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      }
    ]
  };

  if (locationSensitive && offer?.municipalityId) {
    where.AND = [{
      OR: [
        {
          municipalityId: offer.municipalityId
        },
        {
          municipalityId: null
        }
      ]
    }];
  }

  return where;
}

export async function getMatchingOffersForRequest(requestId, options = {}, prismaClient = prisma) {
  const request = await requireRequestForMatching(requestId, prismaClient);
  const limit = normalizeLimit(options?.limit, 10, 50);
  const offers = await prismaClient.helpOffer.findMany({
    where: buildOfferCandidateWhere(request),
    select: helpOfferMatchSelect,
    orderBy: [{ createdAt: "desc" }],
    take: normalizeCandidateFetchLimit(limit)
  });

  return offers
    .map((offer) => buildCandidateResult("offer", offer, calculateMatchScore(request, offer)))
    .filter((item) => item.score > 0)
    .sort(compareCandidateResults)
    .slice(0, limit);
}

export async function getMatchingRequestsForOffer(offerId, options = {}, prismaClient = prisma) {
  const offer = await requireOfferForMatching(offerId, prismaClient);
  const limit = normalizeLimit(options?.limit, 10, 50);
  const requests = await prismaClient.helpRequest.findMany({
    where: buildRequestCandidateWhere(offer),
    select: helpRequestMatchSelect,
    orderBy: [{ createdAt: "desc" }],
    take: normalizeCandidateFetchLimit(limit)
  });

  return requests
    .map((request) => buildCandidateResult("request", request, calculateMatchScore(request, offer)))
    .filter((item) => item.score > 0)
    .sort(compareCandidateResults)
    .slice(0, limit);
}

function buildRoomTitle(request, offer) {
  const requestTitle = buildCandidateTitle(request);
  const offerTitle = buildCandidateTitle(offer);
  const municipalityName = request?.municipality?.displayName || offer?.municipality?.displayName || "";
  const title = municipalityName
    ? `${requestTitle} - ${municipalityName}`
    : requestTitle;
  return title.slice(0, 160) || offerTitle.slice(0, 160) || "Help match";
}

function buildRoomDescription(request, offer) {
  const municipalityName = request?.municipality?.displayName || offer?.municipality?.displayName || "";
  const fragments = [
    request?.structuredSummary || request?.description || "",
    offer?.structuredSummary || offer?.description || "",
    municipalityName ? `Municipality: ${municipalityName}` : ""
  ].filter(Boolean);
  return fragments.join("\n\n").slice(0, 1000) || null;
}

async function ensureRoomForMatch(tx, request, offer, existingRoomId = null) {
  if (existingRoomId) {
    const existingRoom = await tx.room.findUnique({
      where: { id: existingRoomId },
      select: { id: true }
    });
    if (existingRoom) return existingRoom.id;
  }

  const room = await tx.room.create({
    data: {
      ownerId: request.userId,
      title: buildRoomTitle(request, offer),
      description: buildRoomDescription(request, offer),
      members: {
        create: [
          {
            userId: request.userId,
            role: "OWNER"
          },
          {
            userId: offer.userId,
            role: "MEMBER"
          }
        ]
      }
    },
    select: {
      id: true
    }
  });

  return room.id;
}

export async function createHelpMatchAndRoom(input = {}, prismaClient = prisma) {
  const requestId = String(input?.requestId || "").trim();
  const offerId = String(input?.offerId || "").trim();
  const initiatedByUserId = String(input?.initiatedByUserId || "").trim();

  if (!requestId) throw fail("HELP_MATCH_REQUEST_REQUIRED");
  if (!offerId) throw fail("HELP_MATCH_OFFER_REQUIRED");

  return prismaClient.$transaction(async (tx) => {
    const request = await requireRequestForMatching(requestId, tx);
    const offer = await requireOfferForMatching(offerId, tx);

    if (initiatedByUserId && initiatedByUserId !== request.userId && initiatedByUserId !== offer.userId) {
      throw fail("HELP_MATCH_INITIATOR_INVALID");
    }

    const scoreData = calculateMatchScore(request, offer);
    if (!scoreData.filterResult.passed) {
      throw fail("HELP_MATCH_NOT_COMPATIBLE");
    }

    const existing = await tx.helpMatch.findUnique({
      where: {
        requestId_offerId: {
          requestId,
          offerId
        }
      },
      select: helpMatchSelect
    });

    const roomId = await ensureRoomForMatch(tx, request, offer, existing?.roomId || null);

    if (existing) {
      return tx.helpMatch.update({
        where: { id: existing.id },
        data: {
          roomId,
          status: "CONTACTED",
          scoreSnapshot: scoreData.score,
          reasonsJson: scoreData.reasons
        },
        select: helpMatchSelect
      });
    }

    return tx.helpMatch.create({
      data: {
        requestId,
        offerId,
        requesterId: request.userId,
        offererId: offer.userId,
        roomId,
        status: "CONTACTED",
        scoreSnapshot: scoreData.score,
        reasonsJson: scoreData.reasons
      },
      select: helpMatchSelect
    });
  });
}

export const listMatchingOffersForRequest = getMatchingOffersForRequest;
export const listMatchingRequestsForOffer = getMatchingRequestsForOffer;
export const createHelpMatch = createHelpMatchAndRoom;
