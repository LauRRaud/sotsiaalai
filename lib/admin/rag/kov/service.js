import crypto from "crypto";

import { loadMunicipalitySeedEntries } from "@/lib/help/municipalityData";
import { buildRagHeaders, ragServiceRequest } from "@/lib/documents/ragService";
import { prisma } from "@/lib/prisma";

import { readStoredKovFile } from "./storage";
import {
  KOV_ADMIN_STATUS_VALUES,
  KOV_DB_ROLE_TO_KEY,
  KOV_FILE_KEYS,
  KOV_FILE_ROLE_META,
  KOV_INGEST_STATUS_VALUES,
  KOV_RT_FILE_KEYS,
  KOV_RT_STATUS_VALUES,
  KOV_WEB_FILE_KEYS,
  resolveKovFileKeyFromDbRole
} from "./shared";
import { validateKovFileContent } from "./validation";

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
}

function normalizeNotes(value) {
  const trimmed = String(value || "").trim();
  return trimmed ? trimmed.slice(0, 8000) : null;
}

function normalizeCheckedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ensureStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return KOV_ADMIN_STATUS_VALUES.includes(normalized) ? normalized : "NOT_STARTED";
}

function ensureIngestStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return KOV_INGEST_STATUS_VALUES.includes(normalized) ? normalized : "NOT_INGESTED";
}

function ensureRtStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return KOV_RT_STATUS_VALUES.includes(normalized) ? normalized : "NOT_STARTED";
}

function ensureAutoCheckStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return [
    "IDLE",
    "DUE",
    "CHECKING",
    "CHANGES_DETECTED",
    "NO_CHANGES",
    "ERROR"
  ].includes(normalized)
    ? normalized
    : "IDLE";
}

function buildUtcScheduleDate(year, monthIndex, dayOfMonth) {
  return new Date(Date.UTC(year, monthIndex, dayOfMonth, 9, 0, 0));
}

function getDefaultReviewSchedule(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear();
  const januaryFullReview = buildUtcScheduleDate(year, 0, 31);
  const julyLightCheck = buildUtcScheduleDate(year, 6, 31);

  return {
    reviewCadence: "ANNUAL_JAN_PLUS_JULY_CHECK",
    nextFullReviewAt: referenceDate.getTime() <= januaryFullReview.getTime()
      ? januaryFullReview
      : buildUtcScheduleDate(year + 1, 0, 31),
    nextLightCheckAt: referenceDate.getTime() <= julyLightCheck.getTime()
      ? julyLightCheck
      : buildUtcScheduleDate(year + 1, 6, 31)
  };
}

function buildReviewSchedule(row) {
  const defaults = getDefaultReviewSchedule();
  const now = Date.now();
  const nextFullReviewAt = row?.nextFullReviewAt || defaults.nextFullReviewAt;
  const nextLightCheckAt = row?.nextLightCheckAt || defaults.nextLightCheckAt;
  const autoCheckStatus = ensureAutoCheckStatus(row?.autoCheckStatus);
  const fullReviewDue = nextFullReviewAt ? new Date(nextFullReviewAt).getTime() <= now : false;
  const lightCheckDue = nextLightCheckAt ? new Date(nextLightCheckAt).getTime() <= now : false;

  let state = "ON_TRACK";
  if (autoCheckStatus === "CHANGES_DETECTED") state = "CHANGES_DETECTED";
  else if (autoCheckStatus === "ERROR") state = "ERROR";
  else if (autoCheckStatus === "CHECKING") state = "CHECKING";
  else if (fullReviewDue) state = "FULL_REVIEW_DUE";
  else if (lightCheckDue || autoCheckStatus === "DUE") state = "LIGHT_CHECK_DUE";
  else if (autoCheckStatus === "NO_CHANGES") state = "NO_CHANGES";

  return {
    reviewCadence: String(row?.reviewCadence || defaults.reviewCadence),
    autoCheckStatus,
    lastFullReviewAt: row?.lastFullReviewAt || null,
    nextFullReviewAt,
    lastLightCheckAt: row?.lastLightCheckAt || null,
    nextLightCheckAt,
    lastChangeDetectedAt: row?.lastChangeDetectedAt || null,
    fullReviewDue,
    lightCheckDue,
    state
  };
}

function buildRtReviewSchedule(row) {
  const defaults = getDefaultReviewSchedule();
  const now = Date.now();
  const nextLightCheckAt = row?.rtNextLightCheckAt || defaults.nextLightCheckAt;
  const autoCheckStatus = ensureAutoCheckStatus(row?.rtAutoCheckStatus);
  const lightCheckDue = nextLightCheckAt ? new Date(nextLightCheckAt).getTime() <= now : false;

  let state = "ON_TRACK";
  if (autoCheckStatus === "CHANGES_DETECTED") state = "CHANGES_DETECTED";
  else if (autoCheckStatus === "ERROR") state = "ERROR";
  else if (autoCheckStatus === "CHECKING") state = "CHECKING";
  else if (lightCheckDue || autoCheckStatus === "DUE") state = "LIGHT_CHECK_DUE";
  else if (autoCheckStatus === "NO_CHANGES") state = "NO_CHANGES";

  return {
    autoCheckStatus,
    lastLightCheckAt: row?.rtLastLightCheckAt || null,
    nextLightCheckAt,
    lastChangeDetectedAt: row?.rtLastChangeDetectedAt || null,
    state
  };
}

