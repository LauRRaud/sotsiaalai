import { assertOwnedByUser } from "@/lib/documents/access"
import { logDocumentsAudit } from "@/lib/documents/audit"
import { deleteDocumentRecordAndFile } from "@/lib/documents/deleteDocumentRecord"
import { prisma } from "@/lib/prisma"
import { isFrameworkAcceptanceSchemaError } from "@/lib/frameworkAcceptanceCompat"
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

async function resolveRouteId(paramsLike) {
  const params = await paramsLike
  return String(params?.id || "").trim()
}

function serializeDocument(document) {
  const frameworkAcceptance = document.frameworkAcceptance || null
  return {
    id: document.id,
    title: document.title,
    originalName: document.originalName,
    kind: document.kind,
    templateFor: document.templateFor,
    agentAllowed: Boolean(document.agentAllowed),
    mime: document.mime,
    size: document.size,
    readOnly: Boolean(frameworkAcceptance),
    frameworkAcceptance: frameworkAcceptance
      ? {
          id: frameworkAcceptance.id,
          frameworkKey: frameworkAcceptance.frameworkKey,
          frameworkVersion: frameworkAcceptance.frameworkVersion,
          acceptanceType: frameworkAcceptance.acceptanceType,
          acceptedAt: frameworkAcceptance.acceptedAt,
          signedDocumentDownloadedAt: frameworkAcceptance.signedDocumentDownloadedAt
        }
      : null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  }
}

async function findDocumentWithFrameworkState(id) {
  try {
    const document = await prisma.userDocument.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        originalName: true,
        kind: true,
        templateFor: true,
        agentAllowed: true,
        mime: true,
        size: true,
        storagePath: true,
        createdAt: true,
        updatedAt: true,
        frameworkAcceptance: {
          select: {
            id: true,
            frameworkKey: true,
            frameworkVersion: true,
            acceptanceType: true,
            acceptedAt: true,
            signedDocumentDownloadedAt: true
          }
        }
      }
    })

    return {
      document,
      frameworkSchemaAvailable: true
    }
  } catch (error) {
    if (!isFrameworkAcceptanceSchemaError(error)) throw error

    const document = await prisma.userDocument.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        originalName: true,
        kind: true,
        templateFor: true,
        agentAllowed: true,
        mime: true,
        size: true,
        storagePath: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      document: document
        ? {
            ...document,
            frameworkAcceptance: null
          }
        : null,
      frameworkSchemaAvailable: false
    }
  }
}

export async function GET(request, { params }) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth?.ok) {
    return errorJson(auth?.message || "api.common.unauthorized", auth?.status || 401, locale, {
      redirect: auth?.redirect,
      requireSubscription: auth?.requireSubscription
    })
  }

  const id = await resolveRouteId(params)
  if (!id) {
    return errorJson("documents.errors.missing_id", 400, locale)
  }

  try {
    const { document } = await findDocumentWithFrameworkState(id)
    if (!document) {
      return errorJson("documents.errors.not_found", 404, locale)
    }
    assertOwnedByUser(document, auth.userId)

    return json({
      ok: true,
      document: serializeDocument(document)
    })
  } catch (error) {
    if (error?.status === 403) {
      return errorJson("api.common.forbidden", 403, locale)
    }
    console.error("[documents] read failed", error)
    return errorJson("documents.errors.read_failed", 500, locale)
  }
}

export async function PATCH(request, { params }) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth?.ok) {
    return errorJson(auth?.message || "api.common.unauthorized", auth?.status || 401, locale, {
      redirect: auth?.redirect,
      requireSubscription: auth?.requireSubscription
    })
  }

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "documents_update",
    userId: auth.userId,
    limit: DOCUMENTS_MUTATION_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  const id = await resolveRouteId(params)
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
    const { document: existing, frameworkSchemaAvailable } = await findDocumentWithFrameworkState(id)
    if (!existing) {
      return errorJson("documents.errors.not_found", 404, locale)
    }
    assertOwnedByUser(existing, auth.userId)
    if (frameworkSchemaAvailable && existing.frameworkAcceptance) {
      return errorJson("documents.errors.read_only_document", 403, locale)
    }

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
      },
      select: {
        id: true,
        ownerId: true,
        title: true,
        originalName: true,
        kind: true,
        templateFor: true,
        agentAllowed: true,
        mime: true,
        size: true,
        storagePath: true,
        createdAt: true,
        updatedAt: true
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
      document: serializeDocument({
        ...document,
        frameworkAcceptance: null
      })
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
  if (!auth?.ok) {
    return errorJson(auth?.message || "api.common.unauthorized", auth?.status || 401, locale, {
      redirect: auth?.redirect,
      requireSubscription: auth?.requireSubscription
    })
  }

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "documents_delete",
    userId: auth.userId,
    limit: DOCUMENTS_MUTATION_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  const id = await resolveRouteId(params)
  if (!id) {
    return errorJson("documents.errors.missing_id", 400, locale)
  }

  try {
    const { document: existing, frameworkSchemaAvailable } = await findDocumentWithFrameworkState(id)
    if (!existing) {
      return errorJson("documents.errors.not_found", 404, locale)
    }
    assertOwnedByUser(existing, auth.userId)
    if (frameworkSchemaAvailable && existing.frameworkAcceptance) {
      return errorJson("documents.errors.read_only_document", 403, locale)
    }

    const deletedDocument = await deleteDocumentRecordAndFile({
      deleteRecord: () => prisma.userDocument.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          originalName: true,
          kind: true,
          storagePath: true
        }
      }),
      deleteFile: (document) => deleteStoredDocument(document.storagePath),
      onFileDeleteError: (cleanupError, document) => {
        console.error("[documents] delete cleanup failed", {
          documentId: document?.id,
          storagePath: document?.storagePath,
          error: cleanupError
        })
      }
    })

    await logDocumentsAudit("document.deleted", {
      userId: auth.userId,
      documentId: deletedDocument.id,
      title: deletedDocument.title,
      originalName: deletedDocument.originalName,
      kind: deletedDocument.kind
    })

    return json({
      ok: true,
      id: deletedDocument.id
    })
  } catch (error) {
    if (error?.status === 403) {
      return errorJson("api.common.forbidden", 403, locale)
    }
    console.error("[documents] delete failed", error)
    return errorJson("documents.errors.delete_failed", 500, locale)
  }
}
