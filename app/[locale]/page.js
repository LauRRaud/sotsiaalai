// app/[locale]/page.js
import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import OpeningBanner from "@/components/OpeningBanner";

export default function LocalePage({ params }) {
  const { locale } = params; // 'et' | 'ru' | 'en'

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

      {/* (Valikuline) avamisteade */}
      <OpeningBanner text="Peagi avame!" top={96} />

      {/* Keelespetsiifiline avaleht */}
      <Suspense fallback={null}>
        <HomePage locale={locale} />
      </Suspense>
    </>
  );
}