function summarizeLightCheckResult(summary) {
  const normalized = summary && typeof summary === "object" ? summary : {};
  return {
    mode: typeof normalized.mode === "string" ? normalized.mode : null,
    checkedSourceCount: Number(normalized.checkedSourceCount || 0),
    reachableSourceCount: Number(normalized.reachableSourceCount || 0),
    changedSourceCount: Number(normalized.changedSourceCount || 0),
    newSourceCount: Number(normalized.newSourceCount || 0),
    removedSourceCount: Number(normalized.removedSourceCount || 0),
    errorCount: Number(normalized.errorCount || 0),
    checkedAt: normalized.checkedAt || null,
    changedSources: Array.isArray(normalized.changedSources) ? normalized.changedSources.slice(0, 20) : [],
    removedSources: Array.isArray(normalized.removedSources) ? normalized.removedSources.slice(0, 20) : [],
    errorSources: Array.isArray(normalized.errorSources) ? normalized.errorSources.slice(0, 20) : []
  };
}

function buildSourceSnapshotKey(source = {}) {
  const key = String(source?.key || "").trim();
  const url = String(source?.url || "").trim();
  return key || url;
}

async function fetchSourceSnapshot(source = {}) {
  const url = String(source?.url || "").trim();
  const key = String(source?.key || "").trim();
  const title = String(source?.title || "").trim();
  const type = String(source?.type || "").trim();
  const checkedAt = new Date().toISOString();

  if (!url) {
    return {
      key,
      title,
      type,
      url,
      checkedAt,
      ok: false,
      statusCode: null,
      contentType: null,
      size: 0,
      sha256: null,
      error: "Source URL is missing"
    };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "SotsiaalAI-KOV-LightCheck/1.0"
      }
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      key,
      title,
      type,
      url,
      checkedAt,
      ok: response.ok,
      statusCode: response.status,
      contentType: response.headers.get("content-type") || null,
      size: buffer.length,
      sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
      error: response.ok ? null : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      key,
      title,
      type,
      url,
      checkedAt,
      ok: false,
      statusCode: null,
      contentType: null,
      size: 0,
      sha256: null,
      error: String(error?.message || "Source fetch failed").slice(0, 300)
    };
  }
}

function invalidValidation(message) {
  return {
    validationStatus: "INVALID",
    validationMessage: String(message || "Validation failed").slice(0, 240),
    validatedAt: new Date()
  };
}

function stableUniqueStrings(values = []) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function normalizeIngestErrorMessage(error) {
  const payloadMessage = error?.payload?.message || error?.payload?.detail || error?.payload?.error;
  const message = String(payloadMessage || error?.message || "RAG ingest failed").trim();
  return message.slice(0, 1000);
}

function getFileRecordByKey(row, fileKey) {
  const roleMeta = KOV_FILE_ROLE_META[fileKey];
  if (!roleMeta) return null;
  return Array.isArray(row?.files)
    ? row.files.find(item => item.role === roleMeta.dbRole) || null
    : null;
}

function computeLayerFileSummary(filesMap, requiredKeys = []) {
  const presentKeys = [];
  const validKeys = [];
  const invalidKeys = [];
  const missingKeys = [];

  for (const key of requiredKeys) {
    const file = filesMap?.[key];
    if (file?.status !== "missing") presentKeys.push(key);
    if (file?.validationStatus === "VALID") validKeys.push(key);
    if (file?.validationStatus === "INVALID") invalidKeys.push(key);
    if (file?.validationStatus === "MISSING") missingKeys.push(key);
  }

  return {
    presentCount: presentKeys.length,
    validCount: validKeys.length,
    invalidCount: invalidKeys.length,
    missingCount: missingKeys.length,
    presentKeys,
    validKeys,
    invalidKeys,
    missingKeys,
    allFilesValid: validKeys.length === requiredKeys.length
  };
}

function computeIngestSummary(row, filesMap) {
  const base = computeLayerFileSummary(filesMap, KOV_WEB_FILE_KEYS);

  const blockingIssues = [];
  if (base.missingKeys.length) {
    blockingIssues.push(`Missing required files: ${base.missingKeys.join(", ")}`);
  }
  if (base.invalidKeys.length) {
    blockingIssues.push(`Invalid files: ${base.invalidKeys.join(", ")}`);
  }
  if (row?.readyForIngest !== true) {
    blockingIssues.push("Ready for ingest is not enabled");
  }

  return {
    ...base,
    canIngest: blockingIssues.length === 0,
    blockingIssues
  };
}

function computeRtIngestSummary(row, filesMap) {
  const base = computeLayerFileSummary(filesMap, KOV_RT_FILE_KEYS);
  const blockingIssues = [];

  if (base.missingKeys.length) {
    blockingIssues.push(`Missing RT files: ${base.missingKeys.join(", ")}`);
  }
  if (base.invalidKeys.length) {
    blockingIssues.push(`Invalid RT files: ${base.invalidKeys.join(", ")}`);
  }
  if (ensureRtStatus(row?.rtStatus) !== "READY") {
    blockingIssues.push("RT status is not marked ready");
  }

  return {
    ...base,
    canIngest: blockingIssues.length === 0,
    blockingIssues
  };
}

function computeCombinedLayerReadiness(row, webIngestSummary, rtIngestSummary) {
  const webReady = webIngestSummary?.canIngest === true || ensureIngestStatus(row?.ingestStatus) === "INGESTED";
  const rtReady = rtIngestSummary?.canIngest === true || ensureIngestStatus(row?.rtIngestStatus) === "INGESTED";
  const readyLayerCount = Number(webReady) + Number(rtReady);
  const fullyIngested =
    ensureIngestStatus(row?.ingestStatus) === "INGESTED"
    && ensureIngestStatus(row?.rtIngestStatus) === "INGESTED";

  let state = "NOT_READY";
  if (fullyIngested) state = "BOTH_INGESTED";
  else if (webReady && rtReady) state = "BOTH_READY";
  else if (webReady) state = "WEB_READY";
  else if (rtReady) state = "RT_READY";

  return {
    state,
    webReady,
    rtReady,
    readyLayerCount,
    totalLayers: 2,
    fullyIngested
  };
}

