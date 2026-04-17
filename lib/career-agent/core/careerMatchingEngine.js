// /lib/career-agent/core/careerMatchingEngine.js

import {
  getMetaValue,
  getListItems,
  isMetaField,
  isListField,
} from "../profile/careerProfile.helpers.js";
import {
  PROFILE_SOURCES,
  PROFILE_STATUS,
} from "../profile/careerProfile.schema.js";
import { getCareerMatchingText } from "../careerText.js";

export const CAREER_FIT_LEVELS = Object.freeze({
  STRONG: "strong",
  POSSIBLE: "possible",
  NEEDS_STEP: "needs_step",
});

export const CAREER_FIT_LABELS = Object.freeze(
  getCareerMatchingText("et").fitLabels
);

const STATUS_WEIGHTS = Object.freeze({
  [PROFILE_STATUS.CONFIRMED]: 1,
  [PROFILE_STATUS.UNCONFIRMED]: 0.78,
  [PROFILE_STATUS.MISSING]: 0,
});

const SOURCE_WEIGHTS = Object.freeze({
  [PROFILE_SOURCES.FROM_USER]: 1,
  [PROFILE_SOURCES.FROM_CV]: 0.92,
  [PROFILE_SOURCES.INFERRED]: 0.72,
  [PROFILE_SOURCES.SYSTEM_DERIVED]: 0.82,
});

const LANGUAGE_LEVEL_WEIGHTS = Object.freeze({
  a1: 1,
  a2: 2,
  b1: 3,
  b2: 4,
  c1: 5,
  c2: 6,
  basic: 1,
  elementary: 2,
  intermediate: 3,
  upper_intermediate: 4,
  advanced: 5,
  fluent: 5,
  native: 6,
});

function clamp(value, min = 0, max = 1) {
  const number = Number(value) || 0;
  return Math.max(min, Math.min(max, number));
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s/-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length >= 2);
}

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function statusWeight(status) {
  return STATUS_WEIGHTS[status] ?? 0.7;
}

function sourceWeight(source) {
  return SOURCE_WEIGHTS[source] ?? 0.76;
}

function getEvidenceWeightFromMeta(source, status) {
  return Number((statusWeight(status) * sourceWeight(source)).toFixed(3));
}

function getFieldEvidenceWeight(field, fallbackSource, fallbackStatus) {
  const source = isMetaField(field) || isListField(field)
    ? field.source
    : fallbackSource;

  const status = isMetaField(field) || isListField(field)
    ? field.status
    : fallbackStatus;

  return getEvidenceWeightFromMeta(source, status);
}

function textSimilarity(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);

  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.88;

  const aTokens = tokenize(a);
  const bTokens = tokenize(b);

  if (!aTokens.length || !bTokens.length) return 0;

  const bSet = new Set(bTokens);
  const overlap = aTokens.filter((token) => bSet.has(token));

  if (!overlap.length) return 0;

  return clamp(0.42 + (overlap.length / Math.max(aTokens.length, bTokens.length)) * 0.52);
}

function coerceArrayOfStrings(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((item) => coerceString(item)).filter(Boolean));
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

function normalizeLanguageLevel(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  if (LANGUAGE_LEVEL_WEIGHTS[normalized]) return normalized;

  if (normalized.includes("emakeel") || normalized.includes("mother tongue")) return "native";
  if (normalized.includes("native")) return "native";
  if (normalized.includes("fluent")) return "fluent";
  if (normalized.includes("advanced")) return "advanced";
  if (normalized.includes("upper intermediate")) return "upper_intermediate";
  if (normalized.includes("intermediate")) return "intermediate";
  if (normalized.includes("elementary")) return "elementary";
  if (normalized.includes("basic")) return "basic";

  return normalized;
}

function educationLevelRank(value) {
  const normalized = normalizeText(value);

  if (!normalized) return 0;
  if (normalized.includes("pohiharidus") || normalized.includes("basic")) return 1;
  if (normalized.includes("secondary") || normalized.includes("kesk")) return 2;
  if (normalized.includes("vocational") || normalized.includes("kutse")) return 3;
  if (normalized.includes("rakenduskorgharidus")) return 4;
  if (normalized.includes("bachelor") || normalized.includes("bakalaureus")) return 4;
  if (normalized.includes("master") || normalized.includes("magister")) return 5;
  if (normalized.includes("doctor") || normalized.includes("doktor")) return 6;

  return 0;
}

