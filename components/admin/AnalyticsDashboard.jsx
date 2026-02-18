"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import BackIcon from "@/components/ui/icons/BackIcon";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";

const pageClassName = "flex flex-col gap-2 text-[color:var(--admin-text)] [--rag-text:var(--admin-text)]";
const pageHeaderClassName = "flex flex-col items-start gap-2 text-left";
const pageTitleClassName = `${glassPageTitleClassName} !mt-0 !mb-1 !px-0 !text-left !whitespace-normal !text-[clamp(1.55rem,2.5vw,2.1rem)] !tracking-[0.02em] max-[48em]:!text-[clamp(1.72rem,7vw,2.35rem)] max-[48em]:!leading-[1.06] max-[48em]:!mt-0 max-[48em]:!mb-0`;
const cardClassName = "relative overflow-hidden rounded-[1rem] border border-[color:var(--glass-border-color,var(--admin-border))] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_78%,var(--glass-surface-bg)_22%),color-mix(in_srgb,var(--admin-surface-2)_84%,transparent))] p-[clamp(0.72rem,1.9vw,0.95rem)] shadow-[var(--glass-shell-shadow,var(--admin-shadow-soft))] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_12%_-4%,rgba(255,255,255,0.11),transparent_44%)] before:opacity-65";
const cardBodyClassName = "relative z-[1] grid gap-1.5";
const kpiGridClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-2";
const kpiValueClassName = "text-[1.6rem] font-[700] text-[color:var(--admin-text)]";
const kpiMetaClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
const sectionHeadClassName = "flex flex-wrap items-start justify-between gap-2";
const sectionSubClassName = "text-[0.95rem] text-[color:var(--admin-muted)] max-w-[56ch]";
const barClassName = "flex h-2 overflow-hidden rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)]";
const tableWrapClassName = "overflow-x-auto rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]";
const tableClassName = "w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName = "border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-1.5 text-left text-[0.82rem] uppercase tracking-[0.02em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-2 py-1.5 text-left text-[0.9rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const toolbarPrimaryClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-2 shadow-[var(--admin-shadow-soft)]";
const toolbarSecondaryClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_80%,transparent)] p-2";
const usersSelectBarClassName = "grid gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-2";
const usersSelectActionsClassName = "flex flex-wrap items-center gap-2";
const usersSelectCountClassName = "inline-flex items-center rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] px-2.5 py-1 text-[0.82rem] text-[color:var(--admin-muted)]";
const emailSendBarClassName = "grid gap-2 rounded-[14px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-2)_90%,transparent),color-mix(in_srgb,var(--admin-surface-3)_92%,transparent))] p-2";
const emailSendHeadClassName = "flex flex-wrap items-center justify-between gap-2";
const emailSendHintClassName = "text-[0.86rem] text-[color:var(--admin-muted)]";
const selectClassName = "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const inputClassName = "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.6rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const textAreaClassName = "w-full min-h-[120px] rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.7rem] text-[0.95rem] leading-[1.45] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const alertErrorClassName = "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertInfoClassName = "rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color-mix(in_srgb,var(--admin-accent-cool)_15%,var(--admin-surface-2)_85%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertWarnClassName = "rounded-[12px] border border-[color:var(--admin-warning,#f59e0b)] bg-[color-mix(in_srgb,var(--admin-warning,#f59e0b)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertCriticalClassName = "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertSuccessClassName = "rounded-[12px] border border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
const refreshButtonStyle = {
  "--btn-primary-bg": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_35%,var(--admin-surface)_65%),var(--admin-surface-2))",
  "--btn-primary-bg-hover": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_42%,var(--admin-surface)_58%),var(--admin-surface-2))",
  "--btn-primary-bg-active": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_28%,var(--admin-surface)_72%),var(--admin-surface-2))",
  "--btn-primary-border": "1px solid color-mix(in_srgb,var(--admin-accent)_65%,var(--admin-border)_35%)",
  "--btn-primary-border-hover": "1px solid var(--admin-accent)",
  "--btn-primary-border-active": "1px solid color-mix(in_srgb,var(--admin-accent)_75%,var(--admin-border)_25%)",
  "--btn-primary-text": "var(--admin-text)",
  "--btn-primary-shadow": "var(--admin-shadow-soft)",
  "--btn-primary-shadow-hover": "0 0 0 3px var(--admin-accent-soft), var(--admin-shadow)",
  "--btn-primary-shadow-active": "var(--admin-shadow-soft)",
  "--btn-primary-focus-ring-color": "var(--admin-accent-soft)"
};
const refreshButtonClassName = "min-h-[2.2rem] rounded-[0.9rem] px-[0.95rem] py-[0.45rem] text-[0.95rem] font-semibold tracking-[0.01em]";
const actionButtonClassName = "min-h-[2.2rem] rounded-[0.9rem] px-[0.95rem] py-[0.45rem] text-[0.92rem] font-semibold tracking-[0.01em]";
const backButtonClassName = "inline-flex h-[5.2rem] w-[5.2rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.12] focus-visible:outline-none active:scale-[0.98]";

