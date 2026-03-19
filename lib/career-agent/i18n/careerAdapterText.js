import { careerAdapterTextEn } from "./careerAdapterText.en.js";
import { careerAdapterTextEt } from "./careerAdapterText.et.js";
import { careerAdapterTextRu } from "./careerAdapterText.ru.js";

const CAREER_ADAPTER_TEXT_BY_LOCALE = Object.freeze({
  et: careerAdapterTextEt,
  en: careerAdapterTextEn,
  ru: careerAdapterTextRu,
});

export function getCareerAdapterText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_ADAPTER_TEXT_BY_LOCALE[shortLocale] || careerAdapterTextEt;
}
