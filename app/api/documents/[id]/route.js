import { assertOwnedByUser } from "@/lib/documents/access"
import { logDocumentsAudit } from "@/lib/documents/audit"
import { prisma } from "@/lib/prisma"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import {
  deleteStoredDocument,
  errorJson,
  json,
  localeFromRequest,
  normalizeDocumentKind,
  normalizeDocumentTitle,
  normalizeTemplateFor,
  requireDocumentUser
} from "@/lib/documents/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DOCUMENTS_RATE_LIMIT_WINDOW_MS = readDocumentsRateLimit(process.env.DOCUMENTS_RATE_LIMIT_WINDOW_MS, 60_000, 1000)
const DOCUMENTS_MUTATION_RATE_LIMIT_MAX = readDocumentsRateLimit(process.env.DOCUMENTS_MUTATION_RATE_LIMIT_MAX, 30)

function serializeDocument(document) {
  return {
    id: document.id,
    title: document.title,
    originalName: document.originalName,
    kind: document.kind,
    templateFor: document.templateFor,
    agentAllowed: Boolean(document.agentAllowed),
    mime: document.mime,
    size: document.size,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  }
}

export async function PATCH(request, { params }) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth) {
    return errorJson("api.common.unauthorized", 401, locale)
  }

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "documents_update",
    userId: auth.userId,
    limit: DOCUMENTS_MUTATION_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  const id = String(params?.id || "").trim()
  if (!id) {
    return errorJson("documents.errors.missing_id", 400, locale)
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    return errorJson("documents.errors.invalid_payload", 400, locale)
  }

  try {
    const existing = await prisma.userDocument.findUnique({
      where: { id }
    })
    if (!existing) {
      return errorJson("documents.errors.not_found", 404, locale)
    }
    assertOwnedByUser(existing, auth.userId)

    const kind = body?.kind == null ? existing.kind : normalizeDocumentKind(body.kind)
    const templateFor =
      body?.templateFor === undefined
        ? existing.templateFor
        : normalizeTemplateFor(body.templateFor, kind)

    const title =
      body?.title === undefined
        ? existing.title
        : normalizeDocumentTitle(body.title, existing.originalName)

    const agentAllowed =
      body?.agentAllowed === undefined ? existing.agentAllowed : Boolean(body.agentAllowed)

    const document = await prisma.userDocument.update({
      where: { id },
      data: {
        title,
        kind,
        templateFor,
        agentAllowed
      }
    })

    await logDocumentsAudit("document.updated", {
      userId: auth.userId,
      documentId: document.id,
      title: document.title,
      kind: document.kind,
      templateFor: document.templateFor,
      agentAllowed: document.agentAllowed
    })

    return json({
      ok: true,
      document: serializeDocument(document)
    })
  } catch (error) {
    if (error?.status === 403) {
      return errorJson("api.common.forbidden", 403, locale)
    }
    console.error("[documents] update failed", error)
    return errorJson("documents.errors.update_failed", 500, locale)
  }
}

export async function DELETE(request, { params }) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth) {
    return errorJson("api.common.unauthorized", 401, locale)
  }

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "documents_delete",
    userId: auth.userId,
    limit: DOCUMENTS_MUTATION_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  const id = String(params?.id || "").trim()
  if (!id) {
    return errorJson("documents.errors.missing_id", 400, locale)
  }

  try {
    const existing = await prisma.userDocument.findUnique({
      where: { id }
    })
    if (!existing) {
      return errorJson("documents.errors.not_found", 404, locale)
    }
    assertOwnedByUser(existing, auth.userId)

    await deleteStoredDocument(existing.storagePath)
    await prisma.userDocument.delete({
      where: { id }
    })

    await logDocumentsAudit("document.deleted", {
      userId: auth.userId,
      documentId: existing.id,
      title: existing.title,
      originalName: existing.originalName,
      kind: existing.kind
    })

    return json({
      ok: true,
      id
    })
  } catch (error) {
    if (error?.status === 403) {
      return errorJson("api.common.forbidden", 403, locale)
    }
    console.error("[documents] delete failed", error)
    return errorJson("documents.errors.delete_failed", 500, locale)
  }
}
