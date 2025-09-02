export const metadata = {
  title: "SotsiaalAI – Tehisintellekt sotsiaaltööks ja elulisteks küsimusteks",
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
};

import HomePage from "@/components/HomePage";

export default function Page() {
  return (
    <>
      {/* Organization JSON-LD (valikuline) */}
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
      <HomePage />
    </>
  );
}