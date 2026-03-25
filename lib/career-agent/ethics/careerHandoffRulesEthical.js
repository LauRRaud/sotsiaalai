// /lib/career-agent/ethics/careerHandoffRulesEthical.js

import {
  getMetaValue,
  getListItems,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import { getCareerHandoffText } from "../careerText.js";
import {
  CAREER_HANDOFF_CHANNELS,
  CAREER_HANDOFF_SEVERITY,
} from "./careerHandoffRules.js";
import {
  CAREER_PRIVACY_ACTIONS,
  evaluateCareerPrivacyPermission,
  isMinorProfile,
} from "./careerPrivacyRules.js";

export const CAREER_ETHICAL_HANDOFF_REASONS = Object.freeze({
  LEGAL_OR_FORMAL_DECISION_REQUEST: "LEGAL_OR_FORMAL_DECISION_REQUEST",
  THIRD_PARTY_REPRESENTATION_REQUEST: "THIRD_PARTY_REPRESENTATION_REQUEST",
  DECEPTIVE_OR_IMPERSONATION_REQUEST: "DECEPTIVE_OR_IMPERSONATION_REQUEST",
  SHARING_WITHOUT_VALID_CONSENT: "SHARING_WITHOUT_VALID_CONSENT",
  JOB_MATCHING_WITHOUT_VALID_CONSENT: "JOB_MATCHING_WITHOUT_VALID_CONSENT",
  DOCUMENT_GENERATION_WITHOUT_VALID_CONSENT: "DOCUMENT_GENERATION_WITHOUT_VALID_CONSENT",
  PRIVACY_CONSENT_DENIED: "PRIVACY_CONSENT_DENIED",
  TESTING_ETHICS_LIMIT: "TESTING_ETHICS_LIMIT",
  MINOR_CONTEXT_REQUIRES_ADULT_PARTICIPATION: "MINOR_CONTEXT_REQUIRES_ADULT_PARTICIPATION",
  IDENTITY_OR_CONTEXT_TOO_UNCLEAR: "IDENTITY_OR_CONTEXT_TOO_UNCLEAR",
  ROLE_CONFUSION_OR_OVERRELIANCE: "ROLE_CONFUSION_OR_OVERRELIANCE",
  HIGH_STAKES_HUMAN_REVIEW_NEEDED: "HIGH_STAKES_HUMAN_REVIEW_NEEDED",
  SPECIALIST_COLLABORATION_NEEDED: "SPECIALIST_COLLABORATION_NEEDED",
});

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
  return (
    coerceString(
      runtime.userMessage ||
        runtime.lastUserMessage ||
        runtime.latestUserText ||
        runtime.freeText
    ) || ""
  );
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

function requestsFormalDecision(runtime = {}) {
  if (
    runtime.asksForFormalDecision === true ||
    runtime.asksForOfficialEligibilityDecision === true ||
    runtime.asksForLegalOutcome === true ||
    runtime.asksForBindingDecision === true
  ) {
    return true;
  }

  const text = normalizeText(getUserText(runtime));
  if (!text) return false;

  const patterns = [
    "ametlik otsus",
    "siduv otsus",
    "kas mul on kindlasti oigus",
    "kas mul on kindlasti õigus",
    "tee minu eest otsus",
    "official decision",
    "binding decision",
    "legal outcome",
    "guarantee eligibility",
  ];

  return includesAny(text, patterns);
}

function requestsThirdPartyRepresentation(runtime = {}) {
  return (
    runtime.requestsThirdPartyRepresentation === true ||
    runtime.asksAssistantToPretendUser === true ||
    runtime.asksAssistantToSpeakAsUser === true
  );
}

function requestsDeceptiveOrImpersonationUse(runtime = {}) {
  return (
    runtime.requestsImpersonation === true ||
    runtime.requestsDeceptiveUse === true ||
    runtime.requestsFakeRepresentation === true
  );
}

function hasRoleConfusion(runtime = {}) {
  return (
    runtime.roleConfusion === true ||
    runtime.userTreatsAssistantAsOfficialDecisionMaker === true ||
    runtime.userBelievesAssistantIsHumanCounsellor === true ||
    runtime.overrelianceSignal === true
  );
}

function needsHighStakesHumanReview(runtime = {}) {
  return (
    runtime.highStakesDecisionRequested === true ||
    runtime.highImpactOutcome === true ||
    runtime.formalSubmissionRisk === true
  );
}

function needsSpecialistCollaboration(runtime = {}) {
  return (
    runtime.requiresSpecialistCollaboration === true ||
    runtime.multiAgencyCase === true ||
    runtime.externalServiceCoordinationNeeded === true
  );
}

function hasTooLittleReliableContext(profile = {}, runtime = {}) {
  if (runtime.identityUnclear === true || runtime.contextTooUnclear === true) {
    return true;
  }

  const missingInformationCount = getListItems(
    profile?.recommendationContext?.missingInformation,
    []
  ).length;

  const hasGoal = hasMeaningfulValue(getMetaValue(profile?.goals?.primaryGoal));
  const hasDirection =
    getListItems(profile?.directions?.immediateTargets, []).length > 0;
  const hasExperience =
    getListItems(profile?.experience?.roles, []).length > 0;

  return missingInformationCount >= 7 && !hasGoal && !hasDirection && !hasExperience;
}

function mapPrivacyActionToEthicalReason(requestedAction) {
  switch (requestedAction) {
    case CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES:
      return CAREER_ETHICAL_HANDOFF_REASONS.SHARING_WITHOUT_VALID_CONSENT;

    case CAREER_PRIVACY_ACTIONS.JOB_MATCHING:
      return CAREER_ETHICAL_HANDOFF_REASONS.JOB_MATCHING_WITHOUT_VALID_CONSENT;

    case CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION:
      return CAREER_ETHICAL_HANDOFF_REASONS.DOCUMENT_GENERATION_WITHOUT_VALID_CONSENT;

    default:
      return CAREER_ETHICAL_HANDOFF_REASONS.PRIVACY_CONSENT_DENIED;
  }
}

function evaluatePrivacyEthicsHandoff(profile, runtime = {}) {
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

  if (requestedAction === CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES) {
    return buildReasonPayload({
      reasonCode: CAREER_ETHICAL_HANDOFF_REASONS.SHARING_WITHOUT_VALID_CONSENT,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.STOP_FLOW,
      message: text.ethical.sharingWithoutValidConsent,
      notes: [
        ...permission.missingDecisionKeys,
        ...permission.deniedDecisionKeys,
      ],
    });
  }

  if (requestedAction === CAREER_PRIVACY_ACTIONS.TESTING) {
    return buildReasonPayload({
      reasonCode: CAREER_ETHICAL_HANDOFF_REASONS.TESTING_ETHICS_LIMIT,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: isMinorProfile(profile)
        ? CAREER_HANDOFF_CHANNELS.SUPPORT_PERSON
        : CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.ethical.testingEthicsLimit,
      notes: [
        ...permission.missingDecisionKeys,
        ...permission.deniedDecisionKeys,
      ],
    });
  }

  if (permission.deniedDecisionKeys.length > 0) {
    return buildReasonPayload({
      reasonCode: mapPrivacyActionToEthicalReason(requestedAction),
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.STOP_FLOW,
      message: text.ethical.privacyConsentDenied,
      notes: permission.deniedDecisionKeys,
    });
  }

  return null;
}

export function detectCareerEthicalHandoffReason(profile = {}, runtime = {}) {
  const text = getHandoffLocaleText(runtime);
  if (requestsDeceptiveOrImpersonationUse(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.DECEPTIVE_OR_IMPERSONATION_REQUEST,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.STOP_FLOW,
      message: text.ethical.deceptiveOrImpersonationRequest,
      notes: ["deceptive_or_impersonation_request"],
    });
  }

  if (requestsThirdPartyRepresentation(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.THIRD_PARTY_REPRESENTATION_REQUEST,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.ethical.thirdPartyRepresentationRequest,
      notes: ["third_party_representation"],
    });
  }

  const privacyLinked = evaluatePrivacyEthicsHandoff(profile, runtime);
  if (privacyLinked) {
    return privacyLinked;
  }

  if (requestsFormalDecision(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.LEGAL_OR_FORMAL_DECISION_REQUEST,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.EXTERNAL_SPECIALIST,
      message: text.ethical.legalOrFormalDecisionRequest,
      notes: ["formal_or_binding_decision_requested"],
    });
  }

  if (
    isMinorProfile(profile) &&
    (runtime.requiresAdultParticipation === true ||
      runtime.highStakesDecisionRequested === true)
  ) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.MINOR_CONTEXT_REQUIRES_ADULT_PARTICIPATION,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.SUPPORT_PERSON,
      message: text.ethical.minorContextRequiresAdultParticipation,
      notes: ["minor_user", "adult_participation_needed"],
    });
  }

  if (hasTooLittleReliableContext(profile, runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.IDENTITY_OR_CONTEXT_TOO_UNCLEAR,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.ethical.identityOrContextTooUnclear,
      notes: ["context_too_unclear"],
    });
  }

  if (hasRoleConfusion(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.ROLE_CONFUSION_OR_OVERRELIANCE,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.ethical.roleConfusionOrOverreliance,
      notes: ["role_confusion_or_overreliance"],
    });
  }

  if (needsHighStakesHumanReview(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.HIGH_STAKES_HUMAN_REVIEW_NEEDED,
      severity: CAREER_HANDOFF_SEVERITY.HIGH,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.HUMAN_COUNSELLOR,
      message: text.ethical.highStakesHumanReviewNeeded,
      notes: ["high_stakes_human_review"],
    });
  }

  if (needsSpecialistCollaboration(runtime)) {
    return buildReasonPayload({
      reasonCode:
        CAREER_ETHICAL_HANDOFF_REASONS.SPECIALIST_COLLABORATION_NEEDED,
      severity: CAREER_HANDOFF_SEVERITY.MEDIUM,
      recommendedChannel: CAREER_HANDOFF_CHANNELS.EXTERNAL_SPECIALIST,
      message: text.ethical.specialistCollaborationNeeded,
      notes: ["specialist_collaboration_needed"],
    });
  }

  return buildNoHandoffPayload();
}

export function shouldTriggerCareerEthicalHandoff(profile = {}, runtime = {}) {
  const decision = detectCareerEthicalHandoffReason(profile, runtime);
  return decision.handoffNeeded === true;
}

export function evaluateCareerEthicalHandoff(profile = {}, runtime = {}) {
  return detectCareerEthicalHandoffReason(profile, runtime);
}
