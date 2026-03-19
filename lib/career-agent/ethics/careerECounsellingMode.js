// /lib/career-agent/ethics/careerECounsellingMode.js

import {
  computeSupportNeed,
  getListItems,
  getMetaValue,
} from "../profile/careerProfile.helpers.js";
import { RECOMMENDED_MODES } from "../profile/careerProfile.schema.js";
import {
  canStoreCareerProfile,
  canUseCareerProfileForJobMatching,
  canGenerateCareerDocuments,
  canRunCareerTesting,
  canShareCareerData,
} from "./careerPrivacyRules.js";
import { evaluateCareerHandoff } from "./careerHandoffRules.js";
import { evaluateCareerEthicalHandoff } from "./careerHandoffRulesEthical.js";

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
  }
  return value;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
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

const HANDOFF_SEVERITY_ORDER = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
});

export const CAREER_ECOUNSELLING_MODES = Object.freeze({
  QUICK_GUIDANCE: RECOMMENDED_MODES.QUICK_GUIDANCE,
  GUIDED_FLOW: RECOMMENDED_MODES.GUIDED_FLOW,
  MULTI_STEP_SUPPORT: RECOMMENDED_MODES.MULTI_STEP_SUPPORT,
  HANDOFF: RECOMMENDED_MODES.HANDOFF,
});

export const CAREER_ECOUNSELLING_MODE_RULES = deepFreeze({
  [CAREER_ECOUNSELLING_MODES.QUICK_GUIDANCE]: {
    label: "Quick guidance",
    questionStrategy: "Ask at most one focused question at a time.",
    responseStyle: "Be brief, practical, and direct.",
    maxQuestionsPerTurn: 1,
    requireTighterConfirmation: false,
    preferActionOverReflection: true,
    allowDocumentSuggestion: true,
    allowOptionComparison: true,
  },

  [CAREER_ECOUNSELLING_MODES.GUIDED_FLOW]: {
    label: "Guided flow",
    questionStrategy: "Ask one or two structured questions and move step by step.",
    responseStyle: "Keep the flow clear, calm, and process-oriented.",
    maxQuestionsPerTurn: 2,
    requireTighterConfirmation: true,
    preferActionOverReflection: false,
    allowDocumentSuggestion: true,
    allowOptionComparison: true,
  },

  [CAREER_ECOUNSELLING_MODES.MULTI_STEP_SUPPORT]: {
    label: "Multi-step support",
    questionStrategy:
      "Move cautiously, confirm key facts, and keep questions narrowly scoped.",
    responseStyle: "Use slower pacing and transparent uncertainty.",
    maxQuestionsPerTurn: 2,
    requireTighterConfirmation: true,
    preferActionOverReflection: false,
    allowDocumentSuggestion: false,
    allowOptionComparison: true,
  },

  [CAREER_ECOUNSELLING_MODES.HANDOFF]: {
    label: "Handoff mode",
    questionStrategy:
      "Do not continue normal counselling flow. Clarify only what is necessary for safe handoff.",
    responseStyle:
      "Be clear, respectful, and explicit about why AI should not continue alone.",
    maxQuestionsPerTurn: 1,
    requireTighterConfirmation: true,
    preferActionOverReflection: false,
    allowDocumentSuggestion: false,
    allowOptionComparison: false,
  },
});

function rankHandoffDecision(decision) {
  if (!decision?.handoffNeeded) return 0;
  return HANDOFF_SEVERITY_ORDER[decision.severity] || 0;
}

function choosePrimaryHandoffDecision(operational, ethical) {
  if (!operational?.handoffNeeded && !ethical?.handoffNeeded) {
    return null;
  }

  if (rankHandoffDecision(ethical) > rankHandoffDecision(operational)) {
    return {
      source: "ethical",
      ...ethical,
    };
  }

  if (operational?.handoffNeeded) {
    return {
      source: "operational",
      ...operational,
    };
  }

  return {
    source: "ethical",
    ...ethical,
  };
}

