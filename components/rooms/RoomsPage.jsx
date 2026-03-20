"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import InviteModal from "@/components/invite/InviteModal";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import "@/components/CenteredScrollPicker.css";
import {
  glassPageBackMobileBottomCenterClassName,
  glassSubpageCardClassName,
  glassSubpageCardInteractiveClassName,
  glassPageRingCenteredClassName,
  glassPageShellCenteredClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";

const pageShellClassName = `${glassPageShellCenteredClassName} max-md:py-0`;
const ringClassName =
  `${glassPageRingCenteredClassName} glass-ring--desktop-stable scroll-reactive-shell flex-col gap-0 overflow-hidden md:mt-0 md:mb-0 ` +
  `[--csp-chevron-top:clamp(0.12rem,0.55vh,0.45rem)] [--csp-chevron-bottom:clamp(0.12rem,0.55vh,0.45rem)] [--csp-arrow-size:clamp(2.55rem,4.2vw,3.25rem)] ` +
  `max-[768px]:[--csp-arrow-size:clamp(2.25rem,9.8vw,2.95rem)] max-[768px]:[--csp-chevron-top:clamp(0.24rem,1.2vw,0.54rem)] max-[768px]:[--csp-chevron-bottom:clamp(0.24rem,1.15vw,0.52rem)] ` +
  `max-[768px]:[--mobile-glass-card-gap:clamp(calc(0.26*var(--base-rem)),1.2vw,calc(0.4*var(--base-rem)))] max-[768px]:[--ring-pad-x:clamp(calc(0.44*var(--base-rem)),2vw,calc(0.78*var(--base-rem)))]`;
const titleClassName =
  `rooms-page-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} w-full max-w-full max-[768px]:!mt-0 max-[768px]:!mb-0`;
const mobileTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const contentClassName = "mt-0 flex w-full flex-1 min-h-0 flex-col items-center pb-[clamp(0.95rem,2.8vh,1.55rem)]";
const scrollAreaClassName =
  "rooms-scroll relative flex-1 w-full max-w-[clamp(18.2rem,37vw,23.2rem)] min-[769px]:max-w-[clamp(18rem,35vw,22.8rem)] min-h-0 overflow-y-auto overflow-x-hidden min-[769px]:overflow-x-visible px-[0.62rem] min-[769px]:px-[0.95rem] text-left csp-container mx-auto";
const roomStepClassName = "rooms-step csp-step !min-h-0 !py-[0.48rem]";
const roomCardClassName =
  `w-full rounded-[1rem] px-[1.14rem] py-[1.02rem] ${glassSubpageCardInteractiveClassName}`;
const roomEmptyCardClassName =
  `mx-auto w-full rounded-[1rem] px-[1.14rem] py-[1.12rem] text-center ${glassSubpageCardClassName}`;
const roomMetaRowClassName =
  "mt-[0.24rem] flex flex-wrap items-center gap-x-[0.22rem] gap-y-[0.2rem] text-[0.98rem] text-[color:var(--pt-200)] [.theme-light_&]:text-[#334155]";
const roomMetaItemClassName =
  "before:content-['|'] before:mx-[0.42rem] first:before:content-none";
const roomActionButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(26,28,34,0.38)] [.theme-night_&]:bg-[rgba(10,14,24,0.32)] px-[0.88rem] py-[0.38rem] text-[0.92rem] font-medium tracking-[0.01em] text-[color:var(--pt-120)] " +
  "transition-[transform,border-color,background,color] duration-150 hover:-translate-y-[1px] hover:border-[rgba(148,163,184,0.55)] hover:bg-[rgba(34,36,42,0.52)] [.theme-night_&:hover]:bg-[rgba(16,22,34,0.5)] " +
  "focus-visible:outline-none focus-visible:border-[rgba(148,163,184,0.55)] focus-visible:bg-[rgba(34,36,42,0.52)] [.theme-night_&:focus-visible]:bg-[rgba(16,22,34,0.5)] active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed " +
  "[.theme-light_&]:border-[rgba(148,163,184,0.5)] [.theme-light_&]:bg-[rgba(255,255,255,0.9)] [.theme-light_&]:text-[#1f2937] [.theme-light_&:hover]:border-[rgba(148,163,184,0.72)] [.theme-light_&:hover]:bg-[rgba(255,255,255,1)]";
