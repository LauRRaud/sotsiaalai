"use client";
import React from "react";
import "./CircularText.css";

const VIEWBOX = 500;
const R = 200;

/**
 * CircularText – jaotab SÕNAD võrdselt ringile, toetab per-sõna värve.
 *
 * Props:
 * - text: "SEADUSED PRAKTIKA NÕUANDED"
 * - size: SVG diameeter px (pane ~430–440, sama mis kaart)
 * - duration: täisringi aeg sekundites
 * - clockwise: animatsiooni suund (true = päripäeva)
 * - fontSize, weight, letterSpacing: teksti stiil
 * - startAtTop: kas esimene sõna algab kell 12 positsioonist
 * - offsetDeg: peenhäälestus kraadides (+/- paar kraadi)
 * - ringColor: üldine värv (fallback, kui wordColors-i pole)
 * - wordColors: massiiv per-sõna värvidega (nt ["#fff","#ffab91","#b0b4b8"])
 */
export function CircularText({
  text,
  size = 440,
  duration = 90,
  clockwise = true,
  fontSize = 22,
  weight = 500,
  letterSpacing = 6,
  className = "",
  startAtTop = true,
  offsetDeg = 0,
  ringColor,                 // üldine värv (kasutatakse, kui wordColors puudub)
  wordColors,                // per-sõna värvid (mustri kordus lubatud)
}) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  const n = Math.max(1, words.length);
  const pathId = `circlePath-${className || "ring"}`;

  const startPct = startAtTop ? 50 : 0;   // 50% = path'i ülemine punkt
  const stepPct = 100 / n;
  const wrapPct = (p) => ((p % 100) + 100) % 100;

  // abifunktsioon: võta i-nda sõna värv (kordub kui lühem)
  const getWordFill = (i) => {
    if (Array.isArray(wordColors) && wordColors.length) {
      return wordColors[i % wordColors.length];
    }
    return undefined; // siis langeb tagasi <text> currentColor'ile
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

      {/* Väike globaalne nihutus (optiline joondus) */}
      <g style={{ transformOrigin: "50% 50%", transform: `rotate(${offsetDeg}deg)` }}>
        <text
          className="circular-text-line"
          style={{
            color: ringColor, // juhib currentColor'i, kui wordColors puudub
            fontSize,
            fontWeight: weight,
            letterSpacing: `${letterSpacing}px`,
            animationDuration: `${duration}s`,
            animationDirection: clockwise ? "normal" : "reverse",
          }}
        >
          {words.map((w, i) => {
            const startOffsetPct = wrapPct(startPct + i * stepPct);
            const fill = getWordFill(i);
            return (
              <textPath
                key={`${w}-${i}`}
                href={`#${pathId}`}
                startOffset={`${startOffsetPct}%`}
                textAnchor="middle"
                style={fill ? { fill } : undefined}
              >
                {w}
              </textPath>
            );
          })}
        </text>
      </g>
    </svg>
  );
}

/* -------------------------
   Kaardi-spetsiifilised wrapperid (näidatud eri värvidega)
   Muuda wordColors massiive vastavalt maitsele.
   ------------------------- */

export function CircularRingLeft() {
  return (
    <CircularText
      text="SEADUSED PRAKTIKA NÕUANDED"
      size={440}
      duration={90}
      clockwise={true}
      fontSize={25}
      weight={400}
      letterSpacing={6}
      className="desc-ring-left"
      startAtTop={true}
      offsetDeg={0}
      // Kui soovid ühevärvilist, kustuta wordColors ja kasuta ringColor
      // ringColor="rgba(19,20,43,1)"
      wordColors={["#1B2A5A", "#1B2A5A", "#1B2A5A"]}
    />
  );
}

export function CircularRingRight() {
  return (
    <CircularText
      text="ÕIGUSED JUHISED VÕIMALUSED"
      size={440}
      duration={90}
      clockwise={true}
      fontSize={24}
      weight={400}
      letterSpacing={6}
      className="desc-ring-right"
      startAtTop={true}
      offsetDeg={0}
      // ringColor="rgba(255,255,255,1)"
      wordColors={["#BFC3C9", "#BFC3C9", "#BFC3C9"]}
    />
  );
}

export default CircularText;
