"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { useI18n } from "@/components/i18n/I18nProvider"
import BackButton from "@/components/ui/BackButton"
import Button from "@/components/ui/Button"
import Textarea from "@/components/ui/Textarea"
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageTitleClassName
} from "@/components/ui/glassPageStyles"
import { localizePath } from "@/lib/localizePath"
import { pushWithTransition } from "@/lib/routeTransition"

const materialsPanelSurfaceClassName =
  "border border-[rgba(248,253,255,0.1)] bg-[rgba(10,14,22,0.52)] [.theme-night_&]:border-[rgba(166,190,230,0.1)] [.theme-night_&]:bg-[rgba(10,16,26,0.54)] " +
  "text-[color:var(--pt-120)] " +
  "[.theme-light_&]:border-[rgba(122,58,56,0.08)] [.theme-light_&]:bg-[rgba(255,255,255,0.22)] [.theme-light_&]:text-[#1f2937]"
const materialsPanelShadowClassName =
  "shadow-[var(--materials-panel-shadow,var(--chat-invite-shadow,var(--input-shadow)))] [.theme-light_&]:shadow-[var(--input-shadow)]"
const materialsPrimaryButtonClassName =
  "whitespace-normal text-center leading-[1.2] !px-[1.6rem] !py-[1.05rem] !text-[1.18rem] " +
  "!min-h-[3.2rem] max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]"
const materialsSecondaryButtonClassName =
  "whitespace-normal text-center leading-[1.2] !px-[1.2rem] !py-[0.72rem] !text-[1rem] !min-h-[2.7rem] " +
  "max-[768px]:!min-h-[3rem] max-[768px]:!px-[1.35rem] max-[768px]:!text-[1.08rem]"
const materialsSectionClassName =
  `grid gap-[0.82rem] rounded-[1.18rem] px-[1rem] py-[1rem] ${materialsPanelSurfaceClassName} ${materialsPanelShadowClassName} ` +
  "max-[768px]:gap-[0.72rem] max-[768px]:rounded-[1.08rem] max-[768px]:px-[0.88rem] max-[768px]:py-[0.9rem]"
const materialsUploadSectionClassName =
  "grid gap-[0.82rem] px-[0.05rem] py-[0.05rem] max-[768px]:gap-[0.72rem]"
const materialsSectionTitleClassName =
  "text-[1.22rem] font-[650] leading-[1.18] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]"
const materialsSectionCopyClassName =
  "text-[0.98rem] leading-[1.52] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]"

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

