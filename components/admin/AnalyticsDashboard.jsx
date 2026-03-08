"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import BackButton from "@/components/ui/BackButton";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { localizePath } from "@/lib/localizePath";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";

const pageClassName = "flex flex-col gap-3 text-[color:var(--admin-text)] [--rag-text:var(--admin-text)]";
const pageHeaderClassName = "grid gap-2";
const pageHeaderMainClassName =
  "relative flex min-h-[5rem] items-start justify-center px-[clamp(4.8rem,9vw,6.1rem)] pt-[0.1rem] text-center max-[768px]:min-h-0 max-[768px]:px-0 max-[768px]:pt-0";
const pageHeaderTitleWrapClassName = "grid justify-items-center gap-1";
const pageTitleClassName = `${glassPageTitleClassName} !mt-0 !mb-0 !px-0 !text-center !whitespace-normal !text-[clamp(1.72rem,2.9vw,2.35rem)] !tracking-[0.03em] max-[768px]:!text-[clamp(1.92rem,8vw,2.6rem)] max-[768px]:!leading-[1.06] max-[768px]:!mt-0 max-[768px]:!mb-0`;
const pageHeaderToolbarClassName = "flex justify-end max-[768px]:justify-center";
const cardClassName =
  "relative overflow-hidden rounded-[1rem] border border-[color:var(--glass-border-color,var(--admin-border))] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_78%,var(--glass-surface-bg)_22%),color-mix(in_srgb,var(--admin-surface-2)_84%,transparent))] p-[clamp(0.72rem,1.9vw,0.95rem)] shadow-[var(--glass-shell-shadow,var(--admin-shadow-soft))] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_12%_-4%,rgba(255,255,255,0.11),transparent_44%)] before:opacity-65";
const cardBodyClassName = "relative z-[1] grid gap-2";
const kpiGridClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-2";
const sectionHeadClassName = "flex flex-wrap items-start justify-between gap-2";
const sectionSubClassName = "text-[0.95rem] text-[color:var(--admin-muted)] max-w-[64ch]";
const kpiValueClassName = "text-[1.6rem] font-[700] text-[color:var(--admin-text)]";
const kpiMetaClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
const barClassName = "flex h-2 overflow-hidden rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)]";
const tableWrapClassName = "overflow-x-auto rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]";
const tableClassName = "w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName =
  "border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-1.5 text-left text-[0.82rem] uppercase tracking-[0.02em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-2 py-1.5 text-left text-[0.9rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const toolbarPrimaryClassName =
  "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-2 shadow-[var(--admin-shadow-soft)]";
const usersSelectBarClassName =
  "grid gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-2";
const usersSelectActionsClassName = "flex flex-wrap items-center gap-2";
const usersSelectCountClassName =
  "inline-flex items-center rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] px-2.5 py-1 text-[0.82rem] text-[color:var(--admin-muted)]";
const emailSendBarClassName =
  "grid gap-2 rounded-[14px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-2)_90%,transparent),color-mix(in_srgb,var(--admin-surface-3)_92%,transparent))] p-2";
const emailSendHeadClassName = "flex flex-wrap items-center justify-between gap-2";
const emailSendHintClassName = "text-[0.86rem] text-[color:var(--admin-muted)]";
const selectClassName =
  "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const inputClassName =
  "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.6rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const textAreaClassName =
  "w-full min-h-[120px] rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.7rem] text-[0.95rem] leading-[1.45] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const alertErrorClassName =
  "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertInfoClassName =
  "rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color-mix(in_srgb,var(--admin-accent-cool)_15%,var(--admin-surface-2)_85%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertWarnClassName =
  "rounded-[12px] border border-[color:var(--admin-warning,#f59e0b)] bg-[color-mix(in_srgb,var(--admin-warning,#f59e0b)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertCriticalClassName =
  "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertSuccessClassName =
  "rounded-[12px] border border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
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
const refreshButtonClassName =
  "!justify-self-start !self-start !w-auto !min-h-[2.34rem] !rounded-[0.86rem] !px-[1.05rem] !py-[0.42rem] !text-[0.96rem] !leading-[1.12] !font-semibold !tracking-[0.01em]";
const actionButtonClassName =
  "!justify-self-start !self-start !w-auto !min-h-[2.18rem] !rounded-[0.86rem] !px-[0.98rem] !py-[0.38rem] !text-[0.92rem] !leading-[1.1] !font-semibold !tracking-[0.01em]";
const resetActionGridClassName = "mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3";
const resetActionButtonClassName =
  `${actionButtonClassName} !w-full !justify-start !min-h-[2.38rem] !px-[1.1rem] !py-[0.56rem] !text-[0.97rem] !leading-[1.15]`;
const backButtonClassName =
  "absolute left-0 top-[-0.15rem] z-[2] !h-[4.85rem] !w-[4.85rem] min-[769px]:!h-[5.3rem] min-[769px]:!w-[5.3rem] [&>svg]:!h-[4.35rem] [&>svg]:!w-[4.35rem] min-[769px]:[&>svg]:!h-[4.75rem] min-[769px]:[&>svg]:!w-[4.75rem] max-[768px]:top-0 max-[768px]:left-[0.04rem]";
const metricListClassName = "grid gap-1.5";
const metricRowClassName = "flex items-start justify-between gap-3 text-[0.9rem]";

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

function toLocaleTag(locale) {
  const normalized = String(locale || "en").toLowerCase();
  if (normalized.startsWith("et")) return "et-EE";
  if (normalized.startsWith("ru")) return "ru-RU";
  return "en-US";
}

function toNumber(value) {
  const n = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, toNumber(value)));
}

function formatCount(value, localeTag) {
  try {
    return new Intl.NumberFormat(localeTag).format(toNumber(value));
  } catch {
    return String(toNumber(value));
  }
}

function formatPercent(value, localeTag, digits = 0) {
  try {
    return new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(toNumber(value));
  } catch {
    return String(toNumber(value));
  }
}

function formatMoney(amount, currency = "EUR", localeTag = "en-US") {
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency
    }).format(toNumber(amount));
  } catch {
    return `${toNumber(amount).toFixed(2)} ${currency}`;
  }
}

