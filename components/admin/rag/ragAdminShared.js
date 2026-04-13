"use client";

export const STATUS_LABEL_KEYS = {
  PENDING: "admin.rag.status.pending",
  PROCESSING: "admin.rag.status.processing",
  COMPLETED: "admin.rag.status.completed",
  FAILED: "admin.rag.status.failed"
};

export const rootClassName =
  "flex flex-col gap-1.5 text-[color:var(--admin-text)] " +
  "[--admin-text:var(--documents-page-text)] [--admin-muted:var(--documents-page-muted)] [--admin-surface:var(--documents-card-bg)] " +
  "[--admin-surface-2:var(--documents-subpanel-bg)] [--admin-surface-3:var(--documents-content-bg)] [--admin-border:var(--documents-card-border)] " +
  "[--admin-border-strong:var(--documents-subpanel-border)] [--admin-shadow-soft:var(--documents-soft-shadow)] [--admin-shadow:var(--documents-strong-shadow)] " +
  "[--admin-accent:var(--documents-accent)] [--admin-accent-soft:var(--documents-accent-soft)] [--admin-accent-cool:var(--documents-accent)] " +
  "[--admin-success:var(--documents-success-text)] [--admin-danger:var(--documents-error-text)] [--rag-text:var(--admin-text)] [--rag-muted:var(--admin-muted)]";

export const rootInputVars = {
  "--input-bg": "var(--documents-content-bg)",
  "--input-bg-hover": "var(--documents-content-bg)",
  "--input-bg-focus": "var(--documents-content-bg)",
  "--input-border": "1px solid var(--admin-border-strong)",
  "--input-text": "var(--admin-text)",
  "--input-caret": "var(--admin-text)",
  "--input-placeholder": "color-mix(in srgb, var(--admin-muted) 85%, transparent)",
  "--input-shadow": "var(--documents-soft-shadow)",
  "--input-radius": "12px"
};

export const cardClassName =
  "relative isolate overflow-hidden rounded-[0.9rem] border border-[color:var(--glass-border-color,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-surface)_88%,var(--glass-surface-bg,transparent)_12%)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-[clamp(0.52rem,1.1vw,0.7rem)] shadow-[0_7px_16px_rgba(0,0,0,0.10)]";
export const cardBodyClassName = "relative z-[1] grid gap-1.1";
export const cardHeadClassName = "flex flex-wrap items-start justify-between gap-1.5";
export const cardSubClassName = "text-[0.9rem] leading-[1.45] text-[color:var(--admin-muted)] max-w-[58ch]";
export const cardActionsClassName = "flex flex-wrap items-center justify-start gap-2";
export const inputClassName = "rounded-[12px] text-[0.95rem]";
export const dropdownClassName = "w-full";
export const compactDropdownClassName = "w-full max-w-[14rem]";
export const formNoteClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
export const ingestGridClassName = "grid gap-1.1 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] items-start";
export const ingestMainGridClassName = "grid gap-1.5 [grid-template-columns:minmax(0,1fr)]";
export const ingestSupportStackClassName = "grid gap-1.5";
export const panelStackClassName =
  "flex flex-col gap-[0.45rem] rounded-[12px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-[10px] text-[color:var(--admin-text)]";
export const metaActionsClassName = "flex flex-wrap items-center justify-start gap-2";
export const labelClassName = "text-[0.95rem] font-semibold text-[color:var(--admin-text)]";
export const badgeBaseClassName = "inline-flex items-center rounded-full border px-2 py-[2px] text-[12px] font-semibold";
export const badgeYellowClassName =
  "border-[#f59e0b] bg-[color-mix(in_srgb,#f59e0b_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#f59e0b_78%,var(--admin-text)_22%)]";
export const badgeBlueClassName =
  "border-[#38bdf8] bg-[color-mix(in_srgb,#38bdf8_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#38bdf8_78%,var(--admin-text)_22%)]";
export const badgeGreenClassName =
  "border-[#22c55e] bg-[color-mix(in_srgb,#22c55e_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#22c55e_78%,var(--admin-text)_22%)]";
