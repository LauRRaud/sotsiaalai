/**
 * Space — starless cosmic background under your particle layer.
 * Symmetric left/right fog (no center blob), visible on dark via mix-blend: screen.
 * Static version (no animations).
 */
export default function Space({
  palette = {
    baseTop: "#05070d",
    baseBottom: "#0a0f1f",
    accentA: "#0a1224",
    accentB: "#0a1224",
  },
  intensity = 0.5,
  grain = true,
  fog = true,
  fogStrength = 0.2,
  fogHeightVmax = 80,
  fogOffsetVmax = 12,
  fogBlobSizeVmax = 85,     // udublobi suurus
  fogPairSpreadVmax = 28,   // kaugus keskteljest mõlemale poole
  fogHorizontalShiftVmax = 0 // kogu paari liigutus vasakule/paremale
} = {}) {
  const opacity1 = clamp(0.25 * intensity, 0, 0.8);
  const opacity2 = clamp(0.18 * intensity, 0, 0.7);

  return (
    <div
      className="space-backdrop"
      style={{
        "--baseTop": palette.baseTop,
        "--baseBottom": palette.baseBottom,
        "--accentA": hexWithAlpha(palette.accentA, 0.55),
        "--accentB": hexWithAlpha(palette.accentB, 0.6),
        "--opacity1": opacity1,
        "--opacity2": opacity2,
        "--fogOpacity": clamp(fogStrength, 0, 0.7),
        "--fogHeight": `${fogHeightVmax}vmax`,
        "--fogOffset": `${fogOffsetVmax}vmax`,
        "--fogBlobSize": `${fogBlobSizeVmax}vmax`,
        "--fogSpread": `${fogPairSpreadVmax}vmax`,
        "--fogHorizontalShift": `${fogHorizontalShiftVmax}vmax`
      }}
      aria-hidden
    >
      {/* Deep space base */}
      <div className="sb-base" />

      {/* Accent blobs — alumine blob vaikse tooniga */}
      <div className="sb-blob sb-blob-2" style={{ opacity: 0.05 }} />

      {/* Symmetric fog (left + right) */}
      {fog && <FogLayer />}

      {grain && <GrainOverlay />}

      <style jsx>{`
        .space-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
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
      `}</style>
    </div>
  );
}

function FogLayer() {
  return (
    <div className="fog">
      <div className="fog-blob fb1" />
      <div className="fog-blob fb3" />
      <style jsx>{`
        .fog {
          position: absolute;
          left: calc(50% + var(--fogHorizontalShift));
          bottom: calc(var(--fogOffset) * -1);
          transform: translateX(-50%);
          width: 100%;
          height: var(--fogHeight);
          opacity: var(--fogOpacity);
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .fog-blob {
          position: absolute;
          bottom: 0;
          width: var(--fogBlobSize);
          height: var(--fogBlobSize);
          border-radius: 9999px;
          filter: blur(120px) saturate(115%);
          background: radial-gradient(
            50% 50% at 50% 50%,
            rgba(235, 243, 255, 0.9) 0%,
            rgba(180, 200, 235, 0.35) 55%,
            rgba(0, 0, 0, 0) 80%
          );
          transform: translateX(-50%);
        }
        .fb1 { left: calc(50% - var(--fogSpread)); }
        .fb3 { left: calc(50% + var(--fogSpread)); }
      `}</style>
    </div>
  );
}

function GrainOverlay() {
  return (
    <div className="sb-grain" aria-hidden>
      <svg className="sb-grain-svg" xmlns="http://www.w3.org/2000/svg">
        <filter id="sb-noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sb-noiseFilter)" />
      </svg>
      <style jsx>{`
        .sb-grain {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          mix-blend-mode: overlay;
        }
        .sb-grain-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
}

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
