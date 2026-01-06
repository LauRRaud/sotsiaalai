import { useLayoutEffect } from "react";

/**
 * useChatInputHoleMask
 * - Arvutab chat containerile CSS maski, mis "lõikab augu" input bari kohale.
 * - Set'ib CSS var: --chat-input-hole-mask
 *
 * enabled = false => eemaldab var'i ja ei seo observereid
 */
export function useChatInputHoleMask({ containerRef, inputBarRef, enabled }) {
  useLayoutEffect(() => {
    const box = containerRef?.current;
    const inputBar = inputBarRef?.current;
    if (!box || !inputBar) return;

    if (!enabled) {
      box.style.removeProperty("--chat-input-hole-mask");
      return;
    }

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = (svg) =>
      `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

    let lastMask = "";
    let raf = 0;

    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [
        `M ${x + r} ${y}`,
        `H ${right - r}`,
        `A ${r} ${r} 0 0 1 ${right} ${y + r}`,
        `V ${bottom - r}`,
        `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
        `H ${x + r}`,
        `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`,
        `V ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        "Z",
      ].join(" ");
    };

    const updateMask = () => {
      const boxRect = box.getBoundingClientRect();
      const inputRect = inputBar.getBoundingClientRect();
      if (!boxRect.width || !boxRect.height) return;
      if (!inputRect.width || !inputRect.height) return;

      const boxW = Math.round(boxRect.width);
      const boxH = Math.round(boxRect.height);

      const toLocal = (rect) => ({
        x: Math.round(clamp(rect.left - boxRect.left, 0, boxW)),
        y: Math.round(clamp(rect.top - boxRect.top, 0, boxH)),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });

      const inputLocal = toLocal(inputRect);

      const radiusRaw = Number.parseFloat(
        window.getComputedStyle(inputBar).borderTopLeftRadius
      );
      const radius = Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2;

      const outerPath = `M 0 0 H ${boxW} V ${boxH} H 0 Z`;

      const holePad = 0;
      const holeX = clamp(inputLocal.x - holePad, 0, boxW);
      const holeY = clamp(inputLocal.y - holePad, 0, boxH);
      const holeW = clamp(inputLocal.w + holePad * 2, 0, boxW - holeX);
      const holeH = clamp(inputLocal.h + holePad * 2, 0, boxH - holeY);

      const holePath = roundedRectPath(
        holeX,
        holeY,
        holeW,
        holeH,
        radius + holePad
      );

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxW} ${boxH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      const mask = encodeSvgMask(svg);

      if (mask !== lastMask) {
        box.style.setProperty("--chat-input-hole-mask", mask);
        lastMask = mask;
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateMask);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    box.addEventListener("scroll", scheduleUpdate);

    let ro;
    let mo;

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(inputBar);
    }

    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(scheduleUpdate);
      mo.observe(box, { childList: true, subtree: true });
    }

    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleUpdate);
      box.removeEventListener("scroll", scheduleUpdate);
      ro?.disconnect?.();
      mo?.disconnect?.();
    };
  }, [containerRef, inputBarRef, enabled]);
}