export const badgeRedClassName =
  "border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_18%,var(--admin-surface-3)_82%)] text-[color-mix(in_srgb,#ef4444_78%,var(--admin-text)_22%)]";
export const badgeGhostClassName =
  "border-transparent bg-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)] text-[color:var(--admin-accent)]";
export const toolbarPrimaryClassName =
  "grid [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] items-center gap-1 rounded-[12px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-1.25";
export const toolbarSecondaryClassName =
  "grid [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] items-center gap-1 rounded-[12px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_80%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-1.25";
export const metaCheckBaseClassName =
  "rounded-[10px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-2 text-[0.86rem] leading-[1.4]";
export const metaCheckOkClassName =
  "border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_12%,var(--admin-surface-3)_88%)]";
export const metaCheckWarnClassName =
  "border-[color:var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_12%,var(--admin-surface-3)_88%)]";
export const metaCheckErrorClassName =
  "border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_12%,var(--admin-surface-3)_88%)]";
export const alertBaseClassName = "rounded-[12px] border px-3 py-2";
export const alertOkClassName =
  "border-[color:var(--admin-success)] bg-[color-mix(in_srgb,var(--admin-success)_16%,var(--admin-surface-2)_84%)] text-[color:var(--admin-text)]";
export const alertErrorClassName =
  "border-[color:var(--admin-danger)] bg-[color-mix(in_srgb,var(--admin-danger)_16%,var(--admin-surface-2)_84%)] text-[color:var(--admin-text)]";
export const metaPanelClassName =
  "rounded-[16px] border border-[color:var(--admin-border-strong)] bg-[color-mix(in_srgb,var(--admin-surface-2)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-[14px] shadow-[var(--admin-shadow-soft)]";
export const metaPanelHeadClassName = "flex flex-wrap items-start justify-between gap-3";
export const metaPanelTitleClassName = "text-[0.95rem] font-[650] text-[color:var(--admin-text)]";
export const metaPanelNoteClassName = "text-[0.9rem] text-[color:var(--admin-muted)] max-w-[60ch]";
export const metaPanelLinkClassName =
  "inline-flex items-center gap-1.5 rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 text-[0.9rem] font-semibold text-[color:var(--admin-text)] no-underline hover:border-[color:var(--admin-accent-cool)]";
export const metaPanelGridClassName = "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";
export const metaPanelLabelClassName = "text-[0.76rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
export const metaPanelListClassName = "m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]";
export const metaTabsClassName = "mt-2 flex flex-wrap gap-2";
export const metaTabClassName =
  "rounded-full border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-1 text-[0.85rem] font-semibold text-[color:var(--admin-text)] transition-[border-color,background,transform] duration-150 ease-out hover:border-[color:var(--admin-accent)] hover:-translate-y-[1px]";
export const metaTabActiveClassName =
  "border-[color:var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]";
export const codeBlockClassName =
  "rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-3 py-2 text-[0.85rem] leading-[1.5] text-[color:var(--admin-text)] shadow-[var(--admin-shadow-soft)]";
export const hintClassName = "rounded-[14px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3";
export const hintTitleClassName = "text-[0.95rem] font-semibold text-[color:var(--admin-text)]";
export const hintBodyClassName = "text-[0.9rem] leading-[1.4] text-[color:var(--admin-muted)]";
export const articlesClassName =
  "grid gap-1.5 rounded-[14px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] p-3";
export const articlesHeadClassName = "flex flex-wrap items-start justify-between gap-3";
export const articlesTitleClassName = "text-[0.95rem] font-[650] text-[color:var(--admin-text)]";
export const articlesNoteClassName = "text-[0.9rem] text-[color:var(--admin-muted)] max-w-[60ch]";
export const articlesFormClassName = "grid gap-2";
export const articlesActionsClassName = "flex flex-wrap gap-2";
export const articlesResultClassName = "grid gap-2 text-[0.9rem] text-[color:var(--admin-muted)]";
export const articlesListClassName = "m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]";
export const filePickerClassName =
  "flex flex-wrap items-center gap-2 rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-3)] px-3 py-1.5 shadow-[var(--admin-shadow-soft)]";
