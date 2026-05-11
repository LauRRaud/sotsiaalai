import { pillInputBaseClassName } from "@/components/ui/inputClassNames";

export const glassPageTitleClassName =
  "glass-page-title mt-[clamp(2.15rem,5.4vh,3.25rem)] mb-[clamp(0.35rem,1.4vh,0.8rem)] text-center text-[2.15em] max-[768px]:text-[clamp(1.78rem,6.6vw,2.18rem)] leading-[1.12] tracking-[0.03em] " +
  "w-full max-w-full max-[768px]:mx-auto max-[768px]:pb-[0.12em] max-[768px]:tracking-[0.012em] max-[768px]:leading-[1.14] max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+4.05rem)] max-[768px]:mb-[clamp(0.2rem,0.9vh,0.55rem)] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
  "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";

export const glassPageTitleMobileHeaderClassName =
  "max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-[768px]:!mb-[clamp(0.24rem,1vh,0.58rem)]";

export const glassPageTitleProminentClassName =
  "min-[769px]:!text-[2.6rem] max-[768px]:!text-[clamp(2.28rem,9.25vw,3.08rem)]";

export const glassPrimaryButtonToneClassName =
  "[--btn-primary-border:0_solid_transparent] " +
  "[--btn-primary-border-hover:0_solid_transparent] " +
  "[--btn-primary-border-active:0_solid_transparent] " +
  "[--btn-primary-shadow:0_4px_10px_rgba(0,0,0,0.13)] " +
  "[--btn-primary-shadow-hover:0_6px_13px_rgba(0,0,0,0.11)] " +
  "[--btn-primary-shadow-active:0_1px_4px_rgba(0,0,0,0.12)] " +
  "[--btn-primary-shadow-focus:0_4px_9px_rgba(0,0,0,0.14),0_0_0_3px_var(--btn-primary-focus-ring-color)] " +
  "[.theme-light:not(.theme-mid)_&]:[--btn-primary-bg-hover:radial-gradient(82%_66%_at_50%_16%,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0.99)_58%,rgba(253,251,250,0.97)_74%),linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(254,252,251,0.985)_100%)] " +
  "[.theme-light:not(.theme-mid)_&]:[--btn-primary-border-hover:1px_solid_rgba(148,163,184,0.1)]";

export const glassPageShellClassName =
  `mx-auto flex w-full min-h-[100dvh] max-[768px]:min-h-[var(--glass-mobile-root-vh,100dvh)] flex-col items-center justify-start box-border ${glassPrimaryButtonToneClassName}`;

export const glassPageShellCenteredClassName =
  `mx-auto grid w-full min-h-[100dvh] max-[768px]:min-h-[var(--glass-mobile-root-vh,100dvh)] place-items-center box-border ${glassPrimaryButtonToneClassName} ` +
  "max-[768px]:flex max-[768px]:flex-col max-[768px]:items-center max-[768px]:justify-start";

export const glassPageBackClassName =
  "absolute z-[8] left-[max(0px,calc(var(--glass-edge-left)-clamp(0.72rem,1.35vw,1.12rem)))] top-[calc(50%+var(--glass-center-offset,0px)-3.2rem)] min-[768px]:ml-[-0.42rem] max-[768px]:hidden min-[768px]:opacity-[0.85] light:min-[768px]:opacity-100";

export const glassPageBackMobileCornerClassName =
  `${glassPageBackClassName} ` +
  "max-[768px]:!inline-flex max-[768px]:top-auto max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.2rem)] " +
  "max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+0.2rem)] max-[768px]:transform-none " +
  "max-[768px]:h-[3.35rem] max-[768px]:w-[3.35rem] max-[768px]:z-[92] " +
  "max-[768px]:[&>svg]:h-[3.35rem] max-[768px]:[&>svg]:w-[3.35rem]";

export const glassPageBackMobileBottomCenterClassName =
  `${glassPageBackClassName} ` +
  "max-[768px]:!inline-flex max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.2rem)] max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] " +
  "max-[768px]:transform-none max-[768px]:bottom-auto " +
  "max-[768px]:h-[4.2rem] max-[768px]:w-[4.2rem] max-[768px]:z-[92] " +
  "max-[768px]:[&>svg]:h-[4.2rem] max-[768px]:[&>svg]:w-[4.2rem]";

export const glassPageBackTopLeftClassName =
  `${glassPageBackMobileBottomCenterClassName} ` +
  "min-[769px]:top-[0.55rem] min-[769px]:left-[0.55rem] min-[769px]:bottom-auto " +
  "min-[769px]:ml-0 min-[769px]:!h-[5rem] min-[769px]:!w-[5rem] " +
  "min-[769px]:[&>svg]:!h-[5rem] min-[769px]:[&>svg]:!w-[5rem]";

