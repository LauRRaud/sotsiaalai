"use client"

import Link from "next/link"
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useEffectiveRole } from "@/components/auth/useEffectiveRole"
import { useI18n } from "@/components/i18n/I18nProvider"
import BackButton from "@/components/ui/BackButton"
import Button from "@/components/ui/Button"
import DocumentsDropdown from "@/components/documents/DocumentsDropdown"
import Input from "@/components/ui/Input"
import Panel from "@/components/ui/Panel"
import { glassPageBackTopLeftClassName, glassPageTitleClassName, glassPageTitleMobileHeaderClassName } from "@/components/ui/glassPageStyles"
import { linkBrandInlineClass } from "@/components/ui/linkStyles"
import { ARTIFACT_LIST_LIMIT_ALL, DOCUMENT_KIND_VALUES, TEMPLATE_FOR_VALUES } from "@/lib/documents/constants"
import {
  artifactStatusLabel,
  artifactTypeLabel,
  formatDate,
  formatFileSize,
  kindLabel,
  templateForLabel
} from "@/lib/documents/presentation"
import { localizePath } from "@/lib/localizePath"

const documentsTitleClassName =
  `${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} !mt-0 !mb-0 !px-0 !text-center !whitespace-normal ` +
  `!text-[clamp(1.9rem,3.6vw,2.6rem)] !leading-[1.06] !tracking-[0.02em] ` +
  `max-[768px]:!text-[clamp(1.64rem,6vw,2rem)] max-[768px]:!leading-[1.08] max-[768px]:!mt-0`

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase()
}

