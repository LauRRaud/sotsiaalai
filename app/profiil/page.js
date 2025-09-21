export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProfiilBody from "@/components/alalehed/ProfiilBody";

export const metadata = {
  title: "Minu profiil – SotsiaalAI",
  description:
    "Halda oma SotsiaalAI profiili ja tellimust. Ligipääs vestlustele ja teenustele ühest kohast.",
};

export default function Page() {
  return <ProfiilBody />;
}
