"use client";

import { useRef } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ORGANIZATION_CORE_FILE_KEYS, ORGANIZATION_FILE_ROLE_META } from "@/lib/admin/rag/organizations/shared";

import RagAdminAlert from "./RagAdminAlert";
import {
  badgeBaseClassName,
  buttonBaseClassName,
  buttonCompactClassName,
  buttonGhostClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cardBodyClassName,
  cardClassName,
  cardHeadClassName,
  cardSubClassName,
  docDetailMetaClassName,
  docDetailMetaItemClassName,
  docDetailMetaLabelClassName,
  docDetailMetaValueClassName,
  dropdownClassName,
  filePickerClassName,
  filePickerNameClassName,
  formatDateTime,
  inputClassName,
  rootClassName,
  rootInputVars,
  toolbarPrimaryClassName,
  toolbarSecondaryClassName
} from "./ragAdminShared";
import { useOrganizationAdminController } from "./organizations/useOrganizationAdminController";

const TYPE_LABELS = {
  ASSOCIATION: "MTU / uhendus",
  FOUNDATION: "Sihtasutus",
  SERVICE_PROVIDER: "Teenuseosutaja",
  PARTNER: "Partner",
  THEMATIC_SITE: "Teemaveeb",
  PUBLIC_BODY: "Avalik asutus"
};

const READINESS_STYLE = {
  PLANNED: "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]",
  REVIEW: "border-[#f59e0b] text-[#f59e0b]",
  READY: "border-[#22c55e] text-[#22c55e]"
};

const INGEST_STYLE = {
  NOT_INGESTED: "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]",
  READY: "border-[#38bdf8] text-[#38bdf8]",
  INGESTING: "border-[#f59e0b] text-[#f59e0b]",
  INGESTED: "border-[#22c55e] text-[#22c55e]",
  ERROR: "border-[#ef4444] text-[#ef4444]"
};

function readinessLabel(value, et) {
  if (value === "READY") return et ? "Valmis jargmiseks sammuks" : "Ready for next step";
  if (value === "REVIEW") return et ? "Vajab ulevaatust" : "Needs review";
  return et ? "Planeeritud" : "Planned";
}

function packageLabel(value, et) {
  if (value === "READY") return et ? "Pakett valmis" : "Package ready";
  if (value === "FILES_READY") return et ? "Failid koos" : "Files complete";
  if (value === "INVALID") return et ? "Vigased failid" : "Invalid files";
  if (value === "PARTIAL") return et ? "Osaline pakett" : "Partial package";
  return et ? "Tuumfailid puudu" : "Core files missing";
}

