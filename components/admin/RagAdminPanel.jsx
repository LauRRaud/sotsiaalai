"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

/* ---------- Avalikud .env sätted (brauseris loetavad) ---------- */

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 20);
const RAW_ALLOWED_MIME = String(
  process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME ||
    "application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
);

// Pollingu intervall (ms) – juhitav .env kaudu
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
  return STATUS_STYLES[status] || { backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" };
}

/* ---------- Komponent ---------- */

export default function RagAdminPanel() {
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null);

  // fail
  const [fileBusy, setFileBusy] = useState(false);
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0, type: "" });
  const [fileAudience, setFileAudience] = useState("BOTH");

  // url
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlAudience, setUrlAudience] = useState("BOTH");

  // tegevused
  const [reindexingId, setReindexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fileFormRef = useRef(null);
  const fileInputRef = useRef(null);
  const urlFormRef = useRef(null);

  /* ----- utils ----- */

  const resetMessage = useCallback(() => setMessage(null), []);
  const getAudienceLabel = useCallback(
    (value) => AUDIENCE_LABELS[value] || (value ? value : "-"),
    []
  );
  const showError = useCallback((text) => setMessage({ type: "error", text }), []);
  const showOk = useCallback((text) => setMessage({ type: "success", text }), []);

  /* ----- laadimine + automaatne värskendus ----- */

  const fetchDocuments = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/rag/documents?limit=50", { cache: "no-store" });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;

      if (!res.ok) {
        throw new Error(data?.message || "Dokumentide laadimine ebaõnnestus.");
      }
      setDocs(Array.isArray(data?.docs) ? data.docs : []);
    } catch (err) {
      showError(err?.message || "Dokumentide laadimine ebaõnnestus.");
    } finally {
      setLoadingList(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Kui on PENDING/PROCESSING, värskenda intervalliga (POLL_MS) ja peata taustal
  useEffect(() => {
    const hasWork = docs.some((d) => d.status === "PENDING" || d.status === "PROCESSING");
    if (!hasWork) return;

    let timer = null;

    const start = () => {
      if (!document.hidden) {
        // kohe uuenda esiplaanil
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
      stop();
      start();
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
      // Kui tiitel on tühi, eeltäida failinimega
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
    if (file.type && !ALLOWED_MIME_SET.has(file.type)) {
      // leebe: lubame, kui accept juba filtreeris
    }
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

      setFileBusy(true);
      try {
        const res = await fetch("/api/rag/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 413) throw new Error("Fail on liiga suur serveri jaoks (413).");
          if (res.status === 415) throw new Error("Faili tüüp pole lubatud (415).");
          throw new Error(data?.message || "Faili laadimine ebaõnnestus.");
        }

        showOk("Fail saadeti RAG andmebaasi.");
        setFileInfo({ name: "", size: 0, type: "" });
        setFileAudience("BOTH");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "Faili laadimine ebaõnnestus.");
      } finally {
        setFileBusy(false);
      }
    },
    [fetchDocuments, fileAudience, resetMessage, showError, showOk]
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
      const title = form.urlTitle?.value?.trim();
      const description = form.urlDescription?.value?.trim();
      if (title) payload.title = title;
      if (description) payload.description = description;

      setUrlBusy(true);
      try {
        const res = await fetch("/api/rag/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "URL lisamine ebaõnnestus.");
        }

        showOk("URL saadeti RAG andmebaasi.");
        setUrlAudience("BOTH");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "URL lisamine ebaõnnestus.");
      } finally {
        setUrlBusy(false);
      }
    },
    [fetchDocuments, resetMessage, urlAudience, showError, showOk]
  );

  /* ----- Taasingestus ----- */

  const handleReindex = useCallback(
    async (docId) => {
      resetMessage();
      setReindexingId(docId);
      try {
        const res = await fetch(`/api/rag/documents/${docId}/reindex`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
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

  /* ----- Kustutamine ----- */

  const canDelete = (doc) => doc?.status === "COMPLETED" || doc?.status === "FAILED";

  const handleDelete = useCallback(
    async (docId) => {
      resetMessage();
      if (!docId) return;
      if (!confirm("Kas soovid selle kirje kustutada? Seda ei saa tagasi võtta.")) return;
      setDeletingId(docId);
      try {
        const res = await fetch(`/api/rag/documents/${docId}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
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
    return `${fileInfo.name} (${formatBytes(fileInfo.size)}${fileInfo.type ? `, ${fileInfo.type}` : ""})`;
  }, [fileInfo]);

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
      </div>

      {message && (
        <div
          role="status"
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>Lisa fail</h3>
            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Lubatud: {ALLOWED_MIME_LIST.join(", ")} (kuni {MAX_UPLOAD_MB} MB).
            </p>
          </div>

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

          <label style={{ display: "grid", gap: "0.5rem", fontSize: "0.88rem" }}>
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
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: fileBusy
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #7757ff, #9b6dff)",
              color: "#fefeff",
              fontWeight: 600,
              cursor: fileBusy ? "wait" : "pointer",
              transition: "opacity 0.2s ease",
              opacity: fileBusy ? 0.7 : 1,
            }}
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
            <input
              name="url"
              type="url"
              required
              placeholder="https://..."
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
            <span>Pealkiri</span>
            <input
              name="urlTitle"
              type="text"
              placeholder="Valikuline"
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
              name="urlDescription"
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
              value={urlAudience}
              onChange={(e) => setUrlAudience(e.target.value)}
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

          <button
            type="submit"
            disabled={urlBusy}
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: urlBusy
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #ff6b8a, #ff8ba6)",
              color: "#fefeff",
              fontWeight: 600,
              cursor: urlBusy ? "wait" : "pointer",
              transition: "opacity 0.2s ease",
              opacity: urlBusy ? 0.7 : 1,
            }}
          >
            {urlBusy ? "Laen..." : "Lisa URL RAG andmebaasi"}
          </button>
        </form>
      </div>

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
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "1rem" }}>
            {docs.map((doc) => {
              const statusLabel = STATUS_LABELS[doc.status] || doc.status;
              const badgeStyle = statusBadgeStyle(doc.status);
              const docAudience = doc.audience || doc.metadata?.audience;
              const deletable = canDelete(doc);

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
                      <strong style={{ display: "block", fontSize: "1rem", wordBreak: "break-word" }}>
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
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                        Tüüp
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                        Sihtgrupp
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>
                        {getAudienceLabel(docAudience || "BOTH")}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                        Lisatud
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatDateTime(doc.createdAt)}</dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                        Uuendatud
                      </dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatDateTime(doc.updatedAt)}</dd>
                    </div>
                    {doc.fileSize ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                          Maht
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatBytes(doc.fileSize)}</dd>
                      </div>
                    ) : null}
                    {doc.admin?.email ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                          Lisaja
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{doc.admin.email}</dd>
                      </div>
                    ) : null}
                    {doc.remoteId ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>
                          Remote ID
                        </dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem", wordBreak: "break-all" }}>
                          {doc.remoteId}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {doc.error && (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#ff9c9c" }}>{doc.error}</p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => handleReindex(doc.id)}
                      disabled={reindexingId === doc.id}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background:
                          reindexingId === doc.id ? "rgba(255,255,255,0.08)" : "transparent",
                        color: "#f3f6ff",
                        fontSize: "0.82rem",
                        cursor: reindexingId === doc.id ? "wait" : "pointer",
                        opacity: reindexingId === doc.id ? 0.7 : 1,
                      }}
                    >
                      {reindexingId === doc.id ? "Töötlen..." : "Taasindekseerin"}
                    </button>

                    {deletable && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        style={{
                          padding: "0.45rem 0.9rem",
                          borderRadius: "999px",
                          border: "1px solid rgba(255,255,255,0.18)",
                          background:
                            deletingId === doc.id ? "rgba(255,255,255,0.08)" : "transparent",
                          color: "#ff9c9c",
                          fontSize: "0.82rem",
                          cursor: deletingId === doc.id ? "wait" : "pointer",
                          opacity: deletingId === doc.id ? 0.7 : 1,
                        }}
                      >
                        {deletingId === doc.id ? "Kustutan..." : "Kustuta"}
                      </button>
                    )}

                    {doc.insertedAt && (
                      <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                        Sünkroonitud: {formatDateTime(doc.insertedAt)}
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
    <Link href="/meist" className="back-btn glass-btn" aria-label="Tagasi Meist lehele">
      ← Tagasi Meist lehele
    </Link>
  </div>
</div>
    </section>
  );
}
