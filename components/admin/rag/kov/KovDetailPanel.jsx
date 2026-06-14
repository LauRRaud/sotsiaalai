"use client";

import { useRef } from "react";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { localizePath } from "@/lib/localizePath";
import {
  cardBodyClassName,
  cardClassName,
  cardHeadClassName,
  cardSubClassName,
  docDetailMetaClassName,
  docDetailMetaItemClassName,
  docDetailMetaLabelClassName,
  docDetailMetaValueClassName,
  formatDateTime,
  inputClassName,
  labelClassName,
  panelStackClassName,
  readOnlyFieldClassName
} from "../ragAdminShared";

const WEB_FILE_DEFINITIONS = [
  {
    key: "sourcesJson",
    fileName: "{slug}.sources.json",
    shortLabel: "sources.json",
    description: "Allikaregister URL-ide ja sourceKey-dega."
  },
  {
    key: "dataJson",
    fileName: "{slug}.json",
    shortLabel: "json",
    description: "Struktureeritud KOV veebikiht teenuste, toetuste, kontaktide ja vormidega."
  },
  {
    key: "metaJson",
    fileName: "{slug}.meta.json",
    shortLabel: "meta.json",
    description: "KOV veebikihi haldusmeta: checkedAt, coverage, markused ja unresolved issues."
  },
  {
    key: "ragMd",
    fileName: "{slug}.rag.md",
    shortLabel: "rag.md",
    description: "Praktilise KOV veebikihi puhastatud RAG tekst."
  }
];

const RT_FILE_DEFINITIONS = [
  {
    key: "rtXml",
    fileName: "{slug}.rt.xml",
    shortLabel: "rt.xml",
    description: "Riigi Teataja XML algallikas. See on RT kihi ainus canonical source."
  }
];

const FILE_LABEL_BY_KEY = Object.fromEntries(
  [...WEB_FILE_DEFINITIONS, ...RT_FILE_DEFINITIONS].map(file => [file.key, file.shortLabel])
);

function isFocusedFile(remediationFocus, fileKey) {
  if (!remediationFocus || !fileKey) return false;
  return remediationFocus.fileKey === fileKey || remediationFocus.focus === fileKey;
}

function focusCardClass(focused) {
  return focused
    ? "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_12%,var(--admin-surface-2)_88%)] shadow-[0_0_0_1px_color-mix(in_srgb,#38bdf8_45%,transparent)]"
    : "border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]";
}

function fileStatusLabel(status) {
  if (status === "uploaded") return "uploaded";
  if (status === "replaced") return "replaced";
  return "missing";
}

function fileStatusClass(status) {
  if (status === "uploaded") return "border-[#38bdf8] text-[#38bdf8]";
  if (status === "replaced") return "border-[#22c55e] text-[#22c55e]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function validationLabel(validationStatus, et) {
  if (validationStatus === "VALID") return et ? "valid" : "valid";
  if (validationStatus === "INVALID") return et ? "vigane" : "invalid";
  return et ? "puudub" : "missing";
}

function validationClass(validationStatus) {
  if (validationStatus === "VALID") return "border-[#22c55e] text-[#22c55e]";
  if (validationStatus === "INVALID") return "border-[#ef4444] text-[#ef4444]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function ingestClass(status) {
  if (status === "READY") return "border-[#22c55e] text-[#22c55e]";
  if (status === "INGESTING") return "border-[#f59e0b] text-[#f59e0b]";
  if (status === "INGESTED") return "border-[#38bdf8] text-[#38bdf8]";
  if (status === "ERROR") return "border-[#ef4444] text-[#ef4444]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function rtStatusClass(status) {
  if (status === "READY") return "border-[#22c55e] text-[#22c55e]";
  if (status === "NEEDS_REVIEW") return "border-[#ef4444] text-[#ef4444]";
  if (status === "DRAFT") return "border-[#f59e0b] text-[#f59e0b]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function readinessClass(state) {
  if (state === "BOTH_INGESTED") return "border-[#38bdf8] text-[#38bdf8]";
  if (state === "BOTH_READY") return "border-[#22c55e] text-[#22c55e]";
  if (state === "WEB_READY" || state === "RT_READY") return "border-[#f59e0b] text-[#f59e0b]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function readinessLabel(state, et) {
  if (state === "BOTH_INGESTED") return et ? "Mõlemad kihid ingestitud" : "Both layers ingested";
  if (state === "BOTH_READY") return et ? "Mõlemad kihid valmis" : "Both layers ready";
  if (state === "WEB_READY") return et ? "Ainult KOV veeb valmis" : "Only KOV web ready";
  if (state === "RT_READY") return et ? "Ainult RT valmis" : "Only RT ready";
  return et ? "Kihid pooleli" : "Layers incomplete";
}

function autoCheckClass(status) {
  if (status === "CHANGES_DETECTED" || status === "ERROR") return "border-[#ef4444] text-[#ef4444]";
  if (status === "CHECKING" || status === "DUE") return "border-[#f59e0b] text-[#f59e0b]";
  if (status === "NO_CHANGES") return "border-[#38bdf8] text-[#38bdf8]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function reviewStateClass(state) {
  if (state === "CHANGES_DETECTED" || state === "ERROR" || state === "FULL_REVIEW_DUE") return "border-[#ef4444] text-[#ef4444]";
  if (state === "CHECKING" || state === "LIGHT_CHECK_DUE") return "border-[#f59e0b] text-[#f59e0b]";
  if (state === "NO_CHANGES") return "border-[#38bdf8] text-[#38bdf8]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function reviewStateLabel(state, et) {
  if (state === "FULL_REVIEW_DUE") return et ? "Täisülevaatus tulekul" : "Full review due";
  if (state === "LIGHT_CHECK_DUE") return et ? "Automaatkontroll tulekul" : "Light check due";
  if (state === "CHANGES_DETECTED") return et ? "Muudatus tuvastatud" : "Changes detected";
  if (state === "CHECKING") return et ? "Kontrollimisel" : "Checking";
  if (state === "NO_CHANGES") return et ? "Kontroll korras" : "No changes";
  if (state === "ERROR") return et ? "Kontrolli viga" : "Check error";
  return et ? "Graafikus" : "On schedule";
}

