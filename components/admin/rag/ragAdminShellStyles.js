import {
  glassPageTitleClassName,
  glassSubpageSurfaceScopeClassName
} from "@/components/ui/glassPageStyles";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";

export const ragAdminPageShellClassName =
  "rag-admin-page-shell documents-workspace mx-auto w-full px-[clamp(0.35rem,1.4vw,0.8rem)] py-[clamp(0.4rem,1.5vw,0.8rem)]";

export const ragAdminShellInnerClassName =
  "mx-auto flex w-full flex-col gap-3 px-[clamp(0.45rem,1.2vw,0.8rem)] py-[clamp(0.45rem,1.2vw,0.8rem)]";

export const ragAdminShellCardClassName =
  `rag-admin-shell-card relative isolate flex w-full flex-col gap-3 rounded-[1.6rem] px-[clamp(0.95rem,2.2vw,1.4rem)] py-[clamp(0.85rem,2vw,1.15rem)] ` +
  `border border-[color:var(--glass-border-color,var(--admin-border,var(--documents-card-border)))] ` +
  `bg-[color-mix(in_srgb,var(--admin-surface,var(--documents-card-bg))_88%,var(--glass-surface-bg,transparent)_12%)] ` +
  `text-[color:var(--documents-page-text)] shadow-[0_7px_16px_rgba(0,0,0,0.10)] ` +
  `min-[769px]:backdrop-blur-[16px] min-[769px]:[-webkit-backdrop-filter:blur(16px)] ${glassSubpageSurfaceScopeClassName}`;

export const ragAdminShellTitleClassName =
  `rag-admin-shell-title ${glassPageTitleClassName} !mt-0 !mb-0 w-full text-center text-[color:var(--title-color,var(--brand-primary))]`;

export const ragAdminShellSubtitleClassName =
  "mx-auto max-w-[62ch] text-center text-[0.95rem] leading-[1.5] text-[color:var(--documents-page-muted)]";

export const ragAdminShellDividerClassName =
  "mt-1 h-px w-full bg-[linear-gradient(90deg,rgba(122,58,56,0)_0%,rgba(122,58,56,0.12)_12%,rgba(122,58,56,0.12)_88%,rgba(122,58,56,0)_100%)]";

export const ragAdminShellNavClassName =
  "flex w-full flex-wrap items-center justify-center gap-2 pt-1";

export const ragAdminShellNavLinkClassName =
  `relative inline-flex min-h-[2.7rem] min-w-[8.6rem] items-center justify-center gap-[0.35rem] overflow-hidden rounded-[1rem] ` +
  `px-[0.95rem] py-[0.62rem] text-center text-[0.98rem] font-[500] tracking-[0.01rem] no-underline select-none ` +
  `transition-[color,border-color,box-shadow,background] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ` +
  `[backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] ` +
  `before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:[background:var(--seg-card-bg-hover,var(--seg-card-bg))] before:opacity-0 before:transition-opacity before:duration-[var(--seg-card-duration,560ms)] before:ease-[var(--seg-card-ease,cubic-bezier(0.22,0.61,0.36,1))] ` +
  `[@media(hover:hover)]:hover:before:opacity-100 [@media(hover:hover)]:hover:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] [@media(hover:hover)]:hover:text-[color:var(--seg-card-text-hover)] [@media(hover:hover)]:hover:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] ` +
  `focus-visible:before:opacity-100 focus-visible:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] focus-visible:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] focus-visible:outline-none ` +
  `data-[checked=true]:before:opacity-100 data-[checked=true]:[background:var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg)))] data-[checked=true]:border-[color:var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border)))] data-[checked=true]:shadow-[var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow)))] data-[checked=true]:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] ` +
  `active:[background:var(--seg-card-bg-active,var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg))))] active:border-[color:var(--seg-card-border-active,var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border))))] active:shadow-[var(--seg-card-shadow-active,var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow))))] active:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] ` +
  `[&>span]:relative [&>span]:z-[1] ui-glow-button-frame ${primarySegmentedButtonClassName}`;
