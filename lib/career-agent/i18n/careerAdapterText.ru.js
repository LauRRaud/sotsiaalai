export const careerAdapterTextRu = Object.freeze({
  errors: {
    turnPayloadMustBeObject: "Пейлоад хода карьеры должен быть объектом.",
    questionAnswerPayloadMustBeObject: "Пейлоад ответа на вопрос карьеры должен быть объектом.",
    questionAnswerRequiresQuestionId: "Пейлоад ответа на вопрос карьеры требует значения questionId.",
  },
  warnings: {
    canonicalPatchMissing:
      "Пейлоад содержит вывод cvParseResult, но отсутствует canonical profile patch. Добавьте отдельный адаптер для сырого парсера.",
  },
});
