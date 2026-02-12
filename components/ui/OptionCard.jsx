import { cn } from "@/components/ui/cn";
import { useRef } from "react";
const baseCard = "flex items-center gap-[0.45rem] rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out hover:[background:var(--seg-card-bg-hover)] hover:text-[color:var(--seg-card-text-selected)] hover:shadow-[var(--seg-card-shadow-hover)] [&_a]:!text-[color:var(--link-brand-text,var(--link-color,var(--brand-primary)))] [&_a:hover]:!text-[color:var(--link-brand-text,var(--link-color,var(--brand-primary)))] [&_a:active]:!text-[color:var(--link-brand-text,var(--link-color,var(--brand-primary)))] [&_a:focus-visible]:!text-[color:var(--link-brand-text,var(--link-color,var(--brand-primary)))]";
const selectedCard = "text-[color:var(--seg-card-text-selected)]";
const checkboxIndicator = "relative flex h-[var(--seg-control-size,20px)] w-[var(--seg-control-size,20px)] items-center justify-center rounded-[var(--seg-control-radius,0.4rem)] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100";
export default function OptionCard({
  type = "radio",
  name,
  value,
  checked,
  onChange,
  inputRef,
  disabled = false,
  className,
  children
}) {
  const internalRef = useRef(null);
  const resolvedRef = inputRef || internalRef;
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
  return <label data-checked={checked ? "true" : "false"} data-control-type={type} className={cn(baseCard, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer", className, checked ? selectedCard : null)}>
      <input ref={resolvedRef} type={type} name={name} value={value} checked={!!checked} onChange={onChange} onKeyDown={handleKeyDown} disabled={disabled} className="peer sr-only" tabIndex={0} />
      {indicator}
      <span className="flex-1">{children}</span>
    </label>;
}
