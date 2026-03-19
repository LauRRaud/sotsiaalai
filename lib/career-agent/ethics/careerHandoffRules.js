// /lib/career-agent/ethics/careerHandoffRules.js


import {
  computeSupportNeed,
  getMetaValue,
  getListItems,
} from "../profile/careerProfile.helpers.js";
import {
  RECOMMENDED_MODES,
  SUPPORT_LEVELS,
} from "../profile/careerProfile.schema.js";
import { getCareerHandoffText } from "../i18n/careerHandoffText.js";
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

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
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

function getHandoffLocaleText(options = {}) {
  const locale =
    options.locale || options.documentLanguage || options.language || "et";
  return getCareerHandoffText(locale);
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

function includesAny(text, patterns = []) {
  return patterns.some((pattern) => text.includes(pattern));
}

function getUserText(runtime = {}) {
  return coerceString(
    runtime.userMessage ||
      runtime.lastUserMessage ||
      runtime.latestUserText ||
      runtime.freeText
  ) || "";
}

function detectCrisisRisk(runtime = {}) {
  const text = normalizeText(getUserText(runtime));
  if (!text) return false;

  const crisisPatterns = [
    "enesetapp",
    "tapan ennast",
    "ei taha elada",
    "ei jaksa elada",
    "self harm",
    "suicide",
    "kill myself",
    "hurt myself",
    "immediate danger",
    "vahetu oht",
    "mind lüüakse",
    "vägivald kodus",
    "olen ohus",
  ];

  return includesAny(text, crisisPatterns);
}

function detectHighDistress(runtime = {}) {
  if (runtime.highDistress === true) return true;

  const text = normalizeText(getUserText(runtime));
  if (!text) return false;

  const distressPatterns = [
    "paanikas",
    "täiesti katki",
    "ei saa hakkama",
    "olen läbi",
    "everything is falling apart",
    "panic",
    "overwhelmed",
    "i cant cope",
  ];

  return includesAny(text, distressPatterns);
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

function hasInsufficientEvidence(profile = {}, runtime = {}) {
  if (runtime.insufficientEvidence === true) return true;

  const missingCount = getListItems(
    profile?.recommendationContext?.missingInformation,
    []
  ).length;

  const confirmedDirections = getListItems(profile?.directions?.immediateTargets, []).length;
  const confirmedSkills =
    getListItems(profile?.skills?.domainSkills, []).length +
    getListItems(profile?.skills?.transferableSkills, []).length;

  return missingCount >= 6 && confirmedDirections === 0 && confirmedSkills === 0;
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

  if (detectCrisisRisk(runtime)) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.CRISIS_RISK,
      severity: CAREER_HANDOFF_SEVERITY.CRITICAL,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.CRISIS_SERVICE,
      message: text.general.crisisRisk,
      notes: ["immediate_safety_check"],
    });
  }

  const privacyLinked = evaluatePrivacyLinkedHandoff(profile, runtime);
  if (privacyLinked) {
    return privacyLinked;
  }

  if (detectHighDistress(runtime)) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.HIGH_DISTRESS,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.highDistress,
      notes: ["high_distress_signal"],
    });
  }

  const supportNeed = computeSupportNeed(profile);

  if (
    supportNeed.level === SUPPORT_LEVELS.DEEP &&
    supportNeed.recommendedMode === RECOMMENDED_MODES.HANDOFF
  ) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.HUMAN_ASSESSMENT_NEEDED,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.humanAssessmentNeeded,
      notes: supportNeed.reasonTags,
    });
  }

  if (getMetaValue(profile?.identity?.minor) === true && runtime.requiresTesting === true) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.MINOR_NEEDS_ADDITIONAL_SUPPORT,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.SUPPORT_PERSON,
      message: text.general.minorNeedsAdditionalSupport,
      notes: ["minor_user", "testing_context"],
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

  if (hasInsufficientEvidence(profile, runtime)) {
    return buildReasonPayload({
      reasonCode: CAREER_HANDOFF_REASONS.INSUFFICIENT_EVIDENCE,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.general.insufficientEvidence,
      notes: ["insufficient_profile_evidence"],
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