function deriveDefaultIngestStatus(row, filesMap) {
  const current = ensureIngestStatus(row?.ingestStatus);
  if (current === "INGESTING") return current;
  if (current === "INGESTED" || current === "ERROR") return current;
  return computeIngestSummary(row, filesMap).canIngest ? "READY" : "NOT_INGESTED";
}

export function buildKovRagDocId(slug) {
  return `kov-${String(slug || "").trim().toLowerCase()}`;
}

export function buildKovRtRagDocId(slug) {
  return `kov-rt-${String(slug || "").trim().toLowerCase()}`;
}

export async function ensureMunicipalityBaseData() {
  const count = await prisma.municipality.count();
  if (count > 0) return count;

  const entries = await loadMunicipalitySeedEntries();
  if (!entries.length) return 0;

  await prisma.municipality.createMany({
    data: entries.map(entry => ({
      slug: entry.slug,
      baseName: entry.baseName,
      type: entry.type,
      displayName: entry.displayName,
      county: entry.county,
      isActive: entry.isActive !== false
    })),
    skipDuplicates: true
  });

  return prisma.municipality.count();
}

export async function ensureKovAdminSeeded() {
  await ensureMunicipalityBaseData();
  const defaultSchedule = getDefaultReviewSchedule();

  const municipalities = await prisma.municipality.findMany({
    select: { id: true }
  });

  if (!municipalities.length) return 0;

  const existing = await prisma.municipalityKovAdmin.findMany({
    select: { municipalityId: true }
  });

  const existingIds = new Set(existing.map(item => item.municipalityId));
  const missing = municipalities.filter(item => !existingIds.has(item.id));

  if (missing.length) {
    await prisma.municipalityKovAdmin.createMany({
      data: missing.map(item => ({
        municipalityId: item.id,
        status: "NOT_STARTED",
        readyForIngest: false,
        reviewCadence: defaultSchedule.reviewCadence,
        nextFullReviewAt: defaultSchedule.nextFullReviewAt,
        nextLightCheckAt: defaultSchedule.nextLightCheckAt
      })),
      skipDuplicates: true
    });
  }

  await prisma.municipalityKovAdmin.updateMany({
    where: { nextFullReviewAt: null },
    data: { nextFullReviewAt: defaultSchedule.nextFullReviewAt }
  });
  await prisma.municipalityKovAdmin.updateMany({
    where: { nextLightCheckAt: null },
    data: { nextLightCheckAt: defaultSchedule.nextLightCheckAt }
  });

  return municipalities.length;
}

function serializeFile(file, municipalitySlug) {
  const key = KOV_DB_ROLE_TO_KEY[file.role];
  if (!key) return null;
  return {
    key,
    role: file.role,
    originalName: file.originalName,
    mime: file.mime,
    size: file.size,
    version: file.version,
    uploadedAt: file.updatedAt?.toISOString?.() || file.createdAt?.toISOString?.() || null,
    status: file.version > 1 ? "replaced" : "uploaded",
    validationStatus: file.validationStatus || "INVALID",
    validationMessage: file.validationMessage || "",
    validatedAt: file.validatedAt?.toISOString?.() || null,
    downloadUrl: `/api/admin/rag/kov/${encodeURIComponent(municipalitySlug)}/files/${encodeURIComponent(KOV_FILE_ROLE_META[key].paramRole)}/download`
  };
}

