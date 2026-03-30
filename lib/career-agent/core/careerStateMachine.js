// /lib/career-agent/core/careerStateMachine.js

import {
  computeSupportNeed,
  getMetaValue,
  getMetaSource,
  getMetaStatus,
  getListItems,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import {
  PROFILE_SOURCES,
  PROFILE_STATUS,
  RECOMMENDED_MODES,
  SOURCE_MODES,
} from "../profile/careerProfile.schema.js";

export const CAREER_AGENT_STATES = Object.freeze({
  INTAKE: "intake",
  SERVICE_LEVEL_CHECK: "service_level_check",
  CONTACT: "contact",
  AGREEMENTS: "agreements",
  PARSE_PROFILE: "parse_profile",
  CONFIRM_PROFILE: "confirm_profile",
  SELF_ANALYSIS: "self_analysis",
  CLARIFY_PROBLEM: "clarify_problem",
  SET_GOALS: "set_goals",
  SHORTLIST_DIRECTIONS: "shortlist_directions",
  ANALYZE_OPTIONS: "analyze_options",
  ACTION_PLAN: "action_plan",
  SUMMARY: "summary",
  FOLLOW_UP_OR_HANDOFF: "follow_up_or_handoff",
  HANDOFF: "handoff",
});

export const CAREER_STATE_ORDER = Object.freeze([
  CAREER_AGENT_STATES.INTAKE,
  CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK,
  CAREER_AGENT_STATES.CONTACT,
  CAREER_AGENT_STATES.AGREEMENTS,
  CAREER_AGENT_STATES.PARSE_PROFILE,
  CAREER_AGENT_STATES.CONFIRM_PROFILE,
  CAREER_AGENT_STATES.SELF_ANALYSIS,
  CAREER_AGENT_STATES.CLARIFY_PROBLEM,
  CAREER_AGENT_STATES.SET_GOALS,
  CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS,
  CAREER_AGENT_STATES.ANALYZE_OPTIONS,
  CAREER_AGENT_STATES.ACTION_PLAN,
  CAREER_AGENT_STATES.SUMMARY,
  CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF,
  CAREER_AGENT_STATES.HANDOFF,
]);

export const CAREER_STATE_META = Object.freeze({
  [CAREER_AGENT_STATES.INTAKE]: {
    label: "Intake",
    objective: "Understand why the user came and what initial input is available.",
  },
  [CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK]: {
    label: "Service level check",
    objective: "Estimate the support level and whether early handoff should be considered.",
  },
  [CAREER_AGENT_STATES.CONTACT]: {
    label: "Contact",
    objective: "Set the basic communication mode and interaction frame.",
  },
  [CAREER_AGENT_STATES.AGREEMENTS]: {
    label: "Agreements",
    objective: "Clarify boundaries, expectations, and consent-sensitive flow.",
  },
  [CAREER_AGENT_STATES.PARSE_PROFILE]: {
    label: "Parse profile",
    objective: "Turn CV/chat input into a structured profile draft.",
  },
  [CAREER_AGENT_STATES.CONFIRM_PROFILE]: {
    label: "Confirm profile",
    objective: "Review and confirm the profile with the user.",
  },
  [CAREER_AGENT_STATES.SELF_ANALYSIS]: {
    label: "Self analysis",
    objective: "Clarify strengths, interests, values, and working preferences.",
  },
  [CAREER_AGENT_STATES.CLARIFY_PROBLEM]: {
    label: "Clarify problem",
    objective: "Narrow down the concrete career question or challenge.",
  },
  [CAREER_AGENT_STATES.SET_GOALS]: {
    label: "Set goals",
    objective: "Agree on a practical goal and preferred next step.",
  },
  [CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS]: {
    label: "Shortlist directions",
    objective: "Produce realistic career or learning directions.",
  },
  [CAREER_AGENT_STATES.ANALYZE_OPTIONS]: {
    label: "Analyze options",
    objective: "Compare one or more directions with fit and missing requirements.",
  },
  [CAREER_AGENT_STATES.ACTION_PLAN]: {
    label: "Action plan",
    objective: "Define at least one concrete next step.",
  },
  [CAREER_AGENT_STATES.SUMMARY]: {
    label: "Summary",
    objective: "Summarize profile, options, and next steps.",
  },
  [CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF]: {
    label: "Follow-up or handoff",
    objective: "Decide whether to continue with AI support or hand off.",
  },
  [CAREER_AGENT_STATES.HANDOFF]: {
    label: "Handoff",
    objective: "Escalate to a human or another service when needed.",
  },
});

export const CAREER_ALLOWED_TRANSITIONS = Object.freeze({
  [CAREER_AGENT_STATES.INTAKE]: [CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK],
  [CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK]: [
    CAREER_AGENT_STATES.CONTACT,
    CAREER_AGENT_STATES.HANDOFF,
  ],
  [CAREER_AGENT_STATES.CONTACT]: [CAREER_AGENT_STATES.AGREEMENTS],
  [CAREER_AGENT_STATES.AGREEMENTS]: [CAREER_AGENT_STATES.PARSE_PROFILE],
  [CAREER_AGENT_STATES.PARSE_PROFILE]: [CAREER_AGENT_STATES.CONFIRM_PROFILE],
  [CAREER_AGENT_STATES.CONFIRM_PROFILE]: [CAREER_AGENT_STATES.SELF_ANALYSIS],
  [CAREER_AGENT_STATES.SELF_ANALYSIS]: [CAREER_AGENT_STATES.CLARIFY_PROBLEM],
  [CAREER_AGENT_STATES.CLARIFY_PROBLEM]: [CAREER_AGENT_STATES.SET_GOALS],
  [CAREER_AGENT_STATES.SET_GOALS]: [CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS],
  [CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS]: [
    CAREER_AGENT_STATES.ANALYZE_OPTIONS,
  ],
  [CAREER_AGENT_STATES.ANALYZE_OPTIONS]: [CAREER_AGENT_STATES.ACTION_PLAN],
  [CAREER_AGENT_STATES.ACTION_PLAN]: [CAREER_AGENT_STATES.SUMMARY],
  [CAREER_AGENT_STATES.SUMMARY]: [CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF],
  [CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF]: [
    CAREER_AGENT_STATES.ACTION_PLAN,
    CAREER_AGENT_STATES.HANDOFF,
  ],
  [CAREER_AGENT_STATES.HANDOFF]: [],
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function countList(field) {
  return getListItems(field, []).length;
}

function hasSourceMode(profile, mode) {
  return toSafeArray(profile?.sourceMode?.activeModes).includes(mode);
}

function hasConfirmedMeaningfulMeta(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    hasMeaningfulValue(getMetaValue(field))
  );
}

function hasAffirmativeConsent(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getMetaValue(field) === true
  );
}

function hasExplicitlyDeniedConsent(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getMetaValue(field) === false
  );
}