const EVENT_OPTIONS = [
  { value: "chat_request", labelKey: "admin.analytics.events.chat_request" },
  { value: "rag_search", labelKey: "admin.analytics.events.rag_search" },
  { value: "no_context", labelKey: "admin.analytics.events.no_context" },
  { value: "crisis_detected", labelKey: "admin.analytics.events.crisis_detected" },
  { value: "stt_request", labelKey: "admin.analytics.events.stt_request" },
  { value: "tts_request", labelKey: "admin.analytics.events.tts_request" },
  { value: "rag_error", labelKey: "admin.analytics.events.rag_error" },
  { value: "openai_error", labelKey: "admin.analytics.events.openai_error" },
  { value: "subscription_init_started", labelKey: "admin.analytics.events.subscription_init_started" },
  { value: "subscription_init_checkout_created", labelKey: "admin.analytics.events.subscription_init_checkout_created" },
  { value: "subscription_init_failed", labelKey: "admin.analytics.events.subscription_init_failed" },
  { value: "subscription_callback_redirect", labelKey: "admin.analytics.events.subscription_callback_redirect" },
  { value: "subscription_webhook_processed", labelKey: "admin.analytics.events.subscription_webhook_processed" },
  { value: "subscription_webhook_failed", labelKey: "admin.analytics.events.subscription_webhook_failed" },
  { value: "subscription_webhook_owner_email_sent", labelKey: "admin.analytics.events.subscription_webhook_owner_email_sent" },
  { value: "subscription_webhook_owner_email_failed", labelKey: "admin.analytics.events.subscription_webhook_owner_email_failed" },
  { value: "subscription_webhook_owner_email_skipped", labelKey: "admin.analytics.events.subscription_webhook_owner_email_skipped" },
  { value: "payment_alert_dispatch_dry_run", labelKey: "admin.analytics.events.payment_alert_dispatch_dry_run" },
  { value: "payment_alert_dispatched", labelKey: "admin.analytics.events.payment_alert_dispatched" },
  { value: "payment_alert_dispatch_failed", labelKey: "admin.analytics.events.payment_alert_dispatch_failed" }
];

const PRELAUNCH_RESET_ACTIONS = [
  { value: "clear_logs", labelKey: "admin.analytics.reset.actions.clear_logs" },
  { value: "clear_conversations", labelKey: "admin.analytics.reset.actions.clear_conversations" },
  { value: "clear_rooms", labelKey: "admin.analytics.reset.actions.clear_rooms" },
  { value: "clear_auth_tokens", labelKey: "admin.analytics.reset.actions.clear_auth_tokens" },
  { value: "clear_usage_metrics", labelKey: "admin.analytics.reset.actions.clear_usage_metrics" },
  { value: "clear_billing", labelKey: "admin.analytics.reset.actions.clear_billing" }
];

const STATUS_LABEL_KEYS = {
  PENDING: "admin.analytics.status.pending",
  PROCESSING: "admin.analytics.status.processing",
  COMPLETED: "admin.analytics.status.completed",
  FAILED: "admin.analytics.status.failed"
};

const AUDIENCE_LABEL_KEYS = {
  SOCIAL_WORKER: "admin.analytics.audience.social_worker",
  CLIENT: "admin.analytics.audience.client",
  BOTH: "admin.analytics.audience.both"
};

function formatI18n(template, values) {
  if (typeof template !== "string") return "";
  if (!values || typeof values !== "object") return template;
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}

function toLocaleTag(locale) {
  const normalized = String(locale || "en").toLowerCase();
  if (normalized.startsWith("et")) return "et-EE";
  if (normalized.startsWith("ru")) return "ru-RU";
  return "en-US";
}

const toNumber = value => {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const formatCount = (value, localeTag) => {
  const n = toNumber(value);
  try {
    return new Intl.NumberFormat(localeTag).format(n);
  } catch {
    return String(n);
  }
};

const formatMoney = (amount, currency = "EUR", localeTag) => {
  const n = toNumber(amount);
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency
    }).format(n);
  } catch {
    return `${n.toFixed?.(2) || n} ${currency}`;
  }
};