const roomDeleteButtonClassName =
  "inline-flex h-[2rem] w-[2rem] items-center justify-center rounded-full border border-[rgba(192,72,72,0.48)] bg-[rgba(72,24,32,0.34)] text-[#ffd6d6] " +
  "transition-[transform,border-color,background,color] duration-150 hover:-translate-y-[1px] hover:border-[rgba(255,120,120,0.72)] hover:bg-[rgba(96,28,40,0.52)] hover:text-[#ffe6e6] " +
  "focus-visible:outline-none focus-visible:border-[rgba(255,120,120,0.72)] focus-visible:bg-[rgba(96,28,40,0.52)] focus-visible:text-[#ffe6e6] disabled:opacity-55 disabled:cursor-not-allowed " +
  "[.theme-light_&]:border-[rgba(192,72,72,0.52)] [.theme-light_&]:bg-[rgba(255,235,235,0.92)] [.theme-light_&]:text-[#7a2323]";
const roomUnreadBadgeClassName =
  "mt-[0.08rem] inline-flex items-center rounded-full border border-[rgba(212,94,94,0.58)] bg-[rgba(126,36,48,0.44)] px-[0.56rem] py-[0.14rem] text-[0.8rem] font-semibold tracking-[0.01em] text-[#ffe8e8] " +
  "[.theme-light_&]:border-[rgba(198,74,90,0.62)] [.theme-light_&]:bg-[rgba(255,223,230,0.98)] [.theme-light_&]:text-[#7f1d2d]";
const modalTitleClassName =
  "text-center text-[1.45rem] leading-[1.2] tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const roomChevronStrokeWidthDesktop = 0.72;
const roomChevronStrokeWidthMobile = 1.04;

