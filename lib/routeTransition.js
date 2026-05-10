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

function resolveNavigationDelayMs(options = {}) {
  const additionalDelay = Number(options?.additionalDelayMs);
  const extraDelayMs =
    Number.isFinite(additionalDelay) && additionalDelay > 0
      ? additionalDelay
      : 0;
  const explicitDelay = Number(options?.delayMs);
  if (Number.isFinite(explicitDelay) && explicitDelay > 0) {
    return explicitDelay + extraDelayMs;
  }
  return extraDelayMs;
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

export function backWithTransition(router, options = {}) {
  triggerRouteTransition({
    ...options
  });
  scheduleNavigation(() => router.back(), resolveNavigationDelayMs(options));
}

export function runWithTransition(run, options = {}) {
  triggerRouteTransition({
    ...options
  });
  scheduleNavigation(run, resolveNavigationDelayMs(options));
}