function hasExplicitContactSignal(profile, runtime = {}) {
  if (runtime?.chatOnlyService !== false) {
    return true;
  }

  const preferredChannelSource = getMetaSource(profile?.contact?.preferredChannel);
  const preferredChannelStatus = getMetaStatus(profile?.contact?.preferredChannel);
  const preferredChannelValue = getMetaValue(profile?.contact?.preferredChannel);

  const explicitPreferredChannel =
    preferredChannelSource !== PROFILE_SOURCES.SYSTEM_DERIVED &&
    preferredChannelStatus === PROFILE_STATUS.CONFIRMED &&
    hasMeaningfulValue(preferredChannelValue);

  return (
    explicitPreferredChannel ||
    hasConfirmedMeaningfulMeta(profile?.contact?.email) ||
    hasConfirmedMeaningfulMeta(profile?.contact?.phone)
  );
}

function hasCvOrProfileSignals(profile) {
  return (
    profile?.sourceMode?.cvUploaded === true ||
    hasSourceMode(profile, SOURCE_MODES.CV_UPLOAD) ||
    countList(profile?.education?.completed) > 0 ||
    countList(profile?.experience?.roles) > 0 ||
    countList(profile?.skills?.domainSkills) > 0 ||
    countList(profile?.skills?.transferableSkills) > 0
  );
}

