// app/meist/page.jsx — serverikomponent (NextAuth v4)
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import MeistBody from "@/components/alalehed/MeistBody";

export const metadata = {
  title: "Meist — SotsiaalAI",
  description:
    "SotsiaalAI on tehisintellekti toel töötav platvorm sotsiaalvaldkonna spetsialistidele ja abiotsijatele.",
};

export default async function MeistPage() {
  const session = await getServerSession(authConfig);
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;

  return <MeistBody isAdmin={isAdmin} />;
}
