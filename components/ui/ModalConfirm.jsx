"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/components/ui/cn";
const modalOverlayClassName =
  "modal-confirm-overlay !bg-[rgba(8,10,16,0.66)] !backdrop-blur-0 !backdrop-saturate-100";
const modalContentClassName =
  "modal-confirm-content flex w-full max-w-[22rem] flex-col gap-3 rounded-[0.95rem] !border-[color:var(--chat-tools-panel-border,var(--opaque-panel-border,var(--rail-tooltip-border)))] " +
  "!bg-[color:var(--chat-tools-panel-bg,var(--chat-rail-tooltip-bg,var(--rail-tooltip-bg,var(--opaque-panel-bg,var(--subpage-card-bg)))))] px-[1rem] py-[0.95rem] " +
  "!text-[color:var(--chat-tools-panel-text,var(--opaque-panel-text,var(--rail-tooltip-text,var(--glass-modal-text))))] !shadow-[var(--chat-tools-panel-shadow,var(--opaque-panel-shadow,var(--rail-tooltip-shadow)))] " +
  "!backdrop-blur-0 !backdrop-saturate-100 light:text-[#2f3a4a]";
const modalMessageClassName = "text-center text-[1.14rem] leading-[1.42] tracking-[0.012em] !text-[color:var(--chat-tools-panel-text,var(--opaque-panel-text,var(--rail-tooltip-text,var(--glass-modal-text))))]";
const modalActionsClassName = "flex flex-wrap justify-center gap-2";
const modalBusyWrapClassName = "flex justify-center py-[0.2rem]";
const modalBusyTextClassName =
  "text-center text-[1rem] leading-[1.35] font-medium tracking-[0.01em] !text-[color:var(--chat-tools-panel-text,var(--opaque-panel-text,var(--rail-tooltip-text,var(--glass-modal-text))))]";
export default function ModalConfirm({
  message,
  children = null,
  confirmLabel = "Jah",
  confirmVariant = "primary",
  cancelLabel = "Katkesta",
  cancelVariant = "secondary",
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
          {busyLabel ? <span className={modalBusyTextClassName}>{busyLabel}</span> : null}
        </div> : <div className={cn(modalActionsClassName, actionsClassName)}>
          <Button type="button" size="sm" variant={confirmVariant} onClick={onConfirm} disabled={disabled} className="min-w-[6.6rem]">
            <span>{confirmLabel}</span>
          </Button>
          {cancelLabel ? <Button type="button" size="sm" variant={cancelVariant} onClick={onCancel} disabled={disabled} className="min-w-[6.6rem]">
              <span>{cancelLabel}</span>
            </Button> : null}
        </div>}
    </Modal>;
  return createPortal(modal, document.body);
}
