"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import BackButton from "@/components/ui/BackButton";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { localizePath } from "@/lib/localizePath";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import {
  ragAdminShellCardClassName,
  ragAdminShellDividerClassName,
  ragAdminShellNavClassName,
  ragAdminShellNavLinkClassName,
  ragAdminShellSubtitleClassName,
  ragAdminShellTitleClassName
} from "@/components/admin/rag/ragAdminShellStyles";
import {
  glassPageBackTopLeftClassName
} from "@/components/ui/glassPageStyles";

const pageClassName =
  "flex w-full min-w-0 max-w-full flex-col gap-[clamp(1rem,2.2vw,1.45rem)] overflow-x-clip text-[color:var(--admin-text)] " +
  "[--admin-text:var(--documents-page-text)] [--admin-muted:var(--documents-page-muted)] [--admin-surface:var(--documents-card-bg)] " +
  "[--admin-surface-2:var(--documents-subpanel-bg)] [--admin-surface-3:var(--documents-content-bg)] [--admin-border:var(--documents-card-border)] " +
  "[--admin-border-strong:var(--documents-subpanel-border)] [--admin-shadow-soft:var(--documents-soft-shadow)] [--admin-shadow:var(--documents-strong-shadow)] " +
  "[--admin-accent:var(--documents-accent)] [--admin-accent-soft:var(--documents-accent-soft)] [--admin-accent-cool:var(--documents-accent)] " +
  "[--admin-success:var(--documents-success-text)] [--admin-danger:var(--documents-error-text)] [--rag-text:var(--documents-page-text)]";
const pageHeaderClassName =
  `${ragAdminShellCardClassName} w-full min-w-0 max-w-full overflow-visible`;
const pageHeaderSurfaceClassName = "relative z-[1] grid min-w-0 gap-3";
const pageHeaderMainClassName = "relative flex w-full min-w-0 items-start justify-center gap-[0.75rem] text-center";
const pageHeaderTitleWrapClassName = "grid min-w-0 w-full justify-items-center gap-[0.45rem] text-center";
const mobileTitleWrapClassName =
  "relative z-[4] flex w-full items-center justify-center";
const pageTitleClassName = ragAdminShellTitleClassName;
const pageHeaderSubtitleClassName = ragAdminShellSubtitleClassName;
const pageHeaderMetaRowClassName = "flex w-full min-w-0 flex-col items-center gap-3";
const pageHeaderMetaClassName = "flex min-w-0 max-w-full flex-wrap items-center justify-center gap-2";
const pageHeaderToolbarClassName = "flex flex-wrap items-center justify-center gap-2";
const pageHeaderDividerClassName = ragAdminShellDividerClassName;
const sectionNavClassName = `${ragAdminShellNavClassName} pt-0`;
const sectionNavLinkClassName =
  `${ragAdminShellNavLinkClassName} min-h-[2.3rem] min-w-0 px-[0.9rem] py-[0.5rem] text-[0.84rem]`;
const headerPillClassName =
  "documents-chip inline-flex max-w-full items-center gap-2 rounded-full px-[0.92rem] py-[0.48rem] text-[0.82rem] font-[600] tracking-[0.01em] text-[color:var(--admin-text)]";
const headerPillLabelClassName = "text-[color:var(--admin-muted)]";
const headerPillValueClassName = "text-[color:var(--admin-text)]";
const cardClassName =
  "relative w-full min-w-0 self-start overflow-visible rounded-[0.95rem] border border-[color:var(--glass-border-color,var(--admin-border))] " +
  "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_82%,var(--glass-surface-bg)_18%),color-mix(in_srgb,var(--admin-surface-2)_88%,transparent))] " +
  "min-[769px]:backdrop-blur-[var(--glass-blur-radius,1rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] " +
  "p-[clamp(0.62rem,1.4vw,0.82rem)] shadow-[var(--glass-shell-shadow,var(--admin-shadow-soft))] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_12%_-4%,rgba(255,255,255,0.11),transparent_44%)] before:opacity-70";
const cardBodyClassName = "relative z-[1] grid min-w-0 gap-[0.6rem]";
const kpiGridClassName = "grid grid-cols-1";
const topKpiGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const platformGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const docsGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const billingSummaryGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const billingPipelineGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const usersSummaryGridClassName = "grid grid-cols-1 gap-x-6 2xl:grid-cols-2";
const sectionHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const sectionSubClassName = "text-[0.9rem] leading-[1.45] text-[color:var(--admin-muted)] max-w-[68ch]";
const kpiValueClassName = "text-[clamp(1.2rem,1.55vw,1.52rem)] font-[700] leading-[1.02] text-[color:var(--admin-text)]";
const kpiMetaClassName = "text-[0.84rem] leading-[1.3] text-[color:var(--admin-muted)]";
const statRowClassName =
  "grid min-w-0 gap-x-3 gap-y-1 border-b border-[color:var(--admin-border)] py-2 last:border-b-0 grid-cols-[minmax(0,1fr)_auto]";
const statRowMainClassName = "grid min-w-0 gap-[0.08rem] content-start";
const statRowValueWrapClassName = "grid min-w-0 justify-items-end content-start";
const metricGroupClassName = "grid min-w-0 gap-1.5 border-b border-[color:var(--admin-border)] py-2 last:border-b-0";
const barClassName = "flex h-2 overflow-hidden rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)]";
const tableHeaderClassName = "flex flex-wrap items-center justify-between gap-2";
const tableScrollHintClassName = "hidden";
const tableDesktopWrapClassName = "max-[1180px]:hidden";
const tableWrapClassName =
  "overflow-auto rounded-[1rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
const tableClassName = "min-w-[38rem] w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName =
  "sticky top-0 z-[1] border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-1.25 text-left text-[0.76rem] uppercase tracking-[0.04em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-2 py-1.75 text-left text-[0.86rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const toolbarPrimaryClassName =
  "grid min-w-0 grid-cols-1 items-center gap-2 rounded-[16px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-[0.72rem] shadow-[var(--admin-shadow-soft)] 2xl:grid-cols-[minmax(0,1fr)_auto_auto]";
const logsToolbarClassName =
  "grid min-w-0 grid-cols-1 items-center gap-2 rounded-[16px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-[0.72rem] shadow-[var(--admin-shadow-soft)] 2xl:grid-cols-[minmax(12rem,15rem)_minmax(7.5rem,8.5rem)_auto_auto] 2xl:justify-start";
const usersSelectBarClassName =
  "grid min-w-0 gap-2 rounded-[16px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-[0.8rem]";
const usersSelectActionsClassName = "flex min-w-0 flex-wrap items-center gap-2";
const usersSelectCountClassName =
  "inline-flex max-w-full shrink-0 items-center rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] px-2.5 py-1 text-[0.82rem] text-[color:var(--admin-muted)]";
const emailSendBarClassName =
  "grid gap-2 rounded-[16px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-2)_90%,transparent),color-mix(in_srgb,var(--admin-surface-3)_92%,transparent))] p-[0.8rem]";
const emailSendHeadClassName = "flex min-w-0 flex-wrap items-start justify-between gap-2";
const emailSendHintClassName = "min-w-0 max-w-full text-[0.86rem] text-[color:var(--admin-muted)] break-words";
const dropdownClassName = "w-full min-w-0 xl:max-w-[15rem]";
const compactDropdownClassName = "w-full min-w-0 xl:max-w-[8.5rem]";
const inputClassName =
  "documents-field documents-form-input min-w-0 w-full max-w-full rounded-[12px] border px-3 py-[0.6rem] text-[0.95rem] text-[color:var(--admin-text)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none";
const textAreaClassName =
  "documents-field documents-form-input documents-field--textarea min-w-0 w-full max-w-full min-h-[120px] rounded-[12px] border px-3 py-[0.7rem] text-[0.95rem] leading-[1.45] text-[color:var(--admin-text)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none";
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
  "!justify-self-start !self-start !w-auto !min-h-[2.06rem] !rounded-[0.8rem] !px-[0.9rem] !py-[0.34rem] !text-[0.9rem] !leading-[1.05] !font-semibold !tracking-[0.01em] max-[768px]:!w-full max-[768px]:!justify-center";
