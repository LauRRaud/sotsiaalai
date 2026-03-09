export const glassPageTitleClassName =
  "glass-page-title mt-[clamp(2.15rem,5.4vh,3.25rem)] mb-[clamp(0.35rem,1.4vh,0.8rem)] text-center text-[2.15em] max-[768px]:text-[clamp(1.98rem,7.9vw,2.64rem)] leading-[1.12] tracking-[0.03em] " +
  "w-full max-w-full max-[768px]:mx-auto max-[768px]:whitespace-normal max-[768px]:[text-wrap:balance] max-[768px]:[overflow-wrap:normal] max-[768px]:[word-break:normal] max-[768px]:hyphens-none max-[768px]:px-[var(--glass-mobile-title-inline-pad,clamp(3.95rem,15vw,5.1rem))] max-[768px]:tracking-[0.008em] max-[768px]:leading-[1.06] max-[768px]:mt-[calc(env(safe-area-inset-top,0px)+4.05rem)] max-[768px]:mb-[clamp(0.2rem,0.9vh,0.55rem)] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
  "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";

export const glassPageTitleMobileHeaderClassName =
  "max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+2.3rem)] max-[768px]:!mb-[clamp(0.24rem,1vh,0.58rem)] " +
  "max-[768px]:!px-[var(--glass-mobile-title-inline-pad,clamp(4.15rem,16.5vw,5.35rem))] max-[768px]:!whitespace-normal max-[768px]:!leading-[1.04] " +
  "max-[768px]:!tracking-[0.012em] max-[768px]:[text-wrap:balance]";

export const glassPageTitleProminentClassName =
  "min-[769px]:!text-[2.6rem] max-[768px]:!text-[clamp(2.28rem,9.25vw,3.08rem)]";

export const glassPageShellClassName =
  "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start box-border";

export const glassPageShellCenteredClassName =
  "mx-auto grid w-full min-h-[100dvh] place-items-center box-border " +
  "max-[768px]:flex max-[768px]:flex-col max-[768px]:items-center max-[768px]:justify-start";

export const glassPageBackClassName =
  "absolute left-[max(0px,calc(var(--glass-edge-left)-clamp(0.72rem,1.35vw,1.12rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2 min-[768px]:-translate-x-[0.42rem] max-[768px]:hidden min-[768px]:opacity-[0.85] light:min-[768px]:opacity-100";

export const glassPageBackMobileCornerClassName =
  `${glassPageBackClassName} ` +
  "max-[768px]:!inline-flex max-[768px]:top-auto max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.2rem)] " +
  "max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+0.2rem)] max-[768px]:translate-y-0 " +
  "max-[768px]:h-[3.45rem] max-[768px]:w-[3.45rem] max-[768px]:z-[92] " +
  "max-[768px]:[&>svg]:h-[3.45rem] max-[768px]:[&>svg]:w-[3.45rem]";

export const glassPageBackMobileBottomCenterClassName =
  `${glassPageBackClassName} ` +
  "max-[768px]:!inline-flex max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.2rem)] max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] " +
  "max-[768px]:translate-x-0 max-[768px]:translate-y-0 max-[768px]:bottom-auto " +
  "max-[768px]:h-[4.85rem] max-[768px]:w-[4.85rem] max-[768px]:z-[92] " +
  "max-[768px]:[&>svg]:h-[4.85rem] max-[768px]:[&>svg]:w-[4.85rem]";

export const glassPageBackTopLeftClassName =
  `${glassPageBackMobileBottomCenterClassName} ` +
  "min-[769px]:top-[0.55rem] min-[769px]:left-[0.55rem] min-[769px]:bottom-auto " +
  "min-[769px]:translate-x-0 min-[769px]:translate-y-0 min-[769px]:!h-[4rem] min-[769px]:!w-[4rem] " +
  "min-[769px]:[&>svg]:!h-[4rem] min-[769px]:[&>svg]:!w-[4rem]";

export const glassPageBackRightClassName =
  "absolute right-[max(0px,calc(var(--glass-edge-right)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2";

export const glassPageCloseClassName =
  "glass-mobile-only-close text-[#c57171] opacity-90 light:text-[#7a3a38]";

export const glassPageRingCenteredClassName =
  "glass-ring md:mt-0 md:mb-0 [--ring-ui-reserve:var(--ring-ui-reserve-page)]";

export const glassPageMobileCardClassName =
  "max-[768px]:!w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!max-w-none max-[768px]:!h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] " +
  "max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+var(--mobile-glass-card-gap,0.35rem))] " +
  "max-[768px]:!mr-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-right,0px))] " +
  "max-[768px]:!mb-[calc(env(safe-area-inset-bottom,0px)+var(--mobile-glass-card-gap,0.35rem))] " +
  "max-[768px]:!ml-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] " +
  "max-[768px]:!rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] " +
  "max-[768px]:!px-[var(--glass-ring-pad-x,clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem))))] " +
  "max-[768px]:!pt-[var(--glass-ring-pad-top,clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem))))] " +
  "max-[768px]:!pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)]";
