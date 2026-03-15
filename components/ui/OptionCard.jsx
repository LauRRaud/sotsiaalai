import { cn } from "@/components/ui/cn";
import { useLayoutEffect, useRef } from "react";
const baseCard = "relative overflow-hidden flex items-center gap-[0.45rem] rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,box-shadow,transform] duration-150 ease-out before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:[background:var(--seg-card-bg-hover)] before:opacity-0 before:transition-opacity before:duration-[var(--seg-card-duration,560ms)] before:ease-[var(--seg-card-ease,cubic-bezier(0.22,0.61,0.36,1))] hover:before:opacity-100 hover:text-[color:var(--seg-card-text-hover)] hover:shadow-[var(--seg-card-shadow-hover)] focus-within:before:opacity-100 focus-within:shadow-[var(--seg-card-shadow-hover)] data-[checked=true]:before:opacity-100 [&>*:not(input)]:relative [&>*:not(input)]:z-[1]";
const selectedCard = "text-[color:var(--seg-card-text-selected)]";
const checkboxIndicator = "relative flex h-[var(--seg-control-size,20px)] w-[var(--seg-control-size,20px)] items-center justify-center rounded-[var(--seg-control-radius,0.4rem)] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100";
const visuallyHiddenInputStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  WebkitClipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
  opacity: 0,
  pointerEvents: "none"
};
export default function OptionCard({
  type = "radio",
  name,
  value,
  checked,
  onChange,
  inputRef,
  disabled = false,
  className,
  children,
  fitTextLines,
  fitTextMinPx = 16
}) {
  const internalRef = useRef(null);
  const resolvedRef = inputRef || internalRef;
  const textRef = useRef(null);
  const indicator = type === "checkbox" ? <span aria-hidden="true" className={`${checkboxIndicator} shrink-0`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[var(--seg-check-size,18px)] w-[var(--seg-check-size,18px)] scale-100 opacity-0 transition-[opacity,transform] duration-150 ease-out" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12.5l4 4 8-8" />
        </svg>
      </span> : null;
  const handleKeyDown = e => {
    if (disabled) return;
    if (type === "radio" && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") && name) {
      e.preventDefault();
      const selector = `input[type="radio"][name="${CSS.escape(name)}"]`;
      const radios = Array.from(document.querySelectorAll(selector));
      if (!radios.length) return;
      const currentIndex = radios.indexOf(resolvedRef.current);
      const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = (currentIndex + dir + radios.length) % radios.length;
      radios[nextIndex]?.click();
      return;
    }
    if (e.key !== " " && e.key !== "Enter") return;
  };
  useLayoutEffect(() => {
    if (!fitTextLines || typeof window === "undefined") return undefined;
    const node = textRef.current;
    if (!(node instanceof HTMLElement)) return undefined;

    let rafId = 0;
    let resizeObserver = null;

    const fit = () => {
      const style = window.getComputedStyle(node);
      const baseFont = Number.parseFloat(style.fontSize) || 16;
      const lineHeightRaw = Number.parseFloat(style.lineHeight);
      const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : baseFont * 1.24;
      const maxHeight = lineHeight * fitTextLines + 1;
      const minFont = Math.min(baseFont, fitTextMinPx);

      node.style.removeProperty("font-size");
      node.style.removeProperty("--fit-text-size");

      if (node.scrollHeight <= maxHeight) return;

      let low = minFont;
      let high = baseFont;
      let best = minFont;

      for (let i = 0; i < 10; i += 1) {
        const mid = (low + high) / 2;
        node.style.fontSize = `${mid}px`;
        if (node.scrollHeight <= maxHeight) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      node.style.fontSize = `${best}px`;
      node.style.setProperty("--fit-text-size", `${best}px`);
    };

    const scheduleFit = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(fit);
    };

    scheduleFit();

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleFit);
      resizeObserver.observe(node);
      if (resolvedRef.current?.parentElement instanceof HTMLElement) {
        resizeObserver.observe(resolvedRef.current.parentElement);
      }
    }

    window.addEventListener("resize", scheduleFit);
    document.fonts?.ready?.then?.(scheduleFit).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect?.();
      window.removeEventListener("resize", scheduleFit);
    };
  }, [children, fitTextLines, fitTextMinPx, resolvedRef]);
  return <label data-checked={checked ? "true" : "false"} data-control-type={type} className={cn(baseCard, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer", className, checked ? selectedCard : null)}>
      <input ref={resolvedRef} type={type} name={name} value={value} checked={!!checked} onChange={onChange} onKeyDown={handleKeyDown} disabled={disabled} className="peer sr-only" style={visuallyHiddenInputStyle} tabIndex={0} />
      {indicator}
      <span ref={textRef} className="flex-1">{children}</span>
    </label>;
}
