// app/registreerimine/page.js
import { Suspense } from "react";
import RegistreerimineBody from "@/components/alalehed/RegistreerimineBody";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegistreerimineBody />
    </Suspense>
  );
}
