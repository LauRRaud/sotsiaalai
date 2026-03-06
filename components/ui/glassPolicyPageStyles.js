export const glassPolicyRingClassName =
  "glass-ring-expandable glass-policy-expand-shape [--glass-ring-pad-top:clamp(calc(0.2*var(--base-rem)),1.1vh,calc(0.8*var(--base-rem)))] min-[768px]:[--ring-scale:1] min-[768px]:[--ring-fit-pad:calc(1.3*var(--base-rem))] min-[768px]:[--ring-ui-reserve-page:calc(2*var(--base-rem))] min-[768px]:[--ring-base-min:calc(36*var(--base-rem))] min-[768px]:[--ring-base-max:calc(54*var(--base-rem))] min-[768px]:[--ring-desktop-max:calc(58*var(--base-rem))] min-[768px]:[--ring-pad-x:clamp(calc(1.8*var(--base-rem)),calc(var(--ring-diameter,var(--ring-diameter-default))*0.05),calc(3.2*var(--base-rem)))] min-[768px]:[--ring-pad-top:clamp(calc(1.6*var(--base-rem)),4.2vw,calc(2.6*var(--base-rem)))] min-[768px]:[--ring-pad-top-half:clamp(calc(0.8*var(--base-rem)),2.1vw,calc(1.3*var(--base-rem)))] [--glass-ring-scroll-offset:clamp(1.45rem,3vh,2rem)] " +
  "[--policy-scroll-rise:clamp(0.55rem,1.25vh,0.9rem)] [--policy-first-line-drop:clamp(0.55rem,1.2vh,0.88rem)] " +
  "max-[768px]:[--glass-ring-scroll-offset:clamp(1.9rem,4.6vh,2.9rem)] " +
  "max-[768px]:[--glass-ring-scroll-offset-open:clamp(0.95rem,2.4vh,1.6rem)]";

export const glassPolicyTitleOffsetClassName =
  "!mt-[clamp(2.6rem,5.5vh,3.7rem)] max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+3.7rem)] max-[768px]:mb-[clamp(0.16rem,0.65vh,0.45rem)]";

export const glassPolicyTitleExpandedClassName = "glass-policy-title--expanded";

export const glassPolicyContentClassName =
  "glass-policy-content mt-[clamp(0.18rem,1.1vh,0.75rem)] flex w-full flex-1 flex-col items-center max-[768px]:w-full max-[768px]:max-w-full max-[768px]:px-[clamp(0rem,1vw,0.25rem)] max-[768px]:pt-[clamp(0.12rem,0.7vh,0.42rem)] max-[768px]:pb-[clamp(0.05rem,0.45vh,0.25rem)]";

export const glassPolicyContentExpandedClassName = "glass-policy-content--expanded";

export const glassPolicyScrollClassName =
  "glass-ring-scroll glass-policy-scroll glass-policy-scroll-bottom-arc relative w-full max-w-[var(--policy-scroll-max-width,clamp(18.8rem,48.5vw,33rem))] overflow-y-auto pr-[0.1rem] pt-[clamp(0.7rem,1.8vh,1.2rem)] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 max-[768px]:max-h-[calc(100%-0.35rem)] max-[768px]:translate-x-0 max-[768px]:w-full max-[768px]:max-w-full max-[768px]:px-[clamp(0rem,1vw,0.25rem)] max-[768px]:pt-[clamp(0.25rem,1vh,0.7rem)] max-[768px]:pb-[clamp(0.02rem,0.35vh,0.18rem)]";

export const glassPolicyScrollExpandedClassName = "glass-policy-scroll--expanded";

export const glassPolicyExpandToggleClassName =
  "glass-ring-expand-toggle glass-ring-expand-toggle--overlay max-[768px]:hidden";

export const glassPolicyBackButtonClassName =
  "glass-policy-back glass-policy-back--compact hidden min-[769px]:inline-flex min-[769px]:!-translate-x-[0.74rem]";