export default function RoomsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const resolveErrorMessage = useCallback(
    (payload, fallbackKey) =>
      resolveApiMessage({
        payload,
        t,
        fallbackKey,
        fallbackText: typeof t === "function" ? t(fallbackKey) : fallbackKey
      }),
    [t]
  );

  const scrollRef = useRef(null);
  const initViewportModeRef = useRef(null);
  const initialScrollTopRef = useRef(0);
  const hasInitialScrollTopRef = useRef(false);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);
  const [confirmRoom, setConfirmRoom] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUserStartedScroll, setHasUserStartedScroll] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "et", {
        dateStyle: "medium",
        timeStyle: "short"
      }),
    [locale]
  );

  const roleLabel = useCallback(
    role => {
      const map = {
        OWNER: t("rooms.role.owner"),
        MODERATOR: t("rooms.role.moderator"),
        MEMBER: t("rooms.role.member"),
        ADMIN: t("rooms.role.admin")
      };
      return map[role] || role || "";
    },
    [t]
  );

  const formatTime = useCallback(
    value => {
      if (!value) return "";
      try {
        return timeFormatter.format(new Date(value));
      } catch {
        return "";
      }
    },
    [timeFormatter]
  );

  const canInvite = useCallback(
    role => role === "OWNER" || role === "MODERATOR",
    []
  );
  const canLeave = useCallback(
    role => role === "MEMBER" || role === "MODERATOR",
    []
  );
  const canDelete = useCallback(
    role => role === "OWNER" || role === "ADMIN",
    []
  );

  const handleInvite = useCallback(roomId => {
    if (!roomId) return;
    try {
      window.dispatchEvent(
        new CustomEvent("sotsiaalai:open-invite", {
          detail: { roomId }
        })
      );
    } catch {}
  }, []);

  const handleLeave = useCallback(
    async room => {
      if (!room?.id) return;
      setErrorText("");
      setLeavingId(room.id);
      try {
        const res = await fetch(
          `/api/rooms/${encodeURIComponent(room.id)}/leave`,
          {
            method: "POST"
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(resolveErrorMessage(data, "rooms.leave_failed"));
        }
        setRooms(prev => prev.filter(r => r.id !== room.id));
      } catch (err) {
        console.warn("Room leave failed:", err);
        setErrorText(err?.message || t("rooms.leave_failed"));
      } finally {
        setLeavingId(null);
      }
    },
    [resolveErrorMessage, t]
  );

  const openDeleteConfirm = useCallback(room => {
    if (!room?.id) return;
    setConfirmRoom(room);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (deletingId) return;
    setConfirmRoom(null);
  }, [deletingId]);

  const confirmDelete = useCallback(
    async room => {
      const target = room?.id ? room : confirmRoom;
      if (!target?.id) return;
      setErrorText("");
      setDeletingId(target.id);
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(target.id)}`, {
          method: "DELETE"
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(resolveErrorMessage(data, "rooms.delete_failed"));
        }
        setRooms(prev => prev.filter(r => r.id !== target.id));
      } catch (err) {
        console.warn("Room delete failed:", err);
        setErrorText(err?.message || t("rooms.delete_failed"));
      } finally {
        setDeletingId(null);
        setConfirmRoom(null);
      }
    },
    [confirmRoom, resolveErrorMessage, t]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorText("");
      try {
        const res = await fetch("/api/rooms", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(resolveErrorMessage(data, "rooms.error"));
        }
        if (!cancelled) {
          setRooms(Array.isArray(data.rooms) ? data.rooms : []);
          setErrorText("");
        }
      } catch (err) {
        if (!cancelled) {
          setRooms([]);
          setErrorText(err?.message || t("rooms.error"));
        }
        console.warn("Rooms load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [resolveErrorMessage, t]);

  const visibleRooms = useMemo(
    () =>
      rooms.filter(room => {
        if (!room?.id) return false;
        const title = (room.title || "").toLowerCase();
        const hasContent = Boolean(
          room?.description || room?.lastMessage?.content || room?.unreadCount
        );
        if (!hasContent && (title === "vestlusruum" || title === "ruum")) {
          return false;
        }
        return true;
      }),
    [rooms]
  );

  const effectiveRooms = useMemo(() => {
    if (
      visibleRooms.length === 1 &&
      (visibleRooms[0].title || "").toLowerCase() === "vestlusruum" &&
      !visibleRooms[0].description &&
      !visibleRooms[0].lastMessage &&
      !visibleRooms[0].unreadCount
    ) {
      return [];
    }
    return visibleRooms;
  }, [visibleRooms]);

  const {
    canScrollUp,
    canScrollDown,
    scrollDirection,
    getItemClassName,
    scrollToIndex
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".rooms-step",
    neighborDistance: isMobileViewport ? 2 : 1,
    lockWheelToSteps: !isMobileViewport,
    settleOnScroll: false,
    enableArrowKeys: true,
    captureArrowKeys: true,
    settleMs: isMobileViewport ? 420 : 360,
    maxStepPerSettle: isMobileViewport ? 99 : 1,
    wheelCooldownMs: isMobileViewport ? 300 : 340,
    minWheelDelta: isMobileViewport ? 10 : 16,
    manageHiddenFocus: !isMobileViewport,
    pauseSettleWhileTouch: isMobileViewport
  });

  const getRoomStepClassName = index => getItemClassName(index);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobileViewport(query.matches);
    apply();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", apply);
      return () => query.removeEventListener("change", apply);
    }
    query.addListener(apply);
    return () => query.removeListener(apply);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;

    const updatePad = () => {
      const steps = Array.from(scrollEl.querySelectorAll(".rooms-step"));
      const firstStep = steps[0] || null;
      const lastStep = steps[steps.length - 1] || firstStep;
      if (!firstStep || !lastStep) return;

      const firstH = firstStep.getBoundingClientRect().height || 0;
      const lastH = lastStep.getBoundingClientRect().height || 0;
      const viewH = Math.max(0, scrollEl.clientHeight || 0);
      if (!viewH || !firstH || !lastH) return;

      const nextPadTopBase = Math.max(0, Math.floor((viewH - firstH) / 2));
      const nextPadBottomBase = Math.max(0, Math.floor((viewH - lastH) / 2));
      const nextPad = nextPadTopBase;
      setScrollPad(prev => (prev === nextPad ? prev : nextPad));

      const liftPx = isMobileViewport ? 4 : 9;
      const nextTop = Math.max(0, nextPadTopBase - liftPx);
      const nextBottom = Math.max(0, nextPadBottomBase + liftPx);
      setScrollPadTop(prev => (prev === nextTop ? prev : nextTop));
      setScrollPadBottom(prev => (prev === nextBottom ? prev : nextBottom));
    };

    updatePad();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePad)
        : null;
    ro?.observe(scrollEl);
    window.addEventListener("resize", updatePad);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updatePad);
    };
  }, [isMobileViewport, loading, effectiveRooms.length]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;

    const mode = isMobileViewport ? "mobile" : "desktop";
    if (initViewportModeRef.current === mode) return;
    initViewportModeRef.current = mode;

    const resetToFirstStep = () => {
      if (!isMobileViewport) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      scrollEl.scrollTop = 0;
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      setHasUserStartedScroll(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
    };

    resetToFirstStep();
    const rafA = requestAnimationFrame(resetToFirstStep);
    const rafB = requestAnimationFrame(() =>
      requestAnimationFrame(resetToFirstStep)
    );
    const settleTimer = window.setTimeout(resetToFirstStep, 120);
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
      window.clearTimeout(settleTimer);
    };
  }, [scrollToIndex, isMobileViewport]);

  useEffect(() => {
    if (hasUserStartedScroll) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const alignToFirst = () => {
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
    };
    const raf = requestAnimationFrame(alignToFirst);
    return () => cancelAnimationFrame(raf);
  }, [scrollPadTop, scrollPadBottom, hasUserStartedScroll, scrollToIndex]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const onScroll = () => {
      const top = scrollEl.scrollTop || 0;
      if (!hasInitialScrollTopRef.current) {
        hasInitialScrollTopRef.current = true;
        initialScrollTopRef.current = top;
      }
      const delta = Math.abs(top - initialScrollTopRef.current);
      const thresholdOn = isMobileViewport ? 14 : 8;
      const thresholdOff = isMobileViewport ? 9 : 5;
      if (delta > thresholdOn) {
        setHasUserStartedScroll(prev => prev || true);
      }
      setIsScrolled(prev => {
        const next = prev ? delta > thresholdOff : delta > thresholdOn;
        return prev === next ? prev : next;
      });
    };
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [isMobileViewport]);

  useEffect(() => {
    if (loading) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const raf = requestAnimationFrame(() => {
      scrollEl.scrollTop = 0;
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      setHasUserStartedScroll(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [loading, effectiveRooms.length, scrollToIndex]);

  return (
    <>
      <section className={pageShellClassName}>
        <GlassRing
          className={ringClassName}
          role="region"
          aria-label={t("rooms.aria")}
          data-scrolled={hasUserStartedScroll && isScrolled ? "1" : "0"}
        >
          <BackButton
            onClick={() => pushWithTransition(router, localizePath("/vestlus", locale), {
              glassRingTilt: "left",
              waitForGlassRingTilt: true,
              persistGlassRingTilt: false
            })}
            ariaLabel={t("rooms.back_to_chats")}
            className={`${glassPageBackMobileBottomCenterClassName} scroll-reactive-back`}
          />

          <div className="max-[768px]:w-full min-[769px]:hidden">
            <div className={mobileTitleWrapClassName}>
              <h1 className={titleClassName}>
                {t("rooms.title")}
              </h1>
            </div>
          </div>

          <div
            className="csp-overlayTitle rooms-page-title-wrap hidden min-[769px]:block [--csp-title-top:2.35rem]"
            aria-hidden="true"
          >
            <div className={mobileTitleWrapClassName}>
              <h1 className={titleClassName}>
                {t("rooms.title")}
              </h1>
            </div>
          </div>

          <div
            className={`csp-scrim csp-scrim--wide csp-scrim--top csp-scrim--chevron is-visible ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`}
            aria-hidden="true"
          >
            <span className="csp-chevron-frame" aria-hidden="true">
              <ChevronIcon
                direction="up"
                strokeWidth={
                  isMobileViewport
                    ? roomChevronStrokeWidthMobile
                    : roomChevronStrokeWidthDesktop
                }
                className="csp-chevron-icon"
              />
            </span>
          </div>
          <div
            className={`csp-scrim csp-scrim--wide csp-scrim--bottom csp-scrim--chevron is-visible ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`}
            aria-hidden="true"
          >
            <span className="csp-chevron-frame" aria-hidden="true">
              <ChevronIcon
                direction="down"
                strokeWidth={
                  isMobileViewport
                    ? roomChevronStrokeWidthMobile
                    : roomChevronStrokeWidthDesktop
                }
                className="csp-chevron-icon"
              />
            </span>
          </div>

          <div className={contentClassName}>
            {errorText ? (
              <p
                role="alert"
                aria-live="assertive"
                className="mb-[0.5rem] w-full text-center text-[1.02rem] leading-[1.42] text-[color:#fca5a5] max-[768px]:text-left max-[768px]:text-[1.1rem]"
              >
                {errorText}
              </p>
            ) : null}
            <div
              ref={scrollRef}
              className={`${scrollAreaClassName} ${isMobileViewport ? "" : "csp-no-neighbor-click"} ${isMobileViewport ? "[--csp-active-scale:1.035] [--csp-neighbor-scale:0.95] [--csp-hidden-scale:0.9] [--csp-neighbor-opacity:0.26] [--csp-hidden-opacity:0.08]" : "[--csp-active-scale:1.04] [--csp-neighbor-scale:0.9] [--csp-hidden-scale:0.82] [--csp-neighbor-opacity:0.1] [--csp-hidden-opacity:0]"}`}
              style={{
                "--csp-pad-top": `${Math.max(0, scrollPadTop || scrollPad)}px`,
                "--csp-pad-bottom": `${Math.max(
                  0,
                  scrollPadBottom || scrollPad
                )}px`,
                "--csp-center-offset": `${isMobileViewport ? -4 : -9}px`
              }}
              tabIndex={0}
              aria-label={t("rooms.title")}
            >
              {loading ? (
                <div className={`${roomStepClassName} csp-item csp-active`}>
                  <div
                    className={roomEmptyCardClassName}
                    aria-busy="true"
                  >
                    <p className="m-0 text-[1.2rem] leading-[1.45] text-[color:var(--pt-120)] [.theme-light_&]:text-[#334155]">
                      {t("rooms.loading")}
                    </p>
                  </div>
                </div>
              ) : effectiveRooms.length === 0 ? (
                <div className={`${roomStepClassName} csp-item csp-active`}>
                  <div className={roomEmptyCardClassName}>
                    <p className="m-0 text-[1.2rem] leading-[1.45] text-[color:var(--pt-120)] [.theme-light_&]:text-[#334155]">
                      {t("rooms.empty")}
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="m-0 list-none p-0">
                  {effectiveRooms.map((room, index) => {
                    const canInviteRoom = canInvite(room.role);
                    const canLeaveRoom = canLeave(room.role);
                    const canDeleteRoom = canDelete(room.role);
                    const hasRoomActions =
                      canInviteRoom || canLeaveRoom || canDeleteRoom;
                    const formattedLastActivity = room.lastMessage?.createdAt
                      ? formatTime(room.lastMessage.createdAt)
                      : "";

                    return (
                      <li
                        key={room.id}
                        className={`${roomStepClassName} ${getRoomStepClassName(index)}`}
                      >
                        <article className={`${roomCardClassName} rooms-card`}>
                          <Link
                            prefetch={false}
                            href={localizePath(
                              `/vestlus?roomId=${encodeURIComponent(room.id)}`,
                              locale
                            )}
                            onClick={event => {
                              if (event.defaultPrevented) return;
                              if (
                                event.metaKey ||
                                event.ctrlKey ||
                                event.shiftKey ||
                                event.altKey
                              ) {
                                return;
                              }
                              if (event.button !== 0) return;
                              event.preventDefault();
                              pushWithTransition(
                                router,
                                localizePath(
                                  `/vestlus?roomId=${encodeURIComponent(room.id)}`,
                                  locale
                                ),
                                {
                                  glassRingTilt: "right",
                                  waitForGlassRingTilt: true,
                                  persistGlassRingTilt: false
                                }
                              );
                            }}
                            className="grid w-full gap-[0.42rem] text-inherit no-underline"
                          >
                            <div className="flex items-start justify-between gap-[0.8rem]">
                              <h2 className="m-0 text-[1.38rem] font-semibold leading-[1.15] tracking-[0.01em] text-[color:var(--pt-60)] [.theme-light_&]:text-[#0f172a]">
                                {room.title || t("rooms.fallback_title")}
                              </h2>
                              {room.unreadCount ? (
                                <span
                                  className={`${roomUnreadBadgeClassName} rooms-unread-badge`}
                                  aria-label={`${t("rooms.unread")}: ${room.unreadCount}`}
                                >
                                  <span>
                                    {t("rooms.unread")} {room.unreadCount}
                                  </span>
                                </span>
                              ) : null}
                            </div>

                            <div className={roomMetaRowClassName}>
                              {room.role ? (
                                <span className={roomMetaItemClassName}>
                                  {t("rooms.role_label")}: {roleLabel(room.role)}
                                </span>
                              ) : null}
                              {Number.isFinite(room.memberCount) ? (
                                <span className={roomMetaItemClassName}>
                                  {t("rooms.members_label")}: {room.memberCount}
                                </span>
                              ) : null}
                            </div>
                          </Link>

                          {formattedLastActivity || hasRoomActions ? (
                            <div
                              className={`mt-[0.62rem] flex items-end gap-[0.45rem] ${
                                hasRoomActions ? "justify-between" : "justify-end"
                              }`}
                            >
                              {formattedLastActivity ? (
                                <span className="pb-[0.02rem] text-[0.94rem] text-[color:var(--pt-280)] [.theme-light_&]:text-[#334155]">
                                  {formattedLastActivity}
                                </span>
                              ) : null}

                              {hasRoomActions ? (
                                <div className="flex items-center justify-end gap-[0.45rem]">
                                  {canInviteRoom ? (
                                    <button
                                      type="button"
                                      className={`${roomActionButtonClassName} rooms-action-btn`}
                                      onClick={() => handleInvite(room.id)}
                                    >
                                      {t("rooms.invite")}
                                    </button>
                                  ) : null}
                                  {canLeaveRoom ? (
                                    <button
                                      type="button"
                                      className={`${roomActionButtonClassName} rooms-action-btn`}
                                      onClick={() => handleLeave(room)}
                                      disabled={leavingId === room.id}
                                    >
                                      {leavingId === room.id
                                        ? t("rooms.leave_busy")
                                        : t("rooms.leave")}
                                    </button>
                                  ) : null}
                                  {canDeleteRoom ? (
                                    <button
                                      type="button"
                                      className={`${roomDeleteButtonClassName} rooms-delete-btn`}
                                      onClick={() => openDeleteConfirm(room)}
                                      disabled={deletingId === room.id}
                                      aria-label={t("rooms.delete")}
                                      title={t("rooms.delete")}
                                    >
                                      <svg
                                        className="h-[1.08rem] w-[1.08rem]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                      </svg>
                                    </button>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </GlassRing>
      </section>

      <Modal
        open={!!confirmRoom}
        onClose={closeDeleteConfirm}
        closeOnOverlayClick={!deletingId}
        aria-labelledby="rooms-delete-title"
      >
        {confirmRoom ? (
          <div className="flex flex-col gap-4 text-[color:var(--pt-50)] light:text-[color:var(--text-strong)]">
            <h2 id="rooms-delete-title" className={modalTitleClassName}>
              {t("rooms.delete_title")}
            </h2>
            <p className="text-[1.05rem] leading-[1.5] text-[color:var(--pt-120)] light:text-[color:var(--text-strong)]">
              {t("rooms.delete_confirm").replace(
                "{name}",
                confirmRoom.title || t("rooms.fallback_title")
              )}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={closeDeleteConfirm}
                disabled={deletingId === confirmRoom.id}
              >
                {t("rooms.cancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => confirmDelete(confirmRoom)}
                disabled={deletingId === confirmRoom.id}
              >
                {deletingId === confirmRoom.id
                  ? t("rooms.delete_busy")
                  : t("rooms.delete")}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <InviteModal />
    </>
  );
}
