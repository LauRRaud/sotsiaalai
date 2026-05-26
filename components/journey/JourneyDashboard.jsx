"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, FileText, ListChecks, Lock, Map, Plus, Route, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
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
import AdminRoleViewCycleButton from "@/components/workspace/AdminRoleViewCycleButton";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

const PRIMARY_PATH_VALUES = Object.freeze([
  "SERVICE_MAP",
  "PRE_INQUIRY",
  "DOCUMENT",
  "HELP_REQUEST",
  "ROOM",
  "HEALTH_CONTACT",
  "COMBINED_SOCIAL_HEALTH",
  "GENERAL_SUPPORT",
  "UNKNOWN"
]);

const DEFAULT_DRAFT = Object.freeze({
  title: "",
  summary: "",
  primaryPath: "UNKNOWN",
  domains: [],
  missingInfo: [],
  riskSignals: [],
  suggestedActions: [],
  context: {}
});

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";

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
  `${glassSubpageCardClassName} grid gap-[1rem] rounded-[1rem] px-[1rem] py-[0.92rem]`;

const compactCardClassName =
  `${glassSubpageCardClassName} rounded-[0.85rem] px-[0.82rem] py-[0.72rem]`;

const titleClassName =
  "m-0 text-[clamp(1.55rem,4vw,2.35rem)] font-[760] leading-[1.06] tracking-[0] text-[color:var(--title-color,var(--brand-primary))]";

const sectionTitleClassName =
  "m-0 text-[1.14rem] font-[720] leading-[1.18] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))]";

const bodyTextClassName =
  "m-0 text-[0.98rem] leading-[1.5] text-[color:var(--glass-modal-text,var(--glass-surface-text,var(--pt-50)))] opacity-[0.78]";

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

const iconBubbleClassName =
  "mt-[0.15rem] inline-flex size-[2.35rem] shrink-0 items-center justify-center rounded-full border border-[color:var(--seg-card-border,var(--subpage-card-border))] [background:var(--seg-card-bg,var(--subpage-card-bg))] text-[color:var(--title-color,var(--brand-primary))]";

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

function textToLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function statusLabel(t, status) {
  return t(`journey.status.${status || "ACTIVE"}`, t("journey.status.ACTIVE", "Active"));
}

function primaryPathLabel(t, value) {
  return t(`journey.primary_paths.${value || "UNKNOWN"}`, t("journey.primary_paths.UNKNOWN", "Not clear yet"));
}

