import { cookies } from "next/headers";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.profile || {};
  return buildLocalizedMetadata({
    locale,
    pathname: "/profiil",
    title: meta.title || "",
    description: meta.description || ""
  });
}
export default function Page() {
  return <ProfiilBody />;
}



