"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPageTitleClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageCardClassName,
  glassSubpageContentWideClassName,
  glassSubpageSurfaceScopeClassName
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import ServiceMapLeaflet from "./ServiceMapLeaflet";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";

const panelClassName =
  `relative z-[21] w-full !max-w-[66rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] [border:none] ` +
  `[background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.35rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.38rem,1.5vw,0.54rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.38rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName} ${glassSubpageSurfaceScopeClassName}`;

const titleClassName =
  `invite-modal-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ${glassPageTitleClassName} ` +
  "w-full max-[768px]:!mt-0 max-[768px]:!mb-0";

const titleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";

const contentClassName =
  `${glassSubpageContentWideClassName} mx-auto grid gap-[1rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:gap-[0.82rem] max-[768px]:px-0 max-[768px]:pb-[0.88rem]`;

const cardClassName =
  `${glassSubpageCardClassName} rounded-[1.05rem] px-[1rem] py-[0.92rem] max-[768px]:rounded-[0.9rem] max-[768px]:px-[0.78rem] max-[768px]:py-[0.78rem]`;

const sectionTitleClassName =
  "m-0 text-[1.18rem] font-[650] leading-[1.18] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";

const bodyTextClassName =
  "m-0 text-[1.02rem] leading-[1.52] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]";

const fieldClassName =
  "min-h-[3rem] rounded-[0.86rem] border border-[color:var(--subpage-card-border,transparent)] bg-[rgba(255,255,255,0.06)] px-[0.82rem] py-[0.62rem] text-[1rem] leading-[1.3] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] placeholder:text-[color:color-mix(in_srgb,var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))_58%,transparent)] light:bg-[rgba(255,255,255,0.58)] light:text-[color:var(--text-strong,#1f2937)]";

const chipClassName =
  "inline-flex min-h-[2.42rem] items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.36rem] text-[0.96rem] font-[600] leading-[1.15] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] light:bg-[rgba(255,255,255,0.6)] light:text-[color:var(--text-strong,#1f2937)]";

const ADMIN_WORKSPACE_ROLES = Object.freeze([
  "CLIENT",
  "SOCIAL_WORKER",
  "SERVICE_PROVIDER"
]);

function readText(t, key, fallback) {
  return typeof t === "function" ? t(key, fallback) : fallback;
}

function normalizeWorkspaceRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  return ADMIN_WORKSPACE_ROLES.includes(normalized) ? normalized : "SOCIAL_WORKER";
}

function roleLabel(t, role) {
  if (role === "CLIENT") {
    return readText(t, "workspace_feature_pages.roles.client", "Pöörduja");
  }
  if (role === "SERVICE_PROVIDER") {
    return readText(t, "workspace_feature_pages.roles.service_provider", "Teenuseosutaja");
  }
  return readText(t, "workspace_feature_pages.roles.social_worker", "Sotsiaaltöötaja");
}

function workspaceReturn(locale, router) {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
        JSON.stringify({ ts: Date.now() })
      );
    } catch {}
  }
  pushWithTransition(router, localizePath("/vestlus", locale), {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  });
}

function SectionCard({ title, children, className }) {
  return (
    <section className={cn(cardClassName, "grid gap-[0.76rem]", className)}>
      <h2 className={sectionTitleClassName}>{title}</h2>
      {children}
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="grid gap-[0.34rem] text-[0.9rem] font-[620] leading-[1.2] opacity-[0.9]">
      {children}
    </label>
  );
}

