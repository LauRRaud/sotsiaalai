import { forwardRef } from "react";
import { cn } from "@/components/ui/cn";

const baseStyles =
  "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] " +
  "min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] " +
  "max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] " +
  "flex-col items-center rounded-full " +
  "bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] " +
  "text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] " +
  "light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] " +
  "overflow-hidden " +
  "px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] " +
  "md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto " +
  "max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] " +
  "max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible " +
  "max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)] " +
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
