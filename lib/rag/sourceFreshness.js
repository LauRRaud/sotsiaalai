import {
  isKnownRagSourceStatus,
  isKnownRagSourceType
} from "./sourceMetadata.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const RAG_SOURCE_FRESHNESS_POLICIES = Object.freeze({
  application_form: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  web_form: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  pdf_form: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  official_form: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  official_contact: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  contact_page: { maxAgeDays: 90, priority: "high", currentEvidence: true },
  kov_service_info: { maxAgeDays: 180, priority: "high", currentEvidence: true },
  partner_service_info: { maxAgeDays: 180, priority: "medium", currentEvidence: true },
  faq: { maxAgeDays: 180, priority: "medium", currentEvidence: true },
  kov_regulation: { maxAgeDays: 365, priority: "high", currentEvidence: true },
  national_law: { maxAgeDays: 365, priority: "high", currentEvidence: true },
  law: { maxAgeDays: 365, priority: "high", currentEvidence: true },
  regulation: { maxAgeDays: 365, priority: "high", currentEvidence: true },
  state_guide: { maxAgeDays: 365, priority: "medium", currentEvidence: true },
  service_standard: { maxAgeDays: 365, priority: "medium", currentEvidence: true },
  quality_guideline: { maxAgeDays: 365, priority: "medium", currentEvidence: true },
  methodology_guide: { maxAgeDays: 730, priority: "low", currentEvidence: false },
  template: { maxAgeDays: 365, priority: "medium", currentEvidence: false },
  journal_article: { maxAgeDays: null, priority: "low", currentEvidence: false },
  practice_example: { maxAgeDays: null, priority: "low", currentEvidence: false },
  project_description: { maxAgeDays: null, priority: "low", currentEvidence: false },
  personal_story: { maxAgeDays: null, priority: "low", currentEvidence: false },
  opinion: { maxAgeDays: null, priority: "low", currentEvidence: false },
  historical_source: { maxAgeDays: null, priority: "low", currentEvidence: false },
  court_decision: { maxAgeDays: 365, priority: "medium", currentEvidence: true }
});

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function parseMetadata(value) {
  if (isObject(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && !value.trim()) continue;
    return value;
  }
  return null;
}

