// /lib/career-agent/adapters/careerCvParserAdapter.js

import {
  PROFILE_SOURCES,
  PROFILE_STATUS,
  SOURCE_MODES,
  metaField,
  listField,
  createLanguageEntry,
  createEducationEntry,
  createCertificateEntry,
  createExperienceRoleEntry,
  createGapEntry,
  createDirectionEntry,
} from "../profile/careerProfile.schema.js";
import { getCareerCvParserText } from "../careerText.js";

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function resolveLocaleCode(...candidates) {
  for (const candidate of candidates) {
    const value = coerceString(candidate);
    if (!value) continue;

    const shortLocale = value.toLowerCase().split(/[-_]/)[0];
    if (shortLocale === "et" || shortLocale === "en" || shortLocale === "ru") {
      return shortLocale;
    }
  }

  return "et";
}

function getParserText(options = {}) {
  return getCareerCvParserText(
    resolveLocaleCode(options.locale, options.language, options.documentLanguage)
  );
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function uniqueStrings(values = []) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "number" && Number.isFinite(item)) return String(item);
          return null;
        })
        .filter(Boolean)
    );
  }

  if (typeof value === "string") {
    return uniqueStrings(
      value
        .split(/\r?\n|,/g)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  return [];
}

const MOJIBAKE_REPLACEMENTS = Object.freeze([
  ["Ć¤", "ä"],
  ["Ć„", "Ä"],
  ["Ćµ", "õ"],
  ["Ć•", "Õ"],
  ["Ć¶", "ö"],
  ["Ć–", "Ö"],
  ["Ć¼", "ü"],
  ["Ć", "Ü"],
  ["â", "'"],
  ["â", "'"],
  ['â', '"'],
  ['â', '"'],
  ["â", "-"],
  ["â", "-"],
]);

function repairMojibakeText(value = "") {
  let text = String(value || "");

  for (const [bad, good] of MOJIBAKE_REPLACEMENTS) {
    text = text.split(bad).join(good);
  }

  return text;
}

function normalizeText(value = "") {
  return repairMojibakeText(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMeaningful(...values) {
  for (const value of values) {
    const normalized = coerceString(value);
    if (normalized) return normalized;
  }
  return null;
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLabeledField(lines = [], labels = []) {
  const safeLabels = uniqueStrings(
    labels.map((label) => coerceString(label)).filter(Boolean)
  );

  for (const line of lines) {
    const rawLine = String(line || "").trim();
    if (!rawLine) continue;

    for (const label of safeLabels) {
      const matcher = new RegExp(`^${escapeRegex(label)}\\s*[:\\-]\\s*(.+)$`, "i");
      const match = rawLine.match(matcher);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }

  return null;
}

function prettifyName(value) {
  const raw = coerceString(value);
  if (!raw) return null;

  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const alpha = word.replace(/[^-\p{L}']/gu, "");
      if (!alpha || !/^\p{Lu}+$/u.test(alpha)) {
        return word;
      }

      return word
        .toLowerCase()
        .replace(/(^|[-'])\p{L}/gu, (chunk) => chunk.toUpperCase());
    })
    .join(" ");
}

function getNested(obj, path) {
  const parts = String(path)
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

function firstDefinedByPaths(obj, paths = []) {
  for (const path of paths) {
    const value = getNested(obj, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function pickRoot(payload = {}) {
  return (
    firstDefinedByPaths(payload, [
      "parserResult",
      "parsedProfile",
      "profile",
      "result.profile",
      "result",
      "data.profile",
      "data",
    ]) || {}
  );
}

function pickQcReport(payload = {}) {
  return (
    firstDefinedByPaths(payload, [
      "qcReport",
      "qualityGuard",
      "qualityReport",
      "result.qcReport",
      "result.qualityReport",
      "data.qcReport",
    ]) || {}
  );
}

function pickRawArray(source, candidatePaths = []) {
  for (const path of candidatePaths) {
    const value = getNested(source, path);
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }
  return [];
}

function pickRawValue(source, candidatePaths = []) {
  for (const path of candidatePaths) {
    const value = getNested(source, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function makeMeta(value, source = PROFILE_SOURCES.FROM_CV) {
  return metaField(
    value ?? null,
    source,
    value === null || value === undefined || value === ""
      ? PROFILE_STATUS.MISSING
      : PROFILE_STATUS.UNCONFIRMED
  );
}

function makeList(items, source = PROFILE_SOURCES.FROM_CV) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  return listField(
    safeItems,
    source,
    safeItems.length > 0 ? PROFILE_STATUS.UNCONFIRMED : PROFILE_STATUS.MISSING
  );
}

function normalizeLanguageEntry(item) {
  if (typeof item === "string") {
    return createLanguageEntry(
      { language: item, level: null },
      PROFILE_SOURCES.FROM_CV,
      PROFILE_STATUS.UNCONFIRMED
    );
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const language = firstMeaningful(
    item.language,
    item.name,
    item.label,
    item.code
  );

  if (!language) return null;

  const level = firstMeaningful(
    item.level,
    item.proficiency,
    item.cefr,
    item.fluency
  );

  return createLanguageEntry(
    { language, level },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function normalizeEducationEntry(item) {
  if (typeof item === "string") {
    return createEducationEntry(
      { title: item },
      PROFILE_SOURCES.FROM_CV,
      PROFILE_STATUS.UNCONFIRMED
    );
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const title = firstMeaningful(item.title, item.degree, item.name, item.label);
  const institution = firstMeaningful(
    item.institution,
    item.school,
    item.university,
    item.provider
  );

  if (!title && !institution) return null;

  return createEducationEntry(
    {
      title,
      level: firstMeaningful(item.level, item.degreeLevel, item.educationLevel),
      institution,
      completionStatus: firstMeaningful(
        item.completionStatus,
        item.status,
        item.state
      ),
      startDate: firstMeaningful(item.startDate, item.from, item.startedAt),
      endDate: firstMeaningful(item.endDate, item.to, item.finishedAt),
      notes: firstMeaningful(item.notes, item.description),
    },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function normalizeCertificateEntry(item) {
  if (typeof item === "string") {
    return createCertificateEntry(
      { name: item },
      PROFILE_SOURCES.FROM_CV,
      PROFILE_STATUS.UNCONFIRMED
    );
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const name = firstMeaningful(item.name, item.title, item.label);
  if (!name) return null;

  return createCertificateEntry(
    {
      name,
      issuer: firstMeaningful(item.issuer, item.organization, item.provider),
      issuedAt: firstMeaningful(item.issuedAt, item.date, item.issueDate),
      expiresAt: firstMeaningful(item.expiresAt, item.expiryDate, item.validUntil),
      notes: firstMeaningful(item.notes, item.description),
    },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function normalizeExperienceEntry(item) {
  if (typeof item === "string") {
    return createExperienceRoleEntry(
      { title: item },
      PROFILE_SOURCES.FROM_CV,
      PROFILE_STATUS.UNCONFIRMED
    );
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const title = firstMeaningful(item.title, item.role, item.position, item.name);
  const employer = firstMeaningful(item.employer, item.company, item.organization);
  const sector = firstMeaningful(item.sector, item.industry, item.field);

  if (!title && !employer && !sector) return null;

  return createExperienceRoleEntry(
    {
      title,
      employer,
      sector,
      durationMonths: item.durationMonths ?? item.months ?? null,
      workForm: firstMeaningful(item.workForm, item.employmentType),
      startDate: firstMeaningful(item.startDate, item.from, item.startedAt),
      endDate: firstMeaningful(item.endDate, item.to, item.endedAt),
      responsibilities: normalizeStringList(
        item.responsibilities || item.tasks || item.duties
      ),
      achievements: normalizeStringList(
        item.achievements || item.results || item.highlights
      ),
    },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function normalizeGapEntry(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const startDate = firstMeaningful(item.startDate, item.from);
  const endDate = firstMeaningful(item.endDate, item.to);
  const reason = firstMeaningful(item.reason, item.label, item.description);

  if (!startDate && !endDate && !reason) return null;

  return createGapEntry(
    {
      startDate,
      endDate,
      reason,
      notes: firstMeaningful(item.notes),
    },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function normalizeDirectionEntry(item) {
  if (typeof item === "string") {
    return createDirectionEntry(
      { title: item },
      PROFILE_SOURCES.FROM_CV,
      PROFILE_STATUS.UNCONFIRMED
    );
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const title = firstMeaningful(item.title, item.label, item.name, item.role);
  if (!title) return null;

  return createDirectionEntry(
    {
      title,
      type: firstMeaningful(item.type, item.directionType),
      rationale: normalizeStringList(item.rationale || item.whyFit),
      missingRequirements: normalizeStringList(
        item.missingRequirements || item.gaps
      ),
    },
    PROFILE_SOURCES.FROM_CV,
    PROFILE_STATUS.UNCONFIRMED
  );
}

function educationLevelRank(value) {
  const normalized = String(value || "").toLowerCase();

  if (!normalized) return 0;
  if (normalized.includes("basic") || normalized.includes("põhi")) return 1;
  if (normalized.includes("secondary") || normalized.includes("kesk")) return 2;
  if (normalized.includes("vocational") || normalized.includes("kutse")) return 3;
  if (normalized.includes("rakendus")) return 4;
  if (normalized.includes("bachelor") || normalized.includes("bakalaure")) return 4;
  if (normalized.includes("master") || normalized.includes("magister")) return 5;
  if (normalized.includes("doctor") || normalized.includes("doktor")) return 6;

  return 0;
}

function inferHighestEducationLevel(entries = []) {
  let best = null;
  let bestRank = 0;

  for (const entry of entries) {
    const level = entry?.level?.value || null;
    const rank = educationLevelRank(level);
    if (rank > bestRank) {
      bestRank = rank;
      best = level;
    }
  }

  return best;
}

function deriveCurrentStatus(experienceEntries = []) {
  const hasOpenRole = experienceEntries.some((entry) => {
    const endDate = entry?.endDate?.value || null;
    const completion = entry?.completionStatus?.value || null;
    return !endDate || completion === "current";
  });

  return hasOpenRole ? "employed" : null;
}

function buildMissingInformation(root = {}, qcReport = {}) {
  return uniqueStrings([
    ...normalizeStringList(
      pickRawValue(qcReport, [
        "missingInformation",
        "missingFields",
        "missing_fields",
        "gaps",
      ])
    ),
    ...normalizeStringList(
      pickRawValue(root, [
        "missingInformation",
        "missingFields",
        "missing_fields",
      ])
    ),
  ]);
}

function buildConfidenceNotes(root = {}, qcReport = {}, warnings = [], options = {}) {
  const notes = [];
  const text = getParserText(options);

  const parserConfidence = pickRawValue(qcReport, [
    "confidenceNote",
    "confidence_note",
    "notes",
  ]);

  const score = pickRawValue(qcReport, [
    "confidenceScore",
    "confidence_score",
    "score",
  ]);

  if (parserConfidence) {
    notes.push(String(parserConfidence));
  }

  if (score !== null && score !== undefined && score !== "") {
    notes.push(`${text.confidenceLabel}: ${String(score)}`);
  }

  const summary = pickRawValue(root, ["summary", "profileSummary"]);
  if (summary) {
    notes.push(text.summaryDetected);
  }

  return uniqueStrings([...notes, ...warnings]);
}

function buildWarnings(root = {}, qcReport = {}, options = {}) {
  const warnings = [];
  const text = getParserText(options);

  if (!isPlainObject(root) || Object.keys(root).length === 0) {
    warnings.push(text.emptyOrUnsupported);
  }

  const rawWarnings = normalizeStringList(
    pickRawValue(qcReport, ["warnings", "issues", "flags"])
  );

  warnings.push(...rawWarnings);

  return uniqueStrings(warnings);
}

function splitCvTextLines(text = "") {
  return repairMojibakeText(text)
    .split(/\r?\n/g)
    .map((line) => line.replace(/\t+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line));
}

const SECTION_ALIASES = Object.freeze({
  experience: [
    "experience",
    "work experience",
    "employment history",
    "work history",
    "kogemus",
    "toogemus",
    "tookogemus",
  ],
  education: [
    "education",
    "haridus",
    "hariduskaik",
    "obrazovanie",
  ],
  additionalTraining: [
    "additional training",
    "training",
    "courses",
    "certifications",
    "taiendkoolitus",
    "taiendkoolitused",
    "koolitused",
    "kursused",
  ],
  skills: [
    "skills",
    "technical skills",
    "soft skills",
    "oskused",
    "navyki",
  ],
  digitalSkills: [
    "computer skills",
    "digital skills",
    "arvutioskus",
    "digioskused",
  ],
  languages: [
    "languages",
    "language skills",
    "keeleoskus",
    "keeled",
    "yazyki",
  ],
  interests: [
    "interests",
    "hobbies",
    "huvialad",
    "hobid",
  ],
  strengths: [
    "strengths",
    "personal qualities",
    "isikuomadused",
  ],
  licenses: [
    "juhiload",
    "juhiluba",
    "driving licence",
    "driving license",
  ],
  misc: [
    "muu",
    "other",
  ],
  summary: [
    "profile",
    "summary",
    "profiil",
    "kokkuvote",
    "rezume",
  ],
});

function isSectionHeading(line = "") {
  const normalized = normalizeText(line);
  if (!normalized) return false;

  return Object.values(SECTION_ALIASES).some((aliases) =>
    aliases.includes(normalized)
  );
}

function classifySectionHeading(line = "") {
  const normalized = normalizeText(line);
  if (!normalized) return null;

  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(normalized)) {
      return section;
    }
  }

  return null;
}

function extractEmail(text = "") {
  const match = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

function extractPhone(text = "") {
  const match = String(text || "").match(/(?:\+?\d[\d\s()-]{6,}\d)/);
  return match ? match[0].replace(/\s+/g, " ").trim() : null;
}

function extractLikelyName(lines = []) {
  const labeledName = extractLabeledField(lines, ["Nimi", "Name", "Имя"]);
  if (labeledName) {
    return prettifyName(labeledName);
  }

  for (const line of lines.slice(0, 6)) {
    const trimmed = String(line || "").trim();
    if (!trimmed) continue;
    if (extractEmail(trimmed) || extractPhone(trimmed)) continue;
    if (isSectionHeading(trimmed)) continue;
    if (/curriculum vitae|resume|cv/i.test(trimmed)) continue;
    if (trimmed.length > 60) continue;

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 4) continue;

    const looksLikeName = words.every((word) => /^[\p{Lu}][\p{L}'-]+$/u.test(word));
    if (looksLikeName) {
      return trimmed;
    }
  }

  return null;
}

function extractLikelyLocation(lines = []) {
  const address = extractLabeledField(lines, ["Aadress", "Address", "Адрес"]);
  if (address) {
    return address;
  }

  const location = extractLabeledField(lines, [
    "Asukoht",
    "Location",
    "Местоположение",
  ]);
  if (location) {
    return location;
  }

  for (const line of lines.slice(0, 10)) {
    const trimmed = String(line || "").trim();
    if (!trimmed) continue;
    if (extractEmail(trimmed) || extractPhone(trimmed)) continue;
    if (isSectionHeading(trimmed)) continue;
    if (/sunni|birth|род/i.test(trimmed)) continue;
    if (trimmed.length > 50) continue;
    if (!/[A-Za-zÀ-ž\u0400-\u04FF]/.test(trimmed)) continue;
    if (trimmed.includes("@")) continue;

    if (
      /Tallinn|Tartu|Narva|P[aä]rnu|Viljandi|Rakvere|Kohtla|J[aõ]hvi|Helsinki|Riga|Vilnius|Berlin|London|Remote|Kaug/i.test(
        trimmed
      )
    ) {
      return trimmed;
    }
  }

  return null;
}

function stripBulletPrefix(line = "") {
  return String(line || "")
    .replace(/^[\-\u2022*•]+\s*/u, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}
function parseSectionedCvText(text = "") {
  const lines = splitCvTextLines(text);
  const sections = {
    summary: [],
    experience: [],
    education: [],
    additionalTraining: [],
    skills: [],
    digitalSkills: [],
    languages: [],
    interests: [],
    strengths: [],
    licenses: [],
    misc: [],
  };

  let currentSection = "summary";

  for (const rawLine of lines) {
    const line = stripBulletPrefix(rawLine);
    const nextSection = classifySectionHeading(line);

    if (nextSection) {
      currentSection = nextSection;
      continue;
    }

    sections[currentSection].push(line);
  }

  return {
    lines,
    sections,
  };
}

function parseSkillLines(lines = []) {
  const tokens = [];

  for (const line of lines) {
    const normalizedLine = stripBulletPrefix(line);
    if (!normalizedLine) continue;

    const parts = normalizedLine
      .split(/[,;|]/g)
      .map((item) => item.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      tokens.push(...parts);
      continue;
    }

    tokens.push(normalizedLine);
  }

  return uniqueStrings(tokens).slice(0, 24);
}

function parseLanguageLines(lines = []) {
  return lines
    .map((line) => stripBulletPrefix(line))
    .map((line) => {
      const parts = line.split(/[-–,:|]/g).map((item) => item.trim()).filter(Boolean);
      if (!parts.length) return null;

      return normalizeLanguageEntry({
        language: parts[0],
        level: parts[1] || null,
      });
    })
    .filter(Boolean)
    .slice(0, 8);
}

function parseEducationLines(lines = []) {
  return lines
    .map((line) => stripBulletPrefix(line))
    .filter(Boolean)
    .map((line) => normalizeEducationEntry({ title: line }))
    .filter(Boolean)
    .slice(0, 12);
}

function parseExperienceLines(lines = []) {
  return lines
    .map((line) => stripBulletPrefix(line))
    .filter(Boolean)
    .map((line) => normalizeExperienceEntry({ title: line }))
    .filter(Boolean)
    .slice(0, 12);
}

function parseLanguageLinesStructured(lines = []) {
  return lines
    .map((line) => stripBulletPrefix(line))
    .map((line) => {
      const compact = String(line || "").trim();
      if (!compact) return null;

      const namedLanguageMatch = compact.match(/^(.+?keel)\s+(.+)$/i);
      if (namedLanguageMatch?.[1]) {
        return normalizeLanguageEntry({
          language: namedLanguageMatch[1],
          level: namedLanguageMatch[2] || null,
        });
      }

      const parts = compact
        .split(/[-,:|]/g)
        .map((item) => item.trim())
        .filter(Boolean);
      if (!parts.length) return null;

      return normalizeLanguageEntry({
        language: parts[0],
        level: parts[1] || null,
      });
    })
    .filter(Boolean)
    .slice(0, 8);
}

function startsTimelineEntry(line = "") {
  const compact = String(line || "").trim();
  if (!compact) return false;

  return (
    /^\d{4}\b/.test(compact) ||
    /^\d{2}\.\d{4}\b/.test(compact) ||
    /^\d{2}\.\d{4}\s*[-–—]\s*\d{2}\.\d{4}\b/.test(compact) ||
    /^\d{1,2}\.\s*\p{L}/u.test(compact) ||
    /^(jaan|veebr|marts|märts|aprill|mai|juuni|juuli|aug|sept|okt|nov|dets)/i.test(
      normalizeText(compact)
    )
  );
}


function stripTimelinePrefix(line = "") {
  return String(line || "")
    .replace(
      /^(?:\d{2}\.\d{4}\s*[-–—]\s*\d{2}\.\d{4}|\d{2}\.\d{4})\s*/u,
      ""
    )
    .replace(
      /^(?:\d{4}|\d{1,2}\.\s*\p{L}+|(?:jaan|veebr|mĆ¤rts|marts|aprill|mai|juuni|juuli|aug|sept|okt|nov|dets)\.?)\b[\s.ā€“ā€”\-\/\d]*\s*/iu,
      ""
    )
    .trim();
}

function chunkTimelineEntries(lines = []) {
  const entries = [];
  let current = [];

  for (const rawLine of lines) {
    const line = stripBulletPrefix(rawLine);
    if (!line) continue;

    if (startsTimelineEntry(line) && current.length > 0) {
      entries.push(current);
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    entries.push(current);
  }

  return entries;
}

function inferEducationLevelFromText(value = "") {
  const normalized = normalizeText(value);

  if (!normalized) return null;
  if (normalized.includes("magistri") || normalized.includes("magister")) return "master";
  if (normalized.includes("bakalaure")) return "bachelor";
  if (normalized.includes("kutse")) return "vocational";
  if (normalized.includes("gumnaas") || normalized.includes("gymnasium")) return "secondary";

  return null;
}

function splitCommaHeadline(line = "") {
  const parts = String(line || "")
    .split(/,\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return {
      primary: parts[0] || null,
      secondary: null,
    };
  }

  return {
    primary: parts[0] || null,
    secondary: parts.slice(1).join(", "),
  };
}

function parseEducationLinesStructured(lines = []) {
  const blocks = chunkTimelineEntries(lines);

  if (!blocks.length) {
    return parseEducationLines(lines);
  }

  return blocks
    .map((block) => {
      const headline = stripTimelinePrefix(block[0] || "");
      const details = block.slice(1).filter(Boolean);
      const detailText = details.join(" ");
      const derivedInstitution = details.length >= 2 ? details[0] : headline || null;
      const derivedTitle =
        details.length >= 2 ? details[1] : details[0] || headline;
      const derivedNotes =
        details.length >= 3
          ? details.slice(2).join(" ")
          : details.length === 2
          ? null
          : details.length > 1
          ? details.slice(1).join(" ")
          : null;

      return normalizeEducationEntry({
        title: derivedTitle,
        institution: derivedInstitution,
        level: inferEducationLevelFromText(`${headline} ${detailText}`),
        completionStatus: /lopetamata|lõpetamata|unfinished/i.test(
          `${headline} ${detailText}`
        )
          ? "unfinished"
          : null,
        notes: derivedNotes,
      });
    })
    .filter(Boolean)
    .slice(0, 12);
}

function parseExperienceLinesStructured(lines = []) {
  const blocks = chunkTimelineEntries(lines);

  if (!blocks.length) {
    return parseExperienceLines(lines);
  }

  return blocks
    .map((block) => {
      const headline = stripTimelinePrefix(block[0] || "");
      const details = block.slice(1).filter(Boolean);
      const titleFromSeparateLine = !headline && details.length >= 2 ? details[1] : null;
      const employerFromSeparateLine = !headline && details.length >= 2 ? details[0] : null;
      const { primary, secondary } = splitCommaHeadline(headline);
      const responsibilitySeed =
        !headline && details.length >= 2 ? details.slice(2) : details;
      const responsibilityLines = responsibilitySeed.flatMap((line) => {
        const compact = String(line || "").trim();
        if (!compact) return [];

        return compact
          .replace(/^Peamised tegevused\s*:\s*/i, "")
          .split(/[;,]/g)
          .map((item) => item.trim())
          .filter(Boolean);
      });

      return normalizeExperienceEntry({
        employer: employerFromSeparateLine || (secondary ? primary : null),
        title: titleFromSeparateLine || secondary || primary,
        responsibilities: responsibilityLines,
      });
    })
    .filter(Boolean)
    .slice(0, 12);
}

function parseTrainingLines(lines = []) {
  return chunkTimelineEntries(lines)
    .map((block) => {
      const headline = stripTimelinePrefix(block[0] || "");
      const details = block.slice(1).filter(Boolean);

      return normalizeEducationEntry({
        title: headline,
        institution: details[0] || null,
        notes: details.length > 1 ? details.slice(1).join(" ") : null,
      });
    })
    .filter(Boolean)
    .slice(0, 16);
}

function filterSummaryHints(lines = []) {
  return uniqueStrings(
    lines.filter((line) => {
      const normalized = normalizeText(line);
      if (!normalized) return false;
      if (normalized === "curriculum vitae" || normalized === "cv") return false;
      if (
        /^(nimi|name|telefon|phone|e post|email|aadress|address|sunniaeg|birth)/.test(
          normalized
        )
      ) {
        return false;
      }
      return true;
    })
  ).slice(0, 8);
}

function inferCareerDirections({
  rawText = "",
  educationEntries = [],
  experienceEntries = [],
  interests = [],
  strengths = [],
  digitalSkills = [],
} = {}) {
  const evidenceText = normalizeText(
    [
      rawText,
      ...educationEntries.map((item) => item?.title?.value),
      ...educationEntries.map((item) => item?.institution?.value),
      ...experienceEntries.map((item) => item?.title?.value),
      ...experienceEntries.map((item) => item?.employer?.value),
      ...experienceEntries.flatMap((item) => item?.responsibilities?.items || []),
      ...interests,
      ...strengths,
      ...digitalSkills,
    ]
      .filter(Boolean)
      .join(" \n ")
  );

  const rules = [
    {
      title: "sotsiaaltootaja",
      rationale:
        "Sul on otsene sotsiaaltoo haridus ja mitmekesine praktiline kogemus sotsiaalvaldkonnas.",
      keywords: [
        ["sotsiaaltoo", 5],
        ["sotsiaaltoo magistriope", 4],
        ["sotsiaaltoo bakalaureuseope", 4],
        ["sotsiaaltoo keskus", 4],
        ["eesti sotsiaaltoo assotsiatsioon", 4],
        ["majandamisnoustaja", 3],
        ["sotsiaalpedagoog", 3],
      ],
    },
    {
      title: "majandamisnoustaja",
      rationale:
        "Sul on olemas otsene majandamisnoustamise kogemus ning tugev kliendi- ja noustamistöo taust.",
      keywords: [
        ["majandamisnoustaja", 6],
        ["noustamine", 3],
        ["klienditoo", 2],
      ],
    },
    {
      title: "sotsiaalpedagoog",
      rationale:
        "Sotsiaalvaldkonna öpingud ja varasem kokkupuude sotsiaalpedagoogi praktikaga toetavad seda suunda.",
      keywords: [
        ["sotsiaalpedagoog", 6],
        ["opilaste probleemide kaardistamine", 3],
        ["ennetus", 2],
        ["hindamine", 2],
      ],
    },
    {
      title: "kogukonnatoo koordinaator",
      rationale:
        "Sul on kogukonna arendamise, MTU juhtimise ja vabatahtliku tegevuse koordineerimise kogemus.",
      keywords: [
        ["kogukonnaelu arendamine", 4],
        ["vabatahtlik", 3],
        ["uhingu juhtimine", 3],
        ["teemapaevade korraldamine", 2],
      ],
    },
    {
      title: "turundusassistent",
      rationale:
        "Sul on turundusassistendi kogemus, reklaammaterjalide ettevalmistamise taust ja praktiline digikanalite kasutus.",
      keywords: [
        ["turundusassistent", 6],
        ["turundus", 4],
        ["facebook", 3],
        ["reklaammaterjal", 3],
        ["bannerreklaam", 3],
        ["tootekirjelduste kirjutamine", 4],
      ],
    },
    {
      title: "e-poe spetsialist",
      rationale:
        "Sul on e-poega seotud tööülesannete, tootekirjelduste ja veebisisu haldamise kogemus.",
      keywords: [
        ["e-pood", 6],
        ["e-poega seotud", 5],
        ["tootekirjelduste kirjutamine", 4],
        ["uleslaadimine", 3],
        ["üleslaadimine", 3],
        ["kodulehe haldamine", 3],
      ],
    },
    {
      title: "sisulooja",
      rationale:
        "Visuaalse sisu, tootefotode, reklaammaterjalide ja kirjutamise kogemus toetab sisuloome suunda.",
      keywords: [
        ["tootefotode pildistamine", 5],
        ["tootefotod", 4],
        ["tootekirjelduste kirjutamine", 4],
        ["reklaammaterjalide ettevalmistus", 4],
        ["photoshop", 3],
      ],
    },
    {
      title: "tootefotograaf",
      rationale:
        "Fotokoolitused, tootefotode kogemus ja tugev pilditöötluse oskus toetavad tootefotograafi rolli.",
      keywords: [
        ["stuudiofotograafia", 5],
        ["portreefotograafia", 4],
        ["tootefotode pildistamine", 5],
        ["fototootlus", 4],
        ["fototöötlus", 4],
        ["adobe photoshop", 3],
        ["adobe lightroom", 3],
      ],
    },
  ];

  const inferred = rules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter(([keyword]) =>
        evidenceText.includes(normalizeText(keyword))
      );

      return {
        ...rule,
        matchedKeywords,
        score: matchedKeywords.reduce((sum, [, weight]) => sum + weight, 0),
      };
    })
    .filter((rule) => rule.score >= 5)
    .sort((left, right) => right.score - left.score)
    .map((rule) =>
      createDirectionEntry(
        {
          title: rule.title,
          type: "job",
          priority: rule.score,
          rationale: [
            rule.rationale,
            ...rule.matchedKeywords
              .slice(0, 2)
              .map(([keyword]) => `CV viide: ${keyword}`),
          ],
        },
        PROFILE_SOURCES.INFERRED,
        PROFILE_STATUS.UNCONFIRMED
      )
    );

  if (inferred.length > 0) {
    return inferred.slice(0, 5);
  }

  return uniqueStrings(
    experienceEntries.map((entry) => entry?.title?.value).filter(Boolean)
  )
    .slice(0, 3)
    .map((title) =>
      createDirectionEntry(
        {
          title,
          type: "job",
          priority: 1,
          rationale: ["See suund tugineb sinu senisele töökogemusele."],
        },
        PROFILE_SOURCES.INFERRED,
        PROFILE_STATUS.UNCONFIRMED
      )
    );
}

export function adaptCareerCvTextInput(payload = {}, options = {}) {
  const rawText =
    firstMeaningful(
      payload?.text,
      payload?.fullText,
      payload?.content,
      payload?.cvText,
      payload?.rawText
    ) || "";

  const fileName = firstMeaningful(payload?.fileName, payload?.name);
  const warnings = [];
  const text = getParserText(options);

  if (!rawText) {
    warnings.push(text.emptyOrUnsupported);
  }

  const { lines, sections } = parseSectionedCvText(rawText);
  const email =
    extractLabeledField(lines, ["E-post", "Email", "E-mail", "Эл. почта"]) ||
    extractEmail(rawText);
  const phone =
    extractLabeledField(lines, ["Telefon", "Phone", "Телефон"]) ||
    extractPhone(rawText);
  const displayName = extractLikelyName(lines);
  const location = extractLikelyLocation(lines);

  const languageEntries = parseLanguageLinesStructured(sections.languages);
  const completedEducationEntries = parseEducationLinesStructured(sections.education);
  const additionalTrainingEntries = parseTrainingLines(
    sections.additionalTraining
  );
  const experienceEntries = parseExperienceLinesStructured(sections.experience);
  const domainSkills = parseSkillLines(sections.skills);
  const digitalSkills = parseSkillLines(sections.digitalSkills);
  const interests = parseSkillLines(sections.interests);
  const strengths = parseSkillLines(sections.strengths).slice(0, 8);
  const highestLevel = inferHighestEducationLevel(completedEducationEntries);
  const currentStatus = deriveCurrentStatus(experienceEntries);
  const summaryHints = filterSummaryHints(sections.summary);
  const inferredDirections = inferCareerDirections({
    rawText,
    educationEntries: completedEducationEntries,
    experienceEntries,
    interests,
    strengths,
    digitalSkills,
  });
  const missingInformation = uniqueStrings([
    experienceEntries.length === 0 ? "experience" : null,
    completedEducationEntries.length === 0 ? "education" : null,
    domainSkills.length === 0 ? "skills" : null,
  ]).filter(Boolean);

  const confidenceNotes = uniqueStrings([
    text.summaryDetected,
    fileName ? `CV file: ${fileName}` : null,
    "Built from uploaded CV text.",
  ]);

  const profilePatch = {
    sourceMode: {
      activeModes: [SOURCE_MODES.CV_UPLOAD],
      cvUploaded: true,
      rawCvRetained: false,
    },

    identity: {
      displayName: makeMeta(displayName),
      location: makeMeta(location),
      languages: makeList(languageEntries),
    },

    contact: {
      email: makeMeta(email),
      phone: makeMeta(phone),
    },

    workStatus: {
      currentStatus: makeMeta(currentStatus),
    },

    education: {
      highestLevel: makeMeta(highestLevel),
      completed: makeList(completedEducationEntries),
      additionalTraining: makeList(additionalTrainingEntries),
    },

    experience: {
      roles: makeList(experienceEntries),
    },

    skills: {
      domainSkills: makeList(domainSkills),
      digitalSkills: makeList(digitalSkills),
    },

    selfAnalysis: {
      strengths: makeList(strengths),
      interests: makeList(interests),
    },

    directions: {
      immediateTargets: makeList(inferredDirections, PROFILE_SOURCES.INFERRED),
    },

    recommendationContext: {
      confidenceNotes: makeList(confidenceNotes),
      missingInformation: makeList(missingInformation),
    },
  };

  if (summaryHints.length > 0) {
    profilePatch.selfAnalysis = {
      ...(profilePatch.selfAnalysis || {}),
      interests:
        interests.length > 0
          ? makeList(uniqueStrings([...interests, ...summaryHints]).slice(0, 12))
          : makeList(summaryHints),
    };
  }

  const stats = {
    lineCount: lines.length,
    languageCount: languageEntries.length,
    educationCount: completedEducationEntries.length,
    experienceCount: experienceEntries.length,
    domainSkillCount: domainSkills.length,
    digitalSkillCount: digitalSkills.length,
    directionCount: inferredDirections.length,
    missingInformationCount: missingInformation.length,
    warningCount: warnings.length,
  };

  return {
    profilePatch,
    profilePatchSource:
      options.profilePatchSource || PROFILE_SOURCES.FROM_CV,
    qcReport: {
      source: "uploaded_cv_text",
      lineCount: lines.length,
    },
    warnings,
    stats,
  };
}

export function adaptCareerCvParserOutput(payload = {}, options = {}) {
  const root = pickRoot(payload);
  const qcReport = pickQcReport(payload);
  const warnings = buildWarnings(root, qcReport, options);

  const displayName = firstMeaningful(
    pickRawValue(root, ["displayName", "fullName", "name", "person.name"]),
    pickRawValue(payload, ["fullName", "displayName"])
  );

  const email = firstMeaningful(
    pickRawValue(root, ["email", "contact.email"]),
    pickRawValue(payload, ["email"])
  );

  const phone = firstMeaningful(
    pickRawValue(root, ["phone", "contact.phone"]),
    pickRawValue(payload, ["phone"])
  );

  const location = firstMeaningful(
    pickRawValue(root, ["location", "city", "contact.location", "person.location"]),
    pickRawValue(payload, ["location"])
  );

  const languageEntries = pickRawArray(root, [
    "languages",
    "languageSkills",
    "language_skills",
  ])
    .map((item) => normalizeLanguageEntry(item))
    .filter(Boolean);

  const completedEducationEntries = pickRawArray(root, [
    "education",
    "educationHistory",
    "education_history",
    "degrees",
    "studies",
  ])
    .map((item) => normalizeEducationEntry(item))
    .filter(Boolean);

  const ongoingEducationEntries = pickRawArray(root, [
    "ongoingEducation",
    "currentStudies",
    "current_studies",
  ])
    .map((item) => normalizeEducationEntry(item))
    .filter(Boolean);

  const trainingEntries = pickRawArray(root, [
    "additionalTraining",
    "trainings",
    "courses",
  ])
    .map((item) => normalizeEducationEntry(item))
    .filter(Boolean);

  const certificateEntries = pickRawArray(root, [
    "certificates",
    "certifications",
    "licenses",
  ])
    .map((item) => normalizeCertificateEntry(item))
    .filter(Boolean);

  const experienceEntries = pickRawArray(root, [
    "experience",
    "workExperience",
    "work_experience",
    "employmentHistory",
    "employment_history",
    "roles",
  ])
    .map((item) => normalizeExperienceEntry(item))
    .filter(Boolean);

  const gapEntries = pickRawArray(root, [
    "employmentGaps",
    "gaps",
    "careerGaps",
  ])
    .map((item) => normalizeGapEntry(item))
    .filter(Boolean);

  const directionEntries = pickRawArray(root, [
    "suggestedDirections",
    "directions",
    "targetRoles",
    "target_roles",
  ])
    .map((item) => normalizeDirectionEntry(item))
    .filter(Boolean);

  const domainSkills = uniqueStrings([
    ...normalizeStringList(
      pickRawValue(root, ["domainSkills", "hardSkills", "technicalSkills"])
    ),
    ...normalizeStringList(pickRawValue(root, ["skills", "coreSkills"])),
  ]);

  const transferableSkills = uniqueStrings([
    ...normalizeStringList(
      pickRawValue(root, ["transferableSkills", "softSkills"])
    ),
  ]);

  const selfManagementSkills = uniqueStrings(
    normalizeStringList(
      pickRawValue(root, ["selfManagementSkills", "self_management_skills"])
    )
  );

  const digitalSkills = uniqueStrings(
    normalizeStringList(pickRawValue(root, ["digitalSkills", "digital_skills"]))
  );

  const sectors = uniqueStrings(
    normalizeStringList(
      pickRawValue(root, ["sectors", "industries", "fields"])
    )
  );

  const strengths = uniqueStrings(
    normalizeStringList(pickRawValue(root, ["strengths"]))
  );

  const interests = uniqueStrings(
    normalizeStringList(pickRawValue(root, ["interests"]))
  );

  const values = uniqueStrings(
    normalizeStringList(pickRawValue(root, ["values"]))
  );

  const preferredWorkForms = uniqueStrings(
    normalizeStringList(pickRawValue(root, ["preferredWorkForms", "employmentPreferences"]))
  );

  const highestLevel =
    firstMeaningful(
      pickRawValue(root, ["highestEducationLevel", "education.highestLevel"])
    ) || inferHighestEducationLevel(completedEducationEntries);

  const missingInformation = buildMissingInformation(root, qcReport);
  const confidenceNotes = buildConfidenceNotes(root, qcReport, warnings, options);

  const currentStatus =
    firstMeaningful(pickRawValue(root, ["currentStatus"])) ||
    deriveCurrentStatus(experienceEntries);

  const profilePatch = {
    sourceMode: {
      activeModes: [SOURCE_MODES.CV_UPLOAD],
      cvUploaded: true,
      rawCvRetained: false,
    },

    identity: {
      displayName: makeMeta(displayName),
      location: makeMeta(location),
      languages: makeList(languageEntries),
    },

    contact: {
      email: makeMeta(email),
      phone: makeMeta(phone),
    },

    workStatus: {
      currentStatus: makeMeta(currentStatus),
      preferredWorkForms: makeList(preferredWorkForms),
    },

    education: {
      highestLevel: makeMeta(highestLevel),
      completed: makeList(completedEducationEntries),
      ongoing: makeList(ongoingEducationEntries),
      certificates: makeList(certificateEntries),
      additionalTraining: makeList(trainingEntries),
    },

    experience: {
      roles: makeList(experienceEntries),
      sectors: makeList(sectors),
      employmentGaps: makeList(gapEntries),
    },

    skills: {
      domainSkills: makeList(domainSkills),
      transferableSkills: makeList(transferableSkills),
      selfManagementSkills: makeList(selfManagementSkills),
      digitalSkills: makeList(digitalSkills),
    },

    selfAnalysis: {
      strengths: makeList(strengths),
      interests: makeList(interests),
      values: makeList(values),
    },

    directions: {
      immediateTargets: makeList(directionEntries),
    },

    recommendationContext: {
      confidenceNotes: makeList(confidenceNotes),
      missingInformation: makeList(missingInformation),
    },
  };

  const stats = {
    languageCount: languageEntries.length,
    educationCount: completedEducationEntries.length + ongoingEducationEntries.length,
    trainingCount: trainingEntries.length,
    certificateCount: certificateEntries.length,
    experienceCount: experienceEntries.length,
    directionCount: directionEntries.length,
    domainSkillCount: domainSkills.length,
    transferableSkillCount: transferableSkills.length,
    digitalSkillCount: digitalSkills.length,
    missingInformationCount: missingInformation.length,
    warningCount: warnings.length,
  };

  return {
    profilePatch,
    profilePatchSource:
      options.profilePatchSource || PROFILE_SOURCES.FROM_CV,
    qcReport,
    warnings,
    stats,
  };
}

export function buildCareerCvProfilePatch(payload = {}, options = {}) {
  return adaptCareerCvParserOutput(payload, options).profilePatch;
}
