"use client";
import React, { useMemo, useId, useEffect, useState, useRef } from "react";
import "./CircularText.css";

const VIEWBOX = 500;       // SVG viewBox suurus
const R = 200;             // ringi raadius viewBox ühikutes
const TOP_FRAC = 0.25;     // 12:00 on pathil 25%

export function CircularText({
  text,
  size = 440,              // renderi px mõõt
  duration = 120,          // pideva pöörde täisring (s)
  clockwise = false,       // pöörde suund
  fontSize = 32,
  weight = 400,
  letterSpacing = 6,       // px
  className = "",
  startAtTop = true,       // ankur 12:00
  offsetDeg = 0,           // staatiline nihutus kraadides
  ringColor,
  wordColors,              // nt ["#ccc","#f88","#9cf"]
  startDelaySec = 0,       // sinuenda oma fade/flip algust
  gapRatio = 0.14,         // hetkel ei kasuta – jätame võrdsed vahed
  bottomStartDeg = 120,    // alumise sektori algus (kell 4)
  bottomEndDeg = 240,      // alumise sektori lõpp (kell 8)
}) {
  // Sõnad järjestuses: 1., 2., 3. – neile määrame .word1/.word2/.word3
  const words = useMemo(
    () => (text || "").trim().split(/\s+/).filter(Boolean),
    [text]
  );
  const n = Math.max(1, words.length);

  const L = 2 * Math.PI * R;      // ümbermõõt viewBox ühikutes
  const pxToVB = VIEWBOX / size;  // px -> viewBox teisendus
  const dir = clockwise ? 1 : -1;

  const uid = useId();
  const pathId = `circlePath-${className || "ring"}-${uid}`;

  // Mõõdetud algpositsioonid ja laiused protsendina ringi pikkusest
  const [startOffsetsPct, setStartOffsetsPct] = useState(null);
  const [widthsPct, setWidthsPct] = useState(null);

  // Mõõda sõnade laius (font + letterSpacing) ja jaga ringile võrdsed vahed
  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch (_) {}

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const weightStr = typeof weight === "number" ? `${weight}` : `${weight}`;
      ctx.font = `${weightStr} ${fontSize}px 'Aino Headline','Aino',Arial,sans-serif`;

      const ls = Number(letterSpacing) || 0; // px
      const widthsVB = words.map((w) => {
        const s = ("" + w).toUpperCase();
        const base = ctx.measureText(s).width;
        const extra = ls * Math.max(s.length - 1, 0);
        return (base + extra) * pxToVB; // viewBox ühikutes
      });

      const totalWords = widthsVB.reduce((a, b) => a + b, 0);
      const gap = Math.max(0, (L - totalWords) / n); // võrdsed vahed

      // Ankurda 1. sõna algus nii, et selle keskpunkt oleks 12:00
      const anchorU = (startAtTop ? TOP_FRAC : 0) * L;
      let firstStart = anchorU - widthsVB[0] / 2;
      firstStart = ((firstStart % L) + L) % L;

      const startsU = new Array(n);
      startsU[0] = firstStart;
      for (let i = 1; i < n; i++) {
        startsU[i] = (startsU[i - 1] + widthsVB[i - 1] + gap) % L;
      }

      const pctStarts = startsU.map((u) => (u / L) * 100);
      const pctWidths = widthsVB.map((w) => (w / L) * 100);

      if (!cancelled) {
        setStartOffsetsPct(pctStarts);
        setWidthsPct(pctWidths);
      }
    };

    measure();
    return () => { cancelled = true; };
  }, [text, fontSize, weight, letterSpacing, size, startAtTop, n, L, pxToVB]);

  const getWordFill = (i) =>
    Array.isArray(wordColors) && wordColors.length
      ? wordColors[i % wordColors.length]
      : undefined;

  // Fallback enne mõõtmist: jaota keskpunktid võrdselt
  const fallbackStarts = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const centerPct = ((TOP_FRAC * 100 + (i * 100) / n) % 100 + 100) % 100;
      // textAnchor="start" ⇒ nihuta algust poole "sektori" võrra tagasi
      return ((centerPct - (50 / n)) + 100) % 100;
    });
  }, [n]);

  // 🔄 LIVE FLIP: pööra alumises sektoris 180°
  const wordRefs = useRef([]);
  const startsRef = useRef([]);
  const widthsRef = useRef([]);
  const animStartRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startsRef.current = (startOffsetsPct || fallbackStarts).slice();
  }, [startOffsetsPct, fallbackStarts]);

  useEffect(() => {
    widthsRef.current = (widthsPct || Array.from({ length: n }, () => 100 / n)).slice();
  }, [widthsPct, n]);

  useEffect(() => {
    const bottomStart = bottomStartDeg;
    const bottomEnd = bottomEndDeg;
    const norm = (a) => ((a % 360) + 360) % 360;

    const tick = (t) => {
      if (animStartRef.current == null) animStartRef.current = t;
      // CSS-is on +3s baas-delay → peegelda siin ka
      const elapsedSec = Math.max(0, (t - animStartRef.current) / 1000 - (startDelaySec + 3));
      const spinDeg = (elapsedSec / duration) * 360 * dir;

      const starts = startsRef.current;
      const widths = widthsRef.current;

      for (let i = 0; i < starts.length; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;

        // sõna keskpunkt: start + width/2 (protsent)
        const centerPct = (starts[i] + widths[i] / 2) % 100;
        let angle = centerPct * 3.6 - 90;   // 0%=9:00 → -90° nihutame 12:00-ks

        // lisa staatiline offset + live spin
        angle += offsetDeg + spinDeg;

        const vis = norm(angle); // 0..360, 0=12:00
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
  }, [duration, dir, offsetDeg, startDelaySec, bottomStartDeg, bottomEndDeg]);

  // .word1 / .word2 / .word3 klassid esimesetele kolmele sõnale
  const getWordClass = (i) => {
    if (i === 0) return "word1";
    if (i === 1) return "word2";
    if (i === 2) return "word3";
    // kui on rohkem kui 3 sõna, anna neile sama rütm nagu word3
    return "word3";
  };

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      className={`circular-text-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <path
          id={pathId}
          d={`M${VIEWBOX / 2},${VIEWBOX / 2} m-${R},0
              a ${R},${R} 0 1,1 ${R * 2},0
              a ${R},${R} 0 1,1 -${R * 2},0`}
        />
      </defs>

      {/* Fade-wrapper: peidus kuni delay läbi; SPIN ootab sama delay'd (CSS-is +3s sees) */}
      <g className="ct-cycle" style={{ "--ct-delay": `${startDelaySec}s` }}>
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
              animationDelay: "calc(var(--ct-delay, 0s) + 3s)", // kooskõlas CSS-iga
            }}
          >
            {(startOffsetsPct || fallbackStarts).map((startPct, i) => (
              <textPath
                key={`${words[i] ?? "w"}-${i}`}
                href={`#${pathId}`}
                startOffset={`${startPct}%`}
                textAnchor="start"
                className={getWordClass(i)}
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

/* Näidised – samad propsid, klassid tulevad järjekorrast */
export function CircularRingLeft() {
  return (
    <CircularText
      text="SEADUSED PRAKTIKA NÕUANDED"
      size={440}
      duration={130}
      clockwise={false}
      fontSize={32}
      weight={400}
      letterSpacing={6}
      className="desc-ring-left"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(57,57,57,0.6)"
      startDelaySec={4}
      gapRatio={0.14}
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
      fontSize={32}
      weight={400}
      letterSpacing={6}
      className="desc-ring-right"
      startAtTop={true}
      offsetDeg={6}
      ringColor="rgba(213,121,105,0.4)"
      startDelaySec={4}
      gapRatio={0.14}
    />
  );
}

export default CircularText;
