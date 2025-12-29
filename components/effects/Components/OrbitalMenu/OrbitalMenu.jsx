"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import SmustCenterLogo from "@/public/logo/smust-center.svg";
import "./OrbitalMenu.css";

function useMatchMedia(query, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia(query);
    const onChange = () => setMatches(!!mq.matches);

    onChange();

    // Safari < 14 fallback
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [query]);

  return matches;
}

export default function OrbitalMenu({
  items = [],
  ariaLabel = "Actions",
  toggleLabelOpen = "Open menu",
  toggleLabelClose = "Close menu",
  className = "",
}) {
  const menuId = useId();
  const titleId = useId();

  const rootRef = useRef(null);
  const hubBtnRef = useRef(null);

  // Mobile overlay refs
  const overlayCloseBtnRef = useRef(null);
  const scrollRef = useRef(null);
  const rowRefs = useRef([]);
  const rafRef = useRef(0);
  const activeIndexRef = useRef(0);

  const isCoarsePointer = useMatchMedia("(hover: none) and (pointer: coarse)", false);
  const prefersReducedMotion = useMatchMedia("(prefers-reduced-motion: reduce)", false);

  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const isOpen = isPinnedOpen;

  // Desktop orbital layout only
  const [orbitRadius, setOrbitRadius] = useState(0);

  // Mobile overlay state
  const [activeIndex, setActiveIndex] = useState(0);
  const [visuals, setVisuals] = useState([]); // [{scale, opacity}]
  const [listPad, setListPad] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Keep visuals array in sync with items length
  useEffect(() => {
    setVisuals((prev) => {
      if (prev.length === items.length) return prev;
      return Array.from({ length: items.length }, (_, i) => prev[i] || { scale: 0.9, opacity: 0.7 });
    });
  }, [items.length]);

  // Close on outside click + ESC
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

  // html.profile-orbit-open hook for globals.css behavior
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    if (isOpen) html.classList.add("profile-orbit-open");
    else html.classList.remove("profile-orbit-open");

    return () => html.classList.remove("profile-orbit-open");
  }, [isOpen]);

  // Body scroll lock (mobile overlay)
  useEffect(() => {
    if (!isOpen || !isCoarsePointer) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const body = document.body;
    const scrollY = window.scrollY || 0;

    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, isCoarsePointer]);

  // Focus management for mobile overlay
