const GLASS_RING_TILT_KEY = "sotsiaalai:glass-ring-tilt";
let pendingNavigationTimer = null;

function persistGlassRingTilt(options = {}) {
  if (typeof window === "undefined") return;
  if (options?.persistGlassRingTilt === false) return;
  const direction = options?.glassRingTilt;
  if (direction !== "left" && direction !== "right") return;
  try {
    window.sessionStorage.setItem(
      GLASS_RING_TILT_KEY,
      JSON.stringify({
        direction,
        ts: Date.now()
      })
    );
  } catch {}
}

function shouldReduceMotion() {
  if (typeof window === "undefined") return false;
  try {
    if (document?.documentElement?.dataset?.reduceMotion === "1") return true;
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  } catch {
    return false;
  }
}

function resolveNavigationDelayMs(options = {}) {
  const explicitDelay = Number(options?.delayMs);
  if (Number.isFinite(explicitDelay) && explicitDelay > 0) {
    return explicitDelay;
  }
  const wantsTiltDelay =
    options?.waitForGlassRingTilt === true &&
    (options?.glassRingTilt === "left" || options?.glassRingTilt === "right");
  if (!wantsTiltDelay) return 0;
  if (shouldReduceMotion()) return 0;
  return 620;
}

function scheduleNavigation(run, delayMs) {
  if (typeof window === "undefined" || delayMs <= 0) {
    run();
    return;
  }
  if (pendingNavigationTimer) {
    window.clearTimeout(pendingNavigationTimer);
    pendingNavigationTimer = null;
  }
  pendingNavigationTimer = window.setTimeout(() => {
    pendingNavigationTimer = null;
    run();
  }, delayMs);
}

export function triggerRouteTransition(options = {}) {
  if (typeof window === "undefined") return;
  try {
    persistGlassRingTilt(options);
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:route-transition", {
        detail: options
      })
    );
  } catch {}
}

export function pushWithTransition(router, href, options = {}) {
  triggerRouteTransition({
    href,
    ...options
  });
  scheduleNavigation(() => router.push(href), resolveNavigationDelayMs(options));
}

export function replaceWithTransition(router, href, options = {}) {
  triggerRouteTransition({
    href,
    ...options
  });
  scheduleNavigation(() => router.replace(href), resolveNavigationDelayMs(options));
}
