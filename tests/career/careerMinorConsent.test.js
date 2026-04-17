import test from "node:test";
import assert from "node:assert/strict";

const { createEmptyCareerProfile } = await import("../../lib/career-agent/profile/careerProfile.schema.js");
const {
  mergeProfilePatch,
  computeSupportNeed,
} = await import("../../lib/career-agent/profile/careerProfile.helpers.js");
const {
  getRequiredPrivacyDecisions,
  CAREER_PRIVACY_ACTIONS,
} = await import("../../lib/career-agent/ethics/careerPrivacyRules.js");
const { evaluateCareerHandoff } = await import("../../lib/career-agent/ethics/careerHandoffRules.js");
const { evaluateCareerEthicalHandoff } = await import("../../lib/career-agent/ethics/careerHandoffRulesEthical.js");
const { resolveCareerTurn } = await import("../../lib/career-agent/core/careerOrchestrator.js");

function buildProfile(patch = {}) {
  return mergeProfilePatch(createEmptyCareerProfile(), patch);
}

test("minor profile does not automatically escalate to handoff", () => {
  const profile = buildProfile({
    identity: {
      minor: true,
    },
  });

  const supportNeed = computeSupportNeed(profile);
  const handoff = evaluateCareerHandoff(profile, {
    userMessage: "Soovin abi, et aru saada, mis amet mulle sobiks.",
  });

  assert.equal(supportNeed.recommendedMode, "quick_guidance");
  assert.equal(handoff.handoffNeeded, false);
});

test("minor testing flow requires only the minor's own testing consent", () => {
  const profile = buildProfile({
    identity: {
      minor: true,
    },
  });

  const required = getRequiredPrivacyDecisions(
    CAREER_PRIVACY_ACTIONS.TESTING,
    profile
  );

  assert.deepEqual(required, ["testingApproved"]);
});

test("minor high-stakes request does not trigger minor-specific ethical handoff by itself", () => {
  const profile = buildProfile({
    identity: {
      minor: true,
    },
  });

  const handoff = evaluateCareerEthicalHandoff(profile, {
    userMessage: "Soovin soovitust, mis amet mulle sobiks.",
    highStakesDecisionRequested: true,
  });

  assert.notEqual(handoff.reasonCode, "MINOR_CONTEXT_REQUIRES_ADULT_PARTICIPATION");
});

test("minor testing turn asks only for testing consent and can continue after self-consent", async () => {
  const initial = await resolveCareerTurn({
    profile: {
      identity: {
        minor: true,
      },
    },
    runtime: {
      userMessage: "Soovin teha karjääritesti.",
      requiresTesting: true,
    },
  });

  assert.equal(initial.currentState, "agreements");
  assert.deepEqual(
    initial.questions?.map((question) => question.id),
    ["consent_testing"]
  );

  const afterConsent = await resolveCareerTurn({
    profile: {
      identity: {
        minor: true,
        consent: {
          testingApproved: true,
        },
      },
    },
    runtime: {
      userMessage: "Soovin teha karjääritesti.",
      requiresTesting: true,
      agreementsAccepted: true,
    },
  });

  assert.notEqual(afterConsent.response?.kind, "handoff");
});
