import { prisma } from "@/lib/prisma"
import { isFrameworkAcceptanceSchemaError } from "@/lib/frameworkAcceptanceCompat"
import { effectiveRoleFromSession } from "@/lib/authz"
import { DOCUMENT_LIST_LIMIT } from "@/lib/documents/constants"
import { buildPaginationMeta, parseListLimit, parseListOffset } from "@/lib/documents/listing"
import { logDocumentsAudit } from "@/lib/documents/audit"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import { getDailyUploadQuotaBytes, getStorageQuotaBytes, getUtcDayStart } from "@/lib/storageGuardrails"
import { getUserDailyUploadBytes, getUserStorageUsageBytes } from "@/lib/storageUsage"
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
import { safeError } from "@/lib/privacy/safeError"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DOCUMENTS_RATE_LIMIT_WINDOW_MS = readDocumentsRateLimit(process.env.DOCUMENTS_RATE_LIMIT_WINDOW_MS, 60_000, 1000)
const DOCUMENTS_UPLOAD_RATE_LIMIT_MAX = readDocumentsRateLimit(process.env.DOCUMENTS_UPLOAD_RATE_LIMIT_MAX, 12)

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
  const limit = parseListLimit(requestUrl.searchParams.get("limit"), {
    fallback: DOCUMENT_LIST_LIMIT,
    maxLimit: DOCUMENT_LIST_LIMIT
  })
  const offset = parseListOffset(requestUrl.searchParams.get("offset"))
  const where = {
    ownerId: auth.userId,
    ...(kind ? { kind } : {})
  }

  try {
    const [total, documents] = await prisma.$transaction([
      prisma.userDocument.count({ where }),
      prisma.userDocument.findMany({
        where,
        select: {
          id: true,
          title: true,
          originalName: true,
          kind: true,
          templateFor: true,
          agentAllowed: true,
          mime: true,
          size: true,
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
        },
        orderBy: {
          updatedAt: "desc"
        },
        skip: offset,
        take: limit
      })
    ])

    return json({
      ok: true,
      documents: documents.map(serializeDocument),
      pagination: buildPaginationMeta({ total, limit, offset })
    })
  } catch (error) {
    if (isFrameworkAcceptanceSchemaError(error)) {
      try {
        const [total, documents] = await Promise.all([
          prisma.userDocument.count({ where }),
          prisma.userDocument.findMany({
            where,
            select: {
              id: true,
              title: true,
              originalName: true,
              kind: true,
              templateFor: true,
              agentAllowed: true,
              mime: true,
              size: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: {
              updatedAt: "desc"
            },
            skip: offset,
            take: limit
          })
        ])

        return json({
          ok: true,
          documents: documents.map((document) => serializeDocument({
            ...document,
            frameworkAcceptance: null
          })),
          pagination: buildPaginationMeta({ total, limit, offset })
        })
      } catch (fallbackError) {
        console.error("[documents] legacy list fallback failed", safeError(fallbackError))
      }
    }
    console.error("[documents] list failed", safeError(error))
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
    const fileBytes = Number(file?.size || 0)
    const role = effectiveRoleFromSession(auth.session)
    const storageQuotaBytes = getStorageQuotaBytes(role)
    const [storageUsageBytes, dailyUploadBytes] = await Promise.all([
      getUserStorageUsageBytes(auth.userId),
      getUserDailyUploadBytes(auth.userId, getUtcDayStart())
    ])

    if (storageUsageBytes.totalBytes + fileBytes > storageQuotaBytes) {
      return errorJson("documents.errors.storage_quota_exceeded", 413, locale, {
        scope: "storage_quota",
        limit: storageQuotaBytes,
        used: storageUsageBytes.totalBytes
      })
    }

    if (dailyUploadBytes + fileBytes > getDailyUploadQuotaBytes()) {
      return errorJson("documents.errors.daily_upload_quota_exceeded", 429, locale, {
        scope: "daily_upload",
        limit: getDailyUploadQuotaBytes(),
        used: dailyUploadBytes
      })
    }

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
      },
      select: {
        id: true,
        title: true,
        originalName: true,
        kind: true,
        templateFor: true,
        agentAllowed: true,
        mime: true,
        size: true,
        createdAt: true,
        updatedAt: true
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
        document: serializeDocument({
          ...document,
          frameworkAcceptance: null
        })
      },
      201
    )
  } catch (error) {
    if (storagePath) {
      try {
        await deleteStoredDocument(storagePath)
      } catch (cleanupError) {
        console.error("[documents] upload cleanup failed", safeError(cleanupError))
      }
    }

    const status = Number(error?.status) || 500
    const messageKey =
      status === 500 ? "documents.errors.upload_failed" : error?.message || "documents.errors.upload_failed"
    if (status === 500) {
      console.error("[documents] upload failed", safeError(error))
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
