export const careerAdapterTextEn = Object.freeze({
  errors: {
    turnPayloadMustBeObject: "Career turn payload must be an object.",
    questionAnswerPayloadMustBeObject: "Career question answer payload must be an object.",
    questionAnswerRequiresQuestionId: "Career question answer payload requires questionId.",
  },
  warnings: {
    canonicalPatchMissing:
      "The payload includes cvParseResult output, but the canonical profile patch is missing. Add the raw parser adapter separately.",
  },
});
