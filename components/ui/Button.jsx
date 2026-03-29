import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative overflow-hidden transition-[filter,border-color,box-shadow,opacity] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] cursor-pointer appearance-none [-webkit-appearance:none] backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] [&>*]:relative [&>*]:z-[1]";
const primaryStyles = "[border:var(--btn-primary-border)] text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] shadow-[var(--btn-primary-shadow)] before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:[background:var(--btn-primary-bg-hover)] before:opacity-0 before:transition-opacity before:duration-[560ms] before:ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:before:opacity-100 hover:shadow-[var(--btn-primary-shadow-hover)] focus-visible:before:opacity-100 focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:[border:var(--btn-primary-border-active,var(--btn-primary-border))] active:[background:var(--btn-primary-bg-active)] active:before:opacity-0 active:shadow-[var(--btn-primary-shadow-active)]";
const linkBrandButtonBase = "!bg-transparent !shadow-none !border-transparent border-0 p-0 m-0 rounded-[0.32em] font-inherit leading-inherit appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const ghostStyles =
  "text-[color:var(--pt-150)] bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.25)] shadow-none " +
  "hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(170,190,215,0.38)] " +
  "focus-visible:shadow-[0_0_0_3px_rgba(170,190,215,0.22)] " +
  "active:bg-[rgba(255,255,255,0.06)]";
const dangerStyles =
  "[border:var(--btn-danger-border,rgba(255,184,184,0.28))] text-[color:var(--btn-danger-text,#fff4f4)] " +
  "[background:var(--btn-danger-bg,linear-gradient(180deg,rgba(167,36,36,0.9),rgba(120,23,23,0.84)))] " +
  "shadow-[var(--btn-danger-shadow,0_9px_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06))] " +
  "before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] " +
  "before:[background:var(--btn-danger-bg-hover,linear-gradient(180deg,rgba(184,41,41,0.96),rgba(135,26,26,0.9)))] before:opacity-0 before:transition-opacity before:duration-[560ms] before:ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "hover:before:opacity-100 hover:border-[rgba(255,214,214,0.38)] hover:shadow-[var(--btn-danger-shadow-hover,0_12px_28px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08))] " +
  "focus-visible:before:opacity-100 focus-visible:shadow-[var(--btn-danger-shadow-focus,0_0_0_3px_rgba(255,120,120,0.2),0_10px_22px_rgba(0,0,0,0.22))] " +
  "active:[border:var(--btn-danger-border-active,rgba(255,201,201,0.26))] active:[background:var(--btn-danger-bg-active,linear-gradient(180deg,rgba(148,31,31,0.92),rgba(106,19,19,0.88)))] active:before:opacity-0 " +
  "active:shadow-[var(--btn-danger-shadow-active,0_7px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05))] " +
  "light:[border:var(--btn-danger-border-light,rgba(154,43,43,0.24))] light:text-[color:var(--btn-danger-text-light,#fff6f6)] " +
  "light:[background:var(--btn-danger-bg-light,linear-gradient(180deg,rgba(194,54,54,0.96),rgba(162,37,37,0.9)))] " +
  "light:shadow-[var(--btn-danger-shadow-light,0_8px_18px_rgba(95,28,28,0.16),inset_0_1px_0_rgba(255,255,255,0.12))] " +
  "light:before:[background:var(--btn-danger-bg-hover-light,linear-gradient(180deg,rgba(210,63,63,0.98),rgba(176,42,42,0.94)))] " +
  "light:hover:border-[rgba(154,43,43,0.32)] light:hover:shadow-[var(--btn-danger-shadow-hover-light,0_10px_22px_rgba(95,28,28,0.18),inset_0_1px_0_rgba(255,255,255,0.14))] " +
  "light:active:[background:var(--btn-danger-bg-active-light,linear-gradient(180deg,rgba(178,44,44,0.96),rgba(146,31,31,0.92)))] " +
  "light:active:shadow-[var(--btn-danger-shadow-active-light,0_7px_16px_rgba(95,28,28,0.15),inset_0_1px_0_rgba(255,255,255,0.1))]";
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
  children,
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
  return <Component href={as === "a" ? href : undefined} type={as === "button" ? props.type ?? "button" : undefined} aria-disabled={isDisabled ? "true" : undefined} tabIndex={as === "a" && isDisabled ? -1 : props.tabIndex} disabled={as === "button" ? isDisabled : undefined} data-variant={useBaseStyles ? variant : undefined} className={cn(useBaseStyles ? baseStyles : null, useBaseStyles ? sizeStyles[size] ?? sizeStyles.md : null, useBaseStyles && fullWidth ? "w-full" : null, variantClass, className)} onClick={handleClick} {...props}>{useBaseStyles ? <span className="relative z-[1] inline-flex items-center justify-center gap-[inherit]">
        {children}
      </span> : children}</Component>;
}