export function serializeKovAdmin(row) {
  const filesMap = Object.fromEntries(
    KOV_FILE_KEYS.map(key => [
      key,
      {
        key,
        role: KOV_FILE_ROLE_META[key].dbRole,
        originalName: null,
        mime: null,
        size: null,
        version: 0,
        uploadedAt: null,
        status: "missing",
        validationStatus: "MISSING",
        validationMessage: "",
        validatedAt: null,
        downloadUrl: null
      }
    ])
  );

  for (const file of row.files || []) {
    const serialized = serializeFile(file, row.municipality.slug);
    if (serialized) {
      filesMap[serialized.key] = serialized;
    }
  }

  const webFiles = Object.fromEntries(KOV_WEB_FILE_KEYS.map(key => [key, filesMap[key]]));
  const rtFiles = Object.fromEntries(KOV_RT_FILE_KEYS.map(key => [key, filesMap[key]]));
  const webFileSummary = computeLayerFileSummary(filesMap, KOV_WEB_FILE_KEYS);
  const rtFileSummary = computeLayerFileSummary(filesMap, KOV_RT_FILE_KEYS);
  const lastValidatedAt = Object.values(filesMap)
    .map(file => file.validatedAt)
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || null;
  const ingestSummary = computeIngestSummary(row, webFiles);
  const rtIngestSummary = computeRtIngestSummary(row, rtFiles);
  const combinedReadiness = computeCombinedLayerReadiness(row, ingestSummary, rtIngestSummary);
  const storedStatus = ensureStatus(row.status);
  const storedReadyForIngest = row.readyForIngest === true;
  const effectiveReadyForIngest = storedReadyForIngest && ingestSummary.canIngest;
  const effectiveStatus =
    storedStatus === "READY_FOR_INGEST" && !effectiveReadyForIngest
      ? "NEEDS_REVIEW"
      : storedStatus;
  const reviewSchedule = buildReviewSchedule(row);
  const rtReviewSchedule = buildRtReviewSchedule(row);
  const lightCheckSummary = summarizeLightCheckResult(row.lastLightCheckSummary);
  const rtLightCheckSummary = summarizeLightCheckResult(row.rtLastLightCheckSummary);
  const ingestStatus = deriveDefaultIngestStatus(row, filesMap);
  const rtIngestStatus = (() => {
    const current = ensureIngestStatus(row.rtIngestStatus);
    if (current === "INGESTING") return current;
    if (current === "INGESTED" || current === "ERROR") return current;
    return rtIngestSummary.canIngest ? "READY" : "NOT_INGESTED";
  })();

  return {
    slug: row.municipality.slug,
    displayName: row.municipality.displayName,
    county: row.municipality.county || "",
    type: row.municipality.type,
    isActive: row.municipality.isActive === true,
    officialWebsite: row.officialWebsite || "",
    riigiTeatajaUrl: row.riigiTeatajaUrl || "",
    status: effectiveStatus,
    checkedAt: row.checkedAt?.toISOString?.() || null,
    lastValidatedAt,
    notes: row.notes || "",
    readyForIngest: effectiveReadyForIngest,
    ingestStatus,
    lastIngestedAt: row.lastIngestedAt?.toISOString?.() || null,
    lastIngestError: row.lastIngestError || "",
    ragDocId: row.ragDocId || buildKovRagDocId(row.municipality.slug),
    rtCheckedAt: row.rtCheckedAt?.toISOString?.() || null,
    rtNotes: row.rtNotes || "",
    rtStatus: ensureRtStatus(row.rtStatus),
    rtIngestStatus,
    rtLastIngestedAt: row.rtLastIngestedAt?.toISOString?.() || null,
    rtLastIngestError: row.rtLastIngestError || "",
    rtRagDocId: row.rtRagDocId || buildKovRtRagDocId(row.municipality.slug),
    reviewCadence: reviewSchedule.reviewCadence,
    autoCheckStatus: reviewSchedule.autoCheckStatus,
    lastFullReviewAt: reviewSchedule.lastFullReviewAt?.toISOString?.() || null,
    nextFullReviewAt: reviewSchedule.nextFullReviewAt?.toISOString?.() || null,
    lastLightCheckAt: reviewSchedule.lastLightCheckAt?.toISOString?.() || null,
    nextLightCheckAt: reviewSchedule.nextLightCheckAt?.toISOString?.() || null,
    lastChangeDetectedAt: reviewSchedule.lastChangeDetectedAt?.toISOString?.() || null,
    reviewSchedule,
    lightCheckSummary,
    rtAutoCheckStatus: rtReviewSchedule.autoCheckStatus,
    rtLastLightCheckAt: rtReviewSchedule.lastLightCheckAt?.toISOString?.() || null,
    rtNextLightCheckAt: rtReviewSchedule.nextLightCheckAt?.toISOString?.() || null,
    rtLastChangeDetectedAt: rtReviewSchedule.lastChangeDetectedAt?.toISOString?.() || null,
    rtReviewSchedule,
    rtLightCheckSummary,
    fileCount: webFileSummary.presentCount,
    rtFileCount: rtFileSummary.presentCount,
    validationSummary: {
      presentCount: webFileSummary.presentCount,
      validCount: webFileSummary.validCount,
      invalidCount: webFileSummary.invalidCount,
      missingCount: webFileSummary.missingCount,
      invalidKeys: webFileSummary.invalidKeys,
      missingKeys: webFileSummary.missingKeys,
      allFilesValid: webFileSummary.allFilesValid
    },
    ingestSummary,
    rtIngestSummary,
    combinedReadiness,
    webFiles,
    rtFiles,
    webSummary: webFileSummary,
    rtSummary: rtFileSummary,
    files: filesMap
  };
}

export async function listKovAdminEntries() {
  await ensureKovAdminSeeded();

  const rows = await prisma.municipalityKovAdmin.findMany({
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: {
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });

  return rows
    .sort((left, right) => {
      const countyCompare = String(left.municipality.county || "").localeCompare(String(right.municipality.county || ""), "et");
      if (countyCompare !== 0) return countyCompare;
      return String(left.municipality.displayName || "").localeCompare(String(right.municipality.displayName || ""), "et");
    })
    .map(serializeKovAdmin);
}

export async function getKovAdminEntryBySlug(slug) {
  await ensureKovAdminSeeded();

  const normalizedSlug = String(slug || "").trim().toLowerCase();
  if (!normalizedSlug) return null;

  const row = await prisma.municipalityKovAdmin.findFirst({
    where: {
      municipality: {
        slug: normalizedSlug
      }
    },
    include: {
      municipality: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: {
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });

  return row;
}

export async function syncKovAdminIngestStatusById(kovAdminId) {
  const row = await prisma.municipalityKovAdmin.findUnique({
    where: { id: kovAdminId },
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: true
    }
  });

  if (!row) return null;

  const current = ensureIngestStatus(row.ingestStatus);
  const rtCurrent = ensureIngestStatus(row.rtIngestStatus);
  const serialized = serializeKovAdmin(row);
  const nextStatus =
    current === "INGESTING"
      ? "INGESTING"
      : serialized.ingestSummary.canIngest
        ? "READY"
        : "NOT_INGESTED";
  const nextRtStatus =
    rtCurrent === "INGESTING"
      ? "INGESTING"
      : serialized.rtIngestSummary.canIngest
        ? "READY"
        : "NOT_INGESTED";

  if (
    current === nextStatus
    && rtCurrent === nextRtStatus
    && (!row.lastIngestError || current === "ERROR")
    && (!row.rtLastIngestError || rtCurrent === "ERROR")
  ) {
    return serialized;
  }

  const updated = await prisma.municipalityKovAdmin.update({
    where: { id: kovAdminId },
    data: {
      ingestStatus: nextStatus,
      lastIngestError: nextStatus === "ERROR" ? row.lastIngestError : null,
      rtIngestStatus: nextRtStatus,
      rtLastIngestError: nextRtStatus === "ERROR" ? row.rtLastIngestError : null
    },
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: true
    }
  });

  return serializeKovAdmin(updated);
}

export async function updateKovAdminEntryBySlug(slug, payload = {}) {
  const row = await getKovAdminEntryBySlug(slug);
  if (!row) return null;

  const data = {};
  if ("officialWebsite" in payload) data.officialWebsite = normalizeUrl(payload.officialWebsite);
  if ("riigiTeatajaUrl" in payload) data.riigiTeatajaUrl = normalizeUrl(payload.riigiTeatajaUrl);
  if ("status" in payload) data.status = ensureStatus(payload.status);
  if ("checkedAt" in payload) data.checkedAt = normalizeCheckedAt(payload.checkedAt);
  if ("notes" in payload) data.notes = normalizeNotes(payload.notes);
  if ("rtCheckedAt" in payload) data.rtCheckedAt = normalizeCheckedAt(payload.rtCheckedAt);
  if ("rtNotes" in payload) data.rtNotes = normalizeNotes(payload.rtNotes);
  if ("rtStatus" in payload) data.rtStatus = ensureRtStatus(payload.rtStatus);
  if ("readyForIngest" in payload) data.readyForIngest = payload.readyForIngest === true;
  if ("reviewCadence" in payload) data.reviewCadence = String(payload.reviewCadence || "").trim() || "ANNUAL_JAN_PLUS_JULY_CHECK";
  if ("autoCheckStatus" in payload) data.autoCheckStatus = ensureAutoCheckStatus(payload.autoCheckStatus);
  if ("lastFullReviewAt" in payload) data.lastFullReviewAt = normalizeCheckedAt(payload.lastFullReviewAt);
  if ("nextFullReviewAt" in payload) data.nextFullReviewAt = normalizeCheckedAt(payload.nextFullReviewAt);
  if ("lastLightCheckAt" in payload) data.lastLightCheckAt = normalizeCheckedAt(payload.lastLightCheckAt);
  if ("nextLightCheckAt" in payload) data.nextLightCheckAt = normalizeCheckedAt(payload.nextLightCheckAt);
  if ("lastChangeDetectedAt" in payload) data.lastChangeDetectedAt = normalizeCheckedAt(payload.lastChangeDetectedAt);
  if ("rtAutoCheckStatus" in payload) data.rtAutoCheckStatus = ensureAutoCheckStatus(payload.rtAutoCheckStatus);
  if ("rtLastLightCheckAt" in payload) data.rtLastLightCheckAt = normalizeCheckedAt(payload.rtLastLightCheckAt);
  if ("rtNextLightCheckAt" in payload) data.rtNextLightCheckAt = normalizeCheckedAt(payload.rtNextLightCheckAt);
  if ("rtLastChangeDetectedAt" in payload) data.rtLastChangeDetectedAt = normalizeCheckedAt(payload.rtLastChangeDetectedAt);

  const updated = await prisma.municipalityKovAdmin.update({
    where: { id: row.id },
    data,
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: true
    }
  });

  await syncKovAdminIngestStatusById(updated.id);
  const refreshed = await getKovAdminEntryBySlug(slug);
  return refreshed ? serializeKovAdmin(refreshed) : serializeKovAdmin(updated);
}

