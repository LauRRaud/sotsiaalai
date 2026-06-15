"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import {
  ragAdminShellCardClassName,
  ragAdminShellSubtitleClassName,
  ragAdminShellTitleClassName
} from "@/components/admin/rag/ragAdminShellStyles";

const inputClassName =
  "min-h-[2.45rem] rounded-[0.72rem] border border-[color:var(--documents-card-border,rgba(255,255,255,0.16))] bg-[rgba(0,0,0,0.18)] px-3 text-[0.95rem] text-[color:var(--documents-page-text)] outline-none focus:border-[color:var(--title-color,var(--brand-primary))]";

const copy = {
  title: "KOV piloodi koondvaade",
  privacy:
    "Koondvaade ei kuva üksiktöötajate vastuseid, vabatekste, kliendiandmeid ega väikese grupi detaile. Detailid avatakse ainult siis, kui miinimumgrupi lävi on täidetud.",
  viewContext: "Mida vaatan",
  scope: "Skoop",
  period: "Periood",
  decisionSummary: "Otsustaja kokkuvõte",
  primaryRecommendation: "Esimene kokkulepe",
  decisionFocus: "Arutelu fookus",
  pilotScope: "Piloot",
  roleGroup: "Rolligrupp",
  workflowType: "Töövoog",
  periodStart: "Algus",
  periodEnd: "Lõpp",
  aggregationLevel: "Tase",
  refresh: "Värskenda",
  csv: "CSV",
  sampleSize: "Valim",
  recordCount: "Kirjeid",
  minimumGroupSize: "Miinimumgrupp",
  status: "Staatus",
  suppressed: "Summutatud",
  open: "Avatud",
  suppressedNotice:
    "Andmed on summutatud, sest valim on alla miinimumgrupi. Väikese tiimi tulemusi ei kuvata äratuntaval kujul.",
  metrics: "Mõõdikud",
  rows: "rida",
  metric: "Metric",
  value: "Väärtus",
  noMetrics:
    "Mõõdikuid ei kuvata. Kui valim on alla miinimumgrupi, jäävad detailid privaatsuse tõttu peidetuks.",
  report: "Piloodi aruanne",
  print: "Prindivaade",
  xlsx: "XLSX",
  signalLoad: "Signaalikoormus",
  priorities: "Töökorralduslikud prioriteedid",
  agreements: "Soovitatavad kokkulepped",
  noPriorities: "Prioriteete ei kuvata enne, kui miinimumgrupi lävi on täidetud.",
  noAgreements: "Soovitatavad kokkulepped tekivad korduvate koormusmustrite põhjal.",
  redSignals: "Punased",
  yellowSignals: "Kollased",
  greenSignals: "Rohelised"
};

const aggregationLevelOptions = ["role_group", "organization", "municipality"];

function metricLabel(metricKey) {
  return String(metricKey || "")
    .replaceAll("_", " ")
    .replaceAll(".", " / ");
}

function formatMetricValue(metric) {
  const value = Number(metric?.metricValue || 0);
  if (String(metric?.metricKey || "").endsWith(".share")) {
    return `${Math.round(value * 1000) / 10}%`;
  }
  return String(value);
}

function buildPilotAggregateUrl({ pilotId, roleGroup, workflowType, periodStart, periodEnd, aggregationLevel, format }) {
  const params = new URLSearchParams();
  if (pilotId) params.set("pilotId", pilotId);
  if (roleGroup) params.set("roleGroup", roleGroup);
  if (workflowType) params.set("workflowType", workflowType);
  if (periodStart) params.set("periodStart", periodStart);
  if (periodEnd) params.set("periodEnd", periodEnd);
  if (aggregationLevel) params.set("aggregationLevel", aggregationLevel);
  if (format) params.set("format", format);
  return `/api/wellbeing/pilot/aggregate${params.size ? `?${params.toString()}` : ""}`;
}

function periodLabel(periodStart, periodEnd) {
  if (periodStart && periodEnd) return `${periodStart} kuni ${periodEnd}`;
  if (periodStart) return `alates ${periodStart}`;
  if (periodEnd) return `kuni ${periodEnd}`;
  return "Kõik piloodi andmed";
}

function scopeMeta(scope) {
  if (!scope) return "Admini vabafilter";
  if (scope.municipalityId) return `KOV: ${scope.municipalityId}`;
  if (scope.organizationId) return `Organisatsioon: ${scope.organizationId}`;
  return scope.scopeType || "role_group";
}

