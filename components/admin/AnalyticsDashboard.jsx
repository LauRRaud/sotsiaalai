"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import BackIcon from "@/components/ui/icons/BackIcon";

const pageClassName = "flex flex-col gap-5 text-[color:var(--admin-text)] [--rag-text:var(--admin-text)]";
const cardClassName = "relative overflow-hidden rounded-[18px] border border-[color:var(--admin-border)] bg-[linear-gradient(160deg,var(--admin-surface),var(--admin-surface-2))] p-4 shadow-[var(--admin-shadow-soft)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[18px] before:bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.08),transparent_45%)] before:opacity-60";
const cardBodyClassName = "relative z-[1] grid gap-1.5";
const kpiGridClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-3";
const kpiValueClassName = "text-[1.6rem] font-[700] text-[color:var(--admin-text)]";
const kpiMetaClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
const sectionHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const sectionSubClassName = "text-[0.95rem] text-[color:var(--admin-muted)] max-w-[56ch]";
const barClassName = "flex h-2 overflow-hidden rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)]";
const tableWrapClassName = "overflow-x-auto rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]";
const tableClassName = "w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName = "border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-1.5 text-left text-[0.82rem] uppercase tracking-[0.02em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-2 py-1.5 text-left text-[0.9rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const toolbarClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2.5 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-3 shadow-[var(--admin-shadow-soft)]";
const selectClassName = "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const alertErrorClassName = "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertInfoClassName = "rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color-mix(in_srgb,var(--admin-accent-cool)_15%,var(--admin-surface-2)_85%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertWarnClassName = "rounded-[12px] border border-[color:var(--admin-warning,#f59e0b)] bg-[color-mix(in_srgb,var(--admin-warning,#f59e0b)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
const alertCriticalClassName = "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_18%,var(--admin-surface-2)_82%)] px-3 py-2 text-[color:var(--admin-text)]";
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
const backButtonClassName = "inline-flex h-[5.2rem] w-[5.2rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.12] focus-visible:outline-none active:scale-[0.98]";

const EVENT_OPTIONS = [
  { value: "chat_request", labelKey: "admin.analytics.events.chat_request" },
  { value: "rag_search", labelKey: "admin.analytics.events.rag_search" },
  { value: "no_context", labelKey: "admin.analytics.events.no_context" },
  { value: "crisis_detected", labelKey: "admin.analytics.events.crisis_detected" },
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
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [isCrisisFilter, setIsCrisisFilter] = useState("all");
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);

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

  return (
    <div className={pageClassName}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="grid gap-1.5 justify-items-center">
          <h1 className="m-0 text-[2rem] font-[650] tracking-[0.02em] text-[color:var(--admin-text)]">{tr("admin.analytics.title")}</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button
            variant="primary"
            className={refreshButtonClassName}
            style={refreshButtonStyle}
            onClick={refresh}
            disabled={loadingSummary || loadingEvents}
          >
            {loadingSummary || loadingEvents ? loadingLabel : tr("admin.common.refresh")}
          </Button>
        </div>
      </div>

      {error ? <div className={alertErrorClassName}>{error}</div> : null}

      <div className={kpiGridClassName}>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>{tr("admin.analytics.kpis.requests_30d.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.totalRequests ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>{tr("admin.analytics.kpis.requests_30d.meta")}</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
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
          <div className={`${cardBodyClassName} min-h-[118px]`}>
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
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>{tr("admin.analytics.kpis.crisis.title")}</CardTitle>
            <div className={kpiValueClassName}>{loadingSummary ? loadingLabel : formatCount(summary?.totalCrisis ?? 0, localeTag)}</div>
            <div className={kpiMetaClassName}>{tr("admin.analytics.kpis.crisis.meta")}</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
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
          <div className={`${cardBodyClassName} min-h-[118px]`}>
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
              <CardTitle>{tr("admin.analytics.rag_docs.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.rag_docs.subtitle")}</div>
            </div>
          </div>
          <div className={`${kpiGridClassName} mt-3`}>
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

          <div className={`${tableWrapClassName} mt-3.5`}>
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
          <div className="mt-3 grid gap-2">
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
          <div className={`${kpiGridClassName} mt-3`}>
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

          <div className={`${tableWrapClassName} mt-3.5`}>
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
              <CardTitle>{tr("admin.analytics.logs.title")}</CardTitle>
              <div className={sectionSubClassName}>{tr("admin.analytics.logs.subtitle")}</div>
            </div>
          </div>
          <div className={`${toolbarClassName} mt-2`}>
            <select className={selectClassName} value={eventFilter} onChange={event => setEventFilter(event.target.value)}>
              <option value="all">{tr("admin.analytics.logs.filter.all_events")}</option>
              {EVENT_OPTIONS.map(event => (
                <option key={event.value} value={event.value}>
                  {eventLabels[event.value] || event.value}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={isCrisisFilter} onChange={event => setIsCrisisFilter(event.target.value)}>
              <option value="all">{tr("admin.analytics.logs.filter.crisis_all")}</option>
              <option value="true">{tr("admin.analytics.logs.filter.crisis_yes")}</option>
              <option value="false">{tr("admin.analytics.logs.filter.crisis_no")}</option>
            </select>
          </div>

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
