"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// NB: Stiiliklassid on globals.css failis (vt lõpu kommentaari), et komponent jääks lühem.

const STATUS_LABELS = { PENDING: "Ootel", PROCESSING: "Töötlemisel", COMPLETED: "Valmis", FAILED: "Ebaõnnestus" };
const STATUS_CLASSES = { PENDING: "badge badge-yellow", PROCESSING: "badge badge-blue", COMPLETED: "badge badge-green", FAILED: "badge badge-red" };
const AUDIENCE_OPTIONS = [
  { value: "SOCIAL_WORKER", label: "Sotsiaaltöö spetsialist" },
  { value: "CLIENT", label: "Eluküsimusega pöörduja" },
  { value: "BOTH", label: "Mõlemad" },
];
const AUDIENCE_LABELS = { SOCIAL_WORKER: "Sotsiaaltöö spetsialist", CLIENT: "Eluküsimusega pöörduja", BOTH: "Mõlemad" };

const DEFAULT_POLL_MS = 15000;
const POLL_MS = Number(process.env.NEXT_PUBLIC_RAG_POLL_MS || DEFAULT_POLL_MS);
const PAGE_SIZE = 25;

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("et-EE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }
};
const deriveStatus = (doc) => (doc && doc.status ? doc.status : "COMPLETED");
const deriveSyncedAt = (doc) => doc?.insertedAt || doc?.lastIngested || doc?.updatedAt || doc?.createdAt || null;
const splitAuthors = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean).slice(0, 12);
  return String(v)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
};
const splitTags = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean).slice(0, 24);
  return String(v)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24);
};
const normalizeAuthorsForDisplay = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  return splitAuthors(v);
};
const normalizeTags = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  return splitTags(v);
};
const normalizeDoc = (item) => {
  const meta = item.metadata || item;
  const authors = normalizeAuthorsForDisplay(item.authors || meta.authors);
  const tags = normalizeTags(item.tags || meta.tags);
  const id = item.id || meta.id || meta.articleId || meta.docId || meta.doc_id || meta.article_id;
  return {
    ...item,
    id,
    docId: meta.docId || meta.doc_id || id,
    articleId: meta.articleId || meta.article_id || "",
    title: item.title || meta.title || "",
    description: item.description || meta.description || "",
    section: item.section || meta.section || "",
    issueLabel: item.issueLabel || meta.issueLabel || meta.issue_id || "",
    issueId: item.issueId || meta.issueId || meta.issue_id || "",
    year: item.year || meta.year || "",
    audience: item.audience || meta.audience || "BOTH",
    pageRange: item.pageRange || meta.pageRange || "",
    authors,
    tags,
    pdf_start_page: meta.pdf_start_page,
    pdf_end_page: meta.pdf_end_page,
    source_path: meta.source_path || meta.sourcePath || item.source_path,
  };
};

/**
 * @typedef {Object} RagDoc
 * @property {string} [id]
 * @property {string} [docId]
 * @property {string} [articleId]
 * @property {string} [title]
 * @property {string} [description]
 * @property {string[]} [authors]
 * @property {string[]} [tags]
 * @property {string|number} [year]
 * @property {string} [issueLabel]
 * @property {string} [section]
 * @property {string} [audience]
 * @property {string} [pageRange]
 * @property {number} [pdf_start_page]
 * @property {number} [pdf_end_page]
 * @property {string} [source_path]
 */
