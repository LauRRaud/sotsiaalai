import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCareerPersistencePlan,
  canRetainCareerRawCv,
  canRunCareerTesting,
  canUseCareerService,
  resolveCareerPrivacyPolicy
} from "../../lib/career/privacyRules.js";

function buildProfile(overrides = {}) {
  return {
    accountId: "user-1",
    identity: {
      minor: {
        value: false,
        source: "system_derived",
        status: "confirmed"
      }
    },
    recommendationContext: {
      confirmedByUser: true
    },
    privacy: {
      rawCvRetained: false,
      explicitRawCvRetentionConsent: false,
      consentForTesting: false,
      minorGuardianConsent: false,
      shareWithThirdParties: false
    },
    ...overrides
  };
}

test("privacy policy blocks service when account is missing", () => {
  const policy = resolveCareerPrivacyPolicy({
    profile: {
      recommendationContext: {
        confirmedByUser: false
      }
    }
  });

  assert.equal(canUseCareerService({ profile: {} }), false);
  assert.equal(policy.shouldBlockService, true);
  assert.equal(policy.missingRequirements.includes("accountId"), true);
  assert.equal(policy.explainInferenceToUser, true);
  assert.equal(policy.avoidOpaqueRecommendationLogic, true);
  assert.equal(policy.restrictSensitiveLogging, true);
  assert.equal(policy.fairnessReviewRequiredForRecommendationLogic, true);
});

test("raw CV retention stays off without explicit consent", () => {
  const profile = buildProfile({
    privacy: {
      rawCvRetained: true,
      explicitRawCvRetentionConsent: false
    }
  });

  assert.equal(canRetainCareerRawCv({ profile }), false);

  const plan = buildCareerPersistencePlan({
    profile: buildProfile({
      privacy: {
        rawCvRetained: true,
        explicitRawCvRetentionConsent: true
      }
    })
  });

  assert.equal(plan.storeStructuredProfile, true);
  assert.equal(plan.storeRawCv, true);
  assert.equal(plan.storageScope, "structured_profile_and_raw_cv");
});

test("adult testing requires explicit testing consent", () => {
  const profile = buildProfile();

  assert.equal(canRunCareerTesting({ profile, requestedTesting: true }), false);
  assert.equal(
    canRunCareerTesting({
      profile: buildProfile({
        privacy: {
          consentForTesting: true
        }
      }),
      requestedTesting: true
    }),
    true
  );
});

test("minor testing requires both testing consent and guardian consent", () => {
  const profile = buildProfile({
    identity: {
      minor: {
        value: true,
        source: "from_user",
        status: "confirmed"
      }
    },
    privacy: {
      consentForTesting: true,
      minorGuardianConsent: false
    }
  });

  const blocked = resolveCareerPrivacyPolicy({
    profile,
    requestedTesting: true
  });
  const allowed = resolveCareerPrivacyPolicy({
    profile: buildProfile({
      identity: {
        minor: {
          value: true,
          source: "from_user",
          status: "confirmed"
        }
      },
      privacy: {
        consentForTesting: true,
        minorGuardianConsent: true
      }
    }),
    requestedTesting: true
  });

  assert.equal(blocked.testingAllowed, false);
  assert.equal(blocked.missingRequirements.includes("privacy.minorGuardianConsent"), true);
  assert.equal(allowed.testingAllowed, true);
});