function artifactSearchBlob(artifact, t) {
  const sourcesText = Array.isArray(artifact?.sources)
    ? artifact.sources.map((source) => `${source?.title || ""} ${source?.originalName || ""}`).join(" ")
    : ""
  return normalizeSearchValue([
    artifact?.title,
    artifact?.snippet,
    artifact?.type,
    artifactTypeLabel(artifact?.type, t),
    sourcesText
  ].join(" "))
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

export default function DocumentsPage({ initialArtifactLimit, artifactsExpanded = false }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { effectiveRole, isAdmin, isRoleViewActive } = useEffectiveRole()
  const isClientRole = effectiveRole === "CLIENT"
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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])
  const uploadInputRef = useRef(null)
  const deferredArtifactSearch = useDeferredValue(artifactSearch)
  const roleScope = effectiveRole === "SOCIAL_WORKER" ? "worker" : "client"
  const roleViewLabel = t(effectiveRole === "SOCIAL_WORKER" ? "profile.role_short.worker" : "profile.role_short.client")
  const roleIntroText = t(`documents.view_mode.intro_${roleScope}`)
  const handoffHelpText = selectedDocumentIds.length
    ? t(`documents.agent_handoff.ready_help_${roleScope}`)
    : t(`documents.agent_handoff.empty_help_${roleScope}`)

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
  const artifactSortOptions = useMemo(() => ([
    { value: "updated_desc", label: t("documents.artifacts.sort_updated_desc") },
    { value: "updated_asc", label: t("documents.artifacts.sort_updated_asc") },
    { value: "approved_desc", label: t("documents.artifacts.sort_approved_desc") },
    { value: "title_asc", label: t("documents.artifacts.sort_title_asc") }
  ]), [t])
  const agentModeHref = useMemo(() => {
    const basePath = localizePath("/agendireziim", locale)
    if (!selectedDocumentIds.length) return basePath
    const params = new URLSearchParams({ documents: selectedDocumentIds.join(",") })
    return `${basePath}?${params.toString()}`
  }, [locale, selectedDocumentIds])
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
  const artifactFilteredTotal = useMemo(() => (artifactFilter === "ALL" ? artifacts.length : artifacts.filter((artifact) => artifact.status === artifactFilter).length), [artifactFilter, artifacts])
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

  async function copyArtifact(artifactId) {
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.copy_failed"))
      await navigator.clipboard.writeText(String(payload?.artifact?.content || ""))
      setArtifactsError("")
      setSuccessNotice({ message: t("documents.feedback.copied") })
    } catch (error) {
      setArtifactsError(error?.message || t("documents.errors.copy_failed"))
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

  if (isClientRole) return null

  return (
    <section className="documents-workspace documents-workspace-page">
      <div className={`documents-workspace-shell ${isArtifactsExpanded ? "documents-workspace-shell--artifacts" : ""}`}>
        <div className="documents-grid">
          <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-panel--primary rounded-[1.3rem]">
            <BackButton
              onClick={() => router.push(localizePath("/vestlus", locale))}
              ariaLabel={t("buttons.back")}
              className={glassPageBackTopLeftClassName}
            />
            <header className="documents-page-header documents-page-header--panel">
              <div className="documents-page-header-row">
                <div className="documents-page-heading">
                  <h1 className={documentsTitleClassName}>{t("documents.page_title")}</h1>
                </div>
              </div>
            </header>

            {isAdmin && isRoleViewActive ? (
              <div className="documents-notice documents-notice--muted rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                {t("documents.view_mode.admin_notice", { role: roleViewLabel })}
              </div>
            ) : null}

            {successNotice ? (
              <div className="documents-notice documents-notice--info flex flex-wrap items-center justify-between gap-[0.7rem] rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                <span>{successNotice.message}</span>
                <div className="flex items-center gap-[0.8rem]">
                  {successNotice.actionUrl ? <Link href={successNotice.actionUrl} className="font-medium underline underline-offset-[0.22rem]">{successNotice.actionLabel || t("documents.actions.open")}</Link> : null}
                  <button type="button" className="text-[0.88rem] underline underline-offset-[0.18rem]" onClick={() => setSuccessNotice(null)}>{t("common.close")}</button>
                </div>
              </div>
            ) : null}
            {documentsError ? <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">{documentsError}</div> : null}
            {artifactsError ? <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">{artifactsError}</div> : null}

            <div className="documents-section-stack mt-[1rem]">
              <div className="documents-library-section documents-library-intro">
                <div className="documents-library-intro">
                  <div className="documents-library-copy">
                    <p className="documents-section-description documents-library-description">{roleIntroText} <span className="documents-library-help-inline">{t("documents.form.file_help")}</span></p>
                  </div>
                </div>

                <Panel variant="secondary" padding="sm" className="documents-subpanel documents-section-body rounded-[1rem]">
                <div className="documents-subsection-stack">
                  <div className="documents-subsection-copy">
                    <h3 className="documents-subsection-title">{t("documents.library_sections.upload_title")}</h3>
                    <p className="documents-section-description documents-subsection-description">{t("documents.library_sections.upload_description")}</p>
                  </div>
                <form className="documents-upload-form documents-library-upload-block" onSubmit={submitUpload}>
                  <div className="documents-library-top-row grid gap-[0.65rem] min-[42rem]:grid-cols-[minmax(0,1.5fr)_minmax(11rem,0.9fr)]">
                    <Input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder={t("documents.form.title_placeholder")} className="documents-form-input" />
                    <DocumentsDropdown ariaLabel={t("documents.form.kind_label")} value={uploadKind} onChange={(nextValue) => { setUploadKind(nextValue); if (nextValue !== "TEMPLATE") setUploadTemplateFor("") }} options={kindOptions} className="documents-dropdown--kind" align="end" />
                  </div>
                  {uploadKind === "TEMPLATE" ? <DocumentsDropdown ariaLabel={t("documents.form.template_for_placeholder")} value={uploadTemplateFor} onChange={setUploadTemplateFor} options={templateForOptions} placeholder={t("documents.form.template_for_placeholder")} align="end" /> : null}
                  <div className="documents-upload-layout documents-upload-layout--library">
                    <div className="documents-upload-field text-[0.94rem]">
                      <input ref={uploadInputRef} className="sr-only" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
                      <div className="documents-upload-file-row">
                        <Button type="button" size="sm" className="documents-primary-button documents-primary-button--compact documents-upload-choose-button" onClick={() => uploadInputRef.current?.click()}>{t("documents.form.choose_file")}</Button>
                        <span className="documents-meta-text text-[0.96rem]">{uploadFile ? `${uploadFile.name} · ${formatFileSize(uploadFile.size)}` : t("documents.form.no_file_selected")}</span>
                      </div>
                    </div>
                  <div className="documents-upload-actions">
                    <Button type="submit" size="sm" className="documents-primary-button documents-upload-submit" disabled={!uploadFile || uploading}>{uploading ? t("documents.form.uploading") : t("documents.actions.upload")}</Button>
                  </div>
                </div>
                </form>
                </div>

                <div className="documents-subsection-stack">
                  <div className="documents-subsection-copy">
                    <h3 className="documents-subsection-title">{t("documents.library_sections.list_title")}</h3>
                    <p className="documents-section-description documents-subsection-description">{t("documents.library_sections.list_description")}</p>
                  </div>
                <div className="documents-soft-subpanel rounded-[1rem]">
                <div className="documents-library-list-header">
                  <div className="documents-filter-row documents-library-filters">
                    {["ALL", ...DOCUMENT_KIND_VALUES].map((kind) => (
                      <button key={kind} type="button" className={chipClassName(kindFilter === kind)} onClick={() => setKindFilter(kind)}>
                        {kind === "ALL" ? t("documents.filters.all") : kindLabel(kind, t)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="documents-library-list flex flex-col gap-[0.72rem]">
              {documentsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
              {!documentsLoading && documents.length === 0 ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.empty_documents")}</div> : null}
              {documents.map((document) => (
                <article key={document.id} className="documents-card documents-document-row rounded-[1rem] border px-[0.85rem] py-[0.8rem]">
                  <div className="documents-document-row-top">
                    <div className="documents-document-row-main">
                      <div className="min-w-0 flex-1">
                        {editingId === document.id ? (
                          <div className="flex flex-wrap gap-[0.45rem]">
                            <Input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} className="documents-form-input min-w-[15rem] flex-1" />
                            <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void saveRename(document.id)}>{t("buttons.save")}</Button>
                            <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => { setEditingId(null); setEditingTitle("") }}>{t("buttons.cancel")}</Button>
                          </div>
                        ) : (
                          <>
                            <div className="documents-document-row-title">
                              <h3 className="documents-strong-text text-[1rem] font-semibold">{document.title}</h3>
                              <span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{kindLabel(document.kind, t)}</span>
                              {document.templateFor ? <span className="documents-chip is-active rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{templateForLabel(document.templateFor, t)}</span> : null}
                            </div>
                            <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{document.originalName} · {formatFileSize(document.size)} · {formatDate(document.updatedAt, locale)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="documents-document-row-side">
                      <label className="documents-inline-check documents-inline-check--allow">
                        <input type="checkbox" className="documents-checkbox" checked={document.agentAllowed} onChange={(event) => { void patchDocument(document.id, { agentAllowed: event.target.checked }) }} />
                        <span>{t("documents.actions.agent_allowed")}</span>
                      </label>
                    </div>
                  </div>
                  <div className="documents-document-row-selection">
                    {document.agentAllowed ? (
                      <label className="documents-select-card">
                        <input type="checkbox" className="documents-checkbox" checked={selectedDocumentIds.includes(document.id)} onChange={(event) => toggleDocumentSelection(document.id, event.target.checked)} aria-label={t("documents.actions.select_document", { title: document.title })} />
                        <span className="documents-select-card-copy">
                          <span className="documents-strong-text">{t("documents.actions.select_for_agent")}</span>
                        </span>
                      </label>
                    ) : (
                      <p className="documents-meta-text documents-row-help documents-row-help--inline">{t("documents.multi_doc.enable_agent_allowed")}</p>
                    )}
                  </div>
                  <div className="documents-document-row-bottom">
                    <div className="documents-controls-grid documents-controls-grid--row">
                      <DocumentsDropdown ariaLabel={t("documents.form.kind_label")} value={document.kind} onChange={(nextKind) => { void patchDocument(document.id, { kind: nextKind, templateFor: nextKind === "TEMPLATE" ? document.templateFor : null }) }} options={kindOptions} />
                      {document.kind === "TEMPLATE" ? <DocumentsDropdown ariaLabel={t("documents.form.template_for_placeholder")} value={document.templateFor || ""} onChange={(nextValue) => { void patchDocument(document.id, { templateFor: nextValue || null }) }} options={templateForOptions} placeholder={t("documents.form.template_for_placeholder")} align="end" /> : <div className="documents-row-spacer" aria-hidden="true" />}
                    </div>
                    <div className="documents-row-actions">
                      <Button as="a" href={`/api/documents/${encodeURIComponent(document.id)}/download`} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download")}</Button>
                      <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => { setEditingId(document.id); setEditingTitle(document.title || "") }}>{t("documents.actions.rename")}</Button>
                      <Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteDocument(document.id)}>{t("documents.actions.delete")}</Button>
                    </div>
                  </div>
                </article>
              ))}
                </div>
                </div>
                </div>

                </Panel>
              </div>
            </div>
          </Panel>

          <Panel as="section" variant="secondary" padding="sm" className="documents-panel rounded-[1.3rem]">
            <div className="documents-section-stack">
            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-section-body rounded-[1rem]">
            <div className="documents-subsection-copy">
              <h3 className="documents-subsection-title">{t("documents.agent_handoff.title")}</h3>
              <p className="documents-section-description documents-subsection-description">{handoffHelpText}</p>
            </div>
            <div className="documents-agent-section">
              <div className="documents-tool-card-header documents-tool-card-header--inline">
                <span className="documents-selection-chip documents-chip rounded-full px-[0.85rem] py-[0.28rem] text-[1rem]">{t("documents.agent_handoff.selected_count", { count: selectedDocumentIds.length })}</span>
              </div>
              <div className="documents-agent-handoff-bar">
                {selectedDocumentIds.length ? (
                  <Button as="a" href={agentModeHref} size="sm" className="documents-primary-button documents-primary-button--compact documents-agent-handoff-button">{t("documents.actions.open_agent_mode")}</Button>
                ) : (
                  <Button type="button" size="sm" disabled className="documents-primary-button documents-primary-button--compact documents-agent-handoff-button">{t("documents.actions.open_agent_mode")}</Button>
                )}
              </div>
            </div>
            </Panel>
            </div>
          </Panel>

          <Panel as="section" id="artifacts" variant="secondary" padding="sm" className="documents-panel rounded-[1.3rem]">
            <div className="documents-section-stack">
            <Panel variant="secondary" padding="sm" className="documents-subpanel documents-section-body rounded-[1rem]">
            <div className="documents-subsection-copy">
              <h3 className="documents-subsection-title">{t("documents.outputs_title")}</h3>
              <p className="documents-section-description documents-subsection-description">{t("documents.outputs_description")}</p>
            </div>
            <div className="mt-[0.42rem] flex flex-wrap items-center justify-between gap-[0.8rem]">
              <div className="flex flex-wrap gap-[0.4rem]">
                {[{ key: "ALL", label: t("documents.filters.all"), count: artifactCounts.all }, { key: "DRAFT", label: artifactStatusLabel("draft", t), count: artifactCounts.draft }, { key: "FINAL", label: artifactStatusLabel("final", t), count: artifactCounts.final }].map((item) => (
                  <button key={item.key} type="button" className={chipClassName(artifactFilter === item.key)} onClick={() => setArtifactFilter(item.key)}>
                    <ChipLabel label={item.label} count={item.count} />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-[0.8rem] justify-end">
                <span className="documents-meta-text documents-results-summary text-[1rem]">{t("documents.artifacts.results_count", { shown: filteredArtifacts.length, total: artifactFilteredTotal })}</span>
                <Link href={localizePath(isArtifactsExpanded ? "/documents#artifacts" : "/documents?artifacts=all#artifacts", locale)} className={`${linkBrandInlineClass} documents-link-button documents-meta-text text-[1rem] leading-[1.64]`}>{isArtifactsExpanded ? t("documents.actions.show_latest") : t("documents.actions.open_all_results")}</Link>
              </div>
            </div>
            {isArtifactsExpanded ? (
              <Panel variant="secondary" padding="sm" className="documents-subpanel documents-artifacts-toolbar mt-[0.85rem] grid gap-[0.7rem] rounded-[1rem]">
                <div className="grid gap-[0.35rem]">
                  <Input value={artifactSearch} onChange={(event) => setArtifactSearch(event.target.value)} placeholder={t("documents.artifacts.search_placeholder")} className="documents-form-input w-full" />
                  <p className="documents-meta-text text-[0.84rem]">{artifactFilter === "FINAL" ? t("documents.artifacts.final_search_hint") : t("documents.artifacts.search_help")}</p>
                </div>
                <div className="grid gap-[0.35rem]">
                  <span className="documents-meta-text text-[0.88rem]">{t("documents.artifacts.sort_label")}</span>
                  <DocumentsDropdown ariaLabel={t("documents.artifacts.sort_label")} value={artifactSort} onChange={setArtifactSort} options={artifactSortOptions} align="end" />
                </div>
              </Panel>
            ) : null}
            <div className="mt-[0.9rem] flex flex-col gap-[0.72rem]">
              {artifactsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
              {!artifactsLoading && filteredArtifacts.length === 0 ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{artifactHasSearch || artifactFilter !== "ALL" ? t("documents.artifacts.no_matches") : t("documents.empty_artifacts")}</div> : null}
              {filteredArtifacts.map((artifact) => (
                <article key={artifact.id} className="documents-card rounded-[1rem] border px-[0.85rem] py-[0.8rem]">
                  <div className="flex flex-wrap items-center gap-[0.45rem]">
                    <h3 className="documents-strong-text text-[1rem] font-semibold">{artifact.title || artifactTypeLabel(artifact.type, t)}</h3>
                    <span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{artifactTypeLabel(artifact.type, t)}</span>
                    <span className={`documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em] ${artifact.status === "FINAL" ? "is-active" : ""}`}>{artifactStatusLabel(artifact.status, t)}</span>
                  </div>
                  <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{formatDate(artifact.createdAt, locale)} · {t("documents.updated_at")} {formatDate(artifact.updatedAt, locale)}{artifact.approvedAt ? ` · ${t("documents.approved_at")} ${formatDate(artifact.approvedAt, locale)}` : ""}</p>
                  <p className="documents-artifact-snippet mt-[0.45rem] text-[0.94rem] leading-[1.55]">{artifact.snippet}</p>
                  <p className="documents-meta-text mt-[0.25rem] text-[0.84rem]">{t("documents.sources_label", { count: artifact.sourceCount || 0 })}</p>
                  {isArtifactsExpanded && artifact.sources?.length ? <div className="mt-[0.45rem] flex flex-wrap gap-[0.4rem]">{artifact.sources.slice(0, 4).map((source) => <span key={source.id} className="documents-source-pill rounded-full border px-[0.55rem] py-[0.18rem] text-[0.8rem]">{source.title || source.originalName}</span>)}{artifact.sources.length > 4 ? <span className="documents-source-pill rounded-full border px-[0.55rem] py-[0.18rem] text-[0.8rem]">{t("documents.artifacts.source_preview_more", { count: artifact.sources.length - 4 })}</span> : null}</div> : null}
                  <div className="documents-row-actions">
                    {artifact.downloadUrls?.docx ? <Button as="a" href={artifact.downloadUrls.docx} size="sm" className="documents-primary-button">{t("documents.actions.download_docx")}</Button> : null}
                    {artifact.downloadUrls?.pdf ? <Button as="a" href={artifact.downloadUrls.pdf} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download_pdf")}</Button> : null}
                    <Link href={localizePath(`/documents/artifacts/${encodeURIComponent(artifact.id)}`, locale)} className={`${linkBrandInlineClass} documents-link-button inline-flex min-h-[2.5rem] items-center justify-center rounded-full px-[0.98rem] py-[0.5rem] text-[0.96rem]`}>{t("documents.actions.open")}</Link>
                    <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void copyArtifact(artifact.id)}>{t("documents.actions.copy")}</Button>
                    <Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteArtifact(artifact.id)}>{t("documents.actions.delete")}</Button>
                  </div>
                </article>
              ))}
            </div>
            </Panel>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
