// components/backgrounds/LaserFlowOverlay.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/* ——— Wispi palett: oranžikas, must, hall ——— */
const WISP_PALETTE = [
  "#7E7970",  // hall (pt-500)
  "#232323",  // must
  "#B86C57",  // oranžikas
  "#996757",  // brand ~60%
  "#862406",  // brand ~45%
  "#1f1010",  // brand ~35%
  "#221714",  // brand ~25%
];

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

/** Mount ainult siis, kui brauser on idle. */
function useIdleMount(enabled, timeout = 900) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let idleId = null;
    let timeoutId = null;
    let cancelled = false;
    const done = () => { if (!cancelled) setReady(true); };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(done, { timeout });
    } else {
      timeoutId = window.setTimeout(done, timeout);
    }
    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [enabled, timeout]);
  return ready;
}

export default function LaserFlowOverlay({ zIndex = 1, opacity = 0.6 }) {
  const wrapRef = useRef(null);

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

  // px-offset (mõõdetakse 1x)
  const [beamPx, setBeamPx] = useState({ x: 0, y: 0 });

  // ——— TUNING / LUKUSTUS ———
  const TOP_AIR_PX       = 3;
  const TOP_CENTER_FRAC  = 1.12;
  const V_SIZE_FIXED     = 1.2;
  const H_SIZE_FIXED     = 0.38;
  const BASE_LIFT        = 0.8;

  useEffect(() => {
    if (!isDesktop || reduced) return;

    const topEl =
      document.querySelector("#nav-meist") ||
      document.querySelector(".top-center-link");
    const botEl =
      document.querySelector("#footer-logo-img") ||
      document.querySelector(".footer-logo-img");
    if (!topEl || !botEl) return;

    const getWH = () => {
      const w = wrapRef.current?.clientWidth  ?? document.documentElement.clientWidth  ?? window.innerWidth  ?? 1;
      const h = wrapRef.current?.clientHeight ?? document.documentElement.clientHeight ?? window.innerHeight ?? 1;
      return { W: w, H: h };
    };

    let t1, t2, r1;
    const measureOnce = () => {
      const { W, H } = getWH();
      const t = topEl.getBoundingClientRect();
      const b = botEl.getBoundingClientRect();

      const topX = t.left + t.width / 2;
      const topY = t.bottom + TOP_AIR_PX;
      const botX = b.left + b.width / 2;

      const cx = (topX + botX) / 2;

      const xPx = cx - W / 2;

      const vSize = V_SIZE_FIXED;
      const topCenterOffset = (H * TOP_CENTER_FRAC) / vSize;
      const centerY = topY + topCenterOffset;

      // NB: shaderis +Y üles → invert
      const yPx = -(centerY - H / 2);

      setBeamPx({ x: xPx, y: yPx });
    };

    r1 = requestAnimationFrame(() => {
      measureOnce();
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => { t1 = setTimeout(measureOnce, 60); });
      }
      t2 = setTimeout(measureOnce, 300);
    });

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isDesktop, reduced]);

  if (!isDesktop || reduced || !ready || !LaserFlow) return null;

  const preset = {
    color: "#202235",

    // PX-OFFSET lukus
    beamOffsetXPx: beamPx.x,
    beamOffsetYPx: beamPx.y,

    // Geomeetria
    verticalSizing:   V_SIZE_FIXED,
    horizontalSizing: H_SIZE_FIXED,
    baseLift:         BASE_LIFT,

    // Dünaamika
    flowSpeed:    0.2,
    flowStrength: 0.2,

    // Wisps
    wispDensity:   0.15,
    wispSpeed:     4,
    wispIntensity: 6,
    wispColors:    WISP_PALETTE,
    wispTint:      0.6,

    // ——— UUS: dither bandingu vastu ———
    ditherAmp:   0.08,   // ↑ tõstsid 0.0 → 0.08

    dpr: 1.2,
    maxFps: 24,
  };

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        pointerEvents: "none",
        opacity,
      }}
    >
      <LaserFlow {...preset} />
    </div>
  );
}
