import { normalizeMunicipalitySearchText } from "@/lib/help/municipalityData";
import { validateRagSourceMetadataContract } from "@/lib/rag/sourceMetadata";
import { parseRtRegulationXml } from "./rtXml";

const MIN_RAG_MD_LENGTH = 120;
const KOV_ITEM_TYPES = new Set(["service", "benefit", "resource", "contact", "form"]);

function invalid(message) {
  return {
    validationStatus: "INVALID",
    validationMessage: String(message || "Validation failed").slice(0, 240),
    validatedAt: new Date()
  };
}

function valid(message) {
  return {
    validationStatus: "VALID",
    validationMessage: String(message || "Basic validation passed").slice(0, 240),
    validatedAt: new Date()
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function itemDisplayTitle(item) {
  return item?.title || item?.name || item?.label || item?.heading;
}

function safeJsonParse(text) {
  try {
    return {
      ok: true,
      value: JSON.parse(text)
    };
  } catch {
    return {
      ok: false,
      value: null
    };
  }
}

function resolveMunicipalityText(value) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  return String(value.displayName || value.name || value.slug || value.label || "").trim();
}

function buildExpectedMunicipalityCandidates({ slug, displayName }) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();
  const slugText = normalizedSlug.replace(/-/g, " ");
  const display = String(displayName || "").trim();
  const displayWithoutType = display.replace(/\b(linn|vald)\b/gi, " ").replace(/\s+/g, " ").trim();

  return [normalizedSlug, slugText, display, displayWithoutType]
    .map(value => normalizeMunicipalitySearchText(value))
    .filter(Boolean);
}

function municipalityMatchesExpected(expectedMunicipality, candidateMunicipality) {
  const candidate = normalizeMunicipalitySearchText(resolveMunicipalityText(candidateMunicipality));
  if (!candidate) return false;

  const expectedCandidates = buildExpectedMunicipalityCandidates(expectedMunicipality);
  return expectedCandidates.some(expected => {
    if (!expected) return false;
    return candidate === expected || candidate.includes(expected) || expected.includes(candidate);
  });
}

function validateMunicipalityField(payload, expectedMunicipality) {
  const municipalityValue = payload?.municipality;
  const municipalityText = resolveMunicipalityText(municipalityValue);
  if (!municipalityText) {
    return invalid("Missing municipality");
  }
  if (!municipalityMatchesExpected(expectedMunicipality, municipalityText)) {
    return invalid("Municipality does not match selected KOV");
  }
  return null;
}

function validateSourcesJson(text, expectedMunicipality) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("sources.json is not readable JSON");
  }

  const municipalityError = validateMunicipalityField(parsed.value, expectedMunicipality);
  if (municipalityError) return municipalityError;

  if (!isNonEmptyString(parsed.value.checkedAt)) {
    return invalid("sources.json is missing checkedAt");
  }
  if (!Array.isArray(parsed.value.sources)) {
    return invalid("sources must be an array");
  }

  const invalidSourceIndex = parsed.value.sources.findIndex(source => {
    return !source || typeof source !== "object"
      || !isNonEmptyString(source.key)
      || !isNonEmptyString(source.type)
      || !isNonEmptyString(source.title)
      || !isNonEmptyString(source.url);
  });

  if (invalidSourceIndex !== -1) {
    return invalid(`sources[${invalidSourceIndex}] is missing key, type, title, or url`);
  }

  const invalidContractIndex = parsed.value.sources.findIndex((source, index) => {
    const result = validateRagSourceMetadataContract(source, {
      label: `sources[${index}]`,
      requireMunicipality: true,
      requireDocumentId: false,
      requireTitle: false,
      requireAudience: true
    });
    return !result.ok;
  });
  if (invalidContractIndex !== -1) {
    const result = validateRagSourceMetadataContract(parsed.value.sources[invalidContractIndex], {
      label: `sources[${invalidContractIndex}]`,
      requireMunicipality: true,
      requireDocumentId: false,
      requireTitle: false,
      requireAudience: true
    });
    return invalid(result.errors[0] || `sources[${invalidContractIndex}] has invalid RAG metadata`);
  }

  return valid("sources.json basic structure looks valid");
}

