import { prisma } from "../prisma.js"
import { buildDocumentAuditRecord } from "./auditShared.js"

export async function logDocumentsAudit(event, payload = {}) {
  if (!event) return

  const record = buildDocumentAuditRecord(event, payload)

  try {
    console.info("[documents][audit]", {
      event,
      at: new Date().toISOString(),
      ...payload
    })
  } catch {}

  if (!record) return

  try {
    await prisma.documentAudit.create({
      data: record
    })
  } catch (error) {
    try {
      console.error("[documents][audit][db] failed", {
        event,
        error: error?.message
      })
    } catch {}
  }
}
