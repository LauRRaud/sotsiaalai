import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveCareerMinorMode,
  getCareerQuestionBatchSize,
  shouldAvoidImmediateApplicationPrompt
} from "../../lib/career/minorMode.js";

test("minor mode enables slower exploratory behavior", () => {
  const mode = deriveCareerMinorMode({
    profile: {
      identity: {
        minor: {
          value: true,
          source: "from_user",
          status: "confirmed"
        }
      },
      privacy: {
        consentForTesting: false,
        minorGuardianConsent: false
      }
    }
  });

  assert.equal(mode.enabled, true);
  assert.equal(mode.pacing, "slow");
  assert.equal(mode.questionBatchSize, 1);
  assert.equal(mode.explorationFirst, true);
  assert.equal(mode.preferOpenQuestions, true);
  assert.equal(mode.accountForLearningStyles, true);
  assert.equal(mode.accountForInclusionNeeds, true);
  assert.equal(mode.accountForCulturalContext, true);
  assert.equal(mode.avoidAuthoritativeConclusions, true);
  assert.equal(mode.testingAllowed, false);
});

test("adult mode keeps standard pacing", () => {
  const mode = deriveCareerMinorMode({
    profile: {
      identity: {
        minor: {
          value: false,
          source: "system_derived",
          status: "confirmed"
        }
      }
    }
  });

  assert.equal(mode.enabled, false);
  assert.equal(getCareerQuestionBatchSize({
    profile: {
      identity: {
        minor: {
          value: false,
          source: "system_derived",
          status: "confirmed"
        }
      }
    }
  }), 3);
  assert.equal(shouldAvoidImmediateApplicationPrompt({
    profile: {
      identity: {
        minor: {
          value: false,
          source: "system_derived",
          status: "confirmed"
        }
      }
    }
  }), false);
});
