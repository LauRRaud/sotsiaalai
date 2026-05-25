"use client"

import Link from "next/link"
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useEffectiveRole } from "@/components/auth/useEffectiveRole"
import { useI18n } from "@/components/i18n/I18nProvider"
import AdminRoleViewCycleButton from "@/components/workspace/AdminRoleViewCycleButton"
import Button from "@/components/ui/Button"
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay"
import DocumentsDropdown from "@/components/documents/DocumentsDropdown"
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader"
import Input from "@/components/ui/Input"
import Panel from "@/components/ui/Panel"
import OptionCard from "@/components/ui/OptionCard"
import {
  glassPrimaryButtonToneClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles"
import { linkBrandInlineClass, linkRichTextBase } from "@/components/ui/linkStyles"
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName"
import { ARTIFACT_LIST_LIMIT_ALL, DOCUMENT_KIND_VALUES, DOCUMENT_LIST_LIMIT, TEMPLATE_FOR_VALUES } from "@/lib/documents/constants"
import {
  artifactStatusLabel,
  artifactTypeLabel,
  formatDate,
  formatFileSize,
  kindLabel,
  templateForLabel
} from "@/lib/documents/presentation"
import { WORKER_FRAMEWORK_SIGNED_HREF, WORKER_FRAMEWORK_VERSION } from "@/lib/frameworkAcceptances"
import { localizePath } from "@/lib/localizePath"
import { pushWithTransition } from "@/lib/routeTransition"

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__"

function markChatWorkspaceRestore() {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(
      CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
      JSON.stringify({ ts: Date.now() })
    )
  } catch {}
}

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase()
}

function ChipLabel({ label, count }) {
  return (
    <>
      <span>{label}</span>
      {typeof count === "number" ? <span className="documents-chip-count">&nbsp;({count})</span> : null}
    </>
  )
}

function createPaginationState(limit) {
  return {
    total: 0,
    limit,
    offset: 0,
    hasPrevious: false,
    hasNext: false,
    previousOffset: 0,
    nextOffset: 0
  }
}

function normalizePaginationState(payload, fallbackLimit, fallbackOffset = 0) {
  const pagination = payload?.pagination || {}
  const limit = Number.isFinite(Number(pagination.limit)) ? Math.max(1, Number(pagination.limit)) : fallbackLimit
  const offset = Number.isFinite(Number(pagination.offset)) ? Math.max(0, Number(pagination.offset)) : fallbackOffset
  const total = Number.isFinite(Number(pagination.total)) ? Math.max(0, Number(pagination.total)) : 0
  const hasPrevious = Boolean(pagination.hasPrevious)
  const hasNext = Boolean(pagination.hasNext)

  return {
    total,
    limit,
    offset,
    hasPrevious,
    hasNext,
    previousOffset: hasPrevious ? Math.max(0, Number(pagination.previousOffset) || offset - limit) : 0,
    nextOffset: hasNext ? Math.max(offset + limit, Number(pagination.nextOffset) || offset + limit) : offset
  }
}

