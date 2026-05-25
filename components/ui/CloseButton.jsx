"use client";

import React from "react";
import { X } from "lucide-react";

export default function CloseButton({
  onClick,
  className = "",
  ariaLabel
}) {
  const baseClasses =
    "relative inline-flex h-[2.65rem] w-[2.65rem] items-center justify-center rounded-none border-0 bg-transparent p-0 text-[2.05rem] leading-none text-inherit shadow-none transition-[transform,color,opacity] duration-[180ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-[1px] active:translate-y-[1px] focus-visible:outline-none cursor-[var(--cursor-pointer)] select-none";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || "Close"}
      className={`${baseClasses} ${className}`.trim()}
    >
      <X aria-hidden="true" className="h-[58%] w-[58%]" strokeWidth={2.1} />
    </button>
  );
}
