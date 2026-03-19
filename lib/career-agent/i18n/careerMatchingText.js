import { careerMatchingTextEn } from "./careerMatchingText.en.js";
import { careerMatchingTextEt } from "./careerMatchingText.et.js";
import { careerMatchingTextRu } from "./careerMatchingText.ru.js";

const CAREER_MATCHING_TEXT_BY_LOCALE = Object.freeze({
  et: careerMatchingTextEt,
  en: careerMatchingTextEn,
  ru: careerMatchingTextRu,
});

export function getCareerMatchingText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_MATCHING_TEXT_BY_LOCALE[shortLocale] || careerMatchingTextEt;
}
