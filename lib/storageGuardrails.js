const MB = 1024 * 1024

const CLIENT_STORAGE_QUOTA_BYTES = 50 * MB
const SOCIAL_WORKER_STORAGE_QUOTA_BYTES = 100 * MB
const DAILY_UPLOAD_QUOTA_BYTES = 100 * MB
const MATERIALS_FILE_COUNT_LIMIT = 10

export function normalizeStorageRole(role = "CLIENT") {
  return String(role || "").trim().toUpperCase() === "SOCIAL_WORKER" ? "SOCIAL_WORKER" : "CLIENT"
}

export function getStorageQuotaBytes(role = "CLIENT") {
  return normalizeStorageRole(role) === "SOCIAL_WORKER"
    ? SOCIAL_WORKER_STORAGE_QUOTA_BYTES
    : CLIENT_STORAGE_QUOTA_BYTES
}

export function getDailyUploadQuotaBytes() {
  return DAILY_UPLOAD_QUOTA_BYTES
}

export function getMaterialsFileCountLimit() {
  return MATERIALS_FILE_COUNT_LIMIT
}

export function getUtf8ByteLength(value) {
  return Buffer.byteLength(String(value ?? ""), "utf8")
}

export function sumFileBytes(files = []) {
  if (!Array.isArray(files)) return 0
  return files.reduce((total, file) => total + Number(file?.size || 0), 0)
}

export function wouldExceedStorageQuota(currentBytes, addedBytes, quotaBytes) {
  return Number(currentBytes) + Number(addedBytes) > Number(quotaBytes)
}
