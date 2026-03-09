"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n/I18nProvider"
import BackButton from "@/components/ui/BackButton"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Panel from "@/components/ui/Panel"
import { glassPageBackTopLeftClassName, glassPageTitleClassName, glassPageTitleMobileHeaderClassName } from "@/components/ui/glassPageStyles"
import { localizePath } from "@/lib/localizePath"

const documentsTitleClassName =
  `${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} !mt-0 !mb-0 !px-0 !text-left !whitespace-normal ` +
  `!text-[clamp(2rem,4vw,2.85rem)] !leading-[1.03] !tracking-[0.02em] ` +
  `max-[768px]:!text-[clamp(1.62rem,5.9vw,2rem)] max-[768px]:!leading-[1.05] max-[768px]:!mt-0`

function formatDate(value, locale) {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat(locale || "et", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  } catch {
    return ""
  }
}

function artifactTypeLabel(type, t) {
  return t(`documents.artifact_types.${String(type || "other").toLowerCase()}`)
}

function artifactStatusLabel(status, t) {
  return t(`documents.status.${String(status || "draft").toLowerCase()}`)
}

function joinMetaParts(parts) {
  return parts.filter(Boolean).join(" · ")
}

export default function ArtifactDetailPage({ artifactId }) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [artifact, setArtifact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")
  const [feedback, setFeedback] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [approvalNotice, setApprovalNotice] = useState(null)

  useEffect(() => {
    if (!approvalNotice) return undefined
    const timer = window.setTimeout(() => setApprovalNotice(null), 8000)
    return () => window.clearTimeout(timer)
  }, [approvalNotice])

  const loadArtifact = useCallback(async () => {
    setLoading(true)
    setErrorText("")
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.load_artifact"))
      setArtifact(payload?.artifact || null)
      setTitle(payload?.artifact?.title || "")
      setContent(payload?.artifact?.content || "")
    } catch (error) {
      setArtifact(null)
      setErrorText(error?.message || t("documents.errors.load_artifact"))
    } finally {
      setLoading(false)
    }
  }, [artifactId, t])

  useEffect(() => {
    void loadArtifact()
  }, [loadArtifact])

  async function saveDraft() {
    if (saving || !artifact || artifact.status !== "DRAFT") return
    setSaving(true)
    setFeedback("")
    setErrorText("")
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.update_failed"))
      setArtifact(payload?.artifact || null)
      setTitle(payload?.artifact?.title || "")
      setContent(payload?.artifact?.content || "")
      setApprovalNotice(null)
      setFeedback(t("documents.feedback.saved"))
    } catch (error) {
      setErrorText(error?.message || t("documents.artifacts.errors.update_failed"))
    } finally {
      setSaving(false)
    }
  }

  async function approveArtifact() {
    if (approving || !artifact || artifact.status !== "DRAFT") return
    setApproving(true)
    setFeedback("")
    setErrorText("")
    setApprovalNotice(null)
    try {
      const saveResponse = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      })
      const savePayload = await saveResponse.json().catch(() => ({}))
      if (!saveResponse.ok) throw new Error(savePayload?.message || t("documents.artifacts.errors.update_failed"))
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}/approve`, { method: "POST" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.artifacts.errors.approve_failed"))
      setArtifact(payload?.artifact || null)
      setTitle(payload?.artifact?.title || "")
      setContent(payload?.artifact?.content || "")
      setApprovalNotice({
        message: t("documents.feedback.approved"),
        downloadUrls: payload?.downloadUrls || payload?.artifact?.downloadUrls || {}
      })
    } catch (error) {
      setErrorText(error?.message || t("documents.artifacts.errors.approve_failed"))
    } finally {
      setApproving(false)
    }
  }

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(String(artifact?.content || content || ""))
      setErrorText("")
      setFeedback(t("documents.feedback.copied"))
    } catch {
      setErrorText(t("documents.errors.copy_failed"))
    }
  }

  async function deleteArtifact() {
    if (!window.confirm(t("documents.confirm.delete_artifact"))) return
    try {
      const response = await fetch(`/api/documents/artifacts/${encodeURIComponent(artifactId)}`, { method: "DELETE" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.message || t("documents.errors.delete_artifact_failed"))
      router.push(localizePath("/documents", locale))
    } catch (error) {
      setErrorText(error?.message || t("documents.errors.delete_artifact_failed"))
    }
  }

  return (
    <section className="documents-workspace documents-workspace-page">
      <div className="documents-workspace-shell">
        <Panel variant="secondary" padding="md" className="documents-workspace-card rounded-[1.5rem]">
          <BackButton
            onClick={() => router.push(localizePath("/documents", locale))}
            ariaLabel={t("buttons.back")}
            className={glassPageBackTopLeftClassName}
          />
          <div className="documents-workspace-content">
            <header className="documents-page-header">
              <div className="documents-page-header-row">
                <div className="grid gap-[0.45rem]">
                  <h1 className={documentsTitleClassName}>{t("documents.artifact_detail_title")}</h1>
                </div>
              </div>
              {approvalNotice ? (
                <div className="documents-notice documents-notice--success flex flex-wrap items-center justify-between gap-[0.7rem] rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                  <span>{approvalNotice.message}</span>
                  <div className="flex items-center gap-[0.8rem]">
                    {approvalNotice.downloadUrls?.docx ? (
                      <a href={approvalNotice.downloadUrls.docx} className="font-medium underline underline-offset-[0.22rem]">
                        {t("documents.actions.download_docx")}
                      </a>
                    ) : null}
                    {approvalNotice.downloadUrls?.pdf ? (
                      <a href={approvalNotice.downloadUrls.pdf} className="font-medium underline underline-offset-[0.22rem]">
                        {t("documents.actions.download_pdf")}
                      </a>
                    ) : null}
                    <button type="button" className="text-[0.88rem] underline underline-offset-[0.18rem]" onClick={() => setApprovalNotice(null)}>
                      {t("common.close")}
                    </button>
                  </div>
                </div>
              ) : null}
              {feedback ? (
                <div className="documents-notice documents-notice--info rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                  {feedback}
                </div>
              ) : null}
              {loading ? (
                <div className="documents-empty-state rounded-[1rem] border border-dashed px-[0.95rem] py-[1rem] text-[0.98rem]">
                  {t("documents.loading")}
                </div>
              ) : null}
              {!loading && errorText ? (
                <div className="documents-notice documents-notice--error rounded-[0.95rem] px-[0.95rem] py-[0.78rem] text-[0.95rem]">
                  {errorText}
                </div>
              ) : null}
            </header>

            {!loading && !errorText && artifact ? (
              <Panel variant="secondary" padding="sm" className="documents-panel mt-[1rem] rounded-[1.2rem]">
                <div className="flex flex-wrap items-center gap-[0.45rem]">
                  <span className="documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em]">
                    {artifactTypeLabel(artifact.type, t)}
                  </span>
                  <span className={`documents-chip rounded-full px-[0.55rem] py-[0.15rem] text-[0.78rem] uppercase tracking-[0.08em] ${artifact.status === "FINAL" ? "is-active" : ""}`}>
                    {artifactStatusLabel(artifact.status, t)}
                  </span>
                </div>
                <h2 className="documents-strong-text mt-[0.75rem] text-[1.25rem] font-semibold">
                  {artifact.title || artifactTypeLabel(artifact.type, t)}
                </h2>
                <div className="documents-meta-text mt-[0.8rem] flex flex-wrap gap-[0.55rem] text-[0.94rem]">
                  {joinMetaParts([
                    formatDate(artifact.createdAt, locale),
                    `${t("documents.updated_at")} ${formatDate(artifact.updatedAt, locale)}`,
                    artifact.approvedAt ? `${t("documents.approved_at")} ${formatDate(artifact.approvedAt, locale)}` : ""
                  ])}
                </div>

                {artifact.status === "DRAFT" ? (
                  <>
                    <div className="mt-[0.9rem] grid gap-[0.7rem]">
                      <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={t("documents.form.artifact_title_placeholder")}
                        className="documents-form-input"
                      />
                      <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        className="documents-field documents-field--textarea min-h-[18rem] w-full px-[1rem] py-[0.95rem] text-[0.98rem] leading-[1.65] outline-none"
                      />
                    </div>
                    <div className="documents-notice documents-notice--muted mt-[0.8rem] rounded-[0.9rem] px-[0.85rem] py-[0.7rem] text-[0.9rem]">
                      {t("documents.draft_notice")}
                    </div>
                    <div className="mt-[0.85rem] flex flex-wrap gap-[0.45rem]">
                      <Button type="button" size="sm" className="documents-primary-button" onClick={() => void approveArtifact()} disabled={approving}>
                        {approving ? t("documents.actions.approving") : t("documents.actions.approve")}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void saveDraft()} disabled={saving}>
                        {saving ? t("documents.actions.saving") : t("documents.actions.save_draft")}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => setFeedback(t("documents.feedback.refine_stub"))}>
                        {t("documents.actions.refine_stub")}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void copyContent()}>
                        {t("documents.actions.copy")}
                      </Button>
                      <Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteArtifact()}>
                        {t("documents.actions.delete")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="documents-content mt-[0.9rem] rounded-[1rem] border px-[1rem] py-[0.95rem] whitespace-pre-wrap text-[0.98rem] leading-[1.65]">
                      {artifact.content}
                    </div>
                    <div className="documents-notice documents-notice--success mt-[0.8rem] rounded-[0.9rem] px-[0.85rem] py-[0.7rem] text-[0.9rem]">
                      {t("documents.feedback.approved")}
                    </div>
                    <div className="mt-[0.85rem] flex flex-wrap gap-[0.45rem]">
                      {artifact.downloadUrls?.docx ? (
                        <Button as="a" href={artifact.downloadUrls.docx} size="sm" className="documents-primary-button">
                          {t("documents.actions.download_docx")}
                        </Button>
                      ) : null}
                      {artifact.downloadUrls?.pdf ? (
                        <Button as="a" href={artifact.downloadUrls.pdf} size="sm" variant="ghost" className="documents-secondary-button">
                          {t("documents.actions.download_pdf")}
                        </Button>
                      ) : null}
                      <Button type="button" size="sm" variant="ghost" className="documents-secondary-button" onClick={() => void copyContent()}>
                        {t("documents.actions.copy")}
                      </Button>
                      <Button type="button" size="sm" variant="danger" className="documents-danger-button" onClick={() => void deleteArtifact()}>
                        {t("documents.actions.delete")}
                      </Button>
                    </div>
                  </>
                )}

                {artifact.template ? (
                  <Panel variant="secondary" padding="sm" className="documents-subpanel mt-[1rem] rounded-[0.95rem]">
                    <h2 className="documents-subsection-title">{t("documents.template_label")}</h2>
                    <p className="documents-meta-text mt-[0.25rem] text-[0.92rem]">
                      {artifact.template.title || artifact.template.originalName}
                    </p>
                  </Panel>
                ) : null}
                <Panel variant="secondary" padding="sm" className="documents-subpanel mt-[1rem] rounded-[0.95rem]">
                  <h2 className="documents-subsection-title">{t("documents.sources_section_title")}</h2>
                  <div className="mt-[0.55rem] flex flex-col gap-[0.45rem]">
                    {artifact.sources?.length ? (
                      artifact.sources.map((source) => (
                        <div key={source.id} className="documents-card rounded-[0.8rem] border px-[0.75rem] py-[0.65rem] text-[0.92rem]">
                          <div className="documents-strong-text font-medium">{source.title}</div>
                          <div className="documents-meta-text text-[0.84rem]">{source.originalName}</div>
                        </div>
                      ))
                    ) : (
                      <p className="documents-meta-text text-[0.92rem]">{t("documents.empty_sources")}</p>
                    )}
                  </div>
                </Panel>
              </Panel>
            ) : null}
          </div>
        </Panel>
      </div>
    </section>
  )
}
