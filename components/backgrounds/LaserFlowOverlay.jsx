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

/* desktop = ainult laiuse järgi, mitte pointer */
function useIsDesktop() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mqW = window.matchMedia("(min-width: 1024px)");
    const update = () => setOk(mqW.matches);
    update();
    mqW.addEventListener("change", update);
    return () => mqW.removeEventListener("change", update);
  }, []);
  return ok;
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
      // @ts-ignore
      idleId = window.requestIdleCallback(done, { timeout });
    } else {
      timeoutId = window.setTimeout(done, timeout);
    }
    return () => {
      cancelled = true;
      // @ts-ignore
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [enabled, timeout]);
  return ready;
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function LaserFlowOverlay({ zIndex = 1, opacity = 0.6 }) {
  const wrapRef = useRef(null);

  const isDesktop = useIsDesktop();
  const ready     = useIdleMount(isDesktop, 900); // ⟵ eemaldatud "reduced" gating

  // laeme LaserFlow alles siis, kui idle
  const [LaserFlow, setLaserFlow] = useState(null);
  useEffect(() => {
    if (!isDesktop || !ready) return; // ⟵ eemaldatud "reduced" gating
    let alive = true;
    import("./LaserFlow").then((m) => {
      if (alive) setLaserFlow(() => m.default);
    });
    return () => { alive = false; };
  }, [isDesktop, ready]);

  // px-offset (mõõdetakse 1x)
  const [beamPx, setBeamPx] = useState({ x: 0, y: 0 });

  // ——— TUNING / LUKUSTUS ———
  const V_SIZE_FIXED        = 1;
  const H_SIZE_FIXED        = 0.38;
  const BASE_LIFT           = 0.35;

  const BEAM_TOP_GAP_REM    = 1.25;
  const BEAM_BOTTOM_GAP_REM = 1.25;

  const BEAM_CENTER_FRAC    = 0.2; // 0 = nav-alt, 1 = alumine ankur
  const BEAM_OFFSET_REM     = -0.2;
  const BEAM_OFFSET_PX      = 150;
  const BEAM_BOTTOM_SLACK_PX = 10;

  const BEAM_HEIGHT_VH      = 550;
  const MIN_BEAM_HEIGHT_PX  = 420;
  const MAX_BEAM_HEIGHT_PX  = 650;

  useEffect(() => {
    if (!isDesktop) return; // ⟵ eemaldatud "reduced" gating

    const topEl =
      document.querySelector("#nav-meist") ||
      document.querySelector(".top-center-link");
    const botEl =
      document.querySelector("#footer-logo-img") ||
      document.querySelector(".footer-logo-img");
    if (!topEl) return;

    const getWH = () => {
      const w = wrapRef.current?.clientWidth ?? document.documentElement.clientWidth ?? window.innerWidth ?? 1;
      const h = wrapRef.current?.clientHeight ?? document.documentElement.clientHeight ?? window.innerHeight ?? 1;
      return { W: w, H: h };
    };

    let t1, t2, r1;
    const measureOnce = () => {
      const { W, H } = getWH();
      if (!W || !H) return;

      const topRect = topEl.getBoundingClientRect();
      const botRect = botEl?.getBoundingClientRect?.();

      const topX = topRect.left + topRect.width / 2;
      const botX = botRect ? (botRect.left + botRect.width / 2) : topX;
      const cx = (topX + botX) / 2;
      const xPx = cx - W / 2;

      const docEl = document.documentElement;
      const rootSize = Number.parseFloat(window.getComputedStyle(docEl).fontSize) || 16;
      const topGapPx = BEAM_TOP_GAP_REM * rootSize;
      const bottomGapPx = BEAM_BOTTOM_GAP_REM * rootSize;

      const topStart = topRect.bottom + topGapPx;
      const targetBottom = botRect ? Math.min(botRect.top - bottomGapPx, H) : H;

      const usableHeight = targetBottom - topStart;
      const desiredHeight = clamp((BEAM_HEIGHT_VH / 100) * H, MIN_BEAM_HEIGHT_PX, MAX_BEAM_HEIGHT_PX);

      let beamHeightPx = desiredHeight;
      if (usableHeight > 0) {
        if (usableHeight < MIN_BEAM_HEIGHT_PX) {
          beamHeightPx = Math.max(usableHeight, MIN_BEAM_HEIGHT_PX * 0.4);
        } else {
          beamHeightPx = Math.min(usableHeight, desiredHeight);
        }
      }

      const minCenter = topStart + beamHeightPx / 2;
      let maxCenterAvailable = (botRect ? Math.min(botRect.top - bottomGapPx, H) : H) - beamHeightPx / 2;
      const slack = Math.max(0, BEAM_BOTTOM_SLACK_PX);
      if ((maxCenterAvailable - minCenter) > slack) {
        maxCenterAvailable -= slack;
      }
      const maxCenter = Math.max(minCenter, maxCenterAvailable);

      const range = Math.max(0, maxCenter - minCenter);
      const baseCenter = minCenter + range * clamp(BEAM_CENTER_FRAC, 0, 1);
      const centerY = clamp(baseCenter + (BEAM_OFFSET_REM * rootSize) + BEAM_OFFSET_PX, minCenter, maxCenter);
      const yPx = -(centerY - H / 2);

      setBeamPx({ x: xPx, y: yPx });
    };

    const onResize = () => measureOnce();

    r1 = requestAnimationFrame(() => {
      measureOnce();
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => { t1 = setTimeout(measureOnce, 60); });
      }
      t2 = setTimeout(measureOnce, 300);
    });

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isDesktop]);

  if (!isDesktop || !ready || !LaserFlow) return null; // ⟵ eemaldatud "reduced"

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
    wispIntensity: 5,
    wispColors:    WISP_PALETTE,
    wispTint:      0.5,

    // bandingu vastu
    ditherAmp:   0.1,

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
        mixBlendMode: "screen",
      }}
    >
      <LaserFlow {...preset} />
    </div>
  );
}


