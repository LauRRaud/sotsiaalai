"use client";

import { Suspense, useState } from "react";
import RegistreerimineBody from "@/components/alalehed/RegistreerimineBody";
// Kui sinu LoginModal asub kaustas components/, kasuta seda importi:
import LoginModal from "@/components/LoginModal";
// Kui sul on ta hoopis components/modals/, kasuta:
// import LoginModal from "@/components/modals/LoginModal";

export default function Page() {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <>
      <Suspense fallback={null}>
        <RegistreerimineBody openLoginModal={() => setOpenLogin(true)} />
      </Suspense>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </>
  );
}
