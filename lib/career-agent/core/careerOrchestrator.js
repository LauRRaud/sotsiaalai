// /lib/career-agent/core/careerOrchestrator.js

import {
  normalizeCareerProfile,
  mergeProfilePatch,
  applyComputedSupportNeed,
  summarizeProfileForConfirmation,
  getMetaValue,
  getListItems,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import {
  CAREER_AGENT_STATES,
  getRecommendedEntryState,
  determineNextState,
  getWorkflowFocus,
  isStateSatisfied,
  buildStateContext,
} from "./careerStateMachine.js";
import {
  getQuestionById,
  getQuestionsForState,
  createQuestionAnswerPatch,
  createQuestionRuntimeAnswer,
} from "./careerQuestionBank.js";
import { buildCareerActionPlan } from "./careerActionPlan.js";
import { rankCareerOpportunities } from "./careerMatchingEngine.js";
import {
  buildStateIntroResponse,
  buildQuestionSetResponse,
  buildProfileConfirmationResponse,
  buildDirectionShortlistResponse,
  buildOptionAnalysisResponse,
  buildActionPlanResponse,
  buildSummaryResponse,
  buildDocumentFlowTransitionResponse,
  buildDocumentQuestionsResponse,
  buildConsentBlockedResponse,
  buildHandoffResponse,
} from "./careerResponseTemplates.js";
import { resolveDocumentStep } from "../documents/careerDocumentIntegration.js";
import { generateCareerDocument } from "../documents/careerDocumentGenerator.js";
import {
  rankCareerOpportunitiesWithOska,
  enrichDirectionsWithOska,
} from "../taxonomy/careerOskaMatchingBridge.js";
import { resolveCareerECounsellingMode } from "../ethics/careerECounsellingMode.js";
import {
  canUseCareerProfileForJobMatching,
  canGenerateCareerDocuments,
} from "../ethics/careerPrivacyRules.js";
import { getCareerOrchestratorText } from "../careerText.js";

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
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

const GENERIC_CAREER_ACTIVATION_MESSAGES = new Set([
  "karjäärinõustamine",
  "karjäärinoustamine",
  "soovin karjäärinõustamist",
  "soovin karjäärinoustamist",
  "vajan karjäärinõustamist",
  "vajan karjäärinoustamist",
  "career guidance",
  "career counselling",
  "career counseling",
]);

function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function mergeRuntimePatch(runtime = {}, patch = {}) {
  return {
    ...runtime,
    ...patch,
  };
}

function getLatestDraftText(runtime = {}) {
  return (
    coerceString(runtime.latestUserText) ||
    coerceString(runtime.lastUserMessage) ||
    coerceString(runtime.userMessage) ||
    null
  );
}

function normalizeIntentText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[!?.,:;"'`()\[\]{}]/g, " ")
    .replace(/\s+/g, " ");
}

function hasInformativeCareerUserMessage(value) {
  const normalized = normalizeIntentText(value);
  if (!normalized) return false;
  return !GENERIC_CAREER_ACTIVATION_MESSAGES.has(normalized);
}

function buildRuntimeIntentFlags(
  runtime = {},
  opportunities = [],
  documentFlow = null,
  generateDocumentNow = false,
  documentInput = {}
) {
  const userText =
    coerceString(runtime.userMessage) ||
    coerceString(runtime.lastUserMessage) ||
    coerceString(runtime.latestUserText) ||
    coerceString(runtime.freeText);

  const hasDocumentInput =
    documentInput &&
    typeof documentInput === "object" &&
    Object.keys(documentInput).length > 0;

  return {
    userMessageProvided:
      runtime.userMessageProvided === true ||
      hasInformativeCareerUserMessage(userText),
    requiresProfileStorage:
      runtime.requiresProfileStorage === true ||
      runtime.persistentProfileRequested === true ||
      runtime.storeProfileRequested === true,
    persistentProfileRequested:
      runtime.persistentProfileRequested === true ||
      runtime.requiresProfileStorage === true,
    storeProfileRequested:
      runtime.storeProfileRequested === true ||
      runtime.requiresProfileStorage === true,
    requiresJobMatching:
      runtime.requiresJobMatching === true ||
      toSafeArray(opportunities).length > 0,
    jobMatchingRequested:
      runtime.jobMatchingRequested === true ||
      toSafeArray(opportunities).length > 0,
    requiresDocumentGeneration:
      runtime.requiresDocumentGeneration === true ||
      Boolean(documentFlow) ||
      generateDocumentNow === true ||
      hasDocumentInput,
    documentFlowRequested:
      runtime.documentFlowRequested === true || Boolean(documentFlow),
    documentGenerationRequested:
      runtime.documentGenerationRequested === true ||
      generateDocumentNow === true ||
      hasDocumentInput,
  };
}

function getResponseLocale(source = {}) {
  return (
    source.locale ||
    source.documentLanguage ||
    source.language ||
    "et"
  );
}

function getOrchestratorLocaleText(source = {}) {
  return getCareerOrchestratorText(getResponseLocale(source));
}

const MAX_AUTO_ADVANCE_DEPTH = 8;

const AUTO_ADVANCE_PASSIVE_STATES = new Set([
  CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK,
  CAREER_AGENT_STATES.CONTACT,
  CAREER_AGENT_STATES.AGREEMENTS,
  CAREER_AGENT_STATES.PARSE_PROFILE,
]);

function resolveEffectiveCurrentState(profile, runtime = {}) {
  let state =
    runtime.currentState || getRecommendedEntryState(profile, runtime);

  let guard = 0;
  while (
    AUTO_ADVANCE_PASSIVE_STATES.has(state) &&
    isStateSatisfied(state, profile, runtime) &&
    guard < 8
  ) {
    const nextState = determineNextState(state, profile, runtime);
    if (!nextState || nextState === state) {
      break;
    }
    state = nextState;
    guard += 1;
  }

  return state;
}

function addSourceModeFlag(profile, mode) {
  const nextProfile = deepClone(profile);
  const currentModes = toSafeArray(nextProfile?.sourceMode?.activeModes);

  nextProfile.sourceMode = {
    ...(nextProfile.sourceMode || {}),
    activeModes: uniqueStrings([...currentModes, mode]),
  };

  return nextProfile;
}

function markGuidedQuestionUsed(profile) {
  const nextProfile = addSourceModeFlag(profile, "guided_questions");
  nextProfile.sourceMode = {
    ...(nextProfile.sourceMode || {}),
    guidedQuestionsUsed: true,
  };
  return nextProfile;
}

function getDirectionTitleValue(item) {
  if (typeof item === "string") return item;

  const title = getMetaValue(item?.title);
  if (hasMeaningfulValue(title)) return title;
  if (hasMeaningfulValue(item?.title)) return item.title;

  const label = getMetaValue(item?.label);
  if (hasMeaningfulValue(label)) return label;

  if (hasMeaningfulValue(item?.label)) return item.label;

  return null;
}

function getDirectionTypeValue(item) {
  return getMetaValue(item?.type) || item?.type || null;
}

function getDirectionPriorityValue(item) {
  const rawValue = getMetaValue(item?.priority) ?? item?.priority;
  const value = Number(rawValue);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function getDirectionRationale(item) {
  if (Array.isArray(item?.rationale)) return item.rationale;
  return getListItems(item?.rationale, []);
}

function getDirectionMissingRequirements(item) {
  if (Array.isArray(item?.missingRequirements)) return item.missingRequirements;
  return getListItems(item?.missingRequirements, []);
}

function coerceDirectionItem(item, oska = null, options = {}) {
  const text = getOrchestratorLocaleText(options);
  const title = getDirectionTitleValue(item);
  const type = getDirectionTypeValue(item);

  const rationale = [
    ...toSafeArray(getDirectionRationale(item)),
    ...(oska?.occupation?.label
      ? [`${text.direction.oskaOccupationPrefix}: ${oska.occupation.label}`]
      : []),
    ...(oska?.field?.label
      ? [`${text.direction.oskaFieldPrefix}: ${oska.field.label}`]
      : []),
  ];

  return {
    title: title || text.direction.possibleDirectionFallback,
    type,
    priority: getDirectionPriorityValue(item),
    rationale: uniqueStrings(rationale),
    missingRequirements: uniqueStrings(getDirectionMissingRequirements(item)),
    oska: oska || null,
  };
}

function buildDerivedOpportunityFromDirection(item = {}) {
  const title = coerceString(item?.title);
  if (!title) return null;

  const occupation = item?.oska?.occupation || null;
  const field = item?.oska?.field || null;

  return {
    id: `direction:${title.toLowerCase()}`,
    title,
    type: item?.type || "job",
    directionPriority: Number(item?.priority) || 0,
    directionRationale: uniqueStrings(toSafeArray(item?.rationale)).slice(0, 2),
    sector:
      coerceString(field?.label) ||
      coerceString(occupation?.fieldLabels?.[0]) ||
      null,
    description: uniqueStrings(toSafeArray(item?.rationale)).slice(0, 2).join(" "),
    roleKeywords: uniqueStrings([
      title,
      coerceString(occupation?.label),
      ...toSafeArray(occupation?.aliases),
    ]),
    preferredSkills: uniqueStrings([
      ...toSafeArray(occupation?.skillLabels),
      ...toSafeArray(occupation?.knowledgeAreas),
    ]).slice(0, 10),
    preferredEducationAreas: uniqueStrings([
      coerceString(field?.label),
      ...toSafeArray(occupation?.fieldLabels),
    ]),
    requiredEducationLevels: uniqueStrings(
      toSafeArray(occupation?.educationLevels)
    ),
    oska: item?.oska || null,
  };
}

function buildDerivedOpportunitiesFromDirections(directionItems = []) {
  return toSafeArray(directionItems)
    .map((item) => buildDerivedOpportunityFromDirection(item))
    .filter(Boolean);
}

function applyDirectionOpportunitySignals(rankedOpportunities = []) {
  const safeRanked = toSafeArray(rankedOpportunities);
  const maxPriority = safeRanked.reduce(
    (highest, item) =>
      Math.max(highest, Number(item?.opportunity?.directionPriority) || 0),
    0
  );

  return safeRanked
    .map((item) => {
      const priority = Number(item?.opportunity?.directionPriority) || 0;
      const normalizedPriority =
        maxPriority > 0 ? priority / maxPriority : 0;
      const blendedScore =
        (Number(item?.score) || 0) * 0.72 + normalizedPriority * 0.28;

      return {
        ...item,
        score: Number(Math.min(1, blendedScore).toFixed(3)),
        whyItFits: uniqueStrings([
          ...toSafeArray(item?.opportunity?.directionRationale),
          ...toSafeArray(item?.whyItFits),
        ]),
      };
    })
    .sort((left, right) => (right.score || 0) - (left.score || 0));
}

function getTopDirectionTitle(profile, rankedOpportunities = [], directionItems = []) {
  const topOpportunityTitle = rankedOpportunities?.[0]?.opportunity?.title;
  if (topOpportunityTitle) return topOpportunityTitle;

  const fromDirections =
    toSafeArray(directionItems)
      .map((item) => item?.title || getDirectionTitleValue(item))
      .find((value) => hasMeaningfulValue(value)) || null;

  if (fromDirections) return fromDirections;

  return (
    getListItems(profile?.directions?.immediateTargets, [])
      .map((item) => getDirectionTitleValue(item))
      .find((value) => hasMeaningfulValue(value)) || null
  );
}

function getTopRecommendationReason(rankedOpportunities = [], directionItems = []) {
  const topOpportunityReason =
    toSafeArray(rankedOpportunities?.[0]?.whyItFits).find((value) =>
      hasMeaningfulValue(value)
    ) || null;

  if (topOpportunityReason) return topOpportunityReason;

  const topDirectionReason =
    toSafeArray(directionItems)
      .flatMap((item) => toSafeArray(item?.rationale))
      .find((value) => hasMeaningfulValue(value)) || null;

  return topDirectionReason;
}

function buildSummaryPayload(profileSummary, modeDecision, rankedOpportunities, actionPlan, directionItems) {
  const recommendation =
    getTopDirectionTitle(
      { directions: {} },
      rankedOpportunities,
      directionItems
    ) || null;

  return {
    goal: profileSummary?.goals?.primaryGoal || null,
    recommendation,
    recommendationReason: getTopRecommendationReason(
      rankedOpportunities,
      directionItems
    ),
    mainDirection: recommendation,
    firstStep: actionPlan?.summary?.firstStepTitle || null,
    supportMode: modeDecision?.modeLabel || null,
  };
}

function shouldRequireJobMatchingConsent(options = {}) {
  if (options.requireJobMatchingConsent === false) return false;
  if (options.requireJobMatchingConsent === true) return true;
  return toSafeArray(options.opportunities).length > 0;
}

async function resolveRankedOpportunities(profile, opportunities = [], options = {}) {
  const text = getOrchestratorLocaleText(options);
  const safeOpportunities = toSafeArray(opportunities);
  if (!safeOpportunities.length) {
    return {
      ranked: [],
      warnings: [],
      usedOska: false,
    };
  }

  const includeDebug = options.includeMatchingDebug === true;

  if (options.useOska === false) {
    return {
      ranked: rankCareerOpportunities(profile, safeOpportunities, {
        includeDebug,
      }),
      warnings: [],
      usedOska: false,
    };
  }

  try {
    const ranked = await rankCareerOpportunitiesWithOska(
      profile,
      safeOpportunities,
      options.taxonomyService,
      {
        taxonomyConfig: options.taxonomyConfig,
        forceRefresh: options.forceRefreshTaxonomy === true,
        allowStaleOnError: options.allowStaleTaxonomyOnError !== false,
        matchingOptions: { includeDebug },
      }
    );

    return {
      ranked,
      warnings: [],
      usedOska: true,
    };
  } catch (error) {
    return {
      ranked: rankCareerOpportunities(profile, safeOpportunities, {
        includeDebug,
      }),
      warnings: [
        error instanceof Error
          ? `${text.warnings.oskaRankingFallback}: ${error.message}`
          : text.warnings.oskaRankingFallback,
      ],
      usedOska: false,
    };
  }
}

async function resolveDirectionItems(profile, options = {}) {
  const text = getOrchestratorLocaleText(options);
  const explicitDirections = toSafeArray(options.directionCandidates);
  const runtimeDirections = toSafeArray(options.runtime?.directionSeedRoles);
  const profileDirections = getListItems(profile?.directions?.immediateTargets, []);
  const sourceDirections =
    explicitDirections.length > 0
      ? explicitDirections
      : runtimeDirections.length > 0
      ? runtimeDirections
      : profileDirections;

  if (!sourceDirections.length) {
    return {
      items: [],
      warnings: [],
      usedOska: false,
    };
  }

  if (options.useOska === false) {
    return {
      items: sourceDirections.map((item) => coerceDirectionItem(item, null, options)),
      warnings: [],
      usedOska: false,
    };
  }

  try {
    const enriched = await enrichDirectionsWithOska(
      sourceDirections,
      options.taxonomyService,
      {
        taxonomyConfig: options.taxonomyConfig,
        forceRefresh: options.forceRefreshTaxonomy === true,
        allowStaleOnError: options.allowStaleTaxonomyOnError !== false,
      }
    );

    return {
      items: enriched.map((item) =>
        coerceDirectionItem(item.direction, item.oska, options)
      ),
      warnings: [],
      usedOska: true,
    };
  } catch (error) {
    return {
      items: sourceDirections.map((item) => coerceDirectionItem(item, null, options)),
      warnings: [
        error instanceof Error
          ? `${text.warnings.oskaDirectionFallback}: ${error.message}`
          : text.warnings.oskaDirectionFallback,
      ],
      usedOska: false,
    };
  }
}

function applyIncomingProfilePatch(profile, options = {}) {
  if (!options.profilePatch) {
    return profile;
  }

  const nextProfile = mergeProfilePatch(profile, options.profilePatch, {
    defaultSource: options.profilePatchSource || "from_user",
  });

  return applyComputedSupportNeed(nextProfile);
}

function buildConsentBlockedForJobMatching(profile, runtime = {}, state) {
  const decision = canUseCareerProfileForJobMatching(
    profile,
    runtime.privacyOptions || {}
  );

  if (decision.allowed) return null;

  return buildConsentBlockedResponse({
    state,
    locale: getResponseLocale(runtime),
    requiredConsentKeys: uniqueStrings([
      ...toSafeArray(decision.missingDecisionKeys),
      ...toSafeArray(decision.deniedDecisionKeys),
    ]),
  });
}

function buildConsentBlockedForDocuments(profile, runtime = {}, state) {
  const decision = canGenerateCareerDocuments(
    profile,
    runtime.privacyOptions || {}
  );

  if (decision.allowed) return null;

  return buildConsentBlockedResponse({
    state,
    locale: getResponseLocale(runtime),
    requiredConsentKeys: uniqueStrings([
      ...toSafeArray(decision.missingDecisionKeys),
      ...toSafeArray(decision.deniedDecisionKeys),
    ]),
  });
}

function shouldReturnAgreementBlock(state, modeDecision, profile, runtime = {}) {
  if (state !== CAREER_AGENT_STATES.AGREEMENTS) {
    return false;
  }

  if (toSafeArray(modeDecision?.deniedConsentKeys).length > 0) {
    return true;
  }

  return buildStateContext(profile, runtime).agreements.hasDeniedRequiredConsent;
}

function buildAgreementBlockedResponse(modeDecision, options = {}) {
  return buildConsentBlockedResponse({
    state: CAREER_AGENT_STATES.AGREEMENTS,
    locale: getResponseLocale(options),
    requiredConsentKeys: uniqueStrings([
      ...toSafeArray(modeDecision.missingConsentKeys),
      ...toSafeArray(modeDecision.deniedConsentKeys),
    ]),
  });
}

function pickQuestionLimit(state, modeDecision, options = {}) {
  if (Number.isFinite(options.questionLimit)) return options.questionLimit;
  return 1;
}

function buildQuestionOrConfirmationResponse(state, profile, runtime, modeDecision, options = {}) {
  const locale = getResponseLocale(options);
  const questions = getQuestionsForState(state, profile, runtime, {
    includeAnswered: false,
    limit: pickQuestionLimit(state, modeDecision, options),
    locale,
  });

  if (!questions.length) {
    return {
      response: null,
      questions: [],
    };
  }

  if (state === CAREER_AGENT_STATES.CONFIRM_PROFILE) {
    const profileSummary = {
      ...summarizeProfileForConfirmation(profile),
      draftText: getLatestDraftText(runtime),
    };
    const confirmQuestion = questions[0] || null;

    return {
      response: buildProfileConfirmationResponse(profileSummary, {
        confirmQuestion,
        locale,
      }),
      questions,
      profileSummary,
    };
  }

  return {
    response: buildQuestionSetResponse(state, questions, {
      locale,
    }),
    questions,
    profileSummary: null,
  };
}

function shouldOfferDocumentSecondaryResponse(documentStep) {
  return Boolean(documentStep?.flow);
}

function buildDocumentSecondaryResponse(documentStep, state, options = {}) {
  if (!documentStep?.flow) return null;
  const locale = getResponseLocale(options);

  if (documentStep.blockedByConsent) {
    return buildConsentBlockedResponse({
      state,
      locale,
      requiredConsentKeys: toSafeArray(documentStep.blockedConsentKeys),
    });
  }

  if (documentStep.readyToGenerate) {
    return buildDocumentFlowTransitionResponse(documentStep, {
      state,
      locale,
    });
  }

  if (documentStep.missingInputCount > 0) {
    return buildDocumentQuestionsResponse(documentStep, {
      state,
      locale,
    });
  }

  return null;
}

export function applyCareerQuestionAnswer({
  profile = {},
  runtime = {},
  questionId,
  answer,
  source = "from_user",
  confirmed = true,
}) {
  const question = getQuestionById(questionId);
  if (!question) {
    const text = getOrchestratorLocaleText(runtime || {});
    throw new Error(
      `${text.errors.unknownCareerQuestion}: ${coerceString(questionId) || "unknown"}`
    );
  }

  let nextProfile = normalizeCareerProfile(profile);
  let nextRuntime = { ...runtime };

  const profilePatch = createQuestionAnswerPatch(question, answer, {
    source,
    confirmed,
  });

  if (profilePatch) {
    nextProfile = mergeProfilePatch(nextProfile, profilePatch, {
      defaultSource: source,
    });
  }

  const runtimePatch = createQuestionRuntimeAnswer(question, answer);
  if (runtimePatch) {
    nextRuntime = mergeRuntimePatch(nextRuntime, runtimePatch);
  }

  nextProfile = markGuidedQuestionUsed(nextProfile);
  nextProfile = applyComputedSupportNeed(nextProfile);

  return {
    question,
    profile: nextProfile,
    runtime: nextRuntime,
  };
}

export async function resolveCareerTurn({
  profile = {},
  runtime = {},
  opportunities = [],
  directionCandidates = [],
  documentInput = {},
  generateDocumentNow = false,
  documentFlow = null,
  options = {},
} = {}) {
  const autoAdvanceDepth = Number.isFinite(options.__autoAdvanceDepth)
    ? Number(options.__autoAdvanceDepth)
    : 0;
  const responseLocale = getResponseLocale({
    ...runtime,
    ...options,
  });

  let safeProfile = normalizeCareerProfile(profile);
  safeProfile = applyIncomingProfilePatch(safeProfile, options);
  safeProfile = applyComputedSupportNeed(safeProfile);

  const safeRuntime = {
    ...runtime,
    locale: responseLocale,
    chatOnlyService: runtime.chatOnlyService !== false,
    ...buildRuntimeIntentFlags(
      runtime,
      opportunities,
      documentFlow,
      generateDocumentNow,
      documentInput
    ),
  };

  const modeDecision = resolveCareerECounsellingMode(safeProfile, safeRuntime);
  const currentState = resolveEffectiveCurrentState(safeProfile, safeRuntime);
  const nextState = determineNextState(currentState, safeProfile, safeRuntime);
  const workflowFocus = getWorkflowFocus(currentState, safeProfile, safeRuntime);

  const warnings = [];

  const jobMatchingBlockedEarly =
    safeRuntime.requiresJobMatching === true
      ? buildConsentBlockedForJobMatching(
          safeProfile,
          { ...safeRuntime, locale: responseLocale },
          currentState
        )
      : null;

  if (jobMatchingBlockedEarly) {
    return {
      profile: safeProfile,
      runtime: safeRuntime,
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities: [],
      directionItems: [],
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: jobMatchingBlockedEarly,
      secondaryResponse: null,
      warnings,
    };
  }

  const documentConsentBlockedEarly =
    safeRuntime.requiresDocumentGeneration === true
      ? buildConsentBlockedForDocuments(
          safeProfile,
          { ...safeRuntime, locale: responseLocale },
          currentState
        )
      : null;

  if (documentConsentBlockedEarly && generateDocumentNow === true) {
    return {
      profile: safeProfile,
      runtime: safeRuntime,
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities: [],
      directionItems: [],
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: documentConsentBlockedEarly,
      secondaryResponse: null,
      warnings,
    };
  }

  if (modeDecision.requiresHandoff && modeDecision.handoffDecision) {
    return {
      profile: safeProfile,
      runtime: safeRuntime,
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities: [],
      directionItems: [],
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: buildHandoffResponse(modeDecision.handoffDecision, {
        locale: responseLocale,
      }),
      secondaryResponse: null,
      warnings,
    };
  }

  if (shouldReturnAgreementBlock(currentState, modeDecision, safeProfile, safeRuntime)) {
    return {
      profile: safeProfile,
      runtime: {
        ...safeRuntime,
        currentState: CAREER_AGENT_STATES.SUMMARY,
      },
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities: [],
      directionItems: [],
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: buildAgreementBlockedResponse(modeDecision, {
        locale: responseLocale,
      }),
      secondaryResponse: null,
      warnings,
    };
  }

  const questionLayer = buildQuestionOrConfirmationResponse(
    currentState,
    safeProfile,
    safeRuntime,
    modeDecision,
    {
      ...options,
      locale: responseLocale,
    }
  );

  if (questionLayer.response) {
    return {
      profile: safeProfile,
      runtime: safeRuntime,
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: questionLayer.questions,
      rankedOpportunities: [],
      directionItems: [],
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      profileSummary: questionLayer.profileSummary || null,
      response: questionLayer.response,
      secondaryResponse: null,
      warnings,
    };
  }

  const directionResolution = await resolveDirectionItems(safeProfile, {
    ...options,
    directionCandidates,
    runtime: safeRuntime,
  });
  warnings.push(...directionResolution.warnings);

  if (
    currentState === CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS &&
    directionResolution.items.length > 0 &&
    safeRuntime.shortlistPresented !== true
  ) {
    return {
      profile: safeProfile,
      runtime: {
        ...safeRuntime,
        currentState: CAREER_AGENT_STATES.ANALYZE_OPTIONS,
        shortlistPresented: true,
      },
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities: [],
      directionItems: directionResolution.items,
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: buildDirectionShortlistResponse(directionResolution.items, {
        locale: responseLocale,
      }),
      secondaryResponse: null,
      warnings,
    };
  }

  const explicitOpportunities = toSafeArray(opportunities);
  const derivedOpportunities =
    explicitOpportunities.length === 0
      ? buildDerivedOpportunitiesFromDirections(directionResolution.items)
      : [];
  const opportunitiesForRanking =
    explicitOpportunities.length > 0 ? explicitOpportunities : derivedOpportunities;

  let rankedOpportunities = [];
  if (opportunitiesForRanking.length > 0) {
    if (
      explicitOpportunities.length > 0 &&
      shouldRequireJobMatchingConsent({ ...options, opportunities: explicitOpportunities })
    ) {
      const blockedResponse = buildConsentBlockedForJobMatching(
        safeProfile,
        { ...safeRuntime, locale: responseLocale },
        currentState
      );

      if (blockedResponse) {
        return {
          profile: safeProfile,
          runtime: safeRuntime,
          modeDecision,
          currentState,
          nextState,
          workflowFocus,
          questions: [],
          rankedOpportunities: [],
          directionItems: directionResolution.items,
          actionPlan: null,
          documentStep: null,
          generatedDocument: null,
          response: blockedResponse,
          secondaryResponse: null,
          warnings,
        };
      }
    }

    const opportunityResolution = await resolveRankedOpportunities(
      safeProfile,
      opportunitiesForRanking,
      options
    );

    rankedOpportunities =
      explicitOpportunities.length === 0
        ? applyDirectionOpportunitySignals(opportunityResolution.ranked)
        : opportunityResolution.ranked;
    warnings.push(...opportunityResolution.warnings);
  }

  if (
    currentState === CAREER_AGENT_STATES.ANALYZE_OPTIONS &&
    rankedOpportunities.length > 0
  ) {
    return {
      profile: safeProfile,
      runtime: {
        ...safeRuntime,
        currentState: CAREER_AGENT_STATES.ACTION_PLAN,
      },
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities,
      directionItems: directionResolution.items,
      actionPlan: null,
      documentStep: null,
      generatedDocument: null,
      response: buildOptionAnalysisResponse(rankedOpportunities, {
        locale: responseLocale,
      }),
      secondaryResponse: null,
      warnings,
    };
  }

  const actionPlan = buildCareerActionPlan(safeProfile, {
    rankedOpportunities,
    locale: responseLocale,
  });

  const documentStep = resolveDocumentStep(
    actionPlan,
    safeProfile,
    documentInput,
    { includeFlowMeta: true }
  );

  let generatedDocument = null;
  if (generateDocumentNow === true) {
    const explicitFlow = documentFlow || documentStep?.flow || null;

    if (explicitFlow) {
      const documentConsentBlocked = buildConsentBlockedForDocuments(
        safeProfile,
        { ...safeRuntime, locale: responseLocale },
        currentState
      );

      if (!documentConsentBlocked) {
        generatedDocument = generateCareerDocument(
          explicitFlow,
          safeProfile,
          documentInput,
          {
            language: options.documentLanguage,
          }
        );
      }
    }
  }

  if (currentState === CAREER_AGENT_STATES.ACTION_PLAN) {
    const primaryResponse = buildActionPlanResponse(actionPlan, {
      locale: responseLocale,
    });
    const secondaryResponse = shouldOfferDocumentSecondaryResponse(documentStep)
      ? buildDocumentSecondaryResponse(documentStep, currentState, {
          locale: responseLocale,
        })
      : null;

    return {
      profile: safeProfile,
      runtime: {
        ...safeRuntime,
        currentState: CAREER_AGENT_STATES.SUMMARY,
      },
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities,
      directionItems: directionResolution.items,
      actionPlan,
      documentStep,
      generatedDocument,
      response: primaryResponse,
      secondaryResponse,
      warnings,
    };
  }

  if (
    currentState === CAREER_AGENT_STATES.SUMMARY ||
    currentState === CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF
  ) {
    const profileSummary = summarizeProfileForConfirmation(safeProfile);
    const summaryPayload = buildSummaryPayload(
      profileSummary,
      modeDecision,
      rankedOpportunities,
      actionPlan,
      directionResolution.items
    );

    return {
      profile: safeProfile,
      runtime: safeRuntime,
      modeDecision,
      currentState,
      nextState,
      workflowFocus,
      questions: [],
      rankedOpportunities,
      directionItems: directionResolution.items,
      actionPlan,
      documentStep,
      generatedDocument,
      profileSummary,
      response: buildSummaryResponse(summaryPayload, {
        locale: responseLocale,
        state: currentState,
      }),
      secondaryResponse: null,
      warnings,
    };
  }

  if (
    nextState &&
    nextState !== currentState &&
    autoAdvanceDepth < MAX_AUTO_ADVANCE_DEPTH
  ) {
    return resolveCareerTurn({
      profile: safeProfile,
      runtime: {
        ...safeRuntime,
        currentState: nextState,
      },
      opportunities,
      directionCandidates,
      documentInput,
      generateDocumentNow,
      documentFlow,
      options: {
        ...options,
        __autoAdvanceDepth: autoAdvanceDepth + 1,
      },
    });
  }

  return {
    profile: safeProfile,
    runtime: safeRuntime,
    modeDecision,
    currentState,
    nextState,
    workflowFocus,
    questions: [],
    rankedOpportunities,
    directionItems: directionResolution.items,
    actionPlan,
    documentStep,
    generatedDocument,
    response: buildStateIntroResponse(currentState, workflowFocus, {
      locale: responseLocale,
    }),
    secondaryResponse: null,
    warnings,
  };
}

export function createCareerOrchestrator(defaultOptions = {}) {
  return {
    applyQuestionAnswer(payload) {
      return applyCareerQuestionAnswer(payload);
    },

    async resolveTurn(payload = {}) {
      return resolveCareerTurn({
        ...payload,
        options: {
          ...defaultOptions,
          ...(payload.options || {}),
        },
      });
    },
  };
}
