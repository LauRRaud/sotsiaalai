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
import { getCareerQuestionText } from "../i18n/careerQuestionText.js";
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
  const localized = localeText.questions?.[question.id] || {};
  const nextQuestion = {
    ...question,
  };

  if (typeof localized.prompt === "string" && localized.prompt.trim()) {
    nextQuestion.prompt = localized.prompt;
  }

  if (Array.isArray(nextQuestion.options) && localized.options) {
    nextQuestion.options = nextQuestion.options.map((option) => {
      const localizedLabel =
        localized.options?.[option.value] || localized.options?.[option.label];

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
    prompt: "Kirjelda lühidalt, millega sa praegu karjääri või tööelu osas abi vajad.",
    required: true,
    priority: 10,
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
  }),
  question({
    id: "identity_display_name",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SHORT_TEXT,
    targetPath: "identity.displayName",
    prompt: "Kuidas soovid, et ma sind kõnetan?",
    priority: 20,
  }),
  question({
    id: "identity_age_group",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "identity.ageGroup",
    prompt: "Milline vanuserühm sind kõige paremini kirjeldab?",
    options: [
      { value: "under_18", label: "Alla 18" },
      { value: "18_24", label: "18–24" },
      { value: "25_34", label: "25–34" },
      { value: "35_49", label: "35–49" },
      { value: "50_plus", label: "50+" },
    ],
    priority: 30,
  }),
  question({
    id: "identity_location",
    state: CAREER_AGENT_STATES.INTAKE,
    group: "identity",
    type: QUESTION_TYPES.SHORT_TEXT,
    targetPath: "identity.location",
    prompt: "Millises linnas või piirkonnas sa eelistatult otsid tööd või õppimisvõimalusi?",
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
    prompt: "Kas nõustud, et sinu karjääriprofiili hoitakse, et nõustamist järjepidevalt jätkata?",
    required: true,
    priority: 10,
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
    prompt: "Kas nõustud, et sinu profiili kasutatakse töö- või suunasoovituste sobivuse hindamiseks?",
    priority: 20,
    when: (_profile, runtime) => runtime?.requiresJobMatching === true,
  }),
  question({
    id: "consent_document_generation",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.documentGenerationApproved",
    prompt: "Kas nõustud, et sinu infot kasutatakse dokumentide mustandite koostamiseks?",
    priority: 30,
    when: (_profile, runtime) => runtime?.requiresDocumentGeneration === true,
  }),
  question({
    id: "consent_testing",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.testingApproved",
    prompt: "Kas nõustud testimise või hindamislaadsete tegevustega, kui need osutuvad vajalikuks?",
    priority: 40,
    when: (_profile, runtime) => runtime?.requiresTesting === true,
  }),
  question({
    id: "consent_minor_guardian",
    state: CAREER_AGENT_STATES.AGREEMENTS,
    group: "agreements",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "consent.minorGuardianConsent",
    prompt: "Kas lapsevanema või eestkostja nõusolek testimiseks on olemas?",
    priority: 50,
    when: (profile, runtime) =>
      getMetaValue(profile?.identity?.minor) === true &&
      runtime?.requiresTesting === true,
  }),
];

