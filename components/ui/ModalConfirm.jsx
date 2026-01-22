"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
const modalContentClassName = "flex w-full max-w-[28rem] flex-col gap-4 text-[color:var(--pt-50)] light:text-[color:var(--text-strong)]";
const modalMessageClassName = "text-[1.05rem] leading-[1.5] text-[color:var(--pt-120)] light:text-[color:var(--text-strong)]";
const modalActionsClassName = "flex flex-wrap justify-end gap-3";
export default function ModalConfirm({
  message,
  confirmLabel = "Jah",
  cancelLabel = "Katkesta",
  onConfirm,
  onCancel,
  disabled = false
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
  const modal = <Modal open onClose={onCancel} closeOnOverlayClick={false} aria-label={typeof message === "string" ? message : "Confirm dialog"} contentClassName={modalContentClassName}>
      <p className={modalMessageClassName}>{message}</p>
      <div className={modalActionsClassName}>
        <Button type="button" variant="primary" onClick={onConfirm} disabled={disabled}>
          <span>{confirmLabel}</span>
        </Button>
        {cancelLabel ? <Button type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
            <span>{cancelLabel}</span>
          </Button> : null}
      </div>
    </Modal>;
  return createPortal(modal, document.body);
}
