export const REMEDIATION_ACTION_LABELS = {
  add_or_link_form_source: {
    et: "Lisa või seo vormiallikas",
    en: "Add or link a form source"
  },
  add_or_link_official_contact_source: {
    et: "Lisa või seo ametlik kontaktiallikas",
    en: "Add or link an official contact source"
  },
  fill_recommended_metadata_fields: {
    et: "Täida soovituslikud metadata väljad",
    en: "Fill recommended metadata fields"
  },
  fill_required_metadata_fields: {
    et: "Täida kohustuslikud metadata väljad",
    en: "Fill required metadata fields"
  },
  fix_source_url: {
    et: "Paranda allika URL",
    en: "Fix source URL"
  },
  map_source_type: {
    et: "Määra allikatüüp",
    en: "Map source type"
  },
  refresh_last_checked: {
    et: "Uuenda last_checked",
    en: "Refresh last_checked"
  },
  review_source_metadata: {
    et: "Vaata allika metadata üle",
    en: "Review source metadata"
  },
  review_validity_window: {
    et: "Kontrolli kehtivusvahemikku",
    en: "Review validity window"
  }
};

const FIELD_LABELS = {
  application_form: "application_form",
  canonical_item_id: "canonical_item_id",
  contact_page: "contact_page",
  content_hash: "content_hash",
  document_id: "document_id",
  last_checked: "last_checked",
  official_contact: "official_contact",
  source_status: "source_status",
  source_type: "source_type",
  url: "url",
  valid_from: "valid_from",
  valid_to: "valid_to"
};

function paramValue(searchParams, key) {
  if (!searchParams || typeof searchParams.get !== "function") return "";
  return String(searchParams.get(key) || "").trim();
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function labelForAction(action, locale = "en") {
  const labels = REMEDIATION_ACTION_LABELS[action];
  if (!labels) return action || "";
  return String(locale || "").toLowerCase().startsWith("et") ? labels.et : labels.en;
}

function labelForField(field) {
  return FIELD_LABELS[field] || field;
}

export function buildRemediationContext(searchParams, locale = "en") {
  const action = paramValue(searchParams, "remediation_action");
  const fields = splitList(paramValue(searchParams, "fields"));
  const recommendedFields = splitList(paramValue(searchParams, "recommended_fields"));
  const focus = paramValue(searchParams, "focus");
  const fileKey = paramValue(searchParams, "file_key");
  const identifiers = [
    ["source_id", paramValue(searchParams, "source_id")],
    ["document_id", paramValue(searchParams, "document_id")],
    ["canonical_item_id", paramValue(searchParams, "canonical_item_id")],
    ["source_type", paramValue(searchParams, "source_type")],
    ["source_file_type", paramValue(searchParams, "source_file_type")],
    ["source_path", paramValue(searchParams, "source_path")],
    ["municipality", paramValue(searchParams, "municipality")],
    ["organization", paramValue(searchParams, "organization")],
    ["source", paramValue(searchParams, "source")]
  ].filter(([, value]) => value);

  if (!action && fields.length === 0 && identifiers.length === 0 && !focus && !fileKey) return null;

  return {
    action,
    actionLabel: labelForAction(action || "review_source_metadata", locale),
    fields,
    fieldLabels: fields.map(labelForField),
    recommendedFields,
    recommendedFieldLabels: recommendedFields.map(labelForField),
    identifiers,
    focus,
    fileKey
  };
}

export function buildRemediationMetadataStub(context) {
  if (!context || typeof context !== "object") return "";

  const out = {};
  for (const [key, value] of context.identifiers || []) {
    if (["municipality", "organization", "source"].includes(key)) continue;
    out[key] = value;
  }

  for (const field of [...(context.fields || []), ...(context.recommendedFields || [])]) {
    if (!field || Object.prototype.hasOwnProperty.call(out, field)) continue;
    out[field] = "";
  }

  if (Object.keys(out).length === 0) return "";
  return `${JSON.stringify(out, null, 2)}\n`;
}

export function getRemediationIdentifierValue(context, keys) {
  if (!context || typeof context !== "object") return "";
  const wanted = new Set((Array.isArray(keys) ? keys : [keys]).filter(Boolean));
  if (wanted.size === 0) return "";

  for (const [key, value] of context.identifiers || []) {
    if (wanted.has(key) && value) return value;
  }

  return "";
}

export function normalizeRemediationLookup(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function findRemediationTargetItem(items, candidates, valueKeys = []) {
  const normalizedCandidates = new Set(
    (Array.isArray(candidates) ? candidates : [candidates])
      .map(normalizeRemediationLookup)
      .filter(Boolean)
  );

  if (!Array.isArray(items) || normalizedCandidates.size === 0) return null;

  const keys = [
    "slug",
    "id",
    "displayName",
    "name",
    "municipality_id",
    "municipalityId",
    "organization_id",
    "organizationId",
    "ragDocId",
    "rtRagDocId",
    ...valueKeys
  ];

  return items.find(item =>
    keys.some(key => normalizedCandidates.has(normalizeRemediationLookup(item?.[key])))
  ) || null;
}
