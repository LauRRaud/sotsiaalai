// components/Space.jsx — desktop: fog+grain; mobile: gradient only
"use client";

import { useEffect, useState } from "react";

export default function Space({
  mode = "dark",
  palette,
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
  noiseUrl = "/textures/noise.webp",
  fogBlurPx = 80,
} = {}) {
  // Mõlemad režiimid jäävad tumeda gradiga; lightil lihtsalt kergem udu
  const PRESETS = {
    dark: {
      palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
      intensity: 0.48,
      fogStrength: 0.42,
      fogBlend: "screen",
      grainOpacity: 0.065,
      fogInnerRGBA: (alphaBase) => [
        `rgba(230,242,255,${Math.max(0.65, alphaBase * 0.8)})`,
        "rgba(185,210,245,0.30)",
      ],
    },
    light: {
      palette: { baseTop: "#070b16", baseBottom: "#0d111b" }, // jääb tume
      intensity: 0.28,
      fogStrength: 0.30,
      fogBlend: "screen",
      grainOpacity: 0.05,
      fogInnerRGBA: () => ["#c6e0ffdd", "#b1d2ffbb"],
    },
  };

  const cfg = PRESETS[mode] || PRESETS.dark;
  const pal = { ...cfg.palette, ...(palette || {}) };
  const inten = intensity ?? cfg.intensity;
  const fogStr = clamp(fogStrength ?? cfg.fogStrength, 0, 0.7);
  const [fogStop0, fogStop1] = cfg.fogInnerRGBA(0.9);

  // --- keskkonna lipud (CSR) ---
  const isMobile = useIsMobile(); // ≤768px
  const prefersReduced = usePrefersReducedMotion();

  // Desktopil (ja kui pole reduced motion) renderdame udu+grain
  const shouldRenderFog = fog && !isMobile && !prefersReduced;
  const shouldRenderGrain = grain && !isMobile && !prefersReduced;
  const animateFogEff = shouldRenderFog && !!(animateFog && !skipIntro);

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={mode}
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
        "--fogBlend": cfg.fogBlend,
        "--grainOpacity": cfg.grainOpacity,
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
          0% {
            opacity: 0.001;
          }
          55% {
            opacity: calc(var(--fogOpacity) * 0.26);
          }
          85% {
            opacity: calc(var(--fogOpacity) * 0.75);
          }
          100% {
            opacity: var(--fogOpacity);
          }
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
          [data-mode="dark"] .fog-blob {
            mix-blend-mode: plus-lighter;
          }
        }
        .fb1 {
          left: calc(50% - var(--fogSpread));
        }
        .fb3 {
          left: calc(50% + var(--fogSpread));
        }

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

        /* Mobiilis ja reduced-motion: ainult gradient */
        @media (max-width: 768px) {
          .fog,
          .sb-grain {
            display: none !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fog {
            animation: none !important;
            opacity: 0 !important; /* udu peidetud; gradient jääb */
          }
          .sb-grain {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

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

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ------- hooks ------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mql.matches);
    handler();
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}
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
