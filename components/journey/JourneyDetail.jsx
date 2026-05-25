"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, Edit3, FileText, ListChecks, Lock, Map, Route, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageCardClassName,
  glassSubpageContentWideClassName,
  glassSubpageSurfaceScopeClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles";
import { pillInputBaseClassName, textAreaInputBaseClassName } from "@/components/ui/inputClassNames";
import { localizePath } from "@/lib/localizePath";
import { buildServiceMapHandoff } from "@/lib/journey/serviceMapHandoff";
import { pushWithTransition } from "@/lib/routeTransition";

const PRIMARY_PATH_VALUES = Object.freeze([
  "SERVICE_MAP",
  "PRE_INQUIRY",
  "DOCUMENT",
  "HELP_REQUEST",
  "ROOM",
  "GENERAL_SUPPORT",
  "UNKNOWN"
]);

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "journey-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-[1rem] text-[color:var(--glass-surface-text,var(--pt-50))] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0";

const panelClassName =
  `${glassSubpageSurfaceScopeClassName} ${glassPageMobileCardClassName} ${workspaceGuidePanelClassName} ${glassPrimaryButtonToneClassName} ` +
  "journey-page-panel workspace-feature-panel workspace-scroll-surface relative z-[21] max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[2rem] " +
  "[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] [border:none] " +
  "[background:var(--glass-ring-surface-bg,var(--glass-surface-bg,transparent))] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))] " +
  "shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] " +
  "[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[1.35rem] pt-[0.35rem] pb-[1.25rem] " +
  "max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.92rem]";

const contentClassName =
  `workspace-feature-content relative ${workspaceGuidePanelScrollClassName} ${glassSubpageContentWideClassName} mx-auto grid max-h-full content-start gap-[1rem] px-[0.05rem] pt-[0.48rem] pb-[1rem]`;

const cardClassName =
  `${glassSubpageCardClassName} workspace-feature-card grid gap-[1rem] rounded-[1rem] px-[1rem] py-[0.92rem]`;

const compactCardClassName =
  `${glassSubpageCardClassName} rounded-[0.85rem] px-[0.82rem] py-[0.72rem]`;

const sectionTitleClassName =
  "m-0 text-[1.14rem] font-[720] leading-[1.18] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))]";

const bodyTextClassName =
  "m-0 text-[0.98rem] leading-[1.5] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))] opacity-[0.8]";

const labelClassName =
  "text-[0.86rem] font-[700] leading-[1.2] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))] opacity-[0.86]";

const inputClassName = `${pillInputBaseClassName} rounded-[0.72rem]`;
const selectClassName = `${pillInputBaseClassName} rounded-[0.72rem]`;
const textareaClassName = `${textAreaInputBaseClassName} rounded-[0.72rem]`;
const listTextareaClassName = `${textAreaInputBaseClassName} min-h-[7.2rem] rounded-[0.72rem] text-[0.95rem] leading-[1.42]`;

const badgeClassName =
  "inline-flex items-center gap-[0.28rem] rounded-full border border-[color:var(--seg-card-border,var(--subpage-card-border))] [background:var(--seg-card-bg,var(--subpage-card-bg))] px-[0.58rem] py-[0.28rem] text-[0.78rem] font-[650] leading-[1.1] text-[color:var(--seg-card-text,var(--subpage-card-text))] shadow-[var(--seg-card-shadow,none)]";

const softMessageClassName =
  `${compactCardClassName} m-0 text-[0.94rem] leading-[1.42] text-[color:var(--subpage-card-text,var(--glass-modal-text))]`;

function formatDate(value, locale = "et") {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function primaryPathLabel(t, value) {
  return t(`journey.primary_paths.${value || "UNKNOWN"}`, t("journey.primary_paths.UNKNOWN", "Not clear yet"));
}

function statusLabel(t, status) {
  return t(`journey.status.${status || "ACTIVE"}`, t("journey.status.ACTIVE", "Active"));
}

function textToLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToText(value) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.title || "";
    })
    .filter(Boolean)
    .join("\n");
}

