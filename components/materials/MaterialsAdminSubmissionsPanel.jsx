"use client"

import { useEffect, useState } from "react"

import CardTitle from "@/components/ui/CardTitle"
import BorderGlow from "@/components/ui/BorderGlow"
import Button from "@/components/ui/Button"
import { useI18n } from "@/components/i18n/I18nProvider"
import { fieldEdgeGlowStyle } from "@/components/ui/GlowField"
import {
  glassSubpageCardClassName,
  glassSubpagePanelWideClassName
} from "@/components/ui/glassPageStyles"
import {
  buttonBaseClassName,
  buttonCompactClassName,
  buttonDangerClassName,
  buttonGhostClassName,
  buttonSecondaryClassName,
  cardBodyClassName,
  cardClassName,
  cardHeadClassName,
  cardSubClassName
} from "@/components/admin/rag/ragAdminShared"

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
const materialsSectionTitleClassName =
  "text-[1.22rem] font-[650] leading-[1.18] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]"
const materialsSectionCopyClassName =
  "text-[0.98rem] leading-[1.52] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]"
const materialsStatusBadgeClassName =
  "inline-flex items-center rounded-full border border-[rgba(148,163,184,0.24)] bg-[rgba(255,255,255,0.08)] px-[0.62rem] py-[0.22rem] text-[0.78rem] font-[620] uppercase tracking-[0.04em]"

const ragAdminRowClassName =
  "grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2.5"
const ragAdminMetaClassName =
  "flex flex-wrap items-center gap-2 text-[0.82rem] text-[color:var(--admin-muted)]"
const ragAdminStatusBadgeClassName =
  "inline-flex items-center rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-0.5 text-[0.76rem] font-semibold uppercase tracking-[0.04em] text-[color:var(--admin-text)]"

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

