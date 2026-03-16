import { getServerSession } from "next-auth"

import { authConfig } from "@/auth"
import { assertAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { errorJson, localeFromRequest } from "@/lib/documents/server"
import { getMaterialSubmissionSchemaMessage, isMaterialSubmissionSchemaError } from "@/lib/materials/compat"
import { buildDownloadHeaders, readStoredMaterial } from "@/lib/materials/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

async function resolveRouteId(paramsLike) {
  const params = await paramsLike
  return String(params?.id || "").trim()
}

export async function GET(request, { params }) {
  const locale = localeFromRequest(request)
  const session = await getServerSession(authConfig).catch(() => null)
  const authz = assertAdmin(session)

  if (!authz.ok) {
    return errorJson(authz.message || "api.common.forbidden", authz.status || 403, locale)
  }

  const id = await resolveRouteId(params)
  if (!id) {
    return errorJson("Materjali ID puudub.", 400, locale)
  }

  try {
    const submission = await prisma.materialSubmission.findUnique({
      where: { id }
    })
    if (!submission) {
      return errorJson("Materjali ei leitud.", 404, locale)
    }

    const fileBuffer = await readStoredMaterial(submission.storagePath)
    return new Response(fileBuffer, {
      status: 200,
      headers: buildDownloadHeaders(submission.originalName, submission.mime)
    })
  } catch (error) {
    console.error("[materials] download failed", error)
    if (isMaterialSubmissionSchemaError(error)) {
      return errorJson(getMaterialSubmissionSchemaMessage(locale), 503, locale)
    }
    return errorJson("Materjali allalaadimine ebaõnnestus.", 500, locale)
  }
}
