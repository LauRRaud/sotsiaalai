// components/Space.jsx — gradient only on mobile
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
const PRESETS = {
  dark: {
    palette: { baseTop: "#070b16", baseBottom: "#0d111b" }, // sama tume
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
    palette: { baseTop: "#070b16", baseBottom: "#0d111b" }, // JÄÄB TUMEDAKS
    intensity: 0.28,        // veidi kergem kui dark
    fogStrength: 0.30,      // nõrgem fog
    fogBlend: "screen",
    grainOpacity: 0.05,     // vähem mürataset
    fogInnerRGBA: () => [
      "#c6e0ffdd",          // heledam sinine fog
      "#b1d2ffbb"
    ],
  },
};

  const cfg = PRESETS[mode] || PRESETS.dark;
  const pal = { ...cfg.palette, ...(palette || {}) };
  const inten = intensity ?? cfg.intensity;
  const fogStr = clamp(fogStrength ?? cfg.fogStrength, 0, 0.7);

  const opacity1 = clamp(0.25 * inten, 0, 0.8);
  const opacity2 = clamp(0.18 * inten, 0, 0.7);

  const [fogStop0, fogStop1] = cfg.fogInnerRGBA(0.9);

  const fogArmed = !!(animateFog || skipIntro);
  const animateFogEff = !!(animateFog && !skipIntro);

  const shouldRenderFog = fog && fogArmed;
  const shouldRenderGrain = grain && fogArmed;

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
        "--fogBlurPx": `${fogBlurPx}px`,
      }}
      aria-hidden
    >
      {/* rasked kihid mountime ainult siis, kui lubatud — 
          kuid mobiilis peidab allpool olev @media need igal juhul */}
      {shouldRenderFog && <FogLayer armed={fogArmed} animateFog={animateFogEff} />}
      {shouldRenderGrain &&
        (noiseUrl ? <BitmapGrainOverlay noiseUrl={noiseUrl} /> : <SvgGrainOverlay />)}

      <style jsx global>{`
        .space-backdrop{
          position:fixed; inset:0; z-index:0; overflow:hidden;
          pointer-events:none; isolation:isolate;
          background: linear-gradient(180deg, var(--baseTop) 0%, var(--baseBottom) 100%);
        }

        /* === FOG === */
        .fog{
          position:absolute;
          left:calc(50% + var(--fogHorizontalShift));
          bottom:calc(var(--fogOffset) * -1);
          transform:translateX(-50%) translateZ(0);
          width:100%; height:var(--fogHeight);
          pointer-events:none; opacity:.001; will-change:opacity;
          backface-visibility:hidden;
        }
        .fog[data-armed="1"][data-animate="1"]{
          animation:fogAppear var(--fogAppearDur) linear var(--fogAppearDelay) both;
        }
        .fog[data-armed="1"][data-animate="0"]{ opacity:var(--fogOpacity); animation:none; }
        @keyframes fogAppear{
          0%{opacity:.001} 55%{opacity:calc(var(--fogOpacity)*.26)}
          85%{opacity:calc(var(--fogOpacity)*.75)} 100%{opacity:var(--fogOpacity)}
        }

        .fog-blob{
          position:absolute; top:30%; transform:translateY(-50%);
          width:var(--fogBlobSize,85vmax); height:var(--fogBlobSize,85vmax);
          border-radius:9999px; filter:blur(var(--fogBlurPx));
          background: radial-gradient(50% 50% at 50% 50%,
            var(--fogStop0) 0%, var(--fogStop1) 56%, rgba(0,0,0,0) 84%);
          mix-blend-mode:var(--fogBlend);
        }
        @supports (mix-blend-mode: plus-lighter){
          [data-mode="dark"] .fog-blob{ mix-blend-mode: plus-lighter; }
        }
        .fb1{ left:calc(50% - var(--fogSpread)); }
        .fb3{ left:calc(50% + var(--fogSpread)); }

        /* === GRAIN === */
        .sb-grain{ position:absolute; inset:0; opacity:var(--grainOpacity);
                   mix-blend-mode:overlay; pointer-events:none; }
        .sb-grain-svg, .sb-grain-bitmap{ width:100%; height:100%; display:block; }
        .sb-grain-bitmap{ background-repeat:repeat; background-size:auto; }

        /* ===== MOBILE RULE: only gradient, no fog or grain ===== */
        @media (max-width: 768px){
          .fog, .sb-grain{ display:none !important; }
        }
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

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
