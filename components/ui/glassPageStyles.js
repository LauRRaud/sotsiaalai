export const glassPageTitleClassName =
  "mt-[clamp(2.15rem,5.4vh,3.25rem)] mb-[clamp(0.35rem,1.4vh,0.8rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
  "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";

export const glassPageShellClassName =
  "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start box-border";

export const glassPageShellCenteredClassName =
  "mx-auto grid w-full min-h-[100dvh] place-items-center box-border";

export const glassPageBackClassName =
  "absolute left-[max(0px,calc(var(--glass-edge-left)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2 max-[48em]:hidden";

export const glassPageBackRightClassName =
  "absolute right-[max(0px,calc(var(--glass-edge-right)-clamp(0.35rem,0.9vw,0.7rem)))] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2";

export const glassPageCloseClassName =
  "hidden max-[48em]:fixed max-[48em]:top-[calc(env(safe-area-inset-top,0px)+0.5rem)] max-[48em]:right-[calc(env(safe-area-inset-right,0px)+0.6rem)] max-[48em]:z-[90] max-[48em]:inline-flex max-[48em]:text-[#c57171] max-[48em]:opacity-90 light:max-[48em]:text-[#7a3a38]";

export const glassPageRingCenteredClassName =
  "glass-ring md:mt-0 md:mb-0 [--ring-ui-reserve:var(--ring-ui-reserve-page)]";
