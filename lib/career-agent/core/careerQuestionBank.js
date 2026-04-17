// /lib/career-agent/core/careerQuestionBank.js

import {
  getMetaValue,
  getListItems,
  getListStatus,
  getValueAtPath,
  isMetaField,
  isListField,
  hasMeaningfulValue,
  inferMetaStatus,
  inferListStatus,
} from "../profile/careerProfile.helpers.js";
import { getCareerQuestionText } from "../careerText.js";
import {
  PROFILE_SOURCES,
  PROFILE_STATUS,
  GOAL_TYPES,
  NEXT_STEP_TYPES,
} from "../profile/careerProfile.schema.js";
import { CAREER_AGENT_STATES } from "./careerStateMachine.js";

export const CAREER_QUESTION_BANK_VERSION = "1.0.0";

export const QUESTION_TYPES = Object.freeze({
  SHORT_TEXT: "short_text",
  LONG_TEXT: "long_text",
  SINGLE_SELECT: "single_select",
  MULTI_SELECT: "multi_select",
  BOOLEAN: "boolean",
});

export const QUESTION_VALUE_KINDS = Object.freeze({
  META: "meta",
  LIST: "list",
  RUNTIME_ONLY: "runtime_only",
});

function question(definition) {
  return Object.freeze({
    required: false,
    priority: 50,
    valueKind: QUESTION_VALUE_KINDS.META,
    requiresAffirmative: false,
    ...definition,
  });
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function trimToNull(value) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function hasDirectionSignals(profile) {
  return (
    getListItems(profile?.directions?.immediateTargets, []).length > 0 ||
    getListItems(profile?.directions?.nearTargets, []).length > 0 ||
    getListItems(profile?.directions?.educationPaths, []).length > 0
  );
}

function buildNestedPatch(path, leafValue) {
  const parts = String(path)
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return {};

  const root = {};
  let current = root;

  for (let i = 0; i < parts.length - 1; i += 1) {
    current[parts[i]] = {};
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = leafValue;
  return root;
}

function getQuestionRuntimeValue(question, runtime = {}) {
  if (!question.runtimeKey) return undefined;
  return runtime?.[question.runtimeKey];
}

function isQuestionConditionMet(question, profile, runtime = {}) {
  if (typeof question.when !== "function") return true;
  return question.when(profile, runtime);
}

function readQuestionTargetValue(question, profile, runtime = {}) {
  if (question.valueKind === QUESTION_VALUE_KINDS.RUNTIME_ONLY) {
    return getQuestionRuntimeValue(question, runtime);
  }

  if (!question.targetPath) return undefined;
  return getValueAtPath(profile, question.targetPath);
}

function getQuestionLocaleText(locale = "et") {
  return getCareerQuestionText(locale);
}

function localizeQuestion(question, locale = "et") {
  const localeText = getQuestionLocaleText(locale);
  const fallbackText = getQuestionLocaleText("et");
  const fallback = fallbackText.questions?.[question.id] || {};
  const localized = localeText.questions?.[question.id] || fallback;
  const nextQuestion = {
    ...question,
  };

  const localizedPrompt =
    (typeof localized.prompt === "string" && localized.prompt.trim() && localized.prompt) ||
    (typeof fallback.prompt === "string" && fallback.prompt.trim() && fallback.prompt) ||
    null;

  if (localizedPrompt) {
    nextQuestion.prompt = localizedPrompt;
  }

  const localizedOptions = localized.options || fallback.options;

  if (Array.isArray(nextQuestion.options) && localizedOptions) {
    nextQuestion.options = nextQuestion.options.map((option) => {
      const localizedLabel =
        localizedOptions?.[option.value] || localizedOptions?.[option.label];

      if (!localizedLabel) {
        return option;
      }

      return {
        ...option,
        label: localizedLabel,
      };
    });
  }

  return nextQuestion;
}

export function isQuestionAnswered(question, profile, runtime = {}) {
  if (typeof question.isAnswered === "function") {
    return question.isAnswered(profile, runtime);
  }

  const targetValue = readQuestionTargetValue(question, profile, runtime);

  if (question.valueKind === QUESTION_VALUE_KINDS.RUNTIME_ONLY) {
    if (question.requiresAffirmative) {
      return targetValue === true;
    }
    if (typeof targetValue === "boolean") {
      return targetValue === true;
    }
    return hasMeaningfulValue(targetValue);
  }

  if (isMetaField(targetValue)) {
    const status = getValueAtPath(targetValue, "status");
    const value = getValueAtPath(targetValue, "value");

    if (question.requiresAffirmative) {
      return status === PROFILE_STATUS.CONFIRMED && value === true;
    }

    return status === PROFILE_STATUS.CONFIRMED && hasMeaningfulValue(value);
  }

  if (isListField(targetValue)) {
    return (
      getListStatus(targetValue) === PROFILE_STATUS.CONFIRMED &&
      getListItems(targetValue, []).length > 0
    );
  }

  return hasMeaningfulValue(targetValue);
}

function normalizeAnswerByQuestion(question, rawAnswer) {
  if (typeof question.normalize === "function") {
    return question.normalize(rawAnswer);
  }

  switch (question.valueKind) {
    case QUESTION_VALUE_KINDS.LIST:
      return normalizeStringList(rawAnswer);

    case QUESTION_VALUE_KINDS.META:
      if (question.type === QUESTION_TYPES.BOOLEAN) {
        return normalizeBoolean(rawAnswer);
      }
      return trimToNull(rawAnswer);

    case QUESTION_VALUE_KINDS.RUNTIME_ONLY:
      return rawAnswer;

    default:
      return rawAnswer;
  }
}

export function createQuestionAnswerPatch(question, rawAnswer, options = {}) {
  const {
    source = PROFILE_SOURCES.FROM_USER,
    confirmed = true,
  } = options;

  if (question.valueKind === QUESTION_VALUE_KINDS.RUNTIME_ONLY || !question.targetPath) {
    return null;
  }

  const normalized = normalizeAnswerByQuestion(question, rawAnswer);

  if (question.valueKind === QUESTION_VALUE_KINDS.META) {
    return buildNestedPatch(question.targetPath, {
      value: normalized,
      source,
      status: confirmed ? PROFILE_STATUS.CONFIRMED : inferMetaStatus(normalized),
    });
  }

  if (question.valueKind === QUESTION_VALUE_KINDS.LIST) {
    const items = Array.isArray(normalized) ? normalized : [];
    return buildNestedPatch(question.targetPath, {
      items,
      source,
      status: confirmed ? PROFILE_STATUS.CONFIRMED : inferListStatus(items),
    });
  }

  return null;
}

export function createQuestionRuntimeAnswer(question, rawAnswer) {
  const normalized = normalizeAnswerByQuestion(question, rawAnswer);

  if (typeof question.createRuntimeAnswer === "function") {
    return question.createRuntimeAnswer(normalized, rawAnswer);
  }

  if (question.valueKind !== QUESTION_VALUE_KINDS.RUNTIME_ONLY || !question.runtimeKey) {
    return null;
  }

  return {
    [question.runtimeKey]: normalized,
  };
}

const INTAKE_QUESTIONS = [
  question({
    id: "intake_reason",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "intake",
    type: QUESTION_TYPES.LONG_TEXT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "userMessageProvided",
    required: true,
    priority: 10,
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
    createRuntimeAnswer: (answer, rawAnswer) => {
      const text = trimToNull(rawAnswer);
      const provided = answer === true;
      return {
        userMessageProvided: provided,
        intakeReasonProvided: provided,
        intakeReasonText: text,
        latestUserText: text,
        lastUserMessage: text,
        userMessage: text,
      };
    },
  }),
  question({
    id: "identity_display_name",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SHORT_TEXT,
    targetPath: "identity.displayName",
    priority: 20,
  }),
  question({
    id: "identity_age_group",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "identity.ageGroup",
    options: [
      { value: "under_18" },
      { value: "18_24" },
      { value: "25_34" },
      { value: "35_49" },
      { value: "50_plus" },
    ],
    priority: 30,
  }),
  question({
    id: "identity_location",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SHORT_TEXT,
    targetPath: "identity.location",
    priority: 40,
  }),
];

const CONTACT_QUESTIONS = [];

const AGREEMENT_QUESTIONS = [
  question({
    id: "consent_profile_storage",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.profileStorageApproved",
    required: true,
    priority: 10,
    when: (_profile, runtime) => runtime?.requiresProfileStorage === true,
    createRuntimeAnswer: (answer) => ({
      agreementsAccepted: answer === true,
    }),
  }),
  question({
    id: "consent_job_matching",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.jobMatchingApproved",
    priority: 20,
    when: (_profile, runtime) => runtime?.requiresJobMatching === true,
  }),
  question({
    id: "consent_document_generation",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.documentGenerationApproved",
    priority: 30,
    when: (_profile, runtime) => runtime?.requiresDocumentGeneration === true,
  }),
  question({
    id: "consent_testing",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.testingApproved",
    priority: 40,
    when: (_profile, runtime) => runtime?.requiresTesting === true,
  }),
  question({
    id: "consent_minor_guardian",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.minorGuardianConsent",
    priority: 50,
    when: (profile, runtime) =>
      getMetaValue(profile?.identity?.minor) === true &&
      runtime?.requiresTesting === true,
  }),
];

const PARSE_PROFILE_QUESTIONS = [
  question({
    id: "profile_background_correction",
    state: CAREER_AGENT_STATES.PARSE_PROFILE,
    group: "profile",
    type: QUESTION_TYPES.LONG_TEXT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "profileCorrectionProvided",
    required: true,
    priority: 5,
    when: (_profile, runtime) => runtime?.profileCorrectionPending === true,
    isAnswered: (_profile, runtime) => runtime?.profileCorrectionProvided === true,
    normalize: (value) => trimToNull(value),
    createRuntimeAnswer: (_answer, rawAnswer) => {
      const text = trimToNull(rawAnswer);
      const provided = hasMeaningfulValue(text);
      return {
        profileParsed: provided,
        profileCorrectionPending: false,
        profileCorrectionProvided: provided,
        freeTextProvided: provided,
        userMessageProvided: provided,
        latestUserText: text,
        lastUserMessage: text,
        userMessage: text,
      };
    },
  }),
  question({
    id: "profile_cv_available",
    state: CAREER_AGENT_STATES.PARSE_PROFILE,
    group: "profile",
    type: QUESTION_TYPES.BOOLEAN,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "profileCvChecked",
    required: true,
    priority: 10,
    when: (profile, runtime) =>
      runtime?.profileCorrectionPending !== true &&
      profile?.sourceMode?.cvUploaded !== true &&
      runtime?.profileCvChecked !== true,
    isAnswered: (profile, runtime) =>
      profile?.sourceMode?.cvUploaded === true ||
      runtime?.profileCvChecked === true,
    normalize: (value) => normalizeBoolean(value),
    createRuntimeAnswer: (answer) => ({
      profileCvChecked: answer !== null,
      profileCvAvailable: answer === true,
    }),
  }),
  question({
    id: "profile_background_summary",
    state: CAREER_AGENT_STATES.PARSE_PROFILE,
    group: "profile",
    type: QUESTION_TYPES.LONG_TEXT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "profileParsed",
    required: true,
    priority: 20,
    when: (profile, runtime) =>
      runtime?.profileCorrectionPending !== true &&
      (profile?.sourceMode?.cvUploaded === true ||
        runtime?.profileCvChecked === true),
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
    createRuntimeAnswer: (answer, rawAnswer) => {
      const text = trimToNull(rawAnswer);
      const parsed = answer === true;
      return {
        profileParsed: parsed,
        profileBackgroundProvided: parsed,
        profileBackgroundText: text,
        freeTextProvided: parsed,
        userMessageProvided: parsed,
        latestUserText: text,
        lastUserMessage: text,
        userMessage: text,
      };
    },
  }),
];

const CONFIRM_PROFILE_QUESTIONS = [
  question({
    id: "confirm_profile_approved",
    state: CAREER_AGENT_STATES.CONFIRM_PROFILE,
    group: "confirm_profile",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "recommendationContext.confirmedByUser",
    required: true,
    priority: 10,
    requiresAffirmative: true,
    createRuntimeAnswer: (answer) => {
      if (answer === true) {
        return {
          profileConfirmed: true,
          profileCorrectionPending: false,
          profileCorrectionProvided: false,
        };
      }

      if (answer === false) {
        return {
          profileConfirmed: false,
          profileParsed: false,
          profileCorrectionPending: true,
          profileCorrectionProvided: false,
          currentState: CAREER_AGENT_STATES.PARSE_PROFILE,
        };
      }

      return null;
    },
  }),
];

const SELF_ANALYSIS_QUESTIONS = [
  question({
    id: "self_strengths",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.strengths",
    priority: 10,
  }),
  question({
    id: "self_interests",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.interests",
    priority: 20,
  }),
  question({
    id: "self_values",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.values",
    priority: 30,
  }),
  question({
    id: "self_development_needs",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.developmentNeeds",
    priority: 40,
  }),
  question({
    id: "self_deal_breakers",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.dealBreakers",
    priority: 50,
  }),
  question({
    id: "self_competitive_advantages",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.competitiveAdvantages",
    priority: 60,
  }),
  question({
    id: "work_pref_pace",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "selfAnalysis.workPreferences.pace",
    priority: 70,
    options: [
      { value: "steady" },
      { value: "varied" },
      { value: "fast" },
    ],
  }),
  question({
    id: "work_pref_team_vs_solo",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "selfAnalysis.workPreferences.teamVsSolo",
    priority: 80,
    options: [
      { value: "team" },
      { value: "solo" },
      { value: "mixed" },
    ],
  }),
  question({
    id: "work_pref_shift_work_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.shiftWorkOk",
    priority: 90,
  }),
  question({
    id: "work_pref_remote_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.remoteOk",
    priority: 100,
  }),
  question({
    id: "work_pref_travel_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.travelOk",
    priority: 110,
  }),
];

const CLARIFY_PROBLEM_QUESTIONS = [
  question({
    id: "clarify_problem_statement",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "clarify_problem",
    type: QUESTION_TYPES.LONG_TEXT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "problemClarified",
    required: true,
    priority: 10,
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
    createRuntimeAnswer: (answer, rawAnswer) => {
      const text = trimToNull(rawAnswer);
      const clarified = answer === true;
      return {
        problemClarified: clarified,
        problemStatementText: text,
        latestUserText: text,
        lastUserMessage: text,
        userMessage: text,
      };
    },
  }),
  question({
    id: "work_current_status",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "workStatus.currentStatus",
    priority: 20,
    options: [
      { value: "employed" },
      { value: "unemployed" },
      { value: "studying" },
      { value: "changing_role" },
      { value: "returning_after_break" },
    ],
  }),
  question({
    id: "work_availability",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "workStatus.availability",
    priority: 30,
    options: [
      { value: "immediately" },
      { value: "within_month" },
      { value: "within_3_months" },
      { value: "later" },
    ],
  }),
  question({
    id: "work_mobility_constraints",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "workStatus.mobilityConstraints",
    priority: 40,
  }),
  question({
    id: "work_other_constraints",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "workStatus.otherConstraints",
    priority: 50,
  }),
];

const GOAL_QUESTIONS = [
  question({
    id: "goal_primary",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.primaryGoal",
    required: true,
    priority: 10,
    options: [
      { value: GOAL_TYPES.GET_JOB },
      { value: GOAL_TYPES.CHANGE_CAREER },
      { value: GOAL_TYPES.CHOOSE_EDUCATION },
      { value: GOAL_TYPES.RESKILL },
      { value: GOAL_TYPES.GAIN_CLARITY },
    ],
  }),
  question({
    id: "goal_preferred_next_step",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.preferredNextStep",
    required: true,
    priority: 20,
    options: [
      { value: NEXT_STEP_TYPES.APPLY_NOW },
      { value: NEXT_STEP_TYPES.COMPARE_OPTIONS },
      { value: NEXT_STEP_TYPES.BUILD_CV },
      { value: NEXT_STEP_TYPES.EXPLORE_LEARNING },
      { value: NEXT_STEP_TYPES.PREPARE_INTERVIEW },
      { value: NEXT_STEP_TYPES.REQUEST_SUPPORT },
    ],
  }),
  question({
    id: "goal_urgency",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.urgency",
    priority: 30,
    options: [
      { value: "low" },
      { value: "medium" },
      { value: "high" },
      { value: "urgent" },
    ],
  }),
  question({
    id: "goal_income_pressure",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.incomePressure",
    priority: 40,
    options: [
      { value: "low" },
      { value: "medium" },
      { value: "high" },
      { value: "very_high" },
    ],
  }),
  question({
    id: "goal_willingness_to_compromise",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.willingnessToCompromise",
    priority: 50,
    options: [
      { value: "low" },
      { value: "medium" },
      { value: "high" },
    ],
  }),
  question({
    id: "education_learning_readiness",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "education",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "education.learningReadiness",
    priority: 60,
    options: [
      { value: "low" },
      { value: "medium" },
      { value: "high" },
    ],
  }),
  question({
    id: "education_retraining_interest",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "education",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "education.retrainingInterest",
    priority: 70,
  }),
];

const SHORTLIST_DIRECTION_QUESTIONS = [
  question({
    id: "direction_seed_roles",
    state: CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS,
    group: "directions",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "directionSeedRoles",
    priority: 10,
    when: (profile) => !hasDirectionSignals(profile),
    isAnswered: (profile, runtime) =>
      hasDirectionSignals(profile) || Array.isArray(runtime?.directionSeedRoles),
    normalize: (value) => normalizeStringList(value),
    createRuntimeAnswer: (answer) => {
      const roles = Array.isArray(answer) ? answer : [];
      return {
        directionSeedRoles: roles,
        directionsShortlisted: roles.length > 0,
        shortlistPresented: false,
      };
    },
  }),
];

const ANALYZE_OPTION_QUESTIONS = [
  question({
    id: "analyze_option_focus",
    state: CAREER_AGENT_STATES.ANALYZE_OPTIONS,
    group: "analyze_options",
    type: QUESTION_TYPES.LONG_TEXT,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "optionsAnalyzed",
    priority: 10,
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
  }),
];

const ACTION_PLAN_QUESTIONS = [
  question({
    id: "action_plan_readiness",
    state: CAREER_AGENT_STATES.ACTION_PLAN,
    group: "action_plan",
    type: QUESTION_TYPES.BOOLEAN,
    valueKind: QUESTION_VALUE_KINDS.RUNTIME_ONLY,
    runtimeKey: "actionPlanBuilt",
    priority: 10,
    requiresAffirmative: true,
    normalize: (value) => normalizeBoolean(value) === true,
  }),
];

export const CAREER_QUESTION_BANK = Object.freeze({
  [CAREER_AGENT_STATES.INTAKE]: INTAKE_QUESTIONS,
  [CAREER_AGENT_STATES.CONTACT]: CONTACT_QUESTIONS,
  [CAREER_AGENT_STATES.AGREEMENTS]: AGREEMENT_QUESTIONS,
  [CAREER_AGENT_STATES.PARSE_PROFILE]: PARSE_PROFILE_QUESTIONS,
  [CAREER_AGENT_STATES.CONFIRM_PROFILE]: CONFIRM_PROFILE_QUESTIONS,
  [CAREER_AGENT_STATES.SELF_ANALYSIS]: SELF_ANALYSIS_QUESTIONS,
  [CAREER_AGENT_STATES.CLARIFY_PROBLEM]: CLARIFY_PROBLEM_QUESTIONS,
  [CAREER_AGENT_STATES.SET_GOALS]: GOAL_QUESTIONS,
  [CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS]: SHORTLIST_DIRECTION_QUESTIONS,
  [CAREER_AGENT_STATES.ANALYZE_OPTIONS]: ANALYZE_OPTION_QUESTIONS,
  [CAREER_AGENT_STATES.ACTION_PLAN]: ACTION_PLAN_QUESTIONS,
});

export function getQuestionById(questionId) {
  for (const questions of Object.values(CAREER_QUESTION_BANK)) {
    const match = questions.find((item) => item.id === questionId);
    if (match) return match;
  }
  return null;
}

export function getQuestionsForState(state, profile, runtime = {}, options = {}) {
  const {
    includeAnswered = false,
    limit = 6,
  } = options;
  const locale =
    options.locale || options.documentLanguage || options.language || "et";

  const questions = toSafeArray(CAREER_QUESTION_BANK[state])
    .filter((item) => isQuestionConditionMet(item, profile, runtime))
    .filter((item) => includeAnswered || !isQuestionAnswered(item, profile, runtime))
    .sort((a, b) => a.priority - b.priority);

  return questions.slice(0, limit).map((item) => localizeQuestion(item, locale));
}

export function getRequiredQuestionsForState(state, profile, runtime = {}) {
  return getQuestionsForState(state, profile, runtime, { includeAnswered: false, limit: 50 })
    .filter((item) => item.required);
}

export function getUnansweredQuestionIdsForState(state, profile, runtime = {}) {
  return getQuestionsForState(state, profile, runtime, { includeAnswered: false, limit: 50 })
    .map((item) => item.id);
}

export function shouldAskAnyQuestionsForState(state, profile, runtime = {}) {
  return getQuestionsForState(state, profile, runtime, { includeAnswered: false, limit: 1 }).length > 0;
}
