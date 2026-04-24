export const WORKER_FRAMEWORK_KEY = "WORKER_DATA_PROCESSING";
export const WORKER_FRAMEWORK_VERSION = "2026-04-25";
export const WORKER_FRAMEWORK_ACCEPTANCE_TYPE = "WORKER_ACK";
export const WORKER_FRAMEWORK_ACCEPTANCE_SOURCE = "REGISTER_FLOW";
export const WORKER_FRAMEWORK_ACCOUNT_ACCEPTANCE_SOURCE = "ACCOUNT_FRAMEWORK_PAGE";
export const WORKER_FRAMEWORK_REVIEW_STORAGE_KEY = "worker_framework_review_opened_at";
export const WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY = "worker_framework_signed_downloaded_at";
export const WORKER_FRAMEWORK_DOCX_HREF = "/legal/sotsiaalai_raamleping.docx";
export const WORKER_FRAMEWORK_SIGNED_HREF = "/legal/sotsiaalai_raamleping.asice";
export const WORKER_FRAMEWORK_DOCX_HREFS = {
  et: WORKER_FRAMEWORK_DOCX_HREF,
  en: "/legal/sotsiaalai_framework_en.docx",
  ru: "/legal/sotsiaalai_raamleping_ru.docx"
};

export function getWorkerFrameworkDocxHref(locale = "et") {
  return WORKER_FRAMEWORK_DOCX_HREFS[locale] || WORKER_FRAMEWORK_DOCX_HREFS.et;
}

export function normalizeOptionalTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}
