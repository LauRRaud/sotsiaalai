"use client";
import { useEffect, useState } from "react";
import DarkMode from "./DarkMode";

export default function DarkModeToggleWrapper({
  hidden = false,
  className = "",
  position = "top-center",   // "top-center" | "top-right" | "top-left"
  top = "0.5rem",
  offsetX = "0.75rem",
  hideOnBodyModal = true,    // peida automaatselt kui body.modal-open
}) {
  const [visibleByScroll, setVisibleByScroll] = useState(true);
  const [visibleByModal, setVisibleByModal] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Kerimisel peitmine (v.a reduced-motion)
  useEffect(() => {
    setMounted(true);
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (m?.matches) {
      setVisibleByScroll(true);
      return;
    }
    const onScroll = () => setVisibleByScroll(window.scrollY < 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Kuula body klassi "modal-open" (nt LoginModal)
  useEffect(() => {
    if (!hideOnBodyModal) return;
    const el = document.body;
    const check = () => setVisibleByModal(!el.classList.contains("modal-open"));
    // esialgne seis
    check();
    // MutationObserver jälgib klasside muutust
    const mo = new MutationObserver(check);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [hideOnBodyModal]);

  // Lõppnähtavus
  const show = mounted && !hidden && visibleByScroll && visibleByModal;

  // Positsioneerimine + ühtne transform (vältimaks “hüppeid”)
  const isCenter = position === "top-center";
  const basePos =
    position === "top-left"
      ? { left: offsetX }
      : position === "top-right"
      ? { right: offsetX }
      : { left: "50%" }; // top-center

  const shownTransform = isCenter ? "translate(-50%, 0)" : "translateY(0)";
  const hiddenTransform = isCenter ? "translate(-50%, -1rem)" : "translateY(-1rem)";

  return (
    <div
      className={`dm-toggle-fixed ${className}`}
      style={{
        position: "fixed",
        top,
        zIndex: 9999,
        transition: "opacity .35s ease, transform .35s ease",
        opacity: show ? 1 : 0,
        transform: show ? shownTransform : hiddenTransform,
        pointerEvents: show ? "auto" : "none",
        ...basePos,
      }}
      aria-hidden={!show}
    >
      <DarkMode />
    </div>
  );
}
