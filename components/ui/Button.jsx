import { cn } from "@/components/ui/cn";
const baseStyles = "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.4rem] py-[0.9rem] text-[1.18rem] font-[500] tracking-[0.02em] min-h-[2.5rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const primaryStyles = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] [border:var(--btn-primary-border)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:[border:var(--btn-primary-border-hover)] hover:-translate-y-[1px] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:[border:var(--btn-primary-border-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:translate-y-[1px] active:[background:var(--btn-primary-bg-active)] active:[border:var(--btn-primary-border-active)] active:shadow-[var(--btn-primary-shadow-active)]";
const secondaryStyles = "text-[color:var(--pt-150)] border-[color:rgba(248,253,255,0.45)] bg-[color:rgba(255,255,255,0.06)] hover:bg-[color:rgba(255,255,255,0.12)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.46)] light:bg-[color:rgba(255,255,255,0.8)] light:hover:bg-[#ffffff] light:focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.24)] hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]";
const ghostStyles = "text-[color:var(--pt-150)] bg-transparent shadow-none hover:bg-[color:var(--brand-alpha-05)] hover:text-[color:var(--pt-150)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--text-strong)] light:hover:bg-[color:rgba(122,58,56,0.08)] light:focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.24)] hc:text-[color:var(--hc-text)] hc:hover:bg-[color:var(--hc-surface)]";
const dangerStyles = "text-[color:var(--brand-primary)] border-[color:var(--brand-soft)] bg-transparent hover:bg-[color:var(--brand-alpha-10)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--brand-primary)] light:border-[color:var(--brand-soft)] light:hover:bg-[color:rgba(122,58,56,0.08)] hc:text-[color:var(--hc-accent)] hc:border-[color:var(--hc-accent)] hc:hover:bg-[color:var(--hc-surface)]";
const linkStyles = "bg-transparent shadow-none px-0 py-0 min-h-0 text-[color:var(--link-gold)] underline underline-offset-4 decoration-[color:var(--link-gold)] hover:decoration-[color:var(--link-gold-hover)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:decoration-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)] hc:decoration-[color:var(--hc-accent)]";
const sizeStyles = {
  sm: "text-[0.98rem] px-[0.7rem] py-[0.35rem] min-h-[2.25rem]",
  md: "",
  lg: "text-[1.2rem] px-[1.35rem] py-[0.8rem] min-h-[2.85rem]"
};
const variantStyles = {
  primary: primaryStyles,
  secondary: secondaryStyles,
  ghost: ghostStyles,
  danger: dangerStyles,
  link: linkStyles
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
  const resolvedVariant = variantStyles[variant] ? variant : "primary";
  const variantClass = variantStyles[resolvedVariant];
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
