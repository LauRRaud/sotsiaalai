import { cookies } from "next/headers"
import { getServerSession } from "next-auth"

import { authConfig } from "@/auth"
import MaterialsPage from "@/components/materials/MaterialsPage"
import { isAdmin } from "@/lib/authz"
import { getLocaleFromCookies } from "@/lib/i18n"
import { buildLocalizedMetadata } from "@/lib/metadata"

export async function generateMetadata() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookies(cookieStore)

  return buildLocalizedMetadata({
    locale,
    pathname: "/materjalid",
    title: "Materjalide jagamine",
    description: "Leht, kuhu saab üles laadida õppematerjale ja dokumente koos kommentaariga."
  })
}

export default async function Page() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookies(cookieStore)
  const session = await getServerSession(authConfig).catch(() => null)

  return <MaterialsPage isAdmin={isAdmin(session?.user)} locale={locale} />
}