function hasSelfAnalysisSignals(profile) {
  return (
    countList(profile?.selfAnalysis?.strengths) > 0 ||
    countList(profile?.selfAnalysis?.interests) > 0 ||
    countList(profile?.selfAnalysis?.values) > 0 ||
    countList(profile?.selfAnalysis?.dealBreakers) > 0
  );
}

function hasGoalSignals(profile) {
  return (
    hasMeaningfulValue(getMetaValue(profile?.goals?.primaryGoal)) ||
    hasMeaningfulValue(getMetaValue(profile?.goals?.preferredNextStep)) ||
    hasMeaningfulValue(getMetaValue(profile?.goals?.urgency))
  );
}

function hasDirectionSignals(profile) {
  return (
    countList(profile?.directions?.immediateTargets) > 0 ||
    countList(profile?.directions?.nearTargets) > 0 ||
    countList(profile?.directions?.educationPaths) > 0
  );
}

function hasConfirmableProfileData(profile) {
  return (
    hasMeaningfulValue(getMetaValue(profile?.identity?.displayName)) ||
    hasMeaningfulValue(getMetaValue(profile?.identity?.ageGroup)) ||
    hasMeaningfulValue(getMetaValue(profile?.identity?.location)) ||
    countList(profile?.identity?.languages) > 0 ||
    hasMeaningfulValue(getMetaValue(profile?.goals?.primaryGoal)) ||
    hasMeaningfulValue(getMetaValue(profile?.goals?.preferredNextStep)) ||
    hasMeaningfulValue(getMetaValue(profile?.goals?.urgency)) ||
    hasMeaningfulValue(getMetaValue(profile?.workStatus?.currentStatus)) ||
    hasMeaningfulValue(getMetaValue(profile?.workStatus?.availability)) ||
    countList(profile?.workStatus?.preferredWorkForms) > 0 ||
    hasMeaningfulValue(getMetaValue(profile?.education?.highestLevel)) ||
    hasMeaningfulValue(getMetaValue(profile?.education?.learningReadiness)) ||
    hasMeaningfulValue(getMetaValue(profile?.education?.retrainingInterest)) ||
    countList(profile?.selfAnalysis?.strengths) > 0 ||
    countList(profile?.selfAnalysis?.interests) > 0 ||
    countList(profile?.selfAnalysis?.values) > 0 ||
    countList(profile?.selfAnalysis?.dealBreakers) > 0 ||
    countList(profile?.skills?.domainSkills) > 0 ||
    countList(profile?.skills?.transferableSkills) > 0 ||
    hasDirectionSignals(profile)
  );
}

function shouldEarlyHandoff(runtime = {}, supportNeed = null) {
  if (runtime?.forceHandoff === true) return true;
  if (runtime?.handoffTriggered === true) return true;
  if (runtime?.handoffRecommendedEarly === true) return true;

  return supportNeed?.recommendedMode === RECOMMENDED_MODES.HANDOFF;
}

function getRequiredAgreementConsentKeys(profile, runtime = {}) {
  const keys = ["profileStorageApproved"];

  if (runtime?.requiresJobMatching === true) {
    keys.push("jobMatchingApproved");
  }

  if (runtime?.requiresDocumentGeneration === true) {
    keys.push("documentGenerationApproved");
  }

  if (runtime?.requiresTesting === true) {
    keys.push("testingApproved");
  }

  if (
    getMetaValue(profile?.identity?.minor) === true &&
    runtime?.requiresTesting === true
  ) {
    keys.push("minorGuardianConsent");
  }

  return keys;
}

function areRequiredConsentsApproved(profile, runtime = {}) {
  const requiredKeys = getRequiredAgreementConsentKeys(profile, runtime);

  return requiredKeys.every((key) =>
    hasAffirmativeConsent(profile?.consent?.[key])
  );
}

