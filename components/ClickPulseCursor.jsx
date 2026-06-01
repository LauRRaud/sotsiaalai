"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
const CLICKABLE = 'a[href],button,[role="button"],label,summary,select,option,input[type="button"],input[type="submit"],input[type="reset"],.cursor-pointer,.btn,.button';
export default function ClickPulseCursor({
  size = 16
}) {
  const dotRef = useRef(null);
  const rafRef = useRef(0);
  const pos = useRef({
    x: -200,
    y: -200
  });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const activeRef = useRef(false);
  const refreshRef = useRef(null);
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return undefined;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    const coarsePointer = window.matchMedia?.("(pointer: coarse)");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const standalone = window.matchMedia?.("(display-mode: standalone)");
    const fullscreen = window.matchMedia?.("(display-mode: fullscreen)");
    const getStandalone = () => Boolean(standalone?.matches || fullscreen?.matches || navigator.standalone);
    const update = () => {
      setEnabled(Boolean(finePointer?.matches && !coarsePointer?.matches && !reduceMotion?.matches && !getStandalone()));
    };
    update();
    const queries = [finePointer, coarsePointer, reduceMotion, standalone, fullscreen].filter(Boolean);
    queries.forEach(query => query.addEventListener?.("change", update));
    window.addEventListener("resize", update, {
      passive: true
    });
    return () => {
      queries.forEach(query => query.removeEventListener?.("change", update));
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduce) return undefined;
    const el = dotRef.current;
    if (!el) return undefined;
    const isClickable = node => {
      if (!node || typeof node.closest !== "function") return false;
      if (node.closest(".no-click-pulse")) return false;
      return !!node.closest(CLICKABLE);
    };
    const sync = () => {
      rafRef.current = 0;
      const {
        x,
        y
      } = pos.current;
      el.style.setProperty("--cursor-x", `${x}px`);
      el.style.setProperty("--cursor-y", `${y}px`);
    };
    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(sync);
    };
    const refreshFromPoint = () => {
      const {
        x,
        y
      } = pos.current;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const node = document.elementFromPoint(x, y);
      const nextActive = isClickable(node);
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      schedule();
    };
    let refreshTimer = 0;
    const scheduleRefresh = (delay = 60) => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refreshFromPoint, delay);
    };
    refreshRef.current = () => scheduleRefresh(40);
    const onMove = e => {
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
    const onPointerDown = () => {
      activeRef.current = false;
      setActive(false);
    };
    const onPointerUp = () => scheduleRefresh(80);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        activeRef.current = false;
        setActive(false);
        return;
      }
      scheduleRefresh(80);
    };
    const onScroll = () => scheduleRefresh(80);
    document.addEventListener("mousemove", onMove, {
      passive: true
    });
    document.addEventListener("mouseleave", onLeave, {
      passive: true
    });
    document.addEventListener("pointerdown", onPointerDown, {
      passive: true
    });
    document.addEventListener("pointerup", onPointerUp, {
      passive: true
    });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("popstate", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    refreshRef.current?.();
  }, [enabled, pathname]);
  if (!enabled) return null;
  return <div ref={dotRef} className={`click-pulse-cursor${active ? " is-active" : ""}`} style={{
    width: `var(--click-pulse-size, ${size}px)`,
    height: `var(--click-pulse-size, ${size}px)`
  }} aria-hidden="true" />;
}
