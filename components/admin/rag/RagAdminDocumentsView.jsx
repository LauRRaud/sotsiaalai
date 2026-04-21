"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import Input from "@/components/ui/Input";
import ModalConfirm from "@/components/ui/ModalConfirm";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";
import { localizePath } from "@/lib/localizePath";

import RagAdminAlert from "./RagAdminAlert";
import RagAdminDetailModal from "./RagAdminDetailModal";
import {
  STATUS_CLASSES,
  badgeBaseClassName,
  badgeGhostClassName,
  buttonBaseClassName,
  buttonCompactClassName,
  buttonDangerClassName,
  buttonGhostClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cardBodyClassName,
  cardClassName,
  cardHeadClassName,
  cardSubClassName,
  docCheckClassName,
  docDetailActionsClassName,
  docDetailClassName,
  docDetailDescClassName,
  docDetailEmptyClassName,
  docDetailMetaClassName,
  docDetailMetaItemClassName,
  docDetailMetaLabelClassName,
  docDetailMetaValueClassName,
  docDetailSourceClassName,
  docDetailSourceTextClassName,
  docDetailStatusClassName,
  docDetailTagsClassName,
  docDetailTimeClassName,
  docDetailTitleClassName,
  docDetailTopClassName,
  docDetailWrapperClassName,
  docHeadClassName,
  docItemActiveClassName,
  docItemBaseClassName,
  docItemMainClassName,
  docItemMetaClassName,
  docItemMetaPillClassName,
  docItemTimeClassName,
  docItemTitleClassName,
  docSelectClassName,
  docSummaryClassName,
  docSummaryDotClassName,
  docSummarySelectedClassName,
  docsClassName,
  docsEmptyClassName,
  docsLayoutClassName,
  docsListClassName,
  dropdownClassName,
  emptyFilterNoteClassName,
  formatDateTime,
  formatPdfRange,
  inputClassName,
  quickTagsClassName,
  quickTagsLabelClassName,
  tagChipActiveClassName,
  tagChipBaseClassName,
  tagsWrapClassName,
  toolbarPrimaryClassName,
  toolbarSecondaryClassName
} from "./ragAdminShared";

function renderTags(tags) {
  if (!tags || !tags.length) {
    return <span className="text-[color:var(--admin-muted)]">-</span>;
  }

  const visible = tags.slice(0, 4);
  const extra = tags.length - visible.length;

  return (
    <div className={tagsWrapClassName}>
      {visible.map(tag => (
        <span className={`${badgeBaseClassName} ${badgeGhostClassName}`} key={tag}>
          {tag}
        </span>
      ))}
      {extra > 0 ? <span className={`${badgeBaseClassName} ${badgeGhostClassName}`}>+{extra}</span> : null}
    </div>
  );
}

const sectionButtonClassName =
  "flex min-h-[106px] flex-col items-start justify-between gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-3 text-left transition-colors hover:border-[color:var(--admin-accent)] hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_82%,var(--admin-accent-soft)_18%)]";

const sectionEyebrowClassName = "text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-muted)]";
const sectionTitleClassName = "text-[1rem] font-semibold text-[color:var(--admin-text)]";
const sectionBodyClassName = "text-[0.88rem] leading-[1.45] text-[color:var(--admin-muted)]";
const metricsWrapClassName = "flex flex-wrap items-center gap-1.5";
const statChipClassName = `${badgeBaseClassName} ${badgeGhostClassName}`;
const signalListClassName = "grid gap-2";
const signalRowClassName =
  "flex flex-wrap items-start justify-between gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2";
const signalLabelClassName = "text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const signalValueClassName = "text-[0.95rem] font-medium text-[color:var(--admin-text)]";
const noteCardClassName =
  "rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)]/70 px-3 py-2.5 text-[0.88rem] leading-[1.45] text-[color:var(--admin-muted)]";
const templateListClassName = "grid gap-1.5";
const templateItemClassName =
  "flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2";
const sourceRegistryListClassName = "grid gap-1.5";
const sourceRegistryButtonClassName =
  "flex w-full items-center justify-between gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2 text-left transition-colors hover:border-[color:var(--admin-accent)] hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_82%,var(--admin-accent-soft)_18%)]";

