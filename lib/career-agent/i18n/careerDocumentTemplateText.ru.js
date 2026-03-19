export const careerDocumentTemplateTextRu = Object.freeze({
  errors: {
    unsupportedDocumentFlow: "Неподдерживаемый документный поток",
    invalidPreparedData: "Некорректно подготовленные данные.",
    invalidPreparedDataMissing: "Некорректно подготовленные данные: отсутствует",
  },
  cv: {
    summaryLabel: "Краткое описание",
    experienceLabel: "Опыт работы",
    educationLabel: "Образование",
    skillsLabel: "Навыки",
    strengthsLabel: "Сильные стороны",
  },
  applicationEmail: {
    subject(targetRole, organization) {
      return organization
        ? `Отклик на позицию ${targetRole} в ${organization}`
        : `Отклик на позицию ${targetRole}`;
    },
    greeting(organization) {
      return `Здравствуйте${organization ? `, ${organization}` : ""}!`;
    },
    applySentence(targetRole, organization) {
      return `Хочу откликнуться на позицию ${targetRole}${organization ? ` в ${organization}` : ""}.`;
    },
    backgroundIntro: "Коротко о моём релевантном опыте:",
    closingLine: "Буду рад(а) возможности подробнее рассказать о своём опыте и мотивации.",
    signoff(name) {
      return `С уважением,\n${name}`;
    },
  },
  coverLetter: {
    title(targetRole, organization) {
      return organization
        ? `Сопроводительное письмо – ${targetRole} / ${organization}`
        : `Сопроводительное письмо – ${targetRole}`;
    },
    greeting(organization) {
      return `Здравствуйте${organization ? `, команда ${organization}` : ""},`;
    },
    applySentence(targetRole, organization) {
      return `Подаю заявку на позицию ${targetRole}${organization ? ` в ${organization}` : ""}.`;
    },
    experienceIntro: "Релевантный опыт:",
    strengthsIntro: "Ключевые сильные стороны:",
    closingLine: "Спасибо за рассмотрение моей кандидатуры.",
    signoff(name) {
      return `С уважением,\n${name}`;
    },
  },
  motivationLetter: {
    title(targetRole) {
      return `Мотивационное письмо – ${targetRole}`;
    },
    greeting: "Уважаемые дамы и господа,",
    motivationSentence(targetRole) {
      return `Хочу выразить свою мотивацию в отношении ${targetRole}.`;
    },
    backgroundIntro: "Релевантный опыт:",
    valuesIntro: "Ценности и цели:",
    interestsIntro: "Интересы:",
    signoff(name) {
      return `С уважением,\n${name}`;
    },
  },
  recommendationHelp: {
    title(candidateName) {
      return `Подготовка рекомендации – ${candidateName}`;
    },
    candidateLabel: "Кандидат:",
    relationshipLabel: "Связь с кандидатом:",
    targetRoleLabel: "Целевая роль или возможность:",
    examplesLabel: "Сильные стороны и примеры:",
    closingLine: "Этот текст можно использовать как основу для рекомендации или запроса рекомендации.",
  },
});
