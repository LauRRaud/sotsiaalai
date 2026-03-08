"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Panel from "@/components/ui/Panel";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
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
  onLoadMore,
  onSelectItem,
  onClose,
  emptyText = ""
}) {
  const { t } = useI18n();
  const ui = getHelpUiText(t);
  const [isMounted, setIsMounted] = useState(false);
  const countLabel = `${items.length} ${items.length === 1 ? ui.listingSingular : ui.listingPlural}`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return createPortal(
    <Modal
      open
      variant="glass"
      onClose={onClose}
      closeOnOverlayClick
      aria-label={title || ui.listingPlural}
      className="help-listings-modal-overlay z-[140] bg-transparent max-[768px]:p-0 max-[768px]:items-stretch"
      contentClassName="help-listings-modal-content !w-[min(100%,48rem)] !max-w-[clamp(30rem,56vw,40rem)] relative overflow-hidden pt-[0.35rem] !pb-[1rem] text-[1.08rem] leading-[1.35] tracking-[0.024rem] max-[768px]:!w-full max-[768px]:!max-w-none max-[768px]:!max-h-[100dvh] max-[768px]:!rounded-none max-[768px]:!px-[0.3rem] max-[768px]:!pt-[0.35rem] max-[768px]:!pb-[calc(env(safe-area-inset-bottom,0px)+0.8rem)]"
    >
      <BackButton
        onClick={onClose}
        ariaLabel={ui.close}
        className="absolute top-[0.55rem] left-[0.55rem] translate-x-0 translate-y-0 bottom-auto !h-[4rem] !w-[4rem] z-[92] [&>svg]:!h-[4rem] [&>svg]:!w-[4rem] max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.56rem)] max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] max-[768px]:!h-[4.4rem] max-[768px]:!w-[4.4rem] max-[768px]:[&>svg]:!h-[4.4rem] max-[768px]:[&>svg]:!w-[4.4rem]"
      />

      <header className="mb-[0.35rem] flex items-start justify-center gap-[0.75rem]">
        <h2 className={`${glassPageTitleClassName} max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+2.75rem)] max-[768px]:translate-y-[0.32rem]`}>
          {title}
        </h2>
      </header>

      <div className="flex justify-center">
        <p className="mt-[0.88rem] text-center text-[1.28rem] font-[390] tracking-[0.012em] text-[color:var(--title-color,var(--brand-primary))] opacity-72 max-[768px]:mt-[0.82rem] max-[768px]:text-[1.26rem] max-[768px]:tracking-[0.01em]">
          {countLabel}
        </p>
      </div>

      <div className="grid gap-[0.7rem] px-[1.05rem] pt-0 pb-[0.4rem] max-[768px]:px-[0.12rem]">
        <Panel
          variant="secondary"
          padding="sm"
          className="mt-[0.25rem] max-[768px]:mt-[0.2rem] min-h-[min(56dvh,28rem)] max-h-[min(62dvh,30rem)] max-[768px]:min-h-[min(60dvh,32rem)] max-[768px]:max-h-[min(66dvh,34rem)] overflow-y-auto border-[rgba(248,253,255,0.1)] bg-[rgba(255,255,255,0.12)] shadow-[0_16px_34px_rgba(15,23,42,0.06)] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [.theme-night_&]:bg-[rgba(10,14,24,0.34)] [.theme-dark_&]:bg-[rgba(12,16,24,0.38)] [.theme-mid_&]:bg-[rgba(255,255,255,0.1)] [.theme-light_&]:border-[rgba(122,58,56,0.07)] [.theme-light_&]:bg-[rgba(255,255,255,0.2)]"
        >
          {loading ? <div className="px-2 py-4 text-[0.98rem] opacity-80">{ui.loading}</div> : null}
          {!loading && error ? <div className="px-2 py-4 text-[0.98rem] text-[#d68580] [.theme-night_&]:text-[rgba(226,182,180,0.96)]">{error}</div> : null}
          {!loading && !error && !items.length ? <div className="px-2 py-4 text-[0.98rem] opacity-78">{emptyText}</div> : null}

          <div className="grid gap-[0.7rem]">
            {items.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => onSelectItem?.(item)}
                className="rounded-[1.12rem] border border-[rgba(248,253,255,0.1)] bg-[rgba(255,255,255,0.16)] px-[1rem] py-[0.95rem] text-left text-[color:var(--glass-modal-text)] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-[transform,background,border-color] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(255,255,255,0.22)] [.theme-night_&]:bg-[rgba(16,22,34,0.24)] [.theme-night_&]:hover:bg-[rgba(18,26,40,0.32)] [.theme-dark_&]:bg-[rgba(20,24,31,0.28)] [.theme-dark_&]:hover:bg-[rgba(25,31,40,0.36)] [.theme-mid_&]:bg-[rgba(255,255,255,0.16)] [.theme-mid_&]:hover:bg-[rgba(255,255,255,0.22)] [.theme-light_&]:border-[rgba(122,58,56,0.07)] [.theme-light_&]:bg-[rgba(255,255,255,0.3)] [.theme-light_&]:hover:bg-[rgba(255,255,255,0.38)]"
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
