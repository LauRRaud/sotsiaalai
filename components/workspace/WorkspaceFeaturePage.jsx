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
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
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
import {
  PRE_INQUIRY_ASSESSMENT_PATHS,
  PRE_INQUIRY_CONSENT_OPTIONS,
  PRE_INQUIRY_DOMAIN_DEFINITIONS,
  PRE_INQUIRY_SCREEN_OPTIONS,
  PRE_INQUIRY_SUBJECT_OPTIONS,
  PRE_INQUIRY_URGENCY_OPTIONS,
  buildPreInquiryAssessmentExportText,
  buildPreInquiryAssessmentReview,
  buildPreInquiryAssessmentSituation,
  createEmptyPreInquiryAssessmentState,
  getPreInquiryQuestionFollowUpQuestions,
  normalizePreInquiryAssessmentState
} from "@/lib/preInquiriesQuestionnaire";
import { buildRoomChatPath } from "@/lib/roomPath";
import { pushWithTransition } from "@/lib/routeTransition";
import AdminRoleViewCycleButton from "./AdminRoleViewCycleButton";
import ServiceMapLeaflet from "./ServiceMapLeaflet";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";
const SERVICE_MAP_ENTRIES_FETCH_LIMIT = 2000;
const SERVICE_MAP_RESULT_BUTTON_LIMIT = 56;

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
  `workspace-feature-content relative ${workspaceGuidePanelScrollClassName} ${glassSubpageContentWideClassName} mx-auto grid content-start gap-[1rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:gap-[0.82rem] max-[768px]:px-[0.05rem] max-[768px]:pb-[0.88rem]`;

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
  }
  pushWithTransition(router, localizePath("/vestlus", locale), {
    ...options
  });
}

function clearServiceMapPageState() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("service-map-page-active");
  document.body?.classList.remove("service-map-page-active");
}

