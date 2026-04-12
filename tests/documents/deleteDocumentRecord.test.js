import test from "node:test"
import assert from "node:assert/strict"

const { deleteDocumentRecordAndFile } = await import("../../lib/documents/deleteDocumentRecord.js")

test("document cleanup deletes the database record before the file", async () => {
  const steps = []

  const deletedRecord = await deleteDocumentRecordAndFile({
    deleteRecord: async () => {
      steps.push("delete-record")
      return { id: "doc-1", storagePath: "uploads/doc-1.pdf" }
    },
    deleteFile: async (record) => {
      steps.push(`delete-file:${record.id}`)
    }
  })

  assert.equal(deletedRecord.id, "doc-1")
  assert.deepEqual(steps, ["delete-record", "delete-file:doc-1"])
})

test("document cleanup does not delete the file when database deletion fails", async () => {
  const steps = []

  await assert.rejects(() => deleteDocumentRecordAndFile({
    deleteRecord: async () => {
      steps.push("delete-record")
      throw new Error("db down")
    },
    deleteFile: async () => {
      steps.push("delete-file")
    }
  }), /db down/)

  assert.deepEqual(steps, ["delete-record"])
})

test("document cleanup tolerates file deletion errors after the database record is gone", async () => {
  const warnings = []

  const deletedRecord = await deleteDocumentRecordAndFile({
    deleteRecord: async () => ({ id: "doc-2", storagePath: "uploads/doc-2.pdf" }),
    deleteFile: async () => {
      throw new Error("unlink failed")
    },
    onFileDeleteError: (error, record) => warnings.push(`${record.id}:${error.message}`)
  })

  assert.equal(deletedRecord.id, "doc-2")
  assert.deepEqual(warnings, ["doc-2:unlink failed"])
})
