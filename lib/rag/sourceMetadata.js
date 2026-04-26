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

export function isKnownRagSourceType(value) {
  return RAG_SOURCE_TYPE_SET.has(String(value || "").trim());
}

export function isKnownRagSourceStatus(value) {
  return RAG_SOURCE_STATUS_SET.has(String(value || "").trim());
}

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

export function validateRagSourceMetadataContract(record, options = {}) {
  const label = String(options.label || "source").trim();
  const requireMunicipality = options.requireMunicipality === true;
  const requireDocumentId = options.requireDocumentId !== false;
  const requireTitle = options.requireTitle !== false;
  const requireAudience = options.requireAudience !== false;
  const requireCanonicalItemId = options.requireCanonicalItemId === true;
  const requireChunkId = options.requireChunkId === true;
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
    const validAudience = new Set(["CLIENT", "SOCIAL_WORKER", "BOTH"]);
    for (const value of audienceValues) {
      if (!validAudience.has(String(value || "").trim())) {
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
