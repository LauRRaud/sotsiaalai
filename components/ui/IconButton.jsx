import { cn } from "@/components/ui/cn";

const variantStyles = {
  close:
    "h-[var(--icon-btn-close-size)] w-[var(--icon-btn-close-size)] text-[2.05rem] text-[color:var(--icon-btn-close-color)]",
};

export default function IconButton({
  variant = "close",
  className,
  label = "Close",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center bg-transparent p-0 leading-none transition-transform duration-150 ease-out hover:-translate-y-[1px] focus-visible:outline-none active:translate-y-[1px]",
        variantStyles[variant] ?? variantStyles.close,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">&times;</span>
    </button>
  );
}
