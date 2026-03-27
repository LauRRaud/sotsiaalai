"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassSubpageCardInteractiveClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getHelpUiText } from "./helpUiText";

function buildMetaLine(item) {
  return [
    item.categoryLabel,
    item.helpTypeLabel,
    item.timeTypeLabel,
    item.roleLabel
  ]
    .filter(Boolean)
    .join(" | ");
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
  const [isMounted, setIsMounted] = useState(false);
  const [closeTiltOverride, setCloseTiltOverride] = useState(null);
  const tiltAnimationClassName = useMemo(() => {
    const effectiveSide = closeTiltOverride || _side;
    const keyframe = effectiveSide === "right" ? "glassRingTiltFromRight" : "glassRingTiltFromLeft";
    return `motion-safe:animate-[${keyframe}_540ms_cubic-bezier(0.42,0,0.58,1)_both]`;
  }, [_side, closeTiltOverride]);
  const countLabel = `${items.length} ${items.length === 1 ? ui.listingSingular : ui.listingPlural}`;
  const helpListingsContentClassName =
    `help-listings-modal-content !w-[min(100%,48rem)] !max-w-[clamp(30rem,56vw,40rem)] ` +
    `relative overflow-x-hidden overflow-y-auto overscroll-contain pt-[0.35rem] !pb-[1rem] text-[1.08rem] ` +
    `leading-[1.35] tracking-[0.024rem] ${glassPageMobileCardClassName} ` +
    `${isClosing ? `${tiltAnimationClassName} pointer-events-none` : ""}`;
  const helpListingsTitleClassName =
    `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static help-listings-title max-[768px]:!mt-0 max-[768px]:!mb-0`;
  const mobileTitleWrapClassName =
    "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
  const listingsPanelClassName =
    "mt-[0.25rem] max-[768px]:mt-[0.2rem] min-h-[min(56dvh,28rem)] max-h-[min(62dvh,30rem)] " +
    "max-[768px]:min-h-[min(60dvh,32rem)] max-[768px]:max-h-[min(66dvh,34rem)] overflow-y-auto " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";

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
      className="help-listings-modal-overlay z-[140] bg-transparent max-[768px]:p-0 max-[768px]:items-stretch"
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

        <div className="grid gap-[0.7rem] px-[1.05rem] pt-0 pb-[0.4rem] max-[768px]:px-[0.12rem]">
          <Panel
            variant="subpage"
            padding="sm"
            className={`help-listings-panel ${listingsPanelClassName}`}
          >
            {loading ? <div className="px-2 py-4 text-[0.98rem] opacity-80">{ui.loading}</div> : null}
            {!loading && error ? <div className="px-2 py-4 text-[0.98rem] text-[#d68580] [.theme-night_&]:text-[rgba(226,182,180,0.96)]">{error}</div> : null}
            {!loading && !error && !items.length ? <div className="px-2 py-4 text-[0.98rem] opacity-78 hc:text-[color:var(--hc-accent)] hc:opacity-100">{emptyText}</div> : null}

            <div className="grid gap-[0.7rem]">
              {items.map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  onClick={() => onSelectItem?.(item)}
                  className={`help-listings-item-card ${glassSubpageCardInteractiveClassName} rounded-[1.12rem] px-[1rem] py-[0.95rem] text-left`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[1.04rem] font-[650] leading-[1.28] tracking-[0.012em] max-[768px]:text-[1.1rem]">
                      {item.title}
                    </div>
                    {item.statusLabel ? (
                      <span className="shrink-0 rounded-full border border-[rgba(197,113,113,0.16)] px-[0.62rem] py-[0.32rem] text-[0.74rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)] [.theme-light_&]:border-[rgba(122,58,56,0.14)] [.theme-light_&]:text-[#7a3a38]">
                        {item.statusLabel}
                      </span>
                    ) : null}
                  </div>
                  {item.summary ? <div className="mt-[0.5rem] text-[0.94rem] leading-[1.48] opacity-92 max-[768px]:text-[0.98rem]">{item.summary}</div> : null}
                  {buildMetaLine(item) ? (
                    <div className="mt-[0.58rem] text-[0.78rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)] [.theme-light_&]:text-[#7a3a38]">
                      {buildMetaLine(item)}
                    </div>
                  ) : null}
                  {item.municipalityLabel ? <div className="mt-[0.5rem] text-[0.84rem] opacity-76">{item.municipalityLabel}</div> : null}
                </button>
              ))}
            </div>
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
