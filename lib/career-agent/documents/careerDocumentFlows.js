// /lib/career-agent/documents/careerDocumentFlows.js

import {
  getMetaValue,
  getMetaStatus,
  getListItems,
  getListStatus,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import { PROFILE_STATUS } from "../profile/careerProfile.schema.js";
import { getCareerDocumentFlowText } from "../careerText.js";

export const DOCUMENT_TYPES = Object.freeze({
  CV_BUILD: "CV_BUILD",
  CV_TAILOR: "CV_TAILOR",
  APPLICATION_EMAIL: "APPLICATION_EMAIL",
  COVER_LETTER: "COVER_LETTER",
  MOTIVATION_LETTER: "MOTIVATION_LETTER",
  RECOMMENDATION_HELP: "RECOMMENDATION_HELP",
});

export const DOCUMENT_FLOWS = Object.freeze({
  [DOCUMENT_TYPES.CV_BUILD]: {
    id: DOCUMENT_TYPES.CV_BUILD,
    label: "CV loomine",
    category: "cv",
    description: "Koosta uus või esmane CV olemasoleva profiili põhjal.",
    requiredInputs: ["person_identity", "experience_or_education", "skills_or_strengths"],
    optionalInputs: ["target_role", "language_preference"],
  },

  [DOCUMENT_TYPES.CV_TAILOR]: {
    id: DOCUMENT_TYPES.CV_TAILOR,
    label: "CV kohandamine",
    category: "cv",
    description: "Kohanda olemasolevat CV-d konkreetse rolli või võimaluse jaoks.",
    requiredInputs: ["person_identity", "experience_or_education", "target_role_or_opportunity"],
    optionalInputs: ["skills_or_strengths", "motivation_focus", "language_preference"],
  },

  [DOCUMENT_TYPES.APPLICATION_EMAIL]: {
    id: DOCUMENT_TYPES.APPLICATION_EMAIL,
    label: "Kandideerimiskiri / e-kiri",
    category: "application",
    description: "Koosta lühike kandideerimise e-kiri konkreetse võimaluse jaoks.",
    requiredInputs: ["person_identity", "target_role_or_opportunity", "motivation_focus"],
    optionalInputs: ["relevant_experience_highlights", "language_preference"],
  },

  [DOCUMENT_TYPES.COVER_LETTER]: {
    id: DOCUMENT_TYPES.COVER_LETTER,
    label: "Kaaskiri",
    category: "application",
    description: "Koosta struktureeritud kaaskiri tööle kandideerimiseks.",
    requiredInputs: [
      "person_identity",
      "target_role_or_opportunity",
      "motivation_focus",
      "relevant_experience_highlights",
    ],
    optionalInputs: ["skills_or_strengths", "language_preference"],
  },

  [DOCUMENT_TYPES.MOTIVATION_LETTER]: {
    id: DOCUMENT_TYPES.MOTIVATION_LETTER,
    label: "Motivatsioonikiri",
    category: "motivation",
    description: "Koosta motivatsioonikiri õpi- või kandideerimiskontekstiks.",
    requiredInputs: ["person_identity", "target_role_or_opportunity", "motivation_focus"],
    optionalInputs: ["relevant_experience_highlights", "values_or_interests", "language_preference"],
  },

  [DOCUMENT_TYPES.RECOMMENDATION_HELP]: {
    id: DOCUMENT_TYPES.RECOMMENDATION_HELP,
    label: "Soovituskirja ettevalmistus",
    category: "reference",
    description: "Aita kokku panna alusinfo soovituskirja või soovituse küsimise jaoks.",
    requiredInputs: [
      "person_identity",
      "relationship_to_candidate",
      "strengths_or_examples",
    ],
    optionalInputs: ["target_role_or_opportunity", "language_preference"],
  },
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function getDocumentFlowLocaleText(locale = "et") {
  return getCareerDocumentFlowText(locale);
}

function getFlowLocale(options = {}) {
  return (
    options.locale ||
    options.documentLanguage ||
    options.language ||
    "et"
  );
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

function hasConfirmedListContent(field) {
  return (
    getListStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getListItems(field, []).length > 0
  );
}

function hasAnyListContent(field) {
  return hasConfirmedListContent(field);
}

function hasAffirmativeDocumentConsent(profile) {
  return (
    getMetaStatus(profile?.consent?.documentGenerationApproved) ===
      PROFILE_STATUS.CONFIRMED &&
    getMetaValue(profile?.consent?.documentGenerationApproved) === true
  );
}

function hasIdentity(profile, input) {
  if (
    hasMeaningfulValue(input?.displayName) ||
    hasMeaningfulValue(input?.fullName)
  ) {
    return true;
  }

  return hasConfirmedMetaValue(profile?.identity?.displayName);
}

function hasExperienceOrEducation(profile, input) {
  const explicitExperience = toSafeArray(input?.experience).length > 0;
  const explicitEducation = toSafeArray(input?.education).length > 0;

  return (
    explicitExperience ||
    explicitEducation ||
    hasAnyListContent(profile?.experience?.roles) ||
    hasAnyListContent(profile?.education?.completed) ||
    hasAnyListContent(profile?.education?.ongoing) ||
    hasAnyListContent(profile?.education?.additionalTraining)
  );
}

function hasSkillsOrStrengths(profile, input) {
  const explicitSkills = toSafeArray(input?.skills).length > 0;
  const explicitStrengths = toSafeArray(input?.strengths).length > 0;

  return (
    explicitSkills ||
    explicitStrengths ||
    hasAnyListContent(profile?.skills?.domainSkills) ||
    hasAnyListContent(profile?.skills?.transferableSkills) ||
    hasAnyListContent(profile?.skills?.digitalSkills) ||
    hasAnyListContent(profile?.selfAnalysis?.strengths)
  );
}

function hasTargetRoleOrOpportunity(profile, input) {
  const targetRole = firstMeaningful(
    input?.targetRole,
    input?.jobTitle,
    input?.roleTitle,
    input?.targetOpportunityTitle,
    input?.opportunityTitle
  );

  if (hasMeaningfulValue(targetRole)) {
    return true;
  }

  if (!hasAnyListContent(profile?.directions?.immediateTargets)) {
    return false;
  }

  const directionFromProfile = getListItems(profile?.directions?.immediateTargets, [])
    .map((item) => {
      if (typeof item === "string") return item;
      return firstMeaningful(
        getMetaValue(item?.title),
        getMetaValue(item?.label),
        typeof item?.label === "string" ? item.label : null
      );
    })
    .find((value) => hasMeaningfulValue(value));

  return hasMeaningfulValue(directionFromProfile);
}

function hasMotivationFocus(_profile, input) {
  const motivation = firstMeaningful(
    input?.motivation,
    input?.motivationFocus,
    input?.whyThisRole,
    input?.whyThisProgramme
  );

  return hasMeaningfulValue(motivation);
}

function hasRelevantExperienceHighlights(profile, input) {
  const highlights = toSafeArray(input?.relevantExperienceHighlights);
  return highlights.length > 0 || hasAnyListContent(profile?.experience?.roles);
}

function hasValuesOrInterests(profile, input) {
  const explicitValues = toSafeArray(input?.values).length > 0;
  const explicitInterests = toSafeArray(input?.interests).length > 0;

  return (
    explicitValues ||
    explicitInterests ||
    hasAnyListContent(profile?.selfAnalysis?.values) ||
    hasAnyListContent(profile?.selfAnalysis?.interests)
  );
}

function hasRelationshipToCandidate(_profile, input) {
  return hasMeaningfulValue(
    firstMeaningful(
      input?.relationshipToCandidate,
      input?.relationship,
      input?.recommenderRole
    )
  );
}

function hasStrengthsOrExamples(profile, input) {
  const explicitExamples = toSafeArray(input?.examples).length > 0;
  const explicitStrengths = toSafeArray(input?.strengths).length > 0;

  return (
    explicitExamples ||
    explicitStrengths ||
    hasAnyListContent(profile?.selfAnalysis?.strengths) ||
    hasAnyListContent(profile?.experience?.achievements)
  );
}

const INPUT_CHECKS = Object.freeze({
  document_generation_consent: {
    isPresent: (profile) => hasAffirmativeDocumentConsent(profile),
    missingPrompt: {
      id: "document_generation_consent",
      prompt: "Dokumendi mustandi loomiseks on vaja kinnitatud nõusolekut dokumentide genereerimiseks.",
      type: "boolean",
      required: true,
    },
  },

  person_identity: {
    isPresent: hasIdentity,
    missingPrompt: {
      id: "person_identity",
      prompt: "Kuidas peaks dokumendis sind nimetama?",
      type: "short_text",
      required: true,
    },
  },

  experience_or_education: {
    isPresent: hasExperienceOrEducation,
    missingPrompt: {
      id: "experience_or_education",
      prompt: "Palun lisa lühidalt oma kogemus või haridustee, mida peaks dokumendis arvesse võtma.",
      type: "long_text",
      required: true,
    },
  },

  skills_or_strengths: {
    isPresent: hasSkillsOrStrengths,
    missingPrompt: {
      id: "skills_or_strengths",
      prompt: "Milliseid oskusi või tugevusi peaks selles dokumendis kindlasti esile tooma?",
      type: "long_text",
      required: true,
    },
  },

  target_role_or_opportunity: {
    isPresent: hasTargetRoleOrOpportunity,
    missingPrompt: {
      id: "target_role_or_opportunity",
      prompt: "Millise rolli, töö või võimaluse jaoks dokument koostatakse?",
      type: "short_text",
      required: true,
    },
  },

  target_role: {
    isPresent: hasTargetRoleOrOpportunity,
    missingPrompt: {
      id: "target_role",
      prompt: "Mis rollile või ametile soovid dokumenti suunata?",
      type: "short_text",
      required: true,
    },
  },

  motivation_focus: {
    isPresent: hasMotivationFocus,
    missingPrompt: {
      id: "motivation_focus",
      prompt: "Miks see võimalus või suund sulle oluline on?",
      type: "long_text",
      required: true,
    },
  },

  relevant_experience_highlights: {
    isPresent: hasRelevantExperienceHighlights,
    missingPrompt: {
      id: "relevant_experience_highlights",
      prompt: "Millist varasemat kogemust või saavutust peaks kindlasti välja tooma?",
      type: "long_text",
      required: true,
    },
  },

  values_or_interests: {
    isPresent: hasValuesOrInterests,
    missingPrompt: {
      id: "values_or_interests",
      prompt: "Millised huvid, väärtused või motivatsioon sobivad selle dokumendi konteksti kõige paremini?",
      type: "long_text",
      required: false,
    },
  },

  relationship_to_candidate: {
    isPresent: hasRelationshipToCandidate,
    missingPrompt: {
      id: "relationship_to_candidate",
      prompt: "Mis on soovitajal või kirjutajal seos kandidaadiga?",
      type: "short_text",
      required: true,
    },
  },

  strengths_or_examples: {
    isPresent: hasStrengthsOrExamples,
    missingPrompt: {
      id: "strengths_or_examples",
      prompt: "Millised tugevused või konkreetsed näited tuleks soovituse juures kindlasti välja tuua?",
      type: "long_text",
      required: true,
    },
  },

  language_preference: {
    isPresent: (_profile, input) =>
      hasMeaningfulValue(firstMeaningful(input?.language, input?.languagePreference)),
    missingPrompt: {
      id: "language_preference",
      prompt: "Mis keeles peaks dokumendi koostama?",
      type: "single_select",
      required: false,
      options: [
        { value: "et", label: "Eesti" },
        { value: "en", label: "English" },
        { value: "ru", label: "Русский" },
      ],
    },
  },
});

export function resolveDocumentFlow(flowOrType) {
  if (!flowOrType) return null;
  const normalized = coerceString(flowOrType);
  if (!normalized) return null;

  if (DOCUMENT_FLOWS[normalized]) {
    return DOCUMENT_FLOWS[normalized];
  }

  return Object.values(DOCUMENT_FLOWS).find(
    (flow) => flow.id === normalized || flow.label === normalized
  ) || null;
}

export function getDocumentFlowMeta(flowOrType) {
  return resolveDocumentFlow(flowOrType);
}

export function getLocalizedDocumentFlowMeta(flowOrType, options = {}) {
  const meta = resolveDocumentFlow(flowOrType);
  if (!meta) return null;

  const text = getDocumentFlowLocaleText(getFlowLocale(options));
  const localized = text.flows?.[meta.id] || {};

  return {
    ...meta,
    label: localized.label || meta.label,
    description: localized.description || meta.description,
  };
}

export function getMissingDocumentInputs(flowOrType, profile = {}, input = {}) {
  const flow = resolveDocumentFlow(flowOrType);
  if (!flow) return [];

  const missing = [];

  if (!INPUT_CHECKS.document_generation_consent.isPresent(profile, input)) {
    missing.push(INPUT_CHECKS.document_generation_consent.missingPrompt);
  }

  for (const key of flow.requiredInputs) {
    const checker = INPUT_CHECKS[key];
    if (!checker) continue;

    const present = checker.isPresent(profile, input);
    if (!present) {
      missing.push(checker.missingPrompt);
    }
  }

  return missing;
}

export function canGenerateDocument(flowOrType, profile = {}, input = {}) {
  return getMissingDocumentInputs(flowOrType, profile, input).length === 0;
}
