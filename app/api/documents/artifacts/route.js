import { prisma } from "@/lib/prisma"
import {
  ARTIFACT_LIST_LIMIT,
  ARTIFACT_LIST_LIMIT_ALL,
  MAX_ARTIFACT_SOURCE_DOCUMENTS
} from "@/lib/documents/constants"
import { logDocumentsAudit } from "@/lib/documents/audit"
import {
  buildDraftArtifactContent,
  normalizeArtifactTitle,
  normalizeArtifactType,
  normalizeSelectedDocumentIds,
  serializeArtifact
} from "@/lib/documents/artifacts"
import { enforceDocumentsRateLimit, readDocumentsRateLimit } from "@/lib/documents/rateLimit"
import { errorJson, json, localeFromRequest, requireDocumentUser } from "@/lib/documents/server"

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

export async function GET(request) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth) {
    return errorJson("api.common.unauthorized", 401, locale)
  }

  const requestUrl = new URL(request.url)
  const limit = clampLimit(requestUrl.searchParams.get("limit"), ARTIFACT_LIST_LIMIT)

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
      artifacts: artifacts.map((artifact) => serializeArtifact(artifact, { includeContent: true }))
    })
  } catch (error) {
    console.error("[documents artifacts] list failed", error)
    return errorJson("documents.artifacts.errors.list_failed", 500, locale)
  }
}

export async function POST(request) {
  const locale = localeFromRequest(request)
  const auth = await requireDocumentUser()
  if (!auth) {
    return errorJson("api.common.unauthorized", 401, locale)
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
        mime: true
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

    const artifact = await prisma.agentArtifact.create({
      data: {
        ownerId: auth.userId,
        type,
        title,
        status: "DRAFT",
        content: buildDraftArtifactContent({
          type,
          documents,
          templateTitle: template?.title || null
        }),
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
      sourceCount: artifact.sourceDocuments.length
    })

    return json(
      {
        ok: true,
        artifact: serializeArtifact(artifact, { includeContent: true })
      },
      201
    )
  } catch (error) {
    console.error("[documents artifacts] create failed", error)
    return errorJson("documents.artifacts.errors.create_failed", 500, locale)
  }
}
