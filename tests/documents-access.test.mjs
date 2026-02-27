import assert from "node:assert/strict"
import { assertOwnedByUser, isOwnedByUser } from "../lib/documents/access.js"

assert.equal(isOwnedByUser({ ownerId: "user-1" }, "user-1"), true)
assert.equal(isOwnedByUser({ ownerId: "user-1" }, "user-2"), false)
assert.equal(isOwnedByUser(null, "user-1"), false)
assert.equal(isOwnedByUser({ ownerId: null }, "user-1"), false)

assert.throws(
  () => assertOwnedByUser({ ownerId: "user-1" }, "user-2"),
  (error) => {
    assert.equal(error?.message, "api.common.forbidden")
    assert.equal(error?.status, 403)
    return true
  }
)

const record = { id: "doc-1", ownerId: "user-1" }
assert.equal(assertOwnedByUser(record, "user-1"), record)
