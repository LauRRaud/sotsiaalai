import { careerDocumentFlowTextEn } from "./careerDocumentFlowText.en.js";
import { careerDocumentFlowTextEt } from "./careerDocumentFlowText.et.js";
import { careerDocumentFlowTextRu } from "./careerDocumentFlowText.ru.js";

const CAREER_DOCUMENT_FLOW_TEXT_BY_LOCALE = Object.freeze({
  et: careerDocumentFlowTextEt,
  en: careerDocumentFlowTextEn,
  ru: careerDocumentFlowTextRu,
});

export function getCareerDocumentFlowText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_DOCUMENT_FLOW_TEXT_BY_LOCALE[shortLocale] || careerDocumentFlowTextEt;
}
