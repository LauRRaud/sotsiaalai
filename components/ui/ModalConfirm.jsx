"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
const modalOverlayClassName = "modal-confirm-overlay";
const modalContentClassName = "modal-confirm-content flex w-full max-w-[28rem] flex-col gap-4 text-[color:var(--pt-50)] light:text-[color:var(--text-strong)]";
const modalMessageClassName = "text-[1.05rem] leading-[1.5] text-[color:var(--pt-120)] light:text-[color:var(--text-strong)]";
const modalActionsClassName = "flex flex-wrap justify-center gap-3";
const modalBusyWrapClassName = "flex justify-center py-[0.12rem]";
const modalBusyCardClassName =
  "relative w-fit min-w-[clamp(9.2rem,17vw,11rem)] rounded-[1.32rem] border border-[rgba(226,232,240,0.2)] " +
  "bg-[linear-gradient(150deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.035)_38%,rgba(4,8,15,0.22)_100%),var(--glass-modal-bg,rgba(0,0,0,0.25))] " +
  "px-[0.92rem] pt-[0.8rem] pb-[0.76rem] shadow-[0_14px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.11)] " +
  "backdrop-blur-[var(--glass-modal-blur,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] " +
  "light:border-[rgba(148,163,184,0.35)] light:bg-[linear-gradient(150deg,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.54)_42%,rgba(238,242,247,0.42)_100%),var(--glass-modal-bg,rgba(255,255,255,0.52))] " +
  "light:shadow-[0_12px_26px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.72)]";
const modalBusyTextClassName = "text-center text-[1.16rem] leading-[1.2] font-medium tracking-[0.01em] text-[color:var(--pt-30)] light:text-[color:var(--input-text)]";
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
  busyLabel = ""
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
  const modal = <Modal open onClose={onCancel} closeOnOverlayClick={false} aria-label={typeof message === "string" ? message : "Confirm dialog"} className={modalOverlayClassName} contentClassName={modalContentClassName}>
      {!busy ? <p className={modalMessageClassName}>{message}</p> : null}
      {!busy && children ? children : null}
      {busy ? <div className={modalBusyWrapClassName} role="status" aria-live="polite" aria-atomic="true">
          <div className={modalBusyCardClassName}>
            <div className="flex flex-col items-center gap-[0.64rem]">
              <SotsiaalAILoader size="clamp(3.1rem,6vw,3.6rem)" ariaHidden />
              {busyLabel ? <span className={modalBusyTextClassName}>{busyLabel}</span> : null}
            </div>
          </div>
        </div> : <div className={modalActionsClassName}>
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
