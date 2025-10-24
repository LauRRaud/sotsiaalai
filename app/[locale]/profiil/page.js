import { Suspense } from "react";
import ProfiilBody from "@/components/alalehed/ProfiilBody";

export const metadata = {
  title: "Minu profiil – SotsiaalAI",
  description: "Halda oma profiili ja kontoandmeid SotsiaalAI platvormil.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfiilBody />
    </Suspense>
  );
}