function hasDeniedRequiredConsent(profile, runtime = {}) {
  const requiredKeys = getRequiredAgreementConsentKeys(profile, runtime);

  return requiredKeys.some((key) =>
    hasExplicitlyDeniedConsent(profile?.consent?.[key])
  );
}

export function isValidCareerState(state) {
  return CAREER_STATE_ORDER.includes(state);
}

export function getCareerStateMeta(state) {
  return CAREER_STATE_META[state] || null;
}

export function getAllowedTransitions(state) {
  return CAREER_ALLOWED_TRANSITIONS[state] || [];
}

export function canTransition(fromState, toState) {
  return getAllowedTransitions(fromState).includes(toState);
}

export function buildStateContext(profile, runtime = {}) {
  const supportNeed = computeSupportNeed(profile);
  const missingInformation = getListItems(
    profile?.recommendationContext?.missingInformation,
    []
  );

  const requiredAgreementConsentKeys = getRequiredAgreementConsentKeys(
    profile,
    runtime
  );

  return {
    currentState: runtime?.currentState || null,

    sourceMode: {
      activeModes: toSafeArray(profile?.sourceMode?.activeModes),
      cvUploaded: profile?.sourceMode?.cvUploaded === true,
      freeTextProvided: profile?.sourceMode?.freeTextProvided === true,
      guidedQuestionsUsed: profile?.sourceMode?.guidedQuestionsUsed === true,
    },

    identity: {
      displayName: getMetaValue(profile?.identity?.displayName),
      ageGroup: getMetaValue(profile?.identity?.ageGroup),
      minor: getMetaValue(profile?.identity?.minor),
      location: getMetaValue(profile?.identity?.location),
    },

    contact: {
      preferredChannel: getMetaValue(profile?.contact?.preferredChannel),
      preferredChannelSource: getMetaSource(profile?.contact?.preferredChannel),
      preferredChannelStatus: getMetaStatus(profile?.contact?.preferredChannel),
      email: getMetaValue(profile?.contact?.email),
      phone: getMetaValue(profile?.contact?.phone),
      hasExplicitContactSignal: hasExplicitContactSignal(profile, runtime),
    },

    goals: {
      primaryGoal: getMetaValue(profile?.goals?.primaryGoal),
      urgency: getMetaValue(profile?.goals?.urgency),
      incomePressure: getMetaValue(profile?.goals?.incomePressure),
      preferredNextStep: getMetaValue(profile?.goals?.preferredNextStep),
    },

    readiness: {
      careerClarity: getMetaValue(profile?.careerReadiness?.careerClarity),
      careerConfidence: getMetaValue(profile?.careerReadiness?.careerConfidence),
      labourMarketKnowledge: getMetaValue(
        profile?.careerReadiness?.labourMarketKnowledge
      ),
      lifelongLearningReadiness: getMetaValue(
        profile?.careerReadiness?.lifelongLearningReadiness
      ),
      socialSupportLevel: getMetaValue(
        profile?.careerReadiness?.socialSupportLevel
      ),
    },

    supportNeed,

    confirmation: {
      confirmedByUser:
        getMetaValue(profile?.recommendationContext?.confirmedByUser) === true,
    },

    agreements: {
      requiredConsentKeys: requiredAgreementConsentKeys,
      allRequiredConsentsApproved: areRequiredConsentsApproved(profile, runtime),
      hasDeniedRequiredConsent: hasDeniedRequiredConsent(profile, runtime),
    },

    coverage: {
      hasCvOrProfileSignals: hasCvOrProfileSignals(profile),
      hasSelfAnalysisSignals: hasSelfAnalysisSignals(profile),
      hasGoalSignals: hasGoalSignals(profile),
      hasDirectionSignals: hasDirectionSignals(profile),
      missingInformationCount: missingInformation.length,
    },

    counts: {
      experienceRoles: countList(profile?.experience?.roles),
      educationCompleted: countList(profile?.education?.completed),
      immediateTargets: countList(profile?.directions?.immediateTargets),
      nearTargets: countList(profile?.directions?.nearTargets),
      confidenceNotes: countList(profile?.recommendationContext?.confidenceNotes),
      missingInformation: missingInformation.length,
    },

    runtime: {
      userMessageProvided: runtime?.userMessageProvided === true,
      contactEstablished: runtime?.contactEstablished === true,
      agreementsAccepted: runtime?.agreementsAccepted === true,
      profileParsed: runtime?.profileParsed === true,
      profileConfirmed: runtime?.profileConfirmed === true,
      profileCorrectionPending: runtime?.profileCorrectionPending === true,
      selfAnalysisAnswered: runtime?.selfAnalysisAnswered === true,
      problemClarified: runtime?.problemClarified === true,
      goalsSet: runtime?.goalsSet === true,
      directionsShortlisted: runtime?.directionsShortlisted === true,
      optionsAnalyzed: runtime?.optionsAnalyzed === true,
      actionPlanBuilt: runtime?.actionPlanBuilt === true,
      summaryPrepared: runtime?.summaryPrepared === true,
      handoffEvaluated: runtime?.handoffEvaluated === true,
      handoffTriggered: runtime?.handoffTriggered === true,
      handoffRecommendedEarly: runtime?.handoffRecommendedEarly === true,
      chatOnlyService: runtime?.chatOnlyService !== false,
      followUpPrepared: runtime?.followUpPrepared === true,
      reopenActionPlan: runtime?.reopenActionPlan === true,
      forceHandoff: runtime?.forceHandoff === true,
      requiresJobMatching: runtime?.requiresJobMatching === true,
      requiresDocumentGeneration: runtime?.requiresDocumentGeneration === true,
      requiresTesting: runtime?.requiresTesting === true,
      actionPlanSteps: toSafeArray(runtime?.actionPlan).length,
    },
  };
}