function createEvidenceEntry(value, weight, group, extra = {}) {
  const displayValue = coerceString(value);
  if (!displayValue) return null;

  return {
    value: displayValue,
    normalized: normalizeText(displayValue),
    weight,
    group,
    ...extra,
  };
}

function pushEntry(result, value, field, group, fallbackSource, fallbackStatus, extra = {}) {
  const entry = createEvidenceEntry(
    value,
    getFieldEvidenceWeight(field, fallbackSource, fallbackStatus),
    group,
    extra
  );

  if (entry) result.push(entry);
}

function getCanonicalEntryLabelField(item) {
  if (!item || typeof item !== "object") return null;

  if (isMetaField(item.label)) return item.label;
  if (isMetaField(item.name)) return item.name;
  if (isMetaField(item.title)) return item.title;

  return null;
}

function flattenMetaStringList(field, group) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (isMetaField(item)) {
      pushEntry(result, item.value, item, group, fallbackSource, fallbackStatus);
      continue;
    }

    if (typeof item === "string") {
      pushEntry(result, item, null, group, fallbackSource, fallbackStatus);
      continue;
    }

    const labelField = getCanonicalEntryLabelField(item);
    if (labelField) {
      pushEntry(
        result,
        getMetaValue(labelField),
        labelField,
        group,
        fallbackSource,
        fallbackStatus
      );
    }
  }

  return result;
}

function flattenLanguageEntries(field) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const language = getMetaValue(item.language);
    const level = normalizeLanguageLevel(getMetaValue(item.level));

    if (!language) continue;

    const weight = Math.min(
      1,
      getFieldEvidenceWeight(item.language, fallbackSource, fallbackStatus) *
        (level ? 1 : 0.9)
    );

    result.push({
      value: language,
      normalized: normalizeText(language),
      level,
      levelWeight: level ? LANGUAGE_LEVEL_WEIGHTS[level] ?? 0 : 0,
      weight,
      group: "language",
    });
  }

  return result;
}

function flattenRoleEntries(field) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (typeof item === "string") {
      pushEntry(result, item, null, "role_title", fallbackSource, fallbackStatus);
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const labelField = getCanonicalEntryLabelField(item);
    if (labelField && !isMetaField(item?.title)) {
      pushEntry(
        result,
        getMetaValue(labelField),
        labelField,
        "role_title",
        fallbackSource,
        fallbackStatus
      );
      continue;
    }

    const title = getMetaValue(item.title);
    const employer = getMetaValue(item.employer);
    const sector = getMetaValue(item.sector);
    const responsibilitiesField = item.responsibilities;
    const achievementsField = item.achievements;

    if (title) {
      pushEntry(result, title, item.title, "role_title", fallbackSource, fallbackStatus, {
        employer,
        sector,
      });
    }

    if (sector) {
      pushEntry(result, sector, item.sector, "role_sector", fallbackSource, fallbackStatus, {
        title,
      });
    }

    for (const responsibility of getListItems(responsibilitiesField, [])) {
      if (typeof responsibility === "string") {
        pushEntry(
          result,
          responsibility,
          null,
          "role_responsibility",
          responsibilitiesField?.source ?? fallbackSource,
          responsibilitiesField?.status ?? fallbackStatus,
          { title, employer, sector }
        );
      }
    }

    for (const achievement of getListItems(achievementsField, [])) {
      if (typeof achievement === "string") {
        pushEntry(
          result,
          achievement,
          null,
          "role_achievement",
          achievementsField?.source ?? fallbackSource,
          achievementsField?.status ?? fallbackStatus,
          { title, employer, sector }
        );
      }
    }
  }

  return result;
}

function flattenCertificateEntries(field) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const name = getMetaValue(item.name);
    const issuer = getMetaValue(item.issuer);

    if (name) {
      pushEntry(result, name, item.name, "certificate", fallbackSource, fallbackStatus, {
        issuer,
      });
    }

    if (issuer) {
      pushEntry(
        result,
        issuer,
        item.issuer,
        "certificate_issuer",
        fallbackSource,
        fallbackStatus,
        { name }
      );
    }
  }

  return result;
}

