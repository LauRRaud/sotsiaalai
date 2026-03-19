import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeCareerOpportunity,
  buildCareerSessionNextStep,
  computeCareerFit,
  getCareerEvidenceWeight,
  normalizeCareerOpportunity,
  rankCareerOpportunities
} from "../../lib/career/matchingEngine.js";

function field(value, source = "from_user", status = "confirmed") {
  return { value, source, status };
}

function buildProfile(overrides = {}) {
  return {
    accountId: "acc_1",
    sourceMode: ["cv_plus_chat"],
    identity: {
      minor: field(false, "system_derived", "confirmed"),
      location: field("Tallinn")
    },
    goals: {
      primaryGoal: field("find_work"),
      preferredNextStep: field("tailor_cv")
    },
    workStatus: {
      currentStatus: field("unemployed"),
      workTimePreference: field("full_time"),
      remotePreference: field("hybrid"),
      mobilityConstraints: [],
      otherConstraints: []
    },
    education: {
      completed: [
        {
          title: field("Kutseharidus klienditeeninduses", "from_cv", "inferred"),
          level: field("vocational", "from_cv", "inferred")
        }
      ],
      ongoing: [],
      certificates: [],
      additionalTraining: [],
      learningReadiness: field("medium"),
      retrainingInterest: field("maybe")
    },
    experience: {
      roles: [
        {
          title: field("Klienditeenindaja", "from_cv", "inferred"),
          sector: field("teenindus", "from_cv", "inferred"),
          responsibilities: [field("customer service", "from_cv", "inferred")]
        }
      ],
      sectors: [field("teenindus", "from_cv", "inferred")],
      responsibilities: [field("problem solving"), field("crm")],
      careerGaps: [],
      volunteering: [],
      informalExperience: []
    },
    skills: {
      professionalSkills: [field("customer service", "from_cv", "inferred"), field("crm")],
      transferableSkills: [field("communication"), field("teamwork")],
      selfManagementSkills: [field("stress tolerance")],
      digitalSkills: [field("excel")],
      languageSkills: []
    },
    selfAnalysis: {
      strengths: [field("rahulik suhtleja")],
      developmentNeeds: [],
      interests: [field("inimestega töötamine")],
      values: [field("stability")],
      preferences: [field("team work"), field("hybrid")],
      competitiveAdvantages: [field("väga hea vene keel")]
    },
    careerDirections: {
      targetRolesNow: [field("Customer support specialist", "system_derived", "inferred")],
      targetRolesWithUpskilling: [field("Office administrator", "system_derived", "inferred")],
      longerTermGoals: [],
      educationPaths: []
    },
    recommendationContext: {
      confirmedByUser: true
    },
    ...overrides
  };
}

test("evidence weight is higher for confirmed fields than inferred fields", () => {
  const confirmedWeight = getCareerEvidenceWeight(field("Tallinn", "from_user", "confirmed"));
  const inferredWeight = getCareerEvidenceWeight(field("Tallinn", "from_cv", "inferred"));

  assert.equal(confirmedWeight > inferredWeight, true);
});

test("normalizeCareerOpportunity enriches job data from OSKA normalizer", () => {
  const dummyNormalizer = {
    normalizeOccupation() {
      return [
        {
          score: 0.93,
          item: {
            name: "Customer support specialist",
            alternativeNames: ["Klienditoe spetsialist"],
            keySkills: [{ name: "customer service" }, { name: "crm" }],
            knowledgeRequired: [{ name: "ticketing systems" }],
            educationLevels: [{ name: "vocational" }],
            fieldOfActivity: { name: "teenindus" },
            workConditions: "hybrid"
          }
        }
      ];
    }
  };

  const opportunity = normalizeCareerOpportunity(
    {
      title: "Customer support specialist",
      type: "job"
    },
    { oskaNormalizer: dummyNormalizer }
  );

  assert.equal(opportunity.skills.includes("ticketing systems"), true);
  assert.equal(opportunity.educationLevels.includes("vocational"), true);
  assert.equal(opportunity.sectors.includes("teenindus"), true);
});

test("analyzeCareerOpportunity returns required recommendation structure", () => {
  const profile = buildProfile();
  const recommendation = analyzeCareerOpportunity({
    profile,
    opportunity: {
      title: "Customer support specialist",
      type: "job",
      skills: ["customer service", "communication", "crm", "ticketing systems"],
      niceToHave: ["excel"],
      educationLevels: ["vocational"],
      sectors: ["teenindus"],
      values: ["stability"],
      workConditions: ["team work"],
      remotePreference: "hybrid",
      workTimePreference: "full_time",
      location: "Tallinn"
    }
  });

  assert.equal(["strong", "possible", "needs_step"].includes(recommendation.fitLevel), true);
  assert.equal(recommendation.whyItFits.length > 0, true);
  assert.equal(recommendation.whatIsMissing.includes("Puuduv või nõrgalt tõendatud oskus: ticketing systems"), true);
  assert.equal(recommendation.whatUserCanOfferExtra.length > 0, true);
  assert.equal(recommendation.nextStep.length > 0, true);
});

test("analyzeCareerOpportunity adds confidence notes when profile is not confirmed", () => {
  const profile = buildProfile({
    recommendationContext: {
      confirmedByUser: false
    }
  });
  const recommendation = analyzeCareerOpportunity({
    profile,
    opportunity: {
      title: "Office administrator",
      type: "job"
    }
  });

  assert.equal(
    recommendation.confidenceNotes.includes(
      "Soovitus tugineb profiilile, mida kasutaja ei ole veel täielikult kinnitanud."
    ),
    true
  );
});

test("rankCareerOpportunities orders stronger matches first and session next step stays concrete", () => {
  const profile = buildProfile();
  const recommendations = rankCareerOpportunities({
    profile,
    opportunities: [
      {
        title: "Logistics driver",
        type: "job",
        skills: ["driving", "route planning"],
        workConditions: ["field work"],
        remotePreference: "on_site",
        workTimePreference: "full_time",
        location: "Tartu"
      },
      {
        title: "Customer support specialist",
        type: "job",
        skills: ["customer service", "communication", "crm"],
        sectors: ["teenindus"],
        remotePreference: "hybrid",
        workTimePreference: "full_time",
        location: "Tallinn"
      }
    ]
  });

  assert.equal(recommendations[0].title, "Customer support specialist");
  assert.equal(typeof buildCareerSessionNextStep(recommendations), "string");
  assert.equal(buildCareerSessionNextStep(recommendations).length > 0, true);
});

test("computeCareerFit exposes explanatory fit levels without user-facing percentages", () => {
  const fit = computeCareerFit({
    experienceMatch: 0.83,
    skillsMatch: 0.8,
    educationMatch: 0.72,
    valuesAlignment: 0.68,
    workConditionAlignment: 0.74,
    learningFeasibility: 0.66,
    hardConstraintPenalty: 0.05
  });

  assert.equal(fit.fitLevel, "strong");
  assert.equal(typeof fit.totalScore, "number");
  assert.equal(fit.scoreBreakdown.skillsMatch > 0, true);
});
