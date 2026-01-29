export const dynamic = "force-dynamic";
export const revalidate = 0;
import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import ChatBody from "@/components/alalehed/ChatBody";
import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import HomeAboutSection from "@/components/HomeSections/HomeAboutSection";
import HomeFooter from "@/components/HomeSections/HomeFooter";
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
  const roomId = resolvedSearchParams?.roomId || null;
  return <>
      <ConversationDrawer>
        <ChatSidebar />
      </ConversationDrawer>
      <div className="relative flex min-h-[100dvh] w-full flex-col items-stretch">
        <section className="flex flex-1 items-center justify-center px-[clamp(1.25rem,3vw,2rem)] py-[clamp(2.5rem,5vh,4.5rem)]">
          <ChatBody roomId={roomId} />
        </section>
        <HomeAboutSection />
        <HomeFooter />
      </div>
    </>;
}


