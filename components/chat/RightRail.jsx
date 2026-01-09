"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./RightRail.module.css";
import { usePathname, useRouter } from "next/navigation";
import AllikadLight from "@/public/logo/heleallikad.svg";
import AllikadDark from "@/public/logo/tumeallikad.svg";
import { pushWithTransition } from "@/lib/routeTransition";
import { createPortal } from "react-dom";

export default function RightRail({
  t,
  roomId,
  isLightTheme,
  inputFocused,
  sourcesButtonRef,
  toggleSourcesPanel,
  showSourcesPanel,
  sourcesPulse,
  conversationSources,
  hasConversationSources,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const railRef = useRef(null);
  const itemRefs = useRef([]);
  const wheelAccumRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipRect, setTooltipRect] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [stepPx, setStepPx] = useState(56);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      const style = window.getComputedStyle(rail);
      const raw = style.getPropertyValue("--rail-step").trim();
      const parsed = Number.parseFloat(raw);
      if (!Number.isFinite(parsed)) return;
      setStepPx((prev) => {
        const next = Math.round(parsed);
        return prev === next ? prev : next;
      });
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(rail);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  const icons = useMemo(() => {
    return {
      chats: isLightTheme ? "/logo/vestlusedhele.svg" : "/logo/vestlusedtume.svg",
      rooms: isLightTheme ? "/logo/ruumidhele.svg" : "/logo/ruumidtume.svg",
      addPerson: isLightTheme ? "/logo/lisainimenehele.svg" : "/logo/lisainimenetume.svg",
    };
  }, [isLightTheme]);

  const openChatsDrawer = (e) => {
    if (pathname && pathname.startsWith("/vestlus")) {
      e?.preventDefault?.();
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: true } }));
      } catch {}
      return;
    }
    pushWithTransition(router, "/vestlus");
  };

  const openRooms = () => {
    pushWithTransition(router, "/ruum");
  };

  const openInvite = () => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite", { detail: { roomId } }));
    } catch {}
  };

  const sourcesLabel = t("chat.sources.button", "Allikad ({count})").replace(
    "{count}",
    String(conversationSources.length)
  );

  const items = useMemo(() => {
    return [
      {
        key: "profile",
        label: "Profiil",
      },
      {
        key: "chats",
        label: t("nav.chats", "Vestlused"),
      },
      {
        key: "rooms",
        label: t("nav.rooms", "Ruumid"),
      },
      {
        key: "invite",
        label: t("nav.add_person", "Lisa inimene"),
      },
      {
        key: "sources",
        label: "Allikad",
      },
    ];
  }, [t]);

  useEffect(() => {
    const idx = (() => {
      if (!pathname) return 1;
      if (pathname.startsWith("/profiil")) return 0;
      if (pathname.startsWith("/ruum")) return 2;
      if (pathname.startsWith("/vestlus")) return 1;
      return 1;
    })();
    setActiveIndex(idx);
  }, [pathname]);

  useEffect(() => {
    if (hoveredIndex == null) {
      setTooltipRect(null);
      return;
    }
    const el = itemRefs.current[hoveredIndex];
    if (!el) {
      setTooltipRect(null);
      return;
    }
    const update = () => {
      const rect = el.getBoundingClientRect();
      setTooltipRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [hoveredIndex, activeIndex]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY;
      if (!Number.isFinite(delta) || delta === 0) return;
      wheelAccumRef.current += delta;
      const threshold = 60;
      if (Math.abs(wheelAccumRef.current) < threshold) return;
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current -= direction * threshold;
      setActiveIndex((prev) => {
        const next = (prev + direction + items.length) % items.length;
        return Number.isFinite(next) ? next : 0;
      });
    };
    rail.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [items.length]);

  const onKeyDown = (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((prev) => (prev + direction + items.length) % items.length);
  };

  return (
    <div className={`${styles.slot} chat-right-actions`}>
      <nav
        className={styles.rightRail}
        ref={railRef}
        tabIndex={0}
        aria-label={t("chat.right_rail", "Vestluse otseteed")}
        onKeyDown={onKeyDown}
      >
        {[-2, -1, 0, 1, 2].map((slotOffset, slotIdx) => {
          const n = items.length || 1;
          const itemIndex = ((activeIndex + slotOffset) % n + n) % n;
          const it = items[itemIndex];
          const outerFactor = 1.78;
          const offsetY =
            slotOffset === 0
              ? 0
              : Math.sign(slotOffset) * (Math.abs(slotOffset) === 2 ? Math.round(stepPx * outerFactor) : stepPx);
          const curveNorm = Math.min(Math.abs(slotOffset) / 2, 1);
          const baseCurvePx = inputFocused ? 0 : 4;
          const edgeSafetyPx = inputFocused ? 0 : 12;
          const curveSkewPx = inputFocused ? 0 : 1.5;
          const offsetX =
            -baseCurvePx * curveNorm * curveNorm -
            edgeSafetyPx * curveNorm * curveNorm * curveNorm * curveNorm -
            slotOffset * curveSkewPx;
          const norm = Math.min(Math.abs(slotOffset) / 2, 1);
          const scale = 0.78 + (1 - norm) * 0.46;
          const opacity = 0.12 + (1 - norm) * 0.88;
          const zIndex = 10 - Math.abs(slotOffset);

          const setRailRef = (el) => {
            itemRefs.current[slotIdx] = el;
            if (it?.key !== "sources") return;
            if (!sourcesButtonRef) return;
            if (typeof sourcesButtonRef === "function") {
              sourcesButtonRef(el);
            } else {
              sourcesButtonRef.current = el;
            }
          };

          const commonProps = {
            ref: setRailRef,
            className: `${styles.item}${slotOffset === 0 ? ` ${styles.isActive}` : ""}${
              it?.key === "sources" && showSourcesPanel ? ` ${styles.iconBtnActive}` : ""
            }${it?.key === "sources" && sourcesPulse ? ` ${styles.isPulse}` : ""}`,
            style: {
              transform: `translate(-50%, -50%) translateX(${offsetX.toFixed(2)}px) translateY(${offsetY}px) scale(${scale.toFixed(3)})`,
              opacity: opacity.toFixed(3),
              zIndex,
            },
            onMouseEnter: () => setHoveredIndex(slotIdx),
            onMouseLeave: () => setHoveredIndex((prev) => (prev === slotIdx ? null : prev)),
            onFocus: () => setHoveredIndex(slotIdx),
            onBlur: () => setHoveredIndex((prev) => (prev === slotIdx ? null : prev)),
          };

          const onActivate = (event) => {
            if (!it) return;
            setActiveIndex(itemIndex);
            if (it.key === "profile") {
              pushWithTransition(router, "/profiil");
              return;
            }
            if (it.key === "chats") {
              openChatsDrawer(event);
              return;
            }
            if (it.key === "rooms") {
              openRooms();
              return;
            }
            if (it.key === "invite") {
              openInvite();
              return;
            }
            if (it.key === "sources") {
              toggleSourcesPanel();
            }
          };

          const ariaLabel = it?.key === "sources" ? sourcesLabel : it?.label || "";
          const isDisabled = it?.key === "sources" ? !hasConversationSources : false;

          return (
            <button
              key={`slot-${slotOffset}`}
              type="button"
              {...commonProps}
              className={`${commonProps.className} ${styles.iconBtn}`}
              onClick={onActivate}
              aria-label={ariaLabel}
              aria-haspopup={it?.key === "sources" ? "dialog" : undefined}
              aria-expanded={it?.key === "sources" ? (showSourcesPanel ? "true" : "false") : undefined}
              aria-controls={it?.key === "sources" ? "chat-sources-panel" : undefined}
              disabled={isDisabled}
            >
              {it?.key === "profile" ? (
                <span className={`chat-avatar-abs ${styles.avatar}`} aria-hidden="true" />
              ) : it?.key === "sources" ? (
                isLightTheme ? (
                  <AllikadLight className={styles.iconSvg} aria-hidden="true" role="img" />
                ) : (
                  <AllikadDark className={styles.iconSvg} aria-hidden="true" role="img" />
                )
              ) : it?.key === "chats" ? (
                <img className={styles.iconImg} src={icons.chats} alt="" aria-hidden="true" />
              ) : it?.key === "rooms" ? (
                <img className={styles.iconImg} src={icons.rooms} alt="" aria-hidden="true" />
              ) : it?.key === "invite" ? (
                <img className={styles.iconImg} src={icons.addPerson} alt="" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}

        {isMounted && hoveredIndex != null && tooltipRect
          ? createPortal(
              <div
                className={styles.tooltip}
                style={{
                  top: tooltipRect.top + tooltipRect.height / 2,
                  left: tooltipRect.left - 2,
                }}
                role="tooltip"
              >
                {(() => {
                  const slotOffsets = [-2, -1, 0, 1, 2];
                  const slotOffset = slotOffsets[hoveredIndex] ?? 0;
                  const n = items.length || 1;
                  const idx = ((activeIndex + slotOffset) % n + n) % n;
                  return items[idx]?.label || "";
                })()}
              </div>,
              document.body
            )
          : null}
      </nav>
    </div>
  );
}
