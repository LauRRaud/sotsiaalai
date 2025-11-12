// app/unustasin-pin/page.js
import { cookies } from "next/headers";
import UnustasinParooliBody from "@/components/alalehed/UnustasinParooliBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.reset || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/unustasin-pin",
    title: meta.title || "Update PIN code - SotsiaalAI",
    description: meta.description || "",
  });
}
export default function UnustasinParooliPage() {
  return <UnustasinParooliBody />;
}
