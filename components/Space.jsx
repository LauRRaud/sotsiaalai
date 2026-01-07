// components/Space.jsx — desktop: grain; mobile: gradient only (dark-only)
"use client";
import { useEffect, useState } from "react";
export default function Space({
  mode = "dark",
  palette,
  allowMobileCustom = false,
  intensity: _intensity,
  grain = true,
  noiseUrl = "",
} = {}) {
  // --- Dark preset (desktop) ---
  const PRESET = {
    palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
    intensity: 0.48,
    grainOpacity: 0.065,
  };
  const themeMode = mode === "light" ? "light" : "dark";
  const ACTIVE = PRESET;
  const MOBILE_LOCK = { baseTop: ACTIVE.palette.baseTop, baseBottom: ACTIVE.palette.baseBottom };
  const isMobile = useIsMobile(); // ≤768px
  const hasFullCustom = !!(palette && palette.baseTop && palette.baseBottom);
  const pal = isMobile
    ? (allowMobileCustom && hasFullCustom ? palette : MOBILE_LOCK)
    : { ...ACTIVE.palette, ...(palette || {}) };
  const shouldRenderGrain = grain && !isMobile;
  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={themeMode}
      data-viewport={isMobile ? "mobile" : "desktop"}
      style={{
        "--baseTop": String(pal.baseTop),
        "--baseBottom": String(pal.baseBottom),
        "--grainOpacity": ACTIVE.grainOpacity,
      }}
      aria-hidden
    >
      {shouldRenderGrain &&
        (noiseUrl ? (
          <BitmapGrainOverlay noiseUrl={noiseUrl} />
        ) : (
          <SvgGrainOverlay />
        ))}
    </div>
  );
}
function BitmapGrainOverlay({ noiseUrl }) {
  return (
    <div
      className="sb-grain sb-grain-bitmap"
      aria-hidden
      style={{ backgroundImage: `url(${noiseUrl})` }}
    />
  );
}
function SvgGrainOverlay() {
  return (
    <div className="sb-grain" aria-hidden>
      <svg className="sb-grain-svg" xmlns="http://www.w3.org/2000/svg">
        <filter id="sb-noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sb-noiseFilter)" />
      </svg>
    </div>
  );
}
/* ------- hooks ------- */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return mobile;
}
