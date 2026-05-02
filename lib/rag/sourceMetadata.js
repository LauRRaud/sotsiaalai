export const RAG_METADATA_SCHEMA_VERSION = "v2.5";

export const RAG_SOURCE_TYPES = Object.freeze([
  "law",
  "national_law",
  "regulation",
  "kov_regulation",
  "court_decision",
  "state_guide",
  "kov_service_info",
  "official_form",
  "application_form",
  "web_form",
  "pdf_form",
  "contact_page",
  "official_contact",
  "journal_article",
  "official_guideline",
  "information_material",
  "research_report",
  "policy_analysis",
  "methodology_material",
  "practice_example",
  "project_description",
  "personal_story",
  "opinion",
  "historical_source",
  "service_standard",
  "quality_guideline",
  "methodology_guide",
  "template",
  "faq",
  "partner_service_info"
]);

export const RAG_SOURCE_TYPE_SET = new Set(RAG_SOURCE_TYPES);

export const KOV_RAG_SOURCE_TYPES = Object.freeze([
  "kov_service_info",
  "kov_regulation",
  "application_form",
  "web_form",
  "pdf_form",
  "official_form",
  "official_contact",
  "contact_page",
  "partner_service_info",
  "faq"
]);

export const KOV_RAG_SOURCE_TYPE_SET = new Set(KOV_RAG_SOURCE_TYPES);

export const RAG_SOURCE_STATUSES = Object.freeze([
  "active",
  "inactive",
  "stale",
  "archived",
  "unknown"
]);

export const RAG_SOURCE_STATUS_SET = new Set(RAG_SOURCE_STATUSES);

export const RAG_METADATA_REQUIRED_FOR_READINESS = Object.freeze([
  "metadata_schema_version",
  "source_id",
  "document_id",
  "title",
  "source_type",
  "authority",
  "language",
  "audience",
  "last_checked",
  "historical",
  "source_status"
]);

export const RAG_METADATA_RECOMMENDED_FOR_READINESS = Object.freeze([
  "chunk_id",
  "canonical_item_id",
  "valid_from",
  "valid_to",
  "content_hash",
  "url_canonical"
]);

