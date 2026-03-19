import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceCareerWorkflow,
  canTransitionCareerWorkflow,
  createCareerWorkflowState,
  deriveCareerWorkflowFocus,
  getCareerMissingFieldsForStep,
  resolveCareerWorkflowStep,
  summarizeCareerProfileReadiness
} from "../../lib/career/stateMachine.js";

function buildConfirmedProfile(overrides = {}) {
  return {
    identity: {
      minor: {
        value: false,
        source: "system_derived",
        status: "confirmed"
      },
      location: {
        value: "Tallinn",
        source: "from_user",
        status: "confirmed"
      }
    },
    goals: {
      primaryGoal: {
        value: "find_work",
        source: "from_user",
        status: "confirmed"
      },
      preferredNextStep: {
        value: "tailor_cv",
        source: "from_user",
        status: "confirmed"
      }
    },
    workStatus: {
      currentStatus: {
        value: "unemployed",
        source: "from_user",
        status: "confirmed"
      }
    },
    education: {
      completed: []
    },
    experience: {
      roles: [
        {
          title: {
            value: "Klienditeenindaja",
            source: "from_cv",
            status: "inferred"
          }
        }
      ]
    },
    skills: {
      professionalSkills: [{ value: "customer service", source: "from_cv", status: "inferred" }],
      transferableSkills: [{ value: "communication", source: "from_user", status: "confirmed" }]
    },
    selfAnalysis: {
      strengths: [{ value: "calm", source: "from_user", status: "confirmed" }],
      interests: [{ value: "people-facing work", source: "from_user", status: "confirmed" }],
      values: [{ value: "stability", source: "from_user", status: "confirmed" }],
      preferences: [{ value: "team", source: "from_user", status: "confirmed" }],
      competitiveAdvantages: []
    },
    careerDirections: {
      targetRolesNow: [{ value: "Customer support specialist", source: "system_derived", status: "inferred" }],
      targetRolesWithUpskilling: [],
      longerTermGoals: [],
      educationPaths: []
    },
    recommendationContext: {
      confirmedByUser: true
    },
    ...overrides
  };
}

test("workflow starts from intake when profile lacks core input", () => {
  const state = createCareerWorkflowState({ profile: {} });

  assert.equal(state.step, "intake");
  assert.equal(state.mode, "active");
  assert.equal(state.missingFields.includes("goals.primaryGoal"), true);
});

test("workflow resolves to self analysis before directions when confirmation is done", () => {
  const profile = buildConfirmedProfile({
    selfAnalysis: {
      strengths: [],
      interests: [],
      values: [],
      preferences: [],
      competitiveAdvantages: []
    },
    careerDirections: {
      targetRolesNow: [],
      targetRolesWithUpskilling: [],
      longerTermGoals: [],
      educationPaths: []
    }
  });

  assert.equal(resolveCareerWorkflowStep({ profile }), "self_analysis");
});

test("workflow can focus on education when goal indicates learning path", () => {
  const profile = buildConfirmedProfile({
    goals: {
      primaryGoal: {
        value: "reskilling",
        source: "from_user",
        status: "confirmed"
      },
      preferredNextStep: {
        value: "compare_learning_options",
        source: "from_user",
        status: "confirmed"
      }
    },
    education: {
      retrainingInterest: {
        value: "yes",
        source: "from_user",
        status: "confirmed"
      }
    },
    careerDirections: {
      targetRolesNow: [],
      targetRolesWithUpskilling: [],
      longerTermGoals: [],
      educationPaths: [{ label: { value: "IT support training", source: "system_derived", status: "inferred" } }]
    }
  });

  assert.equal(deriveCareerWorkflowFocus(profile), "education");
  assert.equal(resolveCareerWorkflowStep({ profile }), "education_explore");
});

test("workflow moves to handoff when handoff rules trigger", () => {
  const profile = buildConfirmedProfile();
  const state = createCareerWorkflowState({
    profile,
    message: "Kas mul on seaduslik õigus sellele toetusele?"
  });

  assert.equal(state.step, "handoff");
  assert.equal(state.mode, "handoff");
  assert.equal(state.handoffReasons.length > 0, true);
});

test("workflow state exposes privacy and minor mode signals", () => {
  const profile = buildConfirmedProfile({
    accountId: null,
    identity: {
      minor: {
        value: true,
        source: "from_user",
        status: "confirmed"
      }
    },
    careerDirections: {
      targetRolesNow: [{ value: "Customer support specialist", source: "system_derived", status: "inferred" }],
      targetRolesWithUpskilling: [],
      longerTermGoals: [],
      educationPaths: [{ label: { value: "IT support training", source: "system_derived", status: "inferred" } }]
    }
  });
  const state = createCareerWorkflowState({
    profile,
    requestedTesting: true
  });

  assert.equal(state.flowLocked, true);
  assert.equal(state.privacyPolicy.accountPresent, false);
  assert.equal(state.minorMode.enabled, true);
  assert.equal(state.minorMode.questionBatchSize, 1);
});

test("transition helper and readiness summary stay aligned with allowed flow", () => {
  const profile = buildConfirmedProfile();
  const readiness = summarizeCareerProfileReadiness(profile);
  const nextStep = advanceCareerWorkflow({
    currentStep: "shortlist_directions",
    profile
  });

  assert.equal(readiness.hasDirections, true);
  assert.equal(canTransitionCareerWorkflow("shortlist_directions", "analyze_opportunities"), true);
  assert.equal(nextStep, "analyze_opportunities");
  assert.equal(getCareerMissingFieldsForStep("action_support", profile).length, 0);
});
