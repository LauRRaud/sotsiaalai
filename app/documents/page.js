import { cookies } from "next/headers"
import DocumentsPage from "@/components/documents/DocumentsPage"
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n"
import { buildLocalizedMetadata } from "@/lib/metadata"
import { ARTIFACT_LIST_LIMIT, ARTIFACT_LIST_LIMIT_ALL } from "@/lib/documents/constants"

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
  const resolvedSearchParams = await searchParams
  const artifactsAll = String(resolvedSearchParams?.artifacts || "").trim().toLowerCase() === "all"
  return (
    <DocumentsPage
      initialArtifactLimit={artifactsAll ? ARTIFACT_LIST_LIMIT_ALL : ARTIFACT_LIST_LIMIT}
      artifactsExpanded={artifactsAll}
    />
  )
}
