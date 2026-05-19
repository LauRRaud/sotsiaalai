"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import BorderGlow from "@/components/ui/BorderGlow";
import Button from "@/components/ui/Button";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import GlowField, { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
import Input from "@/components/ui/Input";
import OptionCard from "@/components/ui/OptionCard";
import PageInfoButton from "@/components/ui/PageInfoButton";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/components/ui/cn";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";
import styles from "./CovisionPage.module.css";
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles";
import {
  COVISION_CASE_STATUSES,
  COVISION_EXPECTED_HELP_TYPES,
  COVISION_JOURNEY_STEP_TYPES,
  COVISION_MESSAGE_TYPES,
  COVISION_PARTICIPANT_ROLES,
  COVISION_PARTY_GROUPS,
  COVISION_PARTY_STATUSES,
  COVISION_PROTECTIVE_OPTIONS,
  COVISION_RISK_OPTIONS,
  COVISION_TOPICS,
  EFFECTIVE_PRACTICE_STATUSES
} from "@/lib/covisionConstants";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "covision-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-0 max-[768px]:[--mobile-glass-card-gap:clamp(0.32rem,1.35vw,0.4rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0";

const surfaceClassName =
  `documents-workspace workspace-feature-panel workspace-scroll-surface covision-page-surface mobile-keep-desktop-glass-cards relative z-[21] mx-auto mt-[clamp(1rem,3vh,1.75rem)] mb-[clamp(0.35rem,1.8vh,1rem)] max-h-[calc(100dvh-2rem)] overflow-hidden overscroll-contain rounded-[2rem] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] ` +
  `[--workspace-subpage-header-margin-bottom:0.04rem] [--workspace-subpage-title-margin-top:clamp(1rem,2.2vh,1.35rem)] [--workspace-subpage-title-margin-bottom:0.04rem] px-[1.1rem] pt-[0.35rem] pb-[1.15rem] max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] max-[768px]:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:!max-w-none max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.82rem] ${glassPageMobileCardClassName} ${workspaceGuidePanelClassName}`;

const bodyClassName =
  `relative ${workspaceGuidePanelScrollClassName} mx-auto grid w-full max-w-[min(48rem,100%)] gap-[0.48rem] px-[0.05rem] pt-0 pb-[0.25rem] max-[768px]:max-w-none max-[768px]:gap-[0.58rem] max-[768px]:px-[0.05rem]`;

const smallButtonClassName =
  "documents-secondary-button documents-primary-button--compact !min-h-[2.5rem] !px-[0.95rem] !py-[0.5rem] !text-[0.96rem] !leading-[1.15] !tracking-[0.01em]";

const primaryButtonClassName = "documents-primary-button";
const secondaryButtonClassName = cn(styles.cancelButton, "documents-secondary-button");
const compactPrimaryButtonClassName =
  "documents-primary-button documents-primary-button--compact !min-h-[2.5rem] !px-[0.95rem] !py-[0.5rem] !text-[0.96rem] !leading-[1.15] !tracking-[0.01em]";
const dangerButtonClassName =
  "documents-danger-button documents-primary-button--compact !min-h-[2.5rem] !px-[0.95rem] !py-[0.5rem] !text-[0.96rem] !leading-[1.15] !tracking-[0.01em]";
const choiceCardClassName =
  `${primarySegmentedButtonClassName} inline-flex min-h-[2.72rem] items-center justify-center rounded-[1.6rem] border-[var(--seg-card-border-width,1px)] border-solid border-[color:var(--seg-card-border)] [background:var(--seg-card-bg)] px-[1.05rem] py-[0.64rem] text-[1.06rem] leading-[1.2] tracking-[0.022em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:[background:var(--seg-card-bg-hover,var(--seg-card-bg))] hover:border-[color:var(--seg-card-border-hover,var(--seg-card-border))] hover:text-[color:var(--seg-card-text-hover,var(--seg-card-text))] hover:shadow-[var(--seg-card-shadow-hover,var(--seg-card-shadow))] active:[background:var(--seg-card-bg-active,var(--seg-card-bg-selected,var(--seg-card-bg-hover,var(--seg-card-bg))))] active:border-[color:var(--seg-card-border-active,var(--seg-card-border-selected,var(--seg-card-border-hover,var(--seg-card-border))))] active:text-[color:var(--seg-card-text-selected,var(--seg-card-text-hover,var(--seg-card-text)))] active:shadow-[var(--seg-card-shadow-active,var(--seg-card-shadow-selected,var(--seg-card-shadow-hover,var(--seg-card-shadow))))] text-center max-[768px]:min-h-[2.9rem] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.98rem] max-[768px]:py-[0.68rem] max-[768px]:text-[1.08rem]`;

function markChatWorkspaceRestore() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
      JSON.stringify({ ts: Date.now() })
    );
  } catch {}
}

const sectionHeadingClassName =
  cn(styles.heading, "m-0 text-[1.14rem] font-[680] leading-[1.18] tracking-[0]");

const mutedTextClassName =
  cn(styles.muted, "m-0 text-[0.98rem] leading-[1.5] tracking-[0]");

function emptyCaseForm() {
  return {
    id: "",
    title: "",
    summary: "",
    anonymizedDescription: "",
    centralQuestion: "",
    expectedHelpTypes: [],
    topics: [],
    tagText: "",
    status: "draft",
    anonymityConfirmed: false,
    journeySteps: [],
    parties: [],
    riskFactors: [],
    participants: []
  };
}

function emptyPracticeForm() {
  return {
    id: "",
    sourceCovisionCaseId: "",
    title: "",
    background: "",
    mainChallenge: "",
    whatHelped: "",
    networkOrServiceRole: "",
    outcome: "",
    learningPoints: "",
    limitations: "",
    sources: "",
    topics: [],
    tagText: "",
    status: "draft"
  };
}

function caseToForm(item) {
  if (!item) return emptyCaseForm();
  return {
    id: item.id || "",
    title: item.title || "",
    summary: item.summary || "",
    anonymizedDescription: item.anonymizedDescription || "",
    centralQuestion: item.centralQuestion || "",
    expectedHelpTypes: item.expectedHelpTypes || [],
    topics: item.topics || [],
    tagText: (item.tags || []).join(", "),
    status: item.status || "draft",
    anonymityConfirmed: Boolean(item.anonymityConfirmedAt),
    journeySteps: item.journeySteps || [],
    parties: item.parties || [],
    riskFactors: item.riskFactors || [],
    participants: (item.participants || [])
      .filter((participant) => participant.role !== "owner")
      .map((participant) => ({
        email: participant.email || participant.user?.email || "",
        userId: participant.userId || "",
        role: participant.role || "participant"
      }))
  };
}

