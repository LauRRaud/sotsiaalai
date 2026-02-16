"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import ModalConfirm from "@/components/ui/ModalConfirm";
const STATUS_LABEL_KEYS = {
  PENDING: "admin.rag.status.pending",
  PROCESSING: "admin.rag.status.processing",
  COMPLETED: "admin.rag.status.completed",
  FAILED: "admin.rag.status.failed"
};
const rootClassName = "flex flex-col gap-2 text-[color:var(--admin-text)] [--rag-text:var(--admin-text)] [--rag-muted:var(--admin-muted)]";
const rootInputVars = {
  "--input-bg": "linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))",
  "--input-bg-hover": "linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))",
  "--input-bg-focus": "linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))",
  "--input-border": "1px solid var(--admin-border-strong)",
  "--input-text": "var(--admin-text)",
  "--input-caret": "var(--admin-text)",
  "--input-placeholder": "color-mix(in srgb, var(--admin-muted) 85%, transparent)",
  "--input-shadow": "inset 0 1px 0 rgba(255,255,255,0.04)",
  "--input-radius": "12px"
};
const cardClassName = "relative overflow-hidden rounded-[1rem] border border-[color:var(--glass-border-color,var(--admin-border))] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--admin-surface)_78%,var(--glass-surface-bg)_22%),color-mix(in_srgb,var(--admin-surface-2)_84%,transparent))] p-[clamp(0.72rem,1.9vw,0.95rem)] shadow-[var(--glass-shell-shadow,var(--admin-shadow-soft))] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_12%_-4%,rgba(255,255,255,0.11),transparent_44%)] before:opacity-65";
const cardBodyClassName = "relative z-[1] grid gap-2";
const cardHeadClassName = "flex flex-wrap items-start justify-between gap-2";
const cardSubClassName = "text-[0.95rem] text-[color:var(--admin-muted)] max-w-[56ch]";
const cardActionsClassName = "flex flex-wrap items-center justify-start gap-2";
const inputClassName = "rounded-[12px] text-[0.95rem]";
const selectClassName = "w-full rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--admin-surface-3)_86%,transparent),var(--admin-surface-3))] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background] duration-150 ease-out focus-visible:outline-none focus-visible:border-[color:var(--admin-accent)] focus-visible:shadow-[0_0_0_3px_var(--admin-accent-soft)]";
const compactSelectClassName = `${selectClassName} w-auto min-w-[11rem] max-w-full self-start text-left pr-9`;
const formNoteClassName = "text-[0.84rem] text-[color:var(--admin-muted)]";
const ingestGridClassName = "grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] items-start";
const ingestMainGridClassName = "grid gap-2 [grid-template-columns:minmax(0,1fr)]";
const ingestSupportStackClassName = "grid gap-2";
const panelStackClassName = "flex flex-col gap-[0.55rem] rounded-[16px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-[14px] text-[color:var(--admin-text)]";
const metaActionsClassName = "flex flex-wrap items-center justify-start gap-2";
const labelClassName = "text-[0.95rem] font-semibold text-[color:var(--admin-text)]";
const badgeBaseClassName = "inline-flex items-center rounded-full border px-2 py-[2px] text-[12px] font-semibold";
const badgeYellowClassName = "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#f59e0b_78%,var(--admin-text)_22%)]";
const badgeBlueClassName = "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#38bdf8_78%,var(--admin-text)_22%)]";
const badgeGreenClassName = "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#22c55e_78%,var(--admin-text)_22%)]";
const badgeRedClassName = "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#ef4444_78%,var(--admin-text)_22%)]";
const badgeGhostClassName = "border-transparent bg-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)] text-[color:var(--admin-accent)]";
const toolbarPrimaryClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-surface-2),var(--admin-surface-3))] p-2 shadow-[var(--admin-shadow-soft)]";
const toolbarSecondaryClassName = "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_80%,transparent)] p-2";
const metaCheckBaseClassName = "rounded-[10px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-2 text-[0.86rem] leading-[1.4]";
const metaCheckOkClassName = "border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_12%,var(--admin-surface-3)_88%)]";
const metaCheckWarnClassName = "border-[color:var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_12%,var(--admin-surface-3)_88%)]";
const metaCheckErrorClassName = "border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_12%,var(--admin-surface-3)_88%)]";
const alertBaseClassName = "rounded-[12px] border px-3 py-2";
const alertOkClassName = "border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_16%,var(--admin-surface-2)_84%)] text-[color:var(--admin-text)]";
const alertErrorClassName = "border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] text-[color:var(--admin-text)]";
const metaPanelClassName = "rounded-[16px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] p-[14px] shadow-[var(--admin-shadow-soft)]";
const metaPanelHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const metaPanelTitleClassName = "text-[0.95rem] font-[650] text-[color:var(--admin-text)]";
const metaPanelNoteClassName = "text-[0.9rem] text-[color:var(--admin-muted)] max-w-[60ch]";
const metaPanelLinkClassName = "inline-flex items-center gap-1.5 rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 text-[0.9rem] font-semibold text-[color:var(--admin-text)] no-underline hover:border-[color:var(--admin-accent-cool)]";
const metaPanelGridClassName = "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";
const metaPanelLabelClassName = "text-[0.76rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const metaPanelListClassName = "m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]";
const metaTabsClassName = "mt-2 flex flex-wrap gap-2";
const metaTabClassName = "rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-1 text-[0.85rem] font-semibold text-[color:var(--admin-text)] transition-[border-color,background,transform] duration-150 ease-out hover:border-[color:var(--admin-accent)] hover:-translate-y-[1px]";
const metaTabActiveClassName = "border-[color:var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]";
const codeBlockClassName = "rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-[0.85rem] leading-[1.5] text-[color:var(--admin-text)] shadow-[var(--admin-shadow-soft)]";
const hintClassName = "rounded-[14px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3";
const hintTitleClassName = "text-[0.95rem] font-semibold text-[color:var(--admin-text)]";
const hintBodyClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
const articlesClassName = "grid gap-2 rounded-[16px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] p-3";
const articlesHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const articlesTitleClassName = "text-[0.95rem] font-[650] text-[color:var(--admin-text)]";
const articlesNoteClassName = "text-[0.9rem] text-[color:var(--admin-muted)] max-w-[60ch]";
const articlesFormClassName = "grid gap-2";
const articlesActionsClassName = "flex flex-wrap gap-2";
const articlesResultClassName = "grid gap-2 text-[0.9rem] text-[color:var(--admin-muted)]";
const articlesListClassName = "m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]";
const tagsWrapClassName = "flex flex-wrap gap-1.5";
const quickTagsClassName = "flex flex-wrap items-center gap-2";
const quickTagsLabelClassName = "text-[0.88rem] text-[color:var(--admin-muted)]";
const tagChipBaseClassName = "rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-1 text-[0.84rem] font-semibold text-[color:var(--admin-text)] transition-[border-color,background,color,transform] duration-150 ease-out hover:border-[color:var(--admin-accent)] hover:-translate-y-[1px]";
const tagChipActiveClassName = "border-[color:var(--admin-accent-cool)] bg-[color-mix(in_srgb,var(--admin-accent-cool)_18%,transparent)]";
const docHeadClassName = "flex flex-wrap items-center justify-between gap-3";
const docSummaryClassName = "flex flex-wrap items-center gap-2 text-[0.92rem] text-[color:var(--admin-muted)]";
const docSummaryDotClassName = "text-[color:var(--admin-muted)]";
const docSummarySelectedClassName = "font-semibold text-[color:var(--admin-accent)]";
const docsClassName = "flex flex-col gap-1.5";
const docCheckClassName = "inline-flex items-center gap-2 font-semibold text-[color:var(--admin-text)]";
const docsLayoutClassName = "grid gap-4 [grid-template-columns:minmax(260px,0.95fr)_minmax(0,1.45fr)] items-start max-lg:[grid-template-columns:minmax(0,1fr)]";
const docsListClassName = "grid gap-2 max-h-[560px] overflow-auto pr-1";
const docsEmptyClassName = "text-center rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3 text-[color:var(--admin-muted)]";
const docDetailWrapperClassName = "sticky top-3 self-start max-lg:static";
const docDetailEmptyClassName = "text-center rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-4 text-[color:var(--admin-muted)]";
const docSelectClassName = "flex items-center";
const docItemBaseClassName = "grid cursor-pointer items-center gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-[10px_12px] [grid-template-columns:auto_1fr_auto] transition-[border-color,background,box-shadow,transform] duration-150 ease-out hover:border-[color:var(--admin-border-strong)] hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,var(--admin-surface))] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
const docItemActiveClassName = "border-[color:var(--admin-accent)] shadow-[0_0_0_1px_var(--admin-accent-soft),var(--admin-shadow-soft)]";
const docItemTitleClassName = "text-[color:var(--admin-text)] font-semibold leading-[1.2]";
const docItemMainClassName = "grid gap-1";
const docItemMetaClassName = "flex flex-wrap items-center gap-2 text-[0.82rem] text-[color:var(--admin-muted)]";
const docItemMetaPillClassName = "rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-0.5";
const docItemTimeClassName = "text-[0.78rem] text-[color:var(--admin-muted)] text-right whitespace-nowrap";
const docDetailClassName = "grid gap-3 rounded-[16px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-4 shadow-[var(--admin-shadow-soft)]";
const docDetailTopClassName = "flex flex-wrap items-start justify-between gap-3";
const docDetailTitleClassName = "text-[1.1rem] font-bold text-[color:var(--admin-text)]";
const docDetailDescClassName = "mt-1 text-[0.95rem] leading-[1.4] text-[color:var(--admin-muted)]";
const docDetailStatusClassName = "flex flex-wrap items-center gap-2";
const docDetailTimeClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
const docDetailMetaClassName = "grid gap-3 border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3 rounded-[12px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]";
const docDetailMetaItemClassName = "grid gap-1";
const docDetailMetaLabelClassName = "text-[0.7rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
const docDetailMetaValueClassName = "text-[0.92rem] text-[color:var(--admin-text)] break-words";
const docDetailTagsClassName = "grid gap-2";
const docDetailSourceClassName = "grid gap-2";
const docDetailSourceTextClassName = "text-[0.9rem] text-[color:var(--admin-muted)] break-words";
const docDetailActionsClassName = "flex flex-wrap gap-2";
const ragModalHeadClassName = "flex flex-wrap items-start justify-between gap-3";
const modalBodyClassName = "grid gap-3";
const readOnlyFieldClassName = "rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-muted)]";
const buttonBaseClassName = "min-h-[2.2rem] rounded-[0.9rem] px-[0.95rem] py-[0.45rem] text-[0.95rem] font-semibold tracking-[0.01em] shadow-[var(--admin-shadow-soft)]";
const buttonCompactClassName = "min-h-[2rem] px-[0.7rem] py-[0.35rem] text-[0.86rem]";
const buttonPrimaryClassName = "border border-[color:color-mix(in_srgb,var(--admin-accent)_65%,var(--admin-border)_35%)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--admin-accent)_35%,var(--admin-surface)_65%),var(--admin-surface-2))] text-[color:var(--admin-text)] hover:border-[color:var(--admin-accent)] hover:shadow-[0_0_0_3px_var(--admin-accent-soft),var(--admin-shadow)]";
const buttonGhostClassName = "border border-[color:var(--admin-border-strong)] bg-transparent text-[color:var(--admin-text)] shadow-none hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,transparent)]";
const buttonDangerClassName = "border border-[color:color-mix(in_srgb,var(--admin-danger)_45%,var(--admin-border)_55%)] bg-[color-mix(in_srgb,var(--admin-danger)_14%,transparent)] text-[color:var(--admin-danger)] shadow-none hover:bg-[color-mix(in_srgb,var(--admin-danger)_20%,transparent)]";
const buttonSecondaryClassName = "border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text)]";
const STATUS_CLASSES = {
  PENDING: `${badgeBaseClassName} ${badgeYellowClassName}`,
  PROCESSING: `${badgeBaseClassName} ${badgeBlueClassName}`,
  COMPLETED: `${badgeBaseClassName} ${badgeGreenClassName}`,
  FAILED: `${badgeBaseClassName} ${badgeRedClassName}`
};
const AUDIENCE_LABEL_KEYS = {
  SOCIAL_WORKER: "admin.rag.audience.social_worker",
  CLIENT: "admin.rag.audience.client",
  BOTH: "admin.rag.audience.both"
};
const AUDIENCE_VALUES = ["SOCIAL_WORKER", "CLIENT", "BOTH"];
const DEFAULT_POLL_MS = 15000;
const POLL_MS = Number(process.env.NEXT_PUBLIC_RAG_POLL_MS || DEFAULT_POLL_MS);
const PAGE_SIZE = 25;
const META_TEMPLATES = [
  { key: "base", labelKey: "admin.rag.meta.templates.base", file: "/rag-meta-templates/base.json" },
  { key: "periodical", labelKey: "admin.rag.meta.templates.periodical", file: "/rag-meta-templates/periodical.json" },
  { key: "regulation", labelKey: "admin.rag.meta.templates.regulation", file: "/rag-meta-templates/regulation.json" },
  { key: "report", labelKey: "admin.rag.meta.templates.report", file: "/rag-meta-templates/report.json" },
  { key: "web", labelKey: "admin.rag.meta.templates.web", file: "/rag-meta-templates/web.json" }
];
const META_REQUIRED_FIELDS = [{
  label: "docId",
  keys: ["docId", "doc_id"]
}, {
  label: "title",
  keys: ["title"]
}, {
  label: "section",
  keys: ["section"]
}, {
  label: "year",
  keys: ["year"]
}, {
  label: "audience",
  keys: ["audience"]
}, {
  label: "tags",
  keys: ["tags", "tags_list"]
}];
const META_RECOMMENDED_FIELDS = [{
  label: "description",
  keys: ["description"]
}, {
  label: "authors",
  keys: ["authors", "authors_list"]
}, {
  label: "issueLabel/issueId",
  keys: ["issueLabel", "issue_label", "issueId", "issue_id"]
}, {
  label: "articleId",
  keys: ["articleId", "article_id"]
}, {
  label: "pageRange",
  keys: ["pageRange"]
}, {
  label: "pdf_start_page/pdf_end_page",
  keys: ["pdf_start_page", "pdf_end_page", "pdfStartPage", "pdfEndPage"]
}, {
  label: "journalTitle",
  keys: ["journalTitle", "journal_title"]
}, {
  label: "language",
  keys: ["language"]
}, {
  label: "source_type",
  keys: ["source_type", "sourceType"]
}, {
  label: "source_url",
  keys: ["source_url", "sourceUrl", "url"]
}];
const hasMetaValue = (meta, keys = []) => keys.some(key => {
  const value = meta?.[key];
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
});
const validateMeta = meta => {
  const missingRequired = META_REQUIRED_FIELDS.filter(f => !hasMetaValue(meta, f.keys)).map(f => f.label);
  const missingRecommended = META_RECOMMENDED_FIELDS.filter(f => !hasMetaValue(meta, f.keys)).map(f => f.label);
  return {
    missingRequired,
    missingRecommended
  };
};
function formatI18n(template, values) {
  if (typeof template !== "string") return "";
  if (!values || typeof values !== "object") return template;
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}
function toLocaleTag(locale) {
  const normalized = String(locale || "en").toLowerCase();
  if (normalized.startsWith("et")) return "et-EE";
  if (normalized.startsWith("ru")) return "ru-RU";
  return "en-US";
}
const formatDateTime = (value, localeTag = "en-US") => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(localeTag, {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }
};
const deriveStatus = doc => doc && doc.status ? doc.status : "COMPLETED";
const deriveSyncedAt = doc => doc?.insertedAt || doc?.lastIngested || doc?.updatedAt || doc?.createdAt || null;
const formatPdfRange = doc => {
  const start = doc?.pdf_start_page;
  const end = doc?.pdf_end_page;
  if (!start && !end) return "";
  if (start && end) return `${start}-${end}`;
  return String(start || end);
};
const splitAuthors = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean).slice(0, 12);
  return String(v).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 12);
};
const splitTags = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean).slice(0, 24);
  return String(v).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 24);
};
const normalizeAuthorsForDisplay = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
  return splitAuthors(v);
};
const normalizeTags = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
  return splitTags(v);
};
const normalizeString = value => value == null ? "" : String(value).trim();
const normalizeUpper = value => normalizeString(value).toUpperCase();
const normalizeDoc = item => {
  const meta = item.metadata || item;
  const authors = normalizeAuthorsForDisplay(item.authors || meta.authors);
  const tags = normalizeTags(item.tags || meta.tags);
  const id = item.id || meta.id || meta.articleId || meta.docId || meta.doc_id || meta.article_id;
  return {
    ...item,
    id,
    docId: normalizeString(meta.docId || meta.doc_id || id),
    articleId: normalizeString(meta.articleId || meta.article_id || ""),
    title: normalizeString(item.title || meta.title || ""),
    description: normalizeString(item.description || meta.description || ""),
    section: normalizeString(item.section || meta.section || ""),
    issueLabel: normalizeString(item.issueLabel || meta.issueLabel || meta.issue_id || ""),
    issueId: normalizeString(item.issueId || meta.issueId || meta.issue_id || ""),
    year: item.year || meta.year || "",
    audience: normalizeUpper(item.audience || meta.audience || "BOTH") || "BOTH",
    pageRange: normalizeString(item.pageRange || meta.pageRange || ""),
    authors,
    tags,
    pdf_start_page: meta.pdf_start_page,
    pdf_end_page: meta.pdf_end_page,
    source_path: meta.source_path || meta.sourcePath || item.source_path,
    source_url: normalizeString(meta.source_url || meta.sourceUrl || item.sourceUrl || meta.url || item.url || ""),
    url: normalizeString(item.url || meta.url || meta.source_url || meta.sourceUrl || item.sourceUrl || ""),
    journalTitle: normalizeString(item.journalTitle || meta.journalTitle || meta.journal_title || ""),
    language: normalizeString(item.language || meta.language || ""),
    source_type: normalizeString(meta.source_type || meta.sourceType || item.source_type || item.sourceType || item.type || "")
  };
};
export default function RagAdminPanel() {
  const { t, locale } = useI18n();
  const localeTag = useMemo(() => toLocaleTag(locale), [locale]);
  const tr = useCallback((key, values) => {
    const raw = t(key);
    const template = typeof raw === "string" && raw.trim() ? raw : key;
    return formatI18n(template, values);
  }, [t]);
  const statusLabels = useMemo(() => ({
    PENDING: tr(STATUS_LABEL_KEYS.PENDING),
    PROCESSING: tr(STATUS_LABEL_KEYS.PROCESSING),
    COMPLETED: tr(STATUS_LABEL_KEYS.COMPLETED),
    FAILED: tr(STATUS_LABEL_KEYS.FAILED)
  }), [tr]);
  const audienceLabels = useMemo(() => {
    const out = {};
    for (const value of AUDIENCE_VALUES) {
      out[value] = tr(AUDIENCE_LABEL_KEYS[value]);
    }
    return out;
  }, [tr]);
  const audienceSelectOptions = useMemo(() => AUDIENCE_VALUES.map(value => ({
    value,
    label: audienceLabels[value] || value
  })), [audienceLabels]);
  const metaTemplates = useMemo(() => META_TEMPLATES.map(template => ({
    ...template,
    label: tr(template.labelKey)
  })), [tr]);
  const [docs, setDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null);
  const [selftestBusy, setSelftestBusy] = useState(false);
  const [selftestSteps, setSelftestSteps] = useState(null);
  const [pdfMetaAudience, setPdfMetaAudience] = useState("BOTH");
  const [pdfMetaBusy, setPdfMetaBusy] = useState(false);
  const [pdfMetaResult, setPdfMetaResult] = useState(null);
  const [metaCheck, setMetaCheck] = useState(null);
  const [showMetaGuide, setShowMetaGuide] = useState(false);
  const [activeMetaTemplateKey, setActiveMetaTemplateKey] = useState(META_TEMPLATES[0]?.key || "base");
  const [activeMetaTemplateContent, setActiveMetaTemplateContent] = useState("");
  const [articlesDocId, setArticlesDocId] = useState("");
  const [articlesJson, setArticlesJson] = useState("");
  const [articlesBusy, setArticlesBusy] = useState(false);
  const [articlesResult, setArticlesResult] = useState(null);
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlAudience, setUrlAudience] = useState("BOTH");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlDescription, setUrlDescription] = useState("");
  const [urlTags, setUrlTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("ALL");
  const [filterAudience, setFilterAudience] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterIssue, setFilterIssue] = useState("ALL");
  const [filterTags, setFilterTags] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [previewId, setPreviewId] = useState(null);
  const [detailDoc, setDetailDoc] = useState(null);
  const [detailForm, setDetailForm] = useState({
    title: "",
    description: "",
    authors: "",
    section: "",
    year: "",
    issueLabel: "",
    issueId: "",
    journalTitle: "",
    articleId: "",
    audience: "BOTH",
    tags: "",
    pageRange: "",
    pdf_start_page: "",
    pdf_end_page: ""
  });
  const [reindexingId, setReindexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState(null);
  const urlFormRef = useRef(null);
  const pdfFormRef = useRef(null);
  const articlesFormRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const resetMessage = useCallback(() => setMessage(null), []);
  const getAudienceLabel = useCallback(value => audienceLabels[value] || (value ? value : "-"), [audienceLabels]);
  const showError = useCallback(text => setMessage({
    type: "error",
    text
  }), []);
  const showOk = useCallback(text => setMessage({
    type: "success",
    text
  }), []);
  const resolveErrorText = useCallback((payload, fallbackKey) => resolveApiMessage({
    payload,
    t: key => tr(key),
    fallbackKey,
    fallbackText: tr(fallbackKey)
  }), [tr]);
  const fetchDocuments = useCallback(async () => {
    fetchAbortRef.current?.abort?.();
    const ac = new AbortController();
    fetchAbortRef.current = ac;
    setLoadingList(true);
    try {
      const res = await fetch("/api/rag/documents?limit=200", {
        cache: "no-store",
        signal: ac.signal
      });
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(tr("admin.rag.errors.invalid_documents_json"));
      }
      if (!res.ok) throw new Error(resolveErrorText(data, "admin.rag.errors.documents_load_failed"));
      const list = Array.isArray(data) ? data : Array.isArray(data?.documents) ? data.documents : Array.isArray(data?.docs) ? data.docs : [];
      setDocs(list);
    } catch (err) {
      if (err?.name !== "AbortError") showError(err?.message || tr("admin.rag.errors.documents_load_failed"));
    } finally {
      setLoadingList(false);
    }
  }, [resolveErrorText, showError, tr]);
  useEffect(() => {
    fetchDocuments();
    return () => fetchAbortRef.current?.abort?.();
  }, [fetchDocuments]);
  useEffect(() => {
    const hasWork = docs.some(d => {
      const st = deriveStatus(d);
      return st === "PENDING" || st === "PROCESSING";
    });
    if (!hasWork) return undefined;
    let timer = null;
    const start = () => {
      if (!document.hidden && !timer) {
        fetchDocuments();
        timer = setInterval(fetchDocuments, POLL_MS);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVis = () => {
      if (document.hidden) stop();else start();
    };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [docs, fetchDocuments]);
  const handlePdfMetaSubmit = useCallback(async event => {
    event.preventDefault();
    resetMessage();
    setPdfMetaResult(null);
    setMetaCheck(null);
    const form = event.currentTarget;
    const pdfFile = form.pdfWithMetaFile?.files?.[0];
    const metaFile = form.pdfMetaFile?.files?.[0];
    const metaText = form.pdfMetaText?.value?.trim();
    if (!pdfFile) {
      showError(tr("admin.rag.errors.pdf_required"));
      return;
    }
    if (!metaFile && !metaText) {
      showError(tr("admin.rag.errors.meta_required"));
      return;
    }
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("audience", pdfMetaAudience);
    if (metaFile) formData.append("metadata", metaFile);else if (metaText) formData.append("metadata_text", metaText);
    setPdfMetaBusy(true);
    try {
      const res = await fetch("/api/rag/ingest/pdf-with-metadata", {
        method: "POST",
        body: formData
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok || data?.ok === false) throw new Error(resolveErrorText(data, "admin.rag.errors.pdf_ingest_failed"));
      const docId = data?.docId || data?.docID || data?.doc?.docId || data?.doc?.id || data?.doc?.remoteId || null;
      const shortRef = data?.shortRef || data?.short_ref || null;
      if (shortRef) showOk(tr("admin.rag.success.added_with_ref", { ref: shortRef }));else if (docId) showOk(tr("admin.rag.success.pdf_ingest_with_doc_id", { docId }));else showOk(tr("admin.rag.success.pdf_ingest"));
      setPdfMetaResult({
        docId,
        fileName: data?.fileName,
        shortRef,
        pageRange: data?.pageRange || data?.page_range || null,
        inserted: data?.inserted
      });
      if (docId) setArticlesDocId(docId);
      setPdfMetaAudience("BOTH");
      form.reset();
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.pdf_ingest_failed"));
    } finally {
      setPdfMetaBusy(false);
    }
  }, [fetchDocuments, pdfMetaAudience, resetMessage, resolveErrorText, showError, showOk, tr]);
  const handleMetaCheck = useCallback(async () => {
    const form = pdfFormRef.current;
    if (!form) return;
    const metaFile = form.pdfMetaFile?.files?.[0];
    const metaText = form.pdfMetaText?.value?.trim();
    let raw = metaText;
    if (!raw && metaFile) {
      try {
        raw = await metaFile.text();
      } catch {
        raw = "";
      }
    }
    if (!raw) {
      setMetaCheck({
        type: "error",
        text: tr("admin.rag.errors.meta_required")
      });
      return;
    }
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setMetaCheck({
        type: "error",
        text: tr("admin.rag.errors.meta_json_invalid")
      });
      return;
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      setMetaCheck({
        type: "error",
        text: tr("admin.rag.errors.meta_json_must_be_object")
      });
      return;
    }
    const {
      missingRequired,
      missingRecommended
    } = validateMeta(parsed);
    if (!missingRequired.length && !missingRecommended.length) {
      setMetaCheck({
        type: "ok",
        text: tr("admin.rag.success.meta_looks_valid")
      });
      return;
    }
    const parts = [];
    if (missingRequired.length) parts.push(tr("admin.rag.meta.missing_required", {
      fields: missingRequired.join(", ")
    }));
    if (missingRecommended.length) parts.push(tr("admin.rag.meta.missing_recommended", {
      fields: missingRecommended.join(", ")
    }));
    setMetaCheck({
      type: "warn",
      text: parts.join(" | ")
    });
  }, [tr]);
  const handleUrlSubmit = useCallback(async event => {
    event.preventDefault();
    resetMessage();
    const form = event.currentTarget;
    const urlValue = form.url?.value?.trim();
    if (!urlValue) {
      showError(tr("admin.rag.errors.url_required"));
      return;
    }
    const payload = {
      url: urlValue,
      audience: urlAudience
    };
    const tagArr = splitTags(urlTags);
    if (tagArr.length) payload.tags = tagArr;
    if (urlTitle.trim()) payload.title = urlTitle.trim();
    if (urlDescription.trim()) payload.description = urlDescription.trim();
    setUrlBusy(true);
    try {
      const res = await fetch("/api/rag/ingest/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(resolveErrorText(data, "admin.rag.errors.url_ingest_failed"));
      showOk(tr("admin.rag.success.url_sent"));
      setUrlAudience("BOTH");
      setUrlTitle("");
      setUrlDescription("");
      setUrlTags("");
      form.reset();
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.url_ingest_failed"));
    } finally {
      setUrlBusy(false);
    }
  }, [fetchDocuments, resetMessage, resolveErrorText, showError, showOk, tr, urlAudience, urlDescription, urlTags, urlTitle]);
  const handleArticlesSubmit = useCallback(async event => {
    event.preventDefault();
    resetMessage();
    setArticlesResult(null);
    const form = event.currentTarget;
    const docIdInput = (articlesDocId || form.articlesDocId?.value || "").trim();
    const jsonFile = form.articlesJsonFile?.files?.[0];
    const jsonText = form.articlesJsonText?.value?.trim();
    let raw = jsonText || "";
    if (!raw && jsonFile) {
      try {
        raw = await jsonFile.text();
      } catch {
        raw = "";
      }
    }
    if (!raw) {
      showError(tr("admin.rag.errors.articles_json_required"));
      return;
    }
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      showError(tr("admin.rag.errors.articles_json_invalid"));
      return;
    }
    let payloadDocId = docIdInput;
    let articles = null;
    if (Array.isArray(parsed)) {
      articles = parsed;
    } else if (parsed && typeof parsed === "object") {
      if (!payloadDocId) payloadDocId = parsed.docId || parsed.doc_id || "";
      if (Array.isArray(parsed.articles)) articles = parsed.articles;
    }
    if (!payloadDocId) {
      showError(tr("admin.rag.errors.doc_id_required"));
      return;
    }
    if (!Array.isArray(articles) || !articles.length) {
      showError(tr("admin.rag.errors.articles_array_required"));
      return;
    }
    const invalid = articles.find(a => {
      if (!a || typeof a !== "object") return true;
      if (!a.title) return true;
      const hasRange = Boolean(a.pageRange) || Number.isFinite(a.startPage) && Number.isFinite(a.endPage);
      return !hasRange;
    });
    if (invalid) {
      showError(tr("admin.rag.errors.article_item_invalid"));
      return;
    }
    const payload = {
      docId: payloadDocId,
      articles
    };
    setArticlesBusy(true);
    try {
      const res = await fetch("/api/rag/ingest/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const rawRes = await res.text();
      const data = rawRes ? JSON.parse(rawRes) : {};
      if (!res.ok || data?.ok === false) throw new Error(resolveErrorText(data, "admin.rag.errors.articles_ingest_failed"));
      showOk(tr("admin.rag.success.articles_added_with_doc_id", {
        docId: payloadDocId
      }));
      setArticlesResult({
        docId: payloadDocId,
        count: data?.count ?? null,
        inserted: Array.isArray(data?.inserted) ? data.inserted : []
      });
      setArticlesJson("");
      form.reset();
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.articles_ingest_failed"));
    } finally {
      setArticlesBusy(false);
    }
  }, [articlesDocId, fetchDocuments, resetMessage, resolveErrorText, showError, showOk, tr]);
  const handleReindex = useCallback(async docId => {
    resetMessage();
    setReindexingId(docId);
    try {
      const res = await fetch(`/api/rag/documents/${docId}/reindex`, {
        method: "POST"
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(resolveErrorText(data, "admin.rag.errors.reindex_failed"));
      showOk(tr("admin.rag.success.reindex_started"));
      setDocs(prev => prev.map(doc => doc.id === docId ? {
        ...doc,
        ...data.doc
      } : doc));
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.reindex_failed"));
    } finally {
      setReindexingId(null);
    }
  }, [fetchDocuments, resetMessage, resolveErrorText, showError, showOk, tr]);
  const handleBulkReindex = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    for (const id of ids) {
      await handleReindex(id);
    }
  }, [selectedIds, handleReindex]);
  const handleDelete = useCallback(docId => {
    resetMessage();
    if (!docId || deletingId) return;
    setDeleteConfirmDocId(docId);
  }, [deletingId, resetMessage]);
  const closeDeleteConfirm = useCallback(() => {
    if (deletingId) return;
    setDeleteConfirmDocId(null);
  }, [deletingId]);
  const confirmDelete = useCallback(async () => {
    const docId = deleteConfirmDocId;
    if (!docId) return;
    resetMessage();
    setDeletingId(docId);
    try {
      const res = await fetch(`/api/rag/documents/${docId}`, {
        method: "DELETE"
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(resolveErrorText(data, "admin.rag.errors.delete_failed"));
      showOk(tr("admin.rag.success.document_deleted"));
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.delete_failed"));
    } finally {
      setDeletingId(null);
      setDeleteConfirmDocId(null);
    }
  }, [deleteConfirmDocId, resetMessage, resolveErrorText, showError, showOk, tr]);
  const normalizedDocs = useMemo(() => docs.map((d, i) => ({
    ...normalizeDoc(d),
    _idx: i
  })), [docs]);
  const sectionOptions = useMemo(() => Array.from(new Set(normalizedDocs.map(d => d.section).filter(Boolean))).sort(), [normalizedDocs]);
  const audienceOptions = useMemo(() => Array.from(new Set(normalizedDocs.map(d => d.audience).filter(Boolean))), [normalizedDocs]);
  const yearOptions = useMemo(() => Array.from(new Set(normalizedDocs.map(d => String(d.year || "").trim()).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [normalizedDocs]);
  const issueOptions = useMemo(() => Array.from(new Set(normalizedDocs.map(d => d.issueLabel).filter(Boolean))).sort(), [normalizedDocs]);
  const allTags = useMemo(() => Array.from(new Set(normalizedDocs.flatMap(d => d.tags || []))).filter(Boolean).sort((a, b) => a.localeCompare(b)), [normalizedDocs]);
  const topTags = useMemo(() => {
    const counts = new Map();
    normalizedDocs.forEach(doc => {
      (doc.tags || []).forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([tag]) => tag);
  }, [normalizedDocs]);
  const activeMetaTemplate = useMemo(() => {
    const found = metaTemplates.find(template => template.key === activeMetaTemplateKey);
    return found || metaTemplates[0];
  }, [activeMetaTemplateKey, metaTemplates]);
  useEffect(() => {
    let cancelled = false;
    const loadTemplate = async () => {
      const file = activeMetaTemplate?.file;
      if (!file) {
        setActiveMetaTemplateContent("");
        return;
      }
      try {
        const response = await fetch(file, { cache: "no-store" });
        const text = await response.text();
        if (cancelled) return;
        setActiveMetaTemplateContent(text || "");
      } catch {
        if (cancelled) return;
        setActiveMetaTemplateContent("");
      }
    };
    loadTemplate();
    return () => {
      cancelled = true;
    };
  }, [activeMetaTemplate]);
  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tagSet = new Set(filterTags);
    const list = normalizedDocs.filter(doc => {
      if (filterSection !== "ALL" && doc.section !== filterSection) return false;
      if (filterAudience !== "ALL" && doc.audience !== filterAudience) return false;
      if (filterYear !== "ALL" && String(doc.year || "") !== filterYear) return false;
      if (filterIssue !== "ALL" && doc.issueLabel !== filterIssue) return false;
      if (tagSet.size) {
        const docTags = doc.tags || [];
        for (const t of tagSet) {
          if (!docTags.includes(t)) return false;
        }
      }
      if (!q) return true;
      const haystack = [doc.title, doc.description, doc.section, doc.issueLabel, doc.issueId, doc.year, doc.docId, doc.articleId, doc.journalTitle, doc.language, doc.source_path, doc.source_url, doc.url, (doc.authors || []).join(" "), (doc.tags || []).join(" ")].filter(Boolean).join(" | ").toLowerCase();
      return haystack.includes(q);
    });
    return list.sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "section") return (a.section || "").localeCompare(b.section || "");
      if (sortBy === "year") return String(b.year || "").localeCompare(String(a.year || ""));
      if (sortBy === "issue") return (a.issueLabel || "").localeCompare(b.issueLabel || "");
      const aDate = deriveSyncedAt(a);
      const bDate = deriveSyncedAt(b);
      return new Date(bDate || 0) - new Date(aDate || 0);
    });
  }, [normalizedDocs, searchQuery, filterSection, filterAudience, filterYear, filterIssue, filterTags, sortBy]);
  const filteredCount = filteredDocs.length;
  const docMetrics = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let failed = 0;
    let completed = 0;
    normalizedDocs.forEach(doc => {
      const status = deriveStatus(doc);
      if (status === "PENDING") pending += 1;else if (status === "PROCESSING") processing += 1;else if (status === "FAILED") failed += 1;else completed += 1;
    });
    return {
      total: normalizedDocs.length,
      filtered: filteredCount,
      pending,
      processing,
      failed,
      completed,
      selected: selectedIds.size
    };
  }, [normalizedDocs, filteredCount, selectedIds.size]);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filterSection, filterAudience, filterYear, filterIssue, filterTags, sortBy]);
  const visibleDocs = filteredDocs.slice(0, visibleCount);
  const previewDoc = useMemo(() => previewId ? visibleDocs.find(doc => doc.id === previewId) || null : visibleDocs[0] || null, [previewId, visibleDocs]);
  useEffect(() => {
    if (!visibleDocs.length) {
      if (previewId !== null) setPreviewId(null);
      return;
    }
    if (!previewId || !visibleDocs.some(doc => doc.id === previewId)) {
      setPreviewId(visibleDocs[0].id);
    }
  }, [visibleDocs, previewId]);
  const toggleSelect = useCallback(id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  }, []);
  const toggleFilterTag = useCallback(tag => {
    setFilterTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      return [...prev, tag];
    });
  }, []);
  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const ids = visibleDocs.map(d => d.id).filter(Boolean);
      const allOn = ids.every(id => next.has(id));
      if (allOn) ids.forEach(id => next.delete(id));else ids.forEach(id => next.add(id));
      return next;
    });
  }, [visibleDocs]);
  const openDetail = useCallback(doc => {
    if (!doc) return;
    setDetailDoc(doc);
    setDetailForm({
      title: doc.title || "",
      description: doc.description || "",
      authors: (doc.authors || []).join(", "),
      section: doc.section || "",
      year: doc.year ? String(doc.year) : "",
      issueLabel: doc.issueLabel || "",
      issueId: doc.issueId || "",
      journalTitle: doc.journalTitle || "",
      articleId: doc.articleId || "",
      audience: doc.audience || "BOTH",
      tags: (doc.tags || []).join(", "),
      pageRange: doc.pageRange || "",
      pdf_start_page: doc.pdf_start_page ? String(doc.pdf_start_page) : "",
      pdf_end_page: doc.pdf_end_page ? String(doc.pdf_end_page) : ""
    });
  }, []);
  const closeDetail = useCallback(() => setDetailDoc(null), []);
  const saveDetail = useCallback(async () => {
    if (!detailDoc) return;
    resetMessage();
    const payload = {
      title: detailForm.title?.trim() || null,
      description: detailForm.description?.trim() || null,
      authors: splitAuthors(detailForm.authors),
      tags: splitTags(detailForm.tags),
      section: detailForm.section?.trim() || null,
      issueId: detailForm.issueId?.trim() || null,
      issueLabel: detailForm.issueLabel?.trim() || null,
      articleId: detailForm.articleId?.trim() || null,
      audience: detailForm.audience || null,
      pageRange: detailForm.pageRange?.trim() || null,
      journalTitle: detailForm.journalTitle?.trim() || null
    };
    const y = detailForm.year?.trim();
    if (y) payload.year = Number.isNaN(Number(y)) ? y : Number(y);
    const sPage = detailForm.pdf_start_page?.trim();
    const ePage = detailForm.pdf_end_page?.trim();
    if (sPage) payload.pdf_start_page = Number(sPage);
    if (ePage) payload.pdf_end_page = Number(ePage);
    try {
      const res = await fetch(`/api/rag/documents/${detailDoc.id}/update-meta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok || data?.ok === false) throw new Error(resolveErrorText(data, "admin.rag.errors.meta_update_failed"));
      showOk(tr("admin.rag.success.meta_saved"));
      setDocs(prev => prev.map(d => d.id === detailDoc.id ? {
        ...d,
        ...payload,
        metadata: {
          ...(d.metadata || {}),
          ...payload
        }
      } : d));
      closeDetail();
      await fetchDocuments();
    } catch (err) {
      showError(err?.message || tr("admin.rag.errors.meta_update_failed"));
    }
  }, [closeDetail, detailDoc, detailForm, fetchDocuments, resetMessage, resolveErrorText, showError, showOk, tr]);
  const handleSelftest = useCallback(async () => {
    if (selftestBusy) return;
    setSelftestBusy(true);
    setSelftestSteps(null);
    resetMessage();
    try {
      const res = await fetch("/api/rag/selftest", {
        method: "POST",
        cache: "no-store"
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok || data?.ok === false) throw new Error(resolveErrorText(data, "admin.rag.errors.selftest_failed"));
      setSelftestSteps(Array.isArray(data?.steps) ? data.steps : []);
      setMessage({
        type: "success",
        text: tr("admin.rag.success.selftest_finished")
      });
      await fetchDocuments();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || tr("admin.rag.errors.selftest_aborted")
      });
    } finally {
      setSelftestBusy(false);
    }
  }, [fetchDocuments, resetMessage, resolveErrorText, selftestBusy, tr]);
  const renderTags = arr => {
    if (!arr || !arr.length) return <span className="text-[color:var(--admin-muted)]">-</span>;
    const visible = arr.slice(0, 4);
    const extra = arr.length - visible.length;
    return <div className={tagsWrapClassName}>
        {visible.map(t => <span className={`${badgeBaseClassName} ${badgeGhostClassName}`} key={t}>
            {t}
          </span>)}
        {extra > 0 ? <span className={`${badgeBaseClassName} ${badgeGhostClassName}`}>+{extra}</span> : null}
      </div>;
  };
  const viewSource = doc => {
    const href = doc?.source_path || doc?.source_url || doc?.url;
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const hasIngestAside = Boolean(showMetaGuide || Array.isArray(selftestSteps) && selftestSteps.length);
  return <div className={rootClassName} style={rootInputVars}>
      {message && <div className={`${alertBaseClassName} ${message.type === "error" ? alertErrorClassName : alertOkClassName}`} onClick={resetMessage}>
          {message.text}
        </div>}

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
        <div className={cardHeadClassName}>
          <div>
            <CardTitle>{tr("admin.rag.ingest.title")}</CardTitle>
            <div className={cardSubClassName}>
              {tr("admin.rag.ingest.subtitle")}
            </div>
          </div>
          <div className={cardActionsClassName}>

            <Button size="sm" variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName} ${buttonCompactClassName}`} onClick={handleSelftest} disabled={selftestBusy}>
              {selftestBusy ? tr("admin.rag.selftest.running") : tr("admin.rag.selftest.run")}
            </Button>
            <Button size="sm" variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`} onClick={fetchDocuments} disabled={loadingList}>
              {loadingList ? tr("admin.common.loading") : tr("admin.common.refresh")}
            </Button>
          </div>
        </div>
        <div className={`${ingestMainGridClassName}${hasIngestAside ? " xl:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]" : ""}`}>
          <div className={ingestSupportStackClassName}>
            <div className={ingestGridClassName}>
              <form className={panelStackClassName} onSubmit={handleUrlSubmit} ref={urlFormRef}>
                <label className={labelClassName}>{tr("admin.rag.ingest.url_section_title")}</label>
                <Input name="url" placeholder="https://" size="sm" className={inputClassName} />
                <Input value={urlTitle} onChange={e => setUrlTitle(e.target.value)} placeholder={tr("admin.rag.ingest.url_title_placeholder")} size="sm" className={inputClassName} />
                <Textarea value={urlDescription} onChange={e => setUrlDescription(e.target.value)} placeholder={tr("admin.rag.ingest.url_description_placeholder")} rows={2} size="sm" className={inputClassName} />
                <Input value={urlTags} onChange={e => setUrlTags(e.target.value)} placeholder={tr("admin.rag.ingest.url_tags_placeholder")} size="sm" className={inputClassName} />
                <select value={urlAudience} onChange={e => setUrlAudience(e.target.value)} className={compactSelectClassName}>
                  {audienceSelectOptions.map(o => <option key={o.value} value={o.value}>
                      {o.label}
                    </option>)}
                </select>
                <Button size="sm" type="submit" variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName} self-start`} disabled={urlBusy}>
                  {urlBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.ingest.send_url")}
                </Button>
              </form>

              <form className={panelStackClassName} onSubmit={handlePdfMetaSubmit} ref={pdfFormRef}>
                <label className={labelClassName}>{tr("admin.rag.ingest.pdf_section_title")}</label>
                <div className={formNoteClassName}>
                  {tr("admin.rag.ingest.pdf_section_note")}
                </div>
                <input name="pdfWithMetaFile" type="file" accept="application/pdf" className={selectClassName} />
                <input name="pdfMetaFile" type="file" accept="application/json" className={selectClassName} />
                <Textarea name="pdfMetaText" placeholder={tr("admin.rag.ingest.pdf_meta_text_placeholder")} rows={3} size="sm" className={inputClassName} />
                <select value={pdfMetaAudience} onChange={e => setPdfMetaAudience(e.target.value)} className={compactSelectClassName}>
                  {audienceSelectOptions.map(o => <option key={o.value} value={o.value}>
                      {o.label}
                    </option>)}
                </select>
                <div className={metaActionsClassName}>
                  <Button size="sm" type="button" variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`} onClick={() => setShowMetaGuide(s => !s)} aria-expanded={showMetaGuide} aria-controls="rag-meta-panel">
                    {showMetaGuide ? tr("admin.rag.meta.hide_templates") : tr("admin.rag.meta.open_templates")}
                  </Button>
                  <Button size="sm" type="button" variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`} onClick={handleMetaCheck}>
                    {tr("admin.rag.meta.check_json")}
                  </Button>
                  <Button size="sm" type="submit" variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`} disabled={pdfMetaBusy}>
                    {pdfMetaBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.ingest.send_pdf_with_meta")}
                  </Button>
                </div>
                {metaCheck ? <div className={`${metaCheckBaseClassName} ${metaCheck.type === "ok" ? metaCheckOkClassName : metaCheck.type === "warn" ? metaCheckWarnClassName : metaCheckErrorClassName}`}>
                    {metaCheck.text}
                  </div> : null}
                {pdfMetaResult ? <div className="text-[0.95rem] text-[color:var(--admin-muted)]">
                    {pdfMetaResult.fileName ? pdfMetaResult.fileName + ": " : ""}
                    {pdfMetaResult.shortRef || pdfMetaResult.docId || tr("admin.rag.common.saved")}
                  </div> : null}
              </form>
            </div>

            <div className={articlesClassName}>
              <div className={articlesHeadClassName}>
                <div>
                  <div className={articlesTitleClassName}>
                    {tr("admin.rag.articles.title")}
                  </div>
                  <div className={articlesNoteClassName}>
                    {tr("admin.rag.articles.subtitle")}
                  </div>
                </div>
                <Button as="a" variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName}`} href="/rag-meta-templates/articles.json" target="_blank" rel="noopener noreferrer" download>
                  {tr("admin.rag.articles.open_template")}
                </Button>
              </div>
              <form className={articlesFormClassName} onSubmit={handleArticlesSubmit} ref={articlesFormRef}>
                <Input name="articlesDocId" value={articlesDocId} onChange={e => setArticlesDocId(e.target.value)} placeholder={tr("admin.rag.articles.doc_id_placeholder")} size="sm" className={inputClassName} />
                <input name="articlesJsonFile" type="file" accept="application/json" className={selectClassName} />
                <Textarea name="articlesJsonText" value={articlesJson} onChange={e => setArticlesJson(e.target.value)} placeholder={tr("admin.rag.articles.json_placeholder")} rows={5} size="sm" className={inputClassName} />
                <div className={articlesActionsClassName}>
                  <Button type="submit" variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName}`} disabled={articlesBusy}>
                    {articlesBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.articles.send")}
                  </Button>
                </div>
                {articlesResult ? <div className={articlesResultClassName}>
                    {articlesResult.count != null ? tr("admin.rag.articles.added_count", { count: articlesResult.count }) : tr("admin.rag.articles.added")}
                    {articlesResult.docId ? ` docId: ${articlesResult.docId}` : ""}
                    {articlesResult.inserted?.length ? <ul className={articlesListClassName}>
                        {articlesResult.inserted.slice(0, 4).map((item, idx) => <li key={`${item.title || "article"}-${idx}`}>
                            {(item.title || tr("admin.rag.articles.default_article")) + (item.startPage && item.endPage ? tr("admin.rag.articles.page_range", {
                        start: item.startPage,
                        end: item.endPage
                      }) : "")}
                          </li>)}
                      </ul> : null}
                  </div> : null}
              </form>
            </div>
          </div>

          <div className={ingestSupportStackClassName}>
            {Array.isArray(selftestSteps) && selftestSteps.length ? <div className={panelStackClassName}>
                <CardTitle>{tr("admin.rag.selftest.results_title")}</CardTitle>
                <ul className="m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]">
                  {selftestSteps.map((s, i) => <li key={i} className={s.ok ? "text-[color:var(--admin-success)]" : "text-[color:var(--admin-danger)]"}>
                      {s.label || s.step || s.id}: {s.ok ? tr("admin.rag.common.ok") : tr("admin.rag.common.failed")}
                    </li>)}
                </ul>
              </div> : null}

            {showMetaGuide ? <div className={metaPanelClassName} id="rag-meta-panel">
                <div className={metaPanelHeadClassName}>
                  <div>
                    <div className={metaPanelTitleClassName}>{tr("admin.rag.meta.templates_title")}</div>
                    <div className={metaPanelNoteClassName}>
                      {tr("admin.rag.meta.templates_note")}
                    </div>
                  </div>
                  {activeMetaTemplate ? <a className={metaPanelLinkClassName} href={activeMetaTemplate.file} target="_blank" rel="noopener noreferrer" download>
                      {tr("admin.rag.meta.open_json")}
                    </a> : null}
                </div>
                <div className={metaPanelGridClassName}>
                  <div>
                    <div className={metaPanelLabelClassName}>{tr("admin.rag.meta.important")}</div>
                    <ul className={metaPanelListClassName}>
                      <li>{tr("admin.rag.meta.important_line_1")}</li>
                      <li>{tr("admin.rag.meta.important_line_2")}</li>
                    </ul>
                  </div>
                  <div>
                    <div className={metaPanelLabelClassName}>{tr("admin.rag.meta.recommended")}</div>
                    <ul className={metaPanelListClassName}>
                      <li>{tr("admin.rag.meta.recommended_line_1")}</li>
                      <li>{tr("admin.rag.meta.recommended_line_2")}</li>
                      <li>{tr("admin.rag.meta.page_range_or_pdf_pages")}</li>
                      <li>{tr("admin.rag.meta.recommended_line_4")}</li>
                    </ul>
                  </div>
                </div>
                <div className={metaTabsClassName}>
                  {metaTemplates.map(t => <button type="button" key={t.key} className={`${metaTabClassName}${activeMetaTemplate?.key === t.key ? " " + metaTabActiveClassName : ""}`} onClick={() => setActiveMetaTemplateKey(t.key)}>
                      {t.label}
                    </button>)}
                </div>
                <pre className={codeBlockClassName}>{activeMetaTemplateContent || ""}</pre>
              </div> : null}
          </div>
        </div>
        </div>
      </div>
      <div className={cardClassName}>
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
        <div className={hintClassName}>
          <div className={hintTitleClassName}>{tr("admin.rag.documents.quick_find_title")}</div>
          <div className={hintBodyClassName}>
            {tr("admin.rag.documents.quick_find_body")}
          </div>
        </div>
        {topTags.length ? <div className={quickTagsClassName}>
            <span className={quickTagsLabelClassName}>{tr("admin.rag.documents.quick_tags")}</span>
            {topTags.map(tag => <button type="button" className={`${tagChipBaseClassName}${filterTags.includes(tag) ? " " + tagChipActiveClassName : ""}`} onClick={() => toggleFilterTag(tag)} key={tag}>
                {tag}
              </button>)}
          </div> : null}
        <div className={toolbarPrimaryClassName}>
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tr("admin.rag.documents.search_placeholder")} size="sm" className={inputClassName} />
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className={selectClassName}>
            <option value="ALL">{tr("admin.rag.documents.filters.all_sections")}</option>
            {sectionOptions.map(s => <option key={s} value={s}>
                {s}
              </option>)}
          </select>
          <select value={filterAudience} onChange={e => setFilterAudience(e.target.value)} className={selectClassName}>
            <option value="ALL">{tr("admin.rag.documents.filters.all_audiences")}</option>
            {audienceOptions.map(s => <option key={s} value={s}>
                {getAudienceLabel(s)}
              </option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={selectClassName}>
            <option value="ALL">{tr("admin.rag.documents.filters.all_years")}</option>
            {yearOptions.map(s => <option key={s} value={s}>
                {s}
              </option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClassName}>
            <option value="recent">{tr("admin.rag.documents.sort.recent")}</option>
            <option value="title">{tr("admin.rag.documents.sort.title")}</option>
            <option value="section">{tr("admin.rag.documents.sort.section")}</option>
            <option value="year">{tr("admin.rag.documents.sort.year")}</option>
            <option value="issue">{tr("admin.rag.documents.sort.issue")}</option>
          </select>
        </div>
        <div className={toolbarSecondaryClassName}>
          <select value={filterIssue} onChange={e => setFilterIssue(e.target.value)} className={selectClassName}>
            <option value="ALL">{tr("admin.rag.documents.filters.all_issues")}</option>
            {issueOptions.map(s => <option key={s} value={s}>
                {s}
              </option>)}
          </select>
          <select multiple value={filterTags} onChange={e => setFilterTags(Array.from(e.target.selectedOptions, o => o.value))} className={selectClassName} size={Math.min(6, Math.max(2, allTags.length)) || 2}>
            {allTags.map(t => <option key={t} value={t}>
                {t}
              </option>)}
          </select>
          {selectedIds.size ? <Button variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName}`} onClick={handleBulkReindex} disabled={reindexingId !== null}>
              {tr("admin.rag.documents.reindex_selected", { count: selectedIds.size })}
            </Button> : null}
        </div>

        <div className={docsClassName}>
          <div className={docHeadClassName}>
            <label className={docCheckClassName}>
              <input type="checkbox" className="accent-[color:var(--admin-accent)]" onChange={toggleSelectAllVisible} checked={visibleDocs.length && visibleDocs.every(d => selectedIds.has(d.id))} />
              <span>{tr("admin.rag.documents.select_visible")}</span>
            </label>
            <div className={docSummaryClassName}>
              <span>{tr("admin.rag.documents.total", { total: docMetrics.total })}</span>
              <span className={docSummaryDotClassName} aria-hidden="true">
                |
              </span>
              <span>{tr("admin.rag.documents.filtered", { count: filteredCount })}</span>
              <span className={docSummaryDotClassName} aria-hidden="true">
                |
              </span>
              <span>{tr("admin.rag.documents.showing", { count: visibleDocs.length })}</span>
              {selectedIds.size ? <span className={docSummarySelectedClassName}>
                  {tr("admin.rag.documents.selected", { count: selectedIds.size })}
                </span> : null}
            </div>
          </div>

          <div className={docsLayoutClassName}>
            <div className={docsListClassName}>
              {visibleDocs.map(doc => {
              const status = deriveStatus(doc);
              const syncedAt = deriveSyncedAt(doc);
              const isSelected = selectedIds.has(doc.id);
              const isActive = doc.id === previewId;
              return <div key={doc.id || doc._idx} className={`${docItemBaseClassName}${isActive ? " " + docItemActiveClassName : ""}`} role="button" tabIndex={0} aria-pressed={isActive} onClick={() => setPreviewId(doc.id)} onKeyDown={e => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPreviewId(doc.id);
                }
              }}>
                    <div className={docSelectClassName} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="accent-[color:var(--admin-accent)]" checked={isSelected} onChange={() => toggleSelect(doc.id)} />
                    </div>
                    <div className={docItemMainClassName}>
                      <div className={docItemTitleClassName}>
                        {doc.title || tr("admin.rag.documents.untitled")}
                      </div>
                      <div className={docItemMetaClassName}>
                        <span className={STATUS_CLASSES[status] || badgeBaseClassName}>
                          {statusLabels[status] || status}
                        </span>
                        {doc.section ? <span className={docItemMetaPillClassName}>{doc.section}</span> : null}
                        {doc.year ? <span className={docItemMetaPillClassName}>{doc.year}</span> : null}
                        {doc.issueLabel ? <span className={docItemMetaPillClassName}>{tr("admin.rag.documents.issue_label", { issue: doc.issueLabel })}</span> : null}
                      </div>
                    </div>
                    {syncedAt ? <div className={docItemTimeClassName}>
                        {formatDateTime(syncedAt, localeTag)}
                      </div> : null}
                  </div>;
            })}
              {!visibleDocs.length ? <div className={docsEmptyClassName}>
                  {loadingList ? tr("admin.common.loading_data") : tr("admin.rag.documents.no_results")}
                </div> : null}
            </div>
            <div className={docDetailWrapperClassName}>
              {previewDoc ? (() => {
              const status = deriveStatus(previewDoc);
              const syncedAt = deriveSyncedAt(previewDoc);
              const pageLabel = previewDoc.pageRange || formatPdfRange(previewDoc) || "-";
              const source = previewDoc.source_path || previewDoc.source_url || previewDoc.url || "";
              const typeLabel = (previewDoc.source_type || previewDoc.type || "").toString().toUpperCase();
              return <div className={docDetailClassName}>
                      <div className={docDetailTopClassName}>
                        <div>
                          <div className={docDetailTitleClassName}>
                            {previewDoc.title || tr("admin.rag.documents.untitled")}
                          </div>
                          {previewDoc.description ? <div className={docDetailDescClassName}>
                              {previewDoc.description}
                            </div> : null}
                        </div>
                        <div className={docDetailStatusClassName}>
                          <span className={STATUS_CLASSES[status] || badgeBaseClassName}>
                            {statusLabels[status] || status}
                          </span>
                          {syncedAt ? <span className={docDetailTimeClassName}>
                              {formatDateTime(syncedAt, localeTag)}
                            </span> : null}
                        </div>
                      </div>
                      <div className={docDetailMetaClassName}>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.section")}
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {previewDoc.section || "-"}
                          </span>
                        </div>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.authors")}
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {(previewDoc.authors || []).join(", ") || "-"}
                          </span>
                        </div>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.year_issue")}
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {previewDoc.year || "-"}
                            {previewDoc.issueLabel ? ` / ${previewDoc.issueLabel}` : ""}
                          </span>
                        </div>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.audience")}
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {getAudienceLabel(previewDoc.audience)}
                          </span>
                        </div>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.page")}
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {pageLabel}
                          </span>
                        </div>
                        <div className={docDetailMetaItemClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            DocId
                          </span>
                          <span className={docDetailMetaValueClassName}>
                            {previewDoc.docId || previewDoc.id || "-"}
                          </span>
                        </div>
                        {previewDoc.journalTitle ? <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>
                              {tr("admin.rag.details.issue")}
                            </span>
                            <span className={docDetailMetaValueClassName}>
                              {previewDoc.journalTitle}
                            </span>
                          </div> : null}
                        {previewDoc.language ? <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>
                              {tr("admin.rag.details.language")}
                            </span>
                            <span className={docDetailMetaValueClassName}>
                              {previewDoc.language}
                            </span>
                          </div> : null}
                        {typeLabel ? <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>
                              {tr("admin.rag.details.type")}
                            </span>
                            <span className={docDetailMetaValueClassName}>
                              {typeLabel}
                            </span>
                          </div> : null}
                        {previewDoc.articleId ? <div className={docDetailMetaItemClassName}>
                            <span className={docDetailMetaLabelClassName}>
                              ArticleId
                            </span>
                            <span className={docDetailMetaValueClassName}>
                              {previewDoc.articleId}
                            </span>
                          </div> : null}
                      </div>
                      <div className={docDetailTagsClassName}>
                        <span className={docDetailMetaLabelClassName}>
                          {tr("admin.rag.details.tags")}
                        </span>
                        {renderTags(previewDoc.tags)}
                      </div>
                      {source ? <div className={docDetailSourceClassName}>
                          <span className={docDetailMetaLabelClassName}>
                            {tr("admin.rag.details.source")}
                          </span>
                          <span className={docDetailSourceTextClassName}>
                            {source}
                          </span>
                        </div> : null}
                      <div className={docDetailActionsClassName}>
                        <Button variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`} onClick={() => openDetail(previewDoc)}>
                          {tr("admin.rag.actions.edit")}
                        </Button>
                        <Button variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`} onClick={() => handleReindex(previewDoc.id)} disabled={reindexingId === previewDoc.id}>
                          {reindexingId === previewDoc.id ? tr("admin.rag.actions.reindexing") : tr("admin.rag.actions.reindex")}
                        </Button>
                        <Button variant="danger" className={`${buttonBaseClassName} ${buttonDangerClassName} ${buttonCompactClassName}`} onClick={() => handleDelete(previewDoc.id)} disabled={deletingId === previewDoc.id}>
                          {deletingId === previewDoc.id ? tr("admin.rag.actions.deleting") : tr("admin.rag.actions.delete")}
                        </Button>
                        <Button variant="ghost" className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`} onClick={() => viewSource(previewDoc)} disabled={!previewDoc.source_path && !previewDoc.url}>
                          {tr("admin.rag.actions.view")}
                        </Button>
                      </div>
                    </div>;
            })() : <div className={docDetailEmptyClassName}>
                  {tr("admin.rag.details.select_material")}
                </div>}
            </div>
          </div>
        </div>

        {visibleCount < filteredDocs.length ? <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName}`} onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
              {tr("admin.rag.documents.load_more")}{" "}
              {Math.min(PAGE_SIZE, filteredDocs.length - visibleCount)}
            </Button>
          </div> : null}
        </div>
      </div>

      {deleteConfirmDocId ? <ModalConfirm message={tr("admin.rag.confirm.delete_doc")} confirmLabel={tr("admin.rag.actions.delete")} cancelLabel={tr("admin.rag.actions.cancel")} onConfirm={confirmDelete} onCancel={closeDeleteConfirm} disabled={deletingId === deleteConfirmDocId} busy={deletingId === deleteConfirmDocId} busyLabel={tr("admin.rag.actions.deleting")} /> : null}

      {detailDoc ? <Modal open={true} variant="glass" onClose={closeDetail} closeOnOverlayClick>
          <div className={modalBodyClassName}>
            <div className={ragModalHeadClassName}>
              <div>
                <CardTitle>{tr("admin.rag.modal.edit_meta")}</CardTitle>
                <div className="text-[0.95rem] text-[color:var(--admin-muted)]">{detailDoc.title || tr("admin.rag.documents.untitled")}</div>
              </div>
              <Button variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName}`} onClick={closeDetail}>
                {tr("admin.rag.actions.close")}
              </Button>
            </div>
            <div className={panelStackClassName}>
              <Input value={detailForm.title} onChange={e => setDetailForm(f => ({
            ...f,
            title: e.target.value
          }))} className={inputClassName} size="sm" />
              <Textarea value={detailForm.description} onChange={e => setDetailForm(f => ({
            ...f,
            description: e.target.value
          }))} className={inputClassName} size="sm" rows={3} />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
                <Input value={detailForm.authors} onChange={e => setDetailForm(f => ({
              ...f,
              authors: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.tags} onChange={e => setDetailForm(f => ({
              ...f,
              tags: e.target.value
            }))} className={inputClassName} size="sm" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                <Input value={detailForm.section} onChange={e => setDetailForm(f => ({
              ...f,
              section: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.issueLabel} onChange={e => setDetailForm(f => ({
              ...f,
              issueLabel: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.year} onChange={e => setDetailForm(f => ({
              ...f,
              year: e.target.value
            }))} className={inputClassName} size="sm" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                <Input value={detailForm.issueId} onChange={e => setDetailForm(f => ({
              ...f,
              issueId: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.journalTitle} onChange={e => setDetailForm(f => ({
              ...f,
              journalTitle: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.articleId} onChange={e => setDetailForm(f => ({
              ...f,
              articleId: e.target.value
            }))} className={inputClassName} size="sm" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                <select value={detailForm.audience} onChange={e => setDetailForm(f => ({
              ...f,
              audience: e.target.value
            }))} className={selectClassName}>
                  {audienceSelectOptions.map(o => <option key={o.value} value={o.value}>
                      {o.label}
                    </option>)}
                </select>
                <Input value={detailForm.pageRange} onChange={e => setDetailForm(f => ({
              ...f,
              pageRange: e.target.value
            }))} className={inputClassName} size="sm" />
                <Input value={detailForm.pdf_start_page} onChange={e => setDetailForm(f => ({
              ...f,
              pdf_start_page: e.target.value
            }))} className={inputClassName} size="sm" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                <Input value={detailForm.pdf_end_page} onChange={e => setDetailForm(f => ({
              ...f,
              pdf_end_page: e.target.value
            }))} className={inputClassName} size="sm" />
                <div className={readOnlyFieldClassName}>
                  {tr("admin.rag.modal.doc_id")}: {detailDoc.docId || "-"}
                </div>
                <div className={readOnlyFieldClassName}>
                  {tr("admin.rag.modal.type")}: {detailDoc.source_type || detailDoc.type || "-"}
                </div>
                <div className={readOnlyFieldClassName}>
                  {tr("admin.rag.modal.language")}: {detailDoc.language || "-"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName}`} onClick={saveDetail}>
                  {tr("admin.rag.actions.save")}
                </Button>
                <Button variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName}`} onClick={closeDetail}>
                  {tr("admin.rag.actions.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </Modal> : null}
    </div>;
}





















