"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import { cn } from "@/components/ui/cn";
const modalOverlayClassName =
  "modal-confirm-overlay !bg-[rgba(8,10,16,0.66)] !backdrop-blur-0 !backdrop-saturate-100";
const modalContentClassName =
  "modal-confirm-content flex w-full max-w-[28rem] flex-col gap-4 rounded-[1.35rem] !border-[color:var(--rail-tooltip-border)] " +
  "!bg-[color:var(--rail-tooltip-bg)] px-[1.45rem] py-[1.35rem] !text-[color:var(--rail-tooltip-text,var(--glass-modal-text))] !shadow-[var(--rail-tooltip-shadow)] " +
  "!backdrop-blur-0 !backdrop-saturate-100 light:text-[#2f3a4a]";
const modalMessageClassName = "text-[1.05rem] leading-[1.5] !text-[color:var(--rail-tooltip-text,var(--glass-modal-text))]";
const modalActionsClassName = "flex flex-wrap justify-center gap-3";
const modalBusyWrapClassName = "flex justify-center py-[0.2rem]";
const modalBusyCardClassName =
  "relative flex min-h-[8.8rem] w-fit min-w-[clamp(9.6rem,18vw,11.8rem)] flex-col items-center justify-center gap-[0.95rem] rounded-[1.35rem] " +
  "border border-[color:var(--rail-tooltip-border)] bg-[color:var(--rail-tooltip-bg)] px-[1.1rem] py-[1rem] " +
  "shadow-[var(--rail-tooltip-shadow)]";
const modalBusyTextClassName = "text-center text-[1.02rem] leading-[1.25] font-medium tracking-[0.01em] !text-[color:var(--rail-tooltip-text,var(--glass-modal-text))]";
export default function ModalConfirm({
  message,
  children = null,
  confirmLabel = "Jah",
  confirmVariant = "primary",
  cancelLabel = "Katkesta",
  onConfirm,
  onCancel,
  disabled = false,
  busy = false,
  busyLabel = "",
  actionsClassName = "",
  overlayClassName = "",
  contentClassName = ""
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && onCancel && !disabled) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, disabled]);
  const modal = <Modal open onClose={onCancel} closeOnOverlayClick={false} aria-label={typeof message === "string" ? message : "Confirm dialog"} className={cn(modalOverlayClassName, overlayClassName)} contentClassName={cn(modalContentClassName, contentClassName)}>
      {!busy ? <p className={modalMessageClassName}>{message}</p> : null}
      {!busy && children ? children : null}
      {busy ? <div className={modalBusyWrapClassName} role="status" aria-live="polite" aria-atomic="true">
          <div className={modalBusyCardClassName}>
            <div className="flex flex-col items-center gap-[0.7rem]">
              <SotsiaalAILoader size="clamp(2.95rem,5.7vw,3.35rem)" showBottomBall={false} ariaHidden />
              {busyLabel ? <span className={modalBusyTextClassName}>{busyLabel}</span> : null}
            </div>
          </div>
        </div> : <div className={cn(modalActionsClassName, actionsClassName)}>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={disabled}>
            <span>{confirmLabel}</span>
          </Button>
          {cancelLabel ? <Button type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
              <span>{cancelLabel}</span>
            </Button> : null}
        </div>}
    </Modal>;
  return createPortal(modal, document.body);
}