function AdminRoleSelector({ t, value, onChange }) {
  return (
    <label className="mx-auto flex w-full max-w-[28rem] flex-wrap items-center justify-center gap-[0.5rem] rounded-[1rem] border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.06)] px-[0.78rem] py-[0.56rem] text-[0.92rem] font-[640] leading-[1.2] light:bg-[rgba(255,255,255,0.56)]">
      <span>{readText(t, "workspace_feature_pages.admin_role.label", "Admini tööroll")}</span>
      <select
        className={cn(fieldClassName, "min-h-[2.35rem] max-w-[14rem] py-[0.36rem] text-[0.94rem]")}
        value={value}
        onChange={(event) => onChange(normalizeWorkspaceRole(event.target.value))}
      >
        {ADMIN_WORKSPACE_ROLES.map((role) => (
          <option key={role} value={role}>
            {roleLabel(t, role)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatDate(value, locale = "et") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function buildLocalPreInquiryDraft({ topic, situation, recipient }) {
  const subject = topic?.trim() || "Eelpöördumine";
  const greeting = recipient?.title
    ? `Lugupeetud ${recipient.title}`
    : "Tere";
  const lines = [
    greeting,
    "",
    `Soovin pöörduda teemal: ${subject}.`,
    "",
    "Olukorra kirjeldus:",
    situation?.trim() || "",
    "",
    recipient?.type === "SERVICE_PROVIDER"
      ? "Palun andke teada, kas teie teenus võiks sellises olukorras sobida ning millised on tingimused, vabad ajad ja vajadusel suunamise või otsuse nõuded."
      : "Palun aidata välja selgitada, millised toetused või teenused võiksid minu olukorras sobida ning millised oleksid järgmised sammud.",
    "",
    "Lugupidamisega"
  ].filter((line, index, source) => line || source[index - 1] !== "");
  return lines.join("\n");
}

function getPreInquiryChannelLabel(t, channel) {
  if (channel === "EXTERNAL_EMAIL") {
    return readText(t, "workspace_feature_pages.pre_inquiries.delivery.external_email", "E-post");
  }
  return readText(t, "workspace_feature_pages.pre_inquiries.delivery.internal", "SotsiaalAI sisene");
}

function getPreInquiryRecipientTypeLabel(t, entry) {
  if (entry?.type === "SERVICE_PROVIDER") {
    return readText(t, "workspace_feature_pages.pre_inquiries.recipient.provider", "Teenuseosutaja");
  }
  if (entry?.type === "KOV_GENERAL_CONTACT") {
    return readText(t, "workspace_feature_pages.pre_inquiries.recipient.kov_general", "KOV üldkontakt");
  }
  return readText(t, "workspace_feature_pages.pre_inquiries.recipient.kov", "KOV kontakt");
}

function getPreInquiryRecipientSubtitle(entry) {
  if (!entry) return "";
  if (entry.type === "SERVICE_PROVIDER") {
    return entry.description || entry.providerProfile?.shortDescription || entry.providerServices?.join(", ") || "";
  }
  return entry.description || entry.address || "Sotsiaalvaldkonna kontakt";
}

function buildPreInquiryDownloadName(topic) {
  const slug = String(topic || "eelpoordumine")
    .toLocaleLowerCase("et")
    .replace(/[^a-z0-9õäöüšž]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return `${slug || "eelpoordumine"}.txt`;
}

function PreInquiriesSurface({ t, activeRole = "SOCIAL_WORKER", isAdmin = false }) {
  const [activeInquiryId, setActiveInquiryId] = useState("");
  const [topic, setTopic] = useState("");
  const [situation, setSituation] = useState("");
  const [recipientType, setRecipientType] = useState("KOV_CONTACT");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [draft, setDraft] = useState("");
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantReasoning, setAssistantReasoning] = useState("");
  const [assistantWarnings, setAssistantWarnings] = useState([]);
  const [assistantSuggestions, setAssistantSuggestions] = useState([]);
  const [showMoreContacts, setShowMoreContacts] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assisting, setAssisting] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [acceptsPreInquiries, setAcceptsPreInquiries] = useState(false);
  const [draftTouched, setDraftTouched] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [entriesResponse, inquiriesResponse, preferencesResponse] = await Promise.all([
          fetch("/api/service-map/entries?limit=250&includeUnlocated=1&includeNeedsReview=1", { cache: "no-store" }),
          fetch("/api/pre-inquiries", { cache: "no-store" }),
          fetch("/api/pre-inquiries/preferences", { cache: "no-store" })
        ]);
        const entriesPayload = await entriesResponse.json().catch(() => ({}));
        const inquiriesPayload = await inquiriesResponse.json().catch(() => ({}));
        const preferencesPayload = await preferencesResponse.json().catch(() => ({}));
        if (!entriesResponse.ok) {
          throw new Error(entriesPayload?.message || readText(t, "workspace_feature_pages.service_map.errors.load_failed", "Recipients could not be loaded."));
        }
        if (!inquiriesResponse.ok) {
          throw new Error(inquiriesPayload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.load_failed", "Pre-inquiries could not be loaded."));
        }
        if (!preferencesResponse.ok) {
          throw new Error(preferencesPayload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.preferences_load_failed", "Preferences could not be loaded."));
        }
        if (!cancelled) {
          setEntries(Array.isArray(entriesPayload?.entries) ? entriesPayload.entries : []);
          setInquiries(Array.isArray(inquiriesPayload?.inquiries) ? inquiriesPayload.inquiries : []);
          setAcceptsPreInquiries(Boolean(preferencesPayload?.preferences?.acceptsPreInquiries));
        }
      } catch (loadError) {
        if (!cancelled) {
          setEntries([]);
          setInquiries([]);
          setError(loadError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.load_failed", "Pre-inquiries could not be loaded."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const recipientEntries = useMemo(() => {
    const query = recipientQuery.trim().toLocaleLowerCase("et");
    return entries.filter((entry) => {
      const isProvider = entry.type === "SERVICE_PROVIDER";
      if (recipientType === "SERVICE_PROVIDER" && !isProvider) return false;
      if (recipientType === "KOV_CONTACT" && isProvider) return false;
      if (!query) return true;
      return [
        entry.title,
        entry.email,
        entry.phone,
        entry.address,
        entry.municipalityName,
        entry.county,
        entry.providerProfile?.organizationName,
        ...(entry.providerProfile?.services || [])
      ].join(" ").toLocaleLowerCase("et").includes(query);
    });
  }, [entries, recipientQuery, recipientType]);

  const selectedRecipient = useMemo(
    () => entries.find((entry) => entry.id === selectedRecipientId) || null,
    [entries, selectedRecipientId]
  );

  const recommendedRecipients = useMemo(() => {
    const source = assistantSuggestions.length ? assistantSuggestions : recipientEntries;
    const seen = new Set();
    return source.filter((entry) => {
      if (!entry?.id || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }, [assistantSuggestions, recipientEntries]);

  const visibleRecommendedRecipients = showMoreContacts
    ? recommendedRecipients.slice(0, 12)
    : recommendedRecipients.slice(0, 3);

  useEffect(() => {
    if (draftTouched) return;
    setDraft(buildLocalPreInquiryDraft({
      topic,
      situation,
      recipient: selectedRecipient
    }));
  }, [draftTouched, selectedRecipient, situation, topic]);

  function handleNewInquiry() {
    setActiveInquiryId("");
    setTopic("");
    setSituation("");
    setRecipientType("KOV_CONTACT");
    setRecipientQuery("");
    setSelectedRecipientId("");
    setDraft("");
    setAssistantInput("");
    setAssistantMessage("");
    setAssistantReasoning("");
    setAssistantWarnings([]);
    setAssistantSuggestions([]);
    setShowMoreContacts(false);
    setDraftTouched(false);
    setNotice("");
    setError("");
  }

  function handleOpenInquiry(inquiry) {
    setActiveInquiryId(inquiry.id || "");
    setTopic(inquiry.topic || "");
    setSituation(inquiry.situation || "");
    setRecipientType(inquiry.recipientType || "KOV_CONTACT");
    setRecipientQuery("");
    setSelectedRecipientId(inquiry.recipientEntryId || "");
    setDraft(inquiry.userEditedDraft || inquiry.generatedDraft || "");
    setAssistantInput("");
    setAssistantMessage("");
    setAssistantReasoning("");
    setAssistantWarnings([]);
    setAssistantSuggestions([]);
    setShowMoreContacts(false);
    setDraftTouched(true);
    setNotice("");
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving || !situation.trim()) return;

    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(activeInquiryId ? `/api/pre-inquiries/${activeInquiryId}` : "/api/pre-inquiries", {
        method: activeInquiryId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic,
          situation,
          recipientType,
          recipientEntryId: selectedRecipient?.id || null,
          selectedRecipientName: selectedRecipient?.title || "",
          selectedRecipientEmail: selectedRecipient?.email || "",
          userEditedDraft: draft,
          status: "DRAFT"
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.save_failed", "Pre-inquiry could not be saved."));
      }
      const inquiry = payload?.inquiry || null;
      if (inquiry) {
        setInquiries((current) => [inquiry, ...current.filter((item) => item.id !== inquiry.id)]);
        setActiveInquiryId(inquiry.id || "");
        setDraft(inquiry.userEditedDraft || inquiry.generatedDraft || draft);
        setDraftTouched(true);
      }
      setNotice(readText(t, "workspace_feature_pages.pre_inquiries.save_success", "Pre-inquiry saved."));
    } catch (saveError) {
      setError(saveError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.save_failed", "Pre-inquiry could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!draft.trim() || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(draft);
    setNotice(readText(t, "workspace_feature_pages.pre_inquiries.copy_success", "Draft copied."));
  }

  function handleDownload() {
    if (!draft.trim() || typeof window === "undefined") return;
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = buildPreInquiryDownloadName(topic);
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setNotice(readText(t, "workspace_feature_pages.pre_inquiries.download_success", "Draft downloaded."));
  }

  async function handleSavePreferences() {
    if (savingPreferences) return;
    setSavingPreferences(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/pre-inquiries/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ acceptsPreInquiries })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.preferences_save_failed", "Preferences could not be saved."));
      }
      setAcceptsPreInquiries(Boolean(payload?.preferences?.acceptsPreInquiries));
      setNotice(readText(t, "workspace_feature_pages.pre_inquiries.preferences_save_success", "Preferences saved."));
    } catch (preferencesError) {
      setError(preferencesError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.preferences_save_failed", "Preferences could not be saved."));
    } finally {
      setSavingPreferences(false);
    }
  }

  async function handleAskAssistant(event) {
    event?.preventDefault();
    if (assisting || (!assistantInput.trim() && !situation.trim())) return;
    const message = assistantInput.trim();
    const nextSituation = [situation.trim(), message].filter(Boolean).join(situation.trim() && message ? "\n\n" : "");
    setAssisting(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/pre-inquiries/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic,
          situation: nextSituation,
          assistantMessage: message,
          recipientType: selectedRecipientId ? recipientType : "",
          activeRole
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.assist_failed", "Assistant could not prepare the pre-inquiry."));
      }
      const suggestions = Array.isArray(payload?.recommendedRecipients)
        ? payload.recommendedRecipients
        : Array.isArray(payload?.suggestions)
          ? payload.suggestions
          : [];
      setSituation(nextSituation);
      setAssistantInput("");
      setAssistantMessage(payload?.message || "");
      setAssistantReasoning(payload?.reasoningText || payload?.message || "");
      setAssistantWarnings(Array.isArray(payload?.warnings) ? payload.warnings : []);
      setAssistantSuggestions(suggestions);
      setShowMoreContacts(false);
      if (payload?.draftBody || payload?.draft) {
        setDraft(payload.draftBody || payload.draft);
        setDraftTouched(true);
      }
      const firstSuggestion = suggestions[0] || null;
      if (firstSuggestion?.id) {
        setSelectedRecipientId(firstSuggestion.id);
        setRecipientType(firstSuggestion.type === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "KOV_CONTACT");
      }
    } catch (assistError) {
      setError(assistError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.assist_failed", "Assistant could not prepare the pre-inquiry."));
    } finally {
      setAssisting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto grid w-full max-w-[62rem] gap-[1rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.54rem]">
        <p className={bodyTextClassName}>
          {`${roleLabel(t, activeRole)} · ${activeInquiryId
            ? readText(t, "workspace_feature_pages.pre_inquiries.editing_existing", "Avatud salvestatud eelpöördumine")
            : readText(t, "workspace_feature_pages.pre_inquiries.creating_new", "Uus eelpöördumine")}`}
        </p>
        <Button type="button" onClick={handleNewInquiry}>
          {readText(t, "workspace_feature_pages.pre_inquiries.actions.new", "Uus")}
        </Button>
      </div>

      <p className="m-0 rounded-[1rem] border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.055)] px-[0.88rem] py-[0.62rem] text-[0.98rem] leading-[1.42] opacity-[0.86] light:bg-[rgba(255,255,255,0.62)]">
        {readText(t, "workspace_feature_pages.pre_inquiries.disclaimer", "Eelpöördumine ei asenda ametlikku abivajaduse väljaselgitamist ega otsustamist.")}
      </p>

      {loading ? <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.loading", "Laen eelpöördumisi...")}</p> : null}
      {error ? (
        <p className="rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[0.86rem] py-[0.58rem] text-[0.96rem] leading-[1.35] text-[rgba(255,223,218,0.96)] light:bg-[rgba(255,249,248,0.94)] light:text-[#b2615d]">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-[1rem] border border-[rgba(88,148,118,0.22)] bg-[rgba(18,44,34,0.82)] px-[0.86rem] py-[0.58rem] text-[0.96rem] leading-[1.35] text-[rgba(223,246,236,0.96)] light:bg-[rgba(247,252,249,0.94)] light:text-[#4d7b67]">
          {notice}
        </p>
      ) : null}

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.assistant", "Vestlus assistendiga")}>
        <p className={bodyTextClassName}>
          {readText(
            t,
            "workspace_feature_pages.pre_inquiries.assistant_lead",
            "Kirjelda olukorda oma sõnadega. Mõtle eelkõige viimase aja raskustele, aga lisa ka pikem taust, kui probleem on kestnud kauem või kordub."
          )}
        </p>
        <div className="grid gap-[0.62rem] rounded-[1rem] border border-[rgba(148,163,184,0.16)] bg-[rgba(255,255,255,0.04)] p-[0.78rem] light:bg-[rgba(255,255,255,0.58)]">
          <div className="grid min-h-[9rem] content-start gap-[0.54rem]">
            {situation.trim() ? (
              <div className="justify-self-end rounded-[0.9rem] border border-[rgba(208,116,108,0.14)] bg-[rgba(208,116,108,0.1)] px-[0.78rem] py-[0.56rem] text-[0.96rem] leading-[1.42] light:bg-[rgba(249,236,234,0.86)]">
                {situation}
              </div>
            ) : null}
            <div className="max-w-[85%] rounded-[0.9rem] border border-[rgba(72,146,150,0.2)] bg-[rgba(72,146,150,0.1)] px-[0.78rem] py-[0.56rem] text-[0.96rem] leading-[1.42] light:bg-[rgba(234,250,250,0.86)]">
              {assistantMessage || readText(t, "workspace_feature_pages.pre_inquiries.assistant_prompt", "Tere. Kirjelda oma olukorda ning vajadusel küsin täpsustusi KOV-i, kiireloomulisuse ja soovitud tulemuse kohta.")}
            </div>
          </div>
          <div className="grid gap-[0.5rem] sm:grid-cols-[1fr_auto] sm:items-end">
            <textarea
              className={cn(fieldClassName, "min-h-[4.8rem] resize-y")}
              value={assistantInput}
              onChange={(event) => setAssistantInput(event.target.value)}
              placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.assistant", "Kirjuta oma vastus...")}
            />
            <Button type="button" disabled={assisting || (!assistantInput.trim() && !situation.trim())} onClick={handleAskAssistant}>
              {assisting
                ? readText(t, "workspace_feature_pages.pre_inquiries.actions.assisting", "Otsin...")
                : readText(t, "workspace_feature_pages.pre_inquiries.actions.send", "Saada")}
            </Button>
          </div>
        </div>

        {assistantReasoning ? <p className={bodyTextClassName}>{assistantReasoning}</p> : null}
        {assistantWarnings.length ? (
          <div className="grid gap-[0.34rem]">
            {assistantWarnings.map((warning) => (
              <p key={warning} className="m-0 rounded-[0.86rem] border border-[rgba(208,116,108,0.18)] bg-[rgba(208,116,108,0.08)] px-[0.74rem] py-[0.48rem] text-[0.9rem] leading-[1.34] light:bg-[rgba(255,248,247,0.78)]">
                {warning}
              </p>
            ))}
          </div>
        ) : null}

        {activeRole === "SOCIAL_WORKER" ? (
          <div className="grid gap-[0.48rem] rounded-[0.95rem] border border-[rgba(148,163,184,0.16)] bg-[rgba(255,255,255,0.045)] px-[0.78rem] py-[0.62rem] light:bg-[rgba(255,255,255,0.58)]">
            <label className="flex items-center gap-[0.58rem] text-[0.98rem] font-[620]">
              <input
                type="checkbox"
                checked={acceptsPreInquiries}
                onChange={(event) => setAcceptsPreInquiries(event.target.checked)}
              />
              <span>{readText(t, "workspace_feature_pages.pre_inquiries.receiving.accepts_platform", "Võtan eelpöördumisi platvormil vastu")}</span>
            </label>
            <p className="m-0 text-[0.9rem] leading-[1.36] opacity-[0.76]">
              {isAdmin
                ? readText(t, "workspace_feature_pages.pre_inquiries.receiving.admin_note", "Admini rollivalik näitab töövaadet; linnuke salvestub ainult admini enda kasutajakontole.")
                : readText(t, "workspace_feature_pages.pre_inquiries.receiving.note", "Kui linnuke on märgitud, saab sinu kontoga seotud e-postile suunatud eelpöördumine tulla platvormisisese pöördumisena.")}
            </p>
            <Button type="button" disabled={savingPreferences} onClick={handleSavePreferences}>
              {savingPreferences
                ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
                : readText(t, "workspace_feature_pages.pre_inquiries.actions.save_preferences", "Salvesta vastuvõtt")}
            </Button>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.recipient", "Sobivad kontaktid")}>
        <p className={bodyTextClassName}>
          {readText(t, "workspace_feature_pages.pre_inquiries.recipients_lead", "Kontaktid tulevad teenusekaardi struktureeritud andmekihist. SotsiaalAI ei ole selles nimekirjas eelpöördumise adressaat.")}
        </p>
        <div className="grid gap-[0.62rem] sm:grid-cols-[auto_1fr] sm:items-end">
          <div className="flex flex-wrap gap-[0.46rem]" aria-label={readText(t, "workspace_feature_pages.pre_inquiries.fields.recipient_type", "Adressaadi tüüp")}>
            <button type="button" className={cn(chipClassName, recipientType === "KOV_CONTACT" && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]")} onClick={() => { setRecipientType("KOV_CONTACT"); setSelectedRecipientId(""); setShowMoreContacts(false); setDraftTouched(false); }}>
              {readText(t, "workspace_feature_pages.pre_inquiries.recipient.kov", "KOV kontakt")}
            </button>
            <button type="button" className={cn(chipClassName, recipientType === "SERVICE_PROVIDER" && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]")} onClick={() => { setRecipientType("SERVICE_PROVIDER"); setSelectedRecipientId(""); setShowMoreContacts(false); setDraftTouched(false); }}>
              {readText(t, "workspace_feature_pages.pre_inquiries.recipient.provider", "Teenuseosutaja")}
            </button>
          </div>
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.recipient_search", "Otsi adressaati")}</span>
            <input className={fieldClassName} value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.recipient", "KOV, teenuseosutaja või piirkond")} />
          </Label>
        </div>
        <div className="grid gap-[0.52rem]">
          {visibleRecommendedRecipients.length ? visibleRecommendedRecipients.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={cn(
                "grid gap-[0.32rem] rounded-[0.92rem] border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.06)] px-[0.82rem] py-[0.68rem] text-left transition hover:bg-[rgba(255,255,255,0.1)] light:bg-[rgba(255,255,255,0.58)] light:hover:bg-[rgba(255,255,255,0.8)]",
                selectedRecipientId === entry.id && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]"
              )}
              onClick={() => {
                setSelectedRecipientId(entry.id);
                setRecipientType(entry.type === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "KOV_CONTACT");
                setDraftTouched(false);
              }}
            >
              <span className="flex flex-wrap items-center justify-between gap-[0.5rem]">
                <span className="text-[1.02rem] font-[720] leading-[1.16]">{entry.title}</span>
                <span className="rounded-full bg-[rgba(72,146,150,0.13)] px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1] text-[color:var(--title-color,var(--brand-primary,#c57171))]">
                  {getPreInquiryRecipientTypeLabel(t, entry)}
                </span>
              </span>
              <span className="text-[0.92rem] leading-[1.28] opacity-[0.78]">{getPreInquiryRecipientSubtitle(entry)}</span>
              <span className="text-[0.86rem] leading-[1.25] opacity-[0.7]">
                {[
                  getPreInquiryChannelLabel(t, entry.deliveryChannel),
                  entry.email,
                  entry.municipalityName || entry.county
                ].filter(Boolean).join(" · ")}
              </span>
            </button>
          )) : (
            <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_recipients", "Sobivaid kontakte ei leitud veel. Kirjelda olukorda vestluses või täpsusta otsingut.")}</p>
          )}
          {recommendedRecipients.length > 3 ? (
            <Button type="button" className="justify-self-start" onClick={() => setShowMoreContacts((value) => !value)}>
              {showMoreContacts
                ? readText(t, "workspace_feature_pages.pre_inquiries.actions.show_less_contacts", "Näita vähem")
                : readText(t, "workspace_feature_pages.pre_inquiries.actions.show_more_contacts", "Vaata rohkem kontakte")}
            </Button>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.draft", "Pöördumise mustand")}>
        <Label>
          <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.topic", "Teema")}</span>
          <input className={fieldClassName} value={topic} onChange={(event) => { setTopic(event.target.value); setDraftTouched(false); }} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.topic", "Lühike pealkiri")} />
        </Label>
        <textarea className={cn(fieldClassName, "min-h-[12rem] resize-y")} value={draft} onChange={(event) => { setDraft(event.target.value); setDraftTouched(true); }} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.draft", "Koostatud pöördumise tekst")} />
        <div className="flex flex-wrap justify-end gap-[0.54rem]">
          <Button type="submit" disabled={saving || !situation.trim()}>
            {saving
              ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
              : readText(t, "workspace_feature_pages.pre_inquiries.actions.save", "Salvesta")}
          </Button>
          <Button type="button" disabled={!draft.trim()} onClick={handleCopy}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.copy", "Kopeeri")}</Button>
          <Button type="button" disabled={!draft.trim()} onClick={handleDownload}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.download", "Laadi alla")}</Button>
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.saved", "Minu eelpöördumised")}>
        <div className="grid gap-[0.52rem]">
          {inquiries.length ? inquiries.map((inquiry) => (
            <article key={inquiry.id} className="grid gap-[0.28rem] rounded-[0.86rem] border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.055)] px-[0.76rem] py-[0.6rem] light:bg-[rgba(255,255,255,0.56)] sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-[0.2rem]">
                <h3 className="m-0 text-[0.98rem] font-[700] leading-[1.15]">{inquiry.topic || readText(t, "workspace_feature_pages.pre_inquiries.untitled", "Pealkirjata")}</h3>
                <p className="m-0 text-[0.88rem] leading-[1.3] opacity-[0.78]">
                  {[
                    inquiry.selectedRecipientName,
                    inquiry.selectedRecipientEmail,
                    formatDate(inquiry.updatedAt)
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[0.44rem] sm:justify-end">
                <span className="rounded-full bg-[rgba(72,146,150,0.12)] px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1]">
                  {inquiry.status || "DRAFT"}
                </span>
                <Button type="button" onClick={() => handleOpenInquiry(inquiry)}>
                  {readText(t, "workspace_feature_pages.pre_inquiries.actions.open", "Ava")}
                </Button>
              </div>
            </article>
          )) : (
            <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_saved", "Salvestatud eelpöördumised ilmuvad siia.")}</p>
          )}
        </div>
      </SectionCard>
    </form>
  );
}

function serviceMapEntryTypeLabel(t, type) {
  if (type === "SERVICE_PROVIDER") {
    return readText(t, "workspace_feature_pages.service_map.types.provider", "Teenuseosutaja");
  }
  return readText(t, "workspace_feature_pages.service_map.types.kov", "KOV kontakt");
}

function hasServiceMapCoordinates(entry) {
  const latitude = Number(entry?.latitude);
  const longitude = Number(entry?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function ServiceMapSurface({
  t,
  activeRole = "SOCIAL_WORKER",
  isAdmin = false,
  onRoleChange
}) {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [entryType, setEntryType] = useState("ALL");
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadEntries() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/service-map/entries", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || readText(t, "workspace_feature_pages.service_map.errors.load_failed", "Map entries could not be loaded."));
        }
        if (!cancelled) setEntries(Array.isArray(payload?.entries) ? payload.entries : []);
      } catch (loadError) {
        if (!cancelled) {
          setEntries([]);
          setError(loadError?.message || readText(t, "workspace_feature_pages.service_map.errors.load_failed", "Map entries could not be loaded."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadEntries();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filteredEntries = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("et");
    const regionQuery = region.trim().toLocaleLowerCase("et");
    return entries.filter((entry) => {
      if (entryType === "KOV_CONTACT" && !String(entry.type || "").startsWith("KOV_")) return false;
      if (entryType !== "ALL" && entryType !== "KOV_CONTACT" && entry.type !== entryType) return false;
      const haystack = [
        entry.title,
        entry.description,
        entry.address,
        entry.providerProfile?.organizationName,
        ...(entry.providerProfile?.services || []),
        ...(entry.providerProfile?.serviceCategories || []),
        ...(entry.providerProfile?.targetGroups || [])
      ].join(" ").toLocaleLowerCase("et");
      const regionText = [
        entry.municipalityName,
        entry.municipality?.displayName,
        entry.county
      ].join(" ").toLocaleLowerCase("et");
      return (!query || haystack.includes(query)) && (!regionQuery || regionText.includes(regionQuery));
    });
  }, [entries, entryType, keyword, region]);

  const mappableEntries = useMemo(
    () => filteredEntries.filter((entry) => hasServiceMapCoordinates(entry)),
    [filteredEntries]
  );

  useEffect(() => {
    if (!selectedEntryId) return;
    if (!filteredEntries.some((entry) => entry.id === selectedEntryId)) {
      setSelectedEntryId("");
    }
  }, [filteredEntries, selectedEntryId]);

  return (
    <div className="service-map-workspace">
      {isAdmin ? (
        <div className="service-map-workspace__role">
          <AdminRoleSelector
            t={t}
            value={activeRole}
            onChange={onRoleChange}
          />
        </div>
      ) : null}

      <aside className="service-map-workspace__filters" aria-label={readText(t, "workspace_feature_pages.service_map.sections.filters", "Otsing ja filtrid")}>
        <h2 className={sectionTitleClassName}>{readText(t, "workspace_feature_pages.service_map.sections.filters", "Otsing ja filtrid")}</h2>
        <p className={bodyTextClassName}>
          {`${readText(t, "workspace_feature_pages.service_map.active_role", "Tööroll")}: ${roleLabel(t, activeRole)}`}
        </p>
        <Label>
          <span>{readText(t, "workspace_feature_pages.service_map.fields.keyword", "Keyword")}</span>
          <input className={fieldClassName} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={readText(t, "workspace_feature_pages.service_map.placeholders.keyword", "Service, contact or need")} />
        </Label>
        <Label>
          <span>{readText(t, "workspace_feature_pages.service_map.fields.region", "Region")}</span>
          <input className={fieldClassName} value={region} onChange={(event) => setRegion(event.target.value)} placeholder={readText(t, "workspace_feature_pages.service_map.placeholders.region", "Municipality or county")} />
        </Label>
        <div className="flex flex-wrap gap-[0.46rem]">
          {[
            ["ALL", readText(t, "workspace_feature_pages.service_map.types.all", "Kõik")],
            ["KOV_CONTACT", readText(t, "workspace_feature_pages.service_map.types.kov", "KOV kontakt")],
            ["SERVICE_PROVIDER", readText(t, "workspace_feature_pages.service_map.types.provider", "Teenuseosutaja")]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(chipClassName, entryType === value && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]")}
              onClick={() => setEntryType(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={cn(bodyTextClassName, "text-[0.94rem]")}>
          {loading
            ? readText(t, "workspace_feature_pages.service_map.loading", "Laen kaardikirjeid...")
            : error || `${filteredEntries.length} ${readText(t, "workspace_feature_pages.service_map.results", "tulemust")}, ${mappableEntries.length} ${readText(t, "workspace_feature_pages.service_map.mappable", "markerit")}`}
        </p>
        <div className="grid max-h-[min(32vh,20rem)] gap-[0.54rem] overflow-y-auto pr-[0.12rem]">
          {filteredEntries.length ? filteredEntries.slice(0, 40).map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={cn(
                "grid gap-[0.22rem] rounded-[0.86rem] border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.72)] px-[0.74rem] py-[0.66rem] text-left text-[#243044] transition hover:bg-[rgba(255,255,255,0.9)]",
                selectedEntryId === entry.id && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]"
              )}
              onClick={() => setSelectedEntryId(entry.id)}
            >
              <span className="text-[0.98rem] font-[760] leading-[1.14]">{entry.title}</span>
              <span className="text-[0.82rem] font-[700] leading-[1.1] opacity-[0.74]">
                {serviceMapEntryTypeLabel(t, entry.type)}
              </span>
              <span className="text-[0.88rem] leading-[1.24] opacity-[0.78]">
                {[entry.address, entry.municipalityName || entry.municipality?.displayName, entry.county].filter(Boolean).join(" · ") || readText(t, "workspace_feature_pages.service_map.no_address", "Asukoht vajab täpsustamist")}
              </span>
            </button>
          )) : (
            <p className={bodyTextClassName}>
              {loading
                ? readText(t, "workspace_feature_pages.service_map.loading", "Laen kaardikirjeid...")
                : readText(t, "workspace_feature_pages.service_map.empty", "Avaldatud kaardikirjed kuvatakse siin markeritena.")}
            </p>
          )}
        </div>
      </aside>

      <div className="service-map-workspace__map" aria-label={readText(t, "workspace_feature_pages.service_map.sections.map", "Kaart")}>
        <ServiceMapLeaflet
          entries={mappableEntries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={setSelectedEntryId}
          t={t}
        />
        <div className="service-map-workspace__status">
          {loading
            ? readText(t, "workspace_feature_pages.service_map.loading", "Loading map entries...")
            : error || (mappableEntries.length
              ? readText(t, "workspace_feature_pages.service_map.loaded", "Avaldatud kaardikirjed on markeritena Eesti kaardil.")
              : readText(t, "workspace_feature_pages.service_map.empty", "Avaldatud kaardikirjed kuvatakse siin markeritena."))}
        </div>
      </div>
    </div>
  );
}

function joinList(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function splitList(value) {
  return String(value || "")
    .split(/[,;\n\r]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function createServiceProfileForm(profile = null) {
  return {
    organizationName: profile?.organizationName || "",
    shortDescription: profile?.shortDescription || "",
    services: joinList(profile?.services),
    serviceCategories: joinList(profile?.serviceCategories),
    targetGroups: joinList(profile?.targetGroups),
    serviceArea: profile?.serviceArea || "",
    serviceAreaMunicipalityIds: joinList(profile?.serviceAreaMunicipalityIds),
    county: profile?.county || "",
    address: profile?.address || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    languages: joinList(profile?.languages),
    accessibilityInfo: profile?.accessibilityInfo || "",
    feeType: profile?.feeType || "UNKNOWN",
    mapVisible: Boolean(profile?.mapVisible),
    acceptsPlatformPreInquiries: profile?.acceptsPlatformPreInquiries !== false,
    acceptsEmailPreInquiries: profile?.acceptsEmailPreInquiries !== false,
    status: profile?.status || "DRAFT"
  };
}

function ServiceProfileSurface({ t }) {
  const [form, setForm] = useState(() => createServiceProfileForm());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/service-provider/profile", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || readText(t, "workspace_feature_pages.service_profile.errors.load_failed", "Service profile could not be loaded."));
        }
        if (!cancelled) {
          const loadedProfile = payload?.profile || null;
          setProfile(loadedProfile);
          setForm(createServiceProfileForm(loadedProfile));
        }
      } catch (loadError) {
        if (!cancelled) {
          setProfile(null);
          setError(loadError?.message || readText(t, "workspace_feature_pages.service_profile.errors.load_failed", "Service profile could not be loaded."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/service-provider/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          services: splitList(form.services),
          serviceCategories: splitList(form.serviceCategories),
          targetGroups: splitList(form.targetGroups),
          serviceAreaMunicipalityIds: splitList(form.serviceAreaMunicipalityIds),
          languages: splitList(form.languages)
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.service_profile.errors.save_failed", "Service profile could not be saved."));
      }
      const savedProfile = payload?.profile || null;
      setProfile(savedProfile);
      setForm(createServiceProfileForm(savedProfile));
      setNotice(readText(t, "workspace_feature_pages.service_profile.save_success", "Service profile saved."));
    } catch (saveError) {
      setError(saveError?.message || readText(t, "workspace_feature_pages.service_profile.errors.save_failed", "Service profile could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ["organization", "Organization"],
    ["services", "Services"],
    ["categories", "Categories"],
    ["target_groups", "Target groups"],
    ["service_area", "Service area"],
    ["address", "Address"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["website", "Website"],
    ["languages", "Languages"]
  ];

  const fieldToFormKey = {
    organization: "organizationName",
    services: "services",
    categories: "serviceCategories",
    target_groups: "targetGroups",
    service_area: "serviceArea",
    address: "address",
    phone: "phone",
    email: "email",
    website: "website",
    languages: "languages"
  };

  const mapEntry = profile?.serviceMapEntry || null;

  return (
    <form onSubmit={handleSubmit} className="grid gap-[1rem] lg:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.profile", "Profile")}>
        {loading ? (
          <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.service_profile.loading", "Loading service profile...")}</p>
        ) : null}
        {error ? (
          <p className="rounded-[1rem] border border-[rgba(208,116,108,0.22)] bg-[rgba(58,22,25,0.82)] px-[0.86rem] py-[0.58rem] text-[0.96rem] leading-[1.35] text-[rgba(255,223,218,0.96)] light:bg-[rgba(255,249,248,0.94)] light:text-[#b2615d]">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-[1rem] border border-[rgba(88,148,118,0.22)] bg-[rgba(18,44,34,0.82)] px-[0.86rem] py-[0.58rem] text-[0.96rem] leading-[1.35] text-[rgba(223,246,236,0.96)] light:bg-[rgba(247,252,249,0.94)] light:text-[#4d7b67]">
            {notice}
          </p>
        ) : null}
        <div className="grid gap-[0.72rem] sm:grid-cols-2">
          {fields.map(([key, fallback]) => (
            <Label key={key}>
              <span>{readText(t, `workspace_feature_pages.service_profile.fields.${key}`, fallback)}</span>
              <input
                className={fieldClassName}
                value={form[fieldToFormKey[key]] || ""}
                onChange={(event) => updateField(fieldToFormKey[key], event.target.value)}
              />
            </Label>
          ))}
        </div>
        <Label>
          <span>{readText(t, "workspace_feature_pages.service_profile.fields.short_description", "Short description")}</span>
          <textarea
            className={cn(fieldClassName, "min-h-[7rem] resize-y")}
            value={form.shortDescription}
            onChange={(event) => updateField("shortDescription", event.target.value)}
          />
        </Label>
        <Label>
          <span>{readText(t, "workspace_feature_pages.service_profile.fields.accessibility_info", "Accessibility info")}</span>
          <textarea
            className={cn(fieldClassName, "min-h-[5.8rem] resize-y")}
            value={form.accessibilityInfo}
            onChange={(event) => updateField("accessibilityInfo", event.target.value)}
          />
        </Label>
      </SectionCard>

      <div className="grid gap-[1rem]">
        <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.map_profile", "Map profile")}>
          <div className="grid gap-[0.72rem]">
            <label className="flex items-center gap-[0.58rem] text-[1rem] font-[620]">
              <input
                type="checkbox"
                checked={form.mapVisible}
                onChange={(event) => updateField("mapVisible", event.target.checked)}
              />
              <span>{readText(t, "workspace_feature_pages.service_profile.visibility.visible", "Visible on map")}</span>
            </label>
            <label className="flex items-center gap-[0.58rem] text-[1rem] font-[620]">
              <input
                type="checkbox"
                checked={form.acceptsPlatformPreInquiries}
                onChange={(event) => updateField("acceptsPlatformPreInquiries", event.target.checked)}
              />
              <span>{readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_platform", "Accept pre-inquiries in SotsiaalAI")}</span>
            </label>
            <label className="flex items-center gap-[0.58rem] text-[1rem] font-[620]">
              <input
                type="checkbox"
                checked={form.acceptsEmailPreInquiries}
                onChange={(event) => updateField("acceptsEmailPreInquiries", event.target.checked)}
              />
              <span>{readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_email", "Accept pre-inquiries by email")}</span>
            </label>
            <Label>
              <span>{readText(t, "workspace_feature_pages.service_profile.fields.status", "Status")}</span>
              <select className={fieldClassName} value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="DRAFT">{readText(t, "workspace_feature_pages.service_profile.status.draft", "Draft")}</option>
                <option value="REVIEW">{readText(t, "workspace_feature_pages.service_profile.status.review", "Review")}</option>
                <option value="PUBLISHED">{readText(t, "workspace_feature_pages.service_profile.status.published", "Published")}</option>
                <option value="HIDDEN">{readText(t, "workspace_feature_pages.service_profile.status.hidden", "Hidden")}</option>
              </select>
            </Label>
            <Label>
              <span>{readText(t, "workspace_feature_pages.service_profile.fields.fee_type", "Price")}</span>
              <select className={fieldClassName} value={form.feeType} onChange={(event) => updateField("feeType", event.target.value)}>
                <option value="UNKNOWN">{readText(t, "workspace_feature_pages.service_profile.fee.unknown", "Unknown")}</option>
                <option value="FREE">{readText(t, "workspace_feature_pages.service_profile.fee.free", "Free")}</option>
                <option value="PAID">{readText(t, "workspace_feature_pages.service_profile.fee.paid", "Paid")}</option>
                <option value="AGREEMENT">{readText(t, "workspace_feature_pages.service_profile.fee.agreement", "By agreement")}</option>
                <option value="MIXED">{readText(t, "workspace_feature_pages.service_profile.fee.mixed", "Mixed")}</option>
              </select>
            </Label>
          </div>
          <div className="min-h-[9rem] rounded-[1rem] border border-dashed border-[rgba(148,163,184,0.24)] bg-[rgba(255,255,255,0.045)] p-[0.88rem] light:bg-[rgba(255,255,255,0.54)]">
            <div className="grid gap-[0.42rem]">
              <p className={bodyTextClassName}>
                {mapEntry
                  ? `${readText(t, "workspace_feature_pages.service_profile.map_entry_status", "Map entry")}: ${mapEntry.status} / ${mapEntry.geocodingStatus}`
                  : readText(t, "workspace_feature_pages.service_profile.map_preview_empty", "Address match preview appears after geocoding.")}
              </p>
              {mapEntry?.address ? <p className={bodyTextClassName}>{mapEntry.address}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.outputs", "Outputs")}>
          <div className="grid gap-[0.48rem]">
            <span className={chipClassName}>{readText(t, "workspace_feature_pages.service_profile.outputs.public_profile", "Public profile")}</span>
            <span className={chipClassName}>{readText(t, "workspace_feature_pages.service_profile.outputs.map_marker", "Service map marker")}</span>
            <span className={chipClassName}>{readText(t, "workspace_feature_pages.service_profile.outputs.rag_record", "AI knowledge record")}</span>
          </div>
          <Button type="submit" disabled={loading || saving || !form.organizationName.trim()} className="justify-self-end">
            {saving
              ? readText(t, "workspace_feature_pages.service_profile.actions.saving", "Saving...")
              : readText(t, "workspace_feature_pages.service_profile.actions.save", "Save draft")}
          </Button>
        </SectionCard>
      </div>
    </form>
  );
}

export default function WorkspaceFeaturePage({ feature }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const isAdmin = Boolean(session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN");
  const [adminWorkspaceRole, setAdminWorkspaceRole] = useState("SOCIAL_WORKER");

  const handleBack = useCallback(() => {
    workspaceReturn(locale, router);
  }, [locale, router]);

  const featureKey =
    feature === "service_map" || feature === "service_profile"
      ? feature
      : "pre_inquiries";
  const title = readText(t, `workspace_feature_pages.${featureKey}.title`, "Workspace feature");
  const lead = readText(t, `workspace_feature_pages.${featureKey}.lead`, "");
  const activeWorkspaceRole = isAdmin
    ? adminWorkspaceRole
    : normalizeWorkspaceRole(session?.user?.role);
  const showAdminRoleSelector = isAdmin && (
    featureKey === "pre_inquiries"
  );
  const isServiceMap = featureKey === "service_map";

  return (
    <section className={shellClassName} lang={locale}>
      <div className={cn(
        panelClassName,
        isServiceMap && "!max-w-[calc(100vw-1rem)] !max-h-[calc(100dvh-1rem)] !h-[calc(100dvh-1rem)] !rounded-[1.35rem] !overflow-hidden !px-[0.7rem] !pb-[0.7rem]"
      )}>
        <BackButton
          onClick={handleBack}
          ariaLabel={readText(t, "workspace_feature_pages.back_to_workspace", "Back to workspace")}
          holdPressedVisualDisabled
          className={cn(glassPageBackTopLeftClassName, "!z-[30] pointer-events-auto")}
        />

        <header className="mb-[0.35rem] flex w-full items-start justify-center gap-[0.75rem]">
          <div className={titleWrapClassName}>
            <h1 className={titleClassName}>{title}</h1>
          </div>
        </header>

        <div className={cn(contentClassName, isServiceMap && "!h-[calc(100%-5.15rem)] !max-w-none !px-0 !pt-0 !pb-0")}>
          {lead && !isServiceMap ? <p className="mx-auto m-0 max-w-[54rem] text-left text-[1.12rem] leading-[1.58] tracking-[0] opacity-[0.86] max-[768px]:px-[0.5rem] max-[768px]:text-[1.08rem]">{lead}</p> : null}
          {showAdminRoleSelector ? (
            <AdminRoleSelector
              t={t}
              value={activeWorkspaceRole}
              onChange={setAdminWorkspaceRole}
            />
          ) : null}

          {featureKey === "pre_inquiries" ? <PreInquiriesSurface t={t} activeRole={activeWorkspaceRole} isAdmin={isAdmin} /> : null}
          {featureKey === "service_map" ? <ServiceMapSurface t={t} activeRole={activeWorkspaceRole} isAdmin={isAdmin} onRoleChange={setAdminWorkspaceRole} /> : null}
          {featureKey === "service_profile" ? <ServiceProfileSurface t={t} /> : null}
        </div>
      </div>
    </section>
  );
}
