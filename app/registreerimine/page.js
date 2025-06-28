"use client";
import { useState } from "react";
import RegistreerimineBody from "@/components/alalehed/RegistreerimineBody";
import LoginModal from "@/components/LoginModal";

export default function RegistreeriminePage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <RegistreerimineBody openLoginModal={() => setLoginOpen(true)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}