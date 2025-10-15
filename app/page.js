// app/page.js
import { Suspense } from "react";
import HomePage from "@/components/HomePage";

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

      {/* Lihtne teade avalehel */}
      <main className="flex justify-center pt-32 md:pt-40">
        <h1 className="text-4xl md:text-5xl font-semibold text-brand-primary select-none">
          Peagi avame!
        </h1>
      </main>
    </>
  );
}
