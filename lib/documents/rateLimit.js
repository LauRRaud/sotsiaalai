import { NextResponse } from "next/server.js"
import { consumeRateLimit } from "../rate-limit.js"
import { getRequestIpFromRequest } from "../request-ip.js"

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_LIMIT = 60

function toPositiveInt(value, fallback, min = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.floor(parsed))
}

export function readDocumentsRateLimit(value, fallback, min = 1) {
  return toPositiveInt(value, fallback, min)
}

export function enforceDocumentsRateLimit(
  request,
  { scope = "default", userId, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS, messageKey = "api.common.rate_limited" } = {}
) {
  const normalizedLimit = toPositiveInt(limit, DEFAULT_LIMIT, 1)
  const normalizedWindowMs = toPositiveInt(windowMs, DEFAULT_WINDOW_MS, 1000)
  const ip = getRequestIpFromRequest(request)
  const principal = String(userId || "anonymous").trim() || "anonymous"
  const bucket = consumeRateLimit(`documents:${scope}:${principal}:${ip}`, normalizedLimit, normalizedWindowMs)

  if (bucket.allowed) return null

  return NextResponse.json(
    {
      ok: false,
      messageKey,
      message: messageKey
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(bucket.retryAfterSec)
      }
    }
  )
}
