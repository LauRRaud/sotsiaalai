import { careerQuestionTextEn } from "./careerQuestionText.en.js";
import { careerQuestionTextEt } from "./careerQuestionText.et.js";
import { careerQuestionTextRu } from "./careerQuestionText.ru.js";

const CAREER_QUESTION_TEXT_BY_LOCALE = Object.freeze({
  et: careerQuestionTextEt,
  en: careerQuestionTextEn,
  ru: careerQuestionTextRu,
});

export function getCareerQuestionText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_QUESTION_TEXT_BY_LOCALE[shortLocale] || careerQuestionTextEt;
}
