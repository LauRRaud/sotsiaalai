import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export function useChatAnalysisController({
  t,
  locale,
  sessionUserId,
  chatWindowRef,
  visibleMessagesCount,
  isGeneratingRef,
}) {
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadUsage, setUploadUsage] = useState(null);
  const [ephemeralChunks, setEphemeralChunks] = useState([]);
  const [docOnlyMode, setDocOnlyMode] = useState(true);

  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [analysisCollapsed, setAnalysisCollapsed] = useState(false);
  const [analysisPanelInline, setAnalysisPanelInline] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const fileInputRef = useRef(null);
  const analysisPanelRef = useRef(null);

  const hasAnalysisContent = !!(uploadPreview || uploadBusy);
  const hasAnyAnalysisState = !!(uploadPreview || uploadBusy || uploadError);
  const showAnalysisPanel = analysisPanelOpen || hasAnyAnalysisState;

  const previewText = useMemo(() => {
    if (uploadPreview?.fullText && uploadPreview.fullText.trim()) return uploadPreview.fullText;
    if (uploadPreview?.preview && uploadPreview.preview.trim()) return uploadPreview.preview;
    return "";
  }, [uploadPreview]);

  const isAnalysisExpanded = Boolean(previewText && !analysisCollapsed);
  const forceOverlay = !uploadPreview;

  const analysisPanelMode = isAnalysisExpanded
    ? "expanded"
    : analysisPanelInline && !isMobileViewport && !forceOverlay
    ? "inline"
    : "overlay";

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 48em)");
    const update = () => setIsMobileViewport(!!mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const scrollAnalysisPanelIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        const panel = analysisPanelRef.current;
        if (!panel) return;
        if (!panel.closest(".chat-container")) return;
        const mode = panel.dataset?.analysisMode;
        if (!mode) return;
        if (mode === "overlay" || mode === "expanded") return;
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch {}
    });
  }, []);
  const preservePageScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const y = window.scrollY;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
      });
    });
  }, []);

  const ensureAnalysisPanelVisible = useCallback(() => {
    preservePageScroll();
    setAnalysisCollapsed(false);
    setAnalysisPanelOpen(true);
    scrollAnalysisPanelIntoView();
  }, [preservePageScroll, scrollAnalysisPanelIntoView]);

  const toggleAnalysisCollapse = useCallback(() => {
    if (!hasAnalysisContent) return;
    setAnalysisCollapsed((prev) => !prev);
  }, [hasAnalysisContent]);

  const closeAnalysisPanel = useCallback(() => {
    if (hasAnalysisContent) return;
    setAnalysisPanelOpen(false);
    setAnalysisCollapsed(false);
  }, [hasAnalysisContent]);

  useEffect(() => {
    if (hasAnyAnalysisState) {
      preservePageScroll();
      setAnalysisCollapsed(false);
      setAnalysisPanelOpen(true);
      scrollAnalysisPanelIntoView();
    } else {
      setAnalysisCollapsed(false);
    }
  }, [hasAnyAnalysisState, preservePageScroll, scrollAnalysisPanelIntoView]);

  useLayoutEffect(() => {
    if (isMobileViewport || !showAnalysisPanel || isAnalysisExpanded) {
      setAnalysisPanelInline(false);
      return;
    }
    const node = chatWindowRef?.current;
    if (!node) return;

    const updateLayout = () => {
      const hasOverflow = node.scrollHeight - node.clientHeight > 8;
      setAnalysisPanelInline((prev) => {
        const next = !hasOverflow;
        return prev === next ? prev : next;
      });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateLayout);
      ro.observe(node);
    }
    return () => {
      window.removeEventListener("resize", updateLayout);
      ro?.disconnect?.();
    };
  }, [isMobileViewport, showAnalysisPanel, isAnalysisExpanded, visibleMessagesCount, chatWindowRef]);

  const MAX_UPLOAD_MB = useMemo(() => {
    const v = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 50);
    return Number.isFinite(v) && v > 0 ? v : 50;
  }, []);

  const RAW_ALLOWED_MIME = String(
    process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME ||
      "application/pdf,text/plain,text/markdown,text/html,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );

  const ALLOWED_MIME_LIST = useMemo(() => {
    const out = RAW_ALLOWED_MIME.split(",").map((s) => s.trim()).filter(Boolean);
    return out.length ? out : ["application/pdf"];
  }, [RAW_ALLOWED_MIME]);

  const acceptAttr = useMemo(() => {
    const set = new Set();
    ALLOWED_MIME_LIST.forEach((m) => {
      if (m === "application/pdf") {
        set.add(m);
        set.add(".pdf");
      } else if (m === "text/plain") {
        set.add(m);
        set.add(".txt");
      } else if (m === "text/markdown") {
        set.add(m);
        set.add(".md");
        set.add(".markdown");
      } else if (m === "text/html") {
        set.add(m);
        set.add(".html");
        set.add(".htm");
      } else if (m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        set.add(m);
        set.add(".docx");
      } else {
        set.add(m);
      }
    });
    return Array.from(set).join(",");
  }, [ALLOWED_MIME_LIST]);

  const refreshUsage = useCallback(async () => {
    if (!sessionUserId) return;
    try {
      const res = await fetch("/api/chat/analyze-usage", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setUploadUsage({
          used: typeof data.used === "number" ? data.used : 0,
          limit: typeof data.limit === "number" ? data.limit : 0,
        });
      }
    } catch {}
  }, [sessionUserId]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const onPickFile = useCallback(() => {
    ensureAnalysisPanelVisible();
    if (uploadBusy) return;
    if (isGeneratingRef?.current) return;
    setUploadError(null);
    try {
      fileInputRef.current?.click?.();
    } catch {}
  }, [ensureAnalysisPanelVisible, uploadBusy, isGeneratingRef]);

  const onFileChange = useCallback(
    async (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      setUploadError(null);
      setDocOnlyMode(true);

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_UPLOAD_MB) {
        const sizeError = t("chat.upload.error_size", "Fail on liiga suur ({size}MB > {limit}MB).")
          .replace("{size}", sizeMB.toFixed(1))
          .replace("{limit}", String(MAX_UPLOAD_MB));
        setUploadError(sizeError);
        e.target.value = "";
        return;
      }

      try {
        setUploadBusy(true);
        const fd = new FormData();
        fd.append("file", file, file.name || "file");
        fd.append("mimeType", file.type || "");

        const res = await fetch("/api/chat/analyze-file", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({ ok: false }));

        if (!res.ok || !data?.ok) {
          const statusError = t(
            "chat.upload.error_status",
            "Dokumendi analüüs ebaõnnestus (veakood {status})."
          ).replace("{status}", String(res.status));
          throw new Error(data?.message || statusError);
        }

        const chunksArray = Array.isArray(data.chunks) ? data.chunks : [];
        setUploadPreview({
          fileName: data.fileName || file.name,
          sizeMB: typeof data.sizeMB === "number" ? data.sizeMB : Number(sizeMB.toFixed(2)),
          mimeType: data.mimeType || file.type,
          preview: data.preview || "",
          fullText:
            typeof data.fullText === "string" && data.fullText.trim()
              ? data.fullText
              : chunksArray.length
              ? chunksArray.join("\n\n")
              : data.preview || "",
          chunksCount: chunksArray.length,
        });

        setEphemeralChunks(chunksArray);
        setDocOnlyMode(true);
        refreshUsage();
      } catch (err) {
        const genericError = t("chat.upload.error_generic", "Dokumendi analüüs ebaõnnestus.");
        setUploadError(err?.message || genericError);
        setUploadPreview(null);
        setEphemeralChunks([]);
        setDocOnlyMode(true);
      } finally {
        setUploadBusy(false);
        e.target.value = "";
      }
    },
    [MAX_UPLOAD_MB, refreshUsage, t]
  );

  return {
    analysisPanelRef,
    fileInputRef,
    uploadPreview,
    uploadBusy,
    uploadError,
    uploadUsage,
    previewText,
    docOnlyMode,
    setDocOnlyMode,
    ephemeralChunks,
    setEphemeralChunks,
    analysisCollapsed,
    showAnalysisPanel,
    analysisPanelMode,
    ensureAnalysisPanelVisible,
    toggleAnalysisCollapse,
    closeAnalysisPanel,
    onPickFile,
    onFileChange,
    setUploadPreview,
    setUploadError,
    acceptAttr,
  };
}
