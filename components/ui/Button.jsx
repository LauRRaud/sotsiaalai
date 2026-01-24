import { cn } from "@/components/ui/cn";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.4rem] py-[0.9rem] text-[1.18rem] font-[500] tracking-[0.02em] min-h-[2.5rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const primaryStyles = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] [border:var(--btn-primary-border)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:[border:var(--btn-primary-border-hover)] hover:-translate-y-[1px] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:[border:var(--btn-primary-border-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:translate-y-[1px] active:[background:var(--btn-primary-bg-active)] active:[border:var(--btn-primary-border-active)] active:shadow-[var(--btn-primary-shadow-active)]";
const sizeStyles = {
  sm: "text-[0.98rem] px-[0.7rem] py-[0.35rem] min-h-[2.25rem]",
  md: "",
  lg: "text-[1.2rem] px-[1.35rem] py-[0.8rem] min-h-[2.85rem]"
};
export default function Button({
  as = "button",
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  disabled = false,
  onClick,
  ...props
}) {
  const Component = as === "a" ? "a" : "button";
  const isDisabled = Boolean(disabled);
  const variantClass = primaryStyles;
  const handleClick = event => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };
  return <Component href={as === "a" ? href : undefined} type={as === "button" ? props.type ?? "button" : undefined} aria-disabled={isDisabled ? "true" : undefined} tabIndex={as === "a" && isDisabled ? -1 : props.tabIndex} disabled={as === "button" ? isDisabled : undefined} className={cn(baseStyles, variantClass, sizeStyles[size] ?? sizeStyles.md, fullWidth ? "w-full" : null, className)} onClick={handleClick} {...props} />;
}
