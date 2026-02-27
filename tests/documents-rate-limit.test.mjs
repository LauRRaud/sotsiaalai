import assert from "node:assert/strict"
import { enforceDocumentsRateLimit } from "../lib/documents/rateLimit.js"

function makeRequest(ip = "127.0.0.1") {
  return {
    headers: {
      get(name) {
        if (String(name).toLowerCase() === "x-forwarded-for") return ip
        return null
      }
    }
  }
}

const request = makeRequest()
const first = enforceDocumentsRateLimit(request, {
  scope: "test_scope",
  userId: "user-1",
  limit: 2,
  windowMs: 60_000
})
assert.equal(first, null)

const second = enforceDocumentsRateLimit(request, {
  scope: "test_scope",
  userId: "user-1",
  limit: 2,
  windowMs: 60_000
})
assert.equal(second, null)

const third = enforceDocumentsRateLimit(request, {
  scope: "test_scope",
  userId: "user-1",
  limit: 2,
  windowMs: 60_000
})

assert.ok(third)
assert.equal(third.status, 429)
assert.equal(third.headers.get("Retry-After") !== null, true)
