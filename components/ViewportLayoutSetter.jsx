"use client";

import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

function applyLayoutFlag(matches) {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  if (matches) {
    root.setAttribute("data-layout", "mobile");
    body.setAttribute("data-layout", "mobile");
  } else {
    root.removeAttribute("data-layout");
    body.removeAttribute("data-layout");
  }
}

export default function ViewportLayoutSetter() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(MOBILE_QUERY);

    const applyFromMatches = (value) => {
      const matches = typeof value === "boolean" ? value : value.matches;
      applyLayoutFlag(matches);
    };

    applyFromMatches(mediaQueryList.matches);

    const listener = (event) => applyFromMatches(event);

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", listener);
    } else if (typeof mediaQueryList.addListener === "function") {
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener("change", listener);
      } else if (typeof mediaQueryList.removeListener === "function") {
        mediaQueryList.removeListener(listener);
      }

      applyLayoutFlag(false);
    };
  }, []);

  return null;
}
