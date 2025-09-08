// components/Space.jsx — mobile-safe variant
// Muudatused:
// - Mobiilil "lite" profiil: väiksemad mõõdud, nõrgem blur, animatsioonid välja
// - Austab prefers-reduced-motion
// - Sama API kui varem (mode, palette, intensity, grain, fog, ...)

import { useEffect, useMemo, useState } from "react";

export default function Space({
  mode = "dark",
  palette,
  intensity,
  grain = true,
  fog = true,
  fogStrength,
  // Desktopi vaikimisi geomeetria
  fogHeightVmax = 30,
  fogOffsetVmax = 0,
  fogBlobSizeVmax = 65,
  fogPairSpreadVmax = 22,
  fogHorizontalShiftVmax = -32.5,
  animateFog = false,
  fogAppearDurMs = 3200,
  fogAppearDelayMs = 700,
  skipIntro = false,
  // Performance
  noiseUrl = "/textures/noise.webp",
  fogBlurPx = 80,
} = {}) {
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile(); // max-width:768px

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
      palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
      intensity: 0.28,
      fogStrength: 0.30,
      fogBlend: "screen",
      grainOpacity: 0.05,
      fogInnerRGBA: () => ["#c6e0ffdd", "#b1d2ffbb"],
    },
  };

  const cfg = PRESETS[mode] || PRESETS.dark;

  // --- Mobile "lite" override’id ---
  const effective = useMemo(() => {
    // Desktopi baaskonfig
    const base = {
      pal: { ...cfg.palette, ...(palette || {}) },
      inten: intensity ?? cfg.intensity,
      fogStr: clamp(fogStrength ?? cfg.fogStrength, 0, 0.7),
      fogHeight: fogHeightVmax,
      fogOffset: fogOffsetVmax,
      fogBlob: fogBlobSizeVmax,
      fogSpread: fogPairSpreadVmax,
      fogShift: fogHorizontalShiftVmax,
      blurPx: fogBlurPx,
      appearDur: fogAppearDurMs,
      appearDelay: fogAppearDelayMs,
      blend: cfg.fogBlend,
      grainOpacity: cfg.grainOpacity,
      // anim. lipp
      animate: !!(animateFog && !skipIntro),
    };

    // Kui vähendatud liikumine või mobiil: tee "lite"
    if (prefersReduced || isMobile) {
      return {
        ...base,
        // pehmemad/kompaktsemad mõõdud
        fogStr: clamp((fogStrength ?? cfg.fogStrength) * 0.8, 0, 0.6),
        fogHeight: Math.round((fogHeightVmax ?? 30) * 0.7),      // 30vmax → ~21vmax
        fogBlob: Math.round((fogBlobSizeVmax ?? 65) * 0.72),     // 65vmax → ~47vmax
        fogSpread: Math.round((fogPairSpreadVmax ?? 22) * 0.72), // 22vmax → ~16vmax
        fogShift: Math.round((fogHorizontalShiftVmax ?? -32.5) * 0.62), // -32.5 → ~-20
        blurPx: Math.max(28, Math.round((fogBlurPx ?? 80) * 0.55)),     // 80px → ~44px
        appearDur: 0,   // animatsioon välja
        appearDelay: 0, // ei viivita
        animate: false, // ei animeeri mobiilis / reduced-motion’is
        grainOpacity: cfg.grainOpacity * 0.7,
      };
    }
    return base;
  }, [
    cfg, palette, intensity, fogStrength,
    fogHeightVmax, fogOffsetVmax, fogBlobSizeVmax,
    fogPairSpreadVmax, fogHorizontalShiftVmax,
    fogBlurPx, fogAppearDurMs, fogAppearDelayMs,
    animateFog, skipIntro, prefersReduced, isMobile
  ]);

  // “Intensiivsusest” tuletatud läbipaistused
  const opacity1 = clamp(0.25 * effective.inten, 0, 0.8);
  const opacity2 = clamp(0.18 * effective.inten, 0, 0.7);
  const [fogStop0, fogStop1] = cfg.fogInnerRGBA(0.9);

  // Tasemed mountitakse ainult siis, kui lubatud
  const fogArmed = !!(animateFog || skipIntro || prefersReduced || isMobile);
  const shouldRenderFog = fog && fogArmed;
  const shouldRenderGrain = grain && fogArmed;

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={mode}
      data-mobile={isMobile ? "1" : "0"}
      style={{
        "--baseTop": String(effective.pal.baseTop),
        "--baseBottom": String(effective.pal.baseBottom),
        "--opacity1": String(opacity1),
        "--opacity2": String(opacity2),
        "--fogOpacity": String(effective.fogStr),
        "--fogHeight": `${effective.fogHeight}vmax`,
        "--fogOffset": `${effective.fogOffset}vmax`,
        "--fogBlobSize": `${effective.fogBlob}vmax`,
        "--fogSpread": `${effective.fogSpread}vmax`,
        "--fogHorizontalShift": `${effective.fogShift}vmax`,
        "--fogAppearDur": `${effective.appearDur}ms`,
        "--fogAppearDelay": `${effective.appearDelay}ms`,
        "--fogBlend": effective.blend,
        "--grainOpacity": effective.grainOpacity,
        "--fogStop0": fogStop0,
        "--fogStop1": fogStop1,
        "--fogBlurPx": `${effective.blurPx}px`,
      }}
      aria-hidden
    >
      {shouldRenderFog && (
        <FogLayer armed={fogArmed} animateFog={effective.animate} />
      )}
      {shouldRenderGrain && (
        noiseUrl ? <BitmapGrainOverlay noiseUrl={noiseUrl} /> : <SvgGrainOverlay />
      )}

      <style jsx global>{`
        .space-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          isolation: isolate;
          background: linear-gradient(180deg, var(--baseTop) 0%, var(--baseBottom) 100%);
          transition: none;
        }

        /* FOG */
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

        .fog[data-armed="1"][data-animate="1"] {
          animation: fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }
        .fog[data-armed="1"][data-animate="0"] {
          opacity: var(--fogOpacity);
          animation: none;
        }
        @keyframes fogAppear {
          0%   { opacity: 0.001; }
          55%  { opacity: calc(var(--fogOpacity) * 0.26); }
          85%  { opacity: calc(var(--fogOpacity) * 0.75); }
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

        /* Mobiilis veel kergem (ohutum) render */
        @media (max-width: 768px) {
          .space-backdrop { will-change: auto; }
          .fog-blob { filter: blur(calc(var(--fogBlurPx) * 0.9)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .fog[data-armed="1"] {
            animation: none !important;
            opacity: var(--fogOpacity) !important;
          }
        }

        /* GRAIN */
        .sb-grain { position: absolute; inset: 0; opacity: var(--grainOpacity); mix-blend-mode: overlay; pointer-events: none; }
        .sb-grain-svg, .sb-grain-bitmap { width: 100%; height: 100%; display: block; }
        .sb-grain-bitmap { background-repeat: repeat; background-size: auto; }
      `}</style>
    </div>
  );
}

function FogLayer({ armed, animateFog }) {
  return (
    <div className="fog" data-armed={armed ? "1" : "0"} data-animate={animateFog ? "1" : "0"} suppressHydrationWarning>
      <div className="fog-blob fb1" />
      <div className="fog-blob fb3" />
    </div>
  );
}

function BitmapGrainOverlay({ noiseUrl }) {
  return <div className="sb-grain sb-grain-bitmap" aria-hidden style={{ backgroundImage: `url(${noiseUrl})` }} />;
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

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

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

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}