const formatPercent = (value, localeTag) => {
  const n = toNumber(value);
  try {
    return new Intl.NumberFormat(localeTag, {
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return String(Math.round(n));
  }
};

const joinCounts = (obj = {}, order = [], labels = {}) => {
  const keys = order.length ? order : Object.keys(obj || {});
  const parts = [];
  for (const key of keys) {
    if (obj?.[key] == null) continue;
    parts.push(`${labels[key] || key}: ${obj[key]}`);
  }
  return parts.join(" | ");
};

const formatDate = (iso, localeTag) => {
  try {
    return new Intl.DateTimeFormat(localeTag, {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(iso));
  } catch {
    return iso || "-";
  }
};

export default function AnalyticsDashboard() {
  const { t, locale } = useI18n();
  const localeTag = useMemo(() => toLocaleTag(locale), [locale]);

  const tr = useCallback(
    (key, values) => {
      const raw = t(key);
      const template = typeof raw === "string" && raw.trim() ? raw : key;
      return formatI18n(template, values);
    },
    [t]
  );

  const eventLabels = useMemo(() => {
    const out = {};
    for (const entry of EVENT_OPTIONS) out[entry.value] = tr(entry.labelKey);
    return out;
  }, [tr]);

  const statusLabels = useMemo(
    () => ({
      PENDING: tr(STATUS_LABEL_KEYS.PENDING),
      PROCESSING: tr(STATUS_LABEL_KEYS.PROCESSING),
      COMPLETED: tr(STATUS_LABEL_KEYS.COMPLETED),
      FAILED: tr(STATUS_LABEL_KEYS.FAILED)
    }),
    [tr]
  );

  const audienceLabels = useMemo(
    () => ({
      SOCIAL_WORKER: tr(AUDIENCE_LABEL_KEYS.SOCIAL_WORKER),
      CLIENT: tr(AUDIENCE_LABEL_KEYS.CLIENT),
      BOTH: tr(AUDIENCE_LABEL_KEYS.BOTH)
    }),
    [tr]
  );

  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [isCrisisFilter, setIsCrisisFilter] = useState("all");
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [usersActionNotice, setUsersActionNotice] = useState(null);
  const [logsActionNotice, setLogsActionNotice] = useState(null);
  const [deletingUsers, setDeletingUsers] = useState(false);
  const [deletingLogs, setDeletingLogs] = useState(false);
  const [runningResetAction, setRunningResetAction] = useState("");
  const [resetActionNotice, setResetActionNotice] = useState(null);
  const [sendingUsersEmail, setSendingUsersEmail] = useState(false);
  const [emailTarget, setEmailTarget] = useState("selected");
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailText, setBulkEmailText] = useState("");

  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);

  const visibleUserRows = useMemo(() => usersAnalytics?.items || [], [usersAnalytics?.items]);
  const visibleUserIds = useMemo(() => visibleUserRows.map(row => row.userId), [visibleUserRows]);
  const visibleUserIdSet = useMemo(() => new Set(visibleUserIds), [visibleUserIds]);
  const selectedVisibleCount = useMemo(
    () => selectedUserIds.filter(id => visibleUserIdSet.has(id)).length,
    [selectedUserIds, visibleUserIdSet]
  );
  const allVisibleSelected = visibleUserIds.length > 0 && selectedVisibleCount === visibleUserIds.length;
  const selectedCount = selectedUserIds.length;

  useEffect(() => {
    setSelectedUserIds(prev => prev.filter(id => visibleUserIdSet.has(id)));
  }, [visibleUserIdSet]);

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/analytics/summary", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || tr("admin.analytics.errors.summary_fetch_failed"));
        }
        setSummary(data);
      } catch (err) {
        setError(err?.message || tr("admin.analytics.errors.summary_fetch_failed"));
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [refreshKey, tr]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        if (eventFilter !== "all") params.set("event", eventFilter);
        if (isCrisisFilter === "true" || isCrisisFilter === "false") {
          params.set("isCrisis", isCrisisFilter);
        }

        const res = await fetch(`/api/admin/analytics/events?${params.toString()}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || tr("admin.analytics.errors.events_fetch_failed"));
        }

        setEvents(data?.items || []);
      } catch (err) {
        setError(err?.message || tr("admin.analytics.errors.events_fetch_failed"));
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [eventFilter, isCrisisFilter, refreshKey, tr]);

  useEffect(() => {
    const loadUsersAnalytics = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", "200");
        params.set("days", "30");
        const res = await fetch(`/api/admin/analytics/users?${params.toString()}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || tr("admin.analytics.errors.users_fetch_failed"));
        }
        setUsersAnalytics(data);
      } catch (err) {
        setError(err?.message || tr("admin.analytics.errors.users_fetch_failed"));
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsersAnalytics();
  }, [refreshKey, tr]);

  const groundingSummary = useMemo(() => {
    if (!summary?.averages?.groundingDistribution) return null;
    const dist = summary.averages.groundingDistribution;
    const total = (dist.weak || 0) + (dist.ok || 0) + (dist.strong || 0);
    if (!total) return null;

    return {
      weak: Math.round((100 * (dist.weak || 0)) / total),
      ok: Math.round((100 * (dist.ok || 0)) / total),
      strong: Math.round((100 * (dist.strong || 0)) / total)
    };
  }, [summary]);

  const requestSplit = useMemo(() => {
    const total = summary?.totalRequests || 0;
    if (!total) return null;
    const rag = Math.round((100 * (summary?.ragSearchCount || 0)) / total);
    const noContext = Math.round((100 * (summary?.noContextCount || 0)) / total);
    return { rag, noContext };
  }, [summary]);

  const filteredEvents = useMemo(
    () =>
      events.filter(event => {
        if (eventFilter !== "all" && event.event !== eventFilter) return false;
        if (isCrisisFilter === "true" && event?.data?.isCrisis !== true) return false;
        if (isCrisisFilter === "false" && event?.data?.isCrisis === true) return false;
        return true;
      }),
    [events, eventFilter, isCrisisFilter]
  );

  const paymentPipeline = summary?.billing?.paymentPipeline30d || null;
  const paymentAlerts = summary?.billing?.paymentAlerts30d || [];

  const metaSummary = useCallback(
    (data = {}) => {
      const parts = [];
      if (typeof data.ragMatchCount === "number") {
        parts.push(`${tr("admin.analytics.meta.hits")}: ${data.ragMatchCount}`);
      }
      if (typeof data.groupCount === "number") {
        parts.push(`${tr("admin.analytics.meta.groups")}: ${data.groupCount}`);
      }
      if (typeof data.grounding === "string") {
        parts.push(`${tr("admin.analytics.meta.grounding")}: ${data.grounding}`);
      }
      if (typeof data.chosenGroupCount === "number") {
        parts.push(`${tr("admin.analytics.meta.chosen")}: ${data.chosenGroupCount}`);
      }
      if (typeof data.isCrisis === "boolean") {
        parts.push(`${tr("admin.analytics.meta.crisis")}: ${data.isCrisis ? tr("admin.common.yes") : tr("admin.common.no")}`);
      }
      if (typeof data.hasHistory === "boolean") {
        parts.push(`${tr("admin.analytics.meta.history")}: ${data.hasHistory ? tr("admin.common.yes") : tr("admin.common.no")}`);
      }
      if (typeof data.paymentState === "string" && data.paymentState) {
        parts.push(`${tr("admin.analytics.meta.payment_state")}: ${data.paymentState}`);
      }
      if (typeof data.resultStatus === "string" && data.resultStatus) {
        parts.push(`${tr("admin.analytics.meta.result_status")}: ${data.resultStatus}`);
      }
      if (typeof data.subscriptionAction === "string" && data.subscriptionAction) {
        parts.push(`${tr("admin.analytics.meta.subscription_action")}: ${data.subscriptionAction}`);
      }
      if (typeof data.code === "string" && data.code) {
        parts.push(`${tr("admin.analytics.meta.alert_code")}: ${data.code}`);
      }
      return parts.join(" | ");
    },
    [tr]
  );

  const loadingLabel = tr("admin.common.loading");
  const paymentAlertClass = useCallback(
    severity => {
      if (severity === "critical") return alertCriticalClassName;
      if (severity === "warning") return alertWarnClassName;
      return alertInfoClassName;
    },
    []
  );

  const toggleUserSelection = useCallback(userId => {
    setSelectedUserIds(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  }, []);

  const toggleAllVisibleUsers = useCallback(() => {
    setSelectedUserIds(prev => {
      const prevSet = new Set(prev);
      if (allVisibleSelected) {
        return prev.filter(id => !visibleUserIdSet.has(id));
      }
      for (const id of visibleUserIds) prevSet.add(id);
      return Array.from(prevSet);
    });
  }, [allVisibleSelected, visibleUserIds, visibleUserIdSet]);

  const clearUsersActionNotice = useCallback(() => setUsersActionNotice(null), []);
  const clearLogsActionNotice = useCallback(() => setLogsActionNotice(null), []);

  const onDeleteSelectedUsers = useCallback(async () => {
    if (!selectedUserIds.length || deletingUsers || sendingUsersEmail) return;
    const confirmed = window.confirm(tr("admin.analytics.users.actions.delete_confirm", { count: selectedUserIds.length }));
    if (!confirmed) return;

    setDeletingUsers(true);
    setUsersActionNotice(null);
    try {
      const res = await fetch("/api/admin/analytics/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          userIds: selectedUserIds
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || tr("admin.analytics.errors.users_delete_failed"));
      }

      const deletedCount = toNumber(data?.deletedCount || 0);
      const blockedAdmins = Array.isArray(data?.blocked?.admins) ? data.blocked.admins.length : 0;
      const blockedSelf = data?.blocked?.self ? 1 : 0;

      setSelectedUserIds(prev => prev.filter(id => !(Array.isArray(data?.deletedIds) && data.deletedIds.includes(id))));
      setUsersActionNotice({
        type: "success",
        message: tr("admin.analytics.users.actions.delete_done", {
          deleted: deletedCount,
          blocked: blockedAdmins + blockedSelf
        })
      });
      refresh();
    } catch (err) {
      setUsersActionNotice({
        type: "error",
        message: err?.message || tr("admin.analytics.errors.users_delete_failed")
      });
    } finally {
      setDeletingUsers(false);
    }
  }, [deletingUsers, locale, refresh, selectedUserIds, sendingUsersEmail, tr]);

  const onSendBulkEmail = useCallback(async () => {
    if (sendingUsersEmail || deletingUsers) return;
    const subject = String(bulkEmailSubject || "").trim();
    const text = String(bulkEmailText || "").trim();
    if (!subject || !text) {
      setUsersActionNotice({
        type: "error",
        message: tr("admin.analytics.errors.users_email_invalid_payload")
      });
      return;
    }
    if (emailTarget === "selected" && !selectedUserIds.length) {
      setUsersActionNotice({
        type: "error",
        message: tr("admin.analytics.users.actions.select_users_first")
      });
      return;
    }

    setSendingUsersEmail(true);
    setUsersActionNotice(null);
    try {
      const res = await fetch("/api/admin/analytics/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          target: emailTarget,
          userIds: emailTarget === "selected" ? selectedUserIds : [],
          subject,
          text
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || tr("admin.analytics.errors.users_email_send_failed"));
      }

      setUsersActionNotice({
        type: data?.failedCount ? "warn" : "success",
        message: tr("admin.analytics.users.actions.email_done", {
          sent: toNumber(data?.sentCount || 0),
          failed: toNumber(data?.failedCount || 0)
        })
      });
      if (!data?.failedCount) {
        setBulkEmailSubject("");
        setBulkEmailText("");
      }
    } catch (err) {
      setUsersActionNotice({
        type: "error",
        message: err?.message || tr("admin.analytics.errors.users_email_send_failed")
      });
    } finally {
      setSendingUsersEmail(false);
    }
  }, [bulkEmailSubject, bulkEmailText, deletingUsers, emailTarget, locale, selectedUserIds, sendingUsersEmail, tr]);

  const onDeleteLogs = useCallback(
    async mode => {
      if (deletingLogs) return;
      const deleteAll = mode === "all";
      const confirmMessage = deleteAll
        ? tr("admin.analytics.logs.actions.delete_all_confirm")
        : tr("admin.analytics.logs.actions.delete_filtered_confirm");
      if (!window.confirm(confirmMessage)) return;

      setDeletingLogs(true);
      setLogsActionNotice(null);
      try {
        const res = await fetch("/api/admin/analytics/events", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            all: deleteAll,
            event: deleteAll || eventFilter === "all" ? null : eventFilter,
            isCrisis: deleteAll ? "all" : isCrisisFilter
          })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || tr("admin.analytics.errors.logs_delete_failed"));
        }

        setLogsActionNotice({
          type: "success",
          message: tr("admin.analytics.logs.actions.delete_done", {
            count: toNumber(data?.deletedCount || 0)
          })
        });
        refresh();
      } catch (err) {
        setLogsActionNotice({
          type: "error",
          message: err?.message || tr("admin.analytics.errors.logs_delete_failed")
        });
      } finally {
        setDeletingLogs(false);
      }
    },
    [deletingLogs, eventFilter, isCrisisFilter, locale, refresh, tr]
  );

  const onRunPrelaunchReset = useCallback(
    async action => {
      if (!action || runningResetAction) return;
      const actionLabel = tr(`admin.analytics.reset.actions.${action}`);
      const confirmed = window.confirm(
        tr("admin.analytics.reset.confirm", { action: actionLabel })
      );
      if (!confirmed) return;

      setRunningResetAction(action);
      setResetActionNotice(null);
      try {
        const dryRes = await fetch("/api/admin/analytics/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale, action, dryRun: true })
        });
        const dryData = await dryRes.json().catch(() => null);
        if (!dryRes.ok || dryData?.ok === false) {
          throw new Error(dryData?.message || tr("admin.analytics.errors.reset_failed"));
        }

        const finalConfirmed = window.confirm(
          tr("admin.analytics.reset.confirm_with_count", {
            action: actionLabel,
            count: toNumber(dryData?.total || 0)
          })
        );
        if (!finalConfirmed) {
          setResetActionNotice({
            type: "warn",
            message: tr("admin.analytics.reset.cancelled")
          });
          return;
        }

        const res = await fetch("/api/admin/analytics/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale, action, dryRun: false })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || tr("admin.analytics.errors.reset_failed"));
        }

        setResetActionNotice({
          type: "success",
          message: tr("admin.analytics.reset.done", {
            action: actionLabel,
            count: toNumber(data?.total || 0)
          })
        });
        refresh();
      } catch (err) {
        setResetActionNotice({
          type: "error",
          message: err?.message || tr("admin.analytics.errors.reset_failed")
        });
      } finally {
        setRunningResetAction("");
      }
    },
    [locale, refresh, runningResetAction, tr]
  );

  return (
    <div className={pageClassName}>
      <div className={pageHeaderClassName}>
        <h1 className={pageTitleClassName}>{tr("admin.analytics.title")}</h1>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="primary"
            className={refreshButtonClassName}
            style={refreshButtonStyle}
            onClick={refresh}
            disabled={loadingSummary || loadingEvents || loadingUsers}
          >
            {loadingSummary || loadingEvents || loadingUsers ? loadingLabel : tr("admin.common.refresh")}
          </Button>
        </div>
      </div>

      {error ? <div className={alertErrorClassName}>{error}</div> : null}

      <div className={kpiGridClassName}>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.requests_30d.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.totalRequests ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>{tr("admin.analytics.kpis.requests_30d.meta")}</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.rag_searches.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.ragSearchCount ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>
              {requestSplit
                ? tr("admin.analytics.kpis.share", { percent: requestSplit.rag })
                : tr("admin.analytics.kpis.share_missing")}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.no_context.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.noContextCount ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>
              {requestSplit
                ? tr("admin.analytics.kpis.share", { percent: requestSplit.noContext })
                : tr("admin.analytics.kpis.share_missing")}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.crisis.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.totalCrisis ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>{tr("admin.analytics.kpis.crisis.meta")}</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.rag_averages.title")}</CardTitle>
            <div className={kpiMetaClassName}>
              {loadingSummary
                ? loadingLabel
                : tr("admin.analytics.kpis.rag_averages.meta", {
                    hits: summary?.averages?.avgRagMatchCount?.toFixed?.(1) || "0",
                    groups: summary?.averages?.avgGroupCount?.toFixed?.(1) || "0",
                    chosen: summary?.averages?.avgChosenGroupCount?.toFixed?.(1) || "0"
                  })}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[96px]`}>
            <CardTitle>{tr("admin.analytics.kpis.grounding.title")}</CardTitle>
            {groundingSummary ? (
              <>
                <div className={barClassName}>
                  <span className="block h-full bg-[color:var(--admin-success)]" style={{ width: `${groundingSummary.strong}%` }} />
                  <span className="block h-full bg-[color:var(--admin-accent-cool)]" style={{ width: `${groundingSummary.ok}%` }} />
                  <span className="block h-full bg-[color:var(--admin-danger)]" style={{ width: `${groundingSummary.weak}%` }} />
                </div>
                <div className={kpiMetaClassName}>
                  {tr("admin.analytics.kpis.grounding.meta", {
                    strong: groundingSummary.strong,
                    ok: groundingSummary.ok,
                    weak: groundingSummary.weak
                  })}
                </div>
              </>
            ) : (
              <div className={kpiMetaClassName}>{loadingSummary ? loadingLabel : "-"}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{tr("admin.analytics.reset.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.reset.subtitle")}</div>
            </div>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {PRELAUNCH_RESET_ACTIONS.map(item => {
              const action = item.value;
              const isRunning = runningResetAction === action;
              return (
                <Button
                  key={action}
                  size="sm"
                  variant="danger"
                  className={actionButtonClassName}
                  onClick={() => onRunPrelaunchReset(action)}
                  disabled={Boolean(runningResetAction) || loadingSummary || loadingEvents || loadingUsers}
                >
                  {isRunning ? tr("admin.analytics.reset.running") : tr(item.labelKey)}
                </Button>
              );
            })}
          </div>
          {resetActionNotice ? (
            <div
              className={
                resetActionNotice.type === "success"
                  ? `${alertSuccessClassName} mt-2`
                  : resetActionNotice.type === "warn"
                    ? `${alertWarnClassName} mt-2`
                    : `${alertErrorClassName} mt-2`
              }
            >
              {resetActionNotice.message}
            </div>
          ) : null}
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{tr("admin.analytics.rag_docs.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.rag_docs.subtitle")}</div>
            </div>
          </div>
          <div className={`${kpiGridClassName} mt-2`}>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.total")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.ragDocs?.total ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.failed")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.ragDocs?.failed ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.error_30d")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.ragDocs?.error30d ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.statuses")}</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : joinCounts(summary?.ragDocs?.byStatus, ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], statusLabels) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.audience")}</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : joinCounts(summary?.ragDocs?.byAudience, ["CLIENT", "SOCIAL_WORKER", "BOTH"], audienceLabels) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.rag_docs.type")}</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary ? loadingLabel : joinCounts(summary?.ragDocs?.byType, ["FILE", "URL"]) || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className={`${tableWrapClassName} mt-2`}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.time")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.title")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.status")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.type")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.audience")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.table.source")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      {loadingLabel}
                    </td>
                  </tr>
                ) : (summary?.ragDocs?.recent || []).length ? (
                  (summary?.ragDocs?.recent || []).map(doc => {
                    const source = (doc.sourceUrl || doc.fileName || "").toString();
                    return (
                      <tr key={doc.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>{formatDate(doc.insertedAt || doc.createdAt, localeTag)}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>{doc.title || tr("admin.analytics.table.untitled")}</td>
                        <td className={tableCellClassName}>{statusLabels[doc.status] || doc.status}</td>
                        <td className={tableCellClassName}>{doc.type}</td>
                        <td className={tableCellClassName}>{audienceLabels[doc.audience] || doc.audience || "-"}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>{source ? source.slice(0, 80) : "-"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      {tr("admin.analytics.table.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{tr("admin.analytics.billing.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.billing.subtitle")}</div>
            </div>
          </div>
          <div className="mt-2 grid gap-2">
            {loadingSummary ? (
              <div className={alertInfoClassName}>{loadingLabel}</div>
            ) : paymentAlerts.length ? (
              paymentAlerts.map((alert, idx) => (
                <div key={`${alert.code || "alert"}_${idx}`} className={paymentAlertClass(alert.severity)}>
                  <strong>{tr(`admin.analytics.billing.alerts.severity.${alert.severity || "info"}`)}:</strong>{" "}
                  {tr(`admin.analytics.billing.alerts.items.${alert.code || "unknown"}`, {
                    value: formatPercent(alert.value ?? 0, localeTag),
                    threshold: formatPercent(alert.threshold ?? 0, localeTag)
                  })}
                </div>
              ))
            ) : (
              <div className={alertInfoClassName}>{tr("admin.analytics.billing.alerts.none")}</div>
            )}
          </div>
          <div className={`${kpiGridClassName} mt-2`}>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.pipeline.checkout_ready")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? loadingLabel : formatCount(paymentPipeline?.checkoutCreated ?? 0, localeTag)}
                </div>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : tr("admin.analytics.billing.pipeline.from_init", {
                        percent: formatPercent(paymentPipeline?.checkoutCreateRatePct ?? 0, localeTag)
                      })}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.pipeline.webhook_paid")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? loadingLabel : formatCount(paymentPipeline?.webhookPaid ?? 0, localeTag)}
                </div>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : tr("admin.analytics.billing.pipeline.from_checkout", {
                        percent: formatPercent(paymentPipeline?.paidFromCheckoutRatePct ?? 0, localeTag)
                      })}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.pipeline.callback_success")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? loadingLabel : formatCount(paymentPipeline?.callbackSuccess ?? 0, localeTag)}
                </div>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : tr("admin.analytics.billing.pipeline.callback_share", {
                        percent: formatPercent(paymentPipeline?.callbackSuccessFromCheckoutRatePct ?? 0, localeTag)
                      })}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.pipeline.webhook_errors")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? loadingLabel : formatCount(paymentPipeline?.webhookError ?? 0, localeTag)}
                </div>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : tr("admin.analytics.billing.pipeline.breakdown", {
                        failed: formatCount(paymentPipeline?.webhookFailed ?? 0, localeTag),
                        canceled: formatCount(paymentPipeline?.webhookCanceled ?? 0, localeTag),
                        refunded: formatCount(paymentPipeline?.webhookRefunded ?? 0, localeTag)
                      })}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.active_subscriptions")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.billing?.activeSubscriptions ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.new_subscriptions_30d")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.billing?.newSubscriptions30d ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.cancellations_30d")}</CardTitle>
                <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.billing?.canceledSubscriptions30d ?? 0, localeTag)}</div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.payment_statuses_30d")}</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary
                    ? loadingLabel
                    : joinCounts(summary?.billing?.paymentsByStatus30d, ["PAID", "INITIATED", "FAILED", "CANCELED", "REFUNDED"]) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.billing.paid_amount_30d")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? loadingLabel : formatMoney(summary?.billing?.paidAmount30d ?? "0", "EUR", localeTag)}
                </div>
              </div>
            </div>
          </div>

          <div className={`${tableWrapClassName} mt-2`}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.billing.table.time")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.billing.table.status")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.billing.table.amount")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.billing.table.provider")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.billing.table.paid_at")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {loadingLabel}
                    </td>
                  </tr>
                ) : (summary?.billing?.recentPayments || []).length ? (
                  (summary?.billing?.recentPayments || []).map(payment => (
                    <tr key={payment.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(payment.createdAt, localeTag)}</td>
                      <td className={tableCellClassName}>{payment.status}</td>
                      <td className={tableCellClassName}>{formatMoney(payment.amount, payment.currency || "EUR", localeTag)}</td>
                      <td className={tableCellClassName}>{payment.provider}</td>
                      <td className={tableCellClassName}>{payment.paidAt ? formatDate(payment.paidAt, localeTag) : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {tr("admin.analytics.billing.table.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{tr("admin.analytics.users.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.users.subtitle")}</div>
            </div>
            <div className={cellSubClassName}>
              {tr("admin.analytics.users.actions.selected_count", { count: selectedCount })}
            </div>
          </div>


          <div className="mt-2 grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-2">
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.users.summary.users")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingUsers ? loadingLabel : formatCount(usersAnalytics?.items?.length ?? 0, localeTag)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.users.summary.estimated_cost")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingUsers ? loadingLabel : formatMoney(usersAnalytics?.totals?.estimatedCostEur ?? 0, "EUR", localeTag)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>{tr("admin.analytics.users.summary.paid_amount")}</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingUsers ? loadingLabel : formatMoney(usersAnalytics?.totals?.paidAmountEur ?? 0, "EUR", localeTag)}
                </div>
              </div>
            </div>
          </div>

          <div className={`${toolbarSecondaryClassName} mt-2`}>
            <div className="grid gap-2 [grid-column:1/-1]">
              <label className={cellSubClassName} htmlFor="analytics-bulk-email-subject">
                {tr("admin.analytics.users.actions.email_subject")}
              </label>
              <input
                id="analytics-bulk-email-subject"
                className={inputClassName}
                value={bulkEmailSubject}
                onChange={event => {
                  setBulkEmailSubject(event.target.value);
                  clearUsersActionNotice();
                }}
                disabled={sendingUsersEmail || deletingUsers}
                placeholder={tr("admin.analytics.users.actions.email_subject_ph")}
                maxLength={180}
              />
            </div>

            <div className="grid gap-2 [grid-column:1/-1]">
              <label className={cellSubClassName} htmlFor="analytics-bulk-email-text">
                {tr("admin.analytics.users.actions.email_text")}
              </label>
              <textarea
                id="analytics-bulk-email-text"
                className={textAreaClassName}
                value={bulkEmailText}
                onChange={event => {
                  setBulkEmailText(event.target.value);
                  clearUsersActionNotice();
                }}
                disabled={sendingUsersEmail || deletingUsers}
                placeholder={tr("admin.analytics.users.actions.email_text_ph")}
                maxLength={8000}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 [grid-column:1/-1]">
              <div className={emailSendHintClassName}>
                {tr("admin.analytics.users.actions.email_target_hint", {
                  mode:
                    emailTarget === "all"
                      ? tr("admin.analytics.users.actions.email_all")
                      : tr("admin.analytics.users.actions.email_selected")
                })}
              </div>
              <Button
                variant="primary"
                className={actionButtonClassName}
                onClick={onSendBulkEmail}
                disabled={loadingUsers || sendingUsersEmail || deletingUsers}
              >
                {sendingUsersEmail ? tr("admin.analytics.users.actions.sending") : tr("admin.analytics.users.actions.send_email")}
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <div className={usersSelectBarClassName}>
              <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                <div className="grid gap-2">
                  <label className={cellSubClassName} htmlFor="analytics-bulk-email-target">
                    {tr("admin.analytics.users.actions.email_target")}
                  </label>
                  <select
                    id="analytics-bulk-email-target"
                    className={selectClassName}
                    value={emailTarget}
                    onChange={event => {
                      setEmailTarget(event.target.value === "all" ? "all" : "selected");
                      clearUsersActionNotice();
                    }}
                    disabled={sendingUsersEmail || deletingUsers}
                  >
                    <option value="selected">{tr("admin.analytics.users.actions.email_selected")}</option>
                    <option value="all">{tr("admin.analytics.users.actions.email_all")}</option>
                  </select>
                </div>
                <div className={usersSelectActionsClassName}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={actionButtonClassName}
                    onClick={toggleAllVisibleUsers}
                    disabled={loadingUsers || deletingUsers || sendingUsersEmail || !visibleUserIds.length}
                  >
                    {allVisibleSelected
                      ? tr("admin.analytics.users.actions.clear_visible")
                      : tr("admin.analytics.users.actions.select_visible")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className={actionButtonClassName}
                    onClick={onDeleteSelectedUsers}
                    disabled={loadingUsers || deletingUsers || sendingUsersEmail || !selectedCount}
                  >
                    {deletingUsers ? tr("admin.analytics.users.actions.deleting") : tr("admin.analytics.users.actions.delete_selected")}
                  </Button>
                </div>
              </div>
              <div className={usersSelectActionsClassName}>
                <span className={usersSelectCountClassName}>
                  {tr("admin.analytics.users.actions.selected_count", { count: selectedCount })}
                </span>
                <span className={usersSelectCountClassName}>
                  Nahtavates valitud: {selectedVisibleCount}
                </span>
              </div>
            </div>
          </div>

          {usersActionNotice ? (
            <div
              className={
                usersActionNotice.type === "success"
                  ? `${alertSuccessClassName} mt-2`
                  : usersActionNotice.type === "warn"
                    ? `${alertWarnClassName} mt-2`
                    : `${alertErrorClassName} mt-2`
              }
            >
              {usersActionNotice.message}
            </div>
          ) : null}

          <div className={`${tableWrapClassName} mt-2`}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>
                    <input
                      type="checkbox"
                      aria-label={tr("admin.analytics.users.actions.select_visible")}
                      checked={allVisibleSelected}
                      onChange={toggleAllVisibleUsers}
                      disabled={loadingUsers || !visibleUserIds.length}
                    />
                  </th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.user")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.role")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.subscription")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.usage_30d")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.cost_30d")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.users.table.limits")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={7}>
                      {loadingLabel}
                    </td>
                  </tr>
                ) : (usersAnalytics?.items || []).length ? (
                  (usersAnalytics?.items || []).map(row => (
                    <tr key={row.userId} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>
                        <input
                          type="checkbox"
                          aria-label={tr("admin.analytics.users.actions.select_user", { user: row.email || row.userId })}
                          checked={selectedUserIds.includes(row.userId)}
                          onChange={() => toggleUserSelection(row.userId)}
                        />
                      </td>
                      <td className={tableCellClassName}>
                        <div>{row.email || row.userId}</div>
                        <div className={cellSubClassName}>{row.userId}</div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{row.role}</div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.table.admin")}: {row.isAdmin ? tr("admin.common.yes") : tr("admin.common.no")}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{row?.subscription?.status || "-"}</div>
                        <div className={cellSubClassName}>
                          {row?.subscription?.isActive ? tr("admin.analytics.users.active") : tr("admin.analytics.users.inactive")}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.table.paid_30d")}: {formatMoney(row?.paidAmount30dEur ?? 0, "EUR", localeTag)}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.chat")}: {formatCount(row?.usage?.chatRequests ?? 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.rag")}: {formatCount(row?.usage?.ragSearches ?? 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.stt")}: {formatCount(row?.usage?.sttRequests ?? 0, localeTag)} /{" "}
                          {formatCount(row?.usage?.sttAudioMb ?? 0, localeTag)} MB
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.tts")}: {formatCount(row?.usage?.ttsRequests ?? 0, localeTag)} /{" "}
                          {formatCount(row?.usage?.ttsChars ?? 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.analyze")}: {formatCount(row?.usage?.analyses ?? 0, localeTag)}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{formatMoney(row?.costs?.totalEur ?? 0, "EUR", localeTag)}</div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.chat")}: {formatMoney(row?.costs?.chatEur ?? 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.rag")}: {formatMoney(row?.costs?.ragEur ?? 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.stt")}: {formatMoney(row?.costs?.sttEur ?? 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.usage.tts")}: {formatMoney(row?.costs?.ttsEur ?? 0, "EUR", localeTag)}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.limits.analyze_daily")}: {formatCount(row?.limits?.analyzeDaily ?? 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.limits.monthly_budget")}: {formatMoney(row?.budget?.monthlyEur ?? 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.limits.remaining_budget")}: {formatMoney(row?.budget?.remainingEur ?? 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {tr("admin.analytics.users.limits.utilization")}: {toNumber(row?.budget?.utilizationPct ?? 0).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={7}>
                      {tr("admin.analytics.users.table.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={`${cellSubClassName} mt-2`}>
            {tr("admin.analytics.users.note", {
              chat: toNumber(usersAnalytics?.costModel?.chatRequestEur ?? 0).toFixed(4),
              rag: toNumber(usersAnalytics?.costModel?.ragSearchEur ?? 0).toFixed(4),
              stt: toNumber(usersAnalytics?.costModel?.sttPerAudioMbEur ?? 0).toFixed(4),
              tts: toNumber(usersAnalytics?.costModel?.ttsPer1kCharsEur ?? 0).toFixed(4),
              budget: toNumber(usersAnalytics?.costModel?.monthlyBudgetEur ?? 0).toFixed(2)
            })}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{tr("admin.analytics.logs.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.logs.subtitle")}</div>
            </div>
          </div>
          <div className={`${toolbarPrimaryClassName} mt-2`}>
            <select
              className={selectClassName}
              value={eventFilter}
              onChange={event => {
                setEventFilter(event.target.value);
                clearLogsActionNotice();
              }}
            >
              <option value="all">{tr("admin.analytics.logs.filter.all_events")}</option>
              {EVENT_OPTIONS.map(event => (
                <option key={event.value} value={event.value}>
                  {eventLabels[event.value] || event.value}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={isCrisisFilter}
              onChange={event => {
                setIsCrisisFilter(event.target.value);
                clearLogsActionNotice();
              }}
            >
              <option value="all">{tr("admin.analytics.logs.filter.crisis_all")}</option>
              <option value="true">{tr("admin.analytics.logs.filter.crisis_yes")}</option>
              <option value="false">{tr("admin.analytics.logs.filter.crisis_no")}</option>
            </select>
            <Button
              size="sm"
              variant="danger"
              className={actionButtonClassName}
              onClick={() => onDeleteLogs("filtered")}
              disabled={loadingEvents || deletingLogs}
            >
              {deletingLogs
                ? tr("admin.analytics.logs.actions.deleting")
                : tr("admin.analytics.logs.actions.delete_filtered")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              className={actionButtonClassName}
              onClick={() => onDeleteLogs("all")}
              disabled={loadingEvents || deletingLogs}
            >
              {deletingLogs ? tr("admin.analytics.logs.actions.deleting") : tr("admin.analytics.logs.actions.delete_all")}
            </Button>
          </div>
          {logsActionNotice ? (
            <div className={logsActionNotice.type === "success" ? `${alertSuccessClassName} mt-2` : `${alertErrorClassName} mt-2`}>
              {logsActionNotice.message}
            </div>
          ) : null}

          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.logs.table.time")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.logs.table.event")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.logs.table.role")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.logs.table.crisis")}</th>
                  <th className={tableHeadCellClassName}>{tr("admin.analytics.logs.table.meta")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {loadingLabel}
                    </td>
                  </tr>
                ) : filteredEvents.length ? (
                  filteredEvents.map(row => (
                    <tr key={row.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(row.createdAt, localeTag)}</td>
                      <td className={tableCellClassName}>{eventLabels[row.event] || row.event}</td>
                      <td className={tableCellClassName}>{row.role || "-"}</td>
                      <td className={tableCellClassName}>{row?.data?.isCrisis ? tr("admin.common.yes") : tr("admin.common.no")}</td>
                      <td className={`${tableCellClassName} ${cellSubClassName}`}>{metaSummary(row.data)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {tr("admin.analytics.logs.table.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link prefetch={false} href="/#meist" className={backButtonClassName} aria-label={tr("admin.common.back")}>
          <BackIcon className="h-[4.8rem] w-[4.8rem]" />
        </Link>
      </div>
    </div>
  );
}
