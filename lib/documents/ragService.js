import { createArtifactError } from "@/lib/documents/artifacts"

const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || process.env.RAG_API_BASE || "127.0.0.1:8000").trim()
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim()
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000)
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1"
const LOCAL_HOST_RE = /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i

export function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "")
  if (!trimmed) return "http://127.0.0.1:8000"
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

export function getRagBaseUrl() {
  return normalizeBaseFromHost(RAW_RAG_HOST)
}

function isLocalBaseUrl(url) {
  try {
    const parsed = new URL(url)
    return LOCAL_HOST_RE.test(parsed.host)
  } catch {
    return false
  }
}

function assertRagAvailable(messageKey = "documents.artifacts.errors.analysis_unavailable") {
  if (!RAG_KEY) {
    throw createArtifactError(messageKey, 503)
  }

  const base = getRagBaseUrl()
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    throw createArtifactError(messageKey, 503)
  }

  return base
}

export function buildRagHeaders(contentType = "application/json") {
  const headers = new Headers()
  headers.set("X-API-Key", RAG_KEY)
  if (contentType) {
    headers.set("Content-Type", contentType)
  }
  return headers
}

export async function ragServiceRequest(path, options = {}, messageKey = "documents.artifacts.errors.analysis_failed") {
  const base = assertRagAvailable(messageKey)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS)

  try {
    const response = await fetch(`${base}${path}`, {
      cache: "no-store",
      ...options,
      signal: controller.signal
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const status = response.status || 502
      const key = payload?.messageKey || messageKey
      const error = createArtifactError(key, status)
      error.payload = payload
      throw error
    }

    return payload
  } finally {
    clearTimeout(timer)
  }
}
