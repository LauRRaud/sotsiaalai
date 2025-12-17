"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const EVENT_OPTIONS = [
  "chat_request",
  "rag_search",
  "no_context",
  "crisis_detected",
  "rag_error",
  "openai_error",
];

const toNumber = (value) => {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (amount, currency = "EUR") => {
  const n = toNumber(amount);
  try {
    return new Intl.NumberFormat("et-EE", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed?.(2) || n} ${currency}`;
  }
};

const joinCounts = (obj = {}, order = []) => {
  const keys = order.length ? order : Object.keys(obj || {});
  const parts = [];
  for (const k of keys) {
    if (obj?.[k] == null) continue;
    parts.push(`${k}: ${obj[k]}`);
  }
  return parts.join(" · ");
};

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat("et-EE", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [isCrisisFilter, setIsCrisisFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/analytics/summary", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || data?.ok === false) throw new Error(data?.message || "Summary fetch failed");
        setSummary(data);
      } catch (err) {
        setError(err?.message || "Summary fetch failed");
      } finally {
        setLoadingSummary(false);
      }
    };
    loadSummary();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        if (eventFilter !== "all") params.set("event", eventFilter);
        if (isCrisisFilter === "true" || isCrisisFilter === "false") params.set("isCrisis", isCrisisFilter);
        const res = await fetch(`/api/admin/analytics/events?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || data?.ok === false) throw new Error(data?.message || "Events fetch failed");
        setEvents(data.items || []);
      } catch (err) {
        setError(err?.message || "Events fetch failed");
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [eventFilter, isCrisisFilter]);

  const groundingSummary = useMemo(() => {
    if (!summary?.averages?.groundingDistribution) return null;
    const dist = summary.averages.groundingDistribution;
    const total = (dist.weak || 0) + (dist.ok || 0) + (dist.strong || 0);
    if (!total) return null;
    return {
      weak: Math.round((100 * (dist.weak || 0)) / total),
      ok: Math.round((100 * (dist.ok || 0)) / total),
      strong: Math.round((100 * (dist.strong || 0)) / total),
    };
  }, [summary]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventFilter !== "all" && e.event !== eventFilter) return false;
      if (isCrisisFilter === "true" && e?.data?.isCrisis !== true) return false;
      if (isCrisisFilter === "false" && e?.data?.isCrisis === true) return false;
      return true;
    });
  }, [events, eventFilter, isCrisisFilter]);

  const metaSummary = (data = {}) => {
    const parts = [];
    if (typeof data.ragMatchCount === "number") parts.push(`matše: ${data.ragMatchCount}`);
    if (typeof data.groupCount === "number") parts.push(`grupid: ${data.groupCount}`);
    if (typeof data.grounding === "string") parts.push(`grounding: ${data.grounding}`);
    if (typeof data.chosenGroupCount === "number") parts.push(`valik: ${data.chosenGroupCount}`);
    if (typeof data.isCrisis === "boolean") parts.push(`kriis: ${data.isCrisis ? "jah" : "ei"}`);
    if (typeof data.hasHistory === "boolean") parts.push(`ajalugu: ${data.hasHistory ? "jah" : "ei"}`);
    return parts.join(" · ");
  };

  return (
    <div className="rag-admin" style={{ gap: 20 }}>
      <div className="flex-row space-between">
        <h1 className="title">Analytics</h1>
        <Link href="/admin/rag" className="btn" prefetch={false}>
          RAG haldus
        </Link>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="ingest-grid">
        <div className="card">
          <div className="card-title">Päringud (30p)</div>
          <div className="title">{loadingSummary ? "…" : summary?.totalRequests ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-title">RAG otsingud</div>
          <div className="title">{loadingSummary ? "…" : summary?.ragSearchCount ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-title">No-context</div>
          <div className="title">{loadingSummary ? "…" : summary?.noContextCount ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-title">Kriis</div>
          <div className="title">{loadingSummary ? "…" : summary?.totalCrisis ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-title">Keskmised (RAG)</div>
          <div className="muted">
            {loadingSummary
              ? "…"
              : `matše ${summary?.averages?.avgRagMatchCount?.toFixed?.(1) || "0"}, grupid ${summary?.averages?.avgGroupCount?.toFixed?.(1) || "0"}, valik ${summary?.averages?.avgChosenGroupCount?.toFixed?.(1) || "0"}`}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Grounding</div>
          <div className="muted">
            {groundingSummary
              ? `strong ${groundingSummary.strong}% · ok ${groundingSummary.ok}% · weak ${groundingSummary.weak}%`
              : loadingSummary
              ? "…"
              : "–"}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">RAG dokumendibaas</div>
        <div className="ingest-grid" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="card-title">Dokumente kokku</div>
            <div className="title">{loadingSummary ? "…" : summary?.ragDocs?.total ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">FAILED</div>
            <div className="title">{loadingSummary ? "…" : summary?.ragDocs?.failed ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Veaga (30p)</div>
            <div className="title">{loadingSummary ? "…" : summary?.ragDocs?.error30d ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Statused</div>
            <div className="muted">
              {loadingSummary
                ? "…"
                : joinCounts(summary?.ragDocs?.byStatus, ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]) || "—"}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Auditoorium</div>
            <div className="muted">
              {loadingSummary ? "…" : joinCounts(summary?.ragDocs?.byAudience, ["CLIENT", "SOCIAL_WORKER", "BOTH"]) || "—"}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Tüüp</div>
            <div className="muted">{loadingSummary ? "…" : joinCounts(summary?.ragDocs?.byType, ["FILE", "URL"]) || "—"}</div>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="rag-table">
            <thead>
              <tr>
                <th>Aeg</th>
                <th>Pealkiri</th>
                <th>Status</th>
                <th>Tüüp</th>
                <th>Auditoorium</th>
                <th>Allikas</th>
              </tr>
            </thead>
            <tbody>
              {loadingSummary ? (
                <tr>
                  <td colSpan={6}>Laen…</td>
                </tr>
              ) : (summary?.ragDocs?.recent || []).length ? (
                (summary?.ragDocs?.recent || []).map((d) => {
                  const source = (d.sourceUrl || d.fileName || "").toString();
                  return (
                    <tr key={d.id}>
                      <td>{formatDate(d.insertedAt || d.createdAt)}</td>
                      <td className="cell-sub">{d.title || "(pealkirjata)"}</td>
                      <td>{d.status}</td>
                      <td>{d.type}</td>
                      <td>{d.audience}</td>
                      <td className="cell-sub">{source ? source.slice(0, 80) : "—"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>Kirjeid ei leitud.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Tellimused ja maksed</div>
        <div className="ingest-grid" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="card-title">Aktiivsed tellimused</div>
            <div className="title">{loadingSummary ? "…" : summary?.billing?.activeSubscriptions ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Uued tellimused (30p)</div>
            <div className="title">{loadingSummary ? "…" : summary?.billing?.newSubscriptions30d ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Tühistamised (30p)</div>
            <div className="title">{loadingSummary ? "…" : summary?.billing?.canceledSubscriptions30d ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Makse staatused (30p)</div>
            <div className="muted">
              {loadingSummary
                ? "…"
                : joinCounts(summary?.billing?.paymentsByStatus30d, ["PAID", "INITIATED", "FAILED", "CANCELED", "REFUNDED"]) || "—"}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Laekunud (PAID 30p)</div>
            <div className="title">{loadingSummary ? "…" : formatMoney(summary?.billing?.paidAmount30d ?? "0", "EUR")}</div>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="rag-table">
            <thead>
              <tr>
                <th>Aeg</th>
                <th>Status</th>
                <th>Summa</th>
                <th>Provider</th>
                <th>PaidAt</th>
              </tr>
            </thead>
            <tbody>
              {loadingSummary ? (
                <tr>
                  <td colSpan={5}>Laen…</td>
                </tr>
              ) : (summary?.billing?.recentPayments || []).length ? (
                (summary?.billing?.recentPayments || []).map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>{p.status}</td>
                    <td>{formatMoney(p.amount, p.currency || "EUR")}</td>
                    <td>{p.provider}</td>
                    <td>{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Kirjeid ei leitud.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Logid</div>
        <div className="rag-toolbar">
          <select className="input" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">Kõik sündmused</option>
            {EVENT_OPTIONS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
          <select className="input" value={isCrisisFilter} onChange={(e) => setIsCrisisFilter(e.target.value)}>
            <option value="all">Kriis: kõik</option>
            <option value="true">Kriis: jah</option>
            <option value="false">Kriis: ei</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="rag-table">
            <thead>
              <tr>
                <th>Aeg</th>
                <th>Event</th>
                <th>Roll</th>
                <th>Kriis</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents ? (
                <tr>
                  <td colSpan={5}>Laen…</td>
                </tr>
              ) : filteredEvents.length ? (
                filteredEvents.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{row.event}</td>
                    <td>{row.role || "–"}</td>
                    <td>{row?.data?.isCrisis ? "jah" : "ei"}</td>
                    <td className="cell-sub">{metaSummary(row.data)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Kirjeid ei leitud.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
