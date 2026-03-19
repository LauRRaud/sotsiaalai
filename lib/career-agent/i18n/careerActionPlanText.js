import { careerActionPlanTextEn } from "./careerActionPlanText.en.js";
import { careerActionPlanTextEt } from "./careerActionPlanText.et.js";
import { careerActionPlanTextRu } from "./careerActionPlanText.ru.js";

const CAREER_ACTION_PLAN_TEXT_BY_LOCALE = Object.freeze({
  et: careerActionPlanTextEt,
  en: careerActionPlanTextEn,
  ru: careerActionPlanTextRu,
});

export function getCareerActionPlanText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_ACTION_PLAN_TEXT_BY_LOCALE[shortLocale] || careerActionPlanTextEt;
}