export const glassPageBackRightClassName =
  "absolute z-[8] right-[max(0px,calc(var(--glass-edge-right)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px)-3.2rem)]";

export const glassPageCloseClassName =
  "glass-mobile-only-close text-[#c57171] opacity-90 light:text-[#7a3a38]";

export const glassPageRingCenteredClassName =
  "glass-ring md:mt-0 md:mb-0 [--ring-ui-reserve:var(--ring-ui-reserve-page)]";

export const glassPageMobileCardClassName =
  `${glassPrimaryButtonToneClassName} ` +
  "max-[768px]:[--glass-mobile-vh:var(--glass-mobile-root-vh,100dvh)] " +
  "max-[768px]:[--glass-mobile-safe-top:env(safe-area-inset-top,0px)] " +
  "max-[768px]:[--glass-mobile-safe-bottom:env(safe-area-inset-bottom,0px)] " +
  "max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!max-w-none max-[768px]:!h-[calc(var(--glass-mobile-vh)-var(--glass-mobile-safe-top)-var(--glass-mobile-safe-bottom)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!max-h-[calc(var(--glass-mobile-vh)-var(--glass-mobile-safe-top)-var(--glass-mobile-safe-bottom)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!mt-[calc(var(--glass-mobile-safe-top)+var(--mobile-glass-card-gap,0.35rem))] " +
  "max-[768px]:!mr-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-right,0px))] " +
  "max-[768px]:!mb-[calc(var(--glass-mobile-safe-bottom)+var(--mobile-glass-card-gap,0.35rem))] " +
  "max-[768px]:!ml-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] " +
  "max-[768px]:!rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] " +
  "max-[768px]:!px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] " +
  "max-[768px]:!pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] " +
  "max-[768px]:!pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)]";

export const glassSubpageCardClassName =
  "rounded-[var(--subpage-card-radius)] [border-width:var(--subpage-card-border-width,1px)] border-solid border-[color:var(--subpage-card-border)] " +
  "[background:var(--subpage-card-bg)] text-[color:var(--subpage-card-text,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2)))] " +
  "shadow-[var(--subpage-card-shadow)]";

export const glassSubpageCardInteractiveClassName =
  `${glassSubpageCardClassName} ` +
  "transition-[background,border-color,box-shadow] duration-200 ease-out " +
  "hover:[background:var(--subpage-card-bg-hover,var(--subpage-card-bg))] hover:border-[color:var(--subpage-card-border-hover,var(--subpage-card-border))] hover:shadow-[var(--subpage-card-shadow-hover,var(--subpage-card-shadow))] " +
  "focus-visible:[background:var(--subpage-card-bg-hover,var(--subpage-card-bg))] focus-visible:border-[color:var(--subpage-card-border-hover,var(--subpage-card-border))] focus-visible:shadow-[var(--subpage-card-shadow-hover,var(--subpage-card-shadow))] " +
  "focus-within:[background:var(--subpage-card-bg-hover,var(--subpage-card-bg))] focus-within:border-[color:var(--subpage-card-border-hover,var(--subpage-card-border))] focus-within:shadow-[var(--subpage-card-shadow-hover,var(--subpage-card-shadow))]";

export const glassSubpageSurfaceScopeClassName =
  "glass-subpage-surface [--glass-modal-text:var(--subpage-card-text,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2)))]";

export const workspaceGuidePanelClassName =
  "workspace-guide-panel glass-subpage-surface [--glass-modal-text:var(--subpage-card-text,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2)))]";

export const workspaceGuidePanelScrollClassName =
  "workspace-guide-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";

export const glassSubpageContentWideClassName =
  "mx-auto w-full max-w-[clamp(31rem,62vw,43rem)] max-[768px]:max-w-none";

export const glassSubpageMobileReadableWidthClassName =
  "max-[768px]:mx-auto max-[768px]:w-full max-[768px]:max-w-[18.75rem]";

export const glassSubpagePanelWideClassName =
  "mx-auto w-full max-w-[min(41rem,100%)] max-[768px]:max-w-none";

export const glassFormInputBaseClassName = pillInputBaseClassName;

export const glassSubpageFieldInputClassName =
  `${glassFormInputBaseClassName} text-[1.28rem] tracking-[0.02em] placeholder:text-[1.12rem] placeholder:tracking-[0.02em] ` +
  "duration-[720ms] max-[768px]:text-[1.34rem] max-[768px]:tracking-[0.024em] max-[768px]:placeholder:text-[1.2rem] max-[768px]:placeholder:tracking-[0.022em] max-[768px]:min-h-[3.2rem] max-[768px]:py-[0.84rem]";