export function getStateRequirements(state) {
  switch (state) {
    case CAREER_AGENT_STATES.INTAKE:
      return ["initial_input"];
    case CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK:
      return ["support_need_estimate"];
    case CAREER_AGENT_STATES.CONTACT:
      return ["interaction_frame"];
    case CAREER_AGENT_STATES.AGREEMENTS:
      return ["boundaries_and_required_consents"];
    case CAREER_AGENT_STATES.PARSE_PROFILE:
      return ["structured_profile_draft"];
    case CAREER_AGENT_STATES.CONFIRM_PROFILE:
      return ["profile_review_with_user"];
    case CAREER_AGENT_STATES.SELF_ANALYSIS:
      return ["strengths_interests_values"];
    case CAREER_AGENT_STATES.CLARIFY_PROBLEM:
      return ["concrete_problem_definition"];
    case CAREER_AGENT_STATES.SET_GOALS:
      return ["goal_and_preferred_next_step"];
    case CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS:
      return ["direction_candidates"];
    case CAREER_AGENT_STATES.ANALYZE_OPTIONS:
      return ["fit_or_gap_analysis"];
    case CAREER_AGENT_STATES.ACTION_PLAN:
      return ["at_least_one_concrete_step"];
    case CAREER_AGENT_STATES.SUMMARY:
      return ["summary_ready"];
    case CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF:
      return ["continue_or_handoff_decision"];
    case CAREER_AGENT_STATES.HANDOFF:
      return ["handoff_reason"];
    default:
      return [];
  }
}

