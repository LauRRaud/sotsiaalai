"use client";
import React, { useMemo, useId, useEffect, useState } from "react";
import "./CircularText.css";

const VIEWBOX = 500;
const R = 200;
const TOP_FRAC = 0.25;
const TAU = Math.PI * 2;

export default function CircularText({
  text,
  size = 440,
  duration = 130,          // sinu ringi pöörlemise kestus (jäta nagu sul on)
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
}) {
  const words = useMemo(
    () => (text || "").trim().split(/\s+/).filter(Boolean),
    [text]
  );
  const n = Math.max(1, words.length);

  const L = TAU * R;
  const pxToVB = VIEWBOX / size;
  const dir = clockwise ? 1 : -1;

  const uid = useId();
  const pathId = `circlePath3x-${(className || "ring").replace(/\s+/g, "-")}-${uid}`;

  const [startsAbs, setStartsAbs] = useState(null);
  const [widthsAbs, setWidthsAbs] = useState(null);

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

      ctx.font = `${weight} ${fontSize}px 'Aino Headline','Aino',Arial,sans-serif`;
      const ls = Number(letterSpacing) || 0;

      const widthsVB = words.map((w) => {
        const s = ("" + w).toUpperCase();
        const base = ctx.measureText(s).width;
        const extra = ls * Math.max(s.length - 1, 0);
        return (base + extra) * pxToVB;
      });

      const totalWords = widthsVB.reduce((a, b) => a + b, 0);
      const gap = Math.max(0, (L - totalWords) / n);

      const anchorU = (startAtTop ? TOP_FRAC : 0) * L;
      const firstStartInLap = ((anchorU - widthsVB[0] / 2) % L + L) % L;

      const startsAbsLocal = new Array(n);
      startsAbsLocal[0] = firstStartInLap + L; // paigutame keskmisele ringile [L,2L)
      for (let i = 1; i < n; i++) {
        startsAbsLocal[i] = startsAbsLocal[i - 1] + widthsVB[i - 1] + gap;
      }

      if (!cancelled) {
        setStartsAbs(startsAbsLocal);
        setWidthsAbs(widthsVB);
      }
    };

    measure();
    return () => { cancelled = true; };
  }, [text, fontSize, weight, letterSpacing, size, startAtTop, n, L, pxToVB]);

  // Fallback enne mõõtmist
  const seg = L / n;
  const first = (startAtTop ? TOP_FRAC * L - seg / 2 : 0) + L;
  const fallbackStarts = Array.from({ length: n }, (_, i) => first + i * seg);

  const _startsAbs = startsAbs || fallbackStarts;

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
        {/* 3× ring ühel pathil – paigutame tekstid keskmisele ringile */}
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
                startOffset={startU}
                textAnchor="start"
                className={wordClass(i)}
                style={getWordFill(i) ? { fill: getWordFill(i) } : undefined}
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

/* Sinu eelkonfid jäävad samaks */
export function CircularRingLeft() {
  return (
    <CircularText
      text="SEADUSED PRAKTIKA NÕUANDED"
      size={440}
      duration={130}
      clockwise={false}
      fontSize={34}
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
      fontSize={34}
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