function getWorkspaceFeatureInfoId(featureKey, activeRole) {
  if (featureKey === "service_map") return "service_map";
  if (featureKey === "service_profile") return "service_profile";
  if (featureKey === "pre_inquiries") {
    return activeRole === "CLIENT" ? "pre_inquiry" : "intake";
  }
  return "workspace";
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

function buildPreInquiryRecipientMailto({ recipient, topic, draft, situation }) {
  const email = String(recipient?.email || "").trim();
  if (!email) return "";
  const subject = String(topic || "Pöördumine").trim();
  const body = String(draft || buildLocalPreInquiryDraft({ topic, situation, recipient }) || "").trim();
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function isKovServiceMapEntry(entry) {
  return entry?.type === "KOV_SOCIAL_CONTACT" || entry?.type === "KOV_GENERAL_CONTACT";
}

function serviceMapEntryMatchesType(entry, entryType) {
  if (!entryType || entryType === "ALL") return true;
  if (entryType === "KOV_SOCIAL_CONTACT" || entryType === "KOV_CONTACT") return isKovServiceMapEntry(entry);
  return entry?.type === entryType;
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
  const [assessmentState, setAssessmentState] = useState(() => createEmptyPreInquiryAssessmentState());
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
          fetch(`/api/service-map/entries?limit=${SERVICE_MAP_ENTRIES_FETCH_LIMIT}&includeUnlocated=1&includeNeedsReview=1`, { cache: "no-store" }),
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
  const normalizedAssessmentState = useMemo(
    () => normalizePreInquiryAssessmentState(assessmentState),
    [assessmentState]
  );
  const assessmentSituation = useMemo(
    () => buildPreInquiryAssessmentSituation(normalizedAssessmentState),
    [normalizedAssessmentState]
  );
  const effectiveSituation = situation.trim() || assessmentSituation;
  const selectedRecipientMailto = useMemo(
    () => buildPreInquiryRecipientMailto({
      recipient: selectedRecipient,
      topic,
      draft,
      situation: effectiveSituation
    }),
    [draft, effectiveSituation, selectedRecipient, topic]
  );
  const assessmentExportText = useMemo(
    () => buildPreInquiryAssessmentExportText(normalizedAssessmentState, {
      topic,
      situation: effectiveSituation,
      draft,
      recipientName: selectedRecipient?.title || ""
    }),
    [draft, effectiveSituation, normalizedAssessmentState, selectedRecipient?.title, topic]
  );
  const assessmentReview = useMemo(
    () => buildPreInquiryAssessmentReview(normalizedAssessmentState, { topic }),
    [normalizedAssessmentState, topic]
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
      situation: effectiveSituation,
      recipient: selectedRecipient
    }));
  }, [draftTouched, effectiveSituation, selectedRecipient, topic]);

  function updateAssessmentState(updater) {
    setAssessmentState((current) => {
      const normalized = normalizePreInquiryAssessmentState(current);
      const next = typeof updater === "function" ? updater(normalized) : updater;
      return normalizePreInquiryAssessmentState(next);
    });
    setDraftTouched(false);
  }

  function handleAssessmentPathChange(pathId) {
    updateAssessmentState((current) => ({
      ...createEmptyPreInquiryAssessmentState(pathId),
      subject: current.subject,
      supportContext: current.supportContext
    }));
  }

  function updateAssessmentSubject(field, value) {
    updateAssessmentState((current) => ({
      ...current,
      subject: {
        ...current.subject,
        [field]: value
      }
    }));
  }

  function updateAssessmentSupport(field, value) {
    updateAssessmentState((current) => ({
      ...current,
      supportContext: {
        ...current.supportContext,
        [field]: value
      }
    }));
  }

  function updatePrimaryQuestionAnswer(domainId, questionId, screenAnswer) {
    updateAssessmentState((current) => ({
      ...current,
      domains: current.domains.map((domain) => (
        domain.id === domainId
          ? {
              ...domain,
              primaryAnswers: domain.primaryAnswers.map((primaryAnswer) => (
                primaryAnswer.id === questionId
                  ? {
                      ...primaryAnswer,
                      screenAnswer,
                      followUpAnswers: screenAnswer === "INDEPENDENT" || screenAnswer === "NOT_APPLICABLE"
                        ? {}
                        : primaryAnswer.followUpAnswers
                    }
                  : primaryAnswer
              ))
            }
          : domain
      ))
    }));
  }

  function updatePrimaryQuestionFollowUpAnswer(domainId, questionId, question, answer) {
    updateAssessmentState((current) => ({
      ...current,
      domains: current.domains.map((domain) => (
        domain.id === domainId
          ? {
              ...domain,
              primaryAnswers: domain.primaryAnswers.map((primaryAnswer) => (
                primaryAnswer.id === questionId
                  ? {
                      ...primaryAnswer,
                      followUpAnswers: {
                        ...primaryAnswer.followUpAnswers,
                        [question]: answer
                      }
                    }
                  : primaryAnswer
              ))
            }
          : domain
      ))
    }));
  }

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
    setAssessmentState(createEmptyPreInquiryAssessmentState());
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
    setAssessmentState(normalizePreInquiryAssessmentState(inquiry.assessmentState || createEmptyPreInquiryAssessmentState()));
    setAssistantSuggestions([]);
    setShowMoreContacts(false);
    setDraftTouched(true);
    setNotice("");
    setError("");
  }

  async function handleSave(event, options = {}) {
    event?.preventDefault?.();
    const saveSituation = situation.trim() || assessmentSituation;
    const nextStatus = options?.status || "DRAFT";
    if (saving || !saveSituation.trim()) return;

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
          situation: saveSituation,
          assessmentState: normalizedAssessmentState,
          recipientType,
          recipientEntryId: selectedRecipient?.id || null,
          selectedRecipientName: selectedRecipient?.title || "",
          selectedRecipientEmail: selectedRecipient?.email || "",
          userEditedDraft: draft,
          status: nextStatus,
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
        setAssessmentState(normalizePreInquiryAssessmentState(inquiry.assessmentState || normalizedAssessmentState));
        setDraft(inquiry.userEditedDraft || inquiry.generatedDraft || draft);
        setDraftTouched(true);
      }
      setNotice(nextStatus === "SENT"
        ? readText(t, "workspace_feature_pages.pre_inquiries.send_success", "Eelpöördumine saadetud.")
        : readText(t, "workspace_feature_pages.pre_inquiries.save_success", "Pre-inquiry saved."));
    } catch (saveError) {
      const message = saveError?.message === "pre_inquiries.errors.internal_recipient_required"
        ? readText(t, "workspace_feature_pages.pre_inquiries.errors.internal_recipient_required", "Platvormis saatmiseks vali kontakt, kelle konto võtab eelpöördumisi vastu.")
        : saveError?.message || readText(t, "workspace_feature_pages.pre_inquiries.errors.save_failed", "Pre-inquiry could not be saved.");
      setError(message);
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
    const content = assessmentExportText || draft;
    if (!content.trim() || typeof window === "undefined") return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
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
    const baseSituation = situation.trim() || assessmentSituation;
    if (assisting || (!message && !baseSituation.trim())) return;
    const shouldAppendMessage = options.appendMessage !== false;
    const nextSituation = shouldAppendMessage
      ? [baseSituation, message].filter(Boolean).join(baseSituation && message ? "\n\n" : "")
      : baseSituation;
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
              {activeReceivedInquiry.assessmentState ? (
                <ServiceProfileTextarea
                  readOnly
                  value={buildPreInquiryAssessmentExportText(activeReceivedInquiry.assessmentState, {
                    topic: activeReceivedInquiry.topic || "",
                    situation: activeReceivedInquiry.situation || "",
                    draft: activeReceivedInquiry.userEditedDraft || activeReceivedInquiry.generatedDraft || "",
                    recipientName: activeReceivedInquiry.selectedRecipientName || ""
                  })}
                  className="min-h-[14rem]"
                />
              ) : null}
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

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.assessment", "Eelkaardistus")}>
        <p className={bodyTextClassName}>
          {readText(t, "workspace_feature_pages.pre_inquiries.assessment.note", "Eelkaardistus ei ole ametlik abivajaduse hindamine ega teenuse määramise otsus. See aitab olukorda läbi mõelda ja pöördumist ette valmistada.")}
        </p>
        <div className="grid gap-[0.54rem] md:grid-cols-3">
          {PRE_INQUIRY_ASSESSMENT_PATHS.map((path) => (
            <OptionCard
              key={path.id}
              type="radio"
              name="pre-inquiry-assessment-path"
              value={path.id}
              checked={normalizedAssessmentState.path === path.id}
              onChange={() => handleAssessmentPathChange(path.id)}
              className={cn(preInquiryRecipientTypeCardClassName, "h-full items-start rounded-[1rem] px-[0.8rem] py-[0.72rem] text-left")}
              fitTextLines={4}
            >
              <span className="grid gap-[0.28rem]">
                <span className="font-[740] leading-[1.14]">{path.title}</span>
                <span className="text-[0.82rem] font-[500] leading-[1.26] opacity-[0.76]">{path.description}</span>
              </span>
            </OptionCard>
          ))}
        </div>

        <div className="grid gap-[0.62rem] md:grid-cols-2">
          <div className="grid gap-[0.34rem] text-[0.9rem] font-[620] leading-[1.2] opacity-[0.9]">
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.concerns_about", "Kelle kohta pöördumine käib")}</span>
            <div className="grid gap-[0.42rem]">
              {PRE_INQUIRY_SUBJECT_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  type="radio"
                  name="pre-inquiry-subject"
                  value={option}
                  checked={normalizedAssessmentState.subject.concernsAbout === option}
                  onChange={() => updateAssessmentSubject("concernsAbout", option)}
                  className={cn(preInquiryRecipientTypeCardClassName, "min-h-[2.64rem] rounded-[0.88rem] px-[0.64rem] py-[0.44rem] text-left text-[0.88rem]")}
                  fitTextLines={2}
                >
                  <span className="leading-[1.18]">{option}</span>
                </OptionCard>
              ))}
            </div>
          </div>
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.municipality", "KOV või piirkond")}</span>
            <ServiceProfileInput
              value={normalizedAssessmentState.subject.municipalityText}
              onChange={(event) => updateAssessmentSubject("municipalityText", event.target.value)}
              placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.municipality", "Näiteks Tallinn, Põltsamaa vald või piirkond")}
            />
          </Label>
          <div className="grid gap-[0.34rem] text-[0.9rem] font-[620] leading-[1.2] opacity-[0.9]">
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.urgency", "Kiireloomulisus")}</span>
            <div className="grid gap-[0.42rem]">
              {PRE_INQUIRY_URGENCY_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  type="radio"
                  name="pre-inquiry-urgency"
                  value={option}
                  checked={normalizedAssessmentState.subject.urgency === option}
                  onChange={() => updateAssessmentSubject("urgency", option)}
                  className={cn(preInquiryRecipientTypeCardClassName, "min-h-[2.64rem] rounded-[0.88rem] px-[0.64rem] py-[0.44rem] text-left text-[0.88rem]")}
                  fitTextLines={2}
                >
                  <span className="leading-[1.18]">{option}</span>
                </OptionCard>
              ))}
            </div>
          </div>
          <div className="grid gap-[0.34rem] text-[0.9rem] font-[620] leading-[1.2] opacity-[0.9]">
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.consent", "Nõusolek või pöördumise alus")}</span>
            <div className="grid gap-[0.42rem]">
              {PRE_INQUIRY_CONSENT_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  type="radio"
                  name="pre-inquiry-consent"
                  value={option}
                  checked={normalizedAssessmentState.subject.consentStatus === option}
                  onChange={() => updateAssessmentSubject("consentStatus", option)}
                  className={cn(preInquiryRecipientTypeCardClassName, "min-h-[2.64rem] rounded-[0.88rem] px-[0.64rem] py-[0.44rem] text-left text-[0.88rem]")}
                  fitTextLines={2}
                >
                  <span className="leading-[1.18]">{option}</span>
                </OptionCard>
              ))}
            </div>
          </div>
        </div>

        {normalizedAssessmentState.riskGate.userVisibleMessage ? (
          <p className="m-0 rounded-[0.9rem] border border-[rgba(208,116,108,0.28)] bg-[rgba(58,22,25,0.62)] px-[0.8rem] py-[0.62rem] text-[0.94rem] font-[620] leading-[1.36] text-[rgba(255,231,226,0.98)]">
            {normalizedAssessmentState.riskGate.userVisibleMessage}
          </p>
        ) : null}
        {normalizedAssessmentState.subject.concernsAbout === "Lapse või noore kohta" && normalizedAssessmentState.path !== "QUICK_DESCRIPTION" ? (
          <p className="m-0 rounded-[0.9rem] border border-[rgba(218,182,94,0.26)] bg-[rgba(56,43,17,0.48)] px-[0.8rem] py-[0.62rem] text-[0.92rem] leading-[1.36] text-[rgba(255,241,205,0.96)]">
            {readText(t, "workspace_feature_pages.pre_inquiries.assessment.child_note", "See eelkaardistus lähtub praegu täisealise inimese eluvaldkondade põhiküsimustest. Lapse või noore olukorra puhul kirjelda mure kindlasti ka oma sõnadega; eraldi lapse ja pere eelkaardistus vajab oma küsimustikku.")}
          </p>
        ) : null}

        <Label>
          <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.situation", "Olukorra kirjeldus inimese sõnadega")}</span>
          <ServiceProfileTextarea
            value={situation}
            onChange={(event) => {
              setSituation(event.target.value);
              setDraftTouched(false);
            }}
            placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.situation", "Kirjelda lühidalt, mis olukord vajab abi. Teenuse nime ei pea teadma.")}
            className="min-h-[8rem]"
          />
        </Label>

        {normalizedAssessmentState.path !== "QUICK_DESCRIPTION" ? (
          <div className="grid gap-[0.74rem]">
            <h3 className="m-0 text-[1.02rem] font-[720] leading-[1.18]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.domains_title", "Eluvaldkonnad")}
            </h3>
            {PRE_INQUIRY_DOMAIN_DEFINITIONS.map((definition) => {
              const domain = normalizedAssessmentState.domains.find((item) => item.id === definition.id) || {};
              return (
                <div key={definition.id} className="workspace-feature-list-card grid gap-[0.56rem] rounded-[0.92rem] border px-[0.82rem] py-[0.74rem]">
                  <div className="grid gap-[0.18rem]">
                    <h4 className="m-0 text-[0.98rem] font-[730] leading-[1.15]">{definition.title}</h4>
                    <p className="m-0 text-[0.82rem] leading-[1.3] opacity-[0.66]">{definition.helperText}</p>
                  </div>
                  <div className="grid gap-[0.6rem]">
                    {definition.primaryQuestions.map((primaryQuestion) => {
                      const primaryAnswer = domain.primaryAnswers?.find((answer) => answer.id === primaryQuestion.id) || {};
                      const followUpQuestions = getPreInquiryQuestionFollowUpQuestions(
                        primaryQuestion,
                        normalizedAssessmentState.path,
                        primaryAnswer.screenAnswer
                      );
                      return (
                        <div key={primaryQuestion.id} className="grid gap-[0.5rem] rounded-[0.82rem] border border-[color:rgba(255,255,255,0.12)] px-[0.7rem] py-[0.62rem]">
                          <div className="grid gap-[0.16rem]">
                            <p className="m-0 text-[0.82rem] font-[720] leading-[1.22] opacity-[0.68]">{primaryQuestion.title}</p>
                            <p className="m-0 text-[0.92rem] leading-[1.35] opacity-[0.86]">{primaryQuestion.question}</p>
                          </div>
                          <div className="grid gap-[0.42rem] sm:grid-cols-2 lg:grid-cols-5">
                            {PRE_INQUIRY_SCREEN_OPTIONS.map((option) => (
                              <OptionCard
                                key={option.value}
                                type="radio"
                                name={`pre-inquiry-question-${definition.id}-${primaryQuestion.id}`}
                                value={option.value}
                                checked={primaryAnswer.screenAnswer === option.value}
                                onChange={() => updatePrimaryQuestionAnswer(definition.id, primaryQuestion.id, option.value)}
                                className={cn(preInquiryRecipientTypeCardClassName, "min-h-[3.1rem] rounded-[0.9rem] px-[0.58rem] py-[0.48rem] text-[0.86rem]")}
                                fitTextLines={2}
                              >
                                <span className="text-center leading-[1.16]">{option.label}</span>
                              </OptionCard>
                            ))}
                          </div>
                          {followUpQuestions.length ? (
                            <div className="grid gap-[0.5rem]">
                              {followUpQuestions.map((question) => (
                                <Label key={question}>
                                  <span>{question}</span>
                                  <ServiceProfileTextarea
                                    value={primaryAnswer.followUpAnswers?.[question] || ""}
                                    onChange={(event) => updatePrimaryQuestionFollowUpAnswer(definition.id, primaryQuestion.id, question, event.target.value)}
                                    className="min-h-[5.6rem]"
                                    placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.follow_up", "Vasta oma sõnadega. Võid jätta tühjaks, kui ei tea.")}
                                  />
                                </Label>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="grid gap-[0.62rem] md:grid-cols-3">
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.existing_support", "Olemasolev abi")}</span>
            <ServiceProfileTextarea
              value={normalizedAssessmentState.supportContext.existingSupport}
              onChange={(event) => updateAssessmentSupport("existingSupport", event.target.value)}
              placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.existing_support", "Kes või mis praegu aitab?")}
              className="min-h-[5.6rem]"
            />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.support_adequacy", "Kas abist piisab")}</span>
            <ServiceProfileTextarea
              value={normalizedAssessmentState.supportContext.supportAdequacy}
              onChange={(event) => updateAssessmentSupport("supportAdequacy", event.target.value)}
              placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.support_adequacy", "Näiteks piisab, ei piisa või abistaja on ülekoormatud")}
              className="min-h-[5.6rem]"
            />
          </Label>
          <Label>
            <span>{readText(t, "workspace_feature_pages.pre_inquiries.fields.person_wish", "Inimese enda soov")}</span>
            <ServiceProfileTextarea
              value={normalizedAssessmentState.supportContext.personWish}
              onChange={(event) => updateAssessmentSupport("personWish", event.target.value)}
              placeholder={readText(t, "workspace_feature_pages.pre_inquiries.placeholders.person_wish", "Mida inimene ise kõige rohkem soovib?")}
              className="min-h-[5.6rem]"
            />
          </Label>
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.pre_inquiries.sections.assessment_review", "Vaata eelkaardistus enne saatmist üle")}>
        <p className={bodyTextClassName}>
          {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_note", "Ülevaade koondab täpselt need eelkaardistuse vastused ja täpsustused, mis lähevad salvestatud eelpöördumise ning allalaaditava eelinfo juurde.")}
        </p>

        <div className="grid gap-[0.56rem] md:grid-cols-2">
          <div className="workspace-feature-list-card grid gap-[0.24rem] rounded-[0.92rem] border px-[0.82rem] py-[0.7rem]">
            <p className="m-0 text-[0.82rem] font-[720] leading-[1.2] opacity-[0.66]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_path", "Valitud rada")}
            </p>
            <p className="m-0 text-[1rem] font-[720] leading-[1.22]">{assessmentReview.pathTitle}</p>
          </div>
          <div className="workspace-feature-list-card grid gap-[0.24rem] rounded-[0.92rem] border px-[0.82rem] py-[0.7rem]">
            <p className="m-0 text-[0.82rem] font-[720] leading-[1.2] opacity-[0.66]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_progress", "Põhiküsimuste ülevaade")}
            </p>
            {assessmentReview.progress.totalPrimaryCount ? (
              <p className="m-0 text-[1rem] font-[720] leading-[1.22]">
                {`${assessmentReview.progress.answeredPrimaryCount} / ${assessmentReview.progress.totalPrimaryCount} ${readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_answered", "vastatud")}`}
              </p>
            ) : (
              <p className="m-0 text-[0.96rem] leading-[1.34] opacity-[0.86]">
                {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_without_questionnaire", "Selles rajas jääb eelinfo olukorra kirjelduse ja valitud taustandmete juurde.")}
              </p>
            )}
          </div>
        </div>

        {assessmentReview.subjectLines.length ? (
          <dl className="workspace-feature-list-card m-0 grid gap-[0.42rem] rounded-[0.92rem] border px-[0.82rem] py-[0.72rem] md:grid-cols-2">
            {assessmentReview.subjectLines.map((line) => (
              <div key={line.label} className="grid gap-[0.12rem]">
                <dt className="text-[0.8rem] font-[720] leading-[1.2] opacity-[0.64]">{line.label}</dt>
                <dd className="m-0 text-[0.94rem] leading-[1.3] opacity-[0.9]">{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {assessmentReview.riskMessage ? (
          <p className="m-0 rounded-[0.9rem] border border-[rgba(208,116,108,0.28)] bg-[rgba(58,22,25,0.62)] px-[0.8rem] py-[0.62rem] text-[0.94rem] font-[620] leading-[1.36] text-[rgba(255,231,226,0.98)]">
            {assessmentReview.riskMessage}
          </p>
        ) : null}

        {effectiveSituation.trim() ? (
          <div className="workspace-feature-list-card grid gap-[0.28rem] rounded-[0.92rem] border px-[0.82rem] py-[0.72rem]">
            <h3 className="m-0 text-[0.94rem] font-[730] leading-[1.18]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_situation", "Olukorra kirjeldus")}
            </h3>
            <p className="m-0 whitespace-pre-wrap text-[0.93rem] leading-[1.42] opacity-[0.86]">{effectiveSituation}</p>
          </div>
        ) : null}

        {assessmentReview.concernQuestions.length || assessmentReview.unknownQuestions.length ? (
          <div className="grid gap-[0.48rem]">
            <h3 className="m-0 text-[1rem] font-[730] leading-[1.18]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_concerns", "Mured ja täpsustamist vajavad küsimused")}
            </h3>
            {[...assessmentReview.concernQuestions, ...assessmentReview.unknownQuestions].map((question) => (
              <article key={question.id} className="workspace-feature-list-card grid gap-[0.3rem] rounded-[0.92rem] border px-[0.82rem] py-[0.72rem]">
                <div className="flex flex-wrap items-start justify-between gap-[0.34rem]">
                  <p className="m-0 text-[0.82rem] font-[720] leading-[1.2] opacity-[0.66]">
                    {`${question.domainTitle} / ${question.title}`}
                  </p>
                  <span className="rounded-full border px-[0.54rem] py-[0.16rem] text-[0.78rem] font-[720] leading-[1.2] opacity-[0.86]">
                    {question.answerLabel}
                  </span>
                </div>
                <p className="m-0 text-[0.94rem] leading-[1.38] opacity-[0.9]">{question.question}</p>
                {question.followUpAnswers.length ? (
                  <div className="grid gap-[0.34rem]">
                    {question.followUpAnswers.map((answer) => (
                      <div key={`${question.id}-${answer.question}`} className="grid gap-[0.1rem] rounded-[0.72rem] border border-[color:rgba(255,255,255,0.1)] px-[0.62rem] py-[0.48rem]">
                        <p className="m-0 text-[0.8rem] font-[720] leading-[1.24] opacity-[0.64]">{answer.question}</p>
                        <p className="m-0 whitespace-pre-wrap text-[0.9rem] leading-[1.36] opacity-[0.88]">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {assessmentReview.strengthQuestions.length ? (
          <div className="grid gap-[0.48rem]">
            <h3 className="m-0 text-[1rem] font-[730] leading-[1.18]">
              {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_strengths", "Toimivad vastused ja tugevused")}
            </h3>
            <div className="grid gap-[0.38rem]">
              {assessmentReview.strengthQuestions.map((question) => (
                <article key={question.id} className="workspace-feature-list-card grid gap-[0.16rem] rounded-[0.84rem] border px-[0.72rem] py-[0.58rem]">
                  <div className="flex flex-wrap items-start justify-between gap-[0.34rem]">
                    <p className="m-0 text-[0.8rem] font-[720] leading-[1.2] opacity-[0.64]">
                      {`${question.domainTitle} / ${question.title}`}
                    </p>
                    <span className="rounded-full border px-[0.54rem] py-[0.16rem] text-[0.76rem] font-[720] leading-[1.2] opacity-[0.82]">
                      {question.answerLabel}
                    </span>
                  </div>
                  <p className="m-0 text-[0.92rem] leading-[1.34] opacity-[0.88]">{question.question}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {assessmentReview.progress.unansweredPrimaryCount ? (
          <details className="workspace-feature-list-card rounded-[0.92rem] border px-[0.82rem] py-[0.7rem]">
            <summary className="cursor-pointer text-[0.94rem] font-[730] leading-[1.24]">
              {`${readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_unanswered", "Vastamata põhiküsimused")} (${assessmentReview.progress.unansweredPrimaryCount})`}
            </summary>
            <div className="mt-[0.52rem] grid gap-[0.34rem]">
              {assessmentReview.unansweredQuestions.map((question) => (
                <p key={question.id} className="m-0 text-[0.88rem] leading-[1.34] opacity-[0.78]">
                  {`${question.domainTitle} / ${question.title}`}
                </p>
              ))}
            </div>
          </details>
        ) : null}

        {assessmentReview.supportLines.length || assessmentReview.possibleDirections.length ? (
          <div className="workspace-feature-list-card grid gap-[0.46rem] rounded-[0.92rem] border px-[0.82rem] py-[0.72rem]">
            {assessmentReview.supportLines.length ? (
              <dl className="m-0 grid gap-[0.42rem] md:grid-cols-2">
                {assessmentReview.supportLines.map((line) => (
                  <div key={line.label} className="grid gap-[0.12rem]">
                    <dt className="text-[0.8rem] font-[720] leading-[1.2] opacity-[0.64]">{line.label}</dt>
                    <dd className="m-0 whitespace-pre-wrap text-[0.92rem] leading-[1.36] opacity-[0.88]">{line.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {assessmentReview.possibleDirections.length ? (
              <div className="grid gap-[0.24rem]">
                <p className="m-0 text-[0.8rem] font-[720] leading-[1.2] opacity-[0.64]">
                  {readText(t, "workspace_feature_pages.pre_inquiries.assessment.review_directions", "Võimalikud teenuse- või kontaktisuunad")}
                </p>
                <p className="m-0 text-[0.92rem] leading-[1.36] opacity-[0.88]">{assessmentReview.possibleDirections.join(", ")}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>

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
            disabled={assisting || !effectiveSituation.trim()}
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
          <div className="pre-inquiry-recipient-types flex flex-wrap gap-[0.46rem]" role="group" aria-label={readText(t, "workspace_feature_pages.pre_inquiries.fields.recipient_type", "Adressaadi tüüp")}>
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
          {selectedRecipientMailto ? (
            <Button as="a" href={selectedRecipientMailto} size="sm">
              {readText(t, "workspace_feature_pages.pre_inquiries.actions.open_email", "Ava e-kiri")}
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={saving || !effectiveSituation.trim()} onClick={handleSave}>
            {saving
              ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
              : readText(t, "workspace_feature_pages.pre_inquiries.actions.save", "Salvesta")}
          </Button>
          {selectedRecipientId ? (
            <Button type="button" size="sm" disabled={saving || !effectiveSituation.trim()} onClick={(event) => handleSave(event, { status: "SENT" })}>
              {saving
                ? readText(t, "workspace_feature_pages.pre_inquiries.actions.saving", "Salvestan...")
                : readText(t, "workspace_feature_pages.pre_inquiries.actions.send_internal", "Saada platvormis")}
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={!draft.trim()} onClick={handleCopy}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.copy", "Kopeeri")}</Button>
          <Button type="button" size="sm" disabled={!draft.trim() && !effectiveSituation.trim()} onClick={handleDownload}>{readText(t, "workspace_feature_pages.pre_inquiries.actions.download", "Laadi alla")}</Button>
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
        const response = await fetch(`/api/service-map/entries?limit=${SERVICE_MAP_ENTRIES_FETCH_LIMIT}`, { cache: "no-store" });
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
      if (!serviceMapEntryMatchesType(entry, entryType)) return false;
      const haystack = [
        entry.title,
        entry.description,
        entry.address,
        entry.providerProfile?.organizationName,
        ...(entry.providerProfile?.services || []),
        ...(entry.providerProfile?.serviceCategories || []),
        ...(entry.providerProfile?.targetGroups || []),
        ...(entry.providerProfile?.serviceItems || [])
          .filter((service) => service?.mapVisible !== false && String(service?.status || "PUBLISHED").toUpperCase() === "PUBLISHED")
          .flatMap((service) => [
            service?.name,
            service?.description,
            service?.category,
            service?.priceDescription,
            ...(service?.targetGroups || [])
          ])
      ].join(" ").toLocaleLowerCase("et");
      const regionText = [
        entry.municipalityName,
        entry.municipality?.displayName,
        entry.county,
        entry.address,
        entry.providerProfile?.serviceArea,
        ...(entry.providerProfile?.serviceAreas || []),
        ...(entry.providerProfile?.serviceItems || [])
          .filter((service) => service?.mapVisible !== false && String(service?.status || "PUBLISHED").toUpperCase() === "PUBLISHED")
          .map((service) => service?.serviceArea)
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

  const handleKeywordChange = useCallback((event) => {
    setSelectedEntryId("");
    setKeyword(event.target.value);
  }, []);

  const handleRegionChange = useCallback((event) => {
    setSelectedEntryId("");
    setRegion(event.target.value);
  }, []);

  const handleEntryTypeChange = useCallback((event) => {
    setSelectedEntryId("");
    setEntryType(event.target.value);
  }, []);

  const handleSelectEntry = useCallback((entryId) => {
    setSelectedEntryId(entryId);
    if (entryId && isMobilePanel) setPanelOpen(false);
  }, [isMobilePanel]);

  const panelCollapsed = isMobilePanel && !panelOpen;
  const hasResultFilter = Boolean(keyword.trim() || region.trim());
  const showResults = !loading && !error && hasResultFilter && filteredEntries.length > 0;

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
          style={{
            backdropFilter: "blur(var(--service-map-glass-blur)) saturate(160%)",
            WebkitBackdropFilter: "blur(var(--service-map-glass-blur)) saturate(160%)"
          }}
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
                      onChange={handleKeywordChange}
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
                      onChange={handleRegionChange}
                      placeholder={regionPlaceholder}
                    />
                  </GlowField>
                </label>
              </div>

              <div className="service-map-toolbar__types" role="radiogroup" aria-label="Kirje liik">
              {[
                ["KOV_SOCIAL_CONTACT", readText(t, "workspace_feature_pages.service_map.types.kov_social", "KOV sotsiaalhoolekanne")],
                ["SERVICE_PROVIDER", readText(t, "workspace_feature_pages.service_map.types.provider", "Teenuseosutaja")],
                ["ALL", readText(t, "workspace_feature_pages.service_map.types.all", "Kõik")]
              ].map(([value, label]) => (
                  <OptionCard
                    key={value}
                    type="radio"
                    name="service-map-entry-type"
                    value={value}
                    checked={entryType === value}
                    onChange={handleEntryTypeChange}
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
                  {filteredEntries.slice(0, SERVICE_MAP_RESULT_BUTTON_LIMIT).map((entry) => (
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
        <DashboardInfoTrigger
          infoId="service_map"
          title={readText(t, "workspace_feature_pages.service_map.title", "Teenusekaart")}
          className="service-map-workspace__info"
        />
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

function createServiceProfileLocationForm(location = null, index = 0, profile = null) {
  const mapEntry = profile?.serviceMapEntry || null;
  return {
    clientId: location?.id || `location-${index + 1}`,
    label: location?.label || "",
    address: location?.address || location?.normalizedAddress || (index === 0 ? profile?.address || "" : ""),
    normalizedAddress: location?.normalizedAddress || (index === 0 ? profile?.normalizedAddress || mapEntry?.normalizedAddress || "" : ""),
    county: location?.county || profile?.county || "",
    latitude: location?.latitude ?? (index === 0 ? mapEntry?.latitude ?? "" : ""),
    longitude: location?.longitude ?? (index === 0 ? mapEntry?.longitude ?? "" : ""),
    adsObjectId: location?.adsObjectId || (index === 0 ? mapEntry?.adsObjectId || "" : ""),
    geocodingProvider: location?.geocodingProvider || location?.geocodingRaw?.provider || (index === 0 ? mapEntry?.geocodingRaw?.provider || "" : ""),
    phone: location?.phone || "",
    email: location?.email || "",
    website: location?.website || "",
    accessibilityInfo: location?.accessibilityInfo || "",
    mapVisible: location?.mapVisible !== false,
    status: location?.status || (profile?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"),
    sortOrder: Number.isFinite(Number(location?.sortOrder)) ? Number(location.sortOrder) : index
  };
}

function createServiceProfileServiceForm(service = null, index = 0, profile = null) {
  return {
    name: service?.name || "",
    description: service?.description || "",
    category: service?.category || "",
    targetGroups: joinList(service?.targetGroups),
    serviceArea: service?.serviceArea || profile?.serviceArea || "",
    feeType: service?.feeType || profile?.feeType || "UNKNOWN",
    priceDescription: service?.priceDescription || "",
    contactName: service?.contactName || "",
    phone: service?.phone || "",
    email: service?.email || "",
    website: service?.website || "",
    locationIds: Array.isArray(service?.locationIds) ? service.locationIds : [],
    acceptsPlatformPreInquiries: service?.acceptsPlatformPreInquiries ?? profile?.acceptsPlatformPreInquiries ?? true,
    acceptsEmailPreInquiries: service?.acceptsEmailPreInquiries ?? profile?.acceptsEmailPreInquiries ?? true,
    mapVisible: service?.mapVisible !== false,
    status: service?.status || (profile?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"),
    sortOrder: Number.isFinite(Number(service?.sortOrder)) ? Number(service.sortOrder) : index
  };
}

function createServiceProfileForm(profile = null) {
  const mapEntry = profile?.serviceMapEntry || null;
  const serviceLocations = Array.isArray(profile?.serviceLocations) && profile.serviceLocations.length
    ? profile.serviceLocations.map((location, index) => createServiceProfileLocationForm(location, index, profile))
    : (profile?.address || mapEntry?.normalizedAddress)
        ? [createServiceProfileLocationForm(null, 0, profile)]
        : [];
  const serviceItems = Array.isArray(profile?.serviceItems) && profile.serviceItems.length
    ? profile.serviceItems.map((service, index) => createServiceProfileServiceForm(service, index, profile))
    : (Array.isArray(profile?.services) ? profile.services : []).map((name, index) =>
        createServiceProfileServiceForm({ name, sortOrder: index }, index, profile)
      );
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
    normalizedAddress: profile?.normalizedAddress || mapEntry?.normalizedAddress || "",
    latitude: mapEntry?.latitude ?? "",
    longitude: mapEntry?.longitude ?? "",
    adsObjectId: mapEntry?.adsObjectId || "",
    geocodingProvider: mapEntry?.geocodingRaw?.provider || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    languages: joinList(profile?.languages),
    accessibilityInfo: profile?.accessibilityInfo || "",
    feeType: profile?.feeType || "UNKNOWN",
    mapVisible: Boolean(profile?.mapVisible),
    acceptsPlatformPreInquiries: profile?.acceptsPlatformPreInquiries !== false,
    acceptsEmailPreInquiries: profile?.acceptsEmailPreInquiries !== false,
    status: profile?.status || "DRAFT",
    serviceItems,
    serviceLocations
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

function ServiceProfileAddressInput({ t, form, onTyping, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const query = form.address || "";
  const selectedAddress =
    form.normalizedAddress &&
    Number.isFinite(Number(form.latitude)) &&
    Number.isFinite(Number(form.longitude))
      ? form.normalizedAddress
      : "";

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || selectedAddress === trimmed) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          query: trimmed,
          limit: "8"
        });
        if (form.county) params.set("county", form.county);
        const municipalityContext = splitList(form.serviceAreaMunicipalityIds)[0] || "";
        if (municipalityContext) params.set("municipalityName", municipalityContext);
        const response = await fetch(`/api/service-map/address-suggestions?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.message || "address_suggestions_failed");
        setSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []);
        setOpen(true);
      } catch (suggestionError) {
        if (suggestionError?.name !== "AbortError") {
          setSuggestions([]);
          setError(readText(t, "workspace_feature_pages.service_profile.address_search.error", "Address suggestions could not be loaded."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form.county, form.serviceAreaMunicipalityIds, query, selectedAddress, t]);

  return (
    <div className="service-profile-address-field">
      <ServiceProfileInput
        value={query}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => onTyping(event.target.value)}
      />
      {open && (loading || error || suggestions.length > 0) ? (
        <div className="service-profile-address-suggestions" role="listbox">
          {loading ? (
            <p className="service-profile-address-suggestions__state">
              {readText(t, "workspace_feature_pages.service_profile.address_search.loading", "Searching addresses...")}
            </p>
          ) : null}
          {error ? <p className="service-profile-address-suggestions__state">{error}</p> : null}
          {!loading && !error ? suggestions.map((suggestion) => (
            <button
              key={`${suggestion.adsObjectId || suggestion.normalizedAddress}-${suggestion.latitude}-${suggestion.longitude}`}
              type="button"
              className="service-profile-address-suggestion"
              onClick={() => {
                onSelect(suggestion);
                setOpen(false);
              }}
            >
              <span>{suggestion.label || suggestion.normalizedAddress}</span>
            </button>
          )) : null}
        </div>
      ) : null}
      {selectedAddress ? (
        <p className="service-profile-address-selected">
          {readText(t, "workspace_feature_pages.service_profile.address_search.selected", "Official address match selected:")} {selectedAddress}
        </p>
      ) : null}
    </div>
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
  const updateServiceItem = useCallback((index, field, value) => {
    setForm((current) => ({
      ...current,
      serviceItems: current.serviceItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);
  const updateServiceLocation = useCallback((index, field, value) => {
    setForm((current) => ({
      ...current,
      serviceLocations: current.serviceLocations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);
  const addServiceLocation = useCallback(() => {
    setForm((current) => ({
      ...current,
      serviceLocations: [
        ...current.serviceLocations,
        createServiceProfileLocationForm(null, current.serviceLocations.length, current)
      ]
    }));
  }, []);
  const removeServiceLocation = useCallback((index) => {
    setForm((current) => {
      const removed = current.serviceLocations[index]?.clientId;
      return {
        ...current,
        serviceLocations: current.serviceLocations
          .filter((_, itemIndex) => itemIndex !== index)
          .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })),
        serviceItems: current.serviceItems.map((service) => ({
          ...service,
          locationIds: (service.locationIds || []).filter((id) => id !== removed)
        }))
      };
    });
  }, []);
  const updateServiceLocationAddressTyping = useCallback((index, value) => {
    setForm((current) => ({
      ...current,
      serviceLocations: current.serviceLocations.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, address: value, normalizedAddress: "", latitude: "", longitude: "", adsObjectId: "", geocodingProvider: "" }
          : item
      )
    }));
  }, []);
  const selectServiceLocationAddress = useCallback((index, suggestion) => {
    setForm((current) => ({
      ...current,
      serviceLocations: current.serviceLocations.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              address: suggestion.normalizedAddress || suggestion.label || item.address,
              normalizedAddress: suggestion.normalizedAddress || suggestion.label || item.address,
              latitude: suggestion.latitude ?? "",
              longitude: suggestion.longitude ?? "",
              adsObjectId: suggestion.adsObjectId || "",
              geocodingProvider: suggestion.provider || "maaruum"
            }
          : item
      )
    }));
  }, []);
  const addServiceItem = useCallback(() => {
    setForm((current) => ({
      ...current,
      serviceItems: [
        ...current.serviceItems,
        createServiceProfileServiceForm(null, current.serviceItems.length, current)
      ]
    }));
  }, []);
  const removeServiceItem = useCallback((index) => {
    setForm((current) => ({
      ...current,
      serviceItems: current.serviceItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex }))
    }));
  }, []);
  const updateAddressTyping = useCallback((value) => {
    setForm((current) => ({
      ...current,
      address: value,
      normalizedAddress: "",
      latitude: "",
      longitude: "",
      adsObjectId: "",
      geocodingProvider: ""
    }));
  }, []);
  const selectAddressSuggestion = useCallback((suggestion) => {
    setForm((current) => ({
      ...current,
      address: suggestion.normalizedAddress || suggestion.label || current.address,
      normalizedAddress: suggestion.normalizedAddress || suggestion.label || current.address,
      latitude: suggestion.latitude ?? "",
      longitude: suggestion.longitude ?? "",
      adsObjectId: suggestion.adsObjectId || "",
      geocodingProvider: suggestion.provider || "maaruum"
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
          languages: splitList(form.languages),
          serviceLocations: form.serviceLocations
            .map((item, index) => ({
              ...item,
              status: form.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
              sortOrder: index
            }))
            .filter((item) => String(item.address || item.normalizedAddress || item.label || "").trim()),
          serviceItems: form.serviceItems
            .map((item, index) => ({
              ...item,
              targetGroups: splitList(item.targetGroups),
              locationIds: Array.isArray(item.locationIds) ? item.locationIds : [],
              status: form.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
              sortOrder: index
            }))
            .filter((item) => String(item.name || "").trim())
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

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.locations", "Teeninduskohad")}>
        <div className="grid gap-[0.82rem]">
          {form.serviceLocations.length ? form.serviceLocations.map((location, index) => (
            <div key={location.clientId || `location-${index}`} className="grid gap-[0.72rem] rounded-[1rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] p-[0.82rem]">
              <div className="flex flex-wrap items-start justify-between gap-[0.72rem]">
                <p className="m-0 text-[0.98rem] font-[680] leading-[1.25] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">
                  {readText(t, "workspace_feature_pages.service_profile.locations.item_title", "Teeninduskoht")} {index + 1}
                </p>
                <Button type="button" variant="secondary" onClick={() => removeServiceLocation(index)} className="!min-h-[2.4rem] !px-[0.95rem] !py-[0.55rem] !text-[0.92rem]">
                  {readText(t, "workspace_feature_pages.service_profile.locations.remove", "Eemalda")}
                </Button>
              </div>
              <div className="grid gap-[0.72rem] sm:grid-cols-2">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.locations.label", "Nimetus")}</span>
                  <ServiceProfileInput value={location.label} onChange={(event) => updateServiceLocation(index, "label", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.locations.address", "Aadress")}</span>
                  <ServiceProfileAddressInput
                    t={t}
                    form={{ ...form, ...location, county: location.county || form.county }}
                    onTyping={(value) => updateServiceLocationAddressTyping(index, value)}
                    onSelect={(suggestion) => selectServiceLocationAddress(index, suggestion)}
                  />
                </Label>
              </div>
              <div className="grid gap-[0.72rem] sm:grid-cols-3">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.fields.phone", "Phone")}</span>
                  <ServiceProfileInput value={location.phone} onChange={(event) => updateServiceLocation(index, "phone", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.fields.email", "Email")}</span>
                  <ServiceProfileInput type="email" value={location.email} onChange={(event) => updateServiceLocation(index, "email", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.fields.website", "Website")}</span>
                  <ServiceProfileInput value={location.website} onChange={(event) => updateServiceLocation(index, "website", event.target.value)} />
                </Label>
              </div>
              <ToggleRow
                checked={location.mapVisible}
                onChange={(value) => updateServiceLocation(index, "mapVisible", value)}
                title={readText(t, "workspace_feature_pages.service_profile.locations.visible_on_map", "Näita teenusekaardil")}
                className="workspace-feature-toggle-row--flat"
              />
            </div>
          )) : (
            <p className={bodyTextClassName}>
              {readText(t, "workspace_feature_pages.service_profile.locations.empty", "Teeninduskohti ei ole veel lisatud.")}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={addServiceLocation} className="justify-self-start">
            {readText(t, "workspace_feature_pages.service_profile.locations.add", "Lisa teeninduskoht")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={readText(t, "workspace_feature_pages.service_profile.sections.services", "Services under this provider")}>
        <div className="grid gap-[0.82rem]">
          {form.serviceItems.length ? form.serviceItems.map((service, index) => (
            <div key={`service-item-${index}`} className="grid gap-[0.72rem] rounded-[1rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] p-[0.82rem]">
              <div className="flex flex-wrap items-start justify-between gap-[0.72rem]">
                <p className="m-0 text-[0.98rem] font-[680] leading-[1.25] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]">
                  {readText(t, "workspace_feature_pages.service_profile.service_items.item_title", "Service")} {index + 1}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeServiceItem(index)}
                  className="!min-h-[2.4rem] !px-[0.95rem] !py-[0.55rem] !text-[0.92rem]"
                >
                  {readText(t, "workspace_feature_pages.service_profile.service_items.remove", "Remove")}
                </Button>
              </div>
              <div className="grid gap-[0.72rem] sm:grid-cols-2">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.name", "Service name")}</span>
                  <ServiceProfileInput value={service.name} onChange={(event) => updateServiceItem(index, "name", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.category", "Category")}</span>
                  <ServiceProfileInput value={service.category} onChange={(event) => updateServiceItem(index, "category", event.target.value)} />
                </Label>
              </div>
              <Label>
                <span>{readText(t, "workspace_feature_pages.service_profile.service_items.description", "Description")}</span>
                <ServiceProfileTextarea
                  className="min-h-[5.8rem]"
                  value={service.description}
                  onChange={(event) => updateServiceItem(index, "description", event.target.value)}
                />
              </Label>
              <div className="grid gap-[0.72rem] sm:grid-cols-2">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.target_groups", "Target groups")}</span>
                  <ServiceProfileTextarea
                    className="min-h-[5.2rem]"
                    value={service.targetGroups}
                    onChange={(event) => updateServiceItem(index, "targetGroups", event.target.value)}
                  />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.service_area", "Service area")}</span>
                  <ServiceProfileTextarea
                    className="min-h-[5.2rem]"
                    value={service.serviceArea}
                    onChange={(event) => updateServiceItem(index, "serviceArea", event.target.value)}
                  />
                </Label>
              </div>
              {form.serviceLocations.length ? (
                <div className="grid gap-[0.42rem]">
                  <p className="m-0 text-[0.92rem] font-[640] leading-[1.2]">
                    {readText(t, "workspace_feature_pages.service_profile.service_items.locations", "Teeninduskohad")}
                  </p>
                  <div className="flex flex-wrap gap-[0.42rem]">
                    {form.serviceLocations.map((location, locationIndex) => {
                      const locationId = location.clientId || `location-${locationIndex + 1}`;
                      const checked = (service.locationIds || []).includes(locationId);
                      return (
                        <label key={locationId} className="inline-flex items-center gap-[0.36rem] rounded-full border border-[rgba(255,255,255,0.14)] px-[0.68rem] py-[0.34rem] text-[0.86rem]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const currentIds = new Set(service.locationIds || []);
                              if (event.target.checked) currentIds.add(locationId);
                              else currentIds.delete(locationId);
                              updateServiceItem(index, "locationIds", [...currentIds]);
                            }}
                          />
                          <span>{location.label || location.normalizedAddress || location.address || `${readText(t, "workspace_feature_pages.service_profile.locations.item_title", "Teeninduskoht")} ${locationIndex + 1}`}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-[0.72rem] sm:grid-cols-2">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.fee_type", "Price")}</span>
                  <ServiceProfileGlowField>
                    <DocumentsDropdown
                      ariaLabel={readText(t, "workspace_feature_pages.service_profile.service_items.fee_type", "Price")}
                      value={service.feeType}
                      onChange={(nextValue) => updateServiceItem(index, "feeType", nextValue)}
                      options={feeOptions}
                      className="workspace-feature-dropdown service-profile-glow-dropdown"
                    />
                  </ServiceProfileGlowField>
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.price_description", "Price note")}</span>
                  <ServiceProfileInput value={service.priceDescription} onChange={(event) => updateServiceItem(index, "priceDescription", event.target.value)} />
                </Label>
              </div>
              <div className="grid gap-[0.72rem] sm:grid-cols-3">
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.service_items.contact_name", "Contact person")}</span>
                  <ServiceProfileInput value={service.contactName} onChange={(event) => updateServiceItem(index, "contactName", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.fields.phone", "Phone")}</span>
                  <ServiceProfileInput value={service.phone} onChange={(event) => updateServiceItem(index, "phone", event.target.value)} />
                </Label>
                <Label>
                  <span>{readText(t, "workspace_feature_pages.service_profile.fields.email", "Email")}</span>
                  <ServiceProfileInput type="email" value={service.email} onChange={(event) => updateServiceItem(index, "email", event.target.value)} />
                </Label>
              </div>
              <div className="grid gap-[0.64rem] sm:grid-cols-3">
                <ToggleRow
                  checked={service.mapVisible}
                  onChange={(value) => updateServiceItem(index, "mapVisible", value)}
                  title={readText(t, "workspace_feature_pages.service_profile.service_items.visible_in_profile", "Visible under map marker")}
                  className="workspace-feature-toggle-row--flat"
                />
                <ToggleRow
                  checked={service.acceptsPlatformPreInquiries}
                  onChange={(value) => updateServiceItem(index, "acceptsPlatformPreInquiries", value)}
                  title={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_platform", "Accept pre-inquiries in SotsiaalAI")}
                  className="workspace-feature-toggle-row--flat"
                />
                <ToggleRow
                  checked={service.acceptsEmailPreInquiries}
                  onChange={(value) => updateServiceItem(index, "acceptsEmailPreInquiries", value)}
                  title={readText(t, "workspace_feature_pages.service_profile.pre_inquiries.accepts_email", "Accept pre-inquiries by email")}
                  className="workspace-feature-toggle-row--flat"
                />
              </div>
            </div>
          )) : (
            <p className={bodyTextClassName}>
              {readText(t, "workspace_feature_pages.service_profile.service_items.empty", "No separate services have been added yet.")}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={addServiceItem} className="justify-self-start">
            {readText(t, "workspace_feature_pages.service_profile.service_items.add", "Add service")}
          </Button>
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
            <ServiceProfileAddressInput
              t={t}
              form={form}
              onTyping={updateAddressTyping}
              onSelect={selectAddressSuggestion}
            />
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

  const handleBack = useCallback(() => {
    if (typeof window === "undefined") {
      workspaceReturn(locale, router, { persistGlassRingTilt: false });
      return;
    }
    window.requestAnimationFrame(() => {
      workspaceReturn(locale, router, { persistGlassRingTilt: false });
    });
  }, [locale, router]);

  const title = readText(t, `workspace_feature_pages.${featureKey}.title`, "Workspace feature");
  const activeWorkspaceRole = isAdmin
    ? adminWorkspaceRole
    : normalizeWorkspaceRole(session?.user?.role);
  const showAdminRoleSelector = isAdmin && (
    featureKey === "pre_inquiries"
  );
  const isServiceMap = featureKey === "service_map";
  const infoId = getWorkspaceFeatureInfoId(featureKey, activeWorkspaceRole);

  return (
    <section className={shellClassName} lang={locale}>
      {showAdminRoleSelector ? (
        <AdminRoleSelector
          t={t}
          locale={locale}
          value={activeWorkspaceRole}
          onChange={handleAdminWorkspaceRoleChange}
          className="workspace-feature-admin-role--floating workspace-feature-admin-role--viewport"
        />
      ) : null}
      <div className={cn(
        isServiceMap
          ? `workspace-feature-panel service-map-page-panel ${glassPrimaryButtonToneClassName} ${glassSubpageSurfaceScopeClassName}`
          : cn(panelClassName, "workspace-scroll-surface"),
      )}>
        <div className={cn(isServiceMap ? "workspace-feature-content service-map-page-content relative" : contentClassName)}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={readText(t, "workspace_feature_pages.back_to_workspace", "Back to workspace")}
            showBack={!isServiceMap}
            holdPressedVisualDisabled
            anchorBack={isServiceMap}
            backClassName={!isServiceMap ? "workspace-scroll-back-button" : null}
            headerClassName={isServiceMap ? "service-map-page-header" : null}
            titleWrapClassName={isServiceMap ? "service-map-page-title-wrap" : null}
            titleClassName={isServiceMap ? "service-map-page-title" : null}
            rightSlot={
              isServiceMap ? null : (
                <DashboardInfoTrigger
                  infoId={infoId}
                  title={title}
                  className={dashboardInfoTriggerCornerClassName}
                />
              )
            }
          >
            {title}
          </GlassSubpageHeader>
          {featureKey === "pre_inquiries" ? <PreInquiriesSurface t={t} locale={locale} activeRole={activeWorkspaceRole} isAdmin={isAdmin} currentUserId={session?.user?.id || ""} /> : null}
          {featureKey === "service_map" ? <ServiceMapSurface t={t} locale={locale} activeRole={activeWorkspaceRole} isAdmin={isAdmin} onRoleChange={handleAdminWorkspaceRoleChange} onBack={handleBack} /> : null}
          {featureKey === "service_profile" ? <ServiceProfileSurface t={t} /> : null}
        </div>
      </div>
    </section>
  );
}
