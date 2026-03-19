export const careerActionPlanTextEn = Object.freeze({
  clarifyProfile: {
    title: "Clarify the key profile facts",
    descriptionWithMissing:
      "Before choosing the next step, it is worth clarifying these areas: {missing}.",
    descriptionFallback:
      "Clarify your experience, skills, or work preferences so the next suggestion can be more accurate.",
    rationale: [
      "The profile still has gaps or unconfirmed information.",
      "A clearer profile helps produce a more realistic next step.",
    ],
  },
  clarifyDirection: {
    title: "Define 1–3 realistic directions",
    description:
      "Write down 1–3 jobs, roles, or study paths that you want to compare or explore first.",
    rationale: [
      "A clearer target helps avoid overly broad recommendations.",
      "Clarifying the direction makes it easier to assess fit in the next step.",
    ],
  },
  buildCv: {
    titleWithSignals: "Create or improve a CV draft",
    titleWithoutSignals: "Create an initial CV draft",
    descriptionWithSignals:
      "Bring your experience, education, and main skills into one clear CV structure.",
    descriptionWithoutSignals:
      "Start by listing your experience, education, and skills so we can create an initial CV draft.",
    rationale: [
      "A CV is a practical basis for applying and taking the next steps.",
      "The document flow can help structure the existing information better.",
    ],
    documentReason: "A useful next step is building or updating a CV.",
  },
  applyNow: {
    title: "Prepare the application",
    titleSuffixSeparator: ": ",
    descriptionWithOpportunity:
      "Tailor your CV and application text to the specific opportunity \"{title}\".",
    descriptionFallback:
      "Choose one concrete opportunity and tailor your CV and application text to it.",
    rationaleFitLabel: "The current fit has been assessed at: {fitLabel}.",
    documentReason:
      "Application preparation usually requires tailoring the CV.",
  },
  compareOptions: {
    title: "Compare 1–3 realistic options",
    descriptionWithDirections:
      "Start by comparing these directions: {directions}. See what fits your experience, interests, and constraints best.",
    descriptionWithOpportunity:
      "Compare at least one realistic target, starting with \"{title}\".",
    descriptionFallback:
      "Compare 1–3 realistic jobs, roles, or study paths and see what suits you best.",
    rationale: [
      "Comparison helps you make a more informed choice before acting.",
      "This step is especially useful when you have several possible directions.",
    ],
  },
  exploreLearning: {
    titleWithEducationGoal: "Explore suitable study paths",
    titleDefault: "Explore skill development options",
    descriptionWithRetraining:
      "Map 1–3 learning or retraining options that would bring you closer to the target you want.",
    descriptionFallback:
      "Explore which courses or study paths would support your next realistic step.",
    rationale: [
      "Learning or upskilling can reduce fit gaps.",
      "This step works well when the goal is a new field or stronger skills.",
    ],
  },
  prepareInterview: {
    title: "Prepare for an interview",
    description:
      "List your strengths, past examples, and answers to the main interview questions.",
    rationale: [
      "Interview preparation helps you present your fit more convincingly.",
    ],
  },
  requestSupport: {
    title: "Consider additional human support",
    descriptionWithReasons:
      "In the current situation, additional support may be useful because {reasons} are in play.",
    descriptionFallback:
      "The current situation may require more support or a human advisor.",
    rationale: [
      "Not every situation should be handled with AI support alone.",
      "Additional human support can help you reach a realistic solution faster.",
    ],
    reasons: {
      minorUser: "additional needs related to being a minor",
      multipleConstraints: "multiple simultaneous constraints",
      highUrgency: "high urgency",
      incomePressure: "strong income pressure",
    },
  },
});
