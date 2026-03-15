import { cookies } from "next/headers";
import TooalaseRaamistikuBody from "@/components/alalehed/TooalaseRaamistikuBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { loadFrameworkDocument } from "@/lib/frameworkDocument";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const title = messages?.auth?.register?.worker_framework_title || "";
  const description = messages?.auth?.register?.worker_framework_note || "";

  return buildLocalizedMetadata({
    locale,
    pathname: "/tooalase-kasutuse-raamistik",
    title,
    description
  });
}

export default async function TooalaseRaamistikuPage() {
  const frameworkDocument = await loadFrameworkDocument().catch(() => ({
    title: "",
    prefaceBlocks: [],
    documentBlocks: []
  }));

  return <TooalaseRaamistikuBody frameworkDocument={frameworkDocument} />;
}
