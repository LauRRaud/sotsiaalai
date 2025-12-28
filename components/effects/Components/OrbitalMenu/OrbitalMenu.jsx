"use client";

import { useEffect, useId, useRef, useState } from "react";
import "./OrbitalMenu.css";

export default function OrbitalMenu({
  items = [],
  ariaLabel = "Actions",
  toggleLabelOpen = "Open menu",
  toggleLabelClose = "Close menu",
  className = "",
}) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const isOpen = isPinnedOpen || isHovering;

  // Close on outside click + ESC (useful for touch/click usage)
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) {
        setIsPinnedOpen(false);
        setIsHovering(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPinnedOpen(false);
        setIsHovering(false);
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

  // Desktop: open only when the center hub is hovered.
  const handleCenterPointerEnter = (event) => {
    if (event?.pointerType === "touch") return;
    setIsHovering(true);
  };

  const handleRootPointerLeave = (event) => {
    if (event?.pointerType === "touch") return;
    if (!isPinnedOpen) setIsHovering(false);
  };

  const handleToggle = () => {
    if (isPinnedOpen) {
      setIsPinnedOpen(false);
      setIsHovering(false);
      return;
    }
    setIsPinnedOpen(true);
  };

  const angleStep = items.length ? 360 / items.length : 0;
  const startAngle = -90; // first item at top

  return (
    <div
      ref={rootRef}
      className={`profile-orbit-menu ${isOpen ? "is-open" : ""} ${className}`.trim()}
      onPointerLeave={handleRootPointerLeave}
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
          const delay = `${index * 0.05}s`;

          return (
            <div
              key={item.key || index}
              className="profile-orbit-menu__slot"
              style={{ "--angle": `${angle}deg`, "--delay": delay }}
              aria-hidden={!isOpen}
            >
              <button
                type="button"
                className="profile-orbit-menu__item dock-item"
                data-key={item.key || index}
                data-label-pos={item.labelPos || "up"}
                onClick={() => {
                  item.onClick?.();
                  if (!item.keepOpen) {
                    setIsPinnedOpen(false);
                    setIsHovering(false);
                  }
                }}
                aria-label={item.label}
                tabIndex={isOpen ? 0 : -1}
              >
                <span className="dock-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="dock-label">{item.label}</span>
              </button>
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
        onPointerEnter={handleCenterPointerEnter}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? toggleLabelClose : toggleLabelOpen}
      >
        <span className="profile-orbit-menu__hub-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
