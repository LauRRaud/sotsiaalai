"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

const CARD_CLASS = "rounded-[1rem] bg-white/55 p-4 shadow-[0_8px_24px_rgba(60,40,40,0.08)] backdrop-blur";
const BUTTON_CLASS = "rounded-[0.75rem] border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-[color:var(--documents-page-text)] transition hover:bg-white";
const HEADER_CELL_CLASS = "border-b border-black/10 p-2 align-top";
const BODY_CELL_CLASS = "border-b border-black/5 p-2 align-top";

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

export default function RagAdminSourcePackagesScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rag/source-packages?limit=100", { cache: "no-store" });
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
  }, []);

  const summary = useMemo(() => ({
    total: items.length,
    active: countBy(items, item => item.active === true),
    needsReview: countBy(items, item => item.status === "needs_review"),
    pending: countBy(items, item => item.reviewStatus === "pending"),
    reviewed: countBy(items, item => item.reviewStatus === "reviewed"),
    archived: countBy(items, item => item.reviewStatus === "archived"),
    missingForms: countBy(items, item => item.reviewFlags?.missing_forms),
    missingContacts: countBy(items, item => item.reviewFlags?.missing_contacts),
    missingLegalBasis: countBy(items, item => item.reviewFlags?.missing_legal_basis)
  }), [items]);

  async function runAction(id, action) {
    setBusyId(`${id}:${action}`);
    setError("");
    try {
      const res = await fetch(`/api/admin/rag/source-packages/${encodeURIComponent(id)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || data?.ok !== true) throw new Error(data?.message || "Review action failed");
      await load();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="flex flex-col gap-3 text-[color:var(--documents-page-text)]">
      <section className={CARD_CLASS}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total", summary.total],
            ["Active", summary.active],
            ["Needs review", summary.needsReview],
            ["Pending", summary.pending],
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
          <h2 className="text-lg font-semibold">Source packages</h2>
          <button type="button" className={BUTTON_CLASS} onClick={load} disabled={loading}>
            Refresh
          </button>
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
              {items.map(item => {
                const flags = flagList(item.reviewFlags);
                const expanded = expandedId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr className="align-top">
                      <td className={BODY_CELL_CLASS}>
                        <button type="button" className="max-w-full whitespace-normal break-words text-left font-medium leading-6 underline-offset-2 hover:underline" onClick={() => setExpandedId(expanded ? "" : item.id)}>
                          {item.title || item.packageId}
                        </button>
                      </td>
                      <td className={`${BODY_CELL_CLASS} break-all text-[0.92rem]`}>{item.municipalityId || "-"}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{item.packageType || "-"}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{item.status}</td>
                      <td className={`${BODY_CELL_CLASS} break-words`}>{item.reviewStatus}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words leading-6`}>{Array.isArray(item.missingSections) && item.missingSections.length ? item.missingSections.join(", ") : "-"}</td>
                      <td className={BODY_CELL_CLASS}>{item.version}</td>
                      <td className={BODY_CELL_CLASS}>{item.active ? "yes" : "no"}</td>
                      <td className={`${BODY_CELL_CLASS} whitespace-normal break-words`}>{formatDate(item.lastBuiltAt)}</td>
                      <td className={BODY_CELL_CLASS}>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId || item.reviewStatus === "reviewed"} onClick={() => runAction(item.id, "mark_reviewed")}>
                            {busyId === `${item.id}:mark_reviewed` ? "Saving" : "Mark reviewed"}
                          </button>
                          <button type="button" className={BUTTON_CLASS} disabled={!!busyId || item.reviewStatus === "archived"} onClick={() => runAction(item.id, "archive")}>
                            {busyId === `${item.id}:archive` ? "Saving" : "Archive"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr key={`${item.id}-detail`}>
                        <td colSpan={10} className="border-b border-black/5 bg-white/35 p-3">
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(240px,0.9fr)]">
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">Package</div>
                              <div className="break-all">packageId: {item.packageId}</div>
                              <div className="break-all">canonicalItemId: {item.canonicalItemId}</div>
                              <div className="whitespace-normal break-words">review flags: {flags.length ? flags.join(", ") : "-"}</div>
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="font-semibold">Sections</div>
                              {Object.entries(item.sectionSummary || {}).map(([key, value]) => (
                                <div key={key} className="flex items-baseline justify-between gap-3">
                                  <span className="break-words">{key}</span>
                                  <span className="shrink-0">{value?.count || 0}</span>
                                </div>
                              ))}
                            </div>
                            <div className="min-w-0 lg:col-span-2">
                              <div className="font-semibold">Sources</div>
                              <div className="mt-2 space-y-1.5">
                                {(item.sourceMembership || []).map(source => (
                                  <div key={source.source_id} className="rounded-[0.75rem] bg-white/45 px-3 py-2 text-xs leading-5">
                                    <div className="break-all font-medium">{source.source_id}</div>
                                    <div className="whitespace-normal break-words opacity-80">
                                      {source.source_type || "-"} | {(source.sections || []).join(", ") || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
