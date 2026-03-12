import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import DocumentsPage from "@/components/documents/DocumentsPage"
import { requireSubscription, resolveSessionRoleState, roleFromSession } from "@/lib/authz"
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n"
import { buildLocalizedMetadata } from "@/lib/metadata"
import { ARTIFACT_LIST_LIMIT, ARTIFACT_LIST_LIMIT_ALL } from "@/lib/documents/constants"
import { localizePath } from "@/lib/localizePath"

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookies(cookieStore)
  const messages = getMessagesSync(locale)
  const meta = messages?.documents?.meta || {}

  return buildLocalizedMetadata({
    locale,
    pathname: "/documents",
    title: meta.title || "Dokumendid",
    description: meta.description || ""
  })
}

export default async function Page({ searchParams }) {
  const cookieStore = await cookies()
  const session = await getServerSession(authConfig).catch(() => null)
  const roleState = resolveSessionRoleState(session, cookieStore)
  const locale = getLocaleFromCookies(cookieStore)

  const gate = await requireSubscription(session, roleFromSession(session))
  if (!gate.ok) {
    redirect(localizePath(gate.redirect || "/tellimus", locale))
  }

  if (session?.user?.id && roleState.effectiveRole === "CLIENT") {
    redirect(localizePath("/agendireziim", locale))
  }

  const resolvedSearchParams = await searchParams
  const artifactsAll = String(resolvedSearchParams?.artifacts || "").trim().toLowerCase() === "all"
  return (
    <DocumentsPage
      initialArtifactLimit={artifactsAll ? ARTIFACT_LIST_LIMIT_ALL : ARTIFACT_LIST_LIMIT}
      artifactsExpanded={artifactsAll}
    />
  )
}
