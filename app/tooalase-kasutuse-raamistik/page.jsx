import TooalaseRaamistikuBody from "@/components/alalehed/TooalaseRaamistikuBody";
import { buildLocalizedMetadata } from "@/lib/metadata";
import { loadFrameworkDocument } from "@/lib/frameworkDocument";

export const metadata = buildLocalizedMetadata({
  locale: "et",
  pathname: "/tooalase-kasutuse-raamistik",
  title: "Tööalase kasutuse raamistik",
  description:
    "SotsiaalAI tööalase kasutuse ja andmetöötluse raamistik spetsialistile ülevaatamiseks ja allalaadimiseks."
});

export default async function TooalaseRaamistikuPage() {
  let frameworkDocument = {
    title: "Tööalase kasutuse raamistik",
    prefaceBlocks: [],
    documentBlocks: []
  };

  try {
    frameworkDocument = await loadFrameworkDocument();
  } catch (error) {
    console.error("[framework-page] document load failed", error);
  }

  return <TooalaseRaamistikuBody frameworkDocument={frameworkDocument} />;
}
