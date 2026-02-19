export const glassPolicyRingClassName =
  "glass-ring-expandable [--glass-ring-pad-top:clamp(0.2rem,1.1vh,0.8rem)] [--ring-diameter:var(--chat-diameter)] [--glass-ring-scroll-offset:clamp(1.45rem,3vh,2rem)] " +
  "max-[48em]:[--glass-ring-scroll-offset:clamp(1.9rem,4.6vh,2.9rem)] " +
  "max-[48em]:[--glass-ring-scroll-offset-open:clamp(0.95rem,2.4vh,1.6rem)]";

export const glassPolicyTitleOffsetClassName =
  "mt-[clamp(0.6rem,1.6vh,1.2rem)] max-[48em]:mt-[calc(env(safe-area-inset-top,0px)+4.05rem)] max-[48em]:mb-[clamp(0.2rem,0.8vh,0.55rem)]";

export const glassPolicyContentClassName =
  "glass-policy-content mt-[clamp(0.4rem,1.6vh,1.1rem)] flex w-full flex-1 flex-col items-center max-[48em]:w-full max-[48em]:max-w-full max-[48em]:px-[clamp(0rem,1vw,0.25rem)] max-[48em]:pt-[clamp(0.25rem,1.1vh,0.65rem)] max-[48em]:pb-[clamp(0.05rem,0.45vh,0.25rem)]";

export const glassPolicyScrollClassName =
  "glass-ring-scroll glass-policy-scroll glass-policy-scroll-bottom-arc relative w-full max-w-[clamp(18.8rem,48.5vw,33rem)] overflow-y-auto pr-[0.1rem] pt-[clamp(1rem,2.4vh,1.6rem)] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 max-[48em]:max-h-[calc(100%-0.35rem)] max-[48em]:translate-x-0 max-[48em]:w-full max-[48em]:max-w-full max-[48em]:px-[clamp(0rem,1vw,0.25rem)] max-[48em]:pt-[clamp(0.5rem,1.8vh,1.05rem)] max-[48em]:pb-[clamp(0.02rem,0.35vh,0.18rem)]";

export const glassPolicyExpandToggleClassName =
  "glass-ring-expand-toggle glass-ring-expand-toggle--overlay max-[48em]:hidden";

export const glassPolicyBackButtonClassName =
  "glass-policy-back glass-policy-back--compact hidden min-[48.0625em]:inline-flex";
