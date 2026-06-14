"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";

import { localizePath } from "@/lib/localizePath";

import {
  cardClassName,
  rootClassName,
  rootInputVars
} from "./ragAdminShared";

const SUMMARY_CARD_CLASS =
  "rounded-[0.82rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2.5 shadow-[var(--admin-shadow-soft)]";
const actionButtonClassName =
  "!min-h-[2.02rem] " +
  "[--btn-primary-bg:var(--admin-surface-2)] " +
  "[--btn-primary-bg-hover:var(--admin-accent-soft)] " +
  "[--btn-primary-border:1px_solid_var(--admin-border-strong)] " +
  "[--btn-primary-shadow:0_1px_3px_rgba(15,23,42,0.09)]";
const HEADER_CELL_CLASS = "border-b border-[color:var(--admin-border)] p-2 align-top font-semibold";
const BODY_CELL_CLASS = "border-b border-[color:var(--admin-border)] p-2 align-top";
const ACCEPTANCE_DISPOSITIONS = [
  ["not_published", { et: "Pole KOV veebis avaldatud", en: "Not published on municipal site" }],
  ["not_applicable", { et: "Ei kohaldu", en: "Not applicable" }],
  ["checked_missing_form", { et: "Kontrollitud, vorm puudub", en: "Checked, form missing" }],
  ["deadline_not_published", { et: "Kontrollitud, tähtaega ei avaldata", en: "Checked, deadline not published" }]
];

const SOURCE_PACKAGE_COPY = {
  et: {
    summary: [
      ["total", "Kokku"],
      ["active", "Aktiivsed"],
      ["needsReview", "Vajab tegevust"],
      ["pending", "Ootel"],
      ["infoWarnings", "Infohoiatused"],
      ["reviewed", "Üle vaadatud"],
      ["archived", "Arhiveeritud"],
      ["missingForms", "Puuduvad vormid"],
      ["missingContacts", "Puuduvad kontaktid"],
      ["missingLegalBasis", "Puuduv õiguslik alus"]
    ],
    title: "Lähtepaketid",
    municipalityFilter: "KOV filter",
    refresh: "Värskenda",
    showInfoWarnings: "Näita infohoiatusi",
    showArchived: "Näita arhiveerituid",
    defaultQueue: "Vaikimisi kuvatakse ainult aktiivsed blokeerivad ja ülevaatust vajavad probleemid.",
    loading: "Laen...",
    loadingDetails: "Laen detaile...",
    empty: "Aktiivseid lähtepakettide ülevaatuse ridu ei ole.",
    optionalReviewNote: "Ülevaatuse märkus (valikuline)",
    errors: {
      loadFailed: "Lähtepakettide laadimine ebaõnnestus",
      detailFailed: "Lähtepaketi detailide laadimine ebaõnnestus",
      actionFailed: "Ülevaatuse toiming ebaõnnestus",
      acceptFailed: "Puuduse aktsepteerimine ebaõnnestus"
    },
    columns: {
      title: "Pealkiri",
      municipality: "KOV",
      type: "Tüüp",
      status: "Staatus",
      review: "Ülevaatus",
      missing: "Puudused",
      version: "Versioon",
      active: "Aktiivne",
      lastBuilt: "Viimati koostatud",
      actions: "Tegevused"
    },
    actions: {
      markReviewed: "Märgi üle vaadatuks",
      archive: "Arhiveeri",
      restoreActive: "Taasta aktiivseks",
      recompute: "Arvuta uuesti",
      saving: "Salvestan",
      fix: "Paranda"
    },
    detail: {
      package: "Pakett",
      reviewFlags: "ülevaatuse märgid",
      reviewQueue: "Ülevaatuse järjekord",
      noReviewReasons: "Ülevaatuse põhjuseid ei ole.",
      repairLocation: "Parandamise koht",
      attribution: "Viidatavuse loetavus",
      attributionFlags: "Viidatavuse märgid",
      gapSummary: "Lünkade kokkuvõte",
      sections: "Jaotised",
      sources: "Allikad",
      reviewHistory: "Ülevaatuse ajalugu",
      noReviewHistory: "Ülevaatuse ajalugu veel ei ole.",
      packageAttribution: "paketi viidatavus",
      highRiskAttribution: "kõrge riski viidatavus",
      checked: "kontrollitud",
      notChecked: "kontrollimata",
      accepted: "aktsepteeritud",
      itemId: "kirje id",
      reason: "põhjus",
      to: "->"
    },
    boolean: {
      yes: "jah",
      no: "ei"
    },
    severity: {
      blocker: "blokeeriv",
      review: "ülevaatus",
      info: "info"
    },
    reviewStatus: {
      pending: "ootel",
      reviewed: "üle vaadatud",
      archived: "arhiveeritud"
    }
  },
  en: {
    summary: [
      ["total", "Total"],
      ["active", "Active"],
      ["needsReview", "Needs action"],
      ["pending", "Pending"],
      ["infoWarnings", "Info warnings"],
      ["reviewed", "Reviewed"],
      ["archived", "Archived"],
      ["missingForms", "Missing forms"],
      ["missingContacts", "Missing contacts"],
      ["missingLegalBasis", "Missing legal basis"]
    ],
    title: "Source packages",
    municipalityFilter: "Municipality filter",
    refresh: "Refresh",
    showInfoWarnings: "Show info warnings",
    showArchived: "Show archived",
    defaultQueue: "Default queue: only active blocker and review issues.",
    loading: "Loading...",
    loadingDetails: "Loading details...",
    empty: "No active SourcePackage review rows.",
    optionalReviewNote: "Optional review note",
    errors: {
      loadFailed: "Source package load failed",
      detailFailed: "Source package detail load failed",
      actionFailed: "Review action failed",
      acceptFailed: "Accept action failed"
    },
    columns: {
      title: "Title",
      municipality: "Municipality",
      type: "Type",
      status: "Status",
      review: "Review",
      missing: "Missing",
      version: "Version",
      active: "Active",
      lastBuilt: "Last built",
      actions: "Actions"
    },
    actions: {
      markReviewed: "Mark reviewed",
      archive: "Archive",
      restoreActive: "Restore active",
      recompute: "Recompute",
      saving: "Saving",
      fix: "Fix"
    },
    detail: {
      package: "Package",
      reviewFlags: "review flags",
      reviewQueue: "Review queue",
      noReviewReasons: "No review reasons.",
      repairLocation: "Repair location",
      attribution: "Attribution readability",
      attributionFlags: "Attribution flags",
      gapSummary: "Gap summary",
      sections: "Sections",
      sources: "Sources",
      reviewHistory: "Review history",
      noReviewHistory: "No review history yet.",
      packageAttribution: "package attribution",
      highRiskAttribution: "high risk attribution",
      checked: "checked",
      notChecked: "not checked",
      accepted: "accepted",
      itemId: "item id",
      reason: "reason",
      to: "to"
    },
    boolean: {
      yes: "yes",
      no: "no"
    },
    severity: {
      blocker: "blocker",
      review: "review",
      info: "info"
    },
    reviewStatus: {
      pending: "pending",
      reviewed: "reviewed",
      archived: "archived"
    }
  }
};

