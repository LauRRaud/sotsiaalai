// /lib/career-agent/ethics/careerPrivacyRules.js

import {
  getMetaValue,
  getMetaStatus,
} from "../profile/careerProfile.helpers.js";
import { PROFILE_STATUS } from "../profile/careerProfile.schema.js";
import { getCareerPrivacyText } from "../i18n/careerPrivacyText.js";

export const CAREER_PRIVACY_ACTIONS = Object.freeze({
  STORE_PROFILE: "store_profile",
  JOB_MATCHING: "job_matching",
  DOCUMENT_GENERATION: "document_generation",
  TESTING: "testing",
  SHARE_WITH_THIRD_PARTIES: "share_with_third_parties",
  RETAIN_RAW_CV: "retain_raw_cv",
});

export const CAREER_PRIVACY_DECISION_KEYS = Object.freeze({
  PROFILE_STORAGE: "profileStorageApproved",
  JOB_MATCHING: "jobMatchingApproved",
  DOCUMENT_GENERATION: "documentGenerationApproved",
  TESTING: "testingApproved",
  MINOR_GUARDIAN: "minorGuardianConsent",
  SHARE_WITH_THIRD_PARTIES: "shareWithThirdPartiesApproved",
});

export const CAREER_PRIVACY_POLICY = Object.freeze({
  requireConfirmedConsent: true,
  storeStructuredProfileOnlyByDefault: true,
  rawCvDefaultRetention: false,
  requireGuardianConsentForMinorTesting: true,
  requireExplicitConsentForJobMatching: true,
  requireExplicitConsentForDocumentGeneration: true,
  requireExplicitConsentForThirdPartySharing: true,
});

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

function getPrivacyLocaleText(options = {}) {
  const locale =
    options.locale || options.documentLanguage || options.language || "et";
  return getCareerPrivacyText(locale);
}

function consentField(profile, decisionKey) {
  return profile?.consent?.[decisionKey] || null;
}

export function isConfirmedConsent(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    typeof getMetaValue(field) === "boolean"
  );
}

export function isApprovedConsent(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getMetaValue(field) === true
  );
}

export function isDeniedConsent(field) {
  return (
    getMetaStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getMetaValue(field) === false
  );
}

export function isMinorProfile(profile) {
  return getMetaValue(profile?.identity?.minor) === true;
}

export function getPrivacyDecisionState(profile, decisionKey) {
  const field = consentField(profile, decisionKey);

  return {
    key: decisionKey,
    status: getMetaStatus(field),
    value: getMetaValue(field),
    confirmed: isConfirmedConsent(field),
    approved: isApprovedConsent(field),
    denied: isDeniedConsent(field),
  };
}

export function getCareerPrivacyDecisionSummary(profile) {
  return {
    profileStorage: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.PROFILE_STORAGE
    ),
    jobMatching: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.JOB_MATCHING
    ),
    documentGeneration: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.DOCUMENT_GENERATION
    ),
    testing: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.TESTING
    ),
    minorGuardianConsent: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.MINOR_GUARDIAN
    ),
    shareWithThirdParties: getPrivacyDecisionState(
      profile,
      CAREER_PRIVACY_DECISION_KEYS.SHARE_WITH_THIRD_PARTIES
    ),
  };
}

export function getRequiredPrivacyDecisions(action, profile, options = {}) {
  const required = [];

  switch (action) {
    case CAREER_PRIVACY_ACTIONS.STORE_PROFILE:
      required.push(CAREER_PRIVACY_DECISION_KEYS.PROFILE_STORAGE);
      break;

    case CAREER_PRIVACY_ACTIONS.JOB_MATCHING:
      required.push(CAREER_PRIVACY_DECISION_KEYS.JOB_MATCHING);
      break;

    case CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION:
      required.push(CAREER_PRIVACY_DECISION_KEYS.DOCUMENT_GENERATION);
      break;

    case CAREER_PRIVACY_ACTIONS.TESTING:
      required.push(CAREER_PRIVACY_DECISION_KEYS.TESTING);

      if (
        CAREER_PRIVACY_POLICY.requireGuardianConsentForMinorTesting &&
        isMinorProfile(profile)
      ) {
        required.push(CAREER_PRIVACY_DECISION_KEYS.MINOR_GUARDIAN);
      }
      break;

    case CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES:
      required.push(CAREER_PRIVACY_DECISION_KEYS.SHARE_WITH_THIRD_PARTIES);
      break;

    case CAREER_PRIVACY_ACTIONS.RETAIN_RAW_CV:
      if (options.requireExplicitRawCvConsent === true) {
        required.push(CAREER_PRIVACY_DECISION_KEYS.PROFILE_STORAGE);
      }
      break;

    default:
      break;
  }

  return uniqueStrings(required);
}

