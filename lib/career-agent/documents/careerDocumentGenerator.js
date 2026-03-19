// /lib/career-agent/documents/careerDocumentGenerator.js

import {
  getMetaValue,
  getMetaStatus,
  getListItems,
  getListStatus,
  isMetaField,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import { PROFILE_STATUS } from "../profile/careerProfile.schema.js";
import {
  DOCUMENT_TYPES,
  resolveDocumentFlow,
  getMissingDocumentInputs,
} from "./careerDocumentFlows.js";
import { buildDocumentTemplate } from "./careerDocumentTemplates.js";
import { getCareerDocumentGeneratorText } from "../i18n/careerDocumentGeneratorText.js";

export const DOCUMENT_GENERATION_STATUS = Object.freeze({
  READY: "ready",
  NEEDS_INPUT: "needs_input",
  INVALID_PREPARED_DATA: "invalid_prepared_data",
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

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

function getDocumentGeneratorText(options = {}) {
  return getCareerDocumentGeneratorText(
    resolveLocaleCode(options.locale, options.documentLanguage, options.language)
  );
}

function compactStrings(values = []) {
  return values.filter((value) => typeof value === "string" && value.trim().length > 0);
}

function uniqueStrings(values = []) {
  return Array.from(new Set(compactStrings(values).map((value) => value.trim())));
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => (typeof item === "string" ? item : null))
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
    if (hasMeaningfulValue(value)) return value;
  }
  return null;
}

function hasConfirmedMetaValue(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    hasMeaningfulValue(getMetaValue(field))
  );
}

function getConfirmedMetaString(field) {
  return hasConfirmedMetaValue(field) ? coerceString(getMetaValue(field)) : null;
}

function hasConfirmedListContent(field) {
  return (
    getListStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getListItems(field, []).length > 0
  );
}

function extractCanonicalStringItem(item) {
  if (typeof item === "string") {
    return coerceString(item);
  }

  if (isMetaField(item)) {
    return getMetaStatus(item) === PROFILE_STATUS.CONFIRMED
      ? coerceString(getMetaValue(item))
      : null;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const candidateFields = [item.label, item.name, item.title];

  for (const field of candidateFields) {
    if (
      isMetaField(field) &&
      getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
      hasMeaningfulValue(getMetaValue(field))
    ) {
      return coerceString(getMetaValue(field));
    }
  }

  return null;
}

function extractConfirmedStringList(field) {
  if (!hasConfirmedListContent(field)) {
    return [];
  }

  return uniqueStrings(
    getListItems(field, [])
      .map((item) => extractCanonicalStringItem(item))
      .filter(Boolean)
  );
}

function mergeExplicitAndConfirmedStrings(explicitValue, field) {
  const explicit = normalizeStringList(explicitValue);
  if (explicit.length > 0) {
    return explicit;
  }

  return extractConfirmedStringList(field);
}

function pickLanguage(input = {}, options = {}) {
  return resolveLocaleCode(
    input.language,
    input.languagePreference,
    options.documentLanguage,
    options.language,
    options.locale
  );
}

function buildPersonData(profile = {}, input = {}) {
  return {
    displayName: firstMeaningful(
      coerceString(input.displayName),
      coerceString(input.fullName),
      getConfirmedMetaString(profile?.identity?.displayName)
    ),
    email: firstMeaningful(
      coerceString(input.email),
      getConfirmedMetaString(profile?.contact?.email)
    ),
    phone: firstMeaningful(
      coerceString(input.phone),
      getConfirmedMetaString(profile?.contact?.phone)
    ),
    location: firstMeaningful(
      coerceString(input.location),
      getConfirmedMetaString(profile?.identity?.location)
    ),
  };
}

function buildExperienceData(profile = {}, input = {}) {
  const explicit = toSafeArray(input.experience)
    .map((role) => {
      if (!role || typeof role !== "object") return null;

      return {
        title: coerceString(role.title),
        employer: coerceString(role.employer),
        startDate: coerceString(role.startDate),
        endDate: coerceString(role.endDate),
        responsibilities: normalizeStringList(role.responsibilities),
        achievements: normalizeStringList(role.achievements),
      };
    })
    .filter((role) => role && hasMeaningfulValue(role.title || role.employer));

  if (explicit.length > 0) {
    return explicit;
  }

  if (!hasConfirmedListContent(profile?.experience?.roles)) {
    return [];
  }

  return getListItems(profile.experience.roles, [])
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const title =
        getConfirmedMetaString(item.title) || extractCanonicalStringItem(item);
      const employer = getConfirmedMetaString(item.employer);
      const startDate = getConfirmedMetaString(item.startDate);
      const endDate = getConfirmedMetaString(item.endDate);

      const responsibilities = extractConfirmedStringList(item.responsibilities);
      const achievements = extractConfirmedStringList(item.achievements);

      if (
        !hasMeaningfulValue(title) &&
        !hasMeaningfulValue(employer) &&
        responsibilities.length === 0 &&
        achievements.length === 0
      ) {
        return null;
      }

      return {
        title,
        employer,
        startDate,
        endDate,
        responsibilities,
        achievements,
      };
    })
    .filter(Boolean);
}