function isEstonian(locale) {
  return String(locale || "").toLowerCase().startsWith("et");
}

function getCopy(locale) {
  return SOURCE_PACKAGE_COPY[isEstonian(locale) ? "et" : "en"];
}

function formatDate(value, localeTag = "en-US") {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString(localeTag);
}

function flagList(flags = {}) {
  return Object.entries(flags)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replaceAll("_", " "));
}

function countBy(items = [], predicate) {
  return items.filter(predicate).length;
}

function formatSectionName(value) {
  return String(value || "").replaceAll("_", " ");
}

function badgeClass(tone = "default") {
  const tones = {
    confirmed: "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_16%,var(--admin-surface-3)_84%)] text-[color:var(--admin-text)]",
    missing: "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_16%,var(--admin-surface-3)_84%)] text-[color:var(--admin-text)]",
    unsupported: "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_16%,var(--admin-surface-3)_84%)] text-[color:var(--admin-text)]",
    default: "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] text-[color:var(--admin-text)]"
  };
  return `inline-flex max-w-full items-center rounded-full border px-2 py-1 text-xs leading-4 ${tones[tone] || tones.default}`;
}

function effectiveReviewStatus(item = {}) {
  if (item.status === "archived" || item.active !== true) return "archived";
  const actionable = Array.isArray(item.actionableReviewReasons) ? item.actionableReviewReasons : [];
  if (!actionable.length && String(item.reviewStatus || "") === "pending") return "reviewed";
  if (item.reviewStatus === "reviewed") return "reviewed";
  return "pending";
}

