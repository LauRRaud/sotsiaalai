import { cn } from "@/components/ui/cn";

const baseClassName =
  "inline-flex h-[5.7rem] w-[5.7rem] items-center justify-center " +
  "bg-transparent p-0 border-0 cursor-[var(--cursor-pointer)] " +
  "transition-transform duration-150 ease-out hover:scale-[1.08] " +
  "focus-visible:outline-none active:scale-[0.98]";

const iconClassName =
  "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat " +
  "[background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] " +
  "light:[background-image:url('/logo/tagasinupphele.svg')]";

export default function BackButton({
  onClick,
  ariaLabel,
  className,
  iconClassName: iconClassNameProp,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(baseClassName, className)}
      {...props}
    >
      <span className={cn(iconClassName, iconClassNameProp)} />
    </button>
  );
}
