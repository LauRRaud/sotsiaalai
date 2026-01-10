"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const EVENT_OPTIONS = [
  { value: "chat_request", label: "Vestluspäring" },
  { value: "rag_search", label: "RAG otsing" },
  { value: "no_context", label: "Ilma kontekstita" },
  { value: "crisis_detected", label: "Kriis tuvastatud" },
  { value: "rag_error", label: "RAG viga" },
  { value: "openai_error", label: "OpenAI viga" },
];

const EVENT_LABELS = EVENT_OPTIONS.reduce((acc, entry) => {
  acc[entry.value] = entry.label;
  return acc;
}, {});

const STATUS_LABELS = {
  PENDING: "Ootel",
  PROCESSING: "Töös",
  COMPLETED: "Valmis",
  FAILED: "Ebaõnnestus",
};

const AUDIENCE_LABELS = {
  SOCIAL_WORKER: "Sotsiaaltöö spetsialist",
  CLIENT: "Eluküsimusega pöörduja",
  BOTH: "Mõlemad",
};

const toNumber = (value) => {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const formatCount = (value) => {
  const n = toNumber(value);
  try {
    return new Intl.NumberFormat("et-EE").format(n);
  } catch {
    return String(n);
  }
};

const formatMoney = (amount, currency = "EUR") => {
  const n = toNumber(amount);
  try {
    return new Intl.NumberFormat("et-EE", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed?.(2) || n} ${currency}`;
  }
};

const joinCounts = (obj = {}, order = [], labels = {}) => {
  const keys = order.length ? order : Object.keys(obj || {});
  const parts = [];
  for (const k of keys) {
    if (obj?.[k] == null) continue;
    parts.push(`${labels[k] || k}: ${obj[k]}`);
  }
  return parts.join(" | ");
};

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat("et-EE", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso || "-";
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
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((v) => v + 1), []);

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
  }, [refreshKey]);

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
  }, [eventFilter, isCrisisFilter, refreshKey]);

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

  const requestSplit = useMemo(() => {
    const total = summary?.totalRequests || 0;
    if (!total) return null;
    const rag = Math.round((100 * (summary?.ragSearchCount || 0)) / total);
    const noContext = Math.round((100 * (summary?.noContextCount || 0)) / total);
    return { rag, noContext };
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
    if (typeof data.ragMatchCount === "number") parts.push(`tabamusi: ${data.ragMatchCount}`);
    if (typeof data.groupCount === "number") parts.push(`grupid: ${data.groupCount}`);
    if (typeof data.grounding === "string") parts.push(`grounding: ${data.grounding}`);
    if (typeof data.chosenGroupCount === "number") parts.push(`valik: ${data.chosenGroupCount}`);
    if (typeof data.isCrisis === "boolean") parts.push(`kriis: ${data.isCrisis ? "jah" : "ei"}`);
    if (typeof data.hasHistory === "boolean") parts.push(`ajalugu: ${data.hasHistory ? "jah" : "ei"}`);
    return parts.join(" | ");
  };

  return (
    <div className="rag-admin analytics-admin rag-admin--flat">
      <div className="rag-card-head analytics-head">
          <div className="analytics-head__text">
            <h1 className="glass-title analytics-title">Analüütika</h1>
          </div>
          <div className="rag-card-actions">
            <button className="btn-base rag-btn" onClick={refresh} disabled={loadingSummary || loadingEvents}>
              {loadingSummary || loadingEvents ? "Laen..." : "Värskenda"}
            </button>
          </div>
        </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="analytics-kpi-grid">
        <div className="card analytics-card">
          <div className="card-title">Päringud (30p)</div>
          <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.totalRequests ?? 0)}</div>
          <div className="analytics-meta">Kokku vestluspäringuid</div>
        </div>
        <div className="card analytics-card">
          <div className="card-title">RAG otsingud</div>
          <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.ragSearchCount ?? 0)}</div>
          <div className="analytics-meta">
            {requestSplit ? `Osakaal ${requestSplit.rag}%` : "Osakaal puudub"}
          </div>
        </div>
        <div className="card analytics-card">
          <div className="card-title">Ilma kontekstita</div>
          <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.noContextCount ?? 0)}</div>
          <div className="analytics-meta">
            {requestSplit ? `Osakaal ${requestSplit.noContext}%` : "Osakaal puudub"}
          </div>
        </div>
        <div className="card analytics-card">
          <div className="card-title">Kriis</div>
          <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.totalCrisis ?? 0)}</div>
          <div className="analytics-meta">Kriisitugevus tuvastatud</div>
        </div>
        <div className="card analytics-card">
          <div className="card-title">Keskmised (RAG)</div>
          <div className="analytics-meta">
            {loadingSummary
              ? "Laen..."
              : `Tabamusi ${summary?.averages?.avgRagMatchCount?.toFixed?.(1) || "0"}, grupid ${summary?.averages?.avgGroupCount?.toFixed?.(1) || "0"}, valik ${summary?.averages?.avgChosenGroupCount?.toFixed?.(1) || "0"}`}
          </div>
        </div>
        <div className="card analytics-card">
          <div className="card-title">Grounding</div>
          {groundingSummary ? (
            <>
              <div className="analytics-bar">
                <span className="analytics-bar__segment analytics-bar__segment--strong" style={{ width: `${groundingSummary.strong}%` }} />
                <span className="analytics-bar__segment analytics-bar__segment--ok" style={{ width: `${groundingSummary.ok}%` }} />
                <span className="analytics-bar__segment analytics-bar__segment--weak" style={{ width: `${groundingSummary.weak}%` }} />
              </div>
              <div className="analytics-meta">
                Tugev {groundingSummary.strong}% | OK {groundingSummary.ok}% | Nõrk {groundingSummary.weak}%
              </div>
            </>
          ) : (
            <div className="analytics-meta">{loadingSummary ? "Laen..." : "-"}</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="rag-card-head">
          <div>
            <div className="card-title">RAG dokumendibaas</div>
            <div className="rag-card-sub">Ülevaade indekseerimisest ja värsketest lisandustest.</div>
          </div>
        </div>
        <div className="analytics-kpi-grid mt-3">
          <div className="card analytics-card">
            <div className="card-title">Dokumente kokku</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.total ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Ebaõnnestunud</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.failed ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Veaga (30p)</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.error30d ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Staatused</div>
            <div className="analytics-meta">
              {loadingSummary
                ? "Laen..."
                : joinCounts(summary?.ragDocs?.byStatus, ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], STATUS_LABELS) || "-"}
            </div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Sihtrühm</div>
            <div className="analytics-meta">
              {loadingSummary
                ? "Laen..."
                : joinCounts(summary?.ragDocs?.byAudience, ["CLIENT", "SOCIAL_WORKER", "BOTH"], AUDIENCE_LABELS) || "-"}
            </div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Tüüp</div>
            <div className="analytics-meta">
              {loadingSummary ? "Laen..." : joinCounts(summary?.ragDocs?.byType, ["FILE", "URL"]) || "-"}
            </div>
          </div>
        </div>

        <div className="table-wrap mt-3.5">
          <table className="rag-table">
            <thead>
              <tr>
                <th>Aeg</th>
                <th>Pealkiri</th>
                <th>Staatus</th>
                <th>Tüüp</th>
                <th>Sihtrühm</th>
                <th>Allikas</th>
              </tr>
            </thead>
            <tbody>
              {loadingSummary ? (
                <tr>
                  <td colSpan={6}>Laen...</td>
                </tr>
              ) : (summary?.ragDocs?.recent || []).length ? (
                (summary?.ragDocs?.recent || []).map((d) => {
                  const source = (d.sourceUrl || d.fileName || "").toString();
                  return (
                    <tr key={d.id}>
                      <td>{formatDate(d.insertedAt || d.createdAt)}</td>
                      <td className="cell-sub">{d.title || "(pealkirjata)"}</td>
                      <td>{STATUS_LABELS[d.status] || d.status}</td>
                      <td>{d.type}</td>
                      <td>{AUDIENCE_LABELS[d.audience] || d.audience || "-"}</td>
                      <td className="cell-sub">{source ? source.slice(0, 80) : "-"}</td>
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
        <div className="rag-card-head">
          <div>
            <div className="card-title">Tellimused ja maksed</div>
            <div className="rag-card-sub">Maksevood ja tellimuste aktiivsus viimase 30 päeva lõikes.</div>
          </div>
        </div>
        <div className="analytics-kpi-grid mt-3">
          <div className="card analytics-card">
            <div className="card-title">Aktiivsed tellimused</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.billing?.activeSubscriptions ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Uued tellimused (30p)</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.billing?.newSubscriptions30d ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Tühistamised (30p)</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatCount(summary?.billing?.canceledSubscriptions30d ?? 0)}</div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Makse staatused (30p)</div>
            <div className="analytics-meta">
              {loadingSummary
                ? "Laen..."
                : joinCounts(summary?.billing?.paymentsByStatus30d, ["PAID", "INITIATED", "FAILED", "CANCELED", "REFUNDED"]) || "-"}
            </div>
          </div>
          <div className="card analytics-card">
            <div className="card-title">Laekunud (PAID 30p)</div>
            <div className="analytics-value">{loadingSummary ? "Laen..." : formatMoney(summary?.billing?.paidAmount30d ?? "0", "EUR")}</div>
          </div>
        </div>

        <div className="table-wrap mt-3.5">
          <table className="rag-table">
            <thead>
              <tr>
                <th>Aeg</th>
                <th>Staatus</th>
                <th>Summa</th>
                <th>Provider</th>
                <th>PaidAt</th>
              </tr>
            </thead>
            <tbody>
              {loadingSummary ? (
                <tr>
                  <td colSpan={5}>Laen...</td>
                </tr>
              ) : (summary?.billing?.recentPayments || []).length ? (
                (summary?.billing?.recentPayments || []).map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>{p.status}</td>
                    <td>{formatMoney(p.amount, p.currency || "EUR")}</td>
                    <td>{p.provider}</td>
                    <td>{p.paidAt ? formatDate(p.paidAt) : "-"}</td>
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
        <div className="rag-card-head">
          <div>
            <div className="card-title">Logid</div>
            <div className="rag-card-sub">Viimased 100 sündmust koos filtritega.</div>
          </div>
        </div>
        <div className="rag-toolbar mt-2">
          <select className="input" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">Kõik sündmused</option>
            {EVENT_OPTIONS.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
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
                <th>Sündmus</th>
                <th>Roll</th>
                <th>Kriis</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents ? (
                <tr>
                  <td colSpan={5}>Laen...</td>
                </tr>
              ) : filteredEvents.length ? (
                filteredEvents.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{EVENT_LABELS[row.event] || row.event}</td>
                    <td>{row.role || "-"}</td>
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
      <div className="back-btn-wrapper">
        <Link href="/meist" className="back-arrow-btn" aria-label="Tagasi">
          <span className="back-arrow-circle" />
        </Link>
      </div>
    </div>
  );
}