function reviewStatusLabel(status, copy) {
  const normalized = String(status || "pending").trim() || "pending";
  return copy.reviewStatus[normalized] || formatSectionName(normalized);
}

function effectiveReviewLabel(item = {}, copy) {
  const effective = effectiveReviewStatus(item);
  const raw = String(item.reviewStatus || "pending").trim() || "pending";
  if (effective === raw) return reviewStatusLabel(effective, copy);
  return `${reviewStatusLabel(effective, copy)} (${copy === SOURCE_PACKAGE_COPY.et ? "algne" : "raw"}: ${reviewStatusLabel(raw, copy)})`;
}

function isArchivedItem(item = {}) {
  return item.status === "archived" || item.active !== true || effectiveReviewStatus(item) === "archived";
}

function activeActionableReasons(item = {}) {
  if (isArchivedItem(item)) return [];
  return Array.isArray(item.actionableReviewReasons) ? item.actionableReviewReasons : [];
}

function activeInfoReasons(item = {}) {
  if (isArchivedItem(item)) return [];
  return Array.isArray(item.infoReviewReasons) ? item.infoReviewReasons : [];
}

function shouldShowItem(item = {}, { showInfoWarnings = false, showArchived = false } = {}) {
  if (isArchivedItem(item)) return showArchived;
  if (activeActionableReasons(item).length) return true;
  return showInfoWarnings && activeInfoReasons(item).length > 0;
}

function severityTone(severity) {
  if (severity === "blocker") return "unsupported";
  if (severity === "review") return "missing";
  if (severity === "info") return "default";
  return "default";
}

