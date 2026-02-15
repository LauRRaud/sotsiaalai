import { cn } from "@/components/ui/cn";
import BackIcon from "@/components/ui/icons/BackIcon";

const baseClassName =
  "inline-flex h-[5.7rem] w-[5.7rem] min-[48.0625em]:h-[6.4rem] min-[48.0625em]:w-[6.4rem] items-center justify-center " +
  "bg-transparent p-0 border-0 cursor-[var(--cursor-pointer)] " +
  "group focus-visible:outline-none";

const iconClassName =
  "transform-gpu will-change-transform transition-transform duration-[260ms] " +
  "ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.08] " +
  "group-focus-visible:scale-[1.08] group-active:scale-[0.98]";

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
      <BackIcon className={cn(iconClassName, iconClassNameProp)} />
    </button>
  );
}
