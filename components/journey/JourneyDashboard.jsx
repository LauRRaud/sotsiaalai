"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, ListChecks, Lock, Map, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import "@/components/effects/Components/OrbitalMenu/OrbitalMenu.css";
import Button from "@/components/ui/Button";
import BorderGlow from "@/components/ui/BorderGlow";
import { cn } from "@/components/ui/cn";
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
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
import { pushWithTransition } from "@/lib/routeTransition";

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

const ORBIT_BUTTON_GLOW_PROPS = {
  backgroundColor: "transparent",
  borderRadius: 999,
  coneSpread: 20,
  edgeOnly: true,
  fillOpacity: 0,
  glowColor: "358 82 72",
  glowIntensity: 0.68,
  glowRadius: 42,
  edgeSensitivity: 20
};

const ORBIT_BUTTON_GLOW_STYLE = {
  ...fieldEdgeGlowStyle,
  "--edge-only-hot-end": "4%",
  "--edge-only-bright-end": "8%",
  "--edge-only-soft-end": "15%",
  "--edge-only-fade-end": "34%",
  "--edge-only-tail-end": "62%",
  "--edge-only-gap-start": "58%",
  "--edge-only-return-start": "58%",
  "--edge-only-return-soft": "72%",
  "--edge-only-return-bright": "86%",
  "--edge-only-bottom-line-left": "18%",
  "--edge-only-bottom-line-right": "18%",
  "--edge-only-bottom-tail-start": "36%"
};

const DEFAULT_LIFE_DOMAINS = Object.freeze([
  "suhtlemine",
  "vaimne tervis",
  "füüsiline tervis",
  "elukeskkond",
  "hõivatus",
  "vaba aeg ja huvitegevus",
  "igapäevaelu toimingud",
  "võrgustik ja kõrvalabi",
  "kriis ja turvalisus"
]);

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
const textareaClassName = `${textAreaInputBaseClassName} rounded-[0.72rem]`;

const badgeClassName =
  "inline-flex items-center gap-[0.28rem] rounded-full border border-[color:var(--seg-card-border,var(--subpage-card-border))] [background:var(--seg-card-bg,var(--subpage-card-bg))] px-[0.58rem] py-[0.28rem] text-[0.78rem] font-[650] leading-[1.1] text-[color:var(--seg-card-text,var(--subpage-card-text))] shadow-[var(--seg-card-shadow,none)]";

const softMessageClassName =
  `${compactCardClassName} m-0 text-[0.94rem] leading-[1.42] text-[color:var(--subpage-card-text,var(--glass-modal-text))]`;

const iconBubbleClassName =
  "mt-[0.15rem] inline-flex size-[2.35rem] shrink-0 items-center justify-center rounded-full border border-[color:var(--seg-card-border,var(--subpage-card-border))] [background:var(--seg-card-bg,var(--subpage-card-bg))] text-[color:var(--title-color,var(--brand-primary))]";

function normalizeListItems(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : item?.title || item?.description || ""))
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function readDraftLifeDomains(draft) {
  const context = draft?.context && typeof draft.context === "object" && !Array.isArray(draft.context)
    ? draft.context
    : {};
  const lifeDomains = normalizeListItems(context.lifeDomains);
  return lifeDomains.length ? lifeDomains : DEFAULT_LIFE_DOMAINS.slice(0, 4);
}

