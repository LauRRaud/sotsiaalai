"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatComposer from "@/components/alalehed/chat/ChatComposer";
import ChatMessageItem from "@/components/alalehed/chat/ChatMessageItem";
import ConversationView from "@/components/alalehed/chat/ConversationView";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import { useI18n } from "@/components/i18n/I18nProvider";
import BackButton from "@/components/ui/BackButton";
import BorderGlow from "@/components/ui/BorderGlow";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import GlowField from "@/components/ui/GlowField";
import OptionCard from "@/components/ui/OptionCard";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";
import {
  glassPageBackTopLeftClassName,
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  glassSubpageCardClassName,
  glassSubpageContentWideClassName,
  glassSubpageSurfaceScopeClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { buildRoomChatPath } from "@/lib/roomPath";
import { pushWithTransition } from "@/lib/routeTransition";
import { markWorkspacePanelMorph, WORKSPACE_PANEL_MORPH_DELAY_MS } from "@/lib/workspacePanelMorph";
import AdminRoleViewCycleButton from "./AdminRoleViewCycleButton";
import ServiceMapLeaflet from "./ServiceMapLeaflet";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";
const workspaceBackTiltClassName =
  "pointer-events-none motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "workspace-feature-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.32rem,1.35vw,0.4rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0";

const panelClassName =
  `workspace-feature-panel relative z-[21] max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] [border:none] ` +
  `[background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] px-[1.35rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.92rem] ${glassPageMobileCardClassName} ${workspaceGuidePanelClassName}`;

const contentClassName =
  `workspace-feature-content relative ${workspaceGuidePanelScrollClassName} ${glassSubpageContentWideClassName} mx-auto grid gap-[1rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:gap-[0.82rem] max-[768px]:px-[0.05rem] max-[768px]:pb-[0.88rem]`;

const cardClassName =
  `workspace-feature-card ${glassSubpageCardClassName} rounded-[1.05rem] px-[1rem] py-[0.92rem] max-[768px]:rounded-[0.95rem] max-[768px]:px-[0.9rem] max-[768px]:py-[0.82rem]`;

const sectionTitleClassName =
  "m-0 text-[1.18rem] font-[650] leading-[1.18] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";

const bodyTextClassName =
  "m-0 text-[1.02rem] leading-[1.52] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] opacity-[0.82]";

const receivingCheckboxLabelClassName =
  "workspace-feature-receiving-checkbox-label text-[1.12rem] font-[400] leading-[1.22]";

const fieldClassName =
  "documents-field workspace-feature-field min-h-[3rem] rounded-[0.86rem] border px-[0.96rem] py-[0.68rem] text-[1rem] leading-[1.3]";

const fieldEdgeGlowStyle = {
  "--edge-only-hot-end": "3%",
  "--edge-only-bright-end": "6%",
  "--edge-only-soft-end": "11%",
  "--edge-only-field-top-fade-end": "30%",
  "--edge-only-fade-end": "30%",
  "--edge-only-tail-end": "50%",
  "--edge-only-gap-start": "52%",
  "--edge-only-return-start": "52%",
  "--edge-only-return-soft": "70%",
  "--edge-only-return-bright": "84%",
  "--edge-only-return-hot": "94%",
  "--edge-only-bottom-tail-start": "42%",
  "--edge-only-bottom-tail-end": "100%",
  "--edge-only-bottom-line-left": "clamp(0.85rem, 3.5%, 1.35rem)",
  "--edge-only-bottom-line-right": "clamp(0.85rem, 3.5%, 1.35rem)"
};

const chipClassName =
  "workspace-feature-chip inline-flex min-h-[2.42rem] items-center justify-center rounded-full border px-[0.82rem] py-[0.36rem] text-[0.96rem] font-[600] leading-[1.15]";

const serviceMapChoiceCardClassName =
  `${primarySegmentedButtonClassName} service-map-toolbar__type-card inline-flex min-h-[2.72rem] items-center justify-center rounded-[1.6rem] ` +
  "border-[var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] " +
  "px-[1.05rem] py-[0.64rem] text-center text-[1.06rem] leading-[1.2] tracking-[0.022em] text-[color:var(--seg-card-text)] " +
  "shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "max-[768px]:min-h-[2.85rem] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.98rem] max-[768px]:py-[0.66rem] max-[768px]:text-[1.04rem]";

const preInquiryRecipientTypeCardClassName =
  `${primarySegmentedButtonClassName} pre-inquiry-recipient-type-card inline-flex min-h-[2.72rem] items-center justify-center rounded-[1.6rem] ` +
  "border-[var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] " +
  "px-[1.05rem] py-[0.64rem] text-center text-[1.02rem] leading-[1.18] tracking-[0] text-[color:var(--seg-card-text)] " +
  "shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "max-[768px]:min-h-[2.85rem] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.98rem] max-[768px]:py-[0.66rem] max-[768px]:text-[1rem]";

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

function workspaceReturn(locale, router, options = {}) {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
        JSON.stringify({ ts: Date.now() })
      );
    } catch {}
    markWorkspacePanelMorph("collapse", "/vestlus");
  }
  pushWithTransition(router, localizePath("/vestlus", locale), {
    delayMs: WORKSPACE_PANEL_MORPH_DELAY_MS,
    workspacePanelMorph: "collapse",
    ...options
  });
}

function clearServiceMapPageState() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("service-map-page-active");
  document.body?.classList.remove("service-map-page-active");
}

