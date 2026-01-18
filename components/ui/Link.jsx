import Link from "next/link";
import { cn } from "@/components/ui/cn";
const baseStyles = "inline-flex items-center gap-[0.35rem] underline underline-offset-4 decoration-[color:currentColor] transition-[color,opacity] duration-150 ease-out";
const variantStyles = {
  brand: "text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]",
  subtle: "text-[color:var(--pt-150)] hover:text-[color:var(--pt-50)] light:text-[color:var(--text-strong)] hc:text-[color:var(--hc-text)]",
  muted: "text-[color:var(--pt-300)] hover:text-[color:var(--pt-150)] light:text-[color:var(--text-muted)] hc:text-[color:var(--hc-text)]"
};
export default function AppLink({
  variant = "brand",
  className,
  ...props
}) {
  return <Link className={cn(baseStyles, variantStyles[variant] ?? variantStyles.brand, className)} {...props} />;
}