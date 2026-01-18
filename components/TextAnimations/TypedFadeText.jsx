"use client";

import { useEffect, useMemo, useState } from "react";
function splitGraphemes(text) {
  if (!text) return [];
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme"
    });
    return Array.from(segmenter.segment(text), s => s.segment);
  }
  return Array.from(text);
}
export default function TypedFadeText({
  text,
  reduceMotion = false,
  ariaHidden = false,
  className = "",
  staggerMs = 140,
  holdMs = 900,
  fadeMs = 450,
  gapMs = 500
}) {
  const segments = useMemo(() => splitGraphemes(text), [text]);
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? segments.length : 0);
  const [isFading, setIsFading] = useState(false);
  useEffect(() => {
    if (reduceMotion) {
      setVisibleCount(segments.length);
      setIsFading(false);
      return;
    }
    let alive = true;
    const timeouts = [];
    const sleep = ms => new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      timeouts.push(id);
    });
    const run = async () => {
      while (alive) {
        setIsFading(false);
        setVisibleCount(0);
        const n = segments.length;
        for (let i = 1; i <= n; i += 1) {
          await sleep(staggerMs);
          if (!alive) return;
          setVisibleCount(i);
        }
        await sleep(holdMs);
        if (!alive) return;
        setIsFading(true);
        await sleep(fadeMs + gapMs);
      }
    };
    run();
    return () => {
      alive = false;
      for (const id of timeouts) clearTimeout(id);
    };
  }, [fadeMs, gapMs, holdMs, reduceMotion, segments, staggerMs, text]);
  if (!text) return null;
  const content = <span aria-hidden="true">
      {segments.map((ch, i) => <span key={`${i}-${ch}`} className={["nav-meist-letter", ch === " " ? "is-space" : "", i < visibleCount ? "is-on" : ""].filter(Boolean).join(" ")}>
          {ch === " " ? "\u00A0" : ch}
        </span>)}
    </span>;
  if (ariaHidden) {
    return <span className={["nav-meist-text", isFading ? "is-fading" : "", className].filter(Boolean).join(" ")} aria-hidden="true">
        {content}
      </span>;
  }
  return <span className={["nav-meist-text", isFading ? "is-fading" : "", className].filter(Boolean).join(" ")} aria-label={text}>
      <span className="sr-only">{text}</span>
      {content}
    </span>;
}