export default function RagAdminPanel() {
  const router = useRouter();
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null);
  const [selftestBusy, setSelftestBusy] = useState(false);
  const [selftestSteps, setSelftestSteps] = useState(null);

  const [pdfMetaAudience, setPdfMetaAudience] = useState("BOTH");
  const [pdfMetaBusy, setPdfMetaBusy] = useState(false);
  const [pdfMetaResult, setPdfMetaResult] = useState(null);
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlAudience, setUrlAudience] = useState("BOTH");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlDescription, setUrlDescription] = useState("");
  const [urlTags, setUrlTags] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("ALL");
  const [filterAudience, setFilterAudience] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterIssue, setFilterIssue] = useState("ALL");
  const [filterTags, setFilterTags] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [detailDoc, setDetailDoc] = useState(null);
  const [detailForm, setDetailForm] = useState({
    title: "",
    description: "",
    authors: "",
    section: "",
    year: "",
    issueLabel: "",
    audience: "BOTH",
    tags: "",
    pageRange: "",
    pdf_start_page: "",
    pdf_end_page: "",
  });

  const [reindexingId, setReindexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const urlFormRef = useRef(null);
  const fetchAbortRef = useRef(null);

  const resetMessage = useCallback(() => setMessage(null), []);
  const getAudienceLabel = useCallback((value) => AUDIENCE_LABELS[value] || (value ? value : "-"), []);
  const showError = useCallback((text) => setMessage({ type: "error", text }), []);
  const showOk = useCallback((text) => setMessage({ type: "success", text }), []);

  const fetchDocuments = useCallback(async () => {
    fetchAbortRef.current?.abort?.();
    const ac = new AbortController();
    fetchAbortRef.current = ac;
    setLoadingList(true);
    try {
      const res = await fetch("/api/rag/documents?limit=200", { cache: "no-store", signal: ac.signal });
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        throw new Error("Server tagastas vigase JSON-i dokumentide loetelule.");
      }
      if (!res.ok) throw new Error(data?.message || "Dokumentide laadimine ebaõnnestus.");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.documents)
        ? data.documents
        : Array.isArray(data?.docs)
        ? data.docs
        : [];
      setDocs(list);
    } catch (err) {
      if (err?.name !== "AbortError") showError(err?.message || "Dokumentide laadimine ebaõnnestus.");
    } finally {
      setLoadingList(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDocuments();
    return () => fetchAbortRef.current?.abort?.();
  }, [fetchDocuments]);

  useEffect(() => {
    const hasWork = docs.some((d) => {
      const st = deriveStatus(d);
      return st === "PENDING" || st === "PROCESSING";
    });
    if (!hasWork) return undefined;
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

  const handlePdfMetaSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      resetMessage();
      setPdfMetaResult(null);
      const form = event.currentTarget;
      const pdfFile = form.pdfWithMetaFile?.files?.[0];
      const metaFile = form.pdfMetaFile?.files?.[0];
      const metaText = form.pdfMetaText?.value?.trim();
      if (!pdfFile) {
        showError("Vali PDF-fail.");
        return;
      }
      if (!metaFile && !metaText) {
        showError("Lisa metaandmete JSON fail või kleebi JSON väljale.");
        return;
      }
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("audience", pdfMetaAudience);
      if (metaFile) formData.append("metadata", metaFile);
      else if (metaText) formData.append("metadata_text", metaText);
      setPdfMetaBusy(true);
      try {
        const res = await fetch("/api/rag/ingest/pdf-with-metadata", { method: "POST", body: formData });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok || data?.ok === false) throw new Error(data?.message || "PDF ingest ebaõnnestus.");
        const docId = data?.docId || data?.docID || data?.doc?.docId || data?.doc?.id || data?.doc?.remoteId || null;
        const shortRef = data?.shortRef || data?.short_ref || null;
        if (shortRef) showOk(`Lisatud: ${shortRef}`);
        else if (docId) showOk(`PDF ingest õnnestus (docId ${docId}).`);
        else showOk("PDF ingest õnnestus.");
        setPdfMetaResult({
          docId,
          fileName: data?.fileName,
          shortRef,
          pageRange: data?.pageRange || data?.page_range || null,
          inserted: data?.inserted,
        });
        setPdfMetaAudience("BOTH");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "PDF ingest ebaõnnestus.");
      } finally {
        setPdfMetaBusy(false);
      }
    },
    [fetchDocuments, resetMessage, showError, showOk, pdfMetaAudience]
  );

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
      const tagArr = splitTags(urlTags);
      if (tagArr.length) payload.tags = tagArr;
      if (urlTitle.trim()) payload.title = urlTitle.trim();
      if (urlDescription.trim()) payload.description = urlDescription.trim();
      setUrlBusy(true);
      try {
        const res = await fetch("/api/rag/ingest/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok) throw new Error(data?.message || "URL lisamine ebaõnnestus.");
        showOk("URL saadeti RAG andmebaasi.");
        setUrlAudience("BOTH");
        setUrlTitle("");
        setUrlDescription("");
        setUrlTags("");
        form.reset();
        await fetchDocuments();
      } catch (err) {
        showError(err?.message || "URL lisamine ebaõnnestus.");
      } finally {
        setUrlBusy(false);
      }
    },
    [fetchDocuments, resetMessage, urlAudience, showError, showOk, urlTitle, urlDescription, urlTags]
  );

  const handleReindex = useCallback(
    async (docId) => {
      resetMessage();
      setReindexingId(docId);
      try {
        const res = await fetch(`/api/rag/documents/${docId}/reindex`, { method: "POST" });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};
        if (!res.ok) throw new Error(data?.message || "Taasindekseerimine ebaõnnestus.");
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

  const handleBulkReindex = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    for (const id of ids) {
      // intentionally sequential to avoid spamming the server
      // eslint-disable-next-line no-await-in-loop
      await handleReindex(id);
    }
  }, [selectedIds, handleReindex]);

  const handleDelete = useCallback(
    async (docId) => {
      resetMessage();
      if (!docId) return;
      if (!confirm("Kas soovid selle kirje kustutada? Seda ei saa tagasi võtta.")) return;
      setDeletingId(docId);
      try {
        const res = await fetch(`/api/rag/documents/${docId}`, { method: "DELETE" });
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

  const normalizedDocs = useMemo(() => docs.map((d, i) => ({ ...normalizeDoc(d), _idx: i })), [docs]);
  const sectionOptions = useMemo(
    () => Array.from(new Set(normalizedDocs.map((d) => d.section).filter(Boolean))).sort(),
    [normalizedDocs]
  );
  const audienceOptions = useMemo(
    () => Array.from(new Set(normalizedDocs.map((d) => d.audience).filter(Boolean))),
    [normalizedDocs]
  );
  const yearOptions = useMemo(
    () => Array.from(new Set(normalizedDocs.map((d) => String(d.year || "").trim()).filter(Boolean))).sort((a, b) => b.localeCompare(a)),
    [normalizedDocs]
  );
  const issueOptions = useMemo(
    () => Array.from(new Set(normalizedDocs.map((d) => d.issueLabel).filter(Boolean))).sort(),
    [normalizedDocs]
  );
  const allTags = useMemo(
    () => Array.from(new Set(normalizedDocs.flatMap((d) => d.tags || []))).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [normalizedDocs]
  );

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tagSet = new Set(filterTags);
    const list = normalizedDocs.filter((doc) => {
      if (filterSection !== "ALL" && doc.section !== filterSection) return false;
      if (filterAudience !== "ALL" && doc.audience !== filterAudience) return false;
      if (filterYear !== "ALL" && String(doc.year || "") !== filterYear) return false;
      if (filterIssue !== "ALL" && doc.issueLabel !== filterIssue) return false;
      if (tagSet.size) {
        const docTags = doc.tags || [];
        for (const t of tagSet) {
          if (!docTags.includes(t)) return false;
        }
      }
      if (!q) return true;
      const haystack = [
        doc.title,
        doc.description,
        doc.section,
        doc.issueLabel,
        doc.year,
        (doc.authors || []).join(" "),
        (doc.tags || []).join(" "),
      ]
        .filter(Boolean)
        .join(" | ")
        .toLowerCase();
      return haystack.includes(q);
    });
    return list.sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "section") return (a.section || "").localeCompare(b.section || "");
      if (sortBy === "year") return String(b.year || "").localeCompare(String(a.year || ""));
      if (sortBy === "issue") return (a.issueLabel || "").localeCompare(b.issueLabel || "");
      const aDate = deriveSyncedAt(a);
      const bDate = deriveSyncedAt(b);
      return new Date(bDate || 0) - new Date(aDate || 0);
    });
  }, [normalizedDocs, searchQuery, filterSection, filterAudience, filterYear, filterIssue, filterTags, sortBy]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filterSection, filterAudience, filterYear, filterIssue, filterTags, sortBy]);

  const visibleDocs = filteredDocs.slice(0, visibleCount);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const ids = visibleDocs.map((d) => d.id).filter(Boolean);
      const allOn = ids.every((id) => next.has(id));
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, [visibleDocs]);

  const openDetail = useCallback((doc) => {
    if (!doc) return;
    setDetailDoc(doc);
    setDetailForm({
      title: doc.title || "",
      description: doc.description || "",
      authors: (doc.authors || []).join(", "),
      section: doc.section || "",
      year: doc.year ? String(doc.year) : "",
      issueLabel: doc.issueLabel || "",
      audience: doc.audience || "BOTH",
      tags: (doc.tags || []).join(", "),
      pageRange: doc.pageRange || "",
      pdf_start_page: doc.pdf_start_page ? String(doc.pdf_start_page) : "",
      pdf_end_page: doc.pdf_end_page ? String(doc.pdf_end_page) : "",
    });
  }, []);
  const closeDetail = useCallback(() => setDetailDoc(null), []);

  const saveDetail = useCallback(async () => {
    if (!detailDoc) return;
    resetMessage();
    const payload = {
      title: detailForm.title?.trim() || null,
      description: detailForm.description?.trim() || null,
      authors: splitAuthors(detailForm.authors),
      tags: splitTags(detailForm.tags),
      section: detailForm.section?.trim() || null,
      issueLabel: detailForm.issueLabel?.trim() || null,
      audience: detailForm.audience || null,
      pageRange: detailForm.pageRange?.trim() || null,
    };
    const y = detailForm.year?.trim();
    if (y) payload.year = Number.isNaN(Number(y)) ? y : Number(y);
    const sPage = detailForm.pdf_start_page?.trim();
    const ePage = detailForm.pdf_end_page?.trim();
    if (sPage) payload.pdf_start_page = Number(sPage);
    if (ePage) payload.pdf_end_page = Number(ePage);
    try {
      const res = await fetch(`/api/rag/documents/${detailDoc.id}/update-meta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok || data?.ok === false) throw new Error(data?.message || "Meta uuendamine ebaõnnestus.");
      showOk("Meta salvestatud.");
      setDocs((prev) =>
        prev.map((d) => (d.id === detailDoc.id ? { ...d, ...payload, metadata: { ...(d.metadata || {}), ...payload } } : d))
      );
      closeDetail();
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || "Meta uuendamine ebaõnnestus.");
    }
  }, [detailDoc, detailForm, closeDetail, showError, showOk, fetchDocuments, resetMessage]);

  const handleSelftest = useCallback(async () => {
    if (selftestBusy) return;
    setSelftestBusy(true);
    setSelftestSteps(null);
    resetMessage();
    try {
      const res = await fetch("/api/rag/selftest", { method: "POST", cache: "no-store" });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok || data?.ok === false) throw new Error(data?.message || "Isetest ebaõnnestus.");
      setSelftestSteps(Array.isArray(data?.steps) ? data.steps : []);
      setMessage({ type: "success", text: "Isetest lõpetatud." });
      await fetchDocuments();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Isetest katkestus." });
    } finally {
      setSelftestBusy(false);
    }
  }, [selftestBusy, fetchDocuments, resetMessage]);

  const renderTags = (arr) => {
    if (!arr || !arr.length) return <span className="text-muted">–</span>;
    return (
      <span className="tag-row">
        {arr.map((t) => (
          <span className="badge badge-ghost" key={t}>
            {t}
          </span>
        ))}
      </span>
    );
  };

  const viewSource = (doc) => {
    const href = doc?.source_path || doc?.url;
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="rag-admin">
      <div className="flex-row space-between">
        <h1 className="title">RAG admin</h1>
        <div className="row-gap">
          <button className="btn" onClick={handleSelftest} disabled={selftestBusy}>
            {selftestBusy ? "Kontrollin…" : "Tee isetest"}
          </button>
          <button className="btn" onClick={fetchDocuments} disabled={loadingList}>
            {loadingList ? "Laen…" : "Värskenda"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${message.type === "error" ? "alert-error" : "alert-ok"}`}
          onClick={resetMessage}
        >
          {message.text}
        </div>
      )}

      {Array.isArray(selftestSteps) && selftestSteps.length ? (
        <div className="card">
          <div className="card-title">Isetesti tulemused</div>
          <ul className="list">
            {selftestSteps.map((s, i) => (
              <li key={i} className={s.ok ? "text-ok" : "text-error"}>
                {s.label || s.step || s.id}: {s.ok ? "OK" : "Ebaõnnestus"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="card">
        <div className="card-title">Ingest: URL või PDF + meta</div>
        <div className="ingest-grid">
          <form className="stack" onSubmit={handleUrlSubmit} ref={urlFormRef}>
            <label className="label">Ingest URL</label>
            <input name="url" placeholder="https://" className="input" />
            <input value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} placeholder="Pealkiri (valikuline)" className="input" />
            <textarea
              value={urlDescription}
              onChange={(e) => setUrlDescription(e.target.value)}
              placeholder="Kirjeldus"
              className="input"
              rows={2}
            />
            <input value={urlTags} onChange={(e) => setUrlTags(e.target.value)} placeholder="Sildid (komadega)" className="input" />
            <select value={urlAudience} onChange={(e) => setUrlAudience(e.target.value)} className="input">
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" disabled={urlBusy}>
              {urlBusy ? "Saadan…" : "Saada URL"}
            </button>
          </form>

          <form className="stack" onSubmit={handlePdfMetaSubmit}>
            <label className="label">PDF + meta (JSON)</label>
            <input name="pdfWithMetaFile" type="file" accept="application/pdf" className="input" />
            <input name="pdfMetaFile" type="file" accept="application/json" className="input" />
            <textarea name="pdfMetaText" placeholder="Või kleebi meta JSON" rows={3} className="input" />
            <select value={pdfMetaAudience} onChange={(e) => setPdfMetaAudience(e.target.value)} className="input">
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn" disabled={pdfMetaBusy}>
              {pdfMetaBusy ? "Saadan…" : "Saada PDF meta'ga"}
            </button>
            {pdfMetaResult ? (
              <div className="muted">
                {pdfMetaResult.fileName ? `${pdfMetaResult.fileName}: ` : ""}
                {pdfMetaResult.shortRef || pdfMetaResult.docId || "Salvestatud"}
              </div>
            ) : null}
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Artiklite loetelu</div>
        <div className="rag-toolbar">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Otsi pealkirja, autorit, kirjeldust või silti"
            className="input"
          />
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="input">
            <option value="ALL">Kõik rubriigid</option>
            {sectionOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="input">
            <option value="ALL">Kõik sihtrühmad</option>
            {audienceOptions.map((s) => (
              <option key={s} value={s}>
                {getAudienceLabel(s)}
              </option>
            ))}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input">
            <option value="ALL">Kõik aastad</option>
            {yearOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={filterIssue} onChange={(e) => setFilterIssue(e.target.value)} className="input">
            <option value="ALL">Kõik numbrid</option>
            {issueOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            multiple
            value={filterTags}
            onChange={(e) => setFilterTags(Array.from(e.target.selectedOptions, (o) => o.value))}
            className="input"
            size={Math.min(6, Math.max(2, allTags.length)) || 2}
          >
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
            <option value="recent">Uued ees</option>
            <option value="title">Pealkiri A–Z</option>
            <option value="section">Rubriik</option>
            <option value="year">Aasta</option>
            <option value="issue">Väljaanne</option>
          </select>
          {selectedIds.size ? (
            <button className="btn" onClick={handleBulkReindex} disabled={reindexingId !== null}>
              Reindexeri valitud ({selectedIds.size})
            </button>
          ) : null}
        </div>

        <div className="table-wrap">
          <table className="rag-table">
            <thead>
              <tr>
                <th className="w-checkbox">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAllVisible}
                    checked={visibleDocs.length && visibleDocs.every((d) => selectedIds.has(d.id))}
                  />
                </th>
                <th>Pealkiri</th>
                <th>Rubriik</th>
                <th>Autorid</th>
                <th>Aasta / nr</th>
                <th>Sihtrühm</th>
                <th>Sildid</th>
                <th>Lehekülg</th>
                <th>Staatus</th>
                <th>Tegevused</th>
              </tr>
            </thead>
            <tbody>
              {visibleDocs.map((doc) => {
                const status = deriveStatus(doc);
                const syncedAt = deriveSyncedAt(doc);
                return (
                  <tr key={doc.id || doc._idx} onClick={() => openDetail(doc)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} />
                    </td>
                    <td>
                      <div className="cell-title">{doc.title || "(pealkiri puudub)"}</div>
                      <div className="cell-sub">{doc.description || ""}</div>
                    </td>
                    <td>{doc.section || "–"}</td>
                    <td>{(doc.authors || []).join(", ") || "–"}</td>
                    <td>
                      {doc.year || "–"}
                      {doc.issueLabel ? ` / ${doc.issueLabel}` : ""}
                    </td>
                    <td>{getAudienceLabel(doc.audience)}</td>
                    <td>{renderTags(doc.tags)}</td>
                    <td>{doc.pageRange || ""}</td>
                    <td>
                      <span className={STATUS_CLASSES[status] || "badge"}>{STATUS_LABELS[status] || status}</span>
                      <div className="cell-sub">{syncedAt ? formatDateTime(syncedAt) : ""}</div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="cell-actions">
                        <button className="btn btn-link" onClick={() => openDetail(doc)}>
                          Muuda
                        </button>
                        <button className="btn btn-link" onClick={() => handleReindex(doc.id)} disabled={reindexingId === doc.id}>
                          {reindexingId === doc.id ? "Indekseerin…" : "Reindex"}
                        </button>
                        <button className="btn btn-link" onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id}>
                          {deletingId === doc.id ? "Kustutan…" : "Kustuta"}
                        </button>
                        <button className="btn btn-link" onClick={() => viewSource(doc)} disabled={!doc.source_path && !doc.url}>
                          Vaata
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleDocs.length ? (
                <tr>
                  <td colSpan={10} className="text-center">
                    {loadingList ? "Laen andmeid…" : "Tulemusi ei leitud."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {visibleCount < filteredDocs.length ? (
          <div className="row-gap">
            <button className="btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              Laadi veel {Math.min(PAGE_SIZE, filteredDocs.length - visibleCount)}
            </button>
          </div>
        ) : null}
      </div>

      {detailDoc ? (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-body">
            <div className="modal-head">
              <div>
                <div className="card-title">Muuda meta</div>
                <div className="muted">{detailDoc.title || "(pealkiri)"}</div>
              </div>
              <button className="btn" onClick={closeDetail}>
                Sulge
              </button>
            </div>
            <div className="stack">
              <input
                value={detailForm.title}
                onChange={(e) => setDetailForm((f) => ({ ...f, title: e.target.value }))}
                className="input"
                placeholder="Pealkiri"
              />
              <textarea
                value={detailForm.description}
                onChange={(e) => setDetailForm((f) => ({ ...f, description: e.target.value }))}
                className="input"
                rows={3}
                placeholder="Kirjeldus"
              />
              <div className="grid-2">
                <input
                  value={detailForm.authors}
                  onChange={(e) => setDetailForm((f) => ({ ...f, authors: e.target.value }))}
                  className="input"
                  placeholder="Autorid (komadega)"
                />
                <input
                  value={detailForm.tags}
                  onChange={(e) => setDetailForm((f) => ({ ...f, tags: e.target.value }))}
                  className="input"
                  placeholder="Sildid (komadega)"
                />
              </div>
              <div className="grid-3">
                <input
                  value={detailForm.section}
                  onChange={(e) => setDetailForm((f) => ({ ...f, section: e.target.value }))}
                  className="input"
                  placeholder="Rubriik"
                />
                <input
                  value={detailForm.issueLabel}
                  onChange={(e) => setDetailForm((f) => ({ ...f, issueLabel: e.target.value }))}
                  className="input"
                  placeholder="Väljaanne"
                />
                <input
                  value={detailForm.year}
                  onChange={(e) => setDetailForm((f) => ({ ...f, year: e.target.value }))}
                  className="input"
                  placeholder="Aasta"
                />
              </div>
              <div className="grid-3">
                <select
                  value={detailForm.audience}
                  onChange={(e) => setDetailForm((f) => ({ ...f, audience: e.target.value }))}
                  className="input"
                >
                  {AUDIENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  value={detailForm.pageRange}
                  onChange={(e) => setDetailForm((f) => ({ ...f, pageRange: e.target.value }))}
                  className="input"
                  placeholder="Lehekülg"
                />
                <input
                  value={detailForm.pdf_start_page}
                  onChange={(e) => setDetailForm((f) => ({ ...f, pdf_start_page: e.target.value }))}
                  className="input"
                  placeholder="PDF algus"
                />
              </div>
              <div className="grid-3">
                <input
                  value={detailForm.pdf_end_page}
                  onChange={(e) => setDetailForm((f) => ({ ...f, pdf_end_page: e.target.value }))}
                  className="input"
                  placeholder="PDF lõpp"
                />
                <div className="input read-only">docId: {detailDoc.docId || "–"}</div>
                <div className="input read-only">articleId: {detailDoc.articleId || "–"}</div>
              </div>
              <div className="row-gap">
                <button className="btn btn-primary" onClick={saveDetail}>
                  Salvesta
                </button>
                <button className="btn" onClick={closeDetail}>
                  Tühista
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="row-gap" style={{ justifyContent: "center", marginTop: 16 }}>
        <button className="btn" onClick={() => router.push("/meist")}>
          Tagasi
        </button>
      </div>
    </div>
  );
}

/*
Lisa järgmised klassid app/globals.css faili:
.rag-admin, .card, .card-title, .ingest-grid, .stack, .grid-2, .grid-3, .row-gap, .flex-row,
.input, .btn, .btn-primary, .btn-link, .alert, .alert-error, .alert-ok, .muted, .badge,
.badge-yellow, .badge-blue, .badge-green, .badge-red, .badge-ghost, .rag-table, .table-wrap,
.cell-title, .cell-sub, .cell-actions, .tag-row, .modal, .modal-body, .modal-head, .text-center,
.text-muted, .text-ok, .text-error
*/
