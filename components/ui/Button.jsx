import { cn } from "@/components/ui/cn";

const baseStyles =
  "inline-flex items-center justify-center gap-[0.45rem] rounded-[999px] border border-solid border-transparent px-[0.95rem] py-[0.52rem] text-[1.02rem] font-[650] tracking-[0.02em] min-h-[2.5rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";

const primaryStyles =
  "text-[color:rgba(248,252,255,0.96)] bg-[color:var(--btn-base-bg-dark)] border-0 shadow-[0_6px_16px_rgba(0,0,0,0.26),_0_12px_18px_-14px_rgba(248,253,255,0.60),_0_24px_30px_-24px_rgba(248,253,255,0.32)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(185,210,240,0.10)_100%)] hover:-translate-y-[1px] focus-visible:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(185,210,240,0.10)_100%)] focus-visible:shadow-[0_10px_22px_rgba(0,0,0,0.28),_0_12px_18px_-14px_rgba(248,253,255,0.60),_0_24px_30px_-24px_rgba(248,253,255,0.32),_0_0_0_3px_rgba(225,160,160,0.28)] active:translate-y-[1px] active:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(150,175,210,0.05)_100%)] active:shadow-[0_5px_12px_rgba(0,0,0,0.24),_0_12px_18px_-14px_rgba(248,253,255,0.55),_0_24px_30px_-24px_rgba(248,253,255,0.30)] light:text-[color:rgba(31,41,55,0.92)] light:bg-[color:rgba(255,255,255,0.62)] light:border light:border-[color:rgba(148,163,184,0.38)] light:shadow-[0_8px_18px_rgba(15,23,42,0.10),_inset_0_1px_0_rgba(255,255,255,0.7)] light:hover:bg-[#ffffff] light:hover:border-[color:rgba(148,163,184,0.46)] light:hover:shadow-[0_12px_22px_rgba(15,23,42,0.14),_inset_0_1px_0_rgba(255,255,255,0.82)] light:focus-visible:shadow-[0_12px_22px_rgba(15,23,42,0.14),_0_0_0_3px_rgba(197,113,113,0.24),_inset_0_1px_0_rgba(255,255,255,0.82)] light:active:bg-[#ffffff] light:active:border-[color:rgba(148,163,184,0.40)] light:active:shadow-[0_6px_14px_rgba(15,23,42,0.12),_inset_0_1px_0_rgba(255,255,255,0.7)] hc:text-[color:var(--hc-text)] hc:bg-[color:var(--hc-accent)]";

const secondaryStyles =
  "text-[color:var(--pt-150)] border-[color:rgba(248,253,255,0.45)] bg-[color:rgba(255,255,255,0.06)] hover:bg-[color:rgba(255,255,255,0.12)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.46)] light:bg-[color:rgba(255,255,255,0.8)] light:hover:bg-[#ffffff] light:focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.24)] hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]";

const ghostStyles =
  "text-[color:var(--pt-150)] bg-transparent shadow-none hover:bg-[color:var(--brand-alpha-05)] hover:text-[color:var(--pt-150)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--text-strong)] light:hover:bg-[color:rgba(122,58,56,0.08)] light:focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.24)] hc:text-[color:var(--hc-text)] hc:hover:bg-[color:var(--hc-surface)]";

const dangerStyles =
  "text-[color:var(--brand-primary)] border-[color:var(--brand-soft)] bg-transparent hover:bg-[color:var(--brand-alpha-10)] focus-visible:shadow-[0_0_0_3px_rgba(225,160,160,0.28)] light:text-[color:var(--brand-primary)] light:border-[color:var(--brand-soft)] light:hover:bg-[color:rgba(122,58,56,0.08)] hc:text-[color:var(--hc-accent)] hc:border-[color:var(--hc-accent)] hc:hover:bg-[color:var(--hc-surface)]";

const linkStyles =
  "bg-transparent shadow-none px-0 py-0 min-h-0 text-[color:var(--link-gold)] underline underline-offset-4 decoration-[color:var(--link-gold)] hover:decoration-[color:var(--link-gold-hover)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:decoration-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)] hc:decoration-[color:var(--hc-accent)]";

const sizeStyles = {
  sm: "text-[0.95rem] px-[0.75rem] py-[0.4rem] min-h-[2.25rem]",
  md: "",
  lg: "text-[1.08rem] px-[1.2rem] py-[0.65rem] min-h-[2.85rem]",
};

const variantStyles = {
  primary: primaryStyles,
  secondary: secondaryStyles,
  ghost: ghostStyles,
  danger: dangerStyles,
  link: linkStyles,
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

  const handleClick = (event) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      href={as === "a" ? href : undefined}
      type={as === "button" ? props.type ?? "button" : undefined}
      aria-disabled={isDisabled ? "true" : undefined}
      tabIndex={as === "a" && isDisabled ? -1 : props.tabIndex}
      disabled={as === "button" ? isDisabled : undefined}
      className={cn(
        baseStyles,
        variantClass,
        sizeStyles[size] ?? sizeStyles.md,
        fullWidth ? "w-full" : null,
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  );
}
