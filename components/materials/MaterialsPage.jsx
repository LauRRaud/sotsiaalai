"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { useI18n } from "@/components/i18n/I18nProvider"
import BorderGlow from "@/components/ui/BorderGlow"
import Button from "@/components/ui/Button"
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader"
import GlowField, { fieldEdgeGlowStyle } from "@/components/ui/GlowField"
import Textarea from "@/components/ui/Textarea"
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageMobileReadableWidthClassName,
  glassSubpageContentWideClassName,
  glassSubpagePanelWideClassName,
  glassSubpageCardClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles"
import { localizePath } from "@/lib/localizePath"
import { pushWithTransition } from "@/lib/routeTransition"
import { markWorkspacePanelMorph, WORKSPACE_PANEL_MORPH_DELAY_MS } from "@/lib/workspacePanelMorph"

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

const materialsPrimaryButtonClassName =
  "materials-surface-button whitespace-normal text-center leading-[1.2] !px-[1.6rem] !py-[1.05rem] !text-[1.18rem] " +
  "!min-h-[3.2rem] max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]"
const materialsSecondaryButtonClassName =
  "materials-surface-button whitespace-normal text-center leading-[1.2] !px-[1.2rem] !py-[0.72rem] !text-[1rem] !min-h-[2.7rem] " +
  "max-[768px]:!min-h-[3rem] max-[768px]:!px-[1.35rem] max-[768px]:!text-[1.08rem]"
const materialsSectionClassName =
  "grid gap-[0.82rem] rounded-[1.18rem] px-[0.45rem] py-[0.75rem] " +
  "max-[768px]:gap-[0.72rem] max-[768px]:rounded-[1.08rem] max-[768px]:px-[0.12rem] max-[768px]:py-[0.7rem]"
const materialsMobilePanelWidthClassName =
  "max-[768px]:mx-auto max-[768px]:w-full max-[768px]:max-w-[21.6rem]"
const materialsMobileInnerWidthClassName =
  "max-[768px]:mx-auto max-[768px]:w-full max-[768px]:max-w-[20rem]"
const materialsAdminInnerWidthClassName = materialsMobileInnerWidthClassName
const materialsDesktopReadableWidthClassName = "mx-auto w-full max-w-[min(48rem,100%)]"
const materialsUploadSectionClassName =
  "materials-upload-panel grid gap-[0.82rem] rounded-[1.18rem] px-[0.45rem] py-[0.75rem] " +
  `${materialsMobilePanelWidthClassName} ` +
  "max-[768px]:gap-[0.72rem] max-[768px]:rounded-[1.08rem] max-[768px]:px-[0.12rem] max-[768px]:py-[0.7rem]"
const materialsTextareaClassName =
  `materials-comment-box min-h-[7.4rem] resize-y overflow-y-auto rounded-[1.05rem] ${glassSubpageCardClassName} ` +
  "px-[0.78rem] py-[0.82rem] text-[1.05rem] leading-[1.36] text-[color:var(--subpage-card-text,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2)))] " +
  `placeholder:text-[color:rgba(73,84,101,0.72)] placeholder:opacity-100 ${materialsMobileInnerWidthClassName} ` +
  "focus-visible:[background:var(--subpage-card-bg)] focus-visible:border-[color:var(--subpage-card-border)] focus-visible:shadow-[var(--subpage-card-shadow)]"
const materialsSectionTitleClassName =
  "text-[1.22rem] font-[650] leading-[1.18] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]"
const materialsSectionCopyClassName =
  "text-[0.98rem] leading-[1.52] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]"
const materialsStatusBadgeClassName =
  "inline-flex items-center rounded-full border border-[rgba(148,163,184,0.24)] bg-[rgba(255,255,255,0.08)] px-[0.62rem] py-[0.22rem] text-[0.78rem] font-[620] uppercase tracking-[0.04em]"