export default function WellbeingPilotClient({ allowedRoleGroups = [], pilotScopes = [], isAdmin = false }) {
  const normalizedPilotScopes = useMemo(() => (
    Array.isArray(pilotScopes) ? pilotScopes.filter((scope) => scope?.id) : []
  ), [pilotScopes]);
  const [pilotId, setPilotId] = useState(normalizedPilotScopes[0]?.id || "");
  const selectedPilotScope = normalizedPilotScopes.find((scope) => scope.id === pilotId) || normalizedPilotScopes[0] || null;
  const scopedRoleGroups = Array.isArray(selectedPilotScope?.roleGroups) ? selectedPilotScope.roleGroups : allowedRoleGroups;
  const [roleGroup, setRoleGroup] = useState(scopedRoleGroups[0] || "");
  const [workflowType, setWorkflowType] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [aggregationLevel, setAggregationLevel] = useState("role_group");
  const [dataset, setDataset] = useState(null);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const hasPilotScopes = normalizedPilotScopes.length > 0;
  const hasFixedRoleGroups = scopedRoleGroups.length > 0;

  useEffect(() => {
    if (!hasPilotScopes) return;
    if (!normalizedPilotScopes.some((scope) => scope.id === pilotId)) {
      setPilotId(normalizedPilotScopes[0]?.id || "");
    }
  }, [hasPilotScopes, normalizedPilotScopes, pilotId]);

  useEffect(() => {
    if (!hasFixedRoleGroups) return;
    if (!scopedRoleGroups.includes(roleGroup)) {
      setRoleGroup(scopedRoleGroups[0] || "");
    }
  }, [hasFixedRoleGroups, roleGroup, scopedRoleGroups]);

  const filters = useMemo(() => ({
    pilotId: pilotId.trim(),
    roleGroup: roleGroup.trim(),
    workflowType: workflowType.trim(),
    periodStart,
    periodEnd,
    aggregationLevel
  }), [aggregationLevel, periodEnd, periodStart, pilotId, roleGroup, workflowType]);

  const loadAggregate = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch(buildPilotAggregateUrl(filters), {
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "Piloodi koondandmestiku laadimine ebaõnnestus.");
      setDataset(payload.dataset);
      setReport(payload.report || null);
      setStatus("ready");
    } catch (loadError) {
      setError(loadError?.message || "Piloodi koondandmestiku laadimine ebaõnnestus.");
      setStatus("error");
    }
  }, [filters]);

  useEffect(() => {
    loadAggregate();
  }, [loadAggregate]);

  const csvUrl = buildPilotAggregateUrl({ ...filters, format: "csv" });
  const printUrl = buildPilotAggregateUrl({ ...filters, format: "report-html" });
  const xlsxUrl = buildPilotAggregateUrl({ ...filters, format: "xlsx" });
  const metrics = dataset?.metrics || [];
  const currentMunicipalityId = selectedPilotScope?.municipalityId || "";
  const currentPeriodLabel = periodLabel(periodStart, periodEnd);
  const currentScopeMeta = currentMunicipalityId ? `KOV: ${currentMunicipalityId}` : scopeMeta(selectedPilotScope);

  return (
    <div className="grid gap-3">
      <section className={ragAdminShellCardClassName}>
        <div className="grid gap-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] text-[color:var(--title-color,var(--brand-primary))]">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <h1 className={ragAdminShellTitleClassName}>{copy.title}</h1>
          <p className={ragAdminShellSubtitleClassName}>
            {copy.privacy}
          </p>
        </div>
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} aria-hidden="true" className="text-[color:var(--title-color,var(--brand-primary))]" />
          <h2 className="m-0 text-[1.05rem] font-[720]">{copy.viewContext}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <ContextCard label={copy.pilotScope} value={selectedPilotScope?.name || "Admini vaade"} />
          <ContextCard label={copy.scope} value={currentScopeMeta} />
          <ContextCard label={copy.period} value={currentPeriodLabel} />
          <ContextCard label={copy.roleGroup} value={roleGroup || "Kõik lubatud rolligrupid"} />
        </div>
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="grid gap-3 md:grid-cols-6">
          {hasPilotScopes ? (
            <label className="grid gap-1 text-[0.86rem]">
              {copy.pilotScope}
              <select className={inputClassName} value={pilotId} onChange={(event) => setPilotId(event.target.value)}>
                {normalizedPilotScopes.map((scope) => <option key={scope.id} value={scope.id}>{scope.name}</option>)}
              </select>
            </label>
          ) : null}
          <label className="grid gap-1 text-[0.86rem]">
            {copy.roleGroup}
            {hasFixedRoleGroups ? (
              <select className={inputClassName} value={roleGroup} onChange={(event) => setRoleGroup(event.target.value)}>
                {scopedRoleGroups.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
            ) : (
              <input className={inputClassName} value={roleGroup} onChange={(event) => setRoleGroup(event.target.value)} placeholder={isAdmin ? "nt child_protection" : "piloodi rolligrupp"} disabled={!isAdmin} />
            )}
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            {copy.workflowType}
            <input className={inputClassName} value={workflowType} onChange={(event) => setWorkflowType(event.target.value)} placeholder="nt quick-check" />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            {copy.periodStart}
            <input className={inputClassName} type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            {copy.periodEnd}
            <input className={inputClassName} type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            {copy.aggregationLevel}
            <select className={inputClassName} value={aggregationLevel} onChange={(event) => setAggregationLevel(event.target.value)}>
              {aggregationLevelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" onClick={loadAggregate} disabled={status === "loading"}>
            <RefreshCw size={16} aria-hidden="true" />
            {copy.refresh}
          </Button>
          <Button as="a" href={csvUrl} variant="primary">
            <Download size={16} aria-hidden="true" />
            {copy.csv}
          </Button>
          <Button as="a" href={printUrl} target="_blank" rel="noreferrer" variant="primary">
            <FileText size={16} aria-hidden="true" />
            {copy.print}
          </Button>
          <Button as="a" href={xlsxUrl} variant="primary">
            <Download size={16} aria-hidden="true" />
            {copy.xlsx}
          </Button>
        </div>
      </section>

      <section className={ragAdminShellCardClassName} aria-live="polite">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label={copy.sampleSize} value={dataset?.sampleSize ?? "-"} />
          <MetricCard label={copy.recordCount} value={dataset?.recordCount ?? "-"} />
          <MetricCard label={copy.minimumGroupSize} value={dataset?.minimumGroupSize ?? "-"} />
          <MetricCard label={copy.status} value={dataset?.suppressed ? copy.suppressed : copy.open} tone={dataset?.suppressed ? "warning" : "ok"} />
        </div>
        {error ? <p className="m-0 text-[0.92rem] text-red-300">{error}</p> : null}
      {dataset?.suppressed ? (
          <p className="m-0 rounded-[0.8rem] border border-[rgba(231,184,95,0.34)] bg-[rgba(231,184,95,0.10)] px-3 py-2 text-[0.92rem] leading-[1.4]">
            {copy.suppressedNotice}
          </p>
        ) : null}
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="flex items-center gap-2">
          <FileText size={18} aria-hidden="true" className="text-[color:var(--title-color,var(--brand-primary))]" />
          <h2 className="m-0 text-[1.05rem] font-[720]">{copy.report}</h2>
        </div>
        <p className="m-0 text-[0.92rem] leading-[1.45] text-[color:var(--documents-page-muted)]">
          {report?.privacyNotice || copy.noPriorities}
        </p>
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-2 rounded-[0.9rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-3">
            <span className="text-[0.78rem] uppercase tracking-[0.04em] text-[color:var(--documents-page-muted)]">{copy.decisionSummary}</span>
            <strong className="text-[1.05rem] leading-[1.35]">{report?.executiveSummary?.statusLabel || "-"}</strong>
            <p className="m-0 text-[0.92rem] leading-[1.45] text-[color:var(--documents-page-muted)]">{report?.decisionSummary || copy.noPriorities}</p>
          </div>
          <div className="grid gap-2 rounded-[0.9rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] px-3 py-3">
            <span className="text-[0.78rem] uppercase tracking-[0.04em] text-[color:var(--documents-page-muted)]">{copy.primaryRecommendation}</span>
            <strong className="text-[0.98rem] leading-[1.3]">{report?.primaryRecommendation?.title || copy.noAgreements}</strong>
            {report?.primaryRecommendation?.description ? (
              <p className="m-0 text-[0.88rem] leading-[1.4] text-[color:var(--documents-page-muted)]">{report.primaryRecommendation.description}</p>
            ) : null}
          </div>
        </div>
        {(report?.decisionFocus || []).length > 0 ? (
          <div className="grid gap-2">
            <h3 className="m-0 text-[0.96rem] font-[700]">{copy.decisionFocus}</h3>
            <div className="flex flex-wrap gap-2">
              {report.decisionFocus.map((item) => (
                <span key={item} className="rounded-[999px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.055)] px-3 py-1.5 text-[0.86rem]">{item}</span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="grid gap-2 rounded-[0.9rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-3">
            <h3 className="m-0 text-[0.96rem] font-[700]">{copy.signalLoad}</h3>
            <div className="grid grid-cols-3 gap-2">
              <SignalPill label={copy.redSignals} value={report?.signal?.redCount ?? "-"} tone="red" />
              <SignalPill label={copy.yellowSignals} value={report?.signal?.yellowCount ?? "-"} tone="yellow" />
              <SignalPill label={copy.greenSignals} value={report?.signal?.greenCount ?? "-"} tone="green" />
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="m-0 text-[0.96rem] font-[700]">{copy.priorities}</h3>
            {(report?.priorities || []).length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {report.priorities.map((priority) => (
                  <ReportItem key={priority.metricKey} eyebrow={priority.categoryLabel} title={priority.label} meta={`${priority.count}/${priority.sampleSize}`} />
                ))}
              </div>
            ) : (
              <p className="m-0 text-[0.92rem] text-[color:var(--documents-page-muted)]">{copy.noPriorities}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <h3 className="m-0 text-[0.96rem] font-[700]">{copy.agreements}</h3>
          {(report?.recommendedAgreements || []).length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {report.recommendedAgreements.map((item) => (
                <ReportItem key={item.key} title={item.title} meta={item.description} />
              ))}
            </div>
          ) : (
            <p className="m-0 text-[0.92rem] text-[color:var(--documents-page-muted)]">{copy.noAgreements}</p>
          )}
        </div>
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[1.05rem] font-[720]">{copy.metrics}</h2>
          <span className="text-[0.88rem] text-[color:var(--documents-page-muted)]">{metrics.length} {copy.rows}</span>
        </div>
        {metrics.length > 0 ? (
          <div className="max-h-[32rem] overflow-auto rounded-[0.9rem] border border-[rgba(255,255,255,0.12)]">
            <table className="w-full min-w-[46rem] border-collapse text-left text-[0.9rem]">
              <thead className="sticky top-0 bg-[rgba(20,20,22,0.96)]">
                <tr>
                  <th className="px-3 py-2 font-[680]">{copy.metric}</th>
                  <th className="px-3 py-2 font-[680]">{copy.value}</th>
                  <th className="px-3 py-2 font-[680]">{copy.sampleSize}</th>
                  <th className="px-3 py-2 font-[680]">{copy.aggregationLevel}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.metricKey} className="border-t border-[rgba(255,255,255,0.09)]">
                    <td className="px-3 py-2 text-[color:var(--documents-page-text)]">{metricLabel(metric.metricKey)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatMetricValue(metric)}</td>
                    <td className="px-3 py-2 tabular-nums">{metric.sampleSize}</td>
                    <td className="px-3 py-2">{metric.aggregationLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 text-[0.92rem] text-[color:var(--documents-page-muted)]">
            {copy.noMetrics}
          </p>
        )}
      </section>
    </div>
  );
}

function SignalPill({ label, value, tone }) {
  const toneClass =
    tone === "red" ? "border-[rgba(220,92,92,0.36)] bg-[rgba(220,92,92,0.10)]" :
      tone === "yellow" ? "border-[rgba(231,184,95,0.38)] bg-[rgba(231,184,95,0.10)]" :
        "border-[rgba(94,178,164,0.36)] bg-[rgba(94,178,164,0.10)]";

  return (
    <div className={cn("grid gap-1 rounded-[0.8rem] border px-2.5 py-2", toneClass)}>
      <span className="text-[0.76rem] text-[color:var(--documents-page-muted)]">{label}</span>
      <strong className="text-[1.15rem] leading-[1]">{value}</strong>
    </div>
  );
}

function ReportItem({ eyebrow, title, meta }) {
  return (
    <article className="grid gap-1 rounded-[0.85rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] px-3 py-2.5">
      {eyebrow ? <span className="text-[0.74rem] uppercase tracking-[0.04em] text-[color:var(--documents-page-muted)]">{eyebrow}</span> : null}
      <strong className="text-[0.95rem] leading-[1.25]">{title}</strong>
      {meta ? <span className="text-[0.86rem] leading-[1.35] text-[color:var(--documents-page-muted)]">{meta}</span> : null}
    </article>
  );
}

function ContextCard({ label, value }) {
  return (
    <div className="grid min-h-[4.3rem] gap-1 rounded-[0.9rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-2">
      <span className="text-[0.76rem] uppercase tracking-[0.04em] text-[color:var(--documents-page-muted)]">{label}</span>
      <strong className="text-[0.95rem] leading-[1.25]">{value}</strong>
    </div>
  );
}

function MetricCard({ label, value, tone = "neutral" }) {
  return (
    <div className={cn(
      "grid gap-1 rounded-[0.9rem] border px-3 py-2",
      tone === "ok" ? "border-[rgba(94,178,164,0.36)] bg-[rgba(94,178,164,0.10)]" :
        tone === "warning" ? "border-[rgba(231,184,95,0.38)] bg-[rgba(231,184,95,0.10)]" :
          "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
    )}>
      <span className="text-[0.78rem] uppercase tracking-[0.04em] text-[color:var(--documents-page-muted)]">{label}</span>
      <strong className="text-[1.2rem] leading-[1.1]">{value}</strong>
    </div>
  );
}
