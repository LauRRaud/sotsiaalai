import prisma from "../prisma.js";
import { resolvePrimaryHelpCategory } from "./categories.js";
import { toHelpListingView } from "./listingViews.js";
import { municipalitySummarySelect, requireMunicipality } from "./municipalities.js";
import { resolveTargetGroups, targetGroupSummarySelect } from "./targetGroups.js";

const helpRequestDetailSelect = Object.freeze({
  id: true,
  userId: true,
  municipalityId: true,
  primaryCategoryId: true,
  title: true,
  description: true,
  structuredSummary: true,
  roleLabel: true,
  rawPlace: true,
  helpType: true,
  timeType: true,
  status: true,
  classificationSource: true,
  classificationConfidence: true,
  userConfirmedAt: true,
  createdAt: true,
  updatedAt: true,
  municipality: {
    select: municipalitySummarySelect
  },
  primaryCategory: {
    select: {
      id: true,
      code: true,
      labelEt: true,
      labelEn: true,
      labelRu: true
    }
  },
  categoryLinks: {
    select: {
      categoryId: true,
      category: {
        select: {
          id: true,
          code: true,
          labelEt: true,
          labelEn: true,
          labelRu: true
        }
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

function normalizeOptionalTitle(value = "") {
  const title = String(value || "").replace(/\s+/g, " ").trim();
  if (!title) return null;
  return title.slice(0, 160);
}

function normalizeRequiredDescription(value = "") {
  const description = String(value || "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!description) {
    const error = new Error("HELP_REQUEST_DESCRIPTION_REQUIRED");
    error.code = "HELP_REQUEST_DESCRIPTION_REQUIRED";
    throw error;
  }
  return description.slice(0, 5000);
}

function normalizeOptionalText(value = "", max = 240) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function normalizeStatus(value = "") {
  const status = String(value || "").trim().toUpperCase();
  if (!status) return undefined;
  if (["DRAFT", "OPEN", "MATCHED", "CLOSED", "CANCELLED", "ARCHIVED"].includes(status)) return status;
  const error = new Error("HELP_REQUEST_STATUS_INVALID");
  error.code = "HELP_REQUEST_STATUS_INVALID";
  throw error;
}

function normalizeHelpType(value = "") {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return null;
  if (["VOLUNTARY", "PAID", "MIXED"].includes(normalized)) return normalized;
  if (["VABATAHTLIK", "VABATAHTLIK ABI", "TASUTA", "VOLUNTEER", "VOLUNTEERED"].includes(normalized)) return "VOLUNTARY";
  if (["TASULINE", "PAID HELP", "PAID"].includes(normalized)) return "PAID";
  if (["SEGATUD", "VABATAHTLIK VOI TASULINE", "VABATAHTLIK VÕI TASULINE"].includes(normalized)) return "MIXED";
  return null;
}

function normalizeTimeType(value = "") {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return null;
  if (["ONE_TIME", "RECURRING", "FLEXIBLE"].includes(normalized)) return normalized;
  if (["UHEKORDNE", "ONE TIME"].includes(normalized)) return "ONE_TIME";
  if (["IGAPAEVANE", "PAAR KORDA NADALAS", "RECURRING"].includes(normalized)) return "RECURRING";
  if (["AJUTINE", "FLEXIBLE"].includes(normalized)) return "FLEXIBLE";
  return null;
}

function normalizeClassificationSource(value = "") {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return undefined;
  if (["AI", "USER", "MANUAL"].includes(normalized)) return normalized;
  const error = new Error("HELP_REQUEST_CLASSIFICATION_SOURCE_INVALID");
  error.code = "HELP_REQUEST_CLASSIFICATION_SOURCE_INVALID";
  throw error;
}

function buildStructuredSummary(input = {}) {
  const explicit = normalizeOptionalText(input?.structuredSummary, 280);
  if (explicit) return explicit;
  const title = normalizeOptionalText(input?.title, 120);
  const description = normalizeOptionalText(input?.description, 280);
  return title || description || null;
}

export async function createHelpRequest(input = {}, prismaClient = prisma) {
  const userId = String(input?.userId || input?.requesterId || "").trim();
  const municipalityId = String(input?.municipalityId || "").trim() || null;
  if (!userId) {
    const error = new Error("HELP_REQUEST_USER_REQUIRED");
    error.code = "HELP_REQUEST_USER_REQUIRED";
    throw error;
  }

  if (municipalityId) {
    await requireMunicipality(municipalityId, prismaClient);
  }

  const primaryCategory = await resolvePrimaryHelpCategory({
    primaryCategoryId: input?.primaryCategoryId,
    primaryCategoryCode: input?.primaryCategoryCode,
    category: input?.category,
    serviceLabel: input?.serviceLabel,
    description: input?.description
  }, prismaClient);
  const targetGroups = await resolveTargetGroups(input, prismaClient);

  return prismaClient.helpRequest.create({
    data: {
      userId,
      municipalityId,
      primaryCategoryId: primaryCategory.id,
      title: normalizeOptionalTitle(input?.title),
      description: normalizeRequiredDescription(input?.description),
      structuredSummary: buildStructuredSummary(input),
      roleLabel: normalizeOptionalText(input?.roleLabel || input?.serviceLabel, 120),
      rawPlace: normalizeOptionalText(input?.rawPlace, 160),
      helpType: normalizeHelpType(input?.helpType),
      timeType: normalizeTimeType(input?.timeType),
      ...(normalizeStatus(input?.status) ? { status: normalizeStatus(input?.status) } : {}),
      ...(normalizeClassificationSource(input?.classificationSource) ? { classificationSource: normalizeClassificationSource(input?.classificationSource) } : {}),
      ...(Number.isFinite(Number(input?.classificationConfidence)) ? { classificationConfidence: Number(input.classificationConfidence) } : {}),
      ...(input?.userConfirmedAt ? { userConfirmedAt: new Date(input.userConfirmedAt) } : {}),
      ...(targetGroups.length
        ? {
            targetGroupLinks: {
              create: targetGroups.map((group) => ({
                targetGroupId: group.id
              }))
            }
          }
        : {})
    },
    select: helpRequestDetailSelect
  });
}

export async function listHelpRequests(filters = {}, prismaClient = prisma) {
  const where = {};
  const userId = String(filters?.userId || filters?.requesterId || "").trim();
  const municipalityId = String(filters?.municipalityId || "").trim();
  const status = normalizeStatus(filters?.status);
  const primaryCategoryId = String(filters?.primaryCategoryId || "").trim();

  if (userId) where.userId = userId;
  if (municipalityId) where.municipalityId = municipalityId;
  if (primaryCategoryId) where.primaryCategoryId = primaryCategoryId;
  if (status) where.status = status;

  return prismaClient.helpRequest.findMany({
    where,
    select: helpRequestDetailSelect,
    orderBy: [{ createdAt: "desc" }],
    skip: Math.max(0, Number(filters?.offset) || 0),
    take: Math.max(1, Math.min(100, Number(filters?.limit) || 25))
  });
}

export async function getHelpRequestById(helpRequestId, prismaClient = prisma) {
  const id = String(helpRequestId || "").trim();
  if (!id) return null;

  return prismaClient.helpRequest.findUnique({
    where: { id },
    select: helpRequestDetailSelect
  });
}

export async function updateHelpRequest(helpRequestId, input = {}, prismaClient = prisma) {
  const id = String(helpRequestId || "").trim();
  if (!id) {
    const error = new Error("HELP_REQUEST_ID_REQUIRED");
    error.code = "HELP_REQUEST_ID_REQUIRED";
    throw error;
  }

  const municipalityId = String(input?.municipalityId || "").trim() || null;
  if (municipalityId) {
    await requireMunicipality(municipalityId, prismaClient);
  }

  const data = {};
  if (Object.prototype.hasOwnProperty.call(input, "title")) data.title = normalizeOptionalTitle(input?.title);
  if (Object.prototype.hasOwnProperty.call(input, "description")) data.description = normalizeRequiredDescription(input?.description);
  if (Object.prototype.hasOwnProperty.call(input, "structuredSummary") || Object.prototype.hasOwnProperty.call(input, "description") || Object.prototype.hasOwnProperty.call(input, "title")) {
    data.structuredSummary = buildStructuredSummary({
      structuredSummary: input?.structuredSummary,
      title: Object.prototype.hasOwnProperty.call(input, "title") ? input?.title : undefined,
      description: Object.prototype.hasOwnProperty.call(input, "description") ? input?.description : undefined
    });
  }
  if (Object.prototype.hasOwnProperty.call(input, "roleLabel") || Object.prototype.hasOwnProperty.call(input, "serviceLabel")) {
    data.roleLabel = normalizeOptionalText(input?.roleLabel || input?.serviceLabel, 120);
  }
  if (Object.prototype.hasOwnProperty.call(input, "rawPlace")) data.rawPlace = normalizeOptionalText(input?.rawPlace, 160);
  if (Object.prototype.hasOwnProperty.call(input, "helpType")) data.helpType = normalizeHelpType(input?.helpType);
  if (Object.prototype.hasOwnProperty.call(input, "timeType")) data.timeType = normalizeTimeType(input?.timeType);
  if (Object.prototype.hasOwnProperty.call(input, "status")) data.status = normalizeStatus(input?.status);
  if (Object.prototype.hasOwnProperty.call(input, "municipalityId")) data.municipalityId = municipalityId;

  if (Object.prototype.hasOwnProperty.call(input, "primaryCategoryId") || Object.prototype.hasOwnProperty.call(input, "primaryCategoryCode") || Object.prototype.hasOwnProperty.call(input, "category")) {
    const primaryCategory = await resolvePrimaryHelpCategory({
      primaryCategoryId: input?.primaryCategoryId,
      primaryCategoryCode: input?.primaryCategoryCode,
      category: input?.category,
      serviceLabel: input?.serviceLabel,
      description: input?.description
    }, prismaClient);
    data.primaryCategoryId = primaryCategory.id;
  }

  const shouldUpdateTargetGroups = Object.prototype.hasOwnProperty.call(input, "targetGroup")
    || Object.prototype.hasOwnProperty.call(input, "targetGroups")
    || Object.prototype.hasOwnProperty.call(input, "targetGroupCodes");
  const targetGroups = shouldUpdateTargetGroups ? await resolveTargetGroups(input, prismaClient) : null;

  return prismaClient.helpRequest.update({
    where: { id },
    data: {
      ...data,
      ...(shouldUpdateTargetGroups
        ? {
            targetGroupLinks: {
              deleteMany: {},
              ...(targetGroups?.length
                ? {
                    create: targetGroups.map((group) => ({
                      targetGroupId: group.id
                    }))
                  }
                : {})
            }
          }
        : {})
    },
    select: helpRequestDetailSelect
  });
}

export async function deleteHelpRequest(helpRequestId, prismaClient = prisma) {
  const id = String(helpRequestId || "").trim();
  if (!id) return null;
  return prismaClient.helpRequest.delete({
    where: { id },
    select: {
      id: true
    }
  });
}

export async function listHelpRequestListingViews(filters = {}, options = {}, prismaClient = prisma) {
  const locale = String(options?.locale || filters?.locale || "et").trim();
  const records = await listHelpRequests(filters, prismaClient);
  return records.map((record) => toHelpListingView(record, { kind: "request", locale }));
}

export async function getHelpRequestListingViewById(helpRequestId, options = {}, prismaClient = prisma) {
  const locale = String(options?.locale || "et").trim();
  const record = await getHelpRequestById(helpRequestId, prismaClient);
  if (!record) return null;
  return toHelpListingView(record, { kind: "request", locale });
}
