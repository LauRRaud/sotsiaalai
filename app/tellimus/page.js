import { Suspense } from "react";
import TellimusBody from "@/components/alalehed/TellimusBody";

export const metadata = {
  title: "Halda tellimust – SotsiaalAI",
  description: "Käivita või tühista oma SotsiaalAI kuutellimus.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TellimusBody />
    </Suspense>
  );
}