const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "materials-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-0 [grid-template-columns:minmax(0,1fr)] max-[768px]:[--mobile-glass-card-gap:clamp(0.32rem,1.35vw,0.4rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0"
const surfaceClassName =
  `materials-page-content mobile-keep-desktop-glass-cards relative z-[21] mx-auto mt-[clamp(0.5rem,2vh,1.25rem)] mb-[clamp(0.5rem,2vh,1.25rem)] flex w-full shrink-0 flex-col max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[var(--glass-modal-radius)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] shadow-[var(--glass-shell-shadow,none)] ` +
  `backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[0.95rem] pt-[0.35rem] pb-[1.1rem] ` +
  `[--glass-modal-bg:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] [--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `${workspaceGuidePanelClassName} max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:!max-w-none max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.95rem] ${glassPageMobileCardClassName}`
const pageBackTiltClassName =
  "pointer-events-none motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]"

function formatFileSize(size) {
  const value = Number(size || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value, locale) {
  const dateLocale =
    locale === "ru"
      ? "ru-RU"
      : locale === "en"
        ? "en-GB"
        : "et-EE"

  try {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value))
  } catch {
    return ""
  }
}

function materialStatusLabel(t, status) {
  const normalized = String(status || "pending").toLowerCase()
  return t(`materials_page.admin.status.${normalized}`, normalized)
}

function MaterialsGlowPanel({ as = "section", className = "", children }) {
  return (
    <BorderGlow
      as={as}
      className={`materials-glow-card ${className}`.trim()}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--subpage-card-bg, #120F17)"
      borderRadius={18}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      {children}
    </BorderGlow>
  )
}

export default function MaterialsPage({ isAdmin = false, locale = "et" }) {
  const router = useRouter()
  const { t, locale: activeLocale } = useI18n()
  const resolvedLocale = activeLocale || locale

  const fileInputRef = useRef(null)
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(isAdmin)
  const [adminError, setAdminError] = useState("")
  const [reviewingId, setReviewingId] = useState("")
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(""), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!isAdmin) return undefined

    let cancelled = false

    async function loadItems() {
      setLoadingItems(true)
      setAdminError("")
      try {
        const response = await fetch("/api/materials?limit=100", { cache: "no-store" })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.message || t("materials_page.errors.load_failed"))
        }
        if (!cancelled) setItems(Array.isArray(payload?.submissions) ? payload.submissions : [])
      } catch (loadError) {
        if (!cancelled) {
          setItems([])
          setAdminError(loadError?.message || t("materials_page.errors.load_failed"))
        }
      } finally {
        if (!cancelled) setLoadingItems(false)
      }
    }

    void loadItems()

    return () => {
      cancelled = true
    }
  }, [isAdmin, t])

  async function refreshItems() {
    if (!isAdmin) return
    setLoadingItems(true)
    setAdminError("")
    try {
      const response = await fetch("/api/materials?limit=100", { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || t("materials_page.errors.load_failed"))
      }
      setItems(Array.isArray(payload?.submissions) ? payload.submissions : [])
    } catch (loadError) {
      setItems([])
      setAdminError(loadError?.message || t("materials_page.errors.load_failed"))
    } finally {
      setLoadingItems(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!files.length || submitting) return

    setSubmitting(true)
    setError("")
    setNotice("")

    try {
      const formData = new FormData()
      for (const selectedFile of files) {
        formData.append("file", selectedFile)
      }
      formData.append("comment", comment)

      const response = await fetch("/api/materials", {
        method: "POST",
        body: formData
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || t("materials_page.errors.upload_failed"))
      }

      setComment("")
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ""
      setNotice(t("materials_page.submit_success"))
      if (isAdmin) await refreshItems()
    } catch (submitError) {
      setError(submitError?.message || t("materials_page.errors.upload_failed"))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("materials_page.admin.delete_confirm"))) return

    setAdminError("")
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(id)}`, {
        method: "DELETE"
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || t("materials_page.errors.delete_failed"))
      }
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (deleteError) {
      setAdminError(deleteError?.message || t("materials_page.errors.delete_failed"))
    }
  }

  async function handleReview(id, action) {
    if (reviewingId) return
    const reviewNote = window.prompt(t("materials_page.admin.review_note_prompt", "Märkus ülevaatuse kohta (valikuline):"), "")
    if (reviewNote === null) return

    setReviewingId(id)
    setAdminError("")
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, reviewNote })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || t("materials_page.errors.review_failed", "Materjali ülevaatuse salvestamine ebaõnnestus."))
      }
      const updated = payload?.submission
      if (updated?.id) {
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      }
    } catch (reviewError) {
      setAdminError(reviewError?.message || t("materials_page.errors.review_failed", "Materjali ülevaatuse salvestamine ebaõnnestus."))
    } finally {
      setReviewingId("")
    }
  }

  const handleBack = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    markChatWorkspaceRestore()
    markWorkspacePanelMorph("collapse", "/vestlus")
    if (typeof window === "undefined") {
      pushWithTransition(router, localizePath("/vestlus", resolvedLocale), {
        persistGlassRingTilt: false,
        delayMs: WORKSPACE_PANEL_MORPH_DELAY_MS,
        workspacePanelMorph: "collapse"
      })
      return
    }
    window.requestAnimationFrame(() => {
      pushWithTransition(router, localizePath("/vestlus", resolvedLocale), {
        persistGlassRingTilt: false,
        delayMs: WORKSPACE_PANEL_MORPH_DELAY_MS,
        workspacePanelMorph: "collapse"
      })
    })
  }, [isClosing, resolvedLocale, router])

  return (
    <div className={shellClassName}>
      <div className={`${surfaceClassName} ${isClosing ? `${pageBackTiltClassName} workspace-guide-panel--collapse` : ""}`}>
        <div className={`materials-page-body relative ${workspaceGuidePanelScrollClassName} ${glassSubpageContentWideClassName} ${glassSubpageMobileReadableWidthClassName} grid content-start gap-[0.66rem] px-[0.05rem] pt-[0.26rem] pb-[0.25rem] max-[768px]:gap-[0.58rem] max-[768px]:px-[0.05rem]`}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("profile.back_to_chat")}
            holdPressedVisualDisabled
          >
            {t("materials_page.title")}
          </GlassSubpageHeader>

          <section className={materialsUploadSectionClassName}>
            <div className={`grid gap-[0.12rem] pb-[0.12rem] text-left ${materialsDesktopReadableWidthClassName} ${materialsMobileInnerWidthClassName}`}>
              <p className="text-[1.08rem] leading-[1.58] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.14rem]">
                {t("materials_page.description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className={`mt-[-0.36rem] grid gap-[0.54rem] ${materialsDesktopReadableWidthClassName} ${materialsMobileInnerWidthClassName}`}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`materials-upload-choose-button !mx-auto !mt-[-0.6rem] !mb-[0.34rem] !inline-flex !w-fit !min-w-0 !max-w-none shrink-0 self-center max-[768px]:!mt-[-0.42rem] max-[768px]:!mb-[0.42rem] -translate-y-[0.28rem] max-[768px]:-translate-y-[0.2rem] ${materialsPrimaryButtonClassName}`}
              >
                {files.length === 1 ? (
                  <span className="block max-w-full truncate text-[0.94rem] leading-none">{files[0].name}</span>
                ) : files.length > 1 ? (
                  <span className="block leading-none">{t("materials_page.files_selected", { count: files.length })}</span>
                ) : (
                  <span className="block leading-none">{t("materials_page.choose_file")}</span>
                )}
              </Button>

              {files.length > 1 ? (
                <p className={`text-center text-[0.9rem] leading-[1.45] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82] ${materialsDesktopReadableWidthClassName}`}>
                  {files.map((selectedFile) => selectedFile.name).join(", ")}
                </p>
              ) : null}

              <GlowField className={`materials-comment-glow-field ${materialsMobileInnerWidthClassName}`} borderRadius={17}>
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  placeholder={t("materials_page.comment_placeholder_multiple")}
                  className={`${materialsTextareaClassName} ui-glow-control`}
                />
              </GlowField>

              {error ? (
                <p className={`rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(255,223,218,0.96)] ${materialsDesktopReadableWidthClassName}`}>
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className={`rounded-[1rem] border border-[rgba(88,148,118,0.22)] bg-[rgba(18,44,34,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(223,246,236,0.96)] ${materialsDesktopReadableWidthClassName}`}>
                  {notice}
                </p>
              ) : null}

              <div className={`mt-[1.05rem] flex w-full justify-center pt-[0.12rem] pb-[0.08rem] max-[768px]:mt-[1.2rem] max-[768px]:pt-[0.16rem] max-[768px]:pb-[0.1rem] ${materialsDesktopReadableWidthClassName}`}>
                <Button
                  type="submit"
                  disabled={!files.length || submitting}
                  className={`materials-upload-submit-button !mx-auto !min-w-[10.2rem] ${materialsPrimaryButtonClassName}`}
                >
                  {submitting ? t("materials_page.submitting") : t("materials_page.submit")}
                </Button>
              </div>
            </form>
          </section>

          {isAdmin ? (
            <MaterialsGlowPanel
              className={`materials-admin-panel ${glassSubpagePanelWideClassName} ${materialsSectionClassName} ${materialsMobilePanelWidthClassName}`}
            >
              <div className={`flex items-start justify-between gap-[0.8rem] max-[768px]:grid max-[768px]:gap-[0.72rem] ${materialsDesktopReadableWidthClassName} ${materialsAdminInnerWidthClassName}`}>
                <div className="grid gap-[0.22rem]">
                  <h2 className={materialsSectionTitleClassName}>{t("materials_page.admin.title")}</h2>
                  <p className={materialsSectionCopyClassName}>{t("materials_page.admin.subtitle")}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => void refreshItems()}
                  disabled={loadingItems}
                  className={`${materialsSecondaryButtonClassName} max-[768px]:justify-self-start`}
                >
                  {t("materials_page.admin.refresh")}
                </Button>
              </div>

              {adminError ? (
                <p className={`rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(255,223,218,0.96)] ${materialsDesktopReadableWidthClassName}`}>
                  {adminError}
                </p>
              ) : null}

              {loadingItems ? (
                <p className="text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]">{t("materials_page.admin.loading")}</p>
              ) : items.length ? (
                <div className={`grid gap-[0.72rem] ${materialsDesktopReadableWidthClassName} ${materialsAdminInnerWidthClassName}`}>
                  {items.map((item) => (
                    <MaterialsGlowPanel
                      as="div"
                      key={item.id}
                      className={`materials-admin-row grid gap-[0.62rem] rounded-[0.95rem] px-[0.62rem] py-[0.72rem] ${glassSubpageCardClassName}`}
                    >
                      <div className="flex flex-wrap items-center gap-[0.45rem] text-[0.86rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.76]">
                        <span>{formatDate(item.createdAt, resolvedLocale)}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.size)}</span>
                        {item.submittedByUser?.email ? (
                          <>
                            <span>•</span>
                            <span>{item.submittedByUser.email}</span>
                          </>
                        ) : null}
                        <span className={materialsStatusBadgeClassName}>{materialStatusLabel(t, item.status)}</span>
                      </div>
                      <div className="grid gap-[0.36rem]">
                        <h3 className="text-[1rem] font-[620] leading-[1.3] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">{item.originalName}</h3>
                        <p className="whitespace-pre-wrap text-[0.95rem] leading-[1.55] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.9]">
                          {item.comment || t("materials_page.admin.comment_missing")}
                        </p>
                        {item.reviewedAt || item.reviewNote ? (
                          <p className="text-[0.84rem] leading-[1.45] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.72]">
                            {item.reviewedAt ? `${formatDate(item.reviewedAt, resolvedLocale)}${item.reviewedBy ? ` · ${item.reviewedBy}` : ""}` : null}
                            {item.reviewNote ? `${item.reviewedAt ? " · " : ""}${item.reviewNote}` : null}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-[0.5rem]">
                        <Button
                          as="a"
                          href={`/api/materials/${encodeURIComponent(item.id)}/download`}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.download")}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={reviewingId === item.id || item.status === "reviewed"}
                          onClick={() => void handleReview(item.id, "mark_reviewed")}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.mark_reviewed", "Märgi üle vaadatuks")}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={reviewingId === item.id || item.status === "imported"}
                          onClick={() => void handleReview(item.id, "mark_imported")}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.mark_imported", "Märgi impordituks")}
                        </Button>
                        <Button
                          variant="danger"
                          disabled={reviewingId === item.id || item.status === "rejected"}
                          onClick={() => void handleReview(item.id, "reject")}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.reject", "Lükka tagasi")}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => void handleDelete(item.id)}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.delete")}
                        </Button>
                      </div>
                    </MaterialsGlowPanel>
                  ))}
                </div>
              ) : (
                <p className={`text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82] ${materialsDesktopReadableWidthClassName} ${materialsAdminInnerWidthClassName}`}>{t("materials_page.admin.empty")}</p>
              )}
            </MaterialsGlowPanel>
          ) : null}
        </div>
      </div>
    </div>
  )
}
