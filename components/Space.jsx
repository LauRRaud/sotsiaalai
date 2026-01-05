// components/Space.jsx — desktop: fog+grain; mobile: gradient only (dark-only)
"use client";
import { useEffect, useState } from "react";
export default function Space({
  mode = "dark",
  palette,
  allowMobileCustom = false,
  intensity: _intensity,
  grain = true,
  fog = true,
  fogBlend,
  fogStops,
  fogStrength,
  fogHeightVmax = 30,
  fogOffsetVmax = 0,
  fogBlobSizeVmax = 65,
  fogPairSpreadVmax = 22,
  fogHorizontalShiftVmax = -32.5,
  animateFog = false,
  fogAppearDurMs = 3200,
  fogAppearDelayMs = 700,
  skipIntro = false,
  noiseUrl = "",
  fogBlurPx = 60, // ↓ enne 80 — pehmem, vähem “mass”
} = {}) {
  // --- Dark preset (desktop) ---
  const PRESET = {
    palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
    intensity: 0.48,
    fogStrength: 0.26, // ↓ ~38% nõrgem kui 0.42
    fogBlend: "screen",
    grainOpacity: 0.065,
    // vähem valget/sinakat; neutraalsem hall, pehmem alfa
    fogInnerRGBA: (alphaBase) => [
      `rgba(215,220,230,${Math.max(0.45, alphaBase * 0.70)})`,
      "rgba(150,160,180,0.22)",
    ],
  };
  const themeMode = mode === "light" ? "light" : "dark";
  const ACTIVE = PRESET;
  const MOBILE_LOCK = { baseTop: ACTIVE.palette.baseTop, baseBottom: ACTIVE.palette.baseBottom };
  const isMobile = useIsMobile(); // ≤768px
  const hasFullCustom = !!(palette && palette.baseTop && palette.baseBottom);
  const pal = isMobile
    ? (allowMobileCustom && hasFullCustom ? palette : MOBILE_LOCK)
    : { ...ACTIVE.palette, ...(palette || {}) };
  const fogStr = clamp(fogStrength ?? ACTIVE.fogStrength, 0, 0.7);
  const defaultFogStops = ACTIVE.fogInnerRGBA(0.9);
  const fogStopsResolved =
    Array.isArray(fogStops) && fogStops.length === 2 ? fogStops : defaultFogStops;
  const [fogStop0, fogStop1] = fogStopsResolved;
  const fogBlendMode = fogBlend ?? ACTIVE.fogBlend;
  const shouldRenderFog = fog && !isMobile;
  const shouldRenderGrain = grain && !isMobile;
  const animateFogEff = shouldRenderFog && !!(animateFog && !skipIntro);
  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={themeMode}
      data-viewport={isMobile ? "mobile" : "desktop"}
      style={{
        "--baseTop": String(pal.baseTop),
        "--baseBottom": String(pal.baseBottom),
        "--fogOpacity": String(fogStr),
        "--fogHeight": `${fogHeightVmax}vmax`,
        "--fogOffset": `${fogOffsetVmax}vmax`,
        "--fogBlobSize": `${fogBlobSizeVmax}vmax`,
        "--fogSpread": `${fogPairSpreadVmax}vmax`,
        "--fogHorizontalShift": `${fogHorizontalShiftVmax}vmax`,
        "--fogAppearDur": `${fogAppearDurMs}ms`,
        "--fogAppearDelay": `${fogAppearDelayMs}ms`,
        "--fogBlend": fogBlendMode,
        "--grainOpacity": ACTIVE.grainOpacity,
        "--fogStop0": fogStop0,
        "--fogStop1": fogStop1,
        "--fogBlurPx": `${fogBlurPx}px`,
      }}
      aria-hidden
    >
      {shouldRenderFog && <FogLayer animateFog={animateFogEff} />}
      {shouldRenderGrain &&
        (noiseUrl ? (
          <BitmapGrainOverlay noiseUrl={noiseUrl} />
        ) : (
          <SvgGrainOverlay />
        ))}
    </div>
  );
}
/* ------- kihid ------- */
function FogLayer({ animateFog }) {
  return (
    <div className="fog" data-animate={animateFog ? "1" : "0"} suppressHydrationWarning>
      <div className="fog-blob fb1" />
      <div className="fog-blob fb3" />
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
/* ------- utils ------- */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
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
