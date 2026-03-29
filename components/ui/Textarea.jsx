import { cn } from "@/components/ui/cn";
import { textAreaInputBaseClassName } from "@/components/ui/inputClassNames";
const baseStyles = textAreaInputBaseClassName;
const sizeStyles = {
  sm: "text-[0.95rem] py-[0.7rem] px-[1rem]",
  md: "",
  lg: "text-[1.2rem] py-[1rem] px-[1.4rem]"
};
const variantStyles = {
  default: "",
  subtle: "bg-[color:rgba(6,9,16,0.4)] shadow-[0_4px_14px_rgba(0,0,0,0.2)] light:bg-[color:rgba(255,255,255,0.72)] light:shadow-[0_8px_18px_rgba(15,23,42,0.10)]"
};
export default function Textarea({
  size = "md",
  variant = "default",
  className,
  disabled = false,
  ...props
}) {
  return <textarea className={cn(baseStyles, variantStyles[variant] ?? variantStyles.default, sizeStyles[size] ?? sizeStyles.md, className)} disabled={disabled} aria-disabled={disabled ? "true" : undefined} {...props} />;
}
