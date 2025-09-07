"use client";
import React from "react";

export default function ModalConfirm({
  message,
  confirmLabel = "Jah",
  cancelLabel = "Katkesta",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-confirm" role="dialog" aria-modal="true">
      <p>{message}</p>
      <div className="btn-row">
        <button className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn-tertiary" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
