import { cn } from "@/components/ui/cn";

export default function CardTitle({
  as: Component = "div",
  className,
  ...props
}) {
  return (
    <Component
      className={cn(
        "mb-[6px] font-[650] tracking-[0.01em] text-[color:var(--rag-text)]",
        className,
      )}
      {...props}
    />
  );
}
