import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";

const baseStyles = linkBrandBase;

const variantStyles = {
  brand: "",
  inline: "text-[0.95em] tracking-[0.02em] px-[0.18em]",
  subtle:
    "text-[color:var(--pt-150)] hover:text-[color:var(--pt-50)] light:text-[color:var(--text-strong)] hc:text-[color:var(--hc-text)]",
  muted:
    "text-[color:var(--pt-300)] hover:text-[color:var(--pt-150)] light:text-[color:var(--text-muted)] hc:text-[color:var(--hc-text)]"
};

export default function AppLink({
  variant = "brand",
  className,
  prefetch = false,
  ...props
}) {
  return (
    <Link
      prefetch={prefetch}
      className={cn(baseStyles, variantStyles[variant] ?? variantStyles.brand, className)}
      {...props}
    />
  );
}