function lightCheckReasonLabel(reason, et) {
  if (reason === "new_source") return et ? "uus allikas" : "new source";
  if (reason === "source_removed") return et ? "allikas eemaldatud" : "source removed";
  if (reason === "content_changed") return et ? "sisu muutus" : "content changed";
  return reason || "-";
}

function ragDocStatusClass(doc) {
  if (doc?.error) return "border-[#ef4444] text-[#ef4444]";
  if (doc?.exists && Number(doc?.chunks || 0) > 0) return "border-[#38bdf8] text-[#38bdf8]";
  if (doc?.exists) return "border-[#f59e0b] text-[#f59e0b]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function ragDocStatusLabel(doc, et) {
  if (doc?.error) return et ? "Viga" : "Error";
  if (doc?.notIngested) return et ? "Pole ingestitud" : "Not ingested";
  if (doc?.exists && Number(doc?.chunks || 0) > 0) return et ? "Leitud" : "Found";
  if (doc?.exists) return et ? "Registris, 0 chunki" : "In registry, 0 chunks";
  return et ? "Puudub" : "Missing";
}

function renderRagDocCard({ doc, label, et, locale }) {
  return (
    <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.84rem] text-[color:var(--admin-text)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">{label}</div>
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${ragDocStatusClass(doc)}`}>
          {ragDocStatusLabel(doc, et)}
        </span>
      </div>
      <div className="grid gap-1 text-[color:var(--admin-muted)]">
        <div>doc_id: {doc?.docId || "-"}</div>
        <div>{et ? "Chunkid" : "Chunks"}: {Number(doc?.chunks || 0)}</div>
        <div>{et ? "Pealkiri" : "Title"}: {doc?.title || "-"}</div>
        <div>{et ? "Teenuse staatus" : "Service status"}: {doc?.status || "-"}</div>
        <div>{et ? "Viimati ingestitud" : "Last ingested"}: {doc?.lastIngested ? formatDateTime(doc.lastIngested, locale) : "-"}</div>
        <div>{et ? "Registri uuendus" : "Registry update"}: {doc?.updatedAt ? formatDateTime(doc.updatedAt, locale) : "-"}</div>
        {doc?.error ? (
          <div className="rounded-[10px] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_10%,var(--admin-surface-3)_90%)] px-2 py-1 text-[#ef4444]">
            {doc.error}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function renderLightCheckDiffBlock(summary, { et, title }) {
  if (!summary?.checkedAt) return null;

  const changedSources = Array.isArray(summary.changedSources) ? summary.changedSources : [];
  const removedSources = Array.isArray(summary.removedSources) ? summary.removedSources : [];
  const errorSources = Array.isArray(summary.errorSources) ? summary.errorSources : [];
  const hasItems = changedSources.length || removedSources.length || errorSources.length;

  return (
    <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.84rem] text-[color:var(--admin-text)]">
      <div className="font-semibold">{title}</div>
      {!hasItems ? (
        <div className="text-[color:var(--admin-muted)]">
          {summary.mode === "BASELINE_CREATED"
            ? (et ? "Esimene kontroll lĆµi baasvĆµrdluse. JĆ¤rgmised jooksud nĆ¤itavad diffi." : "The first check created the baseline. Future runs will show a diff.")
            : et ? "Muutunud allikaid ega vigu ei tuvastatud." : "No changed sources or fetch errors were detected."}
        </div>
      ) : null}
      {changedSources.length ? (
        <div className="grid gap-1">
          <div className="font-medium">{et ? "Muutunud allikad" : "Changed sources"}</div>
          {changedSources.map((item, index) => (
            <div key={`${item.key || item.url || "changed"}-${index}`} className="rounded-[10px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-2">
              <div className="font-medium">{item.key || item.url || "-"}</div>
              <div className="mt-0.5 text-[color:var(--admin-muted)]">{lightCheckReasonLabel(item.reason, et)}</div>
              {item.url ? <div className="mt-1 break-all text-[0.8rem] text-[color:var(--admin-muted)]">{item.url}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
      {removedSources.length ? (
        <div className="grid gap-1">
          <div className="font-medium">{et ? "Kadunud allikad" : "Removed sources"}</div>
          {removedSources.map((item, index) => (
            <div key={`${item.key || item.url || "removed"}-${index}`} className="rounded-[10px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-2">
              <div className="font-medium">{item.key || item.url || "-"}</div>
              {item.url ? <div className="mt-1 break-all text-[0.8rem] text-[color:var(--admin-muted)]">{item.url}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
      {errorSources.length ? (
        <div className="grid gap-1">
          <div className="font-medium">{et ? "Allikad veaga" : "Sources with errors"}</div>
          {errorSources.map((item, index) => (
            <div key={`${item.key || item.url || "error"}-${index}`} className="rounded-[10px] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_10%,var(--admin-surface-3)_90%)] px-2.5 py-2 text-[#ef4444]">
              <div className="font-medium">{item.key || item.url || "-"}</div>
              {item.url ? <div className="mt-1 break-all text-[0.8rem]">{item.url}</div> : null}
              <div className="mt-1 text-[0.8rem]">{item.error || "-"}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function updateDraft(setter, patch) {
  setter(current => ({
    ...current,
    ...patch
  }));
}

function renderFileCards({
  entry,
  locale,
  et,
  definitions,
  files,
  fileBusyKey,
  onUploadFile,
  onRemoveFile,
  fileInputRefs,
  remediationFocus
}) {
  return (
    <div className="grid gap-2">
      {definitions.map(file => {
        const state = files?.[file.key] || { status: "missing", version: 0, validationStatus: "MISSING", validationMessage: "" };
        const resolvedFileName = file.fileName.replace("{slug}", entry.slug);
        const busy = fileBusyKey === `${entry.slug}:${file.key}`;
        const isMarkdown = file.key === "ragMd";
        const isXml = file.key === "rtXml";
        const focused = isFocusedFile(remediationFocus, file.key);

        return (
          <div
            key={file.key}
            className={`grid gap-2 rounded-[12px] border p-2.5 ${focusCardClass(focused)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="break-words font-semibold text-[color:var(--admin-text)]">{resolvedFileName}</div>
                  {focused ? (
                    <span className="rounded-full border border-[#38bdf8] px-2 py-0.5 text-[0.75rem] font-semibold text-[#38bdf8]">
                      {et ? "Quality queue siht" : "Quality queue target"}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 grid gap-1 text-[0.82rem] text-[color:var(--admin-muted)]">
                  <div>
                    {et ? "Staatus" : "Status"}:{" "}
                    <span className={`inline-flex rounded-full border px-2 py-0.5 ${fileStatusClass(state.status)}`}>
                      {et
                        ? state.status === "uploaded"
                          ? "olemas"
                          : state.status === "replaced"
                            ? "asendatud"
                            : "puudu"
                        : fileStatusLabel(state.status)}
                    </span>
                  </div>
                  <div>
                    {et ? "Valideerimine" : "Validation"}:{" "}
                    <span className={`inline-flex rounded-full border px-2 py-0.5 ${validationClass(state.validationStatus)}`}>
                      {validationLabel(state.validationStatus, et)}
                    </span>
                  </div>
                  <div className="break-words">{et ? "Nimi" : "Name"}: {state.originalName || "-"}</div>
                  <div>{et ? "Kiht" : "Layer"}: {file.shortLabel}</div>
                  <div>{et ? "Versioon" : "Version"}: {state.version || 0}</div>
                  <div>{et ? "Laetud" : "Uploaded"}: {state.uploadedAt ? formatDateTime(state.uploadedAt, locale) : "-"}</div>
                  <div>{et ? "Valideeritud" : "Validated"}: {state.validatedAt ? formatDateTime(state.validatedAt, locale) : "-"}</div>
                  {state.validationStatus === "INVALID" && state.validationMessage ? (
                    <div className="break-words rounded-[10px] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_10%,var(--admin-surface-3)_90%)] px-2 py-1 text-[#ef4444]">
                      {state.validationMessage}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-start justify-end gap-1.5">
                <input
                  ref={node => {
                    fileInputRefs.current[file.key] = node;
                  }}
                  type="file"
                  className="hidden"
                  accept={
                    isMarkdown
                      ? ".md,.txt,text/markdown,text/plain"
                      : isXml
                        ? ".xml,application/xml,text/xml"
                        : ".json,application/json"
                  }
                  onChange={event => {
                    const nextFile = event.target.files?.[0];
                    if (nextFile) {
                      onUploadFile(entry.slug, file.key, nextFile);
                    }
                    event.target.value = "";
                  }}
                />
                <Button
                  variant="primary"
                  size="2xs"
                  onClick={() => fileInputRefs.current[file.key]?.click()}
                  disabled={busy}
                >
                  {busy ? "Laen..." : state.status === "missing" ? "Lae üles" : "Asenda fail"}
                </Button>
                {state.downloadUrl ? (
                  <Button
                    variant="primary"
                    size="2xs"
                    onClick={() => window.open(state.downloadUrl, "_blank", "noopener,noreferrer")}
                    disabled={busy}
                  >
                    Laadi alla
                  </Button>
                ) : null}
                {state.status !== "missing" && state.storageKind !== "repository" ? (
                  <Button
                    variant="danger"
                    size="2xs"
                    onClick={() => onRemoveFile(entry.slug, file.key)}
                    disabled={busy}
                  >
                    Eemalda
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderSaveActions({ et, saveBusy, onSave, message, hint }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2.5">
      <Button
        variant="primary"
        size="sm"
        onClick={() => onSave()}
        disabled={saveBusy}
      >
        {saveBusy ? "Salvestan..." : et ? "Salvesta muudatused" : "Save changes"}
      </Button>
      <span className="text-[0.84rem] text-[color:var(--admin-muted)]">{hint}</span>
      {message?.text ? (
        <span
          className={`rounded-full border px-2.5 py-1 text-[0.78rem] font-semibold ${
            message.type === "error"
              ? "border-[#ef4444] text-[#ef4444]"
              : "border-[#22c55e] text-[#22c55e]"
          }`}
        >
          {message.text}
        </span>
      ) : null}
    </div>
  );
}

export default function KovDetailPanel({
  entry,
  locale,
  et = true,
  statusOptions,
  statusLabel,
  ingestStatusLabel,
  rtStatusOptions,
  rtStatusLabel,
  autoCheckStatusLabel,
  detailDraft,
  onDraftChange,
  ragStatus,
  ragStatusLoading = false,
  ragResetPlan = null,
  remediationFocus = null,
  message,
  onRefreshRagStatus,
  onSave,
  saveBusy,
  onMarkReady: _onMarkReady,
  onResetRagState,
  onIngest: _onIngest,
  onReplaceIngest,
  onIngestRt: _onIngestRt,
  onRevalidateAll: _onRevalidateAll,
  onRevalidateRt: _onRevalidateRt,
  onLightCheck,
  onRtLightCheck,
  onMarkWebReviewNeeded,
  onConfirmWebLightCheck,
  onMarkRtReviewNeeded,
  onConfirmRtLightCheck,
  editingLinks,
  onSetEditingLinks: _onSetEditingLinks,
  onCycleStatus: _onCycleStatus,
  onUploadFile,
  onRemoveFile,
  fileBusyKey,
  revalidateBusy: _revalidateBusy = false,
  revalidateRtBusy: _revalidateRtBusy = false,
  ingestBusy: _ingestBusy = false,
  rtIngestBusy: _rtIngestBusy = false,
  lightCheckBusy = false,
  rtLightCheckBusy = false,
  resetBusy = false
}) {
  const fileInputRefs = useRef({});

  if (!entry) {
    return (
      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={cardSubClassName}>Vali KOV, et avada detailid.</div>
        </div>
      </div>
    );
  }

  const resetSummary = ragResetPlan?.summary || null;
  const municipalityId = entry.slug ? entry.slug.replaceAll("-", "_") : "";
  const sourcePackagesHref = localizePath(`/admin/rag/source-packages?municipalityId=${encodeURIComponent(municipalityId)}`);

  const webSummary = entry.webSummary || entry.validationSummary || {};
  const rtSummary = entry.rtSummary || {};
  const webInvalidLabels = (webSummary.invalidKeys || []).map(key => FILE_LABEL_BY_KEY[key] || key);
  const webMissingLabels = (webSummary.missingKeys || []).map(key => FILE_LABEL_BY_KEY[key] || key);
  const rtInvalidLabels = (rtSummary.invalidKeys || []).map(key => FILE_LABEL_BY_KEY[key] || key);
  const rtMissingLabels = (rtSummary.missingKeys || []).map(key => FILE_LABEL_BY_KEY[key] || key);
  const combinedReadiness = entry.combinedReadiness || {};
  const reviewSchedule = entry.reviewSchedule || {};
  const hasWebDiffItems =
    Number(entry.lightCheckSummary?.changedSourceCount || 0) > 0
    || Number(entry.lightCheckSummary?.removedSourceCount || 0) > 0
    || Number(entry.lightCheckSummary?.errorCount || 0) > 0;
  const hasRtDiffItems =
    Number(entry.rtLightCheckSummary?.changedSourceCount || 0) > 0
    || Number(entry.rtLightCheckSummary?.removedSourceCount || 0) > 0
    || Number(entry.rtLightCheckSummary?.errorCount || 0) > 0;
  const webLightCheckDiff = renderLightCheckDiffBlock(entry.lightCheckSummary, {
    et,
    title: et ? "KOV veeb diff" : "KOV web diff"
  });
  const rtLightCheckDiff = renderLightCheckDiffBlock(entry.rtLightCheckSummary, {
    et,
    title: et ? "RT diff" : "RT diff"
  });
  const ragSnapshot = ragStatus || {};
  const webLinkFocused = remediationFocus?.focus === "kov_web_links" || remediationFocus?.focus === "kov_web_link";
  const rtLinkFocused = remediationFocus?.focus === "kov_rt_link";
  const focusHint = remediationFocus?.fileKey
    ? `${et ? "Fail" : "File"}: ${FILE_LABEL_BY_KEY[remediationFocus.fileKey] || remediationFocus.fileKey}`
    : remediationFocus?.focus || "";

  return (
    <div className="grid gap-2">
      {remediationFocus ? (
        <div className="rounded-[12px] border border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_10%,var(--admin-surface)_90%)] px-3 py-2 text-[0.86rem] text-[color:var(--admin-text)]">
          <span className="font-semibold">{et ? "Quality queue siht" : "Quality queue target"}:</span>{" "}
          {focusHint || (et ? "kontrolli selle kirje metadata't" : "review this record metadata")}
        </div>
      ) : null}
      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={cardHeadClassName}>
            <div>
              <div className="text-[1.08rem] font-semibold text-[color:var(--admin-text)]">{entry.displayName}</div>
              <div className={cardSubClassName}>KOV veeb ja Riigi Teataja kiht eraldi halduses.</div>
            </div>
          </div>

          <div className={docDetailMetaClassName}>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>KOV</span>
              <span className={docDetailMetaValueClassName}>{entry.displayName}</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>Slug</span>
              <span className={docDetailMetaValueClassName}>{entry.slug}</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>Maakond</span>
              <span className={docDetailMetaValueClassName}>{entry.county || "-"}</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>Tuup</span>
              <span className={docDetailMetaValueClassName}>{entry.type === "LINN" ? "Linn" : "Vald"}</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "KOV veeb staatus" : "KOV web status"}</span>
              <span className={docDetailMetaValueClassName}>{statusLabel(detailDraft.status || entry.status)}</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "RT seis" : "RT status"}</span>
              <span className={docDetailMetaValueClassName}>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${rtStatusClass(detailDraft.rtStatus || entry.rtStatus)}`}>
                  {rtStatusLabel(detailDraft.rtStatus || entry.rtStatus)}
                </span>
              </span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "KOV ingest" : "Web ingest"}</span>
              <span className={docDetailMetaValueClassName}>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${ingestClass(entry.ingestStatus)}`}>
                  {ingestStatusLabel(entry.ingestStatus)}
                </span>
              </span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "RT ingest" : "RT ingest"}</span>
              <span className={docDetailMetaValueClassName}>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${ingestClass(entry.rtIngestStatus)}`}>
                  {ingestStatusLabel(entry.rtIngestStatus)}
                </span>
              </span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "Admin KOV failid" : "Admin KOV files"}</span>
              <span className={docDetailMetaValueClassName}>{entry.fileCount || 0}/4</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "Admin RT fail" : "Admin RT file"}</span>
              <span className={docDetailMetaValueClassName}>{entry.rtFileCount || 0}/1</span>
            </div>
            <div className={docDetailMetaItemClassName}>
              <span className={docDetailMetaLabelClassName}>{et ? "Koondvalmidus" : "Combined readiness"}</span>
              <span className={docDetailMetaValueClassName}>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.76rem] font-semibold ${readinessClass(combinedReadiness.state)}`}>
                  {readinessLabel(combinedReadiness.state, et)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[0.82rem] text-[color:var(--admin-muted)]">
            <span className="rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-1">
              {et ? "Valmis kihte" : "Ready layers"}: {combinedReadiness.readyLayerCount || 0}/2
            </span>
            <span className="rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-1">
              KOV: {combinedReadiness.webReady ? (et ? "valmis" : "ready") : et ? "pooleli" : "pending"}
            </span>
            <span className="rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-1">
              RT: {combinedReadiness.rtReady ? (et ? "valmis" : "ready") : et ? "pooleli" : "pending"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[0.96rem] font-semibold text-[color:var(--admin-text)]">{et ? "RAG dokumendi seis" : "RAG document status"}</div>
                <div className={cardSubClassName}>
                  {et
                    ? "Reaalajas kontroll RAG registrist: doc_id, chunkide arv ja viimane ingest."
                    : "Live check from the RAG registry: doc_id, chunk count, and last ingest."}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.78rem] text-[color:var(--admin-muted)]">
                  {et ? "Värskendatud" : "Updated"}: {ragSnapshot.checkedAt ? formatDateTime(ragSnapshot.checkedAt, locale) : "-"}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRefreshRagStatus?.()}
                  disabled={ragStatusLoading}
                >
                  {ragStatusLoading
                    ? et ? "Värskendan..." : "Refreshing..."
                    : et ? "Värskenda RAG seisu" : "Refresh RAG status"}
                </Button>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {renderRagDocCard({
                doc: ragSnapshot.web || {
                  docId: entry.ragDocId || "",
                  exists: false,
                  chunks: 0,
                  title: "",
                  status: "",
                  updatedAt: null,
                  lastIngested: null,
                  error: ""
                },
                label: et ? "KOV veeb RAG" : "KOV web RAG",
                et,
                locale
              })}
              {renderRagDocCard({
                doc: ragSnapshot.rt || {
                  docId: entry.rtRagDocId || "",
                  exists: false,
                  chunks: 0,
                  title: "",
                  status: "",
                  updatedAt: null,
                  lastIngested: null,
                  error: ""
                },
                label: et ? "RT RAG" : "RT RAG",
                et,
                locale
              })}
            </div>
            <div className="grid gap-2 rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-3 text-[0.84rem] text-[color:var(--admin-text)]">
              <div className="grid gap-1">
                <div className="font-semibold">{et ? "Paketipõhine KOV reset" : "Package-level KOV reset"}</div>
                <div className="text-[color:var(--admin-muted)]">
                  {et
                    ? "Reset eemaldab ainult selle KOV RAG dokumendid, archiveerib aktiivsed SourcePackage snapshotid ja viib admin ingest-state'i tagasi mitte-ingestitud seisu. Repo faile see ei muuda."
                    : "Reset removes only this municipality's RAG documents, archives active SourcePackage snapshots, and returns admin ingest state to not ingested. Repo files are not touched."}
                </div>
              </div>
              {resetSummary ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <div><span className="font-semibold">{et ? "RAG dokumendid" : "RAG documents"}:</span> {resetSummary.matched_rag_doc_ids || 0}</div>
                  <div><span className="font-semibold">{et ? "Aktiivsed snapshotid" : "Active snapshots"}:</span> {resetSummary.active_snapshot_count || 0}</div>
                  <div><span className="font-semibold">{et ? "Archiveeritud snapshotid" : "Archived snapshots"}:</span> {resetSummary.archived_snapshot_count || 0}</div>
                  <div><span className="font-semibold">{et ? "Admin reset" : "Admin reset"}:</span> {resetSummary.admin_row_will_reset ? (et ? "jah" : "yes") : (et ? "ei" : "no")}</div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onReplaceIngest?.()}
                  disabled={_ingestBusy || entry.ingestSummary?.canIngest !== true}
                >
                  {_ingestBusy
                    ? et ? "Asendan..." : "Replacing..."
                    : et ? "Asenda KOV veeb RAG-is" : "Replace KOV web in RAG"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onResetRagState?.()}
                  disabled={resetBusy}
                >
                  {resetBusy
                    ? et ? "Valmistan reseti..." : "Preparing reset..."
                    : et ? "Reseti KOV RAG state" : "Reset KOV RAG state"}
                </Button>
                <Button
                  as="a"
                  href={sourcePackagesHref}
                  variant="linkBrand"
                  size="sm"
                >
                  {et ? "Ava source packages" : "Open source packages"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div>
            <div className="text-[0.98rem] font-semibold text-[color:var(--admin-text)]">{et ? "Hooldusgraafik" : "Review schedule"}</div>
            <div className={cardSubClassName}>
                {et ? "Aastane täisülevaatus jaanuari lõpus ja kergem automaatkontroll juuli lõpus." : "Annual full review at the end of January and a lighter automated check at the end of July."}
            </div>
          </div>

          <div className="mt-3 grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.86rem] text-[color:var(--admin-text)] sm:grid-cols-2">
            <div>
              <span className="font-semibold">{et ? "Seis" : "State"}:</span>{" "}
              <span className={`inline-flex rounded-full border px-2 py-0.5 ${reviewStateClass(reviewSchedule.state)}`}>
                {reviewStateLabel(reviewSchedule.state, et)}
              </span>
            </div>
            <div>
              <span className="font-semibold">{et ? "Automaatkontroll" : "Auto check"}:</span>{" "}
              <span className={`inline-flex rounded-full border px-2 py-0.5 ${autoCheckClass(entry.autoCheckStatus)}`}>
                {autoCheckStatusLabel(entry.autoCheckStatus)}
              </span>
            </div>
            <div>
              <span className="font-semibold">{et ? "RT automaatkontroll" : "RT auto check"}:</span>{" "}
              <span className={`inline-flex rounded-full border px-2 py-0.5 ${autoCheckClass(entry.rtAutoCheckStatus)}`}>
                {autoCheckStatusLabel(entry.rtAutoCheckStatus)}
              </span>
            </div>
            <div>
              <span className="font-semibold">{et ? "Viimane täisülevaatus" : "Last full review"}:</span>{" "}
              {entry.lastFullReviewAt ? formatDateTime(entry.lastFullReviewAt, locale) : "-"}
            </div>
            <div>
              <span className="font-semibold">{et ? "Järgmine täisülevaatus" : "Next full review"}:</span>{" "}
              {entry.nextFullReviewAt ? formatDateTime(entry.nextFullReviewAt, locale) : "-"}
            </div>
            <div>
              <span className="font-semibold">{et ? "Viimane automaatkontroll" : "Last light check"}:</span>{" "}
              {entry.lastLightCheckAt ? formatDateTime(entry.lastLightCheckAt, locale) : "-"}
            </div>
            <div>
              <span className="font-semibold">{et ? "Järgmine automaatkontroll" : "Next light check"}:</span>{" "}
              {entry.nextLightCheckAt ? formatDateTime(entry.nextLightCheckAt, locale) : "-"}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">{et ? "Viimane tuvastatud muudatus" : "Last detected change"}:</span>{" "}
              {entry.lastChangeDetectedAt ? formatDateTime(entry.lastChangeDetectedAt, locale) : "-"}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">{et ? "Viimane automaatkontrolli kokkuvote" : "Last light check summary"}:</span>{" "}
              {entry.lightCheckSummary?.checkedAt
                ? (
                  entry.lightCheckSummary.mode === "BASELINE_CREATED"
                    ? (et
                      ? `Loodi baasvõrdlus ${entry.lightCheckSummary.checkedSourceCount || 0} allikast.`
                      : `Created a baseline from ${entry.lightCheckSummary.checkedSourceCount || 0} sources.`)
                    : et
                      ? `${entry.lightCheckSummary.changedSourceCount || 0} muudatust, ${entry.lightCheckSummary.errorCount || 0} veaga allikat.`
                      : `${entry.lightCheckSummary.changedSourceCount || 0} changes, ${entry.lightCheckSummary.errorCount || 0} source errors.`)
                : "-"}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">{et ? "Viimane RT kontrolli kokkuvote" : "Last RT check summary"}:</span>{" "}
              {entry.rtLightCheckSummary?.checkedAt
                ? (
                  entry.rtLightCheckSummary.mode === "BASELINE_CREATED"
                    ? (et
                      ? `Loodi RT baasvõrdlus ${entry.rtLightCheckSummary.checkedSourceCount || 0} allikast.`
                      : `Created an RT baseline from ${entry.rtLightCheckSummary.checkedSourceCount || 0} sources.`)
                    : et
                      ? `${entry.rtLightCheckSummary.changedSourceCount || 0} RT muudatust, ${entry.rtLightCheckSummary.errorCount || 0} veaga allikat.`
                      : `${entry.rtLightCheckSummary.changedSourceCount || 0} RT changes, ${entry.rtLightCheckSummary.errorCount || 0} source errors.`)
                : "-"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onLightCheck?.()}
              disabled={lightCheckBusy}
            >
              {lightCheckBusy
                ? et ? "Kontrollin..." : "Checking..."
                : et ? "Kontrolli muudatusi" : "Check for changes"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRtLightCheck?.()}
              disabled={rtLightCheckBusy}
            >
              {rtLightCheckBusy
                ? et ? "Kontrollin RT..." : "Checking RT..."
                : et ? "Kontrolli RT muudatusi" : "Check RT changes"}
            </Button>
          </div>
          {webLightCheckDiff}
          {hasWebDiffItems ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onMarkWebReviewNeeded?.()}
              >
                {et ? "Märgi KOV ülevaatuseks" : "Mark KOV for review"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConfirmWebLightCheck?.()}
              >
                {et ? "Kinnita KOV kontrollituks" : "Confirm KOV check"}
              </Button>
            </div>
          ) : null}
          {rtLightCheckDiff}
          {hasRtDiffItems ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onMarkRtReviewNeeded?.()}
              >
                {et ? "Märgi RT ülevaatuseks" : "Mark RT for review"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onConfirmRtLightCheck?.()}
              >
                {et ? "Kinnita RT kontrollituks" : "Confirm RT check"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>

          <div>
            <div className="text-[0.98rem] font-semibold text-[color:var(--admin-text)]">{et ? "KOV veeb" : "KOV web"}</div>
            <div className={cardSubClassName}>
              {et ? "Praktiline info: teenused, toetused, kontaktid, blanketid." : "Practical layer: services, benefits, contacts, forms."}
            </div>
          </div>

          <div className="rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2.5 text-[0.86rem] leading-[1.45] text-[color:var(--admin-muted)]">
            {et
              ? "Siin hallad KOV veebikihti. Salvesta muudatused = salvesta lingid, märkused ja staatused. Kontrolli muudatusi = vaata, kas allikad on muutunud. Failikaartidel Lae üles = lisa või asenda konkreetne fail."
              : "This section manages the KOV web layer. Save changes stores links, notes, and statuses. Check for changes runs a source check. On file cards, Upload adds or replaces that specific file."}
          </div>

            <div className="mt-3 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`${panelStackClassName} ${webLinkFocused ? "rounded-[12px] border border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_8%,transparent)] p-2" : ""}`}>
                <label className={labelClassName}>Ametlik veebileht</label>
                <Input
                  value={detailDraft.officialWebsite || ""}
                  onChange={event => updateDraft(onDraftChange, { officialWebsite: event.target.value })}
                  className={inputClassName}
                  size="sm"
                  placeholder="https://..."
                  disabled={!editingLinks}
                />
                {!editingLinks ? (
                  <div className={readOnlyFieldClassName}>See viide kirjeldab KOV veebikihi ametlikku allikat.</div>
                ) : null}
                {detailDraft.officialWebsite ? (
                  <a
                    href={detailDraft.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 text-[0.86rem] font-semibold text-[color:var(--admin-text)] no-underline"
                  >
                    {et ? "Ava veeb" : "Open website"}
                  </a>
                ) : null}
              </div>

              <div className={panelStackClassName}>
                <label className={labelClassName}>{et ? "KOV veeb staatus" : "KOV web status"}</label>
                <DocumentsDropdown
                  ariaLabel="KOV veeb staatus"
                  value={detailDraft.status}
                  onChange={nextStatus => updateDraft(onDraftChange, { status: nextStatus })}
                  options={statusOptions}
                  className="w-full"
                />
                <label className={labelClassName}>{et ? "Viimati kontrollitud" : "Last checked"}</label>
                <Input
                  type="datetime-local"
                  value={detailDraft.checkedAt || ""}
                  onChange={event => updateDraft(onDraftChange, { checkedAt: event.target.value })}
                  className={inputClassName}
                  size="sm"
                />
                <label className={labelClassName}>{et ? "Markused" : "Notes"}</label>
                <Textarea
                  value={detailDraft.notes || ""}
                  onChange={event => updateDraft(onDraftChange, { notes: event.target.value })}
                  className={inputClassName}
                  rows={4}
                  size="sm"
                />
                <label className="inline-flex items-center gap-2 text-[0.9rem] text-[color:var(--admin-text)]">
                  <input
                    type="checkbox"
                    checked={detailDraft.readyForIngest === true}
                    onChange={event => updateDraft(onDraftChange, { readyForIngest: event.target.checked })}
                  />
                  {et ? "Valmis ingestiks" : "Ready for ingest"}
                </label>
              </div>
            </div>

            {renderSaveActions({
              et,
              saveBusy,
              onSave,
              message,
              hint: et
                ? "Salvestab KOV veebilehe, staatuse, kontrolli aja, märkused ja valmisoleku linnukese."
                : "Saves the KOV website, status, checked time, notes, and ready-for-ingest checkbox."
            })}

            <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.86rem] text-[color:var(--admin-text)] sm:grid-cols-2">
              <div>
                <span className="font-semibold">{et ? "Kokkuvote" : "Summary"}:</span>{" "}
                {et
                  ? `${webSummary.presentCount || 0}/4 olemas, ${webSummary.validCount || 0}/4 valid`
                  : `${webSummary.presentCount || 0}/4 present, ${webSummary.validCount || 0}/4 valid`}
              </div>
              <div>
                <span className="font-semibold">{et ? "Ingest" : "Ingest"}:</span>{" "}
                {entry.ingestSummary?.canIngest
                  ? et ? "valmis" : "ready"
                  : (entry.ingestSummary?.blockingIssues || []).join("; ") || (et ? "pole valmis" : "not ready")}
              </div>
              <div>
                <span className="font-semibold">{et ? "Vigased failid" : "Invalid files"}:</span>{" "}
                {webInvalidLabels.length ? webInvalidLabels.join(", ") : "-"}
              </div>
              <div>
                <span className="font-semibold">{et ? "Puuduvad failid" : "Missing files"}:</span>{" "}
                {webMissingLabels.length ? webMissingLabels.join(", ") : "-"}
              </div>
              <div>
                <span className="font-semibold">{et ? "Viimati ingestitud" : "Last ingested"}:</span>{" "}
                {entry.lastIngestedAt ? formatDateTime(entry.lastIngestedAt, locale) : "-"}
              </div>
              <div>
                <span className="font-semibold">RAG doc ID:</span> {entry.ragDocId || "-"}
              </div>
              {entry.lastIngestError ? (
                <div className="sm:col-span-2 rounded-[10px] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_10%,var(--admin-surface-3)_90%)] px-2 py-1 text-[#ef4444]">
                  <span className="font-semibold">{et ? "Viimane ingest viga" : "Last ingest error"}:</span> {entry.lastIngestError}
                </div>
              ) : null}
            </div>

            {renderFileCards({
              entry,
              locale,
              et,
              definitions: WEB_FILE_DEFINITIONS,
              files: entry.webFiles,
              fileBusyKey,
              onUploadFile,
              onRemoveFile,
              fileInputRefs,
              remediationFocus
            })}
          </div>
        </div>
      </div>

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div>
            <div className="text-[0.98rem] font-semibold text-[color:var(--admin-text)]">{et ? "Riigi Teataja" : "Riigi Teataja"}</div>
            <div className={cardSubClassName}>
              {et ? "Oiguslik ja kinnitav kiht." : "Legal and confirming layer."}
            </div>
          </div>

          <div className="rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2.5 text-[0.86rem] leading-[1.45] text-[color:var(--admin-muted)]">
            {et
              ? "Siin hallad Riigi Teataja kihti. XML on siin ainus kanoniline allikas. Ingest parsib RT XML-faili, lisab identiteedi ja ehitab paragrahvi- voi loikepohised chunkid ilma normiteksti umber kirjutamata."
              : "This section manages the Riigi Teataja layer. XML is the only canonical source here. Ingest parses the RT XML file, adds identity, and builds paragraph- or subsection-based chunks without rewriting the legal text."}
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`${panelStackClassName} ${rtLinkFocused ? "rounded-[12px] border border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_8%,transparent)] p-2" : ""}`}>
                <label className={labelClassName}>{et ? "Riigi Teataja link" : "Riigi Teataja URL"}</label>
                <Input
                  value={detailDraft.riigiTeatajaUrl || ""}
                  onChange={event => updateDraft(onDraftChange, { riigiTeatajaUrl: event.target.value })}
                  className={inputClassName}
                  size="sm"
                  placeholder="https://..."
                  disabled={!editingLinks}
                />
                {!editingLinks ? (
                  <div className={readOnlyFieldClassName}>See viide kirjeldab kehtiva korra ametlikku RT allikat.</div>
                ) : null}
                {detailDraft.riigiTeatajaUrl ? (
                  <a
                    href={detailDraft.riigiTeatajaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 text-[0.86rem] font-semibold text-[color:var(--admin-text)] no-underline"
                  >
                    {et ? "Ava RT" : "Open RT"}
                  </a>
                ) : null}
              </div>

              <div className={panelStackClassName}>
                <label className={labelClassName}>{et ? "RT seis" : "RT status"}</label>
                <DocumentsDropdown
                  ariaLabel="RT seis"
                  value={detailDraft.rtStatus}
                  onChange={nextStatus => updateDraft(onDraftChange, { rtStatus: nextStatus })}
                  options={rtStatusOptions}
                  className="w-full"
                />
                <label className={labelClassName}>{et ? "RT kontrollitud" : "RT checked at"}</label>
                <Input
                  type="datetime-local"
                  value={detailDraft.rtCheckedAt || ""}
                  onChange={event => updateDraft(onDraftChange, { rtCheckedAt: event.target.value })}
                  className={inputClassName}
                  size="sm"
                />
                <label className={labelClassName}>{et ? "RT markused" : "RT notes"}</label>
                <Textarea
                  value={detailDraft.rtNotes || ""}
                  onChange={event => updateDraft(onDraftChange, { rtNotes: event.target.value })}
                  className={inputClassName}
                  rows={4}
                  size="sm"
                />
              </div>
            </div>

            {renderSaveActions({
              et,
              saveBusy,
              onSave,
              message,
              hint: et
                ? "Salvestab RT lingi, RT seisu, kontrolli aja ja RT märkused."
                : "Saves the RT link, RT status, checked time, and RT notes."
            })}

            <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.86rem] text-[color:var(--admin-text)] sm:grid-cols-2">
              <div>
                <span className="font-semibold">{et ? "Kokkuvote" : "Summary"}:</span>{" "}
                {et
                  ? `${rtSummary.presentCount || 0}/1 olemas, ${rtSummary.validCount || 0}/1 valid`
                  : `${rtSummary.presentCount || 0}/1 present, ${rtSummary.validCount || 0}/1 valid`}
              </div>
              <div>
                <span className="font-semibold">{et ? "Ingest" : "Ingest"}:</span>{" "}
                {entry.rtIngestSummary?.canIngest
                  ? et ? "valmis" : "ready"
                  : (entry.rtIngestSummary?.blockingIssues || []).join("; ") || (et ? "pole valmis" : "not ready")}
              </div>
              <div>
                <span className="font-semibold">{et ? "RT vigased failid" : "RT invalid files"}:</span>{" "}
                {rtInvalidLabels.length ? rtInvalidLabels.join(", ") : "-"}
              </div>
              <div>
                <span className="font-semibold">{et ? "RT puuduvad failid" : "RT missing files"}:</span>{" "}
                {rtMissingLabels.length ? rtMissingLabels.join(", ") : "-"}
              </div>
            </div>
            <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-[0.86rem] text-[color:var(--admin-text)] sm:grid-cols-2">
              <div>
                <span className="font-semibold">{et ? "RT failid" : "RT files"}:</span> {entry.rtFileCount || 0}/1
              </div>
              <div>
                <span className="font-semibold">{et ? "RT kontrollitud" : "RT checked at"}:</span>{" "}
                {entry.rtCheckedAt ? formatDateTime(entry.rtCheckedAt, locale) : "-"}
              </div>
              <div>
                <span className="font-semibold">{et ? "RT automaatkontroll" : "RT light check"}:</span>{" "}
                {entry.rtLastLightCheckAt ? formatDateTime(entry.rtLastLightCheckAt, locale) : "-"}
              </div>
              <div>
                <span className="font-semibold">{et ? "RT viimati ingestitud" : "RT last ingested"}:</span>{" "}
                {entry.rtLastIngestedAt ? formatDateTime(entry.rtLastIngestedAt, locale) : "-"}
              </div>
              <div>
                <span className="font-semibold">RT RAG doc ID:</span> {entry.rtRagDocId || "-"}
              </div>
              {entry.rtLastIngestError ? (
                <div className="sm:col-span-2 rounded-[10px] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_10%,var(--admin-surface-3)_90%)] px-2 py-1 text-[#ef4444]">
                  <span className="font-semibold">{et ? "RT viimane ingest viga" : "Last RT ingest error"}:</span> {entry.rtLastIngestError}
                </div>
              ) : (
                <div className="sm:col-span-2 text-[color:var(--admin-muted)]">
                  {et
                    ? "RT plokk ingestitakse nuud XML algallikast. Chunke ei hallata kasitsi, vaid need regenereeritakse kogu akti kaupa."
                    : "The RT block is now ingested from the XML source file. Chunks are not manually maintained and are regenerated for the whole act."}
                </div>
              )}
            </div>

            {renderFileCards({
              entry,
              locale,
              et,
              definitions: RT_FILE_DEFINITIONS,
              files: entry.rtFiles,
              fileBusyKey,
              onUploadFile,
              onRemoveFile,
              fileInputRefs,
              remediationFocus
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

