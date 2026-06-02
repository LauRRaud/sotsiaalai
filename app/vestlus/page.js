export const dynamic = "force-dynamic";
export const revalidate = 0;
import "../styles/components/chat-shell.css";
import "../styles/components/chat-focus.shared.css";
import "../styles/components/workspace-help-listings.css";
import "../styles/components/selected-listing.css";
import "../styles/components/invite-modal.css";
import "../styles/components/service-map.css";
import "../styles/mobile/service-map.css";
import "../styles/components/documents-workspace.shared.css";
import "../styles/components/documents-ui.shared.css";
import "../styles/mobile/documents-ui.css";
import "../styles/components/documents-agent.css";
import "../styles/components/documents-library.css";
import "../styles/theme/mono.chat.css";
import "../styles/theme/mono.documents.css";
import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import ChatBody from "@/components/alalehed/ChatBody";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import { redirect } from "next/navigation";
import { localizePath } from "@/lib/localizePath";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.chat || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/vestlus",
    title: meta.title || "",
    description: meta.description || "",
    openGraph: {
      type: "article"
    }
  });
}
export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.profile === "1") {
    redirect(localizePath("/profiil", locale));
  }
  const loginRequested = resolvedSearchParams?.login === "1";
  const reason =
    typeof resolvedSearchParams?.reason === "string"
      ? resolvedSearchParams.reason.trim().toLowerCase()
      : "";
  const emailVerifiedEntry = reason === "email-verified";
  const roomIdRaw = resolvedSearchParams?.roomId;
  const roomId = typeof roomIdRaw === "string" ? roomIdRaw.trim() || null : null;
  return <>
      <ConversationDrawer>
        <ChatSidebar />
      </ConversationDrawer>
      <ChatBody
        roomId={roomId}
        requestLoginOnOpen={loginRequested || emailVerifiedEntry}
        emailVerifiedEntry={emailVerifiedEntry}
      />
    </>;
}
