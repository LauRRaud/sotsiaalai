import test from "node:test"
import assert from "node:assert/strict"

const {
  buildArtifactOrderBy,
  buildPaginationMeta,
  normalizeArtifactListSort,
  normalizeArtifactStatusFilter,
  parseListLimit,
  parseListOffset
} = await import("../../lib/documents/listing.js")

test("list pagination helpers clamp invalid values", () => {
  assert.equal(parseListLimit(undefined, { fallback: 50, maxLimit: 50 }), 50)
  assert.equal(parseListLimit("0", { fallback: 50, maxLimit: 50 }), 50)
  assert.equal(parseListLimit("999", { fallback: 50, maxLimit: 50 }), 50)
  assert.equal(parseListLimit("12", { fallback: 50, maxLimit: 50 }), 12)
  assert.equal(parseListOffset("-20"), 0)
  assert.equal(parseListOffset("19.7"), 19)
})

test("pagination metadata exposes next and previous offsets", () => {
  assert.deepEqual(buildPaginationMeta({ total: 123, limit: 50, offset: 50 }), {
    total: 123,
    limit: 50,
    offset: 50,
    hasPrevious: true,
    hasNext: true,
    previousOffset: 0,
    nextOffset: 100
  })

  assert.deepEqual(buildPaginationMeta({ total: 18, limit: 50, offset: 0 }), {
    total: 18,
    limit: 50,
    offset: 0,
    hasPrevious: false,
    hasNext: false,
    previousOffset: 0,
    nextOffset: 0
  })
})

test("artifact list filter helpers normalize values", () => {
  assert.equal(normalizeArtifactStatusFilter("draft"), "DRAFT")
  assert.equal(normalizeArtifactStatusFilter("unknown"), null)
  assert.equal(normalizeArtifactListSort("approved_desc"), "approved_desc")
  assert.equal(normalizeArtifactListSort("weird"), "updated_desc")
  assert.deepEqual(buildArtifactOrderBy("approved_desc"), [{ approvedAt: "desc" }, { updatedAt: "desc" }])
})