useEffect(() => {
  if (!isOpen || !isCoarsePointer) return;

  const prevActive = typeof document !== "undefined" ? document.activeElement : null;

  // Capture current DOM nodes once for cleanup usage
  const hubEl = hubBtnRef.current;
  const closeEl = overlayCloseBtnRef.current;

  requestAnimationFrame(() => {
    closeEl?.focus?.();
  });

  return () => {
    if (hubEl?.focus) {
      hubEl.focus();
      return;
    }
    if (prevActive && prevActive instanceof HTMLElement) {
      prevActive.focus();
    }
  };
}, [isOpen, isCoarsePointer]);
  // Desktop: measure orbit radius (skip entirely on coarse pointer)
  useLayoutEffect(() => {
    if (isCoarsePointer) return;

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

    // Fonts can change the measured size
    if (document?.fonts?.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(schedule).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect?.();
      window.removeEventListener("resize", schedule);
    };
  }, [items.length, isCoarsePointer]);

  const handleToggle = () => setIsPinnedOpen((prev) => !prev);

  // ===== Mobile overlay: active + scaling + arrows =====
  const computeListPadding = () => {
    const listEl = scrollRef.current;
    const firstRow = rowRefs.current?.[0];
    if (!listEl || !firstRow) return;

    const listH = listEl.clientHeight || 0;
    const rowH = firstRow.offsetHeight || 0;
    if (!listH || !rowH) return;

    const pad = Math.max(0, Math.floor((listH - rowH) / 2));
    setListPad(pad);
  };

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  };

  const updateActiveAndVisuals = () => {
    const listEl = scrollRef.current;
    if (!listEl) return;

    const listRect = listEl.getBoundingClientRect();
    const centerY = listRect.top + listRect.height / 2;

    const rows = rowRefs.current || [];
    if (!rows.length) return;

    const minScale = 0.78;
    const maxScale = 1.08;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    const distances = new Array(rows.length).fill(Number.POSITIVE_INFINITY);
    const nextVisuals = new Array(rows.length);

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row) continue;
      const r = row.getBoundingClientRect();
      const rowCenter = r.top + r.height / 2;
      const dist = Math.abs(rowCenter - centerY);
      distances[i] = dist;

      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }

      // Normalize distance to [0..1] within half container height
      const t = Math.min(1, dist / Math.max(1, listRect.height * 0.5));
      const scale = maxScale - (maxScale - minScale) * t;
      const opacity = 1 - 0.55 * t;

      nextVisuals[i] = { scale, opacity };
    }

    // Hysteresis: avoid flicker while scrolling
    const prevIdx = activeIndexRef.current;
    const prevDist = distances[prevIdx] ?? Number.POSITIVE_INFINITY;
    const hysteresisPx = 8;

    if (bestIdx !== prevIdx) {
      if (bestDist + hysteresisPx < prevDist) {
        activeIndexRef.current = bestIdx;
        setActiveIndex(bestIdx);
      }
    } else {
      // Ensure state is aligned (rare edge cases)
      if (activeIndex !== prevIdx) setActiveIndex(prevIdx);
    }

    setVisuals(nextVisuals);
    updateArrows();
  };

  const scheduleUpdate = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      updateActiveAndVisuals();
    });
  };

  // Wire overlay layout + scroll listeners when opened on mobile
  useLayoutEffect(() => {
    if (!isOpen || !isCoarsePointer) return;

    computeListPadding();

    const listEl = scrollRef.current;
    if (!listEl) return;

    // Initial positioning: keep current active centered if possible
    const initialIdx = Math.min(Math.max(activeIndexRef.current || 0, 0), Math.max(0, items.length - 1));
    const initialRow = rowRefs.current?.[initialIdx];
    if (initialRow?.scrollIntoView) {
      initialRow.scrollIntoView({ block: "center", behavior: "auto" });
    }

    // Initial compute
    scheduleUpdate();

    const onScroll = () => scheduleUpdate();
    listEl.addEventListener("scroll", onScroll, { passive: true });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      computeListPadding();
      scheduleUpdate();
    }) : null;
    ro?.observe(listEl);

    const onResize = () => {
      computeListPadding();
      scheduleUpdate();
    };
    window.addEventListener("resize", onResize);

    return () => {
      listEl.removeEventListener("scroll", onScroll);
      ro?.disconnect?.();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isCoarsePointer, items.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  const scrollToIndex = (idx) => {
    const clamped = Math.min(Math.max(idx, 0), Math.max(0, items.length - 1));
    const row = rowRefs.current?.[clamped];
    if (!row) return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    row.scrollIntoView?.({ block: "center", behavior });

    // optimistic update (visuals will correct on next scroll event)
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
  };

  // ===== Render =====
  const angleStep = items.length ? 360 / items.length : 0;
  const startAngle = -90;

  return (
    <div
      ref={rootRef}
      className={`profile-orbit-menu ${isOpen ? "is-open" : ""} ${isCoarsePointer ? "is-mobile" : ""} ${className}`.trim()}
    >
      {/* Desktop orbital items */}
      {!isCoarsePointer && (
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
                    if (!item.keepOpen) setIsPinnedOpen(false);
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
      )}

      {/* Center hub (always) */}
      <button
        ref={hubBtnRef}
        type="button"
        className="profile-orbit-menu__center dock-item"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? toggleLabelClose : toggleLabelOpen}
      >
        <span className="profile-orbit-menu__hub-icon" aria-hidden="true">
          <SmustCenterLogo className="profile-orbit-menu__hub-svg" aria-hidden="true" focusable="false" />
        </span>
      </button>

      {/* Mobile full-screen overlay */}
      {isCoarsePointer && isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          // Minimal inline styling to make the overlay usable even before CSS refinements.
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            background: "rgba(10, 12, 18, 0.90)",
            display: "flex",
            flexDirection: "column",
          }}
          className="profile-orbit-mobile-overlay"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px 8px",
              gap: "12px",
            }}
            className="profile-orbit-mobile-topbar"
          >
            <div
              id={titleId}
              style={{ fontSize: 18, fontWeight: 600, color: "rgba(232, 236, 245, 0.92)" }}
              className="profile-orbit-mobile-title"
            >
              {ariaLabel}
            </div>

            <button
              ref={overlayCloseBtnRef}
              type="button"
              onClick={() => setIsPinnedOpen(false)}
              aria-label={toggleLabelClose}
              className="profile-orbit-mobile-close dock-item"
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                padding: 0,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>
                ✕
              </span>
            </button>
          </div>

          {/* Up arrow (scroll hint / step) */}
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndexRef.current - 1)}
            aria-label="Keri üles"
            className="profile-orbit-mobile-arrow profile-orbit-mobile-arrow--up"
            style={{
              alignSelf: "center",
              width: 44,
              height: 44,
              borderRadius: 999,
              margin: "4px 0",
              opacity: canScrollUp ? 1 : 0,
              pointerEvents: canScrollUp ? "auto" : "none",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>↑</span>
          </button>

          <div
            ref={scrollRef}
            className="profile-orbit-mobile-list"
            style={{
              flex: 1,
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              scrollSnapType: "y mandatory",
              paddingTop: listPad,
              paddingBottom: listPad,
              paddingLeft: 16,
              paddingRight: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {items.map((item, index) => {
              const v = visuals[index] || { scale: 0.9, opacity: 0.75 };
              const isActive = index === activeIndex;

              return (
                <div
                  key={item.key || index}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={`profile-orbit-mobile-row ${isActive ? "is-active" : ""}`}
                  style={{
                    scrollSnapAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    opacity: v.opacity,
                    transform: `scale(${v.scale})`,
                    transformOrigin: "center",
                    transition: prefersReducedMotion ? "none" : "transform 140ms linear, opacity 140ms linear",
                  }}
                >
                  <button
                    type="button"
                    className="profile-orbit-mobile-item dock-item"
                    onClick={() => {
                      item.onClick?.();
                      if (!item.keepOpen) setIsPinnedOpen(false);
                    }}
                    aria-label={item.label}
                    style={{
                      // Let global dock-item styles define the look; keep layout consistent here.
                      width: "4.25rem",
                      height: "4.25rem",
                      padding: 0,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <span className="dock-icon" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                      {item.icon}
                    </span>
                  </button>

                  <div
                    className="dock-label profile-orbit-mobile-label"
                    aria-hidden="true"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(-6px)",
                      transition: prefersReducedMotion ? "none" : "opacity 160ms ease, transform 160ms ease",
                      textAlign: "center",
                      // Ensure label doesn't cause layout shift while hidden
                      height: "1.4em",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Down arrow */}
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndexRef.current + 1)}
            aria-label="Keri alla"
            className="profile-orbit-mobile-arrow profile-orbit-mobile-arrow--down"
            style={{
              alignSelf: "center",
              width: 44,
              height: 44,
              borderRadius: 999,
              margin: "6px 0 10px",
              opacity: canScrollDown ? 1 : 0,
              pointerEvents: canScrollDown ? "auto" : "none",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
