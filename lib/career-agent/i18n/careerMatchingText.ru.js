export const careerMatchingTextRu = Object.freeze({
  fitLabels: {
    strong: "сильное соответствие",
    possible: "возможное соответствие",
    needs_step: "требуется следующий шаг",
  },
  nextStepMissingRequirements(missingRequirements = []) {
    return `Сначала уточните или дополните эти недостающие моменты: ${missingRequirements.join(", ")}.`;
  },
  nextStepEducation:
    "Сравните требования к поступлению и соответствие этого учебного пути своей цели.",
  nextStepGeneral:
    "Проверьте возможность подачи заявки или следующего практического шага для этого направления.",
  evidence: {
    directionMatch: "направление совпадает: ",
    experienceMatch: "опыт совпадает: ",
    skillMatch: "навык совпадает: ",
    extraValue: "дополнительная ценность: ",
  },
  oska: {
    occupationMatch: "OSKA: подходящая профессия: ",
    fieldMatch: "OSKA: сфера: ",
    skillMatches: "OSKA: совпадения по навыкам: ",
    educationSignal: "OSKA: подготовка или путь обучения: ",
    workCondition: "OSKA: условие работы: ",
    confidencePrefix: "OSKA: уверенность совпадения профессии: ",
  },
  confidence: {
    limitedConfirmedInfo: "в профиле всё ещё немного подтверждённой информации",
    partialSkillOverlap: "часть совпадения навыков является неполной, а не полной",
    directionNotConfirmed: "желаемое направление ещё явно не подтверждено в профиле",
    languageRequirementsNeedWork: "языковые требования нужно уточнить или усилить",
  },
});
