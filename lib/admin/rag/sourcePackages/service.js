import prisma from "@/lib/prisma";
import {
  buildSectionAttributionSummary,
  buildSourcePackageGapItem
} from "@/lib/admin/rag/sourcePackages/gapReport";

export const SOURCE_PACKAGE_REVIEW_STATUSES = new Set(["pending", "reviewed", "archived"]);
export const SOURCE_PACKAGE_ACTIONS = new Set(["mark_reviewed", "archive", "restore_active", "recompute"]);

const IMPORTANT_SECTIONS_BY_PACKAGE_TYPE = {
  kov_service: ["forms", "contacts", "legal_basis"],
  kov_benefit: ["forms", "contacts", "legal_basis"],
  kov_form: ["forms"],
  kov_contact: ["contacts"]
};

const CURRENT_EVIDENCE_SECTIONS = new Set(["forms", "contacts", "legal_basis", "fees", "deadlines"]);

const REVIEW_REASON_CATALOG = {
  missing_forms: {
    severity: "warning",
    label: "Taotlusvormi allikas puudub."
  },
  missing_contacts: {
    severity: "warning",
    label: "Kontaktiallikas puudub."
  },
  missing_legal_basis: {
    severity: "warning",
    label: "Oigusliku aluse allikas puudub."
  },
  missing_fees: {
    severity: "info",
    label: "Tasude allikas puudub."
  },
  missing_deadlines: {
    severity: "info",
    label: "Tahtaja allikas puudub."
  },
  package_conflict: {
    severity: "error",
    label: "Paketi allikates on vastuoluline KOV signaal."
  },
  invalid_current_evidence: {
    severity: "error",
    label: "Current evidence rollis on ajalooline voi mittesobiv allikas."
  }
};

function clean(value) {
  const text = String(value || "").trim();
  return text || null;
}

function boolParam(value) {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return null;
}

