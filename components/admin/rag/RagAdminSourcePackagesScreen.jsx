"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

const CARD_CLASS = "rounded-[1rem] bg-white/55 p-4 shadow-[0_8px_24px_rgba(60,40,40,0.08)] backdrop-blur";
const BUTTON_CLASS = "rounded-[0.75rem] border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-[color:var(--documents-page-text)] transition hover:bg-white";

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
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.04em] opacity-70">
                <th className="border-b border-black/10 p-2">Title</th>
                <th className="border-b border-black/10 p-2">Municipality</th>
                <th className="border-b border-black/10 p-2">Type</th>
                <th className="border-b border-black/10 p-2">Status</th>
                <th className="border-b border-black/10 p-2">Review</th>
                <th className="border-b border-black/10 p-2">Missing</th>
                <th className="border-b border-black/10 p-2">Version</th>
                <th className="border-b border-black/10 p-2">Active</th>
                <th className="border-b border-black/10 p-2">Last built</th>
                <th className="border-b border-black/10 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const flags = flagList(item.reviewFlags);
                const expanded = expandedId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr className="align-top">
                      <td className="border-b border-black/5 p-2">
                        <button type="button" className="text-left font-medium underline-offset-2 hover:underline" onClick={() => setExpandedId(expanded ? "" : item.id)}>
                          {item.title || item.packageId}
                        </button>
                      </td>
                      <td className="border-b border-black/5 p-2">{item.municipalityId || "-"}</td>
                      <td className="border-b border-black/5 p-2">{item.packageType || "-"}</td>
                      <td className="border-b border-black/5 p-2">{item.status}</td>
                      <td className="border-b border-black/5 p-2">{item.reviewStatus}</td>
                      <td className="border-b border-black/5 p-2">{Array.isArray(item.missingSections) && item.missingSections.length ? item.missingSections.join(", ") : "-"}</td>
                      <td className="border-b border-black/5 p-2">{item.version}</td>
                      <td className="border-b border-black/5 p-2">{item.active ? "yes" : "no"}</td>
                      <td className="border-b border-black/5 p-2">{formatDate(item.lastBuiltAt)}</td>
                      <td className="border-b border-black/5 p-2">
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
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="font-semibold">Package</div>
                              <div>packageId: {item.packageId}</div>
                              <div>canonicalItemId: {item.canonicalItemId}</div>
                              <div>review flags: {flags.length ? flags.join(", ") : "-"}</div>
                            </div>
                            <div>
                              <div className="font-semibold">Sections</div>
                              {Object.entries(item.sectionSummary || {}).map(([key, value]) => (
                                <div key={key}>{key}: {value?.count || 0}</div>
                              ))}
                            </div>
                            <div className="md:col-span-2">
                              <div className="font-semibold">Sources</div>
                              {(item.sourceMembership || []).map(source => (
                                <div key={source.source_id} className="text-xs">
                                  {source.source_id} - {source.source_type || "-"} - {(source.sections || []).join(", ")}
                                </div>
                              ))}
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
