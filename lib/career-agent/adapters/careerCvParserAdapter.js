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

function firstMeaningful(...values) {
  for (const value of values) {
    const normalized = coerceString(value);
    if (normalized) return normalized;
  }
  return null;
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
