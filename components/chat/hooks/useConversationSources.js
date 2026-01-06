import { useEffect, useMemo, useRef, useState } from "react";
import { collapsePages, formatSourceLabel } from "../utils/sources";

export function useConversationSources({ messages, showSourcesPanel }) {
  const [sourcesPulse, setSourcesPulse] = useState(false);
  const sourcesPulseTimerRef = useRef(null);
  const prevSourcesCountRef = useRef(0);

  const conversationSources = useMemo(() => {
    const map = new Map();

    (Array.isArray(messages) ? messages : []).forEach((m) => {
      const sources = Array.isArray(m?.sources) ? m.sources : [];
      sources.forEach((src, idx) => {
        const url =
          typeof src?.url === "string" && src.url.trim() ? src.url.trim() : "";
        const label = formatSourceLabel(src?.label || src?.title || url || "Allikas");
        const pageText =
          src?.pageRange ||
          collapsePages([
            ...(Array.isArray(src?.pages) ? src.pages : []),
            ...(src?.page ? [src.page] : []),
          ]);

        const section = typeof src?.section === "string" ? src.section : undefined;
        const key = src?.key || src?.id || url || `${label}-${pageText || ""}-${idx}`;

        const existing =
          map.get(key) || {
            key,
            label,
            pageText,
            section,
            allUrls: [],
            occurrences: 0,
          };

        if (url && !existing.allUrls.includes(url)) existing.allUrls.push(url);
        existing.occurrences += 1;
        map.set(key, existing);
      });
    });

    return Array.from(map.values());
  }, [messages]);

  const hasConversationSources = conversationSources.length > 0;

  useEffect(() => {
    const currentCount = conversationSources.length;
    const prevCount = prevSourcesCountRef.current;
    prevSourcesCountRef.current = currentCount;

    if (!showSourcesPanel && currentCount > prevCount && currentCount > 0) {
      setSourcesPulse(true);
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
      sourcesPulseTimerRef.current = window.setTimeout(() => {
        setSourcesPulse(false);
      }, 1000);
    }

    return () => {
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
    };
  }, [conversationSources.length, showSourcesPanel]);

  return {
    conversationSources,
    hasConversationSources,
    sourcesPulse,
  };
}
