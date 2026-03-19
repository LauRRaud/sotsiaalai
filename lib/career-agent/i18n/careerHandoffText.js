import { careerHandoffTextEn } from "./careerHandoffText.en.js";
import { careerHandoffTextEt } from "./careerHandoffText.et.js";
import { careerHandoffTextRu } from "./careerHandoffText.ru.js";

const CAREER_HANDOFF_TEXT_BY_LOCALE = Object.freeze({
  et: careerHandoffTextEt,
  en: careerHandoffTextEn,
  ru: careerHandoffTextRu,
});

export function getCareerHandoffText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_HANDOFF_TEXT_BY_LOCALE[shortLocale] || careerHandoffTextEt;
}
