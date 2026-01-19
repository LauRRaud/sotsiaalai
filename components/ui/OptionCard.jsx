import { cn } from "@/components/ui/cn";
import { useRef } from "react";
const baseCard = "flex items-center gap-[0.65rem] rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out hover:[background:var(--seg-card-bg-hover)] hover:text-[color:var(--seg-card-text-hover)] hover:shadow-[var(--seg-card-shadow-hover)]";
const selectedCard = "[background:var(--seg-card-bg-selected)] text-[color:var(--seg-card-text-selected)] shadow-[var(--seg-card-shadow-selected)]";
const radioIndicator = "relative flex h-[20px] w-[20px] items-center justify-center rounded-full border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] transition-[border-color,box-shadow,background] duration-150 ease-out after:block after:h-[9px] after:w-[9px] after:scale-0 after:rounded-full after:bg-[color:var(--seg-radio-dot-bg)] after:shadow-[var(--seg-radio-dot-shadow)] after:opacity-0 after:transition-none after:content-[''] peer-checked:after:opacity-100 peer-checked:after:scale-100";
const checkboxIndicator = "relative flex h-[20px] w-[20px] items-center justify-center rounded-[0.4rem] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100";
export default function OptionCard({
  type = "radio",
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className,
  children
}) {
  const inputRef = useRef(null);
  const indicator = type === "checkbox" ? <span aria-hidden="true" className={checkboxIndicator}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] scale-90 opacity-0 transition-[opacity,transform] duration-150 ease-out" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12.5l4 4 8-8" />
        </svg>
      </span> : <span aria-hidden="true" className={radioIndicator} />;
  const handleKeyDown = e => {
    if (disabled) return;
    if (type === "radio" && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") && name) {
      e.preventDefault();
      const selector = `input[type="radio"][name="${CSS.escape(name)}"]`;
      const radios = Array.from(document.querySelectorAll(selector));
      if (!radios.length) return;
      const currentIndex = radios.indexOf(inputRef.current);
      const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = (currentIndex + dir + radios.length) % radios.length;
      radios[nextIndex]?.click();
      return;
    }
    if (e.key !== " " && e.key !== "Enter") return;
  };
  return <label className={cn(baseCard, checked ? selectedCard : null, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer", className)}>
      <input ref={inputRef} type={type} name={name} value={value} checked={!!checked} onChange={onChange} onKeyDown={handleKeyDown} disabled={disabled} className="peer sr-only" tabIndex={0} />
      {indicator}
      <span className="flex-1">{children}</span>
    </label>;
}
