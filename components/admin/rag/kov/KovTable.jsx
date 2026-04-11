"use client";

import Button from "@/components/ui/Button";
import {
  badgeBaseClassName,
  buttonBaseClassName,
  buttonCompactClassName,
  buttonGhostClassName,
  buttonPrimaryClassName,
  buttonTinyClassName,
  formatDateTime
} from "../ragAdminShared";

const STATUS_STYLE = {
  NOT_STARTED:
    "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] text-[color:var(--admin-muted)]",
  DRAFT:
    "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  READY_FOR_INGEST:
    "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  INGESTED:
    "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  NEEDS_REVIEW:
    "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]"
};

const INGEST_STYLE = {
  NOT_INGESTED:
    "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] text-[color:var(--admin-muted)]",
  READY:
    "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  INGESTING:
    "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  INGESTED:
    "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  ERROR:
    "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]"
};

const REVIEW_STATE_STYLE = {
  ON_TRACK:
    "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] text-[color:var(--admin-muted)]",
  NO_CHANGES:
    "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  LIGHT_CHECK_DUE:
    "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  FULL_REVIEW_DUE:
    "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  CHECKING:
    "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  CHANGES_DETECTED:
    "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]",
  ERROR:
    "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color:var(--admin-text)]"
};

function reviewStateLabel(state, et) {
  if (state === "FULL_REVIEW_DUE") return et ? "Täisülevaatus tulekul" : "Full review due";
  if (state === "LIGHT_CHECK_DUE") return et ? "Automaatkontroll tulekul" : "Light check due";
  if (state === "CHANGES_DETECTED") return et ? "Muudatus tuvastatud" : "Changes detected";
  if (state === "CHECKING") return et ? "Kontrollimisel" : "Checking";
  if (state === "NO_CHANGES") return et ? "Kontroll korras" : "No changes";
  if (state === "ERROR") return et ? "Kontrolli viga" : "Check error";
  return et ? "Graafikus" : "On schedule";
}

function stopEvent(event, cb) {
  event.stopPropagation();
  cb?.();
}