const VALID_AUDIENCE = new Set(["CLIENT", "SOCIAL_WORKER", "BOTH"]);
const STATUS_ACTIVE_HINTS = new Set(["active", "current", "kehtiv"]);
const STATUS_ARCHIVED_HINTS = new Set(["archived", "archive", "ended"]);
const STATUS_INACTIVE_HINTS = new Set(["inactive"]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isDateOnly(value) {
  if (value == null || value === "") return true;
  if (!isNonEmptyString(value)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
  const parsed = new Date(`${value.trim()}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value.trim();
}

function hasValue(record, field) {
  if (!isObject(record)) return false;
  const value = record[field];
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function hasScalarValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function firstValue(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      if (value.length > 0) return value;
      continue;
    }
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && !value.trim()) continue;
    return value;
  }
  return null;
}

function toTrimmedString(value) {
  return hasScalarValue(value) ? String(value).trim() : null;
}

function toDateOnly(value) {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  return null;
}

function normalizeAudienceArray(values = []) {
  const out = [];
  for (const value of values) {
    const normalized = String(value || "").trim().toUpperCase();
    if (!normalized) continue;
    if (normalized === "BOTH") {
      out.push("CLIENT", "SOCIAL_WORKER");
      continue;
    }
    if (VALID_AUDIENCE.has(normalized)) out.push(normalized);
  }
  return [...new Set(out)];
}

function normalizeAudienceValue(value) {
  if (Array.isArray(value)) return normalizeAudienceArray(value);
  if (!hasScalarValue(value)) return null;
  const normalized = String(value).trim().toUpperCase();
  return VALID_AUDIENCE.has(normalized) ? normalized : null;
}

function normalizeStatusHint(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized || null;
}

function normalizedText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function looksLikeJournalArticle(record = {}) {
  const journalTitle = normalizedText(firstValue(record.journalTitle, record.journal_title));
  const docId = normalizedText(firstValue(record.docId, record.document_id, record.documentId));
  const articleId = firstValue(record.articleId, record.article_id);
  const issueLabel = firstValue(record.issueLabel, record.issue_label);
  const year = firstValue(record.year);

  return journalTitle === "sotsiaaltoo" ||
    docId.startsWith("sotsiaaltoo-") ||
    (hasScalarValue(articleId) && hasScalarValue(issueLabel) && hasScalarValue(year));
}

function normalizeSourceTypeForCanonical(record = {}) {
  const raw = toTrimmedString(firstValue(
    record.source_type,
    record.sourceType,
    record.type
  ));
  if (raw === "file" && looksLikeJournalArticle(record)) return "journal_article";
  if (!raw && looksLikeJournalArticle(record)) return "journal_article";
  return raw;
}

export function isKnownRagSourceType(value) {
  return RAG_SOURCE_TYPE_SET.has(String(value || "").trim());
}

export function isKnownRagSourceStatus(value) {
  return RAG_SOURCE_STATUS_SET.has(String(value || "").trim());
}

export function deriveHistoricalValue(record = {}) {
  const historical = firstValue(record.historical, record.is_historical, record.isHistorical);
  const normalizedHistorical = toBoolean(historical);
  if (normalizedHistorical !== null) return normalizedHistorical;

  const currentVersion = firstValue(record.is_current_version, record.isCurrentVersion);
  const normalizedCurrentVersion = toBoolean(currentVersion);
  if (normalizedCurrentVersion !== null) return !normalizedCurrentVersion;

  if (looksLikeJournalArticle(record)) return true;

  return false;
}

export function deriveCanonicalSourceStatus(record = {}) {
  const explicit = normalizeStatusHint(firstValue(record.source_status, record.sourceStatus));
  if (explicit && isKnownRagSourceStatus(explicit)) return explicit;

  const contentStatus = normalizeStatusHint(firstValue(record.content_status, record.contentStatus, record.status));
  if (contentStatus) {
    if (STATUS_ACTIVE_HINTS.has(contentStatus)) return "active";
    if (STATUS_INACTIVE_HINTS.has(contentStatus)) return "inactive";
    if (STATUS_ARCHIVED_HINTS.has(contentStatus)) return "archived";
    if (isKnownRagSourceStatus(contentStatus)) return contentStatus;
  }

  const currentVersion = firstValue(record.is_current_version, record.isCurrentVersion);
  const normalizedCurrentVersion = toBoolean(currentVersion);
  if (normalizedCurrentVersion === false) return "archived";
  if (normalizedCurrentVersion === true) return "active";

  if (looksLikeJournalArticle(record)) return "active";

  return "unknown";
}

export function normalizeRagSourceMetadata(record = {}, options = {}) {
  const root = isObject(record) ? record : {};
  const nestedMetadata = isObject(root.metadata) ? root.metadata : {};
  const merged = {
    ...root,
    ...nestedMetadata
  };

  const legacyJournalArticle = looksLikeJournalArticle(merged);
  const canonicalSourceType = normalizeSourceTypeForCanonical(merged);
  const audience = normalizeAudienceValue(firstValue(
    merged.audience,
    merged.audiences,
    root.audience,
    root.audiences
  ));

  const canonical = {
    metadata_schema_version: toTrimmedString(firstValue(
      merged.metadata_schema_version,
      merged.metadataSchemaVersion,
      options.metadataSchemaVersion,
      RAG_METADATA_SCHEMA_VERSION
    )),
    source_id: toTrimmedString(firstValue(
      merged.source_id,
      merged.sourceId,
      merged.canonical_source_id,
      merged.canonicalSourceId,
      merged.articleId,
      merged.article_id,
      root.source_id,
      root.sourceId,
      root.canonical_source_id,
      root.canonicalSourceId,
      root.articleId,
      root.article_id
    )),
    document_id: toTrimmedString(firstValue(
      merged.document_id,
      merged.documentId,
      merged.docId,
      root.document_id,
      root.documentId,
      root.docId
    )),
    chunk_id: toTrimmedString(firstValue(
      merged.chunk_id,
      merged.chunkId,
      root.chunk_id,
      root.chunkId
    )),
    title: toTrimmedString(firstValue(merged.title, root.title)),
    source_type: canonicalSourceType,
    authority: toTrimmedString(firstValue(merged.authority, root.authority, legacyJournalArticle ? "editorial" : null)),
    language: toTrimmedString(firstValue(merged.language, root.language, options.defaultLanguage, "et"))?.toLowerCase() || "et",
    audience,
    last_checked: toDateOnly(firstValue(
      merged.last_checked,
      merged.lastChecked,
      merged.checked_at,
      merged.checkedAt,
      root.last_checked,
      root.lastChecked,
      root.checked_at,
      root.checkedAt
    )),
    valid_from: toDateOnly(firstValue(
      merged.valid_from,
      merged.validFrom,
      merged.effective_start,
      merged.effectiveStart,
      root.valid_from,
      root.validFrom,
      root.effective_start,
      root.effectiveStart
    )),
    valid_to: toDateOnly(firstValue(
      merged.valid_to,
      merged.validTo,
      merged.effective_end,
      merged.effectiveEnd,
      root.valid_to,
      root.validTo,
      root.effective_end,
      root.effectiveEnd
    )),
    historical: deriveHistoricalValue(merged),
    source_status: deriveCanonicalSourceStatus(merged),
    content_hash: toTrimmedString(firstValue(
      merged.content_hash,
      merged.contentHash,
      root.content_hash,
      root.contentHash
    )),
    url_canonical: toTrimmedString(firstValue(
      merged.url_canonical,
      merged.urlCanonical,
      merged.url,
      merged.officialUrl,
      merged.source_url,
      merged.sourceUrl,
      root.url_canonical,
      root.urlCanonical,
      root.url,
      root.officialUrl,
      root.source_url,
      root.sourceUrl
    )),
    collection_id: toTrimmedString(firstValue(merged.collection_id, merged.collectionId, root.collection_id, root.collectionId, legacyJournalArticle ? "sotsiaaltoo_articles" : null)),
    jurisdiction_level: toTrimmedString(firstValue(merged.jurisdiction_level, merged.jurisdictionLevel, root.jurisdiction_level, root.jurisdictionLevel)),
    act_title: toTrimmedString(firstValue(merged.act_title, merged.actTitle, root.act_title, root.actTitle)),
    act_reference: toTrimmedString(firstValue(merged.act_reference, merged.actReference, root.act_reference, root.actReference)),
    act_type: toTrimmedString(firstValue(merged.act_type, merged.actType, root.act_type, root.actType)),
    issuer: toTrimmedString(firstValue(merged.issuer, root.issuer)),
    chapter_number: toTrimmedString(firstValue(merged.chapter_number, merged.chapterNumber, root.chapter_number, root.chapterNumber)),
    chapter_title: toTrimmedString(firstValue(merged.chapter_title, merged.chapterTitle, root.chapter_title, root.chapterTitle)),
    section_title: toTrimmedString(firstValue(merged.section_title, merged.sectionTitle, root.section_title, root.sectionTitle)),
    paragraph_number: toTrimmedString(firstValue(merged.paragraph_number, merged.paragraphNumber, root.paragraph_number, root.paragraphNumber)),
    paragraph_title: toTrimmedString(firstValue(merged.paragraph_title, merged.paragraphTitle, root.paragraph_title, root.paragraphTitle)),
    subsection_number: toTrimmedString(firstValue(merged.subsection_number, merged.subsectionNumber, root.subsection_number, root.subsectionNumber)),
    point_number: toTrimmedString(firstValue(merged.point_number, merged.pointNumber, root.point_number, root.pointNumber)),
    municipality_id: toTrimmedString(firstValue(merged.municipality_id, merged.municipalityId, root.municipality_id, root.municipalityId)),
    municipality_name: toTrimmedString(firstValue(
      merged.municipality_name,
      merged.municipalityName,
      root.municipality_name,
      root.municipalityName,
      root.municipality
    )),
    canonical_item_id: toTrimmedString(firstValue(merged.canonical_item_id, merged.canonicalItemId, root.canonical_item_id, root.canonicalItemId)),
    item_type: toTrimmedString(firstValue(merged.item_type, merged.itemType, root.item_type, root.itemType)),
    resource_type: toTrimmedString(firstValue(merged.resource_type, merged.resourceType, root.resource_type, root.resourceType)),
    source_urls: Array.isArray(firstValue(merged.source_urls, merged.sourceUrls, merged.sourceKeys, root.source_urls, root.sourceUrls, root.sourceKeys))
      ? [...new Set(firstValue(merged.source_urls, merged.sourceUrls, merged.sourceKeys, root.source_urls, root.sourceUrls, root.sourceKeys).map(item => String(item || "").trim()).filter(Boolean))]
      : [],
    journalTitle: toTrimmedString(firstValue(merged.journalTitle, merged.journal_title, root.journalTitle, root.journal_title)),
    issueId: toTrimmedString(firstValue(merged.issueId, merged.issue_id, root.issueId, root.issue_id)),
    issueLabel: toTrimmedString(firstValue(merged.issueLabel, merged.issue_label, root.issueLabel, root.issue_label)),
    articleId: toTrimmedString(firstValue(merged.articleId, merged.article_id, root.articleId, root.article_id)),
    authors: Array.isArray(firstValue(merged.authors, root.authors))
      ? [...new Set(firstValue(merged.authors, root.authors).map(item => String(item || "").trim()).filter(Boolean))]
      : [],
    year: firstValue(merged.year, root.year),
    section: toTrimmedString(firstValue(merged.section, root.section)),
    pageRange: toTrimmedString(firstValue(merged.pageRange, merged.page_range, root.pageRange, root.page_range))
  };

  const normalized = {
    ...root,
    ...nestedMetadata,
    ...canonical
  };

  if (options.includeUrlAlias === true) {
    normalized.url = canonical.url_canonical;
  }

  return normalized;
}

export function validateRagSourceMetadataContract(record, options = {}) {
  const label = String(options.label || "source").trim();
  const requireMunicipality = options.requireMunicipality === true;
  const requireDocumentId = options.requireDocumentId !== false;
  const requireTitle = options.requireTitle !== false;
  const requireAudience = options.requireAudience !== false;
  const requireCanonicalItemId = options.requireCanonicalItemId === true;
  const requireChunkId = options.requireChunkId === true;
  const requireMetadataSchemaVersion = options.requireMetadataSchemaVersion === true;
  const errors = [];
  const warnings = [];

  if (!isObject(record)) {
    return {
      ok: false,
      errors: [`${label}: expected object`],
      warnings
    };
  }

  const required = [
    ...(requireMetadataSchemaVersion ? ["metadata_schema_version"] : []),
    "source_id",
    ...(requireDocumentId ? ["document_id"] : []),
    ...(requireTitle ? ["title"] : []),
    "source_type",
    "authority",
    "language",
    ...(requireAudience ? ["audience"] : []),
    "last_checked",
    "historical",
    "source_status",
    ...(requireMunicipality ? ["municipality_id"] : []),
    ...(requireCanonicalItemId ? ["canonical_item_id"] : []),
    ...(requireChunkId ? ["chunk_id"] : [])
  ];

  for (const field of required) {
    if (!hasValue(record, field)) errors.push(`${label}.${field}: missing required RAG metadata`);
  }

  if (hasValue(record, "source_type") && !isKnownRagSourceType(record.source_type)) {
    errors.push(`${label}.source_type: invalid RAG source type "${record.source_type}"`);
  }
  if (hasValue(record, "source_status") && !isKnownRagSourceStatus(record.source_status)) {
    errors.push(`${label}.source_status: invalid value "${record.source_status}"`);
  }
  if (hasValue(record, "language") && String(record.language).trim() !== "et") {
    errors.push(`${label}.language: expected "et"`);
  }
  if ("historical" in record && typeof record.historical !== "boolean") {
    errors.push(`${label}.historical: expected boolean`);
  }
  if (hasValue(record, "last_checked") && !isDateOnly(record.last_checked)) {
    errors.push(`${label}.last_checked: expected YYYY-MM-DD`);
  }
  for (const field of ["valid_from", "valid_to"]) {
    if (field in record && record[field] != null && record[field] !== "" && !isDateOnly(record[field])) {
      errors.push(`${label}.${field}: expected YYYY-MM-DD or null`);
    }
  }
  if (requireAudience && hasValue(record, "audience")) {
    const audienceValues = Array.isArray(record.audience) ? record.audience : [record.audience];
    for (const value of audienceValues) {
      if (!VALID_AUDIENCE.has(String(value || "").trim())) {
        errors.push(`${label}.audience: invalid value "${value}"`);
      }
    }
  }

  const recommended = [
    ...(requireDocumentId ? [] : ["document_id"]),
    ...(requireTitle ? [] : ["title"]),
    ...RAG_METADATA_RECOMMENDED_FOR_READINESS
  ];
  for (const field of recommended) {
    if (!hasValue(record, field)) warnings.push(`${label}.${field}: missing recommended RAG metadata`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

export function assertRagSourceMetadataContract(record, options = {}) {
  const result = validateRagSourceMetadataContract(record, options);
  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
  return result;
}

export function mapKovItemStatusToRagSourceStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "ended" || normalized === "inactive") return "inactive";
  if (normalized === "unclear") return "unknown";
  return "unknown";
}

export function inferKovItemRagSourceType(itemType, resourceType = "") {
  const type = String(itemType || "").trim().toLowerCase();
  const resource = String(resourceType || "").trim().toLowerCase();
  if (type === "contact" || resource === "contact" || resource === "institution") return "official_contact";
  if (type === "form") return "application_form";
  if (type === "resource") {
    if (resource === "guidance") return "state_guide";
    return "partner_service_info";
  }
  if (type === "service" || type === "benefit") return "kov_service_info";
  return "kov_service_info";
}
