// app/registreerimine/page.js
import { Suspense } from "react";
import RegistreeriminePageClient from "@/components/RegistreeriminePageClient";

export const metadata = {
  title: "Loo konto – SotsiaalAI",
  description: "Registreeru SotsiaalAI platvormil ja saa ligipääs rollipõhisele tehisintellektile.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegistreeriminePageClient />
    </Suspense>
  );
}
