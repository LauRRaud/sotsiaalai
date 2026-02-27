"use client"

import Link from "next/link"
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n/I18nProvider"
import BackButton from "@/components/ui/BackButton"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Panel from "@/components/ui/Panel"
import Toggle from "@/components/ui/Toggle"
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles"
import { linkBrandInlineClass } from "@/components/ui/linkStyles"
import {
  AGENT_ARTIFACT_TYPE_VALUES,
  ARTIFACT_LIST_LIMIT_ALL,
  DOCUMENT_KIND_VALUES,
  TEMPLATE_FOR_VALUES
} from "@/lib/documents/constants"
import { localizePath } from "@/lib/localizePath"

const documentsTitleClassName =
  `${glassPageTitleClassName} !mt-0 !mb-0 !px-0 !text-center !whitespace-normal ` +
  `!text-[clamp(1.9rem,3.6vw,2.6rem)] !leading-[1.06] !tracking-[0.02em] ` +
  `max-[48em]:!text-[clamp(1.95rem,7vw,2.45rem)] max-[48em]:!leading-[1.08] max-[48em]:!mt-0`

function formatDate(value, locale) {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat(locale || "et", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return ""
  }
}

function formatFileSize(size) {
  const nextSize = Number(size || 0)
  if (nextSize >= 1024 * 1024) return `${(nextSize / (1024 * 1024)).toFixed(1)} MB`
  if (nextSize >= 1024) return `${Math.round(nextSize / 1024)} KB`
  return `${nextSize} B`
}

function kindLabel(kind, t) {
  if (kind === "TEMPLATE") return t("documents.kinds.template")
  if (kind === "MATERIAL") return t("documents.kinds.material")
  return t("documents.kinds.other")
}

function templateForLabel(value, t) {
  return value ? t(`documents.template_for.${String(value).toLowerCase()}`) : ""
}

function artifactTypeLabel(type, t) {
  return t(`documents.artifact_types.${String(type || "other").toLowerCase()}`)
}

function artifactStatusLabel(status, t) {
  return t(`documents.status.${String(status || "draft").toLowerCase()}`)
}

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase()
}

function artifactSearchBlob(artifact, t) {
  const sourcesText = Array.isArray(artifact?.sources) ? artifact.sources.map((source) => `${source?.title || ""} ${source?.originalName || ""}`).join(" ") : ""
  return normalizeSearchValue([artifact?.title, artifact?.snippet, artifact?.content, artifact?.type, artifactTypeLabel(artifact?.type, t), sourcesText].join(" "))
}

function artifactSortTimestamp(value) {
  const timestamp = Date.parse(String(value || ""))
  return Number.isFinite(timestamp) ? timestamp : 0
}

function compareArtifacts(left, right, sortKey, t, locale) {
  if (sortKey === "updated_asc") return artifactSortTimestamp(left?.updatedAt) - artifactSortTimestamp(right?.updatedAt)
  if (sortKey === "approved_desc") return artifactSortTimestamp(right?.approvedAt) - artifactSortTimestamp(left?.approvedAt)
  if (sortKey === "title_asc") {
    const leftLabel = String(left?.title || artifactTypeLabel(left?.type, t)).trim()
    const rightLabel = String(right?.title || artifactTypeLabel(right?.type, t)).trim()
    return leftLabel.localeCompare(rightLabel, locale || "et", { sensitivity: "base" })
  }
  return artifactSortTimestamp(right?.updatedAt) - artifactSortTimestamp(left?.updatedAt)
}

function chipClassName(isActive) {
  return `documents-chip inline-flex min-h-[2.6rem] items-center justify-center rounded-full px-[0.9rem] py-[0.38rem] text-[1.08rem] leading-none ${isActive ? "is-active" : ""}`
}

function ChipLabel({ label, count }) {
  return (
    <>
      <span>{label}</span>
      {typeof count === "number" ? <span className="documents-chip-count">&nbsp;({count})</span> : null}
    </>
  )
}

