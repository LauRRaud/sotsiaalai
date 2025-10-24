// app/meist/page.jsx — serverikomponent
import { auth } from "@/auth";
import MeistBody from "@/components/alalehed/MeistBody";

export const metadata = {
  title: "Meist — SotsiaalAI",
  description:
    "SotsiaalAI on tehisintellekti toel töötav platvorm sotsiaalvaldkonna spetsialistidele ja abiotsijatele.",
};
export const dynamic = "force-dynamic";
export default async function MeistPage() {
  const session = await auth();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;

  return <MeistBody isAdmin={isAdmin} />;
}
