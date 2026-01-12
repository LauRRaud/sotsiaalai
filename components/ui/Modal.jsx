import { cn } from "@/components/ui/cn";

const overlayStyles =
  "fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(8,10,16,0.6)] px-[1.25rem] py-[2rem]";

const contentStyles =
  "w-full max-w-[32rem] rounded-[1.2rem] border border-solid border-[color:rgba(248,253,255,0.16)] bg-[color:rgba(13,16,24,0.85)] p-[1.6rem] text-[color:var(--pt-50)] shadow-[0_30px_70px_-40px_rgba(4,6,12,0.75)] backdrop-blur-[16px] backdrop-saturate-[140%] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.4)] light:bg-white hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]";

export default function Modal({
  open = false,
  onClose,
  children,
  className,
  contentClassName,
  closeOnOverlayClick = true,
  ...props
}) {
  if (!open) return null;

  return (
    <div
      className={cn(overlayStyles, className)}
      role="presentation"
      onClick={(event) => {
        if (!closeOnOverlayClick) return;
        if (event.target === event.currentTarget) onClose?.(event);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(contentStyles, contentClassName)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
