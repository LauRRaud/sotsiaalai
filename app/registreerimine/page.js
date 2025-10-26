// app/registreerimine/page.js
import { Suspense } from "react";
import { cookies } from "next/headers";
import RegistreerimineBody from "@/components/alalehed/RegistreerimineBody";
import { getLocaleFromCookies, getMessagesSync } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const messages = getMessagesSync(locale);
  const meta = messages?.meta?.register || {};

  return buildLocalizedMetadata({
    locale,
    pathname: "/registreerimine",
    title: meta.title || "Loo konto – SotsiaalAI",
    description: meta.description || "",
  });
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegistreerimineBody />
    </Suspense>
  );
}
