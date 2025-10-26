import { Suspense } from "react";
import { cookies } from "next/headers";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
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
    title: meta.title || "Minu profiil – SotsiaalAI",
    description: meta.description || "",
  });
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfiilBody />
    </Suspense>
  );
}
