"use client";

import { useEffect, useState } from "react";
import { HTML_ATTR } from "./options";

function readAttribute(attrName, defaultValue) {
  if (typeof document === "undefined") return defaultValue;
  const root = document.documentElement;
  if (!root) return defaultValue;
  const value = root.getAttribute(attrName);
  if (value) return value;

  if (
    attrName === HTML_ATTR.motion &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)")?.matches) {
        return "reduce";
      }
    } catch {
      /* ignore */
    }
  }

  return defaultValue;
}

export function useMotionPreference(defaultValue = "normal") {
  const [motion, setMotion] = useState(() => readAttribute(HTML_ATTR.motion, defaultValue));

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    if (!root) return undefined;

    const update = () => {
      setMotion(readAttribute(HTML_ATTR.motion, defaultValue));
    };

    update();

    if (typeof MutationObserver !== "function") {
      return undefined;
    }

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === HTML_ATTR.motion)) {
        update();
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: [HTML_ATTR.motion] });

    return () => {
      observer.disconnect();
    };
  }, [defaultValue]);

  return motion;
}
