"use client";

import { HTML_ATTR } from "./options";

export function applyHtmlAttributes(values) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!root) return;
  if (values.contrast) root.setAttribute(HTML_ATTR.contrast, values.contrast);
  if (values.fontSize) root.setAttribute(HTML_ATTR.fontSize, values.fontSize);
  if (values.motion) root.setAttribute(HTML_ATTR.motion, values.motion);
}

export function readHtmlAttributes() {
  if (typeof document === "undefined") {
    return { contrast: null, fontSize: null, motion: null };
  }
  const root = document.documentElement;
  return {
    contrast: root.getAttribute(HTML_ATTR.contrast),
    fontSize: root.getAttribute(HTML_ATTR.fontSize),
    motion: root.getAttribute(HTML_ATTR.motion),
  };
}
