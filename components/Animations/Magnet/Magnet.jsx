"use client";
import { useState, useEffect, useRef } from "react";

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 100,               // jääb API-sse tuleviku tarbeks
  activeTransition = "transform 1.1s ease-out",
  inactiveTransition = "transform 1.1s ease-in-out",
  wrapperClassName = "",
  innerClassName = "",
  zIndex = 22,
  ...props
}) {
  const wrapperRef = useRef(null);
  const innerRef   = useRef(null);
  const rafRef     = useRef(0);
  const activeRef  = useRef(false);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // kui keelatud, nulli transformid
    if (disabled) {
      activeRef.current = false;
      setIsActive(false);
      if (innerRef.current) {
        innerRef.current.style.transform  = "translate3d(0,0,0)";
        innerRef.current.style.transition = inactiveTransition;
        innerRef.current.style.willChange = "auto";
      }
      return;
    }

    const getElsOk = () => wrapperRef.current && innerRef.current;

    const maxMove = 160; // px – liikumise piir
    const clamp = (v) => Math.max(-maxMove, Math.min(maxMove, v));

    const update = (x, y) => {
      if (!getElsOk()) return;
      const box = wrapperRef.current.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top  + box.height / 2;

      // tõmme ka siis, kui kursor on wrapperist veidi väljas
      const inPad =
        Math.abs(x - cx) < box.width / 2 + padding &&
        Math.abs(y - cy) < box.height / 2 + padding;

      if (inPad) {
        if (!activeRef.current) {
          activeRef.current = true;
          setIsActive(true);
        }
        let ox = (x - cx) * 0.15;
        let oy = (y - cy) * 0.15;
        innerRef.current.style.transform  = `translate3d(${clamp(ox)}px, ${clamp(oy)}px, 0)`;
        innerRef.current.style.transition = activeTransition;
        innerRef.current.style.willChange = "transform";
      } else {
        if (activeRef.current) {
          activeRef.current = false;
          setIsActive(false);
        }
        innerRef.current.style.transform  = "translate3d(0,0,0)";
        innerRef.current.style.transition = inactiveTransition;
        innerRef.current.style.willChange = "auto";
      }
    };

    const onMove = (e) => {
      if (!getElsOk()) return;            // null-safe
      if (rafRef.current) return;         // RAF throttle
      const { clientX: x, clientY: y } = e;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        update(x, y);
      });
    };

    const onLeave = () => {
      if (!innerRef.current) return;
      activeRef.current = false;
      setIsActive(false);
      innerRef.current.style.transform  = "translate3d(0,0,0)";
      innerRef.current.style.transition = inactiveTransition;
      innerRef.current.style.willChange = "auto";
    };

    // kuulame globaalselt, et “tõmme” tekiks ka wrapperist väljas
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [disabled, padding, activeTransition, inactiveTransition]);

  const child = typeof children === "function" ? children({ isActive }) : children;

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // NB: wrapper peab saama pointer-sündmusi
        // ära pane siia pointerEvents: "none"
      }}
      {...props}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{
          width: "100%",
          height: "100%",
          transform: "translate3d(0,0,0)",
          transition: inactiveTransition,
          willChange: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none", // et sisemine sisu ei varjaks hoverit
        }}
      >
        {child}
      </div>
    </div>
  );
}