export const filePickerNameClassName = "min-w-0 text-[0.92rem] text-[color:var(--admin-muted)]";
export const emptyFilterNoteClassName =
  "flex min-h-[2.9rem] items-center rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] px-3 py-2 text-[0.86rem] text-[color:var(--admin-muted)]";
export const tagsWrapClassName = "flex flex-wrap gap-1.5";
export const quickTagsClassName = "flex flex-wrap items-center gap-2";
export const quickTagsLabelClassName = "text-[0.88rem] text-[color:var(--admin-muted)]";
export const tagChipBaseClassName =
  "rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2.5 py-1 text-[0.84rem] font-semibold text-[color:var(--admin-text)] transition-[border-color,background,color,transform] duration-150 ease-out hover:border-[color:var(--admin-accent)] hover:-translate-y-[1px]";
export const tagChipActiveClassName =
  "border-[color:var(--admin-accent-cool)] bg-[color-mix(in_srgb,var(--admin-accent-cool)_18%,transparent)]";
export const docHeadClassName = "flex flex-wrap items-center justify-between gap-3";
export const docSummaryClassName = "flex flex-wrap items-center gap-2 text-[0.92rem] text-[color:var(--admin-muted)]";
export const docSummaryDotClassName = "text-[color:var(--admin-muted)]";
export const docSummarySelectedClassName = "font-semibold text-[color:var(--admin-accent)]";
export const docsClassName = "flex flex-col gap-1";
export const docCheckClassName = "inline-flex items-center gap-2 font-semibold text-[color:var(--admin-text)]";
export const docsLayoutClassName = "grid gap-2 [grid-template-columns:minmax(0,1fr)] items-start";
export const docsListClassName = "grid gap-1 max-h-[560px] overflow-auto pr-1";
export const docsEmptyClassName =
  "text-center rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-3 text-[color:var(--admin-muted)]";
export const docDetailWrapperClassName = "self-start";
export const docDetailEmptyClassName =
  "text-center rounded-[12px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface-2)] p-4 text-[color:var(--admin-muted)]";
export const docSelectClassName = "flex items-center";
export const docItemBaseClassName =
  "grid cursor-pointer items-center gap-2 rounded-[12px] border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-[8px_10px] [grid-template-columns:auto_1fr_auto] transition-[border-color,background,box-shadow] duration-150 ease-out hover:border-[color:var(--admin-border-strong)] hover:bg-[color-mix(in_srgb,var(--admin-surface-2)_70%,var(--admin-surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
export const docItemActiveClassName =
  "border-[color:var(--admin-accent)] shadow-[0_0_0_1px_var(--admin-accent-soft),var(--admin-shadow-soft)]";
export const docItemTitleClassName = "text-[color:var(--admin-text)] font-semibold leading-[1.2]";
export const docItemMainClassName = "grid gap-1";
export const docItemMetaClassName = "flex flex-wrap items-center gap-2 text-[0.82rem] text-[color:var(--admin-muted)]";
export const docItemMetaPillClassName =
  "rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-3)] px-2 py-0.5";
export const docItemTimeClassName = "text-[0.78rem] text-[color:var(--admin-muted)] text-right whitespace-nowrap";
export const docDetailClassName =
  "grid gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-3";
export const docDetailTopClassName = "flex flex-wrap items-start justify-between gap-3";
export const docDetailTitleClassName = "text-[1.1rem] font-bold text-[color:var(--admin-text)]";
export const docDetailDescClassName = "mt-1 text-[0.95rem] leading-[1.4] text-[color:var(--admin-muted)]";
export const docDetailStatusClassName = "flex flex-wrap items-center gap-2";
export const docDetailTimeClassName = "text-[0.82rem] text-[color:var(--admin-muted)]";
export const docDetailMetaClassName =
  "grid gap-3 border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] p-3 rounded-[12px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]";