async function revalidateKovFileRecord(entry, file) {
  const fileKey = resolveKovFileKeyFromDbRole(file.role);
  if (!fileKey) return null;

  let validation = invalidValidation("Unknown KOV file role");

  try {
    const buffer = await readStoredKovFile(file.storagePath);
    validation = validateKovFileContent({
      fileKey,
      text: buffer.toString("utf8"),
      slug: entry.municipality.slug,
      displayName: entry.municipality.displayName
    });
  } catch (error) {
    validation = invalidValidation(
      error?.code === "ENOENT" ? "Stored file is missing from disk" : error?.message || "Stored file could not be read"
    );
  }

  await prisma.municipalityKovAdminFile.update({
    where: {
      kovAdminId_role: {
        kovAdminId: entry.id,
        role: file.role
      }
    },
    data: {
      validationStatus: validation.validationStatus,
      validationMessage: validation.validationMessage,
      validatedAt: validation.validatedAt
    }
  });

  return validation;
}

export async function revalidateKovEntryBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  for (const fileKey of KOV_WEB_FILE_KEYS) {
    const file = getFileRecordByKey(entry, fileKey);
    if (!file) continue;
    await revalidateKovFileRecord(entry, file);
  }

  await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: { checkedAt: new Date() }
  });
  await syncKovAdminIngestStatusById(entry.id);

  const updated = await getKovAdminEntryBySlug(slug);
  return updated ? serializeKovAdmin(updated) : null;
}

export async function revalidateKovRtEntryBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  for (const fileKey of KOV_RT_FILE_KEYS) {
    const file = getFileRecordByKey(entry, fileKey);
    if (!file) continue;
    await revalidateKovFileRecord(entry, file);
  }

  await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: { rtCheckedAt: new Date() }
  });
  await syncKovAdminIngestStatusById(entry.id);

  const updated = await getKovAdminEntryBySlug(slug);
  return updated ? serializeKovAdmin(updated) : null;
}

export async function revalidateKovRtEntriesBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await revalidateKovRtEntryBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}

