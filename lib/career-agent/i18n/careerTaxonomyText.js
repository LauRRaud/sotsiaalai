import { careerTaxonomyTextEn } from "./careerTaxonomyText.en.js";
import { careerTaxonomyTextEt } from "./careerTaxonomyText.et.js";
import { careerTaxonomyTextRu } from "./careerTaxonomyText.ru.js";

const CAREER_TAXONOMY_TEXT_BY_LOCALE = Object.freeze({
  et: careerTaxonomyTextEt,
  en: careerTaxonomyTextEn,
  ru: careerTaxonomyTextRu,
});

export function getCareerTaxonomyText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_TAXONOMY_TEXT_BY_LOCALE[shortLocale] || careerTaxonomyTextEt;
}