function buildEducationData(profile = {}, input = {}) {
  const explicit = toSafeArray(input.education)
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      return {
        title: coerceString(item.title),
        institution: coerceString(item.institution),
        level: coerceString(item.level),
        completionStatus: coerceString(item.completionStatus || item.status),
      };
    })
    .filter((item) => item && hasMeaningfulValue(item.title || item.institution));

  if (explicit.length > 0) {
    return explicit;
  }

  const sourceFields = [
    profile?.education?.completed,
    profile?.education?.ongoing,
    profile?.education?.additionalTraining,
  ];

  return sourceFields.flatMap((field) => {
    if (!hasConfirmedListContent(field)) return [];

    return getListItems(field, [])
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const title =
          getConfirmedMetaString(item.title) || extractCanonicalStringItem(item);
        const institution = getConfirmedMetaString(item.institution);
        const level = getConfirmedMetaString(item.level);
        const completionStatus = getConfirmedMetaString(item.completionStatus);

        if (!hasMeaningfulValue(title) && !hasMeaningfulValue(institution)) {
          return null;
        }

        return {
          title,
          institution,
          level,
          completionStatus,
        };
      })
      .filter(Boolean);
  });
}

function buildAchievementHighlightsFromRoles(profile = {}) {
  return buildExperienceData(profile, {})
    .flatMap((role) => toSafeArray(role.achievements))
    .filter(Boolean);
}