export async function runKovLightCheckBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  const sourcesText = await readKovFileText(entry, "sourcesJson");
  if (!sourcesText) {
    const error = new Error("sources.json is missing");
    error.status = 400;
    throw error;
  }

  const sourcesPayload = parseJsonOrThrow(sourcesText, `${entry.municipality.slug}.sources.json`);
  const sources = Array.isArray(sourcesPayload?.sources) ? sourcesPayload.sources : [];
  const uniqueSources = [];
  const seen = new Set();

  for (const source of sources) {
    const snapshotKey = buildSourceSnapshotKey(source);
    if (!snapshotKey || seen.has(snapshotKey)) continue;
    seen.add(snapshotKey);
    uniqueSources.push(source);
  }

  if (!uniqueSources.length) {
    const error = new Error("sources.json does not contain any usable sources");
    error.status = 400;
    throw error;
  }

  await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: {
      autoCheckStatus: "CHECKING"
    }
  });

  const previousSnapshot = Array.isArray(entry.lightCheckSnapshot) ? entry.lightCheckSnapshot : [];
  const previousByKey = new Map(previousSnapshot.map(item => [buildSourceSnapshotKey(item), item]));
  const currentSnapshot = [];
  const changedSources = [];
  const errorSources = [];
  let reachableSourceCount = 0;
  let changedSourceCount = 0;
  let newSourceCount = 0;

  for (const source of uniqueSources) {
    const nextSnapshot = await fetchSourceSnapshot(source);
    currentSnapshot.push(nextSnapshot);

    if (nextSnapshot.ok) reachableSourceCount += 1;
    if (nextSnapshot.error) errorSources.push({ key: nextSnapshot.key, url: nextSnapshot.url, error: nextSnapshot.error });

    const previous = previousByKey.get(buildSourceSnapshotKey(nextSnapshot));
    if (!previous) {
      if (previousSnapshot.length) {
        newSourceCount += 1;
        changedSourceCount += 1;
        changedSources.push({
          key: nextSnapshot.key,
          url: nextSnapshot.url,
          reason: "new_source"
        });
      }
      continue;
    }

    if (
      String(previous?.sha256 || "") !== String(nextSnapshot.sha256 || "")
      || Number(previous?.statusCode || 0) !== Number(nextSnapshot.statusCode || 0)
      || String(previous?.contentType || "") !== String(nextSnapshot.contentType || "")
    ) {
      changedSourceCount += 1;
      changedSources.push({
        key: nextSnapshot.key,
        url: nextSnapshot.url,
        reason: "content_changed"
      });
    }
  }

  const currentKeys = new Set(currentSnapshot.map(item => buildSourceSnapshotKey(item)));
  const removedSources = previousSnapshot
    .filter(item => !currentKeys.has(buildSourceSnapshotKey(item)))
    .map(item => ({
      key: item?.key || "",
      url: item?.url || "",
      reason: "source_removed"
    }));

  const checkedAt = new Date();
  const baselineCreated = previousSnapshot.length === 0;
  const totalChanges = changedSourceCount + removedSources.length;
  const nextAutoCheckStatus =
    totalChanges > 0
      ? "CHANGES_DETECTED"
      : errorSources.length > 0
        ? "ERROR"
        : "NO_CHANGES";

  const summary = {
    mode: baselineCreated ? "BASELINE_CREATED" : "COMPARE",
    checkedSourceCount: currentSnapshot.length,
    reachableSourceCount,
    changedSourceCount: totalChanges,
    newSourceCount,
    removedSourceCount: removedSources.length,
    errorCount: errorSources.length,
    checkedAt: checkedAt.toISOString(),
    changedSources,
    removedSources,
    errorSources
  };

  const updated = await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: {
      autoCheckStatus: nextAutoCheckStatus,
      lastLightCheckAt: checkedAt,
      lastChangeDetectedAt: totalChanges > 0 ? checkedAt : entry.lastChangeDetectedAt,
      lightCheckSnapshot: currentSnapshot,
      lastLightCheckSummary: summary
    },
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: true
    }
  });

  return serializeKovAdmin(updated);
}

export async function runKovRtLightCheckBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  const rtJsonText = await readKovFileText(entry, "rtJson");
  const rtPayload = rtJsonText ? parseJsonOrThrow(rtJsonText, `${entry.municipality.slug}.rt.json`) : null;
  const urlCandidates = stableUniqueStrings([
    entry.riigiTeatajaUrl,
    ...(Array.isArray(rtPayload?.sourceUrls) ? rtPayload.sourceUrls : []),
    ...(Array.isArray(rtPayload?.urls) ? rtPayload.urls : [])
  ]);

  const uniqueSources = urlCandidates.map((url, index) => ({
    key: index === 0 ? "riigi_teataja_primary" : `riigi_teataja_source_${index + 1}`,
    title: entry.municipality.displayName,
    type: "regulation",
    url
  }));

  if (!uniqueSources.length) {
    const error = new Error("RT allikad puuduvad");
    error.status = 400;
    throw error;
  }

  await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: {
      rtAutoCheckStatus: "CHECKING"
    }
  });

  const previousSnapshot = Array.isArray(entry.rtLightCheckSnapshot) ? entry.rtLightCheckSnapshot : [];
  const previousByKey = new Map(previousSnapshot.map(item => [buildSourceSnapshotKey(item), item]));
  const currentSnapshot = [];
  const changedSources = [];
  const errorSources = [];
  let reachableSourceCount = 0;
  let changedSourceCount = 0;
  let newSourceCount = 0;

  for (const source of uniqueSources) {
    const nextSnapshot = await fetchSourceSnapshot(source);
    currentSnapshot.push(nextSnapshot);

    if (nextSnapshot.ok) reachableSourceCount += 1;
    if (nextSnapshot.error) errorSources.push({ key: nextSnapshot.key, url: nextSnapshot.url, error: nextSnapshot.error });

    const previous = previousByKey.get(buildSourceSnapshotKey(nextSnapshot));
    if (!previous) {
      if (previousSnapshot.length) {
        newSourceCount += 1;
        changedSourceCount += 1;
        changedSources.push({
          key: nextSnapshot.key,
          url: nextSnapshot.url,
          reason: "new_source"
        });
      }
      continue;
    }

    if (
      String(previous?.sha256 || "") !== String(nextSnapshot.sha256 || "")
      || Number(previous?.statusCode || 0) !== Number(nextSnapshot.statusCode || 0)
      || String(previous?.contentType || "") !== String(nextSnapshot.contentType || "")
    ) {
      changedSourceCount += 1;
      changedSources.push({
        key: nextSnapshot.key,
        url: nextSnapshot.url,
        reason: "content_changed"
      });
    }
  }

  const currentKeys = new Set(currentSnapshot.map(item => buildSourceSnapshotKey(item)));
  const removedSources = previousSnapshot
    .filter(item => !currentKeys.has(buildSourceSnapshotKey(item)))
    .map(item => ({
      key: item?.key || "",
      url: item?.url || "",
      reason: "source_removed"
    }));

  const checkedAt = new Date();
  const baselineCreated = previousSnapshot.length === 0;
  const totalChanges = changedSourceCount + removedSources.length;
  const nextAutoCheckStatus =
    totalChanges > 0
      ? "CHANGES_DETECTED"
      : errorSources.length > 0
        ? "ERROR"
        : "NO_CHANGES";

  const summary = {
    mode: baselineCreated ? "BASELINE_CREATED" : "COMPARE",
    checkedSourceCount: currentSnapshot.length,
    reachableSourceCount,
    changedSourceCount: totalChanges,
    newSourceCount,
    removedSourceCount: removedSources.length,
    errorCount: errorSources.length,
    checkedAt: checkedAt.toISOString(),
    changedSources,
    removedSources,
    errorSources
  };

  const updated = await prisma.municipalityKovAdmin.update({
    where: { id: entry.id },
    data: {
      rtAutoCheckStatus: nextAutoCheckStatus,
      rtLastLightCheckAt: checkedAt,
      rtLastChangeDetectedAt: totalChanges > 0 ? checkedAt : entry.rtLastChangeDetectedAt,
      rtLightCheckSnapshot: currentSnapshot,
      rtLastLightCheckSummary: summary
    },
    include: {
      municipality: {
        select: {
          slug: true,
          displayName: true,
          county: true,
          type: true,
          isActive: true
        }
      },
      files: true
    }
  });

  return serializeKovAdmin(updated);
}

