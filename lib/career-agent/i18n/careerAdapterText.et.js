export const careerAdapterTextEt = Object.freeze({
  errors: {
    turnPayloadMustBeObject: "Karjääri turni payload peab olema objekt.",
    questionAnswerPayloadMustBeObject: "Karjääri küsimuse vastuse payload peab olema objekt.",
    questionAnswerRequiresQuestionId: "Karjääri küsimuse vastuse payload nõuab questionId väärtust.",
  },
  warnings: {
    canonicalPatchMissing:
      "Payload sisaldab cvParseResult väljundit, kuid canonical profile patch puudub. Toore parseri adapter tuleb lisada eraldi.",
  },
});
