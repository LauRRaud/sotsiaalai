import { cn } from "@/components/ui/cn";
const overlayStyles = "fixed inset-0 z-50 bg-[color:rgba(8,10,16,0.55)]";
const panelStyles = "absolute top-0 h-full w-full max-w-[24rem] border border-solid border-[color:rgba(248,253,255,0.16)] bg-[color:rgba(13,16,24,0.9)] p-[1.4rem] text-[color:var(--pt-50)] shadow-[0_24px_60px_-40px_rgba(4,6,12,0.7)] backdrop-blur-[16px] backdrop-saturate-[140%] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.4)] light:bg-white hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]";
const sideStyles = {
  left: "left-0",
  right: "right-0"
};
export default function Drawer({
  open = false,
  onClose,
  side = "right",
  children,
  className,
  panelClassName,
  closeOnOverlayClick = true,
  ...props
}) {
  if (!open) return null;
  return <div className={cn(overlayStyles, className)} role="presentation" onClick={event => {
    if (!closeOnOverlayClick) return;
    if (event.target === event.currentTarget) onClose?.(event);
  }}>
      <div role="dialog" aria-modal="true" className={cn(panelStyles, sideStyles[side] ?? sideStyles.right, panelClassName)} {...props}>
        {children}
      </div>
    </div>;
}