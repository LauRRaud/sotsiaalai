"use client";

import { useEffect, useState, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import Space from "../Space"; // SSR-import → kohe nähtav

const SplashCursor = dynamic(() => import("../SplashCursor"), { ssr: false });
const Particles    = dynamic(() => import("./Particles"), { ssr: false });

function getHtmlMode() {
  return document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
}

// idle helper
function onIdle(cb, timeout = 800) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(cb, timeout);
  return () => window.clearTimeout(t);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function BackgroundLayer() {
  const [mode, setMode] = useState("dark");

  // loe lipp enne esimest renderit (et vältida vale hetkeks animatsiooni)
  const [skipIntro, setSkipIntro] = useState(() => {
    try {
      return sessionStorage.getItem("saai-bg-intro-done") === "1";
    } catch {
      return false;
    }
  });

  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // märgi esimene külastus selles sakis
    try {
      if (!skipIntro) {
        sessionStorage.setItem("saai-bg-intro-done", "1");
      }
    } catch {}
  }, [skipIntro]);

  useEffect(() => {
    const sync = () => setMode(getHtmlMode());
    sync();
    window.addEventListener("themechange", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("themechange", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // lae kergemad efektid hiljem
  useEffect(() => {
    if (prefersReduced) return;
    const cancelP = onIdle(() => setParticlesReady(true), 600);
    const cancelC = onIdle(() => setCursorReady(true), 1000);
    return () => { cancelP?.(); cancelC?.(); };
  }, [prefersReduced]);

  // udu animeerub ainult esimesel renderil samas sakis
  const animateFog = useMemo(() => !skipIntro && !prefersReduced, [skipIntro, prefersReduced]);

  return (
    <>
      {/* Taust on kohe olemas; ei kasuta key'd → ei remount'i teema vahetusel */}
      <Space mode={mode} animateFog={animateFog} />

      {particlesReady && <Particles mode={mode} />}
      {cursorReady && <SplashCursor />}
    </>
  );
}

export default memo(BackgroundLayer);
