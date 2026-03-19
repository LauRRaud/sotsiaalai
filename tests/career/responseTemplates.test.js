import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCareerActionPlanTemplate,
  buildCareerCvSupportTemplate,
  buildCareerOpportunityCard,
  buildCareerProfileConfirmationTemplate,
  buildCareerRecommendationsTemplate,
  buildCareerResponseTemplate,
  buildCareerWorkflowPromptTemplate
} from "../../lib/career/responseTemplates.js";

function field(value, source = "from_user", status = "confirmed") {
  return { value, source, status };
}

function buildProfile(overrides = {}) {
  return {
    accountId: "acc_1",
    sourceMode: ["cv_plus_chat"],
    identity: {
      location: field("Tallinn"),
      minor: field(false, "system_derived", "confirmed")
    },
    goals: {
      primaryGoal: field("find_work"),
      preferredNextStep: field("tailor_cv"),
      urgency: field("high")
    },
    workStatus: {
      currentStatus: field("unemployed")
    },
    experience: {
      roles: [
        {
          title: field("Klienditeenindaja", "from_cv", "inferred")
        }
      ]
    },
    education: {
      completed: [
        {
          title: field("Kutseharidus klienditeeninduses", "from_cv", "inferred")
        }
      ]
    },
    skills: {
      professionalSkills: [field("customer service", "from_cv", "inferred")],
      transferableSkills: [field("communication"), field("teamwork")]
    },
    selfAnalysis: {
      strengths: [field("rahulik suhtleja")],
      interests: [field("inimestega töötamine")],
      values: [field("stability")]
    },
    careerDirections: {
      targetRolesNow: [field("Customer support specialist", "system_derived", "inferred")]
    },
    recommendationContext: {
      confirmedByUser: true
    },
    ...overrides
  };
}

function buildRecommendation(overrides = {}) {
  return {
    title: "Customer support specialist",
    type: "job",
    fitLevel: "strong",
    fitLabel: "tugev sobivus",
    totalScore: 0.81,
    scoreBreakdown: {
      skillsMatch: 0.82
    },
    whyItFits: [
      "Oskus kattub: customer service (customer service)",
      "Valdkond kattub: teenindus (teenindus)"
    ],
    whatIsMissing: ["Puuduv või nõrgalt tõendatud oskus: ticketing systems"],
    whatUserCanOfferExtra: ["Lisaväärtus: rahulik suhtleja."],
    nextStep: ['Tõsta CV-s esile 2-3 kõige olulisemat kattuvat oskust ja seo need rolliga "Customer support specialist".'],
    confidenceNotes: ["Osa sobivushinnangust toetub inferred-andmetele, mitte täielikult kinnitatud infole."],
    ...overrides
  };
}

test("profile confirmation template summarizes parsed profile and asks for confirmation", () => {
  const template = buildCareerProfileConfirmationTemplate({
    profile: buildProfile(),
    workflowState: {
      missingFields: ["selfAnalysis.preferences", "careerDirections.targetRolesNow"]
    }
  });

  assert.equal(template.type, "profile_confirmation");
  assert.equal(template.heading, "Sain sinust seni aru nii");
  assert.equal(template.sections.length > 0, true);
  assert.equal(template.prompt.includes("Kas see kokkuvõte on õige"), true);
  assert.equal(template.missingItems.includes("tööeelistused vajavad täpsustamist"), true);
});

test("opportunity card keeps user-facing fields and hides internal scoring", () => {
  const card = buildCareerOpportunityCard(buildRecommendation());

  assert.equal(card.fitLabel, "tugev sobivus");
  assert.equal("totalScore" in card, false);
  assert.equal("scoreBreakdown" in card, false);
  assert.equal(card.sections.nextStep.length > 0, true);
});

test("recommendations template exposes summary, directions and concrete next step", () => {
  const template = buildCareerRecommendationsTemplate({
    profile: buildProfile(),
    recommendations: [buildRecommendation()]
  });

  assert.equal(template.type, "recommendations");
  assert.equal(template.directions[0], "Customer support specialist");
  assert.equal(typeof template.nextStep, "string");
  assert.equal(template.cards[0].fitLabel, "tugev sobivus");
});

test("cv support builds create flow when CV is missing", () => {
  const profile = buildProfile({
    sourceMode: ["chat_only"]
  });
  const template = buildCareerCvSupportTemplate({
    profile,
    recommendation: buildRecommendation()
  });

  assert.equal(template.mode, "create_cv");
  assert.equal(template.checklist.some((item) => item.includes("baas-CV") || item.includes("Lisa")), true);
});

test("action plan always includes at least one concrete next step and cv support block", () => {
  const template = buildCareerActionPlanTemplate({
    profile: buildProfile(),
    recommendations: [buildRecommendation()]
  });

  assert.equal(template.type, "action_plan");
  assert.equal(template.steps.length > 0, true);
  assert.equal(template.cvSupport.mode, "tailor_cv");
});

test("workflow prompt template exposes stable prompt for non-recommendation steps", () => {
  const template = buildCareerWorkflowPromptTemplate({
    workflowState: {
      step: "self_analysis",
      missingFields: ["selfAnalysis.values"]
    }
  });

  assert.equal(template.type, "workflow_prompt");
  assert.equal(template.heading.includes("tugevused"), true);
  assert.equal(template.missingItems.includes("väärtused vajavad kirjeldamist"), true);
});

test("response template router returns handoff view when workflow is in handoff", () => {
  const template = buildCareerResponseTemplate({
    workflowState: {
      step: "handoff",
      handoffReasons: [
        {
          code: "official_service_eligibility",
          label: "Official service or benefit eligibility"
        }
      ]
    }
  });

  assert.equal(template.type, "handoff");
  assert.equal(template.reasons[0].code, "official_service_eligibility");
});