export const docDetailMetaItemClassName = "grid gap-1";
export const docDetailMetaLabelClassName = "text-[0.7rem] uppercase tracking-[0.08em] text-[color:var(--admin-muted)]";
export const docDetailMetaValueClassName = "text-[0.92rem] text-[color:var(--admin-text)] break-words";
export const docDetailTagsClassName = "grid gap-2";
export const docDetailSourceClassName = "grid gap-2";
export const docDetailSourceTextClassName = "text-[0.9rem] text-[color:var(--admin-muted)] break-words";
export const docDetailActionsClassName = "flex flex-wrap gap-2";
export const ragModalHeadClassName = "flex flex-wrap items-start justify-between gap-3";
export const modalBodyClassName = "grid gap-3";
export const readOnlyFieldClassName =
  "rounded-[12px] border border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface-2)] px-3 py-[0.55rem] text-[0.95rem] text-[color:var(--admin-muted)]";
export const buttonBaseClassName =
  "!min-h-[2.02rem] !rounded-[0.82rem] !px-[0.86rem] !py-[0.34rem] !text-[0.92rem] font-semibold !leading-[1.1] tracking-[0.01em] " +
  "[--admin-button-primary-bg:color-mix(in_srgb,var(--admin-accent)_22%,var(--admin-surface-3)_78%)] " +
  "[--admin-button-primary-bg-hover:color-mix(in_srgb,var(--admin-accent)_32%,var(--admin-surface-3)_68%)] " +
  "[--admin-button-primary-bg-active:color-mix(in_srgb,var(--admin-accent)_18%,var(--admin-surface-3)_82%)] " +
  "[--admin-button-secondary-bg:color-mix(in_srgb,var(--admin-surface-2)_92%,var(--admin-accent)_8%)] " +
  "[--admin-button-secondary-bg-hover:color-mix(in_srgb,var(--admin-surface-2)_84%,var(--admin-accent)_16%)] " +
  "[--admin-button-ghost-bg:color-mix(in_srgb,var(--admin-surface-3)_54%,transparent)] " +
  "[--admin-button-ghost-bg-hover:color-mix(in_srgb,var(--admin-surface-2)_84%,var(--admin-accent)_16%)] " +
  "[--admin-button-disabled-bg:color-mix(in_srgb,var(--admin-surface-3)_92%,var(--admin-border)_8%)] " +
  "[--admin-button-disabled-text:color-mix(in_srgb,var(--admin-muted)_62%,var(--admin-text)_38%)] " +
  "[--admin-button-disabled-border:color-mix(in_srgb,var(--admin-border-strong)_82%,var(--admin-surface-3)_18%)] " +
  "shadow-[var(--admin-shadow-soft)]";
export const buttonCompactClassName = "!min-h-[1.9rem] !px-[0.72rem] !py-[0.3rem] !text-[0.86rem] !leading-[1.08]";
export const buttonTinyClassName = "!min-h-[1.52rem] !rounded-[0.62rem] !px-[0.48rem] !py-[0.15rem] !text-[0.72rem] !leading-[1.02]";
export const buttonPrimaryClassName =
  "![border:1px_solid_color-mix(in_srgb,var(--admin-accent)_66%,var(--admin-border)_34%)] ![background:var(--admin-button-primary-bg)] !text-[color:var(--admin-text)] " +
  "before:![background:var(--admin-button-primary-bg-hover)] hover:![border:1px_solid_var(--admin-accent)] hover:!shadow-[0_0_0_2px_var(--admin-accent-soft),var(--admin-shadow-soft)] " +
  "active:![background:var(--admin-button-primary-bg-active)] active:!shadow-[var(--admin-shadow-soft)] " +
  "disabled:!opacity-100 disabled:![border:1px_solid_var(--admin-button-disabled-border)] disabled:![background:var(--admin-button-disabled-bg)] disabled:!text-[color:var(--admin-button-disabled-text)] disabled:!shadow-none " +
  "aria-disabled:!opacity-100 aria-disabled:![border:1px_solid_var(--admin-button-disabled-border)] aria-disabled:![background:var(--admin-button-disabled-bg)] aria-disabled:!text-[color:var(--admin-button-disabled-text)] aria-disabled:!shadow-none";
