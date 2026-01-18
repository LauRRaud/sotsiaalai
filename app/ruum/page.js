export const dynamic = "force-dynamic";
export const revalidate = 0;
import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import RoomsPage from "@/components/rooms/RoomsPage";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.rooms || messages?.meta?.chat || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/ruum",
    title: meta.title || "Ruumid ƒ?¦ SotsiaalAI",
    description:
      meta.description ||
      "Ruumid puuduvad. Grupivestluse jaoks lisa vestlusesse inimene.",
    openGraph: {
      type: "article"
    }
  });
}
export default function Page() {
  return <RoomsPage />;
}
