"use client";

import React from "react";
export default function CloseButton({
  onClick,
  className,
  ariaLabel
}) {
  return <button type="button" onClick={onClick} aria-label={ariaLabel || "Close"} className={`invite-modal__close modal-close-btn ${className || ""}`}>
      &times;
    </button>;
}