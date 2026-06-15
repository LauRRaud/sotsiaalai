"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus, RefreshCw, Settings, ShieldCheck, UserPlus } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import {
  ragAdminShellCardClassName,
  ragAdminShellSubtitleClassName,
  ragAdminShellTitleClassName
} from "@/components/admin/rag/ragAdminShellStyles";

const inputClassName =
  "min-h-[2.45rem] rounded-[0.72rem] border border-[color:var(--documents-card-border,rgba(255,255,255,0.16))] bg-[rgba(0,0,0,0.18)] px-3 text-[0.95rem] text-[color:var(--documents-page-text)] outline-none focus:border-[color:var(--title-color,var(--brand-primary))]";

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

function buildAggregateUrl({ roleGroup, workflowType, periodStart, periodEnd, aggregationLevel, format }) {
  const params = new URLSearchParams();
  if (roleGroup) params.set("roleGroup", roleGroup);
  if (workflowType) params.set("workflowType", workflowType);
  if (periodStart) params.set("periodStart", periodStart);
  if (periodEnd) params.set("periodEnd", periodEnd);
  if (aggregationLevel) params.set("aggregationLevel", aggregationLevel);
  if (format) params.set("format", format);
  return `/api/admin/wellbeing/aggregate${params.size ? `?${params.toString()}` : ""}`;
}

function buildPilotScopesUrl() {
  return "/api/admin/wellbeing/pilots";
}

function buildPilotScopeViewersUrl(pilotScopeId) {
  return `/api/admin/wellbeing/pilots/${encodeURIComponent(pilotScopeId)}/viewers`;
}