export const buttonGhostClassName =
  "![border:1px_solid_var(--admin-border-strong)] ![background:var(--admin-button-ghost-bg)] !text-[color:var(--admin-text)] !shadow-none before:!opacity-0 " +
  "hover:![background:var(--admin-button-ghost-bg-hover)] hover:![border:1px_solid_color-mix(in_srgb,var(--admin-accent)_44%,var(--admin-border-strong)_56%)] " +
  "disabled:!opacity-100 disabled:![border:1px_solid_var(--admin-button-disabled-border)] disabled:![background:var(--admin-button-disabled-bg)] disabled:!text-[color:var(--admin-button-disabled-text)] " +
  "aria-disabled:!opacity-100 aria-disabled:![border:1px_solid_var(--admin-button-disabled-border)] aria-disabled:![background:var(--admin-button-disabled-bg)] aria-disabled:!text-[color:var(--admin-button-disabled-text)]";
export const buttonDangerClassName =
  "![border:1px_solid_color-mix(in_srgb,var(--admin-danger)_48%,var(--admin-border)_52%)] ![background:color-mix(in_srgb,var(--admin-danger)_14%,var(--admin-surface-3)_86%)] !text-[color:var(--admin-danger)] !shadow-none before:!opacity-0 hover:![background:color-mix(in_srgb,var(--admin-danger)_22%,var(--admin-surface-3)_78%)]";
export const buttonSecondaryClassName =
  "![border:1px_solid_var(--admin-border-strong)] ![background:var(--admin-button-secondary-bg)] !text-[color:var(--admin-text)] !shadow-none before:!opacity-0 " +
  "hover:![background:var(--admin-button-secondary-bg-hover)] hover:![border:1px_solid_color-mix(in_srgb,var(--admin-accent)_38%,var(--admin-border-strong)_62%)] " +
  "disabled:!opacity-100 disabled:![border:1px_solid_var(--admin-button-disabled-border)] disabled:![background:var(--admin-button-disabled-bg)] disabled:!text-[color:var(--admin-button-disabled-text)] " +
  "aria-disabled:!opacity-100 aria-disabled:![border:1px_solid_var(--admin-button-disabled-border)] aria-disabled:![background:var(--admin-button-disabled-bg)] aria-disabled:!text-[color:var(--admin-button-disabled-text)]";
export const buttonRefreshClassName =
  "invite-primary-btn !min-h-[2.24rem] !rounded-[1.12rem] !border !px-[0.88rem] !py-[0.36rem] !text-[0.88rem] !leading-[1.08] !tracking-[0.012rem] " +
  "!transform-none hover:!transform-none focus-visible:!transform-none active:!transform-none disabled:!transform-none aria-disabled:!transform-none " +
  "max-[768px]:!min-h-[2.34rem] max-[768px]:!rounded-[1.08rem] max-[768px]:!text-[0.9rem]";

export const STATUS_CLASSES = {
  PENDING: `${badgeBaseClassName} ${badgeYellowClassName}`,
  PROCESSING: `${badgeBaseClassName} ${badgeBlueClassName}`,
  COMPLETED: `${badgeBaseClassName} ${badgeGreenClassName}`,
  FAILED: `${badgeBaseClassName} ${badgeRedClassName}`
};

export const AUDIENCE_LABEL_KEYS = {
  SOCIAL_WORKER: "admin.rag.audience.social_worker",
  CLIENT: "admin.rag.audience.client",
  BOTH: "admin.rag.audience.both"
};

export const AUDIENCE_VALUES = ["SOCIAL_WORKER", "CLIENT", "BOTH"];
export const DEFAULT_POLL_MS = 15000;
export const POLL_MS = Number(process.env.NEXT_PUBLIC_RAG_POLL_MS || DEFAULT_POLL_MS);
export const PAGE_SIZE = 25;
export const DOCS_FETCH_LIMIT = 100;
export const MAX_DOCS_FETCH_PAGES = 50;