const actionButtonClassName =
  "!justify-self-start !self-start !w-auto !max-w-full !min-h-[2.06rem] !rounded-[0.82rem] !px-[0.92rem] !py-[0.34rem] !text-[0.88rem] !leading-[1.05] !font-semibold !tracking-[0.01em] max-[768px]:!w-full max-[768px]:!justify-center";
const resetActionGridClassName = "mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3";
const resetActionButtonClassName =
  `${actionButtonClassName} !w-full !justify-start !min-h-[2.38rem] !px-[1.1rem] !py-[0.56rem] !text-[0.97rem] !leading-[1.15]`;
const backButtonClassName =
  `${glassPageBackTopLeftClassName} !z-[30] pointer-events-auto`;
const metricListClassName = "grid gap-1";
const metricRowClassName =
  "grid min-w-0 grid-cols-1 items-start gap-x-2 gap-y-0.5 text-[0.86rem] sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]";
const summaryDeckClassName = "grid w-full items-start gap-3 2xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]";
const summaryPanelClassName =
  "relative w-full min-w-0 overflow-visible rounded-[0.95rem] border border-[color:var(--glass-border-color,var(--admin-border))] " +
  "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_82%,var(--glass-surface-bg)_18%),color-mix(in_srgb,var(--admin-surface-2)_88%,transparent))] " +
  "min-[769px]:backdrop-blur-[var(--glass-blur-radius,1rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] " +
  "p-[clamp(0.62rem,1.4vw,0.82rem)] shadow-[var(--glass-shell-shadow,var(--admin-shadow-soft))] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_12%_-4%,rgba(255,255,255,0.11),transparent_44%)] before:opacity-70";
const summaryPanelBodyClassName = "relative z-[1] grid min-w-0 gap-2.5";
const mobileListClassName = "hidden min-w-0 max-[1180px]:grid gap-2";
const mobileRowCardClassName =
  "grid min-w-0 max-w-full gap-3 rounded-[1rem] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-2)_92%,transparent),color-mix(in_srgb,var(--admin-surface-3)_94%,transparent))] p-3 shadow-[var(--admin-shadow-soft)]";
const mobileRowHeadClassName = "flex min-w-0 items-start justify-between gap-3";
const mobileRowTitleClassName = "min-w-0 break-words text-[1rem] font-semibold leading-[1.25] text-[color:var(--admin-text)]";
const mobileRowSubClassName = "min-w-0 break-all text-[0.82rem] text-[color:var(--admin-muted)]";
const mobileFieldGridClassName = "grid gap-2 sm:grid-cols-2";
const mobileFieldClassName = "grid min-w-0 gap-[0.35rem]";
const mobileFieldLabelClassName = "text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const mobileFieldValueClassName = "min-w-0 max-w-full break-words text-[0.92rem] leading-[1.45] text-[color:var(--admin-text)]";
const compactMetricGridClassName = "grid min-w-0 gap-x-3 gap-y-1.5 sm:grid-cols-2";
const compactMetricRowClassName = "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2";
const compactMetricLabelClassName = "min-w-0 text-[0.82rem] leading-[1.3] text-[color:var(--admin-muted)]";
const compactMetricValueClassName = "min-w-0 text-right text-[0.92rem] leading-[1.25] text-[color:var(--admin-text)]";
const compactMetricLeadValueClassName = "text-[1rem] font-semibold leading-[1.15] text-[color:var(--admin-text)]";
const checkboxClassName = "ui-checkbox-glass";

