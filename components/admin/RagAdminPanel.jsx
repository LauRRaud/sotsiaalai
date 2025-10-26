"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

/* ---------- Konstandid & sildid ---------- */

const STATUS_LABELS = {
  PENDING: "Ootel",
  PROCESSING: "Töötlemisel",
  COMPLETED: "Valmis",
  FAILED: "Ebaõnnestus",
};

const STATUS_STYLES = {
  PENDING: { backgroundColor: "rgba(255, 215, 0, 0.16)", color: "#d4a200" },
  PROCESSING: { backgroundColor: "rgba(0, 153, 255, 0.16)", color: "#48a6ff" },
  COMPLETED: { backgroundColor: "rgba(46, 204, 113, 0.16)", color: "#58d68d" },
  FAILED: { backgroundColor: "rgba(231, 76, 60, 0.16)", color: "#ff8a8a" },
};

const TYPE_LABELS = { FILE: "Fail", URL: "URL" };

const AUDIENCE_OPTIONS = [
  { value: "SOCIAL_WORKER", label: "Sotsiaaltöö spetsialist" },
  { value: "CLIENT", label: "Eluküsimusega pöörduja" },
  { value: "BOTH", label: "Mõlemad" },
];

const AUDIENCE_LABELS = {
  SOCIAL_WORKER: "Sotsiaaltöö spetsialist",
  CLIENT: "Eluküsimusega pöörduja",
  BOTH: "Mõlemad",
};

const DOC_KIND_OPTIONS = [
  { value: "NORMAL", label: "Tavaline dokument" },
  { value: "MAGAZINE", label: "Ajakiri (artiklite kaupa)" },
];

/* ---------- Avalikud .env sätted ---------- */

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 20);
const RAW_ALLOWED_MIME = String(
  process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME ||
    "application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
);

// Pollingu intervall (ms)
const DEFAULT_POLL_MS = 15000;
const POLL_MS = Number(process.env.NEXT_PUBLIC_RAG_POLL_MS || DEFAULT_POLL_MS);

// puhastame ja teeme komplekti kiireks võrdlemiseks
const ALLOWED_MIME_LIST = RAW_ALLOWED_MIME.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_MIME_SET = new Set(ALLOWED_MIME_LIST);

