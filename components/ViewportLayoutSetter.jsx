"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
const MOBILE_QUERY = "(max-width: 768px)";
function applyLayoutFlag(matches) {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  if (matches) {
    root.setAttribute("data-layout", "mobile");
    body.setAttribute("data-layout", "mobile");
  } else {
    root.removeAttribute("data-layout");
    body.removeAttribute("data-layout");
  }
}
function applyVhVar() {
  const vh = (typeof window !== "undefined" && window.visualViewport ? window.visualViewport.height : typeof window !== "undefined" ? window.innerHeight : 0) * 0.01;
  if (vh) document.documentElement.style.setProperty("--vh", `${vh}px`);
}
export default function ViewportLayoutSetter() {
  const pathname = usePathname();
  const lastFocusedPathRef = useRef(null);
  const hasFocusedOnceRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(MOBILE_QUERY);
    applyLayoutFlag(mql.matches);
    applyVhVar();
    const onMqChange = e => applyLayoutFlag(e.matches);
    const onResize = () => {
      window.requestAnimationFrame(() => applyVhVar());
    };
    const onPageShow = () => {
      applyLayoutFlag(mql.matches);
      applyVhVar();
    };
    mql.addEventListener?.("change", onMqChange);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("pageshow", onPageShow);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      mql.removeEventListener?.("change", onMqChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("pageshow", onPageShow);
      window.visualViewport?.removeEventListener("resize", onResize);
      applyLayoutFlag(false);
    };
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main");
    if (!hasFocusedOnceRef.current) {
      hasFocusedOnceRef.current = true;
      lastFocusedPathRef.current = pathname;
      return;
    }
    const alreadyFocused = document.activeElement === main || lastFocusedPathRef.current === pathname;
    if (!main || alreadyFocused) return;
    lastFocusedPathRef.current = pathname;
    window.requestAnimationFrame(() => {
      try {
        main.focus();
      } catch {}
    });
  }, [pathname]);
  return null;
}