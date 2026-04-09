const MIN_RAG_MD_LENGTH = 120;

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

function validateSourcesJson(text) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("sources.json is not readable JSON");
  }

  if (!Array.isArray(parsed.value.sources)) {
    return invalid("sources must be an array");
  }

  const invalidSourceIndex = parsed.value.sources.findIndex(source => {
    return !source || typeof source !== "object"
      || !isNonEmptyString(source.key)
      || !isNonEmptyString(source.title)
      || !isNonEmptyString(source.url);
  });

  if (invalidSourceIndex !== -1) {
    return invalid(`sources[${invalidSourceIndex}] is missing key, title, or url`);
  }

  return valid("sources.json basic structure looks valid");
}

function validateDataJson(text) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("dataset json is not readable JSON");
  }

  if (!Array.isArray(parsed.value.items)) {
    return invalid("items must be an array");
  }

  const invalidItemIndex = parsed.value.items.findIndex(item => {
    if (!item || typeof item !== "object") return true;
    if (!isNonEmptyString(item.id) || !isNonEmptyString(item.itemType) || !isNonEmptyString(item.title)) return true;
    if ("sourceKeys" in item && !Array.isArray(item.sourceKeys)) return true;
    return false;
  });

  if (invalidItemIndex !== -1) {
    return invalid(`items[${invalidItemIndex}] is missing id, itemType, title, or sourceKeys array`);
  }

  return valid("dataset json basic structure looks valid");
}

function validateMetaJson(text) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return invalid("meta.json is not readable JSON");
  }

  if ("notes" in parsed.value && !Array.isArray(parsed.value.notes)) {
    return invalid("notes must be an array");
  }
  if ("unresolvedIssues" in parsed.value && !Array.isArray(parsed.value.unresolvedIssues)) {
    return invalid("unresolvedIssues must be an array");
  }
  if ("coverage" in parsed.value && parsed.value.coverage != null && (typeof parsed.value.coverage !== "object" || Array.isArray(parsed.value.coverage))) {
    return invalid("coverage must be an object or null");
  }

  return valid("meta.json basic structure looks valid");
}

function validateRagMarkdown(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return invalid("rag.md is empty");
  if (trimmed.length < MIN_RAG_MD_LENGTH) return invalid(`rag.md is too short (${trimmed.length} chars)`);

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

export function validateOrganizationFileContent({ fileKey, text }) {
  const normalizedKey = String(fileKey || "").trim();

  if (normalizedKey === "sourcesJson") return validateSourcesJson(text);
  if (normalizedKey === "dataJson") return validateDataJson(text);
  if (normalizedKey === "metaJson") return validateMetaJson(text);
  if (normalizedKey === "ragMd") return validateRagMarkdown(text);
  if (normalizedKey === "attachment") return valid("Attachment stored");

  return invalid("Unknown organization file role");
}
