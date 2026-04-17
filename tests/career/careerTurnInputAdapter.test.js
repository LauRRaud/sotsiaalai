import test from "node:test";
import assert from "node:assert/strict";

const { adaptCareerTurnInput } = await import(
  "../../lib/career-agent/adapters/careerTurnInputAdapter.js"
);
const { summarizeProfileForConfirmation } = await import(
  "../../lib/career-agent/profile/careerProfile.helpers.js"
);

test("CV patch does not override user-provided display name, location or current status", () => {
  const result = adaptCareerTurnInput({
    profile: {
      identity: {
        displayName: { value: "Laur", source: "from_user", status: "confirmed" },
        location: { value: "Tallinn", source: "from_user", status: "confirmed" },
      },
      workStatus: {
        currentStatus: { value: "unemployed", source: "from_user", status: "confirmed" },
      },
    },
    parserProfilePatch: {
      identity: {
        displayName: { value: "Laur Raudsoo", source: "from_cv", status: "unconfirmed" },
        location: {
          value: "Kolde 6/1, Tabasalu, Harku vald 76901",
          source: "from_cv",
          status: "unconfirmed",
        },
      },
      workStatus: {
        currentStatus: { value: "employed", source: "from_cv", status: "unconfirmed" },
      },
    },
  });

  assert.equal(result.profile.identity.displayName.value, "Laur");
  assert.equal(result.profile.identity.location.value, "Tallinn");
  assert.equal(result.profile.workStatus.currentStatus.value, "unemployed");
});

test("profile confirmation summary hides CV-derived current status and shortens exact address", () => {
  const summary = summarizeProfileForConfirmation({
    identity: {
      location: {
        value: "Kolde 6/1, Tabasalu, Harku vald 76901",
        source: "from_cv",
        status: "unconfirmed",
      },
    },
    workStatus: {
      currentStatus: {
        value: "employed",
        source: "from_cv",
        status: "unconfirmed",
      },
    },
  });

  assert.equal(summary.identity.location, "Tabasalu, Harku vald");
  assert.equal(summary.workStatus.currentStatus, null);
});
