import { cn } from "@/components/ui/cn";

const baseStyles =
  "rounded-[1.1rem] border border-solid border-[color:rgba(248,253,255,0.16)] bg-[color:rgba(13,16,24,0.6)] backdrop-blur-[16px] backdrop-saturate-[140%] text-[color:var(--pt-50)] shadow-[0_20px_50px_-40px_rgba(8,10,16,0.6)]";

const variantStyles = {
  glass:
    "border-[color:rgba(248,253,255,0.16)] bg-[color:rgba(13,16,24,0.6)] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.4)] light:bg-white hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]",
  subtle:
    "border-[color:rgba(248,253,255,0.1)] bg-[color:rgba(10,12,18,0.35)] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.25)] light:bg-[color:rgba(255,255,255,0.8)] hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-surface)]",
  solid:
    "border-[color:rgba(248,253,255,0.2)] bg-[color:rgba(18,20,28,0.9)] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.3)] light:bg-white hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]",
};

const paddingStyles = {
  sm: "p-[1rem]",
  md: "p-[1.5rem]",
  lg: "p-[2rem]",
};

export default function Panel({
  as: Component = "div",
  variant = "glass",
  padding = "md",
  className,
  ...props
}) {
  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant] ?? variantStyles.glass,
        paddingStyles[padding] ?? paddingStyles.md,
        className,
      )}
      {...props}
    />
  );
}
