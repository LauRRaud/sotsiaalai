"use client";
import React from "react";

export default function ModalConfirm({
  message,
  confirmLabel = "Jah",
  cancelLabel = "Katkesta",
  onConfirm,
  onCancel,
  disabled = false,
}) {
  return (
    <div className="modal-confirm" role="dialog" aria-modal="true">
      <p>{message}</p>
      <div className="btn-row">
        <button className="btn-danger" onClick={onConfirm} disabled={disabled}>
          {confirmLabel}
        </button>
        {cancelLabel ? (
          <button className="btn-tertiary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
