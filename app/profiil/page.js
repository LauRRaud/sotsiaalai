import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.profile || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/profiil",
    title: meta.title || "Profile - SotsiaalAI",
    description: meta.description || ""
  });
}
export default async function Page() {
  redirect("/?mode=chat&profile=1");
}
