import assert from "node:assert/strict"
import { buildDocumentAuditRecord, sanitizeDocumentAuditMeta } from "../lib/documents/auditShared.js"

const sanitizedMeta = sanitizeDocumentAuditMeta({
  title: "Case summary",
  storagePath: "uploads/internal.docx",
  nested: {
    absolutePath: "/var/lib/sotsiaalai-docs/uploads/internal.docx",
    filePath: "C:\\secret\\file.docx",
    keep: "visible"
  }
})

assert.deepEqual(sanitizedMeta, {
  title: "Case summary",
  nested: {
    keep: "visible"
  }
})

const record = buildDocumentAuditRecord("artifact.downloaded", {
  userId: "user-1",
  artifactId: "artifact-1",
  storagePath: "should-not-leak",
  format: "docx"
})

assert.equal(record.ownerId, "user-1")
assert.equal(record.artifactId, "artifact-1")
assert.equal(record.action, "ARTIFACT_DOWNLOAD")
assert.equal(record.meta.storagePath, undefined)
assert.equal(record.meta.format, "docx")
assert.equal(record.meta.event, "artifact.downloaded")

assert.equal(buildDocumentAuditRecord("unknown.event", { userId: "user-1" }), null)
