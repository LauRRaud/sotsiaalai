function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toNonNegativePixel(value) {
  return Math.max(0, Math.round(toFiniteNumber(value, 0)));
}

function resolveViewportExtent({
  currentViewportExtent,
  visualViewportHeight,
  visualViewportOffsetTop,
  layoutViewportHeight
}) {
  const explicitExtent = toNonNegativePixel(currentViewportExtent);
  if (explicitExtent > 0) return explicitExtent;

  const visualHeight = toFiniteNumber(visualViewportHeight, 0);
  if (visualHeight > 0) {
    return toNonNegativePixel(visualHeight + toFiniteNumber(visualViewportOffsetTop, 0));
  }

  return toNonNegativePixel(layoutViewportHeight);
}

function resolveMaxKeyboardOffset({ baselineViewportExtent, layoutViewportHeight }) {
  const viewport = Math.max(
    toNonNegativePixel(baselineViewportExtent),
    toNonNegativePixel(layoutViewportHeight)
  );
  return Math.round(viewport * 0.55);
}

function resolveFallbackKeyboardOffset({
  baselineViewportExtent,
  baselineContainerHeight,
  currentViewportExtent,
  currentContainerHeight,
  layoutViewportHeight
}) {
  const rawOffset = Math.max(
    toNonNegativePixel(toFiniteNumber(layoutViewportHeight, 0) - currentViewportExtent),
    toNonNegativePixel(toFiniteNumber(baselineViewportExtent, 0) - currentViewportExtent)
  );
  const layoutHandledOffset =
    toFiniteNumber(baselineContainerHeight, 0) > 0 &&
    toFiniteNumber(currentContainerHeight, 0) > 0 &&
    toNonNegativePixel(currentContainerHeight) <= currentViewportExtent + 8
      ? toNonNegativePixel(toFiniteNumber(baselineContainerHeight, 0) - toFiniteNumber(currentContainerHeight, 0))
      : 0;

  return Math.max(0, rawOffset - layoutHandledOffset);
}

export function resolveMobileChatKeyboardOffset(metrics = {}) {
  const currentViewportExtent = resolveViewportExtent(metrics);
  const maxReasonable = resolveMaxKeyboardOffset(metrics);
  if (currentViewportExtent <= 0 || maxReasonable <= 0) return 0;

  const containerBottom = toFiniteNumber(metrics.currentContainerBottom, Number.NaN);
  const viewportOverlapOffset = Number.isFinite(containerBottom)
    ? toNonNegativePixel(containerBottom - currentViewportExtent)
    : Number.NaN;

  const offset = Number.isFinite(viewportOverlapOffset)
    ? viewportOverlapOffset
    : resolveFallbackKeyboardOffset({
        ...metrics,
        currentViewportExtent
      });

  return Math.min(offset, maxReasonable);
}

export function resolveStableDisplayMode(previousMode, detectedMode) {
  const previous = String(previousMode || "").trim();
  const detected = String(detectedMode || "browser").trim() || "browser";
  if ((previous === "standalone" || previous === "fullscreen") && detected === "browser") {
    return previous;
  }
  return detected;
}
