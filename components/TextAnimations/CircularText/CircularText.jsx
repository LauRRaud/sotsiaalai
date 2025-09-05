"use client";
import React, { useMemo, useId, useEffect, useState, useRef } from "react";
import "./CircularText.css";

const VIEWBOX = 500;
const R = 200;                   // ringi raadius viewBox ühikutes
const TOP_FRAC = 0.25;           // 12:00 = 25% ringist
const TAU = Math.PI * 2;

export default function CircularText({
  text,
  size = 440,
  duration = 120,
  clockwise = false,
  fontSize = 28,
  weight = 400,
  letterSpacing = 6,             // px
  className = "",
  startAtTop = true,
  offsetDeg = 0,
  ringColor,
  wordColors,
  startDelaySec = 0,
  bottomStartDeg = 120,
  bottomEndDeg = 240,
}) {
  // --- sõnad ---
  const words = useMemo(
    () => (text || "").trim().split(/\s+/).filter(Boolean),
    [text]
  );
  const n = Math.max(1, words.length);

  // --- geomeetria ---
  const L = TAU * R;                 // ühe ringi ümbermõõt (viewBox ühikutes)
  const pxToVB = VIEWBOX / size;     // px → viewBox teisendus
  const dir = clockwise ? 1 : -1;

  const uid = useId();
  const pathId = `circlePath3x-${(className || "ring").replace(/\s+/g, "-")}-${uid}`;

  // mõõdetud stardid (%) FLIP’i jaoks ja laiused (%)
  const [startsPct, setStartsPct] = useState(null);
  const [widthsPct, setWidthsPct] = useState(null);
  // absoluut-stardid (viewBox ühikud) – nendega renderdame textPathi
  const [startsAbs, setStartsAbs] = useState(null);
  const [widthsAbs, setWidthsAbs] = useState(null);

  // --- mõõda laiused ja arvuta stardid (ühtlased vahed) ---
  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch (_) {}

      if (typeof document === "undefined") return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const weightStr = typeof weight === "number" ? `${weight}` : `${weight}`;
      ctx.font = `${weightStr} ${fontSize}px 'Aino Headline','Aino',Arial,sans-serif`;

      const ls = Number(letterSpacing) || 0; // px

      // sõna laius viewBox ühikutes
      const widthsVB = words.map((w) => {
        const s = ("" + w).toUpperCase();
        const base = ctx.measureText(s).width;
        const extra = ls * Math.max(s.length - 1, 0);
        return (base + extra) * pxToVB;
      });

      const totalWords = widthsVB.reduce((a, b) => a + b, 0);
      const gap = Math.max(0, (L - totalWords) / n); // võrdsed vahed

      // 1. sõna keskkoht TOP_FRAC juures
      const anchorU = (startAtTop ? TOP_FRAC : 0) * L;
      const firstStartInLap = ((anchorU - widthsVB[0] / 2) % L + L) % L;

      // teeme ABSOLUUT järjestuse keskmisele ringile [L, 2L)
      const startsAbsLocal = new Array(n);
      startsAbsLocal[0] = firstStartInLap + L; // keskmise ringi algus
      for (let i = 1; i < n; i++) {
        startsAbsLocal[i] = startsAbsLocal[i - 1] + widthsVB[i - 1] + gap;
      }

      // FLIP jaoks (%) – arvuta keskpunkt percent vaates
      const startsPctLocal = startsAbsLocal.map((u) => ((u % L) / L) * 100);
      const widthsPctLocal = widthsVB.map((w) => (w / L) * 100);

      if (!cancelled) {
        setStartsAbs(startsAbsLocal);
        setWidthsAbs(widthsVB);
        setStartsPct(startsPctLocal);
        setWidthsPct(widthsPctLocal);
      }
    };

    measure();
    return () => { cancelled = true; };
    // NB! ära pane "words" massiivi otse dependencyks – stabiilsuse jaoks piisab text-ist
  }, [text, fontSize, weight, letterSpacing, size, startAtTop, n, L, pxToVB]);

  // Fallback enne mõõtmist – võrdsed sektorid keskmisel ringil
  const fallback = useMemo(() => {
    const seg = L / n;
    const first = (startAtTop ? TOP_FRAC * L - seg / 2 : 0) + L;
    const starts = Array.from({ length: n }, (_, i) => first + i * seg);
    const startsPct_ = starts.map((u) => ((u % L) / L) * 100);
    const widthsVB_ = Array.from({ length: n }, () => seg * 0.6);
    const widthsPct_ = widthsVB_.map((w) => (w / L) * 100);
    return { startsAbs: starts, startsPct: startsPct_, widthsAbs: widthsVB_, widthsPct: widthsPct_ };
  }, [n, L, startAtTop]);

  const _startsAbs = startsAbs || fallback.startsAbs;
  const _startsPct = startsPct || fallback.startsPct;
  const _widthsPct = widthsPct || fallback.widthsPct;

  // --- FLIP alumisel kaarel ---
  const wordRefs = useRef([]);
  const animStartRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const bottomStart = bottomStartDeg;
    const bottomEnd = bottomEndDeg;
    const norm = (a) => ((a % 360) + 360) % 360;

    const tick = (t) => {
      if (animStartRef.current == null) animStartRef.current = t;
      const elapsedSec = Math.max(0, (t - animStartRef.current) / 1000 - (startDelaySec + 3));
      const spinDeg = (elapsedSec / duration) * 360 * (dir);

      for (let i = 0; i < _startsPct.length; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;

        const centerPct = (_startsPct[i] + _widthsPct[i] / 2) % 100;
        let angle = centerPct * 3.6 - 90;   // 0%=9:00 → -90° = 12:00
        angle += offsetDeg + spinDeg;

        const vis = norm(angle);
        const isBottom = vis >= bottomStart && vis <= bottomEnd;
        if (isBottom) el.classList.add("ct-flip");
        else el.classList.remove("ct-flip");
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      animStartRef.current = null;
    };
  }, [_startsPct, _widthsPct, duration, dir, offsetDeg, startDelaySec, bottomStartDeg, bottomEndDeg]);

  const getWordFill = (i) =>
    Array.isArray(wordColors) && wordColors.length ? wordColors[i % wordColors.length] : undefined;

  const wordClass = (i) => (i === 0 ? "word1" : i === 1 ? "word2" : "word3");

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      className={`circular-text-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* TEEN 3× ringi ühele pathile: kogupikkus 3L.
           Sõnad paigutame KESKMISELE ringile [L, 2L). */}
        <path
          id={pathId}
          d={[
            // 1. ring
            `M${VIEWBOX / 2},${VIEWBOX / 2} m-${R},0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
            // 2. ring
            `m0,0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
            // 3. ring
            `m0,0`,
            `a ${R},${R} 0 1,1 ${R * 2},0`,
            `a ${R},${R} 0 1,1 -${R * 2},0`,
          ].join(" ")}
        />
      </defs>

      <g className="ct-cycle" style={{ ["--ct-delay"]: `${startDelaySec}s` }}>
        <g style={{ transformOrigin: "50% 50%", transform: `rotate(${offsetDeg}deg)` }}>
          <text
            className="circular-text-line"
            style={{
              color: ringColor,
              fontSize,
              fontWeight: weight,
              letterSpacing: `${letterSpacing}px`,
              animationDuration: `${duration}s`,
              animationDirection: dir === 1 ? "normal" : "reverse",
              animationDelay: "calc(var(--ct-delay, 0s) + 3s)",
            }}
          >
            {_startsAbs.map((startU, i) => (
              <textPath
                key={`${words[i] ?? "w"}-${i}`}
                href={`#${pathId}`}
                startOffset={startU}         // ABSOLUUT: alati keskmisel ringil
                textAnchor="start"
                className={wordClass(i)}
                style={getWordFill(i) ? { fill: getWordFill(i) } : undefined}
                ref={(el) => (wordRefs.current[i] = el)}
              >
                {words[i]}
              </textPath>
            ))}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* Mugavad eelkonfid – sama API */
export function CircularRingLeft() {
  return (
    <CircularText
      text="SEADUSED PRAKTIKA NÕUANDED"
      size={440}
      duration={130}
      clockwise={false}
      fontSize={27}
      weight={400}
      letterSpacing={6}
      className="desc-ring-left"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(57,57,57,0.6)"
      startDelaySec={3}
    />
  );
}

export function CircularRingRight() {
  return (
    <CircularText
      text="ÕIGUSED JUHISED VÕIMALUSED"
      size={440}
      duration={130}
      clockwise={false}
      fontSize={27}
      weight={400}
      letterSpacing={6}
      className="desc-ring-right"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(213,121,105,0.4)"
      startDelaySec={3}
    />
  );
}
