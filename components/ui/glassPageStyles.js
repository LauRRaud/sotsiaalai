export const glassPageTitleClassName =
  "mt-[clamp(2.15rem,5.4vh,3.25rem)] mb-[clamp(0.35rem,1.4vh,0.8rem)] text-center text-[2.15em] max-[48em]:text-[clamp(2.35rem,9.4vw,3.2rem)] leading-[1.15] tracking-[0.03em] " +
  "max-[48em]:px-[clamp(3rem,12vw,4.2rem)] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
  "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";

export const glassPageShellClassName =
  "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start box-border";

export const glassPageShellCenteredClassName =
  "mx-auto grid w-full min-h-[100dvh] place-items-center box-border";

export const glassPageBackClassName =
  "absolute left-[max(0px,calc(var(--glass-edge-left)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2 max-[48em]:hidden";

export const glassPageBackMobileCornerClassName =
  `${glassPageBackClassName} ` +
  "max-[48em]:!inline-flex max-[48em]:top-auto max-[48em]:left-[calc(env(safe-area-inset-left,0px)+0.2rem)] " +
  "max-[48em]:bottom-[calc(env(safe-area-inset-bottom,0px)+0.2rem)] max-[48em]:translate-y-0 " +
  "max-[48em]:h-[3.2rem] max-[48em]:w-[3.2rem] max-[48em]:z-[92] " +
  "max-[48em]:[&>span]:h-[3.2rem] max-[48em]:[&>span]:w-[3.2rem]";

export const glassPageBackRightClassName =
  "absolute right-[max(0px,calc(var(--glass-edge-right)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2";

export const glassPageCloseClassName =
  "glass-mobile-only-close text-[#c57171] opacity-90 light:text-[#7a3a38]";

export const glassPageRingCenteredClassName =
  "glass-ring md:mt-0 md:mb-0 [--ring-ui-reserve:var(--ring-ui-reserve-page)]";
