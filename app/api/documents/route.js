import { prisma } from "@/lib/prisma"
import { DOCUMENT_LIST_LIMIT } from "@/lib/documents/constants"
import { logDocumentsAudit } from "@/lib/documents/audit"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import {
  deleteStoredDocument,
  ensureAllowedUpload,
  ensureDocumentsStorage,
  errorJson,
  getStoredDocumentPath,
  json,
  localeFromRequest,
  normalizeDocumentKind,
  normalizeDocumentTitle,
  normalizeTemplateFor,
  requireDocumentUser,
  writeUploadedFile
} from "@/lib/documents/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DOCUMENTS_RATE_LIMIT_WINDOW_MS = readDocumentsRateLimit(process.env.DOCUMENTS_RATE_LIMIT_WINDOW_MS, 60_000, 1000)
const DOCUMENTS_UPLOAD_RATE_LIMIT_MAX = readDocumentsRateLimit(process.env.DOCUMENTS_UPLOAD_RATE_LIMIT_MAX, 12)

function clampLimit(value, fallback = DOCUMENT_LIST_LIMIT) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(Math.floor(parsed), DOCUMENT_LIST_LIMIT)
}

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

export async function GET(request) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth?.ok) {
    return errorJson(auth?.message || "api.common.unauthorized", auth?.status || 401, locale, {
      redirect: auth?.redirect,
      requireSubscription: auth?.requireSubscription
    })
  }

  const requestUrl = new URL(request.url)
  const kindParam = String(requestUrl.searchParams.get("kind") || "").trim().toUpperCase()
  const kind = kindParam && kindParam !== "ALL" ? normalizeDocumentKind(kindParam) : null
  const limit = clampLimit(requestUrl.searchParams.get("limit"), DOCUMENT_LIST_LIMIT)

  try {
    const documents = await prisma.userDocument.findMany({
      where: {
        ownerId: auth.userId,
        ...(kind ? { kind } : {})
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: limit
    })

    return json({
      ok: true,
      documents: documents.map(serializeDocument)
    })
  } catch (error) {
    console.error("[documents] list failed", error)
    return errorJson("documents.errors.list_failed", 500, locale)
  }
}

export async function POST(request) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth?.ok) {
    return errorJson(auth?.message || "api.common.unauthorized", auth?.status || 401, locale, {
      redirect: auth?.redirect,
      requireSubscription: auth?.requireSubscription
    })
  }

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "documents_upload",
    userId: auth.userId,
    limit: DOCUMENTS_UPLOAD_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  let formData
  try {
    formData = await request.formData()
  } catch {
    return errorJson("documents.errors.multipart_required", 400, locale)
  }

  const file = formData.get("file")
  const kind = normalizeDocumentKind(formData.get("kind"))
  const templateFor = normalizeTemplateFor(formData.get("templateFor"), kind)
  const title = normalizeDocumentTitle(formData.get("title"), file?.name || "")

  let storagePath = ""
  let createdDocument = null

  try {
    const mime = ensureAllowedUpload(file)
    await ensureDocumentsStorage()
    storagePath = getStoredDocumentPath(file.name)
    const stored = await writeUploadedFile(file, storagePath, mime)

    const document = await prisma.userDocument.create({
      data: {
        ownerId: auth.userId,
        title,
        originalName: String(file.name || title),
        kind,
        templateFor,
        agentAllowed: false,
        mime,
        size: stored.size,
        sha256: stored.sha256,
        storagePath
      }
    })
    createdDocument = document

    await logDocumentsAudit("document.uploaded", {
      userId: auth.userId,
      documentId: createdDocument.id,
      title: createdDocument.title,
      originalName: createdDocument.originalName,
      kind: createdDocument.kind,
      templateFor: createdDocument.templateFor
    })

    return json(
      {
        ok: true,
        document: serializeDocument(document)
      },
      201
    )
  } catch (error) {
    if (storagePath) {
      try {
        await deleteStoredDocument(storagePath)
      } catch (cleanupError) {
        console.error("[documents] upload cleanup failed", cleanupError)
      }
    }

    const status = Number(error?.status) || 500
    const messageKey =
      status === 500 ? "documents.errors.upload_failed" : error?.message || "documents.errors.upload_failed"
    if (status === 500) {
      console.error("[documents] upload failed", error)
    }
    await logDocumentsAudit("document.upload_failed", {
      userId: auth.userId,
      title,
      originalName: String(file?.name || ""),
      kind,
      templateFor,
      status
    })
    return errorJson(messageKey, status, locale)
  }
}