function formatDate(value, localeTag = "en-US") {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(localeTag, {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function joinCounts(map = {}, labels = {}, localeTag = "en-US", order = []) {
  const source = map && typeof map === "object" ? map : {};
  const keys = order.length ? order : Object.keys(source);
  const parts = [];
  for (const key of keys) {
    if (source[key] == null) continue;
    parts.push(`${labels[key] || key}: ${formatCount(source[key], localeTag)}`);
  }
  return parts.join(" | ");
}

function progressToneClassName(value) {
  const pct = clampPercent(value);
  if (pct >= 90) {
    return "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--admin-danger)_88%,white_12%),color-mix(in_srgb,var(--admin-danger)_66%,transparent))]";
  }
  if (pct >= 75) {
    return "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--admin-warning,#f59e0b)_90%,white_10%),color-mix(in_srgb,var(--admin-warning,#f59e0b)_65%,transparent))]";
  }
  return "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--admin-success)_88%,white_12%),color-mix(in_srgb,var(--admin-success)_64%,transparent))]";
}

function SectionAlert({ tone = "info", message }) {
  if (!message) return null;
  const className =
    tone === "success"
      ? alertSuccessClassName
      : tone === "warn"
        ? alertWarnClassName
        : tone === "critical"
          ? alertCriticalClassName
          : tone === "error"
            ? alertErrorClassName
            : alertInfoClassName;
  return <div className={className}>{message}</div>;
}

function KpiCard({ title, value, meta, children }) {
  return (
    <div className={cardClassName}>
      <div className={`${cardBodyClassName} min-h-[96px]`}>
        <CardTitle>{title}</CardTitle>
        {value != null ? <div className={kpiValueClassName}>{value}</div> : null}
        {meta ? <div className={kpiMetaClassName}>{meta}</div> : null}
        {children}
      </div>
    </div>
  );
}

function MetricListCard({ title, items }) {
  return (
    <div className={cardClassName}>
      <div className={cardBodyClassName}>
        <CardTitle>{title}</CardTitle>
        <div className={metricListClassName}>
          {items.map(item => (
            <div key={item.label} className={metricRowClassName}>
              <span className={cellSubClassName}>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageBar({ value }) {
  return (
    <div className={barClassName}>
      <span className={progressToneClassName(value)} style={{ width: `${clampPercent(value)}%` }} />
    </div>
  );
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const localeTag = useMemo(() => toLocaleTag(locale), [locale]);

  const eventLabels = useMemo(() => {
    const out = {};
    for (const entry of EVENT_OPTIONS) {
      out[entry.value] = t(entry.labelKey, entry.value);
    }
    return out;
  }, [t]);

  const statusLabels = useMemo(
    () => ({
      PENDING: t(STATUS_LABEL_KEYS.PENDING, "Pending"),
      PROCESSING: t(STATUS_LABEL_KEYS.PROCESSING, "Processing"),
      COMPLETED: t(STATUS_LABEL_KEYS.COMPLETED, "Completed"),
      FAILED: t(STATUS_LABEL_KEYS.FAILED, "Failed")
    }),
    [t]
  );

  const audienceLabels = useMemo(
    () => ({
      SOCIAL_WORKER: t(AUDIENCE_LABEL_KEYS.SOCIAL_WORKER, "Social worker"),
      CLIENT: t(AUDIENCE_LABEL_KEYS.CLIENT, "Client"),
      BOTH: t(AUDIENCE_LABEL_KEYS.BOTH, "Both")
    }),
    [t]
  );

  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [isCrisisFilter, setIsCrisisFilter] = useState("all");
  const [usersQueryDraft, setUsersQueryDraft] = useState("");
  const [usersQuery, setUsersQuery] = useState("");
  const [pageError, setPageError] = useState("");
  const [usersNotice, setUsersNotice] = useState(null);
  const [logsNotice, setLogsNotice] = useState(null);
  const [resetNotice, setResetNotice] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [deletingUsers, setDeletingUsers] = useState(false);
  const [deletingLogs, setDeletingLogs] = useState(false);
  const [runningResetAction, setRunningResetAction] = useState("");
  const [sendingUsersEmail, setSendingUsersEmail] = useState(false);
  const [emailTarget, setEmailTarget] = useState("selected");
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailText, setBulkEmailText] = useState("");

  const requestJson = useCallback(
    async (url, options = {}, fallbackKey) => {
      const headers = {
        ...(options.headers || {})
      };
      if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(url, {
        cache: "no-store",
        ...options,
        headers
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok === false) {
        throw new Error(
          resolveApiMessage({
            payload,
            t,
            fallbackKey,
            fallbackText: t(fallbackKey, "Request failed")
          })
        );
      }
      return payload || {};
    },
    [t]
  );

  const getRoleLabel = useCallback(
    (role, isAdmin) => {
      if (isAdmin || String(role || "").toUpperCase() === "ADMIN") {
        return t("profile.role_short.admin", "Admin");
      }
      if (String(role || "").toUpperCase() === "SOCIAL_WORKER") {
        return t("profile.role_short.worker", "Worker");
      }
      if (String(role || "").toUpperCase() === "CLIENT") {
        return t("profile.role_short.client", "Client");
      }
      return role || "-";
    },
    [t]
  );

  const summarizeEventMeta = useCallback(
    data => {
      const meta = data && typeof data === "object" ? data : {};
      const parts = [];
      if (typeof meta.ragMatchCount === "number") {
        parts.push(`${t("admin.analytics.meta.hits", "hits")}: ${formatCount(meta.ragMatchCount, localeTag)}`);
      }
      if (typeof meta.groupCount === "number") {
        parts.push(`${t("admin.analytics.meta.groups", "groups")}: ${formatCount(meta.groupCount, localeTag)}`);
      }
      if (typeof meta.chosenGroupCount === "number") {
        parts.push(`${t("admin.analytics.meta.chosen", "chosen")}: ${formatCount(meta.chosenGroupCount, localeTag)}`);
      }
      if (typeof meta.grounding === "string" && meta.grounding) {
        parts.push(`${t("admin.analytics.meta.grounding", "grounding")}: ${meta.grounding}`);
      }
      if (typeof meta.isCrisis === "boolean") {
        parts.push(
          `${t("admin.analytics.meta.crisis", "crisis")}: ${meta.isCrisis ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}`
        );
      }
      if (typeof meta.hasHistory === "boolean") {
        parts.push(
          `${t("admin.analytics.meta.history", "history")}: ${meta.hasHistory ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}`
        );
      }
      if (typeof meta.paymentState === "string" && meta.paymentState) {
        parts.push(`${t("admin.analytics.meta.payment_state", "payment state")}: ${meta.paymentState}`);
      }
      if (typeof meta.resultStatus === "string" && meta.resultStatus) {
        parts.push(`${t("admin.analytics.meta.result_status", "result status")}: ${meta.resultStatus}`);
      }
      if (typeof meta.subscriptionAction === "string" && meta.subscriptionAction) {
        parts.push(`${t("admin.analytics.meta.subscription_action", "subscription action")}: ${meta.subscriptionAction}`);
      }
      if (typeof meta.code === "string" && meta.code) {
        parts.push(`${t("admin.analytics.meta.alert_code", "alert code")}: ${meta.code}`);
      }
      if (typeof meta.fileSizeBytes === "number") {
        parts.push(`audio: ${formatCount(meta.fileSizeBytes, localeTag)} B`);
      }
      if (typeof meta.textLength === "number") {
        parts.push(`chars: ${formatCount(meta.textLength, localeTag)}`);
      }
      if (parts.length) return parts.join(" | ");
      const fallback = JSON.stringify(meta);
      return fallback && fallback !== "{}" ? fallback.slice(0, 160) : "-";
    },
    [localeTag, t]
  );

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await requestJson(
        `/api/admin/analytics/summary?locale=${encodeURIComponent(locale || "en")}`,
        undefined,
        "admin.analytics.errors.summary_fetch_failed"
      );
      setSummary(data);
      setPageError("");
    } catch (error) {
      setPageError(error?.message || t("admin.analytics.errors.summary_fetch_failed", "Summary fetch failed."));
    } finally {
      setLoadingSummary(false);
    }
  }, [locale, requestJson, t]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      params.set("locale", locale || "en");
      if (eventFilter !== "all") params.set("event", eventFilter);
      if (isCrisisFilter === "true" || isCrisisFilter === "false") params.set("isCrisis", isCrisisFilter);
      const data = await requestJson(
        `/api/admin/analytics/events?${params.toString()}`,
        undefined,
        "admin.analytics.errors.events_fetch_failed"
      );
      setEvents(Array.isArray(data.items) ? data.items : []);
      setPageError("");
    } catch (error) {
      setPageError(error?.message || t("admin.analytics.errors.events_fetch_failed", "Events fetch failed."));
    } finally {
      setLoadingEvents(false);
    }
  }, [eventFilter, isCrisisFilter, locale, requestJson, t]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      params.set("days", "30");
      params.set("locale", locale || "en");
      if (usersQuery) params.set("q", usersQuery);
      const data = await requestJson(
        `/api/admin/analytics/users?${params.toString()}`,
        undefined,
        "admin.analytics.errors.users_fetch_failed"
      );
      setUsersAnalytics(data);
      setPageError("");
    } catch (error) {
      setPageError(error?.message || t("admin.analytics.errors.users_fetch_failed", "Users analytics fetch failed."));
    } finally {
      setLoadingUsers(false);
    }
  }, [locale, requestJson, t, usersQuery]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadSummary(), loadEvents(), loadUsers()]);
    setRefreshing(false);
  }, [loadEvents, loadSummary, loadUsers]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const visibleUserRows = useMemo(() => usersAnalytics?.items || [], [usersAnalytics]);
  const visibleUserIds = useMemo(() => visibleUserRows.map(row => row.userId), [visibleUserRows]);
  const visibleUserIdSet = useMemo(() => new Set(visibleUserIds), [visibleUserIds]);
  const selectedVisibleCount = useMemo(
    () => selectedUserIds.filter(id => visibleUserIdSet.has(id)).length,
    [selectedUserIds, visibleUserIdSet]
  );
  const allVisibleSelected = visibleUserIds.length > 0 && selectedVisibleCount === visibleUserIds.length;
  const canDeleteFilteredLogs = eventFilter !== "all" || isCrisisFilter !== "all";

  useEffect(() => {
    setSelectedUserIds(prev => prev.filter(id => visibleUserIdSet.has(id)));
  }, [visibleUserIdSet]);

  const groundingSummary = useMemo(() => {
    const dist = summary?.averages?.groundingDistribution;
    if (!dist) return null;
    const total = toNumber(dist.weak) + toNumber(dist.ok) + toNumber(dist.strong);
    if (!total) return null;
    return {
      weak: Math.round((100 * toNumber(dist.weak)) / total),
      ok: Math.round((100 * toNumber(dist.ok)) / total),
      strong: Math.round((100 * toNumber(dist.strong)) / total)
    };
  }, [summary]);

  const requestSplit = useMemo(() => {
    const total = toNumber(summary?.totalRequests);
    if (!total) return null;
    return {
      rag: Math.round((100 * toNumber(summary?.ragSearchCount)) / total),
      noContext: Math.round((100 * toNumber(summary?.noContextCount)) / total),
      stt: Math.round((100 * toNumber(summary?.chat?.sttRequests30d)) / total),
      tts: Math.round((100 * toNumber(summary?.chat?.ttsRequests30d)) / total)
    };
  }, [summary]);

  const helpStatusSummary = useMemo(
    () => joinCounts(summary?.help?.matchesByStatus30d, {}, localeTag),
    [localeTag, summary]
  );

  const documentActions = summary?.documents?.actions30d || {};
  const downloadCount = toNumber(documentActions.DOWNLOAD);
  const artifactDownloadCount = toNumber(documentActions.ARTIFACT_DOWNLOAD);
  const paymentPipeline = summary?.billing?.paymentPipeline30d || {};
  const paymentAlerts = Array.isArray(summary?.billing?.paymentAlerts30d) ? summary.billing.paymentAlerts30d : [];

  const platformCards = useMemo(
    () => [
      {
        title: t("admin.analytics.platform.chat.title", "Chat and voice"),
        items: [
          {
            label: t("admin.analytics.platform.chat.conversations_total", "Conversations total"),
            value: formatCount(summary?.chat?.conversationsTotal || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.chat.active_conversations_30d", "Active conversations (30d)"),
            value: formatCount(summary?.chat?.activeConversations30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.chat.ai_errors_30d", "AI errors (30d)"),
            value: formatCount(
              toNumber(summary?.chat?.ragErrors30d) + toNumber(summary?.chat?.openAiErrors30d),
              localeTag
            )
          }
        ]
      },
      {
        title: t("admin.analytics.platform.help.title", "Help flow"),
        items: [
          {
            label: t("admin.analytics.platform.help.open_requests", "Open requests"),
            value: formatCount(summary?.help?.openRequests || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.help.open_offers", "Open offers"),
            value: formatCount(summary?.help?.openOffers || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.help.matches_30d", "Matches (30d)"),
            value: formatCount(summary?.help?.matches30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.help.match_statuses_30d", "Match statuses (30d)"),
            value: helpStatusSummary || "-"
          }
        ]
      },
      {
        title: t("admin.analytics.platform.collaboration.title", "Rooms and invites"),
        items: [
          {
            label: t("admin.analytics.platform.collaboration.rooms_total", "Rooms total"),
            value: formatCount(summary?.collaboration?.roomsTotal || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.collaboration.active_rooms_30d", "Active rooms (30d)"),
            value: formatCount(summary?.collaboration?.activeRooms30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.collaboration.room_messages_30d", "Room messages (30d)"),
            value: formatCount(summary?.collaboration?.roomMessages30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.collaboration.pending_invites", "Pending invites"),
            value: formatCount(summary?.collaboration?.pendingInvites || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.collaboration.sponsored_invites_30d", "Sponsored invites (30d)"),
            value: formatCount(summary?.collaboration?.sponsoredInvites30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.collaboration.active_sponsored_members", "Active sponsored members"),
            value: formatCount(summary?.collaboration?.activeSponsoredMembers || 0, localeTag)
          }
        ]
      },
      {
        title: t("admin.analytics.platform.documents.title", "Documents and agent"),
        items: [
          {
            label: t("admin.analytics.platform.documents.total", "Documents total"),
            value: formatCount(summary?.documents?.total || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.uploaded_30d", "Uploaded (30d)"),
            value: formatCount(summary?.documents?.uploaded30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.draft_artifacts", "Draft artifacts"),
            value: formatCount(summary?.documents?.draftArtifacts || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.final_artifacts", "Final artifacts"),
            value: formatCount(summary?.documents?.finalArtifacts || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.created_30d", "Created (30d)"),
            value: formatCount(summary?.documents?.created30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.approved_30d", "Approved (30d)"),
            value: formatCount(summary?.documents?.approved30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.downloads_30d", "Document downloads (30d)"),
            value: formatCount(downloadCount, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.artifact_downloads_30d", "Artifact downloads (30d)"),
            value: formatCount(artifactDownloadCount, localeTag)
          }
        ]
      }
    ],
    [artifactDownloadCount, downloadCount, helpStatusSummary, localeTag, summary, t]
  );

  const toggleUserSelection = useCallback(userId => {
    setSelectedUserIds(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  }, []);

  const toggleAllVisibleUsers = useCallback(() => {
    setSelectedUserIds(prev => {
      if (allVisibleSelected) return prev.filter(id => !visibleUserIdSet.has(id));
      const merged = new Set(prev);
      for (const id of visibleUserIds) merged.add(id);
      return Array.from(merged);
    });
  }, [allVisibleSelected, visibleUserIdSet, visibleUserIds]);

  const handleUsersSearch = useCallback(
    event => {
      event.preventDefault();
      setUsersQuery(usersQueryDraft.trim());
    },
    [usersQueryDraft]
  );

  const handleUsersSearchClear = useCallback(() => {
    setUsersQueryDraft("");
    setUsersQuery("");
  }, []);

  const handleDeleteSelectedUsers = useCallback(async () => {
    if (!selectedUserIds.length || deletingUsers) return;
    const confirmed = window.confirm(
      t("admin.analytics.users.actions.delete_confirm", { count: selectedUserIds.length }, "Delete selected users?")
    );
    if (!confirmed) return;

    setDeletingUsers(true);
    setUsersNotice(null);
    try {
      const data = await requestJson(
        "/api/admin/analytics/users",
        {
          method: "DELETE",
          body: JSON.stringify({
            locale,
            userIds: selectedUserIds
          })
        },
        "admin.analytics.errors.users_delete_failed"
      );

      const blockedAdmins = Array.isArray(data?.blocked?.admins) ? data.blocked.admins.length : 0;
      const blockedSelf = data?.blocked?.self ? 1 : 0;
      const deletedIds = Array.isArray(data?.deletedIds) ? data.deletedIds : [];
      setSelectedUserIds(prev => prev.filter(id => !deletedIds.includes(id)));
      setUsersNotice({
        tone: "success",
        message: t(
          "admin.analytics.users.actions.delete_done",
          {
            deleted: toNumber(data?.deletedCount || 0),
            blocked: blockedAdmins + blockedSelf
          },
          "Users deleted."
        )
      });
      await Promise.all([loadSummary(), loadUsers()]);
    } catch (error) {
      setUsersNotice({
        tone: "error",
        message: error?.message || t("admin.analytics.errors.users_delete_failed", "Failed to delete selected users.")
      });
    } finally {
      setDeletingUsers(false);
    }
  }, [deletingUsers, loadSummary, loadUsers, locale, requestJson, selectedUserIds, t]);

  const handleSendBulkEmail = useCallback(async () => {
    if (sendingUsersEmail) return;
    const subject = bulkEmailSubject.trim();
    const text = bulkEmailText.trim();
    if (!subject || !text) {
      setUsersNotice({
        tone: "error",
        message: t("admin.analytics.errors.users_email_invalid_payload", "Email subject and message are required.")
      });
      return;
    }
    if (emailTarget === "selected" && !selectedUserIds.length) {
      setUsersNotice({
        tone: "warn",
        message: t("admin.analytics.users.actions.select_users_first", "Select users first.")
      });
      return;
    }

    setSendingUsersEmail(true);
    setUsersNotice(null);
    try {
      const data = await requestJson(
        "/api/admin/analytics/users",
        {
          method: "POST",
          body: JSON.stringify({
            locale,
            target: emailTarget,
            userIds: emailTarget === "selected" ? selectedUserIds : [],
            subject,
            text
          })
        },
        "admin.analytics.errors.users_email_send_failed"
      );

      setUsersNotice({
        tone: toNumber(data?.failedCount) > 0 ? "warn" : "success",
        message: t(
          "admin.analytics.users.actions.email_done",
          {
            sent: toNumber(data?.sentCount || 0),
            failed: toNumber(data?.failedCount || 0)
          },
          "Bulk email finished."
        )
      });
      if (!toNumber(data?.failedCount || 0)) {
        setBulkEmailSubject("");
        setBulkEmailText("");
      }
    } catch (error) {
      setUsersNotice({
        tone: "error",
        message: error?.message || t("admin.analytics.errors.users_email_send_failed", "Failed to send bulk email.")
      });
    } finally {
      setSendingUsersEmail(false);
    }
  }, [bulkEmailSubject, bulkEmailText, emailTarget, locale, requestJson, selectedUserIds, sendingUsersEmail, t]);

  const handleDeleteLogs = useCallback(
    async deleteAll => {
      if (deletingLogs) return;
      const confirmed = window.confirm(
        deleteAll
          ? t("admin.analytics.logs.actions.delete_all_confirm", "Delete all logs?")
          : t("admin.analytics.logs.actions.delete_filtered_confirm", "Delete filtered logs?")
      );
      if (!confirmed) return;

      setDeletingLogs(true);
      setLogsNotice(null);
      try {
        const data = await requestJson(
          "/api/admin/analytics/events",
          {
            method: "DELETE",
            body: JSON.stringify({
              locale,
              all: deleteAll,
              event: deleteAll || eventFilter === "all" ? "" : eventFilter,
              isCrisis: deleteAll ? "all" : isCrisisFilter
            })
          },
          "admin.analytics.errors.logs_delete_failed"
        );
        setLogsNotice({
          tone: "success",
          message: t(
            "admin.analytics.logs.actions.delete_done",
            { count: toNumber(data?.deletedCount || 0) },
            "Logs deleted."
          )
        });
        await refreshAll();
      } catch (error) {
        setLogsNotice({
          tone: "error",
          message: error?.message || t("admin.analytics.errors.logs_delete_failed", "Failed to delete logs.")
        });
      } finally {
        setDeletingLogs(false);
      }
    },
    [deletingLogs, eventFilter, isCrisisFilter, locale, refreshAll, requestJson, t]
  );

  const handleRunReset = useCallback(
    async action => {
      if (!action || runningResetAction) return;
      const actionLabel = t(`admin.analytics.reset.actions.${action}`, action);
      const firstConfirm = window.confirm(
        t("admin.analytics.reset.confirm", { action: actionLabel }, "Run reset action?")
      );
      if (!firstConfirm) return;

      setRunningResetAction(action);
      setResetNotice(null);
      try {
        const dryRun = await requestJson(
          "/api/admin/analytics/reset",
          {
            method: "POST",
            body: JSON.stringify({
              locale,
              action,
              dryRun: true
            })
          },
          "admin.analytics.errors.reset_failed"
        );

        const secondConfirm = window.confirm(
          t(
            "admin.analytics.reset.confirm_with_count",
            {
              action: actionLabel,
              count: toNumber(dryRun?.total || 0)
            },
            "Confirm reset action?"
          )
        );
        if (!secondConfirm) {
          setResetNotice({
            tone: "warn",
            message: t("admin.analytics.reset.cancelled", "Reset cancelled.")
          });
          return;
        }

        const result = await requestJson(
          "/api/admin/analytics/reset",
          {
            method: "POST",
            body: JSON.stringify({
              locale,
              action,
              dryRun: false
            })
          },
          "admin.analytics.errors.reset_failed"
        );

        setResetNotice({
          tone: "success",
          message: t(
            "admin.analytics.reset.done",
            {
              action: actionLabel,
              count: toNumber(result?.total || 0)
            },
            "Reset completed."
          )
        });
        await refreshAll();
      } catch (error) {
        setResetNotice({
          tone: "error",
          message: error?.message || t("admin.analytics.errors.reset_failed", "Failed to run reset action.")
        });
      } finally {
        setRunningResetAction("");
      }
    },
    [locale, refreshAll, requestJson, runningResetAction, t]
  );

  return (
    <div className={pageClassName}>
      <div className={pageHeaderClassName}>
        <div className={pageHeaderMainClassName}>
          <BackButton
            onClick={() => router.push(localizePath("/#meist", locale))}
            ariaLabel={t("admin.common.back", "Back")}
            className={backButtonClassName}
          />
          <div className={pageHeaderTitleWrapClassName}>
            <h1 className={pageTitleClassName}>{t("admin.analytics.title", "Analytics")}</h1>
            <div className={sectionSubClassName}>
              {t(
                "admin.analytics.platform.subtitle",
                "Overview of chat, help, collaboration, documents, payments and platform limits."
              )}
            </div>
          </div>
        </div>
        <div className={pageHeaderToolbarClassName}>
          <Button
            variant="primary"
            className={refreshButtonClassName}
            style={refreshButtonStyle}
            onClick={refreshAll}
            disabled={refreshing || loadingSummary || loadingEvents || loadingUsers}
          >
            {refreshing ? t("admin.common.loading_data", "Loading...") : t("admin.common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <SectionAlert tone="error" message={pageError} />

      <div className={kpiGridClassName}>
        <KpiCard
          title={t("admin.analytics.kpis.requests_30d.title", "Requests (30d)")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.totalRequests || 0, localeTag)}
          meta={t("admin.analytics.kpis.requests_30d.meta", "Total chat requests")}
        />
        <KpiCard
          title={t("admin.analytics.kpis.rag_searches.title", "RAG searches")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.ragSearchCount || 0, localeTag)}
          meta={
            requestSplit
              ? t("admin.analytics.kpis.share", { percent: requestSplit.rag }, "Share {percent}%")
              : t("admin.analytics.kpis.share_missing", "Share unavailable")
          }
        />
        <KpiCard
          title={t("admin.analytics.kpis.no_context.title", "No context")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.noContextCount || 0, localeTag)}
          meta={
            requestSplit
              ? t("admin.analytics.kpis.share", { percent: requestSplit.noContext }, "Share {percent}%")
              : t("admin.analytics.kpis.share_missing", "Share unavailable")
          }
        />
        <KpiCard
          title={t("admin.analytics.kpis.crisis.title", "Crisis")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.totalCrisis || 0, localeTag)}
          meta={t("admin.analytics.kpis.crisis.meta", "Detected crisis risk")}
        />
        <KpiCard
          title={t("admin.analytics.kpis.stt_requests.title", "STT requests")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.chat?.sttRequests30d || 0, localeTag)}
          meta={
            requestSplit
              ? t("admin.analytics.kpis.stt_requests.meta", { percent: requestSplit.stt }, "Voice input share {percent}%")
              : t("admin.analytics.kpis.share_missing", "Share unavailable")
          }
        />
        <KpiCard
          title={t("admin.analytics.kpis.tts_requests.title", "TTS requests")}
          value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.chat?.ttsRequests30d || 0, localeTag)}
          meta={
            requestSplit
              ? t("admin.analytics.kpis.tts_requests.meta", { percent: requestSplit.tts }, "Voice output share {percent}%")
              : t("admin.analytics.kpis.share_missing", "Share unavailable")
          }
        />
      </div>
      <div className={kpiGridClassName}>
        <KpiCard
          title={t("admin.analytics.kpis.rag_averages.title", "Averages (RAG)")}
          meta={
            loadingSummary
              ? t("admin.common.loading", "Loading...")
              : t(
                  "admin.analytics.kpis.rag_averages.meta",
                  {
                    hits: formatPercent(summary?.averages?.avgRagMatchCount || 0, localeTag, 1),
                    groups: formatPercent(summary?.averages?.avgGroupCount || 0, localeTag, 1),
                    chosen: formatPercent(summary?.averages?.avgChosenGroupCount || 0, localeTag, 1)
                  },
                  "Hits {hits}, groups {groups}, chosen {chosen}"
                )
          }
        />
        <KpiCard title={t("admin.analytics.kpis.grounding.title", "Grounding")}>
          {groundingSummary ? (
            <>
              <UsageBar value={100} />
              <div className={kpiMetaClassName}>
                {t(
                  "admin.analytics.kpis.grounding.meta",
                  {
                    strong: groundingSummary.strong,
                    ok: groundingSummary.ok,
                    weak: groundingSummary.weak
                  },
                  "Strong {strong}% | OK {ok}% | Weak {weak}%"
                )}
              </div>
            </>
          ) : (
            <div className={kpiMetaClassName}>{loadingSummary ? t("admin.common.loading", "Loading...") : "-"}</div>
          )}
        </KpiCard>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.platform.title", "Platform overview")}</CardTitle>
              <div className={sectionSubClassName}>
                {t(
                  "admin.analytics.platform.subtitle",
                  "View chat, help, collaboration and document workflows alongside the existing RAG and billing analytics."
                )}
              </div>
            </div>
          </div>
          <div className={kpiGridClassName}>
            {platformCards.map(card => (
              <MetricListCard key={card.title} title={card.title} items={card.items} />
            ))}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.rag_docs.title", "RAG documents")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.rag_docs.subtitle", "Overview of indexing and recent additions.")}
              </div>
            </div>
          </div>
          <div className={kpiGridClassName}>
            <KpiCard
              title={t("admin.analytics.rag_docs.total", "Total")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.ragDocs?.total || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.rag_docs.failed", "Failed")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.ragDocs?.failed || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.rag_docs.error_30d", "With errors (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.ragDocs?.error30d || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.rag_docs.statuses", "Statuses")}
              meta={
                loadingSummary
                  ? t("admin.common.loading", "Loading...")
                  : joinCounts(summary?.ragDocs?.byStatus, statusLabels, localeTag, [
                      "PENDING",
                      "PROCESSING",
                      "COMPLETED",
                      "FAILED"
                    ]) || "-"
              }
            />
            <KpiCard
              title={t("admin.analytics.rag_docs.audience", "Audience")}
              meta={
                loadingSummary
                  ? t("admin.common.loading", "Loading...")
                  : joinCounts(summary?.ragDocs?.byAudience, audienceLabels, localeTag, [
                      "CLIENT",
                      "SOCIAL_WORKER",
                      "BOTH"
                    ]) || "-"
              }
            />
            <KpiCard
              title={t("admin.analytics.rag_docs.type", "Type")}
              meta={
                loadingSummary
                  ? t("admin.common.loading", "Loading...")
                  : joinCounts(summary?.ragDocs?.byType, {}, localeTag, ["FILE", "URL"]) || "-"
              }
            />
          </div>
          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.time", "Time")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.title", "Title")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.status", "Status")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.type", "Type")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.audience", "Audience")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.table.source", "Source")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      {t("admin.common.loading_data", "Loading...")}
                    </td>
                  </tr>
                ) : (summary?.ragDocs?.recent || []).length ? (
                  summary.ragDocs.recent.map(doc => (
                    <tr key={doc.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(doc.insertedAt || doc.createdAt, localeTag)}</td>
                      <td className={tableCellClassName}>{doc.title || t("admin.analytics.table.untitled", "(untitled)")}</td>
                      <td className={tableCellClassName}>{statusLabels[doc.status] || doc.status || "-"}</td>
                      <td className={tableCellClassName}>{doc.type || "-"}</td>
                      <td className={tableCellClassName}>{audienceLabels[doc.audience] || doc.audience || "-"}</td>
                      <td className={`${tableCellClassName} ${cellSubClassName}`}>
                        {(doc.sourceUrl || doc.fileName || "-").toString().slice(0, 90)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      {t("admin.analytics.table.empty", "No records found.")}
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
              <CardTitle>{t("admin.analytics.billing.title", "Subscriptions and payments")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.billing.subtitle", "Payment flows and subscription activity over the last 30 days.")}
              </div>
            </div>
          </div>

          {loadingSummary ? (
            <SectionAlert tone="info" message={t("admin.common.loading_data", "Loading...")} />
          ) : paymentAlerts.length ? (
            <div className="grid gap-2">
              {paymentAlerts.map((alert, index) => (
                <SectionAlert
                  key={`${alert.code || "alert"}-${index}`}
                  tone={alert.severity || "info"}
                  message={`${t(`admin.analytics.billing.alerts.severity.${alert.severity || "info"}`, "Info")}: ${t(
                    `admin.analytics.billing.alerts.items.${alert.code || "unknown"}`,
                    {
                      value: formatPercent(alert.value || 0, localeTag),
                      threshold: formatPercent(alert.threshold || 0, localeTag)
                    },
                    "Billing alert."
                  )}`}
                />
              ))}
            </div>
          ) : (
            <SectionAlert tone="info" message={t("admin.analytics.billing.alerts.none", "No billing alerts.")} />
          )}

          <div className={kpiGridClassName}>
            <KpiCard
              title={t("admin.analytics.billing.active_subscriptions", "Active subscriptions")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.billing?.activeSubscriptions || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.billing.new_subscriptions_30d", "New subscriptions (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.billing?.newSubscriptions30d || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.billing.cancellations_30d", "Cancellations (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.billing?.canceledSubscriptions30d || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.billing.paid_amount_30d", "Paid amount (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatMoney(summary?.billing?.paidAmount30d || 0, "EUR", localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.billing.payment_statuses_30d", "Payment statuses (30d)")}
              meta={
                loadingSummary
                  ? t("admin.common.loading", "Loading...")
                  : joinCounts(summary?.billing?.paymentsByStatus30d, {}, localeTag, [
                      "PAID",
                      "INITIATED",
                      "FAILED",
                      "CANCELED",
                      "REFUNDED"
                    ]) || "-"
              }
            />
          </div>

          <div className={kpiGridClassName}>
            <KpiCard
              title={t("admin.analytics.billing.pipeline.checkout_ready", "Checkout ready (30d)")}
              value={formatCount(paymentPipeline.checkoutCreated || 0, localeTag)}
              meta={t(
                "admin.analytics.billing.pipeline.from_init",
                { percent: formatPercent(paymentPipeline.checkoutCreateRatePct || 0, localeTag) },
                "{percent}% from init"
              )}
            />
            <KpiCard
              title={t("admin.analytics.billing.pipeline.webhook_paid", "Webhook paid (30d)")}
              value={formatCount(paymentPipeline.webhookPaid || 0, localeTag)}
              meta={t(
                "admin.analytics.billing.pipeline.from_checkout",
                { percent: formatPercent(paymentPipeline.paidFromCheckoutRatePct || 0, localeTag) },
                "{percent}% from checkout"
              )}
            />
            <KpiCard
              title={t("admin.analytics.billing.pipeline.callback_success", "Callback success (30d)")}
              value={formatCount(paymentPipeline.callbackSuccess || 0, localeTag)}
              meta={t(
                "admin.analytics.billing.pipeline.callback_share",
                { percent: formatPercent(paymentPipeline.callbackSuccessFromCheckoutRatePct || 0, localeTag) },
                "{percent}% callback success"
              )}
            />
            <KpiCard
              title={t("admin.analytics.billing.pipeline.webhook_errors", "Webhook errors (30d)")}
              value={formatCount(paymentPipeline.webhookTechErrorCount || 0, localeTag)}
              meta={t(
                "admin.analytics.billing.pipeline.breakdown",
                {
                  failed: formatCount(paymentPipeline.webhookFailed || 0, localeTag),
                  canceled: formatCount(paymentPipeline.webhookCanceled || 0, localeTag),
                  refunded: formatCount(paymentPipeline.webhookRefunded || 0, localeTag)
                },
                "Failed {failed} | Canceled {canceled} | Refunded {refunded}"
              )}
            />
          </div>

          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.billing.table.time", "Time")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.billing.table.status", "Status")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.billing.table.amount", "Amount")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.billing.table.provider", "Provider")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.billing.table.paid_at", "Paid at")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {t("admin.common.loading_data", "Loading...")}
                    </td>
                  </tr>
                ) : (summary?.billing?.recentPayments || []).length ? (
                  summary.billing.recentPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(payment.createdAt, localeTag)}</td>
                      <td className={tableCellClassName}>{payment.status || "-"}</td>
                      <td className={tableCellClassName}>{formatMoney(payment.amount || 0, payment.currency || "EUR", localeTag)}</td>
                      <td className={tableCellClassName}>{payment.provider || "-"}</td>
                      <td className={tableCellClassName}>{payment.paidAt ? formatDate(payment.paidAt, localeTag) : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {t("admin.analytics.billing.table.empty", "No records found.")}
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
              <CardTitle>{t("admin.analytics.users.title", "Users, costs and limits")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.users.subtitle", "Per-user 30 day usage, estimated cost and active limits.")}
              </div>
            </div>
            <div className={cellSubClassName}>
              {t("admin.analytics.users.actions.selected_count", { count: selectedUserIds.length }, "Selected: {count}")}
            </div>
          </div>

          <div className={kpiGridClassName}>
            <KpiCard
              title={t("admin.analytics.users.summary.users", "Users in table")}
              value={loadingUsers ? t("admin.common.loading", "Loading...") : formatCount(visibleUserRows.length, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.users.summary.estimated_cost", "Estimated cost (30d)")}
              value={loadingUsers ? t("admin.common.loading", "Loading...") : formatMoney(usersAnalytics?.totals?.estimatedCostEur || 0, "EUR", localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.users.summary.paid_amount", "Paid amount (30d)")}
              value={loadingUsers ? t("admin.common.loading", "Loading...") : formatMoney(usersAnalytics?.totals?.paidAmountEur || 0, "EUR", localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.users.summary.budget_capacity", "Budget capacity")}
              value={loadingUsers ? t("admin.common.loading", "Loading...") : formatMoney(usersAnalytics?.totals?.budgetCapacityEur || 0, "EUR", localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.users.summary.near_limits", "Near limits")}
              value={loadingUsers ? t("admin.common.loading", "Loading...") : formatCount(usersAnalytics?.totals?.nearLimitUsersCount || 0, localeTag)}
            />
          </div>

          <form className={toolbarPrimaryClassName} onSubmit={handleUsersSearch}>
            <input
              className={inputClassName}
              value={usersQueryDraft}
              onChange={event => setUsersQueryDraft(event.target.value)}
              placeholder={t("admin.analytics.users.table.user", "User")}
              aria-label={t("admin.analytics.users.table.user", "User")}
            />
            <Button variant="ghost" className={actionButtonClassName} type="submit" disabled={loadingUsers}>
              {t("admin.common.refresh", "Search")}
            </Button>
            <Button variant="ghost" className={actionButtonClassName} onClick={handleUsersSearchClear} disabled={loadingUsers}>
              {t("buttons.cancel", "Clear")}
            </Button>
          </form>

          <div className={usersSelectBarClassName}>
            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
              <div className="grid gap-2">
                <label className={cellSubClassName} htmlFor="analytics-bulk-email-target">
                  {t("admin.analytics.users.actions.email_target", "Email target")}
                </label>
                <select
                  id="analytics-bulk-email-target"
                  className={selectClassName}
                  value={emailTarget}
                  onChange={event => setEmailTarget(event.target.value === "all" ? "all" : "selected")}
                  disabled={sendingUsersEmail || deletingUsers}
                >
                  <option value="selected">{t("admin.analytics.users.actions.email_selected", "Selected users")}</option>
                  <option value="all">{t("admin.analytics.users.actions.email_all", "All users")}</option>
                </select>
              </div>
              <div className={usersSelectActionsClassName}>
                <Button
                  size="sm"
                  variant="ghost"
                  className={actionButtonClassName}
                  onClick={toggleAllVisibleUsers}
                  disabled={loadingUsers || !visibleUserIds.length}
                >
                  {allVisibleSelected
                    ? t("admin.analytics.users.actions.clear_visible", "Clear visible")
                    : t("admin.analytics.users.actions.select_visible", "Select visible")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className={actionButtonClassName}
                  onClick={handleDeleteSelectedUsers}
                  disabled={deletingUsers || !selectedUserIds.length}
                >
                  {deletingUsers
                    ? t("admin.analytics.users.actions.deleting", "Deleting...")
                    : t("admin.analytics.users.actions.delete_selected", "Delete selected")}
                </Button>
              </div>
            </div>
            <div className={usersSelectActionsClassName}>
              <span className={usersSelectCountClassName}>
                {t("admin.analytics.users.actions.selected_count", { count: selectedUserIds.length }, "Selected: {count}")}
              </span>
              <span className={usersSelectCountClassName}>
                {t(
                  "admin.analytics.users.actions.selected_visible",
                  { count: selectedVisibleCount },
                  "Selected from visible: {count}"
                )}
              </span>
            </div>
          </div>

          <SectionAlert tone={usersNotice?.tone} message={usersNotice?.message} />

          <div className={emailSendBarClassName}>
            <div className={emailSendHeadClassName}>
              <CardTitle>{t("admin.analytics.users.actions.send_email", "Send email")}</CardTitle>
              <div className={emailSendHintClassName}>
                {t(
                  "admin.analytics.users.actions.email_target_hint",
                  {
                    mode:
                      emailTarget === "all"
                        ? t("admin.analytics.users.actions.email_all", "All users")
                        : t("admin.analytics.users.actions.email_selected", "Selected users")
                  },
                  "Current target: {mode}"
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <label className={cellSubClassName} htmlFor="analytics-email-subject">
                {t("admin.analytics.users.actions.email_subject", "Email subject")}
              </label>
              <input
                id="analytics-email-subject"
                className={inputClassName}
                value={bulkEmailSubject}
                onChange={event => setBulkEmailSubject(event.target.value)}
                placeholder={t("admin.analytics.users.actions.email_subject_ph", "Enter subject")}
                maxLength={180}
              />
            </div>
            <div className="grid gap-2">
              <label className={cellSubClassName} htmlFor="analytics-email-text">
                {t("admin.analytics.users.actions.email_text", "Email text")}
              </label>
              <textarea
                id="analytics-email-text"
                className={textAreaClassName}
                value={bulkEmailText}
                onChange={event => setBulkEmailText(event.target.value)}
                placeholder={t("admin.analytics.users.actions.email_text_ph", "Write a message...")}
                maxLength={8000}
              />
            </div>
            <Button
              variant="primary"
              className={actionButtonClassName}
              onClick={handleSendBulkEmail}
              disabled={sendingUsersEmail || deletingUsers}
            >
              {sendingUsersEmail
                ? t("admin.analytics.users.actions.sending", "Sending...")
                : t("admin.analytics.users.actions.send_email", "Send email")}
            </Button>
          </div>
          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisibleUsers}
                      aria-label={t("admin.analytics.users.actions.select_visible", "Select visible")}
                    />
                  </th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.user", "User")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.role", "Role")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.subscription", "Subscription")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.usage_30d", "Usage (30d)")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.cost_30d", "Cost estimate (30d)")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.limits", "Limits")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.paid_30d", "Paid (30d)")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={8}>
                      {t("admin.common.loading_data", "Loading...")}
                    </td>
                  </tr>
                ) : visibleUserRows.length ? (
                  visibleUserRows.map(row => (
                    <tr key={row.userId} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(row.userId)}
                          onChange={() => toggleUserSelection(row.userId)}
                          aria-label={t(
                            "admin.analytics.users.actions.select_user",
                            { user: row.email || row.userId },
                            "Select user {user}"
                          )}
                        />
                      </td>
                      <td className={tableCellClassName}>
                        <div>{row.email || row.userId}</div>
                        <div className={cellSubClassName}>{row.userId}</div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{getRoleLabel(row.role, row.isAdmin)}</div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.table.admin", "Admin")}:{" "}
                          {row.isAdmin ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{row?.subscription?.status || "-"}</div>
                        <div className={cellSubClassName}>
                          {row?.subscription?.isActive
                            ? t("admin.analytics.users.active", "Active")
                            : t("admin.analytics.users.inactive", "Inactive")}
                        </div>
                        <div className={cellSubClassName}>{row?.subscription?.plan || "-"}</div>
                      </td>
                      <td className={tableCellClassName}>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.chat", "Chat")}: {formatCount(row?.usage?.chatRequests || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.rag", "RAG")}: {formatCount(row?.usage?.ragSearches || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.stt", "STT")}: {formatCount(row?.usage?.sttRequests || 0, localeTag)} /{" "}
                          {formatPercent(row?.usage?.sttAudioMb || 0, localeTag, 3)} MB
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.tts", "TTS")}: {formatCount(row?.usage?.ttsRequests || 0, localeTag)} /{" "}
                          {formatCount(row?.usage?.ttsChars || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.analyze", "Analyses (30d)")}:{" "}
                          {formatCount(row?.usage?.analyses30d || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.analyze_today", "Analyses today")}:{" "}
                          {formatCount(row?.usage?.analysesToday || 0, localeTag)}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div>{formatMoney(row?.costs?.totalEur || 0, "EUR", localeTag)}</div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.chat", "Chat")}: {formatMoney(row?.costs?.chatEur || 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.rag", "RAG")}: {formatMoney(row?.costs?.ragEur || 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.stt", "STT")}: {formatMoney(row?.costs?.sttEur || 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.usage.tts", "TTS")}: {formatMoney(row?.costs?.ttsEur || 0, "EUR", localeTag)}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.plan_amount", "Monthly fee")}:{" "}
                          {row.isAdmin ? "-" : formatMoney(row?.limits?.planAmountEur || 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.analyze_daily", "Analyze/day")}:{" "}
                          {formatCount(row?.limits?.analyzeDaily || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.analyze_usage_today", "Used today")}:{" "}
                          {formatCount(row?.limits?.analyzeToday || 0, localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.analyze_remaining", "Remaining today")}:{" "}
                          {formatCount(row?.limits?.analyzeRemainingToday || 0, localeTag)}
                        </div>
                        <UsageBar value={row?.limits?.analyzeUtilizationPct || 0} />
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.monthly_budget", "Monthly budget")}:{" "}
                          {formatMoney(row?.budget?.monthlyEur || 0, "EUR", localeTag)}
                        </div>
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.remaining_budget", "Remaining budget")}:{" "}
                          {formatMoney(row?.budget?.remainingEur || 0, "EUR", localeTag)}
                        </div>
                        <UsageBar value={row?.budget?.utilizationPct || 0} />
                        <div className={cellSubClassName}>
                          {t("admin.analytics.users.limits.utilization", "Utilization")}:{" "}
                          {formatPercent(row?.budget?.utilizationPct || 0, localeTag, 1)}%
                        </div>
                      </td>
                      <td className={tableCellClassName}>{formatMoney(row?.paidAmount30dEur || 0, "EUR", localeTag)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={8}>
                      {t("admin.analytics.users.table.empty", "No users found.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={cellSubClassName}>
            {t(
              "admin.analytics.users.note",
              {
                chat: toNumber(usersAnalytics?.costModel?.chatRequestEur || 0).toFixed(4),
                rag: toNumber(usersAnalytics?.costModel?.ragSearchEur || 0).toFixed(4),
                stt: toNumber(usersAnalytics?.costModel?.sttPerAudioMbEur || 0).toFixed(4),
                tts: toNumber(usersAnalytics?.costModel?.ttsPer1kCharsEur || 0).toFixed(4),
                budget: toNumber(usersAnalytics?.costModel?.monthlyBudgetEur || 0).toFixed(2)
              },
              "Cost model note."
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.logs.title", "Logs")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.logs.subtitle", "Latest events with filters.")}
              </div>
            </div>
          </div>

          <div className={toolbarPrimaryClassName}>
            <select className={selectClassName} value={eventFilter} onChange={event => setEventFilter(event.target.value)}>
              <option value="all">{t("admin.analytics.logs.filter.all_events", "All events")}</option>
              {EVENT_OPTIONS.map(item => (
                <option key={item.value} value={item.value}>
                  {eventLabels[item.value] || item.value}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={isCrisisFilter} onChange={event => setIsCrisisFilter(event.target.value)}>
              <option value="all">{t("admin.analytics.logs.filter.crisis_all", "Crisis: all")}</option>
              <option value="true">{t("admin.analytics.logs.filter.crisis_yes", "Crisis: yes")}</option>
              <option value="false">{t("admin.analytics.logs.filter.crisis_no", "Crisis: no")}</option>
            </select>
            <Button
              size="sm"
              variant="danger"
              className={actionButtonClassName}
              onClick={() => handleDeleteLogs(false)}
              disabled={deletingLogs || !canDeleteFilteredLogs}
            >
              {deletingLogs
                ? t("admin.analytics.logs.actions.deleting", "Deleting...")
                : t("admin.analytics.logs.actions.delete_filtered", "Delete filtered logs")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              className={actionButtonClassName}
              onClick={() => handleDeleteLogs(true)}
              disabled={deletingLogs}
            >
              {deletingLogs
                ? t("admin.analytics.logs.actions.deleting", "Deleting...")
                : t("admin.analytics.logs.actions.delete_all", "Delete all logs")}
            </Button>
          </div>

          <SectionAlert tone={logsNotice?.tone} message={logsNotice?.message} />

          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.logs.table.time", "Time")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.logs.table.event", "Event")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.logs.table.role", "Role")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.logs.table.crisis", "Crisis")}</th>
                  <th className={tableHeadCellClassName}>{t("admin.analytics.logs.table.meta", "Meta")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {t("admin.common.loading_data", "Loading...")}
                    </td>
                  </tr>
                ) : events.length ? (
                  events.map(row => (
                    <tr key={row.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(row.createdAt, localeTag)}</td>
                      <td className={tableCellClassName}>{eventLabels[row.event] || row.event || "-"}</td>
                      <td className={tableCellClassName}>{getRoleLabel(row.role, false)}</td>
                      <td className={tableCellClassName}>
                        {row?.data?.isCrisis ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}
                      </td>
                      <td className={`${tableCellClassName} ${cellSubClassName}`}>{summarizeEventMeta(row?.data)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      {t("admin.analytics.logs.table.empty", "No records found.")}
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
              <CardTitle>{t("admin.analytics.reset.title", "Prelaunch reset")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.reset.subtitle", "Run targeted cleanup actions before launch.")}
              </div>
            </div>
          </div>

          <div className={resetActionGridClassName}>
            {PRELAUNCH_RESET_ACTIONS.map(item => {
              const isRunning = runningResetAction === item.value;
              return (
                <Button
                  key={item.value}
                  size="sm"
                  variant="danger"
                  className={resetActionButtonClassName}
                  onClick={() => handleRunReset(item.value)}
                  disabled={Boolean(runningResetAction)}
                >
                  {isRunning ? t("admin.analytics.reset.running", "Running...") : t(item.labelKey, item.value)}
                </Button>
              );
            })}
          </div>

          <SectionAlert tone={resetNotice?.tone} message={resetNotice?.message} />
        </div>
      </div>
    </div>
  );
}
