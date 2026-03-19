export const careerTaxonomyTextRu = Object.freeze({
  errors: {
    clientRequiresBaseUrl: "Клиент OSKA API требует значение baseUrl.",
    missingEndpoint: "Отсутствует endpoint для типа ресурса OSKA.",
    requestFailed: "Запрос к OSKA API завершился с кодом",
    invalidJson: "OSKA API не вернул JSON.",
    unknownApiError: "Неизвестная ошибка OSKA API.",
    refreshError: "Неизвестная ошибка обновления таксономии.",
    refreshFailed: "Не удалось обновить карьерную таксономию.",
    notReady:
      "Карьерная таксономия пока не готова. Сначала вызовите ensureReady().",
    sharedConfigMismatch:
      "Общий сервис карьерной таксономии уже создан с другой конфигурацией.",
  },
});
