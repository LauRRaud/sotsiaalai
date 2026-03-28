import { cn } from "@/components/ui/cn";
const groupStyles = "grid gap-[0.65rem] [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))] max-[768px]:grid-cols-1";
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
      return <label key={option.value} className={cn("flex items-center rounded-[var(--seg-card-radius)] [border-width:var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[0.9rem] py-[0.72rem] text-[1.03rem] font-normal tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out", "hover:[background:var(--seg-card-bg-hover,var(--seg-card-bg))] hover:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] hover:text-[color:var(--seg-card-text-hover,var(--seg-card-text))] hover:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))]", checked ? "text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] [background:var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg)))] border-[color:var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border)))] shadow-[var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow)))]" : null, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer active:[background:var(--seg-card-bg-active,var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg))))] active:border-[color:var(--seg-card-border-active,var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border))))] active:shadow-[var(--seg-card-shadow-active,var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow))))] active:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))]")}>
            <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange?.(option.value)} disabled={disabled} className="peer sr-only" />
            <span className="flex-1">{option.label}</span>
          </label>;
    })}
    </div>;
}