export default function MaterialsAdminSubmissionsPanel({
  variant = "materials",
  locale = "et",
  refreshKey = 0
}) {
  const { t, locale: activeLocale } = useI18n()
  const resolvedLocale = activeLocale || locale
  const isRagAdmin = variant === "ragAdmin"
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [adminError, setAdminError] = useState("")
  const [reviewingId, setReviewingId] = useState("")

  async function refreshItems() {
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

  useEffect(() => {
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
  }, [refreshKey, t])

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
    const reviewNote = window.prompt(t("materials_page.admin.review_note_prompt", "Markus ulevaatuse kohta (valikuline):"), "")
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
        throw new Error(payload?.message || t("materials_page.errors.review_failed", "Materjali ulevaatuse salvestamine ebaonnestus."))
      }
      const updated = payload?.submission
      if (updated?.id) {
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      }
    } catch (reviewError) {
      setAdminError(reviewError?.message || t("materials_page.errors.review_failed", "Materjali ulevaatuse salvestamine ebaonnestus."))
    } finally {
      setReviewingId("")
    }
  }

  const buttonClassName = isRagAdmin
    ? `${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`
    : materialsSecondaryButtonClassName
  const secondaryButtonClassName = isRagAdmin
    ? `${buttonBaseClassName} ${buttonSecondaryClassName} ${buttonCompactClassName}`
    : materialsSecondaryButtonClassName
  const dangerButtonClassName = isRagAdmin
    ? `${buttonBaseClassName} ${buttonDangerClassName} ${buttonCompactClassName}`
    : materialsSecondaryButtonClassName
  const metaClassName = isRagAdmin
    ? ragAdminMetaClassName
    : "flex flex-wrap items-center gap-[0.45rem] text-[0.86rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.76]"
  const statusBadgeClassName = isRagAdmin ? ragAdminStatusBadgeClassName : materialsStatusBadgeClassName
  const rowClassName = isRagAdmin
    ? ragAdminRowClassName
    : `materials-admin-row grid gap-[0.62rem] rounded-[0.95rem] px-[0.62rem] py-[0.72rem] ${glassSubpageCardClassName}`
  const textClassName = isRagAdmin
    ? "text-[color:var(--admin-text)]"
    : "text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]"
  const mutedTextClassName = isRagAdmin
    ? "text-[color:var(--admin-muted)]"
    : "text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]"

  const header = isRagAdmin ? (
    <div className={cardHeadClassName}>
      <div>
        <CardTitle>{t("materials_page.admin.title")}</CardTitle>
        <div className={cardSubClassName}>{t("materials_page.admin.subtitle")}</div>
      </div>
      <Button
        variant="ghost"
        onClick={() => void refreshItems()}
        disabled={loadingItems}
        className={secondaryButtonClassName}
      >
        {t("materials_page.admin.refresh")}
      </Button>
    </div>
  ) : (
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
  )

  const content = (
    <>
      {header}

      {adminError ? (
        <p className={`rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[1rem] py-[0.54rem] text-center text-[0.98rem] leading-[1.3] text-[rgba(255,223,218,0.96)] ${isRagAdmin ? "" : materialsDesktopReadableWidthClassName}`}>
          {adminError}
        </p>
      ) : null}

      {loadingItems ? (
        <p className={mutedTextClassName}>{t("materials_page.admin.loading")}</p>
      ) : items.length ? (
        <div className={`grid gap-[0.72rem] ${isRagAdmin ? "" : `${materialsDesktopReadableWidthClassName} ${materialsAdminInnerWidthClassName}`}`}>
          {items.map((item) => {
            const row = (
              <>
                <div className={metaClassName}>
                  <span>{formatDate(item.createdAt, resolvedLocale)}</span>
                  <span>|</span>
                  <span>{formatFileSize(item.size)}</span>
                  {item.submittedByUser?.email ? (
                    <>
                      <span>|</span>
                      <span>{item.submittedByUser.email}</span>
                    </>
                  ) : null}
                  <span className={statusBadgeClassName}>{materialStatusLabel(t, item.status)}</span>
                </div>
                <div className="grid gap-[0.36rem]">
                  <h3 className={`text-[1rem] font-[620] leading-[1.3] ${textClassName}`}>{item.originalName}</h3>
                  <p className={`whitespace-pre-wrap text-[0.95rem] leading-[1.55] ${textClassName} ${isRagAdmin ? "" : "opacity-[0.9]"}`}>
                    {item.comment || t("materials_page.admin.comment_missing")}
                  </p>
                  {item.reviewedAt || item.reviewNote ? (
                    <p className={`text-[0.84rem] leading-[1.45] ${mutedTextClassName}`}>
                      {item.reviewedAt ? `${formatDate(item.reviewedAt, resolvedLocale)}${item.reviewedBy ? ` | ${item.reviewedBy}` : ""}` : null}
                      {item.reviewNote ? `${item.reviewedAt ? " | " : ""}${item.reviewNote}` : null}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  <Button
                    as="a"
                    href={`/api/materials/${encodeURIComponent(item.id)}/download`}
                    className={secondaryButtonClassName}
                  >
                    {t("materials_page.admin.download")}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={reviewingId === item.id || item.status === "reviewed"}
                    onClick={() => void handleReview(item.id, "mark_reviewed")}
                    className={buttonClassName}
                  >
                    {t("materials_page.admin.mark_reviewed", "Margi ule vaadatuks")}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={reviewingId === item.id || item.status === "imported"}
                    onClick={() => void handleReview(item.id, "mark_imported")}
                    className={buttonClassName}
                  >
                    {t("materials_page.admin.mark_imported", "Margi impordituks")}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={reviewingId === item.id || item.status === "rejected"}
                    onClick={() => void handleReview(item.id, "reject")}
                    className={dangerButtonClassName}
                  >
                    {t("materials_page.admin.reject", "Lukka tagasi")}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => void handleDelete(item.id)}
                    className={dangerButtonClassName}
                  >
                    {t("materials_page.admin.delete")}
                  </Button>
                </div>
              </>
            )

            return isRagAdmin ? (
              <div key={item.id} className={rowClassName}>
                {row}
              </div>
            ) : (
              <MaterialsGlowPanel as="div" key={item.id} className={rowClassName}>
                {row}
              </MaterialsGlowPanel>
            )
          })}
        </div>
      ) : (
        <p className={`${mutedTextClassName} ${isRagAdmin ? "" : `${materialsDesktopReadableWidthClassName} ${materialsAdminInnerWidthClassName}`}`}>{t("materials_page.admin.empty")}</p>
      )}
    </>
  )

  if (isRagAdmin) {
    return (
      <div className={cardClassName} id="rag-documents-submitted-materials">
        <div className={cardBodyClassName}>{content}</div>
      </div>
    )
  }

  return (
    <MaterialsGlowPanel
      className={`materials-admin-panel ${glassSubpagePanelWideClassName} ${materialsSectionClassName} ${materialsMobilePanelWidthClassName}`}
    >
      {content}
    </MaterialsGlowPanel>
  )
}
