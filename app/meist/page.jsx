// app/meist/page.jsx
import { cookies } from "next/headers";
import MeistBody from "@/components/alalehed/MeistBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.about || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/meist",
    title: meta.title || (locale === "ru" ? "О нас — SotsiaalAI" : locale === "en" ? "About — SotsiaalAI" : "Meist — SotsiaalAI"),
    description: meta.description || "",
  });
}
export default async function MeistPage() {
  const session = await getServerSession(authConfig);
  const isAdmin = !!(
    session?.user?.isAdmin === true ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN"
  );
  return <MeistBody isAdmin={isAdmin} />;
}
