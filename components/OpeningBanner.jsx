"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function OpeningBanner({ text = "Peagi avame!" }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: !isMobile ? 96 : "auto",    // ülaosas desktopis
        bottom: isMobile ? 48 : "auto",  // all mobiilis
        zIndex: 2147483647,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: "#B88B7C", // veidi tumedam kui var(--brand-primary)
          fontFamily:
            "var(--font-aino-headline), var(--font-aino), Arial, sans-serif",
          fontWeight: 400,
          fontSize: isMobile
            ? "clamp(12px, 4vw, 30px)"   // mobiilivaade
            : "clamp(15px, 5vw, 40px)",  // desktopivaade
          letterSpacing: "0.02em",
          textAlign: "center",
        }}
      >
        {text}
      </h1>
    </div>,
    document.body
  );
}
