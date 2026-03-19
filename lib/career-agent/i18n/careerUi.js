import { careerUiEn } from "./careerUi.en.js";
import { careerUiEt } from "./careerUi.et.js";
import { careerUiRu } from "./careerUi.ru.js";

const CAREER_UI_BY_LOCALE = Object.freeze({
  et: careerUiEt,
  en: careerUiEn,
  ru: careerUiRu,
});

export function getCareerUiText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_UI_BY_LOCALE[shortLocale] || careerUiEt;
}
