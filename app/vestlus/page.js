export const dynamic = "force-dynamic";
export const revalidate = 0;
import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import ChatBody from "@/components/alalehed/ChatBody";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import { redirect } from "next/navigation";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.chat || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/vestlus",
    title: meta.title || "Chat / SotsiaalAI",
    description: meta.description || "Chat with the SotsiaalAI assistant.",
    openGraph: {
      type: "article"
    }
  });
}
export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.profile === "1") {
    redirect("/profiil");
  }
  const roomId = resolvedSearchParams?.roomId || null;
  return <>
      <ConversationDrawer>
        <ChatSidebar />
      </ConversationDrawer>
      <ChatBody roomId={roomId} />
    </>;
}


