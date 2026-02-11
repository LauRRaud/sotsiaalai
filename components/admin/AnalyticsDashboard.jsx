"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
const pageClassName = "flex flex-col gap-5 text-[color:var(--admin-text)] [--rag-text:var(--admin-text)]";
const cardClassName = "relative overflow-hidden rounded-[18px] border border-[color:var(--admin-border)] bg-[linear-gradient(160deg,var(--admin-surface),var(--admin-surface-2))] p-4 shadow-[var(--admin-shadow-soft)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[18px] before:bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.08),transparent_45%)] before:opacity-60";
const cardBodyClassName = "relative z-[1] grid gap-1.5";
const kpiGridClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-3";
const kpiValueClassName = "text-[1.6rem] font-[700] text-[color:var(--admin-text)]";
const kpiMetaClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
const sectionHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const sectionSubClassName = "text-[0.95rem] text-[color:var(--admin-muted)] max-w-[56ch]";
const barClassName = "flex h-2 overflow-hidden rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)]";
const tableWrapClassName = "overflow-x-auto rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]";
const tableClassName = "w-full border-collapse text-[color:var(--admin-text)]";
const tableHeadCellClassName = "border-b border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-1.5 text-left text-[0.82rem] uppercase tracking-[0.02em] text-[color:var(--admin-muted)]";
const tableCellClassName = "border-b border-[color:var(--admin-border)] px-2 py-1.5 text-left text-[0.9rem] align-top";
const cellSubClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const toolbarClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2.5 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-3 shadow-[var(--admin-shadow-soft)]";
const selectClassName = "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const alertErrorClassName = "rounded-[12px] border border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] px-3 py-2 text-[color:var(--admin-text)]";
const refreshButtonStyle = {
  "--btn-primary-bg": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_35%,var(--admin-surface)_65%),var(--admin-surface-2))",
  "--btn-primary-bg-hover": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_42%,var(--admin-surface)_58%),var(--admin-surface-2))",
  "--btn-primary-bg-active": "linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_28%,var(--admin-surface)_72%),var(--admin-surface-2))",
  "--btn-primary-border": "1px solid color-mix(in_srgb,var(--admin-accent)_65%,var(--admin-border)_35%)",
  "--btn-primary-border-hover": "1px solid var(--admin-accent)",
  "--btn-primary-border-active": "1px solid color-mix(in_srgb,var(--admin-accent)_75%,var(--admin-border)_25%)",
  "--btn-primary-text": "var(--admin-text)",
  "--btn-primary-shadow": "var(--admin-shadow-soft)",
  "--btn-primary-shadow-hover": "0 0 0 3px var(--admin-accent-soft), var(--admin-shadow)",
  "--btn-primary-shadow-active": "var(--admin-shadow-soft)",
  "--btn-primary-focus-ring-color": "var(--admin-accent-soft)"
};
const refreshButtonClassName = "min-h-[2.2rem] rounded-[0.9rem] px-[0.95rem] py-[0.45rem] text-[0.95rem] font-semibold tracking-[0.01em]";
const backButtonClassName = "inline-flex h-[5.2rem] w-[5.2rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.12] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[4.8rem] w-[4.8rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')]";
const EVENT_OPTIONS = [{
  value: "chat_request",
  label: "Vestluspäring"
}, {
  value: "rag_search",
  label: "RAG otsing"
}, {
  value: "no_context",
  label: "Ilma kontekstita"
}, {
  value: "crisis_detected",
  label: "Kriis tuvastatud"
}, {
  value: "rag_error",
  label: "RAG viga"
}, {
  value: "openai_error",
  label: "OpenAI viga"
}];
const EVENT_LABELS = EVENT_OPTIONS.reduce((acc, entry) => {
  acc[entry.value] = entry.label;
  return acc;
}, {});
const STATUS_LABELS = {
  PENDING: "Ootel",
  PROCESSING: "Töös",
  COMPLETED: "Valmis",
  FAILED: "Ebaõnnestus"
};
const AUDIENCE_LABELS = {
  SOCIAL_WORKER: "Sotsiaaltöö spetsialist",
  CLIENT: "Eluküsimusega pöörduja",
  BOTH: "Mõlemad"
};
const toNumber = value => {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};
const formatCount = value => {
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
    return new Intl.NumberFormat("et-EE", {
      style: "currency",
      currency
    }).format(n);
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
const formatDate = iso => {
  try {
    return new Intl.DateTimeFormat("et-EE", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(iso));
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
  const refresh = useCallback(() => setRefreshKey(v => v + 1), []);
  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/analytics/summary", {
          cache: "no-store"
        });
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
        const res = await fetch(`/api/admin/analytics/events?${params.toString()}`, {
          cache: "no-store"
        });
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
      weak: Math.round(100 * (dist.weak || 0) / total),
      ok: Math.round(100 * (dist.ok || 0) / total),
      strong: Math.round(100 * (dist.strong || 0) / total)
    };
  }, [summary]);
  const requestSplit = useMemo(() => {
    const total = summary?.totalRequests || 0;
    if (!total) return null;
    const rag = Math.round(100 * (summary?.ragSearchCount || 0) / total);
    const noContext = Math.round(100 * (summary?.noContextCount || 0) / total);
    return {
      rag,
      noContext
    };
  }, [summary]);
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
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
  return <div className={pageClassName}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="grid gap-1.5 justify-items-center">
          <h1 className="m-0 text-[2rem] font-[650] tracking-[0.02em] text-[color:var(--admin-text)]">Analüütika</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button
            variant="primary"
            className={refreshButtonClassName}
            style={refreshButtonStyle}
            onClick={refresh}
            disabled={loadingSummary || loadingEvents}
          >
            {loadingSummary || loadingEvents ? "Laen..." : "Värskenda"}
          </Button>
        </div>
      </div>

      {error ? <div className={alertErrorClassName}>{error}</div> : null}

      <div className={kpiGridClassName}>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>Päringud (30p)</CardTitle>
            <div className={kpiValueClassName}>
              {loadingSummary ? "Laen..." : formatCount(summary?.totalRequests ?? 0)}
            </div>
            <div className={kpiMetaClassName}>Kokku vestluspäringuid</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>RAG otsingud</CardTitle>
            <div className={kpiValueClassName}>
              {loadingSummary ? "Laen..." : formatCount(summary?.ragSearchCount ?? 0)}
            </div>
            <div className={kpiMetaClassName}>
              {requestSplit ? `Osakaal ${requestSplit.rag}%` : "Osakaal puudub"}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>Ilma kontekstita</CardTitle>
            <div className={kpiValueClassName}>
              {loadingSummary ? "Laen..." : formatCount(summary?.noContextCount ?? 0)}
            </div>
            <div className={kpiMetaClassName}>
              {requestSplit ? `Osakaal ${requestSplit.noContext}%` : "Osakaal puudub"}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>Kriis</CardTitle>
            <div className={kpiValueClassName}>
              {loadingSummary ? "Laen..." : formatCount(summary?.totalCrisis ?? 0)}
            </div>
            <div className={kpiMetaClassName}>Kriisitugevus tuvastatud</div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>Keskmised (RAG)</CardTitle>
            <div className={kpiMetaClassName}>
              {loadingSummary ? "Laen..." : `Tabamusi ${summary?.averages?.avgRagMatchCount?.toFixed?.(1) || "0"}, grupid ${summary?.averages?.avgGroupCount?.toFixed?.(1) || "0"}, valik ${summary?.averages?.avgChosenGroupCount?.toFixed?.(1) || "0"}`}
            </div>
          </div>
        </div>
        <div className={cardClassName}>
          <div className={`${cardBodyClassName} min-h-[118px]`}>
            <CardTitle>Grounding</CardTitle>
            {groundingSummary ? (
              <>
                <div className={barClassName}>
                  <span className="block h-full bg-[color:var(--admin-success)]" style={{ width: `${groundingSummary.strong}%` }} />
                  <span className="block h-full bg-[color:var(--admin-accent-cool)]" style={{ width: `${groundingSummary.ok}%` }} />
                  <span className="block h-full bg-[color:var(--admin-danger)]" style={{ width: `${groundingSummary.weak}%` }} />
                </div>
                <div className={kpiMetaClassName}>
                  Tugev {groundingSummary.strong}% | OK {groundingSummary.ok}% | Nõrk {groundingSummary.weak}%
                </div>
              </>
            ) : (
              <div className={kpiMetaClassName}>{loadingSummary ? "Laen..." : "-"}</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>RAG dokumendibaas</CardTitle>
              <div className={sectionSubClassName}>
                Ülevaade indekseerimisest ja värsketest lisandustest.
              </div>
            </div>
          </div>
          <div className={`${kpiGridClassName} mt-3`}>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Dokumente kokku</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.total ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Ebaõnnestunud</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.failed ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Veaga (30p)</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.ragDocs?.error30d ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Staatused</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary ? "Laen..." : joinCounts(summary?.ragDocs?.byStatus, ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], STATUS_LABELS) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Sihtrühm</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary ? "Laen..." : joinCounts(summary?.ragDocs?.byAudience, ["CLIENT", "SOCIAL_WORKER", "BOTH"], AUDIENCE_LABELS) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Tüüp</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary ? "Laen..." : joinCounts(summary?.ragDocs?.byType, ["FILE", "URL"]) || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className={`${tableWrapClassName} mt-3.5`}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>Aeg</th>
                  <th className={tableHeadCellClassName}>Pealkiri</th>
                  <th className={tableHeadCellClassName}>Staatus</th>
                  <th className={tableHeadCellClassName}>Tüüp</th>
                  <th className={tableHeadCellClassName}>Sihtrühm</th>
                  <th className={tableHeadCellClassName}>Allikas</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      Laen...
                    </td>
                  </tr>
                ) : (summary?.ragDocs?.recent || []).length ? (
                  (summary?.ragDocs?.recent || []).map(d => {
                    const source = (d.sourceUrl || d.fileName || "").toString();
                    return (
                      <tr key={d.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                        <td className={tableCellClassName}>{formatDate(d.insertedAt || d.createdAt)}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>{d.title || "(pealkirjata)"}</td>
                        <td className={tableCellClassName}>{STATUS_LABELS[d.status] || d.status}</td>
                        <td className={tableCellClassName}>{d.type}</td>
                        <td className={tableCellClassName}>{AUDIENCE_LABELS[d.audience] || d.audience || "-"}</td>
                        <td className={`${tableCellClassName} ${cellSubClassName}`}>
                          {source ? source.slice(0, 80) : "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={6}>
                      Kirjeid ei leitud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>Tellimused ja maksed</CardTitle>
              <div className={sectionSubClassName}>
                Maksevood ja tellimuste aktiivsus viimase 30 päeva lõikes.
              </div>
            </div>
          </div>
          <div className={`${kpiGridClassName} mt-3`}>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Aktiivsed tellimused</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.billing?.activeSubscriptions ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Uued tellimused (30p)</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.billing?.newSubscriptions30d ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Tühistamised (30p)</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatCount(summary?.billing?.canceledSubscriptions30d ?? 0)}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Makse staatused (30p)</CardTitle>
                <div className={kpiMetaClassName}>
                  {loadingSummary ? "Laen..." : joinCounts(summary?.billing?.paymentsByStatus30d, ["PAID", "INITIATED", "FAILED", "CANCELED", "REFUNDED"]) || "-"}
                </div>
              </div>
            </div>
            <div className={cardClassName}>
              <div className={cardBodyClassName}>
                <CardTitle>Laekunud (PAID 30p)</CardTitle>
                <div className={kpiValueClassName}>
                  {loadingSummary ? "Laen..." : formatMoney(summary?.billing?.paidAmount30d ?? "0", "EUR")}
                </div>
              </div>
            </div>
          </div>

          <div className={`${tableWrapClassName} mt-3.5`}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>Aeg</th>
                  <th className={tableHeadCellClassName}>Staatus</th>
                  <th className={tableHeadCellClassName}>Summa</th>
                  <th className={tableHeadCellClassName}>Provider</th>
                  <th className={tableHeadCellClassName}>PaidAt</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      Laen...
                    </td>
                  </tr>
                ) : (summary?.billing?.recentPayments || []).length ? (
                  (summary?.billing?.recentPayments || []).map(p => (
                    <tr key={p.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(p.createdAt)}</td>
                      <td className={tableCellClassName}>{p.status}</td>
                      <td className={tableCellClassName}>{formatMoney(p.amount, p.currency || "EUR")}</td>
                      <td className={tableCellClassName}>{p.provider}</td>
                      <td className={tableCellClassName}>{p.paidAt ? formatDate(p.paidAt) : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      Kirjeid ei leitud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={sectionHeadClassName}>
            <div>
              <CardTitle>Logid</CardTitle>
              <div className={sectionSubClassName}>
                Viimased 100 sündmust koos filtritega.
              </div>
            </div>
          </div>
          <div className={`${toolbarClassName} mt-2`}>
            <select className={selectClassName} value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
              <option value="all">Kõik sündmused</option>
              {EVENT_OPTIONS.map(ev => (
                <option key={ev.value} value={ev.value}>
                  {ev.label}
                </option>
              ))}
            </select>
            <select className={selectClassName} value={isCrisisFilter} onChange={e => setIsCrisisFilter(e.target.value)}>
              <option value="all">Kriis: kõik</option>
              <option value="true">Kriis: jah</option>
              <option value="false">Kriis: ei</option>
            </select>
          </div>

          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>Aeg</th>
                  <th className={tableHeadCellClassName}>Sündmus</th>
                  <th className={tableHeadCellClassName}>Roll</th>
                  <th className={tableHeadCellClassName}>Kriis</th>
                  <th className={tableHeadCellClassName}>Meta</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      Laen...
                    </td>
                  </tr>
                ) : filteredEvents.length ? (
                  filteredEvents.map(row => (
                    <tr key={row.id} className="hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]">
                      <td className={tableCellClassName}>{formatDate(row.createdAt)}</td>
                      <td className={tableCellClassName}>{EVENT_LABELS[row.event] || row.event}</td>
                      <td className={tableCellClassName}>{row.role || "-"}</td>
                      <td className={tableCellClassName}>{row?.data?.isCrisis ? "jah" : "ei"}</td>
                      <td className={`${tableCellClassName} ${cellSubClassName}`}>{metaSummary(row.data)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tableCellClassName} colSpan={5}>
                      Kirjeid ei leitud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Link href="/#meist" className={backButtonClassName} aria-label="Tagasi">
          <span className={backIconClassName} aria-hidden="true" />
        </Link>
      </div>
    </div>;
}
