"use client";
import React, { useMemo, useId, useEffect, useState } from "react";
import "./CircularText.css";
import useT from "@/components/i18n/useT";

const VIEWBOX = 500;
const R = 200;
const TOP_FRAC = 0.25; // 0 = ringi algus (parem), 0.25 = üla

const TAU = Math.PI * 2;

export default function CircularText({
  text,
  size = 440,
  duration = 130,
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

  // --- Responsive suurused ---
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

  const L = TAU * R;                        // ringi ümbermõõt (viewBox ühik)
  const pxToVB = VIEWBOX / responsiveSize;  // px → viewBox skaleering
  const dir = clockwise ? 1 : -1;

  const uid = useId();
  const pathId = `circlePath3x-${(className || "ring").replace(/\s+/g, "-")}-${uid}`;

  // Mõõdetud algusoffsetid (viewBox ühikutes). Null = veel mõõtmata.
  const [startsAbs, setStartsAbs] = useState(null);

  // Mõõda sõnade laius (px) canvas’ega → teisenda viewBox’iks → arvuta startOffset’id
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch (_) {}

      if (typeof document === "undefined") return;

      // Canvas võib mõnes režiimis ebaõnnestuda – kaitse
      let ctx = null;
      try {
        const canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
      } catch (_) {}

      // Sõnade laiused viewBox ühikutes
      const widthsVB = [];

      if (ctx) {
        ctx.font = `${weight} ${responsiveFontSize}px 'Aino Headline','Aino',Arial,sans-serif`;
        const ls = Number(responsiveLetterSpacing) || 0;

        for (let wi = 0; wi < words.length; wi++) {
          const s = String(words[wi]).toUpperCase();
          const base = ctx.measureText(s).width; // px
          const extra = ls * Math.max(s.length - 1, 0); // px
          widthsVB.push((base + extra) * pxToVB); // → viewBox
        }
      } else {
        // Fallback: ligikaudne laius, kui canvas puudub
        const approxFactor = 0.55 * responsiveFontSize * pxToVB;
        for (let wi = 0; wi < words.length; wi++) {
          const s = String(words[wi]).toUpperCase();
          const approx = (s.length + Math.max(s.length - 1, 0) * (responsiveLetterSpacing / responsiveFontSize)) * approxFactor;
          widthsVB.push(approx);
        }
      }

      // Vahed sõnade vahel – jaotame ühtlaselt
      const totalWords = widthsVB.reduce((a, b) => a + b, 0);
      const gap = Math.max(0, (L - totalWords) / n);

      // Ankurda esimene sõna üles (“TOP_FRAC”) nii, et sõna keskkoht oleks seal
      const anchorU = (startAtTop ? TOP_FRAC : 0) * L;
      const firstStartInLap = ((anchorU - (widthsVB[0] || 0) / 2) % L + L) % L;

      const starts = new Array(n);
      starts[0] = firstStartInLap + L; // nihutame +L, et vältida negatiivseid väärtusi
      for (let i = 1; i < n; i++) {
        starts[i] = starts[i - 1] + (widthsVB[i - 1] || 0) + gap;
      }

      if (!cancelled) setStartsAbs(starts);
    })();

    return () => {
      cancelled = true;
    };
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

  // Fallback enne mõõtmist: jaota ühtlaselt ümber ringi
  const seg = L / n;
  const first = (startAtTop ? TOP_FRAC * L - seg / 2 : 0) + L;
  const fallbackStarts = Array.from({ length: n }, (_, i) => first + i * seg);

  const _startsAbs = startsAbs || fallbackStarts;

  const getWordFill = (i) =>
    Array.isArray(wordColors) && wordColors.length
      ? wordColors[i % wordColors.length]
      : undefined;

  const wordClass = (i) => (i === 0 ? "word1" : i === 1 ? "word2" : "word3");

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={responsiveSize}
      height={responsiveSize}
      className={`circular-text-svg ${className}`}
      aria-hidden="true"
      // lülita animatsiooni vajadusel CSS-iga (data-animate="0")
      style={{ "--ct-delay": `${startDelaySec}s` }}
    >
      <defs>
        {/* 3x sama ring path (stabiilne, kuid üks piisaks) */}
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
        <g style={{ transformOrigin: "50% 50%", transform: `rotate(${offsetDeg}deg)` }}>
          <text
            className="circular-text-line"
            style={{
              color: ringColor,
              fontSize: responsiveFontSize,
              fontWeight: weight,
              letterSpacing: `${responsiveLetterSpacing}px`,
              animationDuration: `${duration}s`,
              animationDirection: dir === 1 ? "normal" : "reverse",
              // tegelik viide CSS-is: animation-delay: calc(var(--ct-delay, 0s) + 3s)
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

/* --- Kasutusnäited --- */
export function CircularRingLeft() {
  const t = useT();
  return (
    <CircularText
      text={t("home.ring.left", "SEADUSED PRAKTIKA NÕUANDED")}
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
      startDelaySec={2.7}
    />
  );
}

export function CircularRingRight() {
  const t = useT();
  return (
    <CircularText
      text={t("home.ring.right", "ÕIGUSED JUHISED VÕIMALUSED")}
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
      startDelaySec={2.7}
    />
  );
}