function ensureDraftActivityLog(draft) {
  const context = draft?.context && typeof draft.context === "object" && !Array.isArray(draft.context)
    ? draft.context
    : {};
  const existing = Array.isArray(context.activityLog) ? context.activityLog : [];
  return {
    ...draft,
    context: {
      ...context,
      activityLog: existing.length
        ? existing
        : [{ type: "created_overview", title: "teekonna ülevaade koostatud" }]
    }
  };
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
          <Button as="a" href={detailHref} size="sm">
            {t("journey.actions.open", "Open journey")}
          </Button>
          {!archived ? (
            <Button
              size="sm"
              onClick={() => onArchive(journey.id)}
              disabled={busy}
              aria-label={t("journey.actions.archive_named", { title: journey.title }, "Archive journey {title}")}
            >
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

function DraftChipList({ items, emptyText }) {
  const normalized = normalizeListItems(items);
  if (!normalized.length) {
    return <p className={bodyTextClassName}>{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-[0.42rem]">
      {normalized.map((item) => (
        <span key={item} className={badgeClassName}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ReviewBlock({ title, children, icon: Icon }) {
  return (
    <section className={cn(compactCardClassName, "grid gap-[0.62rem]")}>
      <h3 className={cn(sectionTitleClassName, "flex items-center gap-[0.48rem] text-[1.02rem]")}>
        {Icon ? <Icon size={17} aria-hidden="true" /> : null}
        {title}
      </h3>
      {children}
    </section>
  );
}

function DraftReview({ draft, setDraft, onSave, onEditDescription, onDecline, busy, t }) {
  const updateField = useCallback((field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }, [setDraft]);

  const lifeDomains = useMemo(() => readDraftLifeDomains(draft), [draft]);
  const suggestedActions = useMemo(() => normalizeListItems(draft.suggestedActions), [draft.suggestedActions]);

  return (
    <form className="grid gap-[1rem]" onSubmit={onSave}>
      <div className="grid gap-[0.48rem] md:max-w-[32rem]">
        <label className={labelClassName} htmlFor="journey-title">
          {t("journey.labels.title", "Teekonna pealkiri")}
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

      <ReviewBlock title={t("journey.review.summary_title", "Olukorra kokkuvõte")} icon={FileText}>
        <label className={labelClassName} htmlFor="journey-summary">
          {t("journey.review.summary_label", "Täpsusta kokkuvõtet, kui soovid")}
        </label>
        <textarea
          id="journey-summary"
          value={draft.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          className={cn(textareaClassName, "min-h-[8rem] text-[1rem] leading-[1.5]")}
          required
        />
      </ReviewBlock>

      <div className="grid gap-[0.76rem] lg:grid-cols-2">
        <ReviewBlock title={t("journey.labels.domains", "Seotud teemad")} icon={Map}>
          <DraftChipList
            items={draft.domains}
            emptyText={t("journey.messages.empty_domains", "Seotud teemasid ei ole veel lisatud.")}
          />
        </ReviewBlock>
        <ReviewBlock title={t("journey.review.life_domains", "Eluvaldkonnad")} icon={Route}>
          <DraftChipList items={lifeDomains} emptyText={t("journey.review.empty_life_domains", "Eluvaldkonnad täpsustuvad hiljem.")} />
          <p className={bodyTextClassName}>
            {t("journey.review.life_domains_note", "See on ainult olukorra korrastamise abikiht, mitte ametlik hinnang.")}
          </p>
        </ReviewBlock>
        <ReviewBlock title={t("journey.review.missing_title", "Mis võib veel puudu olla?")} icon={ListChecks}>
          <DraftChipList
            items={draft.missingInfo}
            emptyText={t("journey.messages.empty_missing_info", "Puuduolevat infot ei ole veel lisatud.")}
          />
        </ReviewBlock>
        <ReviewBlock title={t("journey.review.actions_title", "Võimalikud järgmised sammud")} icon={Check}>
          {suggestedActions.length ? (
            <div className="grid gap-[0.46rem]">
              {suggestedActions.map((action) => (
                <p key={action} className={bodyTextClassName}>{action}</p>
              ))}
            </div>
          ) : (
            <p className={bodyTextClassName}>
              {t("journey.messages.empty_suggested_actions", "Järgmised sammud täpsustuvad pärast salvestamist.")}
            </p>
          )}
          <div className="flex flex-wrap gap-[0.5rem] pt-[0.15rem]">
            <Button type="button" variant="secondary" size="sm" onClick={() => updateField("primaryPath", "SERVICE_MAP")}>
              {t("journey.service_map.open", "Ava teenusekaart")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => updateField("primaryPath", "PRE_INQUIRY")}>
              {t("journey.pre_inquiry.open", "Koosta eelpöördumine")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => updateField("primaryPath", "DOCUMENT")}>
              {t("journey.review.add_document", "Lisa dokument")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => updateField("primaryPath", "HELP_REQUEST")}>
              {t("journey.review.create_help_request", "Loo abisoov")}
            </Button>
          </div>
        </ReviewBlock>
      </div>

      <p className={softMessageClassName}>
        {t("journey.review.privacy_note", "Teekond on privaatne. Teised näevad ainult seda infot, mille sa hiljem eraldi kinnitad ja jagad.")}
      </p>

      <div className="flex flex-wrap gap-[0.62rem]">
        <Button type="submit" disabled={busy}>
          <Check size={17} aria-hidden="true" />
          {t("journey.actions.save_private", "Salvesta teekond")}
        </Button>
        <Button type="button" variant="secondary" onClick={onEditDescription} disabled={busy}>
          {t("journey.actions.edit_description", "Muuda kirjeldust")}
        </Button>
        <Button type="button" variant="secondary" onClick={onDecline} disabled={busy}>
          {t("journey.actions.decline", "Loobu")}
        </Button>
      </div>
    </form>
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
            title={t("chat.workspace.cards.document_drafting.title", "Koosta dokument")}
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

function EmptyJourneyStart({ onStart, disabled, t }) {
  const label = t("journey.empty_start.label", "Alusta teekonda");

  return (
    <section className="journey-empty-start grid min-h-[min(24rem,calc(100dvh-7rem))] place-items-center">
      <div className="profile-email-dock-wrapper profile-orbit-menu-wrapper journey-empty-orbit-wrapper pointer-events-auto">
        <div className="profile-orbit-menu journey-empty-orbit-menu relative grid place-items-center w-[var(--orbit-center-size)] h-[var(--orbit-center-size)]">
          <div className="profile-orbit-menu__center-shell group relative grid place-items-center w-[var(--orbit-center-size)] h-[var(--orbit-center-size)] rounded-full overflow-visible z-[5]">
            <div className="profile-orbit-menu__center-pulse relative grid place-items-center w-full h-full rounded-full overflow-visible">
              <BorderGlow
                as="button"
                type="button"
                {...ORBIT_BUTTON_GLOW_PROPS}
                style={ORBIT_BUTTON_GLOW_STYLE}
                className="ui-glow-button-frame ui-glow-button-control profile-orbit-edge-glow profile-orbit-menu__center dock-item relative isolate overflow-visible w-[var(--orbit-center-size)] h-[var(--orbit-center-size)] rounded-full p-0 grid place-items-center z-[1] cursor-[var(--cursor-pointer)] [transform:translateZ(0)_scale(1)] [transform-origin:center] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent [will-change:transform]"
                onClick={onStart}
                disabled={disabled}
                aria-label={label}
              >
                <span className="profile-orbit-menu__hub-icon relative z-[1] grid place-items-center w-full h-full" aria-hidden="true">
                  <Route
                    className="journey-empty-orbit-icon absolute left-1/2 top-1/2 block h-[var(--orbit-center-icon-size)] w-[var(--orbit-center-icon-size)] -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center transition-none z-[3]"
                    strokeWidth={1.72}
                    aria-hidden="true"
                    focusable="false"
                  />
                </span>
              </BorderGlow>
            </div>
            <span className="dock-label profile-orbit-item-label journey-empty-orbit-label absolute left-1/2 top-[calc(100%+0.86rem)] -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none w-max max-w-[8.2rem] whitespace-normal leading-[1.05] text-[clamp(1.05rem,2.4vw,1.3rem)] tracking-[0.02em] text-center [text-align-last:center] antialiased z-[20] transition-opacity duration-[260ms] ease-out">
              {label}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JourneyDashboard({ embedded = false, onBack = null, hideHeader = false, roleOverride = "" } = {}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { status } = useSession();
  const { effectiveRole, isRoleResolved } = useEffectiveRole();
  const [journeys, setJourneys] = useState([]);
  const [mode, setMode] = useState("list");
  const [situation, setSituation] = useState("");
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const situationInputRef = useRef(null);

  const activeJourneys = useMemo(
    () => journeys.filter((journey) => journey.status !== "ARCHIVED"),
    [journeys]
  );
  const archivedJourneys = useMemo(
    () => journeys.filter((journey) => journey.status === "ARCHIVED"),
    [journeys]
  );
  const normalizedRole = String(roleOverride || effectiveRole || "CLIENT").toUpperCase();
  const isClientRole = normalizedRole === "CLIENT";
  const latestJourney = activeJourneys[0] || journeys[0] || null;
  const headerRightSlot = useMemo(() => (
    <span className="inline-flex items-center gap-[0.52rem]">
      <DashboardInfoTrigger
        infoId="journey"
        title={t("journey.title", "Teekond")}
        label={t("journey.info.label", "Open journey info")}
        className={dashboardInfoTriggerCornerClassName}
      />
    </span>
  ), [t]);

  const handleBack = useCallback(() => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

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
  }, [locale, onBack, router]);

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

  useEffect(() => {
    if (mode !== "start") return;
    const frame = window.requestAnimationFrame(() => {
      situationInputRef.current?.focus?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

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
        throw new Error(payload.message || t("journey.messages.draft_failed", "Teekonna ülevaate koostamine ebaõnnestus."));
      }
      setDraft(ensureDraftActivityLog({
        ...DEFAULT_DRAFT,
        ...payload.draft
      }));
      setMode("review");
    } catch (draftError) {
      setError(draftError.message || t("journey.messages.draft_failed", "Teekonna ülevaate koostamine ebaõnnestus."));
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
          ...ensureDraftActivityLog(draft),
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
      pushWithTransition(router, localizePath(`/teekond/${encodeURIComponent(payload.journey.id)}`, locale), {
        persistGlassRingTilt: false
      });
    } catch (saveError) {
      setError(saveError.message || t("journey.messages.save_failed", "Saving the journey failed."));
    } finally {
      setBusy(false);
    }
  }, [draft, locale, router, t]);

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

  const handleEditDescription = useCallback(() => {
    setMode("start");
    setError("");
    setNotice("");
  }, []);

  const renderPage = (children, options = {}) => {
    const minimal = options.minimal === true;
    const content = (
      <div className={cn(contentClassName, minimal ? "min-h-[min(34rem,calc(100dvh-4rem))] place-items-center content-center" : null)}>
        {!hideHeader && !minimal ? (
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("workspace_feature_pages.back_to_workspace", "Back to workspace")}
            holdPressedVisualDisabled
            backClassName="workspace-scroll-back-button"
            rightSlot={headerRightSlot}
          >
            {t("journey.title", "Teekond")}
          </GlassSubpageHeader>
        ) : null}
        {children}
      </div>
    );

    if (embedded) {
      return (
        <div className="workspace-feature-embedded">
          {content}
        </div>
      );
    }

    return (
      <main className={shellClassName}>
        <div className={panelClassName}>
          {content}
        </div>
      </main>
    );
  };

  if (status === "loading" || !isRoleResolved) {
    return renderPage(
      <div className="grid min-h-[14rem] place-items-center">
        <p className={bodyTextClassName}>
          {t("journey.messages.loading", "Laen teekonda...")}
        </p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return renderPage(
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
    );
  }

  if (isClientRole && mode === "list" && !activeJourneys.length && !archivedJourneys.length) {
    return renderPage(
      <>
        {error ? (
          <p className={softMessageClassName} role="alert">
            {error}
          </p>
        ) : null}
        <EmptyJourneyStart onStart={handleStartNew} disabled={busy} t={t} />
      </>,
      { minimal: true }
    );
  }

  return renderPage(
    <>
        {!isClientRole ? (
          <RoleScopedWorkspace role={normalizedRole} t={t} locale={locale} />
        ) : (
          <>
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
                <Button as="a" href={localizePath(`/teekond/${encodeURIComponent(latestJourney.id)}`, locale)}>
                  {t("journey.workspace.client.continue", "Jätka viimast Teekonda")}
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-[0.56rem]">
              <Button onClick={handleStartNew} disabled={busy}>
                {t("journey.workspace.client.start", "Alusta Teekonda")}
              </Button>
              <Button as="a" href={localizePath("/eelpoordumised", locale)}>
                {t("journey.workspace.client.relatedPreInquiries", "Eelpöördumised")}
              </Button>
              <Button as="a" href={localizePath("/teenusekaart", locale)}>
                {t("chat.workspace.cards.service_map.title", "Teenusekaart")}
              </Button>
              <Button as="a" href={localizePath("/documents", locale)}>
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
          <section className="journey-morph-panel origin-center mx-auto grid w-full max-w-[42rem] gap-[1.15rem] px-[0.2rem] py-[0.35rem]">
            <p className={cn(bodyTextClassName, "max-w-[38rem] text-[1.02rem] opacity-[0.9]")}>
              {t("journey.sections.start_description", "Tere. Alustame sinu teekonda. Kirjelda oma olukorda oma sõnadega. Sa ei pea kõike teadma ega õigesti sõnastama — kirjuta lihtsalt, mis toimub.")}
            </p>

            <form className="grid gap-[1rem]" onSubmit={handleDraftSubmit}>
              <label className={cn("grid gap-[0.45rem]", labelClassName)} htmlFor="journey-situation">
                {t("journey.labels.situation", "Olukorra kirjeldus")}
                <textarea
                  id="journey-situation"
                  ref={situationInputRef}
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                  className={cn(textareaClassName, "min-h-[12rem] text-[1rem] font-[500] leading-[1.5] transition-opacity duration-500 motion-reduce:transition-opacity")}
                  placeholder={t("journey.placeholders.situation", "Näiteks: hooldan ema ja ei jaksa enam üksi. Ta vajab abi pesemisel ja söögi tegemisel. Ma ei tea, kas peaksin pöörduma KOV-i või teenuseosutaja poole.")}
                  required
                />
              </label>

              <div className="flex justify-center pt-[0.2rem]">
                <Button type="submit" disabled={busy || !situation.trim()}>
                  {t("journey.empty_start.label", "Alusta teekonda")}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {mode === "review" ? (
          <section className={cn(cardClassName, "journey-review-panel")}>
            <div className="flex items-start gap-[0.72rem]">
              <span className={iconBubbleClassName}>
                <FileText size={19} aria-hidden="true" />
              </span>
              <div className="grid gap-[0.34rem]">
                <h2 className={sectionTitleClassName}>
                  {t("journey.sections.review_title", "Ülevaade enne salvestamist")}
                </h2>
                <p className={bodyTextClassName}>
                  {t("journey.sections.review_description", "Vaata üle, kas SotsiaalAI korrastas olukorra õigesti. Teekond salvestatakse alles siis, kui kinnitad.")}
                </p>
              </div>
            </div>

            <DraftReview
              draft={draft}
              setDraft={setDraft}
              onSave={handleSaveDraft}
              onEditDescription={handleEditDescription}
              onDecline={handleCancel}
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
      </>
  );
}
