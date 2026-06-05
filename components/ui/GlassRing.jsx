import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

const baseStyles =
  "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] " +
  "min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] " +
  "max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] " +
  "flex-col items-center rounded-[var(--glass-ring-radius,9999px)] " +
  "bg-[color:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] " +
  "text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-blur-radius,1rem)] " +
  "overflow-hidden " +
  "[--glass-ring-pad-x:clamp(calc(1.8*var(--base-rem)),5vw,calc(3.2*var(--base-rem)))] " +
  "[--glass-ring-pad-top:clamp(calc(1.6*var(--base-rem)),4.2vw,calc(2.6*var(--base-rem)))] " +
  "[--glass-ring-pad-top-half:clamp(calc(0.8*var(--base-rem)),2.1vw,calc(1.3*var(--base-rem)))] " +
  "px-[var(--glass-ring-pad-x)] pt-[var(--glass-ring-pad-top)] " +
  "mx-auto " +
  "max-md:[--glass-mobile-gap:var(--mobile-glass-card-gap,0.35rem)] " +
  "max-md:[--glass-mobile-safe-top:env(safe-area-inset-top,0px)] " +
  "max-md:[--glass-mobile-safe-bottom:env(safe-area-inset-bottom,0px)] " +
  "max-md:[--glass-ring-radius:var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] " +
  "max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto " +
  "max-md:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-var(--glass-mobile-gap)-var(--glass-mobile-gap))] " +
  "max-md:max-w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-var(--glass-mobile-gap)-var(--glass-mobile-gap))] " +
  "max-md:[--glass-mobile-height:calc(var(--glass-mobile-root-vh,100dvh)-var(--glass-mobile-safe-top)-var(--glass-mobile-safe-bottom)-var(--glass-mobile-gap)-var(--glass-mobile-gap))] " +
  "max-md:h-[var(--glass-mobile-height)] " +
  "max-md:max-h-[var(--glass-mobile-height)] " +
  "max-md:overflow-hidden " +
  "max-md:[--glass-ring-pad-top:clamp(calc(0.4*var(--base-rem)),1.4vh,calc(1.1*var(--base-rem)))] " +
  "max-md:[--glass-ring-pad-top-half:clamp(calc(0.2*var(--base-rem)),0.7vh,calc(0.55*var(--base-rem)))] " +
  "[--glass-edge-left:calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] " +
  "[--glass-edge-right:calc(var(--hud-edge-right,0px)+clamp(0.1rem,1.2vw,0.8rem))]";

const ROUTE_TILT_EVENT = "sotsiaalai:route-transition";
const ROUTE_TILT_KEY = "sotsiaalai:glass-ring-tilt";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const ROUTE_TILT_MS = 540;
const ROUTE_TILT_MAX_AGE_MS = 1800;
const TILT_ACTIVE_COUNT_KEY = "__SOTSIAALAI_GLASS_RING_TILT_COUNT";
const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";

function updateGlobalTiltState(windowRef, activate) {
  if (!windowRef) return false;
  const currentCount = Number(windowRef[TILT_ACTIVE_COUNT_KEY]) || 0;
  const nextCount = activate
    ? currentCount + 1
    : Math.max(0, currentCount - 1);
  windowRef[TILT_ACTIVE_COUNT_KEY] = nextCount;
  const isActive = nextCount > 0;
  windowRef[TILT_ACTIVE_FLAG_KEY] = isActive;
  try {
    windowRef.dispatchEvent(
      new CustomEvent(ROUTE_TILT_STATE_EVENT, {
        detail: { active: isActive }
      })
    );
  } catch {}
  return isActive;
}

const GlassRing = forwardRef(function GlassRing(
  { as: Component = "div", className, children, style, ...props },
  ref
) {
  const [tiltDirection, setTiltDirection] = useState(null);
  const clearTimerRef = useRef(null);
  const localRef = useRef(null);
  const tiltLeaseActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionReduced =
      document?.documentElement?.dataset?.reduceMotion === "1" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (motionReduced) return;

    const clearTimer = () => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };

    const startTilt = direction => {
      if (direction !== "left" && direction !== "right") return;
      clearTimer();
      setTiltDirection(null);
      if (!tiltLeaseActiveRef.current) {
        tiltLeaseActiveRef.current = true;
        updateGlobalTiltState(window, true);
      }
      window.requestAnimationFrame(() => {
        setTiltDirection(direction);
        clearTimerRef.current = window.setTimeout(() => {
          setTiltDirection(null);
          if (tiltLeaseActiveRef.current) {
            tiltLeaseActiveRef.current = false;
            updateGlobalTiltState(window, false);
          }
          clearTimerRef.current = null;
        }, ROUTE_TILT_MS);
      });
    };

    const readPendingTilt = () => {
      try {
        const raw = window.sessionStorage.getItem(ROUTE_TILT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const direction = parsed?.direction;
        const ts = Number(parsed?.ts);
        if (direction !== "left" && direction !== "right") {
          window.sessionStorage.removeItem(ROUTE_TILT_KEY);
          return null;
        }
        if (!Number.isFinite(ts) || Date.now() - ts > ROUTE_TILT_MAX_AGE_MS) {
          window.sessionStorage.removeItem(ROUTE_TILT_KEY);
          return null;
        }
        window.sessionStorage.removeItem(ROUTE_TILT_KEY);
        return direction;
      } catch {
        return null;
      }
    };
    const onRouteTransition = event => {
      const detail = event?.detail ?? {};
      if (detail?.workspacePanelMorph) return;
      const nextDirection = detail?.glassRingTilt;
      startTilt(nextDirection);
    };

    // Route dispatch may happen before this component is mounted on the next page.
    // Read the latest short-lived direction marker so the tilt is still guaranteed.
    startTilt(readPendingTilt());

    window.addEventListener(ROUTE_TILT_EVENT, onRouteTransition);
    return () => {
      window.removeEventListener(ROUTE_TILT_EVENT, onRouteTransition);
      clearTimer();
      if (tiltLeaseActiveRef.current) {
        tiltLeaseActiveRef.current = false;
        updateGlobalTiltState(window, false);
      }
    };
  }, []);

  const incomingStyle = style;
  const animationName =
    tiltDirection === "right"
      ? "glassRingTiltFromRight"
      : tiltDirection === "left"
        ? "glassRingTiltFromLeft"
        : null;
  const animations = [];
  if (animationName) {
    animations.push(
      `${animationName} ${ROUTE_TILT_MS}ms cubic-bezier(0.42,0,0.58,1) both`
    );
  }
  const mergedStyle =
    animations.length > 0
      ? {
          ...(incomingStyle || {}),
          animation: animations.join(", "),
          transformOrigin: "50% 50%",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden"
        }
      : incomingStyle;

  const setRefs = node => {
    localRef.current = node;
    if (typeof ref === "function") {
      ref(node);
      return;
    }
    if (ref && typeof ref === "object") {
      ref.current = node;
    }
  };

  const content = (
    <Component
      ref={setRefs}
      className={cn(baseStyles, className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </Component>
  );

  return content;
});

export default GlassRing;
