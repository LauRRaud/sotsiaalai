"use client";
import { useEffect, useRef, useState } from "react";

const CLICKABLE =
  'a[href],button,[role="button"],label,summary,select,option,input[type="button"],input[type="submit"],input[type="reset"],.cursor-pointer,.btn,.button';

export default function ClickPulseCursor({ size = 16 }) {
  const dotRef = useRef(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: -200, y: -200 });
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;

    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduce) return undefined;

    const el = dotRef.current;
    if (!el) return undefined;

    const isClickable = (node) => (node && typeof node.closest === "function" ? !!node.closest(CLICKABLE) : false);

    const sync = () => {
      rafRef.current = 0;
      const { x, y } = pos.current;
      el.style.setProperty("--cursor-x", `${x}px`);
      el.style.setProperty("--cursor-y", `${y}px`);
    };

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(sync);
    };

    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      const nextActive = isClickable(e.target);
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      schedule();
    };

    const onLeave = () => {
      activeRef.current = false;
      setActive(false);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className={`click-pulse-cursor${active ? " is-active" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