function intParam(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function missingSections(row = {}) {
  return arrayValue(row.missingSections).map(clean).filter(Boolean);
}

function sourceMembership(row = {}) {
  return arrayValue(row.sourceMembership).map(source => ({
    source_id: clean(source?.source_id),
    source_type: clean(source?.source_type),
    collection_id: clean(source?.collection_id),
    item_type: clean(source?.item_type),
    resource_type: clean(source?.resource_type),
    municipality_id: clean(source?.municipality_id),
    source_status: clean(source?.source_status),
    historical: source?.historical === true,
    sections: arrayValue(source?.sections).map(clean).filter(Boolean),
    evidence_allowed: source?.evidence_allowed !== false,
    evidence_strength: clean(source?.evidence_strength)
  })).filter(source => source.source_id);
}

function sectionSummary(row = {}) {
  const summary = row.sectionSummary && typeof row.sectionSummary === "object" ? row.sectionSummary : {};
  return Object.fromEntries(Object.entries(summary).map(([key, value]) => [
    key,
    {
      count: Number(value?.count || 0),
      source_ids: arrayValue(value?.source_ids).map(clean).filter(Boolean)
    }
  ]));
}

function computePackageConflict(row = {}, siblingRows = []) {
  const canonicalItemId = clean(row.canonicalItemId || row.canonical_item_id);
  const municipalityId = clean(row.municipalityId || row.municipality_id);
  if (!canonicalItemId) return false;
  const municipalities = new Set([municipalityId, ...siblingRows.map(item => clean(item?.municipalityId || item?.municipality_id))].filter(Boolean));
  return municipalities.size > 1;
}

export function computeSourcePackageReviewFlags(row = {}, options = {}) {
  const missing = new Set(missingSections(row));
  const membership = sourceMembership(row);
  const municipalities = new Set(membership.map(source => source.municipality_id).filter(Boolean));
  const invalidCurrentEvidence = membership.some(source => {
    const currentEvidence = source.sections.some(section => CURRENT_EVIDENCE_SECTIONS.has(section));
    const sourceStatus = String(source.source_status || "").toLowerCase();
    return currentEvidence && (
      source.evidence_allowed === false ||
      source.historical === true ||
      (sourceStatus && sourceStatus !== "active")
    );
  });
  const packageConflict = options.packageConflict ?? municipalities.size > 1;
  return {
    missing_forms: missing.has("forms"),
    missing_contacts: missing.has("contacts"),
    missing_legal_basis: missing.has("legal_basis"),
    missing_fees: missing.has("fees"),
    missing_deadlines: missing.has("deadlines"),
    package_conflict: packageConflict,
    invalid_current_evidence: invalidCurrentEvidence
  };
}

export function buildSourcePackageReviewReasons(flags = {}) {
  return Object.entries(flags)
    .filter(([, value]) => value === true)
    .map(([code]) => ({
      code,
      severity: REVIEW_REASON_CATALOG[code]?.severity || "info",
      label: REVIEW_REASON_CATALOG[code]?.label || code.replaceAll("_", " ")
    }));
}

function computeSnapshotStatus(row = {}, options = {}) {
  const packageType = clean(row.packageType || row.package_type) || "unknown";
  const importantSections = IMPORTANT_SECTIONS_BY_PACKAGE_TYPE[packageType] || [];
  const missing = missingSections(row);
  const flags = computeSourcePackageReviewFlags(row, options);
  const missingImportant = importantSections.some(section => missing.includes(section));
  return missingImportant || flags.package_conflict || flags.invalid_current_evidence ? "needs_review" : "active";
}

function serializeReviewEvent(row = {}) {
  return {
    id: row.id,
    action: row.action,
    actor: row.actor,
    note: row.note,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    fromReviewStatus: row.fromReviewStatus,
    toReviewStatus: row.toReviewStatus,
    fromActive: row.fromActive,
    toActive: row.toActive,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : null,
    createdAt: row.createdAt
  };
}

function serializeHistory(rows = []) {
  return arrayValue(rows).map(serializeReviewEvent);
}

export function serializeSourcePackageSnapshot(row = {}, { detail = false, history = [], packageConflict = undefined } = {}) {
  const flags = computeSourcePackageReviewFlags(row, { packageConflict });
  const reasons = buildSourcePackageReviewReasons(flags);
  const base = {
    id: row.id,
    packageId: row.packageId,
    canonicalItemId: row.canonicalItemId,
    municipalityId: row.municipalityId,
    packageType: row.packageType,
    title: row.title,
    status: row.status,
    reviewStatus: row.reviewStatus || "pending",
    confidence: row.confidence,
    missingSections: missingSections(row),
    version: row.version,
    active: row.active === true,
    lastBuiltAt: row.lastBuiltAt,
    lastChecked: row.lastChecked,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    reviewedAt: row.reviewedAt,
    reviewedBy: row.reviewedBy,
    reviewNote: row.reviewNote,
    reviewFlags: flags,
    reviewReasons: reasons,
    packageAttributionChecked: true,
    highRiskAttributionChecked: false,
    attributionFlags: reasons.map(reason => reason.code),
    sectionAttributionSummary: buildSectionAttributionSummary(row),
    gapSummary: buildSourcePackageGapItem(row).gaps
  };

  if (!detail) {
    return {
      ...base,
      sectionSummary: sectionSummary(row),
      sourceMembership: sourceMembership(row).map(source => ({
        source_id: source.source_id,
        source_type: source.source_type,
        resource_type: source.resource_type,
        sections: source.sections,
        evidence_allowed: source.evidence_allowed,
        evidence_strength: source.evidence_strength
      }))
    };
  }

  return {
    ...base,
    sectionSummary: sectionSummary(row),
    sourceMembership: sourceMembership(row),
    history: serializeHistory(history)
  };
}

export function buildSourcePackageWhere(params = {}) {
  const where = {};
  const status = clean(params.status);
  if (status) where.status = status;
  const reviewStatus = clean(params.reviewStatus);
  if (reviewStatus) where.reviewStatus = reviewStatus;
  const municipalityId = clean(params.municipalityId);
  if (municipalityId) where.municipalityId = municipalityId;
  const packageType = clean(params.packageType);
  if (packageType) where.packageType = packageType;
  const active = boolParam(params.active);
  if (active !== null) where.active = active;
  const needsReview = boolParam(params.needsReview);
  if (needsReview === true) where.status = "needs_review";
  if (needsReview === false && !where.status) where.status = { not: "needs_review" };
  return where;
}

function clientOrTransaction(client = prisma) {
  return client || prisma;
}

async function inTransaction(client, work) {
  const db = clientOrTransaction(client);
  if (typeof db.$transaction === "function") {
    return db.$transaction(work);
  }
  return work(db);
}

async function findSnapshotOrThrow(id, client) {
  const row = await client.sourcePackageSnapshot.findUnique({ where: { id } });
  if (row) return row;
  const error = new Error("Source package snapshot not found");
  error.code = "P2025";
  throw error;
}

async function listSiblingSnapshots(row, client) {
  const canonicalItemId = clean(row?.canonicalItemId);
  if (!canonicalItemId) return [];
  return client.sourcePackageSnapshot.findMany({
    where: {
      canonicalItemId,
      id: { not: row.id }
    },
    select: {
      id: true,
      municipalityId: true
    }
  });
}

async function createReviewEvent(client, snapshot, action, actor, note, nextState, metadata = null) {
  const delegate = client.sourcePackageSnapshotReviewEvent;
  if (!delegate) return null;
  return delegate.create({
    data: {
      snapshotId: snapshot.id,
      packageId: snapshot.packageId,
      action,
      actor,
      note,
      fromStatus: snapshot.status,
      toStatus: nextState.status,
      fromReviewStatus: snapshot.reviewStatus || "pending",
      toReviewStatus: nextState.reviewStatus || "pending",
      fromActive: snapshot.active === true,
      toActive: nextState.active === true,
      metadata
    }
  });
}

export async function listSourcePackageSnapshots(params = {}, client = prisma) {
  const db = clientOrTransaction(client);
  const delegate = db.sourcePackageSnapshot;
  const limit = intParam(params.limit, 50, 1, 200);
  const offset = intParam(params.offset, 0, 0, 100000);
  const where = buildSourcePackageWhere(params);
  const [total, rows] = await Promise.all([
    delegate.count({ where }),
    delegate.findMany({
      where,
      orderBy: [
        { active: "desc" },
        { status: "asc" },
        { lastBuiltAt: "desc" }
      ],
      skip: offset,
      take: limit
    })
  ]);
  return {
    total,
    limit,
    offset,
    items: rows.map(row => serializeSourcePackageSnapshot(row))
  };
}

export async function getSourcePackageSnapshot(id, client = prisma) {
  const db = clientOrTransaction(client);
  const row = await db.sourcePackageSnapshot.findUnique({ where: { id } });
  if (!row) return null;

  let history = [];
  if (db.sourcePackageSnapshotReviewEvent) {
    try {
      history = await db.sourcePackageSnapshotReviewEvent.findMany({
        where: { snapshotId: id },
        orderBy: { createdAt: "desc" },
        take: 20
      });
    } catch {
      history = [];
    }
  }

  const siblings = await listSiblingSnapshots(row, db);
  const packageConflict = computePackageConflict(row, siblings);
  return serializeSourcePackageSnapshot(row, { detail: true, history, packageConflict });
}

export function resolveAdminIdentity(session = null) {
  return clean(session?.user?.email) || clean(session?.user?.id) || "admin";
}

function reviewMetadataForState(reviewStatus, now, reviewedBy, reviewNote) {
  if (reviewStatus === "reviewed" || reviewStatus === "archived") {
    return {
      reviewedAt: now,
      reviewedBy,
      reviewNote
    };
  }
  return {
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null
  };
}

function preserveExistingReviewMetadata(snapshot = {}, reviewStatus, now, reviewedBy, reviewNote) {
  if (reviewStatus === "pending") {
    return reviewMetadataForState(reviewStatus, now, reviewedBy, reviewNote);
  }
  return {
    reviewedAt: snapshot.reviewedAt ?? now,
    reviewedBy: snapshot.reviewedBy ?? reviewedBy,
    reviewNote: snapshot.reviewNote ?? reviewNote
  };
}

export async function reviewSourcePackageSnapshot(id, action, options = {}, client = prisma) {
  if (!SOURCE_PACKAGE_ACTIONS.has(action)) {
    const error = new Error("Unsupported source package review action");
    error.code = "UNSUPPORTED_ACTION";
    throw error;
  }

  return inTransaction(client, async (tx) => {
    const reviewedBy = clean(options.reviewedBy) || "admin";
    const reviewNote = clean(options.reviewNote);
    const now = new Date();
    const snapshot = await findSnapshotOrThrow(id, tx);
    const siblings = await listSiblingSnapshots(snapshot, tx);
    const packageConflict = computePackageConflict(snapshot, siblings);
    const recomputedStatus = computeSnapshotStatus(snapshot, { packageConflict });

    if (action === "mark_reviewed") {
      const nextReviewStatus = "reviewed";
      const row = await tx.sourcePackageSnapshot.update({
        where: { id },
        data: {
          reviewStatus: nextReviewStatus,
          ...reviewMetadataForState(nextReviewStatus, now, reviewedBy, reviewNote)
        }
      });
      await createReviewEvent(tx, snapshot, action, reviewedBy, reviewNote, row, {
        reason_codes: buildSourcePackageReviewReasons(computeSourcePackageReviewFlags(snapshot, { packageConflict })).map(reason => reason.code)
      });
      return serializeSourcePackageSnapshot(row, { detail: true, packageConflict });
    }

    if (action === "archive") {
      const nextReviewStatus = "archived";
      const row = await tx.sourcePackageSnapshot.update({
        where: { id },
        data: {
          reviewStatus: nextReviewStatus,
          status: "archived",
          active: false,
          ...reviewMetadataForState(nextReviewStatus, now, reviewedBy, reviewNote)
        }
      });
      await createReviewEvent(tx, snapshot, action, reviewedBy, reviewNote, row);
      return serializeSourcePackageSnapshot(row, { detail: true, packageConflict });
    }

    if (action === "restore_active") {
      const displaced = await tx.sourcePackageSnapshot.findMany({
        where: {
          packageId: snapshot.packageId,
          active: true,
          id: { not: id }
        },
        select: { id: true }
      });

      if (displaced.length) {
        await tx.sourcePackageSnapshot.updateMany({
          where: {
            packageId: snapshot.packageId,
            active: true,
            id: { not: id }
          },
          data: {
            active: false,
            status: "archived"
          }
        });
      }

      const nextReviewStatus = snapshot.reviewStatus === "reviewed" ? "reviewed" : "pending";
      const row = await tx.sourcePackageSnapshot.update({
        where: { id },
        data: {
          active: true,
          status: recomputedStatus,
          reviewStatus: nextReviewStatus,
          ...preserveExistingReviewMetadata(snapshot, nextReviewStatus, now, reviewedBy, reviewNote)
        }
      });
      await createReviewEvent(tx, snapshot, action, reviewedBy, reviewNote, row, {
        displaced_snapshot_ids: displaced.map(item => item.id),
        reason_codes: buildSourcePackageReviewReasons(computeSourcePackageReviewFlags(snapshot, { packageConflict })).map(reason => reason.code)
      });
      return serializeSourcePackageSnapshot(row, { detail: true, packageConflict });
    }

    const nextReviewStatus = recomputedStatus === "needs_review"
      ? "pending"
      : snapshot.reviewStatus;
    const row = await tx.sourcePackageSnapshot.update({
      where: { id },
      data: {
        status: snapshot.active === true ? recomputedStatus : snapshot.status,
        reviewStatus: nextReviewStatus,
        ...preserveExistingReviewMetadata(snapshot, nextReviewStatus, now, reviewedBy, reviewNote)
      }
    });
    await createReviewEvent(tx, snapshot, action, reviewedBy, reviewNote, row, {
      recomputed_status: recomputedStatus,
      reason_codes: buildSourcePackageReviewReasons(computeSourcePackageReviewFlags(snapshot, { packageConflict })).map(reason => reason.code)
    });
    return serializeSourcePackageSnapshot(row, { detail: true, packageConflict });
  });
}