export async function runKovLightChecksBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await runKovLightCheckBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}

export async function runKovRtLightChecksBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await runKovRtLightCheckBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}

async function readKovFileText(entry, fileKey) {
  const file = getFileRecordByKey(entry, fileKey);
  if (!file) return null;
  const buffer = await readStoredKovFile(file.storagePath);
  return buffer.toString("utf8");
}

async function readRequiredKovIngestFiles(entry) {
  const ragText = await readKovFileText(entry, "ragMd");
  const metaText = await readKovFileText(entry, "metaJson");
  const sourcesText = await readKovFileText(entry, "sourcesJson");
  return {
    ragText,
    metaText,
    sourcesText
  };
}

async function readRequiredKovRtIngestFiles(entry) {
  const rtText = await readKovFileText(entry, "rtMd");
  const rtJsonText = await readKovFileText(entry, "rtJson");
  return {
    rtText,
    rtJsonText
  };
}

function parseJsonOrThrow(text, fileName) {
  try {
    return JSON.parse(String(text || ""));
  } catch {
    const error = new Error(`${fileName} is not readable JSON`);
    error.status = 400;
    throw error;
  }
}

function assertKovIngestPreconditions(entry) {
  const serialized = serializeKovAdmin(entry);
  const blockingIssues = [...(serialized.ingestSummary?.blockingIssues || [])];

  if (ensureIngestStatus(entry.ingestStatus) === "INGESTING") {
    blockingIssues.unshift("KOV ingest is already in progress");
  }

  if (!serialized.validationSummary?.allFilesValid) {
    if (!blockingIssues.length) {
      blockingIssues.push("All four required files must be valid before ingest");
    }
  }

  if (blockingIssues.length) {
    const error = new Error(blockingIssues.join(". "));
    error.status = 400;
    error.blockingIssues = blockingIssues;
    throw error;
  }

  return serialized;
}

function assertKovRtIngestPreconditions(entry) {
  const serialized = serializeKovAdmin(entry);
  const blockingIssues = [...(serialized.rtIngestSummary?.blockingIssues || [])];

  if (ensureIngestStatus(entry.rtIngestStatus) === "INGESTING") {
    blockingIssues.unshift("RT ingest is already in progress");
  }

  if (blockingIssues.length) {
    const error = new Error(blockingIssues.join(". "));
    error.status = 400;
    error.blockingIssues = blockingIssues;
    throw error;
  }

  return serialized;
}

function buildKovIngestMetadata(entry, metaPayload, sourcesPayload) {
  const sources = Array.isArray(sourcesPayload?.sources) ? sourcesPayload.sources : [];
  const sourceKeys = stableUniqueStrings(sources.map(source => source?.key));
  const sourceUrls = stableUniqueStrings(sources.map(source => source?.url));
  const coverage =
    metaPayload?.coverage && typeof metaPayload.coverage === "object" && !Array.isArray(metaPayload.coverage)
      ? metaPayload.coverage
      : null;
  const notes = stableUniqueStrings([
    rowNotesToSingleLine(entry.notes),
    ...(Array.isArray(metaPayload?.notes) ? metaPayload.notes : [])
  ]);
  const unresolvedIssues = stableUniqueStrings(Array.isArray(metaPayload?.unresolvedIssues) ? metaPayload.unresolvedIssues : []);

  return {
    title: `${entry.municipality.displayName} sotsiaalteenused ja toetused`,
    doc_id: buildKovRagDocId(entry.municipality.slug),
    collection_id: "kov_services",
    audience: "BOTH",
    country: "EE",
    county: entry.municipality.county || null,
    jurisdiction_level: "MUNICIPALITY",
    municipality_name: entry.municipality.displayName,
    municipality_slug: entry.municipality.slug,
    checked_at:
      metaPayload?.checkedAt
      || entry.checkedAt?.toISOString?.()
      || sourcesPayload?.checkedAt
      || null,
    officialWebsite: entry.officialWebsite || null,
    riigiTeatajaUrl: entry.riigiTeatajaUrl || null,
    source_urls: sourceUrls,
    source_keys: sourceKeys,
    source_count: sources.length,
    source_type: "municipality_kov",
    language: "et",
    meta_status: typeof metaPayload?.status === "string" ? metaPayload.status : null,
    coverage,
    notes,
    unresolved_issues: unresolvedIssues
  };
}

