"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const panelClassName =
  "relative mt-3 overflow-hidden rounded-[1.45rem] px-[clamp(0.95rem,2vw,1.25rem)] py-[clamp(0.9rem,2vw,1.15rem)] " +
  "text-[color:var(--documents-page-text)] " +
  "[background:color-mix(in_srgb,var(--documents-content-bg)_74%,rgba(255,255,255,0.12)_26%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_72%,transparent),0_12px_34px_rgba(10,18,32,0.10)]";
const titleClassName = "text-[1.12rem] font-semibold leading-tight tracking-[0] text-[color:var(--documents-page-text)]";
const bodyClassName = "mt-2 max-w-[74ch] text-[0.92rem] leading-[1.5] text-[color:var(--documents-page-muted)]";
const statsClassName = "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4";
const statClassName =
  "rounded-[1rem] px-3 py-2.5 [background:color-mix(in_srgb,var(--documents-card-bg)_76%,rgba(255,255,255,0.10)_24%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_70%,transparent)]";
const statLabelClassName = "text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[color:var(--documents-page-muted)]";
const statValueClassName = "mt-1 text-[1.15rem] font-semibold leading-none tracking-[0] text-[color:var(--documents-page-text)]";
const actionRowClassName = "mt-4 flex flex-wrap gap-2";
const buttonClassName =
  "inline-flex min-h-[2.6rem] items-center justify-center rounded-[999px] px-4 py-2 text-[0.92rem] font-semibold " +
  "text-[color:var(--documents-page-text)] transition disabled:cursor-not-allowed disabled:opacity-55 " +
  "[background:color-mix(in_srgb,var(--documents-content-bg)_78%,rgba(255,255,255,0.16)_22%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_76%,transparent),0_8px_20px_rgba(10,18,32,0.10)]";
const primaryButtonClassName =
  `${buttonClassName} [background:color-mix(in_srgb,var(--documents-accent)_22%,var(--documents-content-bg)_78%)]`;
const inputClassName =
  "min-h-[2.6rem] min-w-[12rem] rounded-[999px] border-0 px-4 text-[0.92rem] text-[color:var(--documents-page-text)] outline-none " +
  "[background:color-mix(in_srgb,var(--documents-card-bg)_82%,rgba(255,255,255,0.12)_18%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_76%,transparent)]";
const messageClassName = "mt-3 text-[0.86rem] leading-[1.45] text-[color:var(--documents-page-muted)]";
const changeListClassName =
  "mt-4 overflow-hidden rounded-[1rem] [background:color-mix(in_srgb,var(--documents-card-bg)_76%,rgba(255,255,255,0.10)_24%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_70%,transparent)]";
const changeRowClassName =
  "grid gap-1 border-b border-[color:color-mix(in_srgb,var(--documents-card-border)_70%,transparent)] px-3 py-2.5 last:border-b-0 md:grid-cols-[0.8fr_1.3fr_0.8fr]";
const changeNameClassName = "text-[0.88rem] font-semibold leading-snug text-[color:var(--documents-page-text)]";
const changeValueClassName = "min-w-0 break-words text-[0.82rem] leading-snug text-[color:var(--documents-page-muted)]";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return new Intl.NumberFormat("et-EE").format(value);
  return String(value);
}

function statusText(status) {
  if (!status?.reportExists) return "Kontrollimata";
  if ((status?.report?.baselineMissing || 0) > 0) return "Vajab baasjoont";
  if ((status?.report?.changedSources || 0) > 0) return "Lehed muutunud";
  return "Ajakohane";
}

