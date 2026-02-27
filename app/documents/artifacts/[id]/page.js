import { cookies } from "next/headers"
import ArtifactDetailPage from "@/components/documents/ArtifactDetailPage"
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n"
import { buildLocalizedMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookies(cookieStore)
  const messages = getMessagesSync(locale)
  const meta = messages?.documents?.meta || {}

  return buildLocalizedMetadata({
    locale,
    pathname: "/documents/artifacts/[id]",
    title: meta.artifactTitle || meta.title || "Agendi tulemus",
    description: meta.artifactDescription || meta.description || ""
  })
}

export default async function Page({ params }) {
  const resolvedParams = await params
  return <ArtifactDetailPage artifactId={resolvedParams?.id} />
}
