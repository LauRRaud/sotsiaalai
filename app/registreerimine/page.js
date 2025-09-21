import { Suspense } from "react";
import RegistreerimineBody from "@/components/alalehed/RegistreerimineBody";

export const metadata = {
  title: "Loo konto – SotsiaalAI",
  description: "Registreeru SotsiaalAI platvormil ja saa ligipääs rollipõhisele tehisintellektile.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegistreerimineBody />
    </Suspense>
  );
}
