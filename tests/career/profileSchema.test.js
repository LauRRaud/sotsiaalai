import test from "node:test";
import assert from "node:assert/strict";

import {
  CAREER_PROFILE_SCHEMA_VERSION,
  createCareerField,
  createCareerProfile,
  createEmptyCareerProfile,
  getCareerFieldValue,
  isConfirmedCareerField,
  isInferredCareerField,
  isMissingCareerField
} from "../../lib/career/profileSchema.js";

test("createCareerField keeps explicit source and status", () => {
  const field = createCareerField("Tallinn", {
    source: "from_user",
    status: "confirmed"
  });

  assert.deepEqual(field, {
    value: "Tallinn",
    source: "from_user",
    status: "confirmed"
  });
});

test("createCareerField defaults cv-derived values to inferred status", () => {
  const field = createCareerField("Project manager", {
    source: "from_cv"
  });

  assert.equal(field.source, "from_cv");
  assert.equal(field.status, "inferred");
});

test("empty career profile ships with goals block and account-based privacy defaults", () => {
  const profile = createEmptyCareerProfile();

  assert.equal(profile.schemaVersion, CAREER_PROFILE_SCHEMA_VERSION);
  assert.equal(profile.privacy.accountRequired, true);
  assert.equal(profile.privacy.rawCvRetained, false);
  assert.equal(profile.privacy.storeStructuredProfileOnlyByDefault, true);
  assert.ok("goals" in profile);
  assert.ok("primaryGoal" in profile.goals);
});

test("createCareerProfile normalizes wrapped and raw values into v2 structure", () => {
  const profile = createCareerProfile({
    profileId: "career-1",
    accountId: "user-1",
    sourceMode: ["cv_plus_chat"],
    identity: {
      location: {
        value: "Tallinn",
        source: "from_user",
        status: "confirmed"
      },
      languages: [
        {
          language: "Eesti",
          level: {
            value: "C1",
            source: "from_user",
            status: "confirmed"
          }
        }
      ]
    },
    goals: {
      primaryGoal: {
        value: "find_work",
        source: "from_user",
        status: "confirmed"
      },
      urgency: "high",
      preferredNextStep: "tailor_cv"
    },
    skills: {
      transferableSkills: [
        { value: "communication", source: "from_cv", status: "inferred" },
        "problem solving"
      ]
    }
  });

  assert.equal(profile.profileId, "career-1");
  assert.equal(profile.accountId, "user-1");
  assert.equal(profile.identity.location.status, "confirmed");
  assert.equal(profile.identity.languages[0].language.status, "inferred");
  assert.equal(profile.identity.languages[0].level.status, "confirmed");
  assert.equal(profile.goals.primaryGoal.value, "find_work");
  assert.equal(profile.goals.urgency.status, "inferred");
  assert.equal(profile.skills.transferableSkills[0].status, "inferred");
  assert.equal(profile.skills.transferableSkills[1].value, "problem solving");
});

test("field helpers distinguish confirmed, inferred and missing fields", () => {
  const confirmedField = createCareerField("Tallinn", {
    source: "from_user",
    status: "confirmed"
  });
  const inferredField = createCareerField("Remote work", {
    source: "from_cv"
  });
  const missingField = createCareerField(null);

  assert.equal(getCareerFieldValue(confirmedField), "Tallinn");
  assert.equal(isConfirmedCareerField(confirmedField), true);
  assert.equal(isInferredCareerField(inferredField), true);
  assert.equal(isMissingCareerField(missingField), true);
});
