import { cookies } from "next/headers";
import JourneyDashboard from "@/components/journey/JourneyDashboard";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.journey?.meta || {};

  return buildLocalizedMetadata({
    locale,
    pathname: "/teekond",
    title: meta.title || messages?.journey?.title || "Teekond",
    description: meta.description || ""
  });
}

export default function JourneyPage() {
  return <JourneyDashboard />;
}
