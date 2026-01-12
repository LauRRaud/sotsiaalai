export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.chat || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/vestlus",
    title: meta.title || "Vestlus / SotsiaalAI",
    description:
      meta.description ||
      "Vestle SotsiaalAI rollipõhise AI-assistendiga, kes aitab leida infot õiguste, toetuste ja teenuste kohta.",
    openGraph: { type: "article" },
  });
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const roomId = resolvedSearchParams?.roomId || null;
  const profile = resolvedSearchParams?.profile || null;

  const params = new URLSearchParams();
  params.set("mode", "chat");
  if (roomId) params.set("roomId", String(roomId));
  if (profile) params.set("profile", String(profile));
  redirect(`/?${params.toString()}`);
}