function packageClass(value) {
  if (value === "READY") return "border-[#22c55e] text-[#22c55e]";
  if (value === "FILES_READY") return "border-[#38bdf8] text-[#38bdf8]";
  if (value === "INVALID") return "border-[#ef4444] text-[#ef4444]";
  if (value === "PARTIAL") return "border-[#f59e0b] text-[#f59e0b]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

function ingestLabel(value, et) {
  if (value === "READY") return et ? "Ingestiks valmis" : "Ready";
  if (value === "INGESTING") return et ? "Ingest kaib" : "Ingesting";
  if (value === "INGESTED") return et ? "Ingestitud" : "Ingested";
  if (value === "ERROR") return et ? "Ingesti viga" : "Error";
  return et ? "Pole ingestitud" : "Not ingested";
}

function validationLabel(value, et) {
  if (value === "VALID") return et ? "valid" : "valid";
  if (value === "INVALID") return et ? "vigane" : "invalid";
  return et ? "puudub" : "missing";
}

function validationClass(value) {
  if (value === "VALID") return "border-[#22c55e] text-[#22c55e]";
  if (value === "INVALID") return "border-[#ef4444] text-[#ef4444]";
  return "border-[color:var(--admin-border)] text-[color:var(--admin-muted)]";
}

export default function RagAdminOrganizationsView({ locale, initialItems = [] }) {
  const controller = useOrganizationAdminController(locale, initialItems);
  const {
    et,
    query,
    setQuery,
    type,
    setType,
    activity,
    setActivity,
    typeOptions,
    filteredItems,
    selectedSlug,
    setSelectedSlug,
    selectedSlugs,
    toggleSelected,
    toggleSelectAllFiltered,
    selectedEntry,
    detailDraft,
    updateDraft,
    editing,
    saveBusy,
    fileBusyKey,
    revalidateBusySlug,
    ingestBusySlug,
    bulkIngestBusy,
    saveDetail,
    message,
    setMessage,
    resetFilters,
    applyQuickReadiness,
    uploadFile,
    removeFile,
    revalidateSingle,
    ingestSingle,
    ingestSelected
  } = controller;

  const attachmentInputRef = useRef(null);

  return (
    <div className={rootClassName} style={rootInputVars}>
      <RagAdminAlert message={message} onDismiss={() => setMessage(null)} />

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={cardHeadClassName}>
            <div className="rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-[0.9rem] text-[color:var(--admin-text)]">
              {et ? `Kirjeid: ${filteredItems.length}` : `Entries: ${filteredItems.length}`}
            </div>
          </div>

          <div className={toolbarPrimaryClassName}>
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={et ? "Otsi nime, fookuse voi marksona jargi" : "Search by name, focus, or keyword"}
              size="sm"
              className={inputClassName}
            />
            <select value={type} onChange={event => setType(event.target.value)} className={`${dropdownClassName} ${inputClassName}`}>
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {TYPE_LABELS[option.value] || option.label}
                </option>
              ))}
            </select>
            <select value={activity} onChange={event => setActivity(event.target.value)} className={`${dropdownClassName} ${inputClassName}`}>
              <option value="ACTIVE">{et ? "Ainult aktiivsed" : "Active only"}</option>
              <option value="INACTIVE">{et ? "Ainult mitteaktiivsed" : "Inactive only"}</option>
              <option value="ALL">{et ? "Koik" : "All"}</option>
            </select>
          </div>

          <div className={toolbarSecondaryClassName}>
            <div className="text-[0.84rem] text-[color:var(--admin-muted)]">
              {et ? "Tuumfailid ja paketivalmidus on olemas." : "Core files and package readiness are in place."}
            </div>
            {selectedSlugs.size ? (
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                onClick={ingestSelected}
                disabled={bulkIngestBusy}
              >
                {bulkIngestBusy
                  ? et ? "Saadan valitud RAG-i..." : "Ingesting selected..."
                  : et ? `Ingest valitud (${selectedSlugs.size})` : `Ingest selected (${selectedSlugs.size})`}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
              onClick={resetFilters}
            >
              {et ? "Nulli filtrid" : "Reset filters"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className={cardClassName}>
          <div className={cardBodyClassName}>
            <div className="overflow-hidden rounded-[1rem] border border-[color:var(--admin-border)]">
              <table className="min-w-full border-collapse text-left text-[0.92rem] text-[color:var(--admin-text)]">
                <thead className="bg-[color:var(--admin-surface-2)] text-[0.8rem] uppercase tracking-[0.06em] text-[color:var(--admin-muted)]">
                  <tr>
                    <th className="border-b border-[color:var(--admin-border)] px-3 py-2.5 font-semibold">
                      <input
                        type="checkbox"
                        className="accent-[color:var(--admin-accent)]"
                        checked={Boolean(filteredItems.length && filteredItems.every(item => selectedSlugs.has(item.slug)))}
                        onChange={toggleSelectAllFiltered}
                        aria-label={et ? "Vali koik" : "Select all"}
                      />
                    </th>
                    <th className="border-b border-[color:var(--admin-border)] px-3 py-2.5 font-semibold">{et ? "Organisatsioon" : "Organization"}</th>
                    <th className="border-b border-[color:var(--admin-border)] px-3 py-2.5 font-semibold">{et ? "Tuup" : "Type"}</th>
                    <th className="border-b border-[color:var(--admin-border)] px-3 py-2.5 font-semibold">{et ? "Fookus" : "Focus"}</th>
                    <th className="border-b border-[color:var(--admin-border)] px-3 py-2.5 font-semibold">{et ? "Valmisolek" : "Readiness"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const active = item.slug === selectedSlug;
                    return (
                      <tr
                        key={item.slug}
                        onClick={() => setSelectedSlug(item.slug)}
                        className={active ? "cursor-pointer bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)]" : "cursor-pointer hover:bg-[color-mix(in_srgb,var(--admin-accent)_5%,transparent)]"}
                      >
                        <td className="border-b border-[color:var(--admin-border)] px-3 py-2.5 align-top" onClick={event => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="accent-[color:var(--admin-accent)]"
                            checked={selectedSlugs.has(item.slug)}
                            onChange={() => toggleSelected(item.slug)}
                            aria-label={et ? "Vali organisatsioon" : "Select organization"}
                          />
                        </td>
                        <td className="border-b border-[color:var(--admin-border)] px-3 py-2.5 align-top">
                          <div className="font-semibold">{item.displayName}</div>
                          <div className="mt-1 text-[0.8rem] text-[color:var(--admin-muted)]">{item.slug}</div>
                        </td>
                        <td className="border-b border-[color:var(--admin-border)] px-3 py-2.5 align-top">{TYPE_LABELS[item.type] || item.type}</td>
                        <td className="border-b border-[color:var(--admin-border)] px-3 py-2.5 align-top">{item.focus || "-"}</td>
                        <td className="border-b border-[color:var(--admin-border)] px-3 py-2.5 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`${badgeBaseClassName} ${READINESS_STYLE[item.crawlReadiness] || READINESS_STYLE.PLANNED}`}>
                              {readinessLabel(item.crawlReadiness, et)}
                            </span>
                            <span className={`${badgeBaseClassName} ${packageClass(item.packageSummary?.state)}`}>
                              {packageLabel(item.packageSummary?.state, et)}
                            </span>
                            <span className={`${badgeBaseClassName} ${INGEST_STYLE[item.ingestStatus] || INGEST_STYLE.NOT_INGESTED}`}>
                              {ingestLabel(item.ingestStatus, et)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={cardClassName}>
          <div className={cardBodyClassName}>
            {selectedEntry ? (
              <>
                <div className={cardHeadClassName}>
                  <div>
                    <div className="text-[1.05rem] font-semibold text-[color:var(--admin-text)]">{selectedEntry.displayName}</div>
                    <div className={cardSubClassName}>{et ? "Pusiandmed, tuumfailid ja lisafailid." : "Persistent data, core files, and attachments."}</div>
                  </div>
                  <span className={`${badgeBaseClassName} ${packageClass(selectedEntry.packageSummary?.state)}`}>
                    {packageLabel(selectedEntry.packageSummary?.state, et)}
                  </span>
                </div>

                <div className={docDetailMetaClassName}>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>Slug</span>
                    <span className={docDetailMetaValueClassName}>{selectedEntry.slug}</span>
                  </div>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>{et ? "Tuup" : "Type"}</span>
                    <span className={docDetailMetaValueClassName}>{TYPE_LABELS[selectedEntry.type] || selectedEntry.type}</span>
                  </div>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>{et ? "Maakond / ulatus" : "County / scope"}</span>
                    <span className={docDetailMetaValueClassName}>{selectedEntry.county || "-"}</span>
                  </div>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>{et ? "Koik failid" : "All files"}</span>
                    <span className={docDetailMetaValueClassName}>{selectedEntry.fileCount || 0}</span>
                  </div>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>{et ? "Tuumfailid" : "Core files"}</span>
                    <span className={docDetailMetaValueClassName}>
                      {(selectedEntry.packageSummary?.presentCount || 0)}/{selectedEntry.packageSummary?.totalCount || 4}
                    </span>
                  </div>
                  <div className={docDetailMetaItemClassName}>
                    <span className={docDetailMetaLabelClassName}>{et ? "Ingest" : "Ingest"}</span>
                    <span className={docDetailMetaValueClassName}>{ingestLabel(selectedEntry.ingestStatus, et)}</span>
                  </div>
                </div>

                <div className="grid gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <Input
                      value={detailDraft.displayName}
                      onChange={event => updateDraft("displayName", event.target.value)}
                      placeholder={et ? "Organisatsiooni nimi" : "Organization name"}
                      size="sm"
                      className={inputClassName}
                    />
                    <select value={detailDraft.type} onChange={event => updateDraft("type", event.target.value)} className={`${dropdownClassName} ${inputClassName}`}>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={detailDraft.focus}
                      onChange={event => updateDraft("focus", event.target.value)}
                      placeholder={et ? "Fookus" : "Focus"}
                      size="sm"
                      className={inputClassName}
                    />
                    <Input
                      value={detailDraft.county}
                      onChange={event => updateDraft("county", event.target.value)}
                      placeholder={et ? "Maakond voi ulatus" : "County or scope"}
                      size="sm"
                      className={inputClassName}
                    />
                    <Input
                      value={detailDraft.officialWebsite}
                      onChange={event => updateDraft("officialWebsite", event.target.value)}
                      placeholder={et ? "Ametlik veeb" : "Official website"}
                      size="sm"
                      className={`sm:col-span-2 ${inputClassName}`}
                    />
                    <Input
                      value={detailDraft.contactEmail}
                      onChange={event => updateDraft("contactEmail", event.target.value)}
                      placeholder={et ? "Kontakt e-post" : "Contact email"}
                      size="sm"
                      className={inputClassName}
                    />
                    <Input
                      value={detailDraft.contactPhone}
                      onChange={event => updateDraft("contactPhone", event.target.value)}
                      placeholder={et ? "Kontakt telefon" : "Contact phone"}
                      size="sm"
                      className={inputClassName}
                    />
                    <select
                      value={detailDraft.crawlReadiness}
                      onChange={event => updateDraft("crawlReadiness", event.target.value)}
                      className={`${dropdownClassName} ${inputClassName}`}
                    >
                      <option value="PLANNED">{et ? "Planeeritud" : "Planned"}</option>
                      <option value="REVIEW">{et ? "Vajab ulevaatust" : "Needs review"}</option>
                      <option value="READY">{et ? "Valmis jargmiseks sammuks" : "Ready for next step"}</option>
                    </select>
                    <select
                      value={detailDraft.isActive ? "ACTIVE" : "INACTIVE"}
                      onChange={event => updateDraft("isActive", event.target.value === "ACTIVE")}
                      className={`${dropdownClassName} ${inputClassName}`}
                    >
                      <option value="ACTIVE">{et ? "Aktiivne" : "Active"}</option>
                      <option value="INACTIVE">{et ? "Mitteaktiivne" : "Inactive"}</option>
                    </select>
                  </div>

                  <textarea
                    value={detailDraft.notes}
                    onChange={event => updateDraft("notes", event.target.value)}
                    placeholder={et ? "Markused organisatsiooni kohta" : "Notes about the organization"}
                    rows={5}
                    className="min-h-[7rem] rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-[0.95rem] text-[color:var(--admin-text)] shadow-[var(--admin-shadow-soft)] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[color:var(--admin-accent)] focus:shadow-[0_0_0_3px_var(--admin-accent-soft)]"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                      onClick={() => applyQuickReadiness("REVIEW")}
                    >
                      {et ? "Margi ulevaatuseks" : "Mark for review"}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                      onClick={() => applyQuickReadiness("READY")}
                    >
                      {et ? "Margi valmis" : "Mark ready"}
                    </Button>
                    <Button
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      onClick={saveDetail}
                      disabled={saveBusy || !editing}
                    >
                      {saveBusy ? (et ? "Salvestan..." : "Saving...") : et ? "Salvesta muudatused" : "Save changes"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-1.5 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[0.9rem] font-semibold text-[color:var(--admin-text)]">{et ? "Paketi valmidus" : "Package readiness"}</div>
                    <span className={`${badgeBaseClassName} ${packageClass(selectedEntry.packageSummary?.state)}`}>
                      {packageLabel(selectedEntry.packageSummary?.state, et)}
                    </span>
                  </div>
                  <div className="text-[0.92rem] text-[color:var(--admin-muted)]">
                    {et ? `Tuumfailid: ${selectedEntry.packageSummary?.presentCount || 0}/${selectedEntry.packageSummary?.totalCount || 4}.`
                      : `Core files: ${selectedEntry.packageSummary?.presentCount || 0}/${selectedEntry.packageSummary?.totalCount || 4}.`}
                  </div>
                  <div className="text-[0.92rem] text-[color:var(--admin-muted)]">
                    {et ? `Valid: ${selectedEntry.packageSummary?.validCount || 0}/${selectedEntry.packageSummary?.totalCount || 4}.`
                      : `Valid: ${selectedEntry.packageSummary?.validCount || 0}/${selectedEntry.packageSummary?.totalCount || 4}.`}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                      onClick={() => revalidateSingle(selectedEntry.slug)}
                      disabled={revalidateBusySlug === selectedEntry.slug}
                    >
                      {revalidateBusySlug === selectedEntry.slug
                        ? et ? "Valideerin..." : "Revalidating..."
                        : et ? "Valideeri tuumfailid uuesti" : "Revalidate core files"}
                    </Button>
                    <Button
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      onClick={() => ingestSingle(selectedEntry.slug)}
                      disabled={ingestBusySlug === selectedEntry.slug || selectedEntry.ingestSummary?.canIngest !== true}
                    >
                      {ingestBusySlug === selectedEntry.slug
                        ? et ? "Saadan RAG-i..." : "Ingesting..."
                        : et ? "Ingest RAG-i" : "Ingest to RAG"}
                    </Button>
                  </div>
                  <div className="grid gap-1 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`${badgeBaseClassName} ${INGEST_STYLE[selectedEntry.ingestStatus] || INGEST_STYLE.NOT_INGESTED}`}>
                        {ingestLabel(selectedEntry.ingestStatus, et)}
                      </span>
                      {selectedEntry.ragDocId ? <span className={`${badgeBaseClassName} ${packageClass("FILES_READY")}`}>{selectedEntry.ragDocId}</span> : null}
                    </div>
                    {selectedEntry.lastIngestedAt ? (
                      <div className="text-[0.84rem] text-[color:var(--admin-muted)]">
                        {et ? "Viimati ingestitud" : "Last ingested"}: {formatDateTime(selectedEntry.lastIngestedAt, locale)}
                      </div>
                    ) : null}
                    {selectedEntry.lastIngestError ? (
                      <div className="text-[0.84rem] text-[#ef4444]">{selectedEntry.lastIngestError}</div>
                    ) : null}
                    {selectedEntry.ingestSummary?.blockingIssues?.length ? (
                      <div className="text-[0.84rem] text-[color:var(--admin-muted)]">
                        {selectedEntry.ingestSummary.blockingIssues.join(". ")}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-1.5 rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3">
                  <div className="text-[0.9rem] font-semibold text-[color:var(--admin-text)]">{et ? "Tuumfailid" : "Core files"}</div>
                  <div className="text-[0.92rem] text-[color:var(--admin-muted)]">
                    {et ? "Need 4 faili moodustavad pohipaketi." : "These 4 files form the core package."}
                  </div>

                  <div className="grid gap-1.5">
                    {ORGANIZATION_CORE_FILE_KEYS.map(key => {
                      const file = selectedEntry.coreFiles?.[key];
                      const roleMeta = ORGANIZATION_FILE_ROLE_META[key];
                      const busy = fileBusyKey === `${selectedEntry.slug}:${roleMeta.paramRole}`;
                      const inputId = `${selectedEntry.slug}-${roleMeta.paramRole}`;
                      const resolvedName = roleMeta.fileNamePattern.replace("{slug}", selectedEntry.slug);

                      return (
                        <div key={key} className="grid gap-1.5 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] p-2.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="grid gap-1">
                              <div className="font-semibold text-[color:var(--admin-text)]">{resolvedName}</div>
                              <div className="text-[0.82rem] text-[color:var(--admin-muted)]">
                                {file?.status === "missing"
                                  ? et ? "Puudub" : "Missing"
                                  : `${file.originalName} • ${(file.size / 1024).toFixed(1)} KB • ${file.uploadedAt ? formatDateTime(file.uploadedAt, locale) : "-"}`}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`${badgeBaseClassName} ${validationClass(file?.validationStatus)}`}>
                                  {validationLabel(file?.validationStatus, et)}
                                </span>
                              </div>
                              {file?.validationStatus === "INVALID" && file?.validationMessage ? (
                                <div className="text-[0.82rem] text-[#ef4444]">{file.validationMessage}</div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <input
                                id={inputId}
                                type="file"
                                className="hidden"
                                accept={roleMeta.accept}
                                onChange={event => {
                                  const nextFile = event.target.files?.[0];
                                  if (nextFile) uploadFile(selectedEntry.slug, roleMeta.paramRole, nextFile);
                                  event.target.value = "";
                                }}
                              />
                              <Button
                                variant="ghost"
                                className={`${buttonBaseClassName} ${buttonSecondaryClassName} ${buttonCompactClassName}`}
                                onClick={() => document.getElementById(inputId)?.click()}
                                disabled={busy}
                              >
                                {busy ? (et ? "Laen..." : "Uploading...") : file?.status === "missing" ? (et ? "Lae ules" : "Upload") : (et ? "Asenda" : "Replace")}
                              </Button>
                              {file?.downloadUrl ? (
                                <Button
                                  variant="ghost"
                                  className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                                  onClick={() => window.open(file.downloadUrl, "_blank", "noopener,noreferrer")}
                                >
                                  {et ? "Laadi alla" : "Download"}
                                </Button>
                              ) : null}
                              {file?.id ? (
                                <Button
                                  variant="ghost"
                                  className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                                  onClick={() => removeFile(selectedEntry.slug, file.id)}
                                >
                                  {et ? "Eemalda" : "Remove"}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-1.5 rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[0.9rem] font-semibold text-[color:var(--admin-text)]">{et ? "Lisafailid" : "Additional files"}</div>
                      <div className="text-[0.92rem] text-[color:var(--admin-muted)]">
                        {et ? "Muud toofailid ja lisadokumendid." : "Other working files and supporting documents."}
                      </div>
                    </div>
                    <div className="rounded-[999px] border border-[color:var(--admin-border)] px-2.5 py-1 text-[0.82rem] text-[color:var(--admin-muted)]">
                      {et ? `Lisafaile: ${selectedEntry.files?.length || 0}` : `Attachments: ${selectedEntry.files?.length || 0}`}
                    </div>
                  </div>

                  <input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    accept={ORGANIZATION_FILE_ROLE_META.attachment.accept}
                    onChange={event => {
                      const nextFile = event.target.files?.[0];
                      if (nextFile) uploadFile(selectedEntry.slug, "attachment", nextFile);
                      event.target.value = "";
                    }}
                  />

                  <div className={filePickerClassName}>
                    <Button
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonSecondaryClassName} ${buttonCompactClassName}`}
                      onClick={() => attachmentInputRef.current?.click()}
                      disabled={fileBusyKey === `${selectedEntry.slug}:attachment`}
                    >
                      {fileBusyKey === `${selectedEntry.slug}:attachment`
                        ? et ? "Laen..." : "Uploading..."
                        : et ? "Vali fail" : "Choose file"}
                    </Button>
                    <span className={filePickerNameClassName}>
                      {et ? "Toetatud: JSON, MD, TXT, PDF, DOCX, CSV" : "Supported: JSON, MD, TXT, PDF, DOCX, CSV"}
                    </span>
                  </div>

                  <div className="grid gap-1.5">
                    {selectedEntry.files?.length ? (
                      selectedEntry.files.map(file => {
                        const busy = fileBusyKey === `${selectedEntry.slug}:${file.id}`;
                        return (
                          <div key={file.id} className="grid gap-1.5 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] p-2.5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="grid gap-1">
                                <div className="font-semibold text-[color:var(--admin-text)]">{file.originalName}</div>
                                <div className="text-[0.82rem] text-[color:var(--admin-muted)]">
                                  {file.mime} • {(file.size / 1024).toFixed(1)} KB • {file.uploadedAt ? formatDateTime(file.uploadedAt, locale) : "-"}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="ghost"
                                  className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                                  onClick={() => window.open(file.downloadUrl, "_blank", "noopener,noreferrer")}
                                  disabled={busy}
                                >
                                  {et ? "Laadi alla" : "Download"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                                  onClick={() => removeFile(selectedEntry.slug, file.id)}
                                  disabled={busy}
                                >
                                  {busy ? (et ? "Eemaldan..." : "Removing...") : et ? "Eemalda" : "Remove"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={cardSubClassName}>
                        {et ? "Selle organisatsiooni juures ei ole veel lisafaile." : "There are no additional files on this organization yet."}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={cardSubClassName}>{et ? "Filtritega ei leitud uhtegi organisatsiooni." : "No organizations matched the current filters."}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
