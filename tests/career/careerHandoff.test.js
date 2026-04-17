import test from "node:test";
import assert from "node:assert/strict";

const { createEmptyCareerProfile } = await import("../../lib/career-agent/profile/careerProfile.schema.js");
const {
  computeSupportNeed,
  mergeProfilePatch,
} = await import("../../lib/career-agent/profile/careerProfile.helpers.js");
const { evaluateCareerHandoff } = await import("../../lib/career-agent/ethics/careerHandoffRules.js");

function buildProfile(patch = {}) {
  return mergeProfilePatch(createEmptyCareerProfile(), patch);
}

test("high urgency with high income pressure uses multi-step support instead of automatic handoff", () => {
  const profile = buildProfile({
    goals: {
      urgency: "urgent",
      incomePressure: "very_high",
    },
  });

  const supportNeed = computeSupportNeed(profile);

  assert.equal(supportNeed.level, "moderate");
  assert.equal(supportNeed.recommendedMode, "multi_step_support");
});

test("high urgency with high income pressure no longer triggers human handoff by itself", () => {
  const profile = buildProfile({
    goals: {
      urgency: "urgent",
      incomePressure: "very_high",
    },
  });

  const handoff = evaluateCareerHandoff(profile, {
    userMessage: "Mul on kiiresti vaja uut tood, sest rahaline surve on suur.",
  });

  assert.equal(handoff.handoffNeeded, false);
  assert.equal(handoff.reasonCode, null);
});

test("multiple structural constraints still trigger human handoff", () => {
  const profile = buildProfile({
    workStatus: {
      mobilityConstraints: [
        "ei saa autoga liikuda",
        "saan tootada ainult kodu lahedal",
      ],
      otherConstraints: ["sobib ainult osakoormus"],
    },
  });

  const handoff = evaluateCareerHandoff(profile, {
    userMessage: "Mul on mitu praktilist piirangut ja vajan abi.",
  });

  assert.equal(handoff.handoffNeeded, true);
  assert.equal(handoff.reasonCode, "HUMAN_ASSESSMENT_NEEDED");
});

test("crisis wording alone does not trigger automatic handoff", () => {
  const profile = buildProfile();

  const handoff = evaluateCareerHandoff(profile, {
    userMessage: "Mul on kriis ja vaga raske, aga tahan aru saada mis amet mulle sobiks.",
    highDistress: true,
  });

  assert.equal(handoff.handoffNeeded, false);
  assert.equal(handoff.reasonCode, null);
});

test("insufficient evidence alone does not trigger automatic handoff", () => {
  const profile = buildProfile({
    recommendationContext: {
      missingInformation: [
        "kogemus",
        "oskused",
        "eesmark",
        "asukoht",
        "haridus",
        "piirangud",
        "toovorm",
      ],
    },
  });

  const handoff = evaluateCareerHandoff(profile, {
    userMessage: "Ma ei tea veel tapselt, mida teha.",
    insufficientEvidence: true,
  });

  assert.equal(handoff.handoffNeeded, false);
  assert.equal(handoff.reasonCode, null);
});
