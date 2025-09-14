// components/backgrounds/LaserFlowOverlay.jsx
"use client";

import { useEffect, useRef, useState } from "react";

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

/** Mount ainult siis, kui brauser on idle. */
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

  // 🧭 Tala uniformid (state)
  const [beam, setBeam] = useState({
    xFrac: 0,    // horizontalBeamOffset
    yFrac: 0,    // verticalBeamOffset (DOM Y invertitakse shaderi jaoks)
    vSize: 0.7,  // verticalSizing (pikkus) – lõplik tuleb allpool
    hSize: 0.5,  // horizontalSizing (laius) – lõplik tuleb allpool
  });

  // ——— TUNING / LUKUSTUS ———
  const TOP_AIR_PX       = 3;     // kui palju õhku MEIST all
  const TOP_CENTER_FRAC  = 1.038;  // keha kui sügaval algusest
  const V_SIZE_FIXED     = 1.2;   // ↓ väiksem = lühem juga, ↑ suurem = pikem
  const H_SIZE_FIXED     = 0.38;  // ↑ suurem = laiem
  const BASE_LIFT        = 2.0;   // 🆕 ainult “jala” (põhja) tõstmine (+ üles, – alla)

  // ⛳️ Ankurdamine: ülemine ots LUKUS MEIST juures
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

    // vSize lukustatakse esimesel mõõtmisel fikseerituks
    const vSizeRef = { current: NaN };

    const update = () => {
      const { W, H } = getWH();
      const t = topEl.getBoundingClientRect();
      const b = botEl.getBoundingClientRect();

      // ankrud
      const topX = t.left + t.width / 2;
      const topY = t.bottom + TOP_AIR_PX;
      const botX = b.left + b.width / 2;

      // X = ankrute keskkoht (vajadusel lisa X-bias px)
      const cx = (topX + botX) / 2;
      const xFrac = (cx - W / 2) / W;

      // vSize – FIKSEERITUD (ei muutu resize’iga)
      const vSize = Number.isFinite(vSizeRef.current)
        ? vSizeRef.current
        : (vSizeRef.current = V_SIZE_FIXED);

      // ÜLEMINE OTS LUKKU: nihuta keskpunkti nii, et tala ülemine serv = topY
      const topCenterOffset = (H * TOP_CENTER_FRAC) / vSize;
      const centerY = topY + topCenterOffset;
      const yFrac = -((centerY - H / 2) / H); // DOM→shader (Y invert)

      // hSize – FIKSEERITUD (ära kirjuta üle!)
      const hSize = H_SIZE_FIXED;

      setBeam({ xFrac, yFrac, vSize, hSize });
    };

    const r1 = requestAnimationFrame(update);
    const t1 = setTimeout(update, 120);
    const t2 = setTimeout(update, 600);
    const t3 = setTimeout(update, 1800);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(topEl);
    ro.observe(botEl);
    document.fonts?.ready.then(update);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [isDesktop, reduced]);

  if (!isDesktop || reduced || !ready || !LaserFlow) return null;

  const preset = {
    color: "#262b47",
    horizontalBeamOffset:  beam.xFrac,
    verticalBeamOffset:    beam.yFrac,
    verticalSizing:        beam.vSize, // fikseeritud pikkus
    horizontalSizing:      beam.hSize, // fikseeritud laius
    baseLift:              0.6,        // 🆕 ainult “jala” nihutamine (proovi 1.5–4.0)
    flowSpeed:             0.2,
    flowStrength:         0.2,
    wispDensity:           0.2,
    wispSpeed:             4,
    wispIntensity:         15,
    dpr: 1,
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
