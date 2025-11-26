"use client";

import { useEffect, useMemo, useState } from "react";

const EVENT_OPTIONS = [
  "chat_request",
  "rag_search",
  "no_context",
  "crisis_detected",
  "rag_error",
  "openai_error",
];

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