function practiceToForm(item) {
  if (!item) return emptyPracticeForm();
  return {
    id: item.id || "",
    sourceCovisionCaseId: item.sourceCovisionCaseId || "",
    title: item.title || "",
    background: item.background || "",
    mainChallenge: item.mainChallenge || "",
    whatHelped: item.whatHelped || "",
    networkOrServiceRole: item.networkOrServiceRole || "",
    outcome: item.outcome || "",
    learningPoints: item.learningPoints || "",
    limitations: item.limitations || "",
    sources: item.sources || "",
    topics: item.topics || [],
    tagText: (item.tags || []).join(", "),
    status: item.status || "draft"
  };
}

function splitTags(value) {
  return String(value || "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 32);
}

function formatDate(value, locale = "et") {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "et" ? "et-EE" : locale, {
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

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || "";
}

function dropdownOptions(options) {
  return (options || []).map((option) => {
    if (typeof option === "string") return { value: option, label: option };
    return {
      value: option.value || option.label || "",
      label: option.label || option.value || ""
    };
  });
}

function Notice({ type = "info", children }) {
  if (!children) return null;
  const isError = type === "error";
  return (
    <p
      className={cn(
        styles.notice,
        isError ? styles.noticeError : styles.noticeSuccess,
        "m-0 rounded-[0.92rem] border px-[0.86rem] py-[0.58rem] text-[0.96rem] leading-[1.35]"
      )}
    >
      {children}
    </p>
  );
}

function Field({ label, children, className }) {
  return (
    <label className={cn(styles.fieldLabel, "grid gap-[0.34rem] text-[0.92rem] font-[640] leading-[1.2]", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SelectField({ value, onChange, options, ariaLabel, className, openDirection = "down" }) {
  return (
    <GlowField className={cn("covision-glow-field covision-glow-dropdown", className)}>
      <DocumentsDropdown
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        placeholder={ariaLabel}
        options={dropdownOptions(options)}
        className="workspace-feature-dropdown"
        openDirection={openDirection}
      />
    </GlowField>
  );
}

function CovisionInput({ className, ...props }) {
  return (
    <GlowField className="covision-glow-field">
      <Input className={cn("ui-glow-control covision-glow-control", className)} {...props} />
    </GlowField>
  );
}

function CovisionTextarea({ className, ...props }) {
  return (
    <GlowField className={cn("covision-glow-field covision-glow-field--textarea", className)}>
      <Textarea className="ui-glow-control covision-glow-control covision-glow-control--textarea" {...props} />
    </GlowField>
  );
}

function MultiChoice({ options, value, onChange }) {
  const selected = new Set(value || []);
  return (
    <div className="flex flex-wrap gap-[0.42rem]">
      {options.map((option) => {
        const optionValue = option.value || option;
        const label = option.label || option;
        const active = selected.has(optionValue);
        return (
          <OptionCard
            type="checkbox"
            key={optionValue}
            value={optionValue}
            checked={active}
            showIndicator={false}
            fitTextLines={1}
            onChange={() => {
              const next = new Set(selected);
              if (next.has(optionValue)) next.delete(optionValue);
              else next.add(optionValue);
              onChange([...next]);
            }}
            className={cn(styles.choice, choiceCardClassName)}
          >
            <span className="text-center [text-wrap:balance]">{label}</span>
          </OptionCard>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, type = "case" }) {
  const label = type === "practice"
    ? optionLabel(EFFECTIVE_PRACTICE_STATUSES, status)
    : optionLabel(COVISION_CASE_STATUSES, status);
  return (
    <span className={cn(styles.statusBadge, "inline-flex w-fit items-center rounded-full border px-[0.64rem] py-[0.22rem] text-[0.78rem] font-[680] leading-[1.1]")}>
      {label}
    </span>
  );
}

function SectionPanel({ title, children, aside, className }) {
  return (
    <BorderGlow
      as="section"
      className={cn(styles.sectionPanel, "covision-glow-card grid gap-[0.72rem] rounded-[1.02rem] p-[var(--panel-padding,0.85rem)]", className)}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--covision-panel-bg, #120F17)"
      borderRadius={16}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      <div className="flex flex-wrap items-start justify-between gap-[0.75rem]">
        <h2 className={sectionHeadingClassName}>{title}</h2>
        {aside}
      </div>
      {children}
    </BorderGlow>
  );
}

function CardTags({ tags }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-[0.28rem]">
      {tags.slice(0, 5).map((tag) => (
        <span key={tag} className={cn(styles.tag, "rounded-full border px-[0.52rem] py-[0.16rem] text-[0.78rem] leading-[1.1]")}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function CovisionCard({ item, onOpen, onEdit, locale }) {
  return (
    <BorderGlow
      as="article"
      className={cn(styles.card, "covision-glow-card grid gap-[0.62rem] rounded-[0.94rem] border px-[0.82rem] py-[0.78rem]")}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--covision-card-bg, #120F17)"
      borderRadius={15}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      <div className="flex items-start justify-between gap-[0.65rem]">
        <div className="grid gap-[0.28rem]">
          <h3 className="m-0 text-[1.06rem] font-[680] leading-[1.18]">{item.title}</h3>
          <CardTags tags={item.topics?.length ? item.topics : item.tags} />
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className={cn(styles.meta, "flex flex-wrap gap-x-[0.68rem] gap-y-[0.22rem] text-[0.88rem]")}>
        <span>{item.participants?.length || 1} osalejat</span>
        <span>{formatDate(item.lastActivityAt || item.updatedAt, locale)}</span>
      </div>
      <div className="flex flex-wrap justify-end gap-[0.45rem]">
        <Button type="button" variant="secondary" onClick={() => onEdit(item)} className={smallButtonClassName}>
          Muuda
        </Button>
        <Button type="button" onClick={() => onOpen(item)} className={compactPrimaryButtonClassName}>
          Ava
        </Button>
      </div>
    </BorderGlow>
  );
}

function PracticeCard({ item, onOpen }) {
  return (
    <BorderGlow
      as="article"
      className={cn(styles.card, "covision-glow-card grid gap-[0.58rem] rounded-[0.94rem] border px-[0.82rem] py-[0.78rem]")}
      edgeSensitivity={24}
      glowColor="358 82 72"
      backgroundColor="var(--covision-card-bg, #120F17)"
      borderRadius={15}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      fillOpacity={0}
      edgeOnly
      style={fieldEdgeGlowStyle}
    >
      <div className="flex items-start justify-between gap-[0.65rem]">
        <div className="grid gap-[0.28rem]">
          <h3 className="m-0 text-[1.04rem] font-[680] leading-[1.18]">{item.title}</h3>
          <CardTags tags={item.topics?.length ? item.topics : item.tags} />
        </div>
        <StatusBadge status={item.status} type="practice" />
      </div>
      <p className={cn(mutedTextClassName, "line-clamp-3")}>
        {item.background || item.whatHelped || "Üldistatud praktikakogemus vajab veel kirjeldust."}
      </p>
      <div className="flex justify-end">
        <Button type="button" onClick={() => onOpen(item)} className={compactPrimaryButtonClassName}>
          Ava
        </Button>
      </div>
    </BorderGlow>
  );
}

function SummaryField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <CovisionTextarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="min-h-[5.6rem]"
      />
    </Field>
  );
}

export default function CovisionPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [view, setView] = useState("overview");
  const [cases, setCases] = useState([]);
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [caseForm, setCaseForm] = useState(() => emptyCaseForm());
  const [activeCase, setActiveCase] = useState(null);
  const [practiceForm, setPracticeForm] = useState(() => emptyPracticeForm());
  const [anonymityIssues, setAnonymityIssues] = useState([]);
  const [questionSuggestions, setQuestionSuggestions] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [messageType, setMessageType] = useState("free_text");
  const [summaryForm, setSummaryForm] = useState({});
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantRole, setParticipantRole] = useState("participant");
  const [partyCategory, setPartyCategory] = useState(COVISION_PARTY_GROUPS[0]?.category || "");
  const [partyType, setPartyType] = useState(COVISION_PARTY_GROUPS[0]?.options?.[0] || "");
  const [riskKind, setRiskKind] = useState("risk");
  const [riskLabel, setRiskLabel] = useState(COVISION_RISK_OPTIONS[0] || "");
  const [riskSeverity, setRiskSeverity] = useState("medium");

  const covisionFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "x-ui-locale": locale
      }
    });
  }, [locale]);

  const selectedPartyGroup = useMemo(
    () => COVISION_PARTY_GROUPS.find((group) => group.category === partyCategory) || COVISION_PARTY_GROUPS[0],
    [partyCategory]
  );

  useEffect(() => {
    if (!selectedPartyGroup?.options?.includes(partyType)) {
      setPartyType(selectedPartyGroup?.options?.[0] || "");
    }
  }, [partyType, selectedPartyGroup]);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await covisionFetch("/api/covision", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Kovisiooni tööruumi laadimine ebaõnnestus.");
      }
      setCases(Array.isArray(payload?.cases) ? payload.cases : []);
      setPractices(Array.isArray(payload?.practices) ? payload.practices : []);
    } catch (loadError) {
      setCases([]);
      setPractices([]);
      setError(loadError?.message || "Kovisiooni tööruumi laadimine ebaõnnestus.");
    } finally {
      setLoading(false);
    }
  }, [covisionFetch]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("et");
    return cases.filter((item) => {
      if (topicFilter && !(item.topics || []).includes(topicFilter)) return false;
      if (!normalizedQuery) return true;
      return [
        item.title,
        item.summary,
        item.centralQuestion,
        ...(item.topics || []),
        ...(item.tags || [])
      ].join(" ").toLocaleLowerCase("et").includes(normalizedQuery);
    });
  }, [cases, query, topicFilter]);

  const filteredPractices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("et");
    return practices.filter((item) => {
      if (topicFilter && !(item.topics || []).includes(topicFilter)) return false;
      if (!normalizedQuery) return true;
      return [
        item.title,
        item.background,
        item.whatHelped,
        ...(item.topics || []),
        ...(item.tags || [])
      ].join(" ").toLocaleLowerCase("et").includes(normalizedQuery);
    });
  }, [practices, query, topicFilter]);

  const handleBack = useCallback(() => {
    if (view !== "overview") {
      setView("overview");
      setActiveCase(null);
      setNotice("");
      setError("");
      return;
    }
    markChatWorkspaceRestore();
    if (typeof window === "undefined") {
      pushWithTransition(router, localizePath("/vestlus", locale), {
        persistGlassRingTilt: false
      });
      return;
    }
    window.requestAnimationFrame(() => {
      pushWithTransition(router, localizePath("/vestlus", locale), {
        persistGlassRingTilt: false
      });
    });
  }, [locale, router, view]);

  function startCase() {
    setCaseForm(emptyCaseForm());
    setAnonymityIssues([]);
    setQuestionSuggestions([]);
    setNotice("");
    setError("");
    setView("case_form");
  }

  function editCase(item) {
    setCaseForm(caseToForm(item));
    setAnonymityIssues([]);
    setQuestionSuggestions([]);
    setNotice("");
    setError("");
    setView("case_form");
  }

  async function openCase(item) {
    setError("");
    setNotice("");
    try {
      const response = await covisionFetch(`/api/covision/${encodeURIComponent(item.id)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Kovisiooni avamine ebaõnnestus.");
      setActiveCase(payload.case);
      setSummaryForm(payload.case?.summaryRecord || {});
      setView("room");
    } catch (openError) {
      setError(openError?.message || "Kovisiooni avamine ebaõnnestus.");
    }
  }

  function startPractice(seed = null) {
    setActiveCase(null);
    setPracticeForm(seed ? practiceToForm(seed) : emptyPracticeForm());
    setNotice("");
    setError("");
    setView("practice_form");
  }

  function updateCaseForm(field, value) {
    setCaseForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateJourneyStep(index, field, value) {
    setCaseForm((current) => ({
      ...current,
      journeySteps: current.journeySteps.map((step, stepIndex) => (
        stepIndex === index ? { ...step, [field]: value } : step
      ))
    }));
  }

  function addJourneyStep() {
    setCaseForm((current) => ({
      ...current,
      journeySteps: [
        ...current.journeySteps,
        {
          type: COVISION_JOURNEY_STEP_TYPES[0],
          title: "",
          description: "",
          dateLabel: "",
          notes: "",
          status: "needs_clarification"
        }
      ]
    }));
  }

  function removeJourneyStep(index) {
    setCaseForm((current) => ({
      ...current,
      journeySteps: current.journeySteps.filter((_, stepIndex) => stepIndex !== index)
    }));
  }

  function addParty() {
    if (!partyType) return;
    setCaseForm((current) => ({
      ...current,
      parties: [
        ...current.parties,
        {
          category: partyCategory,
          type: partyType,
          label: partyType,
          involvementStatus: "vajab kaasamist",
          cooperationStatus: "info puudub",
          roleDescription: "",
          note: ""
        }
      ]
    }));
  }

  function updateParty(index, field, value) {
    setCaseForm((current) => ({
      ...current,
      parties: current.parties.map((party, partyIndex) => (
        partyIndex === index ? { ...party, [field]: value } : party
      ))
    }));
  }

  function addRiskFactor() {
    if (!riskLabel) return;
    setCaseForm((current) => ({
      ...current,
      riskFactors: [
        ...current.riskFactors,
        {
          type: riskKind,
          label: riskLabel,
          severity: riskSeverity,
          note: "",
          needsAttention: true
        }
      ]
    }));
  }

  function updateRiskFactor(index, field, value) {
    setCaseForm((current) => ({
      ...current,
      riskFactors: current.riskFactors.map((factor, factorIndex) => (
        factorIndex === index ? { ...factor, [field]: value } : factor
      ))
    }));
  }

  function addParticipant() {
    const email = participantEmail.trim().toLowerCase();
    if (!email) return;
    setCaseForm((current) => {
      if (current.participants.some((participant) => participant.email === email)) return current;
      return {
        ...current,
        participants: [
          ...current.participants,
          { email, role: participantRole }
        ]
      };
    });
    setParticipantEmail("");
  }

  async function runAnonymityCheck() {
    setError("");
    try {
      const response = await covisionFetch("/api/covision/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "anonymity",
          description: caseForm.anonymizedDescription
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Anonüümsuse kontroll ebaõnnestus.");
      setAnonymityIssues(Array.isArray(payload.issues) ? payload.issues : []);
      if (!caseForm.topics.length && Array.isArray(payload.topics)) {
        updateCaseForm("topics", payload.topics);
      }
      setNotice(payload.issues?.length ? "Kontroll leidis detailid, mis vajavad ülevaatust." : "Anonüümsuse kontroll ei leidnud selgeid tuvastavaid detaile.");
    } catch (assistError) {
      setError(assistError?.message || "Anonüümsuse kontroll ebaõnnestus.");
    }
  }

  async function runQuestionAssist() {
    setError("");
    try {
      const response = await covisionFetch("/api/covision/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "questions",
          case: {
            anonymizedDescription: caseForm.anonymizedDescription,
            topics: caseForm.topics,
            riskFactors: caseForm.riskFactors
          }
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Küsimuste pakkumine ebaõnnestus.");
      setQuestionSuggestions(Array.isArray(payload.questions) ? payload.questions : []);
    } catch (assistError) {
      setError(assistError?.message || "Küsimuste pakkumine ebaõnnestus.");
    }
  }

  async function saveCase(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...caseForm,
      tags: splitTags(caseForm.tagText),
      anonymityConfirmed: Boolean(caseForm.anonymityConfirmed)
    };
    try {
      const response = await covisionFetch(caseForm.id ? `/api/covision/${encodeURIComponent(caseForm.id)}` : "/api/covision", {
        method: caseForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Kovisiooni salvestamine ebaõnnestus.");
      await loadWorkspace();
      setActiveCase(data.case);
      setSummaryForm(data.case?.summaryRecord || {});
      setNotice("Kovisiooni juhtumipüstitus salvestatud.");
      setView("room");
    } catch (saveError) {
      setError(saveError?.message || "Kovisiooni salvestamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!activeCase?.id || !messageBody.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await covisionFetch(`/api/covision/${encodeURIComponent(activeCase.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageType, body: messageBody })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Sõnumi lisamine ebaõnnestus.");
      setActiveCase((current) => ({
        ...current,
        status: current?.status === "draft" ? "active" : current?.status,
        messages: [...(current?.messages || []), payload.message]
      }));
      setMessageBody("");
    } catch (sendError) {
      setError(sendError?.message || "Sõnumi lisamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  async function draftSummary() {
    if (!activeCase?.id) return;
    setError("");
    try {
      const response = await covisionFetch("/api/covision/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "summary", caseId: activeCase.id })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Kokkuvõtte mustandi koostamine ebaõnnestus.");
      setSummaryForm(payload.summary || {});
      setNotice("Kokkuvõtte mustand koostatud. Vaata see enne salvestamist üle.");
    } catch (assistError) {
      setError(assistError?.message || "Kokkuvõtte mustandi koostamine ebaõnnestus.");
    }
  }

  async function saveSummary() {
    if (!activeCase?.id || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await covisionFetch(`/api/covision/${encodeURIComponent(activeCase.id)}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summaryForm)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Kokkuvõtte salvestamine ebaõnnestus.");
      setActiveCase((current) => ({
        ...current,
        status: "summary_ready",
        summaryRecord: payload.summary
      }));
      setNotice("Kovisiooni kokkuvõte salvestatud.");
      await loadWorkspace();
    } catch (summaryError) {
      setError(summaryError?.message || "Kokkuvõtte salvestamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  async function startPracticeFromCase() {
    if (!activeCase?.id) return;
    setError("");
    try {
      const response = await covisionFetch("/api/covision/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "practice", caseId: activeCase.id })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Toimiva praktika mustandi alustamine ebaõnnestus.");
      setPracticeForm({
        ...practiceToForm(payload.practice),
        sourceCovisionCaseId: activeCase.id
      });
      setView("practice_form");
    } catch (practiceError) {
      setError(practiceError?.message || "Toimiva praktika mustandi alustamine ebaõnnestus.");
    }
  }

  function updatePracticeForm(field, value) {
    setPracticeForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function savePractice(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...practiceForm,
      tags: splitTags(practiceForm.tagText)
    };
    try {
      const response = await covisionFetch(practiceForm.id ? `/api/covision/effective-practices/${encodeURIComponent(practiceForm.id)}` : "/api/covision/effective-practices", {
        method: practiceForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Toimiva praktika salvestamine ebaõnnestus.");
      await loadWorkspace();
      setNotice("Toimiva praktika kirje salvestatud.");
      setPracticeForm(practiceToForm(data.practice));
      setView("overview");
    } catch (practiceError) {
      setError(practiceError?.message || "Toimiva praktika salvestamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={cn(shellClassName, styles.page)} lang={locale} data-covision-page>
      <div
        className={cn(
          surfaceClassName,
          styles.surface,
      )}
      >
        <PageInfoButton
          title="Kuidas kovisioon ja praktikanäited toimivad"
          label="Ava kovisiooni lehe info"
          className="absolute right-[0.55rem] top-[0.55rem] z-[35] max-[768px]:right-[0.2rem] max-[768px]:top-[calc(var(--mobile-safe-top,env(safe-area-inset-top,0px))+0.2rem)]"
        >
          <p className="m-0">
            <strong>Kovisioon</strong> on spetsialistide tööruum keerulisest juhtumist õppimiseks ja järgmiste sammude kokkuleppimiseks. Juhtum tuleb kirjeldada nii, et inimest ei oleks võimalik ära tunda: ära lisa nime, isikukoodi, täpset aadressi, haruldasi äratuntavaid asjaolusid ega muud otseselt tuvastavat infot.
          </p>
          <ul>
            <li><strong>Alusta uut kovisiooni</strong> avab juhtumipüstituse vormi.</li>
            <li>Kirjuta lühike pealkiri, anonüümne olukorra kirjeldus ja keskne küsimus, millele soovid kolleegide vaadet.</li>
            <li>Vali teemad, oodatav abi, osapooled, riskid, kaitsetegurid ja vajadusel osalejad.</li>
            <li>AI-abiga saad teksti korrastada, küsimust täpsustada ja hiljem arutelust kokkuvõtte vormistada.</li>
            <li>Salvestatud kovisioonid jäävad jaotisse <strong>Minu kovisioonid</strong>, kust saad neid avada, täiendada ja otsingu või teemafiltri abil leida.</li>
          </ul>
          <p className="m-0">
            <strong>Praktikanäited</strong> on üldistatud õppetunnid lahendustest, mis on töös aidanud. Need ei ole konkreetse inimese toimikud, vaid lühikesed teadmuskirjed, mida saab hiljem sarnaste olukordade lahendamisel kasutada.
          </p>
          <ul>
            <li><strong>Lisa praktikanäide</strong> avab vormi toimiva lahenduse kirjeldamiseks.</li>
            <li>Kirjelda tausta, peamist väljakutset, mis aitas, teenuse või võrgustiku rolli, tulemust, õppetunde ja piiranguid.</li>
            <li>Seo näide vajadusel kovisiooniga, lisa teemad ja sildid ning salvesta see jaotisse <strong>Praktikanäited</strong>.</li>
            <li>Otsing ja teemafilter töötavad nii kovisioonide kui praktikanäidete pealkirjade, küsimuste, teemade ja siltide pealt.</li>
          </ul>
        </PageInfoButton>

        <div className={bodyClassName}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("buttons.back")}
            holdPressedVisualDisabled
            anchorBack={false}
            backClassName="workspace-scroll-back-button"
          >
            {t("chat.workspace.cards.kovision.title", "Kovisioon")}
          </GlassSubpageHeader>

          <Notice type="error">{error}</Notice>
          <Notice>{notice}</Notice>

          {view === "overview" ? (
            <>
              <BorderGlow
                as="section"
                className={cn(styles.toolbar, "covision-glow-card -mt-[8.4rem] grid gap-[0.72rem] rounded-[1.05rem] border px-[0.84rem] py-[0.82rem] max-[768px]:-mt-[1rem]")}
                edgeSensitivity={24}
                glowColor="358 82 72"
                backgroundColor="var(--covision-card-bg, #120F17)"
                borderRadius={17}
                glowRadius={42}
                glowIntensity={0.62}
                coneSpread={20}
                fillOpacity={0}
                edgeOnly
                style={fieldEdgeGlowStyle}
              >
                <div className="flex flex-wrap items-center justify-between gap-[0.72rem]">
                  <div className="flex flex-wrap gap-[0.52rem]">
                    <Button type="button" onClick={startCase} className={primaryButtonClassName}>
                      Alusta uut kovisiooni
                    </Button>
                    <Button type="button" onClick={() => startPractice()} className={primaryButtonClassName}>
                      Lisa praktikanäide
                    </Button>
                  </div>
                  <div className="grid w-full min-w-[min(28rem,100%)] flex-1 gap-[0.5rem] sm:grid-cols-[1fr_0.82fr]">
                    <CovisionInput
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Otsi teema, sildi või küsimuse järgi"
                      aria-label="Otsi"
                    />
                    <SelectField
                      value={topicFilter}
                      onChange={setTopicFilter}
                      ariaLabel="Teemafilter"
                      openDirection="down"
                      options={[{ value: "", label: "Kõik teemad" }, ...COVISION_TOPICS.map((topic) => ({ value: topic, label: topic }))]}
                    />
                  </div>
                </div>
              </BorderGlow>

              <div className="grid gap-[0.95rem] lg:grid-cols-[1fr_0.82fr]">
                <SectionPanel title="Minu kovisioonid">
                  {loading ? (
                    <p className={mutedTextClassName}>Laen kovisioone...</p>
                  ) : filteredCases.length ? (
                    <div className="grid gap-[0.66rem] md:grid-cols-2">
                      {filteredCases.map((item) => (
                        <CovisionCard key={item.id} item={item} onOpen={openCase} onEdit={editCase} locale={locale} />
                      ))}
                    </div>
                  ) : (
                    <p className={mutedTextClassName}>Ühtegi kovisiooni pole veel loodud või valitud filter ei leidnud vasteid.</p>
                  )}
                </SectionPanel>

                <SectionPanel title="Praktikanäited">
                  {loading ? (
                    <p className={mutedTextClassName}>Laen praktikakogemusi...</p>
                  ) : filteredPractices.length ? (
                    <div className="grid gap-[0.66rem]">
                      {filteredPractices.map((item) => (
                        <PracticeCard key={item.id} item={item} onOpen={(practice) => startPractice(practice)} />
                      ))}
                    </div>
                  ) : (
                    <p className={mutedTextClassName}>Praktikanäiteid pole veel lisatud või valitud filter ei leidnud vasteid.</p>
                  )}
                </SectionPanel>
              </div>
            </>
          ) : null}

          {view === "case_form" ? (
            <form onSubmit={saveCase} className="grid gap-[0.9rem]">
              <SectionPanel title="1. Pealkiri ja teemad">
                <div className="grid gap-[0.68rem] md:grid-cols-[1fr_0.82fr]">
                  <Field label="Pealkiri">
                    <CovisionInput value={caseForm.title} onChange={(event) => updateCaseForm("title", event.target.value)} required />
                  </Field>
                  <Field label="Staatus">
                    <SelectField value={caseForm.status} onChange={(value) => updateCaseForm("status", value)} ariaLabel="Staatus" options={COVISION_CASE_STATUSES} />
                  </Field>
                </div>
                <Field label="Lühikirjeldus">
                  <CovisionTextarea value={caseForm.summary} onChange={(event) => updateCaseForm("summary", event.target.value)} rows={3} />
                </Field>
                <div className="grid gap-[0.5rem]">
                  <p className={sectionHeadingClassName}>Teemavaldkonnad</p>
                  <MultiChoice options={COVISION_TOPICS} value={caseForm.topics} onChange={(value) => updateCaseForm("topics", value)} />
                </div>
                <Field label="Oma sildid">
                  <CovisionInput value={caseForm.tagText} onChange={(event) => updateCaseForm("tagText", event.target.value)} placeholder="eralda komaga" />
                </Field>
              </SectionPanel>

              <SectionPanel
                title="2. Olukorra anonüümne kirjeldus"
                aside={<Button type="button" variant="secondary" onClick={runAnonymityCheck} className={smallButtonClassName}>Kontrolli anonüümsust</Button>}
              >
                <CovisionTextarea
                  value={caseForm.anonymizedDescription}
                  onChange={(event) => updateCaseForm("anonymizedDescription", event.target.value)}
                  rows={8}
                  placeholder="Kirjelda tööalast olukorda ilma tuvastatavate kliendiandmeteta."
                />
                {anonymityIssues.length ? (
                  <div className="grid gap-[0.42rem]">
                    {anonymityIssues.map((issue, index) => (
                      <div key={`${issue.type}-${index}`} className={cn(styles.dangerCard, "rounded-[0.82rem] border px-[0.72rem] py-[0.56rem]")}>
                        <p className="m-0 text-[0.94rem] font-[680]">{issue.label}</p>
                        <p className={mutedTextClassName}>{issue.snippet}</p>
                        <p className={mutedTextClassName}>{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <label className={cn(styles.confirmBox, "flex items-start gap-[0.56rem] rounded-[0.82rem] border px-[0.72rem] py-[0.56rem] text-[0.94rem] leading-[1.35]")}>
                  <input
                    type="checkbox"
                    className="ui-checkbox-glass mt-[0.08rem]"
                    checked={caseForm.anonymityConfirmed}
                    onChange={(event) => updateCaseForm("anonymityConfirmed", event.target.checked)}
                  />
                  <span>Kinnitan, et juhtumipüstitus on anonüümne ja ei sisalda tahtlikult tuvastatavaid kliendiandmeid.</span>
                </label>
              </SectionPanel>

              <SectionPanel title="3. Kliendi teekond" aside={<Button type="button" variant="secondary" onClick={addJourneyStep} className={smallButtonClassName}>Lisa samm</Button>}>
                {caseForm.journeySteps.length ? (
                  <div className="grid gap-[0.58rem]">
                    {caseForm.journeySteps.map((step, index) => (
                      <div key={`step-${index}`} className={cn(styles.subtleCard, "grid gap-[0.52rem] rounded-[0.86rem] border px-[0.72rem] py-[0.68rem]")}>
                        <div className="grid gap-[0.52rem] md:grid-cols-[0.75fr_1fr_0.55fr_auto]">
                          <SelectField value={step.type || COVISION_JOURNEY_STEP_TYPES[0]} onChange={(value) => updateJourneyStep(index, "type", value)} ariaLabel="Sammu tüüp" options={COVISION_JOURNEY_STEP_TYPES} />
                          <CovisionInput value={step.title || ""} onChange={(event) => updateJourneyStep(index, "title", event.target.value)} placeholder="Lühike pealkiri" />
                          <CovisionInput value={step.dateLabel || ""} onChange={(event) => updateJourneyStep(index, "dateLabel", event.target.value)} placeholder="Periood" />
                          <Button type="button" variant="danger" onClick={() => removeJourneyStep(index)} className={dangerButtonClassName}>Eemalda</Button>
                        </div>
                        <CovisionTextarea value={step.description || ""} onChange={(event) => updateJourneyStep(index, "description", event.target.value)} rows={2} placeholder="Lühikirjeldus" />
                        <div className="grid gap-[0.52rem] md:grid-cols-[1fr_0.6fr]">
                          <CovisionInput value={step.notes || ""} onChange={(event) => updateJourneyStep(index, "notes", event.target.value)} placeholder="Märkused" />
                          <SelectField
                            value={step.status || "needs_clarification"}
                            onChange={(value) => updateJourneyStep(index, "status", value)}
                            ariaLabel="Sammu seis"
                            options={[
                              { value: "needs_clarification", label: "vajab täpsustamist" },
                              { value: "confirmed", label: "kinnitatud" }
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={mutedTextClassName}>Lisa tööprotsessi sammud kaartidena. Teekond ei pea olema inimese elulugu.</p>
                )}
              </SectionPanel>

              <SectionPanel title="4. Võrgustik ja osapooled" aside={<Button type="button" variant="secondary" onClick={addParty} className={smallButtonClassName}>Lisa osapool</Button>}>
                <div className="grid gap-[0.52rem] md:grid-cols-[0.8fr_0.8fr]">
                  <SelectField
                    value={partyCategory}
                    onChange={setPartyCategory}
                    ariaLabel="Osapoole kategooria"
                    options={COVISION_PARTY_GROUPS.map((group) => ({ value: group.category, label: group.category }))}
                  />
                  <SelectField value={partyType} onChange={setPartyType} ariaLabel="Osapool" options={selectedPartyGroup?.options || []} />
                </div>
                {caseForm.parties.length ? (
                  <div className="grid gap-[0.52rem] md:grid-cols-2">
                    {caseForm.parties.map((party, index) => (
                      <div key={`party-${index}`} className={cn(styles.subtleCard, "grid gap-[0.45rem] rounded-[0.86rem] border px-[0.72rem] py-[0.68rem]")}>
                        <CovisionInput value={party.label || ""} onChange={(event) => updateParty(index, "label", event.target.value)} />
                        <div className="grid gap-[0.45rem] sm:grid-cols-2">
                          <SelectField value={party.involvementStatus || "info puudub"} onChange={(value) => updateParty(index, "involvementStatus", value)} ariaLabel="Kaasamise seis" options={COVISION_PARTY_STATUSES} />
                          <SelectField value={party.cooperationStatus || "info puudub"} onChange={(value) => updateParty(index, "cooperationStatus", value)} ariaLabel="Koostöö seis" options={COVISION_PARTY_STATUSES} />
                        </div>
                        <CovisionTextarea value={party.note || ""} onChange={(event) => updateParty(index, "note", event.target.value)} rows={2} placeholder="Lühimärkus" />
                        <Button type="button" variant="danger" onClick={() => updateCaseForm("parties", caseForm.parties.filter((_, partyIndex) => partyIndex !== index))} className={dangerButtonClassName}>Eemalda</Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </SectionPanel>

              <SectionPanel title="5. Riskid ja kaitsetegurid" aside={<Button type="button" variant="secondary" onClick={addRiskFactor} className={smallButtonClassName}>Lisa tegur</Button>}>
                <div className="grid gap-[0.52rem] md:grid-cols-[0.45fr_1fr_0.45fr]">
                  <SelectField
                    value={riskKind}
                    onChange={(value) => {
                      setRiskKind(value);
                      setRiskLabel(value === "risk" ? COVISION_RISK_OPTIONS[0] : COVISION_PROTECTIVE_OPTIONS[0]);
                    }}
                    ariaLabel="Teguri tüüp"
                    options={[
                      { value: "risk", label: "risk" },
                      { value: "protective", label: "kaitsetegur" }
                    ]}
                  />
                  <SelectField value={riskLabel} onChange={setRiskLabel} ariaLabel="Tegur" options={riskKind === "risk" ? COVISION_RISK_OPTIONS : COVISION_PROTECTIVE_OPTIONS} />
                  <SelectField
                    value={riskSeverity}
                    onChange={setRiskSeverity}
                    ariaLabel="Olulisus"
                    options={[
                      { value: "low", label: "madal" },
                      { value: "medium", label: "keskmine" },
                      { value: "high", label: "kõrge" }
                    ]}
                  />
                </div>
                {caseForm.riskFactors.length ? (
                  <div className="grid gap-[0.5rem] md:grid-cols-2">
                    {caseForm.riskFactors.map((factor, index) => (
                      <div key={`factor-${index}`} className={cn(styles.subtleCard, "grid gap-[0.45rem] rounded-[0.86rem] border px-[0.72rem] py-[0.68rem]")}>
                        <div className="flex flex-wrap items-center justify-between gap-[0.5rem]">
                          <strong className="text-[0.98rem] leading-[1.2]">{factor.label}</strong>
                          <span className={cn(styles.meta, "text-[0.84rem]")}>{factor.type === "protective" ? "kaitsetegur" : "risk"} · {factor.severity}</span>
                        </div>
                        <CovisionTextarea value={factor.note || ""} onChange={(event) => updateRiskFactor(index, "note", event.target.value)} rows={2} placeholder="Märkus" />
                        <Button type="button" variant="danger" onClick={() => updateCaseForm("riskFactors", caseForm.riskFactors.filter((_, factorIndex) => factorIndex !== index))} className={dangerButtonClassName}>Eemalda</Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </SectionPanel>

              <SectionPanel
                title="6. Keskne küsimus ja ootus"
                aside={<Button type="button" variant="secondary" onClick={runQuestionAssist} className={smallButtonClassName}>Paku küsimusi</Button>}
              >
                <CovisionTextarea value={caseForm.centralQuestion} onChange={(event) => updateCaseForm("centralQuestion", event.target.value)} rows={3} placeholder="Sõnasta üks keskne küsimus kolleegidele." />
                {questionSuggestions.length ? (
                  <div className="grid gap-[0.42rem]">
                    {questionSuggestions.map((question) => (
                      <button
                        type="button"
                        key={question}
                        onClick={() => updateCaseForm("centralQuestion", question)}
                        className={cn(styles.suggestionCard, "rounded-[0.82rem] border px-[0.72rem] py-[0.52rem] text-left text-[0.94rem] leading-[1.35]")}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-[0.5rem]">
                  <p className={sectionHeadingClassName}>Mida ootan kovisioonilt?</p>
                  <MultiChoice options={COVISION_EXPECTED_HELP_TYPES} value={caseForm.expectedHelpTypes} onChange={(value) => updateCaseForm("expectedHelpTypes", value)} />
                </div>
              </SectionPanel>

              <SectionPanel title="7. Keda kutsun arutelusse?">
                <div className="grid gap-[0.52rem] md:grid-cols-[1fr_0.62fr_auto]">
                  <CovisionInput value={participantEmail} onChange={(event) => setParticipantEmail(event.target.value)} placeholder="kolleeg@example.ee" type="email" />
                  <SelectField value={participantRole} onChange={setParticipantRole} ariaLabel="Osaleja roll" options={COVISION_PARTICIPANT_ROLES} />
                  <Button type="button" variant="secondary" onClick={addParticipant} className={smallButtonClassName}>Lisa</Button>
                </div>
                {caseForm.participants.length ? (
                  <div className="flex flex-wrap gap-[0.42rem]">
                    {caseForm.participants.map((participant) => (
                      <button
                        type="button"
                        key={`${participant.email}-${participant.role}`}
                        onClick={() => updateCaseForm("participants", caseForm.participants.filter((item) => item.email !== participant.email))}
                        className={cn(styles.chip, "rounded-full border px-[0.7rem] py-[0.28rem] text-[0.86rem]")}
                      >
                        {participant.email} · {optionLabel(COVISION_PARTICIPANT_ROLES, participant.role)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={mutedTextClassName}>Kutse sisu avaneb ainult pärast autentimist ja õiguste kontrolli.</p>
                )}
              </SectionPanel>

              <div className="flex flex-wrap justify-end gap-[0.55rem]">
                <Button type="button" variant="secondary" onClick={() => setView("overview")} className={secondaryButtonClassName}>Tühista</Button>
                <Button type="submit" disabled={saving || !caseForm.title.trim()} className={primaryButtonClassName}>{saving ? "Salvestan..." : "Salvesta kovisioon"}</Button>
              </div>
            </form>
          ) : null}

          {view === "room" && activeCase ? (
            <div className="grid gap-[0.92rem]">
              <div className="flex flex-wrap items-start justify-between gap-[0.72rem]">
                <div className="grid gap-[0.32rem]">
                  <div className="flex flex-wrap items-center gap-[0.5rem]">
                    <h2 className="m-0 text-[1.3rem] font-[700] leading-[1.16]">{activeCase.title}</h2>
                    <StatusBadge status={activeCase.status} />
                  </div>
                  <CardTags tags={activeCase.topics} />
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  <Button type="button" variant="secondary" onClick={() => editCase(activeCase)} className={smallButtonClassName}>Muuda juhtumit</Button>
                  <Button type="button" variant="secondary" onClick={startPracticeFromCase} className={smallButtonClassName}>Loo toimiv praktika</Button>
                </div>
              </div>

              <div className="grid gap-[0.92rem] xl:grid-cols-[0.82fr_1.18fr]">
                <SectionPanel title="Juhtumipüstituse kokkuvõte">
                  <div className="grid gap-[0.58rem]">
                    <p className={mutedTextClassName}>{activeCase.summary || "Lühikirjeldus puudub."}</p>
                    <div className={cn(styles.subtleCard, "rounded-[0.86rem] border px-[0.74rem] py-[0.62rem]")}>
                      <p className="m-0 text-[0.9rem] font-[680]">Keskne küsimus</p>
                      <p className={mutedTextClassName}>{activeCase.centralQuestion || "Täpsustamisel"}</p>
                    </div>
                    <div className="grid gap-[0.46rem]">
                      <p className="m-0 text-[0.9rem] font-[680]">Riskid ja kaitsetegurid</p>
                      <div className="flex flex-wrap gap-[0.32rem]">
                        {(activeCase.riskFactors || []).map((factor) => (
                          <span key={factor.id || factor.label} className={cn(styles.tag, "rounded-full border px-[0.56rem] py-[0.2rem] text-[0.82rem]")}>
                            {factor.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-[0.46rem]">
                      <p className="m-0 text-[0.9rem] font-[680]">Osalejad</p>
                      <div className="flex flex-wrap gap-[0.32rem]">
                        {(activeCase.participants || []).map((participant) => (
                          <span key={participant.id} className={cn(styles.tag, "rounded-full border px-[0.56rem] py-[0.2rem] text-[0.82rem]")}>
                            {participant.user?.name || participant.email || participant.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionPanel>

                <SectionPanel title="Aruteluvoog">
                  <div className="grid max-h-[34rem] gap-[0.55rem] overflow-y-auto pr-[0.25rem]">
                    {(activeCase.messages || []).length ? activeCase.messages.map((message) => (
                      <article key={message.id} className={cn(styles.message, "grid gap-[0.24rem] rounded-[0.86rem] border px-[0.72rem] py-[0.62rem]")}>
                        <div className={cn(styles.meta, "flex flex-wrap items-center justify-between gap-[0.45rem] text-[0.8rem]")}>
                          <span>{message.author?.name || message.author?.email || "Osaleja"} · {optionLabel(COVISION_MESSAGE_TYPES, message.messageType)}</span>
                          <span>{formatDate(message.createdAt, locale)}</span>
                        </div>
                        <p className="m-0 whitespace-pre-wrap text-[0.98rem] leading-[1.45]">{message.body}</p>
                      </article>
                    )) : (
                      <p className={mutedTextClassName}>Arutelu ei ole veel alanud.</p>
                    )}
                  </div>
                  <form onSubmit={sendMessage} className={cn(styles.discussionForm, "grid gap-[0.52rem] border-t pt-[0.72rem]")}>
                    <SelectField value={messageType} onChange={setMessageType} ariaLabel="Sõnumi tüüp" options={COVISION_MESSAGE_TYPES} />
                    <CovisionTextarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} rows={3} placeholder="Lisa mõte, küsimus või struktureeritud tähelepanek." />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving || !messageBody.trim()} className={compactPrimaryButtonClassName}>Lisa arutelusse</Button>
                    </div>
                  </form>
                </SectionPanel>
              </div>

              <SectionPanel
                title="Kovisiooni kokkuvõte"
                aside={<Button type="button" variant="secondary" onClick={draftSummary} className={smallButtonClassName}>Koosta mustand</Button>}
              >
                <div className="grid gap-[0.58rem] md:grid-cols-2">
                  <SummaryField label="Peamised tähelepanekud" value={summaryForm.keyObservations} onChange={(value) => setSummaryForm((current) => ({ ...current, keyObservations: value }))} />
                  <SummaryField label="Kolleegide küsimused" value={summaryForm.questions} onChange={(value) => setSummaryForm((current) => ({ ...current, questions: value }))} />
                  <SummaryField label="Riskid, mis vajavad tähelepanu" value={summaryForm.risks} onChange={(value) => setSummaryForm((current) => ({ ...current, risks: value }))} />
                  <SummaryField label="Kaitsetegurid" value={summaryForm.protectiveFactors} onChange={(value) => setSummaryForm((current) => ({ ...current, protectiveFactors: value }))} />
                  <SummaryField label="Võimalikud järgmised tööalased sammud" value={summaryForm.possibleNextSteps} onChange={(value) => setSummaryForm((current) => ({ ...current, possibleNextSteps: value }))} />
                  <SummaryField label="Eetilised või metoodilised küsimused" value={summaryForm.ethicalNotes} onChange={(value) => setSummaryForm((current) => ({ ...current, ethicalNotes: value }))} />
                  <SummaryField label="Dokumenteerimise tähelepanekud" value={summaryForm.documentationNotes} onChange={(value) => setSummaryForm((current) => ({ ...current, documentationNotes: value }))} />
                  <SummaryField label="Võrgustikutöö mõtted" value={summaryForm.networkNotes} onChange={(value) => setSummaryForm((current) => ({ ...current, networkNotes: value }))} />
                  <SummaryField label="Mida juhtumi püstitaja kaasa võtab" value={summaryForm.takeaways} onChange={(value) => setSummaryForm((current) => ({ ...current, takeaways: value }))} />
                  <SummaryField label="Lahtised küsimused" value={summaryForm.openQuestions} onChange={(value) => setSummaryForm((current) => ({ ...current, openQuestions: value }))} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={saveSummary} disabled={saving} className={compactPrimaryButtonClassName}>Salvesta kokkuvõte</Button>
                </div>
              </SectionPanel>
            </div>
          ) : null}

          {view === "practice_form" ? (
            <form onSubmit={savePractice} className="grid gap-[0.9rem]">
              <SectionPanel title="Toimiv praktika">
                <div className="grid gap-[0.68rem] md:grid-cols-[1fr_0.52fr]">
                  <Field label="Pealkiri">
                    <CovisionInput value={practiceForm.title} onChange={(event) => updatePracticeForm("title", event.target.value)} required />
                  </Field>
                  <Field label="Staatus">
                    <SelectField value={practiceForm.status} onChange={(value) => updatePracticeForm("status", value)} ariaLabel="Staatus" options={EFFECTIVE_PRACTICE_STATUSES} />
                  </Field>
                </div>
                <div className="grid gap-[0.5rem]">
                  <p className={sectionHeadingClassName}>Teemad</p>
                  <MultiChoice options={COVISION_TOPICS} value={practiceForm.topics} onChange={(value) => updatePracticeForm("topics", value)} />
                </div>
                <Field label="Sildid">
                  <CovisionInput value={practiceForm.tagText} onChange={(event) => updatePracticeForm("tagText", event.target.value)} placeholder="eralda komaga" />
                </Field>
                <div className="grid gap-[0.62rem] md:grid-cols-2">
                  <SummaryField label="Olukorra üldine taust" value={practiceForm.background} onChange={(value) => updatePracticeForm("background", value)} />
                  <SummaryField label="Peamine takistus" value={practiceForm.mainChallenge} onChange={(value) => updatePracticeForm("mainChallenge", value)} />
                  <SummaryField label="Mis aitas" value={practiceForm.whatHelped} onChange={(value) => updatePracticeForm("whatHelped", value)} />
                  <SummaryField label="Milline võrgustik või teenus oli oluline" value={practiceForm.networkOrServiceRole} onChange={(value) => updatePracticeForm("networkOrServiceRole", value)} />
                  <SummaryField label="Milline oli tulemus" value={practiceForm.outcome} onChange={(value) => updatePracticeForm("outcome", value)} />
                  <SummaryField label="Mida teine spetsialist saab õppida" value={practiceForm.learningPoints} onChange={(value) => updatePracticeForm("learningPoints", value)} />
                  <SummaryField label="Millal see lähenemine ei pruugi sobida" value={practiceForm.limitations} onChange={(value) => updatePracticeForm("limitations", value)} />
                  <SummaryField label="Seotud allikad või juhised" value={practiceForm.sources} onChange={(value) => updatePracticeForm("sources", value)} />
                </div>
                <p className={mutedTextClassName}>Toimivat praktikat ei avaldata ilma anonüümsuse kontrolli ja ülevaatuseta.</p>
              </SectionPanel>
              <div className="flex flex-wrap justify-end gap-[0.55rem]">
                <Button type="button" variant="secondary" onClick={() => setView(activeCase ? "room" : "overview")} className={secondaryButtonClassName}>Tühista</Button>
                <Button type="submit" disabled={saving || !practiceForm.title.trim()} className={primaryButtonClassName}>{saving ? "Salvestan..." : "Salvesta toimiv praktika"}</Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
