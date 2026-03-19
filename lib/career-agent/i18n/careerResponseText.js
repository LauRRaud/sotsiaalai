import { careerResponseTextEn } from "./careerResponseText.en.js";
import { careerResponseTextEt } from "./careerResponseText.et.js";
import { careerResponseTextRu } from "./careerResponseText.ru.js";

const CAREER_RESPONSE_TEXT_BY_LOCALE = Object.freeze({
  et: careerResponseTextEt,
  en: careerResponseTextEn,
  ru: careerResponseTextRu,
});

export function getCareerResponseText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_RESPONSE_TEXT_BY_LOCALE[shortLocale] || careerResponseTextEt;
}
