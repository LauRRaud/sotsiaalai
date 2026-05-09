import BorderGlow from "@/components/ui/BorderGlow";
import { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
import { cn } from "@/components/ui/cn";
import { useLayoutEffect, useRef, useState } from "react";
const baseCard = "relative overflow-hidden flex items-center gap-[0.45rem] rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,box-shadow,background] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] select-none [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:[background:var(--seg-card-bg-hover,var(--seg-card-bg))] before:opacity-0 before:transition-opacity before:duration-[var(--seg-card-duration,560ms)] before:ease-[var(--seg-card-ease,cubic-bezier(0.22,0.61,0.36,1))] [@media(hover:hover)]:hover:before:opacity-100 [@media(hover:hover)]:hover:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] [@media(hover:hover)]:hover:text-[color:var(--seg-card-text-hover)] [@media(hover:hover)]:hover:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] data-[focus-visible=true]:before:opacity-100 data-[focus-visible=true]:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] data-[focus-visible=true]:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] data-[checked=true]:before:opacity-100 data-[checked=true]:[background:var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg)))] data-[checked=true]:border-[color:var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border)))] data-[checked=true]:shadow-[var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow)))] active:[background:var(--seg-card-bg-active,var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg))))] active:border-[color:var(--seg-card-border-active,var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border))))] active:shadow-[var(--seg-card-shadow-active,var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow))))] active:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] [&>*:not(input)]:relative [&>*:not(input)]:z-[1] [&>*:not(input)]:min-w-0";
const selectedCard = "text-[color:var(--seg-card-text-selected)]";
const checkboxIndicator = "relative flex h-[var(--seg-control-size,20px)] w-[var(--seg-control-size,20px)] items-center justify-center rounded-[var(--seg-control-radius,0.4rem)] border-[2px] border-[color:var(--checkbox-border,var(--title-color,var(--brand-primary,#c57171)))] bg-[color:var(--checkbox-bg,transparent)] shadow-none text-[color:var(--checkbox-accent,var(--title-color,var(--brand-primary,#c57171)))] transition-[border-color,background] duration-150 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--checkbox-focus,var(--focus-ring,var(--checkbox-accent,var(--brand-primary,#c57171))))] peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100";
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
  showIndicator = true,
  glow = true,
  fitTextLines,
  fitTextMinPx = 16,
  fitTextMaxPx,
  style,
  ...props
}) {
  const internalRef = useRef(null);
  const resolvedRef = inputRef || internalRef;
  const textRef = useRef(null);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const indicator = type === "checkbox" && showIndicator ? <span aria-hidden="true" className={`${checkboxIndicator} shrink-0`}>
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

    const fit = () => {
      node.style.removeProperty("font-size");
      node.style.removeProperty("--fit-text-size");

      const baseStyle = window.getComputedStyle(node);
      const baseFont = Number.parseFloat(baseStyle.fontSize) || 16;
      const minFont = Math.min(baseFont, fitTextMinPx);
      const maxFontValue = Number.parseFloat(fitTextMaxPx);
      const maxFont = Number.isFinite(maxFontValue)
        ? Math.max(baseFont, maxFontValue)
        : baseFont;

      const fitsAt = (size) => {
        node.style.fontSize = `${size}px`;
        const style = window.getComputedStyle(node);
        const currentFont = Number.parseFloat(style.fontSize) || size;
        const lineHeightRaw = Number.parseFloat(style.lineHeight);
        const lineHeight = Number.isFinite(lineHeightRaw)
          ? lineHeightRaw
          : currentFont * 1.24;
        const maxHeight = lineHeight * fitTextLines + 1;
        const maxWidth = node.clientWidth + 1;
        return node.scrollHeight <= maxHeight && node.scrollWidth <= maxWidth;
      };

      let low = minFont;
      let high = maxFont;
      let best = minFont;

      for (let i = 0; i < 12; i += 1) {
        const mid = (low + high) / 2;
        if (fitsAt(mid)) {
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

    window.addEventListener("resize", scheduleFit);
    document.fonts?.ready?.then?.(scheduleFit).catch?.(() => {});

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleFit)
        : null;
    if (node.parentElement) ro?.observe(node.parentElement);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleFit);
      ro?.disconnect?.();
    };
  }, [children, fitTextLines, fitTextMinPx, fitTextMaxPx, resolvedRef]);
  const card = <label data-checked={checked ? "true" : "false"} data-control-type={type} data-focus-visible={isFocusVisible ? "true" : "false"} className={cn(baseCard, glow ? "ui-glow-option-card-frame" : null, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer", className, checked ? selectedCard : null)} style={style} {...props}>
      <input ref={resolvedRef} type={type} name={name} value={value} checked={!!checked} onChange={onChange} onKeyDown={handleKeyDown} onFocus={e => setIsFocusVisible(e.target.matches(":focus-visible"))} onBlur={() => setIsFocusVisible(false)} disabled={disabled} className="peer sr-only" style={visuallyHiddenInputStyle} tabIndex={0} />
      {indicator}
      <span ref={textRef} className="flex min-w-0 flex-1 items-center leading-[inherit] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] [transform:translateZ(0)]">
        {children}
      </span>
    </label>;

  if (!glow) return card;

  return (
    <BorderGlow
      as="label"
      data-checked={checked ? "true" : "false"}
      data-control-type={type}
      data-focus-visible={isFocusVisible ? "true" : "false"}
      className={cn(baseCard, "ui-glow-option-card-frame", disabled ? "cursor-not-allowed opacity-70 ui-glow-option-card-frame--disabled" : "cursor-pointer", className, checked ? selectedCard : null)}
      edgeSensitivity={22}
      glowColor="358 82 72"
      backgroundColor="var(--seg-card-bg)"
      borderRadius={20}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      fillOpacity={0}
      edgeOnly
      style={{
        ...fieldEdgeGlowStyle,
        "--border-radius": "var(--seg-card-radius, 1.25rem)",
        ...style
      }}
      {...props}
    >
      <input ref={resolvedRef} type={type} name={name} value={value} checked={!!checked} onChange={onChange} onKeyDown={handleKeyDown} onFocus={e => setIsFocusVisible(e.target.matches(":focus-visible"))} onBlur={() => setIsFocusVisible(false)} disabled={disabled} className="peer sr-only" style={visuallyHiddenInputStyle} tabIndex={0} />
      {indicator}
      <span ref={textRef} className="flex min-w-0 flex-1 items-center leading-[inherit] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] [transform:translateZ(0)]">
        {children}
      </span>
    </BorderGlow>
  );
}
