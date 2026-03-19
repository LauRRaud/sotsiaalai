import { careerDocumentGeneratorTextEn } from "./careerDocumentGeneratorText.en.js";
import { careerDocumentGeneratorTextEt } from "./careerDocumentGeneratorText.et.js";
import { careerDocumentGeneratorTextRu } from "./careerDocumentGeneratorText.ru.js";

const CAREER_DOCUMENT_GENERATOR_TEXT_BY_LOCALE = Object.freeze({
  et: careerDocumentGeneratorTextEt,
  en: careerDocumentGeneratorTextEn,
  ru: careerDocumentGeneratorTextRu,
});

export function getCareerDocumentGeneratorText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_DOCUMENT_GENERATOR_TEXT_BY_LOCALE[shortLocale] || careerDocumentGeneratorTextEt;
}