export default function RagAdminKovSourceMonitorPanel() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [slug, setSlug] = useState("");

  const loadStatus = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/rag/kov-source-monitor", {
        cache: "no-store",
        credentials: "same-origin"
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "KOV allikate kontroll ebaõnnestus");
      setStatus(data);
    } catch (error) {
      setMessage(error?.message || "KOV allikate kontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const runWebCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Kontrollin KOV allikalehti ja koostan kandidaatfailid...");
    try {
      const response = await fetch("/api/admin/rag/kov-source-monitor", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "web-check", slug })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "KOV allikate veebikontroll ebaõnnestus");
      setStatus(data.status);
      setMessage(`Kontroll valmis: ${formatValue(data?.result?.changedSources || 0)} muutunud allikat, ${formatValue(data?.result?.baselineMissing || 0)} baasjooneta allikat.`);
    } catch (error) {
      setMessage(error?.message || "KOV allikate veebikontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, [slug]);

  const applyCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Rakendan KOV allikate kontrollfailid...");
    try {
      const response = await fetch("/api/admin/rag/kov-source-monitor", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-check" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "KOV allikate kontrollfailide rakendamine ebaõnnestus");
      setStatus(data.status);
      setMessage(`Allikate baasjoon uuendatud: ${formatValue(data?.result?.appliedFiles || 0)} faili.`);
    } catch (error) {
      setMessage(error?.message || "KOV allikate kontrollfailide rakendamine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const items = useMemo(() => status?.report?.items || [], [status]);
  const canApply = Boolean(status?.reportExists && (status?.report?.candidatesWritten || 0) > 0);

  return (
    <section className={panelClassName} aria-label="KOV veebiallikate seire">
      <h2 className={titleClassName}>KOV veebiallikate seire</h2>
      <p className={bodyClassName}>
        Kontrollib kõigi `KOV/*/*.sources.json` allikate ametlikke URL-e ja kirjutab kõrvale kandidaatfailid.
        See ei uuenda teenuste JSON-i ega RAG markdowni, vaid loob lehtede muutuste baasjoone ja raporti.
      </p>

      <div className={statsClassName}>
        <div className={statClassName}>
          <div className={statLabelClassName}>Seis</div>
          <div className={statValueClassName}>{statusText(status)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>KOV failid</div>
          <div className={statValueClassName}>{formatValue(status?.sourceFiles)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Muudatused</div>
          <div className={statValueClassName}>{formatValue(status?.report?.changedSources)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Baasjooneta</div>
          <div className={statValueClassName}>{formatValue(status?.report?.baselineMissing)}</div>
        </div>
      </div>

      <div className={actionRowClassName}>
        <input
          className={inputClassName}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="slug, nt viimsi-vald"
          aria-label="KOV slug"
        />
        <button type="button" className={buttonClassName} onClick={loadStatus} disabled={busy}>
          Kontrolli seisu
        </button>
        <button type="button" className={primaryButtonClassName} onClick={runWebCheck} disabled={busy}>
          Käivita allikakontroll
        </button>
        <button type="button" className={buttonClassName} onClick={applyCheck} disabled={busy || !canApply}>
          Kinnita allikate baasjoon
        </button>
      </div>

      {message ? <p className={messageClassName}>{message}</p> : null}
      {items.length > 0 ? (
        <div className={changeListClassName} aria-label="KOV allikate muudatused">
          {items.map((item, index) => (
            <div key={`${item.slug}-${item.sourceKey}-${index}`} className={changeRowClassName}>
              <div className={changeNameClassName}>{item.slug || "-"}</div>
              <div className={changeValueClassName}>{item.title || item.sourceKey || item.url || "-"}</div>
              <div className={changeValueClassName}>{item.status || "-"}</div>
            </div>
          ))}
        </div>
      ) : status?.reportExists ? (
        <p className={messageClassName}>Viimases raportis muutunud allikaid ei olnud.</p>
      ) : null}
      {status?.reportExists ? (
        <p className={messageClassName}>
          Raport: {status.report.reportFile}; kontrollitud URL-e: {formatValue(status.report.checkedUrls)}.
          {status.report.appliedAt ? ` Rakendatud: ${status.report.appliedAt}.` : ""}
        </p>
      ) : null}
    </section>
  );
}