export default function AdminWellbeingClient() {
  const [roleGroup, setRoleGroup] = useState("");
  const [workflowType, setWorkflowType] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [aggregationLevel, setAggregationLevel] = useState("role_group");
  const [dataset, setDataset] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [pilotScopes, setPilotScopes] = useState([]);
  const [pilotStatus, setPilotStatus] = useState("idle");
  const [pilotError, setPilotError] = useState("");
  const [pilotForm, setPilotForm] = useState({
    name: "",
    scopeType: "municipality",
    municipalityId: "",
    organizationId: "",
    roleGroups: "",
    viewerEmails: "",
    minimumGroupSize: "3",
    startsAt: "",
    endsAt: "",
    active: true
  });
  const [selectedPilotScopeId, setSelectedPilotScopeId] = useState("");
  const [viewerEmail, setViewerEmail] = useState("");

  const filters = useMemo(() => ({
    roleGroup: roleGroup.trim(),
    workflowType: workflowType.trim(),
    periodStart,
    periodEnd,
    aggregationLevel
  }), [aggregationLevel, periodEnd, periodStart, roleGroup, workflowType]);

  const loadAggregate = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch(buildAggregateUrl(filters), {
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "Koondandmestiku laadimine ebaõnnestus.");
      setDataset(payload.dataset);
      setStatus("ready");
    } catch (loadError) {
      setError(loadError?.message || "Koondandmestiku laadimine ebaõnnestus.");
      setStatus("error");
    }
  }, [filters]);

  useEffect(() => {
    loadAggregate();
  }, [loadAggregate]);

  const loadPilotScopes = useCallback(async () => {
    setPilotStatus("loading");
    setPilotError("");
    try {
      const response = await fetch(buildPilotScopesUrl(), {
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "Pilootide laadimine ebaonnestus.");
      setPilotScopes(Array.isArray(payload.pilotScopes) ? payload.pilotScopes : []);
      if (!selectedPilotScopeId && payload.pilotScopes?.[0]?.id) {
        setSelectedPilotScopeId(payload.pilotScopes[0].id);
      }
      setPilotStatus("ready");
    } catch (loadError) {
      setPilotError(loadError?.message || "Pilootide laadimine ebaonnestus.");
      setPilotStatus("error");
    }
  }, [selectedPilotScopeId]);

  useEffect(() => {
    loadPilotScopes();
  }, [loadPilotScopes]);

  const updatePilotForm = useCallback((field, value) => {
    setPilotForm((current) => ({ ...current, [field]: value }));
  }, []);

  const createPilotScope = useCallback(async (event) => {
    event.preventDefault();
    setPilotStatus("saving");
    setPilotError("");
    try {
      const response = await fetch(buildPilotScopesUrl(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pilotForm)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "Piloodi salvestamine ebaonnestus.");
      setPilotForm({
        name: "",
        scopeType: "municipality",
        municipalityId: "",
        organizationId: "",
        roleGroups: "",
        viewerEmails: "",
        minimumGroupSize: "3",
        startsAt: "",
        endsAt: "",
        active: true
      });
      await loadPilotScopes();
    } catch (saveError) {
      setPilotError(saveError?.message || "Piloodi salvestamine ebaonnestus.");
      setPilotStatus("error");
    }
  }, [loadPilotScopes, pilotForm]);

  const addPilotViewer = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedPilotScopeId || !viewerEmail.trim()) return;
    setPilotStatus("saving");
    setPilotError("");
    try {
      const response = await fetch(buildPilotScopeViewersUrl(selectedPilotScopeId), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: viewerEmail })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) throw new Error(payload?.message || "Vaataja lisamine ebaõnnestus.");
      setViewerEmail("");
      await loadPilotScopes();
    } catch (saveError) {
      setPilotError(saveError?.message || "Vaataja lisamine ebaõnnestus.");
      setPilotStatus("error");
    }
  }, [loadPilotScopes, selectedPilotScopeId, viewerEmail]);

  const csvUrl = buildAggregateUrl({ ...filters, format: "csv" });
  const metrics = dataset?.metrics || [];

  return (
    <div className="grid gap-3">
      <section className={ragAdminShellCardClassName}>
        <div className="grid gap-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] text-[color:var(--title-color,var(--brand-primary))]">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <h1 className={ragAdminShellTitleClassName}>Tööheaolu koondandmestik</h1>
          <p className={ragAdminShellSubtitleClassName}>
            Admini tööpind KOV-piloodi anonüümsete koondnäitajate kontrolliks. Alla miinimumgrupi läve detailseid mõõdikuid ei näidata.
          </p>
        </div>
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="grid gap-3 md:grid-cols-5">
          <label className="grid gap-1 text-[0.86rem]">
            Rolligrupp
            <input className={inputClassName} value={roleGroup} onChange={(event) => setRoleGroup(event.target.value)} placeholder="nt child_protection" />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            Töövoog
            <input className={inputClassName} value={workflowType} onChange={(event) => setWorkflowType(event.target.value)} placeholder="nt quick-check" />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            Algus
            <input className={inputClassName} type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            Lõpp
            <input className={inputClassName} type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            Tase
            <select className={inputClassName} value={aggregationLevel} onChange={(event) => setAggregationLevel(event.target.value)}>
              <option value="role_group">role_group</option>
              <option value="organization">organization</option>
              <option value="municipality">municipality</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" onClick={loadAggregate} disabled={status === "loading"}>
            <RefreshCw size={16} aria-hidden="true" />
            Värskenda
          </Button>
          <Button as="a" href={csvUrl} variant="primary">
            <Download size={16} aria-hidden="true" />
            CSV
          </Button>
        </div>
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings size={18} aria-hidden="true" className="text-[color:var(--title-color,var(--brand-primary))]" />
            <h2 className="m-0 text-[1.05rem] font-[720]">Piloodi skoobid</h2>
          </div>
          <Button type="button" variant="primary" onClick={loadPilotScopes} disabled={pilotStatus === "loading"}>
            <RefreshCw size={16} aria-hidden="true" />
            Laadi
          </Button>
        </div>

        <form className="grid gap-3" onSubmit={createPilotScope}>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-[0.86rem]">
              Nimi
              <input className={inputClassName} value={pilotForm.name} onChange={(event) => updatePilotForm("name", event.target.value)} placeholder="nt Tartu KOV piloot" required />
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              Skoobi tüüp
              <select className={inputClassName} value={pilotForm.scopeType} onChange={(event) => updatePilotForm("scopeType", event.target.value)}>
                <option value="municipality">municipality</option>
                <option value="organization">organization</option>
                <option value="role_group">role_group</option>
              </select>
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              KOV tunnus
              <input className={inputClassName} value={pilotForm.municipalityId} onChange={(event) => updatePilotForm("municipalityId", event.target.value)} placeholder="nt tartu_linn" />
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              Organisatsioon
              <input className={inputClassName} value={pilotForm.organizationId} onChange={(event) => updatePilotForm("organizationId", event.target.value)} placeholder="organisatsiooni tunnus" />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
            <label className="grid gap-1 text-[0.86rem]">
              Rolligrupid
              <input className={inputClassName} value={pilotForm.roleGroups} onChange={(event) => updatePilotForm("roleGroups", event.target.value)} placeholder="child_protection, family_support" required />
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              Vaatajate e-postid
              <input className={inputClassName} value={pilotForm.viewerEmails} onChange={(event) => updatePilotForm("viewerEmails", event.target.value)} placeholder="kov@example.test" />
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              Miinimum
              <input className={inputClassName} type="number" min="3" value={pilotForm.minimumGroupSize} onChange={(event) => updatePilotForm("minimumGroupSize", event.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-[12rem_12rem_1fr]">
            <label className="grid gap-1 text-[0.86rem]">
              Algus
              <input className={inputClassName} type="date" value={pilotForm.startsAt} onChange={(event) => updatePilotForm("startsAt", event.target.value)} />
            </label>
            <label className="grid gap-1 text-[0.86rem]">
              Lõpp
              <input className={inputClassName} type="date" value={pilotForm.endsAt} onChange={(event) => updatePilotForm("endsAt", event.target.value)} />
            </label>
            <label className="flex items-center gap-2 pt-6 text-[0.9rem]">
              <input type="checkbox" checked={pilotForm.active} onChange={(event) => updatePilotForm("active", event.target.checked)} />
              Aktiivne piloot
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="primary" disabled={pilotStatus === "saving"}>
              <Plus size={16} aria-hidden="true" />
              Lisa piloot
            </Button>
            {pilotError ? <span className="text-[0.9rem] text-red-300">{pilotError}</span> : null}
          </div>
        </form>

        <form className="grid gap-3 rounded-[0.9rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] p-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={addPilotViewer}>
          <label className="grid gap-1 text-[0.86rem]">
            Piloot
            <select className={inputClassName} value={selectedPilotScopeId} onChange={(event) => setSelectedPilotScopeId(event.target.value)}>
              <option value="">Vali piloot</option>
              {pilotScopes.map((scope) => <option key={scope.id} value={scope.id}>{scope.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-[0.86rem]">
            Vaataja e-post
            <input className={inputClassName} type="email" value={viewerEmail} onChange={(event) => setViewerEmail(event.target.value)} placeholder="kov@example.test" />
          </label>
          <Button type="submit" variant="primary" disabled={!selectedPilotScopeId || !viewerEmail.trim() || pilotStatus === "saving"}>
            <UserPlus size={16} aria-hidden="true" />
            Lisa vaataja
          </Button>
        </form>

        <div className="grid gap-2 md:grid-cols-2">
          {pilotScopes.length > 0 ? pilotScopes.map((scope) => (
            <article key={scope.id} className="grid gap-1 rounded-[0.85rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.045)] px-3 py-2.5">
              <strong className="text-[0.95rem] leading-[1.25]">{scope.name}</strong>
              <span className="text-[0.84rem] text-[color:var(--documents-page-muted)]">{scope.scopeType} · min {scope.minimumGroupSize}</span>
              <span className="text-[0.84rem] text-[color:var(--documents-page-muted)]">{(scope.roleGroups || []).join(", ")}</span>
              <span className="text-[0.84rem] text-[color:var(--documents-page-muted)]">{(scope.viewerEmails || []).join(", ")}</span>
            </article>
          )) : (
            <p className="m-0 text-[0.92rem] text-[color:var(--documents-page-muted)]">Piloodi skoobid puuduvad.</p>
          )}
        </div>
      </section>

      <section className={ragAdminShellCardClassName} aria-live="polite">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Valim" value={dataset?.sampleSize ?? "-"} />
          <MetricCard label="Kirjeid" value={dataset?.recordCount ?? "-"} />
          <MetricCard label="Miinimumgrupp" value={dataset?.minimumGroupSize ?? "-"} />
          <MetricCard label="Staatus" value={dataset?.suppressed ? "Summutatud" : "Avatud"} tone={dataset?.suppressed ? "warning" : "ok"} />
        </div>
        {error ? <p className="m-0 text-[0.92rem] text-red-300">{error}</p> : null}
        {dataset?.suppressed ? (
          <p className="m-0 rounded-[0.8rem] border border-[rgba(231,184,95,0.34)] bg-[rgba(231,184,95,0.10)] px-3 py-2 text-[0.92rem] leading-[1.4]">
            Andmed on summutatud, sest valim on alla miinimumgrupi. Detailseid töö nõudmiste, ressursside ja riskide võtmeid ei kuvata.
          </p>
        ) : null}
      </section>

      <section className={ragAdminShellCardClassName}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[1.05rem] font-[720]">Mõõdikud</h2>
          <span className="text-[0.88rem] text-[color:var(--documents-page-muted)]">{metrics.length} rida</span>
        </div>
        {metrics.length > 0 ? (
          <div className="max-h-[32rem] overflow-auto rounded-[0.9rem] border border-[rgba(255,255,255,0.12)]">
            <table className="w-full min-w-[46rem] border-collapse text-left text-[0.9rem]">
              <thead className="sticky top-0 bg-[rgba(20,20,22,0.96)]">
                <tr>
                  <th className="px-3 py-2 font-[680]">Metric</th>
                  <th className="px-3 py-2 font-[680]">Väärtus</th>
                  <th className="px-3 py-2 font-[680]">Valim</th>
                  <th className="px-3 py-2 font-[680]">Tase</th>
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
            Mõõdikuid ei kuvata. Kui valim on alla miinimumgrupi, jäävad detailid privaatsuse tõttu peidetuks.
          </p>
        )}
      </section>
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
