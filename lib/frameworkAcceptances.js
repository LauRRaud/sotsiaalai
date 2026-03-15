export const WORKER_FRAMEWORK_KEY = "WORKER_DATA_PROCESSING";
export const WORKER_FRAMEWORK_VERSION = "2026-03-15";
export const WORKER_FRAMEWORK_ACCEPTANCE_TYPE = "WORKER_ACK";
export const WORKER_FRAMEWORK_ACCEPTANCE_SOURCE = "REGISTER_FLOW";
export const WORKER_FRAMEWORK_REVIEW_STORAGE_KEY = "worker_framework_review_opened_at";
export const WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY = "worker_framework_signed_downloaded_at";

export function normalizeOptionalTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}
