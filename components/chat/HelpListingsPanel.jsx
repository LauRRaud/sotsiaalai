"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import {
  glassPageBackTopLeftClassName,
  glassSubpageCardInteractiveClassName,
  glassSubpageContentWideClassName,
  glassSubpageMobileReadableWidthClassName,
  glassSubpagePanelWideClassName,
  glassSubpageSurfaceScopeClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getHelpUiText } from "./helpUiText";

function uniqueLabels(values = []) {
  return Array.from(new Set((Array.isArray(values) ? values : []).map((item) => String(item || "").trim()).filter(Boolean)));
}

function buildTagLine(item = {}) {
  return uniqueLabels([
    item.categoryLabel,
    ...(Array.isArray(item.targetGroupLabels) ? item.targetGroupLabels : [])
  ]).join(" · ");
}

export default function HelpListingsPanel({
  locale: _locale = "et",
  title = "",
  side: _side = "left",
  items = [],
  loading = false,
  error = "",
  nextOffset = null,
  isClosing = false,
  onLoadMore,
  onSelectItem,
  onClose,
  onBackToProfile,
  emptyText = ""
}) {
  const { t } = useI18n();
  const ui = getHelpUiText(t);
  const ownSectionLabel = title === ui.helpOffers ? ui.myHelpOffers : ui.myHelpRequests;
  const [isMounted, setIsMounted] = useState(false);
  const [closeTiltOverride, setCloseTiltOverride] = useState(null);
  const listingsScrollRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const ownItems = useMemo(
    () => items.filter((item) => item?.isOwn),
    [items]
  );
  const otherItems = useMemo(
    () => items.filter((item) => !item?.isOwn),
    [items]
  );
  const tiltAnimationClassName = useMemo(() => {
    const effectiveSide = closeTiltOverride || _side;
    const keyframe = effectiveSide === "right" ? "glassRingTiltFromRight" : "glassRingTiltFromLeft";
    return `motion-safe:animate-[${keyframe}_540ms_cubic-bezier(0.42,0,0.58,1)_both]`;
  }, [_side, closeTiltOverride]);
  const countLabel = `${items.length} ${items.length === 1 ? ui.listingSingular : ui.listingPlural}`;
  const helpListingsContentClassName =
    `help-listings-modal-content !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] ` +
    `relative !flex min-h-0 !min-h-[clamp(40rem,86vh,56rem)] !max-h-[calc(100dvh-2.5rem)] !flex-col overflow-x-hidden !overflow-hidden pt-[0.35rem] !pb-[1rem] text-[1.08rem] ` +
    `[--glass-modal-bg:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] ` +
    `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
    `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] shadow-[var(--glass-shell-shadow,none)] ` +
    `${glassSubpageSurfaceScopeClassName} ` +
    `leading-[1.35] tracking-[0.024rem] mobile-keep-desktop-glass-cards ` +
    `max-[768px]:!max-w-none max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] ` +
    `max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] ` +
    `max-[768px]:px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] ` +
    `max-[768px]:pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] ` +
    `max-[768px]:!min-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
    `max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] ` +
    `${isClosing ? `${tiltAnimationClassName} pointer-events-none` : ""}`;
  const helpListingsTitleClassName =
    `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static help-listings-title max-[768px]:!mt-0 max-[768px]:!mb-0`;
  const mobileTitleWrapClassName =
    "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
  const listingsPanelClassName =
    "mt-[0.25rem] max-[768px]:mt-[0.2rem]";
  const listingsScrollClassName =
    "help-listings-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-[0.18rem] [scrollbar-width:thin] max-[768px]:pr-0";

  const renderListingCard = (item) => (
    <button
      key={`${item.kind}-${item.id}`}
      type="button"
      onClick={() => onSelectItem?.(item)}
      className={`help-listings-item-card ${glassSubpageCardInteractiveClassName} min-w-0 rounded-[1.12rem] px-[1rem] py-[0.95rem] text-left ${item.isOwn ? "ring-1 ring-[rgba(197,113,113,0.34)] [.theme-light_&]:ring-[rgba(122,58,56,0.28)]" : ""}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-[0.55rem]">
        <div className="min-w-0 break-words text-[1.04rem] font-[650] leading-[1.28] tracking-[0.012em] max-[768px]:text-[1.02rem] max-[768px]:leading-[1.22]">
          {item.title}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-[0.35rem] max-[768px]:justify-start max-[768px]:gap-[0.28rem]">
          {item.isOwn ? (
            <span className="max-w-full rounded-full border border-[rgba(90,154,118,0.28)] bg-[rgba(90,154,118,0.12)] px-[0.62rem] py-[0.32rem] text-[0.72rem] uppercase tracking-[0.08em] text-[rgba(143,216,174,0.98)] max-[768px]:px-[0.5rem] max-[768px]:py-[0.26rem] max-[768px]:text-[0.62rem] max-[768px]:tracking-[0.055em] [.theme-light_&]:border-[rgba(52,118,79,0.24)] [.theme-light_&]:bg-[rgba(52,118,79,0.08)] [.theme-light_&]:text-[rgba(52,118,79,0.98)]">
              {ui.ownListing}
            </span>
          ) : null}
          {item.statusLabel ? (
            <span className="max-w-full rounded-full border border-[rgba(197,113,113,0.16)] px-[0.62rem] py-[0.32rem] text-[0.74rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)] max-[768px]:px-[0.5rem] max-[768px]:py-[0.26rem] max-[768px]:text-[0.62rem] max-[768px]:tracking-[0.055em] [.theme-light_&]:border-[rgba(122,58,56,0.14)] [.theme-light_&]:text-[#7a3a38]">
              {item.statusLabel}
            </span>
          ) : null}
        </div>
      </div>
      {item.summary ? <div className="mt-[0.5rem] break-words text-[0.94rem] leading-[1.48] opacity-92 max-[768px]:text-[0.92rem]">{item.summary}</div> : null}
      {buildTagLine(item) ? (
        <div className="mt-[0.58rem] break-words text-[0.84rem] leading-[1.4] opacity-82 max-[768px]:text-[0.8rem]">
          {buildTagLine(item)}
        </div>
      ) : null}
    </button>
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isClosing) return;
    if (closeTiltOverride !== null) {
      setCloseTiltOverride(null);
    }
  }, [closeTiltOverride, isClosing]);

  useEffect(() => {
    if (!isMounted) return undefined;
    const root = document.documentElement;
    document.body.classList.toggle("modal-open", true);
    root.classList.toggle("modal-open", true);
    document.body.classList.toggle("help-listings-modal-open", true);
    root.classList.toggle("help-listings-modal-open", true);
    return () => {
      document.body.classList.remove("modal-open");
      root.classList.remove("modal-open");
      document.body.classList.remove("help-listings-modal-open");
      root.classList.remove("help-listings-modal-open");
    };
  }, [isMounted]);

  useEffect(() => {
    const element = listingsScrollRef.current;
    if (!element || loading || error || !items.length) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      setScrollDirection("down");
      return undefined;
    }

    let lastTop = element.scrollTop || 0;

    const updateScrollState = () => {
      const nextTop = element.scrollTop || 0;
      const maxTop = Math.max(0, element.scrollHeight - element.clientHeight);
      setCanScrollUp(nextTop > 6);
      setCanScrollDown(nextTop < maxTop - 6);
      if (Math.abs(nextTop - lastTop) > 2) {
        setScrollDirection(nextTop > lastTop ? "down" : "up");
      }
      lastTop = nextTop;
    };

    updateScrollState();
    const rafId = window.requestAnimationFrame(updateScrollState);
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(rafId);
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [error, items.length, loading]);

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  const handleBackClick = () => {
    setCloseTiltOverride("left");
    (onBackToProfile || onClose)?.();
  };

  return createPortal(
    <Modal
      open
      variant="glass"
      onClose={onClose}
      closeOnOverlayClick={!isClosing}
      aria-label={title || ui.listingPlural}
      className="help-listings-modal-overlay z-[140] bg-transparent overflow-y-auto overscroll-contain items-start py-[clamp(1rem,3vh,1.75rem)] max-[768px]:p-0 max-[768px]:items-start"
      contentClassName={helpListingsContentClassName}
    >
      <BackButton
        onClick={handleBackClick}
        ariaLabel={onBackToProfile ? t("buttons.back") : ui.close}
        className={glassPageBackTopLeftClassName}
      />

        <header className="help-listings-title-wrap mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]">
          <div className={mobileTitleWrapClassName}>
            <h2 className={helpListingsTitleClassName}>
              {title}
            </h2>
          </div>
        </header>

        <div className="flex justify-center">
          <p className="mt-[0.88rem] text-center text-[1.28rem] font-[390] tracking-[0.012em] text-[color:var(--title-color,var(--brand-primary))] opacity-72 max-[768px]:mt-[0.82rem] max-[768px]:text-[1.26rem] max-[768px]:tracking-[0.01em]">
            {countLabel}
          </p>
        </div>

        <div className={`help-listings-body ${glassSubpageContentWideClassName} ${glassSubpageMobileReadableWidthClassName} flex min-h-0 flex-1 flex-col gap-[1.25rem] overflow-x-hidden px-[0.78rem] pt-[0.9rem] pb-[0.4rem] max-[768px]:gap-[1rem] max-[768px]:px-[0.05rem]`}>
          <Panel
            variant="subpage"
            padding="sm"
            className={`help-listings-panel ${glassSubpagePanelWideClassName} ${listingsPanelClassName} relative flex min-h-0 flex-1 flex-col !max-h-none !overflow-hidden !p-[0.72rem] max-[768px]:!p-[0.24rem]`}
          >
            {loading ? <div className="px-2 py-4 text-[0.98rem] opacity-80">{ui.loading}</div> : null}
            {!loading && error ? <div className="px-2 py-4 text-[0.98rem] text-[#d68580] [.theme-night_&]:text-[rgba(226,182,180,0.96)]">{error}</div> : null}
            {!loading && !error && !items.length ? (
              <div className="help-listings-empty flex flex-1 min-h-[clamp(13rem,30vh,18rem)] items-center px-2 py-4 text-[1.08rem] leading-[1.45] opacity-78 max-[768px]:min-h-[clamp(10rem,22vh,14rem)] max-[768px]:text-[1.12rem] hc:text-[color:var(--hc-accent)] hc:opacity-100">
                {emptyText}
              </div>
            ) : null}

            {!loading && !error && items.length ? (
              <>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-[0.72rem] right-[0.72rem] top-[0.72rem] z-[4] h-[4.2rem] bg-[linear-gradient(to_bottom,var(--csp-surface,rgba(10,12,18,0.94)),rgba(0,0,0,0))] transition-opacity duration-300 max-[768px]:left-[0.24rem] max-[768px]:right-[0.24rem] max-[768px]:top-[0.24rem] ${canScrollUp ? "opacity-100" : "opacity-0"}`}
                >
                  <span className={`absolute left-1/2 top-[0.45rem] block h-[2.3rem] w-[2.3rem] -translate-x-1/2 transition-all duration-500 ${canScrollUp ? (scrollDirection === "down" ? "scale-[0.74] opacity-35" : "scale-100 opacity-80") : "scale-[0.6] opacity-0"}`}>
                    <ChevronIcon direction="up" strokeWidth={1} className="h-full w-full text-[color:var(--csp-arrow-color,var(--title-color,var(--brand-primary)))] opacity-80" />
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-[0.72rem] left-[0.72rem] right-[0.72rem] z-[4] h-[4.4rem] bg-[linear-gradient(to_top,var(--csp-surface,rgba(10,12,18,0.94)),rgba(0,0,0,0))] transition-opacity duration-300 max-[768px]:bottom-[0.24rem] max-[768px]:left-[0.24rem] max-[768px]:right-[0.24rem] ${canScrollDown ? "opacity-100" : "opacity-0"}`}
                >
                  <span className={`absolute bottom-[0.05rem] left-1/2 block h-[2.55rem] w-[2.55rem] -translate-x-1/2 transition-all duration-500 ${canScrollDown ? (scrollDirection === "up" ? "scale-[0.74] opacity-35" : "scale-100 opacity-80") : "scale-[0.6] opacity-0"}`}>
                    <ChevronIcon direction="down" strokeWidth={1} className="h-full w-full text-[color:var(--csp-arrow-color,var(--title-color,var(--brand-primary)))] opacity-80" />
                  </span>
                </div>
                <div ref={listingsScrollRef} className={listingsScrollClassName}>
                  <div className="grid min-w-0 gap-[0.7rem]">
                    {ownItems.length ? (
                      <div className="mb-[0.1rem] text-[0.76rem] uppercase tracking-[0.11em] opacity-70">
                        {ownSectionLabel}
                      </div>
                    ) : null}
                    {ownItems.map(renderListingCard)}
                    {otherItems.map(renderListingCard)}
                  </div>
                </div>
              </>
            ) : null}
          </Panel>

          {!loading && nextOffset != null ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onLoadMore}
                className="!min-h-[2.7rem] !px-[1.35rem] !py-[0.48rem] !text-[1.02rem] max-[768px]:!min-h-[2.9rem]"
              >
                {ui.loadMore}
              </Button>
            </div>
          ) : null}
        </div>
    </Modal>,
    document.body
  );
}
