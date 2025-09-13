// components/backgrounds/LaserFlowOverlay.jsx
"use client";

import { useEffect, useState } from "react";

/* ——— utils ——— */
function useIsDesktop() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mqW = window.matchMedia("(min-width: 1024px)");
    const mqP = window.matchMedia("(pointer: fine)");
    const update = () => setOk(mqW.matches && mqP.matches);
    update();
    mqW.addEventListener("change", update);
    mqP.addEventListener("change", update);
    return () => {
      mqW.removeEventListener("change", update);
      mqP.removeEventListener("change", update);
    };
  }, []);
  return ok;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** Mount ainult siis, kui brauser on idle (ei jälgi hiirt ega klahve). */
function useIdleMount(enabled, timeout = 900) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let id = 0, tid = 0, cancelled = false;
    const done = () => { if (!cancelled) setReady(true); };
    if ("requestIdleCallback" in window) {
      // @ts-ignore
      id = window.requestIdleCallback(done, { timeout });
    } else {
      tid = window.setTimeout(done, timeout);
    }
    return () => {
      cancelled = true;
      // @ts-ignore
      if (id) window.cancelIdleCallback?.(id);
      if (tid) window.clearTimeout(tid);
    };
  }, [enabled, timeout]);
  return ready;
}

/* ——— komponent ——— */
export default function LaserFlowOverlay({ zIndex = 1, opacity = 1 }) {
  const isDesktop = useIsDesktop();
  const reduced   = usePrefersReducedMotion();
  const ready     = useIdleMount(isDesktop && !reduced, 900);

  // laeme LaserFlow alles siis, kui idle
  const [LaserFlow, setLaserFlow] = useState(null);
  useEffect(() => {
    if (!isDesktop || !ready || reduced) return;
    let alive = true;
    import("./LaserFlow").then((m) => {
      if (alive) setLaserFlow(() => m.default);
    });
    return () => { alive = false; };
  }, [isDesktop, ready, reduced]);

  if (!isDesktop || reduced || !ready || !LaserFlow) return null;

  // BASIC preset (hiire/udu puudub). Läbipaistvust juhi konteineri 'opacity' kaudu.
  const preset = {
    color: "#262b47",
    horizontalBeamOffset: 0.00,
    verticalBeamOffset:   -0.41,
    verticalSizing:       1.15,
    horizontalSizing:      0.55,
    flowSpeed:             0.20,
    flowStrength:          0.20,
    wispDensity:           0.40,
    wispSpeed:             3,
    wispIntensity:         20,
    dpr: 1,        // madal DPI
    maxFps: 24,    // kaadrisageduse throttle (vajab LaserFlow maxFps tuge)
  };

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex,           // jäta <Particles> ettepoole (nt z-index: 2 CSS-is)
        pointerEvents: "none",
        opacity: 0.6,          // nt 0.7 kui soovid õrnema efekti
      }}
    >
      <LaserFlow {...preset} />
    </div>
  );
}
