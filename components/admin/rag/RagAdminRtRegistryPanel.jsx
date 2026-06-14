"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

const panelClassName =
  "relative mt-3 overflow-hidden rounded-[1.45rem] px-[clamp(0.95rem,2vw,1.25rem)] py-[clamp(0.9rem,2vw,1.15rem)] " +
  "text-[color:var(--documents-page-text)] " +
  "[background:color-mix(in_srgb,var(--documents-content-bg)_74%,rgba(255,255,255,0.12)_26%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_72%,transparent),0_12px_34px_rgba(10,18,32,0.10)]";
const titleClassName = "text-[1.12rem] font-semibold leading-tight tracking-[0] text-[color:var(--documents-page-text)]";
const bodyClassName = "mt-2 max-w-[72ch] text-[0.92rem] leading-[1.5] text-[color:var(--documents-page-muted)]";
const statsClassName = "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4";
const statClassName =
  "rounded-[1rem] px-3 py-2.5 [background:color-mix(in_srgb,var(--documents-card-bg)_76%,rgba(255,255,255,0.10)_24%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_70%,transparent)]";
const statLabelClassName = "text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[color:var(--documents-page-muted)]";
const statValueClassName = "mt-1 text-[1.15rem] font-semibold leading-none tracking-[0] text-[color:var(--documents-page-text)]";
const actionRowClassName = "mt-4 flex flex-wrap gap-2";
const actionButtonClassName = "!min-h-[2.6rem]";
const messageClassName = "mt-3 text-[0.86rem] leading-[1.45] text-[color:var(--documents-page-muted)]";
const changeListClassName =
  "mt-4 overflow-hidden rounded-[1rem] [background:color-mix(in_srgb,var(--documents-card-bg)_76%,rgba(255,255,255,0.10)_24%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_70%,transparent)]";
const changeRowClassName =
  "grid gap-1 border-b border-[color:color-mix(in_srgb,var(--documents-card-border)_70%,transparent)] px-3 py-2.5 last:border-b-0 md:grid-cols-[0.9fr_1.1fr_1fr]";
const changeNameClassName = "text-[0.88rem] font-semibold leading-snug text-[color:var(--documents-page-text)]";
const changeValueClassName = "min-w-0 break-words text-[0.82rem] leading-snug text-[color:var(--documents-page-muted)]";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return new Intl.NumberFormat("et-EE").format(value);
  return String(value);
}

function statusText(status) {
  if (!status?.reportExists) return "Kontrollimata";
  if ((status?.check?.changedEntries || 0) > 0) return "Vajab ülevaatust";
  return "Ajakohane";
}

function describeFields(fields = []) {
  const names = fields.map((field) => field.field).filter(Boolean);
  return names.length ? names.join(", ") : "muudatus";
}

export default function RagAdminRtRegistryPanel() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/rag/rt-registry", {
        cache: "no-store",
        credentials: "same-origin"
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "RT kontroll ebaõnnestus");
      setStatus(data);
    } catch (error) {
      setMessage(error?.message || "RT kontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const runWebCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Kontrollin Riigi Teataja kehtivaid XML-e ja koostan võrdlusfaili...");
    try {
      const response = await fetch("/api/admin/rag/rt-registry", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "web-check" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "RT veebikontroll ebaõnnestus");
      setStatus(data.status);
      setMessage(`RT kontrollfail loodud: ${formatValue(data?.result?.changedEntries || 0)} muudetud akti, ${formatValue(data?.result?.downloadedXml || 0)} XML faili alla laaditud.`);
    } catch (error) {
      setMessage(error?.message || "RT veebikontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const applyCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Rakendan RT kontrollfaili põhimanifestiks...");
    try {
      const response = await fetch("/api/admin/rag/rt-registry", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-check" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "RT kontrollfaili rakendamine ebaõnnestus");
      setStatus(data.status);
      setMessage(`RT põhifail uuendatud. Varukoopia: ${data?.result?.backupDir || "-"}.`);
    } catch (error) {
      setMessage(error?.message || "RT kontrollfaili rakendamine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const changes = useMemo(() => status?.check?.changes || [], [status]);
  const canApplyCheck = Boolean(status?.checkFileExists && status?.reportExists && (status?.check?.changedEntries || 0) > 0);

  return (
    <section className={panelClassName} aria-label="KOV RT register">
      <h2 className={titleClassName}>KOV/LOV Riigi Teataja register</h2>
      <p className={bodyClassName}>
        Kontrollib `KOV/kov_rt/kov_rt_manifest.json` aktide `?leiaKehtiv` URL-e, leiab kehtiva XML-i ja võrdleb seda kohaliku XML failiga.
        Põhimanifesti ei muudeta enne, kui kontrollfail on üle vaadatud ja kinnitatud.
      </p>

      <div className={statsClassName}>
        <div className={statClassName}>
          <div className={statLabelClassName}>Seis</div>
          <div className={statValueClassName}>{statusText(status)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>RT kirjed</div>
          <div className={statValueClassName}>{formatValue(status?.counts?.entries)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Viimati kontrollis</div>
          <div className={statValueClassName}>{formatValue(status?.check?.checkedUrls)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Muudetud aktid</div>
          <div className={statValueClassName}>{formatValue(status?.check?.changedEntries)}</div>
        </div>
      </div>

      <div className={actionRowClassName}>
        <Button type="button" variant="primary" size="sm" className={actionButtonClassName} onClick={loadStatus} disabled={busy}>
          Kontrolli seisu
        </Button>
        <Button type="button" variant="primary" size="sm" className={actionButtonClassName} onClick={runWebCheck} disabled={busy}>
          Käivita RT veebikontroll
        </Button>
        <Button type="button" variant="primary" size="sm" className={actionButtonClassName} onClick={applyCheck} disabled={busy || !canApplyCheck}>
          Uuenda RT põhifail
        </Button>
      </div>

      {message ? <p className={messageClassName}>{message}</p> : null}
      {changes.length > 0 ? (
        <div className={changeListClassName} aria-label="RT muudatused">
          {changes.map((change) => (
            <div key={`${change.slug}-${change.newActReference || change.actReference || change.xmlFile}`} className={changeRowClassName}>
              <div className={changeNameClassName}>
                {change.slug || "KOV"} <span className={changeValueClassName}>({change.title || "-"})</span>
              </div>
              <div className={changeValueClassName}>
                {change.actReference || "-"} → {change.newActReference || "-"}
              </div>
              <div className={changeValueClassName}>
                {describeFields(change.fields)}
                {change.xmlChanged ? "; XML sisu muutus" : ""}
              </div>
            </div>
          ))}
        </div>
      ) : status?.reportExists ? (
        <p className={messageClassName}>Viimases RT raportis muudatusi ei olnud.</p>
      ) : null}
      {status?.reportExists ? (
        <p className={messageClassName}>
          Viimane raport: {status.check.reportFile}; kandidaatmanifest: {status.check.outputFile}; XML kandidaadid: {status.check.candidateXmlDir}.
          {status.check.appliedAt ? ` Rakendatud: ${status.check.appliedAt}.` : ""}
        </p>
      ) : null}
    </section>
  );
}
