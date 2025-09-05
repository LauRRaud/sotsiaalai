// components/Space.jsx
/**
 * Space — starless cosmic background under your particle layer.
 * Light/Dark režiim `mode` abil ja intro-skippimine `skipIntro` abil.
 */
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
  fogAppearDurMs = 3000,
  fogAppearDelayMs = 900,
  skipIntro = false,
} = {}) {
  const PRESETS = {
    dark: {
      palette: { baseTop: "#070b16", baseBottom: "#0d111b", accentA: "#0a1224", accentB: "#0a1224" },
      intensity: 0.45,
      fogStrength: 0.30,
      fogBlend: "screen",
      grainOpacity: 0.06,
      blob2Opacity: 0.05,
      fogInnerRGBA: (alphaBase) => [`rgba(235,243,255,${alphaBase})`, "rgba(180,200,235,0.35)"],
    },
    light: {
      palette: { baseTop: "#070b16", baseBottom: "#0d111b", accentA: "#E4E5E6", accentB: "#E4E5E6" },
      intensity: 0.3,
      fogStrength: 0.4,
      fogBlend: "multiply",
      grainOpacity: 0.02,
      blob2Opacity: 0.05,
      fogInnerRGBA: () => ["#88aed8ff", "#71a1cfff"],
    },
  };

  const cfg = PRESETS[mode] || PRESETS.dark;
  const pal = { ...cfg.palette, ...(palette || {}) };
  const inten = intensity ?? cfg.intensity;
  const fogStr = clamp(fogStrength ?? cfg.fogStrength, 0, 0.7);

  const opacity1 = clamp(0.25 * inten, 0, 0.8);
  const opacity2 = clamp(0.18 * inten, 0, 0.7);
  const [fogStop0, fogStop1] = cfg.fogInnerRGBA(0.9);
  const animateFogEff = !!(animateFog && !skipIntro);

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={mode}
      style={{
        // CSS muutujad
        "--baseTop": String(pal.baseTop),
        "--baseBottom": String(pal.baseBottom),
        "--accentA": String(hexWithAlpha(pal.accentA, mode === "light" ? 0.9 : 0.55)),
        "--accentB": String(hexWithAlpha(pal.accentB, mode === "light" ? 0.9 : 0.6)),
        "--opacity1": String(opacity1),
        "--opacity2": String(opacity2),
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
        "--blob2Opacity": cfg.blob2Opacity,
        "--fogStop0": fogStop0,
        "--fogStop1": fogStop1,
      }}
      aria-hidden
    >
      {/* NB: eemaldatud .sb-base – gradient on nüüd wrapperil */}
      <div className="sb-blob sb-blob-2" />
      {fog && <FogLayer animateFog={animateFogEff} />}
      {grain && <GrainOverlay />}

      <style jsx global>{`
        .space-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          isolation: isolate;
          /* OLULINE: mitte kunagi läbipaistev – alati gradient */
          background: linear-gradient(180deg, var(--baseTop) 0%, var(--baseBottom) 100%);
          /* väldi üllatuslikke tausta-animatsioone */
          transition: none;
        }

        .sb-blob {
          position: absolute;
          border-radius: 9999px;
        }
        .sb-blob-2 {
          left: -25%;
          bottom: -25%;
          width: 95vmax;
          height: 95vmax;
          background: radial-gradient(
            38% 38% at 55% 55%,
            var(--accentA) 0%,
            rgba(0, 0, 0, 0) 70%
          );
          filter: blur(70px) saturate(125%);
          opacity: var(--blob2Opacity);
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
        .fog[data-animate="1"] {
          animation: fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }
        .fog[data-animate="0"] { opacity: var(--fogOpacity) !important; animation: none !important; }

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
          filter: blur(110px) saturate(115%);
          background: radial-gradient(
            50% 50% at 50% 50%,
            var(--fogStop0) 0%,
            var(--fogStop1) 55%,
            rgba(0, 0, 0, 0) 80%
          );
          mix-blend-mode: var(--fogBlend);
        }
        .fb1 { left: calc(50% - var(--fogSpread)); }
        .fb3 { left: calc(50% + var(--fogSpread)); }

        @media (prefers-reduced-motion: reduce) {
          .fog { animation: none !important; opacity: var(--fogOpacity) !important; }
        }

        /* GRAIN */
        .sb-grain { position: absolute; inset: 0; opacity: var(--grainOpacity); mix-blend-mode: overlay; pointer-events: none; }
        .sb-grain-svg { width: 100%; height: 100%; display: block; }
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

function GrainOverlay() {
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
function hexWithAlpha(hex, a = 1) {
  if (!hex || hex[0] !== "#") return hex;
  const h = hex.slice(1);
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
