/**
 * Space — starless cosmic background under your particle layer.
 * Symmetric left/right fog (no center blob). Fog fades in slowly (if animateFog=true).
 * Hydration-safe: styles are in <style jsx global>.
 */
export default function Space({
  palette = {
    baseTop: "#070b16",
    baseBottom: "#070b16",
    accentA: "#0a1224",
    accentB: "#0a1224",
  },
  intensity = 0.4,
  grain = true,
  fog = true,

  // udu parameetrid (jäävad samad, mis sul on)
  fogStrength = 0.3,
  fogHeightVmax = 30,
  fogOffsetVmax = 0,
  fogBlobSizeVmax = 65,
  fogPairSpreadVmax = 22,
  fogHorizontalShiftVmax = -32.5,

  // kas teha udule aeglane ilmumine (fade-in)
  animateFog = true,
  fogAppearDurMs = 4500,
  fogAppearDelayMs = 900,
} = {}) {
  const opacity1 = clamp(0.25 * intensity, 0, 0.8);
  const opacity2 = clamp(0.18 * intensity, 0, 0.7);

  return (
    <div
      className="space-backdrop"
      suppressHydrationWarning
      style={{
        // custom property’d STRINGINA — stabiilne SSR/CSR
        "--baseTop": String(palette.baseTop),
        "--baseBottom": String(palette.baseBottom),
        "--accentA": String(hexWithAlpha(palette.accentA, 0.55)),
        "--accentB": String(hexWithAlpha(palette.accentB, 0.6)),
        "--opacity1": String(opacity1),
        "--opacity2": String(opacity2),

        "--fogOpacity": String(clamp(fogStrength, 0, 0.7)),
        "--fogHeight": `${fogHeightVmax}vmax`,
        "--fogOffset": `${fogOffsetVmax}vmax`,
        "--fogBlobSize": `${fogBlobSizeVmax}vmax`,
        "--fogSpread": `${fogPairSpreadVmax}vmax`,
        "--fogHorizontalShift": `${fogHorizontalShiftVmax}vmax`,

        "--fogAppearDur": `${fogAppearDurMs}ms`,
        "--fogAppearDelay": `${fogAppearDelayMs}ms`,
      }}
      aria-hidden
    >
      {/* Tume ühtlane baas */}
      <div className="sb-base" />

      {/* Väga tagasihoidlik alumine aktsent */}
      <div className="sb-blob sb-blob-2" style={{ opacity: 0.05 }} />

      {/* Sümmeetriline udu (fade-in ainult siis, kui animateFog=true) */}
      {fog && <FogLayer animateFog={animateFog} />}

      {grain && <GrainOverlay />}

      {/* ——— STYLES ——— */}
      <style jsx global>{`
        /* BACKDROP */
        .space-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          isolation: isolate; /* hoiab blendid kapslis */
          background: transparent;
        }

        .sb-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, var(--baseTop) 0%, var(--baseBottom) 100%);
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
        }

        /* FOG LAYER — fade ainult konteineril; blend on blobidel */
        .fog {
          position: absolute;
          left: calc(50% + var(--fogHorizontalShift));
          bottom: calc(var(--fogOffset) * -1);
          transform: translateX(-50%) translateZ(0);
          width: 100%;
          height: var(--fogHeight);
          pointer-events: none;

          /* baseline */
          opacity: 0.001; /* mitte päris 0 → vältida külmkäivituse klõpsu */
          will-change: opacity;
          backface-visibility: hidden;
        }
        /* Kui tahame fade-in'i */
        .fog[data-animate="1"] {
          animation: fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }
        /* Kui EI taha fade-in'i (nt teistel lehtedel) */
        .fog[data-animate="0"] {
          opacity: var(--fogOpacity) !important;
          animation: none !important;
        }

        /* Fade-in: peenelt kasvav, lineaarne */
        @keyframes fogAppear {
          0%   { opacity: 0.001; }
          10%  { opacity: calc(var(--fogOpacity) * 0.03); }
          20%  { opacity: calc(var(--fogOpacity) * 0.06); }
          30%  { opacity: calc(var(--fogOpacity) * 0.10); }
          40%  { opacity: calc(var(--fogOpacity) * 0.16); }
          55%  { opacity: calc(var(--fogOpacity) * 0.26); }
          70%  { opacity: calc(var(--fogOpacity) * 0.42); }
          85%  { opacity: calc(var(--fogOpacity) * 0.65); }
          95%  { opacity: calc(var(--fogOpacity) * 0.85); }
          100% { opacity: var(--fogOpacity); }
        }

        /* BLOBS — sinu CSS; blend on blobidel, mitte konteineril */
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
            rgba(235, 243, 255, var(--fogStrengthAlpha, 0.90)) 0%,
            rgba(180, 200, 235, 0.35) 55%,
            rgba(0, 0, 0, 0) 80%
          );
          mix-blend-mode: screen;
        }
        .fb1 { left: calc(50% - var(--fogSpread)); }
        .fb3 { left: calc(50% + var(--fogSpread)); }

        @media (prefers-reduced-motion: reduce) {
          .fog { animation: none !important; opacity: var(--fogOpacity) !important; }
        }

        /* GRAIN */
        .sb-grain {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .sb-grain-svg { width: 100%; height: 100%; display: block; }
      `}</style>
    </div>
  );
}

function FogLayer({ animateFog }) {
  return (
    <div className="fog" data-animate={animateFog ? "1" : "0"}>
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

/* utils */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function hexWithAlpha(hex, a = 1) {
  if (!hex || hex[0] !== "#") return hex;
  const h = hex.slice(1);
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