function validateDataJson(text, expectedMunicipality) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("dataset json is not readable JSON");
  }

  const municipalityError = validateMunicipalityField(parsed.value, expectedMunicipality);
  if (municipalityError) return municipalityError;

  if (!Array.isArray(parsed.value.items)) {
    return invalid("items must be an array");
  }

  const invalidItemIndex = parsed.value.items.findIndex(item => {
    if (!item || typeof item !== "object") return true;
    if (!isNonEmptyString(item.id) || !isNonEmptyString(item.itemType) || !isNonEmptyString(itemDisplayTitle(item))) return true;
    if (!KOV_ITEM_TYPES.has(item.itemType)) return true;
    if (!Array.isArray(item.sourceKeys) || item.sourceKeys.length === 0) return true;
    return false;
  });

  if (invalidItemIndex !== -1) {
    return invalid(`items[${invalidItemIndex}] is missing id, allowed itemType, title/name, or non-empty sourceKeys array`);
  }

  const ids = new Set();
  for (const item of parsed.value.items) {
    if (ids.has(item.id)) return invalid(`Duplicate item id: ${item.id}`);
    ids.add(item.id);
  }

  const relationFields = ["relatedTo", "relatedForms", "relatedContacts"];
  for (const item of parsed.value.items) {
    for (const field of relationFields) {
      if (!(field in item)) continue;
      if (item[field] == null) continue;
      if (!Array.isArray(item[field])) return invalid(`${item.id}.${field} must be an array`);
      const missingId = item[field].find(id => !ids.has(String(id || "")));
      if (missingId) return invalid(`${item.id}.${field} references missing item id: ${missingId}`);
    }
  }

  return valid("dataset json basic structure looks valid");
}

function validateMetaJson(text, expectedMunicipality) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("meta.json is not readable JSON");
  }

  const municipalityError = validateMunicipalityField(parsed.value, expectedMunicipality);
  if (municipalityError) return municipalityError;

  if (!Array.isArray(parsed.value.notes)) {
    return invalid("notes must be an array");
  }
  if (!Array.isArray(parsed.value.unresolvedIssues)) {
    return invalid("unresolvedIssues must be an array");
  }
  if ("coverage" in parsed.value && parsed.value.coverage != null && (typeof parsed.value.coverage !== "object" || Array.isArray(parsed.value.coverage))) {
    return invalid("coverage must be an object or null");
  }

  return valid("meta.json basic structure looks valid");
}

function validateRagMarkdown(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return invalid("rag.md is empty");
  }
  if (trimmed.length < MIN_RAG_MD_LENGTH) {
    return invalid(`rag.md is too short (${trimmed.length} chars)`);
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const hasHeading = lines.some(line => /^#{1,6}\s+\S+/.test(line));
  const contentLines = lines.filter(line => !/^#{1,6}\s+\S+/.test(line));

  if (!hasHeading && contentLines.length < 3) {
    return invalid("rag.md needs a heading or at least three content lines");
  }

  return valid("rag.md has enough readable content");
}

function validateRtJson(text, expectedMunicipality) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("rt.json is not readable JSON");
  }

  if ("municipality" in parsed.value) {
    const municipalityError = validateMunicipalityField(parsed.value, expectedMunicipality);
    if (municipalityError) return municipalityError;
  }

  return valid("rt.json is readable and attached");
}

function validateRtMarkdown(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return invalid("rt.md is empty");
  }
  if (trimmed.length < 60) {
    return invalid(`rt.md is too short (${trimmed.length} chars)`);
  }
  return valid("rt.md has readable content");
}

function validateRtXml(text, expectedMunicipality) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return invalid("rt.xml is empty");
  }

  let parsed = null;
  try {
    parsed = parseRtRegulationXml(trimmed, {
      municipality: expectedMunicipality?.displayName || ""
    });
  } catch (error) {
    return invalid(error?.message || "rt.xml is not readable XML");
  }

  if (!parsed?.actTitle) {
    return invalid("rt.xml is missing act title");
  }
  if (!parsed?.actReference) {
    return invalid("rt.xml is missing act reference");
  }
  if (!municipalityMatchesExpected(expectedMunicipality, parsed?.municipality || parsed?.issuer || "")) {
    return invalid("Municipality does not match selected KOV");
  }

  const paragraphCount = (parsed?.chapters || []).reduce((sum, chapter) => sum + (Array.isArray(chapter?.paragraphs) ? chapter.paragraphs.length : 0), 0);
  if (paragraphCount < 1) {
    return invalid("rt.xml does not contain any paragraphs");
  }

  return valid("rt.xml basic structure looks valid");
}

export function validateKovFileContent({ fileKey, text, slug, displayName }) {
  const expectedMunicipality = { slug, displayName };
  const normalizedKey = String(fileKey || "").trim();

  if (normalizedKey === "sourcesJson") return validateSourcesJson(text, expectedMunicipality);
  if (normalizedKey === "dataJson") return validateDataJson(text, expectedMunicipality);
  if (normalizedKey === "metaJson") return validateMetaJson(text, expectedMunicipality);
  if (normalizedKey === "ragMd") return validateRagMarkdown(text);
  if (normalizedKey === "rtJson") return validateRtJson(text, expectedMunicipality);
  if (normalizedKey === "rtMd") return validateRtMarkdown(text);
  if (normalizedKey === "rtXml") return validateRtXml(text, expectedMunicipality);

  return invalid("Unknown KOV file role");
}