export default function KovTable({
  rows,
  locale,
  selectedSlug,
  selectedSlugs,
  selectedCount,
  allVisibleSelected,
  onSelect,
  onToggleSelected,
  onClearSelected,
  onSelectAllVisible,
  statusLabel,
  ingestStatusLabel,
  autoCheckStatusLabel,
  onLightCheckSelected,
  onLightCheckRtSelected,
  onRevalidateRow,
  onRevalidateSelected,
  onRevalidateRtSelected,
  onIngestSelected,
  onIngestRtSelected,
  onIngestRow,
  onOpenEditor,
  revalidateBusySlug,
  bulkRevalidateBusy,
  bulkRevalidateRtBusy,
  bulkWebIngestBusy,
  bulkRtIngestBusy,
  bulkLightCheckBusy,
  bulkRtLightCheckBusy,
  ingestBusySlug,
  et
}) {
  return (
    <div className="overflow-hidden rounded-[0.95rem] border border-[color:var(--documents-card-border)] bg-[color-mix(in_srgb,var(--documents-content-bg)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--documents-card-border)] bg-[color-mix(in_srgb,var(--documents-subpanel-bg)_82%,transparent)] px-3 py-2.5">
        <div className="text-[0.88rem] text-[color:var(--documents-page-text)]">
          <span className="font-semibold">{et ? "Valitud" : "Selected"}:</span> {selectedCount}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="ghost"
            className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
            onClick={allVisibleSelected ? onClearSelected : onSelectAllVisible}
          >
            {allVisibleSelected ? (et ? "Tühjenda valik" : "Clear selection") : (et ? "Vali nähtavad" : "Select visible")}
          </Button>
          {selectedCount > 0 ? (
            <>
              <Button
                variant="ghost"
                className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                onClick={onLightCheckSelected}
                disabled={bulkLightCheckBusy}
              >
                {bulkLightCheckBusy
                  ? et ? "Kontrollin..." : "Checking..."
                  : et ? "Kontrolli KOV muudatusi" : "Check KOV changes"}
              </Button>
              <Button
                variant="ghost"
                className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                onClick={onLightCheckRtSelected}
                disabled={bulkRtLightCheckBusy}
              >
                {bulkRtLightCheckBusy
                  ? et ? "Kontrollin RT..." : "Checking RT..."
                  : et ? "Kontrolli RT muudatusi" : "Check RT changes"}
              </Button>
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                onClick={onRevalidateSelected}
                disabled={bulkRevalidateBusy}
              >
                {bulkRevalidateBusy
                  ? et ? "Valideerin..." : "Revalidating..."
                  : et ? "Valideeri KOV" : "Revalidate municipalities"}
              </Button>
              <Button
                variant="ghost"
                className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                onClick={onRevalidateRtSelected}
                disabled={bulkRevalidateRtBusy}
              >
                {bulkRevalidateRtBusy
                  ? et ? "Valideerin RT..." : "Revalidating RT..."
                  : et ? "Valideeri RT" : "Revalidate RT"}
              </Button>
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                onClick={onIngestSelected}
                disabled={bulkWebIngestBusy}
              >
                {bulkWebIngestBusy
                  ? et ? "Saadan..." : "Ingesting..."
                  : et ? "Ingest KOV" : "Ingest KOV web"}
              </Button>
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                onClick={onIngestRtSelected}
                disabled={bulkRtIngestBusy}
              >
                {bulkRtIngestBusy
                  ? et ? "Saadan RT..." : "Ingesting RT..."
                  : "RT ingest"}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full table-fixed border-collapse text-left text-[0.88rem] text-[color:var(--documents-page-text)]">
        <thead className="bg-[color-mix(in_srgb,var(--documents-subpanel-bg)_80%,transparent)] text-[0.8rem] uppercase tracking-[0.06em] text-[color:var(--documents-page-muted)]">
          <tr>
            <th className="w-[40px] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => (allVisibleSelected ? onClearSelected() : onSelectAllVisible())}
                aria-label={et ? "Vali kõik nähtavad" : "Select all visible"}
              />
            </th>
            <th className="w-[24%] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">KOV</th>
            <th className="w-[16%] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">Maakond</th>
            <th className="w-[24%] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">Staatus</th>
            <th className="w-[20%] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">Valmidus</th>
            <th className="w-[16%] border-b border-[color:var(--documents-card-border)] px-3 py-2.5 font-semibold">Tegevused</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isActive = row.slug === selectedSlug;
            const isSelected = selectedSlugs.includes(row.slug);
            const invalidFiles = Number(row.validationSummary?.invalidCount || 0);
            const allFilesValid = row.validationSummary?.allFilesValid === true;
            const rowBusy = revalidateBusySlug === row.slug;
            const ingestBusy = ingestBusySlug === row.slug;
            const canIngest = row.ingestSummary?.canIngest === true && row.ingestStatus !== "INGESTING";

            return (
              <tr
                key={row.slug}
                onClick={() => onSelect(row.slug)}
                className={
                  isActive
                    ? "cursor-pointer bg-[color-mix(in_srgb,var(--documents-accent)_10%,transparent)]"
                    : isSelected
                      ? "cursor-pointer bg-[color-mix(in_srgb,var(--documents-accent)_6%,transparent)]"
                      : "cursor-pointer odd:bg-[color:color-mix(in_srgb,var(--documents-card-bg)_65%,transparent)] hover:bg-[color-mix(in_srgb,var(--documents-accent)_5%,transparent)]"
                }
              >
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={event => stopEvent(event, () => onToggleSelected(row.slug))}
                    aria-label={`${et ? "Vali" : "Select"} ${row.displayName}`}
                  />
                </td>
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <button
                    type="button"
                    className="inline-grid appearance-none rounded-[0.45rem] border-0 bg-transparent p-0 text-left text-[color:var(--documents-page-text)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    onClick={event => stopEvent(event, () => onSelect(row.slug))}
                  >
                    <div className="font-semibold">{row.displayName}</div>
                    <div className="mt-0.5 text-[0.78rem] text-[color:var(--documents-page-muted)]">{row.slug}</div>
                  </button>
                </td>
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <div>{row.county || "-"}</div>
                  <div className="mt-0.5 text-[0.78rem] text-[color:var(--documents-page-muted)]">{row.type === "LINN" ? "Linn" : "Vald"}</div>
                </td>
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <span className={`${badgeBaseClassName} ${STATUS_STYLE[row.status] || STATUS_STYLE.NOT_STARTED}`}>{statusLabel(row.status)}</span>
                  {row.readyForIngest ? (
                    <div className="mt-1.5 text-[0.76rem] font-medium text-[#22c55e]">
                      {et ? "Valmis" : "Ready"}
                    </div>
                  ) : null}
                  <div className="mt-1">
                    <span className={`${badgeBaseClassName} ${REVIEW_STATE_STYLE[row.reviewSchedule?.state] || REVIEW_STATE_STYLE.ON_TRACK}`}>
                      {reviewStateLabel(row.reviewSchedule?.state, et)}
                    </span>
                  </div>
                    <div className="mt-1 text-[0.76rem] break-words text-[color:var(--documents-page-muted)]">
                      {row.reviewSchedule?.nextFullReviewAt
                      ? `${et ? "Järgmine täisülevaatus" : "Next full review"}: ${formatDateTime(row.reviewSchedule.nextFullReviewAt, locale)}`
                      : row.checkedAt ? formatDateTime(row.checkedAt, locale) : "-"}
                  </div>
                  <div className="mt-0.5 text-[0.76rem] text-[color:var(--documents-page-muted)]">
                    {autoCheckStatusLabel(row.autoCheckStatus)}
                  </div>
                  {(Number(row.lightCheckSummary?.changedSourceCount || 0) > 0 || Number(row.lightCheckSummary?.errorCount || 0) > 0) ? (
                    <div className="mt-0.5 text-[0.76rem] text-[color:var(--documents-page-muted)]">
                      {et
                        ? `${row.lightCheckSummary?.changedSourceCount || 0} muudatust, ${row.lightCheckSummary?.errorCount || 0} viga`
                        : `${row.lightCheckSummary?.changedSourceCount || 0} changes, ${row.lightCheckSummary?.errorCount || 0} errors`}
                    </div>
                  ) : null}
                </td>
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <div className="font-semibold">{row.fileCount}/4 <span className="font-normal text-[color:var(--documents-page-muted)]">KOV</span></div>
                  <div className="mt-0.5 text-[0.78rem] text-[color:var(--documents-page-muted)]">{row.rtFileCount || 0}/2 RT</div>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${
                        allFilesValid
                          ? "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                          : invalidFiles > 0
                            ? "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                            : "border-[color:var(--documents-card-border)] bg-[color:var(--documents-card-bg)] text-[color:var(--documents-page-muted)]"
                      }`}
                    >
                      {allFilesValid
                        ? et ? "Kõik failid korras" : "All files valid"
                        : invalidFiles > 0
                          ? et ? "Sisaldab vigaseid faile" : "Has invalid files"
                          : et ? "Faile on puudu" : "Missing files"}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${
                        Number(row.rtSummary?.invalidCount || 0) > 0
                          ? "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                          : Number(row.rtSummary?.missingCount || 0) > 0
                            ? "border-[color:var(--documents-card-border)] bg-[color:var(--documents-card-bg)] text-[color:var(--documents-page-muted)]"
                            : Number(row.rtSummary?.validCount || 0) === 2
                              ? "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                              : "border-[color:var(--documents-card-border)] bg-[color:var(--documents-card-bg)] text-[color:var(--documents-page-muted)]"
                      }`}
                    >
                      {Number(row.rtSummary?.invalidCount || 0) > 0
                        ? et ? "RT vigane" : "RT invalid"
                        : Number(row.rtSummary?.missingCount || 0) > 0
                          ? et ? "RT puudulik" : "RT incomplete"
                        : Number(row.rtSummary?.validCount || 0) === 2
                            ? et ? "RT korras" : "RT valid"
                            : et ? "RT pooleli" : "RT pending"}
                    </span>
                  </div>
                  {(Number(row.rtLightCheckSummary?.changedSourceCount || 0) > 0 || Number(row.rtLightCheckSummary?.errorCount || 0) > 0) ? (
                    <div className="mt-0.5 text-[0.76rem] text-[color:var(--documents-page-muted)]">
                      {et
                        ? `RT: ${row.rtLightCheckSummary?.changedSourceCount || 0} muudatust, ${row.rtLightCheckSummary?.errorCount || 0} viga`
                        : `RT: ${row.rtLightCheckSummary?.changedSourceCount || 0} changes, ${row.rtLightCheckSummary?.errorCount || 0} errors`}
                    </div>
                  ) : null}
                  <div className="mb-1.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${
                        row.combinedReadiness?.state === "BOTH_INGESTED"
                          ? "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                          : row.combinedReadiness?.state === "BOTH_READY"
                            ? "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                            : row.combinedReadiness?.state === "WEB_READY" || row.combinedReadiness?.state === "RT_READY"
                              ? "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--documents-content-bg)_82%)] text-[color:var(--documents-page-text)]"
                              : "border-[color:var(--documents-card-border)] bg-[color:var(--documents-card-bg)] text-[color:var(--documents-page-muted)]"
                      }`}
                    >
                      {row.combinedReadiness?.state === "BOTH_INGESTED"
                        ? et ? "Mõlemad ingestitud" : "Both ingested"
                        : row.combinedReadiness?.state === "BOTH_READY"
                          ? et ? "Mõlemad valmis" : "Both ready"
                          : row.combinedReadiness?.state === "WEB_READY"
                            ? et ? "KOV veeb valmis" : "KOV web ready"
                            : row.combinedReadiness?.state === "RT_READY"
                              ? et ? "Ainult RT valmis" : "Only RT ready"
                              : et ? "Kihid pooleli" : "Layers incomplete"}
                    </span>
                  </div>
                  <div>
                    <span className={`${badgeBaseClassName} ${INGEST_STYLE[row.ingestStatus] || INGEST_STYLE.NOT_INGESTED}`}>
                      KOV: {ingestStatusLabel(row.ingestStatus)}
                    </span>
                    <div className="mt-0.5 text-[0.76rem] text-[color:var(--documents-page-muted)]">
                      {row.lastIngestedAt
                        ? `${et ? "Viimane" : "Last"}: ${formatDateTime(row.lastIngestedAt, locale)}`
                        : row.ingestSummary?.canIngest ? (et ? "Valmis ingestiks" : "Ready") : (et ? "Pole valmis" : "Not ready")}
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <span className={`${badgeBaseClassName} ${INGEST_STYLE[row.rtIngestStatus] || INGEST_STYLE.NOT_INGESTED}`}>
                      RT: {ingestStatusLabel(row.rtIngestStatus)}
                    </span>
                    <div className="mt-0.5 text-[0.76rem] text-[color:var(--documents-page-muted)]">
                      {row.rtLastIngestedAt
                        ? `${et ? "Viimane" : "Last"}: ${formatDateTime(row.rtLastIngestedAt, locale)}`
                        : row.rtIngestSummary?.canIngest ? (et ? "Valmis ingestiks" : "Ready") : (et ? "Pole valmis" : "Not ready")}
                    </div>
                  </div>
                  {row.lastIngestError ? (
                    <div className="mt-1 text-[0.75rem] text-[#ef4444]">{row.lastIngestError}</div>
                  ) : null}
                  {row.rtLastIngestError ? (
                    <div className="mt-1 text-[0.75rem] text-[#ef4444]">{row.rtLastIngestError}</div>
                  ) : null}
                </td>
                <td className="border-b border-[color:var(--documents-card-border)] px-3 py-2.5 align-top">
                  <div className="grid gap-1">
                    <Button
                      variant={isActive ? "primary" : "ghost"}
                      className={`${buttonBaseClassName} ${isActive ? buttonPrimaryClassName : buttonGhostClassName} ${buttonTinyClassName}`}
                      onClick={event => stopEvent(event, () => onOpenEditor(row.slug))}
                    >
                      {et ? "Ava" : "Open"}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonTinyClassName}`}
                      onClick={event => stopEvent(event, () => onRevalidateRow(row.slug))}
                      disabled={rowBusy}
                    >
                      {rowBusy ? (et ? "Valideerin..." : "Revalidating...") : et ? "Valideeri" : "Revalidate"}
                    </Button>
                    <Button
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonTinyClassName}`}
                      onClick={event => stopEvent(event, () => onIngestRow(row.slug))}
                      disabled={!canIngest || ingestBusy}
                    >
                      {ingestBusy ? (et ? "Saadan..." : "Ingesting...") : et ? "Ingest" : "Ingest"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
