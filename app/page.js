// app/page.js  (server-komponent – ära lisa "use client")
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { loadMessages } from "@/i18n/i18n";
import HomePage from "@/components/HomePage";
import OnboardingModal from "@/components/OnboardingModal";

export const metadata = {
  title: "SotsiaalAI",
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
};

// turvaline Cookie päise parsimine
function readCookieFromHeader(name, cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") return null;
  const found = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  if (!found) return null;
  const value = found.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function Page() {
  // ---- 1) loe päised (async API Next 16-s)
  const h = await headers();

  // ---- 2) proovi lugeda 'locale' Cookie päisest
  const cookieHeader = (h.get("cookie") || "").toString();
  const locale = readCookieFromHeader("locale", cookieHeader);

  // Kui keel on juba valitud → suuna keele avalehele
  if (locale) {
    redirect(`/${locale}`);
  }

  // ---- 3) vali modali vaikimisi keel Accept-Language'ist
  const accept = (h.get("accept-language") || "").toString().toLowerCase();
  const preferredLocale = accept.includes("et")
    ? "et"
    : accept.includes("ru")
    ? "ru"
    : "en";

  // ---- 4) lae i18n sõnumid (et HomePage saaks useTranslations() kasutada ka juurel)
  const messages = await loadMessages(preferredLocale);

  return (
    <>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SotsiaalAI",
            url: "https://sotsiaal.ai",
            logo: "https://sotsiaal.ai/logo/logomust.svg",
            sameAs: [],
          }),
        }}
      />

      {/* WebSite + SearchAction JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SotsiaalAI",
            url: "https://sotsiaal.ai",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://sotsiaal.ai/vestlus?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Avalehe sisu – wrapime i18n Provideriga */}
      <NextIntlClientProvider locale={preferredLocale} messages={messages}>
        <Suspense fallback={null}>
          <HomePage />
        </Suspense>

        {/* Esmakülastuse modal – salvestab prefsid ja 303/200 → /{locale} */}
        <OnboardingModal
          isOpen
          preferredLocale={preferredLocale}
          initialContrast="normal"
          initialFontSize="md"
          initialMotion="normal"
          nextPath={null}
        />
      </NextIntlClientProvider>
    </>
  );
}
