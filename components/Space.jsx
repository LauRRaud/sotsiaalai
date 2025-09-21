// components/Space.jsx — desktop: fog+grain; mobile: gradient only (dark-only)
"use client";

import { useEffect, useState } from "react";

export default function Space({
  // Dark-only. Desktopil saab palette't kohandada; mobiilis vaikimisi lukus.
  palette,
  allowMobileCustom = false, // kui true ja palette sisaldab mõlemat tooni, lubame mobiilis custom värvid
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
  fogBlurPx = 80,
} = {}) {
  // --- Dark preset (desktop) ---
  const PRESET = {
    palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
    intensity: 0.48,
    fogStrength: 0.42,
    fogBlend: "screen",
    grainOpacity: 0.065,
    fogInnerRGBA: (alphaBase) => [
      `rgba(230,242,255,${Math.max(0.65, alphaBase * 0.8)})`,
      "rgba(185,210,245,0.30)",
    ],
  };

  // --- Mobiili lukustatud toonid: ÜLEVAL TUMESININE → ALL HALL ---
  const MOBILE_LOCK = { baseTop: "#0d2346", baseBottom: "#8f949f" }; // deep navy → cool gray

  // --- keskkonna lipud (CSR) ---
  const isMobile = useIsMobile(); // ≤768px

  const hasFullCustom = !!(palette && palette.baseTop && palette.baseBottom);

  // Desktop: preset + optional custom; Mobiil: lukus toonid, kui just ei luba ja ei anta mõlemat customit
  const pal = isMobile
    ? (allowMobileCustom && hasFullCustom ? palette : MOBILE_LOCK)
    : { ...PRESET.palette, ...(palette || {}) };

  const inten = intensity ?? PRESET.intensity;
  const fogStr = clamp(fogStrength ?? PRESET.fogStrength, 0, 0.7);
  const [fogStop0, fogStop1] = PRESET.fogInnerRGBA(0.9);

  // Mobiili keskmine stop — pisut heledam sinine, et gradient oleks nähtav OLEDidel
  const baseMid = isMobile ? mixHex(pal.baseTop, "#3a5ea0", 0.35) : pal.baseTop;

  // Desktopil renderdame udu+grain; mobiilis ainult gradient
  const shouldRenderFog = fog && !isMobile;
  const shouldRenderGrain = grain && !isMobile;
  const animateFogEff = shouldRenderFog && !!(animateFog && !skipIntro);

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode="dark"
      style={{
        "--baseTop": String(pal.baseTop),
        "--baseMid": String(baseMid),
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

        /* === MOBIIL: ainult gradient, 3-stop + õrn dither === */
        @media (max-width: 768px) {
          .fog,
          .sb-grain { display: none !important; }

          .space-backdrop {
            background-image:
              linear-gradient(
                180deg,
                var(--baseTop) 0%,
                var(--baseMid) 52%,
                var(--baseBottom) 100%
              );
          }

          .space-backdrop::after {
            content: "";
            position: absolute; inset: 0;
            pointer-events: none;
            mix-blend-mode: overlay;
            opacity: 0.03; /* väga õrn dither bandingu vastu */
            background-image:
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.02) 0px,
                rgba(255,255,255,0.02) 1px,
                rgba(0,0,0,0.02) 2px,
                rgba(0,0,0,0.02) 3px
              );
          }
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

function hexToRgb(hex) {
  const s = hex.replace("#", "");
  const b = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.padEnd(6, "0");
  const n = parseInt(b, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
/** mix a toward b by t (0..1) */
function mixHex(a, b, t = 0.5) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return rgbToHex({ r: m(A.r, B.r), g: m(A.g, B.g), b: m(A.b, B.b) });
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
