"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { localizePath } from "@/lib/localizePath";

const CARD_CLASS = "rounded-[1rem] bg-white/55 p-4 shadow-[0_8px_24px_rgba(60,40,40,0.08)] backdrop-blur";
const BUTTON_CLASS = "rounded-[0.75rem] border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-[color:var(--documents-page-text)] transition hover:bg-white";
const HEADER_CELL_CLASS = "border-b border-black/10 p-2 align-top";
const BODY_CELL_CLASS = "border-b border-black/5 p-2 align-top";
const ACCEPTANCE_DISPOSITIONS = [
  ["not_published", "Pole avaldatud KOV veebis"],
  ["not_applicable", "Ei kohaldu"],
  ["checked_missing_form", "Kontrollitud, vorm puudub"],
  ["deadline_not_published", "Kontrollitud, tahtaega ei avaldata"]
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("et-EE");
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
    confirmed: "border-emerald-200 bg-emerald-50 text-emerald-900",
    missing: "border-amber-200 bg-amber-50 text-amber-900",
    unsupported: "border-red-200 bg-red-50 text-red-900",
    default: "border-black/10 bg-white/60 text-[color:var(--documents-page-text)]"
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

function effectiveReviewLabel(item = {}) {
  const effective = effectiveReviewStatus(item);
  const raw = String(item.reviewStatus || "pending").trim() || "pending";
  if (effective === raw) return effective;
  return `${effective} (raw: ${raw})`;
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

export default function RagAdminSourcePackagesScreen() {
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

  async function load() {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ limit: "100" });
      if (municipalityId) query.set("municipalityId", municipalityId);

      const res = await fetch(`/api/admin/rag/source-packages?${query.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || "Source package load failed");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [municipalityId]);

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
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || "Source package detail load failed");
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
      const reviewNote = needsNote ? window.prompt("Optional review note", "") ?? "" : "";
      const res = await fetch(`/api/admin/rag/source-packages/${encodeURIComponent(id)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNote })
      });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || "Review action failed");
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
      const reviewNote = window.prompt("Optional review note", "") ?? "";
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
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || "Accept action failed");
      setDetailsById(current => ({ ...current, [id]: data.item || null }));
      await load();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setAcceptBusyKey("");
    }
  }

  return (
    <div className="flex flex-col gap-3 text-[color:var(--documents-page-text)]">
      <section className={CARD_CLASS}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total", summary.total],
            ["Active", summary.active],
            ["Needs action", summary.needsReview],
            ["Pending", summary.pending],
            ["Info warnings", summary.infoWarnings],
            ["Reviewed", summary.reviewed],
            ["Archived", summary.archived],
            ["Missing forms", summary.missingForms],
            ["Missing contacts", summary.missingContacts],
            ["Missing legal basis", summary.missingLegalBasis]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[0.75rem] bg-white/55 p-3">
              <div className="text-xs uppercase tracking-[0.04em] opacity-70">{label}</div>
              <div className="text-xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={CARD_CLASS}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold">Source packages</h2>
            {municipalityId ? <div className="text-sm opacity-70">Municipality filter: {municipalityId}</div> : null}
          </div>
          <button type="button" className={BUTTON_CLASS} onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showInfoWarnings} onChange={event => setShowInfoWarnings(event.target.checked)} />
            Naita info/warnings
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />
            Naita archived
          </label>
          <span className="opacity-70">Default queue: ainult active blocker/review probleemid.</span>
        </div>

        {error ? <div className="mb-3 rounded-[0.75rem] bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
        {loading ? <div className="text-sm opacity-70">Loading...</div> : null}

        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full table-fixed border-separate border-spacing-0 text-left text-sm">
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
              <tr className="text-xs uppercase tracking-[0.04em] opacity-70">
                <th className={HEADER_CELL_CLASS}>Title</th>
                <th className={HEADER_CELL_CLASS}>Municipality</th>
                <th className={HEADER_CELL_CLASS}>Type</th>
                <th className={HEADER_CELL_CLASS}>Status</th>
                <th className={HEADER_CELL_CLASS}>Review</th>
                <th className={HEADER_CELL_CLASS}>Missing</th>
                <th className={HEADER_CELL_CLASS}>Version</th>
                <th className={HEADER_CELL_CLASS}>Active</th>
                <th className={HEADER_CELL_CLASS}>Last built</th>
                <th className={HEADER_CELL_CLASS}>Actions</th>
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
                      <td className={`${BODY_CELL_CLASS} break-words`}>{item.status}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{effectiveReviewLabel(item)}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words leading-6`}>
                        {visibleReasons.length ? (
                          <div className="flex flex-wrap gap-1">
                            {visibleReasons.map(reason => (
                              <span key={reason.code} className={badgeClass(reason.accepted ? "confirmed" : severityTone(reason.severity))}>
                                {reason.severity}: {formatSectionName(reason.code)}{reason.accepted ? " accepted" : ""}
                              </span>
                            ))}
                          </div>
                        ) : "-"}
                      </td>
                      <td className={BODY_CELL_CLASS}>{item.version}</td>
                      <td className={BODY_CELL_CLASS}>{item.active ? "yes" : "no"}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words`}>{formatDate(item.lastBuiltAt)}</td>
                      <td className={BODY_CELL_CLASS}>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId || effectiveReview === "reviewed" || effectiveReview === "archived"} onClick={() => runAction(item.id, "mark_reviewed")}>
                            {busyId === `${item.id}:mark_reviewed` ? "Saving" : "Mark reviewed"}
                          </button>
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId || effectiveReview === "archived"} onClick={() => runAction(item.id, "archive")}>
                            {busyId === `${item.id}:archive` ? "Saving" : "Archive"}
                          </button>
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId || item.active === true} onClick={() => runAction(item.id, "restore_active")}>
                            {busyId === `${item.id}:restore_active` ? "Saving" : "Restore active"}
                          </button>
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId} onClick={() => runAction(item.id, "recompute")}>
                            {busyId === `${item.id}:recompute` ? "Saving" : "Recompute"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr key={`${item.id}-detail`}>
                        <td colSpan={10} className="border-b border-black/5 bg-white/35 p-3">
                          {detailLoadingId === item.id && !detailsById[item.id] ? (
                            <div className="text-sm opacity-70">Loading details...</div>
                          ) : (
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(240px,0.9fr)]">
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">Package</div>
                              <div className="break-all">packageId: {detail.packageId}</div>
                              <div className="break-all">canonicalItemId: {detail.canonicalItemId}</div>
                              <div className="whitespace-normal break-words">review flags: {flags.length ? flags.join(", ") : "-"}</div>
                              <div className="mt-3">
                                <div className="font-semibold">Review queue</div>
                                <div className="mt-1 space-y-1">
                                  {(detail.reviewReasons || []).length ? (
                                    detail.reviewReasons.map(reason => (
                                      <div key={reason.code} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-sm leading-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className={badgeClass(reason.accepted ? "confirmed" : severityTone(reason.severity))}>{reason.severity}</span>
                                          {reason.accepted ? <span className={badgeClass("confirmed")}>accepted</span> : null}
                                          <span className="font-medium">{reason.label}</span>
                                        </div>
                                        <div className="mt-1 break-all text-xs opacity-80">item id: {reason.repair?.canonicalItemId || detail.canonicalItemId || "-"}</div>
                                        <div className="mt-1 break-words text-xs opacity-80">Parandamise koht: {reason.repair?.fileHint || "-"}</div>
                                        <div className="mt-1 break-words text-xs opacity-80">
                                          sourceKeys: {(reason.repair?.sourceKeys || []).join(", ") || "-"}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <Link
                                            href={localizePath(reason.repair?.kovHref || "/admin/rag/kov")}
                                            className={BUTTON_CLASS}
                                          >
                                            Paranda
                                          </Link>
                                          {reason.acceptable && !reason.accepted ? ACCEPTANCE_DISPOSITIONS.map(([value, label]) => (
                                            <button
                                              key={value}
                                              type="button"
                                              className={BUTTON_CLASS}
                                              disabled={!!acceptBusyKey}
                                              onClick={() => acceptReason(item.id, reason, value)}
                                            >
                                              {acceptBusyKey === `${item.id}:${reason.code}:${value}` ? "Salvestan" : label}
                                            </button>
                                          )) : null}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm opacity-70">No review reasons.</div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="font-semibold">Attribution readability</div>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                  <span className={badgeClass(detail.packageAttributionChecked ? "confirmed" : "default")}>
                                    package attribution: {detail.packageAttributionChecked ? "checked" : "not checked"}
                                  </span>
                                  <span className={badgeClass(detail.highRiskAttributionChecked ? "confirmed" : "default")}>
                                    high risk attribution: {detail.highRiskAttributionChecked ? "checked" : "not checked"}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs uppercase tracking-[0.04em] opacity-70">Attribution flags</div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {(detail.attributionFlags || []).length ? (
                                      detail.attributionFlags.map(flag => (
                                        <span key={flag} className={badgeClass("missing")}>{formatSectionName(flag)}</span>
                                      ))
                                    ) : (
                                      <span className="text-sm opacity-70">-</span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  {Object.entries(detail.sectionAttributionSummary || {}).map(([section, info]) => {
                                    const missing = info?.evidence_strength === "missing";
                                    const unsupported = info?.evidence_strength === "unsupported";
                                    return (
                                      <div key={section} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-sm leading-5">
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
                                        <div className="mt-1 break-all text-xs opacity-80">
                                          sources: {(info?.source_ids || []).join(", ") || "-"}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="font-semibold">Gap summary</div>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  {Object.entries(detail.gapSummary || {}).map(([section, gap]) => (
                                    <div key={section} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-sm leading-5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{formatSectionName(section)}</span>
                                        <span className={badgeClass(gap?.status === "missing" ? "missing" : "confirmed")}>{gap?.status || "unknown"}</span>
                                      </div>
                                      <div className="mt-1 break-words text-xs opacity-80">
                                        reason: {formatSectionName(gap?.likelyReason) || "-"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">Sections</div>
                              {Object.entries(detail.sectionSummary || {}).map(([key, value]) => (
                                <div key={key} className="flex items-baseline justify-between gap-3">
                                  <span className="break-words">{key}</span>
                                  <span className="shrink-0">{value?.count || 0}</span>
                                </div>
                              ))}
                            </div>
                            <div className="min-w-0 lg:col-span-2">
                              <div className="font-semibold">Sources</div>
                              <div className="mt-2 space-y-1.5">
                                {(detail.sourceMembership || []).map(source => (
                                  <div key={source.source_id} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-xs leading-5">
                                    <div className="break-all font-medium">{source.source_id}</div>
                                    <div className="whitespace-normal break-words opacity-80">
                                      {source.source_type || "-"} | {(source.sections || []).join(", ") || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="min-w-0 lg:col-span-2">
                              <div className="font-semibold">Review history</div>
                              <div className="mt-2 space-y-1.5">
                                {(detail.history || []).length ? (
                                  detail.history.map(entry => (
                                    <div key={entry.id} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-xs leading-5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{entry.action}</span>
                                        <span className="opacity-70">{formatDate(entry.createdAt)}</span>
                                        {entry.actor ? <span className="opacity-70">{entry.actor}</span> : null}
                                      </div>
                                      <div className="whitespace-normal break-words opacity-80">
                                        {entry.fromStatus || "-"} / {entry.fromReviewStatus || "-"} / {entry.fromActive ? "active" : "inactive"} to {entry.toStatus || "-"} / {entry.toReviewStatus || "-"} / {entry.toActive ? "active" : "inactive"}
                                      </div>
                                      {entry.note ? <div className="whitespace-normal break-words">{entry.note}</div> : null}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm opacity-70">No review history yet.</div>
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
                  <td colSpan={10} className="p-6 text-center text-sm opacity-70">
                    Aktiivseid SourcePackage ulevaatuse ridu pole.
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
