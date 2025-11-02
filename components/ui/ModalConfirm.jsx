"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
export default function ModalConfirm({
  message,
  confirmLabel = "Jah",
  cancelLabel = "Katkesta",
  onConfirm,
  onCancel,
  disabled = false,
}) {
  // Lukusta taustakerimine modali ajal
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  // ESC sulgemiseks (kui onCancel on olemas ja pole disabled)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && onCancel && !disabled) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, disabled]);
  const modal =
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" aria-hidden="true" />
      {/* Kinnitusaken */}
      <div className="modal-confirm" role="dialog" aria-modal="true">
        <p className="modal-confirm-text">{message}</p>
        <div className="btn-row">
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmLabel}
          </button>
          {cancelLabel ? (
            <button
              type="button"
              className="btn-tertiary"
              onClick={onCancel}
              disabled={disabled}
            >
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </div>
    </>;
  // ⟵ see on võtmetähtsusega: renderda otse <body> alla
  return createPortal(modal, document.body);
}