function buildKovRtIngestMetadata(entry, rtPayload) {
  const notes = stableUniqueStrings([
    rowNotesToSingleLine(entry.rtNotes),
    ...(Array.isArray(rtPayload?.notes) ? rtPayload.notes : [])
  ]);
  const sourceUrls = stableUniqueStrings([
    entry.riigiTeatajaUrl,
    ...(Array.isArray(rtPayload?.sourceUrls) ? rtPayload.sourceUrls : []),
    ...(Array.isArray(rtPayload?.urls) ? rtPayload.urls : [])
  ]);
  const sourceKeys = stableUniqueStrings(Array.isArray(rtPayload?.sourceKeys) ? rtPayload.sourceKeys : []);

  return {
    title: `${entry.municipality.displayName} Riigi Teataja oiguslik alus`,
    doc_id: buildKovRtRagDocId(entry.municipality.slug),
    collection_id: "kov_regulations",
    audience: "BOTH",
    country: "EE",
    county: entry.municipality.county || null,
    jurisdiction_level: "MUNICIPALITY",
    municipality_name: entry.municipality.displayName,
    municipality_slug: entry.municipality.slug,
    checked_at: entry.rtCheckedAt?.toISOString?.() || rtPayload?.checkedAt || null,
    officialWebsite: entry.officialWebsite || null,
    riigiTeatajaUrl: entry.riigiTeatajaUrl || null,
    source_urls: sourceUrls,
    source_keys: sourceKeys,
    source_type: "municipality_rt",
    language: "et",
    rt_status: ensureRtStatus(entry.rtStatus),
    notes,
    regulation_title: typeof rtPayload?.title === "string" ? rtPayload.title : null
  };
}

function rowNotesToSingleLine(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.replace(/\s+/g, " ") : "";
}

export async function ingestKovEntryBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  const serialized = assertKovIngestPreconditions(entry);
  const ragDocId = buildKovRagDocId(entry.municipality.slug);

  let ragText = "";
  let metaPayload = null;
  let sourcesPayload = null;

  try {
    const files = await readRequiredKovIngestFiles(entry);
    ragText = String(files.ragText || "").trim();
    metaPayload = parseJsonOrThrow(files.metaText, `${entry.municipality.slug}.meta.json`);
    sourcesPayload = parseJsonOrThrow(files.sourcesText, `${entry.municipality.slug}.sources.json`);

    if (!ragText) {
      const error = new Error("rag.md is empty");
      error.status = 400;
      throw error;
    }

    await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        ingestStatus: "INGESTING",
        lastIngestError: null,
        ragDocId
      }
    });

    await ragServiceRequest(
      "/ingest/text",
      {
        method: "POST",
        headers: buildRagHeaders("application/json", {
          route: "admin/rag/kov",
          stage: "kov_manual_ingest"
        }),
        body: JSON.stringify({
          doc_id: ragDocId,
          text: ragText,
          metadata: buildKovIngestMetadata(entry, metaPayload, sourcesPayload)
        })
      },
      "api.admin.kov.ingest_failed"
    );

    const updated = await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        ingestStatus: "INGESTED",
        lastIngestedAt: new Date(),
        lastIngestError: null,
        ragDocId
      },
      include: {
        municipality: {
          select: {
            slug: true,
            displayName: true,
            county: true,
            type: true,
            isActive: true
          }
        },
        files: true
      }
    });

    return serializeKovAdmin(updated);
  } catch (error) {
    await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        ingestStatus: "ERROR",
        lastIngestError: normalizeIngestErrorMessage(error),
        ragDocId
      }
    });
    error.serializedEntry = serialized;
    throw error;
  }
}

export async function ingestKovRtEntryBySlug(slug) {
  const entry = await getKovAdminEntryBySlug(slug);
  if (!entry) return null;

  assertKovRtIngestPreconditions(entry);
  const rtRagDocId = buildKovRtRagDocId(entry.municipality.slug);

  try {
    const files = await readRequiredKovRtIngestFiles(entry);
    const rtText = String(files.rtText || "").trim();
    const rtPayload = parseJsonOrThrow(files.rtJsonText, `${entry.municipality.slug}.rt.json`);

    if (!rtText) {
      const error = new Error("rt.md is empty");
      error.status = 400;
      throw error;
    }

    await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        rtIngestStatus: "INGESTING",
        rtLastIngestError: null,
        rtRagDocId
      }
    });

    await ragServiceRequest(
      "/ingest/text",
      {
        method: "POST",
        headers: buildRagHeaders("application/json", {
          route: "admin/rag/kov",
          stage: "kov_rt_manual_ingest"
        }),
        body: JSON.stringify({
          doc_id: rtRagDocId,
          text: rtText,
          metadata: buildKovRtIngestMetadata(entry, rtPayload)
        })
      },
      "api.admin.kov.ingest_failed"
    );

    const updated = await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        rtIngestStatus: "INGESTED",
        rtLastIngestedAt: new Date(),
        rtLastIngestError: null,
        rtRagDocId
      },
      include: {
        municipality: {
          select: {
            slug: true,
            displayName: true,
            county: true,
            type: true,
            isActive: true
          }
        },
        files: true
      }
    });

    return serializeKovAdmin(updated);
  } catch (error) {
    await prisma.municipalityKovAdmin.update({
      where: { id: entry.id },
      data: {
        rtIngestStatus: "ERROR",
        rtLastIngestError: normalizeIngestErrorMessage(error),
        rtRagDocId
      }
    });
    throw error;
  }
}

export async function ingestKovRtEntriesBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await ingestKovRtEntryBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}

export async function ingestKovEntriesBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await ingestKovEntryBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}

export async function revalidateKovEntriesBySlugs(slugs = []) {
  const normalized = [...new Set((Array.isArray(slugs) ? slugs : []).map(slug => String(slug || "").trim().toLowerCase()).filter(Boolean))];
  const items = [];

  for (const slug of normalized) {
    const item = await revalidateKovEntryBySlug(slug);
    if (item) items.push(item);
  }

  return items;
}
