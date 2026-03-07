 "use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/cn";
const overlayStyles = "fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(8,10,16,0.6)] px-[1.25rem] py-[2rem]";
const contentStyles = "w-full max-w-[32rem] rounded-[1.2rem] border border-solid border-[color:rgba(248,253,255,0.16)] bg-[color:rgba(13,16,24,0.85)] p-[1.6rem] text-[color:var(--pt-50)] shadow-[0_30px_70px_-40px_rgba(4,6,12,0.75)] backdrop-blur-[16px] backdrop-saturate-[140%] light:text-[color:var(--text-strong)] light:border-[color:rgba(148,163,184,0.4)] light:bg-white hc:text-[color:var(--hc-text)] hc:border-[color:var(--hc-accent)] hc:bg-[color:var(--hc-bg)]";
const glassOverlayStyles = "fixed inset-0 z-50 flex items-center justify-center bg-transparent p-[1.25rem]";
const glassContentStyles = "w-[min(100%,58vw)] max-w-[clamp(28rem,48vw,34rem)] max-h-[calc(100dvh-2.5rem)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 rounded-[var(--glass-modal-radius)] [border:var(--glass-modal-border)] [background:var(--glass-modal-bg)] p-[2.4rem_2rem_2rem] text-[color:var(--glass-modal-text)] shadow-[var(--glass-modal-shadow)] backdrop-blur-[var(--glass-modal-blur)] backdrop-saturate-[var(--glass-modal-saturate)]";
export default function Modal({
  open = false,
  variant = "default",
  onClose,
  children,
  className,
  contentClassName,
  closeOnOverlayClick = true,
  ...props
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!open) return null;
  if (!mounted || typeof document === "undefined") return null;
  const useGlass = variant === "glass";
  const modal = <div className={cn(useGlass ? glassOverlayStyles : overlayStyles, className)} role="presentation" onClick={event => {
    if (!closeOnOverlayClick) return;
    if (event.target === event.currentTarget) onClose?.(event);
  }}>
      <div role="dialog" aria-modal="true" className={cn(useGlass ? glassContentStyles : contentStyles, contentClassName)} {...props}>
        {children}
      </div>
    </div>;
  return createPortal(modal, document.body);
}
