import { prisma } from "@/lib/prisma"
import { effectiveRoleFromSession } from "@/lib/authz"
import {
  ARTIFACT_LIST_LIMIT,
  ARTIFACT_LIST_LIMIT_ALL,
  MAX_ARTIFACT_SOURCE_DOCUMENTS
} from "@/lib/documents/constants"
import { logDocumentsAudit } from "@/lib/documents/audit"
import {
  normalizeArtifactContent,
  normalizeArtifactTitle,
  normalizeArtifactType,
  normalizeSelectedDocumentIds,
  serializeArtifact
} from "@/lib/documents/artifacts"
import {
  generateArtifactDraftContent,
  normalizeAgentAudience,
  normalizeAgentInstruction,
  normalizeAgentLanguage,
  normalizeAgentLength,
  normalizeAgentTone
} from "@/lib/documents/generation"
import { getCachedRetrievalDebugMeta } from "@/lib/documents/retrievalObservability"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import { errorJson, json, localeFromRequest, requireDocumentUser } from "@/lib/documents/server"
import { getStorageQuotaBytes, getUtf8ByteLength } from "@/lib/storageGuardrails"
import { getUserStorageUsageBytes } from "@/lib/storageUsage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DOCUMENTS_RATE_LIMIT_WINDOW_MS = readDocumentsRateLimit(process.env.DOCUMENTS_RATE_LIMIT_WINDOW_MS, 60_000, 1000)
const ARTIFACTS_CREATE_RATE_LIMIT_MAX = readDocumentsRateLimit(process.env.ARTIFACTS_CREATE_RATE_LIMIT_MAX, 20)

