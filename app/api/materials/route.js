import { getServerSession } from "next-auth"

import { authConfig } from "@/auth"
import { assertAdmin, effectiveRoleFromSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import { errorJson, json, localeFromRequest } from "@/lib/documents/server"
import { getMaterialSubmissionSchemaMessage, isMaterialSubmissionSchemaError } from "@/lib/materials/compat"
import { getDailyUploadQuotaBytes, getMaterialsFileCountLimit, getStorageQuotaBytes, getUtcDayStart, sumFileBytes } from "@/lib/storageGuardrails"
import { getUserDailyUploadBytes, getUserStorageUsageBytes } from "@/lib/storageUsage"
import {
  deleteStoredMaterial,
  ensureAllowedUpload,
  ensureMaterialsStorage,
  getStoredMaterialPath,
  normalizeMaterialComment,
  writeUploadedMaterial
} from "@/lib/materials/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const MATERIALS_RATE_LIMIT_WINDOW_MS = readDocumentsRateLimit(process.env.MATERIALS_RATE_LIMIT_WINDOW_MS, 15 * 60_000, 1000)
const MATERIALS_UPLOAD_RATE_LIMIT_MAX = readDocumentsRateLimit(process.env.MATERIALS_UPLOAD_RATE_LIMIT_MAX, 8)
const MATERIALS_LIST_LIMIT = 100

function clampLimit(value, fallback = MATERIALS_LIST_LIMIT) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(Math.floor(parsed), MATERIALS_LIST_LIMIT)
}

function serializeSubmission(submission) {
  return {
    id: submission.id,
    comment: submission.comment,
    originalName: submission.originalName,
    mime: submission.mime,
    size: submission.size,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    submittedByUser: submission.submittedByUser
      ? {
          id: submission.submittedByUser.id,
          email: submission.submittedByUser.email
        }
      : null
  }
}

async function getOptionalSession() {
  return getServerSession(authConfig).catch(() => null)
}

export async function GET(request) {
  const locale = localeFromRequest(request)
  const session = await getOptionalSession()
  const authz = assertAdmin(session)

  if (!authz.ok) {
    return errorJson(authz.message || "api.common.forbidden", authz.status || 403, locale)
  }

  try {
    const requestUrl = new URL(request.url)
    const limit = clampLimit(requestUrl.searchParams.get("limit"))
    const submissions = await prisma.materialSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return json({
      ok: true,
      submissions: submissions.map(serializeSubmission)
    })
  } catch (error) {
    console.error("[materials] list failed", error)
    if (isMaterialSubmissionSchemaError(error)) {
      return errorJson(getMaterialSubmissionSchemaMessage(locale), 503, locale)
    }
    return errorJson("Materjalide nimekirja laadimine ebaõnnestus.", 500, locale)
  }
}

export async function POST(request) {
  const locale = localeFromRequest(request)
  const session = await getOptionalSession()
  const userId = session?.user?.id ? String(session.user.id) : ""

  const rateLimitResponse = enforceDocumentsRateLimit(request, {
    scope: "materials_upload",
    userId,
    limit: MATERIALS_UPLOAD_RATE_LIMIT_MAX,
    windowMs: MATERIALS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  let formData
  try {
    formData = await request.formData()
  } catch {
    return errorJson("Palun saada fail vormiandmetena.", 400, locale)
  }

  const files = formData
    .getAll("file")
    .filter((entry) => entry && typeof entry !== "string")
  const comment = normalizeMaterialComment(formData.get("comment"))
  const storedEntries = []

  try {
    if (!files.length) {
      return errorJson("documents.errors.file_required", 400, locale)
    }

    const maxFiles = getMaterialsFileCountLimit()
    if (files.length > maxFiles) {
      return errorJson("materials_page.errors.file_count_exceeded", 400, locale, {
        scope: "materials_files",
        limit: maxFiles,
        used: files.length
      })
    }

    const validatedFiles = files.map((file) => ({
      file,
      mime: ensureAllowedUpload(file),
      size: Number(file?.size || 0)
    }))
    const totalBytes = sumFileBytes(validatedFiles)

    if (userId) {
      const role = effectiveRoleFromSession(session)
      const storageQuotaBytes = getStorageQuotaBytes(role)
      const [storageUsageBytes, dailyUploadBytes] = await Promise.all([
        getUserStorageUsageBytes(userId),
        getUserDailyUploadBytes(userId, getUtcDayStart())
      ])

      if (storageUsageBytes.totalBytes + totalBytes > storageQuotaBytes) {
        return errorJson("materials_page.errors.storage_quota_exceeded", 413, locale, {
          scope: "storage_quota",
          limit: storageQuotaBytes,
          used: storageUsageBytes.totalBytes
        })
      }

      if (dailyUploadBytes + totalBytes > getDailyUploadQuotaBytes()) {
        return errorJson("materials_page.errors.daily_upload_quota_exceeded", 429, locale, {
          scope: "daily_upload",
          limit: getDailyUploadQuotaBytes(),
          used: dailyUploadBytes
        })
      }
    }

    await ensureMaterialsStorage()
    for (const entry of validatedFiles) {
      const { file, mime } = entry
      const storagePath = getStoredMaterialPath(file.name)
      const stored = await writeUploadedMaterial(file, storagePath, mime)
      storedEntries.push({
        file,
        mime,
        storagePath,
        stored
      })
    }

    const submissions = await prisma.$transaction(
      storedEntries.map((entry) =>
        prisma.materialSubmission.create({
          data: {
            submittedByUserId: userId || null,
            comment,
            originalName: String(entry.file.name || "material"),
            mime: entry.mime,
            size: entry.stored.size,
            sha256: entry.stored.sha256,
            storagePath: entry.storagePath
          },
          include: {
            submittedByUser: {
              select: {
                id: true,
                email: true
              }
            }
          }
        })
      )
    )

    const serialized = submissions.map(serializeSubmission)

    return json(
      {
        ok: true,
        count: serialized.length,
        submission: serialized[0] || null,
        submissions: serialized
      },
      201
    )
  } catch (error) {
    for (const entry of storedEntries) {
      try {
        await deleteStoredMaterial(entry.storagePath)
      } catch (cleanupError) {
        console.error("[materials] upload cleanup failed", cleanupError)
      }
    }

    if (isMaterialSubmissionSchemaError(error)) {
      return errorJson(getMaterialSubmissionSchemaMessage(locale), 503, locale)
    }

    const status = Number(error?.status) || 500
    if (status === 500) {
      console.error("[materials] upload failed", error)
    }
    return errorJson(status === 500 ? "Materjali üleslaadimine ebaõnnestus." : error?.message || "Materjali üleslaadimine ebaõnnestus.", status, locale)
  }
}
