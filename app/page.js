// app/page.js
import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import OpeningBanner from "@/components/OpeningBanner";

export const metadata = {
  title: "SotsiaalAI – Tehisintellekt sotsiaaltöös ja elulistes küsimustes",
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
};

export default function Page() {
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

      {/* AVAMISTEADE – renderdatakse portaalina body alla, ei muuda layout'i */}
      <OpeningBanner text="Peagi avame!" top={96} />

      {/* Mähi HomePage Suspense'iga */}
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    </>
  );
}
