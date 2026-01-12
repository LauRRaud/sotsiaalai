import { cn } from "@/components/ui/cn";

const baseStyles =
  "w-full rounded-[999px] border border-solid border-transparent bg-[color:rgba(8,12,20,0.52)] px-[1.2rem] py-[0.85rem] text-[1.05rem] text-[color:var(--pt-150)] caret-[color:var(--pt-150)] shadow-[0_6px_16px_rgba(0,0,0,0.22),_0_7px_12px_-12px_rgba(248,253,255,0.56),_0_14px_20px_-16px_rgba(248,253,255,0.30)] transition-[border-color,box-shadow,background,color] duration-150 ease-out placeholder:text-[color:rgba(245,248,255,0.82)] placeholder:opacity-90 placeholder:tracking-[0.05em] focus-visible:outline-none focus-visible:border-[color:var(--ui-hover-ring)] focus-visible:bg-[color:rgba(10,14,24,0.32)] focus-visible:shadow-[0_0_10px_var(--ui-hover-soft),_0_0_18px_var(--ui-hover-outer)] hover:bg-[color:var(--btn-base-bg-dark)] disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 light:text-[color:var(--text-strong)] light:caret-[color:var(--text-strong)] light:bg-[color:rgba(255,255,255,0.68)] light:border-[color:rgba(148,163,184,0.38)] light:shadow-[0_10px_22px_rgba(15,23,42,0.12),_inset_0_1px_0_rgba(255,255,255,0.8)] light:hover:bg-[#ffffff] light:hover:border-[color:rgba(148,163,184,0.46)] light:focus-visible:bg-[#ffffff] light:focus-visible:border-[color:rgba(148,163,184,0.48)] light:focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.22),_0_12px_22px_rgba(15,23,42,0.14),_inset_0_1px_0_rgba(255,255,255,0.85)] light:placeholder:text-[color:var(--pt-600)] light:placeholder:opacity-85 light:placeholder:tracking-[0.02em] hc:text-[color:var(--hc-text)] hc:bg-[color:var(--hc-bg)] hc:border-[color:var(--hc-accent)]";

const sizeStyles = {
  sm: "text-[0.95rem] py-[0.7rem] px-[1rem]",
  md: "",
  lg: "text-[1.2rem] py-[1rem] px-[1.4rem]",
};

const variantStyles = {
  default: "",
  subtle:
    "bg-[color:rgba(6,9,16,0.4)] shadow-[0_4px_14px_rgba(0,0,0,0.2)] light:bg-[color:rgba(255,255,255,0.72)] light:shadow-[0_8px_18px_rgba(15,23,42,0.10)]",
};

export default function Textarea({
  size = "md",
  variant = "default",
  className,
  disabled = false,
  ...props
}) {
  return (
    <textarea
      className={cn(
        baseStyles,
        variantStyles[variant] ?? variantStyles.default,
        sizeStyles[size] ?? sizeStyles.md,
        className,
      )}
      disabled={disabled}
      aria-disabled={disabled ? "true" : undefined}
      {...props}
    />
  );
}
