import { careerPrivacyTextEn } from "./careerPrivacyText.en.js";
import { careerPrivacyTextEt } from "./careerPrivacyText.et.js";
import { careerPrivacyTextRu } from "./careerPrivacyText.ru.js";

const CAREER_PRIVACY_TEXT_BY_LOCALE = Object.freeze({
  et: careerPrivacyTextEt,
  en: careerPrivacyTextEn,
  ru: careerPrivacyTextRu,
});

export function getCareerPrivacyText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_PRIVACY_TEXT_BY_LOCALE[shortLocale] || careerPrivacyTextEt;
}