function PaginationControls({ itemCount, pagination, t, onPrevious, onNext }) {
  if (!pagination || pagination.total <= pagination.limit) return null
  const start = pagination.total > 0 ? pagination.offset + 1 : 0
  const end = pagination.total > 0 ? Math.min(pagination.offset + itemCount, pagination.total) : 0

  return (
    <div className="mt-[0.85rem] flex flex-wrap items-center justify-between gap-[0.8rem] rounded-[1rem] border px-[0.95rem] py-[0.82rem]">
      <span className="documents-meta-text text-[0.92rem]">
        {t("documents.pagination.range", { start, end, total: pagination.total }, `${start}-${end} / ${pagination.total}`)}
      </span>
      <div className="flex flex-wrap items-center gap-[0.55rem]">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="documents-secondary-button"
          disabled={!pagination.hasPrevious}
          onClick={onPrevious}
        >
          {t("documents.pagination.previous", "Eelmine")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="documents-secondary-button"
          disabled={!pagination.hasNext}
          onClick={onNext}
        >
          {t("documents.pagination.next", "Jargmine")}
        </Button>
      </div>
    </div>
  )
}

const documentsChoiceCardClassName =
  `${primarySegmentedButtonClassName} inline-flex min-h-[2.72rem] items-center justify-center rounded-[1.6rem] border-[var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[1.05rem] py-[0.64rem] text-[1.06rem] leading-[1.2] tracking-[0.022em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:[background:var(--seg-card-bg-hover,var(--seg-card-bg))] hover:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] hover:text-[color:var(--seg-card-text-hover,var(--seg-card-text))] hover:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] active:[background:var(--seg-card-bg-active,var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg))))] active:border-[color:var(--seg-card-border-active,var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border))))] active:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] active:shadow-[var(--seg-card-shadow-active,var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow))))] text-center max-[768px]:min-h-[2.9rem] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.98rem] max-[768px]:py-[0.68rem] max-[768px]:text-[1.08rem]`
const documentsPanelLinkClassName =
  `${linkRichTextBase} documents-panel-link inline-block w-auto max-w-full whitespace-normal break-words [text-wrap:balance] ` +
  "text-[clamp(1.02rem,1.25vw,1.14rem)] leading-[1.1] font-medium " +
  "[--link-brand-text:var(--documents-accent)] " +
  "max-[768px]:text-[clamp(1.02rem,4.2vw,1.18rem)] max-[768px]:leading-[1.12]"
export default function DocumentsPage({ initialArtifactLimit, artifactsExpanded = false }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { effectiveRole, isAdmin, isRoleResolved, refresh: refreshEffectiveRole } = useEffectiveRole()
  const isClientRole = effectiveRole === "CLIENT"
  const isArtifactsExpanded = artifactsExpanded || initialArtifactLimit >= ARTIFACT_LIST_LIMIT_ALL
  const artifactPageSize = isArtifactsExpanded ? ARTIFACT_LIST_LIMIT_ALL : initialArtifactLimit
  const [kindFilter, setKindFilter] = useState("ALL")
  const [artifactFilter, setArtifactFilter] = useState("ALL")
  const [artifactSearch, setArtifactSearch] = useState("")
  const [artifactSort, setArtifactSort] = useState("updated_desc")
  const [documentsOffset, setDocumentsOffset] = useState(0)
  const [artifactsOffset, setArtifactsOffset] = useState(0)
  const [documents, setDocuments] = useState([])
  const [artifacts, setArtifacts] = useState([])
  const [documentsPagination, setDocumentsPagination] = useState(() => createPaginationState(DOCUMENT_LIST_LIMIT))
  const [artifactsPagination, setArtifactsPagination] = useState(() => createPaginationState(artifactPageSize))
  const [artifactCounts, setArtifactCounts] = useState({
    all: 0,
    draft: 0,
    final: 0
  })
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
  const [uploadDragActive, setUploadDragActive] = useState(false)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])
  const [frameworkStatus, setFrameworkStatus] = useState({
    loading: false,
    acceptance: null
  })
  const uploadInputRef = useRef(null)
  const deferredArtifactSearch = useDeferredValue(artifactSearch)
  const trimmedArtifactSearch = String(deferredArtifactSearch || "").trim()
  const roleScope = effectiveRole === "CLIENT" ? "client" : "worker"
  const handoffHelpText = selectedDocumentIds.length
    ? t(`documents.agent_handoff.ready_help_${roleScope}`)
    : t(`documents.agent_handoff.empty_help_${roleScope}`)

  const loadDocuments = useCallback(async (options = {}) => {
    const nextKind = options.kind ?? kindFilter
    const nextOffset = options.offset ?? documentsOffset
    setDocumentsLoading(true)
    setDocumentsError("")
    try {
      const params = new URLSearchParams({
        limit: String(DOCUMENT_LIST_LIMIT),
        offset: String(nextOffset)
      })
      if (nextKind !== "ALL") params.set("kind", nextKind)
      const response = await fetch(`/api/documents?${params.toString()}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_documents"))
      const nextDocuments = Array.isArray(payload?.documents) ? payload.documents : []
      const nextPagination = normalizePaginationState(payload, DOCUMENT_LIST_LIMIT, nextOffset)
      if (!nextDocuments.length && nextPagination.total > 0 && nextOffset >= nextPagination.total) {
        setDocumentsOffset(nextPagination.previousOffset)
        return
      }
      setDocuments(nextDocuments)
      setDocumentsPagination(nextPagination)
    } catch (error) {
      setDocuments([])
      setDocumentsPagination(createPaginationState(DOCUMENT_LIST_LIMIT))
      setDocumentsError(error?.message || t("documents.errors.load_documents"))
    } finally {
      setDocumentsLoading(false)
    }
  }, [documentsOffset, kindFilter, t])

  const loadArtifacts = useCallback(async (options = {}) => {
    const nextOffset = isArtifactsExpanded ? (options.offset ?? artifactsOffset) : 0
    const nextFilter = options.filter ?? artifactFilter
    const nextSort = options.sort ?? artifactSort
    const nextSearch = options.search ?? trimmedArtifactSearch
    setArtifactsLoading(true)
    setArtifactsError("")
    try {
      const params = new URLSearchParams({
        limit: String(artifactPageSize),
        offset: String(nextOffset),
        sort: nextSort
      })
      if (nextFilter !== "ALL") params.set("status", nextFilter)
      if (nextSearch) params.set("search", nextSearch)
      const response = await fetch(`/api/documents/artifacts?${params.toString()}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_artifacts"))
      const nextArtifacts = Array.isArray(payload?.artifacts) ? payload.artifacts : []
      const nextPagination = normalizePaginationState(payload, artifactPageSize, nextOffset)
      if (!nextArtifacts.length && nextPagination.total > 0 && nextOffset >= nextPagination.total) {
        setArtifactsOffset(nextPagination.previousOffset)
        return
      }
      setArtifacts(nextArtifacts)
      setArtifactsPagination(nextPagination)
      setArtifactCounts({
        all: Number(payload?.counts?.all) || 0,
        draft: Number(payload?.counts?.draft) || 0,
        final: Number(payload?.counts?.final) || 0
      })
    } catch (error) {
      setArtifacts([])
      setArtifactsPagination(createPaginationState(artifactPageSize))
      setArtifactCounts({
        all: 0,
        draft: 0,
        final: 0
      })
      setArtifactsError(error?.message || t("documents.errors.load_artifacts"))
    } finally {
      setArtifactsLoading(false)
    }
  }, [artifactFilter, artifactPageSize, artifactSort, artifactsOffset, isArtifactsExpanded, t, trimmedArtifactSearch])

  useEffect(() => { void loadDocuments() }, [loadDocuments])
  useEffect(() => { void loadArtifacts() }, [loadArtifacts])

  useEffect(() => {
    let cancelled = false

    async function loadFrameworkStatus() {
      if (isClientRole) {
        setFrameworkStatus({
          loading: false,
          acceptance: null
        })
        return
      }

      setFrameworkStatus((current) => ({
        ...current,
        loading: true
      }))

      try {
        const response = await fetch("/api/framework-acceptances/worker", {
          cache: "no-store"
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.message || t("documents.framework_acceptance.load_failed"))
        if (cancelled) return
        setFrameworkStatus({
          loading: false,
          acceptance: payload?.acceptance || null
        })
      } catch {
        if (cancelled) return
        setFrameworkStatus({
          loading: false,
          acceptance: null
        })
      }
    }

    void loadFrameworkStatus()

    return () => {
      cancelled = true
    }
  }, [isClientRole, t])

  useEffect(() => {
    if (!successNotice) return undefined
    const timer = window.setTimeout(() => setSuccessNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [successNotice])

  useEffect(() => {
    const blockedIds = new Set(documents.filter((document) => !document.agentAllowed).map((document) => document.id))
    if (!blockedIds.size) return
    setSelectedDocumentIds((current) => current.filter((id) => !blockedIds.has(id)))
  }, [documents])

  const kindOptions = useMemo(() => DOCUMENT_KIND_VALUES.map((kind) => ({ value: kind, label: kindLabel(kind, t) })), [t])
  const uploadKindOptions = useMemo(() => ["TEMPLATE", "MATERIAL", "OTHER"].map((kind) => ({ value: kind, label: kindLabel(kind, t) })), [t])
  const templateForOptions = useMemo(() => TEMPLATE_FOR_VALUES.map((value) => ({ value, label: templateForLabel(value, t) })), [t])
  const artifactSortOptions = useMemo(() => ([
    { value: "updated_desc", label: t("documents.artifacts.sort_updated_desc") },
    { value: "updated_asc", label: t("documents.artifacts.sort_updated_asc") },
    { value: "approved_desc", label: t("documents.artifacts.sort_approved_desc") },
    { value: "title_asc", label: t("documents.artifacts.sort_title_asc") }
  ]), [t])
  const agentModeHref = useMemo(() => {
    const basePath = localizePath("/dokreziim", locale)
    if (!selectedDocumentIds.length) return basePath
    const params = new URLSearchParams({ documents: selectedDocumentIds.join(",") })
    return `${basePath}?${params.toString()}`
  }, [locale, selectedDocumentIds])
  const filteredArtifacts = artifacts
  const artifactFilteredTotal = artifactsPagination.total
  const artifactHasSearch = normalizeSearchValue(artifactSearch).length > 0
  const showArtifactsToolbar = isArtifactsExpanded && (artifactCounts.all > 0 || artifactHasSearch || artifactFilter !== "ALL")
  const frameworkAcceptance = frameworkStatus.acceptance
  const hasFrameworkAcceptance = frameworkAcceptance?.accepted === true
  const frameworkAcceptedAtLabel = frameworkAcceptance?.acceptedAt
    ? formatDate(frameworkAcceptance.acceptedAt, locale)
    : ""
  const frameworkPageHref = localizePath("/tooalase-kasutuse-raamistik", locale)

  const handleBack = useCallback(() => {
    markChatWorkspaceRestore()
    if (typeof window === "undefined") {
      pushWithTransition(router, localizePath("/vestlus", locale), {
        persistGlassRingTilt: false
      })
      return
    }
    window.requestAnimationFrame(() => {
      pushWithTransition(router, localizePath("/vestlus", locale), {
        persistGlassRingTilt: false
      })
    })
  }, [locale, router])

  useEffect(() => {
    if (!isRoleResolved || !isClientRole) return
    router.replace(localizePath("/dokreziim", locale))
  }, [isClientRole, isRoleResolved, locale, router])

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
      setDocumentsOffset(0)
      await loadDocuments({ offset: 0 })
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
      await loadDocuments()
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
      setSelectedDocumentIds((current) => current.filter((item) => item !== id))
      setSuccessNotice({ message: t("documents.feedback.deleted") })
      await loadDocuments()
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
      await loadArtifacts()
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

  const handleUploadFileSelection = useCallback((file) => {
    setUploadFile(file || null)
    setUploadDragActive(false)
  }, [])

  const handleUploadDragOver = useCallback((event) => {
    event.preventDefault()
    setUploadDragActive(true)
  }, [])

  const handleUploadDragLeave = useCallback((event) => {
    event.preventDefault()
    const relatedTarget = event.relatedTarget
    if (relatedTarget && event.currentTarget.contains?.(relatedTarget)) return
    setUploadDragActive(false)
  }, [])

  const handleUploadDrop = useCallback((event) => {
    event.preventDefault()
    const nextFile = event.dataTransfer?.files?.[0] || null
    handleUploadFileSelection(nextFile)
  }, [handleUploadFileSelection])

  const frameworkInfoPanel = (
    <div className="documents-framework-banner documents-framework-banner--info documents-notice documents-notice--muted !border-0 !shadow-none rounded-[1rem]">
      <div className="documents-framework-banner-copy">
        <h3 className="documents-subsection-title">{t("documents.framework_acceptance.manage_title")}</h3>
        <p className="documents-section-description documents-subsection-description">
          {frameworkStatus.loading
            ? t("documents.loading")
            : hasFrameworkAcceptance
            ? t("documents.framework_acceptance.manage_confirmed_short", {
                date: frameworkAcceptedAtLabel,
                version: frameworkAcceptance.frameworkVersion || WORKER_FRAMEWORK_VERSION
              })
            : t("documents.framework_acceptance.manage_pending")}
        </p>
      </div>
      <div className="documents-framework-banner-actions">
        <Button as="a" href={frameworkPageHref} size="sm" className="documents-primary-button">
          {t("auth.register.worker_framework_open")}
        </Button>
        <Button as="a" href={WORKER_FRAMEWORK_SIGNED_HREF} size="sm" className="documents-primary-button">
          {t("auth.register.worker_framework_download_signed")}
        </Button>
        {hasFrameworkAcceptance && frameworkAcceptance?.documentDownloadUrl ? (
          <Button
            as="a"
            href={frameworkAcceptance.documentDownloadUrl}
            size="sm"
            variant="ghost"
            className="documents-secondary-button"
          >
            {t("documents.framework_acceptance.download_record")}
          </Button>
        ) : null}
      </div>
    </div>
  )

  if (isClientRole) {
    return (
      <section className={`documents-workspace documents-workspace-page documents-workspace-page--library documents-workspace-page--documents fixed inset-0 isolate z-[30] bg-transparent ${glassPrimaryButtonToneClassName}`}>
        <div className={`documents-workspace-shell documents-workspace-shell--documents workspace-scroll-surface ${workspaceGuidePanelClassName}`} />
      </section>
    )
  }

  return (
    <section className={`documents-workspace documents-workspace-page documents-workspace-page--library documents-workspace-page--documents fixed inset-0 isolate z-[30] bg-transparent ${glassPrimaryButtonToneClassName}`}>
      {isAdmin ? (
        <AdminRoleViewCycleButton
          t={t}
          locale={locale}
          value={effectiveRole}
          onRoleChanged={refreshEffectiveRole}
          className="documents-admin-role-menu documents-admin-role-menu--viewport"
          ariaLabel={t("chat.workspace.view_role.label", "TĆ¶Ć¶laua vaade")}
        />
      ) : null}
      <div className={`documents-workspace-shell documents-workspace-shell--documents workspace-scroll-surface ${workspaceGuidePanelClassName} ${isArtifactsExpanded ? "documents-workspace-shell--artifacts" : ""}`}>
        <div className={`documents-grid documents-page-shell--content ${workspaceGuidePanelScrollClassName}`}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("buttons.back")}
            anchorBack={false}
            backClassName="workspace-scroll-back-button documents-scroll-back-button"
            rightSlot={
              <DashboardInfoTrigger
                infoId="documents"
                title={t("documents.page_title")}
                className={dashboardInfoTriggerCornerClassName}
                detailExtras={{ 3: frameworkInfoPanel }}
              />
            }
          >
            {t("documents.page_title")}
          </GlassSubpageHeader>
          <section className="documents-panel documents-panel--primary documents-page-shell !border-0 !shadow-none rounded-[1.3rem]">
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

            <div className="documents-section-stack documents-mobile-panel-stack mt-0 md:mt-[1.75rem]">
              <div className="documents-library-section documents-library-intro documents-mobile-panel-stack">
                <div className="documents-section-body documents-mobile-panel-stack mt-0 md:mt-[0.55rem]">
                <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-subsection-stack documents-library-panel documents-library-panel--upload documents-surface-panel !border-0 !shadow-none rounded-[1rem]">
                  <div className="documents-subsection-copy">
                    <h3 className="documents-subsection-title">{t("documents.library_sections.upload_title")}</h3>
                    <p className="documents-section-description documents-subsection-description">{t("documents.library_sections.upload_description")}</p>
                  </div>
                <form className="documents-upload-form documents-library-upload-block documents-upload-surface" onSubmit={submitUpload}>
                  <div className="documents-upload-grid">
                    <label className="documents-upload-control">
                      <span className="documents-meta-text documents-upload-label">{t("documents.form.title_label", "Pealkiri")}</span>
                      <Input
                        value={uploadTitle}
                        onChange={(event) => setUploadTitle(event.target.value)}
                        placeholder={t("documents.form.title_placeholder")}
                        className="documents-form-input"
                      />
                    </label>
                    <label className="documents-upload-control documents-upload-control--kind">
                      <span className="documents-meta-text documents-upload-label">{t("documents.form.kind_label")}</span>
                      <DocumentsDropdown
                        ariaLabel={t("documents.form.kind_label")}
                        value={uploadKind}
                        onChange={(nextValue) => {
                          setUploadKind(nextValue)
                          if (nextValue !== "TEMPLATE") setUploadTemplateFor("")
                        }}
                        options={uploadKindOptions}
                        className="documents-dropdown--kind"
                        align="end"
                      />
                    </label>
                  </div>

                  {uploadKind === "TEMPLATE" ? (
                    <label className="documents-upload-control">
                      <span className="documents-meta-text documents-upload-label">{t("documents.form.template_for_placeholder")}</span>
                      <DocumentsDropdown
                        ariaLabel={t("documents.form.template_for_placeholder")}
                        value={uploadTemplateFor}
                        onChange={setUploadTemplateFor}
                        options={templateForOptions}
                        placeholder={t("documents.form.template_for_placeholder")}
                        align="end"
                      />
                    </label>
                  ) : null}

                  <div
                    className={`documents-upload-dropzone ${
                      uploadDragActive
                        ? "is-active"
                        : ""
                    }`}
                    onDragOver={handleUploadDragOver}
                    onDragEnter={handleUploadDragOver}
                    onDragLeave={handleUploadDragLeave}
                    onDrop={handleUploadDrop}
                  >
                    <input
                      ref={uploadInputRef}
                      className="sr-only"
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(event) => handleUploadFileSelection(event.target.files?.[0] || null)}
                    />
                    <button
                      type="button"
                      className="documents-upload-dropzone-trigger"
                      onClick={() => uploadInputRef.current?.click()}
                    >
                      <div className="documents-strong-text documents-upload-dropzone-title">
                        {uploadDragActive ? t("documents.form.dropzone_active") : t("documents.form.dropzone_idle")}
                      </div>
                      <p className="documents-meta-text documents-upload-dropzone-help">{t("documents.form.file_help")}</p>
                    </button>
                    <div className="documents-upload-selected documents-notice documents-notice--muted rounded-[0.9rem]">
                      {uploadFile ? `${uploadFile.name} Ā· ${formatFileSize(uploadFile.size)}` : t("documents.form.no_file_selected")}
                    </div>
                    <div className="documents-upload-inline-actions">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="documents-secondary-button documents-upload-choose-button"
                        onClick={() => uploadInputRef.current?.click()}
                      >
                        {t("documents.form.choose_file")}
                      </Button>
                    </div>
                  </div>

                  <div className="documents-upload-submit-row">
                    <Button
                      type="submit"
                      size="sm"
                      className="documents-primary-button documents-upload-submit min-w-[11.5rem]"
                      disabled={!uploadFile || uploading}
                    >
                      {uploading ? t("documents.form.uploading") : t("documents.actions.upload")}
                    </Button>
                  </div>
                </form>
                </Panel>

                <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-subsection-stack documents-library-panel documents-library-panel--list documents-surface-panel !border-0 !shadow-none rounded-[1rem]">
                  <div className="documents-subsection-copy">
                    <h3 className="documents-subsection-title">{t("documents.library_sections.list_title")}</h3>
                    <p className="documents-section-description documents-subsection-description">{t("documents.library_sections.list_description")}</p>
                  </div>
                <div className="documents-library-list-header">
                  <div className="documents-filter-row documents-library-filters">
                    {["ALL", ...DOCUMENT_KIND_VALUES].map((kind) => (
                      <OptionCard
                        key={kind}
                        type="radio"
                        name="documents-kind-filter"
                        value={kind}
                        checked={kindFilter === kind}
                        onChange={(event) => {
                          setKindFilter(event.target.value)
                          setDocumentsOffset(0)
                        }}
                        className={documentsChoiceCardClassName}
                        fitTextLines={1}
                      >
                        <span className="text-center [text-wrap:balance]">
                          {kind === "ALL" ? t("documents.filters.all") : kindLabel(kind, t)}
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                </div>
                <div className="documents-library-list flex flex-col gap-[0.72rem]">
              {documentsLoading ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.loading")}</div> : null}
              {!documentsLoading && documents.length === 0 ? <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">{t("documents.empty_documents")}</div> : null}
              {documents.map((document) => {
                const isReadOnly = Boolean(document.readOnly)
                const frameworkAcceptance = document.frameworkAcceptance || null
                return <article key={document.id} className="documents-card documents-document-row rounded-[1rem] border px-[0.85rem] py-[0.8rem]">
                  <div className="documents-document-row-top">
                    <div className="documents-document-row-main">
                      <div className="min-w-0 flex-1">
                        {editingId === document.id && !isReadOnly ? (
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
                              {isReadOnly ? <span className="documents-chip is-active rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{t("documents.framework_acceptance.system_chip", "Acceptance")}</span> : null}
                              {document.templateFor ? <span className="documents-chip is-active rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">{templateForLabel(document.templateFor, t)}</span> : null}
                            </div>
                            <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{document.originalName} Ā· {formatFileSize(document.size)} Ā· {formatDate(document.updatedAt, locale)}</p>
                            {frameworkAcceptance ? <p className="documents-meta-text mt-[0.25rem] text-[0.84rem]">{t("documents.framework_acceptance.accepted_at", "Accepted")}: {formatDate(frameworkAcceptance.acceptedAt, locale)} Ā· {t("documents.framework_acceptance.framework_version", "Version")}: {frameworkAcceptance.frameworkVersion} Ā· {t("documents.framework_acceptance.status_confirmed", "Confirmed")}</p> : null}
                            {document.callRecording ? <p className="documents-meta-text mt-[0.25rem] text-[0.84rem]">{t("documents.call_recording.purpose", "Salvestamise eesmärk")}: {document.callRecording.purposeText || document.callRecording.purpose || "-"} Ā· {t("documents.call_recording.consent_status", "Nõusoleku staatus")}: {document.callRecording.consentStatus || "-"}{document.callRecording.retentionUntil ? ` Ā· ${t("documents.call_recording.retention_until", "Säilitustähtaeg")}: ${formatDate(document.callRecording.retentionUntil, locale)}` : ""}</p> : null}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="documents-document-row-side">
                      {!isReadOnly ? <label className="documents-inline-check documents-inline-check--allow">
                        <input type="checkbox" className="documents-checkbox" checked={document.agentAllowed} onChange={(event) => { void patchDocument(document.id, { agentAllowed: event.target.checked }) }} />
                        <span>{t("documents.actions.agent_allowed")}</span>
                      </label> : <p className="documents-meta-text documents-row-help documents-row-help--inline">{t("documents.framework_acceptance.read_only_note", "This record was created by the system and cannot be changed or deleted.")}</p>}
                    </div>
                  </div>
                  <div className="documents-document-row-selection">
                    {!isReadOnly && document.agentAllowed ? (
                      <label className="documents-select-card">
                        <input type="checkbox" className="documents-checkbox" checked={selectedDocumentIds.includes(document.id)} onChange={(event) => toggleDocumentSelection(document.id, event.target.checked)} aria-label={t("documents.actions.select_document", { title: document.title })} />
                        <span className="documents-select-card-copy">
                          <span className="documents-strong-text">{t("documents.actions.select_for_agent")}</span>
                        </span>
                      </label>
                    ) : (
                      <p className="documents-meta-text documents-row-help documents-row-help--inline">{isReadOnly ? t("documents.framework_acceptance.read_only_note", "This record was created by the system and cannot be changed or deleted.") : t("documents.multi_doc.enable_agent_allowed")}</p>
                    )}
                  </div>
                  <div className="documents-document-row-bottom">
                    {!isReadOnly ? <div className="documents-controls-grid documents-controls-grid--row">
                      <DocumentsDropdown ariaLabel={t("documents.form.kind_label")} value={document.kind} onChange={(nextKind) => { void patchDocument(document.id, { kind: nextKind, templateFor: nextKind === "TEMPLATE" ? document.templateFor : null }) }} options={kindOptions} />
                      {document.kind === "TEMPLATE" ? <DocumentsDropdown ariaLabel={t("documents.form.template_for_placeholder")} value={document.templateFor || ""} onChange={(nextValue) => { void patchDocument(document.id, { templateFor: nextValue || null }) }} options={templateForOptions} placeholder={t("documents.form.template_for_placeholder")} align="end" /> : <div className="documents-row-spacer" aria-hidden="true" />}
                    </div> : <div className="documents-row-spacer" aria-hidden="true" />}
                    <div className="documents-row-actions">
                      <Button as="a" href={`/api/documents/${encodeURIComponent(document.id)}/download`} size="sm" variant="ghost" className="documents-secondary-button">{t("documents.actions.download")}</Button>
                      {!isReadOnly ? <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => { setEditingId(document.id); setEditingTitle(document.title || "") }}>{t("documents.actions.rename")}</Button> : null}
                      {!isReadOnly ? <Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteDocument(document.id)}>{t("documents.actions.delete")}</Button> : null}
                    </div>
                  </div>
                </article>
              })}
                </div>
                <PaginationControls
                  itemCount={documents.length}
                  pagination={documentsPagination}
                  t={t}
                  onPrevious={() => setDocumentsOffset(documentsPagination.previousOffset)}
                  onNext={() => setDocumentsOffset(documentsPagination.nextOffset)}
                />
                </Panel>

                </div>
              </div>
            </div>
          </section>

          <Panel as="section" variant="secondary" padding="sm" className="documents-panel documents-shell-surface documents-surface-panel !border-0 !shadow-none rounded-[1.3rem]">
            <div className="documents-section-stack">
            <div className="documents-section-body">
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
            </div>
            </div>
          </Panel>

          <Panel as="section" id="artifacts" variant="secondary" padding="sm" className="documents-panel documents-shell-surface documents-surface-panel !border-0 !shadow-none rounded-[1.3rem]">
            <div className="documents-section-stack">
            <div className="documents-section-body">
            <div className="documents-subsection-copy">
              <h3 className="documents-subsection-title">{t("documents.outputs_title")}</h3>
              <p className="documents-section-description documents-subsection-description">{t("documents.outputs_description")}</p>
            </div>
            <div className="documents-artifact-filter-row mt-0 flex flex-wrap items-center justify-between gap-[0.8rem] md:mt-[0.42rem]">
              <div className="flex flex-wrap gap-[0.4rem]">
                {[{ key: "ALL", label: t("documents.filters.all"), count: artifactCounts.all }, { key: "DRAFT", label: artifactStatusLabel("draft", t), count: artifactCounts.draft }, { key: "FINAL", label: artifactStatusLabel("final", t), count: artifactCounts.final }].map((item) => (
                  <OptionCard
                    key={item.key}
                    type="radio"
                    name="documents-artifact-filter"
                    value={item.key}
                    checked={artifactFilter === item.key}
                    onChange={(event) => {
                      setArtifactFilter(event.target.value)
                      setArtifactsOffset(0)
                    }}
                    className={documentsChoiceCardClassName}
                    fitTextLines={1}
                  >
                    <span className="text-center [text-wrap:balance]">
                      <ChipLabel label={item.label} count={item.count} />
                    </span>
                  </OptionCard>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-[0.8rem] justify-end">
                <Link href={localizePath(isArtifactsExpanded ? "/documents#artifacts" : "/documents?artifacts=all#artifacts", locale)} className={documentsPanelLinkClassName}>{isArtifactsExpanded ? t("documents.actions.show_latest") : t("documents.actions.open_all_results")}</Link>
                <span className="documents-meta-text documents-results-summary text-[0.95rem]">{t("documents.artifacts.results_count", { shown: filteredArtifacts.length, total: artifactFilteredTotal })}</span>
              </div>
            </div>
            {showArtifactsToolbar ? (
              <div className="mt-[0.85rem] grid gap-[0.7rem] rounded-[1rem] border px-[0.95rem] py-[0.9rem]">
                <p className="documents-meta-text text-[0.9rem]">
                  {artifactFilter === "FINAL" ? t("documents.artifacts.final_search_hint") : t("documents.artifacts.search_help")}
                </p>
                <div className="grid gap-[0.7rem] md:grid-cols-[minmax(0,1fr)_19rem_auto] md:items-end">
                  <label className="grid gap-[0.35rem]">
                    <span className="documents-meta-text text-[0.88rem]">{t("documents.actions.search")}</span>
                    <Input
                      value={artifactSearch}
                      onChange={(event) => {
                        setArtifactSearch(event.target.value)
                        setArtifactsOffset(0)
                      }}
                      placeholder={t("documents.artifacts.search_placeholder")}
                      className="documents-form-input w-full"
                    />
                  </label>
                  <label className="grid gap-[0.35rem]">
                    <span className="documents-meta-text text-[0.88rem]">{t("documents.artifacts.sort_label")}</span>
                    <DocumentsDropdown
                      ariaLabel={t("documents.artifacts.sort_label")}
                      value={artifactSort}
                      onChange={(nextValue) => {
                        setArtifactSort(nextValue)
                        setArtifactsOffset(0)
                      }}
                      options={artifactSortOptions}
                      align="end"
                    />
                  </label>
                  {artifactHasSearch ? (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="documents-secondary-button"
                        onClick={() => {
                          setArtifactSearch("")
                          setArtifactsOffset(0)
                        }}
                      >
                        {t("documents.actions.clear_search", "Puhasta otsing")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
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
                  <p className="documents-meta-text mt-[0.25rem] text-[0.9rem]">{formatDate(artifact.createdAt, locale)} Ā· {t("documents.updated_at")} {formatDate(artifact.updatedAt, locale)}{artifact.approvedAt ? ` Ā· ${t("documents.approved_at")} ${formatDate(artifact.approvedAt, locale)}` : ""}</p>
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
            {isArtifactsExpanded ? (
              <PaginationControls
                itemCount={filteredArtifacts.length}
                pagination={artifactsPagination}
                t={t}
                onPrevious={() => setArtifactsOffset(artifactsPagination.previousOffset)}
                onNext={() => setArtifactsOffset(artifactsPagination.nextOffset)}
              />
            ) : null}
            </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
