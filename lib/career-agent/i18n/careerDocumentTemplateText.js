import { careerDocumentTemplateTextEn } from "./careerDocumentTemplateText.en.js";
import { careerDocumentTemplateTextEt } from "./careerDocumentTemplateText.et.js";
import { careerDocumentTemplateTextRu } from "./careerDocumentTemplateText.ru.js";

const CAREER_DOCUMENT_TEMPLATE_TEXT_BY_LOCALE = Object.freeze({
  et: careerDocumentTemplateTextEt,
  en: careerDocumentTemplateTextEn,
  ru: careerDocumentTemplateTextRu,
});

export function getCareerDocumentTemplateText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_DOCUMENT_TEMPLATE_TEXT_BY_LOCALE[shortLocale] || careerDocumentTemplateTextEt;
}
