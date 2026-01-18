import { cn } from "@/components/ui/cn";
const groupStyles = "grid gap-[0.65rem] [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))] max-[48em]:grid-cols-1";
export default function SegmentedControl({
  name,
  value,
  options,
  onChange,
  disabled = false,
  className
}) {
  return <div className={cn(groupStyles, className)} role="radiogroup" aria-disabled={disabled ? "true" : undefined}>
      {options.map(option => {
      const checked = value === option.value;
      return <label key={option.value} className={cn("flex items-center gap-[0.55rem] rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.9rem] py-[0.72rem] text-[1.03rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out", "hover:[background:var(--seg-card-bg-hover)] hover:text-[color:var(--seg-card-text-hover)] hover:shadow-[var(--seg-card-shadow-hover)]", checked ? "[background:var(--seg-card-bg-selected)] text-[color:var(--seg-card-text-selected)] shadow-[var(--seg-card-shadow-selected)]" : null, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer")}>
            <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange?.(option.value)} disabled={disabled} className="peer sr-only" />
            <span aria-hidden="true" className={cn("relative flex h-[18px] w-[18px] items-center justify-center rounded-full border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] transition-[border-color,box-shadow,background] duration-150 ease-out", "after:block after:h-[10px] after:w-[10px] after:scale-0 after:rounded-full after:bg-[color:var(--seg-radio-dot-bg)] after:shadow-[var(--seg-radio-dot-shadow)] after:opacity-0 after:transition-none after:content-['']", "peer-checked:after:opacity-100 peer-checked:after:scale-100")} />
            <span className="flex-1">{option.label}</span>
          </label>;
    })}
    </div>;
}