function resolveRelevantPrivacyActions(runtime = {}) {
  const actions = new Set();

  if (runtime.requestedPrivacyAction) {
    actions.add(runtime.requestedPrivacyAction);
  }

  if (
    runtime.requiresProfileStorage === true ||
    runtime.persistentProfileRequested === true ||
    runtime.storeProfileRequested === true
  ) {
    actions.add(CAREER_PRIVACY_ACTIONS.STORE_PROFILE);
  }

  if (
    runtime.requiresJobMatching === true ||
    runtime.jobMatchingRequested === true
  ) {
    actions.add(CAREER_PRIVACY_ACTIONS.JOB_MATCHING);
  }

  if (
    runtime.requiresDocumentGeneration === true ||
    runtime.documentFlowRequested === true ||
    runtime.documentGenerationRequested === true
  ) {
    actions.add(CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION);
  }

  if (
    runtime.requiresTesting === true ||
    runtime.testingRequested === true
  ) {
    actions.add(CAREER_PRIVACY_ACTIONS.TESTING);
  }

  if (
    runtime.requiresThirdPartySharing === true ||
    runtime.shareWithThirdPartiesRequested === true
  ) {
    actions.add(CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES);
  }

  return Array.from(actions);
}

function buildPrivacyCapabilityMap(profile, runtime = {}, relevantActions = []) {
  const privacyOptions = runtime.privacyOptions || {};
  const result = {};

  for (const action of relevantActions) {
    switch (action) {
      case CAREER_PRIVACY_ACTIONS.STORE_PROFILE:
        result[action] = canStoreCareerProfile(profile, privacyOptions);
        break;

      case CAREER_PRIVACY_ACTIONS.JOB_MATCHING:
        result[action] = canUseCareerProfileForJobMatching(profile, privacyOptions);
        break;

      case CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION:
        result[action] = canGenerateCareerDocuments(profile, privacyOptions);
        break;

      case CAREER_PRIVACY_ACTIONS.TESTING:
        result[action] = canRunCareerTesting(profile, privacyOptions);
        break;

      case CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES:
        result[action] = canShareCareerData(profile, privacyOptions);
        break;

      default:
        break;
    }
  }

  return result;
}

function buildBlockedActions(capabilities) {
  return Object.entries(capabilities)
    .filter(([, decision]) => decision && decision.allowed === false)
    .map(([action]) => action);
}

function buildMissingConsentKeys(capabilities) {
  return uniqueStrings(
    Object.values(capabilities).flatMap((decision) =>
      toSafeArray(decision?.missingDecisionKeys)
    )
  );
}

function buildDeniedConsentKeys(capabilities) {
  return uniqueStrings(
    Object.values(capabilities).flatMap((decision) =>
      toSafeArray(decision?.deniedDecisionKeys)
    )
  );
}

function inferBaseMode(profile, runtime = {}) {
  const supportNeed = computeSupportNeed(profile);
  const missingInformationCount = getListItems(
    profile?.recommendationContext?.missingInformation,
    []
  ).length;

  if (runtime.forceMode && CAREER_ECOUNSELLING_MODE_RULES[runtime.forceMode]) {
    return runtime.forceMode;
  }

  if (supportNeed?.recommendedMode) {
    if (
      supportNeed.recommendedMode === CAREER_ECOUNSELLING_MODES.QUICK_GUIDANCE &&
      missingInformationCount >= 3
    ) {
      return CAREER_ECOUNSELLING_MODES.GUIDED_FLOW;
    }

    return supportNeed.recommendedMode;
  }

  return CAREER_ECOUNSELLING_MODES.GUIDED_FLOW;
}

function buildModeNotes(profile, baseMode, handoffDecision, capabilities) {
  const notes = [];
  const documentCapability =
    capabilities[CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION] || null;
  const jobMatchingCapability =
    capabilities[CAREER_PRIVACY_ACTIONS.JOB_MATCHING] || null;

  if (handoffDecision?.handoffNeeded) {
    notes.push(`handoff:${handoffDecision.reasonCode}`);
  }

  if (documentCapability && documentCapability.allowed === false) {
    notes.push("documents_blocked_by_consent_or_policy");
  }

  if (jobMatchingCapability && jobMatchingCapability.allowed === false) {
    notes.push("job_matching_blocked_by_consent_or_policy");
  }

  if (getMetaValue(profile?.identity?.minor) === true) {
    notes.push("minor_context");
  }

  if (baseMode === CAREER_ECOUNSELLING_MODES.MULTI_STEP_SUPPORT) {
    notes.push("slower_multi_step_support");
  }

  return uniqueStrings(notes);
}