const artifactInclude = {
  template: {
    select: {
      id: true,
      title: true,
      originalName: true
    }
  },
  sourceDocuments: {
    include: {
      document: {
        select: {
          id: true,
          title: true,
          originalName: true,
          kind: true,
          templateFor: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  }
}

function clampLimit(value, fallback = ARTIFACT_LIST_LIMIT) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(Math.floor(parsed), ARTIFACT_LIST_LIMIT_ALL)
}

function parseIncludeContent(value) {
  const normalized = String(value || "").trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes"
}

function buildRetrievalAuditFields(debugMeta) {
  if (!debugMeta) return {}
  return {
    retrievalMode: debugMeta.retrieval_mode || null,
    chunksUsed: Number(debugMeta.chunks_used) || 0,
    fallbackUsed: debugMeta.retrieval_mode === "fallback_source_material",
    fallbackReason: debugMeta.fallback_reason || null,
    documentsIndexed: Number(debugMeta.documents_indexed) || 0,
    tokenBudget: Number(debugMeta.token_budget) || 0
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
  const limit = clampLimit(requestUrl.searchParams.get("limit"), ARTIFACT_LIST_LIMIT)
  const includeContent = parseIncludeContent(requestUrl.searchParams.get("includeContent"))

  try {
    const artifacts = await prisma.agentArtifact.findMany({
      where: {
        ownerId: auth.userId
      },
      include: artifactInclude,
      orderBy: {
        updatedAt: "desc"
      },
      take: limit
    })

    return json({
      ok: true,
      artifacts: artifacts.map((artifact) => serializeArtifact(artifact, { includeContent }))
    })
  } catch (error) {
    console.error("[documents artifacts] list failed", error)
    return errorJson("documents.artifacts.errors.list_failed", 500, locale)
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
    scope: "artifacts_create",
    userId: auth.userId,
    limit: ARTIFACTS_CREATE_RATE_LIMIT_MAX,
    windowMs: DOCUMENTS_RATE_LIMIT_WINDOW_MS
  })
  if (rateLimitResponse) return rateLimitResponse

  let body = {}
  try {
    body = await request.json()
  } catch {
    return errorJson("documents.errors.invalid_payload", 400, locale)
  }

  let selectedDocumentIds
  try {
    selectedDocumentIds = normalizeSelectedDocumentIds(body?.documentIds)
  } catch (error) {
    return errorJson(error?.message || "documents.artifacts.errors.sources_required", Number(error?.status) || 400, locale)
  }

  const type = normalizeArtifactType(body?.type)
  const title = normalizeArtifactTitle(body?.title)
  const templateId = String(body?.templateId || "").trim() || null
  const hasProvidedContent = body?.content !== undefined
  let instruction = ""
  let audience = "worker"
  let tone = "professional"
  let language = locale
  let length = "standard"
  let content = ""

  try {
    content = hasProvidedContent ? normalizeArtifactContent(body?.content) : ""
    instruction = normalizeAgentInstruction(body?.instruction)
    audience = normalizeAgentAudience(body?.audience)
    tone = normalizeAgentTone(body?.tone)
    language = normalizeAgentLanguage(body?.language, locale)
    length = normalizeAgentLength(body?.length)
  } catch (error) {
    return errorJson(error?.message || "documents.errors.invalid_payload", Number(error?.status) || 400, locale)
  }

  try {
    const documents = await prisma.userDocument.findMany({
      where: {
        ownerId: auth.userId,
        id: {
          in: selectedDocumentIds
        }
      },
      select: {
        id: true,
        title: true,
        originalName: true,
        kind: true,
        templateFor: true,
        agentAllowed: true,
        mime: true,
        storagePath: true,
        sha256: true,
        updatedAt: true
      }
    })

    if (documents.length !== selectedDocumentIds.length) {
      return errorJson("documents.artifacts.errors.sources_not_found", 404, locale)
    }

    const notAllowed = documents.find((document) => !document.agentAllowed)
    if (notAllowed) {
      return errorJson("documents.artifacts.errors.source_not_allowed", 400, locale)
    }

    let template = null
    if (templateId) {
      template = await prisma.userDocument.findFirst({
        where: {
          id: templateId,
          ownerId: auth.userId,
          kind: "TEMPLATE"
        },
        select: {
          id: true,
          title: true,
          originalName: true,
          agentAllowed: true,
          mime: true
        }
      })

      if (!template) {
        return errorJson("documents.artifacts.errors.template_not_found", 404, locale)
      }

      if (!template.agentAllowed) {
        return errorJson("documents.artifacts.errors.template_not_allowed", 400, locale)
      }
    }

    let generatedDebugMeta = null
    const finalContent = hasProvidedContent
      ? content
      : await (async () => {
          const generated = await generateArtifactDraftContent({
            type,
            documents,
            templateTitle: template?.title || null,
            instruction,
            audience,
            tone,
            language,
            length,
            observabilityRoute: "api/documents/artifacts",
            observabilityStage: "document_generate",
            userId: auth.userId
          })
          generatedDebugMeta = generated?.debugMeta || null
          return generated?.content || ""
        })()

    const cachedDebugMeta = hasProvidedContent
      ? getCachedRetrievalDebugMeta(auth.userId, finalContent)
      : null
    const debugMeta = generatedDebugMeta || cachedDebugMeta || null
    const role = effectiveRoleFromSession(auth.session)
    const storageQuotaBytes = getStorageQuotaBytes(role)
    const storageUsageBytes = await getUserStorageUsageBytes(auth.userId)
    const finalContentBytes = getUtf8ByteLength(finalContent)

    if (storageUsageBytes.totalBytes >= storageQuotaBytes || storageUsageBytes.totalBytes + finalContentBytes > storageQuotaBytes) {
      return errorJson("documents.errors.storage_quota_exceeded", 413, locale, {
        scope: "storage_quota",
        limit: storageQuotaBytes,
        used: storageUsageBytes.totalBytes
      })
    }

    const artifact = await prisma.agentArtifact.create({
      data: {
        ownerId: auth.userId,
        type,
        title,
        status: "DRAFT",
        content: finalContent,
        templateId: template?.id || null,
        sourceDocuments: {
          createMany: {
            data: documents.slice(0, MAX_ARTIFACT_SOURCE_DOCUMENTS).map((document) => ({
              documentId: document.id
            }))
          }
        }
      },
      include: artifactInclude
    })

    await logDocumentsAudit("artifact.created", {
      userId: auth.userId,
      artifactId: artifact.id,
      type: artifact.type,
      title: artifact.title,
      templateId: artifact.templateId,
      sourceCount: artifact.sourceDocuments.length,
      ...buildRetrievalAuditFields(debugMeta)
    })

    return json(
      {
        ok: true,
        artifact: serializeArtifact(artifact, { includeContent: true })
      },
      201
    )
  } catch (error) {
    const status = Number(error?.status) || 500
    const messageKey =
      status === 500 ? "documents.artifacts.errors.create_failed" : error?.message || "documents.artifacts.errors.create_failed"
    console.error("[documents artifacts] create failed", error)
    return errorJson(messageKey, status, locale)
  }
}
