import prisma from "@/lib/prisma";

export const SOURCE_PACKAGE_REVIEW_STATUSES = new Set(["pending", "reviewed", "archived"]);
export const SOURCE_PACKAGE_ACTIONS = new Set(["mark_reviewed", "archive"]);

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

export function computeSourcePackageReviewFlags(row = {}) {
  const missing = new Set(missingSections(row));
  const membership = sourceMembership(row);
  const municipalities = new Set(membership.map(source => source.municipality_id).filter(Boolean));
  const invalidCurrentEvidence = membership.some(source => {
    const currentEvidence = source.sections.some(section => ["forms", "contacts", "legal_basis", "fees", "deadlines"].includes(section));
    const sourceStatus = String(source.source_status || "").toLowerCase();
    return currentEvidence && (
      source.evidence_allowed === false ||
      source.historical === true ||
      (sourceStatus && sourceStatus !== "active")
    );
  });
  return {
    missing_forms: missing.has("forms"),
    missing_contacts: missing.has("contacts"),
    missing_legal_basis: missing.has("legal_basis"),
    missing_fees: missing.has("fees"),
    missing_deadlines: missing.has("deadlines"),
    package_conflict: municipalities.size > 1,
    invalid_current_evidence: invalidCurrentEvidence
  };
}

export function serializeSourcePackageSnapshot(row = {}, { detail = false } = {}) {
  const flags = computeSourcePackageReviewFlags(row);
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
    reviewFlags: flags
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
    sourceMembership: sourceMembership(row)
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

export async function listSourcePackageSnapshots(params = {}, client = prisma) {
  const delegate = client.sourcePackageSnapshot;
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
  const row = await client.sourcePackageSnapshot.findUnique({ where: { id } });
  return row ? serializeSourcePackageSnapshot(row, { detail: true }) : null;
}

export function resolveAdminIdentity(session = null) {
  return clean(session?.user?.email) || clean(session?.user?.id) || "admin";
}

export async function reviewSourcePackageSnapshot(id, action, options = {}, client = prisma) {
  if (!SOURCE_PACKAGE_ACTIONS.has(action)) {
    const error = new Error("Unsupported source package review action");
    error.code = "UNSUPPORTED_ACTION";
    throw error;
  }
  const reviewedBy = clean(options.reviewedBy) || "admin";
  const reviewNote = clean(options.reviewNote);
  const now = new Date();
  const data = action === "archive"
    ? {
        reviewStatus: "archived",
        status: "archived",
        active: false,
        reviewedAt: now,
        reviewedBy,
        reviewNote
      }
    : {
        reviewStatus: "reviewed",
        reviewedAt: now,
        reviewedBy,
        reviewNote
      };
  const row = await client.sourcePackageSnapshot.update({
    where: { id },
    data
  });
  return serializeSourcePackageSnapshot(row, { detail: true });
}