export function resolveCareerECounsellingMode(profile = {}, runtime = {}) {
  const supportNeed = computeSupportNeed(profile);
  const operationalHandoff = evaluateCareerHandoff(profile, runtime);
  const ethicalHandoff = evaluateCareerEthicalHandoff(profile, runtime);
  const handoffDecision = choosePrimaryHandoffDecision(
    operationalHandoff,
    ethicalHandoff
  );

  const relevantPrivacyActions = resolveRelevantPrivacyActions(runtime);
  const capabilities = buildPrivacyCapabilityMap(
    profile,
    runtime,
    relevantPrivacyActions
  );
  const blockedActions = buildBlockedActions(capabilities);

  const baseMode = inferBaseMode(profile, runtime);
  const mode = handoffDecision?.handoffNeeded
    ? CAREER_ECOUNSELLING_MODES.HANDOFF
    : baseMode;

  const modeRules = CAREER_ECOUNSELLING_MODE_RULES[mode];
  const missingConsentKeys = buildMissingConsentKeys(capabilities);
  const deniedConsentKeys = buildDeniedConsentKeys(capabilities);
  const documentCapability =
    capabilities[CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION] || null;
  const jobMatchingCapability =
    capabilities[CAREER_PRIVACY_ACTIONS.JOB_MATCHING] || null;

  return {
    mode,
    modeLabel: modeRules.label,
    supportNeed,
    handoffDecision,
    relevantPrivacyActions,
    privacyCapabilities: capabilities,
    blockedActions,
    missingConsentKeys,
    deniedConsentKeys,
    requiresHandoff: handoffDecision?.handoffNeeded === true,
    interactionRules: {
      ...modeRules,
      askForConfirmationWhenEvidenceWeak:
        modeRules.requireTighterConfirmation === true,
      allowDocumentSuggestion:
        modeRules.allowDocumentSuggestion &&
        (!documentCapability || documentCapability.allowed),
      allowJobMatching:
        mode !== CAREER_ECOUNSELLING_MODES.HANDOFF &&
        (!jobMatchingCapability || jobMatchingCapability.allowed),
    },
    notes: buildModeNotes(profile, baseMode, handoffDecision, capabilities),
  };
}

export function getCareerECounsellingModeRules(mode) {
  return CAREER_ECOUNSELLING_MODE_RULES[mode] || null;
}

export function buildCareerECounsellingModeBlock(profile = {}, runtime = {}) {
  const resolved = resolveCareerECounsellingMode(profile, runtime);

  const lines = [];
  lines.push(`Career e-counselling mode: ${resolved.mode}`);
  lines.push(`Mode label: ${resolved.modeLabel}`);
  lines.push(`Question strategy: ${resolved.interactionRules.questionStrategy}`);
  lines.push(`Response style: ${resolved.interactionRules.responseStyle}`);
  lines.push(`Max questions per turn: ${resolved.interactionRules.maxQuestionsPerTurn}`);
  lines.push(
    `Require tighter confirmation: ${resolved.interactionRules.requireTighterConfirmation ? "yes" : "no"}`
  );
  lines.push(
    `Allow document suggestion: ${resolved.interactionRules.allowDocumentSuggestion ? "yes" : "no"}`
  );
  lines.push(
    `Allow option comparison: ${resolved.interactionRules.allowOptionComparison ? "yes" : "no"}`
  );
  lines.push(
    `Allow job matching: ${resolved.interactionRules.allowJobMatching ? "yes" : "no"}`
  );

  if (resolved.blockedActions.length > 0) {
    lines.push(`Blocked actions: ${resolved.blockedActions.join(", ")}`);
  }

  if (resolved.missingConsentKeys.length > 0) {
    lines.push(`Missing consent keys: ${resolved.missingConsentKeys.join(", ")}`);
  }

  if (resolved.deniedConsentKeys.length > 0) {
    lines.push(`Denied consent keys: ${resolved.deniedConsentKeys.join(", ")}`);
  }

  if (resolved.handoffDecision?.handoffNeeded) {
    lines.push(`Handoff reason: ${resolved.handoffDecision.reasonCode}`);
    lines.push(`Handoff severity: ${resolved.handoffDecision.severity}`);
    lines.push(`Handoff channel: ${resolved.handoffDecision.recommendedChannel}`);
  }

  return lines.join("\n");
}
