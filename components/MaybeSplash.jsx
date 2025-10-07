"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Laeme SplashCursor ainult browseris (ssr: false) ja ainult kui vaja
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function MaybeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const toMql = (query) => (typeof window.matchMedia === "function" ? window.matchMedia(query) : null);
    const pointerFine = toMql("(pointer: fine)");
    const pointerCoarse = toMql("(pointer: coarse)");
    const hoverCapable = toMql("(hover: hover)");

    const canShow = () => {
      const widthOk = window.innerWidth >= 768;
      const fine = pointerFine?.matches ?? false;
      const coarse = pointerCoarse?.matches ?? false;
      const hover = hoverCapable?.matches ?? false;
      return widthOk && fine && hover && !coarse;
    };

    const update = () => setShow(canShow());
    update();

    const attach = (mql) => {
      if (!mql) return () => {};
      const handler = () => update();
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      }
      if (typeof mql.addListener === "function") {
        mql.addListener(handler);
        return () => mql.removeListener(handler);
      }
      return () => {};
    };

    const cleanups = [attach(pointerFine), attach(pointerCoarse), attach(hoverCapable)];
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      cleanups.forEach((dispose) => dispose && dispose());
    };
  }, []);

  return show ? <SplashCursor /> : null;
}

