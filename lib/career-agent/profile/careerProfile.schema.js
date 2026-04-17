// /lib/career-agent/profile/careerProfile.schema.js

export const CAREER_PROFILE_SCHEMA_VERSION = "3.0.0";

export const PROFILE_SOURCES = Object.freeze({
  FROM_CV: "from_cv",
  FROM_USER: "from_user",
  INFERRED: "inferred",
  SYSTEM_DERIVED: "system_derived",
});

export const PROFILE_STATUS = Object.freeze({
  CONFIRMED: "confirmed",
  UNCONFIRMED: "unconfirmed",
  MISSING: "missing",
});

export const GOAL_TYPES = Object.freeze({
  GET_JOB: "get_job",
  CHANGE_CAREER: "change_career",
  CHOOSE_EDUCATION: "choose_education",
  RESKILL: "reskill",
  GAIN_CLARITY: "gain_clarity",
});

export const NEXT_STEP_TYPES = Object.freeze({
  APPLY_NOW: "apply_now",
  COMPARE_OPTIONS: "compare_options",
  BUILD_CV: "build_cv",
  EXPLORE_LEARNING: "explore_learning",
  PREPARE_INTERVIEW: "prepare_interview",
  REQUEST_SUPPORT: "request_support",
});

export const SUPPORT_LEVELS = Object.freeze({
  LIGHT: "light",
  MODERATE: "moderate",
  DEEP: "deep",
});

export const RECOMMENDED_MODES = Object.freeze({
  QUICK_GUIDANCE: "quick_guidance",
  GUIDED_FLOW: "guided_flow",
  MULTI_STEP_SUPPORT: "multi_step_support",
  HANDOFF: "handoff",
});

export const SOURCE_MODES = Object.freeze({
  CHAT_ONLY: "chat_only",
  CV_UPLOAD: "cv_upload",
  FREE_TEXT: "free_text",
  GUIDED_QUESTIONS: "guided_questions",
});

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function inferMetaStatus(value) {
  return hasMeaningfulValue(value)
    ? PROFILE_STATUS.UNCONFIRMED
    : PROFILE_STATUS.MISSING;
}

export function metaField(
  value = null,
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = inferMetaStatus(value)
) {
  return { value, source, status };
}

export function listField(
  items = [],
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = items.length ? PROFILE_STATUS.UNCONFIRMED : PROFILE_STATUS.MISSING
) {
  return { items, source, status };
}

function wrappedLabelEntry(
  label = null,
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    label: metaField(label, source, status),
  };
}

export function createLanguageEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    language: metaField(input?.language ?? null, source, status),
    level: metaField(input?.level ?? null, source, status),
  };
}

export function createEducationEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    title: metaField(input?.title ?? null, source, status),
    level: metaField(input?.level ?? null, source, status),
    institution: metaField(input?.institution ?? null, source, status),
    completionStatus: metaField(
      input?.completionStatus ?? input?.status ?? null,
      source,
      status
    ),
    startDate: metaField(input?.startDate ?? null, source, status),
    endDate: metaField(input?.endDate ?? null, source, status),
    notes: metaField(input?.notes ?? null, source, status),
  };
}

export function createCertificateEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    name: metaField(input?.name ?? input?.title ?? null, source, status),
    issuer: metaField(input?.issuer ?? null, source, status),
    issuedAt: metaField(input?.issuedAt ?? null, source, status),
    expiresAt: metaField(input?.expiresAt ?? null, source, status),
    notes: metaField(input?.notes ?? null, source, status),
  };
}

export function createExperienceRoleEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    title: metaField(input?.title ?? null, source, status),
    employer: metaField(input?.employer ?? null, source, status),
    sector: metaField(input?.sector ?? null, source, status),
    durationMonths: metaField(input?.durationMonths ?? null, source, status),
    workForm: metaField(input?.workForm ?? null, source, status),
    startDate: metaField(input?.startDate ?? null, source, status),
    endDate: metaField(input?.endDate ?? null, source, status),
    responsibilities: listField(input?.responsibilities || [], source, status),
    achievements: listField(input?.achievements || [], source, status),
  };
}

export function createGapEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    startDate: metaField(input?.startDate ?? null, source, status),
    endDate: metaField(input?.endDate ?? null, source, status),
    reason: metaField(input?.reason ?? null, source, status),
    notes: metaField(input?.notes ?? null, source, status),
  };
}