export default function RagAdminSourcePackagesScreen({ locale = "en" }) {
  const copy = getCopy(locale);
  const localeTag = isEstonian(locale) ? "et-EE" : "en-US";
  const searchParams = useSearchParams();
  const municipalityId = String(searchParams?.get("municipalityId") || "").trim();
  const [items, setItems] = useState([]);
  const [detailsById, setDetailsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [acceptBusyKey, setAcceptBusyKey] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [showInfoWarnings, setShowInfoWarnings] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ limit: "100" });
      if (municipalityId) query.set("municipalityId", municipalityId);

      const res = await fetch(`/api/admin/rag/source-packages?${query.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || copy.errors.loadFailed);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [copy.errors.loadFailed, municipalityId]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => ({
    total: items.length,
    active: countBy(items, item => item.active === true),
    needsReview: countBy(items, item => activeActionableReasons(item).length > 0),
    pending: countBy(items, item => activeActionableReasons(item).length > 0),
    infoWarnings: countBy(items, item => activeInfoReasons(item).length > 0),
    reviewed: countBy(items, item => effectiveReviewStatus(item) === "reviewed"),
    archived: countBy(items, item => effectiveReviewStatus(item) === "archived"),
    missingForms: countBy(items, item => item.reviewFlags?.missing_forms),
    missingContacts: countBy(items, item => item.reviewFlags?.missing_contacts),
    missingLegalBasis: countBy(items, item => item.reviewFlags?.missing_legal_basis)
  }), [items]);

  const visibleItems = useMemo(
    () => items.filter(item => shouldShowItem(item, { showInfoWarnings, showArchived })),
    [items, showArchived, showInfoWarnings]
  );

  async function loadDetail(id) {
    setDetailLoadingId(id);
    try {
      const res = await fetch(`/api/admin/rag/source-packages/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || copy.errors.detailFailed);
      setDetailsById(current => ({ ...current, [id]: data.item || null }));
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setDetailLoadingId("");
    }
  }

  async function toggleExpanded(id) {
    if (expandedId === id) {
      setExpandedId("");
      return;
    }
    setExpandedId(id);
    if (!detailsById[id]) await loadDetail(id);
  }

  async function runAction(id, action) {
    setBusyId(`${id}:${action}`);
    setError("");
    try {
      const needsNote = action !== "recompute";
      const reviewNote = needsNote ? window.prompt(copy.optionalReviewNote, "") ?? "" : "";
      const res = await fetch(`/api/admin/rag/source-packages/${encodeURIComponent(id)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNote })
      });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || copy.errors.actionFailed);
      setDetailsById(current => ({ ...current, [id]: data.item || null }));
      await load();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setBusyId("");
    }
  }

  async function acceptReason(id, reason, disposition) {
    const key = `${id}:${reason.code}:${disposition}`;
    setAcceptBusyKey(key);
    setError("");
    try {
      const reviewNote = window.prompt(copy.optionalReviewNote, "") ?? "";
      const res = await fetch(`/api/admin/rag/source-packages/${encodeURIComponent(id)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_gap",
          acceptedReasonCode: reason.code,
          acceptedDisposition: disposition,
          reviewNote
        })
      });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || copy.errors.acceptFailed);
      setDetailsById(current => ({ ...current, [id]: data.item || null }));
      await load();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setAcceptBusyKey("");
    }
  }

  return (
    <div className={rootClassName} style={rootInputVars}>
      <section className={cardClassName}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {copy.summary.map(([key, label]) => (
            <div key={key} className={SUMMARY_CARD_CLASS}>
              <div className="text-xs uppercase tracking-[0.04em] text-[color:var(--admin-muted)]">{label}</div>
              <div className="text-xl font-semibold text-[color:var(--admin-text)]">{summary[key]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClassName}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-[color:var(--admin-text)]">{copy.title}</h2>
            {municipalityId ? <div className="text-sm text-[color:var(--admin-muted)]">{copy.municipalityFilter}: {municipalityId}</div> : null}
          </div>
          <Button type="button" variant="primary" size="sm" className={actionButtonClassName} onClick={load} disabled={loading}>
            {copy.refresh}
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[color:var(--admin-text)]">
          <label className="inline-flex items-center gap-2">
            <input className="accent-[color:var(--admin-accent)]" type="checkbox" checked={showInfoWarnings} onChange={event => setShowInfoWarnings(event.target.checked)} />
            {copy.showInfoWarnings}
          </label>
          <label className="inline-flex items-center gap-2">
            <input className="accent-[color:var(--admin-accent)]" type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />
            {copy.showArchived}
          </label>
          <span className="text-[color:var(--admin-muted)]">{copy.defaultQueue}</span>
        </div>

        {error ? (
          <div className="mb-3 rounded-[0.75rem] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_16%,var(--admin-surface-2)_84%)] p-3 text-sm text-[color:var(--admin-text)]">
            {error}
          </div>
        ) : null}
        {loading ? <div className="text-sm text-[color:var(--admin-muted)]">{copy.loading}</div> : null}

        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full table-fixed border-separate border-spacing-0 text-left text-sm text-[color:var(--admin-text)]">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="text-xs uppercase tracking-[0.04em] text-[color:var(--admin-muted)]">
                <th className={HEADER_CELL_CLASS}>{copy.columns.title}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.municipality}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.type}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.status}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.review}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.missing}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.version}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.active}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.lastBuilt}</th>
                <th className={HEADER_CELL_CLASS}>{copy.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map(item => {
                const detail = detailsById[item.id] || item;
                const flags = flagList(detail.reviewFlags);
                const expanded = expandedId === item.id;
                const effectiveReview = effectiveReviewStatus(item);
                const reasons = Array.isArray(item.reviewReasons) ? item.reviewReasons : [];
                const visibleReasons = reasons.filter(reason =>
                  showInfoWarnings || showArchived || reason.severity !== "info" || reason.accepted
                );
                return (
                  <Fragment key={item.id}>
                    <tr className="align-top">
                      <td className={BODY_CELL_CLASS}>
                        <button type="button" className="max-w-full whitespace-normal break-words text-left font-medium leading-6 underline-offset-2 hover:underline" onClick={() => toggleExpanded(item.id)}>
                          {item.title || item.packageId}
                        </button>
                      </td>
                      <td className={`${BODY_CELL_CLASS} break-all text-[0.92rem]`}>{item.municipalityId || "-"}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{item.packageType || "-"}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{formatSectionName(item.status)}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{effectiveReviewLabel(item, copy)}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words leading-6`}>
                        {visibleReasons.length ? (
                          <div className="flex flex-wrap gap-1">
                            {visibleReasons.map(reason => (
                              <span key={reason.code} className={badgeClass(reason.accepted ? "confirmed" : severityTone(reason.severity))}>
                                {copy.severity[reason.severity] || reason.severity}: {formatSectionName(reason.code)}{reason.accepted ? ` ${copy.detail.accepted}` : ""}
                              </span>
                            ))}
                          </div>
                        ) : "-"}
                      </td>
                      <td className={BODY_CELL_CLASS}>{item.version}</td>
                      <td className={BODY_CELL_CLASS}>{item.active ? copy.boolean.yes : copy.boolean.no}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words`}>{formatDate(item.lastBuiltAt, localeTag)}</td>
                      <td className={BODY_CELL_CLASS}>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="primary" size="sm" className={actionButtonClassName} disabled={!!busyId || effectiveReview === "reviewed" || effectiveReview === "archived"} onClick={() => runAction(item.id, "mark_reviewed")}>
                            {busyId === `${item.id}:mark_reviewed` ? copy.actions.saving : copy.actions.markReviewed}
                          </Button>
                          <Button type="button" variant="primary" size="sm" className={actionButtonClassName} disabled={!!busyId || effectiveReview === "archived"} onClick={() => runAction(item.id, "archive")}>
                            {busyId === `${item.id}:archive` ? copy.actions.saving : copy.actions.archive}
                          </Button>
                          <Button type="button" variant="primary" size="sm" className={actionButtonClassName} disabled={!!busyId || item.active === true} onClick={() => runAction(item.id, "restore_active")}>
                            {busyId === `${item.id}:restore_active` ? copy.actions.saving : copy.actions.restoreActive}
                          </Button>
                          <Button type="button" variant="primary" size="sm" className={actionButtonClassName} disabled={!!busyId} onClick={() => runAction(item.id, "recompute")}>
                            {busyId === `${item.id}:recompute` ? copy.actions.saving : copy.actions.recompute}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr key={`${item.id}-detail`}>
                        <td colSpan={10} className="border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3">
                          {detailLoadingId === item.id && !detailsById[item.id] ? (
                            <div className="text-sm text-[color:var(--admin-muted)]">{copy.loadingDetails}</div>
                          ) : (
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(240px,0.9fr)]">
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">{copy.detail.package}</div>
                              <div className="break-all">packageId: {detail.packageId}</div>
                              <div className="break-all">canonicalItemId: {detail.canonicalItemId}</div>
                              <div className="whitespace-normal break-words">{copy.detail.reviewFlags}: {flags.length ? flags.join(", ") : "-"}</div>
                              <div className="mt-3">
                                <div className="font-semibold">{copy.detail.reviewQueue}</div>
                                <div className="mt-1 space-y-1">
                                  {(detail.reviewReasons || []).length ? (
                                    detail.reviewReasons.map(reason => (
                                      <div key={reason.code} className="rounded-[0.75rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-sm leading-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className={badgeClass(reason.accepted ? "confirmed" : severityTone(reason.severity))}>{copy.severity[reason.severity] || reason.severity}</span>
                                          {reason.accepted ? <span className={badgeClass("confirmed")}>{copy.detail.accepted}</span> : null}
                                          <span className="font-medium">{reason.label}</span>
                                        </div>
                                        <div className="mt-1 break-all text-xs text-[color:var(--admin-muted)]">{copy.detail.itemId}: {reason.repair?.canonicalItemId || detail.canonicalItemId || "-"}</div>
                                        <div className="mt-1 break-words text-xs text-[color:var(--admin-muted)]">{copy.detail.repairLocation}: {reason.repair?.fileHint || "-"}</div>
                                        <div className="mt-1 break-words text-xs text-[color:var(--admin-muted)]">
                                          sourceKeys: {(reason.repair?.sourceKeys || []).join(", ") || "-"}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <Button as="a" href={localizePath(reason.repair?.kovHref || "/admin/rag/kov", locale)} variant="primary" size="sm" className={actionButtonClassName}>
                                            {copy.actions.fix}
                                          </Button>
                                          {reason.acceptable && !reason.accepted ? ACCEPTANCE_DISPOSITIONS.map(([value, labels]) => (
                                            <Button
                                              key={value}
                                              type="button"
                                              variant="primary"
                                              size="sm"
                                              className={actionButtonClassName}
                                              disabled={!!acceptBusyKey}
                                              onClick={() => acceptReason(item.id, reason, value)}
                                            >
                                              {acceptBusyKey === `${item.id}:${reason.code}:${value}` ? copy.actions.saving : labels[isEstonian(locale) ? "et" : "en"]}
                                            </Button>
                                          )) : null}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-[color:var(--admin-muted)]">{copy.detail.noReviewReasons}</div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="font-semibold">{copy.detail.attribution}</div>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                  <span className={badgeClass(detail.packageAttributionChecked ? "confirmed" : "default")}>
                                    {copy.detail.packageAttribution}: {detail.packageAttributionChecked ? copy.detail.checked : copy.detail.notChecked}
                                  </span>
                                  <span className={badgeClass(detail.highRiskAttributionChecked ? "confirmed" : "default")}>
                                    {copy.detail.highRiskAttribution}: {detail.highRiskAttributionChecked ? copy.detail.checked : copy.detail.notChecked}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs uppercase tracking-[0.04em] text-[color:var(--admin-muted)]">{copy.detail.attributionFlags}</div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {(detail.attributionFlags || []).length ? (
                                      detail.attributionFlags.map(flag => (
                                        <span key={flag} className={badgeClass("missing")}>{formatSectionName(flag)}</span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-[color:var(--admin-muted)]">-</span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  {Object.entries(detail.sectionAttributionSummary || {}).map(([section, info]) => {
                                    const missing = info?.evidence_strength === "missing";
                                    const unsupported = info?.evidence_strength === "unsupported";
                                    return (
                                      <div key={section} className="rounded-[0.75rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-sm leading-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-medium">{formatSectionName(section)}</span>
                                          <span className={badgeClass(missing ? "missing" : unsupported ? "unsupported" : "confirmed")}>
                                            {info?.evidence_strength || "unknown"}
                                          </span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {(info?.evidence_statuses || []).map(status => (
                                            <span key={status} className={badgeClass(status === "confirmed" ? "confirmed" : status === "missing_section" ? "missing" : "unsupported")}>
                                              {formatSectionName(status)}
                                            </span>
                                          ))}
                                        </div>
                                        <div className="mt-1 break-all text-xs text-[color:var(--admin-muted)]">
                                          sources: {(info?.source_ids || []).join(", ") || "-"}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="font-semibold">{copy.detail.gapSummary}</div>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  {Object.entries(detail.gapSummary || {}).map(([section, gap]) => (
                                    <div key={section} className="rounded-[0.75rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-sm leading-5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{formatSectionName(section)}</span>
                                        <span className={badgeClass(gap?.status === "missing" ? "missing" : "confirmed")}>{gap?.status || "unknown"}</span>
                                      </div>
                                      <div className="mt-1 break-words text-xs text-[color:var(--admin-muted)]">
                                        {copy.detail.reason}: {formatSectionName(gap?.likelyReason) || "-"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">{copy.detail.sections}</div>
                              {Object.entries(detail.sectionSummary || {}).map(([key, value]) => (
                                <div key={key} className="flex items-baseline justify-between gap-3">
                                  <span className="break-words">{key}</span>
                                  <span className="shrink-0">{value?.count || 0}</span>
                                </div>
                              ))}
                            </div>
                            <div className="min-w-0 lg:col-span-2">
                              <div className="font-semibold">{copy.detail.sources}</div>
                              <div className="mt-2 space-y-1.5">
                                {(detail.sourceMembership || []).map(source => (
                                  <div key={source.source_id} className="rounded-[0.75rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-xs leading-5">
                                    <div className="break-all font-medium">{source.source_id}</div>
                                    <div className="whitespace-normal break-words text-[color:var(--admin-muted)]">
                                      {source.source_type || "-"} | {(source.sections || []).join(", ") || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="min-w-0 lg:col-span-2">
                              <div className="font-semibold">{copy.detail.reviewHistory}</div>
                              <div className="mt-2 space-y-1.5">
                                {(detail.history || []).length ? (
                                  detail.history.map(entry => (
                                    <div key={entry.id} className="rounded-[0.75rem] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-xs leading-5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{entry.action}</span>
                                        <span className="text-[color:var(--admin-muted)]">{formatDate(entry.createdAt, localeTag)}</span>
                                        {entry.actor ? <span className="text-[color:var(--admin-muted)]">{entry.actor}</span> : null}
                                      </div>
                                      <div className="whitespace-normal break-words text-[color:var(--admin-muted)]">
                                        {entry.fromStatus || "-"} / {entry.fromReviewStatus || "-"} / {entry.fromActive ? "active" : "inactive"} {copy.detail.to} {entry.toStatus || "-"} / {entry.toReviewStatus || "-"} / {entry.toActive ? "active" : "inactive"}
                                      </div>
                                      {entry.note ? <div className="whitespace-normal break-words">{entry.note}</div> : null}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-[color:var(--admin-muted)]">{copy.detail.noReviewHistory}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {!loading && !visibleItems.length ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-sm text-[color:var(--admin-muted)]">
                    {copy.empty}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