export function isStateSatisfied(state, profile, runtime = {}) {
  const context = buildStateContext(profile, runtime);

  switch (state) {
    case CAREER_AGENT_STATES.INTAKE:
      return (
        context.runtime.userMessageProvided ||
        context.sourceMode.cvUploaded ||
        context.sourceMode.freeTextProvided ||
        context.coverage.hasCvOrProfileSignals ||
        context.coverage.hasGoalSignals
      );

    case CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK:
      return true;

    case CAREER_AGENT_STATES.CONTACT:
      return (
        context.runtime.contactEstablished ||
        context.contact.hasExplicitContactSignal
      );

    case CAREER_AGENT_STATES.AGREEMENTS:
      return (
        context.runtime.agreementsAccepted &&
        context.agreements.allRequiredConsentsApproved &&
        !context.agreements.hasDeniedRequiredConsent
      );

    case CAREER_AGENT_STATES.PARSE_PROFILE:
      return (
        context.runtime.profileCorrectionPending !== true &&
        (context.runtime.profileParsed || context.coverage.hasCvOrProfileSignals)
      );

    case CAREER_AGENT_STATES.CONFIRM_PROFILE:
      return (
        !hasConfirmableProfileData(profile) ||
        context.runtime.profileConfirmed ||
        context.confirmation.confirmedByUser === true
      );

    case CAREER_AGENT_STATES.SELF_ANALYSIS:
      return (
        context.runtime.selfAnalysisAnswered ||
        context.coverage.hasSelfAnalysisSignals
      );

    case CAREER_AGENT_STATES.CLARIFY_PROBLEM:
      return context.runtime.problemClarified || context.coverage.hasGoalSignals;

    case CAREER_AGENT_STATES.SET_GOALS:
      return (
        context.runtime.goalsSet ||
        (hasMeaningfulValue(context.goals.primaryGoal) &&
          hasMeaningfulValue(context.goals.preferredNextStep))
      );

    case CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS:
      return (
        context.runtime.directionsShortlisted ||
        context.coverage.hasDirectionSignals
      );

    case CAREER_AGENT_STATES.ANALYZE_OPTIONS:
      return context.runtime.optionsAnalyzed;

    case CAREER_AGENT_STATES.ACTION_PLAN:
      return (
        context.runtime.actionPlanBuilt ||
        context.runtime.actionPlanSteps > 0
      );

    case CAREER_AGENT_STATES.SUMMARY:
      return context.runtime.summaryPrepared;

    case CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF:
      return (
        context.runtime.followUpPrepared ||
        context.runtime.handoffEvaluated ||
        context.runtime.handoffTriggered
      );

    case CAREER_AGENT_STATES.HANDOFF:
      return context.runtime.handoffTriggered || context.runtime.forceHandoff;

    default:
      return false;
  }
}

export function getRecommendedEntryState(profile, runtime = {}) {
  const supportNeed = computeSupportNeed(profile);

  if (shouldEarlyHandoff(runtime, supportNeed)) {
    return CAREER_AGENT_STATES.HANDOFF;
  }

  for (const state of CAREER_STATE_ORDER) {
    if (state === CAREER_AGENT_STATES.HANDOFF) continue;
    if (!isStateSatisfied(state, profile, runtime)) {
      return state;
    }
  }

  return CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF;
}

