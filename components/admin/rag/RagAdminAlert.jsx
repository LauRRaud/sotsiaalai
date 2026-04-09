"use client";

import {
  alertBaseClassName,
  alertErrorClassName,
  alertOkClassName
} from "./ragAdminShared";

export default function RagAdminAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      className={`${alertBaseClassName} ${message.type === "error" ? alertErrorClassName : alertOkClassName}`}
      onClick={onDismiss}
    >
      {message.text}
    </div>
  );
}
