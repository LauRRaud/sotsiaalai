// components/Space.jsx
/**
 * Space — starless cosmic background under your particle layer.
 * Light/Dark režiim `mode` abil ja intro-skippimine `skipIntro` abil.
 * PLEKK (accent blob) EEMALDATUD.
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
      palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
      intensity: 0.45,
      fogStrength: 0.30,
      fogBlend: "screen",
      grainOpacity: 0.06,
      fogInnerRGBA: (alphaBase) => [`rgba(235,243,255,${alphaBase})`, "rgba(180,200,235,0.35)"],
    },
    light: {
      palette: { baseTop: "#070b16", baseBottom: "#0d111b" },
      intensity: 0.3,
      fogStrength: 0.4,
      fogBlend: "screen",
      grainOpacity: 0.05,
      // NB: flat array, mitte [[...]]
      fogInnerRGBA: () => ["#88aed8ff", "#71a1cfff"],
    },
  };

  const cfg = PRESETS[mode] || PRESETS.dark;
  const pal = { ...cfg.palette, ...(palette || {}) };
  const inten = intensity ?? cfg.intensity;
  const fogStr = clamp(fogStrength ?? cfg.fogStrength, 0, 0.7);

  // võimalik tulevikus siduda kihte intensiivsusega
  const opacity1 = clamp(0.25 * inten, 0, 0.8);
  const opacity2 = clamp(0.18 * inten, 0, 0.7);

  const [fogStop0, fogStop1] = cfg.fogInnerRGBA(0.9);

  // ARMED = millal üldse tohib udu nähtavaks minna
  // ANIMATE = kas udu ilmumine toimub animatsiooniga
  const fogArmed = !!(animateFog || skipIntro);
  const animateFogEff = !!(animateFog && !skipIntro);

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      data-mode={mode}
      style={{
        "--baseTop": String(pal.baseTop),
        "--baseBottom": String(pal.baseBottom),
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
        "--fogStop0": fogStop0,
        "--fogStop1": fogStop1,
      }}
      aria-hidden
    >
      {/* PLEKK EEMALDATUD: .sb-blob-2 ei renderda */}
      {fog && <FogLayer armed={fogArmed} animateFog={animateFogEff} />}
      {grain && <GrainOverlay />}

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

        /* === FOG === */
        .fog {
          position: absolute;
          left: calc(50% + var(--fogHorizontalShift));
          bottom: calc(var(--fogOffset) * -1);
          transform: translateX(-50%) translateZ(0);
          width: 100%;
          height: var(--fogHeight);
          pointer-events: none;
          opacity: 0.001;                 /* vaikimisi peidus */
          will-change: opacity;
          backface-visibility: hidden;
        }

        /* ARMED + ANIMATED → tee animatsioon */
        .fog[data-armed="1"][data-animate="1"] {
          animation: fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }

        /* ARMED + NOT ANIMATED → kohe lõpp-opacity */
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
          .fog[data-armed="1"] {
            animation: none !important;
            opacity: var(--fogOpacity) !important;
          }
        }

        /* === GRAIN === */
        .sb-grain { position: absolute; inset: 0; opacity: var(--grainOpacity); mix-blend-mode: overlay; pointer-events: none; }
        .sb-grain-svg { width: 100%; height: 100%; display: block; }
      `}</style>
    </div>
  );
}

function FogLayer({ armed, animateFog }) {
  return (
    <div
      className="fog"
      data-armed={armed ? "1" : "0"}
      data-animate={animateFog ? "1" : "0"}
      suppressHydrationWarning
    >
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
