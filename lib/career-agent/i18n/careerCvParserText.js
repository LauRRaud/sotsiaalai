import { careerCvParserTextEn } from "./careerCvParserText.en.js";
import { careerCvParserTextEt } from "./careerCvParserText.et.js";
import { careerCvParserTextRu } from "./careerCvParserText.ru.js";

const CAREER_CV_PARSER_TEXT_BY_LOCALE = Object.freeze({
  et: careerCvParserTextEt,
  en: careerCvParserTextEn,
  ru: careerCvParserTextRu,
});

export function getCareerCvParserText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_CV_PARSER_TEXT_BY_LOCALE[shortLocale] || careerCvParserTextEt;
}