function SectionCard({ title, children, className }) {
  return (
    <BorderGlow
      as="section"
      className={cn(cardClassName, "workspace-feature-glow-card grid gap-[0.76rem]", className)}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--subpage-card-bg, var(--workspace-feature-surface, #120F17))"
      borderRadius={17}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      <h2 className={sectionTitleClassName}>{title}</h2>
      {children}
    </BorderGlow>
  );
}

function Label({ children, className }) {
  return (
    <label className={cn("grid gap-[0.34rem] text-[0.9rem] font-[620] leading-[1.2] opacity-[0.9]", className)}>
      {children}
    </label>
  );
}

function AdminRoleSelector({ t, locale = "et", value, onChange, className }) {
  const handleRoleChanged = (user = {}) => {
    onChange(normalizeWorkspaceRole(user?.effectiveRole || user?.adminViewRole));
  };

  return (
    <div className={cn("workspace-feature-admin-role", className)}>
      <AdminRoleViewCycleButton
        t={t}
        locale={locale}
        value={value}
        onRoleChanged={handleRoleChanged}
        ariaLabel={readText(t, "workspace_feature_pages.admin_role.label", "Admini tööroll")}
      />
    </div>
  );
}

function ServiceMapPanelToggleIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[1.45rem] w-[1.45rem]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={open ? "M5 15L12 8L19 15" : "M5 9L12 16L19 9"}
        stroke="var(--service-map-toggle-arrow-color, var(--back-arrow-color, #c57171))"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
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

function buildPreInquiryReplyMailto(inquiry) {
  const email = String(inquiry?.author?.email || "").trim();
  if (!email) return "";
  const subject = inquiry?.topic
    ? `Vastus eelpöördumisele: ${inquiry.topic}`
    : "Vastus eelpöördumisele";
  const body = [
    "Tere",
    "",
    "Kirjutan seoses teie eelpöördumisega.",
    "",
    inquiry?.situation ? `Teie kirjeldus:\n${inquiry.situation}` : "",
    "",
    "Lugupidamisega"
  ].filter(Boolean).join("\n");
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function PreInquiriesSurface({ t, locale = "et", activeRole = "SOCIAL_WORKER", isAdmin = false, currentUserId = "" }) {
  const router = useRouter();
  const chatWindowRef = useRef(null);
  const inputBarRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const composerDraftApiRef = useRef(null);
  const [activeInquiryId, setActiveInquiryId] = useState("");
  const [topic, setTopic] = useState("");
  const [situation, setSituation] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [draft, setDraft] = useState("");
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantReasoning, setAssistantReasoning] = useState("");
  const [assistantWarnings, setAssistantWarnings] = useState([]);
  const [assessmentLifeDomains, setAssessmentLifeDomains] = useState([]);
  const [assessmentTargetGroups, setAssessmentTargetGroups] = useState([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assistantSuggestions, setAssistantSuggestions] = useState([]);
  const [showMoreContacts, setShowMoreContacts] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assisting, setAssisting] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [acceptingInquiryId, setAcceptingInquiryId] = useState("");
  const [openingRoomInquiryId, setOpeningRoomInquiryId] = useState("");
  const [acceptsPreInquiries, setAcceptsPreInquiries] = useState(false);
  const [draftTouched, setDraftTouched] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savePrivacyPrompt, setSavePrivacyPrompt] = useState(null);

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

  const assistantConversationText = useMemo(() => {
    const lines = [];
    const lead = String(assistantMessage || assistantReasoning || "").trim();
    const tags = [...assessmentLifeDomains, ...assessmentTargetGroups];
    const urgentWarnings = assistantWarnings.filter((warning) => (
      /112|vahetu|kiire|oht|kriisi/i.test(String(warning || ""))
    ));
    const otherWarnings = assistantWarnings.filter((warning) => (
      warning && !urgentWarnings.includes(warning)
    ));

    if (lead) lines.push(lead);
    if (tags.length) {
      lines.push("", `Märksõnad: ${tags.join(", ")}`);
    }
    if (assessmentQuestions.length) {
      lines.push(
        "",
        "Vasta järgmistele küsimustele:",
        ...assessmentQuestions.map((question) => `- ${question}`)
      );
    }
    if (urgentWarnings.length) {
      lines.push(
        "",
        ...urgentWarnings.map((warning) => `Kiire abi: ${warning}`)
      );
    }
    if (otherWarnings.length) {
      lines.push(
        "",
        ...otherWarnings.map((warning) => `Oluline: ${warning}`)
      );
    }

    return lines.join("\n").trim();
  }, [
    assistantMessage,
    assistantReasoning,
    assistantWarnings,
    assessmentLifeDomains,
    assessmentQuestions,
    assessmentTargetGroups
  ]);

  const recommendedRecipients = useMemo(() => {
    const hasManualSearch = Boolean(recipientQuery.trim());
    const source = assistantSuggestions.length
      ? assistantSuggestions
      : hasManualSearch
        ? recipientEntries
        : [];
    const seen = new Set();
    return source.filter((entry) => {
      if (!entry?.id || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }, [assistantSuggestions, recipientEntries, recipientQuery]);

  const visibleRecommendedRecipients = showMoreContacts
    ? recommendedRecipients.slice(0, 12)
    : recommendedRecipients.slice(0, 3);

  const conversationItems = useMemo(() => {
    const items = [];
    if (situation.trim()) {
      items.push(
        <ChatMessageItem
          key="pre-inquiry-user-situation"
          role="user"
          text={situation}
          t={t}
        />
      );
    }
    if (assistantConversationText.trim()) {
      items.push(
        <ChatMessageItem
          key="pre-inquiry-assistant-message"
          role="ai"
          text={assistantConversationText}
          t={t}
        />
      );
    }
    if (assisting) {
      items.push(
        <ChatMessageItem
          key="pre-inquiry-assisting"
          role="ai"
          text={readText(t, "workspace_feature_pages.pre_inquiries.actions.assisting", "Otsin...")}
          t={t}
        />
      );
    }
    return items;
  }, [assistantConversationText, assisting, situation, t]);

  const receivedInquiries = useMemo(() => {
    if (!currentUserId) return [];
    return inquiries.filter((inquiry) => inquiry.recipientOwnerId === currentUserId);
  }, [currentUserId, inquiries]);

  const authoredInquiries = useMemo(() => {
    if (!currentUserId) return inquiries;
    return inquiries.filter((inquiry) => inquiry.authorId === currentUserId);
  }, [currentUserId, inquiries]);

  const savedInquiries = isAdmin ? inquiries : authoredInquiries;
  const isRecipientRole = activeRole === "SOCIAL_WORKER" || activeRole === "SERVICE_PROVIDER";
  const receiverInquiries = isAdmin && isRecipientRole ? inquiries : receivedInquiries;
  const showReceivedInquiries = isRecipientRole;
  const activeReceivedInquiry = activeInquiryId
    ? receiverInquiries.find((inquiry) => inquiry.id === activeInquiryId) || null
    : receiverInquiries[0] || null;

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
    setRecipientType("");
    setRecipientQuery("");
    setSelectedRecipientId("");
    setDraft("");
    setAssistantInput("");
    setAssistantMessage("");
    setAssistantReasoning("");
    setAssistantWarnings([]);
    setAssessmentLifeDomains([]);
    setAssessmentTargetGroups([]);
    setAssessmentQuestions([]);
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
    setRecipientType(inquiry.recipientType || "");
    setRecipientQuery("");
    setSelectedRecipientId(inquiry.recipientEntryId || "");
    setDraft(inquiry.userEditedDraft || inquiry.generatedDraft || "");
    setAssistantInput("");
    setAssistantMessage("");
    setAssistantReasoning("");
    setAssistantWarnings([]);
    setAssessmentLifeDomains([]);
    setAssessmentTargetGroups([]);
    setAssessmentQuestions([]);
    setAssistantSuggestions([]);
    setShowMoreContacts(false);
    setDraftTouched(true);
    setNotice("");
    setError("");
  }

  async function handleSave(event, options = {}) {
    event?.preventDefault?.();
    if (saving || !situation.trim()) return;

    setSaving(true);
    setNotice("");
    setError("");
    setSavePrivacyPrompt(null);

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
          status: "DRAFT",
          privacyDecision: options?.privacyDecision
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 409 && payload?.needsPrivacyConfirmation) {
        setSavePrivacyPrompt({
          warning: payload?.warning,
          redactedText: payload?.redactedText || "",
          findings: Array.isArray(payload?.findings) ? payload.findings : [],
          allowOriginal: Boolean(payload?.allowOriginal)
        });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.save_failed", "Pre-inquiry could not be saved."));
      }
      const inquiry = payload?.inquiry || null;
      if (inquiry) {
        setInquiries((current) => [inquiry, ...current.filter((item) => item.id !== inquiry.id)]);
        setActiveInquiryId(inquiry.id || "");
        setTopic(inquiry.topic || topic);
        setSituation(inquiry.situation || situation);
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

  function handleEditSaveText() {
    setSavePrivacyPrompt(null);
  }

  function handleSaveRedacted() {
    void handleSave(null, {
      privacyDecision: {
        action: "use_redacted"
      }
    });
  }

  function handleSaveOriginal() {
    void handleSave(null, {
      privacyDecision: {
        action: "send_original"
      }
    });
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

  async function handleAcceptInquiry(inquiry) {
    const inquiryId = String(inquiry?.id || "").trim();
    if (!inquiryId || acceptingInquiryId) return;
    setAcceptingInquiryId(inquiryId);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`/api/pre-inquiries/${encodeURIComponent(inquiryId)}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.accept_failed", "Eelpöördumist ei saanud vastu võtta."));
      }
      const updated = payload?.inquiry || null;
      if (updated) {
        setInquiries((current) => current.map((item) => item.id === updated.id ? updated : item));
      }
      setNotice(readText(t, "workspace_feature_pages.pre_inquiries.accept_success", "Eelpöördumine on vastuvõetud."));
    } catch (acceptError) {
      setError(acceptError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.accept_failed", "Eelpöördumist ei saanud vastu võtta."));
    } finally {
      setAcceptingInquiryId("");
    }
  }

  async function handleOpenInquiryRoom(inquiry) {
    const inquiryId = String(inquiry?.id || "").trim();
    if (!inquiryId || openingRoomInquiryId) return;
    setOpeningRoomInquiryId(inquiryId);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`/api/pre-inquiries/${encodeURIComponent(inquiryId)}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.room_failed", "Vestlusruumi ei saanud avada."));
      }
      const roomId = payload?.room?.id || payload?.roomId || "";
      if (!roomId) {
        throw new Error(readText(t, "workspace_feature_pages.pre_inquiries.errors.room_failed", "Vestlusruumi ei saanud avada."));
      }
      pushWithTransition(router, buildRoomChatPath(roomId, locale));
    } catch (roomError) {
      setError(roomError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.room_failed", "Vestlusruumi ei saanud avada."));
    } finally {
      setOpeningRoomInquiryId("");
    }
  }

  async function handleAskAssistant(event, overrideMessage = "", options = {}) {
    event?.preventDefault();
    const message = String(overrideMessage || assistantInput).trim();
    if (assisting || (!message && !situation.trim())) return;
    const shouldAppendMessage = options.appendMessage !== false;
    const nextSituation = shouldAppendMessage
      ? [situation.trim(), message].filter(Boolean).join(situation.trim() && message ? "\n\n" : "")
      : situation.trim();
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
          activeRole,
          privacyDecision: options.privacyDecision
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
      setAssessmentLifeDomains(Array.isArray(payload?.lifeDomains) ? payload.lifeDomains : []);
      setAssessmentTargetGroups(Array.isArray(payload?.targetGroups) ? payload.targetGroups : []);
      setAssessmentQuestions(Array.isArray(payload?.clarifyingQuestions) ? payload.clarifyingQuestions : []);
      setAssistantSuggestions(suggestions);
      setShowMoreContacts(false);
      if (payload?.draftBody || payload?.draft) {
        setDraft(payload.draftBody || payload.draft);
        setDraftTouched(true);
      } else {
        setDraft("");
        setDraftTouched(false);
      }
      const firstSuggestion = suggestions[0] || null;
      if (firstSuggestion?.id) {
        setSelectedRecipientId(firstSuggestion.id);
        setRecipientType(firstSuggestion.type === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "KOV_CONTACT");
      } else {
        setSelectedRecipientId("");
      }
    } catch (assistError) {
      setError(assistError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.assist_failed", "Assistant could not prepare the pre-inquiry."));
    } finally {
      setAssisting(false);
    }
  }

  async function handleComposerSend(message, options = {}) {
    setAssistantInput(String(message || ""));
    await handleAskAssistant({
      preventDefault() {}
    }, String(message || ""), options);
    return true;
  }

  if (isRecipientRole) {
    return (
      <div className="mx-auto grid w-full max-w-[58rem] gap-[0.82rem]">
        <div className="flex flex-wrap items-center justify-between gap-[0.5rem]">
          <p className={cn(bodyTextClassName, "text-[0.96rem]")}>
            {`${roleLabel(t, activeRole)} · ${readText(t, "workspace_feature_pages.pre_inquiries.receiver_workspace", "Eelpöördumiste vastuvõtt")}`}
          </p>
        </div>

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

        <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.receiving_settings", "Vastuvõtt")}>
          {activeRole === "SOCIAL_WORKER" ? (
            <div className="grid gap-[0.48rem]">
              <FancyCheckbox
                checked={acceptsPreInquiries}
                onChange={(value) => setAcceptsPreInquiries(Boolean(value))}
                className="workspace-feature-fancy-checkbox workspace-feature-receiving-checkbox fancy-checkbox--multiline fancy-checkbox--top"
                label={
                  <span className={receivingCheckboxLabelClassName}>
                    {readText(t, "workspace_feature_pages.pre_inquiries.receiving.accepts_platform", "Võtan eelpöördumisi platvormil vastu")}
                  </span>
                }
              />
              <p className="m-0 text-[0.9rem] leading-[1.36] opacity-[0.76]">
                {isAdmin
                  ? readText(t, "workspace_feature_pages.pre_inquiries.receiving.admin_note", "Admini testvaade; salvestus käib ainult sinu kontole.")
                  : readText(t, "workspace_feature_pages.pre_inquiries.receiving.note", "Lubab sinu kontole adresseeritud eelpöördumised platvormis vastu võtta.")}
              </p>
              <Button type="button" size="sm" className="workspace-feature-action-btn justify-self-start" disabled={savingPreferences} onClick={handleSavePreferences}>
                {savingPreferences
                  ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
                  : readText(t, "workspace_feature_pages.pre_inquiries.actions.save_preferences", "Salvesta vastuvõtt")}
              </Button>
            </div>
          ) : (
            <p className={bodyTextClassName}>
              {readText(t, "workspace_feature_pages.pre_inquiries.receiving.provider_note", "Vastuvõtukanalid on teenuseprofiilis. Siin kuvatakse sulle adresseeritud eelpöördumised.")}
            </p>
          )}
        </SectionCard>

        <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.received", "Saabunud eelpöördumised")}>
          <div className="grid gap-[0.52rem]">
            {receiverInquiries.length ? receiverInquiries.map((inquiry) => (
              <article key={inquiry.id} className="workspace-feature-list-card grid gap-[0.38rem] rounded-[0.86rem] border px-[0.76rem] py-[0.68rem]">
                <div className="flex flex-wrap items-start justify-between gap-[0.62rem]">
                  <div className="grid gap-[0.2rem]">
                    <h3 className="m-0 text-[1rem] font-[720] leading-[1.15]">{inquiry.topic || readText(t, "workspace_feature_pages.pre_inquiries.untitled", "Pealkirjata")}</h3>
                    <p className="m-0 text-[0.88rem] leading-[1.3] opacity-[0.78]">
                      {[
                        inquiry.author?.email,
                        inquiry.selectedRecipientName,
                        formatDate(inquiry.updatedAt, locale)
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="workspace-feature-badge rounded-full px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1]">
                    {inquiry.status || "DRAFT"}
                  </span>
                </div>
                <p className="m-0 line-clamp-3 text-[0.92rem] leading-[1.34] opacity-[0.82]">
                  {inquiry.situation}
                </p>
                <div className="flex flex-wrap gap-[0.44rem]">
                  <Button type="button" size="sm" onClick={() => handleOpenInquiry(inquiry)}>
                    {readText(t, "workspace_feature_pages.pre_inquiries.actions.open", "Ava")}
                  </Button>
                  <Button type="button" size="sm" disabled={acceptingInquiryId === inquiry.id || inquiry.status === "READY"} onClick={() => handleAcceptInquiry(inquiry)}>
                    {acceptingInquiryId === inquiry.id
                      ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
                      : readText(t, "workspace_feature_pages.pre_inquiries.actions.accept", "Märgi vastuvõetuks")}
                  </Button>
                  <Button type="button" size="sm" disabled={openingRoomInquiryId === inquiry.id || !inquiry.authorId} onClick={() => handleOpenInquiryRoom(inquiry)}>
                    {openingRoomInquiryId === inquiry.id
                      ? readText(t, "workspace_feature_pages.pre_inquiries.actions.opening_room", "Avan...")
                      : readText(t, "workspace_feature_pages.pre_inquiries.actions.open_room", "Ava vestlusruum")}
                  </Button>
                  {buildPreInquiryReplyMailto(inquiry) ? (
                    <a className={cn(chipClassName, "min-h-[2.25rem] px-[0.72rem] py-[0.34rem] text-[0.9rem] no-underline")} href={buildPreInquiryReplyMailto(inquiry)}>
                      {readText(t, "workspace_feature_pages.pre_inquiries.actions.write_email", "Kirjuta e-kiri")}
                    </a>
                  ) : null}
                </div>
              </article>
            )) : (
              <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_received", "Sulle adresseeritud eelpöördumised ilmuvad siia, kui vastuvõtt on lubatud ja adressaat on kontoga seotud.")}</p>
            )}
          </div>
        </SectionCard>

        {activeReceivedInquiry ? (
          <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.selected_received", "Valitud eelpöördumine")}>
            <div className="grid gap-[0.54rem]">
              <p className="m-0 text-[1rem] font-[720] leading-[1.2]">{activeReceivedInquiry.topic || readText(t, "workspace_feature_pages.pre_inquiries.untitled", "Pealkirjata")}</p>
              <p className={bodyTextClassName}>{activeReceivedInquiry.situation}</p>
              {activeReceivedInquiry.userEditedDraft || activeReceivedInquiry.generatedDraft ? (
                <ServiceProfileTextarea readOnly value={activeReceivedInquiry.userEditedDraft || activeReceivedInquiry.generatedDraft || ""} className="min-h-[10rem]" />
              ) : null}
            </div>
          </SectionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[58rem] gap-[0.82rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.5rem]">
        <p className={cn(bodyTextClassName, "text-[0.96rem]")}>
          {`${roleLabel(t, activeRole)} · ${activeInquiryId
            ? readText(t, "workspace_feature_pages.pre_inquiries.editing_existing", "Avatud salvestatud eelpöördumine")
            : readText(t, "workspace_feature_pages.pre_inquiries.creating_new", "Uus eelpöördumine")}`}
        </p>
        <Button type="button" size="sm" className="w-auto" onClick={handleNewInquiry}>
          {readText(t, "workspace_feature_pages.pre_inquiries.actions.new", "Uus")}
        </Button>
      </div>

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
        <div className="documents-workspace documents-workspace-page--library pre-inquiry-agent-chat">
          <div className="documents-agent-conversation-shell">
            <BorderGlow
              className="documents-agent-glow-window"
              edgeSensitivity={30}
              glowColor="358 82 72"
              backgroundColor="#120F17"
              borderRadius={16}
              glowRadius={42}
              glowIntensity={0.62}
              coneSpread={20}
              colors={["#c084fc", "#f472b6", "#38bdf8"]}
              fillOpacity={0}
              edgeOnly
            >
              <ConversationView
                t={t}
                chatWindowRef={chatWindowRef}
                isStreamingAny={assisting}
                hiddenCount={0}
                pageSize={0}
                onRevealOlder={() => {}}
                canHideOlder={false}
                onHideOlder={() => {}}
                onJumpToBottom={() => {}}
                messageItems={conversationItems}
                mainClassName="documents-agent-conversation-main"
                windowClassName="documents-agent-conversation-window"
                isMobile={false}
                isLightTheme
              />
            </BorderGlow>

            <div className="documents-agent-composer-slot">
              <BorderGlow
                className="documents-agent-glow-composer"
                edgeSensitivity={30}
                glowColor="358 82 72"
                backgroundColor="#120F17"
                borderRadius={28}
                glowRadius={42}
                glowIntensity={0.62}
                coneSpread={20}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                fillOpacity={0}
                edgeOnly
              >
                <ChatComposer
                  t={t}
                  locale={locale}
                  isLightTheme
                  hideTools
                  embedded
                  forcePlaceholderVisible
                  placeholderText=""
                  acceptAttr=""
                  ensureAnalysisPanelVisible={() => {}}
                  fileInputRef={fileInputRef}
                  onFileChange={() => {}}
                  inputBarRef={inputBarRef}
                  inputRef={inputRef}
                  onFocusInput={() => setInputFocused(true)}
                  onBlurInput={() => setInputFocused(false)}
                  isGenerating={assisting}
                  isStreamingAny={false}
                  isRoomMode={false}
                  roomBlocked={false}
                  roomAuthRequired={false}
                  onStop={() => {}}
                  onSend={handleComposerSend}
                  voiceEnabled={false}
                  recording={false}
                  recordingPulse={false}
                  handleMic={() => {}}
                  draftApiRef={composerDraftApiRef}
                  inputFocused={inputFocused}
                  isMobile={false}
                  activeModeKey="pre_inquiry"
                />
              </BorderGlow>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-[0.46rem]">
          <Button
            type="button"
            size="sm"
            disabled={assisting}
            onClick={(event) => handleAskAssistant(
              event,
              "Soovin alustada abivajaduse eelkaardistust.",
              { appendMessage: false }
            )}
          >
            {readText(t, "workspace_feature_pages.pre_inquiries.actions.start_assessment", "Alusta eelkaardistust")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={assisting || !situation.trim()}
            onClick={(event) => handleAskAssistant(event, "Palun koosta sellest lühike eelpöördumise kokkuvõte ja mustand.")}
          >
            {readText(t, "workspace_feature_pages.pre_inquiries.actions.prepare_draft", "Koosta kirja mustand")}
          </Button>
        </div>

        {activeRole === "SOCIAL_WORKER" ? (
          <div className="workspace-feature-card grid gap-[0.48rem] rounded-[0.95rem] border px-[0.78rem] py-[0.62rem]">
            <FancyCheckbox
              checked={acceptsPreInquiries}
              onChange={(value) => setAcceptsPreInquiries(Boolean(value))}
              className="workspace-feature-fancy-checkbox workspace-feature-receiving-checkbox fancy-checkbox--multiline fancy-checkbox--top"
              label={
                <span className={receivingCheckboxLabelClassName}>
                  {readText(t, "workspace_feature_pages.pre_inquiries.receiving.accepts_platform", "Võtan eelpöördumisi platvormil vastu")}
                </span>
              }
            />
            <p className="m-0 text-[0.9rem] leading-[1.36] opacity-[0.76]">
              {isAdmin
                ? readText(t, "workspace_feature_pages.pre_inquiries.receiving.admin_note", "Admini testvaade; salvestus käib ainult sinu kontole.")
                : readText(t, "workspace_feature_pages.pre_inquiries.receiving.note", "Lubab sinu kontole adresseeritud eelpöördumised platvormis vastu võtta.")}
            </p>
            <Button type="button" size="sm" className="workspace-feature-action-btn justify-self-start" disabled={savingPreferences} onClick={handleSavePreferences}>
              {savingPreferences
                ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
                : readText(t, "workspace_feature_pages.pre_inquiries.actions.save_preferences", "Salvesta vastuvõtt")}
            </Button>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.recipient", "Sobivad kontaktid")}>
        <p className={bodyTextClassName}>
          {readText(t, "workspace_feature_pages.pre_inquiries.recipients_lead", "Kontaktid tulevad teenusekaardi struktureeritud andmekihist pärast seda, kui olukord, piirkond ja soovitud pöördumise suund on piisavalt selged. SotsiaalAI ei ole selles nimekirjas eelpöördumise adressaat.")}
        </p>
        <div className="pre-inquiry-recipient-controls">
          <div className="pre-inquiry-recipient-types flex flex-nowrap gap-[0.46rem]" role="group" aria-label={readText(t, "workspace_feature_pages.pre_inquiries.fields.recipient_type", "Adressaadi tüüp")}>
            {[
              ["KOV_CONTACT", readText(t, "workspace_feature_pages.pre_inquiries.recipient.kov", "KOV kontakt")],
              ["SERVICE_PROVIDER", readText(t, "workspace_feature_pages.pre_inquiries.recipient.provider", "Teenuseosutaja")]
            ].map(([value, label]) => (
              <OptionCard
                key={value}
                type="checkbox"
                name="pre-inquiry-recipient-type"
                value={value}
                checked={recipientType === value}
                showIndicator={false}
                onChange={() => {
                  setRecipientType((current) => current === value ? "" : value);
                  setSelectedRecipientId("");
                  setShowMoreContacts(false);
                  setDraftTouched(false);
                }}
                className={preInquiryRecipientTypeCardClassName}
                fitTextLines={2}
              >
                <span className="pre-inquiry-recipient-type-card__label text-center [text-wrap:balance]">{label}</span>
              </OptionCard>
            ))}
          </div>
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.recipient_search", "Otsi adressaati")}</span>
            <ServiceProfileInput value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.recipient", "KOV, teenuseosutaja või piirkond")} />
          </Label>
        </div>
        <div className="grid gap-[0.52rem]">
          {visibleRecommendedRecipients.length ? visibleRecommendedRecipients.map((entry) => {
            const isSelectedRecipient = selectedRecipientId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                aria-pressed={isSelectedRecipient ? "true" : "false"}
                data-selected={isSelectedRecipient ? "true" : undefined}
                className={cn(
                  "workspace-feature-list-card grid gap-[0.32rem] rounded-[0.92rem] border px-[0.82rem] py-[0.68rem] text-left transition",
                  isSelectedRecipient && "pre-inquiry-recipient-card--selected ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]"
                )}
                onClick={() => {
                  setSelectedRecipientId(entry.id);
                  setRecipientType(entry.type === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "KOV_CONTACT");
                  setDraftTouched(false);
                }}
              >
                <span className="flex flex-wrap items-center justify-between gap-[0.5rem]">
                  <span className="text-[1.02rem] font-[720] leading-[1.16]">{entry.title}</span>
                  <span className="workspace-feature-badge rounded-full px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1]">
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
                {isSelectedRecipient ? (
                  <span className="pre-inquiry-recipient-selected-label text-[0.82rem] font-[700] leading-[1.2]">
                    {readText(t, "workspace_feature_pages.pre_inquiries.recipient.selected", "Valitud kontakt")}
                  </span>
                ) : null}
              </button>
            );
          }) : (
            <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_recipients", "Kontaktid ilmuvad siia pärast eelkaardistuse vastuseid või otsingusõna sisestamist.")}</p>
          )}
          {recommendedRecipients.length > 3 ? (
            <Button type="button" size="sm" className="justify-self-start" onClick={() => setShowMoreContacts((value) => !value)}>
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
          <ServiceProfileInput value={topic} onChange={(event) => { setTopic(event.target.value); setDraftTouched(false); }} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.topic", "Lühike pealkiri")} />
        </Label>
        <ServiceProfileTextarea className="pre-inquiry-draft-textarea" value={draft} onChange={(event) => { setDraft(event.target.value); setDraftTouched(true); }} placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.draft", "Koostatud pöördumise tekst")} />
        {savePrivacyPrompt ? (
          <div className="grid gap-[0.58rem] rounded-[0.9rem] border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(0,0,0,0.18)] px-[0.82rem] py-[0.72rem] text-[0.94rem] leading-[1.36]">
            <p className="m-0 font-[650]">
              {savePrivacyPrompt.warning || readText(t, "privacy.confirmation.warning", "Tekst sisaldab isikuandmeid. Vali enne jatkamist, kuidas neid toodelda.")}
            </p>
            {savePrivacyPrompt.findings?.length ? (
              <p className="m-0 opacity-[0.78]">
                {readText(t, "privacy.confirmation.detected", "Leitud:")}{" "}
                {savePrivacyPrompt.findings.map((finding) => finding?.label).filter(Boolean).join(", ")}
              </p>
            ) : null}
            {savePrivacyPrompt.redactedText ? (
              <p className="m-0 max-h-[7rem] overflow-auto whitespace-pre-wrap rounded-[0.72rem] bg-[color:rgba(255,255,255,0.08)] px-[0.7rem] py-[0.58rem] text-[0.86rem] opacity-[0.86]">
                {savePrivacyPrompt.redactedText}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-[0.5rem]">
              <Button type="button" size="sm" variant="ghost" onClick={handleEditSaveText}>
                {readText(t, "privacy.confirmation.actions.edit", "Muudan teksti")}
              </Button>
              <Button type="button" size="sm" onClick={handleSaveRedacted} disabled={saving}>
                {readText(t, "privacy.confirmation.actions.send_redacted", "Saada maskeeritult")}
              </Button>
              {savePrivacyPrompt.allowOriginal ? (
                <Button type="button" size="sm" variant="ghost" onClick={handleSaveOriginal} disabled={saving}>
                  {readText(t, "privacy.confirmation.actions.send_original", "Saada siiski")}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-[0.54rem]">
          <Button type="button" size="sm" disabled={saving || !situation.trim()} onClick={handleSave}>
            {saving
              ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
              : readText(t, "workspace_feature_pages.pre_inquiries.actions.save", "Salvesta")}
          </Button>
          <Button type="button" size="sm" disabled={!draft.trim()} onClick={handleCopy}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.copy", "Kopeeri")}</Button>
          <Button type="button" size="sm" disabled={!draft.trim()} onClick={handleDownload}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.download", "Laadi alla")}</Button>
        </div>
      </SectionCard>

      {showReceivedInquiries ? (
        <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.received", "Saabunud eelpöördumised")}>
          <div className="grid gap-[0.52rem]">
            {receivedInquiries.length ? receivedInquiries.map((inquiry) => (
              <article key={inquiry.id} className="workspace-feature-list-card grid gap-[0.28rem] rounded-[0.86rem] border px-[0.76rem] py-[0.6rem] sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid gap-[0.2rem]">
                  <h3 className="m-0 text-[0.98rem] font-[700] leading-[1.15]">{inquiry.topic || readText(t, "workspace_feature_pages.pre_inquiries.untitled", "Pealkirjata")}</h3>
                  <p className="m-0 text-[0.88rem] leading-[1.3] opacity-[0.78]">
                    {[
                      inquiry.author?.email,
                      inquiry.selectedRecipientName,
                      formatDate(inquiry.updatedAt)
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-[0.44rem] sm:justify-end">
                  <span className="workspace-feature-badge rounded-full px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1]">
                    {getPreInquiryChannelLabel(t, inquiry.deliveryChannel)}
                  </span>
                  <Button type="button" size="sm" onClick={() => handleOpenInquiry(inquiry)}>
                    {readText(t, "workspace_feature_pages.pre_inquiries.actions.open", "Ava")}
                  </Button>
                </div>
              </article>
            )) : (
              <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_received", "Sulle adresseeritud eelpöördumised ilmuvad siia, kui vastuvõtt on lubatud ja adressaat on kontoga seotud.")}</p>
            )}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.saved", "Minu eelpöördumised")}>
        <div className="grid gap-[0.52rem]">
          {savedInquiries.length ? savedInquiries.map((inquiry) => (
            <article key={inquiry.id} className="workspace-feature-list-card grid gap-[0.28rem] rounded-[0.86rem] border px-[0.76rem] py-[0.6rem] sm:grid-cols-[1fr_auto] sm:items-center">
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
                <span className="workspace-feature-badge rounded-full px-[0.56rem] py-[0.22rem] text-[0.78rem] font-[700] leading-[1.1]">
                  {inquiry.status || "DRAFT"}
                </span>
                <Button type="button" size="sm" onClick={() => handleOpenInquiry(inquiry)}>
                  {readText(t, "workspace_feature_pages.pre_inquiries.actions.open", "Ava")}
                </Button>
              </div>
            </article>
          )) : (
            <p className={bodyTextClassName}>{readText(t, "workspace_feature_pages.pre_inquiries.empty_saved", "Salvestatud eelpöördumised ilmuvad siia.")}</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function hasServiceMapCoordinates(entry) {
  const latitude = Number(entry?.latitude);
  const longitude = Number(entry?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function ServiceMapSurface({
  t,
  locale = "et",
  activeRole = "SOCIAL_WORKER",
  isAdmin = false,
  onRoleChange,
  onBack
}) {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("");
  const [entryType, setEntryType] = useState("ALL");
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [isMobilePanel, setIsMobilePanel] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const workspaceRef = useRef(null);
  const filtersShellRef = useRef(null);
  const keywordPlaceholder = readText(t, "workspace_feature_pages.service_map.placeholders.keyword", "Service, contact or need");
  const regionPlaceholder = readText(t, "workspace_feature_pages.service_map.placeholders.region", "Municipality or county");

  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("service-map-page-active");
    body?.classList.add("service-map-page-active");
    return () => {
      clearServiceMapPageState();
    };
  }, []);

  const handleServiceMapBack = useCallback(() => {
    clearServiceMapPageState();
    onBack?.();
  }, [onBack]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const workspace = workspaceRef.current;
    const filtersShell = filtersShellRef.current;
    if (!workspace || !filtersShell) return undefined;

    const syncPanelHeight = () => {
      const height = filtersShell.getBoundingClientRect().height;
      if (Number.isFinite(height) && height > 0) {
        workspace.style.setProperty("--service-map-panel-height", `${height.toFixed(2)}px`);
      }
    };

    syncPanelHeight();
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncPanelHeight) : null;
    resizeObserver?.observe(filtersShell);
    window.addEventListener("resize", syncPanelHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncPanelHeight);
      workspace.style.removeProperty("--service-map-panel-height");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const syncPanelMode = () => {
      const nextIsMobile = mobileQuery.matches;
      setIsMobilePanel(nextIsMobile);
      if (!nextIsMobile) setPanelOpen(true);
    };
    syncPanelMode();
    mobileQuery.addEventListener?.("change", syncPanelMode);
    return () => mobileQuery.removeEventListener?.("change", syncPanelMode);
  }, []);

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

  const handleSelectEntry = useCallback((entryId) => {
    setSelectedEntryId(entryId);
    if (entryId && isMobilePanel) setPanelOpen(false);
  }, [isMobilePanel]);

  const panelCollapsed = isMobilePanel && !panelOpen;
  const showResults = !loading && !error && filteredEntries.length > 0;

  return (
    <div
      ref={workspaceRef}
      className={cn(
        "service-map-workspace",
        "service-map-workspace--toolbar-feedback"
      )}
    >
      <BackButton
        onClick={handleServiceMapBack}
        ariaLabel={readText(t, "workspace_feature_pages.back_to_workspace", "Back to workspace")}
        holdPressedVisualDisabled
        className={cn(glassPageBackTopLeftClassName, "service-map-workspace__back")}
      />
      <div
        className={cn(
          "service-map-workspace__filters",
          panelCollapsed && "service-map-workspace__filters--collapsed"
        )}
        aria-label={readText(t, "workspace_feature_pages.service_map.sections.filters", "Otsing ja filtrid")}
      >
        <div
          ref={filtersShellRef}
          className={cn(
            "service-map-workspace__filters-shell",
            "service-map-workspace__filters-shell--toolbar-feedback"
          )}
        >
          <div className="service-map-toolbar__identity">
            <BackButton
              onClick={handleServiceMapBack}
              ariaLabel={readText(t, "workspace_feature_pages.back_to_workspace", "Back to workspace")}
              holdPressedVisualDisabled
              className="service-map-toolbar__back"
            />
          </div>
          <div className="service-map-toolbar__content">
            <div className="service-map-toolbar__body">
              <div className="service-map-toolbar__fields">
                <label className="service-map-toolbar__field service-map-toolbar__field--keyword">
                  <span className="sr-only">{readText(t, "workspace_feature_pages.service_map.fields.keyword", "Keyword")}</span>
                  <GlowField
                    className="service-map-toolbar__glow-field service-map-toolbar__glow-field--keyword"
                    style={{ "--service-map-placeholder-ch": `${keywordPlaceholder.length}ch` }}
                  >
                    <input
                      className="service-map-toolbar__input service-map-toolbar__input--keyword ui-glow-control"
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder={keywordPlaceholder}
                    />
                  </GlowField>
                </label>
                <label className="service-map-toolbar__field service-map-toolbar__field--region">
                  <span className="sr-only">{readText(t, "workspace_feature_pages.service_map.fields.region", "Region")}</span>
                  <GlowField
                    className="service-map-toolbar__glow-field service-map-toolbar__glow-field--region"
                    style={{ "--service-map-placeholder-ch": `${regionPlaceholder.length}ch` }}
                  >
                    <input
                      className="service-map-toolbar__input service-map-toolbar__input--region ui-glow-control"
                      value={region}
                      onChange={(event) => setRegion(event.target.value)}
                      placeholder={regionPlaceholder}
                    />
                  </GlowField>
                </label>
              </div>

              <div className="service-map-toolbar__types" role="radiogroup" aria-label="Kirje liik">
              {[
                ["KOV_CONTACT", readText(t, "workspace_feature_pages.service_map.types.kov", "KOV kontakt")],
                ["SERVICE_PROVIDER", readText(t, "workspace_feature_pages.service_map.types.provider", "Teenuseosutaja")],
                ["ALL", readText(t, "workspace_feature_pages.service_map.types.all", "Kõik")]
              ].map(([value, label]) => (
                  <OptionCard
                    key={value}
                    type="radio"
                    name="service-map-entry-type"
                    value={value}
                    checked={entryType === value}
                    onChange={(event) => setEntryType(event.target.value)}
                    className={serviceMapChoiceCardClassName}
                  >
                    <span className="service-map-toolbar__type-label text-center [text-wrap:balance]">{label}</span>
                  </OptionCard>
              ))}
              </div>
            </div>

            <div className="service-map-toolbar__resultsblock">
              {showResults ? (
                <div className="service-map-toolbar__results" aria-label={readText(t, "workspace_feature_pages.service_map.results", "Tulemused")}>
                  {filteredEntries.slice(0, 10).map((entry) => (
                  <BorderGlow
                    as="button"
                    key={entry.id}
                    type="button"
                    data-variant="primary"
                    data-selected={selectedEntryId === entry.id ? "true" : "false"}
                    className={cn(
                      "workspace-feature-list-card button invite-primary-btn service-map-toolbar__result-button ui-glow-button-frame ui-glow-button-control grid gap-[0.12rem] rounded-[0.72rem] border px-[0.62rem] py-[0.4rem] text-left transition",
                      selectedEntryId === entry.id && "ring-2 ring-[color:var(--title-color,var(--brand-primary,#c57171))]"
                    )}
                    edgeSensitivity={22}
                    glowColor="358 82 72"
                    backgroundColor="var(--btn-primary-bg)"
                    borderRadius={12}
                    glowRadius={42}
                    glowIntensity={0.62}
                    coneSpread={20}
                    fillOpacity={0}
                    edgeOnly
                    style={fieldEdgeGlowStyle}
                    onClick={() => handleSelectEntry(entry.id)}
                  >
                    <span className="service-map-result-card__title text-[0.98rem] font-[760] leading-[1.14]">{entry.title}</span>
                  </BorderGlow>
                  ))}
                </div>
              ) : null}
            </div>
        </div>
        </div>
        <button
          type="button"
          className="service-map-workspace__toggle"
          aria-expanded={panelOpen}
          aria-label={panelOpen
            ? readText(t, "workspace_feature_pages.service_map.actions.hide_filters", "Peida filtrid")
              : readText(t, "workspace_feature_pages.service_map.actions.show_filters", "Näita filtreid")}
          onClick={() => setPanelOpen((value) => !value)}
        >
          <ServiceMapPanelToggleIcon open={panelOpen} />
        </button>
      </div>

      {isAdmin ? (
        <div className="service-map-workspace__role">
          <AdminRoleSelector
            t={t}
            locale={locale}
            value={activeRole}
            onChange={onRoleChange}
          />
        </div>
      ) : null}

      {error ? (
        <div className="service-map-workspace__status" role="status" aria-live="polite">
          {error}
        </div>
      ) : null}

      <div className="service-map-workspace__map" aria-label={readText(t, "workspace_feature_pages.service_map.sections.map", "Kaart")}>
        <ServiceMapLeaflet
          entries={mappableEntries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={handleSelectEntry}
          t={t}
        />
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

function serviceProfileStatusLabel(t, status) {
  const normalized = String(status || "DRAFT").toUpperCase();
  if (normalized === "PUBLISHED") return readText(t, "workspace_feature_pages.service_profile.status.published", "Published");
  if (normalized === "REVIEW") return readText(t, "workspace_feature_pages.service_profile.status.review", "Review");
  if (normalized === "HIDDEN") return readText(t, "workspace_feature_pages.service_profile.status.hidden", "Hidden");
  return readText(t, "workspace_feature_pages.service_profile.status.draft", "Draft");
}

function serviceProfileFeeLabel(t, feeType) {
  const normalized = String(feeType || "UNKNOWN").toUpperCase();
  if (normalized === "FREE") return readText(t, "workspace_feature_pages.service_profile.fee.free", "Free");
  if (normalized === "PAID") return readText(t, "workspace_feature_pages.service_profile.fee.paid", "Paid");
  if (normalized === "AGREEMENT") return readText(t, "workspace_feature_pages.service_profile.fee.agreement", "By agreement");
  if (normalized === "MIXED") return readText(t, "workspace_feature_pages.service_profile.fee.mixed", "Mixed");
  return readText(t, "workspace_feature_pages.service_profile.fee.unknown", "Unknown");
}

function serviceProfileMapStatusText(t, mapEntry) {
  if (!mapEntry) {
    return readText(
      t,
      "workspace_feature_pages.service_profile.map_status.empty",
      "A map location can be prepared after the address is saved."
    );
  }

  const geocodingStatus = String(mapEntry.geocodingStatus || "").toUpperCase();
  if (geocodingStatus === "MATCHED" || geocodingStatus === "MANUALLY_CONFIRMED") {
    return readText(
      t,
      "workspace_feature_pages.service_profile.map_status.matched",
      "Address has been matched and can be shown on the service map when the profile is published."
    );
  }
  if (geocodingStatus === "AMBIGUOUS") {
    return readText(
      t,
      "workspace_feature_pages.service_profile.map_status.ambiguous",
      "The address needs clarification before it can be shown on the map."
    );
  }
  if (geocodingStatus === "FAILED") {
    return readText(
      t,
      "workspace_feature_pages.service_profile.map_status.failed",
      "The address could not be matched yet. The marker is not shown on the map."
    );
  }
  return readText(t, "workspace_feature_pages.service_profile.map_status.pending", "The address is waiting for matching.");
}

function ToggleRow({ checked, onChange, title, body, className }) {
  return (
    <FancyCheckbox
      checked={checked}
      onChange={(value) => onChange(Boolean(value))}
      className={cn(
        "workspace-feature-toggle-row workspace-feature-fancy-checkbox fancy-checkbox--top fancy-checkbox--multiline rounded-[0.92rem] border px-[0.86rem] py-[0.72rem]",
        className
      )}
      label={
        <span className="grid gap-[0.18rem]">
          <span className="text-[0.98rem] font-[680] leading-[1.2]">{title}</span>
          {body ? <span className="text-[0.9rem] font-[500] leading-[1.35] opacity-[0.72]">{body}</span> : null}
        </span>
      }
    />
  );
}

function ServiceProfileGlowField({ children, className, style }) {
  return (
    <BorderGlow
      as="div"
      className={cn("service-profile-glow-field", className)}
      edgeSensitivity={30}
      glowColor="358 82 72"
      backgroundColor="#1E222A"
      borderRadius={14}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={{ ...fieldEdgeGlowStyle, ...style }}
    >
      {children}
    </BorderGlow>
  );
}

function ServiceProfileInput({ className, ...props }) {
  return (
    <ServiceProfileGlowField>
      <input
        className={cn(fieldClassName, "service-profile-glow-control", className)}
        {...props}
      />
    </ServiceProfileGlowField>
  );
}

function ServiceProfileTextarea({ className, ...props }) {
  return (
    <ServiceProfileGlowField className={className}>
      <textarea
        className={cn(fieldClassName, "documents-field--textarea service-profile-glow-control service-profile-glow-control--textarea")}
        {...props}
      />
    </ServiceProfileGlowField>
  );
}

function ServiceProfileSurface({ t }) {
  const [form, setForm] = useState(() => createServiceProfileForm());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const feeOptions = useMemo(
    () => [
      { value: "UNKNOWN", label: readText(t, "workspace_feature_pages.service_profile.fee.unknown", "Unknown") },
      { value: "FREE", label: readText(t, "workspace_feature_pages.service_profile.fee.free", "Free") },
      { value: "PAID", label: readText(t, "workspace_feature_pages.service_profile.fee.paid", "Paid") },
      { value: "AGREEMENT", label: readText(t, "workspace_feature_pages.service_profile.fee.agreement", "By agreement") },
      { value: "MIXED", label: readText(t, "workspace_feature_pages.service_profile.fee.mixed", "Mixed") }
    ],
    [t]
  );
  const statusOptions = useMemo(
    () => [
      { value: "DRAFT", label: readText(t, "workspace_feature_pages.service_profile.status.draft", "Draft") },
      { value: "REVIEW", label: readText(t, "workspace_feature_pages.service_profile.status.review", "Review") },
      { value: "PUBLISHED", label: readText(t, "workspace_feature_pages.service_profile.status.published", "Published") },
      { value: "HIDDEN", label: readText(t, "workspace_feature_pages.service_profile.status.hidden", "Hidden") }
    ],
    [t]
  );

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

  const mapEntry = profile?.serviceMapEntry || null;
  const canPublishToMap =
    form.mapVisible &&
    form.status === "PUBLISHED" &&
    (String(mapEntry?.geocodingStatus || "").toUpperCase() === "MATCHED" ||
      String(mapEntry?.geocodingStatus || "").toUpperCase() === "MANUALLY_CONFIRMED");
  const saveLabel = saving
    ? readText(t, "workspace_feature_pages.service_profile.actions.saving", "Saving...")
    : readText(t, "workspace_feature_pages.service_profile.actions.save", "Save changes");

  return (
    <form onSubmit={handleSubmit} className="service-profile-form mx-auto grid w-full max-w-[58rem] gap-[1rem]">
      <div className="grid gap-[0.72rem] pb-[0.9rem]">
        <div className="flex flex-wrap items-start justify-between gap-[0.82rem]">
          <div className="grid max-w-[42rem] gap-[0.3rem]">
            <p className="m-0 text-[1.02rem] font-[680] leading-[1.25] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">
              {readText(t, "workspace_feature_pages.service_profile.overview.title", "Service provider workspace")}
            </p>
            <p className={bodyTextClassName}>
              {readText(
                t,
                "workspace_feature_pages.service_profile.overview.body",
                "Manage the information people need before contacting you: services, area, contact channels and whether pre-inquiries are accepted."
              )}
            </p>
          </div>
          <Button type="submit" disabled={loading || saving || !form.organizationName.trim()}>
            {saveLabel}
          </Button>
        </div>
        <div className="grid gap-[0.56rem] sm:grid-cols-3">
          <div className="workspace-feature-inline-stat">
            <span className="workspace-feature-inline-stat__label">
              {readText(t, "workspace_feature_pages.service_profile.summary.status", "Status")}
            </span>
            <strong className="workspace-feature-inline-stat__value">
              {serviceProfileStatusLabel(t, form.status)}
            </strong>
          </div>
          <div className="workspace-feature-inline-stat">
            <span className="workspace-feature-inline-stat__label">
              {readText(t, "workspace_feature_pages.service_profile.summary.price", "Price")}
            </span>
            <strong className="workspace-feature-inline-stat__value">
              {serviceProfileFeeLabel(t, form.feeType)}
            </strong>
          </div>
          <div className="workspace-feature-inline-stat">
            <span className="workspace-feature-inline-stat__label">
              {readText(t, "workspace_feature_pages.service_profile.summary.map_status", "Teenusekaart")}
            </span>
            <strong className={cn("workspace-feature-inline-stat__value", canPublishToMap && "text-[color:var(--workspace-feature-accent)]")}>
              {canPublishToMap
                ? readText(t, "workspace_feature_pages.service_profile.summary.map_ready", "Map ready")
                : readText(t, "workspace_feature_pages.service_profile.summary.map_not_ready", "Map not shown yet")}
            </strong>
          </div>
        </div>
      </div>

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

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.profile", "Service information")}>
        <div className="grid gap-[0.72rem] sm:grid-cols-2">
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.organization", "Organization name")}</span>
            <ServiceProfileInput value={form.organizationName} onChange={(event) => updateField("organizationName", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.categories", "Categories")}</span>
            <ServiceProfileInput value={form.serviceCategories} onChange={(event) => updateField("serviceCategories", event.target.value)} />
          </Label>
        </div>
        <Label>
          <span>{readText(t, "workspace_feature_pages.service_profile.fields.short_description", "Short description")}</span>
          <ServiceProfileTextarea
            className="min-h-[7rem]"
            value={form.shortDescription}
            onChange={(event) => updateField("shortDescription", event.target.value)}
          />
        </Label>
        <div className="grid gap-[0.72rem] sm:grid-cols-2">
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.services", "Services")}</span>
            <ServiceProfileTextarea className="min-h-[6.2rem]" value={form.services} onChange={(event) => updateField("services", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.target_groups", "Target groups")}</span>
            <ServiceProfileTextarea className="min-h-[6.2rem]" value={form.targetGroups} onChange={(event) => updateField("targetGroups", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.fee_type", "Price")}</span>
            <ServiceProfileGlowField>
              <DocumentsDropdown
                ariaLabel={readText(t, "workspace_feature_pages.service_profile.fields.fee_type", "Price")}
                value={form.feeType}
                onChange={(nextValue) => updateField("feeType", nextValue)}
                options={feeOptions}
                className="workspace-feature-dropdown service-profile-glow-dropdown"
              />
            </ServiceProfileGlowField>
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.languages", "Languages")}</span>
            <ServiceProfileInput value={form.languages} onChange={(event) => updateField("languages", event.target.value)} />
          </Label>
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.area", "Service area and location")}>
        <div className="grid gap-[0.72rem] sm:grid-cols-2">
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.service_area", "Service area")}</span>
            <ServiceProfileInput value={form.serviceArea} onChange={(event) => updateField("serviceArea", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.municipalities", "Municipality IDs or names")}</span>
            <ServiceProfileInput value={form.serviceAreaMunicipalityIds} onChange={(event) => updateField("serviceAreaMunicipalityIds", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.county", "County")}</span>
            <ServiceProfileInput value={form.county} onChange={(event) => updateField("county", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.address", "Address or reception location")}</span>
            <ServiceProfileInput value={form.address} onChange={(event) => updateField("address", event.target.value)} />
          </Label>
        </div>
        <ToggleRow
          checked={form.mapVisible}
          onChange={(value) => updateField("mapVisible", value)}
          title={readText(t, "workspace_feature_pages.service_profile.visibility.visible", "Visible on service map")}
          body={readText(
            t,
            "workspace_feature_pages.service_profile.visibility.visible_help",
            "The service is shown on the map only when the profile is published and the address has a reliable match."
          )}
        />
        <div className="grid gap-[0.22rem] pt-[0.72rem]">
          <p className="m-0 text-[0.98rem] font-[680] leading-[1.25] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">
            {readText(t, "workspace_feature_pages.service_profile.map_status.title", "Address status")}
          </p>
          <p className={bodyTextClassName}>{serviceProfileMapStatusText(t, mapEntry)}</p>
          {mapEntry?.normalizedAddress || mapEntry?.address ? (
            <p className={bodyTextClassName}>{mapEntry.normalizedAddress || mapEntry.address}</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.contact", "Contact and pre-inquiries")}>
        <div className="grid gap-[0.72rem] sm:grid-cols-3">
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.phone", "Phone")}</span>
            <ServiceProfileInput value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.email", "Email")}</span>
            <ServiceProfileInput type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.website", "Website")}</span>
            <ServiceProfileInput value={form.website} onChange={(event) => updateField("website", event.target.value)} />
          </Label>
        </div>
        <div className="grid gap-[0.64rem] pt-[0.72rem] sm:grid-cols-2">
          <ToggleRow
            checked={form.acceptsPlatformPreInquiries}
            onChange={(value) => updateField("acceptsPlatformPreInquiries", value)}
            title={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_platform", "Accept pre-inquiries in SotsiaalAI")}
            body={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.platform_help", "People can send an internal pre-inquiry to this provider account.")}
            className="workspace-feature-toggle-row--flat"
          />
          <ToggleRow
            checked={form.acceptsEmailPreInquiries}
            onChange={(value) => updateField("acceptsEmailPreInquiries", value)}
            title={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_email", "Accept pre-inquiries by email")}
            body={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.email_help", "The workflow can prepare an email draft for the contact address.")}
            className="workspace-feature-toggle-row--flat"
          />
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.publish", "Publishing")}>
        <div className="service-profile-publish-layout">
          <Label>
            <span>{readText(t, "workspace_feature_pages.service_profile.fields.accessibility_info", "Accessibility info")}</span>
            <ServiceProfileTextarea
              className="min-h-[6.6rem]"
              value={form.accessibilityInfo}
              onChange={(event) => updateField("accessibilityInfo", event.target.value)}
            />
          </Label>
          <div className="service-profile-publish-side">
            <Label>
              <span>{readText(t, "workspace_feature_pages.service_profile.fields.status", "Status")}</span>
              <ServiceProfileGlowField>
                <DocumentsDropdown
                  ariaLabel={readText(t, "workspace_feature_pages.service_profile.fields.status", "Status")}
                  value={form.status}
                  onChange={(nextValue) => updateField("status", nextValue)}
                  options={statusOptions}
                  openDirection="up"
                  className="workspace-feature-dropdown service-profile-glow-dropdown"
                />
              </ServiceProfileGlowField>
            </Label>
            <p className={`${bodyTextClassName} service-profile-publish-help`}>
              {readText(
                t,
                "workspace_feature_pages.service_profile.publish_help",
                "Draft and review profiles are not shown on the service map. Published profiles still need a reliable address match before a marker appears."
              )}
            </p>
            <Button type="submit" disabled={loading || saving || !form.organizationName.trim()} className="service-profile-publish-save justify-self-start">
              {saveLabel}
            </Button>
          </div>
        </div>
      </SectionCard>
    </form>
  );
}

export default function WorkspaceFeaturePage({ feature }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const {
    effectiveRole,
    isAdmin: effectiveRoleIsAdmin,
    isRoleResolved,
    refresh: refreshEffectiveRole
  } = useEffectiveRole();
  const isAdmin = Boolean(
    effectiveRoleIsAdmin ||
    session?.user?.isAdmin ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN"
  );
  const [adminWorkspaceRole, setAdminWorkspaceRole] = useState("SOCIAL_WORKER");
  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => {
    if (!isAdmin || !isRoleResolved) return;
    setAdminWorkspaceRole(normalizeWorkspaceRole(effectiveRole));
  }, [effectiveRole, isAdmin, isRoleResolved]);

  const handleAdminWorkspaceRoleChange = useCallback((nextRole) => {
    setAdminWorkspaceRole(normalizeWorkspaceRole(nextRole));
    refreshEffectiveRole();
  }, [refreshEffectiveRole]);

  const featureKey =
    feature === "service_map" || feature === "service_profile"
      ? feature
      : "pre_inquiries";
  const shouldTiltOnBack = featureKey !== "service_map";

  const handleBack = useCallback(() => {
    if (isClosing) return;
    if (shouldTiltOnBack) {
      setIsClosing(true);
    }
    if (typeof window === "undefined") {
      workspaceReturn(locale, router, { persistGlassRingTilt: false });
      return;
    }
    window.requestAnimationFrame(() => {
      workspaceReturn(locale, router, { persistGlassRingTilt: false });
    });
  }, [isClosing, locale, router, shouldTiltOnBack]);

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
        isServiceMap
          ? `workspace-feature-panel service-map-page-panel ${glassPrimaryButtonToneClassName} ${glassSubpageSurfaceScopeClassName}`
          : panelClassName,
        isClosing && !isServiceMap ? "workspace-guide-panel--collapse" : null,
        isClosing ? workspaceBackTiltClassName : null
      )}>
        <div className={cn(isServiceMap ? "workspace-feature-content service-map-page-content relative" : contentClassName)}>
          {showAdminRoleSelector ? (
            <AdminRoleSelector
              t={t}
              locale={locale}
              value={activeWorkspaceRole}
              onChange={handleAdminWorkspaceRoleChange}
              className="workspace-feature-admin-role--floating"
            />
          ) : null}

          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={readText(t, "workspace_feature_pages.back_to_workspace", "Back to workspace")}
            showBack={!isServiceMap}
            holdPressedVisualDisabled
            headerClassName={isServiceMap ? "service-map-page-header" : null}
            titleWrapClassName={isServiceMap ? "service-map-page-title-wrap" : null}
            titleClassName={isServiceMap ? "service-map-page-title" : null}
          >
            {title}
          </GlassSubpageHeader>

          {lead && !isServiceMap && activeWorkspaceRole === "CLIENT" ? <p className="mx-auto m-0 max-w-[54rem] text-left text-[1.12rem] leading-[1.58] tracking-[0] opacity-[0.86] max-[768px]:px-[0.05rem] max-[768px]:text-[1rem] max-[768px]:leading-[1.52]">{lead}</p> : null}

          {featureKey === "pre_inquiries" ? <PreInquiriesSurface t={t} locale={locale} activeRole={activeWorkspaceRole} isAdmin={isAdmin} currentUserId={session?.user?.id || ""} /> : null}
          {featureKey === "service_map" ? <ServiceMapSurface t={t} locale={locale} activeRole={activeWorkspaceRole} isAdmin={isAdmin} onRoleChange={handleAdminWorkspaceRoleChange} onBack={handleBack} /> : null}
          {featureKey === "service_profile" ? <ServiceProfileSurface t={t} /> : null}
        </div>
      </div>
    </section>
  );
}