export function createDirectionEntry(
  input = {},
  source = PROFILE_SOURCES.SYSTEM_DERIVED,
  status = PROFILE_STATUS.UNCONFIRMED
) {
  return {
    title: metaField(input?.title ?? input?.label ?? null, source, status),
    type: metaField(input?.type ?? null, source, status), // job | education | pathway
    priority: metaField(input?.priority ?? input?.score ?? null, source, status),
    rationale: listField(input?.rationale || [], source, status),
    missingRequirements: listField(
      input?.missingRequirements || [],
      source,
      status
    ),
  };
}

export function createEmptyCareerProfile() {
  return {
    // System envelope fields. These are runtime/context fields, not evidence fields.
    version: CAREER_PROFILE_SCHEMA_VERSION,
    profileId: null,
    accountId: null,

    sourceMode: {
      activeModes: [SOURCE_MODES.CHAT_ONLY],
      cvUploaded: false,
      freeTextProvided: false,
      guidedQuestionsUsed: false,
      rawCvRetained: false,
    },

    identity: {
      displayName: metaField(null),
      ageGroup: metaField(null),
      minor: metaField(
        null,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.MISSING
      ),
      location: metaField(null),
      languages: listField([]),
    },

    contact: {
      preferredChannel: metaField(
        "chat",
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.CONFIRMED
      ),
      email: metaField(null),
      phone: metaField(null),
    },

    goals: {
      primaryGoal: metaField(null),
      urgency: metaField(null),
      incomePressure: metaField(null),
      willingnessToCompromise: metaField(null),
      preferredNextStep: metaField(null),
    },

    workStatus: {
      currentStatus: metaField(null),
      availability: metaField(null),
      workTimePreference: metaField(null),
      remotePreference: metaField(null),
      mobilityConstraints: listField([]),
      otherConstraints: listField([]),
      preferredWorkForms: listField([]),
    },

    education: {
      highestLevel: metaField(null),
      completed: listField([]),
      ongoing: listField([]),
      certificates: listField([]),
      additionalTraining: listField([]),
      learningReadiness: metaField(null),
      retrainingInterest: metaField(null),
    },

    experience: {
      roles: listField([]),
      sectors: listField([]),
      responsibilities: listField([]),
      employmentGaps: listField([]),
      volunteering: listField([]),
      informalExperience: listField([]),
    },

    skills: {
      domainSkills: listField([]),
      transferableSkills: listField([]),
      selfManagementSkills: listField([]),
      digitalSkills: listField([]),
      languageSkills: listField([]),
    },

    selfAnalysis: {
      strengths: listField([]),
      developmentNeeds: listField([]),
      interests: listField([]),
      values: listField([]),
      workPreferences: {
        pace: metaField(null),
        teamVsSolo: metaField(null),
        shiftWorkOk: metaField(null),
        remoteOk: metaField(null),
        travelOk: metaField(null),
      },
      dealBreakers: listField([]),
      competitiveAdvantages: listField([]),
    },

    careerReadiness: {
      careerClarity: metaField(null),
      careerConfidence: metaField(null),
      labourMarketKnowledge: metaField(null),
      lifelongLearningReadiness: metaField(null),
      socialSupportLevel: metaField(null),
    },

    supportNeed: {
      level: metaField(null),
      reasonTags: listField([]),
      recommendedMode: metaField(null),
    },

    directions: {
      immediateTargets: listField([]),
      nearTargets: listField([]),
      longTermTargets: listField([]),
      educationPaths: listField([]),
    },

    recommendationContext: {
      confidenceNotes: listField([]),
      missingInformation: listField([]),
      confirmedByUser: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
    },

    consent: {
      profileStorageApproved: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
      jobMatchingApproved: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
      documentGenerationApproved: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
      testingApproved: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
      minorGuardianConsent: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
      shareWithThirdPartiesApproved: metaField(
        false,
        PROFILE_SOURCES.SYSTEM_DERIVED,
        PROFILE_STATUS.UNCONFIRMED
      ),
    },
  };
}

export const CAREER_PROFILE_ENTRY_FACTORIES = Object.freeze({
  wrappedLabelEntry,
  createLanguageEntry,
  createEducationEntry,
  createCertificateEntry,
  createExperienceRoleEntry,
  createGapEntry,
  createDirectionEntry,
});
