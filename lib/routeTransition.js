export function triggerRouteTransition(options = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("sotsiaalai:route-transition", {
        detail: options,
      }),
    );
  } catch {}
}

export function pushWithTransition(router, href, options = {}) {
  triggerRouteTransition({ href, ...options });
  router.push(href);
}

export function replaceWithTransition(router, href, options = {}) {
  triggerRouteTransition({ href, ...options });
  router.replace(href);
}
