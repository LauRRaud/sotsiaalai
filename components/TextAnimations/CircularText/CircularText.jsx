"use client";
import React, { useMemo, useId, useEffect, useState } from "react";
import "./CircularText.css";

const VIEWBOX = 500;
const R = 200;
const TOP_FRAC = 0.25; // 12:00
const TAU = Math.PI * 2;

export default function CircularText({
  text,
  size = 430,
  duration = 130,          // pöörlevate sõnade kestus (intro ei pöörle)
  clockwise = false,
  fontSize = 28,
  weight = 400,
  letterSpacing = 6,
  className = "",
  startAtTop = true,
  offsetDeg = 0,
  ringColor,
  wordColors,
  startDelaySec = 0,

  // Intro: kumer textPath ülaservas (12:00), paigal
  introText,               // nt "SPETSIALISTILE" / "NÕU KÜSIJALE"
  introDelayMs = 3000,     // viivitus enne intro ilmumist
  introShowMs  = 8000,     // kaua on täielikult nähtav
  introFadeMs  = 1800,     // fade in/out
  introGapMs   = 3000,     // paus pärast intro fade-out’i (täpselt 3 s)
}) {
  const words = useMemo(
    () => (text || "").trim().split(/\s+/).filter(Boolean),
    [text]
  );
  const n = Math.max(1, words.length);

  // Responsive
  const [responsiveSize, setResponsiveSize] = useState(size);
  const [responsiveFontSize, setResponsiveFontSize] = useState(fontSize);
  const [responsiveLetterSpacing, setResponsiveLetterSpacing] = useState(letterSpacing);

  useEffect(() => {
    function updateSize() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 400) {
        setResponsiveSize(280);
        setResponsiveFontSize(20);
        setResponsiveLetterSpacing(3);
      } else if (w < 768) {
        setResponsiveSize(340);
        setResponsiveFontSize(26);
        setResponsiveLetterSpacing(4);
      } else {
        setResponsiveSize(size);
        setResponsiveFontSize(fontSize);
        setResponsiveLetterSpacing(letterSpacing);
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [size, fontSize, letterSpacing]);

  const L = TAU * R;
  const pxToVB = VIEWBOX / responsiveSize;
  const dir = clockwise ? 1 : -1;

  const uid = useId();
  const pathId = `circlePath3x-${(className || "ring").replace(/\s+/g, "-")}-${uid}`;

  // Sõnade startOffsetid
  const [startsAbs, setStartsAbs] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch (_) {}
      if (typeof document === "undefined") return;

      let ctx = null;
      try {
        const canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
      } catch (_) {}

      const widthsVB = [];
      if (ctx) {
        ctx.font = `${weight} ${responsiveFontSize}px 'Aino Headline','Aino',Arial,sans-serif`;
        const ls = Number(responsiveLetterSpacing) || 0;
        for (let wi = 0; wi < words.length; wi++) {
          const s = String(words[wi]).toUpperCase();
          const base = ctx.measureText(s).width;
          const extra = ls * Math.max(s.length - 1, 0);
          widthsVB.push((base + extra) * pxToVB);
        }
      } else {
        const approxFactor = 0.55 * responsiveFontSize * pxToVB;
        for (let wi = 0; wi < words.length; wi++) {
          const s = String(words[wi]).toUpperCase();
          const approx =
            (s.length +
              Math.max(s.length - 1, 0) * (responsiveLetterSpacing / responsiveFontSize)) *
            approxFactor;
          widthsVB.push(approx);
        }
      }

      const totalWords = widthsVB.reduce((a, b) => a + b, 0);
      const gap = Math.max(0, (L - totalWords) / n);

      const anchorU = (startAtTop ? TOP_FRAC : 0) * L;
      const firstStartInLap = ((anchorU - (widthsVB[0] || 0) / 2) % L + L) % L;

      const starts = new Array(n);
      starts[0] = firstStartInLap + L;
      for (let i = 1; i < n; i++) {
        starts[i] = starts[i - 1] + (widthsVB[i - 1] || 0) + gap;
      }
      if (!cancelled) setStartsAbs(starts);
    })();
    return () => { cancelled = true; };
  }, [
    words,
    responsiveFontSize,
    responsiveLetterSpacing,
    responsiveSize,
    startAtTop,
    n,
    L,
    pxToVB,
    weight,
  ]);

  // Intro startOffset (fraasi keskjoon kell 12)
  const [introStartU, setIntroStartU] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!introText) { setIntroStartU(null); return; }
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch (_) {}

      let ctx = null;
      try {
        const canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
      } catch (_) {}

      const s = String(introText).toUpperCase();
      let widthVB = 0;
      if (ctx) {
        ctx.font = `${weight} ${responsiveFontSize}px 'Aino Headline','Aino',Arial,sans-serif`;
        const base = ctx.measureText(s).width;
        const extra = (Number(responsiveLetterSpacing) || 0) * Math.max(s.length - 1, 0);
        widthVB = (base + extra) * pxToVB;
      } else {
        const approxFactor = 0.55 * responsiveFontSize * pxToVB;
        widthVB =
          (s.length +
            Math.max(s.length - 1, 0) * (responsiveLetterSpacing / responsiveFontSize)) *
          approxFactor;
      }

      const anchorU = TOP_FRAC * L; // 12:00
      const startU = ((anchorU - widthVB / 2) % L + L) % L + L;
      if (!cancelled) setIntroStartU(startU);
    })();
    return () => { cancelled = true; };
  }, [introText, responsiveFontSize, responsiveLetterSpacing, pxToVB, L, weight]);

  // Fallback enne mõõtmist
  const seg = L / n;
  const first = (startAtTop ? TOP_FRAC * L - seg / 2 : 0) + L;
  const fallbackStarts = Array.from({ length: n }, (_, i) => first + i * seg);
  const _startsAbs = startsAbs || fallbackStarts;

  const getWordFill = (i) =>
    Array.isArray(wordColors) && wordColors.length
      ? wordColors[i % wordColors.length]
      : undefined;

  const wordClass = (i) => (i === 0 ? "word1" : i === 1 ? "word2" : "word3");

  // AJASTUS
  const hasIntro = !!introText;
  const t0 = introDelayMs;
  const t1 = t0 + introFadeMs;
  const t2 = t1 + introShowMs;
  const t3 = t2 + introFadeMs;
  const t4 = t3 + introGapMs; // pärast seda käivituvad sõnad

  // ainult sinu algne viivitus; intro aega ei liida juurde (väldib “tühjust”)
  const delayForWordsSec = startDelaySec || 0;

  // Faasid: idle → intro-in → show → intro-out → gap → words
  const [phase, setPhase] = useState(hasIntro ? "idle" : "words");
  const [showIntro, setShowIntro] = useState(!!hasIntro);

  useEffect(() => {
    if (!hasIntro) return;
    const timers = [
      setTimeout(() => setPhase("intro-in"), t0),
      setTimeout(() => setPhase("show"),     t1),
      setTimeout(() => setPhase("intro-out"), t2),
      setTimeout(() => { setPhase("gap"); setShowIntro(false); }, t3),
      setTimeout(() => setPhase("words"),    t4),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIntro, t0, t1, t2, t3, t4]);

  const introVisClass =
    phase === "intro-in" || phase === "show" ? "is-visible" : "is-hidden";

  const dirStyle = { animationDirection: dir === 1 ? "normal" : "reverse" };

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={responsiveSize}
      height={responsiveSize}
      className={`circular-text-svg ${className}`}
      aria-hidden="true"
      style={{
        "--ct-delay": `${delayForWordsSec}s`,
        "--ct-rotDur": `${duration}s`,
        "--introFadeMs": `${introFadeMs}ms`,
      }}
    >
      <defs>
        <path
          id={pathId}
          d={[
            `M${VIEWBOX / 2},${VIEWBOX / 2} m-${R},0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
            `m0,0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
            `m0,0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
          ].join(" ")}
        />
      </defs>

      <g className="ct-cycle">
        {/* Ühine offsetDeg nii intro kui sõnade jaoks → joondus korrektne */}
        <g style={{ transformOrigin: "50% 50%", transform: `rotate(${offsetDeg}deg)` }}>
          {/* INTRO — kumer textPath, ülaservas, paigal */}
          {showIntro && introText && introStartU != null && (
            <text
              className={`intro-static ${introVisClass}`}
              style={{
                fill: ringColor,
                fontFamily: "'Aino Headline','Aino',Arial,sans-serif",
                fontWeight: weight,
                fontSize: responsiveFontSize,
                letterSpacing: `${responsiveLetterSpacing}px`,
                textTransform: "uppercase",
              }}
            >
              <textPath href={`#${pathId}`} startOffset={introStartU} textAnchor="start">
                {String(introText).toUpperCase()}
              </textPath>
            </text>
          )}

          {/* ÜKSIKSÕNAD — renderduvad alles pärast intro+pausi */}
          {phase === "words" && (
            <text
              className="circular-text-line"
              style={{
                color: ringColor,
                fontSize: responsiveFontSize,
                fontWeight: weight,
                letterSpacing: `${responsiveLetterSpacing}px`,
                animationDuration: `${duration}s`,
                ...dirStyle,
              }}
            >
              {_startsAbs.map((startU, i) => (
                <textPath
                  key={`${words[i] ?? "w"}-${i}`}
                  href={`#${pathId}`}
                  startOffset={startU}
                  textAnchor="start"
                  className={wordClass(i)}
                  style={getWordFill(i) ? { fill: getWordFill(i) } : undefined}
                >
                  {words[i]}
                </textPath>
              ))}
            </text>
          )}
        </g>
      </g>
    </svg>
  );
}

/* --- Kasutusnäited --- */
export function CircularRingLeft() {
  return (
    <CircularText
      text="SEADUSED PRAKTIKA NÕUANDED"
      size={430}
      duration={130}
      clockwise={false}
      fontSize={34}
      weight={400}
      letterSpacing={6}
      className="desc-ring-left"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(57,57,57,0.6)"
      startDelaySec={2}
      introText="SPETSIALISTILE"
      introDelayMs={3000}
      introShowMs={4500}
      introFadeMs={1200}
      introGapMs={100}
    />
  );
}

export function CircularRingRight() {
  return (
    <CircularText
      text="ÕIGUSED JUHISED VÕIMALUSED"
      size={430}
      duration={130}
      clockwise={false}
      fontSize={34}
      weight={400}
      letterSpacing={6}
      className="desc-ring-right"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(213,121,105,0.4)"
      startDelaySec={2}
      introText="NÕU KÜSIJALE"
      introDelayMs={3000}
      introShowMs={4500}
      introFadeMs={1200}
      introGapMs={100}
    />
  );
}
