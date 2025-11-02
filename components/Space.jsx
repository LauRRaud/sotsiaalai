// components/Space.jsx — desktop: fog+grain; mobile: gradient only (dark-only)
"use client";
import { useEffect, useState } from "react";
export default function Space({
  palette,
  allowMobileCustom = false,
  intensity,
  grain = true,
  fog = true,
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
  // Mobiil: lukusta gradient tumedale sinakas toonile (sama tipp, veidi heledam põhi)
  const MOBILE_LOCK = { baseTop: PRESET.palette.baseTop, baseBottom: PRESET.palette.baseBottom };
  const isMobile = useIsMobile(); // ≤768px
  const hasFullCustom = !!(palette && palette.baseTop && palette.baseBottom);
  const pal = isMobile
    ? (allowMobileCustom && hasFullCustom ? palette : MOBILE_LOCK)
    : { ...PRESET.palette, ...(palette || {}) };
  const inten = intensity ?? PRESET.intensity;
  const fogStr = clamp(fogStrength ?? PRESET.fogStrength, 0, 0.7);
  const [fogStop0, fogStop1] = PRESET.fogInnerRGBA(0.9);
  const shouldRenderFog = fog && !isMobile;
  const shouldRenderGrain = grain && !isMobile;
  const animateFogEff = shouldRenderFog && !!(animateFog && !skipIntro);
  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode="dark"
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
        "--fogBlend": PRESET.fogBlend,
        "--grainOpacity": PRESET.grainOpacity,
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
      <style jsx global>{`
        .space-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          isolation: isolate;
          background: linear-gradient(180deg, var(--baseTop) 0%, var(--baseBottom) 100%);
        }
        .space-backdrop::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .space-backdrop[data-viewport="mobile"]::before {
          opacity: 1;
          background:
            radial-gradient(118% 70% at 50% 28%, rgba(134, 158, 210, 0.22) 0%, rgba(8, 12, 22, 0.0) 60%),
            radial-gradient(128% 84% at 50% 82%, rgba(164, 176, 205, 0.26) 0%, rgba(8, 12, 22, 0.0) 72%),
            radial-gradient(195% 130% at 50% 76%, rgba(24, 38, 68, 0.32) 0%, rgba(8, 12, 22, 0.0) 86%);
          mix-blend-mode: screen;
          filter: saturate(0.94);
        }
        .space-backdrop[data-viewport="desktop"]::before {
          opacity: 0;
          background: none;
        }
        /* === FOG === */
        .fog {
          position: absolute;
          left: calc(50% + var(--fogHorizontalShift));
          bottom: calc(var(--fogOffset) * -1);
          transform: translateX(-50%) translateZ(0);
          width: 100%;
          height: var(--fogHeight);
          pointer-events: none;
          opacity: 0.001;
          will-change: opacity;
          backface-visibility: hidden;
        }
        .fog[data-animate="1"] {
          animation: fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }
        .fog[data-animate="0"] {
          opacity: var(--fogOpacity);
          animation: none;
        }
        @keyframes fogAppear {
          0% { opacity: 0.001; }
          55% { opacity: calc(var(--fogOpacity) * 0.26); }
          85% { opacity: calc(var(--fogOpacity) * 0.75); }
          100% { opacity: var(--fogOpacity); }
        }
        .fog-blob {
          position: absolute;
          top: 30%;
          transform: translateY(-50%);
          width: var(--fogBlobSize, 85vmax);
          height: var(--fogBlobSize, 85vmax);
          border-radius: 9999px;
          filter: blur(var(--fogBlurPx));
          background: radial-gradient(
            50% 50% at 50% 50%,
            var(--fogStop0) 0%,
            var(--fogStop1) 56%,
            rgba(0, 0, 0, 0) 84%
          );
          mix-blend-mode: var(--fogBlend);
        }
        @supports (mix-blend-mode: plus-lighter) {
          [data-mode="dark"] .fog-blob { mix-blend-mode: plus-lighter; }
        }
        .fb1 { left: calc(50% - var(--fogSpread)); }
        .fb3 { left: calc(50% + var(--fogSpread)); }
        /* === GRAIN === */
        .sb-grain {
          position: absolute;
          inset: 0;
          opacity: var(--grainOpacity);
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .sb-grain-svg,
        .sb-grain-bitmap {
          width: 100%;
          height: 100%;
          display: block;
        }
        .sb-grain-bitmap {
          background-repeat: repeat;
          background-size: auto;
        }
        /* Mobiilis: ainult gradient */
        @media (max-width: 768px) {
          .fog,
          .sb-grain { display: none !important; }
        }
      `}</style>
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