function toDateOnly(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  const parsed = new Date(`${match[1]}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === match[1] ? match[1] : null;
}

function dayDiff(later, earlierDateOnly) {
  const laterDate = new Date(Date.UTC(later.getUTCFullYear(), later.getUTCMonth(), later.getUTCDate()));
  const earlier = new Date(`${earlierDateOnly}T00:00:00Z`);
  return Math.floor((laterDate.getTime() - earlier.getTime()) / DAY_MS);
}

function normalizeAudience(value) {
  if (Array.isArray(value)) return value.map(item => String(item || "").trim()).filter(Boolean);
  if (value == null || value === "") return [];
  return [String(value).trim()];
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item || "").trim()).filter(Boolean);
  if (value == null || value === "") return [];
  return [String(value).trim()].filter(Boolean);
}

function normalizeCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function firstCount(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    return normalizeCount(value);
  }
  return 0;
}

export function normalizeSourceMetadataForFreshness(record = {}) {
  const root = isObject(record) ? record : {};
  const metadata = parseMetadata(root.metadata);
  const sourceType = firstValue(metadata.source_type, metadata.sourceType, root.source_type, root.sourceType, root.type);
  const explicitSourceStatus = firstValue(
    metadata.source_status,
    metadata.sourceStatus,
    metadata.content_status,
    metadata.contentStatus,
    root.source_status,
    root.sourceStatus
  );
  const rootStatus = typeof root.status === "string" && isKnownRagSourceStatus(root.status.trim().toLowerCase())
    ? root.status.trim().toLowerCase()
    : null;
  const sourceStatus = firstValue(explicitSourceStatus, rootStatus);

  return {
    source_id: firstValue(metadata.source_id, metadata.sourceId, root.source_id, root.sourceId, root.id),
    document_id: firstValue(metadata.document_id, metadata.documentId, root.document_id, root.documentId, root.remoteId, root.id),
    chunk_id: firstValue(metadata.chunk_id, metadata.chunkId, root.chunk_id, root.chunkId),
    canonical_item_id: firstValue(metadata.canonical_item_id, metadata.canonicalItemId, root.canonical_item_id, root.canonicalItemId),
    title: firstValue(metadata.title, root.title, root.fileName, root.name),
    source_type: sourceType ? String(sourceType).trim() : null,
    authority: firstValue(metadata.authority, root.authority),
    audience: normalizeAudience(firstValue(metadata.audience, metadata.audiences, root.audience, root.audiences)),
    language: firstValue(metadata.language, root.language),
    municipality_id: firstValue(metadata.municipality_id, metadata.municipalityId, root.municipality_id, root.municipalityId),
    item_type: firstValue(metadata.item_type, metadata.itemType, root.item_type, root.itemType),
    service_name: firstValue(metadata.service_name, metadata.serviceName, root.service_name, root.serviceName),
    sections_present: normalizeStringArray(firstValue(metadata.sections_present, metadata.sectionsPresent, root.sections_present, root.sectionsPresent)),
    forms_count: firstCount(metadata.forms_count, metadata.formsCount, metadata.forms, root.forms_count, root.formsCount, root.forms),
    related_forms_count: firstCount(
      metadata.related_forms_count,
      metadata.relatedFormsCount,
      metadata.related_forms,
      metadata.relatedForms,
      root.related_forms_count,
      root.relatedFormsCount,
      root.related_forms,
      root.relatedForms
    ),
    contacts_count: firstCount(metadata.contacts_count, metadata.contactsCount, metadata.contacts, root.contacts_count, root.contactsCount, root.contacts),
    related_contacts_count: firstCount(
      metadata.related_contacts_count,
      metadata.relatedContactsCount,
      metadata.related_contacts,
      metadata.relatedContacts,
      root.related_contacts_count,
      root.relatedContactsCount,
      root.related_contacts,
      root.relatedContacts
    ),
    legal_basis_count: firstCount(metadata.legal_basis_count, metadata.legalBasisCount, metadata.legal_basis, metadata.legalBasis, root.legal_basis_count, root.legalBasisCount, root.legal_basis, root.legalBasis),
    last_checked: toDateOnly(firstValue(metadata.last_checked, metadata.lastChecked, root.last_checked, root.lastChecked)),
    valid_from: toDateOnly(firstValue(metadata.valid_from, metadata.validFrom, root.valid_from, root.validFrom)),
    valid_to: toDateOnly(firstValue(metadata.valid_to, metadata.validTo, root.valid_to, root.validTo)),
    historical: firstValue(metadata.historical, root.historical) === true,
    source_status: sourceStatus ? String(sourceStatus).trim().toLowerCase() : null,
    url: firstValue(metadata.url_canonical, metadata.urlCanonical, metadata.url, root.sourceUrl, root.url),
    inserted_at: toDateOnly(firstValue(root.insertedAt, metadata.inserted_at, metadata.insertedAt)),
    updated_at: toDateOnly(firstValue(root.updatedAt, metadata.updated_at, metadata.updatedAt))
  };
}

function severityForPolicy(policy, fallback = "warning") {
  if (!policy) return fallback;
  return policy.priority === "high" ? "error" : fallback;
}

function isValidHttpUrl(value) {
  if (value == null || value === "") return true;
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasContactSignal(source) {
  const text = [
    source.title,
    source.source_id,
    source.document_id,
    source.url,
    source.sections_present.join(" ")
  ].filter(Boolean).join(" ").toLowerCase();
  return /\b(contact|kontakt|contacts|kontaktid)\b/.test(text);
}

function hasSection(source, sectionNames) {
  const wanted = new Set(sectionNames.map(section => String(section).toLowerCase()));
  return source.sections_present.some(section => wanted.has(String(section).trim().toLowerCase()));
}

function hasPositiveCount(source, fieldNames) {
  return fieldNames.some(fieldName => Number(source[fieldName] || 0) > 0);
}

function serviceDeclaresFormPackage(source) {
  return hasSection(source, ["forms", "form", "application_form", "application_forms"]) ||
    hasPositiveCount(source, ["forms_count", "related_forms_count"]);
}

function serviceDeclaresContactPackage(source) {
  return hasSection(source, ["contacts", "contact", "official_contact", "contact_page"]) ||
    hasPositiveCount(source, ["contacts_count", "related_contacts_count"]);
}

function sourceGroupKey(source) {
  if (source.canonical_item_id) return `canonical:${source.canonical_item_id}`;
  if (source.municipality_id && (source.service_name || source.title)) {
    return `municipality:${source.municipality_id}:${String(source.service_name || source.title).trim().toLowerCase()}`;
  }
  return null;
}

function addSummaryReason(summary, reason) {
  if (!reason) return;
  summary.reasons[reason] = (summary.reasons[reason] || 0) + 1;
}

export function assessSourceFreshness(record = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const source = normalizeSourceMetadataForFreshness(record);
  const policy = RAG_SOURCE_FRESHNESS_POLICIES[source.source_type] || null;
  const reasons = [];
  let freshnessStatus = "ok";
  let severity = "info";
  let ageDays = null;

  if (!source.source_type || !isKnownRagSourceType(source.source_type)) {
    reasons.push("unknown_source_type");
    freshnessStatus = "unknown_type";
    severity = "warning";
  }

  if (source.source_status && !isKnownRagSourceStatus(source.source_status)) {
    reasons.push("unknown_source_status");
    if (severity === "info") severity = "warning";
  }

  if (source.source_status === "stale") {
    reasons.push("source_status_stale");
    freshnessStatus = "stale";
    severity = "error";
  } else if (source.source_status === "inactive" || source.source_status === "archived") {
    reasons.push(`source_status_${source.source_status}`);
    freshnessStatus = source.source_status;
    severity = severity === "error" ? severity : "warning";
  }

  if (source.valid_to) {
    const daysUntilValidTo = dayDiff(new Date(`${source.valid_to}T00:00:00Z`), now.toISOString().slice(0, 10));
    if (daysUntilValidTo < 0) {
      reasons.push("valid_to_expired");
      freshnessStatus = "expired";
      severity = "error";
    }
  }

  if (source.valid_from) {
    const daysSinceValidFrom = dayDiff(now, source.valid_from);
    if (daysSinceValidFrom < 0) {
      reasons.push("valid_from_in_future");
      freshnessStatus = freshnessStatus === "ok" ? "not_yet_valid" : freshnessStatus;
      if (severity === "info") severity = "warning";
    }
  }

  if (!source.last_checked) {
    reasons.push("missing_last_checked");
    freshnessStatus = freshnessStatus === "ok" ? "missing_last_checked" : freshnessStatus;
    severity = policy?.currentEvidence === false ? (severity === "error" ? severity : "warning") : "error";
  } else {
    ageDays = dayDiff(now, source.last_checked);
    if (ageDays < 0) {
      reasons.push("last_checked_in_future");
      freshnessStatus = freshnessStatus === "ok" ? "invalid_last_checked" : freshnessStatus;
      severity = "warning";
    } else if (policy?.maxAgeDays != null && ageDays > policy.maxAgeDays) {
      reasons.push("last_checked_stale");
      freshnessStatus = freshnessStatus === "ok" ? "stale" : freshnessStatus;
      severity = severity === "error" ? severity : severityForPolicy(policy);
    } else if (policy?.maxAgeDays != null && ageDays > Math.max(0, policy.maxAgeDays - 14)) {
      reasons.push("review_due_soon");
      freshnessStatus = freshnessStatus === "ok" ? "due_soon" : freshnessStatus;
      if (severity === "info") severity = "warning";
    }
  }

  if (source.historical && policy?.currentEvidence) {
    reasons.push("historical_current_evidence_source");
    freshnessStatus = freshnessStatus === "ok" ? "historical" : freshnessStatus;
    if (severity === "info") severity = "warning";
  }

  if (source.url && !isValidHttpUrl(source.url)) {
    reasons.push("invalid_url");
    freshnessStatus = freshnessStatus === "ok" ? "invalid_url" : freshnessStatus;
    severity = severity === "error" ? severity : "warning";
  } else if (!source.url && policy?.currentEvidence) {
    reasons.push("missing_url");
    freshnessStatus = freshnessStatus === "ok" ? "missing_url" : freshnessStatus;
    severity = severity === "error" ? severity : "warning";
  }

  if (hasContactSignal(source) && source.source_type && !["official_contact", "contact_page", "kov_service_info"].includes(source.source_type)) {
    reasons.push("contact_not_official_source");
    freshnessStatus = freshnessStatus === "ok" ? "contact_not_official_source" : freshnessStatus;
    severity = severity === "error" ? severity : "warning";
  }

  return {
    ...source,
    freshness_status: freshnessStatus,
    severity,
    reasons,
    age_days: ageDays,
    max_age_days: policy?.maxAgeDays ?? null,
    freshness_priority: policy?.priority || "unknown",
    current_evidence: policy?.currentEvidence === true
  };
}

export function summarizeFreshnessAudit(records = [], options = {}) {
  const assessments = records.map(record => assessSourceFreshness(record, options));
  const formSourceTypes = new Set(["application_form", "web_form", "pdf_form", "official_form"]);
  const contactSourceTypes = new Set(["official_contact", "contact_page"]);
  const groups = new Map();
  for (const item of assessments) {
    const key = sourceGroupKey(item);
    if (!key) continue;
    if (!groups.has(key)) {
      groups.set(key, {
        hasForm: false,
        hasOfficialContact: false,
        services: []
      });
    }
    const group = groups.get(key);
    if (formSourceTypes.has(item.source_type)) group.hasForm = true;
    if (contactSourceTypes.has(item.source_type)) group.hasOfficialContact = true;
    if (item.source_type === "kov_service_info") group.services.push(item);
  }

  for (const group of groups.values()) {
    for (const service of group.services) {
      if (!group.hasForm && serviceDeclaresFormPackage(service)) {
        service.reasons.push("kov_service_missing_form_source");
        if (service.freshness_status === "ok") service.freshness_status = "kov_service_missing_form_source";
        if (service.severity !== "error") service.severity = "warning";
      }

      if (!group.hasOfficialContact && serviceDeclaresContactPackage(service)) {
        service.reasons.push("kov_service_missing_official_contact_source");
        if (service.freshness_status === "ok") service.freshness_status = "kov_service_missing_official_contact_source";
        if (service.severity !== "error") service.severity = "warning";
      }
    }
  }

  const summary = {
    total: assessments.length,
    ok: 0,
    due_soon: 0,
    stale: 0,
    missing_last_checked: 0,
    expired: 0,
    inactive_or_archived: 0,
    unknown_type: 0,
    warnings: 0,
    errors: 0,
    quality_issues: 0,
    reasons: {}
  };

  for (const item of assessments) {
    if (item.freshness_status === "ok") summary.ok += 1;
    if (item.freshness_status === "due_soon") summary.due_soon += 1;
    if (item.freshness_status === "stale") summary.stale += 1;
    if (item.freshness_status === "missing_last_checked") summary.missing_last_checked += 1;
    if (item.freshness_status === "expired") summary.expired += 1;
    if (item.freshness_status === "inactive" || item.freshness_status === "archived") summary.inactive_or_archived += 1;
    if (item.freshness_status === "unknown_type") summary.unknown_type += 1;
    if (item.severity === "warning") summary.warnings += 1;
    if (item.severity === "error") summary.errors += 1;
    if (item.severity === "warning" || item.severity === "error") summary.quality_issues += 1;
    for (const reason of item.reasons) addSummaryReason(summary, reason);
  }

  return {
    ok: summary.errors === 0,
    summary,
    items: assessments
  };
}

function addIndexValue(index, key, value) {
  const normalized = String(key || "").trim();
  if (!normalized || index.has(normalized)) return;
  index.set(normalized, value);
}

export function buildSourceFreshnessIndex(items = []) {
  const index = new Map();
  for (const item of items) {
    addIndexValue(index, item.source_id, item);
    addIndexValue(index, item.document_id, item);
    addIndexValue(index, item.chunk_id, item);
    addIndexValue(index, item.canonical_item_id, item);
  }
  return index;
}

function traceData(row) {
  if (row?.data && typeof row.data === "object") return row.data;
  return row && typeof row === "object" ? row : {};
}

function isHighRiskTrace(data = {}) {
  const risk = String(data.rag_risk_level || data.risk_level || data.riskLevel || "").trim().toLowerCase();
  return risk === "high";
}

function displayedSourceIdsFromTrace(data = {}) {
  return Array.isArray(data.displayed_source_ids)
    ? [...new Set(data.displayed_source_ids.map(id => String(id || "").trim()).filter(Boolean))]
    : [];
}

function answerSourceIdsFromTrace(data = {}) {
  return Array.isArray(data.answer_source_ids)
    ? [...new Set(data.answer_source_ids.map(id => String(id || "").trim()).filter(Boolean))]
    : [];
}

function hasStaleFreshnessRisk(item = {}) {
  const status = String(item.freshness_status || "").trim();
  if (item.severity === "error") return true;
  return [
    "stale",
    "missing_last_checked",
    "expired",
    "inactive",
    "archived",
    "invalid_last_checked",
    "not_yet_valid"
  ].includes(status);
}

function createLayerSummary(prefix) {
  return {
    [`high_risk_with_${prefix}_sources`]: 0,
    [`high_risk_${prefix}_source_count`]: 0,
    [`matched_${prefix}_source_count`]: 0,
    [`stale_${prefix}_source_count`]: 0,
    [`unknown_${prefix}_source_count`]: 0,
    [`stale_${prefix}_source_responses`]: 0,
    [`unknown_${prefix}_source_responses`]: 0,
    [`${prefix}_source_stale_rate`]: 0,
    [`${prefix}_unknown_source_rate`]: 0
  };
}

function processSourceLayer({
  sourceIds,
  prefix,
  index,
  summary,
  issues
}) {
  if (sourceIds.length > 0) summary[`high_risk_with_${prefix}_sources`] += 1;
  summary[`high_risk_${prefix}_source_count`] += sourceIds.length;

  let responseHasStale = false;
  let responseHasUnknown = false;

  for (const sourceId of sourceIds) {
    const item = index.get(sourceId);
    if (!item) {
      responseHasUnknown = true;
      summary[`unknown_${prefix}_source_count`] += 1;
      issues.push({
        layer: prefix,
        source_id: sourceId,
        issue: "unknown_source_freshness",
        severity: "warning"
      });
      continue;
    }

    summary[`matched_${prefix}_source_count`] += 1;
    if (hasStaleFreshnessRisk(item)) {
      responseHasStale = true;
      summary[`stale_${prefix}_source_count`] += 1;
      for (const reason of Array.isArray(item.reasons) ? item.reasons : []) {
        summary.issue_reasons[reason] = (summary.issue_reasons[reason] || 0) + 1;
      }
      issues.push({
        layer: prefix,
        source_id: sourceId,
        title: item.title || null,
        source_type: item.source_type || null,
        freshness_status: item.freshness_status || null,
        severity: item.severity || "info",
        reasons: Array.isArray(item.reasons) ? item.reasons.slice(0, 8) : []
      });
    }
  }

  if (responseHasStale) summary[`stale_${prefix}_source_responses`] += 1;
  if (responseHasUnknown) summary[`unknown_${prefix}_source_responses`] += 1;
}

function finalizeSourceLayerRates(summary, prefix) {
  const denominator = summary[`high_risk_with_${prefix}_sources`];
  if (denominator <= 0) return;
  summary[`${prefix}_source_stale_rate`] = summary[`stale_${prefix}_source_responses`] / denominator;
  summary[`${prefix}_unknown_source_rate`] = summary[`unknown_${prefix}_source_responses`] / denominator;
}

export function summarizeHighRiskSourceFreshness(traceRows = [], freshnessItems = []) {
  const index = buildSourceFreshnessIndex(freshnessItems);
  const summary = {
    total_traces: 0,
    high_risk_traces: 0,
    ...createLayerSummary("answer"),
    ...createLayerSummary("displayed"),
    stale_source_responses: 0,
    unknown_source_responses: 0,
    stale_source_rate: 0,
    unknown_source_freshness_rate: 0,
    issue_reasons: {}
  };
  const issues = [];

  for (const row of traceRows || []) {
    const data = traceData(row);
    summary.total_traces += 1;
    if (!isHighRiskTrace(data)) continue;

    summary.high_risk_traces += 1;
    const answerIds = answerSourceIdsFromTrace(data);
    const displayedIds = displayedSourceIdsFromTrace(data);

    processSourceLayer({ sourceIds: answerIds, prefix: "answer", index, summary, issues });
    processSourceLayer({ sourceIds: displayedIds, prefix: "displayed", index, summary, issues });
  }

  finalizeSourceLayerRates(summary, "answer");
  finalizeSourceLayerRates(summary, "displayed");
  summary.stale_source_responses = summary.stale_displayed_source_responses;
  summary.unknown_source_responses = summary.unknown_displayed_source_responses;
  summary.stale_source_rate = summary.displayed_source_stale_rate;
  summary.unknown_source_freshness_rate = summary.displayed_unknown_source_rate;

  return {
    ok: summary.stale_answer_source_responses === 0 && summary.stale_displayed_source_responses === 0,
    summary,
    issues: issues.slice(0, 25)
  };
}
