import { useLayoutEffect } from "react";
export function useChatInputHoleMask({
  containerRef,
  inputBarRef,
  enabled
}) {
  useLayoutEffect(() => {
    const box = containerRef?.current;
    const inputBar = inputBarRef?.current;
    if (!box || !inputBar) return;
    const rollCard = box.closest?.(".chat-roll-card");
    if (!enabled) {
      box.style.removeProperty("--chat-input-hole-mask");
      return;
    }
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const getLocalRect = (el, root) => {
      if (!el || !root) return null;
      const w = el.offsetWidth || Math.round(el.getBoundingClientRect().width);
      const h = el.offsetHeight || Math.round(el.getBoundingClientRect().height);
      if (!w || !h) return null;
      let x = 0;
      let y = 0;
      let node = el;
      while (node && node !== root) {
        x += node.offsetLeft || 0;
        y += node.offsetTop || 0;
        node = node.offsetParent;
      }
      if (node !== root) {
        const rootRect = root.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        x = rect.left - rootRect.left;
        y = rect.top - rootRect.top;
      }
      return {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h)
      };
    };
    let lastMask = "";
    let lastRollMask = "";
    let raf = 0;
    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [`M ${x + r} ${y}`, `H ${right - r}`, `A ${r} ${r} 0 0 1 ${right} ${y + r}`, `V ${bottom - r}`, `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`, `H ${x + r}`, `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`, `V ${y + r}`, `A ${r} ${r} 0 0 1 ${x + r} ${y}`, "Z"].join(" ");
    };
    const buildMask = (rootW, rootH, holeRect, radius) => {
      if (!rootW || !rootH || !holeRect?.w || !holeRect?.h) return null;
      const outerPath = `M 0 0 H ${rootW} V ${rootH} H 0 Z`;
      const holePad = 0;
      const holeX = clamp(holeRect.x - holePad, 0, rootW);
      const holeY = clamp(holeRect.y - holePad, 0, rootH);
      const holeW = clamp(holeRect.w + holePad * 2, 0, rootW - holeX);
      const holeH = clamp(holeRect.h + holePad * 2, 0, rootH - holeY);
      const holePath = roundedRectPath(holeX, holeY, holeW, holeH, radius + holePad);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rootW} ${rootH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      return encodeSvgMask(svg);
    };
    const updateMask = () => {
      const boxW = Math.round(box.offsetWidth || box.getBoundingClientRect().width);
      const boxH = Math.round(box.offsetHeight || box.getBoundingClientRect().height);
      if (!boxW || !boxH) return;
      const inputLocal = getLocalRect(inputBar, box);
      if (!inputLocal) return;
      const rollW = rollCard ? Math.round(rollCard.offsetWidth || rollCard.getBoundingClientRect().width) : 0;
      const rollH = rollCard ? Math.round(rollCard.offsetHeight || rollCard.getBoundingClientRect().height) : 0;
      const inputLocalRoll = rollCard ? getLocalRect(inputBar, rollCard) : null;
      const radiusRaw = Number.parseFloat(window.getComputedStyle(inputBar).borderTopLeftRadius);
      const radius = Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2;
      const mask = buildMask(boxW, boxH, inputLocal, radius);
      const rollMask = rollCard ? buildMask(rollW, rollH, inputLocalRoll, radius) : null;
      if (mask && mask !== lastMask) {
        box.style.setProperty("--chat-input-hole-mask", mask);
        lastMask = mask;
      }
      if (rollCard && rollMask && rollMask !== lastRollMask) {
        rollCard.style.setProperty("--roll-hole-mask-chat", rollMask);
        lastRollMask = rollMask;
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
      mo.observe(box, {
        childList: true,
        subtree: true
      });
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