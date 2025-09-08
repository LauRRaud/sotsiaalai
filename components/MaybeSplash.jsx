"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Laeme SplashCursor ainult browseris (ssr: false) ja ainult kui vaja
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function MaybeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setShow(true);
      }
    }
  }, []);

  return show ? <SplashCursor /> : null;
}