function actionsToText(value) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => item?.title || item)
    .filter(Boolean)
    .join("\n");
}

function textToActions(value) {
  return textToLines(value).map((title) => ({ title }));
}

function createFormState(journey) {
  return {
    title: journey?.title || "",
    summary: journey?.summary || "",
    primaryPath: journey?.primaryPath || "UNKNOWN",
    domains: arrayToText(journey?.domains),
    missingInfo: arrayToText(journey?.missingInfo),
    suggestedActions: actionsToText(journey?.suggestedActions)
  };
}

function ContentList({ title, items, emptyText, icon: Icon }) {
  const normalized = Array.isArray(items) ? items : [];
  return (
    <section className={cn(cardClassName, "content-start gap-[0.72rem]")}>
      <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
        {Icon ? <Icon size={18} aria-hidden="true" /> : null}
        {title}
      </h2>
      {normalized.length ? (
        <div className="flex flex-wrap gap-[0.42rem]">
          {normalized.map((item, index) => {
            const label = typeof item === "string" ? item : item?.title || "";
            return label ? (
              <span key={`${label}-${index}`} className={badgeClassName}>
                {label}
              </span>
            ) : null;
          })}
        </div>
      ) : (
        <p className={bodyTextClassName}>{emptyText}</p>
      )}
    </section>
  );
}

function FormListField({ id, label, value, onChange, t }) {
  return (
    <div className="grid gap-[0.48rem]">
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={listTextareaClassName}
        placeholder={t("journey.labels.one_item_per_line", "One item per line")}
      />
    </div>
  );
}

