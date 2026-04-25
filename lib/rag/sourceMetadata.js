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
  "source_type",
  "authority",
  "last_checked",
  "historical",
  "source_status"
]);

export function isKnownRagSourceType(value) {
  return RAG_SOURCE_TYPE_SET.has(String(value || "").trim());
}

export function isKnownRagSourceStatus(value) {
  return RAG_SOURCE_STATUS_SET.has(String(value || "").trim());
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
