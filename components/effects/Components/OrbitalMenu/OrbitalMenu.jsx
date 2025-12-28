"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import SmustCenterLogo from "@/public/logo/smust-center.svg";
import "./OrbitalMenu.css";

export default function OrbitalMenu({
  items = [],
  ariaLabel = "Actions",
  toggleLabelOpen = "Open menu",
  toggleLabelClose = "Close menu",
  className = "",
}) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [orbitRadius, setOrbitRadius] = useState(0);
  const rootRef = useRef(null);
  const menuId = useId();
  const isOpen = isPinnedOpen;

  // Close on outside click + ESC (useful for touch/click usage)
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) {
        setIsPinnedOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPinnedOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (isOpen) {
      root.classList.add("profile-orbit-open");
    } else {
      root.classList.remove("profile-orbit-open");
    }
    return () => root.classList.remove("profile-orbit-open");
  }, [isOpen]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const itemEl = root.querySelector(".profile-orbit-menu__item");
      if (!rect.width || !itemEl) return;

      const itemSize = itemEl.offsetWidth || 0;
      if (!itemSize) return;

      const nextRadius = Math.max(0, (rect.width - itemSize) / 2);
      setOrbitRadius((prev) => (Math.abs(prev - nextRadius) > 0.25 ? nextRadius : prev));
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(root);
    window.addEventListener("resize", schedule);
    document.fonts?.ready?.then?.(schedule).catch?.(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect?.();
      window.removeEventListener("resize", schedule);
    };
  }, [items.length]);

  const handleToggle = () => {
    setIsPinnedOpen((prev) => !prev);
  };

  const angleStep = items.length ? 360 / items.length : 0;
  const startAngle = -90; // first item at top

  return (
    <div
      ref={rootRef}
      className={`profile-orbit-menu ${isOpen ? "is-open" : ""} ${className}`.trim()}
    >
      <div
        className="profile-orbit-menu__items"
        role="group"
        aria-label={ariaLabel}
        id={menuId}
        aria-hidden={!isOpen}
      >
        {items.map((item, index) => {
          const angle = startAngle + index * angleStep;
          const angleRad = (angle * Math.PI) / 180;
          const orbitX = Math.round(Math.sin(angleRad) * orbitRadius);
          const orbitY = Math.round(-Math.cos(angleRad) * orbitRadius);
          const delay = `${index * 0.05}s`;

          return (
            <div
              key={item.key || index}
              className="profile-orbit-menu__slot"
              data-key={item.key || index}
              data-label-pos={item.labelPos || "up"}
              style={{
                "--orbit-x": `${orbitX}px`,
                "--orbit-y": `${orbitY}px`,
                "--delay": delay,
              }}
              aria-hidden={!isOpen}
            >
              <button
                type="button"
                className="profile-orbit-menu__item dock-item"
                onClick={() => {
                  item.onClick?.();
                  if (!item.keepOpen) {
                    setIsPinnedOpen(false);
                  }
                }}
                aria-label={item.label}
                tabIndex={isOpen ? 0 : -1}
              >
                <span className="dock-icon" aria-hidden="true">
                  {item.icon}
                </span>
              </button>
              <span className="dock-label">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Center hub: uses your orbital/orbitaltume SVG as background image.
          IMPORTANT: we keep it as dock-item so it matches platform look,
          but we remove ALL transforms in CSS so it never scales/moves on hover/open. */}
      <button
        type="button"
        className="profile-orbit-menu__center dock-item"
        onClick={handleToggle} // click works for touch too
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? toggleLabelClose : toggleLabelOpen}
      >
        <span className="profile-orbit-menu__hub-icon" aria-hidden="true">
          <SmustCenterLogo
            className="profile-orbit-menu__hub-svg"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      </button>
    </div>
  );
}
