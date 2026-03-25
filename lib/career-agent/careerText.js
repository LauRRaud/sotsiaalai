import { careerTextCatalogEn } from "./i18n/careerTextCatalog.en.js";
import { careerTextCatalogEt } from "./i18n/careerTextCatalog.et.js";
import { careerTextCatalogRu } from "./i18n/careerTextCatalog.ru.js";

const CAREER_TEXT_CATALOG_BY_LOCALE = Object.freeze({
  et: careerTextCatalogEt,
  en: careerTextCatalogEn,
  ru: careerTextCatalogRu,
});

export function getCareerTextCatalog(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_TEXT_CATALOG_BY_LOCALE[shortLocale] || careerTextCatalogEt;
}

export function getCareerTextSection(section, locale = "et") {
  const safeSection = String(section || "").trim();
  const localeCatalog = getCareerTextCatalog(locale);
  const fallbackCatalog = careerTextCatalogEt;
  return localeCatalog[safeSection] || fallbackCatalog[safeSection] || Object.freeze({});
}

export function getCareerActionPlanText(locale = "et") {
  return getCareerTextSection("actionPlan", locale);
}

export function getCareerAdapterText(locale = "et") {
  return getCareerTextSection("adapter", locale);
}

export function getCareerCvParserText(locale = "et") {
  return getCareerTextSection("cvParser", locale);
}

export function getCareerDocumentFlowText(locale = "et") {
  return getCareerTextSection("documentFlow", locale);
}

export function getCareerDocumentGeneratorText(locale = "et") {
  return getCareerTextSection("documentGenerator", locale);
}

export function getCareerDocumentTemplateText(locale = "et") {
  return getCareerTextSection("documentTemplate", locale);
}

export function getCareerHandoffText(locale = "et") {
  return getCareerTextSection("handoff", locale);
}

export function getCareerMatchingText(locale = "et") {
  return getCareerTextSection("matching", locale);
}

export function getCareerOrchestratorText(locale = "et") {
  return getCareerTextSection("orchestrator", locale);
}

export function getCareerPrivacyText(locale = "et") {
  return getCareerTextSection("privacy", locale);
}

export function getCareerQuestionText(locale = "et") {
  return getCareerTextSection("question", locale);
}

export function getCareerResponseText(locale = "et") {
  return getCareerTextSection("response", locale);
}

export function getCareerRunText(locale = "et") {
  return getCareerTextSection("run", locale);
}

export function getCareerTaxonomyText(locale = "et") {
  return getCareerTextSection("taxonomy", locale);
}

export function getCareerUiText(locale = "et") {
  return getCareerTextSection("ui", locale);
}
