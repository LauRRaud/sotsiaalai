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

    // Safari fallback
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

  const rootRef = useRef(null);
  const hubBtnRef = useRef(null);

  const isCoarsePointer = useMatchMedia("(hover: none) and (pointer: coarse)", false);
  const prefersReducedMotion = useMatchMedia("(prefers-reduced-motion: reduce)", false);

  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const isOpen = isPinnedOpen;

  // Desktop orbital layout only
  const [orbitRadius, setOrbitRadius] = useState(0);

  // Mobile overlay refs/state
  const overlayCloseBtnRef = useRef(null);
  const scrollRef = useRef(null);
  const slotRefs = useRef([]);
  const rafRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [listPad, setListPad] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const activeIndexRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Close on outside click + ESC
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) setIsPinnedOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsPinnedOpen(false);
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

  // Body scroll lock (mobile overlay only)
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

  // Focus management (mobile overlay)
  useEffect(() => {
    if (!isOpen || !isCoarsePointer) return;

    const prevActive = typeof document !== "undefined" ? document.activeElement : null;

    const hubEl = hubBtnRef.current;
    const closeEl = overlayCloseBtnRef.current;

    const raf = requestAnimationFrame(() => {
      closeEl?.focus?.();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (hubEl?.focus) {
        hubEl.focus();
        return;
      }
      if (prevActive && prevActive instanceof HTMLElement) {
        prevActive.focus();
      }
    };
  }, [isOpen, isCoarsePointer]);

  // Desktop: measure orbit radius (skip on coarse pointer)
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

  // -----------------------------
  // Mobile picker computations
  // -----------------------------
  const computeListPadding = () => {
    const listEl = scrollRef.current;
    const firstSlot = slotRefs.current?.[0];
    if (!listEl || !firstSlot) return;

    const listH = listEl.clientHeight || 0;
    const slotH = firstSlot.offsetHeight || 0;
    if (!listH || !slotH) return;

    const pad = Math.max(0, Math.floor((listH - slotH) / 2));
    setListPad(pad);
  };

  const updateScrollHints = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  };

  const updateActiveFromScroll = () => {
    const listEl = scrollRef.current;
    if (!listEl) return;

    const listRect = listEl.getBoundingClientRect();
    const centerY = listRect.top + listRect.height / 2;

    const slots = slotRefs.current || [];
    if (!slots.length) return;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    const dists = new Array(slots.length).fill(Number.POSITIVE_INFINITY);

    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      if (!slot) continue;
      const r = slot.getBoundingClientRect();
      const slotCenter = r.top + r.height / 2;
      const dist = Math.abs(slotCenter - centerY);
      dists[i] = dist;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    const prevIdx = activeIndexRef.current;
    const prevDist = dists[prevIdx] ?? Number.POSITIVE_INFINITY;

    // Hysteresis so it doesn't flicker
    const hysteresisPx = 10;
    if (bestIdx !== prevIdx && bestDist + hysteresisPx < prevDist) {
      activeIndexRef.current = bestIdx;
      setActiveIndex(bestIdx);
    }

    updateScrollHints();
  };

  const scheduleMobileUpdate = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      updateActiveFromScroll();
    });
  };

  useLayoutEffect(() => {
    if (!isOpen || !isCoarsePointer) return;

    computeListPadding();

    const listEl = scrollRef.current;
    if (!listEl) return;

    // Snap to current active on open
    const idx = Math.min(Math.max(activeIndexRef.current || 0, 0), Math.max(0, items.length - 1));
    const slot = slotRefs.current?.[idx];
    slot?.scrollIntoView?.({ block: "center", behavior: "auto" });

    scheduleMobileUpdate();

    const onScroll = () => scheduleMobileUpdate();
    listEl.addEventListener("scroll", onScroll, { passive: true });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      computeListPadding();
      scheduleMobileUpdate();
    }) : null;
    ro?.observe(listEl);

    const onResize = () => {
      computeListPadding();
      scheduleMobileUpdate();
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

  // Per-slot visual scale/opacity based on distance to center
  const getSlotVisualStyle = (index) => {
    const listEl = scrollRef.current;
    const slotEl = slotRefs.current?.[index];
    if (!listEl || !slotEl) {
      // reasonable defaults before first measurement
      return {
        "--orbitSlotScale": 0.82,
        "--orbitSlotOpacity": 0.6,
      };
    }

    const listRect = listEl.getBoundingClientRect();
    const centerY = listRect.top + listRect.height / 2;
    const r = slotEl.getBoundingClientRect();
    const slotCenter = r.top + r.height / 2;

    const dist = Math.abs(slotCenter - centerY);

    // Normalize within half container height
    const t0 = Math.min(1, dist / Math.max(1, listRect.height * 0.5));

    // Ease-out curve (more dramatic near center)
    const e = 1 - Math.pow(1 - t0, 3);

    // Dramatic scaling: center dominates, edges shrink
    const minScale = 0.56;
    const maxScale = 1.02;

    const scale = maxScale - (maxScale - minScale) * e;

    // Fade edges substantially
    const minOpacity = 0.22;
    const opacity = 1 - (1 - minOpacity) * e;

    return {
      "--orbitSlotScale": scale,
      "--orbitSlotOpacity": opacity,
    };
  };

  const onMobileAction = (item) => {
    item?.onClick?.();
    if (!item?.keepOpen) setIsPinnedOpen(false);
  };

  // -----------------------------
  // Render
  // -----------------------------
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

            return (
              <div
                key={item.key || index}
                className="profile-orbit-menu__slot"
                data-key={item.key || index}
                data-label-pos={item.labelPos || "up"}
                style={{
                  "--orbit-x": `${orbitX}px`,
                  "--orbit-y": `${orbitY}px`,
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

      {/* Center hub (always visible on the profile screen) */}
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

      {/* Mobile full-screen overlay (uses your global modal design language via classnames) */}
      {isCoarsePointer && isOpen && (
        <div
          className="invite-modal-backdrop profile-orbit-mobile-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <div className="invite-modal profile-orbit-mobile-panel">
            <button
              ref={overlayCloseBtnRef}
              type="button"
              onClick={() => setIsPinnedOpen(false)}
              aria-label={toggleLabelClose}
              className="invite-modal__close modal-close-btn profile-orbit-mobile-close"
            >
              &times;
            </button>

            {/* Optional empty header block to reserve space for close icon */}
            <div className="profile-orbit-mobile-header" />

            {/* Scroll hint (visual affordance only; CSS decides theme colors/opacity) */}
            <div className={`profile-orbit-mobile-hint profile-orbit-mobile-hint--up ${canScrollUp ? "is-visible" : ""}`}>
              <span aria-hidden="true">⌃</span>
            </div>

            <div
              ref={scrollRef}
              className="profile-orbit-mobile-list"
              style={{
                paddingTop: listPad,
                paddingBottom: listPad,
                scrollBehavior: prefersReducedMotion ? "auto" : "smooth",
              }}
              onScroll={scheduleMobileUpdate}
            >
              {items.map((item, index) => {
                const isActive = index === activeIndex;

                // Slot has fixed height (hit area). Visual inside scales.
                return (
                  <div
                    key={item.key || index}
                    ref={(el) => {
                      slotRefs.current[index] = el;
                    }}
                    className={`profile-orbit-mobile-row ${isActive ? "is-active" : ""}`}
                  >
                    <div
                      className="profile-orbit-mobile-visual"
                      style={getSlotVisualStyle(index)}
                    >
                      <button
                        type="button"
                        className="profile-orbit-mobile-action"
                        onClick={() => onMobileAction(item)}
                        aria-label={item.label}
                      >
                        <span className="profile-orbit-mobile-action__icon" aria-hidden="true">
                          {item.icon}
                        </span>

                        <span className="profile-orbit-mobile-action__label">
                          {item.label}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`profile-orbit-mobile-hint profile-orbit-mobile-hint--down ${canScrollDown ? "is-visible" : ""}`}>
              <span aria-hidden="true">⌄</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