function getDocSourceKey(doc) {
  const source = String(doc?.url || doc?.source_url || doc?.source_path || "").trim();
  if (!source) return "NO_SOURCE";

  if (/^https?:\/\//i.test(source)) {
    try {
      return new URL(source).hostname.replace(/^www\./i, "") || "NO_SOURCE";
    } catch {
      return source;
    }
  }

  return "LOCAL_FILE";
}

function formatSourceLabel(value) {
  if (value === "LOCAL_FILE") return "Kohalik fail";
  if (value === "NO_SOURCE") return "Allikas puudub";
  return value;
}

export default function RagAdminDocumentsView({ controller, showMessage = true }) {
  const [showAllTags, setShowAllTags] = useState(false);

  const {
    tr,
    locale,
    localeTag,
    message,
    resetMessage,
    loadingList,
    docMetrics,
    topTags,
    filterTags,
    toggleFilterTag,
    searchQuery,
    setSearchQuery,
    filterSection,
    setFilterSection,
    filterAudience,
    setFilterAudience,
    filterSource,
    setFilterSource,
    filterYear,
    setFilterYear,
    sortBy,
    setSortBy,
    sectionFilterOptions,
    audienceFilterOptions,
    sourceFilterOptions,
    yearFilterOptions,
    sortOptions,
    filterIssue,
    setFilterIssue,
    issueFilterOptions,
    allTags,
    selectedIds,
    handleBulkReindex,
    reindexingId,
    visibleDocs,
    filteredCount,
    toggleSelectAllVisible,
    previewId,
    setPreviewId,
    toggleSelect,
    statusLabels,
    previewDoc,
    getAudienceLabel,
    canEditDocMeta,
    openDetail,
    handleReindex,
    handleDelete,
    deletingId,
    canViewSource,
    viewSource,
    visibleCount,
    setVisibleCount,
    filteredDocs,
    deleteConfirmDocId,
    confirmDelete,
    closeDeleteConfirm,
    normalizedDocs,
    metaTemplates,
    audienceSelectOptions
  } = controller;

  const sourceTypeSummary = useMemo(() => {
    const counts = new Map();

    for (const doc of normalizedDocs) {
      const type = String(doc.type || doc.source_type || "UNKNOWN").trim() || "UNKNOWN";
      counts.set(type, (counts.get(type) || 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [normalizedDocs]);

  const sectionSummary = useMemo(() => {
    const counts = new Map();

    for (const doc of normalizedDocs) {
      if (!doc.section) continue;
      counts.set(doc.section, (counts.get(doc.section) || 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [normalizedDocs]);

  const sourceLogicSignals = useMemo(
    () => [
      {
        label: "Praegune register",
        value: `${docMetrics.total} dokumenti`
      },
      {
        label: "Peamised allikatüübid",
        value: sourceTypeSummary.length
          ? sourceTypeSummary.map(([type, count]) => `${type} (${count})`).join(", ")
          : "Andmed puuduvad"
      },
      {
        label: "Levinumad sektsioonid",
        value: sectionSummary.length
          ? sectionSummary.map(([section, count]) => `${section} (${count})`).join(", ")
          : "Sektsioonid puuduvad"
      },
      {
        label: "Siltide kiht",
        value: topTags.length ? `${topTags.slice(0, 6).join(", ")}` : "Silte pole veel"
      }
    ],
    [docMetrics.total, sectionSummary, sourceTypeSummary, topTags]
  );

  const settingsSignals = useMemo(
    () => [
      {
        label: "Metadata mallid",
        value: `${metaTemplates.length} aktiivset malli`
      },
      {
        label: "Audience vaikevalikud",
        value: audienceSelectOptions.map(option => option.label).join(", ")
      },
      {
        label: "Meta muutmine",
        value: "FILE dokumentidel detailmodalist"
      },
      {
        label: "Taaskasutus ingestis",
        value: "Mallid ja kontroll voolavad samast admin-loogikast"
      }
    ],
    [audienceSelectOptions, metaTemplates.length]
  );

  const sourceRegistry = useMemo(() => {
    const counts = new Map();

    for (const doc of normalizedDocs) {
      const key = getDocSourceKey(doc);
      const current = counts.get(key) || { key, count: 0, kinds: new Set(), lastSeen: null };
      current.count += 1;
      current.kinds.add(String(doc.type || doc.source_type || "UNKNOWN").trim() || "UNKNOWN");
      const syncedAt = doc.insertedAt || doc.lastIngested || doc.updatedAt || doc.createdAt || null;
      if (syncedAt && (!current.lastSeen || new Date(syncedAt) > new Date(current.lastSeen))) {
        current.lastSeen = syncedAt;
      }
      counts.set(key, current);
    }

    return [...counts.values()]
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
      .slice(0, 8)
      .map(item => ({
        ...item,
        kinds: [...item.kinds].sort((a, b) => a.localeCompare(b))
      }));
  }, [normalizedDocs]);

  const activeSourceEntry = useMemo(
    () => (filterSource !== "ALL" ? sourceRegistry.find(entry => entry.key === filterSource) || null : null),
    [filterSource, sourceRegistry]
  );

  const activeSourceDocSummary = useMemo(() => {
    if (!activeSourceEntry) return null;

    const docsForSource = normalizedDocs.filter(doc => getDocSourceKey(doc) === activeSourceEntry.key);
    const latestDoc = docsForSource
      .slice()
      .sort((a, b) => new Date(b.insertedAt || b.updatedAt || b.createdAt || 0) - new Date(a.insertedAt || a.updatedAt || a.createdAt || 0))[0];

    return {
      count: docsForSource.length,
      sections: [...new Set(docsForSource.map(doc => doc.section).filter(Boolean))].slice(0, 4),
      audiences: [...new Set(docsForSource.map(doc => doc.audience).filter(Boolean))].slice(0, 4),
      latestTitle: latestDoc?.title || null
    };
  }, [activeSourceEntry, normalizedDocs]);

  const selectedFilterTags = useMemo(
    () => filterTags.filter(tag => allTags.includes(tag)),
    [allTags, filterTags]
  );

  return (
    <div className="grid gap-1.5">
      {showMessage ? <RagAdminAlert message={message} onDismiss={resetMessage} /> : null}

      <div className="grid gap-1.5 md:grid-cols-3">
        <button
          type="button"
          className={sectionButtonClassName}
          onClick={() => document.getElementById("rag-documents-register")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <span className={sectionEyebrowClassName}>Register</span>
          <div className="grid gap-1">
            <div className={sectionTitleClassName}>Dokumendid</div>
            <div className={sectionBodyClassName}>Olemasolevad dokumendid, detailvaade, meta muutmine, reindex ja source view.</div>
          </div>
          <div className={metricsWrapClassName}>
            <span className={statChipClassName}>{docMetrics.total} kokku</span>
            <span className={statChipClassName}>{docMetrics.filtered} filtris</span>
          </div>
        </button>

        <button
          type="button"
          className={sectionButtonClassName}
          onClick={() => document.getElementById("rag-documents-sources")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <span className={sectionEyebrowClassName}>Allikad</span>
          <div className="grid gap-1">
            <div className={sectionTitleClassName}>Allikate loogika</div>
            <div className={sectionBodyClassName}>Vaata, millistest failidest, URL-idest ja sisutüüpidest register praegu koosneb.</div>
          </div>
          <div className={metricsWrapClassName}>
            <span className={statChipClassName}>{sourceTypeSummary.length} peamist tüüpi</span>
            <span className={statChipClassName}>{topTags.length} kiiret silti</span>
          </div>
        </button>

        <button
          type="button"
          className={sectionButtonClassName}
          onClick={() => document.getElementById("rag-documents-settings")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <span className={sectionEyebrowClassName}>Seaded</span>
          <div className="grid gap-1">
            <div className={sectionTitleClassName}>Mallid ja reeglid</div>
            <div className={sectionBodyClassName}>Koht metadata mallide, vaikevalikute ja dokumendihalduse reeglite jaoks.</div>
          </div>
          <div className={metricsWrapClassName}>
            <span className={statChipClassName}>{metaTemplates.length} malli</span>
            <span className={statChipClassName}>{audienceSelectOptions.length} audience valikut</span>
          </div>
        </button>
      </div>

      <div className={cardClassName} id="rag-documents-register">
        <div className={cardBodyClassName}>
          <div className={cardHeadClassName}>
            <div>
              <CardTitle>{tr("admin.rag.documents.title")}</CardTitle>
              <div className={cardSubClassName}>
                {tr("admin.rag.documents.summary", {
                  total: docMetrics.total,
                  filtered: docMetrics.filtered,
                  pending: docMetrics.pending,
                  processing: docMetrics.processing,
                  completed: docMetrics.completed,
                  failed: docMetrics.failed
                })}
              </div>
            </div>
          </div>
          {topTags.length ? (
            <div className={quickTagsClassName}>
              <span className={quickTagsLabelClassName}>{tr("admin.rag.documents.quick_tags")}</span>
              {topTags.map(tag => (
                <button
                  type="button"
                  className={`${tagChipBaseClassName}${filterTags.includes(tag) ? ` ${tagChipActiveClassName}` : ""}`}
                  onClick={() => toggleFilterTag(tag)}
                  key={tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}

          <div className={toolbarPrimaryClassName}>
            <Input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder={tr("admin.rag.documents.search_placeholder")}
              size="sm"
              className={inputClassName}
            />
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.documents.filters.all_sections")}
              value={filterSection}
              onChange={setFilterSection}
              options={sectionFilterOptions}
              className={dropdownClassName}
            />
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.documents.filters.all_audiences")}
              value={filterAudience}
              onChange={setFilterAudience}
              options={audienceFilterOptions}
              className={dropdownClassName}
            />
            <DocumentsDropdown
              ariaLabel="Koik allikad"
              value={filterSource}
              onChange={setFilterSource}
              options={sourceFilterOptions}
              className={dropdownClassName}
            />
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.documents.filters.all_years")}
              value={filterYear}
              onChange={setFilterYear}
              options={yearFilterOptions}
              className={dropdownClassName}
            />
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.documents.sort.recent")}
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              className={dropdownClassName}
            />
          </div>

          <div className={toolbarSecondaryClassName}>
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.documents.filters.all_issues")}
              value={filterIssue}
              onChange={setFilterIssue}
              options={issueFilterOptions}
              className={dropdownClassName}
            />
            {allTags.length ? (
              <div className="grid min-w-0 gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-2.5 py-2 min-[900px]:col-span-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`${buttonBaseClassName} ${buttonSecondaryClassName}`}
                    aria-expanded={showAllTags ? "true" : "false"}
                    onClick={() => setShowAllTags(current => !current)}
                  >
                    {showAllTags ? "Peida sildid" : `Kõik sildid (${allTags.length})`}
                  </Button>
                  <span className={quickTagsLabelClassName}>
                    {selectedFilterTags.length ? `Valitud ${selectedFilterTags.length}` : "Lisasildid on peidetud"}
                  </span>
                </div>
                {selectedFilterTags.length ? (
                  <div className={tagsWrapClassName} aria-label="Valitud sildid">
                    {selectedFilterTags.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        className={`${tagChipBaseClassName} ${tagChipActiveClassName}`}
                        onClick={() => toggleFilterTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : null}
                {showAllTags ? (
                  <div className="max-h-[12rem] overflow-y-auto pr-1">
                    <div className={tagsWrapClassName}>
                      {allTags.map(tag => (
                        <button
                          type="button"
                          key={tag}
                          className={`${tagChipBaseClassName}${filterTags.includes(tag) ? ` ${tagChipActiveClassName}` : ""}`}
                          onClick={() => toggleFilterTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className={emptyFilterNoteClassName}>Silte pole saadaval.</div>
            )}
            {selectedIds.size ? (
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName}`}
                onClick={handleBulkReindex}
                disabled={reindexingId !== null}
              >
                {tr("admin.rag.documents.reindex_selected", { count: selectedIds.size })}
              </Button>
            ) : null}
          </div>

          <div className={docsClassName}>
            <div className={docHeadClassName}>
              <label className={docCheckClassName}>
                <input
                  type="checkbox"
                  className="accent-[color:var(--admin-accent)]"
                  onChange={toggleSelectAllVisible}
                  checked={Boolean(visibleDocs.length && visibleDocs.every(doc => selectedIds.has(doc.id)))}
                />
                <span>{tr("admin.rag.documents.select_visible")}</span>
              </label>
              <div className={docSummaryClassName}>
                <span>{tr("admin.rag.documents.total", { total: docMetrics.total })}</span>
                <span className={docSummaryDotClassName} aria-hidden="true">|</span>
                <span>{tr("admin.rag.documents.filtered", { count: filteredCount })}</span>
                <span className={docSummaryDotClassName} aria-hidden="true">|</span>
                <span>{tr("admin.rag.documents.showing", { count: visibleDocs.length })}</span>
                {selectedIds.size ? <span className={docSummarySelectedClassName}>{tr("admin.rag.documents.selected", { count: selectedIds.size })}</span> : null}
              </div>
            </div>

            <div className={docsLayoutClassName}>
              <div className={docsListClassName}>
                {visibleDocs.map(doc => {
                  const status = doc.status || "COMPLETED";
                  const syncedAt = doc.insertedAt || doc.lastIngested || doc.updatedAt || doc.createdAt || null;
                  const isSelected = selectedIds.has(doc.id);
                  const isActive = doc.id === previewId;
                  const docType = doc.type || doc.source_type || "";

                  return (
                    <div
                      key={doc.id || doc._idx}
                      className={`${docItemBaseClassName}${isActive ? ` ${docItemActiveClassName}` : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onClick={() => setPreviewId(doc.id)}
                      onKeyDown={event => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setPreviewId(doc.id);
                        }
                      }}
                    >
                      <div className={docSelectClassName} onClick={event => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="accent-[color:var(--admin-accent)]"
                          checked={isSelected}
                          onChange={() => toggleSelect(doc.id)}
                        />
                      </div>
                      <div className={docItemMainClassName}>
                        <div className={docItemTitleClassName}>{doc.title || tr("admin.rag.documents.untitled")}</div>
                        <div className={docItemMetaClassName}>
                          <span className={STATUS_CLASSES[status] || badgeBaseClassName}>{statusLabels[status] || status}</span>
                          {docType ? <span className={docItemMetaPillClassName}>{docType}</span> : null}
                          {doc.section ? <span className={docItemMetaPillClassName}>{doc.section}</span> : null}
                          {doc.year ? <span className={docItemMetaPillClassName}>{doc.year}</span> : null}
                          {doc.issueLabel ? (
                            <span className={docItemMetaPillClassName}>
                              {tr("admin.rag.documents.issue_label", { issue: doc.issueLabel })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {syncedAt ? <div className={docItemTimeClassName}>{formatDateTime(syncedAt, localeTag)}</div> : null}
                    </div>
                  );
                })}

                {!visibleDocs.length ? (
                  <div className={docsEmptyClassName}>
                    {loadingList ? tr("admin.common.loading_data") : tr("admin.rag.documents.no_results")}
                  </div>
                ) : null}
              </div>

              <div className={docDetailWrapperClassName}>
                {previewDoc ? (
                  (() => {
                    const status = previewDoc.status || "COMPLETED";
                    const syncedAt = previewDoc.insertedAt || previewDoc.lastIngested || previewDoc.updatedAt || previewDoc.createdAt || null;
                    const pageLabel = previewDoc.pageRange || formatPdfRange(previewDoc) || "-";
                    const source = previewDoc.url || previewDoc.source_url || previewDoc.source_path || "";
                    const typeLabel = previewDoc.type || previewDoc.source_type || "";
                    const canEdit = canEditDocMeta(previewDoc);
                    const canView = canViewSource(previewDoc);

                    return (
                      <div className={docDetailClassName}>
                        <div className={docDetailTopClassName}>
                          <div>
                            <div className={docDetailTitleClassName}>{previewDoc.title || tr("admin.rag.documents.untitled")}</div>
                            {previewDoc.description ? <div className={docDetailDescClassName}>{previewDoc.description}</div> : null}
                          </div>
                          <div className={docDetailStatusClassName}>
                            <span className={STATUS_CLASSES[status] || badgeBaseClassName}>{statusLabels[status] || status}</span>
                            {syncedAt ? <span className={docDetailTimeClassName}>{formatDateTime(syncedAt, localeTag)}</span> : null}
                          </div>
                        </div>
                        <div className={docDetailMetaClassName}>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.section")}</span>
                            <span className={docDetailMetaValueClassName}>{previewDoc.section || "-"}</span>
                          </div>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.authors")}</span>
                            <span className={docDetailMetaValueClassName}>{(previewDoc.authors || []).join(", ") || "-"}</span>
                          </div>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.year_issue")}</span>
                            <span className={docDetailMetaValueClassName}>
                              {previewDoc.year || "-"}
                              {previewDoc.issueLabel ? ` / ${previewDoc.issueLabel}` : ""}
                            </span>
                          </div>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.audience")}</span>
                            <span className={docDetailMetaValueClassName}>{getAudienceLabel(previewDoc.audience)}</span>
                          </div>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.page")}</span>
                            <span className={docDetailMetaValueClassName}>{pageLabel}</span>
                          </div>
                          <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>DocId</span>
                            <span className={docDetailMetaValueClassName}>{previewDoc.docId || previewDoc.id || "-"}</span>
                          </div>
                          {previewDoc.journalTitle ? (
                            <div className={docDetailMetaItemClassName}>
                              <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.issue")}</span>
                              <span className={docDetailMetaValueClassName}>{previewDoc.journalTitle}</span>
                            </div>
                          ) : null}
                          {previewDoc.language ? (
                            <div className={docDetailMetaItemClassName}>
                              <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.language")}</span>
                              <span className={docDetailMetaValueClassName}>{previewDoc.language}</span>
                            </div>
                          ) : null}
                          {typeLabel ? (
                            <div className={docDetailMetaItemClassName}>
                              <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.type")}</span>
                              <span className={docDetailMetaValueClassName}>{typeLabel}</span>
                            </div>
                          ) : null}
                          {previewDoc.articleId ? (
                            <div className={docDetailMetaItemClassName}>
                              <span className={docDetailMetaLabelClassName}>ArticleId</span>
                              <span className={docDetailMetaValueClassName}>{previewDoc.articleId}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className={docDetailTagsClassName}>
                          <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.tags")}</span>
                          {renderTags(previewDoc.tags)}
                        </div>
                        {source ? (
                          <div className={docDetailSourceClassName}>
                            <span className={docDetailMetaLabelClassName}>{tr("admin.rag.details.source")}</span>
                            <span className={docDetailSourceTextClassName}>{source}</span>
                          </div>
                        ) : null}
                        <div className={docDetailActionsClassName}>
                          <Button
                            variant="ghost"
                            className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                            onClick={() => openDetail(previewDoc)}
                            disabled={!canEdit}
                          >
                            {tr("admin.rag.actions.edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                            onClick={() => handleReindex(previewDoc.id)}
                            disabled={reindexingId === previewDoc.id}
                          >
                            {reindexingId === previewDoc.id ? tr("admin.rag.actions.reindexing") : tr("admin.rag.actions.reindex")}
                          </Button>
                          <Button
                            variant="danger"
                            className={`${buttonBaseClassName} ${buttonDangerClassName} ${buttonCompactClassName}`}
                            onClick={() => handleDelete(previewDoc.id)}
                            disabled={deletingId === previewDoc.id}
                          >
                            {deletingId === previewDoc.id ? tr("admin.rag.actions.deleting") : tr("admin.rag.actions.delete")}
                          </Button>
                          <Button
                            variant="ghost"
                            className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                            onClick={() => viewSource(previewDoc)}
                            disabled={!canView}
                          >
                            {tr("admin.rag.actions.view")}
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className={docDetailEmptyClassName}>{tr("admin.rag.details.select_material")}</div>
                )}
              </div>
            </div>
          </div>

          {visibleCount < filteredDocs.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                className={`${buttonBaseClassName} ${buttonSecondaryClassName}`}
                onClick={() => setVisibleCount(count => count + 25)}
              >
                {tr("admin.rag.documents.load_more")} {Math.min(25, filteredDocs.length - visibleCount)}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className={cardClassName} id="rag-documents-sources">
          <div className={cardBodyClassName}>
            <div className={cardHeadClassName}>
              <div>
                <CardTitle>Allikate loogika</CardTitle>
                <div className={cardSubClassName}>
                  Documents ei ole ainult register. See osa koondab olemasolevast registrist nähtava allikapildi, mille otsa saab hiljem ehitada eraldi source registry.
                </div>
              </div>
            </div>

            <div className={signalListClassName}>
              {sourceLogicSignals.map(item => (
                <div className={signalRowClassName} key={item.label}>
                  <div className={signalLabelClassName}>{item.label}</div>
                  <div className={signalValueClassName}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className={sourceRegistryListClassName}>
              {sourceRegistry.map(source => {
                const isActive = filterSource === source.key;

                return (
                  <button
                    type="button"
                    key={source.key}
                    className={sourceRegistryButtonClassName}
                    data-checked={isActive ? "true" : "false"}
                    onClick={() => setFilterSource(isActive ? "ALL" : source.key)}
                  >
                    <div className="grid gap-0.5">
                      <div className="text-[0.94rem] font-semibold text-[color:var(--admin-text)]">
                        {formatSourceLabel(source.key)}
                      </div>
                      <div className="text-[0.8rem] text-[color:var(--admin-muted)]">
                        {source.kinds.slice(0, 3).join(", ") || "Tuup teadmata"}
                        {source.lastSeen ? ` | ${formatDateTime(source.lastSeen, localeTag)}` : ""}
                      </div>
                    </div>
                    <span className={statChipClassName}>{source.count}</span>
                  </button>
                );
              })}
            </div>

            {activeSourceEntry && activeSourceDocSummary ? (
              <div className={signalRowClassName}>
                <div className="grid gap-1">
                  <div className={signalLabelClassName}>Valitud allikas</div>
                  <div className={signalValueClassName}>{formatSourceLabel(activeSourceEntry.key)}</div>
                  <div className="text-[0.84rem] leading-[1.45] text-[color:var(--admin-muted)]">
                    {activeSourceDocSummary.count} dokumenti
                    {activeSourceDocSummary.sections.length ? ` | sektsioonid: ${activeSourceDocSummary.sections.join(", ")}` : ""}
                    {activeSourceDocSummary.audiences.length ? ` | audience: ${activeSourceDocSummary.audiences.join(", ")}` : ""}
                    {activeSourceDocSummary.latestTitle ? ` | viimane: ${activeSourceDocSummary.latestTitle}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                  onClick={() => setFilterSource("ALL")}
                >
                  Eemalda filter
                </button>
              </div>
            ) : null}

            <div className={noteCardClassName}>
              Järgmine samm siinses alas on eraldi allikaregister: millised domeenid, failitüübid ja sisukanalid toidavad dokumentide registrit ning mis seisus need allikad on.
            </div>
          </div>
        </div>

        <div className={cardClassName} id="rag-documents-settings">
          <div className={cardBodyClassName}>
            <div className={cardHeadClassName}>
              <div>
                <CardTitle>Dokumendihalduse seaded</CardTitle>
                <div className={cardSubClassName}>
                  Siia koonduvad metadata mallid, valideerimise piirid ja ingestiga seotud vaikeväärtused. MVP-s näitab see kaart olemasolevat alust, mitte veel eraldi seadistusmoodulit.
                </div>
              </div>
            </div>

            <div className={signalListClassName}>
              {settingsSignals.map(item => (
                <div className={signalRowClassName} key={item.label}>
                  <div className={signalLabelClassName}>{item.label}</div>
                  <div className={signalValueClassName}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className={templateListClassName}>
              {metaTemplates.slice(0, 3).map(template => (
                <div className={templateItemClassName} key={template.key}>
                  <span className="text-[0.92rem] font-medium text-[color:var(--admin-text)]">{template.label}</span>
                  <span className={statChipClassName}>metadata mall</span>
                </div>
              ))}
            </div>

            <div className={signalListClassName}>
              <div className={signalRowClassName}>
                <div>
                  <div className={signalLabelClassName}>Registeri vaikevoog</div>
                  <div className="text-[0.84rem] leading-[1.45] text-[color:var(--admin-muted)]">
                    Uus sisu tuleb siia kas URL ingestist, PDF+metadata voost voi artiklite lisamisest. Registri detailvaade ja meta muutmine kasutavad sama andmekihti.
                  </div>
                </div>
              </div>
              <div className={signalRowClassName}>
                <div>
                  <div className={signalLabelClassName}>Jargmised seadistusastmed</div>
                  <div className="text-[0.84rem] leading-[1.45] text-[color:var(--admin-muted)]">
                    Source registry, domeenipohised vaikeseaded, tugevamad metadata piirid ja dokumentide halduse reeglid.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={localizePath("/admin/rag/ingest", locale)}
                className={`${buttonBaseClassName} ${buttonSecondaryClassName}`}
              >
                Ava ingesti mallid
              </Link>
              <button
                type="button"
                className={`${buttonBaseClassName} ${buttonGhostClassName}`}
                onClick={() => document.getElementById("rag-documents-register")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Tagasi registrisse
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirmDocId ? (
        <ModalConfirm
          message={tr("admin.rag.confirm.delete_doc")}
          confirmLabel={tr("admin.rag.actions.delete")}
          cancelLabel={tr("admin.rag.actions.cancel")}
          onConfirm={confirmDelete}
          onCancel={closeDeleteConfirm}
          disabled={deletingId === deleteConfirmDocId}
          busy={deletingId === deleteConfirmDocId}
          busyLabel={tr("admin.rag.actions.deleting")}
        />
      ) : null}

      <RagAdminDetailModal controller={controller} />
    </div>
  );
}
