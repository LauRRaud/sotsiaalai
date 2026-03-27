import { cookies } from "next/headers";
import HomePage from "@/components/HomePage";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.home || {};

  return buildLocalizedMetadata({
    locale,
    pathname: "/",
    // Keep the home document title short because some screen readers
    // announce repeated title updates during the initial page load.
    title: "SotsiaalAI",
    description: meta.description || ""
  });
}

export default function HomeRoot() {
  return <HomePage />;
}