export function determineNextState(currentState, profile, runtime = {}) {
  if (!isValidCareerState(currentState)) {
    return getRecommendedEntryState(profile, runtime);
  }

  const context = buildStateContext(profile, runtime);

  if (
    currentState === CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK &&
    shouldEarlyHandoff(runtime, context.supportNeed)
  ) {
    return CAREER_AGENT_STATES.HANDOFF;
  }

  if (
    currentState === CAREER_AGENT_STATES.AGREEMENTS &&
    context.agreements.hasDeniedRequiredConsent
  ) {
    return CAREER_AGENT_STATES.AGREEMENTS;
  }

  if (!isStateSatisfied(currentState, profile, runtime)) {
    return currentState;
  }

  switch (currentState) {
    case CAREER_AGENT_STATES.INTAKE:
      return CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK;

    case CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK:
      return CAREER_AGENT_STATES.CONTACT;

    case CAREER_AGENT_STATES.CONTACT:
      return CAREER_AGENT_STATES.AGREEMENTS;

    case CAREER_AGENT_STATES.AGREEMENTS:
      return CAREER_AGENT_STATES.PARSE_PROFILE;

    case CAREER_AGENT_STATES.PARSE_PROFILE:
      return CAREER_AGENT_STATES.CONFIRM_PROFILE;

    case CAREER_AGENT_STATES.CONFIRM_PROFILE:
      return CAREER_AGENT_STATES.SELF_ANALYSIS;

    case CAREER_AGENT_STATES.SELF_ANALYSIS:
      return CAREER_AGENT_STATES.CLARIFY_PROBLEM;

    case CAREER_AGENT_STATES.CLARIFY_PROBLEM:
      return CAREER_AGENT_STATES.SET_GOALS;

    case CAREER_AGENT_STATES.SET_GOALS:
      return CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS;

    case CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS:
      return CAREER_AGENT_STATES.ANALYZE_OPTIONS;

    case CAREER_AGENT_STATES.ANALYZE_OPTIONS:
      return CAREER_AGENT_STATES.ACTION_PLAN;

    case CAREER_AGENT_STATES.ACTION_PLAN:
      return CAREER_AGENT_STATES.SUMMARY;

    case CAREER_AGENT_STATES.SUMMARY:
      return CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF;

    case CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF:
      if (context.runtime.handoffTriggered || context.runtime.forceHandoff) {
        return CAREER_AGENT_STATES.HANDOFF;
      }

      if (context.runtime.reopenActionPlan) {
        return CAREER_AGENT_STATES.ACTION_PLAN;
      }

      return CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF;

    case CAREER_AGENT_STATES.HANDOFF:
      return CAREER_AGENT_STATES.HANDOFF;

    default:
      return currentState;
  }
}

export function createCareerSessionState(profile, runtime = {}) {
  const state = getRecommendedEntryState(profile, runtime);
  const context = buildStateContext(profile, {
    ...runtime,
    currentState: state,
  });

  return {
    state,
    stateMeta: getCareerStateMeta(state),
    allowedTransitions: getAllowedTransitions(state),
    context,
  };
}

export function getWorkflowFocus(state, profile, runtime = {}) {
  const context = buildStateContext(profile, runtime);

  switch (state) {
    case CAREER_AGENT_STATES.INTAKE:
      return "Understand the user's reason for coming and available input sources.";

    case CAREER_AGENT_STATES.SERVICE_LEVEL_CHECK:
      return `Estimate support need and decide whether the flow can continue with AI guidance. Suggested mode: ${context.supportNeed.recommendedMode}.`;

    case CAREER_AGENT_STATES.CONTACT:
      return "Set the interaction frame and establish the actual contact mode with the user.";

    case CAREER_AGENT_STATES.AGREEMENTS:
      return "Clarify boundaries and make sure the required consent fields are explicitly resolved.";

    case CAREER_AGENT_STATES.PARSE_PROFILE:
      return "Build a structured profile draft from chat or CV input.";

    case CAREER_AGENT_STATES.CONFIRM_PROFILE:
      return "Review the profile with the user and confirm uncertain facts.";

    case CAREER_AGENT_STATES.SELF_ANALYSIS:
      return "Explore strengths, interests, values, and working preferences.";

    case CAREER_AGENT_STATES.CLARIFY_PROBLEM:
      return "Define the concrete career question to solve next.";

    case CAREER_AGENT_STATES.SET_GOALS:
      return "Turn the clarified situation into a practical goal and next step.";

    case CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS:
      return "Produce realistic job, study, or pathway options.";

    case CAREER_AGENT_STATES.ANALYZE_OPTIONS:
      return "Compare fit, missing requirements, and realistic trade-offs.";

    case CAREER_AGENT_STATES.ACTION_PLAN:
      return "Create a concrete next-step plan with at least one actionable step.";

    case CAREER_AGENT_STATES.SUMMARY:
      return "Summarize profile, options, risks, and next actions.";

    case CAREER_AGENT_STATES.FOLLOW_UP_OR_HANDOFF:
      return "Decide whether AI support should remain concluded, reopen the action plan, or move to handoff.";

    case CAREER_AGENT_STATES.HANDOFF:
      return "Prepare a clear and safe transition to human or external support.";

    default:
      return null;
  }
}
