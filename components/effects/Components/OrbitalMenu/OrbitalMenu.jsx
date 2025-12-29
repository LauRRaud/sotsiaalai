"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import SmustCenterLogo from "@/public/logo/smust-center.svg";
import "./OrbitalMenu.css";

function useMatchMedia(query, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia(query);
    const onChange = () => setMatches(!!mq.matches);

    onChange();

    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [query]);

  return matches;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

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
  const settleTimerRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const [listPad, setListPad] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // “3-step” visuals: active (100%), neighbors (partial), rest (0%)
  const [visuals, setVisuals] = useState(() =>
    Array.from({ length: items.length }, () => ({ scale: 0.62, opacity: 0, blur: 2, hide: true }))
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Keep refs and visuals length aligned
  useEffect(() => {
    slotRefs.current = new Array(items.length);
    setVisuals(
      Array.from({ length: items.length }, (_, i) => {
        // initialize: show first + neighbor if present, hide the rest
        const d = Math.abs(i - activeIndexRef.current);
        if (d === 0) return { scale: 1.0, opacity: 1, blur: 0, hide: false };
        if (d === 1) return { scale: 0.92, opacity: 0.32, blur: 0.8, hide: false };
        return { scale: 0.86, opacity: 0, blur: 1.4, hide: true };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

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

  // Focus management (mobile overlay) – capture refs for cleanup
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
      if (prevActive && prevActive instanceof HTMLElement) prevActive.focus();
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
  // Mobile picker: “very powerful” selection + smooth settle
  // -----------------------------
  const buildVisualsFromActive = (activeIdx) => {
    const next = new Array(items.length);

    for (let i = 0; i < items.length; i += 1) {
      const d = Math.abs(i - activeIdx);

      // Exactly what you asked:
      // active = 100% visible
      // neighbors = partially visible
      // third+ = 0% visible (so edges never "cut" items)
      if (d === 0) next[i] = { scale: 1.0, opacity: 1, blur: 0, hide: false };
      else if (d === 1) next[i] = { scale: 0.92, opacity: 0.32, blur: 0.8, hide: false };
      else next[i] = { scale: 0.86, opacity: 0, blur: 1.4, hide: true };
    }

    return next;
  };

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

  const computeActiveIndexFromScroll = () => {
    const listEl = scrollRef.current;
    if (!listEl) return 0;

    const listRect = listEl.getBoundingClientRect();
    const centerY = listRect.top + listRect.height / 2;

    const slots = slotRefs.current || [];
    if (!slots.length) return 0;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      if (!slot) continue;
      const r = slot.getBoundingClientRect();
      const slotCenter = r.top + r.height / 2;
      const dist = Math.abs(slotCenter - centerY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    return bestIdx;
  };

  const snapToIndex = (idx) => {
    const clampedIdx = clamp(idx, 0, Math.max(0, items.length - 1));
    const slot = slotRefs.current?.[clampedIdx];
    if (!slot) return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    slot.scrollIntoView?.({ block: "center", behavior });
  };

  const applyActive = (idx) => {
    const clampedIdx = clamp(idx, 0, Math.max(0, items.length - 1));

    if (activeIndexRef.current !== clampedIdx) {
      activeIndexRef.current = clampedIdx;
      setActiveIndex(clampedIdx);
    }

    setVisuals(buildVisualsFromActive(clampedIdx));
    updateScrollHints();
  };

  const scheduleMobileUpdate = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const idx = computeActiveIndexFromScroll();
      applyActive(idx);
    });
  };

  const scheduleSettleSnap = () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    // “scroll-end” feel without relying on browser support
    settleTimerRef.current = window.setTimeout(() => {
      snapToIndex(activeIndexRef.current);
    }, prefersReducedMotion ? 0 : 320);
  };

  useLayoutEffect(() => {
    if (!isOpen || !isCoarsePointer) return;

    computeListPadding();

    // On open: ensure we have a sensible active index and visuals
    const initialIdx = clamp(activeIndexRef.current || 0, 0, Math.max(0, items.length - 1));
    applyActive(initialIdx);

    // Snap to active (no animation on open)
    const slot = slotRefs.current?.[initialIdx];
    slot?.scrollIntoView?.({ block: "center", behavior: "auto" });

    const listEl = scrollRef.current;
    if (!listEl) return;

    const onScroll = () => {
      scheduleMobileUpdate();
      scheduleSettleSnap();
    };

    listEl.addEventListener("scroll", onScroll, { passive: true });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      computeListPadding();
      scheduleMobileUpdate();
      scheduleSettleSnap();
    }) : null;

    ro?.observe(listEl);

    const onResize = () => {
      computeListPadding();
      scheduleMobileUpdate();
      scheduleSettleSnap();
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
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = 0;
    };
  }, []);

  const onMobileAction = (item) => {
    item?.onClick?.();
    if (!item?.keepOpen) setIsPinnedOpen(false);
  };

  const desktopAngleStep = useMemo(() => (items.length ? 360 / items.length : 0), [items.length]);
  const desktopStartAngle = -90;

  return (
    <div
      ref={rootRef}
      className={`profile-orbit-menu ${isOpen ? "is-open" : ""} ${isCoarsePointer ? "is-mobile" : ""} ${className}`.trim()}
    >
      {/* Desktop orbital items (unchanged) */}
      {!isCoarsePointer && (
        <div
          className="profile-orbit-menu__items"
          role="group"
          aria-label={ariaLabel}
          id={menuId}
          aria-hidden={!isOpen}
        >
          {items.map((item, index) => {
            const angle = desktopStartAngle + index * desktopAngleStep;
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

      {/* Mobile full-screen overlay: no “old arrows”; modern scroll affordance via scrims + chevrons */}
      {isCoarsePointer && isOpen && (
        <div
          className="invite-modal-backdrop profile-orbit-mobile-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          onPointerDown={(e) => {
            // Tap outside panel closes
            if (e.target === e.currentTarget) setIsPinnedOpen(false);
          }}
        >
          <div
            className="invite-modal profile-orbit-mobile-panel"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              ref={overlayCloseBtnRef}
              type="button"
              onClick={() => setIsPinnedOpen(false)}
              aria-label={toggleLabelClose}
              className="invite-modal__close modal-close-btn profile-orbit-mobile-close"
            >
              &times;
            </button>

            {/* Modern scroll hints: gradient scrims that reveal subtle chevrons */}
            <div
              className={`profile-orbit-mobile-scrim profile-orbit-mobile-scrim--top ${
                canScrollUp ? "is-visible" : ""
              }`}
              aria-hidden="true"
            >
              <div className="profile-orbit-mobile-chevron" />
            </div>

            <div
              ref={scrollRef}
              className="profile-orbit-mobile-list"
              style={{
                paddingTop: listPad,
                paddingBottom: listPad,
                scrollSnapType: "y proximity",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {items.map((item, index) => {
                const v = visuals[index] || { scale: 0.62, opacity: 0, blur: 2, hide: true };
                const isActive = index === activeIndex;

                return (
                  <div
                    key={item.key || index}
                    ref={(el) => {
                      slotRefs.current[index] = el;
                    }}
                    className={`profile-orbit-mobile-row ${isActive ? "is-active" : ""} ${
                      v.hide ? "is-hidden" : ""
                    }`}
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <div
                      className="profile-orbit-mobile-visual"
                      style={{
                        transform: `scale(${v.scale})`,
                        opacity: v.opacity,
                        filter: v.blur ? `blur(${v.blur}px)` : "none",
                      }}
                    >
                      <button
                        type="button"
                        className="profile-orbit-mobile-action dock-item"
                        onClick={() => onMobileAction(item)}
                        aria-label={item.label}
                        tabIndex={v.hide ? -1 : 0}
                      >
                        <span className="dock-icon" aria-hidden="true">
                          {item.icon}
                        </span>

                        {/* label exists, but only becomes visible for the active row via CSS */}
                        <span
                          className="profile-orbit-mobile-action__label"
                          aria-hidden={!isActive}
                        >
                          {item.label}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`profile-orbit-mobile-scrim profile-orbit-mobile-scrim--bottom ${
                canScrollDown ? "is-visible" : ""
              }`}
              aria-hidden="true"
            >
              <div className="profile-orbit-mobile-chevron profile-orbit-mobile-chevron--down" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