export default function JourneyDetail({ journeyId }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { status } = useSession();
  const [journey, setJourney] = useState(null);
  const [form, setForm] = useState(createFormState(null));
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notFound, setNotFound] = useState(false);

  const updatedAt = useMemo(() => formatDate(journey?.updatedAt, locale), [journey?.updatedAt, locale]);
  const serviceMapHandoff = useMemo(
    () => (journey ? buildServiceMapHandoff(journey) : null),
    [journey]
  );
  const serviceMapHref = serviceMapHandoff?.href
    ? localizePath(serviceMapHandoff.href, locale)
    : localizePath("/teenusekaart", locale);
  const preInquiryHref = journeyId
    ? localizePath(`/eelpoordumised?fromJourney=${encodeURIComponent(journeyId)}&workspaceRole=CLIENT`, locale)
    : localizePath("/eelpoordumised", locale);

  const handleBack = useCallback(() => {
    pushWithTransition(router, localizePath("/teekond", locale), {
      persistGlassRingTilt: false
    });
  }, [locale, router]);

  const infoSlot = (
    <DashboardInfoTrigger
      infoId="journey"
      title={t("journey.title", "Teekond")}
      label={t("journey.info.label", "Open journey info")}
      className={dashboardInfoTriggerCornerClassName}
    />
  );

  const loadJourney = useCallback(async () => {
    if (status !== "authenticated" || !journeyId) return;
    setError("");
    setNotFound(false);

    const response = await fetch(`/api/journeys/${encodeURIComponent(journeyId)}`, {
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 404) {
      setNotFound(true);
      setJourney(null);
      return;
    }
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || t("journey.messages.load_failed", "Loading the journey failed."));
    }
    setJourney(payload.journey || null);
    setForm(createFormState(payload.journey));
  }, [journeyId, status, t]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadJourney().catch((loadError) => {
      setError(loadError.message || t("journey.messages.load_failed", "Loading the journey failed."));
    });
  }, [loadJourney, status, t]);

  const updateForm = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/journeys/${encodeURIComponent(journeyId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          primaryPath: form.primaryPath,
          domains: textToLines(form.domains),
          missingInfo: textToLines(form.missingInfo),
          suggestedActions: textToActions(form.suggestedActions)
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || t("journey.messages.save_failed", "Saving the journey failed."));
      }
      setJourney(payload.journey);
      setForm(createFormState(payload.journey));
      setEditing(false);
      setNotice(t("journey.messages.updated", "Journey updated."));
    } catch (saveError) {
      setError(saveError.message || t("journey.messages.save_failed", "Saving the journey failed."));
    } finally {
      setBusy(false);
    }
  }, [form, journeyId, t]);

  const handleArchive = useCallback(async () => {
    if (!journeyId || journey?.status === "ARCHIVED") return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/journeys/${encodeURIComponent(journeyId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "ARCHIVED" })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || t("journey.messages.archive_failed", "Archiving the journey failed."));
      }
      setJourney(payload.journey);
      setForm(createFormState(payload.journey));
      setEditing(false);
      setNotice(t("journey.messages.archived", "Journey archived."));
    } catch (archiveError) {
      setError(archiveError.message || t("journey.messages.archive_failed", "Archiving the journey failed."));
    } finally {
      setBusy(false);
    }
  }, [journey?.status, journeyId, t]);

  const handleCancelEdit = useCallback(() => {
    setForm(createFormState(journey));
    setEditing(false);
    setError("");
  }, [journey]);

  if (status === "loading") {
    return (
      <main className={shellClassName}>
        <div className={panelClassName}>
          <div className={contentClassName}>
            <GlassSubpageHeader
              onBack={handleBack}
              backAriaLabel={t("journey.actions.back_to_list", "Back to journey")}
              holdPressedVisualDisabled
              backClassName="workspace-scroll-back-button"
              rightSlot={infoSlot}
            >
              {t("journey.title", "Teekond")}
            </GlassSubpageHeader>
            <p className={softMessageClassName}>{t("journey.messages.loading", "Loading journey...")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className={shellClassName}>
        <div className={panelClassName}>
          <div className={contentClassName}>
            <GlassSubpageHeader
              onBack={handleBack}
              backAriaLabel={t("journey.actions.back_to_list", "Back to journey")}
              holdPressedVisualDisabled
              backClassName="workspace-scroll-back-button"
              rightSlot={infoSlot}
            >
              {t("journey.title", "Teekond")}
            </GlassSubpageHeader>
            <section className={cn(cardClassName, "mx-auto w-full max-w-[42rem]")}>
              <div className="flex items-center gap-[0.65rem]">
                <Lock size={20} aria-hidden="true" />
                <h1 className={sectionTitleClassName}>{t("journey.title", "Teekond")}</h1>
              </div>
              <p className={bodyTextClassName}>
                {t("journey.messages.auth_required", "The journey is private. Log in to continue.")}
              </p>
              <Button as="a" href="/vestlus?login=1">
                {t("journey.actions.login", "Log in")}
              </Button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className={shellClassName}>
        <div className={panelClassName}>
          <div className={contentClassName}>
            <GlassSubpageHeader
              onBack={handleBack}
              backAriaLabel={t("journey.actions.back_to_list", "Back to journey")}
              holdPressedVisualDisabled
              backClassName="workspace-scroll-back-button"
              rightSlot={infoSlot}
            >
              {t("journey.title", "Teekond")}
            </GlassSubpageHeader>
            <section className={cn(cardClassName, "mx-auto w-full max-w-[42rem]")}>
              <h1 className={sectionTitleClassName}>{t("journey.messages.not_found_title", "Journey was not found")}</h1>
              <p className={bodyTextClassName}>
                {t("journey.messages.not_found", "This journey is not available or does not belong to your account.")}
              </p>
              <Button onClick={handleBack} variant="secondary">
                {t("journey.actions.back_to_list", "Back to journey")}
              </Button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={shellClassName}>
      <div className={panelClassName}>
        <div className={contentClassName}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("journey.actions.back_to_list", "Back to journey")}
            holdPressedVisualDisabled
            backClassName="workspace-scroll-back-button"
            rightSlot={infoSlot}
          >
            {t("journey.title", "Teekond")}
          </GlassSubpageHeader>

          {error ? <p className={softMessageClassName} role="alert">{error}</p> : null}
          {notice ? <p className={softMessageClassName} role="status">{notice}</p> : null}

          {!journey ? (
            <p className={softMessageClassName}>{t("journey.messages.loading", "Loading journey...")}</p>
          ) : (
            <>
              <section className={cardClassName}>
                <div className="flex flex-wrap items-start justify-between gap-[0.82rem]">
                  <div className="grid min-w-0 gap-[0.52rem]">
                    <div className="flex flex-wrap items-center gap-[0.42rem] text-[0.82rem] font-[700] uppercase tracking-[0.08em] text-[color:var(--title-color,var(--brand-primary))]">
                      <Route size={17} aria-hidden="true" />
                      {t("journey.header.eyebrow", "Private journey layer")}
                    </div>
                    <h1 className="m-0 text-[clamp(1.55rem,4vw,2.35rem)] font-[760] leading-[1.08] tracking-[0] text-[color:var(--title-color,var(--brand-primary))]">
                      {journey.title}
                    </h1>
                    <div className="flex flex-wrap gap-[0.42rem]">
                      <span className={badgeClassName}>
                        <Lock size={14} aria-hidden="true" />
                        {t("journey.labels.private", "Private")}
                      </span>
                      <span className={badgeClassName}>{statusLabel(t, journey.status)}</span>
                      <span className={badgeClassName}>{primaryPathLabel(t, journey.primaryPath)}</span>
                      {updatedAt ? (
                        <span className={badgeClassName}>
                          {t("journey.labels.updated_at", { date: updatedAt }, "Updated {date}")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-[0.56rem]">
                    <Button variant="secondary" onClick={() => setEditing((current) => !current)} disabled={busy}>
                      <Edit3 size={16} aria-hidden="true" />
                      {editing ? t("journey.actions.close_edit", "Close editing") : t("journey.actions.edit", "Edit")}
                    </Button>
                    {journey.status !== "ARCHIVED" ? (
                      <Button variant="danger" onClick={handleArchive} disabled={busy}>
                        <Archive size={16} aria-hidden="true" />
                        {t("journey.actions.archive", "Archive")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className={cn(cardClassName, "border-[color:var(--title-color,var(--brand-primary))]")}>
                <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                  <Lock size={18} aria-hidden="true" />
                  {t("journey.privacy.title", "Journey is private")}
                </h2>
                <p className={bodyTextClassName}>
                  {t("journey.privacy.description", "This journey is private. Information is not shared with a specialist, service provider, or another party before you confirm and share it yourself.")}
                </p>
              </section>

              <section className={cardClassName}>
                <div className="flex flex-wrap items-start justify-between gap-[0.82rem]">
                  <div className="grid gap-[0.36rem]">
                    <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                      <Map size={18} aria-hidden="true" />
                      {t("journey.service_map.title", "Open service map")}
                    </h2>
                    <p className={bodyTextClassName}>
                      {serviceMapHandoff?.hasFilter
                        ? t("journey.service_map.filtered_description", "The service map opens with filters based on this journey.")
                        : t("journey.service_map.fallback_description", "The region is missing, so the service map opens in the general view.")}
                    </p>
                    <p className={bodyTextClassName}>
                      {t("journey.service_map.privacy_note", "The service map does not share your journey with any party. It is a tool for finding a suitable contact or next step.")}
                    </p>
                  </div>
                  <Button as="a" href={serviceMapHref}>
                    <Map size={17} aria-hidden="true" />
                    {t("journey.service_map.open", "Open service map")}
                  </Button>
                </div>
              </section>

              <section className={cardClassName}>
                <div className="flex flex-wrap items-start justify-between gap-[0.82rem]">
                  <div className="grid gap-[0.36rem]">
                    <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                      <Send size={18} aria-hidden="true" />
                      {t("journey.pre_inquiry.title", "Pre-inquiry draft")}
                    </h2>
                    <p className={bodyTextClassName}>
                      {t("journey.pre_inquiry.description", "A pre-inquiry draft is prepared from this journey. You can review and edit all text before sending.")}
                    </p>
                    <p className={bodyTextClassName}>
                      {t("journey.pre_inquiry.privacy_note", "The journey is not shared automatically. The receiver sees only the pre-inquiry you confirm and send.")}
                    </p>
                  </div>
                  <Button as="a" href={preInquiryHref}>
                    <Send size={17} aria-hidden="true" />
                    {t("journey.pre_inquiry.open", "Create pre-inquiry")}
                  </Button>
                </div>
              </section>

              {editing ? (
                <form className={cardClassName} onSubmit={handleSave}>
                  <div className="grid gap-[0.48rem]">
                    <label className={labelClassName} htmlFor="journey-detail-title">
                      {t("journey.labels.title", "Title")}
                    </label>
                    <input
                      id="journey-detail-title"
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      className={inputClassName}
                      maxLength={160}
                      required
                    />
                  </div>

                  <div className="grid gap-[0.48rem]">
                    <label className={labelClassName} htmlFor="journey-detail-summary">
                      {t("journey.labels.summary", "Situation summary")}
                    </label>
                    <textarea
                      id="journey-detail-summary"
                      value={form.summary}
                      onChange={(event) => updateForm("summary", event.target.value)}
                      className={cn(textareaClassName, "min-h-[10rem] text-[1rem] leading-[1.48]")}
                      required
                    />
                  </div>

                  <div className="grid gap-[0.48rem]">
                    <label className={labelClassName} htmlFor="journey-detail-primary-path">
                      {t("journey.labels.primary_path", "Primary direction")}
                    </label>
                    <select
                      id="journey-detail-primary-path"
                      value={form.primaryPath || "UNKNOWN"}
                      onChange={(event) => updateForm("primaryPath", event.target.value)}
                      className={selectClassName}
                    >
                      {PRIMARY_PATH_VALUES.map((value) => (
                        <option key={value} value={value}>{primaryPathLabel(t, value)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-[0.76rem] md:grid-cols-2">
                    <FormListField
                      id="journey-detail-domains"
                      label={t("journey.labels.domains", "Related topics")}
                      value={form.domains}
                      onChange={(value) => updateForm("domains", value)}
                      t={t}
                    />
                    <FormListField
                      id="journey-detail-missing-info"
                      label={t("journey.labels.missing_info", "Missing information")}
                      value={form.missingInfo}
                      onChange={(value) => updateForm("missingInfo", value)}
                      t={t}
                    />
                    <FormListField
                      id="journey-detail-actions"
                      label={t("journey.labels.suggested_actions", "Suggested next steps")}
                      value={form.suggestedActions}
                      onChange={(value) => updateForm("suggestedActions", value)}
                      t={t}
                    />
                  </div>

                  <div className="flex flex-wrap gap-[0.62rem]">
                    <Button type="submit" disabled={busy}>
                      <Save size={17} aria-hidden="true" />
                      {t("journey.actions.save_changes", "Save changes")}
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEdit} disabled={busy}>
                      {t("journey.actions.cancel", "Cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <section className={cardClassName}>
                    <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                      <FileText size={18} aria-hidden="true" />
                      {t("journey.labels.summary", "Situation summary")}
                    </h2>
                    <p className={bodyTextClassName}>{journey.summary}</p>
                  </section>

                  <div className="grid gap-[1rem] lg:grid-cols-2">
                    <ContentList
                      title={t("journey.labels.domains", "Related topics")}
                      items={journey.domains}
                      emptyText={t("journey.messages.empty_domains", "No related topics have been added.")}
                      icon={Map}
                    />
                    <ContentList
                      title={t("journey.labels.missing_info", "Missing information")}
                      items={journey.missingInfo}
                      emptyText={t("journey.messages.empty_missing_info", "No missing information has been added.")}
                      icon={ListChecks}
                    />
                    <ContentList
                      title={t("journey.labels.risk_signals", "Careful notes")}
                      items={journey.riskSignals}
                      emptyText={t("journey.messages.empty_risk_signals", "No careful notes have been added.")}
                      icon={Lock}
                    />
                    <ContentList
                      title={t("journey.labels.suggested_actions", "Suggested next steps")}
                      items={journey.suggestedActions}
                      emptyText={t("journey.messages.empty_suggested_actions", "No suggested next steps have been added.")}
                      icon={Check}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
