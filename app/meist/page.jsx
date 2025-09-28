import { auth } from "@/auth";
import MeistBody from "@/components/alalehed/MeistBody";

export const metadata = {
  title: "Meist – SotsiaalAI",
  description:
    "SotsiaalAI on sotsiaalne ettevõte, mis pakub tehisintellekti-põhist tuge sotsiaaltöö spetsialistidele ja eluküsimusega pöördujatele.",
};

export default async function Page() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return <MeistBody isAdmin={isAdmin} />;
}