function buildSummary(profile = {}, input = {}, options = {}) {
  const explicit = coerceString(input.summary);
  if (explicit) return explicit;

  const localeText = getDocumentGeneratorText(options);
  const primaryGoal = getConfirmedMetaString(profile?.goals?.primaryGoal);
  const strengths = extractConfirmedStringList(profile?.selfAnalysis?.strengths).slice(0, 3);
  const interests = extractConfirmedStringList(profile?.selfAnalysis?.interests).slice(0, 3);

  const parts = [
    primaryGoal
      ? `${localeText.summary.primaryGoalLabel}: ${primaryGoal}.`
      : null,
    strengths.length
      ? `${localeText.summary.strengthsLabel}: ${strengths.join(", ")}.`
      : null,
    interests.length
      ? `${localeText.summary.interestsLabel}: ${interests.join(", ")}.`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
}

function buildRelevantExperienceHighlights(profile = {}, input = {}) {
  const explicit = normalizeStringList(input.relevantExperienceHighlights);
  if (explicit.length > 0) return explicit;

  const roles = buildExperienceData(profile, {});
  const fromRoles = roles.flatMap((role) => [
    ...toSafeArray(role.achievements),
    ...toSafeArray(role.responsibilities),
  ]);

  return uniqueStrings(fromRoles).slice(0, 6);
}

function buildTargetRole(profile = {}, input = {}) {
  const explicit = firstMeaningful(
    coerceString(input.targetRole),
    coerceString(input.jobTitle),
    coerceString(input.roleTitle),
    coerceString(input.targetOpportunityTitle),
    coerceString(input.opportunityTitle)
  );

  if (explicit) return explicit;

  if (!hasConfirmedListContent(profile?.directions?.immediateTargets)) {
    return null;
  }

  return (
    getListItems(profile.directions.immediateTargets, [])
      .map((item) => {
        if (typeof item === "string") return item;
        return firstMeaningful(
          getConfirmedMetaString(item?.title),
          getConfirmedMetaString(item?.label),
          extractCanonicalStringItem(item)
        );
      })
      .find((value) => hasMeaningfulValue(value)) || null
  );
}

function buildMotivation(input = {}) {
  return firstMeaningful(
    coerceString(input.motivation),
    coerceString(input.motivationFocus),
    coerceString(input.whyThisRole),
    coerceString(input.whyThisProgramme)
  );
}

function buildValues(profile = {}, input = {}) {
  return mergeExplicitAndConfirmedStrings(input.values, profile?.selfAnalysis?.values);
}

function buildInterests(profile = {}, input = {}) {
  return mergeExplicitAndConfirmedStrings(input.interests, profile?.selfAnalysis?.interests);
}

function buildSkills(profile = {}, input = {}) {
  const explicit = normalizeStringList(input.skills);
  if (explicit.length > 0) return explicit;

  return uniqueStrings([
    ...extractConfirmedStringList(profile?.skills?.domainSkills),
    ...extractConfirmedStringList(profile?.skills?.transferableSkills),
    ...extractConfirmedStringList(profile?.skills?.digitalSkills),
  ]).slice(0, 10);
}

function buildStrengths(profile = {}, input = {}) {
  return mergeExplicitAndConfirmedStrings(input.strengths, profile?.selfAnalysis?.strengths);
}

function buildRecommendationExamples(profile = {}, input = {}) {
  const explicitExamples = normalizeStringList(input.examples);
  if (explicitExamples.length > 0) return explicitExamples;

  const explicitStrengths = normalizeStringList(input.strengths);
  if (explicitStrengths.length > 0) return explicitStrengths;

  return uniqueStrings([
    ...extractConfirmedStringList(profile?.selfAnalysis?.strengths),
    ...buildAchievementHighlightsFromRoles(profile),
  ]).slice(0, 8);
}

function prepareCommonDocumentData(profile = {}, input = {}, options = {}) {
  return {
    language: pickLanguage(input, options),
    person: buildPersonData(profile, input),
    targetRole: buildTargetRole(profile, input),
    organization: coerceString(input.organization),
    motivation: buildMotivation(input),
    summary: buildSummary(profile, input, options),
    relevantExperienceHighlights: buildRelevantExperienceHighlights(profile, input),
    skills: buildSkills(profile, input),
    strengths: buildStrengths(profile, input),
    values: buildValues(profile, input),
    interests: buildInterests(profile, input),
    experience: buildExperienceData(profile, input),
    education: buildEducationData(profile, input),
    relationshipToCandidate: firstMeaningful(
      coerceString(input.relationshipToCandidate),
      coerceString(input.relationship),
      coerceString(input.recommenderRole)
    ),
    examples: buildRecommendationExamples(profile, input),
  };
}

function localizeDocumentGeneratorErrorMessage(error, options = {}) {
  const localeText = getDocumentGeneratorText(options);
  const message = error instanceof Error ? coerceString(error.message) : null;

  if (!message) {
    return localeText.errors.invalidPreparedData;
  }

  if (message.startsWith("Unsupported document flow:")) {
    const flow = coerceString(message.slice("Unsupported document flow:".length));
    return flow
      ? `${localeText.errors.unsupportedDocumentFlow}: ${flow}`
      : localeText.errors.unsupportedDocumentFlow;
  }

  if (message === "Invalid prepared data.") {
    return localeText.errors.invalidPreparedData;
  }

  if (message.startsWith("Invalid prepared data: missing ")) {
    const missingField = coerceString(
      message.slice("Invalid prepared data: missing ".length).replace(/\.$/, "")
    );
    return missingField
      ? `${localeText.errors.invalidPreparedDataMissing} ${missingField}`
      : localeText.errors.invalidPreparedData;
  }

  return message;
}

export function prepareCareerDocumentData(flowOrType, profile = {}, input = {}, options = {}) {
  const flow = resolveDocumentFlow(flowOrType);
  if (!flow) {
    const localeText = getDocumentGeneratorText(options);
    throw new Error(
      `${localeText.errors.unsupportedDocumentFlow}: ${coerceString(flowOrType) || "unknown"}`
    );
  }

  const common = prepareCommonDocumentData(profile, input, options);

  switch (flow.id) {
    case DOCUMENT_TYPES.CV_BUILD:
    case DOCUMENT_TYPES.CV_TAILOR:
      return {
        ...common,
      };

    case DOCUMENT_TYPES.APPLICATION_EMAIL:
      return {
        ...common,
      };

    case DOCUMENT_TYPES.COVER_LETTER:
      return {
        ...common,
      };

    case DOCUMENT_TYPES.MOTIVATION_LETTER:
      return {
        ...common,
        programme: coerceString(input.programme),
      };

    case DOCUMENT_TYPES.RECOMMENDATION_HELP:
      return {
        ...common,
      };

    default:
      {
        const localeText = getDocumentGeneratorText(options);
        throw new Error(
          `${localeText.errors.unsupportedDocumentFlow}: ${coerceString(flow.id) || "unknown"}`
        );
      }
  }
}

export function generateCareerDocument(flowOrType, profile = {}, input = {}, options = {}) {
  const flow = resolveDocumentFlow(flowOrType);
  if (!flow) {
    const localeText = getDocumentGeneratorText(options);
    throw new Error(
      `${localeText.errors.unsupportedDocumentFlow}: ${coerceString(flowOrType) || "unknown"}`
    );
  }

  const missingInputs = getMissingDocumentInputs(flow.id, profile, input);

  if (missingInputs.length > 0) {
    return {
      ok: false,
      status: DOCUMENT_GENERATION_STATUS.NEEDS_INPUT,
      flow: flow.id,
      missingInputs,
      preparedData: null,
      document: null,
      error: null,
    };
  }

  const preparedData = prepareCareerDocumentData(flow.id, profile, input, options);

  try {
    const document = buildDocumentTemplate(flow.id, preparedData, options);

    return {
      ok: true,
      status: DOCUMENT_GENERATION_STATUS.READY,
      flow: flow.id,
      missingInputs: [],
      preparedData,
      document,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: DOCUMENT_GENERATION_STATUS.INVALID_PREPARED_DATA,
      flow: flow.id,
      missingInputs: [],
      preparedData,
      document: null,
      error: localizeDocumentGeneratorErrorMessage(error, options),
    };
  }
}