function flattenEducationEntries(field) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const title = getMetaValue(item.title);
    const level = getMetaValue(item.level);
    const institution = getMetaValue(item.institution);

    if (title) {
      pushEntry(result, title, item.title, "education_title", fallbackSource, fallbackStatus, {
        level,
        institution,
      });
    }

    if (level) {
      pushEntry(result, level, item.level, "education_level", fallbackSource, fallbackStatus, {
        title,
        institution,
        rank: educationLevelRank(level),
      });
    }
  }

  return result;
}

function flattenDirectionEntries(field) {
  const result = [];
  const items = getListItems(field, []);
  const fallbackSource = field?.source;
  const fallbackStatus = field?.status;

  for (const item of items) {
    if (typeof item === "string") {
      pushEntry(result, item, null, "direction", fallbackSource, fallbackStatus);
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const title = getMetaValue(item.title);
    const type = getMetaValue(item.type);

    if (title) {
      pushEntry(result, title, item.title, "direction", fallbackSource, fallbackStatus, {
        type,
      });
    }
  }

  return result;
}

function dedupeEntries(entries) {
  const seen = new Set();
  const result = [];

  for (const entry of entries) {
    const key = `${entry.group}:${entry.normalized}`;
    if (!entry.normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

export function buildProfileEvidence(profile = {}) {
  const roleEntries = flattenRoleEntries(profile?.experience?.roles);
  const volunteeringEntries = flattenRoleEntries(profile?.experience?.volunteering);
  const informalEntries = flattenRoleEntries(profile?.experience?.informalExperience);

  const roleTitles = dedupeEntries(
    [...roleEntries, ...volunteeringEntries, ...informalEntries].filter(
      (entry) => entry.group === "role_title"
    )
  );

  const sectors = dedupeEntries([
    ...flattenMetaStringList(profile?.experience?.sectors, "sector"),
    ...roleEntries.filter((entry) => entry.group === "role_sector"),
  ]);

  const responsibilities = dedupeEntries([
    ...flattenMetaStringList(profile?.experience?.responsibilities, "responsibility"),
    ...roleEntries.filter((entry) => entry.group === "role_responsibility"),
  ]);

  const achievements = dedupeEntries(
    roleEntries.filter((entry) => entry.group === "role_achievement")
  );

  const domainSkills = dedupeEntries(
    flattenMetaStringList(profile?.skills?.domainSkills, "domain_skill")
  );
  const transferableSkills = dedupeEntries(
    flattenMetaStringList(profile?.skills?.transferableSkills, "transferable_skill")
  );
  const selfManagementSkills = dedupeEntries(
    flattenMetaStringList(profile?.skills?.selfManagementSkills, "self_management_skill")
  );
  const digitalSkills = dedupeEntries(
    flattenMetaStringList(profile?.skills?.digitalSkills, "digital_skill")
  );
  const languageSkills = dedupeEntries([
    ...flattenMetaStringList(profile?.skills?.languageSkills, "language_skill"),
    ...flattenLanguageEntries(profile?.identity?.languages),
  ]);

  const educationTitles = dedupeEntries([
    ...flattenEducationEntries(profile?.education?.completed).filter(
      (entry) => entry.group === "education_title"
    ),
    ...flattenEducationEntries(profile?.education?.ongoing).filter(
      (entry) => entry.group === "education_title"
    ),
    ...flattenEducationEntries(profile?.education?.additionalTraining).filter(
      (entry) => entry.group === "education_title"
    ),
  ]);

  const educationLevels = dedupeEntries([
    ...flattenEducationEntries(profile?.education?.completed).filter(
      (entry) => entry.group === "education_level"
    ),
    ...flattenEducationEntries(profile?.education?.ongoing).filter(
      (entry) => entry.group === "education_level"
    ),
    ...flattenEducationEntries(profile?.education?.additionalTraining).filter(
      (entry) => entry.group === "education_level"
    ),
  ]);

  const certificates = dedupeEntries(
    flattenCertificateEntries(profile?.education?.certificates)
  );

  const interests = dedupeEntries(
    flattenMetaStringList(profile?.selfAnalysis?.interests, "interest")
  );
  const values = dedupeEntries(
    flattenMetaStringList(profile?.selfAnalysis?.values, "value")
  );
  const strengths = dedupeEntries(
    flattenMetaStringList(profile?.selfAnalysis?.strengths, "strength")
  );
  const dealBreakers = dedupeEntries(
    flattenMetaStringList(profile?.selfAnalysis?.dealBreakers, "deal_breaker")
  );
  const competitiveAdvantages = dedupeEntries(
    flattenMetaStringList(profile?.selfAnalysis?.competitiveAdvantages, "competitive_advantage")
  );

  const immediateTargets = dedupeEntries(
    flattenDirectionEntries(profile?.directions?.immediateTargets)
  );
  const nearTargets = dedupeEntries(
    flattenDirectionEntries(profile?.directions?.nearTargets)
  );
  const educationPaths = dedupeEntries(
    flattenDirectionEntries(profile?.directions?.educationPaths)
  );

  const preferredWorkForms = dedupeEntries(
    flattenMetaStringList(profile?.workStatus?.preferredWorkForms, "preferred_work_form")
  );

  return {
    roleTitles,
    sectors,
    responsibilities,
    achievements,
    domainSkills,
    transferableSkills,
    selfManagementSkills,
    digitalSkills,
    languageSkills,
    educationTitles,
    educationLevels,
    certificates,
    interests,
    values,
    strengths,
    dealBreakers,
    competitiveAdvantages,
    immediateTargets,
    nearTargets,
    educationPaths,
    preferredWorkForms,
    workTimePreference: getMetaValue(profile?.workStatus?.workTimePreference),
    remotePreference: getMetaValue(profile?.workStatus?.remotePreference),
    mobilityConstraints: getListItems(profile?.workStatus?.mobilityConstraints, []),
    otherConstraints: getListItems(profile?.workStatus?.otherConstraints, []),
  };
}

function normalizeLanguageRequirement(item) {
  if (typeof item === "string") {
    return {
      language: item,
      level: null,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    language: coerceString(item.language || item.name || item.label),
    level: normalizeLanguageLevel(item.level),
  };
}

function normalizeCareerOpportunity(input = {}) {
  return {
    id: input.id ?? null,
    title: coerceString(input.title || input.label || input.name),
    type: coerceString(input.type || "job"),
    sector: coerceString(input.sector || input.field),
    location: coerceString(input.location),
    workForm: coerceString(input.workForm || input.employmentType),
    remoteMode: coerceString(input.remoteMode || input.remotePreference),
    description: coerceString(input.description),
    roleKeywords: uniqueStrings([
      ...coerceArrayOfStrings(input.roleKeywords),
      ...coerceArrayOfStrings(input.titles),
    ]),
    responsibilityKeywords: uniqueStrings([
      ...coerceArrayOfStrings(input.responsibilityKeywords),
      ...coerceArrayOfStrings(input.tasks),
    ]),
    requiredSkills: uniqueStrings(coerceArrayOfStrings(input.requiredSkills)),
    preferredSkills: uniqueStrings(coerceArrayOfStrings(input.preferredSkills)),
    requiredLanguages: toSafeArray(input.requiredLanguages)
      .map((item) => normalizeLanguageRequirement(item))
      .filter((item) => item?.language),
    requiredEducationLevels: uniqueStrings(
      coerceArrayOfStrings(input.requiredEducationLevels)
    ),
    preferredEducationAreas: uniqueStrings(
      coerceArrayOfStrings(input.preferredEducationAreas)
    ),
    values: uniqueStrings(coerceArrayOfStrings(input.values)),
    conditions: uniqueStrings([
      ...coerceArrayOfStrings(input.conditions),
      ...coerceArrayOfStrings(input.workConditions),
    ]),
    directionPriority: Number.isFinite(Number(input.directionPriority))
      ? Number(input.directionPriority)
      : 0,
    directionRationale: uniqueStrings(
      coerceArrayOfStrings(input.directionRationale || input.rationale)
    ),
  };
}

function findBestEntryMatch(keyword, entries) {
  let best = null;

  for (const entry of entries) {
    const similarity = textSimilarity(keyword, entry.value);
    if (!best || similarity * entry.weight > best.score) {
      best = {
        entry,
        similarity,
        score: similarity * entry.weight,
      };
    }
  }

  return best;
}

function scoreKeywordRequirementSet(keywords, entries, minimumSimilarity = 0.74) {
  const safeKeywords = uniqueStrings(keywords.map((item) => coerceString(item)).filter(Boolean));

  if (!safeKeywords.length) {
    return {
      score: 1,
      matched: [],
      missing: [],
      partial: [],
    };
  }

  const matched = [];
  const missing = [];
  const partial = [];
  let total = 0;

  for (const keyword of safeKeywords) {
    const best = findBestEntryMatch(keyword, entries);

    if (!best || best.similarity < 0.38) {
      missing.push(keyword);
      continue;
    }

    if (best.similarity >= minimumSimilarity) {
      matched.push({ required: keyword, matchedWith: best.entry.value });
      total += best.score;
    } else {
      partial.push({ required: keyword, matchedWith: best.entry.value });
      total += best.score * 0.55;
    }
  }

  return {
    score: clamp(total / safeKeywords.length),
    matched,
    missing,
    partial,
  };
}

function scoreLanguages(requiredLanguages, languageEntries) {
  if (!requiredLanguages.length) {
    return {
      score: 1,
      matched: [],
      missing: [],
    };
  }

  const matched = [];
  const missing = [];
  let total = 0;

  for (const requirement of requiredLanguages) {
    const normalizedLanguage = normalizeText(requirement.language);

    const candidate = languageEntries.find(
      (entry) => entry.normalized === normalizedLanguage
    );

    if (!candidate) {
      missing.push(requirement.language);
      continue;
    }

    const requiredLevelWeight = requirement.level
      ? LANGUAGE_LEVEL_WEIGHTS[requirement.level] ?? 0
      : 0;

    const candidateLevelWeight = candidate.levelWeight ?? 0;

    let levelScore = 1;
    if (requiredLevelWeight > 0) {
      levelScore = candidateLevelWeight >= requiredLevelWeight ? 1 : 0.45;
    }

    total += clamp(candidate.weight * levelScore);
    matched.push({
      required: requirement.language,
      matchedWith: candidate.value,
      requiredLevel: requirement.level,
      candidateLevel: candidate.level,
    });
  }

  return {
    score: clamp(total / requiredLanguages.length),
    matched,
    missing,
  };
}

function scoreEducation(requiredLevels, preferredAreas, evidence) {
  const educationLevelRanks = evidence.educationLevels
    .map((entry) => entry.rank || educationLevelRank(entry.value))
    .filter((rank) => rank > 0);

  const currentRank = educationLevelRanks.length
    ? Math.max(...educationLevelRanks)
    : 0;

  const requiredRanks = requiredLevels.map((value) => educationLevelRank(value)).filter(Boolean);

  let levelScore = 1;
  const missing = [];

  if (requiredRanks.length) {
    const requiredRank = Math.max(...requiredRanks);
    if (currentRank === 0) {
      levelScore = 0;
      missing.push(...requiredLevels);
    } else if (currentRank < requiredRank) {
      levelScore = 0.45;
      missing.push(...requiredLevels);
    }
  }

  const preferredAreaScore = preferredAreas.length
    ? scoreKeywordRequirementSet(
        preferredAreas,
        [...evidence.educationTitles, ...evidence.certificates],
        0.66
      ).score
    : 1;

  return {
    score: clamp(levelScore * 0.7 + preferredAreaScore * 0.3),
    missing,
  };
}

function scoreDirectionsAlignment(opportunity, evidence) {
  const directionPool = [
    ...evidence.immediateTargets,
    ...evidence.nearTargets,
    ...evidence.educationPaths,
  ];

  const keywords = uniqueStrings([
    opportunity.title,
    ...opportunity.roleKeywords,
    ...(opportunity.sector ? [opportunity.sector] : []),
  ].filter(Boolean));

  return scoreKeywordRequirementSet(keywords, directionPool, 0.72);
}

function scorePreferences(opportunity, evidence) {
  let score = 1;
  const concerns = [];

  if (opportunity.workForm && evidence.preferredWorkForms.length) {
    const workFormMatch = findBestEntryMatch(opportunity.workForm, evidence.preferredWorkForms);
    if (!workFormMatch || workFormMatch.similarity < 0.7) {
      score *= 0.72;
      concerns.push(`töövorm "${opportunity.workForm}" ei kattu hästi eelistustega`);
    }
  }

  const remotePreference = normalizeText(evidence.remotePreference);
  const remoteMode = normalizeText(opportunity.remoteMode);

  if (remotePreference && remoteMode) {
    const incompatible =
      (remotePreference.includes("remote") && remoteMode.includes("onsite")) ||
      (remotePreference.includes("kohapeal") && remoteMode.includes("remote"));

    if (incompatible) {
      score *= 0.72;
      concerns.push("kaugtöö eelistus ei kattu");
    }
  }

  const dealBreakerMatch = scoreKeywordRequirementSet(
    opportunity.conditions,
    evidence.dealBreakers,
    0.72
  );

  if (dealBreakerMatch.matched.length) {
    score *= 0.25;
    concerns.push("mõni töötingimus kattub kasutaja välistustega");
  }

  return {
    score: clamp(score),
    concerns,
  };
}

function scoreValuesAndInterests(opportunity, evidence) {
  const valuesScore = opportunity.values.length
    ? scoreKeywordRequirementSet(opportunity.values, evidence.values, 0.7).score
    : 1;

  const interestsScore = opportunity.sector || opportunity.title
    ? scoreKeywordRequirementSet(
        uniqueStrings([opportunity.title, opportunity.sector].filter(Boolean)),
        evidence.interests,
        0.66
      ).score
    : 1;

  return clamp(valuesScore * 0.55 + interestsScore * 0.45);
}

function buildOpportunityKeywordPool(opportunity) {
  return uniqueStrings([
    opportunity.title,
    opportunity.sector,
    ...opportunity.roleKeywords,
    ...opportunity.responsibilityKeywords,
    ...opportunity.requiredSkills,
    ...opportunity.preferredSkills,
  ].filter(Boolean));
}

function computeConfidencePenalty(evidence) {
  const evidenceGroups = [
    evidence.roleTitles,
    evidence.domainSkills,
    evidence.transferableSkills,
    evidence.educationTitles,
    evidence.immediateTargets,
    evidence.interests,
    evidence.values,
  ];

  const entryCount = evidenceGroups.reduce((sum, group) => sum + group.length, 0);

  if (entryCount >= 14) return 1;
  if (entryCount >= 8) return 0.92;
  if (entryCount >= 4) return 0.82;
  return 0.68;
}

function fitLevelFromScore(score, missingRequiredCount, preferenceConcerns) {
  if (score >= 0.72 && missingRequiredCount === 0 && preferenceConcerns === 0) {
    return CAREER_FIT_LEVELS.STRONG;
  }

  if (score >= 0.48) {
    return CAREER_FIT_LEVELS.POSSIBLE;
  }

  return CAREER_FIT_LEVELS.NEEDS_STEP;
}

function takeTopTexts(items, limit = 4) {
  return uniqueStrings(items.filter(Boolean)).slice(0, limit);
}

function getMatchingText(options = {}) {
  return getCareerMatchingText(options.locale || options.language || "et");
}

function buildNextStep(opportunity, missingRequirements, options = {}) {
  const text = getMatchingText(options);

  if (missingRequirements.length > 0) {
    return text.nextStepMissingRequirements(missingRequirements.slice(0, 3));
  }

  if (opportunity.type === "education") {
    return text.nextStepEducation;
  }

  return text.nextStepGeneral;
}

export function computeCareerFit(profile, rawOpportunity, options = {}) {
  const text = getMatchingText(options);
  const opportunity = normalizeCareerOpportunity(rawOpportunity);
  const evidence = buildProfileEvidence(profile);

  const directionAlignment = scoreDirectionsAlignment(opportunity, evidence);

  const experienceScore = scoreKeywordRequirementSet(
    uniqueStrings([
      opportunity.title,
      ...opportunity.roleKeywords,
      ...opportunity.responsibilityKeywords,
      ...(opportunity.sector ? [opportunity.sector] : []),
    ].filter(Boolean)),
    [
      ...evidence.roleTitles,
      ...evidence.sectors,
      ...evidence.responsibilities,
      ...evidence.achievements,
    ],
    0.68
  );

  const requiredSkillsScore = scoreKeywordRequirementSet(
    opportunity.requiredSkills,
    [
      ...evidence.domainSkills,
      ...evidence.transferableSkills,
      ...evidence.digitalSkills,
      ...evidence.selfManagementSkills,
    ],
    0.72
  );

  const preferredSkillsScore = scoreKeywordRequirementSet(
    opportunity.preferredSkills,
    [
      ...evidence.domainSkills,
      ...evidence.transferableSkills,
      ...evidence.digitalSkills,
      ...evidence.selfManagementSkills,
      ...evidence.competitiveAdvantages,
      ...evidence.strengths,
    ],
    0.66
  );

  const languageScore = scoreLanguages(opportunity.requiredLanguages, evidence.languageSkills);

  const educationScore = scoreEducation(
    opportunity.requiredEducationLevels,
    opportunity.preferredEducationAreas,
    evidence
  );

  const valuesAndInterestsScore = scoreValuesAndInterests(opportunity, evidence);
  const preferencesScore = scorePreferences(opportunity, evidence);
  const confidencePenalty = computeConfidencePenalty(evidence);

  const weightedScore =
    directionAlignment.score * 0.12 +
    experienceScore.score * 0.22 +
    requiredSkillsScore.score * 0.24 +
    preferredSkillsScore.score * 0.08 +
    languageScore.score * 0.1 +
    educationScore.score * 0.1 +
    valuesAndInterestsScore * 0.08 +
    preferencesScore.score * 0.06;

  const score = clamp(weightedScore * confidencePenalty);

  const missingRequirements = takeTopTexts([
    ...requiredSkillsScore.missing,
    ...languageScore.missing,
    ...educationScore.missing,
  ], 6);

  const whyItFits = takeTopTexts([
    ...directionAlignment.matched.map((item) => `${text.evidence.directionMatch}${item.matchedWith}`),
    ...experienceScore.matched.map((item) => `${text.evidence.experienceMatch}${item.matchedWith}`),
    ...requiredSkillsScore.matched.map((item) => `${text.evidence.skillMatch}${item.matchedWith}`),
    ...preferredSkillsScore.matched.map((item) => `${text.evidence.extraValue}${item.matchedWith}`),
  ], 5);

  const whatIsMissing = takeTopTexts([
    ...missingRequirements,
    ...preferencesScore.concerns,
  ], 5);

  const whatUserCanOfferExtra = takeTopTexts([
    ...evidence.competitiveAdvantages.map((item) => item.value),
    ...evidence.strengths.map((item) => item.value),
    ...preferredSkillsScore.partial.map((item) => item.matchedWith),
  ], 5);

  const confidenceNotes = takeTopTexts([
    confidencePenalty < 0.9 ? text.confidence.limitedConfirmedInfo : null,
    requiredSkillsScore.partial.length ? text.confidence.partialSkillOverlap : null,
    directionAlignment.matched.length === 0 ? text.confidence.directionNotConfirmed : null,
    languageScore.missing.length ? text.confidence.languageRequirementsNeedWork : null,
  ], 4);

  const fitLevel = fitLevelFromScore(
    score,
    missingRequirements.length,
    preferencesScore.concerns.length
  );

  return {
    opportunity,
    score: Number(score.toFixed(3)),
    fitLevel,
    fitLabel: text.fitLabels[fitLevel],
    whyItFits,
    whatIsMissing,
    whatUserCanOfferExtra,
    nextStep: buildNextStep(opportunity, missingRequirements, options),
    confidenceNotes,
    debug: options.includeDebug
      ? {
          directionAlignment,
          experienceScore,
          requiredSkillsScore,
          preferredSkillsScore,
          languageScore,
          educationScore,
          valuesAndInterestsScore,
          preferencesScore,
          confidencePenalty,
          keywordPool: buildOpportunityKeywordPool(opportunity),
        }
      : undefined,
  };
}

export function rankCareerOpportunities(profile, opportunities = [], options = {}) {
  return toSafeArray(opportunities)
    .map((opportunity) => computeCareerFit(profile, opportunity, options))
    .sort((a, b) => b.score - a.score);
}
