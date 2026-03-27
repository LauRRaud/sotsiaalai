"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import BackIcon from "@/components/ui/icons/BackIcon";

const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const PRESS_LOCK_MS = 620;

const baseClassName =
  "back-button inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center " +
  "bg-transparent p-0 border-0 cursor-[var(--cursor-pointer)] " +
  "group focus-visible:outline-none";

const iconClassName =
  "transform-gpu will-change-transform transition-transform duration-[260ms] " +
  "ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.08] " +
  "group-focus-visible:scale-[1.08] group-active:scale-[0.98]";

const BackButton = forwardRef(function BackButton({
  onClick,
  ariaLabel,
  className,
  iconClassName: iconClassNameProp,
  holdPressedVisualDisabled = false,
  onPointerDown,
  onKeyDown,
  ...props
}, ref) {
  const [isRouteTilting, setIsRouteTilting] = useState(false);
  const [isPressLocked, setIsPressLocked] = useState(false);
  const pressLockTimerRef = useRef(null);

  const clearPressLockTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!pressLockTimerRef.current) return;
    window.clearTimeout(pressLockTimerRef.current);
    pressLockTimerRef.current = null;
  }, []);

  const lockPressedState = useCallback((durationMs = PRESS_LOCK_MS) => {
    if (holdPressedVisualDisabled) return;
    setIsPressLocked(true);
    if (typeof window === "undefined") return;
    clearPressLockTimer();
    pressLockTimerRef.current = window.setTimeout(() => {
      pressLockTimerRef.current = null;
      setIsPressLocked(false);
    }, durationMs);
  }, [clearPressLockTimer, holdPressedVisualDisabled]);

  useEffect(() => {
    if (holdPressedVisualDisabled || typeof window === "undefined") return;
    const onTiltState = event => {
      setIsRouteTilting(Boolean(event?.detail?.active));
    };
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    return () => {
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    };
  }, [holdPressedVisualDisabled]);

  useEffect(
    () => () => {
      clearPressLockTimer();
    },
    [clearPressLockTimer]
  );

  const holdPressedVisual =
    !holdPressedVisualDisabled && (isRouteTilting || isPressLocked);

  const handlePointerDown = event => {
    lockPressedState();
    onPointerDown?.(event);
  };

  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      lockPressedState();
    }
    onKeyDown?.(event);
  };

  const handleClick = event => {
    lockPressedState();
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={cn(baseClassName, className)}
      {...props}
    >
      <BackIcon
        className={cn(
          iconClassName,
          holdPressedVisual
            ? "scale-[0.98] duration-[460ms] ease-[cubic-bezier(0.42,0,0.58,1)] group-hover:scale-[0.98] group-focus-visible:scale-[0.98]"
            : null,
          iconClassNameProp
        )}
      />
    </button>
  );
});

BackButton.displayName = "BackButton";

export default BackButton;
