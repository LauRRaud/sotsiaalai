export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Vestlus – SotsiaalAI",
  description:
    "Vestle SotsiaalAI rollipõhise AI-assistendiga, kes aitab leida infot õiguste, toetuste ja teenuste kohta.",
};

import ChatBody from "@/components/alalehed/ChatBody";

export default function Page() {
  return <ChatBody />;
}