export function evaluateCareerPrivacyPermission(
  profile,
  action,
  options = {}
) {
  const text = getPrivacyLocaleText(options);

  if (action === CAREER_PRIVACY_ACTIONS.RETAIN_RAW_CV) {
    return {
      action,
      allowed: false,
      requiredDecisionKeys: [],
      missingDecisionKeys: [],
      deniedDecisionKeys: [],
      blockedByPolicy: true,
      blockedByGuardianConsent: false,
      reason: text.rawCvRetentionNotAllowed,
    };
  }

  const requiredDecisionKeys = getRequiredPrivacyDecisions(
    action,
    profile,
    options
  );

  const missingDecisionKeys = [];
  const deniedDecisionKeys = [];

  for (const decisionKey of requiredDecisionKeys) {
    const state = getPrivacyDecisionState(profile, decisionKey);

    if (!state.confirmed) {
      missingDecisionKeys.push(decisionKey);
      continue;
    }

    if (!state.approved) {
      deniedDecisionKeys.push(decisionKey);
    }
  }

  const blockedByGuardianConsent =
    deniedDecisionKeys.includes(CAREER_PRIVACY_DECISION_KEYS.MINOR_GUARDIAN) ||
    missingDecisionKeys.includes(CAREER_PRIVACY_DECISION_KEYS.MINOR_GUARDIAN);

  const allowed =
    missingDecisionKeys.length === 0 &&
    deniedDecisionKeys.length === 0;

  let reason = null;

  if (deniedDecisionKeys.length > 0) {
    reason = text.requiredConsentDenied;
  } else if (missingDecisionKeys.length > 0) {
    reason = text.requiredConsentMissing;
  }

  return {
    action,
    allowed,
    requiredDecisionKeys,
    missingDecisionKeys,
    deniedDecisionKeys,
    blockedByPolicy: false,
    blockedByGuardianConsent,
    reason,
  };
}

export function canStoreCareerProfile(profile, options = {}) {
  return evaluateCareerPrivacyPermission(
    profile,
    CAREER_PRIVACY_ACTIONS.STORE_PROFILE,
    options
  );
}

export function canUseCareerProfileForJobMatching(profile, options = {}) {
  return evaluateCareerPrivacyPermission(
    profile,
    CAREER_PRIVACY_ACTIONS.JOB_MATCHING,
    options
  );
}

export function canGenerateCareerDocuments(profile, options = {}) {
  return evaluateCareerPrivacyPermission(
    profile,
    CAREER_PRIVACY_ACTIONS.DOCUMENT_GENERATION,
    options
  );
}

export function canRunCareerTesting(profile, options = {}) {
  return evaluateCareerPrivacyPermission(
    profile,
    CAREER_PRIVACY_ACTIONS.TESTING,
    options
  );
}

export function canShareCareerData(profile, options = {}) {
  return evaluateCareerPrivacyPermission(
    profile,
    CAREER_PRIVACY_ACTIONS.SHARE_WITH_THIRD_PARTIES,
    options
  );
}

export function shouldRetainRawCv(_profile, _options = {}) {
  const text = getPrivacyLocaleText(_options);
  return {
    action: CAREER_PRIVACY_ACTIONS.RETAIN_RAW_CV,
    allowed: false,
    requiredDecisionKeys: [],
    missingDecisionKeys: [],
    deniedDecisionKeys: [],
    blockedByPolicy: true,
    blockedByGuardianConsent: false,
    reason: text.rawCvRetentionDisabledByDefault,
  };
}

export function buildCareerPrivacyNotice(profile) {
  const summary = getCareerPrivacyDecisionSummary(profile);

  return {
    policy: CAREER_PRIVACY_POLICY,
    summary,
    canStoreProfile: canStoreCareerProfile(profile),
    canJobMatch: canUseCareerProfileForJobMatching(profile),
    canGenerateDocuments: canGenerateCareerDocuments(profile),
    canRunTesting: canRunCareerTesting(profile),
    canShareWithThirdParties: canShareCareerData(profile),
    rawCvRetention: shouldRetainRawCv(profile),
  };
}