function DropdownChevron({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`documents-dropdown-icon ${open ? "is-open" : ""}`} fill="none">
      <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[1rem] w-[1rem] shrink-0" fill="none">
      <path d="M4.5 10 8 13.5 15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DocumentsDropdown({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  disabled = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  align = "start"
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value) || null

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      const target = event?.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!disabled) return
    setOpen(false)
  }, [disabled])

  return (
    <div ref={rootRef} className={`documents-dropdown documents-dropdown--align-${align} ${open ? "is-open" : ""} ${className}`.trim()}>
      <button
        type="button"
        className={`documents-field documents-dropdown-trigger ${open ? "is-open" : ""} ${triggerClassName}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        disabled={disabled}
        onClick={() => setOpen((current) => (disabled ? false : !current))}
      >
        <span className={`documents-dropdown-label ${selectedOption ? "" : "is-placeholder"}`}>
          {selectedOption?.label || placeholder}
        </span>
        <DropdownChevron open={open} />
      </button>
      {open ? (
        <div role="listbox" aria-label={ariaLabel} className={`documents-dropdown-menu ${menuClassName}`.trim()}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value ? "true" : "false"}
              className={`documents-dropdown-item ${value === option.value ? "is-active" : ""}`}
              onClick={() => {
                setOpen(false)
                if (option.value !== value) onChange(option.value)
              }}
            >
              <span>{option.label}</span>
              {value === option.value ? <CheckIcon /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function DocumentsPage({ initialArtifactLimit, artifactsExpanded = false }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const isArtifactsExpanded = artifactsExpanded || initialArtifactLimit >= ARTIFACT_LIST_LIMIT_ALL
  const [kindFilter, setKindFilter] = useState("ALL")
  const [artifactFilter, setArtifactFilter] = useState("ALL")
  const [artifactSearch, setArtifactSearch] = useState("")
  const [artifactSort, setArtifactSort] = useState("updated_desc")
  const [documents, setDocuments] = useState([])
  const [artifacts, setArtifacts] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [artifactsLoading, setArtifactsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState("")
  const [artifactsError, setArtifactsError] = useState("")
  const [successNotice, setSuccessNotice] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadKind, setUploadKind] = useState("MATERIAL")
  const [uploadTemplateFor, setUploadTemplateFor] = useState("")
  const [uploadFile, setUploadFile] = useState(null)
  const uploadInputRef = useRef(null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])
  const [artifactType, setArtifactType] = useState("REPORT_DRAFT")
  const [artifactFormat, setArtifactFormat] = useState("DOCX")
  const [creatingArtifact, setCreatingArtifact] = useState(false)
  const deferredArtifactSearch = useDeferredValue(artifactSearch)

  const loadDocuments = useCallback(async (nextKind = kindFilter) => {
    setDocumentsLoading(true)
    setDocumentsError("")
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (nextKind !== "ALL") params.set("kind", nextKind)
      const response = await fetch(`/api/documents?${params.toString()}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_documents"))
      setDocuments(Array.isArray(payload?.documents) ? payload.documents : [])
    } catch (error) {
      setDocuments([])
      setDocumentsError(error?.message || t("documents.errors.load_documents"))
    } finally {
      setDocumentsLoading(false)
    }
  }, [kindFilter, t])

  const loadArtifacts = useCallback(async (limit = initialArtifactLimit) => {
    setArtifactsLoading(true)
    setArtifactsError("")
    try {
      const response = await fetch(`/api/documents/artifacts?limit=${limit}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_artifacts"))
      setArtifacts(Array.isArray(payload?.artifacts) ? payload.artifacts : [])
    } catch (error) {
      setArtifacts([])
      setArtifactsError(error?.message || t("documents.errors.load_artifacts"))
    } finally {
      setArtifactsLoading(false)
    }
  }, [initialArtifactLimit, t])

  useEffect(() => { void loadDocuments(kindFilter) }, [kindFilter, loadDocuments])
  useEffect(() => { void loadArtifacts(initialArtifactLimit) }, [initialArtifactLimit, loadArtifacts])
  useEffect(() => {
    if (!successNotice) return undefined
    const timer = window.setTimeout(() => setSuccessNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [successNotice])
  useEffect(() => {
    const allowedIds = new Set(documents.filter((document) => document.agentAllowed).map((document) => document.id))
    setSelectedDocumentIds((current) => current.filter((id) => allowedIds.has(id)))
  }, [documents])

  const kindOptions = useMemo(() => DOCUMENT_KIND_VALUES.map((kind) => ({ value: kind, label: kindLabel(kind, t) })), [t])
  const templateForOptions = useMemo(() => TEMPLATE_FOR_VALUES.map((value) => ({ value, label: templateForLabel(value, t) })), [t])
  const artifactTypeOptions = useMemo(() => AGENT_ARTIFACT_TYPE_VALUES.map((value) => ({ value, label: artifactTypeLabel(value, t) })), [t])
  const artifactFormatOptions = useMemo(() => ([
    { value: "DOCX", label: "DOCX" },
    { value: "PDF", label: "PDF" }
  ]), [])
  const artifactSortOptions = useMemo(() => ([
    { value: "updated_desc", label: t("documents.artifacts.sort_updated_desc") },
    { value: "updated_asc", label: t("documents.artifacts.sort_updated_asc") },
    { value: "approved_desc", label: t("documents.artifacts.sort_approved_desc") },
    { value: "title_asc", label: t("documents.artifacts.sort_title_asc") }
  ]), [t])
  const filteredArtifacts = useMemo(() => {
    const query = normalizeSearchValue(deferredArtifactSearch)
    return artifacts
      .filter((artifact) => (artifactFilter === "ALL" ? true : artifact.status === artifactFilter))
      .filter((artifact) => (!query ? true : artifactSearchBlob(artifact, t).includes(query)))
      .sort((left, right) => compareArtifacts(left, right, artifactSort, t, locale))
  }, [artifactFilter, artifactSort, artifacts, deferredArtifactSearch, locale, t])
  const artifactCounts = useMemo(() => ({
    all: artifacts.length,
    draft: artifacts.filter((artifact) => artifact.status === "DRAFT").length,
    final: artifacts.filter((artifact) => artifact.status === "FINAL").length
  }), [artifacts])
  const artifactFilteredTotal = useMemo(() => artifactFilter === "ALL" ? artifacts.length : artifacts.filter((artifact) => artifact.status === artifactFilter).length, [artifactFilter, artifacts])
  const artifactHasSearch = normalizeSearchValue(artifactSearch).length > 0

  async function submitUpload(event) {
    event.preventDefault()
    if (!uploadFile || uploading) return
    setUploading(true)
    setSuccessNotice(null)
    setDocumentsError("")
    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("title", uploadTitle)
      formData.append("kind", uploadKind)
      if (uploadKind === "TEMPLATE" && uploadTemplateFor) formData.append("templateFor", uploadTemplateFor)
      const response = await fetch("/api/documents", { method: "POST", body: formData })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.upload_failed"))
      setUploadTitle("")
      setUploadKind("MATERIAL")
      setUploadTemplateFor("")
      setUploadFile(null)
      setSuccessNotice({ message: t("documents.feedback.uploaded") })
      await loadDocuments(kindFilter)
    } catch (error) {
      setDocumentsError(error?.message || t("documents.errors.upload_failed"))
    } finally {
      setUploading(false)
    }
  }

  async function patchDocument(id, data, successKey = "documents.feedback.saved") {
    setSuccessNotice(null)
    setDocumentsError("")
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.save_failed"))
      setSuccessNotice({ message: t(successKey) })
      await loadDocuments(kindFilter)
      return true
    } catch (error) {
      setDocumentsError(error?.message || t("documents.errors.save_failed"))
      return false
    }
  }

  async function deleteDocument(id) {
    if (!window.confirm(t("documents.confirm.delete_document"))) return
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.delete_failed"))
      setSuccessNotice({ message: t("documents.feedback.deleted") })
      await loadDocuments(kindFilter)
    } catch (error) {
      setDocumentsError(error?.message || t("documents.errors.delete_failed"))
    }
  }

  async function deleteArtifact(id) {
    if (!window.confirm(t("documents.confirm.delete_artifact"))) return
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(id)}`, { method: "DELETE" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.delete_artifact_failed"))
      setSuccessNotice({ message: t("documents.feedback.artifact_deleted") })
      await loadArtifacts(initialArtifactLimit)
    } catch (error) {
      setArtifactsError(error?.message || t("documents.errors.delete_artifact_failed"))
    }
  }

  async function copyArtifact(content) {
    try {
      await navigator.clipboard.writeText(String(content || ""))
      setArtifactsError("")
      setSuccessNotice({ message: t("documents.feedback.copied") })
    } catch {
      setArtifactsError(t("documents.errors.copy_failed"))
    }
  }

  async function saveRename(id) {
    const ok = await patchDocument(id, { title: editingTitle })
    if (ok) {
      setEditingId(null)
      setEditingTitle("")
    }
  }

  function toggleDocumentSelection(documentId, checked) {
    setSelectedDocumentIds((current) => {
      if (checked) return current.includes(documentId) ? current : [...current, documentId]
      return current.filter((id) => id !== documentId)
    })
  }

  async function createArtifactFromSelection() {
    if (!selectedDocumentIds.length || creatingArtifact) return
    setCreatingArtifact(true)
    setDocumentsError("")
    setSuccessNotice(null)
    try {
      const response = await fetch("/api/documents/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: artifactType, documentIds: selectedDocumentIds })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.create_artifact_failed"))
      const artifact = payload?.artifact
      await loadArtifacts(initialArtifactLimit)
      setSelectedDocumentIds([])
      setSuccessNotice({
        message: t("documents.feedback.draft_created"),
        actionLabel: t("documents.actions.open"),
        actionUrl: artifact?.id ? localizePath(`/documents/artifacts/${encodeURIComponent(artifact.id)}`, locale) : null
      })
      if (artifact?.id) router.push(localizePath(`/documents/artifacts/${encodeURIComponent(artifact.id)}`, locale))
    } catch (error) {
      setDocumentsError(error?.message || t("documents.errors.create_artifact_failed"))
    } finally {
      setCreatingArtifact(false)
    }
  }

  return (
    <section className="documents-workspace documents-workspace-page">
      <div className={`documents-workspace-shell ${isArtifactsExpanded ? "documents-workspace-shell--artifacts" : ""}`}>
          <div className="documents-grid">
              <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-panel--primary rounded-[1.3rem]">
                <BackButton
                  onClick={() => router.push(localizePath("/vestlus", locale))}
                  ariaLabel={t("buttons.back")}
                  className="documents-back-button absolute top-[0.55rem] left-[0.55rem] translate-x-0 translate-y-0 bottom-auto !h-[4rem] !w-[4rem] z-[92] [&>svg]:!h-[4rem] [&>svg]:!w-[4rem] max-[48em]:top-[calc(env(safe-area-inset-top,0px)+0.56rem)] max-[48em]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)] max-[48em]:!h-[4.4rem] max-[48em]:!w-[4.4rem] max-[48em]:[&>svg]:!h-[4.4rem] max-[48em]:[&>svg]:!w-[4.4rem]"
                />
                <header className="documents-page-header documents-page-header--panel">
                  <div className="documents-page-header-row">
                    <div className="documents-page-heading">
                      <h1 className={documentsTitleClassName}>{t("documents.page_title")}</h1>
                    </div>
                  </div>
                </header>
                {successNotice ? <div className="documents-notice documents-notice--info flex flex-wrap items-center justify-between gap-[0.7rem] rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]"><span>{successNotice.message}</span><div className="flex items-center gap-[0.8rem]">{successNotice.actionUrl ? <Link href={successNotice.actionUrl} className="font-medium underline underline-offset-[0.22rem]">{successNotice.actionLabel || t("documents.actions.open")}</Link> : null}<button type="button" className="text-[0.88rem] underline underline-offset-[0.18rem]" onClick={() => setSuccessNotice(null)}>{t("common.close")}</button></div></div> : null}
                {documentsError ? <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">{documentsError}</div> : null}
                {artifactsError ? <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">{artifactsError}</div> : null}
                <div className="documents-composer-grid mt-[1rem]">
                  <div className="documents-library-section">
                    <div className="documents-library-intro documents-library-divider documents-section-divider pb-[0.65rem]">
                      <div className="documents-section-heading">
                        <div className="documents-section-copy">
                          <h2 className="documents-section-title">{t("documents.inputs_title")}</h2>
                        </div>
                      </div>
                      <div className="documents-library-copy">
                        <p className="documents-section-description documents-library-description">{t("documents.inputs_description")} <span className="documents-library-help-inline">{t("documents.form.file_help")}</span></p>
                      </div>
                    </div>
                    <div className="documents-filter-row documents-library-filters">
                        {["ALL", ...DOCUMENT_KIND_VALUES].map((kind) => <button key={kind} type="button" className={chipClassName(kindFilter === kind)} onClick={() => setKindFilter(kind)}>{kind === "ALL" ? t("documents.filters.all") : kindLabel(kind, t)}</button>)}
                    </div>
                    <form className="documents-upload-form" onSubmit={submitUpload}>
                      <div className="documents-library-top-row grid gap-[0.65rem] min-[42rem]:grid-cols-[minmax(0,1.5fr)_minmax(11rem,0.9fr)]">
                    <Input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder={t("documents.form.title_placeholder")} className="documents-form-input" />
                    <DocumentsDropdown ariaLabel={t("documents.form.kind_label")} value={uploadKind} onChange={(nextValue) => { setUploadKind(nextValue); if (nextValue !== "TEMPLATE") setUploadTemplateFor("") }} options={kindOptions} className="documents-dropdown--kind" align="end" />
                  </div>
                  {uploadKind === "TEMPLATE" ? <DocumentsDropdown ariaLabel={t("documents.form.template_for_placeholder")} value={uploadTemplateFor} onChange={setUploadTemplateFor} options={templateForOptions} placeholder={t("documents.form.template_for_placeholder")} align="end" /> : null}
                  <div className="documents-upload-layout documents-upload-layout--library">
                    <div className="documents-upload-field text-[0.94rem]">
                    <input ref={uploadInputRef} className="sr-only" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
                    <div className="documents-upload-file-row mt-[0.45rem] flex flex-wrap items-center gap-[0.7rem]"><Button type="button" size="sm" className="documents-primary-button documents-primary-button--compact documents-upload-choose-button" onClick={() => uploadInputRef.current?.click()}>{t("documents.form.choose_file")}</Button><span className="documents-meta-text text-[0.96rem]">{uploadFile ? `${uploadFile.name} · ${formatFileSize(uploadFile.size)}` : t("documents.form.no_file_selected")}</span></div>
                  </div>
                  <div className="documents-upload-actions">
                    <Button type="submit" size="sm" className="documents-primary-button documents-upload-submit" disabled={!uploadFile || uploading}>{uploading ? t("documents.form.uploading") : t("documents.actions.upload")}</Button>
                  </div>
                  </div>
                    </form>
                  </div>

                  <div className="documents-agent-section documents-inline-section mt-0">
                    <div className="documents-tool-card-header documents-tool-card-header--inline">
                      <div>
                        <h3 className="documents-subsection-title">{t("documents.multi_doc.title")}</h3>
                        <p className="documents-section-description mt-[0.18rem]">{t("documents.multi_doc.description", { count: selectedDocumentIds.length })}</p>
                      </div>
                    </div>
                    <div className="documents-report-controls documents-report-controls--builder mt-[0.42rem]">
                      <DocumentsDropdown ariaLabel={t("documents.multi_doc.title")} value={artifactType} onChange={setArtifactType} options={artifactTypeOptions} className="documents-dropdown--type" />
                      <DocumentsDropdown ariaLabel={t("documents.form.format_label")} value={artifactFormat} onChange={setArtifactFormat} options={artifactFormatOptions} placeholder={t("documents.form.format_label")} className="documents-dropdown--format" align="end" />
                      <div className="documents-controls-actions">
                        <Button type="button" size="sm" className="documents-primary-button documents-primary-button--compact documents-report-submit" disabled={!selectedDocumentIds.length || creatingArtifact} onClick={() => void createArtifactFromSelection()}>{creatingArtifact ? t("documents.actions.creating_report") : t("documents.actions.create_report")}</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[0.9rem] flex flex-col gap-[0.72rem]">
                  {documentsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
                  {!documentsLoading && documents.length === 0 ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.empty_documents")}</div> : null}
                  {documents.map((document) => <article key={document.id} className="documents-card rounded-[1rem] border px-[0.85rem] py-[0.8rem]">
                    <div className="documents-card-header">
                      <div className="documents-card-main">
                        <label className={`documents-card-select border ${document.agentAllowed ? "border-[rgba(197,113,113,0.5)]" : "border-[rgba(148,163,184,0.24)] opacity-50"}`}>
                          <input type="checkbox" className="h-[0.95rem] w-[0.95rem]" checked={selectedDocumentIds.includes(document.id)} disabled={!document.agentAllowed} onChange={(event) => toggleDocumentSelection(document.id, event.target.checked)} aria-label={t("documents.actions.select_document", { title: document.title })} />
                        </label>
                        <div className="min-w-0 flex-1">
                          {editingId === document.id ? <div className="flex flex-wrap gap-[0.45rem]"><Input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} className="documents-form-input min-w-[15rem] flex-1" /><Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void saveRename(document.id)}>{t("buttons.save")}</Button><Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => { setEditingId(null); setEditingTitle("") }}>{t("buttons.cancel")}</Button></div> : <>
                            <div className="flex flex-wrap items-center gap-[0.45rem]"><h3 className="documents-strong-text text-[1rem] font-semibold">{document.title}</h3><span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{kindLabel(document.kind, t)}</span>{document.templateFor ? <span className="documents-chip is-active rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{templateForLabel(document.templateFor, t)}</span> : null}</div>
                            <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{document.originalName} · {formatFileSize(document.size)} · {formatDate(document.updatedAt, locale)}</p>
                            {!document.agentAllowed ? <p className="documents-meta-text mt-[0.25rem] text-[0.84rem]">{t("documents.multi_doc.enable_agent_allowed")}</p> : null}
                          </>}
                        </div>
                      </div>
                      <div className="documents-card-toggle"><span className="documents-meta-text text-[0.84rem]">{t("documents.actions.agent_allowed")}</span><Toggle id={`doc-agent-${document.id}`} checked={document.agentAllowed} onChange={(nextValue) => { void patchDocument(document.id, { agentAllowed: nextValue }) }} /></div>
                    </div>
                    <div className="mt-[0.72rem] grid gap-[0.55rem] min-[52rem]:grid-cols-[minmax(0,1fr)_auto] min-[52rem]:items-end">
                      <div className="documents-controls-grid">
                        <DocumentsDropdown ariaLabel={t("documents.form.kind_label")} value={document.kind} onChange={(nextKind) => { void patchDocument(document.id, { kind: nextKind, templateFor: nextKind === "TEMPLATE" ? document.templateFor : null }) }} options={kindOptions} />
                        <DocumentsDropdown ariaLabel={t("documents.form.template_for_placeholder")} value={document.templateFor || ""} disabled={document.kind !== "TEMPLATE"} onChange={(nextValue) => { void patchDocument(document.id, { templateFor: nextValue || null }) }} options={templateForOptions} placeholder={t("documents.form.template_for_placeholder")} align="end" />
                      </div>
                      <div className="documents-row-actions"><Button as="a" href={`/api/documents/${encodeURIComponent(document.id)}/download`} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download")}</Button><Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => { setEditingId(document.id); setEditingTitle(document.title || "") }}>{t("documents.actions.rename")}</Button><Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteDocument(document.id)}>{t("documents.actions.delete")}</Button></div>
                    </div>
                  </article>)}
                </div>
              </Panel>

              <Panel as="section" id="artifacts" variant="secondary" padding="sm" className="documents-panel rounded-[1.3rem]">
                <div className="documents-section-divider pb-[0.45rem]">
                  <div className="flex flex-wrap items-start justify-between gap-[0.8rem]">
                    <h2 className="documents-section-title">{t("documents.outputs_title")}</h2>
                  </div>
                  <p className="documents-section-description mt-[0.18rem]">{t("documents.outputs_description")}</p>
                </div>
                <div className="mt-[0.42rem] flex flex-wrap items-center justify-between gap-[0.8rem]">
                  <div className="flex flex-wrap gap-[0.4rem]">
                    {[{ key: "ALL", label: t("documents.filters.all"), count: artifactCounts.all }, { key: "DRAFT", label: artifactStatusLabel("draft", t), count: artifactCounts.draft }, { key: "FINAL", label: artifactStatusLabel("final", t), count: artifactCounts.final }].map((item) => <button key={item.key} type="button" className={chipClassName(artifactFilter === item.key)} onClick={() => setArtifactFilter(item.key)}><ChipLabel label={item.label} count={item.count} /></button>)}
                  </div>
                  <div className="flex flex-wrap items-center gap-[0.8rem] justify-end">
                    <span className="documents-meta-text documents-results-summary text-[1rem]">{t("documents.artifacts.results_count", { shown: filteredArtifacts.length, total: artifactFilteredTotal })}</span>
                    <Link href={localizePath(isArtifactsExpanded ? "/documents#artifacts" : "/documents?artifacts=all#artifacts", locale)} className={`${linkBrandInlineClass} documents-link-button documents-meta-text text-[1rem] leading-[1.64]`}>{isArtifactsExpanded ? t("documents.actions.show_latest") : t("documents.actions.open_all_results")}</Link>
                  </div>
                </div>
                {isArtifactsExpanded ? <Panel variant="secondary" padding="sm" className="documents-subpanel documents-artifacts-toolbar mt-[0.85rem] grid gap-[0.7rem] rounded-[1rem]">
                  <div className="grid gap-[0.35rem]">
                    <Input value={artifactSearch} onChange={(event) => setArtifactSearch(event.target.value)} placeholder={t("documents.artifacts.search_placeholder")} className="documents-form-input w-full" />
                    <p className="documents-meta-text text-[0.84rem]">{artifactFilter === "FINAL" ? t("documents.artifacts.final_search_hint") : t("documents.artifacts.search_help")}</p>
                  </div>
                  <div className="grid gap-[0.35rem]">
                    <span className="documents-meta-text text-[0.88rem]">{t("documents.artifacts.sort_label")}</span>
                    <DocumentsDropdown ariaLabel={t("documents.artifacts.sort_label")} value={artifactSort} onChange={setArtifactSort} options={artifactSortOptions} align="end" />
                  </div>
                </Panel> : null}
                <div className="mt-[0.9rem] flex flex-col gap-[0.72rem]">
                  {artifactsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
                  {!artifactsLoading && filteredArtifacts.length === 0 ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{artifactHasSearch || artifactFilter !== "ALL" ? t("documents.artifacts.no_matches") : t("documents.empty_artifacts")}</div> : null}
                  {filteredArtifacts.map((artifact) => <article key={artifact.id} className="documents-card rounded-[1rem] border px-[0.85rem] py-[0.8rem]">
                    <div className="flex flex-wrap items-center gap-[0.45rem]"><h3 className="documents-strong-text text-[1rem] font-semibold">{artifact.title || artifactTypeLabel(artifact.type, t)}</h3><span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{artifactTypeLabel(artifact.type, t)}</span><span className={`documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em] ${artifact.status === "FINAL" ? "is-active" : ""}`}>{artifactStatusLabel(artifact.status, t)}</span></div>
                    <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{formatDate(artifact.createdAt, locale)} · {t("documents.updated_at")} {formatDate(artifact.updatedAt, locale)}{artifact.approvedAt ? ` · ${t("documents.approved_at")} ${formatDate(artifact.approvedAt, locale)}` : ""}</p>
                    <p className="documents-artifact-snippet mt-[0.45rem] text-[0.94rem] leading-[1.55]">{artifact.snippet}</p>
                    <p className="documents-meta-text mt-[0.25rem] text-[0.84rem]">{t("documents.sources_label", { count: artifact.sourceCount || 0 })}</p>
                    {isArtifactsExpanded && artifact.sources?.length ? <div className="mt-[0.45rem] flex flex-wrap gap-[0.4rem]">
                      {artifact.sources.slice(0, 4).map((source) => <span key={source.id} className="documents-source-pill rounded-full border px-[0.55rem] py-[0.18rem] text-[0.8rem]">{source.title || source.originalName}</span>)}
                      {artifact.sources.length > 4 ? <span className="documents-source-pill rounded-full border px-[0.55rem] py-[0.18rem] text-[0.8rem]">{t("documents.artifacts.source_preview_more", { count: artifact.sources.length - 4 })}</span> : null}
                    </div> : null}
                  <div className="documents-row-actions">{artifact.downloadUrls?.docx ? <Button as="a" href={artifact.downloadUrls.docx} size="sm" className="documents-primary-button">{t("documents.actions.download_docx")}</Button> : null}{artifact.downloadUrls?.pdf ? <Button as="a" href={artifact.downloadUrls.pdf} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download_pdf")}</Button> : null}<Link href={localizePath(`/documents/artifacts/${encodeURIComponent(artifact.id)}`, locale)} className={`${linkBrandInlineClass} documents-link-button inline-flex min-h-[2.5rem] items-center justify-center rounded-full px-[0.98rem] py-[0.5rem] text-[0.96rem]`}>{t("documents.actions.open")}</Link><Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void copyArtifact(artifact.content)}>{t("documents.actions.copy")}</Button><Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteArtifact(artifact.id)}>{t("documents.actions.delete")}</Button></div>
                  </article>)}
                </div>
              </Panel>
            </div>
      </div>
    </section>
  )
}
