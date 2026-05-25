import { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/components/ui/cn";
const variantStyles = {
  close: "h-[var(--icon-btn-close-size)] w-[var(--icon-btn-close-size)] text-[2.05rem] text-[color:var(--icon-btn-close-color)]"
};
const IconButton = forwardRef(function IconButton({
  variant = "close",
  className,
  label = "Close",
  type = "button",
  ...props
}, ref) {
  return <button ref={ref} type={type} aria-label={label} className={cn("inline-flex items-center justify-center bg-transparent p-0 leading-none transition-transform duration-150 ease-out hover:-translate-y-[1px] focus-visible:outline-none active:translate-y-[1px]", variantStyles[variant] ?? variantStyles.close, className)} {...props}>
      <span aria-hidden="true" className="pointer-events-none flex h-full w-full items-center justify-center leading-none">
        <X className="h-[58%] w-[58%]" strokeWidth={2.1} />
      </span>
    </button>;
});

export default IconButton;
