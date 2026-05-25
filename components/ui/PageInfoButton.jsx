"use client";

import { useEffect, useId, useState } from "react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/components/ui/cn";
import styles from "./PageInfoButton.module.css";

export function InfoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--page-info-ring-color,currentColor)"
      strokeWidth="1.18"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="6.35" opacity="0.9" />
      <path d="M12 11.35v4" opacity="0.9" />
      <circle cx="12" cy="8.55" r="0.82" fill="var(--page-info-dot-color,currentColor)" stroke="none" opacity="0.9" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6.4 6.4 17.6 17.6" />
      <path d="M17.6 6.4 6.4 17.6" />
    </svg>
  );
}

export default function PageInfoButton({
  title,
  label = "Lehe info",
  children,
  className,
  dialogClassName
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen(true)}
        className={cn(
          styles.trigger,
          "inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-center rounded-full border-0 bg-transparent p-0 text-[color:var(--title-color,var(--brand-primary,#c57171))] shadow-none outline-none transform-gpu transition-transform duration-[260ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:scale-[1.08] focus-visible:scale-[1.08] focus-visible:ring-[3px] focus-visible:ring-[color:var(--covision-focus-ring,var(--btn-primary-focus-ring-color,rgba(197,113,113,0.28)))] active:scale-[0.98] hc:text-[color:var(--hc-accent)]",
          className
        )}
      >
        <InfoIcon className="h-full w-full overflow-visible" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        variant="glass"
        aria-labelledby={titleId}
        className="z-[170] items-center bg-transparent max-[768px]:items-start max-[768px]:p-[max(0.55rem,env(safe-area-inset-top,0px))_max(0.55rem,env(safe-area-inset-right,0px))_max(0.55rem,env(safe-area-inset-bottom,0px))_max(0.55rem,env(safe-area-inset-left,0px))]"
        contentClassName={cn(
          styles.modalContent,
          "relative w-[min(100%,42rem)] max-w-[calc(100vw-1.5rem)] rounded-[1.35rem] border px-[1.45rem] py-[1.35rem] shadow-[var(--page-info-shadow)] max-[768px]:mt-[0.4rem] max-[768px]:max-h-[calc(100dvh-1.1rem)] max-[768px]:overflow-y-auto max-[768px]:rounded-[1.05rem] max-[768px]:px-[1rem] max-[768px]:py-[1rem]",
          dialogClassName
        )}
      >
        <button
          type="button"
          aria-label="Sulge"
          onClick={() => setOpen(false)}
          className={cn(
            styles.closeButton,
            "absolute right-[1rem] top-[1rem] inline-flex h-[2.35rem] w-[2.35rem] items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-[color:var(--covision-focus-ring,var(--btn-primary-focus-ring-color,rgba(197,113,113,0.28)))]"
          )}
        >
          <CloseIcon className="h-[1.08rem] w-[1.08rem]" />
        </button>

        <div className="grid gap-[1rem] pr-[2.25rem]">
          <h2 id={titleId} className={cn(styles.title, "m-0 text-[1.34rem] font-[680] leading-[1.18] tracking-[0]")}>
            {title}
          </h2>
          <div className={cn(styles.body, "grid gap-[0.76rem] text-[1.02rem] leading-[1.5] tracking-[0]")}>
            {children}
          </div>
        </div>
      </Modal>
    </>
  );
}