function JourneyCard({ journey, onArchive, busy, t, locale }) {
  const archived = journey.status === "ARCHIVED";
  const updatedAt = formatDate(journey.updatedAt, locale);
  const detailHref = localizePath(`/teekond/${encodeURIComponent(journey.id)}`, locale);

  return (
    <article className={cn(cardClassName, "gap-[0.72rem]")}>
      <div className="flex flex-wrap items-start justify-between gap-[0.8rem]">
        <div className="grid min-w-0 gap-[0.3rem]">
          <h2 className="m-0 text-[1.08rem] font-[700] leading-[1.2] tracking-[0] text-[color:var(--glass-modal-text,var(--subpage-card-text))]">
            {journey.title}
          </h2>
          <div className="flex flex-wrap gap-[0.42rem]">
            <span className={badgeClassName}>
              <Lock size={14} aria-hidden="true" />
              {t("journey.labels.private", "Private")}
            </span>
            <span className={badgeClassName}>
              {statusLabel(t, journey.status)}
            </span>
            <span className={badgeClassName}>
              {primaryPathLabel(t, journey.primaryPath)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-[0.5rem]">
          <Button as="a" href={detailHref} variant="secondary" size="sm">
            {t("journey.actions.open", "Open journey")}
          </Button>
          {!archived ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onArchive(journey.id)}
              disabled={busy}
              aria-label={t("journey.actions.archive_named", { title: journey.title }, "Archive journey {title}")}
            >
              <Archive size={16} aria-hidden="true" />
              {t("journey.actions.archive", "Archive")}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="m-0 line-clamp-4 text-[0.94rem] leading-[1.48] text-[color:var(--glass-modal-text,var(--subpage-card-text))] opacity-[0.78]">
        {journey.summary}
      </p>

      {journey.domains?.length ? (
        <div className="flex flex-wrap gap-[0.38rem]">
          {journey.domains.map((domain) => (
            <span
              key={domain}
              className={badgeClassName}
            >
              {domain}
            </span>
          ))}
        </div>
      ) : null}

      <p className="m-0 text-[0.78rem] leading-[1.25] text-[color:var(--glass-modal-text,var(--subpage-card-text))] opacity-[0.58]">
        {t("journey.labels.updated_at", { date: updatedAt }, "Updated {date}")}
      </p>
    </article>
  );
}

function DraftReview({ draft, setDraft, onSave, onCancel, busy, t }) {
  const updateField = useCallback((field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }, [setDraft]);

  const fields = useMemo(() => ({
    domains: arrayToText(draft.domains),
    missingInfo: arrayToText(draft.missingInfo),
    riskSignals: arrayToText(draft.riskSignals),
    suggestedActions: actionsToText(draft.suggestedActions)
  }), [draft.domains, draft.missingInfo, draft.riskSignals, draft.suggestedActions]);

  const handleTextareaListChange = useCallback((field, value) => {
    updateField(field, textToLines(value));
  }, [updateField]);

  const handleActionsChange = useCallback((value) => {
    updateField("suggestedActions", textToActions(value));
  }, [updateField]);

  return (
    <form className="grid gap-[1rem]" onSubmit={onSave}>
      <div className="grid gap-[0.48rem]">
        <label className={labelClassName} htmlFor="journey-title">
          {t("journey.labels.title", "Title")}
        </label>
        <input
          id="journey-title"
          value={draft.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClassName}
          maxLength={160}
          required
        />
      </div>

      <div className="grid gap-[0.48rem]">
        <label className={labelClassName} htmlFor="journey-summary">
          {t("journey.labels.summary", "Situation summary")}
        </label>
        <textarea
          id="journey-summary"
          value={draft.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          className={cn(textareaClassName, "min-h-[10rem] text-[1rem] leading-[1.48]")}
          required
        />
      </div>

      <div className="grid gap-[0.48rem]">
        <label className={labelClassName} htmlFor="journey-primary-path">
          {t("journey.labels.primary_path", "Primary direction")}
        </label>
        <select
          id="journey-primary-path"
          value={draft.primaryPath || "UNKNOWN"}
          onChange={(event) => updateField("primaryPath", event.target.value)}
          className={selectClassName}
        >
          {PRIMARY_PATH_VALUES.map((value) => (
            <option key={value} value={value}>{primaryPathLabel(t, value)}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-[0.76rem] md:grid-cols-2">
        <ListField
          id="journey-domains"
          label={t("journey.labels.domains", "Related topics")}
          value={fields.domains}
          onChange={(value) => handleTextareaListChange("domains", value)}
          t={t}
        />
        <ListField
          id="journey-missing-info"
          label={t("journey.labels.missing_info", "Missing information")}
          value={fields.missingInfo}
          onChange={(value) => handleTextareaListChange("missingInfo", value)}
          t={t}
        />
        <ListField
          id="journey-risk-signals"
          label={t("journey.labels.risk_signals", "Careful notes")}
          value={fields.riskSignals}
          onChange={(value) => handleTextareaListChange("riskSignals", value)}
          t={t}
        />
        <ListField
          id="journey-actions"
          label={t("journey.labels.suggested_actions", "Suggested next steps")}
          value={fields.suggestedActions}
          onChange={handleActionsChange}
          t={t}
        />
      </div>

      <div className="flex flex-wrap gap-[0.62rem]">
        <Button type="submit" disabled={busy}>
          <Check size={17} aria-hidden="true" />
          {t("journey.actions.save_private", "Save private journey")}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {t("journey.actions.back", "Back")}
        </Button>
      </div>
    </form>
  );
}

function ListField({ id, label, value, onChange, t }) {
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

function RoleWorkspaceAction({ href, icon: Icon, title, description }) {
  return (
    <Button as="a" href={href} variant="secondary" className="min-h-[3.1rem] justify-start text-left">
      <span className="inline-flex min-w-0 items-center gap-[0.58rem]">
        {Icon ? <Icon size={17} aria-hidden="true" /> : null}
        <span className="grid min-w-0 gap-[0.1rem]">
          <span className="text-[0.98rem] font-[720] leading-[1.12]">{title}</span>
          {description ? (
            <span className="text-[0.78rem] font-[520] leading-[1.18] opacity-[0.72]">{description}</span>
          ) : null}
        </span>
      </span>
    </Button>
  );
}

function RoleScopedWorkspace({ role, t, locale }) {
  const isProvider = role === "SERVICE_PROVIDER";
  const titleKey = isProvider ? "journey.workspace.provider.title" : "journey.workspace.specialist.title";
  const descriptionKey = isProvider ? "journey.workspace.provider.description" : "journey.workspace.specialist.description";
  const sharedInfoKey = isProvider ? "journey.workspace.provider.sharedInfoOnly" : "journey.workspace.specialist.sharedInfoOnly";
  const titleFallback = isProvider ? "Teenusega seotud eelinfo" : "Kinnitatud eelinfo";
  const descriptionFallback = isProvider
    ? "Teenuseosutaja näeb ainult konkreetse teenuse või pöördumisega seotud kinnitatud infot."
    : "Spetsialist näeb Teekonnaga seotud infot ainult eelpöördumiste ja muude kinnitatud töövoogude kaudu.";
  const sharedInfoFallback = isProvider
    ? "Privaatseid Teekondi ei kuvata. Teenuseosutaja ei näe kasutaja assistendivestlust ega kogu Teekonda."
    : "Privaatseid Teekondi ei kuvata. Spetsialist ei näe kasutaja assistendivestlust ega kogu Teekonda.";
  const preInquiryHref = localizePath("/eelpoordumised", locale);
  const roomsHref = localizePath("/vestlus?rooms=1", locale);
  const serviceProfileHref = localizePath("/teenuseprofiil", locale);
  const documentsHref = localizePath("/documents", locale);

  return (
    <section className={cn(cardClassName, "gap-[0.9rem]")}>
      <div className="grid gap-[0.46rem]">
        <h1 className={titleClassName}>
          {t(titleKey, titleFallback)}
        </h1>
        <p className={cn(bodyTextClassName, "max-w-[58rem]")}>
          {t(descriptionKey, descriptionFallback)}
        </p>
        <p className={cn(bodyTextClassName, "max-w-[58rem]")}>
          {t(sharedInfoKey, sharedInfoFallback)}
        </p>
      </div>

      <div className="grid gap-[0.62rem] sm:grid-cols-2">
        <RoleWorkspaceAction
          href={preInquiryHref}
          icon={FileText}
          title={isProvider
            ? t("journey.workspace.provider.serviceInquiries", "Saabunud pöördumised")
            : t("journey.workspace.specialist.preInquiries", "Eelpöördumised")}
          description={isProvider
            ? t("journey.workspace.provider.serviceInquiriesDescription", "Ava teenusega seotud kinnitatud pöördumised.")
            : t("journey.workspace.specialist.preInquiriesDescription", "Ava kasutaja kinnitatud eelpöördumised.")}
        />
        <RoleWorkspaceAction
          href={roomsHref}
          icon={Route}
          title={t("journey.workspace.client.relatedRooms", "Vestlusruumid")}
          description={t("journey.workspace.privateJourneysNotShared", "Privaatset Teekonda ei jagata automaatselt.")}
        />
        {isProvider ? (
          <RoleWorkspaceAction
            href={serviceProfileHref}
            icon={Map}
            title={t("journey.workspace.provider.serviceProfile", "Teenuseprofiil")}
            description={t("journey.workspace.provider.serviceProfileDescription", "Halda teenuse nähtavust ja kontaktinfot.")}
          />
        ) : (
          <RoleWorkspaceAction
            href={documentsHref}
            icon={FileText}
            title={t("chat.workspace.cards.document_drafting.title", "Dokumendi koostamine")}
            description={t("journey.workspace.specialist.documentsDescription", "Kasuta olemasolevaid dokumendi töövahendeid.")}
          />
        )}
        <RoleWorkspaceAction
          href={preInquiryHref}
          icon={ListChecks}
          title={isProvider
            ? t("journey.workspace.provider.sharedInfoOnly", "Teenusega seotud kinnitatud eelinfo")
            : t("journey.workspace.specialist.missingInfo", "Täpsustamist vajav info")}
          description={t("journey.workspace.notAvailableForRole", "Privaatsete Teekondade nimekirja selles rollis ei kuvata.")}
        />
      </div>
    </section>
  );
}

export default function JourneyDashboard() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { status } = useSession();
  const { effectiveRole, isAdmin, isRoleResolved, refresh: refreshEffectiveRole } = useEffectiveRole();
  const [journeys, setJourneys] = useState([]);
  const [mode, setMode] = useState("list");
  const [situation, setSituation] = useState("");
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeJourneys = useMemo(
    () => journeys.filter((journey) => journey.status !== "ARCHIVED"),
    [journeys]
  );
  const archivedJourneys = useMemo(
    () => journeys.filter((journey) => journey.status === "ARCHIVED"),
    [journeys]
  );
  const normalizedRole = String(effectiveRole || "CLIENT").toUpperCase();
  const isClientRole = normalizedRole === "CLIENT";
  const latestJourney = activeJourneys[0] || journeys[0] || null;
  const headerRightSlot = useMemo(() => (
    <span className="inline-flex items-center gap-[0.52rem]">
      {isAdmin ? (
        <AdminRoleViewCycleButton
          t={t}
          locale={locale}
          value={normalizedRole}
          onRoleChanged={refreshEffectiveRole}
          ariaLabel={t("chat.workspace.view_role.label", "Töölaua vaade")}
        />
      ) : null}
      <DashboardInfoTrigger
        infoId="journey"
        title={t("journey.title", "Teekond")}
        label={t("journey.info.label", "Open journey info")}
        className={dashboardInfoTriggerCornerClassName}
      />
    </span>
  ), [isAdmin, locale, normalizedRole, refreshEffectiveRole, t]);

  const handleBack = useCallback(() => {
    const navigateBack = () => {
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
            JSON.stringify({ ts: Date.now() })
          );
        } catch {}
      }
      pushWithTransition(router, localizePath("/vestlus", locale), {
        persistGlassRingTilt: false
      });
    };

    if (typeof window === "undefined") {
      navigateBack();
      return;
    }
    window.requestAnimationFrame(navigateBack);
  }, [locale, router]);

  const loadJourneys = useCallback(async () => {
    if (status !== "authenticated" || !isRoleResolved || !isClientRole) return;
    setError("");
    const response = await fetch("/api/journeys", {
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || t("journey.messages.load_failed", "Loading the journey failed."));
    }
    setJourneys(Array.isArray(payload.journeys) ? payload.journeys : []);
  }, [isClientRole, isRoleResolved, status, t]);

  useEffect(() => {
    if (status !== "authenticated" || !isRoleResolved || !isClientRole) return;
    loadJourneys().catch((loadError) => {
      setError(loadError.message || t("journey.messages.load_failed", "Loading the journey failed."));
    });
  }, [isClientRole, isRoleResolved, loadJourneys, status, t]);

  const handleDraftSubmit = useCallback(async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/journeys/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ situation })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || t("journey.messages.draft_failed", "Creating the draft failed."));
      }
      setDraft({
        ...DEFAULT_DRAFT,
        ...payload.draft
      });
      setMode("review");
    } catch (draftError) {
      setError(draftError.message || t("journey.messages.draft_failed", "Creating the draft failed."));
    } finally {
      setBusy(false);
    }
  }, [situation, t]);

  const handleSaveDraft = useCallback(async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/journeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...draft,
          status: "ACTIVE",
          sharingStatus: "PRIVATE"
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || t("journey.messages.save_failed", "Saving the journey failed."));
      }
      setSituation("");
      setDraft(DEFAULT_DRAFT);
      setMode("list");
      setNotice(t("journey.messages.saved", "Private journey saved."));
      await loadJourneys();
    } catch (saveError) {
      setError(saveError.message || t("journey.messages.save_failed", "Saving the journey failed."));
    } finally {
      setBusy(false);
    }
  }, [draft, loadJourneys, t]);

  const handleArchive = useCallback(async (journeyId) => {
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
      setNotice(t("journey.messages.archived", "Journey archived."));
      await loadJourneys();
    } catch (archiveError) {
      setError(archiveError.message || t("journey.messages.archive_failed", "Archiving the journey failed."));
    } finally {
      setBusy(false);
    }
  }, [loadJourneys, t]);

  const handleStartNew = useCallback(() => {
    setMode("start");
    setError("");
    setNotice("");
    setDraft(DEFAULT_DRAFT);
  }, []);

  const handleCancel = useCallback(() => {
    setMode("list");
    setDraft(DEFAULT_DRAFT);
    setError("");
  }, []);

  if (status === "loading" || !isRoleResolved) {
    return (
      <main className={shellClassName}>
        <div className={panelClassName}>
          <div className={contentClassName}>
            <GlassSubpageHeader
              onBack={handleBack}
              backAriaLabel={t("workspace_feature_pages.back_to_workspace", "Back to workspace")}
              holdPressedVisualDisabled
              backClassName="workspace-scroll-back-button"
              rightSlot={headerRightSlot}
            >
              {t("journey.title", "Teekond")}
            </GlassSubpageHeader>
            <div className="grid min-h-[14rem] place-items-center">
            <p className={bodyTextClassName}>
              {t("journey.messages.loading", "Loading journey...")}
            </p>
            </div>
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
              backAriaLabel={t("workspace_feature_pages.back_to_workspace", "Back to workspace")}
              holdPressedVisualDisabled
              backClassName="workspace-scroll-back-button"
              rightSlot={headerRightSlot}
            >
              {t("journey.title", "Teekond")}
            </GlassSubpageHeader>
          <section className={cn(cardClassName, "mx-auto w-full max-w-[42rem]")}>
            <div className="flex items-center gap-[0.65rem]">
              <Lock size={20} aria-hidden="true" />
              <h1 className="m-0 text-[1.38rem] font-[760] tracking-[0] text-[color:var(--title-color,var(--brand-primary))]">{t("journey.title", "Teekond")}</h1>
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

  return (
    <main className={shellClassName}>
      <div className={panelClassName}>
      <div className={contentClassName}>
        <GlassSubpageHeader
          onBack={handleBack}
          backAriaLabel={t("workspace_feature_pages.back_to_workspace", "Back to workspace")}
          holdPressedVisualDisabled
          backClassName="workspace-scroll-back-button"
          rightSlot={headerRightSlot}
        >
          {t("journey.title", "Teekond")}
        </GlassSubpageHeader>

        {!isClientRole ? (
          <RoleScopedWorkspace role={normalizedRole} t={t} locale={locale} />
        ) : (
          <>
        <header className={cn(cardClassName, "md:grid-cols-[1fr_auto] md:items-end")}>
          <div className="grid gap-[0.48rem]">
            <div className="flex flex-wrap items-center gap-[0.55rem] text-[0.82rem] font-[700] uppercase tracking-[0.08em] text-[color:var(--title-color,var(--brand-primary))]">
              <Route size={17} aria-hidden="true" />
              {t("journey.header.eyebrow", "Private journey layer")}
            </div>
            <h1 className={titleClassName}>
              {t("journey.title", "Teekond")}
            </h1>
            <p className={cn(bodyTextClassName, "max-w-[58rem]")}>
              {t("journey.header.description", "Describe the situation, review the draft, and save it as a private journey. The draft is not saved before confirmation.")}
            </p>
          </div>

          <Button onClick={handleStartNew} disabled={busy || mode !== "list"}>
            <Plus size={18} aria-hidden="true" />
            {t("journey.actions.start_new", "Start journey")}
          </Button>
        </header>

        {mode === "list" ? (
          <section className={cn(cardClassName, "gap-[0.78rem]")}>
            <div className="flex flex-wrap items-center justify-between gap-[0.7rem]">
              <div className="grid gap-[0.26rem]">
                <h2 className={sectionTitleClassName}>
                  {t("journey.workspace.client.title", "Teekonna tööpind")}
                </h2>
                <p className={bodyTextClassName}>
                  {t("journey.workspace.client.description", "Siin on sinu privaatsed Teekonnad ja järgmised sammud. Teekonda ei jagata enne sinu eraldi kinnitust.")}
                </p>
              </div>
              {latestJourney ? (
                <Button as="a" href={localizePath(`/teekond/${encodeURIComponent(latestJourney.id)}`, locale)} variant="secondary">
                  {t("journey.workspace.client.continue", "Jätka viimast Teekonda")}
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-[0.56rem]">
              <Button onClick={handleStartNew} variant="secondary" disabled={busy}>
                <Plus size={17} aria-hidden="true" />
                {t("journey.workspace.client.start", "Alusta Teekonda")}
              </Button>
              <Button as="a" href={localizePath("/eelpoordumised", locale)} variant="secondary">
                {t("journey.workspace.client.relatedPreInquiries", "Eelpöördumised")}
              </Button>
              <Button as="a" href={localizePath("/teenusekaart", locale)} variant="secondary">
                {t("chat.workspace.cards.service_map.title", "Teenusekaart")}
              </Button>
              <Button as="a" href={localizePath("/documents", locale)} variant="secondary">
                {t("chat.workspace.cards.documents.title", "Dokumendid")}
              </Button>
            </div>
            <p className={bodyTextClassName}>
              {t("journey.workspace.privacyNote", "Teekond on privaatne. Spetsialist, teenuseosutaja või ruumi liige näeb ainult seda infot, mille sa eraldi kinnitad ja jagad.")}
            </p>
          </section>
        ) : null}

        {error ? (
          <p className={softMessageClassName} role="alert">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className={softMessageClassName} role="status">
            {notice}
          </p>
        ) : null}

        {mode === "start" ? (
          <section className={cardClassName}>
            <div className="flex items-start gap-[0.72rem]">
              <span className={iconBubbleClassName}>
                <WandSparkles size={19} aria-hidden="true" />
              </span>
              <div className="grid gap-[0.34rem]">
                <h2 className={sectionTitleClassName}>
                  {t("journey.sections.start_title", "Describe the situation")}
                </h2>
                <p className={bodyTextClassName}>
                  {t("journey.sections.start_description", "This creates only a temporary structured draft. The database Journey object is created only after save confirmation.")}
                </p>
              </div>
            </div>

            <form className="grid gap-[0.82rem]" onSubmit={handleDraftSubmit}>
              <label className={cn("grid gap-[0.45rem]", labelClassName)} htmlFor="journey-situation">
                {t("journey.labels.situation", "Situation description")}
                <textarea
                  id="journey-situation"
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                  className={cn(textareaClassName, "min-h-[12rem] text-[1rem] font-[500] leading-[1.5]")}
                  placeholder={t("journey.placeholders.situation", "For example: I need help arranging care for a family member and do not know which service or local contact to approach...")}
                  required
                />
              </label>

              <div className="flex flex-wrap gap-[0.62rem]">
                <Button type="submit" disabled={busy || !situation.trim()}>
                  <WandSparkles size={17} aria-hidden="true" />
                  {t("journey.actions.create_draft", "Create draft")}
                </Button>
                <Button variant="secondary" onClick={handleCancel} disabled={busy}>
                  {t("journey.actions.cancel", "Cancel")}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {mode === "review" ? (
          <section className={cardClassName}>
            <div className="flex items-start gap-[0.72rem]">
              <span className={iconBubbleClassName}>
                <FileText size={19} aria-hidden="true" />
              </span>
              <div className="grid gap-[0.34rem]">
                <h2 className={sectionTitleClassName}>
                  {t("journey.sections.review_title", "Review the draft")}
                </h2>
                <p className={bodyTextClassName}>
                  {t("journey.sections.review_description", "Edit the fields before saving. The private journey is saved only after confirmation.")}
                </p>
              </div>
            </div>

            <DraftReview
              draft={draft}
              setDraft={setDraft}
              onSave={handleSaveDraft}
              onCancel={handleCancel}
              busy={busy}
              t={t}
            />
          </section>
        ) : null}

        {mode === "list" ? (
          <div className="grid gap-[1rem] lg:grid-cols-[1fr_0.72fr]">
            <section className={cn(cardClassName, "content-start gap-[0.82rem]")}>
              <div className="flex items-center justify-between gap-[0.8rem]">
                <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                  <Map size={18} aria-hidden="true" />
                  {t("journey.sections.active_title", "Active journey")}
                </h2>
                <span className={badgeClassName}>
                  {activeJourneys.length}
                </span>
              </div>

              <div className={cn("grid gap-[0.74rem]", activeJourneys.length ? null : "place-items-start")}>
                {activeJourneys.length ? activeJourneys.map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    onArchive={handleArchive}
                    busy={busy}
                    t={t}
                    locale={locale}
                  />
                )) : (
                  <p className={softMessageClassName}>
                    {t("journey.messages.no_active", "No private journey has been saved yet.")}
                  </p>
                )}
              </div>
            </section>

            <aside className={cn(cardClassName, "content-start gap-[0.82rem]")}>
              <h2 className={cn(sectionTitleClassName, "flex items-center gap-[0.52rem]")}>
                <ListChecks size={18} aria-hidden="true" />
                {t("journey.sections.archived_title", "Previous journeys")}
              </h2>

              {archivedJourneys.length ? archivedJourneys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  onArchive={handleArchive}
                  busy={busy}
                  t={t}
                  locale={locale}
                />
              )) : (
                <p className={softMessageClassName}>
                  {t("journey.messages.no_archived", "There are no archived journeys.")}
                </p>
              )}
            </aside>
          </div>
        ) : null}
          </>
        )}
      </div>
      </div>
    </main>
  );
}