// püüame tuletada `accept` atribuudi (lisame ka levinud laiendid)
const ACCEPT_ATTR = [
  ...new Set(
    ALLOWED_MIME_LIST.flatMap((m) => {
      if (m === "application/pdf") return [m, ".pdf"];
      if (m === "text/plain") return [m, ".txt"];
      if (m === "text/markdown") return [m, ".md", ".markdown"];
      if (m === "text/html") return [m, ".html", ".htm"];
      if (m === "application/msword") return [m, ".doc"];
      if (m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        return [m, ".docx"];
      return [m];
    })
  ),
].join(",");

/* ---------- Abifunktsioonid ---------- */

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  if (!bytes || Number.isNaN(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("et-EE", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(value)
    );
  } catch {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }
}

function statusBadgeStyle(status) {
  return (
    STATUS_STYLES[status] || {
      backgroundColor: "rgba(255,255,255,0.12)",
      color: "#ffffff",
    }
  );
}

function deriveStatus(doc) {
  return doc && doc.status ? doc.status : "COMPLETED";
}
function deriveSyncedAt(doc) {
  return doc?.insertedAt || doc?.lastIngested || doc?.updatedAt || doc?.createdAt || null;
}

function splitAuthors(input) {
  if (!input) return [];
  return input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/* ---------- Komponent ---------- */

export default function RagAdminPanel() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null);
  const [selftestBusy, setSelftestBusy] = useState(false);
  const [selftestSteps, setSelftestSteps] = useState(null);

  // fail
  const [fileBusy, setFileBusy] = useState(false);
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0, type: "" });
  const [fileAudience, setFileAudience] = useState("BOTH");
  const [docKind, setDocKind] = useState("NORMAL");

  // ajakirja meta (faili uploadi ajal)
  const [journalTitle, setJournalTitle] = useState("");
  const [issueLabel, setIssueLabel] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [authors, setAuthors] = useState("");
  const [pageRange, setPageRange] = useState("");

  // pärast ajakirja PDF uploadi
  const [lastUploadedDocId, setLastUploadedDocId] = useState(null); // RAG remoteId!
  const [lastUploadedFileName, setLastUploadedFileName] = useState(null);

  // artiklite koostaja
  const [articleOffset, setArticleOffset] = useState(""); // nt "2"
  const [drafts, setDrafts] = useState([]);
  const [articlesBusy, setArticlesBusy] = useState(false);

  // url
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlAudience, setUrlAudience] = useState("BOTH");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlDescription, setUrlDescription] = useState("");

  // tegevused
  const [reindexingId, setReindexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fileFormRef = useRef(null);
  const fileInputRef = useRef(null);
  const urlFormRef = useRef(null);
  const fetchAbortRef = useRef(null);

  /* ----- localStorage püsivus (ajakirja seanss + docKind) ----- */

  // loe seanss mountimisel
  useEffect(() => {
    try {
      const savedDocId = localStorage.getItem("rag.magazine.lastDocId");
      const savedFileName = localStorage.getItem("rag.magazine.lastFileName");
      const savedKind = localStorage.getItem("rag.docKind");
      if (savedDocId) setLastUploadedDocId(savedDocId);
      if (savedFileName) setLastUploadedFileName(savedFileName);
      if (savedKind && (savedKind === "NORMAL" || savedKind === "MAGAZINE")) setDocKind(savedKind);
    } catch {}
  }, []);

  // kirjuta seanss muutustel
  useEffect(() => {
    try {
      if (lastUploadedDocId) localStorage.setItem("rag.magazine.lastDocId", String(lastUploadedDocId));
      else localStorage.removeItem("rag.magazine.lastDocId");
      if (lastUploadedFileName)
        localStorage.setItem("rag.magazine.lastFileName", String(lastUploadedFileName));
      else localStorage.removeItem("rag.magazine.lastFileName");
    } catch {}
  }, [lastUploadedDocId, lastUploadedFileName]);

  useEffect(() => {
    try {
      localStorage.setItem("rag.docKind", String(docKind));
    } catch {}
  }, [docKind]);

  const endMagazineSession = useCallback(() => {
    setLastUploadedDocId(null);
    setLastUploadedFileName(null);
    try {
      localStorage.removeItem("rag.magazine.lastDocId");
      localStorage.removeItem("rag.magazine.lastFileName");
    } catch {}
  }, []);

  /* ----- utils ----- */

  const resetMessage = useCallback(() => setMessage(null), []);
  const getAudienceLabel = useCallback(
    (value) => AUDIENCE_LABELS[value] || (value ? value : "-"),
    []
  );
  const showError = useCallback((text) => setMessage({ type: "error", text }), []);
  const showOk = useCallback((text) => setMessage({ type: "success", text }), []);

  const runSelftest = useCallback(async () => {
    if (selftestBusy) return;
    setSelftestBusy(true);
    setSelftestSteps(null);
    try {
      const res = await fetch("/api/rag-admin/selftest", { method: "POST", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data || data.ok === false) {
        setSelftestSteps(Array.isArray(data?.steps) ? data.steps : []);
        setMessage({ type: "error", text: data?.message || "Isetest ebaõnnestus." });
      } else {
        setSelftestSteps(Array.isArray(data?.steps) ? data.steps : []);
        setMessage({ type: "success", text: "Isetest lõpetatud." });
        try { await fetchDocuments(); } catch {}
      }
    } catch (e) {
      setMessage({ type: "error", text: "Isetest katkestus." });
    } finally {
      setSelftestBusy(false);
    }
  }, [selftestBusy, fetchDocuments]);

  const canReindex = useCallback((doc) => {
    const st = deriveStatus(doc);
    return st === "COMPLETED" || st === "FAILED";
  }, []);

  const canDelete = useCallback((doc) => {
    const st = deriveStatus(doc);
    return st === "COMPLETED" || st === "FAILED" || !doc?.status;
  }, []);

  /* ----- laadimine + automaatne värskendus ----- */

  const fetchDocuments = useCallback(async () => {
    fetchAbortRef.current?.abort?.();
    const ac = new AbortController();
    fetchAbortRef.current = ac;
    setLoadingList(true);
    try {
      const res = await fetch("/api/rag-admin/documents?limit=50", {
        cache: "no-store",
        signal: ac.signal,
      });
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        throw new Error("Server tagastas vigase JSON-i dokumentide loetelule.");
      }
      if (!res.ok) throw new Error(data?.message || "Dokumentide laadimine ebaõnnestus.");

      const list = Array.isArray(data) ? data : Array.isArray(data?.docs) ? data.docs : [];
      setDocs(list);
    } catch (err) {
      if (err?.name !== "AbortError") {
        showError(err?.message || "Dokumentide laadimine ebaõnnestus.");
      }
    } finally {
      setLoadingList(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDocuments();
    return () => fetchAbortRef.current?.abort?.();
  }, [fetchDocuments]);

  // Kui on PENDING/PROCESSING, värskenda intervalliga (POLL_MS)
  useEffect(() => {
    const hasWork = docs.some((d) => {
      const st = deriveStatus(d);
      return st === "PENDING" || st === "PROCESSING";
    });
    if (!hasWork) return;

    let timer = null;
    const start = () => {
      if (!document.hidden && !timer) {
        fetchDocuments();
        timer = setInterval(fetchDocuments, POLL_MS);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [docs, fetchDocuments]);

  /* ----- faililaadimine ----- */

  const onFileChange = useCallback(
    (event) => {
      resetMessage();
      const file = event.target.files && event.target.files[0];
      if (!file) {
        setFileInfo({ name: "", size: 0, type: "" });
        return;
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });
      const form = fileFormRef.current;
      if (form && !form.title?.value) {
        form.title.value = file.name.replace(/\.[^.]+$/, "");
      }
    },
    [resetMessage]
  );

  function validateFileBeforeUpload(file) {
    const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(
        `Fail on liiga suur (${formatBytes(file.size)}). Lubatud kuni ${MAX_UPLOAD_MB} MB.`
      );
    }
    // MIME kontroll leebe — brauseri accept juba filtreerib; server teeb lõpliku kontrolli
  }

  const handleFileSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      resetMessage();

      const fileInput = fileInputRef.current;
      const file = fileInput?.files?.[0];
      if (!file) {
        showError("Vali fail enne saatmist.");
        return;
      }

      try {
        validateFileBeforeUpload(file);
      } catch (err) {
        showError(err.message);
        return;
      }

      const form = event.currentTarget;
      const formData = new FormData();
      formData.append("file", file);

      const title = form.title?.value?.trim();
      const description = form.description?.value?.trim();
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("audience", fileAudience);

      // lisa ajakirja meta — need on backendis toetatud
      if (journalTitle.trim()) formData.append("journalTitle", journalTitle.trim());
      if (issueLabel.trim()) formData.append("issueLabel", issueLabel.trim());
      if (year.trim()) formData.append("year", year.trim());
      if (section.trim()) formData.append("section", section.trim());
      if (authors.trim()) formData.append("authors", authors.trim());
      if (pageRange.trim()) formData.append("pageRange", pageRange.trim());

      setFileBusy(true);
      try {
        const res = await fetch("/api/rag-admin/upload", { method: "POST", body: formData });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};

        if (!res.ok) {
          if (res.status === 413) throw new Error("Fail on liiga suur serveri jaoks (413).");
          if (res.status === 415) throw new Error("Faili tüüp pole lubatud (415).");
          throw new Error(data?.message || "Faili laadimine ebaõnnestus.");
        }

        showOk("Fail saadeti RAG andmebaasi.");
        setFileInfo({ name: "", size: 0, type: "" });
        setFileAudience("BOTH");

        // kasuta remoteId-d (või id fallbackina)
        const remoteId = data?.doc?.remoteId ?? null;
        const fallbackId = data?.doc?.id ?? null;
        const useId = remoteId || fallbackId;

        if (docKind === "MAGAZINE") {
          setLastUploadedDocId(useId);
          setLastUploadedFileName(file.name || null);
          try {
            localStorage.setItem("rag.magazine.lastDocId", String(useId));
            localStorage.setItem("rag.magazine.lastFileName", String(file.name || ""));
          } catch {}
        } else {
          endMagazineSession();
        }

        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "Faili laadimine ebaõnnestus.");
      } finally {
        setFileBusy(false);
      }
    },
    [
      fetchDocuments,
      fileAudience,
      resetMessage,
      showError,
      showOk,
      journalTitle,
      issueLabel,
      year,
      section,
      authors,
      pageRange,
      docKind,
      endMagazineSession,
    ]
  );

  /* ----- URL lisamine ----- */

  const handleUrlSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      resetMessage();
      const form = event.currentTarget;
      const urlValue = form.url?.value?.trim();
      if (!urlValue) {
        showError("Sisesta URL.");
        return;
      }

      const payload = { url: urlValue, audience: urlAudience };
      if (urlTitle.trim()) payload.title = urlTitle.trim();
      if (urlDescription.trim()) payload.description = urlDescription.trim();

      setUrlBusy(true);
      try {
        const res = await fetch("/api/rag-admin/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok) {
          throw new Error(data?.message || "URL lisamine ebaõnnestus.");
        }

        showOk("URL saadeti RAG andmebaasi.");
        setUrlAudience("BOTH");
        setUrlTitle("");
        setUrlDescription("");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "URL lisamine ebaõnnestus.");
      } finally {
        setUrlBusy(false);
      }
    },
    [fetchDocuments, resetMessage, urlAudience, showError, showOk, urlTitle, urlDescription]
  );

  /* ----- Taasingestus / kustutus ----- */

  const handleReindex = useCallback(
    async (docId) => {
      resetMessage();
      setReindexingId(docId);
      try {
        const res = await fetch(`/api/rag-admin/documents/${docId}/reindex`, { method: "POST" });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok) {
          throw new Error(data?.message || "Taasindekseerimine ebaõnnestus.");
        }
        showOk("Taasingestus algatatud.");
        setDocs((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, ...data.doc } : doc)));
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "Taasindekseerimine ebaõnnestus.");
      } finally {
        setReindexingId(null);
      }
    },
    [fetchDocuments, resetMessage, showError, showOk]
  );

  const handleDelete = useCallback(
    async (docId) => {
      resetMessage();
      if (!docId) return;
      if (!confirm("Kas soovid selle kirje kustutada? Seda ei saa tagasi võtta.")) return;
      setDeletingId(docId);
      try {
        const res = await fetch(`/api/rag-admin/documents/${docId}`, { method: "DELETE" });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok) throw new Error(data?.message || "Kustutamine ebaõnnestus.");
        showOk("Dokument kustutatud.");
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      } catch (err) {
        showError(err?.message || "Kustutamine ebaõnnestus.");
      } finally {
        setDeletingId(null);
      }
    },
    [resetMessage, showOk, showError]
  );

  const manualRefresh = useCallback(() => {
    resetMessage();
    fetchDocuments();
  }, [fetchDocuments, resetMessage]);

  const fileHint = useMemo(() => {
    if (!fileInfo.name) return "Valitud faili ei ole.";
    return `${fileInfo.name} (${formatBytes(fileInfo.size)}${
      fileInfo.type ? `, ${fileInfo.type}` : ""
    })`;
  }, [fileInfo]);

  /* ----- Artiklite koostaja (ajakirja workflow) ----- */

  const addDraft = useCallback(() => {
    setDrafts((prev) => [
      ...prev,
      { title: "", authors: "", section: "", pageRange: "", audience: fileAudience },
    ]);
  }, [fileAudience]);

  const updateDraft = useCallback((idx, patch) => {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }, []);

  const removeDraft = useCallback((idx) => {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const ingestArticles = useCallback(async () => {
    resetMessage();

    if (!lastUploadedDocId) {
      showError("Ajakirja PDF puudub või upload ei andnud docId-d.");
      return;
    }
    if (drafts.length === 0) {
      showError("Lisa vähemalt üks artikkel.");
      return;
    }

    const offsetNum = articleOffset.trim() ? Number(articleOffset.trim()) : null;
    if (articleOffset.trim() && Number.isNaN(offsetNum)) {
      showError("Offset peab olema täisarv (nt 2).");
      return;
    }

    const payload = {
      docId: lastUploadedDocId,
      articles: drafts.map((d) => {
        const obj = {
          title: d.title?.trim(),
          authors: splitAuthors(d.authors),
          section: d.section?.trim() || undefined,
          pageRange: d.pageRange?.trim(),
          offset: offsetNum ?? undefined,
          year: year.trim() ? Number(year.trim()) : undefined,
          journalTitle: journalTitle.trim() || undefined,
          issueLabel: issueLabel.trim() || undefined,
          audience: d.audience || fileAudience,
          description: d.description?.trim() || undefined,
        };
        const hasStart = typeof d.startPage === "string" ? d.startPage.trim() : d.startPage;
        const hasEnd = typeof d.endPage === "string" ? d.endPage.trim() : d.endPage;
        if (hasStart || hasEnd) {
          const s = Number(d.startPage);
          const e = Number(d.endPage);
          if (Number.isNaN(s) || Number.isNaN(e)) {
            throw new Error("startPage/endPage peavad olema täisarvud.");
          }
          obj.startPage = s;
          obj.endPage = e;
          delete obj.offset;
        }
        return obj;
      }),
    };

    setArticlesBusy(true);
    try {
      const res = await fetch("/api/rag-admin/ingest-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) {
        throw new Error(data?.message || "Artiklite ingest ebaõnnestus.");
      }
      showOk(
        `Lisati ${typeof data?.count === "number" ? data.count : drafts.length} artiklit.`
      );
      setDrafts([]);
      setArticleOffset("");
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || "Artiklite ingest ebaõnnestus.");
    } finally {
      setArticlesBusy(false);
    }
  }, [
    lastUploadedDocId,
    drafts,
    articleOffset,
    showError,
    resetMessage,
    showOk,
    fetchDocuments,
    year,
    journalTitle,
    issueLabel,
    fileAudience,
  ]);

  /* ---------- UI ---------- */

  return (
    <section
      id="rag-admin"
      className="glass-section"
      aria-label="RAG andmebaasi haldus"
      style={{ display: "grid", gap: "1.5rem" }}
    >
      <div>
        <h2 className="glass-h2" style={{ marginBottom: "0.35rem" }}>
          RAG andmebaasi haldus
        </h2>
        <p style={{ maxWidth: "720px", fontSize: "0.95rem", opacity: 0.85 }}>
          Lae turvaliselt materjale RAG indeksisse või lisa veebilehti, et assistent saaks neid
          allikana kasutada.
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.65, marginTop: "0.35rem" }}>
          Maksimaalne faili suurus: <strong>{MAX_UPLOAD_MB} MB</strong> • Lubatud tüübid:{" "}
          <span title={RAW_ALLOWED_MIME}>{ALLOWED_MIME_LIST.join(", ")}</span>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={runSelftest}
            disabled={selftestBusy}
            style={{
              border: "1px solid rgba(148,163,184,0.25)",
              background: selftestBusy ? "rgba(148,163,184,0.12)" : "rgba(12,14,22,0.5)",
              color: "#e2e8f0",
              borderRadius: 10,
              padding: "0.45rem 0.8rem",
              cursor: selftestBusy ? "default" : "pointer",
            }}
          >
            {selftestBusy ? "Kontrollin…" : "Tee isetest (RAG + vestlus)"}
          </button>
          {Array.isArray(selftestSteps) && selftestSteps.length ? (
            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {selftestSteps.filter((s) => s.ok).length}/{selftestSteps.length} sammu OK
            </span>
          ) : null}
        </div>
        {Array.isArray(selftestSteps) && selftestSteps.length ? (
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.8 }}>
            {selftestSteps.map((s, i) => (
              <div key={`${s.name}-${i}`}>
                {s.ok ? "✅" : "❌"} {s.name}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            border:
              message.type === "error"
                ? "1px solid rgba(231,76,60,0.4)"
                : "1px solid rgba(46,204,113,0.3)",
            backgroundColor:
              message.type === "error" ? "rgba(231,76,60,0.12)" : "rgba(46,204,113,0.12)",
            color: message.type === "error" ? "#ff9c9c" : "#7be2a4",
          }}
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {/* --- Faili vorm --- */}
        <form
          ref={fileFormRef}
          onSubmit={handleFileSubmit}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "1rem 1.2rem",
            background: "rgba(12,14,22,0.6)",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Lisa fail</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                Lubatud: {ALLOWED_MIME_LIST.join(", ")} (kuni {MAX_UPLOAD_MB} MB).
              </p>
            </div>
            {docKind === "MAGAZINE" && lastUploadedDocId && (
              <button type="button" onClick={endMagazineSession} style={smallGhostBtn()}>
                Lõpeta ajakirja seanss
              </button>
            )}
          </div>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Dokumendi tüüp *</span>
            <select
              value={docKind}
              onChange={(e) => setDocKind(e.target.value)}
              required
              style={{
                padding: "0.55rem 0.65rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,12,20,0.6)",
                color: "#f3f6ff",
              }}
            >
              {DOC_KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Pealkiri</span>
            <input
              name="title"
              type="text"
              placeholder="Valikuline (täidetakse vaikimisi failinimega)"
              style={{
                padding: "0.55rem 0.65rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,12,20,0.6)",
                color: "#f3f6ff",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Kirjeldus</span>
            <textarea
              name="description"
              placeholder="Valikuline kokkuvõte või märksõnad"
              rows={3}
              style={{
                padding: "0.55rem 0.65rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,12,20,0.6)",
                color: "#f3f6ff",
                resize: "vertical",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Sihtgrupp *</span>
            <select
              value={fileAudience}
              onChange={(e) => setFileAudience(e.target.value)}
              required
              style={{
                padding: "0.55rem 0.65rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,12,20,0.6)",
                color: "#f3f6ff",
              }}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {/* Ajakirja täiendavad väljad (valikuline, kuid kasulik artiklite jaoks) */}
          {docKind === "MAGAZINE" && (
            <div
              style={{
                borderTop: "1px dashed rgba(255,255,255,0.12)",
                paddingTop: "0.75rem",
                display: "grid",
                gap: "0.6rem",
              }}
            >
              <div style={{ fontSize: "0.88rem", opacity: 0.85, fontWeight: 600 }}>
                Ajakirja meta (valikuline, kuid soovituslik)
              </div>

              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                <span>Ajakiri (journalTitle)</span>
                <input
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  type="text"
                  placeholder="nt Sotsiaaltöö"
                  style={inputStyle()}
                />
              </label>

              <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "1fr 1fr" }}>
                <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                  <span>Väljalase (issueLabel)</span>
                  <input
                    value={issueLabel}
                    onChange={(e) => setIssueLabel(e.target.value)}
                    type="text"
                    placeholder="nt 2/2023"
                    style={inputStyle()}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                  <span>Aasta</span>
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder="nt 2023"
                    style={inputStyle()}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "1fr 1fr" }}>
                <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                  <span>Rubriik (section)</span>
                  <input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    type="text"
                    placeholder="nt Persoon"
                    style={inputStyle()}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                  <span>Autorid</span>
                  <input
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    type="text"
                    placeholder="nt Kadri Kuupak"
                    style={inputStyle()}
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.88rem" }}>
                <span>Lehekülgede vahemik (pageRange)</span>
                <input
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  type="text"
                  placeholder="nt 3–8"
                  style={inputStyle()}
                />
              </label>
            </div>
          )}

          <label style={{ display: "grid", gap: "0.5rem, 0.25rem", fontSize: "0.88rem" }}>
            <span>Fail *</span>
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept={ACCEPT_ATTR}
              onChange={onFileChange}
              style={{
                padding: "0.5rem",
                borderRadius: "10px",
                border: "1px dashed rgba(255,255,255,0.15)",
                background: "rgba(10,12,20,0.6)",
                color: "#f3f6ff",
              }}
              required
            />
            <span style={{ fontSize: "0.8rem", opacity: 0.65 }}>{fileHint}</span>
          </label>

          <button
            type="submit"
            disabled={fileBusy}
            style={ctaStyle(fileBusy, "#7757ff", "#9b6dff")}
          >
            {fileBusy ? "Laen..." : "Lisa fail RAG andmebaasi"}
          </button>
        </form>

        {/* --- URL-i vorm --- */}
        <form
          ref={urlFormRef}
          onSubmit={handleUrlSubmit}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "1rem 1.2rem",
            background: "rgba(12,14,22,0.6)",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Lisa veebileht</h3>
            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Sisesta URL, mida RAG süsteem peaks roomama ja lisama.
            </p>
          </div>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>URL *</span>
            <input name="url" type="url" required placeholder="https://..." style={inputStyle()} />
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Pealkiri</span>
            <input
              name="urlTitle"
              type="text"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              placeholder="Valikuline"
              style={inputStyle()}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Kirjeldus</span>
            <textarea
              name="urlDescription"
              value={urlDescription}
              onChange={(e) => setUrlDescription(e.target.value)}
              placeholder="Valikuline kokkuvõte või märksõnad"
              rows={3}
              style={{ ...inputStyle(), resize: "vertical" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
            <span>Sihtgrupp *</span>
            <select
              value={urlAudience}
              onChange={(e) => setUrlAudience(e.target.value)}
              required
              style={inputStyle()}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={urlBusy}
            style={ctaStyle(urlBusy, "#ff6b8a", "#ff8ba6")}
          >
            {urlBusy ? "Laen..." : "Lisa URL RAG andmebaasi"}
          </button>
        </form>
      </div>

      {/* --- Artiklite koostaja (kuvatakse kui ajakirja upload õnnestus) --- */}
      {docKind === "MAGAZINE" && lastUploadedDocId && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "1rem 1.2rem",
            background: "rgba(13,16,24,0.62)",
            display: "grid",
            gap: "0.9rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", margin: 0 }}>Artiklite ingest</h3>
              <p style={{ fontSize: "0.86rem", opacity: 0.75, marginTop: "0.25rem" }}>
                Viimati laetud ajakirja PDF: <strong>{lastUploadedFileName || "—"}</strong> •
                docId: <code style={{ opacity: 0.8 }}>{lastUploadedDocId}</code>
              </p>
            </div>
            <button type="button" onClick={addDraft} style={smallGhostBtn()}>
              Lisa artikkel
            </button>
          </div>

          <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "1fr" }}>
            <div
              style={{
                display: "grid",
                gap: "0.6rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                <span>Üldine offset (valikuline)</span>
                <input
                  value={articleOffset}
                  onChange={(e) => setArticleOffset(e.target.value)}
                  type="number"
                  inputMode="numeric"
                  placeholder="nt 2 (PDF-leht = trükileht + 2)"
                  style={inputStyle()}
                />
              </label>
              <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                <span>Ajakiri</span>
                <input
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  type="text"
                  placeholder="Sotsiaaltöö"
                  style={inputStyle()}
                />
              </label>
              <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                <span>Väljalase</span>
                <input
                  value={issueLabel}
                  onChange={(e) => setIssueLabel(e.target.value)}
                  type="text"
                  placeholder="2/2023"
                  style={inputStyle()}
                />
              </label>
              <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                <span>Aasta</span>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  type="number"
                  inputMode="numeric"
                  placeholder="2023"
                  style={inputStyle()}
                />
              </label>
            </div>

            {drafts.length === 0 ? (
              <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}>
                Lisa vähemalt üks artikkel.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {drafts.map((d, i) => (
                  <li
                    key={i}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      display: "grid",
                      gap: "0.65rem",
                      background: "rgba(15,18,26,0.55)",
                    }}
                  >
                    <div
                      style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}
                    >
                      <strong style={{ fontSize: "0.95rem" }}>Artikkel #{i + 1}</strong>
                      <button
                        type="button"
                        onClick={() => removeDraft(i)}
                        style={smallDangerBtn()}
                      >
                        Eemalda
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "0.6rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      }}
                    >
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>Pealkiri *</span>
                        <input
                          value={d.title}
                          onChange={(e) => updateDraft(i, { title: e.target.value })}
                          type="text"
                          placeholder="nt Eessõna"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>Autorid</span>
                        <input
                          value={d.authors}
                          onChange={(e) => updateDraft(i, { authors: e.target.value })}
                          type="text"
                          placeholder="nt Kadri Kuupak"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>Rubriik</span>
                        <input
                          value={d.section}
                          onChange={(e) => updateDraft(i, { section: e.target.value })}
                          type="text"
                          placeholder="nt Persoon"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>Lehekülgede vahemik (trükis) *</span>
                        <input
                          value={d.pageRange}
                          onChange={(e) => updateDraft(i, { pageRange: e.target.value })}
                          type="text"
                          placeholder="nt 3–8"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>PDF startPage</span>
                        <input
                          value={d.startPage || ""}
                          onChange={(e) => updateDraft(i, { startPage: e.target.value })}
                          type="number"
                          inputMode="numeric"
                          placeholder="nt 5 (kui offsetit ei kasuta)"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>PDF endPage</span>
                        <input
                          value={d.endPage || ""}
                          onChange={(e) => updateDraft(i, { endPage: e.target.value })}
                          type="number"
                          inputMode="numeric"
                          placeholder="nt 10"
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                        <span>Sihtgrupp</span>
                        <select
                          value={d.audience || fileAudience}
                          onChange={(e) => updateDraft(i, { audience: e.target.value })}
                          style={inputStyle()}
                        >
                          {AUDIENCE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.88rem" }}>
                      <span>Kirjeldus</span>
                      <textarea
                        value={d.description || ""}
                        onChange={(e) => updateDraft(i, { description: e.target.value })}
                        rows={2}
                        placeholder="Valikuline lühikokkuvõte"
                        style={{ ...inputStyle(), resize: "vertical" }}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={addDraft} style={smallGhostBtn()}>
                Lisa artikkel
              </button>
              <button
                type="button"
                disabled={articlesBusy}
                onClick={ingestArticles}
                style={ctaStyle(articlesBusy, "#00b37a", "#18c08a")}
              >
                {articlesBusy ? "Saadan..." : "Ingesti artiklid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- loetelu --- */}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h3 style={{ fontSize: "1rem" }}>Viimased materjalid</h3>
          <button
            type="button"
            onClick={manualRefresh}
            disabled={loadingList}
            aria-busy={loadingList ? "true" : "false"}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: loadingList ? "rgba(255,255,255,0.08)" : "transparent",
              color: "#f3f6ff",
              fontSize: "0.85rem",
              cursor: loadingList ? "wait" : "pointer",
              opacity: loadingList ? 0.7 : 1,
            }}
          >
            {loadingList ? "Laen..." : "Värskenda"}
          </button>
        </div>

        {loadingList ? (
          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>Laen andmeid...</p>
        ) : docs.length === 0 ? (
          <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>RAG andmebaasis pole veel kirjeid.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: "1rem",
            }}
          >
            {docs.map((doc) => {
              const status = deriveStatus(doc);
              const statusLabel = STATUS_LABELS[status] || status;
              const badgeStyle = statusBadgeStyle(status);
              const docAudience = doc.audience || doc.metadata?.audience;
              const deletable = canDelete(doc);
              const reindexable = canReindex(doc);
              const syncedAt = deriveSyncedAt(doc);

              return (
                <li
                  key={doc.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "1rem 1.2rem",
                    background: "rgba(13,16,24,0.62)",
                    display: "grid",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "1rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {doc.title || doc.fileName || doc.sourceUrl || "Materjal"}
                      </strong>
                      {doc.type === "FILE" && doc.fileName && (
                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{doc.fileName}</span>
                      )}
                      {doc.type === "URL" && doc.sourceUrl && (
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.85rem",
                            opacity: 0.75,
                            color: "#9ed0ff",
                            wordBreak: "break-all",
                          }}
                        >
                          {doc.sourceUrl}
                        </a>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        ...badgeStyle,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <dl
                    style={{
                      display: "grid",
                      gap: "0.4rem 1rem",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      margin: 0,
                    }}
                  >
                    <div>
                      <dt
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          opacity: 0.6,
                        }}
                      >
                        Tüüp
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </dd>
                    </div>
                    <div>
                      <dt
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          opacity: 0.6,
                        }}
                      >
                        Sihtgrupp
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {getAudienceLabel(docAudience || "BOTH")}
                      </dd>
                    </div>
                    <div>
                      <dt
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          opacity: 0.6,
                        }}
                      >
                        Lisatud
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {formatDateTime(doc.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          opacity: 0.6,
                        }}
                      >
                        Uuendatud
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {formatDateTime(doc.updatedAt)}
                      </dd>
                    </div>
                    {typeof doc.chunks === "number" ? (
                      <div>
                        <dt
                          style={{
                            fontSize: "0.72rem",
                            textTransform: "uppercase",
                            opacity: 0.6,
                          }}
                        >
                          Tükke
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{doc.chunks}</dd>
                      </div>
                    ) : null}
                    {doc.fileSize ? (
                      <div>
                        <dt
                          style={{
                            fontSize: "0.72rem",
                            textTransform: "uppercase",
                            opacity: 0.6,
                          }}
                        >
                          Maht
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                          {formatBytes(doc.fileSize)}
                        </dd>
                      </div>
                    ) : null}
                    {doc.admin?.email ? (
                      <div>
                        <dt
                          style={{
                            fontSize: "0.72rem",
                            textTransform: "uppercase",
                            opacity: 0.6,
                          }}
                        >
                          Lisaja
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{doc.admin.email}</dd>
                      </div>
                    ) : null}
                    {doc.remoteId ? (
                      <div>
                        <dt
                          style={{
                            fontSize: "0.72rem",
                            textTransform: "uppercase",
                            opacity: 0.6,
                          }}
                        >
                          Remote ID
                        </dt>
                        <dd
                          style={{
                            margin: 0,
                            fontSize: "0.88rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {doc.remoteId}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {doc.error && (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#ff9c9c" }}>
                      {doc.error}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleReindex(doc.id)}
                      disabled={reindexingId === doc.id || !reindexable}
                      aria-busy={reindexingId === doc.id ? "true" : "false"}
                      style={ghostBtn(reindexingId === doc.id || !reindexable)}
                      title={
                        reindexable
                          ? "Taasindekseeri"
                          : "Reindekseerimine pole selles staatuses saadaval"
                      }
                    >
                      {reindexingId === doc.id ? "Töötlen..." : "Taasindekseerin"}
                    </button>

                    {deletable && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        aria-busy={deletingId === doc.id ? "true" : "false"}
                        style={dangerGhostBtn(deletingId === doc.id)}
                      >
                        {deletingId === doc.id ? "Kustutan..." : "Kustuta"}
                      </button>
                    )}

                    {syncedAt && (
                      <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                        Sünkroonitud: {formatDateTime(syncedAt)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="chat-footer">
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push(localizePath("/", locale))}
            aria-label={t?.("buttons.back_home") || "Tagasi avalehele"}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- stiili helperid ---------- */

function inputStyle() {
  return {
    padding: "0.55rem 0.65rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,12,20,0.6)",
    color: "#f3f6ff",
  };
}

function ctaStyle(busy, c1, c2) {
  return {
    padding: "0.6rem 0.9rem",
    borderRadius: "999px",
    border: "none",
    background: busy ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${c1}, ${c2})`,
    color: "#fefeff",
    fontWeight: 600,
    cursor: busy ? "wait" : "pointer",
    transition: "opacity 0.2s ease",
    opacity: busy ? 0.7 : 1,
  };
}

function smallGhostBtn() {
  return {
    padding: "0.45rem 0.9rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    color: "#f3f6ff",
    fontSize: "0.82rem",
    cursor: "pointer",
  };
}

function smallDangerBtn() {
  return {
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,120,120,0.35)",
    background: "transparent",
    color: "#ff9c9c",
    fontSize: "0.8rem",
    cursor: "pointer",
  };
}

function ghostBtn(busy) {
  return {
    padding: "0.45rem 0.9rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: busy ? "rgba(255,255,255,0.08)" : "transparent",
    color: "#f3f6ff",
    fontSize: "0.82rem",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.7 : 1,
  };
}

function dangerGhostBtn(busy) {
  return {
    padding: "0.45rem 0.9rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,120,120,0.35)",
    background: busy ? "rgba(255,255,255,0.08)" : "transparent",
    color: "#ff9c9c",
    fontSize: "0.82rem",
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.7 : 1,
  };
}
