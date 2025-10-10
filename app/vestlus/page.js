export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Vestlus – SotsiaalAI",
  description:
    "Vestle SotsiaalAI rollipõhise AI-assistendiga, kes aitab leida infot õiguste, toetuste ja teenuste kohta.",
};

import ConversationDrawer from "@/components/alalehed/ConversationDrawer";
import ChatSidebar from "@/components/ChatSidebar";
import ChatBody from "@/components/alalehed/ChatBody";

export default function Page() {
  return (
    <>
      {/* Ülekatte sahtel, mis avaneb “☰ Vestlused” nupust */}
      <ConversationDrawer aria-label="Vestluste sahtel">
        <ChatSidebar />
      </ConversationDrawer>

      {/* Põhisisu */}
      <main role="main">
        <ChatBody />
      </main>
    </>
  );
}
