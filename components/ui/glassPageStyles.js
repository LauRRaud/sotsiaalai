export const glassPageTitleClassName =
  "mt-[clamp(2.15rem,5.4vh,3.25rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] " +
  "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
  "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";

export const glassPageShellClassName =
  "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start box-border";

export const glassPageShellCenteredClassName =
  "mx-auto grid w-full min-h-[100dvh] place-items-center box-border";

export const glassPageBackClassName =
  "absolute left-[var(--glass-edge-left)] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2";

export const glassPageBackRightClassName =
  "absolute right-[var(--glass-edge-right)] top-[calc(50%+var(--glass-center-offset,0px))] -translate-y-1/2";

export const glassPageRingCenteredClassName =
  "md:mt-0 md:mb-0 [--ring-ui-reserve:var(--ring-ui-reserve-page)]";
