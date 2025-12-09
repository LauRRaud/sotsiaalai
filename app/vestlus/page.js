export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import ChatBody from "@/components/alalehed/ChatBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.chat || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/vestlus",
    title: meta.title || "Vestlus \u2014 SotsiaalAI",
    description:
      meta.description ||
      "Vestle SotsiaalAI rollip\u00f5hise AI-assistendiga, kes aitab leida infot \u00f5iguste, toetuste ja teenuste kohta.",
    openGraph: { type: "article" },
  });
}

export default function Page({ searchParams }) {
  const roomId = searchParams?.roomId || null;

  return (
    <>
      {/* K\u00f5rvalsahtel, mis avaneb \u201cVestlused\u201d nupust */}
      <ConversationDrawer>
        <ChatSidebar />
      </ConversationDrawer>
      {/* P\u00f5hisisu */}
      <ChatBody roomId={roomId} />
    </>
  );
}
