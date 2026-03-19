export const careerMatchingTextEn = Object.freeze({
  fitLabels: {
    strong: "strong fit",
    possible: "possible fit",
    needs_step: "needs a next step",
  },
  nextStepMissingRequirements(missingRequirements = []) {
    return `Clarify or fill in these missing points first: ${missingRequirements.join(", ")}.`;
  },
  nextStepEducation:
    "Compare the admission requirements and fit for this study path with your goal.",
  nextStepGeneral:
    "Review the application or next practical step for this direction.",
  evidence: {
    directionMatch: "direction matches: ",
    experienceMatch: "experience matches: ",
    skillMatch: "skill matches: ",
    extraValue: "extra value: ",
  },
  oska: {
    occupationMatch: "OSKA occupation match: ",
    fieldMatch: "OSKA field: ",
    skillMatches: "OSKA skill matches: ",
    educationSignal: "OSKA preparation or study path: ",
    workCondition: "OSKA work condition: ",
    confidencePrefix: "OSKA occupation confidence: ",
  },
  confidence: {
    limitedConfirmedInfo: "there is still only a limited amount of confirmed information in the profile",
    partialSkillOverlap: "some of the skill overlap is partial rather than complete",
    directionNotConfirmed: "the desired direction is not yet clearly confirmed in the profile",
    languageRequirementsNeedWork: "language requirements need clarification or strengthening",
  },
});
