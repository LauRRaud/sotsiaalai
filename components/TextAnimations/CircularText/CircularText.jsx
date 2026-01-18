"use client";

import React, { useMemo, useId, useEffect, useState, useRef } from "react";
import "./CircularText.css";
import useT from "@/components/i18n/useT";
const VIEWBOX = 500;
const DEFAULT_RADIUS = 200;
const TOP_FRAC = 0.25;
const TAU = Math.PI * 2;
export default function CircularText({
  text,
  size = 420,
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
  radius = DEFAULT_RADIUS,
  startDelaySec = 0
}) {
  const words = useMemo(() => (text || "").trim().split(/\s+/).filter(Boolean), [text]);
  const n = Math.max(1, words.length);
  const svgRef = useRef(null);
  const [responsiveSize, setResponsiveSize] = useState(size);
  const [responsiveFontSize, setResponsiveFontSize] = useState(fontSize);
  const [responsiveLetterSpacing, setResponsiveLetterSpacing] = useState(letterSpacing);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = Math.max(1, Math.min(rect.width, rect.height));
      setResponsiveSize(prev => prev != null && Math.abs(prev - next) < 0.5 ? prev : next);
    };
    update();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    function updateSize() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 400) {
        setResponsiveFontSize(20);
        setResponsiveLetterSpacing(3);
      } else if (w < 768) {
        setResponsiveFontSize(26);
        setResponsiveLetterSpacing(4);
      } else {
        setResponsiveFontSize(fontSize);
        setResponsiveLetterSpacing(letterSpacing);
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [size, fontSize, letterSpacing]);
  const L = TAU * radius;
  const pxToVB = VIEWBOX / responsiveSize;
  const dir = clockwise ? 1 : -1;
  const uid = useId();
  const pathId = `circlePath3x-${uid}`;
  const [startsAbs, setStartsAbs] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {}
      if (typeof document === "undefined") return;
      let ctx = null;
      try {
        const canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
      } catch {}
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
          const approx = (s.length + Math.max(s.length - 1, 0) * (responsiveLetterSpacing / responsiveFontSize)) * approxFactor;
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
    return () => {
      cancelled = true;
    };
  }, [words, responsiveFontSize, responsiveLetterSpacing, responsiveSize, startAtTop, n, L, pxToVB, weight]);
  const seg = L / n;
  const first = (startAtTop ? TOP_FRAC * L - seg / 2 : 0) + L;
  const fallbackStarts = Array.from({
    length: n
  }, (_, i) => first + i * seg);
  const _startsAbs = startsAbs || fallbackStarts;
  const getWordFill = i => Array.isArray(wordColors) && wordColors.length ? wordColors[i % wordColors.length] : undefined;
  const wordClass = i => i === 0 ? "word1" : i === 1 ? "word2" : "word3";
  return <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} ref={svgRef} width="100%" height="100%" className={`circular-text-svg ${className}`} aria-hidden="true" style={{
    "--ct-delay": `${startDelaySec}s`
  }}>
      <defs>
        {}
        <path id={pathId} d={[`M${VIEWBOX / 2},${VIEWBOX / 2} m-${radius},0`, `a ${radius},${radius} 0 1,1 ${radius * 2},0`, `a ${radius},${radius} 0 1,1 -${radius * 2},0`, `m0,0`, `a ${radius},${radius} 0 1,1 ${radius * 2},0`, `a ${radius},${radius} 0 1,1 -${radius * 2},0`, `m0,0`, `a ${radius},${radius} 0 1,1 ${radius * 2},0`, `a ${radius},${radius} 0 1,1 -${radius * 2},0`].join(" ")} />
      </defs>
      <g className="ct-cycle">
        <g style={{
        transformOrigin: "50% 50%",
        transform: `rotate(${offsetDeg}deg)`
      }}>
          <text className="circular-text-line" style={{
          color: ringColor,
          fontSize: responsiveFontSize,
          fontWeight: weight,
          letterSpacing: `${responsiveLetterSpacing}px`,
          animationDuration: `${duration}s`,
          animationDirection: dir === 1 ? "normal" : "reverse"
        }}>
            {_startsAbs.map((startU, i) => <textPath key={`${words[i] ?? "w"}-${i}`} href={`#${pathId}`} startOffset={startU} textAnchor="start" className={wordClass(i)} style={getWordFill(i) ? {
            fill: getWordFill(i)
          } : undefined}>
                {words[i]}
              </textPath>)}
          </text>
        </g>
      </g>
    </svg>;
}
export function CircularRingLeft({
  className = ""
} = {}) {
  const t = useT();
  return <CircularText text={t("home.ring.left", "SEADUSED PRAKTIKA NÕUANDED")} size={420} radius={186} duration={130} clockwise={false} fontSize={31} weight={400} letterSpacing={6} className={["desc-ring-left", "circular-ring", className].filter(Boolean).join(" ")} startAtTop={true} offsetDeg={6} ringColor="rgba(57,57,57,0.6)" startDelaySec={2.7} />;
}
export function CircularRingRight({
  className = ""
} = {}) {
  const t = useT();
  return <CircularText text={t("home.ring.right", "ÕIGUSED JUHISED VÕIMALUSED")} size={420} radius={186} duration={130} clockwise={false} fontSize={31} weight={400} letterSpacing={6} className={["desc-ring-right", "circular-ring", className].filter(Boolean).join(" ")} startAtTop={true} offsetDeg={6} ringColor="rgba(205, 93, 93, 0.4)" startDelaySec={2.7} />;
}