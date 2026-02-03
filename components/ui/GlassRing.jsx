import { forwardRef } from "react";
import { cn } from "@/components/ui/cn";

const baseStyles =
  "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] " +
  "min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] " +
  "max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] " +
  "flex-col items-center rounded-full " +
  "bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] " +
  "text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-blur-radius,1rem)] " +
  "overflow-hidden " +
  "[--glass-ring-pad-x:clamp(1.8rem,5vw,3.2rem)] " +
  "[--glass-ring-pad-top:clamp(1.6rem,4.2vw,2.6rem)] " +
  "[--glass-ring-pad-top-half:clamp(0.8rem,2.1vw,1.3rem)] " +
  "px-[var(--glass-ring-pad-x)] pt-[var(--glass-ring-pad-top)] " +
  "md:mx-auto " +
  "max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] " +
  "max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible " +
  "max-md:[--glass-ring-pad-top:clamp(0.4rem,1.4vh,1.1rem)] " +
  "max-md:[--glass-ring-pad-top-half:clamp(0.2rem,0.7vh,0.55rem)] " +
  "[--glass-edge-left:calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] " +
  "[--glass-edge-right:calc(var(--hud-edge-right,0px)+clamp(0.1rem,1.2vw,0.8rem))]";

const GlassRing = forwardRef(function GlassRing(
  { as: Component = "div", className, children, ...props },
  ref
) {
  return (
    <Component ref={ref} className={cn(baseStyles, className)} {...props}>
      {children}
    </Component>
  );
});

export default GlassRing;
