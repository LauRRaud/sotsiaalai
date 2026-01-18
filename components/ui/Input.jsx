import { cn } from "@/components/ui/cn";
const baseStyles = "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow)] hover:[background:var(--input-bg-hover)] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed";
const sizeStyles = {
  sm: "text-[0.95rem] py-[0.55rem] px-[1rem]",
  md: "",
  lg: "text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]"
};
const variantStyles = {
  default: "",
  subtle: "bg-[color:rgba(6,9,16,0.4)] shadow-[0_4px_14px_rgba(0,0,0,0.2)] light:bg-[color:rgba(255,255,255,0.72)] light:shadow-[0_8px_18px_rgba(15,23,42,0.10)]"
};
export default function Input({
  size = "md",
  variant = "default",
  className,
  disabled = false,
  ...props
}) {
  return <input className={cn(baseStyles, variantStyles[variant] ?? variantStyles.default, sizeStyles[size] ?? sizeStyles.md, className)} disabled={disabled} aria-disabled={disabled ? "true" : undefined} {...props} />;
}
