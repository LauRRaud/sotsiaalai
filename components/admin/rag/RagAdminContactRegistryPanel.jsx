"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const panelClassName =
  "relative mt-3 overflow-hidden rounded-[1.45rem] px-[clamp(0.95rem,2vw,1.25rem)] py-[clamp(0.9rem,2vw,1.15rem)] " +
  "text-[color:var(--documents-page-text)] " +
  "[background:color-mix(in_srgb,var(--documents-content-bg)_74%,rgba(255,255,255,0.12)_26%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_72%,transparent),0_12px_34px_rgba(10,18,32,0.10)]";
const titleClassName = "text-[1.12rem] font-semibold leading-tight tracking-[0] text-[color:var(--documents-page-text)]";
const bodyClassName = "mt-2 max-w-[70ch] text-[0.92rem] leading-[1.5] text-[color:var(--documents-page-muted)]";
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
const messageClassName = "mt-3 text-[0.86rem] leading-[1.45] text-[color:var(--documents-page-muted)]";
const changeListClassName =
  "mt-4 overflow-hidden rounded-[1rem] [background:color-mix(in_srgb,var(--documents-card-bg)_76%,rgba(255,255,255,0.10)_24%)] " +
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--documents-card-border)_70%,transparent)]";
const changeRowClassName =
  "grid gap-1 border-b border-[color:color-mix(in_srgb,var(--documents-card-border)_70%,transparent)] px-3 py-2.5 last:border-b-0 sm:grid-cols-[1.1fr_1fr_1fr]";
const changeNameClassName = "text-[0.88rem] font-semibold leading-snug text-[color:var(--documents-page-text)]";
const changeValueClassName = "min-w-0 break-words text-[0.82rem] leading-snug text-[color:var(--documents-page-muted)]";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return new Intl.NumberFormat("et-EE").format(value);
  return String(value);
}

function statusText(status) {
  if (!status) return "Kontrollimata";
  if (status.sourceChanged === true) return "Vajab uuendust";
  if (status.needsRefresh) return "Vajab esmast räsi";
  return "Ajakohane";
}