const EVENT_OPTIONS = [
  { value: "chat_request", labelKey: "admin.analytics.events.chat_request" },
  { value: "rag_search", labelKey: "admin.analytics.events.rag_search" },
  { value: "no_context", labelKey: "admin.analytics.events.no_context" },
  { value: "crisis_detected", labelKey: "admin.analytics.events.crisis_detected" },
  { value: "stt_request", labelKey: "admin.analytics.events.stt_request" },
  { value: "tts_request", labelKey: "admin.analytics.events.tts_request" },
  { value: "rag_error", labelKey: "admin.analytics.events.rag_error" },
  { value: "openai_error", labelKey: "admin.analytics.events.openai_error" },
  { value: "openai_usage", labelKey: "admin.analytics.events.openai_usage", fallbackLabel: "OpenAI usage" },
  { value: "rag_cost_usage", labelKey: "admin.analytics.events.rag_cost_usage", fallbackLabel: "RAG cost usage" },
  { value: "tts_cost_usage", labelKey: "admin.analytics.events.tts_cost_usage", fallbackLabel: "TTS cost usage" },
  { value: "stt_cost_usage", labelKey: "admin.analytics.events.stt_cost_usage", fallbackLabel: "STT cost usage" },
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

function formatDecimal(value, localeTag, digits = 2) {
  try {
    return new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(toNumber(value));
  } catch {
    return String(toNumber(value));
  }
}

function formatMinutes(value, localeTag, digits = 2) {
  return `${formatDecimal(value, localeTag, digits)} min`;
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

function HeaderPill({ label, value }) {
  return (
    <div className={headerPillClassName}>
      <span className={`${headerPillLabelClassName} min-w-0`}>{label}</span>
      <span className={`${headerPillValueClassName} shrink-0`}>{value}</span>
    </div>
  );
}

function KpiCard({ title, value, meta, children }) {
  return (
    <div className={statRowClassName}>
      <div className={statRowMainClassName}>
        <CardTitle className="min-w-0 !mb-0 text-[clamp(0.96rem,1.1vw,1.04rem)] leading-[1.06] [text-wrap:balance]">
          {title}
        </CardTitle>
        {meta ? <div className={`${kpiMetaClassName} col-span-2 xl:col-span-1`}>{meta}</div> : null}
      </div>
      <div className={statRowValueWrapClassName}>
        {value != null ? <div className={`${kpiValueClassName} whitespace-nowrap text-right`}>{value}</div> : null}
        {children}
      </div>
    </div>
  );
}

function MobileInfoField({ label, value, className = "", valueClassName = "" }) {
  return (
    <div className={`${mobileFieldClassName} ${className}`.trim()}>
      <div className={mobileFieldLabelClassName}>{label}</div>
      <div className={`${mobileFieldValueClassName} ${valueClassName}`.trim()}>{value}</div>
    </div>
  );
}

function CompactMetricGrid({ items, className = "" }) {
  return (
    <div className={`${compactMetricGridClassName} ${className}`.trim()}>
      {items.map(item => (
        <div key={item.label} className={compactMetricRowClassName}>
          <span className={compactMetricLabelClassName}>{item.label}</span>
          <span className={compactMetricValueClassName}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function MetricListCard({ title, items }) {
  return (
    <div className={metricGroupClassName}>
      <CardTitle className="min-w-0 text-[clamp(0.96rem,1.15vw,1.04rem)] leading-[1.08] [text-wrap:balance]">
        {title}
      </CardTitle>
      <div className={metricListClassName}>
        {items.map(item => (
          <div key={item.label} className={metricRowClassName}>
            <span className={`${cellSubClassName} min-w-0 break-words`}>{item.label}</span>
            <span className="min-w-0 max-w-full whitespace-normal break-words text-left sm:text-right [overflow-wrap:anywhere]">
              {item.value}
            </span>
          </div>
        ))}
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
      out[entry.value] = t(entry.labelKey, entry.fallbackLabel || entry.value);
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
  const sectionLinks = useMemo(
    () => [
      { href: "#analytics-overview", label: t("admin.analytics.title", "Analytics") },
      { href: "#analytics-platform", label: t("admin.analytics.platform.title", "Platform overview") },
      { href: "#analytics-rag-docs", label: t("admin.analytics.rag_docs.title", "RAG documents") },
      { href: "#analytics-billing", label: t("admin.analytics.billing.title", "Subscriptions and payments") },
      { href: "#analytics-users", label: t("admin.analytics.users.title", "Users, costs and limits") },
      { href: "#analytics-ai-costs", label: t("admin.analytics.ai_costs.title", "AI Cost Activity") },
      { href: "#analytics-logs", label: t("admin.analytics.logs.title", "Logs") }
    ],
    [t]
  );
  const emailTargetOptions = useMemo(
    () => [
      { value: "selected", label: t("admin.analytics.users.actions.email_selected", "Selected users") },
      { value: "all", label: t("admin.analytics.users.actions.email_all", "All users") }
    ],
    [t]
  );
  const eventFilterOptions = useMemo(
    () => [
      { value: "all", label: t("admin.analytics.logs.filter.all_events", "All events") },
      ...EVENT_OPTIONS.map(item => ({ value: item.value, label: eventLabels[item.value] || item.value }))
    ],
    [eventLabels, t]
  );
  const crisisFilterOptions = useMemo(
    () => [
      { value: "all", label: t("admin.analytics.logs.filter.crisis_all", "Crisis: all") },
      { value: "true", label: t("admin.analytics.logs.filter.crisis_yes", "Crisis: yes") },
      { value: "false", label: t("admin.analytics.logs.filter.crisis_no", "Crisis: no") }
    ],
    [t]
  );

  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [aiCosts, setAiCosts] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAiCosts, setLoadingAiCosts] = useState(false);
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

  const getThresholdLabel = useCallback(
    value => {
      const normalized = String(value || "").trim().toLowerCase();
      if (normalized === "exceeded") return t("admin.analytics.ai_costs.threshold.exceeded", "Exceeded");
      if (normalized === "high") return t("admin.analytics.ai_costs.threshold.high", "High");
      if (normalized === "warning") return t("admin.analytics.ai_costs.threshold.warning", "Warning");
      return t("admin.analytics.ai_costs.threshold.normal", "Normal");
    },
    [t]
  );

  const getCoverageLabel = useCallback(
    value => (value ? t("admin.analytics.ai_costs.coverage.complete", "Complete") : t("admin.analytics.ai_costs.coverage.partial", "Partial")),
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
      if (typeof meta.route === "string" && meta.route) {
        parts.push(`route: ${meta.route}`);
      }
      if (typeof meta.stage === "string" && meta.stage) {
        parts.push(`stage: ${meta.stage}`);
      }
      if (typeof meta.model === "string" && meta.model) {
        parts.push(`model: ${meta.model}`);
      }
      if (typeof meta.upstream_route === "string" && meta.upstream_route) {
        parts.push(`upstream route: ${meta.upstream_route}`);
      }
      if (typeof meta.upstream_stage === "string" && meta.upstream_stage) {
        parts.push(`upstream stage: ${meta.upstream_stage}`);
      }
      if (typeof meta.userId === "string" && meta.userId) {
        parts.push(`userId: ${meta.userId}`);
      }
      if (typeof meta.role === "string" && meta.role) {
        parts.push(`role: ${meta.role}`);
      }
      if (typeof meta.input_tokens === "number") {
        parts.push(`in: ${formatCount(meta.input_tokens, localeTag)}`);
      }
      if (typeof meta.cached_tokens === "number") {
        parts.push(`cached: ${formatCount(meta.cached_tokens, localeTag)}`);
      }
      if (typeof meta.output_tokens === "number") {
        parts.push(`out: ${formatCount(meta.output_tokens, localeTag)}`);
      }
      if (typeof meta.reasoning_tokens === "number") {
        parts.push(`reasoning: ${formatCount(meta.reasoning_tokens, localeTag)}`);
      }
      if (typeof meta.prompt_tokens === "number") {
        parts.push(`prompt: ${formatCount(meta.prompt_tokens, localeTag)}`);
      }
      if (typeof meta.total_tokens === "number") {
        parts.push(`total: ${formatCount(meta.total_tokens, localeTag)}`);
      }
      if (typeof meta.text_chars === "number") {
        parts.push(`chars: ${formatCount(meta.text_chars, localeTag)}`);
      }
      if (typeof meta.embedding_calls === "number") {
        parts.push(`embedding calls: ${formatCount(meta.embedding_calls, localeTag)}`);
      }
      if (typeof meta.embedding_input_count === "number") {
        parts.push(`embedding inputs: ${formatCount(meta.embedding_input_count, localeTag)}`);
      }
      if (typeof meta.chunk_count === "number") {
        parts.push(`chunks: ${formatCount(meta.chunk_count, localeTag)}`);
      }
      if (typeof meta.result_count === "number") {
        parts.push(`results: ${formatCount(meta.result_count, localeTag)}`);
      }
      if (typeof meta.top_k === "number") {
        parts.push(`top_k: ${formatCount(meta.top_k, localeTag)}`);
      }
      if (typeof meta.duration_seconds === "number") {
        parts.push(`sec: ${formatPercent(meta.duration_seconds, localeTag, 2)}`);
      }
      if (typeof meta.latency_ms === "number") {
        parts.push(`latency: ${formatDecimal(meta.latency_ms, localeTag, 2)} ms`);
      }
      if (typeof meta.conversation_id === "string" && meta.conversation_id) {
        parts.push(`conversation: ${meta.conversation_id}`);
      }
      if (typeof meta.artifact_id === "string" && meta.artifact_id) {
        parts.push(`artifact: ${meta.artifact_id}`);
      }
      if (typeof meta.research_job_id === "string" && meta.research_job_id) {
        parts.push(`research job: ${meta.research_job_id}`);
      }
      if (typeof meta.cost_estimation_basis === "string" && meta.cost_estimation_basis) {
        parts.push(`estimated: ${meta.cost_estimation_basis}`);
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

  const loadAiCosts = useCallback(async () => {
    setLoadingAiCosts(true);
    try {
      const params = new URLSearchParams();
      params.set("days", "30");
      params.set("locale", locale || "en");
      const data = await requestJson(
        `/api/admin/analytics/ai-costs?${params.toString()}`,
        undefined,
        "admin.analytics.errors.summary_fetch_failed"
      );
      setAiCosts(data);
      setPageError("");
    } catch (error) {
      setPageError(error?.message || t("admin.analytics.errors.summary_fetch_failed", "AI cost analytics fetch failed."));
    } finally {
      setLoadingAiCosts(false);
    }
  }, [locale, requestJson, t]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadSummary(), loadEvents(), loadUsers(), loadAiCosts()]);
    setRefreshing(false);
  }, [loadAiCosts, loadEvents, loadSummary, loadUsers]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadAiCosts();
  }, [loadAiCosts]);

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
          },
          {
            label: t("admin.analytics.platform.documents.framework_acceptances_30d", "Framework acceptances (30d)"),
            value: formatCount(summary?.documents?.frameworkAcceptances?.accepted30d || 0, localeTag)
          },
          {
            label: t("admin.analytics.platform.documents.framework_signed_30d", "Signed downloads (30d)"),
            value: formatCount(summary?.documents?.frameworkAcceptances?.signedDownloaded30d || 0, localeTag)
          }
        ]
      }
    ],
    [artifactDownloadCount, downloadCount, helpStatusSummary, localeTag, summary, t]
  );

  const headerStats = useMemo(() => {
    const loadingLabel = t("admin.common.loading", "Loading...");
    return [
      {
        label: t("admin.analytics.platform.help.open_requests", "Open requests"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.help?.openRequests || 0, localeTag)
      },
      {
        label: t("admin.analytics.billing.active_subscriptions", "Active subscriptions"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.billing?.activeSubscriptions || 0, localeTag)
      },
      {
        label: t("admin.analytics.users.summary.users", "Users in table"),
        value: loadingUsers ? loadingLabel : formatCount(visibleUserRows.length, localeTag)
      },
      {
        label: t("admin.analytics.logs.title", "Logs"),
        value: loadingEvents ? loadingLabel : formatCount(events.length, localeTag)
      }
    ];
  }, [events.length, loadingEvents, loadingSummary, loadingUsers, localeTag, summary, t, visibleUserRows.length]);

  const liveSnapshotItems = useMemo(() => {
    const loadingLabel = t("admin.common.loading", "Loading...");
    const aiErrors = toNumber(summary?.chat?.ragErrors30d) + toNumber(summary?.chat?.openAiErrors30d);
    return [
      {
        label: t("admin.analytics.platform.help.open_offers", "Open offers"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.help?.openOffers || 0, localeTag)
      },
      {
        label: t("admin.analytics.platform.collaboration.pending_invites", "Pending invites"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.collaboration?.pendingInvites || 0, localeTag)
      },
      {
        label: t("admin.analytics.platform.documents.uploaded_30d", "Uploaded (30d)"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.documents?.uploaded30d || 0, localeTag)
      },
      {
        label: t("admin.analytics.billing.paid_amount_30d", "Paid amount (30d)"),
        value: loadingSummary ? loadingLabel : formatMoney(summary?.billing?.paidAmount30d || 0, "EUR", localeTag)
      },
      {
        label: t("admin.analytics.platform.chat.ai_errors_30d", "AI errors (30d)"),
        value: loadingSummary ? loadingLabel : formatCount(aiErrors, localeTag)
      },
      {
        label: t("admin.analytics.platform.help.matches_30d", "Matches (30d)"),
        value: loadingSummary ? loadingLabel : formatCount(summary?.help?.matches30d || 0, localeTag)
      }
    ];
  }, [loadingSummary, localeTag, summary, t]);

  const aiCostCards = useMemo(
    () => [
      {
        title: t("admin.analytics.ai_costs.cards.total", "AI cost events"),
        value: loadingAiCosts ? t("admin.common.loading", "Loading...") : formatCount(aiCosts?.summary?.total_events || 0, localeTag),
        meta: t("admin.analytics.ai_costs.cards.total_meta", "ChatLog-based observability events")
      },
      {
        title: t("admin.analytics.ai_costs.cards.direct", "Direct-usage events"),
        value: loadingAiCosts ? t("admin.common.loading", "Loading...") : formatCount(aiCosts?.summary?.direct_usage_events || 0, localeTag),
        meta: t("admin.analytics.ai_costs.cards.direct_meta", "Usage returned directly by provider APIs")
      },
      {
        title: t("admin.analytics.ai_costs.cards.estimated", "Estimated-usage events"),
        value: loadingAiCosts ? t("admin.common.loading", "Loading...") : formatCount(aiCosts?.summary?.estimated_usage_events || 0, localeTag),
        meta: t("admin.analytics.ai_costs.cards.estimated_meta", "Events where cost must be estimated from request size or text length")
      },
      {
        title: t("admin.analytics.ai_costs.cards.users", "Users with AI activity"),
        value: loadingAiCosts ? t("admin.common.loading", "Loading...") : formatCount(aiCosts?.summary?.unique_users || 0, localeTag),
        meta: t("admin.analytics.ai_costs.cards.users_meta", "Users seen in current AI observability window")
      },
      {
        title: t("admin.analytics.ai_costs.cards.approx_eur", "Approx. AI cost"),
        value:
          loadingAiCosts
            ? t("admin.common.loading", "Loading...")
            : formatMoney(aiCosts?.summary?.approximate_cost_eur?.total || 0, "EUR", localeTag),
        meta: t(
          "admin.analytics.ai_costs.cards.approx_eur_meta",
          `Approximate provider-cost-equivalent over ${formatCount(aiCosts?.periodDays || 0, localeTag)} days`
        )
      }
    ],
    [aiCosts, loadingAiCosts, localeTag, t]
  );

  const aiCostAverageItems = useMemo(
    () => [
      {
        label: t("admin.analytics.ai_costs.avg.openai_input", "OpenAI input tokens / response"),
        value:
          loadingAiCosts || aiCosts?.summary?.averages?.openai_per_response?.input_tokens == null
            ? loadingAiCosts
              ? t("admin.common.loading", "Loading...")
              : "-"
            : formatPercent(aiCosts.summary.averages.openai_per_response.input_tokens, localeTag, 1)
      },
      {
        label: t("admin.analytics.ai_costs.avg.openai_output", "OpenAI output tokens / response"),
        value:
          loadingAiCosts || aiCosts?.summary?.averages?.openai_per_response?.output_tokens == null
            ? loadingAiCosts
              ? t("admin.common.loading", "Loading...")
              : "-"
            : formatPercent(aiCosts.summary.averages.openai_per_response.output_tokens, localeTag, 1)
      },
      {
        label: t("admin.analytics.ai_costs.avg.tts_chars", "TTS minutes / job"),
        value:
          loadingAiCosts || aiCosts?.summary?.averages?.tts_per_job?.duration_seconds == null
            ? loadingAiCosts
              ? t("admin.common.loading", "Loading...")
              : "-"
            : formatMinutes(aiCosts.summary.averages.tts_per_job.duration_seconds / 60, localeTag, 2)
      },
      {
        label: t("admin.analytics.ai_costs.avg.stt_tokens", "STT total tokens / job"),
        value:
          loadingAiCosts || aiCosts?.summary?.averages?.stt_per_job?.total_tokens == null
            ? loadingAiCosts
              ? t("admin.common.loading", "Loading...")
              : "-"
            : formatPercent(aiCosts.summary.averages.stt_per_job.total_tokens, localeTag, 1)
      },
      {
        label: t("admin.analytics.ai_costs.avg.stt_duration", "STT minutes / job"),
        value:
          loadingAiCosts || aiCosts?.summary?.averages?.stt_per_job?.duration_seconds == null
            ? loadingAiCosts
              ? t("admin.common.loading", "Loading...")
              : "-"
            : formatMinutes(aiCosts.summary.averages.stt_per_job.duration_seconds / 60, localeTag, 2)
      }
    ],
    [aiCosts, loadingAiCosts, localeTag, t]
  );

  const aiApproxCostItems = useMemo(
    () => {
      const approx = aiCosts?.summary?.approximate_cost_eur;
      const loadingLabel = t("admin.common.loading", "Loading...");
      return [
        {
          label: t("admin.analytics.ai_costs.approx.total", "Total"),
          value: loadingAiCosts ? loadingLabel : formatMoney(approx?.total || 0, "EUR", localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.approx.direct", "Direct"),
          value: loadingAiCosts ? loadingLabel : formatMoney(approx?.direct || 0, "EUR", localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.approx.estimated", "Estimated"),
          value: loadingAiCosts ? loadingLabel : formatMoney(approx?.estimated || 0, "EUR", localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.approx.openai", "Text"),
          value: loadingAiCosts ? loadingLabel : formatMoney(approx?.openai || 0, "EUR", localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.approx.rag", "RAG"),
          value: loadingAiCosts ? loadingLabel : formatMoney(approx?.rag || 0, "EUR", localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.approx.tts_stt", "TTS + STT"),
          value: loadingAiCosts ? loadingLabel : formatMoney((approx?.tts || 0) + (approx?.stt || 0), "EUR", localeTag)
        }
      ];
    },
    [aiCosts, loadingAiCosts, localeTag, t]
  );

  const aiCostBreakdownCards = useMemo(
    () => [
      {
        title: t("admin.analytics.ai_costs.breakdown.role", "By role"),
        items: (aiCosts?.breakdowns?.by_role || []).slice(0, 5).map(row => ({
          label: row.label || row.key || "-",
          value: formatCount(row.events || 0, localeTag)
        }))
      },
      {
        title: t("admin.analytics.ai_costs.breakdown.package", "By package"),
        items: (aiCosts?.breakdowns?.by_package || []).slice(0, 5).map(row => ({
          label: row.label || row.key || "-",
          value: formatCount(row.events || 0, localeTag)
        }))
      },
      {
        title: t("admin.analytics.ai_costs.breakdown.model", "By model"),
        items: (aiCosts?.breakdowns?.by_model || []).slice(0, 5).map(row => ({
          label: row.label || row.key || "-",
          value: formatCount(row.events || 0, localeTag)
        }))
      }
    ],
    [aiCosts, localeTag, t]
  );

  const aiAttributionItems = useMemo(
    () => {
      const completeness = aiCosts?.summary?.attribution_completeness;
      const loadingLabel = t("admin.common.loading", "Loading...");
      const totalEvents = completeness?.openai_usage_events || 0;
      const userIdPct = completeness?.pct_with_userId;
      const rolePct = completeness?.pct_with_role;
      const excludedRoutes = Array.isArray(completeness?.excluded_internal_routes)
        ? completeness.excluded_internal_routes.filter(Boolean).join(", ")
        : "";

      return [
        {
          label: t("admin.analytics.ai_costs.attribution.scope", "Scope"),
          value:
            loadingAiCosts
              ? loadingLabel
              : t("admin.analytics.ai_costs.attribution.scope_value", "User-facing standard text openai_usage")
        },
        {
          label: t("admin.analytics.ai_costs.attribution.events", "Included events"),
          value: loadingAiCosts ? loadingLabel : formatCount(totalEvents, localeTag)
        },
        {
          label: t("admin.analytics.ai_costs.attribution.user_id", "Rows with userId"),
          value:
            loadingAiCosts
              ? loadingLabel
              : userIdPct == null
                ? "-"
                : `${formatPercent(userIdPct, localeTag, 1)}% (${formatCount(completeness?.with_userId || 0, localeTag)})`
        },
        {
          label: t("admin.analytics.ai_costs.attribution.role", "Rows with role"),
          value:
            loadingAiCosts
              ? loadingLabel
              : rolePct == null
                ? "-"
                : `${formatPercent(rolePct, localeTag, 1)}% (${formatCount(completeness?.with_role || 0, localeTag)})`
        },
        {
          label: t("admin.analytics.ai_costs.attribution.excluded", "Excluded internal routes"),
          value: loadingAiCosts ? loadingLabel : excludedRoutes || "-"
        }
      ];
    },
    [aiCosts, loadingAiCosts, localeTag, t]
  );

  const aiThresholdCards = useMemo(
    () => [
      {
        title: t("admin.analytics.ai_costs.threshold.users_70", "Users >= 70%"),
        value:
          loadingAiCosts
            ? t("admin.common.loading", "Loading...")
            : formatCount(aiCosts?.summary?.threshold_counts?.users_at_or_above_70_pct || 0, localeTag)
      },
      {
        title: t("admin.analytics.ai_costs.threshold.users_85", "Users >= 85%"),
        value:
          loadingAiCosts
            ? t("admin.common.loading", "Loading...")
            : formatCount(aiCosts?.summary?.threshold_counts?.users_at_or_above_85_pct || 0, localeTag)
      },
      {
        title: t("admin.analytics.ai_costs.threshold.users_100", "Users >= 100%"),
        value:
          loadingAiCosts
            ? t("admin.common.loading", "Loading...")
            : formatCount(aiCosts?.summary?.threshold_counts?.users_at_or_above_100_pct || 0, localeTag)
      },
      {
        title: t("admin.analytics.ai_costs.threshold.packages_85", "Packages >= 85%"),
        value:
          loadingAiCosts
            ? t("admin.common.loading", "Loading...")
            : formatCount(aiCosts?.summary?.threshold_counts?.packages_at_or_above_85_pct || 0, localeTag)
      }
    ],
    [aiCosts, loadingAiCosts, localeTag, t]
  );

  const aiAdminGuideItems = useMemo(
    () => [
      {
        label: t("admin.analytics.ai_costs.guide.includes", "Included now"),
        value: "openai_usage, rag_cost_usage, tts_cost_usage, stt_cost_usage"
      },
      {
        label: t("admin.analytics.ai_costs.guide.units", "internal_usage_units"),
        value: "Normalized internal usage units for comparison and thresholding, not exact provider billing."
      },
      {
        label: t("admin.analytics.ai_costs.guide.approx_eur", "Approximate EUR"),
        value: "Approximate EUR is a provider-cost-equivalent management view. It helps product and pricing decisions, but it is still not invoice-grade billing."
      },
      {
        label: t("admin.analytics.ai_costs.guide.thresholds", "Thresholds"),
        value: "Normal <70%, warning >=70%, high >=85%, exceeded >=100%."
      },
      {
        label: t("admin.analytics.ai_costs.guide.breakdowns", "Breakdowns"),
        value: "Route/stage shows where usage happens, role/package shows who carries it, model shows which model family drives it."
      },
      {
        label: t("admin.analytics.ai_costs.guide.top", "Top users and features"),
        value: "Look for concentration, repeated heavy stages, and sharp differences between direct and estimated usage."
      },
      {
        label: t("admin.analytics.ai_costs.guide.coverage", "Coverage"),
        value: "Some usage is direct from provider responses, some is estimated. Treat this as an operational dashboard, not an invoice."
      },
      {
        label: t("admin.analytics.ai_costs.guide.actions", "Operational use"),
        value: "Before changing pricing or limits, check coverage, route/stage concentration, user/package threshold status, and whether heavy usage is expected."
      }
    ],
    [t]
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
      <div className={pageHeaderClassName} id="analytics-overview">
        <div className={pageHeaderSurfaceClassName}>
          <div className={pageHeaderMainClassName}>
            <BackButton
              onClick={() => router.push(localizePath("/#meist", locale))}
              ariaLabel={t("admin.common.back", "Back")}
              className={backButtonClassName}
            />
            <div className={pageHeaderTitleWrapClassName}>
              <div className={mobileTitleWrapClassName}>
                <h1 className={pageTitleClassName}>{t("admin.analytics.title", "Analytics")}</h1>
              </div>
              <div className={pageHeaderSubtitleClassName}>
                {t(
                  "admin.analytics.platform.subtitle",
                  "Overview of chat, help, collaboration, documents, payments and platform limits."
                )}
              </div>
            </div>
          </div>
          <div className={pageHeaderMetaRowClassName}>
            <div className={pageHeaderMetaClassName}>
              {headerStats.map(item => (
                <HeaderPill key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
            <div className={pageHeaderToolbarClassName}>
              <Button
                variant="primary"
                className={refreshButtonClassName}
                style={refreshButtonStyle}
                onClick={refreshAll}
                disabled={refreshing || loadingSummary || loadingEvents || loadingUsers || loadingAiCosts}
              >
                {refreshing ? t("admin.common.loading_data", "Loading...") : t("admin.common.refresh", "Refresh")}
              </Button>
            </div>
          </div>
          <div className={pageHeaderDividerClassName} />
          <div className={sectionNavClassName}>
            {sectionLinks.map(item => (
              <a key={item.href} href={item.href} className={sectionNavLinkClassName}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <SectionAlert tone="error" message={pageError} />

      <div className={summaryPanelClassName}>
        <div className={summaryPanelBodyClassName}>
          <div className={summaryDeckClassName}>
            <div className={topKpiGridClassName}>
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
            <MetricListCard title={t("admin.analytics.snapshot.title", "Live snapshot")} items={liveSnapshotItems} />
          </div>
        </div>
      </div>

      <div className={summaryPanelClassName}>
        <div className={summaryPanelBodyClassName}>
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
        </div>
      </div>

      <div className={cardClassName} id="analytics-platform">
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.platform.title", "Platform overview")}</CardTitle>
            </div>
          </div>
          <div className={platformGridClassName}>
            {platformCards.map(card => (
              <MetricListCard key={card.title} title={card.title} items={card.items} />
            ))}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-framework-acceptances">
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.framework_acceptances.title", "Framework acceptances")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.framework_acceptances.subtitle", "Recent professional-use acceptance records saved during registration.")}
              </div>
            </div>
          </div>
          <div className={docsGridClassName}>
            <KpiCard
              title={t("admin.analytics.framework_acceptances.total", "Total")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.documents?.frameworkAcceptances?.total || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.framework_acceptances.accepted_30d", "Accepted (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.documents?.frameworkAcceptances?.accepted30d || 0, localeTag)}
            />
            <KpiCard
              title={t("admin.analytics.framework_acceptances.signed_30d", "Signed download recorded (30d)")}
              value={loadingSummary ? t("admin.common.loading", "Loading...") : formatCount(summary?.documents?.frameworkAcceptances?.signedDownloaded30d || 0, localeTag)}
            />
          </div>
          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.table.time", "Time")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.user", "User")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.role", "Role")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.framework_acceptances.version", "Version")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.framework_acceptances.signed", "Signed download")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.framework_acceptances.document", "Document")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSummary ? (
                    <tr>
                      <td className={tableCellClassName} colSpan={6}>
                        {t("admin.common.loading_data", "Loading...")}
                      </td>
                    </tr>
                  ) : (summary?.documents?.frameworkAcceptances?.recent || []).length ? (
                    summary.documents.frameworkAcceptances.recent.map((row) => (
                      <tr key={row.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>{formatDate(row.acceptedAt, localeTag)}</td>
                        <td className={tableCellClassName}>{row.user?.email || "-"}</td>
                        <td className={tableCellClassName}>{getRoleLabel(row.roleAtAcceptance, false)}</td>
                        <td className={tableCellClassName}>{row.frameworkVersion || "-"}</td>
                        <td className={tableCellClassName}>{row.signedDocumentDownloadedAt ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}</td>
                        <td className={tableCellClassName}>{row.document?.title || "-"}</td>
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
          <div className={mobileListClassName}>
            {loadingSummary ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (summary?.documents?.frameworkAcceptances?.recent || []).length ? (
              summary.documents.frameworkAcceptances.recent.map((row) => (
                <div key={row.id} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>{row.user?.email || "-"}</div>
                      <div className={mobileRowSubClassName}>{formatDate(row.acceptedAt, localeTag)}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{row.frameworkVersion || "-"}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField label={t("admin.analytics.users.table.role", "Role")} value={getRoleLabel(row.roleAtAcceptance, false)} />
                    <MobileInfoField label={t("admin.analytics.framework_acceptances.signed", "Signed download")} value={row.signedDocumentDownloadedAt ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")} />
                  </div>
                  <MobileInfoField label={t("admin.analytics.framework_acceptances.document", "Document")} value={row.document?.title || "-"} />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.table.empty", "No records found.")}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-rag-docs">
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.rag_docs.title", "RAG documents")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.rag_docs.subtitle", "Overview of indexing and recent additions.")}
              </div>
            </div>
          </div>
          <div className={docsGridClassName}>
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
          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
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
          <div className={mobileListClassName}>
            {loadingSummary ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (summary?.ragDocs?.recent || []).length ? (
              summary.ragDocs.recent.map(doc => (
                <div key={doc.id} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>{doc.title || t("admin.analytics.table.untitled", "(untitled)")}</div>
                      <div className={mobileRowSubClassName}>{formatDate(doc.insertedAt || doc.createdAt, localeTag)}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{statusLabels[doc.status] || doc.status || "-"}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField label={t("admin.analytics.table.type", "Type")} value={doc.type || "-"} />
                    <MobileInfoField
                      label={t("admin.analytics.table.audience", "Audience")}
                      value={audienceLabels[doc.audience] || doc.audience || "-"}
                    />
                  </div>
                  <MobileInfoField
                    label={t("admin.analytics.table.source", "Source")}
                    value={(doc.sourceUrl || doc.fileName || "-").toString().slice(0, 140)}
                  />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.table.empty", "No records found.")}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-billing">
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

          <div className={billingSummaryGridClassName}>
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

          <div className={billingPipelineGridClassName}>
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

          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
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
          <div className={mobileListClassName}>
            {loadingSummary ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (summary?.billing?.recentPayments || []).length ? (
              summary.billing.recentPayments.map(payment => (
                <div key={payment.id} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>
                        {formatMoney(payment.amount || 0, payment.currency || "EUR", localeTag)}
                      </div>
                      <div className={mobileRowSubClassName}>{formatDate(payment.createdAt, localeTag)}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{payment.status || "-"}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField
                      label={t("admin.analytics.billing.table.provider", "Provider")}
                      value={payment.provider || "-"}
                    />
                    <MobileInfoField
                      label={t("admin.analytics.billing.table.paid_at", "Paid at")}
                      value={payment.paidAt ? formatDate(payment.paidAt, localeTag) : "-"}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.billing.table.empty", "No records found.")}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-users">
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

          <div className={usersSummaryGridClassName}>
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
            <Button variant="primary" className={actionButtonClassName} type="submit" disabled={loadingUsers}>
              {t("admin.common.refresh", "Search")}
            </Button>
            <Button
              variant="ghost"
              className={actionButtonClassName}
              type="button"
              onClick={handleUsersSearchClear}
              disabled={loadingUsers}
            >
              {t("buttons.cancel", "Clear")}
            </Button>
          </form>

          <div className={usersSelectBarClassName}>
            <div className="grid min-w-0 gap-2 2xl:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] 2xl:items-end">
              <div className="grid min-w-0 gap-2 2xl:max-w-[18rem]">
                <label className={cellSubClassName} htmlFor="analytics-bulk-email-target">
                  {t("admin.analytics.users.actions.email_target", "Email target")}
                </label>
                <DocumentsDropdown
                  className={compactDropdownClassName}
                  id="analytics-bulk-email-target"
                  value={emailTarget}
                  onChange={nextValue => setEmailTarget(nextValue === "all" ? "all" : "selected")}
                  options={emailTargetOptions}
                  ariaLabel={t("admin.analytics.users.actions.email_target", "Email target")}
                  disabled={sendingUsersEmail || deletingUsers}
                />
              </div>
              <div className={`${usersSelectActionsClassName} 2xl:justify-end`}>
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
          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>
                      <input
                        type="checkbox"
                        className={checkboxClassName}
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
                            className={checkboxClassName}
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
                            {formatMinutes(row?.usage?.sttMinutes || 0, localeTag, 2)}
                          </div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.users.usage.tts", "TTS")}: {formatCount(row?.usage?.ttsRequests || 0, localeTag)} /{" "}
                            {formatMinutes(row?.usage?.ttsMinutes || 0, localeTag, 2)}
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
          </div>
          <div className={mobileListClassName}>
            {loadingUsers ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : visibleUserRows.length ? (
              visibleUserRows.map(row => (
                <div key={row.userId} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={selectedUserIds.includes(row.userId)}
                        onChange={() => toggleUserSelection(row.userId)}
                        aria-label={t(
                          "admin.analytics.users.actions.select_user",
                          { user: row.email || row.userId },
                          "Select user {user}"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className={mobileRowTitleClassName}>{row.email || row.userId}</div>
                        <div className={mobileRowSubClassName}>{row.userId}</div>
                      </div>
                    </div>
                    <span className={usersSelectCountClassName}>{getRoleLabel(row.role, row.isAdmin)}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                  <MobileInfoField
                    label={t("admin.analytics.users.table.subscription", "Subscription")}
                    value={
                        <>
                          <div className={compactMetricLeadValueClassName}>{row?.subscription?.status || "-"}</div>
                          <div className={cellSubClassName}>
                            {row?.subscription?.isActive
                              ? t("admin.analytics.users.active", "Active")
                              : t("admin.analytics.users.inactive", "Inactive")}
                          </div>
                          <div className={cellSubClassName}>{row?.subscription?.plan || "-"}</div>
                        </>
                      }
                    />
                    <MobileInfoField
                      label={t("admin.analytics.users.table.paid_30d", "Paid (30d)")}
                      value={formatMoney(row?.paidAmount30dEur || 0, "EUR", localeTag)}
                    />
                  </div>
                  <MobileInfoField
                    label={t("admin.analytics.users.table.usage_30d", "Usage (30d)")}
                    value={
                      <CompactMetricGrid
                        items={[
                          {
                            label: t("admin.analytics.users.usage.chat", "Chat"),
                            value: formatCount(row?.usage?.chatRequests || 0, localeTag)
                          },
                          {
                            label: t("admin.analytics.users.usage.rag", "RAG"),
                            value: formatCount(row?.usage?.ragSearches || 0, localeTag)
                          },
                          {
                            label: t("admin.analytics.users.usage.stt", "STT"),
                            value: `${formatCount(row?.usage?.sttRequests || 0, localeTag)} / ${formatMinutes(row?.usage?.sttMinutes || 0, localeTag, 2)}`
                          },
                          {
                            label: t("admin.analytics.users.usage.tts", "TTS"),
                            value: `${formatCount(row?.usage?.ttsRequests || 0, localeTag)} / ${formatMinutes(row?.usage?.ttsMinutes || 0, localeTag, 2)}`
                          },
                          {
                            label: t("admin.analytics.users.usage.analyze", "Analyses (30d)"),
                            value: formatCount(row?.usage?.analyses30d || 0, localeTag)
                          },
                          {
                            label: t("admin.analytics.users.usage.analyze_today", "Analyses today"),
                            value: formatCount(row?.usage?.analysesToday || 0, localeTag)
                          }
                        ]}
                      />
                    }
                  />
                  <MobileInfoField
                    label={t("admin.analytics.users.table.cost_30d", "Cost estimate (30d)")}
                    value={
                      <>
                        <div className={compactMetricLeadValueClassName}>{formatMoney(row?.costs?.totalEur || 0, "EUR", localeTag)}</div>
                        <CompactMetricGrid
                          className="mt-1"
                          items={[
                            {
                              label: t("admin.analytics.users.usage.chat", "Chat"),
                              value: formatMoney(row?.costs?.chatEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.usage.rag", "RAG"),
                              value: formatMoney(row?.costs?.ragEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.usage.stt", "STT"),
                              value: formatMoney(row?.costs?.sttEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.usage.tts", "TTS"),
                              value: formatMoney(row?.costs?.ttsEur || 0, "EUR", localeTag)
                            }
                          ]}
                        />
                      </>
                    }
                  />
                  <MobileInfoField
                    label={t("admin.analytics.users.table.limits", "Limits")}
                    value={
                      <div className="grid gap-2">
                        <CompactMetricGrid
                          items={[
                            {
                              label: t("admin.analytics.users.limits.plan_amount", "Monthly fee"),
                              value: row.isAdmin ? "-" : formatMoney(row?.limits?.planAmountEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.limits.analyze_daily", "Analyze/day"),
                              value: formatCount(row?.limits?.analyzeDaily || 0, localeTag)
                            },
                            {
                              label: t("admin.analytics.users.limits.analyze_usage_today", "Used today"),
                              value: formatCount(row?.limits?.analyzeToday || 0, localeTag)
                            },
                            {
                              label: t("admin.analytics.users.limits.analyze_remaining", "Remaining today"),
                              value: formatCount(row?.limits?.analyzeRemainingToday || 0, localeTag)
                            }
                          ]}
                        />
                        <UsageBar value={row?.limits?.analyzeUtilizationPct || 0} />
                        <CompactMetricGrid
                          items={[
                            {
                              label: t("admin.analytics.users.limits.monthly_budget", "Monthly budget"),
                              value: formatMoney(row?.budget?.monthlyEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.limits.remaining_budget", "Remaining budget"),
                              value: formatMoney(row?.budget?.remainingEur || 0, "EUR", localeTag)
                            },
                            {
                              label: t("admin.analytics.users.limits.utilization", "Utilization"),
                              value: `${formatPercent(row?.budget?.utilizationPct || 0, localeTag, 1)}%`
                            }
                          ]}
                        />
                        <UsageBar value={row?.budget?.utilizationPct || 0} />
                      </div>
                    }
                  />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.users.table.empty", "No users found.")}</div>
            )}
          </div>

          <div className={cellSubClassName}>
            {t(
              "admin.analytics.users.note",
              {
                chat: toNumber(usersAnalytics?.costModel?.chatRequestEur || 0).toFixed(4),
                rag: toNumber(usersAnalytics?.costModel?.ragSearchEur || 0).toFixed(4),
                stt: toNumber(usersAnalytics?.costModel?.sttPerMinuteEur || 0).toFixed(4),
                tts: toNumber(usersAnalytics?.costModel?.ttsPerMinuteEur || 0).toFixed(4),
                budget: toNumber(usersAnalytics?.costModel?.monthlyBudgetEur || 0).toFixed(2),
                budgetClient: toNumber(usersAnalytics?.costModel?.monthlyBudgetClientEur || 0).toFixed(2),
                budgetWorker: toNumber(usersAnalytics?.costModel?.monthlyBudgetWorkerEur || 0).toFixed(2)
              },
              "Cost model note."
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-ai-costs">
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.ai_costs.title", "AI Cost Activity")}</CardTitle>
              <div className={sectionSubClassName}>
                {t(
                  "admin.analytics.ai_costs.subtitle",
                  "ChatLog-based OpenAI, RAG, TTS and STT observability."
                )}
              </div>
            </div>
          </div>

          <SectionAlert
            tone="info"
            message={
              aiCosts?.coverage?.note ||
              "RAG/embedding cost is not yet included because rag_cost_usage has not been mirrored into ChatLog yet."
            }
          />

          <SectionAlert
            tone="info"
            message={
              aiCosts?.unit_model
                ? `${aiCosts.unit_model.version}: ${aiCosts.unit_model.note}`
                : "v2: internal_usage_units are normalized internal analytics units for budget tracking. They are not exact provider billing."
            }
          />

          <MetricListCard title={t("admin.analytics.ai_costs.guide.title", "How to read this")} items={aiAdminGuideItems} />

          <div className={usersSummaryGridClassName}>
            {aiCostCards.map(card => (
              <KpiCard key={card.title} title={card.title} value={card.value} meta={card.meta} />
            ))}
          </div>

          <div className={usersSummaryGridClassName}>
            {aiThresholdCards.map(card => (
              <KpiCard key={card.title} title={card.title} value={card.value} />
            ))}
          </div>

          <div className={platformGridClassName}>
            <MetricListCard title={t("admin.analytics.ai_costs.average_usage", "Average usage")} items={aiCostAverageItems} />
            <MetricListCard title={t("admin.analytics.ai_costs.approx.title", "Approximate EUR view")} items={aiApproxCostItems} />
            <MetricListCard title={t("admin.analytics.ai_costs.attribution.title", "Attribution completeness")} items={aiAttributionItems} />
            {aiCostBreakdownCards.map(card => (
              <MetricListCard
                key={card.title}
                title={card.title}
                items={
                  card.items.length
                    ? card.items
                    : [
                        {
                          label: t("admin.analytics.table.empty", "No records found."),
                          value: "-"
                        }
                      ]
                }
              />
            ))}
          </div>

          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.features.route", "Route")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.features.stage", "Stage")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.units", "Internal usage units")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.features.events", "Events")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.features.direct", "Direct")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.features.estimated", "Estimated")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.coverage.label", "Coverage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAiCosts ? (
                    <tr>
                      <td className={tableCellClassName} colSpan={7}>
                        {t("admin.common.loading_data", "Loading...")}
                      </td>
                    </tr>
                  ) : (aiCosts?.top_features || []).length ? (
                    aiCosts.top_features.map(row => (
                      <tr key={`${row.route}-${row.stage}`} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>{row.route || "-"}</td>
                        <td className={tableCellClassName}>{row.stage || "-"}</td>
                        <td className={tableCellClassName}>{formatPercent(row.internal_usage_units || 0, localeTag, 1)}</td>
                        <td className={tableCellClassName}>{formatCount(row.events || 0, localeTag)}</td>
                        <td className={tableCellClassName}>{formatCount(row.direct_usage_events || 0, localeTag)}</td>
                        <td className={tableCellClassName}>{formatCount(row.estimated_usage_events || 0, localeTag)}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>
                          {getCoverageLabel(row.coverage_complete)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={tableCellClassName} colSpan={7}>
                        {t("admin.analytics.table.empty", "No records found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={mobileListClassName}>
            {loadingAiCosts ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (aiCosts?.top_features || []).length ? (
              aiCosts.top_features.map(row => (
                <div key={`${row.route}-${row.stage}`} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>{row.route || "-"}</div>
                      <div className={mobileRowSubClassName}>{row.stage || "-"}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{formatCount(row.events || 0, localeTag)}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.units", "Internal usage units")}
                      value={formatPercent(row.internal_usage_units || 0, localeTag, 1)}
                    />
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.features.direct", "Direct")}
                      value={formatCount(row.direct_usage_events || 0, localeTag)}
                    />
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.features.estimated", "Estimated")}
                      value={formatCount(row.estimated_usage_events || 0, localeTag)}
                    />
                  </div>
                  <MobileInfoField
                    label={t("admin.analytics.ai_costs.coverage.label", "Coverage")}
                    value={getCoverageLabel(row.coverage_complete)}
                  />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.table.empty", "No records found.")}</div>
            )}
          </div>

          <div className={tableHeaderClassName}>
            <div className={sectionSubClassName}>
              {t("admin.analytics.ai_costs.users_title", "User budget tracking")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.user", "User")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.users.table.role", "Role")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.package", "Package")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.units", "Internal usage units")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.budget_units", "Budget units / month")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.utilization", "Utilization")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.threshold.label", "Threshold")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.coverage.label", "Coverage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAiCosts ? (
                    <tr>
                      <td className={tableCellClassName} colSpan={8}>
                        {t("admin.common.loading_data", "Loading...")}
                      </td>
                    </tr>
                  ) : (aiCosts?.top_users || []).length ? (
                    aiCosts.top_users.map(row => (
                      <tr key={row.user_id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>
                          <div>{row.email || row.user_id || "-"}</div>
                          <div className={cellSubClassName}>{row.user_id || "-"}</div>
                        </td>
                        <td className={tableCellClassName}>{getRoleLabel(row.role, false)}</td>
                        <td className={tableCellClassName}>{row.package || "-"}</td>
                        <td className={tableCellClassName}>
                          <div>{formatPercent(row.internal_usage_units || 0, localeTag, 1)}</div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.approx.short", "Approx.")}:{" "}
                            {formatMoney(row.approximate_cost_eur || 0, "EUR", localeTag)}
                          </div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.features.direct", "Direct")}:{" "}
                            {formatPercent(row.internal_usage_units_direct || 0, localeTag, 1)}
                          </div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.features.estimated", "Estimated")}:{" "}
                            {formatPercent(row.internal_usage_units_estimated || 0, localeTag, 1)}
                          </div>
                        </td>
                        <td className={tableCellClassName}>{formatPercent(row.budget_units_monthly || 0, localeTag, 1)}</td>
                        <td className={tableCellClassName}>{`${formatPercent(row.utilization_pct || 0, localeTag, 1)}%`}</td>
                        <td className={tableCellClassName}>{getThresholdLabel(row.threshold_state)}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>
                          <div>{getCoverageLabel(row.coverage_complete)}</div>
                          <div className={cellSubClassName}>{row.coverage_note || "-"}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={tableCellClassName} colSpan={8}>
                        {t("admin.analytics.table.empty", "No records found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={mobileListClassName}>
            {loadingAiCosts ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (aiCosts?.top_users || []).length ? (
              aiCosts.top_users.map(row => (
                <div key={row.user_id} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>{row.email || row.user_id || "-"}</div>
                      <div className={mobileRowSubClassName}>{row.user_id || "-"}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{getThresholdLabel(row.threshold_state)}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField label={t("admin.analytics.users.table.role", "Role")} value={getRoleLabel(row.role, false)} />
                    <MobileInfoField label={t("admin.analytics.ai_costs.package", "Package")} value={row.package || "-"} />
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.units", "Internal usage units")}
                      value={
                        <>
                          <div>{formatPercent(row.internal_usage_units || 0, localeTag, 1)}</div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.approx.short", "Approx.")}:{" "}
                            {formatMoney(row.approximate_cost_eur || 0, "EUR", localeTag)}
                          </div>
                        </>
                      }
                    />
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.budget_units", "Budget units / month")}
                      value={formatPercent(row.budget_units_monthly || 0, localeTag, 1)}
                    />
                  </div>
                  <MobileInfoField
                    label={t("admin.analytics.ai_costs.utilization", "Utilization")}
                    value={`${formatPercent(row.utilization_pct || 0, localeTag, 1)}%`}
                  />
                  <MobileInfoField
                    label={t("admin.analytics.ai_costs.coverage.label", "Coverage")}
                    value={`${getCoverageLabel(row.coverage_complete)}${row.coverage_note ? ` | ${row.coverage_note}` : ""}`}
                  />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.table.empty", "No records found.")}</div>
            )}
          </div>

          <div className={tableHeaderClassName}>
            <div className={sectionSubClassName}>
              {t("admin.analytics.ai_costs.packages_title", "Package budget tracking")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
            <div className={tableWrapClassName}>
              <table className={tableClassName}>
                <thead>
                  <tr>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.package", "Package")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.package_users", "Users")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.units", "Internal usage units")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.budget_units", "Budget units / month")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.utilization", "Utilization")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.threshold.label", "Threshold")}</th>
                    <th className={tableHeadCellClassName}>{t("admin.analytics.ai_costs.coverage.label", "Coverage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAiCosts ? (
                    <tr>
                      <td className={tableCellClassName} colSpan={7}>
                        {t("admin.common.loading_data", "Loading...")}
                      </td>
                    </tr>
                  ) : (aiCosts?.package_budget_tracking || []).length ? (
                    aiCosts.package_budget_tracking.map(row => (
                      <tr key={row.package} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>{row.package || "-"}</td>
                        <td className={tableCellClassName}>{formatCount(row.users || 0, localeTag)}</td>
                        <td className={tableCellClassName}>
                          <div>{formatPercent(row.internal_usage_units || 0, localeTag, 1)}</div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.approx.short", "Approx.")}:{" "}
                            {formatMoney(row.approximate_cost_eur || 0, "EUR", localeTag)}
                          </div>
                        </td>
                        <td className={tableCellClassName}>{formatPercent(row.budget_units_monthly || 0, localeTag, 1)}</td>
                        <td className={tableCellClassName}>{`${formatPercent(row.utilization_pct || 0, localeTag, 1)}%`}</td>
                        <td className={tableCellClassName}>{getThresholdLabel(row.threshold_state)}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>
                          <div>{getCoverageLabel(row.coverage_complete)}</div>
                          <div className={cellSubClassName}>{row.coverage_note || "-"}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={tableCellClassName} colSpan={7}>
                        {t("admin.analytics.table.empty", "No records found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={mobileListClassName}>
            {loadingAiCosts ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : (aiCosts?.package_budget_tracking || []).length ? (
              aiCosts.package_budget_tracking.map(row => (
                <div key={row.package} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div>
                      <div className={mobileRowTitleClassName}>{row.package || "-"}</div>
                      <div className={mobileRowSubClassName}>
                        {t("admin.analytics.ai_costs.package_users", "Users")}: {formatCount(row.users || 0, localeTag)}
                      </div>
                    </div>
                    <span className={usersSelectCountClassName}>{getThresholdLabel(row.threshold_state)}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.units", "Internal usage units")}
                      value={
                        <>
                          <div>{formatPercent(row.internal_usage_units || 0, localeTag, 1)}</div>
                          <div className={cellSubClassName}>
                            {t("admin.analytics.ai_costs.approx.short", "Approx.")}:{" "}
                            {formatMoney(row.approximate_cost_eur || 0, "EUR", localeTag)}
                          </div>
                        </>
                      }
                    />
                    <MobileInfoField
                      label={t("admin.analytics.ai_costs.budget_units", "Budget units / month")}
                      value={formatPercent(row.budget_units_monthly || 0, localeTag, 1)}
                    />
                  </div>
                  <MobileInfoField
                    label={t("admin.analytics.ai_costs.utilization", "Utilization")}
                    value={`${formatPercent(row.utilization_pct || 0, localeTag, 1)}%`}
                  />
                  <MobileInfoField
                    label={t("admin.analytics.ai_costs.coverage.label", "Coverage")}
                    value={`${getCoverageLabel(row.coverage_complete)}${row.coverage_note ? ` | ${row.coverage_note}` : ""}`}
                  />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.table.empty", "No records found.")}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName} id="analytics-logs">
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>{t("admin.analytics.logs.title", "Logs")}</CardTitle>
              <div className={sectionSubClassName}>
                {t("admin.analytics.logs.subtitle", "Latest events with filters.")}
              </div>
            </div>
          </div>

          <div className={logsToolbarClassName}>
            <DocumentsDropdown
              className={dropdownClassName}
              value={eventFilter}
              onChange={setEventFilter}
              options={eventFilterOptions}
              ariaLabel={t("admin.analytics.logs.filter.all_events", "All events")}
            />
            <DocumentsDropdown
              className={compactDropdownClassName}
              value={isCrisisFilter}
              onChange={setIsCrisisFilter}
              options={crisisFilterOptions}
              ariaLabel={t("admin.analytics.logs.filter.crisis_all", "Crisis: all")}
            />
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

          <div className={tableHeaderClassName}>
            <div className={tableScrollHintClassName}>
              {t("admin.common.table_scroll_hint", "Scroll sideways on smaller screens to see all columns.")}
            </div>
          </div>
          <div className={tableDesktopWrapClassName}>
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
          <div className={mobileListClassName}>
            {loadingEvents ? (
              <div className={mobileRowCardClassName}>{t("admin.common.loading_data", "Loading...")}</div>
            ) : events.length ? (
              events.map(row => (
                <div key={row.id} className={mobileRowCardClassName}>
                  <div className={mobileRowHeadClassName}>
                    <div className="min-w-0 flex-1">
                      <div className={mobileRowTitleClassName}>{eventLabels[row.event] || row.event || "-"}</div>
                      <div className={mobileRowSubClassName}>{formatDate(row.createdAt, localeTag)}</div>
                    </div>
                    <span className={usersSelectCountClassName}>{getRoleLabel(row.role, false)}</span>
                  </div>
                  <div className={mobileFieldGridClassName}>
                    <MobileInfoField
                      label={t("admin.analytics.logs.table.crisis", "Crisis")}
                      value={row?.data?.isCrisis ? t("admin.common.yes", "Yes") : t("admin.common.no", "No")}
                    />
                  </div>
                  <MobileInfoField label={t("admin.analytics.logs.table.meta", "Meta")} value={summarizeEventMeta(row?.data)} />
                </div>
              ))
            ) : (
              <div className={mobileRowCardClassName}>{t("admin.analytics.logs.table.empty", "No records found.")}</div>
            )}
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
