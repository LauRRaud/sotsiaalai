import { careerOrchestratorTextEn } from "./careerOrchestratorText.en.js";
import { careerOrchestratorTextEt } from "./careerOrchestratorText.et.js";
import { careerOrchestratorTextRu } from "./careerOrchestratorText.ru.js";

const CAREER_ORCHESTRATOR_TEXT_BY_LOCALE = Object.freeze({
  et: careerOrchestratorTextEt,
  en: careerOrchestratorTextEn,
  ru: careerOrchestratorTextRu,
});

export function getCareerOrchestratorText(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  const shortLocale = normalized.split("-")[0];
  return CAREER_ORCHESTRATOR_TEXT_BY_LOCALE[shortLocale] || careerOrchestratorTextEt;
}