export default function RagAdminContactRegistryPanel() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/rag/contact-registry", {
        cache: "no-store",
        credentials: "same-origin"
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Kontroll ebaõnnestus");
      setStatus(data);
    } catch (error) {
      setMessage(error?.message || "Kontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const runWebCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Käin kontaktfailis olevad ametlikud lehed läbi ja koostan kontrollfaili...");
    try {
      const response = await fetch("/api/admin/rag/contact-registry", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "web-check" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Veebikontroll ebaõnnestus");
      setStatus(data.status);
      setMessage(`Kontrollfail loodud: ${formatValue(data?.result?.changedContacts || 0)} muutust, ${formatValue(data?.result?.protectedEmailsDecoded || 0)} kaitstud e-posti dekodeeritud.`);
    } catch (error) {
      setMessage(error?.message || "Veebikontroll ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const applyCheck = useCallback(async () => {
    setBusy(true);
    setMessage("Rakendan kontrollfaili põhifailiks...");
    try {
      const response = await fetch("/api/admin/rag/contact-registry", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-check" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Kontrollfaili rakendamine ebaõnnestus");
      setStatus(data.status);
      setMessage(`Põhifail uuendatud. Varukoopia: ${data?.result?.backupFile || "-"}.`);
    } catch (error) {
      setMessage(error?.message || "Kontrollfaili rakendamine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  const confirmBaseline = useCallback(async () => {
    setBusy(true);
    setMessage("Kinnitan kontaktiregistri praeguse seisu baasjooneks...");
    try {
      const response = await fetch("/api/admin/rag/contact-registry", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "baseline" })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Baasjoone kinnitamine ebaõnnestus");
      setStatus(data.status);
      setMessage(`Baasjoon kinnitatud: ${data?.result?.summaryFile || "KOV/kov_kontaktid_loplik.summary.json"}.`);
    } catch (error) {
      setMessage(error?.message || "Baasjoone kinnitamine ebaõnnestus");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const geocoding = useMemo(() => status?.serviceMap?.geocodingStatus || {}, [status]);
  const emailChanges = status?.check?.emailChanges || [];
  const canApplyCheck = Boolean(status?.check?.fileExists && status?.check?.reportExists && status?.check?.changedContacts > 0);

  return (
    <section className={panelClassName} aria-label="KOV ja LOV kontaktiregister">
      <h2 className={titleClassName}>KOV/LOV kontaktiregister</h2>
      <p className={bodyClassName}>
        Kontrollib keskse kontaktfaili `officialUrl` lehti ja Tallinna `KOV/LOV` lähtefailide URL-e.
        Veebikontroll ei kirjuta põhifaili üle, vaid loob kõrvale `kov_kontaktid_loplik.kontroll.json` faili ja võrdlusraporti.
      </p>

      <div className={statsClassName}>
        <div className={statClassName}>
          <div className={statLabelClassName}>Seis</div>
          <div className={statValueClassName}>{statusText(status)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Kontaktfail</div>
          <div className={statValueClassName}>{formatValue(status?.counts?.existingContacts)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Viimati kontrollis</div>
          <div className={statValueClassName}>{formatValue(status?.check?.checkedUrls)}</div>
        </div>
        <div className={statClassName}>
          <div className={statLabelClassName}>Raporti muutused</div>
          <div className={statValueClassName}>{formatValue(status?.check?.changedContacts)}</div>
        </div>
      </div>

      {status?.serviceMap?.ok ? (
        <p className={messageClassName}>
          Geokodeerimine: MATCHED {formatValue(geocoding.MATCHED || 0)}, PENDING {formatValue(geocoding.PENDING || 0)},
          FAILED {formatValue(geocoding.FAILED || 0)}.
        </p>
      ) : null}

      <div className={actionRowClassName}>
        <button type="button" className={buttonClassName} onClick={loadStatus} disabled={busy}>
          Kontrolli seisu
        </button>
        <button type="button" className={primaryButtonClassName} onClick={runWebCheck} disabled={busy}>
          Käivita veebikontroll
        </button>
        {status?.needsRefresh ? (
          <button type="button" className={buttonClassName} onClick={confirmBaseline} disabled={busy}>
            Kinnita baasjoon
          </button>
        ) : null}
        <button type="button" className={buttonClassName} onClick={applyCheck} disabled={busy || !canApplyCheck}>
          Uuenda põhifail
        </button>
      </div>

      {message ? <p className={messageClassName}>{message}</p> : null}
      {emailChanges.length > 0 ? (
        <div className={changeListClassName} aria-label="E-posti muudatused">
          {emailChanges.map((change) => (
            <div key={`${change.index}-${change.field}`} className={changeRowClassName}>
              <div className={changeNameClassName}>
                {change.name || "Kontakt"} <span className={changeValueClassName}>({change.slug || "-"})</span>
              </div>
              <div className={changeValueClassName}>Vana: {change.oldValue || "-"}</div>
              <div className={changeValueClassName}>Uus: {change.newValue || "-"}</div>
            </div>
          ))}
        </div>
      ) : status?.check?.reportExists ? (
        <p className={messageClassName}>Viimases raportis e-posti muudatusi ei olnud.</p>
      ) : null}
      {status?.check?.reportExists ? (
        <p className={messageClassName}>
          Viimane raport: {status.check.reportFile}; kandidaatfail: {status.check.outputFile}.
          {status.check.appliedAt ? ` Rakendatud: ${status.check.appliedAt}.` : ""}
        </p>
      ) : null}
      {status?.generatedAt ? <p className={messageClassName}>Viimane koondamine: {status.generatedAt}</p> : null}
    </section>
  );
}
