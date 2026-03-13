import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative overflow-hidden transition-[filter,border-color,box-shadow,opacity] duration-[680ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] cursor-pointer appearance-none [-webkit-appearance:none] backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] [&>*]:relative [&>*]:z-[1]";
const primaryStyles = "[border:var(--btn-primary-border)] text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] shadow-[var(--btn-primary-shadow)] before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:[background:var(--btn-primary-bg-hover)] before:opacity-0 before:transition-opacity before:duration-[680ms] before:ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:before:opacity-100 hover:shadow-[var(--btn-primary-shadow-hover)] focus-visible:before:opacity-100 focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:[border:var(--btn-primary-border-active,var(--btn-primary-border))] active:[background:var(--btn-primary-bg-active)] active:before:opacity-0 active:shadow-[var(--btn-primary-shadow-active)]";
const linkBrandButtonBase = "!bg-transparent !shadow-none !border-transparent border-0 p-0 m-0 rounded-[0.32em] font-inherit leading-inherit appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const ghostStyles =
  "text-[color:var(--pt-150)] bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.25)] shadow-none " +
  "hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(170,190,215,0.38)] " +
  "focus-visible:shadow-[0_0_0_3px_rgba(170,190,215,0.22)] " +
  "active:bg-[rgba(255,255,255,0.06)]";
const dangerStyles =
  "text-[#fff3f3] bg-[rgba(145,28,28,0.78)] border border-[rgba(255,179,179,0.32)] " +
  "shadow-[0_6px_16px_rgba(0,0,0,0.2)] " +
  "hover:bg-[rgba(165,32,32,0.84)] hover:border-[rgba(255,201,201,0.42)] " +
  "focus-visible:shadow-[0_0_0_3px_rgba(255,120,120,0.2)] " +
  "active:bg-[rgba(122,22,22,0.82)] " +
  "light:text-[#fff7f7] light:bg-[rgba(177,45,45,0.92)] light:border-[rgba(138,28,28,0.28)] " +
  "light:hover:bg-[rgba(197,53,53,0.96)] light:hover:border-[rgba(138,28,28,0.36)] " +
  "light:active:bg-[rgba(160,38,38,0.94)]";
const variantStyles = {
  primary: primaryStyles,
  secondary: ghostStyles,
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