const CONFIRM_PROFILE_QUESTIONS = [
  question({
    id: "confirm_profile_approved",
    state: CAREER_AGENT_STATES.CONFIRM_PROFILE,
    group: "confirm_profile",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "recommendationContext.confirmedByUser",
    prompt: "Kas see profiili kokkuvõte on õige ja piisavalt täpne, et saaksime edasi liikuda?",
    required: true,
    priority: 10,
    requiresAffirmative: true,
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
    prompt: "Millised on sinu peamised tugevused? Võid lisada mitu märksõna.",
    priority: 10,
  }),
  question({
    id: "self_interests",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.interests",
    prompt: "Millised teemad, valdkonnad või tegevused sind päriselt huvitavad?",
    priority: 20,
  }),
  question({
    id: "self_values",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.values",
    prompt: "Mis on sinu jaoks töös oluline? Näiteks stabiilsus, areng, tähendus, paindlikkus.",
    priority: 30,
  }),
  question({
    id: "self_development_needs",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.developmentNeeds",
    prompt: "Millistes oskustes või valdkondades tahaksid edasi areneda?",
    priority: 40,
  }),
  question({
    id: "self_deal_breakers",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.dealBreakers",
    prompt: "Millised töötingimused või rollid sinu jaoks kindlasti ei sobi?",
    priority: 50,
  }),
  question({
    id: "self_competitive_advantages",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "self_analysis",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "selfAnalysis.competitiveAdvantages",
    prompt: "Mis annab sulle teiste ees eelise? Näiteks kogemus, keeleoskus, võrgustik või isikuomadused.",
    priority: 60,
  }),
  question({
    id: "work_pref_pace",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "selfAnalysis.workPreferences.pace",
    prompt: "Milline töötempo sulle sobib?",
    priority: 70,
    options: [
      { value: "steady", label: "Pigem rahulik ja stabiilne" },
      { value: "varied", label: "Vahelduv" },
      { value: "fast", label: "Kiire ja tempokas" },
    ],
  }),
  question({
    id: "work_pref_team_vs_solo",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "selfAnalysis.workPreferences.teamVsSolo",
    prompt: "Kas eelistad pigem tiimitööd või iseseisvat tööd?",
    priority: 80,
    options: [
      { value: "team", label: "Pigem tiimitöö" },
      { value: "solo", label: "Pigem iseseisev töö" },
      { value: "mixed", label: "Mõlemad sobivad" },
    ],
  }),
  question({
    id: "work_pref_shift_work_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.shiftWorkOk",
    prompt: "Kas vahetustega töö sobib sulle?",
    priority: 90,
  }),
  question({
    id: "work_pref_remote_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.remoteOk",
    prompt: "Kas kaugtöö sobib sulle?",
    priority: 100,
  }),
  question({
    id: "work_pref_travel_ok",
    state: CAREER_AGENT_STATES.SELF_ANALYSIS,
    group: "work_preferences",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "selfAnalysis.workPreferences.travelOk",
    prompt: "Kas tööga seotud liikumine või sõitmine sobib sulle?",
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
    prompt: "Mis on sinu peamine praegune karjääriküsimus või takistus?",
    required: true,
    priority: 10,
    normalize: (value) => hasMeaningfulValue(trimToNull(value)),
  }),
  question({
    id: "work_current_status",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "workStatus.currentStatus",
    prompt: "Milline on sinu praegune töö- või õppeseis?",
    priority: 20,
    options: [
      { value: "employed", label: "Tööl" },
      { value: "unemployed", label: "Tööta" },
      { value: "studying", label: "Õpin" },
      { value: "changing_role", label: "Soovin töö- või karjäärimuutust" },
      { value: "returning_after_break", label: "Naasen pärast pausi" },
    ],
  }),
  question({
    id: "work_availability",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "workStatus.availability",
    prompt: "Kui kiiresti oled valmis järgmise sammu tegema?",
    priority: 30,
    options: [
      { value: "immediately", label: "Kohe" },
      { value: "within_month", label: "Järgmise kuu jooksul" },
      { value: "within_3_months", label: "1–3 kuu jooksul" },
      { value: "later", label: "Hiljem" },
    ],
  }),
  question({
    id: "work_mobility_constraints",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "workStatus.mobilityConstraints",
    prompt: "Kas sul on liikumise või asukoha piiranguid, millega peaks arvestama?",
    priority: 40,
  }),
  question({
    id: "work_other_constraints",
    state: CAREER_AGENT_STATES.CLARIFY_PROBLEM,
    group: "work_status",
    type: QUESTION_TYPES.MULTI_SELECT,
    valueKind: QUESTION_VALUE_KINDS.LIST,
    targetPath: "workStatus.otherConstraints",
    prompt: "Kas on veel piiranguid või tingimusi, mida peaksin soovitusi tehes arvesse võtma?",
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
    prompt: "Mis on sinu peamine eesmärk praegu?",
    required: true,
    priority: 10,
    options: [
      { value: GOAL_TYPES.GET_JOB, label: "Leida töö" },
      { value: GOAL_TYPES.CHANGE_CAREER, label: "Vahetada karjäärisuunda" },
      { value: GOAL_TYPES.CHOOSE_EDUCATION, label: "Leida sobiv õpitee" },
      { value: GOAL_TYPES.RESKILL, label: "Õppida uusi oskusi" },
      { value: GOAL_TYPES.GAIN_CLARITY, label: "Saada selgust" },
    ],
  }),
  question({
    id: "goal_preferred_next_step",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.preferredNextStep",
    prompt: "Milline järgmine samm tundub sulle kõige realistlikum või kasulikum?",
    required: true,
    priority: 20,
    options: [
      { value: NEXT_STEP_TYPES.APPLY_NOW, label: "Kandideerida kohe" },
      { value: NEXT_STEP_TYPES.COMPARE_OPTIONS, label: "Võrrelda võimalusi" },
      { value: NEXT_STEP_TYPES.BUILD_CV, label: "Koostada või uuendada CV-d" },
      { value: NEXT_STEP_TYPES.EXPLORE_LEARNING, label: "Uurida õpivõimalusi" },
      { value: NEXT_STEP_TYPES.PREPARE_INTERVIEW, label: "Valmistuda vestluseks" },
      { value: NEXT_STEP_TYPES.REQUEST_SUPPORT, label: "Vajan rohkem tuge enne otsust" },
    ],
  }),
  question({
    id: "goal_urgency",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.urgency",
    prompt: "Kui kiire see teema sinu jaoks praegu on?",
    priority: 30,
    options: [
      { value: "low", label: "Ei ole kiire" },
      { value: "medium", label: "Mõõdukalt kiire" },
      { value: "high", label: "Kiire" },
      { value: "urgent", label: "Väga kiire / pakiline" },
    ],
  }),
  question({
    id: "goal_income_pressure",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.incomePressure",
    prompt: "Kui tugev on sinu jaoks praegu sissetuleku surve?",
    priority: 40,
    options: [
      { value: "low", label: "Väike" },
      { value: "medium", label: "Keskmine" },
      { value: "high", label: "Suur" },
      { value: "very_high", label: "Väga suur" },
    ],
  }),
  question({
    id: "goal_willingness_to_compromise",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "goals",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "goals.willingnessToCompromise",
    prompt: "Kui valmis oled tegema ajutisi kompromisse, et liikuma saada?",
    priority: 50,
    options: [
      { value: "low", label: "Pigem ei soovi kompromisse" },
      { value: "medium", label: "Mõnes osas olen valmis" },
      { value: "high", label: "Olen üsna paindlik" },
    ],
  }),
  question({
    id: "education_learning_readiness",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "education",
    type: QUESTION_TYPES.SINGLE_SELECT,
    targetPath: "education.learningReadiness",
    prompt: "Kui valmis oled praegu õppima või täiendama oma oskusi?",
    priority: 60,
    options: [
      { value: "low", label: "Praegu mitte eriti" },
      { value: "medium", label: "Mõõdukalt valmis" },
      { value: "high", label: "Väga valmis" },
    ],
  }),
  question({
    id: "education_retraining_interest",
    state: CAREER_AGENT_STATES.SET_GOALS,
    group: "education",
    type: QUESTION_TYPES.BOOLEAN,
    targetPath: "education.retrainingInterest",
    prompt: "Kas oled avatud ümberõppele või uue valdkonna õppimisele?",
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
    runtimeKey: "directionsShortlisted",
    prompt: "Millised ametid, rollid või valdkonnad tunduvad sulle praegu kõige realistlikumad või huvitavamad?",
    priority: 10,
    normalize: (value) => normalizeStringList(value).length > 0,
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
    prompt: "Millist suunda või võimalust soovid kõigepealt lähemalt võrrelda?",
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
    prompt: "Kas oled valmis kokku leppima vähemalt ühe konkreetse järgmise sammu?",
    priority: 10,
    requiresAffirmative: true,
    normalize: (value) => normalizeBoolean(value) === true,
  }),
];

export const CAREER_QUESTION_BANK = Object.freeze({
  [CAREER_AGENT_STATES.INTAKE]: INTAKE_QUESTIONS,
  [CAREER_AGENT_STATES.CONTACT]: CONTACT_QUESTIONS,
  [CAREER_AGENT_STATES.AGREEMENTS]: AGREEMENT_QUESTIONS,
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
