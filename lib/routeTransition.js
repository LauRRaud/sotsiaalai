const GLASS_RING_TILT_KEY = "sotsiaalai:glass-ring-tilt";
const GLASS_RING_TILT_NAVIGATION_DELAY_MS = 540;
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
  if (typeof window !== "undefined" && options?.workspacePanelMorph) {
    const mobileWorkspace =
      window.matchMedia?.("(max-width: 768px)")?.matches ||
      window.innerWidth <= 768 ||
      (typeof document !== "undefined" &&
        (document.documentElement?.getAttribute("data-layout") === "mobile" ||
          document.body?.getAttribute("data-layout") === "mobile"));
    if (mobileWorkspace) return 0;
  }
  const additionalDelay = Number(options?.additionalDelayMs);
  const extraDelayMs =
    Number.isFinite(additionalDelay) && additionalDelay > 0
      ? additionalDelay
      : 0;
  const explicitDelay = Number(options?.delayMs);
  const baseDelayMs =
    Number.isFinite(explicitDelay) && explicitDelay > 0
      ? explicitDelay
      : options?.waitForGlassRingTilt === true &&
          (options?.glassRingTilt === "left" || options?.glassRingTilt === "right")
        ? GLASS_RING_TILT_NAVIGATION_DELAY_MS
        : 0;
  return baseDelayMs + extraDelayMs;
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