export const META_TEMPLATES = [
  { key: "base", labelKey: "admin.rag.meta.templates.base", file: "/rag-meta-templates/base.json" },
  { key: "periodical", labelKey: "admin.rag.meta.templates.periodical", file: "/rag-meta-templates/periodical.json" },
  { key: "regulation", labelKey: "admin.rag.meta.templates.regulation", file: "/rag-meta-templates/regulation.json" },
  { key: "report", labelKey: "admin.rag.meta.templates.report", file: "/rag-meta-templates/report.json" },
  { key: "web", labelKey: "admin.rag.meta.templates.web", file: "/rag-meta-templates/web.json" }
];

const META_REQUIRED_FIELDS = [
  { label: "docId", keys: ["docId", "doc_id"] },
  { label: "title", keys: ["title"] },
  { label: "section", keys: ["section"] },
  { label: "year", keys: ["year"] },
  { label: "audience", keys: ["audience"] },
  { label: "tags", keys: ["tags", "tags_list"] }
];

const META_RECOMMENDED_FIELDS = [
  { label: "description", keys: ["description"] },
  { label: "authors", keys: ["authors", "authors_list"] },
  { label: "issueLabel/issueId", keys: ["issueLabel", "issue_label", "issueId", "issue_id"] },
  { label: "articleId", keys: ["articleId", "article_id"] },
  { label: "pageRange", keys: ["pageRange"] },
  { label: "pdf_start_page/pdf_end_page", keys: ["pdf_start_page", "pdf_end_page", "pdfStartPage", "pdfEndPage"] },
  { label: "journalTitle", keys: ["journalTitle", "journal_title"] },
  { label: "language", keys: ["language"] },
  { label: "source_type", keys: ["source_type", "sourceType"] },
  { label: "source_url", keys: ["source_url", "sourceUrl", "url"] },
  { label: "collection_id", keys: ["collection_id", "collectionId"] },
  { label: "country", keys: ["country"] },
  { label: "jurisdiction_level", keys: ["jurisdiction_level", "jurisdictionLevel"] },
  { label: "municipality_name", keys: ["municipality_name", "municipalityName"] },
  { label: "district_name", keys: ["district_name", "districtName"] }
];

const hasMetaValue = (meta, keys = []) =>
  keys.some(key => {
    const value = meta?.[key];
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "number") return Number.isFinite(value);
    return String(value).trim().length > 0;
  });

export const validateMeta = meta => {
  const missingRequired = META_REQUIRED_FIELDS.filter(field => !hasMetaValue(meta, field.keys)).map(field => field.label);
  const missingRecommended = META_RECOMMENDED_FIELDS.filter(field => !hasMetaValue(meta, field.keys)).map(field => field.label);

  return {
    missingRequired,
    missingRecommended
  };
};

export function formatI18n(template, values) {
  if (typeof template !== "string") return "";
  if (!values || typeof values !== "object") return template;

  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }

  return out;
}

export function toLocaleTag(locale) {
  const normalized = String(locale || "en").toLowerCase();
  if (normalized.startsWith("et")) return "et-EE";
  if (normalized.startsWith("ru")) return "ru-RU";
  return "en-US";
}

export const formatDateTime = (value, localeTag = "en-US") => {
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

export const deriveStatus = doc => (doc && doc.status ? doc.status : "COMPLETED");
export const deriveSyncedAt = doc => doc?.insertedAt || doc?.lastIngested || doc?.updatedAt || doc?.createdAt || null;
export const deriveDocType = doc => normalizeUpper(doc?.type || doc?.source_type || "");

export const formatPdfRange = doc => {
  const start = doc?.pdf_start_page;
  const end = doc?.pdf_end_page;
  if (!start && !end) return "";
  if (start && end) return `${start}-${end}`;
  return String(start || end);
};

export const splitAuthors = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean).slice(0, 12);
  return String(value)
    .split(/[,;\n]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 12);
};

export const splitTags = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean).slice(0, 24);
  return String(value)
    .split(/[,;\n]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 24);
};

const normalizeAuthorsForDisplay = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return splitAuthors(value);
};

const normalizeTags = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return splitTags(value);
};

const normalizeString = value => (value == null ? "" : String(value).trim());
const normalizeUpper = value => normalizeString(value).toUpperCase();

export const createEmptyDetailForm = () => ({
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

export const buildDetailFormFromDoc = doc => ({
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

export const normalizeDoc = item => {
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