export default function MaterialsPage({ isAdmin = false, locale = "et" }) {
  const router = useRouter()
  const { t, locale: activeLocale } = useI18n()
  const resolvedLocale = activeLocale || locale

  const fileInputRef = useRef(null)
  const [closing, setClosing] = useState(false)
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(isAdmin)
  const [adminError, setAdminError] = useState("")

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

  const shouldReduceMotion = useCallback(() => {
    if (typeof window === "undefined") return false
    try {
      if (document?.documentElement?.dataset?.reduceMotion === "1") return true
      return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
    } catch {
      return false
    }
  }, [])

  const handleBack = useCallback(() => {
    if (closing) return
    if (!shouldReduceMotion()) {
      setClosing(true)
    }
    pushWithTransition(router, localizePath("/vestlus", resolvedLocale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    })
  }, [closing, resolvedLocale, router, shouldReduceMotion])

  return (
    <div className="materials-page-shell relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-[1rem] py-[1rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:justify-start max-[768px]:px-[0.25rem] max-[768px]:py-[0.5rem]">
      <div
        className={`materials-page-content invite-modal-content person-invite-modal-content relative z-[21] w-full !max-w-[clamp(30rem,54vw,38rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[var(--glass-modal-radius)] [border:var(--glass-modal-border)] [background:var(--glass-modal-bg)] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] shadow-[var(--glass-modal-shadow)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[1.25rem] pt-[0.35rem] pb-[1.1rem] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:!max-w-none max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.95rem] [--input-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] [--input-caret:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ${glassPageMobileCardClassName} ${closing ? "pointer-events-none motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]" : ""}`}
      >
        <BackButton
          onClick={handleBack}
          ariaLabel={t("profile.back_to_chat")}
          className={`${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`}
        />

        <header className="mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]">
          <div className="grid w-full max-w-[30rem] gap-[0.5rem] px-[2.6rem] text-center max-[768px]:max-w-none max-[768px]:px-[clamp(1rem,4vw,1.4rem)]">
            <div className="policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]">
              <h1 className={`${glassPageTitleClassName} w-full max-[768px]:!mt-0 max-[768px]:!mb-0`}>
                {t("materials_page.title")}
              </h1>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[clamp(20rem,52vw,35rem)] gap-[0.66rem] px-[0.05rem] pt-[0.26rem] pb-[0.25rem] max-[768px]:max-w-none max-[768px]:gap-[0.58rem] max-[768px]:px-[0.05rem]">
          <section className={materialsUploadSectionClassName}>
            <div className="grid gap-[0.12rem] pb-[0.12rem] text-left">
              <p className="text-[1.08rem] leading-[1.58] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.14rem]">
                {t("materials_page.description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-[-0.36rem] grid gap-[0.54rem]">
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
                <p className="text-center text-[0.9rem] leading-[1.45] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]">
                  {files.map((selectedFile) => selectedFile.name).join(", ")}
                </p>
              ) : null}

              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={5}
                placeholder={t("materials_page.comment_placeholder_multiple")}
                className={`min-h-[7.4rem] rounded-[1.05rem] !border-[rgba(248,253,255,0.1)] ![background:rgba(10,14,22,0.52)] [.theme-night_&]:!border-[rgba(166,190,230,0.1)] [.theme-night_&]:![background:rgba(10,16,26,0.54)] [.theme-light_&]:!border-[rgba(122,58,56,0.08)] [.theme-light_&]:![background:rgba(255,255,255,0.22)] ${materialsPanelShadowClassName} hover:![background:rgba(10,14,22,0.52)] [.theme-night_&:hover]:![background:rgba(10,16,26,0.54)] [.theme-light_&:hover]:![background:rgba(255,255,255,0.22)] focus-visible:![background:rgba(10,14,22,0.52)] [.theme-night_&:focus-visible]:![background:rgba(10,16,26,0.54)] [.theme-light_&:focus-visible]:![background:rgba(255,255,255,0.22)] focus-visible:shadow-[var(--materials-panel-shadow,var(--chat-invite-shadow,var(--input-shadow)))]`}
              />

              {error ? (
                <p className="rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(255,223,218,0.96)]">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="rounded-[1rem] border border-[rgba(88,148,118,0.22)] bg-[rgba(18,44,34,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(223,246,236,0.96)]">
                  {notice}
                </p>
              ) : null}

              <div className="mt-[1.05rem] flex w-full justify-center pt-[0.12rem] pb-[0.08rem] max-[768px]:mt-[1.2rem] max-[768px]:pt-[0.16rem] max-[768px]:pb-[0.1rem]">
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
            <section className={`materials-admin-panel ${materialsSectionClassName} -mx-[0.28rem] max-[768px]:-mx-[0.14rem]`}>
              <div className="flex items-start justify-between gap-[0.8rem]">
                <div className="grid gap-[0.22rem]">
                  <h2 className={materialsSectionTitleClassName}>{t("materials_page.admin.title")}</h2>
                  <p className={materialsSectionCopyClassName}>{t("materials_page.admin.subtitle")}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => void refreshItems()}
                  disabled={loadingItems}
                  className={materialsSecondaryButtonClassName}
                >
                  {t("materials_page.admin.refresh")}
                </Button>
              </div>

              {adminError ? (
                <p className="rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(255,223,218,0.96)]">
                  {adminError}
                </p>
              ) : null}

              {loadingItems ? (
                <p className="text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]">{t("materials_page.admin.loading")}</p>
              ) : items.length ? (
                <div className="grid gap-[0.72rem]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`grid gap-[0.62rem] rounded-[0.95rem] px-[0.88rem] py-[0.82rem] ${materialsPanelSurfaceClassName} ${materialsPanelShadowClassName}`}
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
                      </div>
                      <div className="grid gap-[0.36rem]">
                        <h3 className="text-[1rem] font-[620] leading-[1.3] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">{item.originalName}</h3>
                        <p className="whitespace-pre-wrap text-[0.95rem] leading-[1.55] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.9]">
                          {item.comment || t("materials_page.admin.comment_missing")}
                        </p>
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
                          variant="danger"
                          onClick={() => void handleDelete(item.id)}
                          className={materialsSecondaryButtonClassName}
                        >
                          {t("materials_page.admin.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]">{t("materials_page.admin.empty")}</p>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
