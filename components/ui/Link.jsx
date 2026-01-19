import Link from "next/link";
import { cn } from "@/components/ui/cn";
const baseStyles = "link-brand";
const variantStyles = {
  brand: "",
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
