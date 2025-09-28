"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const TYPE_LABELS = {
  FILE: "Fail",
  URL: "URL",
};

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

const MAX_UPLOAD_HINT_MB = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 20);

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  if (!bytes || Number.isNaN(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return ${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ;
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("et-EE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (_) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  }
}

function statusBadgeStyle(status) {
  return STATUS_STYLES[status] || { backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" };
}

export default function RagAdminPanel() {
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });
  const [fileAudience, setFileAudience] = useState("BOTH");
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlAudience, setUrlAudience] = useState("BOTH");
  const [reindexingId, setReindexingId] = useState(null);

  const fileFormRef = useRef(null);
  const fileInputRef = useRef(null);
  const urlFormRef = useRef(null);

  const getAudienceLabel = useCallback(
    (value) => AUDIENCE_LABELS[value] || (value ? value : "-"),
    []
  );

  const fetchDocuments = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/rag/documents?limit=50", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Dokumentide laadimine ebaõnnestus.");
      }
      setDocs(Array.isArray(data.docs) ? data.docs : []);
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Dokumentide laadimine ebaõnnestus." });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const resetMessage = useCallback(() => setMessage(null), []);

  const onFileChange = useCallback(
    (event) => {
      resetMessage();
      const file = event.target.files && event.target.files[0];
      if (!file) {
        setFileInfo({ name: "", size: 0 });
        return;
      }
      setFileInfo({ name: file.name, size: file.size });
    },
    [resetMessage]
  );

  const handleFileSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      resetMessage();
      const fileInput = fileInputRef.current;
      const file = fileInput?.files?.[0];
      if (!file) {
        setMessage({ type: "error", text: "Vali fail enne saatmist." });
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
        const res = await fetch("/api/rag/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Faili laadimine ebaõnnestus.");
        }
        setMessage({ type: "success", text: "Fail saadeti RAG andmebaasi." });
        setFileInfo({ name: "", size: 0 });
        setFileAudience("BOTH");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        setMessage({ type: "error", text: err?.message || "Faili laadimine ebaõnnestus." });
      } finally {
        setFileBusy(false);
      }
    },
    [fetchDocuments, resetMessage, fileAudience]
  );

  const handleUrlSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      resetMessage();
      const form = event.currentTarget;
      const urlValue = form.url?.value?.trim();
      if (!urlValue) {
        setMessage({ type: "error", text: "Sisesta URL." });
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
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "URL lisamine ebaõnnestus.");
        }
        setMessage({ type: "success", text: "URL saadeti RAG andmebaasi." });
        setUrlAudience("BOTH");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        setMessage({ type: "error", text: err?.message || "URL lisamine ebaõnnestus." });
      } finally {
        setUrlBusy(false);
      }
    },
    [fetchDocuments, resetMessage, urlAudience]
  );

  const handleReindex = useCallback(
    async (docId) => {
      resetMessage();
      setReindexingId(docId);
      try {
        const res = await fetch(/api/rag/documents//reindex, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Taasingestus ebaõnnestus.");
        }
        setMessage({ type: "success", text: "Taasingestus algatatud." });
        setDocs((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, ...data.doc } : doc)));
        await fetchDocuments();
      } catch (err) {
        setMessage({ type: "error", text: err?.message || "Taasingestus ebaõnnestus." });
      } finally {
        setReindexingId(null);
      }
    },
    [fetchDocuments, resetMessage]
  );

  const manualRefresh = useCallback(() => {
    resetMessage();
    fetchDocuments();
  }, [fetchDocuments, resetMessage]);

  const fileHint = useMemo(() => {
    if (!fileInfo.name) return "Valitud faili ei ole.";
    return ${fileInfo.name} ();
  }, [fileInfo]);

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
          Lae turvaliselt materjale RAG indeksisse või lisa veebilehti, et assistent saaks neid allikana kasutada.
        </p>
      </div>

      {message && (
        <div
          role="status"
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            border: message.type === "error" ? "1px solid rgba(231,76,60,0.4)" : "1px solid rgba(46,204,113,0.3)",
            backgroundColor: message.type === "error" ? "rgba(231,76,60,0.12)" : "rgba(46,204,113,0.12)",
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
              PDF, TXT või DOCX failid (kuni {Math.round(MAX_UPLOAD_HINT_MB * 10) / 10} MB).
            </p>
          </div>

          <label
            style={{
              display: "grid",
              gap: "0.5rem",
              fontSize: "0.88rem",
            }}
          >
            <span>Pealkiri</span>
            <input
              name="title"
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
            <span>Fail</span>
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept=".pdf,.txt,.doc,.docx,.md,.html,.htm"
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
              background: fileBusy ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #7757ff, #9b6dff)",
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
              background: urlBusy ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #ff6b8a, #ff8ba6)",
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
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between" }}>
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
                          style={{ fontSize: "0.85rem", opacity: 0.75, color: "#9ed0ff", wordBreak: "break-all" }}
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
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Tüüp</dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{TYPE_LABELS[doc.type] || doc.type}</dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Sihtgrupp</dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{getAudienceLabel(docAudience || "BOTH")}</dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Lisatud</dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatDateTime(doc.createdAt)}</dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Uuendatud</dt>
                      <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatDateTime(doc.updatedAt)}</dd>
                    </div>
                    {doc.fileSize ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Maht</dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{formatBytes(doc.fileSize)}</dd>
                      </div>
                    ) : null}
                    {doc.admin?.email ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Lisaja</dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem" }}>{doc.admin.email}</dd>
                      </div>
                    ) : null}
                    {doc.remoteId ? (
                      <div>
                        <dt style={{ fontSize: "0.72rem", textTransform: "uppercase", opacity: 0.6 }}>Remote ID</dt>
                        <dd style={{ margin: 0, fontSize: "0.88rem", wordBreak: "break-all" }}>{doc.remoteId}</dd>
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
                        background: reindexingId === doc.id ? "rgba(255,255,255,0.08)" : "transparent",
                        color: "#f3f6ff",
                        fontSize: "0.82rem",
                        cursor: reindexingId === doc.id ? "wait" : "pointer",
                        opacity: reindexingId === doc.id ? 0.7 : 1,
                      }}
                    >
                      {reindexingId === doc.id ? "Töötlen..." : "Taasingesta"}
                    </button>
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
    </section>
  );
}
