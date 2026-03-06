import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative transition-[background,border-color,box-shadow,color,opacity] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] cursor-pointer appearance-none [-webkit-appearance:none] backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision]";
const primaryStyles = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:shadow-[var(--btn-primary-shadow-hover)] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:[background:var(--btn-primary-bg-active)] active:shadow-[var(--btn-primary-shadow-active)]";
const linkBrandButtonBase = "!bg-transparent !shadow-none !border-transparent border-0 p-0 m-0 rounded-[0.32em] font-inherit leading-inherit appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const ghostStyles =
  "text-[color:var(--pt-150)] bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.25)] shadow-none " +
  "hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(170,190,215,0.38)] " +
  "focus-visible:shadow-[0_0_0_3px_rgba(170,190,215,0.22)] " +
  "active:bg-[rgba(255,255,255,0.06)]";
const dangerStyles =
  "text-[#ffb8b8] bg-[rgba(120,30,30,0.22)] border border-[rgba(192,72,72,0.45)] " +
  "shadow-[0_6px_16px_rgba(0,0,0,0.2)] " +
  "hover:bg-[rgba(140,40,40,0.28)] hover:border-[rgba(192,72,72,0.6)] " +
  "focus-visible:shadow-[0_0_0_3px_rgba(255,120,120,0.2)] " +
  "active:bg-[rgba(110,26,26,0.22)]";
const variantStyles = {
  primary: primaryStyles,
  ghost: ghostStyles,
  danger: dangerStyles,
  linkBrand: `${linkBrandBase} ${linkBrandButtonBase}`
};
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
  const variantClass = variantStyles[variant] ?? variantStyles.primary;
  const useBaseStyles = variant !== "linkBrand";
  const handleClick = event => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };
  return <Component href={as === "a" ? href : undefined} type={as === "button" ? props.type ?? "button" : undefined} aria-disabled={isDisabled ? "true" : undefined} tabIndex={as === "a" && isDisabled ? -1 : props.tabIndex} disabled={as === "button" ? isDisabled : undefined} className={cn(useBaseStyles ? baseStyles : null, useBaseStyles ? sizeStyles[size] ?? sizeStyles.md : null, useBaseStyles && fullWidth ? "w-full" : null, variantClass, className)} onClick={handleClick} {...props} />;
}
