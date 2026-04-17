// /lib/career-agent/ethics/careerHandoffRules.js

import {
  computeSupportNeed,
  getListItems,
} from "../profile/careerProfile.helpers.js";
import {
  RECOMMENDED_MODES,
  SUPPORT_LEVELS,
} from "../profile/careerProfile.schema.js";
import { getCareerHandoffText } from "../careerText.js";
import {
  CAREER_PRIVACY_ACTIONS,
  evaluateCareerPrivacyPermission,
} from "./careerPrivacyRules.js";

export const CAREER_HANDOFF_SEVERITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

export const CAREER_HANDOFF_CHANNELS = Object.freeze({
  HUMAN_COUNSELLOR: "human_counsellor",
  CRISIS_SERVICE: "crisis_service",
  SUPPORT_PERSON: "support_person",
  EXTERNAL_SPECIALIST: "external_specialist",
  STOP_FLOW: "stop_flow",
});

export const CAREER_HANDOFF_REASONS = Object.freeze({
  CRISIS_RISK: "CRISIS_RISK",
  HIGH_DISTRESS: "HIGH_DISTRESS",
  HUMAN_ASSESSMENT_NEEDED: "HUMAN_ASSESSMENT_NEEDED",
  COMPLEX_BARRIER_SET: "COMPLEX_BARRIER_SET",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  MINOR_NEEDS_ADDITIONAL_SUPPORT: "MINOR_NEEDS_ADDITIONAL_SUPPORT",
  TESTING_BLOCKED_BY_GUARDIAN_CONSENT: "TESTING_BLOCKED_BY_GUARDIAN_CONSENT",
  REQUIRED_PRIVACY_CONSENT_DENIED: "REQUIRED_PRIVACY_CONSENT_DENIED",
  STRONG_RESISTANCE_OR_MISMATCH: "STRONG_RESISTANCE_OR_MISMATCH",
});

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

function getHandoffLocaleText(options = {}) {
  const locale =
    options.locale || options.documentLanguage || options.language || "et";
  return getCareerHandoffText(locale);
}

function countConstraints(profile = {}) {
  return (
    getListItems(profile?.workStatus?.mobilityConstraints, []).length +
    getListItems(profile?.workStatus?.otherConstraints, []).length
  );
}

function hasStrongMismatchSignal(runtime = {}) {
  return (
    runtime.userRejectedAllSuggestions === true ||
    runtime.strongResistance === true ||
    runtime.advisorMismatch === true
  );
}

function hasStructuralDeepHandoffNeed(supportNeed = {}) {
  const reasonTags = toSafeArray(supportNeed?.reasonTags);
  return reasonTags.includes("multiple_constraints");
}

function buildReasonPayload({
  reasonCode,
  severity,
  recommendedChannel,
  message,
  notes = [],
}) {
  return {
    handoffNeeded: true,
    reasonCode,
    severity,
    recommendedChannel,
    message,
    notes: uniqueStrings(notes),
  };
}

function buildNoHandoffPayload() {
  return {
    handoffNeeded: false,
    reasonCode: null,
    severity: null,
    recommendedChannel: null,
    message: null,
    notes: [],
  };
}

function evaluatePrivacyLinkedHandoff(profile, runtime = {}) {
  const text = getHandoffLocaleText(runtime);
  const requestedAction = runtime.requestedPrivacyAction || null;
  if (!requestedAction) return null;

  const permission = evaluateCareerPrivacyPermission(
    profile,
    requestedAction,
    runtime.privacyOptions || {}
  );

  if (permission.allowed) {
    return null;
  }

  if (
    requestedAction === CAREER_PRIVACY_ACTIONS.TESTING &&
    permission.blockedByGuardianConsent
  ) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.TESTING_BLOCKED_BY_GUARDIAN_CONSENT,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.SUPPORT_PERSON,
      message: text.general.testingBlockedByGuardianConsent,
      notes: permission.missingDecisionKeys,
    });
  }

  if (permission.deniedDecisionKeys.length > 0) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.REQUIRED_PRIVACY_CONSENT_DENIED,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.STOP_FLOW,
      message: text.general.requiredPrivacyConsentDenied,
      notes: permission.deniedDecisionKeys,
    });
  }

  return null;
}

export function detectCareerHandoffReason(profile = {}, runtime = {}) {
  const text = getHandoffLocaleText(runtime);

  if (runtime.forceHandoff === true && runtime.forceHandoffReason) {
    return buildReasonPayload({
      reasonCode: runtime.forceHandoffReason,
      severity: runtime.forceHandoffSeverity || CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel:
        runtime.forceHandoffChannel || CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: runtime.forceHandoffMessage || text.general.forcedHandoffDefault,
      notes: toSafeArray(runtime.forceHandoffNotes),
    });
  }

  const privacyLinked = evaluatePrivacyLinkedHandoff(profile, runtime);
  if (privacyLinked) {
    return privacyLinked;
  }

  const supportNeed = computeSupportNeed(profile);

  if (
    supportNeed.level === SUPPORT_LEVELS.DEEP &&
    supportNeed.recommendedMode === RECOMMENDED_MODES.HANDOFF &&
    hasStructuralDeepHandoffNeed(supportNeed)
  ) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.HUMAN_ASSESSMENT_NEEDED,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.humanAssessmentNeeded,
      notes: supportNeed.reasonTags,
    });
  }

  if (countConstraints(profile) >= 3) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.COMPLEX_BARRIER_SET,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.complexBarrierSet,
      notes: ["multiple_constraints"],
    });
  }

  if (hasStrongMismatchSignal(runtime)) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.STRONG_RESISTANCE_OR_MISMATCH,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.strongResistanceOrMismatch,
      notes: ["suggestion_mismatch"],
    });
  }

  return buildNoHandoffPayload();
}

export function shouldTriggerCareerHandoff(profile = {}, runtime = {}) {
  const decision = detectCareerHandoffReason(profile, runtime);
  return decision.handoffNeeded === true;
}

export function evaluateCareerHandoff(profile = {}, runtime = {}) {
  return detectCareerHandoffReason(profile, runtime);
}
