import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const primaryStyles = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] [border:var(--btn-primary-border)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:[border:var(--btn-primary-border-hover)] hover:-translate-y-[1px] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:[border:var(--btn-primary-border-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:translate-y-[1px] active:[background:var(--btn-primary-bg-active)] active:[border:var(--btn-primary-border-active)] active:shadow-[var(--btn-primary-shadow-active)]";
const linkBrandButtonBase = "!bg-transparent !shadow-none !border-transparent border-0 p-0 m-0 rounded-[0.32em] font-inherit leading-inherit appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const variantStyles = {
  primary: primaryStyles,
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
