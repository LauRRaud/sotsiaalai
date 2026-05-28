"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { useI18n } from "@/components/i18n/I18nProvider"
import Button from "@/components/ui/Button"
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay"
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader"
import GlowField from "@/components/ui/GlowField"
import Textarea from "@/components/ui/Textarea"
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageContentWideClassName,
  glassSubpageCardClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles"
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

const materialsPrimaryButtonClassName =
  "materials-surface-button whitespace-normal text-center leading-[1.2] !px-[1.6rem] !py-[1.05rem] !text-[1.18rem] " +
  "!min-h-[3.2rem] max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]"
const materialsMobilePanelWidthClassName =
  "max-[768px]:mx-auto max-[768px]:w-full max-[768px]:max-w-[21.6rem]"
const materialsMobileInnerWidthClassName =
  "max-[768px]:mx-auto max-[768px]:w-full max-[768px]:max-w-[20rem]"
const materialsDesktopReadableWidthClassName = "mx-auto w-full max-w-[min(48rem,100%)]"
const materialsUploadSectionClassName =
  "materials-upload-panel grid gap-[0.82rem] rounded-[1.18rem] px-[0.45rem] py-[0.75rem] " +
  `${materialsMobilePanelWidthClassName} ` +
  "max-[768px]:gap-[0.72rem] max-[768px]:rounded-[1.08rem] max-[768px]:px-[0.12rem] max-[768px]:py-[0.7rem]"
const materialsTextareaClassName =
  `materials-comment-box min-h-[12rem] resize-y overflow-y-auto rounded-[1.05rem] ${glassSubpageCardClassName} ` +
  "px-[0.78rem] py-[0.82rem] text-[1.05rem] leading-[1.36] text-[color:var(--subpage-card-text,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2)))] " +
  `placeholder:text-[color:rgba(73,84,101,0.72)] placeholder:opacity-100 ${materialsMobileInnerWidthClassName} ` +
  "focus-visible:[background:var(--subpage-card-bg)] focus-visible:border-[color:var(--subpage-card-border)] focus-visible:shadow-[var(--subpage-card-shadow)]"
const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "materials-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-0 [grid-template-columns:minmax(0,1fr)] max-[768px]:[--mobile-glass-card-gap:clamp(0.32rem,1.35vw,0.4rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0"
const surfaceClassName =
  `materials-page-content workspace-scroll-surface mobile-keep-desktop-glass-cards relative z-[21] mx-auto mt-[clamp(0.5rem,2vh,1.25rem)] mb-[clamp(0.5rem,2vh,1.25rem)] flex w-full shrink-0 flex-col max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[var(--glass-modal-radius)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] shadow-[var(--glass-shell-shadow,none)] ` +
  `backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[0.95rem] pt-[0.35rem] pb-[1.1rem] ` +
  `[--glass-modal-bg:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] [--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `${workspaceGuidePanelClassName} max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:!max-w-none max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.95rem] ${glassPageMobileCardClassName}`
export default function MaterialsPage({ locale = "et", embedded = false, onBack = null, hideHeader = false }) {
  const router = useRouter()
  const { t, locale: activeLocale } = useI18n()
  const resolvedLocale = activeLocale || locale

  const fileInputRef = useRef(null)
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(""), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

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
    } catch (submitError) {
      setError(submitError?.message || t("materials_page.errors.upload_failed"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = useCallback(() => {
    if (typeof onBack === "function") {
      onBack()
      return
    }
    markChatWorkspaceRestore()
    if (typeof window === "undefined") {
      pushWithTransition(router, localizePath("/vestlus", resolvedLocale), {
        persistGlassRingTilt: false
      })
      return
    }
    window.requestAnimationFrame(() => {
      pushWithTransition(router, localizePath("/vestlus", resolvedLocale), {
        persistGlassRingTilt: false
      })
    })
  }, [onBack, resolvedLocale, router])

  const content = (
    <div className={`materials-page-body relative ${workspaceGuidePanelScrollClassName} ${glassSubpageContentWideClassName} grid content-start gap-[0.66rem] px-[0.05rem] pt-[0.26rem] pb-[0.25rem] max-[768px]:gap-[0.58rem] max-[768px]:px-[0.05rem]`}>
          {!hideHeader ? (
            <GlassSubpageHeader
              onBack={handleBack}
              backAriaLabel={t("profile.back_to_chat")}
              holdPressedVisualDisabled
              anchorBack={false}
              backClassName="workspace-scroll-back-button"
              rightSlot={
                <DashboardInfoTrigger
                  infoId="materials"
                  title={t("materials_page.title")}
                  className={dashboardInfoTriggerCornerClassName}
                />
              }
            >
              {t("materials_page.title")}
            </GlassSubpageHeader>
          ) : null}

          <section className={materialsUploadSectionClassName}>
            <form onSubmit={handleSubmit} className={`mt-[0.42rem] grid gap-[0.68rem] ${materialsDesktopReadableWidthClassName} ${materialsMobileInnerWidthClassName}`}>
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
                className={`materials-upload-choose-button !mx-auto !mt-[0.1rem] !mb-[0.62rem] !inline-flex !w-fit !min-w-0 !max-w-none shrink-0 self-center max-[768px]:!mt-[0.12rem] max-[768px]:!mb-[0.58rem] ${materialsPrimaryButtonClassName}`}
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
    </div>
  )

  if (embedded) return content

  return (
    <div className={shellClassName}>
      <div className={surfaceClassName}>
        {content}
      </div>
    </div>
  )
}
