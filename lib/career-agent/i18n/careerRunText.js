import { careerRunTextEn } from "./careerRunText.en.js";
import { careerRunTextEt } from "./careerRunText.et.js";
import { careerRunTextRu } from "./careerRunText.ru.js";

const CAREER_RUN_TEXT_BY_LOCALE = Object.freeze({
  et: careerRunTextEt,
  en: careerRunTextEn,
  ru: careerRunTextRu,
});

export function getCareerRunText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_RUN_TEXT_BY_LOCALE[shortLocale] || careerRunTextEt;
}
